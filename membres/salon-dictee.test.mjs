import assert from 'node:assert/strict';
import test from 'node:test';
import {createDictee} from './salon-dictee.js';

const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(t,win={},mediaDevices={}){
  const statuses=[],states=[],phrases=[];
  let keys=0;
  for(const [name,value] of Object.entries({window:win,navigator:{mediaDevices}})){
    const previous=Object.getOwnPropertyDescriptor(globalThis,name);
    Object.defineProperty(globalThis,name,{configurable:true,value});
    t.after(()=>{if(previous)Object.defineProperty(globalThis,name,previous);else delete globalThis[name];});
  }
  const d=createDictee({onText:s=>phrases.push(s),onState:s=>states.push(s),onStatus:s=>statuses.push(s),onKeyboard:()=>keys++});
  t.after(d.cancel);
  return {d,statuses,states,phrases,get keys(){return keys;}};
}

test('La dictée native conserve seulement sa phrase finale et se relance',t=>{
  let recognizer;
  class Recognition{constructor(){recognizer=this;}start(){this.onstart();}abort(){}}
  const {d,phrases,statuses}=setup(t,{webkitSpeechRecognition:Recognition});
  d.toggle();assert.equal(recognizer.lang,'fr-FR');assert.equal(d.state,'listening');
  recognizer.onresult({results:[Object.assign([{transcript:'Un essai'}],{isFinal:false})]});
  assert.deepEqual(phrases,[]);
  assert.equal(statuses.at(-1),'Un essai');
  const first=[{transcript:' La décision. '}];
  recognizer.onresult({results:[first]});
  assert.equal(d.state,'listening');
  recognizer.onresult({results:[first,[{transcript:' Et la suite.'}]]});recognizer.onend();
  assert.equal(d.state,'idle');
  d.toggle();const late=recognizer.onresult;d.cancel();late({results:[[{transcript:'périmé'}]]});
  assert.deepEqual(phrases,['La décision. Et la suite.']);
});
test('Après un échec du service natif, une permission micro refusée propose le clavier',async t=>{
  class Recognition{start(){this.onerror({error:'network'});}abort(){}}
  const qa=setup(t,{SpeechRecognition:Recognition,MediaRecorder:class{},Worker:class{},OfflineAudioContext:class{}},{
    async getUserMedia(){throw Object.assign(Error(),{name:'NotAllowedError'});}
  });
  qa.d.toggle();await tick();assert.equal(qa.d.state,'idle');assert.equal(qa.keys,1);
  assert.match(qa.statuses.at(-1),/Accès au micro refusé.*clavier/);
});
test('Quitter pendant la permission coupe les pistes accordées tardivement',async t=>{
  let grant,stopped=0;
  const {d,phrases}=setup(t,{MediaRecorder:class{},Worker:class{},OfflineAudioContext:class{}},{
    getUserMedia:()=>new Promise(resolve=>{grant=resolve;})
  });
  d.toggle();assert.equal(d.state,'starting');d.cancel();
  grant({getTracks:()=>[{stop(){stopped++;}}]});await tick();
  assert.equal(stopped,1);assert.equal(d.state,'idle');assert.deepEqual(phrases,[]);
});
test('Sans accès au micro, le champ du message reste la solution immédiate',t=>{
  const qa=setup(t);qa.d.toggle();assert.equal(qa.keys,1);assert.match(qa.statuses.at(-1),/micro de ton clavier/);
});
test('Annuler la transcription écarte la phrase en attente',t=>{
  let r;
  class Recognition{constructor(){r=this;}start(){this.onstart();}stop(){}abort(){}}
  const {d,phrases}=setup(t,{SpeechRecognition:Recognition});d.toggle();
  const late=r.onresult;d.toggle();assert.equal(d.state,'processing');d.toggle();
  late({results:[[{transcript:'Une ancienne phrase.'}]]});
  assert.equal(d.state,'idle');assert.deepEqual(phrases,[]);
});
