/* Barcelone 3D — distribution des voix selon les voix du navigateur.
 * Les timbres réels dépendent des voix installées. Quand une seule est disponible,
 * hauteur et débit changent selon les personnages.
 */
export const VOICE_PROFILES=Object.freeze({
 vendeur:Object.freeze({lang:'fr-FR',gender:'male',pitch:.76,rate:.94}),
 c1:Object.freeze({lang:'fr-FR',gender:'female',pitch:1.25,rate:1.02}),
 c2:Object.freeze({lang:'fr-FR',gender:'male',pitch:.85,rate:1.10}),
 c3:Object.freeze({lang:'fr-FR',gender:'female',pitch:1.43,rate:.92}),
 c4:Object.freeze({lang:'fr-FR',gender:'male',pitch:.96,rate:1.14}),
 c5:Object.freeze({lang:'fr-FR',gender:'female',pitch:1.18,rate:1.08}),
 police1:Object.freeze({lang:'es-ES',gender:'male',pitch:.78,rate:1.14}),
 police2:Object.freeze({lang:'es-ES',gender:'female',pitch:1.33,rate:1.07})
});
export function voiceProfile(role){
 return VOICE_PROFILES[role]||VOICE_PROFILES.vendeur;
}
const males=/(?:^|\b)(?:thomas|paul|jacques|henri|alain|daniel|nicolas|martin|hugo|francois|francois|yannick|antoine|eric|pierre|sebastien|pablo|jorge|diego|miguel|carlos|enrique|antonio|juan|manuel|raul|andres|alejandro|sergio|luis|david|alexandre|guy|remi|loic)(?:\b|$)/i;
const females=/(?:^|\b)(?:amelie|audrey|alice|marie|hortense|julie|lea|denise|sabine|sophie|celine|chantal|laura|lucia|monica|helena|elena|carmen|ines|ana|isabel|conchita|marta|sofia|claire|sylvie|isabelle|florence|virginie|caroline|pauline)(?:\b|$)/i;
export function voiceGender(voice){
 const explicit=String(voice?.gender||'').toLowerCase();
 if(explicit==='male'||explicit==='female')return explicit;
 const name=String(voice?.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(females.test(name))return 'female';
 if(males.test(name))return 'male';
 return 'unknown';
}
export function assignGameVoices(voices){
 const all=Array.isArray(voices)?voices.filter(Boolean):[];
 const out={},used=new Map();
 for(const [role,profile] of Object.entries(VOICE_PROFILES)){
  const wanted=profile.lang.toLowerCase(),prefix=wanted.split('-')[0];
  const exact=all.filter(v=>String(v.lang||'').replace('_','-').toLowerCase()===wanted);
  const pool=exact.length?exact:all.filter(v=>String(v.lang||'').toLowerCase().startsWith(prefix));
  // Ne pas forcer une voix française pour une interpellation espagnole :
  // en son absence, la synthèse système reçoit es-ES et choisit elle-même.
  if(!pool.length){out[role]=null;continue;}
  let best=null,bestScore=-Infinity;
  for(const candidate of pool){
   const gender=voiceGender(candidate);
   const same=gender===profile.gender;
   const count=used.get(candidate)||0;
   const score=(same?120:gender==='unknown'?40:0)-count*45+
    (candidate.localService?2:0)+(candidate.default?1:0);
   if(score>bestScore){best=candidate;bestScore=score;}
  }
  out[role]=best;
  used.set(best,(used.get(best)||0)+1);
 }
 return out;
}
