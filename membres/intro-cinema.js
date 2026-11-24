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
const whiteFloor=new T.Mesh(new T.PlaneGeometry(80,80),new T.MeshStandardMaterial({color:0xfafafa,roughness:.96}));
whiteFloor.rotation.x=-Math.PI/2;whiteFloor.position.y=-.018;whiteFloor.receiveShadow=true;
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
 scene.add(room,whiteFloor);chairs.forEach(c=>c.visible=true);setProgress('white',1);canvasHost.classList.add('room-ready');
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
 const lo=min+height*.46,hi=min+height*.71,half=height*.155;
 const rest=part.base.slice();g.setAttribute('introRest',new T.BufferAttribute(rest,3));
 const previous=mat.onBeforeCompile.bind(mat),key=mat.customProgramCacheKey.bind(mat);
 mat.onBeforeCompile=(shader,renderer)=>{
  previous(shader,renderer);
  shader.vertexShader='attribute vec3 introRest; varying vec3 introClothingRest;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nintroClothingRest=introRest;');
  shader.fragmentShader='varying vec3 introClothingRest;\n'+shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\nfloat waistBand=step('+lo.toFixed(6)+',introClothingRest.y)*step(introClothingRest.y,'+hi.toFixed(6)+')*step(abs(introClothingRest.x),'+half.toFixed(6)+');\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(1.0,1.0,1.0),waistBand); diffuseColor.a=mix(diffuseColor.a,1.0,waistBand);');
 };
 const oldKey=key();mat.customProgramCacheKey=()=>oldKey+'-intro-waist-'+lo.toFixed(5)+'-'+hi.toFixed(5);mat.needsUpdate=true;
}
async function loadPeople(){
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
   const skinOrHair=/(skin|peau|face|visage|body|corps|hair|cheveu|iris|eye|oeil|brow|sourcil|cils|lash|lip|lèvre|mouth|dent|teeth|ongle|nail|oreille|ear|nez|nose)/i.test(label);
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
 const a=actor('m',-.9,'Ahmed'),b=actor('f',.9,'Marianne');
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
function seatPeople(value){
 for(const [i,person] of people.entries()){
  person.pose(value);
  person.root.position.x=(i?1.05:-1.05);
  person.root.position.z=.20;
 }
}
function showMessage(line){
 const b=document.createElement('b'),p=document.createElement('p');
 b.textContent=line[0];p.textContent=line[1].replaceAll('{pseudo}',alias);
 bubble.replaceChildren(b,p);bubble.hidden=false;
 bubble.getAnimations().forEach(a=>a.cancel());
 bubble.animate([{opacity:0,transform:'translate(-50%,10px)'},{opacity:1,transform:'translate(-50%,0)'}],{duration:500});
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
 if(isDojo){
  room.visible=false;chairs.forEach(c=>c.visible=false);
  for(const [i,person] of people.entries()){
   person.pose(0);person.root.position.set(i?.9:-.9,0,1.5);person.root.rotation.y=Math.PI;
  }
 }else{
  for(const [i,p] of people.entries()){p.root.rotation.y=Math.PI;p.root.position.set(i?1.05:-1.05,0,.20)}
  const seated=step>=4;
  for(const person of people)person.pose(seated?1:0);
  chairs.forEach(c=>c.visible=seated);
 }
 targetAngle=line[3];radius=isDojo?6.1:3.7;
 showMessage(line);
 status.textContent=isDojo?'Dojo · apprentissage':'Salle blanche · '+(step>=4?'les masques':'la rencontre');
 $('prev').disabled=step<=0;$('next').textContent=step===lines.length-1?'Entrer dans le jardin':'Continuer';
 $('joystick').hidden=!isDojo;$('personalize').hidden=!isDojo;
 if(autoplay&&step<lines.length-1){
  clearTimeout(autoTimer);autoTimer=setTimeout(()=>showScene(step+1),step===5?6600:4800);
 }else if(autoplay){autoplay=false;$('auto').textContent='Lecture cinéma'}
}
function startGarden(){
 autoplay=false;clearTimeout(autoTimer);stage='garden';$('garden').hidden=false;
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
 if(on)autoTimer=setTimeout(next,4800)}
$('enter').onclick=()=>{if(!authorized||!ready)return;alias=$('pseudo').value.trim().slice(0,40)||alias;$('welcome').hidden=true;started=true;setPending(false);automatic(true);showScene(0)};
$('next').onclick=()=>{automatic(false);next()};
$('prev').onclick=()=>{automatic(false);showScene(Math.max(0,step-1));$('garden').hidden=true};
$('skip').onclick=()=>{if(!authorized||!ready||pending)return;automatic(false);$('welcome').hidden=true;started=true;showScene(14)};
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
 const mid=stage==='dojo'?new T.Vector3(.1,1.25,.65):new T.Vector3(0,1.01,-.5);
 const dist=radius*(camera.aspect<.75?1.24:1);
 cameraEye.set(mid.x+Math.sin(angle)*dist,mid.y+(stage==='dojo'?1.12:.45),mid.z+Math.cos(angle)*dist);
 camera.position.copy(cameraEye);camera.lookAt(mid);
 if(stage==='white'){
  if(targetAngle<.5&&angle<1.6){
   bubble.style.bottom='17%';
  }else bubble.style.bottom='12%';
 }else bubble.style.bottom='12%';
 renderer.render(scene,camera);
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
