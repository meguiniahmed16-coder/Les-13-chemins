import {normalizeDoc,normalizeCover,plainDoc,docText,mediaIds} from './blog-content.js';
export async function invite(db,token){if(typeof token!=='string'||token.length<32||token.length>100)return null;return db.prepare('SELECT id,label FROM invitations WHERE token=? AND active=1').bind(token).first();}
export async function blogGet(db){const [posts,invites,comments]=await Promise.all([db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all(),db.prepare('SELECT * FROM invitations ORDER BY id').all(),db.prepare('SELECT * FROM comments ORDER BY created_at DESC LIMIT 1000').all()]);return{posts:posts.results,invites:invites.results,comments:comments.results};}
export async function blogPost(path,p,db,isAdmin,now,reply){
 const valid=(s,n)=>typeof s==='string'&&s.trim().length>0&&s.length<=n;
 if(path==='/admin/blog'){
  if(!isAdmin)return reply({error:'Accès auteur requis.'},401);
  if(!valid(p.title,200)||!['draft','published'].includes(p.status))return reply({error:'Un titre et un état sont nécessaires.'},400);
  let content,cover;try{content=normalizeDoc(p.content||plainDoc(p.body||''));cover=normalizeCover(p.cover);}catch(e){return reply({error:e.message},400);}
  const body=docText(content);const assets=mediaIds(content,cover);
  if(body.length>50000||(!body.trim()&&!assets.length))return reply({error:'Ajoute un texte ou une image. Le texte est limité à 50 000 caractères.'},400);
  for(const asset of assets)if(!await db.prepare('SELECT id FROM blog_media WHERE id=?').bind(asset).first())return reply({error:'Une image est introuvable. Ajoute-la à nouveau avant d’enregistrer.'},400);
  const old=p.id?await db.prepare('SELECT * FROM posts WHERE id=?').bind(p.id).first():null;if(p.id&&!old)return reply({error:'Billet introuvable.'},404);
  const id=old?.id||crypto.randomUUID();const published=p.status==='published'?(old?.published_at||now):old?.published_at||null;
  const json=JSON.stringify(content),coverJson=cover?JSON.stringify(cover):null;
  await db.batch([
   db.prepare('INSERT INTO posts(id,title,body,status,created_at,updated_at,published_at,content_json,cover_json) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,body=excluded.body,status=excluded.status,updated_at=excluded.updated_at,published_at=excluded.published_at,content_json=excluded.content_json,cover_json=excluded.cover_json').bind(id,p.title.trim(),body,p.status,old?.created_at||now,now,published,json,coverJson),
   db.prepare('INSERT INTO post_revisions(id,post_id,title,body,status,created_at,content_json,cover_json) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),id,p.title.trim(),body,p.status,now,json,coverJson),
   db.prepare('DELETE FROM post_media WHERE post_id=?').bind(id),
   ...assets.map(asset=>db.prepare('INSERT INTO post_media(post_id,media_id) VALUES(?,?)').bind(id,asset))
  ]);
  return reply({post:await db.prepare('SELECT * FROM posts WHERE id=?').bind(id).first()});
 }
 if(path==='/admin/invite'){
  const old=await db.prepare('SELECT id FROM invitations WHERE id=?').bind(p.id||'').first();if(!old)return reply({error:'Invitation introuvable.'},404);
  if(p.rotate===true)await db.prepare('UPDATE invitations SET token=?,active=1 WHERE id=?').bind(crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-',''),p.id).run();
  else if(typeof p.active==='boolean')await db.prepare('UPDATE invitations SET active=? WHERE id=?').bind(p.active?1:0,p.id).run();
  else return reply({error:'Action invalide.'},400);return reply({ok:true});
 }
 if(path==='/admin/comment'){await db.prepare('UPDATE comments SET hidden=? WHERE id=?').bind(p.hidden?1:0,p.id||'').run();return reply({ok:true});}
 if(!['/blog','/comments','/comment'].includes(path))return null;

 if(path==='/blog'){const posts=await db.prepare("SELECT id,title,body,published_at,content_json,cover_json FROM posts WHERE status='published' ORDER BY published_at DESC").all();return reply({posts:posts.results});}
 const post=await db.prepare("SELECT id FROM posts WHERE id=? AND status='published'").bind(p.post_id||'').first();if(!post)return reply({error:'Billet indisponible.'},404);
 if(path==='/comments'){const rows=await db.prepare('SELECT id,name,body,created_at FROM comments WHERE post_id=? AND hidden=0 ORDER BY created_at').bind(post.id).all();return reply({comments:rows.results});}
 if(!valid(p.name,80)||!valid(p.body,3000))return reply({error:'Indique ton prénom et un commentaire (3 000 caractères maximum).'},400);
 const key=now.slice(0,10)+':comment:'+p.visitor_key;const rate=await db.prepare('INSERT INTO daily_access(key,count) VALUES(?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<20 RETURNING count').bind(key).first();if(!rate)return reply({error:'Vingt commentaires suffisent pour aujourd’hui ; tu pourras poursuivre demain.'},429);
 const id=crypto.randomUUID();await db.prepare('INSERT INTO comments(id,post_id,invite_id,name,body,created_at) VALUES(?,?,?,?,?,?)').bind(id,post.id,p.visitor_key,p.name.trim(),p.body.trim(),now).run();return reply({ok:true,id});
}
