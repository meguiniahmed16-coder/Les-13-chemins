import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import * as T from 'three';
import {introSoundEnvelope} from './intro-sound.js';
import {arrivalFrame} from './intro-arrival.js';
import {INTRO_INVITATION_DURATION} from './intro-invitation.js';

const source=readFileSync(new URL('./intro-cinema.js',import.meta.url),'utf8');
const html=readFileSync(new URL('./intro-prive.html',import.meta.url),'utf8');
function fragment(from,to){
 const start=source.indexOf(from),end=source.indexOf(to,start+from.length);
 assert.ok(start>=0&&end>start,`Missing production fragment: ${from}`);
 return source.slice(start,end);
}
const lines=JSON.parse(fragment('const lines=',';\nconst dojoStart').slice('const lines='.length));
const production=[
 fragment('function setPending(','const whiteFloor='),
 fragment('function shotElapsed(','const headPoint='),
 fragment('async function prepareDojoPerformance(','async function preloadNext('),
 fragment('function scheduleNext(','// The original television'),
 fragment('async function showScene(',"$('report-add').onclick="),
 fragment('function frame(','async function authorize('),
 fragment('async function initialize(',"$('retry-load').onclick="),
].join('\n');

// Keep the real cue, animation-frame, loading and timer control flow. Only
// external rendering/assets and the browser DOM/clock are replaced here.
function eventTarget(){
 const listeners=new Map();
 return {
  addEventListener(type,fn,options={}){const entries=listeners.get(type)||[];entries.push({fn,once:options.once});listeners.set(type,entries)},
  dispatch(type,event={}){for(const entry of [...listeners.get(type)||[]]){entry.fn(event);if(entry.once)listeners.set(type,listeners.get(type).filter(e=>e!==entry))}},
 };
}
function domFixture(){
 const nodes=new Map();
 function element(name='div'){
  const classes=new Set(),writes=[];
  let hidden=false,textContent='';
  const node={...eventTarget(),name,writes,children:[],disabled:false,value:'',open:false,
   get hidden(){return hidden},set hidden(value){hidden=value;writes.push(['hidden',value])},
   get textContent(){return textContent},set textContent(value){textContent=value;writes.push(['text',value])},
   style:new Proxy({setProperty(k,v){writes.push(['style',k,v])}}, {set(o,k,v){writes.push(['style',k,v]);o[k]=v;return true}}),
   classList:{add(...v){v.forEach(x=>classes.add(x))},remove(...v){v.forEach(x=>classes.delete(x))},contains(v){return classes.has(v)}},
   replaceChildren(...children){this.children=children;writes.push(['children',children.length])},
   append(...children){this.children.push(...children);writes.push(['append',children.length])},
   animate(){writes.push(['animation']);return {cancel(){}}},getAnimations(){return[]},
   showModal(){this.open=true},close(){this.open=false;this.dispatch('close')},click(){this.onclick?.()},
  };
  return node;
 }
 for(const match of html.matchAll(/<([\w-]+)\b([^>]*\bid="([^"]+)"[^>]*)>/g)){
  const node=element(match[1]);node.hidden=/\bhidden(?:\s|$|=)/.test(match[2]);node.disabled=/\bdisabled(?:\s|$|=)/.test(match[2]);node.writes.length=0;nodes.set(match[3],node);
 }
 const $=id=>{assert.ok(nodes.has(id),`Production refers to absent DOM element #${id}`);return nodes.get(id)};
 return {$,nodes,element,document:{...eventTarget(),hidden:false,getElementById:$,createElement:element},window:eventTarget()};
}
async function flush(){for(let i=0;i<10;i++)await Promise.resolve()}
function clockFixture(){
 let now=0,serial=0;const timers=new Map();
 return {performance:{now:()=>now},setTimeout(fn,ms){const id=++serial;timers.set(id,{fn,at:now+ms});return id},clearTimeout(id){timers.delete(id)},
  count:()=>timers.size,now:()=>now,tick:ms=>now+=ms,
  async advance(){const next=[...timers.entries()].sort((a,b)=>a[1].at-b[1].at)[0];assert.ok(next,'Expected a continuation timer');timers.delete(next[0]);now=next[1].at;await next[1].fn();await flush()},
 };
}
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}}
function harness({dojoLoaded=true}={}){
 const dom=domFixture(),time=clockFixture(),visits=[],arrivals=[],soundCalls=[],arrivalCalls=[];let renders=0,filmStops=0;
 const soundOffsets=[];let introductionDuration=0;
 for(const line of lines){soundOffsets.push(introductionDuration);introductionDuration+=line.ms;}
 const introSound=Object.fromEntries(['start','pause','stop','dispose','update'].map(method=>[method,frame=>soundCalls.push({method,frame})]));
 const actors=['m','f'].map((id,i)=>({id,root:{name:i?'Marianne':'Ahmed',position:new T.Vector3(i?1:-1,0,0),rotation:{y:0}},sit:false,pose(){},speak(){}}));
 const state={T,...dom,...time,lines,dojoStart:lines.findIndex(s=>s.scene==='dojo'),introSound,soundOffsets,introductionDuration,arrivalFrame,INTRO_INVITATION_DURATION,pauseReasons:new Set(),resumeAfterPause:false,
  room:{},dojo:dojoLoaded?{visible:false}:null,people:actors,
  dojoWardrobe:{ready:dojoLoaded,cancelled:false,async prepare(){if(!this.cancelled)this.ready=true},restore(){this.cancelled=true;this.ready=false}},
  dojoDemo:{hidden:true,updates:[],update(line,elapsed){this.hidden=line.scene!=='dojo';this.updates.push([line.id,elapsed])},hide(){this.hidden=true}},
  promotionMode:false,arrivalPlayer:{state:'idle',elapsed:0,paused:false,
   start(options){arrivals.push(options);this.state=options.skip?'complete':'loading';this.paused=options.paused;dom.$('garden-frame').src='/membres/v27/salon.html?resident=marianne&arrival=cinema&finale=1&v=incarnations33'},
   tick(){},pause(){this.paused=true;arrivalCalls.push('pause')},resume(){this.paused=false;arrivalCalls.push('resume')},
  },
  isStagedDojo:line=>line?.demo===true,stageDojoPeople:()=>null,chairs:[],whiteFloor:{visible:true},
  salonEntryMode:false,stage:'white',step:-1,autoplay:false,autoTimer:0,alias:'Camille',authorized:true,ready:true,started:false,gardenLoaded:false,
  pending:false,sceneRequest:0,seatsReady:true,initialTask:null,shotStart:0,shotPaused:false,pausedAt:0,pausedElapsed:0,
  currentSpeaker:null,lastLayout:'',secondCue:false,cutCamera:false,invitationMotion:null,targetAngle:Math.PI,radius:3.7,
  bubble:dom.$('bubble'),status:dom.$('status'),scene:{background:{set(){}}},problems:[],bootStage:'Test',
  joystick:{x:0,y:0},keys:new Set(),camera:{position:new T.Vector3(),lookAt(){}},clock:{getDelta:()=>.016},
  renderer:{render(){renders++}},requestAnimationFrame(){},
  mountRoom(){},layoutPeople(){},furnitureAt(){},prepareFilm(){},anchorBubble(){},stopFilm(){filmStops++},advanceMovement(){},updateInvitation(){},cameraShot(){},
  beginInvitation(){state.invitationMotion={complete:true}},
  updateFilm(line,elapsed){if(elapsed===0)visits.push(line.id)},
  remember(type,message){state.problems.push({type,message})},showBootStage(){},preloadNext(){},
  turnDelta:()=>0,facingYaw:()=>0,authorize:async()=>{state.authorized=true},loadWhite:async()=>{state.room={}},loadPeople:async()=>{state.people=actors},
  prepareDojo:async()=>{state.dojo={visible:false}},prepareSeats:async()=>{state.seatsReady=true},
 };
 createContext(state);runInContext(production,state,{filename:'intro-cinema.production-fragments.js'});
 return {state,dom,time,visits,arrivals,soundCalls,arrivalCalls,get renders(){return renders},get filmStops(){return filmStops},
  async enter(){dom.$('enter').click();await flush()},
  frames(count){for(let i=0;i<count;i++){time.tick(16);state.frame()}},
  setHidden(hidden){dom.document.hidden=hidden;dom.document.dispatch('visibilitychange')},
  get soundFrame(){return soundCalls.findLast(call=>call.method==='update')?.frame},
 };
}

test('one scene bubble has a persistent display option while report and skip stay available',()=>{
 const footer=html.match(/<footer>([\s\S]*?)<\/footer>/)?.[1];assert.ok(footer);
 const stage=html.match(/<main id="stage">([\s\S]*?)<\/main>/)?.[1];assert.ok(stage);
 assert.equal([...html.matchAll(/id="bubble"/g)].length,1);
 assert.match(stage,/<div id="bubble" hidden aria-live="polite" aria-atomic="true"><\/div>/);
 const ids=[...footer.matchAll(/<button\b[^>]*id="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(ids,['report-open','intro-bubbles-toggle','skip']);
 assert.match(footer,/id="intro-bubbles-toggle" aria-pressed="true"/);
 assert.match(html,/#stage\.bubbles-off #bubble\{display:none!important\}/);
 assert.match(html,/#bubble:after\{content:''/);
 assert.match(source,/const bubblePreferenceKey='salon-bulles-visibles-v1'/);
 assert.match(source,/bubblesEnabled=!bubblesEnabled/);
 assert.match(source,/if\(!cinematicVoiceEnabled\|\|document.hidden/);
});

test('camera and lip animation keep the entire reply intact until the next speaker',async()=>{
 const h=harness();await h.enter();
 h.state.step=lines.findIndex(line=>line.speaker&&!line.secondary&&!line.invitation);
 h.state.shotStart=h.time.now();h.state.setCue('m','Bienvenue, {pseudo}. Voici le texte complet.');
 const bubble=h.dom.$('bubble');
 assert.equal(bubble.hidden,false);
 assert.deepEqual(bubble.children.map(n=>n.textContent),['Ahmed Marie','Bienvenue, Camille. Voici le texte complet.']);
 const children=[...bubble.children];bubble.writes.length=0;
 h.frames(180);
 assert.equal(h.renders,180);assert.deepEqual(bubble.writes,[]);
 assert.deepEqual(bubble.children,children);
 h.state.stopSpeech();assert.equal(bubble.hidden,true);
 h.state.setCue('f','La réponse reste au même endroit.');
 assert.equal(bubble.children[0].textContent,'Marianne');
 assert.equal(bubble.writes.some(w=>w[0]==='animation'),false);
});

test('one start automatically visits every white-room and dojo line, then opens the garden',async()=>{
 const h=harness({dojoLoaded:false});await h.enter();
 for(let i=0;h.state.stage!=='garden'&&i<=lines.length;i++)await h.time.advance();
 assert.deepEqual(h.visits,lines.map(line=>line.id));
 assert.ok(h.visits.includes('dojo-arrivee'));assert.ok(h.visits.includes('dojo-construction'));
 assert.equal(h.state.stage,'garden');assert.equal(h.state.autoplay,false);assert.equal(h.time.count(),0);
 assert.equal(h.dom.$('garden').hidden,false);assert.equal(h.dom.$('bubble').hidden,true);
 assert.equal(h.dom.$('skip').hidden,true);
 assert.equal(h.dom.$('garden-frame').src,'/membres/v27/salon.html?resident=marianne&arrival=cinema&finale=1&v=incarnations33');
 assert.equal(h.arrivals.length,1);assert.equal(h.arrivals[0].skip,false);
});

test('one user gesture keeps the sound clock while music is silent for every dojo line',async()=>{
 const h=harness();await h.enter();let elapsed=0;
 for(let i=0;i<lines.length;i++){
  const line=lines[i];h.state.frame();
  assert.equal(h.soundFrame.sceneId,line.id);
  assert.equal(h.soundFrame.timeMs,elapsed,`Continuous offset at ${line.id}`);
  assert.equal(h.soundFrame.playing,true,`Sound cues run at ${line.id}`);
  if(line.scene==='dojo')assert.equal(introSoundEnvelope(h.soundFrame).music,0,`No music at the start of ${line.id}`);
  h.time.tick(400);h.state.frame();
  assert.equal(h.soundFrame.timeMs,elapsed+400,`Clock advances during ${line.id}`);
  assert.equal(h.soundFrame.playing,true);
  if(line.scene==='dojo')assert.equal(introSoundEnvelope(h.soundFrame).music,0,`No music while ${line.id} plays`);
  else assert.ok(introSoundEnvelope(h.soundFrame).music>0,`Opening music is enabled in ${line.id}`);
  elapsed+=line.ms;if(i<lines.length-1)await h.time.advance();
 }
 assert.equal(h.soundCalls.filter(call=>call.method==='start').length,1);
 assert.equal(h.soundCalls.filter(call=>call.method==='pause'||call.method==='stop').length,0);
 await h.time.advance();h.state.frame();
 assert.equal(h.soundFrame.sceneId,'salon-invitation');assert.equal(h.soundFrame.timeMs,elapsed);
 assert.equal(h.soundFrame.playing,false,'Music waits for the actual garden readiness');
 h.state.arrivalPlayer.state='playing';h.state.arrivalPlayer.elapsed=750;h.state.frame();
 assert.equal(h.soundFrame.sceneId,'salon-invitation');assert.equal(h.soundFrame.timeMs,elapsed);assert.equal(h.soundFrame.playing,true);
 assert.equal(introSoundEnvelope(h.soundFrame).music,0,'The salon demonstration keeps music silent before the garden');
 h.state.arrivalPlayer.elapsed=INTRO_INVITATION_DURATION-1;h.state.frame();
 assert.equal(h.soundFrame.timeMs,elapsed,'The complete invitation does not consume the ending music asset');
 assert.equal(introSoundEnvelope(h.soundFrame).music,0);
 h.state.arrivalPlayer.elapsed=INTRO_INVITATION_DURATION+750;h.state.frame();
 assert.equal(h.soundFrame.sceneId,'arrival');assert.equal(h.soundFrame.elapsedMs,750);assert.equal(h.soundFrame.timeMs,elapsed+750);
 assert.ok(introSoundEnvelope(h.soundFrame).music>0,'Music returns only in the actual garden arrival');
 assert.equal(h.soundCalls.filter(call=>call.method==='start').length,1,'Garden continues the same playback');
 assert.equal(h.soundCalls.filter(call=>call.method==='stop').length,0);
 h.state.promotionMode=true;h.state.arrivalPlayer.elapsed=INTRO_INVITATION_DURATION+17000;h.state.frame();
 assert.equal(h.soundFrame.elapsedMs,17000,'The promotional card retains the untruncated garden clock');
 assert.equal(h.soundFrame.timeMs,elapsed+17000);
 assert.ok(introSoundEnvelope(h.soundFrame).music>0,'The ending remains musical during the final card fade');
 h.state.arrivalPlayer.elapsed=INTRO_INVITATION_DURATION+20500;h.state.frame();
 assert.equal(introSoundEnvelope(h.soundFrame).music,0,'The last music fade ends with the promotional card');
});

test('a delayed sitting animation retains its continuation until the movement is complete',async()=>{
 const h=harness();await h.enter();
 h.state.invitationMotion={complete:false};const step=h.state.step;
 await h.time.advance();assert.equal(h.state.step,step);assert.equal(h.time.count(),1);
 const now=h.time.now();h.state.invitationMotion.complete=true;await h.time.advance();
 assert.equal(h.time.now()-now,200);assert.equal(h.state.step,step+1);assert.equal(h.time.count(),1);
});

test('closing the report dialog resumes the remaining duration without changing the cue',async()=>{
 const h=harness();await h.enter();h.time.tick(1250);
 const cue=[...h.dom.$('bubble').children];h.dom.$('report-open').click();
 assert.equal(h.state.autoplay,false);assert.equal(h.state.shotPaused,true);assert.equal(h.time.count(),0);
 h.time.tick(20000);h.frames(3);assert.deepEqual(h.dom.$('bubble').children,cue);
 h.dom.$('report-dialog').close();assert.equal(h.state.autoplay,true);assert.equal(h.state.shotPaused,false);
 const now=h.time.now();await h.time.advance();
 assert.equal(h.time.now()-now,lines[0].ms-1250);assert.equal(h.state.step,1);
});

for(const first of ['report','hidden'])test(`nested ${first}-first pauses resume only when both reasons clear`,async()=>{
 const h=harness();await h.enter();h.time.tick(1250);h.state.frame();
 const before=h.soundFrame.timeMs,cue=[...h.dom.$('bubble').children];
 if(first==='report'){h.dom.$('report-open').click();h.setHidden(true);}
 else{h.setHidden(true);h.dom.$('report-open').click();}
 assert.equal(h.state.pauseReasons.size,2);assert.equal(h.time.count(),0);
 h.time.tick(20000);h.state.frame();assert.equal(h.soundFrame.playing,false);assert.equal(h.soundFrame.timeMs,before);
 if(first==='report')h.dom.$('report-dialog').close();else h.setHidden(false);
 assert.equal(h.state.pauseReasons.size,1);assert.equal(h.state.shotPaused,true);assert.equal(h.state.autoplay,false);
 h.time.tick(15000);h.state.frame();assert.equal(h.soundFrame.playing,false);assert.equal(h.soundFrame.timeMs,before);
 assert.equal(h.time.count(),0);assert.deepEqual(h.dom.$('bubble').children,cue);
 if(first==='report')h.setHidden(false);else h.dom.$('report-dialog').close();
 assert.equal(h.state.pauseReasons.size,0);assert.equal(h.state.shotPaused,false);assert.equal(h.state.autoplay,true);
 h.frames(1);assert.equal(h.soundFrame.playing,true);assert.equal(h.soundFrame.timeMs,before+16);
 const now=h.time.now();await h.time.advance();assert.equal(h.time.now()-now,lines[0].ms-before-16);
 assert.equal(h.soundCalls.filter(call=>call.method==='start').length,1);
});

test('a scene that finishes loading under the report dialog stays paused until close',async()=>{
 const h=harness({dojoLoaded:false}),load=deferred();await h.enter();
 h.state.prepareDojo=async()=>{await load.promise;h.state.dojo={visible:false}};
 const pending=h.state.showScene(h.state.dojoStart);assert.equal(h.state.pending,true);
 h.dom.$('report-open').click();load.resolve();await pending;
 assert.equal(h.state.stage,'dojo');assert.equal(h.state.shotPaused,true);assert.equal(h.time.count(),0);
 h.dom.$('report-dialog').close();assert.equal(h.state.shotPaused,false);assert.equal(h.time.count(),1);
 await h.time.advance();assert.equal(h.state.step,h.state.dojoStart+1);
});

test('dojo preparation finishing in a hidden tab keeps the scene and sound paused',async()=>{
 const h=harness({dojoLoaded:false}),load=deferred();await h.enter();
 h.state.prepareDojo=async()=>{await load.promise;h.state.dojo={visible:false}};
 const pending=h.state.showScene(h.state.dojoStart);h.setHidden(true);load.resolve();await pending;
 assert.equal(h.state.stage,'dojo');assert.equal(h.state.shotPaused,true);assert.equal(h.state.pending,false);assert.equal(h.time.count(),0);
 h.time.tick(9000);h.state.frame();
 const offset=lines.slice(0,h.state.dojoStart).reduce((sum,line)=>sum+line.ms,0);
 assert.equal(h.soundFrame.sceneId,'dojo-arrivee');assert.equal(h.soundFrame.timeMs,offset);assert.equal(h.soundFrame.elapsedMs,0);assert.equal(h.soundFrame.playing,false);
 h.setHidden(false);h.frames(1);assert.equal(h.soundFrame.playing,true);assert.equal(h.soundFrame.timeMs,offset+16);
 assert.equal(h.time.count(),1);await h.time.advance();assert.equal(h.state.step,h.state.dojoStart+1);
});

test('garden loading and nested pauses preserve the same suspended sound clock',async()=>{
 const h=harness();await h.enter();h.setHidden(true);h.state.startGarden();
 assert.equal(h.arrivals[0].paused,true);h.state.frame();assert.equal(h.soundFrame.playing,false);
 h.dom.$('report-open').click();h.state.arrivalPlayer.state='playing';h.time.tick(9000);h.state.frame();
 assert.equal(h.soundFrame.timeMs,h.state.introductionDuration);assert.equal(h.soundFrame.playing,false);
 h.setHidden(false);assert.equal(h.state.arrivalPlayer.paused,true);assert.equal(h.arrivalCalls.filter(call=>call==='resume').length,0);
 h.dom.$('report-dialog').close();assert.equal(h.state.arrivalPlayer.paused,false);
 assert.equal(h.arrivalCalls.filter(call=>call==='resume').length,1);
 h.state.arrivalPlayer.elapsed=320;h.state.frame();assert.equal(h.soundFrame.playing,true);assert.equal(h.soundFrame.sceneId,'salon-invitation');assert.equal(h.soundFrame.timeMs,h.state.introductionDuration);
 assert.equal(introSoundEnvelope(h.soundFrame).music,0);
 h.state.arrivalPlayer.elapsed=INTRO_INVITATION_DURATION+320;h.state.frame();assert.equal(h.soundFrame.sceneId,'arrival');assert.equal(h.soundFrame.elapsedMs,320);assert.equal(h.soundFrame.timeMs,h.state.introductionDuration+320);
 assert.equal(h.soundCalls.filter(call=>call.method==='start').length,1);
});

test('skipping a pending dojo load cannot restore the old scene or another continuation timer',async()=>{
 const h=harness({dojoLoaded:false}),load=deferred();await h.enter();
 h.state.prepareDojo=async()=>{await load.promise;h.state.dojo={visible:false}};
 const pending=h.state.showScene(h.state.dojoStart);assert.equal(h.state.pending,true);
 assert.equal(h.dom.$('skip').disabled,false);h.dom.$('skip').click();
 const visits=h.visits.length;load.resolve();await pending;
 assert.equal(h.state.stage,'garden');assert.equal(h.visits.length,visits);assert.equal(h.state.pending,false);
 assert.equal(h.time.count(),0);assert.equal(h.dom.$('scene-wait').hidden,true);
 assert.equal(h.dom.$('welcome').hidden,true);assert.equal(h.dom.$('bubble').hidden,true);
 assert.equal(h.filmStops,1,'Skipping a pending scene stops the shared film before leaving the introduction');
 assert.equal(h.soundCalls.filter(call=>call.method==='stop').length,1,'Skipping stops sound before leaving the introduction');
 h.setHidden(true);h.dom.$('report-open').click();h.setHidden(false);h.dom.$('report-dialog').close();h.frames(3);
 assert.equal(h.soundCalls.filter(call=>call.method==='start').length,1,'A later tab or report resume cannot restart skipped sound');
 assert.equal(h.soundCalls.filter(call=>call.method==='stop').length,1);assert.equal(h.soundFrame.playing,false);
 h.dom.$('skip').click();assert.equal(h.arrivals.length,1);assert.equal(h.soundCalls.filter(call=>call.method==='start').length,1);
});

test('page lifecycle suspends a retained page and disposes sound when the page is left',async()=>{
 const h=harness();await h.enter();h.time.tick(850);h.state.frame();
 h.dom.window.dispatch('pagehide',{persisted:true});h.time.tick(5000);h.state.frame();
 assert.equal(h.soundFrame.timeMs,850);assert.equal(h.soundFrame.playing,false);assert.equal(h.time.count(),0);
 h.dom.window.dispatch('pageshow',{persisted:true});h.frames(1);assert.equal(h.soundFrame.playing,true);assert.equal(h.soundFrame.timeMs,866);
 h.dom.window.dispatch('pagehide',{persisted:false});assert.equal(h.soundCalls.filter(call=>call.method==='dispose').length,1);
});

test('skipping during the initial room download keeps the garden visible after that download completes',async()=>{
 const h=harness(),load=deferred();h.state.ready=false;h.state.room=null;
 h.state.loadWhite=async()=>{await load.promise;h.state.room={}};
 const pending=h.state.initialize();h.dom.$('skip').click();load.resolve();await pending;
 assert.equal(h.state.stage,'garden');assert.equal(h.dom.$('garden').hidden,false);
 assert.equal(h.dom.$('loading').hidden,true);assert.equal(h.dom.$('welcome').hidden,true);
 assert.equal(h.time.count(),0);
});

test('garden entry delegates once to the explicit arrival sequence instead of racing simulated controls',async()=>{
 const h=harness();h.state.startGarden();h.state.startGarden();
 assert.equal(h.arrivals.length,1);assert.equal(h.time.count(),0);assert.equal(h.arrivals[0].skip,false);
 const skipped=harness();skipped.dom.$('skip').click();assert.equal(skipped.arrivals.length,1);assert.equal(skipped.arrivals[0].skip,true);
});

test('the dojo assigns distinct local voices and bubble visibility never controls speech',()=>{
 const worker=readFileSync(new URL('./salon-voice-worker.js',import.meta.url),'utf8');
 assert.match(source,/const gender=id==='f'\?'femme':'homme'/);
 assert.match(source,/stage==='dojo'\|\|!matched/);
 assert.match(source,/cinematicLocalVoices\.speak\(\{/);
 assert.match(worker,/gender==='femme'\?'jessica':'pierre'/);
 assert.match(source,/cinematicLocalVoices\?\.pause\(\)/);
 assert.match(source,/cinematicLocalVoices\?\.resume\(\)/);
 assert.match(source,/if\(canvasHost\.classList\?\.contains\?\.\('bubbles-off'\)\|\|!speaker/);
 assert.match(html,/#stage\.bubbles-off #bubble\{display:none!important\}/);
});
