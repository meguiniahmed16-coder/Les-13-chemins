import {avatarCatalog} from './avatar-catalog.js';
import {games,scenes,videos,mergeJourney,importDeviceJourney,enableJourneyTracking,disableJourneyTracking} from './journey.js';

const $=id=>document.getElementById(id);
const el=(tag,text)=>{const node=document.createElement(tag);if(text)node.textContent=text;return node;};
const note=text=>{$('status').textContent=text;};
let photoGeneration=0;
let member,signup=false,appearance,playing='',recorded=false;
const base='/api/membres/';
async function api(path,data){
  const response=await fetch(base+path,{method:data?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:data?{'content-type':'application/json'}:undefined,body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(20000)});
  const result=await response.json();
  if(!response.ok)throw Object.assign(new Error(result.error||'Connexion indisponible.'),{status:response.status});
  return result;
}
function action(fn){return async event=>{
  event.preventDefault();const button=event.submitter||event.currentTarget;
  if(button.disabled)return;button.disabled=true;
  try{await fn(event);}catch(e){note(e.message||'La connexion a été interrompue.');}finally{button.disabled=false;}
};}
function mode(value){
  signup=value;$('choose-login').setAttribute('aria-pressed',String(!value));$('choose-signup').setAttribute('aria-pressed',String(value));
  $('auth-title').textContent=value?'Créer mon carnet':'Ouvrir mon carnet';
  $('signup-fields').disabled=!value;$('signup-fields').hidden=!value;
  $('password').autocomplete=value?'new-password':'current-password';$('password').minLength=value?10:1;
  $('auth-submit').textContent=value?'Créer mon compte':'Se connecter';
  note(value?'Choisis un mot de passe de dix caractères ou plus.':'');
}
function setPage(){
  if(!member)return;
  const names=['parcours','avatar','salon','abonnement','profil'];
  const key=!member.pseudo?'profil':names.includes(location.hash.slice(1))?location.hash.slice(1):'parcours';
  names.forEach(k=>{$(k).hidden=k!==key;const a=$('tabs').querySelector('[href="#'+k+'"]');if(k===key)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  if(key!=='parcours')closeFilm();
  if(key==='avatar'||key==='salon')void mountModel(key).catch(()=>note('L’affichage 3D a échoué. Rouvre cet onglet pour réessayer.'));
  else{$('portrait').replaceChildren();$('room').replaceChildren();}
}
async function mountModel(key){
  const target=$(key==='salon'?'room':'portrait'),other=$(key==='salon'?'portrait':'room');other.replaceChildren();
  await import('./avatar.js');if($(key).hidden||!member)return;
  let view=target.querySelector('chemins-avatar');
  if(!view){view=el('chemins-avatar');view.setAttribute('scene',key==='salon'?'salon':'portrait');target.append(view);}
  view.avatar=key==='salon'?member.avatar:appearance;
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
function wardrobe(){
  appearance={...member.avatar};$('choices').replaceChildren();
  for(const group of avatarCatalog){
    const label=el('label',group.label),select=el('select');select.name=group.key;
    for(const item of group.options){const opt=el('option',item.label+(item.companion?' · Compagnon de route':''));opt.value=item.id;opt.disabled=item.companion&&!member.companion;select.append(opt);}
    select.value=appearance[group.key];select.onchange=()=>{appearance[group.key]=select.value;const model=$('portrait').querySelector('chemins-avatar');if(model)model.avatar={...appearance};};label.append(select);$('choices').append(label);
  }
}
async function portraitPhoto(){
  const version=++photoGeneration;
  $('photo-link').hidden=!member;
  if(!member){$('photo').removeAttribute('src');return;}
  const key='membre-portrait:'+member.id, look=JSON.stringify(member.avatar);
  try{const cache=JSON.parse(sessionStorage.getItem(key)||'null');if(cache?.look===look&&cache.image.startsWith('data:image/')){$('photo').src=cache.image;return;}}catch{}
  $('photo').src='/assets/membres/summer-man.webp';
  await import('./avatar.js');
  if(version!==photoGeneration||!member)return;
  const view=el('chemins-avatar');view.className='photo-source';view.setAttribute('aria-hidden','true');view.inert=true;view.avatar=member.avatar;
  const timer=setTimeout(()=>view.remove(),20000);
  view.addEventListener('avatar-ready',()=>{try{
    const image=view.snapshot();
    if(image&&version===photoGeneration){$('photo').src=image;try{sessionStorage.setItem(key,JSON.stringify({look,image}));}catch{}}
  }finally{clearTimeout(timer);view.remove();}},{once:true});
  document.body.append(view);
}
async function refresh(){
  try{member=await api('me');}catch(e){if(e.status!==401)throw e;member=null;}
  void portraitPhoto().catch(()=>{});
  $('auth').hidden=Boolean(member);$('member').hidden=!member;$('logout').hidden=!member;
  if(!member){
    disableJourneyTracking();mode(false);
    const {providers}=await api('options');
    for(const key of ['google','facebook']){$(key).disabled=!providers[key];$(key).onclick=()=>location.assign(base+'oauth/'+key);}
    const unavailable=['Google','Facebook'].filter(k=>!providers[k.toLowerCase()]);
    $('provider-note').textContent=unavailable.length?'Connexion avec '+unavailable.join(' et ')+' à venir.':'';
    if(new URLSearchParams(location.search).has('connexion'))note('Connexion interrompue. Tu peux réessayer.');
    return;
  }
  enableJourneyTracking(member.id);
  for(const k of ['name','pseudo','birth'])$('profile-form').elements[k].value=member[k]||'';
  $('account-email').textContent=member.email;$('salon-name').textContent=[member.pseudo,member.age].filter(Boolean).join(' · ');
  $('plan-status').textContent=member.companion?'Ton accès est ouvert jusqu’au '+new Date(member.paidUntil*1000).toLocaleDateString('fr-FR')+'.':'Tu disposes des options gratuites.';
  $('portal').hidden=!member.portal;if(member.portal)$('portal').href=member.portal;
  $('subscribe').hidden=member.companion;wardrobe();renderJourney();setPage();
  note(member.pseudo?'':'Choisis ton pseudo et renseigne ta date de naissance pour entrer dans le salon.');
}
$('choose-login').onclick=()=>mode(false);$('choose-signup').onclick=()=>mode(true);
$('auth-form').onsubmit=action(async e=>{const form=e.target;await api(signup?'signup':'login',Object.fromEntries(new FormData(form)));form.reset();await refresh();});
$('logout').onclick=action(async()=>{await api('logout',{});disableJourneyTracking();closeFilm();$('room').replaceChildren();$('portrait').replaceChildren();await refresh();});
$('profile-form').onsubmit=action(async e=>{await api('profile',Object.fromEntries(new FormData(e.target)));await refresh();note('Ton profil est enregistré.');});
$('wardrobe').onsubmit=action(async()=>{const result=await api('avatar',{avatar:appearance});member.avatar=result.avatar;void portraitPhoto().catch(()=>{});note('Ton avatar est enregistré pour le salon.');});
$('import').onclick=action(async()=>{const found=importDeviceJourney();await api('journey',{memberId:member.id,...found});member.journey=mergeJourney(member.journey,found);renderJourney();note(Object.values(found).some(x=>x.length)?'Le parcours de cet appareil a été ajouté à ton carnet.':'Aucune ancienne étape enregistrée sur cet appareil.');});
$('subscribe').onclick=action(async()=>{const result=await api('checkout',{});location.assign(result.url);});
$('close-player').onclick=closeFilm;
$('film-player').addEventListener('error',()=>{const f=videos.find(x=>x.id===playing);if(!f)return;const player=$('film-player');if(f.alternate&&player.src===f.alternate){player.src=f.url;player.play().catch(()=>{});}else note('Cette vidéo est momentanément indisponible.');});
$('film-player').addEventListener('timeupdate',async()=>{const p=$('film-player');if(!member||recorded||!playing||p.paused||p.currentTime<.5||document.hidden)return;recorded=true;const id=playing,uid=member.id;try{await api('journey',{memberId:uid,videos:[id]});if(member?.id===uid){member.journey=mergeJourney(member.journey,{videos:[id]});renderJourney();}}catch{if(playing===id)recorded=false;}});
window.addEventListener('hashchange',setPage);
async function start(){
  await refresh();
  if(member&&new URLSearchParams(location.search).get('abonnement')==='retour'){
    history.replaceState(null,'','/membre.html#abonnement');setPage();
    for(let attempt=0;attempt<5&&!member?.companion;attempt++){
      note('Stripe confirme ton abonnement…');await new Promise(r=>setTimeout(r,2200));if(!member)return;await refresh();
    }
    note(member?.companion?'Bienvenue, Compagnon de route.':'Confirmation en attente. Retrouve ton statut dans Mon abonnement.');
  }
}
start().catch(()=>{note('Le carnet est momentanément indisponible. Recharge la page pour réessayer.');});
