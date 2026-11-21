// An age band describes the character at a meeting in the book. Never age a
// deceased or childhood character up to the date on the visitor's device.
const knownBands = new Map([
  [5,[25,110,112,118,126,220,240,251,289,300,308]],
  [0,[4,23,32,79,85,86,117,153,182,190,214,229,301,305,357]],
  [1,[261,266,278]], [2,[1,7,246]], [4,[259,341]]
].flatMap(([band,ids])=>ids.map(id=>[id,band])));
// Approximate setting for birth-dated portraits from the early chapters.
// Specific scenes take precedence when a chapter spans several decades.
const sceneYears={1:1983,2:1997,3:2002,4:2002,5:2002,7:2005,8:2008,10:2013};
const otherYears={13:1997,24:2024,31:1983,103:2013,131:1983,198:1983,216:1959,322:1983};
const ageBand=age=>age<18?5:age<30?0:age<40?1:age<50?2:age<65?3:4;
function genderOf(bio,role,id){
  if(/^Née /.test(bio))return 'femme';
  if(/^Né /.test(bio))return 'homme';
  const subject=role.replace(/^«[^»]+»,?\s*/,'').replace(/^(À |Au |Aux )[^,]+,\s*/i,'').toLowerCase();
  if(/^(la (?!personne|voix)|une (?!personne|voix)|l’(amie|étudiante|éditrice|assistante|hospitalière|épouse|infirmière)|celle )/.test(subject)||[71,249].includes(id))return 'femme';
  if(/^(le |un |l’(ami\b|homme|invité|acheteur|oncle|étudiant|appelé|ancien|habitué|officier|épicier|adolescent|évêque|animateur|entraîneur|employé|élu|apprenti|imprimeur))/.test(subject)||[115,195,208,245,272,300,302,341,368].includes(id))return 'homme';
  return null;
}
export function salonDirectory(profiles) {
  return Object.entries(profiles).filter(([id])=>/^\d+$/.test(id)).map(([id,p])=>{
    const n=Number(id),bio=p.story[0],story=p.story.join(' '),role=p.role;
    const birth=/^Née? le .*?\b(\d{4})\b/.exec(bio),year=otherYears[n]||sceneYears[p.chapters[0]];
    let age=knownBands.get(n)??null;
    if(age===null&&birth&&year)age=ageBand(year-Number(birth[1]));
    if(age===null&&/^(?:La|Le|L’|L'autre|L’autre)\s*(?:fillette|garçon|adolescent|autre garçon)/i.test(role))age=5;
    if(age===null&&/^(?:Le jeune |La jeune |L’étudiante? )/i.test(role))age=0;
    if(age===null&&/^(?:Le retraité|La grand-mère|Le grand-père)/.test(role))age=4;
    const face={};
    if(/visiteuse brune|[Jj]’ai les cheveux bruns/.test(role+' '+story))face.hairTone=0;
    if(/visiteuse blonde/.test(role))face.hairTone=3;
    if(/[Jj]’ai les cheveux (?:vite noués|relevés)/.test(story))face.hair=0;
    if(/[Jj]’ai les cheveux courts/.test(story))face.hair=1;
    if(/mes grands yeux bleus/i.test(story)){face.iris=0;face.gaze=2;}
    if(n===258)face.lashes=2;
    if(/j’ai les épaules solides/i.test(story))face.body=3;
    // Preserve the visual continuity of the two portraits in the Sarajevo scene.
    let skinLevel=null;
    if(n===7){Object.assign(face,{hair:7,hairTone:1,iris:3});skinLevel=40;}
    if(n===229){Object.assign(face,{hair:1,hairTone:2,iris:4,beard:0});skinLevel=22;}
    return {id,name:p.name,role,skinLevel,gender:genderOf(bio,role,n),age,face,glasses:/mes lunettes/i.test(story)||n===368};
  });
}
