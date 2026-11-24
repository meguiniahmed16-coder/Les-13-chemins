import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {attachFemaleHead,loadFemaleReference} from './v27/female-reference.js';
import {unzipSync,strFromU8} from 'three/examples/jsm/libs/fflate.module.js';

const $=id=>document.getElementById(id);
const canvasHost=$('stage'),bubble=$('bubble'),status=$('status');
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.35));
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
$('scene')?.remove();
const canvas=renderer.domElement;canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;';
canvasHost.prepend(canvas);
const scene=new T.Scene();scene.background=new T.Color(0xffffff);
scene.add(new T.HemisphereLight(0xffffff,0xc0baac,2.25));
const sun=new T.DirectionalLight(0xffffff,2.7);sun.position.set(-3,8,-3);sun.castShadow=true;scene.add(sun);
const fill=new T.DirectionalLight(0xffffff,.85);fill.position.set(3,4,2);scene.add(fill);
const camera=new T.PerspectiveCamera(46,1,.07,120),clock=new T.Clock();
const loader=new GLTFLoader();
let room,dojo,people=[],chairs=[],television,stage='white',step=-1,autoplay=false,autoTimer=0,alias='Voyageur',authorized=false,ready=false,angle=Math.PI,targetAngle=Math.PI,radius=3.7,joystick={x:0,y:0},drag=null,started=false,gardenLoaded=false;
const problems=[],storageKey='maison-des-rencontres-prologue-original-v3';
try{const prior=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(prior))problems.push(...prior.slice(-100))}catch{}
function remember(type,message){
 problems.push({date:new Date().toISOString(),type,step,stage,message:String(message).slice(0,3000)});
 try{localStorage.setItem(storageKey,JSON.stringify(problems.slice(-100)))}catch{}
}
window.addEventListener('error',e=>remember('Erreur JavaScript',e.message||'Erreur'));
window.addEventListener('unhandledrejection',e=>remember('Erreur asynchrone',e.reason?.message||String(e.reason)));
const lines=[
 ['Narrateur','Qu’est-ce qu’une rencontre ? Qu’est-ce que véritablement l’autre ?','white',Math.PI],
 ['Narrateur','Est-ce simplement quelqu’un qui me ressemble ?','white',Math.PI],
 ['Narrateur','Ou quelqu’un qui me révèle ce que je ne savais pas de moi-même ?','white',Math.PI],
 ['Narrateur','Nous n’avons pas besoin de répondre tout de suite. Viens, asseyons-nous.','white',Math.PI],
 ['Narrateur','Prends place.','seated',Math.PI],
 ['Narrateur','Voici le monde tel que tu l’as connu, {pseudo}.','seated',0],
 ['Narrateur','Un monde de masques. Un monde d’illusions.','seated',0],
 ['Narrateur','Un monde où tu as joué un personnage.','seated',0],
 ['Narrateur','Un monde où, tous les matins, tu te déguises pour aller travailler.','seated',0],
 ['Narrateur','Où tu ne rencontres que les masques des autres.','seated',0],
 ['Narrateur','Il existe un autre monde.','seated',Math.PI],
 ['Narrateur','Ici, tu peux prendre le risque d’être toi-même.','seated',Math.PI],
 ['Narrateur','Tu peux aussi te déguiser. Personne ne te jugera.','seated',Math.PI],
 ['Narrateur','Suis-moi.','seated',Math.PI],
 ['Narrateur','Je dois t’expliquer comment ce monde fonctionne.','dojo',Math.PI],
 ['Narrateur','Tu peux apprendre à avancer, faire tourner la caméra et modifier ton personnage.','dojo',Math.PI],
 ['Narrateur','Ce monde est encore en construction. Et toi aussi, tu participeras à sa construction.','dojo',Math.PI],
 ['Narrateur','Les papillons et la maison t’attendent dans le jardin.','dojo',Math.PI]
];

const progress={white:0,people:0},weights={white:.32,people:.68};
let pending=false,dojoTask=null,seatTask=null,initialTask=null;
function setProgress(key,value){if(!(key in progress))return;progress[key]=Math.max(progress[key],Math.min(1,value));const total=Math.floor(100*Object.keys(progress).reduce((a,k)=>a+progress[k]*weights[k],0));$('load-progress').value=total;$('load-percent').textContent=total+' %';}
async function binary(url,key){
 let last;
 for(let attempt=0;attempt<2;attempt++){
  try{
   const response=await fetch(url,{credentials:'same-origin',signal:AbortSignal.timeout(90000)});
   if(!response.ok)throw Error(url+' : HTTP '+response.status);
   const total=Number(response.headers.get('content-length'));
   if(!response.body||!total){const bytes=await response.arrayBuffer();setProgress(key,.9);return bytes;}
   const reader=response.body.getReader(),chunks=[];let received=0;
   for(;;){const {done,value}=await reader.read();if(done)break;chunks.push(value);received+=value.byteLength;setProgress(key,.9*received/total);}
   if(!received)throw Error('Fichier vide : '+url);
   const result=new Uint8Array(received);let at=0;for(const c of chunks){result.set(c,at);at+=c.byteLength;}return result.buffer;
  }catch(e){last=e;if(attempt===0)await new Promise(r=>setTimeout(r,600));}
 }
 throw last;
}
function setPending(on){pending=on;for(const id of ['next','prev','skip','auto','personalize'])$(id).disabled=on||!ready||(id==='prev'&&step<=0);$('scene-wait').hidden=!on;}
const whiteFloor=new T.Group();
const seamlessFloor=new T.Mesh(new T.PlaneGeometry(180,180),new T.MeshBasicMaterial({color:0xffffff,toneMapped:false}));
seamlessFloor.rotation.x=-Math.PI/2;seamlessFloor.position.y=-.021;whiteFloor.add(seamlessFloor);
const shadowFloor=new T.Mesh(new T.PlaneGeometry(180,180),new T.ShadowMaterial({opacity:.12}));
shadowFloor.rotation.x=-Math.PI/2;shadowFloor.position.y=-.018;shadowFloor.receiveShadow=true;whiteFloor.add(shadowFloor);
sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.5,far:25});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.00025;
const seatAnchors=new Map();
function findChild(parent,pattern){let result;parent.traverse(o=>{if(!result&&pattern.test(o.name))result=o;});return result;}
function bounds(o){return new T.Box3().setFromObject(o);}
function measureSeats(){
 room.updateMatrixWorld(true);
 for(const [id,pattern] of [['m',/RED[\s_]*CHAIR/i],['f',/BLUE[\s_]*CHAIR/i]]){
  const chair=chairs.find(o=>pattern.test(o.name));if(!chair)throw Error('Fauteuil original manquant : '+id);
  const cushion=findChild(chair,/^Cushion_low/i),front=findChild(chair,/^FeetFront/i),back=findChild(chair,/^FeetBack/i);
  if(!cushion||!front||!back)throw Error('Repères de fauteuil incomplets : '+id);
  const cb=bounds(cushion),center=cb.getCenter(new T.Vector3()),forward=bounds(front).getCenter(new T.Vector3()).sub(bounds(back).getCenter(new T.Vector3()));forward.y=0;forward.normalize();
  const contact=center.clone().addScaledVector(forward,-.12);const ray=new T.Raycaster(new T.Vector3(contact.x,cb.max.y+.6,contact.z),new T.Vector3(0,-1,0));
  const hit=ray.intersectObject(cushion,true)[0];contact.y=(hit?.point.y??cb.max.y)-.009;
  seatAnchors.set(id,{point:contact,forward,yaw:Math.atan2(forward.x,forward.z)});
 }
}
async function loadWhite(){
 const original=await binary('/assets/intro-original/white-room-start.glb','white');
 room=(await loader.parseAsync(original,'')).scene;room.name='Salle blanche originale';
 // The supplied model includes 200 alternative video-screen frames. The actual TV
 // geometry is a separate node called TV_284, and must remain visible.
 room.traverse(o=>{
  // GLTFLoader sanitizes spaces and dots in supplied node names.
  const name=o.name.replace(/[\s_.]+/g,' ').trim().toUpperCase();
  if(/^TV SCREEN(?: |\d|$)/.test(name))o.visible=false;
  if(/^(?:BLUE CHAIR|RED CHAIR|TV 284|TV CASE)(?: |$)/.test(name)){chairs.push(o);o.visible=false}
  if(o.isMesh){o.castShadow=true;o.receiveShadow=true}
 });
 television=chairs.find(o=>/^TV[\s_]284(?:[\s_]|$)/i.test(o.name));
 scene.add(room,whiteFloor);chairs.forEach(c=>c.visible=true);measureSeats();setProgress('white',1);canvasHost.classList.add('room-ready');
}
function prepareDojo(){
 if(dojo)return Promise.resolve(dojo);
 if(!dojoTask)dojoTask=(async()=>{
 const full=await binary('/assets/intro-original/dojo-original.glb','dojo');
 dojo=(await loader.parseAsync(full,'')).scene;
 dojo.position.y=2.04;dojo.visible=false;scene.add(dojo);
 dojo.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return dojo;
 })().catch(e=>{dojoTask=null;throw e});
 return dojoTask;
}
function bytesTo(type,input){return new type(input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength))}

// A fitted, neutral inner layer covers the waist on the original body surface.
 // Rest-pose coordinates follow the same vertices in standing and seated poses.
function coverMarianneWaist(actor){
 const part=actor.parts.find(p=>p.name==='body')||actor.parts.find(p=>/^(corps|skin)$/i.test(p.name));
 if(!part){remember('Tenue de Marianne','Corps de référence introuvable');return;}
 const g=part.obj.geometry,mat=part.obj.material;
 let min=Infinity,max=-Infinity;
 for(let k=1;k<part.base.length;k+=3){min=Math.min(min,part.base[k]);max=Math.max(max,part.base[k]);}
 const height=max-min;
 if(!Number.isFinite(height)||height<.5)return;
 const lo=min+height*.505,hi=min+height*.647,half=height*.081;
 const rest=part.base.slice();g.setAttribute('introRest',new T.BufferAttribute(rest,3));
 const previous=mat.onBeforeCompile.bind(mat),key=mat.customProgramCacheKey.bind(mat);
 mat.onBeforeCompile=(shader,renderer)=>{
  previous(shader,renderer);
  shader.vertexShader='attribute vec3 introRest; varying vec3 introClothingRest;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nintroClothingRest=introRest;');
  shader.fragmentShader='varying vec3 introClothingRest;\n'+shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\nfloat waistBand=step('+lo.toFixed(6)+',introClothingRest.y)*step(introClothingRest.y,'+hi.toFixed(6)+')*step(abs(introClothingRest.x),'+half.toFixed(6)+');\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(1.0,1.0,1.0),waistBand); diffuseColor.a=mix(diffuseColor.a,1.0,waistBand);');
 };
 const oldKey=key();mat.customProgramCacheKey=()=>oldKey+'-intro-waist-'+lo.toFixed(5)+'-'+hi.toFixed(5);mat.needsUpdate=true;
}

async function loadAhmed(){
 const chunks=new Array(11);let cursor=0;
 async function work(){
  while(cursor<chunks.length){const i=cursor++;chunks[i]=new Uint8Array(await binary('/api/intro-private/ahmedv3/'+String(i).padStart(3,'0'),'ahmed'));}
 }
 await Promise.all(Array.from({length:3},work));
 const length=chunks.reduce((n,c)=>n+c.byteLength,0);
 if(length!==10671740)throw Error('Le modèle original d’Ahmed est incomplet.');
 const all=new Uint8Array(length);let at=0;for(const c of chunks){all.set(c,at);at+=c.byteLength;}
 if(crypto.subtle){const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',all)),b=>b.toString(16).padStart(2,'0')).join('');if(hash!=='66040c78a23c862dd39090802129eabab252638f1d1e863836a1e71f37f53192')throw Error('Le modèle original d’Ahmed est altéré.');}
 const asset=await loader.parseAsync(all.buffer,'');
 const root=new T.Group(),body=asset.scene;root.add(body);root.name='Ahmed';root.position.set(-.78,0,.42);root.rotation.y=Math.PI;scene.add(root);
 const bones=new Map(),mouth=[];
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 let pants;
 body.traverse(o=>{
  if(o.isMesh){o.castShadow=true;o.receiveShadow=false;o.frustumCulled=false;if(/^Pantalon[\s_]*blanc/i.test(o.name))pants=o;}
  if(o.isBone){const name=normalize(o.name).replace(/^v27/,'');bones.set(name,{o,p:o.position.clone(),q:o.quaternion.clone()});}
  if(o.morphTargetDictionary?.Ouvrir!==undefined)mouth.push(o);
 });
 for(const n of ['bassin','tete','thorax','cuissed','cuisseg','jambed','jambeg','piedd','piedg','brasd','brasg','avantbrasd','avantbrasg','maind','maing'])if(!bones.has(n))throw Error('Articulation originale manquante : '+n);
 const rotX=(a)=>new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),a);
 const set=(n,p,q)=>{const x=bones.get(n);if(!x)return;x.o.position.copy(p);x.o.quaternion.copy(x.q);if(q)x.o.quaternion.premultiply(q);};
 const spin=(v,center,q)=>v.clone().sub(center).applyQuaternion(q).add(center);
 const instance={id:'m',root,body,parts:[],sit:0,pants,mouth,headBone:bones.get('tete').o,
  pose(value){
   this.sit=value;const t=T.MathUtils.clamp(value,0,1),drop=new T.Vector3(0,-.295*t,0);
   for(const [n,x] of bones)set(n,x.p.clone().add(drop));
   if(t){
    for(const [side,sgn] of [['d',-1],['g',1]]){
     const thigh=bones.get('cuisse'+side),shin=bones.get('jambe'+side),foot=bones.get('pied'+side);
     const hip=new T.Vector3(sgn*.105,.865,-.015),knee=new T.Vector3(sgn*.095,.438,.008),ankle=new T.Vector3(sgn*.106,.055,.015);
     const thighRot=rotX(-1.30*t),shinRot=rotX(.10*t);
     const newKnee=spin(knee,hip,thighRot).add(drop),newAnkle=spin(ankle,knee,shinRot).sub(knee).add(newKnee);
     set('cuisse'+side,spin(thigh.p,hip,thighRot).add(drop),thighRot);
     set('jambe'+side,spin(shin.p,knee,shinRot).sub(knee).add(newKnee),shinRot);
     set('pied'+side,foot.p.clone().sub(ankle).add(newAnkle));
     // Forearms rotate at the elbow, with the palms coming to rest near the thighs.
     const upper=bones.get('bras'+side),fore=bones.get('avantbras'+side),hand=bones.get('main'+side);
     const elbow=upper.p.clone().lerp(fore.p,.53),bend=rotX(-.76*t);
     set('avantbras'+side,spin(fore.p,elbow,bend).add(drop),bend);
     set('main'+side,spin(hand.p,elbow,bend).add(drop),bend);
    }
   }
   root.updateMatrixWorld(true);
  },
  speak(open,wide=0){
   for(const o of mouth){
    const d=o.morphTargetDictionary,w=o.morphTargetInfluences;
    w[d.Ouvrir]=open;if(d.Decouvrir!==undefined)w[d.Decouvrir]=wide*.18;
    if(d.SourireG!==undefined)w[d.SourireG]=wide*.07;
    if(d.SourireD!==undefined)w[d.SourireD]=wide*.07;
   }
  }
 };
 return instance;
}

async function loadPeople(){
 const ahmedJob=loadAhmed();
 const roomBin=await binary('/assets/depart-duo/scene.bin','people');
 const files=unzipSync(new Uint8Array(roomBin)),info=JSON.parse(strFromU8(files['index.json']));
 const texCache=new Map(),textureJobs=[];
 function texture(name){
  if(texCache.has(name))return texCache.get(name);
  if(!files[name])return null;
  const blob=URL.createObjectURL(new Blob([files[name]],{type:'image/webp'}));
  const tex=new T.Texture();
  textureJobs.push(new Promise(resolve=>{const image=new Image();image.onload=()=>{tex.image=image;tex.needsUpdate=true;URL.revokeObjectURL(blob);resolve();};image.onerror=()=>{URL.revokeObjectURL(blob);remember('Texture','Image non chargée : '+name);resolve();};image.src=blob;}));
  tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=2;texCache.set(name,tex);return tex;
 }
 function actor(id,x,name){
  const root=new T.Group(),body=new T.Group(),parts=[];root.add(body);scene.add(root);
  root.scale.setScalar(id==='m'?1.075:1.04);root.name=name;
  for(const h of info[id].parts){
   const g=new T.BufferGeometry();
   const pos=Float32Array.from(bytesTo(Int16Array,files[h.p]),v=>v/10000);
   const nor=Float32Array.from(bytesTo(Int8Array,files[h.n]),v=>v/127);
   g.setAttribute('position',new T.BufferAttribute(pos,3));
   g.setAttribute('normal',new T.BufferAttribute(nor,3));
   if(h.uv)g.setAttribute('uv',new T.BufferAttribute(Float32Array.from(bytesTo(Uint16Array,files[h.uv]),v=>v/65535),2));
   g.setIndex(new T.BufferAttribute(bytesTo(Uint16Array,files[h.i]),1));
   g.computeBoundingSphere();
   const label=String(h.name+' '+info[id].tex[h.tex]).toLowerCase();
   const skinOrHair=/^(body|corps|skin)$/i.test(h.name)||/(skin|peau|face|visage|body|corps|hair|cheveu|iris|eye|oeil|brow|sourcil|cils|lash|lip|lèvre|mouth|dent|teeth|ongle|nail|oreille|ear|nez|nose)/i.test(label);
   const defaultMaterial=new T.MeshStandardMaterial({
    map:skinOrHair?texture(info[id].tex[h.tex]):null,
    color:0xffffff,
    roughness:.88,
    alphaTest:/hair|short02|lash|brow/.test(h.name)?.36:.12,
    side:T.DoubleSide
   });
   const mesh=new T.Mesh(g,defaultMaterial);mesh.castShadow=true;body.add(mesh);
   const reference=pos.slice();
   parts.push({name:h.name,obj:mesh,base:reference,fullIndex:g.index,mesh,reference,key:id+'/'+h.name+'/sofa2/100',delta:null,unit:0});
  }
  root.position.set(x,0,.42);root.rotation.y=Math.PI;
  const instance={id,root,body,parts,sit:0,stamp:0,head:null,
   pose(value){this.sit=value;for(const part of parts){
    const array=part.mesh.geometry.attributes.position;
    if(part.delta){for(let i=0;i<part.reference.length;i++)array.array[i]=part.reference[i]+part.delta[i]*part.unit*value}
    else array.array.set(part.reference);array.needsUpdate=true;
   }this.stamp++;this.head?.follow(true);}
  };
  return instance;
 }
 const b=actor('f',.9,'Marianne');
 const a=await ahmedJob;
 people=[a,b];
 await Promise.all(textureJobs);
 // Reuse the authored Marianne reference face already available in the salon.
 // If it is not reachable, retain the existing character rather than block the intro.
 try{const template=await Promise.race([loadFemaleReference(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Référence Marianne trop longue à charger')),20000))]);b.head=attachFemaleHead(b,template);b.head.follow(true);}catch(e){remember('Visage de Marianne',e.message||e);}
 coverMarianneWaist(b);setProgress('people',1);
}

let seatsReady=false;
function prepareSeats(){
 if(seatsReady)return Promise.resolve();
 if(!seatTask)seatTask=(async()=>{
  const assises=unzipSync(new Uint8Array(await binary('/membres/v27/assises.bin','seats'))),poseIndex=JSON.parse(strFromU8(assises['index.json'])),poses=new Map(),active=new Set();
  function poseArray(index){
   if(poses.has(index))return poses.get(index);
   if(active.has(index)||!assises[index])throw Error('Pose assise invalide');
   active.add(index);const raw=assises[index].slice(),base=poseIndex.bases[index];
   if(base!==null&&base!==undefined){const prior=poseArray(base);if(prior.length!==raw.length)throw Error('Pose assise incompatible');for(let i=0;i<raw.length;i++)raw[i]+=prior[i];}
   const pose=new Int8Array(raw.buffer,raw.byteOffset,raw.byteLength);poses.set(index,pose);active.delete(index);return pose;
  }
  const changes=[];
  for(const person of people)for(const part of person.parts){const index=poseIndex.keys[part.key];if(index!==undefined&&index!==null){const delta=poseArray(index),unit=poseIndex.units[part.key]/10000;if(delta.length!==part.reference.length||!Number.isFinite(unit))throw Error('Pose assise incompatible : '+part.key);changes.push([part,delta,unit]);}}
  for(const [part,delta,unit] of changes){part.delta=delta;part.unit=unit;}
  seatsReady=true;
 })().catch(e=>{seatTask=null;throw e});
 return seatTask;
}
async function preloadNext(){try{await prepareSeats();}catch(e){remember('Préchargement assises',e.message);}try{await prepareDojo();}catch(e){remember('Préchargement dojo',e.message);}}

// Find the bottom of the seated pelvis on the original clothed mesh, not the feet.
function seatContact(person){
 const points=[],tmp=new T.Vector3();person.root.updateMatrixWorld(true);
 function add(rest,mesh,read){
  if(!rest||!mesh)return;
  let max=-Infinity,min=Infinity;for(let k=1;k<rest.length;k+=3){max=Math.max(max,rest[k]);min=Math.min(min,rest[k]);}
  const fullHeight=person.id==='m'?1.64:(person.parts.find(x=>x.name==='body')?.reference.reduce((a,v,i)=>i%3===1?Math.max(a,v):a,-Infinity)||1.64);
  const bottom=person.id==='m'?.76:fullHeight*.455,top=person.id==='m'?.94:fullHeight*.585;
  for(let k=0;k<rest.length;k+=3){const x=rest[k],y=rest[k+1],z=rest[k+2];if(Math.abs(x)>.155||y<bottom||y>top||z>-.028)continue;
   read(k/3,tmp);mesh.localToWorld(tmp);person.root.worldToLocal(tmp);points.push(tmp.clone());
  }
 }
 if(person.id==='m'&&person.pants){
  const g=person.pants.geometry;add(g.attributes.position.array,person.pants,(i,v)=>person.pants.getVertexPosition(i,v));
 }else{
  const body=person.parts.find(p=>/^body$|^corps$|^skin$/i.test(p.name));
  if(body)add(body.reference,body.mesh,(i,v)=>v.fromBufferAttribute(body.mesh.geometry.attributes.position,i));
 }
 if(points.length<15)return new T.Vector3(0,person.id==='m'?.52:.48,-.055);
 points.sort((a,b)=>a.y-b.y);
 const bottom=points.slice(Math.floor(points.length*.06),Math.max(1,Math.floor(points.length*.22)));
 return bottom.reduce((sum,p)=>sum.add(p),new T.Vector3()).multiplyScalar(1/Math.max(1,bottom.length));
}
function targetLayout(person,seated,dojoMode=false,nearSeats=false){
 const a=seatAnchors.get(person.id),i=person.id==='f'?1:-1;
 if(dojoMode)return {pos:new T.Vector3(i*.9,0,1.5),yaw:Math.PI,sit:0};
 if(!seated){
  if(nearSeats&&a){const pos=a.point.clone().addScaledVector(a.forward,.44);pos.y=0;return {pos,yaw:a.yaw,sit:0};}
  return {pos:new T.Vector3(i*.72,0,.34),yaw:Math.PI,sit:0};
 }
 if(!a)throw Error('Repère de coussin absent');
 if(!person.seatedContact){const old=person.sit;person.pose(1);person.seatedContact=seatContact(person);person.pose(old);}
 const offset=person.seatedContact.clone().multiply(person.root.scale).applyAxisAngle(new T.Vector3(0,1,0),a.yaw);
 return {pos:a.point.clone().sub(offset),yaw:a.yaw,sit:1};
}
let movement=null;
function layoutPeople(seated,dojoMode=false,nearSeats=false){
 const now=performance.now(),items=people.map(person=>{
  const from=person.root.position.clone(),yaw=person.root.rotation.y,sit=person.sit;
  return {person,from,yaw,sit,to:targetLayout(person,seated,dojoMode,nearSeats)};
 });
 if(dojoMode||step===0){movement=null;for(const {person,to} of items){person.root.position.copy(to.pos);person.root.rotation.y=to.yaw;person.pose(to.sit);}return;}
 movement={start:now,duration:seated&&items.some(x=>x.sit<.99)?1150:650,items};
}
function advanceMovement(now){
 if(!movement)return;const u=T.MathUtils.clamp((now-movement.start)/movement.duration,0,1),t=u*u*(3-2*u);
 for(const {person,from,yaw,sit,to} of movement.items){
  person.root.position.lerpVectors(from,to.pos,t);
  const d=Math.atan2(Math.sin(to.yaw-yaw),Math.cos(to.yaw-yaw));person.root.rotation.y=yaw+t*d;
  const s=T.MathUtils.lerp(sit,to.sit,t);if(Math.abs(s-person.sit)>.001||u===1)person.pose(s);
 }
 if(u===1)movement=null;
}
let speech=null,voiceEnabled=true,speechSerial=0;
function stopSpeech(){
 speechSerial++;if('speechSynthesis' in window)window.speechSynthesis.cancel();
 speech=null;people[0]?.speak?.(0);
}
function startSpeech(text){
 stopSpeech();const serial=speechSerial,now=performance.now();
 const duration=Math.max(1700,text.length*58);
 const state=speech={serial,text,start:now,duration,index:0,boundary:0,active:true,voiced:false,ended:false};
 if(voiceEnabled&&'speechSynthesis' in window&&'SpeechSynthesisUtterance' in window){
  try{
   const u=new SpeechSynthesisUtterance(text);u.lang='fr-FR';u.rate=.94;u.pitch=1;
   const voices=window.speechSynthesis.getVoices(),fr=voices.find(v=>/^fr[-_]FR/i.test(v.lang))||voices.find(v=>/^fr/i.test(v.lang));if(fr)u.voice=fr;
   state.utterance=u;
   u.onstart=()=>{if(speech?.serial===serial){state.start=performance.now();state.voiced=true;}};
   u.onboundary=e=>{if(speech?.serial===serial){state.index=e.charIndex;state.boundary=performance.now();}};
   u.onend=()=>{if(speech?.serial===serial){state.ended=true;state.active=false;people[0]?.speak?.(0);}};
   u.onerror=()=>{if(speech?.serial===serial){state.voiced=false;state.utterance=null;}};
   window.speechSynthesis.speak(u);
  }catch(e){state.voiced=false;remember('Voix',e.message);}
 }
 return duration;
}
function animateSpeech(now){
 const s=speech,p=people[0];if(!p?.speak)return;
 if(!s||s.ended||!s.active){p.speak(0);return;}
 const elapsed=now-s.start;if(elapsed>s.duration+850&&!s.voiced||elapsed>Math.max(18000,s.duration*2.5)){s.active=false;p.speak(0);return;}
 const pos=s.boundary&&now-s.boundary<1000?s.index+Math.floor((now-s.boundary)/62):Math.floor(elapsed/58);
 const c=s.text[Math.min(s.text.length-1,Math.max(0,pos))]?.toLowerCase()||' ';
 const vowel=/[aeiouyàâéèêëîïôùûüœ]/.test(c),closed=/[bmpfvw\s.,;:!?]/.test(c),phase=(Math.sin(elapsed*.022)+1)*.5;
 p.speak(closed?.025:(vowel?.22+.34*phase:.065+.15*phase),vowel?.5:0);
}
function showMessage(line){
 const b=document.createElement('b'),p=document.createElement('p'),text=line[1].replaceAll('{pseudo}',alias);
 b.textContent='Ahmed';p.textContent=text;bubble.replaceChildren(b,p);bubble.hidden=false;
 bubble.getAnimations().forEach(a=>a.cancel());bubble.animate([{opacity:0},{opacity:1}],{duration:220});
 return startSpeech(text);
}
const headPoint=new T.Vector3();
function anchorBubble(){
 const speaker=people[0];if(!speaker||bubble.hidden)return;
 if(speaker.headBone){speaker.headBone.getWorldPosition(headPoint);headPoint.y+=.20;}else{headPoint.set(0,speaker.sit?1.35:1.85,0);speaker.root.localToWorld(headPoint);}
 headPoint.project(camera);
 const w=canvasHost.clientWidth,h=canvasHost.clientHeight,x=(headPoint.x+1)*w/2,y=(1-headPoint.y)*h/2;
 const bw=bubble.offsetWidth,bh=bubble.offsetHeight,pad=9;
 const left=T.MathUtils.clamp(x-bw/2,pad,Math.max(pad,w-bw-pad));
 const above=y-bh-22>=pad,top=above?y-bh-18:T.MathUtils.clamp(y+32,pad,Math.max(pad,h-bh-12));
 bubble.style.left=left+'px';bubble.style.top=top+'px';bubble.style.bottom='auto';
 bubble.style.setProperty('--tail-x',T.MathUtils.clamp(x-left,15,bw-15)+'px');
 bubble.classList.toggle('below',!above);
}
function scheduleNext(ms){
 clearTimeout(autoTimer);
 const advance=()=>{if(!autoplay||pending)return;if(speech?.voiced&&speech.active&&performance.now()-speech.start<Math.max(18000,speech.duration*2.5)){autoTimer=setTimeout(advance,250);return;}next();};
 autoTimer=setTimeout(advance,ms);
}
async function showScene(index){
 if(!ready||pending)return;
 const requested=Math.max(0,Math.min(index,lines.length-1));
 if((requested>=4&&requested<14&&!seatsReady)||(requested>=14&&!dojo)){
  setPending(true);$('scene-wait').textContent='La suite se prépare…';
  try{if(requested>=14)await prepareDojo();else await prepareSeats();}
  catch(e){remember('Chargement de la suite',e.message||e);automatic(false);$('scene-wait').textContent='La suite n’a pas pu se charger. Réessaie avec Continuer.';setPending(false);$('scene-wait').hidden=false;return;}
  setPending(false);
 }
 $('scene-wait').hidden=true;step=requested;
 const line=lines[step],level=line[2],isDojo=level==='dojo';
 stage=isDojo?'dojo':'white';
 room.visible=!isDojo;whiteFloor.visible=!isDojo;if(dojo)dojo.visible=isDojo;
 scene.background.set(isDojo?0xd7c4a7:0xffffff);
 const seated=!isDojo&&step>=4;
 if(isDojo){room.visible=false;chairs.forEach(c=>c.visible=false);layoutPeople(false,true);}
 else{chairs.forEach(c=>c.visible=step>=3);layoutPeople(seated,false,step===3);}
 targetAngle=isDojo?line[3]:(seated&&line[3]===Math.PI?2.35:line[3]);radius=isDojo?6.1:(seated?4.4:3.6);
 const talkingTime=showMessage(line);
 status.textContent=isDojo?'Dojo · apprentissage':'Salle blanche · '+(step>=4?'les masques':'la rencontre');
 $('prev').disabled=step<=0;$('next').textContent=step===lines.length-1?'Entrer dans le jardin':'Continuer';
 $('joystick').hidden=!isDojo;$('personalize').hidden=!isDojo;
 if(autoplay&&step<lines.length-1){
  scheduleNext(Math.max(step===5?6600:4800,talkingTime+650));
 }else if(autoplay){autoplay=false;$('auto').textContent='Lecture cinéma'}
}
function startGarden(){
 autoplay=false;clearTimeout(autoTimer);stopSpeech();stage='garden';$('garden').hidden=false;
 bubble.hidden=true;$('joystick').hidden=true;$('personalize').hidden=true;
 status.textContent='Le jardin et la maison';
 if(gardenLoaded)return;gardenLoaded=true;
 const frame=$('garden-frame');
 function openGarden(){
  try{
   const d=frame.contentDocument;
   if(!d?.body?.classList.contains('ready'))return;
   d.getElementById('pin')?.click();
   setTimeout(()=>{try{d.getElementById('lookHome')?.click()}catch{}},700);
  }catch(e){remember('Jardin',e.message)}
 }
 frame.addEventListener('load',()=>{
  try{
   frame.contentWindow.addEventListener('salon-ready',openGarden,{once:true});
   frame.contentWindow.addEventListener('error',e=>remember('Erreur jardin',e.message));
   if(frame.contentDocument?.body?.classList.contains('ready'))openGarden();
  }catch(e){remember('Jardin',e.message)}
 });
 frame.src='/membres/v27/salon.html?resident=marianne&v=gestes50';
}
function next(){if(!started||pending||stage==='garden')return;if(step>=lines.length-1)startGarden();else showScene(step+1)}
function automatic(on){autoplay=on;clearTimeout(autoTimer);$('auto').textContent=on?'Pause cinéma':'Lecture cinéma';
 if(on)scheduleNext(Math.max(4800,(speech?.duration||0)+650));}
$('sound-toggle').onclick=()=>{voiceEnabled=!voiceEnabled;$('sound-toggle').textContent=voiceEnabled?'Son activé':'Son coupé';if(!voiceEnabled)stopSpeech();else if(started&&step>=0&&stage!=='garden')startSpeech(lines[step][1].replaceAll('{pseudo}',alias));};
$('enter').onclick=()=>{if(!authorized||!ready)return;alias=$('pseudo').value.trim().slice(0,40)||alias;$('welcome').hidden=true;started=true;setPending(false);automatic(true);showScene(0)};
$('next').onclick=()=>{automatic(false);next()};
$('prev').onclick=()=>{automatic(false);showScene(Math.max(0,step-1));$('garden').hidden=true};
$('skip').onclick=()=>{if(!authorized||!ready||pending)return;automatic(false);$('welcome').hidden=true;started=true;showScene(14)};
$('auto').onclick=()=>{if(started&&!pending){if(autoplay){automatic(false);stopSpeech();}else{if(step>=0)startSpeech(lines[step][1].replaceAll('{pseudo}',alias));automatic(true);}}};
$('personalize').onclick=()=>location.assign('/membre.html?auteur=atelier#avatar');

$('report-open').onclick=()=>{$('report-scene').value=stage+' · '+(step+1);$('report-count').textContent=problems.length+' entrées';$('report-dialog').showModal()};
$('report-close').onclick=()=>$('report-dialog').close();
$('report-add').onclick=()=>{const text=$('report-note').value.trim();if(text){remember($('report-type').value,text);$('report-note').value='';$('report-count').textContent=problems.length+' entrées'}};
$('report-export').onclick=()=>{
 const data={created:new Date().toISOString(),experience:'La Maison des rencontres',step,stage,viewport:{width:innerWidth,height:innerHeight},entries:problems};
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='rapport-maison-des-rencontres-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
};
function resize(){const w=canvasHost.clientWidth,h=canvasHost.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(canvasHost);resize();
const stick=$('joystick'),nub=$('nub');
function stickMove(e){const r=stick.getBoundingClientRect();
 joystick.x=T.MathUtils.clamp((e.clientX-r.left-r.width/2)/(r.width*.4),-1,1);
 joystick.y=T.MathUtils.clamp((e.clientY-r.top-r.height/2)/(r.height*.4),-1,1);
 nub.style.transform='translate('+joystick.x*29+'px,'+joystick.y*29+'px)';
}
stick.addEventListener('pointerdown',e=>{stick.setPointerCapture(e.pointerId);stickMove(e)});
stick.addEventListener('pointermove',e=>{if(stick.hasPointerCapture(e.pointerId))stickMove(e)});
for(const type of ['pointercancel','pointerup'])stick.addEventListener(type,()=>{joystick={x:0,y:0};nub.style.transform=''});
canvas.addEventListener('pointerdown',e=>{if(stage==='dojo'){drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)}});
canvas.addEventListener('pointermove',e=>{if(!drag)return;targetAngle+=(e.clientX-drag[0])*.007;radius=T.MathUtils.clamp(radius+(e.clientY-drag[1])*.011,3,11);drag=[e.clientX,e.clientY]});
canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
const keys=new Set();
window.addEventListener('keydown',e=>keys.add(e.key.toLowerCase()));
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
const cameraTarget=new T.Vector3(),cameraEye=new T.Vector3();
function frame(){
 requestAnimationFrame(frame);const dt=Math.min(.06,clock.getDelta());
 if(!room||stage==='garden')return;
 if(stage==='dojo'&&people[1]){
  const moveX=joystick.x+(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('q')?1:0);
  const moveZ=joystick.y+(keys.has('arrowdown')||keys.has('s')?1:0)-(keys.has('arrowup')||keys.has('z')?1:0);
  if(Math.hypot(moveX,moveZ)>.1){
   const p=people[1].root.position;
   p.x=T.MathUtils.clamp(p.x+moveX*dt*2.2,-3.9,3.9);
   p.z=T.MathUtils.clamp(p.z+moveZ*dt*2.2,-3.3,3.3);
   people[1].root.rotation.y=Math.atan2(-moveX,-moveZ);
  }
 }
 angle+= (targetAngle-angle)*(1-Math.exp(-dt*(stage==='dojo'?2:1.05)));
 const now=performance.now();advanceMovement(now);animateSpeech(now);
 const seated=stage==='white'&&step>=4,reverse=seated&&targetAngle<.5;
 const mid=stage==='dojo'?new T.Vector3(.1,1.25,.65):new T.Vector3(0,seated?.89:.98,seated?-.20:.20);
 const htan=Math.tan(T.MathUtils.degToRad(camera.fov*.5))*Math.max(.25,camera.aspect);
 const dist=stage==='dojo'?Math.max(radius,3.0/htan):Math.max(radius,(seated?(reverse?1.96:1.85):1.19)/htan);
 cameraEye.set(mid.x+Math.sin(angle)*dist,mid.y+(stage==='dojo'?1.12:seated?.85:.36),mid.z+Math.cos(angle)*dist);
 camera.position.copy(cameraEye);camera.lookAt(mid);camera.updateMatrixWorld(true);
 renderer.render(scene,camera);anchorBubble();
}
async function authorize(){
 const response=await fetch('/api/membres/me?auteur=1',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(17000)});
 if(!response.ok)throw Error('La connexion administrateur est nécessaire.');
 const me=await response.json();if(!me.author)throw Error('Réservé au compte auteur.');
 alias=String(me.pseudo||'Voyageur').slice(0,40);$('pseudo').value=alias;authorized=true;$('access-denied').hidden=true;
}

async function initialize(){
 if(initialTask)return initialTask;
 $('retry-load').hidden=true;$('load-title').textContent='Un instant…';$('load-description').textContent='La rencontre se prépare.';$('loading').hidden=false;$('welcome').hidden=true;
 initialTask=(async()=>{
 try{
  if(!authorized)await authorize();
  await Promise.all([room?Promise.resolve():loadWhite(),people.length===2?Promise.resolve():loadPeople()]);
  ready=true;$('enter').disabled=false;$('welcome').hidden=false;$('loading').hidden=true;
  // The opening scene can now be played, independently of the rest.
  setPending(false);$('prev').disabled=true;$('next').disabled=true;$('auto').disabled=true;$('personalize').hidden=true;
  void preloadNext();
 }catch(e){
  remember('Chargement initial',e.message||e);
  if(!authorized&&/connexion|Réservé/i.test(String(e.message))){$('loading').hidden=true;$('access-denied').hidden=false;return;}
  $('load-title').textContent='Un contretemps';$('load-description').textContent='Le chargement a été interrompu. Tu peux réessayer.';$('retry-load').hidden=false;
 }finally{initialTask=null;}
 })();return initialTask;
}
$('retry-load').onclick=()=>void initialize();
frame();void initialize();
