const origin='https://tectonique-des-ames.com';
const backend='https://treize-chemins-membres.meguiniahmed16.workers.dev';
export default async function proxy(request){
  const url=new URL(request.url);
  if(url.origin!==origin||!['GET','POST'].includes(request.method))return new Response(null,{status:403});
  if(request.method==='POST'&&request.headers.get('origin')!==origin)return new Response(null,{status:403});
  if(url.pathname.endsWith('/stripe'))return new Response(null,{status:404});
  const cookies=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).filter(s=>/^__Host-(?:chemins-(?:oauth|membre)|am_site_admin)=/.test(s));
  const headers={'content-type':'application/json',cookie:cookies.join('; '),origin};
  try{
    const data=request.method==='POST'?await request.text():undefined;
    if(data&&data.length>16000)return new Response(null,{status:413});
    const response=await fetch(backend+url.pathname+url.search,{method:request.method,headers,body:data,redirect:'manual',signal:AbortSignal.timeout(20000)});
    const out=new Headers({'cache-control':'private, no-store','netlify-cdn-cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'});
    for(const k of ['location','content-type','set-cookie'])if(response.headers.has(k))out.set(k,response.headers.get(k));
    return new Response(response.body,{status:response.status,headers:out});
  }catch{return Response.json({error:'Connexion momentanément indisponible.'},{status:503,headers:{'cache-control':'no-store'}});}
}
export const config={path:'/api/membres/*'};
