import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import * as T from 'three';

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
 fragment('function scheduleNext(','// The original television'),
 fragment('async function showScene(',"$('report-add').onclick="),
 fragment('function frame(','async function authorize('),
 fragment('async function initialize(',"$('retry-load').onclick="),
].join('\n');

// Keep the real cue, animation-frame, loading and timer control flow. Only
// external rendering/assets and the browser DOM/clock are replaced here.
function domFixture(){
 const nodes=new Map();
 function element(name='div'){
  const listeners=new Map(),classes=new Set(),writes=[];
  let hidden=false,textContent='';
  const node={name,writes,children:[],disabled:false,value:'',open:false,
   get hidden(){return hidden},set hidden(value){hidden=value;writes.push(['hidden',value])},
   get textContent(){return textContent},set textContent(value){textContent=value;writes.push(['text',value])},
   style:new Proxy({setProperty(k,v){writes.push(['style',k,v])}}, {set(o,k,v){writes.push(['style',k,v]);o[k]=v;return true}}),
   classList:{add(...v){v.forEach(x=>classes.add(x))},remove(...v){v.forEach(x=>classes.delete(x))},contains(v){return classes.has(v)}},
   replaceChildren(...children){this.children=children;writes.push(['children',children.length])},
   append(...children){this.children.push(...children);writes.push(['append',children.length])},
   animate(){writes.push(['animation']);return {cancel(){}}},getAnimations(){return[]},
   addEventListener(type,fn,options={}){const entries=listeners.get(type)||[];entries.push({fn,once:options.once});listeners.set(type,entries)},
   dispatch(type,event={}){for(const entry of [...listeners.get(type)||[]]){entry.fn(event);if(entry.once)listeners.set(type,listeners.get(type).filter(e=>e!==entry))}},
   showModal(){this.open=true},close(){this.open=false;this.dispatch('close')},click(){this.onclick?.()},
  };
  return node;
 }
 for(const match of html.matchAll(/<([\w-]+)\b([^>]*\bid="([^"]+)"[^>]*)>/g)){
  const node=element(match[1]);node.hidden=/\bhidden(?:\s|$|=)/.test(match[2]);node.disabled=/\bdisabled(?:\s|$|=)/.test(match[2]);node.writes.length=0;nodes.set(match[3],node);
 }
 const $=id=>{assert.ok(nodes.has(id),`Production refers to absent DOM element #${id}`);return nodes.get(id)};
 return {$,nodes,element,document:{getElementById:$,createElement:element}};
}
async function flush(){await Promise.resolve();await Promise.resolve();await Promise.resolve()}
function clockFixture(){
 let now=0,serial=0;const timers=new Map();
 return {performance:{now:()=>now},setTimeout(fn,ms){const id=++serial;timers.set(id,{fn,at:now+ms});return id},clearTimeout(id){timers.delete(id)},
  count:()=>timers.size,now:()=>now,tick:ms=>now+=ms,
  async advance(){const next=[...timers.entries()].sort((a,b)=>a[1].at-b[1].at)[0];assert.ok(next,'Expected a continuation timer');timers.delete(next[0]);now=next[1].at;await next[1].fn();await flush()},
 };
}
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}}
function harness({dojoLoaded=true}={}){
 const dom=domFixture(),time=clockFixture(),visits=[];let renders=0,filmStops=0;
 const actors=['m','f'].map((id,i)=>({id,root:{name:i?'Marianne':'Ahmed',position:new T.Vector3(i?1:-1,0,0),rotation:{y:0}},sit:false,pose(){},speak(){}}));
 const state={T,...dom,...time,lines,dojoStart:lines.findIndex(s=>s.scene==='dojo'),
  room:{},dojo:dojoLoaded?{visible:false}:null,people:actors,chairs:[],whiteFloor:{visible:true},
  stage:'white',step:-1,autoplay:false,autoTimer:0,alias:'Camille',authorized:true,ready:true,started:false,gardenLoaded:false,
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
 return {state,dom,time,visits,get renders(){return renders},get filmStops(){return filmStops},
  async enter(){dom.$('enter').click();await flush()},
  frames(count){for(let i=0;i<count;i++){time.tick(16);state.frame()}},
 };
}

test('dialogue uses one in-scene speech bubble and exactly the two requested footer buttons',()=>{
 const footer=html.match(/<footer>([\s\S]*?)<\/footer>/)?.[1];assert.ok(footer);
 const stage=html.match(/<main id="stage">([\s\S]*?)<\/main>/)?.[1];assert.ok(stage);
 assert.equal([...html.matchAll(/id="bubble"/g)].length,1);
 assert.match(stage,/<div id="bubble" hidden aria-live="polite" aria-atomic="true"><\/div>/);
 assert.doesNotMatch(footer,/bubble|dialogue-rail/);
 const controls=[...footer.matchAll(/<button\b[^>]*id="([^"]+)"[^>]*>([^<]+)<\/button>/g)].map(m=>[m[1],m[2]]);
 assert.deepEqual(controls,[['report-open','Signaler une erreur'],['skip','Passer l’introduction']]);
 assert.match(html,/#bubble\{position:absolute/);
 assert.match(html,/#bubble:after\{content:''/);
});

test('camera and lip animation keep the entire reply intact until the next speaker',async()=>{
 const h=harness();await h.enter();
 h.state.step=lines.findIndex(line=>line.speaker&&!line.secondary&&!line.invitation);
 h.state.shotStart=h.time.now();h.state.setCue('m','Bienvenue, {pseudo}. Voici le texte complet.');
 const bubble=h.dom.$('bubble');
 assert.equal(bubble.hidden,false);
 assert.deepEqual(bubble.children.map(n=>n.textContent),['Ahmed','Bienvenue, Camille. Voici le texte complet.']);
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
 assert.equal(h.dom.$('garden-frame').src,'/membres/v27/salon.html?resident=marianne&arrival=cinema&v=accueil51');
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

test('a scene that finishes loading under the report dialog stays paused until close',async()=>{
 const h=harness({dojoLoaded:false}),load=deferred();await h.enter();
 h.state.prepareDojo=async()=>{await load.promise;h.state.dojo={visible:false}};
 const pending=h.state.showScene(h.state.dojoStart);assert.equal(h.state.pending,true);
 h.dom.$('report-open').click();load.resolve();await pending;
 assert.equal(h.state.stage,'dojo');assert.equal(h.state.shotPaused,true);assert.equal(h.time.count(),0);
 h.dom.$('report-dialog').close();assert.equal(h.state.shotPaused,false);assert.equal(h.time.count(),1);
 await h.time.advance();assert.equal(h.state.step,h.state.dojoStart+1);
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
});

test('skipping during the initial room download keeps the garden visible after that download completes',async()=>{
 const h=harness(),load=deferred();h.state.ready=false;h.state.room=null;
 h.state.loadWhite=async()=>{await load.promise;h.state.room={}};
 const pending=h.state.initialize();h.dom.$('skip').click();load.resolve();await pending;
 assert.equal(h.state.stage,'garden');assert.equal(h.dom.$('garden').hidden,false);
 assert.equal(h.dom.$('loading').hidden,true);assert.equal(h.dom.$('welcome').hidden,true);
 assert.equal(h.time.count(),0);
});

test('garden load and salon-ready events open the destination once',async()=>{
 const h=harness();let pin=0,home=0;const frame=h.dom.$('garden-frame'),body=h.dom.element();body.classList.add('ready');
 frame.contentDocument={body,getElementById:id=>({click(){if(id==='pin')pin++;if(id==='lookHome')home++}})};
 frame.contentWindow=h.dom.element();h.state.startGarden();frame.dispatch('load');
 frame.contentWindow.dispatch('salon-ready');h.state.startGarden();
 assert.equal(pin,1);assert.equal(h.time.count(),1);await h.time.advance();assert.equal(home,1);
});
