import test from 'node:test';
import assert from 'node:assert/strict';
import {dojoDemoFrame,dojoDemoReservedRect} from './intro-dojo-ui.js';
import {DOJO_LOOKS,dojoWardrobeState} from './intro-dojo-wardrobe.js';

const cue=(id,ms=10000)=>({id,ms,scene:'dojo'});

test('the interface demonstration appears only for the action being taught and clears between scenes',()=>{
 for(const id of ['dojo-arrivee','dojo-construction','jardin']){
  assert.equal(dojoDemoFrame(cue(id),2500).visible,false);
  assert.equal(dojoDemoReservedRect(390,690,cue(id)),null);
 }
 assert.equal(dojoDemoFrame({id:'dojo-camera',scene:'white',ms:10000},4000).visible,false);
 for(const id of ['dojo-camera','dojo-deplacement','dojo-personnaliser','dojo-apparence','dojo-vetements','dojo-enregistrer']){
  assert.equal(dojoDemoFrame(cue(id),0).visible,false,id+' does not pop in at the cut');
  assert.equal(dojoDemoFrame(cue(id),2000).visible,true,id+' is demonstrated');
  assert.equal(dojoDemoFrame(cue(id),10000).visible,false,id+' clears before the next shot');
 }
});

test('camera and walking controls visibly move on the scene clock, and pause at an identical state',()=>{
 const camera=cue('dojo-camera'),walk=cue('dojo-deplacement',11000);
 const origin=dojoDemoFrame(camera,800),dragging=dojoDemoFrame(camera,3500),released=dojoDemoFrame(camera,9200);
 assert.ok(dragging.dragX-origin.dragX>10,'The actual camera thumb demonstrates a lateral drag');
 assert.equal(released.dragX,0,'The demonstrated gesture releases before the cut');
 const stepping=dojoDemoFrame(walk,3500);assert.ok(stepping.dragY< -9,'The walking thumb demonstrates forward travel');
 for(let i=0;i<120;i++)assert.deepEqual(dojoDemoFrame(camera,3500),dragging,'A report pause cannot advance the control animation');
});

test('body and wardrobe selection match the exact live geometry-switch timeline',()=>{
 for(const id of ['dojo-personnaliser','dojo-apparence','dojo-vetements']){
  const line=cue(id,id==='dojo-vetements'?12000:10000);
  for(let ms=800;ms<line.ms-800;ms+=83){
   const actual=dojoWardrobeState(line,ms),ui=dojoDemoFrame(line,ms);
   assert.equal(ui.lookIndex,actual.lookIndex);
   assert.equal(ui.bodyIndex,actual.bodyIndex);
   assert.equal(ui.actor,actual.actor);
   if(id==='dojo-vetements')assert.equal(ui.label,DOJO_LOOKS[actual.lookIndex].label);
  }
 }
 const body=cue('dojo-apparence');
 assert.equal(dojoDemoFrame(body,2000).label,'Athlétique');
 assert.equal(dojoDemoFrame(body,7000).label,'Équilibré');
});

test('a not-yet-ready real wardrobe cannot be misrepresented by the preview',()=>{
 const line=cue('dojo-vetements',12000);
 assert.equal(dojoDemoFrame(line,4500,{wardrobe:{ready:false,lookIndex:2}}).visible,false);
 const shown=dojoDemoFrame(line,4500,{wardrobe:{ready:true,lookIndex:1,bodyIndex:0,actor:'m'}});
 assert.equal(shown.visible,true);assert.equal(shown.lookIndex,1);assert.equal(shown.label,'Ville');
});

test('the reserved panel stays small and leaves the existing left joystick clear on phones',()=>{
 for(const [width,height]of [[1280,660],[768,820],[390,690],[320,600],[844,285],[640,240]]){
  const rect=dojoDemoReservedRect(width,height,cue('dojo-vetements'));
  assert.ok(rect.l>=0&&rect.t>=0&&rect.r<=width&&rect.b<=height);
  assert.ok(rect.r-rect.l<=270);assert.ok(rect.b-rect.t<=86);
  if(width<560)assert.ok(rect.l>=90,'The small panel does not cover the left joystick');
  if(height<350)assert.equal(rect.b-rect.t,70,'Short landscape view gets the compact panel');
  assert.ok((rect.r-rect.l)*(rect.b-rect.t)<width*height*.15,'The preview occupies a small part of the scene');
 }
});
