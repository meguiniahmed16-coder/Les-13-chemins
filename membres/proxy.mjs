const origin='https://tectonique-des-ames.com';
const backend='https://treize-chemins-membres.meguiniahmed16.workers.dev';
async function voiceBody(request,max){
  if(request.signal.aborted)throw new DOMException('Request cancelled','AbortError');
  const length=request.headers.get('content-length');
  if(length&&/^\d+$/.test(length)&&Number(length)>max){await request.body?.cancel().catch(()=>{});throw Object.assign(Error(),{status:413});}
  const reader=request.body?.getReader();if(!reader)return new Uint8Array();
  const parts=[];let total=0;
  const cancel=()=>{void reader.cancel().catch(()=>{});};
  request.signal.addEventListener('abort',cancel,{once:true});
  try{
    for(;;){
      const part=await reader.read();
      if(request.signal.aborted)throw new DOMException('Request cancelled','AbortError');
      if(part.done)break;
      total+=part.value.byteLength;
      if(total>max){await reader.cancel().catch(()=>{});throw Object.assign(Error(),{status:413});}
      parts.push(part.value);
    }
    const data=new Uint8Array(total);let at=0;for(const part of parts){data.set(part,at);at+=part.byteLength;}return data;
  }finally{request.signal.removeEventListener('abort',cancel);reader.releaseLock();}
}
export default async function proxy(request){
  const url=new URL(request.url);
  if(url.origin!==origin||!['GET','POST'].includes(request.method))return new Response(null,{status:403});
  if(request.method==='POST'&&request.headers.get('origin')!==origin)return new Response(null,{status:403});
  if(url.pathname.endsWith('/stripe'))return new Response(null,{status:404});
  const cookies=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).filter(s=>/^__Host-(?:chemins-(?:oauth|membre)|am_site_admin|editor-admin)=/.test(s));
  const headers={'content-type':'application/json',cookie:cookies.join('; '),origin};
  const voice=url.pathname.startsWith('/api/membres/voice/'),audio=url.pathname==='/api/membres/voice/transcribe';
  try{
    let data;
    if(request.method==='POST'){
      if(voice){
        const content=await voiceBody(request,audio?2*1024*1024:48*1024);
        if(audio){data=content;headers['content-type']=request.headers.get('content-type')||'application/octet-stream';}
        else{try{data=new TextDecoder('utf-8',{fatal:true}).decode(content);}catch{return Response.json({error:'Le message est illisible.'},{status:400,headers:{'cache-control':'no-store'}});}}
      }else{data=await request.text();if(data.length>16000)return new Response(null,{status:413});}
    }
    let target=backend+url.pathname+url.search,body=data;
    if(request.method==='POST' && ['/api/membres/login','/api/membres/signup'].includes(url.pathname)){
      let identity;
      try{identity=JSON.parse(data);}catch{}
      if(typeof identity?.email==='string'&&identity.email.trim().toLowerCase()==='meguiniahmed16@gmail.com'){
        if(url.pathname.endsWith('/signup'))return Response.json({error:'Cette adresse possède déjà un compte.'},{status:409,headers:{'cache-control':'no-store'}});
        target='https://ahmed-marie-double.meguiniahmed16.workers.dev/web-admin/auth/login';
        body=JSON.stringify({username:'admin',password:identity.password});
      }
    }
    const signal=AbortSignal.any([request.signal,AbortSignal.timeout(voice?75000:20000)]);
    const response=await fetch(target,{method:request.method,headers,body,redirect:'manual',signal});
    const out=new Headers({'cache-control':'private, no-store','netlify-cdn-cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'});
    for(const k of ['location','content-type','set-cookie','vary','x-frame-options','x-robots-tag','permissions-policy','content-security-policy','cross-origin-resource-policy','x-voice-provider','x-voice-fallback'])if(response.headers.has(k))out.set(k,response.headers.get(k));
    return new Response(response.body,{status:response.status,headers:out});
  }catch(error){
    if(request.signal.aborted)return Response.json({error:'Conversation interrompue.'},{status:499,headers:{'cache-control':'no-store'}});
    if(error.status===413)return Response.json({error:'Le fichier ou le message est trop volumineux.'},{status:413,headers:{'cache-control':'no-store'}});
    return Response.json({error:'Connexion momentanément indisponible.'},{status:503,headers:{'cache-control':'no-store'}});
  }
}
export const config={path:'/api/membres/*'};
