import {traits,pieces} from './studio-catalog.js';

export const slots={hauts:'haut',pantalons:'bas',jupes:'bas',robes:'robe',vestes:'veste',chaussures:'souliers',culottes:'culotte',collants:'collant',chaussettes:'chaussette',combinaisons:'robe',chapeaux:'chapeau',lunettes:'lunettes',gants:'gants',masques:'masque',bijoux:'bijou',accessoires:'accessoire'};
export const byId=new Map(pieces.map(p=>[p.id,p]));
export const skinSteps=[0,12,22,34,47,60,74,88,100];
const common=new Set(['mh2909','mh1416','mh807','mh1655','mh1732','mh438','mh153','mh3461','mh3462']);
// Every drawer includes a free entry. Keep the original paid choices on the companion plan.
for(const group of Object.keys(slots)){
  const first=pieces.find(p=>p.group===group&&!['mh1194','mh1203'].includes(p.id));
  if(first)common.add(first.id);
}
export const freePiece=id=>common.has(id);
export function freeTrait(key,i){
  if(key==='skin'||key==='iris')return true;
  if(key==='hair')return [1,7,9].includes(i);
  if(key==='face')return [0,3].includes(i);
  if(key==='pile')return [0,1,2].includes(i);
  return i===0||i===1;
}
const tone={clair:0,dore:34,brun:74,profond:100};
export function legacyStudio(avatar={}){
  const face=Object.fromEntries(traits.map(t=>[t.key,0]));
  Object.assign(face,{hair:({court:1,texture:7,afro:9,carre:2})[avatar.hair]??7,face:({doux:3,sculpte:2})[avatar.face]||0,beard:1,pile:2});
  const skinLevel=tone[avatar.skin]??22;
  face.skin=skinSteps.indexOf(skinLevel);
  const outfit={haut:({polo:'mh2909',coton:'mh1416','col-rond':'mh1203'})[avatar.top]||'mh2909',bas:avatar.bottom==='laine'?'mh1194':'mh807',souliers:'mh1732'};
  if(avatar.accessory&&avatar.accessory!=='aucun')outfit.lunettes='mh153';
  return {face,skinLevel,iris:'',outfit,denim:avatar.bottom==='jean-nuit',tortoise:avatar.accessory==='ecaille'};
}
export function normaliseStudio(value,plus,legacy){
  if(!value||typeof value!=='object')return legacyStudio(legacy);
  const base=legacyStudio(),face={};
  for(const t of traits){
    const n=value.face?.[t.key];face[t.key]=Number.isInteger(n)&&n>=0&&n<t.options.length&&(plus||freeTrait(t.key,n))?n:base.face[t.key];
  }
  const outfit={};
  for(const [slot,id] of Object.entries(value.outfit||{})){
    const p=byId.get(id);if(p&&slots[p.group]===slot&&(plus||freePiece(id)))outfit[slot]=id;
  }
  if(outfit.robe){delete outfit.haut;delete outfit.bas;}
  if(!outfit.bas&&!outfit.robe&&!outfit.culotte)outfit.culotte='mh3461';
  const skinLevel=Number.isInteger(value.skinLevel)?Math.max(0,Math.min(100,value.skinLevel)):22;
  face.skin=skinSteps.reduce((a,b,i)=>Math.abs(b-skinLevel)<Math.abs(skinSteps[a]-skinLevel)?i:a,0);
  return {face,skinLevel,iris:/^#[0-9a-f]{6}$/i.test(value.iris)?value.iris.toLowerCase():'',outfit,denim:Boolean(value.denim)&&outfit.bas==='mh807',tortoise:Boolean(value.tortoise)&&plus&&outfit.lunettes==='mh153'};
}
export function exactStudio(value,normal){
  const same=(a,b)=>Object.keys(a).length===Object.keys(b).length&&Object.keys(a).every(k=>Object.hasOwn(b,k)&&(a[k]&&typeof a[k]==='object'?b[k]&&typeof b[k]==='object'&&same(a[k],b[k]):a[k]===b[k]));
  return !!value&&typeof value==='object'&&same(value,normal);
}
