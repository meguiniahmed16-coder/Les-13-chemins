/* Barcelone — logique pure, distincte de la scène 3D.
 * Cinq ventes uniques à 2 points et aucune vente conditionnée par l'orientation.
 * Les points définitifs restent contrôlés par le plateau parent.
 */
export const PARK=Object.freeze({width:24,length:122,walkWidth:10});
export const CLIENTS=Object.freeze([
 Object.freeze({id:'c1',name:'Client 1',x:-4.4,z:15,color:0xc7829a}),
 Object.freeze({id:'c2',name:'Client 2',x:5.2,z:36,color:0x7cae88}),
 Object.freeze({id:'c3',name:'Client 3',x:-5.2,z:58,color:0xe3bd62}),
 Object.freeze({id:'c4',name:'Client 4',x:5.4,z:83,color:0x9792c8}),
 Object.freeze({id:'c5',name:'Client 5',x:-2.6,z:107,color:0xe0a17c})
]);
// Dialogues courts propres aux cinq rencontres, sans changer le barème.
export const SALE_DIALOGUES=Object.freeze({
 c1:Object.freeze([{speaker:'client',text:'C’est combien ?'},{speaker:'vendeur',text:'20.'}]),
 c2:Object.freeze([{speaker:'client',text:'C’est du bon ?'},{speaker:'vendeur',text:'C’est de la frappe.'}]),
 c3:Object.freeze([{speaker:'client',text:'C’est trop cher.'},{speaker:'vendeur',text:'C’est le prix.'}]),
 c4:Object.freeze([{speaker:'client',text:'Dépêche-toi, il y a des flics !'},{speaker:'vendeur',text:'T’inquiète.'}]),
 c5:Object.freeze([{speaker:'client',text:'Il t’en reste ?'},{speaker:'vendeur',text:'Oui, tiens.'}])
});
export const POLICE_SHOUTS=Object.freeze(['¡Gilipollas!','¡Vuelve aquí!']);
export const saleDialogue=id=>SALE_DIALOGUES[id]||null;
export const PATROLS=Object.freeze([
 Object.freeze({id:'p1',homeX:2.6,homeZ:47,offset:0}),
 Object.freeze({id:'p2',homeX:-2.5,homeZ:91,offset:2.3})
]);
export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function newRun(previousSold=[]){
 const known=new Set(CLIENTS.map(c=>c.id));
 const sold=[...new Set(previousSold.filter(id=>known.has(id)))];
 return {phase:'ready',x:0,z:2,facing:0,clock:0,sold,events:[],dodgeTime:0,dodgeCooldown:0,
  police:PATROLS.map(p=>({id:p.id,x:p.homeX,z:p.homeZ,homeX:p.homeX,homeZ:p.homeZ,offset:p.offset,chasing:false})),
  steps:0};
}
export function nearestClient(run,range=4.3){
 const remaining=CLIENTS.filter(c=>!run.sold.includes(c.id));
 return remaining.reduce((best,c)=>{
  const d=distance(run,c);
  return d<=range&&(!best||d<best.distance)?{client:c,distance:d}:best;
 },null);
}
export function sell(run){
 if(run.phase!=='running')return {reason:'inactive'};
 const near=nearestClient(run);
 if(!near)return {reason:'far'};
 const c=near.client;
 if(run.sold.includes(c.id))return {reason:'sold'};
 run.sold.push(c.id);
 run.events.push({type:'sale',clientId:c.id,points:2});
 if(run.sold.length===CLIENTS.length){run.phase='won';run.events.push({type:'won'});}
 return {client:c,points:2,finished:run.phase==='won'};
}
export function dodge(run){
 if(run.phase!=='running'||run.dodgeCooldown>0)return false;
 run.dodgeTime=.86;
 run.dodgeCooldown=2.35;
 run.events.push({type:'dodge'});
 return true;
}
export function advance(run,dt,input={}){
 if(run.phase!=='running')return;
 const t=clamp(Number(dt)||0,0,.08);
 run.clock+=t;
 run.dodgeTime=Math.max(0,run.dodgeTime-t);
 run.dodgeCooldown=Math.max(0,run.dodgeCooldown-t);
 const x=clamp(Number(input.x)||0,-1,1),z=clamp(Number(input.z)||0,-1,1);
 const magnitude=Math.hypot(x,z),moving=magnitude>.12;
 if(moving){
  const speed=run.dodgeTime>0?9.2:5.8;
  run.x=clamp(run.x+x/magnitude*speed*t,-PARK.walkWidth,PARK.walkWidth);
  run.z=clamp(run.z+z/magnitude*speed*t,.4,PARK.length-2);
  run.facing=Math.atan2(x,z);
  run.steps+=t*(speed/5.8);
 }
 for(const p of run.police){
  const homeX=p.homeX+Math.sin(run.clock*.52+p.offset)*2.3;
  const homeZ=p.homeZ+Math.cos(run.clock*.47+p.offset)*3.5;
  const gap=distance(run,p);
  // Ils poursuivent brièvement lorsqu'on s'approche, mais sont moins rapides
  // que le joueur : changer d'allée ou esquiver suffit pour leur échapper.
  p.chasing=gap<7.3&&run.dodgeTime===0;
  const target=p.chasing?run:{x:homeX,z:homeZ};
  const dx=target.x-p.x,dz=target.z-p.z,dist=Math.hypot(dx,dz);
  if(dist>.01){
   const step=Math.min(dist,(p.chasing?2.6:1.6)*t);
   p.x+=dx/dist*step;p.z+=dz/dist*step;
  }
  if(distance(run,p)<1.35&&run.dodgeTime===0){
   run.phase='caught';run.events.push({type:'caught',policeId:p.id});break;
  }
 }
}
export function instruction(run){
 if(run.phase==='ready')return {key:'ready',text:'Trouve cinq clients'};
 if(run.phase==='caught')return {key:'caught',text:'Interpellé · Réessaie'};
 if(run.phase==='won')return {key:'won',text:'Cinq clients servis !'};
 const near=nearestClient(run);
 if(near)return {key:'sell-'+near.client.id,text:'Rouge : Vendre'};
 const police=run.police.find(p=>distance(run,p)<7);
 if(police)return {key:'police',text:'Évite la police !'};
 const next=CLIENTS.find(c=>!run.sold.includes(c.id));
 return {key:next?'find-'+next.id:'finish',text:next?'Repère un client ◆':'Cinq clients servis !'};
}
