/* Keep existing reading progress when the three opening cartouches
 * follow the chronology of the book: Mustapha -> lycée -> Barcelone.
 * Called before the plateau and atlas read the shared saved state.
 */
(function(root){
 'use strict';
 const VERSION=2;
 const mapLevel=n=>({1:2,2:3,3:1})[Number(n)]??Number(n);
 function mapFlags(flags){
  if(!flags||typeof flags!=='object')return flags;
  return Object.fromEntries(Object.entries(flags).map(([key,value])=>{
   const n=Number(key);
   return [Number.isInteger(n)&&n>=1&&n<=13?String(mapLevel(n)):key,value];
  }));
 }
 function migrate(storage,key='tectonique-jeu-plateau-v1'){
  let previous;
  try{previous=JSON.parse(storage.getItem(key)||'null');}catch{return null;}
  if(!previous||!Array.isArray(previous.completed))return null;
  if(previous.orderVersion===VERSION)return previous;
  const state={...previous};
  state.completed=[...new Set(previous.completed.map(mapLevel))];
  state.tries=mapFlags(previous.tries||{});
  state.arcadeBonuses=mapFlags(previous.arcadeBonuses||{});
  if(previous.quizPassed)state.quizPassed=mapFlags(previous.quizPassed);
  if(previous.levelPlates)state.levelPlates=mapFlags(previous.levelPlates);
  for(const [pending,level]of [['arcadePending',2],['catalognePending',3],['marmousetsPending',1]]){
   if(state[pending]&&typeof state[pending]==='object')
    state[pending]={...state[pending],level};
  }
  const unlocked=Number(previous.unlocked)||1;
  // Previous players keep access to their completed passages. A brand-new
  // player still starts with only the childhood cartouche unlocked.
  state.unlocked=unlocked>1?Math.max(unlocked,3):1;
  state.selected=Number(previous.selected)>3?Number(previous.selected):1;
  state.orderVersion=VERSION;
  try{storage.setItem(key,JSON.stringify(state));}catch{}
  return state;
 }
 root.TreizeOrdre={VERSION,mapLevel,migrate};
})(typeof window==='undefined'?globalThis:window);
