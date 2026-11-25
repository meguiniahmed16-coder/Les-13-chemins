#!/usr/bin/env python3
"""Build the approved live-introduction audio from locally supplied sources."""
from pathlib import Path
import argparse, hashlib, json, re, subprocess, tempfile
import numpy as np
from scipy import signal
from scipy.io import wavfile

p=argparse.ArgumentParser()
p.add_argument('--music',type=Path,required=True)
p.add_argument('--foley-directory',type=Path,required=True)
p.add_argument('--room',type=Path,required=True)
p.add_argument('--garden',type=Path,required=True)
p.add_argument('--source-manifest',type=Path,required=True)
p.add_argument('--out',type=Path,required=True)
p.add_argument('--module',type=Path,required=True)
p.add_argument('--music-lufs',type=float,default=-28)
a=p.parse_args()
a.out.mkdir(parents=True,exist_ok=True)
SR=48000; MUSIC_SECONDS=264; LOOP_SECONDS=12; CROSSFADE_SECONDS=1
def run(args,**kw): return subprocess.run(args,check=True,**kw)
def digest(file): return hashlib.sha256(file.read_bytes()).hexdigest()
def probe(file):
    return json.loads(run(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(file)],capture_output=True,text=True).stdout)
def decode(file,seconds=None):
    cmd=['ffmpeg','-v','error','-i',str(file)]
    if seconds is not None:cmd+=['-t',str(seconds)]
    raw=run(cmd+['-vn','-ar',str(SR),'-ac','2','-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw,dtype='<f4').reshape(-1,2)
def measure(file,start=None,duration=None):
    cmd=['ffmpeg','-hide_banner','-nostats']
    if start is not None:cmd+=['-ss',str(start)]
    cmd+=['-i',str(file)]
    if duration is not None:cmd+=['-t',str(duration)]
    r=run(cmd+['-af','loudnorm=I=-28:TP=-1:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True)
    obj=json.loads(re.findall(r'\{\s*"input_i".*?\}',r.stderr,re.S)[-1])
    return {'integrated_lufs':float(obj['input_i']),'true_peak_dbtp':float(obj['input_tp']),'loudness_range_lu':float(obj['input_lra'])}
def encode(wav,target,rate=128,metadata=None,volume=None):
    cmd=['ffmpeg','-v','error','-y','-i',str(wav)]
    if volume is not None:cmd+=['-af',f'volume={volume:.9f}dB']
    cmd+=['-c:a','libmp3lame','-b:a',f'{rate}k','-ar',str(SR),'-ac','2','-write_xing','1']
    for key,value in (metadata or {}).items():cmd+=['-metadata',f'{key}={value}']
    run(cmd+[str(target)])
def metrics(x):
    return {'duration_s':len(x)/SR,'peak_dbfs':float(20*np.log10(np.max(np.abs(x))+1e-20)),'rms_dbfs':float(20*np.log10(np.sqrt(np.mean(x.astype(np.float64)**2))+1e-20)),'finite':bool(np.isfinite(x).all()),'clipped_samples':int(np.count_nonzero(np.abs(x)>=1))}

info=probe(a.music)
if info['format'].get('tags',{}).get('title','').lower()!='effervescence' or info['format']['tags'].get('artist','').lower()!='scott buckley':
    raise ValueError('Expected the approved, locally supplied Effervescence recording.')
source_catalog=json.loads(a.source_manifest.read_text())
source_catalog=[{k:v for k,v in s.items() if k not in ['local_path','preview','bytes']} for s in source_catalog]
manifest={'music':{'title':'Effervescence','artist':'Scott Buckley','source_sha256':digest(a.music),'source_in_s':0,'source_out_s':MUSIC_SECONDS,'target_lufs':a.music_lufs,'license':'CC BY 4.0','source':'https://www.scottbuckley.com.au/library/effervescence/','license_url':'https://creativecommons.org/licenses/by/4.0/','speed_changed':False,'looped':False,'fade_baked_in':False},'timing':{'scene_lines_s':242.2,'arrival_s':13,'promotion_card_s':7.5,'invitation_s':20,'longest_playback_s':282.7,'music_clock_end_s':262.7},'sources':source_catalog,'sample_rate':SR,'channels':2,'sprite':{},'loops':{},'outputs':{}}
manifest['music']['playback_policy']={'opening':True,'dojo':False,'salon_invitation':False,'garden':True,'fade_before_dojo_s':1.8,'garden_fade_in_s':1.8,'clock_paused_for_salon_invitation':True}
clips={}
with tempfile.TemporaryDirectory(prefix='intro-sound-build-') as tmp:
    work=Path(tmp)
    music_wav=work/'music.wav'
    run(['ffmpeg','-v','error','-y','-i',str(a.music),'-t',str(MUSIC_SECONDS),'-vn','-ac','2','-ar',str(SR),'-c:a','pcm_f32le',str(music_wav)])
    initial=measure(music_wav); gain=a.music_lufs-initial['integrated_lufs']
    music_out=a.out/'effervescence-intro.mp3'
    encode(music_wav,music_out,128,{'title':'Effervescence — extrait pour La Croisée des Âmes','artist':'Scott Buckley','comment':'CC BY 4.0 https://creativecommons.org/licenses/by/4.0/ — https://www.scottbuckley.com.au/library/effervescence/ — Extrait 0:00–4:24 ; niveau ajusté pour la cinématique interactive.'},gain)
    music_decoded=decode(music_out)
    manifest['music'].update({'linear_gain_db':gain,'decoded':metrics(music_decoded),'encoded_loudness':measure(music_out)})
    scene_measurements=[]
    for stage,start,seconds in [('white',0,149.2),('dojo',149.2,93),('garden_and_card',242.2,20.5)]:
        measured=measure(music_out,start,seconds)
        scene_measurements.append({'stage':stage,'start_s':start,'duration_s':seconds,'integrated_lufs':measured['integrated_lufs'],'true_peak_dbtp':measured['true_peak_dbtp']})
    dojo_music=music_decoded[round(149.2*SR):round(242.2*SR)]
    windows=[float(20*np.log10(np.sqrt(np.mean(dojo_music[i:i+SR].astype(np.float64)**2))+1e-20)) for i in range(0,len(dojo_music),SR)]
    manifest['music'].update({'scene_measurements':scene_measurements,'dojo_one_second_rms_range_dbfs':[min(windows),max(windows)]})

    ordered=[(f'step{i}',f'recorded-step-{i:02}.wav',.05) for i in range(1,10)]+[(f'pivot{i}',f'recorded-pivot-{i:02}.wav',.06) for i in range(1,6)]+[('selection','recorded-selection.wav',.035)]+[(f'cloth{i}',f'recorded-fabric-{i:02}.wav',0) for i in range(1,4)]+[('wings','recorded-wings.wav',0)]
    gap=np.zeros((round(.12*SR),2),dtype=np.float32); pieces=[gap]; at=len(gap)
    for key,name,contact in ordered:
        rate,x=wavfile.read(a.foley_directory/name)
        if rate!=SR or x.ndim!=2 or x.shape[1]!=2 or x.dtype!=np.float32 or not np.isfinite(x).all():raise ValueError('Unexpected processed foley: '+name)
        clips[key]={'offset':at/SR,'duration':len(x)/SR,'contactOffset':contact}
        manifest['sprite'][key]={**clips[key],'source_file':name,'source_sha256':digest(a.foley_directory/name),'working_metrics':metrics(x)}
        pieces.extend([x,gap]);at+=len(x)+len(gap)
    sprite=np.concatenate(pieces); sprite_wav=work/'sprite.wav';wavfile.write(sprite_wav,SR,sprite)
    sprite_out=a.out/'foley.mp3';encode(sprite_wav,sprite_out,192,{'title':'Pas, tissu, sélections et ailes — La Croisée des Âmes','comment':'Sources CC0 : Yuval, IENBA, FOSSarts, RossBell. Extraits découpés, filtrés et ajustés ; voir credits.txt.'})
    decoded=decode(sprite_out)
    if len(decoded)!=len(sprite):raise ValueError('MP3 sprite gapless length differs from PCM input.')
    corr=signal.correlate(decoded[:,0],sprite[:,0],mode='full',method='fft');center=len(sprite)-1;radius=2048
    lag=int(np.argmax(corr[center-radius:center+radius+1])-radius)
    if lag!=0:raise ValueError('MP3 sprite decode introduces a timestamp shift: '+str(lag))
    manifest['sprite_verification']={'gapless_decoded_frames':len(decoded),'peak_correlation_lag_samples':lag,'correlation':float(np.corrcoef(sprite.ravel(),decoded.ravel())[0,1]),'decoded_metrics':metrics(decoded),'runtime_gain_db':3,'gain_note':'Working levels retained in file. Runtime applies +3 dB, 4 dB below the previous promotional-film foley.'}

    for key,file,start,low,high,target in [('room',a.room,8,80,2600,-48),('garden',a.garden,12,100,4200,-47)]:
        raw=decode(file).astype(np.float64);source=raw[round(start*SR):round((start+LOOP_SECONDS+CROSSFADE_SECONDS)*SR)]
        if len(source)!=round((LOOP_SECONDS+CROSSFADE_SECONDS)*SR):raise ValueError('Ambient source too short.')
        sos=signal.butter(3,[low,high],btype='bandpass',fs=SR,output='sos')
        x=signal.sosfiltfilt(sos,source,axis=0);x-=x.mean(axis=0)
        rms=np.sqrt(np.mean(x*x));x=3.2*rms*np.tanh(x/(3.2*rms))
        n=round(CROSSFADE_SECONDS*SR);fade=np.linspace(0,np.pi/2,n,endpoint=False)
        seam=x[-n:]*np.cos(fade)[:,None]+x[:n]*np.sin(fade)[:,None]
        loop=np.concatenate([seam,x[n:-n]])
        loop*=10**(target/20)/np.sqrt(np.mean(loop*loop))
        wav=work/(key+'.wav');wavfile.write(wav,SR,loop.astype(np.float32))
        dest=a.out/(key+'.mp3');encode(wav,dest,128,{'title':'Texture '+key+' — La Croisée des Âmes','comment':'Sources CC0 ; raccord circulaire, filtrage et niveau ajusté. Voir credits.txt.'})
        check=decode(dest)
        if len(check)!=round(LOOP_SECONDS*SR):raise ValueError('Unexpected loop length after MP3 decoding.')
        manifest['loops'][key]={'source_sha256':digest(file),'source_start_s':start,'source_duration_s':LOOP_SECONDS+CROSSFADE_SECONDS,'duration_s':LOOP_SECONDS,'circular_crossfade_s':CROSSFADE_SECONDS,'working_rms_dbfs':target,'runtime_gain_db':-2,'decoded_metrics':metrics(check),'boundary_step':float(np.max(np.abs(check[0]-check[-1]))),'ordinary_step_99_percentile':float(np.quantile(np.abs(np.diff(check,axis=0)),.99))}

for name in ['effervescence-intro.mp3','foley.mp3','room.mp3','garden.mp3']:
    file=a.out/name;manifest['outputs'][name]={'bytes':file.stat().st_size,'sha256':digest(file)}
credits='Musique : Effervescence — Scott Buckley\nhttps://www.scottbuckley.com.au/library/effervescence/\nLicence CC BY 4.0 : https://creativecommons.org/licenses/by/4.0/\nExtrait 0:00–4:24, volume ajusté. Musique au début et au parc, coupée pendant le dojo et la démonstration du salon. Synchronisation et fondus par la cinématique.\n\nBruitages et textures :\n'+'\n'.join(f'{s["title"]} — {s["author"]} ({s["license"]}). {s["page"]}' for s in source_catalog)+'\n\nExtraits découpés, filtrés, ajustés en niveau ; tissu des ailes ralenti ; boucles d’ambiance raccordées. Les sources de bruitages sont les aperçus MP3 publics autorisés sous CC0.\n'
(a.out/'credits.txt').write_text(credits)
(a.out/'provenance.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
assets={'music':'/assets/intro-sound/effervescence-intro.mp3','foley':'/assets/intro-sound/foley.mp3','room':'/assets/intro-sound/room.mp3','garden':'/assets/intro-sound/garden.mp3','musicDuration':MUSIC_SECONDS,'loopDuration':LOOP_SECONDS,'musicLufs':a.music_lufs,'foleyGainDb':3,'ambienceGainDb':-2,'clips':clips}
a.module.parent.mkdir(parents=True,exist_ok=True)
a.module.write_text('// Generated from locally supplied, approved audio; see assets/intro-sound/provenance.json.\nexport const INTRO_SOUND_ASSETS = Object.freeze('+json.dumps(assets,ensure_ascii=False,indent=2)+');\n')
print(json.dumps({'outputs':manifest['outputs'],'music':manifest['music']['encoded_loudness'],'sprite':manifest['sprite_verification'],'loops':manifest['loops']},ensure_ascii=False,indent=2))
