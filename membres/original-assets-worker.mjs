// Cloudflare Worker: private GLB chunks from R2. Deployed to maison-rencontres-original-assets.
// Bind STUDIO to treize-chemins-atelier-prive (R2); ADMIN to ahmed-marie-double (service).
const SITE='https://tectonique-des-ames.com';
const AUTH='https://ahmed-marie-double.meguiniahmed16.workers.dev/web-admin/auth/session';
const response=(status,message)=>Response.json({error:message},{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
export default {async fetch(request,env){
 const url=new URL(request.url),route=url.pathname.match(/^\/assets\/(white|dojo)\/(\d{3})$/);
 if(!route||request.method!=='GET')return response(404,'Not found');
 const type=route[1],i=Number(route[2]),count=type==='white'?18:13;
 if(i>=count)return response(404,'Part not found');
 const cookie=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>/^__Host-am_site_admin=/.test(s));
 if(!cookie)return response(401,'Author login required');
 let verified;
 try{
  const auth=await env.ADMIN.fetch(new Request(AUTH,{headers:{cookie,origin:SITE},redirect:'manual'}));
  verified=auth.ok&&(await auth.json()).ok===true;
 }catch{return response(503,'Author verification unavailable')}
 if(!verified)return response(401,'Author login required');
 const key='maison-v1/'+(type==='white'?'white-room.glb':'dojo-original.glb')+'.part'+route[2];
 const object=await env.STUDIO.get(key);
 if(!object)return response(404,'Original asset part missing');
 return new Response(object.body,{headers:{'content-type':'application/octet-stream','content-length':String(object.size),'cache-control':'private, no-store','x-content-type-options':'nosniff','vary':'Cookie'}});
}};