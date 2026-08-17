// dsh-plugin-laile-didi —— 动态插件 Host 代码体
// 用途:在 DSH 里通过 cordis_define 以“动态插件”方式加载。
// 把本文件内容原样填入 cordis_define 的 code.host 字段(它是一个函数体,以 return { 开头)。
//
// 说明:沙箱内不能用 import,音频通过 ctx.get('fs') 读取;
// 把候选路径列表改成你机器上 assets/laile-didi.mp3 的实际位置即可。
return {
  async apply(ctx) {
    const fs = ctx.get('fs')
    const webServer = ctx.get('webServer')
    if (fs === undefined || webServer === undefined) {
      console.error('[laile-didi] fs/webServer 不可用，插件不生效')
      return
    }
    // 音频候选路径(依次尝试,读到第一个存在的文件)
    const candidates = [
      'D:\\Deepseek harrness others\\deep1\\assets\\laile-didi.mp3',
      'C:\\Users\\Administrator\\Downloads\\来了老弟.mp3',
    ]
    let bytes = null
    let usedPath = null
    for (const p of candidates) {
      try {
        const target = await fs.resolve(p)
        const data = await fs.readBytes(target, undefined, 4 * 1024 * 1024)
        if (data && data.length > 0) {
          bytes = data
          usedPath = p
          break
        }
      } catch (e) {
        console.error('[laile-didi] 读取失败:', p, String((e && e.message) || e))
      }
    }
    if (!bytes) {
      console.error('[laile-didi] 未找到音频文件，插件不生效。请修改 candidates 路径')
      return
    }
    const ROUTE = '/laile-didi.mp3'
    let hits = 0
    const disposeRoute = webServer.register({
      kind: 'exact',
      path: ROUTE,
      handler: (req, res) => {
        hits += 1
        res.writeHead(200, {
          'Content-Type': 'audio/mpeg',
          'Content-Length': bytes.length,
          'Cache-Control': 'no-cache',
        })
        res.end(bytes)
      },
    })
    ctx.effect(() => disposeRoute)
    const disposeHandle = harness.handle('laile/audio-info', () => ({
      src: ROUTE,
      size: bytes.length,
      hits,
      file: usedPath,
    }))
    ctx.effect(() => disposeHandle)
    console.log('[laile-didi] 音频路由就绪:', ROUTE, 'bytes:', bytes.length, 'from:', usedPath)
  },
}
