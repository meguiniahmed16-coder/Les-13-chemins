// Assemble the rendered production scenes; no character geometry is generated here.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {PROMOTION} from '../../membres/intro-arrival.js';
import {DOJO_LOOKS} from '../../membres/intro-dojo-wardrobe.js';
import {byId} from '../../membres/studio-look.js';

const here=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(here,'../..');
const args=process.argv.slice(2),out=path.resolve(args.find(a=>!a.startsWith('--'))||'promotion-output');
const archive=path.resolve(args.find(a=>a.startsWith('--archive='))?.slice('--archive='.length)||process.env.PROMOTION_ARCHIVE||'../verification');
const cardsOnly=args.includes('--cards-only'),prepareOnly=args.includes('--prepare'),waitForRenders=args.includes('--wait'),assembleOnly=args.includes('--assemble-only');
const fps=20,width=960,height=540,transition=.25;
const renderedFilter='nlmeans=s=3:p=5:pc=5:r=9:rc=9';
for(const directory of ['cards','segments','provenance','proof'])fs.mkdirSync(path.join(out,directory),{recursive:true});
const relative=p=>path.relative(out,p).split(path.sep).join('/');
const sha256=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const writeJSON=(name,value)=>fs.writeFileSync(path.join(out,name),JSON.stringify(value,null,2)+'\n');
const commands=[];
function run(program,parameters,{capture=false}={}){
 commands.push({program,arguments:parameters});
 const result=spawnSync(program,parameters,{encoding:'utf8',stdio:capture?'pipe':'inherit',maxBuffer:16*1024*1024});
 if(result.error)throw result.error;
 if(result.status!==0)throw Error(`${program} failed (${result.status})${capture?': '+result.stderr:''}`);
 return result.stdout;
}
function probe(file){return JSON.parse(run('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames','-of','json',file],{capture:true}));}
const clips=[
 {id:'opening',kind:'card',seconds:3,file:'cards/opening.png'},
 {id:'duo',kind:'frames',seconds:4},
 {id:'salon',kind:'archive',seconds:3,file:'salon-footage/salon-v27-8s.mp4',in:1},
 {id:'dice',kind:'archive',seconds:3,file:'dice-footage/intro-des-plateau.mp4',in:.2},
 {id:'walk',kind:'frames',seconds:5},
 {id:'turn',kind:'frames',seconds:4},
 {id:'wardrobe',kind:'frames',seconds:8},
 {id:'garden',kind:'archive',seconds:3,file:'garden-footage/garden-6s.mp4',in:1.2},
 {id:'finale',kind:'frames',seconds:12},
 {id:'closing',kind:'card',seconds:8,file:'cards/closing.png'}
];
let cursor=0;
for(const [index,clip]of clips.entries()){
 clip.start=cursor;clip.end=cursor+clip.seconds;
 clip.segment=path.join(out,'segments',clip.id+'.mp4');
 cursor=clip.end-(index===clips.length-1?0:transition);
}
const duration=cursor,clipById=new Map(clips.map(clip=>[clip.id,clip]));
writeJSON('promotion-copy.json',PROMOTION);
run('python3',[path.join(here,'cards.py'),path.join(out,'promotion-copy.json'),path.join(out,'cards')]);

// All captions use the same scene clock as the final edit. Their boxes stay
// above the characters, leaving their planted and lifted shoes unobstructed.
const captions=[];
function caption(id,from,to,text,style='Caption'){
 const clip=clipById.get(id);captions.push({start:clip.start+from,end:clip.start+to,text,style});
}
caption('duo',.45,3.6,'Ahmed et Marianne');
caption('salon',.4,2.65,'Un salon pour se rencontrer.');
caption('dice',.35,2.7,'Un jeu à découvrir, ensemble.');
caption('walk',.35,4.6,'Marcher librement.');
caption('turn',.35,3.7,'Se tourner, en prenant appui.');
caption('wardrobe',.3,3.75,'Des tenues pour chaque moment.');
caption('wardrobe',4.05,5.45,'Sous-vêtements');
caption('wardrobe',5.65,7.65,'Votre style, votre personnage.');
caption('garden',.35,2.7,'La rencontre se prolonge au jardin.');
caption('finale',1.8,8.1,'Ahmed : '+PROMOTION.dialogue.replace('… ','…\n'),'Dialogue');
caption('finale',5,7,'Mode ange  ✓','Angel');
const assTime=s=>{
 const n=Math.round(s*100),h=Math.floor(n/360000),m=Math.floor(n/6000)%60,seconds=Math.floor(n/100)%60;
 return `${h}:${String(m).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(n%100).padStart(2,'0')}`;
};
const srtTime=s=>{
 const n=Math.round(s*1000);return `${String(Math.floor(n/3600000)).padStart(2,'0')}:${String(Math.floor(n/60000)%60).padStart(2,'0')}:${String(Math.floor(n/1000)%60).padStart(2,'0')},${String(n%1000).padStart(3,'0')}`;
};
const assEscape=text=>text.replaceAll('\\','\\\\').replaceAll('{','\\{').replaceAll('}','\\}').replaceAll('\n','\\N');
const ass=`[Script Info]\nTitle: ${PROMOTION.title}\nScriptType: v4.00+\nPlayResX: ${width}\nPlayResY: ${height}\nScaledBorderAndShadow: yes\nWrapStyle: 2\n\n[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\nStyle: Caption,DejaVu Sans,21,&H00DCECF4,&H0072ADC6,&H301F2910,&H301F2910,0,0,0,0,100,100,0,0,3,7,0,8,30,30,26,1\nStyle: Dialogue,DejaVu Sans,20,&H00DCECF4,&H0072ADC6,&H301F2910,&H301F2910,0,0,0,0,100,100,0,0,3,7,0,8,30,30,26,1\nStyle: Angel,DejaVu Sans,19,&H0072ADC6,&H0072ADC6,&H201F2910,&H201F2910,-1,0,0,0,100,100,0,0,3,9,0,9,28,32,28,1\n\n[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text\n`+
 captions.map(c=>`Dialogue: ${c.style==='Angel'?1:0},${assTime(c.start)},${assTime(c.end)},${c.style},,0,0,0,,{\\fad(120,120)}${assEscape(c.text)}`).join('\n')+'\n';
const subtitleFile=path.join(out,'promotion.ass');fs.writeFileSync(subtitleFile,ass);
fs.writeFileSync(path.join(out,'La-Croisee-des-Ames-promotion.srt'),captions.map((c,i)=>`${i+1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text}\n`).join('\n'));

const salonHTML=fs.readFileSync(path.join(repo,'membres/v27/salon.html'),'utf8');
const wingLink=salonHTML.match(/href="([^"]+)"[^>]*>The wasp wings<\/a> de culturalibre \(([^)]+)\)/);
if(!wingLink)throw Error('The wing attribution could not be read from salon.html.');
const wings={title:'The wasp wings',author:'culturalibre',license:wingLink[2],licenseVersion:null,url:wingLink[1],adaptation:'Plumage et articulation créés pour le duo.'};
const garmentIds=[...new Set(DOJO_LOOKS.flatMap(look=>['m','f'].flatMap(id=>Object.values(look[id]))))];
const garments=garmentIds.map(id=>{const p=byId.get(id);return {id,title:p.label,author:p.author,license:p.license,url:p.source};});
const creditLines=[`${wings.title} — ${wings.author} (${wings.license}). ${wings.url}. ${wings.adaptation}`,...garments.map(p=>`${p.title} — ${p.author} (${p.license}). ${p.url}`)];
fs.writeFileSync(path.join(out,'provenance','credits.txt'),creditLines.join('\n')+'\n');
const sourceFile=path.join(out,'provenance.json');
const source=fs.existsSync(sourceFile)?JSON.parse(fs.readFileSync(sourceFile,'utf8')):{};
const montage={
 title:PROMOTION.title,copy:PROMOTION,width,height,fps,duration,transition:{kind:'crossfade',seconds:transition},silent:true,burnedInSubtitles:true,
 postprocess:{renderedPlansOnly:renderedFilter,cardsAndExistingVideos:'No denoising'},
 clips:clips.map(({segment,...clip})=>({...clip,segment:relative(segment)})),captions,
 attributions:{wings,garments},
 characters:{
  Ahmed:{identity:'Modèle original privé',sha256:source.privateAhmed?.sha256||null},
  Marianne:{identity:'Référence Marianne originale',sha256:source.referenceMarianne?.sha256||null}
 },
 productionSources:source.productionSources||[],
 output:'La-Croisee-des-Ames-promotion.mp4'
};
writeJSON('provenance/montage.json',montage);
if(cardsOnly){console.log('CARDS_READY',path.join(out,'cards'),duration+' seconds planned');process.exit(0);}

const renderLogs=['render-duo.log','render-walk.log','render-turn.log','render-wardrobe.log','render-finale-first.log','render-finale.log'];
const pngTail=Buffer.from('0000000049454e44ae426082','hex');
function completePNG(file){
 let descriptor;
 try{
  const size=fs.statSync(file).size;if(size<20)return false;
  descriptor=fs.openSync(file,'r');const tail=Buffer.alloc(12);fs.readSync(descriptor,tail,0,12,size-12);return tail.equals(pngTail);
 }catch{return false;}finally{if(descriptor!==undefined)fs.closeSync(descriptor);}
}
function renderStatus(){
 const frames=clips.filter(c=>c.kind==='frames').map(clip=>{
  let complete=0;for(let i=0;i<clip.seconds*fps;i++)if(completePNG(path.join(out,'rendered',clip.id,String(i).padStart(4,'0')+'.png')))complete++;
  return {id:clip.id,complete,expected:clip.seconds*fps};
 });
 const logs=renderLogs.map(name=>{
  const file=path.join(out,name);return {name,complete:fs.existsSync(file)&&fs.readFileSync(file,'utf8').includes('PROMOTION_RENDER_COMPLETE')};
 });
 return {ready:frames.every(f=>f.complete===f.expected)&&logs.every(log=>log.complete),frames,logs};
}
if(waitForRenders&&!prepareOnly){
 const began=Date.now();let reported=-Infinity;
 while(true){
  const status=renderStatus();
  if(status.ready){console.log('ALL_RENDER_BATCHES_COMPLETE');break;}
  if(Date.now()-reported>=60000){console.log('WAITING_FOR_RENDERS',JSON.stringify(status));reported=Date.now();}
  if(Date.now()-began>2*60*60*1000)throw Error('The rendering batches did not finish within two hours; no final MP4 was assembled.');
  await new Promise(resolve=>setTimeout(resolve,15000));
 }
}

function inputs(clip){
 if(clip.kind==='card')return ['-loop','1','-framerate',String(fps),'-i',path.join(out,clip.file)];
 if(clip.kind==='archive'){
  const file=path.join(archive,clip.file);if(!fs.existsSync(file))throw Error('Missing existing scene: '+file);
  const info=probe(file);if(Number(info.format.duration)<clip.in+clip.seconds-.05)throw Error('Existing scene is too short: '+clip.file);
  return ['-ss',String(clip.in),'-i',file];
 }
 const directory=path.join(out,'rendered',clip.id),missing=[];
 for(let i=0;i<clip.seconds*fps;i++)if(!fs.existsSync(path.join(directory,String(i).padStart(4,'0')+'.png')))missing.push(i);
 if(missing.length)throw Error(`${clip.id}: ${missing.length} rendered frames are still missing (first: ${missing[0]}). Run --prepare while Blender completes.`);
 return ['-framerate',String(fps),'-start_number','0','-i',path.join(directory,'%04d.png')];
}
const encode=['-an','-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart'];
for(const clip of clips){
 if(prepareOnly&&clip.kind==='frames')continue;
 if(!assembleOnly){
 const input=inputs(clip),filters=[...(clip.kind==='frames'?[renderedFilter]:[]),`scale=${width}:${height}:force_original_aspect_ratio=decrease:flags=lanczos`,`pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=0x10291f`,`fps=${fps}`,'setsar=1'];
 if(clip.id==='opening')filters.push('fade=t=in:st=0:d=0.25');
 if(clip.id==='closing')filters.push(`fade=t=out:st=${clip.seconds-.4}:d=0.4`);
 console.log('ENCODE_SEGMENT',clip.id);
 run('ffmpeg',['-hide_banner','-loglevel','error','-y',...input,'-filter_threads','2','-vf',filters.join(','),'-frames:v',String(clip.seconds*fps),...encode,clip.segment]);
 }
 const info=probe(clip.segment),video=info.streams.find(s=>s.codec_type==='video');
 if(Math.abs(Number(info.format.duration)-clip.seconds)>.06||video?.width!==width||video?.height!==height||video?.r_frame_rate!==`${fps}/1`)throw Error('Segment duration, dimensions or cadence mismatch: '+clip.id);
}
if(prepareOnly){writeJSON('provenance/prepare-commands.json',commands);console.log('MONTAGE_PREPARED',duration+' seconds; waiting for rendered frames');process.exit(0);}

const filters=clips.map((clip,i)=>`[${i}:v]setpts=PTS-STARTPTS,fps=${fps},settb=1/${fps},format=yuv420p[v${i}]`);
let previous='v0',end=clips[0].seconds;
for(let i=1;i<clips.length;i++){
 const name='mix'+i;filters.push(`[${previous}][v${i}]xfade=transition=fade:duration=${transition}:offset=${(end-transition).toFixed(2)},fps=${fps},settb=1/${fps}[${name}]`);
 previous=name;end+=clips[i].seconds-transition;
}
const escaped=subtitleFile.replaceAll('\\','/').replaceAll(':','\\:').replaceAll("'","\\'");
filters.push(`[${previous}]ass=filename='${escaped}'[film]`);
const filterFile=path.join(out,'montage.ffmpeg');fs.writeFileSync(filterFile,filters.join(';\n')+'\n');
const output=path.join(out,montage.output),temporary=path.join(out,'La-Croisee-des-Ames-promotion.partial.mp4');
const comment=creditLines.join('\n');
run('ffmpeg',['-hide_banner','-loglevel','warning','-y',...clips.flatMap(clip=>['-i',clip.segment]),'-filter_complex_threads','2','-filter_complex_script',filterFile,'-map','[film]','-an','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-r',String(fps),'-threads','4','-movflags','+faststart+use_metadata_tags','-metadata','title='+PROMOTION.title,'-metadata','description='+PROMOTION.invitation+' '+PROMOTION.contribution+'. '+PROMOTION.site+' · '+PROMOTION.email,'-metadata','comment='+comment,temporary]);
const info=probe(temporary),video=info.streams.find(s=>s.codec_type==='video');
if(info.streams.some(s=>s.codec_type==='audio')||video?.width!==width||video?.height!==height||Math.abs(Number(info.format.duration)-duration)>.1)throw Error('The final MP4 failed its duration, dimensions or silence check.');
fs.renameSync(temporary,output);
for(const [name,time]of [['opening',1.5],['wardrobe',25.2],['angel',37.2],['closing',46.5]]){
 run('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(time),'-i',output,'-frames:v','1',path.join(out,'proof',name+'.png')]);
}
montage.file={name:montage.output,bytes:fs.statSync(output).size,sha256:sha256(output),verifiedDuration:Number(info.format.duration),video};
writeJSON('provenance/montage.json',montage);writeJSON('provenance/compose-commands.json',commands);
console.log('PROMOTION_MP4_READY',output,JSON.stringify(montage.file));
