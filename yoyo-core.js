export const PARTS = ['Trouver la brosse', 'Récupérer le tabac', 'Récupérer le café'];
export const BRUSH = {x:.733, y:.70};
// Seven fixed steel bars with 21 cm pitch. Only openings can receive a bag.
export const BAR_X = [-.63,-.42,-.21,0,.21,.42,.63];
export const SLIT_X = [-.315,-.105,.105,.315];
const BAR_DEPTH=.88, FOV_HALF=Math.tan(63*Math.PI/360/2);
export function barCenters(aspect=16/9){
 return BAR_X.map(x=>.5+x/(2*BAR_DEPTH*FOV_HALF*Math.max(.85,aspect)));
}
export function slitCenters(aspect=16/9){
 return SLIT_X.map(x=>.5+x/(2*BAR_DEPTH*FOV_HALF*Math.max(.85,aspect)));
}
export function openingTolerance(aspect=16/9){
 // 21 cm pitch, 18 mm-radius bars and an 11.6 cm folded bag: 2.9 cm clearance.
 return .029/(2*BAR_DEPTH*FOV_HALF*Math.max(.85,aspect));
}
export function nearestSlit(g){
 const value=g.hooked&&Number.isFinite(g.hookX)?g.hookX:g.aim;
 return slitCenters(g.aspect||16/9).reduce((a,b)=>Math.abs(value-a)<Math.abs(value-b)?a:b);
}
export function betweenBars(g){
 return !!g.hooked&&Math.abs((g.hookX??g.aim)-nearestSlit(g))<=openingTolerance(g.aspect||16/9);
}
export function setWindowAspect(g,aspect){if(Number.isFinite(aspect)&&aspect>.6&&aspect<3)g.aspect=aspect;}

export const clamp = (v,lo,hi)=>Math.max(lo,Math.min(hi,v));
export function createGame(){return {phase:'ready',part:0,points:0,time:0,partTime:0,aim:.5,brushX:BRUSH.x,hookX:null,hidden:false,holding:false,hooked:false,pull:0,guard:'away',nextGuard:9.8,guardStart:0,exposed:0,cooldown:0,misses:0,bags:0,blocked:false,aspect:16/9,events:[],lastPhase:null};}
export function startGame(g){Object.assign(g,createGame(),{phase:'playing'});}
export function aligned(g){return Math.abs(g.aim-(g.part===0?(g.brushX??BRUSH.x):ropePosition(g)))<(g.part===0?.065:.057);}
export function ropePosition(g){if(g.hooked&&Number.isFinite(g.hookX))return g.hookX;return .5 + Math.sin(g.partTime*(g.part===2?1.31:1.08)+(g.part===2?.8:0))*(g.part===2?.245:.225);}
export function move(g,x,y=0,dt=1/30){if(g.phase!=='playing')return;if(y>.45){hide(g);return;}if(Math.abs(x)>.15){g.hidden=false;g.aim=clamp(g.aim+x*dt*.38,.12,.88);if(g.hooked){g.hookX=g.aim;g.blocked=!betweenBars(g);}}if(y<-.45)g.hidden=false;}
export function hide(g){g.hidden=true;g.holding=false;g.exposed=0;g.blocked=false;}
export function aimAt(g,x){if(g.phase==='playing'){g.aim=clamp(x,.12,.88);if(g.hooked){g.hookX=g.aim;g.blocked=!betweenBars(g);}g.hidden=false;}}
function award(g){g.part++;g.points=g.part*10;g.holding=false;g.hooked=false;g.hookX=null;g.pull=0;g.blocked=false;g.bags=Math.max(0,g.part-1);g.partTime=0;g.events.push({type:'part',part:g.part,points:g.points});if(g.part===3){g.phase='victory';g.events.push({type:'won',points:30});}else{g.phase='between';g.events.push({type:'between',part:g.part});}}
export function continueGame(g){if(g.phase!=='between')return;g.phase='playing';g.hidden=false;g.aim=.5;g.guard='away';g.nextGuard=g.time+8.8+g.part*.8;g.exposed=0;}
export function actionDown(g){if(g.phase!=='playing'||g.cooldown>0)return;g.hidden=false;g.holding=true;if(g.guard==='watching'){g.events.push({type:'warning'});return;}if(g.part===0){if(aligned(g)){award(g);}else{g.cooldown=.55;g.events.push({type:'search-miss'});}return;}if(!g.hooked){if(aligned(g)){g.hookX=ropePosition(g);g.hooked=true;g.blocked=!betweenBars(g);g.events.push({type:'hook'});}else{g.misses++;g.cooldown=.55;g.events.push({type:'miss'});}}}
export function actionUp(g){g.holding=false;}
export function pauseGame(g){if(g.phase==='paused'){g.phase=g.lastPhase||'playing';g.lastPhase=null;}else if(['playing','between'].includes(g.phase)){g.lastPhase=g.phase;g.phase='paused';g.holding=false;}}
export function advance(g,dt){if(g.phase!=='playing')return;dt=clamp(dt,0,.1);g.time+=dt;g.partTime+=dt;g.cooldown=Math.max(0,g.cooldown-dt);
 if(g.guard==='away'&&g.time>=g.nextGuard){g.guard='approaching';g.guardStart=g.time;g.events.push({type:'guard',state:'approaching'});}
 const since=g.time-g.guardStart;
 if(g.guard==='approaching'&&since>=2.8){g.guard='watching';g.events.push({type:'guard',state:'watching'});}
 if(g.guard==='watching'&&since>=5.2){g.guard='leaving';g.events.push({type:'guard',state:'leaving'});}
 if(g.guard==='leaving'&&since>=6.8){g.guard='away';g.nextGuard=g.time+8.6+(g.part*1.7+g.misses*.41)%4;g.events.push({type:'guard',state:'away'});}
 if(g.guard==='watching'&&!g.hidden){g.exposed+=dt;if(g.exposed>.62){g.phase='caught';g.holding=false;g.events.push({type:'caught'});return;}}else g.exposed=0;
 if(g.part>0&&g.hooked&&g.holding&&!g.hidden&&g.guard!=='watching'){
  const clear=betweenBars(g);
  if(!clear && !g.blocked)g.events.push({type:'bar-blocked'});
  g.blocked=!clear;
  // Physically blocked by the bars: steer the hooked bag through a gap.
  if(clear){g.pull=clamp(g.pull+dt*.19,0,1);if(g.pull>=1)award(g);}
 }
}
