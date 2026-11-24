import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {build} from 'esbuild';

test('the actual wardrobe loader resolves site assets from the nested salon bundle as well as the intro',async()=>{
 const source=await readFile(new URL('./studio-assets.js',import.meta.url),'utf8');
 const metadata=Buffer.from(JSON.stringify({name:'Ahmed outfit',v:{type:'Int16Array',offset:0,bytes:6}}));
 // The binary metadata is padded to the typed-array alignment used by the pack.
 const padded=Buffer.concat([metadata,Buffer.alloc(metadata.length%2,32)]),header=Buffer.alloc(4);header.writeUInt32LE(padded.length);
 const packed=gzipSync(Buffer.concat([header,padded,Buffer.from(new Int16Array([12,34,56]).buffer)]));
 const previous=globalThis.fetch;
 try{
  for(const moduleURL of ['https://tectonique-des-ames.com/membres/studio-assets.js','https://tectonique-des-ames.com/membres/intro-cinema-dojo26.js','https://tectonique-des-ames.com/membres/v27/scene-bundle.js?v=croisee27']){
   const requests=[];globalThis.fetch=async url=>{
    requests.push(String(url));return String(url)==='https://tectonique-des-ames.com/assets/salon-v27/wear-mh1800.bin'?new Response(packed):new Response('',{status:404});
   };
   const result=await build({stdin:{contents:source},bundle:true,write:false,format:'esm',target:'es2022',define:{'import.meta.url':JSON.stringify(moduleURL)}});
   const loader=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
   const resource=await loader.resource('wear-mh1800');
   assert.equal(resource.name,'Ahmed outfit');assert.deepEqual(Array.from(resource.v),[12,34,56]);
   assert.deepEqual(requests,['https://tectonique-des-ames.com/assets/salon-v27/wear-mh1800.bin']);
  }
 }finally{globalThis.fetch=previous;}
});
