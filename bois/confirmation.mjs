import {money} from './model.mjs';
export async function saveConfirmation(o) {
  const version=o.termsVersion;
  if (version&&!/^\d{4}-\d{2}-\d{2}$/.test(version)) throw Error('Version des conditions inconnue.');
  let html='<html lang="fr"><head><meta charset="utf-8"></head><body></body></html>';
  if(version){
    const res=await fetch('/conditions-'+version+'.html');
    if(!res.ok)throw Error('Les conditions sont momentanément indisponibles. Réessayez.');
    html=await res.text();
  }
  const doc=new DOMParser().parseFromString(html,'text/html');
  const heading=doc.createElement('h1');heading.textContent='Confirmation de commande';
  const detail=doc.createElement('p');
  detail.style.whiteSpace='pre-line';
  detail.textContent=['La tectonique des âmes · L’odeur du bois','Création d’Ahmed Marie · Coopérative Oriú · SIRET 812 311 405 00011','Référence : '+o.id,'Commande du '+new Date(o.created*1000).toLocaleDateString('fr-FR',{timeZone:'Europe/Paris'}),o.title+' · '+o.variant+' · quantité : 1','Prix : '+money(o.price),'Livraison : '+o.delivery+' · '+money(o.fee),'Total payé : '+money(o.price+o.fee),'Contact : ahmedmarie@tectonique-des-ames.com · 07 58 21 68 55'].join('\n');
  doc.body.prepend(heading,detail);doc.title='Confirmation de commande · La tectonique des âmes';
  const url=URL.createObjectURL(new Blob(['<!doctype html>\n',doc.documentElement.outerHTML],{type:'text/html;charset=utf-8'}));
  const link=document.createElement('a');link.download='commande-'+o.id+'.html';link.href=url;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
