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

test('Les 400 invités du livre gardent leur identité et les traits présents dans leur fiche',async()=>{
  const {characterDirectory}=await import('../atlas-dialogues-data.mjs');
  const {salonDirectory}=await import('../salon-directory.mjs');
  const {guestAppearance,searchName}=await import('./salon-encounter.js');
  const people=salonDirectory(await characterDirectory());
  assert.equal(people.length,400);assert.equal(new Set(people.map(p=>p.id)).size,400);
  const michels=people.filter(p=>p.name==='Michel');
  assert.equal(michels.length,3);assert.equal(new Set(michels.map(p=>p.role)).size,3);
  assert.equal(searchName('  ÉLISE '),'elise');
  for(const p of people){
    const look=guestAppearance(p),again=guestAppearance(p);
    assert.deepEqual(again,look);
    if(p.gender)assert.equal(look.gender,p.gender);
    if(p.age!==null)assert.equal(look.studio.face.age,p.age);
  }
  assert.equal(people.find(p=>p.id==='229').age,0);
  assert.equal(guestAppearance(people.find(p=>p.name==='Élise')).studio.face.iris,0);
});
test('Les deux invités rejoignent des assises opposées et le joueur reste libre de repartir',async()=>{
  const {conversationSeats,frameConversation,actorHead,headSide}=await import('./salon-encounter.js');
  for(const r of [[.1,.1],[.1,.8],[.8,.1,.8],[.8,.5,.1],[.8,.99,.1]]){
    const [a,b]=conversationSeats(()=>r.shift());
    assert.ok(Math.cos(a.yaw-b.yaw)<-.99);
    const player=newMotion(),guest=new SalonMotion(undefined,newCamera(),{x:722,z:-992,yaw:.3});
    player.goToSeat(a);guest.goToSeat(b);
    until(player,()=>player.mode==='seated');until(guest,()=>guest.mode==='seated');
    for(const [w,h] of [[360,360],[740,340]]){
      const heads=[actorHead(player),actorHead(guest)],cam=player.camera;
      const wideAngle=Math.abs(a.x-b.x)>Math.abs(a.z-b.z)?-.09:1.48;
      frameConversation(cam,'wide','guest',...heads,w,h,wideAngle);
      const wideZoom=cam.zoom;
      for(const head of heads)assert.ok(Math.abs(headSide(head,cam,w,h))*cameraProjection(w,h,false,cam).factor*h<w);
      const sides=[];
      for(const who of ['player','guest']){
        frameConversation(cam,'reverse',who,...heads,w,h,wideAngle);
        const speaker=who==='guest'?guest:player,listener=who==='guest'?player:guest;
        assert.ok(cam.zoom>wideZoom&&cam.perspective>0);
        assert.ok(Math.cos(cam.angle-speaker.yaw)>.65);
        assert.ok(Math.cos(cam.angle-listener.yaw)<-.65);
        const projected=heads.map(head=>headSide(head,cam,w,h)*cameraProjection(w,h,false,cam).factor*h/2);
        assert.ok(Math.abs(projected[0]-projected[1])>.20*w);
        sides.push(Math.sign(projected[0]-projected[1]));
      }
      // Both cuts preserve the player's screen direction.
      assert.equal(sides[0],sides[1]);
    }
    const different=seats.find(s=>s!==a&&s!==b);
    player.goToSeat(different);until(player,()=>player.mode==='seated'&&player.seat===different);
    assert.equal(guest.seat,b);
  }
});

test('Un double toucher en contrechamp suit le rayon de la caméra et ignore le mobilier hors champ',()=>{
  const c={x:0,y:0,z:0,angle:0,pitch:0,zoom:2,perspective:.35,nearDepth:1.65};
  const triangles=new ArrayBuffer(3*42),data=new DataView(triangles);
  // Three chair cushions align on the same perspective ray. The nearest is behind the camera's clipping plane.
  for(const [i,part] of [92,83,94].entries()){
    const z=i,center=.60*(1-z*c.perspective);
    for(const [v,[dx,y]] of [[-.07,-.07],[.07,-.07],[0,.07]].entries()){
      const k=i*42+v*14;
      data.setInt16(k,Math.round((center+dx)*1800),true);data.setInt16(k+2,Math.round(y*1800),true);
      data.setInt16(k+4,z*1800,true);data.setUint8(k+13,part);
    }
  }
  const w=380,h=280,x=w/2+.60*cameraProjection(w,h,false,c).factor*h/2;
  assert.equal(seatAt(triangles,c,w,h,x,h/2)?.id,'east1');
  assert.equal(seatAt(triangles,{...c,perspective:0},w,h,x,h/2)?.id,'west1');
});

test('Le rythme des lèvres distingue les voyelles, les fermetures et les pauses',async()=>{
  const {scoreLine,articulation}=await import('./salon-performance.js');
  const line=scoreLine('Mmm, ou i !');
  const center=i=>articulation(line,(line.words[i].start+line.words[i].end)/2);
  assert.equal(center(0).jaw,0);
  assert.ok(center(1).round>.7&&center(1).spread===0);
  assert.ok(center(2).spread>.7&&center(2).round===0);
  assert.equal(articulation(line,line.words[0].end+.03).jaw,0);
  assert.ok(line.words[1].start-line.words[0].end>.10);
});

test('Les mouvements varient entre personnages et conservent les appuis assis',async()=>{
  const {createPerformer}=await import('./salon-performance.js');
  const seat=seats.find(seat=>seat.id==='sofa2'),actor=newMotion();
  actor.goToSeat(seat);until(actor,()=>actor.mode==='seated');
  const resting=actor.bones().slice();
  function sequence(id,role){
    let n=30;
    const performer=createPerformer(id,()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;});
    return Array.from({length:450},(_,i)=>performer.sample(i/25,.04,role,'Une phrase'));
  }
  const speaking=sequence('nora','speak'),listening=sequence('nora','listen');
  assert.notDeepEqual(speaking,sequence('michel','speak'));
  assert.ok(speaking.some(p=>p.pitch>.03)&&speaking.some(p=>p.pitch<-.02));
  assert.ok(listening.some(p=>Math.abs(p.nod)>.03));
  for(const gesture of speaking){
    actor.expression={gesture,look:.2};
    const bones=actor.bones();
    assert.ok(bones.every(Number.isFinite));
    for(const foot of [10,13]){
      for(const offset of [12,13,14])assert.ok(Math.abs(bones[foot*16+offset]-resting[foot*16+offset])<.002);
    }
  }
  assert.ok(speaking.some(p=>Math.max(p.left,p.right)>.4));
});

test('La voix cale les mots et libère la réponse suivante seulement en fin de réplique',async t=>{
  const {createDialogue}=await import('./salon-dialogue.js');
  const Original=globalThis.SpeechSynthesisUtterance;
  globalThis.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
  t.after(()=>{if(Original)globalThis.SpeechSynthesisUtterance=Original;else delete globalThis.SpeechSynthesisUtterance;});
  let now=0,utterance,cancelled=0;
  const starts=[],words=[],rests=[];
  const synth={speaking:false,getVoices:()=>[],speak(v){utterance=v;},cancel(){cancelled++;this.speaking=false;}};
  const d=createDialogue({now:()=>now,synth,start:id=>starts.push(id),word:(_,w)=>words.push(w.index),rest:id=>rests.push(id),wake(){}});
  d.voice(true);d.play('player','Oui, bonjour.',1);d.play('guest','Merci.',1,true);
  assert.equal(d.frame(),null);assert.deepEqual(starts,['player']);
  synth.speaking=true;utterance.onstart();d.frame();now=.16;
  utterance.onboundary({charIndex:5,name:'word'});d.frame();assert.deepEqual(words,[0,5]);
  now=8;d.frame();assert.deepEqual(starts,['player']);assert.equal(cancelled,0);
  synth.speaking=false;utterance.onend();assert.deepEqual(starts,['player','guest']);assert.deepEqual(rests,['player']);
  utterance.onerror();now+=4;d.frame();assert.equal(d.busy,false);
  d.play('guest','Encore.',1);const stale=utterance.onend;d.clear();stale();
  assert.equal(cancelled,1);assert.equal(d.busy,false);assert.equal(d.frame(),null);
});

test('Les prêtres du livre ont une tenue et un col romain, y compris en cas de genre absent',async()=>{
  const {salonDirectory}=await import('../salon-directory.mjs');
  const {characterDirectory}=await import('../atlas-dialogues-data.mjs');
  const {guestAppearance}=await import('./salon-encounter.js');
  const people=salonDirectory(await characterDirectory()),priests=people.filter(p=>p.clerical);
  assert.deepEqual(priests.map(p=>p.name),['Adelphe','Ambroise','Anselme','Barnabé','Bérenger','Cyprien','Guillaume-Marie','Hippolyte','Louis','Matthieu','Théophile','Timothée','Xavier']);
  for(const priest of priests){
    const {gender,studio}=guestAppearance({...priest,gender:null});
    assert.equal(priest.gender,'homme');assert.equal(gender,'homme');
    assert.equal(studio.outfit.col,'roman-collar');
    assert.equal(studio.outfit.souliers,'mh620');
    if(priest.name==='Ambroise'){
      assert.equal(studio.clerical,'soutane-vert-canard');assert.equal(studio.outfit.robe,'mh225');
    }else{
      assert.equal(studio.outfit.haut,'mh1800');assert.equal(studio.outfit.bas,'mh1796');
    }
  }
  for(const name of ['Benoît Arnaud','Ghislain','José Luis','Arielle','Melchior']){
    const person=people.find(p=>p.name===name);
    assert.ok(!person.clerical);assert.ok(!guestAppearance(person).studio.outfit.col);
  }
});
