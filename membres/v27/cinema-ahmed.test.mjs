import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from 'three';
import {seats} from '../salon-plan.js';
import {dressAhmed} from '../intro-wardrobe.js';
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
 };
 return {actor,model,source,bones,mouth,compact,applied,calls,dress,now:()=>time,tick:()=>time+=.1};
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
 const x=fixture(),controller=await attachCinemaAhmed(x.actor,{model:x.model,dress:x.dress,now:x.now});
 assert.equal(controller.active,true);assert.equal(x.actor.root.name,'Ahmed');assert.equal(x.compact.obj.visible,false);
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

 const x=fixture(),controller=await attachCinemaAhmed(x.actor,{model:x.model,dress:x.dress,now:x.now});
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
  return {appearance:look,pose(){},meshes:[body,...Object.values(look.outfit).map(piece)]};
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
