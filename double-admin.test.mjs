import test from 'node:test';
import assert from 'node:assert/strict';
import {timingSafeEqual} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {checkPassword,createSession,validSession,cookie,COOKIE} from './double-backend/web-auth.js';
import {createAdminHandler} from './double-backend/web-admin-handler.js';
import proxy from './double-admin-api.mjs';
if(!crypto.subtle.timingSafeEqual)crypto.subtle.timingSafeEqual=(a,b)=>timingSafeEqual(Buffer.from(a),Buffer.from(b));
const origin='https://tectonique-des-ames.netlify.app';
const password='Test-only-Password_83!';const salt='test-salt';
const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
const digest=Buffer.from(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256)).toString('hex');
const secret=crypto.randomUUID()+crypto.randomUUID();
function fixture(){let coreCalls=0,lastRequest;
 const database=new DatabaseSync(':memory:');
 database.exec("CREATE TABLE daily_access(key TEXT PRIMARY KEY,count INTEGER NOT NULL);CREATE TABLE web_admin_credentials(id TEXT PRIMARY KEY,password_hash TEXT NOT NULL,version INTEGER NOT NULL,updated_at TEXT NOT NULL)");
 database.prepare("INSERT INTO web_admin_credentials VALUES('admin',?,1,?)").run(salt+':'+digest,new Date().toISOString());
 const DB={prepare(sql){const statement=database.prepare(sql);return {async first(){return statement.get()||null;},bind(...params){return {async first(){return statement.get(...params)||null;}};}};}};
 const env={WEB_ADMIN_SESSION_SECRET:secret,ADMIN_TOKEN:'server-test-only',DB};
 const app=createAdminHandler({async fetch(request){coreCalls++;lastRequest=request;return Response.json({ok:true,path:new URL(request.url).pathname});}});
 const req=(path,body,token,headers={})=>new Request('https://backend.example/web-admin/'+path,{method:body===undefined?'GET':'POST',headers:{origin,'content-type':'application/json',...(token?{cookie:COOKIE+'='+token}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body)});
 return {app,env,req,database,get coreCalls(){return coreCalls;},get lastRequest(){return lastRequest;}};
}
test('real password check, signed session tampering and expiry',async()=>{
 assert.equal(await checkPassword(password,salt+':'+digest),true);assert.equal(await checkPassword('incorrect',salt+':'+digest),false);
 const token=await createSession(secret);assert.equal(await validSession(token,secret),true);assert.equal(await validSession(token+'a',secret),false);assert.equal(await validSession(token,secret,1,Date.now()+8*86400000),false);assert.equal(await validSession(token,'other-secret'),false);
 assert.match(cookie(token),/HttpOnly; Secure; SameSite=Lax/);
});
test('login grants a secure cookie; bad credentials and cross-site requests are rejected',async()=>{
 const f=fixture();let r=await f.app.fetch(f.req('auth/login',{username:'admin',password}),f.env,{});assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/^__Host-am_site_admin=/);
 r=await f.app.fetch(f.req('auth/login',{username:'admin',password:'wrong'}),f.env,{});assert.equal(r.status,401);
 r=await f.app.fetch(f.req('auth/login',{username:'admin',password},null,{origin:'https://attacker.example'}),f.env,{});assert.equal(r.status,403);assert.equal(f.coreCalls,0);
});
test('private reads and writes require valid cookie, not a supplied authorization header',async()=>{
 const f=fixture();
 for(const path of ['double/admin/blog','double/admin/bank','double/admin/review','double/admin/archives','double/admin/visits','double/admin/notification-settings']){
  assert.equal((await f.app.fetch(f.req(path,undefined,null,{authorization:'Bearer forged'}),f.env,{})).status,401);
 }
 assert.equal((await f.app.fetch(f.req('double/admin/blog',{title:'x'}),f.env,{})).status,401);assert.equal(f.coreCalls,0);
 const token=await createSession(secret);const r=await f.app.fetch(f.req('double/admin/blog',undefined,token),f.env,{});assert.equal(r.status,200);assert.equal(f.lastRequest.headers.get('authorization'),'Bearer server-test-only');assert.equal(f.lastRequest.headers.get('cookie'),null);assert.equal(r.headers.get('cache-control'),'private, no-store');assert.equal(r.headers.has('access-control-allow-origin'),false);
 assert.equal((await f.app.fetch(f.req('double/admin/not-allowed',undefined,token),f.env,{})).status,404);
 assert.equal((await f.app.fetch(f.req('double/admin/blog',{title:'x'},token,{origin:'https://attacker.example'}),f.env,{})).status,403);
});
test('bounded bodies, rate limit and logout',async()=>{
 const f=fixture();const token=await createSession(secret);
 assert.equal((await f.app.fetch(f.req('double/admin/blog',{body:'x'.repeat(260000)},token),f.env,{})).status,413);
 for(let i=0;i<31;i++){const r=await f.app.fetch(f.req('auth/login',{username:'admin',password:'wrong'}),f.env,{});assert.equal(r.status,i===30?429:401);}
 const out=await f.app.fetch(f.req('auth/logout',{},token),f.env,{});assert.equal(out.status,303);assert.match(out.headers.get('set-cookie'),/Max-Age=0/);assert.equal(out.headers.get('location'),'/admin-blog.html');
});
test('Netlify endpoint enforces same-origin POST and forwards cookie without exposing a server token',async()=>{
 const original=globalThis.fetch;let captured;
 globalThis.fetch=async(url,init)=>{captured={url,init};return Response.json({ok:true},{headers:{'set-cookie':cookie('test')}});};
 try{
  const r=await proxy(new Request(origin+'/api/atelier/auth/session',{headers:{cookie:COOKIE+'=test'}}));assert.equal(r.status,200);assert.match(captured.url,/\/web-admin\/auth\/session$/);assert.equal(captured.init.headers.cookie,COOKIE+'=test');assert.equal(captured.init.headers.authorization,undefined);assert.match(r.headers.get('set-cookie'),/HttpOnly/);
  assert.equal((await proxy(new Request(origin+'/api/atelier/auth/login',{method:'POST',headers:{origin:'https://attacker.example'},body:'{}'}))).status,403);
 }finally{globalThis.fetch=original;}
});

test('password change requires authentication and current password; old credentials and sessions stop working',async()=>{
 const f=fixture();const token=await createSession(secret,1);const change={currentPassword:password,newPassword:'nouveau4826'};
 assert.equal((await f.app.fetch(f.req('auth/password',change),f.env,{})).status,401);
 assert.equal((await f.app.fetch(f.req('auth/password',{...change,currentPassword:'wrong'},token),f.env,{})).status,403);
 assert.equal((await f.app.fetch(f.req('auth/password',{...change,newPassword:'court'},token),f.env,{})).status,400);
 const changed=await f.app.fetch(f.req('auth/password',change,token),f.env,{});assert.equal(changed.status,200);
 const newToken=changed.headers.get('set-cookie').split(';')[0].slice(COOKIE.length+1);
 assert.equal((await f.app.fetch(f.req('auth/session',undefined,token),f.env,{})).status,401);
 assert.equal((await f.app.fetch(f.req('auth/session',undefined,newToken),f.env,{})).status,200);
 assert.equal((await f.app.fetch(f.req('auth/login',{username:'admin',password}),f.env,{})).status,401);
 assert.equal((await f.app.fetch(f.req('auth/login',{username:'admin',password:change.newPassword}),f.env,{})).status,200);
 const stored=f.database.prepare("SELECT * FROM web_admin_credentials").get();assert.notEqual(stored.password_hash,change.newPassword);assert.equal(stored.version,2);
 assert.equal((await f.app.fetch(new Request('https://backend.example/admin/blog',{headers:{authorization:'Bearer server-test-only'}}),f.env,{})).status,401);
 f.database.close();
});

test('les deux formulaires délèguent l’adresse du propriétaire à sa session auteur',async()=>{
 const {default:memberProxy}=await import('./membres/proxy.mjs');
 const original=globalThis.fetch,calls=[],site='https://tectonique-des-ames.com';
 globalThis.fetch=async(url,init)=>{
   calls.push({url,body:JSON.parse(typeof init.body==='string'?init.body:new TextDecoder().decode(init.body))});
   return Response.json({error:'Identifiant ou mot de passe incorrect.'},{status:401});
 };
 const post=(path,body)=>new Request(site+path,{method:'POST',headers:{origin:site,'content-type':'application/json'},body:JSON.stringify(body)});
 try{
   const email='MEGUINIAHMED16@GMAIL.COM',password='essai-invalide';
   for(const [handler,path,key] of [[proxy,'/api/atelier/auth/login','username'],[memberProxy,'/api/membres/login','email']]){
     const reply=await handler(post(path,{[key]:email,password}));
     assert.equal(reply.status,401);assert.equal(reply.headers.get('set-cookie'),null);
     assert.match(calls.at(-1).url,/\/web-admin\/auth\/login$/);
     assert.deepEqual(calls.at(-1).body,{username:'admin',password});
   }
   const sign=await memberProxy(post('/api/membres/signup',{email,password}));
   assert.equal(sign.status,409);assert.equal(calls.length,2);
   await memberProxy(post('/api/membres/login',{email:'autre@example.test',password}));
   assert.match(calls.at(-1).url,/\/api\/membres\/login$/);
 }finally{globalThis.fetch=original;}
});
