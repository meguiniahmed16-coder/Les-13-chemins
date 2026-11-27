// Only the guest entry can enter the public cinematic mode. The same authored scene and dressed avatar are used.
const guestEntryKey='croisee-invite-introduction-originale-v35';
const publicAssetOrigin='https://treize-chemins-intro-public.meguiniahmed16.workers.dev';
export function isGuestCinema(search){const q=new URLSearchParams(search);return q.get('salon')==='1'&&q.get('retour')==='invite'&&q.get('public')==='1';}
export function publicCinemaAsset(url){
 if(!/^\/api\/intro-private\/(ahmedfast|ahmedv3)\/\d{3}$/.test(url))throw Error('Ressource de cinématique non publique.');
 return publicAssetOrigin+url.replace('/api/intro-private/','/api/intro-public/');
}
export function guestReturn(search,shortGuide=false){
 const target=new URLSearchParams({intro:'terminee'}),action=new URLSearchParams(search).get('ouvrir');
 if(['inviter','appeler'].includes(action))target.set('ouvrir',action);
 if(shortGuide)target.set('guide','1');
 return '/salon-invite.html?'+target.toString();
}
export function completeGuestCinema(win,shortGuide=false){
 try{win.sessionStorage.setItem(guestEntryKey,'done');}catch{}
 win.location.replace(guestReturn(win.location.search,shortGuide));
}
// Public visitors can only read the already archived fixed lines, not generate
// new speech or enumerate the author's private provider voice account.
export function createPublicCinemaRequest(fetcher=fetch){
 let manifest=null;
 const endpoint='/api/membres/voice/cinema-recordings';
 const readManifest=()=>manifest??=(async()=>{const response=await fetcher(endpoint,{credentials:'omit',signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error('Les voix enregistrées sont momentanément indisponibles.');return response.json();})().catch(error=>{manifest=null;throw error;});
 return async (path,{body}={})=>{
  if(path==='voices')return readManifest();
  if(path!=='speech'||body?.purpose!=='cinema'||body.strict!==true)throw Error('Réplique de cinématique invalide.');
  const catalog=await readManifest(),key=catalog.recordings?.[body.gender+'|'+body.text];
  if(!/^[a-f0-9]{64}$/.test(key||''))throw Error('Cette réplique n’a pas encore été enregistrée. Les bulles restent disponibles.');
  const response=await fetcher(endpoint+'?key='+key,{credentials:'omit',signal:AbortSignal.timeout(45000)});
  if(!response.ok||!/^audio\//i.test(response.headers.get('content-type')||''))throw Error('Réplique enregistrée indisponible.');
  const clip=await response.blob();if(!clip.size||clip.size>4*1024*1024)throw Error('Enregistrement invalide.');
  clip.voiceProvider=response.headers.get('x-voice-provider');return clip;
 };
}
