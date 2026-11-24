import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Group,Scene,Object3D} from 'three';
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
