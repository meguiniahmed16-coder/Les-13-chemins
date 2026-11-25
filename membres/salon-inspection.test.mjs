import test from 'node:test';
import assert from 'node:assert/strict';
import {createSalonInspection} from './salon-inspection.js';
import {normaliseStudio,referenceStudio} from './studio-look.js';

const initial=normaliseStudio({...referenceStudio('homme'),outfit:{haut:'mh1800',bas:'mh1796',souliers:'mh438'}},true,undefined,'homme');
const female=referenceStudio('femme');
const deferred=()=>{let resolve;const promise=new Promise(yes=>resolve=yes);return {promise,resolve};};
function setup(overrides={}){
 const context={memberKey:'owner',author:'atelier',authorRoom:true,temporary:false,...overrides.context};
 const applied=[],loaded=[],requests=[],prepared=[],serial={m:0,f:0,guest:0};
 const scene={wearing:()=>false,prepareInspection:slot=>{prepared.push(slot);return true;},
  dress:async(slot,figure,gender,valid)=>{if(!valid())return false;applied.push({slot,figure,gender});return true;}
 };
 let connected=true;
 const inspection=createSalonInspection({context:()=>context,ready:async()=>scene,connected:()=>connected,serial,
  load:async(look,gender,options)=>{loaded.push({look,gender,options});return {appearance:look,inspection:options?.inspection===true};},
  prepare:(scene,slot)=>scene.prepareInspection(slot),
  fetcher:async(url,options)=>{requests.push({url,options});return Response.json({id:context.memberKey,author:'atelier'});},
  ...overrides.callbacks
 });
 return {inspection,context,scene,applied,loaded,requests,prepared,serial,disconnect:()=>{connected=false;}};
}

test('the existing salon removes and restores every garment separately for Ahmed and resident Marianne',async()=>{
 const h=setup();
 for(const [slot,gender,look] of [['m','homme',initial],['f','femme',female]]){
  const before=structuredClone(look);
  assert.equal(h.inspection.allowed(slot,gender),true);
  assert.equal(await h.inspection.toggle(slot,look,gender),true);
  assert.equal(h.inspection.active(slot),true);
  const rendered=h.applied.at(-1);
  assert.equal(rendered.slot,slot);assert.equal(rendered.gender,gender);
  assert.equal(rendered.figure.inspection,true);assert.deepEqual(rendered.figure.appearance.outfit,{});
  assert.deepEqual(rendered.figure.appearance.face,look.face);
  assert.deepEqual(h.loaded.at(-1).options,{inspection:true});
  assert.deepEqual(look,before,'The editable and saved clothes remain intact');
  assert.equal(await h.inspection.toggle(slot,look,gender),true);
  assert.equal(h.inspection.active(slot),false);
  assert.deepEqual(h.applied.at(-1).figure.appearance,before);
  assert.equal(h.loaded.at(-1).options,undefined);
 }
 assert.deepEqual(h.prepared,['m','f']);
 assert.equal(h.requests.length,2);
 for(const {url,options} of h.requests){
  assert.equal(url,'/api/membres/me?auteur=1');assert.equal(options.credentials,'same-origin');assert.equal(options.cache,'no-store');
 }
});

test('members, subscribers, previews, non-owner rooms and guests cannot activate inspection',async()=>{
 for(const context of [{author:null},{author:null,companion:true},{temporary:true},{authorRoom:false},{memberKey:null}]){
  const h=setup({context});
  assert.equal(h.inspection.allowed('m','homme'),false);
  await assert.rejects(()=>h.inspection.toggle('m',initial,'homme'),/administrateur/);
  assert.equal(h.requests.length,0);assert.equal(h.loaded.length,0);assert.equal(h.applied.length,0);
 }
 const h=setup();
 assert.equal(h.inspection.allowed('guest','femme'),false);
 await assert.rejects(()=>h.inspection.toggle('guest',female,'femme'),/administrateur/);
 assert.equal(h.requests.length,0);assert.equal(h.applied.length,0);
});

test('fresh author identity and the loader confirmation are both mandatory',async()=>{
 for(const answer of [Response.json({},{status:401}),Response.json({id:'other',author:'atelier'}),Response.json({id:'owner',author:null})]){
  const h=setup({callbacks:{fetcher:async()=>answer}});
  await assert.rejects(()=>h.inspection.toggle('m',initial,'homme'),/administration|compte auteur/);
  assert.equal(h.loaded.length,0);assert.equal(h.prepared.length,0);assert.equal(h.applied.length,0);
 }
 for(const load of [async()=>{throw Error('Session auteur expirée');},async look=>({appearance:look,inspection:false})]){
  const h=setup({callbacks:{load}});
  await assert.rejects(()=>h.inspection.toggle('m',initial,'homme'),/expirée|confirmée/);
  assert.equal(h.inspection.active('m'),false);assert.equal(h.prepared.length,0);assert.equal(h.applied.length,0);
 }
});

test('body and skin adjustments retain inspection; clothing, saved appearance and child morphology restore clothing',async()=>{
 const h=setup();await h.inspection.toggle('m',initial,'homme');
 const body={...initial,skinLevel:74,face:{...initial.face,body:2}};
 await h.inspection.dress('m',body,'homme');
 assert.equal(h.inspection.active('m'),true);
 assert.equal(h.applied.at(-1).figure.appearance.skinLevel,74);assert.equal(h.applied.at(-1).figure.appearance.face.body,2);
 assert.equal(h.prepared.length,1,'A body adjustment does not interrupt the placement');
 const clothes={...body,outfit:{...body.outfit,haut:'mh1416'}};
 await h.inspection.dress('m',clothes,'homme');
 assert.equal(h.inspection.active('m'),false);assert.deepEqual(h.applied.at(-1).figure.appearance.outfit,clothes.outfit);
 await h.inspection.toggle('m',clothes,'homme');
 await h.inspection.dress('m',clothes,'homme',{inspection:false});
 assert.equal(h.inspection.active('m'),false,'An explicit saved-appearance restore exits inspection even with identical clothes');
 await h.inspection.toggle('m',clothes,'homme');
 const child={...clothes,face:{...clothes.face,age:5}};
 await h.inspection.dress('m',child,'homme');
 assert.equal(h.inspection.active('m'),false);assert.deepEqual(h.applied.at(-1).figure.appearance.outfit,clothes.outfit);
 const count=h.requests.length;
 await assert.rejects(()=>h.inspection.toggle('m',child,'homme'),/adultes/);assert.equal(h.requests.length,count);
});

test('a later wardrobe choice or reset cancels a pending inspection authorization',async()=>{
 for(const cancel of ['wardrobe','reset']){
  const request=deferred(),h=setup({callbacks:{fetcher:()=>request.promise}});
  const pending=h.inspection.toggle('m',initial,'homme');await Promise.resolve();
  if(cancel==='wardrobe')await h.inspection.dress('m',{...initial,skinLevel:50},'homme');else h.inspection.reset('m');
  request.resolve(Response.json({id:'owner',author:'atelier'}));
  assert.equal(await pending,false);assert.equal(h.inspection.active('m'),false);
  assert.ok(h.loaded.every(load=>!load.options?.inspection));assert.equal(h.prepared.length,0);
 }
});

test('concurrent inspections remain bound to their two characters and stale model downloads never win',async()=>{
 const downloads=[],h=setup({callbacks:{load:(look,gender,options)=>{const item={look,gender,options,...deferred()};downloads.push(item);return item.promise;}}});
 const ahmed=h.inspection.toggle('m',initial,'homme'),marianne=h.inspection.toggle('f',female,'femme');
 while(downloads.length<2)await new Promise(resolve=>setImmediate(resolve));
 for(const d of downloads.toReversed())d.resolve({appearance:d.look,inspection:true});
 assert.equal(await ahmed,true);assert.equal(await marianne,true);
 assert.equal(h.inspection.active('m'),true);assert.equal(h.inspection.active('f'),true);
 assert.deepEqual(h.applied.map(entry=>entry.slot).sort(),['f','m']);
 const pending=h.inspection.dress('m',{...initial,skinLevel:100},'homme');await Promise.resolve();await Promise.resolve();
 h.inspection.reset('m');const last=downloads.at(-1);last.resolve({appearance:last.look,inspection:true});
 assert.equal(await pending,false);assert.equal(h.inspection.active('m'),false);assert.equal(h.inspection.active('f'),true);
 assert.equal(h.applied.length,2);
});

test('account replacement, disconnection and invalid placement cannot apply a nude model',async()=>{
 for(const change of ['account','disconnect','clear']){
  const request=deferred(),h=setup({callbacks:{fetcher:()=>request.promise}});
  const pending=h.inspection.toggle('m',initial,'homme');await Promise.resolve();
  if(change==='account')h.context.memberKey='other';else if(change==='disconnect')h.disconnect();else h.inspection.clear();
  request.resolve(Response.json({id:'owner',author:'atelier'}));
  assert.equal(await pending,false);assert.equal(h.loaded.length,0);assert.equal(h.applied.length,0);
 }
 const h=setup({callbacks:{prepare:()=>false}});
 await assert.rejects(()=>h.inspection.toggle('f',female,'femme'),/espace d’inspection/);
 assert.equal(h.inspection.active('f'),false);assert.equal(h.applied.length,0);
});

