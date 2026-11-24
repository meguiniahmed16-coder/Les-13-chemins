import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {unzipSync,strFromU8} from 'three/examples/jsm/libs/fflate.module.js';

const $=id=>document.getElementById(id);
const canvasHost=$('viewport'),bubble=$('bubble'),status=$('status');
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.35));
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
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
const png=T?Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg=='),c=>c.charCodeAt(0)):new Uint8Array();
async function pieces(name,n){
 const result=Array(n);let next=0;
 async function worker(){
  while(next<n){const index=next++,which=String(index).padStart(3,'0');
   const response=await fetch('/api/intro-private/'+name+'/'+which,{cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(35000)});
   if(!response.ok)throw Error('Décor original '+name+' indisponible, fragment '+which+' : '+response.status);
   result[index]=new Uint8Array(await response.arrayBuffer());
   status.textContent='Décor original '+(name==='white'?'salle blanche':'dojo')+' · '+result.filter(Boolean).length+'/'+n;
  }
 }
 await Promise.all(Array.from({length:Math.min(3,n)},()=>worker()));
 const total=result.reduce((sum,part)=>sum+part.length,0),joined=new Uint8Array(total);
 let position=0;for(const part of result){joined.set(part,position);position+=part.length}
 return joined;
}
// The private R2 copy of the user's white-room GLB contains its geometry and 103 textures
// but the final six image payloads were not uploaded. Replace only those incomplete
// image payloads with one valid transparent pixel; preserve all original mesh vertices,
// original chair/TV transforms, original scene animation structures and available textures.
function restoreOriginal(bytes){
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(String.fromCharCode(...bytes.subarray(0,4))!=='glTF')throw Error('Modèle de salle blanche invalide');
 const declared=view.getUint32(8,true);
 if(declared===bytes.byteLength)return bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
 const jsonLen=view.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+jsonLen)));
 const binaryStart=20+jsonLen+8,binary=bytes.subarray(binaryStart),missing=[];
 for(let i=0;i<(json.images||[]).length;i++){
  const img=json.images[i];if(img.bufferView==null)continue;
  const ref=json.bufferViews[img.bufferView];
  if((ref.byteOffset||0)+ref.byteLength>binary.length)missing.push(i);
 }
 if(!missing.length)throw Error('La salle blanche est incomplète sans image remplaçable');
 const viewId=json.bufferViews.length;
 json.bufferViews.push({buffer:0,byteOffset:binary.length,byteLength:png.length});
 for(const i of missing){json.images[i].bufferView=viewId;json.images[i].mimeType='image/png'}
 for(let i=0;i<viewId;i++){
  const ref=json.bufferViews[i];
  if((ref.byteOffset||0)+ref.byteLength>binary.length){ref.byteOffset=0;ref.byteLength=0}
 }
 const text=new TextEncoder().encode(JSON.stringify(json));
 const jsonLength=Math.ceil(text.byteLength/4)*4,binLength=Math.ceil((binary.length+png.length)/4)*4;
 json.buffers[0].byteLength=binary.length+png.length;
 const jsonBytes=new TextEncoder().encode(JSON.stringify(json));
 const jsonPad=Math.ceil(jsonBytes.length/4)*4;
 const output=new Uint8Array(12+8+jsonPad+8+binLength),dv=new DataView(output.buffer);
 output.set([103,108,84,70],0);dv.setUint32(4,2,true);dv.setUint32(8,output.length,true);
 dv.setUint32(12,jsonPad,true);output.set([74,83,79,78],16);
 output.fill(32,20,20+jsonPad);output.set(jsonBytes,20);
 const at=20+jsonPad;dv.setUint32(at,binLength,true);output.set([66,73,78,0],at+4);
 output.set(binary,at+8);output.set(png,at+8+binary.length);
 return output.buffer;
}
const whiteFloor=new T.Mesh(new T.PlaneGeometry(80,80),new T.MeshStandardMaterial({color:0xfafafa,roughness:.96}));
whiteFloor.rotation.x=-Math.PI/2;whiteFloor.position.y=-.018;whiteFloor.receiveShadow=true;
async function loadRooms(){
 status.textContent='Chargement de la salle blanche originale…';
 const original=restoreOriginal(await pieces('white',18));
 room=(await loader.parseAsync(original,'')).scene;room.name='Salle blanche originale';
 // The supplied model includes 200 alternative video-screen frames. The actual TV
 // geometry is a separate node called TV_284, and must remain visible.
 room.traverse(o=>{
  if(o.name.startsWith('TV Screen.'))o.visible=false;
  if(/^BLUE CHAIR|^RED CHAIR|^TV_284/.test(o.name)){chairs.push(o);o.visible=false}
  if(o.isMesh){o.castShadow=true;o.receiveShadow=true}
 });
 television=chairs.find(o=>/^TV_284/.test(o.name));
 scene.add(room,whiteFloor);
 status.textContent='Chargement du dojo original…';
 const full=await pieces('dojo',13);
 dojo=(await loader.parseAsync(full.buffer,'')).scene;
 dojo.position.y=2.04;dojo.visible=false;scene.add(dojo);
 dojo.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
}
function bytesTo(type,input){return new type(input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength))}
async function loadPeople(){
 status.textContent='Chargement des véritables personnages V27…';
 const [roomBin,seatBin]=await Promise.all([
  fetch('/assets/depart-duo/scene.bin').then(r=>{if(!r.ok)throw Error('Modèles V27 indisponibles');return r.arrayBuffer()}),
  fetch('/membres/v27/assises.bin').then(r=>{if(!r.ok)throw Error('Poses assises indisponibles');return r.arrayBuffer()})
 ]);
 const files=unzipSync(new Uint8Array(roomBin)),info=JSON.parse(strFromU8(files['index.json']));
 const assises=unzipSync(new Uint8Array(seatBin)),poseIndex=JSON.parse(strFromU8(assises['index.json']));
 const poses=new Map();
 function poseArray(index){
  if(!poses.has(index)){
   const raw=assises[index],base=poseIndex.bases[index];
   if(base!==null){const prior=poseArray(base);for(let i=0;i<raw.length;i++)raw[i]+=prior[i]}
   poses.set(index,new Int8Array(raw.buffer,raw.byteOffset,raw.byteLength));
  }
  return poses.get(index);
 }
 const texCache=new Map();
 function texture(name){
  if(texCache.has(name))return texCache.get(name);
  if(!files[name])return null;
  const blob=URL.createObjectURL(new Blob([files[name]],{type:'image/webp'}));
  const tex=new T.TextureLoader().load(blob,()=>URL.revokeObjectURL(blob));
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
    color:skinOrHair?0xffffff:0xffffff,
    roughness:.88,
    alphaTest:/hair|short02|lash|brow/.test(h.name)?.36:.12,
    side:T.DoubleSide
   });
   const mesh=new T.Mesh(g,defaultMaterial);mesh.castShadow=true;body.add(mesh);
   const reference=pos.slice(),index=poseIndex.keys[id+'/'+h.name+'/sofa2/100'];
   const delta=index?poseArray(index):null,unit=index?poseIndex.units[id+'/'+h.name+'/sofa2/100']/10000:0;
   parts.push({mesh,reference,delta,unit});
  }
  root.position.set(x,0,.42);root.rotation.y=Math.PI;
  const instance={id,root,parts,sit:0,
   pose(value){this.sit=value;for(const part of parts){
    const array=part.mesh.geometry.attributes.position;
    if(part.delta){for(let i=0;i<part.reference.length;i++)array.array[i]=part.reference[i]+part.delta[i]*part.unit*value}
    else array.array.set(part.reference);array.needsUpdate=true;
   }}
  };
  return instance;
 }
 const a=actor('m',-.9,'Narrateur Ahmed'),b=actor('f',.9,'Joueur Marianne');
 people=[a,b];
}
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
 bubble.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:500,fill:'forwards'});
}
function showScene(index){
 if(!ready)return;
 step=Math.max(0,Math.min(index,lines.length-1));
 const line=lines[step],level=line[2],isDojo=level==='dojo';
 stage=isDojo?'dojo':'white';
 room.visible=!isDojo;whiteFloor.visible=!isDojo;dojo.visible=isDojo;
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
 $('controls').hidden=!isDojo;$('save').hidden=!isDojo;$('exit').hidden=true;
 if(autoplay&&step<14){
  clearTimeout(autoTimer);autoTimer=setTimeout(()=>showScene(step+1),step===5?6600:4800);
 }else if(autoplay){autoplay=false;$('auto').textContent='Lecture cinéma'}
}
function startGarden(){
 autoplay=false;clearTimeout(autoTimer);stage='garden';$('garden-original').hidden=false;
 bubble.hidden=true;$('controls').hidden=true;$('save').hidden=true;$('exit').hidden=false;
 status.textContent='Le jardin et la maison 3D du salon V27';
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
function next(){if(stage==='garden')return;if(step>=lines.length-1)startGarden();else showScene(step+1)}
function automatic(on){autoplay=on;clearTimeout(autoTimer);$('auto').textContent=on?'Pause cinéma':'Lecture cinéma';
 if(on)autoTimer=setTimeout(next,4800)}
$('start').onclick=()=>{if(!authorized||!ready)return;alias=$('pseudo').value.trim().slice(0,40)||alias;$('welcome').hidden=true;started=true;showScene(0);automatic(true)};
$('next').onclick=()=>{automatic(false);next()};
$('prev').onclick=()=>{automatic(false);showScene(Math.max(0,step-1));$('garden-original').hidden=true};
$('skip').onclick=()=>{automatic(false);$('welcome').hidden=true;showScene(14)};
$('auto').onclick=()=>automatic(!autoplay);
$('save').onclick=()=>location.assign('/membre.html?auteur=atelier#avatar');
$('exit').onclick=()=>location.assign('/membre.html?auteur=atelier#salon');
$('bug').onclick=()=>{$('report-scene').value=stage+' · '+(step+1);$('count').textContent=problems.length+' entrées';$('bug-dialog').showModal()};
$('cancel-report').onclick=()=>$('bug-dialog').close();
$('add-report').onclick=()=>{const text=$('report-note').value.trim();if(text){remember($('report-kind').value,text);$('report-note').value='';$('count').textContent=problems.length+' entrées'}};
$('export-report').onclick=()=>{
 const data={created:new Date().toISOString(),experience:'Prologue original GLB et personnages V27',step,stage,viewport:{width:innerWidth,height:innerHeight},entries:problems};
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='rapport-maison-des-rencontres-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
};
function resize(){const w=canvasHost.clientWidth,h=canvasHost.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(canvasHost);resize();
const stick=$('pad'),nub=$('nub');
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
 if(!ready||stage==='garden')return;
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
 alias=String(me.pseudo||'Voyageur').slice(0,40);$('pseudo').value=alias;authorized=true;$('locked').hidden=true;
}
(async()=>{
 try{
  await authorize();await Promise.all([loadRooms(),loadPeople()]);
  ready=true;status.textContent='Salle blanche et dojo originaux prêts';$('start').disabled=false;
  $('wait')?.remove();frame();
 }catch(e){
  remember('Chargement original',e.message||e);
  status.textContent='Impossible de charger les modèles originaux : '+String(e.message||e);
  if(!authorized){$('locked').hidden=false;$('welcome').hidden=true}else{$('start').disabled=true}
 }
})();
