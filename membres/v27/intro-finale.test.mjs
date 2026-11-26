import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {readFileSync} from 'node:fs';
import {createIntroFinale,introFinaleFrame,INTRO_FINALE_DURATION} from './intro-finale.js';

test('the real garden demonstration unfolds wings at three seconds and holds the final frame for the promotion',()=>{
 assert.equal(introFinaleFrame(2500).wings,0);assert.equal(introFinaleFrame(4000).wings,.5);assert.equal(introFinaleFrame(5000).wings,1);
 assert.deepEqual(introFinaleFrame(20000),introFinaleFrame(30000));assert.equal(INTRO_FINALE_DURATION,20000);
 for(const t of [0,2500,6000,9000,13000])assert.deepEqual(introFinaleFrame(t),introFinaleFrame(t));
});

test('the parent owns time, repeat samples freeze motion, and skip safely opens the salon without begin',()=>{
 const calls=[],adapter={viewport:()=>({width:390,height:700}),begin:()=>calls.push('begin'),apply:frame=>calls.push(frame),faces:()=>[{id:'m',x:50,y:200}],finish:()=>calls.push('finish')};
 const finale=createIntroFinale(adapter);finale.begin();const a=finale.sample(6100),b=finale.sample(6100);assert.deepEqual(a,b);assert.equal(finale.active,true);
 assert.equal(finale.finish().place,'salon');finale.finish();assert.equal(calls.filter(x=>x==='finish').length,1);
 const skip=createIntroFinale(adapter);skip.finish();assert.equal(skip.active,false);assert.equal(calls.filter(x=>x==='finish').length,2);
});

test('the production articulated wings can be opened before either character has ever worn a backpack',()=>{
 const source=readFileSync(new URL('./scene.js',import.meta.url),'utf8');
 const start=source.indexOf('function flightRig(a){'),end=source.indexOf('function wingThrust(',start);
 const make=new Function('T','featherGeo','featherMat','fitHarness','mix','tau',source.slice(start,end)+';return {flightRig,poseWings};');
 const {flightRig,poseWings}=make(T,[new T.BoxGeometry(),new T.BoxGeometry()],new T.MeshStandardMaterial(),actor=>{
  const h=new T.Group();h.visible=false;actor.root.add(h);return {h};
 },T.MathUtils.lerp,Math.PI*2);
 for(const id of ['m','f']){
  const actor={id,root:new T.Group(),body:new T.Group()};actor.root.add(actor.body);
  const rig=flightRig(actor);assert.equal(actor.body.parent,rig.load);assert.equal(actor.harness.h.visible,false);
  assert.equal(rig.wings.length,2);assert.equal(flightRig(actor),rig);
  poseWings(actor,0,0,.07);assert.ok(rig.wings.every(({wing})=>!wing.visible));
  poseWings(actor,1,7*.92,.12);assert.ok(rig.wings.every(({wing})=>wing.visible));
  const snapshot=rig.wings.map(j=>j.shoulder.quaternion.toArray());
  poseWings(actor,1,7*.92,.12);assert.deepEqual(rig.wings.map(j=>j.shoulder.quaternion.toArray()),snapshot);
  poseWings(actor,0,0,0);assert.ok(rig.wings.every(({wing})=>!wing.visible));
 }
});

test('front and three-quarter framing leaves the fixed introduction bubble above both real-size heads',()=>{
 for(const [width,height] of [[1280,720],[1024,600],[390,700],[320,640],[844,300],[640,240]]){
  for(let t=0;t<=6500;t+=250){
   const frame=introFinaleFrame(t,{width,height}),cam=new T.PerspectiveCamera(frame.camera.fov,width/height,.07,180);
   cam.position.fromArray(frame.camera.position);cam.lookAt(new T.Vector3().fromArray(frame.camera.target));cam.updateMatrixWorld(true);
   // Source heads sit between 1.55m and 1.86m; include padding beyond the face.
   for(const actor of Object.values(frame.actors))for(const x of [-.20,.20])for(const y of [1.55,1.90]){
    const p=new T.Vector3(actor.x+x,y,actor.z).project(cam),screenY=(.5-p.y*.5)*height;
    assert.ok(p.z>-1&&p.z<1);assert.ok(screenY>=Math.min(108,height*.45),`${width}×${height}, ${t}ms: head at ${screenY}px`);
    assert.ok(screenY<height-65,`${width}×${height}, ${t}ms: face overlaps bottom demonstration`);
   }
   assert.ok(cam.position.z> -7.3,'The camera stays in front of the existing park arch.');
  }
 }
});


test('Le duo décolle, bat des ailes, accomplit un tour de caméra complet puis s’éloigne',()=>{
 const a=introFinaleFrame(6500),b=introFinaleFrame(9000),c=introFinaleFrame(15500),d=introFinaleFrame(20000);
 assert.ok(b.altitude>3);assert.equal(b.orbitRadians,0);assert.equal(c.orbitRadians,2*Math.PI);
 assert.ok(c.wingPhase>b.wingPhase+6*Math.PI);assert.ok(c.wingPower>.6);assert.ok(d.altitude>10);
 assert.ok(d.actors.m.z<a.actors.m.z-8);assert.ok(d.camera.position[1]>c.camera.position[1]+10);
});
