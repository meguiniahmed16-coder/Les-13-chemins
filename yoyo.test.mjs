import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {createGame,startGame,move,hide,aimAt,actionDown,actionUp,advance,continueGame,pauseGame,ropePosition,BRUSH,aligned} from './yoyo-core.js';
const tick=(g,seconds)=>{for(let i=0;i<seconds*60;i++)advance(g,1/60);};
test('Three separate objects are required for 30 points, misses do not award points',()=>{const g=createGame();startGame(g);actionDown(g);assert.equal(g.points,0);tick(g,1);aimAt(g,BRUSH.x);actionDown(g);assert.equal(g.points,10);assert.equal(g.phase,'between');continueGame(g);aimAt(g,ropePosition(g));actionDown(g);assert.ok(g.hooked);tick(g,2);actionUp(g);const pulled=g.pull;tick(g,1);assert.equal(g.pull,pulled);actionDown(g);tick(g,4);assert.equal(g.points,20);continueGame(g);aimAt(g,ropePosition(g));actionDown(g);tick(g,6);assert.equal(g.phase,'victory');assert.equal(g.points,30);assert.deepEqual(g.events.filter(e=>e.type==='part').map(e=>e.part),[1,2,3]);});
test('The warning is fair, hiding prevents capture and inspection pauses retrieval',()=>{const g=createGame();startGame(g);tick(g,10);assert.equal(g.guard,'approaching');hide(g);tick(g,3.2);assert.equal(g.guard,'watching');assert.equal(g.phase,'playing');move(g,1);tick(g,.8);assert.equal(g.phase,'caught');startGame(g);assert.equal(g.points,0);assert.equal(g.part,0);});
test('Pause freezes guard, rope, score and controls',()=>{const g=createGame();startGame(g);tick(g,2);pauseGame(g);const old=JSON.stringify(g);tick(g,100);move(g,1);actionDown(g);assert.equal(JSON.stringify(g),old);pauseGame(g);tick(g,1);assert.ok(g.time>2);});
test('A retry cannot accumulate points and hiding always drops the action',()=>{const g=createGame();startGame(g);aimAt(g,BRUSH.x);actionDown(g);continueGame(g);aimAt(g,ropePosition(g));actionDown(g);tick(g,2);hide(g);assert.equal(g.holding,false);const p=g.pull;tick(g,3);assert.equal(g.pull,p);startGame(g);assert.equal(g.points,0);});
function score(){const c=vm.createContext({TreizeEtapesData:[{level:5,plateaux:[{},{}]}]});vm.runInContext(fs.readFileSync(new URL('./plateaux-core.js',import.meta.url),'utf8'),c);return c.TreizePlateaux;}
test('Old dance progress is preserved without unlocking the next level before Strasbourg',()=>{const api=score(),s={points:510,unlocked:6,completed:[1,2,3,4,5],danseFinished:true};api.migrate(s);assert.equal(s.points,510);assert.equal(s.unlocked,5);assert.deepEqual(s.completed,[1,2,3,4]);assert.equal(api.progress(s,5).index,2);assert.equal(s.quizPassed[5],true);api.migrate(s);assert.equal(s.points,510);});
test('Existing later levels remain accessible; a fresh win is awarded once with session validation',()=>{const api=score(),s={points:600,unlocked:8,completed:[1,2,3,4,5,6,7],danseFinished:true};api.migrate(s);assert.equal(s.unlocked,8);api.beginYoyo(s,'current');assert.equal(api.finishYoyo(s,'stale'),null);assert.equal(api.finishYoyo(s,'current').bonus,30);assert.ok(s.completed.includes(5));assert.equal(s.points,630);assert.equal(api.finishYoyo(s,'current'),null);api.beginYoyo(s,'replay');assert.equal(api.finishYoyo(s,'replay').bonus,0);assert.equal(s.points,630);});
test('The prison game cannot bypass the first board',()=>{const api=score(),s={points:0,unlocked:5,completed:[]};api.migrate(s);assert.equal(api.beginYoyo(s,'bad'),null);assert.equal(api.complete(s,5),false);});

test('The hand targets the brush where it is actually projected, and the caught rope remains in the grip',()=>{const g=createGame();startGame(g);g.brushX=.58;aimAt(g,.58);assert.ok(aligned(g));actionDown(g);assert.equal(g.points,10);continueGame(g);aimAt(g,ropePosition(g));actionDown(g);const caught=ropePosition(g);actionUp(g);tick(g,2);assert.equal(ropePosition(g),caught);assert.equal(g.pull,0);actionDown(g);tick(g,6);assert.equal(g.points,20);});

test('Each posed hand is one connected skin surface and the right cup grip is not reversed',async()=>{
 const {handData}=await import('./yoyo-hands-data.js');
 for(const [name,data]of Object.entries(handData)){
  const bytes=Buffer.from(data.i,'base64'),index=new Uint16Array(bytes.buffer,bytes.byteOffset,bytes.length/2);
  const parent=Array.from({length:data.vertices},(_,i)=>i);
  const root=v=>{while(parent[v]!==v){parent[v]=parent[parent[v]];v=parent[v];}return v;};
  for(let i=0;i<index.length;i+=3){for(let n=0;n<3;n++)assert.ok(index[i+n]<data.vertices);parent[root(index[i+1])]=root(index[i]);parent[root(index[i+2])]=root(index[i]);}
  assert.equal(new Set(parent.map((_,i)=>root(i))).size,1,name+' has no detached finger or wrist');assert.equal(data.nails.length,5);
 }
 assert.ok(handData.cup.nails[4].tip[2]>0,'thumb lies on the near side of the cup');
 assert.ok(handData.cup.nails.slice(0,4).every(n=>n.tip[2]<0),'four fingers curl around the far side');
});

test('Cup grip clears the ceramic wall and the thumb remains visibly opposed',async()=>{
 const {handData}=await import('./yoyo-hands-data.js');
 const cup=handData.cup.nails;
 assert.equal(cup.length,5,'four fingers and one thumb');
 for(const tip of cup.slice(0,4).map(n=>n.tip)){
  const distance=Math.hypot(tip[0],tip[2]);
  assert.ok(tip[2]<-.040,'fingertips wrap behind the cup');
  assert.ok(distance>.044 && distance<.070,'fingertips must remain close to, but outside, the cup wall');
 }
 assert.ok(cup[4].tip[2]>.054,'thumb must stand out in front of the cup');
 assert.ok(cup[4].tip[2]-Math.max(...cup.slice(0,4).map(n=>n.tip[2]))>.09,
  'thumb and fingertips must occupy opposite sides of the cup');
});

test('Cigarette is pinched between the full-length index and middle fingertips',async()=>{
 const {handData}=await import('./yoyo-hands-data.js');
 const fingers=handData.smoke.nails;
 const cigarette={x:-.014,y:.120,z:-.016};
 const [index,middle]=fingers.map(n=>n.tip);
 assert.ok(index[0]<cigarette.x && middle[0]>cigarette.x,'cigarette lies between the fingers');
 assert.ok(Math.abs(index[1]-cigarette.y)<.005 && Math.abs(middle[1]-cigarette.y)<.005,
  'cigarette and both fingertip pads have a shared gripping height');
 assert.ok(Math.abs(index[2]-cigarette.z)<.005 && Math.abs(middle[2]-cigarette.z)<.005,
  'cigarette is not floating behind the fingers');
 assert.ok(index[1]>.11 && middle[1]>.11,'fingers have not been shortened to fake the grip');
 const model=fs.readFileSync(new URL('./yoyo-models.js',import.meta.url),'utf8');
 assert.match(model,/filter points toward the mouth \(\+Z\)/);
 assert.match(model,/cigarette\.position\.set\(-\.014,\.120,-\.016\)/);
});
