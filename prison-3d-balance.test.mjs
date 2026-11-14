import test from 'node:test';
import assert from 'node:assert/strict';
import {PRISON_BALANCE} from './prison-3d-balance.js';
import {createGame,startGame,continueGame,aimAt,actionDown,advance,hide,pauseGame,
 BRUSH,ropePosition,ropeReachable,slitCenters,setWindowAspect} from './yoyo-core.js';
import {ropeWorldX} from './prison-3d-spatial.js';

const STEP=.01;
function tick(game,seconds){
 for(let frame=0;frame<Math.round(seconds/STEP);frame++)advance(game,STEP);
}
function until(game,predicate,seconds,message){
 const started=game.time;
 for(let frame=0;!predicate()&&frame<Math.ceil(seconds/STEP);frame++)advance(game,STEP);
 assert.ok(predicate(),message+'; phase='+game.phase+', guard='+game.guard+', time='+game.time);
 return game.time-started;
}
function close(actual,expected,tolerance=.021){
 assert.ok(Math.abs(actual-expected)<=tolerance,actual+' should be close to '+expected);
}
function fresh(tuning=PRISON_BALANCE){const game=createGame(tuning);startGame(game);return game;}
function takeBrush(game){
 aimAt(game,BRUSH.x);actionDown(game);
 assert.equal(game.points,10);assert.equal(game.phase,'between');continueGame(game);
}
function hook(game){
 aimAt(game,ropePosition(game));actionDown(game);assert.equal(game.hooked,true);
}

test('The gentle guard allows 28 seconds, warns for four, then leaves 32 seconds of calm',()=>{
 const game=fresh();hide(game);
 tick(game,27.9);assert.equal(game.guard,'away');
 until(game,()=>game.guard==='approaching',.2,'The first patrol approaches');
 close(game.time,28);
 const approach=game.time;
 tick(game,3.9);assert.equal(game.guard,'approaching','The warning remains readable');
 until(game,()=>game.guard==='watching',.2,'The inspection begins after its warning');
 close(game.time-approach,4);
 const watching=game.time;
 until(game,()=>game.guard==='leaving',2.6,'The inspection ends');
 close(game.time-watching,2.5);
 const leaving=game.time;
 until(game,()=>game.guard==='away',1.6,'The guard finishes leaving');
 close(game.time-leaving,1.5);
 const calm=game.time;
 tick(game,31.9);assert.equal(game.guard,'away','No repeated patrol during the long respite');
 until(game,()=>game.guard==='approaching',.2,'A later patrol can still return');
 close(game.time-calm,32);
 assert.equal(game.phase,'playing','Hiding survives the entire patrol');
});

test('Every new trial and a full restart preserve the generous patrol delay',()=>{
 const game=fresh();takeBrush(game);
 tick(game,27.8);assert.equal(game.guard,'away');
 hook(game);
 until(game,()=>game.part===2,2.1,'The tobacco is collected during the warning');
 assert.equal(game.guard,'approaching');
 continueGame(game);assert.equal(game.guard,'away');
 const coffeeStart=game.time;
 tick(game,27.9);assert.equal(game.guard,'away','Coffee also starts with a full respite');
 until(game,()=>game.guard==='approaching',.2,'The coffee patrol eventually returns');
 close(game.time-coffeeStart,28);
 startGame(game);
 assert.equal(game.points,0);assert.equal(game.part,0);assert.equal(game.time,0);
 tick(game,27.9);assert.equal(game.guard,'away','Restart retains the selected difficulty');
 until(game,()=>game.guard==='approaching',.2,'Restart still uses the gentle first delay');
 close(game.time,28);
});

test('Two seconds of reaction time remain after the warning, while hiding still protects',()=>{
 const game=fresh();hide(game);
 until(game,()=>game.guard==='watching',33,'The guard reaches the window');
 aimAt(game,.5);tick(game,1.9);
 assert.equal(game.phase,'playing','A slow reaction no longer loses after 0.62 seconds');
 hide(game);tick(game,.2);assert.equal(game.phase,'playing');
 assert.equal(game.exposed,0,'Hiding clears accumulated exposure');

 const exposed=fresh();hide(exposed);
 until(exposed,()=>exposed.guard==='watching',33,'The second inspection begins');
 aimAt(exposed,.5);tick(exposed,2.05);
 assert.equal(exposed.phase,'caught','Ignoring the entire warning still has a consequence');
});

test('A bag takes about two seconds of actual pulling, and pause or hiding adds no progress',()=>{
 const game=fresh();takeBrush(game);hook(game);
 tick(game,.5);close(game.pull,.25,.000001);
 pauseGame(game);const suspended=JSON.stringify(game);tick(game,10);
 assert.equal(JSON.stringify(game),suspended,'Pause freezes the real rules and clock');
 pauseGame(game);actionDown(game);tick(game,.2);close(game.pull,.35,.000001);
 hide(game);const held=game.pull;tick(game,2);
 assert.equal(game.pull,held,'Being hidden does not retrieve the bag');
 actionDown(game);tick(game,1.28);
 assert.equal(game.part,1,'1.98 active seconds must not award early');
 tick(game,.04);assert.equal(game.part,2);assert.equal(game.points,20);
 continueGame(game);hook(game);
 const start=game.time;
 until(game,()=>game.part===3,2.1,'Coffee uses the same short pull');
 close(game.time-start,2);assert.equal(game.points,30);assert.equal(game.phase,'victory');
});

test('The gently swaying rope stays in a physical opening in portrait and wide landscape',()=>{
 for(const aspect of [.85,1,1.6,2.5]){
  const game=fresh();takeBrush(game);setWindowAspect(game,aspect);
  for(const part of [1,2]){
   assert.equal(game.part,part);let greatestOffset=0;
   const center=ropeWorldX(game,slitCenters(aspect)[part===2?2:1]);
   for(let frame=0;frame<1200;frame++){
    const position=ropeWorldX(game,ropePosition(game));
    greatestOffset=Math.max(greatestOffset,Math.abs(position-center));
    assert.ok(ropeReachable(game),'The visible rope must stay reachable at ratio '+aspect);
    assert.ok(Math.abs(position-center)<=.024000001,'Sway is measured in metres, not screen width');
    advance(game,STEP);
   }
   assert.ok(greatestOffset>.023,'The rope still moves visibly instead of being frozen');
   hook(game);until(game,()=>game.part===part+1,2.1,'A swaying rope can still be collected');
   if(part===1)continueGame(game);
  }
 }
});

test('Omitting the prototype tuning preserves the original patrol and retrieval pace',()=>{
 const game=createGame();startGame(game);hide(game);
 tick(game,9.7);assert.equal(game.guard,'away');
 until(game,()=>game.guard==='approaching',.2,'The original first patrol approaches');
 close(game.time,9.8);
 const approach=game.time;
 until(game,()=>game.guard==='watching',2.9,'The original warning ends');
 close(game.time-approach,2.8);
 aimAt(game,.5);tick(game,.6);assert.equal(game.phase,'playing');
 tick(game,.04);assert.equal(game.phase,'caught','The original exposure rule stays unchanged');

 const bag=createGame();startGame(bag);takeBrush(bag);hook(bag);
 tick(bag,5.2);assert.equal(bag.part,1,'The original pull remains longer than five seconds');
 until(bag,()=>bag.part===2,.1,'The original pull completes');
 close(bag.time,1/.19);
 continueGame(bag);close(bag.nextGuard-bag.time,10.4,.000001);
});
