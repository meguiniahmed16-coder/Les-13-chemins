// Only static voice assets leave this worker. Text is pronounced and synthesized locally.
import * as ort from '../assets/voix-fr-v1/ort.wasm.min.mjs';
import initEspeak from '../assets/voix-fr-v1/espeak-ng.mjs';

const assets=new URL('../assets/voix-fr-v1/',import.meta.url);
const modelMirror='https://huggingface.co/IhorShevchuk/piper1-voices-fp16-quantized/resolve/7fb50e46b26367633c599b9da5128fd2883ef3e7/fr/fr_FR/upmc/medium/fr_FR-upmc-medium.int8.onnx?download=true';
const modelHash='7d5e7e31980433039e62018f44cd3ed608f0e1531c9ba7dd71750845168f5840';
const modelSize=22092618;
ort.env.wasm.wasmPaths=assets.href;
ort.env.wasm.numThreads=1;
ort.env.logLevel='error';
let loading,latest=0,queue=Promise.resolve();

async function modelBytes(){
  const key=new URL('upmc-int8.onnx',assets);
  let cache;
  try{
    cache=await self.caches?.open('salon-voix-upmc-'+modelHash.slice(0,12));
    const hit=await cache?.match(key);
    if(hit){const bytes=await hit.arrayBuffer();if(bytes.byteLength===modelSize)return bytes;}
  }catch{/* Private browsing still supports playback without persistent storage. */}
  for(const url of [key,modelMirror]){
    try{
      const response=await fetch(url,{credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(75000)});
      if(!response.ok||response.headers.get('content-type')?.includes('text/html'))continue;
      const reader=response.body.getReader(),bytes=new Uint8Array(modelSize);
      let offset=0,progress=-1;
      while(true){
        const part=await reader.read();if(part.done)break;
        bytes.set(part.value,offset);offset+=part.value.length;
        const percentage=5*Math.floor(20*offset/modelSize);
        if(percentage!==progress){postMessage({type:'progress',percentage});progress=percentage;}
      }
      if(offset!==modelSize)continue;
      const digest=await crypto.subtle.digest('SHA-256',bytes);
      if(Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('')!==modelHash)continue;
      try{await cache?.put(key,new Response(bytes));}catch{/* Storage quota is optional. */}
      return bytes.buffer;
    }catch{/* Fall back to the pinned mirror on a failed transfer. */}
  }
  throw Error('Modèle de voix indisponible');
}
async function initialize(){
  const [bytes,config,module]=await Promise.all([
    modelBytes(),fetch(new URL('modele.json',assets)).then(r=>r.json()),
    initEspeak({locateFile:path=>new URL(path.split('/').pop(),assets).href})
  ]);
  const phonemizer=new module.eSpeakNGWorker();
  if(phonemizer.set_voice('fr')!==0)throw Error('Prononciation française indisponible');
  const session=await ort.InferenceSession.create(bytes,{executionProviders:['wasm'],graphOptimizationLevel:'all'});
  return {config,phonemizer,session};
}
function phonemeIds(text,engine){
  const table=engine.config.phoneme_id_map,ids=[...table['^'],...table['_']];
  for(const clause of text.match(/[^,;:.!?…]+[,;:.!?…]*|[,;:.!?…]+/gu)||[]){
    const punctuation=clause.match(/[,;:.!?…]+$/u)?.[0]||'';
    const spoken=clause.slice(0,clause.length-punctuation.length).trim();
    const ipa=spoken?engine.phonemizer.synthesize_ipa(spoken).ipa:'';
    const symbols=ipa.trim().replaceAll('_','').replace(/\s+/g,' ')+punctuation.replaceAll('…','.')+' ';
    for(const symbol of symbols.normalize('NFD')){
      if(table[symbol])ids.push(...table[symbol],...table['_']);
    }
  }
  ids.push(...table['$']);return ids;
}
function ready(){
  return loading??=initialize().catch(e=>{loading=null;throw e;});
}
async function generate({id,chunks,gender,rate}){
  const engine=await ready();
  for(let index=0;index<chunks.length&&id===latest;index++){
    const ids=phonemeIds(chunks[index].text,engine);
    const integer=data=>new ort.Tensor('int64',BigInt64Array.from(data,BigInt),[data.length]);
    const {output}=await engine.session.run({
      input:new ort.Tensor('int64',BigInt64Array.from(ids,BigInt),[1,ids.length]),
      input_lengths:integer([ids.length]),sid:integer([engine.config.speaker_id_map[gender==='femme'?'jessica':'pierre']]),
      scales:new ort.Tensor('float32',[.667,1/rate,.8],[3])
    });
    if(id!==latest)return;
    const samples=new Float32Array(output.data);
    output.dispose();
    postMessage({type:'audio',id,index,samples,sampleRate:engine.config.audio.sample_rate,last:index===chunks.length-1},[samples.buffer]);
  }
}
self.onmessage=({data})=>{
  if(data.type==='prepare'){void ready().catch(()=>{});return;}
  latest=data.id;
  if(data.type==='cancel')return;
  queue=queue.then(()=>latest===data.id&&generate(data)).catch(()=>{
    if(latest===data.id)postMessage({type:'error',id:data.id});
  });
};
