/* Chemin III — jeu 1. Règles pures : progression et cohésion, sans accès au navigateur. */
export const OBJECTIFS=Object.freeze(['Le drapeau français','Camarades !','La rencontre des cortèges']);
export const MAX_POINTS=30;
export const GAME_ID='rendezvous-2002';
export const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function newRun(){
 return {phase:1,steps:[],x:0,z:-7,climbed:false,mobilisation:0,cohesion:77,leaderZ:-8,clock:0,finished:false,events:[]};
}
export function progress(run,step){
 if(run.finished||step!==run.steps.length+1||step<1||step>3)return false;
 run.steps.push(step);run.events.push({type:'progress',step});
 if(step===3){run.finished=true;run.events.push({type:'won'});}
 else {run.phase=step+1;run.climbed=false;run.mobilisation=0;run.x=0;run.z=step===1?-8:0;run.leaderZ=-8;run.cohesion=77;}
 return true;
}
export function advance(run,dt,input){
 if(run.finished)return;
 const t=clamp(dt,0,.05),x=clamp(Number(input.x)||0,-1,1),y=clamp(Number(input.y)||0,-1,1);
 const mag=Math.hypot(x,y)||1,dx=x/mag,dz=y/mag;
 run.clock+=t;
 const walking=Math.hypot(x,y)>.15;
 const speed=run.phase===3?5.6:4.9;
 let moving=speed*t*(run.phase===3&&run.cohesion<42?.22:1);
 if(!walking||run.phase===2&&run.climbed)moving=0;
 run.x=clamp(run.x+dx*moving,-8,8);
 run.z=clamp(run.z+dz*moving,run.phase===3?-2:-11,run.phase===3?106:20);
 if(run.phase===2&&run.climbed&&input.red)run.mobilisation=clamp(run.mobilisation+48*t,0,100);
 if(run.phase===2&&run.climbed&&run.mobilisation>=100)progress(run,2);
 if(run.phase===3){
  // Avancer trop loin de la foule l'étire ; s'arrêter ou appeler la rassemble.
  const gap=run.z-run.leaderZ;
  run.leaderZ+=clamp(gap-5,-1.7,1.6)*t*(input.red?2.2:1.0);
  const tooFar=gap>10;
  run.cohesion=clamp(run.cohesion+t*((input.red?23:0)+(walking?(tooFar?-11:-1.2):10.8)),0,100);
  if(run.z>=99&&run.cohesion>=62)progress(run,3);
 }
}
export function yellow(run){
 if(run.phase===1&&distance(run,{x:4.1,z:12})<3.3)return progress(run,1);
 if(run.phase===2&&!run.climbed&&distance(run,{x:0,z:5})<3.9){run.climbed=true;return true;}
 return false;
}
export function canNext(run){return run.finished||run.steps.includes(1);}
