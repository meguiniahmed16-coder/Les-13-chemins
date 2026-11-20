// Same 15 pivots as the Summer Man reference. Distances are metres in the
// character's local coordinates: feet near y=0, y up and z facing forward.
export const POSE_BONES = 15;
const headMeshes = new Set(['yeux','sourcils','cils','court','texture','afro','carre','dents','lunettes']);
const rigidHeads = new Map();
let bindings, pending;
const url = new URL('../assets/membres/salon-rig.bin',import.meta.url);

export function loadPoseWeights() {
  if(bindings)return Promise.resolve();
  return pending ??= (async () => {
    const response=await fetch(url);
    if(!response.ok)throw new Error('Le squelette du personnage est indisponible.');
    const bytes=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    const data=new Uint8Array(bytes), view=new DataView(bytes), decoder=new TextDecoder();
    if(decoder.decode(data.subarray(0,4))!=='MSR1')throw new Error('Le squelette du personnage est illisible.');
    const result=new Map();
    let at=5;
    for(let i=0;i<data[4];i++){
      const length=data[at++],name=decoder.decode(data.subarray(at,at+length));at+=length;
      const count=view.getUint32(at,true);at+=4;
      if(!count||at+8*count>data.length)throw new Error('Les attaches du modèle sont incomplètes.');
      result.set(name,data.subarray(at,at+8*count));at+=8*count;
    }
    if(at!==data.length)throw new Error('Les attaches du modèle sont illisibles.');
    bindings=result;
  })().catch(error=>{pending=null;throw error;});
}

// Each record consists of four joint indices followed by four normalized bytes.
// The clothes borrow the same weighted bone influences as their three anchor
// vertices on the original MakeHuman body. Only weights for public meshes ship.
export function buildPoseWeights(name, packedPositions) {
  const count=packedPositions.byteLength/8, weighted=bindings?.get(name);
  if(weighted?.length===count*8)return weighted;
  if(!headMeshes.has(name))throw new Error('Les attaches de cette pièce ne correspondent pas au modèle.');
  if(!rigidHeads.has(count)){
    const weights=new Uint8Array(count*8);
    for(let i=0;i<count;i++){weights[8*i]=1;weights[8*i+4]=255;}
    rigidHeads.set(count,weights);
  }
  return rigidHeads.get(count);
}

// Canvas skinning counterpart to the vertex shader. Reuse out for each vertex.
export function poseVertex(out,mats,weights,index,x,y,z,nx,ny,nz) {
  const i=index*8;
  let px=0,py=0,pz=0,n0=0,n1=0,n2=0;
  for(let j=0;j<4;j++){
    const byte=weights[i+4+j];if(!byte)break;
    const k=16*weights[i+j],w=byte/255;
    px+=w*(mats[k]*x+mats[k+4]*y+mats[k+8]*z+mats[k+12]);
    py+=w*(mats[k+1]*x+mats[k+5]*y+mats[k+9]*z+mats[k+13]);
    pz+=w*(mats[k+2]*x+mats[k+6]*y+mats[k+10]*z+mats[k+14]);
    n0+=w*(mats[k]*nx+mats[k+4]*ny+mats[k+8]*nz);
    n1+=w*(mats[k+1]*nx+mats[k+5]*ny+mats[k+9]*nz);
    n2+=w*(mats[k+2]*nx+mats[k+6]*ny+mats[k+10]*nz);
  }
  out[0]=px;out[1]=py;out[2]=pz;out[3]=n0;out[4]=n1;out[5]=n2;return out;
}
