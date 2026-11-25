// One draw per sitting. Keep the previous draw per actor to avoid immediate repetition.
export const seatedPostures=['cuisses','chevilles','genou','penchee','mains-jointes','appui'];
export function choosePosture(seat,previous,random=Math.random){
  const dining=/^(east|west|end)/.test(seat.id);
  const choices=seatedPostures.filter(p=>p!==previous?.kind&&(p!=='appui'||(dining&&tabletop(seat).forward<29)||seat.support));
  return {kind:choices[Math.floor(random()*choices.length)],side:random()<.5?-1:1};
}
export function tabletop(seat,scale=1){
  if(!/^(east|west|end)/.test(seat.id))return null;
  const x=(seat.x-700)/100,z=(seat.z+800)/100,s=Math.sin(seat.yaw),c=Math.cos(seat.yaw);
  // Measured bounds of the table in the published room. The fingers extend over the edge.
  const edge=Math.abs(s)>.5?((s>0?.959:1.737)-x)/s:((c>0?-.707:.944)-z)/c;
  return {height:64/scale,forward:(edge*100-seat.gap)/scale};
}
