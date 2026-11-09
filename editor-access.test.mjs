import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler, digest } from './editor-api.mjs';
const origin='https://tectonique-des-ames.netlify.app';
function setup(options={}) {
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
 const handler=createHandler({openStore:()=>store,configuration:()=>cfg,now:()=>time,...options});
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
const partBytes=3*1024*1024;
async function multipartFixture(count=2,large=false){
 const x=setup(),owner=await ownerCookie(x),reader=(await x.login()).headers.get('set-cookie').split(';')[0];
 const old=Array.from({length:24},(_,i)=>{const data=Buffer.from('old-'+i);return{id:(i+1).toString(16).padStart(32,'0'),name:'Document-'+i+'.docx',title:'Document '+i,category:'Manuscrits',mime:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',bytes:data.length,parts:[digest(data)],sha256:digest(data),updatedAt:'2026-11-08'};});
 await x.store.setJSON('catalog-v1',{files:old,updatedAt:'2026-11-08'});
 const contents=Array.from({length:count},(_,i)=>large&&i===0?Buffer.alloc(partBytes+11,65):Buffer.from('new-document-'+i));
 const files=contents.map((bytes,i)=>({name:old[i].name,expectedSha256:old[i].sha256,bytes:bytes.length,sha256:digest(bytes),parts:Array.from({length:Math.ceil(bytes.length/partBytes)},(_,p)=>digest(bytes.subarray(p*partBytes,(p+1)*partBytes)))}));
 const begin=async(body={files})=>command(x,owner,'owner-begin-upload',body);
 const start=async(body={files})=>{const r=await begin(body);assert.equal(r.status,201);return r.json();};
 const put=(batch,i,p,bytes=contents[i].subarray(p*partBytes,(p+1)*partBytes),cookie=owner)=>x.request(`owner-upload-part&upload=${batch.uploadId}&id=${batch.files[i].id}&part=${p}`,{method:'POST',headers:{Cookie:cookie,Origin:origin,'x-content-sha256':digest(bytes)},body:bytes});
 const upload=async batch=>{for(let i=0;i<files.length;i++)for(let p=0;p<files[i].parts.length;p++)assert.equal((await put(batch,i,p)).status,200);};
 const publish=batch=>command(x,owner,'owner-publish-upload',{uploadId:batch.uploadId});
 return{...x,owner,reader,old,files,contents,begin,start,put,upload,publish};
}
test('Large private replacements keep the existing owner, origin and session boundaries',async()=>{
 const x=await multipartFixture();
 for(const action of ['owner-begin-upload','owner-upload-part','owner-publish-upload']){
  for(const cookie of ['',x.reader])assert.equal((await command(x,cookie,action,{files:x.files})).status,401);
  assert.equal((await x.request(action,{method:'POST',headers:{Origin:origin,'x-editor-admin':'admin-test-secret'},body:'{}'})).status,401);
  assert.equal((await x.request(action,{method:'POST',headers:{Cookie:x.owner},body:'{}'})).status,403);
  assert.equal((await x.request(action,{method:'POST',headers:{Cookie:x.owner,Origin:'https://evil.example'},body:'{}'})).status,403);
  assert.equal((await x.request(action,{headers:{Cookie:x.owner,Origin:origin}})).status,403);
 }
 const batch=await x.start(),otherOwner=await ownerCookie(x);
 assert.equal((await x.put(batch,0,0,x.contents[0],otherOwner)).status,409);
 x.setTime(10000000+2*60*60*1000+1);assert.equal((await x.publish(batch)).status,409);
 x.setTime(10000000+4*60*60*1000+1);assert.equal((await x.begin()).status,401);
 const y=await multipartFixture();y.cfg.adminHash=digest('rotated-owner');assert.equal((await y.begin()).status,401);
});
test('Large replacement manifests reject ambiguous, stale and invalid batches',async()=>{
 const x=await multipartFixture(),before=await x.store.get('catalog-v1');
 const cases=[
  [{files:[]},400],
  [{files:Array(8).fill(x.files[0])},400],
  [{files:[x.files[0],x.files[0]]},400],
  [{files:[{...x.files[0],name:'Unknown.docx'}]},409],
  [{files:[{...x.files[0],name:'../Document-0.docx'}]},409],
  [{files:[{...x.files[0],expectedSha256:digest('stale')}]},409],
  [{files:[{...x.files[0],bytes:200000001}]},400],
  [{files:[{...x.files[0],parts:[]}]},400],
  [{files:[{...x.files[0],sha256:'bad'}]},400],
 ];
 for(const[body,status]of cases)assert.equal((await x.begin(body)).status,status);
 assert.deepEqual(await x.store.get('catalog-v1'),before);
 await x.store.setJSON('catalog-v1',{files:[...x.old,{...x.old[0],id:'f'.repeat(32)}]});
 assert.equal((await x.begin()).status,409);
});
test('Private upload parts are bounded, immutable, session-bound and hidden until publication',async()=>{
 const x=await multipartFixture(1,true),batch=await x.start(),id=batch.files[0].id;
 assert.equal((await x.put(batch,0,0,Buffer.from('short'))).status,400);
 assert.equal((await x.put(batch,0,0,Buffer.alloc(partBytes,66))).status,400);
 assert.equal((await x.put(batch,0,9,Buffer.from('bad'))).status,400);
 const forged={...batch,files:[{...batch.files[0],id:x.old[0].id}]};assert.equal((await x.put(forged,0,0)).status,400);
 assert.equal((await x.put(batch,0,0)).status,200);
 const etag=(await x.store.getMetadata(`files/${id}/0`)).etag;
 assert.equal((await x.put(batch,0,0)).status,200);assert.equal((await x.store.getMetadata(`files/${id}/0`)).etag,etag);
 assert.equal((await x.request(`part&id=${id}&part=0`,{headers:{Cookie:x.reader}})).status,404);
 assert.equal((await x.request(`part&id=${id}&part=0`)).status,401);
});
test('Missing parts, altered bytes and a false whole-file digest cannot publish',async()=>{
 const missing=await multipartFixture(1,true),a=await missing.start();await missing.put(a,0,0);
 assert.equal((await missing.publish(a)).status,409);assert.deepEqual((await missing.store.get('catalog-v1')).files,missing.old);
 const wrong=await multipartFixture(1),b=await wrong.start({files:[{...wrong.files[0],sha256:digest('wrong-whole-file')}]});await wrong.upload(b);
 assert.equal((await wrong.publish(b)).status,409);assert.deepEqual((await wrong.store.get('catalog-v1')).files,wrong.old);
 const corrupt=await multipartFixture(1),c=await corrupt.start();await corrupt.upload(c);
 const record=corrupt.records.get(`files/${c.files[0].id}/0`);record.data=Buffer.alloc(corrupt.contents[0].length,90);
 assert.equal((await corrupt.publish(c)).status,409);assert.deepEqual((await corrupt.store.get('catalog-v1')).files,corrupt.old);
});
test('Concurrent target or catalogue changes cannot be lost and failed CAS never removes file parts',async()=>{
 const x=await multipartFixture(1),batch=await x.start();await x.upload(batch);
 const changed=x.old.map((f,i)=>i===0?{...f,title:'Concurrent target title'}:f);await x.store.setJSON('catalog-v1',{files:changed});
 assert.equal((await x.publish(batch)).status,409);assert.deepEqual((await x.store.get('catalog-v1')).files,changed);
 const y=await multipartFixture(1),other=await y.start();await y.upload(other);
 const original=y.store.setJSON.bind(y.store);y.store.setJSON=async(key,data,opts)=>key==='catalog-v1'&&opts?.onlyIfMatch?{modified:false}:original(key,data,opts);
 assert.equal((await y.publish(other)).status,409);assert.deepEqual((await y.store.get('catalog-v1')).files,y.old);
 assert.ok(await y.store.get(`files/${other.files[0].id}/0`));
});
test('Seven replacements publish atomically within 24 documents and preserve unrelated current entries',async()=>{
 const x=await multipartFixture(7,true),batch=await x.start();await x.upload(batch);
 const current=x.old.map((f,i)=>i===23?{...f,title:'New unrelated title'}:f);await x.store.setJSON('catalog-v1',{files:current});
 let commits=0;const original=x.store.setJSON.bind(x.store);x.store.setJSON=async(key,data,opts)=>{if(key==='catalog-v1')commits++;return original(key,data,opts);};
 assert.equal((await x.publish(batch)).status,200);assert.equal(commits,1);
 const catalog=await x.store.get('catalog-v1');assert.equal(catalog.files.length,24);assert.deepEqual(catalog.files.slice(7),current.slice(7));
 for(let i=0;i<7;i++){
  const file=catalog.files[i];assert.equal(file.sha256,x.files[i].sha256);assert.equal(file.name,x.old[i].name);assert.equal(file.title,x.old[i].title);
  const chunks=[];for(let p=0;p<file.parts.length;p++){const r=await x.request(`part&id=${file.id}&part=${p}`,{headers:{Cookie:x.reader}});assert.equal(r.status,200);chunks.push(Buffer.from(await r.arrayBuffer()));}
  assert.equal(digest(Buffer.concat(chunks)),file.sha256);
 }
 assert.equal((await x.publish(batch)).status,409);assert.equal(commits,1);
 assert.equal((await x.put(batch,0,0)).status,409);assert.ok(await x.store.get(`files/${catalog.files[0].id}/0`));
 assert.equal((await x.request(`part&id=${catalog.files[0].id}&part=0`)).status,401);
});
test('Owner private document updates preserve catalogue, reject readers and stale writes',async()=>{
 const x=setup(),owner=await ownerCookie(x),reader=(await x.login()).headers.get('set-cookie').split(';')[0];
 const existing={id:'a'.repeat(32),name:'Existing.txt',title:'Existing',category:'Méthodes et révisions',mime:'text/plain',bytes:3,parts:[digest('old')],sha256:digest('old')};
 await x.store.setJSON('catalog-v1',{files:[existing]});
 const body={name:'Method.txt',title:'Method',category:'Méthodes et révisions',mime:'text/plain',base64:Buffer.from('method').toString('base64')};
 for(const cookie of ['',reader])assert.equal((await command(x,cookie,'owner-save-document',body)).status,401);
 assert.equal((await x.request('owner-save-document',{method:'POST',headers:{Cookie:owner},body:JSON.stringify(body)})).status,403);
 assert.equal((await command(x,owner,'owner-save-document',{...body,name:'../bad.txt'})).status,400);
 assert.equal((await command(x,owner,'owner-save-document',body)).status,200);
 const catalog=await x.store.get('catalog-v1');assert.equal(catalog.files.length,2);assert.equal(catalog.files[0].sha256,existing.sha256);
 assert.equal((await command(x,owner,'owner-save-document',body)).status,409);
 const old=catalog.files[1];assert.equal((await command(x,owner,'owner-save-document',{...body,expectedSha256:old.sha256,base64:Buffer.from('new method').toString('base64')})).status,200);
 const saved=await x.store.get('catalog-v1');assert.equal(saved.files.length,2);assert.equal(saved.files[1].sha256,digest('new method'));
 const r=await x.request('part&id='+saved.files[1].id+'&part=0',{headers:{Cookie:reader}});assert.equal(r.status,200);assert.equal(Buffer.from(await r.arrayBuffer()).toString(),'new method');
 assert.equal((await x.request('part&id='+saved.files[1].id+'&part=0')).status,401);
});
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

test('Owner can choose a short PIN: old code and old sessions stop, editor grants remain valid',async()=>{
 const x=setup(),c=await ownerCookie(x),second=await ownerCookie(x);
 const grant=await(await command(x,c,'create-code',{label:'Maison',days:30})).json();
 const reader=(await editorLogin(x,grant.code)).headers.get('set-cookie').split(';')[0];
 await x.store.setJSON('catalog-v1',{files:[]});
 const changed=await command(x,c,'change-owner-code',{currentCode:'admin-test-secret',newCode:'4268513970',confirmCode:'4268513970'});
 assert.equal(changed.status,200);const fresh=changed.headers.get('set-cookie').split(';')[0];
 assert.equal((await ownerLogin(x)).status,401);
 for(const cookie of [c,second])assert.equal((await x.request('admin-state',{headers:{Cookie:cookie}})).status,401);
 assert.equal((await x.request('admin-state',{headers:{Cookie:fresh}})).status,200);
 assert.equal((await x.request('list',{headers:{Cookie:reader}})).status,200);
 assert.equal((await editorLogin(x,grant.code)).status,200);
 assert.ok(!JSON.stringify([...x.records]).includes('4268513970'));
 const r=await x.request('admin-login',{method:'POST',headers:{Origin:origin},body:'{"code":"42685 13970"}'});assert.equal(r.status,200);
 assert.equal((await command(x,fresh,'change-owner-code',{currentCode:'4268513970',newCode:'6179042385',confirmCode:'6179042385'})).status,200);
 assert.equal((await x.request('admin-state',{headers:{Cookie:fresh}})).status,401);
});
test('PIN changes require owner session, current code, matching confirmation and exact length',async()=>{
 const x=setup(),c=await ownerCookie(x),reader=(await x.login()).headers.get('set-cookie').split(';')[0];
 const valid={currentCode:'admin-test-secret',newCode:'4268513970',confirmCode:'4268513970'};
 assert.equal((await command(x,reader,'change-owner-code',valid)).status,401);
 for(const body of [{...valid,currentCode:'wrong'},{...valid,confirmCode:'0000000000'},{...valid,newCode:'1234',confirmCode:'1234'},{...valid,newCode:'abcdefghij',confirmCode:'abcdefghij'}])assert.equal((await command(x,c,'change-owner-code',body)).status,400);
 for(const Origin of [undefined,'https://evil.example'])assert.equal((await x.request('change-owner-code',{method:'POST',headers:{Cookie:c,...(Origin?{Origin}:{})},body:JSON.stringify(valid)})).status,403);
 assert.equal((await x.request('change-owner-code',{headers:{Cookie:c,Origin:origin}})).status,403);
 assert.equal((await ownerLogin(x)).status,200);
});
test('Concurrent owner code changes do not overwrite each other',async()=>{
 const x=setup(),c=await ownerCookie(x);
 const changes=await Promise.all(['4268513970','6179042385'].map(newCode=>command(x,c,'change-owner-code',{currentCode:'admin-test-secret',newCode,confirmCode:newCode})));
 assert.deepEqual(changes.map(r=>r.status).sort(),[200,409]);
});
test('Owner PIN guessing is globally limited even across distinct IPs',async()=>{
 const x=setup();const results=await Promise.all(Array.from({length:40},(_,i)=>x.request('admin-login',{method:'POST',headers:{Origin:origin},body:'{"code":"wrong"}'},{ip:'192.0.2.'+i})));
 assert.equal(results.filter(r=>r.status===401).length,30);assert.equal(results.filter(r=>r.status===429).length,10);
});

function recoveryMock({email='meguiniahmed16@gmail.com',confirmed=true,enabled=true,valid=true,sendOk=true}={}){
 const calls=[];
 return {calls,fetch:async(url,options={})=>{
  calls.push({path:new URL(url).pathname,options});
  const path=new URL(url).pathname.split('/').pop();
  if(path==='settings')return new Response(JSON.stringify({disable_signup:enabled,autoconfirm:false}));
  if(path==='recover')return new Response('{}',{status:sendOk?200:503});
  if(path==='verify')return new Response(JSON.stringify(valid?{access_token:'private-provider-session'}:{error:'expired'}),{status:valid?200:400});
  if(path==='user')return new Response(JSON.stringify({email,confirmed_at:confirmed?'2026-11-08':null}));
  if(path==='logout')return new Response('{}');
  throw Error('Unexpected identity endpoint');
 }};
}
const resetBody={token:'test-recovery-token-0000000000',type:'recovery',newCode:'4268513970',confirmCode:'4268513970'};
test('Email recovery sends only to the owner, hides other addresses and reports delivery failure',async()=>{
 const mock=recoveryMock(),x=setup({identityFetch:mock.fetch});
 assert.equal((await command(x,'','request-owner-reset',{email:'someone@example.com'})).status,200);
 assert.equal(mock.calls.filter(c=>c.path.endsWith('/recover')).length,0);
 assert.equal((await command(x,'','request-owner-reset',{email:'MEGUINIAHMED16@gmail.com'})).status,200);
 const call=mock.calls.find(c=>c.path.endsWith('/recover'));assert.deepEqual(JSON.parse(call.options.body),{email:'meguiniahmed16@gmail.com'});
 const failed=recoveryMock({sendOk:false}),y=setup({identityFetch:failed.fetch});assert.equal((await command(y,'','request-owner-reset',{email:'meguiniahmed16@gmail.com'})).status,502);
});
test('Recovery link rotates owner access, blocks reuse, and preserves editor grants',async()=>{
 const mock=recoveryMock(),x=setup({identityFetch:mock.fetch}),old=await ownerCookie(x);
 const grant=await(await command(x,old,'create-code',{label:'Maison',days:30})).json();
 const r=await command(x,'','recover-owner-code',resetBody);assert.equal(r.status,200);
 assert.equal((await x.request('admin-state',{headers:{Cookie:old}})).status,401);
 const fresh=r.headers.get('set-cookie').split(';')[0];assert.equal((await x.request('admin-state',{headers:{Cookie:fresh}})).status,200);
 assert.equal((await command(x,'','recover-owner-code',resetBody)).status,400);
 assert.equal((await ownerLogin(x)).status,401);assert.equal((await editorLogin(x,grant.code)).status,200);
 const pinLogin=await x.request('admin-login',{method:'POST',headers:{Origin:origin},body:JSON.stringify({code:resetBody.newCode})});assert.equal(pinLogin.status,200);
 assert.ok(!JSON.stringify([...x.records]).includes(resetBody.token));assert.ok(!JSON.stringify([...x.records]).includes(resetBody.newCode));
 assert.ok(!JSON.stringify(await r.json()).includes('private-provider-session'));
});
test('Invalid, expired, unconfirmed and foreign-account links cannot reset owner access',async()=>{
 for(const options of [{valid:false},{email:'other@example.com'},{confirmed:false},{enabled:false}]){
  const mock=recoveryMock(options),x=setup({identityFetch:mock.fetch});
  const r=await command(x,'','recover-owner-code',resetBody);assert.ok([400,503].includes(r.status));
  assert.equal(await x.store.get('owner-credential/'+x.cfg.adminHash),null);
 }
});
test('Recovery requires correct origin, matching codes and bounded requests',async()=>{
 const mock=recoveryMock(),x=setup({identityFetch:mock.fetch});
 for(const action of ['request-owner-reset','recover-owner-code']){
  assert.equal((await x.request(action)).status,403);
  assert.equal((await x.request(action,{method:'POST',headers:{Origin:'https://evil.example'},body:JSON.stringify(resetBody)})).status,403);
 }
 assert.equal(mock.calls.length,0);
 assert.equal((await command(x,'','recover-owner-code',{...resetBody,confirmCode:'0000000000'})).status,400);
 for(let i=0;i<3;i++)assert.equal((await command(x,'','request-owner-reset',{email:'other@example.com'})).status,200);
 assert.equal((await command(x,'','request-owner-reset',{email:'other@example.com'})).status,429);
});
test('Recovery stays unavailable until Identity is invite-only with confirmation required',async()=>{
 const x=setup({identityFetch:async()=>new Response(JSON.stringify({disable_signup:false,autoconfirm:true}))});
 assert.deepEqual(await(await x.request('recovery-status')).json(),{enabled:false});
 assert.equal((await command(x,'','request-owner-reset',{email:'meguiniahmed16@gmail.com'})).status,503);
});
