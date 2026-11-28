import * as T from 'three';
import {V22_TO_MAKEHUMAN} from './atelier-rig-retarget.js';
import {prepareRegisteredBody} from './atelier-rig-registration.js';

// Capture once, immediately after the private actor has been reconstructed,
// before any live pose, body scaling or animation is applied.
export function captureActorRest(actor){
 const frame=actor.expanded?.root,mesh=actor.body;
 if(!frame||!mesh?.geometry?.attributes?.position||actor.bones?.length!==15)throw Error('Acteur privé V22 non prêt');
 actor.root.updateWorldMatrix(true,true);
 const point=bone=>frame.worldToLocal(bone.getWorldPosition(new T.Vector3()));
 const targets=new Map(V22_TO_MAKEHUMAN.map((name,i)=>[name,point(actor.bones[i])]));
 const extras=actor.expanded.extra;
 // The added cervical and ankle pivots are measured on this actor, rather
 // than borrowing the standard MakeHuman proportions from the other actor.
 if(extras?.length>=9){
  const lower=point(extras[1]),upper=point(extras[2]);
  targets.set('neck01',lower);targets.set('neck02',lower.clone().lerp(upper,.5));targets.set('neck03',upper);
  targets.set('spine04',point(extras[0]));
  targets.set('clavicle.R',point(extras[3]));targets.set('clavicle.L',point(extras[4]));
  targets.set('foot.R',point(extras[5]));targets.set('foot.L',point(extras[6]));
 }
 return {targets,matrix:frame.matrixWorld.clone().invert().multiply(mesh.matrixWorld)};
}
let references;
async function nativeReference(){
 return references??=Promise.all([
  import('./rig-reference/makehuman-default.json'),
  import('./rig-reference/makehuman-default-weights.json'),
  import('./rig-reference/makehuman-default-surface.json')
 ]).then(parts=>parts.map(p=>p.default));
}

// Diagnostic only: operate on a disposable copy of the actual body positions
// and normals. Keep the actor, the original textures, face, garments and pose
// completely unchanged. Nothing is sent to the server.
export async function diagnosePrivateActor(actor){
 if(!actor.registrationRest)throw Error(actor.registrationError||'Repères du personnage indisponibles');
 const [ref,weights,surface]=await nativeReference();
 const original=actor.body.geometry,g=new T.BufferGeometry();
 g.setAttribute('position',original.attributes.position.clone());
 if(!original.attributes.normal)throw Error('Normales du corps indisponibles');
 g.setAttribute('normal',original.attributes.normal.clone());
 g.applyMatrix4(actor.registrationRest.matrix);
 let result;
 try{
  result=prepareRegisteredBody(ref,weights,surface,actor.registrationRest.targets,g);
  const {fit,transfer}=result;
  return {bones:result.rig.skeleton.bones.length,anchors:fit.errors.length,maxErrorMm:fit.maxError*1000,
   minJacobian:fit.minJacobian,matched:transfer.matched,total:transfer.total,coverage:transfer.coverage,ready:result.ready};
 }finally{
  result?.geometry?.dispose();result?.rig?.mesh.geometry.dispose();result?.rig?.mesh.material.dispose();
  result?.rig?.skeleton.dispose();g.dispose();
 }
}
