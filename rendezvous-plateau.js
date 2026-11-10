/* Chemin III — mêmes principes que les autres jeux :
 * bonne feuille plein écran, jeu en iframe, messages de session,
 * 3 × 10 points une seule fois, retour/suivant, sauvegarde partagée.
 */
(function(){
 'use strict';
 const app=window.TreizeRendezVous,flow=window.TreizeChapitre1,$=id=>document.getElementById(id);
 if(!app||!flow||!$('rendezvousDialog'))return;
 const reader=$('rendezvousDialog'),title=reader.querySelector('h2'),excerpt=reader.querySelector('.rendezvous-excerpt');
 const kicker=reader.querySelector('.rendezvous-kicker'),info=reader.querySelector('.rendezvous-future');
 const readerArea=reader.querySelector('.rendezvous-area'),readerReference=reader.querySelector('.rendezvous-reference');
 const infoHeading=info.querySelector('strong'),infoBody=info.querySelector('p');
 const parts=app.parts;
 let activePart=1,autoTimer=0,autoLaunched=false,loading=false;
 const dialog=document.createElement('dialog');dialog.id='manifestationDialog';
 dialog.setAttribute('aria-label','Chemin III — Chapitre 4 — Camarades !');
 dialog.innerHTML='<div class="arcade-dialog-bar"><strong>CHEMIN III · CHAPITRE 4 · CAMARADES !</strong><button type="button" id="manifestationClose">Retour au plateau ×</button></div><iframe id="manifestationFrame" title="Camarades ! — Manifestation République Bastille" allow="autoplay; fullscreen" allowfullscreen></iframe><div class="arcade-under-actions" role="group" aria-label="Navigation de Camarades !"><button class="arcade-return" id="manifestationBack">← Retour au plateau</button><button class="arcade-following" id="manifestationNext">Suivant →</button></div>';
 document.body.append(dialog);
 const frame=$('manifestationFrame');
 const style=document.createElement('style');
 style.textContent='#manifestationDialog{padding:0;width:min(1220px,98vw);height:98dvh;max-width:98vw;max-height:98dvh;border:2px solid #b68e54;border-radius:10px;background:#172b29;color:#faeed7;overflow:hidden}#manifestationDialog[open]{display:flex;flex-direction:column}#manifestationDialog::backdrop{background:#0c201de0}#manifestationDialog .arcade-dialog-bar{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:9px 15px;font-size:12px;border-bottom:1px solid #b6a27e}#manifestationDialog .arcade-dialog-bar button{background:#2d5044;border:1px solid #c4a979;border-radius:5px;color:#fff2d4;padding:9px 13px;min-height:42px}#manifestationFrame{width:100%;min-height:0;flex:1;border:0;background:#14251f}#manifestationDialog .arcade-under-actions{display:flex;gap:9px;padding:8px 12px;background:#19362d;border-top:1px solid #b6a27e}#manifestationDialog .arcade-under-actions button{flex:1;min-width:0;min-height:46px;padding:9px;border:1px solid #bda67c;border-radius:6px;font-weight:700;cursor:pointer}.arcade-under-actions #manifestationBack{background:#3b574e;color:#fff5de}.arcade-under-actions #manifestationNext{background:#f0d4a1;color:#294435}#rendezvousDialog #rendezvousPlay{display:block;margin:14px 0 0;width:100%;min-height:52px;border:0;border-radius:7px;background:#2a5545;color:#fff6d9;font-weight:750;cursor:pointer;font-size:16px}#rendezvousDialog .rendezvous-part-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:18px 0}#rendezvousDialog .rendezvous-part-nav button{padding:10px 8px;background:#f4e6c7;border:1px solid #baa071;border-radius:6px;color:#385347;min-height:46px;font-weight:700;font-size:12px}#rendezvousDialog .rendezvous-part-nav button[aria-current=step]{background:#335746;color:#fff3d8}#rendezvousDialog .rendezvous-part-nav button:disabled{opacity:.55}#rendezvousDialog [hidden]{display:none!important}@media(max-width:650px){#manifestationDialog{max-width:100vw;width:100vw;height:100dvh;max-height:100dvh;border:0;border-radius:0}#manifestationDialog .arcade-dialog-bar{padding:6px 8px;font-size:10px}#manifestationDialog .arcade-dialog-bar button{font-size:10px;padding:7px 8px}#manifestationDialog .arcade-under-actions{padding:6px 8px}#rendezvousDialog .rendezvous-part-nav button{font-size:10px;padding:8px 4px}}';
 document.head.append(style);
 const partNav=document.createElement('nav');partNav.className='rendezvous-part-nav';partNav.setAttribute('aria-label','Les trois jeux du chemin III');
 for(let i=0;i<3;i++){
  const b=document.createElement('button');b.type='button';b.dataset.part=String(i+1);b.textContent='Chapitre '+parts[i].chapter+' · Jeu '+(i+1)+'/3';
  b.onclick=()=>showPart(i+1);partNav.append(b);
 }
 info.after(partNav); // Comme les autres bonnes feuilles : le texte d'abord, les choix ensuite.
 const launch=document.createElement('button');launch.type='button';launch.id='rendezvousPlay';launch.textContent='🎮 Jouer à Camarades ! — 30 points';
 info.append(launch);launch.onclick=beginGame;
 const awarded=()=>Array.isArray(state.rdvManifestationPassed)?state.rdvManifestationPassed.filter(n=>[1,2,3].includes(n)):[];
 const hasTraversed=()=>state.rdvManifestationFinished||state.rdvManifestationSkipped;
 function updateThird(){
  const card=$('chemin-iii');if(!card)return;
  const count=awarded().length,allowed=flow.chapter2Done(state);
  const partsCards=card.querySelectorAll('.chapter-literary-part');
  if(partsCards[0]){
   partsCards[0].querySelector('.chapter-part-game').textContent='Camarades ! · '+count*10+'/30 points';
   partsCards[0].querySelector('.chapter-part-state').textContent=state.rdvManifestationFinished?'✓ Jeu réussi':state.rdvManifestationSkipped?'↷ Parcouru, sans victoire':'Jeu jouable · République–Bastille';
   partsCards[0].classList.toggle('passed',!!hasTraversed());
  }
  card.querySelector('.chapter-card-status').textContent=allowed?
   (state.rdvManifestationFinished?'1 / 3 jeux réussis · suite à préparer':state.rdvManifestationSkipped?'1 / 3 jeux parcourus · suite à préparer':'0 / 3 jeux terminés · première bonne feuille disponible'):
   'À découvrir après le chemin II';
  card.querySelector('.chapter-card-place').textContent='Chapitres 4, 5 et 6 · Trois jeux';
  card.setAttribute('aria-label','Chemin III Les rendez-vous · '+count*10+' points acquis sur 30 dans Camarades !');
  $('manifestationNext').textContent=state.rdvManifestationFinished?'Suivant · Chapitre 5 →':'Suivant · Passer sans points →';
  launch.textContent=state.rdvManifestationFinished?'↻ Rejouer Camarades !':'🎮 Jouer à Camarades ! — 30 points';
 }
 function showPart(n){
  activePart=n;clearTimeout(autoTimer);autoLaunched=false;
  for(const b of partNav.children){const active=Number(b.dataset.part)===n;b.setAttribute('aria-current',active?'step':'false');}
  if(n===1){
   kicker.textContent='Vous êtes arrivé à';
   title.textContent='République–Bastille';
   readerArea.textContent='Paris · avril 2002';readerArea.hidden=false;
   readerReference.textContent='Extrait du chapitre 4 — « Drapeau rouge », p. 59–60.';readerReference.hidden=false;
   excerpt.hidden=false;
   infoHeading.textContent='Jeu 1 / 3 · Camarades !';
   infoBody.textContent='Le drapeau dans une rue adjacente, puis la statue. Trois objets à récupérer (cœur, fleur, bisou) avant les attaques. Sélectionne chaque CRS, lance, puis réunis les deux cortèges. 10 points par étape.';
   launch.hidden=false;
  }else{
   kicker.textContent='Chemin III · Les rendez-vous';
   title.textContent='Chapitre '+parts[n-1].chapter+' — « '+parts[n-1].title+' »';
   readerArea.hidden=true;readerReference.hidden=true;
   excerpt.hidden=true;
   infoHeading.textContent='Jeu '+n+' / 3 · À concevoir';
   infoBody.textContent='Le passage de ce chapitre sera choisi et validé avant la création du jeu. Aucun récit ni point n’est inventé.';
   launch.hidden=true;
  }
  reader.scrollTop=0;updateThird();
 }
 const oldOpen=app.open;
 app.open=function(){if(!flow.chapter2Done(state))return;oldOpen();showPart(1);};
 // Le code du plateau appelle désormais window.TreizeRendezVous.open() à chaque ouverture.
 function openDialog(){
  if(!flow.chapter2Done(state))return;
  clearTimeout(autoTimer);autoLaunched=true;
  if(!state.rdvManifestationPending||!state.rdvManifestationPending.id){
   state.rdvManifestationPending={id:crypto.randomUUID(),chapter:4};
   save();
  }
  if(reader.open)reader.close();
  if(!dialog.open)dialog.showModal();
  if(!loading){loading=true;frame.src='jeu-manifestation.html?embedded=1&v=20261110-guide-crs-selection-v21';}else initIframe();
 }
 function beginGame(){openDialog();}
 function initIframe(){
  if(!dialog.open||!frame.contentWindow)return;
  const id=state.rdvManifestationPending?.id;if(!id)return;
  frame.contentWindow.postMessage({type:'manifestation:init',id,passed:awarded(),points:state.points},location.origin);
 }
 frame.addEventListener('load',initIframe);
 function closeGame(){if(dialog.open)dialog.close();frame.removeAttribute('src');loading=false;state.rdvManifestationPending=null;save();render();$('chemin-iii')?.focus({preventScroll:true});}
 function nextGame(){
  if(!state.rdvManifestationFinished&&!state.rdvManifestationSkipped){state.rdvManifestationSkipped=true;save();}
  closeGame();
  // The next chapter has no authorised scene yet. Show its placeholder inside
  // this same three-part path, never navigate into an unrelated historic level.
  app.open();showPart(2);
 }
 $('manifestationClose').onclick=closeGame;
 $('manifestationBack').onclick=closeGame;
 $('manifestationNext').onclick=nextGame;
 dialog.addEventListener('cancel',e=>{e.preventDefault();closeGame();});
 function authenticated(e){
  return e.origin===location.origin&&e.source===frame.contentWindow&&dialog.open&&e.data&&e.data.id===state.rdvManifestationPending?.id;
 }
 addEventListener('message',e=>{
  if(!authenticated(e))return;
  const m=e.data;
  if(m.type==='manifestation:ready'){initIframe();return;}
  if(m.type==='manifestation:close'){closeGame();return;}
  if(m.type==='manifestation:next'){nextGame();return;}
  if(m.type==='manifestation:progress'){
   const step=Number(m.step),passed=awarded();
   if(!Number.isInteger(step)||step<1||step>3)return;
   if(!passed.includes(step)){
    if(step!==passed.length+1)return; // Authenticated sequential gameplay only.
    state.rdvManifestationPassed=[...passed,step];state.points+=10;
    save();render();
   }
   frame.contentWindow?.postMessage({type:'manifestation:credited',id:m.id,passed:awarded(),points:state.points},location.origin);
  }
  if(m.type==='manifestation:won'){
   if(awarded().length!==3)return;
   state.rdvManifestationFinished=true;state.rdvManifestationSkipped=false;save();render();
  }
 });
 // Même règle que les lecteurs des autres jeux : la dernière phrase doit être
 // entièrement visible, puis un court délai lance le défi. Pas besoin de
 // parcourir les menus situés APRES l'extrait pour activer le jeu.
 function reachedReadingEnd(){
  if(reader.scrollTop<32||!reader.open||excerpt.hidden)return false;
  return excerpt.getBoundingClientRect().bottom<=reader.getBoundingClientRect().bottom-18;
 }
 reader.addEventListener('scroll',()=>{
  if(activePart!==1||autoLaunched||!reader.open)return;
  if(!reachedReadingEnd()){clearTimeout(autoTimer);autoTimer=0;return;}
  if(autoTimer)return;
  autoTimer=setTimeout(()=>{
   autoTimer=0;
   if(reader.open&&activePart===1&&!autoLaunched&&reachedReadingEnd())openDialog();
  },1150);
 },{passive:true});
 const oldRender=render;
 render=function(){oldRender();updateThird();};
 addEventListener('focus',updateThird);
 updateThird();
})();
