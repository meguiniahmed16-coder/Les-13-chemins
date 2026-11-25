import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as T from 'three';
import {seats} from '../salon-plan.js';
import {dressAhmed,prepareIntroAppearance} from '../intro-wardrobe.js';
import {poseVertex} from '../salon-pose.js';
import {attachCinemaAhmed,cinemaAhmedAsset,cinemaAhmedLook,fetchCinemaAhmed,sameAhmedPortrait} from './cinema-ahmed.js';

const digest=Uint8Array.from(cinemaAhmedAsset.sha256.match(/../g),value=>parseInt(value,16));
function fakePart(name='garment'){
 const geometry=new T.BoxGeometry(.15,.25,.1),map=new T.DataTexture(new Uint8Array([255,255,255,255]),1,1);
 const obj=new T.Mesh(geometry,new T.MeshStandardMaterial({map}));
 return {name,obj,base:geometry.attributes.position.array.slice(),poses:[],seated:{}};
}
function fixture(){
 const root=new T.Group(),body=new T.Group(),compact=fakePart('compact');root.scale.setScalar(1.075);root.add(body);body.add(compact.obj);
 const actor={id:'m',root,body,parts:[compact],phase:0,sit:0,speed:0};
 const model=new T.Group(),source=new T.Group(),bones=Array.from({length:15},()=>new T.Bone());
 source.scale.setScalar(1.075);source.position.y=-.007955;model.add(source);bones[1].position.y=1.5;source.add(...bones);
 const skeleton=new T.Skeleton(bones),skin=new T.SkinnedMesh(new T.BoxGeometry(.2,1.5,.2),new T.MeshStandardMaterial());skin.bind(skeleton);source.add(skin);
 for(const name of ['Haut_blanc','Pantalon_blanc','Chaussures_blanches']){const mesh=new T.SkinnedMesh(new T.BoxGeometry(.2,.2,.2),new T.MeshStandardMaterial());mesh.name=name;mesh.bind(skeleton);source.add(mesh);}
 const mouth=new T.Mesh(new T.BoxGeometry(.05,.02,.01),new T.MeshStandardMaterial());mouth.morphTargetDictionary={Ouvrir:0,Cligner:1,Decouvrir:2};mouth.morphTargetInfluences=[0,0,0];bones[1].add(mouth);
 const applied=[],calls=[];let time=0;
 const dress=async(a,rig,parent,old,options={})=>{
  calls.push({a,rig,parent,options});for(const object of old)object.removeFromParent();
  a.parts=['top','trousers','shoes'].map(name=>{const p=fakePart(name);p.source={multiplier:[1,1,1]};parent.add(p.obj);return p;});
  a.wardrobe={apply:mats=>applied.push(Array.from(mats))};
  a.pose=()=>{};
 };
 const prepare=async(a,figure,options)=>{
  const group=new T.Group();group.visible=false;source.add(group);
  const parts=['top','trousers','shoes'].map(name=>{const part=fakePart(name);part.source={multiplier:[1,1,1]};group.add(part.obj);return part;});
  return {activate(){for(const part of a.parts)part.obj.visible=false;a.parts=parts;a.wardrobe={apply:mats=>applied.push(Array.from(mats))};group.visible=true;},
   dispose(){for(const part of parts){part.obj.geometry.dispose();part.obj.material.map.dispose();part.obj.material.dispose();}group.removeFromParent();}};
 };
 return {actor,model,source,skin,bones,mouth,compact,applied,calls,dress,prepare,now:()=>time,tick:()=>time+=.1};
}

test('the salon requests the exact private prologue model in bounded groups and verifies its digest',async()=>{
 const requests=[];let active=0,maxActive=0,checked=false;
 const bytes=await fetchCinemaAhmed(async(url,options)=>{
  requests.push({url,options});active++;maxActive=Math.max(maxActive,active);await Promise.resolve();active--;
  const group=Number(url.slice(-3)),length=Math.min(cinemaAhmedAsset.unit*3,cinemaAhmedAsset.bytes-group*3*cinemaAhmedAsset.unit);
  return new Response(new Uint8Array(length).fill(group+1));
 },{async digest(algorithm,data){assert.equal(algorithm,'SHA-256');assert.equal(data.byteLength,cinemaAhmedAsset.bytes);checked=true;return digest;}});
 assert.equal(bytes.byteLength,cinemaAhmedAsset.bytes);assert.equal(maxActive,2);assert.equal(requests.length,4);assert.ok(checked);
 assert.ok(requests.every(({url,options})=>url.startsWith('/api/intro-private/ahmedfast/')&&options.credentials==='same-origin'));
 assert.equal(new Uint8Array(bytes)[cinemaAhmedAsset.unit*3],2);
 assert.equal(new Uint8Array(bytes).at(-1),4);
});

test('legacy fragments are a compatible-host fallback; authorization failure is not retried through them',async()=>{
 const requests=[];
 const fetcher=async url=>{
  requests.push(url);const index=Number(url.slice(-3));
  if(url.includes('/ahmedfast/')&&index===1)return new Response('',{status:404});
  const start=index*(url.includes('/ahmedfast/')?3:1)*cinemaAhmedAsset.unit;
  const size=Math.min(cinemaAhmedAsset.bytes-start,cinemaAhmedAsset.unit*(url.includes('/ahmedfast/')?3:1));
  return new Response(new Uint8Array(size));
 };
 await fetchCinemaAhmed(fetcher,{digest:async()=>digest});
 assert.deepEqual(requests.filter(url=>url.includes('/ahmedv3/')).map(url=>url.slice(-3)),['003','004','005']);
 const denied=[];
 await assert.rejects(fetchCinemaAhmed(async url=>{denied.push(url);return new Response('',{status:403});}),/HTTP 403/);
 assert.ok(denied.every(url=>url.includes('/ahmedfast/')));
 await assert.rejects(fetchCinemaAhmed(fetcher,{digest:async()=>new Uint8Array(32)}),/retéléchargé/);
});

test('the original source transform is preserved once, and navigation/seat/flight matrices reach its rig',async()=>{
 const x=fixture(),controller=await attachCinemaAhmed(x.actor,{model:x.model,dress:x.dress,prepare:x.prepare,now:x.now});
 assert.equal(controller.active,true);assert.equal(x.actor.root.name,'Ahmed Marie');assert.equal(x.compact.obj.visible,false);
 assert.equal(x.calls.length,1);assert.ok(x.calls[0].rig.every((bone,i)=>bone===x.bones[i]));
 x.actor.root.updateMatrixWorld(true);
 const head=x.bones[1].getWorldPosition(new T.Vector3());
 assert.ok(Math.abs(head.y-(1.5*1.075-.007955+.0206))<1e-9,'Do not apply the GLB scale twice');
 assert.ok(Math.abs(controller.headPosition().y-head.y-.135)<1e-9);
 const idle=x.applied.at(-1);x.tick();controller.animate(.8,null,.1);const walk=x.applied.at(-1);
 assert.notDeepEqual(walk,idle);assert.ok(x.actor.phase>0);
 x.actor.sit=1;x.tick();controller.animate(0,{id:'chair',source:seats.find(seat=>seat.id==='chair')},0);
 const seated=x.applied.at(-1);assert.notDeepEqual(seated,walk);assert.ok(seated.every(Number.isFinite));
 controller.glide(2,-.12);assert.notDeepEqual(x.applied.at(-1),seated);
 controller.talk({jaw:.25,blink:.4,spread:.5});assert.deepEqual(x.mouth.morphTargetInfluences,[.25,.4,.09]);
 controller.hide();assert.equal(controller.animate(.8,null,.1),false);controller.restore();assert.equal(controller.active,true);
 assert.equal(x.actor.parts,controller.parts);assert.ok(x.actor.parts.every(part=>part.obj.visible));
});

test('clothing-only customization keeps the portrait; explicit facial choices use the existing real customization path',async()=>{
 const baseline=cinemaAhmedLook(),clothes={...baseline,outfit:{...baseline.outfit,haut:'mh2909'}};
 assert.equal(sameAhmedPortrait(clothes),true);
 for(const key of ['hair','body','face'])assert.equal(sameAhmedPortrait({...baseline,face:{...baseline.face,[key]:baseline.face[key]+1}}),false);
 assert.equal(sameAhmedPortrait({...baseline,skinLevel:74}),false);assert.equal(sameAhmedPortrait({...baseline,iris:'#445566'}),false);

 const x=fixture(),controller=await attachCinemaAhmed(x.actor,{model:x.model,dress:x.dress,prepare:x.prepare,now:x.now});
 const originalParts=controller.parts;
 assert.equal(await controller.dress({appearance:clothes}),true);assert.equal(controller.active,true);
 assert.notEqual(x.actor.parts,originalParts);assert.ok(originalParts.every(part=>!part.obj.visible));
 controller.restore();assert.equal(x.actor.parts,originalParts);assert.ok(originalParts.every(part=>part.obj.visible));

 // Run the production bridge routing, including its normal model creation and
 // reset code. No browser rendering or private portrait is needed for this gate.
 const source=readFileSync(new URL('./scene-members.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace('export function createMemberBridge','function createMemberBridge');
 const a=x.actor,actors={m:a},events=[];
 a.cinemaAhmed={supports:(look,gender)=>gender==='homme'&&sameAhmedPortrait(look),active:true,
  async dress(){events.push('clothes');return true;},hide(){events.push('hide');this.active=false;},restore(){events.push('restore');this.active=true;a.parts=originalParts;}};
 const poses={m:{rest:new Float32Array(240)}};for(let i=0;i<8;i++)poses.m[i]=poses.m.rest;
 const create=new Function('T','perform','defaultMotion','wardrobeMotion','attachFemaleHead','loadFemaleReference','attachCinemaAhmed','fetch',source+';return createMemberBridge;')(T,()=>{},()=>{},()=>({release(){}}),()=>{},()=>{},()=>{},async()=>Response.json(poses));
 const bridge=create({T,actors,player:()=>a,partner:()=>a,animateBody(){events.push('pose');},setRole(){}});
 await bridge.dress('m',{appearance:clothes},'homme',()=>true);assert.ok(events.includes('clothes'));assert.equal(a.cinemaAhmed.active,true);
 const face={...baseline,face:{...baseline.face,hair:1}},figure={appearance:face,pose(){},meshes:[{name:'body',v:new Int16Array([0,0,0,1000,0,0,0,1000,0]),vn:new Int8Array([0,0,127,0,0,127,0,0,127]),uv:new Uint16Array(6),faces:new Uint16Array([0,1,2]),allFaces:new Uint16Array([0,1,2]),image:{data:[255,255,255,255],width:1,height:1},multiplier:[1,1,1]}]};
 await bridge.dress('m',figure,'homme',()=>true);assert.equal(a.cinemaAhmed.active,false);assert.equal(a.salonLook,face);assert.notEqual(a.parts,originalParts);
 bridge.reset('m');assert.equal(a.cinemaAhmed.active,true);assert.equal(a.parts,originalParts);assert.equal(a.salonLook,null);
});

test('MakeHuman hair and beards keep the private Ahmed face and hide all primitives of his former curls',async()=>{
 const base=cinemaAhmedLook();
 for(const face of [{hair:12},{hair:36,beard:9,hairTone:3},{beard:5},{hair:11},{hairTone:3}]){
  assert.equal(sameAhmedPortrait({...base,face:{...base.face,...face}}),true);
 }
 assert.equal(sameAhmedPortrait({...base,face:{...base.face,hair:12,nose:2}}),false);
 const x=fixture(),hair=new T.Group();hair.name='Boucles_|_Chevelure_intérieure';hair.add(fakePart('primitive').obj);x.bones[1].add(hair);
 const controller=await attachCinemaAhmed(x.actor,{model:x.model,dress:x.dress,prepare:x.prepare,now:x.now});
 const face=x.mouth,geometry=face.geometry;
 await controller.dress({appearance:{...base,face:{...base.face,hair:12,beard:5}}});
 assert.equal(hair.visible,false);assert.equal(face.geometry,geometry);assert.equal(controller.active,true);
 controller.restore();assert.equal(hair.visible,true);assert.equal(face.geometry,geometry);
});

test('dyeing the original curls uses private materials and textures and restores their exact original appearance',async t=>{
 const previousImageData=globalThis.ImageData;
 globalThis.ImageData=class{constructor(data,width,height){this.data=data;this.width=width;this.height=height;}};
 t.after(()=>{if(previousImageData===undefined)delete globalThis.ImageData;else globalThis.ImageData=previousImageData;});
 const x=fixture(),hair=new T.Group();hair.name='Boucles_|_Chevelure_intérieure';
 const shared=new T.MeshStandardMaterial({color:'#432b21',roughness:.83,opacity:.72,transparent:true});
 const roots=new T.MeshStandardMaterial({color:'#24160e',roughness:.91});
 const sourcePixels=new Uint8Array([26,17,16,0,67,43,33,128,125,88,66,255]),originalPixels=sourcePixels.slice(),map=new T.DataTexture(sourcePixels,3,1);map.colorSpace=T.SRGBColorSpace;
 const texturedMaterial=new T.MeshStandardMaterial({map,alphaTest:.33});
 const strand=fakePart('strand').obj,sections=fakePart('sections').obj,textured=fakePart('textured').obj;
 strand.material=shared;sections.material=[shared,roots];textured.material=texturedMaterial;hair.add(strand,sections,textured);x.bones[1].add(hair);
 // A shared source material must not tint another part of the portrait.
 x.mouth.material=shared;
 const originalSections=sections.material,originalColour=shared.color.clone(),rootColour=roots.color.clone(),portrait=x.mouth.geometry;
 const controller=await attachCinemaAhmed(x.actor,{model:x.model,dress:x.dress,prepare:x.prepare,now:x.now});
 const look=cinemaAhmedLook(),dress=tone=>controller.dress({appearance:{...look,face:{...look.face,hairTone:tone}}});
 await dress(3);
 assert.equal(controller.active,true);assert.equal(hair.visible,true);
 assert.notEqual(strand.material,shared);assert.notEqual(sections.material,originalSections);
 assert.notEqual(sections.material[0],shared);assert.notEqual(sections.material[1],roots);
 assert.notDeepEqual(strand.material.color.toArray(),originalColour.toArray());
 assert.notEqual(textured.material.map,map);assert.notEqual(textured.material.map.source,map.source);
 assert.notDeepEqual(Array.from(textured.material.map.image.data),Array.from(originalPixels));
 assert.deepEqual(map.image.data,originalPixels);assert.equal(textured.material.alphaTest,.33);
 assert.equal(textured.material.map.colorSpace,T.SRGBColorSpace);
 for(let i=3;i<originalPixels.length;i+=4)assert.equal(textured.material.map.image.data[i],originalPixels[i]);
 assert.equal(strand.material.opacity,.72);assert.equal(strand.material.roughness,.83);
 assert.equal(x.mouth.material,shared);assert.equal(x.mouth.geometry,portrait);
 assert.deepEqual(shared.color.toArray(),originalColour.toArray());assert.deepEqual(roots.color.toArray(),rootColour.toArray());
 const blonde=strand.material.color.toArray(),blondePixels=Array.from(textured.material.map.image.data);
 await dress(11);await dress(3);assert.deepEqual(strand.material.color.toArray(),blonde,'Dye changes must always start from the original material');
 assert.deepEqual(Array.from(textured.material.map.image.data),blondePixels,'Dye changes must always start from the original texture');
 let disposed=0;const clones=[strand.material,...sections.material,textured.material,textured.material.map];for(const resource of clones)resource.addEventListener('dispose',()=>disposed++);
 await dress(0);assert.equal(strand.material,shared);assert.equal(sections.material,originalSections);assert.equal(textured.material,texturedMaterial);assert.equal(textured.material.map,map);assert.equal(disposed,clones.length);
 await dress(4);controller.restore();assert.equal(strand.material,shared);assert.equal(sections.material,originalSections);
 assert.deepEqual(shared.color.toArray(),originalColour.toArray());assert.deepEqual(map.image.data,originalPixels);assert.equal(textured.material,texturedMaterial);assert.equal(x.mouth.geometry,portrait);
});

test('saved looks and added accessories preserve the cinematic white fabrics while new garments keep their colors',async()=>{
 const originalFetch=globalThis.fetch;
 globalThis.fetch=async url=>{
  assert.equal(url,'/membres/v27/poses.json');
  return new Response(readFileSync(new URL('./poses.json',import.meta.url),'utf8'));
 };
 const dye=[31,47,83,255];
 function piece(id){
  return {id,name:id,n:3,binding:new Uint16Array(24),
   v:new Int16Array([0,0,0,1000,0,0,0,1000,0]),vn:new Int8Array([0,0,127,0,0,127,0,0,127]),
   uv:new Uint16Array(6),faces:new Uint16Array([0,1,2]),allFaces:new Uint16Array([0,1,2]),
   image:{data:new Uint8Array(dye),width:1,height:1},multiplier:[1,1,1]};
 }
 function figure(look){
  const body=piece('body');delete body.binding;
  body.rig=new Uint8Array(24);for(let i=0;i<3;i++)body.rig[i*8+4]=255;
  const groups={haut:'hauts',bas:'pantalons',souliers:'chaussures',culotte:'culottes',lunettes:'lunettes'};
  return {appearance:look,pose(){},meshes:[body,...Object.entries(look.outfit).map(([slot,id])=>Object.assign(piece(id),{group:groups[slot]}))]};
 }
 try{
  const x=fixture(),look=cinemaAhmedLook();
  const controller=await attachCinemaAhmed(x.actor,{model:x.model,now:x.now,
   dress:(a,rig,parent,old,options={})=>dressAhmed(a,rig,parent,old,{...options,figure:options.figure||figure(look)})});
  const textures=()=>new Map(x.actor.parts.map(part=>[part.source.id,Array.from(part.obj.material.map.image.data)]));
  const original=textures();
  for(const rgba of original.values()){
   assert.ok(rgba[0]>=222&&rgba[0]===rgba[1]&&rgba[1]===rgba[2]);
   assert.equal(rgba[3],255);
  }
  const reloaded=JSON.parse(JSON.stringify(look));
  await controller.dress(figure(reloaded));
  assert.deepEqual(textures(),original,'Reloading the saved outfit preserves its visible white fabrics');
  const accessorized={...reloaded,outfit:{...reloaded.outfit,lunettes:'mh153'}};
  await controller.dress(figure(accessorized));
  for(const [id,rgba] of original)assert.deepEqual(textures().get(id),rgba,'Adding glasses leaves existing garments unchanged');
  assert.deepEqual(textures().get('mh153'),dye,'The glasses keep their own texture colors');
  const changed={...accessorized,outfit:{...accessorized.outfit,haut:'mh2909'}};
  await controller.dress(figure(changed));
  assert.deepEqual(textures().get('mh2909'),dye,'A newly chosen top keeps its intended color');
  for(const id of [look.outfit.bas,look.outfit.souliers])assert.deepEqual(textures().get(id),original.get(id));
  assert.equal(controller.active,true,'Clothing changes retain the original portrait');
 }finally{globalThis.fetch=originalFetch;}
});

test('authorized inspection completes Ahmed’s torso and legs, removes every garment, and restores his exact portrait and outfit',async()=>{
 const read=path=>readFileSync(new URL('../../'+path,import.meta.url));
 const index=JSON.parse(read('assets-source/salon-v27/assets.json'));
 const archive=Buffer.concat(index.packs.map(p=>read('assets-source/salon-v27/'+p)));
 const resources=new Map(),types={Uint8Array,Uint16Array,Int8Array,Int16Array};
 async function resource(name){
  if(resources.has(name))return resources.get(name);
  const [offset,length]=index.files[name+'.bin'],zipped=gunzipSync(archive.subarray(offset,offset+length));
  const data=zipped.buffer.slice(zipped.byteOffset,zipped.byteOffset+zipped.byteLength),size=new DataView(data).getUint32(0,true),start=4+size;
  const value=JSON.parse(new TextDecoder().decode(new Uint8Array(data,4,size)),(_,v)=>v&&types[v.type]?new types[v.type](data,start+v.offset,v.bytes/types[v.type].BYTES_PER_ELEMENT):v);
  resources.set(name,value);return value;
 }
 const pixels=async()=>({width:1,height:1,data:new Uint8ClampedArray([180,135,110,255])});
 const code=read('membres/studio-model.js').toString().replace(/^import .*;\n/gm,'').replace('export async function loadStudio','async function loadStudio');
 const loadReal=new Function('resource','pixels','material','poseVertex',code+';return loadStudio;')(resource,pixels,pixels,poseVertex);
 const poses=JSON.parse(read('membres/v27/poses.json')),originalFetch=globalThis.fetch;
 globalThis.fetch=async url=>{
  if(url==='/membres/v27/poses.json')return Response.json(poses);
  assert.equal(url,'/api/membres/admin/settings');return Response.json({label:'Atelier auteur',reference:'/private/reference'});
 };
 try{
  const look=cinemaAhmedLook(),empty={...look,outfit:{}},bare=await loadReal(empty,'homme',{inspection:true});bare.pose(poses.m.rest);
  assert.equal(bare.inspection,true);assert.equal(bare.meshes.filter(m=>m.binding).length,0);
  const x=fixture(),body=bare.meshes.find(m=>m.name==='body'),geometry=new T.BufferGeometry(),privateFaces=[];
  geometry.setAttribute('position',new T.Float32BufferAttribute(Float32Array.from(body.v,v=>v*.0001),3));
  const skinIndices=new Uint16Array(body.n*4),skinWeights=new Float32Array(body.n*4);
  for(let i=0;i<body.n;i++)for(let k=0;k<4;k++){skinIndices[i*4+k]=body.rig[i*8+k];skinWeights[i*4+k]=body.rig[i*8+4+k]/255;}
  geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(skinIndices,4));geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(skinWeights,4));
  const privateVertex=i=>body.v[i*3+1]>13200||Math.abs(body.v[i*3])>3750;
  for(let i=0;i<body.faces.length;i+=3){
   const ids=Array.from(body.faces.subarray(i,i+3)),y=ids.reduce((sum,id)=>sum+body.v[id*3+1],0)/3;
   if(ids.every(privateVertex)||(y>11000&&y<11300))privateFaces.push(...ids);
  }
  geometry.setIndex(privateFaces);x.skin.geometry.dispose();x.skin.geometry=geometry;
  const portraitGeometry=x.skin.geometry,portraitMaterial=x.skin.material,mouth=x.mouth;
  const initial=await loadReal(look,'homme');let hold=false,release,prepared;
  const preparedPromise=new Promise(resolve=>prepared=resolve),gate=new Promise(resolve=>release=resolve);
  const controller=await attachCinemaAhmed(x.actor,{model:x.model,now:x.now,
   dress:(a,rig,parent,old,options={})=>dressAhmed(a,rig,parent,old,{...options,figure:options.figure||initial}),
   prepare:async(...args)=>{const draft=await prepareIntroAppearance(...args);if(hold){prepared();await gate;}return draft;}
  });
  const originalParts=x.actor.parts,originalIndex=x.skin.geometry.index.array.slice(),originalChildren=x.source.children.length;
  const boneMatrices=x.bones.map(bone=>bone.matrix.clone());
  let valid=true;hold=true;const cancelled=controller.dress(bare,()=>valid);await preparedPromise;
  assert.equal(x.actor.parts,originalParts);assert.ok(originalParts.every(part=>part.obj.visible));
  assert.deepEqual(x.skin.geometry.index.array,originalIndex,'Preparing inspection never unmasks the live portrait early');
  x.bones.forEach((bone,i)=>assert.deepEqual(bone.matrix.elements,boneMatrices[i].elements,'Preparation never resets a moving private rig'));
  valid=false;release();assert.equal(await cancelled,false);assert.equal(x.source.children.length,originalChildren);
  hold=false;assert.equal(await controller.dress(bare),true);
  const patch=x.actor.parts.find(part=>part.introSkinSupplement);
  assert.ok(patch&&patch.obj.geometry.index.count>10000,'The missing torso and both legs are real skinned geometry');
  assert.equal(x.actor.parts.filter(part=>part.source.binding).length,0,'No clothing or automatic underwear remains in authorized inspection');
  assert.ok(originalParts.every(part=>!part.obj.visible));
  assert.deepEqual(Array.from(x.skin.geometry.index.array),privateFaces,'All original exposed skin indices are restored independently of the prior shirt mask');
  assert.equal(x.skin.geometry,portraitGeometry);assert.equal(x.skin.material,portraitMaterial);assert.equal(x.mouth,mouth);
  const faceKeys=new Set();for(let i=0;i<patch.source.faces.length;i+=3)faceKeys.add(Array.from(patch.source.faces.subarray(i,i+3)).join(','));
  const regions={torso:0,leftLeg:0,rightLeg:0};
  for(let i=0;i<body.faces.length;i+=3){
   // Classify anatomy in its authored rest shape: a relaxed hand can pass
   // beside a thigh in the live pose and must remain the private hand.
   const ids=Array.from(body.faces.subarray(i,i+3)),x=ids.reduce((s,id)=>s+body.rest[id*3],0)/30000,y=ids.reduce((s,id)=>s+body.rest[id*3+1],0)/30000;
   const region=y>1.15&&y<1.28&&Math.abs(x)<.13?'torso':y>.20&&y<.70&&Math.abs(x)>.03&&Math.abs(x)<.25?(x<0?'leftLeg':'rightLeg'):null;
   if(!region)continue;assert.ok(faceKeys.has(ids.join(',')),region+' has no hole left by the exported clothing mask: '+ids.join(','));regions[region]++;
  }
  assert.ok(Object.values(regions).every(count=>count>100));
  const before=patch.obj.geometry.attributes.position.array.slice();controller.animate(.8,null,.2,3);
  assert.notDeepEqual(patch.obj.geometry.attributes.position.array,before,'The restored torso and legs follow the existing walking controller');
  controller.talk({jaw:.22,blink:.3});assert.equal(mouth.morphTargetInfluences[0],.22);
  const partial=await loadReal({...look,outfit:{culotte:'mh3461'}},'homme');
  assert.equal(partial.inspection,false);assert.equal(await controller.dress(partial),true);
  assert.ok(x.actor.parts.some(part=>part.introSkinSupplement),'Removing only the top also restores the torso outside inspection');
  assert.equal(x.actor.parts.filter(part=>part.source.binding).length,1,'An ordinary outfit retains its covering underwear');
  const allowed=new Set();for(let i=0;i<partial.meshes[0].faces.length;i+=3)allowed.add(Array.from(partial.meshes[0].faces.subarray(i,i+3)).join(','));
  const coveredPatch=x.actor.parts.find(part=>part.introSkinSupplement);for(let i=0;i<coveredPatch.source.faces.length;i+=3)assert.ok(allowed.has(Array.from(coveredPatch.source.faces.subarray(i,i+3)).join(',')),'Normal clothing coverage remains intact');
  controller.restore();assert.equal(x.actor.parts,originalParts);assert.ok(originalParts.every(part=>part.obj.visible));
  assert.deepEqual(x.skin.geometry.index.array,originalIndex);assert.equal(x.source.children.length,originalChildren);
  assert.equal(x.skin.geometry,portraitGeometry);assert.equal(x.skin.material,portraitMaterial);assert.ok(x.bones.every(bone=>bone.parent===x.source));
 }finally{globalThis.fetch=originalFetch;}
});
