// cordis_define code.host function body. Set the assets directory before use.
// Do not activate this host together with the static Bundle host.
const ASSET_DIR = './dsh-plugin-laile-laodi/assets'
return {
  async apply(ctx) {
    const fs = ctx.get('fs')
    const webServer = ctx.get('webServer')
    if (!fs || !webServer) throw new Error('laile-laodi: fs/webServer unavailable')
    const voices = ['chosen-3', 'deep-male', 'clear-male', 'raspy-uncle', 'gentle-female', 'lively-female', 'cartoon', 'robot']
    const sounds = new Map()
    for (const voice of voices) {
      const target = await fs.resolve(ASSET_DIR.replace(/[\\/]$/, '') + '/' + voice + '.mp3')
      const bytes = await fs.readBytes(target, undefined, 4 * 1024 * 1024)
      if (!bytes || !bytes.length) throw new Error('laile-laodi: missing sound ' + voice)
      sounds.set(voice, bytes)
    }
    const dispose = webServer.register({
      kind: 'exact', path: '/laile-laodi.mp3',
      handler(req, res) {
        const voice = new URL(req.url ?? '/', 'http://localhost').searchParams.get('voice')
        const bytes = sounds.get(voice) ?? sounds.get('chosen-3')
        res.writeHead(200, {
          'Content-Type': 'audio/mpeg', 'Content-Length': bytes.length,
          'Cache-Control': 'no-cache',
        })
        res.end(bytes)
      },
    })
    ctx.effect(() => dispose)
  },
}
