const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets/generated-manifest.json')));

function clientHarness(dynamic = false) {
  let component, plugin, cursor = 0, effects = [], cells = [], plays = 0;
  const audio = { play() { plays++; return Promise.resolve(); } };
  const React = {
    createElement(type, props, ...children) {
      if (type === 'audio') props.ref.current = audio;
      return { type, props, children };
    },
    useRef(init) { const n = cursor++; return cells[n] ??= { current: init }; },
    useState(init) { const n = cursor++; if (!(n in cells)) cells[n] = typeof init === 'function' ? init() : init; return [cells[n], value => cells[n] = value]; },
    useCallback(fn) { cursor++; return fn; },
    useEffect(fn) { cursor++; effects.push(fn); },
  };
  const context = { React, console, Promise, localStorage: { getItem: () => null, setItem: () => {} } };
  if (dynamic) plugin = vm.runInNewContext('(function(React){' + fs.readFileSync(path.join(root, 'dynamic/client.js'), 'utf8') + '\n})', context)(React);
  else {
    context.window = { __ModuleLoader__: { load: spec => plugin = spec.factory(() => React) } };
    vm.runInNewContext(fs.readFileSync(path.join(root, 'client.js'), 'utf8'), context);
  }
  const slots = { inject: (_, fn) => fn(), register: (_, c) => { component = c; } };
  plugin.apply({ get: () => slots });
  return {
    render(id, running, extra = {}) {
      cursor = 0; effects = [];
      const tree = component({ useSession: selector => selector({ sessionId: id, running, ...extra }) });
      effects.forEach(fn => fn());
      return tree;
    },
    get plays() { return plays; },
  };
}

for (const dynamic of [false, true]) {
  test((dynamic ? 'dynamic' : 'static') + ' client: completion edges and silent history/errors', () => {
    const c = clientHarness(dynamic);
    const tree = c.render('a', false);
    assert.equal(tree.props.style.position, 'fixed');
    assert.equal(tree.props.style.right, 12);
    assert.equal(c.plays, 0);
    c.render('a', true); c.render('a', false);
    assert.equal(c.plays, 1, 'first completed reply plays');
    c.render('a', false); assert.equal(c.plays, 1, 'no duplicate');
    c.render('a', true); c.render('b', false);
    assert.equal(c.plays, 1, 'session switch is silent');
    c.render('b', true); c.render('b', false, { lastAgentError: 'transport' });
    assert.equal(c.plays, 1, 'failed request is silent');
    c.render('b', true); c.render('b', false);
    assert.equal(c.plays, 2);
    const el = tree.children.find(child => child && child.type === 'audio');
    assert.match(el.props.src, /voice=chosen-3/);
  });
}

function response() {
  return { status: null, body: null, writeHead(status) { this.status = status; }, end(body) { this.body = body; } };
}

test('static host: eight generated files and default route', async () => {
  const { apply } = await import(pathToFileURL(path.join(root, 'index.mjs')).href);
  let route;
  apply({ get: () => ({ register(r) { route = r; return () => {}; } }), effect() {} }, {});
  for (const voice of manifest) {
    const res = response(); route.handler({ url: '/laile-laodi.mp3?voice=' + voice.id }, res);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, fs.readFileSync(path.join(root, voice.file)));
    assert.equal(crypto.createHash('sha256').update(res.body).digest('hex'), voice.installed_sha256);
  }
  for (const query of ['', '?voice=../../LICENSE', '?voice=unknown']) {
    const res = response(); route.handler({ url: '/laile-laodi.mp3' + query }, res);
    assert.deepEqual(res.body, fs.readFileSync(path.join(root, 'assets/chosen-3.mp3')));
  }
});

test('dynamic host: configured directory serves every voice', async () => {
  const body = fs.readFileSync(path.join(root, 'dynamic/host.js'), 'utf8');
  const plugin = new Function('URL', body)(URL);
  let route;
  const fsService = {
    async resolve(value) { return path.join(root, 'assets', path.basename(value)); },
    async readBytes(value) { return fs.readFileSync(value); },
  };
  await plugin.apply({ get: name => name === 'fs' ? fsService : { register(r) { route = r; return () => {}; } }, effect() {} });
  for (const voice of manifest) {
    const res = response(); route.handler({ url: '/laile-laodi.mp3?voice=' + voice.id }, res);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, fs.readFileSync(path.join(root, voice.file)));
  }
});
