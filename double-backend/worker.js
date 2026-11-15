import {VOICE, VOICE_VERSION, MAX_REPLY_TOKENS, addressPreference, turnVoiceContext, repeatedGreetingContext} from './voice.js';
import BANK from './bank.js';
import {blogGet,blogPost} from './blog.js';
import {recordVisit,sendVisitMail,visitStats,notificationSettings,updateNotificationSettings,mailConfigured} from './visits.js';

const MODEL='@cf/google/gemma-4-26b-a4b-it';
const ORIGINS=new Set(['https://tectonique-des-ames.netlify.app','https://tectonic-d-am.com','https://www.tectonic-d-am.com','https://tectonique-des-ames.com','https://www.tectonique-des-ames.com']);
const encoder=new TextEncoder();
const STOP=new Set('alors avec avoir bien bon cela celle celui cette comme comment dans depuis des donc elle elles encore est etre faire faut fois ici ils jai jen jes je jour jusque leur leurs mais mes moi mon mots nous notre nos oui par parce pas plus pour pourquoi quand que quel quelle quelles quels qui quoi sans ses son sont sous sur tes toi ton tous tout toute toutes tres une vos votre vous y ca cest suis ai as au aux ce ces cet de du en et il la le les ma me ne on ou sa se si ta te tu un'.split(' '));
function norm(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function terms(s){return [...new Set(norm(s).split(' ').filter(x=>x.length>2&&!STOP.has(x)).map(x=>x.replace(/(ements|ement|ations|ation|iques|ique|ees|es|s)$/,'')))];}
const INDEX=BANK.questions.map(q=>({q,t:terms(q.question+' '+q.answers.map(a=>a.text).join(' ')),qt:terms(q.question)}));
const FACTS=`Ahmed Marie est le nom d’auteur d’Ahmed Meguini. Né le 28 juin 1977 à Saint-Julien-en-Genevois, enfance à Ferney-Voltaire, père algérien et mère marocaine. Enfance avec violences et placements, puis armée en Bosnie, théâtre, médias, engagement politique, prison, reportage en Syrie. Auteur de La tectonique des âmes, travail sur Les Treize Chemins (livre, atlas, jeux et personnages). Il est père, sans communiquer les coordonnées ni la vie privée de sa fille. Éducation musulmane, longue période athée, cheminement chrétien ; atelier de continuité récent indique baptême à Pâques 2026 et confirmation en juin. Marche commencée le 7 avril 2024. Le manuscrit ancien 29 juillet est écrit en 2024 : ses projets ne sont pas des faits actuels. Marucca appartient au passé : la V17 raconte son naufrage. Lieu de résidence actuel, emploi du temps et activité du jour non renseignés. Alma est une voix dans son travail avec l’IA et Quelqu’un de l’autre côté ; ne pas inventer une personne humaine ni ses sentiments réels. Les Terres Blanches explorent des voix et des relations. Les coordonnées du carnet privé ne sont jamais communiquées.`;

function json(data,status=200,origin=''){const h={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','vary':'Origin'};if(origin&&ORIGINS.has(origin)){h['access-control-allow-origin']=origin;h['access-control-allow-headers']='content-type';h['access-control-allow-methods']='POST, GET, OPTIONS';}return new Response(status===204?null:JSON.stringify(data),{status,headers:h});}
async function hash(s){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join('');}
async function admin(request,env){const v=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';if(!env.ADMIN_TOKEN)return false;const [a,b]=await Promise.all([crypto.subtle.digest('SHA-256',encoder.encode(v)),crypto.subtle.digest('SHA-256',encoder.encode(env.ADMIN_TOKEN))]);return crypto.subtle.timingSafeEqual(a,b);}
async function body(request){const reader=request.body?.getReader();if(!reader)return {};let n=0,parts=[];for(;;){const {done,value}=await reader.read();if(done)break;n+=value.byteLength;if(n>30000){await reader.cancel();throw new Error('body_limit');}parts.push(value);}const bytes=new Uint8Array(n);let off=0;for(const p of parts){bytes.set(p,off);off+=p.length;}return JSON.parse(new TextDecoder().decode(bytes));}
function validString(x,max=3000){return typeof x==='string'&&x.trim().length>0&&x.length<=max;}
async function session(db,p,isAdmin){if(!validString(p.session_id,80))return null;const s=await db.prepare('SELECT * FROM sessions WHERE id=?').bind(p.session_id).first();if(!s)return null;if(isAdmin)return s;if(s.kind!=='public'||!validString(p.token,150))return null;return (await hash(p.token))===s.token_hash?s:null;}
function publicTurn(t){return {id:t.id,prompt:t.prompt,response:t.response,created_at:t.created_at,state:t.state,status:t.review,correction:t.correction};}
function match(query,memories){const tt=terms(query);const scored=INDEX.map(x=>({q:x.q,score:tt.reduce((s,t)=>s+(x.qt.includes(t)?5:x.t.includes(t)?1:0),0)+(norm(query).includes(norm(x.q.question))?30:0)}));scored.sort((a,b)=>b.score-a.score);const found=scored.filter(x=>x.score>0).slice(0,5);const mem=memories.map(m=>({m,score:terms(m.question).filter(t=>tt.includes(t)).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,5).map(x=>x.m);return{found,mem};}
async function cleanup(env){const cutoff=new Date(Date.now()-90*864e5).toISOString();await env.DB.batch([env.DB.prepare('DELETE FROM review_events WHERE target_id IN (SELECT id FROM turns WHERE created_at<?)').bind(cutoff),env.DB.prepare('DELETE FROM mail_items WHERE turn_id IN (SELECT id FROM turns WHERE created_at<?)').bind(cutoff),env.DB.prepare('DELETE FROM turns WHERE created_at<?').bind(cutoff),env.DB.prepare('DELETE FROM sessions WHERE last_at<?').bind(cutoff),env.DB.prepare('DELETE FROM daily_access WHERE key<?').bind(new Date(Date.now()-2*864e5).toISOString().slice(0,10))]);}

export default {async fetch(request,env,ctx){const origin=request.headers.get('origin')||'';const u=new URL(request.url);const reply=(d,s=200)=>json(d,s,origin);try{
 if(request.method==='OPTIONS')return reply({},204);
 if(u.pathname==='/health'&&request.method==='GET')return reply({ok:true,version:BANK.version,voice_version:VOICE_VERSION,questions:BANK.questions.length,answers:BANK.questions.reduce((n,q)=>n+q.answers.length,0),model:MODEL});
 const isAdmin=await admin(request,env);
 if(u.pathname.startsWith('/admin/')&&!isAdmin)return reply({error:'Accès auteur requis.'},401);
 if(!isAdmin&&origin&&!ORIGINS.has(origin))return reply({error:'Origine non autorisée.'},403);
 const now=new Date().toISOString(),day=now.slice(0,10),db=env.DB;
 if(u.pathname==='/admin/notification-settings'&&request.method==='GET')return reply({settings:await notificationSettings(db),mailConfigured:mailConfigured(env)});
 if(u.pathname==='/admin/visits'&&request.method==='GET')return reply(await visitStats(env,now));
 if(u.pathname==='/admin/blog'&&request.method==='GET')return reply(await blogGet(db));
 if(u.pathname==='/admin/bank'&&request.method==='GET')return reply(BANK);
 if(u.pathname==='/admin/review'&&request.method==='GET'){
  const raw=u.searchParams.get('before');let cursor=['9999',''];if(raw){try{cursor=JSON.parse(atob(raw));}catch{cursor=[raw,''];}}const [before,beforeId]=cursor;const kind=u.searchParams.get('kind')||'all';
  const rows=await db.prepare("SELECT t.*,s.kind FROM turns t JOIN sessions s ON s.id=t.session_id WHERE (t.created_at<? OR (t.created_at=? AND t.id<?)) AND (?='all' OR s.kind=?) ORDER BY t.created_at DESC,t.id DESC LIMIT 101").bind(before,before,beforeId,kind,kind).all();
  const memory=await db.prepare('SELECT * FROM memory ORDER BY updated_at DESC LIMIT 2000').all();
  const counts=await db.prepare("SELECT review,count(*) AS count FROM turns WHERE state='complete' GROUP BY review").all();
  return reply({turns:rows.results.slice(0,100),next:rows.results.length>100?btoa(JSON.stringify([rows.results[99].created_at,rows.results[99].id])):null,memory:memory.results,counts:counts.results});
 }
 if(request.method!=='POST')return reply({error:'Route introuvable.'},404);
 const p=await body(request);
 if(u.pathname==='/admin/notification-settings'){const result=await updateNotificationSettings(db,p.mode,p.version,now);return reply(result,result.status);}
 if(u.pathname==='/admin/login-rate'){
  const slot=Math.floor(Date.now()/900000);const k=day+':login:'+slot+':'+await hash(String(p.client||'unknown')+'|'+env.ADMIN_TOKEN);
  const rate=await db.prepare('INSERT INTO daily_access(key,count) VALUES(?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<10 RETURNING count').bind(k).first();
  return reply({ok:!!rate},rate?200:429);
 }
 if(u.pathname==='/visit'){
  if(!validString(p.visitor_id,80)||!/^[-a-zA-Z0-9]{16,80}$/.test(p.visitor_id)||!validString(p.page,200)||!/^\/[a-zA-Z0-9_./-]*$/.test(p.page))return reply({error:'Visite invalide.'},400);
  const browserHash=await hash(p.visitor_id+'|'+env.ADMIN_TOKEN);
  const ipHash=await hash((request.headers.get('cf-connecting-ip')||'unknown')+'|'+env.ADMIN_TOKEN);
  const rate=await db.prepare('INSERT INTO daily_access(key,count) VALUES(?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<600 RETURNING count').bind(day+':visit:'+ipHash).first();if(!rate)return reply({error:'Limite de visites atteinte.'},429);
  const visit=await recordVisit(db,browserHash,p.page,now);if(visit.fresh)ctx.waitUntil(sendVisitMail(env,visit.id));
  return reply({ok:true,new_visit:visit.fresh});
 }
 p.visitor_key=await hash(day+'|'+(request.headers.get('cf-connecting-ip')||'unknown')+'|'+env.ADMIN_TOKEN);

 const blogResult=await blogPost(u.pathname,p,db,isAdmin,now,reply);if(blogResult)return blogResult;
 if(u.pathname==='/start'){

  if(!isAdmin&&!(await db.prepare("SELECT id FROM posts WHERE id=? AND status='published'").bind(p.post_id||'').first()))return reply({error:'Billet indisponible.'},404);
  if(!isAdmin&&p.consent!==true)return reply({error:'L’accord sur l’enregistrement est nécessaire.'},400);
  if(!isAdmin){const ip=await hash(day+'|'+(request.headers.get('cf-connecting-ip')||'unknown')+'|'+env.ADMIN_TOKEN);const k=day+':'+ip;const a=await db.prepare('INSERT INTO daily_access(key,count) VALUES(?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<12 RETURNING count').bind(k).first();if(!a)return reply({error:'Limite de nouvelles conversations atteinte pour aujourd’hui.'},429);}
  const id=crypto.randomUUID(),token=crypto.randomUUID()+crypto.randomUUID();await db.prepare('INSERT INTO sessions(id,token_hash,kind,created_at,last_at,consent_version,invite_id,post_id) VALUES(?,?,?,?,?,?,?,?)').bind(id,await hash(token),isAdmin?'private':'public',now,now,'2026-11-15-v2',null,p.post_id||null).run();ctx.waitUntil(cleanup(env).catch(()=>{}));return reply({session_id:id,token});
 }
 if(u.pathname==='/admin/decision'){
  if(!validString(p.id,100)||!['validated','corrected','refused'].includes(p.action))return reply({error:'Décision invalide.'},400);
  if(p.action==='corrected'&&!validString(p.text,12000))return reply({error:'La correction doit contenir un texte.'},400);
  const t=await db.prepare('SELECT * FROM turns WHERE id=?').bind(p.id).first();if(!t)return reply({error:'Réponse introuvable.'},404);
  const answer=p.action==='corrected'?p.text.trim():t.response;const before=JSON.stringify({review:t.review,correction:t.correction});
  await db.batch([db.prepare('UPDATE turns SET review=?,correction=?,reviewed_at=? WHERE id=?').bind(p.action,p.action==='corrected'?answer:'',now,p.id),db.prepare('INSERT INTO memory(id,question,answer,state,source_turn,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET question=excluded.question,answer=excluded.answer,state=excluded.state,updated_at=excluded.updated_at').bind('turn:'+p.id,t.prompt,answer,p.action,p.id,now),db.prepare('INSERT INTO review_events(id,target_id,action,before_json,after_json,created_at) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),p.id,p.action,before,JSON.stringify({answer}),now)]);
  return reply({ok:true,review:p.action,correction:p.action==='corrected'?answer:''});
 }
 if(u.pathname==='/admin/answer'){
  if(!validString(p.id,100)||!['validated','corrected','refused'].includes(p.action))return reply({error:'Choix invalide.'},400);
  const q=BANK.questions.find(q=>q.answers.some(a=>a.id===p.id));const a=q?.answers.find(a=>a.id===p.id);if(!a)return reply({error:'Proposition introuvable.'},404);
  if(p.action==='corrected'&&!validString(p.text,12000))return reply({error:'Correction vide.'},400);const answer=p.action==='corrected'?p.text.trim():a.text;
  const prev=await db.prepare('SELECT * FROM memory WHERE id=?').bind(p.id).first();await db.batch([db.prepare('INSERT INTO memory(id,question,answer,state,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET answer=excluded.answer,state=excluded.state,updated_at=excluded.updated_at').bind(p.id,q.question,answer,p.action,now),db.prepare('INSERT INTO review_events(id,target_id,action,before_json,after_json,created_at) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),p.id,p.action,JSON.stringify(prev||a),JSON.stringify({answer}),now)]);return reply({ok:true});
 }
 const s=await session(db,p,isAdmin);if(!s)return reply({error:'Cette conversation n’est pas accessible. Ouvre une nouvelle conversation.'},401);
 if(u.pathname==='/history'){const rows=await db.prepare('SELECT * FROM turns WHERE session_id=? ORDER BY created_at ASC LIMIT 200').bind(s.id).all();return reply({turns:rows.results.map(publicTurn)});}
 if(u.pathname==='/erase'){await db.batch([db.prepare('DELETE FROM memory WHERE source_turn IN (SELECT id FROM turns WHERE session_id=?)').bind(s.id),db.prepare('DELETE FROM review_events WHERE target_id IN (SELECT id FROM turns WHERE session_id=?)').bind(s.id),db.prepare('DELETE FROM turns WHERE session_id=?').bind(s.id),db.prepare('DELETE FROM sessions WHERE id=?').bind(s.id)]);return reply({ok:true});}
 if(u.pathname!=='/chat')return reply({error:'Route introuvable.'},404);
 if(!validString(p.message,3000)||!validString(p.request_id,100))return reply({error:'Écris un message de moins de 3 000 caractères.'},400);
 const existing=await db.prepare('SELECT * FROM turns WHERE session_id=? AND request_id=?').bind(s.id,p.request_id).first();
 if(existing){if(existing.prompt!==p.message.trim())return reply({error:'Cet identifiant appartient à un autre message.'},400);if(existing.state==='complete')return reply({turn:publicTurn(existing),sources:JSON.parse(existing.source_ids)});if(existing.state==='pending')return reply({error:'La réponse est encore en préparation.'},409);}
 const num=await db.prepare('SELECT count(*) AS n FROM turns WHERE session_id=?').bind(s.id).first();if(Number(num.n)>=120)return reply({error:'Cette conversation est complète. Tu peux en ouvrir une nouvelle.'},429);
 const [recent,memories]=await Promise.all([db.prepare("SELECT * FROM turns WHERE session_id=? AND state='complete' ORDER BY created_at DESC LIMIT 20").bind(s.id).all(),db.prepare('SELECT * FROM memory ORDER BY updated_at DESC LIMIT 2000').all()]);
 const pastTurns=recent.results.reverse();const history=pastTurns.slice(-8);const retrieval=match(p.message+' '+history.slice(-1).map(t=>t.prompt).join(' '),memories.results);
 const selected=retrieval.found.map(({q})=>({id:q.id,question:q.question,answers:q.answers.map(a=>{const m=memories.results.find(m=>m.id===a.id);return m?.state==='refused'?null:{id:a.id,text:m?.answer||a.text,status:m?.state||a.status};}).filter(Boolean)}));
 const positives=retrieval.mem.filter(m=>m.state!=='refused'),negatives=retrieval.mem.filter(m=>m.state==='refused');
 const addressMode=addressPreference(p.message,s.address_mode||'tu');
 if(addressMode!==(s.address_mode||'tu'))await db.prepare('UPDATE sessions SET address_mode=? WHERE id=?').bind(addressMode,s.id).run();
 const emojiAllowed=p.emojis!==false&&Number(num.n)%6===3;
 const blogContext=s.post_id?await db.prepare("SELECT title,body FROM posts WHERE id=? AND status='published'").bind(s.post_id).first():null;
 const system=VOICE+(blogContext?'\nBILLET DISCUTÉ (texte de l’auteur)\n'+JSON.stringify(blogContext).slice(0,7000):'')+'\nBIOGRAPHIE DATÉE\n'+FACTS+'\nRÉPONSES POSSIBLES DU CORPUS\n'+JSON.stringify(selected).slice(0,10000)+'\nCORRECTIONS ET VALIDATIONS D’AUTEUR PRIORITAIRES\n'+JSON.stringify(positives).slice(0,7000)+'\nFORMULATIONS REFUSÉES, À NE PAS REPRENDRE\n'+JSON.stringify(negatives.map(m=>({question:m.question,answer:m.answer}))).slice(0,3000)+'\nÉMOJIS : '+(emojiAllowed?'Tu peux ajouter UN émoji discret si cela vient naturellement (humour ou chaleur), jamais pour une peine, un deuil ou une confidence grave.':'Aucun émoji dans cette réponse.')+turnVoiceContext(addressMode,now)+repeatedGreetingContext(p.message,pastTurns,now,addressMode);
 const messages=[{role:'system',content:system},...history.flatMap(t=>[{role:'user',content:t.prompt.slice(0,1000)},{role:'assistant',content:(t.review==='refused'?'[Cette ancienne réponse a été refusée par l’auteur ; ne pas la réutiliser.]':t.correction||t.response).slice(0,1200)}]),{role:'user',content:p.message.trim()}];
 // Conservative byte upper bound for tokens; no automatic paid-plan upgrade.
 const reserve=Math.ceil(encoder.encode(JSON.stringify(messages)).byteLength*.009091+MAX_REPLY_TOKENS*.027273+10);
 const budget=await db.prepare('INSERT INTO daily_budget(day,reserved,calls) VALUES(?,?,1) ON CONFLICT(day) DO UPDATE SET reserved=reserved+excluded.reserved,calls=calls+1 WHERE reserved+excluded.reserved<=7000 RETURNING reserved').bind(day,reserve).first();if(!budget)return reply({error:'Le quota de conversation de cette alpha est atteint pour aujourd’hui. Reviens demain ; les échanges déjà enregistrés restent disponibles.'},429);
 const id=existing?.id||crypto.randomUUID();const inserted=existing?await db.prepare("UPDATE turns SET state='pending' WHERE id=? AND state='error'").bind(id).run():await db.prepare('INSERT OR IGNORE INTO turns(id,session_id,request_id,prompt,created_at,source_ids) VALUES(?,?,?,?,?,?)').bind(id,s.id,p.request_id,p.message.trim(),now,JSON.stringify(selected.map(x=>x.id))).run();if(!inserted.meta.changes)return reply({error:'Cette réponse est déjà en préparation.'},409);
 try{
  const result=await env.AI.run(MODEL,{messages,max_completion_tokens:MAX_REPLY_TOKENS,chat_template_kwargs:{enable_thinking:false},temperature:.85,top_p:.92,stream:false});
  const answer=(result.choices?.[0]?.message?.content||result.response||'').trim();if(!answer)throw new Error('empty_answer');
  await db.batch([db.prepare("UPDATE turns SET response=?,state='complete' WHERE id=?").bind(answer,id),db.prepare('UPDATE sessions SET last_at=? WHERE id=?').bind(now,s.id)]);
  return reply({turn:{id,prompt:p.message.trim(),response:answer,created_at:now,state:'complete',status:'unreviewed',correction:''},sources:selected.map(x=>x.id)});
 }catch(e){console.error(JSON.stringify({event:'inference_error',turn_id:id,type:e?.name||'Error'}));await db.prepare("UPDATE turns SET state='error' WHERE id=?").bind(id).run();return reply({error:'Le moteur n’a pas pu répondre à cet essai. Ton message est conservé ; tu peux le renvoyer.'},503);}
 }catch(e){console.error(JSON.stringify({event:'request_error',path:u.pathname,type:e?.name||'Error'}));return reply({error:e?.message==='body_limit'?'Message trop long.':'Une erreur est survenue. Réessaie dans un instant.'},e?.message==='body_limit'?413:500);}}};
