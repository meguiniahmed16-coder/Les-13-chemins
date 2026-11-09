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

test('Chapter 2 uses the same featured card as chapter 1 and the title Même pas mal',()=>{
 const html=read('./jeu.html'),ui=read('./chapitre1-plateau.js');
 const levels=JSON.parse(html.match(/const LEVELS=(\[.*?\]);\s*const AVATARS=/s)[1]);
 assert.equal(levels[3].title,'Même pas mal');
 assert.ok(ui.includes("const chapterTwoName='Chapitre 2 — « Même pas mal »'"));
 assert.ok(ui.includes("scene===1||scene===4?' chapter-featured'"));
 assert.ok(ui.includes('if(scene===1||scene===4)'));
 assert.ok(ui.includes('🪖 Sarajevo · Le choc de l’arrivée'));
 assert.ok(ui.includes("if(n===4)$('questTitle').textContent=chapterTwoName"));
 const bosnie=read('./jeu-bosnie.html');
 assert.ok(bosnie.includes('CHAPITRE 2 · « MÊME PAS MAL »'));
 assert.ok(bosnie.includes('CHAPITRE 2 · BOSNIE'));
});
test('Chapter 1 has one plot quiz followed by three games, without duplicate quiz points',()=>{
 const html=read('./jeu.html'),ui=read('./chapitre1-plateau.js'),f=api();
 const levels=JSON.parse(html.match(/const LEVELS=(\[.*?\]);\s*const AVATARS=/s)[1]);
 assert.equal(levels[0].question,'Quelle suite d’événements raconte le chapitre 1, « La salle d’attente » ?');
 assert.equal(levels[0].correct,0);
 assert.deepEqual(levels[0].options,[
  'Retrouver son petit frère, fuir le lycée, puis se débrouiller à Barcelone',
  'Quitter Barcelone, rejoindre l’armée, puis retrouver son petit frère',
  'Partir vers Compostelle, acheter un voilier, puis revenir au lycée'
 ]);
 assert.ok(ui.includes("$('question').hidden=n===2||n===3"));
 assert.ok(ui.includes("$('options').hidden=n===2||n===3"));
 assert.ok(ui.includes('flow.preparePart(state,state.selected,()=>crypto.randomUUID())'));
 let seq=0;
 const ids=()=>String(++seq);
 const state=sample({completed:[1],arcadeBonuses:{1:true},points:110,unlocked:2,selected:2});
 assert.equal(f.preparePart(state,2,ids),true);
 assert.ok(state.completed.includes(2));
 assert.equal(state.points,110,'The shared plot quiz does not pay again for lycée');
 assert.equal(state.arcadePending.id,'1');
 assert.equal(state.arcadePending.correct,true);
 assert.equal(f.partDone(state,2),false,'The lycée mini-game still must succeed');
 state.arcadeBonuses[2]=true;state.arcadePending=null;
 assert.equal(f.partDone(state,2),true);
 state.selected=3;
 assert.equal(f.preparePart(state,3,ids),true);
 assert.equal(state.points,110,'The shared plot quiz does not pay again for Barcelone');
 assert.equal(state.unlocked,4);
 assert.equal(state.catalognePending.id,'2');
 assert.equal(f.done(state),false);
 state.catalogneSold=['c1','c2','c3','c4','c5'];
 state.catalogneFinished=true;state.catalognePending=null;
 assert.equal(f.done(state),true);
 assert.equal(f.canEnter(state,4),true);
 assert.equal(f.chaptersDone(state),1);
 assert.equal(f.preparePart(state,3,ids),false,'A solved game cannot be initialized a second time');
});
test('Interrupted games and already earned points retain their IDs and scores',()=>{
 const f=api();
 const s=sample({completed:[1,2],arcadeBonuses:{1:true},points:212,selected:2,unlocked:3,arcadePending:{id:'saved',level:2,correct:false}});
 assert.equal(f.preparePart(s,2,()=>{throw Error('Do not replace saved IDs');}),true);
 assert.equal(s.arcadePending.id,'saved');
 assert.equal(s.arcadePending.correct,true);
 assert.equal(s.points,212);
 const t=sample({completed:[1,2,3],arcadeBonuses:{1:true,2:true},selected:3,unlocked:4,points:310,
  catalogneSold:['c1','c2','c3'],catalognePending:{id:'old',level:3,correct:false}});
 assert.equal(f.preparePart(t,3,()=>{throw Error('Do not restart an interrupted game');}),true);
 assert.equal(t.catalognePending.id,'old');
 assert.equal(t.catalognePending.correct,true);
 assert.deepEqual(t.catalogneSold,['c1','c2','c3']);
 assert.equal(t.points,310);
 const failed=sample({completed:[1],selected:2,unlocked:2});
 assert.equal(f.preparePart(failed,2,ids=>ids),false,'A single successful quiz does not bypass the Marmousets game');
});
