/* Barcelone 3D — Parc de la Ciutadella réinterprété.
 * Personnages Kenney CC0 réutilisés depuis Camarades ! ; logique dans catalogne-3d-core.js.
 * Aucun élément du décor ne bloque les allées ou les clients.
 */
import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as cloneSkinned} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {PARK,CLIENTS,PATROLS,newRun,nearestClient,sell,dodge,advance,instruction,distance,clamp} from './catalogne-3d-core.js';
const $=id=>document.getElementById(id),canvas=$('world');
const embedded=new URLSearchParams(location.search).get('embedded')==='1'&&window.parent!==window;
const MODEL_PATHS=['character-male-a.glb','character-female-a.glb','character-male-c.glb','character-female-c.glb','character-male-e.glb','character-female-e.glb'].map(n=>'assets/manifestation/'+n);
let run=newRun(),sessionId=null,ready=false,replayMode=false,score=0,pendingSale=null,pendingSince=0;
let paused=false,soundOn=false,lastFrame=0,toastUntil=0,lastInstruction=null,orbital=0,orbitLeft=0,lastPoliceMessage=0,controlsLocked=false;
const joy={x:0,z:0},keys=new Set();
let joyPointer=null,clientActors=[],policeActors=[],people=[],hero=null;
const actorTemplates=[],walkMeshes=[],fountainWater=[];
const rnd=n=>{const v=Math.sin(n*14.29+3.16)*98724.35;return v-Math.floor(v)};
const world=new T.Scene();world.background=new T.Color(0xa4d0db);world.fog=new T.FogExp2(0xbfd2d2,.006);
const camera=new T.PerspectiveCamera(63,16/9,.08,180);
let renderer=null;
try{
 renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.4));
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.26;
}catch(err){$('overlayTitle').textContent='Impossible de lancer la 3D';$('overlayText').textContent='Le navigateur ne prend pas en charge WebGL. Essaie dans Chrome.';console.error(err);}
world.add(new T.HemisphereLight(0xe5f7ff,0x9c976e,2.8));
const sunlight=new T.DirectionalLight(0xffecc7,2.25);sunlight.position.set(-18,35,14);world.add(sunlight);
const boxGeo=new T.BoxGeometry(1,1,1),sphereGeo=new T.SphereGeometry(1,11,8),cylGeo=new T.CylinderGeometry(1,1,1,10);
const createMaterial=color=>new T.MeshStandardMaterial({color,roughness:.83,metalness:.04});
function obj(geometry,material,x,y,z,sx=1,sy=1,sz=1){
 const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m;
}
function cube(root,x,y,z,w,h,d,color){
 const mesh=obj(boxGeo,createMaterial(color),x,y,z,w,h,d);root.add(mesh);return mesh;
}
function sphere(root,x,y,z,w,h,d,color){
 const mesh=obj(sphereGeo,createMaterial(color),x,y,z,w,h,d);root.add(mesh);return mesh;
}
function cyl(root,x,y,z,r,h,color){
 const mesh=obj(cylGeo,createMaterial(color),x,y,z,r,h,r);root.add(mesh);return mesh;
}
function sign(text,w=2.2,bg='#f6d79e',fg='#253d37'){
 const c=document.createElement('canvas');c.width=512;c.height=128;
 const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,512,128);
 g.fillStyle=fg;g.font='bold 50px system-ui';g.textAlign='center';g.textBaseline='middle';
 g.fillText(text,256,65,480);
 const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
 return new T.Mesh(new T.PlaneGeometry(w,w/4),new T.MeshBasicMaterial({map:texture,side:T.DoubleSide}));
}
function drawTree(root,x,z,seed){
 const trunk=cyl(root,x,1.45,z,.20,2.9,0x756245);
 const crown=obj(sphereGeo,createMaterial([0x527f61,0x68976c,0x739a64,0x88a66e][seed%4]),x,4.1,z,1.35+rnd(seed)*.45,1.9,1.35);
 root.add(crown);
 return {trunk,crown};
}
function bench(root,x,z,side){
 cube(root,x,.62,z,1.85,.13,.56,0x855c3c);
 cube(root,x,.99,z-side*.20,1.85,.68,.12,0x805b3d);
 for(const offset of [-.78,.78])cube(root,x+offset,.28,z,.10,.53,.45,0x354e49);
}
function lamp(root,x,z){
 cyl(root,x,2.45,z,.065,4.90,0x405449);
 sphere(root,x,4.98,z,.27,.33,.27,0xffe6a8);
}
function pathways(root){
 // Allées larges et raccordées : aucune barrière dans le domaine jouable |x| <= 10.
 cube(root,0,-.25,61,54,.48,139,0x6e9f68);
 cube(root,0,.014,60,5.0,.035,132,0xd8c4a0);
 cube(root,-6.2,.019,60,3.3,.037,132,0xd6bd92);
 cube(root,6.2,.019,60,3.3,.037,132,0xd6bd92);
 for(const z of [12,29,51,73,95,116])cube(root,0,.02,z,21,.037,2.3,0xe1cda7);
 for(const edge of [-1,1])cube(root,edge*11.45,.05,61,.22,.11,126,0xcbbf9a);
 // Pelouses géométriques discontinues, sans collision.
 for(const side of [-1,1])for(let i=0;i<13;i++){
  const z=7+i*9,green=[0x84ad72,0x90b77c,0x77a56c][i%3];
  cube(root,side*8.7,.031,z,1.5,.023,6.4,green);
 }
}
function backgroundBuildings(root){
 const n=24,facades=new T.InstancedMesh(boxGeo,createMaterial(0xffffff),n);
 const roofs=new T.InstancedMesh(boxGeo,createMaterial(0x6a7180),n);
 const dummy=new T.Object3D(),palette=[0xe9cb9f,0xd8b8a7,0xf1d7b9,0xc9c9ad,0xc5d8d3];
 for(let i=0;i<n;i++){
  const side=i%2===0?-1:1,k=Math.floor(i/2),x=side*(31+k%3*3),z=-5+k*12.4;
  const h=10+rnd(i+51)*8;
  dummy.position.set(x,h/2,z);dummy.scale.set(8,h,9);dummy.rotation.set(0,0,0);dummy.updateMatrix();
  facades.setMatrixAt(i,dummy.matrix);facades.setColorAt(i,new T.Color(palette[i%5]));
  dummy.position.y=h+.55;dummy.scale.set(8.6,1.1,9.4);dummy.updateMatrix();roofs.setMatrixAt(i,dummy.matrix);
 }
 root.add(facades,roofs);
}
function lakeAndMonuments(root){
 // Lac à gauche, cascade sculptée et fontaine légère sur le côté droit.
 const lake=obj(new T.CylinderGeometry(1,1,.05,44),new T.MeshStandardMaterial({color:0x72b9c6,metalness:.16,roughness:.3}),
  -20,.04,68,10,.6,18);root.add(lake);
 for(let i=0;i<9;i++)sphere(root,-20+Math.cos(i*.72)*9.9,.17,68+Math.sin(i*.72)*17.8,1.8,.26,1.4,0xc6b69c);
 for(let i=0;i<7;i++){
  const x=-27+i*1.5;
  cube(root,x,1.1+(i%3)*.35,83,1.35,2.5+(i%3)*.70,2.2,0xd9c8ab);
 }
 for(let i=0;i<4;i++){
  const sheet=cube(root,-24+i*1.65,1.25,81.65,1.0,2.4,.07,0x8dd2e2);
  sheet.material.transparent=true;sheet.material.opacity=.79;fountainWater.push(sheet);
 }
 cyl(root,19,.64,36,4.9,1.1,0xe0d2b2);
 const pool=obj(new T.CylinderGeometry(1,1,.06,36),new T.MeshStandardMaterial({color:0x67c6cc,roughness:.28,metalness:.11}),
  19,1.23,36,4.15,1,4.15);root.add(pool);
 cyl(root,19,1.65,36,.53,1.7,0xb7a88e);
 sphere(root,19,2.58,36,.82,.24,.82,0xd6ccae);
 const plaza=sign('PARC DE LA CIUTADELLA',6,'#f2ddaa','#38524d');
 plaza.position.set(0,3.85,-4);root.add(plaza);
}
function makePark(){
 const root=new T.Group();world.add(root);
 pathways(root);backgroundBuildings(root);
 // Arbres en retrait des itinéraires et du lac.
 for(let z=2,i=0;z<125;z+=6.6,i++){
  for(const side of [-1,1]){
   const x=side*(13.1+(i%3)*3.0);
   if(side<0&&z>51&&z<86)continue;
   drawTree(root,x,z,i+(side>0?22:0));
   if(i%3===0)lamp(root,side*10.8,z+3);
   if(i%4===0)bench(root,side*10.4,z+5,side);
  }
 }
 for(const side of [-1,1])for(const z of [23,78,115]){
  const x=side*10.7;
  cube(root,x,1.12,z,.09,2.1,.09,0x416b5c);
  const signboard=sign(z===23?'PASSEIG':z===78?'PARC':'SORTIE',1.45,'#e1c77d','#2c564a');
  signboard.position.set(x,2.38,z);signboard.rotation.y=side===1?-Math.PI/2:Math.PI/2;root.add(signboard);
 }
 lakeAndMonuments(root);
 // Terrasse avec auvent jaune, au-delà de la zone de jeu.
 cube(root,19,.74,104,6.0,1.48,5.5,0x7c5841);
 cube(root,19,2.65,104,7,.20,6.4,0xc46a51);
 for(const x of [17,19,21]){
  cube(root,x,1.9,103.7,.09,1.4,.09,0xe6d8b9);
  sphere(root,x,2.74,103.7,.18,.14,.18,0xffdd91);
 }
 return root;
}
function makeActor(index,role='walker',color=0x87a988){
 const group=new T.Group();
 const clipset=actorTemplates[index%Math.max(1,actorTemplates.length)];
 let animation=null;
 if(clipset){
  const character=cloneSkinned(clipset.scene);character.scale.setScalar(2.45+rnd(index)*.15);group.add(character);
  const mixer=new T.AnimationMixer(character),walk=clipset.animations.find(c=>c.name==='walk')||clipset.animations[0];
  const idle=clipset.animations.find(c=>c.name==='idle')||walk;
  const active={walk:mixer.clipAction(walk),idle:mixer.clipAction(idle)};
  active.idle.play();animation={mixer,active,state:'idle'};
 }else{
  // Secours si un asset 3D manque sur un réseau mobile.
  cyl(group,0,.94,0,.26,1.0,color);sphere(group,0,1.62,0,.19,.25,.19,0xd5a47c);
  for(const sign of [-1,1])cyl(group,sign*.13,.35,0,.105,.70,0x3b5152);
 }
 if(role==='police'){
  sphere(group,0,1.12,-.13,.34,.42,.25,0x315f7b);
  cube(group,0,1.19,.13,.36,.08,.07,0xe2c766);
  cyl(group,0,1.80,0,.28,.16,0x243d59);
  cube(group,0,1.84,-.23,.39,.035,.23,0x203a50);
  const name=sign('POLICIA',.88,'#315c77','#fff9d9');
  name.position.set(0,1.18,-.40);group.add(name);
  for(const side of [-1,1])cube(group,side*.39,1.33,-.11,.14,.13,.17,0x9db1bd);
 }
 if(role==='hero'){
  sphere(group,0,1.82,0,.23,.10,.22,0x303e44);
  cube(group,0,1.82,.18,.23,.026,.18,0x303e44);
 }
 if(role==='client'){
  const scarf=cube(group,0,1.40,-.18,.38,.13,.12,color);scarf.rotation.z=.03;
 }
 return {group,animation,oldPos:new T.Vector3(),moving:false};
}
function animateActor(actor,dt,moving=false){
 if(!actor?.animation)return;
 const a=actor.animation,next=moving?'walk':'idle';
 if(a.state!==next){
  a.active[next].reset().play();a.active[next].crossFadeFrom(a.active[a.state],.18,true);a.state=next;
 }
 a.mixer.update(Math.max(0,Math.min(.05,dt)));
}
function createCharacters(root){
 hero=makeActor(2,'hero');root.add(hero.group);
 clientActors=CLIENTS.map((c,i)=>{
  const actor=makeActor(i+3,'client',c.color);actor.group.position.set(c.x,0,c.z);root.add(actor.group);
  const ring=new T.Mesh(new T.RingGeometry(.65,.86,30),new T.MeshBasicMaterial({color:c.color,side:T.DoubleSide,depthTest:false}));
  ring.rotation.x=-Math.PI/2;ring.position.set(c.x,.065,c.z);ring.renderOrder=15;root.add(ring);
  const diamond=obj(new T.OctahedronGeometry(.44),new T.MeshBasicMaterial({color:c.color,depthTest:false}),c.x,3,c.z,.82,1.15,.82);
  diamond.renderOrder=16;root.add(diamond);
  return {actor,ring,diamond,client:c};
 });
 policeActors=PATROLS.map((p,i)=>{
  const actor=makeActor(i+1,'police');actor.group.position.set(p.homeX,0,p.homeZ);root.add(actor.group);
  return {actor,oldX:p.homeX,oldZ:p.homeZ};
 });
 // Quelques silhouettes promenant dans le parc, sans masquer les clients.
 people=[];
 for(let i=0;i<11;i++){
  const actor=makeActor(i+8,'walker');
  const x=(i%2===0?-1:1)*(8.4+rnd(i+12)*1.2);
  const z=8+i*10.3;
  actor.group.position.set(x,0,z);root.add(actor.group);
  people.push({actor,x,z,speed:(i%2?1:-1)*(.4+rnd(i+51)*.3)});
 }
}
function resetClientVisuals(){
 for(const v of clientActors){
  const sold=run.sold.includes(v.client.id);
  v.ring.visible=!sold;v.diamond.visible=!sold;
 }
}
function updateActors(dt,time){
 if(!hero)return;
 hero.group.position.set(run.x,0,run.z);hero.group.rotation.y=run.facing;
 animateActor(hero,dt,Math.hypot(joy.x,joy.z)>.12||keys.size>0||run.dodgeTime>0);
 clientActors.forEach((v,i)=>{
  animateActor(v.actor,dt,false);
  v.diamond.position.y=3.0+Math.sin(time*3+i)*.22;
  v.diamond.rotation.y=time*1.6;
  v.ring.scale.setScalar(1+Math.sin(time*5+i)*.12);
 });
 run.police.forEach((p,i)=>{
  const v=policeActors[i];if(!v)return;
  const dx=p.x-v.oldX,dz=p.z-v.oldZ;
  v.actor.group.position.set(p.x,0,p.z);
  if(Math.hypot(dx,dz)>.0005){v.actor.group.rotation.y=Math.atan2(dx,dz);}
  animateActor(v.actor,dt,Math.hypot(dx,dz)>.001);
  v.oldX=p.x;v.oldZ=p.z;
 });
 people.forEach((v,i)=>{
  if(run.phase==='running'){
   v.z+=v.speed*dt;
   if(v.z<1)v.z=119;if(v.z>119)v.z=1;
  }
  v.actor.group.position.set(v.x,0,v.z);
  v.actor.group.rotation.y=v.speed>0?0:Math.PI;
  animateActor(v.actor,dt,run.phase==='running');
 });
 fountainWater.forEach((v,i)=>{v.position.y=1.25+Math.sin(time*2+i)*.08;});
}
function showToast(text,duration=1.05){
 const el=$('toast');el.textContent=text;el.hidden=false;el.style.opacity='1';
 toastUntil=performance.now()/1000+Math.min(1.3,Math.max(.55,duration));
}
function syncInstruction(){
 if(run.phase!=='running'||paused)return;
 const hint=instruction(run);
 if(hint.key!==lastInstruction){lastInstruction=hint.key;showToast(hint.text,1.05);}
}
function publish(type,payload={}){
 if(embedded&&sessionId)window.parent.postMessage({type,id:sessionId,...payload},location.origin);
}
function renderHUD(){
 $('clients').textContent=String(run.sold.length);
 $('points').textContent=replayMode?'PARTIE LIBRE':'+'+run.sold.length*2+' / 10 points';
 document.querySelectorAll('#dots span').forEach((el,i)=>{el.classList.toggle('done',i<run.sold.length);el.textContent=i<run.sold.length?'✓':String(i+1)});
 const near=nearestClient(run);
 $('sellHint').hidden=run.phase!=='running'||!near||paused;
 if(near)$('sellHint').textContent='◆ '+near.client.name+' proche · ROUGE : VENDRE';
 $('sell').classList.toggle('ready',!!near&&run.phase==='running'&&!paused);
 $('policeStatus').textContent=run.police.some(p=>p.chasing)?'⚠️ La police approche':'Évite les policiers';
 $('moveStatus').textContent=run.phase==='caught'?'Interpellé':run.phase==='won'?'✓ Mission réussie':run.phase==='running'?'Explore les allées':'5 clients · 2 points chacun';
 $('pause').disabled=run.phase!=='running'&&!paused;
 $('pause').textContent=paused?'Reprendre':'Pause';
}
function showOverlay(title,text,label='Commencer',showStart=true){
 $('overlayTitle').textContent=title;$('overlayText').textContent=text;
 $('overlay').hidden=false;$('start').hidden=!showStart;$('start').textContent=label;
}
function closeOverlay(){$('overlay').hidden=true;}
function start(){
 if(!ready||embedded&&!sessionId)return;
 run=newRun(run.sold);run.phase='running';paused=false;pendingSale=null;
 lastInstruction=null;lastPoliceMessage=0;lastFrame=0;orbital=0;orbitLeft=0;resetClientVisuals();
 closeOverlay();renderHUD();syncInstruction();
}
function caught(){
 paused=false;pendingSale=null;showOverlay('Interpellé.','Les clients déjà servis restent validés. Tu peux recommencer dans le parc.','Réessayer');
 showToast('Évite les policiers !');renderHUD();
}
function won(){
 run.phase='won';pendingSale=null;paused=false;
 showOverlay('Mission accomplie !','Les cinq clients sont servis. Dix points au maximum, sans doublon.','',false);
 showToast('✓ Cinq clients !');renderHUD();
}
function makeSale(){
 if(!ready||paused||run.phase!=='running')return;
 if(pendingSale){showToast('Vente en validation…',.75);return;}
 const result=sell(run);
 if(!result.client){showToast('Approche d’un client ◆',.95);return;}
 pendingSale=result.client.id;pendingSince=performance.now()/1000;
 resetClientVisuals();renderHUD();
 if(embedded){
  publish('catalogne:sale',{clientId:result.client.id});
  showToast('✓ Vente en validation',.9);
 }else{
  pendingSale=null;score+=2;showToast('✓ +2 points !',.9);
  if(result.finished)won();
 }
}
function performDodge(){
 if(paused||run.phase!=='running')return;
 if(dodge(run)){showToast('Esquive !',.75);beep(570,.08);}
 else showToast('Esquive indisponible',.65);
}
let audioCtx=null;
function beep(freq,duration){
 if(!soundOn)return;
 try{
  audioCtx??=new(window.AudioContext||window.webkitAudioContext)();
  audioCtx.resume?.();const t=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type='triangle';o.frequency.value=freq;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.045,t+.012);
  g.gain.exponentialRampToValueAtTime(.0001,t+duration);
  o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+duration+.02);
 }catch{}
}
function policeCry(){
 if(run.clock-lastPoliceMessage<4.5)return;
 const chase=run.police.find(p=>p.chasing);
 if(!chase)return;
 lastPoliceMessage=run.clock;showToast(Math.round(run.clock)%2?'¡Alto!':'¡Vuelve aquí!',.8);
 beep(290,.1);
}
function pause(){
 if(run.phase!=='running'&&!paused)return;
 paused=!paused;
 if(paused)showOverlay('Pause','Le parc t’attend. Les cinq clients restent en place.','Reprendre');
 else closeOverlay();
 renderHUD();
}
function endPauseOrStart(){
 if(paused){pause();return;}
 start();
}
function returnToBoard(){
 if(embedded)publish('catalogne:close');
 else window.location.href='jeu.html?niveau=3';
}
function input(){
 const left=Number(keys.has('arrowleft')||keys.has('a')||keys.has('q'));
 const right=Number(keys.has('arrowright')||keys.has('d'));
 const ahead=Number(keys.has('arrowup')||keys.has('w')||keys.has('z'));
 const behind=Number(keys.has('arrowdown')||keys.has('s'));
 return {x:clamp(joy.x+right-left,-1,1),z:clamp(joy.z+ahead-behind,-1,1)};
}
function bind(){
 $('start').addEventListener('click',endPauseOrStart);
 $('return').addEventListener('click',returnToBoard);
 $('back').addEventListener('click',returnToBoard);
 $('pause').addEventListener('click',pause);
 $('rotate').addEventListener('click',()=>{orbital=0;orbitLeft=Math.PI*2});
 $('sound').addEventListener('click',()=>{
  soundOn=!soundOn;$('sound').textContent=soundOn?'Son ON':'Son OFF';
  $('sound').setAttribute('aria-pressed',String(soundOn));beep(600,.09);
 });
 const stick=$('stick'),knob=$('knob');
 function updatePointer(e){
  const r=stick.getBoundingClientRect(),dx=(e.clientX-r.left-r.width/2)/(r.width*.31);
  const dz=-(e.clientY-r.top-r.height/2)/(r.height*.31);
  const length=Math.max(1,Math.hypot(dx,dz));
  joy.x=clamp(dx/length,-1,1);joy.z=clamp(dz/length,-1,1);
  knob.style.transform='translate('+joy.x*r.width*.25+'px,'+(-joy.z*r.height*.25)+'px)';
 }
 function release(e){
  if(e&&e.pointerId!==joyPointer)return;
  joyPointer=null;joy.x=0;joy.z=0;knob.style.transform='translate(0px,0px)';
 }
 stick.addEventListener('pointerdown',e=>{
  if(run.phase!=='running'||paused)return;e.preventDefault();joyPointer=e.pointerId;
  try{stick.setPointerCapture(e.pointerId)}catch{}
  updatePointer(e);
 });
 stick.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)updatePointer(e)});
 for(const name of ['pointerup','pointercancel'])stick.addEventListener(name,release);
 stick.addEventListener('lostpointercapture',()=>release());
 function action(button,callback){
  let lastTouch=0;
  button.addEventListener('pointerdown',e=>{if(button.disabled)return;e.preventDefault();lastTouch=performance.now();button.classList.add('held');callback();});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>button.classList.remove('held'));
  button.addEventListener('click',e=>{if(e.detail===0||performance.now()-lastTouch>450)callback()});
 }
 action($('sell'),makeSale);action($('dodge'),performDodge);
 window.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();
  if(['arrowleft','arrowright','arrowup','arrowdown','w','a','s','d','z','q',' ','enter','r','escape'].includes(key))e.preventDefault();
  const already=keys.has(key);keys.add(key);
  if(!already&&(key==='r'||key==='enter'))makeSale();
  if(!already&&key===' ')performDodge();
  if(!already&&key==='escape')pause();
 });
 window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
 window.addEventListener('blur',()=>{keys.clear();release();});
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&run.phase==='running'&&!paused)pause();
 });
 window.addEventListener('message',e=>{
  if(!embedded||e.source!==window.parent||e.origin!==location.origin||!e.data)return;
  const m=e.data;
  if(m.type==='catalogne:init'&&typeof m.id==='string'){
   const newSession=m.id!==sessionId;
   sessionId=m.id;replayMode=!!m.replay;score=Number.isFinite(m.score)?m.score:score;
   const sold=Array.isArray(m.sold)?m.sold:[];
   if(newSession||run.phase==='ready'||pendingSale){
    run=newRun(sold);run.phase='ready';pendingSale=null;paused=false;lastInstruction=null;
    resetClientVisuals();showOverlay('Cinq clients. Garde ton calme.','Michel t’a confié son matériel. Explore le parc, retrouve cinq clients et échappe aux policiers. Deux points par vente.','Entrer dans le parc');
   }else if(sold.length>run.sold.length){run.sold=[...sold];resetClientVisuals();}
   $('start').disabled=!ready;renderHUD();
  }
  if(m.type==='catalogne:credited'&&m.id===sessionId){
   pendingSale=null;score=Number.isFinite(m.score)?m.score:score;
   if(Array.isArray(m.sold))run.sold=m.sold.filter(id=>CLIENTS.some(c=>c.id===id));
   resetClientVisuals();beep(790,.12);
   if(m.finished||run.sold.length===5){won();}else{
    if(run.phase==='won')run.phase='running';
    showToast('✓ +2 points · '+run.sold.length+'/5',1.05);
   }
   renderHUD();
  }
 });
}
function resize(){
 const width=canvas.clientWidth,height=canvas.clientHeight;
 if(!width||!height||!renderer)return;
 const aspect=width/height;
 if(Math.abs(camera.aspect-aspect)>.02||!renderer.domElement.width){
  renderer.setSize(width,height,false);camera.aspect=aspect;camera.updateProjectionMatrix();
 }
}
function frame(ms){
 if(!renderer)return;
 requestAnimationFrame(frame);
 const dt=Math.min(.06,Math.max(0,(ms-lastFrame)/1000||0));lastFrame=ms;
 try{
  if(ready&&run.phase==='running'&&!paused){
   advance(run,dt,input());
   if(run.phase==='caught')caught();
   else{
    policeCry();syncInstruction();
    if(pendingSale&&ms/1000-pendingSince>2.6){
     pendingSale=null;
     // L'absence de réponse ne bloque jamais définitivement le bouton Vendre.
     if(embedded)publish('catalogne:ready');
     showToast('Vérification du score…',.9);
    }
   }
  }
  const t=ms/1000;
  if(!$('toast').hidden){
   const remain=toastUntil-t;
   if(remain<=0)$('toast').hidden=true;
   else $('toast').style.opacity=String(Math.min(1,remain/.22));
  }
  if(ready){
   updateActors(dt,t);
   if(orbitLeft>0){
    const step=Math.min(orbitLeft,Math.max(.012,dt)*2.4);
    orbital+=step;orbitLeft-=step;
    if(orbitLeft<.005){orbital=0;orbitLeft=0;}
   }
   const radius=17;
   const target=new T.Vector3(run.x,1.8,run.z+3.5);
   const desired=new T.Vector3(run.x+Math.sin(orbital)*radius,8.6,
    run.z-Math.cos(orbital)*radius);
   camera.position.lerp(desired,Math.min(1,dt*4.2+.01));
   camera.lookAt(target);
   if(run.phase==='running'&&!paused){
    renderHUD();
   }
  }
  resize();renderer.render(world,camera);
 }catch(err){console.error('Barcelone 3D:',err);if(!controlsLocked){controlsLocked=true;showToast('Erreur 3D : '+String(err.message||err).slice(0,75),1.2);}}
}
async function initialize(){
 if(!renderer)return;
 bind();makePark();
 try{
  const loader=new GLTFLoader();
  const models=await Promise.all(MODEL_PATHS.map(path=>loader.loadAsync(path)));
  for(const m of models){if(!m.scene||!m.animations?.some(c=>c.name==='walk'))throw Error('Personnage sans animation');actorTemplates.push(m);}
 }catch(err){console.warn('Modèles 3D indisponibles, personnages de secours activés',err);}
 createCharacters(world);ready=true;
 $('start').disabled=embedded&&!sessionId;
 $('start').textContent='Entrer dans le parc';
 $('overlayText').textContent='Michel t’a confié son matériel. Trouve cinq clients, vends avec ROUGE à proximité et évite les policiers avec JAUNE.';
 renderHUD();
 if(embedded)publish('catalogne:ready'); // sessionId peut être nul : répondre aussi sans id
 if(embedded)window.parent.postMessage({type:'catalogne:ready'},location.origin);
}
bind();
if(renderer){requestAnimationFrame(frame);initialize().catch(err=>{console.error(err);$('overlayTitle').textContent='Échec du lancement';$('overlayText').textContent=String(err.message||err);});}
