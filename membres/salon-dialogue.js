import {scoreLine,articulation} from './salon-performance.js';
import {frenchVoice,createLocalVoices} from './salon-voice.js';

// One clock drives articulation, word emphasis, conversational gestures and camera cuts.
export function createDialogue({start,word,rest,wake,gender=()=>null,voiceStatus=()=>{},now=()=>performance.now()/1000,synth=globalThis.speechSynthesis}){
  const local=createLocalVoices(voiceStatus,wake);
  let active=null,next=null,utterance=null,voiced=false,lastWord=-1;
  function stopNative(){
    if(!utterance)return;
    const previous=utterance;utterance=null;
    previous.onstart=previous.onboundary=previous.onend=previous.onerror=null;synth.cancel();
  }
  function stopVoice(){stopNative();local?.stop();}
  function finish(){
    stopVoice();if(active)rest(active.who);
    active=null;lastWord=-1;
    if(next){const ready=next;next=null;begin(ready);}
    wake();
  }
  function silent(current){
    current.started=false;current.waitUntil=0;current.origin=now()-(current.score.words[Math.max(0,lastWord)]?.start||0);
    voiceStatus('Les voix sont indisponibles. Tu peux continuer à lire les bulles.');wake();
  }
  function readLocal(current){
    current.triedLocal=true;
    local.speak({line:current.score,firstWord:Math.max(0,lastWord),gender:current.gender,rate:current.rate,
      end:()=>{if(active===current)finish();},
      error:()=>{if(active===current){if(synth&&!current.triedNative)readNative(current);else silent(current);}}
    });
  }
  function nativeFailure(current){
    if(active!==current)return;
    stopNative();current.waitUntil=0;current.started=false;
    if(local?.available&&!current.triedLocal)readLocal(current);else silent(current);
  }
  function readNative(current){
    current.triedNative=true;
    const line=current.score,offset=line.words[Math.max(0,lastWord)]?.index||0;
    if(!globalThis.SpeechSynthesisUtterance){nativeFailure(current);return;}
    const voice=new SpeechSynthesisUtterance(line.text.slice(offset));
    voice.lang='fr-FR';voice.rate=current.rate;
    const selected=frenchVoice(synth,current.gender,false);
    if(selected)voice.voice=selected;
    utterance=voice;current.waitUntil=now()+4;
    voice.onstart=()=>{
      if(utterance!==voice)return;
      current.started=true;current.waitUntil=0;current.voiceStart=now();
      current.origin=now()-(line.words[Math.max(0,lastWord)]?.start||0);voiceStatus('');wake();
    };
    voice.onboundary=e=>{
      if(utterance!==voice||e.name==='sentence')return;
      const index=offset+e.charIndex;
      const w=line.words.find(w=>w.index<=index&&index<w.index+w.length);
      if(w){current.origin=now()-w.start;current.started=true;current.waitUntil=0;current.voiceStart??=now();}
    };
    voice.onend=()=>{if(utterance===voice){utterance=null;finish();}};
    voice.onerror=()=>{if(utterance===voice){utterance=null;nativeFailure(current);}};
    try{synth.speak(voice);}catch{utterance=null;nativeFailure(current);}
  }
  function readAloud(){
    if(!voiced||!active)return;
    const current=active;
    current.triedNative=false;current.triedLocal=false;
    const voice=frenchVoice(synth,current.gender);
    const installed=voice?.localService&&(/premium|enhanced|amélior|neural|natural/i.test(voice.name)||globalThis.navigator?.connection?.saveData);
    if(local?.available&&!installed)readLocal(current);
    else if(synth)readNative(current);
    else silent(current);
  }
  function begin(record){
    active={...record,gender:gender(record.who),score:scoreLine(record.text,record.rate),origin:now(),waitUntil:0,started:false};
    lastWord=-1;start(record.who,record.text);readAloud();wake();
  }
  function clear(){next=null;stopVoice();if(active)rest(active.who);active=null;lastWord=-1;}
  return {
    clear,
    dispose(){clear();local?.disable();},
    get busy(){return active!==null;},
    get supportsVoice(){return Boolean(local||synth&&globalThis.SpeechSynthesisUtterance);},
    play(who,text,rate,queue=false){
      const record={who,text,rate};
      if(queue&&active){next=record;return;}
      clear();begin(record);
    },
    voice(enabled,{temporary=false}={}){
      const at=local?.position()?.time;voiced=enabled;stopVoice();voiceStatus('');
      if(enabled)local?.unlock(!temporary);else if(!temporary)local?.disable();
      if(active){
        if(at!=null)active.origin=now()-at;
        active.waitUntil=0;active.started=false;
        if(enabled)readAloud();
      }
      wake();
    },
    frame(){
      if(!active)return null;
      const t=now(),audio=local?.position();
      if(active.waitUntil){
        if(t<active.waitUntil)return null;
        nativeFailure(active);return null;
      }
      const elapsed=audio?.time??Math.max(0,t-active.origin);
      const reading=audio||active.started&&synth?.speaking&&t-active.voiceStart<Math.max(30,active.score.duration*4);
      if(elapsed>=active.score.duration&&!reading){finish();return null;}
      const pose=articulation(active.score,elapsed);
      if(pose.word!==lastWord){
        lastWord=pose.word;word(active.who,active.score.words[lastWord]);
      }
      if(audio){pose.jaw*=audio.energy;pose.round*=audio.energy;pose.spread*=audio.energy;}
      return {...pose,who:active.who,line:active.score};
    }
  };
}
