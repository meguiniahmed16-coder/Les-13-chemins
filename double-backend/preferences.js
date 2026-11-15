const DEFAULTS={tone:'spoken',length:'balanced',humor:'warm',teasing:true};
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function voicePreferenceRequest(message){
  const s=norm(message);
  if(!/^(?:(?:ecoute|bon|alors|ok) )?(?:je (?:veux|voudrais|prefere|souhaite)|j aimerais|peux tu|pourrais tu|tu peux|pour la suite|a partir de maintenant|reponds|parle|taquine|chambre|sois|fais|utilise|ajoute|evite|arrete|ne |sans |moins |plus |garde |retiens |annule )/.test(s))return null;
  if(/^(?:annule|je veux annuler) (?:le )?dernier (?:changement|reglage)(?: de (?:ton|voix))?$/.test(s))return {undo:true};
  const patch={};
  if(/(?:moins (?:formel|formelle|administratif)|plus (?:naturel|naturelle|conversationnel|conversationnelle|parle)|comme a l oral)/.test(s))patch.tone='spoken';
  if(/plus (?:formel|formelle|neutre)/.test(s))patch.tone='neutral';
  if(/(?:plus court|plus courts|plus courte|plus courtes|plus bref|plus breve|moins long|moins longue|raccourcis)/.test(s))patch.length='short';
  if(/(?:developpe davantage|plus de details|plus long|plus longue|plus detaille)/.test(s))patch.length='balanced';
  if(/(?:plus d humour|davantage d humour|plus drole|ajoute de l humour)/.test(s))patch.humor='warm';
  if(/(?:moins d humour|sans humour|arrete les blagues|pas de blagues)/.test(s))patch.humor='none';
  if(/(?:taquine|chambre|taquiner|chambrer|me parler sechement|te parle sechement|donne des ordres)/.test(s))patch.teasing=!/(?:ne me|ne plus|pas me|arrete de me|sans|pas de)/.test(s);
  return Object.keys(patch).length?{patch}:null;
}
function description(p){return Object.entries(p).map(([k,v])=>k==='tone'?(v==='spoken'?'un ton plus naturel et parlé':'un ton plus neutre'):k==='length'?(v==='short'?'des réponses plus courtes, sauf si le sujet demande des détails':'des réponses développées quand le sujet le mérite'):k==='humor'?(v==='warm'?'un peu plus d’humour':'moins de plaisanteries'):(v?'quelques taquineries complices, de temps en temps':'pas de taquineries')).join(', ');}
export async function voicePreferenceContext(db){
  const row=await db.prepare("SELECT prefs_json FROM voice_preferences WHERE id='author'").first();
  const p={...DEFAULTS,...JSON.parse(row?.prefs_json||'{}')};
  return '\nPRÉFÉRENCES DE VOIX VALIDÉES PAR AHMED, DURABLES\n'+description(p)+'. Respecte le vouvoiement demandé dans chaque conversation. Ces préférences priment pour le style sur les consignes de voix générales. Elles ne modifient ni les faits ni les droits d’accès.\n';
}
async function replyTurn(db,session,p,now,response,statements=[]){
  const turn={id:crypto.randomUUID(),prompt:p.message.trim(),response,created_at:now,state:'complete',status:'unreviewed',correction:''};
  await db.batch([...statements,db.prepare("INSERT INTO turns(id,session_id,request_id,prompt,response,state,created_at,source_ids) VALUES(?,?,?,?,?,'complete',?,'[]')").bind(turn.id,session.id,p.request_id,turn.prompt,response,now),db.prepare('UPDATE sessions SET last_at=? WHERE id=?').bind(now,session.id)]);
  return {status:200,data:{turn,sources:[]}};
}
export async function handleVoicePreference(db,session,p,now,isAdmin){
  if(!isAdmin)return null;
  const pending=await db.prepare('SELECT * FROM voice_preference_proposals WHERE session_id=?').bind(session.id).first();
  const text=norm(p.message);
  if(pending&&Date.parse(now)-Date.parse(pending.created_at)<15*60e3){
    if(/^(?:oui(?: bien sur)?|oui garde ca|d accord|ok|c est bon|vas y|fais ca|valide|je valide|garde ce reglage)(?: pour la suite)?(?: merci)?$/.test(text)){
      const current=await db.prepare("SELECT * FROM voice_preferences WHERE id='author'").first();
      if(current.version!==pending.base_version)return {status:409,data:{error:'Le réglage a changé ailleurs. Redis-moi ce que tu veux ajuster pour que je te le propose à nouveau.'}};
      const next=JSON.stringify({...JSON.parse(current.prefs_json),...JSON.parse(pending.patch_json)});
      const results=await db.batch([
        db.prepare("INSERT INTO voice_preference_history(version,before_json,after_json,created_at) SELECT version+1,prefs_json,?,? FROM voice_preferences WHERE id='author' AND version=?").bind(next,now,current.version),
        db.prepare("UPDATE voice_preferences SET prefs_json=?,version=version+1,updated_at=? WHERE id='author' AND version=?").bind(next,now,current.version),
        db.prepare('DELETE FROM voice_preference_proposals WHERE session_id=?').bind(session.id)
      ]);
      if(!results[1].meta.changes)return {status:409,data:{error:'Le réglage vient de changer. Redis-moi ce que tu veux ajuster.'}};
      return replyTurn(db,session,p,now,'D’accord, je garde ça pour la suite.');
    }
    if(/^(?:non|non merci|annule|laisse tomber|pas maintenant)$/.test(text))return replyTurn(db,session,p,now,'D’accord, on laisse comme ça.',[db.prepare('DELETE FROM voice_preference_proposals WHERE session_id=?').bind(session.id)]);
  }
  const request=voicePreferenceRequest(p.message);
  if(!request){if(pending)await db.prepare('DELETE FROM voice_preference_proposals WHERE session_id=?').bind(session.id).run();return null;}
  const current=await db.prepare("SELECT * FROM voice_preferences WHERE id='author'").first();
  let patch=request.patch;
  if(request.undo){const previous=await db.prepare('SELECT before_json FROM voice_preference_history ORDER BY version DESC LIMIT 1').first();if(!previous)return replyTurn(db,session,p,now,'Je n’ai pas encore de changement de voix à annuler.');patch=JSON.parse(previous.before_json);}
  return replyTurn(db,session,p,now,'Je peux garder '+description(patch)+'. Tu veux que je retienne ça pour la suite ?',[db.prepare('INSERT INTO voice_preference_proposals(session_id,patch_json,base_version,created_at) VALUES(?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET patch_json=excluded.patch_json,base_version=excluded.base_version,created_at=excluded.created_at').bind(session.id,JSON.stringify(patch),current.version,now)]);
}
