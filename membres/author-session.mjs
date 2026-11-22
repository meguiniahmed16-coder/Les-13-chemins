import {cookieValue,fail,now} from './identity.mjs';
import {randomAvatar} from './avatar-catalog.js';
import {site} from './oauth.mjs';

const workshopCookie='__Host-am_site_admin';
const editorCookie='__Host-editor-admin';

async function confirmed(response) {
  if(response.status===401 || response.status===403)return false;
  if(!response.ok || !response.headers.get('content-type')?.includes('application/json'))
    fail(503,'La vérification de ta session auteur est momentanément indisponible.');
  return (await response.json()).ok===true;
}

export async function authorSession(request,env) {
  const studio=cookieValue(request,workshopCookie);
  const editor=cookieValue(request,editorCookie);
  if(studio && /^[a-zA-Z0-9.\-]{1,200}$/.test(studio)) {
    const reply=await env.ADMIN.fetch(new Request('https://ahmed-marie-double.meguiniahmed16.workers.dev/web-admin/auth/session',{
      headers:{cookie:workshopCookie+'='+studio,origin:site},redirect:'manual'
    }));
    if(await confirmed(reply))return 'atelier';
  }
  if(!/^[a-f0-9]{64}$/.test(editor))return null;
  const response=await fetch(site+'/.netlify/functions/editor?action=owner-session',{
    headers:{cookie:editorCookie+'='+editor},redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(10000)
  });
  return await confirmed(response)?'edition':null;
}

// The site has one owner. A revoked admin cookie can never become a member session.
export async function authorProfile(db) {
  const find=()=>db.prepare("SELECT * FROM members WHERE provider='author' AND subject='site-owner'").first();
  const existing=await find();
  if(existing)return existing;
  await db.prepare("INSERT INTO members(id,provider,subject,email,pseudo,birth,avatar,created) VALUES(?,'author','site-owner','meguiniahmed16@gmail.com','Ahmed Marie','',?,?) ON CONFLICT(provider,subject) DO NOTHING")
    .bind(crypto.randomUUID(),JSON.stringify(randomAvatar()),now()).run();
  return find();
}
