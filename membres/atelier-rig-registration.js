import * as T from 'three';
import {referenceSkin} from './atelier-rig-makehuman.js';
import {projectSkinWeights,applyTransferredWeights} from './atelier-rig-transfer.js';

// All landmarks are expressed in metres in the target character's rest frame,
// with Y up and the same front/side convention as the original MakeHuman mesh.
export function referenceLandmarks(reference,names){
 const p=reference.positions,origin=p.reduce((lo,v,i)=>i%3===1?Math.min(lo,v):lo,Infinity);
 if(reference.vertexCount!==19158||p.length!==19158*3||!Number.isFinite(origin))throw Error('Référence anatomique invalide');
 const result=new Map();
 for(const name of names){
  const bone=reference.rig.bones[name],ids=bone&&reference.rig.joints[bone.head];
  if(!ids?.length)throw Error('Repère MakeHuman introuvable : '+name);
  const v=new T.Vector3();
  for(const i of ids)v.add(new T.Vector3(p[3*i]*.1,(p[3*i+1]-origin)*.1,p[3*i+2]*.1));
  result.set(name,v.multiplyScalar(1/ids.length));
 }
 return {origin,points:result};
}
const finite=v=>v&&[v.x,v.y,v.z].every(Number.isFinite);

// Dense pivoted solve: only the anatomical control points, not the mesh,
// participate in the solve. A deficient/coplanar set must be corrected.
function solve(rows,n){
 for(let k=0;k<n;k++){
  let pivot=k;for(let j=k+1;j<n;j++)if(Math.abs(rows[j][k])>Math.abs(rows[pivot][k]))pivot=j;
  if(Math.abs(rows[pivot][k])<1e-10)throw Error('Repères anatomiques insuffisants ou dégénérés');
  [rows[k],rows[pivot]]=[rows[pivot],rows[k]];
  const s=rows[k][k];for(let j=k;j<n+3;j++)rows[k][j]/=s;
  for(let i=0;i<n;i++)if(i!==k){
   const f=rows[i][k];for(let j=k;j<n+3;j++)rows[i][j]-=f*rows[k][j];
  }
 }
 return rows.map(r=>new T.Vector3(r[n],r[n+1],r[n+2]));
}

// A smooth displacement field with an affine tail. This registers the native
// reference to the actual actor, never resamples or replaces the actor's scan.
export function fitReferenceLandmarks(reference,target,{tolerance=.012,regularization=1e-7}={}){
 const entries=Array.from(target.entries()),n=entries.length;
 if(n<5||n>64||!(Number.isFinite(tolerance)&&tolerance>0)||!(Number.isFinite(regularization)&&regularization>=0))throw Error('Paramètres de recalage invalides');
 const {origin,points}=referenceLandmarks(reference,entries.map(([k])=>k));
 const x=entries.map(([k])=>points.get(k)),y=entries.map(([,v])=>v);
 if(y.some(v=>!finite(v)))throw Error('Repère personnage invalide');
 for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(x[i].distanceTo(x[j])<1e-5)throw Error('Repères natifs superposés');
 // Explicitly detect a reversed left/right registration before fitting.
 for(const k of ['upperarm01','lowerarm01','wrist','upperleg01','lowerleg01','foot']){
  const a=target.get(k+'.L'),b=target.get(k+'.R');
  if(a&&b&&a.x-b.x<.01)throw Error('Latéralité à vérifier : '+k);
 }
 const m=n+4,rows=Array.from({length:m},()=>new Float64Array(m+3));
 for(let i=0;i<n;i++){
  for(let j=0;j<n;j++)rows[i][j]=x[i].distanceTo(x[j])+(i===j?regularization:0);
  const p=[1,x[i].x,x[i].y,x[i].z];
  for(let j=0;j<4;j++)rows[i][n+j]=rows[n+j][i]=p[j];
  const d=y[i].clone().sub(x[i]);rows[i][m]=d.x;rows[i][m+1]=d.y;rows[i][m+2]=d.z;
 }
 const coef=solve(rows,m);
 const warp=p=>{
  const out=p.clone().add(coef[n]).addScaledVector(coef[n+1],p.x).addScaledVector(coef[n+2],p.y).addScaledVector(coef[n+3],p.z);
  for(let j=0;j<n;j++)out.addScaledVector(coef[j],p.distanceTo(x[j]));
  return out;
 };
 // Sample the local Jacobian on anchors and throughout the reference. This
 // rejects obvious folding; it is not a proof of global injectivity.
 const raw=reference.positions,positions=new Float32Array(raw.length);
 let minJacobian=Infinity,maxJacobian=0;
 function check(p){
  const e=.002,o=warp(p),a=warp(p.clone().add(new T.Vector3(e,0,0))).sub(o).divideScalar(e),
   b=warp(p.clone().add(new T.Vector3(0,e,0))).sub(o).divideScalar(e),
   c=warp(p.clone().add(new T.Vector3(0,0,e))).sub(o).divideScalar(e);
  const det=a.dot(b.cross(c));if(!Number.isFinite(det)||det<=.05)throw Error('Recalage replié ou écrasé : vérifier les repères');
  minJacobian=Math.min(minJacobian,det);maxJacobian=Math.max(maxJacobian,det);
 }
 for(const p of x)check(p);
 for(let i=0;i<raw.length;i+=3){
  const p=new T.Vector3(raw[i]*.1,(raw[i+1]-origin)*.1,raw[i+2]*.1);
  if(i%291===0)check(p);
  const q=warp(p);if(!finite(q))throw Error('Surface recalée non finie');
  positions.set([q.x*10,q.y*10,q.z*10],i);
 }
 // Bone heads are averages of native joint-marker vertices; measure the
 // actual fitted marker averages, not just the interpolated control points.
 const errors=entries.map(([name,desired])=>{
  const ids=reference.rig.joints[reference.rig.bones[name].head],v=new T.Vector3();
  for(const i of ids)v.add(new T.Vector3(positions[i*3]*.1,positions[i*3+1]*.1,positions[i*3+2]*.1));
  const error=v.multiplyScalar(1/ids.length).distanceTo(desired);
  return {name,error};
 });
 const maxError=Math.max(...errors.map(x=>x.error));
 if(maxError>tolerance)throw Error('Repères recalés hors tolérance : '+Math.round(maxError*1000)+' mm');
 return {positions,originY:0,errors,maxError,minJacobian,maxJacobian};
}

// The target geometry must already be expressed in this same rest frame.
// Return a separate candidate only after all vertices have accepted weights.
// Never mutate the live V7 mesh, its face morphs, clothing, or old skeleton.
export function prepareRegisteredBody(reference,weights,surface,targetLandmarks,targetGeometry,options={}){
 const fit=fitReferenceLandmarks(reference,targetLandmarks,options.fit);
 const rig=referenceSkin(reference,weights,surface,{positions:fit.positions,originY:fit.originY});
 const transfer=projectSkinWeights(rig.mesh.geometry,targetGeometry,options.transfer);
 let geometry=null;
 if(transfer.matched===transfer.total){
  geometry=targetGeometry.clone();applyTransferredWeights(geometry,transfer);
 }
 return {fit,rig,transfer,geometry,ready:geometry!==null};
}
