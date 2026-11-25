import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {roomFree} from '../salon-plan.js';
import {INTRO_INVITATION_EXAMPLES} from '../intro-invitation-data.js';
import {INTRO_INVITATION_DURATION} from '../intro-invitation.js';
import {introInvitationFrame,createIntroInvitationScene,prepareIntroInvitationGuests,applyIntroInvitationGuest,INTRO_INVITATION_POSITIONS} from './intro-invitation-scene.js';

test('the deterministic invitation precedes the garden with two complete appearances at fixed floor positions',()=>{
 for(const t of [0,2500,3600,4200,4800,8200,9200,10500,11200,11800,12400,17500,20000]){
  const a=introInvitationFrame(t),b=introInvitationFrame(t);assert.deepEqual(a,b);
  assert.deepEqual([a.actors.guest.x,a.actors.guest.z,a.actors.guest.yaw],[.8,-1.82,-.43]);
  assert.ok(a.actors.guest.opacity>=0&&a.actors.guest.opacity<=1);
 }
 assert.equal(introInvitationFrame(3600).actors.guest.opacity,0);
 assert.equal(introInvitationFrame(4200).actors.guest.opacity,.5);
 assert.equal(introInvitationFrame(4800).actors.guest.opacity,1);
 assert.equal(introInvitationFrame(9200).actors.guest.opacity,0);
 assert.equal(introInvitationFrame(11200).actors.guest.opacity,0);
 assert.equal(introInvitationFrame(11800).actors.guest.opacity,.5);
 assert.equal(introInvitationFrame(12400).actors.guest.opacity,1);
 assert.deepEqual(introInvitationFrame(INTRO_INVITATION_DURATION+1000),introInvitationFrame(INTRO_INVITATION_DURATION));
});

test('three body footprints remain clear of every real salon obstacle with room for gestures',()=>{
 for(const [id,actor]of Object.entries(INTRO_INVITATION_POSITIONS)){
  for(const dx of [-.27,0,.27])for(const dz of [-.18,0,.18])assert.equal(roomFree((actor.x+dx)*100+700,(actor.z+dz)*100-800),true,`${id} at ${dx},${dz}`);
 }
 const people=Object.values(INTRO_INVITATION_POSITIONS);
 for(let i=0;i<people.length;i++)for(let j=i+1;j<people.length;j++)assert.ok(Math.hypot(people[i].x-people[j].x,people[i].z-people[j].z)>.90);
});

test('wide, American and portrait framing keeps the intended body area outside the overlay and bubble',()=>{
 const shots=new Set();
 for(const [width,height]of [[1280,720],[1024,600],[390,700],[320,640],[844,300],[640,240]])for(let t=0;t<=20000;t+=200){
  const frame=introInvitationFrame(t,{width,height}),{camera:spec,layout}=frame;
  const camera=new T.PerspectiveCamera(spec.fov,width/height,.07,180);
  camera.position.fromArray(spec.position);camera.lookAt(new T.Vector3().fromArray(spec.target));
  camera.setViewOffset(width,height,spec.offsetX,spec.offsetY,width,height);camera.updateMatrixWorld(true);
  shots.add(spec.shot);
  assert.ok(spec.position[0]>-3.2&&spec.position[0]<3.2&&spec.position[1]<2.85&&spec.position[2]<2.35,'Camera remains inside the salon');
  assert.ok(spec.fov<115,`No extreme lens for ${width}×${height}`);
  if(width<height)assert.equal(spec.minY,0,'Portrait keeps full figures');
  for(const actor of Object.values(frame.actors))for(const dx of [-.30,.30])for(const y of [spec.minY,1.55,2.04])for(const dz of [-.18,.18]){
   const p=new T.Vector3(actor.x+dx,y,actor.z+dz).project(camera);
   const x=(p.x*.5+.5)*width,screenY=(.5-p.y*.5)*height;
   assert.ok(p.z>-1&&p.z<1);
   assert.ok(x>=layout.sceneRect.left&&x<=layout.sceneRect.right,`${width}×${height} ${t}ms x=${x}`);
   assert.ok(screenY>=layout.sceneRect.top&&screenY<=layout.sceneRect.bottom,`${width}×${height} ${t}ms y=${screenY}`);
  }
 }
 assert.deepEqual([...shots].sort(),['american','group','wide']);
});

test('both guests finish preparation before the invitation may begin and repeated samples stay still',async()=>{
 let resolve;const calls=[],pending=new Promise(r=>{resolve=r;});
 const adapter={viewport:()=>({width:390,height:700}),prepare:async()=>{calls.push('prepare');await pending;},begin:()=>calls.push('begin'),apply:frame=>calls.push(frame),finish:()=>calls.push('finish')};
 const invitation=createIntroInvitationScene(adapter);
 assert.throws(()=>invitation.begin(),/pas prêts/);
 const a=invitation.prepare(),b=invitation.prepare();assert.equal(a,b);assert.equal(invitation.ready,false);
 resolve();await a;assert.equal(invitation.ready,true);invitation.begin();
 assert.deepEqual(invitation.sample(6500),invitation.sample(6500));assert.equal(invitation.active,true);
 invitation.finish();invitation.finish();assert.equal(invitation.active,false);
 assert.equal(calls.filter(x=>x==='prepare').length,1);assert.equal(calls.filter(x=>x==='finish').length,1);
 assert.equal(invitation.begin().finished,true,'A late begin cannot revive a skipped invitation');
});

test('skipping before preparation finishes does not materialize either guest',async()=>{
 let resolve;const calls=[],invitation=createIntroInvitationScene({prepare:()=>new Promise(r=>{resolve=r;}),viewport:()=>({width:1280,height:720}),begin:()=>calls.push('begin'),apply:()=>calls.push('apply'),finish:()=>calls.push('finish')});
 const pending=invitation.prepare();invitation.finish();resolve();await pending;
 invitation.begin();invitation.sample(15000);assert.deepEqual(calls,['finish']);
});

test('the existing fitted cast pipeline prepares complete outfits on hidden independent roots',async()=>{
 const scene=new T.Scene(),calls=[];
 const guests=await prepareIntroInvitationGuests(scene,{
  load:async(look,gender)=>{calls.push({look,gender});assert.ok(look.outfit.haut&&look.outfit.bas&&look.outfit.souliers);return {meshes:[],appearance:look};},
  create:async(root,figure,{look,gender})=>{assert.equal(root.visible,false);assert.equal(figure.appearance,look);return {root,parts:[],gender,dispose(){root.removeFromParent();}};}
 });
 assert.equal(guests.length,2);assert.deepEqual(guests.map(a=>a.invitationExample.id),INTRO_INVITATION_EXAMPLES.map(a=>a.id));
 assert.deepEqual(calls.map(c=>c.gender),['femme','homme']);
 assert.deepEqual(guests.map(a=>a.root.scale.y),[1.04,1.075]);
 assert.equal(guests.every(a=>!a.root.visible),true);assert.equal(scene.children.length,2);
});

test('a failed second guest preparation removes the first instead of exposing a partial demonstration',async()=>{
 const scene=new T.Scene();let count=0,disposed=0;
 await assert.rejects(()=>prepareIntroInvitationGuests(scene,{
  load:async()=>{if(++count===2)throw Error('asset failed');return {meshes:[]};},
  create:async root=>({root,parts:[],dispose(){disposed++;root.removeFromParent();}})
 }),/asset failed/);
 assert.equal(disposed,1);assert.equal(scene.children.length,0);
});

test('guest materialization changes opacity while the native rig keeps its fixed ground origin',()=>{
 const material=new T.MeshStandardMaterial({alphaTest:.23}),calls=[];
 const actor={root:new T.Group(),invitationMaterials:[{material,opacity:1,transparent:false,depthWrite:true,alphaTest:.23}],pose:(n,g)=>calls.push(g)};
 const frame=introInvitationFrame(4200),pose=frame.actors.guest;
 applyIntroInvitationGuest(actor,pose,frame.time);
 assert.equal(actor.root.position.y,0);assert.equal(actor.root.visible,true);assert.equal(material.opacity,.5);assert.equal(material.depthWrite,false);
 assert.equal(calls[0].time,4.2);assert.deepEqual(calls[0].poseGesture,pose.expression.gesture);
 applyIntroInvitationGuest(actor,{...pose,opacity:0},4.2);assert.equal(actor.root.visible,false);assert.equal(actor.root.position.y,0);
 applyIntroInvitationGuest(actor,{...pose,opacity:1},4.8);assert.equal(material.transparent,false);assert.equal(material.depthWrite,true);assert.equal(material.alphaTest,.23);
});

test('production gates the scene to cinema mode and preloads guests before salon-ready',()=>{
 const source=readFileSync(new URL('./scene.js',import.meta.url),'utf8');
 const mode=source.indexOf('if(cinemaArrival){\n let invited=[];');
 const create=source.indexOf('invitationScene=createIntroInvitationScene',mode),bridge=source.indexOf('member.introInvitation=invitationScene;',create);
 assert.ok(mode>0&&create>mode&&bridge>create);
 const initialize=source.lastIndexOf('await member.initialize();'),prepared=source.indexOf('await invitationScene.prepare();',initialize),ready=source.indexOf("window.dispatchEvent(new Event('salon-ready'))",initialize);
 assert.ok(prepared>initialize&&ready>prepared);
 assert.match(source,/!arrivalFinale\?\.active&&!invitationScene\?\.active/);
 assert.match(source,/cam\.clearViewOffset\(\)/);
});

test('production equipment and keyboard commands cannot relocate the scene during either cinematic',()=>{
 const source=readFileSync(new URL('./scene.js',import.meta.url),'utf8');
 const equipStart=source.indexOf('function equip(which){'),equipEnd=source.indexOf('\nfunction returnHome()',equipStart);
 assert.ok(equipStart>=0&&equipEnd>equipStart);
 const handlers=[],effects=[];
 const context=vm.createContext({
  invitationScene:{active:false},arrivalFinale:{active:false},
  encounter:{get active(){throw Error('equipment body entered');}},
  window:{addEventListener(type,handler){if(type==='keydown')handlers.push(handler);}},
  document:{querySelector(){return null;}},where:'salon',
  moveKeys:new Set(['arrowup']),keys:new Set(),
  equip:which=>effects.push('equip:'+which),toggleAngel:()=>effects.push('angel'),
  beat:()=>effects.push('beat'),trick:name=>effects.push('trick:'+name),air:{mode:'ready'}
 });
 // Execute the actual equipment entry and both production listeners, with
 // scene mutations observed at their first boundary rather than copied code.
 vm.runInContext(source.slice(equipStart,equipEnd)+'\nglobalThis.runEquip=equip;',context);
 context.equip=which=>effects.push('equip:'+which);
 let at=0;
 while((at=source.indexOf("window.addEventListener('keydown'",at))!==-1){
  const end=source.indexOf("window.addEventListener('keyup'",at);
  assert.ok(end>at);vm.runInContext(source.slice(at,end),context);at=end;
 }
 assert.equal(handlers.length,2);
 const event=(key,code)=>({key,code,target:{closest(){return false;}},repeat:false,
  preventDefault(){effects.push('prevent');}});
 const inputs=[['1','Digit1'],['2','Digit2'],['ArrowUp','ArrowUp'],['g','KeyG'],[' ','Space'],['c','KeyC']];
 for(const stage of ['invitationScene','arrivalFinale']){
  context[stage].active=true;
  assert.doesNotThrow(()=>context.runEquip('pin'));
  assert.doesNotThrow(()=>context.runEquip('ocre'));
  for(const place of ['salon','jardin']){
   context.where=place;
   for(const [key,code]of inputs)for(const handler of handlers)handler(event(key,code));
  }
  assert.deepEqual(effects,[],'No equipment, flight or camera-related input may interrupt the scene');
  assert.equal(context.keys.size,0,'Movement keys must not be retained for cinematic completion');
  context[stage].active=false;
 }
 // Controls are restored when both cinematic directors have finished.
 assert.throws(()=>context.runEquip('pin'),/equipment body entered/);
 context.where='salon';handlers[0](event('1','Digit1'));handlers[0](event('2','Digit2'));
 context.where='jardin';handlers[1](event('g','KeyG'));
 assert.deepEqual(effects,['equip:pin','equip:ocre','prevent','angel']);
});
