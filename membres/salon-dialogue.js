import {conversationAudio,recordedPhrase,reactionAfter} from './conversation-reactions.js';
import {scoreLine,articulation} from './salon-performance.js';
import {voiceRequest} from './salon-conversation.js?v=eleven70';
import {createRemoteSpeech} from './salon-conversation-audio.js?v=call58';

// One clock drives articulation, word emphasis, conversational gestures and camera cuts.
export function createDialogue({start,word,rest,wake,gender=()=>null,voiceStatus=()=>{},now=()=>performance.now()/1000,allowRemote=()=>true,requestVoice=voiceRequest,remoteFactory=createRemoteSpeech}){
  const remote=remoteFactory({onEnergy:()=>wake(),onStatus:voiceStatus});
  const studio=conversationAudio();let reaction=null,lastReaction=-Infinity;
  let active=null,next=null,voiced=false,micOpen=false,lastWord=-1,readingAbort=null;
  function stopVoice(){readingAbort?.abort();readingAbort=null;remote.stop();}
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
  async function readAloud(){
    if(!voiced||!active||active.external||!allowRemote())return;
    const current=active,kind=current.gender;
    if(!['homme','femme'].includes(kind)){
      voiceStatus('La voix du personnage n’est pas définie.');return;
    }
    const abort=new AbortController();readingAbort=abort;current.waitRecording=true;
    try{
      const clip=await requestVoice('speech',{body:{text:current.text,gender:kind,strict:true},signal:abort.signal});
      if(active!==current||abort.signal.aborted||!voiced)return;
      if(clip?.voiceProvider!=='elevenlabs'&&clip?.voiceProvider!=='azure'&&clip?.voiceProvider!=='cartesia')throw Error('Le fournisseur vocal a renvoyé un son non reconnu.');
      current.external=remote;current.waitRecording=false;current.started=true;current.origin=now();
      voiceStatus('');wake();
      await remote.play(clip,{signal:abort.signal});
      if(active===current&&!abort.signal.aborted)finish();
    }catch(error){
      if(active!==current||abort.signal.aborted)return;
      current.waitRecording=false;current.external=null;voiced=false;
      voiceStatus('Voix : '+(error?.message||'synthèse indisponible.')+' Les bulles restent accessibles.');
      wake();
    }finally{if(readingAbort===abort)readingAbort=null;}
  }
  function begin(record){
    active={...record,gender:gender(record.who),score:scoreLine(record.text,record.rate),origin:now(),waitUntil:0,started:false};
    active.clip=!voiced&&!record.external&&active.gender==='femme'?recordedPhrase(record.text):null;lastWord=-1;start(record.who,record.text);readAloud();wake();
  }
  function clear(){reaction=null;studio.stop();next=null;stopVoice();const previous=active;active=null;if(previous){previous.external?.stop?.();rest(previous.who);}lastWord=-1;}
  return {
    clear,
    dispose(){clear();micOpen=false;remote.dispose();},
    get busy(){return active!==null||reaction!==null;},
    get supportsVoice(){return Boolean(allowRemote());},
    play(who,text,rate,queue=false){
      const record={who,text,rate};
      if((micOpen&&voiced)||(queue&&(active||reaction?.clip))){next=record;return;}
      clear();begin(record);
    },
    playExternal(who,text,external){
      clear();begin({who,text,rate:1,external});
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
      voiced=Boolean(enabled&&allowRemote());studio.stop();stopVoice();voiceStatus('');
      if(voiced&&!remote.unlock()){voiced=false;voiceStatus('Le son n’est pas disponible sur ce navigateur.');}
      if(active){active.waitRecording=false;active.started=false;
        if(active.external===remote)active.external=null;
        if(voiced)void readAloud();
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
      if(active.external){
        const position=active.external.position();
        if(!position)return {who:active.who,line:active.score,jaw:0,round:0,spread:0,reaction:null};
        const elapsed=Math.min(.99999,Math.max(0,position.fraction))*active.score.duration;
        const pose=articulation(active.score,elapsed);
        if(pose.word!==lastWord){lastWord=pose.word;word(active.who,active.score.words[lastWord]);}
        const energy=Math.max(0,Math.min(1,position.energy*45));
        pose.jaw*=energy;pose.round*=energy;pose.spread*=energy;
        return {...pose,who:active.who,line:active.score,reaction:null};
      }
      if(active.recording||active.clip&&!voiced){
        const clip=active.clip,elapsed=Math.max(0,t-active.origin),duration=clip[1]-clip[0];
        if(elapsed>=duration){finish();return pause;}
        const pose=articulation(active.score,elapsed*active.score.duration/duration);
        if(pose.word!==lastWord){lastWord=pose.word;word(active.who,active.score.words[lastWord]);}
        return {...pose,who:active.who,line:active.score,reaction:mood,recordingTime:clip[0]+elapsed};
      }
      const elapsed=Math.max(0,t-active.origin);
      const reading=false;
      if(elapsed>=active.score.duration&&!reading){finish();return null;}
      const pose=articulation(active.score,elapsed);
      if(pose.word!==lastWord){
        lastWord=pose.word;word(active.who,active.score.words[lastWord]);
      }
      pose.jaw=0;pose.round=0;pose.spread=0;
      return {...pose,who:active.who,line:active.score,reaction:mood};
    }
  };
}
