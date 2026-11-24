import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Group,Scene,Object3D,Vector3} from 'three';
const source=readFileSync(new URL('./intro-cinema.js',import.meta.url),'utf8');
const start=source.indexOf('const lines=')+'const lines='.length;
const shots=JSON.parse(source.slice(start,source.indexOf(';\nconst dojoStart',start)));
const fragment=source.slice(source.indexOf('function mountRoom('),source.indexOf('function beginInvitation('));
function setup(){
 const scene=new Scene(),room=new Group(),a=new Object3D(),b=new Object3D(),tv=new Object3D(),unknown=new Object3D();
 a.name='RED CHAIR_232';b.name='BLUE CHAIR_215';tv.name='TV_284';unknown.name='unrecognized-furniture';
 room.add(a,b,tv,unknown);scene.add(room);
 const furnitureAt=new Function('room','scene','chairs',fragment+'\nreturn furnitureAt;')(room,scene,[a,b,tv]);
 return {scene,room,a,b,tv,unknown,furnitureAt};
}
test('opening: no furniture in the rendered scene, not even unnamed meshes',()=>{
 const x=setup(),opening=shots.slice(0,shots.findIndex(s=>s.invitation));
 assert.ok(opening.length>=3);
 for(const shot of opening){assert.equal(shot.seated,false);assert.equal(shot.furniture,'none');x.furnitureAt(shot,shot.ms);assert.equal(x.room.parent,null);assert.equal(x.scene.getObjectByName('unrecognized-furniture'),undefined);}
});
test('only reveal the room after the invitation; television waits for its scene',()=>{
 const x=setup(),invitation=shots.find(s=>s.invitation);
 x.furnitureAt(invitation,649);assert.equal(x.room.parent,null);
 x.furnitureAt(invitation,650);assert.equal(x.room.parent,x.scene);assert.equal(x.a.visible,true);assert.equal(x.b.visible,true);assert.equal(x.tv.visible,false);
 x.furnitureAt(shots.find(s=>s.shot==='rear'),0);assert.equal(x.tv.visible,true);
 x.furnitureAt(shots[0],0);assert.equal(x.room.parent,null);
});
test('preloaded GLB is not attached to the opening scene',()=>{
 const body=source.slice(source.indexOf('async function loadWhite()'),source.indexOf('function prepareDojo()'));
 assert.match(body,/scene\.add\(whiteFloor\)/);
 assert.match(body,/room\.removeFromParent\(\)/);
 assert.doesNotMatch(body,/scene\.add\(room/);
});

test('the two standing actors actually face one another, and not outwards',()=>{
 const code=source.slice(source.indexOf('function facingYaw('),source.indexOf('function targetLayout('));
 const openingLayout=new Function('T',code+'\nreturn openingLayout;')({Vector3});
 const a=openingLayout('m'),b=openingLayout('f');
 for(const [self,other] of [[a,b],[b,a]]){
  const front=new Vector3(Math.sin(self.yaw),0,Math.cos(self.yaw));
  const toward=other.pos.clone().sub(self.pos).normalize();
  assert.ok(front.dot(toward)>.999,'Actor forward direction must point at partner');
  assert.equal(self.sit,0);
 }
 assert.ok(Math.abs(a.pos.distanceTo(b.pos)-1.48)<1e-9);
});
test('dialogue reverse shots stay on one side of the actors and face the speaker',()=>{
 const code=source.slice(source.indexOf('function exchangeFrame('),source.indexOf('function cameraShot('));
 const frame=new Function('T','actorHead',code+'\nreturn exchangeFrame;')({Vector3},p=>p.head.clone());
 const a={id:'m',head:new Vector3(-.74,1.65,.22)},b={id:'f',head:new Vector3(.74,1.58,.22)};
 for(const [self,other] of [[a,b],[b,a]])for(const aspect of [.48,1,1.7]){
  const v=frame(self,other,true,.5,Math.tan(23*Math.PI/180)*aspect,'push');
  const forward=other.head.clone().sub(self.head);forward.y=0;forward.normalize();
  const view=v.eye.clone().sub(self.head);view.y=0;
  assert.ok(view.dot(forward)>0,'Camera must see the front of the actor');
  assert.ok(v.eye.z<self.head.z,'Reverse cuts must stay on the same side of the line');
 }
});
