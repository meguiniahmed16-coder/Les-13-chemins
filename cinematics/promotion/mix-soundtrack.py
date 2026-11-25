#!/usr/bin/env python3
"""Mix Effervescence at the beginning/end only, with no music in the dojo."""

from pathlib import Path
import argparse
import json, hashlib, subprocess, re
import numpy as np
from scipy.io import wavfile

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--music', type=Path, required=True, help='Local Effervescence audio file; it is never modified.')
parser.add_argument('--foley', type=Path, required=True, help='Timed 59.5-second stereo 48 kHz float WAV of the approved sound effects.')
parser.add_argument('--ambience', type=Path, required=True, help='Timed 59.5-second stereo 48 kHz float WAV of the approved ambience.')
parser.add_argument('--out', type=Path, required=True, help='Destination directory for generated audio and provenance.')
args=parser.parse_args()
source=args.music.resolve()
foley_path=args.foley.resolve()
ambience_path=args.ambience.resolve()
OUT=args.out.resolve()
for input_path in (source, foley_path, ambience_path):
    if not input_path.is_file(): parser.error(f'Input file does not exist: {input_path}')
OUT.mkdir(parents=True, exist_ok=True)
SR=48000; DURATION=59.5; N=round(SR*DURATION)
MUSIC_TARGET_LUFS=-28.0
FOLEY_GAIN_DB=3.0
AMBIENCE_GAIN_DB=-2.0
DOJO_START_S=12.0
DOJO_END_S=37.25
DOJO_FADE_OUT_S=10.8
GARDEN_FADE_IN_END_S=38.45

def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p):
    sr,a=wavfile.read(p)
    if sr != SR or a.shape != (N,2):
        raise ValueError(f'Unexpected audio format {p.name}: {sr}, {a.shape}')
    if not np.isfinite(a).all(): raise ValueError('Nonfinite source audio')
    return a.astype(np.float64)
def measure(p):
    result=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(p),'-af','loudnorm=I=-24:TP=-1:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
    obj=json.loads(re.findall(r'\{\s*"input_i".*?\}',result.stderr,re.S)[-1])
    return {'integrated_lufs':float(obj['input_i']),'true_peak_dbtp':float(obj['input_tp']),'loudness_range_lu':float(obj['input_lra']),'threshold_lufs':float(obj['input_thresh'])}
def write(name,a):
    p=OUT/name
    wavfile.write(p,SR,a.astype(np.float32))
    return p

source_hash=digest(source)
subprocess.run(['ffmpeg','-v','error','-y','-i',str(source),'-t',str(DURATION),'-vn','-ac','2','-ar',str(SR),'-c:a','pcm_f32le',str(OUT/'music-original-excerpt.wav')],check=True)
t=np.arange(N)/SR
music=load(OUT/'music-original-excerpt.wav')
# Smooth fades preserve musical dynamics; no limiting, speed change or looping.
env=np.ones(N)
env*=np.sin(np.clip(t/1.2,0,1)*np.pi/2)**2
env*=np.cos(np.clip((t-53.8)/(59.5-53.8),0,1)*np.pi/2)**2
def dip(start,hold_start,hold_end,end,db):
    depth=np.zeros(N)
    rising=(t>=start)&(t<hold_start)
    depth[rising]=(1-np.cos(np.pi*(t[rising]-start)/(hold_start-start)))/2
    depth[(t>=hold_start)&(t<=hold_end)]=1
    falling=(t>hold_end)&(t<end)
    depth[falling]=(1+np.cos(np.pi*(t[falling]-hold_end)/(end-hold_end)))/2
    return 10**((db*depth)/20)
env*=dip(44.3,44.75,46.85,47.5,-2.0)
# Calibrate against the original complete excerpt, before muting the dojo.
# Otherwise the silent middle would alter the loudness gate and could turn up
# the retained beginning/end. This keeps those passages 4 dB below delivery 1.
reference_env=env*dip(12.5,13.0,20.2,20.8,-1.8)
pre=write('music-level-reference.wav',music*reference_env[:,None])
pre_measure=measure(pre)
music_gain_db=MUSIC_TARGET_LUFS-pre_measure['integrated_lufs']
dojo_gate=np.ones(N)
before=(t>=DOJO_FADE_OUT_S)&(t<DOJO_START_S)
dojo_gate[before]=np.cos((t[before]-DOJO_FADE_OUT_S)/(DOJO_START_S-DOJO_FADE_OUT_S)*np.pi/2)**2
dojo_mask=(t>=DOJO_START_S)&(t<DOJO_END_S)
dojo_gate[dojo_mask]=0
after=(t>=DOJO_END_S)&(t<GARDEN_FADE_IN_END_S)
dojo_gate[after]=np.sin((t[after]-DOJO_END_S)/(GARDEN_FADE_IN_END_S-DOJO_END_S)*np.pi/2)**2
music=music*(env*dojo_gate)[:,None]*10**(music_gain_db/20)
if np.count_nonzero(music[dojo_mask]): raise ValueError('Music must be exactly silent throughout the dojo')
foley=load(foley_path)*10**(FOLEY_GAIN_DB/20)
ambience=load(ambience_path)*10**(AMBIENCE_GAIN_DB/20)
mix=music+foley+ambience
if np.max(np.abs(mix))>=.8913: raise ValueError('Insufficient headroom; review gain without hard limiting')
files={'music':write('music-Effervescence-fitted.wav',music),'foley':write('foley-fitted.wav',foley),'ambience':write('ambience-fitted.wav',ambience),'mix':write('La-Croisee-des-Ames-soundtrack.wav',mix)}
measurements={key:measure(path) for key,path in files.items()}
for key,a in [('music',music),('foley',foley),('ambience',ambience),('mix',mix)]:
    measurements[key].update({'sample_peak_dbfs':float(20*np.log10(np.max(np.abs(a)))),'rms_dbfs':float(20*np.log10(np.sqrt(np.mean(a*a)))),'duration_s':len(a)/SR,'finite':bool(np.isfinite(a).all()),'clipped_samples':int(np.sum(np.abs(a)>=1))})
flac=OUT/'La-Croisee-des-Ames-soundtrack.flac'
subprocess.run(['ffmpeg','-v','error','-y','-i',str(files['mix']),'-c:a','flac','-sample_fmt','s32','-compression_level','8',str(flac)],check=True)
subprocess.run(['ffmpeg','-v','error','-i',str(flac),'-f','null','-'],check=True)
if digest(source) != source_hash: raise ValueError('The music source changed during the mix')
credit='Musique : « Effervescence » — Scott Buckley. https://www.scottbuckley.com.au/library/effervescence/ — CC BY 4.0 : https://creativecommons.org/licenses/by/4.0/. Extrait monté, musique au début et à la fin uniquement (aucune musique dans le dojo), fondus, ajustements de niveau et bruitages ajoutés.'
manifest={
    'title':'La Croisée des âmes — Effervescence et bruitages',
    'duration_s':DURATION,'sample_rate':SR,'channels':2,'voices_present':False,
    'status':'Music only at the beginning and end; exactly zero music samples in the dojo. Recorded foley and ambience retained. Technical verification complete; no subjective listening claim.',
    'music':{'title':'Effervescence','artist':'Scott Buckley','source_filename':source.name,'sha256':digest(source),'source_in_s':0,'source_out_s':DURATION,'source_unmodified':True,'official_page':'https://www.scottbuckley.com.au/library/effervescence/','license':'CC BY 4.0','license_url':'https://creativecommons.org/licenses/by/4.0/','reference_target_lufs':MUSIC_TARGET_LUFS,'gain_reference':'Original full excerpt and fades, before dojo mute; retains the 4 dB volume reduction at beginning and end.','gain_db_after_shaping':music_gain_db,'fade_in_s':[0,1.2],'fade_out_s':[53.8,59.5],'dojo_fade_out_s':[DOJO_FADE_OUT_S,DOJO_START_S],'music_absent_s':[DOJO_START_S,DOJO_END_S],'garden_fade_in_s':[DOJO_END_S,GARDEN_FADE_IN_END_S],'dojo_nonzero_music_samples':int(np.count_nonzero(music[dojo_mask])),'music_only_dips':[{'start_s':44.3,'hold_start_s':44.75,'hold_end_s':46.85,'end_s':47.5,'depth_db':-2.0}]},
    'foley':{'source_filename':foley_path.name,'sha256':digest(foley_path),'gain_db':FOLEY_GAIN_DB,'timing_unchanged':True},
    'ambience':{'source_filename':ambience_path.name,'sha256':digest(ambience_path),'gain_db':AMBIENCE_GAIN_DB,'timing_unchanged':True},
    'mix_processing':{'limiter':False,'dynamic_compressor':False,'looping':False,'original_music_speed_retained':True},
    'measurements':measurements,'credit':credit,
    'output':{'wav':files['mix'].name,'wav_sha256':digest(files['mix']),'flac':flac.name,'flac_sha256':digest(flac),'flac_bytes':flac.stat().st_size}
}
(OUT/'soundtrack-provenance.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(OUT/'music-credit.txt').write_text(credit+'\n')
print(json.dumps({'music_gain_db':music_gain_db,'measurements':measurements,'output':manifest['output']},ensure_ascii=False,indent=2))
