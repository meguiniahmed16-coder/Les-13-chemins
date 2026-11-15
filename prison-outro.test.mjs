import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrisonOutro} from './prison-outro.js';

function harness(){
 const nodes=new Map();let ends=0;
 for(const id of ['prison-outro','prison-film','prison-film-play','prison-film-skip','prison-film-status','prison-film-music','prison-music-play']){
  const listeners={};nodes.set(id,{hidden:true,dataset:{src:'assets/prison/le-cafe-16s.mp4'},listeners,
   paused:true,currentTime:0,volume:1,playbackRate:1,plays:0,pauses:0,
   getAttribute(name){return this[name]||null;},addEventListener(type,fn){listeners[type]=fn;},
   play(){this.plays++;this.paused=false;return Promise.resolve();},pause(){this.pauses++;this.paused=true;},load(){},focus(){}});
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
test('Bach follows pause, buffering, seeking, volume and playback speed without completing the film',async()=>{
 const h=harness(),music=h.node('prison-film-music');
 h.api.start();await new Promise(r=>setImmediate(r));
 assert.equal(music.paused,false);assert.equal(music.currentTime,0);
 h.video.paused=true;h.video.listeners.pause();assert.equal(music.paused,true);
 h.video.paused=false;h.video.currentTime=5;h.video.listeners.playing();
 await new Promise(r=>setImmediate(r));assert.equal(music.paused,false);assert.equal(music.currentTime,5);
 h.video.listeners.waiting();assert.equal(music.paused,true);
 h.video.currentTime=9;h.video.listeners.seeking();h.video.listeners.seeked();
 await new Promise(r=>setImmediate(r));assert.equal(music.currentTime,9);assert.equal(music.paused,false);
 h.video.muted=true;h.video.volume=.5;h.video.listeners.volumechange();
 assert.equal(music.muted,true);assert.equal(music.volume,.5);
 h.video.playbackRate=1.5;h.video.listeners.ratechange();assert.equal(music.playbackRate,1.5);
 assert.equal(h.ends(),0);
 h.video.listeners.ended();assert.equal(music.paused,true);assert.equal(h.ends(),1);
});
test('A phone can enable blocked music while the film remains available',async()=>{
 const h=harness(),music=h.node('prison-film-music');
 music.play=()=>Promise.reject(Object.assign(new Error(),{name:'NotAllowedError'}));
 h.api.start();await new Promise(r=>setImmediate(r));
 assert.equal(h.node('prison-music-play').hidden,false);assert.equal(h.ends(),0);
 music.play=()=>{music.paused=false;return Promise.resolve();};
 h.video.currentTime=6;h.node('prison-music-play').listeners.click();
 await new Promise(r=>setImmediate(r));
 assert.equal(music.currentTime,6);assert.equal(music.paused,false);assert.equal(h.node('prison-music-play').hidden,true);
 h.node('prison-film-skip').listeners.click();assert.equal(music.paused,true);assert.equal(h.ends(),1);
});
test('Leaving or replaying the scene stops Bach and respects the sound setting',async()=>{
 const h=harness(),music=h.node('prison-film-music');
 h.api.start({muted:true});await new Promise(r=>setImmediate(r));assert.equal(music.muted,true);
 h.api.setMuted(false);assert.equal(music.muted,false);assert.equal(h.video.muted,false);
 h.api.reset();assert.equal(music.paused,true);assert.equal(h.ends(),0);
 h.api.start();await new Promise(r=>setImmediate(r));assert.equal(music.currentTime,0);assert.equal(music.paused,false);
});
test('A music error cannot finish the video and a stale rejection cannot reopen its controls',async()=>{
 const h=harness(),music=h.node('prison-film-music');let reject;
 music.play=()=>new Promise((_,r)=>reject=r);
 h.api.start();music.listeners.error();assert.equal(h.ends(),0);
 h.api.reset();reject(new Error('late'));await new Promise(r=>setImmediate(r));
 assert.equal(h.node('prison-music-play').hidden,true);assert.equal(h.api.active,false);
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
