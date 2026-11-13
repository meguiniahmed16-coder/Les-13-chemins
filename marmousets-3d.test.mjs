import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8');
const context={};vm.runInNewContext(read('marmousets-course.js'),context);const course=context.MarmousetsCourse;
const {create:Xd,action:Xs,step:qd}=course;
function advance(s,seconds,input=0){for(let t=0;t<seconds;t+=.02)qd(s,.02,input);}
function clearAdults(s){for(const a of s.adults)a.fleeTime=0;s.adultClear=true;}
test('Four obstacles each have three guards, with the parents and educator at the start',()=>{
 assert.equal(course.obstacles.length,4);assert.equal(course.adults.length,15);assert.ok(new Set(course.adults.map(a=>a.color)).size>=6);assert.ok(course.adults.some(a=>a.age<30)&&course.adults.some(a=>a.age>65));assert.ok(new Set(course.adults.map(a=>a.hair)).size>=5);
 assert.deepEqual(Array.from(course.adults.slice(0,3),a=>a.role),['Père','Mère','Adulte des Marmousets']);
 for(const g of course.groups)assert.equal(course.adults.filter(a=>a.group===g.id).length,3);
});
test('Complete course clears every group and obstacle and flowers fully at arrival',()=>{
 const s=Xd();
 for(let t=0;t<100&&!s.complete;t+=.02){
  if(s.phase==='mountReady')Xs(s,'rear');
  if(s.phase==='ride'){
   const g=course.groups.find(g=>!course.groupClear(s,g)&&s.x>=g.x-1.8&&s.x<g.x+2.5),o=s.obstacles.find(o=>!o.cleared);
   if(g)Xs(s,'rear');else if(o&&s.x>=o.x-2.15)Xs(s,'jump',1);
  }
  qd(s,.02,1);
 }
assert.equal(s.complete,true);assert.equal(s.adults.filter(a=>a.fleeTime!==null).length,15);assert.ok(s.obstacles.every(o=>o.cleared&&o.intact));assert.equal(s.meadow.events.filter(e=>e.kind==='adult').length,15);assert.equal(s.meadow.events.filter(e=>e.kind==='obstacle').length,4);assert.equal(s.meadow.events.at(-1).kind,'arrival');assert.equal(s.meadow.target,1);
});
test('Adults stop forward travel and rearing only disperses the nearby group once',()=>{
 const s=Xd();s.phase='ride';advance(s,5,1);assert.ok(s.x<=course.groups[0].x-1.65);Xs(s,'rear');advance(s,3);assert.equal(s.adults.filter(a=>a.fleeTime!==null).length,3);Xs(s,'rear');advance(s,3);assert.equal(s.meadow.events.length,3);assert.ok(s.meadow.target<.2);
});
test('Empty jumps and failed obstacle jumps do not flower; new games reset flowers',()=>{
 for(const [x,input] of [[2,0],[6.6,1]]){const s=Xd();s.phase='ride';clearAdults(s);s.x=x;Xs(s,'jump',input);advance(s,1.6,input);assert.equal(s.meadow.events.length,0);}
 assert.equal(Xd().meadow.target,0);
});
test('Gallop increases pace, releases to walking and respects adult and obstacle barriers',()=>{
 const walk=Xd(),gallop=Xd();for(const s of[walk,gallop]){s.phase='ride';s.x=15;clearAdults(s);}gallop.gallop=true;advance(walk,1,1);advance(gallop,1,1);assert.ok(gallop.x-walk.x>1.7);
 const x=gallop.x;gallop.gallop=false;advance(gallop,1,1);assert.ok(Math.abs(gallop.x-x-1.65)<.05);
 gallop.gallop=true;advance(gallop,5,1);assert.ok(gallop.x<=24-.95);assert.equal(gallop.obstacles[1].cleared,false);
 const blocked=Xd();blocked.phase='ride';blocked.gallop=true;advance(blocked,6,1);assert.ok(blocked.x<=course.groups[0].x-1.65);
});
test('White horse preserves eye contrast and all external buffers exist',()=>{
 const g=JSON.parse(read('assets/marmousets/horse.gltf'));
 for(const n of ['Main','Main_Light','Hair']){const c=g.materials.find(m=>m.name===n).pbrMetallicRoughness.baseColorFactor;assert.ok(c.slice(0,3).every(v=>v>.65),n);}
 assert.ok(g.materials.find(m=>m.name==='Eye_Black').pbrMetallicRoughness.baseColorFactor[0]<.1);
 for(const b of g.buffers)assert.equal(fs.statSync(new URL('assets/marmousets/'+b.uri,import.meta.url)).size,b.byteLength);
});
function bridge(){
 let receive;const sent=[],credits=[];const parent={postMessage:m=>sent.push(m)};
 const w={MarmousetsCourse:course,parent,location:{search:'?embedded=1',origin:'https://game.example'},addEventListener:(event,fn)=>receive=fn};
 const box={URLSearchParams};vm.runInNewContext(read('marmousets-session.js'),box);
 const api=box.MarmousetsSession({window:w,onCredit:m=>credits.push(m)});
 return{api,sent,credits,message:(data,overrides={})=>receive({data,origin:w.location.origin,source:parent,...overrides})};
}
test('Session ignores foreign origins, sources, IDs and demonstrations; awards only once',()=>{
 const {api,sent,credits,message}=bridge();
 message({type:'marmousets:init',id:'x'},{origin:'https://foreign.example'});assert.equal(api.canPlay(),false);
 message({type:'marmousets:init',id:'x'},{source:{}});assert.equal(api.canPlay(),false);
 message({type:'marmousets:init',id:'x'});assert.equal(api.canPlay(),true);
 const state={auto:true,adults:course.adults.map(a=>({...a,fleeTime:0})),obstacles:course.obstacles.map(o=>({...o,cleared:true})),complete:true};api.observe(state);assert.equal(sent.length,0);
 state.auto=false;api.observe(state);api.observe(state);assert.equal(sent.filter(m=>m.type==='marmousets:progress').length,19);assert.equal(sent.filter(m=>m.type==='marmousets:won').length,1);
 message({type:'marmousets:credited',id:'wrong'});assert.equal(credits.length,0);
 message({type:'marmousets:credited',id:'x',bonus:10});message({type:'marmousets:credited',id:'x',bonus:10});assert.equal(credits.length,1);
 api.start();api.observe(state);assert.equal(sent.length,20);api.close();assert.equal(sent.at(-1).type,'marmousets:close');
});
test('Board requires all groups and obstacles, rejects stale sessions and duplicate rewards',()=>{
 const page=read('jeu.html'),start=page.indexOf('(function(root){',page.indexOf('<!-- MARMOUSETS START -->')),end=page.indexOf('\n\n(function(){',start),box={};vm.runInNewContext(page.slice(start,end),box);const a=box.MarmousetsScore,s={points:20};
 const recordAll=id=>{for(const adult of course.adults)a.record(s,id,'scared',adult.id);for(const obstacle of course.obstacles)a.record(s,id,'cleared',obstacle.id);};
 a.begin(s,true,'x');assert.equal(a.record(s,'stale','scared','parents-0'),false);assert.equal(a.settle(s,'x'),null);
 for(const adult of course.adults)a.record(s,'x','scared',adult.id);for(const obstacle of course.obstacles.slice(0,3))a.record(s,'x','cleared',obstacle.id);assert.equal(a.settle(s,'x'),null);
 a.record(s,'x','cleared','barrier-4');assert.equal(a.settle(s,'x').bonus,10);assert.equal(s.points,30);assert.equal(a.settle(s,'x'),null);
 a.begin(s,true,'y');recordAll('y');assert.equal(a.settle(s,'y').bonus,0);
 a.begin(s,false,'z');recordAll('z');assert.equal(a.settle(s,'z').retryQuestion,true);assert.equal(s.points,30);
});
test('Published page retains book and board navigation and all production assets',()=>{
 const p=read('arcade-marmousets.html'),build=read('build-public.mjs');assert.match(p,/Chapitre 1 · partie 1\/3/);assert.match(p,/lecture.html\?niveau=1/);assert.match(p,/jeu.html\?niveau=1/);assert.doesNotMatch(p,/NON PUBLIÉE|scène d’essai/);
 for(const f of ['marmousets-course.js','marmousets-session.js','marmousets-3d-runtime.js',...['horse.gltf','horse.bin','adult.glb','child.glb','tree.glb','bush.glb'].map(f=>'assets/marmousets/'+f)])assert.ok(build.includes("'"+f+"'"),f);
});

test('Demonstration ends after one landed obstacle in under eight seconds without completing the game',()=>{
 const s=Xd(true);let elapsed=0;while(!s.demoComplete&&elapsed<10){qd(s,.02);elapsed+=.02;}
 assert.equal(s.demoComplete,true);assert.ok(elapsed<8);assert.equal(s.complete,false);assert.equal(s.phase,'demoDone');assert.equal(s.obstacles.filter(o=>o.cleared).length,1);assert.equal(s.meadow.events.filter(e=>e.kind==='obstacle').length,1);assert.ok(s.meadow.target<1);
 const x=s.x;advance(s,45);assert.equal(s.x,x);assert.equal(s.obstacles.filter(o=>o.cleared).length,1);
 const manual=Xd(false);assert.equal(manual.auto,false);assert.equal(manual.demoComplete,false);assert.equal(manual.phase,'approach');assert.equal(manual.x,0);assert.equal(manual.meadow.target,0);assert.ok(manual.adults.every(a=>a.fleeTime===null));
});

test('Walking and galloping jumps clear every obstacle across a generous timing window',()=>{
 for(const obstacle of course.obstacles)for(const distance of[.95,1.2,2,3,4.5,5.9])for(const gallop of[false,true])for(const dt of[.01,.05]){
  const s=Xd();clearAdults(s);s.phase='ride';s.x=obstacle.x-distance;s.gallop=gallop;Xs(s,'jump',1);let previous=s.x;
  for(let t=0;t<1.5;t+=dt){qd(s,dt,0);assert.ok(s.x>=previous-1e-8,'Jump remains forward after touch release');previous=s.x;}
  const o=s.obstacles.find(o=>o.id===obstacle.id);assert.equal(o.intact,true,obstacle.id+' offset '+distance);assert.equal(o.cleared,true);assert.ok(s.x>obstacle.x+1.8);assert.equal(s.jumpMistake,null);assert.ok(s.meadow.events.some(e=>e.id===obstacle.id&&e.kind==='obstacle'));
 }
});
test('Switching from forward control to jump retains momentum, including at a blocked barrier',()=>{
 for(const distance of[.95,2.5]){
  const s=Xd();clearAdults(s);s.phase='ride';s.x=13-distance-.2;advance(s,.12,1);advance(s,.12,0);assert.equal(s.vx,0);Xs(s,'jump',0);advance(s,1.5,0);assert.equal(s.obstacles[0].cleared,true);assert.equal(s.obstacles[0].intact,true);
 }
});
test('A backward jump keeps its launch direction and held movement resumes at landing',()=>{
 const s=Xd();clearAdults(s);s.phase='ride';s.x=16;Xs(s,'jump',-1);advance(s,1.46,0);assert.ok(s.x<12);assert.equal(s.obstacles[0].intact,true);
 const forward=Xd();clearAdults(forward);forward.phase='ride';forward.x=10;forward.gallop=true;Xs(forward,'jump',1);advance(forward,1.46,1);const landing=forward.x;advance(forward,.4,1);assert.ok(forward.x>landing+1.3);
});
