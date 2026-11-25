import {createVoiceCapture,createRemoteSpeech} from './salon-conversation-audio.js?v=call58';

const paths=new Set(['status','voices','settings','transcribe','reply','speech']);
const messages={starting:'Connexion du micro…',listening:'Je t’écoute…',transcribing:'J’ai entendu ta phrase…',thinking:'Le personnage te répond…',preparing:'La voix arrive…',speaking:'Le personnage parle. Touche le micro pour intervenir.',paused:'Micro coupé.',idle:''};
const abortError=()=>new DOMException('Conversation interrompue.','AbortError');

// Same-origin, authenticated routes only. No provider key is sent to the phone.
export async function voiceRequest(path,{body,signal}={}){
  if(!paths.has(path))throw new Error('Demande vocale invalide.');
  const binary=body instanceof Blob;
  const headers=body===undefined?{}:{'content-type':binary?body.type:'application/json'};
  const timeout=AbortSignal.timeout(path==='transcribe'||path==='reply'?55000:45000);
  const response=await fetch('/api/membres/voice/'+path,{
    method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',headers,
    body:body===undefined?undefined:binary?body:JSON.stringify(body),
    signal:signal?AbortSignal.any([signal,timeout]):timeout
  });
  if(!response.ok){
    const data=await response.json().catch(()=>({}));
    const error=new Error(data.error||'La conversation vocale est momentanément indisponible.');
    error.status=response.status;throw error;
  }
  if(path!=='speech')return response.json();
  if(!/^audio\//i.test(response.headers.get('content-type')||''))throw new Error('La réponse vocale est indisponible.');
  const reader=response.body.getReader(),chunks=[];let length=0;
  try{
    for(;;){
      const {done,value}=await reader.read();if(done)break;
      length+=value.byteLength;
      if(length>4*1024*1024){await reader.cancel();throw new Error('La réponse vocale est trop longue.');}
      chunks.push(value);
    }
  }finally{reader.releaseLock();}
  const clip=new Blob(chunks,{type:response.headers.get('content-type')});
  clip.voiceProvider=response.headers.get('x-voice-provider')||'elevenlabs';
  return clip;
}

// This mode deliberately owns its capture, separately from editable dictation.
// One turn at a time; every continuation checks both session and turn identity.
export function createVoiceConversation({
  character,onQuestion=()=>{},onAnswer=()=>{},onAudio=()=>{},onIdle=()=>{},
  onState=()=>{},onStatus=()=>{},request=voiceRequest,
  captureFactory=createVoiceCapture,speechFactory=createRemoteSpeech,
  page=globalThis.document,windowTarget=globalThis.window,
  setTimer=setTimeout,clearTimer=clearTimeout,maxSessionMs=10*60*1000
}){
  const speech=speechFactory({onStatus});
  let session=null,state='idle',lastVoice='',status=null,voices=[],loading=null;
  const active=()=>Boolean(session);
  function setState(value,text=messages[value]){state=value;onState(value);onStatus(text||'');}
  function cancelTurn(run){
    if(!run)return;
    const previous=run.turn;run.turn=null;
    previous?.abort.abort();previous?.capture?.stop();speech.stop();onIdle();
  }
  function unlisten(){page?.removeEventListener('visibilitychange',hidden);windowTarget?.removeEventListener('pagehide',leave);}
  function end(next='idle',message=''){
    const previous=session;session=null;
    if(previous){clearTimer(previous.timer);cancelTurn(previous);}
    unlisten();setState(next,message||messages[next]);
  }
  function hidden(){if(page?.hidden&&session)end('paused','Micro coupé quand tu quittes cet écran. Touche « Reprendre » pour continuer.');}
  function leave(){if(session)end('paused','Micro coupé.');}
  function valid(run,turn){
    return session===run&&run.turn===turn&&!turn.abort.signal.aborted&&String(character()?.id)===run.characterId;
  }
  function problem(run,error){
    if(session!==run)return;
    const message=error?.name==='AbortError'||error?.name==='TimeoutError'?'La connexion a été interrompue. Touche « Reprendre » pour réessayer.':error?.message||'La conversation a été interrompue.';
    end('paused',message);
  }
  async function exchange(run,turn,clip){
    if(!valid(run,turn)||turn.sent)return;
    turn.sent=true;turn.capture.stop();
    try{
      setState('transcribing');
      const result=await request('transcribe',{body:clip,signal:turn.abort.signal});
      if(!valid(run,turn))return;
      const question=String(result.text||'').trim();
      if(!question)throw new Error('Je n’ai pas reconnu de paroles. Touche « Reprendre » pour réessayer.');
      if(question.length>1600)throw new Error('Cette prise de parole est trop longue. Reprends avec une phrase plus courte.');
      onQuestion(question);setState('thinking');
      const current=character();
      const reply=await request('reply',{body:{characterId:run.characterId,message:question,history:(current.history||[]).slice(-8).map(t=>({question:t.question,answer:t.answer}))},signal:turn.abort.signal});
      if(!valid(run,turn))return;
      const answer=String(reply.answer||'').trim();
      if(!answer)throw new Error('La réponse n’a pas pu arriver.');
      onAnswer(question,answer);setState('preparing');
      const speechBody={text:answer,gender:current.gender};
      if(run.voiceId)speechBody.voiceId=run.voiceId;
      const clipReply=await request('speech',{body:speechBody,signal:turn.abort.signal});
      if(!valid(run,turn))return;
      setState('speaking',clipReply.voiceProvider==='openai'?'Le personnage te répond avec la voix OpenAI de secours.':messages.speaking);onAudio(answer,speech);
      await speech.play(clipReply,{signal:turn.abort.signal});
      if(!valid(run,turn))return;
      onIdle();await listen(run);
    }catch(error){if(valid(run,turn))problem(run,error);}
  }
  async function listen(run){
    if(session!==run)return;
    if(String(character()?.id)!==run.characterId){end('idle');return;}
    cancelTurn(run);
    const turn={abort:new AbortController(),capture:null,sent:false};run.turn=turn;
    turn.capture=captureFactory({
      audioContext:speech.context,
      onClip:clip=>{void exchange(run,turn,clip);},
      onStatus:message=>{if(valid(run,turn))onStatus(message);},
      onError:error=>{if(valid(run,turn))problem(run,error);}
    });
    if(turn.capture.supported===false){problem(run,new Error('Ce navigateur ne permet pas la conversation vocale. La dictée du clavier reste disponible.'));return;}
    setState('starting');
    try{
      await turn.capture.start();
      if(valid(run,turn)&&!turn.sent)setState('listening');
    }catch(error){if(valid(run,turn))problem(run,error);}
  }
  async function refresh({withVoices=true}={}){
    loading?.abort();const abort=new AbortController();loading=abort;
    try{
      const next=await request('status',{signal:abort.signal});
      if(loading!==abort)throw abortError();
      status=next;voices=[];let voiceError='';
      if(next.ready&&withVoices){
        try{
          const data=await request('voices',{signal:abort.signal});
          if(loading!==abort)throw abortError();
          voices=Array.isArray(data.voices)?data.voices:[];
        }catch(error){
          if(loading!==abort||error.name==='AbortError'||[401,403].includes(error.status))throw error;
          voiceError=error.message||'Impossible de retrouver les voix. Vérifie la connexion ElevenLabs.';
        }
      }
      return {status,voices,voiceError};
    }finally{if(loading===abort)loading=null;}
  }
  async function start(voiceId=lastVoice){
    end('idle');
    const current=character();
    if(!current?.id)return;
    // Unlock audio synchronously during the user's press, before network work.
    if(speech.unlock()===false){setState('paused','Le son est indisponible sur cet appareil.');return;}
    const run={characterId:String(current.id),voiceId,turn:null,timer:null};session=run;lastVoice=voiceId;
    setState('starting','Vérification de la conversation…');
    page?.addEventListener('visibilitychange',hidden);windowTarget?.addEventListener('pagehide',leave);
    if(page?.hidden){hidden();return;}
    const turn={abort:new AbortController(),capture:null};run.turn=turn;
    run.timer=setTimer(()=>{if(session===run)end('paused','Micro coupé après dix minutes. Tu peux reprendre la conversation.');},maxSessionMs);
    try{
      const available=status?.ready?status:await request('status',{signal:turn.abort.signal});
      if(!valid(run,turn))return;
      if(!available.ready)throw new Error('Le compte OpenAI doit être relié pour parler.');
      if(voiceId&&!voices.some(voice=>voice.id===voiceId))throw new Error('Cette voix n’est plus disponible.');
      if(!voiceId&&!['homme','femme'].includes(current.gender))throw new Error('Le personnage n’a pas de voix masculine ou féminine identifiée.');
      await listen(run);
    }catch(error){if(valid(run,turn))problem(run,error);}
  }
  return {
    refresh,start,
    pause:()=>end('paused','Micro coupé. Touche « Reprendre » pour continuer.'),
    stop(message=''){loading?.abort();loading=null;end('idle',message);},
    interrupt(){if(session)void listen(session);},
    finishTurn(){if(state==='listening')session?.turn?.capture?.finish();},
    dispose(){loading?.abort();loading=null;end('idle');speech.dispose();},
    get active(){return active();},get state(){return state;},get voices(){return voices;}
  };
}
