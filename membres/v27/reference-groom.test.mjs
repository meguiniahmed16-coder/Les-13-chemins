import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {attachReferenceGrooms,addBoundVisemes} from './reference-groom.js';

function mesh(z=0){
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute([0,0,z,.1,0,z,0,.1,z],3));
 geometry.setAttribute('normal',new T.Float32BufferAttribute([0,0,1,0,0,1,0,0,1],3));
 geometry.setIndex([0,1,2]);return new T.Mesh(geometry,new T.MeshStandardMaterial());
}
function binding(){return Uint16Array.from([0,1,2,65535,0,100,0,0,0,1,2,0,65535,100,0,0,0,1,2,0,0,100,0,0]);}

test('the reference beard retains its gap, follows mouth morphs and leaves the portrait untouched',()=>{
 const scene=new T.Group(),head=new T.Group(),body=mesh(),skin=mesh(.02),part={obj:mesh(.01),source:{name:'beard',groom:true,groomKind:'beard',binding:binding()}};
 scene.add(head,body,part.obj);head.add(skin);
 skin.geometry.morphTargetsRelative=true;skin.geometry.morphAttributes.position=[new T.Float32BufferAttribute([0,-.005,0,0,-.005,0,0,-.005,0],3)];skin.updateMorphTargets();
 const original=skin.geometry.attributes.position.array.slice(),rig=attachReferenceGrooms({parts:[part],body:{obj:body},skin});
 assert.equal(part.obj.visible,false);const fitted=rig.group.children[0],p=fitted.geometry.attributes.position;
 for(let i=0;i<3;i++)assert.ok(Math.abs(p.getZ(i)-.03)<1e-7);
 skin.morphTargetInfluences[0]=1;rig.update();
 for(let i=0;i<3;i++)assert.ok(Math.abs(p.getY(i)-(i===2?.095:-.005))<1e-7);
 assert.deepEqual(skin.geometry.attributes.position.array,original,'Neither face coordinates nor topology may be replaced for a beard');
 const local=new T.Vector3().fromBufferAttribute(p,0);head.rotation.y=.3;head.position.x=.2;scene.updateMatrixWorld(true);
 assert.ok(local.clone().applyMatrix4(fitted.matrixWorld).distanceTo(local.clone().applyMatrix4(head.matrixWorld))<1e-9);
 rig.dispose();assert.equal(part.obj.visible,true);assert.equal(rig.group.parent,null);
});

test('native beard GPU visemes use the body surface and retain independent buffers',()=>{
 const body={obj:mesh(),voiceReady:false},part={obj:mesh(.01),source:{binding:binding()}};
 assert.equal(addBoundVisemes(part,body),false);
 body.obj.geometry.morphTargetsRelative=true;
 body.obj.geometry.morphAttributes.position=Array.from({length:4},(_,i)=>new T.Float32BufferAttribute([0,-.01*i,0,0,-.02*i,0,0,-.03*i,0],3));body.voiceReady=true;
 assert.equal(addBoundVisemes(part,body),true);assert.equal(part.voiceReady,true);
 assert.equal(part.obj.morphTargetInfluences.length,4);
 part.obj.morphTargetInfluences[1]=1;
 const point=part.obj.getVertexPosition(1,new T.Vector3());assert.ok(Math.abs(point.y+.02)<1e-7);assert.ok(Math.abs(point.z-.01)<1e-7);
 const target=part.obj.geometry.morphAttributes.position[1];assert.notEqual(target,body.obj.geometry.morphAttributes.position[1]);
 assert.deepEqual(part.obj.geometry.attributes.position.array,mesh(.01).geometry.attributes.position.array);
});
