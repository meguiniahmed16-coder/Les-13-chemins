import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=name=>fs.readFileSync(new URL(name,import.meta.url),'utf8');

function film(){
 const nodes={},events=[];
 for(const id of ['marmousetsOutro','marmousetsFilm','marmousetsFilmPlay','marmousetsFilmSkip','marmousetsFilmStatus']){
  const listeners={};nodes[id]={hidden:true,open:false,dataset:{src:'https://example.test/corrected.mp4'},listeners,
   addEventListener:(type,fn)=>listeners[type]=fn,getAttribute(name){return this[name]||null;},
   showModal(){this.open=true;},close(){this.open=false;},focus(){},load(){},
   pause(){events.push('pause');},play(){events.push('play');return Promise.resolve();}};
 }
 const box={};vm.runInNewContext(read('marmousets-outro.js'),box);
 let ends=0;const api=box.MarmousetsOutro({document:{getElementById:id=>nodes[id]},onEnd:()=>ends++});
 return{api,nodes,events,ends:()=>ends,video:nodes.marmousetsFilm};
}
test('The finale starts once with sound, ends once, and resets for a new game',async()=>{
 const f=film();f.api.prime();assert.equal(f.api.active,false);assert.equal(f.ends(),0);
 assert.equal(f.api.start(),true);assert.equal(f.api.start(),false);
 assert.equal(f.video.muted,false);assert.equal(f.video.autoplay,true);assert.equal(f.video.currentTime,0);
 assert.equal(f.nodes.marmousetsOutro.open,true);
 f.video.listeners.ended();f.video.listeners.ended();assert.equal(f.ends(),1);
 assert.equal(f.api.completed,true);assert.equal(f.nodes.marmousetsOutro.open,false);
 assert.equal(f.api.start(),false);f.api.reset();assert.equal(f.api.start(),true);
 f.nodes.marmousetsFilmSkip.onclick();assert.equal(f.ends(),2);
});
test('Autoplay refusal offers a gesture without losing the ending or continuing the journey',async()=>{
 const f=film();f.video.play=()=>Promise.reject(Object.assign(new Error('blocked'),{name:'NotAllowedError'}));
 f.api.start();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(f.nodes.marmousetsFilmPlay.hidden,false);assert.match(f.nodes.marmousetsFilmStatus.textContent,/avec le son/);
 assert.equal(f.api.active,true);assert.equal(f.ends(),0);
 f.video.play=()=>Promise.resolve();f.nodes.marmousetsFilmPlay.onclick();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(f.nodes.marmousetsFilmPlay.hidden,true);assert.equal(f.ends(),0);
 f.video.listeners.ended();assert.equal(f.ends(),1);
});
test('Load failure remains skippable and a late play rejection cannot reopen a reset ending',async()=>{
 const f=film();let reject;f.video.play=()=>new Promise((_,r)=>reject=r);
 f.api.start();f.video.listeners.error();assert.equal(f.nodes.marmousetsFilmPlay.hidden,false);
 f.api.reset();reject(new Error('late'));await new Promise(resolve=>setImmediate(resolve));
 assert.equal(f.nodes.marmousetsFilmPlay.hidden,true);assert.equal(f.api.active,false);assert.equal(f.ends(),0);
});
test('The score is credited at victory; the outro completion is a separate once-only session event',()=>{
 const sent=[],parent={postMessage:m=>sent.push(m)},course={adults:[{id:'parent'}],obstacles:[{id:'gate'}]};let receive;
 const w={parent,MarmousetsCourse:course,location:{search:'?embedded=1',origin:'https://test.example'},addEventListener:(_,fn)=>receive=fn};
 const box={URLSearchParams};vm.runInNewContext(read('marmousets-session.js'),box);
 const session=box.MarmousetsSession({window:w,hasOutro:true});
 receive({data:{type:'marmousets:init',id:'round-1'},origin:w.location.origin,source:parent});
 session.outroEnded();assert.equal(sent.length,0);
 const state={complete:true,auto:true,adults:[{id:'parent',fleeTime:0}],obstacles:[{id:'gate',cleared:true}]};
 session.observe(state);assert.equal(sent.length,0,'No finale or points for the demo');
 state.auto=false;session.observe(state);session.observe(state);
 assert.equal(sent.filter(m=>m.type==='marmousets:won').length,1);assert.equal(sent.at(-1).outro,true);
 session.outroEnded();session.outroEnded();assert.equal(sent.filter(m=>m.type==='marmousets:outro-ended').length,1);
 assert.equal(sent.at(-1).id,'round-1');
});
test('The board waits through the whole film and only accepts completion from this game and session',()=>{
 const listeners={},timers=new Map(),source={},closed=[],travel=[];let next=1;
 const elements={marmousetsFrame:{contentWindow:source},marmousetsDialog:{open:true},marmousetsClose:{click:()=>closed.push(1),addEventListener(){}}};
 const w={addEventListener:(type,fn)=>listeners[type]=fn};
 const box={window:w,location:{origin:'https://test.example'},state:{selected:1},flow:{partDone:()=>true},boardRolling:false,
  $:id=>elements[id],updateProgressBar(){},rollTravel:n=>travel.push(n),queueMicrotask:fn=>fn(),
  setTimeout:(fn,delay)=>{const id=next++;timers.set(id,{fn,delay});return id;},clearTimeout:id=>timers.delete(id)};
 const src=read('chapitre1-plateau.js');
 vm.runInNewContext(src.slice(src.indexOf(' let pendingAuto='),src.lastIndexOf('\n})();')),box);
 const message=(type,id='round-1',overrides={})=>listeners.message({origin:box.location.origin,source,data:{type,id,outro:true},...overrides});
 message('marmousets:won');assert.equal(timers.size,0,'The old 1.8 second transition must not cut the movie');
 message('marmousets:outro-ended','wrong');assert.equal(timers.size,0);
 message('marmousets:outro-ended','round-1',{source:{}});assert.equal(timers.size,0);
 message('marmousets:outro-ended','round-1',{origin:'https://foreign.example'});assert.equal(timers.size,0);
 message('marmousets:outro-ended');assert.equal(timers.size,1);
 message('marmousets:outro-ended');assert.equal(timers.size,1);
 [...timers.values()][0].fn();assert.deepEqual(closed,[1]);
 w.TreizeSceneNavigation.cancelAutomatic();message('marmousets:outro-ended');assert.equal(timers.size,0);
 assert.deepEqual(travel,[]);
});
