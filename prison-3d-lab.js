import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {createGame,startGame,continueGame,move,aimAt,actionDown,actionUp,
 advance,pauseGame,aligned,ropePosition,setWindowAspect,PARTS} from './yoyo-core.js';
import {buildCell,CHARACTER_FILE,worldX} from './prison-3d-world.js';
const $=id=>document.getElementById(id);
const canvas=$('world'),w=buildCell(),g=createGame();
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.3;renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const camera=new T.PerspectiveCamera(64,16/9,.08,40);
let actor=null,lookNear=false,last=performance.now(),pressed=0,time=0,loaded=false;
const marker=new T.Mesh(new T.SphereGeometry(.055,14,10),
 new T.MeshBasicMaterial({color:0xedbd71,transparent:true,opacity:.9}));
marker.name='viseur-3d';w.scene.add(marker);
const qAxis=new T.Vector3(0,0,1),axisX=new T.Vector3(1,0,0),axisY=new T.Vector3(0,1,0);
function paintAvatar(root){
 root.traverse(obj=>{
  if(!obj.isMesh)return;
  obj.castShadow=true;obj.receiveShadow=true;obj.frustumCulled=false;
  if(obj.isSkinnedMesh&&obj.geometry.getAttribute('position')?.count>5000){
   const geo=obj.geometry.clone(),pos=geo.getAttribute('position'),
    colors=new Float32Array(pos.count*3);
   const cloth=new T.Color('#52636b'),trousers=new T.Color('#414c55'),
    face=new T.Color('#c79574'),shoes=new T.Color('#3d3c39'),shade=new T.Color();
   for(let i=0;i<pos.count;i++){
    const y=pos.getY(i),x=Math.abs(pos.getX(i));
    const c=y<.16?shoes:y<1.02?trousers:y<1.51&&x<.54?cloth:face;
    shade.copy(c).multiplyScalar(.95+((i*17)%13)/260).toArray(colors,i*3);
   }
   geo.setAttribute('color',new T.BufferAttribute(colors,3));
   obj.geometry=geo;
   obj.material=new T.MeshStandardMaterial({vertexColors:true,roughness:.89});
  }else if(obj.name==='Eyes')obj.material=new T.MeshStandardMaterial({color:'#f0e5d8'});
  else if(obj.name==='Eyebrows')obj.material=new T.MeshStandardMaterial({color:'#4a3833'});
 });
}
async function loadBody(){
 try{
  const gltf=await new GLTFLoader().loadAsync(CHARACTER_FILE);
  const root=gltf.scene;root.name='DetenuHumainArticuleCC0';
  const bones={};
  for(const name of ['Head','spine_02','upperarm_l','lowerarm_l','upperarm_r',
   'lowerarm_r','thigh_l','thigh_r']){
   const b=root.getObjectByName(name);
   if(!b?.isBone)throw Error('Os requis absent : '+name);
   bones[name]=b;
  }
  paintAvatar(root);
  root.scale.setScalar(1);root.position.set(.36,0,.39);root.rotation.y=Math.PI;
  w.scene.add(root);
  const rest=Object.fromEntries(Object.entries(bones).map(([name,b])=>[name,b.quaternion.clone()]));
  const hand=root.getObjectByName('hand_r');
  if(hand?.isBone){
   hand.add(w.heldBrush);
   w.heldBrush.position.set(.015,-.21,.035);
   w.heldBrush.rotation.set(Math.PI/2,0,.17);
   w.heldBrush.scale.setScalar(.9);
  }else{
   w.heldBrush.position.set(.54,1.19,-1.30);
  }
  actor={root,bones,rest,handAttached:!!hand?.isBone};
  loaded=true;$('play').disabled=false;
  $('loader').textContent='Corps articulé Quaternius CC0 prêt à jouer.';
 }catch(err){
  $('loader').textContent='Le corps CC0 ne s’est pas chargé : '+String(err.message||err);
  $('play').disabled=true;
  console.error(err);
 }
}
function bend(bone,axis,angle){
 bone.quaternion.multiply(new T.Quaternion().setFromAxisAngle(axis,angle));
}
function poseBody(t){
 if(!actor)return;
 const b=actor.bones;
 for(const name in b)b[name].quaternion.copy(actor.rest[name]);
 const active=g.phase==='playing'||g.phase==='between';
 const reach=active&&!g.hidden?1:0;
 const sw=Math.sin(t*1.3)*.025,aim=(g.aim-.5);
 bend(b.upperarm_r,qAxis,1.04-reach*.48);
 bend(b.upperarm_l,qAxis,-1.10+reach*.09);
 bend(b.upperarm_r,axisX,-reach*.82);
 bend(b.lowerarm_r,axisX,-reach*.92);
 bend(b.spine_02,axisY,aim*.26);
 bend(b.Head,axisY,aim*.13);
 bend(b.thigh_l,axisX,sw);bend(b.thigh_r,axisX,-sw);
 actor.root.position.set(.36+aim*.17,g.hidden?-.34:0,.39);
 actor.root.rotation.y=Math.PI-aim*.33;
 if(!actor.handAttached)w.heldBrush.position.set(worldX(g.aim,g.aspect),1.42,-1.23);
 w.heldBrush.visible=active&&g.part>0&&!g.hidden;
}
function updateScene(t){
 const {delivery,bag,storedBrush,heldBrush}=w;
 const showRope=g.part>0||g.phase==='between'||g.phase==='victory';
 delivery.visible=showRope;
 delivery.position.x=worldX(ropePosition(g),g.aspect);
 delivery.position.y=1.32+Math.sin(t*1.1)*.06;
 delivery.rotation.z=Math.sin(t*.8)*.035;
 bag.material.color.set(g.part===2?'#6e9d9f':'#a67b62');
 storedBrush.visible=g.part===0;
 heldBrush.visible=g.part>0&&g.phase==='playing'&&!g.hidden;
 const x=worldX(g.aim,g.aspect);
 marker.position.set(x,g.part===0?.37:1.77,g.part===0?-.22:-1.56);
 marker.material.color.set(aligned(g)?'#63df9c':'#ffd48b');
 marker.visible=g.phase==='playing';
 poseBody(t);
 const cameraFrom=lookNear?new T.Vector3(.26,1.80,.87):new T.Vector3(-.15,1.82,1.39);
 const look=lookNear?new T.Vector3(.04,1.78,-1.57):new T.Vector3(.05,1.25,-1.15);
 camera.position.lerp(cameraFrom,.10);camera.lookAt(look);
}
function status(message){
 $('status').textContent=message;
 $('objective').textContent=g.phase==='victory'?'Les trois gestes sont accomplis':
  (PARTS[Math.min(g.part,2)]||PARTS[0]);
 $('score').textContent=g.points+' / 30';
 $('state').textContent=g.phase==='victory'?'Réussi':g.phase==='caught'?'Surpris':
  g.phase==='between'?'Étape franchie':g.guard==='watching'?'Surveillant proche':'En jeu';
 $('next').hidden=g.phase!=='between';
 $('retry').hidden=g.phase!=='caught'&&g.phase!=='victory';
}
function interpret(){
 for(const event of g.events.splice(0)){
  if(event.type==='part')status('Étape '+g.part+' accomplie. +10 points dans cette démonstration.');
  if(event.type==='between')status('Tu as réussi. Poursuis pour le prochain objet.');
  if(event.type==='caught')status('Le surveillant t’a vu. Recommence sans perdre le sens du geste.');
  if(event.type==='hook')status('La corde est accrochée. Maintiens le bouton et guide le sac entre les barreaux.');
  if(event.type==='bar-blocked')status('Le sac touche un barreau. Vise une ouverture.');
  if(event.type==='won')status('Tabac, café et ce geste de solidarité : les trois épreuves sont terminées.');
 }
}
function start(){
 startGame(g);status('Cherche la brosse sur le sol, puis attrape son manche.');
 $('play').hidden=true;$('next').hidden=true;$('retry').hidden=true;
}
$('play').onclick=start;
$('next').onclick=()=>{continueGame(g);status('Repère le sac, accroche la corde, puis tire entre les barreaux.');};
$('retry').onclick=start;
$('view').onclick=()=>{lookNear=!lookNear;$('view').textContent=lookNear?'Vue de la cellule':'Vue rapprochée';};
$('pause').onclick=()=>{pauseGame(g);$('pause').textContent=g.phase==='paused'?'Reprendre':'Pause';};
$('hint').onclick=()=>{$('guide').hidden=!$('guide').hidden;};
function pressAction(){if(g.phase==='playing')actionDown(g);else if(g.phase==='between')$('next').click();}
function releaseAction(){actionUp(g);}
$('fire').addEventListener('pointerdown',e=>{e.preventDefault();pressAction();});
for(const ev of ['pointerup','pointercancel','pointerleave'])$('fire').addEventListener(ev,releaseAction);
$('hide').addEventListener('pointerdown',e=>{e.preventDefault();move(g,0,1);});
canvas.addEventListener('pointerdown',e=>{
 if(g.phase!=='playing')return;
 const rect=canvas.getBoundingClientRect();
 aimAt(g,(e.clientX-rect.left)/Math.max(1,rect.width));
});
for(const [id,dir] of [['left',-1],['right',1]]){
 const el=$(id);
 el.addEventListener('pointerdown',e=>{e.preventDefault();pressed=dir;});
 for(const ev of ['pointerup','pointerleave','pointercancel'])
  el.addEventListener(ev,()=>{if(pressed===dir)pressed=0;});
}
const keys=new Set();
window.addEventListener('keydown',e=>{
 if(['ArrowLeft','ArrowRight','Space','KeyH','KeyV','Enter'].includes(e.code))e.preventDefault();
 if(e.repeat&&['Space','Enter'].includes(e.code))return;
 keys.add(e.code);
 if(e.code==='Space')pressAction();
 if(e.code==='Enter'&&g.phase==='between')$('next').click();
 if(e.code==='KeyV')$('view').click();
 if(e.code==='KeyH')move(g,0,1);
});
window.addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='Space')releaseAction();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pressed=0;releaseAction();}});
function frame(now){
 requestAnimationFrame(frame);
 const dt=Math.min(.05,(now-last)/1000||0);last=now;
 const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);
 if(canvas.width!==Math.round(width*renderer.getPixelRatio())||
  canvas.height!==Math.round(height*renderer.getPixelRatio())){
  renderer.setSize(width,height,false);
  camera.aspect=width/height;camera.updateProjectionMatrix();
 }
 setWindowAspect(g,camera.aspect);
 const direction=pressed+(keys.has('ArrowLeft')?-1:0)+(keys.has('ArrowRight')?1:0);
 if(direction)move(g,Math.sign(direction),0,dt);
 if(g.phase==='playing')advance(g,dt);
 time+=dt;updateScene(time);interpret();renderer.render(w.scene,camera);
}
$('loader').textContent='Chargement du personnage articulé CC0…';
loadBody();
status('La cellule est prête. Explore le décor ; le jeu commencera dès que le corps sera chargé.');
requestAnimationFrame(frame);
