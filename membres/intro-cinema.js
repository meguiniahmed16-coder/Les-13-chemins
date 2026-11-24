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
// Approved silent storyboard. Durations are measured from the first shot, not from the variable loading screen.
const lines=[
 {
  "id": "ouverture",
  "speaker": null,
  "text": "",
  "scene": "white",
  "shot": "discovery",
  "ms": 6200,
  "move": "orbit",
  "gesture": "listen",
  "seated": false,
  "furniture": "none"
 },
 {
  "id": "question-initiale",
  "speaker": "m",
  "text": "Qu’est-ce qu’une rencontre ? Qu’est-ce que véritablement l’autre ?",
  "scene": "white",
  "shot": "approach",
  "ms": 7800,
  "move": "push",
  "gesture": "question",
  "seated": false,
  "furniture": "none"
 },
 {
  "id": "question",
  "speaker": "m",
  "text": "Est-ce simplement quelqu’un qui me ressemble ?",
  "scene": "white",
  "shot": "reverse",
  "ms": 8000,
  "move": "drift",
  "gesture": "question",
  "seated": false,
  "furniture": "none"
 },
 {
  "id": "miroir",
  "speaker": "f",
  "text": "Une rencontre n’est pas un miroir… C’est un espace où l’on se dépose, sans masque, ou presque.",
  "scene": "white",
  "shot": "reverse",
  "ms": 8000,
  "move": "drift",
  "gesture": "explain",
  "seated": false,
  "furniture": "none"
 },
 {
  "id": "invitation",
  "speaker": "m",
  "text": "Prends place.",
  "scene": "white",
  "shot": "arrival",
  "ms": 11200,
  "move": "orbit",
  "gesture": "invite",
  "seated": false,
  "invitation": true,
  "furniture": "reveal"
 },
 {
  "id": "bruit",
  "speaker": "f",
  "text": "Ici, on laisse dehors le bruit, les rôles, les étiquettes…",
  "scene": "white",
  "shot": "two",
  "ms": 8000,
  "move": "dolly",
  "gesture": "explain",
  "seated": true,
  "furniture": "chairs"
 },
 {
  "id": "masques",
  "speaker": "m",
  "text": "Un monde de masques. Un monde d’illusions.",
  "scene": "white",
  "shot": "close",
  "ms": 10000,
  "move": "push",
  "gesture": "reflect",
  "seated": true,
  "furniture": "chairs"
 },
 {
  "id": "verite",
  "speaker": "f",
  "text": "Et pourtant… c’est aussi un lieu de vérité, de jeux, de désir, de création…",
  "scene": "white",
  "shot": "close",
  "ms": 10000,
  "move": "drift",
  "gesture": "explain",
  "seated": true,
  "furniture": "chairs"
 },
 {
  "id": "soi",
  "speaker": "m",
  "text": "Ici, on peut être tour à tour lecteur, acteur, voyageur… ou simplement soi.",
  "scene": "white",
  "shot": "medium",
  "ms": 10000,
  "move": "push",
  "gesture": "open",
  "seated": true,
  "furniture": "chairs"
 },
 {
  "id": "libre",
  "speaker": "f",
  "text": "Tu es libre d’explorer, de construire, de rencontrer, d’imaginer…",
  "scene": "white",
  "shot": "close",
  "ms": 8000,
  "move": "drift",
  "gesture": "invite",
  "seated": true,
  "furniture": "chairs"
 },
 {
  "id": "ensemble",
  "speaker": "m",
  "text": "Alors…",
  "secondary": {
   "speaker": "f",
   "text": "…on commence ?",
   "at": 4200
  },
  "scene": "white",
  "shot": "two",
  "ms": 12000,
  "move": "dolly",
  "gesture": "complice",
  "seated": true,
  "furniture": "chairs"
 },
 {
  "id": "vers-ecran",
  "speaker": null,
  "text": "",
  "scene": "white",
  "shot": "rear",
  "ms": 6000,
  "move": "orbit",
  "gesture": "watch",
  "seated": true,
  "furniture": "all"
 },
 {
  "id": "television",
  "speaker": null,
  "text": "",
  "scene": "white",
  "shot": "tv",
  "ms": 7000,
  "move": "push",
  "gesture": "watch",
  "seated": true,
  "furniture": "all"
 },
 {
  "id": "montage",
  "speaker": null,
  "text": "La Maison des rencontres, c’est un espace en construction…",
  "scene": "white",
  "shot": "montage",
  "ms": 10000,
  "move": "cut",
  "gesture": "watch",
  "seated": true,
  "furniture": "all"
 },
 {
  "id": "lieu",
  "speaker": "f",
  "text": "…un lieu pour lire, jouer, créer, dialoguer, apprendre, et peut-être se transformer.",
  "scene": "white",
  "shot": "two",
  "ms": 12000,
  "move": "dolly",
  "gesture": "open",
  "seated": true,
  "furniture": "chairs"
 },
 {
  "id": "bienvenue",
  "speaker": "m",
  "text": "Bienvenue.",
  "scene": "white",
  "shot": "two",
  "ms": 10000,
  "move": "dolly",
  "gesture": "invite",
  "seated": true,
  "furniture": "chairs"
 },
 {
  "id": "dojo-arrivee",
  "speaker": "m",
  "text": "Suis-moi. Je dois t’expliquer comment ce monde fonctionne.",
  "scene": "dojo",
  "shot": "dojo",
  "ms": 7000,
  "move": "fade",
  "gesture": "invite",
  "seated": false
 },
 {
  "id": "dojo-deplacement",
  "speaker": "m",
  "text": "Tu peux apprendre à avancer, faire tourner la caméra et modifier ton personnage.",
  "scene": "dojo",
  "shot": "dojo",
  "ms": 8500,
  "move": "drift",
  "gesture": "explain",
  "seated": false
 },
 {
  "id": "dojo-construction",
  "speaker": "m",
  "text": "Ce monde est encore en construction. Et toi aussi, tu participeras à sa construction.",
  "scene": "dojo",
  "shot": "dojo",
  "ms": 8500,
  "move": "drift",
  "gesture": "open",
  "seated": false
 },
 {
  "id": "jardin",
  "speaker": "m",
  "text": "Les papillons et la maison t’attendent dans le jardin.",
  "scene": "dojo",
  "shot": "dojo",
  "ms": 6500,
  "move": "drift",
  "gesture": "invite",
  "seated": false
 }
];
const dojoStart=lines.findIndex(s=>s.scene==='dojo');
let shotStart=0,shotPaused=false,pausedAt=0,pausedElapsed=0,currentSpeaker=null,lastLayout='',secondCue=false;

const progress={white:0,people:0,ahmed:0},weights={white:.25,people:.40,ahmed:.35};
const downloadCache=new Map();let bootStage='Connexion';let assetAhmed=null,assetMarianne=null;
let pending=false,dojoTask=null,seatTask=null,initialTask=null;
function setProgress(key,value){if(!(key in progress))return;progress[key]=Math.max(progress[key],Math.min(1,value));const total=Math.floor(100*Object.keys(progress).reduce((a,k)=>a+progress[k]*weights[k],0));$('load-progress').value=total;$('load-percent').textContent=total+' %';}

function showBootStage(s){bootStage=s;const e=$('load-description');if(e)e.textContent=s;}
async function binary(url,key,{expected=0,cache=false}={}){
 if(cache&&downloadCache.has(url))return downloadCache.get(url);
 let last;
 for(let attempt=0;attempt<3;attempt++){
  try{
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),95000);
   let response,result;
   try{
    response=await fetch(url,{credentials:'same-origin',signal:controller.signal,cache:attempt?'reload':'default'});
    if(!response.ok)throw Error('HTTP '+response.status+' · '+url.split('/').slice(-2).join('/'));
    const total=Number(response.headers.get('content-length'))||expected;
    if(!response.body||!total){result=await response.arrayBuffer();setProgress(key,.9);}
    else{
     const reader=response.body.getReader();let received=0;const chunks=[];
     for(;;){const {done,value}=await reader.read();if(done)break;chunks.push(value);received+=value.byteLength;if(key!=='ahmed')setProgress(key,.9*received/total);}
     if(!received)throw Error('Fichier vide');
     const data=new Uint8Array(received);let at=0;for(const c of chunks){data.set(c,at);at+=c.byteLength;}result=data.buffer;
    }
   }finally{clearTimeout(timer);}
   if(expected&&result.byteLength!==expected)throw Error('Fragment incomplet : '+result.byteLength+'/'+expected);
   if(cache)downloadCache.set(url,result);return result;
  }catch(e){last=e;if(attempt<2)await new Promise(r=>setTimeout(r,450*(attempt+1)));}
 }
 throw last;
}
function withoutOptionalMorphs(buffer){
 const bytes=new Uint8Array(buffer),v=new DataView(buffer),n=v.getUint32(12,true),j=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+n)));
 for(const m of j.meshes||[]){delete m.weights;if(m.extras?.targetNames)delete m.extras.targetNames;for(const p of m.primitives||[])delete p.targets;}
 for(const node of j.nodes||[])delete node.weights;delete j.animations;
 const json=new TextEncoder().encode(JSON.stringify(j)),pad=(json.length+3)&~3,tail=bytes.subarray(20+n),out=new Uint8Array(20+pad+tail.length),h=new DataView(out.buffer);
 h.setUint32(0,0x46546c67,true);h.setUint32(4,2,true);h.setUint32(8,out.length,true);h.setUint32(12,pad,true);h.setUint32(16,0x4e4f534a,true);out.fill(32,20,20+pad);out.set(json,20);out.set(tail,20+pad);return out.buffer;
}
async function decodeAhmed(buffer){
 try{return await loader.parseAsync(buffer,'');}
 catch(error){
  remember('Expressions du visage',error.message||error);
  // Keep the exact same original character, arms, textures and clothes; only omit optional mouth targets if the graphics driver cannot read them.
  return await loader.parseAsync(withoutOptionalMorphs(buffer),'');
 }
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
 room.updateMatrixWorld(true);seatAnchors.clear();
 const measured={m:{p:[-1.2469093,.5705407,-.05081394],f:[.6425154,0,-.7662728]},f:{p:[1.2875239,.5705407,-.06313361],f:[-.6425154,0,-.7662728]}};
 for(const [id,pattern] of [['m',/RED[\s_]*CHAIR/i],['f',/BLUE[\s_]*CHAIR/i]]){
  const fixed=measured[id];let contact=new T.Vector3(...fixed.p),forward=new T.Vector3(...fixed.f);
  try{
   const chair=chairs.find(o=>pattern.test(o.name));
   if(chair){
    const cushion=findChild(chair,/^Cushion_low/i),front=findChild(chair,/^FeetFront/i),back=findChild(chair,/^FeetBack/i);
    if(cushion&&front&&back){
     const cb=bounds(cushion),center=cb.getCenter(new T.Vector3()),dir=bounds(front).getCenter(new T.Vector3()).sub(bounds(back).getCenter(new T.Vector3()));dir.y=0;
     if(dir.lengthSq()>.001){dir.normalize();const c=center.clone().addScaledVector(dir,-.12);const ray=new T.Raycaster(new T.Vector3(c.x,cb.max.y+.6,c.z),new T.Vector3(0,-1,0));const hit=ray.intersectObject(cushion,true)[0];c.y=(hit?.point.y??cb.max.y)-.009;if(Number.isFinite(c.y)){contact=c;forward=dir;}}
    }
   }
  }catch(e){remember('Mesure fauteuil',e.message||e);}
  seatAnchors.set(id,{point:contact,forward,yaw:Math.atan2(forward.x,forward.z)});
 }
}
async function loadWhite(){
 showBootStage('La salle blanche se prépare…');
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
 scene.add(whiteFloor);chairs.forEach(c=>c.visible=true);measureSeats();chairs.forEach(c=>c.visible=false);room.visible=false;room.removeFromParent();setProgress('white',1);canvasHost.classList.add('room-ready');
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
 const total=10671740,unit=1048576,chunks=new Array(11);
 async function group(g){
  const first=g*3,last=Math.min(chunks.length,first+3),size=Math.min(total-first*unit,3*unit);
  try{
   const data=new Uint8Array(await binary('/api/intro-private/ahmedfast/'+String(g).padStart(3,'0'),'ahmed',{expected:size,cache:true}));
   for(let i=first;i<last;i++)chunks[i]=data.subarray((i-first)*unit,Math.min(data.length,(i-first+1)*unit));
  }catch(e){
   remember('Téléchargement groupé',e.message||e);
   // An older hosting release can still provide the same verified model through the original fragment URL.
   for(let i=first;i<last;i++)if(!chunks[i])chunks[i]=new Uint8Array(await binary('/api/intro-private/ahmedv3/'+String(i).padStart(3,'0'),'ahmed',{expected:Math.min(unit,total-i*unit),cache:true}));
  }
  setProgress('ahmed',.92*chunks.reduce((n,c)=>n+(c?.byteLength||0),0)/total);
 }
 showBootStage('Préparation des personnages…');
 // Limit concurrency on mobile networks; each request carries at most 3 MiB.
 for(let g=0;g<4;g+=2)await Promise.all([group(g),group(g+1)]);
 const all=new Uint8Array(total);let at=0;for(const c of chunks){all.set(c,at);at+=c.byteLength;}
 if(at!==total)throw Error('Le modèle d’Ahmed est incomplet.');
 if(globalThis.crypto?.subtle){
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',all)),b=>b.toString(16).padStart(2,'0')).join('');
  if(hash!=='66040c78a23c862dd39090802129eabab252638f1d1e863836a1e71f37f53192'){downloadCache.clear();throw Error('Le modèle original d’Ahmed doit être retéléchargé.');}
 }
 showBootStage('Assemblage du personnage d’Ahmed…');
 const asset=await decodeAhmed(all.buffer);
 const root=new T.Group(),body=asset.scene;root.add(body);root.name='Ahmed';root.position.set(-.78,0,.42);root.rotation.y=Math.PI;scene.add(root);
 const bones=new Map(),mouth=[];
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 let pants;
 body.traverse(o=>{
  if(o.isMesh){o.castShadow=true;o.receiveShadow=false;o.frustumCulled=false;if(/^Pantalon[\s_]*blanc/i.test(o.name))pants=o;}
  if(o.isBone){const name=normalize(o.name).replace(/^v27/,'');bones.set(name,{o,p:o.position.clone(),q:o.quaternion.clone()});}
  if(o.morphTargetDictionary?.Ouvrir!==undefined)mouth.push(o);
 });

 const jointOrder=['bassin','tete','brasd','avantbrasd','maind','brasg','avantbrasg','maing','cuissed','jambed','piedd','cuisseg','jambeg','piedg','thorax'];
 // GLTFLoader can uniquify names on some builds. The skin's verified joint order is the reliable source.
 let rig;pants?.skeleton?.bones?.length===15&&(rig=pants.skeleton);
 if(!rig)body.traverse(o=>{if(!rig&&o.isSkinnedMesh&&o.skeleton?.bones.length===15)rig=o.skeleton;});
 if(rig)jointOrder.forEach((name,i)=>{const o=rig.bones[i];bones.set(name,{o,p:o.position.clone(),q:o.quaternion.clone()});});
 const canSit=jointOrder.every(n=>bones.has(n));if(!canSit)remember('Articulations','Animation assise indisponible, modèle original conservé.');

 const rotX=(a)=>new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),a);
 const set=(n,p,q)=>{const x=bones.get(n);if(!x)return;x.o.position.copy(p);x.o.quaternion.copy(x.q);if(q)x.o.quaternion.premultiply(q);};
 const spin=(v,center,q)=>v.clone().sub(center).applyQuaternion(q).add(center);
 const instance={id:'m',root,body,parts:[],sit:0,pants,mouth,headBone:bones.get('tete')?.o||null,
  pose(value,gesture=null){
   this.sit=value;if(!canSit)return;const t=T.MathUtils.clamp(value,0,1),drop=new T.Vector3(0,-.295*t,0);
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
   if(gesture){
    const {time,energy,emphasis,kind,gaze,blink}=gesture;
    const qEuler=(x,y,z)=>new T.Quaternion().setFromEuler(new T.Euler(x,y,z,'XYZ'));
    const apply=(names,pivot,q)=>{for(const n of names){const o=bones.get(n)?.o;if(!o)continue;o.position.copy(spin(o.position,pivot,q));o.quaternion.premultiply(q);}};
    for(const [side,sign] of [['d',-1],['g',1]]){
     const upper=bones.get('bras'+side)?.o,fore=bones.get('avantbras'+side)?.o,hand=bones.get('main'+side)?.o;
     if(!upper||!fore||!hand)continue;
     const phase=side==='d'?0:1.5,active=side==='d'?1:.58;
     const wave=Math.sin(time*.86+phase),soft=Math.sin(time*1.47+phase*.7);
     const accent=energy*emphasis*active,invitation=kind==='invite'?accent:0;
     const shoulder=upper.position.clone().add(new T.Vector3(0,.085,-.015));
     const swing=qEuler(-.028*wave-.095*accent,-sign*(.018*soft+.05*invitation),sign*(.020*wave+.038*accent));
     apply(['bras'+side,'avantbras'+side,'main'+side],shoulder,swing);
     const elbow=upper.position.clone().lerp(fore.position,.56);
     const flex=qEuler(-.050*soft-(kind==='invite'?.27:.13)*accent,sign*.035*accent,sign*.024*wave);
     apply(['avantbras'+side,'main'+side],elbow,flex);
     hand.quaternion.multiply(qEuler(.025*wave,sign*.025*soft,sign*.025*accent));
    }
    if(gesture.gait&&t<.015){
     for(const [side,sign] of [['d',-1],['g',1]]){
      const thigh=bones.get('cuisse'+side)?.o,shin=bones.get('jambe'+side)?.o,foot=bones.get('pied'+side)?.o;
      if(!thigh||!shin||!foot)continue;
      const hip=thigh.position.clone().lerp(bones.get('bassin').o.position,.50);
      const wave=Math.sin(gesture.gait.phase*Math.PI*2+(sign>0?Math.PI:0));
      const q=qEuler(.22*wave*gesture.gait.strength,0,0);
      apply(['cuisse'+side,'jambe'+side,'pied'+side],hip,q);
      const lift=Math.max(0,wave)*.035*gesture.gait.strength;
      foot.position.y+=lift;
     }
    }
    const chest=bones.get('thorax')?.o,head=bones.get('tete')?.o;
    if(chest){chest.position.y+=.0035*Math.sin(time*1.35);chest.quaternion.multiply(qEuler(.009*Math.sin(time*1.35),.015*gaze,0));}
    if(head){head.quaternion.multiply(qEuler(.025*Math.sin(time*.72)+.035*emphasis*energy,gesture.headYaw??(.085*gaze),.018*Math.sin(time*.48)));head.position.y+=.0025*Math.sin(time*1.35);}
    for(const o of mouth){const i=o.morphTargetDictionary?.Cligner;if(i!==undefined)o.morphTargetInfluences[i]=blink;}
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
 setProgress('ahmed',1);return instance;
}

async function loadMarianne(){
 const roomBin=await binary('/assets/depart-duo/scene.bin','people');
 const files=unzipSync(new Uint8Array(roomBin),{filter:f=>!f.name.startsWith('m/')});const info=JSON.parse(strFromU8(files['index.json']));
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
   const walk=(h.units||[]).slice(0,8).map((u,i)=>files[h.anim+i]?{delta:bytesTo(Int8Array,files[h.anim+i]),unit:u/10000}:null);
   parts.push({name:h.name,obj:mesh,base:reference,fullIndex:g.index,mesh,reference,key:id+'/'+h.name+'/sofa2/100',delta:null,unit:0,walk});
  }
  root.position.set(x,0,.42);root.rotation.y=Math.PI;
  const instance={id,root,body,parts,sit:0,stamp:0,head:null,
   pose(value){this.sit=value;for(const part of parts){
    const array=part.mesh.geometry.attributes.position;
    if(part.delta){for(let i=0;i<part.reference.length;i++)array.array[i]=part.reference[i]+part.delta[i]*part.unit*value}
    else array.array.set(part.reference);array.needsUpdate=true;
   }this.stamp++;this.head?.follow(true);this.armCache=null;},
   walkPose(phase,strength){this.sit=0;const p=((phase%1)+1)%1*8,lo=Math.floor(p),hi=(lo+1)%8,f=p-lo;for(const part of parts){const a=part.walk?.[lo],b=part.walk?.[hi],buf=part.mesh.geometry.attributes.position;if(a&&b&&a.delta.length===part.reference.length&&b.delta.length===part.reference.length){for(let i=0;i<part.reference.length;i++)buf.array[i]=part.reference[i]+strength*((1-f)*a.unit*a.delta[i]+f*b.unit*b.delta[i]);}else buf.array.set(part.reference);buf.needsUpdate=true;}this.stamp++;this.armCache=null;this.head?.follow(true);},
   speak(open,wide=0,blink=0){this.head?.talk?.({jaw:open,spread:wide*.18,round:open*.18,blink});}
  };
  return instance;
 }
 const b=actor('f',.9,'Marianne');
 await Promise.race([Promise.all(textureJobs),new Promise(resolve=>setTimeout(resolve,15000))]);
 // Reuse the authored Marianne reference face already available in the salon.
 // If it is not reachable, retain the existing character rather than block the intro.
 try{const template=await Promise.race([loadFemaleReference(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Référence Marianne trop longue à charger')),20000))]);b.head=attachFemaleHead(b,template);b.head.follow(true);}catch(e){remember('Visage de Marianne',e.message||e);}
 try{coverMarianneWaist(b);}catch(e){remember('Tenue de Marianne',e.message||e);}
 setProgress('people',1);return b;
}
async function loadPeople(){
 // Do not inflate two large 3D models at the same time on a phone. Retain each successful stage for retry.
 if(!assetAhmed)assetAhmed=await loadAhmed();
 if(!assetMarianne){showBootStage('Assemblage du personnage de Marianne…');assetMarianne=await loadMarianne();}
 people=[assetAhmed,assetMarianne];downloadCache.clear();
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
// Every character is authored with local +Z pointing forward.
function facingYaw(from,to){return Math.atan2(to.x-from.x,to.z-from.z);}
function openingPosition(id){return new T.Vector3(id==='m'?-1.28:1.28,0,.88);}
function openingLayout(id){const pos=openingPosition(id),other=openingPosition(id==='m'?'f':'m');return {pos,yaw:facingYaw(pos,other),sit:0};}
function turnDelta(from,to){return Math.atan2(Math.sin(to-from),Math.cos(to-from));}
function targetLayout(person,seated,dojoMode=false,nearSeats=false){
 const a=seatAnchors.get(person.id),i=person.id==='f'?1:-1;
 if(dojoMode)return {pos:new T.Vector3(i*.9,0,1.5),yaw:Math.PI,sit:0};
 if(!seated){
  if(nearSeats&&a){const pos=a.point.clone().addScaledVector(a.forward,.44);pos.y=0;return {pos,yaw:a.yaw,sit:0};}
  return openingLayout(person.id);
 }
 if(!a)throw Error('Repère de coussin absent');
 if(!person.seatedContact){const old=person.sit;person.pose(1);person.seatedContact=seatContact(person);person.pose(old);}
 const other=seatAnchors.get(person.id==='m'?'f':'m');
 const toward=other?facingYaw(a.point,other.point):a.yaw;
 // Small, physically plausible inward turn; keep the actual pelvis contact fixed.
 const yaw=a.yaw+T.MathUtils.clamp(turnDelta(a.yaw,toward),-.25,.25);
 const offset=person.seatedContact.clone().multiply(person.root.scale).applyAxisAngle(new T.Vector3(0,1,0),yaw);
 return {pos:a.point.clone().sub(offset),yaw,sit:1};
}
let movement=null,invitationMotion=null;
function layoutPeople(seated,dojoMode=false,nearSeats=false){
 const now=performance.now(),items=people.map(person=>{
  const from=person.root.position.clone(),yaw=person.root.rotation.y,sit=person.sit;
  return {person,from,yaw,sit,to:targetLayout(person,seated,dojoMode,nearSeats)};
 });
 if(dojoMode||step===0||!seated&&!nearSeats){movement=null;for(const {person,to} of items){person.root.position.copy(to.pos);person.root.rotation.y=to.yaw;person.pose(to.sit);}return;}
 movement={start:now,duration:seated&&items.some(x=>x.sit<.99)?1150:650,items};
}
// The first three dialogue shots take place in the empty white void.
// Only after the invitation do the chairs appear and the actors approach.
// Empty white opening invariant: the downloaded room is not a scene child.
// Removing the complete original GLB also removes any furniture descendants
// that have unexpected names. Only mount it after the actual invitation.
function mountRoom(visible){
 if(!room)return;
 if(visible){if(room.parent!==scene)scene.add(room);room.visible=true;}
 else{room.visible=false;room.removeFromParent();}
}
function furnitureAt(line,elapsed){
 const mode=line?.furniture||'none';
 const reveal=mode==='reveal'&&elapsed>=650;
 const showChairs=line?.scene==='white'&&(mode==='chairs'||mode==='all'||reveal);
 const showTV=showChairs&&mode==='all';
 mountRoom(showChairs);
 for(const c of chairs){const tv=/^TV[\s_]/i.test(c.name);c.visible=tv?showTV:showChairs;}
}
function beginInvitation(){
 movement=null;
 const items=people.map(person=>{
  // Start from the preceding real standing position, never jump to a chair.
  const initial=targetLayout(person,false),standing=targetLayout(person,false,false,true);
  if(person.sit>.02){person.root.position.copy(initial.pos);person.root.rotation.y=initial.yaw;person.pose(0);}
  const from=person.root.position.clone(),yaw=person.root.rotation.y,to=targetLayout(person,true);
  const walkYaw=facingYaw(from,standing.pos);
  person.gait=null;
  return {person,from,yaw,standing,to,walkYaw};
 });
 invitationMotion={items,complete:false};lastLayout='standing';
}
function angleMix(a,b,t){return a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;}
function updateInvitation(now){
 if(!invitationMotion||invitationMotion.complete)return;
 const elapsed=shotElapsed(now);let complete=true;
 for(const {person,from,yaw,standing,to,walkYaw} of invitationMotion.items){
  const delay=person.id==='m'?0:1250;
  const t=elapsed-delay;
  // The words appear first. Then the turn, the steps, the second turn, and the sit.
  const turn=T.MathUtils.smoothstep(t,1350,2050),walk=T.MathUtils.smoothstep(t,2050,4600);
  const face=T.MathUtils.smoothstep(t,4600,5350),sit=T.MathUtils.smoothstep(t,5350,7650);
  person.root.position.lerpVectors(from,standing.pos,walk).lerp(to.pos,sit);
  person.root.rotation.y=angleMix(angleMix(yaw,walkYaw,turn),standing.yaw,face);
  person.root.rotation.y=angleMix(person.root.rotation.y,to.yaw,sit);
  const strength=T.MathUtils.smoothstep(t,1900,2300)*(1-T.MathUtils.smoothstep(t,4200,4650));
  person.gait=strength>.002?{phase:Math.max(0,(t-2050)/1000)*1.25,strength}:null;
  if(person.id==='f'&&person.gait&&sit<.01){person.walkPose?.(person.gait.phase,strength);}
  else if(Math.abs(person.sit-sit)>.001||t>=4650&&t<=5350||sit===1&&person.sit!==1)person.pose(sit);
  if(t<7650)complete=false;
 }
 if(complete){for(const {person,to} of invitationMotion.items){person.gait=null;person.root.position.copy(to.pos);person.root.rotation.y=to.yaw;person.pose(1);}invitationMotion.complete=true;lastLayout='seated';$('next').disabled=false;}
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

// A quiet actor keeps breathing, looking and moving even when the other actor speaks.
// The female meshes do not share Ahmed's skeleton: deform their existing posed vertices
// coherently, using the same elbow pivots for the visible skin and the outfit.
function prepareArmMotion(person){
 const bodyPart=person.parts.find(p=>/^(body|corps|skin)$/i.test(p.name));if(!bodyPart)return null;
 const rest=bodyPart.reference,posed=bodyPart.mesh.geometry.attributes.position.array;
 let top=0,extent=0;for(let k=0;k<rest.length;k+=3){top=Math.max(top,rest[k+1]);extent=Math.max(extent,Math.abs(rest[k]));}
 if(top<.5||extent<.12)return null;
 const pivots={},parts=[];
 for(const sign of [-1,1]){
  const nearest=[];const goalY=top*.61,goalX=extent*.83;
  for(let k=0;k<rest.length;k+=3){if(sign*rest[k]<=0)continue;const d=(Math.abs(rest[k])-goalX)**2+(rest[k+1]-goalY)**2+(rest[k+2]-.015)**2;nearest.push([d,k]);}
  nearest.sort((a,b)=>a[0]-b[0]);const a=nearest.slice(0,20),v=new T.Vector3();
  for(const [,k] of a)v.add(new T.Vector3(posed[k],posed[k+1],posed[k+2]));pivots[sign]=v.multiplyScalar(1/Math.max(1,a.length));
 }
 for(const part of person.parts){
  if(/hair|brow|lash|eye|teeth|tongue|visage|cheveu/i.test(part.name))continue;
  const g=part.mesh.geometry,attr=g.attributes.position,norm=g.attributes.normal,a=attr.array,r=part.reference,indices=[],weights=[],sides=[];
  const base=a.slice(),normalBase=norm?.array.slice();
  for(let k=0;k<r.length;k+=3){
   const x=Math.abs(r[k]),y=r[k+1];
   const sideWeight=T.MathUtils.smoothstep(x,extent*.57,extent*.78);
   const low=T.MathUtils.smoothstep(y,top*.39,top*.44),high=1-T.MathUtils.smoothstep(y,top*.61,top*.725);
   const w=sideWeight*low*high;if(w<.012)continue;
   indices.push(k);weights.push(w);sides.push(r[k]<0?-1:1);
  }
  if(indices.length)parts.push({attr,norm,indices,weights,sides,base,normalBase});
 }
 return {parts,pivots,stamp:person.stamp};
}
const armVector=new T.Vector3(),armNormal=new T.Vector3();
function moveMarianneArms(person,g){
 if(!person.armCache||person.armCache.stamp!==person.stamp)person.armCache=prepareArmMotion(person);
 const cache=person.armCache;if(!cache)return;
 const transforms={};
 for(const sign of [-1,1]){
  const phase=sign===-1?.9:2.1,accent=g.energy*g.emphasis*(sign===-1?1:.7);
  const x=.045*Math.sin(g.time*1.15+phase)-(g.kind==='invite'?.23:.12)*accent;
  transforms[sign]=new T.Quaternion().setFromEuler(new T.Euler(x,sign*.045*accent,sign*(.018*Math.sin(g.time*.7+phase)+.035*accent)));
 }
 for(const p of cache.parts){
  for(let i=0;i<p.indices.length;i++){
   const k=p.indices[i],sign=p.sides[i],w=p.weights[i],pivot=cache.pivots[sign],q=transforms[sign];
   armVector.fromArray(p.base,k).sub(pivot).applyQuaternion(q).add(pivot);
   const a=p.attr.array;a[k]=T.MathUtils.lerp(p.base[k],armVector.x,w);a[k+1]=T.MathUtils.lerp(p.base[k+1],armVector.y,w);a[k+2]=T.MathUtils.lerp(p.base[k+2],armVector.z,w);
   if(p.norm&&p.normalBase){armNormal.fromArray(p.normalBase,k).applyQuaternion(q);const n=p.norm.array;n[k]=T.MathUtils.lerp(p.normalBase[k],armNormal.x,w);n[k+1]=T.MathUtils.lerp(p.normalBase[k+1],armNormal.y,w);n[k+2]=T.MathUtils.lerp(p.normalBase[k+2],armNormal.z,w);}
  }
  p.attr.needsUpdate=true;if(p.norm)p.norm.needsUpdate=true;
 }
 const sway=.012*Math.sin(g.time*.8)+.012*g.gaze;
 person.body.rotation.z=sway;person.body.rotation.x=.009*Math.sin(g.time*1.2);person.body.rotation.y=(g.headYaw||0)*.32;
 const pivot=person.sit?.64:.86;person.body.position.x=pivot*Math.sin(sway);person.body.position.y=.0028*Math.sin(g.time*1.3);
}
function shotElapsed(now=performance.now()){return Math.max(0,(shotPaused?pausedAt:now)-shotStart);}
function speakerActor(id){return people.find(p=>p.id===id);}
function actionEnvelope(t,duration){const start=T.MathUtils.smoothstep(t,0,1.1),end=1-T.MathUtils.smoothstep(t,Math.max(1.2,duration-1.4),duration);return start*end;}
let speech=null,lastMotion=0;
function stopSpeech(){speech=null;currentSpeaker=null;for(const p of people)p.speak?.(0,0,0);}
function setCue(id,text,offset=0){
 stopSpeech();if(!id||!text){bubble.hidden=true;return;}
 const actor=speakerActor(id);currentSpeaker=id;
 const b=document.createElement('b'),p=document.createElement('p');
 b.textContent=actor?.root.name||(id==='m'?'Ahmed':'Marianne');p.textContent=text.replaceAll('{pseudo}',alias);
 bubble.replaceChildren(b,p);bubble.hidden=false;
 bubble.getAnimations().forEach(a=>a.cancel());bubble.animate([{opacity:0},{opacity:1}],{duration:260});
 speech={id,text:p.textContent,start:offset,duration:Math.max(1400,text.length*58)};
}
function updateActing(now){
 const line=lines[step];if(!line||!started||!ready||stage==='garden')return;
 const elapsed=shotElapsed(now),t=elapsed/1000,duration=line.ms/1000;
 if(line.secondary&&!secondCue&&elapsed>=line.secondary.at){secondCue=true;setCue(line.secondary.speaker,line.secondary.text,line.secondary.at);}
 if(now-lastMotion<33)return;lastMotion=now;
 for(const p of people){
  const speaking=currentSpeaker===p.id,energy=speaking?1:.20;
  const localTime=t+(p.id==='f'?2.6:0);
  const pulse=.45+.55*Math.sin(localTime*1.75)**2,emphasis=actionEnvelope(t,duration)*pulse;
  const blinkPhase=(localTime+1.65)%5.1,blink=blinkPhase<.16?Math.sin(blinkPhase/.16*Math.PI):0;
  const partner=people.find(other=>other!==p);
  const watching=line.gesture==='watch';
  const lookTarget=watching?new T.Vector3(0,.65,-2.2):partner?.root.position;
  // While walking/sitting, let the body lead the motion. Otherwise direct
  // the eyes/head toward the actual other actor or the screen.
  const moving=line.invitation&&invitationMotion&&!invitationMotion.complete&&elapsed>=1350;
  const headYaw=lookTarget&&!moving&&stage==='white'?T.MathUtils.clamp(turnDelta(p.root.rotation.y,facingYaw(p.root.position,lookTarget)),-.64,.64):0;
  const gaze=headYaw/.64;
  const g={time:localTime,energy,emphasis,kind:speaking?line.gesture:'listen',gaze,headYaw,blink,gait:p.gait};
  try{if(p.id==='m')p.pose(p.sit,g);else moveMarianneArms(p,g);}catch(e){if(!p.motionWarning){remember('Animation des gestes',e.message||e);p.motionWarning=true;}}
  let jaw=0,wide=0;
  if(speaking&&speech&&speech.id===p.id){
   const st=elapsed-speech.start;
   if(st>=0&&st<speech.duration&&!shotPaused){
    const char=speech.text[Math.min(speech.text.length-1,Math.floor(st/58))]?.toLowerCase()||' ';
    const vowel=/[aeiouyàâéèêëîïôùûüœ]/.test(char),closed=/[bmpfvw\s.,;:!?]/.test(char),phase=(Math.sin(st*.022)+1)*.5;
    jaw=closed?.014:(vowel?.07+.16*phase:.04+.07*phase);wide=vowel?.35:.08;
   }
  }
  p.speak?.(jaw,wide,blink);
 }
}
const headPoint=new T.Vector3();
function actorHead(person,out=new T.Vector3()){
 if(person?.headBone){person.headBone.getWorldPosition(out);out.y+=.135;return out;}
 if(person?.head?.group){person.head.group.updateWorldMatrix(true,false);return person.head.group.localToWorld(out.set(0,.145,.035));}
 if(person){out.set(0,person.sit?1.12:1.53,0);return person.root.localToWorld(out);}
 return out.set(0,1.2,0);
}
function anchorBubble(){
 const speaker=speakerActor(currentSpeaker);if(!speaker||bubble.hidden)return;
 actorHead(speaker,headPoint);headPoint.project(camera);
 const w=canvasHost.clientWidth,h=canvasHost.clientHeight,x=(headPoint.x+1)*w/2,y=(1-headPoint.y)*h/2;
 const bw=bubble.offsetWidth,bh=bubble.offsetHeight,pad=10;
 const left=T.MathUtils.clamp(x-bw/2,pad,Math.max(pad,w-bw-pad));
 const above=y-bh-28>=pad,top=above?y-bh-22:T.MathUtils.clamp(y+38,pad,Math.max(pad,h-bh-12));
 bubble.style.left=left+'px';bubble.style.top=top+'px';bubble.style.bottom='auto';
 bubble.style.setProperty('--tail-x',T.MathUtils.clamp(x-left,15,bw-15)+'px');
 bubble.classList.toggle('below',!above);
}
function scheduleNext(ms){clearTimeout(autoTimer);if(autoplay)autoTimer=setTimeout(()=>{if(autoplay&&!pending)next();},Math.max(100,ms));}

// The original television remains in the scene. A texture, not a replacement
// television model, carries a short silent montage of existing site artwork.
const filmFrames=[
 {url:'/assets/membres/salon-decor.webp',title:'Découvrir',subtitle:'Un monde à explorer'},
 {url:'/assets/membres/invitation-salon.webp',title:'Rencontrer',subtitle:'La Maison des rencontres'},
 {url:'/assets/board/scene-cards-v1.png',title:'Voyager',subtitle:'Les Treize Chemins'},
 {url:'/assets/membres/salon-v27-apercu.webp',title:'Créer',subtitle:'Un espace en construction'}
];
let televisionFilm=null,filmIndex=-1,filmShot='',filmImages=[];
function prepareFilm(){
 if(televisionFilm||!television)return;
 try{
  const screen=findChild(television,/^Screen_LowB/i);let mesh=null;screen?.traverse(o=>{if(!mesh&&o.isMesh)mesh=o;});if(!mesh)return;
  const geo=mesh.geometry.clone(),p=geo.attributes.position;geo.computeBoundingBox();const b=geo.boundingBox,s=b.getSize(new T.Vector3()),uv=new Float32Array(p.count*2);
  for(let i=0;i<p.count;i++){uv[2*i]=(p.getX(i)-b.min.x)/Math.max(s.x,.0001);uv[2*i+1]=(p.getY(i)-b.min.y)/Math.max(s.y,.0001);}
  geo.setAttribute('uv',new T.BufferAttribute(uv,2));mesh.geometry=geo;
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=500;
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.minFilter=T.LinearFilter;
  const ctx=canvas.getContext('2d');mesh.material=new T.MeshBasicMaterial({map:tex,toneMapped:false,side:T.DoubleSide});
  televisionFilm={mesh,ctx,canvas,tex};
  filmImages=filmFrames.map(frame=>{const image=new Image();image.src=frame.url;return image;});drawFilm(-1);
 }catch(e){remember('Écran de télévision',e.message||e);}
}
function drawFilm(index){
 if(!televisionFilm)return;const {ctx,canvas,tex}=televisionFilm,w=canvas.width,h=canvas.height;
 ctx.fillStyle='#142b26';ctx.fillRect(0,0,w,h);
 if(index>=0){const im=filmImages[index];if(im?.complete&&im.naturalWidth){const s=Math.max(w/im.naturalWidth,h/im.naturalHeight),iw=im.naturalWidth*s,ih=im.naturalHeight*s;ctx.drawImage(im,(w-iw)/2,(h-ih)/2,iw,ih);}
  const grad=ctx.createLinearGradient(0,h*.48,0,h);grad.addColorStop(0,'rgba(20,43,38,0)');grad.addColorStop(1,'rgba(15,32,28,.85)');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
  ctx.textAlign='center';ctx.fillStyle='#fffdf4';ctx.font='36px Georgia';ctx.fillText(filmFrames[index].title,w/2,h-68);
  ctx.font='20px system-ui';ctx.fillText(filmFrames[index].subtitle,w/2,h-32);
 }
 tex.needsUpdate=true;
}
function updateFilm(line,elapsed){
 const overlay=$('film-montage');
 if(line.shot!=='tv'&&line.shot!=='montage'){overlay.hidden=true;if(filmShot){filmShot='';filmIndex=-1;drawFilm(-1);}return;}
 const interval=line.shot==='tv'?1500:2500,i=Math.min(filmFrames.length-1,Math.floor(elapsed/interval));
 if(filmShot!==line.id||filmIndex!==i){
  filmShot=line.id;filmIndex=i;drawFilm(i);
  const frame=filmFrames[i];$('film-image').style.backgroundImage='url("'+frame.url+'")';$('film-title').textContent=frame.title;$('film-subtitle').textContent=frame.subtitle;
  if(line.shot==='montage')overlay.animate([{opacity:.35},{opacity:1}],{duration:420,easing:'ease-out'});
 }
 overlay.hidden=line.shot!=='montage'||elapsed<900;
 if(line.shot==='montage'){$('film-caption').textContent=line.text;overlay.style.opacity=String(T.MathUtils.smoothstep(elapsed,900,1450));}else overlay.style.opacity='1';
}
let cutCamera=true;
const shotAim=new T.Vector3(),shotEye=new T.Vector3(),smoothAim=new T.Vector3(),smoothEye=new T.Vector3();
// Dialogue camera convention: stay on the negative-Z side of the line
// joining the two actors. A reverse shot shows the speaker from near the
// listener's shoulder, never from behind the speaking actor.
function exchangeFrame(person,other,isClose,push,htan,move){
 const head=actorHead(person),listener=actorHead(other);
 const axis=new T.Vector3().subVectors(listener,head);axis.y=0;
 const separation=axis.length();if(separation<.01)axis.set(person.id==='m'?1:-1,0,0);else axis.normalize();
 const side=new T.Vector3(axis.z,0,-axis.x);if(side.z>0)side.negate();
 const half=isClose?.245:.40,dist=Math.max(isClose?.86:1.25,half/htan);
 const along=Math.min(Math.max(.38,separation-.20),dist*.86)*(1-.075*push);
 const lateral=Math.max(isClose?.48:.68,Math.sqrt(Math.max(.18,dist*dist-along*along)))*(1-(move==='push'?.055:.02)*push);
 const aim=head.clone();aim.y-=isClose?.055:.22;
 const eye=aim.clone().addScaledVector(axis,along).addScaledVector(side,lateral);
 eye.y=head.y+.025;
 return {aim,eye};
}

// Blocking adapted from the Construct scene: an extreme close shot pulls out,
// rotates to an over-the-shoulder discovery, then travels toward the guide.
// No furniture exists in the scene graph during these two shots.
function discoveryFrame(visitor,guide,t,htan){
 const v=actorHead(visitor),g=actorHead(guide);
 const axis=g.clone().sub(v);axis.y=0;axis.normalize();
 const side=new T.Vector3(axis.z,0,-axis.x);if(side.z>0)side.negate();
 const u=T.MathUtils.smoothstep(t,.04,.42),orbit=T.MathUtils.smoothstep(t,.28,.93);
 const near=Math.max(.40,.105/htan),far=Math.max(1.10,.50/htan);
 const radius=T.MathUtils.lerp(near,far,u),az=orbit*2.66;
 const eye=v.clone().addScaledVector(axis,Math.cos(az)*radius).addScaledVector(side,Math.sin(az)*radius+.045);
 eye.y=v.y+.045-.05*orbit;
 const front=v.clone().sub(eye).normalize(),back=g.clone().sub(eye).normalize();
 const reveal=T.MathUtils.smoothstep(orbit,.40,1);
 // Bisect actual sight lines rather than using a fixed target in world space.
 // On a narrow portrait screen this keeps the second actor visible.
 const view=front.clone().lerp(back,.55*reveal).normalize();
 const aim=eye.clone().addScaledVector(view,Math.max(.4,radius));
 aim.y-=T.MathUtils.lerp(.015,.10,reveal);
 return {aim,eye,roll:(1-T.MathUtils.smoothstep(t,0,.24))*Math.PI*.5};
}
function guideApproachFrame(visitor,guide,t,htan){
 const v=actorHead(visitor),g=actorHead(guide),axis=v.clone().sub(g);axis.y=0;axis.normalize();
 const side=new T.Vector3(axis.z,0,-axis.x);if(side.z>0)side.negate();
 const previous=discoveryFrame(visitor,guide,1,htan);
 const near=g.clone().addScaledVector(axis,Math.max(.85,.25/htan)).addScaledVector(side,.34);near.y=g.y+.04;
 // First leave the visitor's shoulder to one side, then advance past it.
 const shoulder=previous.eye.clone().lerp(near,.46).addScaledVector(side,.42);
 const s=1-t;
 const eye=previous.eye.clone().multiplyScalar(s*s).addScaledVector(shoulder,2*s*t).addScaledVector(near,t*t);
 const aim=previous.aim.clone().lerp(g.clone().add(new T.Vector3(0,-.06,0)),T.MathUtils.smoothstep(t,0,.85));
 return {aim,eye};
}
function cameraShot(line,elapsed,dt){
 const t=T.MathUtils.clamp(elapsed/line.ms,0,1),push=t*t*(3-2*t);
 const aspect=Math.max(.25,camera.aspect),vfov=46,htan=Math.tan(T.MathUtils.degToRad(vfov*.5))*aspect;
 camera.fov=vfov;camera.updateProjectionMatrix();camera.up.set(0,1,0);
 let roll=0;
 if(line.shot==='discovery'){
  const v=discoveryFrame(people[1],people[0],t,htan);shotAim.copy(v.aim);shotEye.copy(v.eye);roll=v.roll;
 }else if(line.shot==='approach'){
  const v=guideApproachFrame(people[1],people[0],push,htan);shotAim.copy(v.aim);shotEye.copy(v.eye);
 }else if(line.shot==='dojo'){
  angle+=(targetAngle-angle)*(1-Math.exp(-dt*2));
  shotAim.set(.1,1.25,.65);const d=Math.max(radius,3.0/htan);
  shotEye.set(shotAim.x+Math.sin(angle)*d,shotAim.y+1.12,shotAim.z+Math.cos(angle)*d);
 }else if(line.shot==='arrival'){
  const a=people[0].root.position,b=people[1].root.position,center=a.clone().add(b).multiplyScalar(.5);
  const halfWidth=Math.max(1.85,Math.abs(a.x-b.x)*.5+.70);
  const d=Math.max(3.45,halfWidth/htan,1.16/Math.tan(T.MathUtils.degToRad(vfov*.5)))*(1-.035*push);
  shotAim.set(center.x,.90,center.z-.10);
  const reveal=T.MathUtils.smoothstep(elapsed,450,3000);
  const theta=Math.PI-.95+.95*reveal;
  shotEye.set(shotAim.x+Math.sin(theta)*d,1.53+.12*(1-reveal),shotAim.z+Math.cos(theta)*d);
 }else if(line.shot==='rear'){
  const a=actorHead(people[0]),b=actorHead(people[1]),mid=a.clone().add(b).multiplyScalar(.5);
  const tv=television?bounds(television).getCenter(new T.Vector3()):new T.Vector3(0,.65,-2.2);
  shotAim.copy(mid).lerp(tv,.32+.22*push);shotAim.y=.91;
  const d=Math.max(3.8,1.95/htan),theta=Math.PI*(1-push);
  shotEye.set(shotAim.x+Math.sin(theta)*d,1.70+.30*Math.sin(push*Math.PI),shotAim.z+Math.cos(theta)*d);
 }else if((line.shot==='tv'||line.shot==='montage')&&television){
  const b=bounds(television),center=b.getCenter(new T.Vector3()),size=b.getSize(new T.Vector3());
  const target=televisionFilm?bounds(televisionFilm.mesh).getCenter(new T.Vector3()):center;
  const towards=new T.Vector3().subVectors(new T.Vector3(0,center.y,0),center);towards.y=0;towards.normalize();
  const d=line.shot==='montage'?Math.max(.12,Math.max(.95,(size.x*.58)/htan)*(.87-.80*T.MathUtils.smoothstep(elapsed,0,950))):Math.max(.95,(size.x*.58)/htan)*(1-.13*push);
  shotAim.copy(target);shotEye.copy(target).addScaledVector(towards,d);shotEye.y+=.03;shotEye.x+=.045*(1-push);
 }else if(line.shot==='close'||line.shot==='medium'||line.shot==='reverse'){
  const person=speakerActor(line.speaker)||people[0],other=people.find(p=>p!==person);
  const v=exchangeFrame(person,other,line.shot!=='medium',push,htan,line.move);
  shotAim.copy(v.aim);shotEye.copy(v.eye);
 }else{
  const a=actorHead(people[0]),b=actorHead(people[1]),center=a.clone().add(b).multiplyScalar(.5);
  const wide=line.shot==='wide',exchange=line.shot==='exchange';
  const width=Math.max(exchange?1.02:1.40,Math.abs(a.x-b.x)*.5+(exchange?.31:.42));
  const dist=Math.max(wide?3.55:exchange?2.25:3.15,width/htan)*(1-.06*push);
  const theta=wide?2.97+.12*push:Math.PI-.055+.04*push;
  shotAim.copy(center);shotAim.y=wide?.92:center.y-(exchange?.24:.22);
  shotEye.set(shotAim.x+Math.sin(theta)*dist,shotAim.y+.33,shotAim.z+Math.cos(theta)*dist);
 }
 if(cutCamera){smoothEye.copy(shotEye);smoothAim.copy(shotAim);cutCamera=false;}
 else{const alpha=1-Math.exp(-Math.max(.001,dt)*5);smoothEye.lerp(shotEye,alpha);smoothAim.lerp(shotAim,alpha);}
 camera.position.copy(smoothEye);camera.lookAt(smoothAim);if(roll)camera.rotateZ(roll);camera.updateMatrixWorld(true);
}


async function showScene(index){
 if(!ready||pending)return;
 const requested=Math.max(0,Math.min(index,lines.length-1)),line=lines[requested],isDojo=line.scene==='dojo';
 clearTimeout(autoTimer);
 if(((line.seated||line.invitation)&&!seatsReady)||(isDojo&&!dojo)){
  setPending(true);$('scene-wait').textContent='La suite se prépare…';
  try{if(isDojo)await prepareDojo();else await prepareSeats();}
  catch(e){remember('Chargement de la suite',e.message||e);automatic(false);$('scene-wait').textContent='La suite n’a pas pu se charger. Réessaie avec Continuer.';setPending(false);$('scene-wait').hidden=false;return;}
  setPending(false);
 }
 const previous=step>=0?lines[step]:null;
 $('scene-wait').hidden=true;step=requested;shotStart=performance.now();shotPaused=false;secondCue=false;cutCamera=true;
 stage=isDojo?'dojo':'white';
 mountRoom(false);whiteFloor.visible=!isDojo;if(dojo)dojo.visible=isDojo;
 scene.background.set(isDojo?0xd7c4a7:0xffffff);
 invitationMotion=null;for(const p of people)p.gait=null;
 const layout=isDojo?'dojo':line.seated?'seated':'standing';
 if(line.invitation){beginInvitation();}
 else if(layout!==lastLayout){lastLayout=layout;layoutPeople(line.seated,isDojo,false);}
 if(isDojo){mountRoom(false);chairs.forEach(c=>c.visible=false);targetAngle=Math.PI;radius=6.1;}
 else{furnitureAt(line,0);if(line.shot==='tv'||line.shot==='rear')prepareFilm();}
 if(line.speaker)setCue(line.speaker,line.text);else{stopSpeech();bubble.hidden=true;}
 updateFilm(line,0);
 if(!previous||previous.scene!==line.scene||line.move==='fade'){
  $('cinema-fade').animate([{opacity:1},{opacity:0}],{duration:780,easing:'ease-in-out'});
 }
 status.textContent=isDojo?'Dojo · apprentissage':'Salle blanche · '+line.id;
 $('prev').disabled=step<=0;$('next').disabled=!!line.invitation;$('next').textContent=step===lines.length-1?'Entrer dans le jardin':step===dojoStart-1?'Découvrir le dojo':'Continuer';
 $('joystick').hidden=!isDojo;$('personalize').hidden=!isDojo;
 if(autoplay&&step<lines.length-1&&step!==dojoStart-1)scheduleNext(line.ms);
 else if(autoplay){automatic(false,true);}
}

function startGarden(){
 autoplay=false;clearTimeout(autoTimer);stopSpeech();$('film-montage').hidden=true;stage='garden';$('garden').hidden=false;
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
function next(){if(!started||pending||stage==='garden'||invitationMotion&&!invitationMotion.complete)return;if(step>=lines.length-1)startGarden();else showScene(step+1)}

function automatic(on,hold=false){
 const now=performance.now();autoplay=on;clearTimeout(autoTimer);$('auto').textContent=on?'Pause cinéma':'Lecture cinéma';
 if(on){
  if(shotPaused){shotStart=now-pausedElapsed;shotPaused=false;}
  const line=lines[step];if(line)scheduleNext(Math.max(250,line.ms-shotElapsed(now)));
 }else if(!hold&&!shotPaused&&step>=0){pausedElapsed=shotElapsed(now);pausedAt=now;shotPaused=true;}
}
$('enter').onclick=()=>{if(!authorized||!ready)return;alias=$('pseudo').value.trim().slice(0,40)||alias;$('welcome').hidden=true;started=true;lastLayout='';setPending(false);autoplay=true;$('auto').textContent='Pause cinéma';void showScene(0)};
$('next').onclick=()=>{automatic(false,true);next()};
$('prev').onclick=()=>{automatic(false,true);$('garden').hidden=true;void showScene(Math.max(0,step-1));};
$('skip').onclick=()=>{if(!authorized||!ready||pending)return;automatic(false,true);$('welcome').hidden=true;started=true;void showScene(dojoStart);};
$('auto').onclick=()=>{if(started&&!pending)automatic(!autoplay)};
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

 const now=performance.now();if(!shotPaused){advanceMovement(now);updateInvitation(now);}
 if(!started||step<0){mountRoom(false);camera.position.set(0,1.45,-4.5);camera.lookAt(0,1,0);renderer.render(scene,camera);return;}
 const line=lines[step],elapsed=shotElapsed(now);
 if(stage==='white')furnitureAt(line,elapsed);
 if(!shotPaused)updateActing(now);else for(const p of people)p.speak?.(0,0,0);
 updateFilm(line,elapsed);cameraShot(line,elapsed,dt);
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
 $('retry-load').hidden=true;$('load-error-details').hidden=true;$('load-title').textContent='Un instant…';showBootStage('La rencontre se prépare.');$('loading').hidden=false;$('welcome').hidden=true;
 initialTask=(async()=>{
 try{
  if(!authorized)await authorize();
  if(!room)await loadWhite();
  if(people.length!==2)await loadPeople();
  showBootStage('La rencontre est prête.');
  ready=true;$('enter').disabled=false;$('welcome').hidden=false;$('loading').hidden=true;
  // The opening scene can now be played, independently of the rest.
  setPending(false);$('prev').disabled=true;$('next').disabled=true;$('auto').disabled=true;$('personalize').hidden=true;
  void preloadNext();
 }catch(e){
  remember('Chargement initial',e.message||e);
  if(!authorized&&/connexion|Réservé/i.test(String(e.message))){$('loading').hidden=true;$('access-denied').hidden=false;return;}
  $('load-title').textContent='Un contretemps';$('load-description').textContent='Le chargement a été interrompu. Les fichiers déjà reçus sont conservés.';const detail=$('load-error-details');detail.textContent=bootStage+' · '+String(e.message||e).slice(0,180);detail.hidden=false;$('retry-load').hidden=false;
 }finally{initialTask=null;}
 })();return initialTask;
}
$('retry-load').onclick=()=>void initialize();
frame();void initialize();
