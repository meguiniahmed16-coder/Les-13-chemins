import test from 'node:test';
import assert from 'node:assert/strict';
import {frenchVoice,voiceChunks,spokenSamples} from './salon-voice.js';
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

test('La lecture garde les abréviations et la ponctuation française avec les mots',()=>{
  const text='Oui. M. Dupont vient de quitter le salon. Est-ce que tu veux le rejoindre dans le jardin pour une petite promenade ?';
  const chunks=voiceChunks(scoreLine(text),0);
  assert.equal(chunks.map(c=>c.text).join(' '),text);
  assert.equal(chunks[0].text,'Oui. M. Dupont vient de quitter le salon.');
  assert.ok(chunks.every(c=>/[\p{L}\d]/u.test(c.text)));
});
test('La synthèse garde les consonnes et les respirations au milieu des phrases',()=>{
  const pcm=new Float32Array(2000),rate=1000;
  pcm.fill(.02,200,500);pcm.fill(.006,950,1250);
  const sentence=spokenSamples(pcm,rate,'Viens.',false),joined=spokenSamples(pcm,rate,'viens',false);
  assert.equal(sentence.byteOffset/4,165);assert.equal(sentence.length,1450-165);
  assert.equal(joined.length,1285-165);assert.deepEqual(sentence.slice(335,785),new Float32Array(450));
});
