import test from 'node:test';
import assert from 'node:assert/strict';
import {renderPixelRatio,windowScale,ropeWorldX,constrainBagX,BAR_Z,BAG_CLEARANCE} from './prison-3d-spatial.js';
import {createGame,startGame,setWindowAspect,slitCenters,SLIT_X,aimAt,actionDown,advance} from './yoyo-core.js';

test('High-density phone rendering retains 2x detail within a bounded pixel budget',()=>{
 assert.equal(renderPixelRatio(390,800,3),2);
 assert.equal(renderPixelRatio(844,390,2),2);
 assert.equal(renderPixelRatio(1000,700,1),1);
 const ratio=renderPixelRatio(1920,1080,3);
 assert.ok(ratio>1&&ratio<2);
 assert.ok(1920*1080*ratio*ratio<=3_200_001);
});
test('Portrait and landscape use the same physical gaps as the original rules',()=>{
 for(const aspect of [.85,1.6,2.5]){
  const game=createGame();setWindowAspect(game,aspect);
  for(const [i,center]of slitCenters(aspect).entries())assert.ok(Math.abs(ropeWorldX(game,center)-SLIT_X[i])<1e-12);
  assert.ok(windowScale(aspect)>0);
 }
});
test('A partially pulled bag cannot be dragged sideways through a steel bar',()=>{
 for(const opening of SLIT_X){
  for(const z of [BAR_Z-.07,BAR_Z,BAR_Z+.07]){
   assert.equal(constrainBagX(opening,opening+1,z),opening+BAG_CLEARANCE);
   assert.equal(constrainBagX(opening,opening-1,z),opening-BAG_CLEARANCE);
   assert.equal(constrainBagX(opening,opening+.01,z),opening+.01);
  }
  assert.equal(constrainBagX(opening,opening+1,BAR_Z+.2),opening+1);
 }
});
test('The original rules still prevent forward pulling outside an opening',()=>{
 const game=createGame();startGame(game);game.part=1;
 const slot=slitCenters(game.aspect)[1];game.aim=slot;game.hookX=slot;game.hooked=true;
 actionDown(game);advance(game,.1);assert.ok(game.pull>0);
 aimAt(game,.5);const stopped=game.pull;advance(game,.1);assert.equal(game.pull,stopped);
});
