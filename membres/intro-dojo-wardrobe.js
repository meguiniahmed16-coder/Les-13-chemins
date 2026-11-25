import {loadStudio} from './studio-model.js';
import {referenceStudio} from './studio-look.js';
import * as T from 'three';
import {introOutfits,captureIntroAppearance,prepareIntroAppearance,createIntroCastActor} from './intro-wardrobe.js';
import {DOJO_CAST,dojoCastLook,dojoCastState,dojoCastPose,styleDojoCastFigure,styleDojoFabric} from './intro-dojo-cast.js';

// These are actual complete outfits from the current V27 wardrobe. Their
// labels are shared with the small on-screen demonstration panel.
export const DOJO_LOOKS=Object.freeze([
 {id:'original',label:'Blanc',color:'#eee8da',kind:'outfit',m:introOutfits.m,f:introOutfits.f},
 {id:'elegance',label:'Élégance',color:'#723e4a',kind:'outfit',
  description:'Ahmed : costume anthracite et cravate. Marianne : robe bordeaux.',
  m:{robe:'mhs-male_elegantsuit01',souliers:'mh438'},
  f:{robe:'mh1853',souliers:'mh1734'}},
 {id:'jardin',label:'Jardin',color:'#c4b18b',kind:'outfit',
  description:'Ahmed : chemise sable et pantalon bleu nuit. Marianne : haut sauge et jean bleu nuit.',
  m:{haut:'mh1800',bas:'mh1796',souliers:'mh438'},
  f:{haut:'mh22',bas:'mh391',souliers:'mh1734'},
  palette:{m:{mh1800:'#dfcda8',mh1796:'#41566f'},f:{mh22:'#7c9b8e',mh391:'#2d3f59'}}},
 {id:'dessous',label:'Dessous',color:'#496078',kind:'underwear',
  description:'Ahmed : T-shirt blanc et caleçon marine. Marianne : caraco ivoire et shorty marine.',
  m:{haut:'mh1416',culotte:'mh3462',souliers:'mh438'},
  f:{haut:'mh1726',culotte:'mh3461',souliers:'mh1734'},
  palette:{f:{mh1726:'#f1e8d6',mh3461:'#41566f'}}}
]);
export const DOJO_WARDROBE_CUES=Object.freeze([
 {at:0,index:0},{at:900,index:1},{at:2600,index:2},{at:4300,index:3},
 {at:6000,index:1},{at:7700,index:2},{at:9400,index:0}
]);
export function dojoWardrobeState(line,elapsed=0){
 const id=typeof line==='string'?line:line?.id,t=Math.max(0,elapsed);
 if(id==='dojo-vetements'){
  const lookIndex=DOJO_WARDROBE_CUES.findLast(cue=>t>=cue.at).index;
  return {lookIndex,bodyIndex:0,actor:t<6000?'m':'f',label:DOJO_LOOKS[lookIndex].label,...dojoCastState(id,t)};
 }
 const cast=dojoCastState(id,t),item=DOJO_CAST[cast.castIndex],bodyIndex=item?.face.body||0;
 return {lookIndex:0,bodyIndex,actor:item?.gender==='homme'?'m':'f',label:item?.label||DOJO_LOOKS[0].label,...cast};
}

// Recolour only the selected fabric, preserving its weave, seams and alpha.
// The decoded source image is shared by the asset cache and is never mutated.
export function styleDojoFigure(figure,index,id){
 return styleDojoFabric(figure,DOJO_LOOKS[index]?.palette?.[id]);
}
export function dojoLook(id,index=0,bodyIndex=0){
 const look=referenceStudio(id==='f'?'femme':'homme');
 look.outfit={...DOJO_LOOKS[index][id]};
 if(id==='f')look.face={...look.face,body:bodyIndex};
 return look;
}

// Only preparation is asynchronous. It adds hidden variants; the live duo and
// their saved appearances remain untouched. A frame switches cached geometry
// synchronously before the normal skeleton animation updates it.
export function createDojoWardrobe(people,{
 load=loadStudio,capture=captureIntroAppearance,prepareAppearance=prepareIntroAppearance,
 scene=people[0]?.root?.parent,center={x:0,z:0},floorY=-.003,prepareCast=createIntroCastActor
}={}){
 const originals=new Map(people.map(actor=>[actor.id,capture(actor)]));
 const variants=new Map(),active=new Map(people.map(actor=>[actor.id,'original']));
 const cast=[],hostVisibility=new Map();let activeCast=-1;
 let task=null,prepared=false,cancelled=false,generation=0;
 const originalState={lookIndex:0,bodyIndex:0,actor:'f',label:DOJO_LOOKS[0].label,castIndex:-1,castLabel:'',bodyLabel:''};
 let state={...originalState};
 function activate(actor,key){
  if(active.get(actor.id)===key)return;
  (key==='original'?originals.get(actor.id):variants.get(key)).activate();
  active.set(actor.id,key);
 }
 function originalsOnly(){
  for(const actor of people)activate(actor,'original');
  hideCast();
  state={...originalState};
 }
 function hideCast(){
  for(const item of cast)item.root.visible=false;
  for(const [actor,visible] of hostVisibility)actor.root.visible=visible;
  hostVisibility.clear();activeCast=-1;
 }
 function showCast(index,elapsed){
  if(!cast[index]){hideCast();return;}
  if(activeCast<0)for(const actor of people)hostVisibility.set(actor,actor.root.visible);
  for(const actor of people)actor.root.visible=false;
  cast.forEach((actor,i)=>{actor.root.visible=i===index;});activeCast=index;
  const actor=cast[index];actor.root.rotation.y=Math.PI;
  actor.pose(0,dojoCastPose(index,elapsed));
 }
 async function prepare(){
  if(cancelled)return false;if(prepared)return true;if(task)return task;
  const request=++generation;
  task=(async()=>{
   try{
    // Sequential loading limits temporary decode and deformation memory on
    // phones. Every upper/lower piece and its texture finish loading before
    // any complete variant can be activated, including the underwear sets.
    for(let index=1;index<DOJO_LOOKS.length;index++)for(const actor of people){
     const look=dojoLook(actor.id,index),figure=await load(look,actor.id==='f'?'femme':'homme');
     if(cancelled||request!==generation)return false;
     styleDojoFigure(figure,index,actor.id);
     const item=await prepareAppearance(actor,figure,{look,white:false});
     if(cancelled||request!==generation){item.dispose();return false;}
     variants.set(actor.id+':'+index,item);
    }
    if(scene)for(let index=0;index<DOJO_CAST.length;index++){
     const entry=DOJO_CAST[index],look=dojoCastLook(index),figure=await load(look,entry.gender);
     if(cancelled||request!==generation)return false;
     styleDojoCastFigure(figure,index);
     const root=new T.Group();root.name='Aperçu · '+entry.label;root.visible=false;
     root.position.set(center.x||0,floorY,(center.z||0)+.35);root.scale.setScalar(entry.gender==='femme'?1.04:1.075);scene.add(root);
     let item;
     try{item=await prepareCast(root,figure,{look,gender:entry.gender});}catch(error){root.removeFromParent();throw error;}
     if(cancelled||request!==generation){item.dispose();return false;}
     cast.push(item);
    }
    prepared=true;return true;
   }catch(error){
    for(const item of variants.values())item.dispose();variants.clear();for(const item of cast)item.dispose();cast.length=0;prepared=false;
    throw error;
   }finally{task=null;}
  })();return task;
 }
 return {
  get ready(){return prepared&&!cancelled;},
  get state(){return {...state,ready:prepared&&!cancelled};},
  get previewActor(){return activeCast>=0?cast[activeCast]:null;},
  prepare,
  apply(line,elapsed){
   if(cancelled||!prepared)return {...state,ready:false};
   const next=dojoWardrobeState(line,elapsed);
   for(const actor of people){
    const key=next.lookIndex?actor.id+':'+next.lookIndex:'original';
    activate(actor,key);
   }
   if(next.castIndex>=0)showCast(next.castIndex,elapsed);else hideCast();
   state=next;return {...state,ready:true};
  },
  // Used when skipping/leaving the introduction. In-flight preparation may
  // finish a download, but cannot later activate or attach a visible variant.
  restore(){
   cancelled=true;++generation;originalsOnly();
   for(const item of variants.values())item.dispose();variants.clear();for(const item of cast)item.dispose();cast.length=0;prepared=false;
  },
  dispose(){this.restore();}
 };
}
