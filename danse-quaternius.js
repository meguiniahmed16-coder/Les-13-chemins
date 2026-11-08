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
 const at=avatar.localToWorld(new T.Vector3(0,1.609,.128));
 const front=avatar.getWorldQuaternion(new T.Quaternion());
 const headWorld=head.getWorldQuaternion(new T.Quaternion());
 const smile=new T.Group();
 smile.name='SourireQuaternius';
 smile.position.copy(head.worldToLocal(at));
 smile.quaternion.copy(headWorld.invert().multiply(front));
 const curve=new T.CatmullRomCurve3([
  new T.Vector3(-.044,.007,.001),new T.Vector3(-.025,-.004,.003),
  new T.Vector3(0,-.011,.005),new T.Vector3(.025,-.004,.003),
  new T.Vector3(.044,.007,.001)
 ]);
 const lips=new T.Mesh(
  new T.TubeGeometry(curve,20,.0035,6,false),
  new T.MeshBasicMaterial({color:0x704037,depthWrite:false})
 );
 lips.name='SourireVisible';
 smile.add(lips);
 const light=new T.Mesh(
  new T.TubeGeometry(new T.CatmullRomCurve3([
   new T.Vector3(-.021,-.013,.0055),new T.Vector3(0,-.015,.006),
   new T.Vector3(.021,-.013,.0055)
  ]),12,.0012,5,false),
  new T.MeshBasicMaterial({color:0xf6cfac,transparent:true,opacity:.70,depthWrite:false})
 );
 smile.add(light);
 head.add(smile);
 return smile;
}

export async function loadQuaterniusDancer(scene, originalPosition) {
 const gltf=await new GLTFLoader().loadAsync(QUATERNIUS_FILE);
 const avatar=cloneSkeleton(gltf.scene);
 avatar.name='DanseurCentralQuaternius';
 avatar.userData.provenance='Quaternius Universal Base Characters CC0';
 avatar.position.copy(originalPosition);
 avatar.scale.setScalar(1.24); // 1,81m dans la source -> silhouette comparable au danseur actuel
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
 });
 if(skinned<1||triangles<3000||triangles>35000)throw new Error('Modèle Quaternius non optimisé ou désarticulé');
 scene.add(avatar);
 avatar.updateMatrixWorld(true);
 const smile=addSmile(avatar,bones.Head);
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
 const up=won?.6:action==='square'?.55:action==='circle'?.18:0;
 worldBend(bones.upperarm_l,Z,1.0-up+Math.sin(beat+.25)*.28*strength);
 worldBend(bones.upperarm_r,Z,-1.0+up-Math.sin(beat-.25)*.28*strength);
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
