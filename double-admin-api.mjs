const BACKEND='https://ahmed-marie-double.meguiniahmed16.workers.dev';
const PREFIX='/api/atelier/';
const headers={'cache-control':'private, no-store','cdn-cache-control':'no-store','netlify-cdn-cache-control':'no-store','x-content-type-options':'nosniff'};
export default async function handler(request) {
  const url=new URL(request.url);
  if(!url.pathname.startsWith(PREFIX))return Response.json({error:'Route inconnue.'},{status:404,headers});
  if(!['GET','POST'].includes(request.method))return Response.json({error:'Méthode non autorisée.'},{status:405,headers});
  if(request.method==='POST' && request.headers.get('origin')!==url.origin)return Response.json({error:'Origine invalide.'},{status:403,headers});
  try {
    let body;
    if(request.method==='POST'){
      const reader=request.body?.getReader();const chunks=[];let size=0;
      if(reader)for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>(url.pathname===PREFIX+'media/upload'?3*1024*1024:url.pathname===PREFIX+'double/admin/blog'?250000:30000)){await reader.cancel();return Response.json({error:'Demande trop longue.'},{status:413,headers});}chunks.push(value);}
      body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}
    }
    if(url.pathname===PREFIX+'auth/login'&&body){
      let identity;
      try{identity=JSON.parse(new TextDecoder().decode(body));}catch{}
      if(typeof identity?.username==='string'&&identity.username.trim().toLowerCase()==='meguiniahmed16@gmail.com'){
        body=JSON.stringify({username:'admin',password:identity.password});
      }
    }
    const response=await fetch(BACKEND+'/web-admin/'+url.pathname.slice(PREFIX.length)+url.search,{method:request.method,headers:{'content-type':request.headers.get('content-type')||'application/json',origin:url.origin,cookie:request.headers.get('cookie')||''},body,redirect:'manual',signal:AbortSignal.timeout(55000)});
    const output=new Headers(headers);
    for(const key of ['content-type','set-cookie','location'])if(response.headers.has(key))output.set(key,response.headers.get(key));
    return new Response(response.body,{status:response.status,headers:output});
  }catch{return Response.json({error:'Le service met trop de temps à répondre. Recharge pour vérifier avant de recommencer.'},{status:502,headers});}
}
export const config={path:'/api/atelier/*'};
