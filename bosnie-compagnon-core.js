// Companion choreography for the literary mini-game "Entre les rafales".
// Pure, deterministic visual logic; never mutates the real game's state.
export const PASSAGES = Object.freeze([
  Object.freeze({start:10,end:13.6}),
  Object.freeze({start:25,end:29}),
  Object.freeze({start:41,end:45.2}),
  Object.freeze({start:57,end:61.5}),
  Object.freeze({start:74,end:78.8})
]);
export function createCompanionState(){
  return {stage:-1,stageTime:0,startX:3.75,targetX:13.2,x:3.75};
}
export function updateCompanion(companion,game){
  const completed=Math.min(PASSAGES.length,Math.max(0,game.passed?.length??0));
  const now=Number.isFinite(game.time)?game.time:0;
  if(completed>=PASSAGES.length){
    const x=PASSAGES[PASSAGES.length-1].end+.12;
    companion.stage=completed;companion.x=x;
    return {x,y:0,z:-.27,running:false,invulnerable:true,
      playerAhead:(game.x??0)>x,stage:completed,visible:!game.binoculars};
  }
  if(companion.stage!==completed || now<companion.stageTime-.2){
    companion.stage=completed;
    companion.stageTime=now;
    companion.startX=completed===0?3.75:PASSAGES[completed-1].end+.12;
    companion.targetX=PASSAGES[completed].end+.12;
    companion.x=companion.startX;
  }
  // The comrade leaves first; he crosses safely and stops just before the
  // next shelter. When the player finishes the gap, they overtake him.
  const duration=completed===0?1.22:1.85;
  const playing=game.phase==='playing'||game.phase==='hit'||game.phase==='finishing';
  const elapsed=playing?Math.max(0,now-companion.stageTime):0;
  const progress=Math.max(0,Math.min(1,elapsed/duration));
  const eased=progress*progress*(3-2*progress);
  companion.x=companion.startX+(companion.targetX-companion.startX)*eased;
  return {x:companion.x,y:0,z:-.27,
    running:progress<.995&&playing,
    invulnerable:true,stage:completed,
    playerAhead:(game.x??0)>companion.x,
    visible:!game.binoculars};
}
