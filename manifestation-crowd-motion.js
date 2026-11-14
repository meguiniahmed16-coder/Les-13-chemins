import * as T from 'three';
import {closeHand} from './manifestation-props.js';
import {poseCitizen} from './catalogne-motion.js';

// Sample the established fixed-length walk once. The entire crowd then shares
// these poses instead of solving four articulated limbs for sixty people on
// every frame. Each person keeps an independent phase, height and expression.
export function createCrowdMotion(reference){
 const samples=24,period=1/1.12,names=Object.keys(reference.bones),clips={};
 for(const [name,moving,signal] of [['idle',false,false],['walk',true,false],['call',false,true],['walkCall',true,true]]){
  const frames=[];
  for(let i=0;i<(moving?samples:1);i++){
   poseCitizen(reference,i/samples*period,moving,signal);
   frames.push({height:reference.group.position.y/reference.h,bones:names.map(n=>reference.bones[n].bone.quaternion.clone().normalize())});
  }
  clips[name]=frames;
 }
 poseCitizen(reference,0,false);
 return {samples,period,clips,apply(rig,time,moving,signal=false,life=false){
  const frames=clips[signal?(moving?'walkCall':'call'):(moving?'walk':'idle')],phase=((time/period)%1+1)%1*frames.length,index=Math.floor(phase),fraction=phase-index;
  const a=frames[index],b=frames[(index+1)%frames.length];
  for(let i=0;i<names.length;i++)rig.bones[names[i]].bone.quaternion.slerpQuaternions(a.bones[i],b.bones[i],fraction);
  rig.group.position.y=T.MathUtils.lerp(a.height,b.height,fraction)*rig.h;
  if(life){
   const sway=Math.sin(time*1.7)*.014,look=Math.sin(time*.56)*.10;
   rig.bones.spine_03.bone.rotation.z+=sway;
   rig.bones.head.bone.rotation.y+=look;
   if(signal){closeHand(rig);rig.bones.UpperArm_L.bone.rotation.z+=Math.sin(time*5.8)*.10;}
  }
 }};
}
