import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {normaliseStudio,referenceStudio,exactStudio} from './studio-look.js';
import {poseVertex} from './salon-pose.js';
import {inspectionFemaleBodyFaces} from './studio-inspection-geometry.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url));
const index=JSON.parse(read('assets-source/salon-v27/assets.json'));
const archive=Buffer.concat(index.packs.map(path=>read('assets-source/salon-v27/'+path)));
const types={Uint8Array,Uint16Array,Int8Array,Int16Array},cache=new Map();
let resourceReads=0;
async function resource(name){
 resourceReads++;
 if(cache.has(name))return cache.get(name);
 const [offset,length]=index.files[name+'.bin'],compressed=gunzipSync(archive.subarray(offset,offset+length));
 const data=compressed.buffer.slice(compressed.byteOffset,compressed.byteOffset+compressed.byteLength);
 const size=new DataView(data).getUint32(0,true),start=4+size;
 const value=JSON.parse(new TextDecoder().decode(new Uint8Array(data,4,size)),(_,v)=>v&&types[v.type]?new types[v.type](data,start+v.offset,v.bytes/types[v.type].BYTES_PER_ELEMENT):v);
 cache.set(name,value);return value;
}
const pixels=async()=>({width:1,height:1,data:new Uint8ClampedArray([190,145,120,255])});
const source=read('membres/studio-model.js').toString().replace(/^import .*;\n/gm,'').replace('export async function loadStudio','async function loadStudio');
const load=new Function('resource','pixels','material','poseVertex','inspectionFemaleBodyFaces',source+';return loadStudio;')(resource,pixels,pixels,poseVertex,inspectionFemaleBodyFaces);
const bare=gender=>normaliseStudio({...referenceStudio(gender),outfit:{}},true,undefined,gender,{inspection:true});
const poses=JSON.parse(read('membres/v27/poses.json'));

test('inspection is an explicit temporary option, never a permission in a saved look or subscription',()=>{
 for(const gender of ['homme','femme']){
  const value={...referenceStudio(gender),outfit:{},inspection:true,author:true};
  for(const plus of [false,true]){
   const ordinary=normaliseStudio(value,plus,undefined,gender);
   assert.equal(ordinary.outfit.culotte,'mh3461');assert.equal(Object.hasOwn(ordinary,'inspection'),false);
  }
  const inspected=bare(gender);assert.deepEqual(inspected.outfit,{});
  assert.equal(Object.hasOwn(inspected,'inspection'),false);
  assert.equal(exactStudio(inspected,normaliseStudio(inspected,true,undefined,gender)),false,'The normal save endpoint cannot accept the private preview as an outfit');
 }
 const child=normaliseStudio({...referenceStudio('femme'),face:{...referenceStudio('femme').face,age:5},outfit:{}},true,undefined,'femme',{inspection:true});
 assert.equal(child.outfit.culotte,'mh3461');
});

test('the real loader keeps ordinary figures covered even if a caller supplies an empty outfit',async t=>{
 t.mock.method(globalThis,'fetch',async()=>{throw Error('Ordinary clothing must not require an author request');});
 for(const gender of ['homme','femme']){
  const figure=await load({...bare(gender),inspection:true},gender);
  assert.equal(figure.inspection,false,'A flag inside the appearance is not trusted');
  const clothes=figure.meshes.filter(mesh=>mesh.binding);
  assert.ok(clothes.some(mesh=>mesh.group==='culottes'));
  if(gender==='femme')assert.ok(clothes.some(mesh=>mesh.group==='hauts'));
 }
});

test('unauthenticated or expired inspection is rejected before any body or garment is loaded',async t=>{
 const calls=[];
 t.mock.method(globalThis,'fetch',async(url,options)=>{calls.push({url,options});return Response.json({error:'Session expirée'},{status:401});});
 for(const gender of ['homme','femme']){
  const before=resourceReads;
  await assert.rejects(()=>load(bare(gender),gender,{inspection:true}),/administration/);
  assert.equal(resourceReads,before,'No body is constructed after author refusal');
 }
 assert.equal(calls.length,2);
 for(const call of calls){
  assert.equal(call.url,'/api/membres/admin/settings');
  assert.equal(call.options.credentials,'same-origin');assert.equal(call.options.cache,'no-store');
 }
});

test('the owner can inspect each complete adult body with no hidden replacement clothes',async t=>{
 const calls=[];
 t.mock.method(globalThis,'fetch',async(url,options)=>{calls.push({url,options});return Response.json({label:'Atelier des formes',reference:'https://example.invalid/private-reference'});});
 for(const gender of ['homme','femme']){
  const look=bare(gender),before=JSON.stringify(look),figure=await load(look,gender,{inspection:true});
  assert.equal(figure.inspection,true);assert.equal(JSON.stringify(look),before,'The preview input remains immutable');
  assert.equal(figure.meshes.filter(mesh=>mesh.binding).length,0,'No top, underwear, shoes or accessory remains');
  const body=figure.meshes.find(mesh=>mesh.name==='body');
  assert.ok(body);assert.ok(body.faces.length>300000);assert.deepEqual(body.faces,body.allFaces,'No clothing coverage mask remains on the body');
  figure.pose(poses[gender==='femme'?'f':'m'].rest);
  assert.ok(body.v.some(value=>value!==0));assert.ok([...body.v].every(Number.isFinite));
 }
 assert.equal(calls.length,2,'Each inspection verifies the current owner session');
});

test('a previous author success is not cached for a later inspection and malformed success is not accepted',async t=>{
 let requests=0;
 t.mock.method(globalThis,'fetch',async()=>++requests===1?Response.json({label:'Atelier',reference:'private'}):Response.json({error:'Session expirée'},{status:401}));
 await load(bare('homme'),'homme',{inspection:true});
 await assert.rejects(()=>load(bare('femme'),'femme',{inspection:true}),/administration/);assert.equal(requests,2);
 t.mock.method(globalThis,'fetch',async()=>Response.json({ok:true}));
 const before=resourceReads;
 await assert.rejects(()=>load(bare('homme'),'homme',{inspection:true}),/confirmé/);assert.equal(resourceReads,before);
});

test('the inspection loader refuses the child morphology before even requesting author access',async t=>{
 t.mock.method(globalThis,'fetch',async()=>{throw Error('No request should be made');});
 const look=bare('femme');look.face.age=5;
 const before=resourceReads;
 await assert.rejects(()=>load(look,'femme',{inspection:true}),/adultes/);assert.equal(resourceReads,before);
});
