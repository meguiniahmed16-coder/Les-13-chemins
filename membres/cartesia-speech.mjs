// Cartesia credentials stay server-side. API contract 2026-08-14.
const base='https://api.cartesia.ai';
const version='2026-08-14';
const uuid=/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const fail=(status,message)=>{throw Object.assign(Error(message),{voiceStatus:status});};
const headers=key=>({Authorization:'Bearer '+key,'Cartesia-Version':version});
async function checked(response){
 if(response.ok)return response;
 await response.body?.cancel().catch(()=>{});
 if([402,429].includes(response.status))fail(429,'Le quota Cartesia ou la limite de synthèses est atteint.');
 if([401,403].includes(response.status))fail(503,'Cartesia refuse la clé ou les droits de synthèse.');
 fail(503,'Cartesia est indisponible (HTTP '+response.status+').');
}
const voiceCache=new Map();
export async function cartesiaVoices(key,signal,{force=false}={}){
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key));const cacheId=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
 const cached=voiceCache.get(cacheId);if(!force&&cached&&cached.expires>Date.now())return cached.voices;
 if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
 const lists=await Promise.all([['masculine','homme'],['feminine','femme']].map(async([gender,label])=>{
  const url=new URL(base+'/voices');url.searchParams.set('language','fr-FR');url.searchParams.set('gender',gender);url.searchParams.set('limit','100');
  const response=await checked(await fetch(url.href,{headers:{...headers(key),accept:'application/json'},redirect:'manual',signal}));
  const raw=await response.text();
  if(raw.length>4*1024*1024)fail(502,'Catalogue Cartesia trop volumineux.');
  let payload;try{payload=JSON.parse(raw);}catch{fail(502,'Catalogue Cartesia invalide.');}
  if(!Array.isArray(payload?.data))fail(502,'Catalogue Cartesia invalide.');
  return payload.data.filter(v=>uuid.test(v?.id)&&v.gender===gender&&typeof v.name==='string'&&v.status!=='archived').sort((a,b)=>Number(b.language==='fr'&&b.country==='FR')-Number(a.language==='fr'&&a.country==='FR')).map(v=>({id:v.id,name:v.name.slice(0,100),gender:label,description:'Français (France) · '+String(v.description||'').slice(0,260)}));
 }));
 const voices=[...new Map(lists.flat().map(v=>[v.id,v])).values()];
 if(!voices.some(v=>v.gender==='homme')||!voices.some(v=>v.gender==='femme'))fail(503,'Cartesia ne renvoie pas de voix françaises des deux genres.');
 if(voiceCache.size>=8)voiceCache.delete(voiceCache.keys().next().value);
 voiceCache.set(cacheId,{expires:Date.now()+300000,voices});
 return voices;
}
export async function cartesiaSpeech(key,voiceId,spoken,signal){
 if(!uuid.test(voiceId))fail(400,'Identifiant vocal Cartesia invalide.');
 const response=await checked(await fetch(base+'/tts/bytes',{method:'POST',headers:{...headers(key),'Content-Type':'application/json',accept:'audio/wav'},body:JSON.stringify({model_id:'sonic-3.6',transcript:spoken,voice:voiceId,language:'fr-FR',output_format:{container:'wav',encoding:'pcm_s16le',sample_rate:24000}}),redirect:'manual',signal}));
 const type=(response.headers.get('content-type')||'').split(';')[0].trim();
 if(!response.body||!['audio/wav','audio/x-wav','audio/wave','application/octet-stream'].includes(type)){await response.body?.cancel().catch(()=>{});fail(502,'Cartesia n’a pas renvoyé de son WAV.');}
 return response.body;
}
