import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as T from 'three';
import {createArrivalCharacterEditor,authorRequest} from './v27/arrival-personalization.js';
import {INTRO_INVITATION_POSITIONS} from './v27/intro-invitation-scene.js';
import {roomFree} from './salon-plan.js';
import {normaliseStudio,referenceStudio} from './studio-look.js';

const initial=normaliseStudio({...referenceStudio('homme'),outfit:{haut:'mh1800',bas:'mh1796',souliers:'mh438'}},true,undefined,'homme');
function deferred(){let resolve;const promise=new Promise(yes=>resolve=yes);return {promise,resolve};}
function setup(overrides={}){
 const applied=[],selected=[],restored=[],saved=[],stored=[],reads=[],loaded=[],prepared=[];
 const scene={originalLook:slot=>slot==='m'?initial:null,setGender:g=>selected.push(g),
  prepareInspection:slot=>{prepared.push(slot);return true;},
  dress(slot,figure,gender,valid){if(!valid())return false;applied.push({slot,look:figure.appearance,gender,inspection:figure.inspection===true});return true;},reset:slot=>restored.push(slot)};
 const member=overrides.member||{id:17,author:'edition',gender:'homme',salonLooks:{homme:referenceStudio('homme')}};
 const editor=createArrivalCharacterEditor({scene,member,load:async(look,gender,options)=>{loaded.push({look,gender,options});return {appearance:look,inspection:options?.inspection===true};},
  request:async(path,data)=>{if(path==='me'){reads.push(path);return {...member};}saved.push({path,data});return {gender:data.gender,studio:data.studio};},storage:{setItem:(...args)=>stored.push(args)},...overrides});
 return {editor,scene,member,applied,selected,restored,saved,stored,reads,loaded,prepared};
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

test('ADMIN body inspection revalidates the account, removes every garment and preserves the dressed look for both characters',async()=>{
 const h=setup();
 for(const gender of ['homme','femme']){
  h.editor.select(gender);const before=structuredClone(h.editor.state.look),saved=h.editor.state.saved;
  assert.equal(h.editor.settings().inspection,false);assert.equal(typeof h.editor.settings().removeClothes,'function');
  assert.equal(await h.editor.settings().removeClothes(),true);
  const visible=h.applied.at(-1),loaded=h.loaded.at(-1);
  assert.equal(visible.gender,gender);assert.equal(visible.slot,gender==='femme'?'f':'m');
  assert.equal(visible.inspection,true);assert.deepEqual(visible.look.outfit,{});
  assert.deepEqual(loaded.options,{inspection:true});assert.deepEqual(visible.look.face,before.face);
  assert.equal(h.editor.state.inspection,true);assert.deepEqual(h.editor.state.look,before);
  assert.equal(h.editor.state.saved,saved,'Inspection cannot overwrite the stored outfit');
  // Even a caller holding the rendered unclothed figure saves the complete
  // remembered wardrobe, never the temporary inspection representation.
  await h.editor.settings().save(visible.look);
  assert.deepEqual(h.saved.at(-1).data,{gender,studio:before});
  assert.equal(Object.hasOwn(h.saved.at(-1).data.studio,'inspection'),false);
  assert.equal(await h.editor.inspect(false),true);
  assert.equal(h.editor.state.inspection,false);assert.deepEqual(h.applied.at(-1).look,before);
  assert.equal(h.loaded.at(-1).options,undefined);
 }
 assert.deepEqual(h.reads,['me','me']);
 assert.deepEqual(h.prepared,['m','f'],'Each entry uses the scene standing-placement API before undressing');
});

test('ordinary, expired and changed accounts cannot enter body inspection or reach the scene',async()=>{
 const ordinary=setup({member:{id:17,author:null,gender:'homme'}});
 assert.equal(ordinary.editor.author,false);assert.equal(ordinary.editor.settings().removeClothes,undefined);
 assert.equal(ordinary.editor.settings().privateURL,'');
 await assert.rejects(()=>ordinary.editor.inspect(true),/compte auteur/);
 assert.deepEqual(ordinary.loaded,[]);assert.deepEqual(ordinary.applied,[]);
 for(const confirmed of [{id:17,author:null},{id:99,author:'edition'}]){
  const h=setup({request:async path=>{assert.equal(path,'me');return confirmed;}});
  await assert.rejects(()=>h.editor.inspect(true),/compte auteur/);
  assert.deepEqual(h.loaded,[]);assert.deepEqual(h.applied,[]);assert.equal(h.editor.state.inspection,false);
 }
 const denied=setup({load:async()=>{throw Error('Session auteur expirée');}});
 await assert.rejects(()=>denied.editor.inspect(true),/Session auteur expirée/);
 assert.deepEqual(denied.applied,[]);assert.equal(denied.editor.state.inspection,false);
 const unconfirmed=setup({load:async look=>({appearance:look})});
 await assert.rejects(()=>unconfirmed.editor.inspect(true),/pas pu être confirmée/);
 assert.deepEqual(unconfirmed.applied,[]);
});

test('session expiry leaves the already displayed custom outfit and appearance completely intact',async()=>{
 for(const failure of ['me','loader']){
  const h=setup({
   request:async()=>{if(failure==='me')throw Error('Session expirée');return {id:17,author:'edition'};},
   load:async(look,gender,options)=>{if(options?.inspection)throw Error('Session expirée');return {appearance:look};}
  });
  const dressed={...initial,outfit:{...initial.outfit,haut:'mh1416'}};
  await h.editor.apply(dressed);
  const active=h.applied.at(-1),before=structuredClone(h.editor.state.look);
  await assert.rejects(()=>h.editor.inspect(true),/Session expirée/);
  assert.equal(h.applied.length,1,'No replacement or partial undressing reaches the scene');
  assert.equal(h.applied.at(-1),active);assert.deepEqual(h.editor.state.look,before);
  assert.deepEqual(active.look.outfit,dressed.outfit);assert.equal(h.editor.state.inspection,false);
  assert.deepEqual(h.prepared,[],'An expired session cannot move the already displayed actor');
 }
});

test('adult body adjustments remain inspectable, choosing clothing restores it, and child bodies stay clothed',async()=>{
 const h=setup();await h.editor.inspect(true);
 const changed={...h.editor.state.look,face:{...h.editor.state.look.face,body:1}};
 assert.equal(await h.editor.apply(changed),true);
 assert.equal(h.applied.at(-1).inspection,true);assert.deepEqual(h.applied.at(-1).look.outfit,{});
 assert.equal(h.applied.at(-1).look.face.body,1);assert.deepEqual(h.editor.state.look.outfit,initial.outfit);
 const dressed={...changed,outfit:{...changed.outfit,haut:'mh2909'}};
 await h.editor.apply(dressed);
 assert.equal(h.editor.state.inspection,false);assert.deepEqual(h.applied.at(-1).look.outfit,dressed.outfit);
 await h.editor.inspect(true);
 const child={...h.editor.state.look,face:{...h.editor.state.look.face,age:5}};
 await h.editor.apply(child);
 assert.equal(h.editor.state.inspection,false);assert.equal(h.applied.at(-1).inspection,false);
 assert.ok(h.applied.at(-1).look.outfit.haut&&h.applied.at(-1).look.outfit.bas);
 const count=h.applied.length,reads=h.reads.length;
 await assert.rejects(()=>h.editor.inspect(true),/modèles adultes/);
 assert.equal(h.applied.length,count);assert.equal(h.reads.length,reads);
});

test('an inspection stays bound to its character and an original reset cancels an in-flight authorization',async()=>{
 const auth=deferred(),h=setup({request:()=>auth.promise});
 const pending=h.editor.inspect(true);h.editor.select('femme');auth.resolve({id:17,author:'edition'});
 assert.equal(await pending,true);assert.equal(h.applied.at(-1).slot,'m');assert.equal(h.editor.state.inspection,false);
 h.editor.select('homme');assert.equal(h.editor.state.inspection,true);
 h.editor.reset();assert.equal(h.editor.state.inspection,false);assert.deepEqual(h.restored,['m']);
 const delayed=deferred(),canceled=setup({request:()=>delayed.promise});
 const operation=canceled.editor.inspect(true);canceled.editor.reset();delayed.resolve({id:17,author:'edition'});
 assert.equal(await operation,false);assert.deepEqual(canceled.loaded,[]);assert.deepEqual(canceled.applied,[]);
});

test('wearing the saved appearance leaves inspection even when its outfit is the same as the remembered clothes',async()=>{
 const h=setup();await h.editor.settings().save(h.editor.state.look);await h.editor.inspect(true);
 assert.equal(await h.editor.restoreSaved(),true);
 assert.equal(h.editor.state.inspection,false);assert.equal(h.applied.at(-1).inspection,false);
 assert.deepEqual(h.applied.at(-1).look.outfit,initial.outfit);
});

test('inspection enters through the production scene API, with both characters standing clear of the real furniture',()=>{
 const source=readFileSync(new URL('./v27/scene.js',import.meta.url),'utf8');
 const bridgeSource=readFileSync(new URL('./v27/scene-members.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace('export function createMemberBridge','function createMemberBridge');
 const createMemberBridge=new Function(bridgeSource+';return createMemberBridge;')();
 const start=source.indexOf('function prepareBodyInspection('),end=source.indexOf('\nconst member=createMemberBridge',start);
 const walkStart=source.indexOf('const walkBlocks='),walkEnd=source.indexOf('\nfunction setRole(',walkStart);
 assert.ok(start>=0&&end>start&&walkStart>=0&&walkEnd>walkStart);
 for(const selected of ['m','f']){
  const actor=id=>({id,parts:[],root:new T.Group(),body:new T.Group(),sit:1,speed:.7,phase:.6,motionSeat:{id:'chair'},conversationPose:{},live:true,stamp:'seated'});
  const actors={m:actor('m'),f:actor('f')},calls=[],rise={hidden:false};
  actors.m.root.position.set(-.61,0,.17);actors.f.root.position.set(-2.51,0,.25);
  const ctx=vm.createContext({actors,INTRO_INVITATION_POSITIONS,roomFree,bags:{},where:'jardin',role:'m',
   invitationScene:{active:false},arrivalFinale:{active:false},keys:new Set(['arrowup']),
   goal:{x:1,z:1},sitting:{id:'chair'},poseSeat:{id:'chair'},companionSeat:{id:'sofa2'},rising:true,seatRoute:{},
   returnHome(){calls.push('home');ctx.where='salon';},member:{clearMeeting(){calls.push('clearMeeting');}},
   setRole:slot=>{ctx.role=slot;},releaseStick:()=>calls.push('stick'),releaseAirInput:()=>calls.push('air'),releaseSeatRoute:()=>{ctx.seatRoute=null;},
   animateBody(a,blend,seat){assert.equal(a.sit,0);assert.equal(blend,0);assert.equal(seat,null);assert.equal(a.motionSeat,null);calls.push(a.id);},
   $:()=>rise
  });
  vm.runInContext(source.slice(walkStart,walkEnd)+'\n'+source.slice(start,end),ctx);
  const bridge=createMemberBridge({T,actors,player:()=>actors[selected],partner:()=>actors[selected==='m'?'f':'m'],prepareInspection:ctx.prepareBodyInspection});
  assert.equal(bridge.prepareInspection(selected),true);assert.equal(ctx.role,selected);assert.equal(ctx.where,'salon');
  assert.deepEqual(calls.slice(0,2),['home','clearMeeting'],'Existing return and encounter cleanup run before inspection placement');
  assert.equal(ctx.keys.size,0);assert.equal(ctx.goal,null);assert.equal(ctx.sitting,null);assert.equal(ctx.poseSeat,null);assert.equal(ctx.seatRoute,null);assert.equal(ctx.companionSeat,null);assert.equal(ctx.rising,false);
  assert.deepEqual(actors[selected].root.position.toArray(),[INTRO_INVITATION_POSITIONS.m.x,0,INTRO_INVITATION_POSITIONS.m.z]);
  for(const a of Object.values(actors)){
   assert.equal(a.sit,0);assert.equal(a.speed,0);assert.equal(a.phase,0);assert.equal(a.live,false);assert.equal(a.conversationPose,null);assert.equal(a.body.position.y,0);assert.equal(a.body.visible,true);
   for(const dx of [-.27,0,.27])for(const dz of [-.18,0,.18])assert.equal(ctx.canWalk(a.root.position.x+dx,a.root.position.z+dz),true,'The complete footprint is clear of the actual salon obstacles');
  }
  assert.ok(actors.m.root.position.distanceTo(actors.f.root.position)>.9);assert.equal(rise.hidden,true);
  const count=calls.length;ctx.invitationScene.active=true;
  assert.equal(bridge.prepareInspection(selected),false);assert.equal(calls.length,count,'The inspection cannot interrupt a running film');
 }
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
 assert.match(html,/salon-runtime\.js\?v=call58/);assert.match(html,/arrival-personalization\.css\?v=croisee27/);
 const runtime=readFileSync(new URL('./v27/salon-runtime.js',import.meta.url),'utf8');assert.match(runtime,/arrival-personalization\.js\?v=incarnations33/);
 const source=readFileSync(new URL('./intro-cinema.js',import.meta.url),'utf8'),start=source.indexOf('const lines=')+'const lines='.length;
 const shots=JSON.parse(source.slice(start,source.indexOf(';\nconst dojoStart',start)));
 const tutorial=shots.filter(s=>['dojo-personnaliser','dojo-apparence','dojo-vetements','dojo-enregistrer'].includes(s.id));
 assert.equal(tutorial.length,4);assert.ok(tutorial.every(s=>s.scene==='dojo'&&s.ms>=6000&&s.speaker));
 const text=tutorial.map(s=>s.text).join(' ');
 for(const label of ['Menu','Avatar','corps','volet','chemise','Enregistrer','téléphone'])assert.ok(text.toLowerCase().includes(label.toLowerCase()),label);
 assert.doesNotMatch(text,/choisis Ahmed ou Marianne|choisir Ahmed ou Marianne/i,'The introduction must not restrict the actual character editor to its two guides');
});
