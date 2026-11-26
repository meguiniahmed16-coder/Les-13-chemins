import {createHash} from 'node:crypto';
import {getStore} from '@netlify/blobs';

// Only the fixed authored cinematic is stored. Live calls and personalised text
// always use the existing service and are never included in this archive.
const fixedCinemaLines=new Set([
 "homme|Qu’est-ce qu’une rencontre ? Qu’est-ce que véritablement l’autre ?",
 "homme|Est-ce simplement quelqu’un qui me ressemble ?",
 "femme|Une rencontre n’est pas un miroir… C’est un espace où l’on se dépose, sans masque, ou presque.",
 "homme|Prends place.",
 "femme|Ici, on laisse dehors le bruit, les rôles, les étiquettes…",
 "homme|Un monde de masques. Un monde d’illusions.",
 "femme|Et pourtant… c’est aussi un lieu de vérité, de jeux, de désir, de création…",
 "homme|Ici, on peut être tour à tour lecteur, acteur, voyageur… ou simplement soi.",
 "femme|Tu es libre d’explorer, de construire, de rencontrer, d’imaginer…",
 "homme|Tout a commencé par l’aventure d’Ahmed Marie, l’auteur de ce site et du manuscrit La Tectonique des âmes.",
 "femme|Plus de cinq cents pages, et le récit continue de s’écrire. Comme ce site, le manuscrit est une œuvre qui se construit jour après jour.",
 "homme|Ici, nous te proposons de vivre une expérience immersive et de rencontrer, aussi fidèlement que possible, les personnes qu’Ahmed a croisées sur son chemin.",
 "femme|Plus de quatre cents personnages habitent déjà cet univers. Leurs histoires, leurs liens et leur continuité s’affinent et s’enrichissent au fil du travail sur le texte.",
 "homme|Alors…",
 "femme|…on commence ?",
 "femme|La Croisée des Âmes, c’est un espace en construction… Un lieu pour lire, jouer, créer, dialoguer, apprendre, et peut-être se transformer.",
 "homme|Bienvenue.",
 "homme|Voici l’interface du Salon. Appuie sur Menu : les icônes apparaissent. Appuie encore : elles se replient.",
 "femme|L’icône Caméra te permet de tourner autour de nous, de zoomer et de changer de point de vue.",
 "homme|Avec le joystick, tu peux avancer, reculer et marcher dans la pièce. Regarde, Marianne te montre.",
 "homme|Si tu perds ton personnage de vue, touche Recentrer. Tu le retrouves sans devoir tout recommencer.",
 "homme|Pour modifier ton personnage, ouvre Menu, puis Avatar. Les icônes permettent de régler le corps, le visage et la silhouette.",
 "femme|Le volet est translucide : tu continues de voir mon visage et les personnages pendant les changements. Une seconde pression le replie.",
 "homme|Pour changer de tenue, sélectionne Vêtements. Choisis une chemise, un pantalon ou des chaussures sans quitter le Salon.",
 "femme|Enregistrer garde tes choix. Invite un personnage, puis touche le petit téléphone pour parler.",
 "homme|Avec ce pictogramme, tu ajoutes un personnage du livre. Choisis-le dans le répertoire : il viendra nous rejoindre ici.",
 "femme|Une fois ton invité arrivé, touche le petit téléphone du Salon. Tu lui parles directement, et il te répond à voix haute.",
 "homme|Les bulles de dialogue sont facultatives. Cette icône les affiche ou les masque. Les voix continuent, même si tu retires les bulles.",
 "homme|Avant le parc et ses papillons, faisons une rencontre dans le salon.",
 "homme|Invitons un personnage du texte d’Ahmed Marie. Le voici !",
 "femme|Regarde, on peut changer de personnage. En voici un autre.",
 "homme|Touche le petit téléphone pour lui parler de vive voix.",
 "homme|Ah, j’oubliais aussi… il y a des options sympas."
]);
const maxCinemaAudio=4*1024*1024;
const providers=new Set(['cartesia','elevenlabs','azure']);
const audioTypes=new Set(['audio/wav','audio/x-wav','audio/wave','audio/mpeg','audio/mp3']);
const correctedCue='Si tu perds ton personnage de vue, touche Recentrer. Tu le retrouves sans devoir tout recommencer.';
export function cinematicSpeechBody(body){
 const cue=JSON.parse(body);
 if(cue.gender==='homme'&&cue.text===correctedCue)return JSON.stringify({...cue,text:cue.text.replace('touche Recentrer.','touche recentré.')});
 return body;
}
export function cinematicAudioKey(body){
 let cue;try{cue=JSON.parse(body);}catch{return null;}
 if(!cue||cue.purpose!=='cinema'||cue.strict!==true||typeof cue.voiceId!=='string'||!/^[-A-Za-z0-9_]{1,80}$/.test(cue.voiceId)||Object.keys(cue).some(k=>!['purpose','strict','voiceId','gender','text'].includes(k))||!fixedCinemaLines.has(cue.gender+'|'+cue.text))return null;
 return createHash('sha256').update(JSON.stringify([cue.gender==='homme'&&cue.text===correctedCue?'cinema-audio-v1-recentrer-v2':'cinema-audio-v1',cue.gender,cue.voiceId,cue.text])).digest('hex');
}
// Fixed cinematics are paid once and served only after durable storage.
// A separate claim store prevents parallel requests from paying twice.
const cinemaStore=()=>getStore({name:'cinema-audio-v1',consistency:'strong'});
const cinemaClaims=()=>getStore({name:'cinema-audio-preparation-v1',consistency:'strong'});
const cacheFailure=message=>Response.json({error:message},{status:503,headers:{'cache-control':'private, no-store'}});
const validRecording=entry=>entry?.data?.byteLength>0&&entry.data.byteLength<=maxCinemaAudio&&providers.has(entry.metadata?.provider)&&audioTypes.has(entry.metadata?.type);
const recordedResponse=(entry,status)=>new Response(entry.data,{headers:{'content-type':entry.metadata.type,'x-voice-provider':entry.metadata.provider,'x-cinema-audio-cache':status}});
export async function serveCinemaAudio({key,upstream,authorize,cue=null,storeFactory=cinemaStore,claimFactory=cinemaClaims,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}){
 // Both hits and misses retain the same author-only authorization.
 if(!await authorize())return Response.json({error:'Connexion auteur requise.'},{status:403});
 try{
  const store=storeFactory();
  const read=()=>store.getWithMetadata(key,{type:'arrayBuffer',consistency:'strong'});
  let entry=await read();
  if(validRecording(entry))return recordedResponse(entry,'hit');
  if(entry)return cacheFailure('Enregistrement vocal invalide. Aucune nouvelle synthèse automatique.');
  const claims=claimFactory();
  const claim=await claims.set(key,'preparation',{onlyIfNew:true});
  if(!claim?.modified){
   // Another request may already be writing this file; read, never resynthesise.
   for(let n=0;n<40;n++){await wait(500);entry=await read();if(validRecording(entry))return recordedResponse(entry,'hit');}
   return cacheFailure('Enregistrement vocal en cours ou interrompu. Aucune nouvelle synthèse automatique.');
  }
  // Recheck in case another deployment populated the recording.
  entry=await read();if(validRecording(entry))return recordedResponse(entry,'hit');
  if(entry)return cacheFailure('Enregistrement vocal invalide.');
  const response=await upstream();
  if(!response.ok){await claims.delete(key);return response;}
  const provider=response.headers.get('x-voice-provider'),type=(response.headers.get('content-type')||'').split(';')[0].toLowerCase();
  if(!providers.has(provider)||!audioTypes.has(type))return cacheFailure('Le fournisseur n’a pas renvoyé un fichier vocal valide.');
  const data=await response.arrayBuffer();
  if(!data.byteLength||data.byteLength>maxCinemaAudio)return cacheFailure('Le fichier vocal est vide ou trop volumineux.');
  // Do not release the claim after successful synthesis, even if writing fails.
  // This avoids a second paid generation after a storage error.
  const metadata={provider,type,...(cue?{speaker:cue.gender==='homme'?'Ahmed Marie':'Marianne',text:cue.text,voiceId:cue.voiceId}: {})};
  await store.set(key,data,{metadata,onlyIfNew:true});
  entry=await read();
  if(!validRecording(entry))return cacheFailure('Le son a été généré mais son enregistrement n’a pas été confirmé. Aucune nouvelle synthèse automatique.');
  return recordedResponse(entry,'stored');
 }catch{
  return cacheFailure('Stockage vocal indisponible. La synthèse répétée est bloquée pour préserver les crédits.');
 }
}

const origin='https://tectonique-des-ames.com';
const backend='https://treize-chemins-membres.meguiniahmed16.workers.dev';
async function voiceBody(request,max){
  if(request.signal.aborted)throw new DOMException('Request cancelled','AbortError');
  const length=request.headers.get('content-length');
  if(length&&/^\d+$/.test(length)&&Number(length)>max){await request.body?.cancel().catch(()=>{});throw Object.assign(Error(),{status:413});}
  const reader=request.body?.getReader();if(!reader)return new Uint8Array();
  const parts=[];let total=0;
  const cancel=()=>{void reader.cancel().catch(()=>{});};
  request.signal.addEventListener('abort',cancel,{once:true});
  try{
    for(;;){
      const part=await reader.read();
      if(request.signal.aborted)throw new DOMException('Request cancelled','AbortError');
      if(part.done)break;
      total+=part.value.byteLength;
      if(total>max){await reader.cancel().catch(()=>{});throw Object.assign(Error(),{status:413});}
      parts.push(part.value);
    }
    const data=new Uint8Array(total);let at=0;for(const part of parts){data.set(part,at);at+=part.byteLength;}return data;
  }finally{request.signal.removeEventListener('abort',cancel);reader.releaseLock();}
}
export default async function proxy(request){
  const url=new URL(request.url);
  if(url.origin!==origin||!['GET','POST'].includes(request.method))return new Response(null,{status:403});
  if(request.method==='POST'&&request.headers.get('origin')!==origin)return new Response(null,{status:403});
  if(url.pathname.endsWith('/stripe'))return new Response(null,{status:404});
  const cookies=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).filter(s=>/^__Host-(?:chemins-(?:oauth|membre)|am_site_admin|editor-admin)=/.test(s));
  const headers={'content-type':'application/json',cookie:cookies.join('; '),origin};
  const voice=url.pathname.startsWith('/api/membres/voice/'),audio=url.pathname==='/api/membres/voice/transcribe';
  try{
    let data;
    if(request.method==='POST'){
      if(voice){
        const content=await voiceBody(request,audio?2*1024*1024:48*1024);
        if(audio){data=content;headers['content-type']=request.headers.get('content-type')||'application/octet-stream';}
        else{try{data=new TextDecoder('utf-8',{fatal:true}).decode(content);}catch{return Response.json({error:'Le message est illisible.'},{status:400,headers:{'cache-control':'no-store'}});}}
      }else{data=await request.text();if(data.length>16000)return new Response(null,{status:413});}
    }
    let target=backend+url.pathname+url.search,body=data;
    if(request.method==='POST' && ['/api/membres/login','/api/membres/signup'].includes(url.pathname)){
      let identity;
      try{identity=JSON.parse(data);}catch{}
      if(typeof identity?.email==='string'&&identity.email.trim().toLowerCase()==='meguiniahmed16@gmail.com'){
        if(url.pathname.endsWith('/signup'))return Response.json({error:'Cette adresse possède déjà un compte.'},{status:409,headers:{'cache-control':'no-store'}});
        target='https://ahmed-marie-double.meguiniahmed16.workers.dev/web-admin/auth/login';
        body=JSON.stringify({username:'admin',password:identity.password});
      }
    }
    const signal=AbortSignal.any([request.signal,AbortSignal.timeout(voice?75000:20000)]);
    const isSpeech=request.method==='POST'&&url.pathname==='/api/membres/voice/speech';
    let cue=null;if(isSpeech){try{cue=JSON.parse(body);}catch{}}
    const key=isSpeech?cinematicAudioKey(body):null;
    if(cue?.purpose==='cinema'&&!key)return Response.json({error:'Cette réplique ne figure pas dans la cinématique enregistrée.'},{status:400,headers:{'cache-control':'private, no-store'}});
    const upstream=()=>fetch(target,{method:request.method,headers,body:key?cinematicSpeechBody(body):body,redirect:'manual',signal});
    const response=key?await serveCinemaAudio({key,cue,upstream,authorize:async()=>{
      const check=await fetch(backend+'/api/membres/me?auteur=1',{method:'GET',headers,redirect:'manual',signal});
      if(!check.ok)return false;
      const {author}=await check.json();return author==='atelier'||author==='edition'||author===true;
    }}):await upstream();
    const out=new Headers({'cache-control':'private, no-store','netlify-cdn-cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'});
    for(const k of ['location','content-type','set-cookie','vary','x-frame-options','x-robots-tag','permissions-policy','content-security-policy','cross-origin-resource-policy','x-voice-provider','x-voice-fallback','x-cinema-audio-cache'])if(response.headers.has(k))out.set(k,response.headers.get(k));
    return new Response(response.body,{status:response.status,headers:out});
  }catch(error){
    if(request.signal.aborted)return Response.json({error:'Conversation interrompue.'},{status:499,headers:{'cache-control':'no-store'}});
    if(error.status===413)return Response.json({error:'Le fichier ou le message est trop volumineux.'},{status:413,headers:{'cache-control':'no-store'}});
    return Response.json({error:'Connexion momentanément indisponible.'},{status:503,headers:{'cache-control':'no-store'}});
  }
}
export const config={path:'/api/membres/*'};
