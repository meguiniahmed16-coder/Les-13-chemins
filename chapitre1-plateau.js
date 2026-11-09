/* Deux blocs de jeu : chapitre 1, puis trois extraits des chapitres 2, 3 et 4. */
(function(){
 'use strict';
 const flow=window.TreizeChapitre1;
 if(!flow||!document.getElementById('boardTargets'))return;
 const $=id=>document.getElementById(id);
 const css=document.createElement('style');
 css.id='chapitre1-board-styles';
 css.textContent="#board{aspect-ratio:auto!important;min-height:0!important;overflow:visible!important;background:linear-gradient(145deg,#f1e2c5,#e6d2ae);padding:13px!important;touch-action:pan-y}\n#board picture{display:none!important}\n#boardTargets{position:relative!important;inset:auto!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}\n#boardTargets .board-target{position:relative!important;inset:auto!important;left:auto!important;top:auto!important;width:100%!important;height:auto!important;min-height:130px;display:flex;flex-direction:column;align-items:flex-start;gap:7px;padding:14px 12px 39px;border-radius:10px;text-align:left;background:linear-gradient(155deg,#fff6df,#edddbc);border:2px solid #c5a679;box-shadow:0 3px 0 #ad8a5c33;color:#4f3c2a;overflow:hidden}\n#boardTargets .board-target:before{content:'';position:absolute;right:-26px;top:-32px;width:95px;height:95px;border:1px solid #ddc29b;border-radius:50%;pointer-events:none}\n#boardTargets .board-target[aria-disabled=true]{opacity:.6;filter:saturate(.6);cursor:not-allowed}\n#boardTargets .board-target[aria-pressed=true]{border-color:#31594c;background:linear-gradient(145deg,#fff4dc,#e6edd8);box-shadow:inset 0 0 0 2px #fff9eb}\n#boardTargets .board-target.done{background:linear-gradient(145deg,#e9efdb,#d1ddc5);border-color:#7e9d76}\n#boardTargets .chapter-featured{grid-column:1/-1;min-height:178px!important;background:linear-gradient(110deg,#32564b 0%,#527768 48%,#739377 100%)!important;border:3px solid #bd995e!important;color:#fff5dc!important;padding:20px 22px!important;display:grid!important;grid-template-columns:minmax(0,1fr) 1.35fr;align-content:center;column-gap:22px;row-gap:9px}\n#boardTargets .chapter-featured[aria-disabled=true]{opacity:1;filter:none}\n#boardTargets .chapter-featured[aria-pressed=true]{box-shadow:inset 0 0 0 2px #f9e6c2,0 3px 12px #102b2355}\n#boardTargets .chapter-featured.done{background:linear-gradient(110deg,#2d584a,#466d54,#70855c)!important}\n#boardTargets .chapter-featured:before{right:-22px;top:-42px;width:230px;height:230px;border:2px solid #f7eaca30}\n#boardTargets .chapter-featured .chapter-card-kicker{color:#f0d6a2}\n#boardTargets .chapter-featured .chapter-card-title{color:#fff9e5;font-size:clamp(24px,3vw,37px)}\n#boardTargets .chapter-featured .chapter-card-place{color:#e3e9d3}\n#boardTargets .chapter-card-kicker{font:700 10px/1.2 'DM Sans',sans-serif;letter-spacing:.13em;text-transform:uppercase;color:#8b6740;position:relative}\n#boardTargets .chapter-card-title{font:700 clamp(19px,2.2vw,25px)/1.06 'Cormorant Garamond',Georgia,serif;position:relative;max-width:100%}\n#boardTargets .chapter-card-place{font:11px/1.4 'DM Sans',sans-serif;color:#836a49;position:relative}\n#boardTargets .chapter-card-route{display:flex;gap:8px;align-items:stretch;flex-wrap:wrap;grid-column:2;grid-row:1 / span 3;align-self:center;position:relative}\n#boardTargets .chapter-card-route > .chapter-part-label{flex:1 1 90px;min-width:0;text-align:center;border:1px solid #eed9ae70;padding:12px 6px;border-radius:7px;background:#1d403749;font:700 11px/1.45 'DM Sans',sans-serif;color:#fff8dc}\n#boardTargets .chapter-card-route > .chapter-part-label.passed{background:#e4eed3;color:#28503d}\n#boardTargets .chapter-card-status{font:600 11px/1.3 'DM Sans',sans-serif;margin-top:auto;color:#dceacf;grid-column:1;position:relative}\n#boardTargets .board-badge{position:absolute;right:8px;bottom:8px;top:auto;z-index:1;width:24px;height:24px;font-size:12px}\n#boardTargets .chapter-featured .board-badge{right:12px;bottom:12px;width:31px;height:31px;font-size:17px}\n#chapter1Sequence{display:flex;gap:7px;flex-wrap:wrap;margin:13px 0;padding:11px;border:1px solid #bbad84;border-radius:8px;background:#f5ecd7}\n#chapter1Sequence .chapter1-part{border:1px solid #bba778;border-radius:5px;background:#fff9ea;color:#52613e;padding:8px 10px;min-height:43px;font:600 12px 'DM Sans',sans-serif;flex:1 1 120px;cursor:pointer}\n#chapter1Sequence .chapter1-part.active{background:#315b49;color:#fff9e2;border-color:#315b49}\n#chapter1Sequence .chapter1-part.passed{border-color:#638869}\n#chapter1Sequence .chapter1-part:disabled{opacity:.46;cursor:not-allowed}\n#chapter1Header{font:700 17px/1.25 'Cormorant Garamond',Georgia,serif;color:#6b5637;margin:0 0 7px}\n#chapter1Header[hidden],#chapter1Sequence[hidden]{display:none!important}\n@media(max-width:760px){#boardTargets{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#boardTargets .board-target{min-height:135px;padding:11px 10px 35px}#boardTargets .chapter-featured{grid-column:1/-1;grid-template-columns:1fr;min-height:195px!important;padding:17px!important}#boardTargets .chapter-card-route{grid-column:1;grid-row:auto;gap:5px}#boardTargets .chapter-card-route > .chapter-part-label{flex:1 1 85px;padding:9px 4px;font-size:10px}}\n@media(max-width:390px){#boardTargets .chapter-card-title{font-size:19px}#boardTargets .chapter-card-route{flex-wrap:wrap}}\n/* Passage illustré entre les deux premières vignettes. */\n#boardTargets .chapter-journey-route{grid-column:1/-1;position:relative;padding:14px 15px 11px;border:1px solid #ac8e5f;border-radius:10px;background:linear-gradient(110deg,#fff7e2,#f1e0bc);color:#59462e;overflow:hidden}\n#boardTargets .chapter-journey-title{font:700 12px/1.35 'DM Sans',sans-serif;letter-spacing:.035em;text-align:center;margin:0 0 12px}\n#boardTargets .chapter-route-stops{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;position:relative;padding:0 3px 3px}\n#boardTargets .chapter-route-stops:before{content:'';position:absolute;left:10%;right:10%;top:8px;border-top:3px dotted #a37540;pointer-events:none}\n#boardTargets .chapter-route-stops:after{content:'';position:absolute;top:1px;left:10%;height:17px;width:17px;border-radius:50%;background:#315c48;border:3px solid #faf0d6;box-shadow:0 0 0 2px #b5884e,0 2px 7px #152c2060;z-index:2;pointer-events:none;animation:chapterTravelDot 7s linear infinite}\n#boardTargets .chapter-route-stop{font:600 10px/1.3 'DM Sans',sans-serif;text-align:center;position:relative;z-index:1;overflow-wrap:break-word}\n#boardTargets .chapter-route-stop:before{content:'';display:block;margin:0 auto 8px;width:14px;height:14px;border:2px solid #a37540;border-radius:50%;background:#fff9e8;box-shadow:0 0 0 2px #fff7e5}\n@keyframes chapterTravelDot{0%{left:10%}100%{left:90%}}\n@media(max-width:760px){#boardTargets .chapter-journey-route{padding:11px 7px}#boardTargets .chapter-journey-title{font-size:11px}#boardTargets .chapter-route-stop{font-size:9px}#boardTargets .chapter-route-stops{gap:2px}}\n@media(prefers-reduced-motion:reduce){#boardTargets .chapter-route-stops:after{animation:none;left:10%}}";
 css.textContent+=`
#boardTargets .step-chapters{grid-template-columns:1fr;gap:10px}
#boardTargets .step-chapters .chapter-card-route{grid-column:1;grid-row:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
#boardTargets .step-chapters .chapter-literary-part{display:flex;flex-direction:column;align-items:flex-start;gap:7px;padding:15px;text-align:left;min-height:145px}
#boardTargets .chapter-part-number{font:700 10px/1.25 'DM Sans',sans-serif;letter-spacing:.1em;color:#f0d6a2}
#boardTargets .chapter-part-title{font:700 clamp(21px,2.5vw,28px)/1.1 'Cormorant Garamond',Georgia,serif;color:#fff9e5}
#boardTargets .chapter-part-game{font:500 11px/1.4 'DM Sans',sans-serif;color:#e2e8d6}
#boardTargets .chapter-part-state{font:600 10px/1.4 'DM Sans',sans-serif;margin-top:auto;padding-top:7px}
#boardTargets .chapter-literary-part.passed .chapter-part-number,#boardTargets .chapter-literary-part.passed .chapter-part-title,#boardTargets .chapter-literary-part.passed .chapter-part-game{color:#28503d}
#chapter1Sequence .chapter1-part .chapter-sequence-title{display:block;line-height:1.4}
#chapter1Sequence .chapter1-part .chapter-sequence-game{display:block;font-size:10px;font-weight:400;line-height:1.4;margin-top:4px}
@media(max-width:640px){
 #boardTargets .step-chapters .chapter-card-route{grid-template-columns:1fr;gap:8px}
 #boardTargets .step-chapters .chapter-literary-part{min-height:0;padding:12px;gap:4px}
 #boardTargets .step-chapters .chapter-part-title{font-size:25px}
 #boardTargets .step-chapters .chapter-part-state{padding-top:3px}
}
`;
 document.head.append(css);
 $('board').setAttribute('aria-label','Deux blocs de jeu : le chapitre 1, puis les trois extraits des chapitres 2, 3 et 4.');
 const intro=document.querySelector('.board-intro');
 if(intro)intro.textContent='Deux blocs de jeu : le chapitre 1, puis trois extraits distincts des chapitres 2, 3 et 4 réunis dans le bloc 2.';
 const header=document.createElement('div');header.id='chapter1Header';
 const sequence=document.createElement('nav');sequence.id='chapter1Sequence';sequence.setAttribute('aria-label','Trois parties du chapitre 1');
 $('questTitle').before(header);$('gameEntry').before(sequence);
 const chapterName='Chapitre 1 — « La salle d’attente »';
 const chapterTwoName='Chapitre 2 — « Même pas mal »';
 const secondBlockName='Bloc 2 · Chapitres 2, 3 et 4';
 const icons=['🌳','🪖'];
 const captions=['🌿 Les Marmousets','🎧 Le lycée','🌳 Barcelone'];
 const chapterTwoCaptions=['🪖 Sarajevo','🕺 Le danseur','🔒 La prison'];
 const makeSpan=(name,label)=>{const el=document.createElement('span');el.className=name;el.textContent=label;return el;};
 function paintTargets(){
  const host=$('boardTargets'),current=state.selected<=3?1:state.selected<=5?4:state.selected;
  if(host.dataset.mode!=='chapters-grouped-v2'){
   host.dataset.mode='chapters-grouped-v2';
   host.replaceChildren(...flow.CARDS.map((scene,i)=>{
    const button=document.createElement('button');button.type='button';
    button.className='board-target'+(scene===1||scene===4?' chapter-featured':'')+(scene===4?' step-chapters':'');
    button.dataset.level=String(scene);button.dataset.chapter=String(i+1);
    button.append(
     makeSpan('chapter-card-kicker','BLOC '+(i+1)+(scene===1?' · CHAPITRE 1':'')),
     makeSpan('chapter-card-title',scene===1?'La salle d’attente':scene===4?'Chapitres 2, 3 et 4':LEVELS[scene-1].title),
     makeSpan('chapter-card-place',scene===1?'Ferney-Voltaire · La Roche-sur-Foron · Barcelone':scene===4?'Trois extraits, une même étape de jeu.':LEVELS[scene-1].place)
    );
    if(scene===1||scene===4){
     const route=document.createElement('div');route.className='chapter-card-route';
     if(scene===1){
      for(let part=1;part<=3;part++){
       const tile=makeSpan('chapter-part-label',captions[part-1]);tile.dataset.part=String(part);route.append(tile);
      }
      button.append(route,makeSpan('chapter-card-status','0 / 3 jeux terminés'));
     }else{
      for(const p of flow.CHAPTER2_PARTS){
       const tile=makeSpan('chapter-part-label chapter-literary-part','');
       tile.dataset.chapterTwoPart=String(p.part);
       tile.append(makeSpan('chapter-part-number','CHAPITRE '+p.chapter),
        makeSpan('chapter-part-title','« '+p.chapterTitle+' »'),
        makeSpan('chapter-part-game',chapterTwoCaptions[p.part-1]),
        makeSpan('chapter-part-state','Jeu '+p.part+' / 3'));
       route.append(tile);
      }
      button.append(route,makeSpan('chapter-card-status','0 / 3 jeux terminés'));
     }
    }
    button.append(makeSpan('board-badge',icons[i]));
    button.onclick=()=>{
     if(boardRolling)return;
     const n=scene===1?(flow.done(state)?1:flow.nextPart(state)):
      scene===4?(flow.chapter2Done(state)?4:flow.chapter2PartDone(state,1)?5:4):scene;
     if(!flow.canEnter(state,n))return;
     // Dès le clic sur la vignette, commencer par le texte en plein écran.
     arriveAtStage(n);
    };
    return button;
   }));
   // Visually link chapter 1 to chapter 2 with the exact stop sequence.
   const connector=document.createElement('div');connector.className='chapter-journey-route';
   connector.setAttribute('role','group');
   connector.setAttribute('aria-label','Voyage du chapitre 1 au chapitre 2 : Barcelone, Ferney-Voltaire, Vannes en Bretagne, Poitiers, Sarajevo.');
   const heading=document.createElement('p');heading.className='chapter-journey-title';
   heading.textContent='De Barcelone à Sarajevo · trajet entre les deux blocs';
   const stops=document.createElement('div');stops.className='chapter-route-stops';
   for(const name of ['Barcelone','Ferney-Voltaire','Vannes · Bretagne','Poitiers','Sarajevo']){
    const stop=makeSpan('chapter-route-stop',name);stops.append(stop);
   }
   connector.append(heading,stops);
   host.querySelector('[data-chapter="1"]').after(connector);
  }
  for(const button of host.querySelectorAll('[data-chapter]')){
   const n=Number(button.dataset.level),i=Number(button.dataset.chapter);
   const finished=n===1?flow.done(state):n===4?flow.chapter2Done(state):state.completed.includes(n);
   const allowed=n===1||flow.canEnter(state,n),active=n===current;
   button.classList.toggle('done',finished);
   button.setAttribute('aria-disabled',String(!allowed));
   button.setAttribute('aria-pressed',String(active));
   button.tabIndex=allowed?0:-1;
   button.setAttribute('aria-label',n===1?chapterName+' · '+flow.scenePassedCount(state)+'/3 scènes terminées':
    n===4?secondBlockName+' · '+flow.CHAPTER2_PARTS.map(p=>'Chapitre '+p.chapter+' — '+p.chapterTitle).join(' ; ')+' · '+flow.CHAPTER2_PARTS.filter(p=>flow.chapter2PartDone(state,p.part)).length+'/3 scènes terminées':
    'Bloc '+i+' — '+LEVELS[n-1].title+(finished?' terminé':!allowed?' verrouillé':''));
   if(n===1){
    button.querySelector('.chapter-card-status').textContent=finished?
     (flow.chapterHasSkips(state,1)?'↷ Les trois scènes sont parcourues':'✓ Les trois scènes sont réussies'):
     flow.scenePassedCount(state)+' / 3 scènes parcourues · ouvrir pour continuer';
    for(const badge of button.querySelectorAll('[data-part]')){
     const p=Number(badge.dataset.part);
     badge.classList.toggle('passed',flow.partDone(state,p));
     badge.textContent=(flow.wasSkipped(state,p)?'↷ ':flow.partDone(state,p)?'✓ ':'')+captions[p-1];
    }
   }else{
    if(n===4){
     const count=flow.CHAPTER2_PARTS.filter(p=>flow.chapter2PartDone(state,p.part)).length;
     button.querySelector('.chapter-card-status').textContent=finished?
      (flow.chapterHasSkips(state,2)?'↷ Les trois scènes sont parcourues':'✓ Les trois scènes sont réussies'):
      count+' / 3 scènes parcourues · ouvrir pour continuer';
     for(const badge of button.querySelectorAll('[data-chapter-two-part]')){
      const part=Number(badge.dataset.chapterTwoPart);
      badge.classList.toggle('passed',flow.chapter2PartDone(state,part));
      const skipped=flow.wasSkipped(state,part===1?'4':part===2?'5:dance':'5:prison');
      badge.querySelector('.chapter-part-state').textContent='Jeu '+part+' / 3'+(skipped?' · ↷ parcouru':flow.chapter2PartDone(state,part)?' · ✓ réussi':'');
     }
    }
    button.querySelector('.board-badge').textContent=finished?'✓':icons[i-1];
   }
  }
  const n=state.selected;
  const canContinue=n<=3?flow.partDone(state,n):n===4?flow.chapter2PartDone(state,1):n===5?flow.chapter2Done(state):state.completed.includes(n);
  const mayTravel=canContinue&&n<13;
  $('boardRoll').hidden=!mayTravel;
  $('boardRoll').disabled=!!boardRolling;
  $('boardRoll').textContent=n<=2?'Partie suivante du chapitre →':
   n===3?'Vers le chapitre 2 →':n===4?'Continuer : Le danseur →':
   n===5?'Vers la suite du parcours →':'Étape suivante →';
  $('boardRoll').onclick=()=>rollTravel(state.selected);
  $('travelHint').textContent=flow.done(state)&&n<=3?'Les trois jeux du chapitre 1 sont terminés. Sarajevo ouvre le chapitre 2.':
   n<=3?flow.scenePassedCount(state)+'/3 scènes terminées · Un seul chapitre.':
   n<=5?flow.CHAPTER2_PARTS.filter(p=>flow.chapter2PartDone(state,p.part)).length+'/3 jeux terminés · Chapitres 2, 3 et 4, dans le même bloc.':
   mayTravel?'Le bloc est terminé. Les dés et la carte accompagnent la suite.':
   'Termine l’épreuve en cours pour poursuivre.';
 }
 drawBoard=paintTargets;
 const oldSelect=select;
 select=function(n){if(!flow.canEnter(state,n))return;oldSelect(n);};
 const oldRollTravel=rollTravel;
 rollTravel=function(n){
  if(boardRolling||n!==state.selected)return;
  // Passage d'une scène à l'autre, gagnée OU volontairement passée.
  // The historic IDs and save format are retained; only wins pay points.
  if(n>=1&&n<=5){
   const traversed=n<=3?flow.partDone(state,n):
    n===4?flow.chapter2PartDone(state,1):flow.chapter2Done(state);
   if(!traversed)return;
   if(!window.TreizeVoyage){arriveAtStage(n+1);return;}
   boardRolling=true;
   const next=n+1;
   finishBoardRoll=TreizeVoyage.start({
    from:n,to:next,title:LEVELS[next-1].title,
    onFinish:()=>{
     boardRolling=false;finishBoardRoll=null;
     if(state.selected!==n)return;
     const stillPassed=n<=3?flow.partDone(state,n):
      n===4?flow.chapter2PartDone(state,1):flow.chapter2Done(state);
     if(stillPassed)arriveAtStage(next);
    }
   });
   return;
  }
  oldRollTravel(n);
 };
 const oldSave=save;
 save=function(){oldSave();updateProgressBar();};
 function updateProgressBar(){
  const count=Number(flow.done(state))+Number(flow.chapter2Done(state));
  if($('shared-progress'))$('shared-progress').textContent='✦ '+count+' / 2 blocs · '+state.points+' points';
  $('count').textContent=count+'/2';
  $('stage').textContent=Math.min(2,flow.chapterReached(state));
 }
 function paintChapterSection(){
  updateProgressBar();
  const n=state.selected;
  $('marmousetsReadingStart')?.remove();
  header.hidden=n>5;sequence.hidden=n>5;
  $('question').hidden=n===2||n===3||n===5;
  $('options').hidden=n===2||n===3||n===5;
  if(n<=3){
   header.textContent=chapterName;
   const part=flow.PARTS[n-1];
   $('levelTag').textContent='BLOC 1 · CHAPITRE 1 · JEU '+n+' / 3';
   $('questTitle').textContent=part.title;
   sequence.replaceChildren(...flow.PARTS.map((p,i)=>{
    const b=document.createElement('button');b.type='button';b.className='chapter1-part';
    b.classList.toggle('active',n===p.scene);b.classList.toggle('passed',flow.partDone(state,p.scene));
    b.textContent=(flow.partDone(state,p.scene)?'✓ ':'')+(i+1)+' · '+p.title;
    b.disabled=!flow.canEnter(state,p.scene)||boardRolling;
    b.setAttribute('aria-current',n===p.scene?'step':'false');
    b.onclick=()=>arriveAtStage(p.scene);
    return b;
   }));
   const canContinue=flow.partDone(state,n);
   const next=$('next');
   next.hidden=!canContinue;
   next.textContent=n<3?'Continuer : '+flow.PARTS[n].title+' →':chapterTwoName+' · Sarajevo →';
   $('mobileNext').hidden=!canContinue;
   $('mobileNext').textContent=next.textContent;
   if(canContinue)$('mobileGameDock').hidden=false;
   $('gameEntryName').textContent=part.title;
   $('mobileGameName').textContent=part.title;
   $('gameEntryHint').textContent=canContinue&&n<3?'Cette partie est réussie. Tu peux continuer le chapitre.':canContinue?'Les trois parties du chapitre sont terminées.':'Lis le passage en plein écran avant de commencer le mini-jeu.';
   // L'entrée du chapitre 1 reste accessible même avant la première bonne réponse.
   if(n===1&&!state.completed.includes(1)&&!state.marmousetsPending){
    const launch=document.createElement('button');launch.type='button';
    launch.id='marmousetsReadingStart';launch.className='action';
    launch.textContent='📖 Lire Les Marmousets et commencer →';
    launch.onclick=()=>arriveAtStage(1);
    $('gameLaunchSlot').append(launch);
    $('gameEntry').hidden=false;
   }
   if(n===2&&!flow.partDone(state,2))
    $('status').textContent='Partie 2 / 3 : réussis la fuite vers l’A410. Le quiz commun du chapitre a déjà été validé.';
   if(n===3&&!flow.partDone(state,3))
    $('status').textContent='Partie 3 / 3 : sers les cinq clients à Barcelone pour terminer le chapitre. Le quiz commun est déjà validé.';
  }else if(n===4||n===5){
   sequence.setAttribute('aria-label','Bloc 2 : extraits des chapitres 2, 3 et 4');
   const secondDone=flow.chapter2PartDone(state,2);
   const activePart=n===4?1:secondDone?3:2;
   const activeChapter=flow.CHAPTER2_PARTS[activePart-1];
   header.textContent='Chapitre '+activeChapter.chapter+' — « '+activeChapter.chapterTitle+' »';
   $('levelTag').textContent='BLOC 2 · JEU '+activePart+' / 3';
   $('questTitle').textContent=n===4?'Sarajevo':secondDone?'La prison':'Le danseur';
   sequence.replaceChildren(...flow.CHAPTER2_PARTS.map(p=>{
    const b=document.createElement('button');b.type='button';b.className='chapter1-part';
    b.classList.toggle('active',activePart===p.part);
    b.classList.toggle('passed',flow.chapter2PartDone(state,p.part));
    b.append(makeSpan('chapter-sequence-title',(flow.chapter2PartDone(state,p.part)?'✓ ':'')+'Chapitre '+p.chapter+' — « '+p.chapterTitle+' »'),
     makeSpan('chapter-sequence-game','Jeu '+p.part+' / 3 · '+p.title));
    b.disabled=!flow.canEnter(state,p.scene)||boardRolling||
     (p.part===3&&!flow.chapter2PartDone(state,2));
    b.setAttribute('aria-current',activePart===p.part?'step':'false');
    b.onclick=()=>arriveAtStage(p.scene);
    return b;
   }));
   const finished=n===4?flow.chapter2PartDone(state,1):flow.chapter2Done(state);
   $('next').hidden=!finished;
   $('mobileNext').hidden=!finished;
   $('next').textContent=n===4?'Chapitre 3 — Le coup du bus →':'Suite du parcours →';
   $('mobileNext').textContent=$('next').textContent;
   if(finished)$('mobileGameDock').hidden=false;
   if(n===4&&!finished)
    $('status').textContent='Jeu 1 / 3 · Chapitre 2 — Même pas mal : franchis Sarajevo pour poursuivre dans le même bloc.';
   if(n===5&&!flow.chapter2Done(state)){
    $('status').textContent=secondDone?
     'Jeu 3 / 3 · Chapitre 4 — Le drapeau rouge : termine les épreuves de la prison pour achever le bloc 2.':
     'Jeu 2 / 3 · Chapitre 3 — Le coup du bus : réussis la danse pour poursuivre vers le chapitre 4, dans le même bloc.';
   }
  }else{
   $('levelTag').textContent='BLOC '+flow.chapterOf(n)+' · EN PRÉPARATION';
  }
  const rewards=[];
  if(flow.done(state))rewards.push('<span class="item">'+
   (flow.chapterHasSkips(state,1)?'◇ ':'✦ ')+chapterName+
   (flow.chapterHasSkips(state,1)?' · parcouru':'')+'</span>');
  if(flow.chapter2Done(state))rewards.push('<span class="item">'+
   (flow.chapterHasSkips(state,2)?'◇ ':'✦ ')+secondBlockName+
   (flow.chapterHasSkips(state,2)?' · parcouru':'')+'</span>');
  for(const number of state.completed.filter(n=>n>=6).sort((a,b)=>a-b))
   rewards.push('<span class="item">✦ '+esc(LEVELS[number-1].reward)+'</span>');
  $('inventory').innerHTML=rewards.length?rewards.join(''):'<span class="muted">Le sac est encore vide. Termine les trois parties du premier chapitre !</span>';
  paintTargets();
 }
 const oldRender=render;
 render=function(){
  const changed1=flow.preparePart(state,state.selected,()=>crypto.randomUUID());
  const changed2=state.selected===5&&flow.prepareChapter2Dance(state);
  if(changed1||changed2)save();
  oldRender();paintChapterSection();
 };
 if(flow.reconcile(state))save();
 render();
 let pendingAuto=0,autoTransitionTimer=0;
 const finishes={'marmousets:won':1,'a410:escaped':2,'catalogne:sale':3,'bosnie:won':4};
 const closes={'marmousets:close':1,'a410:close':2,'catalogne:close':3,'bosnie:close':4};
 const dialogIds={1:'marmousetsDialog',2:'arcadeDialog',3:'catalogneDialog',4:'bosnieDialog'};
 const closeIds={1:'marmousetsClose',2:'arcadeClose',3:'catalogneClose',4:'bosnieClose'};
 function sceneFinished(n){return n===4?flow.chapter2PartDone(state,1):flow.partDone(state,n);}
 function afterClose(n){
  if(pendingAuto!==n||state.selected!==n||!sceneFinished(n))return;
  pendingAuto=0;clearTimeout(autoTransitionTimer);autoTransitionTimer=0;
  queueMicrotask(()=>{if(state.selected===n&&sceneFinished(n))rollTravel(n);});
 }
 function scheduleAutoTransition(n){
  pendingAuto=n;
  clearTimeout(autoTransitionTimer);
  // Allow the game's successful ending and credited score to be visible briefly.
  autoTransitionTimer=setTimeout(()=>{
   if(pendingAuto!==n||state.selected!==n||!sceneFinished(n)||boardRolling)return;
   const dialog=$(dialogIds[n]),closeButton=$(closeIds[n]);
   if(dialog?.open&&typeof closeButton?.click==='function')closeButton.click();
   else afterClose(n);
  },1800);
 }
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||!event.data)return;
  const type=event.data.type,finished=finishes[type],closed=closes[type];
  if(finished&&state.selected===finished&&sceneFinished(finished))scheduleAutoTransition(finished);
  if(closed)afterClose(closed);
 });
 for(const [n,id]of [[1,'marmousetsClose'],[2,'arcadeClose'],[3,'catalogneClose'],[4,'bosnieClose']])
  $(id)?.addEventListener('click',()=>afterClose(n));
 window.TreizeSceneNavigation={
  cancelAutomatic(){pendingAuto=0;clearTimeout(autoTransitionTimer);autoTransitionTimer=0;},
  continue(){if(!boardRolling)rollTravel(state.selected);}
 };
 window.addEventListener('focus',updateProgressBar);
})();
