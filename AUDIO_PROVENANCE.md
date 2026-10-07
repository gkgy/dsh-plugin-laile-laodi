# Audio generation record

The v1.1.0 audio pack replaces the recording bundled in the earlier version. That recording is absent from the current file tree; older Git commits still retain historical files.

## Sources

- Model: [mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit](https://huggingface.co/mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit)
- Model snapshot: `5c390979e4b93af5f2932f90742ca99c7dd04687`
- Upstream: [QwenLM/Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS)
- The model card identifies the model license as Apache-2.0.
- Runtime used: mlx-audio 0.5.8, MLX 0.32.3, Transformers 5.19.0.
- VoiceDesign inputs: the Chinese greeting and generic voice/style descriptions. No reference recording was supplied to the speech model and no named person's voice was requested.

The default `chosen-3.mp3` is the user's approved third candidate from the comparison round. It has not been pitch-shifted or re-synthesized. `laile-laodi.mp3` is an identical copy for the default route.

Five additional voices were synthesized using VoiceDesign. The cartoon and robot options were produced from the approved synthetic sample using the effects recorded in the manifest. Their source is synthetic, not the recording from the earlier release.

## Records and validation

[assets/generated-manifest.json](assets/generated-manifest.json) contains file names, prompts, seeds, model revision, effects, durations, and SHA-256 hashes. It contains no local machine paths or credentials.

Unprompted speech recognition was used to reject ambiguous words and extra utterances. The shipped files passed the spoken-text check for “来了老弟”. Clipping and duration checks and live HTTP byte comparisons were also performed. These checks do not rate subjective voice quality or resemblance.

Code licensing and the model's licensing are separate. This record describes how the audio was produced; it does not assert exclusive rights to a voice or certify every downstream use.
