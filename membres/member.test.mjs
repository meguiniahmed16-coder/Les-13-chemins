import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile, mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {applyEvent,offer,membership} from './billing.mjs';
import {ageBand} from './identity.mjs';
const dir=await mkdtemp(join(tmpdir(),'chemins-member-')),bundle=join(dir,'compiled.mjs');
execFileSync(process.execPath,['membres/build-worker.mjs',bundle]);
const {default:worker}=await import(pathToFileURL(bundle));await rm(dir,{recursive:true});
const schema=await readFile(new URL('schema.sql',import.meta.url),'utf8');
function setup(){
  const db=new DatabaseSync(':memory:');db.exec(schema);
  const DB={prepare(sql){
    const statement=db.prepare(sql);
    const bind=(...args)=>({bind,first:async()=>statement.get(...args)||null,all:async()=>({results:statement.all(...args)}),run:async()=>({meta:statement.run(...args)})});
    return bind();
  },async batch(stmts){for(const stmt of stmts)await stmt.run();}};
  const env={DB,STRIPE_WEBHOOK_SECRET:'test',ADMIN:{fetch:()=>new Response(null,{status:401})}};
  const origin='https://tectonique-des-ames.com';
  const api=(path,body,session,from=origin)=>worker.fetch(new Request(origin+'/api/membres/'+path,{method:body?'POST':'GET',headers:{origin:from,cookie:session||'','content-type':'application/json'},body:body?JSON.stringify(body):undefined}),env);
  return {db,DB,api};
}
const account={email:'account@example.invalid',password:'passphrase-bateau',birth:'1977-06-28',pseudo:'Ahmed',name:''};
test('Le compte privé persiste, les accès sont séparés et la déconnexion révoque la session',async()=>{
  const {api}=setup();
  assert.equal((await api('me')).status,401);
  assert.equal((await api('signup',account,'','https://example.invalid')).status,403);
  const registered=await api('signup',account);assert.equal(registered.status,200);
  const cookie=registered.headers.get('set-cookie').split(';')[0];
  const m=await (await api('me',null,cookie)).json();assert.equal(m.pseudo,'Ahmed');assert.ok(m.avatar.bottom);
  assert.equal((await api('signup',account)).status,409);
  assert.equal((await api('login',{...account,password:'incorrect'})).status,401);
  assert.equal((await api('login',account)).status,200);
  assert.equal((await api('admin/module',null,cookie)).status,401);
  assert.equal((await api('avatar',{avatar:{...m.avatar,bottom:'laine'}},cookie)).status,403);
  assert.equal((await api('journey',{memberId:'another',games:['sarajevo']},cookie)).status,403);
  assert.equal((await api('journey',{memberId:m.id,games:['sarajevo','unknown'],videos:['https://example.org']},cookie)).status,200);
  assert.deepEqual((await (await api('me',null,cookie)).json()).journey,{games:['sarajevo'],videos:[],scenes:['sarajevo']});
  assert.equal((await api('logout',{},cookie)).status,200);assert.equal((await api('me',null,cookie)).status,401);
});
test('Le renouvellement payé ouvre les options et la fin du contrat ferme les droits même si Stripe réessaie un ancien événement',async()=>{
  const {DB,api}=setup();const signed=await api('signup',account);const c=signed.headers.get('set-cookie').split(';')[0];
  const m=await (await api('me',null,c)).json();const start=await (await api('checkout',{},c)).json();
  const ref=new URL(start.url).searchParams.get('client_reference_id'),date=Math.floor(Date.now()/1000);
  const event=(type,object,created=date)=>({type,data:{object},livemode:true,created});
  const subscription={id:'sub_1',status:'active',metadata:{offre:'compagnon-de-route'},items:{data:[{price:{id:offer.price}}]}};
  const paid=event('invoice.paid',{status:'paid',parent:{subscription_details:{subscription:'sub_1'}},lines:{data:[{pricing:{price_details:{price:offer.price}},amount:500,period:{end:date+86400}}]}});
  await applyEvent(DB,paid);await applyEvent(DB,paid);
  assert.equal((await membership(DB,m.id,date)).companion,false);
  await applyEvent(DB,event('checkout.session.completed',{subscription:'sub_1',payment_link:offer.link,mode:'subscription',client_reference_id:ref}));
  await applyEvent(DB,event('customer.subscription.created',subscription));
  assert.equal((await membership(DB,m.id,date)).companion,true);
  assert.equal((await api('avatar',{avatar:{...m.avatar,bottom:'laine'}},c)).status,200);
  assert.equal((await membership(DB,m.id,date+86401)).companion,false);
  await applyEvent(DB,event('customer.subscription.deleted',subscription,date+100));
  await applyEvent(DB,event('customer.subscription.updated',subscription,date+20));await applyEvent(DB,paid);
  const back=await (await api('me',null,c)).json();assert.equal(back.companion,false);assert.notEqual(back.avatar.bottom,'laine');assert.equal(back.portal,offer.portal);
});
test('La tranche d’âge change le jour anniversaire',()=>{
  assert.equal(ageBand('2008-11-21',new Date('2026-11-20T12:00:00Z')),'Moins de 18 ans');
  assert.equal(ageBand('2008-11-21',new Date('2026-11-21T12:00:00Z')),'18–24 ans');
});
