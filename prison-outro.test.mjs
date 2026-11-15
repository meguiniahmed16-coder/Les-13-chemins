import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrisonOutro} from './prison-outro.js';

function harness(){
 const nodes=new Map();let ends=0;
 for(const id of ['prison-outro','prison-film','prison-film-play','prison-film-skip','prison-film-status','prison-film-music','prison-music-play']){
  const listeners={};nodes.set(id,{hidden:true,dataset:{src:id==='prison-film-music'?'bach-full.mp3':'cafe.mp4',
    fallback:id==='prison-film-music'?'bach-16s.mp3':undefined},listeners,
   paused:true,currentTime:0,volume:1,playbackRate:1,plays:0,pauses:0,loads:0,
   getAttribute(name){return this[name]??null;},
   addEventListener(type,fn){listeners[type]=fn;},
   play(){this.plays++;this.paused=false;return Promise.resolve();},
   pause(){this.pauses++;this.paused=true;},load(){this.loads++;},focus(){}});
 }
 const node=id=>nodes.get(id),video=node('prison-film'),music=node('prison-film-music');
 const api=createPrisonOutro({document:{getElementById:node},onEnd:()=>ends++});
 return{api,node,video,music,ends:()=>ends};
}
const flush=()=>new Promise(r=>setImmediate(r));

test('Bach begins with the visit and NEVER restarts for the film',async()=>{
 const h=harness();h.api.prime();h.api.startSoundtrack();await flush();
 assert.equal(h.music.src,'bach-full.mp3');
 assert.equal(h.music.loop,true);assert.equal(h.music.volume,1);assert.equal(h.music.paused,false);
 h.music.currentTime=37;const before=h.music.plays;
 assert.equal(h.api.start(),true);assert.equal(h.api.start(),false);await flush();
 assert.equal(h.music.currentTime,37,'The film cannot rewind the soundtrack');
 assert.equal(h.music.plays,before,'There must be no second play for an uninterrupted soundtrack');
 assert.equal(h.video.currentTime,0);assert.equal(h.video.volume,0);assert.equal(h.video.muted,true);
 assert.equal(h.video.controls,false,'The film is cinematic, not a native player');
 h.video.listeners.ended();h.video.listeners.ended();
 assert.equal(h.ends(),1);assert.equal(h.music.paused,true);
 assert.equal(h.node('prison-outro').hidden,true);
});
test('Pause, resume and Son ON/OFF preserve the music time',async()=>{
 const h=harness();h.api.startSoundtrack();await flush();
 h.music.currentTime=42;
 h.api.pauseMusic();assert.equal(h.music.paused,true);
 h.api.resumeMusic();await flush();
 assert.equal(h.music.currentTime,42);assert.equal(h.music.paused,false);
 h.api.setMuted(true);assert.equal(h.music.muted,true);
 h.api.start({muted:true});await flush();assert.equal(h.video.muted,true);
 h.api.setMuted(false);assert.equal(h.music.muted,false);assert.equal(h.video.muted,true);
 h.api.reset();assert.equal(h.music.paused,true);assert.equal(h.music.currentTime,0);
});
test('Buffering may pause music, but seeking and film speed do not change Bach',async()=>{
 const h=harness();h.api.startSoundtrack();await flush();h.api.start();await flush();
 h.music.currentTime=53;h.video.listeners.waiting();assert.equal(h.music.paused,true);
 h.video.paused=false;h.video.currentTime=8;h.video.listeners.playing();await flush();
 assert.equal(h.music.paused,false);assert.equal(h.music.currentTime,53);
 h.video.listeners.seeking();h.video.currentTime=12;h.video.listeners.seeked();await flush();
 assert.equal(h.music.currentTime,53);
 h.video.playbackRate=1.5;assert.equal(h.music.playbackRate,1);
});
test('If full Bach cannot play, the licensed local sixteen-second file loops',async()=>{
 const h=harness();h.api.startSoundtrack();await flush();
 h.music.listeners.error();await flush();
 assert.equal(h.music.src,'bach-16s.mp3');
 assert.equal(h.music.loads,1);assert.equal(h.music.paused,false);assert.equal(h.music.loop,true);
 h.api.start();await flush();assert.equal(h.node('prison-music-play').hidden,true);
});
test('If the phone blocks music, one explicit gesture enables it without ending the film',async()=>{
 const h=harness();
 h.music.play=()=>Promise.reject(Object.assign(new Error(),{name:'NotAllowedError'}));
 h.api.start();await flush();assert.equal(h.node('prison-music-play').hidden,false);
 h.music.play=()=>{h.music.paused=false;return Promise.resolve();};
 h.node('prison-music-play').listeners.click();await flush();
 assert.equal(h.music.paused,false);assert.equal(h.node('prison-music-play').hidden,true);
 h.node('prison-film-skip').listeners.click();assert.equal(h.ends(),1);
});
test('If autoplay blocks the film, a temporary recovery control is available',async()=>{
 const h=harness();h.video.play=()=>Promise.reject(Object.assign(new Error(),{name:'NotAllowedError'}));
 h.api.start();await flush();
 assert.equal(h.node('prison-film-play').hidden,false);
 assert.match(h.node('prison-film-status').textContent,/Lecture/);assert.equal(h.ends(),0);
 h.video.play=()=>Promise.resolve();
 h.node('prison-film-play').listeners.click();await flush();
 h.video.listeners.ended();assert.equal(h.ends(),1);
});
test('A late music failure cannot resurrect controls after exit or replay',async()=>{
 const h=harness();let reject;
 h.music.play=()=>new Promise((_,r)=>reject=r);
 h.api.startSoundtrack();h.api.reset();
 reject(new Error('late'));await flush();
 assert.equal(h.node('prison-music-play').hidden,true);
 assert.equal(h.music.paused,true);assert.equal(h.api.active,false);
});
