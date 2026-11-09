/* Chapitres 1 et 2 : scènes regroupées, sauvegardes compatibles.
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
 const CHAPTER2_PARTS=Object.freeze([
  Object.freeze({part:1,scene:4,plateau:1,title:'Sarajevo',game:'jeu-bosnie.html'}),
  Object.freeze({part:2,scene:5,plateau:1,title:'Le danseur',game:'jeu-danse.html'}),
  Object.freeze({part:3,scene:5,plateau:2,title:'La prison',game:'jeu-yoyo.html'})
 ]);
 // Les scènes 4 et 5 (deux sous-jeux) ne comptent que pour un chapitre.
 const CARDS=Object.freeze([1,4,6,7,8,9,10,11,12,13]);
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
 function chapter2Legacy(state){
  // Les joueurs déjà arrivés après le jeu du yo-yo restent avancés.
  return Array.isArray(state?.completed)&&state.completed.some(n=>n>=6);
 }
 function chapter2Progress(state){return state?.levelPlates?.[5]||{finished:[]};}
 function chapter2PartDone(state,n){
  if(!Number.isInteger(n)||n<1||n>3)return false;
  if(chapter2Legacy(state))return true;
  const p=chapter2Progress(state),pastDance=Boolean(
   state?.danseFinished||state?.dansePending||
   state?.quizPassed?.[5]||p.finished?.includes(1));
  if(n===1)return Boolean(
   (completed(state,4)&&state?.bosnieFinished)||pastDance||state?.yoyoFinished);
  if(n===2)return Boolean(
   state?.danseFinished||p.finished?.includes(1)||state?.yoyoFinished);
  return Boolean(state?.yoyoFinished&&(completed(state,5)||p.finished?.includes(2))||p.finished?.includes(2));
 }
 function chapter2Done(state){return CHAPTER2_PARTS.every(p=>chapter2PartDone(state,p.part));}
 function chapter2NextPart(state){return CHAPTER2_PARTS.find(p=>!chapter2PartDone(state,p.part))?.part||1;}
 function canEnter(state,n){
  if(!Number.isInteger(n)||n<1||n>13)return false;
  if(n===1)return true;
  if(n===2)return partDone(state,1);
  if(n===3)return partDone(state,1)&&partDone(state,2);
  if(n===4)return done(state)&&n<=Math.max(1,Number(state.unlocked)||1);
  if(n===5)return done(state)&&chapter2PartDone(state,1)&&n<=Math.max(1,Number(state.unlocked)||1);
  return done(state)&&chapter2Done(state)&&n<=Math.max(1,Number(state.unlocked)||1);
 }
 function chapterOf(scene){return scene<=3?1:scene<=5?2:scene-3;}
 function chaptersDone(state){
  return Number(done(state))+Number(chapter2Done(state))+CARDS.slice(2).filter(n=>completed(state,n)).length;
 }
 function chapterReached(state){
  if(!done(state))return 1;
  if(!chapter2Done(state))return 2;
  return Math.max(2,chapterOf(Math.min(13,Math.max(6,Number(state.unlocked)||6))));
 }
 function scenePassedCount(state){return PARTS.filter(p=>partDone(state,p.scene)).length;}
 function preparePart(state,n,makeId){
  // Une seule question au début du chapitre : les jeux 2 et 3 reprennent
  // sa réussite sans réclamer une autre réponse ni donner 100 points.
  if((n!==2&&n!==3)||!canEnter(state,n)||partDone(state,n))return false;
  let changed=false;
  if(!completed(state,n)){state.completed.push(n);changed=true;}
  if(state.unlocked<n+1){state.unlocked=n+1;changed=true;}
  const newId=()=>typeof makeId==='function'?makeId():String(n)+'-legacy';
  if(n===2&&!state.arcadeBonuses?.['2']){
   if(!state.arcadePending){state.arcadePending={id:newId(),level:2,correct:true};changed=true;}
   else if(!state.arcadePending.correct){state.arcadePending.correct=true;changed=true;}
  }
  if(n===3&&!state.catalogneFinished){
   if((state.catalogneSold||[]).length===5&&!state.catalognePending){
    state.catalogneFinished=true;changed=true;
   }else if(!state.catalognePending){
    state.catalognePending={id:newId(),level:3,correct:true};changed=true;
   }else if(!state.catalognePending.correct){
    state.catalognePending.correct=true;changed=true;
   }
  }
  return changed;
 }
 function prepareChapter2Dance(state,makeId){
  // Le quiz du chapitre 2 se fait à Sarajevo, pas entre Sarajevo et la danse.
  // Les points d'une ancienne sauvegarde ne sont jamais retouchés ici.
  if(!canEnter(state,5)||chapter2PartDone(state,2))return false;
  state.quizPassed??={};
  let changed=false;
  if(!state.quizPassed[5]){state.quizPassed[5]=true;changed=true;}
  if(state.dansePending&&!state.dansePending.correct){
   state.dansePending.correct=true;changed=true;
  }
  return changed;
 }
 function reconcile(state){
  if(!state||!Array.isArray(state.completed))return false;
  let desired=state.selected;
  if(!canEnter(state,desired)){
   desired=!done(state)?nextPart(state):!chapter2Done(state)?(chapter2PartDone(state,1)?5:4):1;
   if(!canEnter(state,desired))desired=1;
  }
  if(state.selected===desired)return false;
  state.selected=desired;
  return true;
 }
 root.TreizeChapitre1={PARTS,CHAPTER2_PARTS,CARDS,legacy,partDone,done,nextPart,chapter2Legacy,
  chapter2PartDone,chapter2Progress,chapter2Done,chapter2NextPart,canEnter,chapterOf,
  chaptersDone,chapterReached,scenePassedCount,preparePart,prepareChapter2Dance,reconcile};
})(typeof window==='undefined'?globalThis:window);
