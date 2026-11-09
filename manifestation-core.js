/* Camarades ! — règles pures : départ statue → drapeau → République–Bastille.
 * Le joueur avance librement. Le cortège suit en retard ; s'arrêter et maintenir
 * ROUGE le regroupe. La cohésion conditionne la rencontre, jamais les commandes.
 */
export const OBJECTIFS=Object.freeze(['La République — « Camarades ! »','Retrouver le drapeau français','La rencontre des cortèges']);
export const MAX_POINTS=30;
export const GAME_ID='rendezvous-2002';
export const STATUE=Object.freeze({x:0,z:5,footX:-1.15,footZ:.35,topX:-1.15,topZ:3.48,topHeight:3.32,descendTime:2});
export const FLAG=Object.freeze({x:4.1,z:12});
// Three distinct approaches on the boulevard; the police are fictional game
// opponents repelled by hearts, not by physical violence.
export const CRS_WAVES=Object.freeze([
 Object.freeze({id:1,trigger:17,anchor:27}),
 Object.freeze({id:2,trigger:44,anchor:54}),
 Object.freeze({id:3,trigger:71,anchor:81}),
]);
export const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const behindNarrator=(narratorZ,candidateZ,gap=4.5)=>Math.min(candidateZ,narratorZ-gap);
export function newRun(){
 return {phase:1,steps:[],x:STATUE.topX,z:STATUE.topZ,height:STATUE.topHeight,facing:0,
 climbed:true,climb:null,statueShouted:false,shoutRemaining:0,mobilisation:0,
 cohesion:80,leaderZ:-9,clock:0,finished:false,events:[],
 crsWaves:CRS_WAVES.map(w=>({...w,status:'waiting',hearts:0,startedAt:0,repelledAt:0,cooldown:0}))};
}
export function progress(run,step){
 if(run.finished||step!==run.steps.length+1||step<1||step>3)return false;
 run.steps.push(step);run.events.push({type:'progress',step});
 if(step===3){run.finished=true;run.events.push({type:'won'});return true;}
 run.phase=step+1;run.climb=null;run.climbed=false;run.height=0;
 run.statueShouted=false;run.shoutRemaining=0;run.mobilisation=0;run.facing=0;
 run.cohesion=80;
 if(step===1){run.x=STATUE.footX;run.z=STATUE.footZ;run.leaderZ=run.z-7;}
 else{run.x=0;run.z=0;run.leaderZ=-7.0;}
 return true;
}
export function callFromStatue(run){
 if(run.phase!==1||!run.climbed||run.climb||run.statueShouted||run.finished)return false;
 run.statueShouted=true;run.shoutRemaining=.85;run.events.push({type:'shout'});
 return true;
}
function descend(run,dt){
 const c=run.climb;
 c.elapsed=Math.min(c.duration,c.elapsed+dt);
 const t=c.elapsed/c.duration,k=t*t*(3-2*t);
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
  run.facing=(run.facing+x*t*2.5)%(Math.PI*2);
  if(run.statueShouted){
   run.shoutRemaining=Math.max(0,run.shoutRemaining-t);
   if(run.shoutRemaining===0)run.climb={direction:'down',elapsed:0,duration:STATUE.descendTime};
  }
  return;
 }
 const moving=Math.hypot(x,y)>.15;
 const speed=run.phase===3?5.6:4.9;
 run.x=clamp(run.x+x/mag*speed*t,-8,8);
 run.z=clamp(run.z+y/mag*speed*t,run.phase===3?-2:-11,run.phase===3?106:20);
 if(moving)run.facing=Math.atan2(x,y);
 if(run.phase!==3)return;
 // Une vraie séparation spatiale qui se voit à l'écran :
 // le joueur marche plus vite que ses camarades.
 const gapBefore=run.z-run.leaderZ;
 if(moving){
  run.leaderZ+=3.5*t;
 }else{
  run.leaderZ=Math.min(run.z-5.8,run.leaderZ+(input.red?9.5:1.8)*t);
 }
 run.leaderZ=clamp(run.leaderZ,run.z-15.5,run.z-5.5);
 const gap=run.z-run.leaderZ;
 // La police intervient trois fois. Un appui maintenu sur ROUGE envoie des
 // cœurs successifs (maximum 4 par vague), qui font fuir les CRS.
 let active=run.crsWaves.find(w=>w.status==='active');
 if(!active){
  active=run.crsWaves.find(w=>w.status==='waiting'&&run.z>=w.trigger);
  if(active){active.status='active';active.startedAt=run.clock;active.cooldown=0;run.events.push({type:'crs:incoming',wave:active.id});}
 }
 if(active){
  active.cooldown=Math.max(0,active.cooldown-t);
  if(input.red&&active.cooldown<=0){
   active.hearts++;
   active.cooldown=.38;
   run.events.push({type:'heart',wave:active.id,hit:active.hearts});
   if(active.hearts>=4){
    active.status='repelled';active.repelledAt=run.clock;
    run.events.push({type:'crs:repelled',wave:active.id});
   }
  }
 }
 if(moving)run.cohesion=clamp(run.cohesion-t*(gap>10?4.0:2.3),0,100);
 else if(input.red)run.cohesion=clamp(run.cohesion+t*23,0,100);
 else run.cohesion=clamp(run.cohesion+t*1.4,0,100);
 // Ni ralentissement ni blocage du joystick. La rencontre attend le groupe.
 if(run.z>=99&&run.cohesion>=68&&gap<=9.5&&run.crsWaves.every(w=>w.status==='repelled'))progress(run,3);
}
export function yellow(run){
 if(run.phase===1)return callFromStatue(run);
 if(run.phase===2&&distance(run,FLAG)<3.3)return progress(run,2);
 return false;
}
export function canNext(run){return run.finished||run.steps.includes(1);}
