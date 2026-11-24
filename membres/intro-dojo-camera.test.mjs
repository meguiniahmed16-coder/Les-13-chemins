import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root));
const source=read('membres/intro-cinema.js').toString();
const original=Buffer.concat(Array.from({length:17},(_,i)=>read('assets-source/intro-original/dojo/'+String(i).padStart(3,'0')+'.bin')));
// Keep every original triangle and transform; image decoding has no bearing on
// whether the camera and actors are inside the building or hidden by a wall.
function geometryOnly(input){
 const size=input.readUInt32LE(12),json=JSON.parse(input.subarray(20,20+size));
 for(const mesh of json.meshes)for(const primitive of mesh.primitives)delete primitive.material;
 for(const field of ['materials','textures','images','samplers','extensionsUsed','extensionsRequired'])delete json[field];
 const text=Buffer.from(JSON.stringify(json)),length=(text.length+3)&~3,tail=input.subarray(20+size),out=Buffer.alloc(20+length+tail.length,32);
 input.copy(out,0,0,20);out.writeUInt32LE(out.length,8);out.writeUInt32LE(length,12);text.copy(out,20);tail.copy(out,20+length);
 return out.buffer.slice(out.byteOffset,out.byteOffset+out.byteLength);
}
const dojo=(await new GLTFLoader().parseAsync(geometryOnly(original),'')).scene;
const align=new Function('T',source.slice(source.indexOf('function alignDojoFloor('),source.indexOf('function prepareDojo('))+'return alignDojoFloor;')(T);
const floor=align(dojo),opaque=[];
dojo.traverse(o=>{if(o.isMesh){o.material.side=T.DoubleSide;if(!/transparent.*glass/i.test(o.name))opaque.push(o);}});
const targetLayout=new Function('T','dojo',source.slice(source.indexOf('function targetLayout('),source.indexOf('let movement='))+'return targetLayout;')(T,dojo);
const people=['m','f'].map(id=>{
 const person={id,root:new T.Group()},layout=targetLayout(person,false,true);
 person.root.position.copy(layout.pos);person.root.rotation.y=layout.yaw;return person;
});
const actorHead=p=>p.root.position.clone().add(new T.Vector3(0,p.id==='m'?1.60:1.55,0));
const camera=new T.PerspectiveCamera(46,16/9,.07,120);
const controls=new Function('T','dojo','people','actorHead','camera',`
 let angle=Math.PI,targetAngle=Math.PI,radius=3.7,cutCamera=true;
 const shotAim=new T.Vector3(),shotEye=new T.Vector3(),smoothAim=new T.Vector3(0,.9,0),smoothEye=new T.Vector3(0,2.37,-20);
 ${source.slice(source.indexOf('function dojoCameraFrame('),source.indexOf('async function showScene('))}
 return {
  step(azimuth,distance,aspect,cut=true){targetAngle=azimuth;radius=distance;camera.aspect=aspect;cutCamera=cut;if(cut)angle=azimuth;cameraShot({shot:'dojo',ms:6500},0,1/60);return {eye:camera.position.clone(),aim:smoothAim.clone(),fov:camera.fov};},
  reset(){angle=targetAngle=Math.PI;smoothEye.set(0,2.37,-20);smoothAim.set(0,.9,0);}
 };
`)(T,dojo,people,actorHead,camera);

function assertSight(eye,point,label){
 const delta=point.clone().sub(eye),ray=new T.Raycaster(eye,delta.clone().normalize(),.01,delta.length()-.02);
 const hits=ray.intersectObjects(opaque,false);
 assert.equal(hits.length,0,label+' must have a clear line of sight; obstruction: '+hits[0]?.object.name);
}
function assertFrame(frame){
 assert.ok(dojo.userData.introCameraBounds.containsPoint(frame.eye),'Camera remains in the measured interior');
 for(const person of people){
  assert.ok(frame.eye.z<person.root.position.z-.7,'Camera stays on the front side of both actors');
  assertSight(frame.eye,actorHead(person),person.id+' face');
  assertSight(frame.eye,person.root.position.clone().setY(.95),person.id+' torso');
  for(const x of [-.4,.4])for(const z of [-.28,.28])for(const y of [floor.max.y,actorHead(person).y+.20]){
   const p=new T.Vector3(person.root.position.x+x,y,person.root.position.z+z).project(camera);
   assert.ok(Math.abs(p.x)<=.881&&Math.abs(p.y)<=.881&&p.z<1,'Full actor envelope fits the canvas with margin');
  }
 }
}

test('Dojo aligns the actual tatami with the existing actors, not the foundations',()=>{
 assert.ok(Math.abs(floor.max.y+.003)<.000001);
 assert.ok(Math.abs(dojo.position.y-.021)<.00001,'Expected measured source-floor correction is about +21 mm');
 for(const person of people){
  const p=person.root.position,ray=new T.Raycaster(new T.Vector3(p.x,.2,p.z),new T.Vector3(0,-1,0),0,.4),hit=ray.intersectObjects(opaque,false)[0];
  assert.ok(hit&&/tatami/i.test(hit.object.name));assert.ok(Math.abs(hit.point.y+.003)<.00001);
 }
 const walk=dojo.userData.introWalkBounds;
 for(const x of [walk.min.x,walk.max.x])for(const z of [walk.min.z,walk.max.z]){
  const hit=new T.Raycaster(new T.Vector3(x,.2,z),new T.Vector3(0,-1,0),0,.4).intersectObjects(opaque,false)[0];
  assert.ok(hit&&/tatami/i.test(hit.object.name),'Joystick bounds stay over the real tatami');
 }
});

test('Desktop and portrait dojo shots remain inside with unobstructed actors throughout the drag arc',()=>{
 for(const aspect of [16/9,4/3,1,390/732,360/688,320/740])for(const offset of [-.68,-.34,0,.34,.68])for(const radius of [3,3.7,6]){
  assertFrame(controls.step(Math.PI+offset,radius,aspect));
 }
});

test('Dojo entry cuts inside and the smoothed camera path never travels through the walls',()=>{
 controls.reset();assertFrame(controls.step(Math.PI,3.7,390/732));
 for(let i=0;i<120;i++)assertFrame(controls.step(Math.PI+(i<60?.68:-.68),6,390/732,false));
});

if(process.env.INTRO_DOJO_CAPTURE_OUT){
 const views=[['desktop',16/9,1280,720],['portrait',390/732,390,732]].map(([name,aspect,width,height])=>({name,width,height,...controls.step(Math.PI,3.7,aspect)}));
 writeFileSync(process.env.INTRO_DOJO_CAPTURE_OUT,JSON.stringify({translation:dojo.position.toArray(),floor:{min:floor.min.toArray(),max:floor.max.toArray()},actors:people.map(p=>({id:p.id,origin:p.root.position.toArray(),yaw:p.root.rotation.y})),views},null,2));
}
