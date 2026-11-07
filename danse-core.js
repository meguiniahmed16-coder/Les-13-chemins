export const SYMBOLS={left:'←',right:'→',cross:'✕',square:'□',circle:'○'};
export const NAMES={left:'Pas à gauche',right:'Pas à droite',cross:'Pas de jerk',square:'Les bras',circle:'Tour sur soi'};
export const PRACTICE=['left','right','cross','square','circle'];
export const SEQUENCES=[['left','right','cross','cross','left','right','cross','cross'],['square','cross','square','cross','left','right','square','cross'],['left','right','circle','cross','left','right','circle','cross'],['square','left','square','right','circle','cross','square','cross'],['left','square','right','square','circle','cross','circle','cross']];
export const BEAT=60/110,INTERVAL=BEAT*2,WINDOW=.34;
export function sanitize(passed=[]){const out=[];for(let i=1;i<=5;i++){if(passed.includes(i))out.push(i);else break;}return out;}
export function createRun(passed=[]){return {phase:'ready',passed:sanitize(passed),round:sanitize(passed).length,time:0,clock:0,practice:0,notes:[],hits:0,wrong:0,events:[],action:'cross',actionAt:-100,combo:0};}
export function start(r){if(r.phase!=='ready')return;r.phase='practice';r.practice=0;r.events.push({type:'practice'});}
export function beginRound(r){r.phase='playing';r.time=0;r.hits=0;r.wrong=0;r.notes=SEQUENCES[Math.min(r.round,4)].map((action,i)=>({action,at:2.3+i*INTERVAL,done:false,hit:false}));r.events.push({type:'round',round:r.round+1});}
export function press(r,action){if(!(action in SYMBOLS))return false;
 if(r.phase==='practice'){if(action!==PRACTICE[r.practice])return false;r.action=action;r.actionAt=r.clock;r.practice++;r.events.push({type:'hit',action,practice:true});if(r.practice===PRACTICE.length){r.phase='countdown';r.time=0;r.events.push({type:'trained'});}return true;}
 if(r.phase!=='playing')return false;
 const n=r.notes.find(n=>!n.done&&Math.abs(n.at-r.time)<=WINDOW);
 if(!n||n.action!==action){r.combo=0;r.wrong++;r.events.push({type:'offbeat'});return false;}
 n.done=n.hit=true;r.hits++;r.combo++;r.action=action;r.actionAt=r.clock;r.events.push({type:'hit',action,perfect:Math.abs(n.at-r.time)<.15});return true;
}
export function advance(r,dt){if(!Number.isFinite(dt)||dt<0||r.phase==='paused'||r.phase==='ready')return;r.clock+=dt;r.time+=dt;
 if(r.phase==='countdown'&&r.time>=2.5)beginRound(r);
 else if(r.phase==='break'&&r.time>=2.5)beginRound(r);
 else if(r.phase==='playing'){
  for(const n of r.notes)if(!n.done&&r.time>n.at+WINDOW){n.done=true;r.combo=0;r.events.push({type:'miss',action:n.action});}
  if(r.time>r.notes.at(-1).at+1){
   if(r.hits>=6&&r.wrong<=4){r.round++;r.passed.push(r.round);r.events.push({type:'pass',gap:r.round});r.phase=r.round===5?'won':'break';r.time=0;if(r.phase==='won')r.events.push({type:'won'});}
   else{r.phase='retry';r.events.push({type:'retry'});}
  }
 }
}
export function togglePause(r){if(r.phase==='paused'){r.phase=r.resumePhase;return;}if(['practice','playing','countdown','break','retry'].includes(r.phase)){r.resumePhase=r.phase;r.phase='paused';}}
