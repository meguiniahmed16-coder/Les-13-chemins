import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {showIntroStartupFailure,startIntro} from './intro-startup.js';

const html=readFileSync(new URL('./intro-prive.html',import.meta.url),'utf8');
const storageKey='maison-des-rencontres-prologue-original-v3';

// Read the real shell's IDs, initial visibility, disabled controls and labels.
// The fixture supplies only browser effects; a missing production element
// must fail rather than being silently created by the test.
function fixture({storageFailure=null,prior=[]}={}){
 const nodes=new Map(),domReads=[],downloads=[],blobs=new Map(),revoked=[],timers=[],transmissions=[];
 const stored=new Map([[storageKey,JSON.stringify(prior)]]);
 let reloads=0,storageReads=0,storageWrites=0;
 function element(tag,attributes=new Map(),text=''){
  const classes=new Set((attributes.get('class')||'').split(/\s+/).filter(Boolean));
  return {
   tagName:tag.toUpperCase(),hidden:attributes.has('hidden'),disabled:attributes.has('disabled'),
   textContent:text,value:attributes.get('value')||'',open:false,onclick:null,
   classList:{add(...values){values.forEach(value=>classes.add(value));},contains(value){return classes.has(value);}},
   setAttribute(name,value){attributes.set(name,String(value));},
   getAttribute(name){return attributes.get(name)??null;},
   showModal(){this.open=true;},close(){this.open=false;},
   click(){
    if(this.disabled)return;
    if(tag==='a')downloads.push({href:this.href,download:this.download});
    this.onclick?.();
   },
   snapshot(){return {hidden:this.hidden,disabled:this.disabled,textContent:this.textContent,value:this.value,open:this.open,onclick:this.onclick,attributes:[...attributes],classes:[...classes]};}
  };
 }
 for(const match of html.matchAll(/<([\w-]+)\b([^>]*\bid="([^"]+)"[^>]*)>/g)){
  const attributes=new Map([...match[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(value=>[value[1],value[2]??'']));
  const tail=html.slice(match.index+match[0].length);
  const node=element(match[1],attributes,tail.match(/^[^<]*/)?.[0]||'');
  if(match[1]==='select')node.value=tail.match(/<option\b[^>]*value="([^"]*)"/)?.[1]||'';
  nodes.set(match[3],node);
 }
 const $=id=>{assert.ok(nodes.has(id),`The real introduction shell has no #${id}`);return nodes.get(id);};
 const send=(...args)=>{transmissions.push(args);throw Error('Startup reports must not send network requests');};
 const document={
  getElementById(id){domReads.push(id);return $(id);},
  createElement:tag=>element(tag),
 };
 const window={
  innerWidth:390,innerHeight:844,
  location:{reload(){reloads++;}},
  get localStorage(){
   storageReads++;
   if(storageFailure==='getter')throw Error('Storage access denied');
   return {
    getItem(key){if(storageFailure==='methods')throw Error('Storage read denied');return stored.get(key)??null;},
    setItem(key,value){storageWrites++;if(storageFailure==='methods')throw Error('Storage write denied');stored.set(key,value);},
   };
  },
  Blob,
  URL:{
   createObjectURL(blob){const url='blob:intro-report/'+(blobs.size+1);blobs.set(url,blob);return url;},
   revokeObjectURL:url=>revoked.push(url),
  },
  setTimeout(callback,delay){timers.push({callback,delay});return timers.length;},
  fetch:send,navigator:{sendBeacon:send},XMLHttpRequest:class {constructor(){send('XMLHttpRequest');}},
 };
 return {$,nodes,document,window,environment:{document,window},stored,domReads,downloads,blobs,revoked,timers,transmissions,send,
  snapshot:()=>[...nodes].map(([id,node])=>[id,node.snapshot()]),
  get reloads(){return reloads;},get storageReads(){return storageReads;},get storageWrites(){return storageWrites;}
 };
}

function assertGraphicsFailure(h){
 assert.equal(h.$('loading').hidden,false);
 assert.equal(h.$('loading').getAttribute('role'),'alert');
 assert.equal(h.$('loading').classList.contains('startup-failed'),true);
 assert.equal(h.$('welcome').hidden,true);
 assert.match(h.$('load-title').textContent,/3D indisponible/);
 assert.match(h.$('load-description').textContent,/navigateur.*cinématique.*3D/);
 assert.match(h.$('load-description').textContent,/Réessaie/);
 assert.equal(h.$('load-progress').hidden,true,'A failed renderer must not keep presenting a loading bar');
 assert.equal(h.$('load-percent').hidden,true,'The static 0 % must no longer be visible');
 assert.equal(h.$('load-error-details').hidden,true,'Technical details belong in the report');
 assert.equal(h.$('skip').disabled,true);
 assert.equal(h.$('enter').disabled,true);
 assert.equal(h.$('retry-load').hidden,false);
 assert.equal(h.$('retry-load').disabled,false);
 assert.equal(h.reloads,0,'Failure never reloads the page automatically');
 h.$('retry-load').click();
 assert.equal(h.reloads,1,'The visible retry control reloads only after activation');
}

test('successful loading preserves the scene UI, handlers and author-access decision',async()=>{
 for(const authorized of [false,true]){
  const h=fixture(),enter=()=>{},skip=()=>{},report=()=>{};
  let loads=0,loadedSnapshot;
  const result=await startIntro(async()=>{
   loads++;
   h.$('loading').hidden=true;h.$('welcome').hidden=!authorized;h.$('access-denied').hidden=authorized;
   h.$('enter').disabled=h.$('skip').disabled=!authorized;
   h.$('pseudo').value='Camille';
   h.$('enter').onclick=enter;h.$('skip').onclick=skip;h.$('report-open').onclick=report;
   loadedSnapshot=h.snapshot();
   await Promise.resolve();
   return {ready:authorized};
  },h.environment);
  assert.equal(result,true);assert.equal(loads,1);
  assert.deepEqual(h.snapshot(),loadedSnapshot,'The shell must not override the loaded module, including an author denial');
  assert.deepEqual(h.domReads,[],'The success path never takes ownership of scene controls');
  assert.equal(h.storageReads,0);assert.equal(h.reloads,0);
  assert.deepEqual(h.downloads,[]);assert.deepEqual(h.transmissions,[]);
 }
});

for(const asynchronous of [false,true]){
 test(`${asynchronous?'rejected':'synchronous'} WebGL construction failure replaces the false 0 % with a readable retry`,async()=>{
  const h=fixture(),error=Error('Error creating WebGL context.');
  h.$('welcome').hidden=false;h.$('enter').disabled=h.$('skip').disabled=false;
  const denied=h.$('access-denied').snapshot();
  const load=asynchronous?()=>Promise.reject(error):()=>{throw error;};
  assert.equal(await startIntro(load,h.environment),false);
  assertGraphicsFailure(h);
  assert.deepEqual(h.$('access-denied').snapshot(),denied,'A graphics failure does not change author access');
  const entries=JSON.parse(h.stored.get(storageKey));
  assert.equal(entries.length,1);assert.equal(entries[0].message,error.message);
  assert.equal(entries[0].stage,'boot');assert.equal(entries[0].step,-1);
 });
}

test('a non-graphics module rejection shows a loading failure and retains its diagnostic',async()=>{
 const h=fixture(),error=TypeError('Failed to fetch dynamically imported module: /membres/intro-cinema.js');
 assert.equal(await startIntro(()=>Promise.reject(error),h.environment),false);
 assert.equal(h.$('load-title').textContent,'Le démarrage a été interrompu');
 assert.match(h.$('load-description').textContent,/connexion.*réessaie/);
 assert.doesNotMatch(h.$('load-description').textContent,/compatible avec la 3D/);
 assert.equal(h.$('loading').getAttribute('role'),'alert');
 assert.equal(h.$('load-percent').hidden,true);assert.equal(h.$('load-progress').hidden,true);
 assert.equal(h.$('retry-load').hidden,false);assert.equal(h.$('retry-load').disabled,false);
 assert.equal(JSON.parse(h.stored.get(storageKey)).at(-1).message,error.message);
});

for(const storageFailure of [null,'getter','methods']){
 const storageLabel=storageFailure?`when localStorage ${storageFailure==='getter'?'access':'read and write'} throws`:'with local persistence';
 test(`error reporting stays local and exports the diagnostic plus observation ${storageLabel}`,async t=>{
  const prior=storageFailure?[]:[{date:'2026-11-01T12:00:00.000Z',type:'bug',step:2,stage:'white',message:'Observation précédente'}];
  const h=fixture({storageFailure,prior});
  t.mock.method(globalThis,'fetch',h.send);
  const diagnostic='THREE.WebGLRenderer: Error creating WebGL context.';
  showIntroStartupFailure(Error(diagnostic),h.environment);
  assert.deepEqual(h.downloads,[],'Recording a startup diagnostic does not auto-download or send it');
  assert.deepEqual(h.transmissions,[]);
  h.$('report-open').click();
  assert.equal(h.$('report-dialog').open,true);
  assert.equal(h.$('report-scene').value,'Démarrage de la cinématique');
  h.$('report-type').value='bug';h.$('report-note').value='  L’écran reste bloqué avant le dojo.  ';
  h.$('report-add').click();
  assert.equal(h.$('report-note').value,'');
  assert.equal(h.$('report-count').textContent,(prior.length+2)+' entrées');
  h.$('report-note').value='   ';h.$('report-add').click();
  assert.equal(h.$('report-count').textContent,(prior.length+2)+' entrées','A blank observation adds nothing');
  assert.deepEqual(h.downloads,[],'Adding an observation still requires a separate export action');
  h.$('report-export').click();
  assert.equal(h.downloads.length,1);
  const download=h.downloads[0],blob=h.blobs.get(download.href);
  assert.match(download.download,/^rapport-croisee-des-ames-\d{4}-\d{2}-\d{2}\.json$/);
  assert.equal(blob.type,'application/json');
  const report=JSON.parse(await blob.text());
  assert.equal(report.experience,'La Croisée des Âmes');
  assert.equal(report.stage,'boot');assert.equal(report.step,-1);
  assert.deepEqual(report.viewport,{width:390,height:844});
  assert.ok(Number.isFinite(Date.parse(report.created)));
  assert.deepEqual(report.entries.slice(0,prior.length),prior);
  const [failure,observation]=report.entries.slice(prior.length);
  assert.equal(failure.type,'Démarrage de la cinématique');assert.equal(failure.message,diagnostic);
  assert.equal(observation.type,'bug');assert.equal(observation.message,'L’écran reste bloqué avant le dojo.');
  for(const entry of [failure,observation]){
   assert.equal(entry.stage,'boot');assert.equal(entry.step,-1);assert.ok(Number.isFinite(Date.parse(entry.date)));
  }
  if(!storageFailure)assert.deepEqual(JSON.parse(h.stored.get(storageKey)),report.entries);
  if(storageFailure==='methods')assert.ok(h.storageWrites>=2,'Both failed persistence attempts were safely tolerated');
  assert.equal(h.timers.length,1);assert.equal(h.timers[0].delay,3000);assert.deepEqual(h.revoked,[]);
  h.timers[0].callback();assert.deepEqual(h.revoked,[download.href]);
  h.$('report-close').click();assert.equal(h.$('report-dialog').open,false);
  assert.deepEqual(h.transmissions,[],'The report never leaves the page without a user-directed file download');
  assert.equal(h.reloads,0);
 });
}
