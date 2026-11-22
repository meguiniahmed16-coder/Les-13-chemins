import {conversationAudio,recordedPhrase,reactionAfter} from './conversation-reactions.js';
import {scoreLine,articulation} from './salon-performance.js';
import {frenchVoice,createLocalVoices} from './salon-voice.js?v=salon41';

// One clock drives articulation, word emphasis, conversational gestures and camera cuts.
export function createDialogue({start,word,rest,wake,gender=()=>null,voiceStatus=()=>{},now=()=>performance.now()/1000,synth=globalThis.speechSynthesis}){
  const local=createLocalVoices(voiceStatus,wake);
  const studio=conversationAudio();let reaction=null,lastReaction=-Infinity;
  let active=null,next=null,utterance=null,voiced=false,micOpen=false,lastWord=-1;
  // Browsers may populate the installed voice list after the first request.
  synth?.getVoices?.();
  function stopNative(){
    if(!utterance)return;
    const previous=utterance;utterance=null;
    previous.onstart=previous.onboundary=previous.onend=previous.onerror=null;synth.cancel();
  }
  function stopVoice(){stopNative();local?.stop();}
  function finish(){
    const ended=active;stopVoice();studio.stop();if(ended)rest(ended.who);active=null;lastWord=-1;
    if(ended&&now()-lastReaction>4.2){
      const cue=reactionAfter(ended.text);
      if(cue){
        reaction={...cue,who:ended.who,origin:now()};lastReaction=now();
        if(voiced&&cue.clip&&ended.gender==='femme'&&!micOpen){
          const pending=reaction;studio.play(cue.clip).then(ok=>{if(ok&&reaction===pending)reaction.origin=now();});
        }
      }
    }
    if(next&&!reaction?.clip){const record=next;next=null;begin(record);}wake();
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
    const selected=frenchVoice(synth,current.gender,true,true)||frenchVoice(synth,current.gender,false);
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
    if(current.clip&&!current.recordFailed){
      current.waitRecording=true;
      studio.play(current.clip).then(ok=>{if(active!==current||!voiced)return;current.waitRecording=false;
        if(ok){current.origin=now();current.recording=true;}else{current.recordFailed=true;readAloud();}wake();});return;
    }
    const installed=frenchVoice(synth,current.gender,true,true);
    if(local?.available&&!installed)readLocal(current);
    else if(synth)readNative(current);
    else silent(current);
  }
  function begin(record){
    active={...record,gender:gender(record.who),score:scoreLine(record.text,record.rate),origin:now(),waitUntil:0,started:false};
    active.clip=active.gender==='femme'?recordedPhrase(record.text):null;lastWord=-1;start(record.who,record.text);readAloud();wake();
  }
  function clear(){reaction=null;studio.stop();next=null;stopVoice();if(active)rest(active.who);active=null;lastWord=-1;}
  return {
    clear,
    dispose(){clear();micOpen=false;local?.disable();},
    get busy(){return active!==null||reaction!==null;},
    get supportsVoice(){return Boolean(local||synth&&globalThis.SpeechSynthesisUtterance);},
    play(who,text,rate,queue=false){
      const record={who,text,rate};
      if((micOpen&&voiced)||(queue&&(active||reaction?.clip))){next=record;return;}
      clear();begin(record);
    },
    microphone(open){
      micOpen=open;
      if(open){reaction=null;studio.stop();}
      if(open&&voiced){
        // Interrupt the current line. A reply already queued can wait for the microphone to close.
        const waiting=next;clear();next=waiting;
      }else if(!open&&!active&&next){
        const waiting=next;next=null;begin(waiting);
      }
    },
    voice(enabled){
      const at=local?.position()?.time;voiced=enabled;studio.stop();if(active){active.waitRecording=false;active.recording=false;}stopVoice();voiceStatus('');
      if(enabled){
        studio.prepare();        local?.unlock(true);
        if(!frenchVoice(synth,gender('guest'),true,true))local?.prepare();
      }else local?.disable();
      if(active){
        if(at!=null)active.origin=now()-at;
        active.waitUntil=0;active.started=false;
        if(enabled)readAloud();
      }
      wake();
    },
    frame(){
      const t=now();
      if(reaction&&t-reaction.origin>=reaction.duration){
        reaction=null;if(next&&!active&&!micOpen){const record=next;next=null;begin(record);}
      }
      const mood=reaction?{who:reaction.who,name:reaction.name,age:Math.max(0,t-reaction.origin),recordingTime:reaction.clip?reaction.clip[0]+Math.max(0,t-reaction.origin):null}:null;
      const pause=mood?{who:null,line:null,jaw:0,round:0,spread:0,reaction:mood}:null;
      if(!active||active.waitRecording)return pause;
      const audio=local?.position();
      if(active.recording||active.clip&&!voiced){
        const clip=active.clip,elapsed=Math.max(0,t-active.origin),duration=clip[1]-clip[0];
        if(elapsed>=duration){finish();return pause;}
        const pose=articulation(active.score,elapsed*active.score.duration/duration);
        if(pose.word!==lastWord){lastWord=pose.word;word(active.who,active.score.words[lastWord]);}
        return {...pose,who:active.who,line:active.score,reaction:mood,recordingTime:clip[0]+elapsed};
      }
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
      return {...pose,who:active.who,line:active.score,reaction:mood};
    }
  };
}
