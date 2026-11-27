const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createBridge}=require('./sarajevo-v31-bridge.js');
test('V31 starts after intro and credits board once on completion',()=>{
 let complete=false,mounts=0,unmounts=0;
 const events=[];
 const bridge=createBridge({mount:()=>mounts++,unmount:()=>unmounts++,readProgress:()=>({complete}),flow:{progress:p=>events.push(p),won:()=>events.push('won')}});
 bridge.reset();bridge.setPaused(true);assert.equal(mounts,0);
 bridge.setPaused(false);bridge.setPaused(false);assert.equal(mounts,1);
 assert.equal(bridge.poll(),false);complete=true;
 assert.equal(bridge.poll(),true);assert.equal(bridge.poll(),false);
 assert.deepEqual(events,[[1,2,3,4,5],'won']);
 bridge.setPaused(true);bridge.setPaused(false);assert.equal(mounts,1);
 bridge.reset();complete=false;bridge.setPaused(false);assert.equal(mounts,2);
});
