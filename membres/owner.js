const status=document.getElementById('status'),area=document.getElementById('owner-work');
const isEdition=new URLSearchParams(location.search).get('auteur')==='edition';
const adminDestination=isEdition?'/admin.html':'/admin-blog.html?view=membres';
const salonDestination='/membre.html?auteur='+(isEdition?'edition':'atelier')+'#avatar';
const backAdmin=document.getElementById('back-admin'),backSalon=document.getElementById('back-salon');
if(backAdmin)backAdmin.href=adminDestination;
if(backSalon)backSalon.href=salonDestination;
async function loadReference(onProgress){
  const base='/api/membres/admin/reference';
  const get=async path=>{const response=await fetch(path,{cache:'no-store',signal:AbortSignal.timeout(50000)});if(!response.ok)throw new Error('La session a expiré ou le modèle privé est indisponible.');return response;};
  const {chunks,compressedBytes,sha256}=await (await get(base)).json();
  if(!Number.isInteger(chunks)||chunks<1||chunks>90||compressedBytes<1||compressedBytes>90*1024*1024||!/^[0-9a-f]{64}$/.test(sha256))throw new Error('Le modèle de référence est incomplet.');
  const result=Array(chunks);let received=0,next=0;
  async function download(){
    while(next<chunks){
      const i=next++,piece=await (await get(base+'/'+String(i).padStart(3,'0'))).arrayBuffer();
      result[i]=piece;received+=piece.byteLength;onProgress?.(received,compressedBytes);
    }
  }
  await Promise.all(Array.from({length:Math.min(3,chunks)},download));
  if(received!==compressedBytes)throw new Error('Le téléchargement est incomplet. Réessaie.');
  const raw=await new Response(new Blob(result).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',raw)),v=>v.toString(16).padStart(2,'0')).join('');
  if(digest!==sha256)throw new Error('Le modèle de référence n’a pas pu être vérifié.');
  return new TextDecoder().decode(raw);
}
async function open(){
  const r=await fetch('/api/membres/admin/settings',{cache:'no-store'});if(r.status===401){const a=document.createElement('a');a.href=adminDestination;a.textContent='Se connecter à l’administration';status.replaceChildren(a);return;}
  if(!r.ok)throw new Error();
  const {label,reference}=await r.json(),{mountOwnerAvatar}=await import('/api/membres/admin/module');
  mountOwnerAvatar(area,{label,loadReference,onRename:async label=>{const r=await fetch('/api/membres/admin/label',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({label})});if(!r.ok)throw new Error();}});
  status.textContent='';const a=document.createElement('a');a.href=reference;a.textContent='Retrouver mon fichier Summer Man de référence';a.rel='noopener';a.target='_blank';status.append(a);
}
open().catch(()=>{status.textContent='L’atelier est momentanément indisponible. Recharge la page pour réessayer.';});
