import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {createHmac} from 'node:crypto';
import worker from './worker.mjs';
import {termsVersion} from './conditions.mjs';
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
 const buy={termsVersion,id:crypto.randomUUID(),piece:draft.id,variant:'unique',zone:'france',revision:active.revision};
 assert.equal((await call('/checkout',{...buy,termsVersion:undefined})).status,409);
 assert.equal((await call('/checkout',buy)).status,200);
 assert.equal(fields.get('metadata[conditions_vente]'),termsVersion);
 assert.ok(fields.get('custom_text[submit][message]').includes('/conditions-'+termsVersion+'.html'));
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

test('Le pays détermine le tarif, le total et l’adresse acceptée dans Stripe',async t=>{
 const {worldZone,offersForCountry,destinations}=await import('./livraison.mjs');
 const {normalize}=await import('./model.mjs');
 const world=worldZone();
 const canada={id:crypto.randomUUID(),label:'Colis Canada',countries:['CA'],fee:1400,pickup:false};
 const pickup={id:crypto.randomUUID(),label:'Remise sur place',countries:[],fee:0,pickup:true};
 const zones=[...seed.zones,canada,world,pickup];
 assert.deepEqual(offersForCountry(zones,'FR'),seed.zones);
 assert.deepEqual(offersForCountry(zones,'CA'),[canada]);
 for(const country of ['SN','JP','US','ZA']) assert.deepEqual(offersForCountry(zones,country),[world]);
 assert.deepEqual(offersForCountry(zones,'pickup'),[pickup]);
 assert.deepEqual(offersForCountry(zones,'ZZ'),[]);
 assert.ok(destinations(zones).length>200);
 assert.throws(()=>normalize({...seed,zones:[...zones,{...world,id:crypto.randomUUID()}]},'published'));
 const env={DB:database(),STRIPE_RESTRICTED_KEY:'test-only'};
 const piece=crypto.randomUUID(),record={...seed,zones,legacy:false};
 await env.DB.prepare("INSERT INTO bois_pieces VALUES(?,1,'published',?,0)").bind(piece,JSON.stringify(record)).run();
 let fields;
 t.mock.method(globalThis,'fetch',async (url,init)=>{fields=init.body;return Response.json({id:'cs_international',url:'https://checkout.stripe.com/c/pay/cs_international'});});
 const post=body=>worker.fetch(new Request(origin+'/checkout',{method:'POST',headers:{origin},body:JSON.stringify(body)}),env,{});
 const body={termsVersion,piece,id:crypto.randomUUID(),variant:'unique',zone:world.id,revision:1};
 assert.equal((await post(body)).status,400);
 for(const country of ['CA','FR','ZZ']) assert.equal((await post({...body,country})).status,400);
 assert.equal((await post({...body,country:'JP',zone:'france'})).status,400);
 assert.equal((await post({...body,country:'SN'})).status,200);
 assert.equal(fields.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]'),'850');
 assert.equal(fields.get('shipping_address_collection[allowed_countries][0]'),'SN');
 assert.equal(fields.has('shipping_address_collection[allowed_countries][1]'),false);
 const snap=JSON.parse(await env.DB.prepare('SELECT snapshot FROM bois_orders WHERE id=?').bind(body.id).first('snapshot'));
 assert.equal(snap.price+snap.fee,4750);
 assert.equal((await post({...body,country:'JP'})).status,409);
 assert.equal((await post({...body,country:'SN'})).status,200);
});

test('La fiche de la bague permet de régler le port international tout en protégeant son lien France',async()=>{
 const {worldZone}=await import('./livraison.mjs');
 const env={DB:database(),AUTH:{fetch:async()=>new Response(null)}};
 await env.DB.prepare("INSERT INTO bois_pieces VALUES('santal-rose',1,'published',?,0)").bind(JSON.stringify(seed)).run();
 const zones=[...seed.zones,worldZone()];
 const post=(path,body)=>worker.fetch(new Request(origin+path,{method:'POST',headers:{origin,cookie:'__Host-am_site_admin=test'},body:JSON.stringify(body)}),env,{});
 const row={...seed,id:'santal-rose',revision:1,state:'published',zones};
 assert.equal((await post('/admin/save',row)).status,200);
 assert.equal((await post('/admin/save',{...row,revision:2,zones:[{...zones[0],fee:300},zones[1]]})).status,400);
 const body={id:crypto.randomUUID(),piece:row.id,variant:'unique',zone:'france',country:'FR',revision:2};
 assert.equal((await post('/checkout',body)).status,200);
 assert.equal((await post('/checkout',{...body,country:'JP'})).status,400);
 assert.equal((await post('/checkout',{...body,country:'JP',zone:'reste-du-monde'})).status,409);
});

test('Le paiement express privilégie les portefeuilles et une annulation libère la pièce avant de changer de moyen',async t=>{
 const env={DB:database(),STRIPE_RESTRICTED_KEY:'test-only'};
 const piece=crypto.randomUUID(),order=crypto.randomUUID();
 await env.DB.prepare("INSERT INTO bois_pieces VALUES(?,1,'published',?,0)").bind(piece,JSON.stringify({...seed,legacy:false})).run();
 const call=(path,body)=>worker.fetch(new Request(origin+path,{method:'POST',headers:{origin},body:JSON.stringify(body)}),env,{});
 const catalog=async()=>(await (await worker.fetch(new Request(origin+'/catalog'),env,{})).json()).pieces[0];
 const checkout=(id,checkoutMode,revision)=>call('/checkout',{termsVersion,id,checkoutMode,piece,revision,zone:'france',variant:'unique',country:'FR'});
 const session={id:'cs_wallet',status:'open',payment_status:'unpaid',metadata:{bois_order:order}};
 const creations=[];
 let expirationCalls=0;
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  if(url.endsWith('/checkout/sessions')){
   creations.push(options.body);return Response.json({...session,url:'https://checkout.stripe.com/c/pay/cs_wallet'});
  }
  if(url.endsWith('/expire')){expirationCalls++;session.status='expired';}
  return Response.json(session);
 });
 assert.equal((await checkout(order,'express',1)).status,200);
 assert.equal((await catalog()).variants[0].reserved,true);
 const resume=await (await call('/reservation',{id:order,piece})).json();
 assert.equal(resume.url,'https://checkout.stripe.com/c/pay/cs_wallet');
 assert.deepEqual(await (await call('/reservation',{id:order,piece:crypto.randomUUID()})).json(),{});
 assert.equal(creations[0].get('allowed_payment_method_types[0]'),'card');
 assert.equal(creations[0].get('wallet_options[link][display]'),'never');
 assert.ok(creations[0].get('cancel_url').includes('#annuler='+order+'&piece='+piece));
 assert.equal((await call('/cancel',{id:crypto.randomUUID()})).status,200);
 assert.equal((await catalog()).variants[0].stock,0);
 assert.equal((await call('/cancel',{id:order})).status,200);
 assert.equal((await call('/cancel',{id:order})).status,200);
 assert.equal(expirationCalls,1);
 const available=await catalog();assert.equal(available.variants[0].stock,1);assert.equal(available.variants[0].reserved,false);
 session.id='cs_standard';session.status='open';session.metadata.bois_order=crypto.randomUUID();
 assert.equal((await checkout(session.metadata.bois_order,'standard',available.revision)).status,200);
 assert.equal(creations[1].has('allowed_payment_method_types[0]'),false);
 assert.equal(creations[1].has('wallet_options[link][display]'),false);
 Object.assign(session,{status:'complete',payment_status:'paid',currency:'eur',amount_total:3900});
 assert.equal((await call('/cancel',{id:session.metadata.bois_order})).status,409);
 assert.equal(expirationCalls,1);
 assert.equal((await catalog()).variants[0].stock,0);
});

test('La rétractation est enregistrée avec son contenu, sa date et un accusé stable, et reste privée',async()=>{
 const db=database();
 for(const command of readFileSync(new URL('legal-schema.sql',import.meta.url),'utf8').split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(command).run();
 const env={DB:db,AUTH:{fetch:async()=>new Response(null,{status:200})}};
 const call=(path,body,cookie='')=>worker.fetch(new Request(origin+path,{method:body?'POST':'GET',headers:{origin,cookie},body:body?JSON.stringify(body):undefined}),env,{});
 const id=crypto.randomUUID();
 const declaration={id,name:'Essai',email:'essai@example.invalid',contract:'Livre, novembre',confirm:true};
 assert.equal((await call('/retractation',{...declaration,confirm:false})).status,400);
 const first=await (await call('/retractation',declaration)).json();
 assert.ok(Number.isFinite(Date.parse(first.received)));
 assert.deepEqual(await (await call('/retractation',declaration)).json(),first);
 assert.equal((await call('/retractation',{...declaration,contract:'autre'})).status,409);
 assert.equal((await call('/admin/retractations')).status,401);
 const admin='__Host-am_site_admin=valide';
 const records=await (await call('/admin/retractations',null,admin)).json();
 assert.equal(records.items.length,1);assert.equal(records.items[0].email,declaration.email);
 assert.equal((await call('/admin/accuse',{id},admin)).status,200);
 assert.ok((await (await call('/admin/retractations',null,admin)).json()).items[0].acknowledged);
});
