// Stable local positions leave room for independent steps between neighbours.
export function crowdLayout(count,halfWidth,depth,seed,paired=false){
 let state=seed;
 const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
 const slots=[];
 for(let i=0;i<count;i++){
  let x,back;
  for(let attempt=0;attempt<70;attempt++){
   x=(random()*2-1)*halfWidth;back=random()*depth;
   if(paired&&(i===0||i===4)){x=i===0?-1.95:1.95;back=.75;break;}
   if(paired&&Math.abs(Math.abs(x)-1.95)<.9&&back<1.55)continue;
   if(slots.every(p=>Math.hypot(x-p.x,back-p.back)>.99))break;
  }
  slots.push({x,back,phase:random()*Math.PI*2,pace:.68+random()*.67,turn:(random()-.5)*.56});
 }
 return slots;
}
export function crowdMotion(slot,time){
 const t=slot.phase+time*slot.pace;
 return {side:.23*Math.sin(t*.74)+.09*Math.sin(t*1.9),forward:.24*Math.sin(t*.92),
  yaw:slot.turn+.27*Math.sin(t*.63),sway:.026*Math.sin(t*1.42),bob:.018*(1+Math.sin(t*2.2)),
  stride:(1+Math.sin(t*3.9))*.5,
  lift:Math.min(1,Math.max(0,(Math.sin(t*.96+slot.phase)-.16)*2.2))};
}
export function cordonPosition(id,count){
 const columns=count>15?6:5,row=Math.floor(id/columns),rankSize=Math.min(columns,count-row*columns);
 return {x:(id%columns-(rankSize-1)/2)*2.20+(row%2?.57:-.25),z:row*1.9+(id%2)*.16};
}
