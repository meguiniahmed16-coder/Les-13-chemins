// Azure Speech regional REST transport; no secret or arbitrary URL comes from the browser.
const regionPattern=/^[a-z][a-z0-9]{2,29}$/;
export function azureConfig(credential){
 const i=typeof credential==='string'?credential.indexOf(':'):-1;
 const region=i>0?credential.slice(0,i):'',key=i>0?credential.slice(i+1):'';
 if(!regionPattern.test(region)||!/^[-A-Za-z0-9_]{20,200}$/.test(key))throw Object.assign(Error('Renseigne la région Azure et la clé de la ressource Speech.'),{voiceStatus:400});
 return {region,key,base:'https://'+region+'.tts.speech.microsoft.com'};
}
const voicePattern=/^fr-FR-[A-Za-z0-9-]{1,65}Neural$/;
const fail=(status,message)=>{throw Object.assign(Error(message),{voiceStatus:status});};
async function checked(response){
 if(response.ok)return response;
 await response.body?.cancel().catch(()=>{});
 if(response.status===429)fail(429,'Le quota Azure Speech est atteint.');
 if([401,403].includes(response.status))fail(503,'Azure Speech refuse la clé ou la région. Vérifie la connexion.');
 fail(503,'Azure Speech est indisponible (HTTP '+response.status+').');
}
export async function azureVoices(credential,signal){
 const {base,key}=azureConfig(credential);
 const response=await checked(await fetch(base+'/cognitiveservices/voices/list',{headers:{'Ocp-Apim-Subscription-Key':key,accept:'application/json'},redirect:'manual',signal}));
 const raw=await response.text();
 if(raw.length>4*1024*1024)fail(502,'Catalogue Azure trop volumineux.');
 let list;try{list=JSON.parse(raw);}catch{fail(502,'Catalogue Azure invalide.');}
 if(!Array.isArray(list))fail(502,'Catalogue Azure invalide.');
 const unique=new Map();
 for(const v of list){
  if(v?.Locale!=='fr-FR'||!voicePattern.test(v.ShortName)||!['Male','Female'].includes(v.Gender))continue;
  unique.set(v.ShortName,{id:v.ShortName,name:String(v.LocalName||v.DisplayName||v.ShortName).slice(0,100),gender:v.Gender==='Male'?'homme':'femme',description:'Français (France) · voix neuronale'});
 }
 const voices=[...unique.values()];
 const rank=v=>v.id==='fr-FR-HenriNeural'||v.id==='fr-FR-DeniseNeural'?0:1;
 voices.sort((a,b)=>rank(a)-rank(b)||a.id.localeCompare(b.id));
 if(!voices.length)fail(503,'Aucune voix française Azure disponible dans cette région.');
 return voices;
}
const xml=value=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export async function azureSpeech(credential,voiceId,spoken,signal){
 const {base,key}=azureConfig(credential);
 if(!voicePattern.test(voiceId))fail(400,'Choisis une voix Azure française valide.');
 const ssml='<speak version="1.0" xml:lang="fr-FR"><voice name="'+xml(voiceId)+'">'+xml(spoken)+'</voice></speak>';
 const response=await checked(await fetch(base+'/cognitiveservices/v1',{method:'POST',headers:{'Ocp-Apim-Subscription-Key':key,'Content-Type':'application/ssml+xml','X-Microsoft-OutputFormat':'audio-24khz-48kbitrate-mono-mp3','User-Agent':'Tectonique-des-ames',accept:'audio/mpeg'},body:ssml,redirect:'manual',signal}));
 if(!response.body||!/^audio\/(mpeg|mp3)(;|$)/i.test(response.headers.get('content-type')||'')){await response.body?.cancel().catch(()=>{});fail(502,'Azure Speech n’a pas renvoyé de son MP3.');}
 return response.body;
}
