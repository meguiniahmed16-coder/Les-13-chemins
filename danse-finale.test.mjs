import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as T from 'three';
import {createRun,beginRound,press,advance} from './danse-core.js';
import {OVATION_SECONDS,finaleTime,finaleFinished} from './danse-finale.js';
import {loadStudioCast,animateStudioCast} from './danse-studio-cast.js';
import {StudioMusic} from './danse-music.js';

test('Ovation starts only after all five successful sequences, lasts eight seconds, and resets for replay',()=>{
 const r=createRun();beginRound(r);
 for(let round=0;round<5;round++){
  assert.equal(finaleTime(r),null);
  for(const n of r.notes){advance(r,n.at-r.time);press(r,n.action);}
  advance(r,1.1);
  if(round<4){assert.equal(finaleTime(r),null);advance(r,2.5);}
 }
 assert.equal(finaleTime(r),0);assert.equal(finaleFinished(r),false);
 advance(r,OVATION_SECONDS-.01);assert.equal(finaleFinished(r),false);
 advance(r,.02);assert.equal(finaleFinished(r),true);
 assert.equal(r.events.filter(e=>e.type==='won').length,1);
 const failed=createRun([1,2,3,4]);beginRound(failed);advance(failed,20);assert.equal(failed.phase,'retry');assert.equal(finaleTime(failed),null);
 assert.equal(finaleTime(createRun()),null);
});

test('All sixteen real spectators stand, raise their hands above the head and clap without changing bone lengths',async()=>{
 const previous=globalThis.Image;globalThis.Image=class{set src(v){this.width=this.height=512;queueMicrotask(()=>this.onload());}};
 try{
  const scene=new T.Scene(),stage={scene,canvas:{dataset:{}},candidates:[],public:Array.from({length:16},(_,i)=>{const group=new T.Group();group.position.set((i%8-3.5)*1.16,.25+Math.floor(i/8)*.22,4.2+Math.floor(i/8)*1.4);return {group};})};
  const cast=await loadStudioCast(stage),point=(a,n)=>a.bones.get(n).getWorldPosition(new T.Vector3());
  const lengths=cast.map(a=>['l','r'].map(s=>[point(a,'upperarm_'+s).distanceTo(point(a,'lowerarm_'+s)),point(a,'lowerarm_'+s).distanceTo(point(a,'hand_'+s))]));
  let near=Infinity,far=0;
  for(let t=1.3;t<2.3;t+=.05){
   animateStudioCast(cast,50+t,true,t);
   cast.forEach((a,i)=>{
    assert.equal(a.root.position.y,a.baseY);
    for(const [j,s] of ['l','r'].entries()){
     const hand=point(a,'hand_'+s),head=point(a,'head');assert.ok(hand.y>head.y+.08,`${i}: ${s} hand must be over the head`);
     assert.ok(Math.abs(point(a,'upperarm_'+s).distanceTo(point(a,'lowerarm_'+s))-lengths[i][j][0])<.001,`arm length changed by ${point(a,'upperarm_'+s).distanceTo(point(a,'lowerarm_'+s))-lengths[i][j][0]}`);
     assert.ok(Math.abs(point(a,'lowerarm_'+s).distanceTo(hand)-lengths[i][j][1])<.001);
    }
    if(i===0){const gap=point(a,'hand_l').distanceTo(point(a,'hand_r'));near=Math.min(near,gap);far=Math.max(far,gap);}
   });
  }
  assert.ok(near<.10,`hands meet: ${near}`);assert.ok(far>.3,`hands separate: ${far}`);
  animateStudioCast(cast,0,false,null);for(const a of cast)assert.equal(a.root.position.y,a.baseY-.48);
 }finally{globalThis.Image=previous;}
});

test('Recorded ovation plays once, follows the finale clock, stops on mute and never plays for normal dance',async()=>{
 const oldFetch=globalThis.fetch;globalThis.fetch=async()=>new Response(new Uint8Array([1]));
 try{
  const music=new StudioMusic();await Promise.all([music.pending,music.ovationPending]);
  const sources=[];music.ctx={state:'running',currentTime:10,createBufferSource(){const source={connect(){},start(...args){this.args=args;},stop(){this.stopped=true;}};sources.push(source);return source;}};
  music.ovationBuffer={duration:8};music.ovationGain={};
  music.syncOvation(null,true);assert.equal(sources.length,0);
  music.syncOvation(0,true);assert.equal(sources.length,1);assert.equal(sources[0].loop,false);
  music.ctx.currentTime=11;music.syncOvation(1,true);assert.equal(sources.length,1);
  music.toggle();assert.equal(sources[0].stopped,true);
  music.syncOvation(2,false);assert.equal(sources.length,1);
  music.syncOvation(2,true);assert.equal(sources.length,2);assert.equal(sources[1].args[1],2);
  music.syncOvation(8,true);assert.equal(sources[1].stopped,true);assert.equal(sources.length,2);
  music.syncOvation(null,true);assert.equal(sources.length,2);
 }finally{globalThis.fetch=oldFetch;}
});

test('Publishing includes both audio files and parent navigation waits for ovation completion',()=>{
 const parent=fs.readFileSync(new URL('plateaux.js',import.meta.url),'utf8');
 assert.ok(!parent.includes('setTimeout(travel,3900)'));
 assert.ok(parent.includes("m.type==='danse:ovation-ended'&&m.id===danceWonSession"));
 const build=fs.readFileSync(new URL('build-public.mjs',import.meta.url),'utf8');
 for(const f of ['ovation.mp3','funky-chunk-loop.mp3','CREDITS.txt'])assert.ok(build.includes(`'assets/danse/${f}'`));
});
