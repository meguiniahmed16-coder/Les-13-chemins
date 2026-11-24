const SITE='https://tectonique-des-ames.com';
const BACKEND='https://treize-chemins-admin-unifie.meguiniahmed16.workers.dev';
export default async function unifiedAdmin(request) {
 const url=new URL(request.url);
 if(url.origin!==SITE||!url.pathname.startsWith('/api/admin-unified/'))return Response.json({error:'Accès interdit.'},{status:403});
 if(!['GET','POST'].includes(request.method))return Response.json({error:'Méthode interdite.'},{status:405});
 if(request.method==='POST'&&request.headers.get('origin')!==SITE)return Response.json({error:'Origine invalide.'},{status:403});
 const cookie=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).filter(x=>/^__Host-am_site_admin=/.test(x)).join('; ');
 if(!cookie)return Response.json({error:'Connexion administrateur requise.'},{status:401});
 try{
  const body=request.method==='POST'?await request.text():undefined;
  if(body?.length>3500)return Response.json({error:'Message trop long.'},{status:413});
  const response=await fetch(BACKEND+url.pathname+url.search,{method:request.method,headers:{origin:SITE,cookie,'content-type':'application/json'},body,cache:'no-store',signal:AbortSignal.timeout(17000)});
  return new Response(response.body,{status:response.status,headers:{'content-type':'application/json','cache-control':'private, no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','vary':'Cookie'}});
 }catch{return Response.json({error:'L’administration des membres est momentanément indisponible.'},{status:503})}
}
export const config={path:'/api/admin-unified/*'};
