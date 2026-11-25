import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createArrivalCharacterEditor,authorRequest} from './v27/arrival-personalization.js';
import {normaliseStudio,referenceStudio} from './studio-look.js';

const initial=normaliseStudio({...referenceStudio('homme'),outfit:{haut:'mh1800',bas:'mh1796',souliers:'mh438'}},true,undefined,'homme');
function deferred(){let resolve;const promise=new Promise(yes=>resolve=yes);return {promise,resolve};}
function setup(overrides={}){
 const applied=[],selected=[],restored=[],saved=[],stored=[];
 const scene={originalLook:slot=>slot==='m'?initial:null,setGender:g=>selected.push(g),
  dress(slot,figure,gender,valid){if(!valid())return false;applied.push({slot,look:figure.appearance,gender});return true;},reset:slot=>restored.push(slot)};
 const member={id:17,author:'edition',gender:'homme',salonLooks:{homme:referenceStudio('homme')}};
 const editor=createArrivalCharacterEditor({scene,member,load:async look=>({appearance:look}),
  request:async(path,data)=>{saved.push({path,data});return {gender:data.gender,studio:data.studio};},storage:{setItem:(...args)=>stored.push(args)},...overrides});
 return {editor,scene,member,applied,selected,restored,saved,stored};
}

test('opening Personnaliser keeps the exact cinema Ahmed until an explicit choice',()=>{
 const h=setup();h.editor.select('homme');const options=h.editor.settings();
 assert.deepEqual(h.editor.state.look,initial);
 assert.deepEqual(h.applied,[],'No generic avatar or saved wardrobe may replace cinema Ahmed on arrival');
 assert.equal(options.gender,'homme');assert.equal(options.privateURL,'/membre-atelier.html?auteur=edition');
 h.editor.select('femme');assert.equal(h.editor.slot,'f');assert.deepEqual(h.applied,[]);
});

test('the latest wardrobe choice wins when downloads finish out of order',async()=>{
 const downloads=[];const h=setup({load:look=>{const item=deferred();downloads.push({look,...item});return item.promise;}});
 const first=h.editor.apply({...initial,outfit:{...initial.outfit,haut:'mh2909'}});
 const second=h.editor.apply({...initial,outfit:{...initial.outfit,haut:'mh1416'}});
 downloads[1].resolve({appearance:downloads[1].look});assert.equal(await second,true);
 downloads[0].resolve({appearance:downloads[0].look});assert.equal(await first,false);
 assert.equal(h.applied.length,1);assert.equal(h.applied[0].look.outfit.haut,'mh1416');
});

test('skin, hair and body choices reach the live character builder and the actual dress bridge',async()=>{
 const generated=[];const h=setup({load:async(look,gender)=>{generated.push({look,gender});return {appearance:look};}});
 const requested={...initial,skinLevel:74,face:{...initial.face,skin:6,hair:1,body:1}};
 assert.equal(await h.editor.apply(requested),true);
 assert.equal(generated.length,1);assert.equal(generated[0].gender,'homme');
 assert.equal(generated[0].look.skinLevel,74);assert.equal(generated[0].look.face.hair,1);assert.equal(generated[0].look.face.body,1);
 assert.deepEqual(h.applied[0].look,generated[0].look);assert.equal(h.applied[0].slot,'m');
 assert.notDeepEqual(h.applied[0].look.face,initial.face);
});

test('editing Marianne cannot redirect an in-flight Ahmed wardrobe onto her',async()=>{
 const load=deferred(),h=setup({load:()=>load.promise});
 const pending=h.editor.apply(initial);h.editor.select('femme');
 load.resolve({appearance:initial});await pending;
 assert.equal(h.applied[0].slot,'m');assert.equal(h.applied[0].gender,'homme');assert.equal(h.editor.slot,'f');
});

test('save remains bound to the chosen character while another character is selected',async()=>{
 const h=setup();h.editor.select('femme');const options=h.editor.settings(),look=h.editor.state.look;
 h.editor.select('homme');await options.save(look);
 assert.deepEqual(h.saved,[{path:'salon-appearance',data:{gender:'femme',studio:look}}]);
 assert.deepEqual(h.member.salonLooks.femme,look);assert.deepEqual(h.stored,[['salon-v27-look:17:femme','1']]);
 assert.equal(h.editor.gender,'homme');
});

test('a failed or mismatched save does not claim success or overwrite saved state',async()=>{
 for(const request of [async()=>{throw Error('Session expirée');},async()=>({gender:'femme',studio:initial})]){
  const h=setup({request}),before=h.editor.state.saved;
  await assert.rejects(()=>h.editor.settings().save(initial));
  assert.equal(h.editor.state.saved,before);assert.deepEqual(h.stored,[]);
 }
});

test('restoring the original invalidates a pending outfit and calls the real actor reset',async()=>{
 const download=deferred(),h=setup({load:()=>download.promise});
 const pending=h.editor.apply({...initial,outfit:{haut:'mh1416'}});
 const restored=h.editor.reset();download.resolve({appearance:initial});
 assert.equal(await pending,false);assert.deepEqual(h.restored,['m']);assert.deepEqual(restored,initial);assert.deepEqual(h.applied,[]);
});

test('account reads and saves use the same authenticated author API as the existing salon',async()=>{
 const calls=[];const fetcher=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({author:'edition'})};};
 await authorRequest('me',undefined,fetcher);await authorRequest('salon-appearance',{gender:'homme',studio:initial},fetcher);
 assert.equal(calls[0].url,'/api/membres/me?auteur=1');assert.equal(calls[0].options.method,'GET');
 const save=calls[1];assert.equal(save.url,'/api/membres/salon-appearance?auteur=1');assert.equal(save.options.method,'POST');
 assert.equal(save.options.credentials,'same-origin');assert.equal(save.options.cache,'no-store');
 assert.deepEqual(JSON.parse(save.options.body),{gender:'homme',studio:initial});
 await assert.rejects(()=>authorRequest('me',undefined,async()=>({ok:false,json:async()=>({error:'Session expirée'})})),/Session expirée/);
});

test('the direct arrival loads the editor and the dojo explains its actual controls automatically',()=>{
 const html=readFileSync(new URL('./v27/salon.html',import.meta.url),'utf8');
 assert.match(html,/salon-runtime\.js\?v=croisee29/);assert.match(html,/arrival-personalization\.css\?v=croisee27/);
 const runtime=readFileSync(new URL('./v27/salon-runtime.js',import.meta.url),'utf8');assert.match(runtime,/arrival-personalization\.js\?v=croisee27/);
 const source=readFileSync(new URL('./intro-cinema.js',import.meta.url),'utf8'),start=source.indexOf('const lines=')+'const lines='.length;
 const shots=JSON.parse(source.slice(start,source.indexOf(';\nconst dojoStart',start)));
 const tutorial=shots.filter(s=>['dojo-personnaliser','dojo-apparence','dojo-vetements','dojo-enregistrer'].includes(s.id));
 assert.equal(tutorial.length,4);assert.ok(tutorial.every(s=>s.scene==='dojo'&&s.ms>=6000&&s.speaker));
 const text=tutorial.map(s=>s.text).join(' ');
 for(const label of ['grande variété de personnages','origines','corpulences','Visages','silhouettes','Tous les vêtements','Enregistrer'])assert.ok(text.includes(label),label);
 assert.doesNotMatch(text,/choisis Ahmed ou Marianne|choisir Ahmed ou Marianne/i,'The introduction must not restrict the actual character editor to its two guides');
});
