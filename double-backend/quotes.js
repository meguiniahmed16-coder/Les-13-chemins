export async function quotedPrompt(db,sessionId,turnId,message){
  if(typeof turnId!=='string'||!turnId.trim()||turnId.length>100)return {error:'Citation invalide.',status:400};
  const source=await db.prepare("SELECT response FROM turns WHERE id=? AND session_id=? AND state='complete'").bind(turnId,sessionId).first();
  if(!source?.response)return {error:'Ce message ne peut pas être cité dans cette conversation.',status:404};
  return {prompt:'Citation d’Ahmed numérique :\n'+source.response.split('\n').map(line=>'> '+line).join('\n')+'\n\n'+message.trim()};
}
