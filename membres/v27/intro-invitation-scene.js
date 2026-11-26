import * as T from 'three';
import {INTRO_INVITATION_DURATION,introInvitationCue,introInvitationLayout} from '../intro-invitation.js';
import {INTRO_INVITATION_EXAMPLES} from '../intro-invitation-data.js';
import {loadStudio} from '../studio-model.js?v=incarnations33';
import {DOJO_CAST,dojoCastLook,styleDojoCastFigure} from '../intro-dojo-cast.js';
import {createIntroCastActor} from '../intro-wardrobe.js';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=n=>{n=clamp(n,0,1);return n*n*(3-2*n);};
const pulse=(t,a,b)=>smooth((t-a)/600)*(1-smooth((t-b)/700));
// The entry-side strip is free of the sofa, coffee table, armchair and dining
// chairs. Guests appear as complete opaque figures with their soles on the floor.
export const INTRO_INVITATION_POSITIONS=Object.freeze({
 m:Object.freeze({x:-1.20,z:-1.91,yaw:.18}),
 f:Object.freeze({x:-.25,z:-1.83,yaw:-.12}),
 guest:Object.freeze({x:.80,z:-1.82,yaw:-.43})
});

// Reuse the two already fitted, fully clothed native editor examples. This
// preserves their own faces instead of attaching Marianne's reference head.
export async function prepareIntroInvitationGuests(scene,{
 load=loadStudio,create=createIntroCastActor,examples=INTRO_INVITATION_EXAMPLES
}={}){
 const guests=[];
 try{
  for(const example of examples){
   const item=DOJO_CAST[example.castIndex],look=dojoCastLook(example.castIndex);
   const figure=await load(look,item.gender);styleDojoCastFigure(figure,example.castIndex);
   const root=new T.Group();root.name='Invitation · '+example.name;root.visible=false;
   root.scale.setScalar(item.gender==='femme'?1.04:1.075);scene.add(root);
   let actor;
   try{actor=await create(root,figure,{look,gender:item.gender});}catch(error){root.removeFromParent();throw error;}
   actor.invitationExample=example;
   guests.push(actor);
  }
  return guests;
 }catch(error){for(const guest of guests)guest.dispose();throw error;}
}

export function applyIntroInvitationGuest(actor,pose,time){
 // The common cue is reveal progress, not skin or fabric opacity. Blending
 // every layer exposes eyes/teeth through the face and defeats clothing masks.
 // Only the separate floor halo fades; the complete, depth-tested actor is
 // switched on after its pose is ready, and switched off as one unit on exit.
 const progress=clamp(Number(pose.opacity)||0,0,1);
 actor.root.visible=false;
 actor.root.position.set(pose.x,0,pose.z);actor.root.rotation.set(0,pose.yaw,0);
 if(actor.invitationReveal){
  const halo=actor.invitationReveal;
  halo.position.set(pose.x,.016,pose.z);halo.scale.setScalar(.84+.20*progress);
  halo.material.opacity=.22*Math.sin(Math.PI*progress);
  halo.visible=halo.material.opacity>.002;
 }
 if(progress<.5)return;
 actor.pose(0,{time,energy:.14,emphasis:0,headYaw:pose.expression.look,poseGesture:pose.expression.gesture});
 actor.root.updateMatrixWorld(true);
 actor.root.visible=true;
}

function frameCamera(time,cue,viewport,layout){
 const {width,height}=viewport,rect=layout.sceneRect,aspect=width/height;
 const american=!layout.portrait&&(cue.phase==='first'&&time>5.5&&time<7.8||cue.phase==='second'&&time>13.3&&time<17.1);
 const closer=american?pulse(time*1000,cue.guestIndex?13300:5500,cue.guestIndex?16400:7100):0;
 const target=[-.20,.99+.20*closer,-1.85];
 const eye=[-.22+.22*Math.sin(time*.15),2.39-.10*closer,1.94-.35*closer];
 const camera=new T.PerspectiveCamera(48,aspect,.07,180);
 camera.position.fromArray(eye);camera.lookAt(new T.Vector3().fromArray(target));camera.updateMatrixWorld(true);
 const boxHeight=2.04,minY=.43*closer;
 const fitX=Math.max(.08,(rect.right-rect.left)/width*.93),fitY=Math.max(.08,(rect.bottom-rect.top)/height*.93);
 let tangent=Math.tan((46-7*closer)*Math.PI/360);
 for(const actor of Object.values(INTRO_INVITATION_POSITIONS))for(const x of [-.32,.32])for(const y of [minY,boxHeight])for(const z of [-.20,.20]){
  const point=new T.Vector3(actor.x+x,y,actor.z+z).applyMatrix4(camera.matrixWorldInverse),depth=-point.z;
  tangent=Math.max(tangent,Math.abs(point.x)/(depth*aspect*fitX),Math.abs(point.y)/(depth*fitY));
 }
 const opening=1+.12*(1-smooth(time/1.2)),farewell=1+.08*smooth((time-17.5)/2.5);
 return {
  position:eye,target,fov:2*Math.atan(tangent*opening*farewell)*180/Math.PI,
  // Off-axis framing reserves the actual overlay rectangle instead of hiding
  // a person behind it. The camera remains within the furnished room.
  offsetX:width/2-(rect.left+rect.right)/2,offsetY:height/2-(rect.top+rect.bottom)/2,
  minY,shot:american?'american':cue.phase==='establish'||cue.phase==='farewell'?'wide':'group'
 };
}

export function introInvitationFrame(elapsedMs=0,{width=1280,height=720}={}){
 const cue=introInvitationCue(elapsedMs),time=cue.elapsedMs/1000;
 const viewport={width:Math.max(1,Number(width)||1),height:Math.max(1,Number(height)||1)};
 const layout=introInvitationLayout(viewport),welcome=pulse(cue.elapsedMs,cue.guestIndex?12400:4800,cue.guestIndex?14900:6800);
 const attention=smooth((cue.elapsedMs-(cue.guestIndex?11200:3600))/1000)*cue.guestOpacity;
 // Independent conversational beats: the active speaker uses one hand,
 // the other person acknowledges later with the head, never matching arms.
 const who=cue.dialogueIndex===1?'f':'m',ms=cue.elapsedMs;
 const maleStroke=who==='m'&&cue.dialogueVisible?(cue.dialogueIndex===0?.36*pulse(ms,850,2300)+.27*pulse(ms,3900,5300):.34*pulse(ms,14900,16500)):0;
 const femaleStroke=who==='f'&&cue.dialogueVisible?.34*pulse(ms,8600,10200)+.22*pulse(ms,11400,12800):0;
 const maleNod=who==='f'?.045*pulse(ms,10700,11600):0;
 const femaleNod=who==='m'?.048*(pulse(ms,2650,3400)+pulse(ms,17100,18100)):0;
 const expression=(side,look,hand=0,nod=0)=>({look,gesture:{left:side<0?hand:0,right:side>0?hand:0,reach:22,height:-25,forward:22,palm:.18,pitch:.018*hand,yaw:side*.025*hand,nod,tilt:side*.012*nod}});
 return {elapsedMs:cue.elapsedMs,time,cue,viewport,layout,
  actors:{
   m:{...INTRO_INVITATION_POSITIONS.m,opacity:1,expression:expression(1,.12+.15*attention,maleStroke,maleNod)},
   f:{...INTRO_INVITATION_POSITIONS.f,opacity:1,expression:expression(-1,-.15+.36*attention,femaleStroke,femaleNod)},
   guest:{...INTRO_INVITATION_POSITIONS.guest,opacity:cue.guestOpacity,index:cue.guestIndex,expression:expression(-1,-.25,.10*welcome,.035*pulse(ms,cue.guestIndex?13700:6100,cue.guestIndex?14500:6900))}
  },
  camera:frameCamera(time,cue,viewport,layout)
 };
}

export function createIntroInvitationScene(adapter){
 let active=false,finished=false,prepared=false,preparing=null,last=null;
 const api={
  get active(){return active;},get ready(){return prepared;},get elapsedMs(){return last?.elapsedMs||0;},
  prepare(){
   if(prepared)return Promise.resolve(true);
   return preparing??=(async()=>{await adapter.prepare();prepared=true;return true;})().catch(error=>{preparing=null;throw error;});
  },
  begin(){
   if(finished)return {active:false,finished:true};
   if(!prepared)throw Error('Les deux personnages invités ne sont pas prêts.');
   if(active)return api.sample(last?.elapsedMs||0);
   active=true;
   try{adapter.begin();return api.sample(0);}catch(error){active=false;throw error;}
  },
  sample(elapsedMs,voice={}){
   if(!active)return {active:false,finished,...(last||{})};
   const frame=introInvitationFrame(elapsedMs,adapter.viewport());
   frame.voice={speaker:['m','f'].includes(voice.speaker)?voice.speaker:null,energy:Math.max(0,Math.min(1,Number(voice.energy)||0))};
   adapter.apply(frame);last={...frame,faces:adapter.faces?.()||[]};
   return {active:true,finished:false,...last};
  },
  finish(){
   if(!finished){active=false;adapter.finish();finished=true;}
   return {active:false,finished:true,place:'salon'};
  }
 };
 return api;
}
