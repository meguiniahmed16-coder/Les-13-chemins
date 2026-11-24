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


/* Keep the original furniture geometry, one original television display plane,
   and base-colour textures. Discard the other 199 alternative screen frames and
   expensive normal/roughness maps.
   The complete, checksum-verified original remains available separately. */
export function compactWhiteRoom(input){
 const n=input.readUInt32LE(12),j=JSON.parse(input.subarray(20,20+n).toString('utf8'));
 const bin=input.subarray(28+n),used=new Set();
 const screenPattern=/^TV Screen(?:[.\s_]|$)/i;
 const displayIndex=j.nodes.findIndex(n=>screenPattern.test(n.name||''));
 if(displayIndex<0)throw Error('Écran original de télévision manquant');
 const visible=i=>i===displayIndex||!screenPattern.test(j.nodes[i].name||'');
 function visit(i){if(used.has(i)||!visible(i))return;used.add(i);for(const c of j.nodes[i].children||[])visit(c);}
 for(const s of j.scenes)for(const i of s.nodes||[])visit(i);
 const select=(items,ids)=>{const order=[...ids].sort((a,b)=>a-b);return {items:order.map(i=>items[i]),map:new Map(order.map((v,i)=>[v,i]))}};
 const node=select(j.nodes,used),mi=new Set();
 for(const v of node.items)if(v.mesh!==undefined)mi.add(v.mesh);
 const mesh=select(j.meshes,mi),ma=new Set(),ac=new Set();
 for(const m of mesh.items)for(const p of m.primitives){if(p.material!==undefined)ma.add(p.material);if(p.indices!==undefined)ac.add(p.indices);for(const i of Object.values(p.attributes))ac.add(i);}
 const material=select(j.materials,ma),tx=new Set();
 for(const m of material.items){
  delete m.normalTexture;delete m.occlusionTexture;
  if(m.pbrMetallicRoughness){delete m.pbrMetallicRoughness.metallicRoughnessTexture;m.pbrMetallicRoughness.roughnessFactor??=.85; m.pbrMetallicRoughness.metallicFactor??=0; if(m.pbrMetallicRoughness.baseColorTexture)tx.add(m.pbrMetallicRoughness.baseColorTexture.index);}
  if(m.emissiveTexture)tx.add(m.emissiveTexture.index);
 }
 const texture=select(j.textures,tx),image=select(j.images,new Set(texture.items.map(t=>t.source))),accessor=select(j.accessors,ac),views=new Set();
 for(const a of accessor.items)views.add(a.bufferView);
 for(const im of image.items)views.add(im.bufferView);
 const view=select(j.bufferViews,views),parts=[];let offset=0;
 for(const v of view.items){const from=v.byteOffset||0,bytes=bin.subarray(from,from+v.byteLength);if(bytes.length!==v.byteLength)throw Error('Original texture incomplete');v.byteOffset=offset;parts.push(bytes);offset+=bytes.length;const pad=(4-offset%4)%4;if(pad){parts.push(Buffer.alloc(pad));offset+=pad;}}
 for(const v of node.items){if(v.children)v.children=v.children.filter(i=>used.has(i)).map(i=>node.map.get(i));if(v.mesh!==undefined)v.mesh=mesh.map.get(v.mesh);}
 for(const s of j.scenes)s.nodes=s.nodes.filter(i=>used.has(i)).map(i=>node.map.get(i));
 for(const m of mesh.items)for(const p of m.primitives){if(p.material!==undefined)p.material=material.map.get(p.material);if(p.indices!==undefined)p.indices=accessor.map.get(p.indices);for(const k in p.attributes)p.attributes[k]=accessor.map.get(p.attributes[k]);}
 for(const a of accessor.items)a.bufferView=view.map.get(a.bufferView);
 for(const im of image.items)im.bufferView=view.map.get(im.bufferView);
 for(const t of texture.items)t.source=image.map.get(t.source);
 for(const m of material.items){const bc=m.pbrMetallicRoughness?.baseColorTexture;if(bc)bc.index=texture.map.get(bc.index);if(m.emissiveTexture)m.emissiveTexture.index=texture.map.get(m.emissiveTexture.index);}
 Object.assign(j,{nodes:node.items,meshes:mesh.items,materials:material.items,accessors:accessor.items,textures:texture.items,images:image.items,bufferViews:view.items,buffers:[{byteLength:offset}]});delete j.animations;
 if(!j.nodes.some(x=>/^BLUE CHAIR/i.test(x.name))||!j.nodes.some(x=>/^RED CHAIR/i.test(x.name))||!j.nodes.some(x=>/^TV_284$/i.test(x.name)))throw Error('Mobilier original manquant');
 const json=Buffer.from(JSON.stringify(j)),pad=(4-json.length%4)%4,jsonSize=json.length+pad,out=Buffer.alloc(28+jsonSize+offset);
 out.write('glTF',0,'ascii');out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(jsonSize,12);out.writeUInt32LE(0x4e4f534a,16);out.fill(0x20,20,20+jsonSize);json.copy(out,20);out.writeUInt32LE(offset,20+jsonSize);out.writeUInt32LE(0x004e4942,24+jsonSize);Buffer.concat(parts,offset).copy(out,28+jsonSize);
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
  if(item.folder==='white'){const fast=compactWhiteRoom(data);if(fast.length>=data.length)throw Error('Salle blanche non optimisée');await writeFile(join(dest,'white-room-start.glb'),fast);await writeFile(join(dest,'white-room-start-ecran22.glb'),fast);console.log('Salle blanche optimisée : '+fast.length+' octets');}
  console.log('GLB original vérifié : '+item.name+' ('+data.length+' octets)');
 }
}
