import test from 'node:test';
import assert from 'node:assert/strict';
import proxy,{cinematicAudioKey,cinematicSpeechBody,serveCinemaAudio} from './proxy.mjs';

const origin='https://tectonique-des-ames.com';
function request(path,{body,method='POST',type='application/json',signal,headers={}}={}){
  const options={method,signal,headers:{origin,'content-type':type,cookie:'other=discard; __Host-am_site_admin=test-session',...headers}};
  if(body!==undefined){options.body=body;if(body instanceof ReadableStream)options.duplex='half';}
  return new Request(origin+'/api/membres/'+path,options);
}
test('Le proxy conserve le corps audio et son type, ainsi que la seule session autorisée',async t=>{
  const audio=new Uint8Array(20000).fill(9);
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    assert.equal(url,'https://treize-chemins-membres.meguiniahmed16.workers.dev/api/membres/voice/transcribe');
    assert.equal(options.headers['content-type'],'audio/webm;codecs=opus');assert.equal(options.headers.cookie,'__Host-am_site_admin=test-session');
    assert.deepEqual(options.body,audio);return Response.json({text:'Bonjour.'});
  });
  const response=await proxy(request('voice/transcribe',{type:'audio/webm;codecs=opus',body:audio}));assert.equal(response.status,200);assert.deepEqual(await response.json(),{text:'Bonjour.'});
});
test('Le proxy refuse les flux trop grands, même sans taille déclarée, sans contacter le backend',async t=>{
  let calls=0,cancelled=0;t.mock.method(globalThis,'fetch',()=>{calls++;throw Error();});
  const audio=new ReadableStream({start(controller){controller.enqueue(new Uint8Array(2*1024*1024));controller.enqueue(new Uint8Array(1));},cancel(){cancelled++;}});
  assert.equal((await proxy(request('voice/transcribe',{type:'audio/webm',body:audio}))).status,413);
  assert.equal(cancelled,1);assert.equal(calls,0);
  assert.equal((await proxy(request('voice/reply',{body:'a'.repeat(48*1024+1)}))).status,413);
  assert.equal((await proxy(request('profile',{body:'a'.repeat(16001)}))).status,413);assert.equal(calls,0);
});
test('Les requêtes JSON vocales acceptent les historiques bornés, sans changer les anciennes routes',async t=>{
  const body=JSON.stringify({history:'é'.repeat(12000)});const calls=[];
  t.mock.method(globalThis,'fetch',async(url,options)=>{calls.push({url,options});return Response.json({ok:true});});
  assert.equal((await proxy(request('voice/reply',{body}))).status,200);assert.equal(calls[0].options.body,body);
  assert.equal(calls[0].options.headers['content-type'],'application/json');
  assert.equal((await proxy(request('profile',{body:JSON.stringify({pseudo:'Ahmed'})}))).status,200);
  assert.equal(calls[1].options.body,JSON.stringify({pseudo:'Ahmed'}));
});
test('Le proxy conserve la redirection de connexion administrateur et bloque les origines externes',async t=>{
  let calls=0;t.mock.method(globalThis,'fetch',async(url,options)=>{
    calls++;assert.equal(url,'https://ahmed-marie-double.meguiniahmed16.workers.dev/web-admin/auth/login');assert.deepEqual(JSON.parse(options.body),{username:'admin',password:'fake-password'});return Response.json({ok:true});
  });
  assert.equal((await proxy(request('login',{body:JSON.stringify({email:'meguiniahmed16@gmail.com',password:'fake-password'})}))).status,200);
  assert.equal((await proxy(request('voice/transcribe',{body:new Uint8Array(64),headers:{origin:'https://external.invalid'}}))).status,403);assert.equal(calls,1);
});
test('L’annulation téléphone arrive au backend et son résultat tardif est écarté',async t=>{
  let begin,signal;const started=new Promise(resolve=>{begin=resolve;});
  t.mock.method(globalThis,'fetch',async(_,options)=>{signal=options.signal;begin();return new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')),{once:true}));});
  const controller=new AbortController(),pending=proxy(request('voice/reply',{body:'{}',signal:controller.signal}));
  await started;controller.abort();const response=await pending;
  assert.equal(signal.aborted,true);assert.equal(response.status,499);
});
test('L’annulation d’un upload encore ouvert libère le lecteur sans requête backend',async t=>{
  let calls=0,cancelled=0;t.mock.method(globalThis,'fetch',()=>{calls++;throw Error();});
  const controller=new AbortController();
  const body=new ReadableStream({start(stream){stream.enqueue(new Uint8Array(64));},cancel(){cancelled++;}});
  const pending=proxy(request('voice/transcribe',{body,type:'audio/webm',signal:controller.signal}));
  await new Promise(resolve=>setImmediate(resolve));controller.abort();
  assert.equal((await pending).status,499);assert.equal(cancelled,1);assert.equal(calls,0);
});
test('La réponse audio reste un flux annulable au travers du proxy',async t=>{
  let cancelled=0;t.mock.method(globalThis,'fetch',async()=>new Response(new ReadableStream({start(controller){controller.enqueue(new Uint8Array([7]));},cancel(){cancelled++;}}),{headers:{'content-type':'audio/mpeg'}}));
  const response=await proxy(request('voice/speech',{body:'{}'}));assert.equal(response.headers.get('content-type'),'audio/mpeg');
  const reader=response.body.getReader();assert.deepEqual((await reader.read()).value,new Uint8Array([7]));await reader.cancel();assert.equal(cancelled,1);
});

test('Les répliques fixes seulement sont identifiées par texte, personnage et voix',()=>{
 const cue={text:'Prends place.',gender:'homme',voiceId:'voice-originale',strict:true,purpose:'cinema'};
 const key=cinematicAudioKey(JSON.stringify(cue));assert.match(key,/^[a-f0-9]{64}$/);
 assert.notEqual(key,cinematicAudioKey(JSON.stringify({...cue,voiceId:'autre-voix'})));
 for(const body of [{...cue,purpose:undefined},{...cue,text:'Un dialogue privé.'},{...cue,gender:'femme'},{...cue,strict:false},{...cue,extra:1}])assert.equal(cinematicAudioKey(JSON.stringify(body)),null);
});
function cinemaFixture(){
 const entries=new Map(),claims=new Set();let syntheses=0,authorizations=0;
 const storeFactory=()=>({getWithMetadata:async key=>entries.get(key)||null,set:async(key,data,{metadata})=>{if(!entries.has(key))entries.set(key,{data,metadata});return {modified:true};}});
 const claimFactory=()=>({set:async key=>{if(claims.has(key))return {modified:false};claims.add(key);return {modified:true};},delete:async key=>{claims.delete(key);}});
 const upstream=async()=>{syntheses++;return new Response(new Uint8Array([1,2,3]),{headers:{'content-type':'audio/wav','x-voice-provider':'cartesia'}});};
 const opts={key:'fixed',storeFactory,claimFactory,upstream,wait:async()=>{},authorize:async()=>{authorizations++;return true;}};
 return {entries,claims,opts,get syntheses(){return syntheses;},get authorizations(){return authorizations;}};
}
test('Le son est conservé, vérifié puis distribué sans nouvelle synthèse',async()=>{
 const h=cinemaFixture();const first=await serveCinemaAudio(h.opts);assert.equal(first.headers.get('x-cinema-audio-cache'),'stored');
 assert.deepEqual([...new Uint8Array(await first.arrayBuffer())],[1,2,3]);
 const next=await serveCinemaAudio({...h.opts});assert.equal(next.headers.get('x-cinema-audio-cache'),'hit');assert.equal(h.syntheses,1);assert.equal(h.authorizations,2);
 assert.deepEqual([...new Uint8Array(await next.arrayBuffer())],[1,2,3]);
 const denied=await serveCinemaAudio({...h.opts,authorize:async()=>false});assert.equal(denied.status,403);assert.equal(h.syntheses,1);
});
test('Une panne de lecture du stockage ne déclenche jamais une synthèse',async()=>{
 const h=cinemaFixture();const response=await serveCinemaAudio({...h.opts,storeFactory:()=>{throw Error('storage unavailable');}});
 assert.equal(response.status,503);assert.equal(h.syntheses,0);
});
test('Une synthèse non sauvegardée ne peut pas être facturée à nouveau automatiquement',async()=>{
 const h=cinemaFixture(),opts={...h.opts,storeFactory:()=>({getWithMetadata:async()=>null,set:async()=>{throw Error('write failure');}})};
 assert.equal((await serveCinemaAudio(opts)).status,503);
 assert.equal((await serveCinemaAudio(opts)).status,503);assert.equal(h.syntheses,1);
});
test('La prononciation de Recentrer est corrigée sans modifier le texte affiché, et seul ce fichier change de clé',()=>{
 const text='Si tu perds ton personnage de vue, touche Recentrer. Tu le retrouves sans devoir tout recommencer.';
 const cue={text,gender:'homme',voiceId:'voice-originale',strict:true,purpose:'cinema'},body=JSON.stringify(cue);
 assert.equal(JSON.parse(cinematicSpeechBody(body)).text,'Si tu perds ton personnage de vue, touche recentré. Tu le retrouves sans devoir tout recommencer.');
 assert.equal(cue.text,text);assert.match(cinematicAudioKey(body),/^[a-f0-9]{64}$/);
 const normal=JSON.stringify({...cue,text:'Prends place.'});assert.equal(cinematicSpeechBody(normal),normal);
});
