import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrisonControls} from './prison-3d-controls.js';

// Model the browser's pointer identities/capture and event delivery without
// substituting any control logic: all state comes from the shipped module.
class Element {
 constructor(width=100){
  this.events=new Map();this.dataset={};this.style={};this.clientWidth=width;
  this.attributes={};this.disabled=false;this.captured=new Set();
 }
 addEventListener(name,callback){
  if(!this.events.has(name))this.events.set(name,new Set());
  this.events.get(name).add(callback);
 }
 removeEventListener(name,callback){this.events.get(name)?.delete(callback);}
 emit(name,values={}){
  const event={target:this,pointerId:1,pointerType:'touch',button:0,clientX:50,clientY:50,
   defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...values};
  for(const callback of this.events.get(name)||[])callback(event);
  return event;
 }
 getAttribute(name){return this.attributes[name]??null;}
 setPointerCapture(id){this.captured.add(id);}
 hasPointerCapture(id){return this.captured.has(id);}
 releasePointerCapture(id){
  if(this.captured.delete(id))this.emit('lostpointercapture',{pointerId:id});
 }
 getBoundingClientRect(){return{left:0,top:0,width:100,height:100};}
 listenerCount(){return [...this.events.values()].reduce((total,events)=>total+events.size,0);}
}

function harness(t){
 const previousWindow=globalThis.window,previousDocument=globalThis.document;
 const window=new Element(),document=new Element();
 globalThis.window=window;globalThis.document=document;
 const surface=new Element(),joystick=new Element(),knob=new Element(40);
 const actionButton=new Element(),hideButton=new Element();
 const calls={down:0,up:0,pause:0};
 const controls=createPrisonControls({surface,joystick,knob,actionButton,hideButton,
  onActionDown(){calls.down++;},onActionUp(){calls.up++;},onPause(){calls.pause++;}});
 t.after(()=>{
  controls.dispose();
  if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;
  if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;
 });
 return{controls,calls,surface,joystick,knob,actionButton,hideButton,window,document};
}

test('Disabled controls cannot capture touches or trigger movement and actions',t=>{
 const h=harness(t);
 h.joystick.attributes['aria-disabled']='true';h.actionButton.disabled=true;h.hideButton.disabled=true;
 h.joystick.emit('pointerdown',{pointerId:1,clientX:95});
 h.surface.emit('pointerdown',{pointerId:2});h.surface.emit('pointermove',{pointerId:2,clientX:80});
 h.actionButton.emit('pointerdown',{pointerId:3});h.hideButton.emit('pointerdown',{pointerId:4});
 h.window.emit('keydown',{code:'KeyW'});h.window.emit('keydown',{code:'Space'});
 assert.deepEqual(h.controls.state,{x:0,y:0,hide:false,holding:false});
 assert.deepEqual(h.controls.consumeLook(),{x:0,y:0});
 assert.equal(h.calls.down,0);
 for(const element of [h.joystick,h.surface,h.actionButton,h.hideButton])assert.equal(element.captured.size,0);
});

test('Independent fingers can walk, look and hold an object without stealing one another',t=>{
 const h=harness(t);
 h.joystick.emit('pointerdown',{pointerId:11,clientX:90,clientY:50});
 assert.equal(h.controls.state.x,1);assert.equal(h.controls.state.y,0);
 h.surface.emit('pointerdown',{pointerId:12,clientX:40,clientY:50});
 h.actionButton.emit('pointerdown',{pointerId:13});
 h.surface.emit('pointermove',{pointerId:12,clientX:54,clientY:44});
 h.surface.emit('pointermove',{pointerId:99,clientX:500,clientY:500});
 assert.deepEqual(h.controls.consumeLook(),{x:14,y:-6});
 assert.deepEqual(h.controls.consumeLook(),{x:0,y:0},'Look deltas are consumed once per frame');
 assert.equal(h.controls.state.holding,true);assert.equal(h.calls.down,1);
 h.actionButton.emit('pointerdown',{pointerId:14});
 assert.equal(h.calls.down,1,'An extra touch cannot double-trigger a held action');
 h.actionButton.emit('pointerup',{pointerId:99});
 assert.equal(h.controls.state.holding,true,'An unrelated finger cannot release the held object');
 h.actionButton.emit('pointerup',{pointerId:13});
 assert.equal(h.controls.state.holding,false);assert.equal(h.calls.up,1);
 assert.equal(h.controls.state.x,1,'Releasing the object must not stop the walking finger');
 h.joystick.emit('pointermove',{pointerId:11,clientX:51,clientY:50});
 assert.equal(h.controls.state.x,0,'A small finger offset remains in the joystick dead zone');
});

test('Cancellation, lost capture and page deactivation stop every held input',t=>{
 const h=harness(t);
 h.joystick.emit('pointerdown',{pointerId:1,clientX:90,clientY:90});
 assert.ok(Math.abs(Math.hypot(h.controls.state.x,h.controls.state.y)-1)<1e-12);
 h.actionButton.emit('pointerdown',{pointerId:2});h.hideButton.emit('pointerdown',{pointerId:3});
 h.actionButton.emit('pointercancel',{pointerId:2});
 assert.equal(h.controls.state.holding,false);assert.equal(h.calls.up,1);
 h.joystick.releasePointerCapture(1);assert.equal(h.controls.state.x,0);assert.equal(h.controls.state.y,0);
 h.hideButton.emit('pointercancel',{pointerId:3});assert.equal(h.controls.state.hide,false);
 h.window.emit('keydown',{code:'KeyW'});h.window.emit('keydown',{code:'Space'});
 h.surface.emit('pointerdown',{pointerId:4});h.surface.emit('pointermove',{pointerId:4,clientX:60});
 h.window.emit('blur');
 assert.deepEqual(h.controls.state,{x:0,y:0,hide:false,holding:false});
 assert.deepEqual(h.controls.consumeLook(),{x:0,y:0});assert.equal(h.calls.up,2);
 h.hideButton.emit('pointerdown',{pointerId:5});h.window.emit('keydown',{code:'ArrowRight'});
 h.document.hidden=true;h.document.emit('visibilitychange');
 assert.deepEqual(h.controls.state,{x:0,y:0,hide:false,holding:false});
});

test('Keyboard movement, holding, hiding and pause retain normal focused-button behavior',t=>{
 const h=harness(t);
 h.window.emit('keydown',{code:'KeyW'});h.window.emit('keydown',{code:'KeyD'});
 assert.ok(h.controls.state.x>0&&h.controls.state.y<0);
 assert.ok(Math.abs(Math.hypot(h.controls.state.x,h.controls.state.y)-1)<1e-12);
 h.window.emit('keyup',{code:'KeyW'});h.window.emit('keyup',{code:'KeyD'});
 h.window.emit('keydown',{code:'Space'});h.window.emit('keydown',{code:'Space',repeat:true});
 assert.equal(h.calls.down,1);h.window.emit('keyup',{code:'Space'});assert.equal(h.calls.up,1);
 h.window.emit('keydown',{code:'KeyC'});assert.equal(h.controls.state.hide,true);
 h.window.emit('keyup',{code:'KeyC'});assert.equal(h.controls.state.hide,false);
 h.window.emit('keydown',{code:'KeyP'});h.window.emit('keydown',{code:'KeyP',repeat:true});assert.equal(h.calls.pause,1);
 const startButton={closest:selector=>selector==='button,a'?startButton:null};
 const activation=h.window.emit('keydown',{code:'Space',target:startButton});
 assert.equal(activation.defaultPrevented,false);assert.equal(h.calls.down,1);
 h.window.emit('keydown',{code:'Space',target:h.hideButton});
 assert.equal(h.controls.state.hide,true);assert.equal(h.controls.state.holding,false);
 h.window.emit('keyup',{code:'Space'});assert.equal(h.controls.state.hide,false);
 h.actionButton.emit('keydown',{code:'Enter'});assert.equal(h.controls.state.holding,true);
 h.window.emit('keyup',{code:'Enter'});assert.equal(h.controls.state.holding,false);
});

test('Disposal releases an action and removes the installed listeners',t=>{
 const h=harness(t);
 h.actionButton.emit('pointerdown',{pointerId:1});
 h.controls.dispose();assert.equal(h.calls.up,1);
 for(const target of [h.window,h.document,h.surface,h.joystick,h.actionButton,h.hideButton])
  assert.equal(target.listenerCount(),0);
 h.actionButton.emit('pointerdown',{pointerId:2});h.window.emit('keydown',{code:'Space'});
 assert.equal(h.calls.down,1);assert.deepEqual(h.controls.state,{x:0,y:0,hide:false,holding:false});
});
