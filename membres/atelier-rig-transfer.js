import * as T from 'three';

// Weight transfer on registered surfaces, never on matching vertex numbers.
// The returned validity mask is a hard gate: far/oppositely oriented points
// must be registered again or inpainted on the target mesh before binding.
export function projectSkinWeights(source,target,{maxDistance=.035,minNormalDot=.5,cellSize=.03,regions=null}={}){
 if(!(cellSize>0&&maxDistance>0&&Number.isFinite(cellSize)&&Number.isFinite(maxDistance)))throw Error('Distance de correspondance invalide');
 const sp=source.attributes.position,sn=source.attributes.normal,si=source.attributes.skinIndex,sw=source.attributes.skinWeight,idx=source.index?.array,tp=target.attributes.position,tn=target.attributes.normal;
 if(!sp||!sn||!si||!sw||!idx||!tp||!tn||si.count!==sp.count||sw.count!==sp.count)throw Error('Surfaces orientées et poids source requis');
 const key=(x,y,z)=>x+','+y+','+z,grid=new Map(),v=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();
 const box=new T.Box3(),lo=new T.Vector3(),hi=new T.Vector3();
 for(let i=0;i<idx.length;i+=3){box.makeEmpty();for(let j=0;j<3;j++){if(idx[i+j]>=sp.count)throw Error('Triangle source invalide');box.expandByPoint(v.fromBufferAttribute(sp,idx[i+j]));}lo.copy(box.min).divideScalar(cellSize).floor();hi.copy(box.max).divideScalar(cellSize).floor();
  for(let x=lo.x;x<=hi.x;x++)for(let y=lo.y;y<=hi.y;y++)for(let z=lo.z;z<=hi.z;z++){const k=key(x,y,z);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(i);}
 }
 const n=tp.count,joints=new Uint16Array(n*4),weights=new Float32Array(n*4),accepted=new Uint8Array(n),distance=new Float32Array(n);distance.fill(Infinity);
 const normal=new T.Vector3(),proj=new T.Vector3(),bc=new T.Vector3(),nn=new T.Vector3(),tmp=new T.Vector3(),bestBC=new T.Vector3(),tri=new T.Triangle(a,b,c);
 const candidates=new Set();let count=0;const radius=Math.ceil(maxDistance/cellSize);
 for(let i=0;i<n;i++){
  v.fromBufferAttribute(tp,i);normal.fromBufferAttribute(tn,i).normalize();if(![v.x,v.y,v.z].every(Number.isFinite))throw Error('Coordonnée cible invalide');
  const x0=Math.floor(v.x/cellSize),y0=Math.floor(v.y/cellSize),z0=Math.floor(v.z/cellSize);
  candidates.clear();for(let x=x0-radius;x<=x0+radius;x++)for(let y=y0-radius;y<=y0+radius;y++)for(let z=z0-radius;z<=z0+radius;z++)for(const k of grid.get(key(x,y,z))||[])candidates.add(k);
  let best=-1,bestD=maxDistance*maxDistance;
  for(const k of candidates){
   if(regions&&!regions(i,idx[k],idx[k+1],idx[k+2]))continue;
   a.fromBufferAttribute(sp,idx[k]);b.fromBufferAttribute(sp,idx[k+1]);c.fromBufferAttribute(sp,idx[k+2]);
   tri.closestPointToPoint(v,proj);const d=v.distanceToSquared(proj);if(d>bestD)continue;
   const q=tri.getBarycoord(proj,bc);if(!q||bc.x<-.00001||bc.y<-.00001||bc.z<-.00001)continue;
   nn.set(0,0,0);for(let j=0;j<3;j++)nn.addScaledVector(tmp.fromBufferAttribute(sn,idx[k+j]),bc.getComponent(j));nn.normalize();
   if(nn.dot(normal)<minNormalDot)continue;
   best=k;bestD=d;bestBC.copy(bc);
  }
  if(best<0)continue;
  const map=new Map();for(let j=0;j<3;j++){const vertex=idx[best+j],fraction=Math.max(0,bestBC.getComponent(j));for(let k=0;k<4;k++){const w=sw.getComponent(vertex,k)*fraction,bone=si.getComponent(vertex,k);if(w>0)map.set(bone,(map.get(bone)||0)+w);}}
  const ranked=[...map].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=ranked.reduce((v,x)=>v+x[1],0);if(!(sum>0))continue;
  for(let k=0;k<ranked.length;k++){joints[i*4+k]=ranked[k][0];weights[i*4+k]=ranked[k][1]/sum;}
  accepted[i]=1;distance[i]=Math.sqrt(bestD);count++;
 }
 return {joints,weights,accepted,distance,coverage:count/n,matched:count,total:n};
}
export function applyTransferredWeights(target,transfer){
 if(transfer.total!==target.attributes.position.count||transfer.matched!==transfer.total||transfer.accepted.some(v=>v!==1))throw Error('Correspondances incomplètes : transfert refusé');
 target.setAttribute('skinIndex',new T.Uint16BufferAttribute(transfer.joints,4));target.setAttribute('skinWeight',new T.Float32BufferAttribute(transfer.weights,4));
}
