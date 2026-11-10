/* Cyrano — chapitre 5, Passe-muraille : dialogues issus de la V17.
 * Jeu de lettres d'amour autonome. Toute vérification se fait sur l'appareil.
 */
export const SCENES=Object.freeze([
 {who:'ambiance',seconds:5.0,text:'Deux cellules voisines, au quartier d’isolement. Une feuille, deux cigarettes, et un mur.'},
 {who:'cedric',seconds:4.3,text:'— Est-ce que toi, tu te sens de faire le boulot ?'},
 {who:'narrateur',seconds:5.6,text:'— Écoute, ça tombe plutôt bien. Moi, j’ai pas de copine à qui écrire.'},
 {who:'narrateur',seconds:7.2,text:'— Mais attends. Si je me mets à écrire à la place de l’autre, elle va forcément s’en rendre compte. Je ne sais pas ce que le mec écrivait, moi.'},
 {who:'cedric',seconds:3.7,text:'— Si, si. J’ai gardé tous les brouillons.'},
 {who:'narrateur',seconds:3.1,text:'— Tous les brouillons ?'},
 {who:'cedric',seconds:7.0,text:'— Oui. Comme je recopiais ses lettres, je les ai gardés. Je te les file. Tu t’en inspires et tu gardes le même style.'},
 {who:'narrateur',seconds:4.2,text:'— Bon. Et comment on fait ? On passe par le yo-yo ?'},
 {who:'cedric',seconds:6.2,text:'— Pour le paquet avec les anciens brouillons, oui, on passe par le yo-yo. Mais après, pour les lettres, il y a plus simple.'},
 {who:'narrateur',seconds:2.5,text:'— Quoi ?'},
 {who:'cedric',seconds:4.8,text:'— Avec celui qui occupait ta cellule avant toi, on a creusé un trou.'},
 {who:'narrateur',seconds:3.0,text:'— Vous avez fait quoi ?'},
 {who:'cedric',seconds:3.8,text:'— Un trou. Dans le mur.'},
 {who:'ambiance',seconds:4.9,text:'Un minuscule passage dans le mur. Pas pour s’évader : pour faire passer des lettres d’amour.'}
]);
export const MISSIONS=Object.freeze([
 {title:'Lettre I — La rencontre',intent:'Écrire une lettre de séduction tendre et sincère.',required:['regard','sourire','douceur','lumière','tendresse']},
 {title:'Lettre II — La distance',intent:'Dire ce que l’absence fait ressentir et réconforter.',required:['manque','souvenir','voix','chaleur','patience']},
 {title:'Lettre III — La promesse',intent:'Écrire une lettre amoureuse sur l’espoir de se retrouver.',required:['amour','confiance','avenir','retrouver','promesse']}
]);
export function normalise(value){
 return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').replace(/’/g,"'");
}
export function wordList(value){
 return normalise(value).match(/[a-z]+(?:'[a-z]+)*/g)||[];
}
export function validateLetter(text,missionIndex=0){
 const mission=MISSIONS[missionIndex];
 if(!mission)return {ok:false,issues:['Épreuve inconnue.'],missing:[],words:0,score:0};
 const source=String(text||''),norm=normalise(source),words=wordList(source);
 const entries=new Set(words),missing=mission.required.filter(word=>!entries.has(normalise(word)));
 const issues=[];
 if(missing.length)issues.push('Il manque '+missing.length+' mot'+(missing.length>1?'s':'')+' imposé'+(missing.length>1?'s':'')+'.');
 if(words.length<65)issues.push('Développe ta lettre : 65 mots au minimum.');
 const unique=new Set(words);
 if(unique.size<28||unique.size/Math.max(1,words.length)<.25)issues.push('Évite les répétitions : parle avec tes propres mots.');
 if(!/(?:^|[\n.!?])\s*(?:mon amour|ma cherie|ma douce|ma tendre|chere|cher |bonjour|a toi|toi que j'aime|ma bien aimee|mon coeur)/m.test(norm))
  issues.push('Commence par une véritable formule d’adresse amoureuse.');
 const isAddressed=/\b(tu|toi|ton|ta|tes|vous|votre|vos)\b|\bt['’]/.test(norm);
 if(!isAddressed)issues.push('Adresse-toi à la personne aimée.');
 const personal=/\b(je|j['’]|nous|mon|ma|mes|notre|nos)\b/.test(norm);
 if(!personal)issues.push('Exprime un sentiment personnel.');
 const emotional=[
  /\bamour|\baim|\btendr|\bdouceur|\baffection/,
  /\bdesir|\bembrass|\bbaiser|\bcaress|\b(coeur|cœur)/,
  /\bmanqu|\babsence|\battend|\bpatien|\bretrouv/,
  /\bsouri|\bregard|\bemoi|\bbonheur|\bjoie|\bbeaute/,
  /\bensemble|\bpromess|\bavenir|\bconfiance|\bsouvenir/
 ].filter(re=>re.test(norm)).length;
 if(emotional<3)issues.push('On ne sent pas encore assez l’amour, la tendresse ou le désir de retrouver l’autre.');
 const sentences=source.split(/[.!?\n]+/).filter(s=>s.trim().length>7).length;
 if(sentences<4)issues.push('Écris plusieurs phrases liées entre elles, pas une simple liste de mots.');
 return {ok:issues.length===0,issues,missing,words:words.length,score:Math.max(0,Math.round(100-issues.length*16)),emotion:emotional};
}
