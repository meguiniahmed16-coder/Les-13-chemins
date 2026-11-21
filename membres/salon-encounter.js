import {generateAppearance} from './starting-appearance.js?v=salon33';
import {skinSteps} from './studio-look.js';
import {seats} from './salon-plan.js';
import {cameraProjection} from './salon-navigation.js?v=salon33';

export function guestAppearance(person){
  let seed=Math.imul(Number(person.id)+1279,2654435761)>>>0;
  function random(){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    return seed/4294967296;
  }
  // Unspecified features belong to the illustration, not the character's biography.
  const gender=person.gender||(random()<.5?'femme':'homme');
  const age=person.age??(1+Math.floor(random()*2));
  const {studio}=generateAppearance(gender,age,true,random);
  Object.assign(studio.face,person.face);
  if(person.skinLevel!=null){
    studio.skinLevel=person.skinLevel;
    studio.face.skin=skinSteps.reduce((closest,tone,i)=>Math.abs(tone-person.skinLevel)<Math.abs(skinSteps[closest]-person.skinLevel)?i:closest,0);
  }
  // The wrap skirt's open mesh separates above the knees in the seated rig.
  if(studio.outfit.bas==='mh417')studio.outfit.bas='mh1728';
  if(person.glasses)studio.outfit.lunettes='mh153';
  return {gender,studio};
}
const pairIds=[['sofa2','chair'],['west1','east1'],['west2','east2'],['end1','end2']];
export function conversationSeats(random=Math.random){
  const i=random()<.5?0:1+Math.floor(random()*3);
  const pair=pairIds[i].map(id=>seats.find(s=>s.id===id));
  return random()<.5?pair:pair.reverse();
}
export function framePair(camera,[a,b],w,h){
  const x=(a.x+b.x)/200-7,z=(a.z+b.z)/200+8;
  const span=Math.hypot(a.x-b.x,a.z-b.z)/100;
  const scale=Math.min(2/3.8,2*w/(h*4.7));
  // Frame the open side of the room in either seating order.
  const angle=Math.abs(a.x-b.x)>Math.abs(a.z-b.z)?-.09:1.48;
  Object.assign(camera,{x,z,y:1.25,pitch:.23,angle,
    zoom:Math.min(2.35,1.55/(scale*1.9),1.32*w/(h*scale*span)),follow:false});
}
export function headPoint(m,camera,w,h){
  // The rig's head pivot moves back and down as the hips settle into a seat.
  const b=m.bones(),px=b[28]+b[20]*1.73,py=b[29]+b[21]*1.73,pz=b[30]+b[22]*1.73;
  const c=Math.cos(m.yaw),s=Math.sin(m.yaw);
  const p=cameraProjection(w,h,false,camera),dx=m.x+c*px+s*pz-p.x,dz=m.z-s*px+c*pz-p.z;
  const scale=h*p.factor/2;
  return {x:w/2+scale*(p.cy*dx-p.sy*dz),y:h/2-scale*(p.cp*(py-p.y)-p.sp*(p.sy*dx+p.cy*dz))};
}
export const searchName=value=>value.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('fr').trim();
