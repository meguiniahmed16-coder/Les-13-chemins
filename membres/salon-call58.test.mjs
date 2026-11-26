import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {guestAppearance} from './salon-encounter.js';
import {seats} from './salon-plan.js';
import {choosePosture} from './seated-postures.js';

const src=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const panel=src('membres/salon-chat.js');
const css=src('membres/salon-call58.css');
const nav=src('membres/salon-maison-ui.js');
const session=src('membres/salon-conversation.js');
const server=src('membres/voice-conversation.mjs');

test('Le père d’Ahmed garde un portrait sobre sans lunettes fantaisistes',()=>{
 const father=guestAppearance({id:'1',name:'Abdelouahab',gender:'homme',role:'Le père d’Ahmed',age:2,face:{}});
 assert.equal(father.gender,'homme');
 assert.equal(father.studio.face.hair,1);
 assert.equal(father.studio.face.age,2,'Ne pas vieillir un personnage hors de sa scène');
 assert.equal(father.studio.outfit.lunettes,undefined);
 assert.equal(father.studio.outfit.haut,'mh1800');
 const guest=guestAppearance({id:'327',name:'Visiteur',gender:'homme',age:2,face:{}});
 assert.equal(guest.studio.outfit.lunettes,undefined);
});

test('Le fauteuil donne aux invités un appui crédible sans altérer le rig V27',()=>{
 const chair=seats.find(s=>s.id==='chair');
 assert.deepEqual(chair?.support,{x:30,z:-55,height:56.9,side:1});
 assert.equal(choosePosture(chair,null,()=>.99).kind,'appui');
 const motion=src('membres/salon-v27-motion.js');
 const live=src('membres/v27/live-body.js');
 const scene=src('membres/v27/scene.js');
 assert.match(motion,/preferGuestArmrest/);
 assert.match(live,/solver\.preferGuestArmrest=actor\.isGuest===true/);
 assert.match(scene,/visitor\.isGuest=true/);
});

test('Recherche et hasard restent visibles hors du défilement des personnages',()=>{
 assert.match(panel,/class="guest-picker-search"/);
 assert.match(panel,/class="guest-random"/);
 assert.match(panel,/list\.scrollTop=0/);
 assert.match(css,/guest-picker-search/);
 assert.match(css,/\.guest-list\{/);
 assert.match(css,/overflow-y:auto!important/);
 assert.match(nav,/picker\.querySelector\('\.guest-search'\)\?\.focus/);
});

test('Appel simple : voix selon le genre, sans menu Marianne ni fin manuelle',()=>{
 assert.doesNotMatch(panel,/voice-conversation-select/);
 assert.doesNotMatch(panel,/voice-conversation-interrupt/);
 assert.doesNotMatch(panel,/voice-conversation-finish/);
 assert.match(panel,/class="voice-call-header"/);
 assert.match(panel,/aria-label="Raccrocher"/);
 assert.match(panel,/voiceSession\.refresh\(\{withVoices:false\}\)/);
 assert.match(panel,/voiceSession\.start\(''\)/);
 assert.match(session,/const speechBody=\{text:answer,gender:current.gender,voiceId:run.voiceId,strict:true\}/);
 assert.match(server,/openaiSpeechAuto/);
 assert.match(css,/voice-call-header/);
});

test('Le navigateur récupère bien les nouveaux modules et les poses V27',()=>{
 assert.match(src('membres/salon-v27.js'),/salon-chat\.js\?v=eleven70/);
 assert.match(src('membres/salon-v27.js'),/salon-encounter\.js\?v=call58/);
 assert.match(src('membres/salon-v27.js'),/salon-call58\.css\?v=call58/);
 assert.match(src('membres/v27/salon-runtime.js'),/scene-bundle\.js\?v=call58/);
 assert.match(src('membres/member.js'),/salon-v27\.js\?v=eleven70/);
 assert.match(src('membre.html'),/member\.js\?v=eleven70/);
 assert.match(src('build-public.mjs'),/membres\/salon-call58\.css/);
});

test('Un appui unique sur le téléphone commence l’appel lorsque le service est prêt',()=>{
  assert.match(panel,/if\(person&&phoneReady&&!request\)/);
  assert.match(panel,/phonePanel\.hidden=false/);
  assert.match(panel,/void voiceSession\.start\(''\)/);
  assert.match(panel,/else void loadPhone\(true\)/);
  assert.match(panel,/phoneToggle\.onclick/);
});
