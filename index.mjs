/**
 * dsh-plugin-laile-didi — DeepSeek Harness (DSH) 宿主端插件
 *
 * 作用:把提示音通过 webServer 暴露为一个 HTTP 路由(默认 /laile-didi.mp3)。
 * 浏览器客户端(见 dynamic/client.js)在每次助手回复结束时请求并播放它,
 * 从而做到“先显示文本,回复完毕再响一声‘来了,老弟’”。
 *
 * 安装(静态方式,与 obsidian-sync 等插件一致):
 *   1. 把本包放进 DSH profile 目录(或任意可被加载的位置);
 *   2. 在 cordis.yml 追加一行:
 *        - id: laile-didi
 *          name: ./dsh-plugin-laile-didi/index.mjs
 *          inject: [webServer]
 *          config:
 *            audioPath: ./dsh-plugin-laile-didi/assets/laile-didi.mp3
 *            route: /laile-didi.mp3
 *   3. 重启 DSH,再按 dynamic/client.js 的方式加载客户端半部。
 *
 * 也可用 cordis_define 动态加载(见 dynamic/ 目录)。
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const name = 'laile-didi'
export const inject = ['webServer']

const DEFAULT_ROUTE = '/laile-didi.mp3'

export function apply(ctx, config = {}) {
  const cfg = config ?? ctx.config ?? {}
  const audioPath = cfg.audioPath ?? path.join(__dirname, 'assets', 'laile-didi.mp3')
  const route = cfg.route ?? DEFAULT_ROUTE

  let bytes
  try {
    bytes = readFileSync(audioPath)
  } catch (e) {
    console.error(`[laile-didi] 无法读取音频文件: ${audioPath}`, (e && e.message) || e)
    return
  }
  if (!bytes || bytes.length === 0) {
    console.error(`[laile-didi] 音频文件为空: ${audioPath}`)
    return
  }

  const webServer = ctx.get('webServer')
  if (webServer === undefined) return

  const dispose = webServer.register({
    kind: 'exact',
    path: route,
    handler: (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': bytes.length,
        'Cache-Control': 'no-cache',
      })
      res.end(bytes)
    },
  })
  ctx.effect(() => dispose)
  console.log(`[laile-didi] 音频路由就绪: ${route} (${bytes.length} bytes, ${audioPath})`)
}

export default { name, inject, apply }
