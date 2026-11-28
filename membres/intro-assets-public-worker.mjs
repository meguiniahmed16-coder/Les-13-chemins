// Public cinema: separate dressed V22 copies, never private source keys.
const origin='https://tectonique-des-ames.com',netlifyOrigin='https://tectonique-des-ames.netlify.app';
const stem='maison-v3/ahmed-atelier-blanc-bras.glb.part',total=10671740,unit=1048576;
const publicSizes={ahmed:31638281,marianne:33460524},chunk=4194304,pieceSize=2097150;
function partInfo(model,part,piece){
 const bytes=publicSizes[model];if(!bytes||part<0||piece<0||piece>2)return null;
 const group=Math.min(chunk,bytes-part*chunk),size=Math.min(pieceSize,group-piece*pieceSize);
 if(size<=0)return null;
 return {key:'maison-v22-public/'+model+'-v22-'+String(part).padStart(3,'0')+'-'+piece+'.bin',size};
}
function headers(request){return {'cache-control':'public, max-age=86400, immutable','x-content-type-options':'nosniff','access-control-allow-origin':request.headers.get('Origin')===netlifyOrigin?netlifyOrigin:origin,'cross-origin-resource-policy':'cross-origin','vary':'Origin'};}
async function v22(request,env,match,h){
 if(match[1]==='manifest'){
  const expected=[];for(const model of Object.keys(publicSizes))for(let p=0;p<Math.ceil(publicSizes[model]/chunk);p++)for(let i=0;i<3;i++){const x=partInfo(model,p,i);if(x)expected.push(x);}
  const ready=await Promise.all(expected.map(async x=>{const o=await env.CINEMA.head(x.key);return !!o&&o.size===x.size;}));
  return Response.json({release:'V22',ready:ready.every(Boolean),present:ready.filter(Boolean).length,total:ready.length},{headers:{...h,'cache-control':'no-store'}});
 }
 const x=partInfo(match[2],Number(match[3]),Number(match[4]));if(!x)return new Response(null,{status:404,headers:h});
 const obj=await env.CINEMA.get(x.key);if(!obj||obj.size!==x.size)return new Response(null,{status:503,headers:h});
 return new Response(request.method==='HEAD'?null:obj.body,{headers:{...h,'content-type':'application/octet-stream','content-length':String(x.size)}});
}
export default {async fetch(request,env){
 const u=new URL(request.url),h=headers(request);
 if(request.method!=='GET'&&request.method!=='HEAD')return new Response(null,{status:405,headers:{...h,Allow:'GET, HEAD'}});
 if(u.search)return new Response(null,{status:404,headers:h});
 const next=/^\/api\/intro-public\/v22\/(manifest|(ahmed|marianne)\/(\d{3})\/([012]))$/.exec(u.pathname);
 try{if(next)return await v22(request,env,next,h);}catch{return new Response(null,{status:503,headers:h});}
 const match=/^\/api\/intro-public\/(ahmedfast|ahmedv3)\/(\d{3})$/.exec(u.pathname);
 if(!match)return new Response(null,{status:404,headers:h});
 const group=match[1]==='ahmedfast'?3:1,part=Number(match[2]),first=part*group;
 if(first>=11)return new Response(null,{status:404,headers:h});
 const indices=Array.from({length:Math.min(group,11-first)},(_,i)=>first+i);
 try{
  const chunks=await Promise.all(indices.map(i=>env.CINEMA.get(stem+String(i).padStart(3,'0'))));
  if(chunks.some((c,i)=>!c||c.size!==Math.min(unit,total-indices[i]*unit)))return new Response(null,{status:503,headers:h});
  const size=chunks.reduce((n,c)=>n+c.size,0),rh={...h,'content-type':'application/octet-stream','content-length':String(size)};
  if(request.method==='HEAD')return new Response(null,{headers:rh});
  const body=new Uint8Array(size);let at=0;
  for(const c of chunks){const b=new Uint8Array(await c.arrayBuffer());body.set(b,at);at+=b.length;}
  return new Response(body,{headers:rh});
 }catch{return new Response(null,{status:503,headers:h});}
}};
