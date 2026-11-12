/* Trois chemins : I chapitre 1, II chapitres 2-4, III Les rendez-vous chapitres 4-6. */
(function(){
 'use strict';
 const flow=window.TreizeChapitre1;
 if(!flow||!document.getElementById('boardTargets'))return;
 const $=id=>document.getElementById(id);
 const css=document.createElement('style');
 css.id='chapitre1-board-styles';
 css.textContent="#board{aspect-ratio:auto!important;min-height:0!important;overflow:visible!important;background:linear-gradient(145deg,#f1e2c5,#e6d2ae);padding:13px!important;touch-action:pan-y}\n#board picture{display:none!important}\n#boardTargets{position:relative!important;inset:auto!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}\n#boardTargets .board-target{position:relative!important;inset:auto!important;left:auto!important;top:auto!important;width:100%!important;height:auto!important;min-height:130px;display:flex;flex-direction:column;align-items:flex-start;gap:7px;padding:14px 12px 39px;border-radius:10px;text-align:left;background:linear-gradient(155deg,#fff6df,#edddbc);border:2px solid #c5a679;box-shadow:0 3px 0 #ad8a5c33;color:#4f3c2a;overflow:hidden}\n#boardTargets .board-target:before{content:'';position:absolute;right:-26px;top:-32px;width:95px;height:95px;border:1px solid #ddc29b;border-radius:50%;pointer-events:none}\n#boardTargets .board-target[aria-disabled=true]{opacity:.6;filter:saturate(.6);cursor:not-allowed}\n#boardTargets .board-target[aria-pressed=true]{border-color:#31594c;background:linear-gradient(145deg,#fff4dc,#e6edd8);box-shadow:inset 0 0 0 2px #fff9eb}\n#boardTargets .board-target.done{background:linear-gradient(145deg,#e9efdb,#d1ddc5);border-color:#7e9d76}\n#boardTargets .chapter-featured{grid-column:1/-1;min-height:178px!important;background:linear-gradient(110deg,#32564b 0%,#527768 48%,#739377 100%)!important;border:3px solid #bd995e!important;color:#fff5dc!important;padding:20px 22px!important;display:grid!important;grid-template-columns:minmax(0,1fr) 1.35fr;align-content:center;column-gap:22px;row-gap:9px}\n#boardTargets .chapter-featured[aria-disabled=true]{opacity:1;filter:none}\n#boardTargets .chapter-featured[aria-pressed=true]{box-shadow:inset 0 0 0 2px #f9e6c2,0 3px 12px #102b2355}\n#boardTargets .chapter-featured.done{background:linear-gradient(110deg,#2d584a,#466d54,#70855c)!important}\n#boardTargets .chapter-featured:before{right:-22px;top:-42px;width:230px;height:230px;border:2px solid #f7eaca30}\n#boardTargets .chapter-featured .chapter-card-kicker{color:#f0d6a2}\n#boardTargets .chapter-featured .chapter-card-title{color:#fff9e5;font-size:clamp(24px,3vw,37px)}\n#boardTargets .chapter-featured .chapter-card-place{color:#e3e9d3}\n#boardTargets .chapter-card-kicker{font:700 10px/1.2 'DM Sans',sans-serif;letter-spacing:.13em;text-transform:uppercase;color:#8b6740;position:relative}\n#boardTargets .chapter-card-title{font:700 clamp(19px,2.2vw,25px)/1.06 'Cormorant Garamond',Georgia,serif;position:relative;max-width:100%}\n#boardTargets .chapter-card-place{font:11px/1.4 'DM Sans',sans-serif;color:#836a49;position:relative}\n#boardTargets .chapter-card-route{display:flex;gap:8px;align-items:stretch;flex-wrap:wrap;grid-column:2;grid-row:1 / span 3;align-self:center;position:relative}\n#boardTargets .chapter-card-route > .chapter-part-label{flex:1 1 90px;min-width:0;text-align:center;border:1px solid #eed9ae70;padding:12px 6px;border-radius:7px;background:#1d403749;font:700 11px/1.45 'DM Sans',sans-serif;color:#fff8dc}\n#boardTargets .chapter-card-route > .chapter-part-label.passed{background:#e4eed3;color:#28503d}\n#boardTargets .chapter-card-status{font:600 11px/1.3 'DM Sans',sans-serif;margin-top:auto;color:#dceacf;grid-column:1;position:relative}\n#boardTargets .board-badge{position:absolute;right:8px;bottom:8px;top:auto;z-index:1;width:24px;height:24px;font-size:12px}\n#boardTargets .chapter-featured .board-badge{right:12px;bottom:12px;width:31px;height:31px;font-size:17px}\n#chapter1Sequence{display:flex;gap:7px;flex-wrap:wrap;margin:13px 0;padding:11px;border:1px solid #bbad84;border-radius:8px;background:#f5ecd7}\n#chapter1Sequence .chapter1-part{border:1px solid #bba778;border-radius:5px;background:#fff9ea;color:#52613e;padding:8px 10px;min-height:43px;font:600 12px 'DM Sans',sans-serif;flex:1 1 120px;cursor:pointer}\n#chapter1Sequence .chapter1-part.active{background:#315b49;color:#fff9e2;border-color:#315b49}\n#chapter1Sequence .chapter1-part.passed{border-color:#638869}\n#chapter1Sequence .chapter1-part:disabled{opacity:.46;cursor:not-allowed}\n#chapter1Header{font:700 17px/1.25 'Cormorant Garamond',Georgia,serif;color:#6b5637;margin:0 0 7px}\n#chapter1Header[hidden],#chapter1Sequence[hidden]{display:none!important}\n@media(max-width:760px){#boardTargets{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#boardTargets .board-target{min-height:135px;padding:11px 10px 35px}#boardTargets .chapter-featured{grid-column:1/-1;grid-template-columns:1fr;min-height:195px!important;padding:17px!important}#boardTargets .chapter-card-route{grid-column:1;grid-row:auto;gap:5px}#boardTargets .chapter-card-route > .chapter-part-label{flex:1 1 85px;padding:9px 4px;font-size:10px}}\n@media(max-width:390px){#boardTargets .chapter-card-title{font-size:19px}#boardTargets .chapter-card-route{flex-wrap:wrap}}\n/* Passage illustré entre les deux premières vignettes. */\n#boardTargets .chapter-journey-route{grid-column:1/-1;position:relative;padding:14px 15px 11px;border:1px solid #ac8e5f;border-radius:10px;background:linear-gradient(110deg,#fff7e2,#f1e0bc);color:#59462e;overflow:hidden}\n#boardTargets .chapter-journey-title{font:700 12px/1.35 'DM Sans',sans-serif;letter-spacing:.035em;text-align:center;margin:0 0 12px}\n#boardTargets .chapter-route-stops{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;position:relative;padding:0 3px 3px}\n#boardTargets .chapter-route-stops:before{content:'';position:absolute;left:10%;right:10%;top:8px;border-top:3px dotted #a37540;pointer-events:none}\n#boardTargets .chapter-route-stops:after{content:'';position:absolute;top:1px;left:10%;height:17px;width:17px;border-radius:50%;background:#315c48;border:3px solid #faf0d6;box-shadow:0 0 0 2px #b5884e,0 2px 7px #152c2060;z-index:2;pointer-events:none;animation:chapterTravelDot 7s linear infinite}\n#boardTargets .chapter-route-stop{font:600 10px/1.3 'DM Sans',sans-serif;text-align:center;position:relative;z-index:1;overflow-wrap:break-word}\n#boardTargets .chapter-route-stop:before{content:'';display:block;margin:0 auto 8px;width:14px;height:14px;border:2px solid #a37540;border-radius:50%;background:#fff9e8;box-shadow:0 0 0 2px #fff7e5}\n@keyframes chapterTravelDot{0%{left:10%}100%{left:90%}}\n@media(max-width:760px){#boardTargets .chapter-journey-route{padding:11px 7px}#boardTargets .chapter-journey-title{font-size:11px}#boardTargets .chapter-route-stop{font-size:9px}#boardTargets .chapter-route-stops{gap:2px}}\n@media(prefers-reduced-motion:reduce){#boardTargets .chapter-route-stops:after{animation:none;left:10%}}";
 css.textContent+=`
#boardTargets .chapter-card-main{grid-column:1;grid-row:1 / span 2;display:flex;flex-direction:column;align-items:flex-start;gap:9px;width:100%;min-height:85px;padding:0;margin:0;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;position:relative;touch-action:manipulation}
#boardTargets .chapter-card-main:focus-visible,#boardTargets .chapter-card-route button.chapter-part-label:focus-visible{outline:3px solid #fff1b4;outline-offset:3px}
#boardTargets .chapter-card-main:hover .chapter-card-title{text-decoration:underline}
#boardTargets .chapter-featured[data-active=true]{box-shadow:inset 0 0 0 2px #f9e6c2,0 3px 12px #102b2355}
#boardTargets .chapter-card-route button.chapter-part-label{cursor:pointer;min-height:44px;touch-action:manipulation}
#boardTargets .chapter-card-route button.chapter-part-label:disabled{opacity:.55;cursor:not-allowed}
@media(max-width:760px){#boardTargets .chapter-card-main{grid-row:auto}}
`;
 css.textContent+=`
#boardTargets .step-chapters{grid-template-columns:minmax(0,1fr) 1.35fr;gap:9px 22px}
#boardTargets .step-chapters .chapter-card-route{grid-column:2;grid-row:1 / span 3;display:flex;align-items:stretch;flex-wrap:wrap;gap:8px}
#boardTargets .step-chapters .chapter-literary-part{flex:1 1 90px;min-width:0;min-height:113px;display:flex;flex-direction:column;align-items:center;gap:5px;padding:10px 6px;text-align:center}
#boardTargets .chapter-part-number{font:700 9px/1.25 'DM Sans',sans-serif;letter-spacing:.07em;color:#f0d6a2}
#boardTargets .chapter-part-title{font:700 clamp(14px,1.4vw,19px)/1.12 'Cormorant Garamond',Georgia,serif;color:#fff9e5;overflow-wrap:anywhere}
#boardTargets .chapter-part-game{font:600 11px/1.3 'DM Sans',sans-serif;color:#e2e8d6}
#boardTargets .chapter-part-state{font:600 9px/1.3 'DM Sans',sans-serif;margin-top:auto;padding-top:5px}
#boardTargets .chapter-literary-part.passed .chapter-part-number,#boardTargets .chapter-literary-part.passed .chapter-part-title,#boardTargets .chapter-literary-part.passed .chapter-part-game,#boardTargets .chapter-literary-part.passed .chapter-part-state{color:#28503d}
#chapter1Sequence .chapter1-part .chapter-sequence-title{display:block;line-height:1.4}
#chapter1Sequence .chapter1-part .chapter-sequence-game{display:block;font-size:10px;font-weight:400;line-height:1.4;margin-top:4px}
@media(max-width:760px){#boardTargets .step-chapters{grid-template-columns:1fr}#boardTargets .step-chapters .chapter-card-route{grid-column:1;grid-row:auto;gap:5px}}
@media(max-width:390px){#boardTargets .step-chapters .chapter-literary-part{padding:9px 3px;min-height:123px}#boardTargets .step-chapters .chapter-part-title{font-size:14px}}
`;
 css.textContent+=`
#boardTargets .rendezvous-card .chapter-literary-part:not(.passed) .chapter-part-state{color:#e1dcc9}
#boardTargets .rendezvous-card[aria-disabled=true] .chapter-card-title{color:#fff9e5}
#rendezvousDialog{position:fixed;inset:0;box-sizing:border-box;width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;margin:0;padding:0;border:0;border-radius:0;background:#fff9ed;color:#283b36;overflow:auto;overscroll-behavior:contain;text-align:left}
#rendezvousDialog::backdrop{background:#19332cd9}
#rendezvousDialog .rendezvous-top{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:15px;padding:13px clamp(14px,3vw,36px);background:#263e3a;color:#fff3dc;font:600 12px/1.4 'DM Sans',sans-serif;border:0}
#rendezvousDialog .rendezvous-top strong{font:600 12px/1.4 'DM Sans',sans-serif}
#rendezvousDialog .rendezvous-top button{border:1px solid #c9b28b;background:transparent;color:#fff3dc;min-width:44px;min-height:44px;border-radius:4px;font-size:17px;cursor:pointer;padding:8px 12px}
#rendezvousDialog .rendezvous-content{max-width:790px;margin:0 auto;padding:clamp(24px,4vw,55px) clamp(20px,5vw,64px) 90px}
#rendezvousDialog .rendezvous-kicker{font:600 12px/1.5 'DM Sans',sans-serif;text-transform:uppercase;letter-spacing:.14em;color:#88673d;margin:0 0 8px}
#rendezvousDialog h2{font:600 clamp(32px,5vw,47px)/1.08 'Cormorant Garamond',Georgia,serif;margin:0 0 9px}
#rendezvousDialog .rendezvous-area{font:16px/1.6 'DM Sans',sans-serif;margin:0 0 18px}
#rendezvousDialog .rendezvous-reference{font:14px/1.6 'DM Sans',sans-serif;margin:0 0 6px}
#rendezvousDialog .rendezvous-excerpt{font:clamp(20px,2.15vw,25px)/1.86 Georgia,serif;letter-spacing:.005em;margin:30px 0 40px;white-space:normal;background:none;border:0;padding:0}
#rendezvousDialog .rendezvous-excerpt p{margin:0 0 1.1em}
#rendezvousDialog .rendezvous-excerpt p:last-child{margin-bottom:0}
#rendezvousDialog .rendezvous-future{margin:20px auto 0;padding:24px;border:1px solid #b7a179;background:#eee6d3;border-radius:9px;font:14px/1.6 'DM Sans',sans-serif}
#rendezvousDialog .rendezvous-future strong{display:block;font:700 21px/1.35 Georgia,serif;margin-bottom:8px;color:#324d42}
#rendezvousDialog .rendezvous-part-nav{max-width:650px;margin:32px auto 0}
@media(max-width:600px){#rendezvousDialog .rendezvous-content{padding:25px 20px 78px}#rendezvousDialog .rendezvous-excerpt{font-size:20px;line-height:1.8}#rendezvousDialog .rendezvous-top{font-size:11px;padding:11px 12px}#rendezvousDialog .rendezvous-top strong{font-size:11px}#rendezvousDialog .rendezvous-top button{font-size:12px}}
`;
 css.textContent+=`
#boardTargets .mini-atlas-card{grid-column:1/-1;min-width:0;padding:11px 12px 8px;overflow:hidden}
#boardTargets .mini-atlas-card .chapter-journey-title{margin:0 0 7px;text-align:left}
#boardTargets .mini-atlas-map{height:185px;min-height:185px;border:1px solid #b29a72;border-radius:7px;overflow:hidden;background:#e5e4d7;position:relative;isolation:isolate}
#boardTargets .mini-atlas-caption{font:10px/1.35 'DM Sans',sans-serif;color:#78644c;margin:6px 0 0}
#boardTargets .mini-atlas-map .leaflet-container{background:#e5e4d7}
#boardTargets .mini-atlas-map .leaflet-control-attribution{font-size:8px;background:#fff9ebc9}
#boardTargets .mini-atlas-map .mini-atlas-label{background:#fff8e9e8;color:#294a3d;border:1px solid #b79b68;padding:2px 5px;border-radius:5px;white-space:nowrap;font:700 10px/1.2 'DM Sans',sans-serif;box-shadow:0 1px 4px #13281d40}
#boardTargets .mini-atlas-map .mini-atlas-walker{width:36px;height:49px;filter:drop-shadow(0 3px 3px #203b2b99)}
#boardTargets .mini-atlas-map .mini-atlas-walker svg{width:36px;height:49px;display:block}
@media(max-width:600px){#boardTargets .mini-atlas-map{height:165px;min-height:165px}#boardTargets .mini-atlas-card{padding:9px 8px}}
`;
 document.head.append(css);
 $('board').setAttribute('aria-label','Trois chemins : I La salle d’attente, II Le météore, III Les rendez-vous.');
 const intro=document.querySelector('.board-intro');
 if(intro)intro.textContent='Chemin I · La salle d’attente ; chemin II · Le météore ; chemin III · Les rendez-vous (Camarades !, Cyrano et un troisième chapitre en préparation).';
 const header=document.createElement('div');header.id='chapter1Header';
 const sequence=document.createElement('nav');sequence.id='chapter1Sequence';sequence.setAttribute('aria-label','Trois parties du chapitre 1');
 $('questTitle').before(header);$('gameEntry').before(sequence);
 const chapterName='Chapitre 1 — « La salle d’attente »';
 const chapterTwoName='Chapitre 2 — « Même pas mal »';
 const secondBlockName='Chemin II · Le météore';
 const thirdBlockName='Chemin III · Les rendez-vous';
 const thirdParts=Object.freeze([
  {chapter:4,title:'Le drapeau rouge',scene:'Strasbourg · La prison',game:'jeu-yoyo.html'},
  {chapter:5,title:'Passe-muraille',scene:'Cyrano · La planche vivante',game:'jeu-cyrano-bd.html'},
  {chapter:6,title:'Tu veux bien t’occuper de moi ?',scene:'Scène à sélectionner'}
 ]);
 const thirdExtract=["Julie est devant la télévision. Elle se retourne vers moi.","— T’es pas au courant ?","— Au courant de quoi ?","— Jean-Marie Le Pen est au deuxième tour.","Je reste là, effondré. Je n’étais pas particulièrement politisé, mais ce scénario me paraissait impossible. Je rentre chez moi. Impossible de dormir. Ça tourne à deux cents à l’heure dans ma tête. Qu’est-ce qui s’est passé ? Est-ce que mon pays est devenu à ce point facho sans que je m’en rende compte ? Ça ne colle pas avec ce que je vis. On ne m’attaque pas dans la rue. Je travaille. Je rencontre des gens. Je traverse Paris toute la journée. Ce n’est pas possible. Mais cette nuit-là, c’est comme ça que je la vivais. Et puisque je ne pouvais pas dormir, j’ai décidé de marcher. J’ai marché sans savoir exactement où j’allais.","Mes pas m’ont doucement conduit vers la place de la République. Au loin, j’aperçois un type avec un drapeau rouge. Il a l’air d’être à peu près dans le même état que moi. Lui non plus, visiblement, n’a pas réussi à aller se coucher. Il va quelque part. Alors je décide de le suivre. Son drapeau rouge, en revanche, ce n’est vraiment pas le mien. Moi, je suis un ancien militaire, fils d’un ancien militaire, serveur devenu chauffeur-livreur. Alors, quand j’aperçois un drapeau français sur le fronton d’une école, j’escalade ce qu’il faut pour le récupérer et le brandir à mon tour. Et nous voilà partis. Lui avec son drapeau rouge.","Quand j’arrive place de la République avec mon drapeau français, je découvre que des milliers de personnes ont eu la même idée. Les téléphones circulent. Des textos appellent au rassemblement :","« Rendez-vous République » et « Rendez-vous Bastille ». ","Et puis, à un moment, je ne sais absolument pas ce qui me prend. Je grimpe sur la statue de la République. Un autre rassemblement se forme à Bastille. Je décide d’aller le rejoindre. Il faut maintenant l’expliquer aux gens. Alors je crie :","— Camarades !","Le mot me surprend moi-même. Camarades ? Je n’ai jamais appelé personne « camarade » de ma vie. À ma surprise, les gens se taisent et m’écoutent. Il y a là peut-être deux mille personnes. Du haut de la statue, je leur annonce que le rassemblement de Bastille nous attend et leur propose de partir le rejoindre. La foule se met en mouvement et devient un cortège. Nous prenons la direction de Bastille.","Là-bas, les autres ont eu la même idée : ils viennent vers nous. Les deux cortèges se rencontrent à mi-chemin. Et là, quelque chose se produit.","Ce qui, quelques heures auparavant, ressemblait à une tragédie se transforme soudain en fête. Les gens sont heureux de se retrouver et d’être sortis de chez eux. Ils ne sont plus seuls devant leur télévision, sidérés. Nous sommes maintenant des milliers à nous regarder avec, au fond, quelque chose d’assez simple à nous dire : Toi aussi, tu es venu. La fête dure. Comme j’avais pris la parole sur la statue et que j’étais assez facilement reconnaissable avec ma casquette de Poulbot, à la Gavroche, une dizaine de personnes viennent vers moi.","— On va où maintenant ?","Intérieurement, je suis effaré. Pourquoi moi ? Je suis arrivé à Paris quelques mois plus tôt. Je connais tellement mal la ville que je me perds encore avec mon camion de chauffeur-livreur. Mais je ne me démonte pas. Je tends le bras.","— Par là.","Et nous partons par là. Voilà, à peu près, comment je suis devenu l’un des visages de ce mouvement parisien. Très vite, les journalistes arrivent. Ils demandent qui ils doivent interviewer. Les gens me désignent. Je ressens alors quelque chose qui ressemble à une mission. Comme citoyen. Comme patriote. Comme ancien militaire. Un Arabe avec une casquette de Gavroche, un drapeau français à la main, au milieu d’une manifestation contre le Front national. Ce drapeau était le mien, à cause de mon histoire, de celle de mon père et de mon passage dans l’armée. Ensuite, tout s’est emballé. Une sorte de boule de neige médiatique."];
 const reader=document.createElement('dialog');
 reader.id='rendezvousDialog';reader.setAttribute('aria-label','Chemin III — Les rendez-vous, chapitre 4');
 const readerBar=document.createElement('div');readerBar.className='rendezvous-top';
 const readerHeading=document.createElement('strong');readerHeading.textContent='LES TREIZE CHEMINS · CHEMIN II · CHAPITRE 4 — « DRAPEAU ROUGE »';
 const readerClose=document.createElement('button');readerClose.type='button';readerClose.textContent='Retour au plateau ×';
 readerBar.append(readerHeading,readerClose);
 const readerBody=document.createElement('div');readerBody.className='rendezvous-content';
 const readerKicker=document.createElement('p');readerKicker.className='rendezvous-kicker';readerKicker.textContent='Vous êtes arrivé à';
 const readerTitle=document.createElement('h2');readerTitle.textContent='République–Bastille';
 const readerArea=document.createElement('p');readerArea.className='rendezvous-area';readerArea.textContent='Paris · avril 2002';
 const readerReference=document.createElement('p');readerReference.className='rendezvous-reference';readerReference.textContent='Extrait du chapitre 4 — « Drapeau rouge », p. 59–60.';
 const excerpt=document.createElement('div');excerpt.className='rendezvous-excerpt';
 for(const paragraph of thirdExtract){const el=document.createElement('p');el.textContent=paragraph;excerpt.append(el);}
 const future=document.createElement('div');future.className='rendezvous-future';
 const futureTitle=document.createElement('strong');futureTitle.textContent='Jeu 3 / 3 — Camarades !';
 const futureBody=document.createElement('p');futureBody.textContent='Trois épreuves de 10 points : trouver le drapeau, mobiliser la République et réunir les cortèges. Le jeu s’ouvre après la lecture, en descendant jusqu’au bas de l’extrait.';
 future.append(futureTitle,futureBody);
 readerBody.append(readerKicker,readerTitle,readerArea,readerReference,excerpt,future);reader.append(readerBar,readerBody);document.body.append(reader);
 readerClose.onclick=()=>reader.close();
 reader.addEventListener('close',()=>{const b=$('boardTargets').querySelector('[data-chemin="3"]');if(b)b.dataset.active='false';b?.querySelector('.chapter-card-main')?.focus({preventScroll:true});});
 function openThirdPath(){
  if(!flow.chapter2Done(state)||boardRolling)return;
  const card=$('boardTargets').querySelector('[data-chemin="3"]');
  if(card)card.dataset.active='true';
  if(!reader.open)reader.showModal();
  reader.scrollTop=0;readerClose.focus({preventScroll:true});
 }
 window.TreizeRendezVous={open:openThirdPath,parts:thirdParts};

 const pathNumeral=n=>['I','II','III','IV','V','VI','VII','VIII','IX','X'][n-1]||String(n);
 const icons=['🌳','🪖'];
 const captions=['🌿 Les Marmousets','🎧 Le lycée','🌳 Barcelone'];
 const chapterTwoCaptions=['🪖 Sarajevo','🕺 Le danseur','📣 Camarades !'];
 const makeSpan=(name,label)=>{const el=document.createElement('span');el.className=name;el.textContent=label;return el;};
 function openChapterOnePart(part){
  if(boardRolling)return;
  const n=flow.chapter1SceneForSelection(state,part);
  if(n===null)return;
  window.TreizeSceneNavigation?.cancelAutomatic?.();
  arriveAtStage(n);
 }
 function openChapterTwoPart(part){
  if(boardRolling||!Number.isInteger(part)||part<1||part>3)return;
  const n=part===1?4:5;
  if(!flow.canEnter(state,n)||(part===3&&!flow.chapter2PartDone(state,2)))return;
  window.TreizeSceneNavigation?.cancelAutomatic?.();
  if(part===1){arriveAtStage(4);return;}
  if(part===3){window.TreizeRendezVous?.openManifestation?.();return;}
  window.TreizePlateauxNavigation?.openPart?.('dance');
 }
 function paintTargets(){
  const host=$('boardTargets'),current=state.selected<=3?1:state.selected<=5?4:state.selected;
  if(host.dataset.mode!=='chapters-grouped-v2'){
   host.dataset.mode='chapters-grouped-v2';
   host.replaceChildren(...flow.CARDS.map((scene,i)=>{
    // Chaque chemin est un groupe de trois boutons, jamais un bouton contenant d'autres boutons.
    const button=document.createElement('div');
    button.className='board-target'+(scene===1||scene===4?' chapter-featured':'')+(scene===4?' step-chapters':'');
    button.dataset.level=String(scene);button.dataset.chapter=String(i+1);
    button.setAttribute('role','group');
    const main=document.createElement('button');main.type='button';main.className='chapter-card-main';button.append(main);
    main.append(
     makeSpan('chapter-card-kicker','CHEMIN '+pathNumeral(i+1)+(scene===1?' · CHAPITRE 1':'')),
     makeSpan('chapter-card-title',scene===1?'La salle d’attente':scene===4?'Le météore':LEVELS[scene-1].title),
     makeSpan('chapter-card-place',scene===1?'Ferney-Voltaire · La Roche-sur-Foron · Barcelone':scene===4?'Trois extraits, une même étape de jeu.':LEVELS[scene-1].place)
    );
    if(scene===1||scene===4){
     const route=document.createElement('div');route.className='chapter-card-route';
     if(scene===1){
      for(let part=1;part<=3;part++){
       const tile=document.createElement('button');tile.type='button';
       tile.className='chapter-part-label';tile.dataset.part=String(part);
       tile.textContent=captions[part-1];
       tile.onclick=()=>openChapterOnePart(part);
       route.append(tile);
      }
      button.append(route,makeSpan('chapter-card-status','0 / 3 jeux terminés'));
     }else{
      for(const p of flow.CHAPTER2_PARTS){
       const tile=document.createElement('button');tile.type='button';
       tile.className='chapter-part-label chapter-literary-part';
       tile.dataset.chapterTwoPart=String(p.part);
       tile.onclick=()=>openChapterTwoPart(p.part);
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
    const openMain=()=>{
     if(boardRolling)return;
     const n=scene===1?flow.chapter1SceneForSelection(state):
      scene===4?(flow.chapter2Done(state)?4:flow.chapter2PartDone(state,1)?5:4):scene;
     if(!flow.canEnter(state,n))return;
     window.TreizeSceneNavigation?.cancelAutomatic?.();
     // Le titre du chemin reprend le parcours ; chaque étiquette ouvre son jeu exact.
     arriveAtStage(n);
    };
    main.onclick=openMain;
    return button;
   }));
   // Deux cartes de liaison : lieux du récit hors des trois jeux principaux.
   const makeInterlude=(kind,title,description)=>{
    const card=document.createElement('section');
    card.className='chapter-journey-route mini-atlas-card';
    card.dataset.miniAtlas=kind;
    card.setAttribute('role','region');
    card.setAttribute('aria-label',description);
    const heading=document.createElement('p');heading.className='chapter-journey-title';heading.textContent=title;
    const map=document.createElement('div');map.className='mini-atlas-map';map.dataset.route=kind;
    map.setAttribute('aria-label',description);
    const note=document.createElement('p');note.className='mini-atlas-caption';
    note.textContent='Étapes du récit hors des jeux · tracé géographique indicatif, non GPS';
    card.append(heading,map,note);
    return card;
   };
   host.querySelector('[data-chapter="1"]').after(makeInterlude('one-two',
    'Entre les chemins I et II · De Barcelone à Sarajevo',
    'Carte animée : Barcelone, Ferney-Voltaire, Vannes, Poitiers et Sarajevo'));
   const third=document.createElement('div');third.setAttribute('role','group');third.tabIndex=-1;
   third.className='board-target chapter-featured step-chapters rendezvous-card';
   third.dataset.chemin='3';third.id='chemin-iii';
   const thirdMain=document.createElement('button');thirdMain.type='button';thirdMain.className='chapter-card-main';
   thirdMain.append(makeSpan('chapter-card-kicker','CHEMIN III'),
    makeSpan('chapter-card-title','Les rendez-vous'),
    makeSpan('chapter-card-place','Trois chapitres · Trois jeux narratifs'));
   thirdMain.onclick=()=>window.TreizeRendezVous?.open?.();
   const thirdRoute=document.createElement('div');thirdRoute.className='chapter-card-route';
   for(let i=0;i<thirdParts.length;i++){
    const p=thirdParts[i];const tile=document.createElement('button');tile.type='button';
    tile.className='chapter-part-label chapter-literary-part';tile.dataset.rendezvousPart=String(i+1);
    tile.append(makeSpan('chapter-part-number','CHAPITRE '+p.chapter),
     makeSpan('chapter-part-title','« '+p.title+' »'),
     makeSpan('chapter-part-game',i===0?'🔒 La prison':i===1?'💌 Cyrano':'❤️ Rencontre'),
     makeSpan('chapter-part-state',i===0?'Jeu 1 / 3':'Jeu '+(i+1)+' / 3'));
    tile.onclick=()=>window.TreizeRendezVous?.open?.(i+1);
    thirdRoute.append(tile);
   }
   third.append(thirdMain,thirdRoute,makeSpan('chapter-card-status','À découvrir après le chemin II'),makeSpan('board-badge','✦'));
   host.append(makeInterlude('two-three',
    'Entre les chemins II et III · Du retour de Sarajevo à la prison',
    'Carte animée : Sarajevo, Genève, Lyon, Louvain-la-Neuve, Paris et Strasbourg'));
   host.append(third);
  }
  for(const button of host.querySelectorAll('[data-chapter]')){
   const n=Number(button.dataset.level),i=Number(button.dataset.chapter);
   const finished=n===1?flow.done(state):n===4?flow.chapter2Done(state):state.completed.includes(n);
   const allowed=n===1||flow.canEnter(state,n),active=n===current;
   button.classList.toggle('done',finished);
   button.setAttribute('aria-disabled',String(!allowed));
   if(n===1||n===4){
    button.dataset.active=String(active);
    button.tabIndex=-1;
    const main=button.querySelector('.chapter-card-main');
    main.disabled=!allowed||!!boardRolling;
    main.setAttribute('aria-label',n===1?'Reprendre le chemin I · '+flow.PARTS[flow.nextPart(state)-1].title:
     'Reprendre le chemin II · '+flow.CHAPTER2_PARTS[flow.chapter2NextPart(state)-1].title);
   }else{
    button.setAttribute('aria-pressed',String(active));
    button.tabIndex=allowed?0:-1;
   }
   button.setAttribute('aria-label',n===1?chapterName+' · '+flow.scenePassedCount(state)+'/3 scènes terminées':
    n===4?secondBlockName+' · '+flow.CHAPTER2_PARTS.map(p=>'Chapitre '+p.chapter+' — '+p.chapterTitle).join(' ; ')+' · '+flow.CHAPTER2_PARTS.filter(p=>flow.chapter2PartDone(state,p.part)).length+'/3 scènes terminées':
    'Chemin '+pathNumeral(i)+' — '+LEVELS[n-1].title+(finished?' terminé':!allowed?' verrouillé':''));
   if(n===1){
    button.querySelector('.chapter-card-status').textContent=finished?
     (flow.chapterHasSkips(state,1)?'↷ Les trois scènes sont parcourues':'✓ Les trois scènes sont réussies'):
     flow.scenePassedCount(state)+' / 3 scènes parcourues · ouvrir pour continuer';
    for(const badge of button.querySelectorAll('[data-part]')){
     const p=Number(badge.dataset.part);
     badge.classList.toggle('passed',flow.partDone(state,p));
     badge.disabled=!!boardRolling||!flow.canEnter(state,p);
     badge.setAttribute('aria-label',(flow.partDone(state,p)?'Rejouer ':'Jouer ')+flow.PARTS[p-1].title);
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
      badge.disabled=!!boardRolling||!flow.canEnter(state,part===1?4:5)||
       (part===3&&!flow.chapter2PartDone(state,2));
      badge.setAttribute('aria-label',(flow.chapter2PartDone(state,part)?'Rejouer ':'Jouer ')+
       'au chapitre '+flow.CHAPTER2_PARTS[part-1].chapter+' · '+flow.CHAPTER2_PARTS[part-1].title);
      const skipped=part===3?Boolean(state.rdvManifestationSkipped):flow.wasSkipped(state,part===1?'4':'5:dance');
      badge.querySelector('.chapter-part-state').textContent='Jeu '+part+' / 3'+(skipped?' · ↷ parcouru':flow.chapter2PartDone(state,part)?' · ✓ réussi':'');
     }
    }
    button.querySelector('.board-badge').textContent=finished?'✓':icons[i-1];
   }
  }
  const third=$('boardTargets').querySelector('[data-chemin="3"]');
  if(third){
   const allowed=flow.chapter2Done(state);
   third.setAttribute('aria-disabled',String(!allowed));
   third.dataset.active=String(reader.open);
   third.setAttribute('aria-label',thirdBlockName+' · Chapitres 4, 5 et 6 · '+(allowed?'Lire la première bonne feuille':'À découvrir après le chemin II'));
   third.tabIndex=-1;
   third.querySelector('.chapter-card-main').disabled=!allowed||!!boardRolling;
   third.querySelector('.chapter-card-status').textContent=allowed?
    'La prison disponible · puis Cyrano et Rencontre':'À découvrir après le chemin II';
  }
  const n=state.selected;
  const canContinue=n<=3?flow.partDone(state,n):n===4?flow.chapter2PartDone(state,1):n===5?flow.chapter2Done(state):state.completed.includes(n);
  const mayTravel=canContinue&&n<13;
  $('boardRoll').hidden=!mayTravel;
  $('boardRoll').disabled=!!boardRolling;
  $('boardRoll').textContent=n<=2?'Partie suivante du chapitre →':
   n===3?'Vers le chapitre 2 →':n===4?'Continuer : Le danseur →':
   n===5?'Chemin III · La prison →':'Étape suivante →';
  $('boardRoll').onclick=()=>rollTravel(state.selected);
  $('travelHint').textContent=flow.done(state)&&n<=3?'Les trois jeux du chapitre 1 sont terminés. Sarajevo ouvre le chapitre 2.':
   n<=3?flow.scenePassedCount(state)+'/3 scènes terminées · Un seul chapitre.':
   n<=5?flow.CHAPTER2_PARTS.filter(p=>flow.chapter2PartDone(state,p.part)).length+'/3 jeux terminés · Chapitres 2, 3 et 4, dans le même chemin.':
   mayTravel?'Le chemin est terminé. Les dés et la carte accompagnent la suite.':
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
  if(n===5&&flow.chapter2Done(state)){window.TreizeRendezVous?.open?.();return;}
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
  const count=Number(flow.done(state))+Number(flow.chapter2Done(state)); // Le troisième chemin reste en construction.
  if($('shared-progress'))$('shared-progress').textContent='✦ '+count+' / 3 chemins · '+state.points+' points';
  $('count').textContent=count+'/3';
  $('stage').textContent=pathNumeral(flow.chapter2Done(state)?3:flow.done(state)?2:1);
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
   $('levelTag').textContent='CHEMIN I · CHAPITRE 1 · JEU '+n+' / 3';
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
   sequence.setAttribute('aria-label','Chemin II : extraits des chapitres 2, 3 et 4');
   const secondDone=flow.chapter2PartDone(state,2);
   const activePart=n===4?1:secondDone?3:2;
   const activeChapter=flow.CHAPTER2_PARTS[activePart-1];
   header.textContent='Chapitre '+activeChapter.chapter+' — « '+activeChapter.chapterTitle+' »';
   $('levelTag').textContent='CHEMIN II · JEU '+activePart+' / 3';
   $('questTitle').textContent=n===4?'Sarajevo':secondDone?'Camarades !':'Le danseur';
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
   $('next').textContent=n===4?'Chapitre 3 — Le coup du bus →':'Chemin III — Les rendez-vous →';
   $('mobileNext').textContent=$('next').textContent;
   if(finished)$('mobileGameDock').hidden=false;
   if(n===4&&!finished)
    $('status').textContent='Jeu 1 / 3 · Chapitre 2 — Même pas mal : franchis Sarajevo pour poursuivre dans le même chemin.';
   if(n===5&&!flow.chapter2Done(state)){
    $('status').textContent=secondDone?
     'Jeu 3 / 3 · Chapitre 4 — Le drapeau rouge : rejoins Camarades ! pour achever le chemin II.':
     'Jeu 2 / 3 · Chapitre 3 — Le coup du bus : réussis la danse pour poursuivre vers le chapitre 4, dans le même chemin.';
   }
  }else{
   $('levelTag').textContent='CHEMIN '+pathNumeral(flow.chapterOf(n))+' · EN PRÉPARATION';
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
