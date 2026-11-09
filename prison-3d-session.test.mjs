import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createPrisonSession} from './prison-3d-session.js';

const ORIGIN='https://example.test';
const init=(id='first',replay=false)=>({type:'yoyo:init',id,level:5,plateau:2,replay});
const finished=(id='first',replay=false)=>({type:'yoyo:finished',id,bonus:replay?0:30,score:540,replay});

function harness({embedded=true,parentReceive=()=>{}}={}){
 const listeners=new Map(),messages=[],navigations=[],replays=[],results=[];
 const parent={postMessage(data,origin){messages.push({data:structuredClone(data),origin});parentReceive(data,origin);}};
 const host={
  location:{origin:ORIGIN,href:ORIGIN+'/jeu-yoyo.html?embedded=1',assign:url=>navigations.push(url)},
  addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);},
  removeEventListener(type,fn){listeners.get(type)?.delete(fn);},
  emit(type,event={}){for(const fn of [...listeners.get(type)||[]])fn(event);}
 };
 host.parent=embedded?parent:host;
 Object.defineProperty(host,'localStorage',{get(){throw new Error('The game must never edit board storage');}});
 const api=createPrisonSession({host,onReplay:session=>replays.push(session),onFinished:result=>results.push(result)});
 const receive=(data,extra={})=>host.emit('message',{source:parent,origin:ORIGIN,data,...extra});
 return {host,parent,api,messages,navigations,replays,results,receive,listeners,
  sent:type=>messages.filter(message=>message.data.type===type)};
}

test('An early parent init is retained without starting or resetting the game before readiness',()=>{
 const h=harness();
 h.receive(init());h.receive(init());
 assert.equal(h.api.ready,false);assert.equal(h.api.session.id,'first');
 assert.deepEqual(h.replays,[]);assert.deepEqual(h.messages,[]);
 assert.ok(Object.isFrozen(h.api.session));
 assert.equal(h.api.sendReady(),true);assert.equal(h.api.sendReady(),false);
 h.receive(init());
 assert.deepEqual(h.replays,[],'Initial and duplicate initialization must not restart gameplay');
 assert.deepEqual(h.messages,[{data:{type:'yoyo:ready',id:'first'},origin:ORIGIN}]);
 h.api.dispose();
});

test('Only the actual same-origin parent can initialize this level and receive its single 30-point win',()=>{
 const h=harness();h.api.sendReady();
 assert.equal(h.api.win(),true);assert.equal(h.api.win(),false);
 for(const data of [null,'yoyo:init',[],init(''),init('   '),{...init(),id:7},
  {...init(),level:4},{...init(),plateau:1},{...init(),replay:'yes'}])h.receive(data);
 h.receive(init('foreign'),{origin:'https://foreign.test'});
 h.receive(init('sibling'),{source:{}});
 assert.equal(h.api.session,null);assert.equal(h.sent('yoyo:won').length,0);
 h.receive(init());h.receive(init());h.api.win();
 assert.deepEqual(h.sent('yoyo:won'),[{data:{type:'yoyo:won',id:'first',points:30},origin:ORIGIN}]);
 assert.equal(h.api.wonSent,true);
 h.api.dispose();
});

test('A victory reported before the first rendered frame waits for both readiness and its session',()=>{
 const h=harness();h.receive(init());h.api.win();
 assert.equal(h.sent('yoyo:won').length,0);
 h.api.sendReady();
 assert.deepEqual(h.messages.map(message=>message.data.type),['yoyo:ready','yoyo:won']);
 h.api.sendReady();h.receive(init());h.api.win();
 assert.equal(h.sent('yoyo:won').length,1);
 h.api.dispose();
});

test('Replay waits for the matching finished acknowledgement and a fresh parent ID',()=>{
 const h=harness();h.receive(init());h.api.sendReady();
 h.receive(finished());assert.equal(h.api.finished,false,'An acknowledgement cannot manufacture a win');
 assert.equal(h.api.replay(),false);h.api.win();
 assert.equal(h.api.replay(),true);assert.equal(h.api.replay(),false);
 assert.equal(h.api.replayPending,true);assert.equal(h.sent('yoyo:replay').length,0);
 h.receive(finished(),{origin:'https://foreign.test'});h.receive(finished(),{source:{}});
 h.receive(finished('stale'));h.receive({...finished(),bonus:300});
 h.receive({...finished(),score:NaN});h.receive({...finished(),replay:true});
 assert.equal(h.api.finished,false);assert.equal(h.results.length,0);
 h.receive(finished());h.receive(finished());
 assert.equal(h.api.finished,true);assert.equal(h.results.length,1);
 assert.ok(Object.isFrozen(h.api.result));
 assert.deepEqual(h.sent('yoyo:replay'),[{data:{type:'yoyo:replay',id:'first'},origin:ORIGIN}]);
 assert.deepEqual(h.replays,[],'The old credited session must not restart while waiting for the parent');
 h.receive(init('second',true));h.receive(init('second',true));h.receive(init('first'));
 assert.equal(h.api.session.id,'second');assert.equal(h.replays.length,1);
 assert.equal(h.replays[0].id,'second');assert.equal(h.api.finished,false);
 assert.equal(h.api.replayPending,false);assert.equal(h.api.wonSent,false);
 h.receive(finished('first'));assert.equal(h.api.finished,false);
 h.api.win();h.api.win();h.receive(finished('second',true));
 assert.equal(h.sent('yoyo:won').length,2);
 assert.deepEqual(h.sent('yoyo:won').map(message=>message.data.id),['first','second']);
 assert.equal(h.api.result.bonus,0);assert.equal(h.results.length,2);
 h.api.dispose();
});

test('Replacement sessions received during loading coalesce into one restart after readiness',()=>{
 const h=harness();
 h.receive(init('first'));h.api.win();
 h.receive(init('second',true));h.receive(init('third',true));
 assert.deepEqual(h.replays,[]);assert.equal(h.sent('yoyo:won').length,0);
 h.api.sendReady();
 assert.deepEqual(h.replays.map(session=>session.id),['third']);
 assert.equal(h.sent('yoyo:won').length,0,'An old round cannot credit a replacement session');
 h.receive(init('second',true));h.receive(init('third',true));
 assert.equal(h.api.session.id,'third');assert.equal(h.replays.length,1);
 h.api.dispose();
});

test('Standalone play, including an embedded query string, never sends or credits board points',()=>{
 const h=harness({embedded:false});
 assert.equal(h.api.embedded,false);
 h.receive(init(),{source:h.host});
 h.api.sendReady();h.api.win();h.receive(finished(),{source:h.host});
 assert.equal(h.api.session,null);assert.equal(h.api.wonSent,false);assert.equal(h.api.finished,false);
 assert.deepEqual(h.messages,[]);assert.deepEqual(h.results,[]);
 assert.equal(h.api.replay(),true);assert.deepEqual(h.replays,[null]);
 assert.equal(h.api.win(),true);assert.deepEqual(h.messages,[]);
 assert.equal(h.api.close(),true);assert.equal(h.api.close(),false);
 assert.deepEqual(h.navigations,['jeu.html?niveau=5']);
 assert.equal(h.api.win(),false);assert.equal(h.api.replay(),false);
});

test('Closing an embedded game delegates navigation to the parent even before initialization',()=>{
 const h=harness();
 assert.equal(h.api.close(),true);assert.equal(h.api.close(),false);
 assert.deepEqual(h.messages,[{data:{type:'yoyo:close'},origin:ORIGIN}]);
 assert.deepEqual(h.navigations,[]);
 h.receive(init());assert.equal(h.api.session,null);
 assert.equal(h.api.win(),false);assert.equal(h.api.sendReady(),false);
 assert.equal(h.listeners.get('message').size,0);assert.equal(h.listeners.get('pagehide').size,0);
});

test('Page navigation disposes listeners without late victory, replay or close messages',()=>{
 const h=harness();h.api.sendReady();h.api.win();
 h.host.emit('pagehide');h.receive(init());
 assert.equal(h.api.win(),false);assert.equal(h.api.replay(),false);assert.equal(h.api.close(),false);
 assert.deepEqual(h.messages,[{data:{type:'yoyo:ready'},origin:ORIGIN}]);
 assert.equal(h.listeners.get('message').size,0);assert.equal(h.listeners.get('pagehide').size,0);
 assert.equal(h.api.dispose(),false);
});

test('The existing board core credits 30 once, opens a new replay session and awards no replay bonus',()=>{
 const context=vm.createContext({TreizeEtapesData:[{level:5,plateaux:[{},{}]}]});
 vm.runInContext(readFileSync(new URL('./plateaux-core.js',import.meta.url),'utf8'),context);
 const flow=context.TreizePlateaux;
 const state={points:510,unlocked:5,completed:[1,2,3,4],platesVersion:1};
 flow.done(state,5,1);flow.beginYoyo(state,'board-first');
 let h,closed=0;
 const handle=(message,origin)=>{
  assert.equal(origin,ORIGIN);
  if(message.type==='yoyo:ready')h.receive({type:'yoyo:init',...state.yoyoPending});
  if(message.type==='yoyo:won'&&message.points===30){
   const result=flow.finishYoyo(state,message.id);
   if(result)h.receive({type:'yoyo:finished',id:message.id,...result});
  }
  if(message.type==='yoyo:replay'&&state.yoyoFinished&&!state.yoyoPending){
   flow.beginYoyo(state,'board-replay');h.receive({type:'yoyo:init',...state.yoyoPending});
  }
  if(message.type==='yoyo:close')closed++;
 };
 h=harness({parentReceive:handle});
 h.api.sendReady();h.api.win();h.api.win();
 assert.equal(state.points,540);assert.equal(state.unlocked,6);
 assert.ok(state.completed.includes(5));assert.equal(h.api.result.bonus,30);
 handle({type:'yoyo:won',id:'board-first',points:30},ORIGIN);
 assert.equal(state.points,540,'Even a repeated delivery cannot credit the real parent twice');
 h.api.replay();assert.equal(h.api.session.id,'board-replay');assert.equal(h.replays.length,1);
 h.api.win();assert.equal(h.api.result.bonus,0);assert.equal(state.points,540);
 h.api.close();assert.equal(closed,1);assert.deepEqual(h.navigations,[]);
 assert.equal(h.sent('yoyo:close')[0].data.id,'board-replay');
});
