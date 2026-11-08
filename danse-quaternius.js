// Prototype volontairement limité au danseur central.
// Modèle "Superhero Male" de Quaternius, Universal Base Characters (CC0).
// Le rig 65 os et la peau sont conservés, au lieu des cylindres de la démo.
import * as T from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { BEAT } from './danse-core.js';

export const QUATERNIUS_FILE='danse-quaternius-hero.glb';
export const QUATERNIUS_BONES=Object.freeze([
 'pelvis','spine_01','spine_02','spine_03','neck_01','Head',
 'upperarm_l','lowerarm_l','upperarm_r','lowerarm_r',
 'thigh_l','calf_l','thigh_r','calf_r'
]);

function addSmile(avatar, head) {
 // Sourire en léger relief accroché à l'OS DE LA TÊTE : il suit la danse.
 // Le personnage original ne possède aucune forme de bouche animable.
 avatar.updateMatrixWorld(true);
 // Source geometry measured at the lips: y≈1.61, forward surface z≈0.091.
 const at=avatar.localToWorld(new T.Vector3(0,1.611,.094));
 const front=avatar.getWorldQuaternion(new T.Quaternion());
 const headWorld=head.getWorldQuaternion(new T.Quaternion());
 const smile=new T.Group();
 smile.name='SourireQuaternius';
 smile.position.copy(head.worldToLocal(at));
 smile.quaternion.copy(headWorld.invert().multiply(front));
 // Soft, curved, readable smile, positioned ON the face not floating away.
 const curve=new T.Shape();
 curve.moveTo(-.036,.012);
 curve.quadraticCurveTo(0,-.012,.036,.012);
 curve.quadraticCurveTo(0,-.005,-.036,.012);
 const lips=new T.Mesh(
  new T.ShapeGeometry(curve,10),
  new T.MeshBasicMaterial({color:0x794c43,side:T.DoubleSide,depthWrite:false})
 );
 lips.position.z=.002;
 lips.name='SourireVisible';
 smile.add(lips);
 const light=new T.Mesh(
  new T.TubeGeometry(new T.CatmullRomCurve3([
   new T.Vector3(-.020,-.004,.0045),new T.Vector3(0,-.005,.0045),
   new T.Vector3(.020,-.004,.0045)
   ]),12,.0012,5,false),
  new T.MeshBasicMaterial({color:0xe7b69b,transparent:true,opacity:.48,depthWrite:false})
 );
 smile.add(light);
 head.add(smile);
 return smile;
}

// The CC0 artist model uses a monochrome jade shader. Preserve the real
// skinned body but give it lightweight, zero-texture skin and clothing colours.
function dressOriginalSkin(body){
 body.geometry=body.geometry.clone();
 const pos=body.geometry.getAttribute('position'),rgb=new Float32Array(pos.count*3);
 const skin=new T.Color('#ca9272'),shirt=new T.Color('#655389');
 const pants=new T.Color('#374052'),shoes=new T.Color('#d8c7b5'),col=new T.Color();
 for(let i=0;i<pos.count;i++){
  const x=Math.abs(pos.getX(i)),y=pos.getY(i);
  if(y<.155)col.copy(shoes);
  else if(y<1.00&&x<.35)col.copy(pants);
  else if(y>=1.03&&y<1.52&&x<.52)col.copy(shirt);
  else col.copy(skin);
  const highlight=1+Math.sin(i*17.1)*.015;
  rgb[3*i]=Math.min(1,col.r*highlight);
  rgb[3*i+1]=Math.min(1,col.g*highlight);
  rgb[3*i+2]=Math.min(1,col.b*highlight);
 }
 body.geometry.setAttribute('color',new T.BufferAttribute(rgb,3));
 body.material=new T.MeshStandardMaterial({vertexColors:true,metalness:0,roughness:.83});
 body.userData.avatarColored=true;
}

function attachFacialDetails(avatar,head){
 avatar.updateMatrixWorld(true);
 const headQuat=head.getWorldQuaternion(new T.Quaternion());
 const avatarQuat=avatar.getWorldQuaternion(new T.Quaternion());
 const normal=headQuat.clone().invert().multiply(avatarQuat);
 const place=(mesh,x,y,z)=>{
  const original=avatar.localToWorld(new T.Vector3(x,y,z));
  mesh.position.copy(head.worldToLocal(original));
  mesh.quaternion.copy(normal);
  head.add(mesh);return mesh;
 };
 const irisMaterial=new T.MeshStandardMaterial({color:0x584235,roughness:.4});
 const glintMaterial=new T.MeshBasicMaterial({color:0xffffff});
 for(const side of [-1,1]){
  const iris=new T.Mesh(new T.SphereGeometry(.0066,12,8),irisMaterial);
  place(iris,side*.040,1.699,.091);iris.name='Iris';
  const glint=new T.Mesh(new T.SphereGeometry(.0016,8,6),glintMaterial);
  place(glint,side*.040-.0018,1.701,.097);
 }
 // A short textured-looking sculpted hair cap, attached to the head bone.
 const hair=new T.Mesh(
  new T.SphereGeometry(1,28,12,0,Math.PI*2,0,1.20),
  new T.MeshStandardMaterial({color:0x302a28,roughness:.93,side:T.DoubleSide})
 );
 place(hair,0,1.723,-.010);
 hair.scale.set(.109,.128,.108);
 hair.name='Cheveux';
}

export async function loadQuaterniusDancer(scene, originalPosition) {
 const gltf=await new GLTFLoader().loadAsync(QUATERNIUS_FILE);
 const avatar=cloneSkeleton(gltf.scene);
 avatar.name='DanseurCentralQuaternius';
 avatar.userData.provenance='Quaternius Universal Base Characters CC0';
 avatar.position.copy(originalPosition);
 avatar.scale.setScalar(1.28); // 1,81m dans la source -> silhouette comparable au danseur actuel
 const bones={};
 for(const name of QUATERNIUS_BONES){
  const node=avatar.getObjectByName(name);
  if(!node?.isBone)throw new Error('Os Quaternius absent : '+name);
  bones[name]=node;
 }
 let triangles=0,skinned=0;
 avatar.traverse(obj=>{
  if(!obj.isMesh)return;
  obj.castShadow=true;obj.receiveShadow=true;
  const geo=obj.geometry;
  triangles+=geo.index?geo.index.count/3:geo.getAttribute('position').count/3;
  if(obj.isSkinnedMesh)skinned++;
  if(obj.isSkinnedMesh&&geo.getAttribute('position')?.count>5000) dressOriginalSkin(obj);
  else if(obj.name==='Eyes')obj.material=new T.MeshStandardMaterial({color:0xf0e5d8,roughness:.6});
  else if(obj.name==='Eyebrows')obj.material=new T.MeshStandardMaterial({color:0x624838,roughness:.9});
 });
 if(skinned<1||triangles<3000||triangles>35000)throw new Error('Modèle Quaternius non optimisé ou désarticulé');
 scene.add(avatar);
 avatar.updateMatrixWorld(true);
 const smile=addSmile(avatar,bones.Head);
 attachFacialDetails(avatar,bones.Head);
 const rest=Object.fromEntries(Object.entries(bones).map(([name,bone])=>[name,bone.quaternion.clone()]));
 return {root:avatar,bones,rest,smile,basePosition:originalPosition.clone(),triangles};
}

const X=new T.Vector3(1,0,0),Y=new T.Vector3(0,1,0),Z=new T.Vector3(0,0,1);
function worldBend(bone,worldAxis,angle){
 if(!angle||!bone.parent)return;
 bone.parent.updateMatrixWorld(true);
 const parentQ=bone.parent.getWorldQuaternion(new T.Quaternion());
 const localAxis=worldAxis.clone().applyQuaternion(parentQ.invert()).normalize();
 bone.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(localAxis,angle));
 bone.updateMatrixWorld(true);
}

export function poseQuaterniusDancer(avatar,t,action='cross',power=1,won=false,heroPosition=null,heroYaw=0){
 const {root,bones,rest,smile,basePosition}=avatar;
 // Chaque trame repart de la pose native : aucun angle ne s'accumule.
 for(const [name,q]of Object.entries(rest))bones[name].quaternion.copy(q);
 const beat=t/BEAT*Math.PI*2,s=Math.sin(beat),half=Math.sin(beat/2);
 const strength=Math.max(.05,Math.min(1,power));
 root.position.copy(heroPosition||basePosition);
 root.position.y+=Math.abs(s)*.055*strength;
 root.rotation.set(0,heroYaw,0);
 root.updateMatrixWorld(true);
 worldBend(bones.pelvis,Y,half*.075*strength);
 worldBend(bones.spine_02,Y,-half*.12*strength);
 worldBend(bones.Head,Z,half*.055*strength);
 // Les bras, naturellement étendus dans la pose source, descendent le long
 // du corps et suivent le rythme ; on conserve la hiérarchie originale.
 const up=won?.62:action==='square'?.42:action==='circle'?.16:0;
 worldBend(bones.upperarm_l,Z,-1.02+up+Math.sin(beat+.25)*.24*strength);
 worldBend(bones.upperarm_r,Z,1.02-up-Math.sin(beat-.25)*.24*strength);
 worldBend(bones.upperarm_l,X,-.11+Math.sin(beat)*.16*strength);
 worldBend(bones.upperarm_r,X,-.11-Math.sin(beat)*.16*strength);
 worldBend(bones.lowerarm_l,X,-.19-.12*Math.max(0,s)*strength);
 worldBend(bones.lowerarm_r,X,-.19-.12*Math.max(0,-s)*strength);
 const step=(action==='left'?-1:action==='right'?1:0)*.09;
 worldBend(bones.thigh_l,X,s*.18*strength+step);
 worldBend(bones.thigh_r,X,-s*.18*strength-step);
 worldBend(bones.calf_l,X,Math.max(0,-s)*.21*strength);
 worldBend(bones.calf_r,X,Math.max(0,s)*.21*strength);
 // L'expression n'est pas un visage remplacé à chaque trame : c'est une
 // bouche solidaire de la tête qui s'ouvre subtilement au rythme.
 smile.scale.x=.92+(won?.17:.06)+.08*Math.max(0,s);
 smile.scale.y=1+(won?.18:0);
 root.updateMatrixWorld(true);
}


// Spectateurs au premier plan : on NE LEUR FAIT PAS DANSER la chorégraphie du héros.
// Même vrai squelette 3D, mais position calme, bras le long du corps et léger hochement.
export function poseQuaterniusSpectator(avatar,t,phase=0){
 const {root,bones,rest,basePosition}=avatar;
 for(const [name,q]of Object.entries(rest))bones[name].quaternion.copy(q);
 root.position.copy(basePosition);
 root.rotation.set(0,0,0);
 root.updateMatrixWorld(true);
 const nod=Math.sin(t*1.25+phase);
 worldBend(bones.spine_02,Y,.012*nod);
 worldBend(bones.Head,Z,.025*nod);
 // Partir de la pose en T et ramener les bras à la verticale, sans lever les mains.
 worldBend(bones.upperarm_l,Z,1.40-.018*nod);
 worldBend(bones.upperarm_r,Z,-1.40+.018*nod);
 worldBend(bones.upperarm_l,X,-.09);
 worldBend(bones.upperarm_r,X,-.09);
 worldBend(bones.lowerarm_l,X,-.12);
 worldBend(bones.lowerarm_r,X,-.12);
 root.updateMatrixWorld(true);
}
