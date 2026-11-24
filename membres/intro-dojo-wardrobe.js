import {loadStudio} from './studio-model.js';
import {referenceStudio} from './studio-look.js';
import {introOutfits,captureIntroAppearance,prepareIntroAppearance} from './intro-wardrobe.js';

// These are actual complete outfits from the current V27 wardrobe. Their
// labels are shared with the small on-screen demonstration panel.
export const DOJO_LOOKS=Object.freeze([
 {id:'original',label:'Blanc',color:'#eee8da',m:introOutfits.m,f:introOutfits.f},
 {id:'ville',label:'Ville',color:'#495e73',
  m:{haut:'mh1799',bas:'mh1194',veste:'mh1265',souliers:'mh438'},
  f:{haut:'mh1158',bas:'mh1727',souliers:'mh1734'}},
 {id:'detente',label:'Détente',color:'#bd825d',
  m:{haut:'mh2909',bas:'mh1655',souliers:'mh438'},
  f:{haut:'mh1338',bas:'mh1728',souliers:'mh1734'}}
]);
export function dojoWardrobeState(line,elapsed=0){
 const id=typeof line==='string'?line:line?.id,t=Math.max(0,elapsed);
 if(id==='dojo-vetements'){
  const lookIndex=t<1200?0:t<3600?1:t<6000?2:t<8000?1:t<10000?2:0;
  return {lookIndex,bodyIndex:0,actor:t<6000?'m':'f',label:DOJO_LOOKS[lookIndex].label};
 }
 const bodyIndex=id==='dojo-apparence'&&t>=1800&&t<6500?3:0;
 return {lookIndex:0,bodyIndex,actor:id==='dojo-personnaliser'&&t<2700?'m':'f',label:DOJO_LOOKS[0].label};
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
    // phones. There are four spare outfits and one real body-shape variant.
    for(const index of [1,2])for(const actor of people){
     const look=dojoLook(actor.id,index),figure=await load(look,actor.id==='f'?'femme':'homme');
     if(cancelled||request!==generation)return false;
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
