import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as T from 'three';
import {DOJO_LOOKS,DOJO_WARDROBE_CUES,dojoLook,dojoWardrobeState,createDojoWardrobe} from './intro-dojo-wardrobe.js';
import {captureIntroAppearance,prepareIntroAppearance,dressAhmed,createIntroCastActor} from './intro-wardrobe.js';
import {DOJO_CAST,dojoCastLook,dojoCastState,dojoCastPose} from './intro-dojo-cast.js';
import {poseVertex} from './salon-pose.js';
import {SalonMotion} from './salon-v27-motion.js';
import {dojoBlocking} from './intro-dojo-director.js';
import {byId,exactStudio,normaliseStudio} from './studio-look.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url));
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};}
function fixture(load=async look=>({appearance:look})){
 const events=[],people=['m','f'].map((id,i)=>({id,root:{position:[i,0,.64],rotation:Math.PI},parts:['original-'+id]}));
 const cache=createDojoWardrobe(people,{load,
  capture:actor=>({activate(){actor.parts=['original-'+actor.id];events.push('original:'+actor.id);}}),
  prepareAppearance:async(actor,figure)=>({
   activate(){actor.parts=[figure.appearance.outfit];events.push('activate:'+actor.id);},dispose(){events.push('dispose:'+actor.id);}
  })
 });return {cache,people,events};
}

test('the demo uses complete real wardrobe looks and the existing body setting',()=>{
 for(const id of ['m','f'])for(let i=0;i<DOJO_LOOKS.length;i++){
  const look=dojoLook(id,i),gender=id==='f'?'femme':'homme';
  assert.equal(exactStudio(look,normaliseStudio(look,true,undefined,gender)),true);
  assert.ok((look.outfit.robe||(look.outfit.haut&&(look.outfit.bas||look.outfit.culotte)))&&look.outfit.souliers,'Every look is a complete outfit with shoes');
  for(const piece of Object.values(look.outfit))assert.ok(byId.has(piece),piece);
 }
 const base=dojoLook('f'),athletic=dojoLook('f',0,3);
 assert.equal(athletic.face.body,3);assert.deepEqual({...athletic.face,body:0},base.face);
 assert.deepEqual(athletic.outfit,base.outfit);
 assert.deepEqual(DOJO_WARDROBE_CUES.map(cue=>dojoWardrobeState('dojo-vetements',cue.at).lookIndex),[0,1,2,3,1,2,0]);
 const underwear=DOJO_LOOKS.findIndex(look=>look.kind==='underwear');assert.equal(underwear,3);
 for(const id of ['m','f']){
  const outfit=dojoLook(id,underwear).outfit;
  assert.ok(outfit.haut&&outfit.culotte,'Underwear changes upper and lower pieces together');
 }
 assert.equal(dojoWardrobeState('dojo-vetements',12000).lookIndex,0,'Both return to white before the cut');
 assert.equal(dojoWardrobeState('dojo-apparence',1800).bodyIndex,3);
 assert.equal(dojoWardrobeState('dojo-apparence',6500).bodyIndex,2);
 assert.equal(dojoWardrobeState('dojo-enregistrer',0).bodyIndex,0);
 assert.ok(!Object.values(dojoLook('f',2).outfit).includes('mh1640'),'The broken floral dress is no longer demonstrated');
});

test('preloading leaves both actors untouched, then switches cached outfits synchronously and only once',async()=>{
 let active=0,maxActive=0,loads=0;
 const h=fixture(async look=>{active++;maxActive=Math.max(active,maxActive);loads++;await Promise.resolve();active--;return {appearance:look};});
 const roots=structuredClone(h.people.map(p=>p.root)),parts=h.people.map(p=>p.parts);
 assert.equal(h.cache.ready,false);const pending=h.cache.prepare();await h.cache.prepare();assert.equal(await pending,true);
 assert.equal(loads,6);assert.equal(maxActive,1);assert.deepEqual(h.events,[]);
 assert.ok(h.people.every((p,i)=>p.parts===parts[i]));assert.deepEqual(h.people.map(p=>p.root),roots);
 const actual=h.cache.apply({id:'dojo-vetements'},1800);
 assert.equal(actual.ready,true);assert.equal(actual.lookIndex,1);assert.equal(typeof actual.then,'undefined');
 assert.equal(h.events.length,2);h.cache.apply({id:'dojo-vetements'},1900);assert.equal(h.events.length,2);
 h.cache.apply({id:'dojo-apparence'},2000);assert.equal(h.cache.state.bodyIndex,3);
 h.cache.apply({id:'dojo-enregistrer'},0);assert.ok(h.people.every(p=>p.parts[0]==='original-'+p.id));
 assert.deepEqual(h.people.map(p=>p.root),roots,'No outfit/body choice moves either actor');
 h.cache.dispose();assert.equal(h.cache.ready,false);assert.equal(h.events.filter(e=>e.startsWith('dispose')).length,6);
});

test('a failed underwear load leaves both complete original outfits visible',async()=>{
 let loads=0;
 const h=fixture(async look=>{if(++loads===6)throw Error('Underwear texture missing');return {appearance:look};});
 await assert.rejects(h.cache.prepare(),/Underwear texture missing/);
 assert.equal(h.cache.ready,false);assert.ok(h.people.every(p=>p.parts[0]==='original-'+p.id));
 assert.equal(h.events.filter(e=>e.startsWith('activate')).length,0);
 assert.equal(h.events.filter(e=>e.startsWith('dispose')).length,5);
 assert.equal(h.cache.apply({id:'dojo-vetements'},5000).lookIndex,0);
});

test('fabric colours preserve opacity and never alter the decoded source or the skin',async()=>{
 const shared={width:1,height:1,data:new Uint8ClampedArray([190,100,70,247])},prepared=[];
 const people=['m','f'].map(id=>({id}));
 const demo=createDojoWardrobe(people,{
  capture:()=>({activate(){}}),
  load:async look=>({appearance:look,meshes:[{name:'body',image:shared},...Object.values(look.outfit).map(id=>({id,binding:true,image:shared}))]}),
  prepareAppearance:async(actor,figure)=>{prepared.push({actor:actor.id,figure});return {activate(){},dispose(){}};}
 });
 await demo.prepare();assert.deepEqual(Array.from(shared.data),[190,100,70,247]);
 const jacket=prepared.find(item=>item.actor==='m'&&item.figure.appearance.outfit.haut==='mh1800').figure;
 const dyed=jacket.meshes.find(part=>part.id==='mh1800').image;
 assert.notEqual(dyed,shared);assert.notDeepEqual(dyed.data,shared.data);assert.equal(dyed.data[3],247);
 assert.equal(jacket.meshes[0].image,shared,'Skin remains the original complexion');
 demo.dispose();
});

test('skipping during a wardrobe download cannot attach or activate a late appearance',async()=>{
 const gate=deferred(),h=fixture(async look=>{await gate.promise;return {appearance:look};});
 const pending=h.cache.prepare();h.cache.restore();gate.resolve();assert.equal(await pending,false);
 assert.equal(h.cache.ready,false);assert.deepEqual(h.events,[]);
 assert.equal(h.cache.apply({id:'dojo-vetements'},4000).lookIndex,0);
 assert.equal(await h.cache.prepare(),false);
});

test('the gallery offers four different complete adult characters and never labels an inferred origin',()=>{
 assert.equal(DOJO_CAST.length,4);
 const shapes=new Set(),tones=new Set(),faces=new Set();
 for(let i=0;i<DOJO_CAST.length;i++){
  const item=DOJO_CAST[i],look=dojoCastLook(i);shapes.add(look.face.body);tones.add(look.skinLevel);faces.add(JSON.stringify(look.face));
  assert.equal(exactStudio(look,normaliseStudio(look,true,undefined,item.gender)),true);
  assert.ok(look.face.age<5,'Examples are adults');
  assert.ok(look.outfit.haut&&look.outfit.bas&&look.outfit.souliers,'Every example has a complete fitted outfit');
  assert.ok(!look.outfit.robe&&!look.outfit.veste,'Examples avoid overlapping loose layers');
  for(const id of Object.values(look.outfit))assert.ok(byId.has(id));
  assert.ok(item.label&&item.bodyLabel&&item.color);
 }
 assert.equal(shapes.size,4);assert.equal(tones.size,4);assert.equal(faces.size,4);
 assert.deepEqual([0,3000,6000,9000].map(t=>dojoCastState('dojo-personnaliser',t).castIndex),[0,1,2,3]);
 assert.deepEqual([0,2500,5000,7500].map(t=>dojoCastState('dojo-apparence',t).castIndex),[0,1,2,3]);
 assert.equal(dojoCastState('dojo-vetements',0).castIndex,-1);
});

test('skipping while an example is being prepared never reveals a late cast or leaves its root behind',async()=>{
 const scene=new T.Scene(),people=['m','f'].map(id=>{const root=new T.Group();scene.add(root);return {id,root};});
 const gate=deferred(),started=deferred();let released=0;
 const cache=createDojoWardrobe(people,{scene,load:async look=>({appearance:look}),
  capture:()=>({activate(){}}),prepareAppearance:async()=>({activate(){},dispose(){}}),
  prepareCast:async(root)=>{started.resolve();await gate.promise;return {root,dispose(){released++;root.removeFromParent();}};}
 });
 const pending=cache.prepare();await started.promise;cache.restore();gate.resolve();
 assert.equal(await pending,false);assert.equal(cache.previewActor,null);assert.equal(released,1);
 assert.equal(scene.children.length,2);assert.ok(people.every(p=>p.root.visible));
});

// Use the actual meshes and fit/deformation code. Replacing image decoding
// does not change outfit coverage, morphology, skeletal pose or root stability.
const index=JSON.parse(read('assets-source/salon-v27/assets.json'));
const archive=Buffer.concat(index.packs.map(p=>read('assets-source/salon-v27/'+p)));
const resources=new Map(),types={Uint8Array,Uint16Array,Int8Array,Int16Array};
async function resource(name){
 if(resources.has(name))return resources.get(name);
 const [offset,length]=index.files[name+'.bin'];const zipped=gunzipSync(archive.subarray(offset,offset+length));
 const data=zipped.buffer.slice(zipped.byteOffset,zipped.byteOffset+zipped.byteLength),size=new DataView(data).getUint32(0,true),start=4+size;
 const value=JSON.parse(new TextDecoder().decode(new Uint8Array(data,4,size)),(_,v)=>v&&types[v.type]?new types[v.type](data,start+v.offset,v.bytes/types[v.type].BYTES_PER_ELEMENT):v);
 resources.set(name,value);return value;
}
const pixels=async()=>({width:1,height:1,data:new Uint8ClampedArray([42,91,137,255])});
const code=read('membres/studio-model.js').toString().replace(/^import .*;\n/gm,'').replace('export async function loadStudio','async function loadStudio');
const loadReal=new Function('resource','pixels','material','poseVertex',code+';return loadStudio;')(resource,pixels,pixels,poseVertex);
const poses=JSON.parse(read('membres/v27/poses.json'));

test('the real gallery preserves the hosts, switches one whole avatar, and keeps all four pairs of shoes on the floor',async t=>{
 const originalFetch=globalThis.fetch;globalThis.fetch=async url=>{
  assert.equal(url,'/membres/v27/poses.json');return new Response(JSON.stringify(poses));
 };
 try{
  const scene=new T.Scene(),people=['m','f'].map(id=>{
   const root=new T.Group();scene.add(root);return {id,root,head:{identity:id},parts:['original-'+id]};
  });
  const identities=people.map(p=>p.head),floorY=-.003,center=new T.Vector3(1,floorY,2);
  const cache=createDojoWardrobe(people,{scene,center,floorY,load:loadReal,
   capture:actor=>({activate(){actor.parts=['original-'+actor.id];}}),
   prepareAppearance:async(actor,figure)=>({activate(){actor.parts=[figure.appearance.outfit];},dispose(){}})
  });
  await cache.prepare();assert.equal(cache.previewActor,null);assert.ok(people.every(p=>p.root.visible));
  const widths=[];
  for(let index=0;index<DOJO_CAST.length;index++){
   const elapsed=index*3000+1250,state=cache.apply('dojo-personnaliser',elapsed),actor=cache.previewActor;
   assert.equal(state.castIndex,index);assert.ok(actor);assert.equal(actor.id,'preview');
   assert.ok(people.every((p,i)=>!p.root.visible&&p.head===identities[i]),'Both original portraits remain untouched behind the independent preview');
   assert.equal(scene.children.filter(o=>o.visible).length,1,'Only one complete example is visible');
   assert.deepEqual(actor.root.position.toArray(),[1,floorY,2.35]);
   assert.equal(actor.root.rotation.y,Math.PI,'The example does not spin its planted feet');
   const worldHead=actor.previewHead.getWorldPosition(new T.Vector3());
   assert.ok(worldHead.y>1.35&&worldHead.y<1.90,'The dedicated camera target follows the real head');
   assert.ok(actor.height>1.5&&actor.height<2.1);widths.push(actor.bounds.max.x-actor.bounds.min.x);
   for(const local of [0,625,1250,1875,2500]){
    actor.pose(0,dojoCastPose(index,local));
    let bottom=Infinity;const point=new T.Vector3();
    for(const part of actor.parts.filter(p=>p.source.group==='chaussures'))for(const vertex of new Set(part.source.faces)){
     point.fromBufferAttribute(part.obj.geometry.attributes.position,vertex).applyMatrix4(part.obj.matrixWorld);bottom=Math.min(bottom,point.y);
    }
    assert.ok(Math.abs(bottom-floorY-.002)<.00001,'The real soles stay two millimetres above the tatami');
   }
   t.diagnostic(`${DOJO_CAST[index].label}: full figure ${actor.height.toFixed(3)} m, sole +2 mm`);
  }
  assert.ok(Math.max(...widths)-Math.min(...widths)>.035,'Selected shapes visibly change the full silhouette');
  cache.apply('dojo-vetements',0);assert.equal(cache.previewActor,null);assert.ok(people.every(p=>p.root.visible));
  cache.restore();cache.restore();assert.equal(scene.children.length,2,'Skipping/removing the introduction leaves only the original hosts');
  assert.ok(people.every((p,i)=>p.head===identities[i]&&p.root.visible));
 }finally{globalThis.fetch=originalFetch;}
});

test('all alternate clothes load real fitted geometry and the body demonstration changes the actual silhouette',async()=>{
 for(const id of ['m','f'])for(const lookIndex of [1,2,3]){
  const look=dojoLook(id,lookIndex),figure=await loadReal(look,id==='f'?'femme':'homme');figure.pose(poses[id].rest);
  const clothes=figure.meshes.filter(p=>p.binding);
  assert.deepEqual(clothes.map(p=>p.id).sort(),Object.values(look.outfit).sort());
  assert.ok(clothes.every(p=>p.v.length>300&&p.faces.length>100));
 }
 const original=await loadReal(dojoLook('f'),'femme'),athletic=await loadReal(dojoLook('f',0,3),'femme');
 original.pose(poses.f.rest);athletic.pose(poses.f.rest);
 const a=original.meshes.find(p=>p.name==='body').v,b=athletic.meshes.find(p=>p.name==='body').v;
 let changes=0,maxDelta=0;for(let i=0;i<a.length;i++){if(a[i]!==b[i])changes++;maxDelta=Math.max(maxDelta,Math.abs(a[i]-b[i]));}
 assert.ok(changes>1000,'Shape selection changes many actual body vertices');assert.ok(maxDelta>30,'Shape change is geometrical, not only a UI label');
});

test('all demo outfits and the athletic silhouette keep both real soles above the tatami',async t=>{
 const floorY=-.003,line={id:'dojo-vetements',ms:12000};
 for(const id of ['m','f'])for(const variant of [0,1,2,3,...(id==='f'?[4]:[])]){
  const look=dojoLook(id,variant===4?0:variant,variant===4?3:0),figure=await loadReal(look,id==='m'?'homme':'femme');
  figure.pose(poses[id].rest);
  const shoes=figure.meshes.find(m=>m.group==='chaussures'),vertices=[...new Set(shoes.faces)];
  const feet=[-1,1].map(side=>vertices.filter(i=>Math.sign(shoes.v[3*i])===side));
  // Ahmed's imported parent has the same measured scale and source offset
  // used by intro-seat-contact.test.mjs; Marianne's root carries her scale.
  const scale=id==='m'?1.075:1.04,sourceOffset=id==='m'?-.007955:0;
  const solver=new SalonMotion(()=>{},{angle:0},undefined,()=>.42);solver.femaleHands=id==='f';
  let minimum=Infinity,maximum=-Infinity;
  for(const elapsed of [0,1800,4800,7800,11000]){
   const actor=dojoBlocking(line,elapsed,{floorY})[id];
   figure.pose(solver.sampleSalonPose(null,0,elapsed/1000+(id==='f'?2.6:0),{gesture:actor.poseGesture,look:actor.headYaw},scale));
   for(const foot of feet){
    let clearance=Infinity;
    for(const i of foot)clearance=Math.min(clearance,shoes.v[3*i+1]*.0001*scale+sourceOffset+actor.position.y-floorY);
    assert.ok(clearance>=0&&clearance<=.006,`${id}, variant ${variant}: sole clearance ${(clearance*1000).toFixed(2)} mm`);
    minimum=Math.min(minimum,clearance);maximum=Math.max(maximum,clearance);
   }
  }
  t.diagnostic(`${id}, variant ${variant}: sole clearance ${(minimum*1000).toFixed(2)} to ${(maximum*1000).toFixed(2)} mm`);
 }
});

test('Marianne’s walking soles clear the tatami and her root returns to its exact starting height',async t=>{
 const figure=await loadReal(dojoLook('f'),'femme');figure.pose(poses.f.rest);
 const shoes=figure.meshes.find(m=>m.group==='chaussures'),vertices=[...new Set(shoes.faces)];
 const feet=[-1,1].map(side=>vertices.filter(i=>Math.sign(shoes.v[3*i])===side));
 const solver=new SalonMotion(()=>{},{angle:0},undefined,()=>.42);solver.femaleHands=true;
 const floorY=-.003,line={id:'dojo-deplacement',ms:11000};let minimum=Infinity,maximumSupport=-Infinity,below=0;
 for(let elapsed=0;elapsed<=line.ms;elapsed+=50){
  const actor=dojoBlocking(line,elapsed,{floorY}).f,expression={gesture:actor.poseGesture,look:actor.headYaw};
  if(actor.gait.strength>.01){solver.expression=expression;solver.travelPose(actor.gait.phase,actor.gait.strength*.7,0);figure.pose(solver.bones());}
  else figure.pose(solver.sampleSalonPose(null,0,elapsed/1000+2.6,expression,1.04));
  const soles=feet.map(foot=>{let bottom=Infinity;for(const i of foot)bottom=Math.min(bottom,shoes.v[3*i+1]*.0001*1.04+actor.position.y-floorY);return bottom;});
  const support=Math.min(...soles);minimum=Math.min(minimum,support);maximumSupport=Math.max(maximumSupport,support);if(support<0)below++;
  assert.ok(support>=0,`Walking sole enters the tatami by ${(-support*1000).toFixed(2)} mm at ${elapsed} ms`);
  if(elapsed===0||elapsed===line.ms)assert.equal(actor.position.y,0,'The temporary walking lift vanishes exactly');
 }
 t.diagnostic(`Walking support clearance ${(minimum*1000).toFixed(2)} to ${(maximumSupport*1000).toFixed(2)} mm; ${below}/221 samples below the tatami`);
});

test('both half-turns keep a real shoe on the tatami while the other foot lifts',async t=>{
 const floorY=-.003,line={id:'dojo-demi-tour',ms:9000};
 for(const id of ['m','f']){
  const figure=await loadReal(dojoLook(id),id==='m'?'homme':'femme');figure.pose(poses[id].rest);
  const shoes=figure.meshes.find(m=>m.group==='chaussures'),vertices=[...new Set(shoes.faces)];
  const feet=[-1,1].map(side=>vertices.filter(i=>Math.sign(shoes.v[3*i])===side));
  const scale=id==='m'?1.075:1.04,sourceOffset=id==='m'?-.007955:0;
  const solver=new SalonMotion(()=>{},{angle:0},undefined,()=>.42);solver.femaleHands=id==='f';
  let minimum=Infinity,maximum=-Infinity,lift=0;
  for(let elapsed=0;elapsed<=line.ms;elapsed+=50){
   const actor=dojoBlocking(line,elapsed,{floorY})[id];
   figure.pose(solver.sampleFootworkPose(actor.gait.footwork,elapsed/1000+(id==='f'?2.6:0),{gesture:actor.poseGesture,look:actor.headYaw},scale));
   const soles=feet.map(foot=>{let bottom=Infinity;for(const i of foot)bottom=Math.min(bottom,shoes.v[3*i+1]*.0001*scale+sourceOffset+actor.position.y-floorY);return bottom;});
   const support=Math.min(...soles);minimum=Math.min(minimum,support);maximum=Math.max(maximum,support);lift=Math.max(lift,...soles);
   assert.ok(support>=0&&support<=.006,`${id}: planted shoe has ${(support*1000).toFixed(2)} mm clearance at ${elapsed} ms`);
  }
  assert.ok(lift>.035,'The free shoe really lifts');
  t.diagnostic(`${id} half-turn: support ${(minimum*1000).toFixed(2)} to ${(maximum*1000).toFixed(2)} mm; raised sole ${(lift*1000).toFixed(2)} mm`);
 }
});

test('Ahmed caches clothing without moving or posing the live private rig, then restores exact original geometry',async()=>{
 const originalFetch=globalThis.fetch;globalThis.fetch=async url=>{
  assert.equal(url,'/membres/v27/poses.json');return new Response(JSON.stringify(poses));
 };
 try{
  const root=new T.Group(),body=new T.Group(),parent=new T.Group();root.position.set(-.8,.0206,.6);root.rotation.y=2.8;root.add(body);body.add(parent);
  const bones=Array.from({length:15},()=>new T.Bone());parent.add(...bones);
  const skin=new T.SkinnedMesh(new T.BoxGeometry(.2,1.6,.18),new T.MeshStandardMaterial());parent.add(skin);
  const actor={id:'m',root,body,parts:[],sit:0},originalFigure=await loadReal(dojoLook('m'),'homme');
  await dressAhmed(actor,bones,parent,[],{figure:originalFigure,white:true});
  actor.pose(0,{time:1,energy:1,emphasis:.7,headYaw:.2});
  const original=captureIntroAppearance(actor),originalParts=actor.parts,originalIndex=Array.from(skin.geometry.index.array);
  const rootMatrix=root.matrixWorld.clone(),boneMatrices=bones.map(b=>b.matrix.clone());
  const look=dojoLook('m',1),figure=await loadReal(look,'homme'),variant=await prepareIntroAppearance(actor,figure,{look});
  assert.equal(actor.parts,originalParts);assert.ok(originalParts.every(p=>p.obj.visible));
  assert.deepEqual(Array.from(skin.geometry.index.array),originalIndex);
  root.updateMatrixWorld(true);assert.deepEqual(root.matrixWorld.elements,rootMatrix.elements);
  for(let i=0;i<bones.length;i++)assert.deepEqual(bones[i].matrix.elements,boneMatrices[i].elements,'Preload leaves the existing skeleton untouched');
  variant.activate();assert.notEqual(actor.parts,originalParts);assert.ok(originalParts.every(p=>!p.obj.visible));
  const before=actor.parts[0].obj.geometry.attributes.position.array.slice();
  actor.pose(0,{time:2,gait:{phase:.27,strength:1},headYaw:.2});
  assert.notDeepEqual(actor.parts[0].obj.geometry.attributes.position.array,before,'Cached clothes follow the real walk solver');
  original.activate();assert.equal(actor.parts,originalParts);assert.ok(originalParts.every(p=>p.obj.visible));
  assert.deepEqual(Array.from(skin.geometry.index.array),originalIndex);assert.deepEqual(root.position.toArray(),[-.8,.0206,.6]);
  variant.dispose();
  const underwearLook=dojoLook('m',3),underwearFigure=await loadReal(underwearLook,'homme');
  const underwear=await prepareIntroAppearance(actor,underwearFigure,{look:underwearLook});
  assert.equal(actor.parts,originalParts,'Preparing underwear keeps the complete original look visible');
  underwear.activate();
  const legs=actor.parts.find(part=>part.introSkinSupplement);
  assert.ok(legs&&legs.obj.geometry.index.count>1000,'The private model receives the missing lower legs');
  for(const vertex of new Set(legs.obj.geometry.index.array)){
   assert.ok(legs.source.v[3*vertex+1]<8500,'The added geometry stays below the covered waist');
   let lowerWeight=0;
   for(let k=0;k<4;k++){const bone=legs.source.rig[8*vertex+k];if(bone===0||(bone>=8&&bone<=13))lowerWeight+=legs.source.rig[8*vertex+4+k];}
   assert.ok(lowerWeight>220,'No duplicate private hands or face');
  }
  assert.equal(actor.introRig.skin,skin);assert.equal(actor.introRig.bones,bones);
  assert.equal(actor.parts.filter(part=>part.source.binding).length,3,'Top, opaque underwear and shoes appear as one complete set');
  original.activate();underwear.dispose();assert.equal(actor.parts,originalParts);
  assert.deepEqual(Array.from(skin.geometry.index.array),originalIndex);assert.deepEqual(root.position.toArray(),[-.8,.0206,.6]);
 }finally{globalThis.fetch=originalFetch;}
});
