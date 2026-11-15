import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {normalizeDoc,normalizeCover,plainDoc,renderDoc,docText,mediaIds} from './blog-content.js';
import {blogPost} from './double-backend/blog.js';
import {readImage,uploadImage} from './double-backend/media.js';
const imageId='11111111-2222-3333-4444-555555555555.webp';
const image={src:'/media/'+imageId,alt:'Photo <test>',caption:'Une légende',layout:'left',width:45,frame:'paper',ratio:'square',x:20,y:30};
function fixture(){const database=new DatabaseSync(':memory:');database.exec(`CREATE TABLE posts(id TEXT PRIMARY KEY,title TEXT,body TEXT,status TEXT,created_at TEXT,updated_at TEXT,published_at TEXT);CREATE TABLE post_revisions(id TEXT PRIMARY KEY,post_id TEXT,title TEXT,body TEXT,status TEXT,created_at TEXT);`);database.exec(readFileSync(new URL('./double-backend/rich-blog-schema.sql',import.meta.url),'utf8'));
 const DB={prepare(sql){const st=database.prepare(sql);function bound(params=[]){return{bind(...args){return bound(args);},async first(){return st.get(...params)||null;},async all(){return {results:st.all(...params)};},async run(){return {meta:{changes:Number(st.run(...params).changes)}};}};}return bound();},async batch(statements){database.exec('BEGIN');try{const result=[];for(const st of statements)result.push(await st.run());database.exec('COMMIT');return result;}catch(e){database.exec('ROLLBACK');throw e;}}};
 const objects=new Map();const BLOG_IMAGES={async put(key,bytes){objects.set(key,bytes);},async get(key){const bytes=objects.get(key);return bytes?{body:bytes,size:bytes.length}:null;},async delete(key){objects.delete(key);}};
 return {DB,database,objects,env:{DB,BLOG_IMAGES}};}
const reply=(d,status=200)=>Response.json(d,{status});
test('rich document renders allowed formatting and escapes all stored strings',()=>{
 const doc=normalizeDoc({type:'doc',content:[{type:'heading',attrs:{level:2,textAlign:'center'},content:[{type:'text',text:'<script>alert(1)</script>',marks:[{type:'bold'},{type:'link',attrs:{href:'javascript:alert(1)'}}]}]},{type:'image',attrs:image}]});const html=renderDoc(doc);assert.match(html,/text-align:center/);assert.match(html,/<strong>&lt;script&gt;/);assert.ok(!html.includes('javascript:'));assert.match(html,/frame-paper/);assert.match(html,/layout-left/);assert.match(html,/--image-width:45%/);assert.deepEqual(mediaIds(doc,null),[imageId]);
 assert.throws(()=>normalizeDoc({type:'doc',content:[{type:'iframe'}]}));assert.throws(()=>normalizeDoc({type:'doc',content:[{type:'image',attrs:{src:'https://evil.example/x.svg'}}]}));
});
test('legacy paragraphs stay readable and rich plain text remains available to the chat',()=>{const doc=plainDoc('Bonjour\nune ligne\n\nSecond paragraphe.');assert.match(renderDoc(doc),/Bonjour<br>une ligne/);assert.match(renderDoc(doc),/<p[^>]*>Second paragraphe/);assert.equal(docText(doc),'Bonjour\nune ligne\nSecond paragraphe.');assert.equal(normalizeCover(image).ratio,'banner');});
test('save and reload formatted draft, image captions, crop and revisions; draft media cannot be fetched publicly',async()=>{
 const f=fixture();f.database.prepare('INSERT INTO blog_media VALUES(?,?,?,?,?)').run(imageId,'blog/'+imageId,'image/webp',20,'2026-11-15');f.objects.set('blog/'+imageId,new Uint8Array(20));
 const content={type:'doc',content:[{type:'paragraph',attrs:{textAlign:'justify'},content:[{type:'text',text:'Un brouillon privé.',marks:[{type:'italic'}]}]},{type:'image',attrs:image}]};
 let r=await blogPost('/admin/blog',{title:'Le billet',content,cover:image,status:'draft'},f.DB,true,'2026-11-15T17:00:00Z',reply);assert.equal(r.status,200);const post=(await r.json()).post;assert.equal(post.status,'draft');assert.equal(JSON.parse(post.content_json).content[1].attrs.caption,'Une légende');assert.equal(JSON.parse(post.cover_json).x,20);assert.equal(f.database.prepare('SELECT count(*) AS n FROM post_revisions').get().n,1);
 assert.equal((await readImage(imageId,f.env)).status,404);assert.equal((await readImage(imageId,f.env,true)).status,200);
 r=await blogPost('/blog',{},f.DB,false,'2026-11-15',reply);assert.equal((await r.json()).posts.length,0);
 r=await blogPost('/admin/blog',{id:post.id,title:post.title,content,cover:image,status:'published'},f.DB,true,'2026-11-15T18:00:00Z',reply);assert.equal(r.status,200);assert.equal((await readImage(imageId,f.env)).status,200);
 r=await blogPost('/blog',{},f.DB,false,'2026-11-15',reply);assert.equal(JSON.parse((await r.json()).posts[0].cover_json).y,30);
 r=await blogPost('/admin/blog',{id:post.id,title:post.title,content,cover:image,status:'draft'},f.DB,true,'2026-11-15T18:01:00Z',reply);assert.equal(r.status,200);assert.equal((await readImage(imageId,f.env)).status,404);
});
test('upload bounds and media signature are enforced, and editor cannot save missing assets',async()=>{
 const f=fixture();let r=await uploadImage(new Request('https://site.test/upload',{method:'POST',headers:{'content-type':'image/webp'},body:'<svg>bad</svg>'}),f.env);assert.equal(r.status,415);assert.equal(f.objects.size,0);
 const bytes=new Uint8Array(32);bytes.set(new TextEncoder().encode('RIFF'));bytes.set(new TextEncoder().encode('WEBP'),8);r=await uploadImage(new Request('https://site.test/upload',{method:'POST',headers:{'content-type':'image/webp'},body:bytes}),f.env);assert.equal(r.status,200);const saved=await r.json();assert.match(saved.src,/^\/media\//);assert.equal(f.objects.size,1);
 r=await blogPost('/admin/blog',{title:'Invalide',content:{type:'doc',content:[{type:'image',attrs:image}]},status:'draft'},f.DB,true,'2026-11-15',reply);assert.equal(r.status,400);
 r=await blogPost('/admin/blog',{title:'Interdit',body:'Non',status:'published'},f.DB,false,'2026-11-15',reply);assert.equal(r.status,401);
});
