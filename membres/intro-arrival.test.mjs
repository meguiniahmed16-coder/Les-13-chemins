import test from 'node:test';
import assert from 'node:assert/strict';
import {arrivalFrame,createArrivalPlayer,ARRIVAL_DURATION,PROMOTION} from './intro-arrival.js';

function target(){const events=new Map();return {addEventListener(type,fn){const list=events.get(type)||[];list.push(fn);events.set(type,list)},removeEventListener(type,fn){events.set(type,(events.get(type)||[]).filter(f=>f!==fn))},emit(type,event){for(const fn of events.get(type)||[])fn(event)}};}
function harness(){
 let now=0,serial=0;const timers=new Map(),states=[],samples=[],problems=[],calls=[];
 const win={...target(),location:{origin:'https://tectonique-des-ames.com'}},frame={...target(),contentWindow:target(),contentDocument:{body:{classList:{contains:()=>false}}}};
 const api={begin(){calls.push('begin')},sample(ms){samples.push(ms);return {elapsedMs:ms}},finish(){calls.push('finish')}};
 frame.contentWindow.salonV27={introFinale:api};
 const player=createArrivalPlayer({frame,win,now:()=>now,setTimer:(fn,ms)=>{timers.set(++serial,{fn,at:now+ms});return serial},clearTimer:id=>timers.delete(id),onState:s=>states.push(s),onFrame:s=>calls.push(s.card?'card':'frame'),onProblem:p=>problems.push(p)});
 function state(phase,detail=''){win.emit('message',{origin:win.location.origin,source:frame.contentWindow,data:{scope:'salon-arrival-v1',type:'state',state:{phase,detail}}})}
 return {player,frame,win,api,states,samples,problems,calls,timers,state,tick(ms){now+=ms;player.tick()},expire(){for(const [id,t]of [...timers]){timers.delete(id);now=t.at;t.fn()}}};
}

test('the park, Ahmed’s aside, angel demonstration and invitation have a deliberate fixed sequence',()=>{
 assert.equal(arrivalFrame(0).dialogue,false);
 assert.equal(arrivalFrame(2000).dialogue,true);assert.equal(arrivalFrame(2000).angel,false);
 assert.equal(arrivalFrame(5000).angel,true);assert.equal(arrivalFrame(5000).pressed,false);
 assert.equal(arrivalFrame(6000).pressed,true);
 assert.equal(arrivalFrame(11000).dialogue,false);assert.equal(arrivalFrame(11000).angel,false);
 assert.equal(arrivalFrame(ARRIVAL_DURATION).done,true);
 assert.equal(arrivalFrame(ARRIVAL_DURATION,{promo:true}).card,true);
 assert.equal(arrivalFrame(ARRIVAL_DURATION,{promo:true}).done,false);
 assert.equal(arrivalFrame(20500,{promo:true}).done,true);
 assert.equal(PROMOTION.site,'https://tectonique-des-ames.com');
 assert.equal(PROMOTION.email,'ahmedmarie@tectonique-des-ames.com');
});

test('loading waits for the actual salon API, then automatically opens the interior once after the wings',()=>{
 const h=harness();h.player.start();assert.equal(h.player.state,'loading');assert.equal(h.calls.length,0);
 h.state('ready');h.frame.emit('load');h.state('ready');
 assert.equal(h.player.state,'playing');assert.equal(h.calls.filter(x=>x==='begin').length,1);assert.equal(h.timers.size,0);
 h.tick(6000);assert.equal(h.samples.at(-1),6000);h.tick(7000);h.tick(2000);
 assert.equal(h.calls.filter(x=>x==='finish').length,1);assert.equal(h.player.state,'complete');
});

test('a report pauses the final scene clock, including when opened before the assets finish loading',()=>{
 const h=harness();h.player.start({paused:true});h.tick(9000);h.state('ready');h.tick(20000);
 assert.equal(h.samples.at(-1),0);h.player.resume();h.tick(5000);assert.equal(h.samples.at(-1),5000);
 h.player.pause();h.tick(30000);assert.equal(h.samples.at(-1),5000);
 h.player.resume();h.tick(500);assert.equal(h.samples.at(-1),5500);
});

test('reloading the child after the introduction releases the new scene controls without replaying the finale',()=>{
 for(const skip of [false,true]){
  const h=harness();h.player.start({skip});h.state('ready');if(!skip)h.tick(ARRIVAL_DURATION);
  assert.equal(h.player.state,'complete');
  const calls=[],replacement={begin(){calls.push('begin')},sample(){calls.push('sample')},finish(){calls.push('finish')}};
  h.frame.contentWindow={...target(),salonV27:{introFinale:replacement}};
  h.frame.emit('load');h.state('ready');h.state('ready');h.tick(5000);
  assert.deepEqual(calls,['finish']);assert.equal(h.player.state,'complete');
 }
});

test('an asset failure or missing readiness produces a recoverable error instead of an endless blank iframe',()=>{
 const h=harness();h.player.start();h.state('error','Vêtement indisponible');
 assert.equal(h.player.state,'error');assert.equal(h.problems.at(-1),'Vêtement indisponible');
 h.player.retry();assert.equal(h.player.state,'loading');assert.match(h.frame.src,/retry=2/);
 h.expire();assert.equal(h.player.state,'error');assert.match(h.states.at(-1).detail,/réessayer/);
 h.player.retry();h.state('ready');assert.equal(h.player.state,'playing');assert.equal(h.calls.filter(x=>x==='begin').length,1);
});

test('skip opens the usable salon as soon as ready and does not replay the park sequence',()=>{
 const h=harness();h.player.start({skip:true});h.state('ready');h.tick(30000);h.state('ready');
 assert.deepEqual(h.calls,['finish']);assert.equal(h.player.state,'complete');
});

test('promotion ends on its invitation instead of opening a playable screen',()=>{
 const h=harness();h.player.start({promo:true});h.state('ready');h.tick(14000);
 assert.equal(h.calls.at(-1),'card');assert.equal(h.samples.at(-1),ARRIVAL_DURATION);
 h.tick(6500);assert.equal(h.player.state,'complete');assert.ok(!h.calls.includes('finish'));
});

test('messages from other frames and origins cannot start or stop the cinematic',()=>{
 const h=harness();h.player.start();
 for(const event of [{origin:'https://other.example',source:h.frame.contentWindow},{origin:h.win.location.origin,source:{}}])h.win.emit('message',{...event,data:{scope:'salon-arrival-v1',type:'state',state:{phase:'error',detail:'Injected error'}}});
 assert.equal(h.player.state,'loading');assert.deepEqual(h.problems,[]);h.player.dispose();assert.equal(h.timers.size,0);
});
