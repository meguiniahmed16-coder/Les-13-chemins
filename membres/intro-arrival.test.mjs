import test from 'node:test';
import assert from 'node:assert/strict';
import {arrivalFrame,createArrivalPlayer,ARRIVAL_DURATION,PROMOTION} from './intro-arrival.js';

const PRELUDE_DURATION=20000,GARDEN_DURATION=13000;
function target(){const events=new Map();return {addEventListener(type,fn){const list=events.get(type)||[];list.push(fn);events.set(type,list)},removeEventListener(type,fn){events.set(type,(events.get(type)||[]).filter(f=>f!==fn))},emit(type,event){for(const fn of events.get(type)||[])fn(event)}};}
function harness(){
 let now=0,serial=0;const timers=new Map(),states=[],samples=[],invitationSamples=[],problems=[],calls=[],cues=[];
 const win={...target(),location:{origin:'https://tectonique-des-ames.com'}},frame={...target(),contentWindow:target(),contentDocument:{body:{classList:{contains:()=>false}}}};
 const api={begin(){calls.push('garden:begin')},sample(ms){samples.push(ms);return {elapsedMs:ms}},finish(){calls.push('garden:finish')}};
 const invitation={begin(){calls.push('invitation:begin')},sample(ms){invitationSamples.push(ms);return {elapsedMs:ms}},finish(){calls.push('invitation:finish')}};
 frame.contentWindow.salonV27={introFinale:api,introInvitation:invitation};
 const player=createArrivalPlayer({frame,win,now:()=>now,setTimer:(fn,ms)=>{timers.set(++serial,{fn,at:now+ms});return serial},clearTimer:id=>timers.delete(id),onState:s=>states.push(s),onFrame:cue=>cues.push(cue),onProblem:p=>problems.push(p)});
 function state(phase,detail=''){win.emit('message',{origin:win.location.origin,source:frame.contentWindow,data:{scope:'salon-arrival-v1',type:'state',state:{phase,detail}}})}
 return {player,frame,win,api,invitation,states,samples,invitationSamples,problems,calls,cues,timers,state,tick(ms){now+=ms;player.tick()},expire(){for(const [id,t]of [...timers]){timers.delete(id);now=t.at;t.fn()}}};
}

test('the salon invitation precedes the original garden, wings and final card by twenty seconds',()=>{
 assert.equal(ARRIVAL_DURATION,PRELUDE_DURATION+GARDEN_DURATION);
 for(const at of [0,2000,5000,11000,19999]){
  const cue=arrivalFrame(at);assert.equal(cue.phase,'salon');assert.equal(cue.invitationElapsedMs,at);assert.equal(cue.gardenElapsedMs,0);
  assert.equal(cue.dialogue,false);assert.equal(cue.angel,false);assert.equal(cue.pressed,false);assert.equal(cue.card,false);assert.equal(cue.done,false);
 }
 const garden=elapsed=>arrivalFrame(PRELUDE_DURATION+elapsed);
 assert.equal(garden(0).phase,'garden');assert.equal(garden(0).invitationElapsedMs,PRELUDE_DURATION);assert.equal(garden(0).gardenElapsedMs,0);
 assert.equal(garden(2000).dialogue,true);assert.equal(garden(2000).angel,false);
 assert.equal(garden(5000).angel,true);assert.equal(garden(5000).pressed,false);
 assert.equal(garden(6000).pressed,true);
 assert.equal(garden(11000).dialogue,false);assert.equal(garden(11000).angel,false);
 assert.equal(arrivalFrame(ARRIVAL_DURATION).done,true);
 assert.equal(arrivalFrame(ARRIVAL_DURATION,{promo:true}).card,true);
 assert.equal(arrivalFrame(ARRIVAL_DURATION,{promo:true}).done,false);
 assert.equal(arrivalFrame(ARRIVAL_DURATION+7500,{promo:true}).done,true);
 assert.equal(arrivalFrame(ARRIVAL_DURATION+7500,{promo:true}).elapsed,ARRIVAL_DURATION);
 assert.equal(arrivalFrame(-400).elapsed,0);
 assert.equal(PROMOTION.site,'https://tectonique-des-ames.com');
 assert.equal(PROMOTION.email,'ahmedmarie@tectonique-des-ames.com');
});

test('loading waits for both real scene APIs and plays invitation then garden once',()=>{
 const h=harness();delete h.frame.contentWindow.salonV27.introInvitation;
 h.player.start();assert.equal(h.player.state,'loading');assert.equal(h.calls.length,0);
 h.state('ready');assert.equal(h.player.state,'loading');assert.equal(h.calls.length,0);
 h.frame.contentWindow.salonV27.introInvitation=h.invitation;h.frame.emit('load');h.state('ready');h.state('ready');
 assert.equal(h.player.state,'playing');assert.deepEqual(h.calls,['invitation:begin']);assert.equal(h.timers.size,0);
 h.tick(6000);assert.equal(h.invitationSamples.at(-1),6000);assert.equal(h.samples.length,0);
 h.tick(14000);assert.equal(h.invitationSamples.at(-1),PRELUDE_DURATION);assert.equal(h.samples.at(-1),0);
 assert.deepEqual(h.calls,['invitation:begin','invitation:finish','garden:begin']);
 h.tick(6000);assert.equal(h.samples.at(-1),6000);h.tick(7000);h.tick(2000);
 assert.equal(h.calls.filter(x=>x==='garden:finish').length,1);assert.equal(h.player.state,'complete');
});

test('a delayed frame still completes the invitation before sampling the garden',()=>{
 const h=harness();h.player.start();h.state('ready');h.tick(PRELUDE_DURATION+3000);
 assert.equal(h.invitationSamples.at(-1),PRELUDE_DURATION);assert.equal(h.samples.at(-1),3000);
 assert.deepEqual(h.calls,['invitation:begin','invitation:finish','garden:begin']);
 h.tick(250);assert.equal(h.calls.filter(x=>x==='invitation:finish').length,1);assert.equal(h.calls.filter(x=>x==='garden:begin').length,1);
});

test('a report pauses the invitation even when opened before scene readiness',()=>{
 const h=harness();h.player.start({paused:true});h.tick(9000);h.state('ready');h.tick(20000);
 assert.equal(h.invitationSamples.at(-1),0);assert.equal(h.samples.length,0);
 h.player.resume();h.tick(5000);assert.equal(h.invitationSamples.at(-1),5000);
 h.player.pause();h.tick(30000);assert.equal(h.invitationSamples.at(-1),5000);assert.equal(h.samples.length,0);
 h.player.resume();h.tick(500);assert.equal(h.invitationSamples.at(-1),5500);
});

test('pausing at the phase boundary preserves the garden clock and its wing timing',()=>{
 const h=harness();h.player.start();h.state('ready');h.tick(PRELUDE_DURATION-1);h.player.pause();h.tick(30000);
 assert.equal(h.samples.length,0);assert.equal(h.invitationSamples.at(-1),PRELUDE_DURATION-1);
 h.player.resume();h.tick(1);assert.equal(h.samples.at(-1),0);h.tick(5000);assert.equal(h.samples.at(-1),5000);
 h.player.pause();h.tick(9000);assert.equal(h.samples.at(-1),5000);
 h.player.resume();h.tick(500);assert.equal(h.samples.at(-1),5500);
 assert.equal(h.calls.filter(x=>x==='garden:begin').length,1);
});

test('reloading the child after completion releases its controls without replaying either scene',()=>{
 for(const skip of [false,true]){
  const h=harness();h.player.start({skip});h.state('ready');if(!skip)h.tick(ARRIVAL_DURATION);
  assert.equal(h.player.state,'complete');
  const calls=[],replacement={begin(){calls.push('begin')},sample(){calls.push('sample')},finish(){calls.push('finish')}};
  h.frame.contentWindow={...target(),salonV27:{introFinale:replacement}};
  h.frame.emit('load');h.state('ready');h.state('ready');h.tick(5000);
  assert.deepEqual(calls,['finish']);assert.equal(h.player.state,'complete');
 }
});

test('an asset failure or missing readiness remains recoverable for the expanded sequence',()=>{
 const h=harness();h.player.start();h.state('error','Vêtement indisponible');
 assert.equal(h.player.state,'error');assert.equal(h.problems.at(-1),'Vêtement indisponible');
 h.player.retry();assert.equal(h.player.state,'loading');assert.match(h.frame.src,/retry=2/);
 h.expire();assert.equal(h.player.state,'error');assert.match(h.states.at(-1).detail,/réessayer/);
 h.player.retry();h.state('ready');assert.equal(h.player.state,'playing');assert.equal(h.calls.filter(x=>x==='invitation:begin').length,1);
 assert.equal(h.calls.includes('garden:begin'),false);
});

test('skip releases the usable salon immediately and requires no invitation API',()=>{
 const h=harness();delete h.frame.contentWindow.salonV27.introInvitation;
 h.player.start({skip:true});h.state('ready');h.tick(50000);h.state('ready');
 assert.deepEqual(h.calls,['garden:finish']);assert.equal(h.player.state,'complete');assert.equal(h.samples.length,0);assert.equal(h.invitationSamples.length,0);
});

test('promotion includes the prelude then ends on its card without opening a playable screen',()=>{
 const h=harness();h.player.start({promo:true});h.state('ready');h.tick(ARRIVAL_DURATION+1000);
 assert.equal(h.cues.at(-1).card,true);assert.equal(h.samples.at(-1),GARDEN_DURATION);
 assert.equal(h.invitationSamples.at(-1),PRELUDE_DURATION);
 h.tick(6500);assert.equal(h.player.state,'complete');assert.ok(!h.calls.includes('garden:finish'));
});

test('messages from other frames and origins cannot start or stop either cinematic phase',()=>{
 const h=harness();h.player.start();
 for(const event of [{origin:'https://other.example',source:h.frame.contentWindow},{origin:h.win.location.origin,source:{}}])h.win.emit('message',{...event,data:{scope:'salon-arrival-v1',type:'state',state:{phase:'error',detail:'Injected error'}}});
 assert.equal(h.player.state,'loading');assert.deepEqual(h.problems,[]);h.player.dispose();assert.equal(h.timers.size,0);
});
