import * as T from 'three';
import {SalonMotion} from '../salon-v27-motion.js';

const clock=()=>performance.now()/1000;
function blended(mats,bones,weights,out){
  const m=out.elements;m.fill(0);
  for(let j=0;j<4&&weights[j];j++){const k=bones[j]*16,w=weights[j]/255;for(let c=0;c<16;c++)m[c]+=mats[k+c]*w;}
  return out;
}
// The compact duo is already in a standing pose. Undo that exact weighted pose before
// moving each vertex through the live skeleton, including both distinct wrist joints.
function bindPart(part,rig,rest){
  const geom=part.obj.geometry,n=geom.attributes.normal,perVertex=new Uint16Array(n.count),groups=[],ids=new Map(),mat=new T.Matrix4();
  for(let i=0;i<n.count;i++){
    const r=rig.subarray(8*i,8*i+8),key=r.join(',');let group=ids.get(key);
    if(group===undefined){group=groups.length;ids.set(key,group);
      const bones=r.slice(0,4),weights=r.slice(4);
      groups.push({bones,weights,inverse:blended(rest,bones,weights,mat).clone().invert(),pose:new T.Matrix4(),norm:new T.Matrix3()});
    }perVertex[i]=group;
  }
  const restNormal=n.clone(),p=geom.attributes.position,normal=n.array instanceof Int8Array?127:1;
  return {apply(mats){
    for(const g of groups){blended(mats,g.bones,g.weights,g.pose).multiply(g.inverse);g.norm.getNormalMatrix(g.pose);}
    const src=part.base,out=p.array,normals=n.array;
    for(let i=0,k=0;i<perVertex.length;i++,k+=3){
      const group=groups[perVertex[i]],m=group.pose.elements,b=group.norm.elements,x=src[k],y=src[k+1],z=src[k+2];
      out[k]=m[0]*x+m[4]*y+m[8]*z+m[12];out[k+1]=m[1]*x+m[5]*y+m[9]*z+m[13];out[k+2]=m[2]*x+m[6]*y+m[10]*z+m[14];
      const nx=restNormal.getX(i),ny=restNormal.getY(i),nz=restNormal.getZ(i);
      normals[k]=(b[0]*nx+b[3]*ny+b[6]*nz)*normal;normals[k+1]=(b[1]*nx+b[4]*ny+b[7]*nz)*normal;normals[k+2]=(b[2]*nx+b[5]*ny+b[8]*nz)*normal;
    }p.needsUpdate=n.needsUpdate=true;
  },release(){n.array.set(restNormal.array);n.needsUpdate=true;}};
}
export function defaultMotion(actor,packed,rest){
  let parts;
  return {apply(mats){parts??=actor.parts.map(p=>bindPart(p,packed[actor.id+'/'+p.name],rest));for(const p of parts)p.apply(mats);},
    release(){for(const p of parts||[])p.release();}};
}
export function wardrobeMotion(figure,parts){
  const oldNormals=parts.map(p=>p.obj.geometry.attributes.normal.array.slice());
  return {apply(mats){figure.pose(mats);for(let j=0;j<parts.length;j++){
    const src=figure.meshes[j],{position:p,normal:n}=parts[j].obj.geometry.attributes;
    for(let k=0;k<src.v.length;k++)p.array[k]=src.v[k]*.0001;n.array.set(src.vn);p.needsUpdate=n.needsUpdate=true;
  }},release(){parts.forEach((p,j)=>{const n=p.obj.geometry.attributes.normal;n.array.set(oldNormals[j]);n.needsUpdate=true;});}};
}
export function livePose(actor,seat,moving){
  const solver=actor.solver??=new SalonMotion(undefined,{angle:0});
  solver.femaleHands=actor.id==='f';
  // Invitees prefer the calibrated armrest without changing the original cinematic poses.
  solver.preferGuestArmrest=actor.isGuest===true;
  const seated=!!seat,express=actor.conversationPose;
  if(!actor.motion||(!seated&&(!express||moving>.015))){
    if(actor.live){actor.motion?.release();actor.live=false;actor.stamp='';solver.sampleSalonPose(null,0,0,null);}
    return false;
  }
  const now=clock(),tag=Math.floor(now*(express?25:15))+'/'+(seat?.id||'')+'/'+Math.round(actor.sit*50);
  if(actor.live&&tag===actor.liveTag)return true;
  const matrices=solver.sampleSalonPose(seat?.source||null,actor.sit,now,{gesture:express?.gesture,look:express?.look||0},actor.root.scale.y);
  actor.motion.apply(matrices);actor.live=true;actor.liveTag=tag;actor.stamp='live/'+tag;return true;
}
