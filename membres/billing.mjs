import {verifiedEvent} from '../bois/stripe.mjs';

export const offer = {
  price:'price_1UdxfwPdtc1VYes6gpnG0FmO', link:'plink_1UdxgnPdtc1VYes6AS3in5ZE',
  checkout:'https://buy.stripe.com/14AaEZ6Gc7vjgHA2zE1sQ05',
  portal:'https://billing.stripe.com/p/login/28EfZj4y4bLz2QKcae1sQ00'
};
const query=(db,sql,...params)=>db.prepare(sql).bind(...params);
export async function membership(db,member,now){
  const row=await query(db,"SELECT MAX(paid_until) AS until FROM member_subscriptions WHERE member=? AND paid_until>? AND status NOT IN ('canceled','unpaid','incomplete_expired','paused')",member,now).first();
  const billed=await query(db,'SELECT id FROM member_subscriptions WHERE member=? LIMIT 1',member).first();
  return {companion:Boolean(row?.until),paidUntil:row?.until||0,portal:billed?offer.portal:null};
}
export async function checkout(db,member,now){
  if((await membership(db,member.id,now)).companion) return {url:offer.portal};
  const open=await query(db,"SELECT id FROM member_subscriptions WHERE member=? AND status NOT IN ('canceled','incomplete_expired') LIMIT 1",member.id).first();
  if(open)return {url:offer.portal};
  const ref=crypto.randomUUID();
  await query(db,'INSERT INTO member_checkout(ref,member,created) VALUES(?,?,?)',ref,member.id,now).run();
  const url=new URL(offer.checkout);
  url.searchParams.set('client_reference_id',ref);
  return {url:String(url)};
}
export async function applyEvent(db,event){
  if(!event.livemode)return;
  const d=event.data?.object, type=event.type;
  if(!d)return;
  if(type==='checkout.session.completed'||type==='checkout.session.async_payment_succeeded'){
    if(d.mode!=='subscription'||d.payment_link!==offer.link||typeof d.subscription!=='string'||!d.client_reference_id)return;
    await query(db,`INSERT INTO member_subscriptions(id,member) SELECT ?,member FROM member_checkout WHERE ref=?
      ON CONFLICT(id) DO UPDATE SET member=excluded.member WHERE member_subscriptions.member IS NULL OR member_subscriptions.member=excluded.member`,d.subscription,d.client_reference_id).run();
    return;
  }
  if(type==='invoice.paid'){
    const subscription=d.parent?.subscription_details?.subscription||d.subscription;
    if(!subscription||d.status!=='paid')return;
    const lines=(d.lines?.data||[]).filter(l=>(l.pricing?.price_details?.price||l.price?.id)===offer.price && Number(l.amount)>0);
    const until=Math.max(0,...lines.map(l=>Number(l.period?.end)||0));
    if(until)await query(db,'INSERT INTO member_subscriptions(id,paid_until) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET paid_until=MAX(paid_until,excluded.paid_until)',subscription,until).run();
  }else if(['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','customer.subscription.paused','customer.subscription.resumed'].includes(type)){
    if(d.metadata?.offre!=='compagnon-de-route'||!d.items?.data?.some(i=>i.price?.id===offer.price))return;
    const status=type==='customer.subscription.deleted'?'canceled':d.status;
    await query(db,`INSERT INTO member_subscriptions(id,status,changed,ending) VALUES(?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET status=excluded.status,changed=excluded.changed,ending=excluded.ending
      WHERE member_subscriptions.status!='canceled' AND excluded.changed>=member_subscriptions.changed`,d.id,status,event.created,d.cancel_at_period_end?1:0).run();
  }
}
export async function stripeWebhook(request,env){
  const raw=await request.text();
  if(raw.length>524288)return new Response(null,{status:413});
  const event=await verifiedEvent(raw,request.headers.get('stripe-signature'),env.STRIPE_WEBHOOK_SECRET);
  await applyEvent(env.DB,event);
  return Response.json({received:true});
}
