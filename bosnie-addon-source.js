// Render-only enhancement for the Bosnian literary mini-game.
// CC0 male humanoid asset already present in the repository (Quaternius).
// The existing five gaps, hits, scoring, controls and soldiers' historic
// setting are untouched. The companion can never be hit.
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
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
// French camouflage field uniform (OTAN, post-UN mandate) rather than solid
// civilian-looking purple/green clothes. The source mesh is fully skinned.
function fieldCamouflage(x,y,z,variation){
 const wav=Math.sin(x*32+y*15+z*23)*.46
  +Math.cos(x*19-y*27+z*17)*.35
  +Math.sin(x*42+y*35-z*21)*.19;
 const swatches=variation?
  ['#303b2e','#526247','#8a8667','#756a51']:
  ['#313d2f','#5f6b50','#a49b79','#685e49'];
 return new THREE.Color(wav<-.38?swatches[0]:
   wav<.01?swatches[1]:wav<.38?swatches[2]:swatches[3]);
}
function colorUniform(mesh,variation=0){
 const src=mesh.geometry.getAttribute('position');
 if(!src||src.count<5000)throw Error('Quaternius real skin geometry missing');
 const colors=new Float32Array(src.count*3);
 const skin=new THREE.Color(variation?'#b3997b':'#c49b77');
 const gloves=new THREE.Color('#353c30'),boots=new THREE.Color('#272c28');
 for(let v=0;v<src.count;v++){
  const x=src.getX(v),y=src.getY(v),z=src.getZ(v);
  const ax=Math.abs(x);
  // Head stays human. Hands are dark field gloves; all sleeves and trousers
  // wear the same mottled camouflage instead of painted solid-color clothes.
  let col=y<.18?boots:
    y>1.53?skin:
    ax>.63&&y>.82?gloves:fieldCamouflage(x,y,z,variation);
  col.toArray(colors,v*3);
 }
 const geometry=mesh.geometry.clone();
 geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
 mesh.geometry=geometry;
 mesh.material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,metalness:0});
 mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;
}
function equipMilitary(avatar,variation=0){
 const {root,bones}=avatar;
 const green=variation?0x59694f:0x57624b, trim=0x374638, dark=0x303930;
 const olive=new THREE.MeshStandardMaterial({color:green,roughness:.94,metalness:0});
 const edging=new THREE.MeshStandardMaterial({color:trim,roughness:.94});
 const leather=new THREE.MeshStandardMaterial({color:dark,roughness:.96});
 const pouchMat=new THREE.MeshStandardMaterial({color:0x717459,roughness:.94});
 function part(group,name,w,h,d,x,y,z,material=olive,r=.012){
  const obj=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,r),material);
  obj.name=name;obj.position.set(x,y,z);
  obj.castShadow=true;obj.receiveShadow=true;group.add(obj);
  return obj;
 }
 function pin(group,bone,x,y,z){
  root.add(group);group.position.set(x,y,z);
  root.updateMatrixWorld(true);bone.attach(group);
  return group;
 }
 const vest=new THREE.Group();vest.name='GiletPareBalles';
 pin(vest,bones.spine_02,0,1.22,.01);
 part(vest,'GiletPareBallesAvant',.43,.49,.28,0,.015,.04,olive,.045);
 part(vest,'PlaqueProtectionPoitrine',.36,.31,.048,0,.095,.191,edging,.025);
 part(vest,'CeinturonMilitaire',.455,.075,.335,0,-.225,.008,leather,.015);
 part(vest,'BoucleCeinture',.075,.059,.012,0,-.228,.189,pouchMat,.006);
 for(const side of [-1,1]){
  const strap=part(vest,'BretelleProtection',.072,.41,.035,side*.16,.108,.185,pouchMat,.009);
  strap.rotation.z=-side*.09;
  part(vest,'PocheLateral',.092,.18,.13,side*.237,-.123,.011,olive,.02);
 }
 for(let i=0;i<3;i++){
  const pouch=part(vest,'PorteChargeur',.10,.138,.071,(i-1)*.123,-.115,.203,pouchMat,.014);
  part(vest,'PattePoche',.079,.028,.006,(i-1)*.123,-.071,.241,edging,.003);
 }
 // Pack gives a combat silhouette, not the thin profile of the base dancer.
 const pack=new THREE.Group();pack.name='SacPatrouille';pin(pack,bones.spine_02,0,1.25,-.17);
 part(pack,'SacADos',.345,.39,.24,0,-.012,-.065,olive,.045);
 part(pack,'RouleauSuperieur',.295,.115,.24,0,.235,-.045,pouchMat,.036);
 part(pack,'SangleDos',.035,.43,.02,-.115,-.015,.079,edging,.008);
 part(pack,'SangleDos',.035,.43,.02,.115,-.015,.079,edging,.008);
 // A small slung rifle is scenery-only, never an interactive weapon.
 const rifle=new THREE.Group();rifle.name='FusilEnBandouliere';
 pin(rifle,bones.spine_03,-.025,1.25,.31);
 rifle.rotation.z=.40;
 part(rifle,'ArmeSilhouette',.075,.49,.057,0,0,0,leather,.01);
 part(rifle,'PoigneeTransport',.13,.032,.04,-.013,.123,.016,leather,.008);
 part(rifle,'BoitierArme',.13,.17,.080,.025,-.135,.018,leather,.014);
 part(rifle,'SangleArme',.024,.58,.025,.075,-.03,-.025,edging,.008);
 // The shoulder NATO insignia belongs to the sleeve, not the face.
 for(const side of [-1,1]){
  const shoulder=new THREE.Group();
  pin(shoulder,bones[side<0?'upperarm_l':'upperarm_r'],
      side*.285,1.455,.014);
  part(shoulder,'RenfortEpaule',.185,.183,.22,0,0,0,olive,.035);
  const badge=document.createElement('canvas');
  badge.width=256;badge.height=128;
  const ctx=badge.getContext('2d');
  ctx.fillStyle='#29425c';ctx.fillRect(0,0,256,128);
  ctx.lineWidth=12;ctx.strokeStyle='#d6e2de';ctx.strokeRect(8,8,240,112);
  ctx.font='bold 66px Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle='#f5f6ed';ctx.fillText('OTAN',128,68);
  const texture=new THREE.CanvasTexture(badge);texture.colorSpace=THREE.SRGBColorSpace;
  const patch=new THREE.Mesh(new THREE.PlaneGeometry(.15,.076),
       new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
  patch.position.set(0,.015,.12);patch.name='EcussonOTAN';
  shoulder.add(patch);
 }
 for(const side of [-1,1]){
  const thigh=new THREE.Group();
  pin(thigh,bones[side<0?'thigh_l':'thigh_r'],side*.17,.72,.05);
  part(thigh,'PocheCargo',.13,.18,.07,0,0,.063,olive,.018);
  const ankle=new THREE.Group();pin(ankle,bones[side<0?'calf_l':'calf_r'],side*.145,.115,.028);
  part(ankle,'Rangers',.17,.20,.27,0,0,.065,leather,.025);
 }
 const helmet=new THREE.Group();helmet.name='CasqueLourdCouvreCasqueCamouflage';
 pin(helmet,bones.Head,0,1.737,-.014);
 const shellBlue=new THREE.Mesh(new THREE.SphereGeometry(.145,24,14,0,Math.PI*2,0,Math.PI*.59),
   new THREE.MeshStandardMaterial({color:0x598ca1,roughness:.92,metalness:0}));
 shellBlue.name='AncienCasqueBleuSousCouvreCasque';
 shellBlue.scale.set(1.07,.94,1.09);shellBlue.castShadow=true;helmet.add(shellBlue);
 // In the author's scene the blue UN helmet is COVERED for the NATO mandate.
 const coverGeometry=new THREE.SphereGeometry(.152,24,14,0,Math.PI*2,0,Math.PI*.60);
 const p=coverGeometry.getAttribute('position'),rgb=new Float32Array(p.count*3);
 for(let i=0;i<p.count;i++)fieldCamouflage(p.getX(i),p.getY(i)+1.7,p.getZ(i),variation).toArray(rgb,i*3);
 coverGeometry.setAttribute('color',new THREE.BufferAttribute(rgb,3));
 const cover=new THREE.Mesh(coverGeometry,new THREE.MeshStandardMaterial({
   vertexColors:true,roughness:.98,side:THREE.DoubleSide
 }));
 cover.name='CouvreCasqueCamouflage';cover.scale.set(1.06,.97,1.09);
 cover.castShadow=true;helmet.add(cover);
 const brow=part(helmet,'BordCasque',.30,.026,.17,0,-.018,.052,edging,.011);
 // Webbing straps follow the same head joint.
 for(const side of [-1,1]){
  const chin=part(helmet,'Jugulaire',.018,.15,.018,side*.105,-.075,.058,leather,.004);
  chin.rotation.z=side*.24;
 }
 avatar.userData={uniform:'treillis-camouflage-otan',helmet:helmet.name,
   vest:vest.name,patches:2,boots:2,rucksack:pack.name};
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
 const avatar={root,group,bones,rest,height:variation?.86:.91};
 equipMilitary(avatar,variation);
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
    running:current.running,modelLoaded:!!hero,sky:!!sky,
    heroUniform:hero?.userData?.uniform||'fallback',
    allyUniform:ally?.userData?.uniform||'fallback',
    armoredGear:!!hero?.root.getObjectByName('GiletPareBalles'),
    camoHelmet:!!ally?.root.getObjectByName('CouvreCasqueCamouflage'),
    natoBadge:!!hero?.root.getObjectByName('EcussonOTAN')};
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
