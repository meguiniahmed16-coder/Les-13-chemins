// Finish the approved 59.5 s visual revision with a locally supplied soundtrack.
// No downloads, generation, or publication are performed by this script.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const args=process.argv.slice(2),value=name=>args.find(a=>a.startsWith(name+'='))?.slice(name.length+1);
const required=name=>{const v=value(name);if(!v)throw Error('Missing '+name);return path.resolve(v);};
const source=required('--source'),mix=required('--mix'),music=required('--music'),overlay=required('--credit'),out=required('--out');
const duration=59.5,fps=20,width=960,height=540;
const sourceExpected='e4a9319219ae079cce2d5278d30f3f21a6339a64a38a0c758dbd4d8a1b79bd1d';
const sha=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
for(const file of [source,mix,music,overlay])if(!fs.statSync(file).isFile())throw Error('Not a file: '+file);
if(source===out)throw Error('Use a separate output path to preserve the source film.');
if(sha(source)!==sourceExpected)throw Error('The visual revision changed; review its timing before adding sound.');
fs.mkdirSync(path.dirname(out),{recursive:true});
const commands=[];
function run(program,parameters,{capture=false}={}){
 commands.push({program,arguments:parameters});
 const r=spawnSync(program,parameters,{encoding:'utf8',stdio:capture?'pipe':'inherit',maxBuffer:16*1024*1024});
 if(r.error)throw r.error;
 if(r.status!==0)throw Error(program+' failed'+(capture?': '+r.stderr:''));
 return r.stdout;
}
const probe=file=>JSON.parse(run('ffprobe',['-v','error','-show_format','-show_streams','-of','json',file],{capture:true}));
const original=probe(source),v=original.streams.find(s=>s.codec_type==='video'),sound=probe(mix),m=probe(music);
if(v.width!==width||v.height!==height||v.r_frame_rate!==fps+'/1'||Math.abs(Number(original.format.duration)-duration)>.02)throw Error('Unexpected visual revision format.');
if(original.streams.some(s=>s.codec_type==='audio'))throw Error('The source already has audio; review the mix to avoid discarding it.');
if(!sound.streams.some(s=>s.codec_type==='audio')||Math.abs(Number(sound.format.duration)-duration)>.03)throw Error('The soundtrack must cover exactly 59.5 seconds.');
if(!m.streams.some(s=>s.codec_type==='audio')||!/^Effervescence$/i.test(m.format.tags?.title||'')||!/^Scott Buckley$/i.test(m.format.tags?.artist||''))throw Error('The supplied music does not identify the approved track.');

const musicCredit='Musique : Effervescence — Scott Buckley · CC BY 4.0 · scottbuckley.com.au';
const attribution='Effervescence — Scott Buckley. https://www.scottbuckley.com.au/library/effervescence/\nLicence : CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/\nModifications : extrait 0:00–0:59,50, fondus, ajustements de niveau et ajout de bruitages.';
const sourceList=value('--sound-sources')?JSON.parse(fs.readFileSync(path.resolve(value('--sound-sources')),'utf8')):[];
const soundCredits=sourceList.map(s=>`${s.title} — ${s.author} (${s.license}). ${s.page}`).join('\n');
const fullCredit=[attribution,soundCredits].filter(Boolean).join('\n\n');
const comment=[original.format.tags?.comment,fullCredit].filter(Boolean).join('\n\n');
const temporary=out.replace(/\.mp4$/i,'.partial.mp4');
if(temporary===out)throw Error('Output must use the .mp4 extension.');
const filter=`[2:v]format=rgba,setpts=PTS-STARTPTS,fade=t=in:st=51.5:d=0.25:alpha=1,fade=t=out:st=59.1:d=0.4:alpha=1[credit];[0:v][credit]overlay=0:0:enable='between(t,51.5,59.5)',format=yuv420p[v]`;
run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',source,'-i',mix,'-loop','1','-framerate',String(fps),'-i',overlay,'-filter_complex_threads','2','-filter_complex',filter,'-map','[v]','-map','1:a:0','-map_metadata','0','-metadata','comment='+comment,'-metadata','description='+(original.format.tags?.description||'')+'\n\n'+fullCredit,'-metadata:s:a:0','title=Effervescence et bruitages','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-threads','4','-c:a','aac','-b:a','256k','-ar','48000','-ac','2','-t',String(duration),'-movflags','+faststart+use_metadata_tags',temporary]);
const result=probe(temporary),video=result.streams.find(s=>s.codec_type==='video'),audio=result.streams.find(s=>s.codec_type==='audio');
if(video.width!==width||video.height!==height||video.nb_frames!==String(duration*fps)||!audio||audio.sample_rate!=='48000'||audio.channels!==2||Math.abs(Number(result.format.duration)-duration)>.05)throw Error('Final soundtrack export failed validation.');
run('ffmpeg',['-v','error','-i',temporary,'-f','null','-']);
fs.renameSync(temporary,out);
const proof=path.join(path.dirname(out),'proof');fs.mkdirSync(proof,{recursive:true});
for(const [name,at]of [['before-credit',51.4],['closing-credit',55.25],['last-frame',59.45]])run('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(at),'-i',out,'-frames:v','1',path.join(proof,name+'.png')]);
const audioDetails=value('--audio-provenance')?JSON.parse(fs.readFileSync(path.resolve(value('--audio-provenance')),'utf8')):null;
const provenance={title:'La Croisée des Âmes',duration_s:duration,source:{file:path.basename(source),sha256:sha(source)},music:{title:'Effervescence',composer:'Scott Buckley',file:path.basename(music),sha256:sha(music),source_in_s:0,source_out_s:duration,license:'CC BY 4.0',source_url:'https://www.scottbuckley.com.au/library/effervescence/'},soundtrack:{file:path.basename(mix),sha256:sha(mix),details:audioDetails},closing_credit:{text:musicCredit,start_s:51.5,end_s:duration,fade_in_s:.25,fade_out_s:.4,overlay_sha256:sha(overlay)},voice_tracks:[],source_visuals_preserved_except_closing_credit:true,output:{file:path.basename(out),sha256:sha(out),bytes:fs.statSync(out).size,video,audio},attributions:{music:attribution,sounds:sourceList},commands};
fs.writeFileSync(path.join(path.dirname(out),'soundtrack-provenance.json'),JSON.stringify(provenance,null,2)+'\n');
fs.writeFileSync(path.join(path.dirname(out),'Credits-Effervescence.txt'),fullCredit+'\n');
console.log('SOUNDTRACK_VIDEO_READY',JSON.stringify(provenance.output));
