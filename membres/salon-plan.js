// Coordinates internal to the V27 reference are centimetres. The member camera uses metres.
export const bounds = {minX:-3.01,maxX:3.01,minZ:-2.34,maxZ:2.60};
export const roomFocus = {x:-1.17,y:.89,z:-1.69};
export const seats=[
 ['sofa1','Canapé · côté étagères',450,-854,36,90,48],['sofa2','Canapé · milieu',449,-775,36,90,49],['sofa3','Canapé · côté baie',450,-694,36,90,48],
 ['chair','Fauteuil',639,-783,44,-90,54],
 ['west1','Chaise côté salon · 1',741,-813,40,90,35],['west2','Chaise côté salon · 2',742,-749,40,90,35],
 ['east1','Chaise côté buffet · 1',930,-814,40,-90,38],['east2','Chaise côté buffet · 2',931,-750,40,-90,38],
 ['end1','Chaise en bout · côté entrée',836,-923,40,0,38],['end2','Chaise en bout · côté baie',845,-632,40,180,38]
].map(([id,name,x,z,height,deg,gap])=>{
 const yaw=deg*Math.PI/180,depth=id==='sofa2'?7:id.startsWith('sofa')?9:id==='chair'?6:0;
 return {id,name,label:name,x:x-depth*Math.sin(yaw),z:z-depth*Math.cos(yaw),height,yaw,gap:gap+depth}
});
// Local armrest contact on the upholstered armchair. On the sofa the hands rest on the thighs.
// The original measured armrest contact is shared by Ahmed, Marianne and invited guests.
seats.find(seat=>seat.id==='chair').support={x:30,z:-55,height:56.9,side:1};
const blocks=[[392,482,-917,-636],[421,465,-956,-910],[516,586,-717,-607],[600,702,-834,-734],[796,874,-871,-696],[954,1015,-843,-721]];
for(const s of seats.slice(4))blocks.push([s.x-21,s.x+21,s.z-21,s.z+21]);
export function roomFree(x,z){
 if(x<399||x>1001||z< -1034||z> -581+(x-378)*.093-17)return false;
 return !blocks.some(([l,r,b,t])=>Math.hypot(Math.max(l-x,0,x-r),Math.max(b-z,0,z-t))<13.5);
}
export function roomClear(a,b){
 const n=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/3);
 for(let k=0;k<=n;k++){const f=k/(n||1);if(!roomFree(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f))return false}
 return true;
}
const roomDist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
let walkGrid;
export function roomPath(a,b){
 if(!roomFree(...a)||!roomFree(...b))return null;
 if(roomClear(a,b))return [a,b];
 const grid=7,cols=88,rows=75,idx=(i,j)=>j*cols+i;
 if(!walkGrid){
  walkGrid=new Array(cols*rows);
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const p=[399+i*grid,-1034+j*grid];if(roomFree(...p))walkGrid[idx(i,j)]=p}
 }
 const points=walkGrid;
 function nearest(p){
  const ci=Math.round((p[0]-399)/grid),cj=Math.round((p[1]+1034)/grid);let id=-1,d=Infinity;
  for(let radius=1;radius<=6&&id<0;radius++){
   for(let j=Math.max(0,cj-radius);j<=Math.min(rows-1,cj+radius);j++)for(let i=Math.max(0,ci-radius);i<=Math.min(cols-1,ci+radius);i++){
    const k=idx(i,j),q=points[k];if(!q)continue;const dd=roomDist(p,q);if(dd<d&&roomClear(p,q)){id=k;d=dd}
   }
  }
  return id;
 }
 const start=nearest(a),end=nearest(b);if(start<0||end<0)return null;
 const cost=new Float64Array(points.length).fill(Infinity),from=new Int32Array(points.length).fill(-1),closed=new Set(),open=new Set([start]);cost[start]=0;
 while(open.size){
  let cur=-1,best=Infinity;for(const i of open){const score=cost[i]+roomDist(points[i],points[end]);if(score<best){best=score;cur=i}}
  if(cur===end)break;open.delete(cur);closed.add(cur);
  for(const v of [-cols-1,-cols,-cols+1,-1,1,cols-1,cols,cols+1]){
   const k=cur+v;if(!points[k]||closed.has(k)||!roomClear(points[cur],points[k]))continue;
   const n=cost[cur]+roomDist(points[k],points[cur]);if(n>=cost[k])continue;
   cost[k]=n;from[k]=cur;open.add(k);
  }
 }
 if(!Number.isFinite(cost[end]))return null;
 const raw=[b];for(let i=end;i>=0;i=from[i])raw.push(points[i]);raw.push(a);raw.reverse();
 const out=[a];for(let i=0;i<raw.length-1;){let k=raw.length-1;while(k>i+1&&!roomClear(raw[i],raw[k]))k--;out.push(raw[k]);i=k}
 return out;
}

export function visiblePart(id,wx,wz){
 if(id===0||id===3||id===4)return wz>-.20;
 if(id===1||id===96||id===97||id===98)return wx<.22;
 if(id===2||id>=36&&id<=68)return wx>-.22;
 if(id>=7&&id<=21)return wz<.16;
 return true;
}
const seatParts = {80:'end1',81:'end1',83:'east1',84:'east1',85:'east2',86:'east2',87:'west2',90:'west2',92:'west1',93:'west1',94:'end2',95:'end2'};
export function seatForPart(part,worldZ){
 if(part>=23&&part<=33)return seats.slice(0,3).reduce((a,b)=>Math.abs(a.z-worldZ)<Math.abs(b.z-worldZ)?a:b);
 if(part>=186&&part<=196)return seats[3];
 return seats.find(s=>s.id===seatParts[part])||null;
}
