import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrisonOutro} from './prison-outro.js';

function harness(){
 const nodes=new Map();let ends=0;
 for(const id of ['prison-outro','prison-film','prison-film-play','prison-film-skip','prison-film-status']){
  const listeners={};nodes.set(id,{hidden:true,dataset:{src:'assets/prison/le-cafe-16s.mp4'},listeners,
   getAttribute(name){return this[name]||null;},addEventListener(type,fn){listeners[type]=fn;},
   play(){return Promise.resolve();},pause(){},load(){},focus(){}});
 }
 const node=id=>nodes.get(id),video=node('prison-film');
 const api=createPrisonOutro({document:{getElementById:node},onEnd:()=>ends++});
 return{api,node,video,ends:()=>ends};
}
test('The Café plays once after victory, waits for ended, and resets for replay',()=>{
 const h=harness();h.api.prime();assert.equal(h.ends(),0);
 assert.equal(h.api.start(),true);assert.equal(h.api.start(),false);
 assert.equal(h.video.muted,false);assert.equal(h.video.currentTime,0);
 assert.equal(h.node('prison-outro').hidden,false);assert.equal(h.ends(),0);
 h.video.listeners.ended();h.video.listeners.ended();assert.equal(h.ends(),1);
 assert.equal(h.node('prison-outro').hidden,true);
 h.api.reset();assert.equal(h.api.start({muted:true}),true);assert.equal(h.video.muted,true);
 h.node('prison-film-skip').listeners.click();assert.equal(h.ends(),2);
});
test('Blocked autoplay and a loading error keep the film available without continuing the journey',async()=>{
 const h=harness();h.video.play=()=>Promise.reject(Object.assign(new Error(),{name:'NotAllowedError'}));
 h.api.start();await new Promise(r=>setImmediate(r));
 assert.equal(h.node('prison-film-play').hidden,false);assert.match(h.node('prison-film-status').textContent,/Lecture/);
 assert.equal(h.ends(),0);assert.equal(h.api.active,true);
 h.video.listeners.error();assert.equal(h.ends(),0);
 h.video.play=()=>Promise.resolve();h.node('prison-film-play').listeners.click();await new Promise(r=>setImmediate(r));
 h.video.listeners.ended();assert.equal(h.ends(),1);
});
test('An old playback rejection cannot revive a reset film',async()=>{
 const h=harness();let reject;h.video.play=()=>new Promise((_,r)=>reject=r);
 h.api.start();h.api.reset();reject(new Error('late'));await new Promise(r=>setImmediate(r));
 assert.equal(h.node('prison-film-play').hidden,true);assert.equal(h.api.active,false);assert.equal(h.ends(),0);
});
