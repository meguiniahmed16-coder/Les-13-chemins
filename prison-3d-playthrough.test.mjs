import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as Three from 'three';
import {GLTFLoader as RealGLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {loadActorBytes as realLoadActorBytes} from './prison-3d-loader.js';
import {createPrisonRoom,CELL,FURNITURE_URL} from './prison-3d-room.js';
import {createPrisonCamera} from './prison-3d-camera.js';
import {createPrisonArms} from './prison-3d-arms.js';
import {createPrisonControls} from './prison-3d-controls.js';
import {createPrisonSession} from './prison-3d-session.js';
import {createPrisonFoley} from './prison-3d-foley.js';
import {PRISON_BALANCE} from './prison-3d-balance.js';
import * as spatial from './prison-3d-spatial.js';
import * as rules from './yoyo-core.js';

const html=readFileSync(new URL('./jeu-yoyo.html',import.meta.url),'utf8');
const bootstrap=html.match(/<script id="prison-loading-bootstrap">([\s\S]*?)<\/script>/)[1];
const appSource=readFileSync(new URL('./prison-3d-prototype-app.js',import.meta.url),'utf8')
 .replace(/^import\s[\s\S]*?;\s*/gm,'')
 .replace(/^export\s*\{[^}]*\};?\s*/gm,'')
 .replace(/\bexport\s+(?=(?:const|let|function|class)\b)/g,'');

class Element{
 constructor(id,tag='div'){
  this.id=id;this.tagName=tag.toUpperCase();this.dataset={};this.style={};
  this.attributes=new Map();this.listeners=new Map();this.captured=new Set();
  this.hidden=false;this.disabled=false;this.textContent='';this.clientWidth=100;this.clientHeight=100;
 }
 addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(fn);}
 removeEventListener(type,fn){this.listeners.get(type)?.delete(fn);}
 emit(type,init={}){
  const event={type,target:this,code:'',repeat:false,pointerType:'touch',pointerId:1,
   button:0,clientX:50,clientY:50,preventDefault(){this.defaultPrevented=true;},...init};
  for(const fn of [...this.listeners.get(type)||[]])fn(event);
  if(type==='click')this.onclick?.(event);
  return event;
 }
 click(){if(!this.disabled)this.emit('click');}
 setAttribute(name,value){this.attributes.set(name,String(value));}
 getAttribute(name){return this.attributes.get(name)??null;}
 removeAttribute(name){this.attributes.delete(name);}
 setPointerCapture(id){this.captured.add(id);}
 hasPointerCapture(id){return this.captured.has(id);}
 releasePointerCapture(id){if(this.captured.delete(id))this.emit('lostpointercapture',{pointerId:id});}
 getBoundingClientRect(){return {left:0,top:0,width:this.clientWidth,height:this.clientHeight};}
 closest(selector){return selector==='button,a'&&['BUTTON','A'].includes(this.tagName)?this:null;}
 focus(){globalThis.document.activeElement=this;}
}

async function harness(t){
 const nodes=new Map(),rafs=[],loads=[],errors=[],timers=new Map();
 let now=0,nextTimer=0,app;
 const node=(id,tag)=>{
  if(!nodes.has(id))nodes.set(id,new Element(id,tag));
  return nodes.get(id);
 };
 for(const [,tag,id] of html.matchAll(/<([a-z][\w-]*)\b[^>]*\bid="([^"]+)"/g))node(id,tag);
 for(const [,attributes,label] of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)){
  const id=attributes.match(/\bid="([^"]+)"/)?.[1];
  if(id)node(id,'button').textContent=label.replace(/<[^>]+>/g,'').trim();
 }
 const controls=[...html.matchAll(/<button\b[^>]*\bdata-game-control\b[^>]*>/g)]
  .map(([tag])=>node(tag.match(/\bid="([^"]+)"/)[1]));
 const returnLinks=[...html.matchAll(/<a\b[^>]*\bdata-return-plateau\b[^>]*>/g)]
  .map(([tag],index)=>{
   const link=node(tag.match(/\bid="([^"]+)"/)?.[1]||'return-link-'+index,'a');
   link.setAttribute('href',tag.match(/\bhref="([^"]+)"/)?.[1]||'jeu.html');
   return link;
  });
 const document=new Element('document');
 const origin='https://example.test';
 document.baseURI=origin+'/jeu-yoyo.html?embedded=1';
 document.body={dataset:{}};document.hidden=false;
 document.getElementById=node;
 document.querySelectorAll=selector=>{
  if(selector==='[data-game-control]')return controls;
  assert.equal(selector,'[data-return-plateau]');return returnLinks;
 };
 node('overlay').querySelector=tag=>node('overlay '+tag,tag);
 node('overlay').hidden=true;
 node('world').clientWidth=390;node('world').clientHeight=720;
 node('joystick-knob').clientWidth=44;
 const window=new Element('window');window.devicePixelRatio=2;
 const boardContext=vm.createContext({TreizeEtapesData:[{level:5,plateaux:[{},{}]}]});
 vm.runInContext(readFileSync(new URL('./plateaux-core.js',import.meta.url),'utf8'),boardContext);
 const board={flow:boardContext.TreizePlateaux,
  state:{points:510,unlocked:5,completed:[1,2,3,4],platesVersion:1},
  messages:[],closed:0,travel:[],navigations:[],won:false,replayCount:0};
 board.flow.done(board.state,5,1);board.flow.beginYoyo(board.state,'official-prison-first');
 const parentWindow={postMessage(message,targetOrigin){
  assert.equal(targetOrigin,origin,'The game must address its exact parent origin');
  board.messages.push(structuredClone(message));board.receive(message);
 }};
 window.parent=parentWindow;
 window.location={origin,href:document.baseURI,assign:url=>board.navigations.push(url),reload(){}};
 Object.defineProperty(window,'localStorage',{get(){throw new Error('Only the parent may save board points');}});
 board.init=()=>{
  if(board.state.yoyoPending)window.emit('message',{origin,source:parentWindow,
   data:{type:'yoyo:init',...board.state.yoyoPending,score:board.state.points}});
 };
 board.receive=message=>{
  // Transport is simulated, but all progression, session validation and
  // bonuses are computed by the unchanged real board core.
  if(message.type==='yoyo:ready')board.init();
  if(message.type==='yoyo:won'&&message.points===30){
   const result=board.flow.finishYoyo(board.state,message.id);
   if(result){
    board.won=true;
    window.emit('message',{origin,source:parentWindow,data:{type:'yoyo:finished',id:message.id,...result}});
   }
  }
  if(message.type==='yoyo:replay'&&board.state.yoyoFinished&&!board.state.yoyoPending){
   board.flow.beginYoyo(board.state,'official-prison-replay-'+(++board.replayCount));
   board.won=false;board.init();
  }
  if(message.type==='yoyo:close'){
   board.closed++;
   if(board.won&&board.state.completed.includes(5))board.travel.push(5);
  }
 };
 const oldWindow=globalThis.window,oldDocument=globalThis.document;
 globalThis.window=window;globalThis.document=document;
 t.after(()=>{
  app?.session.dispose();app?.controls.dispose();app?.arms?.dispose();
  if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;
  if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;
 });
 new Function('window','document','setTimeout','clearTimeout','location',bootstrap)(
  window,document,fn=>{timers.set(++nextTimer,fn);return nextTimer;},id=>timers.delete(id),window.location
 );
 assert.equal(node('world').dataset.loadState,'loading');
 assert.equal(node('start').disabled,true);
 class Renderer{
  shadowMap={};capabilities={getMaxAnisotropy:()=>4};
  setPixelRatio(value){this.ratio=value;}
  setSize(width,height){this.width=width;this.height=height;}
  render(scene,camera){scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);}
 }
 class GLTFLoader{
  parseAsync(bytes,base){
   // Textured furniture needs ImageBitmap/WebGL. Its bytes still pass through
   // the real loader; the actual actor, skin, bones and arms are parsed below.
   if(base.endsWith('/assets/prison/'))return Promise.resolve({scene:new Three.Group()});
   return new RealGLTFLoader().parseAsync(bytes,base);
  }
 }
 const bindings={
  T:{...Three,WebGLRenderer:Renderer},GLTFLoader,CELL,FURNITURE_URL,PRISON_BALANCE,
  createPrisonRoom:options=>createPrisonRoom({...options,textures:false}),
  createPrisonCamera,createPrisonArms,createPrisonControls,createPrisonSession,createPrisonFoley,...spatial,...rules,
  loadActorBytes:async(url,options)=>{
   const path=new URL(url).pathname.slice(1);
   assert.ok(['danse-quaternius-hero.glb',FURNITURE_URL].includes(path),'Only packaged local assets may load');
   loads.push(path);
   const bytes=readFileSync(new URL('./'+path,import.meta.url));
   return realLoadActorBytes(url,{...options,fetchImpl:async()=>new Response(bytes,
    {headers:{'Content-Length':String(bytes.byteLength)}})});
  },
  window,document,location:window.location,performance:{now:()=>now},
  requestAnimationFrame:fn=>{rafs.push(fn);return rafs.length;},
  console:{error:(...args)=>errors.push(args.map(String).join(' '))}
 };
 app=new Function(...Object.keys(bindings),appSource+
  '\nreturn {game,room,camera,eyes,controls,session,get arms(){return arms;},get mode(){return mode;},'+
  'get assetsReady(){return assetsReady;},get firstFrame(){return firstFrame;},get paused(){return paused;}};')
  (...Object.values(bindings));
 board.init();
 assert.equal(app.session.session.id,'official-prison-first','An early init is retained during model loading');
 assert.equal(app.session.ready,false);assert.equal(app.mode,'ready');
 assert.deepEqual(board.messages,[],'The parent is not told the game is ready before its first frame');
 const diagnostic=()=>JSON.stringify({mode:app.mode,phase:app.game.phase,part:app.game.part,
  points:app.game.points,guard:app.game.guard,hooked:app.game.hooked,pull:app.game.pull,
  player:app.eyes.player.toArray(),gripDistance:app.arms?.grip.distanceTo(app.room.brushGripTarget),
  feedback:node('feedback').textContent,loading:node('loading-detail').textContent,errors});
 function tick(){
  assert.ok(rafs.length,'The real app must continue requesting frames: '+diagnostic());
  now+=1000/60;rafs.shift()(now);
  assert.equal(errors.length,0,diagnostic());
  assert.notEqual(node('world').dataset.loadState,'error',diagnostic());
 }
 function advance(seconds){for(let frame=0;frame<Math.ceil(seconds*60);frame++)tick();}
 function until(predicate,seconds,message){
  for(let frame=0;!predicate()&&frame<Math.ceil(seconds*60);frame++)tick();
  assert.ok(predicate(),message+': '+diagnostic());
 }
 // Let the actual asynchronous transfer, GLTF parser and loadScene settle.
 for(let attempt=0;!app.assetsReady&&attempt<50;attempt++)await new Promise(setImmediate);
 assert.equal(app.assetsReady,true,'The real GLB actor must finish loading: '+diagnostic());
 assert.equal(app.firstFrame,false,'Readiness waits for a rendered frame');
 tick();
 assert.equal(node('world').dataset.loadState,'ready');
 assert.equal(node('loading').hidden,true);
 assert.equal(node('start').textContent,'Commencer la visite');
 assert.deepEqual(loads,['danse-quaternius-hero.glb',FURNITURE_URL]);
 assert.equal(timers.size,0,'Successful loading cancels its watchdog');
 assert.equal(node('world').dataset.rig,'quaternius-cc0-first-person-arms');
 assert.equal(app.session.embedded,true);assert.equal(app.session.ready,true);
 assert.equal(String(document.body.dataset.embedded),'true');
 assert.equal(board.messages.filter(message=>message.type==='yoyo:ready').length,1);
 assert.equal(app.mode,'ready','The ready handshake must not restart the initial game');
 return {app,node,window,board,returnLinks,tick,advance,until,diagnostic};
}

function press(ui,id){
 assert.equal(ui.node(id).disabled,false,id+' must be usable');
 ui.node(id).emit('pointerdown',{pointerId:id==='action'?21:22});
}
function release(ui,id){ui.node(id).emit('pointerup',{pointerId:id==='action'?21:22});}

function hideUntilSafe(ui){
 release(ui,'action');press(ui,'hide');ui.tick();
 assert.equal(ui.app.game.hidden,true,'The real hide control protects the prisoner');
 ui.until(()=>ui.app.game.guard==='away',9,'The guard finishes his visit while the player is hidden');
 assert.equal(ui.app.mode,'playing','Hiding must avoid a caught transition');
 release(ui,'hide');ui.tick();
}

function recoverBag(ui,part){
 // A novice presses immediately from the centre aisle. No joystick movement,
 // forecast, release/retry loop, or direct game-state mutation assists them.
 const {game,eyes,controls}=ui.app;
 const misses=game.misses,started=game.time,playerX=eyes.player.x;
 let hiddenTime=0;
 assert.equal(controls.state.x,0);assert.equal(controls.state.y,0);
 press(ui,'action');
 ui.until(()=>game.hooked,1,'Simply holding Saisir must hook the accessible rope');
 assert.equal(game.misses,misses,'Automatic aiming must not require timing retries');
 if(part===1){
  ui.advance(.2);
  const hiddenAt=game.time;
  press(ui,'hide');ui.tick();
  assert.equal(controls.state.holding,true,'Saisir remains physically held while hiding');
  assert.equal(game.hidden,true);
  const hiddenPull=game.pull;ui.advance(.3);
  assert.equal(game.pull,hiddenPull,'Hiding suspends the pull without releasing Saisir');
  release(ui,'hide');
  hiddenTime=game.time-hiddenAt;
  ui.until(()=>game.pull>hiddenPull,.8,
   'Releasing Se cacher resumes the still-held action after its reach delay');
 }
 ui.until(()=>game.part===part+1,Math.max(0,3.5-(game.time-started-hiddenTime)),
  'A continuous novice hold must recover the bag within 3.5 seconds outside hiding');
 assert.ok(game.time-started-hiddenTime<=3.5+1/60,'The assisted pull stays short');
 assert.equal(game.misses,0,'The actual run completes without a timing miss');
 assert.equal(eyes.player.x,playerX,'The player did not need to line up with a slit');
 assert.equal(controls.state.x,0);assert.equal(controls.state.y,0);
 release(ui,'action');
}

test('The official immersive game lets a novice win, credits the board once and continues the journey',async t=>{
 const ui=await harness(t),{app,node}=ui;
 assert.equal(node('action').disabled,true,'Actions are disabled before the visit');
 node('start').click();
 assert.equal(app.mode,'tour');assert.equal(node('skip-tour').hidden,false);
 assert.equal(node('action').disabled,true);
 ui.until(()=>app.mode==='playing',10,'The complete nine-second visit enters first person');
 assert.equal(app.arms.root.visible,true,'The actual skinned arms become visible');
 assert.equal(node('skip-tour').hidden,true);
 ui.window.emit('keydown',{code:'KeyP',target:node('world')});
 ui.window.emit('keyup',{code:'KeyP',target:node('world')});
 assert.equal(app.paused,true,'One KeyP press pauses once despite both keyboard listeners');
 const pausedTime=app.game.time;
 ui.advance(.5);assert.equal(app.game.time,pausedTime,'Pause stops the real game clock');
 ui.window.emit('keydown',{code:'KeyP',target:node('world')});
 ui.window.emit('keyup',{code:'KeyP',target:node('world')});
 assert.equal(app.paused,false,'KeyP also resumes while gameplay controls are disabled');
 ui.advance(27.8);
 assert.equal(app.game.guard,'away','The first 27 seconds remain calm');
 ui.until(()=>app.game.guard==='approaching',1,'The first guard approaches at 28 seconds');
 assert.ok(app.game.time>=28&&app.game.time<28.05);
 assert.equal(node('guard').textContent,'Des pas dans le couloir');
 const approachingAt=app.game.time;
 ui.advance(3.75);
 assert.equal(app.game.guard,'approaching','The audible warning lasts four seconds');
 ui.until(()=>app.game.guard==='watching',.5,'The guard begins watching after the warning');
 assert.ok(app.game.time-approachingAt>=4&&app.game.time-approachingAt<4.05);
 const watchingAt=app.game.time;
 ui.advance(1.1);
 assert.equal(app.mode,'playing','One second of exposure must not cause an abrupt failure');
 hideUntilSafe(ui);
 assert.ok(app.game.time-watchingAt>=4&&app.game.time-watchingAt<4.1,
  'Watching and leaving take 2.5 and 1.5 seconds before calm returns');
 assert.equal(app.game.points,0);
 const calmAt=app.game.time;
 ui.advance(31.5);
 assert.equal(app.game.guard,'away','The next patrol leaves at least 31 seconds of calm');
 ui.until(()=>app.game.guard==='approaching',1,'The following patrol begins after 32 calm seconds');
 assert.ok(app.game.time-calmAt>31.9&&app.game.time-calmAt<32.05);
 hideUntilSafe(ui);

 // Exercise the same public restart and skip buttons before the full run.
 node('retry').click();assert.equal(app.mode,'tour');
 node('skip-tour').click();assert.equal(app.mode,'playing');
 assert.equal(app.game.time,0);assert.equal(app.game.points,0);
 press(ui,'action');
 let closingSeen=false;
 for(let i=0;i<120&&app.mode==='playing';i++){
  ui.tick();
  if(app.arms.closure>.1&&app.arms.closure<.97){
   closingSeen=true;assert.ok(app.room.floorBrush.visible,'The broom stays grounded while the fingers close');
   assert.equal(app.game.part,0,'Closing fingers alone must not award the pickup');
  }
 }
 assert.ok(closingSeen,'The approach includes a visible finger-closing phase');
 assert.ok(app.arms.graspReady,'The thumb and fingers lock before lifting');
 ui.until(()=>app.mode==='between',2,'Holding Saisir must actually reach and pick up the brush');
 assert.equal(app.game.part,1);assert.equal(app.game.points,10);
 assert.equal(ui.board.state.points,510,'The brush alone does not credit the board');
 assert.equal(ui.board.state.unlocked,5);
 assert.equal(app.room.floorBrush.visible,false);assert.equal(app.room.heldBrush.visible,true);
 ui.until(()=>!node('overlay').hidden,2,'The pickup animation must lead to its Continue card');
 node('overlay').querySelector('button').click();
 ui.tick();assert.equal(app.eyes.isTravelling,true,'Continue starts the real approach to the window');
 assert.equal(node('action').disabled,true,'Actions wait for the approach to finish');
 ui.until(()=>!app.eyes.isTravelling,5,'The player reaches the window without getting stuck');
 assert.ok(app.eyes.player.z<-.6);assert.equal(node('action').disabled,false);
 recoverBag(ui,1);
 assert.equal(app.mode,'between');assert.equal(app.game.points,20);
 assert.equal(ui.board.state.points,510,'The board waits for all three trials');
 ui.until(()=>!node('overlay').hidden,1,'The tobacco leads to its Continue card');
 node('overlay').querySelector('button').click();ui.tick();
 recoverBag(ui,2);
 assert.equal(app.mode,'won');assert.equal(app.game.phase,'victory');
 assert.equal(app.game.points,30);assert.equal(node('score').textContent,'30 / 30');
 assert.equal(node('overlay').hidden,false);
 assert.equal(node('overlay').querySelector('button').textContent,'Continuer le voyage');
 assert.equal(node('overlay-replay').textContent,'Rejouer');
 assert.equal(node('overlay-replay').hidden,false);
 assert.equal(node('action').disabled,true,'The final card ends gameplay cleanly');
 assert.equal(app.session.finished,true);assert.equal(app.session.result.bonus,30);
 assert.equal(ui.board.state.points,540,'The real board credits exactly 30 points');
 assert.equal(ui.board.state.unlocked,6);assert.ok(ui.board.state.completed.includes(5));
 const wonMessages=ui.board.messages.filter(message=>message.type==='yoyo:won');
 assert.deepEqual(wonMessages,[{type:'yoyo:won',id:'official-prison-first',points:30}]);
 assert.equal(app.session.win(),false);ui.advance(.2);
 assert.equal(ui.board.messages.filter(message=>message.type==='yoyo:won').length,1);
 ui.board.receive(wonMessages[0]);
 assert.equal(ui.board.state.points,540,'A repeated transport delivery cannot credit a second bonus');
 assert.equal(ui.board.closed,0);
 node('overlay').querySelector('button').click();
 node('overlay').querySelector('button').click();
 assert.equal(ui.board.closed,1,'Continue closes the parent game exactly once');
 assert.deepEqual(ui.board.travel,[5],'The parent may continue from the completed prison chapter');
 assert.deepEqual(ui.board.navigations,[],'The game never opens the board inside its own iframe');
});
