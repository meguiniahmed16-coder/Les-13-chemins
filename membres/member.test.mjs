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
  return {db,DB,api,env};
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

test('Le salon auteur réutilise la session active et ne crée pas une connexion membre persistante',async()=>{
  const {api,db,env}=setup();
  const studio='__Host-am_site_admin=test-session';
  const editor='__Host-editor-admin='+'6'.repeat(64);
  const signed=await api('signup',account), ordinary=signed.headers.get('set-cookie').split(';')[0];
  env.ADMIN.fetch=async r=>Response.json({ok:r.headers.get('cookie')===studio});
  const open=await api('me',null,studio+'; '+ordinary),owner=await open.json();
  assert.equal(owner.author,'atelier');assert.equal(open.headers.get('set-cookie'),null);
  assert.equal((await api('avatar',{avatar:{...owner.avatar,bottom:'laine'}},studio)).status,200);
  assert.equal((await api('checkout',{},studio)).status,409);
  assert.equal((await api('admin/settings',null,studio)).status,200);
  assert.notEqual(owner.id,(await (await api('me',null,ordinary)).json()).id);
  const originalFetch=globalThis.fetch;
  try {
    globalThis.fetch=async(url,opts)=>{
      assert.equal(url,'https://tectonique-des-ames.com/.netlify/functions/editor?action=owner-session');
      assert.equal(opts.headers.cookie,editor);return Response.json({ok:true});
    };
    const other=await (await api('me',null,editor)).json();
    assert.equal(other.author,'edition');assert.equal(other.id,owner.id);
    assert.equal(other.avatar.bottom,'laine');
    assert.equal(db.prepare("SELECT count(*) n FROM member_sessions WHERE member=?").get(owner.id).n,0);
  } finally {globalThis.fetch=originalFetch;}
  env.ADMIN.fetch=async()=>new Response(null,{status:401});
  assert.equal((await api('admin/settings',null,studio)).status,401);
  assert.equal((await api('me?auteur=1',null,studio+'; '+ordinary)).status,401);
});
test('Les fournisseurs se configurent seulement depuis une session auteur et leurs secrets restent privés',async()=>{
  const {api,db,env}=setup(),owner='__Host-am_site_admin=author';
  env.ADMIN.fetch=async()=>Response.json({ok:true});
  env.OAUTH_SETTINGS_KEY=Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64');
  const config={provider:'google',id:'123-example.apps.googleusercontent.com',secret:'example-secret-for-test'};
  const before=await (await api('options')).json();
  assert.deepEqual(before.providers,{google:false,facebook:false});
  assert.equal((await api('admin/providers',config)).status,401);
  assert.equal((await api('admin/providers',config,owner,'https://example.invalid')).status,403);
  const after=await (await api('admin/providers',config,owner)).json();
  assert.deepEqual(after.providers,{google:true,facebook:false});
  assert.ok(!db.prepare("SELECT value FROM member_admin_settings WHERE key='oauth:google'").get().value.includes(config.secret));
  const start=await api('oauth/google');assert.equal(start.status,303);
  const target=new URL(start.headers.get('location'));
  assert.equal(target.searchParams.get('redirect_uri'),'https://tectonique-des-ames.com/api/membres/oauth/google/callback');
  assert.equal(target.searchParams.get('client_id'),config.id);
});
