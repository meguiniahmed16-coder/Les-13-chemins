// Shared metadata-based voice selection for the author cinematic and Salon.
// An unlabelled, multilingual voice is not evidence of a missing subscription.
const maleNames=/\b(?:george|adam|brian|daniel|henry|charlie|thomas|antoine|antoni|pierre|mathieu|mathis|nicolas|alexandre|oliver|arthur|liam|paul|john|james|josh|david|ryan|michael|robert|julian|bill|marc|luc|louis|hugo|gabriel|youssef|mohamed|ahmed)\b/i;
const femaleNames=/\b(?:rachel|alice|jessica|sarah|bella|charlotte|matilda|lily|clara|marianne|amelie|amélie|julie|lea|léa|louise|marie|emma|sophie|laura|evelyn|zoe|zoé|janet|maya|olivia|anna|camille|juliette|nora|ines|inès|isabelle)\b/i;
const maleWords=/\b(?:male|masculin|masculine|homme|man|masculino|masculina|masculin[ae])\b/i;
const femaleWords=/\b(?:female|feminine|féminin|feminina|femme|woman|girl|féminine)\b/i;
const frenchWords=/\b(?:fran[cç]ais(?:e)?|french|fr-fr|français|française|francais|francaise)\b/i;
export function voiceGender(voice){
 if(!voice||typeof voice!=='object')return '';
 if(['homme','femme'].includes(voice.gender))return voice.gender;
 const declared=String(voice.gender||voice.labels?.gender||'').trim().toLowerCase();
 if(/^(male|masculine|man|homme|masculin)$/.test(declared))return 'homme';
 if(/^(female|feminine|woman|femme|féminin|feminin)$/.test(declared))return 'femme';
 const description=String(voice.description||'');
 if(femaleWords.test(description)&&!maleWords.test(description))return 'femme';
 if(maleWords.test(description)&&!femaleWords.test(description))return 'homme';
 const name=String(voice.name||'');
 if(femaleNames.test(name)&&!maleNames.test(name))return 'femme';
 if(maleNames.test(name)&&!femaleNames.test(name))return 'homme';
 return '';
}
export function chooseElevenVoice(records,gender,exclude=[]){
 if(!Array.isArray(records)||!['homme','femme'].includes(gender))return null;
 const candidates=records.filter(v=>v&&typeof v.id==='string'&&/^[-A-Za-z0-9_]{1,80}$/.test(v.id)&&!exclude.includes(v.id)&&voiceGender(v)===gender);
 // Prefer voices marked French without excluding multilingual voices.
 return candidates.find(v=>frenchWords.test(String(v.description||'')+' '+String(v.name||'')))||candidates[0]||null;
}
export function selectIntroVoices(list,preferred=null){
 if(!Array.isArray(list))throw Error('La liste des voix est indisponible.');
 const valid=list.filter(v=>v&&typeof v.id==='string'&&/^[-A-Za-z0-9_]{1,80}$/.test(v.id));
 if(preferred&&valid.some(v=>v.id===preferred.m)&&valid.some(v=>v.id===preferred.f)&&preferred.m!==preferred.f){
  const man=valid.find(v=>v.id===preferred.m),woman=valid.find(v=>v.id===preferred.f);
  if(voiceGender(man)!=='femme'&&voiceGender(woman)!=='homme')return {m:man.id,f:woman.id};
 }
 const homme=chooseElevenVoice(valid,'homme'),femme=chooseElevenVoice(valid,'femme',homme?[homme.id]:[]);
 if(homme&&femme)return {m:homme.id,f:femme.id};
 if(!valid.length)throw Error('Le service vocal ne renvoie aucune voix disponible. Le logiciel ne te demande pas de créer de clé ou de voix : vérifie simplement que ton compte possède des voix utilisables.');
 if(valid.length===1)throw Error('Le service vocal ne renvoie qu’une seule voix disponible sur cette clé. Pour avoir Ahmed et Marianne avec deux voix différentes, ton compte doit en rendre deux accessibles.');
 const error=Error('Le site voit les voix du service, mais ne peut pas déterminer leur genre. Choisis ci-dessous une voix pour Ahmed et une pour Marianne.');
 error.code='VOICE_SELECTION_REQUIRED';
 throw error;
}
