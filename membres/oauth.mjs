import {cookie,cookieValue,digest,fail,newSession,nonce,now,rate} from './identity.mjs';
import {randomAvatar} from './avatar-catalog.js';
export const site='https://tectonique-des-ames.com';
const stateCookie='__Host-chemins-oauth';
const providers={
  google:{login:'https://accounts.google.com/o/oauth2/v2/auth',token:'https://oauth2.googleapis.com/token',user:'https://openidconnect.googleapis.com/v1/userinfo',scope:'openid email'},
  facebook:{login:'https://www.facebook.com/v24.0/dialog/oauth',token:'https://graph.facebook.com/v24.0/oauth/access_token',user:'https://graph.facebook.com/v24.0/me?fields=id,email',scope:'email'}
};
export function available(env){return Object.fromEntries(Object.keys(providers).map(p=>[p,Boolean(env[p.toUpperCase()+'_CLIENT_ID']&&env[p.toUpperCase()+'_CLIENT_SECRET'])]));}
function redirect(location,session){return new Response(null,{status:303,headers:{location,'set-cookie':session,'cache-control':'no-store','referrer-policy':'no-referrer'}});}
export async function social(r,env,provider,callback){
  const p=providers[provider];if(!p||!available(env)[provider])fail(503,'Cette connexion n’est pas encore activée.');
  const url=new URL(r.url),db=env.DB,id=env[provider.toUpperCase()+'_CLIENT_ID'];
  const callbackURL=site+'/api/membres/oauth/'+provider+'/callback';
  if(!callback){
    await rate(db,'oauth:'+r.headers.get('cf-connecting-ip'),250);
    const state=nonce(),verifier=nonce(),next=new URL(p.login);
    next.search=new URLSearchParams({response_type:'code',client_id:id,redirect_uri:callbackURL,scope:p.scope,state});
    if(provider==='google'){
      const bytes=Uint8Array.from((await digest(verifier)).match(/../g),s=>parseInt(s,16));
      next.searchParams.set('code_challenge',btoa(String.fromCharCode(...bytes)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_'));
      next.searchParams.set('code_challenge_method','S256');
    }
    await db.prepare('INSERT INTO member_oauth VALUES(?,?,?,?)').bind(await digest(state),provider,verifier,now()+600).run();
    return redirect(next.href,cookie(stateCookie,state,600));
  }
  const state=url.searchParams.get('state'),code=url.searchParams.get('code');
  if(!state||state!==cookieValue(r,stateCookie)||!code)return redirect(site+'/membre.html?connexion=interrompue',cookie(stateCookie,'',0));
  const row=await db.prepare('DELETE FROM member_oauth WHERE state=? AND provider=? AND expires>? RETURNING verifier').bind(await digest(state),provider,now()).first();
  if(!row)fail(400,'La demande de connexion a expiré.');
  const fields={grant_type:'authorization_code',code,client_id:id,client_secret:env[provider.toUpperCase()+'_CLIENT_SECRET'],redirect_uri:callbackURL};
  if(provider==='google')fields.code_verifier=row.verifier;
  const token=await fetch(p.token,{method:'POST',body:new URLSearchParams(fields),signal:AbortSignal.timeout(12000)});
  const data=await token.json();
  if(!token.ok||!data.access_token)fail(401,'Le service a refusé la connexion.');
  const res=await fetch(p.user,{headers:{Authorization:'Bearer '+data.access_token},signal:AbortSignal.timeout(12000)});
  const user=await res.json(),subject=provider==='google'?user.sub:user.id;
  if(!res.ok||!subject||(provider==='google'&&user.email_verified!==true))fail(401,'Le service n’a pas confirmé le compte.');
  await db.prepare("INSERT INTO members(id,provider,subject,email,pseudo,birth,avatar,created) VALUES(?,?,?,?, '','',?,?) ON CONFLICT(provider,subject) DO NOTHING").bind(crypto.randomUUID(),provider,String(subject),String(user.email||''),JSON.stringify(randomAvatar()),now()).run();
  const member=await db.prepare('SELECT id FROM members WHERE provider=? AND subject=?').bind(provider,String(subject)).first();
  return redirect(site+'/membre.html',await newSession(db,member.id));
}
