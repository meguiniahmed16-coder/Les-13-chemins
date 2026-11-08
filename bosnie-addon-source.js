// Render-only enhancement for the Bosnian literary mini-game.
// CC0 male humanoid asset already present in the repository (Quaternius).
// The existing five gaps, hits, scoring, controls and soldiers' historic
// setting are untouched. The companion can never be hit.
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {createCompanionState,updateCompanion} from './bosnie-compagnon-core.js';

const UP=new THREE.Vector3(0,1,0),X=new THREE.Vector3(1,0,0),Y=new THREE.Vector3(0,1,0),Z=new THREE.Vector3(0,0,1);
function createOvercastSky(game){
 const canvas=document.createElement('canvas');
 canvas.width=1024;canvas.height=512;
 const ctx=canvas.getContext('2d');
 const background=ctx.createLinearGradient(0,0,0,512);
 background.addColorStop(0,'#516579');
 background.addColorStop(.38,'#8997a1');
 background.addColorStop(.71,'#a5aba9');
 background.addColorStop(1,'#a8a58f');
 ctx.fillStyle=background;ctx.fillRect(0,0,1024,512);
 // Low-contrast cloud banks instead of a flat, closed green roof.
 let seed=8416;
 const rand=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
 for(let layer=0;layer<3;layer++)for(let i=0;i<54;i++){
  const x=rand()*1120-48,y=105+layer*55+rand()*135;
  const w=60+rand()*240,h=10+rand()*35;
  const alpha=layer===0?.055:layer===1?.063:.047;
  const grad=ctx.createRadialGradient(x,y,2,x,y,w*.7);
  grad.addColorStop(0,'rgba(238,242,237,'+alpha+')');
  grad.addColorStop(1,'rgba(40,60,66,0)');
  ctx.fillStyle=grad;
  ctx.save();ctx.translate(x,y);ctx.scale(1,h/(w*.7));ctx.translate(-x,-y);
  ctx.fillRect(x-w,y-w,w*2,w*2);
  ctx.restore();
 }
 const texture=new THREE.CanvasTexture(canvas);
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.wrapS=THREE.RepeatWrapping;
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(120,36,20),
   new THREE.MeshBasicMaterial({map:texture,side:THREE.BackSide,depthWrite:false,fog:false}));
 mesh.name='CielBosnieCouvert';
 mesh.renderOrder=-200;mesh.frustumCulled=false;
 game.scene.add(mesh);
 game.scene.background=new THREE.Color('#89979b');
 return mesh;
}
function colorUniform(mesh,variation=0){
 const src=mesh.geometry.getAttribute('position');
 if(!src||src.count<5000)throw Error('Quaternius real skin geometry missing');
 const colors=new Float32Array(src.count*3);
 const skin=new THREE.Color(variation?'#b3997b':'#c49b77');
 const jacket=new THREE.Color(variation?'#64715b':'#535f4d');
 const sleeves=new THREE.Color(variation?'#69725e':'#606e53');
 const trousers=new THREE.Color(variation?'#444c3d':'#485342');
 const boots=new THREE.Color('#262926');
 for(let v=0;v<src.count;v++){
  const x=Math.abs(src.getX(v)),y=src.getY(v);
  const color=y<.17?boots:y<1.03?trousers:y<1.53&&x<.48?jacket:y<1.53&&x<.61?sleeves:skin;
  color.toArray(colors,v*3);
 }
 const geometry=mesh.geometry.clone();
 geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
 mesh.geometry=geometry;
 mesh.material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:0});
 mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;
}
function makeSoldier(template,variation=0){
 const root=cloneSkeleton(template),group=new THREE.Group();
 root.name=variation?'CompagnonQuaternius':'SoldatJoueurQuaternius';
 group.add(root);group.scale.setScalar(variation?.86:.91);
 let body=null,head=null;
 const bones={},rest={};
 root.traverse(obj=>{
  if(obj.isBone){bones[obj.name]=obj;rest[obj.name]=obj.quaternion.clone();}
  if(obj.isSkinnedMesh&&obj.geometry.getAttribute('position')?.count>5000){
   colorUniform(obj,variation);body=obj;
  }else if(obj.name==='Eyes'&&obj.isMesh){
   obj.material=new THREE.MeshStandardMaterial({color:0xf2e7d8,roughness:.5});
  }else if(obj.name==='Eyebrows'&&obj.isMesh){
   obj.material=new THREE.MeshStandardMaterial({color:0x514535,roughness:.95});
  }
 });
 head=bones.Head;
 if(!body||!head||Object.keys(bones).length<60)throw Error('Complete humanoid body or 65-bone rig missing');
 // Simple historically restrained helmet follows the imported head bone.
 root.updateMatrixWorld(true);
 const pos=root.localToWorld(new THREE.Vector3(0,1.73,-.018));
 const helmet=new THREE.Group();helmet.name='Casque';
 helmet.position.copy(head.worldToLocal(pos));
 head.add(helmet);
 const olive=variation?0x636f54:0x59674d;
 const cap=new THREE.Mesh(new THREE.SphereGeometry(.122,18,10,0,Math.PI*2,0,Math.PI*.61),
       new THREE.MeshStandardMaterial({color:olive,roughness:.94}));
 cap.position.y=.012;cap.scale.set(1.06,.78,1.07);
 cap.castShadow=true;helmet.add(cap);
 const brim=new THREE.Mesh(new THREE.TorusGeometry(.114,.008,5,25,Math.PI),
       new THREE.MeshStandardMaterial({color:0x343d33,roughness:.96}));
 brim.position.set(0,-.018,.002);brim.rotation.x=Math.PI/2;
 helmet.add(brim);
 const avatar={root,group,bones,rest,height:variation?.86:.91};
 return avatar;
}
function worldBend(avatar,name,rootAxis,angle){
 const bone=avatar.bones[name];
 if(!bone?.parent||!angle)return;
 bone.parent.updateMatrixWorld(true);
 const axis=rootAxis.clone().applyQuaternion(avatar.group.getWorldQuaternion(new THREE.Quaternion()));
 const parentQ=bone.parent.getWorldQuaternion(new THREE.Quaternion());
 axis.applyQuaternion(parentQ.invert()).normalize();
 bone.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis,angle));
 bone.updateMatrixWorld(true);
}
function poseHuman(avatar,info,clock,mode='player'){
 const {group,bones,rest}=avatar;
 for(const [name,q] of Object.entries(rest))bones[name].quaternion.copy(q);
 const sprint=info.running;
 const stride=sprint?Math.sin(clock*11+(mode==='companion'?1:0)):.05*Math.sin(clock*2);
 group.position.set(info.x,info.y??0,info.z??.45);
 group.rotation.set(0,mode==='companion'?Math.PI/2:info.facing??Math.PI/2,0);
 group.position.y+=(sprint?Math.abs(stride)*.029:0);
 group.updateMatrixWorld(true);
 worldBend(avatar,'upperarm_l',Z,-1.24+.22*stride);
 worldBend(avatar,'upperarm_r',Z,1.24-.22*stride);
 worldBend(avatar,'upperarm_l',X,-.14+.19*stride);
 worldBend(avatar,'upperarm_r',X,-.14-.19*stride);
 worldBend(avatar,'lowerarm_l',X,-.29);
 worldBend(avatar,'lowerarm_r',X,-.29);
 worldBend(avatar,'thigh_l',X,.40*stride);
 worldBend(avatar,'thigh_r',X,-.40*stride);
 worldBend(avatar,'calf_l',X,.30*Math.max(0,-stride));
 worldBend(avatar,'calf_r',X,.30*Math.max(0,stride));
 worldBend(avatar,'spine_02',X,sprint?.08:-.02);
 worldBend(avatar,'Head',Z,.024*Math.sin(clock*1.3));
 if(mode==='player'&&info.crouched){
  group.position.y-=.19;
  worldBend(avatar,'thigh_l',X,-.42);
  worldBend(avatar,'thigh_r',X,-.42);
  worldBend(avatar,'calf_l',X,.55);
  worldBend(avatar,'calf_r',X,.55);
 }
 group.updateMatrixWorld(true);
}
function attach(game){
 const state=createCompanionState();
 let hero=null,ally=null,oldAlly=null;
 const originalDraw=game.draw.bind(game);
 const originalAnimate=game.animateSoldier.bind(game);
 game.canvas.dataset.bosnieCompanion='chargement';
 game.canvas.dataset.bosnieSky='ancien';
 const software=!!game.renderer.isSoftware;
 const sky=software?null:createOvercastSky(game);
 if(sky)game.canvas.dataset.bosnieSky='nuages-3d';
 // Even if WebGL is missing, the second soldier is visible in the simpler mode.
 oldAlly=game.buildSoldier();
 oldAlly.group.name='CompagnonSecours';
 game.scene.add(oldAlly.group);
 const controls=game;
 game.animateSoldier=function(run,dt){
  originalAnimate(run,dt);
  if(hero)game.soldier.group.visible=false;
 };
 game.draw=function(run,dt){
  const current=updateCompanion(state,run);
  const t=Number.isFinite(run.time)?run.time:0;
  const running=run.move!==0&&run.phase==='playing';
  const direction=run.move<0?-Math.PI/2:Math.PI/2;
  if(sky)sky.position.copy(game.camera.position);
  if(hero){
   poseHuman(hero,{x:run.x,y:run.phase==='hit'?-.06:0,z:.45,
     facing:direction,crouched:run.crouched,running},t);
   hero.group.visible=!run.binoculars;
  }
  if(ally){
   poseHuman(ally,current,t,'companion');
   ally.group.visible=current.visible;
  }else{
   oldAlly.group.visible=current.visible;
   oldAlly.group.position.set(current.x,0,current.z);
   oldAlly.group.rotation.y=Math.PI/2;
   oldAlly.body.position.y=current.running?.81:.52;
  }
  const snap={stage:current.stage,companionX:current.x,playerX:run.x,
    playerAhead:current.playerAhead,invulnerable:current.invulnerable,
    running:current.running,modelLoaded:!!hero,sky:!!sky};
  window.__bosnieCompanionState=snap; // Read-only diagnostic for screenshot tests.
  return originalDraw(run,dt);
 };
 if(software){
  game.canvas.dataset.bosnieCompanion='secours-3d';
  return;
 }
 new GLTFLoader().loadAsync('danse-quaternius-hero.glb').then(gltf=>{
  const nextHero=makeSoldier(gltf.scene,0),nextAlly=makeSoldier(gltf.scene,1);
  game.scene.add(nextHero.group,nextAlly.group);
  hero=nextHero;ally=nextAlly;
  oldAlly.group.visible=false;
  game.scene.remove(oldAlly.group);
  game.canvas.dataset.bosnieCompanion='quaternius-deux-soldats';
 }).catch(err=>{
  console.warn('Modèle militaire CC0 indisponible ; les deux soldats de secours restent jouables.',err);
  game.canvas.dataset.bosnieCompanion='secours-3d';
 });
}
if(typeof window!=='undefined'){
 window.BosnieAddon=game=>{
  try{attach(game);}
  catch(err){console.warn('Améliorations Bosnie désactivées, jeu original conservé.',err);}
 };
}
