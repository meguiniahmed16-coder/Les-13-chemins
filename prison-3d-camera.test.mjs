import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Box3,PerspectiveCamera,Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {createPrisonCamera,PRISON_CAMERA_COLLIDERS,PRISON_TOUR_DURATION} from './prison-3d-camera.js';
import {createPrisonRoom} from './prison-3d-room.js';

function setup(options){
 const camera=new PerspectiveCamera(65,390/720,.025,30);
 return {camera,view:createPrisonCamera(camera,options)};
}
function advance(view,seconds,input={},fps=60){
 for(let i=0;i<Math.round(seconds*fps);i++)view.update(1/fps,input);
}
function assertInterior(player){
 assert.ok(player.x>-1.5&&player.x<1.5);
 assert.ok(player.z>-1.5&&player.z<1.47,'The eye stays inside the closed front door');
 assert.ok(player.y>1&&player.y<2);
 for(const box of PRISON_CAMERA_COLLIDERS)
  assert.ok(!(player.x>box.minX-.139&&player.x<box.maxX+.139&&
   player.z>box.minZ-.139&&player.z<box.maxZ+.139),'Eye entered '+box.name);
}

test('The cinematic visits the cell from inside and ends once at the prisoner eyes',()=>{
 let ended=0;const {camera,view}=setup({onTourEnd:()=>ended++});
 view.startTour();let sawClosedDoor=false;
 for(let i=0;i<PRISON_TOUR_DURATION*120;i++){
  view.update(1/120);assertInterior(view.player);
  if(camera.getWorldDirection(new Vector3()).z>.8)sawClosedDoor=true;
 }
 assert.equal(view.mode,'playing');assert.equal(ended,1);
 assert.ok(sawClosedDoor,'The tour turns back toward the closed door');
 assert.ok(view.player.distanceTo(new Vector3(0,1.62,.75))<1e-9);
 const towardWindow=new Vector3(0,1.48,-1.55).sub(camera.position).normalize();
 assert.ok(camera.getWorldDirection(new Vector3()).dot(towardWindow)>.99999);
 advance(view,1);assert.equal(ended,1);
});

test('Skipping the visit starts the same first-person view without duplicate starts',()=>{
 let ended=0;const {view}=setup({onTourEnd:()=>ended++});
 view.startTour();advance(view,2);view.skipTour();view.skipTour();
 assert.equal(view.mode,'playing');assert.equal(ended,1);
 assert.deepEqual(view.player.toArray(),[0,1.62,.75]);
 view.reset();assert.equal(view.mode,'ready');
});

test('Joystick movement slides along furniture and cannot walk through the walls or door',()=>{
 const {view}=setup();view.skipTour();
 for(const input of [{x:-1},{y:-1},{x:1},{y:1}]){
  for(let i=0;i<500;i++){view.update(1/60,input);assertInterior(view.player);}
 }
 assert.ok(view.player.z<=1.27,'The closed door remains ahead of the camera');
});

test('A reach rotates the actual view toward its object and keeps that gaze afterwards',()=>{
 const {camera,view}=setup();view.skipTour();
 const focus=new Vector3(.46,.9,.6);
 advance(view,1,{focus,lookX:1000,lookY:-1000});
 const towardObject=focus.clone().sub(camera.position).normalize();
 assert.ok(camera.getWorldDirection(new Vector3()).dot(towardObject)>.99999);
 const before=camera.quaternion.clone();view.update(1/60);
 assert.ok(before.angleTo(camera.quaternion)<1e-7,'Releasing the reach does not snap the head away');
});

test('The window transition walks through the centre aisle instead of furniture',()=>{
 const {view}=setup();view.skipTour();
 advance(view,.7,{x:.75});
 for(let i=0;i<300;i++){view.update(1/60,{phase:1});assertInterior(view.player);}
 assert.equal(view.isTravelling,false);
 assert.ok(Math.abs(view.player.x)<.012&&Math.abs(view.player.z+.88)<.012);
 const before=view.player.clone();view.update(1/60,{phase:2});
 assert.ok(view.player.distanceTo(before)<1e-9,'The second bag does not restart the approach');
});

test('Movement and crouch are independent of refresh rate, with camera-relative travel',()=>{
 const a=setup(),b=setup();a.view.skipTour();b.view.skipTour();
 advance(a.view,.5,{x:.3,y:-.5,hide:true},60);
 advance(b.view,.5,{x:.3,y:-.5,hide:true},120);
 assert.ok(a.view.player.distanceTo(b.view.player)<1e-8);
 const c=setup();c.view.skipTour();
 c.view.player.z=1.0;
 c.view.update(0,{lookX:Math.PI/2/.003});
 c.view.update(.1,{y:-1});
 assert.ok(c.view.player.x>.07);
 assert.ok(Math.abs(c.view.player.z-1.0)<1e-8);
});

test('Collision footprints contain the imported stool and actual sanitary ceramics',async()=>{
 const room=createPrisonRoom({textures:false});
 const bytes=fs.readFileSync(new URL('./assets/prison/metal-stool-02.glb',import.meta.url));
 const loader=new GLTFLoader().register(parser=>{
  parser.loadTexture=()=>Promise.resolve(null);return {name:'CPU_COLLISION_GEOMETRY'};
 });
 room.installFurniture(await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),''));
 room.scene.updateMatrixWorld(true);
 for(const [name,colliderName] of [['Tabouret','tabouret'],['WC','wc'],['Lavabo','lavabo']]){
  const bounds=new Box3().setFromObject(room.scene.getObjectByName(name));
  const collider=PRISON_CAMERA_COLLIDERS.find(x=>x.name===colliderName);
  assert.ok(collider.minX<=bounds.min.x&&collider.maxX>=bounds.max.x,`${name}: collision must cover the full real width`);
  assert.ok(collider.minZ<=bounds.min.z&&collider.maxZ>=bounds.max.z,`${name}: collision must cover the full real depth`);
 }
 const {view}=setup();view.skipTour();advance(view,.5,{x:1});
 assert.ok(view.player.x<=.051,'The wide rotated stool stops movement before its near legs');
 assertInterior(view.player);
});
