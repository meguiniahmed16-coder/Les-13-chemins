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
 const expression=(side,look,hand=0)=>({look,gesture:{left:side<0?hand:.035,right:side>0?hand:.035,reach:27,height:-12,forward:16,palm:.23,pitch:0,yaw:0,nod:.022*welcome*Math.sin(time*2.5),tilt:0}});
 return {elapsedMs:cue.elapsedMs,time,cue,viewport,layout,
  actors:{
   m:{...INTRO_INVITATION_POSITIONS.m,opacity:1,expression:expression(1,.12+.15*attention,.10+.22*welcome)},
   f:{...INTRO_INVITATION_POSITIONS.f,opacity:1,expression:expression(-1,-.15+.36*attention,.06+.10*welcome)},
   guest:{...INTRO_INVITATION_POSITIONS.guest,opacity:cue.guestOpacity,index:cue.guestIndex,expression:expression(-1,-.25,.08+.34*welcome)}
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
  sample(elapsedMs){
   if(!active)return {active:false,finished,...(last||{})};
   const frame=introInvitationFrame(elapsedMs,adapter.viewport());
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
