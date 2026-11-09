/* The arrival reader uses only the thirteen public, approved excerpts. */
(function(root){
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const getStage=(n,plateau=1)=>{const s=(root.TreizeEtapesData||[]).find(s=>s.level===Number(n));return Number(plateau)===1?s:s?.plateaux?.find(p=>p.plateau===Number(plateau));};
 const gps=([lat,lon])=>`${Math.abs(lat).toFixed(3)}° ${lat<0?'S':'N'} · ${Math.abs(lon).toFixed(3)}° ${lon<0?'O':'E'}`;
 const css=`
 html.arrival-reading,html.characters-reading{overflow:hidden}
 :is(#arrivalReader,#characterReader){width:min(850px,96vw);max-width:96vw;max-height:92dvh;padding:0;border:2px solid #ac8a53;border-radius:8px;background:#fff9ec;color:#293f3b;box-shadow:0 20px 80px #10282266;overflow:auto;overscroll-behavior:contain;text-align:left}
 :is(#arrivalReader,#characterReader)::backdrop{background:#19332cd9}
 :is(#arrivalReader,#characterReader) .arrival-bar{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:15px;padding:12px 20px;background:#263e3a;color:#fff3dc;font:600 12px/1.4 'DM Sans',sans-serif;border:0}
 :is(#arrivalReader,#characterReader) .arrival-close{border:1px solid #c9b28b;background:transparent;color:#fff3dc;min-width:44px;min-height:44px;border-radius:4px;font-size:24px;cursor:pointer}
 :is(#arrivalReader,#characterReader) .arrival-body{padding:30px clamp(20px,5vw,52px) 38px}
 :is(#arrivalReader,#characterReader) .arrival-kicker{font:600 11px/1.5 'DM Sans',sans-serif;text-transform:uppercase;letter-spacing:.14em;color:#88673d;margin:0 0 8px}
 :is(#arrivalReader,#characterReader) h2{font:600 clamp(32px,5vw,47px)/1.08 'Cormorant Garamond',Georgia,serif;margin:0 0 9px}
 :is(#arrivalReader,#characterReader) .arrival-area{font:16px/1.6 'DM Sans',sans-serif;margin:0 0 18px}
 :is(#arrivalReader,#characterReader) .arrival-facts{display:flex;gap:12px 26px;flex-wrap:wrap;margin:0 0 6px;font:14px/1.6 'DM Sans',sans-serif}
 :is(#arrivalReader,#characterReader) .arrival-facts div{display:flex;gap:8px}:is(#arrivalReader,#characterReader) dt{font-weight:700}:is(#arrivalReader,#characterReader) dd{margin:0}
 :is(#arrivalReader,#characterReader) .arrival-note{font:12px/1.5 'DM Sans',sans-serif;color:#756c5e;margin:0 0 18px}
 :is(#arrivalReader,#characterReader) .arrival-history{border-left:3px solid #ac8a53;padding:10px 16px;background:#f1e7d1;font:16px/1.7 Georgia,serif;margin:0 0 24px}
 :is(#arrivalReader,#characterReader) .arrival-characters{display:flex;gap:7px;flex-wrap:wrap;list-style:none;padding:0;margin:0 0 28px;font:12px/1.5 'DM Sans',sans-serif}
 :is(#arrivalReader,#characterReader) .arrival-characters li{border:1px solid #c9b48f;padding:5px 9px;border-radius:20px}
 :is(#arrivalReader,#characterReader) h3{font:600 clamp(28px,4vw,38px)/1.15 'Cormorant Garamond',Georgia,serif;margin:20px 0 10px}
 :is(#arrivalReader,#characterReader) .arrival-reference{font:14px/1.6 'DM Sans',sans-serif;margin:0 0 6px}
 :is(#arrivalReader,#characterReader) .arrival-excerpt{font:20px/1.85 Georgia,serif;margin:26px 0 30px;white-space:normal}
 :is(#arrivalReader,#characterReader) .arrival-excerpt p{margin:0 0 1.1em}
 /* Immersive reader, opened automatically after the map sequence. */
 #arrivalReader[data-autoplay="scroll"]{position:fixed;inset:0;box-sizing:border-box;display:block;width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;margin:0;padding:0;border:0;border-radius:0;background:#fff9ed;color:#283b36;overflow:auto;overscroll-behavior:contain}
 #arrivalReader[data-autoplay="scroll"] .arrival-body{max-width:790px;margin:0 auto;padding:clamp(24px,4vw,55px) clamp(20px,5vw,64px) 90px}
 #arrivalReader[data-autoplay="scroll"] .arrival-excerpt{font-size:clamp(20px,2.15vw,25px);line-height:1.86;letter-spacing:.005em;margin:30px 0 40px}
 #arrivalReader[data-autoplay="scroll"] .arrival-bar{padding:13px clamp(14px,3vw,36px)}
 #arrivalReader[data-autoplay="scroll"] .arrival-kicker{font-size:12px}
 #arrivalReader[data-autoplay="scroll"] .arrival-challenge{max-width:650px;margin:22px auto 0}
 #arrivalReader[data-autoplay="scroll"] .arrival-reading-instruction{font:600 13px/1.6 'DM Sans',sans-serif;color:#607768;text-align:center;padding:10px 0}
 #arrivalReader[data-autoplay="scroll"] .arrival-inline-quiz{margin:28px auto 32px;padding:24px;border:1px solid #b7a179;background:#eee6d3;border-radius:9px;max-width:700px}
 .arrival-inline-quiz h4{font:700 21px/1.35 Georgia,serif;margin:8px 0 17px;color:#324d42}
 .arrival-inline-quiz small{font:700 11px/1.4 'DM Sans',sans-serif;letter-spacing:.13em;text-transform:uppercase;color:#85633f}
 .arrival-inline-quiz .arrival-quiz-answer{display:block;width:100%;min-height:46px;padding:12px 15px;margin:9px 0;text-align:left;background:#fffaf0;border:1px solid #bfa77c;border-radius:6px;color:#304e41;font:600 14px/1.5 'DM Sans',sans-serif;cursor:pointer}
 .arrival-inline-quiz .arrival-quiz-answer:focus-visible{outline:3px solid #567a63}
 .arrival-inline-quiz .arrival-quiz-result{font:600 16px/1.6 Georgia,serif;color:#2d5d47}
 #arrivalReader .arrival-skip{display:block;width:100%;max-width:650px;min-height:49px;margin:13px auto 0;border:1px solid #9e947f;background:#f0e8d7;color:#43574c;border-radius:6px;font:700 15px/1.4 'DM Sans',sans-serif;cursor:pointer}
 #arrivalReader .arrival-skip-top{min-height:39px;padding:6px 12px;border:1px solid #d7c39d;border-radius:6px;background:#425c4d;color:#fff8e6;cursor:pointer;font:700 12px 'DM Sans',sans-serif}
 #arrivalReader .arrival-skip:focus-visible,#arrivalReader .arrival-skip-top:focus-visible{outline:3px solid #bc9360}
 @media(max-width:600px){#arrivalReader .arrival-skip-top{font-size:11px;padding:6px 8px}}
 @media(max-width:600px){#arrivalReader[data-autoplay="scroll"] .arrival-body{padding:25px 20px 78px}#arrivalReader[data-autoplay="scroll"] .arrival-excerpt{font-size:20px;line-height:1.8}#arrivalReader[data-autoplay="scroll"] .arrival-bar{font-size:11px}}
 :is(#arrivalReader,#characterReader) .arrival-challenge{display:block;width:100%;min-height:64px;padding:18px 24px;background:#345448;color:#fff8e9;border:1px solid #345448;border-radius:5px;cursor:pointer;text-align:center;font:700 20px/1.3 'DM Sans',sans-serif}
 :is(#arrivalReader,#characterReader) .arrival-challenge:hover{background:#476e59}:is(#arrivalReader,#characterReader) button:focus-visible,:is(#arrivalReader,#characterReader) a:focus-visible{outline:3px solid #b58037;outline-offset:3px}
 :is(#arrivalReader,#characterReader) .arrival-sources{font:12px/1.6 'DM Sans',sans-serif;color:#756c5e;margin:18px 0}:is(#arrivalReader,#characterReader) .arrival-sources a{color:#3b5f4c;text-underline-offset:3px}
 .journey-characters{z-index:2000!important}.journey-character-card{position:absolute;bottom:24px;left:0;transform:translateX(-50%);width:280px;max-width:75vw;padding:13px;border:1px solid #ac8a53;border-radius:8px;background:#fff8e8f5;color:#29453c;box-shadow:0 5px 24px #1a332b33;font:12px/1.5 'DM Sans',sans-serif;text-align:center}
 .journey-character-card strong{display:block;font:600 23px/1.2 'Cormorant Garamond',Georgia,serif;margin-bottom:8px}.journey-character-names{display:flex;flex-wrap:wrap;justify-content:center;gap:5px}.journey-character-name{display:inline-block;border:1px solid #c4b18d;border-radius:16px;padding:4px 8px;background:#f3e8d1;animation:arrival-name .45s both;animation-delay:var(--delay,0s)}
 .character-more{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:12px 16px;margin:0 0 22px;border:1px solid #9f8356;border-radius:5px;background:#f1e7d1;color:#294f3e;cursor:pointer;font:600 14px/1.4 'DM Sans',sans-serif;text-align:left}
 .character-more:hover{background:#e7d8b9}.character-more:focus-visible{outline:3px solid #b58037;outline-offset:3px}
 /* Toute lecture est une vraie fenêtre immersive : aucun fond de plateau visible autour. */
 :is(#arrivalReader,#characterReader){position:fixed;inset:0;width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;margin:0;padding:0;border:0;border-radius:0;box-sizing:border-box;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;background:#fff9ec}
 :is(#arrivalReader,#characterReader) .arrival-body{width:100%;max-width:860px;margin:0 auto;padding:clamp(28px,4vw,58px) clamp(22px,5vw,66px) 82px}
 :is(#arrivalReader,#characterReader) .arrival-excerpt{font:clamp(20px,2.2vw,25px)/1.86 Georgia,serif;letter-spacing:.006em}
 #characterReader .arrival-body{padding-top:25px}#characterReader article+article{border-top:1px solid #c9b48f;margin-top:30px;padding-top:20px}
 @keyframes arrival-name{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
 @media(prefers-reduced-motion:reduce){.journey-character-name{animation:none}}
 @media(max-width:600px){:is(#arrivalReader,#characterReader){width:100vw;max-width:100vw;max-height:100dvh;height:100dvh;border:0;border-radius:0}:is(#arrivalReader,#characterReader) .arrival-body{padding:25px 22px 35px}:is(#arrivalReader,#characterReader) .arrival-excerpt{font-size:19px;line-height:1.8}:is(#arrivalReader,#characterReader) .arrival-facts{font-size:13px}:is(#arrivalReader,#characterReader) .arrival-challenge{font-size:19px}}
 `;
 function install(){if(document.getElementById('arrivalStyles'))return;const s=document.createElement('style');s.id='arrivalStyles';s.textContent=css;document.head.append(s);}
 function namesHTML(stage){return `<div class="journey-character-card"><strong>${esc(stage.city)}</strong><div class="journey-character-names">${stage.characters.map((name,i)=>`<span class="journey-character-name" style="--delay:${i*.16}s">${esc(name)}</span>`).join('')}</div></div>`;}
 function addCharacters(map,n,plateau=1){const s=getStage(n,plateau);if(!s?.characters.length)return null;install();return L.marker(s.coordinates,{interactive:false,zIndexOffset:2000,icon:L.divIcon({className:'journey-characters',html:namesHTML(s),iconSize:[0,0],iconAnchor:[0,0]})}).addTo(map);}
 function characterButton(n,plateau=1){const s=getStage(n,plateau);return s?.workshops?.length?`<button type="button" class="character-more" data-character-stage="${s.level}" data-character-plateau="${plateau}" aria-haspopup="dialog">En savoir plus sur les personnages <span aria-hidden="true">↗</span></button>`:'';}
 function bindCharacters(container){container.querySelectorAll('[data-character-stage]').forEach(button=>{button.onclick=()=>openCharacters(Number(button.dataset.characterStage),button,Number(button.dataset.characterPlateau)||1);});}
 function charactersHTML(s){return `<div class="arrival-bar"><span>LES PERSONNAGES · ATELIER DE CONTINUITÉ</span><button class="arrival-close" type="button" aria-label="Revenir au passage">×</button></div><div class="arrival-body"><h2 id="charactersTitle" tabindex="-1">De l’autre côté du personnage</h2><p class="arrival-history">Ces voix d’atelier mêlent souvenirs et création littéraire. Elles donnent à entendre les personnages au-delà du passage.</p>${s.workshops.map(p=>`<article><h3>${esc(p.name)}</h3><p class="arrival-reference">Sélection de l’atelier de continuité ${esc(p.atelier)}</p><div class="arrival-excerpt">${p.paragraphs.map(text=>`<p>${esc(text)}</p>`).join('')}</div></article>`).join('')}<button class="arrival-challenge" type="button">← Revenir au passage</button></div>`;}
 let characterDialog=null;
 function openCharacters(n,trigger,plateau=1){
  const stage=getStage(n,plateau);if(!stage?.workshops?.length)return null;if(characterDialog)return characterDialog;
  install();const modal=document.createElement('dialog');modal.id='characterReader';modal.setAttribute('aria-labelledby','charactersTitle');modal.innerHTML=charactersHTML(stage);document.body.append(modal);characterDialog=modal;
  let closed=false;function finish(){if(closed)return;closed=true;characterDialog=null;document.documentElement.classList.remove('characters-reading');modal.remove();trigger?.focus({preventScroll:true});}
  const back=()=>{if(modal.open)modal.close();else finish();};modal.querySelector('.arrival-close').onclick=back;modal.querySelector('.arrival-challenge').onclick=back;modal.addEventListener('close',finish,{once:true});
  try{modal.showModal();document.documentElement.classList.add('characters-reading');modal.scrollTop=0;modal.querySelector('h2').focus({preventScroll:true});}catch{finish();}
  return modal;
 }
 function chapterReaderLabel(level){return level<=3?'CHAPITRE 1 · LA SALLE D’ATTENTE':level<=5?'CHAPITRE 2 · MÊME PAS MAL':'ÉTAPE '+String(level).padStart(2,'0');}
 function reachedReadingEnd(modal,excerpt){
  if(!modal||Number(modal.scrollTop||0)<32)return false;
  const a=typeof modal.getBoundingClientRect==='function'?modal.getBoundingClientRect():null;
  const b=typeof excerpt?.getBoundingClientRect==='function'?excerpt.getBoundingClientRect():null;
  if(a&&b)return b.bottom<=a.bottom-18;
  return Number(modal.scrollTop||0)+Number(modal.clientHeight||0)>=Number(modal.scrollHeight||0)-18;
 }
 function readerHTML(s){return `<div class="arrival-bar"><span>LES TREIZE CHEMINS · ${chapterReaderLabel(s.level)}</span><button class="arrival-close" type="button" aria-label="Fermer le passage">×</button></div><div class="arrival-body"><p class="arrival-kicker">Vous êtes arrivé à</p><h2 id="arrivalTitle" tabindex="-1">${esc(s.city)}</h2><p class="arrival-area">${esc(s.area)}</p><dl class="arrival-facts"><div><dt>GPS</dt><dd>${esc(gps(s.coordinates))}</dd></div><div><dt>Altitude</dt><dd>≈ ${s.altitude} m</dd></div></dl><p class="arrival-note">Coordonnées indicatives · altitude estimée au repère.</p><p class="arrival-history">${esc(s.history)}</p>${s.characters.length?`<ul class="arrival-characters" aria-label="Les personnages de cette étape">${s.characters.map(name=>`<li>${esc(name)}</li>`).join('')}</ul>`:''}${characterButton(s.level,s.plateau||1)}<h3>${esc(s.passage.scene)}</h3><p class="arrival-reference">Extrait du chapitre ${Number(s.passage.chapter)} — <em>« ${esc(s.passage.title)} »</em>, ${esc(s.passage.pageLabel)}.</p><p class="arrival-note">Le titre de ce passage a été choisi pour le jeu.</p><div class="arrival-excerpt">${s.passage.quote.split(/\n\s*\n/).map(p=>`<p>${esc(p)}</p>`).join('')}</div><p class="arrival-reference">${esc(s.passage.source)}</p><details class="arrival-sources"><summary>Repères et sources du lieu</summary><p>Histoire : <a href="${esc(s.historySource.url)}" target="_blank" rel="noopener noreferrer">${esc(s.historySource.label)}</a>.<br>Altitude : <a href="${esc(s.altitudeSource?.url||'https://open-meteo.com/en/docs/elevation-api')}" target="_blank" rel="noopener noreferrer">${esc(s.altitudeSource?.label||'Open-Meteo · Copernicus DEM GLO-90, arrondie à 5 m')}</a>. Le point situe l’étape, sans désigner une adresse privée ni l’emplacement exact de chaque scène.</p></details><button class="arrival-challenge" type="button">Relevez le défi <span aria-hidden="true">→</span></button></div>`;}
 let active=null;
 function openReader(n,{onChallenge=()=>{},plateau=1,autoAdvanceOnEnd=false,onDismiss=()=>{},inlineQuiz=null,onSkip=null}={}){
  const stage=getStage(n,plateau);if(!stage){onChallenge();return null;}if(active)return active;
  install();const modal=document.createElement('dialog');modal.id='arrivalReader';modal.setAttribute('aria-labelledby','arrivalTitle');modal.dataset.level=stage.level;
  if(autoAdvanceOnEnd)modal.dataset.autoplay='scroll';
  modal.innerHTML=readerHTML(stage);document.body.append(modal);active=modal;bindCharacters(modal);
  let finished=false,continueToGame=!autoAdvanceOnEnd,skipInstead=false,scrollTimer=0;
  let quizAnswered=!inlineQuiz,checkEnd=()=>{},quizCard=null;
  if(inlineQuiz&&Array.isArray(inlineQuiz.options)&&inlineQuiz.options.length){
   quizCard=document.createElement('section');quizCard.className='arrival-inline-quiz';
   quizCard.innerHTML='<small>Quiz du chapitre</small><h4>'+esc(inlineQuiz.question||'Question du chapitre')+'</h4>'+
    inlineQuiz.options.map((option,i)=>'<button class="arrival-quiz-answer" type="button" data-answer="'+i+'">'+
      String.fromCharCode(65+i)+' · '+esc(option)+'</button>').join('');
   const excerpt=modal.querySelector('.arrival-excerpt');
   excerpt?.after?.(quizCard);
   quizCard.querySelectorAll('.arrival-quiz-answer').forEach(button=>{
    button.onclick=()=>{
     if(quizAnswered)return;
     quizAnswered=true;
     const index=Number(button.dataset.answer);
     inlineQuiz.onAnswer?.(index);
     quizCard.innerHTML='<p class="arrival-quiz-result">'+
      (index===inlineQuiz.correct?'Bonne réponse.':'Réponse enregistrée. Tu pourras réessayer après le jeu.')+
      ' Le mini-jeu va commencer.</p>';
     if(autoAdvanceOnEnd)checkEnd();
    };
   });
  }
  function finish(){
   if(finished)return;finished=true;if(scrollTimer)clearTimeout(scrollTimer);active=null;
   document.documentElement.classList.remove('arrival-reading');modal.remove();
   if(skipInstead&&typeof onSkip==='function')onSkip();else if(continueToGame)onChallenge();else onDismiss();
  }
  const close=(launch=false,skip=false)=>{skipInstead=skip;continueToGame=launch||!autoAdvanceOnEnd;if(modal.open)modal.close();else finish();};
  modal.querySelector('.arrival-close').onclick=()=>close(false);
  modal.querySelector('.arrival-challenge').onclick=()=>{
   if(!quizAnswered){quizCard?.scrollIntoView?.({block:'center',behavior:'smooth'});return;}
   close(true);
  };
  if(typeof onSkip==='function'){
   const skip=()=>close(false,true);
   const button=document.createElement('button');button.type='button';button.className='arrival-skip';
   button.textContent='Passer le défi et aller à la suite →';button.onclick=skip;
   modal.querySelector('.arrival-challenge')?.after?.(button);
   const top=document.createElement('button');top.type='button';top.className='arrival-skip-top';
   top.textContent='Passer le défi →';top.onclick=skip;
   modal.querySelector('.arrival-close')?.before?.(top);
  }
  modal.addEventListener('close',finish,{once:true});
  if(autoAdvanceOnEnd){
   const excerpt=modal.querySelector('.arrival-excerpt');
   checkEnd=()=>{
    if(finished||characterDialog?.open)return;
    if(!quizAnswered||!reachedReadingEnd(modal,excerpt)){
     if(scrollTimer)clearTimeout(scrollTimer);scrollTimer=0;return;
    }
    if(scrollTimer)return;
    // Let the final sentence remain visible briefly before handing off to the game.
    scrollTimer=setTimeout(()=>{
     scrollTimer=0;
     if(!finished&&quizAnswered&&!characterDialog?.open&&reachedReadingEnd(modal,excerpt))close(true);
    },850);
   };
   modal.addEventListener('scroll',checkEnd,{passive:true});
   modal.querySelector('.arrival-challenge').textContent='Continuer vers le mini-jeu →';
  }
  try{modal.showModal();document.documentElement.classList.add('arrival-reading');modal.scrollTop=0;modal.querySelector('h2').focus({preventScroll:true});}catch{close(true);}
  return modal;
 }
 root.TreizeEscale={getStage,gps,readerHTML,namesHTML,addCharacters,openReader,reachedReadingEnd,chapterReaderLabel,characterButton,bindCharacters,charactersHTML,openCharacters};
 if(typeof document!=='undefined')install();
})(typeof window==='undefined'?globalThis:window);
