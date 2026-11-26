import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chooseElevenVoice,selectIntroVoices} from './elevenlabs-voices.js';
import {createIntroElevenLabs} from './intro-elevenlabs.js';

const voices=[
 {id:'voice-ahmed',name:'George',gender:'homme'},
 {id:'voice-marianne',name:'Alice',gender:'femme'}
];
function fixture({override}={}){
 const requests=[],played=[],errors=[];
 const request=async(path,options={})=>{
  requests.push({path,options});
  if(override){const result=await override(path,options);if(result!==undefined)return result;}
  if(path==='voices')return {voices};
  if(path==='speech'){
   const sound=new Blob(['mp3-audio'],{type:'audio/mpeg'});
   sound.voiceProvider='elevenlabs';return sound;
  }
  throw Error('Unexpected route: '+path);
 };
 const controller=createIntroElevenLabs({
  request,
  playerFactory:()=>({unlock:()=>true,play:async blob=>{played.push(blob.voiceProvider);},stop(){},dispose(){}}),
  onError:e=>errors.push(e)
 });
 return {controller,requests,played,errors};
}

test('one male and one female account voice are selected without gender switching',()=>{
 assert.deepEqual(selectIntroVoices(voices),{m:'voice-ahmed',f:'voice-marianne'});
 assert.equal(chooseElevenVoice(voices,'homme').id,'voice-ahmed');
 assert.equal(chooseElevenVoice(voices,'femme').id,'voice-marianne');
 assert.throws(()=>selectIntroVoices([{id:'voice-a',name:'Unknown',gender:''}]),/qu’une seule voix/);
});

test('untagged multilingual voices can be selected once, without adding another ElevenLabs key',()=>{
 const untagged=[{id:'voice-uno',name:'Voix 01',gender:''},{id:'voice-dos',name:'Voix 02',gender:''}];
 assert.throws(()=>selectIntroVoices(untagged),/Choisis ci-dessous/);
 assert.deepEqual(selectIntroVoices(untagged,{m:'voice-uno',f:'voice-dos'}),{m:'voice-uno',f:'voice-dos'});
 assert.deepEqual(selectIntroVoices([
  {id:'french-man',name:'Mathis',gender:'',description:'French male narration'},
  {id:'french-woman',name:'Louise',gender:'',description:'French female conversation'}
 ]),{m:'french-man',f:'french-woman'});
});
test('cinematic requests real ElevenLabs with voiceId and strict provider for both speakers',async()=>{
 const h=fixture();assert.equal(h.controller.unlock(),true);
 await h.controller.prepare();
 await h.controller.speak('m','Bonjour, je suis Ahmed.');
 await h.controller.speak('f','Bonjour, je suis Marianne.');
 const calls=h.requests.filter(x=>x.path==='speech').map(x=>x.options.body);
 assert.deepEqual(calls,[
  {text:'Bonjour, je suis Ahmed.',gender:'homme',voiceId:'voice-ahmed',strict:true,purpose:'cinema'},
  {text:'Bonjour, je suis Marianne.',gender:'femme',voiceId:'voice-marianne',strict:true,purpose:'cinema'}
 ]);
 assert.deepEqual(h.played,['elevenlabs','elevenlabs']);assert.deepEqual(h.errors,[]);
});

test('an ElevenLabs 401 stops speech without using Android or OpenAI voices',async()=>{
 const h=fixture({override:(path)=>path==='speech'?Promise.reject(new Error('ElevenLabs refuse la synthèse vocale. Vérifie que ta clé autorise Text to Speech.')):undefined});
 h.controller.unlock();await h.controller.speak('m','Ahmed.');
 assert.equal(h.played.length,0);assert.match(h.errors[0],/Text to Speech/);
 assert.equal(h.requests.filter(x=>x.path==='speech').length,1);
});

test('a provider fallback audio is rejected and never played',async()=>{
 const h=fixture({override:path=>{
  if(path!=='speech')return;
  const clip=new Blob(['audio'],{type:'audio/mpeg'});clip.voiceProvider='openai';return clip;
 }});
 h.controller.unlock();await h.controller.speak('m','Bonjour.');
 assert.equal(h.played.length,0);assert.match(h.errors[0],/substitution/);
});

test('replaying the same authored line does not request paid synthesis twice in one tab',async()=>{
 const h=fixture();h.controller.unlock();
 await h.controller.speak('f','Les bulles peuvent être masquées.');
 await h.controller.speak('f','Les bulles peuvent être masquées.');
 assert.equal(h.requests.filter(x=>x.path==='speech').length,1);
});

test('both the spoken Salon and the cinematic reuse the very same server credential',()=>{
 const cinematic=readFileSync(new URL('./intro-elevenlabs.js',import.meta.url),'utf8');
 const salon=readFileSync(new URL('./salon-conversation.js',import.meta.url),'utf8');
 const worker=readFileSync(new URL('./voice-conversation.mjs',import.meta.url),'utf8');
 const vault=readFileSync(new URL('./voice-settings.mjs',import.meta.url),'utf8');
 assert.match(cinematic,/import \{voiceRequest\} from '\.\/salon-conversation\.js/);
 assert.match(cinematic,/request\('speech',\{body:\{text,gender,voiceId:selected\[id\],strict:true,purpose:'cinema'\}\}\)/);
 assert.match(salon,/fetch\('\/api\/membres\/voice\/'\+path/);
 assert.match(salon,/voiceId:run\.voiceId,strict:true/);
 assert.match(worker,/const useEleven=action==='voices'\|\|action==='speech'/);
 assert.match(worker,/await voiceCredential\(env,useEleven\?'elevenlabs':'openai'\)/);
 assert.match(vault,/const name='voice:'\+provider/);
 assert.doesNotMatch(cinematic,/ELEVENLABS_API_KEY|xi-api-key|speechSynthesis|createLocalVoices/);
});
