const encoder=new TextEncoder();
const hex=b=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
const unhex=h=>Uint8Array.from(h.match(/../g)||[],x=>parseInt(x,16));
export const nonce=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
export const digest=async value=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));
export const now=()=>Math.floor(Date.now()/1000);
export const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
export function profile(body){
  const pseudo=String(body.pseudo||'').trim(),birth=String(body.birth||''),name=String(body.name||'').trim();
  const d=new Date(birth+'T00:00:00Z'),today=new Date();
  if(pseudo.length<2||pseudo.length>40||name.length>100)fail(400,'Choisis un pseudo de 2 à 40 caractères.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(birth)||!Number.isFinite(+d)||d.toISOString().slice(0,10)!==birth||d>today||today.getUTCFullYear()-d.getUTCFullYear()>125)fail(400,'Vérifie ta date de naissance.');
  return {pseudo,birth,name};
}
export function ageBand(birth,date=new Date()){
  if(!birth)return '';
  const today=date.toISOString().slice(0,10);
  const age=Number(today.slice(0,4))-Number(birth.slice(0,4))-(today.slice(5)<birth.slice(5)?1:0);
  if(age<18)return 'Moins de 18 ans';
  if(age<25)return '18–24 ans';if(age<35)return '25–34 ans';if(age<50)return '35–49 ans';if(age<65)return '50–64 ans';return '65 ans et plus';
}
export const cookieValue=(r,key)=>(r.headers.get('Cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(key+'='))?.slice(key.length+1)||'';
export const cookie=(key,value,age)=>key+'='+value+'; Path=/; Max-Age='+age+'; HttpOnly; Secure; SameSite=Lax';
export async function secret(password,existing){
  const salt=existing?.split('.')[0]||nonce();
  const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:unhex(salt),iterations:100000},key,256);
  if(!existing)return salt+'.'+hex(bits);
  const expected=unhex(existing.split('.')[1]);
  const a=new Uint8Array(bits);let diff=a.length^expected.length;
  for(let i=0;i<a.length;i++)diff|=a[i]^expected[i];
  return diff===0;
}
export async function rate(db,key,max){
  const slot=Math.floor(now()/900),expires=(slot+1)*900;
  const row=await db.prepare('INSERT INTO member_limits(key,attempts,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=attempts+1 WHERE attempts<? RETURNING attempts').bind(await digest(key+':'+slot),expires,max).first();
  if(!row)fail(429,'Trop de tentatives. Réessaie dans quinze minutes.');
}
export const sessionName='__Host-chemins-membre';
export async function newSession(db,id){
  const token=nonce(),age=30*86400;
  await db.prepare('INSERT INTO member_sessions(token,member,expires) VALUES(?,?,?)').bind(await digest(token),id,now()+age).run();
  return cookie(sessionName,token,age);
}
export async function current(db,r){
  const token=cookieValue(r,sessionName);if(!/^[a-f0-9]{64}$/.test(token))return null;
  return db.prepare('SELECT members.* FROM member_sessions JOIN members ON member=members.id WHERE token=? AND expires>?').bind(await digest(token),now()).first();
}
