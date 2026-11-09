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
  const e={tag,open:false,dataset:{},setAttribute(){},querySelectorAll:()=>[],querySelector:s=>{if(!children.has(s))children.set(s,{focus(){e.focused=s;}});return children.get(s);},addEventListener:(s,f)=>events.set(s,f),showModal(){this.open=true;},close(){this.open=false;events.get('close')?.();},remove(){this.removed=true;},emit:s=>events.get(s)?.()};elements.push(e);return e;
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
