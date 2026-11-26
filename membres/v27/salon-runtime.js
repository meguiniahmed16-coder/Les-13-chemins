export const SALON_ARRIVAL_SCOPE='salon-arrival-v1';
export const SALON_NAME='La Croisée des Âmes';

// Installed before importing the large scene module: import failures, rejected
// model loads and a late subscriber all receive the same explicit state.
export function installSalonRuntime({win=window,doc=document,timeoutMs=100000,timers=win}={}){
 if(win.salonArrival)return win.salonArrival;
 let deadline=0,ready=false,reloading=false;
 let state={phase:'loading',stage:'module',message:'Ouverture de '+SALON_NAME+'…',code:'',canRetry:false,name:SALON_NAME,personalization:'loading'};
 const snapshot=()=>({...state,ready});
 const notify=()=>{
  const detail=snapshot();
  win.dispatchEvent(new win.CustomEvent('salon-arrival-state',{detail}));
  if(win.parent&&win.parent!==win)win.parent.postMessage({scope:SALON_ARRIVAL_SCOPE,type:'state',state:detail},win.location.origin);
  return detail;
 };
 const clearDeadline=()=>{if(deadline)timers.clearTimeout(deadline);deadline=0;};
 function armDeadline(){clearDeadline();deadline=timers.setTimeout(()=>fail('Le chargement prend trop de temps. Tu peux réessayer sans quitter l’introduction.','LOAD_TIMEOUT'),timeoutMs);}
 function progress(stage,message){
  if(ready||reloading)return snapshot();
  state={...state,phase:'loading',stage,message:message||state.message,code:'',canRetry:false};
  const text=doc.getElementById('loadingText');if(text)text.textContent=state.message;
  const retry=doc.getElementById('retry');if(retry)retry.hidden=true;
  armDeadline();return notify();
 }
 function fail(error,code='SCENE_ERROR'){
  if(reloading)return snapshot();clearDeadline();ready=false;
  const raw=String(error?.message||error||'Le chargement a été interrompu.');
  const auth=/HTTP (401|403)|session.*(expir|requise)|accès auteur/i.test(raw);
  state={...state,phase:'error',message:auth?'Ta session auteur doit être rouverte depuis l’administration.':raw,code:auth?'AUTHOR_SESSION':code,canRetry:true};
  doc.body.classList.remove('ready');
  const loading=doc.getElementById('loading');if(loading)loading.hidden=false;
  const text=doc.getElementById('loadingText');if(text)text.textContent=state.message;
  const retry=doc.getElementById('retry');if(retry){retry.hidden=false;retry.disabled=false;}
  return notify();
 }
 function markReady(){
  if(reloading||!win.salonV27)return snapshot();clearDeadline();ready=true;
  state={...state,phase:'ready',stage:'scene',message:SALON_NAME+' est prête.',code:'',canRetry:false};
  doc.body.classList.add('ready');const loading=doc.getElementById('loading');if(loading)loading.hidden=true;
  return notify();
 }
 function personalization(status,message=''){
  state={...state,personalization:status,personalizationMessage:message};return notify();
 }
 function retry(){
  if(reloading)return false;reloading=true;ready=false;clearDeadline();
  state={...state,phase:'loading',stage:'retry',message:'Nouvelle ouverture de '+SALON_NAME+'…',code:'',canRetry:false};
  const button=doc.getElementById('retry');if(button)button.disabled=true;
  notify();win.location.reload();return true;
 }
 const api={snapshot,progress,fail,markReady,personalization,retry,get ready(){return ready;}};
 win.salonArrival=api;win.failure=fail;
 win.addEventListener('salon-ready',markReady);
 win.addEventListener('message',event=>{
  if(event.origin!==win.location.origin||event.source!==win.parent||event.data?.scope!==SALON_ARRIVAL_SCOPE)return;
  const action=event.data.action||event.data.type;
  if(action==='status'||action==='request-state')notify();
  else if(action==='retry')retry();
 });
 win.addEventListener('error',event=>fail(event.error||event.message||'Un fichier nécessaire à la scène n’a pas été chargé.','SCRIPT_ERROR'));
 win.addEventListener('unhandledrejection',event=>fail(event.reason,'SCENE_REJECTION'));
 win.addEventListener('pagehide',clearDeadline,{once:true});
 const button=doc.getElementById('retry');if(button)button.onclick=retry;
 progress('module',state.message);return api;
}

export async function bootSalon({win=window,doc=document,load=path=>import(path),runtime=installSalonRuntime({win,doc})}={}){
 const arrival=new URLSearchParams(win.location.search).get('arrival')==='cinema';
 const solo=new URLSearchParams(win.location.search).get('ahmed')==='solo';
 if(solo){doc.body.classList.add('ahmed-solo');doc.title='Ahmed numérique';}
 if(arrival){
  doc.title=SALON_NAME;doc.body.classList.add('cinema-arrival');
  if(new URLSearchParams(win.location.search).get('finale')==='1')doc.body.classList.add('intro-finale');
 }
 try{await load(new URL(solo?'./scene-bundle.js?v=call58&rev=ahmeddirect3':'./scene-bundle.js?v=call58',import.meta.url).href);}
 catch(error){runtime.fail(error,'SCENE_MODULE');return false;}
 // The editor is optional to rendering. Its own failure must never replace a
 // successfully rendered garden with the full-screen 3D error panel.
 if(arrival){
  try{await load(new URL('./arrival-personalization.js?v=incarnations33',import.meta.url).href);}
  catch(error){runtime.personalization('error',String(error?.message||error));}
 }
 return true;
}

if(typeof window!=='undefined'&&typeof document!=='undefined')void bootSalon();
