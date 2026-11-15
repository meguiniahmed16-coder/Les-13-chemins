import test from 'node:test';
import assert from 'node:assert/strict';
import {timingSafeEqual} from 'node:crypto';
import {checkPassword,createSession,validSession,cookie,COOKIE} from './double-backend/web-auth.js';
import {createAdminHandler} from './double-backend/web-admin-handler.js';
import proxy from './double-admin-api.mjs';
if(!crypto.subtle.timingSafeEqual)crypto.subtle.timingSafeEqual=(a,b)=>timingSafeEqual(Buffer.from(a),Buffer.from(b));
const origin='https://tectonique-des-ames.netlify.app';
const password='Test-only-Password_83!';const salt='test-salt';
const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
const digest=Buffer.from(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256)).toString('hex');
const secret=crypto.randomUUID()+crypto.randomUUID();
function fixture(){let coreCalls=0,lastRequest,attempts=0;
 const env={WEB_ADMIN_PASSWORD_HASH:salt+':'+digest,WEB_ADMIN_SESSION_SECRET:secret,ADMIN_TOKEN:'server-test-only',DB:{prepare(){return {bind(){return {async first(){attempts++;return attempts<=30?{count:attempts}:null;}};}};}}};
 const app=createAdminHandler({async fetch(request){coreCalls++;lastRequest=request;return Response.json({ok:true,path:new URL(request.url).pathname});}});
 const req=(path,body,token,headers={})=>new Request('https://backend.example/web-admin/'+path,{method:body===undefined?'GET':'POST',headers:{origin,'content-type':'application/json',...(token?{cookie:COOKIE+'='+token}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body)});
 return {app,env,req,get coreCalls(){return coreCalls;},get lastRequest(){return lastRequest;}};
}
test('real password check, signed session tampering and expiry',async()=>{
 assert.equal(await checkPassword(password,salt+':'+digest),true);assert.equal(await checkPassword('incorrect',salt+':'+digest),false);
 const token=await createSession(secret);assert.equal(await validSession(token,secret),true);assert.equal(await validSession(token+'a',secret),false);assert.equal(await validSession(token,secret,Date.now()+8*86400000),false);assert.equal(await validSession(token,'other-secret'),false);
 assert.match(cookie(token),/HttpOnly; Secure; SameSite=Lax/);
});
test('login grants a secure cookie; bad credentials and cross-site requests are rejected',async()=>{
 const f=fixture();let r=await f.app.fetch(f.req('auth/login',{username:'admin',password}),f.env,{});assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/^__Host-am_site_admin=/);
 r=await f.app.fetch(f.req('auth/login',{username:'admin',password:'wrong'}),f.env,{});assert.equal(r.status,401);
 r=await f.app.fetch(f.req('auth/login',{username:'admin',password},null,{origin:'https://attacker.example'}),f.env,{});assert.equal(r.status,403);assert.equal(f.coreCalls,0);
});
test('private reads and writes require valid cookie, not a supplied authorization header',async()=>{
 const f=fixture();
 for(const path of ['double/admin/blog','double/admin/bank','double/admin/review','double/admin/visits']){
  assert.equal((await f.app.fetch(f.req(path,undefined,null,{authorization:'Bearer forged'}),f.env,{})).status,401);
 }
 assert.equal((await f.app.fetch(f.req('double/admin/blog',{title:'x'}),f.env,{})).status,401);assert.equal(f.coreCalls,0);
 const token=await createSession(secret);const r=await f.app.fetch(f.req('double/admin/blog',undefined,token),f.env,{});assert.equal(r.status,200);assert.equal(f.lastRequest.headers.get('authorization'),'Bearer server-test-only');assert.equal(f.lastRequest.headers.get('cookie'),null);assert.equal(r.headers.get('cache-control'),'private, no-store');assert.equal(r.headers.has('access-control-allow-origin'),false);
 assert.equal((await f.app.fetch(f.req('double/admin/not-allowed',undefined,token),f.env,{})).status,404);
 assert.equal((await f.app.fetch(f.req('double/admin/blog',{title:'x'},token,{origin:'https://attacker.example'}),f.env,{})).status,403);
});
test('bounded bodies, rate limit and logout',async()=>{
 const f=fixture();const token=await createSession(secret);
 assert.equal((await f.app.fetch(f.req('double/admin/blog',{body:'x'.repeat(31000)},token),f.env,{})).status,413);
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
