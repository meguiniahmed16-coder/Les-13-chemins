import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {unzipSync,strFromU8} from 'three/examples/jsm/libs/fflate.module.js';
const $=id=>document.getElementById(id),canvas=$('scene'),bubble=$('bubble'),note=$('status');
const errors=[],reportKey='maison-originale-retours-v1';let reports=[];
try{const x=JSON.parse(localStorage.getItem(reportKey)||'[]');if(Array.isArray(x))reports=x.slice(-90)}catch{}
const log=(message,where='intro')=>{errors.push({at:new Date().toISOString(),where,message:String(message).slice(0,700)})};
window.addEventListener('error',e=>log(e.message,'javascript'));
window.addEventListener('unhandledrejection',e=>log(e.reason?.message||String(e.reason),'promesse'));
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene(),camera=new T.PerspectiveCamera(48,1,.05,130);
scene.background=new T.Color(0xffffff);scene.fog=new T.FogExp2(0xffffff,.012);
scene.add(new T.HemisphereLight(0xffffff,0xd1c5ad,2));
const sun=new T.DirectionalLight(0xffffff,2.5);sun.position.set(-4,8,3);scene.add(sun);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
const fill=new T.DirectionalLight(0xe4e8fd,.6);fill.position.set(4,4,-5);scene.add(fill);
const floor=new T.Mesh(new T.PlaneGeometry(150,150),new T.MeshStandardMaterial({color:0xfdfdfb,roughness:1}));
floor.rotation.x=-Math.PI/2;floor.position.y=-.035;floor.receiveShadow=true;scene.add(floor);
const loader=new GLTFLoader();
const lines=[
 ['Narrateur','Qu’est-ce qu’une rencontre ? Qu’est-ce que véritablement l’autre ?','white',0],
 ['Narrateur','L’autre est-il celui que je vois ? Ou celui dont la présence transforme quelque chose en moi ?','white',0],
 ['Narrateur','Nous n’allons pas décider tout de suite. Approche.','white',0],
 ['Narrateur','Viens, asseyons-nous.','seat',0],
 ['Narrateur','Voici le monde tel que tu l’as connu, {pseudo}.','seat',0],
 ['Narrateur','Un monde de masques. Un monde d’illusions.','seat',Math.PI],
 ['Narrateur','Un monde où tu as joué un personnage.','seat',Math.PI],
 ['Narrateur','Un monde où, tous les matins, tu te déguises pour aller travailler.','seat',Math.PI],
 ['Narrateur','Où tu ne rencontres que les masques des autres.','seat',Math.PI],
 ['Narrateur','Mais il existe un autre monde.','seat',Math.PI*.72],
 ['Narrateur','Ici, tu peux prendre le risque d’être toi-même.','seat',0],
 ['Narrateur','Tu peux aussi te déguiser. Personne ne te jugera.','seat',0],
 ['Narrateur','Suis-moi.','seat',0],
 ['Narrateur','Avant d’aller plus loin, je dois t’expliquer comment ce monde fonctionne.','dojo',0],
 ['Narrateur','Tu peux déplacer ton personnage, tourner la caméra et choisir son apparence.','dojo',0],
 ['Narrateur','Ce monde est encore en construction. Tu vas participer à sa construction.','dojo',0],
 ['Narrateur','Quand tu le souhaiteras, tu pourras retourner aux options avancées de personnalisation.','dojo',0],
 ['Narrateur','Viens découvrir le jardin, les papillons et la maison.','garden',0]
];
const placeholder='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5tm6YAAAAASUVORK5CYII=';
const decoder=new TextDecoder(),encoder=new TextEncoder();
let white=null,dojo=null,actors=[],furniture=[],step=-1,auto=false,autoTimeout=0,mode='intro',alias='Voyageur',authorized=false,ready=false,assetsPromise=null,gardenStarted=false,cinemaRadius=4.4,angle=0,targetAngle=0,camHeight=2,camHeightGoal=2,camRadius=4.4,camRadiusGoal=4.4,point=new T.Vector3(0,1,-.1),stick={x:0,z:0},drag=null;
const switchNote=(s)=>{note.textContent=s;};
function parseGLB(bytes){return new Promise((resolve,reject)=>loader.parse(bytes.buffer,'',resolve,reject))}
async function pieces(kind,count,label){
  const urls=Array.from({length:count},(_,i)=>'/api/maison-original/assets/'+kind+'/'+String(i).padStart(3,'0'));
  const chunks=new Array(count);let offset=0,index=0,finished=0;
  async function task(){
    while(index<count){
      const n=index++,response=await fetch(urls[n],{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(45000)});
      if(!response.ok)throw Error('Le fichier original '+label+' est incomplet (fragment '+n+' : HTTP '+response.status+').');
      chunks[n]=new Uint8Array(await response.arrayBuffer());finished++;
      switchNote('Chargement du '+label+' original · '+finished+'/'+count);
    }
  }
  await Promise.all(Array.from({length:Math.min(4,count)},task));
  const size=chunks.reduce((n,x)=>n+x.byteLength,0),raw=new Uint8Array(size);
  for(const chunk of chunks){raw.set(chunk,offset);offset+=chunk.byteLength}
  return raw;
}
function restoreIncompleteWhite(raw){
 const view=new DataView(raw.buffer,raw.byteOffset,raw.byteLength);
 if(view.getUint32(0,true)!==0x46546c67)throw Error('Fichier original salle blanche illisible.');
 const jsonLength=view.getUint32(12,true),binStart=20+jsonLength+8;
 const gltf=JSON.parse(decoder.decode(raw.subarray(20,20+jsonLength)));
 const available=raw.length-binStart;
 const removed=[];
 for(let i=0;i<gltf.bufferViews.length;i++){
  const v=gltf.bufferViews[i];
  if((v.byteOffset||0)+v.byteLength>available)removed.push(i);
 }
 // The archived file's final six images were not uploaded completely.
 // Retain all *original* geometry, UVs and the available textures.
 for(const img of gltf.images||[]){
   if(removed.includes(img.bufferView)){
     delete img.bufferView;delete img.mimeType;img.uri=placeholder;
   }
 }
 for(const a of gltf.accessors||[])if(removed.includes(a.bufferView))throw Error('Géométrie originale incomplète.');
 if(removed.length){
  const end=gltf.bufferViews.length-removed.length;
  if(removed.some((v,i)=>v!==end+i))throw Error('Structure originale discontinue.');
  gltf.bufferViews.length=end;
 }
 gltf.buffers[0].byteLength=available;
 const json=encoder.encode(JSON.stringify(gltf)),jsonPad=(4-json.length%4)%4;
 const bin=raw.subarray(binStart),binPad=(4-bin.length%4)%4,total=12+8+json.length+jsonPad+8+bin.length+binPad;
 const out=new Uint8Array(total),head=new DataView(out.buffer);
 head.setUint32(0,0x46546c67,true);head.setUint32(4,2,true);head.setUint32(8,total,true);
 head.setUint32(12,json.length+jsonPad,true);head.setUint32(16,0x4e4f534a,true);
 out.set(json,20);out.fill(0x20,20+json.length,20+json.length+jsonPad);
 const binHead=20+json.length+jsonPad;
 head.setUint32(binHead,bin.length+binPad,true);head.setUint32(binHead+4,0x004e4942,true);
 out.set(bin,binHead+8);
 return out;
}
function namedFurniture(root){
  furniture=[];
  root.traverse(x=>{
    if(/^BLUE CHAIR|^RED CHAIR|^TV_284|^TV Case/.test(x.name))furniture.push(x);
    if(/^TV Screen\./.test(x.name))x.visible=false;
  });
  for(const f of furniture){f.userData.originalScale=f.scale.clone();f.scale.setScalar(.001)}
}
function revealFurniture(show){
  for(const f of furniture){
    const original=f.userData.originalScale;if(!original)continue;
    f.userData.goal=show?1:.001;
  }
}
function geometry(h,files,scale=10000){
 const arr=(key,C)=>{const value=files[key];if(!value)throw Error('Maillage V27 manquant : '+key);return new C(value.buffer.slice(value.byteOffset,value.byteOffset+value.byteLength))};
 const g=new T.BufferGeometry();
 g.setAttribute('position',new T.BufferAttribute(Float32Array.from(arr(h.p,Int16Array),x=>x/scale),3));
 g.setAttribute('normal',new T.BufferAttribute(Float32Array.from(arr(h.n,Int8Array),x=>x/127),3));
 if(h.uv)g.setAttribute('uv',new T.BufferAttribute(Float32Array.from(arr(h.uv,Uint16Array),x=>x/65535),2));
 g.setIndex(new T.BufferAttribute(arr(h.i,Uint16Array),1));
 g.computeBoundingSphere();g.attributes.position.setUsage(T.DynamicDrawUsage);return g;
}
async function loadCharacters(){
 switchNote('Chargement des vrais personnages du salon V27…');
 const response=await fetch('/assets/depart-duo/scene.bin',{cache:'force-cache'});
 if(!response.ok)throw Error('Les personnages du salon V27 sont indisponibles.');
 const files=unzipSync(new Uint8Array(await response.arrayBuffer())),info=JSON.parse(strFromU8(files['index.json']));
 const urlMap=new Map(),texMap=new Map();
 function texture(path){
  if(texMap.has(path))return texMap.get(path);
  const data=files[path];if(!data)throw Error('Texture V27 manquante : '+path);
  const url=URL.createObjectURL(new Blob([data],{type:'image/webp'}));urlMap.set(path,url);
  const t=new T.TextureLoader().load(url);t.colorSpace=T.SRGBColorSpace;t.anisotropy=2;
  texMap.set(path,t);return t;
 }
 const result=[];
 for(const id of ['m','f']){
  const root=new T.Group(),body=new T.Group(),parts=[];
  root.name=id==='m'?'Narrateur · personnage V27':'Joueur · personnage V27';root.add(body);
  for(const h of info[id].parts){
    const geo=geometry(h,files),source=info[id].tex[h.tex],name=(h.name||'').toLowerCase();
    const keepSkin=/face|skin|head|eye|lash|brow|hair|mouth|lip|nose|ear|body|hand|foot/.test(name);
    const alpha=/hair|short02|lash|brow/.test(name);
    const material=new T.MeshStandardMaterial({
      map:keepSkin?texture(source):null,
      color:0xffffff,roughness:.86,side:T.DoubleSide,alphaTest:alpha?.32:0
    });
    const obj=new T.Mesh(geo,material);obj.castShadow=true;obj.receiveShadow=true;body.add(obj);
    const base=geo.attributes.position.array.slice(),i=9<h.units.length?9:0;
    const poses=h.units.map((u,j)=>({delta:new Int8Array(files[h.anim+j].buffer.slice(files[h.anim+j].byteOffset,files[h.anim+j].byteOffset+files[h.anim+j].byteLength)),unit:u/10000}));
    parts.push({obj,base,poses});
  }
  root.scale.setScalar(id==='m'?1.075:1.04);
  scene.add(root);result.push({root,parts,id});
 }
 return result;
}
function pose(actor,sit){
 for(const part of actor.parts){
  const pos=part.obj.geometry.attributes.position,base=part.base;
  const anim=part.poses[9]||part.poses[0];
  if(sit&&anim&&anim.delta.length===base.length){
   for(let i=0;i<base.length;i++)pos.array[i]=base[i]+anim.delta[i]*anim.unit;
  }else pos.array.set(base);
  pos.needsUpdate=true;
 }
}
function placeCharacters(sit,training=false){
 const xs=training?[-1.1,1.1]:[-1.06,1.05],z=training?.4:-.12;
 for(let i=0;i<actors.length;i++){
  const a=actors[i];a.root.position.set(xs[i],sit?-.06:0,z);a.root.rotation.y=0;
  pose(a,sit);
 }
}
async function loadWhite(){
 const bytes=await pieces('white',18,'salle blanche');
 switchNote('Ouverture du décor et des fauteuils originaux…');
 white=(await parseGLB(restoreIncompleteWhite(bytes))).scene;
 namedFurniture(white);scene.add(white);white.visible=true;
}
async function loadDojo(){
 if(dojo)return;
 const bytes=await pieces('dojo',13,'dojo');
 switchNote('Ouverture du dojo original…');
 dojo=(await parseGLB(bytes)).scene;dojo.position.y=2.04;
 dojo.visible=false;scene.add(dojo);
}
function bubbleLine(line){
 bubble.hidden=false;bubble.replaceChildren();
 const speaker=document.createElement('b'),p=document.createElement('p');
 speaker.textContent=line[0];p.textContent=line[1].replaceAll('{pseudo}',alias);
 bubble.append(speaker,p);
 bubble.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:540,fill:'forwards'});
}
function stageName(){return step<0?'accueil':step<3?'salle blanche':step<13?'fauteuils et télévision':step<17?'dojo':'jardin'}
function setStage(next){
 mode=next;
 if(white)white.visible=next==='white'||next==='seat';
 if(dojo)dojo.visible=next==='dojo';
 floor.visible=next==='white'||next==='seat';
 for(const a of actors)a.root.visible=next!=='garden';
 if(next==='dojo'){
  scene.background.set('#d8c9b3');scene.fog.color.set('#d8c9b3');scene.fog.density=.002;
  point.set(0,1.4,0);camRadiusGoal=7.5;camHeightGoal=3.45;
 }else{
  scene.background.set('#ffffff');scene.fog.color.set('#ffffff');scene.fog.density=.012;
  point.set(0,1.05,-.25);camRadiusGoal=4.4;camHeightGoal=2.05;
 }
 $('joystick').hidden=next!=='dojo';
 $('garden').hidden=next!=='garden';
 if(next==='dojo')placeCharacters(false,true);
 else placeCharacters(next==='seat',false);
 revealFurniture(next==='seat');
}
async function navigate(n){
 if(!ready)return;
 clearTimeout(autoTimeout);step=Math.max(0,Math.min(lines.length-1,n));
 const line=lines[step],next=line[2];
 if(next==='dojo'&&!dojo){
  $('next').disabled=true;
  try{await loadDojo()}catch(e){fatal(e);return}finally{$('next').disabled=false}
 }
 if(next==='garden'){setStage('garden');startGarden();bubbleLine(line);auto=false;return}
 setStage(next);bubbleLine(line);targetAngle=line[3];
 $('prev').disabled=step===0;$('next').textContent=step===lines.length-1?'Recommencer':'Continuer';
 switchNote((step+1)+' / '+lines.length+' · '+stageName());
 if(auto&&step<13)autoTimeout=setTimeout(()=>navigate(step+1),step===4?6700:4700);
 else if(auto){auto=false;$('auto').textContent='Lecture cinéma';}
}
async function startGarden(){
 if(gardenStarted)return;gardenStarted=true;
 $('garden').hidden=false;
 const frame=$('garden-frame');
 frame.src='/membres/v27/salon.html?v=gestes50&resident=marianne';
 frame.addEventListener('load',()=>{
  const show=()=>{
   try{
    const doc=frame.contentDocument;
    doc.getElementById('pin')?.click();
    setTimeout(()=>{try{doc.getElementById('lookHome')?.click()}catch{}},1200);
   }catch(e){log(e.message,'jardin')}
  };
  try{
   frame.contentWindow.addEventListener('salon-ready',show,{once:true});
   if(frame.contentDocument?.body?.classList.contains('ready'))show();
   frame.contentWindow.addEventListener('error',e=>log(e.message,'jardin WebGL'));
  }catch(e){log(e.message,'jardin iframe')}
 });
}
function fatal(e){
 log(e.message||String(e),'chargement');
 switchNote('Chargement interrompu · '+(e.message||String(e)));
 $('loading').textContent='Le modèle original ne s’est pas ouvert : '+(e.message||String(e));
 $('loading').hidden=false;$('enter').disabled=true;
}
$('enter').onclick=()=>{
 if(!ready)return;
 alias=$('pseudo').value.trim().slice(0,40)||'Voyageur';
 $('welcome').hidden=true;auto=true;$('auto').textContent='Pause cinéma';
 navigate(0);
};
$('next').onclick=()=>{auto=false;clearTimeout(autoTimeout);$('auto').textContent='Lecture cinéma';navigate(step===lines.length-1?0:step+1)};
$('prev').onclick=()=>{auto=false;clearTimeout(autoTimeout);$('auto').textContent='Lecture cinéma';navigate(step-1)};
$('auto').onclick=()=>{auto=!auto;$('auto').textContent=auto?'Pause cinéma':'Lecture cinéma';if(auto)autoTimeout=setTimeout(()=>navigate(Math.min(step+1,lines.length-1)),4200);else clearTimeout(autoTimeout)};
$('skip').onclick=()=>{auto=false;clearTimeout(autoTimeout);navigate(13)};
$('personalize').onclick=()=>location.assign('/membre.html?auteur=atelier#avatar');
$('report-open').onclick=()=>{$('report-scene').value=stageName();$('report-count').textContent=reports.length+' signalement(s) mémorisé(s)';$('report-dialog').showModal()};
$('report-close').onclick=()=>$('report-dialog').close();
$('report-add').onclick=()=>{
 const details=$('report-note').value.trim();if(!details)return;
 reports.push({date:new Date().toISOString(),stage:stageName(),step,type:$('report-type').value,details:details.slice(0,3000)});
 try{localStorage.setItem(reportKey,JSON.stringify(reports.slice(-90)))}catch{}
 $('report-note').value='';$('report-count').textContent=reports.length+' signalement(s) mémorisé(s)';
};
$('report-export').onclick=()=>{
 const data={created:new Date().toISOString(),version:'original-3d-cinema-1',stage:stageName(),step,events:reports,errors,userAgent:navigator.userAgent};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='rapport-maison-rencontres-'+new Date().toISOString().slice(0,10)+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
};
let activeDrag=null;
canvas.addEventListener('pointerdown',e=>{if(mode!=='dojo')return;activeDrag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!activeDrag)return;targetAngle+=(e.clientX-activeDrag.x)*.008;camHeightGoal=T.MathUtils.clamp(camHeightGoal+(activeDrag.y-e.clientY)*.01,1.5,6);activeDrag={x:e.clientX,y:e.clientY}});
canvas.addEventListener('pointerup',()=>activeDrag=null);
canvas.addEventListener('pointercancel',()=>activeDrag=null);
const pad=$('joystick'),nub=$('nub');
const updatePad=e=>{const b=pad.getBoundingClientRect(),x=(e.clientX-b.left-b.width/2)/(b.width*.4),y=(e.clientY-b.top-b.height/2)/(b.height*.4);stick={x:T.MathUtils.clamp(x,-1,1),z:T.MathUtils.clamp(y,-1,1)};nub.style.transform='translate('+stick.x*26+'px,'+stick.z*26+'px)'};
pad.addEventListener('pointerdown',e=>{pad.setPointerCapture(e.pointerId);updatePad(e)});
pad.addEventListener('pointermove',e=>{if(pad.hasPointerCapture(e.pointerId))updatePad(e)});
for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,()=>{stick={x:0,z:0};nub.style.transform=''});
const keys=new Set();window.addEventListener('keydown',e=>keys.add(e.key.toLowerCase()));window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
const clock=new T.Clock();
function resize(){const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(canvas);
function frame(){
 requestAnimationFrame(frame);const dt=Math.min(.055,clock.getDelta()),t=clock.elapsedTime,gain=1-Math.exp(-dt*1.45);
 angle+=Math.atan2(Math.sin(targetAngle-angle),Math.cos(targetAngle-angle))*gain;
 camRadius=T.MathUtils.lerp(camRadius,camRadiusGoal,gain);
 camHeight=T.MathUtils.lerp(camHeight,camHeightGoal,gain);
 if(mode==='dojo'&&actors.length){
  const x=stick.x+(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('q')||keys.has('arrowleft')?1:0);
  const z=stick.z+(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('z')||keys.has('arrowup')?1:0);
  if(Math.abs(x)+Math.abs(z)>.05){const p=actors[1].root.position;const speed=2.4*dt;p.x=T.MathUtils.clamp(p.x+x*speed,-4.5,4.5);p.z=T.MathUtils.clamp(p.z+z*speed,-3.8,4.2);}
 }
 for(const f of furniture)if(f.userData.originalScale&&f.userData.goal!==undefined){
  const k=T.MathUtils.lerp(f.scale.x/f.userData.originalScale.x,f.userData.goal,1-Math.exp(-dt*2));
  f.scale.copy(f.userData.originalScale).multiplyScalar(k);
 }
 const rad=camRadius,eyeZ=point.z-Math.cos(angle)*rad,eyeX=point.x+Math.sin(angle)*rad;
 camera.position.set(eyeX,camHeight,eyeZ);camera.lookAt(point);
 renderer.render(scene,camera);
}
resize();frame();
async function start(){
 try{
  const response=await fetch('/api/membres/me?auteur=1',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(18000)});
  if(!response.ok)throw Error('Session auteur indisponible.');
  const info=await response.json();if(!info.author)throw Error('Accès réservé à l’auteur.');
  authorized=true;alias=info.pseudo||'Voyageur';$('pseudo').value=alias;
  $('access-denied').hidden=true;$('welcome').hidden=false;
  await loadWhite();
  actors=await loadCharacters();
  ready=true;setStage('white');$('loading').hidden=true;$('enter').disabled=false;
  switchNote('La salle blanche et les personnages originaux sont prêts.');
 }catch(e){fatal(e)}
}
start();