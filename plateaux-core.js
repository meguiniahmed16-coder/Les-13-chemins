/* Persisted progression for any number of boards inside a literary level. */
(function(root){
 'use strict';
 function definitions(level){return root.TreizeEtapesData?.find(s=>s.level===level)?.plateaux||[];}
 function progress(state,level){state.levelPlates??={};return state.levelPlates[level]??={index:1,finished:[],read:[]};}
 function migrate(state){
  if(state.platesVersion===1)return;
  const p=progress(state,5);
  if(state.completed.includes(5)){state.quizPassed={...state.quizPassed,5:true};state.completed=state.completed.filter(n=>n!==5);if(!state.completed.some(n=>n>5))state.unlocked=Math.min(state.unlocked,5);}
  if(state.danseFinished||[1,2,3,4,5].every(n=>(state.dansePassed||[]).includes(n))){p.finished=[1];p.index=2;}
  state.platesVersion=1;
 }
 function done(state,level,index){const p=progress(state,level);if(!p.finished.includes(index))p.finished.push(index);p.index=Math.max(p.index,index+1);}
 function complete(state,level){const p=progress(state,level),defs=definitions(level);if(!defs.length||!defs.every((_,i)=>p.finished.includes(i+1)))return false;if(!state.completed.includes(level))state.completed.push(level);state.unlocked=Math.min(13,Math.max(state.unlocked,level+1));return true;}
 function beginYoyo(state,id){const p=progress(state,5);if(!p.finished.includes(1))return null;if(state.yoyoPending)return state.yoyoPending;state.yoyoPending={id,level:5,plateau:2,replay:!!state.yoyoFinished};return state.yoyoPending;}
 function finishYoyo(state,id){const p=state.yoyoPending;if(!p||p.id!==id||p.level!==5||p.plateau!==2)return null;let bonus=0;if(!state.yoyoFinished){state.points+=30;bonus=30;}state.yoyoFinished=true;state.yoyoPending=null;done(state,5,2);complete(state,5);return {bonus,score:state.points,replay:p.replay};}
 root.TreizePlateaux={definitions,progress,migrate,done,complete,beginYoyo,finishYoyo};
})(typeof window==='undefined'?globalThis:window);
