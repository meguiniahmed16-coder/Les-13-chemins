// The female reference removes one small pelvic patch from the shared body.
// Close that known boundary only for the separately authorized adult inspection.
// Every new face uses existing boundary vertices: position, UV and rig stay intact.
const invalid = () => new Error('Le contour du corps féminin ne permet pas une inspection complète.');
const cross2 = (a,b,c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const onSegment = (a,b,p) => cross2(a,b,p)===0 && p[0]>=Math.min(a[0],b[0]) && p[0]<=Math.max(a[0],b[0]) && p[1]>=Math.min(a[1],b[1]) && p[1]<=Math.max(a[1],b[1]);
function intersects(a,b,c,d){
 const x=cross2(a,b,c),y=cross2(a,b,d),z=cross2(c,d,a),w=cross2(c,d,b);
 return x*y<0&&z*w<0 || x===0&&onSegment(a,b,c) || y===0&&onSegment(a,b,d) || z===0&&onSegment(c,d,a) || w===0&&onSegment(c,d,b);
}
function inside(point,polygon){
 let yes=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];
  if(onSegment(a,b,point))return false;
  if((a[1]>point[1])!==(b[1]>point[1]) && point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;
 }
 return yes;
}
function triangulate(loop,position){
 const n=loop.length,points=loop.map(id=>[position[3*id],position[3*id+2]]);
 // XZ is a simple polygon for this curved boundary; projecting onto its best
 // fit plane would fold its two sides over each other. Keep all original y's.
 for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
  if(j===i+1 || i===0&&j===n-1)continue;
  if(intersects(points[i],points[(i+1)%n],points[j],points[(j+1)%n]))throw invalid();
 }
 const area=points.reduce((sum,a,i)=>{const b=points[(i+1)%n];return sum+a[0]*b[1]-b[0]*a[1];},0),direction=Math.sign(area);
 if(!direction)throw invalid();
 const valid=new Uint8Array(n*n),distance=new Float64Array(n*n);
 for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
  let allowed=j===i+1 || i===0&&j===n-1;
  if(!allowed){
   allowed=inside([(points[i][0]+points[j][0])/2,(points[i][1]+points[j][1])/2],points);
   for(let k=0;allowed&&k<n;k++){
    const next=(k+1)%n;
    if(k===i||k===j||next===i||next===j)continue;
    if(intersects(points[i],points[j],points[k],points[next]))allowed=false;
   }
  }
  valid[i*n+j]=allowed?1:0;
  for(let axis=0;axis<3;axis++)distance[i*n+j]+=(position[3*loop[i]+axis]-position[3*loop[j]+axis])**2;
 }
 // Minimize the total squared length of 3D edges. This connects nearby points
 // across the narrow opening instead of spanning its curved length with a fan.
 const costs=new Float64Array(n*n).fill(Infinity),split=new Int16Array(n*n).fill(-1);
 for(let i=0;i<n-1;i++)costs[i*n+i+1]=0;
 for(let width=2;width<n;width++)for(let i=0;i+width<n;i++){
  const j=i+width,index=i*n+j;if(!valid[index])continue;
  for(let k=i+1;k<j;k++){
   if(cross2(points[i],points[k],points[j])*direction<=0)continue;
   const cost=costs[i*n+k]+costs[k*n+j]+distance[i*n+k]+distance[k*n+j]+distance[index];
   if(cost<costs[index]){costs[index]=cost;split[index]=k;}
  }
 }
 if(!Number.isFinite(costs[n-1]))throw invalid();
 const faces=[],pending=[[0,n-1]];
 while(pending.length){
  const [i,j]=pending.pop();if(j-i<2)continue;
  const k=split[i*n+j];if(k<=i||k>=j)throw invalid();
  faces.push(loop[i],loop[k],loop[j]);pending.push([i,k],[k,j]);
 }
 return faces;
}

export function inspectionFemaleBodyFaces(mesh){
 const {faces,position,weld}=mesh;
 if(!(faces instanceof Uint16Array)||!position||!weld||position.length!==3*weld.length||faces.length%3)throw invalid();
 const edges=new Map();
 for(let i=0;i<faces.length;i+=3)for(let j=0;j<3;j++){
  const a=faces[i+j],b=faces[i+(j+1)%3],u=weld[a],v=weld[b];
  if(u===v)continue;
  const key=Math.min(u,v)*65536+Math.max(u,v),edge=edges.get(key);
  if(edge)edge.count++;else edges.set(key,{a,u,v,count:1});
 }
 const boundary=Array.from(edges.values()).filter(edge=>edge.count===1);
 if(!boundary.length)return faces.slice();
 // This is a repair of the known female asset, not a generic hole filler.
 if(boundary.length!==58)throw invalid();
 const next=new Map();
 for(const edge of boundary){if(next.has(edge.u))throw invalid();next.set(edge.u,edge);}
 const loop=[],seen=new Set(),first=boundary[0].u;let current=first;
 do{
  const edge=next.get(current);if(!edge||seen.has(current))throw invalid();
  seen.add(current);loop.push(edge.a);current=edge.v;
 }while(current!==first);
 if(loop.length!==boundary.length)throw invalid();
 for(const id of loop){
  const x=position[3*id],y=position[3*id+1],z=position[3*id+2];
  if(!Number.isFinite(x+y+z)||Math.abs(x)>300||y<7000||y>9000||Math.abs(z)>1000)throw invalid();
 }
 // Boundary edges belong to existing outward faces. Reverse them so each
 // shared edge has opposite directions in the original and closing surface.
 const patch=triangulate(loop.reverse(),position),closed=new Uint16Array(faces.length+patch.length);
 closed.set(faces);closed.set(patch,faces.length);return closed;
}
