import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {socialCardAt,preferredVideoType,SOCIAL_DURATION,createSocialExport} from './intro-social-export.js';
test('The vertical export retains the 80 second timeline and social outro',()=>{
 assert.equal(SOCIAL_DURATION,80000);assert.equal(socialCardAt(72499),null);
 assert.equal(socialCardAt(72500).kind,'experience');
 assert.match(socialCardAt(75000).copy,/personnages.*lieux.*immersive/);
 assert.equal(socialCardAt(77500).main,'Compagnon de route');
 assert.equal(socialCardAt(80000).site,'tectonique-des-ames.com');
});
test('MP4 is preferred and an unsupported browser does not silently claim MP4',()=>{
 assert.match(preferredVideoType({isTypeSupported:t=>t.startsWith('video/mp4')}),/^video\/mp4/);
 assert.match(preferredVideoType({isTypeSupported:t=>t==='video/webm'}),/^video\/webm/);
 assert.equal(preferredVideoType({isTypeSupported:()=>false}),'');
});
test('the original authenticated cinematic drives the recording and the original audio sources tap the mix',()=>{
 const read=name=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
 const intro=read('intro-cinema.js'),sound=read('intro-sound.js'),audio=read('salon-conversation-audio.js'),voice=read('intro-elevenlabs.js'),exp=read('intro-social-export.js');
 assert.match(intro,/socialMode=.*get\('export'\)==='social'/);
 assert.match(intro,/if\(!authorized\|\|!ready\|\|stage==='garden'\)return;/);
 assert.match(intro,/socialExport\.tick\(introductionDuration\+arrivalPlayer\.elapsed/);
 assert.match(intro,/socialExport\.tick\(soundOffsets\[step\]/);
 assert.match(intro,/await Promise\.all\(\[prepareSeats\(\).*cinematicVoices\.prepareClips/);
 assert.match(sound,/audioTap\(context,musicGain\)/);
 assert.match(audio,/audioTap\?\.\(context,job\.source\)/);
 assert.match(voice,/clipCache\?\.read\(cacheKey\)/);
 assert.match(voice,/clipCache\?\.write\(cacheKey,clip\)/);
 assert.match(exp,/canvas\.captureStream\(24\)/);
 assert.match(exp,/destination\.stream\.getAudioTracks/);
 assert.match(exp,/frame\.contentDocument\?\.querySelector\('#scene'\)/);
 assert.doesNotMatch(exp,/getUserMedia|speechSynthesis|fetch\(/);
});
test('a mock recording pauses across scene loads and delivers video and audio tracks',async t=>{
 const old={document:globalThis.document,AudioContext:globalThis.AudioContext,MediaRecorder:globalThis.MediaRecorder,HTMLCanvasElement:globalThis.HTMLCanvasElement};
 const tracks=[{kind:'video',stop(){}},{kind:'audio',stop(){}}],selected=[tracks[0]];
 const stream={addTrack(t){selected.push(t)},getTracks(){return selected}};
 const gradient={addColorStop(){}};
 const ctx=new Proxy({measureText:s=>({width:s.length*8}),createLinearGradient:()=>gradient},{get(o,k){return k in o?o[k]:()=>{}},set(o,k,v){o[k]=v;return true}});
 class Canvas{width=720;height=1280;getContext(){return ctx}captureStream(){return stream}}
 class Audio{createMediaStreamDestination(){return {stream:{getAudioTracks:()=>[tracks[1]]}}}resume(){return Promise.resolve()}close(){return Promise.resolve()}}
 const actions=[];class Recorder{static isTypeSupported(t){return t.startsWith('video/mp4')}constructor(s,o){this.state='inactive';this.mimeType=o.mimeType;assert.equal(s.getTracks().length,2)}start(){this.state='recording';actions.push('start')}pause(){this.state='paused';actions.push('pause')}resume(){this.state='recording';actions.push('resume')}stop(){this.state='inactive';actions.push('stop');this.ondataavailable({data:new Blob(['x'.repeat(1200)])});this.onstop()}}
 globalThis.document={createElement:()=>new Canvas()};globalThis.AudioContext=Audio;globalThis.MediaRecorder=Recorder;globalThis.HTMLCanvasElement=Canvas;
 t.after(()=>{for(const [k,v]of Object.entries(old)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}});
 const files=[],stage={clientWidth:360,getBoundingClientRect:()=>({left:0,top:0,width:360,height:640}),querySelector:()=>null};
 const rec=createSocialExport({stage,frame:{contentDocument:{querySelector:()=>new Canvas()}},mainCanvas:()=>new Canvas(),onFile:(blob,ext)=>files.push({blob,ext})});
 await rec.unlock();rec.start();rec.tick(1000);rec.tick(2000,{playing:false});rec.tick(2000,{playing:false});rec.tick(2000);rec.tick(79000,{garden:true});rec.finish();
 assert.deepEqual(actions,['start','pause','resume','stop']);assert.equal(files.length,1);assert.equal(files[0].ext,'mp4');assert.ok(files[0].blob.size>1000);
});
