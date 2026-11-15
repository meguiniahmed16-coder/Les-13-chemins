const enc = new TextEncoder();
const hex = value => Array.from(new Uint8Array(value), b => b.toString(16).padStart(2, '0')).join('');
const bytes = value => Uint8Array.from(value.match(/../g) || [], h => parseInt(h, 16));
export const COOKIE = '__Host-am_site_admin';
const AGE = 7 * 86400;
export async function checkPassword(password, stored) {
  const [salt, expected] = (stored || '').split(':');
  if (!salt || !/^[a-f0-9]{64}$/.test(expected || '') || typeof password !== 'string' || password.length > 200) return false;
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},key,256);
  return crypto.subtle.timingSafeEqual(derived, bytes(expected));
}
async function key(secret, usages) {
  return crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,usages);
}
export async function createSession(secret, now = Date.now()) {
  const payload = (Math.floor(now/1000)+AGE)+'.'+crypto.randomUUID();
  return payload+'.'+hex(await crypto.subtle.sign('HMAC',await key(secret,['sign']),enc.encode(payload)));
}
export async function validSession(token, secret, now = Date.now()) {
  if (!secret || typeof token !== 'string' || token.length > 200) return false;
  const [expires, nonce, signature, extra] = token.split('.');
  const seconds = Math.floor(now/1000);
  if(extra || !/^\d{10}$/.test(expires||'') || !/^[a-f0-9-]{36}$/.test(nonce||'') || !/^[a-f0-9]{64}$/.test(signature||'') || +expires<=seconds || +expires>seconds+AGE) return false;
  return crypto.subtle.verify('HMAC',await key(secret,['verify']),bytes(signature),enc.encode(expires+'.'+nonce));
}
export const cookie = (token, clear = false) => `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${clear?0:AGE}`;
export function requestToken(request) {
  const parts=(request.headers.get('cookie')||'').split(';').map(x=>x.trim());
  return parts.find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';
}
