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
function footCurve(phase){
 phase=((phase%1)+1)%1;
 let i=0;while(i<strideKeys.length-2&&phase>strideKeys[i+1][0])i++;
 const a=strideKeys[i],b=strideKeys[i+1],span=b[0]-a[0],u=(phase-a[0])/span;
 // Keep a truly level support phase; blend the airborne arc with smooth tangents.
 const prev=i===0?[-.13,...strideKeys[5].slice(1)]:strideKeys[i-1];
 const next=i+2>=strideKeys.length?[1.18,...strideKeys[1].slice(1)]:strideKeys[i+2];
 const value=k=>{
  let m0=(b[k]-prev[k])/(b[0]-prev[0]),m1=(next[k]-a[k])/(next[0]-a[0]);
  if(k===1&&(a[1]===0||b[1]===0)){if(a[1]===0)m0=0;if(b[1]===0)m1=0;}
  return (2*u*u*u-3*u*u+1)*a[k]+(u*u*u-2*u*u+u)*span*m0+(-2*u*u*u+3*u*u)*b[k]+(u*u*u-u*u)*span*m1;
 };
 return {height:i===0?0:Math.max(0,value(1)),forward:value(2)};
}
export function gaitSample(time,height){
 const cadence=height<1.5?1.85:1.65;
 const phase=((time*cadence)%1+1)%1;
 return {phase,lift:height*.024*(1-Math.cos(TAU*2*phase))/2,left:footCurve(phase),right:footCurve(phase+.5)};
}
export function poseRunner(p,time,moving,gesture=false,reduced=false){
 reset(p);const h=p.h,sample=gaitSample(time,h),phase=sample.phase;
 // Lower the hips slightly on landing. Both feet are solved against the same ground plane.
 p.bodyLift=moving?-.055*h+(reduced?0:sample.lift):0;
 p.group.position.y=.012+p.bodyLift;p.group.updateMatrixWorld(true);
 if(moving){
  rotateInGroup(p,'spine_01',new T.Quaternion().setFromEuler(new T.Euler(.10,Math.sin(TAU*phase)*.035,Math.sin(TAU*phase)*.012)));
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
  let hand=V(sign*.115*h,(moving?.665-.025*wave:.38)*h,(moving?.065-.13*wave:.045)*h);
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
