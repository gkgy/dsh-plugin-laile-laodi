[简体中文](README.md) | **English**

# Laile Laodi · DeepSeek Harness completion sound

Plays “来了，老弟” (“You're here, buddy”) when an assistant reply finishes. Choose and preview eight voices using the bottom-right controls. Your selection is saved automatically.

## What's new in v1.1.0

- Fixes completion sounds after the DSH 0.2.1 session-snapshot API change. Uses the `running → idle` transition instead of the removed `turnEnds` / `nodes` fields.
- Keeps historical replies, session switches, and failed requests silent.
- Adds voice selection and “测试提示音” (Test sound) at the bottom right, with an explanation if playback fails.
- Defaults to the selected **Voice 3 · Playful male voice**, keeping that sample unchanged, with seven additional voices.
- Replaces previously bundled recordings of a real person with locally generated audio. Sources, generation settings, and hashes are documented in [audio provenance](AUDIO_PROVENANCE.md).

## Voices

| Voice | Type |
| --- | --- |
| Voice 3 · Playful male voice (default) | Qwen3-TTS VoiceDesign |
| Deep male voice | Qwen3-TTS VoiceDesign |
| Clear male voice | Qwen3-TTS VoiceDesign |
| Raspy older male voice | Qwen3-TTS VoiceDesign |
| Gentle female voice | Qwen3-TTS VoiceDesign |
| Lively female voice | Qwen3-TTS VoiceDesign |
| High-pitched cartoon voice | Pitch-shifted Voice 3 sample |
| Electronic robot | Voice 3 modulation and short echo |

All voices say “来了，老弟”. These are pre-generated files. Playback requires neither loading a speech model nor calling an external speech API.

## Installation: static bundle (recommended)

Clone this repository to a permanent location:

```sh
git clone https://github.com/gkgy/dsh-plugin-laile-laodi.git
```

Add this package to both `dependencies` and `dsh.profile.bundles` in your DSH desktop profile's `package.json`. Merge these fields while keeping existing plugins and configuration. Replace the example path with the absolute path of your clone:

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

Install dependencies with the profile's package manager (for example, `pnpm install`) from that profile directory, then restart Harness. The desktop profile is typically at `~/.dsh/profiles/desktop`.

The package declares both host and client entry points; the bundle loads both automatically. Do not add another dynamic host, as its audio route would conflict.

After installation, choose a voice in the **bottom-right corner of the Harness window** and click **测试提示音** (Test sound). A user gesture can enable browser audio playback. Subsequent completed replies play the selected sound automatically.

## Dynamic loading (advanced)

Alternatively, place [dynamic/host.js](dynamic/host.js) and [dynamic/client.js](dynamic/client.js) into `cordis_define` as `code.host` and `code.client`, then activate them using `cordis_run`. First set `ASSET_DIR` at the top of the host code to this repository's `assets` directory.

Dynamic code uses the same voices and interface as the static bundle. Do not enable both hosts at once. Harness manages permissions and lifecycle for dynamic loading; the static bundle is better suited to continued use after restarts.

## Configuration

| Host setting | Default | Description |
| --- | --- | --- |
| `audioPath` | Bundled `assets/laile-laodi.mp3` | Default file when no voice parameter is supplied |
| `route` | `/laile-laodi.mp3` | Audio route; update the client URL too if you change it |

The client selects bundled voices using parameters such as `?voice=chosen-3`. Only predefined IDs are used for file lookup; URL parameters are never used directly as disk paths.

Browser audio policies, system mute, and the output device can still affect playback. “提示音已播放” (Sound played) means the player accepted the request; it does not replace listening to confirm audible output.

## Tests and regeneration

```sh
npm test
```

Tests cover completion-state changes in static and dynamic clients, historical and failed requests, duplicate playback, and all audio routes.

The optional generator is [scripts/generate_audio.py](scripts/generate_audio.py). It requires Apple Silicon, Python, MLX, and FFmpeg:

```sh
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements-tts.txt
.venv/bin/python scripts/generate_audio.py
```

Output goes to the Git-ignored `generated/` directory by default and does not overwrite published audio. The same seed and model version do not guarantee identical waveforms across different hardware or dependency environments.

## License

Plugin code: [MIT](LICENSE). Model sources and license information are documented separately in [audio provenance](AUDIO_PROVENANCE.md).
