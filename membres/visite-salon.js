import {generateAppearance} from './starting-appearance.js?v=incarnations33';
import {normaliseStudio} from './studio-look.js?v=incarnations33';

const $=id=>document.getElementById(id);
const video=$('tour'), stage=$('room'), offer=$('offer');
const storageKey='chemins-visite-personnage-v1';
let phase='intro', initial, timer, deadline, wallEnd, epoch=0, draft;
let introDone=false;
function newAvatar(){
  const gender=Math.random()<.5?'femme':'homme';
  return {id:crypto.randomUUID(),gender,looks:{[gender]:generateAppearance(gender,Math.floor(Math.random()*5),true).studio}};
}
function remember(){try{sessionStorage.setItem(storageKey,JSON.stringify(draft));}catch{}}
function profile(){
  let stored;
  try{stored=JSON.parse(sessionStorage.getItem(storageKey));}catch{}
  if(stored?.id&&['femme','homme'].includes(stored.gender)&&stored.looks?.[stored.gender])return stored;
  return newAvatar();
}
async function visit(method='GET'){
  const response=await fetch('/api/visite-salon',{method,credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(14000)});
  if(!response.ok)throw Error('La connexion au salon a été interrompue.');
  const data=await response.json();
  if(!['new','active','expired'].includes(data.state)||(data.state==='active'&&!Number.isFinite(data.remaining)))throw Error('La visite ne répond pas.');
  return data;
}
function finish(){
  if(phase==='ended')return;
  epoch++;phase='ended';clearInterval(timer);video.pause();
  if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  stage.replaceChildren();
  $('intro').hidden=$('live-room').hidden=$('retry').hidden=true;$('status').textContent='';
  $('goodbye').hidden=false;document.body.classList.remove('visiting');
  offer.showModal();$('offer-title').focus({preventScroll:true});
}
function displayTime(){
  const seconds=Math.ceil(Math.min(deadline-performance.now(),wallEnd-Date.now())/1000);
  if(seconds<=0){finish();return;}
  $('remaining').textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
}
function setTime(ms){
  // A second tab or a slow status request can only shorten an existing visit.
  deadline=Math.min(deadline??Infinity,performance.now()+ms);
  wallEnd=Math.min(wallEnd??Infinity,Date.now()+ms);
  clearInterval(timer);timer=setInterval(displayTime,250);displayTime();
}
function retry(error){
  if(phase==='ended')return;
  epoch++;stage.replaceChildren();phase='retry';
  $('retry').hidden=false;$('status').textContent=error.message||'Le salon n’a pas pu s’ouvrir.';
}
async function enter(state){
  if(!['intro','retry'].includes(phase))return;
  if(state.state==='expired'){finish();return;}
  phase='loading';introDone=true;const ticket=++epoch;
  $('retry').hidden=$('intro').hidden=true;video.pause();
  document.body.classList.add('visiting');$('live-room').hidden=false;$('status').textContent='Ton avatar rejoint le salon…';
  if(state.state==='active')setTime(state.remaining);
  await import('./salon-v27.js?v=incarnations33');
  if(ticket!==epoch)return;
  draft=profile();remember();
  const save=async(gender,look)=>{if(ticket!==epoch)throw Error('La visite est terminée.');draft.looks[gender]=normaliseStudio(look,true,undefined,gender);remember();};
  const view=document.createElement('chemins-salon');view.setAttribute('scene','salon');
  const ready=new Promise(resolve=>view.addEventListener('avatar-ready',resolve,{once:true}));
  stage.replaceChildren(view);
  await Promise.all([ready,view.configure(draft.looks[draft.gender],{
    gender:draft.gender,memberKey:'invite-'+draft.id,temporary:true,plus:true,privateURL:'',
    savedStudio:draft.looks[draft.gender],salonLooks:draft.looks,change:()=>{},saveCharacter:save,save:look=>save(draft.gender,look)
  })]);
  if(ticket!==epoch)return;
  const start=()=>visit('POST');
  const lease=navigator.locks?await navigator.locks.request('salon-demarrer-visite',start):await start();
  if(ticket!==epoch)return;
  if(lease.state!=='active'){finish();return;}
  phase='live';setTime(lease.remaining);$('status').textContent='';
}
async function begin(){
  introDone=true;
  try{await enter(await initial);}catch(err){retry(err);}
}
function check(){
  initial=visit();
  initial.then(state=>{
    if(state.state==='expired'){finish();return;}
    if(state.state==='active'||introDone)return enter(state);
  }).catch(retry);
}
video.addEventListener('timeupdate',()=>{
  const t=video.currentTime;
  const hint=t<3.5?'Pousse le joystick de gauche pour avancer.':t<10?'Touche deux fois le fauteuil pour t’y installer.':'Fais glisser le joystick Caméra pour changer de point de vue.';
  if($('tour-hint').textContent!==hint)$('tour-hint').textContent=hint;
});
video.addEventListener('ended',begin);
video.addEventListener('error',()=>{$('skip').textContent='Entrer dans le salon';});
if(matchMedia('(prefers-reduced-motion: reduce)').matches){video.autoplay=false;video.pause();}
$('skip').onclick=begin;
$('retry').onclick=()=>{introDone=true;check();};
offer.addEventListener('cancel',e=>{e.preventDefault();location.assign('/');});
async function resume(){
  if(phase!=='live'&&phase!=='loading')return;
  if(deadline)displayTime();if(phase==='ended')return;
  const ticket=epoch;
  try{
    const lease=await visit();
    if(ticket!==epoch)return;
    if(lease.state==='expired'){finish();return;}
    if(lease.state==='active')setTime(lease.remaining);
  }catch{/* The deadline already issued still runs when the network is offline. */}
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)void resume();});
window.addEventListener('pageshow',e=>{if(e.persisted)void resume();});
check();
