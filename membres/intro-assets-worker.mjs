// Private original 3D assets, streamed from existing R2 storage to authenticated author only.
// No public static asset and no separate login.
const origin='https://tectonique-des-ames.com';
const names={white:{stem:'maison-v1/white-room.glb',count:18},dojo:{stem:'maison-v1/dojo-original.glb',count:13},ahmed:{stem:'maison-v2/ahmed-atelier-blanc.glb',count:7},ahmedv3:{stem:'maison-v3/ahmed-atelier-blanc-bras.glb',count:11}};
const noStore={'cache-control':'private, no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
export default {async fetch(request,env){
 const u=new URL(request.url);
 if(request.method!=='GET')return new Response(null,{status:405});
 const match=u.pathname.match(/^\/api\/intro-private\/(white|dojo|ahmed|ahmedv3)\/(\d{3})$/);
 if(!match)return new Response(null,{status:404});
 const conf=names[match[1]],part=Number(match[2]);
 if(part>=conf.count)return new Response(null,{status:404});
 const cookie=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>/^__Host-am_site_admin=/.test(x));
 if(!cookie)return Response.json({error:'Réservé à l’administration.'},{status:401,headers:noStore});
 try{
  const check=await env.ADMIN.fetch(new Request('https://ahmed-marie-double.meguiniahmed16.workers.dev/web-admin/auth/session',{headers:{cookie,origin},redirect:'manual'}));
  if(!check.ok||(await check.json()).ok!==true)return Response.json({error:'Session auteur requise.'},{status:401,headers:noStore});
  const obj=await env.STUDIO.get(conf.stem+'.part'+match[2]);
  if(!obj)return Response.json({error:'Fragment manquant.'},{status:404,headers:noStore});
  return new Response(obj.body,{headers:{...noStore,'content-type':'application/octet-stream','content-length':String(obj.size)}});
 }catch{return Response.json({error:'Décor privé inaccessible.'},{status:503,headers:noStore})}
}};
