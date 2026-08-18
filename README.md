# dsh-plugin-laile-laodi · 来了老弟 (Here Comes, Bro!)

> **中文**：一个 [DeepSeek Harness](https://github.com/deepseek-ai/dsh)（DSH）插件：每次助手回复**结束**时播放「来了，老弟」完成提示音 —— 先显示文本，回复完毕再响一声。
> **English**: A [DeepSeek Harness](https://github.com/deepseek-ai/dsh) (DSH) plugin that plays the "来了，老弟 / Here comes, bro!" greeting sound when **every assistant reply finishes** — text first, sound last.

[![Topic](https://img.shields.io/badge/topic-dsh--plugin-blue)](https://github.com/topics/dsh-plugin)

---

## ✨ Features / 功能

**English**

- Plays the greeting sound automatically the moment **each assistant reply finishes** — a natural "this reply is done" cue.
- **Audio-first or text-first — your choice**: this repo defaults to "play at reply end"; to play as soon as a reply starts, see the comments in `dynamic/client.js`.
- Plays exactly once per reply; historical replies are silent on mount.
- Hidden implementation: the audio element is `display:none`, so it takes up no UI space.

**中文**

- 每条助手回复**结束时**自动播放「来了，老弟」——作为「这条回复已完成」的提示音。
- **先音频后文本 / 先文本后音频，由你决定**：本仓库默认是「回复结束播报」；如需「回复开始就播」，见 `dynamic/client.js` 注释。
- 一轮回复只响一次，不重复；挂载时不为历史回复发声。
- 隐藏实现：音频元素 `display:none`，不占用任何界面空间。

---

## 🚀 Install / 安装

### Option A：动态插件（推荐，无需重启）— Dynamic plugin (`cordis_define`)

**English**: Ask the model in a DSH conversation to run `cordis_define`:

- `code.host`: paste the contents of [`dynamic/host.js`](dynamic/host.js) (edit the `candidates` audio paths at the top first)
- `code.client`: paste the contents of [`dynamic/client.js`](dynamic/client.js)
- Then run `cordis_run` to activate and approve it in the UI.

**中文**：在 DSH 对话里让模型执行 `cordis_define`：

- `code.host`：填入 [`dynamic/host.js`](dynamic/host.js) 的内容（先修改顶部 `candidates` 里的音频路径）
- `code.client`：填入 [`dynamic/client.js`](dynamic/client.js) 的内容
- 然后 `cordis_run` 激活，在界面批准即可

### Option B：静态宿主插件（挂进 profile）— Static host plugin

**English**:

1. Put this repository folder into a DSH profile (e.g. `~/.dsh/profiles/web/`).
2. Append to `cordis.yml` (or `cordis.patch.yml`):

```yaml
- id: laile-laodi
  name: ./dsh-plugin-laile-laodi/index.mjs
  inject: [webServer]
  config:
    audioPath: ./dsh-plugin-laile-laodi/assets/laile-laodi.mp3
    route: /laile-laodi.mp3
```

3. Load the client half as in Option A's `code.client` (plays when a reply finishes).

**中文**：

1. 把本仓库目录放进 DSH profile（如 `~/.dsh/profiles/web/`）。
2. 在 `cordis.yml`（或 `cordis.patch.yml`）追加：

```yaml
- id: laile-laodi
  name: ./dsh-plugin-laile-laodi/index.mjs
  inject: [webServer]
  config:
    audioPath: ./dsh-plugin-laile-laodi/assets/laile-laodi.mp3
    route: /laile-laodi.mp3
```

3. 客户端半部仍按方式 A 的 `code.client` 加载（回复结束触发播放）。

> ⚠️ **注意 / Note**：方式 B（静态宿主）与方式 A（动态宿主）**不要同时用 / do not use both**——两者都会注册同一个路由 `/laile-laodi.mp3`，会冲突。推荐组合 / Recommended combo:
> - 静态宿主（方式 B，重启后音频路由自动恢复）**+ 客户端动态加载**（只用 `code.client`，不带 `code.host`）— Static host (Option B) + client loaded dynamically (only `code.client`, no `code.host`)
> - 或纯动态（方式 A，重启后整体重新加载一次）— Or fully dynamic (Option A)

---

## ⚙️ Configuration / 配置

| 参数 / Parameter | 默认值 / Default | 说明 / Description |
| --- | --- | --- |
| `audioPath` | `assets/laile-laodi.mp3`（包内自带 / bundled） | 提示音文件路径，可换成你自己的音频 / Path to the sound file; replace with your own audio |
| `route` | `/laile-laodi.mp3` | 音频 HTTP 路由，客户端 `<audio src>` 必须与此一致 / Audio HTTP route; the client `<audio src>` must match |

---

## 🎵 Change the sound / 换音频

**English**: Rename your new audio file to `laile-laodi.mp3` and overwrite the file in `assets/` (or change `audioPath`), then restart the plugin.

**中文**：把新的音频文件命名为 `laile-laodi.mp3` 覆盖 `assets/` 里的文件（或修改 `audioPath`），重启插件即可。

---

## 🛡️ Audio source / 音频来源

**English**: The bundled sound comes from the free resource site `ttsc.chinaz.com` (站长素材); feel free to replace it with your own recording.

**中文**：自带提示音来自站长素材 `ttsc.chinaz.com`（免费资源），可自由替换为你自己的录音。

---

## 📜 License

MIT — for the code. The bundled audio is a third-party free resource; verify licensing yourself if used commercially.

MIT — 代码部分。自带音频为第三方免费资源，商用请自行确认授权。
