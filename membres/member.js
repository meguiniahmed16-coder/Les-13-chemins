import {hasAuthorSession,logoutAuthor} from './author-access.js';
import {createMemberPreview} from './free-preview.js';
import {normaliseStudio} from './studio-look.js';
import {games,scenes,videos,mergeJourney,importDeviceJourney,enableJourneyTracking,disableJourneyTracking} from './journey.js';

const $=id=>document.getElementById(id);
const el=(tag,text)=>{const node=document.createElement(tag);if(text)node.textContent=text;return node;};
const note=text=>{$('status').textContent=text;};
const params=new URLSearchParams(location.search);
const previewPlan=params.get('apercu');
const wantsPreview=['abonne','non-abonne'].includes(previewPlan);
const previewGender=params.get('genre')==='femme'?'femme':'homme';
const authorEntry=params.get('auteur')||(wantsPreview?'atelier':'');
let preview;
const adminURL=kind=>kind==='edition'?'/admin.html':'/admin-blog.html';
let member,signup=false,appearance,playing='',recorded=false;
const base='/api/membres/';
async function api(path,data){
  if(wantsPreview){
    if(path==='me'){
      if(!await hasAuthorSession(authorEntry)){
        preview=null;
        throw Object.assign(Error('Ta session auteur a expiré.'),{status:401});
      }
      preview??=createMemberPreview(previewGender,previewPlan==='abonne');
    }
    if(!preview)throw Error('Rouvre l’aperçu depuis ton espace auteur.');
    return preview(path,data);
  }
  const response=await fetch(base+path+(authorEntry?'?auteur=1':''),{method:data?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:data?{'content-type':'application/json'}:undefined,body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(20000)});
  const result=await response.json();
  if(response.status===401 && member && path!=='me'){
    await refresh();
    throw new Error('Ta session a expiré.');
  }
  if(!response.ok)throw Object.assign(new Error(result.error||'Connexion indisponible.'),{status:response.status});
  return result;
}
function action(fn){return async event=>{
  event.preventDefault();const button=event.submitter||event.currentTarget;
  if(button.disabled)return;button.disabled=true;
  try{await fn(event);}catch(e){note(e.message||'La connexion a été interrompue.');}finally{button.disabled=false;}
};}
const menu=$('member-menu'),menuToggle=menu.querySelector('summary');
function closeMenu(returnFocus=false){
  if(!menu.open)return;
  menu.open=false;
  if(returnFocus)menuToggle.focus({preventScroll:true});
}
menu.addEventListener('click',event=>{
  if(event.target.closest('a,button'))closeMenu(true);
});
document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target))closeMenu();});
document.addEventListener('focusin',e=>{if(!menu.contains(e.target))closeMenu();});
document.addEventListener('keydown',e=>{if(menu.open&&e.key==='Escape'){e.preventDefault();closeMenu(true);}});
function mode(value){
  signup=value;$('choose-login').setAttribute('aria-pressed',String(!value));$('choose-signup').setAttribute('aria-pressed',String(value));
  $('auth-title').textContent=value?'Créer mon compte':'Se connecter';
  $('signup-fields').disabled=!value;$('signup-fields').hidden=!value;
  $('password').autocomplete=value?'new-password':'current-password';$('password').minLength=value?10:1;
  $('auth-submit').textContent=value?'Créer mon compte':'Se connecter';
  note(value?'Choisis un mot de passe de dix caractères ou plus.':'');
}
const pages=['salon','avatar','parcours','abonnement','profil'];
function setPage(){
  if(!member)return;
  const selected=location.hash.slice(1);
  const key=member.pseudo?(pages.includes(selected)?selected:'salon'):'profil';
  for(const name of pages){
    if(name!=='salon'&&name!=='avatar')$(name).hidden=name!==key;
    const link=$('tabs').querySelector('[href="#'+name+'"]');
    if(name===key)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  }
  const roomOnly=key==='salon'||key==='avatar';
  $('salon-panels').hidden=roomOnly;
  $('room').querySelector('chemins-avatar')?.openOptions(key==='avatar');
  $('salon').hidden=!member.pseudo;
  $('salon-layout').classList.toggle('has-panel',!roomOnly&&Boolean(member.pseudo));
  if(key!=='parcours')closeFilm();
  return key;
}
function openPanel(event){
  const link=event.target.closest('a[href^="#"]');
  if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  if(location.hash!==link.hash)history.pushState(null,'',link.hash);
  const key=setPage();
  if(key){
    const section=$(key==='avatar'?'salon':key),heading=section.querySelector('h2');
    heading.tabIndex=-1;heading.focus({preventScroll:true});section.scrollIntoView({block:'start'});
  }
}
$('tabs').addEventListener('click',openPanel);
$('photo-link').addEventListener('click',openPanel);
async function mountRoom(){
  await import('./avatar.js?v=salon32');
  if(!member)return;
  let view=$('room').querySelector('chemins-avatar');
  if(!view){
    view=el('chemins-avatar');view.setAttribute('scene','salon');
    view.addEventListener('avatar-ready',()=>updatePhoto(view));
    $('room').append(view);
  }
  const who=member.id;
  await view.configure(appearance,{savedStudio:member.studio||appearance,gender:member.gender||'homme',plus:Boolean(member.author||member.companion),privateURL:member.author?'/membre-atelier.html?auteur='+encodeURIComponent(member.author):'',change:draft=>{if(member?.id===who)appearance=draft;},save:async studio=>{
    if(member?.id!==who)throw Error('Ta session a changé.');
    const result=await api('avatar',{avatar:member.avatar,studio});
    if(!result.studio)throw Error('Le serveur n’a pas confirmé cet enregistrement.');
    if(member?.id===who){member.avatar=result.avatar;member.studio=result.studio;updatePhoto(view);}
  }});
  if(member?.id===who)updatePhoto(view);
  if(location.hash==='#avatar')view.openOptions();
}
function updatePhoto(view){
  if(!member||!view)return;
  const image=view.snapshot();
  if(image)$('photo').src=image;
}
function closeFilm(){playing='';const player=$('film-player');if(player.getAttribute('src')){player.pause();player.removeAttribute('src');player.load();}$('player-panel').hidden=true;}
function openFilm(film){
  closeFilm();playing=film.id;recorded=false;
  $('film-name').textContent=film.title;$('player-panel').hidden=false;
  const player=$('film-player');player.src=film.alternate||film.url;player.play().catch(()=>{});
  $('player-panel').scrollIntoView({behavior:'smooth',block:'center'});
}
function displayList(id,items,mode,empty){
  const parent=$(id);parent.replaceChildren();
  if(!items.length){parent.append(el('p',empty));return;}
  const list=el('ul');list.className='film-list';
  for(const item of items){
    const li=el('li');if(mode==='video'){const b=el('button',item.title);b.type='button';b.onclick=()=>openFilm(item);li.append(b);}
    else{const a=el('a',item.title);a.href=item.url;li.append(a);}list.append(li);
  }parent.append(list);
}
function renderJourney(){
  const j=member.journey;$('paths').replaceChildren();
  for(const path of ['I','II','III','IV','V']){
    const all=scenes.filter(x=>x.path===path),visited=all.filter(x=>j.scenes.includes(x.id));
    const box=el('div');box.className='path';const progress=el('progress');progress.max=all.length;progress.value=visited.length;progress.setAttribute('aria-label','Étapes parcourues du chemin '+path);
    box.append(el('strong','Chemin '+path),el('p',visited.length+' / '+all.length+' étapes parcourues'),progress);$('paths').append(box);
  }
  displayList('played',games.filter(x=>j.games.includes(x.id)),'game','Ton premier jeu apparaîtra ici dès que tu y auras joué.');
  displayList('watched',videos.filter(x=>j.videos.includes(x.id)),'video','Retrouve ici les vidéos découvertes pendant ton voyage.');
  displayList('films',videos,'video','');
}
function providerControls(providers){
  const panel=$('admin-providers');panel.replaceChildren();
  for(const [key,title,consoleURL] of [
    ['google','Google','https://console.cloud.google.com/auth/clients'],
    ['facebook','Facebook','https://developers.facebook.com/apps/']
  ]){
    const form=el('form');form.className='provider-form';
    form.append(el('h3',title));
    const state=el('p',providers[key]?'Application configurée.':'Application à connecter.');state.className='note';
    const link=el('a','Ouvrir la console '+title);link.href=consoleURL;link.target='_blank';link.rel='noopener noreferrer';
    const callback=el('p','Adresse de retour à autoriser dans la console ');callback.append(el('code',location.origin+base+'oauth/'+key+'/callback'));
    form.append(state,link,callback);
    for(const [name,label,type] of [['id','Identifiant de l’application','text'],['secret','Secret de l’application','password']]){
      const wrapper=el('label',label),input=el('input');input.name=name;input.type=type;input.required=true;
      input.autocomplete='off';input.spellcheck=false;input.maxLength=512;wrapper.append(input);form.append(wrapper);
    }
    const submit=el('button','Enregistrer '+title);submit.className='primary';form.append(submit);
    form.onsubmit=action(async()=>{
      const {providers}=await api('admin/providers',{provider:key,...Object.fromEntries(new FormData(form))});
      form.reset();providerControls(providers);note('Identifiants '+title+' enregistrés.');
    });panel.append(form);
  }
}
async function loadProviderOptions(){
  const response=await fetch(base+'options',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error('Les connexions externes sont momentanément indisponibles.');
  return (await response.json()).providers;
}
function previewControls(host,kind,plan,gender,fromProfile){
  const form=$('preview-controls').content.firstElementChild.cloneNode(true);
  form.elements.auteur.value=kind;form.elements.apercu.value=plan;
  form.elements.genre.value=gender;form.elements.retour.value=fromProfile?'profil':'admin';
  if(wantsPreview)form.action='/membre.html'+location.hash;
  host.replaceChildren(form);
}
async function refresh(){
  const previous=member, previousDraft=appearance;
  try{member=await api('me');}catch(e){if(e.status!==401)throw e;member=null;}
  const authorOnly=Boolean(authorEntry&&!preview);
  $('preview-notice').hidden=!preview;
  const fromProfile=params.get('retour')==='profil';
  $('leave-preview').href=fromProfile?'/membre.html?auteur='+encodeURIComponent(authorEntry)+'#profil':adminURL(authorEntry);
  if(preview){
    const paid=previewPlan==='abonne';
    $('preview-title').textContent='Aperçu · '+(previewGender==='femme'?(paid?'Femme abonnée':'Femme non abonnée'):(paid?'Homme abonné':'Homme non abonné'));
    previewControls($('preview-switch'),authorEntry,previewPlan,previewGender,fromProfile);
  }
  $('author-previews').hidden=$('preview-subscriber').hidden=!member?.author;
  if(member?.author){
    $('preview-subscriber').href='/membre.html?auteur='+encodeURIComponent(member.author)+'&apercu=abonne&retour=profil';
    previewControls($('profile-preview-switch'),member.author,'abonne','homme',true);
  }
  $('preview-entry').hidden=!member?.author;
  if(member?.author)$('preview-entry').href='/membre.html?auteur='+encodeURIComponent(member.author)+'&apercu=non-abonne';
  $('photo-link').hidden=!member?.pseudo;
  $('access-options').hidden=Boolean(member||authorOnly);$('tabs').hidden=!member;
  $('auth').hidden=Boolean(member);$('member').hidden=!member;$('logout').hidden=!member;
  $('admin-return').hidden=Boolean(preview)||(!member?.author&&!authorOnly);
  $('admin-return').href=adminURL(member?.author||authorEntry);
  if(!member){
    $('room').replaceChildren();$('admin-providers').replaceChildren();
    $('photo').removeAttribute('src');appearance=null;
    if(!wantsPreview)disableJourneyTracking();
    if(authorOnly){
      $('auth').hidden=true;
      note('Ta session auteur a expiré. Rouvre ton administration pour accéder au salon.');
      return;
    }
    mode(false);
    const providers=await loadProviderOptions().catch(()=>({}));
    for(const key of ['google','facebook']){
      $(key).hidden=$(key).disabled=!providers[key];
      $(key).onclick=()=>preview?note('Quitte l’aperçu pour te connecter à un autre compte.'):location.assign(base+'oauth/'+key);
    }
    $('google').parentElement.hidden=!Object.values(providers).some(Boolean);
    if(new URLSearchParams(location.search).has('connexion'))note('Connexion interrompue. Tu peux réessayer.');
    return;
  }
  if(!wantsPreview)enableJourneyTracking(member.id);
  $('provider-settings').hidden=!member.author;
  if(member.gender==='femme')$('photo').removeAttribute('src');else $('photo').src='/assets/membres/summer-man.webp';
  $('profile-form').elements.birth.required=!member.author;
  $('profile-form').elements.gender.required=!member.author&&(!member.pseudo||Boolean(member.gender));
  for(const k of ['name','pseudo','birth','gender'])$('profile-form').elements[k].value=member[k]||'';
  $('account-email').textContent=member.email;$('salon-name').textContent=[member.pseudo,member.age].filter(Boolean).join(' · ');
  $('plan-status').textContent=member.companion?'Ton accès est ouvert jusqu’au '+new Date(member.paidUntil*1000).toLocaleDateString('fr-FR')+'.':'Tu disposes des options gratuites.';
  $('portal').hidden=!member.portal;if(member.portal)$('portal').href=member.portal;
  $('subscribe').hidden=member.companion||Boolean(member.author);
  if(member.author)$('plan-status').textContent='Ton accès auteur comprend toutes les options de personnalisation.';
  $('offer-price').hidden=$('renewal').hidden=Boolean(member.author);
  const keepDraft=previous?.id===member.id && previous.gender===member.gender && JSON.stringify(previous.studio||previous.avatar)===JSON.stringify(member.studio||member.avatar);
  appearance=keepDraft&&previousDraft?previousDraft:normaliseStudio(member.studio,Boolean(member.author||member.companion),member.avatar,member.gender);renderJourney();setPage();
  if(member.pseudo)void mountRoom().catch(()=>note('Le salon n’a pas pu se charger. Recharge la page pour réessayer.'));
  if(member.author){
    const expected=member;
    void loadProviderOptions().then(providers=>{
      if(member===expected)providerControls(providers);
    }).catch(()=>{
      if(member===expected)$('admin-providers').textContent='Les réglages de connexion sont momentanément indisponibles.';
    });
  }
  note(member.pseudo?'':'Choisis ton pseudo, ton genre et ta date de naissance pour créer ton avatar.');
}
function chooseAccess(value){mode(value);closeMenu();$('email').focus();}
$('choose-login').onclick=()=>chooseAccess(false);$('choose-signup').onclick=()=>chooseAccess(true);
$('auth-form').onsubmit=action(async e=>{if(preview){note('Quitte l’aperçu pour te connecter à un autre compte.');return;}const form=e.target;await api(signup?'signup':'login',Object.fromEntries(new FormData(form)));form.reset();await refresh();});
$('logout').onclick=action(async()=>{
  if(wantsPreview){await api('logout',{});closeFilm();await refresh();note('Le membre de démonstration est déconnecté.');return;}
  if(member?.author){
    const kind=member.author;
    await logoutAuthor(kind);disableJourneyTracking();location.replace(adminURL(kind));return;
  }
  await api('logout',{});disableJourneyTracking();closeFilm();await refresh();
});
$('profile-form').onsubmit=action(async e=>{await api('profile',Object.fromEntries(new FormData(e.target)));await refresh();note('Ton profil est enregistré.');});
$('import').onclick=action(async()=>{if(wantsPreview){note('Dans cet aperçu, le parcours de démonstration démarre à zéro.');return;}const found=importDeviceJourney();await api('journey',{memberId:member.id,...found});member.journey=mergeJourney(member.journey,found);renderJourney();note(Object.values(found).some(x=>x.length)?'Le parcours de cet appareil a été ajouté à ton parcours.':'Aucune ancienne étape enregistrée sur cet appareil.');});
$('portal').addEventListener('click',e=>{if(preview){e.preventDefault();note('Sur un compte réel, ce lien ouvre la gestion de l’abonnement.');}});
$('subscribe').onclick=action(async()=>{const result=await api('checkout',{});location.assign(result.url);});
$('close-player').onclick=closeFilm;
$('film-player').addEventListener('error',()=>{const f=videos.find(x=>x.id===playing);if(!f)return;const player=$('film-player');if(f.alternate&&player.src===f.alternate){player.src=f.url;player.play().catch(()=>{});}else note('Cette vidéo est momentanément indisponible.');});
$('film-player').addEventListener('timeupdate',async()=>{const p=$('film-player');if(!member||recorded||!playing||p.paused||p.currentTime<.5||document.hidden)return;recorded=true;const id=playing,uid=member.id;try{await api('journey',{memberId:uid,videos:[id]});if(member?.id===uid){member.journey=mergeJourney(member.journey,{videos:[id]});renderJourney();}}catch{if(playing===id)recorded=false;}});
window.addEventListener('hashchange',setPage);
window.addEventListener('pageshow',e=>{if(e.persisted)void openSpace();});
async function start(){
  await refresh();
  if(member&&!wantsPreview&&new URLSearchParams(location.search).get('abonnement')==='retour'){
    history.replaceState(null,'','/membre.html#abonnement');setPage();
    for(let attempt=0;attempt<5&&!member?.companion;attempt++){
      note('Stripe confirme ton abonnement…');await new Promise(r=>setTimeout(r,2200));if(!member)return;await refresh();
    }
    note(member?.companion?'Bienvenue, Compagnon de route.':'Confirmation en attente. Retrouve ton statut dans Mon abonnement.');
  }
}
let opening=false;
async function openSpace(){
  if(opening)return;
  opening=true;
  const retry=$('retry-opening');
  retry.hidden=true;
  note('Ouverture de ton espace…');
  try{
    await start();
  }catch(error){
    note(error.status===503?error.message:'La connexion au salon a été interrompue.');
    if(authorEntry){
      $('admin-return').href=adminURL(authorEntry);
      $('admin-return').hidden=false;
    }
    retry.hidden=false;
  }finally{
    opening=false;
  }
}
$('retry-opening').addEventListener('click',openSpace);
void openSpace();
