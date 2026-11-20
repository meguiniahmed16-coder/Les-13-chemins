const form=document.querySelector('#declaration');
const review=document.querySelector('#revision');
const result=document.querySelector('#accuse');
const confirm=document.querySelector('#confirmer');
const edit=document.querySelector('#corriger');
let attempt;
let values;
function summary() {
  return 'Je déclare me rétracter du contrat suivant.\n'+values.contract+'\n\n'+values.name+'\n'+values.email;
}
form.addEventListener('submit',event=>{
  event.preventDefault(); if(!form.reportValidity())return;
  const next=Object.fromEntries(new FormData(form));
  if(!values||['name','email','contract'].some(k=>next[k]!==values[k]))attempt=crypto.randomUUID();
  values=next;
  document.querySelector('#recapitulatif').textContent=summary();
  form.hidden=true;review.hidden=false;edit.focus();
});
edit.onclick=()=>{review.hidden=true;form.hidden=false;form.elements.name.focus();};
confirm.onclick=async()=>{
  confirm.disabled=edit.disabled=true;document.querySelector('#erreur').textContent='';
  try{
    const response=await fetch('/api/creations/retractation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,id:attempt,confirm:true}),signal:AbortSignal.timeout(22000)});
    if(!response.ok)throw Error();
    const r=await response.json();
    const receipt='LA TECTONIQUE DES ÂMES — ACCUSÉ DE RÉCEPTION\nRétractation reçue le '+new Date(r.received).toLocaleString('fr-FR',{timeZone:'Europe/Paris',timeZoneName:'short'})+'\nRéférence : '+r.id+'\n\n'+summary()+'\n\nContact : ahmedmarie@tectonique-des-ames.com\n';
    document.querySelector('#copie').textContent=receipt;
    const link=document.querySelector('#telecharger-accuse');link.href=URL.createObjectURL(new Blob(['\uFEFF',receipt],{type:'text/plain;charset=utf-8'}));
    link.download='accuse-retractation-'+r.id+'.txt';
    review.hidden=true;result.hidden=false;link.focus();
    link.click();
  }catch{document.querySelector('#erreur').textContent='La réception n’a pas pu être confirmée. Réessayez ou écrivez à Ahmed par courriel.';}
  finally{confirm.disabled=edit.disabled=false;}
};
