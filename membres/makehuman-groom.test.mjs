import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {gunzipSync} from 'node:zlib';
import {traits} from './studio-catalog.js';
import {MAKEHUMAN_HAIR,MAKEHUMAN_BEARD,makehumanHair,makehumanBeard} from './makehuman-catalog.js';
import {normaliseStudio,referenceStudio,exactStudio,traitAvailable,traitOptionAvailable} from './studio-look.js';
import {colourGroom} from './studio-materials.js';
import {decodeGroom} from './makehuman-groom.js';
import {poseVertex} from './salon-pose.js';
import {inspectionFemaleBodyFaces} from './studio-inspection-geometry.js';

class Pixels{
 constructor(data,width,height){this.data=data;this.width=width;this.height=height;}
}
function installPixels(t){
 const previous=globalThis.ImageData;globalThis.ImageData=Pixels;
 t.after(()=>{if(previous===undefined)delete globalThis.ImageData;else globalThis.ImageData=previous;});
}
const all=[...MAKEHUMAN_HAIR,...MAKEHUMAN_BEARD];
const read=path=>readFileSync(new URL('../'+path,import.meta.url));
const assetDir=process.env.MAKEHUMAN_ASSET_DIR||new URL('../dist/assets/makehuman/',import.meta.url).pathname;
const assetsBuilt=all.every(record=>existsSync(resolve(assetDir,record.id+'.bin')));
const pixels=async()=>new Pixels(new Uint8ClampedArray([44,26,13,0,90,65,40,97,175,160,120,255]),3,1);

test('the 30 additions preserve saved resident indices and round-trip every permitted selection',()=>{
 const hair=traits.find(t=>t.key==='hair'),beard=traits.find(t=>t.key==='beard');
 assert.equal(hair.options[10],'Chignon de Marianne');assert.equal(hair.options[11],'Boucles d’Ahmed Marie');
 assert.equal(new Set(all.map(record=>record.id)).size,30);
 assert.equal(MAKEHUMAN_HAIR.length,25);assert.equal(MAKEHUMAN_BEARD.length,5);
 for(const gender of ['homme','femme'])for(const item of all){
  const value=referenceStudio(gender),key=item.kind==='hair'?'hair':'beard';value.face[key]=item.index;
  const normalized=normaliseStudio(value,true,undefined,gender);
  assert.equal(normalized.face[key],key==='beard'&&gender==='femme'?0:item.index);
  assert.ok(exactStudio(normalized,normaliseStudio(normalized,true,undefined,gender)));
  assert.ok((key==='hair'?hair:beard).options[item.index].startsWith(item.label));
 }
 const resident={...referenceStudio('homme'),face:{...referenceStudio('homme').face,hair:11,bust:2,seat:3}};
 for(const setting of [true,{owner:true}]){
  const look=normaliseStudio(resident,true,undefined,'homme',setting);
  assert.equal(look.face.hair,11);assert.equal(look.face.bust,2);assert.equal(look.face.seat,3);
  assert.equal(normaliseStudio({...resident,face:{...resident.face,makeup:2}},true,undefined,'homme',setting).face.makeup,2);
 }
 const ordinary=normaliseStudio({...resident,owner:true},true,undefined,'homme');
 assert.equal(ordinary.face.bust,undefined);assert.equal(ordinary.face.seat,undefined);assert.equal(ordinary.face.makeup,0);assert.notEqual(ordinary.face.hair,11);
});

test('the owner can save all five 3D beards on Marianne while member permissions stay unchanged',()=>{
 const baseline=referenceStudio('femme');
 assert.equal(traitAvailable('beard','femme',true),true);assert.equal(traitAvailable('beard','femme'),false);
 for(let beard=0;beard<=9;beard++){
  const value={...baseline,face:{...baseline.face,beard}},permitted=beard===0||beard>=5;
  assert.equal(traitOptionAvailable('beard',beard,'femme',true,value),permitted);
  const owner=normaliseStudio(value,true,undefined,'femme',{owner:true});
  assert.equal(owner.face.beard,permitted?beard:0);
  assert.ok(exactStudio(owner,normaliseStudio(owner,true,undefined,'femme',{owner:true})));
  assert.equal(normaliseStudio(value,true,undefined,'femme').face.beard,0);
 }
});

test('resident hairstyles are only offered where their actual reference mesh is available',()=>{
 const male=referenceStudio('homme'),female=referenceStudio('femme');
 assert.equal(traitOptionAvailable('hair',10,'femme',false,female),true);
 assert.equal(traitOptionAvailable('hair',10,'homme',true,male),false);
 assert.equal(traitOptionAvailable('hair',11,'femme',true,female),false);
 assert.equal(traitOptionAvailable('hair',11,'homme',false,male),false);
 assert.equal(traitOptionAvailable('hair',11,'homme',true,male),true);
 for(const change of [{skinLevel:60},{iris:'#4499cc'},{face:{nose:2}},{face:{makeup:2}},{face:{body:2}}]){
  const look={...male,...change,face:{...male.face,...change.face,hair:11}};
  assert.equal(traitOptionAvailable('hair',11,'homme',true,look),false);
  assert.equal(normaliseStudio(look,true,undefined,'homme',{owner:true}).face.hair,7);
 }
 const dyed={...male,face:{...male.face,hair:11,hairTone:9}};
 assert.equal(traitOptionAvailable('hair',11,'homme',true,dyed),true);
 assert.equal(normaliseStudio(dyed,true,undefined,'homme',{owner:true}).face.hair,11);
 assert.equal(normaliseStudio({...female,face:{...female.face,hair:11}},true,undefined,'femme',{owner:true}).face.hair,7);
});

test('dyeing hair or a beard preserves fine alpha and never changes the shared source texture',async t=>{
 installPixels(t);
 const source=await pixels(),before=source.data.slice(),outputs=[];
 for(let tone=0;tone<12;tone++){
  const result=colourGroom(source,tone);outputs.push(result.data);
  for(let i=3;i<before.length;i+=4)assert.equal(result.data[i],before[i]);
 }
 assert.deepEqual(source.data,before);assert.notDeepEqual(outputs[0],outputs[3]);
});

test('real MakeHuman bindings fit both bodies, survive movement and follow the native mouth',{
 skip:assetsBuilt?false:'Run the asset build first, or set MAKEHUMAN_ASSET_DIR to the prepared binaries.'
},async t=>{
 installPixels(t);
 const requested=[];
 t.mock.method(globalThis,'fetch',async url=>{
  assert.match(String(url),/^\/assets\/makehuman\/mh-[a-z0-9_-]+\.bin$/);
  const file=String(url).split('/').at(-1);requested.push(file);
  return new Response(readFileSync(resolve(assetDir,file)));
 });
 const groomSource=read('membres/makehuman-groom.js').toString().replace(/^import .*;\n/gm,'').replaceAll('export ','');
 const loadGroom=new Function('pixels','colourGroom',groomSource+';return loadMakehumanGroom;')(pixels,colourGroom);
 const index=JSON.parse(read('assets-source/salon-v27/assets.json')),archive=Buffer.concat(index.packs.map(path=>read('assets-source/salon-v27/'+path))),cache=new Map();
 async function resource(name){
  if(!cache.has(name)){
   const [offset,length]=index.files[name+'.bin'],bytes=gunzipSync(archive.subarray(offset,offset+length));
   cache.set(name,decodeGroom(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)));
  }return cache.get(name);
 }
 const modelSource=read('membres/studio-model.js').toString().replace(/^import .*;\n/gm,'').replace('export async function loadStudio','async function loadStudio');
 const load=new Function('resource','pixels','material','poseVertex','inspectionFemaleBodyFaces','makehumanHair','makehumanBeard','loadMakehumanGroom',modelSource+';return loadStudio;')(resource,pixels,pixels,poseVertex,inspectionFemaleBodyFaces,makehumanHair,makehumanBeard,loadGroom);
 const identity=Array.from({length:240},(_,i)=>i%16%5===0?1:0),poses=JSON.parse(read('membres/v27/poses.json'));
 let maxError=0,negativeGapVertices=0,movingBeards=0;
 for(const record of all)for(const gender of ['homme','femme']){
  // Female beards exercise the owner's separate binding without changing the
  // salon's catalogue permission for ordinary female profiles.
  const look=referenceStudio(gender);look.face[record.kind==='hair'?'hair':'beard']=record.index;
  const figure=await load(look,gender),groom=figure.meshes.find(mesh=>mesh.name===record.id),body=figure.meshes.find(mesh=>mesh.name==='body');
  assert.ok(groom);assert.equal(groom.alphaCutoff,.33);assert.equal(groom.image.data[3],0);assert.equal(groom.image.data[7],97);
  assert.equal(figure.meshes.filter(mesh=>mesh.groom).length,1);
  if(record.kind==='hair')assert.equal(figure.meshes.some(mesh=>mesh.texture?.startsWith('hair')&&!mesh.groom),false);
  figure.pose(identity);
  for(let i=0;i<groom.v.length;i++)maxError=Math.max(maxError,Math.abs(groom.v[i]-groom.position[i]));
  for(let i=5;i<groom.binding.length;i+=8)if(groom.binding[i]>32767)negativeGapVertices++;
  const neutral=groom.v.slice();
  if(record.kind==='beard'){
   const ids=new Set();for(let i=0;i<groom.binding.length;i+=8)for(let j=0;j<3;j++)ids.add(groom.binding[i+j]);
   const jaw=Int16Array.from([...ids].flatMap(id=>[id,-7,-80,15]));
   figure.enableSpeech({bodyjaw:jaw});figure.pose(identity,{jaw:1});
   assert.notDeepEqual(groom.v,neutral,'The beard must follow speech vertices, not just the head bone');movingBeards++;
  }
  figure.pose(poses[gender==='femme'?'f':'m'][3]);
  assert.ok([...groom.v].every(Number.isFinite));
  for(let i=0;i<groom.v.length;i+=3){assert.ok(Math.abs(groom.v[i])<15000);assert.ok(groom.v[i+1]>3000&&groom.v[i+1]<24000);assert.ok(Math.abs(groom.v[i+2])<15000);}
  assert.ok(body.faces.length>0);assert.ok(groom.faces instanceof Uint16Array);
 }
 assert.ok(maxError<=4,`neutral fit deviation ${maxError/10} mm`);
 assert.ok(negativeGapVertices>0,'Real roots below the surface exercise signed gaps');
 assert.equal(movingBeards,10);
 assert.equal(new Set(requested).size,30);assert.equal(requested.length,30,'Selecting the second body reuses only that selected asset');
});
