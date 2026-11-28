import * as T from 'three';
const specs={
 f:{name:'marianne',bytes:213710,sha:'a8f8102e2cda76c2d4fb75deba3d68aa19c09060340299c47a05330138fcc680'},
 m:{name:'ahmed',bytes:217452,sha:'f2bd1f03e534bd1e0bcaa2e40d9ee37d3ab79de8aed499360bca4c42d8b78171'}
};
export function decodeScan(raw){
 const d=new DataView(raw);
 if(raw.byteLength!==381264||d.getUint32(0,false)!==0x4b4d5231||d.getUint32(4,true)!==4395||d.getUint32(8,true)!==24993)throw Error('Scan original incompatible.');
 const n=4395,k=24993;let off=12;
 const read=(Type,count)=>{const v=new Type(raw,off,count).slice();off+=v.byteLength;return v;};
 const position=read(Float32Array,n*3),normal=read(Float32Array,n*3),joints=read(Uint16Array,n*4),weights=read(Float32Array,n*4),index=read(Uint32Array,k),source=read(Uint32Array,n),rest=read(Float32Array,n*3);
 if(off!==raw.byteLength||position.some(v=>!Number.isFinite(v))||normal.some(v=>!Number.isFinite(v))||rest.some(v=>!Number.isFinite(v))||index.some(v=>v>=n)||source.some(v=>v>=5002)||joints.some(v=>v>=15)||weights.some((v,i)=>!Number.isFinite(v)||v<0||v>1.00001||((joints[i]===4||joints[i]===7)&&v>1e-7)))throw Error('Géométrie ou poids du scan invalides.');
 for(let i=0;i<n;i++){let sum=0;for(let j=0;j<4;j++)sum+=weights[4*i+j];if(Math.abs(sum-1)>1e-5)throw Error('Poids du scan non normalisés.');}
 return {position,normal,joints,weights,index,source,rest};
}
export async function loadScan(id,api){
 const spec=specs[id];if(!spec)throw Error('Personnage inconnu');
 const packed=await(await api('kimono-source/'+spec.name)).arrayBuffer();
 if(packed.byteLength!==spec.bytes)throw Error('Scan incomplet.');
 const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',packed)),v=>v.toString(16).padStart(2,'0')).join('');
 if(sha!==spec.sha)throw Error('Intégrité du scan incorrecte.');
 const raw=await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 return decodeScan(raw);
}
export function installScan(a,data){
 const geo=new T.BufferGeometry();
 for(const [name,arr,size] of [['position',data.position,3],['normal',data.normal,3],['skinIndex',data.joints,4],['skinWeight',data.weights,4]])geo.setAttribute(name,new T.BufferAttribute(arr,size));
 geo.setIndex(new T.BufferAttribute(data.index,1));geo.computeBoundingBox();geo.computeBoundingSphere();
 const mat=new T.MeshStandardMaterial({color:new T.Color(.94,.94,.93),metalness:0,roughness:.9,side:T.DoubleSide});mat.name='Kimono blanc · scan FBX original';
 const scan=new T.SkinnedMesh(geo,mat),old=a.garment;scan.name='Kimono original · transfert de poids';scan.position.copy(old.position);scan.quaternion.copy(old.quaternion);scan.scale.copy(old.scale);scan.frustumCulled=false;old.parent.add(scan);a.root.updateMatrixWorld(true);scan.bind(a.body.skeleton,old.bindMatrix.clone());scan.bindMode=old.bindMode;scan.visible=false;a.scan=scan;
 return scan;
}
