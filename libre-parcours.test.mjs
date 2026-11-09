import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
function flow(){
 const ctx=vm.createContext({});
 vm.runInContext(read('./chapitre1-flow.js'),ctx);
 return ctx.TreizeChapitre1;
}
const fresh=()=>({selected:1,unlocked:1,completed:[],points:57,
 arcadeBonuses:{},catalogneSold:[],bosniePassed:[],dansePassed:[],levelPlates:{},storySkips:[]});
test('Six optional mini-games can be skipped in order, without earning points or treasures',()=>{
 const f=flow(),s=fresh(),score=s.points;
 assert.deepEqual(Array.from(f.SKIP_KEYS),['1','2','3','4','5:dance','5:prison']);
 assert.equal(f.skipPart(s,'2'),false,'The second game cannot be skipped before the first scene');
 assert.equal(f.skipPart(s,'1'),true);
 assert.equal(f.wasSkipped(s,1),true);assert.equal(f.canEnter(s,2),true);
 assert.equal(f.chaptersDone(s),0,'The chapter is not finished after one skip');
 s.selected=2;assert.equal(f.skipPart(s,'2'),true);
 assert.equal(f.canEnter(s,3),true);
 s.selected=3;assert.equal(f.skipPart(s,'3'),true);
 assert.equal(f.done(s),true);assert.equal(f.canEnter(s,4),true);
 assert.equal(f.chaptersDone(s),1);assert.equal(f.chapterHasSkips(s,1),true);
 s.selected=4;assert.equal(f.skipPart(s,'4'),true);
 assert.equal(f.chapter2PartDone(s,1),true);assert.equal(f.canEnter(s,5),true);
 assert.equal(f.canEnter(s,6),false,'The third chapter is still locked');
 s.selected=5;assert.equal(f.skipPart(s,'5:prison'),false,'The prison cannot be skipped before the dance');
 assert.equal(f.skipPart(s,'5:dance'),true);
 assert.equal(f.chapter2PartDone(s,2),true);
 assert.deepEqual(Array.from(s.levelPlates[5].finished),[1],'The prison becomes accessible without declaring a dance victory');
 assert.equal(f.chapter2Done(s),false);
 assert.equal(f.skipPart(s,'5:prison'),true);
 assert.equal(f.chapter2PartDone(s,3),true);
 assert.equal(f.chapter2Done(s),true);
 assert.equal(f.canEnter(s,6),true);
 assert.equal(f.chaptersDone(s),2);
 assert.equal(f.chapterReached(s),3);
 assert.equal(s.unlocked,6);
 assert.equal(s.points,score,'None of the six skips awards points');
 assert.deepEqual(s.completed,[],'No success or quiz is fabricated');
 assert.equal(s.yoyoFinished,undefined);
 assert.equal(s.danseFinished,undefined);
 assert.equal(s.bosnieFinished,undefined);
 assert.equal(f.chapterHasSkips(s,2),true);
});
test('Skipping a partially completed game retains credits, stored IDs and legitimate wins',()=>{
 const f=flow(),s=fresh();s.selected=1;s.points=127;
 s.marmousetsPending={id:'original'};s.marmousetsProgress={scared:['a1']};
 assert.equal(f.skipPart(s,'1'),true);
 assert.equal(s.marmousetsPending,null);
 assert.deepEqual(s.marmousetsProgress,{scared:['a1']});
 s.selected=2;s.arcadePending={id:'a410-1'};
 assert.equal(f.skipPart(s,'2'),true);
 assert.equal(s.arcadePending,null);
 s.selected=3;s.catalogneSold=['c1','c2'];s.catalognePending={id:'catalogne-1'};
 assert.equal(f.skipPart(s,'3'),true);
 assert.deepEqual(s.catalogneSold,['c1','c2']);
 assert.equal(s.catalognePending,null);
 s.selected=4;s.bosniePassed=[1,2,3];s.bosniePending={id:'bosnie-1'};
 assert.equal(f.skipPart(s,'4'),true);
 assert.deepEqual(s.bosniePassed,[1,2,3]);
 s.selected=5;s.dansePassed=[1,2];s.dansePending={id:'danse-1'};
 assert.equal(f.skipPart(s,'5:dance'),true);
 assert.deepEqual(s.dansePassed,[1,2]);
 assert.equal(s.dansePending,null);
 s.yoyoPending={id:'prison-1'};assert.equal(f.skipPart(s,'5:prison'),true);
 assert.equal(s.yoyoPending,null);
 assert.equal(s.points,127);
 assert.deepEqual(s.storySkips,['1','2','3','4','5:dance','5:prison']);
 const saved=structuredClone(s);
 assert.equal(f.skipPart(s,'5:prison'),false,'Repeated skip does not alter the state');
 assert.deepEqual(s,saved);
});
test('An existing game victory is never converted into a skipped game',()=>{
 const f=flow(),s=fresh();s.completed=[1];s.arcadeBonuses[1]=true;
 assert.equal(f.partDone(s,1),true);
 assert.equal(f.skipPart(s,'1'),false);
 assert.equal(f.wasSkipped(s,1),false);
 assert.equal(s.points,57);
});
function frontend(){
 const events=[],ids=new Map();
 class E{
  constructor(id=''){this.id=id;this.className='';this.children=[];this.style={};this.dataset={};this.hidden=false;this.open=false;this.disabled=false;this.textContent='';this.attrs={};}
  append(...xs){for(const x of xs){this.children.push(x);if(x.id)ids.set(x.id,x);}return this;}
  after(x){if(x.id)ids.set(x.id,x);}
  setAttribute(k,v){this.attrs[k]=v;}
  querySelector(sel){
   const target=sel.startsWith('.')?sel.slice(1):'';
   const search=e=>e.children.find(c=>(c.className||'').split(' ').includes(target)||search(c));
   return search(this)||null;
  }
  click(){this.onclick?.();}
 }
 const ctx=vm.createContext({
  state:fresh(),boardRolling:false,
  document:{
   getElementById:id=>ids.get(id)||null,
   createElement:()=>new E(),
   head:{append(){}}
  },
  save(){events.push('save');},render(){events.push('render');},
  rollTravel:n=>events.push('travel-'+n),
  TreizeSceneNavigation:{cancelAutomatic:()=>events.push('cancel')},
  TreizePlateauxNavigation:{
   back:k=>events.push('plate-back-'+k),
   next:k=>events.push('plate-next-'+k)
  }
 });
 ctx.window=ctx;
 const idsList=['marmousets','arcade','catalogne','bosnie','danse','yoyo'];
 for(const n of idsList){
  const dialog=new E(n+'Dialog');ids.set(dialog.id,dialog);
  const close=new E(n+'Close');close.onclick=()=>{dialog.open=false;events.push('close-'+n);};ids.set(close.id,close);
 }
 const opt=new E('options');ids.set('options',opt);
 vm.runInContext(read('./chapitre1-flow.js'),ctx);
 vm.runInContext(read('./libre-parcours.js'),ctx);
 return {ctx,events,ids};
}
test('Every mini-game dialog has two visible navigation buttons under its frame',()=>{
 const h=frontend(),{ctx,ids}=h;
 for(const n of ['marmousets','arcade','catalogne','bosnie','danse','yoyo']){
  const footer=ids.get(n+'Dialog').querySelector('.arcade-under-actions');
  assert.ok(footer,'Footer missing from '+n);
  assert.equal(footer.children.length,2);
  assert.match(footer.children[0].textContent,/Retour au plateau/);
  assert.match(footer.children[1].textContent,/Suivant/);
  assert.equal(footer.attrs.role,'group');
 }
 assert.ok(ids.get('storySkip'));
 assert.equal(ctx.TreizeLibreParcours.currentKey(),'1');
});
test('Suivant from a mini-game skips without points and invokes the existing dotted journey',()=>{
 const h=frontend(),{ctx,events,ids}=h;
 ids.get('marmousetsDialog').open=true;
 const footer=ids.get('marmousetsDialog').querySelector('.arcade-under-actions');
 footer.children[1].click();
 assert.equal(ctx.state.unlocked,2);
 assert.deepEqual(ctx.state.storySkips,['1']);
 assert.equal(ctx.state.points,57);
 assert.ok(events.includes('close-marmousets'));
 assert.ok(events.includes('travel-1'));
 ctx.state.selected=2;ctx.TreizeLibreParcours.updateButtons();
 assert.equal(ids.get('storySkip').hidden,false);
 ids.get('storySkip').click();
 assert.ok(events.includes('travel-2'));
 assert.equal(ctx.state.points,57);
});
test('Retour closes the game without marking it as won or skipped',()=>{
 const h=frontend(),{ids,ctx,events}=h;
 ids.get('arcadeDialog').open=true;
 ids.get('arcadeDialog').querySelector('.arcade-return').click();
 assert.ok(events.includes('close-arcade'));
 assert.equal(ctx.state.points,57);
 assert.deepEqual(ctx.state.storySkips,[]);
 assert.ok(!events.some(e=>e.startsWith('travel-')));
});
test('Dance and prison Suivant use existing internal navigation without double points',()=>{
 const h=frontend(),{ctx,events}=h;
 for(const [scene,key] of [[1,'1'],[2,'2'],[3,'3'],[4,'4']]){
  ctx.state.selected=scene;ctx.TreizeChapitre1.skipPart(ctx.state,key);
 }
 ctx.state.selected=5;
 assert.equal(ctx.TreizeLibreParcours.next('5:dance'),true);
 assert.ok(events.includes('plate-next-dance'));
 assert.equal(ctx.state.points,57);
 assert.equal(ctx.TreizeLibreParcours.next('5:prison'),true);
 assert.ok(events.includes('plate-next-prison'));
 assert.equal(ctx.state.unlocked,6);
 assert.equal(ctx.state.points,57);
});
