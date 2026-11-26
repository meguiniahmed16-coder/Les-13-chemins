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
 assert.match(cinema,/onComplete:\(\)=>\{stopCinematicVoice\(\);introSound\.stop\(\);finishSalonEntry\(\);\}/);
 assert.match(cinema,/croisee-salon-introduction-originale-v34/);
 const intro=src('membres/intro-prive.html');
 assert.match(intro,/dojo-eleven72/);
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
 assert.doesNotMatch(ahmed,/intro-prive\.html|location\.replace\(/);
 assert.match(ahmed,/function startOpening\(\)\{[\s\S]*?void mount\(\);\s*\}/);
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


test('Le parcours court suit les véritables boutons et peut être passé',()=>{
 const nav=src('membres/salon-maison-ui.js'),guide=src('membres/salon-guide.js'),intro=src('membres/intro-cinema.js');
 assert.match(nav,/mountSalonGuide\(root/);assert.doesNotMatch(nav,/tool\('choose','encounter'/);
 assert.match(guide,/data-maison-open="encounter"/);assert.match(guide,/\.guest-random/);assert.match(guide,/\.maison-phone/);assert.match(guide,/data-guide="skip"/);assert.match(intro,/finishSalonEntry\(true\)/);
});


test('Ahmed Numérique réutilise le téléphone existant après création dynamique du salon',()=>{
 const nav=src('membres/salon-maison-ui.js'),v27=src('membres/salon-v27.js'),ahmed=src('membres/ahmed-3d.js');
 const sync=nav.slice(nav.indexOf('function sync(){'),nav.indexOf('function close(restore'));
 assert.match(sync,/standaloneAhmed=root\.host\.hasAttribute\('ahmed-numerique'\)/);
 assert.match(sync,/phoneNode\.hidden=standaloneAhmed\?false/);
 assert.match(nav,/ahmedObserver\.observe\(root\.host/);
 assert.match(v27,/if\(this\.hasAttribute\('ahmed-numerique'\)\)this\.#nav\?\.sync\(\)/);
 assert.match(ahmed,/querySelector\('\.maison-phone'\)/);
 assert.match(ahmed,/if\(active\)stop\(\);else void begin\(\)/);
 assert.match(ahmed,/syncAhmedPhone\(\)/);
 assert.match(src('ahmed-marie.html'),/rev=ahmedstream5/);
});


test('Ahmed seul : modèle privé exact pour auteur, aucune commande native ou invité dans la scène',()=>{
 const ahmed=src('membres/ahmed-3d.js'),salon=src('membres/salon-v27.js'),scene=src('membres/v27/scene.js'),members=src('membres/v27/scene-members.js'),html=src('membres/v27/salon.html');
 assert.match(ahmed,/const info=await checkOwner\(\);const originalAhmed=true/);
 assert.match(ahmed,/view.setAttribute\('ahmed-original',''\)/);
 assert.match(salon,/ahmed=solo/);assert.match(salon,/portrait=original/);
 assert.match(salon,/if\(!scene.originalLook\('m'\)\)throw/);
 assert.match(members,/scene.cinemaArrival\|\|scene.originalAhmed/);
 assert.match(scene,/soloAhmed\?id==='m'/);
 assert.match(scene,/if\(soloAhmed\)\{animateBody\(actors.m/);
 assert.match(html,/body\.ahmed-solo #stage>:not\(#scene\):not\(#loading\)/);
 assert.match(ahmed,/:not\(.v27-frame\):not\(.maison-phone\)/);
});


test('Retour micro réel et circuit oral direct sans contrôle auteur redondant',()=>{
 const ahmed=src('membres/ahmed-3d.js'),page=src('ahmed-marie.html');
 assert.match(ahmed,/voiceSamples>=3/);assert.match(ahmed,/Je réfléchis à ce que tu viens de me dire/);assert.match(ahmed,/dataset\.ahmedSpoken='1'/);
 assert.match(page,/payload.spoken===true/);assert.match(page,/request.spoken\?\{spoken:true\}/);
});

test('Ahmed numérique montre une attente jusqu’au modèle prêt et le statut près du téléphone',()=>{
 const page=src('ahmed-marie.html'),js=src('membres/ahmed-3d.js'),css=src('membres/ahmed-3d.css');
 assert.match(page,/id="ahmed-room-loading"/);
 assert.match(page,/class="ahmed-room-progress" role="progressbar"/);
 assert.match(js,/actor=view;hideRoomLoading\(\);syncAhmedPhone\(\)/);
 assert.match(js,/opening=false;hideRoomLoading\(\)/);
 assert.match(css,/top:60px;right:10px/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
