/* CAMARADES ! — logique testable sans rendu.
 * Étape 1 : seul dans la rue adjacente, sélectionner et prendre le drapeau.
 * Étape 2 : tourner dans l'avenue, retrouver la foule, monter, crier « Camarades ! ».
 * Étape 3 : récupérer ♥, ✿, 💋 à chaque trottoir, sélectionner chaque CRS,
 * tirer individuellement, traverser le cortège de Bastille et être suivi.
 * Les alliés ne comptent aucun impact : seuls les tirs du joueur le font.
 */
export const OBJECTIFS=Object.freeze(['Le drapeau français','Camarades !','Les deux cortèges']);
export const MAX_POINTS=30;
export const GAME_ID='rendezvous-2002';
export const STATUE=Object.freeze({x:6,z:5,footX:4.85,exitX:2.4,footZ:.35,topX:4.85,topZ:3.48,topHeight:3.32,ascendTime:2.3,descendTime:2});
export const FLAG=Object.freeze({x:4.1,z:12});
export const WEAPONS=Object.freeze([
 Object.freeze({id:1,kind:'heart',icon:'♥',name:'Cœur',x:9.4,z:9}),
 Object.freeze({id:2,kind:'flower',icon:'✿',name:'Fleur',x:-9.4,z:36}),
 Object.freeze({id:3,kind:'kiss',icon:'💋',name:'Bisou',x:9.4,z:63})
]);
export const CRS_WAVES=Object.freeze([
 Object.freeze({id:1,trigger:19,anchor:28,kind:'heart'}),
 Object.freeze({id:2,trigger:46,anchor:55,kind:'flower'}),
 Object.freeze({id:3,trigger:73,anchor:82,kind:'kiss'})
]);
export const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
// Une collision simple autour du socle, sans téléportation : chaque axe glisse librement.
export const insideStatueBase=(x,z)=>x>STATUE.x-3.05&&x<STATUE.x+3.05&&z>1.85&&z<8.15;
export const behindNarrator=(z,candidate,gap=4.6)=>Math.min(candidate,z-gap);
export const activeWave=run=>run.crsWaves.find(w=>w.status==='active')||null;
export function newRun(){
 return {phase:1,steps:[],x:-4,z:-7,height:0,facing:0,
  climbed:false,climb:null,statueShouted:false,shoutRemaining:0,
  clock:0,finished:false,events:[],selected:null,hasFlag:false,
  weapon:null,pickups:WEAPONS.map(w=>({...w,collected:false})),
  crsWaves:CRS_WAVES.map(w=>({...w,status:'waiting',cooldown:0,startedAt:0,repelledAt:0,
    officers:Array.from({length:4},(_,id)=>({id,status:'standing',targeted:false,hitAt:0})),shots:[]})),
  leaderZ:-7,cohesion:82,joined:0,joining:false};
}
export function progress(run,step){
 if(run.finished||step!==run.steps.length+1||step<1||step>3)return false;
 run.steps.push(step);run.events.push({type:'progress',step});
 if(step===3){run.finished=true;run.events.push({type:'won'});return true;}
 run.phase=step+1;run.selected=null;run.height=0;run.climb=null;run.climbed=false;run.facing=0;
 if(step===1){
  run.hasFlag=true;run.x=6;run.z=-7;run.facing=-Math.PI/2;
  run.events.push({type:'corner'});
 }else{
  // Continuité : la marche vers Bastille commence au pied de la statue,
  // sans téléporter le joueur au milieu de la chaussée.
  run.leaderZ=run.z-7.35;run.cohesion=82;
  run.events.push({type:'march'});
 }
 return true;
}
export function selectTarget(run,target){
 if(!target||run.finished)return false;
 if(target.type==='flag'&&run.phase===1){
  run.selected={type:'flag'};run.events.push({type:'selected',target:run.selected});return true;
 }
 if(target.type==='statue'&&run.phase===2&&!run.climbed&&!run.climb){
  run.selected={type:'statue'};run.events.push({type:'selected',target:run.selected});return true;
 }
 if(target.type==='pickup'&&run.phase===3){
  const pickup=run.pickups.find(w=>w.id===Number(target.id));
  const wave=run.crsWaves.find(w=>w.id===Number(target.id));
  if(!pickup||pickup.collected||wave.status==='repelled')return false;
  run.selected={type:'pickup',id:pickup.id};run.events.push({type:'selected',target:run.selected});return true;
 }
 if(target.type==='crs'&&run.phase===3){
  const wave=activeWave(run),officer=wave?.officers[Number(target.id)];
  if(!wave||wave.id!==Number(target.wave)||!officer||officer.status!=='standing'||officer.targeted)return false;
  run.selected={type:'crs',wave:wave.id,id:officer.id};
  run.events.push({type:'selected',target:run.selected});return true;
 }
 return false;
}
export function availableTargets(run){
 if(run.phase===1)return [{type:'flag',label:'🇫🇷 Drapeau'}];
 if(run.phase===2&&!run.climbed&&!run.climb)return [{type:'statue',label:'Statue'}];
 if(run.phase!==3)return [];
 const wave=activeWave(run);
 if(wave){
  return wave.officers.filter(o=>o.status==='standing'&&!o.targeted)
   .map(o=>({type:'crs',wave:wave.id,id:o.id,label:'CRS '+(o.id+1)}));
 }
 const pickup=run.pickups.find(w=>!w.collected&&run.z<=w.z+15&&run.z>=w.z-13);
 return pickup?[{type:'pickup',id:pickup.id,label:pickup.icon+' '+pickup.name}]:[];
}
export function selectNext(run){
 const opts=availableTargets(run);
 if(!opts.length)return false;
 const i=opts.findIndex(o=>run.selected?.type===o.type&&
  (o.id===undefined||run.selected?.id===o.id)&&
  (o.wave===undefined||run.selected?.wave===o.wave));
 const next=opts[(i+1)%opts.length];
 return selectTarget(run,next);
}
export function yellow(run){
 if(run.finished)return false;
 if(run.phase===1&&run.selected?.type==='flag'&&distance(run,FLAG)<=3.4){
  run.events.push({type:'flag:pickup'});return progress(run,1);
 }
 // JAUNE sert à monter ET à redescendre. Aucun bouton supplémentaire nécessaire.
 if(run.phase===2&&run.climbed&&!run.climb){
  if(!run.statueShouted)callFromStatue(run);
  run.shoutRemaining=0;
  run.climb={direction:'down',elapsed:0,duration:STATUE.descendTime};
  run.events.push({type:'descent:start'});
  return true;
 }
 if(run.phase===2&&!run.climbed&&!run.climb&&!run.statueShouted&&
    (run.selected?.type==='statue'||distance(run,{x:STATUE.x,z:STATUE.z})<5.25)&&
    distance(run,{x:STATUE.x,z:STATUE.z})<5.25){
  run.climb={direction:'up',elapsed:0,duration:STATUE.ascendTime,fromX:run.x,fromZ:run.z};
  run.selected=null;return true;
 }
 if(run.phase===3&&run.selected?.type==='pickup'){
  const p=run.pickups.find(w=>w.id===run.selected.id);
  if(!p||p.collected||distance(run,p)>3.5)return false;
  const wave=run.crsWaves.find(w=>w.id===p.id);
  if(wave.status==='repelled')return false;
  p.collected=true;run.weapon=p.kind;run.selected=null;
  run.events.push({type:'weapon:pickup',kind:p.kind,wave:p.id});return true;
 }
 return false;
}
export function callFromStatue(run){
 if(run.phase!==2||!run.climbed||run.climb||run.statueShouted)return false;
 run.statueShouted=true;run.shoutRemaining=.85;run.events.push({type:'shout'});return true;
}
export function fire(run){
 if(run.finished||run.phase!==3||run.selected?.type!=='crs')return false;
 const wave=activeWave(run);
 if(!wave||run.selected.wave!==wave.id||run.weapon!==wave.kind||wave.cooldown>0)return false;
 const officer=wave.officers[run.selected.id];
 if(!officer||officer.status!=='standing'||officer.targeted)return false;
 officer.targeted=true;const duration=.78;
 wave.shots.push({officer:officer.id,elapsed:0,duration});
 wave.cooldown=.22;
 run.events.push({type:'projectile:fire',wave:wave.id,officer:officer.id,kind:wave.kind,duration});
 run.selected=null;
 return true;
}
function animateClimb(run,t){
 const c=run.climb;c.elapsed=Math.min(c.duration,c.elapsed+t);
 const p=clamp(c.elapsed/c.duration,0,1),up=c.direction==='up';
 const k=p*p*(3-2*p);
 if(up){
  run.x=c.fromX+(STATUE.topX-c.fromX)*k;
  run.z=c.fromZ+(STATUE.topZ-c.fromZ)*k;
  run.height=STATUE.topHeight*k;
 }else{
  // À la descente, une sortie latérale dégage le joueur du volume du socle.
  // Le passage de l'escalier au trottoir se fait progressivement, sans blocage.
  const exit=clamp((p-.65)/.35,0,1),sideStep=exit*exit*(3-2*exit);
  run.x=STATUE.topX+(STATUE.exitX-STATUE.topX)*sideStep;
  run.z=STATUE.topZ+(STATUE.footZ-STATUE.topZ)*k;
  run.height=STATUE.topHeight*(1-k);
 }
 if(p>=1){
  run.climb=null;run.climbed=up;
  run.x=up?STATUE.topX:STATUE.exitX;
  run.z=up?STATUE.topZ:STATUE.footZ;
  run.height=up?STATUE.topHeight:0;
  run.events.push({type:up?'summit':'ground'});
  if(!up&&run.statueShouted)progress(run,2);
 }
}
export function advance(run,dt,input={}){
 if(run.finished)return;
 const t=clamp(Number(dt)||0,0,.12);
 const x=clamp(Number(input.x)||0,-1,1),y=clamp(Number(input.y)||0,-1,1);
 const moving=Math.hypot(x,y)>.15,mag=Math.max(1,Math.hypot(x,y));
 run.clock+=t;
 if(run.phase===2&&run.climb){animateClimb(run,t);return;}
 if(run.phase===2&&run.climbed){
  if(run.statueShouted){
   run.shoutRemaining=Math.max(0,run.shoutRemaining-t);
   if(run.shoutRemaining===0)run.climb={direction:'down',elapsed:0,duration:STATUE.descendTime};
  }else run.facing=(run.facing+x*t*2)%(Math.PI*2);
  return;
 }
 if(moving){
  const speed=run.phase===3?5.6:4.9;
  const nextX=clamp(run.x+x/mag*speed*t,-8,8);
  const nextZ=clamp(run.z+y/mag*speed*t,run.phase===3?-2:-11,run.phase===3?116:22);
  // Vérifier les axes séparément pour marcher le long du socle, jamais se retrouver coincé.
  if(!insideStatueBase(nextX,run.z))run.x=nextX;
  if(!insideStatueBase(run.x,nextZ))run.z=nextZ;
  run.facing=Math.atan2(x,y);
 }
 if(run.phase!==3)return;
 // The rear group gradually lags, then regroups when the player stops.
 if(moving)run.leaderZ+=3.5*t;
 else run.leaderZ=Math.min(run.z-5.8,run.leaderZ+(input.red?9.5:1.8)*t);
 run.leaderZ=clamp(run.leaderZ,run.z-15.5,run.z-5.5);
 const gap=run.z-run.leaderZ;
 if(moving)run.cohesion=clamp(run.cohesion-t*(gap>10?3.4:1.9),0,100);
 else if(input.red)run.cohesion=clamp(run.cohesion+t*22,0,100);
 else run.cohesion=clamp(run.cohesion+t*1.3,0,100);
 let wave=activeWave(run);
 if(!wave){
  wave=run.crsWaves.find(w=>w.status==='waiting'&&run.z>=w.trigger);
  if(wave){wave.status='active';wave.startedAt=run.clock;run.events.push({type:'crs:incoming',wave:wave.id,kind:wave.kind});}
 }
 if(wave){
  run.z=Math.min(run.z,wave.trigger+1.3);
  wave.cooldown=Math.max(0,wave.cooldown-t);
  for(let i=wave.shots.length-1;i>=0;i--){
   const shot=wave.shots[i];shot.elapsed+=t;
   if(shot.elapsed>=shot.duration){
    const officer=wave.officers[shot.officer];wave.shots.splice(i,1);
    if(officer.status==='standing'){
     officer.status='transformed';officer.hitAt=run.clock;
     run.events.push({type:'projectile:hit',wave:wave.id,officer:officer.id,kind:wave.kind});
    }
   }
  }
  if(wave.officers.every(o=>o.status==='transformed')){
   wave.status='repelled';wave.repelledAt=run.clock;run.weapon=null;run.selected=null;
   run.events.push({type:'crs:repelled',wave:wave.id,kind:wave.kind});
  }
 }
 const allDone=run.crsWaves.every(w=>w.status==='repelled');
 if(allDone&&run.z>=99){
  if(!run.joining){run.joining=true;run.events.push({type:'join:start'});}
  run.joined=clamp(Math.floor((run.z-99)/9*16),0,16);
 }
 // Win only when through the OTHER crowd, and whole larger group follows.
 if(allDone&&run.z>=109&&run.joined===16&&run.cohesion>=58)progress(run,3);
}
export function red(run){
 if(run.phase===2)return callFromStatue(run);
 return fire(run);
}
export function canNext(run){return run.finished||run.steps.includes(1);}
