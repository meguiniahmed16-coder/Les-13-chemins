// Poses for the existing rig. Game timing, speed and collision rules stay in the chase.
import * as T from 'three';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const TAU=Math.PI*2;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const localPosition=(p,b)=>p.group.worldToLocal(b.getWorldPosition(V()));
function reset(p){for(const r of Object.values(p.bones))r.bone.quaternion.copy(r.rest);p.group.updateMatrixWorld(true);}
function rotateInGroup(p,bone,rotation){
 const b=p.bones[bone]?.bone;if(!b)return;
 const groupQ=p.group.getWorldQuaternion(new T.Quaternion());
 const q=groupQ.clone().multiply(rotation).multiply(groupQ.clone().invert());
 const world=q.multiply(b.getWorldQuaternion(new T.Quaternion()));
 b.quaternion.copy(b.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(world));b.updateMatrixWorld(true);
}
function aim(p,name,next,target){
 const a=p.bones[name].bone,b=p.bones[next].bone;
 const origin=a.getWorldPosition(V()),current=b.getWorldPosition(V()).sub(origin).normalize();
 const desired=p.group.localToWorld(target.clone()).sub(origin).normalize();
 const world=new T.Quaternion().setFromUnitVectors(current,desired).multiply(a.getWorldQuaternion(new T.Quaternion()));
 a.quaternion.copy(a.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(world));a.updateMatrixWorld(true);
}
// Analytic two-bone solve: fixed limb lengths, a consistent knee/elbow plane, no stretching.
function limb(p,start,middle,end,target,pole){
 const a=localPosition(p,p.bones[start].bone),b=localPosition(p,p.bones[middle].bone),c=localPosition(p,p.bones[end].bone);
 const l1=a.distanceTo(b),l2=b.distanceTo(c),direction=target.clone().sub(a);
 const distance=clamp(direction.length(),Math.abs(l1-l2)+.0001,l1+l2-.0001);direction.normalize();
 const bend=pole.clone().sub(a);bend.addScaledVector(direction,-bend.dot(direction));
 if(bend.lengthSq()<1e-8)bend.set(0,0,1);bend.normalize();
 const along=(l1*l1-l2*l2+distance*distance)/(2*distance);
 const knee=a.clone().addScaledVector(direction,along).addScaledVector(bend,Math.sqrt(Math.max(0,l1*l1-along*along)));
 aim(p,start,middle,knee);aim(p,middle,end,a.clone().addScaledVector(direction,distance));
}
// Periodic Hermite curve: contact -> push-off -> heel recovery -> knee drive -> landing.
// Coordinates are ankle height above its resting level, and forward offset, in body heights.
const strideKeys=[
 [0,0,.17], [.18,0,.005], [.40,.012,-.23], [.55,.23,-.25],
 [.72,.24,-.025], [.87,.10,.17], [1,0,.17]
];
const walkKeys=[[0,0,.16],[.18,0,.06],[.40,0,-.11],[.55,.006,-.16],[.72,.065,-.02],[.87,.045,.12],[1,0,.16]];
function footCurve(phase,fast){
 const keys=fast?strideKeys:walkKeys;
 phase=((phase%1)+1)%1;
 let i=0;while(i<keys.length-2&&phase>keys[i+1][0])i++;
 const a=keys[i],b=keys[i+1],span=b[0]-a[0],u=(phase-a[0])/span;
 // Keep a truly level support phase; blend the airborne arc with smooth tangents.
 const prev=i===0?[-.13,...keys[5].slice(1)]:keys[i-1];
 const next=i+2>=keys.length?[1.18,...keys[1].slice(1)]:keys[i+2];
 const value=k=>{
  let m0=(b[k]-prev[k])/(b[0]-prev[0]),m1=(next[k]-a[k])/(next[0]-a[0]);
  if(k===1&&(a[1]===0||b[1]===0)){if(a[1]===0)m0=0;if(b[1]===0)m1=0;}
  return (2*u*u*u-3*u*u+1)*a[k]+(u*u*u-2*u*u+u)*span*m0+(-2*u*u*u+3*u*u)*b[k]+(u*u*u-u*u)*span*m1;
 };
 return {height:i===0?0:Math.max(0,value(1)),forward:value(2)};
}
export function gaitSample(time,height,fast=false){
 const cadence=fast?1.75:1.12;
 const phase=((time*cadence)%1+1)%1;
 return {phase,lift:height*(fast?.024:.006)*(1-Math.cos(TAU*2*phase))/2,left:footCurve(phase,fast),right:footCurve(phase+.5,fast)};
}
export function poseCitizen(p,time,moving,gesture=false,reduced=false,fast=false){
 reset(p);const h=p.h,sample=gaitSample(time,h,fast),phase=sample.phase;
 // Lower the hips slightly on landing. Both feet are solved against the same ground plane.
 p.bodyLift=moving?-(fast?.055:.025)*h+(reduced?0:sample.lift):0;
 p.group.position.y=.012+p.bodyLift;p.group.updateMatrixWorld(true);
 if(moving){
  rotateInGroup(p,'spine_01',new T.Quaternion().setFromEuler(new T.Euler(fast?.10:.025,Math.sin(TAU*phase)*.035,Math.sin(TAU*phase)*.012)));
  rotateInGroup(p,'spine_03',new T.Quaternion().setFromAxisAngle(V(0,1,0),-Math.sin(TAU*phase)*.05));
  rotateInGroup(p,'neck_01',new T.Quaternion().setFromAxisAngle(V(1,0,0),-.045));
 }
 for(const side of ['L','R']){
  const sign=side==='L'?1:-1,low=side.toLowerCase(),legPhase=phase+(side==='L'?0:.5),wave=Math.cos(TAU*legPhase),foot=side==='L'?sample.left:sample.right;
  const ankle=V(sign*.057*h,.032*h-p.bodyLift+(moving?foot.height*h:0),(moving?foot.forward:-.019)*h);
  limb(p,'Thigh_'+side,'calf_'+low,'Foot_'+side,ankle,V(sign*.06*h,.25*h,.8*h));
  // The sole stays flat during support, then the toes follow the recovering heel.
  const toeAngle=moving?clamp(foot.height*3.2,0,.55):0;
  const ankleActual=localPosition(p,p.bones['Foot_'+side].bone);
  aim(p,'Foot_'+side,'ball_'+low,ankleActual.clone().add(V(0,-.031*h-Math.sin(toeAngle)*.05*h,Math.cos(toeAngle)*.052*h)));
  let hand=V(sign*.115*h,(moving?(fast?.665-.025*wave:.44-.025*wave):.38)*h,(moving?(fast?.065-.13*wave:.035-.10*wave):.045)*h);
  let pole=V(sign*.20*h,.45*h,-.19*h);
  if(gesture&&side==='L'){hand=V(sign*.095*h,.90*h,.08*h);pole=V(sign*.38*h,.68*h,.04*h);}
  limb(p,'UpperArm_'+side,'lowerarm_'+low,'Hand_'+side,hand,pole);
 }
 p.group.updateMatrixWorld(true);
 return sample;
}
export function poseSeated(p,seatHeight=.46,variant=0){
 reset(p);const h=p.h,hip=localPosition(p,p.bones.Pelvis.bone);
 p.group.position.y=seatHeight+.055-hip.y;p.group.updateMatrixWorld(true);
 rotateInGroup(p,'spine_01',new T.Quaternion().setFromEuler(new T.Euler(.08,variant*.055,0)));
 rotateInGroup(p,'neck_01',new T.Quaternion().setFromEuler(new T.Euler(.06,-variant*.13,0)));
 for(const side of ['L','R']){
  const s=side==='L'?1:-1,l=side.toLowerCase();
  limb(p,'Thigh_'+side,'calf_'+l,'Foot_'+side,V(s*.075*h,.032*h-p.group.position.y,.22*h),V(s*.08*h,.5*h,.8*h));
  const ankle=localPosition(p,p.bones['Foot_'+side].bone);aim(p,'Foot_'+side,'ball_'+l,ankle.clone().add(V(0,-.031*h,.052*h)));
  const hand=V(s*.11*h,.81-p.group.position.y,.26*h+(side==='R'?variant*.04:0));
  limb(p,'UpperArm_'+side,'lowerarm_'+l,'Hand_'+side,hand,V(s*.28*h,.55*h,.12*h));
 }
 p.group.updateMatrixWorld(true);
}

// Adult park activities share the same fixed-length rig; no scaled or stretched limbs.
export function poseActivity(p,kind,time=0,variant=0){
 const h=p.h;
 if(kind==='guitar'){
  poseSeated(p,.46,0);
  limb(p,'UpperArm_L','lowerarm_l','Hand_L',V(.24*h,.88-p.group.position.y,.26*h),V(.30*h,.45*h,.12*h));
  limb(p,'UpperArm_R','lowerarm_r','Hand_R',V(-.055*h,.78-p.group.position.y+Math.sin(time*8)*.035,.24*h),V(-.26*h,.45*h,.10*h));
 }else if(kind==='listen'){
  poseCitizen(p,time,false);for(const side of ['L','R']){const s=side==='L'?1:-1,l=side.toLowerCase();limb(p,'UpperArm_'+side,'lowerarm_'+l,'Hand_'+side,V(s*.07*h,.52*h,.15*h),V(s*.25*h,.48*h,.03*h));}
 }else if(kind==='yoga'){
  poseCitizen(p,time,false);const tree=variant%2===0;
  if(tree){
   limb(p,'Thigh_L','calf_l','Foot_L',V(.055*h,.31*h,.015*h),V(.40*h,.42*h,.02*h));
   for(const side of ['L','R']){const s=side==='L'?1:-1,l=side.toLowerCase();limb(p,'UpperArm_'+side,'lowerarm_'+l,'Hand_'+side,V(s*.02*h,1.045*h,.04*h),V(s*.25*h,.88*h,.03*h));}
  }else{
   p.group.position.y=-.07*h;p.group.updateMatrixWorld(true);
   for(const side of ['L','R']){const s=side==='L'?1:-1,l=side.toLowerCase();limb(p,'Thigh_'+side,'calf_'+l,'Foot_'+side,V(s*.27*h,.032*h-p.group.position.y,s*.06*h),V(s*.32*h,.28*h,.15*h));limb(p,'UpperArm_'+side,'lowerarm_'+l,'Hand_'+side,V(s*.43*h,.68*h,.03*h),V(s*.25*h,.69*h,.03*h));}
  }
 }else if(kind==='taichi'){
  poseCitizen(p,time,false);p.group.position.y=-.06*h;p.group.updateMatrixWorld(true);const wave=Math.sin(time*.65+variant*.2);
  rotateInGroup(p,'spine_03',new T.Quaternion().setFromAxisAngle(V(0,1,0),wave*.13));
  for(const side of ['L','R']){const s=side==='L'?1:-1,l=side.toLowerCase();limb(p,'Thigh_'+side,'calf_'+l,'Foot_'+side,V(s*.14*h,.032*h-p.group.position.y,s*.04*h),V(s*.18*h,.25*h,.28*h));limb(p,'UpperArm_'+side,'lowerarm_'+l,'Hand_'+side,V((s*.12+wave*.10)*h,(.58+s*wave*.055)*h,.23*h),V(s*.28*h,.49*h,.12*h));}
 }else if(kind==='embrace'){
  poseCitizen(p,time,false);rotateInGroup(p,'neck_01',new T.Quaternion().setFromEuler(new T.Euler(.02,0,variant*.10)));
  for(const side of ['L','R']){const s=side==='L'?1:-1,l=side.toLowerCase();limb(p,'UpperArm_'+side,'lowerarm_'+l,'Hand_'+side,V(s*.13*h,(side==='L'?.69:.52)*h,.22*h),V(s*.22*h,.55*h,.15*h));}
 }else if(kind==='recline'){
  poseCitizen(p,time,false);
  for(const side of ['L','R']){const s=side==='L'?1:-1,l=side.toLowerCase();limb(p,'UpperArm_'+side,'lowerarm_'+l,'Hand_'+side,V(s*.07*h,.61*h,.19*h),V(s*.21*h,.52*h,.10*h));}
 }
 p.group.updateMatrixWorld(true);
}

// Brief hidden gestures; all joints use the same fixed-length IK as walking.
export function poseSecret(p,kind,time){
 poseCitizen(p,time,false);const h=p.h;
 if(kind==='dance'){
  const beat=time*Math.PI*3.4,sway=Math.sin(beat),pulse=(1-Math.cos(beat*2))*.5;
  p.group.position.y=.012-h*(.025+.025*pulse);p.group.updateMatrixWorld(true);
  rotateInGroup(p,'spine_01',new T.Quaternion().setFromEuler(new T.Euler(.03,Math.sin(beat*.5)*.16,sway*.075)));
  rotateInGroup(p,'spine_03',new T.Quaternion().setFromEuler(new T.Euler(0,-Math.sin(beat*.5)*.22,0)));
  rotateInGroup(p,'neck_01',new T.Quaternion().setFromEuler(new T.Euler(-.025,Math.sin(beat*.5)*.14,-sway*.035)));
  for(const side of ['L','R']){
   const s=side==='L'?1:-1,l=side.toLowerCase(),lift=Math.max(0,s*sway)*.055*h;
   limb(p,'Thigh_'+side,'calf_'+l,'Foot_'+side,V(s*(.11+.024*Math.cos(beat))*h,.032*h-p.group.position.y+lift,s*sway*.045*h),V(s*.19*h,.28*h,.36*h));
   const ankle=localPosition(p,p.bones['Foot_'+side].bone);aim(p,'Foot_'+side,'ball_'+l,ankle.clone().add(V(0,-.031*h,.052*h)));
   const wave=Math.sin(beat+s*.8);
   limb(p,'UpperArm_'+side,'lowerarm_'+l,'Hand_'+side,V(s*(.18+.055*Math.cos(beat*.5))*h,(.66+s*wave*.13)*h,(.13+.055*Math.cos(beat))*h),V(s*.32*h,.56*h,.10*h));
  }
 }else if(kind==='joint'){
  const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);},raise=smooth((time-2.5)/1.2),lower=smooth((time-5.5)/.7);
  rotateInGroup(p,'neck_01',new T.Quaternion().setFromEuler(new T.Euler(.18*(1-raise),0,0)));
  const roll=Math.sin(time*12)*.008*(1-raise);
  const rollingL=V(.04*h,(.59+roll)*h,.20*h),rollingR=V(-.04*h,(.59-roll)*h,.20*h);
  const left=rollingL.lerp(V(.055*h,.74*h,.20*h),raise).lerp(V(.115*h,.38*h,.045*h),lower);
  const right=rollingR.lerp(V(-.045*h,.765*h,.13*h),raise);
  limb(p,'UpperArm_L','lowerarm_l','Hand_L',left,V(.25*h,.54*h,.13*h));
  limb(p,'UpperArm_R','lowerarm_r','Hand_R',right,V(-.25*h,.56*h,.12*h));
  aim(p,'Hand_L','indexFinger_03_l',V(-.025*h,.59*h,.20*h).lerp(V(.02*h,.82*h,.20*h),raise).lerp(V(.115*h,.30*h,.045*h),lower));
  aim(p,'Hand_R','indexFinger_03_r',V(.025*h,.59*h,.20*h).lerp(V(0,.825*h,.13*h),raise));
 }
 p.group.updateMatrixWorld(true);
}
