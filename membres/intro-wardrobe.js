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
 if(g.poseGesture)return {gesture:g.poseGesture,look:g.headYaw||0};
 const accent=(g.emphasis||0)*(g.energy||0),invite=g.kind==='invite',left=(g.kind==='question'?.7:.38)*accent,right=(invite?.86:.62)*accent;
 return {gesture:{left,right,reach:26,height:invite?-12:-20,forward:invite?31:21,palm:.20,pitch:.018*accent,yaw:0,nod:.035*accent,tilt:.012*Math.sin(g.time||0)},look:g.headYaw||0};
}
function makeController(figure,rig,parts,actor,originalRig=null,originalRest=null){
 const solver=new SalonMotion(()=>{},{angle:0},undefined,()=>.42);solver.femaleHands=actor.id==='f';
 const inv=originalRig?Array.from({length:15},(_,i)=>new T.Matrix4().fromArray(rig.rest,i*16).invert()):null;
 const old=originalRest||originalRig?.map(o=>new T.Matrix4().compose(o.position.clone(),o.quaternion.clone(),o.scale.clone()));
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
  invalidate(){last='';},
  pose(amount,g=null){
   actor.sit=amount;const t=g?.time??time;time=t;
   const seat=amount>0?actor.introSeat:null,expr=motionGesture(g,amount);
   const footwork=g?.gait?.footwork;
   const key=Math.round(amount*200)+'/'+(footwork?'step:'+Math.round(t*1000):Math.floor(t*18))+'/'+(seat?.id||'')+'/'+Math.round((g?.headYaw||0)*100)+'/'+Math.round((g?.energy||0)*10);
   if(key===last)return;last=key;
   if(footwork&&amount<.01)apply(solver.sampleFootworkPose(footwork,t,expr,actor.id==='m'?1.075:1.04));
   else if(g?.gait?.strength>.01&&amount<.01){solver.expression=expr;solver.travelPose(g.gait.phase,g.gait.strength*.7,0);apply(solver.bones());}
   else apply(solver.sampleSalonPose(seat,amount,t,expr,actor.id==='m'?1.075:1.04));
  }
 };
}
// Plan a visibility mask without changing the live actor. Cached wardrobe
// variants can then be prepared while the preceding scene is still visible.
function ahmedSkinMask(figure,originalSkin){
 if(!originalSkin)return null;
  const g=originalSkin.geometry,p=g.attributes.position;
  // A later wardrobe choice can uncover skin hidden by the preceding outfit.
  // Always derive its mask from the original triangles, not an accumulated cut.
  const ids=g.userData.ahmedOriginalIndex??=g.index.array.slice();
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
  return new T.BufferAttribute(new Uint32Array(kept),1);
}

// The private portrait was exported with the torso and legs hidden beneath
// its original clothes. Its saved index cannot restore triangles that were
// never exported. Complete those regions from the same fitted V27 body while
// retaining the private head, neck, hands and their existing articulation.
function completeAhmedSkin(figure,originalSkin,parent){
 const body=figure.meshes.find(m=>m.name==='body');
 if(!body?.rig||!body.faces?.length)throw Error('Le corps articulé complet d’Ahmed Marie est indisponible.');
 const original=originalSkin?.geometry,p=original?.attributes.position;
 const sourceIndex=original?.userData.ahmedOriginalIndex||original?.index?.array;
 const cell=.025,buckets=new Map(),key=(x,y,z)=>x+','+y+','+z;
 const point=new T.Vector3(),nearest=new T.Vector3();
 if(p&&sourceIndex){
  originalSkin.updateMatrix();
  const vertices=Array.from({length:p.count},(_,i)=>new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(originalSkin.matrix));
  for(let i=0;i<sourceIndex.length;i+=3){
   const a=vertices[sourceIndex[i]],b=vertices[sourceIndex[i+1]],c=vertices[sourceIndex[i+2]];
   // The native head is never added. Avoid indexing the private face's much
   // denser topology while comparing the lower neck and existing hand skin.
   if(Math.min(a.y,b.y,c.y)>1.44)continue;
   const triangle=new T.Triangle(a,b,c);
   for(let x=Math.floor(Math.min(a.x,b.x,c.x)/cell);x<=Math.floor(Math.max(a.x,b.x,c.x)/cell);x++)
    for(let y=Math.floor(Math.min(a.y,b.y,c.y)/cell);y<=Math.floor(Math.max(a.y,b.y,c.y)/cell);y++)
     for(let z=Math.floor(Math.min(a.z,b.z,c.z)/cell);z<=Math.floor(Math.max(a.z,b.z,c.z)/cell);z++){
      const id=key(x,y,z);if(!buckets.has(id))buckets.set(id,[]);buckets.get(id).push(triangle);
     }
  }
 }
 function covered(x,y,z){
  point.set(x,y,z);const a=Math.floor(x/cell),b=Math.floor(y/cell),c=Math.floor(z/cell);
  for(let u=-1;u<=1;u++)for(let v=-1;v<=1;v++)for(let w=-1;w<=1;w++)for(const triangle of buckets.get(key(a+u,b+v,c+w))||[]){
   triangle.closestPointToPoint(point,nearest);if(nearest.distanceToSquared(point)<.000001)return true;
  }
  return false;
 }
 const kept=[],privatePart=new Uint8Array(body.n),present=new Uint8Array(body.n);
 for(let i=0;i<body.n;i++){
  let head=0,hand=0;
  for(let k=0;k<4;k++){
   const bone=body.rig[i*8+k],weight=body.rig[i*8+4+k];
   if(bone===1)head+=weight;if(bone===4||bone===7)hand+=weight;
  }
  privatePart[i]=head>128||hand>128?1:0;
  if(!privatePart[i])present[i]=covered(body.v[3*i]*.0001,body.v[3*i+1]*.0001,body.v[3*i+2]*.0001)?1:0;
 }
 for(let i=0;i<body.faces.length;i+=3){
  const a=body.faces[i],b=body.faces[i+1],c=body.faces[i+2];
  if(privatePart[a]&&privatePart[b]&&privatePart[c])continue;
  if(present[a]&&present[b]&&present[c]){
   const x=(body.v[3*a]+body.v[3*b]+body.v[3*c])/30000,y=(body.v[3*a+1]+body.v[3*b+1]+body.v[3*c+1])/30000,z=(body.v[3*a+2]+body.v[3*b+2]+body.v[3*c+2])/30000;
   if(covered(x,y,z))continue;
  }
  kept.push(a,b,c);
 }
 if(!kept.length)return null;
 const indices=Uint16Array.from(kept),source={...body,name:'introAhmedSkin',faces:indices,allFaces:indices};
 const part=partMesh(source,parent,false);part.introSkinSupplement=true;return part;
}

// Keep the original Ahmed portrait and rig. Remove only the three improvised
// garment meshes; actual library garments follow the same V27 deformation matrices.
export async function dressAhmed(actor,originalRig,parent,oldGarments,options={}){
 if(originalRig?.length!==15||!parent||(!options.figure&&oldGarments.length!==3))throw Error('Atelier Ahmed : pièces originales non reconnues');
 const look=referenceStudio('homme');look.outfit={...introOutfits.m};
 const [data,figure]=await Promise.all([poses(),options.figure||loadStudio(look,'homme')]);
 figure.pose(data.m.rest);
 const garmentMeshes=figure.meshes.filter(m=>m.binding);
 if(!options.figure&&garmentMeshes.length!==3)throw Error('Bibliothèque : tenue Ahmed incomplète');
 const white=options.white??true;
 const parts=garmentMeshes.map(m=>partMesh(m,parent,typeof white==='function'?white(m):white));
 const originalSkin=parent.children.find(o=>o.isSkinnedMesh&&!oldGarments.includes(o));
 const mask=ahmedSkinMask(figure,originalSkin);if(mask)originalSkin.geometry.setIndex(mask);
 const rest=originalRig.map(o=>new T.Matrix4().compose(o.position.clone(),o.quaternion.clone(),o.scale.clone()));
 actor.introRig={bones:originalRig,parent,skin:originalSkin,rig:data.m,rest};
 for(const old of oldGarments){old.visible=false;old.removeFromParent();}
 actor.parts=parts;actor.pants=null;
 actor.wardrobe=makeController(figure,data.m,parts,actor,originalRig);
 actor.pose=(amount,g)=>actor.wardrobe.pose(amount,g);
 actor.wardrobe.apply(data.m.rest);
 return actor;
}
export async function createMarianne(root,body,options={}){
 const look=options.look||referenceStudio('femme');if(!options.look)look.outfit={...introOutfits.f};
 const [data,figure,template]=await Promise.all([poses(),options.figure||loadStudio(look,'femme'),loadFemaleReference()]);
 figure.pose(data.f.rest);
 const parts=figure.meshes.map(m=>partMesh(m,body,!!m.binding&&(options.white??true)));
 if(!options.figure&&parts.filter(p=>p.source.binding).length!==3)throw Error('Bibliothèque : tenue Marianne incomplète');
 const actor={id:'f',root,body,parts,sit:0,stamp:0,head:null};
 actor.wardrobe=makeController(figure,data.f,parts,actor);
 actor.pose=(amount,g)=>actor.wardrobe.pose(amount,g);
 actor.walkPose=(phase,strength)=>actor.wardrobe.pose(0,{time:phase,gait:{phase,strength}});
 actor.head=attachFemaleHead(actor,template,look);actor.head.follow(true);
 actor.speak=(open,wide=0,blink=0)=>actor.head.talk({jaw:open,spread:wide*.18,round:open*.18,blink});
 return actor;
}

// Independent native editor example. This deliberately does not attach the
// reference Marianne head or the private Ahmed portrait. All skin and clothes
// are fitted together by loadStudio before the preview can become visible.
export async function createIntroCastActor(root,figure,{look=figure.appearance,gender='femme'}={}){
 const id=gender==='femme'?'f':'m',data=await poses(),body=new T.Group();root.add(body);
 figure.pose(data[id].rest);
 const parts=figure.meshes.map(m=>partMesh(m,body,false));
 const head=new T.Object3D();head.name='Aperçu · point de regard';body.add(head);
 const actor={id:'preview',root,body,parts,figure,look,gender,sit:0,stamp:0,previewHead:head,height:1.8,bounds:new T.Box3()};
 const driver={...actor,id,head:null};
 const controller=makeController(figure,data[id],parts,driver),shoes=parts.filter(part=>part.source.group==='chaussures');
 const soleVertices=shoes.map(part=>[part,[...new Set(part.source.faces)]]),headVertices=[];
 const skin=figure.meshes.find(m=>m.name==='body');
 for(let i=0;i<skin.n;i++)if(skin.position[i*3+1]>14000&&skin.position[i*3+1]<15800)headVertices.push(i);
 actor.pose=(amount,g)=>{
  controller.pose(0,g);
  let sole=Infinity;
  for(const [part,indices]of soleVertices)for(const i of indices)sole=Math.min(sole,part.source.v[3*i+1]*.0001);
  body.position.y=Number.isFinite(sole)?.002/root.scale.y-sole:0;
  let x=0,y=0,z=0;for(const i of headVertices){x+=skin.v[3*i];y+=skin.v[3*i+1];z+=skin.v[3*i+2];}
  const n=headVertices.length||1;head.position.set(x*.0001/n,y*.0001/n,z*.0001/n);
  root.updateMatrixWorld(true);
  for(const part of parts)part.obj.geometry.computeBoundingBox();
  actor.bounds.setFromObject(root);actor.height=actor.bounds.max.y-root.position.y;actor.stamp=driver.stamp;
 };
 let disposed=false;actor.dispose=()=>{
  if(disposed)return;disposed=true;
  for(const part of parts){part.obj.geometry.dispose();part.obj.material.map?.dispose();part.obj.material.dispose();}
  root.removeFromParent();
 };
 actor.pose(0,{time:0,energy:0,emphasis:0});return actor;
}


const appearanceFields=['body','parts','wardrobe','pose','walkPose','head','speak','pants'];
function appearanceHandle(actor,fields,{skin=null,index=null,owned=false,group=null}={}){
 const visibility=fields.parts.map(part=>part.obj.visible);
 let disposed=false;
 return {
  activate(){
   if(disposed)throw Error('Cette tenue de démonstration a été libérée.');
   for(const part of actor.parts)part.obj.visible=false;
   if(actor.body!==fields.body)actor.body.visible=false;
   for(const key of appearanceFields)actor[key]=fields[key];
   actor.body.visible=true;if(group)group.visible=true;
   fields.parts.forEach((part,i)=>part.obj.visible=visibility[i]);
   if(skin&&index)skin.geometry.setIndex(index.clone());
   actor.wardrobe.invalidate?.();actor.pose(actor.sit||0,{time:0,energy:0,emphasis:0});
  },
  dispose(){
   if(!owned||disposed)return;disposed=true;
   fields.head?.detach?.();
   for(const part of fields.parts){part.obj.removeFromParent();part.obj.geometry.dispose();part.obj.material.map?.dispose();part.obj.material.dispose();}
   group?.removeFromParent();
  }
 };
}
export function captureIntroAppearance(actor){
 const fields=Object.fromEntries(appearanceFields.map(key=>[key,actor[key]]));
 const skin=actor.introRig?.skin;
 return appearanceHandle(actor,fields,{skin,index:skin?.geometry.index.clone()});
}
// Build only hidden geometry. Activation is synchronous and never moves a
// root, replaces the private Ahmed portrait, or writes the saved appearance.
export async function prepareIntroAppearance(actor,figure,{look=figure.appearance,white=false,completeBody=false}={}){
 if(actor.id==='f'){
  const group=new T.Group();group.name='Marianne · tenue de démonstration';group.visible=false;actor.root.add(group);
  let variant;
  try{variant=await createMarianne(actor.root,group,{figure,look,white});}
  catch(error){group.removeFromParent();throw error;}
  const fields=Object.fromEntries(appearanceFields.map(key=>[key,variant[key]]));
  // The scene keeps the original actor object. Its current head and speech
  // controller become those fitted to the cached body, with the same face.
  const pose=fields.pose;fields.pose=(amount,g)=>{actor.sit=amount;pose(amount,g);actor.stamp=variant.stamp;};
  return appearanceHandle(actor,fields,{owned:true,group});
 }
 const binding=actor.introRig;if(!binding)throw Error('Les articulations originales d’Ahmed sont indisponibles.');
 figure.pose(binding.rig.rest);
 const group=new T.Group();group.name='Ahmed · tenue de démonstration';group.visible=false;binding.parent.add(group);
 const parts=[];
 try{
 for(const m of figure.meshes.filter(m=>m.binding))parts.push(partMesh(m,group,typeof white==='function'?white(m):white));
 if(completeBody){
  // Only an explicitly authorized inspection figure can contain no lower
  // garment. Ordinary outfit edits use the loader's existing clothing masks.
  if(figure.inspection!==true&&!parts.some(part=>['pantalons','jupes','robes','combinaisons','culottes','maillots'].includes(part.source.group)))throw Error('L’inspection du corps est réservée à l’atelier auteur.');
  const skin=completeAhmedSkin(figure,binding.skin,group);if(skin)parts.push(skin);
 }else if(look?.outfit?.culotte&&!look.outfit.bas&&!look.outfit.robe){
  // The private portrait's source skin omits the legs hidden by its original
  // trousers. Complete only the lower body for the opaque underwear preview;
  // its covered waistband conceals the join. Keep the private hands, neck,
  // face, speech and skeleton, and never duplicate their skin geometry.
  const body=figure.meshes.find(m=>m.name==='body'),lower=new Uint8Array(body.n);
  for(let i=0;i<body.n;i++){
   let weight=0;
   for(let k=0;k<4;k++){
    const bone=body.rig[i*8+k],amount=body.rig[i*8+4+k];
    if(bone===0||(bone>=8&&bone<=13))weight+=amount;
   }
   lower[i]=body.v[i*3+1]<8400&&weight>220?1:0;
  }
  const faces=[];
  for(let i=0;i<body.faces.length;i+=3){const a=body.faces[i],b=body.faces[i+1],c=body.faces[i+2];if(lower[a]&&lower[b]&&lower[c])faces.push(a,b,c);}
  if(!faces.length)throw Error('Les jambes d’Ahmed sont indisponibles pour cet ensemble.');
  const indices=Uint16Array.from(faces),legSource={...body,name:'introAhmedLegs',faces:indices,allFaces:indices};
  const legs=partMesh(legSource,group,false);legs.introSkinSupplement=true;parts.push(legs);
 }
 const wardrobe=makeController(figure,binding.rig,parts,actor,binding.bones,binding.rest);
 const fields=Object.fromEntries(appearanceFields.map(key=>[key,actor[key]]));
 Object.assign(fields,{parts,wardrobe,pose:(amount,g)=>wardrobe.pose(amount,g),pants:null});
 // Use the complete original rest-pose skin, never the preceding outfit's cut.
 const index=ahmedSkinMask(figure,binding.skin);
 return appearanceHandle(actor,fields,{skin:binding.skin,index,owned:true,group});
 }catch(error){
  for(const part of parts){part.obj.geometry.dispose();part.obj.material.map?.dispose();part.obj.material.dispose();}
  group.removeFromParent();throw error;
 }
}
