/* Deux étapes de jeu : chapitre 1, puis chapitres littéraires 2, 3 et 4.
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
  Object.freeze({part:1,scene:4,plateau:1,chapter:2,chapterTitle:'Même pas mal',title:'Sarajevo',game:'jeu-bosnie.html'}),
  Object.freeze({part:2,scene:5,plateau:1,chapter:3,chapterTitle:'Le coup du bus',title:'Le danseur',game:'jeu-danse.html'}),
  Object.freeze({part:3,scene:5,plateau:2,chapter:4,chapterTitle:'Le drapeau rouge',title:'Camarades !',game:'jeu-manifestation.html'})
 ]);
 // Les noms CHAPTER2_PARTS/chapter2* restent compatibles avec les intégrations.
 // Ils désignent la deuxième étape de jeu, qui regroupe les chapitres 2 à 4.
 // Les autres étapes historiques restent dans les données, pour la reconstruction.
 // Le plateau ne matérialise aujourd'hui que ses deux premières étapes.
 const ARCHIVED_CARDS=Object.freeze([1,4,6,7,8,9,10,11,12,13]);
 const CARDS=Object.freeze([1,4]);
 const completed=(state,n)=>Array.isArray(state?.completed)&&state.completed.includes(n);
 const SKIP_KEYS=Object.freeze(['1','2','3','4','5:dance','5:prison']);
 function wasSkipped(state,key){
  return Array.isArray(state?.storySkips)&&state.storySkips.includes(String(key));
 }
 function chapterHasSkips(state,chapter){
  const keys=chapter===1?SKIP_KEYS.slice(0,3):chapter===2?SKIP_KEYS.slice(3):[];
  return keys.some(key=>wasSkipped(state,key));
 }
 // Compatibilité : les joueurs qui ont déjà terminé une scène ultérieure
 // gardent l'accès à leurs chapitres et peuvent revisiter les trois jeux.
 function legacy(state){return Array.isArray(state?.completed)&&state.completed.some(n=>n>=4);}
 function partDone(state,n){
  if(!Number.isInteger(n)||n<1||n>3)return false;
  if(wasSkipped(state,n))return true;
  if(legacy(state))return true;
  if(!completed(state,n))return false;
  if(n===1)return Boolean(state.arcadeBonuses?.['1']);
  if(n===2)return Boolean(state.arcadeBonuses?.['2']);
  return Boolean(state.catalogneFinished||(state.catalogneSold?.length===5&&!state.catalognePending));
 }
 function done(state){return PARTS.every(p=>partDone(state,p.scene));}
 function nextPart(state){return PARTS.find(p=>!partDone(state,p.scene))?.scene||1;}
 // Un choix explicite dans le plateau prime toujours sur la reprise automatique.
 function chapter1SceneForSelection(state,part){
  if(part===undefined||part===null)return done(state)?1:nextPart(state);
  if(!Number.isInteger(part)||part<1||part>3||!canEnter(state,part))return null;
  return part;
 }
 function chapter2Legacy(state){
  // Les joueurs déjà arrivés après le jeu du yo-yo restent avancés.
  return Array.isArray(state?.completed)&&state.completed.some(n=>n>=6);
 }
 function chapter2Progress(state){return state?.levelPlates?.[5]||{finished:[]};}
 function chapter2PartDone(state,n){
  if(!Number.isInteger(n)||n<1||n>3)return false;
  const skipKey=n===1?'4':n===2?'5:dance':'5:prison';
  if(wasSkipped(state,skipKey))return true;
  if(chapter2Legacy(state))return true;
  const p=chapter2Progress(state),pastDance=Boolean(
   state?.danseFinished||state?.dansePending||
   state?.quizPassed?.[5]||p.finished?.includes(1));
  if(n===1)return Boolean(
   (completed(state,4)&&state?.bosnieFinished)||pastDance||state?.yoyoFinished);
  if(n===2)return Boolean(
   state?.danseFinished||p.finished?.includes(1)||state?.yoyoFinished);
  // Le premier « Drapeau rouge » se termine avec Camarades !.
  // Les anciennes sauvegardes de la prison restent valides pour ne verrouiller personne.
  return Boolean(state?.rdvManifestationFinished||state?.rdvManifestationSkipped||
   state?.yoyoFinished&&(completed(state,5)||p.finished?.includes(2))||p.finished?.includes(2));
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
  return Number(done(state))+Number(chapter2Done(state))+ARCHIVED_CARDS.slice(2).filter(n=>completed(state,n)).length;
 }
 function chapterReached(state){
  if(!done(state))return 1;
  if(!chapter2Done(state))return 2;
  return Math.max(2,chapterOf(Math.min(13,Math.max(6,Number(state.unlocked)||6))));
 }
 function scenePassedCount(state){return PARTS.filter(p=>partDone(state,p.scene)).length;}
 function skipPart(state,key){
  // Story traversal and game victory are separate, so skips earn no points.
  const k=String(key),scene=Number(k.split(':')[0]);
  if(!SKIP_KEYS.includes(k)||!state||!Array.isArray(state.completed))return false;
  if(!canEnter(state,scene))return false;
  if(k==='5:prison'&&!chapter2PartDone(state,2))return false;
  if(k==='5:dance'&&chapter2PartDone(state,2))return false;
  const passed=k==='5:dance'?chapter2PartDone(state,2):
   k==='5:prison'?chapter2PartDone(state,3):
   scene<=3?partDone(state,scene):chapter2PartDone(state,1);
  if(passed)return false; // No skipped mark over an already earned win.
  state.storySkips??=[];
  if(state.storySkips.includes(k))return false;
  state.storySkips.push(k);
  const pending={1:'marmousetsPending',2:'arcadePending',3:'catalognePending',
   4:'bosniePending','5:dance':'dansePending','5:prison':'yoyoPending'}[k];
  if(pending)state[pending]=null;
  if(k==='5:dance'){
   state.levelPlates??={};
   const p=state.levelPlates[5]??={index:1,finished:[],read:[]};
   p.finished??=[];if(!p.finished.includes(1))p.finished.push(1);
   p.index=Math.max(2,p.index||1);
  }
  if(k==='5:prison'){
   state.levelPlates??={};
   const p=state.levelPlates[5]??={index:2,finished:[1],read:[]};
   p.finished??=[];
   for(const n of [1,2])if(!p.finished.includes(n))p.finished.push(n);
   p.index=Math.max(3,p.index||1);
  }
  const next=scene===5&&k==='5:prison'?6:scene===5?5:scene+1;
  state.unlocked=Math.min(13,Math.max(Number(state.unlocked)||1,next));
  return true;
 }
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
  // Le quiz commun de l'étape 2 se fait à Sarajevo, pas avant chaque chapitre.
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
 root.TreizeChapitre1={PARTS,CHAPTER2_PARTS,CARDS,ARCHIVED_CARDS,legacy,partDone,done,nextPart,chapter2Legacy,
  chapter1SceneForSelection,chapter2PartDone,chapter2Progress,chapter2Done,chapter2NextPart,canEnter,chapterOf,
  chaptersDone,chapterReached,scenePassedCount,preparePart,prepareChapter2Dance,
  SKIP_KEYS,wasSkipped,chapterHasSkips,skipPart,reconcile};
})(typeof window==='undefined'?globalThis:window);
