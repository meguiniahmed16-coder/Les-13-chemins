import {normaliseStudio} from './studio-look.js?v=incarnations33';

const outfitKey=look=>JSON.stringify([Object.entries(look.outfit).sort(([a],[b])=>a.localeCompare(b)),look.denim,look.tortoise]);

async function currentAuthor(fetcher){
 const response=await fetcher('/api/membres/me?auteur=1',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error('Reconnecte-toi à ton administration pour inspecter le corps.');
 return response.json();
}

// Shares the component's render generations: a wardrobe choice, reset or account
// change can cancel an inspection without changing the saved/dressed appearance.
export function createSalonInspection({context,ready,connected,serial,load,prepare,fetcher=(...args)=>fetch(...args)}){
 const previews=new Map();
 const allowed=(slot,gender)=>{
  const owner=context();
  return Boolean(owner.author&&!owner.temporary&&owner.authorRoom&&owner.memberKey!=null
   &&(slot==='m'&&gender==='homme'||slot==='f'&&gender==='femme'));
 };
 const active=slot=>previews.has(slot);
 function reset(slot){++serial[slot];previews.delete(slot);}
 function clear(){for(const slot of Object.keys(serial))reset(slot);}
 async function dress(slot,look,gender,{inspection}={}){
  const id=++serial[slot],account=context().memberKey;
  const valid=()=>connected()&&serial[slot]===id&&String(context().memberKey)===String(account);
  const scene=await ready();if(!scene||!valid())return false;
  const owner=Boolean(context().author);
  const previous=previews.get(slot),next=normaliseStudio(look,true,undefined,gender,{owner});
  const inspecting=inspection===true||(inspection===undefined&&Boolean(previous)&&next.face.age!==5&&outfitKey(next)===previous.outfit);
  if(inspecting){
   if(!allowed(slot,gender))throw Error('L’inspection du corps est réservée à ton salon administrateur.');
   if(next.face.age===5)throw Error('L’inspection du corps est réservée aux personnages adultes.');
   if(inspection===true||!previous){
    const owner=await currentAuthor(fetcher);
    if(!valid())return false;
    if(!owner.author||String(owner.id)!==String(account))throw Error('Rouvre ce salon depuis ton compte auteur.');
   }
  }
  if(!valid())return false;
  if(!inspecting&&!previous&&scene.wearing(slot,look))return true;
  const visible=inspecting?normaliseStudio({...next,outfit:{}},true,undefined,gender,{inspection:true,owner}):look;
  const figure=await load(visible,gender,inspecting?{inspection:true}:undefined);
  if(!valid())return false;
  if(inspecting&&figure.inspection!==true)throw Error('L’inspection du corps n’a pas pu être confirmée.');
  if(inspecting&&!allowed(slot,gender))throw Error('Rouvre ce salon depuis ton compte auteur.');
  if(inspecting&&!previous&&prepare(scene,slot)!==true)throw Error('Le personnage n’a pas pu rejoindre l’espace d’inspection.');
  if(!valid())return false;
  const applied=await scene.dress(slot,figure,gender,valid);
  if(applied===false||!valid())return false;
  if(inspecting)previews.set(slot,{outfit:outfitKey(next)});else previews.delete(slot);
  return applied;
 }
 return {allowed,active,reset,clear,dress,
  toggle:(slot,look,gender)=>dress(slot,look,gender,{inspection:!active(slot)})
 };
}
