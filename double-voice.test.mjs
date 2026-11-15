import test from 'node:test';
import assert from 'node:assert/strict';
import {addressPreference,turnVoiceContext,isGreeting,repeatedGreetingContext} from './double-backend/voice.js';
test('tutoiement default, explicit vouvoiement persists, explicit tutoiement restores it',()=>{
 assert.equal(addressPreference('Bonjour'),'tu');
 for(const request of ['Vouvoie-moi, s’il te plaît.','Je préfère le vouvoiement.','Ne me tutoie pas.','Peux-tu me vouvoyer ?','Le tutoiement me gêne.'])assert.equal(addressPreference(request),'vous',request);
 assert.equal(addressPreference('Et pour la musique ?','vous'),'vous');
 assert.equal(addressPreference('On peut se tutoyer.','vous'),'tu');
 assert.equal(addressPreference('Tutoie-moi.','vous'),'tu');
 assert.equal(addressPreference('Ne me vouvoie pas.','vous'),'tu');
});
test('age is correct on both sides of the birthday',()=>{
 assert.match(turnVoiceContext('tu','2026-06-27T12:00:00Z'),/48 ans/);
 assert.match(turnVoiceContext('tu','2026-06-28T12:00:00Z'),/49 ans/);
 assert.match(turnVoiceContext('vous','2026-11-15T12:00:00Z'),/CHAQUE phrase/);
});
test('repeated greetings use this recent conversation, without confusing a new question or a later return',()=>{
 const now='2026-11-15T17:00:00Z',turns=[{prompt:'Bonjour, comment vas-tu ?',response:'Ça va. Et toi ?',created_at:'2026-11-15T16:59:00Z'}];
 assert.equal(isGreeting('Salut, ça va ?'),true);
 assert.equal(isGreeting('Salut, tu écoutes quoi ?'),false);
 assert.match(repeatedGreetingContext('Salut, ça va ?',turns,now),/CONTINUITÉ IMMÉDIATE/);
 assert.match(repeatedGreetingContext('Comment allez-vous ?',turns,now,'vous'),/vous venez/);
 assert.equal(repeatedGreetingContext('Peux-tu expliquer ce passage ?',turns,now),'');
 assert.equal(repeatedGreetingContext('Salut, ça va ?',turns,'2026-11-15T18:00:00Z'),'');
 assert.equal(repeatedGreetingContext('Salut, ça va ?',[],now),'');
});
