import test from 'node:test';
import assert from 'node:assert/strict';
import {frenchVoice,voiceChunks} from './salon-voice.js';
import {scoreLine} from './salon-performance.js';

test('Le timbre français correspond au personnage sans dépendre de l’ordre des voix système',()=>{
  const voice=(name,lang='fr-FR')=>({name,lang,localService:true});
  const voices=[voice('Amélie'),voice('Thomas'),voice('Premium Amélie'),voice('Thomas','en-US')];
  for(const list of [voices,[...voices].reverse()]){
    const synth={getVoices:()=>list};
    assert.equal(frenchVoice(synth,'homme'),voices[1]);assert.equal(frenchVoice(synth,'femme'),voices[2]);
  }
  assert.equal(frenchVoice({getVoices:()=>[voices[0]]},'homme'),undefined);
  assert.equal(frenchVoice({getVoices:()=>[voices[0]]},'homme',false),voices[0]);
});
test('Les segments de voix conservent tous les mots et reprennent à la bonne position',()=>{
  const text='Bonjour, je suis Adelphe. Nous pouvons nous asseoir pour discuter un moment, si tu le souhaites ?';
  const line=scoreLine(text),chunks=voiceChunks(line,0);
  assert.equal(chunks.map(x=>x.text).join(' '),text);
  assert.equal(chunks[0].start,0);assert.equal(chunks.at(-1).end,line.duration);
  for(let i=1;i<chunks.length;i++)assert.equal(chunks[i].start,chunks[i-1].end);
  assert.equal(voiceChunks(line,2)[0].start,line.words[2].start);
});
