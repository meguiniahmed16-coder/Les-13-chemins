import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the actual published gameplay, without loading the renderer or assets.
const html=fs.readFileSync(new URL('./jeu-bosnie.html',import.meta.url),'utf8');
const between=(start,end)=>{
 const a=html.indexOf(start),b=html.indexOf(end,a);
 assert.ok(a>=0&&b>a,`Missing gameplay boundary: ${start}`);
 return html.slice(a,b);
};
const box={};
vm.runInNewContext(`class D{constructor(x,y,z){Object.assign(this,{x,y,z});}}
const Kh={windowPosts:${html.match(/const windowPosts=(\[[^;]+\]);/)[1]}};
${between('var In=[','function If(')}
${between('// A finite pavement depth','// Period-inspired French')}
globalThis.game={gaps:In,create:bl,start:Ef,next:Tl,burst:wl,step:stepGame2D,
 left:safeLeftOfGap,right:safeRightOfGap,cue:companionCue,ready:companionReady,
 companion:createCompanion};`,box);
const g=box.game;

function atFinalCover({z=-.1,crouched=true}={}){
 const s=g.create([1,2,3,4]),gap=g.gaps[4];g.start(s);
 Object.assign(s,{z,crouched});s.x=g.left(s,gap);
 s.companion=g.companion(s);
 Object.assign(s.companion,{x:g.right({z:-.22},gap)+.8,z:-.22,mode:'cover',gapId:5});
 return s;
}
function signalTime(s,last=false){
 const gap=g.next(s),cycle=gap.burst+gap.quiet;let found;
 for(let t=0;t<cycle;t+=.02){
  if(g.cue(s,gap,t).safe){found=t;if(!last)break;}
 }
 assert.notEqual(found,undefined,'Lionel never gives a usable signal');return found;
}
function cross(s,input,dt=.02){
 // Allow time to notice the instruction and move the thumb.
 for(let t=0;t<.64;t+=dt)g.step(s,dt,{});
 for(let t=0;t<12&&!s.passed.includes(5)&&!s.failures;t+=dt)g.step(s,dt,input);
 assert.equal(s.failures,0,`Hit before reaching cover: x=${s.x}, z=${s.z}`);
 assert.ok(s.passed.includes(5),'Last crossing never completes');
 assert.equal(s.events.filter(e=>e.type==='pass'&&e.gap===5).length,1);
}

test('Final crossing allows ordinary crouched joystick movement after Lionel signals',()=>{
 for(const z of [-.4,-.1,1.3])for(const dt of [.02,.04]){
  const s=atFinalCover({z});s.time=signalTime(s);cross(s,{x:1},dt);
 }
});
test('Even the last go signal leaves reaction time and a partial or diagonal thumb movement',()=>{
 for(const crouched of [true,false])for(const z of [-.4,1.3]){
  const s=atFinalCover({z,crouched});s.time=signalTime(s,true);cross(s,{x:.7});
 }
 const s=atFinalCover({z:1.3});s.time=signalTime(s,true);cross(s,{x:1,z:1});
});
test('All five crossings remain playable, Lionel leads, and the final passage reaches the ending',()=>{
 const s=g.create();s.z=-.4;g.start(s);let crossing=null,react=0;
 for(let t=0;t<180&&s.phase!=='won';t+=.02){
  const gap=g.next(s);let input={};
  if(!gap)input={x:1};
  else if(crossing===gap.id){if(react>0)react-=.02;else input={x:1,sprint:gap.id!==5};}
  else if(s.x<g.left(s,gap)-.05)input={x:.65};
  else if(g.cue(s,gap,s.time).safe){crossing=gap.id;react=gap.id===5?.64:0;}
  g.step(s,.02,input);
  if(gap&&!g.ready(s,gap))assert.ok(s.x<=g.left(s,gap)+.001,'Ahmed leaves before Lionel');
 }
 assert.equal(s.failures,0);assert.equal(s.phase,'won');
 assert.equal(s.events.filter(e=>e.type==='pass').length,5);
 assert.equal(s.events.filter(e=>e.type==='won').length,1);
});
test('The final crossing remains dangerous during a burst',()=>{
 const s=atFinalCover(),gap=g.next(s);s.x=(g.left(s,gap)+g.right(s,gap))/2;
 s.time=gap.burst+gap.quiet-gap.offset+.1;
 for(let t=0;t<.5;t+=.02)g.step(s,.02,{});
 assert.equal(s.failures,1);assert.equal(s.phase,'hit');
});
