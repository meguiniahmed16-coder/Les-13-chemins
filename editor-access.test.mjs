import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler, digest } from './editor-api.mjs';
const origin='https://tectonique-des-ames.netlify.app';
function setup() {
 const records=new Map(); let version=0, time=10000000;
 const store={
  async get(key){return records.get(key)?.data??null},
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
