/* Chemin III — mêmes principes que les autres jeux :
 * bonne feuille plein écran, jeu en iframe, messages de session,
 * 3 × 10 points une seule fois, retour/suivant, sauvegarde partagée.
 */
(function(){
 'use strict';
 const app=window.TreizeRendezVous,flow=window.TreizeChapitre1,$=id=>document.getElementById(id);
 if(!app||!flow||!$('rendezvousDialog'))return;
 const reader=$('rendezvousDialog'),title=reader.querySelector('h2'),excerpt=reader.querySelector('.rendezvous-excerpt');
 const readerHeading=reader.querySelector('.rendezvous-top strong');
 const firstExcerpt=Array.from(excerpt.querySelectorAll('p'),p=>p.textContent);
 const putExcerpt=paragraphs=>excerpt.replaceChildren(...paragraphs.map(text=>{
  const p=document.createElement('p');p.textContent=text;return p;
 }));
 const kicker=reader.querySelector('.rendezvous-kicker'),info=reader.querySelector('.rendezvous-future');
 const readerArea=reader.querySelector('.rendezvous-area'),readerReference=reader.querySelector('.rendezvous-reference');
 const infoHeading=info.querySelector('strong'),infoBody=info.querySelector('p');
 const parts=app.parts;
 let activePart=1,autoTimer=0,autoLaunched=false,loading=false;
 const dialog=document.createElement('dialog');dialog.id='manifestationDialog';
 dialog.setAttribute('aria-label','Chemin II — Chapitre 4 — Camarades !');
 dialog.innerHTML='<div class="arcade-dialog-bar"><strong>CHEMIN II · CHAPITRE 4 · CAMARADES !</strong><button type="button" id="manifestationClose">Retour au plateau ×</button></div><iframe id="manifestationFrame" title="Camarades ! — Manifestation République Bastille" allow="autoplay; fullscreen" allowfullscreen></iframe><div class="arcade-under-actions" role="group" aria-label="Navigation de Camarades !"><button class="arcade-return" id="manifestationBack">← Retour au plateau</button><button class="arcade-following" id="manifestationNext">Suivant →</button></div>';
 document.body.append(dialog);
 const frame=$('manifestationFrame');
 // Chemin III, chapitre 5 : publication de la planche photographique validée,
 // avec une session distincte du jeu de manifestation.
 const cyranoDialog=document.createElement('dialog');cyranoDialog.id='cyranoDialog';
 cyranoDialog.setAttribute('aria-label','Chemin III — Chapitre 5 — Cyrano, la planche vivante');
 cyranoDialog.innerHTML='<div class="arcade-dialog-bar"><strong>CHEMIN III · CHAPITRE 5 · CYRANO — LA PLANCHE VIVANTE</strong><button type="button" id="cyranoClose">Retour au plateau ×</button></div><iframe id="cyranoFrame" title="Cyrano : bande dessinée interactive et trois lettres d’amour" allow="microphone; autoplay" loading="lazy"></iframe><div class="arcade-under-actions" role="group" aria-label="Navigation de Cyrano"><button class="arcade-return" id="cyranoBack">← Retour au plateau</button><button class="arcade-following" id="cyranoNext">Suivant →</button></div>';
 document.body.append(cyranoDialog);
 const cyranoFrame=$('cyranoFrame');
 let cyranoLoading=false;
 let rencontreLoading=false;
 const rencontreDialog=document.createElement('dialog');
 rencontreDialog.id='rencontreDialog';rencontreDialog.setAttribute('aria-label','Chemin III — Chapitre 6 — Tu veux bien t’occuper de moi ?');
 rencontreDialog.innerHTML='<div class="arcade-dialog-bar"><strong>CHEMIN III · CHAPITRE 6 · TU VEUX BIEN T’OCCUPER DE MOI ?</strong><button type="button" id="rencontreClose">Retour au plateau ×</button></div><iframe id="rencontreFrame" title="Tu veux bien t’occuper de moi ? — parcours interactif" allow="autoplay; fullscreen" allowfullscreen></iframe>';
 document.body.append(rencontreDialog);
 const rencontreFrame=$('rencontreFrame');
 const rencontreStyle=document.createElement('style');
 rencontreStyle.textContent='#rencontreDialog{padding:0;width:min(1180px,98vw);height:96dvh;max-width:98vw;max-height:96dvh;border:2px solid #b68e54;border-radius:9px;overflow:hidden;background:#1b352b;color:#fff6df;box-shadow:0 24px 80px #0008}#rencontreDialog[open]{display:flex;flex-direction:column}#rencontreDialog::backdrop{background:#0c201de0}#rencontreDialog .arcade-dialog-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;background:#203d33;border-bottom:1px solid #a9926d;font-size:12px}#rencontreDialog .arcade-dialog-bar button{min-height:42px;border:1px solid #bba27b;border-radius:6px;padding:9px 14px;background:#33564a;color:#fff7e5;cursor:pointer}#rencontreFrame{width:100%;height:100%;flex:1;min-height:0;border:0;background:#f3e5c9}@media(max-width:700px){#rencontreDialog{width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;border:0;border-radius:0}#rencontreDialog .arcade-dialog-bar{padding:7px 9px;font-size:10px}#rencontreDialog .arcade-dialog-bar button{padding:8px}}';
 document.head.append(rencontreStyle);
 function openRencontreDialog(){
  if(!flow.chapter2Done(state)||!cyranoTraversed())return;
  clearTimeout(autoTimer);autoTimer=0;autoLaunched=true;
  if(reader.open)reader.close();
  if(!rencontreDialog.open)rencontreDialog.showModal();
  if(!rencontreLoading){rencontreLoading=true;rencontreFrame.src='jeu-rencontre.html?embedded=1';}
 }
 function closeRencontreDialog(){if(rencontreDialog.open)rencontreDialog.close();rencontreFrame.removeAttribute('src');rencontreLoading=false;render();$('chemin-iii')?.querySelector('.chapter-card-main')?.focus({preventScroll:true});}
 addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==rencontreFrame.contentWindow||!rencontreDialog.open||!e.data||e.data.type!=='rencontre:state')return;
  const step=Number(e.data.step);
  if(!Number.isInteger(step)||step<0||step>7||typeof e.data.complete!=='boolean'||typeof e.data.ended!=='boolean')return;
  state.rdvRencontreStage=step;
  if(e.data.complete){state.rdvRencontreFinished=true;state.rdvRencontreSkipped=false;}
  else if(e.data.ended&&!state.rdvRencontreFinished){state.rdvRencontreSkipped=true;}
  save();render();
 });
 $('rencontreClose').onclick=closeRencontreDialog;
 rencontreDialog.addEventListener('cancel',e=>{e.preventDefault();closeRencontreDialog();});
 const style=document.createElement('style');
 style.textContent='#manifestationDialog{padding:0;width:min(1220px,98vw);height:98dvh;max-width:98vw;max-height:98dvh;border:2px solid #b68e54;border-radius:10px;background:#172b29;color:#faeed7;overflow:hidden}#manifestationDialog[open]{display:flex;flex-direction:column}#manifestationDialog::backdrop{background:#0c201de0}#manifestationDialog .arcade-dialog-bar{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:9px 15px;font-size:12px;border-bottom:1px solid #b6a27e}#manifestationDialog .arcade-dialog-bar button{background:#2d5044;border:1px solid #c4a979;border-radius:5px;color:#fff2d4;padding:9px 13px;min-height:42px}#manifestationFrame{width:100%;min-height:0;flex:1;border:0;background:#14251f}#manifestationDialog .arcade-under-actions{display:flex;gap:9px;padding:8px 12px;background:#19362d;border-top:1px solid #b6a27e}#manifestationDialog .arcade-under-actions button{flex:1;min-width:0;min-height:46px;padding:9px;border:1px solid #bda67c;border-radius:6px;font-weight:700;cursor:pointer}.arcade-under-actions #manifestationBack{background:#3b574e;color:#fff5de}.arcade-under-actions #manifestationNext{background:#f0d4a1;color:#294435}#rendezvousDialog #rendezvousPlay{display:block;margin:14px 0 0;width:100%;min-height:52px;border:0;border-radius:7px;background:#2a5545;color:#fff6d9;font-weight:750;cursor:pointer;font-size:16px}#rendezvousDialog .rendezvous-part-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:18px 0}#rendezvousDialog .rendezvous-part-nav button{padding:10px 8px;background:#f4e6c7;border:1px solid #baa071;border-radius:6px;color:#385347;min-height:46px;font-weight:700;font-size:12px}#rendezvousDialog .rendezvous-part-nav button[aria-current=step]{background:#335746;color:#fff3d8}#rendezvousDialog .rendezvous-part-nav button:disabled{opacity:.55}#rendezvousDialog [hidden]{display:none!important}@media(max-width:650px){#manifestationDialog{max-width:100vw;width:100vw;height:100dvh;max-height:100dvh;border:0;border-radius:0}#manifestationDialog .arcade-dialog-bar{padding:6px 8px;font-size:10px}#manifestationDialog .arcade-dialog-bar button{font-size:10px;padding:7px 8px}#manifestationDialog .arcade-under-actions{padding:6px 8px}#rendezvousDialog .rendezvous-part-nav button{font-size:10px;padding:8px 4px}}';
 style.textContent+=`#cyranoDialog{padding:0;width:min(1220px,98vw);height:98dvh;max-width:98vw;max-height:98dvh;border:2px solid #c09c6c;border-radius:10px;background:#10191e;color:#f7ebd7;overflow:hidden}#cyranoDialog[open]{display:flex;flex-direction:column}#cyranoDialog::backdrop{background:#102021e0}#cyranoDialog .arcade-dialog-bar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 13px;background:#233d3e;border-bottom:1px solid #ad987a;font-size:11px}#cyranoDialog .arcade-dialog-bar button{background:#325450;color:#fff0d8;border:1px solid #ac9875;border-radius:5px;padding:9px 12px;min-height:42px}#cyranoFrame{width:100%;min-height:0;flex:1;border:0;background:#10191e}#cyranoDialog .arcade-under-actions{display:flex;gap:8px;padding:8px 12px;background:#213f3b;border-top:1px solid #b6a27e}#cyranoDialog .arcade-under-actions button{flex:1;min-width:0;min-height:44px;border-radius:6px;padding:8px;font-weight:700;border:1px solid #baa77d;cursor:pointer}#cyranoBack{background:#3b5a54;color:#fff5de}#cyranoNext{background:#ebd2a7;color:#264238}@media(max-width:650px){#cyranoDialog{max-width:100vw;width:100vw;height:100dvh;max-height:100dvh;border:0;border-radius:0}#cyranoDialog .arcade-dialog-bar{font-size:10px;padding:5px 7px}#cyranoDialog .arcade-dialog-bar button{font-size:10px;padding:7px}#cyranoDialog .arcade-under-actions{padding:5px 7px}}`;
 document.head.append(style);
 const cyranoExtract=["Cédric Aubert, mon voisin d’isolement dans la cellule d’à côté, finit par me parler d’un problème. Le détenu qui occupait ma cellule avant moi écrivait ses lettres d’amour. Mon voisin avait une copine dehors, mais complexait sur son orthographe et ne savait pas lui parler d’amour. Mon prédécesseur écrivait les lettres ; lui les recopiait avant de les envoyer. Il me demande :","— Est-ce que toi, tu te sens de faire le boulot ?","— Écoute, ça tombe plutôt bien. Moi, j’ai pas de copine à qui écrire.","Ça peut être marrant. Me voilà écrivain public sentimental au quartier d’isolement.","Un problème me vient quand même à l’esprit :","— Mais attends. Si je me mets à écrire à la place de l’autre, elle va forcément s’en rendre compte. Je ne sais pas ce que le mec écrivait, moi.","— Si, si. J’ai gardé tous les brouillons.","— Tous les brouillons ?","— Oui. Comme je recopiais ses lettres, je les ai gardés. Je te les file. Tu t’en inspires et tu gardes le même style.","Je trouve ça génial. Maintenant, il fallait en plus que j’assure la continuité éditoriale d’une correspondance amoureuse clandestine.","— Bon. Et comment on fait ? On passe par le yo-yo ?","Le yo-yo : une petite corde faite avec des bandes de drap, un sac plastique accroché au bout, qu’on fait circuler de cellule en cellule.","— Pour le paquet avec les anciens brouillons, oui, on passe par le yo-yo. Mais après, pour les lettres, il y a plus simple.","— Quoi ?","— Avec celui qui occupait ta cellule avant toi, on a creusé un trou.","Je reste silencieux.","— Vous avez fait quoi ?","— Un trou. Dans le mur.","Il m’indique l’endroit. Le trou traverse le mur entre nos deux cellules. Il suffit de rouler une feuille très serrée, d’en faire un petit tube et de la glisser à travers. Je regarde le trou. Les bras m’en tombent. Ces deux types ont creusé un passage dans le mur d’une prison, non pour s’évader ni faire passer de la drogue, mais pour faire passer des lettres d’amour.","Je les écris. Cédric les recopie avant de les envoyer à sa copine."];
 // Extrait littéral du manuscrit V17 : de l'amie commune de Lionel à l'appel du taxi.
 const rencontreExtract=["Nous avons une amie en commun. Elle me raconte la cérémonie. Elle me dit que c'était beau, qu'ils avaient lâché des ballons pour que je sois symboliquement présent avec eux, malgré ma détention.","Elle me raconte aussi les circonstances de sa mort.","Lionel était reparti de Strasbourg, où il avait échappé de justesse à la rafle des policiers du RAID, après que l'occupation de l'annexe du ministère de la Justice avait été qualifiée de prise d'otages.","Quand il était arrivé à Paris, il l'avait appelée. Il était paniqué. Elle l'avait rejoint chez lui. Il était très anxieux, très agité.","Comme il était resté quelque temps à Strasbourg, il n'avait plus rien à manger. Elle lui avait donné quelques calmants avant de partir lui faire des courses.","Quand elle est revenue, les pompiers étaient là.","Lionel était par terre.","Elle me rapporte aussi un détail troublant. Les voisins auraient entendu Lionel crier pendant sa chute.","Il avait crié.","Je ne sais pas pourquoi, mais ce détail me trouble particulièrement.","Ce soir-là, avec cette amie, nous avons dormi ensemble, chez Lionel.","Et nous avons fait l'amour.","C'est très étrange. Je ne suis même pas sûr que nous ayons eu beaucoup de désir l'un pour l'autre.","C'est, à ce jour, la seule fois de ma vie où j'ai fait l'amour comme un hommage.","Entre-temps, j’ai été expulsé de mon appartement. Un copain m’héberge. Je ne suis pas au meilleur de ma forme : je bois beaucoup trop et je n’ai pratiquement que les vêtements que je porte. Le mercredi suivant, je vais quand même à cet anniversaire. Je suis sale et surtout très éméché. À la soirée, je suis une sorte de guest star : le petit Che Guevara du quartier vient de sortir de prison, sauf qu’il titube. À un moment, je me retrouve dans la cuisine.","Dans les soirées, il y a toujours une deuxième soirée dans la cuisine. Deux jeunes types commencent à me parler.","— Alors ? C’était comment, la prison ?","Et là, je pars en mode soûlard pathétique. Je parle en regardant le sol, avec une articulation approximative et la conviction, propre aux gens très ivres, que ce qu’ils racontent est passionnant. Au bout d’un moment, je relève la tête : les deux types sont partis. Pendant une seconde, je réalise que je parle peut-être tout seul. Puis je tourne la tête. Il reste une jeune femme, à peu près de mon âge.","Elle a de grands yeux bleus soulignés d’eye-liner. Deux papillons.","— Je suis fatigué.","Elle me répond :","— Je sais.","Je lui pose une question étrange à une inconnue dans une cuisine :","— Tu veux bien t’occuper de moi ?","— Oui.","Elle appelle un taxi et décide de me ramener chez elle, dans sa chambre de bonne, au 30 avenue Rapp."];
 const partNav=document.createElement('nav');partNav.className='rendezvous-part-nav';partNav.setAttribute('aria-label','Les trois jeux du chemin III');
 for(let i=0;i<3;i++){
  const b=document.createElement('button');b.type='button';b.dataset.part=String(i+1);b.textContent='Chapitre '+parts[i].chapter+' · Jeu '+(i+1)+'/3';
  b.onclick=()=>i===0?app.open(1):showPart(i+1);partNav.append(b);
 }
 info.after(partNav); // Comme les autres bonnes feuilles : le texte d'abord, les choix ensuite.
 const launch=document.createElement('button');launch.type='button';launch.id='rendezvousPlay';launch.textContent='🎮 Jouer à Camarades ! — 30 points';
 info.append(launch);launch.onclick=()=>activePart===3?openRencontreDialog():activePart===2?openCyranoDialog():beginGame();
 const awarded=()=>Array.isArray(state.rdvManifestationPassed)?state.rdvManifestationPassed.filter(n=>[1,2,3].includes(n)):[];
 const hasTraversed=()=>Boolean(state.rdvManifestationFinished||state.rdvManifestationSkipped);
 const prisonTraversed=()=>Boolean(state.yoyoFinished||state.storySkips?.includes('5:prison')||state.completed?.some(n=>n>=6));
 const cyranoAwarded=()=>Array.isArray(state.rdvCyranoPassed)?state.rdvCyranoPassed.filter((n,i,a)=>[1,2,3].includes(n)&&a.indexOf(n)===i).sort((a,b)=>a-b):[];
 const cyranoTraversed=()=>Boolean(state.rdvCyranoFinished||state.rdvCyranoSkipped);

 function updateThird(){
  const card=$('chemin-iii');if(!card)return;
  const count=awarded().length,cyranoCount=cyranoAwarded().length,allowed=flow.chapter2Done(state);
  const partsCards=card.querySelectorAll('.chapter-literary-part');
  if(partsCards[0]){
   partsCards[0].querySelector('.chapter-part-game').textContent='La prison · '+(state.yoyoFinished?'30/30':'0/30')+' points';
   partsCards[0].querySelector('.chapter-part-state').textContent=state.yoyoFinished?'✓ Jeu réussi':state.storySkips?.includes('5:prison')?'↷ Parcouru sans points':'Jeu 1 / 3 · Strasbourg';
   partsCards[0].classList.toggle('passed',prisonTraversed());
  }
  if(partsCards[1]){
   partsCards[1].querySelector('.chapter-part-game').textContent='Cyrano · La planche vivante · '+cyranoCount*10+'/30 points';
   partsCards[1].querySelector('.chapter-part-state').textContent=state.rdvCyranoFinished?'✓ Trois lettres réussies':state.rdvCyranoSkipped?'↷ Parcouru sans terminer':prisonTraversed()?'Jeu 2 / 3 · lecture disponible':'Après le jeu 1 / 3';
   partsCards[1].classList.toggle('passed',cyranoTraversed());
  }
  const rencontreTraversed=Boolean(state.rdvRencontreFinished||state.rdvRencontreSkipped);
  if(partsCards[2]){
   partsCards[2].querySelector('.chapter-part-game').textContent='Rencontre · '+Math.min(7,Number(state.rdvRencontreStage)||0)+'/7 choix';
   partsCards[2].querySelector('.chapter-part-state').textContent=state.rdvRencontreFinished?'✓ Rencontre accomplie':state.rdvRencontreSkipped?'↷ Autre fin':cyranoTraversed()?'Jeu 3 / 3 · Cinématiques disponibles':'Après le jeu 2 / 3';
   partsCards[2].classList.toggle('passed',rencontreTraversed);
  }
  const done=[prisonTraversed(),cyranoTraversed(),rencontreTraversed].filter(Boolean).length;
  card.querySelector('.chapter-card-status').textContent=allowed?
   (done>=3?'3 / 3 jeux parcourus':done>=2?'2 / 3 jeux parcourus · dernier chapitre accessible':done===1?'1 / 3 jeux parcourus · Cyrano disponible':'0 / 3 jeux parcourus · première bonne feuille disponible'):
   'À découvrir après le chemin II';
  card.querySelector('.chapter-card-place').textContent='Chapitres 4, 5 et 6 · Jeux et parcours narratif';
  card.setAttribute('aria-label','Chemin III Les rendez-vous · '+done+'/3 jeux parcourus');
  const playable=card.querySelectorAll('[data-rendezvous-part]');
  for(const tile of playable){
   const part=Number(tile.dataset.rendezvousPart);
   const permitted=allowed&&!boardRolling&&
    (part===1||part===2&&prisonTraversed()||part===3&&cyranoTraversed());
   tile.disabled=!permitted;
   tile.setAttribute('aria-label',permitted?'Lire et '+(tile.classList.contains('passed')?'rejouer ':'jouer ')+'le chapitre '+parts[part-1].chapter+' · '+parts[part-1].title:'Chapitre '+parts[part-1].chapter+' non débloqué');
  }
  card.querySelector('.chapter-card-main').disabled=!allowed||!!boardRolling;
  for(const b of partNav.children){
   const n=Number(b.dataset.part);b.disabled=(n===2&&!prisonTraversed())||(n===3&&!cyranoTraversed());
  }
  $('manifestationNext').textContent=state.rdvManifestationFinished?'Suivant · La prison →':'Suivant · Passer sans points →';
  $('cyranoNext').textContent=state.rdvCyranoFinished?'Suivant · Chapitre 6 →':'Suivant · Passer sans points →';
  if(activePart===1)launch.textContent=state.rdvManifestationFinished?'↻ Rejouer Camarades !':'🎮 Jouer à Camarades ! — 30 points';
  if(activePart===2)launch.textContent=state.rdvCyranoFinished?'↻ Rejouer Cyrano — La planche vivante':'🎮 Jouer à Cyrano — 30 points';
  if(activePart===3)launch.textContent='🎮 Jouer à Tu veux bien t’occuper de moi ?';
 }
 function showPart(n){
  if(n===2&&!prisonTraversed())return;
  if(n===3&&!cyranoTraversed())return;
  activePart=n;clearTimeout(autoTimer);autoTimer=0;autoLaunched=false;
  for(const b of partNav.children){const active=Number(b.dataset.part)===n;b.setAttribute('aria-current',active?'step':'false');}
  if(n===1){
   readerHeading.textContent='LES TREIZE CHEMINS · CHEMIN II · CHAPITRE 4 — « DRAPEAU ROUGE »';
   kicker.textContent='Vous êtes arrivé à';
   title.textContent='République–Bastille';
   readerArea.textContent='Paris · avril 2002';readerArea.hidden=false;
   readerReference.textContent='Extrait du chapitre 4 — « Drapeau rouge », p. 59–60.';readerReference.hidden=false;
   putExcerpt(firstExcerpt);excerpt.hidden=false;
   infoHeading.textContent='Jeu 3 / 3 · Camarades !';
   infoBody.textContent='Le drapeau dans une rue adjacente, puis la statue. Trois objets à récupérer (cœur, fleur, bisou) avant les attaques. Sélectionne chaque CRS, lance, puis réunis les deux cortèges. 10 points par étape.';
   launch.hidden=false;
  }else if(n===2){
   readerHeading.textContent='LES TREIZE CHEMINS · CHEMIN III · CHAPITRE 5 — « PASSE-MURAILLE »';
   kicker.textContent='Bonne feuille · Le passage « Cyrano »';
   title.textContent='Cyrano';
   readerArea.textContent='Quartier d’isolement · Deux cellules mitoyennes';readerArea.hidden=false;
   readerReference.textContent='Extrait du chapitre 5 — « Passe-muraille » · « Cyrano » (V17).';readerReference.hidden=false;
   putExcerpt(cyranoExtract);excerpt.hidden=false;
   infoHeading.textContent='Jeu 2 / 3 · Cyrano — La planche vivante';
   infoBody.textContent='Lis ce passage en plein écran, puis plonge dans la planche photographique : avance vignette par vignette, accompagne la caméra à travers le mur et observe les bulles s’écrire. Ensuite, écris trois lettres d’amour pour Cédric : chacune doit intégrer cinq mots imposés, contenir au moins 65 mots et parler sincèrement d’amour. 10 points par lettre acceptée, 30 points au total. Clavier ou dictée vocale lorsque le navigateur le permet. Tu peux passer le défi et continuer sans gagner ses points.';
   launch.hidden=false;
  }else{
   readerHeading.textContent='LES TREIZE CHEMINS · CHEMIN III · CHAPITRE 6';
   kicker.textContent='Chemin III · Les rendez-vous';
   title.textContent='Chapitre '+parts[n-1].chapter+' — « '+parts[n-1].title+' »';
   readerArea.textContent='Paris · souvenir de Lionel · soirée d’anniversaire';readerArea.hidden=false;
   readerReference.textContent='Extrait du chapitre 6 — « Tu veux bien t’occuper de moi ? » · manuscrit V17.';readerReference.hidden=false;
   putExcerpt(rencontreExtract);excerpt.hidden=false;
   infoHeading.textContent='Jeu 3 / 3 · Tu veux bien t’occuper de moi ?';
   infoBody.textContent='Lis ce passage intégralement : le jeu commence à la fin de la bonne feuille. Vingt et une cinématiques sont disponibles : dans la cuisine, le regard ouvre la caresse de la joue, puis les cheveux et le baiser. Le dernier verre conduit à la mansarde, à la complicité et jusqu’au « oui ». À chaque « Pas maintenant », un autre moment de tendresse se joue. Les films débloqués peuvent être revus ; aucun point supplémentaire n’est attribué.';
   launch.hidden=false;
  }
  partNav.hidden=n===1;
  reader.scrollTop=0;updateThird();
 }
 const oldOpen=app.open;
 app.open=function(requested){
  if(!flow.chapter2Done(state))return;
  const part=requested===undefined?(!prisonTraversed()?1:!cyranoTraversed()?2:3):requested;
  if(!Number.isInteger(part)||part<1||part>3)return;
  if(part===1){window.TreizePlateauxNavigation?.openPart?.('prison');return;}
  if(part===2&&!prisonTraversed()||part===3&&!cyranoTraversed())return;
  oldOpen();showPart(part);
 };
 // Première occurrence du « Drapeau rouge » : Camarades ! après la danse.
 app.openManifestation=function(){
  if(!flow.chapter2PartDone(state,2)||boardRolling)return;
  clearTimeout(autoTimer);autoLaunched=false;
  if(!reader.open)reader.showModal();
  showPart(1);
 };
 // Le code du plateau appelle désormais window.TreizeRendezVous.open() à chaque ouverture.
 function openDialog(){
  if(!flow.chapter2PartDone(state,2))return;
  clearTimeout(autoTimer);autoLaunched=true;
  if(!state.rdvManifestationPending||!state.rdvManifestationPending.id){
   state.rdvManifestationPending={id:crypto.randomUUID(),chapter:4};
   save();
  }
  if(reader.open)reader.close();
  if(!dialog.open)dialog.showModal();
  if(!loading){loading=true;frame.src='jeu-manifestation.html?embedded=1&v=20261110-consignes-symboles-v24';}else initIframe();
 }
 function beginGame(){openDialog();}
 function initIframe(){
  if(!dialog.open||!frame.contentWindow)return;
  const id=state.rdvManifestationPending?.id;if(!id)return;
  frame.contentWindow.postMessage({type:'manifestation:init',id,passed:awarded(),points:state.points},location.origin);
 }
 frame.addEventListener('load',initIframe);
 function closeGame(){if(dialog.open)dialog.close();frame.removeAttribute('src');loading=false;state.rdvManifestationPending=null;save();render();$('chemin-iii')?.querySelector('.chapter-card-main')?.focus({preventScroll:true});}
 function nextGame(){
  if(!state.rdvManifestationFinished&&!state.rdvManifestationSkipped){state.rdvManifestationSkipped=true;save();}
  closeGame();
  // Deuxième occurrence du « Drapeau rouge » : la prison, puis Cyrano.
  app.open();
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

 // Épreuve 2 / 3 — feuille intégrale puis planche de BD et trois lettres.
 function openCyranoDialog(){
  if(!flow.chapter2Done(state)||!prisonTraversed())return;
  clearTimeout(autoTimer);autoLaunched=true;
  if(!state.rdvCyranoPending?.id){
   state.rdvCyranoPending={id:crypto.randomUUID(),chapter:5};save();
  }
  if(reader.open)reader.close();
  if(!cyranoDialog.open)cyranoDialog.showModal();
  if(!cyranoLoading){cyranoLoading=true;cyranoFrame.src='jeu-cyrano-bd.html?embedded=1&v=cyrano-bd-v1';}
  else initCyrano();
 }
 function initCyrano(){
  if(!cyranoDialog.open||!cyranoFrame.contentWindow)return;
  const id=state.rdvCyranoPending?.id;if(!id)return;
  cyranoFrame.contentWindow.postMessage({type:'cyrano:init',id,passed:cyranoAwarded(),points:state.points},location.origin);
 }
 cyranoFrame.addEventListener('load',initCyrano);
 function closeCyrano(){
  if(cyranoDialog.open)cyranoDialog.close();
  cyranoFrame.removeAttribute('src');cyranoLoading=false;
  state.rdvCyranoPending=null;save();render();
  $('chemin-iii')?.querySelector('.chapter-card-main')?.focus({preventScroll:true});
 }
 function nextCyrano(){
  if(!state.rdvCyranoFinished&&!state.rdvCyranoSkipped){
   state.rdvCyranoSkipped=true;save();
  }
  closeCyrano();
  app.open();showPart(3);
 }
 $('cyranoClose').onclick=closeCyrano;
 $('cyranoBack').onclick=closeCyrano;
 $('cyranoNext').onclick=nextCyrano;
 cyranoDialog.addEventListener('cancel',e=>{e.preventDefault();closeCyrano();});
 addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==cyranoFrame.contentWindow||!cyranoDialog.open||!e.data)return;
  const m=e.data;
  if(m.type==='cyrano:ready'){initCyrano();return;}
  if(m.id!==state.rdvCyranoPending?.id)return;
  if(m.type==='cyrano:close'){closeCyrano();return;}
  if(m.type==='cyrano:next'){nextCyrano();return;}
  if(m.type==='cyrano:progress'){
   const step=Number(m.step),passed=cyranoAwarded();
   if(!Number.isInteger(step)||step<1||step>3)return;
   if(!passed.includes(step)){
    if(step!==passed.length+1)return; // Chaque lettre compte une seule fois, dans l'ordre.
    state.rdvCyranoPassed=[...passed,step];
    state.points+=10;save();render();
   }
   cyranoFrame.contentWindow?.postMessage({type:'cyrano:credited',id:m.id,passed:cyranoAwarded(),points:state.points},location.origin);
   return;
  }
  if(m.type==='cyrano:won'){
   if(cyranoAwarded().length!==3)return;
   state.rdvCyranoFinished=true;state.rdvCyranoSkipped=false;
   save();render();
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
  if(autoLaunched||!reader.open)return;
  if(!reachedReadingEnd()){clearTimeout(autoTimer);autoTimer=0;return;}
  if(autoTimer)return;
  autoTimer=setTimeout(()=>{
   autoTimer=0;
   if(reader.open&&!autoLaunched&&reachedReadingEnd())(activePart===3?openRencontreDialog:activePart===2?openCyranoDialog:openDialog)();
  },1150);
 },{passive:true});
 const oldRender=render;
 render=function(){oldRender();updateThird();};
 addEventListener('focus',updateThird);
 updateThird();
})();
