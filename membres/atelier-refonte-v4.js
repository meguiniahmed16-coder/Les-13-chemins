import * as T from 'three';
const sources={
 f:{name:'marianne',bytes:289589,sha:'2aa97b43def42351b7b6d49da2ae23e7c2c0a84fbcc0f02870790240e2ebe938'},
 m:{name:'ahmed',bytes:291562,sha:'b4e0ed71fede2eb5271f4f6aa434cc297215720c22f3bf07b4b511cf5a05ab6b'}
};
const cache=new Map();
export async function loadRefonte(id,api){
 const conf=sources[id];if(!conf)throw Error('Personnage inconnu');if(cache.has(id))return cache.get(id);
 const res=await api('refonte/'+conf.name),packed=await res.arrayBuffer();
 if(packed.byteLength!==conf.bytes)throw Error('Correction anatomique incomplète.');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',packed)),x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==conf.sha)throw Error('Intégrité de la correction anatomique invalide.');
 const raw=await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 const d=new DataView(raw);if(raw.byteLength!==387587||d.getUint32(0,false)!==0x4e525634)throw Error('Format de correction anatomique invalide.');
 const n=d.getUint32(4,true),rows=d.getUint32(8,true),garmentCount=d.getUint32(12,true);
 if(n!==193||rows!==33||garmentCount!==17965)throw Error('Topologie de référence incompatible.');
 const f=i=>d.getFloat32(i,true),scale=f(16),anchor=new T.Vector3(f(20),f(24),f(28)),shift=new T.Vector3(f(32),f(36),f(40));let off=44;
 const floats=count=>{const a=new Float32Array(count);for(let i=0;i<count;i++)a[i]=f(off+i*4);off+=count*4;if(a.some(v=>!Number.isFinite(v)))throw Error('Coordonnées non finies.');return a;};
 const count=n*rows,position=floats(count*3),normal=floats(count*3),srgb=new Uint8Array(raw,off,count*3);off+=count*3;
 const color=new Float32Array(count*3);for(let i=0;i<color.length;i++){const v=srgb[i]/255;color[i]=v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}
 const cloth=floats(garmentCount*3);if(off!==raw.byteLength)throw Error('Longueur de correction incorrecte.');
 const value={n,rows,scale,anchor,shift,position,normal,color,cloth};cache.set(id,value);return value;
}
export function installRefonte(a,r){
 if(a.garment.geometry.attributes.position.count*3!==r.cloth.length)throw Error('Le vêtement ne correspond pas au modèle de référence.');
 const geo=new T.BufferGeometry(),idx=[];
 for(let row=0;row<r.rows-1;row++)for(let i=0;i<r.n-1;i++){const q=row*r.n+i;idx.push(q,q+r.n,q+1,q+1,q+r.n,q+r.n+1);}
 geo.setAttribute('position',new T.BufferAttribute(r.position.slice(),3));geo.setAttribute('normal',new T.BufferAttribute(r.normal.slice(),3));geo.setAttribute('color',new T.BufferAttribute(r.color.slice(),3));geo.setIndex(idx);geo.computeBoundingBox();geo.computeBoundingSphere();
 const mat=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.89,metalness:0,side:T.DoubleSide});mat.name='Peau · cou reconstruit V4';
 const old=a.neck.geometry;a.neck.geometry=geo;old.dispose();a.neck.material=mat;a.materials.set(mat,mat.color.clone());a.neck.frustumCulled=false;
 a.head.position.sub(r.anchor).multiplyScalar(r.scale).add(r.anchor).add(r.shift);a.head.scale.multiplyScalar(r.scale);a.head.updateMatrix();
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
 else{geo.computeVertexNormals();const tmp=new T.Vector3();for(let row=0;row<rows;row++){const i=row*n,j=i+n-1;p.fromBufferAttribute(norm,i).add(tmp.fromBufferAttribute(norm,j)).normalize();norm.setXYZ(i,p.x,p.y,p.z);norm.setXYZ(j,p.x,p.y,p.z);}norm.needsUpdate=true;}
 geo.computeBoundingBox();geo.computeBoundingSphere();
}
