// Original cinematic: use the authenticated ElevenLabs account, never Android TTS.
// The server keeps its API key. No synthesized speech is cached outside this tab.
import {voiceRequest} from './salon-conversation.js?v=eleven68&rev=rencontres1';
import {createRemoteSpeech} from './salon-conversation-audio.js?v=eleven68';
import {selectIntroVoices} from './elevenlabs-voices.js?v=eleven72';

export function createIntroElevenLabs({
 request=voiceRequest,
 playerFactory=createRemoteSpeech,
 audioTap, clipCache,
 onState=()=>{},
 onError=()=>{},
 onNeedsSelection=()=>{}
}={}){
 let player=null,ready=null,voices=null,availableVoices=[],generation=0,playing=false,active=null,disposed=false,unavailable=null;
 let energy=0,controller=null;
 const recordings=new Map(),pending=new Map();
 function ensurePlayer(){
  return player??=playerFactory({audioTap,onEnergy:value=>{energy=value;onState({playing,energy});}});
 }
 function unlock(){return ensurePlayer().unlock();}
 const preferenceKey='croisee-cartesia-voix-v1';
 function preferred(){
  try{const value=JSON.parse(localStorage.getItem(preferenceKey)||'null');return value&&typeof value==='object'?value:null;}catch{return null;}
 }
 function prepare(){
  if(unavailable)throw Error(unavailable);
  if(!ready)ready=Promise.resolve().then(()=>request('voices')).then(data=>{
   availableVoices=Array.isArray(data?.voices)?data.voices:[];
   voices=selectIntroVoices(availableVoices,preferred());return voices;
  }).catch(error=>{
   ready=null;
   if(error?.code==='VOICE_SELECTION_REQUIRED')onNeedsSelection(availableVoices);
   else unavailable=error?.message||'Le service vocal est indisponible.';
   throw error;
  });
  return ready;
 }
 function assign(m,f){
  const chosen=selectIntroVoices(availableVoices,{m,f});
  if(chosen.m!==m||chosen.f!==f)throw Error('Choisis deux voix différentes, compatibles avec Ahmed et Marianne.');
  try{localStorage.setItem(preferenceKey,JSON.stringify(chosen));}catch{}
  unavailable=null;voices=chosen;ready=Promise.resolve(chosen);
  return chosen;
 }
 function clipKey(id,text){return id+'|'+text;}
 async function getClip(id,text){
  if(unavailable)throw Error(unavailable);
  const key=clipKey(id,text);
  if(recordings.has(key))return recordings.get(key);
  if(pending.has(key))return pending.get(key);
  const task=(async()=>{
   const selected=await prepare(),gender=id==='f'?'femme':'homme',cacheKey='cartesia|'+selected[id]+'|'+text;
   const saved=await clipCache?.read(cacheKey);if(saved){recordings.set(key,saved);return saved;}
   const clip=await request('speech',{body:{text,gender,voiceId:selected[id],strict:true,purpose:'cinema'}});
   if(clip?.voiceProvider!=='elevenlabs'&&clip?.voiceProvider!=='azure'&&clip?.voiceProvider!=='cartesia')throw Error('Le service vocal a refusé cette réplique : aucune voix de substitution ne sera utilisée.');
   if(!clip?.size)throw Error('Le service vocal a renvoyé un enregistrement vide.');
   recordings.set(key,clip);await clipCache?.write(cacheKey,clip);return clip;
  })().catch(error=>{
   if([429,503].includes(error?.status))unavailable=error.message||'Le service vocal est indisponible.';
   throw error;
  }).finally(()=>pending.delete(key));
  pending.set(key,task);return task;
 }
 function prefetch(id,text){
  if(disposed||!['m','f'].includes(id)||!text)return;
  void getClip(id,text).catch(()=>{}); // The visible cue reports an actionable failure.
 }
 function stop(){
  generation++;active=null;playing=false;energy=0;
  player?.stop();onState({playing:false,energy:0});
 }
 async function speak(id,text,maxDurationMs){
  stop();
  if(disposed||!['m','f'].includes(id)||!text)return;
  const token=generation;active={id,text,maxDurationMs};onState({playing:false,energy:0,loading:true});
  try{
   const clip=await getClip(id,text);
   if(token!==generation||disposed)return;
   playing=true;onState({playing:true,energy:0,loading:false});
   await ensurePlayer().play(clip,{maxDurationMs});
  }catch(error){
   if(token===generation&&!disposed&&error?.name!=='AbortError')onError(error?.message||'Le service vocal est indisponible.');
  }finally{
   if(token===generation){playing=false;energy=0;onState({playing:false,energy:0,loading:false});}
  }
 }
 function pause(){if(active){player?.stop();playing=false;energy=0;onState({playing:false,energy:0});}}
 function resume(){if(active&&!playing)void speak(active.id,active.text,active.maxDurationMs);}
 function dispose(){stop();disposed=true;player?.dispose();recordings.clear();pending.clear();}
 async function prepareClips(cues,progress=()=>{}){await prepare();for(let i=0;i<cues.length;i++){await getClip(cues[i].id,cues[i].text);progress(i+1,cues.length);}return true;}
 return {unlock,prepare,assign,prefetch,prepareClips,speak,stop,pause,resume,dispose,
  get energy(){return energy;},get playing(){return playing;},get voices(){return voices;}};
}
