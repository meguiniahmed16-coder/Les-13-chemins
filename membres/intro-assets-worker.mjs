// Private original 3D assets, streamed from existing R2 storage to authenticated author only.
// No public static asset and no separate login.
const origin='https://tectonique-des-ames.com';
const names={white:{stem:'maison-v1/white-room.glb',count:18},dojo:{stem:'maison-v1/dojo-original.glb',count:13},ahmed:{stem:'maison-v2/ahmed-atelier-blanc.glb',count:7},ahmedv3:{stem:'maison-v3/ahmed-atelier-blanc-bras.glb',count:11},ahmedfast:{stem:'maison-v3/ahmed-atelier-blanc-bras.glb',count:4,group:3,sourceCount:11,total:10671740}};
const atelierSizes={ahmed:33045109,marianne:35943147};
const atelierState='atelier-cinematique-v1/recette.json';
const chunkSize=4194304,pieceSize=2097150;
function atelierPart(model,part,piece){
 const size=atelierSizes[model];if(!size||part<0||piece<0||piece>2)return null;
 const count=Math.min(chunkSize,size-part*chunkSize),bytes=Math.min(pieceSize,count-piece*pieceSize);
 if(bytes<=0)return null;
 return {key:'maison-v22/'+model+'-v22-'+String(part).padStart(3,'0')+'-'+piece+'.bin',bytes};
}
async function serveAtelier(request,env,match){
 if(match[1]==='state'){
  if(request.method==='GET'){const o=await env.STUDIO.get(atelierState);return o?new Response(o.body,{headers:{...noStore,'content-type':'application/json'}}):Response.json({version:1,actors:{},notes:''},{headers:noStore});}
  if(request.method!=='PUT'||request.headers.get('origin')!==origin||!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))return new Response(null,{status:403,headers:noStore});
  const n=Number(request.headers.get('content-length')||0);if(n>65536)return new Response(null,{status:413,headers:noStore});
  const body=await request.text();if(new TextEncoder().encode(body).length>65536)return new Response(null,{status:413,headers:noStore});
  let data;try{data=JSON.parse(body);}catch{return new Response(null,{status:400,headers:noStore});}
  if(!data||data.version!==1||typeof data.actors!=='object'||typeof data.notes!=='string')return new Response(null,{status:400,headers:noStore});
  await env.STUDIO.put(atelierState,JSON.stringify(data),{httpMetadata:{contentType:'application/json'}});
  return Response.json({ok:true},{headers:noStore});
 }
 if(request.method!=='GET')return new Response(null,{status:405,headers:noStore});
 if(match[1].startsWith('kimono-source/')){
  const model=match[8],sizes={marianne:213710,ahmed:217452};if(!sizes[model])return new Response(null,{status:404,headers:noStore});
  const o=await env.STUDIO.get('kimono-source/'+model+'.bin.gz');if(!o||o.size!==sizes[model])return new Response(null,{status:503,headers:noStore});return new Response(o.body,{headers:{...noStore,'content-type':'application/octet-stream','content-length':String(o.size)}});
 }
 if(match[1].startsWith('refonte-v6/')){
  const model=match[7],sizes={marianne:494447,ahmed:545710};if(!sizes[model])return new Response(null,{status:404,headers:noStore});
  const o=await env.STUDIO.get('atelier-v6-prive/'+model+'.bin.gz');if(!o||o.size!==sizes[model])return new Response(null,{status:503,headers:noStore});return new Response(o.body,{headers:{...noStore,'content-type':'application/octet-stream','content-length':String(o.size)}});
 }
 if(match[1].startsWith('refonte-v5/')){
  const model=match[6];const sizes={marianne:425514,ahmed:474019};if(!sizes[model])return new Response(null,{status:404,headers:noStore});
  const o=await env.STUDIO.get('atelier-v5-prive/'+model+'.bin.gz');if(!o||o.size!==sizes[model])return new Response(null,{status:503,headers:noStore});return new Response(o.body,{headers:{...noStore,'content-type':'application/octet-stream','content-length':String(o.size)}});
 }
 if(match[1].startsWith('refonte/')){
  const model=match[5];const sizes={marianne:289589,ahmed:291562};if(!sizes[model])return new Response(null,{status:404,headers:noStore});
  const o=await env.STUDIO.get('atelier-v4-prive/'+model+'-cou-court.bin.gz');if(!o||o.size!==sizes[model])return new Response(null,{status:503,headers:noStore});return new Response(o.body,{headers:{...noStore,'content-type':'application/octet-stream','content-length':String(o.size)}});
 }
 if(match[1]==='manifest'){
  const specs=[];for(const model of Object.keys(atelierSizes))for(let p=0;p<Math.ceil(atelierSizes[model]/chunkSize);p++)for(let j=0;j<3;j++){const x=atelierPart(model,p,j);if(x)specs.push(x);}
  const ready=await Promise.all(specs.map(async x=>{const o=await env.STUDIO.head(x.key);return !!o&&o.size===x.bytes;}));
  return Response.json({ready:ready.every(Boolean),present:ready.filter(Boolean).length,total:ready.length},{headers:noStore});
 }
 const part=atelierPart(match[2],Number(match[3]),Number(match[4]));if(!part)return new Response(null,{status:404,headers:noStore});
 const o=await env.STUDIO.get(part.key);if(!o||o.size!==part.bytes)return new Response(null,{status:503,headers:noStore});
 return new Response(o.body,{headers:{...noStore,'content-type':'application/octet-stream','content-length':String(o.size)}});
}
const noStore={'cache-control':'private, no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
export default {async fetch(request,env){
 const u=new URL(request.url);
 const lab=/^\/api\/intro-private\/atelier-v22\/(state|manifest|model\/(ahmed|marianne)\/(\d{3})\/([012])|refonte\/(ahmed|marianne)|refonte-v5\/(ahmed|marianne)|refonte-v6\/(ahmed|marianne)|kimono-source\/(ahmed|marianne))$/.exec(u.pathname);
 if(request.method!=='GET'&&!(lab?.[1]==='state'&&request.method==='PUT'))return new Response(null,{status:405});
 const match=u.pathname.match(/^\/api\/intro-private\/(white|dojo|ahmed|ahmedv3|ahmedfast)\/(\d{3})$/);
 if(!match&&!lab)return new Response(null,{status:404});
 const conf=match?names[match[1]]:null,part=match?Number(match[2]):0;
 if(conf&&part>=conf.count)return new Response(null,{status:404});
 const cookie=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>/^__Host-am_site_admin=/.test(x));
 if(!cookie)return Response.json({error:'Réservé à l’administration.'},{status:401,headers:noStore});
 try{
  const check=await env.ADMIN.fetch(new Request('https://ahmed-marie-double.meguiniahmed16.workers.dev/web-admin/auth/session',{headers:{cookie,origin},redirect:'manual'}));
  if(!check.ok||(await check.json()).ok!==true)return Response.json({error:'Session auteur requise.'},{status:401,headers:noStore});
  if(lab)return await serveAtelier(request,env,lab);
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
