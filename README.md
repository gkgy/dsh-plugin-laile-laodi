# 来了老弟 · DeepSeek Harness 完成提示音

助手回复结束后播放“来了，老弟”。支持八种音色，右下角切换与试听，选择会自动保存。

## v1.1.0 更新

- 修复 DSH 0.2.1 会话快照接口变化后不触发声音的问题：使用 `running → idle` 状态变化，不再读取已移除的 `turnEnds` / `nodes`。
- 不为历史回复、会话切换或失败请求播放完成提示音。
- 右下角提供音色选择和“测试提示音”，播放失败时显示原因。
- 默认使用试听中选定的 **3 号·逗趣男声**，保持该样本原样；提供另外七种音色。
- 用本地生成音频替换此前捆绑的真人录音。音频来源、生成参数和哈希见 [生成记录](AUDIO_PROVENANCE.md)。

## 音色

| 音色 | 类型 |
| --- | --- |
| 3号·逗趣男声（默认） | Qwen3-TTS VoiceDesign |
| 低沉男声 | Qwen3-TTS VoiceDesign |
| 清亮男声 | Qwen3-TTS VoiceDesign |
| 沙哑大叔 | Qwen3-TTS VoiceDesign |
| 温柔女声 | Qwen3-TTS VoiceDesign |
| 活泼女声 | Qwen3-TTS VoiceDesign |
| 卡通高音 | 3号样本变调 |
| 电子机器人 | 3号样本调制和短回声 |

所有台词均为“来了，老弟”。这些音色是预先生成的文件，播放时无需加载语音模型，也无需外部语音 API。

## 安装：静态 Bundle（推荐）

先克隆本仓库到固定位置：

```sh
git clone https://github.com/gkgy/dsh-plugin-laile-laodi.git
```

在 DSH 桌面 profile 的 `package.json` 中，把本包加入 `dependencies` 和 `dsh.profile.bundles`。合并以下字段，保留已有插件和配置；将示例路径替换为克隆目录的绝对路径：

```json
{
  "dependencies": {
    "dsh-plugin-laile-laodi": "link:/absolute/path/dsh-plugin-laile-laodi"
  },
  "dsh": {
    "profile": {
      "bundles": ["dsh-plugin-laile-laodi"]
    }
  }
}
```

在该 profile 目录使用其包管理器安装依赖（如 `pnpm install`），然后重启 Harness。桌面 profile 通常位于 `~/.dsh/profiles/desktop`。

本包同时声明宿主和客户端入口，Bundle 会自动加载二者。不要再重复添加动态宿主，否则音频路由会冲突。

安装后，在 **Harness 窗口右下角** 选择音色，点击 **测试提示音**。用户手势可以启用浏览器声音播放。之后正常回复结束时自动播放所选声音。

## 动态加载（高级方式）

也可将 [dynamic/host.js](dynamic/host.js) 和 [dynamic/client.js](dynamic/client.js) 分别填入 `cordis_define` 的 `code.host`、`code.client`，再使用 `cordis_run` 激活。先修改宿主代码顶部的 `ASSET_DIR`，指向本仓库的 `assets` 目录。

动态代码使用与静态 Bundle 相同的音色和界面。不要同时启用两个宿主。动态加载的权限与生命周期由 Harness 管理；静态 Bundle 更适合重启后持续使用。

## 配置

| 宿主配置 | 默认值 | 说明 |
| --- | --- | --- |
| `audioPath` | 包内 `assets/laile-laodi.mp3` | 无音色参数时使用的默认文件 |
| `route` | `/laile-laodi.mp3` | 音频路由；修改时也需修改客户端 URL |

客户端通过 `?voice=chosen-3` 等参数选择捆绑音色。只有预定义 ID 会被用于查找文件，URL 参数不会直接作为磁盘路径。

浏览器的声音策略、系统静音和输出设备仍可能影响播放。“提示音已播放”表示播放器接受了请求，不能代替耳听确认。

## 测试与重新生成

```sh
npm test
```

测试覆盖静态/动态客户端的完成状态变化、历史和失败请求、重复播放，以及所有音频路由。

可选的生成工具位于 [scripts/generate_audio.py](scripts/generate_audio.py)，需要 Apple Silicon、Python、MLX 和 FFmpeg：

```sh
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements-tts.txt
.venv/bin/python scripts/generate_audio.py
```

输出默认保存在被 Git 忽略的 `generated/`，不会直接覆盖已发布音频。种子和模型版本相同也不保证不同硬件或依赖环境生成完全相同的波形。

## English

A DeepSeek Harness completion-sound bundle with eight generated voice options, persistent selection, and compact bottom-right controls. It follows the DSH 0.2.1 Session lifecycle instead of removed conversation fields. Historical messages, session switches, and failed requests are silent.

Add this local repository as the `dsh-plugin-laile-laodi` dependency and a `dsh.profile.bundles` entry in your desktop profile, install dependencies, and restart Harness. Click **测试提示音** once to test playback. Audio is pre-generated; no TTS model runs during ordinary replies. See [audio provenance](AUDIO_PROVENANCE.md) for generation details.

Plugin code: [MIT](LICENSE). Model source and license information are documented separately in the audio provenance record.
