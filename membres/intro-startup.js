const storageKey='maison-des-rencontres-prologue-original-v3';

// This small shell must run before Three and the scene create their renderer.
// An early graphics/module failure otherwise leaves the static 0% screen up
// with no retry button and no working error report.
export function showIntroStartupFailure(error,{document:doc=globalThis.document,window:win=globalThis.window}={}){
 const $=id=>doc.getElementById(id),message=String(error?.message||error||'Démarrage interrompu').slice(0,3000);
 const graphics=/webgl|graphics context|rendering context/i.test(message);
 $('loading').hidden=false;$('loading').classList.add('startup-failed');$('welcome').hidden=true;
 $('load-title').textContent=graphics?'Affichage 3D indisponible':'Le démarrage a été interrompu';
 $('load-description').textContent=graphics?
  'Ce navigateur ne peut pas afficher la cinématique en 3D. Réessaie ou ouvre cette page dans un navigateur compatible avec la 3D.':
  'La cinématique n’a pas pu démarrer. Vérifie ta connexion, puis réessaie.';
 $('load-progress').hidden=true;$('load-percent').hidden=true;$('load-error-details').hidden=true;
 $('loading').setAttribute('role','alert');$('skip').disabled=true;$('enter').disabled=true;
 const retry=$('retry-load');retry.hidden=false;retry.disabled=false;retry.onclick=()=>win.location.reload();

 let storage=null,entries=[];
 try{storage=win.localStorage;const prior=JSON.parse(storage.getItem(storageKey)||'[]');if(Array.isArray(prior))entries=prior.slice(-99);}catch{}
 function record(type,text){
  entries.push({date:new Date().toISOString(),type,step:-1,stage:'boot',message:String(text).slice(0,3000)});
  entries=entries.slice(-100);
  try{storage?.setItem(storageKey,JSON.stringify(entries));}catch{}
  $('report-count').textContent=entries.length+' entrées';
 }
 record('Démarrage de la cinématique',message);
 $('report-open').onclick=()=>{$('report-scene').value='Démarrage de la cinématique';$('report-dialog').showModal();};
 $('report-close').onclick=()=>$('report-dialog').close();
 $('report-add').onclick=()=>{const text=$('report-note').value.trim();if(text){record($('report-type').value,text);$('report-note').value='';}};
 $('report-export').onclick=()=>{
  const data={created:new Date().toISOString(),experience:'La Croisée des Âmes',step:-1,stage:'boot',viewport:{width:win.innerWidth,height:win.innerHeight},entries};
  const url=win.URL.createObjectURL(new win.Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const link=doc.createElement('a');link.href=url;link.download='rapport-croisee-des-ames-'+new Date().toISOString().slice(0,10)+'.json';link.click();
  win.setTimeout(()=>win.URL.revokeObjectURL(url),3000);
 };
}

export async function startIntro(load,environment){
 try{await load();return true;}
 catch(error){showIntroStartupFailure(error,environment);return false;}
}
