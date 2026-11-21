import {randomAvatar} from './avatar-catalog.js?v=salon33';
import {traits} from './studio-catalog.js';
import {freeTrait,normaliseStudio,traitAvailable} from './studio-look.js';

export const validGender=value=>value==='homme'||value==='femme';
export function yearsAt(birth,date=new Date()){
  const today=date.toISOString().slice(0,10);
  return Number(today.slice(0,4))-Number(birth.slice(0,4))-(today.slice(5)<birth.slice(5)?1:0);
}
export function visualAge(birth,date){
  const years=yearsAt(birth,date);
  if(years<18)return 5;
  if(years<30)return 0;
  if(years<40)return 1;
  if(years<50)return 2;
  return years<65?3:4;
}

// Choose ordinary, complete outfits for arrival. The full wardrobe is available in the drawer.
export function startingAppearance(gender,birth,plus=false){
  return generateAppearance(gender,visualAge(birth),plus);
}
export function generateAppearance(gender,age,plus,random=Math.random){
  const pick=items=>items[Math.floor(random()*items.length)];
  const avatar=randomAvatar(random),face={};
  for(const trait of traits){
    if(!traitAvailable(trait.key,gender))continue;
    const choices=trait.options.map((_,index)=>index).filter(i=>plus||freeTrait(trait.key,i));
    face[trait.key]=pick(choices);
  }
  face.age=age;
  if(face.age===5){face.beard=0;face.pile=0;}
  const outfit={haut:pick(plus?['mh1431','mh1416','mh2909','mh1800','mh1661','mh1808']:['mh1431','mh1416','mh2909']),
    bas:pick(plus?['mh807','mh1655','mh1796','mh1626','mh1194']:['mh807','mh1655']),souliers:pick(['mh1732','mh438','mh1743'])};
  if(gender==='femme'){
    outfit.haut=pick(plus?['mh22','mh1158','mh1338','mh1416']:['mh22','mh1158','mh1416']);
    outfit.bas=pick(plus?['mh807','mh1728','mh2800','mh1727','mh417']:['mh807','mh1728','mh1727']);
    outfit.souliers=pick(plus?['mh1734','mh1738','mh438']:['mh1734','mh438']);
    if(random()<.2){delete outfit.haut;delete outfit.bas;outfit.robe=plus?pick(['mh1640','mh1853']):'mh1640';}
  }
  if(random()<.22)outfit.lunettes='mh153';
  const studio=normaliseStudio({face,skinLevel:Math.floor(random()*101),outfit,denim:random()<.5},plus,avatar,gender);
  return {...avatar,studio};
}
