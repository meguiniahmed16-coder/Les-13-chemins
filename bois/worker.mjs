import {origin,page,seed,legacyId,legacyLink,legacyStripe,uuid,normalize,project,fail} from './model.mjs';
import {getKey,saveKey,stripe,verifiedEvent} from './stripe.mjs';
import {readImage} from '../double-backend/media.js';
const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
const now=()=>Math.floor(Date.now()/1000);
const countsSQL="SELECT piece,variant,SUM(status='paid') paid,SUM(status IN ('creating','open','waiting')) held FROM bois_orders GROUP BY piece,variant";
const query=(env,sql,...args)=>env.DB.prepare(sql).bind(...args);
const change=(rs)=>rs.meta.changes>0;
async function jsonBody(req,max=55000){
 const reader=req.body?.getReader();if(!reader)fail(400,'Formulaire vide.');let size=0;const chunks=[];
 for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();fail(413,'Données trop volumineuses.');}chunks.push(value);}
 const bytes=new Uint8Array(size);let pos=0;for(const chunk of chunks){bytes.set(chunk,pos);pos+=chunk.length;}
 try{return JSON.parse(new TextDecoder().decode(bytes));}catch{fail(400,'Formulaire invalide.');}
}
async function authenticate(req,env){
 const cookie=req.headers.get('cookie')?.match(/(?:^|;\s*)(__Host-am_site_admin=[^;]+)/)?.[1];if(!cookie)fail(401,'Connecte-toi à ton espace auteur.');
 const r=await env.AUTH.fetch('https://ahmed-marie-double.meguiniahmed16.workers.dev/web-admin/auth/session',{headers:{cookie,origin},redirect:'manual'});
 if(!r.ok)fail(r.status===401?401:503,r.status===401?'Reconnecte-toi à ton espace auteur.':'Connexion temporairement indisponible.');
}
async function catalog(env,admin){
 const [rows,counts]=await env.DB.batch([env.DB.prepare('SELECT * FROM bois_pieces '+(admin?'':"WHERE state='published'")+' ORDER BY updated DESC,id'),env.DB.prepare(countsSQL)]);
 const result={pieces:rows.results.map(row=>project(row,counts.results,admin))};
 if(admin){result.connected=Boolean(await getKey(env));result.orders=(await env.DB.prepare("SELECT id,piece,snapshot,created,buyer,shipped FROM bois_orders WHERE status='paid' ORDER BY created DESC LIMIT 150").all()).results.map(o=>({...o,snapshot:JSON.parse(o.snapshot),buyer:JSON.parse(o.buyer||'{}')}));}
 return result;
}
async function save(env,input){
 if(!['draft','published','archived'].includes(input.state))fail(400,'État inconnu.');
 if(!(uuid.test(input.id)||input.id===legacyId)||!Number.isInteger(input.revision))fail(400,'Fiche inconnue.');
 const prev=await query(env,'SELECT * FROM bois_pieces WHERE id=?',input.id).first();
 if((prev?.revision||0)!==input.revision)fail(409,'Cette fiche a changé. Recharge la liste avant de la modifier.');
 const p=normalize(input,input.state);const old=prev&&JSON.parse(prev.data);
 if(old?.legacy){
   const commercial=v=>JSON.stringify([v.price,v.variants.map(x=>[x.id,x.label]),v.zones]);
   if(commercial(p)!==commercial(seed))fail(400,'Les conditions de cette vente existante sont gérées dans Stripe.');
   p.legacy=true;
 }else if(input.state==='published'&&!(await getKey(env)))fail(409,'Enregistre le brouillon puis relie Stripe pour publier.');
 const counts=(await query(env,countsSQL.replace('GROUP BY','WHERE piece=? GROUP BY'),input.id).all()).results;
 for(const c of counts){const v=p.variants.find(x=>x.id===c.variant);if(c.held&&(!v||v.stock<c.held))fail(409,'Une commande réserve cette taille. Conserve son stock jusqu’à la fin du paiement.');}
 if(p.legacy){p.variants[0].stock=1;}else for(const v of p.variants){v.stock+=counts.find(x=>x.variant===v.id)?.paid||0;}
 for(const img of p.photos.filter(x=>x.src.startsWith('/media/'))){
  if(!await query(env,'SELECT 1 FROM blog_media WHERE id=?',img.src.slice(7)).first())fail(400,'Une photo est introuvable.');
 }
 const sql=prev?'UPDATE bois_pieces SET revision=revision+1,state=?,data=?,updated=? WHERE id=? AND revision=?':'INSERT OR IGNORE INTO bois_pieces(state,data,updated,id,revision) VALUES(?,?,?,?,1)';
 const args=[input.state,JSON.stringify(p),now(),input.id];if(prev)args.push(input.revision);
 if(!change(await query(env,sql,...args).run()))fail(409,'La fiche a changé. Recharge-la.');
 return reply({id:input.id,revision:input.revision+1});
}
function sessionParams(order){
 const s=JSON.parse(order.snapshot),prefix='line_items[0]';
 const fields={mode:'payment',integration_identifier:'odeur_du_bois_jxomwqer',locale:'fr',success_url:page+'?commande=retour',cancel_url:page+'?piece='+order.piece,expires_at:String(order.created+3600),'metadata[bois_order]':order.id,
 [prefix+'[quantity]']:'1',[prefix+'[price_data][currency]']:'eur',[prefix+'[price_data][unit_amount]']:String(s.price),[prefix+'[price_data][product_data][name]']:s.title+' · '+s.variant};
 if(s.photo)fields[prefix+'[price_data][product_data][images][0]']=s.photo;
 if(!s.pickup){
  s.countries.forEach((c,i)=>fields['shipping_address_collection[allowed_countries]['+i+']']=c);
  const rate='shipping_options[0][shipping_rate_data]';fields[rate+'[type]']='fixed_amount';fields[rate+'[display_name]']=s.delivery;fields[rate+'[fixed_amount][amount]']=String(s.fee);fields[rate+'[fixed_amount][currency]']='eur';
 }else fields['custom_text[submit][message]']=s.delivery;
 return fields;
}
async function checkout(env,body){
 const {id,piece,variant,zone}=body;if(!uuid.test(id)||!(uuid.test(piece)||piece===legacyId))fail(400,'Commande invalide.');
 const row=await query(env,"SELECT * FROM bois_pieces WHERE id=? AND state='published'",piece).first();
 if(!row)fail(404,'Cette pièce ne se vend plus.');const p=JSON.parse(row.data);
 if(p.legacy)return reply({url:legacyLink});
 const token=await getKey(env);if(!token)fail(503,'Le paiement est temporairement indisponible.');
 const v=p.variants.find(x=>x.id===variant),z=p.zones.find(x=>x.id===zone);if(!v||!z)fail(400,'Choisis une taille et une livraison disponibles.');
 let o=await query(env,'SELECT * FROM bois_orders WHERE id=?',id).first();
 if(!o){
  if(body.revision!==row.revision)fail(409,'La fiche a changé. Actualise-la avant de commander.');
  const img=p.photos[0]?.src;
  const snap={title:p.title,variant:v.label,delivery:z.label,price:p.price,fee:z.fee,pickup:z.pickup,countries:z.countries,photo:img?(img.startsWith('/media/')?origin+'/api/creations'+img:origin+img):''};
  const sql="INSERT OR IGNORE INTO bois_orders(id,piece,variant,zone,status,snapshot,created) SELECT ?,?,?,?,'creating',?,? WHERE EXISTS(SELECT 1 FROM bois_pieces WHERE id=? AND revision=? AND state='published') AND (SELECT COUNT(*) FROM bois_orders WHERE piece=? AND variant=? AND status IN ('creating','open','waiting','paid'))<?";
  await query(env,sql,id,piece,variant,zone,JSON.stringify(snap),now(),piece,row.revision,piece,variant,v.stock).run();
  o=await query(env,'SELECT * FROM bois_orders WHERE id=?',id).first();
 }
 if(!o||o.piece!==piece||o.variant!==variant||o.zone!==zone)fail(409,'Cette option n’est plus disponible. Actualise la collection.');
 if(o.status==='open'&&o.created+3600>now())return reply({url:o.url});
 if(o.status!=='creating'||o.created+1800<=now())fail(409,'Cette tentative est terminée. Actualise la collection.');
 let session;try{session=await stripe(token,'/checkout/sessions',sessionParams(o),'bois-'+o.id);}catch(e){
  if(e.definitive)await query(env,"UPDATE bois_orders SET status='expired' WHERE id=? AND status='creating'",id).run();throw e;
 }
 await query(env,"UPDATE bois_orders SET status='open',session=?,url=? WHERE id=? AND status='creating'",session.id,session.url,id).run();
 return reply({url:session.url});
}
function deliveryInfo(s){
 const shipping=s.collected_information?.shipping_details||s.shipping_details||{};
 return {email:s.customer_details?.email||'',name:shipping.name||s.customer_details?.name||'',address:shipping.address||null};
}
async function settle(env,session,kind){
 const legacy=session.payment_link===legacyStripe,id=legacy?'legacy-'+session.id:session.metadata?.bois_order;
 if(!id||(!legacy&&!uuid.test(id)))return;
 const status=session.payment_status==='paid'?'paid':kind==='checkout.session.async_payment_failed'||session.status==='expired'?'expired':session.status==='complete'?'waiting':null;
 if(!status)return;
 if(legacy){
  if(status==='expired')return;
  const snap={title:seed.title,variant:'Pièce unique',delivery:seed.zones[0].label,price:seed.price,fee:0};
  await query(env,"INSERT OR IGNORE INTO bois_orders(id,piece,variant,zone,status,snapshot,created,session) VALUES(?,?,'unique','france','open',?,?,?)",id,legacyId,JSON.stringify(snap),session.created||now(),session.id).run();
 }
 const o=await query(env,'SELECT * FROM bois_orders WHERE id=?',id).first();if(!o||o.session&&o.session!==session.id)return;
 const s=JSON.parse(o.snapshot);if(status==='paid'&&(session.currency!=='eur'||session.amount_total!==s.price+s.fee))fail(409,'Montant de commande incohérent.');
 await query(env,"UPDATE bois_orders SET status=?,session=?,url=NULL,buyer=? WHERE id=? AND status NOT IN ('paid','expired')",status,session.id,status==='paid'?JSON.stringify(deliveryInfo(session)):null,id).run();
}
async function cleanup(env){
 const token=await getKey(env);if(!token)return;
 await query(env,"UPDATE bois_orders SET status='expired' WHERE status='creating' AND session IS NULL AND created<?",now()-3900).run();
 const {results}=await query(env,"SELECT session FROM bois_orders WHERE status IN ('open','waiting') AND session IS NOT NULL AND created<? ORDER BY created DESC LIMIT 25",now()-3600).all();
 for(const row of results){try{await settle(env,await stripe(token,'/checkout/sessions/'+row.session),'reconcile');}catch{console.error('bois_reconciliation_differee');}}
}
export default {
 async fetch(req,env){try{
  const url=new URL(req.url),path=url.pathname;
  if(path==='/webhook'&&req.method==='POST'){
   const event=await verifiedEvent(await req.text(),req.headers.get('stripe-signature'),env.STRIPE_WEBHOOK_SECRET);
   if(event.livemode&&['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired'].includes(event.type))await settle(env,event.data.object,event.type);
   return reply({received:true});
  }
  if(req.method==='POST'&&req.headers.get('origin')!==origin)fail(403,'Origine refusée.');
  if(path==='/buy/santal-rose'&&req.method==='GET'){
   const list=await catalog(env,false);const ring=list.pieces.find(p=>p.id===legacyId);
   return Response.redirect(ring?.legacy&&ring.variants.some(v=>v.stock>0)?legacyLink:page,303);
  }
  if(path==='/catalog'&&req.method==='GET')return reply(await catalog(env,false));
  if(path.startsWith('/media/')&&req.method==='GET'){
   const visible=await query(env,"SELECT 1 FROM bois_pieces p,json_each(p.data,'$.photos') photo WHERE p.state='published' AND json_extract(photo.value,'$.src')=? LIMIT 1",path).first();
   if(!visible)fail(404,'Photo introuvable.');return readImage(path.slice(6),env,true);
  }
  if(path==='/checkout'&&req.method==='POST')return await checkout(env,await jsonBody(req,2048));
  if(!path.startsWith('/admin/'))fail(404,'Page inconnue.');await authenticate(req,env);
  if(path==='/admin/catalog'&&req.method==='GET')return reply(await catalog(env,true));
  if(req.method!=='POST')fail(405,'Méthode refusée.');const body=await jsonBody(req);
  if(path==='/admin/save')return await save(env,body);
  if(path==='/admin/convert'){
   if(body.id!==legacyId)fail(400,'Fiche inconnue.');
   const row=await query(env,'SELECT * FROM bois_pieces WHERE id=?',legacyId).first();
   if(!row||!JSON.parse(row.data).legacy||row.revision!==body.revision)fail(409,'Actualise la fiche.');
   const token=await getKey(env);if(!token)fail(409,'Relie Stripe au catalogue.');
   const link=await stripe(token,'/payment_links/'+legacyStripe);
   if(link.active)fail(409,'Désactive d’abord le lien de cette bague dans Stripe, puis reprends sa gestion ici.');
   const pending=await stripe(token,'/checkout/sessions?payment_link='+legacyStripe+'&status=open&limit=1');
   if(pending.data.length)fail(409,'Un ancien paiement est encore ouvert. Réessaie lorsqu’il sera terminé.');
   const completed=await stripe(token,'/checkout/sessions?payment_link='+legacyStripe+'&status=complete&limit=10');
   for(const session of completed.data)await settle(env,session,'reconcile');
   const saved=await query(env,'SELECT * FROM bois_pieces WHERE id=?',legacyId).first();
   if(JSON.parse(saved.data).legacy&&saved.data===row.data){
    const d=JSON.parse(saved.data);delete d.legacy;
    if(change(await query(env,'UPDATE bois_pieces SET data=?,revision=revision+1 WHERE id=? AND revision=?',JSON.stringify(d),legacyId,saved.revision).run()))return reply({ok:true});
   }
   fail(409,'La fiche a changé. Actualise-la.');
  }
  if(path==='/admin/stripe'){await saveKey(env,String(body.key||''));return reply({connected:true});}
  if(path==='/admin/shipped'){
   if(!change(await query(env,"UPDATE bois_orders SET shipped=? WHERE id=? AND status='paid'",body.shipped?now():null,body.id).run()))fail(404,'Commande inconnue.');return reply({ok:true});
  }
  fail(404,'Page inconnue.');
 }catch(e){if(!e.status)console.error('bois_service_error',e.name);return reply({error:e.status?e.message:'Le service est momentanément indisponible.'},e.status||503);}},
 async scheduled(_,env,ctx){ctx.waitUntil(cleanup(env));}
};
