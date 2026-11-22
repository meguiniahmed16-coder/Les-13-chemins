const plain=text=>text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const phrases=[
  ['T’en es où pour la recherche d’appartement ?',.380,2.325],
  ['Viens fermer les volets.',2.945,4.130],
  ['Mais viens un peu plus près.',4.660,5.800],
  ['Oh, tu te moques de moi ?',6.480,8.495]
];
export function recordedPhrase(text){return phrases.find(p=>plain(p[0])===plain(text))?.slice(1);}
export function reactionAfter(text){
  const t=plain(text).replace('mort de rire','fou rire').replace('pleurer de rire','fou rire');
  if(!t||/\b(deces|deuil|mort|morte|enterrement|triste|tristesse|suicide|agression|maladie|souffre|peur|douleur|violence|chagrin|trauma|pleure|pleurer|grave)\b/.test(t))return null;
  if(/\b(fou rire|mort de rire|eclat de rire|hilarant|hahaha|ha ha ha|ahaha|tellement drole|tu me fais rire|pleurer de rire)\b/.test(t))return {name:'Rire de bon cœur',clip:[10.915,14.275],duration:3.36};
  if(/\b(tu te moques de moi|rire gene|je rougis|tu me taquines)\b/.test(t))return {name:'Rire gêné',clip:[8.735,9.915],duration:1.18};
  if(/\b(je t aime|tu me plais|je suis amoureux|je suis amoureuse)\b/.test(t))return {name:'Sourire amoureux',duration:5.22};
  if(/\b(je suis gene|je suis genee|je ne sais pas trop|c est embarrassant)\b/.test(t))return {name:'Sourire gêné',duration:4.38};
  if(/\b(quelle joie|excellente nouvelle|formidable|bravo|quelle bonne nouvelle)\b/.test(t))return {name:'Sourire éclatant',duration:4.22};
  if(/\b(merci|avec plaisir|heureux|heureuse|content|contente|gentil|gentille|ravi|ravie|bienvenue|bonjour|bonsoir)\b/.test(t))return {name:'Sourire',duration:3.62};
  return null;
}
export function reactionFor(cue,who){
  if(!cue)return null;
  if(cue.who===who)return cue;
  if(cue.age>.32&&['Sourire éclatant','Sourire amoureux','Rire de bon cœur'].includes(cue.name))return {name:'Sourire',age:cue.age-.32};
  return null;
}
// AudioBufferSourceNode cuts precisely at the end of one recording, even on a slow render frame.
export function conversationAudio(){
  let ctx,loading,source,ticket=0;
  function stop(){ticket++;if(source){try{source.stop();}catch{}source.disconnect();source=null;}}
  function prepare(){
    const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return;
    ctx??=new Context();ctx.resume().catch(()=>{});
    loading??=fetch('/membres/v27/marianne-voix.mp3').then(r=>{if(!r.ok)throw Error('Voix indisponible');return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b)).catch(()=>{loading=null;return null;});
  }
  return {prepare,stop,async play(clip){
    stop();prepare();const id=ticket,buffer=await loading;
    if(!buffer||id!==ticket||ctx.state!=='running')return false;
    source=ctx.createBufferSource();source.buffer=buffer;source.connect(ctx.destination);source.start(0,clip[0],clip[1]-clip[0]);return true;
  }};
}
