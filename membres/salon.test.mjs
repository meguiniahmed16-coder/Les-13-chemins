import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {seats,walkable} from './salon-plan.js';
import {SalonMotion,seatAt,cameraProjection,orbitCamera,moveCamera,zoomCamera} from './salon-navigation.js';

function until(motion,done) {
  for(let frame=0;frame<1500;frame++){motion.update(1/60);if(done())return;}
  assert.fail('Le personnage reste dans la phase '+motion.mode);
}
test('Chaque assise est accessible depuis les neuf autres et permet de reprendre la marche',()=>{
  for(const destination of seats){
    const motion=new SalonMotion();
    for(const other of seats){
      for(const s of [other,destination]){
        motion.goToSeat(s);
        until(motion,()=>motion.mode==='seated'&&motion.seat===s);
        assert.deepEqual([motion.x,motion.z,motion.sit],[s.x,s.z,1]);
        assert.ok(Math.abs(Math.sin(motion.yaw-s.yaw))<.001);
      }
    }
    motion.stick(-1,0);
    until(motion,()=>motion.mode==='idle');
    assert.ok(walkable(motion.x,motion.z));
    assert.equal(motion.sit,0);
  }
});
test('Interrompre une approche ou une assise rend la main au joystick dans une zone libre',()=>{
  for(const phase of ['approach','docking','align','lowering','seated']){
    const m=new SalonMotion();m.goToSeat(seats[8]);until(m,()=>m.mode===phase);
    m.stick(0,1);until(m,()=>m.mode==='idle');assert.ok(walkable(m.x,m.z));
    for(let i=0;i<180;i++){m.update(1/30);assert.ok(walkable(m.x,m.z));}
  }
});
test('Un toucher sur le coussin réel de chaque siège sélectionne la bonne place',()=>{
  const room=gunzipSync(readFileSync(new URL('../assets/membres/salon.bin',import.meta.url)));
  const bytes=room.buffer.slice(room.byteOffset,room.byteOffset+room.byteLength);
  for(const seat of seats){
    const c={x:seat.x,y:seat.height,z:seat.z,angle:seat.yaw,pitch:1.2,zoom:1};
    assert.equal(seatAt(bytes,c,840,440,420,220)?.id,seat.id);
  }
});
test('La caméra peut pivoter, se déplacer et zoomer indépendamment du personnage',()=>{
  const m=new SalonMotion(),c=m.camera;
  orbitCamera(c,210,80);orbitCamera(c,65,-9000);
  assert.ok(c.pitch>0);assert.ok(cameraProjection(390,650,false,c).sp>0);
  const start={...c};moveCamera(c,80,55,390,650);assert.notEqual(c.x,start.x);assert.equal(c.follow,false);
  zoomCamera(c,1.5);assert.ok(c.zoom>start.zoom);assert.deepEqual([m.x,m.z,m.yaw],[0,0,.11]);
});
