// Original cinematic: use the authenticated ElevenLabs account, never Android TTS.
// The server keeps its API key. No synthesized speech is cached outside this tab.
import {voiceRequest} from './salon-conversation.js?v=eleven68';
import {createRemoteSpeech} from './salon-conversation-audio.js?v=eleven68';

const maleNames=/\b(?:george|adam|brian|daniel|henry|charlie|thomas|antoine|pierre|mathieu|nicolas|alexandre|oliver|arthur|liam|paul)\b/i;
const femaleNames=/\b(?:rachel|alice|jessica|sarah|bella|charlotte|matilda|lily|clara|marianne|amelie|julie|lea|louise|marie|emma|sophie)\b/i;
export function selectIntroVoices(list){
 if(!Array.isArray(list))throw Error('La liste des voix ElevenLabs est indisponible.');
 const records=list.filter(v=>v&&typeof v.id==='string'&&/^[-A-Za-z0-9_]{1,80}$/.test(v.id));
 const pick=(gender,pattern,used)=>records.find(v=>v.gender===gender&&!used.has(v.id))||
   records.find(v=>!v.gender&&pattern.test(v.name||'')&&!used.has(v.id));
 const homme=pick('homme',maleNames,new Set());
 const femme=pick('femme',femaleNames,new Set(homme?[homme.id]:[]));
 if(!homme||!femme)throw Error('Sélectionne dans ElevenLabs une voix française masculine et une voix française féminine, puis recharge la cinématique.');
 return {m:homme.id,f:femme.id};
}

export function createIntroElevenLabs({
 request=voiceRequest,
 playerFactory=createRemoteSpeech,
 onState=()=>{},
 onError=()=>{}
}={}){
 let player=null,ready=null,voices=null,generation=0,playing=false,active=null,disposed=false;
 let energy=0,controller=null;
 const recordings=new Map(),pending=new Map();
 function ensurePlayer(){
  return player??=playerFactory({onEnergy:value=>{energy=value;onState({playing,energy});}});
 }
 function unlock(){return ensurePlayer().unlock();}
 function prepare(){
  if(!ready)ready=Promise.resolve().then(()=>request('voices')).then(data=>{
   voices=selectIntroVoices(data?.voices);return voices;
  }).catch(error=>{ready=null;throw error;});
  return ready;
 }
 function clipKey(id,text){return id+'|'+text;}
 async function getClip(id,text){
  const key=clipKey(id,text);
  if(recordings.has(key))return recordings.get(key);
  if(pending.has(key))return pending.get(key);
  const task=(async()=>{
   const selected=await prepare(),gender=id==='f'?'femme':'homme';
   const clip=await request('speech',{body:{text,gender,voiceId:selected[id],strict:true}});
   if(clip?.voiceProvider!=='elevenlabs')throw Error('ElevenLabs a refusé cette réplique : aucune voix de substitution ne sera utilisée.');
   if(!clip?.size)throw Error('ElevenLabs a renvoyé un enregistrement vide.');
   recordings.set(key,clip);return clip;
  })().finally(()=>pending.delete(key));
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
 async function speak(id,text){
  stop();
  if(disposed||!['m','f'].includes(id)||!text)return;
  const token=generation;active={id,text};onState({playing:false,energy:0,loading:true});
  try{
   const clip=await getClip(id,text);
   if(token!==generation||disposed)return;
   playing=true;onState({playing:true,energy:0,loading:false});
   await ensurePlayer().play(clip);
  }catch(error){
   if(token===generation&&!disposed&&error?.name!=='AbortError')onError(error?.message||'ElevenLabs est indisponible.');
  }finally{
   if(token===generation){playing=false;energy=0;onState({playing:false,energy:0,loading:false});}
  }
 }
 function pause(){if(active){player?.stop();playing=false;energy=0;onState({playing:false,energy:0});}}
 function resume(){if(active&&!playing)void speak(active.id,active.text);}
 function dispose(){stop();disposed=true;player?.dispose();recordings.clear();pending.clear();}
 return {unlock,prepare,prefetch,speak,stop,pause,resume,dispose,
  get energy(){return energy;},get playing(){return playing;},get voices(){return voices;}};
}
