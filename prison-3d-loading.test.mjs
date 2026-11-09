import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {loadActorBytes} from './prison-3d-loader.js';

const html=readFileSync(new URL('./prison-3d-prototype.html',import.meta.url),'utf8');
const bootCode=html.match(/<script id="prison-loading-bootstrap">([\s\S]*?)<\/script>/)[1];
function bootstrap(){
 const nodes=new Map(),events=new Map();let timeout,reloads=0;
 const node=id=>{
  if(!nodes.has(id))nodes.set(id,{
   dataset:{},hidden:false,disabled:false,textContent:'',listeners:{},attributes:{},
   setAttribute(key,value){this.attributes[key]=value;},
   removeAttribute(key){delete this.attributes[key];},
   addEventListener(key,callback){this.listeners[key]=callback;}
  });
  return nodes.get(id);
 };
 const controls=[...html.matchAll(/<button\b[^>]*\bdata-game-control\b[^>]*>/g)]
  .map(([tag])=>tag.match(/\bid="([^"]+)"/)[1]).map(node);
 const window={addEventListener:(event,callback)=>events.set(event,callback)};
 vm.runInNewContext(bootCode,{
  window,document:{getElementById:node,querySelectorAll:selector=>{
   assert.equal(selector,'[data-game-control]');return controls;
  }},
  setTimeout:callback=>{timeout=callback;return 1;},clearTimeout:()=>{timeout=null;},
  location:{reload:()=>reloads++}
 });
 return {node,controls,api:window.Prison3DLoading,events,
  expire:()=>timeout?.(),reloads:()=>reloads};
}
test('Loading finishes with an enabled tour start and no lingering loading label',()=>{
 const ui=bootstrap();
 assert.ok(ui.controls.every(button=>button.disabled));
 assert.equal(ui.node('joystick').attributes['aria-disabled'],'true');
 ui.api.phase('Personnage · 50 %',53);
 assert.equal(ui.node('loading-progress').value,53);
 assert.equal(ui.api.ready(),true);
 assert.equal(ui.node('start').textContent,'Commencer la visite');
 assert.equal(ui.node('world').dataset.loadState,'ready');
 assert.equal(ui.node('loading').hidden,true);
 assert.ok(ui.controls.every(button=>!button.disabled));
 assert.equal(ui.node('joystick').attributes['aria-disabled'],'false');
 ui.expire();assert.equal(ui.node('world').dataset.loadState,'ready');
});
test('A failed or missing runtime gives a working reload action, not a frozen loader',()=>{
 const ui=bootstrap();
 ui.events.get('error')({target:{src:'https://example.test/prison-3d-prototype-runtime.js?v=2'}});
 assert.equal(ui.node('world').dataset.loadState,'error');
 assert.equal(ui.node('loading').hidden,false);
 assert.equal(ui.node('loading-retry').hidden,false);
 assert.equal(ui.node('start').textContent,'Chargement interrompu');
 assert.equal(ui.api.ready(),false,'Late completion must not reactivate a failed scene');
 assert.ok(ui.controls.every(button=>button.disabled));
 assert.equal(ui.node('joystick').attributes['aria-disabled'],'true');
 ui.node('loading-retry').listeners.click();assert.equal(ui.reloads(),1);
});
test('A stalled startup and a lost graphics context remain recoverable',()=>{
 const stalled=bootstrap();stalled.expire();
 assert.equal(stalled.node('world').dataset.loadState,'error');
 assert.match(stalled.node('loading-detail').textContent,/trop de temps/);
 const active=bootstrap();active.api.ready();active.api.fail('Affichage interrompu');
 assert.equal(active.node('loading').hidden,false);
 assert.equal(active.node('loading-retry').hidden,false);
 assert.ok(active.controls.every(button=>button.disabled));
 assert.equal(active.node('joystick').attributes['aria-disabled'],'true');
});
test('The real model survives a streamed transfer and parses into the required rig',async()=>{
 const source=readFileSync(new URL('./danse-quaternius-hero.glb',import.meta.url));
 const progress=[];
 const body=new ReadableStream({start(controller){
  for(let offset=0;offset<source.length;offset+=65536)controller.enqueue(source.subarray(offset,offset+65536));
  controller.close();
 }});
 const buffer=await loadActorBytes('https://example.test/actor.glb',{
  fetchImpl:async()=>new Response(body,{headers:{'Content-Length':String(source.length)}}),
  onProgress:value=>progress.push(value)
 });
 assert.equal(buffer.byteLength,source.byteLength);
 assert.ok(progress.length>2);assert.equal(progress.at(-1),1);
 const gltf=await new GLTFLoader().parseAsync(buffer,'');
 for(const name of ['pelvis','spine_02','upperarm_l','lowerarm_l','upperarm_r','lowerarm_r','thigh_l','thigh_r','calf_l','calf_r','Head'])
  assert.equal(gltf.scene.getObjectByName(name)?.isBone,true,name);
 let skins=0;gltf.scene.traverse(object=>{if(object.isSkinnedMesh)skins++;});
 assert.ok(skins>0);
});
test('Missing, replaced and truncated model responses fail explicitly',async()=>{
 await assert.rejects(loadActorBytes('/actor.glb',{fetchImpl:async()=>new Response('',{status:404})}),/HTTP 404/);
 await assert.rejects(loadActorBytes('/actor.glb',{fetchImpl:async()=>new Response('<html>Not found</html>')}),/incomplet/);
 const bytes=readFileSync(new URL('./danse-quaternius-hero.glb',import.meta.url));
 await assert.rejects(loadActorBytes('/actor.glb',{fetchImpl:async()=>new Response(bytes.subarray(0,100))}),/incomplet/);
});
test('A stalled model request is aborted and leaves a retryable message',async()=>{
 let aborted=false;
 const fetchImpl=(_url,{signal})=>new Promise((_resolve,reject)=>{
  signal.addEventListener('abort',()=>{aborted=true;reject(new Error('aborted'));});
 });
 await assert.rejects(loadActorBytes('/actor.glb',{fetchImpl,timeoutMs:10}),/trop de temps/);
 assert.equal(aborted,true);
});
