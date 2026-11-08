import test from 'node:test';
import assert from 'node:assert/strict';
import {PASSAGES,createCompanionState,updateCompanion} from './bosnie-compagnon-core.js';

test('A second soldier runs ahead through all five passages without changing gameplay',()=>{
  const ally=createCompanionState();
  for(let i=0;i<5;i++){
    const passed=Array.from({length:i},(_,j)=>j+1);
    const initial={passed,time:10*i,phase:'playing',x:i===0?3:PASSAGES[i-1].end+.35,crouched:true,exposure:0,failures:0};
    const before=JSON.stringify(initial);
    const start=updateCompanion(ally,initial);
    assert.equal(JSON.stringify(initial),before,'gameplay must not be mutated');
    assert.equal(start.stage,i);
    assert.equal(start.invulnerable,true);
    const midway=updateCompanion(ally,{...initial,time:10*i+1});
    assert(midway.x>start.x,'companion must run first');
    const safe=updateCompanion(ally,{...initial,time:10*i+2.1,x:PASSAGES[i].start});
    assert.equal(safe.running,false);
    assert(safe.x>PASSAGES[i].start&&safe.x<PASSAGES[i].end,'ally waits near shelter');
    assert.equal(safe.playerAhead,false);
    const overtaken=updateCompanion(ally,{...initial,time:10*i+2.2,x:PASSAGES[i].end+.5});
    assert.equal(overtaken.playerAhead,true,'player overtakes comrade');
  }
});
test('The companion stays safe through shots, hits, pauses, binoculars and victory',()=>{
  const ally=createCompanionState();
  const base={passed:[],time:0,phase:'ready',x:3.1,binoculars:false};
  assert.equal(updateCompanion(ally,base).running,false);
  let run=updateCompanion(ally,{...base,time:1.6,phase:'hit',x:10.2,failures:1});
  assert.equal(run.invulnerable,true);
  assert.equal(ally.stage,0);
  let hide=updateCompanion(ally,{...base,time:1.7,phase:'playing',binoculars:true});
  assert.equal(hide.visible,false);
  const win=updateCompanion(ally,{...base,time:85,phase:'won',passed:[1,2,3,4,5],x:84});
  assert.equal(win.stage,5);
  assert.equal(win.playerAhead,true);
  assert.equal(win.invulnerable,true);
});
