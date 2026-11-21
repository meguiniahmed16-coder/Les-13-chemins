// Only public model files are fetched. The microphone samples stay in this worker.
// Whisper Tiny (Apache-2.0) https://huggingface.co/Xenova/whisper-tiny
// Transformers.js (Apache-2.0) https://github.com/huggingface/transformers.js
// ONNX Runtime (MIT) https://github.com/microsoft/onnxruntime
import {env,pipeline} from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';

env.allowLocalModels=false;
env.useBrowserCache=true;
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.wasmPaths='https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/';
const revision='5332fcc35e32a33b86612b9a57a89be7906102b1';
let model,reported=0;
const loaded=new Map();
function progress(event){
  if(event.status!=='progress')return;
  loaded.set(event.file,event.loaded);
  const mb=Math.floor(Array.from(loaded.values()).reduce((a,b)=>a+b,0)/1000000);
  if(mb>=reported+3){reported=mb;postMessage({type:'progress',mb});}
}
self.onmessage=async({data})=>{
  try{
    model??=pipeline('automatic-speech-recognition','Xenova/whisper-tiny',{
      revision,quantized:true,progress_callback:progress
    });
    const transcriber=await model;
    if(data.type==='transcribe'){
      postMessage({type:'transcribing',id:data.id});
      const {text}=await transcriber(data.samples,{language:'french',task:'transcribe',do_sample:false,num_beams:1});
      postMessage({type:'result',id:data.id,text});
    }
  }catch{model=null;postMessage({type:'error',id:data.id});}
};
