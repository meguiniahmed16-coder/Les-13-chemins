import {generateAppearance} from './starting-appearance.js?v=salon43';
import {skinSteps} from './studio-look.js';
import {seats} from './salon-plan.js';
import {cameraProjection} from './salon-navigation.js?v=salon35';

export function guestAppearance(person){
  let seed=Math.imul(Number(person.id)+1279,2654435761)>>>0;
  function random(){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    return seed/4294967296;
  }
  // Unspecified features belong to the illustration, not the character's biography.
  const gender=person.clerical?'homme':person.gender||(random()<.5?'femme':'homme');
  const age=person.age??(1+Math.floor(random()*2));
  const {studio}=generateAppearance(gender,age,true,random);
  Object.assign(studio.face,person.face);
  if(person.skinLevel!=null){
    studio.skinLevel=person.skinLevel;
    studio.face.skin=skinSteps.reduce((closest,tone,i)=>Math.abs(tone-person.skinLevel)<Math.abs(skinSteps[closest]-person.skinLevel)?i:closest,0);
  }
  // The wrap skirt's open mesh separates above the knees in the seated rig.
  if(studio.outfit.bas==='mh417')studio.outfit.bas='mh1728';
  if(person.clerical){
    studio.clerical=person.clerical;
    const garments=person.clerical==='soutane-vert-canard'?{robe:'mh225',col:'roman-collar'}:{haut:'clergy-shirt',bas:'mh1796'};
    studio.outfit={...garments,souliers:'mh620'};
  }
  if(person.glasses)studio.outfit.lunettes='mh153';
  return {gender,studio};
}
const pairIds=[['sofa2','chair'],['west1','east1'],['west2','east2'],['end1','end2']];
export function conversationSeats(random=Math.random){
  const i=random()<.5?0:1+Math.floor(random()*3);
  const pair=pairIds[i].map(id=>seats.find(s=>s.id===id));
  return random()<.5?pair:pair.reverse();
}
// Use the rig's head joint so the framing follows both sitting and standing poses.
export function actorHead(m){
  const b=m.bones(),x=b[28]+b[20]*1.68,y=b[29]+b[21]*1.68,z=b[30]+b[22]*1.68;
  const c=Math.cos(m.yaw),s=Math.sin(m.yaw);
  return {x:m.x+c*x+s*z,y,z:m.z-s*x+c*z};
}
export function frameConversation(camera,mode,who,player,guest,w,h,wideAngle){
  if(!w||!h)return;
  const baseScale=Math.min(2/3.8,2*w/(h*4.7)),aspect=w/h;
  const dx=guest.x-player.x,dz=guest.z-player.z,distance=Math.hypot(dx,dz);
  camera.follow=false;
  if(mode==='wide'||distance<.65){
    const lateral=Math.abs(Math.cos(wideAngle)*dx-Math.sin(wideAngle)*dz);
    Object.assign(camera,{x:(player.x+guest.x)/2,y:Math.max(player.y,guest.y)*.56,z:(player.z+guest.z)/2,
      angle:wideAngle,pitch:.24,zoom:Math.min(.78,1.55*aspect/(lateral+1.15))/baseScale,perspective:0,nearDepth:0});
    return;
  }
  const speaker=who==='guest'?guest:player,listener=who==='guest'?player:guest;
  // Both cameras stay on the same side of the line between the actors.
  const direction=Math.atan2(listener.x-speaker.x,listener.z-speaker.z);
  const sign=who==='guest'?1:-1;
  const scale=Math.min(1.93,2.9*aspect),eyeDistance=distance+1.32;
  const lean=Math.asin(Math.min(.62,Math.max(.11,.60*aspect/(scale*distance))));
  const angle=direction+sign*lean,pitch=.09;
  const offset=-sign*.31*aspect/scale;
  const nearDepth=distance*Math.cos(lean)*Math.cos(pitch)+.42;
  const belowHead=Math.max(.04,Math.min(.36,(1-2*59/h)/scale));
  Object.assign(camera,{angle,pitch,x:speaker.x+offset*Math.cos(angle),y:speaker.y-belowHead,
    z:speaker.z-offset*Math.sin(angle),zoom:scale/baseScale,perspective:1/eyeDistance,nearDepth});
}
export function headSide(head,camera,w,h){
  const p=cameraProjection(w,h,false,camera),dx=head.x-p.x,dz=head.z-p.z;
  const depth=p.cp*(p.sy*dx+p.cy*dz)+p.sp*(head.y-p.y);
  return (p.cy*dx-p.sy*dz)/Math.max(.05,1-depth*p.perspective);
}
export const searchName=value=>value.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('fr').trim();
