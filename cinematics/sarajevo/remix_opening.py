"""Remove rejected shot 07 and mix CC0 effects; no generative services required."""
from pathlib import Path
import argparse, json, subprocess, urllib.request

DURATION = 12.2
SHOTS = ('01', '02', '03', '04', '05', '06', '08')

def run(args):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-threads', '2', *args], check=True)

def render(work, sources, output):
    edit = work / 'edit'
    audio = work / 'audio'
    audio.mkdir(parents=True, exist_ok=True)
    for name, source in sources.items():
        target = audio / (name + '.mp3')
        if not target.exists():
            urllib.request.urlretrieve(source['download'], target)
    for shot in SHOTS:
        if not (edit / (shot + '.mp4')).exists():
            raise FileNotFoundError(f'Missing approved shot {shot}')
    listing = edit / 'intro-without-reveal.txt'
    listing.write_text(''.join(f"file '{edit / (shot + '.mp4')}'\n" for shot in SHOTS))
    picture = edit / 'intro-without-reveal.mp4'
    run(['-f', 'concat', '-safe', '0', '-i', str(listing), '-c', 'copy', str(picture)])
    inputs, filters, labels = [], [], []

    def event(name, source_start, length, at, volume, cutoff=14000, pan=0):
        i = len(labels)
        inputs.extend(['-i', str(audio / (name + '.mp3'))])
        left, right = min(1, 1-pan), min(1, 1+pan)
        filters.append(f'[{i}:a]atrim=start={source_start}:duration={length},asetpts=PTS-STARTPTS,'
                       f'aresample=48000,highpass=f=35,lowpass=f={cutoff},'
                       f'volume={volume},aformat=channel_layouts=mono,'
                       f'pan=stereo|c0={left}*c0|c1={right}*c0,'
                       f'afade=t=in:d=0.005,afade=t=out:st={max(0,length-.08)}:d=0.08,'
                       f'adelay={round(at*1000)}:all=1[a{i}]')
        labels.append(f'[a{i}]')

    # Diesel remains continuous beneath the reaction/freeze-frame edits.
    event('diesel', 8, 8.5, 0, 1.4, 1800)
    event('diesel', 16.4, 3.8, 8.4, .65, 2500)
    # Muffled combat and sharp impacts on the hull before the exit.
    for at, pan in [(1.8,-.3),(3.1,.4),(4.6,-.2),(6,.3),(7.4,-.4)]:
        event('machinegun', 0, .74, at, .10, 850, pan)
    for at, pan in [(2.13,-.4),(2.41,-.1),(3.51,.4),(3.75,.2),(4.69,-.3),(5.22,.4)]:
        event('metal', .47, .65, at, .48, 9000, pan)
    # Metallic latch anticipates the direct cut to the soldiers leaving.
    event('metal', .38, 1.1, 8.05, .50, 6500)
    # Exterior combat opens up at the cut, with bursts and distant explosions.
    for at, pan in [(8.4,-.5),(8.88,.3),(9.7,-.2),(10.3,.5),(11.2,-.4),(11.65,.2)]:
        event('machinegun', 0, .74, at, .36, 9500, pan)
    event('explosion', 2.2, 3.7, 8.5, 1.0, 6500, .25)
    event('explosion', 2.2, 2.0, 10.2, .8, 4500, -.3)
    filters.append(''.join(labels)+f'amix=inputs={len(labels)}:duration=longest:normalize=0,'
                   f'atrim=duration={DURATION},afade=t=out:st=12.05:d=0.15,'
                   'loudnorm=I=-18:TP=-1.5:LRA=8,aresample=48000,'
                   'aformat=sample_fmts=s16:sample_rates=48000:channel_layouts=stereo[mix]')
    wav = edit / 'intro-combat.wav'
    run([*inputs, '-filter_complex_threads', '2', '-filter_complex', ';'.join(filters),
         '-map', '[mix]', '-c:a', 'pcm_s16le', str(wav)])
    run(['-i', str(picture), '-i', str(wav), '-map', '0:v', '-map', '1:a',
         '-c:v', 'copy', '-c:a', 'aac', '-ar', '48000', '-b:a', '160k',
         '-t', str(DURATION), '-movflags', '+faststart', str(output)])
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries',
            'format=duration,size:stream=codec_type,codec_name,sample_rate,nb_frames',
            '-of', 'json', str(output)]))
    assert abs(float(probe['format']['duration'])-DURATION) < .04
    assert next(s for s in probe['streams'] if s['codec_type']=='video')['nb_frames']=='366'
    print(json.dumps(probe))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--work-dir', type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument('--sources', type=Path, default=Path(__file__).with_name('audio-sources.json'))
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    render(args.work_dir.resolve(), json.loads(args.sources.read_text()),
           args.output or args.work_dir/'Sarajevo-Ouverture.mp4')
