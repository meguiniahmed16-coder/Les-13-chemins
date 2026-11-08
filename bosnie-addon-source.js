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
 background.addColorStop(0,'#627b8e');
 background.addColorStop(.38,'#9faeb5');
 background.addColorStop(.71,'#bac0bd');
 background.addColorStop(1,'#bbb8aa');
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
 game.scene.background=new THREE.Color('#a3b1b4');
 return mesh;
}
// French camouflage field uniform (OTAN, post-UN mandate) rather than solid
// civilian-looking purple/green clothes. The source mesh is fully skinned.

function improveBosnianDaylight(game){
 // Keep the period atmosphere while lifting the former very dark green grade.
 game.renderer.toneMappingExposure=1.37;
 game.scene.fog.color.set('#a9b1aa');
 game.scene.fog.density=.014;
 const material=game.postMaterial;
 if(material?.fragmentShader){
  const original=material.fragmentShader;
  material.fragmentShader=original
   .replace('l=pow(clamp(l*1.28,0.,1.),.82)',
            'l=pow(clamp(l*1.42,0.,1.),.79)')
   .replace('vec3 dark=vec3(.025,.075,.045),mid=vec3(.26,.43,.19),light=vec3(.82,.94,.56)',
            'vec3 dark=vec3(.09,.13,.115),mid=vec3(.38,.45,.37),light=vec3(.87,.91,.79)');
  material.needsUpdate=material.fragmentShader!==original;
 }
 game.canvas.dataset.bosnieDaylight='plus-clair';
}
function createWarDamage(game){
 // Decals and jagged fragments are cosmetic only. Collision geometry stays put.
 const stone=new THREE.MeshStandardMaterial({color:0x93998f,roughness:1,side:THREE.DoubleSide});
 const broken=new THREE.MeshStandardMaterial({color:0x666e68,roughness:1,side:THREE.DoubleSide});
 const soot=new THREE.MeshBasicMaterial({color:0x343a35,roughness:1,side:THREE.DoubleSide});
 const randomSeed=()=>{let seed=18419;return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};};
 const rnd=randomSeed();
 const group=new THREE.Group();group.name='FacadeGuerreRuines';
 let fractures=0;
 // Jagged broken openings, crumbly plaster and exposed steel on the roadside.
 for(let house=0;house<12;house++){
  const cx=-10+house*9.1;
  const top=(3+house%3)*2.9;
  for(let story=0;story<2;story++){
   const wx=cx+(story===0?-1.85:1.55),y=story===0?4.0:6.8;
   const hole=new THREE.Shape();
   hole.moveTo(-.51,-.61);hole.lineTo(-.62,-.29);hole.lineTo(-.53,.20);
   hole.lineTo(-.36,.52);hole.lineTo(-.06,.42);hole.lineTo(.14,.61);
   hole.lineTo(.51,.35);hole.lineTo(.58,-.09);hole.lineTo(.35,-.53);
   hole.lineTo(-.09,-.61);hole.closePath();
   const shadow=new THREE.Mesh(new THREE.ShapeGeometry(hole),soot);
   shadow.position.set(wx,y,-15.75);group.add(shadow);fractures++;
   // Broken uneven masonry rim, not a regular black square.
   for(const [dx,dy,ang] of [[-.51,.35,-.25],[.41,.47,.3],[-.29,-.53,.6],[.54,-.24,-.3]]){
    const chip=new THREE.Mesh(new THREE.TetrahedronGeometry(.17+rnd()*.11,0),stone);
    chip.position.set(wx+dx,y+dy,-15.65);
    chip.rotation.set(rnd(),rnd(),ang);group.add(chip);
   }
   const rebar=new THREE.Mesh(new THREE.CylinderGeometry(.012,.014,.34,5),
     new THREE.MeshStandardMaterial({color:0x4b524e,metalness:.45,roughness:.75}));
   rebar.position.set(wx-.48,y+.51,-15.53);rebar.rotation.z=-.35;
   group.add(rebar);
  }
  // Roofing is largely absent; a few broken edges and exposed bars survive.
  for(let j=0;j<3;j++){
   const debris=new THREE.Mesh(new THREE.TetrahedronGeometry(.22+rnd()*.20),broken);
   debris.position.set(cx+(j-1)*1.8,top-.12-rnd()*.23,-16.25);
   debris.rotation.set(rnd()*2,rnd(),rnd()*2);group.add(debris);
  }
 }
 const impactGeo=new THREE.CircleGeometry(.029,8);
 const impactMat=new THREE.MeshBasicMaterial({color:0x373d37,side:THREE.DoubleSide,depthWrite:false});
 const impacts=new THREE.InstancedMesh(impactGeo,impactMat,155);
 const dummy=new THREE.Object3D();
 for(let i=0;i<155;i++){
  const house=i%12,x=-10+house*9.1;
  dummy.position.set(x+(rnd()-.5)*6.8,1.4+rnd()*6.2,-15.60);
  dummy.rotation.set(0,0,rnd()*Math.PI*2);
  dummy.scale.setScalar(.42+rnd()*1.6);
  dummy.updateMatrix();impacts.setMatrixAt(i,dummy.matrix);
 }
 impacts.name='ImpactsBallesFacade';group.add(impacts);
 const rockGeo=new THREE.TetrahedronGeometry(.20);
 const rocks=new THREE.InstancedMesh(rockGeo,broken,92);
 for(let i=0;i<92;i++){
  dummy.position.set(-7+rnd()*102,.12+rnd()*.12,-13.1+rnd()*3);
  dummy.rotation.set(rnd()*3,rnd()*4,rnd()*3);
  dummy.scale.set(.35+rnd()*1.8,.38+rnd(),.43+rnd()*1.7);
  dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);
 }
 rocks.name='GravatsDeRue';group.add(rocks);
 game.scene.add(group);
 return {group,fractures,impacts:155,rocks:92};
}
function makeWindowShooter(game){
 // Only a distant figure in the window; no additional shooting mechanics.
 const shooter=new THREE.Group();shooter.name='TireurFenetreJumelles';
 const uniform=new THREE.MeshStandardMaterial({color:0x748071,roughness:.94,emissive:0x202821,emissiveIntensity:.24});
 const helmetMat=new THREE.MeshStandardMaterial({color:0x4c564b,roughness:.95});
 const skin=new THREE.MeshStandardMaterial({color:0xc2ac91,roughness:.96});
 const steel=new THREE.MeshStandardMaterial({color:0x292f30,roughness:.7,metalness:.14});
 const torso=new THREE.Mesh(new RoundedBoxGeometry(.44,.62,.27,3,.08),uniform);
 torso.position.set(0,-.17,0);torso.name='TorseTireur';shooter.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.131,12,9),skin);
 head.position.set(0,.235,.03);head.name='TeteTireur';shooter.add(head);
 const helmet=new THREE.Mesh(new THREE.SphereGeometry(.159,14,8,0,Math.PI*2,0,Math.PI*.58),helmetMat);
 helmet.position.set(0,.307,.022);helmet.name='CasqueTireur';shooter.add(helmet);
 for(const side of [-1,1]){
  const arm=new THREE.Mesh(new THREE.CylinderGeometry(.065,.055,.39,8),uniform);
  arm.position.set(side*.235,-.11,.055);
  arm.rotation.z=side*.37;
  shooter.add(arm);
 }
 // A visible rifle outline across the window: purely narrative silhouette.
 const rifle=new THREE.Group();rifle.name='ArmeVisibleTireur';
 const receiver=new THREE.Mesh(new THREE.BoxGeometry(.52,.072,.076),steel);
 receiver.position.y=-.09;rifle.add(receiver);
 const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.017,.02,.43,7),steel);
 barrel.rotation.z=Math.PI/2;barrel.position.set(.43,-.09,.012);rifle.add(barrel);
 const stock=new THREE.Mesh(new THREE.BoxGeometry(.16,.11,.052),steel);
 stock.position.set(-.32,-.12,0);rifle.add(stock);
 rifle.position.set(0,-.04,.17);shooter.add(rifle);
 shooter.visible=false;game.scene.add(shooter);
 // Recesses are anchored to the actual five windows already used by the firing code.
 const recessMaterial=new THREE.MeshBasicMaterial({color:0x202722,side:THREE.DoubleSide});
 for(const [i,windowPos]of game.shooters.entries()){
  const recess=new THREE.Mesh(new THREE.PlaneGeometry(1.17,1.18),recessMaterial);
  recess.name='FenetreEventreeTireur'+(i+1);
  recess.position.set(windowPos.x,windowPos.y-.04,-15.47);
  game.scene.add(recess);
  const frameMat=new THREE.MeshStandardMaterial({color:0x83897e,roughness:1});
  for(const [x,y,w,h]of [[-.65,0,.10,1.28],[.64,0,.10,1.17],[0,.63,1.33,.10]]){
   const edge=new THREE.Mesh(new THREE.BoxGeometry(w,h,.14),frameMat);
   edge.position.set(windowPos.x+x,windowPos.y+y,-15.34);game.scene.add(edge);
  }
 }
 return shooter;
}

function upgradeWindowShooter(enemy,template,renderer){
 // Reuse EXACTLY the same Quaternius 65-bone body as both existing soldiers.
 // The little sphere/cylinder silhouette stays only as a loading fallback.
 const avatar=makeSoldier(template,1);
 avatar.root.name='TireurFenetreQuaternius';
 avatar.group.name='Corps3DTireur';
 avatar.group.scale.setScalar(.77);
 // No French or NATO insignia on the shooter on the opposing side.
 for(const name of ['EcussonOTAN','DrapeauFrance','FusilEnBandouliere']){
  const item=avatar.root.getObjectByName(name);
  if(item)item.visible=false;
 }
 const outerHelmet=avatar.root.getObjectByName('CouvreCasqueCamouflage');
 if(outerHelmet?.material?.color)outerHelmet.material.color.setHex(0x495246);
 // The body is continuous and rigged. Clip the feet/legs BELOW the broken
 // window ledge, rather than making them pass through the masonry.
 const clipping=new THREE.Plane(new THREE.Vector3(0,1,0),0);
 avatar.root.traverse(obj=>{
  if(!obj.isMesh&&!obj.isSkinnedMesh)return;
  const materials=Array.isArray(obj.material)?obj.material:[obj.material];
  const variants=materials.map(material=>{
   const mat=material.clone();
   mat.clippingPlanes=[clipping];mat.clipIntersection=false;
   return mat;
  });
  obj.material=Array.isArray(obj.material)?variants:variants[0];
  obj.frustumCulled=false;
 });
 renderer.localClippingEnabled=true;
 let skinnedBody=0;
 avatar.root.traverse(obj=>{
  if(obj.isSkinnedMesh&&obj.geometry?.getAttribute('position')?.count>5000)skinnedBody++;
 });
 if(skinnedBody<1)throw Error('Le véritable corps skinné du tireur est introuvable');
 const previous=enemy.children.slice();
 enemy.add(avatar.group);
 // The old rifle across the opening remains visible; everything else
 // simplified is hidden after the complete skinned avatar is ready.
 for(const object of previous)object.visible=object.name==='ArmeVisibleTireur';
 enemy.userData.windowRig=avatar;
 enemy.userData.windowSkinned=skinnedBody;
 enemy.userData.windowClip=clipping;
 enemy.userData.oldShooterHidden=previous
   .filter(o=>o.name!=='ArmeVisibleTireur').every(o=>!o.visible);
 return avatar;
}
function positionWindowShooter(game,enemy,run){
 const index=Math.max(0,Math.min(game.shooters.length-1,run.passed?.length??0));
 const windowPos=game.shooters[index];
 enemy.position.set(windowPos.x,windowPos.y-.02,-15.22);
 enemy.rotation.y=0;
 enemy.visible=!!run.binoculars&&run.phase==='playing';
 if(enemy.visible)enemy.position.y+=Math.sin((run.time||0)*1.2)*.012;
 if(enemy.userData.windowRig){
  const cameraY=enemy.position.y;
  enemy.userData.windowClip.constant=-(windowPos.y-.51);
  if(enemy.visible)poseHuman(enemy.userData.windowRig,{
   x:0,y:-1.04,z:0,facing:0,crouched:false,running:false
  },run.time||0,'shooter');
 }
 return {index:index+1,visible:enemy.visible,
         rig:!!enemy.userData.windowRig};
}

function fieldCamouflage(x,y,z,variation){
 const wav=Math.sin(x*32+y*15+z*23)*.46
  +Math.cos(x*19-y*27+z*17)*.35
  +Math.sin(x*42+y*35-z*21)*.19;
 const swatches=variation?
  ['#303b2e','#4f6046','#807e65','#74644e']:
  ['#313b2f','#536449','#8e896f','#655c47'];
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
 const gunMetal=new THREE.MeshStandardMaterial({color:0x444b46,roughness:.77,metalness:.14});
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
 part(vest,'GiletPareBallesAvant',.405,.45,.245,0,.022,.036,olive,.062);
 part(vest,'PlaqueProtectionPoitrine',.325,.285,.04,0,.090,.166,edging,.034);
 part(vest,'CeinturonMilitaire',.42,.069,.29,0,-.219,.008,leather,.017);
 part(vest,'BoucleCeinture',.07,.05,.012,0,-.225,.172,pouchMat,.006);
 for(const side of [-1,1]){
  const strap=part(vest,'BretelleProtection',.053,.36,.029,side*.145,.098,.164,pouchMat,.009);
  strap.rotation.z=-side*.09;
  part(vest,'PocheLateral',.074,.125,.087,side*.211,-.118,.006,olive,.019);
 }
 for(let i=0;i<3;i++){
  const pouch=part(vest,'PorteChargeur',.087,.11,.057,(i-1)*.114,-.116,.173,pouchMat,.014);
  part(vest,'PattePoche',.067,.022,.006,(i-1)*.114,-.077,.204,edging,.003);
 }
 // Pack gives a combat silhouette, not the thin profile of the base dancer.
 const pack=new THREE.Group();pack.name='SacPatrouille';pin(pack,bones.spine_02,0,1.25,-.17);
 part(pack,'SacADos',.29,.34,.18,0,-.012,-.052,olive,.055);
 part(pack,'RouleauSuperieur',.26,.086,.19,0,.194,-.038,pouchMat,.032);
 part(pack,'SangleDos',.029,.36,.02,-.103,-.015,.045,edging,.008);
 part(pack,'SangleDos',.029,.36,.02,.103,-.015,.045,edging,.008);
 // A small slung rifle is scenery-only, never an interactive weapon.
 const rifle=new THREE.Group();rifle.name='FusilEnBandouliere';
 pin(rifle,bones.spine_03,-.025,1.25,.31);
 rifle.rotation.z=.40;
 part(rifle,'ArmeSilhouette',.077,.56,.067,0,.042,0,gunMetal,.012);
 part(rifle,'CanonVisible',.031,.29,.032,0,.45,.008,gunMetal,.006);
 part(rifle,'CrosseFusil',.125,.20,.072,-.012,-.235,.002,leather,.018);
 part(rifle,'GardeMainFusil',.104,.20,.074,0,.16,.007,edging,.013);
 part(rifle,'PoigneeTransport',.13,.032,.04,-.013,.123,.016,leather,.008);
 part(rifle,'BoitierArme',.105,.14,.07,.022,-.118,.013,leather,.014);
 part(rifle,'SangleArme',.024,.58,.025,.075,-.03,-.025,edging,.008);
 // The shoulder NATO insignia belongs to the sleeve, not the face.
 for(const side of [-1,1]){
  const shoulder=new THREE.Group();
  pin(shoulder,bones.spine_03,
      side*.248,1.425,.015);
  part(shoulder,'RenfortEpaule',.127,.135,.164,0,0,0,olive,.038);
  const badge=document.createElement('canvas');
  badge.width=256;badge.height=128;
  const ctx=badge.getContext('2d');
  if(side<0){ctx.fillStyle='#29425c';ctx.fillRect(0,0,256,128);}
  else{
   ctx.fillStyle='#204a85';ctx.fillRect(0,0,86,128);
   ctx.fillStyle='#f3f4ef';ctx.fillRect(86,0,85,128);
   ctx.fillStyle='#a74d4b';ctx.fillRect(171,0,85,128);
  }
  ctx.lineWidth=12;ctx.strokeStyle='#d6e2de';ctx.strokeRect(8,8,240,112);
  ctx.font='bold 66px Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  if(side<0){ctx.fillStyle='#f5f6ed';ctx.fillText('OTAN',128,68);}
  const texture=new THREE.CanvasTexture(badge);texture.colorSpace=THREE.SRGBColorSpace;
  const patch=new THREE.Mesh(new THREE.PlaneGeometry(.105,.056),
       new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
  patch.position.set(0,.012,.085);patch.name=side<0?'EcussonOTAN':'DrapeauFrance';
  shoulder.add(patch);
 }
 for(const side of [-1,1]){
  const thigh=new THREE.Group();
  pin(thigh,bones[side<0?'thigh_l':'thigh_r'],side*.17,.72,.05);
  part(thigh,'PocheCargo',.095,.12,.054,0,0,.052,olive,.025);
  const ankle=new THREE.Group();pin(ankle,bones[side<0?'calf_l':'calf_r'],side*.145,.115,.028);
  part(ankle,'Rangers',.104,.120,.166,0,-.006,.050,leather,.026);
 }
 const helmet=new THREE.Group();helmet.name='CasqueLourdCouvreCasqueCamouflage';
 pin(helmet,bones.Head,0,1.782,-.014);
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
export function makeSoldier(template,variation=0){
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
export function poseHuman(avatar,info,clock,mode='player'){
 const {group,bones,rest}=avatar;
 for(const [name,q] of Object.entries(rest))bones[name].quaternion.copy(q);
 const sprint=info.running;
 const stride=sprint?Math.sin(clock*11+(mode==='companion'?1:0)):.05*Math.sin(clock*2);
 group.position.set(info.x,info.y??0,info.z??.45);
 group.rotation.set(0,info.facing??Math.PI/2,0);
 group.position.y+=(sprint?Math.abs(stride)*.029:0);
 group.updateMatrixWorld(true);
 // The stationary shooter faces forward, while the running soldiers
 // face along the avenue. These orientations need opposite shoulder signs.
 const guarding=mode==='shooter';
 worldBend(avatar,'upperarm_l',Z,guarding?1.24:-1.24+.22*stride);
 worldBend(avatar,'upperarm_r',Z,guarding?-1.24:1.24-.22*stride);
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
 const maskLabel=document.querySelector('#binocularMask span');
 if(maskLabel)maskLabel.textContent='TIREUR REPÉRÉ À LA FENÊTRE';
 let hero=null,ally=null,oldAlly=null;
 const originalDraw=game.draw.bind(game);
 const originalAnimate=game.animateSoldier.bind(game);
 game.canvas.dataset.bosnieCompanion='chargement';
 game.canvas.dataset.bosnieSky='ancien';
 const software=!!game.renderer.isSoftware;
 const sky=software?null:createOvercastSky(game);
 if(sky)game.canvas.dataset.bosnieSky='nuages-3d';
 if(!software)improveBosnianDaylight(game);
 const cityDetails=software?null:createWarDamage(game);
 const windowShooter=software?null:makeWindowShooter(game);
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
  const shooterState=windowShooter?positionWindowShooter(game,windowShooter,run):{index:0,visible:false};
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
    natoBadge:!!hero?.root.getObjectByName('EcussonOTAN'),
    armedHero:!!hero?.root.getObjectByName('CanonVisible'),
    armedAlly:!!ally?.root.getObjectByName('CanonVisible'),
    daylight:game.canvas.dataset.bosnieDaylight==='plus-clair',
    damagedFacades:cityDetails?.fractures??0,
    visibleWindowShooter:shooterState.visible,
    shooterWindowIndex:shooterState.index,
    shooterReal:!!windowShooter?.userData.windowRig,
    shooterRigBones:Object.keys(windowShooter?.userData.windowRig?.bones||{}).length,
    shooterSkinned:(windowShooter?.userData.windowSkinned??0)>0,
    shooterOriginalHidden:!!windowShooter?.userData.oldShooterHidden,
    shooterElbowDrop:(()=>{
      const rig=windowShooter?.userData.windowRig;
      if(!rig)return [];
      const read=name=>rig.bones[name].getWorldPosition(new THREE.Vector3()).y;
      return [read('upperarm_l')-read('lowerarm_l'),
              read('upperarm_r')-read('lowerarm_r')];
    })()};
  window.__bosnieCompanionState=snap; // Read-only diagnostic for screenshot tests.
  const result=originalDraw(run,dt);
  if(windowShooter?.visible){
   const p=windowShooter.getWorldPosition(new THREE.Vector3()).project(game.camera);
   snap.shooterInFrame=Math.abs(p.x)<.9&&Math.abs(p.y)<.9&&p.z<1;
   snap.shooterProjection={x:p.x,y:p.y,z:p.z};
  }
  return result;
 };
 if(software){
  game.canvas.dataset.bosnieCompanion='secours-3d';
  return;
 }
 new GLTFLoader().loadAsync('danse-quaternius-hero.glb').then(gltf=>{
  const nextHero=makeSoldier(gltf.scene,0),nextAlly=makeSoldier(gltf.scene,1);
  game.scene.add(nextHero.group,nextAlly.group);
  if(windowShooter){
   try{upgradeWindowShooter(windowShooter,gltf.scene,game.renderer);}
   catch(err){console.warn('Tireur humain indisponible, ancienne silhouette conservée.',err);}
  }
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
