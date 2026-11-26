import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {INTRO_FILM,filmPosition,createFilmPlayback} from './intro-film.js';

const tick=()=>new Promise(resolve=>setImmediate(resolve));
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject};}
function mediaFixture(){
 const listeners=new Map();let currentTime=0;
 const video={duration:INTRO_FILM.duration,readyState:2,seeking:false,paused:true,plays:0,pauses:0,seeks:[],seekError:null,playImpl:null,
  get currentTime(){return currentTime},
  set currentTime(value){this.seeks.push(value);if(this.seekError)throw this.seekError;currentTime=value;this.seeking=true;},
  play(){this.plays++;if(this.playImpl)return this.playImpl();this.paused=false;return Promise.resolve();},
  pause(){this.pauses++;this.paused=true;},
  advance(seconds){if(!this.paused&&!this.seeking)currentTime=Math.min(this.duration,currentTime+seconds);},
  settleSeek(){this.seeking=false;},
  addEventListener(type,fn){listeners.set(type,fn)},
  emitError(error){this.error=error;listeners.get('error')?.();},
 };
 return video;
}

test('one silent inline video carries the original salon, board and garden reel without looping',()=>{
 const video=mediaFixture();createFilmPlayback(video);
 assert.equal(video.src,INTRO_FILM.url);assert.equal(video.poster,INTRO_FILM.poster);
 assert.equal(video.muted,true);assert.equal(video.playsInline,true);assert.equal(video.controls,false);assert.equal(video.loop,false);
 const source=readFileSync(new URL('./intro-cinema.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('./intro-prive.html',import.meta.url),'utf8');
 assert.equal([...html.matchAll(/<video\b/g)].length,1);
 assert.match(source,/const video=\$\('film-video'\)/);
 assert.match(source,/video\.readyState>=2\?video:/,'The television draws the same video as the full-screen overlay');
 const lines=JSON.parse(source.slice(source.indexOf('const lines=')+12,source.indexOf(';\nconst dojoStart')));
 assert.equal(lines.find(line=>line.shot==='tv').ms,1000);
 assert.equal(filmPosition('tv',7000).seconds,filmPosition('montage',0).seconds);
 assert.equal(filmPosition('montage',999).chapter.title,'Rencontrer');
 assert.equal(filmPosition('montage',1000).chapter.title,'Jouer');
 assert.equal(filmPosition('montage',7999).chapter.title,'Jouer');
 assert.equal(filmPosition('montage',8000).chapter.title,'Explorer');
 const filmTime=lines.filter(line=>['tv','montage'].includes(line.shot)).reduce((sum,line)=>sum+line.ms,0);
 assert.equal(filmTime,2000,'The condensed film uses short actual reel excerpts.');
});

test('the 7-second television shot continues into montage without seeking back or restarting playback',async()=>{
 const video=mediaFixture(),playback=createFilmPlayback(video);
 playback.sync(filmPosition('tv',0).seconds);await tick();
 for(let frame=1;frame<INTRO_FILM.duration*20;frame++){
  video.advance(.05);
  const ms=frame*50,position=filmPosition(ms<7000?'tv':'montage',ms<7000?ms:ms-7000);
  playback.sync(position.seconds);
  assert.ok(Math.abs(video.currentTime-position.seconds)<.00001,'Playback advances continuously across the shot boundary');
 }
 assert.equal(video.plays,1);assert.deepEqual(video.seeks,[]);assert.equal(video.paused,false);
});

test('report pause holds the same position and resume continues from it',async()=>{
 const video=mediaFixture(),playback=createFilmPlayback(video);
 playback.sync(4);video.settleSeek();await tick();video.advance(.12);
 playback.sync(4.12,true);const frozen=video.currentTime,seeks=video.seeks.length;
 for(let frame=0;frame<120;frame++){video.advance(.05);playback.sync(4.12,true);}
 assert.equal(video.currentTime,frozen);assert.equal(video.paused,true);assert.equal(video.plays,1);
 playback.sync(4.12,false);await tick();video.advance(.10);playback.sync(4.22,false);
 assert.ok(Math.abs(video.currentTime-4.22)<.00001);assert.equal(video.seeks.length,seeks);assert.equal(video.plays,2);
});

test('a pending play request is shared during loading and late metadata catches up once',async()=>{
 const video=mediaFixture(),pending=deferred();video.readyState=0;video.duration=NaN;video.playImpl=()=>pending.promise;
 const playback=createFilmPlayback(video);
 for(let frame=0;frame<120;frame++)playback.sync(frame/30);
 assert.equal(video.plays,1);assert.deepEqual(video.seeks,[]);
 video.readyState=2;video.duration=INTRO_FILM.duration;playback.sync(4);playback.sync(4.01);
 assert.equal(video.plays,1);assert.deepEqual(video.seeks,[4]);
 video.settleSeek();video.paused=false;pending.resolve();await tick();video.advance(.05);playback.sync(4.05);
 assert.ok(Math.abs(video.currentTime-4.05)<.00001);assert.equal(video.plays,1);assert.deepEqual(video.seeks,[4]);
});

test('late completion of play cannot restart the film after a report pause or skip',async()=>{
 for(const action of ['pause','skip']){
  const video=mediaFixture(),pending=deferred();video.playImpl=()=>pending.promise;
  const playback=createFilmPlayback(video);playback.sync(0);
  if(action==='pause')playback.sync(0,true);else playback.stop();
  video.paused=false;pending.resolve();await tick();
  assert.equal(video.paused,true,action+' must still win over the older play request');
  assert.equal(video.plays,1);const pauses=video.pauses;
  if(action==='skip'){playback.stop();assert.equal(video.pauses,pauses,'Stopping is idempotent');}
 }
});

test('a cancelled play request is handled and can resume after the report closes',async()=>{
 const video=mediaFixture(),pending=deferred();video.playImpl=()=>{video.paused=false;return pending.promise};
 const errors=[],playback=createFilmPlayback(video,message=>errors.push(message));playback.sync(1);video.settleSeek();
 playback.sync(1,true);pending.reject(Object.assign(new Error('Cancelled by pause'),{name:'AbortError'}));await tick();
 assert.deepEqual(errors,[]);assert.equal(video.paused,true);
 video.playImpl=null;playback.sync(1,false);await tick();
 assert.equal(video.plays,2);assert.equal(video.paused,false);
});

test('play and media failures are handled once without repeated playback attempts',async()=>{
 const video=mediaFixture(),errors=[];video.playImpl=()=>Promise.reject(Object.assign(new Error('Playback refused'),{name:'NotAllowedError'}));
 const playback=createFilmPlayback(video,message=>errors.push(message));playback.sync(0);await tick();
 for(let frame=1;frame<120;frame++)playback.sync(frame/30);
 video.emitError({message:'Decoder failed'});
 assert.equal(video.plays,1);assert.deepEqual(errors,['Playback refused']);assert.deepEqual(video.seeks,[]);
 const thrown=mediaFixture(),syncErrors=[];thrown.playImpl=()=>{throw new Error('No playable source')};
 const other=createFilmPlayback(thrown,message=>syncErrors.push(message));other.sync(0);other.sync(.05);
 assert.equal(thrown.plays,1);assert.deepEqual(syncErrors,['No playable source']);
});

test('a terminal seek failure does not cause a per-frame seek or play loop',()=>{
 const video=mediaFixture(),errors=[];video.seekError=new Error('Media is no longer available');
 const playback=createFilmPlayback(video,message=>errors.push(message));
 for(let frame=0;frame<120;frame++)playback.sync(4+frame/30);
 assert.equal(video.seeks.length,1);assert.equal(video.plays,0);assert.equal(errors.length,1);
});

test('the final video frame is reached and held through the remaining montage duration',async()=>{
 const video=mediaFixture(),playback=createFilmPlayback(video);
 playback.sync(INTRO_FILM.duration-.20);video.settleSeek();await tick();
 playback.sync(INTRO_FILM.duration);video.settleSeek();const last=INTRO_FILM.duration-.025;
 assert.equal(video.currentTime,last,'Final hold must not stop up to 300 ms before the final frame');
 assert.equal(video.paused,true);const plays=video.plays,seeks=video.seeks.length;
 for(const elapsed of [14000,14500,15000,16000,17000])playback.sync(filmPosition('montage',elapsed).seconds);
 assert.equal(video.currentTime,last);assert.equal(video.paused,true);assert.equal(video.plays,plays);assert.equal(video.seeks.length,seeks);
});
