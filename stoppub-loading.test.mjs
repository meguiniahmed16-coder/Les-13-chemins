import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('jeu-stoppub.html',import.meta.url),'utf8');
const source=html.match(/<script>\s*(\/\* Track downloaded bytes[\s\S]*?)<\/script>/)[1];
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function setup({failure=false,legacy=false}={}){
 const panel={dataset:{},hidden:false},message={},retry={hidden:true},history=[],executed=[],blobs=new Map(),timers=[];
 const bar={set value(value){history.push(value);this.current=value;},get value(){return this.current;}};
 const scripts=Array.from({length:3},(_,index)=>({src:'asset-'+index,dataset:{gameBytes:'100'}}));
 let counter=0;
 const context={Blob,Uint8Array,AbortController,console:{error(){}},location:{reload(){}},requestAnimationFrame:fn=>queueMicrotask(fn),setTimeout:fn=>timers.push(fn),
  URL:{createObjectURL(blob){const url='blob:'+counter++;blobs.set(url,blob);return url;},revokeObjectURL(url){blobs.delete(url);}},
  fetch:async url=>{
   if(failure&&url==='asset-1')return{ok:false,status:503};
   let chunk=0;
   return{ok:true,arrayBuffer:async()=>new Uint8Array(100).buffer,body:legacy?null:{getReader:()=>({read:async()=>chunk++<2?{done:false,value:new Uint8Array(50)}:{done:true}})}};
  },
  document:{getElementById:id=>({'game-loading':panel,'game-load-message':message,'game-load-retry':retry}[id]),querySelectorAll:selector=>selector==='.game-load-progress'?[bar]:selector==='.game-load-value'?[{}]:scripts,createElement:()=>({remove(){}}),body:{append:script=>{executed.push(script.src);queueMicrotask(()=>script.onload());}}}
 };
 context.window={addEventListener(){}};vm.runInNewContext(source,context);
 return{panel,message,retry,history,executed,blobs,timers,controller:context.window.RepubliqueLoading};
}
test('Download bytes advance progressively; 100% waits for scene readiness',async()=>{
 const s=setup();await flush();
 assert.ok(s.history.some(p=>p>0&&p<90));
 assert.equal(s.history.at(-1),90);assert.equal(s.executed.length,3);assert.equal(s.blobs.size,0);
 assert.ok(s.history.every((p,i)=>i===0||p>=s.history[i-1]));
 assert.equal(s.panel.hidden,false);
 for(const phase of ['hands','couloir','affiche','recul','affiche-1','station','actors','crowd','scene'])await s.controller.step(phase);
 assert.equal(s.history.at(-1),99);await s.controller.step('scene');assert.equal(s.history.at(-1),99);
 s.controller.ready();assert.equal(s.history.at(-1),100);assert.equal(s.panel.hidden,false);
 s.timers.forEach(fn=>fn());assert.equal(s.panel.hidden,true);
});
test('A failed asset stops launch and exposes a retry without claiming completion',async()=>{
 const s=setup({failure:true});await flush();
 assert.equal(s.retry.hidden,false);assert.equal(s.panel.hidden,false);assert.equal(s.executed.length,0);assert.equal(s.blobs.size,0);
 s.controller.ready();assert.ok(s.history.every(p=>p<100));
});
test('Browsers without a readable response stream can still load the game',async()=>{
 const s=setup({legacy:true});await flush();assert.equal(s.history.at(-1),90);assert.equal(s.executed.length,3);
});
