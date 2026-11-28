import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {initExpandedRig,poseExpandedRig,facialPose,clearDoubleFaceMorphs,prepareKimonoFit,JAW,TOTAL_JOINTS} from './atelier-armature-v3.js';
const v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const near=(a,b,e=1e-5)=>assert.ok(Math.abs(a-b)<e,a+' vs '+b);
function rig(id='f'){
 const root=new T.Group(),inner=new T.Group(),rigRoot=new T.Group();root.add(inner);inner.scale.setScalar(1.04);inner.add(rigRoot);
 const points=[[0,.91,0],[0,1.49,.07],[-.2,1.19,0],[-.23,.98,0],[-.18,.79,.08],[.2,1.19,0],[.23,.98,0],[.18,.79,.08],[-.09,.60,.05],[-.09,.24,.02],[-.09,.026,.135],[.09,.60,.05],[.09,.24,.02],[.09,.026,.135],[0,1.25,.02]];
 const bones=points.map((p,i)=>{const b=new T.Bone();b.name='legacy'+i;b.position.set(...p);rigRoot.add(b);return b;});
 root.updateMatrixWorld(true);
 const bind=bones.map(b=>new T.Matrix4().compose(b.position,b.quaternion,b.scale));
 const createSkin=()=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,1.39,.02,.01,1.37,.015,0,1.36,-.02,0,1.08,.02,-.12,1.22,0,-.09,.08,.1,-.09,.03,.18],3));g.setIndex([0,1,2,2,3,4]);g.computeVertexNormals();g.setAttribute('skinIndex',new T.Uint16BufferAttribute([1,14,0,0,14,1,0,0,14,1,0,0,0,14,0,0,14,2,0,0,9,10,0,0,10,9,0,0],4));g.setAttribute('skinWeight',new T.Float32BufferAttribute([.5,.5,0,0,.7,.3,0,0,.9,.1,0,0,.5,.5,0,0,.6,.4,0,0,.5,.5,0,0,.85,.15,0,0],4));const mesh=new T.SkinnedMesh(g,new T.MeshStandardMaterial());inner.add(mesh);mesh.bind(new T.Skeleton(bones,bind.map(m=>m.clone().invert())),new T.Matrix4());return mesh;};
 const body=createSkin(),garment=createSkin(),portrait=new T.Group(),head=new T.Group();bones[1].add(portrait);portrait.position.set(0,-.12,-.017);portrait.scale.setScalar(.95);portrait.add(head);head.position.set(0,.17,0);head.scale.setScalar(.333);
 const neck=new T.Mesh(new T.BoxGeometry(.1,.04,.1),new T.MeshBasicMaterial());neck.position.y=.04;portrait.add(neck);
 const meshes=[body,garment,neck],morphs=[];
 const add=(name,pos,size,morph=false)=>{const g=new T.BoxGeometry(...size);g.translate(...pos);if(morph){const p=g.attributes.position;g.morphAttributes.position=[new T.Float32BufferAttribute(new Float32Array(p.count*3),3)];g.morphAttributes.position[0].name='Ouvrir';g.morphTargetsRelative=true;}const m=new T.Mesh(g,new T.MeshStandardMaterial());m.name=name;head.add(m);meshes.push(m);if(morph)morphs.push(m);return m;};
 const lower=add('Dents_inférieures',[0,-.19,.17],[.1,.04,.12],true);const upper=add('Dents_supérieures',[0,-.14,.17],[.1,.04,.12]);add('Langue',[0,-.19,.14],[.07,.02,.1],true);
 for(const [side,x] of [['D',-.1],['G',.1]]){add('Globe_et_iris_'+side,[x,.04,.2],[.12,.1,.08]);add('Paupières_'+side,[x,.04,.2],[.15,.12,.09],true);}
 root.updateMatrixWorld(true);const a={id,root,inner,body,garment,portrait,head,neck,bones,bind,meshes,morphs,neckRestBox:new T.Box3(v(-.055,.02,-.10),v(.055,.058,.022)),neckAnchor:v(0,.058,-.01)};return {a,lower,upper};
}
function basePose(a){for(let i=0;i<15;i++)a.bind[i].decompose(a.bones[i].position,a.bones[i].quaternion,a.bones[i].scale);}
for(const id of ['f','m'])test(id+' adds true cervical joints, local inverse binds and weighted joints without moving the rest model',()=>{
 const {a}=rig(id);const r=initExpandedRig(a);assert.equal(r.all.length,TOTAL_JOINTS);assert.equal(a.bones[1].parent,r.extra[2]);assert.equal(r.extra[2].parent,r.extra[1]);assert.equal(r.extra[1].parent,a.bones[14]);assert.equal(a.body.skeleton.bones.length,24);assert.equal(a.garment.skeleton.bones.length,24);
 basePose(a);poseExpandedRig(a,{});a.root.updateMatrixWorld(true);const pos=a.body.geometry.attributes.position,p=new T.Vector3();
 for(let i=0;i<pos.count;i++){a.body.getVertexPosition(i,p);near(p.x,pos.getX(i));near(p.y,pos.getY(i));near(p.z,pos.getZ(i));}
 const i=a.body.geometry.attributes.skinIndex,w=a.body.geometry.attributes.skinWeight;let added=0;for(let n=0;n<i.count;n++){let sum=0;for(let k=0;k<4;k++){sum+=w.getComponent(n,k);if(i.getComponent(n,k)>=15&&w.getComponent(n,k)>0)added++;}near(sum,1);}assert.ok(added>0);
 const before=a.bones[1].getWorldPosition(v());basePose(a);poseExpandedRig(a,{16:[15,0,0,0,0,0]});a.root.updateMatrixWorld(true);assert.ok(a.bones[1].getWorldPosition(v()).distanceTo(before)>.005);
});
test('lower dental arch follows the actual jaw hinge; upper arch stays fixed and morph is not doubled',()=>{
 const {a,lower,upper}=rig();initExpandedRig(a);a.root.updateMatrixWorld(true);const before=lower.localToWorld(v(0,-.19,.17)),u=upper.localToWorld(v(0,-.14,.17));const values={Ouvrir:1};
 facialPose(a,values,{eyeAdvance:.026},{});lower.morphTargetInfluences[0]=values.Ouvrir;clearDoubleFaceMorphs(a);a.root.updateMatrixWorld(true);
 near(a.expanded.jaw.rotation.x,JAW.f.angle*.78);assert.equal(lower.parent,a.expanded.jaw);assert.equal(lower.morphTargetInfluences[0],0);assert.ok(lower.localToWorld(v(0,-.19,.17)).distanceTo(before)>.001);near(upper.localToWorld(v(0,-.14,.17)).distanceTo(u),0);
 for(const l of a.expanded.lidList){assert.equal(l.mesh.isSkinnedMesh,true);assert.deepEqual(l.mesh.skeleton.bones,[l.upper,l.lower]);}
 const eye=a.expanded.eyeList[0];near(eye.bone.position.z-eye.rest.z,.025);assert.equal(eye.mesh.parent,eye.bone);assert.equal(eye.bone.children.length,1,'No synthetic sphere may cover the original iris');
 facialPose(a,{Cligner:1},{eyeAdvance:.026},{});assert.ok(a.expanded.lidList[0].upper.rotation.x>0);assert.ok(a.expanded.lidList[0].lower.rotation.x<0);
});
test('local cloth fit reduces excess gap but preserves rest clearance',()=>{
 const mesh=verts=>({geometry:new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(verts,3))});
 const body=mesh([0,1,.10]),garment=mesh([0,1,.16]);const d=prepareKimonoFit(body,garment);assert.ok(d[2]<0&&d[2]>-.044);near(d[1],0);
});