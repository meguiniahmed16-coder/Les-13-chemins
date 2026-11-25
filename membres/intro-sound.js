import {INTRO_SOUND_ASSETS} from './intro-sound-assets.js';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const number=n=>Number.isFinite(Number(n))?Number(n):0;
const gain=db=>10**(db/20);
const smooth=n=>{n=clamp(n,0,1);return n*n*(3-2*n);};
// Music is already mastered to -28 LUFS. These gains lower the approved
// working foley/ambience by the same 4 dB requested after the first MP4.
export const INTRO_SOUND_GAINS=Object.freeze({foley:gain(3),ambience:gain(-2)});
export const INTRO_SOUND_TIMING=Object.freeze({dojoStartMs:149200,gardenStartMs:264700,transitionMs:1800});

export function introSoundEnvelope({sceneId='',elapsedMs=0,timeMs=0,promotion=false}={}){
 const time=number(timeMs),elapsed=number(elapsedMs),garden=sceneId==='arrival';
 const dojo=String(sceneId).startsWith('dojo-')||sceneId==='jardin'||sceneId==='salon-invitation'||(!garden&&time>=INTRO_SOUND_TIMING.dojoStartMs&&time<INTRO_SOUND_TIMING.gardenStartMs);
 const opening=smooth(time/1200);
 // The final white-room shot fades out before the dojo appears. Every dojo
 // shot is music-free, including its final invitation to enter the garden.
 // The selected music returns only once the actual garden arrival is ready.
 const beforeDojo=1-smooth((time-(INTRO_SOUND_TIMING.dojoStartMs-INTRO_SOUND_TIMING.transitionMs))/INTRO_SOUND_TIMING.transitionMs);
 const end=promotion?20500:13000;
 const fade=promotion?5500:4000;
 const ending=garden?1-smooth((elapsed-(end-fade))/fade):1;
 const outside=garden?smooth(elapsed/INTRO_SOUND_TIMING.transitionMs):0;
 return {music:dojo?0:(garden?outside*ending:opening*beforeDojo),room:(1-outside)*ending,garden:outside*ending};
}

// Detect actual pose changes; no independent interval guesses the gait or
// schedules sounds across a pause. A long jump discards past cues entirely.
export function createIntroSoundCues({maxGapMs=250}={}){
 let previous=null,steps=0,pivots=0,cloth=0;
 const actorMap=frame=>new Map((frame.actors||[]).map(actor=>[actor.id,actor.gait||null]));
 function update(input={}){
  const frame={...input,sceneId:String(input.sceneId||''),elapsedMs:Math.max(0,number(input.elapsedMs)),playing:input.playing!==false};
  const before=previous;previous={...frame,actors:(frame.actors||[]).map(a=>({id:a.id,gait:a.gait?{...a.gait,footwork:a.gait.footwork?{...a.gait.footwork,feet:a.gait.footwork.feet?.map(f=>({...f}))}:null}:null})),wardrobe:frame.wardrobe?{...frame.wardrobe}:null};
  if(!before||!frame.playing||!before.playing||before.sceneId!==frame.sceneId)return[];
  const delta=frame.elapsedMs-before.elapsedMs;
  if(delta<0||delta>maxGapMs)return[];
  const cues=[],cross=at=>before.elapsedMs<at&&frame.elapsedMs>=at;
  const priorActors=actorMap(before);
  for(const actor of frame.actors||[]){
   const current=actor.gait,prior=priorActors.get(actor.id);
   if(!current||!prior)continue;
   if(current.footwork&&prior.footwork){
    const oldFeet=new Map((prior.footwork.feet||[]).map(f=>[f.side,f]));
    for(const foot of current.footwork.feet||[])if(foot.planted===true&&oldFeet.get(foot.side)?.planted===false){
     cues.push({clip:'pivot'+(pivots++%5+1),kind:'pivot',actor:actor.id});
    }
   }else if(!current.footwork&&!prior.footwork&&current.strength>.08&&prior.strength>.02){
    // The production walk solver lands on every half cycle. cycles is
    // absolute in the dojo; phase is absolute in the initial invitation.
    const a=Number.isFinite(prior.cycles)?prior.cycles:prior.phase,b=Number.isFinite(current.cycles)?current.cycles:current.phase;
    if(Number.isFinite(a)&&Number.isFinite(b)&&b>a&&b-a<.55&&Math.floor(b*2+1e-7)>Math.floor(a*2+1e-7)){
     cues.push({clip:'step'+(steps++%9+1),kind:'walk',actor:actor.id});
    }
   }
  }
  const a=before.wardrobe,b=frame.wardrobe;
  if(a&&b&&a.ready!==false&&b.ready!==false){
   const selection=frame.sceneId==='dojo-personnaliser'||frame.sceneId==='dojo-apparence';
   const changed=selection?b.castIndex>=0&&b.castIndex!==a.castIndex:frame.sceneId==='dojo-vetements'&&b.lookIndex!==a.lookIndex;
   if(changed){
    cues.push({clip:'selection',kind:selection?'body-selection':'wardrobe-selection'});
    cues.push({clip:'cloth'+(cloth++%3+1),kind:'cloth',level:selection?gain(-3):1});
   }
  }
  if(frame.sceneId==='dojo-enregistrer'&&cross(2200))cues.push({clip:'selection',kind:'save'});
  if(frame.sceneId==='salon-invitation'){
   if(cross(2500)||cross(8200)||cross(10500))cues.push({clip:'selection',kind:'invitation-choice'});
   if(cross(3600)||cross(11200))cues.push({clip:'cloth'+(cloth++%3+1),kind:'invitation-appearance',level:gain(-3)});
  }
  if(frame.sceneId==='arrival'){
   if(cross(5000))cues.push({clip:'wings',kind:'wings'});
   if(cross(5500))cues.push({clip:'selection',kind:'angel-mode'});
  }
  return cues;
 }
 return {update,reset(){previous=null;steps=pivots=cloth=0;}};
}

export function createIntroSound({
 assets=INTRO_SOUND_ASSETS,
 audioFactory=src=>typeof globalThis.Audio==='function'?new globalThis.Audio(src):null,
 contextFactory=()=>{const Context=globalThis.AudioContext||globalThis.webkitAudioContext;return Context?new Context():null;},
 fetcher=(...args)=>globalThis.fetch(...args),onProblem=()=>{}
}={}){
 let context=null,music=null,musicGain=null,active=false,stopped=false,disposed=false,paused=true,blocked=false,playPending=false,resumePending=false;
 let frame={sceneId:'',elapsedMs:0,timeMs:0,playing:false},loading=null,generation=0,played=0;
 const buffers=new Map(),loops=new Map(),oneShots=new Set(),reported=new Set(),cues=createIntroSoundCues();
 const report=(key,error)=>{if(disposed||reported.has(key))return;reported.add(key);try{onProblem(String(error?.message||error||key));}catch{}};
 const wanted=()=>active&&!disposed&&!paused&&frame.playing!==false;
 function setGain(parameter,value){
  if(!parameter)return;
  if(typeof parameter.setValueAtTime==='function')parameter.setValueAtTime(value,context?.currentTime||0);
  else parameter.value=value;
 }
 function stopShots(){for(const source of oneShots){try{source.stop();source.disconnect();}catch{}}oneShots.clear();}
 function pausePlayback(){
  if(music){music.muted=true;music.pause();}if(musicGain)setGain(musicGain.gain,0);stopShots();
  if(context?.state==='running')try{Promise.resolve(context.suspend()).catch(()=>{});}catch{}
 }
 function musicClock(){
  if(!music)return;
  const envelope=wanted()?introSoundEnvelope(frame).music:0;
  // Both output paths enforce the dojo silence, including metadata events
  // and resume callbacks. Muting does not disturb the shared music clock.
  music.muted=envelope===0;
  if(musicGain)setGain(musicGain.gain,envelope);else music.volume=envelope;
  const at=Math.max(0,number(frame.timeMs)/1000);
  // Keep the same element and clock while the dojo music is muted.
  // Seeking only corrects genuine drift or an explicit jump.
  if(Number.isFinite(music.currentTime)&&Math.abs(music.currentTime-at)>.65){try{music.currentTime=at;}catch{}}
 }
 function playMusic(){
  if(!music||!wanted())return;
  musicClock();
  if(!music.paused||playPending||blocked)return;
  try{
   playPending=true;
   Promise.resolve(music.play()).then(()=>{playPending=false;if(!wanted())music.pause();},error=>{playPending=false;blocked=true;if(error?.name!=='NotAllowedError')report('music',error);});
  }catch(error){playPending=false;blocked=true;if(error?.name!=='NotAllowedError')report('music',error);}
 }
 function loop(key){
  if(!wanted()||!context||context.state!=='running'||loops.has(key)||!buffers.has(key))return;
  try{
   const source=context.createBufferSource(),level=context.createGain();source.buffer=buffers.get(key);source.loop=true;
   level.gain.value=0;source.connect(level);level.connect(context.destination);
   const cursor=key==='garden'?number(frame.elapsedMs):number(frame.timeMs);
   source.start(0,Math.max(0,cursor/1000)%source.buffer.duration);loops.set(key,{source,level});
  }catch(error){report('ambience-'+key,error);}
 }
 function ambience(){
  if(!wanted())return;
  loop('room');loop('garden');const env=introSoundEnvelope(frame);
  for(const [key,item]of loops)setGain(item.level.gain,INTRO_SOUND_GAINS.ambience*env[key]);
 }
 async function prepareBuffers(){
  if(loading||!context)return loading;
  const token=generation;
  loading=Promise.all(['foley','room','garden'].map(async key=>{
   try{
    const response=await fetcher(assets[key],{credentials:'same-origin'});
    if(!response.ok)throw Error('Son indisponible : '+key+' (HTTP '+response.status+').');
    const bytes=await response.arrayBuffer(),buffer=await context.decodeAudioData(bytes);
    if(disposed||token!==generation)return;
    buffers.set(key,buffer);ambience();
   }catch(error){report('load-'+key,error);}
  }));
  return loading;
 }
 function ensure(){
  if(disposed)return;
  if(!context)try{context=contextFactory();}catch(error){report('context',error);}
  if(!music)try{
   music=audioFactory(assets.music);
   if(music){
    music.preload='auto';music.loop=false;music.muted=true;music.volume=0;
    music.addEventListener?.('loadedmetadata',()=>{if(wanted()){musicClock();playMusic();}});
    music.addEventListener?.('error',()=>report('music','La musique n’a pas pu se charger.'));
    if(context?.createMediaElementSource){
     try{const source=context.createMediaElementSource(music);musicGain=context.createGain();musicGain.gain.value=0;source.connect(musicGain);musicGain.connect(context.destination);music.volume=1;}
     catch(error){musicGain=null;report('music-output',error);}
    }
   }
  }catch(error){report('music',error);}
  void prepareBuffers();
 }
 function unlock(){
  if(!active||stopped||disposed)return;
  ensure();blocked=false;
  // Both calls originate directly from the existing Commencer gesture.
  if(context&&context.state!=='running'&&context.state!=='closed'&&!resumePending)try{
   resumePending=true;
   Promise.resolve(context.resume()).then(()=>{resumePending=false;if(wanted())ambience();else if(context.state==='running')void context.suspend();},error=>{resumePending=false;report('resume',error);});
  }catch(error){resumePending=false;report('resume',error);}
  playMusic();ambience();
 }
 function playCue(cue){
  if(!wanted()||!context||context.state!=='running'||!buffers.has('foley'))return false;
  const clip=assets.clips?.[cue.clip];if(!clip)return false;
  const buffer=buffers.get('foley'),lead=Math.max(0,number(clip.contactOffset)-.010),offset=number(clip.offset)+lead;
  const duration=Math.min(number(clip.duration)-lead,buffer.duration-offset);
  if(offset<0||duration<=.008)return false;
  try{
   const source=context.createBufferSource(),level=context.createGain(),at=context.currentTime;
   source.buffer=buffer;source.connect(level);level.connect(context.destination);
   const value=INTRO_SOUND_GAINS.foley*(cue.level??1);
   level.gain.setValueAtTime(0,at);level.gain.linearRampToValueAtTime(value,at+.004);
   level.gain.setValueAtTime(value,at+duration-.004);level.gain.linearRampToValueAtTime(0,at+duration);
   source.onended=()=>{oneShots.delete(source);try{source.disconnect();level.disconnect();}catch{}};
   oneShots.add(source);source.start(at,offset,duration);played++;return true;
  }catch(error){report('cue',error);return false;}
 }
 function update(input={}){
  if(!active||disposed)return;
  const prior=frame;
  frame={...input,sceneId:String(input.sceneId||''),elapsedMs:Math.max(0,number(input.elapsedMs)),timeMs:Math.max(0,number(input.timeMs)),playing:input.playing!==false};
  const events=cues.update(frame);
  if(prior.sceneId!==frame.sceneId||frame.elapsedMs<prior.elapsedMs||frame.elapsedMs-prior.elapsedMs>250)stopShots();
  if(!frame.playing){if(!paused){paused=true;pausePlayback();}return;}
  if(paused){paused=false;unlock();}
  else if(context?.state==='suspended'&&!resumePending)unlock();
  musicClock();playMusic();ambience();
  for(const event of events)playCue(event);
 }
 return {
  start({timeMs=0}={}){
   if(active||stopped||disposed)return;
   active=true;paused=false;frame={sceneId:'',elapsedMs:0,timeMs:Math.max(0,number(timeMs)),playing:true};cues.reset();unlock();
  },
  unlock,update,
  pause(){if(!active||disposed)return;paused=true;frame={...frame,playing:false};cues.update(frame);pausePlayback();},
  resume(){if(!active||disposed)return;paused=false;frame={...frame,playing:true};cues.update(frame);unlock();},
  stop(){
   stopped=true;active=false;paused=true;frame={...frame,playing:false};cues.reset();pausePlayback();
   for(const {source,level}of loops.values())try{source.stop();source.disconnect();level.disconnect();}catch{}
   loops.clear();if(musicGain)setGain(musicGain.gain,0);else if(music)music.volume=0;
  },
  dispose(){this.stop();disposed=true;++generation;try{music?.removeAttribute?.('src');music?.load?.();}catch{}if(context?.close)void Promise.resolve(context.close()).catch(()=>{});buffers.clear();},
  get ready(){return loading||Promise.resolve();},
  snapshot(){const musicPlaying=!!music&&!music.paused&&wanted(),musicLevel=wanted()?introSoundEnvelope(frame).music:0;return {active,paused,blocked,stopped,disposed,sceneId:frame.sceneId,timeMs:frame.timeMs,musicTime:music?.currentTime||0,musicPlaying,musicGain:musicLevel,musicMuted:music?.muted??true,musicAudible:musicPlaying&&!music?.muted&&musicLevel>0,contextState:context?.state||'unavailable',buffers:[...buffers.keys()],playedCues:played,activeOneShots:oneShots.size};}
 };
}
