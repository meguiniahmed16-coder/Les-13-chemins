import {loadStudio} from './studio-model.js';
import {referenceStudio} from './studio-look.js';
import {introOutfits,captureIntroAppearance,prepareIntroAppearance} from './intro-wardrobe.js';

// These are actual complete outfits from the current V27 wardrobe. Their
// labels are shared with the small on-screen demonstration panel.
export const DOJO_LOOKS=Object.freeze([
 {id:'original',label:'Blanc',color:'#eee8da',kind:'outfit',m:introOutfits.m,f:introOutfits.f},
 {id:'elegance',label:'Élégance',color:'#723e4a',kind:'outfit',
  description:'Ahmed : costume anthracite et cravate. Marianne : robe bordeaux.',
  m:{robe:'mhs-male_elegantsuit01',souliers:'mh438'},
  f:{robe:'mh1853',souliers:'mh1734'}},
 {id:'jardin',label:'Jardin',color:'#c4b18b',kind:'outfit',
  description:'Ahmed : chemise sable et pantalon bleu nuit. Marianne : robe florale.',
  m:{haut:'mh1800',bas:'mh1796',souliers:'mh438'},
  f:{robe:'mh1640',souliers:'mh1734'},
  palette:{m:{mh1800:'#dfcda8',mh1796:'#41566f'}}},
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
  return {lookIndex,bodyIndex:0,actor:t<6000?'m':'f',label:DOJO_LOOKS[lookIndex].label};
 }
 const bodyIndex=id==='dojo-apparence'&&t>=1800&&t<6500?3:0;
 return {lookIndex:0,bodyIndex,actor:id==='dojo-personnaliser'&&t<2700?'m':'f',label:DOJO_LOOKS[0].label};
}

// Recolour only the selected fabric, preserving its weave, seams and alpha.
// The decoded source image is shared by the asset cache and is never mutated.
export function styleDojoFigure(figure,index,id){
 const palette=DOJO_LOOKS[index]?.palette?.[id];if(!palette)return figure;
 for(const part of figure.meshes||[]){
  const color=palette[part.id];if(!part.binding||!color)continue;
  const rgb=[1,3,5].map(at=>parseInt(color.slice(at,at+2),16)),source=part.image,data=new Uint8ClampedArray(source.data);
  for(let k=0;k<data.length;k+=4){
   const luminance=(.2126*source.data[k]+.7152*source.data[k+1]+.0722*source.data[k+2])/255;
   const shade=.62+.38*Math.pow(luminance,.65);
   for(let channel=0;channel<3;channel++)data[k+channel]=Math.round(rgb[channel]*shade);
  }
  part.image={...source,data};
 }
 return figure;
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
 load=loadStudio,capture=captureIntroAppearance,prepareAppearance=prepareIntroAppearance
}={}){
 const originals=new Map(people.map(actor=>[actor.id,capture(actor)]));
 const variants=new Map(),active=new Map(people.map(actor=>[actor.id,'original']));
 let task=null,prepared=false,cancelled=false,generation=0;
 const originalState={lookIndex:0,bodyIndex:0,actor:'f',label:DOJO_LOOKS[0].label};
 let state={...originalState};
 function activate(actor,key){
  if(active.get(actor.id)===key)return;
  (key==='original'?originals.get(actor.id):variants.get(key)).activate();
  active.set(actor.id,key);
 }
 function originalsOnly(){
  for(const actor of people)activate(actor,'original');
  state={...originalState};
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
    const actor=people.find(p=>p.id==='f');
    if(actor){
     const look=dojoLook('f',0,3),figure=await load(look,'femme');
     if(cancelled||request!==generation)return false;
     const item=await prepareAppearance(actor,figure,{look,white:true});
     if(cancelled||request!==generation){item.dispose();return false;}
     variants.set('f:body3',item);
    }
    prepared=true;return true;
   }catch(error){
    for(const item of variants.values())item.dispose();variants.clear();prepared=false;
    throw error;
   }finally{task=null;}
  })();return task;
 }
 return {
  get ready(){return prepared&&!cancelled;},
  get state(){return {...state,ready:prepared&&!cancelled};},
  prepare,
  apply(line,elapsed){
   if(cancelled||!prepared)return {...state,ready:false};
   const next=dojoWardrobeState(line,elapsed);
   for(const actor of people){
    const key=actor.id==='f'&&next.bodyIndex===3?'f:body3':next.lookIndex?actor.id+':'+next.lookIndex:'original';
    activate(actor,key);
   }
   state=next;return {...state,ready:true};
  },
  // Used when skipping/leaving the introduction. In-flight preparation may
  // finish a download, but cannot later activate or attach a visible variant.
  restore(){
   cancelled=true;++generation;originalsOnly();
   for(const item of variants.values())item.dispose();variants.clear();prepared=false;
  },
  dispose(){this.restore();}
 };
}
