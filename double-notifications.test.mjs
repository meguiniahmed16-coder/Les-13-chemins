import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {recordVisit,sendVisitMail,notificationSettings,updateNotificationSettings,sendDailyDigest,digestSlot} from './double-backend/visits.js';
function fixture({configured=true,fail=false}={}){
 const db=new DatabaseSync(':memory:');
 db.exec("CREATE TABLE visits(id TEXT PRIMARY KEY,browser_hash TEXT NOT NULL,page TEXT NOT NULL,created_at TEXT NOT NULL,last_at TEXT NOT NULL,mail_state TEXT NOT NULL DEFAULT 'pending',mail_id TEXT);");
 db.exec(readFileSync(new URL('./double-backend/notification-schema.sql',import.meta.url),'utf8'));
 const DB={prepare(sql){const st=db.prepare(sql);function bound(params=[]){return {bind(...p){return bound(p);},async first(){return st.get(...params)||null;},async all(){return {results:st.all(...params)};},async run(){return {meta:{changes:Number(st.run(...params).changes)}};}};}return bound();},async batch(stmts){return Promise.all(stmts.map(s=>s.run()));}};
 const sent=[];const env={DB,...(configured?{VISIT_EMAIL_FROM:'visits@example.com',VISIT_EMAIL_TO:'owner@example.com',VISIT_EMAIL:{async send(message){sent.push(message);if(fail)throw Error('uncertain');return {messageId:'mail-'+sent.length};}}}:{})};
 return {db,DB,env,sent};
}
const now='2026-11-15T17:00:00.000Z', later='2026-11-15T17:01:00.000Z';
test('default is per visit; a navigation or concurrent notification cannot cause duplicate mail',async()=>{
 const f=fixture();assert.equal((await notificationSettings(f.DB)).mode,'immediate');
 const v=await recordVisit(f.DB,'browser','/',now);assert.equal(v.fresh,true);
 assert.equal((await recordVisit(f.DB,'browser','/blog',later)).fresh,false);
 await Promise.all([sendVisitMail(f.env,v.id),sendVisitMail(f.env,v.id)]);assert.equal(f.sent.length,1);assert.match(f.sent[0].text,/netlify.app\/admin-blog.html/);
 const next=await recordVisit(f.DB,'browser','/blog','2026-11-15T18:00:00.000Z');await sendVisitMail(f.env,next.id);assert.equal(f.sent.length,2);
});
test('mode persists, rejects invalid/stale changes, and off records visits without mail',async()=>{
 const f=fixture();assert.equal((await updateNotificationSettings(f.DB,'invalid',1,now)).status,400);
 assert.equal((await updateNotificationSettings(f.DB,'off',1,now)).status,200);
 assert.equal((await notificationSettings(f.DB)).mode,'off');
 assert.equal((await updateNotificationSettings(f.DB,'daily',1,now)).status,409);
 const v=await recordVisit(f.DB,'new','/',later);await sendVisitMail(f.env,v.id);assert.equal(f.sent.length,0);assert.equal(f.db.prepare('SELECT mail_state FROM visits').get().mail_state,'disabled');
});
test('daily mail runs once at 19h Paris including DST, groups visits and ignores repeated ticks',async()=>{
 assert.equal(digestSlot('2026-07-15T17:00:00Z'),'2026-07-15');assert.equal(digestSlot('2026-11-15T18:00:00Z'),'2026-11-15');assert.equal(digestSlot('2026-11-15T17:00:00Z'),null);
 const f=fixture();await updateNotificationSettings(f.DB,'daily',1,now);
 for(const b of ['one','two']){const v=await recordVisit(f.DB,b,'/',later);await sendVisitMail(f.env,v.id);}
 assert.equal(f.sent.length,0);await Promise.all([sendDailyDigest(f.env,Date.parse('2026-11-15T18:00:00Z')),sendDailyDigest(f.env,Date.parse('2026-11-15T18:00:00Z'))]);assert.equal(f.sent.length,1);assert.match(f.sent[0].text,/2 nouvelle/);assert.equal(f.db.prepare("SELECT count(*) AS n FROM visits WHERE mail_state='digest_accepted'").get().n,2);
 await sendDailyDigest(f.env,Date.parse('2026-11-16T18:00:00Z'));assert.equal(f.sent.length,1);
});
test('changing frequency cancels old queues and never replays blocked or uncertain mail',async()=>{
 const f=fixture({configured:false});const v=await recordVisit(f.DB,'one','/',now);await sendVisitMail(f.env,v.id);assert.equal(f.db.prepare('SELECT mail_state FROM visits').get().mail_state,'blocked');
 await updateNotificationSettings(f.DB,'daily',1,later);await recordVisit(f.DB,'two','/','2026-11-15T17:02:00Z');await updateNotificationSettings(f.DB,'immediate',2,'2026-11-15T17:03:00Z');assert.equal(f.db.prepare("SELECT count(*) AS n FROM visits WHERE mail_state='daily_pending'").get().n,0);
 const failed=fixture({fail:true});const x=await recordVisit(failed.DB,'one','/',now);await sendVisitMail(failed.env,x.id);await sendVisitMail(failed.env,x.id);assert.equal(failed.sent.length,1);assert.equal(failed.db.prepare('SELECT mail_state FROM visits').get().mail_state,'failed');
});
