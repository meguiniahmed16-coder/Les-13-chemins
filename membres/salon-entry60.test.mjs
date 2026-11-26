import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Les deux voix sont déclenchées après la réception du véritable personnage V27',()=>{
 const chat=src('membres/salon-chat.js');
 assert.match(chat,/if\(playback\.supportsVoice&&!voiceEnabled\(\)\)/);
 const found=chat.indexOf("if(!await invite(p))");
 const greeting=chat.indexOf("if(!thread.length)void say(opening");
 assert.ok(found>=0&&greeting>found,'Le premier dialogue attend la présence du personnage 3D');
 assert.match(chat,/playback\.play\('guest',answer/);
 assert.match(chat,/playback\.play\('player',question/);
});
test('Le visiteur peut appeler sans clé API privée et la visite conserve ses limites',()=>{
 const chat=src('membres/salon-chat.js');
 const visit=src('membres/visite-salon.js');
 assert.match(chat,/const publicCall=!root\.host\.hasAttribute\('salon-auteur'\)/);
 assert.match(chat,/window\.SpeechRecognition\|\|window\.webkitSpeechRecognition/);
 assert.match(chat,/recognition\.start\(\)/);
 assert.match(chat,/void say\(spoken,false,undefined,true\)/);
 assert.match(visit,/view\.invitePersonnage\(\)/);
 assert.match(visit,/activeView\?\.appelerPersonnage\(\)/);
 assert.match(visit,/lease\.remaining/);
});
test('Ahmed numérique utilise le modèle V27 original et les échanges réellement autorisés',()=>{
 const page=src('ahmed-marie.html');
 const script=src('membres/ahmed-3d.js');
 const v27=src('membres/salon-v27.js');
 for(const id of ['ahmed-3d','ahmed-call','ahmed-hangup','ahmed-written'])assert.ok(page.includes('id="'+id+'"'));
 assert.match(script,/referenceStudio\('homme'\)/);
 assert.match(script,/document\.createElement\('chemins-salon'\)/);
 assert.match(script,/composer'\)\.requestSubmit\(\)/);
 assert.match(script,/if\(\$\('sendButton'\)\.disabled\)/);
 assert.match(page,/ahmed-3d-answer/);
 assert.match(v27,/narrateAhmed\(text,done\)/);
 assert.match(v27,/armAhmedVoice\(\)/);
});
test('Les deux anciens boutons de cinéma sont retirés et l’auteur ouvre le vrai film',()=>{
 const member=src('membre.html'),code=src('membres/member.js');
 assert.doesNotMatch(member,/data-salon-film|cinématique originale complète/);
 assert.match(code,/\/membres\/intro-prive\.html\?salon=1/);
 assert.match(code,/originalIntroKey/);
 const cinema=src('membres/intro-cinema.js');
 assert.match(cinema,/finishSalonEntry/);
 assert.match(cinema,/onComplete:\(\)=>\{introSound\.stop\(\);finishSalonEntry\(\);\}/);
 assert.match(cinema,/croisee-salon-introduction-originale-v34/);
 const intro=src('membres/intro-prive.html');
 assert.match(intro,/dojo-voix68/);
 for(const file of ['salon-invite.html','ahmed-marie.html'])
  assert.doesNotMatch(src(file),/data-salon-film/);
});

test('Le dojo original enseigne les nouvelles icônes et utilise des voix masculines et féminines',()=>{
 const intro=src('membres/intro-cinema.js');
 const html=src('membres/intro-prive.html');
 assert.match(intro,/createIntroElevenLabs\(\{/);
 assert.match(intro,/speakCinematicCue\(id,p\.textContent\)/);
 assert.match(intro,/dojoHelp\.hidden=!isDojo/);
 assert.match(intro,/Appuie sur Menu/);
 assert.match(html,/id="dojo-help"/);
 assert.match(html,/id="intro-voice-alert"/);
});
test('Le build produit les nouveaux modules et invalide les anciens caches Android',()=>{
 const build=src('build-public.mjs');
 for(const path of ['membres/salon-cinema.js','membres/ahmed-3d.js','membres/ahmed-3d.css','membres/salon-call58.css']){
  assert.ok(build.includes("'"+path+"'"),path);
 }
 assert.match(src('membres/salon-v27.js'),/salon-chat\.js\?v=eleven70/);
 assert.match(src('membres/visite-salon.js'),/salon-v27\.js\?v=eleven70/);
 assert.match(src('membres/ahmed-3d.js'),/salon-v27\.js\?v=eleven70/);
});

test('Les pictogrammes du Salon sont conservés, sans nouvelle vidéo à la place de l’originale',()=>{
 const icon=src('membres/salon-maison-ui.js');
 const member=src('membres/member.js');
 const ahmed=src('membres/ahmed-3d.js');
 const guest=src('membres/visite-salon.js');
 assert.match(icon,/export const salonActionSvg=svg/);
 assert.match(icon,/phoneNode\.hidden=standaloneAhmed\?false/);
 assert.match(icon,/salon-ahmed-call/);
 assert.match(ahmed,/view\.addEventListener\('salon-ahmed-call'/);
 assert.match(ahmed,/\/membres\/intro-prive\.html\?salon=1&retour=ahmed/);
 assert.match(guest,/\/membres\/intro-prive\.html\?salon=1&retour=invite/);
 assert.match(member,/member\.author&&!wantsPreview/);
 assert.match(src('index.html'),/data-salon-action="invite"/);
 assert.match(src('index.html'),/data-salon-action="call"/);
 assert.doesNotMatch(src('index.html'),/intro-montage-reel23\.mp4/);
});

test('Le Salon ne charge plus de voix Android : tous les dialogues vocaux passent par ElevenLabs',()=>{
 const dialogue=src('membres/salon-dialogue.js');
 const cinema=src('membres/intro-cinema.js');
 const chat=src('membres/salon-chat.js');
 assert.doesNotMatch(dialogue,/SpeechSynthesisUtterance|speechSynthesis|createLocalVoices|frenchVoice/);
 assert.doesNotMatch(cinema,/SpeechSynthesisUtterance|speechSynthesis|createLocalVoices|frenchVoice/);
 assert.match(dialogue,/voiceProvider!=='elevenlabs'/);
 assert.match(dialogue,/requestVoice\('speech',\{body:\{text:current.text,gender:kind,strict:true\}/);
 assert.match(chat,/salon-dialogue\.js\?v=eleven70/);
});
