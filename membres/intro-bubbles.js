// The text stays in one place for a complete reply. Only its small pointer
// follows the speaker; a moving camera must never flip the reading position.
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function rectanglesOverlap(a,b){return a.l<b.r&&a.r>b.l&&a.t<b.b&&a.b>b.t;}
export function transformFace(rect,width,height,projection){
 const k=projection.scale,dx=(1-k)*width/2,dy=projection.shift;
 return {l:rect.l*k+dx,r:rect.r*k+dx,t:rect.t*k+dy,b:rect.b*k+dy};
}
export function planSpeechBubble({width:w,height:h,bubbleWidth:bw,bubbleHeight:bh,face,faces,obstacles=[],reserve=false}){
 const pad=14,gap=22,cx=(face.l+face.r)/2,cy=(face.t+face.b)/2;
 const candidates=[
  [cx-bw/2,face.t-bh-gap,'above'],
  [face.r+gap,cy-bh/2,'right'],[face.l-bw-gap,cy-bh/2,'left'],
  [pad,pad,'above'],[w-bw-pad,pad,'above'],[(w-bw)/2,pad,'above'],
  [cx-bw/2,face.b+gap,'below'],
  [pad,h-bh-pad,'below'],[w-bw-pad,h-bh-pad,'below'],
 ];
 if(!reserve){
  const available=candidates.map(([x,y,side])=>{
   const l=clamp(x,pad,Math.max(pad,w-bw-pad)),t=clamp(y,pad,Math.max(pad,h-bh-pad));
   const rect={l,t,r:l+bw,b:t+bh};
   const safety={l:l-8,t:t-8,r:l+bw+8,b:t+bh+8};
   return {...rect,side,score:Math.hypot(l+bw/2-cx,t+bh/2-cy)+(side==='below'?32:0),safe:![...faces,...obstacles].some(f=>rectanglesOverlap(safety,f))};
  }).filter(p=>p.safe).sort((a,b)=>a.score-b.score);
  if(available.length)return {...available[0],projection:{scale:1,shift:0}};
 }
 // A tight portrait close-up gets breathing room above the faces. This changes
 // the framing once, beneath the same in-scene bubble, never into a footer.
 const top=Math.min(0,...faces.map(f=>f.t)),bottom=Math.max(h,...faces.map(f=>f.b));
 const bottomLimit=w<h&&obstacles.length?Math.min(h-pad,...obstacles.map(rect=>rect.t-pad)):h-pad;
 const reserved=pad+bh+gap,scale=Math.max(.08,(bottomLimit-reserved)/(bottom-top));
 const projection={scale:Math.min(1,scale),shift:reserved-top*Math.min(1,scale)};
 const anchor=transformFace(face,w,h,projection),l=clamp((anchor.l+anchor.r-bw)/2,pad,Math.max(pad,w-bw-pad));
 return {l,t:pad,r:l+bw,b:pad+bh,side:'above',projection};
}
