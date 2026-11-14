import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=n=>fs.readFileSync(new URL(n,import.meta.url),'utf8');
function setup(){
 const box={},sent=[],films=[],resets=[],pauses=[];
 vm.runInNewContext(read('sarajevo-cinema.js'),box);
 const flow=box.createSarajevoFlow({embedded:true,send:m=>sent.push(m),game:{reset:p=>resets.push([...p]),setPaused:p=>pauses.push(p)},film:(name,end)=>films.push({name,end})});
 return {flow,sent,films,resets,pauses};
}
test('Intro owns controls until completion and scoring stays once-only',()=>{
 const f=setup();f.flow.init({id:'a',passed:[1,2]});assert.equal(f.films.length,0);
 f.flow.ready();assert.deepEqual(f.resets,[[1,2]]);assert.equal(f.flow.blocking,true);
 f.flow.progress([1,2,3]);f.flow.won();assert.equal(f.sent.length,1);
 f.films[0].end();f.films[0].end();assert.equal(f.flow.blocking,false);
 f.flow.progress([1,2,3]);f.flow.progress([1,2,3]);assert.equal(f.sent.filter(m=>m.type==='bosnie:pass').length,1);
 f.flow.progress([1,2,3,4,5]);f.flow.won();f.flow.won();
 assert.equal(f.films.length,2);assert.equal(f.flow.blocking,true);
 assert.equal(f.sent.filter(m=>m.type==='bosnie:won').length,1);
 assert.equal(f.sent.at(-1).outro,true);
 f.films[1].end();f.films[1].end();assert.equal(f.sent.filter(m=>m.type==='bosnie:outro-ended').length,1);
 assert.equal(f.flow.stage,'done');
});
test('A new session invalidates stale video callbacks; replay starts from the first cover',()=>{
 const f=setup();f.flow.ready();f.flow.init({id:'old',passed:[1]});const oldEnd=f.films[0].end;
 f.flow.init({id:'new',passed:[1,2,3,4,5],replay:true});oldEnd();assert.equal(f.flow.stage,'intro');
 assert.deepEqual(f.resets,[ [1],[] ]);f.films[1].end();f.flow.won();const stale=f.films[2].end;
 f.flow.stop();stale();assert.equal(f.sent.filter(m=>m.type==='bosnie:outro-ended').length,0);
});
test('Board waits for the exact Sarajevo outro session, never the old 1.8-second timer',()=>{
 const listeners={},timers=new Map(),source={},closed=[];let next=1;
 const elements={bosnieFrame:{contentWindow:source},bosnieDialog:{open:true},bosnieClose:{click:()=>closed.push(4),addEventListener(){}}};
 const w={addEventListener:(type,fn)=>listeners[type]=fn};
 const box={window:w,location:{origin:'https://test.example'},state:{selected:4},flow:{chapter2PartDone:()=>true},boardRolling:false,
  $:id=>elements[id],updateProgressBar(){},rollTravel(){},queueMicrotask:fn=>fn(),setTimeout:(fn,delay)=>{const id=next++;timers.set(id,{fn,delay});return id;},clearTimeout:id=>timers.delete(id)};
 const src=read('chapitre1-plateau.js');vm.runInNewContext(src.slice(src.indexOf(' let pendingAuto='),src.lastIndexOf('\n})();')),box);
 const message=(type,id='round-4',overrides={})=>listeners.message({origin:box.location.origin,source,data:{type,id,outro:true},...overrides});
 message('bosnie:won');assert.equal(timers.size,0);
 message('bosnie:outro-ended','wrong');message('bosnie:outro-ended','round-4',{source:{}});message('bosnie:outro-ended','round-4',{origin:'https://foreign.example'});assert.equal(timers.size,0);
 message('bosnie:outro-ended');message('bosnie:outro-ended');assert.equal(timers.size,1);
 [...timers.values()][0].fn();assert.deepEqual(closed,[4]);
 w.TreizeSceneNavigation.cancelAutomatic();message('bosnie:outro-ended');assert.equal(timers.size,0);
});
