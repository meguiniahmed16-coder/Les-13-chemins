import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export function readableTextGeometry(width,height){const a=new T.PlaneGeometry(width,height),b=a.clone();a.translate(0,0,.003);b.rotateY(Math.PI);b.translate(0,0,-.003);const g=mergeGeometries([a,b]);a.dispose();b.dispose();return g;}
// Resolve the palm from the animated skeleton every frame. No world-space flag
// is allowed to trail behind a carrier independently of that person's hand.
export function palmPosition(actor,side='L',out=new T.Vector3()){
 const bone=actor.userData.citizen?.rig.bones['Hand_'+side]?.bone;
 actor.updateWorldMatrix(true,true);
 if(bone)return out.set(side==='L'?6:-6,0,0).applyMatrix4(bone.matrixWorld);
 return actor.localToWorld(out.set(.25,1.45,.12));
}
export function followPalm(prop,actor,grip=1.15,side='L'){
 const p=palmPosition(actor,side);prop.parent.worldToLocal(p);
 prop.position.copy(p);prop.position.y-=grip;
 prop.rotation.y=prop.parent===actor?0:actor.rotation.y;
 prop.visible=actor.visible;return p;
}
export function bannerCorners(left,right,parent){
 const a=parent.worldToLocal(palmPosition(left)),b=parent.worldToLocal(palmPosition(right));
 return {a,b,vertices:[a.x,a.y+1.65,a.z,b.x,b.y+1.65,b.z,b.x,b.y+.7,b.z,a.x,a.y+.7,a.z]};
}
// The closed fingers use the original joint lengths; only rotations change.
export function closeHand(rig,side='L',amount=1){
 for(const [name,{bone}]of Object.entries(rig.bones)){
  if(!name.endsWith('_'+side.toLowerCase())||!/Finger|finger|thumb/i.test(name))continue;
  const joint=Number(name.match(/_(\d+)_/)?.[1]||0);if(!joint)continue;
  const thumb=/thumb/i.test(name),angle=(thumb?.48:joint===1?1.05:1.3)*amount;
  bone.quaternion.multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),-angle));
 }
}
