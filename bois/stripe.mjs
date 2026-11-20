import {fail} from './model.mjs';
const enc=new TextEncoder();
const b64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes)));
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function vault(env){return crypto.subtle.importKey('raw',unb64(env.BOIS_VAULT),'AES-GCM',false,['encrypt','decrypt']);}
export async function saveKey(env,token){
 if(!/^rk_live_[A-Za-z0-9_]{15,250}$/.test(token))fail(400,'Saisis une clé restreinte de production Stripe.');
 const link=await stripe(token,'/payment_links/plink_1UdiTMPdtc1VYes6qnX4Tkte');
 if(!link.livemode)fail(400,'Le compte Stripe de production est requis.');
 await stripe(token,'/checkout/sessions?limit=1');
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},await vault(env),enc.encode(token));
 await env.DB.prepare("INSERT INTO bois_settings VALUES('stripe',?) ON CONFLICT(id) DO UPDATE SET value=excluded.value").bind(b64(iv)+'.'+b64(cipher)).run();
}
export async function getKey(env){
 if(env.STRIPE_RESTRICTED_KEY)return env.STRIPE_RESTRICTED_KEY;
 const value=await env.DB.prepare("SELECT value FROM bois_settings WHERE id='stripe'").first('value');if(!value)return '';
 const [iv,cipher]=value.split('.');return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(iv)},await vault(env),unb64(cipher)));
}
export async function stripe(token,path,params,idempotency){
 const headers={Authorization:'Bearer '+token,'Stripe-Version':'2026-10-28.endive'};
 if(idempotency)headers['Idempotency-Key']=idempotency;
 const r=await fetch('https://api.stripe.com/v1'+path,{method:params?'POST':'GET',headers,body:params?new URLSearchParams(params):undefined,signal:AbortSignal.timeout(15000)});
 const obj=await r.json();if(!r.ok){const err=new Error(r.status===401||r.status===403?'Vérifie les autorisations de la clé Stripe (Sessions Checkout et Liens de paiement).':'Stripe n’a pas pu préparer le paiement. Réessaie dans un instant.');err.status=502;err.definitive=[400,401,403,404].includes(r.status);throw err;}return obj;
}
export async function verifiedEvent(raw,sig,secret){
 if(!secret)fail(503,'Réception Stripe indisponible.');
 const parts=(sig||'').split(',');const t=parts.find(x=>x.startsWith('t='))?.slice(2);if(!/^\d+$/.test(t)||Math.abs(Date.now()/1000-Number(t))>300)fail(400,'Signature invalide.');
 const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 for(const v of parts.filter(x=>/^v1=[0-9a-f]{64}$/.test(x))){
 const bytes=Uint8Array.from(v.slice(3).match(/../g),x=>parseInt(x,16));if(await crypto.subtle.verify('HMAC',key,bytes,enc.encode(t+'.'+raw)))return JSON.parse(raw);}
 fail(400,'Signature invalide.');
}
