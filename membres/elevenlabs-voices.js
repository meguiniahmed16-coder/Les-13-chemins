// Pure voice selection shared by the cinematic and the interactive Salon.
// Never substitute a female voice for a male character, or vice versa.
const maleNames=/\b(?:george|adam|brian|daniel|henry|charlie|thomas|antoine|pierre|mathieu|nicolas|alexandre|oliver|arthur|liam|paul)\b/i;
const femaleNames=/\b(?:rachel|alice|jessica|sarah|bella|charlotte|matilda|lily|clara|marianne|amelie|julie|lea|louise|marie|emma|sophie)\b/i;
export function chooseElevenVoice(records,gender,exclude=[]){
 if(!Array.isArray(records)||!['homme','femme'].includes(gender))return null;
 const candidates=records.filter(v=>v&&typeof v.id==='string'&&/^[-A-Za-z0-9_]{1,80}$/.test(v.id)&&!exclude.includes(v.id));
 return candidates.find(v=>v.gender===gender)||
   candidates.find(v=>!v.gender&&(gender==='femme'?femaleNames:maleNames).test(v.name||''))||null;
}
export function selectIntroVoices(list){
 if(!Array.isArray(list))throw Error('La liste des voix ElevenLabs est indisponible.');
 const homme=chooseElevenVoice(list,'homme'),femme=chooseElevenVoice(list,'femme',homme?[homme.id]:[]);
 if(!homme||!femme)throw Error('Aucune paire de voix française masculine et féminine reconnue dans ElevenLabs. Ajoute ces deux voix à ton compte, puis relance.');
 return {m:homme.id,f:femme.id};
}
