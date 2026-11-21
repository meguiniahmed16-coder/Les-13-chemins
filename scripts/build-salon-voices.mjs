import {mkdir,readFile,writeFile,copyFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const run=promisify(execFile);
export const modelURL='https://huggingface.co/IhorShevchuk/piper1-voices-fp16-quantized/resolve/7fb50e46b26367633c599b9da5128fd2883ef3e7/fr/fr_FR/upmc/medium/fr_FR-upmc-medium.int8.onnx?download=true';
const hash='7d5e7e31980433039e62018f44cd3ed608f0e1531c9ba7dd71750845168f5840';

// The published eSpeak file table indexes 24 MB of dictionaries. Repackage the French
// and English fallback data at build time so a phone only fetches the files it can use.
async function frenchPhonemizer(root,dest){
  const source=join(root,'node_modules/@echogarden/espeak-ng-emscripten');
  const [js,data]=await Promise.all([readFile(join(source,'espeak-ng.js'),'utf8'),readFile(join(source,'espeak-ng.data'))]);
  const manifest=/loadPackage\(\{files:\[(.*?)\],remote_package_size:\d+\}\)/.exec(js);
  if(!manifest)throw Error('Table des dictionnaires eSpeak absente');
  const files=[],parts=[];let size=0;
  for(const [,filename,start,end] of manifest[1].matchAll(/\{filename:"([^"]+)",start:(\d+),end:(\d+)\}/g)){
    if(!/\/(?:fr_dict|en_dict|phondata|phonindex|phontab|intonations|lang\/roa\/fr|lang\/gmw\/en)$/.test(filename))continue;
    const part=data.subarray(Number(start),Number(end));
    files.push({filename,start:size,end:size+part.length});parts.push(part);size+=part.length;
  }
  if(files.length!==8)throw Error('Données de prononciation française incomplètes');
  const compact=js.replace(manifest[0],'loadPackage('+JSON.stringify({files,remote_package_size:size})+')');
  await Promise.all([writeFile(join(dest,'espeak-ng.mjs'),compact),writeFile(join(dest,'espeak-ng.data'),Buffer.concat(parts)),
    copyFile(join(source,'COPYING'),join(dest,'espeak-LICENSE.txt'))]);
}

export async function buildSalonVoices(root,output){
  const dest=join(output,'assets/voix-fr-v1');
  const ort=join(root,'node_modules/onnxruntime-web/dist');
  await mkdir(dest,{recursive:true});
  await Promise.all(['ort.wasm.min.mjs','ort-wasm-simd-threaded.mjs','ort-wasm-simd-threaded.wasm'].map(n=>copyFile(join(ort,n),join(dest,n))));
  await frenchPhonemizer(root,dest);
  await copyFile(join(root,'membres/salon-voice-model.json'),join(dest,'modele.json'));
  const file=join(dest,'upmc-int8.onnx');
  try{
    await run('curl',['--fail','--silent','--show-error','--location','--max-time','60','--output',file,modelURL]);
    if(createHash('sha256').update(await readFile(file)).digest('hex')!==hash)throw Error('Empreinte du modèle incorrecte');
  }catch{
    await rm(file,{force:true});
    // The browser also knows the pinned upstream mirror and verifies the same checksum.
    console.warn('Voix françaises : utilisation du miroir du modèle pour cette publication.');
  }
}
