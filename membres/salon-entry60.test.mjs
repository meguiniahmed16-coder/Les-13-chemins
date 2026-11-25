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
test('L’accueil et les deux types de Salon offrent des accès clairs et un extrait authentique',()=>{
 const home=src('index.html');
 const invite=src('salon-invite.html');
 assert.match(home,/salon-invite\.html\?ouvrir=inviter/);
 assert.match(home,/salon-invite\.html\?ouvrir=appeler/);
 assert.match(home,/intro-montage-reel23\.mp4/);
 for(const id of ['quick-invite','quick-call'])assert.ok(invite.includes('id="'+id+'"'));
 assert.match(invite,/data-salon-film/);
 assert.match(src('membre.html'),/data-salon-film/);
});
test('Le dojo original enseigne les nouvelles icônes et utilise des voix masculines et féminines',()=>{
 const intro=src('membres/intro-cinema.js');
 const html=src('membres/intro-prive.html');
 assert.match(intro,/frenchVoice\(cinematicSynth,gender/);
 assert.match(intro,/speakCinematicCue\(id,p\.textContent\)/);
 assert.match(intro,/dojoHelp\.hidden=!isDojo/);
 assert.match(intro,/bouton Menu/);
 assert.match(html,/id="dojo-help"/);
});
test('Le build produit les nouveaux modules et invalide les anciens caches Android',()=>{
 const build=src('build-public.mjs');
 for(const path of ['membres/salon-cinema.js','membres/ahmed-3d.js','membres/ahmed-3d.css','membres/salon-call58.css']){
  assert.ok(build.includes("'"+path+"'"),path);
 }
 assert.match(src('membres/salon-v27.js'),/salon-chat\.js\?v=call60/);
 assert.match(src('membres/visite-salon.js'),/salon-v27\.js\?v=call60/);
 assert.match(src('membres/ahmed-3d.js'),/salon-v27\.js\?v=call60/);
});
