const site='https://tectonique-des-ames.com';
const target='https://treize-chemins-intro-prive.meguiniahmed16.workers.dev';
export default async function handler(request){
 const url=new URL(request.url);
 const lab=/^\/api\/intro-private\/atelier-v22\/(state|manifest|model\/(?:ahmed|marianne)\/\d{3}\/[012]|refonte(?:-v5)?\/(?:ahmed|marianne))$/.exec(url.pathname);
 const put=lab?.[1]==='state'&&request.method==='PUT';
 if(url.origin!==site||(!put&&request.method!=='GET')||(!lab&&!/^\/api\/intro-private\/(white|dojo|ahmed|ahmedv3|ahmedfast)\/\d{3}$/.test(url.pathname)))return new Response(null,{status:403});
 if(put&&(request.headers.get('origin')!==site||Number(request.headers.get('content-length')||0)>65536))return new Response(null,{status:403});
 const cookie=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).filter(x=>/^__Host-am_site_admin=/.test(x)).join('; ');
 if(!cookie)return new Response(null,{status:401});
 try{
  const body=put?await request.text():undefined;
  if(put&&new TextEncoder().encode(body).length>65536)return new Response(null,{status:413});
  const response=await fetch(target+url.pathname,{method:request.method,body,headers:{cookie,origin:site,...(put?{'content-type':'application/json'}:{})},redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(55000)});
  const headers={'cache-control':'private, no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
  if(response.headers.has('content-type'))headers['content-type']=response.headers.get('content-type');
  if(response.headers.has('content-length'))headers['content-length']=response.headers.get('content-length');
  return new Response(response.body,{status:response.status,headers});
 }catch{return Response.json({error:'Téléchargement interrompu.'},{status:503,headers:{'cache-control':'no-store'}})}
}
export const config={path:'/api/intro-private/*'};
