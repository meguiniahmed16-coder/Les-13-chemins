import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {dressAhmed,introOutfits} from '../intro-wardrobe.js';
import {referenceStudio} from '../studio-look.js';
import {SalonMotion} from '../salon-v27-motion.js';

const whiteCinemaGarments=new Set(Object.values(introOutfits.m));

// This is the same authenticated model and complete outfit as the prologue.
// The private portrait is never copied into the public asset build.
export const cinemaAhmedAsset=Object.freeze({
 bytes:10671740,unit:1048576,
 sha256:'66040c78a23c862dd39090802129eabab252638f1d1e863836a1e71f37f53192'
});
export function cinemaAhmedLook(){
 const look=referenceStudio('homme');look.outfit={...introOutfits.m};return look;
}
export function sameAhmedPortrait(look){
 const original=cinemaAhmedLook();
 return ['skinLevel','iris'].every(k=>(look?.[k]??'')===(original[k]??''))&&
  Object.keys(original.face).every(k=>(look?.face?.[k]??0)===original.face[k]);
}
export async function fetchCinemaAhmed(fetcher=fetch,subtle=globalThis.crypto?.subtle){
 const {bytes,unit,sha256}=cinemaAhmedAsset,chunks=new Array(Math.ceil(bytes/unit));
 async function read(url,expected){
  const response=await fetcher(url,{credentials:'same-origin',signal:AbortSignal.timeout(95000)});
  if(!response.ok){const error=Error('Ahmed : HTTP '+response.status);error.status=response.status;throw error;}
  const data=new Uint8Array(await response.arrayBuffer());
  if(data.byteLength!==expected)throw Error('Le modèle original d’Ahmed est incomplet.');
  return data;
 }
 async function group(index){
  const first=index*3,last=Math.min(chunks.length,first+3),expected=Math.min(bytes-first*unit,3*unit);
  try{
   const data=await read('/api/intro-private/ahmedfast/'+String(index).padStart(3,'0'),expected);
   for(let i=first;i<last;i++)chunks[i]=data.subarray((i-first)*unit,Math.min(data.length,(i-first+1)*unit));
  }catch(error){
   // An authorization error must not become a second request through a legacy URL.
   if(error.status===401||error.status===403)throw error;
   for(let i=first;i<last;i++)chunks[i]=await read('/api/intro-private/ahmedv3/'+String(i).padStart(3,'0'),Math.min(unit,bytes-i*unit));
  }
 }
 for(let i=0;i<4;i+=2)await Promise.all([group(i),group(i+1)]);
 const complete=new Uint8Array(bytes);let offset=0;
 for(const chunk of chunks){complete.set(chunk,offset);offset+=chunk.byteLength;}
 if(offset!==bytes)throw Error('Le modèle original d’Ahmed est incomplet.');
 if(subtle){
  const digest=Array.from(new Uint8Array(await subtle.digest('SHA-256',complete)),n=>n.toString(16).padStart(2,'0')).join('');
  if(digest!==sha256)throw Error('Le modèle original d’Ahmed doit être retéléchargé.');
 }
 return complete.buffer;
}
function withoutOptionalMorphs(buffer){
 const bytes=new Uint8Array(buffer),view=new DataView(buffer),size=view.getUint32(12,true);
 const data=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+size)));
 for(const mesh of data.meshes||[]){delete mesh.weights;if(mesh.extras?.targetNames)delete mesh.extras.targetNames;for(const p of mesh.primitives||[])delete p.targets;}
 for(const node of data.nodes||[])delete node.weights;delete data.animations;
 const json=new TextEncoder().encode(JSON.stringify(data)),pad=(json.length+3)&~3,tail=bytes.subarray(20+size);
 const out=new Uint8Array(20+pad+tail.length),header=new DataView(out.buffer);
 header.setUint32(0,0x46546c67,true);header.setUint32(4,2,true);header.setUint32(8,out.length,true);
 header.setUint32(12,pad,true);header.setUint32(16,0x4e4f534a,true);
 out.fill(32,20,20+pad);out.set(json,20);out.set(tail,20+pad);return out.buffer;
}
async function loadModel(){
 const bytes=await fetchCinemaAhmed(),loader=new GLTFLoader();
 try{return (await loader.parseAsync(bytes,'')).scene;}
 catch{return (await loader.parseAsync(withoutOptionalMorphs(bytes),'')).scene;}
}

// Keep the salon's actor object, navigation, backpack, wings and seat targets.
// Only its visible geometry and deformation controller become the original Ahmed.
export async function attachCinemaAhmed(actor,{model,dress=dressAhmed,now=()=>performance.now()/1000}={}){
 const original=model||await loadModel(),compact=actor.parts;
 const oldGarments=[],mouth=[];let skeleton;
 original.traverse(object=>{
  if(object.isMesh){object.castShadow=true;object.receiveShadow=false;object.frustumCulled=false;}
  if(object.isSkinnedMesh&&/^(Haut|Pantalon|Chaussures)[\s_]*blanc/i.test(object.name))oldGarments.push(object);
  if(!skeleton&&object.isSkinnedMesh&&object.skeleton?.bones.length===15)skeleton=object.skeleton;
  if(object.morphTargetDictionary?.Ouvrir!==undefined)mouth.push(object);
 });
 if(!skeleton||oldGarments.length!==3)throw Error('Le modèle original d’Ahmed n’est pas reconnu.');
 const parent=oldGarments[0].parent,rig=skeleton.bones;
 const rest=rig.map(bone=>({p:bone.position.clone(),q:bone.quaternion.clone(),s:bone.scale.clone()}));
 const holder=new T.Group();holder.name='Ahmed de la cinématique';
 // The GLB itself already contains its 1.075 scale. Cancel the outer salon
 // scale once; preserve the source scale, portrait transforms and floor lift.
 holder.scale.setScalar(1/1.075);holder.position.y=.0206/1.075;holder.add(original);
 actor.body.add(holder);
 const modelActor={id:'m',root:actor.root,body:holder,parts:[],sit:0};
 try{await dress(modelActor,rig,parent,oldGarments);}catch(error){holder.removeFromParent();throw error;}
 const originalParts=modelActor.parts,originalWardrobe=modelActor.wardrobe;
 const skin=parent.children.find(object=>object.isSkinnedMesh&&!oldGarments.includes(object));
 const originalSkinIndex=skin?.geometry.index.clone();
 const solver=new SalonMotion(()=>{},{angle:0});
 let active=true,last='',current=modelActor.wardrobe;
 const activeMotion={apply(matrices){current.apply(matrices);},release(){}};
 for(const part of compact)part.obj.visible=false;
 actor.parts=originalParts;actor.root.name='Ahmed Marie';actor.id='m';actor.motion=activeMotion;
 function resetRig(){for(const [i,bone] of rig.entries()){bone.position.copy(rest[i].p);bone.quaternion.copy(rest[i].q);bone.scale.copy(rest[i].s);}}
 function activate(){active=true;holder.visible=true;actor.id='m';actor.root.scale.setScalar(1.075);actor.motion=activeMotion;last='';}
 const controller={
  get active(){return active;},get parts(){return originalParts;},motion:activeMotion,
  look:cinemaAhmedLook(),
  supports(look,gender){return gender==='homme'&&sameAhmedPortrait(look);},
  hide(){active=false;holder.visible=false;last='';},
  restore(){
   for(const part of originalParts){parent.add(part.obj);part.obj.visible=true;}
   if(skin&&originalSkinIndex)skin.geometry.setIndex(originalSkinIndex.clone());
   current=originalWardrobe;actor.parts=originalParts;activate();
  },
  async dress(figure,valid=()=>true){
   // Loaders finish before this call. Prepare hidden garments, then switch
   // only if this is still the requested wardrobe choice.
   const before=actor.parts,beforeWardrobe=current,beforeIndex=skin?.geometry.index.clone();
   const draft={id:'m',root:actor.root,body:holder,parts:[],sit:0};
   resetRig();
   try{
    // The stored look identifies each garment, while the prologue lightens its
    // fabric. Keep that finish on unchanged pieces when adding an accessory or
    // reloading a saved look; newly selected garments retain their own colors.
    await dress(draft,rig,parent,[],{figure,white:part=>whiteCinemaGarments.has(part.id)});
    if(!valid()){
     for(const part of draft.parts){part.obj.removeFromParent();part.obj.geometry.dispose();part.obj.material.map?.dispose();part.obj.material.dispose();}
     if(skin&&beforeIndex)skin.geometry.setIndex(beforeIndex);current=beforeWardrobe;last='';return false;
    }
    for(const part of before){
     part.obj.visible=false;
     if(!originalParts.includes(part)){part.obj.removeFromParent();part.obj.geometry.dispose();part.obj.material.map?.dispose();part.obj.material.dispose();}
    }
    actor.parts=draft.parts;current=draft.wardrobe;
    for(const part of actor.parts)if(part.source.multiplier)part.obj.material.color.fromArray(part.source.multiplier);
    actor.salonLook=figure.appearance;activate();return true;
   }catch(error){
    if(skin&&beforeIndex)skin.geometry.setIndex(beforeIndex);current=beforeWardrobe;last='';throw error;
   }
  },
  animate(blend,seat,dt=0,sampleTime){
   if(!active)return false;
   actor.phase=(actor.phase+dt*(1.02+blend*.1))%1;
   const time=Number.isFinite(sampleTime)?sampleTime:now(),express=actor.conversationPose;
   const stamp=Math.floor(time*(blend>.015||express?25:15))+'/'+(seat?.id||'')+'/'+Math.round(actor.sit*50)+'/'+Math.round(blend*100);
   if(stamp===last)return true;last=stamp;
   if(!seat&&blend>.015){solver.expression=express;solver.travelPose(actor.phase,blend,0);current.apply(solver.bones());}
   else current.apply(solver.sampleSalonPose(seat?.source||null,actor.sit,time,{gesture:express?.gesture,look:express?.look||0},1.075));
   actor.stamp='cinema/'+stamp;return true;
  },
  glide(altitude,tilt){
   if(!active)return false;
   const stamp='flight/'+Math.round(altitude*24)+'/'+Math.round(tilt*180);if(last===stamp)return true;last=stamp;
   solver.expression=null;solver.travelPose(0,0,tilt);current.apply(solver.bones());actor.stamp=stamp;return true;
  },
  headPosition(out=new T.Vector3()){
   rig[1].getWorldPosition(out);out.y+=.135;return out;
  },
  talk(p={},sampleTime){
   if(!active)return;
   const phase=((Number.isFinite(sampleTime)?sampleTime:now())+1.65)%5.1,blink=p.blink??(phase<.16?Math.sin(phase/.16*Math.PI):0);
   for(const object of mouth){
    const map=object.morphTargetDictionary,values=object.morphTargetInfluences;
    for(const [key,value] of Object.entries({Ouvrir:p.jaw||0,Decouvrir:(p.spread||0)*.18,SourireG:(p.spread||0)*.07,SourireD:(p.spread||0)*.07,Cligner:blink}))if(map[key]!==undefined)values[map[key]]=value;
   }
  }
 };
 actor.cinemaAhmed=controller;controller.animate(0,null);return controller;
}
