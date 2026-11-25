// Replace one faulty garment shot, add real native-avatar witnesses, and mix
// optional recorded dialogue. All other images retain the exact source film.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {DOJO_CAST} from '../../membres/intro-dojo-cast.js';
import {byId} from '../../membres/studio-look.js';
import {PROMOTION} from '../../membres/intro-arrival.js';

const args=process.argv.slice(2),value=name=>args.find(a=>a.startsWith(name+'='))?.slice(name.length+1);
const out=path.resolve(args.find(a=>!a.startsWith('--'))||'promotion-revision');
if(!value('--source'))throw Error('Usage: node cinematics/promotion/refresh.mjs OUTPUT --source=ORIGINAL_MP4 [--voice-manifest=JSON]');
const source=path.resolve(value('--source')),fps=20,width=960,height=540,duration=59.5;
const expected=value('--source-sha256')||'caee40fa0eeb4f565d57b0bb2e66c0ab61950ff528d693cd461fc9c86909aebe';
const sha=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if(sha(source)!==expected)throw Error('The recovered source film does not match its recorded digest.');
for(const p of ['segments','proof','provenance'])fs.mkdirSync(path.join(out,p),{recursive:true});
const commands=[];
function run(program,parameters,{capture=false}={}){
 commands.push({program,arguments:parameters});
 const result=spawnSync(program,parameters,{encoding:'utf8',stdio:capture?'pipe':'inherit',maxBuffer:16*1024*1024});
 if(result.error)throw result.error;
 if(result.status!==0)throw Error(program+' failed ('+result.status+')'+(capture?': '+result.stderr:''));
 return result.stdout;
}
const probe=file=>JSON.parse(run('ffprobe',['-v','error','-show_format','-show_streams','-of','json',file],{capture:true}));
const original=probe(source),stream=original.streams.find(s=>s.codec_type==='video');
if(Math.abs(Number(original.format.duration)-50.75)>.05||stream.width!==width||stream.height!==height||stream.r_frame_rate!==fps+'/1')throw Error('The source film format changed; review the edit points.');
const enc=['-an','-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart'];
const time=seconds=>{const n=Math.round(seconds*100);return `${Math.floor(n/360000)}:${String(Math.floor(n/6000)%60).padStart(2,'0')}:${String(Math.floor(n/100)%60).padStart(2,'0')}.${String(n%100).padStart(2,'0')}`;};
const escape=text=>text.replaceAll('\\','\\\\').replaceAll('{','\\{').replaceAll('}','\\}').replaceAll('\n','\\N');
function subtitles(name,items){
 const file=path.join(out,name+'.ass');
 const header=`[Script Info]\nScriptType: v4.00+\nPlayResX: ${width}\nPlayResY: ${height}\nScaledBorderAndShadow: yes\nWrapStyle: 2\n\n[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\nStyle: Caption,DejaVu Sans,21,&H00DCECF4,&H0072ADC6,&H301F2910,&H301F2910,0,0,0,0,100,100,0,0,3,7,0,8,24,24,22,1\nStyle: Label,DejaVu Sans,18,&H00DCECF4,&H0072ADC6,&H301F2910,&H301F2910,0,0,0,0,100,100,0,0,3,7,0,1,24,24,24,1\n\n[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text\n`;
 fs.writeFileSync(file,header+items.map(x=>`Dialogue: 0,${time(x.start)},${time(x.end)},${x.style||'Caption'},,0,0,0,,${escape(x.text)}`).join('\n')+'\n');return file;
}
const filterPath=file=>file.replaceAll('\\','/').replaceAll(':','\\:').replaceAll("'","\\'");
function still(id,seconds){
 const file=path.join(out,'rendered',id,'0000.png'),output=path.join(out,'segments',id+'.mp4');
 if(!fs.existsSync(file))throw Error('The real rendered witness is missing: '+id);
 // These are held witnesses: filter the identical source only once, keeping
 // facial detail, then animate the framing without repeating the spatial work.
 const filtered=path.join(out,'segments',id+'-filtered.png');
 run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',file,'-filter_threads','2','-vf','nlmeans=s=1.1:p=5:pc=5:r=9:rc=9','-frames:v','1',filtered]);
 const filters=[`zoompan=z='1+0.0006*on':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d=1:s=${width}x${height}:fps=${fps}`,'setsar=1'];
 run('ffmpeg',['-hide_banner','-loglevel','error','-y','-loop','1','-framerate',String(fps),'-i',filtered,'-filter_threads','2','-vf',filters.join(','),'-frames:v',String(Math.round(seconds*fps)),...enc,output]);return output;
}
const replace=still('marianne-replacement',1.5),casts=DOJO_CAST.map((_,i)=>still('cast-'+i,2.4));
const castCaption=subtitles('cast',[
 {start:0,end:9,text:'Tu peux choisir parmi une grande variété de personnages,\nde toutes les origines et de toutes les corpulences.'},
 ...DOJO_CAST.map((c,i)=>({start:i*2.2+.16,end:Math.min(8.9,i*2.2+2.18),text:c.label,style:'Label'}))
]);
const gallery=path.join(out,'segments','gallery.mp4'),galleryFilters=casts.map((_,i)=>`[${i}:v]setpts=PTS-STARTPTS,fps=${fps},settb=1/${fps},format=yuv420p[v${i}]`);
let previous='v0';for(let i=1;i<casts.length;i++){const name='mix'+i;galleryFilters.push(`[${previous}][v${i}]xfade=transition=fade:duration=0.2:offset=${(2.2*i).toFixed(2)},fps=${fps},settb=1/${fps}[${name}]`);previous=name;}
galleryFilters.push(`[${previous}]ass=filename='${filterPath(castCaption)}'[gallery]`);
run('ffmpeg',['-hide_banner','-loglevel','error','-y',...casts.flatMap(file=>['-i',file]),'-filter_complex_threads','2','-filter_complex',galleryFilters.join(';'),'-map','[gallery]','-frames:v','180',...enc,gallery]);
const replacementCaption=subtitles('marianne-replacement',[{start:0,end:1.5,text:'Des tenues pour chaque moment.'}]);
const replacementCaptioned=path.join(out,'segments','marianne-captioned.mp4');
run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',replace,'-filter_threads','2','-vf',`ass=filename='${filterPath(replacementCaption)}'`,...enc,replacementCaptioned]);

// The original floral garment occurs from 23.00 through 24.50 seconds.
// Drop the old 250ms wardrobe/garden dissolve when inserting the new gallery,
// so the old wardrobe cannot flash back after the final example.
const edits=[
 {id:'before',file:source,in:0,seconds:23},
 {id:'replacement',file:replacementCaptioned,in:0,seconds:1.5},
 {id:'wardrobe-end',file:source,in:24.5,seconds:3.75},
 {id:'gallery',file:gallery,in:0,seconds:9},
 {id:'after',file:source,in:28.5,seconds:22.25}
];
const visual=path.join(out,'promotion-visual.mp4');
const concat=edits.map((e,i)=>`[${i}:v]trim=duration=${e.seconds},setpts=PTS-STARTPTS,fps=${fps},settb=1/${fps},format=yuv420p[p${i}]`).join(';')+';'+edits.map((_,i)=>`[p${i}]`).join('')+`concat=n=${edits.length}:v=1:a=0[v]`;
const garmentIds=[...new Set(DOJO_CAST.flatMap(c=>Object.values(c.outfit)))],credits=garmentIds.map(id=>{const p=byId.get(id);return `${p.label} — ${p.author} (${p.license}). ${p.source}`;});
const comments=[original.format.tags?.comment,...credits].filter(Boolean).join('\n');
run('ffmpeg',['-hide_banner','-loglevel','error','-y',...edits.flatMap(e=>['-ss',String(e.in),'-t',String(e.seconds),'-i',e.file]),'-filter_complex_threads','2','-filter_complex',concat,'-map','[v]','-map_metadata','0','-metadata','comment='+comments,'-metadata','description='+PROMOTION.invitation+' '+PROMOTION.contribution+'. '+PROMOTION.site,'-frames:v',String(duration*fps),...enc,visual]);

let voices=[];const manifestPath=value('--voice-manifest');
if(manifestPath){
 const full=path.resolve(manifestPath),data=JSON.parse(fs.readFileSync(full,'utf8'));
 voices=data.clips.map(c=>({...c,file:path.resolve(path.dirname(full),c.file)}));
 for(const voice of voices){
  if(!Number.isFinite(voice.at)||voice.at<0||!fs.existsSync(voice.file))throw Error('Invalid speech clip input.');
  const info=probe(voice.file);voice.duration=Number(info.format.duration);
  if(!info.streams.some(s=>s.codec_type==='audio')||voice.at+voice.duration>duration-.10)throw Error('Speech would be cut off: '+voice.file);
 }
}
const output=path.join(out,'La-Croisee-des-Ames-promotion.mp4'),temp=path.join(out,'La-Croisee-des-Ames-promotion.partial.mp4');
if(voices.length){
 const filters=voices.map((v,i)=>`[${i+1}:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-17:TP=-1.8:LRA=9,aresample=48000,adelay=${Math.round(v.at*1000)}:all=1[a${i}]`);
 filters.push(voices.map((_,i)=>`[a${i}]`).join('')+`amix=inputs=${voices.length}:normalize=0:dropout_transition=0,apad,atrim=duration=${duration}[speech]`);
 run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',visual,...voices.flatMap(v=>['-i',v.file]),'-filter_complex_threads','2','-filter_complex',filters.join(';'),'-map','0:v','-map','[speech]','-map_metadata','0','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart+use_metadata_tags',temp]);
}else fs.copyFileSync(visual,temp);
const info=probe(temp),video=info.streams.find(s=>s.codec_type==='video'),audio=info.streams.find(s=>s.codec_type==='audio');
if(video.width!==width||video.height!==height||Math.abs(Number(info.format.duration)-duration)>.1||!!audio!==!!voices.length)throw Error('The refreshed export failed its duration, dimensions or audio check.');
run('ffmpeg',['-v','error','-i',temp,'-f','null','-']);fs.renameSync(temp,output);
for(const [name,at]of [['replacement',23.6],['cast-0',29.3],['cast-1',31.5],['cast-2',33.7],['cast-3',35.9],['angel',45.95],['closing',55.25]])run('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(at),'-i',output,'-frames:v','1',path.join(out,'proof',name+'.png')]);
const manifest={source:{name:path.basename(source),sha256:sha(source)},duration,width,height,fps,silent:!voices.length,postprocess:{newWitnessesOnly:'nlmeans=s=1.1:p=5:pc=5:r=9:rc=9'},edits:edits.map(({file,...e})=>({...e,source:path.basename(file)})),gallery:{start:28.25,duration:9,examples:DOJO_CAST.map(({id,label,gender,face,skinLevel,outfit})=>({id,label,gender,face,skinLevel,outfit}))},voices:voices.map(({file,...v})=>({...v,file:path.basename(file),sha256:sha(file)})),attributions:credits,output:{name:path.basename(output),bytes:fs.statSync(output).size,sha256:sha(output),video,audio}};
fs.writeFileSync(path.join(out,'provenance','revision.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(out,'provenance','refresh-commands.json'),JSON.stringify(commands,null,2)+'\n');
console.log('REFRESHED_MP4_READY',JSON.stringify(manifest.output));
