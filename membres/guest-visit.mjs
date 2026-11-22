import {createHmac, randomBytes, timingSafeEqual} from 'node:crypto';
import {getStore} from '@netlify/blobs';

const cookieName='__Host-chemins-visite';
const duration=15*60*1000;
const headers={'Cache-Control':'private, no-store','Netlify-CDN-Cache-Control':'no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff'};
const json=(data,status=200,extra={})=>Response.json(data,{status,headers:{...headers,...extra}});
let storedKey;

async function signingKey(){
  const store=getStore({name:'salon-visite',consistency:'strong'});
  const found=await store.get('signature');
  if(found)return found;
  const key=randomBytes(32).toString('hex');
  const {modified}=await store.set('signature',key,{onlyIfNew:true});
  return modified?key:await store.get('signature');
}

export async function visit(request,{key=()=>storedKey??=(signingKey().catch(e=>{storedKey=null;throw e;})),now=Date.now}={}){
  if(request.method!=='GET'&&request.method!=='POST')return json({},405,{Allow:'GET, POST'});
  if(request.method==='POST'&&request.headers.get('origin')!==new URL(request.url).origin)return json({},403);
  const token=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);
  if(!token&&request.method==='GET')return json({state:'new'});
  const secret=await key();
  if(!secret)throw Error('Clé de visite indisponible');
  const sign=payload=>createHmac('sha256',secret).update(payload).digest('hex');
  const time=now();
  let start=time,id,extra={};
  if(token){
    const match=/^(\d{13})\.([a-f0-9]{24})\.([a-f0-9]{64})$/.exec(token);
    if(!match||!timingSafeEqual(Buffer.from(match[3],'hex'),Buffer.from(sign(match[1]+'.'+match[2]),'hex')))return json({state:'expired'});
    start=Number(match[1]);id=match[2];
  }else{
    id=randomBytes(12).toString('hex');
    const value=start+'.'+id;
    extra={'Set-Cookie':cookieName+'='+value+'.'+sign(value)+'; Path=/; HttpOnly; Secure; SameSite=Lax'};
  }
  const remaining=Math.min(duration,Math.max(0,start+duration-time));
  return json({state:remaining?'active':'expired',remaining},200,extra);
}

export default async function handle(request){
  try{return await visit(request);}catch{return json({error:'La visite ne peut pas démarrer pour le moment.'},503);}
}
export const config={path:'/api/visite-salon'};
