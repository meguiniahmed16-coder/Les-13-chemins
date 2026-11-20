import {normaliseStudio,exactStudio} from './studio-look.js';
import {avatarCatalog,normaliseAvatar,randomAvatar} from './avatar-catalog.js';
import {mergeJourney} from './journey.js';
import {membership,checkout,stripeWebhook} from './billing.mjs';
import {current,newSession,sessionName,cookie,cookieValue,digest,secret,profile,ageBand,now,rate,fail} from './identity.mjs';
import {site,social} from './oauth.mjs';
import {availability,saveProvider} from './provider-settings.mjs';
import {authorSession,authorProfile} from './author-session.mjs';
import ownerModule from './avatar-owner.js?text';
const h={'cache-control':'private, no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','vary':'Cookie'};
const json=(data,status=200,extra={})=>Response.json(data,{status,headers:{...h,...extra}});
async function read(r){const data=await r.text();if(data.length>16000)fail(413,'Demande trop longue.');try{return JSON.parse(data)||{};}catch{fail(400,'Demande invalide.');}}
const sql=(db,statement,...params)=>db.prepare(statement).bind(...params);
const emailOf=x=>{const email=String(x||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)fail(400,'Vérifie ton adresse e-mail.');return email;};
async function view(db,m,author){
  const billing=await membership(db,m.id,now());
  const rows=await sql(db,'SELECT kind,item FROM member_activity WHERE member=?',m.id).all();
  const journey={games:[],videos:[],scenes:[]};for(const row of rows.results)journey[row.kind]?.push(row.item);
  const saved=JSON.parse(m.avatar),plus=Boolean(author)||billing.companion;
  return {studio:normaliseStudio(saved.studio,plus,normaliseAvatar(saved,plus)),id:m.id,pseudo:m.pseudo,birth:m.birth,name:m.name,email:m.email,age:ageBand(m.birth),avatar:normaliseAvatar(saved,plus),...billing,author,journey};
}
async function owner(r,env,path){
  if(!await authorSession(r,env))fail(401,'Connecte-toi à l’administration.');
  if(r.method==='GET'&&(path==='admin/reference'||/^admin\/reference\/\d{3}$/.test(path))){
    if(!env.STUDIO)fail(503,'Le modèle privé est momentanément indisponible.');
    const key=path==='admin/reference'?'manifest.json':path.split('/').pop();
    const object=await env.STUDIO.get('summer-man/'+key);
    if(!object)fail(404,'Le modèle privé est momentanément indisponible.');
    return new Response(object.body,{headers:{...h,'content-type':key==='manifest.json'?'application/json':'application/octet-stream'}});
  }
  if(path==='admin/module'&&r.method==='GET')return new Response(ownerModule,{headers:{...h,'content-type':'text/javascript; charset=utf-8'}});
  if(path==='admin/providers'&&r.method==='POST'){
    await saveProvider(env,await read(r));
    return json({providers:await availability(env)});
  }
  if(path==='admin/label'&&r.method==='POST'){
    const {label}=await read(r);
    if(typeof label!=='string'||!label.trim()||label.length>56)fail(400,'Vérifie le nom de la rubrique.');
    await sql(env.DB,"INSERT INTO member_admin_settings(key,value) VALUES('label',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",label.trim()).run();
    return json({ok:true});
  }
  if(path==='admin/settings'&&r.method==='GET'){
    const name=await sql(env.DB,"SELECT value FROM member_admin_settings WHERE key='label'").first();
    return json({label:name?.value||'Atelier des formes',reference:'https://chatgpt.com/library?file_id=libfile_fde3_f-ba70ec4eb9848191b01d4ee40aa1b38f_bad53cac8e308191b6f6ffd56b5e2386&account_id=personal'});
  }
  fail(404,'Page introuvable.');
}
export default {
 async fetch(request,env){
  try{
    const url=new URL(request.url),path=url.pathname.replace(/^\/api\/membres\//,'');
    if(path==='stripe'&&request.method==='POST')return await stripeWebhook(request,env);
    if(request.method!=='GET'&&request.method!=='POST')fail(405,'Méthode indisponible.');
    if(request.method==='POST'&&request.headers.get('origin')!==site)fail(403,'Origine invalide.');
    const db=env.DB;
    if(path.startsWith('admin/'))return await owner(request,env,path);
    const oauth=path.match(/^oauth\/(google|facebook)(\/callback)?$/);
    if(oauth&&request.method==='GET')return await social(request,env,oauth[1],Boolean(oauth[2]));
    if(path==='options'&&request.method==='GET')return json({providers:await availability(env)});
    if((path==='signup'||path==='login')&&request.method==='POST'){
      const b=await read(request),email=emailOf(b.email),password=b.password;
      if(typeof password!=='string'||!password||password.length>200)fail(400,'Vérifie le mot de passe.');
      await rate(db,path+':address:'+email,path==='signup'?6:15);
      await rate(db,path+':ip:'+request.headers.get('cf-connecting-ip'),path==='signup'?80:250);
      let id;
      if(path==='signup'){
        const p=profile(b);if(password.length<10)fail(400,'Choisis un mot de passe de dix caractères ou plus.');
        id=crypto.randomUUID();
        const result=await sql(db,"INSERT INTO members(id,provider,subject,email,secret,pseudo,birth,name,avatar,created) VALUES(?,'email',?,?,?,?,?,?,?,?) ON CONFLICT(provider,subject) DO NOTHING",id,email,email,await secret(password),p.pseudo,p.birth,p.name,JSON.stringify(randomAvatar()),now()).run();
        if(!result.meta.changes)fail(409,'Cette adresse possède déjà un compte. Essaie de te connecter.');
      }else{
        const m=await sql(db,"SELECT id,secret FROM members WHERE provider='email' AND subject=?",email).first();
        const ok=await secret(password,m?.secret||'0'.repeat(64)+'.'+'0'.repeat(64));
        if(!m||!ok)fail(401,'Adresse e-mail ou mot de passe incorrect.');
        id=m.id;
      }
      return json({ok:true},200,{'set-cookie':await newSession(db,id)});
    }
    const author=await authorSession(request,env);
    if(url.searchParams.has('auteur')&&!author)fail(401,'Ta session auteur a expiré.');
    const m=author?await authorProfile(db):await current(db,request);if(!m)fail(401,'Connecte-toi pour ouvrir ton espace.');
    if(path==='me'&&request.method==='GET')return json(await view(db,m,author));
    if(path==='logout'&&request.method==='POST'){
      if(author)fail(409,'Utilise la déconnexion de ton administration.');
      await sql(db,'DELETE FROM member_sessions WHERE token=?',await digest(cookieValue(request,sessionName))).run();
      return json({ok:true},200,{'set-cookie':cookie(sessionName,'',0)});
    }
    if(path==='profile'&&request.method==='POST'){
      const p=profile(await read(request),Boolean(author));await sql(db,'UPDATE members SET pseudo=?,birth=?,name=? WHERE id=?',p.pseudo,p.birth,p.name,m.id).run();
      return json({ok:true});
    }
    if(!author&&(!m.birth||!m.pseudo))fail(409,'Complète ton profil.');
    if(path==='avatar'&&request.method==='POST'){
      const data=await read(request),input=data.avatar,plan=await membership(db,m.id,now()),plus=Boolean(author)||plan.companion,avatar=normaliseAvatar(input,plus);
      if(!input||typeof input!=='object'||Object.keys(input).length!==avatarCatalog.length||Object.keys(avatar).some(k=>avatar[k]!==input[k]))fail(403,'Cette apparence n’est pas disponible avec ton abonnement.');
      const studio=normaliseStudio(data.studio,plus,avatar);
      if(data.studio!==undefined&&!exactStudio(data.studio,studio))fail(403,'Cette personnalisation est indisponible.');
      await sql(db,'UPDATE members SET avatar=? WHERE id=?',JSON.stringify({...avatar,studio}),m.id).run();
      return json({avatar,studio});
    }
    if(path==='journey'&&request.method==='POST'){
      const b=await read(request);if(b.memberId!==m.id)fail(403,'Le compte a changé.');
      const items=mergeJourney({},b),statements=Object.entries(items).flatMap(([kind,list])=>list.map(item=>sql(db,'INSERT OR IGNORE INTO member_activity(member,kind,item) VALUES(?,?,?)',m.id,kind,item)));
      if(statements.length)await db.batch(statements);
      return json({ok:true});
    }
    if(path==='checkout'&&request.method==='POST'){
      if(author)fail(409,'Toutes les options sont déjà disponibles dans ton espace auteur.');
      if(!env.STRIPE_WEBHOOK_SECRET)fail(503,'Les abonnements ouvriront prochainement.');
      await rate(db,'checkout:'+m.id,12);
      return json(await checkout(db,m,now()));
    }
    fail(404,'Page introuvable.');
  }catch(e){return json({error:e.status?e.message:'Le service est momentanément indisponible.'},e.status||503);}
 },
 async scheduled(_,env){
  const t=now();
  for(const table of ['member_sessions','member_oauth','member_limits'])await sql(env.DB,'DELETE FROM '+table+' WHERE expires<?',t).run();
  await sql(env.DB,'DELETE FROM member_checkout WHERE created<?',t-90*86400).run();
 }
};
