import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from 'three';
import {referenceArmature,referenceSkin,skinSection} from './atelier-rig-makehuman.js';
const read=async name=>JSON.parse(await readFile(new URL('./rig-reference/'+name,import.meta.url),'utf8'));
test('assemble the 163 actual MakeHuman bones and native vertex weights',async()=>{
 const [ref,weights]=await Promise.all([read('makehuman-default.json'),read('makehuman-default-weights.json')]);
 const a=referenceArmature(ref,weights);
 assert.equal(a.skeleton.bones.length,163);assert.equal(a.root.children.length,1);assert.equal(a.skinWeight.count,19158);
 for(const [child,parent] of [['neck01','spine01'],['neck02','neck01'],['neck03','neck02'],['head','neck03'],['jaw','head'],['finger1-2.L','finger1-1.L'],['toe2-3.R','toe2-2.R']])assert.equal(a.objects.get(child).parent.name,parent);
 for(let i=0;i<a.skinWeight.count;i++){let sum=0;for(let j=0;j<4;j++){sum+=a.skinWeight.getComponent(i,j);assert.ok(a.skinIndex.getComponent(i,j)<163);}assert.ok(Math.abs(sum-1)<1e-6);}
 for(let i=0;i<a.skeleton.bones.length;i++){const bone=a.skeleton.bones[i];assert.ok(bone.matrixWorld.elements.every(Number.isFinite));const identity=bone.matrixWorld.clone().multiply(a.skeleton.boneInverses[i]);assert.ok(identity.elements.every((v,j)=>Math.abs(v-(j%5===0?1:0))<1e-5));}
 const tip=a.objects.get('finger2-3.L'),before=tip.getWorldPosition(new T.Vector3());a.objects.get('finger2-1.L').rotateX(.35);a.root.updateMatrixWorld(true);assert.ok(tip.getWorldPosition(new T.Vector3()).distanceTo(before)>1e-5);
 assert.throws(()=>referenceArmature(ref,weights,{positions:new Float32Array(100998*3),topology:'scan-importe'}));
});

test('native cervical surface stays connected and follows the anatomical rig',async()=>{
 const [ref,w,surface]=await Promise.all([read('makehuman-default.json'),read('makehuman-default-weights.json'),read('makehuman-default-surface.json')]);
 const a=referenceSkin(ref,w,surface);const geo=a.mesh.geometry;
 assert.equal(geo.index.count,26756*3);assert.equal(geo.attributes.position.count,13380);assert.equal(a.mesh.skeleton,a.skeleton);
 for(const y of [1.42,1.44,1.46]){const cut=skinSection(geo,y);assert.ok(cut.length>0);assert.ok(cut.every(c=>c.closed));}
 const before=[],after=[],p=geo.attributes.position;
 for(let i=0;i<p.count;i++){if(p.getY(i)>1.45&&p.getY(i)<1.47){const v=new T.Vector3().fromBufferAttribute(p,i);before.push([i,a.mesh.applyBoneTransform(i,v.clone())]);}}
 assert.ok(before.length>30);
 a.objects.get('neck02').rotateX(.18);a.objects.get('neck03').rotateZ(.10);a.root.updateMatrixWorld(true);
 for(const [i,v] of before){const q=a.mesh.applyBoneTransform(i,new T.Vector3().fromBufferAttribute(p,i));assert.ok([q.x,q.y,q.z].every(Number.isFinite));after.push(q.distanceTo(v));}
 assert.ok(Math.max(...after)>.001);
});

import {projectSkinWeights,applyTransferredWeights} from './atelier-rig-transfer.js';
test('transfer interpolates weights on the original triangle, rejects opposite normals and distant skin',()=>{
 const source=new T.BufferGeometry();source.setAttribute('position',new T.Float32BufferAttribute([0,0,0,1,0,0,0,1,0],3));source.setAttribute('normal',new T.Float32BufferAttribute([0,0,1,0,0,1,0,0,1],3));source.setAttribute('skinIndex',new T.Uint16BufferAttribute([0,0,0,0,1,0,0,0,2,0,0,0],4));source.setAttribute('skinWeight',new T.Float32BufferAttribute([1,0,0,0,1,0,0,0,1,0,0,0],4));source.setIndex([0,1,2]);
 const target=new T.BufferGeometry();target.setAttribute('position',new T.Float32BufferAttribute([.25,.25,.002,.25,.25,.002,.25,.25,2],3));target.setAttribute('normal',new T.Float32BufferAttribute([0,0,1,0,0,-1,0,0,1],3));
 const result=projectSkinWeights(source,target);assert.deepEqual([...result.accepted],[1,0,0]);assert.ok(Math.abs(result.weights[0]-.5)<1e-6);assert.ok(Math.abs(result.weights[1]-.25)<1e-6);assert.ok(Math.abs(result.weights[2]-.25)<1e-6);assert.throws(()=>applyTransferredWeights(target,result));
 const valid=new T.BufferGeometry();valid.setAttribute('position',new T.Float32BufferAttribute([.25,.25,.002],3));valid.setAttribute('normal',new T.Float32BufferAttribute([0,0,1],3));applyTransferredWeights(valid,projectSkinWeights(source,valid));assert.ok(valid.attributes.skinWeight);
});

import {prepareV22Retarget,V22_TO_MAKEHUMAN} from './atelier-rig-retarget.js';
test('V22 motion follows hierarchical MakeHuman joints without cumulative drift',async()=>{
 const [ref,w]=await Promise.all([read('makehuman-default.json'),read('makehuman-default-weights.json')]);
 const rig=referenceArmature(ref,w);
 const frame=new T.Group();frame.rotation.y=.41;frame.position.set(2,0,1);
 rig.root.rotation.y=-.22;rig.root.position.set(-1,0,3);
 rig.root.updateWorldMatrix(true,true);
 const bones=V22_TO_MAKEHUMAN.map((name,i)=>{
  const b=new T.Bone();b.name='old-'+i;
  b.position.copy(rig.root.worldToLocal(rig.objects.get(name).getWorldPosition(new T.Vector3())));
  b.rotation.set(.1*i,-.15,.2);frame.add(b);return b;
 });
 frame.updateWorldMatrix(true,true);
 const localQ=(b,f)=>f.getWorldQuaternion(new T.Quaternion()).invert().multiply(b.getWorldQuaternion(new T.Quaternion()));
 const same=(a,b)=>assert.ok(1-Math.abs(a.dot(b))<1e-6);
 const baseline=rig.skeleton.bones.map(b=>({b,q:b.quaternion.clone(),p:b.position.clone(),s:b.scale.clone()}));
 const retarget=prepareV22Retarget(bones,frame,rig);
 retarget.pose();
 for(const r of baseline){same(r.b.quaternion,r.q);assert.ok(r.b.position.distanceTo(r.p)<1e-6);}
 const head=rig.objects.get('head'),hand=rig.objects.get('wrist.R'),delta=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),.3);
 const headRest=localQ(head,rig.root),handRest=localQ(hand,rig.root);
 bones[1].quaternion.premultiply(delta);bones[4].quaternion.premultiply(delta);
 bones[0].position.x+=.2;retarget.pose();
 same(localQ(head,rig.root),delta.clone().multiply(headRest));
 same(localQ(hand,rig.root),delta.clone().multiply(handRest));
 assert.ok(Math.abs(rig.objects.get('root').position.x-baseline.find(r=>r.b.name==='root').p.x-.2)<1e-6);
 const moved=rig.skeleton.bones.map(b=>b.quaternion.clone());retarget.pose();
 for(let i=0;i<moved.length;i++)same(moved[i],rig.skeleton.bones[i].quaternion);
 for(const r of baseline){assert.ok(r.b.scale.distanceTo(r.s)<1e-6);if(r.b.name!=='root')assert.ok(r.b.position.distanceTo(r.p)<1e-6);}
 retarget.reset();for(const r of baseline)same(r.b.quaternion,r.q);
});
