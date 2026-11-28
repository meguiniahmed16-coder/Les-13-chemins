// Private original 3D assets, streamed from existing R2 storage to authenticated author only.
// No public static asset and no separate login.
const origin='https://tectonique-des-ames.com';
const names={white:{stem:'maison-v1/white-room.glb',count:18},dojo:{stem:'maison-v1/dojo-original.glb',count:13},ahmed:{stem:'maison-v2/ahmed-atelier-blanc.glb',count:7},ahmedv3:{stem:'maison-v3/ahmed-atelier-blanc-bras.glb',count:11},ahmedfast:{stem:'maison-v3/ahmed-atelier-blanc-bras.glb',count:4,group:3,sourceCount:11,total:10671740}};
const v22Sizes={ahmed:33045109,marianne:35943147};
const v22Chunk=4194304,v22Piece=2097150;
function v22Part(model,part,piece){
 const total=v22Sizes[model];if(!total||!Number.isInteger(part)||part<0||!Number.isInteger(piece)||piece<0)return null;
 const group=Math.min(v22Chunk,total-part*v22Chunk);
 const bytes=Math.min(v22Piece,group-piece*v22Piece);
 if(bytes<=0)return null;
 return {key:'maison-v22/'+model+'-v22-'+String(part).padStart(3,'0')+'-'+piece+'.bin',bytes};
}
async function v22Reply(env,match,headers){
 if(match[1]==='manifest'){
  const expected=[];
  for(const model of Object.keys(v22Sizes))for(let part=0;part<Math.ceil(v22Sizes[model]/v22Chunk);part++)for(let piece=0;piece<3;piece++){const x=v22Part(model,part,piece);if(x)expected.push(x);}
  const status=await Promise.all(expected.map(async x=>{const o=await env.STUDIO.head(x.key);return !!o&&o.size===x.bytes;}));
  return Response.json({release:'V22',ready:status.every(Boolean),present:status.filter(Boolean).length,total:status.length},{headers});
 }
 const x=v22Part(match[2],Number(match[3]),Number(match[4]));
 if(!x)return new Response(null,{status:404,headers});
 const object=await env.STUDIO.get(x.key);
 if(!object||object.size!==x.bytes)return new Response(null,{status:404,headers});
 return new Response(object.body,{headers:{...headers,'content-type':'application/octet-stream','content-length':String(object.size)}});
}
const noStore={'cache-control':'private, no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
export default {async fetch(request,env){
 const u=new URL(request.url);
 if(request.method!=='GET')return new Response(null,{status:405});
 const match=u.pathname.match(/^\/api\/intro-private\/(white|dojo|ahmed|ahmedv3|ahmedfast)\/(\d{3})$/);
 const v22=/^\/api\/intro-private\/v22\/(manifest|(ahmed|marianne)\/(\d{3})\/([012]))$/.exec(u.pathname);
 if(!match&&!v22)return new Response(null,{status:404});
 const conf=match?names[match[1]]:null,part=match?Number(match[2]):0;
 if(conf&&part>=conf.count)return new Response(null,{status:404});
 const cookie=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>/^__Host-am_site_admin=/.test(x));
 if(!cookie)return Response.json({error:'Réservé à l’administration.'},{status:401,headers:noStore});
 try{
  const check=await env.ADMIN.fetch(new Request('https://ahmed-marie-double.meguiniahmed16.workers.dev/web-admin/auth/session',{headers:{cookie,origin},redirect:'manual'}));
  if(!check.ok||(await check.json()).ok!==true)return Response.json({error:'Session auteur requise.'},{status:401,headers:noStore});
  if(v22)return await v22Reply(env,v22,noStore);
  if(conf.group){
   const indices=Array.from({length:Math.min(conf.group,conf.sourceCount-part*conf.group)},(_,i)=>part*conf.group+i);
   const chunks=await Promise.all(indices.map(i=>env.STUDIO.get(conf.stem+'.part'+String(i).padStart(3,'0'))));
   if(chunks.some(x=>!x))return Response.json({error:'Fragment du modèle manquant.'},{status:404,headers:noStore});
   const size=chunks.reduce((n,c)=>n+c.size,0),expected=Math.min(conf.group*1048576,conf.total-part*conf.group*1048576);
   if(size!==expected)return Response.json({error:'Fragment du modèle incomplet.'},{status:502,headers:noStore});
   const body=new Uint8Array(size);let cursor=0;
   for(const c of chunks){const buf=new Uint8Array(await c.arrayBuffer());body.set(buf,cursor);cursor+=buf.length;}
   return new Response(body,{headers:{...noStore,'content-type':'application/octet-stream','content-length':String(size)}});
  }
  const obj=await env.STUDIO.get(conf.stem+'.part'+match[2]);
  if(!obj)return Response.json({error:'Fragment manquant.'},{status:404,headers:noStore});
  return new Response(obj.body,{headers:{...noStore,'content-type':'application/octet-stream','content-length':String(obj.size)}});
 }catch{return Response.json({error:'Décor privé inaccessible.'},{status:503,headers:noStore})}
}};
