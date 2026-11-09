/* Chapitre 1 — La salle d'attente : trois jeux successifs, une seule vignette.
 * Les identifiants historiques 1, 2, 3 sont conservés pour les sauvegardes,
 * les questions, les mini-jeux, la lecture et l'atlas géographique.
 */
(function(root){
 'use strict';
 const PARTS=Object.freeze([
  Object.freeze({scene:1,title:'Les Marmousets',place:'Ferney-Voltaire',game:'arcade-marmousets.html'}),
  Object.freeze({scene:2,title:'Le départ du lycée',place:'La Roche-sur-Foron',game:'arcade-a410.html'}),
  Object.freeze({scene:3,title:'Barcelone',place:'Place de Catalogne',game:'arcade-catalogne.html'})
 ]);
 const CARDS=Object.freeze([1,4,5,6,7,8,9,10,11,12,13]);
 const completed=(state,n)=>Array.isArray(state?.completed)&&state.completed.includes(n);
 // Compatibilité : les joueurs qui ont déjà terminé une scène ultérieure
 // gardent l'accès à leurs chapitres et peuvent revisiter les trois jeux.
 function legacy(state){return Array.isArray(state?.completed)&&state.completed.some(n=>n>=4);}
 function partDone(state,n){
  if(!Number.isInteger(n)||n<1||n>3)return false;
  if(legacy(state))return true;
  if(!completed(state,n))return false;
  if(n===1)return Boolean(state.arcadeBonuses?.['1']);
  if(n===2)return Boolean(state.arcadeBonuses?.['2']);
  return Boolean(state.catalogneFinished||(state.catalogneSold?.length===5&&!state.catalognePending));
 }
 function done(state){return PARTS.every(p=>partDone(state,p.scene));}
 function nextPart(state){return PARTS.find(p=>!partDone(state,p.scene))?.scene||1;}
 function canEnter(state,n){
  if(!Number.isInteger(n)||n<1||n>13)return false;
  if(n===1)return true;
  if(n===2)return partDone(state,1);
  if(n===3)return partDone(state,1)&&partDone(state,2);
  return done(state)&&n<=Math.max(1,Number(state.unlocked)||1);
 }
 function chapterOf(scene){return scene<=3?1:scene-2;}
 function chaptersDone(state){return Number(done(state))+CARDS.slice(1).filter(n=>completed(state,n)).length;}
 function chapterReached(state){
  if(!done(state))return 1;
  return Math.max(1,chapterOf(Math.min(13,Math.max(4,Number(state.unlocked)||4))));
 }
 function scenePassedCount(state){return PARTS.filter(p=>partDone(state,p.scene)).length;}
 function reconcile(state){
  if(!state||!Array.isArray(state.completed))return false;
  let desired=state.selected;
  if(!canEnter(state,desired)){
   desired=done(state)?1:nextPart(state);
   if(!canEnter(state,desired))desired=1;
  }
  if(state.selected===desired)return false;
  state.selected=desired;
  return true;
 }
 root.TreizeChapitre1={PARTS,CARDS,legacy,partDone,done,nextPart,canEnter,chapterOf,chaptersDone,chapterReached,scenePassedCount,reconcile};
})(typeof window==='undefined'?globalThis:window);
