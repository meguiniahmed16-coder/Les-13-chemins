// Only a direct request in the current user message can trigger this action.
// Model replies, quoted instructions and previous messages cannot archive anything.
function normalizeArchiveText(message){return String(message).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
export function parseArchiveRequest(message) {
  let text=normalizeArchiveText(message);
  const range=/^(.*?) (?:a partir de|depuis) (.+)$/.exec(text);
  const startText=range?.[2]?.replace(/ s il (?:te|vous) plait$/, '')||null;
  if(range)text=range[1];
  const bare=/^(?:archive|archivez|sauvegarde|sauvegardez)(?: s il (?:te|vous) plait)?$/.test(text);
  if(bare)return {startText,bare:true,whole:false};
  const lead='(?:(?:ecoute|bon|ok|oui|alors) )?';
  const infinitive='(?:archiver|garder|conserver|sauvegarder|enregistrer|mettre de cote)';
  const request='(?:archive|archivez|garde|gardez|conserve|conservez|sauvegarde|sauvegardez|enregistre|enregistrez|mets de cote|mettez de cote|(?:peux tu|pourrais tu|pouvez vous|pourriez vous|tu peux|vous pouvez) (?:me )?'+infinitive+'|(?:je veux|je voudrais|je souhaite|j aimerais) (?:'+infinitive+'|que (?:tu (?:archives|gardes|conserves|sauvegardes|enregistres|mettes de cote)|vous (?:archiviez|gardiez|conserviez|sauvegardiez|enregistriez|mettiez de cote))))';
  const object='(?:toute )?(?:cette|notre|la|ce|le) (?:conversation|discussion|dialogue)|(?:tout )?(?:cet|notre|l) echange|(?:tous )?(?:ces|nos|les) echanges|ca|cela|tout ca|ce dialogue|ce qu on vient de dire';
  const place='(?: (?:dans|sur) (?:le|mon|ton|l) (?:back office|backoffice|administration|espace administrateur|espace d administration))?';
  const polite='(?: s il (?:te|vous) plait)?(?: merci)?';
  return new RegExp('^'+lead+request+' (?:'+object+')(?: entre nous)?(?: pour (?:plus tard|y revenir|la prochaine fois))?'+place+polite+'$').test(text)?{startText,bare:false,whole:/\b(?:toute|tout|tous)\b/.test(text)}:null;
}

export function isArchiveRequest(message){return parseArchiveRequest(message)!==null;}

export async function archiveChat(db,session,p,now,existing) {
  const rows=await db.prepare('SELECT id,prompt,response,state,review,correction,created_at FROM turns WHERE session_id=? ORDER BY created_at ASC,rowid ASC').bind(session.id).all();
  if(rows.results.length>=140)return {status:429,data:{error:'Cette conversation a atteint sa limite. Son archive reste disponible ; ouvre une nouvelle conversation pour continuer.'}};
  if(rows.results.some(t=>t.state==='pending'))return {status:409,data:{error:'Une réponse est encore en préparation. Attends sa fin, puis redemande l’archivage.'}};
  const instruction=parseArchiveRequest(p.message);
  let startText=instruction?.startText;
  if(instruction?.bare&&!startText){for(const t of rows.results.slice(-4).reverse()){const previous=parseArchiveRequest(t.prompt);if(previous?.startText){startText=previous.startText;break;}}}
  let startIndex=0;
  if(startText){
    const matches=rows.results.map((t,index)=>({t,index})).filter(({t})=>!isArchiveRequest(t.prompt)&&normalizeArchiveText(t.prompt+' '+t.response).includes(startText));
    if(!matches.length)return {status:400,data:{error:'Je ne retrouve pas ce passage. Donne-moi quelques mots exacts du début à garder.'}};
    if(matches.length>1)return {status:400,data:{error:'Je retrouve ces mots à plusieurs endroits. Précise un peu le début du passage à garder.'}};
    startIndex=matches[0].index;
  }else if(!instruction?.whole){
    const previous=await db.prepare('SELECT transcript_json FROM conversation_archives WHERE session_id=?').bind(session.id).first();
    if(previous){const first=JSON.parse(previous.transcript_json)[0]?.id;const found=rows.results.findIndex(t=>t.id===first);if(found>=0)startIndex=found;}
  }
  const selected=rows.results.slice(startIndex);
  const address=session.address_mode==='vous';
  const confirmations=address?['C’est gardé. Vous le retrouverez dans Archives.','Voilà, c’est gardé.','C’est bon, je l’ai gardé.']:['C’est gardé. Tu le retrouveras dans Archives.','Voilà, c’est gardé.','C’est bon, je l’ai gardé.'];
  const response=confirmations[rows.results.filter(t=>isArchiveRequest(t.prompt)).length%confirmations.length];
  const turn={id:existing?.id||crypto.randomUUID(),prompt:p.message.trim(),response,created_at:existing?.created_at||now,state:'complete',review:'unreviewed',correction:''};
  const transcript=selected.filter(t=>t.id!==turn.id).concat(turn);
  const title=(selected.find(t=>!isArchiveRequest(t.prompt))?.prompt||'Conversation avec Ahmed numérique').replace(/\s+/g,' ').slice(0,120);
  // All three writes commit together. Success is never announced before commit.
  await db.batch([
    existing?db.prepare("UPDATE turns SET response=?,state='complete',source_ids='[]' WHERE id=? AND state='error'").bind(response,turn.id):db.prepare("INSERT INTO turns(id,session_id,request_id,prompt,response,state,created_at,source_ids) VALUES(?,?,?,?,?,'complete',?,'[]')").bind(turn.id,session.id,p.request_id,turn.prompt,response,now),
    db.prepare('INSERT INTO conversation_archives(session_id,title,kind,created_at,archived_at,turn_count,transcript_json) VALUES(?,?,?,?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET title=excluded.title,archived_at=excluded.archived_at,turn_count=excluded.turn_count,transcript_json=excluded.transcript_json').bind(session.id,title,session.kind,session.created_at,now,transcript.length,JSON.stringify(transcript)),
    db.prepare('UPDATE sessions SET last_at=? WHERE id=?').bind(now,session.id)
  ]);
  return {status:200,data:{turn:{...turn,status:turn.review},sources:[],archived:true}};
}

export async function readArchives(db,url) {
  const id=url.searchParams.get('session_id');
  if(id){
    if(id.length>80)return {status:400,data:{error:'Conversation invalide.'}};
    const archive=await db.prepare('SELECT * FROM conversation_archives WHERE session_id=?').bind(id).first();
    if(!archive)return {status:404,data:{error:'Archive introuvable.'}};
    const current=await db.prepare('SELECT id,review,correction FROM turns WHERE session_id=?').bind(id).all();
    const reviews=new Map(current.results.map(t=>[t.id,t]));
    const {transcript_json,published_json,...metadata}=archive;
    return {status:200,data:{archive:{...metadata,turns:JSON.parse(transcript_json).map(t=>({...t,...reviews.get(t.id)}))}}};
  }
  let cursor=['9999',''];
  const before=url.searchParams.get('before');
  if(before){try{const value=JSON.parse(atob(before));if(!Array.isArray(value)||value.length!==2||value.some(v=>typeof v!=='string'||v.length>100))throw new Error();cursor=value;}catch{return {status:400,data:{error:'Page d’archives invalide.'}};}}
  const rows=await db.prepare('SELECT session_id,title,kind,created_at,archived_at,turn_count,published_at,published_archive_at FROM conversation_archives WHERE archived_at<? OR (archived_at=? AND session_id<?) ORDER BY archived_at DESC,session_id DESC LIMIT 31').bind(cursor[0],cursor[0],cursor[1]).all();
  return {status:200,data:{archives:rows.results.slice(0,30),next:rows.results.length>30?btoa(JSON.stringify([rows.results[29].archived_at,rows.results[29].session_id])):null}};
}

export async function publishArchive(db,p,now) {
  if(typeof p.session_id!=='string'||p.session_id.length>80||typeof p.publish!=='boolean')return {status:400,data:{error:'Demande de publication invalide.'}};
  if(p.publish&&p.speaker_confirmed!==true)return {status:400,data:{error:'Confirme que tu es l’interlocuteur de ce dialogue avant de le publier.'}};
  const result=await readArchives(db,new URL('https://internal/admin/archives?session_id='+encodeURIComponent(p.session_id)));
  if(result.status!==200)return result;
  const archive=result.data.archive;
  if(p.archived_at!==archive.archived_at)return {status:409,data:{error:'L’archive a été mise à jour. Rouvre-la avant de publier.'}};
  const turns=archive.turns.filter(t=>t.state==='complete'&&!isArchiveRequest(t.prompt)).map(t=>({prompt:t.prompt,response:t.correction||t.response,created_at:t.created_at}));
  if(p.publish&&!turns.length)return {status:400,data:{error:'Cette archive ne contient pas encore de dialogue à publier.'}};
  const changed=await db.prepare('UPDATE conversation_archives SET published_json=?,published_at=?,published_archive_at=? WHERE session_id=? AND archived_at=?').bind(p.publish?JSON.stringify(turns):null,p.publish?now:null,p.publish?archive.archived_at:null,p.session_id,p.archived_at).run();
  return changed.meta.changes?{status:200,data:{ok:true,published:p.publish}}:{status:409,data:{error:'L’archive vient de changer. Rouvre-la avant de réessayer.'}};
}

export async function publicDialogues(db,url) {
  let cursor=['',''];const raw=url.searchParams.get('after');
  if(raw){try{cursor=JSON.parse(atob(raw));if(!Array.isArray(cursor)||cursor.length!==2||cursor.some(x=>typeof x!=='string'||x.length>100))throw new Error();}catch{return {status:400,data:{error:'Page de dialogue invalide.'}};}}
  const rows=await db.prepare('SELECT session_id,created_at,published_json FROM conversation_archives WHERE published_json IS NOT NULL AND (created_at>? OR (created_at=? AND session_id>?)) ORDER BY created_at ASC,session_id ASC LIMIT 11').bind(cursor[0],cursor[0],cursor[1]).all();
  const page=rows.results.slice(0,10);
  return {status:200,data:{dialogues:page.map(a=>({date:a.created_at,turns:JSON.parse(a.published_json)})),next:rows.results.length>10?btoa(JSON.stringify([page[9].created_at,page[9].session_id])):null}};
}

export async function cleanupConversations(db,now=Date.now()) {
  const cutoff=new Date(now-90*864e5).toISOString();
  const expired='SELECT id FROM turns WHERE created_at<? AND session_id NOT IN (SELECT session_id FROM conversation_archives)';
  await db.batch([
    db.prepare('DELETE FROM review_events WHERE target_id IN ('+expired+')').bind(cutoff),
    db.prepare('DELETE FROM mail_items WHERE turn_id IN ('+expired+')').bind(cutoff),
    db.prepare('DELETE FROM turns WHERE id IN ('+expired+')').bind(cutoff),
    db.prepare('DELETE FROM sessions WHERE last_at<? AND id NOT IN (SELECT session_id FROM conversation_archives)').bind(cutoff),
    db.prepare('DELETE FROM daily_access WHERE key<?').bind(new Date(now-2*864e5).toISOString().slice(0,10))
  ]);
}
