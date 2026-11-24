#!/usr/bin/env python3
"""Join the verified eight-second salon shot and seven-second board/dice shot."""
import argparse
import json
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--salon', type=Path, required=True)
parser.add_argument('--dice', type=Path, required=True)
parser.add_argument('--out', type=Path, default=Path(__file__).resolve().parents[1] / 'assets/membres')
args = parser.parse_args()

for path, expected in ((args.salon, 8), (args.dice, 7)):
    metadata = json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', str(path)
    ], text=True))
    if abs(float(metadata['format']['duration']) - expected) > .06:
        raise SystemExit(f'Unexpected source duration: {path}')

args.out.mkdir(parents=True, exist_ok=True)
movie = args.out / 'intro-montage-reel22.mp4'
poster = args.out / 'intro-montage-reel22.webp'
subprocess.run([
    'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(args.salon), '-i', str(args.dice),
    '-filter_complex',
    '[0:v]fps=20,scale=800:450:flags=lanczos,setsar=1,setpts=PTS-STARTPTS[s];'
    '[1:v]fps=20,scale=800:450:flags=lanczos,setsar=1,setpts=PTS-STARTPTS[d];'
    '[s][d]concat=n=2:v=1:a=0[v]',
    '-map', '[v]', '-r', '20', '-fps_mode', 'cfr', '-c:v', 'libx264', '-preset', 'slow', '-crf', '22',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', str(movie)
], check=True)
subprocess.run([
    'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(movie),
    '-frames:v', '1', '-quality', '88', str(poster)
], check=True)
print(movie)
print(poster)
