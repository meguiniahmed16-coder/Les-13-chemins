import * as T from 'three';
import {loadStudio} from './studio-model.js';
import {referenceStudio} from './studio-look.js';
import {SalonMotion} from './salon-v27-motion.js';
import {attachFemaleHead,loadFemaleReference} from './v27/female-reference.js';
export const introOutfits=Object.freeze({
 m:{haut:'mh1800',bas:'mh1796',souliers:'mh438'},
 f:{haut:'mh22',bas:'mh391',souliers:'mh1734'}
});
let poseData;
function poses(){return poseData??=fetch('/membres/v27/poses.json').then(r=>{if(!r.ok)throw Error('Poses V27 indisponibles');return r.json()}).catch(e=>{poseData=null;throw e;});}
function fabric(image){
 const data=new Uint8Array(image.data.length);
 for(let i=0;i<data.length;i+=4){
  const l=(.2126*image.data[i]+.7152*image.data[i+1]+.0722*image.data[i+2])/255;
  // Preserve fabric weave, seams and wrinkles, but bleach the original dye.
  const v=Math.round(222+33*Math.pow(l,.75));data[i]=data[i+1]=data[i+2]=v;data[i+3]=image.data[i+3];
 }
 return data;
}
function partMesh(m,parent,white){
 const base=Float32Array.from(m.v,x=>x*.0001),geo=new T.BufferGeometry();
 geo.setAttribute('position',new T.BufferAttribute(base.slice(),3).setUsage(T.DynamicDrawUsage));
 geo.setAttribute('normal',new T.BufferAttribute(new Int8Array(m.vn),3,true).setUsage(T.DynamicDrawUsage));
 geo.setAttribute('uv',new T.BufferAttribute(new Uint16Array(m.uv),2,true));
 geo.setIndex(new T.BufferAttribute(new Uint16Array(m.faces),1));
 const tex=new T.DataTexture(white?fabric(m.image):new Uint8Array(m.image.data),m.image.width,m.image.height);
 tex.colorSpace=T.SRGBColorSpace;tex.flipY=false;tex.generateMipmaps=true;tex.minFilter=T.LinearMipmapLinearFilter;tex.magFilter=T.LinearFilter;tex.needsUpdate=true;
 const mat=new T.MeshStandardMaterial({map:tex,color:0xffffff,roughness:.88,alphaTest:white?.08:.23,side:T.DoubleSide});
 const obj=new T.Mesh(geo,mat);obj.name=white?'V27 vêtement '+m.name:m.name;obj.castShadow=true;obj.frustumCulled=false;parent.add(obj);
 return {obj,mesh:obj,name:m.name,base,reference:base,fullIndex:m.name==='body'?new T.BufferAttribute(m.allFaces,1):geo.index,source:m};
}
function updatePart(p){
 const m=p.source,g=p.obj.geometry;
 for(let i=0;i<m.v.length;i++)g.attributes.position.array[i]=m.v[i]*.0001;
 g.attributes.normal.array.set(m.vn);
 g.attributes.position.needsUpdate=g.attributes.normal.needsUpdate=true;
}
function motionGesture(g,amount){
 if(!g)return null;
 const accent=(g.emphasis||0)*(g.energy||0),invite=g.kind==='invite',left=(g.kind==='question'?.7:.38)*accent,right=(invite?.86:.62)*accent;
 return {gesture:{left,right,reach:26,height:invite?-12:-20,forward:invite?31:21,palm:.20,pitch:.018*accent,yaw:0,nod:.035*accent,tilt:.012*Math.sin(g.time||0)},look:g.headYaw||0};
}
function makeController(figure,rig,parts,actor,originalRig=null){
 const solver=new SalonMotion(()=>{},{angle:0},undefined,()=>.42);solver.femaleHands=actor.id==='f';
 const inv=originalRig?Array.from({length:15},(_,i)=>new T.Matrix4().fromArray(rig.rest,i*16).invert()):null;
 const old=originalRig?.map(o=>new T.Matrix4().compose(o.position.clone(),o.quaternion.clone(),o.scale.clone()));
 const matrix=new T.Matrix4();
 let last='',time=0;
 function apply(mats){
  figure.pose(mats);for(const p of parts)updatePart(p);
  if(originalRig)for(let i=0;i<15;i++){
   matrix.fromArray(mats,i*16).multiply(inv[i]).multiply(old[i]);
   matrix.decompose(originalRig[i].position,originalRig[i].quaternion,originalRig[i].scale);
  }
  actor.stamp=(Number(actor.stamp)||0)+1;actor.root.updateMatrixWorld(true);actor.head?.follow(true);
 }
 return {
  apply,
  pose(amount,g=null){
   actor.sit=amount;const t=g?.time??time;time=t;
   const seat=amount>0?actor.introSeat:null,expr=motionGesture(g,amount);
   const key=Math.round(amount*200)+'/'+Math.floor(t*18)+'/'+(seat?.id||'')+'/'+Math.round((g?.headYaw||0)*100)+'/'+Math.round((g?.energy||0)*10);
   if(key===last)return;last=key;
   if(g?.gait?.strength>.01&&amount<.01){solver.travelPose(g.gait.phase,g.gait.strength*.7,0);apply(solver.bones());}
   else apply(solver.sampleSalonPose(seat,amount,t,expr,actor.id==='m'?1.075:1.04));
  }
 };
}
// Keep the original Ahmed portrait and rig. Remove only the three improvised
// garment meshes; actual library garments follow the same V27 deformation matrices.
export async function dressAhmed(actor,originalRig,parent,oldGarments){
 if(originalRig?.length!==15||!parent||oldGarments.length!==3)throw Error('Atelier Ahmed : pièces originales non reconnues');
 const look=referenceStudio('homme');look.outfit={...introOutfits.m};
 const [data,figure]=await Promise.all([poses(),loadStudio(look,'homme')]);
 figure.pose(data.m.rest);
 const garmentMeshes=figure.meshes.filter(m=>m.binding);
 if(garmentMeshes.length!==3)throw Error('Bibliothèque : tenue Ahmed incomplète');
 const parts=garmentMeshes.map(m=>partMesh(m,parent,true));
 // Hide only skin triangles covered by the actual selected garments. The
 // original hands, face, neck and every uncovered part retain their source.
 const originalSkin=parent.children.find(o=>o.isSkinnedMesh&&!oldGarments.includes(o));
 if(originalSkin){
  const g=originalSkin.geometry,p=g.attributes.position,ids=g.index.array;
  const body=figure.meshes.find(m=>m.name==='body'),shown=new Uint8Array(body.n);
  for(const i of body.faces)shown[i]=1;
  const cell=.025,buckets=new Map(),key=(x,y,z)=>x+','+y+','+z;
  for(let i=0;i<body.n;i++){
   const k=i*3,x=body.v[k]*.0001,y=body.v[k+1]*.0001,z=body.v[k+2]*.0001;
   const s=key(Math.floor(x/cell),Math.floor(y/cell),Math.floor(z/cell));if(!buckets.has(s))buckets.set(s,[]);buckets.get(s).push(i);
  }
  const hidden=new Uint8Array(p.count);
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
   if(y>1.32||y<.83)continue; // preserve the original neck and hands
   const a=Math.floor(x/cell),b=Math.floor(y/cell),c=Math.floor(z/cell);let best=-1,d=.0036;
   for(let u=-2;u<=2;u++)for(let v=-2;v<=2;v++)for(let w=-2;w<=2;w++)for(const j of buckets.get(key(a+u,b+v,c+w))||[]){
    const k=j*3,ds=(x-body.v[k]*.0001)**2+(y-body.v[k+1]*.0001)**2+(z-body.v[k+2]*.0001)**2;if(ds<d){d=ds;best=j;}
   }
   if(best>=0&&!shown[best])hidden[i]=1;
  }
  const kept=[];for(let i=0;i<ids.length;i+=3){const a=ids[i],b=ids[i+1],c=ids[i+2];if(!(hidden[a]&&hidden[b]&&hidden[c]))kept.push(a,b,c);}
  g.setIndex(new T.BufferAttribute(new Uint32Array(kept),1));
 }
 for(const old of oldGarments){old.visible=false;old.removeFromParent();}
 actor.parts=parts;actor.pants=null;
 actor.wardrobe=makeController(figure,data.m,parts,actor,originalRig);
 actor.pose=(amount,g)=>actor.wardrobe.pose(amount,g);
 actor.wardrobe.apply(data.m.rest);
 return actor;
}
export async function createMarianne(root,body){
 const look=referenceStudio('femme');look.outfit={...introOutfits.f};
 const [data,figure,template]=await Promise.all([poses(),loadStudio(look,'femme'),loadFemaleReference()]);
 figure.pose(data.f.rest);
 const parts=figure.meshes.map(m=>partMesh(m,body,!!m.binding));
 if(parts.filter(p=>p.source.binding).length!==3)throw Error('Bibliothèque : tenue Marianne incomplète');
 const actor={id:'f',root,body,parts,sit:0,stamp:0,head:null};
 actor.wardrobe=makeController(figure,data.f,parts,actor);
 actor.pose=(amount,g)=>actor.wardrobe.pose(amount,g);
 actor.walkPose=(phase,strength)=>actor.wardrobe.pose(0,{time:phase,gait:{phase,strength}});
 actor.head=attachFemaleHead(actor,template,look);actor.head.follow(true);
 actor.speak=(open,wide=0,blink=0)=>actor.head.talk({jaw:open,spread:wide*.18,round:open*.18,blink});
 return actor;
}
