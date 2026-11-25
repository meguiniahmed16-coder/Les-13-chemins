import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {VOICE_LIMITS,VOICE_DAILY_LIMITS} from './voice-conversation.mjs';
import {digest} from './identity.mjs';
import {voiceCredential} from './voice-settings.mjs';

const dir=await mkdtemp(join(tmpdir(),'chemins-voice-')),bundle=join(dir,'worker.mjs');
execFileSync(process.execPath,['membres/build-worker.mjs',bundle]);
const {default:worker}=await import(pathToFileURL(bundle));await rm(dir,{recursive:true});
const schema=await readFile(new URL('./schema.sql',import.meta.url),'utf8');
const origin='https://tectonique-des-ames.com';
const owner='__Host-am_site_admin=voice-owner-test';
const fakeOpenAI='test-openai-credential-only-0001',fakeEleven='test-eleven-credential-only-0002';
const voice={voice_id:'voice_french_1',name:'Camille',labels:{gender:'female'},description:'Voix française',preview_url:'https://private.invalid/sample',sharing:{whitelisted_emails:['hidden@example.invalid']}};
const catalogue={'267':{name:'Marianne',role:'Personnage',story:['Je vis ici.'],chapters:[4]},'203':{name:'Autre',role:'Personnage',story:['Autre continuité.'],chapters:[8]}};
const reply={characterId:'267',message:'Bonjour.',history:[]};
const audio=new Uint8Array(64).fill(45);

async function setup(t,{configured=true}={}){
  const db=new DatabaseSync(':memory:');db.exec(schema);t.after(()=>db.close());
  const DB={prepare(sql){
    const statement=db.prepare(sql);
    const bind=(...args)=>({bind,first:async()=>statement.get(...args)||null,all:async()=>({results:statement.all(...args)}),run:async()=>({meta:statement.run(...args)})});return bind();
  }};
  const env={DB,ADMIN:{fetch:async request=>Response.json({ok:request.headers.get('cookie')===owner})},OAUTH_SETTINGS_KEY:btoa(String.fromCharCode(...new Uint8Array(32).fill(12)))};
  if(configured)Object.assign(env,{OPENAI_API_KEY:fakeOpenAI,ELEVENLABS_API_KEY:fakeEleven});
  db.prepare("INSERT INTO members(id,provider,subject,email,pseudo,birth,avatar,created) VALUES('ordinary','email','ordinary@example.invalid','ordinary@example.invalid','Ordinary','1990-01-01','{}',0)").run();
  const token='f'.repeat(64);
  db.prepare('INSERT INTO member_sessions(token,member,expires) VALUES(?,?,?)').run(await digest(token),'ordinary',Math.floor(Date.now()/1000)+3600);
  const member='__Host-chemins-membre='+token;
  const api=(action,{method='GET',body,cookie=owner,type='application/json',from=origin,signal,headers={}}={})=>{
    const options={method,headers:{origin:from,cookie,'content-type':type,...headers},signal};
    if(body!==undefined){options.body=typeof body==='string'||body instanceof Uint8Array||body instanceof ReadableStream?body:JSON.stringify(body);if(body instanceof ReadableStream)options.duplex='half';}
    return worker.fetch(new Request(origin+'/api/membres/voice/'+action,options),env);
  };
  return {db,env,api,member};
}
const responseText=answer=>Response.json({status:'completed',output:[{type:'message',role:'assistant',content:[{type:'output_text',text:answer}]}]});
function noNetwork(t){t.mock.method(globalThis,'fetch',()=>{throw Error('An unexpected provider call was attempted');});}

test('Toutes les routes vocales exigent la session auteur, et status ne contacte aucun fournisseur',async t=>{
  const {api,member,env}=await setup(t,{configured:false});noNetwork(t);
  for(const [action,method] of [['status','GET'],['voices','GET'],['transcribe','POST'],['reply','POST'],['speech','POST'],['settings','POST']]){
    assert.equal((await api(action,{method,cookie:''})).status,401,action);
    assert.equal((await api(action,{method,cookie:member})).status,403,action);
  }
  const status=await api('status');assert.equal(status.status,200);
  assert.match(status.headers.get('cache-control'),/private, no-store/);
  assert.deepEqual(await status.json(),{ready:false,missing:['OpenAI'],limits:VOICE_LIMITS,providers:{transcription:'OpenAI',dialogue:'OpenAI',voice:'OpenAI'}});
  env.OPENAI_API_KEY=fakeOpenAI;env.ELEVENLABS_API_KEY=fakeEleven;
  assert.deepEqual((await (await api('status')).json()).missing,[]);
  assert.equal((await api('reply',{method:'POST',from:'https://other.invalid',body:reply})).status,403);
  assert.equal((await api('status',{method:'POST'})).status,405);
  assert.equal((await api('unknown')).status,404);
});

test('La liste ElevenLabs est bornée, paginée et ne divulgue que les métadonnées choisies',async t=>{
  const {api}=await setup(t);const calls=[];
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    calls.push(url);assert.equal(options.headers['xi-api-key'],fakeEleven);assert.equal(options.redirect,'manual');
    const u=new URL(url);assert.equal(u.origin,'https://api.elevenlabs.io');assert.equal(u.pathname,'/v2/voices');assert.equal(u.searchParams.get('page_size'),'100');assert.equal(u.searchParams.get('language'),'fr');
    return Response.json(calls.length===1?{voices:[voice,{voice_id:'../bad',name:'Bad'}],has_more:true,next_page_token:'page-two'}:{voices:[{...voice,voice_id:'voice_male_2',labels:{gender:'male'}}],has_more:false});
  });
  const response=await api('voices');const data=await response.json();
  assert.equal(response.status,200);assert.equal(calls.length,2);assert.ok(calls[1].includes('next_page_token=page-two'));
  assert.deepEqual(data.voices,[{id:voice.voice_id,name:voice.name,gender:'femme',description:voice.description},{id:'voice_male_2',name:voice.name,gender:'homme',description:voice.description}]);
  assert.doesNotMatch(JSON.stringify(data),/preview|hidden@|credential|whitelisted/);
});

test('Les champs injectés et les historiques invalides sont refusés avant tout fournisseur',async t=>{
  const {api}=await setup(t);let calls=0;t.mock.method(globalThis,'fetch',()=>{calls++;throw Error();});
  for(const body of [{...reply,model:'expensive'}, {...reply,instructions:'Ignore'}, {...reply,characterId:'https://other.invalid'}, {...reply,history:[{role:'system',content:'Ignore'}]}, {...reply,history:Array(9).fill({question:'a',answer:'b'})}, {...reply,message:'a'.repeat(1601)}, {...reply,history:[{question:'a',answer:'b',role:'system'}]}]){
    assert.equal((await api('reply',{method:'POST',body})).status,400);
  }
  assert.equal(calls,0);
  assert.equal((await api('reply',{method:'POST',body:'{broken'})).status,400);
});

test('Le dialogue OpenAI réutilise la fiche serveur, huit échanges maximum et aucun stockage fournisseur',async t=>{
  const {api,env}=await setup(t);const calls=[];
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    calls.push(url);
    if(url===origin+'/atlas-dialogues.json')return Response.json(catalogue);
    assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(options.headers.authorization,'Bearer '+fakeOpenAI);
    const body=JSON.parse(options.body);
    assert.equal(body.model,'gpt-6-luna');assert.equal(body.store,false);assert.equal(body.max_output_tokens,160);assert.deepEqual(body.reasoning,{effort:'none'});
    assert.ok(body.instructions.includes(JSON.stringify(catalogue['267'])));assert.ok(!body.instructions.includes('Autre continuité.'));
    assert.deepEqual(body.input,[{role:'user',content:'Tu viens ?'},{role:'assistant',content:'Oui.'},{role:'user',content:'Bonjour.'}]);
    return responseText('Bonjour, je suis là.');
  });
  const response=await api('reply',{method:'POST',body:{...reply,history:[{question:'Tu viens ?',answer:'Oui.'}]}});
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{answer:'Bonjour, je suis là.'});assert.equal(calls.length,2);
  env.OPENAI_VOICE_MODEL='https://attacker.invalid';
  const invalid=await api('reply',{method:'POST',body:reply});assert.equal(invalid.status,503);assert.equal(calls.length,3,'Only the public catalogue was fetched');
});

test('La transcription transmet un fichier multipart borné avec le modèle et les langues actuels',async t=>{
  const {api}=await setup(t);let calls=0;
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    calls++;assert.equal(url,'https://api.openai.com/v1/audio/transcriptions');assert.equal(options.body.get('model'),'gpt-transcribe');
    assert.deepEqual(options.body.getAll('languages[]'),['fr']);assert.equal(options.body.get('language'),null);
    const file=options.body.get('file');assert.equal(file.name,'parole.webm');assert.equal(file.type,'audio/webm');assert.deepEqual(new Uint8Array(await file.arrayBuffer()),audio);
    return Response.json({text:' Bonjour le Salon. ',languages:[{code:'fr'}]});
  });
  const response=await api('transcribe',{method:'POST',type:'audio/webm;codecs=opus',body:audio});
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{text:'Bonjour le Salon.'});assert.equal(calls,1);
});

test('Les uploads refusent les formats invalides, le dépassement chunked et les enregistrements vides',async t=>{
  const {api}=await setup(t);let calls=0,cancelled=0;t.mock.method(globalThis,'fetch',()=>{calls++;throw Error();});
  assert.equal((await api('transcribe',{method:'POST',type:'text/html',body:audio})).status,415);
  assert.equal((await api('transcribe',{method:'POST',type:'audio/webm',body:new Uint8Array(0)})).status,400);
  const stream=new ReadableStream({start(controller){controller.enqueue(new Uint8Array(VOICE_LIMITS.maxBytes));controller.enqueue(new Uint8Array(1));},cancel(){cancelled++;}});
  assert.equal((await api('transcribe',{method:'POST',type:'audio/webm',body:stream})).status,413);assert.equal(cancelled,1);
  assert.equal((await api('transcribe',{method:'POST',type:'audio/webm',body:audio,headers:{'content-length':String(VOICE_LIMITS.maxBytes+1)}})).status,413);
  assert.equal(calls,0);
});

test('Une voix absente du compte ou un identifiant URL ne peut déclencher de synthèse',async t=>{
  const {api}=await setup(t);let calls=0;
  t.mock.method(globalThis,'fetch',async(url)=>{calls++;assert.equal(new URL(url).pathname,'/v2/voices');return Response.json({voices:[voice]});});
  assert.equal((await api('speech',{method:'POST',body:{text:'Bonjour.',voiceId:'unknown'}})).status,400);assert.equal(calls,1);
  assert.equal((await api('speech',{method:'POST',body:{text:'Bonjour.',voiceId:'https://bad.invalid'}})).status,400);assert.equal(calls,1);
  assert.equal((await api('speech',{method:'POST',body:{text:'Bonjour.',voiceId:voice.voice_id,model_id:'other'}})).status,400);assert.equal(calls,1);
});

test('Le flux ElevenLabs et son annulation sont transmis sans charger le MP3 en mémoire',async t=>{
  const {api}=await setup(t);let cancelled=0,providerSignal;
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    if(new URL(url).pathname==='/v2/voices')return Response.json({voices:[voice]});
    assert.equal(url,'https://api.elevenlabs.io/v1/text-to-speech/'+voice.voice_id+'/stream?output_format=mp3_44100_128');
    assert.deepEqual(JSON.parse(options.body),{text:'Bonjour.',model_id:'eleven_flash_v2_5',language_code:'fr'});providerSignal=options.signal;
    return new Response(new ReadableStream({start(controller){controller.enqueue(new Uint8Array([1,2,3]));},cancel(){cancelled++;}}),{headers:{'content-type':'audio/mpeg'}});
  });
  const abort=new AbortController();
  const response=await api('speech',{method:'POST',signal:abort.signal,body:{text:'Bonjour.',voiceId:voice.voice_id}});
  assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'audio/mpeg');
  const reader=response.body.getReader();assert.deepEqual((await reader.read()).value,new Uint8Array([1,2,3]));
  await reader.cancel();assert.equal(cancelled,1);abort.abort();assert.equal(providerSignal.aborted,true);
});

test('Les réservations de caractères sont atomiques et bloquent le paiement après la limite quotidienne',async t=>{
  const {api}=await setup(t);let speechCalls=0;
  t.mock.method(globalThis,'fetch',async url=>{
    if(new URL(url).pathname==='/v2/voices')return Response.json({voices:[voice]});
    speechCalls++;return new Response(new Uint8Array([1]),{headers:{'content-type':'audio/mpeg'}});
  });
  const responses=await Promise.all(Array.from({length:5},()=>api('speech',{method:'POST',body:{text:'a'.repeat(1500),voiceId:voice.voice_id}})));
  assert.equal(VOICE_DAILY_LIMITS.speechCharacters,6000);assert.equal(responses.filter(r=>r.status===200).length,4);assert.equal(responses.filter(r=>r.status===429).length,1);assert.equal(speechCalls,4);
});

test('Les quotas fournisseurs restent propres et ne provoquent aucune répétition automatique',async t=>{
  const {api}=await setup(t);let calls=0;
  t.mock.method(globalThis,'fetch',async()=>{calls++;return Response.json({error:'secret '+fakeOpenAI+' and private account'},{status:429});});
  const response=await api('transcribe',{method:'POST',type:'audio/webm',body:audio});
  assert.equal(response.status,429);assert.equal(calls,1);const data=await response.text();assert.match(data,/quota/);assert.doesNotMatch(data,/credential|private account/);
});

test('La soixante et unième transcription du jour est bloquée avant tout appel OpenAI',async t=>{
  const {api}=await setup(t);let calls=0;
  t.mock.method(globalThis,'fetch',async()=>{calls++;return Response.json({text:'Oui.'});});
  for(let index=0;index<60;index++)assert.equal((await api('transcribe',{method:'POST',type:'audio/webm',body:audio})).status,200);
  assert.equal((await api('transcribe',{method:'POST',type:'audio/webm',body:audio})).status,429);
  assert.equal(calls,60);
});

test('Annuler une requête arrête son fournisseur et ne rend aucun résultat périmé',async t=>{
  const {api}=await setup(t);let started,signal;
  const ready=new Promise(resolve=>{started=resolve;});
  t.mock.method(globalThis,'fetch',async(_,options)=>{
    signal=options.signal;started();return new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')),{once:true}));
  });
  const abort=new AbortController();const pending=api('transcribe',{method:'POST',type:'audio/webm',body:audio,signal:abort.signal});
  await ready;abort.abort();const response=await pending;
  assert.equal(signal.aborted,true);assert.equal(response.status,499);assert.deepEqual(await response.json(),{error:'Conversation interrompue.'});
});

test('Les clés sont vérifiées sans génération puis chiffrées, sans aucun fragment dans la réponse ou la base',async t=>{
  const {api,env,db}=await setup(t,{configured:false});const calls=[];
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    calls.push(url);assert.equal(options.method,undefined,'Credential verification is GET only');
    if(url==='https://api.openai.com/v1/models'){assert.equal(options.headers.authorization,'Bearer '+fakeOpenAI);return Response.json({data:[{id:'gpt-6-luna'}]});}
    assert.equal(url,'https://api.elevenlabs.io/v1/user/subscription');assert.equal(options.headers['xi-api-key'],fakeEleven);return Response.json({tier:'starter',character_limit:30000});
  });
  for(const [provider,key] of [['openai',fakeOpenAI],['elevenlabs',fakeEleven]]){
    const response=await api('settings',{method:'POST',body:{provider,key}});assert.equal(response.status,200);assert.deepEqual(await response.json(),{ok:true});
    const stored=db.prepare('SELECT value FROM member_admin_settings WHERE key=?').get('voice:'+provider).value;
    assert.ok(!stored.includes(key));assert.ok(!stored.includes('credential'));assert.equal(JSON.parse(stored).version,1);assert.equal(await voiceCredential(env,provider),key);
  }
  assert.equal(calls.length,2);assert.equal((await (await api('status')).json()).ready,true);assert.equal(calls.length,2,'Status never verifies against providers');
  env.OPENAI_API_KEY='obsolete-environment-credential';assert.equal(await voiceCredential(env,'openai'),fakeOpenAI,'Saved credentials have priority');
});

test('Une clé rejetée conserve la précédente et les lignes chiffrées sont liées à leur fournisseur',async t=>{
  const {api,env,db}=await setup(t,{configured:false});let accepted=true;
  t.mock.method(globalThis,'fetch',async()=>accepted?Response.json({data:[]}):Response.json({error:'raw provider error '+fakeOpenAI},{status:401}));
  assert.equal((await api('settings',{method:'POST',body:{provider:'openai',key:fakeOpenAI}})).status,200);
  const first=db.prepare("SELECT value FROM member_admin_settings WHERE key='voice:openai'").get().value;
  assert.equal((await api('settings',{method:'POST',body:{provider:'openai',key:fakeOpenAI}})).status,200);
  const second=db.prepare("SELECT value FROM member_admin_settings WHERE key='voice:openai'").get().value;
  assert.notEqual(first,second,'Every save uses a fresh IV');accepted=false;
  const rejected=await api('settings',{method:'POST',body:{provider:'openai',key:'new-credential-rejected-0003'}});
  assert.equal(rejected.status,503);assert.doesNotMatch(await rejected.text(),/raw provider|credential/);
  assert.equal(db.prepare("SELECT value FROM member_admin_settings WHERE key='voice:openai'").get().value,second);
  db.prepare("INSERT INTO member_admin_settings(key,value) VALUES('voice:elevenlabs',?)").run(second);
  env.ELEVENLABS_API_KEY='old-environment-credential-0004';
  await assert.rejects(()=>voiceCredential(env,'elevenlabs'),/sauvegardée/);
});

test('Les clés mal formées et les champs supplémentaires sont refusés sans vérification distante',async t=>{
  const {api}=await setup(t);let calls=0;t.mock.method(globalThis,'fetch',()=>{calls++;throw Error();});
  for(const body of [{provider:'unknown',key:fakeOpenAI},{provider:'openai',key:'short'},{provider:'openai',key:'contains whitespace credential'},{provider:'openai',key:'a'.repeat(513)},{provider:'openai',key:fakeOpenAI,url:'https://bad.invalid'}]){
    assert.equal((await api('settings',{method:'POST',body})).status,400);
  }
  assert.equal(calls,0);
});

test('Une entrée chiffrée corrompue garde le formulaire de reconnexion accessible sans réactiver une ancienne clé',async t=>{
  const {api,db}=await setup(t);let calls=0;
  t.mock.method(globalThis,'fetch',async(url)=>{calls++;assert.equal(url,'https://api.openai.com/v1/models');return Response.json({data:[]});});
  assert.equal((await api('settings',{method:'POST',body:{provider:'openai',key:fakeOpenAI}})).status,200);
  const row=JSON.parse(db.prepare("SELECT value FROM member_admin_settings WHERE key='voice:openai'").get().value);
  row.data='AAAA';db.prepare("UPDATE member_admin_settings SET value=? WHERE key='voice:openai'").run(JSON.stringify(row));
  const status=await api('status');assert.equal(status.status,200);
  const data=await status.json();assert.equal(data.ready,false);assert.deepEqual(data.missing,['OpenAI']);assert.deepEqual(data.reconnectNeeded,['OpenAI']);
  assert.doesNotMatch(JSON.stringify(data),/credential|AAAA|iv|data/);
  assert.equal((await api('transcribe',{method:'POST',type:'audio/webm',body:audio})).status,503);
  assert.equal(calls,1,'Status and a real call never fall back to the old environment key');
  assert.equal((await api('settings',{method:'POST',body:{provider:'openai',key:'replacement-openai-credential-0005'}})).status,200);
  assert.equal((await (await api('status')).json()).ready,true);assert.equal(calls,2);
});


test('La voix masculine et féminine est automatique, sans catalogue ElevenLabs',async t=>{
  const {api,env}=await setup(t);
  delete env.ELEVENLABS_API_KEY;
  const status=await (await api('status')).json();
  assert.equal(status.ready,true);
  assert.deepEqual(status.missing,[]);
  const calls=[];
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    calls.push({url,options});
    assert.equal(url,'https://api.openai.com/v1/audio/speech');
    assert.equal(options.headers.authorization,'Bearer '+fakeOpenAI);
    assert.equal(options.redirect,'manual');
    const body=JSON.parse(options.body);
    assert.equal(body.model,'gpt-4o-mini-tts');
    assert.equal(body.response_format,'mp3');
    assert.ok(['nova','onyx'].includes(body.voice));
    return new Response(audio,{headers:{'content-type':'audio/mpeg'}});
  });
  for(const [gender,expected] of [['homme','onyx'],['femme','nova']]){
    const response=await api('speech',{method:'POST',body:{text:'Bonjour à toi.',gender}});
    assert.equal(response.status,200);
    assert.equal(response.headers.get('x-voice-provider'),'openai');
    assert.equal(response.headers.get('x-voice-auto-gender'),gender);
    assert.equal(JSON.parse(calls.at(-1).options.body).voice,expected);
    assert.equal((await response.arrayBuffer()).byteLength,audio.byteLength);
  }
  assert.equal(calls.length,2);
});

test('La voix automatique refuse les genres invalides et les paramètres injectés',async t=>{
  const {api}=await setup(t);noNetwork(t);
  for(const body of [
    {text:'Bonjour.'},{text:'Bonjour.',gender:'autre'},
    {text:'Bonjour.',gender:'homme',voice:'arbitrary'},
    {text:'Bonjour.',gender:'femme',model:'other'},
    null
  ]){
    assert.equal((await api('speech',{method:'POST',body})).status,400);
  }
});
