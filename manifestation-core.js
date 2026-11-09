/* Chemin III — « Camarades ! » : logique pure, testable sans navigateur.
 * Phase 2 : montée visible sur le socle, déplacements contrôlés en hauteur,
 * bouton jaune = redescendre ; jamais de blocage permanent du joystick.
 */
export const OBJECTIFS=Object.freeze(['Le drapeau français','Camarades !','La rencontre des cortèges']);
export const MAX_POINTS=30;
export const GAME_ID='rendezvous-2002';
export const STATUE=Object.freeze({
  x:0,z:5,footX:-1.15,footZ:.35,
  topX:-1.15,topZ:3.48,topHeight:3.32,
  ascendTime:2.3,descendTime:2.0,
});
export const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function newRun(){
 return {
  phase:1,steps:[],x:0,z:-7,height:0,
  climbed:false,climb:null,rallying:false,mobilisation:0,cohesion:77,leaderZ:-8,
  clock:0,finished:false,events:[]
 };
}
export function progress(run,step){
 if(run.finished||step!==run.steps.length+1||step<1||step>3)return false;
 run.steps.push(step);
 run.events.push({type:'progress',step});
 if(step===3){run.finished=true;run.events.push({type:'won'});}
 else{
  run.phase=step+1;run.climbed=false;run.climb=null;
  run.height=0;run.rallying=false;run.mobilisation=0;run.x=0;
  run.z=step===1?-8:0;run.leaderZ=-8;run.cohesion=77;
 }
 return true;
}
function startClimb(run,direction){
 run.climb={
  direction,elapsed:0,duration:direction==='up'?STATUE.ascendTime:STATUE.descendTime,
  fromX:run.x,fromZ:run.z
 };
}
function animateClimb(run,t){
 const c=run.climb;
 c.elapsed=Math.min(c.duration,c.elapsed+t);
 const p=clamp(c.elapsed/c.duration,0,1);
 const ease=v=>v*v*(3-2*v);
 if(c.direction==='up'){
  if(p<.22){
   const k=ease(p/.22);
   run.x=c.fromX+(STATUE.footX-c.fromX)*k;
   run.z=c.fromZ+(STATUE.footZ-c.fromZ)*k;
   run.height=0;
  }else{
   const k=(p-.22)/.78;
   run.x=STATUE.footX;
   run.z=STATUE.footZ+(STATUE.topZ-STATUE.footZ)*k;
   run.height=STATUE.topHeight*k;
  }
 }else{
  if(p<.18){
   const k=ease(p/.18);
   run.x=c.fromX+(STATUE.topX-c.fromX)*k;
   run.z=c.fromZ+(STATUE.topZ-c.fromZ)*k;
   run.height=STATUE.topHeight;
  }else{
   const k=(p-.18)/.82;
   run.x=STATUE.topX;
   run.z=STATUE.topZ+(STATUE.footZ-STATUE.topZ)*k;
   run.height=STATUE.topHeight*(1-k);
  }
 }
 if(p>=1){
  run.climbed=c.direction==='up';
  if(!run.climbed)run.rallying=false;
  run.x=STATUE.footX;
  run.z=run.climbed?STATUE.topZ:STATUE.footZ;
  run.height=run.climbed?STATUE.topHeight:0;
  run.climb=null;
  run.events.push({type:run.climbed?'summit':'ground'});
 }
}
function advanceOnStatue(run,dx,dz,moving,t){
 if(!moving)return;
 const nx=clamp(run.x+dx*2.4*t,-1.42,1.42);
 const nz=clamp(run.z+dz*2.4*t,3.44,6.58);
 // Le corps de la statue est un obstacle, pas une zone traversable.
 const safe=(x,z)=>Math.hypot(x,z-STATUE.z)>.96;
 if(safe(nx,nz)){run.x=nx;run.z=nz;}
 else{
  if(safe(nx,run.z))run.x=nx;
  if(safe(run.x,nz))run.z=nz;
 }
 run.height=STATUE.topHeight;
}
export function advance(run,dt,input){
 if(run.finished)return;
 const t=clamp(dt,0,.05),x=clamp(Number(input.x)||0,-1,1),y=clamp(Number(input.y)||0,-1,1);
 const mag=Math.hypot(x,y)||1,dx=x/mag,dz=y/mag;
 run.clock+=t;
 // La montée est une animation réelle (pas une téléportation dans la statue).
 if(run.phase===2&&run.climb){animateClimb(run,t);return;}
 const moving=Math.hypot(x,y)>.15;
 if(run.phase===2&&run.climbed){
  advanceOnStatue(run,dx,dz,moving,t);
  if(input.red||run.rallying)run.mobilisation=clamp(run.mobilisation+48*t,0,100);
  if(run.mobilisation>=100)progress(run,2);
  return;
 }
 const speed=run.phase===3?5.6:4.9;
 const movement=moving?speed*t*(run.phase===3&&run.cohesion<42?.22:1):0;
 let nx=clamp(run.x+dx*movement,-8,8);
 let nz=clamp(run.z+dz*movement,run.phase===3?-2:-11,run.phase===3?106:20);
 // Des collisions protègent le socle contre l'entrée par l'intérieur.
 if(run.phase===2&&Math.abs(nx)<3.04&&nz>=1.97&&nz<=8.05){
  if(run.z<1.97)nz=1.94;
  else if(run.z>8.05)nz=8.08;
  else{nx=run.x;nz=run.z;}
 }
 run.x=nx;run.z=nz;run.height=0;
 if(run.phase===3){
  const gap=run.z-run.leaderZ;
  run.leaderZ+=clamp(gap-5,-1.7,1.6)*t*(input.red?2.2:1);
  const tooFar=gap>10;
  run.cohesion=clamp(run.cohesion+t*((input.red?23:0)+(moving?(tooFar?-11:-1.2):10.8)),0,100);
  if(run.z>=99&&run.cohesion>=62)progress(run,3);
 }
}
export function yellow(run){
 if(run.phase===1&&distance(run,{x:4.1,z:12})<3.3)return progress(run,1);
 if(run.phase!==2||run.climb)return false;
 if(run.climbed){run.rallying=false;startClimb(run,'down');return true;}
 if(distance(run,{x:STATUE.x,z:STATUE.z})<4.35){
  startClimb(run,'up');return true;
 }
 return false;
}
export function callFromStatue(run){
 if(run.phase!==2||!run.climbed||run.climb)return false;
 run.rallying=true;
 return true;
}
export function canNext(run){return run.finished||run.steps.includes(1);}
