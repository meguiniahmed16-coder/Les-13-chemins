import {checkPassword, createSession, validSession, cookie, requestToken} from './web-auth.js';
const ORIGINS = new Set(['https://tectonique-des-ames.netlify.app','https://tectonic-d-am.com','https://www.tectonic-d-am.com','https://tectonique-des-ames.com','https://www.tectonique-des-ames.com']);
const ACTIONS = new Set(['start','history','erase','chat','admin/bank','admin/review','admin/decision','admin/answer','admin/blog','admin/invite','admin/comment','admin/visits']);
const headers = {'cache-control':'private, no-store','cdn-cache-control':'no-store','netlify-cdn-cache-control':'no-store','x-content-type-options':'nosniff','vary':'Cookie'};
const reply = (data, status=200, extra={}) => Response.json(data,{status,headers:{...headers,...extra}});
async function readBody(request, max) {
  const reader=request.body?.getReader();if(!reader)return '';
  const chunks=[];let length=0;
  for(;;){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>max){await reader.cancel();throw new RangeError('body_limit');}chunks.push(value);}
  const result=new Uint8Array(length);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length;}
  return new TextDecoder().decode(result);
}
export function createAdminHandler(core) {
  return {async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(!url.pathname.startsWith('/web-admin/'))return core.fetch(request,env,ctx);
    try {
      const path=url.pathname.slice('/web-admin/'.length);
      if(!['GET','POST'].includes(request.method))return reply({error:'Méthode non autorisée.'},405);
      const origin=request.headers.get('origin');
      if((origin && !ORIGINS.has(origin)) || (request.method==='POST'&&!ORIGINS.has(origin)))return reply({error:'Origine invalide.'},403);
      if(!env.WEB_ADMIN_PASSWORD_HASH || !env.WEB_ADMIN_SESSION_SECRET || !env.ADMIN_TOKEN)return reply({error:'La connexion administrateur n’est pas configurée.'},503);
      if(path==='auth/login'&&request.method==='POST'){
        const raw=await readBody(request,1500);let body;try{body=JSON.parse(raw);}catch{return reply({error:'Demande invalide.'},400);}
        if(!body || typeof body.username!=='string' || typeof body.password!=='string' || body.password.length>200)return reply({error:'Identifiant ou mot de passe incorrect.'},401);
        // Account-wide limit cannot be bypassed by spoofing a forwarded IP header.
        const now=new Date();const slot=Math.floor(now.getTime()/900000);
        const limit=await env.DB.prepare('INSERT INTO daily_access(key,count) VALUES(?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<30 RETURNING count').bind(now.toISOString().slice(0,10)+':web-login:'+slot).first();
        if(!limit)return reply({error:'Trop de tentatives. Réessaie dans quinze minutes.'},429);
        const ok=await checkPassword(body.password,env.WEB_ADMIN_PASSWORD_HASH);
        if(body.username!=='admin'||!ok)return reply({error:'Identifiant ou mot de passe incorrect.'},401);
        return reply({ok:true},200,{'set-cookie':cookie(await createSession(env.WEB_ADMIN_SESSION_SECRET))});
      }
      if(path==='auth/logout'&&request.method==='POST')return new Response(null,{status:303,headers:{...headers,'set-cookie':cookie('',true),location:'/admin-blog.html'}});
      if(!await validSession(requestToken(request),env.WEB_ADMIN_SESSION_SECRET))return reply({error:'Connecte-toi pour ouvrir ton espace administrateur.'},401);
      if(path==='auth/session'&&request.method==='GET')return reply({ok:true,username:'admin'});
      const action=path.startsWith('double/')?path.slice(7):'';
      if(!ACTIONS.has(action))return reply({error:'Route inconnue.'},404);
      const target=new URL('/'+action+url.search,url.origin);
      const body=request.method==='POST'?await readBody(request,30000):undefined;
      const forwarded=new Request(target,{method:request.method,headers:{'content-type':'application/json',authorization:'Bearer '+env.ADMIN_TOKEN,'cf-connecting-ip':request.headers.get('cf-connecting-ip')||'unknown'},body});
      const response=await core.fetch(forwarded,env,ctx);
      return new Response(response.body,{status:response.status,headers:{...headers,'content-type':'application/json; charset=utf-8'}});
    }catch(error){
      if(error instanceof RangeError)return reply({error:'Demande trop longue.'},413);
      console.error(JSON.stringify({event:'web_admin_error',path:url.pathname,name:error?.name||'Error'}));
      return reply({error:'Le service est momentanément indisponible. Réessaie.'},503);
    }
  }};
}
