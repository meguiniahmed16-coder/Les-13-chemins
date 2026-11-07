import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler, digest } from './editor-api.mjs';
const origin='https://tectonique-des-ames.netlify.app';
function setup() {
 const records=new Map(); let version=0, time=10000000;
 const store={
  async get(key){return records.get(key)?.data??null},
  async list({prefix}){return {blobs:[...records.keys()].filter(key=>key.startsWith(prefix)).map(key=>({key}))}},
  async getMetadata(key){const x=records.get(key);return x?{metadata:x.metadata,etag:x.etag}:null},
  async getWithMetadata(key){return records.get(key)??null},
  async setJSON(key,data,opts={}){const x=records.get(key);if((opts.onlyIfNew&&x)||(opts.onlyIfMatch&&opts.onlyIfMatch!==x?.etag))return{modified:false};records.set(key,{data,etag:String(++version),metadata:opts.metadata||{}});return{modified:true}},
  async set(key,data,opts){return this.setJSON(key,data,opts)},
  async delete(key){records.delete(key)}
 };
 const cfg={accessHash:digest('AABBCCDDEEFF001122334455'),adminHash:digest('admin-test-secret')};
 const handler=createHandler({openStore:()=>store,configuration:()=>cfg,now:()=>time});
 const request=(action,options={},context={ip:'192.0.2.1'})=>handler(new Request(origin+'/.netlify/functions/editor?action='+action,options),context);
 const login=()=>request('login',{method:'POST',headers:{Origin:origin},body:JSON.stringify({code:'aabb-ccdd-eeff-0011-2233-4455'})});
 return{records,cfg,store,request,login,setTime:v=>time=v};
}
test('private catalogue and file bytes require a server session',async()=>{
 const x=setup();for(const action of ['list','part&id='+ 'a'.repeat(32)+'&part=0']){
  const r=await x.request(action);assert.equal(r.status,401);assert.match(r.headers.get('cache-control'),/no-store/);
 }
 assert.equal((await x.request('upload',{method:'POST',body:'private'})).status,403);
});
test('login rejects wrong codes and cross-origin requests; HttpOnly secure session',async()=>{
 const x=setup();assert.equal((await x.request('login',{method:'POST',headers:{Origin:origin},body:'{"code":"wrong"}'})).status,401);
 assert.equal((await x.request('login',{method:'POST',headers:{Origin:'https://evil.example'},body:'{"code":"wrong"}'})).status,403);
 const r=await x.login();assert.equal(r.status,200);const c=r.headers.get('set-cookie');
 for(const flag of ['HttpOnly','Secure','SameSite=Strict','Path=/','Max-Age=14400'])assert.ok(c.includes(flag));
 assert.ok(!JSON.stringify(await r.json()).includes('AABB'));
});
test('authenticated catalogue, exact file bytes, logout and expiry',async()=>{
 const x=setup(), bytes=new TextEncoder().encode('private-document').buffer,id='a'.repeat(32),hash=digest(Buffer.from(bytes));
 const file={id,name:'Manuscrit.pdf',title:'Manuscrit',category:'Manuscrits',mime:'application/pdf',bytes:bytes.byteLength,parts:[hash],sha256:hash,updatedAt:'2026-11-07'};
 await x.store.set(`files/${id}/0`,bytes,{metadata:{sha256:hash,bytes:bytes.byteLength}});
 const admin={'x-editor-admin':'admin-test-secret'};
 assert.equal((await x.request('publish',{method:'POST',headers:admin,body:JSON.stringify({files:[file]})})).status,200);
 const c=(await x.login()).headers.get('set-cookie').split(';')[0];
 assert.equal((await x.request('list',{headers:{Cookie:c}})).status,200);
 const response=await x.request(`part&id=${id}&part=0`,{headers:{Cookie:c}});assert.equal(response.status,200);assert.equal(digest(Buffer.from(await response.arrayBuffer())),hash);
 for(const part of ['-1','00','1','../../secret'])assert.equal((await x.request(`part&id=${id}&part=${part}`,{headers:{Cookie:c}})).status,404);
 assert.equal((await x.request('logout',{method:'POST',headers:{Cookie:c,Origin:origin}})).status,200);
 assert.equal((await x.request('list',{headers:{Cookie:c}})).status,401);
 const c2=(await x.login()).headers.get('set-cookie').split(';')[0];x.setTime(10000000+14400001);assert.equal((await x.request('list',{headers:{Cookie:c2}})).status,401);
});
test('code rotation invalidates existing sessions',async()=>{
 const x=setup(),c=(await x.login()).headers.get('set-cookie').split(';')[0];x.cfg.accessHash=digest('new-code');assert.equal((await x.request('list',{headers:{Cookie:c}})).status,401);
});
test('12 attempts per IP and time window, atomic count',async()=>{
 const x=setup();const calls=await Promise.all(Array.from({length:20},()=>x.request('login',{method:'POST',headers:{Origin:origin},body:'{"code":"wrong"}'})));
 assert.ok(calls.filter(r=>r.status===401).length<=12);assert.ok(calls.some(r=>r.status===429));
 for(const [k,v]of x.records)if(k.startsWith('attempts/'))assert.ok(v.data.count<=12);
});
test('publishing fails closed if a part is missing',async()=>{
 const x=setup();const file={id:'a'.repeat(32),name:'Document.pdf',title:'Document',category:'Manuscrits',mime:'application/pdf',bytes:3,parts:[digest('abc')],sha256:digest('abc')};
 assert.equal((await x.request('publish',{method:'POST',headers:{'x-editor-admin':'admin-test-secret'},body:JSON.stringify({files:[file]})})).status,409);
 assert.equal(await x.store.get('catalog-v1'),null);
});

const ownerLogin=x=>x.request('admin-login',{method:'POST',headers:{Origin:origin},body:JSON.stringify({code:'admin-test-secret'})});
const ownerCookie=async x=>(await ownerLogin(x)).headers.get('set-cookie').split(';')[0];
const command=(x,c,action,body)=>x.request(action,{method:'POST',headers:{Cookie:c,Origin:origin},body:JSON.stringify(body)});
const editorLogin=(x,code)=>x.request('login',{method:'POST',headers:{Origin:origin},body:JSON.stringify({code})});
test('Owner login is separate: readers, forged roles and admin headers cannot manage codes',async()=>{
 const x=setup(),reader=(await x.login()).headers.get('set-cookie').split(';')[0];
 for(const action of ['admin-state','create-code','revoke-code','disable-legacy']){
  assert.equal((await x.request(action)).status,401);
  assert.equal((await command(x,reader,action,{label:'Maison',days:30})).status,401);
 }
 assert.equal((await x.request('admin-login',{method:'POST',headers:{Origin:origin},body:JSON.stringify({code:'AABBCCDDEEFF001122334455',role:'admin'})})).status,401);
 const c=await ownerCookie(x);assert.match(c,/^__Host-editor-admin=/);
 assert.equal((await x.request('admin-state',{headers:{Cookie:c}})).status,200);
 const forged=c.replace('__Host-editor-admin','__Host-editor');assert.equal((await x.request('admin-state',{headers:{Cookie:forged}})).status,401);
});
test('Generated codes are unique, hashed only, listed privately and accepted by editor login',async()=>{
 const x=setup(),c=await ownerCookie(x);
 const results=await Promise.all(Array.from({length:3},(_,i)=>command(x,c,'create-code',{label:'Maison '+i,days:30}).then(r=>r.json())));
 assert.equal(new Set(results.map(r=>r.id)).size,3);assert.equal(new Set(results.map(r=>r.code)).size,3);
 for(const g of results){assert.match(g.code,/^[A-F0-9]{4}(?:-[A-F0-9]{4}){7}$/);assert.equal((await editorLogin(x,g.code.toLowerCase())).status,200);assert.ok(!JSON.stringify([...x.records]).includes(g.code));assert.ok(!JSON.stringify([...x.records]).includes(g.code.replace(/-/g,'')));}
 const state=await(await x.request('admin-state',{headers:{Cookie:c}})).json();assert.equal(state.codes.length,3);assert.ok(state.codes.every(g=>g.status==='active'));assert.equal(state.legacyEnabled,true);assert.ok(!JSON.stringify(state).includes(results[0].code));
});
test('Revocation stops an already authenticated reader and every document part, leaving other codes valid',async()=>{
 const x=setup(),c=await ownerCookie(x),fileId='a'.repeat(32);await x.store.setJSON('catalog-v1',{files:[{id:fileId,parts:[digest('abc')]}]});await x.store.set(`files/${fileId}/0`,new TextEncoder().encode('abc').buffer,{});
 const a=await(await command(x,c,'create-code',{label:'Maison A',days:7})).json(),b=await(await command(x,c,'create-code',{label:'Maison B',days:7})).json();
 const reader=(await editorLogin(x,a.code)).headers.get('set-cookie').split(';')[0];assert.equal((await x.request('list',{headers:{Cookie:reader}})).status,200);
 assert.equal((await command(x,c,'revoke-code',{id:a.id})).status,200);
 assert.equal((await x.request('list',{headers:{Cookie:reader}})).status,401);assert.equal((await x.request(`part&id=${fileId}&part=0`,{headers:{Cookie:reader}})).status,401);
 assert.equal((await editorLogin(x,a.code)).status,401);assert.equal((await editorLogin(x,b.code)).status,200);
 assert.equal((await command(x,c,'revoke-code',{id:a.id})).status,200,'revocation is idempotent');
 const state=await(await x.request('admin-state',{headers:{Cookie:c}})).json();assert.equal(state.codes.find(g=>g.id===a.id).status,'revoked');
});
test('Code expiration is enforced even when a session was opened shortly before expiry',async()=>{
 const x=setup(),c=await ownerCookie(x);const a=await(await command(x,c,'create-code',{label:'Maison',days:7})).json();x.setTime(a.expiresAt-60000);
 const r=await editorLogin(x,a.code),reader=r.headers.get('set-cookie').split(';')[0];assert.match(r.headers.get('set-cookie'),/Max-Age=60/);
 x.setTime(a.expiresAt+1);assert.equal((await x.request('list',{headers:{Cookie:reader}})).status,401);assert.equal((await editorLogin(x,a.code)).status,401);
 const newOwner=await ownerCookie(x),state=await(await x.request('admin-state',{headers:{Cookie:newOwner}})).json();assert.equal(state.codes[0].status,'expired');
});
test('The owner reads documents without an editor code, logs out securely, and session rotation revokes access',async()=>{
 const x=setup();await x.store.setJSON('catalog-v1',{files:[]});const c=await ownerCookie(x);assert.equal((await x.request('list',{headers:{Cookie:c}})).status,200);
 const out=await x.request('logout',{method:'POST',headers:{Cookie:c,Origin:origin}});assert.match(out.headers.get('set-cookie'),/__Host-editor-admin=;/);assert.equal((await x.request('admin-state',{headers:{Cookie:c}})).status,401);
 const c2=await ownerCookie(x);x.cfg.adminHash=digest('rotated-owner-secret');assert.equal((await x.request('admin-state',{headers:{Cookie:c2}})).status,401);
});
test('Disabling the legacy code invalidates legacy sessions but preserves individual codes and owner access',async()=>{
 const x=setup(),legacy=(await x.login()).headers.get('set-cookie').split(';')[0],c=await ownerCookie(x);
 const a=await(await command(x,c,'create-code',{label:'Maison',days:7})).json();assert.equal((await command(x,c,'disable-legacy',{})).status,200);
 assert.equal((await x.login()).status,401);assert.equal((await x.request('list',{headers:{Cookie:legacy}})).status,401);assert.equal((await editorLogin(x,a.code)).status,200);assert.equal((await x.request('admin-state',{headers:{Cookie:c}})).status,200);
});
test('Code management rejects cross-origin requests, missing origins, invalid bodies and invalid durations',async()=>{
 const x=setup(),c=await ownerCookie(x);for(const action of ['create-code','revoke-code','disable-legacy']){
  for(const site of [undefined,'https://evil.example']){const headers={Cookie:c};if(site)headers.Origin=site;assert.equal((await x.request(action,{method:'POST',headers,body:'{}'})).status,403);}
 }
 for(const body of [{label:'Maison',days:0},{label:'Maison',days:36500},{label:'',days:30},{label:'x'.repeat(81),days:30},{label:'a\nb',days:30}])assert.equal((await command(x,c,'create-code',body)).status,400);
 assert.equal((await command(x,c,'revoke-code',{id:'../../catalog-v1'})).status,404);assert.equal((await x.request('create-code',{headers:{Cookie:c,Origin:origin}})).status,403);
});
test('Owner login and editor login share a strict rate limit under concurrency',async()=>{
 const x=setup();const responses=await Promise.all(Array.from({length:24},(_,i)=>x.request(i%2?'login':'admin-login',{method:'POST',headers:{Origin:origin},body:'{"code":"wrong"}'})));
 assert.equal(responses.filter(r=>r.status===401).length,12);assert.equal(responses.filter(r=>r.status===429).length,12);
 assert.equal([...x.records.keys()].filter(k=>k.startsWith('attempt-slot')).length,12);
});
