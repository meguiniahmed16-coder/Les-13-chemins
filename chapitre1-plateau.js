/* Chapitre 1 : une vignette sur le plateau, trois mini-jeux en séquence. */
(function(){
 'use strict';
 const flow=window.TreizeChapitre1;
 if(!flow||!document.getElementById('boardTargets'))return;
 const $=id=>document.getElementById(id);
 const css=document.createElement('style');
 css.id='chapitre1-board-styles';
 css.textContent="#board{aspect-ratio:auto!important;min-height:0!important;overflow:visible!important;background:linear-gradient(145deg,#f1e2c5,#e6d2ae);padding:13px!important;touch-action:pan-y}\n#board picture{display:none!important}\n#boardTargets{position:relative!important;inset:auto!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}\n#boardTargets .board-target{position:relative!important;inset:auto!important;left:auto!important;top:auto!important;width:100%!important;height:auto!important;min-height:130px;display:flex;flex-direction:column;align-items:flex-start;gap:7px;padding:14px 12px 39px;border-radius:10px;text-align:left;background:linear-gradient(155deg,#fff6df,#edddbc);border:2px solid #c5a679;box-shadow:0 3px 0 #ad8a5c33;color:#4f3c2a;overflow:hidden}\n#boardTargets .board-target:before{content:'';position:absolute;right:-26px;top:-32px;width:95px;height:95px;border:1px solid #ddc29b;border-radius:50%;pointer-events:none}\n#boardTargets .board-target[aria-disabled=true]{opacity:.6;filter:saturate(.6);cursor:not-allowed}\n#boardTargets .board-target[aria-pressed=true]{border-color:#31594c;background:linear-gradient(145deg,#fff4dc,#e6edd8);box-shadow:inset 0 0 0 2px #fff9eb}\n#boardTargets .board-target.done{background:linear-gradient(145deg,#e9efdb,#d1ddc5);border-color:#7e9d76}\n#boardTargets .chapter-featured{grid-column:1/-1;min-height:178px!important;background:linear-gradient(110deg,#32564b 0%,#527768 48%,#739377 100%)!important;border:3px solid #bd995e!important;color:#fff5dc!important;padding:20px 22px!important;display:grid!important;grid-template-columns:minmax(0,1fr) 1.35fr;align-content:center;column-gap:22px;row-gap:9px}\n#boardTargets .chapter-featured[aria-disabled=true]{opacity:1;filter:none}\n#boardTargets .chapter-featured[aria-pressed=true]{box-shadow:inset 0 0 0 2px #f9e6c2,0 3px 12px #102b2355}\n#boardTargets .chapter-featured.done{background:linear-gradient(110deg,#2d584a,#466d54,#70855c)!important}\n#boardTargets .chapter-featured:before{right:-22px;top:-42px;width:230px;height:230px;border:2px solid #f7eaca30}\n#boardTargets .chapter-featured .chapter-card-kicker{color:#f0d6a2}\n#boardTargets .chapter-featured .chapter-card-title{color:#fff9e5;font-size:clamp(24px,3vw,37px)}\n#boardTargets .chapter-featured .chapter-card-place{color:#e3e9d3}\n#boardTargets .chapter-card-kicker{font:700 10px/1.2 'DM Sans',sans-serif;letter-spacing:.13em;text-transform:uppercase;color:#8b6740;position:relative}\n#boardTargets .chapter-card-title{font:700 clamp(19px,2.2vw,25px)/1.06 'Cormorant Garamond',Georgia,serif;position:relative;max-width:100%}\n#boardTargets .chapter-card-place{font:11px/1.4 'DM Sans',sans-serif;color:#836a49;position:relative}\n#boardTargets .chapter-card-route{display:flex;gap:8px;align-items:stretch;flex-wrap:wrap;grid-column:2;grid-row:1 / span 3;align-self:center;position:relative}\n#boardTargets .chapter-card-route span{flex:1 1 90px;min-width:0;text-align:center;border:1px solid #eed9ae70;padding:12px 6px;border-radius:7px;background:#1d403749;font:700 11px/1.45 'DM Sans',sans-serif;color:#fff8dc}\n#boardTargets .chapter-card-route span.passed{background:#e4eed3;color:#28503d}\n#boardTargets .chapter-card-status{font:600 11px/1.3 'DM Sans',sans-serif;margin-top:auto;color:#dceacf;grid-column:1;position:relative}\n#boardTargets .board-badge{position:absolute;right:8px;bottom:8px;top:auto;z-index:1;width:24px;height:24px;font-size:12px}\n#boardTargets .chapter-featured .board-badge{right:12px;bottom:12px;width:31px;height:31px;font-size:17px}\n#chapter1Sequence{display:flex;gap:7px;flex-wrap:wrap;margin:13px 0;padding:11px;border:1px solid #bbad84;border-radius:8px;background:#f5ecd7}\n#chapter1Sequence .chapter1-part{border:1px solid #bba778;border-radius:5px;background:#fff9ea;color:#52613e;padding:8px 10px;min-height:43px;font:600 12px 'DM Sans',sans-serif;flex:1 1 120px;cursor:pointer}\n#chapter1Sequence .chapter1-part.active{background:#315b49;color:#fff9e2;border-color:#315b49}\n#chapter1Sequence .chapter1-part.passed{border-color:#638869}\n#chapter1Sequence .chapter1-part:disabled{opacity:.46;cursor:not-allowed}\n#chapter1Header{font:700 17px/1.25 'Cormorant Garamond',Georgia,serif;color:#6b5637;margin:0 0 7px}\n#chapter1Header[hidden],#chapter1Sequence[hidden]{display:none!important}\n@media(max-width:760px){#boardTargets{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#boardTargets .board-target{min-height:135px;padding:11px 10px 35px}#boardTargets .chapter-featured{grid-column:1/-1;grid-template-columns:1fr;min-height:195px!important;padding:17px!important}#boardTargets .chapter-card-route{grid-column:1;grid-row:auto;gap:5px}#boardTargets .chapter-card-route span{flex:1 1 85px;padding:9px 4px;font-size:10px}}\n@media(max-width:390px){#boardTargets .chapter-card-title{font-size:19px}#boardTargets .chapter-card-route{flex-wrap:wrap}}";
 document.head.append(css);
 $('board').setAttribute('aria-label','Plateau de onze chapitres. Le premier réunit trois scènes de jeu.');
 const intro=document.querySelector('.board-intro');
 if(intro)intro.textContent='Onze chapitres · treize scènes de jeu. Les trois premiers jeux sont réunis dans le chapitre 1.';
 const header=document.createElement('div');header.id='chapter1Header';
 const sequence=document.createElement('nav');sequence.id='chapter1Sequence';sequence.setAttribute('aria-label','Trois parties du chapitre 1');
 $('questTitle').before(header);$('gameEntry').before(sequence);
 const chapterName='Chapitre 1 — « La salle d’attente »';
 const chapterTwoName='Chapitre 2 — « Même pas mal »';
 const icons=['🌳','🪖','🎭','🗝️','🦋','🤝','🪶','🥾','⛺','💍','⛵'];
 const captions=['🌿 Les Marmousets','🎧 Le lycée','🌳 Barcelone'];
 const makeSpan=(name,label)=>{const el=document.createElement('span');el.className=name;el.textContent=label;return el;};
 function paintTargets(){
  const host=$('boardTargets'),current=state.selected<=3?1:state.selected;
  if(host.dataset.mode!=='chapters-v1'){
   host.dataset.mode='chapters-v1';
   host.replaceChildren(...flow.CARDS.map((scene,i)=>{
    const button=document.createElement('button');button.type='button';
    button.className='board-target'+(scene===1||scene===4?' chapter-featured':'');
    button.dataset.level=String(scene);button.dataset.chapter=String(i+1);
    button.append(
     makeSpan('chapter-card-kicker','CHAPITRE '+(i+1)),
     makeSpan('chapter-card-title',scene===1?'La salle d’attente':scene===4?'Même pas mal':LEVELS[scene-1].title),
     makeSpan('chapter-card-place',scene===1?'Ferney-Voltaire · La Roche-sur-Foron · Barcelone':LEVELS[scene-1].place)
    );
    if(scene===1||scene===4){
     const route=document.createElement('div');route.className='chapter-card-route';
     if(scene===1){
      for(let part=1;part<=3;part++){
       const tile=makeSpan('chapter-part-label',captions[part-1]);tile.dataset.part=String(part);route.append(tile);
      }
      button.append(route,makeSpan('chapter-card-status','0 / 3 scènes terminées'));
     }else{
      route.append(makeSpan('chapter-part-label','🪖 Sarajevo · Le choc de l’arrivée'));
      button.append(route,makeSpan('chapter-card-status','Une scène · Entre les rafales'));
     }
    }
    button.append(makeSpan('board-badge',icons[i]));
    button.onclick=()=>{
     if(boardRolling)return;
     const n=scene===1?(flow.done(state)?1:flow.nextPart(state)):scene;
     if(!flow.canEnter(state,n))return;
     if(state.selected!==n)select(n);
     if(matchMedia('(max-width:900px)').matches)$('questTitle').scrollIntoView({behavior:'instant',block:'start'});
    };
    return button;
   }));
  }
  for(const button of host.querySelectorAll('[data-chapter]')){
   const n=Number(button.dataset.level),i=Number(button.dataset.chapter);
   const finished=n===1?flow.done(state):state.completed.includes(n);
   const allowed=n===1||flow.canEnter(state,n),active=n===current;
   button.classList.toggle('done',finished);
   button.setAttribute('aria-disabled',String(!allowed));
   button.setAttribute('aria-pressed',String(active));
   button.tabIndex=allowed?0:-1;
   button.setAttribute('aria-label',n===1?chapterName+' · '+flow.scenePassedCount(state)+'/3 scènes terminées':'Chapitre '+i+' — '+LEVELS[n-1].title+(finished?' terminé':!allowed?' verrouillé':''));
   if(n===1){
    button.querySelector('.chapter-card-status').textContent=finished?'✓ Les trois scènes sont terminées':flow.scenePassedCount(state)+' / 3 scènes terminées · ouvrir pour continuer';
    for(const badge of button.querySelectorAll('[data-part]')){
     const p=Number(badge.dataset.part);
     badge.classList.toggle('passed',flow.partDone(state,p));
     badge.textContent=(flow.partDone(state,p)?'✓ ':'')+captions[p-1];
    }
   }else{
    if(n===4)button.querySelector('.chapter-card-status').textContent=finished?'✓ Sarajevo · chapitre terminé':'🪖 Sarajevo · une scène à accomplir';
    button.querySelector('.board-badge').textContent=finished?'✓':icons[i];
   }
  }
  const n=state.selected;
  const canContinue=n<=3?flow.partDone(state,n):state.completed.includes(n);
  const mayTravel=canContinue&&n<13;
  $('boardRoll').hidden=!mayTravel;
  $('boardRoll').disabled=!!boardRolling;
  $('boardRoll').textContent=n<=2?'Partie suivante du chapitre →':n===3?'Vers le chapitre 2 →':'Étape suivante →';
  $('boardRoll').onclick=()=>rollTravel(state.selected);
  $('travelHint').textContent=flow.done(state)&&n<=3?'Les trois jeux du chapitre 1 sont terminés. Sarajevo est la prochaine étape.':n<=3?flow.scenePassedCount(state)+'/3 scènes terminées · Les trois jeux forment un seul chapitre.':mayTravel?'Le trésor est acquis. Les dés et la carte accompagnent la suite.':'Termine l’épreuve en cours pour poursuivre.';
 }
 drawBoard=paintTargets;
 const oldSelect=select;
 select=function(n){if(!flow.canEnter(state,n))return;oldSelect(n);};
 const oldRollTravel=rollTravel;
 rollTravel=function(n){
  if(boardRolling||n!==state.selected)return;
  if(n===1||n===2){
   if(!flow.partDone(state,n))return;
   arriveAtStage(n+1);return;
  }
  if(n===3&&!flow.done(state))return;
  oldRollTravel(n);
 };
 const oldSave=save;
 save=function(){oldSave();updateProgressBar();};
 function updateProgressBar(){
  const count=flow.chaptersDone(state);
  if($('shared-progress'))$('shared-progress').textContent='✦ '+count+' / 11 chapitres · '+state.points+' points';
  $('count').textContent=count+'/11';
  $('stage').textContent=flow.chapterReached(state);
 }
 function paintChapterSection(){
  updateProgressBar();
  const n=state.selected;
  header.hidden=n>3;sequence.hidden=n>3;
  $('question').hidden=n===2||n===3;
  $('options').hidden=n===2||n===3;
  if(n<=3){
   header.textContent=chapterName;
   const part=flow.PARTS[n-1];
   $('levelTag').textContent='CHAPITRE 1 / 11 · PARTIE '+n+' / 3';
   $('questTitle').textContent=part.title;
   sequence.replaceChildren(...flow.PARTS.map((p,i)=>{
    const b=document.createElement('button');b.type='button';b.className='chapter1-part';
    b.classList.toggle('active',n===p.scene);b.classList.toggle('passed',flow.partDone(state,p.scene));
    b.textContent=(flow.partDone(state,p.scene)?'✓ ':'')+(i+1)+' · '+p.title;
    b.disabled=!flow.canEnter(state,p.scene)||boardRolling;
    b.setAttribute('aria-current',n===p.scene?'step':'false');
    b.onclick=()=>select(p.scene);
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
   $('gameEntryHint').textContent=canContinue&&n<3?'Cette partie est réussie. Tu peux continuer le chapitre.':canContinue?'Les trois parties du chapitre sont terminées.':'Réponds à la question et termine le jeu pour poursuivre.';
   if(n===2&&!flow.partDone(state,2))
    $('status').textContent='Partie 2 / 3 : réussis la fuite vers l’A410. Le quiz commun du chapitre a déjà été validé.';
   if(n===3&&!flow.partDone(state,3))
    $('status').textContent='Partie 3 / 3 : sers les cinq clients à Barcelone pour terminer le chapitre. Le quiz commun est déjà validé.';
  }else{
   $('levelTag').textContent='CHAPITRE '+flow.chapterOf(n)+' / 11'+(n===5?' · PLATEAU '+(TreizePlateaux.progress(state,5).finished.includes(1)?2:1)+' / 2':'');
   if(n===4)$('questTitle').textContent=chapterTwoName;
  }
  const rewards=[];
  if(flow.done(state))rewards.push('<span class="item">✦ '+chapterName+'</span>');
  for(const number of state.completed.filter(n=>n>=4).sort((a,b)=>a-b))
   rewards.push('<span class="item">✦ '+esc(LEVELS[number-1].reward)+'</span>');
  $('inventory').innerHTML=rewards.length?rewards.join(''):'<span class="muted">Le sac est encore vide. Termine les trois parties du premier chapitre !</span>';
  paintTargets();
 }
 const oldRender=render;
 render=function(){
  if(flow.preparePart(state,state.selected,()=>crypto.randomUUID()))save();
  oldRender();paintChapterSection();
 };
 if(flow.reconcile(state))save();
 render();
 let pendingAuto=0;
 const finishes={'marmousets:won':1,'a410:escaped':2,'catalogne:sale':3};
 const closes={'marmousets:close':1,'a410:close':2,'catalogne:close':3};
 function afterClose(n){
  if(pendingAuto!==n||state.selected!==n||!flow.partDone(state,n))return;
  pendingAuto=0;
  if(n<3)queueMicrotask(()=>{if(state.selected===n&&flow.partDone(state,n))arriveAtStage(n+1);});
  else render();
 }
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||!event.data)return;
  const type=event.data.type,finished=finishes[type],closed=closes[type];
  if(finished&&state.selected===finished&&flow.partDone(state,finished))pendingAuto=finished;
  if(closed)afterClose(closed);
 });
 for(const [n,id]of [[1,'marmousetsClose'],[2,'arcadeClose'],[3,'catalogneClose']])
  $(id)?.addEventListener('click',()=>afterClose(n));
 window.addEventListener('focus',updateProgressBar);
})();
