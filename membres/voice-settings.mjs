// Dedicated namespace and authenticated data keep voice credentials separate
// from the existing Google/Facebook connection vault.
const providers=new Map([['openai','OPENAI_API_KEY'],['elevenlabs','ELEVENLABS_API_KEY'],['azure','AZURE_SPEECH_KEY'],['cartesia','CARTESIA_API_KEY']]);
const utf8=new TextEncoder();
const encode=bytes=>btoa(String.fromCharCode(...bytes));
const decode=value=>Uint8Array.from(atob(value),character=>character.charCodeAt(0));
const fail=(status,message)=>{throw Object.assign(new Error(message),{voiceStatus:status});};
export function validateVoiceCredential(provider,key){
  if(!providers.has(provider)||typeof key!=='string'||key.length<20||key.length>512||/[\s\u0000-\u001f\u007f]/u.test(key))fail(400,'Vérifie la clé et le service choisis.');
}
async function encryptionKey(env){
  if(typeof env.OAUTH_SETTINGS_KEY!=='string'||!env.OAUTH_SETTINGS_KEY)fail(503,'Le coffre des connexions est momentanément indisponible.');
  try{return await crypto.subtle.importKey('raw',decode(env.OAUTH_SETTINGS_KEY),'AES-GCM',false,['encrypt','decrypt']);}
  catch{fail(503,'Le coffre des connexions est momentanément indisponible.');}
}
export async function voiceCredential(env,provider){
  if(!providers.has(provider))fail(400,'Service vocal inconnu.');
  const name='voice:'+provider;
  const row=await env.DB.prepare('SELECT value FROM member_admin_settings WHERE key=?').bind(name).first();
  // Saved credentials take priority. A damaged saved value fails closed instead
  // of silently reactivating an older environment credential.
  if(!row){if(provider==='azure')return env.AZURE_SPEECH_KEY&&env.AZURE_SPEECH_REGION?env.AZURE_SPEECH_REGION+':'+env.AZURE_SPEECH_KEY:'';return env[providers.get(provider)]||'';}
  try{
    const entry=JSON.parse(row.value);
    if(entry.version!==1||typeof entry.iv!=='string'||typeof entry.data!=='string'||entry.iv.length>32||entry.data.length>2048)throw Error();
    const iv=decode(entry.iv);if(iv.length!==12)throw Error();
    const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:utf8.encode(name)},await encryptionKey(env),decode(entry.data));
    const key=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
    validateVoiceCredential(provider,key);return key;
  }catch{fail(503,'La connexion vocale sauvegardée doit être renseignée de nouveau.');}
}
export async function saveVoiceCredential(env,provider,key,verify){
  validateVoiceCredential(provider,key);
  const encryption=await encryptionKey(env);
  // Verification must succeed before the existing stored credential is changed.
  await verify();
  const name='voice:'+provider,iv=crypto.getRandomValues(new Uint8Array(12));
  const data=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:utf8.encode(name)},encryption,utf8.encode(key));
  await env.DB.prepare('INSERT INTO member_admin_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
    .bind(name,JSON.stringify({version:1,iv:encode(iv),data:encode(new Uint8Array(data))})).run();
}
