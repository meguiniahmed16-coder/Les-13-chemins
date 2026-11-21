const male=/\b(?:homme|male|masculin|henri|thomas|paul|mathieu|nicolas|remy|antoine|jean|louis|claude|fabien|yves|sylvain)\b/;
const female=/\b(?:femme|female|feminin|audrey|aurelie|celine|denise|eloise|julie|hortense|josephine|lea|marie|amelie|caroline|vivienne|silvie|sylvie|virginie|renee|chantal)\b/;
const simplify=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,' ');
export function frenchVoice(synth,gender,matching=true,localOnly=false){
  const list=(synth?.getVoices()||[]).filter(v=>/^fr(?:-|_|$)/i.test(v.lang)&&(!localOnly||v.localService));
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
    const text=line.text.slice(a.index,end),token=line.text.slice(b.index,end);
    const abbreviation=/^(?:M|Mme|Mlle|Dr|Pr|St|Ste|[A-ZÀ-Ü])\.$/u.test(token);
    const sentence=!abbreviation&&/[.!?…][»”"')]*$/.test(token);
    const clause=text.length>=38&&/[,;:—][»”"')]*$/.test(token);
    const joinsPunctuation=next&&/^[,;:.!?…»]/u.test(line.text.slice(next.index));
    // Let a phrase finish naturally. Bound unusually long, unpunctuated sentences.
    const boundary=(sentence&&text.length>=16)||clause||text.length>=180;
    if(!next||(boundary&&!joinsPunctuation)){
      chunks.push({text,start:a.start,end:next?.start??line.duration});
      start=i+1;
    }
  }
  return chunks;
}
// Piper pads each segment independently. Keep breaths inside the phrase and
// the pause appropriate to its punctuation, removing only quiet edges.
export function spokenSamples(samples,rate,text,last){
  let first=0,end=samples.length;
  while(first<end&&Math.abs(samples[first])<.002)first++;
  if(first===end)return samples;
  while(end>first&&Math.abs(samples[end-1])<.002)end--;
  let pause=.035;
  if(last)pause=.09;
  else if(/[.!?…][»”"')]*$/.test(text))pause=.20;
  else if(/[,;:—][»”"')]*$/.test(text))pause=.12;
  return samples.subarray(Math.max(0,first-Math.ceil(rate*.035)),Math.min(samples.length,end+Math.ceil(rate*pause)));
}
const AudioEngine=globalThis.AudioContext||globalThis.webkitAudioContext;
export function createLocalVoices(status,wake){
  if(!AudioEngine||!globalThis.Worker||!globalThis.WebAssembly)return null;
  let ctx,worker,active=null,seq=0,workerTimeout,idleTimeout,unavailable=false;
  const pending=new Set();
  function releaseLater(){
    clearTimeout(idleTimeout);
    if(worker)idleTimeout=setTimeout(()=>{if(!active){worker.terminate();worker=null;}},120000);
  }
  function disable(){
    stop();clearTimeout(idleTimeout);worker?.terminate();worker=null;
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
  function connectWorker(){
    if(!worker){worker=new Worker(new URL('./salon-voice-worker.js?v=salon41',import.meta.url),{type:'module'});worker.onmessage=receive;worker.onerror=fail;}
    return worker;
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
    const samples=spokenSamples(m.samples,m.sampleRate,chunk.text,m.last);
    const buffer=ctx.createBuffer(1,samples.length,m.sampleRate);
    buffer.copyToChannel(samples,0);
    const source=ctx.createBufferSource();source.buffer=buffer;source.connect(ctx.destination);
    pending.add(source);
    const from=Math.max(ctx.currentTime+.015,job.until),to=from+buffer.duration;
    // Capture speech energy in 20 ms windows so a pause in the sound also closes the jaw.
    const stride=Math.ceil(m.sampleRate*.02),amplitude=new Float32Array(Math.ceil(samples.length/stride));
    for(let i=0;i<samples.length;i++)amplitude[Math.floor(i/stride)]+=samples[i]**2;
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
    prepare(){
      if(unavailable||active)return;
      try{connectWorker().postMessage({type:'prepare'});releaseLater();}catch{/* speak() retries or falls back to the system voice. */}
    },
    speak({line,firstWord,gender,rate,end,error}){
      stop();clearTimeout(idleTimeout);
      if(unavailable||!unlock()){error();return;}
      const chunks=voiceChunks(line,firstWord);if(!chunks.length){end();return;}
      const id=++seq;active={id,chunks,end,error,spans:[],until:ctx.currentTime};
      armTimeout();status('Préparation des voix françaises…');
      try{
        connectWorker().postMessage({type:'say',id,gender,rate,chunks});
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
