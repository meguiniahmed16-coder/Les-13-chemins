import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {BODY_FIT,FACE_KEYS,faceMapping,applyMapped,headCorrection,fitHead,deformNeck,speechFrame,alignImportedHead} from './atelier-face-fit.js';
const settings={width:1,height:1,depth:1,headSize:1,headX:0,headY:0,headZ:0,headPitch:0,neckWidth:1,neckHeight:1,neckDepth:1};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,a+' vs '+b);
test('head and neck share the same pivot; width of body does not inflate the head',()=>{
 const a={neckRestBox:new T.Box3(new T.Vector3(-.05,0,-.05),new T.Vector3(.05,.04,.05)),neckAnchor:new T.Vector3(0,.04,.02)};
 const b={...settings,...BODY_FIT.f,width:1.2};
 const delta=headCorrection(a,b),pivot=a.neckAnchor.clone().applyMatrix4(delta);
 near(pivot.x,0);near(pivot.y,.036);near(pivot.z,-.004);
 const left=a.neckAnchor.clone().add(new T.Vector3(.10,0,0)).applyMatrix4(delta);
 near((left.x-pivot.x)*b.width,.094);
});
test('neck base follows body, upper ring follows corrected head',()=>{
 const p=new T.BufferGeometry();p.setAttribute('position',new T.Float32BufferAttribute([0,0,0,.01,.02,0,0,.04,0],3));p.setIndex([0,1,2]);
 const bodyGeo=new T.BufferGeometry();bodyGeo.setAttribute('position',new T.Float32BufferAttribute([0,0,0],3));
 const body=new T.Mesh(bodyGeo);body.getVertexPosition=(i,v)=>v.set(0,.01,0);body.updateMatrixWorld(true);
 const neck=new T.Mesh(p);neck.updateMatrixWorld(true);
 const a={body,neck,neckRestBox:new T.Box3(new T.Vector3(-.05,0,-.05),new T.Vector3(.05,.04,.05)),neckDelta:new T.Matrix4().makeTranslation(0,0,-.02),neckRecords:[{source:new T.Vector3(),body:new T.Vector3(),nearest:0,t:0},{source:new T.Vector3(.01,.02,0),body:new T.Vector3(.01,.02,0),nearest:0,t:.5},{source:new T.Vector3(0,.04,0),body:new T.Vector3(0,.04,0),nearest:0,t:1}]};
 deformNeck(a,settings);near(p.attributes.position.getY(0),.01);near(p.attributes.position.getZ(0),0);near(p.attributes.position.getY(2),.04);near(p.attributes.position.getZ(2),-.02);
});
test('existing V18 and ARKit morph names can be driven by the same controls',()=>{
 const map=faceMapping({jawOpen:0,mouthSmileLeft:1,mouthSmileRight:2,eyeBlinkLeft:3,eyeBlinkRight:4,mouthPucker:5,Pincer:6});assert.deepEqual(map.Ouvrir,[0]);assert.deepEqual(map.Cligner,[3,4]);assert.deepEqual(map.Pincer,[6]);
 const mesh={morphTargetInfluences:[0,0,0,0,0,0,0]};applyMapped(mesh,map,{Ouvrir:.25,Cligner:.8,Rond:.4});near(mesh.morphTargetInfluences[0],.25);near(mesh.morphTargetInfluences[3],.8);near(mesh.morphTargetInfluences[4],.8);near(mesh.morphTargetInfluences[5],.4);
 applyMapped(mesh,map,{});assert.ok(mesh.morphTargetInfluences.every(v=>v===0));
});
test('reference phonemes distinguish open mouth, closed lips and rounded vowels',()=>{
 const s={jaw:.23,wide:.17,round:.55,close:.65,offset:0};
 const data={visemes:[{debut:.5,fin:.8,forme:'A'},{debut:1,fin:1.2,forme:'MBP'},{debut:1.4,fin:1.6,forme:'OU'}],rires:[]};
 near(speechFrame(data,.65,s).Ouvrir,.23);near(speechFrame(data,1.1,s).Ouvrir,0);assert.ok(speechFrame(data,1.1,s).Pincer>.4);assert.ok(speechFrame(data,1.5,s).Rond>.5);assert.ok(Object.values(speechFrame(data,2,s)).every(x=>x===0));
 assert.ok(speechFrame(null,2,s,.6).Ouvrir>.1);assert.equal(FACE_KEYS.length,13);
});
test('imported head is matched to the reference size and center, not an arbitrary origin',()=>{
 const inside=new T.Group(),source=new T.Mesh(new T.BoxGeometry(2,4,2));source.position.set(5,7,2);inside.add(source);
 const a={headRestBox:new T.Box3(new T.Vector3(-.4,-.3,-.3),new T.Vector3(.4,.5,.3))};alignImportedHead(a,source,inside);inside.updateMatrixWorld(true);const b=new T.Box3().setFromObject(source);near(b.getSize(new T.Vector3()).y,.8);near(b.getCenter(new T.Vector3()).y,.1);near(b.getCenter(new T.Vector3()).x,0);
});