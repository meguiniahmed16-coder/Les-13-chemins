import * as T from 'three';
import {BEAT} from './danse-core.js';
const v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),clamp=T.MathUtils.clamp;
const mix=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);

// Original 32-count phrase, informed by 1960s Jerk / Twist teaching references.
// Foot changes happen one at a time; the other foot holds its stage position.
// https://www.libraryofdance.org/dances/jerk/
// https://www.pecentral.org/lessonideas/ViewLesson.asp?ID=9638
const smooth=x=>{x=clamp(x,0,1);return x*x*x*(x*(x*6-15)+10);};
const steps=[
 [[0,0],[0,0]], [[0,0],[.18,0]], [[.22,0],[.18,0]],
 [[-.18,0],[.18,0]], [[-.18,0],[-.22,0]],
 [[-.18,0],[0,0]], [[0,0],[0,0]], [[0,0],[0,0]], [[0,0],[0,0]]
];
export function dancePhrase(time,action='cross',energy=1,won=false,variation=0){
 const beat=Math.max(0,time/BEAT),e=clamp(energy,0,1),phase=beat*Math.PI;
 const section=Math.floor(beat/8)%4,local=beat%8,index=Math.floor(local),u=local-index;
 const s=Math.sin(phase*.5),c=Math.cos(phase*.5),q=Math.sin(phase);
 let feet=[-1,1].map((side,i)=>{
  let from=[0,0],to=[0,0];
  if(section===0||section===2){from=steps[index][i];to=steps[index+1][i];}
  if(section===2){from=[from[0]*.5,from[0]*.33];to=[to[0]*.5,to[0]*.33];}
  const moving=Math.abs(from[0]-to[0])+Math.abs(from[1]-to[1])>.001;
  const f=smooth(u/.68),touch=moving&&u<.68;
  return {side,x:e*(from[0]+(to[0]-from[0])*f),z:e*(from[1]+(to[1]-from[1])*f),
   lift:touch?e*.055*Math.sin(Math.PI*clamp(u/.68,0,1))**2:0,
   yaw:e*(section===1?.13*q:section===3?.07*q:0),contact:!touch};
 });
 const centre=(feet[0].x+feet[1].x)/2;
 const sway=e*(section===1||section===3?.045*s:0)+centre;
 const handsFor=n=>[-1,1].map(side=>{
  // Bent elbows, hands around the waist/chest. No repeated side-arm flapping.
  if(n===0)return [side*.28+.035*s,1.08+.045*side*q,.28+.045*side*s];
  if(n===1)return [side*.29,1.20+.055*Math.sin(phase-.35),.28+.055*side*q];
  if(n===2)return [side*.32+.04*s,1.18+.08*side*s,.30-.05*side*s];
  return [side*(.33+.035*c),1.27+.11*side*s,.27+.055*c];
 });
 const transition=smooth(Math.min(1,local/.7));
 const hands=handsFor(section).map((p,i)=>{
  const side=i===0?-1:1;p=mix(handsFor((section+3)%4)[i],p,transition);
  if(action==='square'||won)p=mix(p,[side*.39,1.37+.08*side*s,.27+.035*c],.62);
  if(action==='circle')p=mix(p,[side*.23,1.16,.28],.75);
  return mix([side*.25,.99,.19],p,e);
 });
 return {sway,bob:-e*(.027+.009*(1-Math.cos(phase*2))),
  hip:e*(section===1?.13*q:.065*s),chest:e*(-.095*s+.035*Math.sin(phase-.25)),
  roll:e*.025*c,head:e*.028*Math.sin(phase*.5-.5),hands,feet,
  smile:.55+e*.30+.025*Math.sin(phase*.25),section};
}

function orient(bone,child,target){
 const pos=bone.getWorldPosition(v());
 const old=child.getWorldPosition(v()).sub(pos).normalize();
 const aim=target.clone().sub(pos).normalize();
 const q=new T.Quaternion().setFromUnitVectors(old,aim).multiply(bone.getWorldQuaternion(new T.Quaternion()));
 bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(q));
 bone.updateMatrixWorld(true);
}
export function solve(root,bones,a,b,c,target,pole){
 const upper=bones.get(a),joint=bones.get(b),end=bones.get(c);if(!upper||!joint||!end)return;
 const start=upper.getWorldPosition(v()),mid=joint.getWorldPosition(v()),tip=end.getWorldPosition(v());
 const l1=start.distanceTo(mid),l2=mid.distanceTo(tip),goal=root.localToWorld(target.clone());
 const delta=goal.clone().sub(start),distance=clamp(delta.length(),Math.abs(l1-l2)+.001,l1+l2-.001);delta.normalize();
 const bend=root.localToWorld(pole.clone()).sub(start);bend.addScaledVector(delta,-bend.dot(delta));
 if(bend.lengthSq()<1e-8)bend.set(0,0,1);bend.normalize();
 const along=(l1*l1-l2*l2+distance*distance)/(2*distance);
 const elbow=start.clone().addScaledVector(delta,along).addScaledVector(bend,Math.sqrt(Math.max(0,l1*l1-along*along)));
 orient(upper,joint,elbow);orient(joint,end,start.clone().addScaledVector(delta,distance));
}
function bend(root,bone,axis,angle){
 if(!bone||!angle)return;const worldAxis=axis.clone().applyQuaternion(root.getWorldQuaternion(new T.Quaternion()));
 const parent=bone.parent.getWorldQuaternion(new T.Quaternion());
 bone.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(worldAxis.applyQuaternion(parent.invert()).normalize(),angle));
 bone.updateMatrixWorld(true);
}
export function prepareDanceRig(root){
 root.updateMatrixWorld(true);const bones=new Map(),rest=new Map();
 root.traverse(o=>{if(o.isBone){bones.set(o.name.toLowerCase(),o);rest.set(o.name.toLowerCase(),o.quaternion.clone());}});
 const feet=new Map(),footRotations=new Map();
 for(const side of ['l','r']){const bone=bones.get('foot_'+side);if(!bone)continue;
  feet.set(side,root.worldToLocal(bone.getWorldPosition(v())));
  footRotations.set(side,root.getWorldQuaternion(new T.Quaternion()).invert().multiply(bone.getWorldQuaternion(new T.Quaternion())));
 }
 return {root,bones,rest,feet,footRotations,baseY:root.position.y,baseX:root.position.x};
}
export function poseDanceRig(rig,time,{action='cross',energy=1,won=false,variation=0,baseX=rig.baseX,baseY=rig.baseY}={}){
 const {root,bones,rest,feet,footRotations}=rig,p=dancePhrase(time,action,energy,won,variation);
 const dt=rig.previousTime==null?1:clamp(time-rig.previousTime,0,1);rig.previousTime=time;
 if(rig.previousHands&&dt>0&&dt<.2){const k=1-Math.exp(-dt/.095);p.hands=p.hands.map((h,i)=>mix(rig.previousHands[i],h,k));}
 rig.previousHands=p.hands.map(h=>h.slice());
 for(const [name,q] of rest)bones.get(name).quaternion.copy(q);
 const scale=root.scale.y;root.position.x=baseX+p.sway*scale;root.position.y=baseY+p.bob*scale;
 root.updateMatrixWorld(true);
 bend(root,bones.get('pelvis'),v(0,1,0),p.hip);
 bend(root,bones.get('spine_01'),v(0,0,1),p.roll*.35);
 bend(root,bones.get('spine_02'),v(0,1,0),p.chest);
 bend(root,bones.get('spine_03'),v(0,0,1),-p.roll);
 bend(root,bones.get('neck_01'),v(1,0,0),-.02+Math.abs(p.head)*.3);
 bend(root,bones.get('head'),v(0,0,1),p.head);
 for(const side of ['l','r']){
  const sign=side==='l'?1:-1,index=side==='l'?1:0;
  bend(root,bones.get('clavicle_'+side),v(0,0,1),sign*p.roll*.6);
  const hand=p.hands[index];
  solve(root,bones,'upperarm_'+side,'lowerarm_'+side,'hand_'+side,v(...hand),v(sign*.65,1.05,-.12));
  bend(root,bones.get('hand_'+side),v(0,1,0),sign*.10*Math.sin(time/BEAT*Math.PI));
  const foot=feet.get(side);if(!foot)continue;const f=p.feet[index];
  solve(root,bones,'thigh_'+side,'calf_'+side,'foot_'+side,
   v(foot.x+f.x-p.sway,foot.y+f.lift-p.bob,foot.z+f.z),v(sign*.14,.65,.7));
  const bone=bones.get('foot_'+side),world=root.getWorldQuaternion(new T.Quaternion()).multiply(footRotations.get(side));
  world.premultiply(new T.Quaternion().setFromAxisAngle(v(0,1,0),f.yaw));
  bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(world));
  bone.updateMatrixWorld(true);
 }
 return p;
}
