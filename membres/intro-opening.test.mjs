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
 assert.ok(Math.abs(Math.hypot(a.pos.x-b.pos.x,a.pos.z-b.pos.z)-2.56)<1e-9);
});
test('dialogue reverse shots stay on one side of the actors and face the speaker',()=>{
 const code=source.slice(source.indexOf('function exchangeFrame('),source.indexOf('function discoveryFrame('));
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

test('reference blocking: opening pullback and orbit before furniture, guide approach next',()=>{
 assert.equal(shots[0].shot,'discovery');assert.equal(shots[1].shot,'approach');
 const code=source.slice(source.indexOf('function discoveryFrame('),source.indexOf('function cameraShot('));
 const helpers=new Function('T','actorHead',code+'\nreturn {discoveryFrame,guideApproachFrame};')({Vector3,MathUtils:{lerp:(a,b,t)=>a+(b-a)*t,smoothstep:(x,a,b)=>{const u=Math.max(0,Math.min(1,(x-a)/(b-a)));return u*u*(3-2*u);}}},p=>p.head.clone());
 const visitor={head:new Vector3(1.28,1.56,.88)},guide={head:new Vector3(-1.28,1.65,.88)};
 for(const aspect of [.45,1,1.78]){
  const htan=Math.tan(23*Math.PI/180)*aspect;
  const first=helpers.discoveryFrame(visitor,guide,0,htan),last=helpers.discoveryFrame(visitor,guide,1,htan);
  assert.ok(last.eye.distanceTo(visitor.head)>first.eye.distanceTo(visitor.head));
  assert.ok(Math.abs(last.roll)<1e-9);assert.ok(first.roll>1.5);
  assert.ok(last.eye.z<visitor.head.z);
  const far=helpers.guideApproachFrame(visitor,guide,0,htan),near=helpers.guideApproachFrame(visitor,guide,1,htan);
  assert.ok(near.eye.distanceTo(guide.head)<far.eye.distanceTo(guide.head));
  assert.ok(last.eye.distanceTo(far.eye)<1e-8,'No camera jump between discovery and approach');
  assert.ok(last.aim.distanceTo(far.aim)<1e-8);
  const view=last.aim.clone().sub(last.eye);view.y=0;view.normalize();
  const direction=guide.head.clone().sub(last.eye);direction.y=0;direction.normalize();
  assert.ok(view.dot(direction)>Math.cos(Math.atan(htan)),'Guide must remain inside the horizontal portrait framing');
 }
});

test('seating uses the live wardrobe solver, not the old sofa mesh deltas',()=>{
 assert.match(source,/await dressAhmed\(instance,rig\?\.bones/);
 assert.match(source,/await createMarianne\(root,body\)/);
 assert.match(source,/introArms:arms/);
 assert.match(source,/person\.root\.position\.lerpVectors\(from,standing\.pos,walk\);/);
 assert.doesNotMatch(source,/\/membres\/v27\/assises\.bin/);
 const wardrobe=readFileSync(new URL('./intro-wardrobe.js',import.meta.url),'utf8');
 assert.match(wardrobe,/haut:'mh1800',bas:'mh1796',souliers:'mh438'/);
 assert.match(wardrobe,/haut:'mh22',bas:'mh391',souliers:'mh1734'/);
 assert.match(wardrobe,/loadStudio\(look,'femme'\)/);
 assert.match(wardrobe,/old\.removeFromParent\(\)/);
});

test('cinematic co-speech: independent listening, unilateral strokes and return to rest',()=>{
 const body=source.slice(source.indexOf('function conversationGesture('),source.indexOf('let speech=null'));
 const gesture=new Function(body+'\nreturn conversationGesture;')();
 const settings={text:'Qu’est-ce qu’une rencontre ? Qu’est-ce que véritablement l’autre ?',kind:'question',duration:7.8,seed:'question-initiale'};
 let peak=0,acknowledgment=0;
 for(let t=0;t<7.8;t+=.02){
  const a=gesture({...settings,id:'m',speaking:true,time:t});
  const b=gesture({...settings,id:'f',speaking:false,listenerTime:t});
  assert.equal(b.left+b.right,0);
  assert.ok(Math.min(a.left,a.right)<.0001,'no symmetric flapping');
  peak=Math.max(peak,a.right,a.left);acknowledgment=Math.max(acknowledgment,b.nod);
 }
 assert.ok(peak>.25);assert.ok(acknowledgment>.02);
 for(const t of [0,7.8,9]){
  const a=gesture({...settings,id:'m',speaking:true,time:t});
  assert.equal(a.left+a.right,0);
 }
 const quiet=gesture({...settings,id:'f',speaking:true,time:1,enabled:false});
 assert.equal(quiet.left+quiet.right,0);
 const female=gesture({...settings,id:'f',speaking:true,time:.9});
 const male=gesture({...settings,id:'m',speaking:true,time:.9});
 assert.ok(female.left>=female.right&&male.right>=male.left);
});
