import {fail} from './identity.mjs';

const names=['google','facebook'];
const encode=bytes=>btoa(String.fromCharCode(...bytes));
const decode=value=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
const utf8=new TextEncoder();

async function encryptionKey(env){
  if(!env.OAUTH_SETTINGS_KEY)fail(503,'Le coffre des connexions est indisponible.');
  return crypto.subtle.importKey('raw',decode(env.OAUTH_SETTINGS_KEY),'AES-GCM',false,['encrypt','decrypt']);
}
export async function providerKeys(env,provider){
  const prefix=provider.toUpperCase();
  const row=await env.DB.prepare('SELECT value FROM member_admin_settings WHERE key=?').bind('oauth:'+provider).first();
  if(!row)return {id:env[prefix+'_CLIENT_ID'],secret:env[prefix+'_CLIENT_SECRET']};
  const {iv,data}=JSON.parse(row.value);
  const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(iv),additionalData:utf8.encode(provider)},await encryptionKey(env),decode(data));
  return JSON.parse(new TextDecoder().decode(bytes));
}
export async function availability(env){
  const entries=await Promise.all(names.map(async name=>{
    const keys=await providerKeys(env,name);
    return [name,Boolean(keys.id && keys.secret)];
  }));
  return Object.fromEntries(entries);
}
export async function saveProvider(env,{provider,id,secret}){
  if(!names.includes(provider) || typeof id!=='string'||typeof secret!=='string')fail(400,'Identifiants d’application incomplets.');
  id=id.trim();secret=secret.trim();
  const validId=provider==='google'?/^[\w.-]+\.apps\.googleusercontent\.com$/:/^\d+$/;
  if(!validId.test(id)||id.length>256||secret.length<8||secret.length>512||/\s/.test(secret))fail(400,'Vérifie les identifiants de cette application.');
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const data=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:utf8.encode(provider)},await encryptionKey(env),utf8.encode(JSON.stringify({id,secret})));
  await env.DB.prepare('INSERT INTO member_admin_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
    .bind('oauth:'+provider,JSON.stringify({iv:encode(iv),data:encode(new Uint8Array(data))})).run();
}
