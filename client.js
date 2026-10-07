/* Completion sound for DSH 0.2.1 SessionSnapshot lifecycle. */
window.__ModuleLoader__.load({
  id: 'dsh-plugin-laile-laodi',
  factory(require) {
    const React = require('react');

    const h = React.createElement;
    const voices = [["chosen-3", "3号·逗趣男声"], ["deep-male", "低沉男声"], ["clear-male", "清亮男声"], ["raspy-uncle", "沙哑大叔"], ["gentle-female", "温柔女声"], ["lively-female", "活泼女声"], ["cartoon", "卡通高音"], ["robot", "电子机器人"]];
    function LaileLaodi(props) {
      const snap = props.useSession ? props.useSession(s => s) : props.session;
      const previous = React.useRef(null);
      const audioRef = React.useRef(null);
      const [status, setStatus] = React.useState('');
      const [voice, setVoice] = React.useState(() => {
        try { const saved = localStorage.getItem('laile-laodi.voice');
          if (voices.some(v => v[0] === saved)) return saved; } catch (_) {}
        return 'chosen-3';
      });
      const play = React.useCallback(() => {
        const el = audioRef.current;
        if (!el) return;
        el.muted = false;
        el.volume = 1;
        el.currentTime = 0;
        try {
          Promise.resolve(el.play()).then(() => {
            setStatus('提示音已播放');
          }).catch(error => {
            console.warn('[laile-laodi] playback failed', error);
            setStatus(error.name === 'NotAllowedError'
              ? '请点“测试提示音”启用声音' : '播放失败：' + error.message);
          });
        } catch (error) {
          setStatus('播放失败：' + error.message);
        }
      }, []);
      React.useEffect(() => {
        if (!snap) return;
        const old = previous.current;
        previous.current = { sessionId: snap.sessionId, running: snap.running };
        if (snap.running && (!old || !old.running || old.sessionId !== snap.sessionId))
          setStatus('等待回复完成');
        // SessionSnapshot is lifecycle-only in DSH 0.2.1; it has no turnEnds/nodes.
        // Seed on mount/session switch, then play once on the running -> idle edge.
        if (old && old.sessionId === snap.sessionId && old.running && !snap.running) {
          if (!snap.lastAgentError && !snap.promptError && !snap.removed) play();
          else setStatus('本轮未正常完成，不播放提示音');
        }
      }, [snap, play]);
      return h('div', { 'aria-label': '提示音控制', style: { position: 'fixed', right: 12, bottom: 4, zIndex: 50, display: 'flex', gap: 6, alignItems: 'center', height: 28, boxSizing: 'border-box', padding: '2px 6px', maxWidth: 'calc(100vw - 24px)', fontSize: 11, color: 'inherit', background: 'var(--dsh-color-surface, #252525)', border: '1px solid rgba(127,127,127,.25)', borderRadius: 7, boxShadow: '0 2px 8px rgba(0,0,0,.15)' } },
        h('audio', { ref: audioRef, src: '/laile-laodi.mp3?voice=' + voice + '&v=voicepack-20261007', preload: 'auto',
          onError: () => setStatus('提示音加载失败'), style: { display: 'none' } }),
        h('select', { 'aria-label': '提示音音色', style: { maxWidth: 130, color: 'inherit', background: 'transparent', border: 0, font: 'inherit', height: 22 }, value: voice, onChange: event => {
          const next = event.target.value; setVoice(next); setStatus('');
          try { localStorage.setItem('laile-laodi.voice', next); } catch (_) {}
        } }, voices.map(v => h('option', { key: v[0], value: v[0] }, v[1]))),
        h('button', { type: 'button', style: { height: 22, padding: '2px 6px', border: 0, borderRadius: 4, color: 'inherit', background: 'rgba(127,127,127,.2)', font: 'inherit', whiteSpace: 'nowrap', cursor: 'pointer' }, onClick: play, title: '播放“来了，老弟”并启用回复完成提示音' }, '测试提示音'),
        h('span', { role: 'status', 'aria-live': 'polite', title: status, style: { maxWidth: 108, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, status));
    }
    return {
      inject: ['slots'],
      apply(ctx) {
        const slots = ctx.get('slots');
        slots.inject('conversation.input.dock', () => slots.register(
          { name: 'conversation.input.dock', id: 'laile-laodi', order: 100 }, LaileLaodi));
      },
    };

  },
});
