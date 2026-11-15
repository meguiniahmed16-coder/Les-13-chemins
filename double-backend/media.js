const ID=/^[0-9a-f-]{36}\.webp$/;
const reply=(error,status)=>Response.json({error},{status,headers:{'cache-control':'no-store'}});
export async function uploadImage(request,env){
 if(!env.BLOG_IMAGES)return reply('Le stockage des images n’est pas disponible.',503);
 if(request.method!=='POST')return reply('Méthode non autorisée.',405);
 if(request.headers.get('content-type')!=='image/webp')return reply('Image WebP attendue.',415);
 const reader=request.body?.getReader();if(!reader)return reply('Image manquante.',400);
 const chunks=[];let size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>3*1024*1024){await reader.cancel();return reply('Image trop volumineuse.',413);}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 if(size<16||String.fromCharCode(...bytes.slice(0,4))!=='RIFF'||String.fromCharCode(...bytes.slice(8,12))!=='WEBP')return reply('Le fichier n’est pas une image WebP.',415);
 const id=crypto.randomUUID()+'.webp',key='blog/'+id,now=new Date().toISOString();
 await env.BLOG_IMAGES.put(key,bytes,{httpMetadata:{contentType:'image/webp'}});
 try{await env.DB.prepare('INSERT INTO blog_media(id,object_key,mime,size,created_at) VALUES(?,?,?,?,?)').bind(id,key,'image/webp',size,now).run();}catch(e){await env.BLOG_IMAGES.delete(key);throw e;}
 return Response.json({src:'/media/'+id},{headers:{'cache-control':'no-store'}});
}
export async function readImage(id,env,privateAccess=false){
 if(!ID.test(id))return reply('Image introuvable.',404);
 const row=privateAccess?await env.DB.prepare('SELECT * FROM blog_media WHERE id=?').bind(id).first():await env.DB.prepare("SELECT m.* FROM blog_media m WHERE m.id=? AND EXISTS (SELECT 1 FROM post_media pm JOIN posts p ON p.id=pm.post_id WHERE pm.media_id=m.id AND p.status='published')").bind(id).first();
 if(!row||!env.BLOG_IMAGES)return reply('Image introuvable.',404);
 const object=await env.BLOG_IMAGES.get(row.object_key);if(!object)return reply('Image introuvable.',404);
 return new Response(object.body,{headers:{'content-type':'image/webp','cache-control':'private, no-store','x-content-type-options':'nosniff','content-length':String(object.size)}});
}
