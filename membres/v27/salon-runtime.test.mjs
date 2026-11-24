import test from 'node:test';
import assert from 'node:assert/strict';
import {installSalonRuntime,bootSalon,SALON_ARRIVAL_SCOPE} from './salon-runtime.js';

function fixture(){
 const messages=[],classes=new Set(),elements=new Map(['loading','loadingText','retry'].map(id=>[id,{hidden:id==='retry',textContent:''}]));
 const doc={body:{classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)}},getElementById:id=>elements.get(id)};
 const win=new EventTarget();win.CustomEvent=CustomEvent;win.parent={postMessage:(data,origin)=>messages.push({data,origin})};let reloads=0;
 win.location={origin:'https://tectonique-des-ames.com',search:'?arrival=cinema&finale=1',reload:()=>reloads++};
 const scheduled=new Map();let next=0;const timers={setTimeout(fn){const id=++next;scheduled.set(id,fn);return id;},clearTimeout(id){scheduled.delete(id);}};
 const runtime=installSalonRuntime({win,doc,timers});
 const post=(data,{origin=win.location.origin,source=win.parent}={})=>{const event=new Event('message');Object.assign(event,{data,origin,source});win.dispatchEvent(event);};
 return {win,doc,runtime,messages,classes,elements,scheduled,post,reloads:()=>reloads};
}

test('a late parent can request the rendered scene state without relying on iframe load timing',()=>{
 const h=fixture();h.runtime.progress('characters','Ahmed et Marianne');h.win.salonV27={introFinale:{}};
 h.win.dispatchEvent(new Event('salon-ready'));assert.equal(h.runtime.snapshot().phase,'ready');assert.equal(h.scheduled.size,0);
 assert.equal(h.elements.get('loading').hidden,true);assert.ok(h.classes.has('ready'));
 h.post({scope:SALON_ARRIVAL_SCOPE,action:'status'});
 const event=h.messages.at(-1);assert.equal(event.origin,h.win.location.origin);assert.equal(event.data.state.ready,true);
 assert.equal(event.data.state.name,'La Croisée des Âmes');
});

test('module and asset failures keep the real reason and offer a single iframe retry',async()=>{
 const h=fixture();await bootSalon({...h,load:async()=>{throw Error('Une pièce du salon est indisponible.');}});
 assert.equal(h.runtime.snapshot().phase,'error');assert.equal(h.runtime.snapshot().code,'SCENE_MODULE');
 assert.match(h.elements.get('loadingText').textContent,/pièce du salon/);assert.equal(h.elements.get('retry').hidden,false);
 assert.equal(h.runtime.retry(),true);assert.equal(h.runtime.retry(),false);assert.equal(h.reloads(),1);
 assert.equal(h.runtime.snapshot().stage,'retry');
});

test('only the same-origin parent can query or retry the salon',()=>{
 const h=fixture(),count=h.messages.length;
 h.post({scope:SALON_ARRIVAL_SCOPE,action:'retry'},{origin:'https://example.org'});
 h.post({scope:SALON_ARRIVAL_SCOPE,action:'retry'},{source:{}});
 assert.equal(h.reloads(),0);assert.equal(h.messages.length,count);
 h.post({scope:SALON_ARRIVAL_SCOPE,action:'retry'});assert.equal(h.reloads(),1);
});

test('a stalled load and an expired private session are reported without mislabelling them as WebGL errors',()=>{
 const h=fixture();h.runtime.progress('ahmed','Ahmed');h.scheduled.values().next().value();
 assert.equal(h.runtime.snapshot().code,'LOAD_TIMEOUT');assert.equal(h.runtime.snapshot().canRetry,true);
 h.runtime.fail(Error('Ahmed : HTTP 401'));assert.equal(h.runtime.snapshot().code,'AUTHOR_SESSION');
 assert.match(h.runtime.snapshot().message,/session auteur/);
});

test('optional customization failure cannot cover a ready 3D destination',async()=>{
 const h=fixture(),loads=[];
 await bootSalon({...h,load:async url=>{
  loads.push(url);if(url.includes('scene-bundle')){h.win.salonV27={};h.win.dispatchEvent(new Event('salon-ready'));}
  else throw Error('Le catalogue est temporairement indisponible.');
 }});
 assert.equal(loads.length,2);assert.equal(h.runtime.snapshot().phase,'ready');assert.equal(h.runtime.snapshot().personalization,'error');
 assert.equal(h.elements.get('loading').hidden,true);assert.ok(h.classes.has('intro-finale'));
});
