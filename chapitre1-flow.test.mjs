import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8');
function api(){
 const ctx=vm.createContext({});
 vm.runInContext(read('./chapitre1-flow.js'),ctx);
 return ctx.TreizeChapitre1;
}
const sample=(patch={})=>({
 completed:[],points:0,unlocked:1,selected:1,
 arcadeBonuses:{},catalogneFinished:false,catalogneSold:[],...patch
});
test('Only 11 chapter tiles are displayed; the first contains three historical playable scenes',()=>{
 const f=api();
 assert.deepEqual(Array.from(f.CARDS),[1,4,5,6,7,8,9,10,11,12,13]);
 assert.deepEqual(Array.from(f.PARTS,p=>p.scene),[1,2,3]);
 assert.deepEqual(Array.from(f.PARTS,p=>p.game),['arcade-marmousets.html','arcade-a410.html','arcade-catalogne.html']);
 assert.deepEqual([1,2,3,4,5,13].map(f.chapterOf),[1,1,1,2,3,11]);
});
test('A correct answer alone never unlocks the next video or Sarajevo',()=>{
 const f=api(),s=sample({completed:[1,2,3],unlocked:4});
 assert.equal(f.partDone(s,1),false);
 assert.equal(f.done(s),false);assert.equal(f.nextPart(s),1);
 assert.equal(f.canEnter(s,2),false);
 assert.equal(f.canEnter(s,3),false);
 assert.equal(f.canEnter(s,4),false);
 assert.equal(f.chaptersDone(s),0);
 assert.equal(f.chapterReached(s),1);
});
test('The three mini-games must succeed in order, and each preserves its historic bonus',()=>{
 const f=api(),s=sample({completed:[1],unlocked:2,points:110});
 s.arcadeBonuses[1]=true;
 assert.equal(f.partDone(s,1),true);
 assert.equal(f.canEnter(s,2),true);
 assert.equal(f.canEnter(s,3),false);assert.equal(f.nextPart(s),2);
 assert.equal(f.chaptersDone(s),0,'The chapter is not won after video one');
 s.completed.push(2);s.unlocked=3;s.arcadeBonuses[2]=true;
 assert.equal(f.partDone(s,2),true);
 assert.equal(f.canEnter(s,3),true);assert.equal(f.nextPart(s),3);
 s.completed.push(3);s.unlocked=4;
 assert.equal(f.done(s),false,'The third quiz alone does not complete chapter one');
 s.catalogneFinished=true;s.catalogneSold=['c1','c2','c3','c4','c5'];s.points=330;
 assert.equal(f.partDone(s,3),true);assert.equal(f.done(s),true);
 assert.equal(f.canEnter(s,4),true);
 assert.equal(f.chaptersDone(s),1);
 assert.equal(f.chapterReached(s),2);
 assert.equal(s.points,330,'Grouping does not change the accumulated points');
});
test('Past players on later scenes keep their progress; incomplete players resume on the right part',()=>{
 const f=api();
 const v=sample({completed:[1,2,3,4,5],selected:5,unlocked:6,points:540});
 assert.equal(f.legacy(v),true);
 assert.equal(f.done(v),true);
 assert.equal(f.canEnter(v,6),true);
 assert.equal(f.reconcile(v),false);
 assert.equal(f.chaptersDone(v),3,'Chapter 1 + Sarajevo + Paris');
 assert.equal(v.points,540);
 const w=sample({completed:[1,2],selected:3,unlocked:3,arcadeBonuses:{1:true}});
 assert.equal(f.reconcile(w),true);
 assert.equal(w.selected,2,'Return to the first unfinished mini-game');
 assert.equal(w.completed.length,2,'No old quiz answer is lost');
 assert.equal(w.unlocked,3,'No historical stage id is changed');
});
test('Atlas has 13 underlying scenes, but the plateau exposes only 11 visual cards',()=>{
 const html=read('./jeu.html'),ui=read('./chapitre1-plateau.js'),build=read('./build-public.mjs');
 assert.match(html,/const LEVELS=\[(.*?)\];\s*const AVATARS=/s);
 assert.ok(html.includes('src="chapitre1-flow.js"'));
 assert.ok(html.includes('src="chapitre1-plateau.js"'));
 assert.ok(html.includes('src="ordre-lecture.js"'));
 assert.ok(ui.includes('host.replaceChildren(...flow.CARDS.map'));
 assert.ok(ui.includes('scene===1?(flow.done(state)?1:flow.nextPart(state)):scene'));
 assert.ok(ui.includes("arriveAtStage(n+1);return;"));
 assert.ok(ui.includes("if(n===3&&!flow.done(state))return;"));
 assert.ok(ui.includes('Chapitre 1 — « La salle d’attente »'));
 assert.ok(ui.includes("drawBoard=paintTargets"));
 assert.ok(build.includes("'chapitre1-flow.js'"));
 assert.ok(build.includes("'chapitre1-plateau.js'"));
 assert.ok(build.includes("'chapitre1-flow.test.mjs'"));
 for(const [f,i] of [['arcade-marmousets.html',1],['arcade-a410.html',2],['arcade-catalogne.html',3]]){
  assert.ok(read('./'+f).includes('Chapitre 1 · partie '+i+'/3'));
 }
});
