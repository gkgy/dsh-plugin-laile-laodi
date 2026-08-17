# dsh-plugin-laile-didi · 来了老弟

> **DSH 插件**：每次助手回复**结束**时播放「来了，老弟」完成提示音 —— 先显示文本，回复完毕再响一声。
> A [DeepSeek Harness](https://github.com/deepseek-ai/dsh) (DSH) plugin that plays a greeting sound when **every assistant reply finishes** — text first, sound last.

[![Topic](https://img.shields.io/badge/topic-dsh--plugin-blue)](https://github.com/topics/dsh-plugin)

## ✨ 功能 / Features

- 每条助手回复**结束时**自动播放「来了，老弟」——作为「这条回复已完成」的提示音
- **先音频后文本 / 先文本后音频，由你决定**：本仓库默认是「回复结束播报」；如需「回复开始就播」，见 `dynamic/client.js` 注释
- 一轮回复只响一次，不重复；挂载时不为历史回复发声
- 隐藏实现：音频元素 `display:none`，不占用任何界面空间

## 🚀 安装 / Install

### 方式 A：动态插件（推荐，无需重启）— Dynamic plugin (cordis_define)

在 DSH 对话里让模型执行 `cordis_define`：

- `code.host`：填入 [`dynamic/host.js`](dynamic/host.js) 的内容（先修改顶部 `candidates` 里的音频路径）
- `code.client`：填入 [`dynamic/client.js`](dynamic/client.js) 的内容
- 然后 `cordis_run` 激活，在界面批准即可

### 方式 B：静态宿主插件（挂进 profile）— Static host plugin

1. 把本仓库目录放进 DSH profile（如 `~/.dsh/profiles/web/`）
2. 在 `cordis.yml`（或 `cordis.patch.yml`）追加：

```yaml
- id: laile-didi
  name: ./dsh-plugin-laile-didi/index.mjs
  inject: [webServer]
  config:
    audioPath: ./dsh-plugin-laile-didi/assets/laile-didi.mp3
    route: /laile-didi.mp3
```

3. 客户端半部仍按方式 A 的 `code.client` 加载（回复结束触发播放）

## ⚙️ 配置 / Configuration

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `audioPath` | `assets/laile-didi.mp3`（包内自带） | 提示音文件路径，可换成你自己的音频 |
| `route` | `/laile-didi.mp3` | 音频 HTTP 路由，客户端 `<audio src>` 必须与此一致 |

## 🎵 换音频 / Change the sound

把新的音频文件命名为 `laile-didi.mp3` 覆盖 `assets/` 里的文件（或修改 `audioPath`），重启插件即可。

## 🛡️ 音频来源 / Audio source

自带提示音来自站长素材 `ttsc.chinaz.com`（免费资源），可自由替换为你自己的录音。

## 📜 License

MIT — 代码部分。自带音频为第三方免费资源，商用请自行确认授权。
