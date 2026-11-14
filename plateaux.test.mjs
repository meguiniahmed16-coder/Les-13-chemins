import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function harness(){
 const els=new Map(),messages=[],timers=[],store=new Map(),calls={journeys:[],readers:[],next:[]};
 function element(){return{style:{},dataset:{},className:'',open:false,hidden:false,children:[],classList:{add(){},toggle(){}},contentWindow:{postMessage(m){messages.push(m);}},setAttribute(){},removeAttribute(){},addEventListener(){},append(el){this.children.push(el);if(el.id)els.set(el.id,el);},after(el){if(el.id)els.set(el.id,el);},remove(){els.delete(this.id);},focus(){},showModal(){this.open=true;},close(){this.open=false;},querySelector(){return this.children.find(e=>e.onclick)||null;},set innerHTML(v){this.html=v;for(const m of v.matchAll(/id="([^"]+)"/g)){const e=element();e.id=m[1];els.set(e.id,e);}},get innerHTML(){return this.html||'';}};}
 const $=id=>{if(!els.has(id)){const e=element();e.id=id;els.set(id,e);}return els.get(id);};
 const c={console,crypto:{randomUUID:()=>String(Math.random())},document:{createElement:element,head:element(),body:{...element(),classList:{add(){}}},getElementById:$,querySelectorAll:()=>[]},location:{origin:'https://example.test'},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},KEY:'progress',state:{selected:5,unlocked:5,completed:[1,2,3,4],points:400,tries:{}},LEVELS:Array.from({length:13},(_,i)=>({correct:0,title:'Niveau '+i})),boardRolling:false,finishBoardRoll:null,render(){},answer(){throw Error('Unexpected old answer');},focusGameEntry(){},setTimeout:f=>{timers.push(f);return timers.length;},clearTimeout(){},addEventListener:(name,f)=>{if(name==='message')c.message=f;},TreizeEtapesData:[{level:5,plateaux:[{plateau:1},{plateau:2}]}],TreizeVoyage:{start(opts){calls.journeys.push(opts);return opts.onFinish;}},TreizeRendezVous:{openManifestation(){calls.manifestation=(calls.manifestation||0)+1;}},select(n){c.state.selected=n;c.render();},TreizeEscale:{openReader(n,opts){calls.readers.push({n,...opts});}},rollTravel:n=>calls.next.push(n)};
 c.window=c;c.save=()=>store.set('progress',JSON.stringify(c.state));vm.createContext(c);for(const file of ['chapitre1-flow.js','plateaux-core.js','danse-score.js','plateaux.js'])vm.runInContext(fs.readFileSync(new URL(file,import.meta.url),'utf8'),c);
 const emit=(who,data,source=$(who+'Frame').contentWindow)=>c.message({origin:c.location.origin,source,data});return{c,$,calls,timers,emit,messages};
}
test('Danse → Camarades ! → prison: la chronologie respecte les deux « Drapeau rouge »',()=>{
 const h=harness(),{c,$,emit,calls}=h;
 c.answer(0);assert.equal(c.state.points,500);
 $('danseLaunch').onclick();const id=c.state.dansePending.id;
 for(let n=1;n<=5;n++)emit('danse',{type:'danse:pass',id,gap:n});
 emit('danse',{type:'danse:won',id});
 assert.equal(c.state.points,510);
 assert.equal(c.state.unlocked,5);
 assert.equal(h.timers.length,0,'La scène suivante attend la fin de l’ovation');
 emit('danse',{type:'danse:ovation-ended',id:'stale'});
 assert.equal(h.timers.length,0,'Une ancienne session ne doit pas couper la fête');
 emit('danse',{type:'danse:ovation-ended',id});
 assert.equal(h.timers.length,1);
 emit('danse',{type:'danse:ovation-ended',id});
 assert.equal(h.timers.length,1,'La transition ne se programme qu’une fois');
 h.timers[0]();
 assert.equal(calls.manifestation,1,'Le jeu Camarades ! suit la danse, pas la cellule');
 assert.equal(calls.readers.length,0,'La lecture de Strasbourg est désormais dans le chemin suivant');
 c.state.rdvManifestationFinished=true;c.save();c.render();
 assert.equal(c.TreizeChapitre1.chapter2Done(c.state),true,'Camarades ! achève le chemin II');
 assert.equal(c.TreizePlateauxNavigation.openPart('prison'),true);
 assert.equal(calls.readers.length,1);assert.equal(calls.readers[0].plateau,2);
 calls.readers[0].onChallenge();assert.equal($('yoyoDialog').open,true);
 const y=c.state.yoyoPending.id;
 emit('yoyo',{type:'yoyo:won',id:'stale',points:30});
 assert.equal(c.state.points,510);
 emit('yoyo',{type:'yoyo:won',id:y,points:30});
 assert.equal(c.state.points,540);
 emit('yoyo',{type:'yoyo:close'});
 assert.deepEqual(calls.next,[5]);
});
test('Une partie de prison interrompue est rejouable sans rejouer Camarades !',()=>{
 const h=harness(),{c,$,emit,calls}=h;
 c.state.danseFinished=true;c.state.dansePassed=[1,2,3,4,5];
 c.TreizePlateaux.done(c.state,5,1);
 c.state.rdvManifestationFinished=true;c.save();c.render();
 assert.equal(c.TreizePlateauxNavigation.openPart('prison'),true);
 calls.readers[0].onChallenge();
 assert.equal($('yoyoDialog').open,true);
 const id=c.state.yoyoPending.id;emit('yoyo',{type:'yoyo:close'});
 assert.equal(c.state.points,400);assert.equal(calls.manifestation||0,0);
 $('yoyoLaunch').onclick();assert.equal(c.state.yoyoPending.id,id);
 assert.equal($('yoyoDialog').open,true);
});
test('The public Strasbourg passage is bounded, referenced, and independent of the Paris character',()=>{const extra=JSON.parse(fs.readFileSync(new URL('plateaux-data.json',import.meta.url)));assert.equal(extra.length,1);const p=extra[0];assert.deepEqual(p.coordinates,[48.5734,7.7521]);assert.deepEqual(p.characters,['Nicolas Vial']);assert.equal(p.workshops[0].name,'Nicolas Vial');assert.equal(p.workshops[0].paragraphs.length,5);assert.deepEqual(p.passage.pages,[67,69]);assert.match(p.passage.quote,/^Puis j’arrive en prison\./);assert.match(p.passage.quote,/prend soin de moi\.$/);assert.ok(p.passage.quote.split(/\s+/).length<600);assert.doesNotMatch(JSON.stringify(p),/docs\.google|drive\.google/);});
