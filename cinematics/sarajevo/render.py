from pathlib import Path
import subprocess,json,shutil,urllib.request
P=Path(__file__).resolve().parent; C=P/'clips'; E=P/'edit'; E.mkdir(exist_ok=True)
C.mkdir(exist_ok=True);(P/'qa').mkdir(exist_ok=True)
for name,url in json.loads((P/'sources.json').read_text()).items():
 if name=='children_reveal':continue
 dest=C/(name+'.mp4')
 if not dest.exists():urllib.request.urlretrieve(url,dest)
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';SERIF='/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
COMMON=['-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-threads','2','-r','30']
def run(args):subprocess.run(['ffmpeg','-v','error','-y',*args],check=True)
def shot(num,name,start,duration,moving=None,title=None):
 filt=f'trim=start={start}:duration={moving or duration},setpts=PTS-STARTPTS,scale=1280:720,setsar=1,fps=30'
 if moving:filt+=f',tpad=stop_mode=clone:stop_duration={duration-moving}'
 if title:filt+=f",drawtext=fontfile={SERIF}:text='{title}':fontsize=64:fontcolor=0xfff4d9:shadowcolor=0x102019bb:shadowx=2:shadowy=3:x=920:y=445:enable='gte(t,{moving})'"
 run(['-i',str(C/f'{name}.mp4'),'-vf',filt,'-an','-t',str(duration),*COMMON,str(E/f'{num}.mp4')])
shot('01','vab_drive',.15,1.2)
shot('02','adults',0,2)
shot('03','ahmed',.15,1)
shot('04','lionel',.15,.8)
shot('05','ahmed',2.4,1.6,.7,'Ahmed')
shot('06','lionel',2.3,1.8,.9,'Lionel')
# The rejected children scene is omitted. Cut directly from Lionel to the exit.
shot('08','exit',0,3.8)
from remix_opening import render
render(P,json.loads((P/'audio-sources.json').read_text()),P/'Sarajevo-Ouverture.mp4')
mem=(f"[0:v]drawtext=fontfile={SERIF}:text='À YOYO':fontsize=96:fontcolor=0xf5f1e8:x=(w-tw)/2:y=225:alpha='clip(t,0,1)',"
 f"drawtext=fontfile={SERIF}:text='1975–2002':fontsize=56:fontcolor=0xf5f1e8:x=(w-tw)/2:y=365:alpha='clip(t-1,0,1)'[base];"
 "color=c=white:s=72x200:r=30:d=4,format=rgba,geq=r=245:g=241:b=232:a='255*gt(between(X,33,38)+between(Y,49,54),0)',fade=t=in:st=2:d=1:alpha=1[cross];[base][cross]overlay=x=927:y=225:shortest=1[v]")
run(['-f','lavfi','-i','color=c=black:s=1280x720:r=30:d=4','-filter_complex',mem,'-map','[v]','-an','-t','4',*COMMON,str(E/'09.mp4')])
shot('10','return',0,5)
(E/'outro.txt').write_text(f"file '{E}/09.mp4'\nfile '{E}/10.mp4'\n")
run(['-f','concat','-safe','0','-i',str(E/'outro.txt'),'-c','copy',str(E/'outro-picture.mp4')])
run(['-i',str(E/'outro-picture.mp4'),'-i',str(C/'return.mp4'),'-map','0:v','-map','1:a','-af','atrim=duration=5,asetpts=PTS-STARTPTS,loudnorm=I=-18:TP=-1.5:LRA=9,adelay=4000:all=1,afade=t=out:st=8.8:d=0.2','-c:v','copy','-c:a','aac','-ar','48000','-b:a','160k','-t','9','-movflags','+faststart',str(P/'Sarajevo-Cloture-9s.mp4')])
info={}
for name,duration in [('Sarajevo-Ouverture',12.2),('Sarajevo-Cloture-9s',9)]:
 f=P/(name+'.mp4');probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size:stream=codec_type,codec_name,width,height,nb_frames','-of','json',str(f)]));assert abs(float(probe['format']['duration'])-duration)<.04;info[name]=probe
 run(['-i',str(f),'-vf','fps=2,scale=320:-1,tile=5x6','-frames:v','1',str(P/'qa'/(name+'.jpg'))])
(P/'verification.json').write_text(json.dumps(info,indent=2));print(json.dumps(info))
