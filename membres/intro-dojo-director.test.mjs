import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DOJO_DURATIONS,dojoBlocking,dojoDirectedCamera} from './intro-dojo-director.js';
import {SalonMotion} from './salon-v27-motion.js';

const floor=new T.Box3(new T.Vector3(-4.489,-.061,-3.333),new T.Vector3(4.193,-.003,3.917));
const bounds=new T.Box3(new T.Vector3(floor.min.x+.8,floor.max.y+.35,floor.min.z+.45),new T.Vector3(floor.max.x-.8,floor.max.y+2.45,floor.max.z-.45));
const center=floor.getCenter(new T.Vector3());
const lines=Object.entries(DOJO_DURATIONS).map(([id,ms])=>({id,ms,speaker:['dojo-apparence','dojo-enregistrer'].includes(id)?'f':'m'}));
function sample(line,elapsed,aspect=16/9){
 const blocking=dojoBlocking(line,elapsed,{center,floorY:floor.max.y});
 const actors=['m','f'].map(id=>({id,root:{position:blocking[id].position,rotation:{y:blocking[id].yaw}}}));
 const headPosition=a=>a.root.position.clone().add(new T.Vector3(0,a.id==='m'?1.65:1.56,0));
 const frame=dojoDirectedCamera({line,elapsed,aspect,actors,bounds,floor,headPosition});
 return {blocking,actors,frame,headPosition};
}

test('the inclusive gallery keeps one stable full-body exhibition frame inside the dojo',()=>{
 const line={id:'dojo-personnaliser',ms:12000},origin=center.clone().setY(floor.max.y);origin.z+=.35;
 for(const aspect of [16/9,4/3,1,390/690,640/240])for(const at of [0,3000,6000,9000,12000]){
  const frame=dojoDirectedCamera({line,elapsed:at,aspect,actors:[],bounds,floor,previewActor:{root:{position:origin}}});
  assert.equal(frame.subject,'preview');assert.equal(frame.framing,'wide');assert.ok(bounds.containsPoint(frame.eye));
  const camera=new T.PerspectiveCamera(frame.fov,aspect,.07,120);camera.position.copy(frame.eye);camera.lookAt(frame.aim);camera.updateMatrixWorld(true);
  for(const x of [-.6,.6])for(const y of [floor.max.y,floor.max.y+2.03]){
   const point=new T.Vector3(origin.x+x,y,origin.z).project(camera);
   assert.ok(Math.abs(point.x)<.91&&Math.abs(point.y)<.91,'Widest silhouette, head and feet remain fully in view');
  }
 }
});

test('Marianne really walks a closed path; gait follows distance and stops with her feet',()=>{
 const line=lines.find(l=>l.id==='dojo-deplacement');let distance=0,prior=null,maxGait=0,maxSpeed=0,maxLift=0;
 for(let i=0;i<=660;i++){
  const at=i*line.ms/660,{blocking}=sample(line,at),p=blocking.f;
  if(prior){const gap=p.position.distanceTo(prior.position);distance+=gap;maxSpeed=Math.max(maxSpeed,gap/(line.ms/660/1000));assert.ok(gap<.025,'No character teleport between film frames');}
  assert.ok(p.position.x>=center.x+.12&&p.position.x<=center.x+1.4);
  assert.ok(p.position.distanceTo(blocking.m.position)>.95,'The pair never pass through one another');
  assert.ok(p.position.y>=0&&p.position.y<=.006,'Walking support stays within six millimetres of the original floor mark');
  maxLift=Math.max(maxLift,p.position.y);maxGait=Math.max(maxGait,p.gait.strength);prior=p;
 }
 const first=sample(line,0).blocking,last=sample(line,line.ms).blocking;
 assert.ok(distance>3&&distance<4.8,'A visible several-step circuit is performed');
 assert.ok(maxSpeed>.6&&maxSpeed<.95);assert.ok(maxGait>.8);
 assert.ok(maxLift>.005,'The travelling shoes receive enough clearance for their measured sole dip');
 assert.ok(first.f.position.distanceTo(last.f.position)<1e-10);
 assert.equal(first.f.position.y,0);assert.equal(last.f.position.y,0);
 assert.equal(first.f.gait.strength,0);assert.equal(last.f.gait.strength,0);
 assert.ok(last.f.gait.cycles>4,'The skeleton completes multiple actual gait cycles');
 assert.ok(Math.abs(Math.atan2(Math.sin(first.f.yaw-last.f.yaw),Math.cos(first.f.yaw-last.f.yaw)))<1e-10);
});

test('every late walking frame remains within the real skeleton solver’s valid gait cycle',()=>{
 const line=lines.find(l=>l.id==='dojo-deplacement'),solver=new SalonMotion(()=>{},{angle:0});
 for(let i=0;i<=330;i++){
  const {gait}=sample(line,line.ms*i/330).blocking.f;
  assert.ok(gait.phase>=0&&gait.phase<1,'Do not run off the solver’s finite internal5-second path');
  solver.travelPose(gait.phase,gait.strength*.7,0);const matrices=solver.bones();
  for(const [index,side]of [[10,-1],[13,1]]){
   const foot=new T.Vector3(side*.157455,.078552,-.018594).applyMatrix4(new T.Matrix4().fromArray(matrices,index*16));
   assert.ok(Math.abs(foot.z)<.45,'Late steps must not drag the feet metres behind the pelvis');
   assert.ok(foot.y>=-.005&&foot.y<.24,'The articulated feet remain near their physical support plane');
  }
 }
});

test('both half-turns articulate the knees and ankles around alternating planted feet',()=>{
 const line=lines.find(l=>l.id==='dojo-demi-tour');
 for(const id of ['m','f']){
  const scale=id==='m'?1.075:1.04,solver=new SalonMotion(()=>{},{angle:0},undefined,()=>.42);
  solver.femaleHands=id==='f';
  const first=sample(line,0).blocking[id],supports=new Map(),kneeAngles=[[],[]];
  let previous=null,maxLift=[0,0],supportFrames=0,maxAnkleYaw=0;
  for(let at=0;at<=line.ms;at+=15){
   const actor=sample(line,at).blocking[id],footwork=actor.gait.footwork;
   assert.deepEqual(actor.position.toArray(),first.position.toArray(),'The root stays at its original floor mark during the steps');
   assert.ok(footwork.feet.some(foot=>foot.planted),'At least one foot always carries the body');
   if(previous)assert.ok(Math.abs(actor.yaw-previous.yaw)<.055,'The pelvis turns continuously, in small supported steps');
   const matrices=solver.sampleFootworkPose(footwork,at/1000+(id==='f'?2.6:0),{gesture:actor.poseGesture,look:actor.headYaw},scale);
   const root=new T.Matrix4().compose(actor.position,new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),actor.yaw),new T.Vector3(scale,scale,scale));
   for(const [i,side]of [[0,-1],[1,1]]){
    const foot=footwork.feet[i],firstBone=i?11:8;
    const ankleMatrix=new T.Matrix4().fromArray(matrices,(firstBone+2)*16);
    const ankle=new T.Vector3(side*.157455,.078552,-.018594).applyMatrix4(ankleMatrix).applyMatrix4(root);
    const wanted=new T.Vector3(...foot.point).multiplyScalar(.01).applyMatrix4(root);
    assert.ok(ankle.distanceTo(wanted)<.000003,'The actual IK reaches the authored ankle target');
    const toe=new T.Vector3(side*.157455,.008552,.101406).applyMatrix4(ankleMatrix).applyMatrix4(root);
    if(foot.planted){
     const saved=supports.get(side);
     if(saved){
      assert.ok(ankle.distanceTo(saved.ankle)<.000004,'The planted ankle does not skate while the root rotates');
      assert.ok(toe.distanceTo(saved.toe)<.000004,'The planted sole also keeps its world orientation');
     }else supports.set(side,{ankle:ankle.clone(),toe:toe.clone()});
     supportFrames++;
    }else supports.delete(side);
    maxLift[i]=Math.max(maxLift[i],(foot.point[1]-7.85)*.01*scale);
    maxAnkleYaw=Math.max(maxAnkleYaw,Math.abs(foot.yaw-side*.043));
    const hip=new T.Vector3(side*.091,.858,-.021).applyMatrix4(new T.Matrix4().fromArray(matrices,firstBone*16));
    const knee=new T.Vector3(side*.124664,.472046,-.024319).applyMatrix4(new T.Matrix4().fromArray(matrices,(firstBone+1)*16));
    const localAnkle=new T.Vector3(side*.157455,.078552,-.018594).applyMatrix4(ankleMatrix);
    kneeAngles[i].push(hip.sub(knee).angleTo(localAnkle.sub(knee)));
   }
   previous=actor;
  }
  assert.ok(maxLift.every(value=>value>.035),'Both feet visibly lift and reposition');
  assert.ok(kneeAngles.every(values=>Math.max(...values)-Math.min(...values)>.15),'Both knees flex during the step');
  assert.ok(maxAnkleYaw>.7,'The ankle articulates against the turning pelvis');
  assert.ok(supportFrames>700,'Support is checked throughout both complete half-turns');
  assert.ok(Math.abs(sample(line,3800).blocking[id].yaw-first.yaw)>Math.PI-.00001,'The figure actually completes a half-turn');
  assert.ok(Math.abs(sample(line,line.ms).blocking[id].yaw-first.yaw)<1e-10,'The original facing is recovered without a jump');
 }
});

test('explicit footwork is deterministic and cannot leak into ordinary standing or walking poses',()=>{
 const solver=new SalonMotion(()=>{},{angle:0},undefined,()=>.42),fresh=new SalonMotion(()=>{},{angle:0},undefined,()=>.42);
 const actor=sample(lines.find(l=>l.id==='dojo-demi-tour'),2300).blocking.f,expression={gesture:actor.poseGesture,look:actor.headYaw};
 const first=solver.sampleFootworkPose(actor.gait.footwork,4.9,expression,1.04).slice();
 solver.sampleSalonPose(null,0,7,expression,1.04);
 assert.deepEqual(solver.sampleFootworkPose(actor.gait.footwork,4.9,expression,1.04),first,'Paused or revisited frames retain their exact support pose');
 assert.deepEqual(solver.sampleSalonPose(null,0,3.1,expression,1.04),fresh.sampleSalonPose(null,0,3.1,expression,1.04));
 solver.sampleFootworkPose(actor.gait.footwork,4.9,expression,1.04);
 solver.expression=fresh.expression=expression;solver.travelPose(.37,.7,0);fresh.travelPose(.37,.7,0);
 assert.deepEqual(solver.bones(),fresh.bones(),'Ordinary walking discards the directed contact targets');
});

test('wardrobe changes keep both actors in the same place and orientation',()=>{
 const line=lines.find(l=>l.id==='dojo-vetements'),initial=sample(line,0).blocking;
 for(let i=0;i<=120;i++)for(const id of ['m','f']){
  const actor=sample(line,i*line.ms/120).blocking[id];
  assert.deepEqual(actor.position.toArray(),initial[id].position.toArray());
  assert.equal(actor.yaw,initial[id].yaw);assert.equal(actor.gait.strength,0);
 }
});

test('blocking joins every shot without translating actors and gives both an exchanged look',()=>{
 let prior=null;
 for(const line of lines){
  const start=sample(line,0).blocking,end=sample(line,line.ms).blocking;
  if(prior)for(const id of ['m','f'])assert.ok(prior[id].position.distanceTo(start[id].position)<1e-10,line.id+' starts at the previous mark');
  prior=end;
  for(const id of ['m','f'])assert.ok(Math.abs(sample(line,line.ms*.5).blocking[id].headYaw)>.1,'The actors direct their gaze instead of staring ahead');
 }
 const response=sample(lines.find(l=>l.id==='dojo-construction'),6000).blocking;
 assert.ok(response.m.poseGesture.right>.1&&response.f.poseGesture.nod>.025,'Invitation and acknowledgement have visible articulation');
});

test('camera has wide, American, medium, close and detail shots while remaining inside',()=>{
 const framings=new Set();
 for(const aspect of [16/9,4/3,390/730,320/600,844/285])for(const line of lines)for(let i=0;i<=24;i++){
  const {frame,actors,headPosition}=sample(line,i*line.ms/24,aspect);framings.add(frame.framing);
  assert.ok(bounds.containsPoint(frame.eye),'The camera remains inside for '+line.id);
  assert.ok(Number.isFinite(frame.fov)&&frame.fov>=29&&frame.fov<=108);
  const camera=new T.PerspectiveCamera(frame.fov,aspect,.07,120);camera.position.copy(frame.eye);camera.lookAt(frame.aim);camera.updateMatrixWorld(true);
  const subjects=Array.isArray(frame.subject)?frame.subject:[frame.subject];
  for(const actor of actors.filter(a=>subjects.includes(a.id))){
   const head=headPosition(actor).project(camera);
   assert.ok(Math.abs(head.x)<.9&&Math.abs(head.y)<.9&&head.z<1,'The shot subject remains framed: '+line.id);
  }
 }
 assert.deepEqual([...framings].sort(),['american','close','detail','medium','wide']);
 const american=lines.find(l=>l.id==='dojo-personnaliser');
 for(const aspect of [16/9,390/730]){
  const {frame,actors}=sample(american,american.ms*.5,aspect),camera=new T.PerspectiveCamera(frame.fov,aspect,.07,120);
  camera.position.copy(frame.eye);camera.lookAt(frame.aim);camera.updateMatrixWorld(true);
  const actor=actors.find(a=>a.id==='m'),feet=actor.root.position.clone().project(camera);
  assert.ok(feet.y< -1,'An American shot crops the feet, instead of merely renaming a full-body view');
 }
 const close=lines.find(l=>l.id==='dojo-apparence');
 const a=sample(close,0).frame,b=sample(close,close.ms).frame;
 assert.ok(b.eye.distanceTo(b.aim)<a.eye.distanceTo(a.aim)*.75,'The close-up visibly approaches the face');
 const orbit=lines.find(l=>l.id==='dojo-camera'),start=sample(orbit,0).frame,end=sample(orbit,orbit.ms).frame;
 const az=f=>Math.atan2(f.eye.x-f.aim.x,f.eye.z-f.aim.z);
 assert.ok(Math.abs(Math.atan2(Math.sin(az(end)-az(start)),Math.cos(az(end)-az(start))))>2.8,'The camera makes a visible160-degree orbit');
});

test('portrait close-ups leave the lower control strip clear of Marianne’s complete face',()=>{
 const line=lines.find(l=>l.id==='dojo-apparence');
 for(const [width,height]of [[390,690],[320,600]])for(let i=0;i<=120;i++){
  const {frame,actors,headPosition}=sample(line,line.ms*i/120,width/height);
  const camera=new T.PerspectiveCamera(frame.fov,width/height,.07,120);camera.position.copy(frame.eye);camera.lookAt(frame.aim);camera.updateMatrixWorld(true);
  const up=new T.Vector3().setFromMatrixColumn(camera.matrixWorld,1),head=headPosition(actors.find(a=>a.id==='f'));
  const chin=head.addScaledVector(up,-.23*1.04).project(camera),bottom=(1-chin.y)*height/2+14;
  assert.ok(bottom<height-100,'The close-up leaves space below the chin for the appearance controls');
 }
});

test('the body transformation stays visible before the camera approaches Marianne’s face',()=>{
 const line=lines.find(l=>l.id==='dojo-apparence');
 for(const aspect of [16/9,390/690,320/600,640/240]){
  for(const at of [1600,1800,2200,4400]){
   const {frame,actors}=sample(line,at,aspect),actor=actors.find(a=>a.id==='f');
   const camera=new T.PerspectiveCamera(frame.fov,aspect,.07,120);camera.position.copy(frame.eye);camera.lookAt(frame.aim);camera.updateMatrixWorld(true);
   // Both sides of the hips and shoulders are present before and after the
   // real body variant switches; a face-only shot cannot satisfy this.
   const right=new T.Vector3().setFromMatrixColumn(camera.matrixWorld,0);
   for(const y of [.84,1.30])for(const side of [-.27,.27]){
    const p=actor.root.position.clone();p.y+=y;p.addScaledVector(right,side).project(camera);
    assert.ok(Math.abs(p.x)<.86&&Math.abs(p.y)<.86,'The changing body is visible at '+at+'ms, aspect '+aspect);
   }
   assert.equal(frame.framing,'american');
  }
  assert.equal(sample(line,9000,aspect).frame.framing,'detail');
  let previous=sample(line,4400,aspect).frame;
  for(let at=4416;at<=9400;at+=16){
   const current=sample(line,at,aspect).frame;
   assert.ok(current.eye.distanceTo(previous.eye)<.02,'The approach is continuous, without an unannounced cut');
   assert.ok(current.aim.distanceTo(previous.aim)<.006,'The subject rises into the close-up smoothly');
   previous=current;
  }
 }
});

// The room's real walls and pillars remain part of this regression. Removing
// image decoding is the only asset change; every original triangle is retained.
const original=Buffer.concat(Array.from({length:17},(_,i)=>readFileSync(new URL('../assets-source/intro-original/dojo/'+String(i).padStart(3,'0')+'.bin',import.meta.url))));
const jsonSize=original.readUInt32LE(12),json=JSON.parse(original.subarray(20,20+jsonSize));
for(const mesh of json.meshes)for(const p of mesh.primitives)delete p.material;
for(const key of ['materials','images','textures','samplers','extensionsUsed','extensionsRequired'])delete json[key];
const encoded=Buffer.from(JSON.stringify(json)),length=(encoded.length+3)&~3,tail=original.subarray(20+jsonSize),raw=Buffer.alloc(20+length+tail.length,32);
original.copy(raw,0,0,20);raw.writeUInt32LE(raw.length,8);raw.writeUInt32LE(length,12);encoded.copy(raw,20);tail.copy(raw,20+length);
const room=(await new GLTFLoader().parseAsync(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength),'')).scene;
let tatami;room.traverse(o=>{if(!tatami&&/tatami/i.test(o.name))tatami=o;});
room.updateMatrixWorld(true);room.position.y+=floor.max.y-new T.Box3().setFromObject(tatami).max.y;room.updateMatrixWorld(true);
const walls=[];room.traverse(o=>{if(o.isMesh){o.material.side=T.DoubleSide;if(!/transparent.*glass/i.test(o.name))walls.push(o);}});

test('the original dojo walls never block the subjects during the directed camera paths',()=>{
 for(const aspect of [16/9,390/730])for(const line of lines)for(let i=0;i<=12;i++){
  const {frame,actors,headPosition}=sample(line,i*line.ms/12,aspect),subjects=Array.isArray(frame.subject)?frame.subject:[frame.subject];
  for(const actor of actors.filter(a=>subjects.includes(a.id))){
   const point=headPosition(actor),v=point.sub(frame.eye);
   const hit=new T.Raycaster(frame.eye,v.clone().normalize(),.03,v.length()-.03).intersectObjects(walls,false)[0];
   assert.equal(hit,undefined,line.id+' sightline to '+actor.id+' hit '+hit?.object.name);
  }
 }
});
