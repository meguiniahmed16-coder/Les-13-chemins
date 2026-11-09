import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PerspectiveCamera,Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {createPrisonArms} from './prison-3d-arms.js';

const bytes=fs.readFileSync(new URL('./danse-quaternius-hero.glb',import.meta.url));
const model=()=>new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
async function setup(aspect=390/720){
 const gltf=await model(),arms=createPrisonArms(gltf);
 const camera=new PerspectiveCamera(65,aspect,.025,30);
 camera.position.set(0,1.62,.75);camera.lookAt(0,1.48,-1.55);camera.updateMatrixWorld(true);
 return {gltf,arms,camera};
}
function settle(arms,camera,options={},seconds=2,fps=60){
 for(let i=0;i<Math.round(seconds*fps);i++)arms.update(camera,{dt:1/fps,time:0,...options});
}
const at=(arms,name)=>arms.bones[name].getWorldPosition(new Vector3());
const visibleMeshes=root=>{const result=[];root.traverse(x=>{if(x.isMesh&&x.visible)result.push(x);});return result;};
function assertLengths(arms){
 for(const side of ['r','l']){
  assert.ok(Math.abs(at(arms,'upperarm_'+side).distanceTo(at(arms,'lowerarm_'+side))-.25111497)<2e-6);
  assert.ok(Math.abs(at(arms,'lowerarm_'+side).distanceTo(at(arms,'hand_'+side))-.24359415)<2e-6);
 }
}

test('The actual GLB renders only weighted arm and finger triangles, retaining the skeleton',async()=>{
 const {arms}=await setup();const meshes=visibleMeshes(arms.root);
 assert.equal(meshes.length,1);const mesh=meshes[0];assert.equal(mesh.isSkinnedMesh,true);
 assert.equal(mesh.skeleton.bones.length,65);
 assert.ok(mesh.geometry.index.count>10000&&mesh.geometry.index.count<16000);
 const si=mesh.geometry.attributes.skinIndex,sw=mesh.geometry.attributes.skinWeight;
 const vertices=new Set(mesh.geometry.index.array);let rightHand=0,leftHand=0;
 for(const vertex of vertices){
  let armWeight=0;
  for(let i=0;i<4;i++){
   const name=mesh.skeleton.bones[si.getComponent(vertex,i)].name,weight=sw.getComponent(vertex,i);
   if(/^(upperarm|lowerarm|hand|index|middle|pinky|ring|thumb)_/.test(name))armWeight+=weight;
   if(weight>1e-5)assert.ok(!/^(Head|neck|thigh|calf|foot|ball)/.test(name),'Head or leg skin must not be visible');
   if(name==='hand_r')rightHand+=weight;
   if(name==='hand_l')leftHand+=weight;
  }
  assert.ok(armWeight>=.5-1e-6);
 }
 assert.ok(rightHand>100&&leftHand>100,'Both original articulated hands remain');
 assert.equal(mesh.frustumCulled,false);
 arms.dispose();
});

test('Both real hands stay visible below the gaze in a portrait first-person camera',async()=>{
 const {arms,camera}=await setup();settle(arms,camera);
 for(const side of ['r','l']){
  const hand=at(arms,'hand_'+side),middle=at(arms,'middle_02_'+side);
  const projected=middle.clone().project(camera),local=camera.worldToLocal(hand.clone());
  assert.ok(Math.abs(projected.x)<1&&Math.abs(projected.y)<1,'Finger centre lies inside phone view');
  assert.ok(local.z<-.15&&local.y<-.08,'The wrists stay in front and below the eyes');
 }
 const mesh=visibleMeshes(arms.root)[0],position=new Vector3();
 for(const vertex of new Set(mesh.geometry.index.array)){
  mesh.getVertexPosition(vertex,position).applyMatrix4(mesh.matrixWorld);
  assert.ok(position.toArray().every(Number.isFinite),'The deformed skin has finite vertices');
 }
 assertLengths(arms);arms.dispose();
});

test('A reachable brush aligns the palm with its handle without changing bone lengths',async()=>{
 const {arms,camera}=await setup();camera.position.x=.2;
 const target=new Vector3(.36,1.16,.68);camera.lookAt(target);camera.updateMatrixWorld(true);
 settle(arms,camera,{target,reach:1,gripping:true});
 assert.ok(arms.grip.distanceTo(target)<.00002,'Palm centre reaches the actual floor-brush handle');
 assertLengths(arms);
 assert.ok(at(arms,'hand_r').y<camera.position.y,'The grasp does not raise the wrist above the eyes');
 const grasp=arms.grip.clone();arms.update(camera,{dt:1/60,time:0,target:null,gripping:true});
 assert.ok(arms.grip.distanceTo(grasp)<.05,'Picking up an object starts a smooth return toward the resting hand');
 arms.dispose();
});

test('A distant object cannot stretch the real arms and the same palm anchor follows camera motion',async()=>{
 const {arms,camera}=await setup();settle(arms,camera,{gripping:true});
 const localAnchor=arms.bones.hand_r.worldToLocal(arms.grip.clone());
 const target=new Vector3(4,1.3,-3);settle(arms,camera,{target,reach:1,gripping:true});
 const shoulder=at(arms,'upperarm_r'),wrist=at(arms,'hand_r');
 assert.ok(shoulder.distanceTo(wrist)<=.49172);assert.ok(arms.grip.distanceTo(target)>3);
 assertLengths(arms);
 camera.position.set(.5,1.1,-.6);camera.lookAt(1.2,.7,-.2);camera.updateMatrixWorld(true);
 settle(arms,camera,{gripping:true});
 assert.ok(arms.bones.hand_r.localToWorld(localAnchor.clone()).distanceTo(arms.grip)<2e-6);
 assert.ok(arms.grip.toArray().every(Number.isFinite));
 assert.ok(Math.abs(arms.root.quaternion.x)<1e-10&&Math.abs(arms.root.quaternion.z)<1e-10,'The body stays upright while the eyes pitch');
 assertLengths(arms);arms.dispose();
});

test('The fingers and opposable thumb close around the palm instead of rotating as a rigid mitten',async()=>{
 const {arms,camera}=await setup();settle(arms,camera);
 const open=at(arms,'middle_04_leaf_r').distanceTo(arms.grip);
 settle(arms,camera,{gripping:true});
 const closed=at(arms,'middle_04_leaf_r').distanceTo(arms.grip);
 assert.ok(closed<open*.25);assert.ok(closed<.03);
 assert.ok(at(arms,'thumb_04_leaf_r').distanceTo(arms.grip)<.03,'The thumb opposes the curled fingers at the handle');
 assert.ok(at(arms,'middle_01_r').distanceTo(at(arms,'middle_02_r'))>.035);
 assert.ok(at(arms,'middle_01_r').distanceTo(at(arms,'middle_02_r'))<.04);
 const pose=Object.values(arms.bones).map(bone=>bone.quaternion.clone()),grip=arms.grip.clone();
 settle(arms,camera,{gripping:true},2);
 Object.values(arms.bones).forEach((bone,i)=>assert.ok(bone.quaternion.clone().normalize().angleTo(pose[i].normalize())<2e-6,'Repeated updates do not accumulate joint rotations'));
 assert.ok(arms.grip.distanceTo(grip)<2e-6);arms.dispose();
});

test('Reach and finger transitions are equivalent at 60 and 120 Hz and visibility can resume',async()=>{
 const a=await setup(),b=await setup(),target=new Vector3(.26,1.34,.49);
 settle(a.arms,a.camera,{target,reach:.7,gripping:true},.5,60);
 settle(b.arms,b.camera,{target,reach:.7,gripping:true},.5,120);
 assert.ok(a.arms.grip.distanceTo(b.arms.grip)<2e-6);
 assert.ok(at(a.arms,'middle_04_leaf_r').distanceTo(at(b.arms,'middle_04_leaf_r'))<2e-6);
 a.arms.update(a.camera,{visible:false});assert.equal(a.arms.root.visible,false);
 a.arms.update(a.camera,{visible:true});assert.equal(a.arms.root.visible,true);
 assert.ok(a.arms.grip.toArray().every(Number.isFinite));a.arms.dispose();b.arms.dispose();
});

test('A held cylinder aligns through the closed palm without moving its grip centre',async()=>{
 const {arms,camera}=await setup();const target=new Vector3(.28,1.32,.54);
 for(const handleAxis of [new Vector3(0,1,0),new Vector3(.2,.4,-.8).normalize()]){
  settle(arms,camera,{target,reach:1,gripping:true,handleAxis});
  const finger=at(arms,'middle_01_r').sub(at(arms,'hand_r')).normalize();
  const across=at(arms,'pinky_01_r').sub(at(arms,'index_01_r'));
  const palmNormal=new Vector3().crossVectors(finger,across).normalize();
  const palmCylinder=new Vector3().crossVectors(finger,palmNormal).normalize();
  assert.ok(Math.abs(palmCylinder.dot(handleAxis))>.99999,'The cylinder crosses the curled fingers along the palm width');
  assert.ok(arms.grip.distanceTo(target)<.00002,'Changing handle orientation preserves the palm attachment');
  assertLengths(arms);
  const rotation=arms.bones.hand_r.getWorldQuaternion(arms.bones.hand_r.quaternion.clone());
  settle(arms,camera,{target,reach:1,gripping:true,handleAxis:handleAxis.clone().negate()});
  assert.ok(rotation.normalize().angleTo(arms.bones.hand_r.getWorldQuaternion(rotation.clone()).normalize())<2e-6,'The cylinder axis has no preferred sign');
 }
 arms.dispose();
});
