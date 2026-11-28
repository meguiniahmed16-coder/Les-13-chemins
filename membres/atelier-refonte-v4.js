import * as T from 'three';
const sources={
 f:{name:'marianne',bytes:494447,raw:857297,sha:'3179e1d93674f62a4500990f00caf0d037b092788313e6189d6d4e77c40e687d',counts:[100998,54983,885451]},
 m:{name:'ahmed',bytes:545710,raw:943098,sha:'3b617bea3a75990debe94536b9622d3c2eb62348cb0b7045a925ac07dce2b2f3',counts:[81567,118318,738328]}
};
const cache=new Map();
export async function loadRefonte(id,api){
 const conf=sources[id];if(!conf)throw Error('Personnage inconnu');if(cache.has(id))return cache.get(id);
 const res=await api('refonte-v6/'+conf.name),packed=await res.arrayBuffer();
 if(packed.byteLength!==conf.bytes)throw Error('Correction anatomique incomplète.');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',packed)),x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==conf.sha)throw Error('Intégrité de la correction anatomique invalide.');
 const raw=await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 const d=new DataView(raw);if(raw.byteLength!==conf.raw||d.getUint32(0,false)!==0x4e525636)throw Error('Format de correction anatomique invalide.');
 const n=d.getUint32(4,true),rows=d.getUint32(8,true),garmentCount=d.getUint32(12,true);
 if(n!==193||rows!==33||garmentCount!==17965)throw Error('Topologie de référence incompatible.');
 const f=i=>d.getFloat32(i,true),scale=f(16),anchor=new T.Vector3(f(20),f(24),f(28)),shift=new T.Vector3(f(32),f(36),f(40));let off=44;
 const floats=count=>{const a=new Float32Array(count);for(let i=0;i<count;i++)a[i]=f(off+i*4);off+=count*4;if(a.some(v=>!Number.isFinite(v)))throw Error('Coordonnées non finies.');return a;};
 const count=n*rows,position=floats(count*3),normal=floats(count*3),srgb=new Uint8Array(raw,off,count*3);off+=count*3;
 const color=new Float32Array(count*3);for(let i=0;i<color.length;i++){const v=srgb[i]/255;color[i]=v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}
 const cloth=floats(garmentCount*3),patches=[];
 for(let k=0;k<conf.counts.length;k++){const count=conf.counts[k],len=d.getUint32(off,true);off+=4;if(len>count||off+len*(k?28:16)>raw.byteLength)throw Error('Patch de peau incomplet.');const indices=new Uint32Array(len);for(let i=0;i<len;i++){indices[i]=d.getUint32(off+i*4,true);if(indices[i]>=count||(i&&indices[i]<=indices[i-1]))throw Error('Indices de peau invalides.');}off+=len*4;const normals=floats(len*3),positions=k?floats(len*3):null;patches.push({count,indices,normals,positions});}
 const fillCount=d.getUint32(off,true);off+=4;if(fillCount%3||fillCount>600||off+fillCount*4+conf.counts[0]!==raw.byteLength)throw Error('Coutures invalides.');const fill=new Uint32Array(fillCount);for(let i=0;i<fillCount;i++){fill[i]=d.getUint32(off+i*4,true);if(fill[i]>=garmentCount)throw Error('Sommet de couture invalide.');}off+=fillCount*4;
 const covered=new Uint8Array(raw,off,conf.counts[0]);off+=covered.length;if(covered.some(x=>x>1)||off!==raw.byteLength)throw Error('Masque textile invalide.');
 const value={n,rows,scale,anchor,shift,position,normal,color,cloth,patches,fill,covered};cache.set(id,value);return value;
}
export function applySkinNormals(a,patches){
 if(!patches?.length)return;
 const meshes=[a.body];a.head.traverse(o=>{if(o.isMesh&&/^Visage.source/i.test(o.name))meshes.push(o);});
 const targets=patches.map(p=>{const m=meshes.find(x=>x?.geometry?.attributes.position.count===p.count);const normal=m?.geometry.attributes.normal;if(!normal||p.indices.length*3!==p.normals.length||p.indices.some(i=>i>=normal.count))throw Error('Maillage de peau incompatible avec la correction.');if(p.positions&&p.positions.length!==p.indices.length*3)throw Error('Déplacement de peau incompatible.');return {normal,position:m.geometry.attributes.position,p};});
 for(const {normal,position,p} of targets){for(let i=0;i<p.indices.length;i++){const j=p.indices[i];normal.setXYZ(j,p.normals[i*3],p.normals[i*3+1],p.normals[i*3+2]);if(p.positions)position.setXYZ(j,position.getX(j)+p.positions[i*3],position.getY(j)+p.positions[i*3+1],position.getZ(j)+p.positions[i*3+2]);}normal.needsUpdate=true;if(p.positions)position.needsUpdate=true;}
}
export function installRefonte(a,r){
 if(a.garment.geometry.attributes.position.count*3!==r.cloth.length)throw Error('Le vêtement ne correspond pas au modèle de référence.');
 const geo=new T.BufferGeometry(),idx=[];
 for(let row=0;row<r.rows-1;row++)for(let i=0;i<r.n-1;i++){const q=row*r.n+i;idx.push(q,q+r.n,q+1,q+1,q+r.n,q+r.n+1);}
 geo.setAttribute('position',new T.BufferAttribute(r.position.slice(),3));geo.setAttribute('normal',new T.BufferAttribute(r.normal.slice(),3));geo.setAttribute('color',new T.BufferAttribute(r.color.slice(),3));geo.setIndex(idx);geo.computeVertexNormals();a.neckGeometricNormals=geo.attributes.normal.array.slice();geo.attributes.normal.array.set(r.normal);geo.attributes.normal.needsUpdate=true;geo.computeBoundingBox();geo.computeBoundingSphere();
 const mat=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.89,metalness:0,side:T.DoubleSide});mat.name='Peau · continuité cervicale V6';
 const old=a.neck.geometry;a.neck.geometry=geo;old.dispose();a.neck.material=mat;a.materials.set(mat,mat.color.clone());a.neck.frustumCulled=false;
 a.head.position.sub(r.anchor).multiplyScalar(r.scale).add(r.anchor).add(r.shift);a.head.scale.multiplyScalar(r.scale);a.head.updateMatrix();
 applySkinNormals(a,r.patches);
 if(r.fill?.length){const old=a.garment.geometry.index.array,all=new Uint32Array(old.length+r.fill.length);all.set(old);all.set(r.fill,old.length);a.garment.geometry.setIndex(new T.BufferAttribute(all,1));}
 if(r.covered?.length){const geo=a.body.geometry,full=geo.index,ids=full.array,keep=[];for(let i=0;i<ids.length;i+=3)if(!(r.covered[ids[i]]&&r.covered[ids[i+1]]&&r.covered[ids[i+2]]))keep.push(ids[i],ids[i+1],ids[i+2]);a.fullBodyIndex=full;a.dressedBodyIndex=new T.BufferAttribute(new Uint32Array(keep),1);}
 a.neckBase=r.position.slice();a.refonte=r;a.kimonoFit=r.cloth;
}
export function applyRefonteNeck(a,b,low,high){
 const r=a.refonte,geo=a.neck.geometry,pos=geo.attributes.position,norm=geo.attributes.normal,n=r.n,rows=r.rows;
 const from=new T.Vector3(),upper=new T.Vector3(),offset=new T.Vector3(),p=new T.Vector3(),center=new T.Vector3();
 const dl=[],dh=[];let change=0;
 for(let i=0;i<n;i++){from.fromArray(r.position,i*3);const l=low[i].clone().sub(from);dl.push(l);from.fromArray(r.position,((rows-1)*n+i)*3);const h=high[i].clone().sub(from);dh.push(h);change=Math.max(change,l.length(),h.length());}
 const width=b.neckWidth??1,depth=b.neckDepth??1;
 for(let row=0;row<rows;row++){const t=row/(rows-1),e=Math.sin(Math.PI*t),start=row*n;center.set(0,0,0);for(let i=0;i<n-1;i++)center.add(from.fromArray(r.position,(start+i)*3));center.multiplyScalar(1/(n-1));
  for(let i=0;i<n;i++){const j=start+i;from.fromArray(r.position,j*3);upper.copy(from).applyMatrix4(a.neckDelta).sub(from);offset.copy(dl[i]).multiplyScalar(1-t).addScaledVector(upper,t);p.copy(from).add(offset);p.x+=(from.x-center.x)*(width-1)*e;p.z+=(from.z-center.z)*(depth-1)*e;pos.setXYZ(j,p.x,p.y,p.z);}
 }
 pos.needsUpdate=true;
 if(change<.00005&&Math.abs(width-1)<1e-6&&Math.abs(depth-1)<1e-6){norm.array.set(r.normal);norm.needsUpdate=true;}
 else{geo.computeVertexNormals();const tmp=new T.Vector3(),old=new T.Vector3(),corrected=new T.Vector3(),turn=new T.Quaternion();if(a.neckGeometricNormals)for(let i=0;i<norm.count;i++){old.fromArray(a.neckGeometricNormals,i*3).normalize();p.fromBufferAttribute(norm,i).normalize();if(old.lengthSq()>.9&&p.lengthSq()>.9){turn.setFromUnitVectors(old,p);corrected.fromArray(r.normal,i*3).applyQuaternion(turn).normalize();norm.setXYZ(i,corrected.x,corrected.y,corrected.z);}}for(let row=0;row<rows;row++){const i=row*n,j=i+n-1;p.fromBufferAttribute(norm,i).add(tmp.fromBufferAttribute(norm,j)).normalize();norm.setXYZ(i,p.x,p.y,p.z);norm.setXYZ(j,p.x,p.y,p.z);}norm.needsUpdate=true;}
 geo.computeBoundingBox();geo.computeBoundingSphere();
}
