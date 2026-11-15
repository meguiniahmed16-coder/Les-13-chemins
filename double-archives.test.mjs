import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {isArchiveRequest,archiveChat,readArchives,cleanupConversations,publishArchive,publicDialogues} from './double-backend/archives.js';
const workerSource=readFileSync(new URL('./double-backend/worker.js',import.meta.url),'utf8').replace("import BANK from './bank.js';","const BANK={version:'test',questions:[]};").replace(/from '\.\/([^']+)'/g,(_,name)=>"from '"+new URL('./double-backend/'+name,import.meta.url).href+"'");
const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(workerSource).toString('base64'));

function fixture(){
  const database=new DatabaseSync(':memory:');database.exec(`
    PRAGMA foreign_keys=ON;
    CREATE TABLE sessions(id TEXT PRIMARY KEY,token_hash TEXT,kind TEXT,created_at TEXT,last_at TEXT,consent_version TEXT,post_id TEXT,address_mode TEXT DEFAULT 'tu');
    CREATE TABLE turns(id TEXT PRIMARY KEY,session_id TEXT,request_id TEXT,prompt TEXT,response TEXT DEFAULT '',state TEXT DEFAULT 'pending',review TEXT DEFAULT 'unreviewed',correction TEXT DEFAULT '',source_ids TEXT DEFAULT '[]',created_at TEXT,reviewed_at TEXT,UNIQUE(session_id,request_id));
    CREATE TABLE review_events(id TEXT,target_id TEXT);CREATE TABLE mail_items(turn_id TEXT);CREATE TABLE daily_access(key TEXT,count INTEGER);CREATE TABLE memory(source_turn TEXT);
  `);database.exec(readFileSync(new URL('./double-backend/archive-schema.sql',import.meta.url),'utf8'));
  const DB={prepare(sql){const st=database.prepare(sql);function bound(params=[]){return {bind(...args){return bound(args);},async first(){return st.get(...params)||null;},async all(){return {results:st.all(...params)};},async run(){return {meta:{changes:Number(st.run(...params).changes)}};}};}return bound();},async batch(statements){database.exec('BEGIN');try{const results=[];for(const st of statements)results.push(await st.run());database.exec('COMMIT');return results;}catch(e){database.exec('ROLLBACK');throw e;}}};
  const session={id:'session-a',kind:'public',created_at:'2026-01-01T12:00:00Z',last_at:'2026-01-01T12:00:00Z',address_mode:'tu'};
  database.prepare('INSERT INTO sessions(id,kind,created_at,last_at) VALUES(?,?,?,?)').run(session.id,session.kind,session.created_at,session.last_at);
  database.prepare("INSERT INTO turns(id,session_id,request_id,prompt,response,state,created_at) VALUES('first',?,'first','Pourquoi écris-tu ?','Pour raconter.','complete',?)").run(session.id,session.created_at);
  return {database,DB,session};
}
const now='2026-11-15T18:00:00Z';
const command={message:'Je veux que tu archives cette conversation',request_id:'archive-1'};
test('recognizes direct spoken requests, but never quotations, negations, questions about capability or mixed instructions',()=>{
  for(const text of [command.message,'Garde ça pour plus tard','Conserve notre échange','Sauvegarde cette discussion','Peux-tu garder tout ça pour plus tard ?','Je voudrais que tu conserves cette conversation','Mets de côté notre échange','Archive cette conversation.','Peux-tu archiver notre discussion, s’il te plaît ?','Écoute, je voudrais que tu archives cette conversation dans le back office.','J’aimerais que tu archives nos échanges','Archivez cette conversation, merci'])assert.ok(isArchiveRequest(text),text);
  for(const text of ['Ne garde pas ça pour plus tard','Je veux garder mon chien','Il dit : garde ça pour plus tard','N’archive pas cette conversation','Je ne veux pas que tu archives cette conversation','Il dit « archive cette conversation »','Que signifie archiver cette conversation ?','Si je dis archive cette conversation, que fais-tu ?','Archive cette conversation et publie-la','Pourquoi archiver cette conversation ?','Archive toutes les conversations','Archive la conversation d’une autre personne'])assert.equal(isArchiveRequest(text),false,text);
});
test('archives whole transcript atomically, lists it, retains originals beside corrections, and updates only on renewed request',async()=>{
  const f=fixture();const result=await archiveChat(f.DB,f.session,command,now);assert.equal(result.status,200);assert.equal(result.data.archived,true);
  let detail=await readArchives(f.DB,new URL('https://test/admin/archives?session_id=session-a'));assert.equal(detail.data.archive.turns.length,2);assert.equal(detail.data.archive.turns[0].response,'Pour raconter.');assert.equal(detail.data.archive.turns[1].response,result.data.turn.response);
  f.database.prepare("UPDATE turns SET correction='Pour comprendre.',review='corrected' WHERE id='first'").run();detail=await readArchives(f.DB,new URL('https://test/admin/archives?session_id=session-a'));assert.equal(detail.data.archive.turns[0].response,'Pour raconter.');assert.equal(detail.data.archive.turns[0].correction,'Pour comprendre.');
  f.database.prepare("INSERT INTO turns(id,session_id,request_id,prompt,response,state,created_at) VALUES('next','session-a','next','Et ensuite ?','On continue.','complete','2026-11-15T18:01:00Z')").run();
  detail=await readArchives(f.DB,new URL('https://test/admin/archives?session_id=session-a'));assert.equal(detail.data.archive.turns.length,2);
  await archiveChat(f.DB,f.session,{...command,request_id:'archive-2'},'2026-11-15T18:02:00Z');const list=await readArchives(f.DB,new URL('https://test/admin/archives'));assert.equal(list.data.archives.length,1);assert.equal(list.data.archives[0].turn_count,4);
});
test('never confirms storage failure and batch rollback leaves no false success in history',async()=>{
  const f=fixture();f.database.exec("CREATE TRIGGER fail_archive BEFORE INSERT ON conversation_archives BEGIN SELECT RAISE(ABORT,'test failure'); END;");
  await assert.rejects(()=>archiveChat(f.DB,f.session,command,now));assert.equal(f.database.prepare('SELECT count(*) n FROM turns').get().n,1);assert.equal(f.database.prepare('SELECT count(*) n FROM conversation_archives').get().n,0);
});
test('pending inference blocks archive rather than producing an incomplete snapshot',async()=>{
  const f=fixture();f.database.exec("UPDATE turns SET state='pending' WHERE id='first'");const r=await archiveChat(f.DB,f.session,command,now);assert.equal(r.status,409);assert.equal(f.database.prepare('SELECT count(*) n FROM conversation_archives').get().n,0);
});
test('90 day cleanup preserves archived sessions and their corrections but removes ordinary expired sessions',async()=>{
  const f=fixture();await archiveChat(f.DB,f.session,command,now);f.database.exec("INSERT INTO sessions(id,kind,created_at,last_at) VALUES('old','public','2026-01-01','2026-01-01');INSERT INTO turns(id,session_id,request_id,prompt,created_at) VALUES('old-turn','old','old','Expired','2026-01-01');");
  await cleanupConversations(f.DB,Date.parse('2027-05-01T00:00:00Z'));assert.equal(f.database.prepare('SELECT count(*) n FROM sessions').get().n,1);assert.equal(f.database.prepare('SELECT count(*) n FROM turns').get().n,2);assert.equal(f.database.prepare('SELECT count(*) n FROM conversation_archives').get().n,1);
});
test('chat action authenticates session, ignores client-supplied history, survives reload, retries once, and erase removes archive',async()=>{
  const f=fixture();const token='test-session-token';const hash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))).toString('hex');f.database.prepare('UPDATE sessions SET token_hash=? WHERE id=?').run(hash,f.session.id);
  let aiCalls=0;const env={DB:f.DB,AI:{async run(){aiCalls++;throw new Error('must not call model');}}};
  const req=(path,p)=>new Request('https://backend.test/'+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(p)});
  const p={...command,session_id:f.session.id,token,transcript:[{prompt:'FORGED',response:'forged'}]};
  assert.equal((await worker.fetch(req('chat',{...p,token:'wrong'}),env,{})).status,401);
  const r=await worker.fetch(req('chat',p),env,{});assert.equal(r.status,200);const data=await r.json();assert.equal(data.archived,true);assert.equal(aiCalls,0);
  const retry=await (await worker.fetch(req('chat',p),env,{})).json();assert.equal(retry.turn.id,data.turn.id);assert.equal(f.database.prepare('SELECT count(*) n FROM turns').get().n,2);
  assert.equal((await worker.fetch(new Request('https://backend.test/admin/archives'),env,{})).status,401);
  assert.equal((await worker.fetch(req('history',{session_id:f.session.id,token:'wrong'}),env,{})).status,401);
  const detail=await readArchives(f.DB,new URL('https://test/admin/archives?session_id=session-a'));assert.equal(JSON.stringify(detail).includes('FORGED'),false);
  const history=await (await worker.fetch(req('history',p),env,{})).json();assert.equal(history.turns.length,2);
  assert.equal((await worker.fetch(req('erase',p),env,{})).status,200);assert.equal(f.database.prepare('SELECT count(*) n FROM conversation_archives').get().n,0);assert.equal(f.database.prepare('SELECT count(*) n FROM turns').get().n,0);
});

test('public feed exposes only deliberately published dialogue and approved text, never archive commands or later private additions',async()=>{
  const f=fixture();await archiveChat(f.DB,f.session,command,now);
  const publicUrl=new URL('https://test/dialogues');assert.equal((await publicDialogues(f.DB,publicUrl)).data.dialogues.length,0);
  const p={session_id:f.session.id,publish:true,archived_at:now};
  assert.equal((await publishArchive(f.DB,p,now)).status,400);
  assert.equal((await publishArchive(f.DB,{...p,speaker_confirmed:true,archived_at:'stale'},now)).status,409);
  f.database.exec("UPDATE turns SET correction='Pour comprendre.',review='corrected' WHERE id='first'");
  assert.equal((await publishArchive(f.DB,{...p,speaker_confirmed:true},now)).status,200);
  let page=(await publicDialogues(f.DB,publicUrl)).data;assert.equal(page.dialogues[0].turns.length,1);assert.equal(page.dialogues[0].turns[0].response,'Pour comprendre.');assert.equal(JSON.stringify(page).includes('session-a'),false);assert.equal(JSON.stringify(page).includes('Pour raconter.'),false);assert.equal(JSON.stringify(page).includes('C’est archivé'),false);
  f.database.exec("INSERT INTO turns(id,session_id,request_id,prompt,response,state,created_at) VALUES('private-next','session-a','private-next','Confidential','Private','complete','2026-11-15T19:00:00Z')");
  await archiveChat(f.DB,f.session,{...command,message:'Garde ça pour plus tard',request_id:'second-archive'},'2026-11-15T19:01:00Z');
  page=(await publicDialogues(f.DB,publicUrl)).data;assert.equal(JSON.stringify(page).includes('Confidential'),false);
  assert.equal((await publishArchive(f.DB,{...p,publish:false,archived_at:'2026-11-15T19:01:00Z'},now)).status,200);assert.equal((await publicDialogues(f.DB,publicUrl)).data.dialogues.length,0);assert.equal(f.database.prepare('SELECT count(*) n FROM conversation_archives').get().n,1);
});

test('publication endpoint is author-only even with a visitor session',async()=>{
  const f=fixture();const env={DB:f.DB};const request=new Request('https://test/admin/archive-publication',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({session_id:f.session.id,publish:true,speaker_confirmed:true,archived_at:now})});assert.equal((await worker.fetch(request,env,{})).status,401);
});
