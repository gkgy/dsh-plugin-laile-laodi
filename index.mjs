/** Completion audio host. See README for Bundle installation and audio provenance. */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const name = 'laile-laodi'
export const inject = ['webServer']

const DEFAULT_ROUTE = '/laile-laodi.mp3'

export function apply(ctx, config = {}) {
  const cfg = config ?? ctx.config ?? {}
  const audioPath = cfg.audioPath ?? path.join(__dirname, 'assets', 'laile-laodi.mp3')
  const route = cfg.route ?? DEFAULT_ROUTE

  let bytes
  try {
    bytes = readFileSync(audioPath)
  } catch (e) {
    console.error(`[laile-laodi] 无法读取音频文件: ${audioPath}`, (e && e.message) || e)
    return
  }
  if (!bytes || bytes.length === 0) {
    console.error(`[laile-laodi] 音频文件为空: ${audioPath}`)
    return
  }

  const webServer = ctx.get('webServer')
  if (webServer === undefined) return

  const dispose = webServer.register({
    kind: 'exact',
    path: route,
    handler: (req, res) => {
      const voice = new URL(req.url ?? '/', 'http://localhost').searchParams.get('voice');
      const allowed = ["chosen-3", "deep-male", "clear-male", "raspy-uncle", "gentle-female", "lively-female", "cartoon", "robot"];
      const selectedPath = allowed.includes(voice)
        ? path.join(__dirname, 'assets', voice + '.mp3') : audioPath;
      let selected;
      try { selected = readFileSync(selectedPath); } catch (_) {
        res.writeHead(503); res.end('Notification audio unavailable'); return;
      }
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': selected.length,
        'Cache-Control': 'no-cache',
      })
      res.end(selected)
    },
  })
  ctx.effect(() => dispose)
  console.log(`[laile-laodi] 音频路由就绪: ${route} (${bytes.length} bytes, ${audioPath})`)
}

export default { name, inject, apply }
