import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SCENES,MISSIONS,wordList,normalise,validateLetter} from './cyrano-core.js';
const read=p=>readFileSync(new URL('./'+p,import.meta.url),'utf8');
test('Cyrano : répliques de la V17 conservées, y compris les brouillons et le mur',()=>{
 assert.ok(SCENES.length>=12);
 assert.ok(SCENES.some(p=>p.text==='— Est-ce que toi, tu te sens de faire le boulot ?'));
 assert.ok(SCENES.some(p=>p.text==='— Écoute, ça tombe plutôt bien. Moi, j’ai pas de copine à qui écrire.'));
 assert.ok(SCENES.some(p=>p.text==='— Si, si. J’ai gardé tous les brouillons.'));
 assert.ok(SCENES.some(p=>p.text==='— Tous les brouillons ?'));
 assert.ok(SCENES.some(p=>p.text.includes('je les ai gardés. Je te les file')));
 assert.ok(SCENES.some(p=>p.text==='— Bon. Et comment on fait ? On passe par le yo-yo ?'));
 assert.ok(SCENES.some(p=>p.text==='— Avec celui qui occupait ta cellule avant toi, on a creusé un trou.'));
 assert.ok(SCENES.some(p=>p.text==='— Un trou. Dans le mur.'));
 assert.ok(SCENES.every(p=>p.seconds>0&&['narrateur','cedric','ambiance'].includes(p.who)));
});
test('Trois lettres avec exactement cinq mots distincts chacune',()=>{
 assert.equal(MISSIONS.length,3);
 const words=new Set();
 for(const m of MISSIONS){
  assert.equal(m.required.length,5);
  for(const word of m.required){
   assert.ok(!words.has(normalise(word)),'Chaque épreuve doit imposer des mots différents');
   words.add(normalise(word));
  }
 }
 assert.equal(words.size,15);
});
const model=(m)=>[
 'Mon amour,',
 'Je t’écris parce que je pense à toi chaque soir, et parce que le monde est moins dur lorsque je peux te parler.',
 'Je me souviens de la première fois où tu as souri et de tout ce que ton visage a changé dans ma vie.',
 'Ta présence me donne du courage et je voudrais te garder à mes côtés pour partager des moments simples.',
 'Même loin de toi, je ressens une véritable tendresse, et mon cœur cherche les mots qui pourraient te rejoindre.',
 'Je t’aime sincèrement. Je voudrais pouvoir te dire encore ce que je n’ose jamais te dire tout à fait.',
 'Je garde notre histoire en moi, et mes pensées vont vers toi lorsque la nuit arrive et que le silence devient long.',
 m.required.join(', ')+'.',
 'Je promets de rester attentif à ce qui te rend heureuse, de prendre soin de nous et de ne pas oublier cette émotion.'
].join('\n\n');
test('Une vraie lettre d’amour passe les trois épreuves',()=>{
 for(let i=0;i<3;i++){
  const result=validateLetter(model(MISSIONS[i]),i);
  assert.equal(result.ok,true,'Échec lettre '+(i+1)+': '+result.issues.join(' | '));
  assert.deepEqual(result.missing,[]);
  assert.ok(result.words>65);
 }
});
test('Une liste de mots et un message hors sujet sont refusés',()=>{
 for(let i=0;i<3;i++){
  const empty=validateLetter('',i);
  assert.equal(empty.ok,false);
  const keywords=validateLetter(MISSIONS[i].required.join(' '),i);
  assert.equal(keywords.ok,false);
  const unrelated=validateLetter(
   'Bonjour, je vous transmets les renseignements nécessaires concernant la facturation de ce dossier. '+
   'Les documents de production seront archivés après réunion. Un ordinateur est disponible dans la salle. '.repeat(7)+
   MISSIONS[i].required.join(' '),i);
  assert.equal(unrelated.ok,false);
 }
});
test('Détection des mots : accents, singulier et mots entiers',()=>{
 assert.deepEqual(wordList('Lumière, sourire, coeur.'),['lumiere','sourire','coeur']);
 assert.equal(normalise('TENDRESSE'),'tendresse');
 const m=MISSIONS[0];
 const required=m.required.join(' ').toUpperCase();
 const text=model({...m,required:[]})+'\n'+required;
 assert.equal(validateLetter(text,0).missing.length,0);
 const error=validateLetter(text.replace('LUMIÈRE','luminaire'),0);
 assert.ok(error.missing.includes('lumière'));
});
test('Cinématique : cellules jumelles, fenêtres, barreaux, fumée et long nez en 3D',()=>{
 const s=read('cyrano-app.js');
 for(const marker of [
  "new T.WebGLRenderer","function buildWalls(root)","function bunk(root,x,z)",
  "function table(root,x,z)","function human(root,x,z,{cyrano=false,tired=false}",
  "function makeScene()","const nose=new T.Mesh",
  "cyrano?.47:.24","const puff=new T.Mesh",
  "new T.DirectionalLight","for(let i=0;i<6;i++)",
  "segment(.52,1.04,1.5,3)","function cameraTarget(shot)",
  "manualCamera","sceneItem.text","$('cellA').onclick",
  "$('cellB').onclick","$('skip').onclick=startWriting"
 ])assert.ok(s.includes(marker),marker);
 assert.ok(s.includes('SCENES[shotIndex].seconds'));
});
test('Éditeur : trois lettres, dictée facultative et contrôle local sans envoi des textes',()=>{
 const js=read('cyrano-app.js'),html=read('jeu-cyrano.html');
 for(const marker of [
  "function renderMission()","function renderRequired()","function evaluate()",
  "const result=validateLetter($('letter').value,letterIndex)",
  "function setupSpeechInput()","window.SpeechRecognition||window.webkitSpeechRecognition",
  "recognition.onresult=event","function advanceLetter()",
  "navigator.clipboard.writeText","completed[letterIndex]"
 ])assert.ok(js.includes(marker),marker);
 for(const id of ['letter','dictate','evaluate','nextLetter','progress','required','feedback','begin','skip'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(!js.includes("fetch("),'Le texte écrit ne doit pas être envoyé au réseau');
 assert.ok(!js.includes("postMessage("));
 assert.ok(html.includes('ne sont pas envoyées à un serveur'));
});
test('Intégration publique sans écraser les jeux déjà existants',()=>{
 const build=read('build-public.mjs'),html=read('jeu-cyrano.html');
 assert.ok(build.includes("['build-cyrano.mjs']"));
 assert.ok(build.includes("['--test', 'cyrano.test.mjs']"));
 assert.ok(build.includes("'jeu-cyrano.html'"));
 assert.ok(build.includes("'cyrano-runtime.js'"));
 assert.ok(build.includes("'arcade-catalogne-3d.html'"));
 assert.ok(build.includes("'jeu-manifestation.html'"));
 assert.ok(html.includes('cyrano-runtime.js?v=cyrano-prototype-v1'));
});
