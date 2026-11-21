// The native recognizer and the local model both deliver editable text, never submit it.
export function createDictee({onText,onStatus,onState,onKeyboard}){
  const Native=window.SpeechRecognition||window.webkitSpeechRecognition;
  const help='Touche le champ du message, puis le micro de ton clavier pour dicter.';
  let state='idle',session=null,serial=0,worker=null,releaseTimer=0,nativeFailed=false,emptyAttempts=0;

  function setState(value){state=value;onState(value);}
  function releaseModel(){clearTimeout(releaseTimer);worker?.terminate();worker=null;}
  function detach(run){
    clearTimeout(run.timer);
    if(run.native){
      const r=run.native;run.native=null;
      r.onstart=r.onresult=r.onend=r.onerror=null;
      try{r.abort();}catch{}
    }
    if(run.recorder){
      const r=run.recorder;run.recorder=null;
      r.onstop=r.onerror=r.ondataavailable=null;
      if(r.state!=='inactive')try{r.stop();}catch{}
    }
    run.stream?.getTracks().forEach(track=>track.stop());
    run.stream=null;
  }
  function finish(run,message='',keyboard=false){
    if(session!==run)return;
    session=null;detach(run);setState('idle');onStatus(message);
    if(keyboard)onKeyboard();
    if(worker){clearTimeout(releaseTimer);releaseTimer=setTimeout(releaseModel,60000);}
  }
  function result(run,text){
    if(session!==run)return;
    const phrase=text?.trim();
    finish(run,phrase?'':'Aucune parole reconnue. Touche le micro pour réessayer.');
    if(phrase)onText(phrase);
  }
  function cancel(){
    const run=session;
    if(run)finish(run);
    releaseModel();
  }
  function localFailure(run){
    if(session!==run)return;
    releaseModel();finish(run,'La transcription sur cet appareil est indisponible. '+help,true);
  }
  function localWorker(run){
    if(!worker)worker=new Worker(new URL('./salon-dictee-worker.js',import.meta.url),{type:'module'});
    worker.onerror=()=>localFailure(run);
    worker.onmessage=({data})=>{
      if(session!==run||(data.id!==undefined&&data.id!==run.id))return;
      if(data.type==='result')result(run,data.text);
      if(data.type==='error')localFailure(run);
      if(data.type==='progress'&&state==='processing')onStatus('Chargement de la dictée locale… '+data.mb+' Mo reçus.');
      if(data.type==='transcribing'&&state==='processing')onStatus('Transcription sur cet appareil…');
    };
    return worker;
  }
  async function transcribe(run){
    if(session!==run)return;
    if(state!=='processing')setState('processing');
    onStatus('Préparation de la transcription sur cet appareil…');
    clearTimeout(run.timer);
    run.stream?.getTracks().forEach(track=>track.stop());run.stream=null;
    run.timer=setTimeout(()=>localFailure(run),240000);
    try{
      const file=new Blob(run.parts,{type:run.recorder.mimeType});
      run.parts.length=0;
      const Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;
      const context=new Offline(1,1,16000);
      const audio=await context.decodeAudioData(await file.arrayBuffer());
      if(session!==run)return;
      const samples=audio.getChannelData(0).slice(0,16000*29);
      let voiced=0;
      for(const value of samples)if(Math.abs(value)>.008)voiced++;
      if(voiced<180){result(run,'');return;}
      localWorker(run).postMessage({type:'transcribe',id:run.id,samples},[samples.buffer]);
    }catch{localFailure(run);}
  }
  function stopRecording(run){
    if(run.recorder?.state==='recording'){
      clearTimeout(run.timer);setState('processing');
      run.recorder.stop();
    }
  }
  async function local(run){
    if(session!==run)return;
    detach(run);
    if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder||!window.Worker||
        !(window.OfflineAudioContext||window.webkitOfflineAudioContext)){
      finish(run,help,true);return;
    }
    setState('starting');onStatus('Autorise le microphone pour dicter ton message.');
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true}});
      if(session!==run){stream.getTracks().forEach(track=>track.stop());return;}
      run.stream=stream;run.parts=[];
      const r=new MediaRecorder(stream);run.recorder=r;
      r.ondataavailable=e=>{if(e.data.size)run.parts.push(e.data);};
      r.onerror=()=>finish(run,'Le micro a été interrompu. '+help,true);
      r.onstop=()=>void transcribe(run);
      r.start();
      setState('listening');onStatus('Parle, puis retouche le micro pour terminer. Le modèle se télécharge à la première dictée locale.');
      run.timer=setTimeout(()=>stopRecording(run),27000);
      localWorker(run).postMessage({type:'prepare',id:run.id});
    }catch(error){
      if(session!==run)return;
      const denied=error.name==='NotAllowedError'||error.name==='SecurityError';
      finish(run,(denied?'Accès au micro refusé. ':'Le micro est indisponible. ')+help,true);
    }
  }
  function noNativeResult(run){
    if(session!==run)return;
    if(state!=='processing'&&(!run.listeningAt||Date.now()-run.listeningAt<1200||++emptyAttempts>=2)){
      nativeFailed=true;void local(run);
    }else finish(run,'Aucune parole reconnue. Touche le micro pour réessayer.');
  }
  function native(run){
    const r=new Native();run.native=r;r.lang='fr-FR';r.continuous=false;r.interimResults=false;
    r.onstart=()=>{
      if(session!==run)return;
      clearTimeout(run.timer);run.listeningAt=Date.now();setState('listening');onStatus('Je t’écoute…');
      run.timer=setTimeout(()=>stopNative(run),30000);
    };
    r.onresult=e=>{
      const final=Array.from(e.results).filter(item=>item.isFinal!==false);
      if(final.length){emptyAttempts=0;result(run,final.map(item=>item[0].transcript).join(' '));}
    };
    r.onerror=e=>{
      if(session!==run)return;
      if(e.error==='no-speech'||e.error==='aborted'){noNativeResult(run);return;}
      nativeFailed=true;void local(run);
    };
    r.onend=()=>noNativeResult(run);
    run.timer=setTimeout(()=>{nativeFailed=true;void local(run);},9000);
    r.start();
  }
  function stopNative(run){
    clearTimeout(run.timer);setState('processing');onStatus('Fin de la dictée…');
    run.timer=setTimeout(()=>finish(run,'Touche le micro pour réessayer.'),4500);
    try{run.native.stop();}catch{finish(run);}
  }
  function toggle(){
    if(state==='processing'){cancel();return;}
    if(session){
      if(state==='starting'){cancel();return;}
      if(session.native)stopNative(session);else stopRecording(session);
      return;
    }
    clearTimeout(releaseTimer);
    const run={id:++serial};session=run;setState('starting');onStatus('Ouverture du micro…');
    if(Native&&!nativeFailed){
      try{native(run);return;}catch{nativeFailed=true;}
    }
    void local(run);
  }
  return {toggle,cancel,get state(){return state;}};
}
