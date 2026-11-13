import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8');
const runtime=read('marmousets-3d-runtime.js');
const engine={};
const stateCode='var Ka=1.85,ts=1.05,Ws=-1.27;'+runtime.slice(runtime.indexOf('var nn='),runtime.indexOf('function Yd('));
const bloomCode=runtime.slice(runtime.indexOf('function mmBloom('),runtime.indexOf('// Native instanced'));
// Isolate the actual published state machine; renderer is deliberately absent.
const bloomEnd=runtime.indexOf('\nvar mm',runtime.indexOf('function qd('));
const bloom=runtime.slice(runtime.indexOf('function mmBloom('),bloomEnd);
vm.runInNewContext(stateCode+'\n'+bloom+'\nglobalThis.api={Xd,Xs,qd};',engine);
const {Xd,Xs,qd}=engine.api;
function advance(s,seconds,input=0){for(let t=0;t<seconds;t+=.02)qd(s,.02,input);}
test('Complete course flowers after adult, obstacle and arrival',()=>{
 const s=Xd(true);advance(s,50);assert.equal(s.complete,true);assert.deepEqual(Array.from(s.meadow.events,e=>e.kind),['adult','obstacle','arrival']);assert.equal(s.meadow.target,1);
});
test('Empty jumps and failed obstacle jumps do not flower; new games reset flowers',()=>{
 for(const [x,input] of [[2,0],[12.03,1]]){const s=Xd();s.phase='ride';s.adultClear=true;s.x=x;Xs(s,'jump',input);advance(s,1.6,input);assert.equal(s.meadow,undefined);}
 assert.equal(Xd().meadow,undefined);
});
test('White horse preserves eye contrast and all external buffers exist',()=>{
 const g=JSON.parse(read('assets/marmousets/horse.gltf'));
 for(const n of ['Main','Main_Light','Hair']){const c=g.materials.find(m=>m.name===n).pbrMetallicRoughness.baseColorFactor;assert.ok(c.slice(0,3).every(v=>v>.65),n);}
 assert.ok(g.materials.find(m=>m.name==='Eye_Black').pbrMetallicRoughness.baseColorFactor[0]<.1);
 for(const b of g.buffers)assert.equal(fs.statSync(new URL('assets/marmousets/'+b.uri,import.meta.url)).size,b.byteLength);
});
function bridge(){
 let receive;const sent=[],credits=[];const parent={postMessage:m=>sent.push(m)};
 const w={parent,location:{search:'?embedded=1',origin:'https://game.example'},addEventListener:(event,fn)=>receive=fn};
 const box={URLSearchParams};vm.runInNewContext(read('marmousets-session.js'),box);
 const api=box.MarmousetsSession({window:w,onCredit:m=>credits.push(m)});
 return{api,sent,credits,message:(data,overrides={})=>receive({data,origin:w.location.origin,source:parent,...overrides})};
}
test('Session ignores foreign origins, sources, IDs and demonstrations; awards only once',()=>{
 const {api,sent,credits,message}=bridge();
 message({type:'marmousets:init',id:'x'},{origin:'https://foreign.example'});assert.equal(api.canPlay(),false);
 message({type:'marmousets:init',id:'x'},{source:{}});assert.equal(api.canPlay(),false);
 message({type:'marmousets:init',id:'x'});assert.equal(api.canPlay(),true);
 const state={auto:true,adultClear:true,obstacles:[{id:'barrier',cleared:true}],complete:true};api.observe(state);assert.equal(sent.length,0);
 state.auto=false;api.observe(state);api.observe(state);assert.deepEqual(sent.map(m=>m.type),['marmousets:progress','marmousets:progress','marmousets:won']);
 message({type:'marmousets:credited',id:'wrong'});assert.equal(credits.length,0);
 message({type:'marmousets:credited',id:'x',bonus:10});message({type:'marmousets:credited',id:'x',bonus:10});assert.equal(credits.length,1);
 api.start();api.observe(state);assert.equal(sent.length,3);api.close();assert.equal(sent.at(-1).type,'marmousets:close');
});
test('Board requires both new objectives, rejects stale sessions, preserves once-only bonus',()=>{
 const page=read('jeu.html'),start=page.indexOf('(function(root){',page.indexOf('<!-- MARMOUSETS START -->')),end=page.indexOf('\n\n(function(){',start),box={};vm.runInNewContext(page.slice(start,end),box);const a=box.MarmousetsScore,s={points:20};
 a.begin(s,true,'x');assert.equal(a.record(s,'stale','scared','a1'),false);assert.equal(a.settle(s,'x'),null);
 a.record(s,'x','scared','a1');assert.equal(a.settle(s,'x'),null);a.record(s,'x','cleared','barrier');assert.equal(a.settle(s,'x').bonus,10);assert.equal(s.points,30);assert.equal(a.settle(s,'x'),null);
 a.begin(s,true,'y');a.record(s,'y','scared','a1');a.record(s,'y','cleared','barrier');assert.equal(a.settle(s,'y').bonus,0);
 a.begin(s,false,'z');a.record(s,'z','scared','a1');a.record(s,'z','cleared','barrier');assert.equal(a.settle(s,'z').retryQuestion,true);assert.equal(s.points,30);
});
test('Published page retains book and board navigation and all production assets',()=>{
 const p=read('arcade-marmousets.html'),build=read('build-public.mjs');assert.match(p,/Chapitre 1 · partie 1\/3/);assert.match(p,/lecture.html\?niveau=1/);assert.match(p,/jeu.html\?niveau=1/);assert.doesNotMatch(p,/NON PUBLIÉE|scène d’essai/);
 for(const f of ['marmousets-session.js','marmousets-3d-runtime.js',...['horse.gltf','horse.bin','adult.glb','child.glb','tree.glb','bush.glb'].map(f=>'assets/marmousets/'+f)])assert.ok(build.includes("'"+f+"'"),f);
});
