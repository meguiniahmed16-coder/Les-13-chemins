import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {createHmac} from 'node:crypto';
import worker from './worker.mjs';
import {origin,seed} from './model.mjs';

function database(){
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('schema.sql',import.meta.url),'utf8'));db.exec('CREATE TABLE blog_media(id TEXT PRIMARY KEY)');
 const wrap=(sql,args=[])=>({bind:(...values)=>wrap(sql,values),all:async()=>({results:db.prepare(sql).all(...args)}),first:async key=>{const o=db.prepare(sql).get(...args);return key?o?.[key]??null:o??null;},run:async()=>({meta:db.prepare(sql).run(...args)})});
 return {prepare:wrap,batch:items=>Promise.all(items.map(q=>q.all()))};
}
test('Création, brouillon, taille, port, concurrence, abandon et paiement signé',async t=>{
 const env={DB:database(),AUTH:{fetch:async(_,opt)=>new Response(null,{status:opt.headers.cookie.includes('valide')?200:401})},STRIPE_RESTRICTED_KEY:'unit-test-only',STRIPE_WEBHOOK_SECRET:'unit-test-signature'};
 const call=async(path,body,cookie='')=>worker.fetch(new Request(origin+path,{method:body?'POST':'GET',headers:{origin,cookie},body:body?JSON.stringify(body):undefined}),env,{});
 const admin='__Host-am_site_admin=valide';
 let n=0;const sessionIds=new Map();let fields;
 t.mock.method(globalThis,'fetch',async (u,o)=>{fields=o.body;assert.ok(u.endsWith('/checkout/sessions'));const id='cs_unit_'+(++n);sessionIds.set(fields.get('metadata[bois_order]'),id);return Response.json({id,url:'https://checkout.stripe.com/c/pay/'+id});});
 const event=async(id,type,status,payment_status)=>{
 const raw=JSON.stringify({livemode:true,type,data:{object:{id:sessionIds.get(id),metadata:{bois_order:id},status,payment_status,currency:'eur',amount_total:4500,customer_details:{email:'acheteur@example.invalid'},collected_information:{shipping_details:{name:'Client test',address:{country:'FR'}}}}}});
 const time=Math.floor(Date.now()/1000);const sig=createHmac('sha256',env.STRIPE_WEBHOOK_SECRET).update(time+'.'+raw).digest('hex');
 return worker.fetch(new Request(origin+'/webhook',{method:'POST',headers:{'stripe-signature':'t='+time+',v1='+sig},body:raw}),env,{});
 };
 assert.equal((await call('/admin/catalog')).status,401);
 const draft={...seed,legacy:false,id:crypto.randomUUID(),revision:0,state:'draft',zones:[{id:'france',label:'Envoi suivi',countries:['FR'],pickup:false,fee:600}]};
 assert.equal((await call('/admin/save',draft,admin)).status,200);
 assert.deepEqual((await (await call('/catalog')).json()).pieces,[]);
 assert.equal((await call('/admin/save',{...draft,state:'published',revision:1},admin)).status,200);
 const cat=async()=>(await (await call('/catalog')).json()).pieces[0];const active=await cat();
 const buy={id:crypto.randomUUID(),piece:draft.id,variant:'unique',zone:'france',revision:active.revision};
 assert.equal((await call('/checkout',buy)).status,200);
 assert.equal(fields.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]'),'600');
 assert.equal(fields.get('shipping_address_collection[allowed_countries][0]'),'FR');
 assert.equal((await call('/checkout',buy)).status,200);assert.equal(n,1);
 const other={...buy,id:crypto.randomUUID(),revision:(await cat()).revision};assert.equal((await call('/checkout',other)).status,409);
 await event(buy.id,'checkout.session.expired','expired','unpaid');assert.equal((await cat()).variants[0].stock,1);
 const second={...other,revision:(await cat()).revision};assert.equal((await call('/checkout',second)).status,200);
 await event(second.id,'checkout.session.completed','complete','unpaid');assert.equal((await cat()).variants[0].stock,0);
 assert.equal((await event(second.id,'checkout.session.async_payment_succeeded','complete','paid')).status,200);
 assert.equal((await event(second.id,'checkout.session.async_payment_succeeded','complete','paid')).status,200);
 const after=await (await call('/admin/catalog',undefined,admin)).json();assert.equal(after.orders.length,1);assert.equal(after.pieces[0].variants[0].stock,0);assert.equal(after.orders[0].buyer.address.country,'FR');
 assert.equal((await call('/admin/save',{...draft,revision:1,state:'published'},admin)).status,409);
 assert.equal((await call('/admin/shipped',{id:second.id,shipped:true},admin)).status,200);
 assert.equal((await call('/admin/save',{...after.pieces[0],state:'archived'},admin)).status,200);assert.equal(await cat(),undefined);
 const fake=await call('/webhook',{type:'checkout.session.completed'});assert.equal(fake.status,400);
});
