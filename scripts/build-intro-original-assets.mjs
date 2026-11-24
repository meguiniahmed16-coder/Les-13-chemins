import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';

function adaptSpecGlossGLB(input){
 const jsonSize=input.readUInt32LE(12),chunkType=input.readUInt32LE(16);
 if(chunkType!==0x4e4f534a)throw Error('Invalid glTF JSON header.');
 const json=JSON.parse(input.subarray(20,20+jsonSize).toString('utf8').replace(/\\0+$/g,''));
 const ext='KHR_materials_pbrSpecularGlossiness';
 for(const item of json.materials||[]){
  const spec=item.extensions?.[ext];
  if(!spec)continue;
  item.pbrMetallicRoughness={
   baseColorFactor:spec.diffuseFactor||[1,1,1,1],
   ...(spec.diffuseTexture?{baseColorTexture:spec.diffuseTexture}:{}),
   metallicFactor:0,roughnessFactor:Math.max(.06,1-(spec.glossinessFactor??.4))
  };
  delete item.extensions[ext];
  if(!Object.keys(item.extensions).length)delete item.extensions;
 }
 json.extensionsRequired=(json.extensionsRequired||[]).filter(e=>e!==ext);
 json.extensionsUsed=(json.extensionsUsed||[]).filter(e=>e!==ext);
 const raw=Buffer.from(JSON.stringify(json),'utf8'),pad=(4-raw.length%4)%4,chunk=Buffer.alloc(raw.length+pad,0x20);
 raw.copy(chunk);
 const oldRemaining=input.subarray(20+jsonSize);
 const out=Buffer.alloc(20+chunk.length+oldRemaining.length);
 out.write('glTF',0,'ascii');out.writeUInt32LE(input.readUInt32LE(4),4);out.writeUInt32LE(out.length,8);
 out.writeUInt32LE(chunk.length,12);out.writeUInt32LE(0x4e4f534a,16);chunk.copy(out,20);oldRemaining.copy(out,20+chunk.length);
 return out;
}

// Original binary files are split into Git blobs for safe storage; verify exact bytes.
const resources=[
 {name:'white-room-original.glb',folder:'white',parts:31,size:48248884,sha256:'d2b3cf4018dfec5e793d3ee25d3b04cf1e7b07730adc86563e4b34240252f572'},
 {name:'dojo-original.glb',folder:'dojo',parts:17,size:12758208,sha256:'d2fc623a87f455ec9c4288cfaa6baac79025fd55bcb63de23cf6d08e867c96b0'}
];
export async function buildIntroOriginalAssets(root,output){
 const dest=join(output,'assets','intro-original');await mkdir(dest,{recursive:true});
 for(const item of resources){
  const buffers=[];
  for(let i=0;i<item.parts;i++)buffers.push(await readFile(join(root,'assets-source','intro-original',item.folder,String(i).padStart(3,'0')+'.bin')));
  const data=Buffer.concat(buffers),checksum=createHash('sha256').update(data).digest('hex');
  if(data.length!==item.size||checksum!==item.sha256)throw Error('GLB original '+item.name+' incomplet ou altéré.');
  await writeFile(join(dest,item.name),item.folder==='dojo'?adaptSpecGlossGLB(data):data);
  console.log('GLB original vérifié : '+item.name+' ('+data.length+' octets)');
 }
}
