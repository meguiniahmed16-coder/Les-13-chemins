const backend='https://odeur-du-bois.meguiniahmed16.workers.dev';
export default async function handler(request){
 const url=new URL(request.url);
 const path=url.pathname.slice('/api/creations'.length);
 if(!/^\/(?:catalog|checkout|reservation|cancel|buy\/santal-rose|media\/[a-f0-9-]+\.webp|admin\/(?:catalog|save|stripe|shipped|convert))$/.test(path))return new Response(null,{status:404});
 if(!['GET','POST'].includes(request.method))return new Response(null,{status:405});
 if(request.method==='POST'&&(url.origin!=='https://tectonique-des-ames.com'||request.headers.get('origin')!==url.origin))return new Response(null,{status:403});
 const headers=new Headers({origin:url.origin});if(path.startsWith('/admin/'))headers.set('cookie',request.headers.get('cookie')||'');
 if(request.method==='POST')headers.set('content-type','application/json');
 try{
  const r=await fetch(backend+path,{method:request.method,headers,body:request.method==='POST'?request.body:undefined,duplex:'half',redirect:'manual',signal:AbortSignal.timeout(25000)});
  const out=new Headers({'cache-control':'private, no-store','x-content-type-options':'nosniff','netlify-cdn-cache-control':'no-store'});
  for(const k of ['content-type','location'])if(r.headers.has(k))out.set(k,r.headers.get(k));
  return new Response(r.body,{status:r.status,headers:out});
 }catch{return Response.json({error:'La connexion au catalogue est temporairement indisponible.'},{status:503,headers:{'cache-control':'no-store'}});}
}
export const config={path:'/api/creations/*'};
