import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {seats,roomFree} from './salon-plan.js';
import {SalonMotion,newCamera,seatAt,cameraProjection,orbitCamera,moveCamera,zoomCamera} from './salon-navigation.js';

function until(motion,done) {
  for(let frame=0;frame<2500;frame++){motion.update(1/60);if(done())return;}
  assert.fail('Le personnage reste dans la phase '+motion.mode);
}
const newMotion=()=>new SalonMotion(undefined,newCamera());

test('Chaque assise du salon V27 est accessible depuis les neuf autres',()=>{
  for(const destination of seats){
    const motion=newMotion();
    for(const other of seats){
      for(const s of [other,destination]){
        motion.goToSeat(s);
        until(motion,()=>motion.mode==='seated'&&motion.seat===s);
        assert.equal(motion.sit,1);
        // The V27 skeleton sits back from the standing anchor onto the upholstery.
        assert.ok(Math.abs(100*motion.x+700-s.gap*Math.sin(s.yaw)-s.x)<.001);
        assert.ok(Math.abs(100*motion.z-800-s.gap*Math.cos(s.yaw)-s.z)<.001);
        assert.ok(Math.abs(Math.sin(motion.yaw-s.yaw))<.001);
        assert.ok(motion.bones().every(Number.isFinite));
      }
    }
  }
});
test('Le joystick interrompt le trajet ou relève le personnage avant de marcher',()=>{
  for(const phase of ['walk','sitDown','seated']){
    const m=newMotion();m.goToSeat(seats[8]);until(m,()=>m.mode===phase);
    m.stick(0,1);until(m,()=>m.mode==='steer');assert.equal(m.sit,0);
    for(let i=0;i<90;i++){m.update(1/30);assert.ok(roomFree(m.x*100+700,m.z*100-800));}
    m.stick(0,0);until(m,()=>m.mode==='idle');
  }
});
test('Les poignets suivent les avant-bras au repos et les paumes suivent le support en position assise',()=>{
  const m=newMotion(),bones=m.bones();
  for(const [hand,side] of [[4,-1],[7,1]]){
    const direction=(j,v)=>[0,1,2].map(row=>v.reduce((n,x,c)=>n+x*bones[16*j+4*c+row],0));
    const fingers=direction(hand,[side*.27,-.96,-.01]),arm=direction(hand-1,[side*12.06,-18.2,2.31]);
    const angle=Math.acos(fingers.reduce((n,x,i)=>n+x*arm[i],0)/(Math.hypot(...fingers)*Math.hypot(...arm)));
    assert.ok(angle<8*Math.PI/180);
  }
  for(const seat of seats){
    m.goToSeat(seat);until(m,()=>m.mode==='seated');const posed=m.bones();
    const rotate=(joint,v)=>[0,1,2].map(row=>v.reduce((sum,val,c)=>sum+posed[16*joint+row+4*c]*val,0));
    for(const [hand,side] of [[4,-1],[7,1]]){
      const fingers=rotate(hand,[side*.27,-.96,-.01]),arm=rotate(hand-1,[side*12.06,-18.2,2.31]);
      const cosine=fingers.reduce((sum,val,i)=>sum+val*arm[i],0)/(Math.hypot(...fingers)*Math.hypot(...arm));
      assert.ok(cosine>Math.cos(22*Math.PI/180),seat.id+' : flexion du poignet');
      assert.ok(rotate(hand,[-side*.86,-.27,-.42])[1]<-.70,seat.id+' : orientation de la paume');
    }
  }
});
test('Un toucher sur le coussin réel de chaque siège sélectionne la bonne place',()=>{
  const room=gunzipSync(readFileSync(new URL('../assets/membres/salon-v27.bin',import.meta.url)));
  const bytes=room.buffer.slice(room.byteOffset,room.byteOffset+room.byteLength);
  for(const s of seats){
    const c={x:(s.x-700)/100,y:s.height/100,z:(s.z+800)/100,angle:s.yaw,pitch:1.48,zoom:1};
    assert.equal(seatAt(bytes,c,840,440,420,220)?.id,s.id);
  }
});
test('La caméra peut pivoter, se déplacer et zoomer indépendamment du personnage',()=>{
  const m=newMotion(),c=m.camera,start=[m.x,m.z,m.yaw];
  orbitCamera(c,210,80);orbitCamera(c,65,-9000);
  assert.ok(c.pitch>0);assert.ok(cameraProjection(390,650,false,c).sp>0);
  const before={...c};moveCamera(c,80,55,390,650);assert.notEqual(c.x,before.x);assert.equal(c.follow,false);
  zoomCamera(c,1.5);assert.ok(c.zoom>before.zoom);assert.deepEqual([m.x,m.z,m.yaw],start);
});
test('Sur les trois coussins, les épaules restent de niveau, les mains reposent sur les cuisses et les pieds touchent le sol',()=>{
  for(const seat of seats.slice(0,3)){
    const m=newMotion();m.goToSeat(seat);until(m,()=>m.mode==='seated');
    const b=m.bones(),point=(j,v)=>[0,1,2].map(row=>100*b[j*16+12+row]+v.reduce((n,x,k)=>n+x*b[j*16+k*4+row],0));
    const shoulders=[-1,1].map(side=>point(14,[side*17.3,133.6,-5.3]));
    assert.ok(Math.abs(shoulders[0][1]-shoulders[1][1])<3);
    for(const side of [-1,1]){
      const foot=side<0?10:13,hand=side<0?4:7;
      const ankle=point(foot,[side*15.7455,7.8552,-1.8594]),knee=point(foot-1,[side*12.4664,47.2046,-2.4319]);
      const fingers=point(hand,[side*45.26,77.79,-1.07]);
      assert.ok(Math.abs(ankle[1]-7.85)<.2);
      assert.ok(knee[1]>seat.height+4);
      assert.ok(Math.abs(fingers[0]-knee[0])<8);
      assert.ok(fingers[1]-knee[1]>5 && fingers[1]-knee[1]<12);
      assert.ok(Math.abs(fingers[2]-knee[2])<11);
    }
  }
});
