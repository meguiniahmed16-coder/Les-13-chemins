import test from 'node:test';
import assert from 'node:assert/strict';
import {createVoiceConversation} from './salon-conversation.js';
import {createDialogue} from './salon-dialogue.js';

const settle=()=>new Promise(resolve=>setImmediate(resolve));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
function harness(custom={}){
  const captures=[],requests=[],questions=[],answers=[],states=[],statuses=[],timers=new Map();
  let current={id:'258',history:[]},timerId=0,audio=null,unlocks=0,stops=0;
  const page=new EventTarget();page.hidden=false;const windowTarget=new EventTarget();
  const speech={
    unlock(){unlocks++;return true;},
    play(){audio=deferred();return audio.promise;},
    stop(){stops++;if(audio){audio.reject(new DOMException('Stop','AbortError'));audio=null;}},
    dispose(){this.stop();},position(){return {fraction:.3,energy:.02};}
  };
  const request=async(path,options={})=>{
    requests.push({path,...options});
    const result=custom.request?.(path,options);
    if(result!==undefined)return result;
    if(path==='status')return {ready:true};
    if(path==='voices')return {voices:[{id:'voice-fr',name:'Voix française',gender:'femme'}]};
    if(path==='transcribe')return {text:'Bonjour Marianne.'};
    if(path==='reply')return {answer:'Bonjour, Ahmed.'};
    if(path==='speech')return new Blob(['audio'],{type:'audio/mpeg'});
    throw new Error('Unexpected '+path);
  };
  const controller=createVoiceConversation({
    character:()=>current,request,page,windowTarget,
    onQuestion:q=>questions.push(q),onAnswer:(q,a)=>{answers.push(a);current.history.push({question:q,answer:a});},
    onState:s=>states.push(s),onStatus:s=>statuses.push(s),
    captureFactory:options=>{
      const capture={...options,active:false,supported:true,async start(){this.active=true;},stop(){this.active=false;},finish(){this.onClip(new Blob(['mic'],{type:'audio/webm'}));}};
      captures.push(capture);return capture;
    },speechFactory:()=>speech,
    setTimer:fn=>{timers.set(++timerId,fn);return timerId;},clearTimer:id=>timers.delete(id),
    ...custom.controller
  });
  return {controller,captures,requests,questions,answers,states,statuses,page,windowTarget,timers,
    setCharacter:value=>{current=value;},finishAudio:()=>{audio?.resolve();audio=null;},
    get unlocks(){return unlocks;},get stops(){return stops;}
  };
}
async function start(h){await h.controller.refresh();await h.controller.start('voice-fr');assert.equal(h.controller.state,'listening');}

test('Une prise de parole donne une seule réponse puis réarme le micro après la fin réelle du son',async()=>{
  const h=harness();await start(h);
  const first=h.captures[0];first.finish();first.finish();await settle();
  assert.equal(h.controller.state,'speaking');assert.equal(first.active,false);
  assert.equal(h.requests.filter(r=>r.path==='transcribe').length,1);
  assert.deepEqual(h.questions,['Bonjour Marianne.']);assert.deepEqual(h.answers,['Bonjour, Ahmed.']);
  assert.equal(h.captures.length,1,'Le micro reste arrêté pendant la lecture.');
  h.finishAudio();await settle();assert.equal(h.captures.length,2);assert.equal(h.controller.state,'listening');
  h.controller.stop();assert.equal(h.captures[1].active,false);assert.equal(h.timers.size,0);
});

test('Une interruption pendant la réponse annule sa requête et ignore son arrivée tardive',async()=>{
  const delayed=deferred();const h=harness({request:path=>path==='reply'?delayed.promise:undefined});
  await start(h);h.captures[0].finish();await settle();assert.equal(h.controller.state,'thinking');
  const reply=h.requests.find(r=>r.path==='reply');h.controller.interrupt();await settle();
  assert.equal(reply.signal.aborted,true);assert.equal(h.captures.length,2);
  delayed.resolve({answer:'Ancienne réponse.'});await settle();
  assert.deepEqual(h.answers,[]);assert.equal(h.requests.some(r=>r.path==='speech'),false);
  assert.equal(h.controller.state,'listening');h.controller.stop();
});

test('Quitter l’écran coupe le micro et demande une reprise explicite',async()=>{
  const h=harness();await start(h);h.page.hidden=true;h.page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(h.controller.state,'paused');assert.equal(h.captures[0].active,false);
  h.page.hidden=false;h.page.dispatchEvent(new Event('visibilitychange'));await settle();
  assert.equal(h.captures.length,1);assert.equal(h.controller.active,false);assert.equal(h.timers.size,0);
});

test('Fermer pendant la transcription empêche toute réponse ou reprise du micro',async()=>{
  const delayed=deferred();const h=harness({request:path=>path==='transcribe'?delayed.promise:undefined});
  await start(h);h.captures[0].finish();await settle();h.controller.stop();
  delayed.resolve({text:'Texte tardif.'});await settle();
  assert.deepEqual(h.questions,[]);assert.equal(h.requests.some(r=>r.path==='reply'),false);
  assert.equal(h.captures.length,1);assert.equal(h.controller.state,'idle');
});

test('Les connexions manquantes ne déclenchent pas de permission micro ni de génération',async()=>{
  const h=harness({request:path=>path==='status'?{ready:false,missing:['OpenAI','ElevenLabs']}:undefined});
  await h.controller.refresh();await h.controller.start('voice-fr');
  assert.equal(h.captures.length,0);assert.equal(h.controller.state,'paused');
  assert.ok(h.requests.every(r=>r.path==='status'));assert.match(h.statuses.at(-1),/raccordement/);
});

test('Une clé ElevenLabs refusée garde le panneau propriétaire accessible pour la remplacer',async()=>{
  const h=harness({request:path=>path==='voices'?Promise.reject(Object.assign(new Error('Vérifie la connexion ElevenLabs.'),{status:503})):undefined});
  const result=await h.controller.refresh();
  assert.equal(result.status.ready,true);assert.deepEqual(result.voices,[]);assert.match(result.voiceError,/ElevenLabs/);
  assert.equal(h.captures.length,0);
});

test('Une erreur de quota conserve le texte et suspend la boucle sans réessai automatique',async()=>{
  const h=harness({request:path=>path==='reply'?Promise.reject(new Error('Le quota du jour est atteint.')):undefined});
  await start(h);h.captures[0].finish();await settle();
  assert.equal(h.controller.state,'paused');assert.deepEqual(h.questions,['Bonjour Marianne.']);
  assert.equal(h.captures.length,1);assert.match(h.statuses.at(-1),/quota/);
});

test('Interrompre la lecture coupe le son, démarre une seule écoute et ne réarme pas l’ancien tour',async()=>{
  const h=harness();await start(h);h.captures[0].finish();await settle();
  assert.equal(h.controller.state,'speaking');h.controller.interrupt();await settle();
  assert.equal(h.controller.state,'listening');assert.equal(h.captures.length,2);
  await settle();assert.equal(h.captures.length,2);h.controller.stop();
});

test('Un changement de personnage rend les anciennes réponses inapplicables',async()=>{
  const delayed=deferred();const h=harness({request:path=>path==='reply'?delayed.promise:undefined});
  await start(h);h.captures[0].finish();await settle();h.setCharacter({id:'7',history:[]});
  delayed.resolve({answer:'Réponse de Marianne.'});await settle();assert.deepEqual(h.answers,[]);
  h.controller.stop();
});

test('La limite de session coupe le micro sans redémarrage en arrière-plan',async()=>{
  const h=harness();await start(h);const timeout=[...h.timers.values()][0];timeout();
  assert.equal(h.controller.state,'paused');assert.equal(h.captures[0].active,false);assert.equal(h.timers.size,0);
});

test('Le son est déverrouillé synchroniquement dans le geste de démarrage',async()=>{
  const h=harness();await h.controller.refresh();const pending=h.controller.start('voice-fr');
  assert.equal(h.unlocks,1);await pending;h.controller.stop();
});

test('La voix distante entraîne les lèvres depuis son horloge et les ferme pendant le silence',()=>{
  let energy=0,fraction=.3,stopped=0;
  const dialogue=createDialogue({start(){},word(){},rest(){},wake(){},synth:null,now:()=>0});
  const audio={position:()=>({fraction,energy}),stop:()=>stopped++};
  dialogue.playExternal('guest','Bonjour, comment vas-tu ce matin ?',audio);
  assert.equal(dialogue.frame().jaw,0);
  energy=.06;
  const poses=[];for(let i=1;i<9;i++){fraction=i/10;poses.push(dialogue.frame().jaw);}
  assert.ok(poses.some(x=>x>0),'Les lèvres réagissent à la parole.');
  dialogue.clear();assert.equal(stopped,1);assert.equal(dialogue.frame(),null);
});
