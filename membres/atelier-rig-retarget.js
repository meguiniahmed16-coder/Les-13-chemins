import * as T from 'three';

// V22 has a flat 15-bone motion source. Do not copy its local matrices onto
// the hierarchical MakeHuman rig: that would detach limbs or double rotations.
export const V22_TO_MAKEHUMAN = Object.freeze([
 'root','head','upperarm01.R','lowerarm01.R','wrist.R',
 'upperarm01.L','lowerarm01.L','wrist.L','upperleg01.R',
 'lowerleg01.R','foot.R','upperleg01.L','lowerleg01.L','foot.L','spine01'
]);

const frameQuaternion = (bone,frame) =>
 frame.getWorldQuaternion(new T.Quaternion()).invert().multiply(bone.getWorldQuaternion(new T.Quaternion()));
const framePosition = (bone,frame) => frame.worldToLocal(bone.getWorldPosition(new T.Vector3()));
function depth(bone){let n=0;for(let p=bone.parent;p;p=p.parent)n++;return n;}

// Both frames must have been anatomically registered in a common axis
// convention (Y up, same forward direction), with the actors in rest pose.
// The caller must keep the original V22 skeleton as motion driver only.
export function prepareV22Retarget(sourceBones,sourceFrame,referenceRig,{translationScale=1}={}){
 const targetFrame=referenceRig.root,objects=referenceRig.objects;
 if(sourceBones.length!==15||objects.size!==163||!(Number.isFinite(translationScale)&&translationScale>0))throw Error('Armatures de référence V22 / MakeHuman requises');
 sourceFrame.updateWorldMatrix(true,true);targetFrame.updateWorldMatrix(true,true);
 const channels=V22_TO_MAKEHUMAN.map((name,i)=>{
  const source=sourceBones[i],target=objects.get(name);
  if(!source?.isBone||!target?.isBone||!target.parent)throw Error('Articulation absente : '+name);
  return {name,source,target,sourceRest:frameQuaternion(source,sourceFrame),targetRest:frameQuaternion(target,targetFrame)};
 }).sort((a,b)=>depth(a.target)-depth(b.target));
 const pelvis=channels.find(c=>c.name==='root');
 const sourceOrigin=framePosition(pelvis.source,sourceFrame),targetOrigin=framePosition(pelvis.target,targetFrame);
 const rest=Array.from(objects.values(),bone=>({bone,position:bone.position.clone(),rotation:bone.quaternion.clone(),scale:bone.scale.clone()}));
 const tmp=new T.Quaternion(),p=new T.Vector3();
 function reset(){for(const r of rest){r.bone.position.copy(r.position);r.bone.quaternion.copy(r.rotation);r.bone.scale.copy(r.scale);}targetFrame.updateWorldMatrix(true,true);}
 function pose(){
  // Reset each frame; no accumulated rotation or changing bone lengths.
  reset();sourceFrame.updateWorldMatrix(true,true);
  p.copy(framePosition(pelvis.source,sourceFrame)).sub(sourceOrigin).multiplyScalar(translationScale).add(targetOrigin);
  pelvis.target.position.copy(pelvis.target.parent.worldToLocal(targetFrame.localToWorld(p)));
  pelvis.target.updateWorldMatrix(true,false);
  for(const c of channels){
   // Conjugation by the actor frame removes scene placement. Apply the
   // global rest-to-pose delta, then express it in the new parent frame.
   const delta=frameQuaternion(c.source,sourceFrame).multiply(c.sourceRest.clone().invert());
   const desired=targetFrame.getWorldQuaternion(tmp).multiply(delta).multiply(c.targetRest);
   c.target.quaternion.copy(c.target.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(desired)).normalize();
   c.target.updateWorldMatrix(true,false);
  }
  targetFrame.updateWorldMatrix(true,true);
 }
 return {pose,reset,channels,sourceOrigin,targetOrigin};
}
