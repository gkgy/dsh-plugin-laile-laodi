"""Rebuild the documented synthetic voice pack into generated/ (Apple Silicon)."""
from pathlib import Path
import argparse, json, subprocess, wave
import mlx.core as mx
import numpy as np
from huggingface_hub import snapshot_download
from mlx_audio.tts.utils import load_model

ROOT = Path(__file__).resolve().parents[1]
MODEL = 'mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit'
REVISION = '5c390979e4b93af5f2932f90742ca99c7dd04687'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', type=Path, default=ROOT / 'generated')
    args = parser.parse_args()
    out = args.output_dir.resolve()
    out.mkdir(parents=True, exist_ok=True)
    rows = json.loads((ROOT / 'assets/generated-manifest.json').read_text())
    model = load_model(snapshot_download(MODEL, revision=REVISION))
    for row in rows:
        dst = out / (row['id'] + '.wav')
        if row.get('effect'):
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i',
                            str(out / (row['source'] + '.wav')), '-af', row['effect'], str(dst)], check=True)
        else:
            mx.random.seed(row['seed'])
            chunks = list(model.generate_voice_design(
                text=row['text'], instruct=row['instruct'], language='Chinese',
                max_tokens=140, temperature=row['temperature']))
            audio = np.concatenate([np.asarray(chunk.audio).reshape(-1) for chunk in chunks])
            rate = chunks[0].sample_rate
            voiced = np.flatnonzero(np.abs(audio) > .008)
            if len(voiced):
                audio = audio[max(0, voiced[0] - int(rate * .06)):
                              min(len(audio), voiced[-1] + int(rate * .15))]
            peak = float(np.abs(audio).max())
            if peak < .01:
                raise RuntimeError('Silent generation: ' + row['id'])
            audio *= .8 / peak
            with wave.open(str(dst), 'wb') as wav:
                wav.setnchannels(1)
                wav.setsampwidth(2)
                wav.setframerate(rate)
                wav.writeframes((np.clip(audio, -1, 1) * 32767).astype('<i2').tobytes())
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(dst),
                        '-codec:a', 'libmp3lame', '-b:a', '96k', str(out / (row['id'] + '.mp3'))], check=True)
        print('Generated', row['id'], flush=True)
    print('Output:', out)


if __name__ == '__main__':
    main()
