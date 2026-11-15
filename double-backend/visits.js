export const visitWindowMs = 30 * 60 * 1000;
export const mailConfigured = env => Boolean(env.VISIT_EMAIL && env.VISIT_EMAIL_FROM && env.VISIT_EMAIL_TO);
export async function recordVisit(db, browserHash, page, now) {
  const settings = await notificationSettings(db);
  const state = settings.mode === 'off' ? 'disabled' : settings.mode === 'daily' ? 'daily_pending' : 'pending';
  const cutoff = new Date(Date.parse(now) - visitWindowMs).toISOString();
  const id = crypto.randomUUID();
  const result = await db.prepare('INSERT INTO visits(id,browser_hash,page,created_at,last_at,mail_state) SELECT ?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM visits WHERE browser_hash=? AND last_at>?)').bind(id,browserHash,page,now,now,state,browserHash,cutoff).run();
  if (result.meta.changes) return { id, fresh: true };
  const previous = await db.prepare('SELECT id FROM visits WHERE browser_hash=? AND last_at>? ORDER BY last_at DESC LIMIT 1').bind(browserHash,cutoff).first();
  if (previous) await db.prepare('UPDATE visits SET last_at=? WHERE id=?').bind(now,previous.id).run();
  return { id: previous?.id, fresh: false };
}
export async function sendVisitMail(env, id) {
  const settings = await notificationSettings(env.DB);
  if (settings.mode !== 'immediate') return;
  if (!mailConfigured(env)) {
    await env.DB.prepare("UPDATE visits SET mail_state='blocked' WHERE id=? AND mail_state='pending'").bind(id).run();
    return;
  }
  const row = await env.DB.prepare("UPDATE visits SET mail_state='sending' WHERE id=? AND mail_state='pending' RETURNING *").bind(id).first();
  if (!row) return;
  try {
    const time = new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris',dateStyle:'full',timeStyle:'medium'}).format(new Date(row.created_at));
    const result = await env.VISIT_EMAIL.send({ from: env.VISIT_EMAIL_FROM, to: env.VISIT_EMAIL_TO, subject: 'Nouvelle visite — La tectonique des âmes', text: 'Une nouvelle visite a commencé le '+time+'.\nPage : '+row.page+'\n\nRetrouver les visites : https://tectonique-des-ames.netlify.app/admin-blog.html\n\nUne visite regroupe les ouvertures du même navigateur séparées de moins de 30 minutes. Le visiteur n’est pas identifié.' });
    await env.DB.prepare("UPDATE visits SET mail_state='accepted',mail_id=? WHERE id=?").bind(result?.messageId || '',id).run();
  } catch {
    // Unknown delivery is never replayed automatically, to avoid duplicate messages.
    await env.DB.prepare("UPDATE visits SET mail_state='failed' WHERE id=?").bind(id).run();
  }
}
export async function visitStats(env, now) {
  const since = new Date(Date.parse(now)-86400000).toISOString();
  const hour = new Date(Date.parse(now)-3600000).toISOString();
  const [total, hourly, pending, recent] = await Promise.all([
    env.DB.prepare('SELECT count(*) AS n FROM visits WHERE created_at>?').bind(since).first(),
    env.DB.prepare('SELECT count(*) AS n FROM visits WHERE created_at>?').bind(hour).first(),
    env.DB.prepare("SELECT count(*) AS n FROM visits WHERE mail_state IN ('blocked','pending','failed')").first(),
    env.DB.prepare('SELECT id,page,created_at,last_at,mail_state FROM visits ORDER BY created_at DESC LIMIT 50').all()
  ]);
  return { total24h: total.n, total1h: hourly.n, unusual: hourly.n>10||total.n>20, thresholds:{hour:10,day:20}, mailConfigured:mailConfigured(env), pending:pending.n, visits:recent.results };
}

export async function notificationSettings(db) {
  const row = await db.prepare("SELECT mode,version,updated_at FROM notification_settings WHERE id='visits'").first();
  if (!row) throw new Error('Notification settings missing');
  return {...row, dailyHour:19, timeZone:'Europe/Paris'};
}
export async function updateNotificationSettings(db, mode, version, now) {
  if (!['immediate','daily','off'].includes(mode) || !Number.isSafeInteger(version)) return {status:400,error:'Choisis une fréquence valide.'};
  const row = await db.prepare("UPDATE notification_settings SET mode=?,version=version+1,updated_at=? WHERE id='visits' AND version=? RETURNING mode,version,updated_at").bind(mode,now,version).first();
  if (!row) return {status:409,error:'Ce réglage a changé. Recharge la page avant de réessayer.'};
  // Changes apply to future visits. Never replay old blocked emails or a stale digest.
  await db.prepare("UPDATE visits SET mail_state='skipped' WHERE created_at<? AND mail_state IN ('pending','daily_pending')").bind(now).run();
  return {status:200,settings:{...row,dailyHour:19,timeZone:'Europe/Paris'}};
}
export function digestSlot(time) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(new Date(time)).map(p=>[p.type,p.value]));
  return parts.hour === '19' ? `${parts.year}-${parts.month}-${parts.day}` : null;
}
export async function sendDailyDigest(env, time=Date.now()) {
  const day=digestSlot(time);
  if (!day || (await notificationSettings(env.DB)).mode !== 'daily') return;
  // A missing sender leaves a clear blocked state, without claiming an email was sent.
  if (!mailConfigured(env)) {
    await env.DB.prepare("UPDATE visits SET mail_state='blocked' WHERE mail_state='daily_pending'").run();
    return;
  }
  const id='daily:'+day, now=new Date(time).toISOString();
  const claimed=await env.DB.prepare("INSERT OR IGNORE INTO visit_digests(id,created_at,state) VALUES(?,?,'sending')").bind(id,now).run();
  if (!claimed.meta.changes) return;
  // SQL claims a bounded snapshot; arrivals during sending stay for tomorrow.
  await env.DB.prepare("UPDATE visits SET mail_state='digest_sending',mail_id=? WHERE mail_state='daily_pending' AND created_at<=?").bind(id,now).run();
  const rows=await env.DB.prepare("SELECT page,count(*) AS n FROM visits WHERE mail_id=? GROUP BY page ORDER BY n DESC").bind(id).all();
  const count=rows.results.reduce((n,r)=>n+Number(r.n),0);
  await env.DB.prepare('UPDATE visit_digests SET visit_count=? WHERE id=?').bind(count,id).run();
  if (!count) {
    await env.DB.prepare("UPDATE visit_digests SET state='empty' WHERE id=?").bind(id).run();
    return;
  }
  try {
    const result=await env.VISIT_EMAIL.send({from:env.VISIT_EMAIL_FROM,to:env.VISIT_EMAIL_TO,subject:'Visites du jour — La tectonique des âmes',text:`${count} nouvelle(s) visite(s) depuis le dernier résumé ou l’activation du mode quotidien.\n\n${rows.results.map(r=>`${r.page} : ${r.n}`).join('\n')}\n\nVoir les visites et modifier la fréquence : https://tectonique-des-ames.netlify.app/admin-blog.html`});
    await env.DB.batch([
      env.DB.prepare("UPDATE visit_digests SET state='accepted',mail_id=? WHERE id=?").bind(result?.messageId||'',id),
      env.DB.prepare("UPDATE visits SET mail_state='digest_accepted' WHERE mail_id=? AND mail_state='digest_sending'").bind(id)
    ]);
  } catch {
    // An unknown result is never replayed automatically: this prevents duplicate emails.
    await env.DB.batch([
      env.DB.prepare("UPDATE visit_digests SET state='failed' WHERE id=?").bind(id),
      env.DB.prepare("UPDATE visits SET mail_state='failed' WHERE mail_id=? AND mail_state='digest_sending'").bind(id)
    ]);
  }
}
