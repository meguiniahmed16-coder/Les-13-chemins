import test from 'node:test';
import assert from 'node:assert/strict';
import {addressPreference,turnVoiceContext} from './double-backend/voice.js';
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
 assert.match(turnVoiceContext('vous','2026-11-15T12:00:00Z'),/vouvoie-le/);
});
