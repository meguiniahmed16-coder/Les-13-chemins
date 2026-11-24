// API privée dédiée au tableau de bord unifié. Accès par la session auteur existante.
const SITE='https://tectonique-des-ames.com';
const headers={'cache-control':'private, no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','access-control-allow-origin':SITE,'vary':'Cookie, Origin'};
const json=(data,status=200)=>Response.json(data,{status,headers});
function invalid(status,message){throw Object.assign(new Error(message),{status})}
function validEmail(value){const v=String(value||'').trim().toLowerCase();if(v.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))invalid(400,'Adresse e-mail invalide.');return v}
async function body(r){const raw=await r.text();if(raw.length>3500)invalid(413,'Message trop long.');try{return JSON.parse(raw)}catch{invalid(400,'Formulaire invalide.')}}
async function authorized(request,env){
 const cookie=(request.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(x=>x.startsWith('__Host-am_site_admin='));
 if(!cookie)return false;
 const reply=await env.ADMIN.fetch(new Request('https://ahmed-marie-double.meguiniahmed16.workers.dev/web-admin/auth/session',{
  headers:{cookie,origin:SITE},redirect:'manual'
 }));
 if(!reply.ok)return false;return (await reply.json()).ok===true;
}
function invitationText(name){
 const hello=name?'Bonjour '+name+',':'Bonjour,';
 return `${hello}

Je t’invite à rejoindre « La Tectonique des âmes » et son espace « Compagnon de route ».

Voici comment créer ton compte :
1. Ouvre https://tectonique-des-ames.com/membre.html
2. Choisis « S’inscrire ».
3. Renseigne ton adresse e-mail, choisis ton mot de passe et ton pseudonyme.
4. Complète ton profil et personnalise ton personnage.
5. Découvre la Maison des rencontres et les Treize Chemins.

Bienvenue dans cette aventure. Ce monde se construit aussi avec celles et ceux qui le découvrent.

Ahmed Marie
https://tectonique-des-ames.com/`;
}
async function sendInvite(env,row){
 // A dedicated transactional mail provider must be configured, never claim success without acceptance.
 if(!env.INVITE_EMAIL_API_KEY||!env.INVITE_EMAIL_FROM)invalid(503,'Envoi automatique indisponible : aucun fournisseur de courrier configuré. Utilise « Préparer l’e-mail ».');
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:'Bearer '+env.INVITE_EMAIL_API_KEY,'content-type':'application/json'},body:JSON.stringify({
  from:env.INVITE_EMAIL_FROM,to:[row.email],subject:'Bienvenue dans La Tectonique des âmes — invitation',text:invitationText(row.name),headers:{'X-Entity-Ref-ID':row.id}
 }),signal:AbortSignal.timeout(12000)});
 const data=await response.json().catch(()=>({}));
 if(!response.ok||!data.id)invalid(502,'Le fournisseur de courriels n’a pas confirmé l’envoi.');
 return data.id;
}
export default {
 async fetch(request,env){
  try{
   const url=new URL(request.url),pathname=url.pathname.replace(/^\/api\/admin-unified\//,'');
   if(url.origin!==SITE&&!url.hostname.endsWith('.workers.dev'))invalid(403,'Origine non autorisée.');
   if(request.method!=='GET'&&request.method!=='POST')invalid(405,'Méthode non autorisée.');
   if(request.method==='POST'&&request.headers.get('origin')!==SITE)invalid(403,'Origine invalide.');
   if(!await authorized(request,env))invalid(401,'Reconnecte-toi à ton administration.');
   const db=env.DB;
   if(pathname==='people'&&request.method==='GET'){
    const [members,invites]=await Promise.all([
     db.prepare("SELECT id,email,pseudo,name,provider,created FROM members WHERE provider!='author' ORDER BY created DESC LIMIT 300").all(),
     db.prepare('SELECT id,email,name,state,created,sent_at,last_error FROM member_invites ORDER BY created DESC LIMIT 300').all()
    ]);
    const registered=new Set(members.results.map(m=>m.email.toLowerCase()));
    return json({members:members.results.map(x=>({...x,created:new Date(x.created*1000).toISOString()})),invitations:invites.results.map(i=>({...i,registered:registered.has(i.email)})),mailConfigured:Boolean(env.INVITE_EMAIL_API_KEY&&env.INVITE_EMAIL_FROM)});
   }
   if(pathname==='invitations'&&request.method==='POST'){
    const data=await body(request),email=validEmail(data.email),name=String(data.name||'').trim().slice(0,100);
    if(!name)invalid(400,'Indique un prénom ou un nom.');
    const match=await db.prepare("SELECT id FROM members WHERE lower(email)=? AND provider!='author' LIMIT 1").bind(email).first();
    if(match)invalid(409,'Ce membre possède déjà un compte.');
    const id=crypto.randomUUID(),created=new Date().toISOString();
    await db.prepare("INSERT INTO member_invites(id,email,name,state,created,sent_at,last_error) VALUES(?,?,?,'draft',?,NULL,NULL) ON CONFLICT(email) DO UPDATE SET name=excluded.name").bind(id,email,name,created).run();
    const row=await db.prepare('SELECT id,email,name,state,created,sent_at FROM member_invites WHERE email=?').bind(email).first();
    return json({invitation:row,subject:'Bienvenue dans La Tectonique des âmes — invitation',text:invitationText(name)},201);
   }
   if(pathname==='mark-sent'&&request.method==='POST'){
    const input=await body(request),email=validEmail(input.email);
    const row=await db.prepare('SELECT id FROM member_invites WHERE email=?').bind(email).first();
    if(!row)invalid(404,'Invitation introuvable.');
    await db.prepare("UPDATE member_invites SET state='sent-manually',sent_at=coalesce(sent_at,?) WHERE id=?").bind(new Date().toISOString(),row.id).run();
    return json({recorded:true,method:'manual'});
   }
   if(pathname==='send'&&request.method==='POST'){
    const input=await body(request),email=validEmail(input.email);
    const row=await db.prepare('SELECT id,email,name,state,sent_at FROM member_invites WHERE email=?').bind(email).first();if(!row)invalid(404,'Invitation introuvable.');
    if(row.sent_at)invalid(409,'Invitation déjà envoyée. Aucune relance automatique pour éviter un doublon.');
    const id=await sendInvite(env,row);
    await db.prepare("UPDATE member_invites SET state='sent',sent_at=?,last_error=NULL WHERE id=?").bind(new Date().toISOString(),row.id).run();
    return json({sent:true,mailId:id});
   }
   if(pathname==='message'&&request.method==='GET'){
    return json({subject:'Bienvenue dans La Tectonique des âmes — invitation',text:invitationText(url.searchParams.get('name')||'')});
   }
   invalid(404,'Rubrique introuvable.');
  }catch(e){return json({error:e.status?e.message:'L’administration des membres est momentanément indisponible.'},e.status||503)}
 }
};