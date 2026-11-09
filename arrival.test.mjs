import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync(new URL('./escale.js',import.meta.url),'utf8');
const dataCode=fs.readFileSync(new URL('./dist/etapes-data.js',import.meta.url),'utf8');
const passages=JSON.parse(fs.readFileSync(new URL('./passages.json',import.meta.url),'utf8'));
function harness(){
 const elements=[],classes=new Set(),timers=new Map();let timerId=0;
 const context=vm.createContext({setTimeout:(fn,delay)=>{const id=++timerId;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id),document:{head:{append(){}},body:{append(){}},documentElement:{classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)}},getElementById:()=>null,createElement:tag=>{
  const events=new Map(),children=new Map();
  const e={tag,open:false,dataset:{},setAttribute(){},querySelectorAll:()=>[],querySelector:s=>{if(!children.has(s))children.set(s,{focus(){e.focused=s;},after(child){e.inserted=child;},scrollIntoView(){}});return children.get(s);},
  querySelectorAll:s=>{if(s!=='.arrival-quiz-answer')return[];return e.quizButtons??=Array.from({length:3},(_,i)=>({dataset:{answer:String(i)},onclick:null}));},
  addEventListener:(s,f)=>events.set(s,f),showModal(){this.open=true;},close(){this.open=false;events.get('close')?.();},remove(){this.removed=true;},emit:s=>events.get(s)?.()};elements.push(e);return e;
 }}});
 context.window=context;vm.runInContext(dataCode,context);vm.runInContext(code,context);
 return {context,api:context.TreizeEscale,elements,classes,timers,runTimers:()=>{
  for(const [id,fn]of [...timers]){timers.delete(id);fn();}
 }};
}
test('Every arrival uses the exact approved excerpt and includes its references, location and challenge',()=>{
 const h=harness();assert.equal(h.context.TreizeEtapesData.length,13);
 for(const original of passages){const s=h.api.getStage(original.level),html=h.api.readerHTML(s);assert.equal(s.passage.quote,original.quote);assert.equal(s.passage.source,original.source);assert.ok(html.includes('GPS'));assert.ok(html.includes('Altitude'));assert.ok(html.includes('Relevez le défi'));assert.ok(s.historySource.url.startsWith('https://'));assert.ok(Array.isArray(s.characters));}
 assert.equal(h.api.getStage(11).city,'León');assert.equal(h.api.getStage(11).coordinates[1],-5.568);assert.equal(h.api.getStage(4).city,'Sarajevo');
 for(const [level,plateau,chapter,label] of [
  [4,1,2,'CHAPITRE 2 · MÊME PAS MAL'],
  [5,1,3,'CHAPITRE 3 · LE COUP DU BUS'],
  [5,2,4,'CHAPITRE 4 · LE DRAPEAU ROUGE']
 ]){
  const stage=h.api.getStage(level,plateau);
  assert.equal(Number(stage.passage.chapter),chapter,'The displayed excerpt keeps its book chapter');
  assert.ok(h.api.readerHTML(stage).includes(label),'The full-screen reader names the right chapter and plateau');
  assert.ok(!h.api.readerHTML(stage).includes('Le titre de ce passage a été choisi pour le jeu.'),'The three excerpt titles are presented as book chapters');
 }
 assert.equal(h.api.chapterReaderLabel(6),'ÉTAPE 06','Unmapped future stages do not invent book chapter numbers');
});
test('Arrival opens immediately, waits for the reader, and closes once on the challenge',()=>{
 const h=harness();let calls=0;const modal=h.api.openReader(5,{onChallenge:()=>calls++});
 assert.equal(modal.open,true);assert.equal(modal.dataset.level,5);assert.equal(modal.focused,'h2');assert.equal(calls,0);assert.ok(h.classes.has('arrival-reading'));
 assert.equal(h.api.openReader(6),modal,'a duplicate arrival cannot replace an active reading');
 modal.querySelector('.arrival-challenge').onclick();modal.emit('close');assert.equal(calls,1);assert.equal(modal.open,false);assert.ok(modal.removed);assert.equal(h.classes.size,0);
 const next=h.api.openReader(6);assert.notEqual(next,modal);assert.equal(next.dataset.level,6);
});
test('Closing or pressing Escape cannot leave the page trapped and does not alter the excerpt',()=>{
 const h=harness();let calls=0;const m=h.api.openReader(13,{onChallenge:()=>calls++});m.close();assert.equal(calls,1);assert.ok(m.removed);assert.equal(h.classes.size,0);
 let fallback=0;assert.equal(h.api.openReader(99,{onChallenge:()=>fallback++}),null);assert.equal(fallback,1);
});
test('Names and passages remain text, never executable HTML',()=>{
 const h=harness(),s=structuredClone(h.api.getStage(2));s.characters=['<img src=x onerror=alert(1)>'];s.passage.quote='<script>wrong()</script>';s.city='<svg>';
 const html=h.api.readerHTML(s)+h.api.namesHTML(s);assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<svg>'));assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;script&gt;'));
});
test('The board opens the reading after selecting the arrival, without changing points',()=>{
 const source=fs.readFileSync(new URL('./jeu.html',import.meta.url),'utf8');const fn=source.slice(source.indexOf('function arriveAtStage(n){'),source.indexOf('function rollTravel(n){'));
 const calls=[];let open;const state={selected:4,unlocked:5,points:400};
 const c=vm.createContext({LEVELS:Array.from({length:13},(_,i)=>({title:'Scène '+(i+1)})),state,save:()=>calls.push('select'),render:()=>{},document:{getElementById:id=>id==='questTitle'?{focus(){calls.push('focus');},scrollIntoView(){calls.push('scroll');}}:{}},TreizeEscale:{openReader(n,options){calls.push('read');open={n,...options};}}});c.window=c;const selectFn=source.slice(source.indexOf('function select(n){'),source.indexOf('function answer(i){'));vm.runInContext(selectFn+fn+';arriveAtStage(5)',c);
 assert.equal(state.selected,5);assert.equal(state.points,400);assert.deepEqual(calls,['select','read']);assert.equal(open.n,5);open.onChallenge();assert.deepEqual(calls,['select','read','focus','scroll']);
});

test('Only substantive characters appear; solitary stages keep the reading without invented names',()=>{
 const h=harness();assert.deepEqual(Array.from(h.api.getStage(5).characters),['Lionel']);assert.deepEqual(Array.from(h.api.getStage(3).characters),['Michel le Belge']);
 for(const level of [4,7,11,12]){const stage=h.api.getStage(level);assert.equal(stage.characters.length,0);assert.equal(h.api.addCharacters({},level),null);assert.ok(!h.api.readerHTML(stage).includes('aria-label="Les personnages de cette étape"'));}
 for(const stage of h.context.TreizeEtapesData)assert.ok(!stage.characters.includes('Le narrateur'));
 const modal=h.api.openReader(7);assert.equal(modal.open,true);assert.ok(modal.innerHTML.includes('Relevez le défi'));
});

test('Opening a continuity over the passage preserves reading, score flow and return focus',()=>{
 const h=harness();let challenges=0,returned=0;const parent=h.api.openReader(5,{onChallenge:()=>challenges++});parent.scrollTop=465;
 const child=h.api.openCharacters(5,{focus(){returned++;}});assert.equal(child.open,true);assert.equal(parent.open,true);assert.equal(challenges,0);assert.ok(h.classes.has('characters-reading'));
 assert.ok(child.innerHTML.includes('Lionel'));assert.ok(child.innerHTML.includes('création littéraire'));assert.ok(!child.innerHTML.includes('Michel le Belge'));
 child.querySelector('.arrival-challenge').onclick();child.emit('close');assert.equal(returned,1);assert.equal(parent.scrollTop,465);assert.equal(parent.open,true);assert.equal(challenges,0);assert.ok(h.classes.has('arrival-reading'));assert.ok(!h.classes.has('characters-reading'));
 parent.querySelector('.arrival-challenge').onclick();assert.equal(challenges,1);assert.equal(h.api.openCharacters(6),null);assert.equal(h.api.characterButton(6),'');
});
test('Continuity links use only explicit identities and are available on the reading page',()=>{
 const h=harness();for(const [level,name] of [[3,'Michel le Belge'],[1,'Mustapha'],[5,'Lionel']]){const stage=h.api.getStage(level);assert.equal(stage.workshops.length,1);assert.equal(stage.workshops[0].name,name);assert.ok(h.api.readerHTML(stage).includes('En savoir plus sur les personnages'));}
 const lecture=fs.readFileSync(new URL('./lecture.html',import.meta.url),'utf8');assert.ok(lecture.includes('TreizeEscale.characterButton(d.level,d.plateau)'));assert.ok(lecture.includes('TreizeEscale.bindCharacters'));
});

test('Immersive reader opens full screen and the end of the passage automatically starts the next game',()=>{
 const h=harness();let started=0,dismissed=0;
 const stage=h.api.getStage(2),modal=h.api.openReader(2,{
  autoAdvanceOnEnd:true,onChallenge:()=>started++,onDismiss:()=>dismissed++
 });
 assert.equal(modal.open,true);
 assert.equal(modal.dataset.autoplay,'scroll');
 assert.match(modal.innerHTML,/CHAPITRE 1 · LA SALLE D’ATTENTE/);
 assert.ok(modal.innerHTML.includes(stage.passage.quote.split('\n')[0].slice(0,20)),'The exact passage is conserved');
 assert.equal(started,0);
 modal.scrollTop=0;modal.clientHeight=500;modal.scrollHeight=700;modal.emit('scroll');
 assert.equal(h.timers.size,0,'Opening the reader never auto-skips unscrolled text');
 modal.scrollTop=215;modal.emit('scroll');
 assert.equal(h.timers.size,1,'Reaching the bottom schedules a short reading handoff');
 assert.equal(started,0,'The last sentence stays visible briefly');
 h.runTimers();
 assert.equal(started,1);
 assert.equal(dismissed,0);
 assert.equal(modal.open,false);
 assert.ok(modal.removed);
 h.runTimers();assert.equal(started,1,'No double game launch');
});
test('Closing the immersive reader does not launch the next game; explicit continue still works',()=>{
 const h=harness();let started=0,dismissed=0;
 const a=h.api.openReader(3,{autoAdvanceOnEnd:true,onChallenge:()=>started++,onDismiss:()=>dismissed++});
 a.close();assert.equal(started,0);assert.equal(dismissed,1,'Escape or close is a safe exit');
 const b=h.api.openReader(4,{autoAdvanceOnEnd:true,onChallenge:()=>started++,onDismiss:()=>dismissed++});
 b.querySelector('.arrival-challenge').onclick();
 assert.equal(started,1);assert.equal(dismissed,1);
 assert.match(h.api.readerHTML(h.api.getStage(4)),/CHAPITRE 2 · MÊME PAS MAL/);
});
test('End-of-reading detection works with readable text boundaries, not on initial focus',()=>{
 const h=harness(),check=h.api.reachedReadingEnd;
 assert.equal(check({scrollTop:0,clientHeight:500,scrollHeight:500},null),false);
 assert.equal(check({scrollTop:20,clientHeight:500,scrollHeight:600},null),false);
 assert.equal(check({scrollTop:110,clientHeight:500,scrollHeight:600},null),true);
 assert.equal(check({scrollTop:70,clientHeight:500,scrollHeight:800},null),false);
 const modal={scrollTop:75,getBoundingClientRect:()=>({bottom:720})};
 assert.equal(check(modal,{getBoundingClientRect:()=>({bottom:680})}),true);
 assert.equal(check(modal,{getBoundingClientRect:()=>({bottom:740})}),false);
});

test('The chapter 2 quiz is inside the reader and must be answered before auto-playing Sarajevo',()=>{
 const h=harness();let started=0,answers=[],dismiss=0;
 const modal=h.api.openReader(4,{
  autoAdvanceOnEnd:true,
  inlineQuiz:{question:'Quel contraste découvre le narrateur à Sarajevo ?',
   options:['Le départ','La ville','Les autres'],correct:1,onAnswer:i=>answers.push(i)},
  onChallenge:()=>started++,onDismiss:()=>dismiss++
 });
 const quiz=h.elements.find(x=>x.className==='arrival-inline-quiz');
 assert.ok(quiz,'The quiz appears inside the full-screen reading interface');
 assert.ok(quiz.innerHTML.includes('Quel contraste'));
 assert.ok(quiz.querySelectorAll('.arrival-quiz-answer').length===3);
 modal.scrollTop=200;modal.clientHeight=500;modal.scrollHeight=600;
 modal.emit('scroll');assert.equal(h.timers.size,0,'Unanswered quiz prevents automatic launch');
 modal.querySelector('.arrival-challenge').onclick();
 assert.equal(started,0,'The manual continuation cannot bypass the quiz');
 quiz.querySelectorAll('.arrival-quiz-answer')[1].onclick();
 assert.deepEqual(answers,[1]);
 assert.match(quiz.innerHTML,/Bonne réponse/);
 assert.equal(h.timers.size,1,'Completing the quiz arms the automatic handoff');
 h.runTimers();
 assert.equal(started,1);assert.equal(dismiss,0);assert.equal(modal.open,false);
});
test('After the arrival reading, the correct game launches without an extra click',()=>{
 const source=fs.readFileSync(new URL('./jeu.html',import.meta.url),'utf8');
 const fn=source.slice(source.indexOf('function arriveAtStage(n){'),source.indexOf('function rollTravel(n){'));
 const selectFn=source.slice(source.indexOf('function select(n){'),source.indexOf('function answer(i){'));
 const clicked=[],opens=[];
 const state={selected:1,unlocked:5,completed:[1,2,3],points:185};
 const doc={
  getElementById(id){
   if(['arcadeLaunch','catalogneLaunch','danseLaunch'].includes(id))
    return {click(){clicked.push(id);},disabled:false};
   if(id==='bosnieLaunch')return null;
   if(id==='questTitle')return {focus(){},scrollIntoView(){}};
   return {textContent:''};
  }
 };
 const c=vm.createContext({state,LEVELS:Array.from({length:13},(_,i)=>({
  title:'Scène '+(i+1),question:'Question '+i,options:['A','B','C'],correct:0
 })),document:doc,save(){},render(){},TreizeEscale:{openReader(n,options){opens.push({n,options});}}});
 c.window=c;
 vm.runInContext(selectFn+fn+';arriveAtStage(2);arriveAtStage(3);arriveAtStage(5);',c);
 assert.deepEqual(opens.map(x=>x.n),[2,3,5]);
 assert.ok(opens.every(x=>x.options.autoAdvanceOnEnd===true));
 for(const opened of opens)opened.options.onChallenge();
 assert.deepEqual(clicked,['arcadeLaunch','catalogneLaunch','danseLaunch']);
 assert.equal(state.points,185,'Opening a video does not grant any bonus');
 c.TreizeEscale.openReader=(_n,options)=>opens.push({n:4,options});
 vm.runInContext('arriveAtStage(4)',c);
 assert.equal(opens.at(-1).options.inlineQuiz.question,'Question 3','The Sarajevo quiz appears inside reading');
 assert.equal(clicked.includes('bosnieLaunch'),false,'The Sarajevo quiz is not bypassed');
});

test('Passer le défi closes immersive reading and advances without answering or starting the game',()=>{
 const h=harness();let started=0,skipped=0,dismissed=0,answer=0;
 const m=h.api.openReader(4,{autoAdvanceOnEnd:true,
  onSkip:()=>skipped++,onChallenge:()=>started++,onDismiss:()=>dismissed++,
  inlineQuiz:{question:'Quelle scène ?',options:['A','B','C'],correct:1,onAnswer:()=>answer++}
 });
 assert.equal(m.open,true);
 const top=h.elements.find(e=>e.className==='arrival-skip-top');
 const footer=h.elements.find(e=>e.className==='arrival-skip');
 assert.ok(top);assert.ok(footer);
 footer.onclick();
 assert.equal(m.open,false);
 assert.equal(started,0,'Skipping must not launch the mini-game');
 assert.equal(skipped,1);
 assert.equal(dismissed,0);
 assert.equal(answer,0,'The quiz is optional when skipping the challenge');
 h.runTimers();
 assert.equal(skipped,1,'Reader completion must settle once');
});
test('Closing reader without using skip does not change progress or trigger next game',()=>{
 const h=harness();let skipped=0,dismissed=0,started=0;
 const m=h.api.openReader(2,{autoAdvanceOnEnd:true,
  onSkip:()=>skipped++,onDismiss:()=>dismissed++,onChallenge:()=>started++});
 m.querySelector('.arrival-close').onclick();
 assert.equal(skipped,0);assert.equal(dismissed,1);assert.equal(started,0);
});
test('The board and the prison reader expose the skip option for every mini-game',()=>{
 const html=fs.readFileSync(new URL('./jeu.html',import.meta.url),'utf8'),
  plates=fs.readFileSync(new URL('./plateaux.js',import.meta.url),'utf8');
 assert.ok(html.includes("onSkip:()=>window.TreizeLibreParcours?.next(prison?'5:prison':n===5?'5:dance':String(n))"));
 assert.ok(plates.includes("onSkip:()=>window.TreizeLibreParcours?.next('5:prison')"));
 assert.ok(html.includes('src="libre-parcours.js"'));
});

test('Clicking Les Marmousets first opens its immersive text, inline plot quiz, then the game',()=>{
 const html=fs.readFileSync(new URL('./jeu.html',import.meta.url),'utf8');
 const fn=html.slice(html.indexOf('function arriveAtStage(n){'),html.indexOf('function rollTravel(n){'));
 const selectFn=html.slice(html.indexOf('function select(n){'),html.indexOf('function answer(i){'));
 const events=[],state={selected:1,unlocked:1,completed:[],marmousetsPending:null,points:0};
 const levels=Array.from({length:13},(_,i)=>({
  title:'Scène '+(i+1),question:'Question '+i,options:['Choix 1','Choix 2','Choix 3'],correct:1
 }));
 let options;
 const ctx=vm.createContext({state,LEVELS:levels,save:()=>{},render:()=>{},
  document:{getElementById:id=>{
   if(id==='marmousetsLaunch')return{disabled:false,click:()=>events.push('marmousets-game')};
   if(id==='questTitle')return{focus(){},scrollIntoView(){}};
   return{textContent:''};
  }},
  TreizeEscale:{openReader(n,opts){events.push('reading-'+n);options=opts;}},
  answer(index){events.push('quiz-'+index);state.marmousetsPending={id:'first',correct:index===1};}
 });
 ctx.window=ctx;
 vm.runInContext(selectFn+fn+';arriveAtStage(1)',ctx);
 assert.deepEqual(events,['reading-1'],'First click must not jump straight to the mini-game');
 assert.equal(options.autoAdvanceOnEnd,true,'The first passage uses automatic scrolling');
 assert.equal(options.inlineQuiz.question,'Question 0','The chapter plot quiz is embedded in reading');
 assert.equal(options.inlineQuiz.correct,1);
 options.inlineQuiz.onAnswer(1);
 assert.deepEqual(events,['reading-1','quiz-1']);
 options.onChallenge();
 assert.deepEqual(events,['reading-1','quiz-1','marmousets-game']);
 assert.equal(state.points,0,'Opening the game does not fabricate quiz or game points');
});
test('All reading surfaces fill the full screen, without stretching long paragraphs',()=>{
 const immersive=fs.readFileSync(new URL('./escale.js',import.meta.url),'utf8');
 const standalone=fs.readFileSync(new URL('./lecture.html',import.meta.url),'utf8');
 assert.ok(immersive.includes(':is(#arrivalReader,#characterReader){position:fixed;inset:0;width:100vw;max-width:100vw;height:100dvh;max-height:100dvh'));
 assert.ok(immersive.includes('max-width:860px;margin:0 auto'));
 assert.ok(immersive.includes("font:clamp(20px,2.2vw,25px)/1.86 Georgia"));
 assert.ok(standalone.includes('min-height:100dvh'));
 assert.ok(standalone.includes('max-width:860px'));
 assert.ok(standalone.includes('body{margin:0;background:#fff9ec}'));
});
test('No original board bitmap or thirteen old hitboxes appear before the two grouped game blocks',()=>{
 const html=fs.readFileSync(new URL('./jeu.html',import.meta.url),'utf8'),
  ui=fs.readFileSync(new URL('./chapitre1-plateau.js',import.meta.url),'utf8');
 assert.ok(!html.includes('<picture>'));
 assert.ok(!html.includes('plateau-large.webp'));
 assert.ok(!html.includes('plateau-mobile.webp'));
 assert.ok(!html.includes('function boardGeometry(){'));
 assert.ok(!html.includes('host.replaceChildren(...positions.map'));
 assert.ok(html.includes('function drawBoard(){}'));
 assert.ok(ui.includes("host.dataset.mode='chapters-grouped-v2'"));
 assert.ok(ui.includes('host.replaceChildren(...flow.CARDS.map'));
 assert.ok(ui.includes("const icons=['🌳','🪖']"));
 assert.ok(ui.includes('marmousetsReadingStart'));
 assert.ok(ui.includes('b.onclick=()=>arriveAtStage(p.scene)'));
});
