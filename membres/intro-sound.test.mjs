import test from 'node:test';
import assert from 'node:assert/strict';
import {createIntroSound,createIntroSoundCues,introSoundEnvelope,INTRO_SOUND_TIMING} from './intro-sound.js';

const flush=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve();};
const dojoScenes=['dojo-arrivee','dojo-camera','dojo-deplacement','dojo-demi-tour','dojo-personnaliser','dojo-apparence','dojo-vetements','dojo-enregistrer','dojo-construction','jardin'];

function fixture({webAudio=true,waitForBuffers=false}={}){
 const problems=[],media=[],sources=[],gains=[];let fetchResolve;
 const parameter=()=>({value:0,setValueAtTime(value){this.value=value;},linearRampToValueAtTime(value){this.value=value;}});
 const context={state:'suspended',currentTime:0,destination:{},
  resume(){this.state='running';return Promise.resolve();},
  suspend(){this.state='suspended';return Promise.resolve();},
  close(){this.state='closed';return Promise.resolve();},
  createGain(){const item={gain:parameter(),connect(){},disconnect(){}};gains.push(item);return item;},
  createMediaElementSource(element){return {element,connect(){}};},
  createBufferSource(){const item={connect(){},disconnect(){},start(...args){this.startArgs=args;},stop(){this.stopped=true;},loop:false};sources.push(item);return item;},
  decodeAudioData(){return Promise.resolve({duration:12});}
 };
 const pending=waitForBuffers?new Promise(resolve=>{fetchResolve=resolve;}):Promise.resolve();
 const sound=createIntroSound({
  audioFactory(src){
   const events=new Map(),item={src,paused:true,currentTime:0,volume:1,muted:false,plays:0,
    play(){this.plays++;this.paused=false;return Promise.resolve();},pause(){this.paused=true;},
    addEventListener(name,fn){events.set(name,fn);},emit(name){events.get(name)?.();},removeAttribute(name){delete this[name];},load(){}};
   media.push(item);return item;
  },
  contextFactory:()=>webAudio?context:null,
  fetcher:async()=>{await pending;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(8)};},
  onProblem:message=>problems.push(message)
 });
 return {sound,context,media,sources,gains,problems,releaseBuffers:()=>fetchResolve?.()};
}

test('all dojo shots, including jardin, have zero music throughout while retaining room ambience',()=>{
 for(const sceneId of dojoScenes)for(const elapsedMs of [0,1,750,5000,12000]){
  const envelope=introSoundEnvelope({sceneId,elapsedMs,timeMs:149200+elapsedMs});
  assert.equal(envelope.music,0,`${sceneId} at ${elapsedMs}`);
  assert.equal(envelope.room,1);assert.equal(envelope.garden,0);
 }
 // A delayed scene identifier must not leak the preceding white-room music.
 assert.equal(introSoundEnvelope({sceneId:'bienvenue',timeMs:150000}).music,0);
});

test('music fades before the dojo, remains silent at both boundaries, then returns in the actual garden',()=>{
 const at=timeMs=>introSoundEnvelope({sceneId:'bienvenue',timeMs}).music;
 assert.equal(at(1200),1);assert.equal(at(100000),1);
 const {dojoStartMs,transitionMs}=INTRO_SOUND_TIMING;
 assert.equal(at(dojoStartMs-transitionMs),1);
 assert.equal(at(dojoStartMs-transitionMs/2),.5);
 assert.equal(at(dojoStartMs),0);
 assert.equal(introSoundEnvelope({sceneId:'arrival',elapsedMs:0,timeMs:242200}).music,0);
 assert.equal(introSoundEnvelope({sceneId:'arrival',elapsedMs:900,timeMs:243100}).music,.5);
 assert.equal(introSoundEnvelope({sceneId:'arrival',elapsedMs:1800,timeMs:244000}).music,1);
});

test('normal and promotional garden endings fade before the player stops',()=>{
 for(const [promotion,start,end]of [[false,9000,13000],[true,15000,20500]]){
  const at=elapsedMs=>introSoundEnvelope({sceneId:'arrival',promotion,elapsedMs,timeMs:242200+elapsedMs});
  assert.equal(at(start).music,1);assert.equal(at((start+end)/2).music,.5);
  assert.equal(at(end).music,0);assert.equal(at(end).room,0);assert.equal(at(end).garden,0);
 }
});

for(const webAudio of [true,false])test(`music output stays gated throughout dojo metadata and resumes (${webAudio?'Web Audio':'HTML audio fallback'})`,async()=>{
 const h=fixture({webAudio});h.sound.start();await h.sound.ready;await flush();
 const frame={sceneId:'question',elapsedMs:1000,timeMs:10000,playing:true};h.sound.update(frame);
 assert.equal(h.sound.snapshot().musicAudible,true);assert.equal(h.media.length,1);
 for(const sceneId of dojoScenes){
  h.sound.update({sceneId,elapsedMs:500,timeMs:149700,playing:true});
  h.media[0].emit('loadedmetadata');await flush();
  assert.equal(h.sound.snapshot().musicPlaying,true,'The same clock remains active');
  assert.equal(h.media[0].muted,true,sceneId);
  if(webAudio)assert.equal(h.gains[0].gain.value,0);else assert.equal(h.media[0].volume,0);
  assert.equal(h.sound.snapshot().musicAudible,false);
  h.sound.pause();await flush();h.sound.resume();await flush();
  assert.equal(h.media[0].muted,true);assert.equal(h.sound.snapshot().musicGain,0);
 }
 h.sound.update({sceneId:'arrival',elapsedMs:0,timeMs:242200,playing:true});
 assert.equal(h.media[0].muted,true,'No burst at garden entry');
 h.sound.update({sceneId:'arrival',elapsedMs:900,timeMs:243100,playing:true});
 assert.equal(h.sound.snapshot().musicGain,.5);assert.equal(h.media[0].muted,false);
 assert.equal(h.sound.snapshot().musicAudible,true);assert.equal(h.media.length,1);
 assert.deepEqual(h.problems,[]);
});

test('pause silences output until a playing frame resumes, including late metadata',async()=>{
 const h=fixture();h.sound.start();await h.sound.ready;await flush();
 h.sound.update({sceneId:'question',elapsedMs:1000,timeMs:10000,playing:true});
 h.sound.pause();h.media[0].emit('loadedmetadata');await flush();
 assert.equal(h.media[0].paused,true);assert.equal(h.media[0].muted,true);assert.equal(h.gains[0].gain.value,0);
 const plays=h.media[0].plays;
 h.sound.update({sceneId:'dojo-arrivee',elapsedMs:0,timeMs:149200,playing:false});
 assert.equal(h.media[0].plays,plays);assert.equal(h.sound.snapshot().musicAudible,false);
 h.sound.update({sceneId:'dojo-arrivee',elapsedMs:0,timeMs:149200,playing:true});await flush();
 assert.equal(h.media[0].paused,false);assert.equal(h.media[0].muted,true);assert.equal(h.context.state,'running');
});

test('skip is terminal even if playback, metadata or decoding completes later',async()=>{
 const h=fixture({waitForBuffers:true});h.sound.start();h.sound.stop();
 h.releaseBuffers();await h.sound.ready;await flush();
 const plays=h.media[0].plays;
 h.media[0].emit('loadedmetadata');h.sound.resume();h.sound.unlock();h.sound.start();
 h.sound.update({sceneId:'arrival',elapsedMs:2000,timeMs:244200,playing:true});await flush();
 assert.equal(h.sound.snapshot().active,false);assert.equal(h.sound.snapshot().stopped,true);
 assert.equal(h.media[0].plays,plays);assert.equal(h.media[0].paused,true);assert.equal(h.media[0].muted,true);
 assert.equal(h.sources.length,0,'Late decoded ambience never starts');
});

test('stop before Commencer does not create or restart audio, and dispose is safe',async()=>{
 const h=fixture();h.sound.stop();h.sound.start();h.sound.unlock();h.sound.dispose();h.sound.dispose();await flush();
 assert.equal(h.media.length,0);assert.equal(h.sound.snapshot().disposed,true);assert.equal(h.sources.length,0);
});

test('approved footsteps and selection sounds remain active while dojo music is muted',async()=>{
 const h=fixture();h.sound.start();await h.sound.ready;await flush();
 const frame=(elapsedMs,cycles)=>({sceneId:'dojo-deplacement',elapsedMs,timeMs:170000+elapsedMs,playing:true,actors:[{id:'marianne',gait:{cycles,strength:1}}]});
 h.sound.update(frame(100,.48));h.sound.update(frame(120,.52));
 assert.equal(h.sound.snapshot().playedCues,1);assert.equal(h.sound.snapshot().musicGain,0);
 h.sound.update({sceneId:'dojo-vetements',elapsedMs:850,timeMs:210000,playing:true,wardrobe:{ready:true,lookIndex:0}});
 h.sound.update({sceneId:'dojo-vetements',elapsedMs:950,timeMs:210100,playing:true,wardrobe:{ready:true,lookIndex:1}});
 assert.equal(h.sound.snapshot().playedCues,3,'Selection and cloth supplement the contact');
 assert.equal(h.media[0].muted,true);assert.equal(h.sound.snapshot().activeOneShots,2);
 h.sound.pause();assert.equal(h.sound.snapshot().activeOneShots,0);
});

test('foot contacts use both characters and do not repeat, catch up after pauses, or fire on seeks',()=>{
 const cues=createIntroSoundCues();
 const frame=(elapsedMs,cycles,playing=true)=>({sceneId:'dojo-deplacement',elapsedMs,playing,actors:['marianne','ahmed'].map(id=>({id,gait:{cycles,strength:1}}))});
 assert.deepEqual(cues.update(frame(100,.48)),[]);
 const contacts=cues.update(frame(120,.52));assert.deepEqual(contacts.map(c=>c.actor),['marianne','ahmed']);
 assert.deepEqual(cues.update(frame(140,.54)),[]);
 assert.deepEqual(cues.update(frame(160,.54,false)),[]);
 assert.deepEqual(cues.update(frame(180,1.1,true)),[]);
 assert.deepEqual(cues.update(frame(10000,5,true)),[]);
 assert.deepEqual(cues.update(frame(200,.8,true)),[]);
});

test('half-turn contacts follow planted feet without losing changes to mutable animation state',()=>{
 const cues=createIntroSoundCues(),gait={footwork:{feet:[{side:'left',planted:false},{side:'right',planted:true}]}};
 const frame=elapsedMs=>({sceneId:'dojo-demi-tour',elapsedMs,playing:true,actors:[{id:'ahmed',gait}]});
 cues.update(frame(100));gait.footwork.feet[0].planted=true;
 assert.equal(cues.update(frame(120))[0]?.kind,'pivot');
 assert.deepEqual(cues.update(frame(140)),[]);
});

test('late asset readiness never replays old movements or body selection cues',async()=>{
 const h=fixture({waitForBuffers:true});h.sound.start();await flush();
 h.sound.update({sceneId:'dojo-personnaliser',elapsedMs:900,timeMs:188000,playing:true,wardrobe:{ready:false,castIndex:0}});
 h.sound.update({sceneId:'dojo-personnaliser',elapsedMs:1000,timeMs:188100,playing:true,wardrobe:{ready:false,castIndex:1}});
 h.releaseBuffers();await h.sound.ready;await flush();
 h.sound.update({sceneId:'dojo-personnaliser',elapsedMs:1020,timeMs:188120,playing:true,wardrobe:{ready:true,castIndex:1}});
 assert.equal(h.sound.snapshot().playedCues,0);
 h.sound.update({sceneId:'dojo-personnaliser',elapsedMs:1120,timeMs:188220,playing:true,wardrobe:{ready:true,castIndex:2}});
 assert.equal(h.sound.snapshot().playedCues,2);assert.equal(h.media[0].muted,true);
});

test('wings and angel-mode cues align with their visible animation and do not repeat',()=>{
 const cues=createIntroSoundCues();
 const frame=elapsedMs=>({sceneId:'arrival',elapsedMs,playing:true});
 cues.update(frame(4900));assert.equal(cues.update(frame(5000))[0]?.kind,'wings');
 cues.update(frame(5300));assert.equal(cues.update(frame(5500))[0]?.kind,'angel-mode');
 assert.deepEqual(cues.update(frame(5520)),[]);
});
