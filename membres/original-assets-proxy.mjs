const SITE='https://tectonique-des-ames.com';
const BACKEND='https://maison-rencontres-original-assets.meguiniahmed16.workers.dev';
export default async function serveOriginal(request){
  const url=new URL(request.url);
  const part=url.pathname.match(/^\/api\/maison-original\/assets\/(white|dojo)\/(\d{3})$/);
  if(url.origin!==SITE||request.method!=='GET'||!part)return new Response(null,{status:404});
  const cookie=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>/^__Host-am_site_admin=/.test(x));
  if(!cookie)return Response.json({error:'Session administrateur requise.'},{status:401,headers:{'cache-control':'private, no-store'}});
  try{
    const response=await fetch(BACKEND+'/assets/'+part[1]+'/'+part[2],{
      headers:{cookie,origin:SITE},redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(30000)
    });
    const headers={'content-type':response.headers.get('content-type')||'application/octet-stream','cache-control':'private, no-store','x-content-type-options':'nosniff','vary':'Cookie','referrer-policy':'no-referrer'};
    const size=response.headers.get('content-length');if(size)headers['content-length']=size;
    return new Response(response.body,{status:response.status,headers});
  }catch{return Response.json({error:'Décor original momentanément indisponible.'},{status:503,headers:{'cache-control':'no-store'}})}
}
export const config={path:'/api/maison-original/*'};