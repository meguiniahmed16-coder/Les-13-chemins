const site='https://tectonique-des-ames.com';
const target='https://treize-chemins-intro-prive.meguiniahmed16.workers.dev';
export default async function handler(request){
 const url=new URL(request.url);
 if(url.origin!==site||request.method!=='GET'||!/^\/api\/intro-private\/(white|dojo|ahmed|ahmedv3)\/\d{3}$/.test(url.pathname))return new Response(null,{status:403});
 const cookie=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).filter(x=>/^__Host-am_site_admin=/.test(x)).join('; ');
 if(!cookie)return new Response(null,{status:401});
 try{
  const response=await fetch(target+url.pathname,{method:'GET',headers:{cookie,origin:site},redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(30000)});
  const headers={'cache-control':'private, no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
  if(response.headers.has('content-type'))headers['content-type']=response.headers.get('content-type');
  if(response.headers.has('content-length'))headers['content-length']=response.headers.get('content-length');
  return new Response(response.body,{status:response.status,headers});
 }catch{return Response.json({error:'Téléchargement interrompu.'},{status:503,headers:{'cache-control':'no-store'}})}
}
export const config={path:'/api/intro-private/*'};
