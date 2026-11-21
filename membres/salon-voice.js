const male=/\b(?:homme|male|masculin|henri|thomas|paul|mathieu|nicolas|remy|antoine|jean|louis|claude|fabien|yves|sylvain)\b/;
const female=/\b(?:femme|female|feminin|audrey|aurelie|celine|denise|eloise|julie|hortense|josephine|lea|marie|amelie|caroline|vivienne|silvie|sylvie|virginie|renee|chantal)\b/;
const simplify=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,' ');
export function frenchVoice(synth,gender,matching=true){
  const list=(synth?.getVoices()||[]).filter(v=>/^fr(?:-|_|$)/i.test(v.lang));
  const want=gender==='femme'?female:male,opposite=gender==='femme'?male:female;
  const ranked=list.map(voice=>{
    const name=simplify(voice.name),match=want.test(name);
    const quality=/neural|natural|premium|enhanced|amelior/.test(name)?5:0;
    return {voice,match,points:(match?100:opposite.test(name)?-100:0)+quality+Number(/^fr-fr$/i.test(voice.lang))*2+Number(voice.localService)};
  }).filter(v=>!matching||v.match).sort((a,b)=>b.points-a.points);
  return ranked[0]?.voice;
}
export function voiceChunks(line,firstWord){
  const chunks=[];let start=firstWord;
  for(let i=start;i<line.words.length;i++){
    const a=line.words[start],b=line.words[i],end=b.index+b.length;
    const next=line.words[i+1];
    // First sound arrives earlier when the opening clause is short.
    const text=line.text.slice(a.index,end),budget=chunks.length?115:72;
    if(!next||/[.!?…][»”"')]*$/.test(text)||text.length>=budget||text.length>=35&&/[,;:][»”"')]*$/.test(text)){
      chunks.push({text,start:a.start,end:next?.start??line.duration});
      start=i+1;
    }
  }
  return chunks;
}
const AudioEngine=globalThis.AudioContext||globalThis.webkitAudioContext;
export function createLocalVoices(status,wake){
  if(!AudioEngine||!globalThis.Worker||!globalThis.WebAssembly)return null;
  let ctx,worker,active=null,seq=0,workerTimeout,idleTimeout,unavailable=false;
  const pending=new Set();
  function releaseLater(){
    clearTimeout(idleTimeout);
    if(worker)idleTimeout=setTimeout(()=>{if(!active){worker.terminate();worker=null;}},45000);
  }
  function disable(){
    stop();
    if(ctx){void ctx.close().catch(()=>{});ctx=null;}
  }
  function stop(){
    clearTimeout(workerTimeout);
    const owned=active;active=null;
    if(owned){worker?.postMessage({type:'cancel',id:++seq});status('');}
    for(const node of pending){node.onended=null;try{node.stop();}catch{}node.disconnect();}
    pending.clear();releaseLater();
  }
  function fail(){
    if(!active)return;
    const action=active.error;
    stop();worker?.terminate();worker=null;unavailable=true;action();
  }
  function armTimeout(){
    clearTimeout(workerTimeout);workerTimeout=setTimeout(fail,80000);
  }
  function unlock(retry=false){
    if(retry)unavailable=false;
    try{
      if(!ctx||ctx.state==='closed')ctx=new AudioEngine();
      if(ctx.state!=='running')void ctx.resume().catch(()=>{if(active)fail();});
      return true;
    }catch{unavailable=true;return false;}
  }
  function receive({data:m}){
    if(!active)return;
    if(m.type==='progress'){
      armTimeout();status(m.percentage<100?'Chargement des voix françaises · '+m.percentage+' %':'Préparation des voix françaises…');return;
    }
    if(m.id!==active.id)return;
    if(m.type==='error'){fail();return;}
    if(m.type!=='audio')return;
    const job=active,chunk=job.chunks[m.index];
    if(ctx.state!=='running'){fail();return;}
    armTimeout();if(m.last)clearTimeout(workerTimeout);
    const buffer=ctx.createBuffer(1,m.samples.length,m.sampleRate);
    buffer.copyToChannel(m.samples,0);
    const source=ctx.createBufferSource();source.buffer=buffer;source.connect(ctx.destination);
    pending.add(source);
    const from=Math.max(ctx.currentTime+.015,job.until),to=from+buffer.duration;
    // Capture speech energy in 20 ms windows so a pause in the sound also closes the jaw.
    const stride=Math.ceil(m.sampleRate*.02),amplitude=new Float32Array(Math.ceil(m.samples.length/stride));
    for(let i=0;i<m.samples.length;i++)amplitude[Math.floor(i/stride)]+=m.samples[i]**2;
    for(let i=0;i<amplitude.length;i++)amplitude[i]=Math.min(1,Math.sqrt(amplitude[i]/stride)*55);
    job.spans.push({...chunk,from,to,amplitude});
    job.until=to;source.onended=()=>{
      pending.delete(source);source.disconnect();
      if(m.last&&active===job){active=null;releaseLater();job.end();}
    };
    source.start(from);status('');wake();
  }
  return {
    get available(){return !unavailable;},unlock,stop,disable,
    speak({line,firstWord,gender,rate,end,error}){
      stop();clearTimeout(idleTimeout);
      if(unavailable||!unlock()){error();return;}
      const chunks=voiceChunks(line,firstWord);if(!chunks.length){end();return;}
      const id=++seq;active={id,chunks,end,error,spans:[],until:ctx.currentTime};
      armTimeout();status('Préparation des voix françaises…');
      try{
        if(!worker){worker=new Worker(new URL('./salon-voice-worker.js',import.meta.url),{type:'module'});worker.onmessage=receive;worker.onerror=fail;}
        worker.postMessage({type:'say',id,gender,rate,chunks});
      }catch{fail();}
    },
    position(){
      if(!active)return null;
      const at=ctx.currentTime,spans=active.spans;
      const span=spans.find(s=>at>=s.from&&at<s.to);
      if(!span)return {time:spans.find(s=>at<s.from)?.start??spans.at(-1)?.end??active.chunks[0].start,energy:0};
      const fraction=(at-span.from)/(span.to-span.from);
      return {time:span.start+(span.end-span.start)*fraction,energy:span.amplitude[Math.min(span.amplitude.length-1,Math.floor(fraction*span.amplitude.length))]};
    }
  };
}
