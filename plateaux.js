/* Several scenes may belong to one numbered level. Only the last scene grants its treasure. */
(function(){
 const flow=TreizePlateaux,score=DanseScore,$=id=>document.getElementById(id),oldRender=render,oldAnswer=answer;
 const css=document.createElement('style');css.textContent='#yoyoDialog{padding:0;width:min(1100px,98vw);height:96dvh;max-width:98vw;max-height:96dvh;border:1px solid #a3977a;border-radius:12px;background:#172024;color:#ede6d6;overflow:hidden}#yoyoDialog[open]{display:flex;flex-direction:column}#yoyoDialog::backdrop{background:#142323ed}#yoyoDialog .arcade-dialog-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 14px;font-size:12px;border-bottom:1px solid #61716a}#yoyoClose{min-height:42px;padding:9px;color:#eee6d3;background:#2c3a3c;border:1px solid #8c8e78;border-radius:5px}#yoyoFrame{flex:1;min-height:0;border:0;width:100%}.plateaux-route{display:flex;gap:8px;margin:12px 0;font-size:12px}.plateaux-route span{border:1px solid #a69874;padding:7px;border-radius:5px}.plateaux-route .active{background:#294f3e;color:#fff4db}@media(max-width:650px){#yoyoDialog{width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;border:0;border-radius:0}#yoyoDialog .arcade-dialog-bar{font-size:10px;padding:5px 8px}}';document.head.append(css);
 function makeDialog(name,title,url){const d=document.createElement('dialog');d.id=name+'Dialog';d.setAttribute('aria-label',title);d.innerHTML='<div class="arcade-dialog-bar"><strong>'+title+'</strong><button type="button" id="'+name+'Close">Retour au plateau ×</button></div><iframe id="'+name+'Frame" title="'+title+'" allow="autoplay; fullscreen" allowfullscreen></iframe>';document.body.append(d);return{dialog:d,frame:$(name+'Frame'),url,loaded:false};}
 const dance=makeDialog('danse','Chapitre 3 — « Le coup du bus » · Le danseur','jeu-danse.html?embedded=1&v=20261114-ovation'),yoyo=makeDialog('yoyo','Chemin III · Chapitre 4 — « Le drapeau rouge » · La prison','jeu-yoyo.html?embedded=1&v=20261112-drapeaux-v1');
 let danceWonSession=null,travelTimer=0,prisonExitTimer=0,yoyoWon=false,requestedPart=0;
 function progress(){flow.migrate(state);return flow.progress(state,5);}
 function refresh(){try{const latest=JSON.parse(localStorage.getItem(KEY)||'null');if(latest&&Array.isArray(latest.completed))state={...state,...latest};}catch{}flow.migrate(state);}
 function context(which){const p=which===dance?state.dansePending:state.yoyoPending;if(p&&which.dialog.open)which.frame.contentWindow?.postMessage({type:(which===dance?'danse':'yoyo')+':init',...p,passed:score.valid(state),score:state.points},location.origin);}
 function open(which){if(!which.dialog.open)which.dialog.showModal();if(!which.loaded){which.loaded=true;which.frame.src=which.url;}else context(which);}
 function dismiss(which){if(which.dialog.open)which.dialog.close();which.frame.removeAttribute('src');which.loaded=false;}
 function focusEntry(){render();focusGameEntry();$('gameLaunchSlot').querySelector('button')?.focus({preventScroll:true});}
 function launchDance(){clearTimeout(travelTimer);danceWonSession=null;refresh();if(!state.dansePending)score.begin(state,!!state.quizPassed?.[5],crypto.randomUUID());save();open(dance);}
 function launchYoyo(){refresh();if(!progress().finished.includes(1))return;flow.beginYoyo(state,crypto.randomUUID());save();yoyoWon=false;open(yoyo);}
 function readStrasbourg(){TreizeEscale.openReader(5,{plateau:2,autoAdvanceOnEnd:true,
  onChallenge:()=>{const p=progress();if(!p.read.includes(2))p.read.push(2);save();render();launchYoyo();},
  onSkip:()=>window.TreizeLibreParcours?.next('5:prison'),
  onDismiss:()=>focusEntry()});}
 function travel(){
  clearTimeout(travelTimer);
  if(boardRolling||state.selected!==5||!progress().finished.includes(1))return;
  dismiss(dance);requestedPart=0;render();
  window.TreizeRendezVous?.openManifestation?.();
 }
 function closeDance(){
  clearTimeout(travelTimer);dismiss(dance);
  if(progress().finished.includes(1)&&!state.rdvManifestationFinished&&!state.rdvManifestationSkipped)travel();
  else focusEntry();
 }
 function closeYoyo(){clearTimeout(prisonExitTimer);prisonExitTimer=0;dismiss(yoyo);focusEntry();if(yoyoWon&&state.completed.includes(5))rollTravel(5);}
 $('danseClose').onclick=closeDance;$('yoyoClose').onclick=closeYoyo;
 for(const [which,close] of [[dance,closeDance],[yoyo,closeYoyo]]){which.dialog.addEventListener('cancel',e=>{e.preventDefault();close();});which.frame.addEventListener('load',()=>context(which));}
 answer=function(index){if(state.selected!==5)return oldAnswer(index);refresh();if(state.dansePending){open(dance);return;}if(progress().finished.includes(1)||state.quizPassed?.[5])return;const correct=index===LEVELS[4].correct;if(correct){state.quizPassed??={};state.quizPassed[5]=true;state.points+=100;}else{state.tries[5]=(state.tries[5]||0)+1;state.points=Math.max(0,state.points-10);}score.begin(state,correct,crypto.randomUUID());save();render();focusGameEntry();};
 render=function(){
  if(state.selected!==5)requestedPart=0;
  progress();
  for(const id of ['danseLaunch','yoyoLaunch','manifestationLaunch','danceReplay','plateauxRoute'])$(id)?.remove();
  $('options').hidden=false;$('question').hidden=false;$('read-stage-link').onclick=null;
  oldRender();if(state.selected!==5)return;
  const p=progress(),danceDone=p.finished.includes(1),prisonView=requestedPart===3;
  const manifestView=danceDone&&!prisonView&&requestedPart!==2;
  const done=window.TreizeChapitre1?.chapter2Done(state)||false;
  const hasGame=prisonView||manifestView||!!state.dansePending||!!state.quizPassed?.[5];
  const route=document.createElement('div');route.id='plateauxRoute';route.className='plateaux-route';
  route.innerHTML='<span class="'+(!danceDone?'active':'')+'">'+(danceDone?'✓ ':'')+'Chapitre 3 · Le danseur</span>'+
   '<span class="'+(manifestView||prisonView?'active':'')+'">'+(state.rdvManifestationFinished?'✓ ':'')+'Chapitre 4 · Camarades !</span>';
  $('place').after(route);
  $('levelTag').textContent=prisonView?'Chemin III · Chapitre 4 · Jeu 1 / 3':
   manifestView?'Chemin II · Chapitre 4 · Jeu 3 / 3':'Chemin II · Chapitre 3 · Jeu 2 / 3';
  if(prisonView){
   $('questTitle').textContent='Un fil entre les barreaux';
   $('place').textContent='📍 Strasbourg · La cellule des arrivants';
   $('status').textContent=state.yoyoFinished?'✓ La cellule a déjà été parcourue. Rejouable.':'Le deuxième « Drapeau rouge » : les épreuves de la cellule à Strasbourg.';
   $('options').hidden=true;$('question').hidden=true;
   $('read-stage-link').href='lecture.html?niveau=5&plateau=2';
   $('read-stage-link').onclick=e=>{e.preventDefault();readStrasbourg();};
   $('map-stage-link').href='carte.html?niveau=5&plateau=2';
   $('travelHint').textContent='Chemin III · La prison. Le jeu reste accessible pour être rejoué.';
  }else if(manifestView){
   $('questTitle').textContent='Camarades !';
   $('place').textContent='📍 Paris · République–Bastille';
   $('status').textContent=done?'✓ Camarades ! parcouru. Tu peux poursuivre ou rejouer.':'Le premier « Drapeau rouge » : lis la manifestation puis joue à Camarades !';
   $('options').hidden=true;$('question').hidden=true;
   $('read-stage-link').onclick=e=>{e.preventDefault();window.TreizeRendezVous?.openManifestation?.();};
   $('travelHint').textContent='Chemin II · Camarades ! précède le jeu de la prison dans le chemin suivant.';
  }else{
   $('status').textContent=state.dansePending?'Achève le jeu de danse pour poursuivre vers Camarades !':'Retrouve Lionel dans le chapitre 3 « Le coup du bus ».';
   if(state.dansePending)document.querySelectorAll('[data-answer]').forEach(b=>b.disabled=true);
  }
  if(hasGame){
   const button=document.createElement('button');
   button.id=prisonView?'yoyoLaunch':manifestView?'manifestationLaunch':'danseLaunch';
   button.className='action';button.style.cssText='display:block;width:100%;text-align:center';
   button.textContent=prisonView?'Entrer dans la cellule ↻':manifestView?'Lire et jouer à Camarades ! →':'Jouer à la danse →';
   button.onclick=prisonView?(p.read.includes(2)?launchYoyo:readStrasbourg):
    manifestView?()=>window.TreizeRendezVous?.openManifestation?.():launchDance;
   $('gameLaunchSlot').append(button);
   const name=prisonView?'Un fil entre les barreaux':manifestView?'Camarades !':'Danse pour sauver Lionel !';
   $('gameEntry').hidden=false;$('gameEntryName').textContent=name;
   $('gameEntryHint').textContent=prisonView?'Retrouve les trois épreuves de la cellule.':
    manifestView?'Lis la manifestation, puis rejoins les cortèges.':
    'Chapitre 3 « Le coup du bus » : conquiers le public pour continuer le récit.';
   $('mobileGameDock').hidden=false;$('mobileGameButton').hidden=false;
   $('mobileGameAction').textContent=button.textContent;$('mobileGameName').textContent=name;
   document.body.classList.add('has-mini-game');
   if(prisonView){
    const replay=document.createElement('button');replay.id='danceReplay';replay.className='action ghost';
    replay.textContent='Rejouer le plateau de danse';replay.onclick=launchDance;$('gameLaunchSlot').append(replay);
   }
  }
  $('next').hidden=!done;$('mobileNext').hidden=!done;
 };
 addEventListener('message',e=>{if(e.origin!==location.origin||!e.data)return;const m=e.data;
  if(e.source===dance.frame.contentWindow&&dance.dialog.open){if(m.type==='danse:ready'){context(dance);return;}if(m.type==='danse:close'){closeDance();return;}refresh();if(m.type==='danse:pass'){const r=score.record(state,m.id,m.gap);if(r){save();render();dance.frame.contentWindow.postMessage({type:'danse:credited',id:m.id,...r},location.origin);}}
   if(m.type==='danse:won'){const r=score.finish(state,m.id);if(r){flow.done(state,5,1);save();render();dance.frame.contentWindow.postMessage({type:'danse:finished',id:m.id,...r,retryQuestion:false},location.origin);danceWonSession=m.id;}}
   if(m.type==='danse:ovation-ended'&&m.id===danceWonSession){danceWonSession=null;if(!progress().read.includes(2))travelTimer=setTimeout(travel,3000);}
   if(m.type==='danse:replay'&&!state.dansePending&&score.valid(state).length===5){clearTimeout(travelTimer);danceWonSession=null;score.begin(state,!!state.quizPassed?.[5],crypto.randomUUID());save();context(dance);}}
  if(e.source===yoyo.frame.contentWindow&&yoyo.dialog.open){if(m.type==='yoyo:ready'){context(yoyo);return;}if(m.type==='yoyo:close'){closeYoyo();return;}refresh();if(m.type==='yoyo:won'&&m.points===30){const r=flow.finishYoyo(state,m.id);if(r){
   yoyoWon=true;save();render();yoyo.frame.contentWindow.postMessage({type:'yoyo:finished',id:m.id,...r},location.origin);
   clearTimeout(prisonExitTimer);
   prisonExitTimer=setTimeout(()=>{if(yoyoWon&&state.completed.includes(5)&&yoyo.dialog.open)closeYoyo();},2000);
  }}if(m.type==='yoyo:replay'&&state.yoyoFinished&&!state.yoyoPending){flow.beginYoyo(state,crypto.randomUUID());yoyoWon=false;save();context(yoyo);}}
 });
 // Navigation sous les deux derniers mini-jeux du chemin II.
 // "Retour" stops automatic chaining, "Suivant" preserves wins or skips.
 window.TreizePlateauxNavigation={
  resetPart(){requestedPart=0;},
  currentPart(){return requestedPart===3?'prison':requestedPart===2?'dance':null;},
  openPart(which){
   const ch=window.TreizeChapitre1;
   if(boardRolling||!ch?.canEnter(state,5)||(which!=='dance'&&which!=='prison'))return false;
   if(which==='prison'&&!ch.chapter2Done(state))return false;
   window.TreizeSceneNavigation?.cancelAutomatic?.();
   requestedPart=which==='dance'?2:3;
   select(5);
   if(which==='prison'){readStrasbourg();return true;}
   if(!window.TreizeEscale){launchDance();return true;}
   TreizeEscale.openReader(5,{plateau:1,autoAdvanceOnEnd:true,
    onChallenge:()=>launchDance(),
    onSkip:()=>window.TreizeLibreParcours?.next('5:dance'),
    onDismiss:()=>focusEntry()});
   return true;
  },
  back(which){
   clearTimeout(travelTimer);clearTimeout(prisonExitTimer);
   if(which==='dance')dismiss(dance);
   else if(which==='prison')dismiss(yoyo);
   focusEntry();
  },
  next(which){
   if(which==='dance'){
    clearTimeout(travelTimer);
    if(progress().finished.includes(1))travel();
    return;
   }
   if(which==='prison'){
    clearTimeout(prisonExitTimer);
    dismiss(yoyo);
    render();
    if(window.TreizeChapitre1?.chapter2Done(state))rollTravel(5);
   }
  },
  isOpen(which){return which==='dance'?dance.dialog.open:which==='prison'?yoyo.dialog.open:false;}
 };
 flow.migrate(state);save();render();
})();
