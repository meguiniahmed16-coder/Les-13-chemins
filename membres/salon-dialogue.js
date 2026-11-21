import {scoreLine,articulation} from './salon-performance.js';

// A single playback clock drives the mouth, word highlight, speaker gestures and camera cut.
export function createDialogue({start,word,rest,wake,now=()=>performance.now()/1000,synth=window.speechSynthesis}){
  let active=null,next=null,utterance=null,voiced=false,lastWord=-1;
  function stopVoice(){
    if(!utterance)return;
    const previous=utterance;utterance=null;
    previous.onstart=previous.onboundary=previous.onend=previous.onerror=null;synth.cancel();
  }
  function finish(){
    stopVoice();if(active)rest(active.who);
    active=null;lastWord=-1;
    if(next){const ready=next;next=null;begin(ready);}
    wake();
  }
  function readAloud(){
    if(!voiced||!synth||!active)return;
    const current=active,line=current.score;
    const offset=line.words[Math.max(0,lastWord)]?.index||0;
    const voice=new SpeechSynthesisUtterance(line.text.slice(offset));
    voice.lang='fr-FR';voice.rate=current.rate;
    const voices=synth.getVoices().filter(v=>/^fr(?:-|_|$)/i.test(v.lang));
    if(voices.length)voice.voice=voices[current.who==='guest'&&voices.length>1?1:0];
    utterance=voice;current.waitUntil=now()+1.1;
    voice.onstart=()=>{
      if(utterance!==voice)return;
      current.started=true;current.waitUntil=0;current.voiceStart=now();
      current.origin=now()-(line.words[Math.max(0,lastWord)]?.start||0);wake();
    };
    voice.onboundary=e=>{
      if(utterance!==voice||e.name==='sentence')return;
      const index=offset+e.charIndex;
      const w=line.words.find(w=>w.index<=index&&index<w.index+w.length);
      if(w){current.origin=now()-w.start;current.started=true;current.waitUntil=0;}
    };
    voice.onend=()=>{if(utterance===voice){utterance=null;finish();}};
    voice.onerror=()=>{if(utterance===voice){utterance=null;current.started=false;current.waitUntil=0;wake();}};
    try{synth.speak(voice);}catch{utterance=null;current.waitUntil=0;}
  }
  function begin(record){
    active={...record,score:scoreLine(record.text,record.rate),origin:now(),waitUntil:0,started:false};
    lastWord=-1;start(record.who,record.text);readAloud();wake();
  }
  function clear(){next=null;stopVoice();if(active)rest(active.who);active=null;lastWord=-1;}
  return {
    clear,
    get busy(){return active!==null;},
    play(who,text,rate,queue=false){
      const record={who,text,rate};
      if(queue&&active){next=record;return;}
      clear();begin(record);
    },
    voice(enabled){
      voiced=enabled;stopVoice();
      if(active){active.waitUntil=0;active.started=false;if(enabled)readAloud();}
      wake();
    },
    frame(){
      if(!active)return null;
      const t=now();
      if(active.waitUntil){
        if(t<active.waitUntil)return null;
        // Some devices expose speech synthesis but never start the utterance.
        stopVoice();active.waitUntil=0;active.origin=t;
      }
      const elapsed=Math.max(0,t-active.origin);
      // A slow device voice may still be speaking after the estimated duration.
      const reading=active.started&&synth?.speaking&&t-active.voiceStart<Math.max(30,active.score.duration*4);
      if(elapsed>=active.score.duration&&!reading){
        finish();return null;
      }
      const pose=articulation(active.score,elapsed);
      if(pose.word!==lastWord){
        lastWord=pose.word;word(active.who,active.score.words[lastWord]);
      }
      return {...pose,who:active.who,line:active.score};
    }
  };
}
