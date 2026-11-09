/* Chemin III — Camarades ! — logique pure.
 * I : sur le socle, dire « Camarades ! », puis redescendre.
 * II : retrouver le drapeau français devant l'école.
 * III : mener le cortège (toujours derrière) jusqu'à Bastille.
 * La caméra 360° est indépendante du parcours et des points.
 */
export const OBJECTIFS=Object.freeze(['La République — « Camarades ! »','Retrouver le drapeau français','La rencontre des cortèges']);
export const MAX_POINTS=30;
export const GAME_ID='rendezvous-2002';
export const STATUE=Object.freeze({x:0,z:5,footX:-1.15,footZ:.35,topX:-1.15,topZ:3.48,topHeight:3.32,descendTime:2});
export const FLAG=Object.freeze({x:4.1,z:12});
export const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const behindNarrator=(narratorZ,candidateZ,gap=4.5)=>Math.min(candidateZ,narratorZ-gap);
export function newRun(){
 return {phase:1,steps:[],x:STATUE.topX,z:STATUE.topZ,height:STATUE.topHeight,facing:0,
  climbed:true,climb:null,statueShouted:false,shoutRemaining:0,mobilisation:0,
  cohesion:80,leaderZ:-9,clock:0,finished:false,events:[]};
}
export function progress(run,step){
 if(run.finished||step!==run.steps.length+1||step<1||step>3)return false;
 run.steps.push(step);run.events.push({type:'progress',step});
 if(step===3){run.finished=true;run.events.push({type:'won'});return true;}
 run.phase=step+1;run.climb=null;run.climbed=false;run.height=0;run.statueShouted=false;
 run.shoutRemaining=0;run.mobilisation=0;run.facing=0;run.cohesion=80;
 if(step===1){run.x=STATUE.footX;run.z=STATUE.footZ;run.leaderZ=run.z-8;}
 else{run.x=0;run.z=0;run.leaderZ=-8;}
 return true;
}
export function callFromStatue(run){
 if(run.phase!==1||!run.climbed||run.climb||run.statueShouted||run.finished)return false;
 run.statueShouted=true;run.shoutRemaining=.85;run.events.push({type:'shout'});return true;
}
function descend(run,dt){
 const c=run.climb;
 c.elapsed=Math.min(c.duration,c.elapsed+dt);
 const t=c.elapsed/c.duration;
 // Slow, physically visible descent along the existing steps.
 const k=t*t*(3-2*t);
 run.x=STATUE.topX;run.z=STATUE.topZ+(STATUE.footZ-STATUE.topZ)*k;
 run.height=STATUE.topHeight*(1-k);
 if(t>=1){run.climb=null;run.climbed=false;run.height=0;run.events.push({type:'ground'});progress(run,1);}
}
export function advance(run,dt,input={}){
 if(run.finished)return;
 const t=clamp(Number(dt)||0,0,.12);
 const x=clamp(Number(input.x)||0,-1,1),y=clamp(Number(input.y)||0,-1,1);
 const mag=Math.max(1,Math.hypot(x,y));run.clock+=t;
 if(run.phase===1){
  if(run.climb){descend(run,t);return;}
  // On the statue the player may turn full-circle without changing position.
  run.facing=(run.facing+x*t*2.5)%(Math.PI*2);
  if(run.statueShouted){
   run.shoutRemaining=Math.max(0,run.shoutRemaining-t);
   if(run.shoutRemaining===0)run.climb={direction:'down',elapsed:0,duration:STATUE.descendTime};
  }
  return;
 }
 const moving=Math.hypot(x,y)>.15;
 const speed=run.phase===3?5.6:4.9;
 const delta=speed*t;
 run.x=clamp(run.x+x/mag*delta,-8,8);
 run.z=clamp(run.z+y/mag*delta,run.phase===3?-2:-11,run.phase===3?106:20);
 if(moving)run.facing=Math.atan2(x,y);
 if(run.phase===3){
  run.leaderZ+=clamp(run.z-8-run.leaderZ,-6,6)*t*2.4*(input.red?1.25:1);
  run.leaderZ=clamp(run.leaderZ,run.z-10,run.z-6);
  run.cohesion=clamp(run.cohesion+t*((input.red?18:0)+(moving?-.45:7)),0,100);
  if(run.z>=99)progress(run,3);
 }
}
export function yellow(run){
 if(run.phase===1)return callFromStatue(run); // secours si le bouton « Camarades ! » est hors écran
 if(run.phase===2&&distance(run,FLAG)<3.3)return progress(run,2);
 return false;
}
export function canNext(run){return run.finished||run.steps.includes(1);}
