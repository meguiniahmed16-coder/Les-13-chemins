import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {CELL,createPrisonRoom} from './prison-3d-room.js';
import {createPrisonCamera,PRISON_TOUR_DURATION} from './prison-3d-camera.js';

// Exercise the actual geometry and camera on the CPU, without replacing the
// app's renderer or evaluating its source. WebGL and image quality need their
// own browser checks; these tests protect the closed room and its sightlines.
function setup(width,height){
 const room=createPrisonRoom({textures:false});
 const camera=new T.PerspectiveCamera(65,width/height,.025,30);
 const view=createPrisonCamera(camera);
 room.scene.updateMatrixWorld(true);
 return {...room,camera,view};
}

function isVisible(object){
 for(let item=object;item;item=item.parent)if(!item.visible)return false;
 const materials=Array.isArray(object.material)?object.material:[object.material];
 return materials.every(material=>!material||material.visible!==false&&material.opacity>0);
}

function visibleHits(ray,objects){
 // Three's Raycaster ignores Object3D.visible, whereas the renderer hides
 // descendants of invisible groups. Apply the renderer's visibility rule.
 return ray.intersectObjects(Array.isArray(objects)?objects:[objects],true)
  .filter(hit=>isVisible(hit.object));
}

function bounds(object){return new T.Box3().setFromObject(object);}

function structuralParts(room){
 const left=room.scene.getObjectByName('MurGauche');
 const right=room.scene.getObjectByName('MurDroit');
 const ceiling=room.scene.getObjectByName('Plafond');
 const floor=room.scene.getObjectByName('SolCellule9m2');
 // The rear wall is built around a real opening, not a transparent wall.
 const back=room.scene.children.filter(object=>object.isMesh&&
  object.material===room.materials.plaster&&bounds(object).max.z<-1.4);
 assert.ok(left?.isMesh&&right?.isMesh&&floor?.isMesh&&ceiling?.isMesh);
 assert.ok(room.frontWall?.isGroup);
 assert.equal(back.length,4,'The rear wall has a lower panel, lintel and two window jambs');
 return {left,right,back,front:room.frontWall,ceiling,floor};
}

function assertWallSurface(objects,origin,direction,message){
 const ray=new T.Raycaster(new T.Vector3(...origin),new T.Vector3(...direction),0,.7);
 assert.ok(visibleHits(ray,objects).length>0,message);
}

function assertFourClosedWalls(parts){
 for(const y of [.2,1.3,2.5])for(const along of [-1.3,0,1.3]){
  assertWallSurface(parts.left,[-1.15,y,along],[-1,0,0],'The left wall is solid');
  assertWallSurface(parts.right,[1.15,y,along],[1,0,0],'The right wall is solid');
 }
 for(const y of [.2,1.3,2.5])for(const x of [-1.3,0,.83,1.4])
  assertWallSurface(parts.front,[x,y,1.1],[0,0,1],'The front wall and closed door seal the room');
 for(const y of [.25,.8,2.55])for(const x of [-1.3,0,1.3])
  assertWallSurface(parts.back,[x,y,-1.1],[0,0,-1],'The rear wall surrounds the barred opening');
 for(const x of [-1.2,1.2])
  assertWallSurface(parts.back,[x,1.65,-1.1],[0,0,-1],'Both window jambs remain solid');
}

function assertCameraInterior(camera,parts,door){
 const minX=bounds(parts.left).max.x,maxX=bounds(parts.right).min.x;
 const minY=bounds(parts.floor).max.y,maxY=bounds(parts.ceiling).min.y;
 const minZ=Math.max(...parts.back.map(object=>bounds(object).max.z));
 const maxZ=bounds(door).min.z;
 const points=[camera.position];
 // A position alone can be inside while a wide camera's near plane clips a
 // wall. Include all four near-plane corners for each actual aspect ratio.
 for(const x of [-1,1])for(const y of [-1,1])
  points.push(new T.Vector3(x,y,-1).unproject(camera));
 for(const point of points){
  assert.ok(point.x>minX&&point.x<maxX,'The camera and near plane stay between the side walls');
  assert.ok(point.z>minZ&&point.z<maxZ,'The camera stays inside the rear wall and closed door');
  assert.ok(point.y>minY&&point.y<maxY,'The camera never crosses the floor or ceiling');
 }
}

for(const [label,width,height] of [['portrait',390,720],['landscape',1000,625]]){
 test('The '+label+' tour stays inside four intact walls and shows the closed door',()=>{
  const room=setup(width,height),parts=structuralParts(room);
  const {camera,view,scene,door}=room;
  assert.ok(door.isMesh&&door.parent===room.frontWall,'The real door belongs to the front wall');
  const doorBounds=bounds(door),doorSize=doorBounds.getSize(new T.Vector3());
  assert.ok(doorSize.x>.8&&doorSize.y>2.2&&doorSize.z<.08,
   'The door fills its opening on the front plane instead of swinging open');
  assertFourClosedWalls(parts);
  const fixed=[];
  for(const object of [parts.left,parts.right,...parts.back,parts.front,parts.ceiling,parts.floor])
   object.traverse(item=>fixed.push([item,item.matrixWorld.clone()]));
  view.startTour();
  let sawDoor=false;
  const frames=Math.ceil(PRISON_TOUR_DURATION*20);
  for(let frame=0;frame<=frames;frame++){
   if(frame)view.update(1/20);
   scene.updateMatrixWorld(true);
   assertCameraInterior(camera,parts,door);
   for(const [object,matrix] of fixed){
    assert.ok(isVisible(object),'No wall, ceiling, door or fitting is hidden for the tour');
    assert.deepEqual(object.matrixWorld.elements,matrix.elements,
     'Changing the viewpoint must not move or rotate the room structure');
   }
   const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(0,0),camera);
   if(visibleHits(ray,scene)[0]?.object===door)sawDoor=true;
  }
  assert.equal(view.mode,'playing');
  assert.ok(sawDoor,'The cinematic visibly looks at the closed door from inside');
  assert.deepEqual(bounds(door),doorBounds,'The door remains closed after the tour');
  assertFourClosedWalls(parts);
 });

 test('The '+label+' first-person window view is clear between the bars and below the ceiling',()=>{
  const room=setup(width,height),parts=structuralParts(room);
  const {camera,view,scene,door}=room;
  view.skipTour();
  for(const stage of ['standing','at-window']){
   if(stage==='at-window'){
    for(let frame=0;frame<240;frame++)view.update(1/60,{phase:1});
    assert.equal(view.isTravelling,false,'The approach finishes in front of the window');
   }
   assertCameraInterior(camera,parts,door);
   for(const x of [-.145,-.105,-.065])for(const y of [1.35,1.55,1.75]){
    const point=new T.Vector3(x,y,-1.76);
    const projected=point.clone().project(camera);
    assert.ok(Math.abs(projected.x)<1&&Math.abs(projected.y)<1&&projected.z>-1&&projected.z<1,
     'The usable window gap remains on screen '+stage);
    const direction=point.clone().sub(camera.position);
    const ray=new T.Raycaster(camera.position,direction.clone().normalize(),0,direction.length());
    const hits=visibleHits(ray,scene);
    assert.equal(hits.length,0,
     'The gap is not obscured by a wall, furniture or a bar '+stage+': '+hits.map(hit=>hit.object.name));
   }
  }
  view.reset();view.skipTour();view.update(0,{lookY:-1e6});
  assertCameraInterior(camera,parts,door);
  const up=new T.Raycaster();up.setFromCamera(new T.Vector2(0,0),camera);
  assert.equal(visibleHits(up,scene)[0]?.object,parts.ceiling,
   'Looking up shows the real ceiling from its interior face instead of passing through it');
 });
}

test('The 116 mm bag fits the real 210 mm bar spacing with clearance on both sides',()=>{
 const room=setup(390,720),{scene}=room;
 assert.equal(CELL.width*CELL.depth,CELL.area);
 assert.equal(CELL.area,9,'The room retains its nine square metres');
 const bars=[];
 scene.traverse(object=>{if(/^Barreau\d+$/.test(object.name))bars.push(object);});
 bars.sort((a,b)=>a.position.x-b.position.x);
 assert.equal(bars.length,7,'The opening retains all seven vertical bars');
 for(let i=1;i<bars.length;i++){
  const left=bounds(bars[i-1]),right=bounds(bars[i]);
  const spacing=right.getCenter(new T.Vector3()).x-left.getCenter(new T.Vector3()).x;
  assert.ok(Math.abs(spacing-.21)<1e-6,'Adjacent bar centres are 210 mm apart');
  assert.ok(Math.abs((right.min.x-left.max.x)-.174)<1e-6,
   'The actual 36 mm bars leave a 174 mm clear gap');
 }
 const bag=scene.getObjectByName('SacPlastique');
 assert.ok(bag?.isMesh,'The passing bag is a real mesh');
 const bagBounds=bounds(bag),size=bagBounds.getSize(new T.Vector3());
 assert.ok(Math.abs(size.x-.116)<1e-6&&Math.abs(size.z-.116)<1e-6,
  'The widest bag diameter is 116 mm in either horizontal direction');
 const bagCenter=bagBounds.getCenter(new T.Vector3());
 const left=bars.filter(bar=>bounds(bar).max.x<bagCenter.x).at(-1);
 const right=bars.find(bar=>bounds(bar).min.x>bagCenter.x);
 assert.ok(left&&right,'The bag is aligned with a real interval between two bars');
 const leftBounds=bounds(left),rightBounds=bounds(right);
 assert.ok(bagBounds.min.x-leftBounds.max.x>.0289&&rightBounds.min.x-bagBounds.max.x>.0289,
  'The centred bag has at least 29 mm of clearance on each side');
 // Sweep the bag's actual bounds from outside to inside the bar plane. The
 // finite diameter, not a point-sized centre, must clear both neighbours.
 for(let z=-1.95;z<=-1.25;z+=.025){
  const crossing=bagBounds.clone().translate(new T.Vector3(0,0,z-bagCenter.z));
  assert.equal(crossing.intersectsBox(leftBounds),false,'The bag must not cross the left bar');
  assert.equal(crossing.intersectsBox(rightBounds),false,'The bag must not cross the right bar');
 }
});
