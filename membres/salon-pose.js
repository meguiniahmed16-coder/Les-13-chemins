// Same 15 pivots as the Summer Man reference. Distances are metres in the
// character's local coordinates: feet near y=0, y up and z facing forward.
export const POSE_BONES = 15;
const hips = [0,.858,-.021], ribs = [0,1.09,-.033], neck = [0,1.40,-.033];
const arm = [[.173,1.336,-.053],[.2861,1.1231,-.0321],[.4067,.9411,-.009]];
const leg = [[.091,.858,-.021],[.124664,.472046,-.024319],[.157455,.078552,-.018594]];
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

const clamp=(v,low,high)=>Math.min(high,Math.max(low,v));
const mix=(a,b,t)=>a+(b-a)*t;
const blend=(a,b,t)=>[mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t)];
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const scale=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const length=a=>Math.sqrt(dot(a,a));
const unit=a=>scale(a,1/(length(a)||1));
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const ident=[1,0,0,0,1,0,0,0,1];
const smooth=t=>t*t*(3-2*t);
const tau=2*Math.PI;
const mirror=(v,s)=>[s*v[0],v[1],v[2]];
function vector(r,v){
  return [r[0]*v[0]+r[3]*v[1]+r[6]*v[2],r[1]*v[0]+r[4]*v[1]+r[7]*v[2],r[2]*v[0]+r[5]*v[1]+r[8]*v[2]];
}
function rotation(yaw,pitch,roll){
  const s=Math.sin(yaw),c=Math.cos(yaw),t=Math.sin(pitch),d=Math.cos(pitch),e=Math.sin(roll),f=Math.cos(roll);
  return [c*f+s*t*e,d*e,-s*f+c*t*e,-c*e+s*t*f,d*f,s*e+c*t*f,s*d,-t,c*d];
}
function align(from,to){
  const u=unit(from),v=unit(to),[x,y,z]=cross(u,v),c=clamp(dot(u,v),-1,1);
  if(c<-.99999){
    const axis=unit(cross(u,Math.abs(u[0])<.8?[1,0,0]:[0,1,0]));
    const [a,b,d]=axis;
    return [2*a*a-1,2*a*b,2*a*d,2*b*a,2*b*b-1,2*b*d,2*d*a,2*d*b,2*d*d-1];
  }
  const k=1/(1+c);
  return [c+x*x*k,z+y*x*k,-y+z*x*k,-z+x*y*k,c+y*y*k,x+z*y*k,y+x*z*k,-x+y*z*k,c+z*z*k];
}
function write(out,id,r,pivot,placed) {
  const i=id*16,t=sub(placed,vector(r,pivot));
  out.set([r[0],r[1],r[2],0,r[3],r[4],r[5],0,r[6],r[7],r[8],0,t[0],t[1],t[2],1],i);
}
function follow(r,origin,placed,p){return add(placed,vector(r,sub(p,origin)));}

// Two-segment IK keeps the thigh/shin and upper/lower arm lengths constant.
// The bend guide selects the forward knee or rear-facing elbow solution.
function reach(start,end,guide,l1,l2) {
  const delta=sub(end,start),raw=length(delta),axis=unit(delta);
  const d=clamp(raw,Math.abs(l1-l2)+1e-5,l1+l2-1e-5);
  const along=(l1*l1+d*d-l2*l2)/(2*d);
  const outward=unit(sub(guide,scale(axis,dot(axis,guide))));
  return [add(add(start,scale(axis,along)),scale(outward,Math.sqrt(Math.max(0,l1*l1-along*along)))),add(start,scale(axis,d))];
}
function stride(fraction){
  const t=fraction-Math.floor(fraction),planted=.57,step=.29;
  if(t<planted)return {z:step*(.5-t/planted),lift:0,roll:0};
  const s=(t-planted)/(1-planted),lift=Math.sin(Math.PI*s)**2;
  return {z:step*(smooth(s)-.5),lift:.057*lift,roll:.19*Math.sin(tau*s)*Math.sin(Math.PI*s)};
}

const rest=new Float32Array(16*POSE_BONES);
for(let i=0;i<POSE_BONES;i++)write(rest,i,ident,[0,0,0],[0,0,0]);

// phase is one full stride in radians. seatHeight is measured above the shoe
// soles. armrest optionally selects the character's local -1 or +1 side.
export function poseMatrices({phase=0,gait=0,sit=0,seatHeight=.43,armrest=0}={}) {
  const seated=clamp(sit,0,1),walk=clamp(gait,0,1)*(1-seated);
  if(walk<1e-6&&seated<1e-6)return rest;
  const out=new Float32Array(16*POSE_BONES);
  const wave=Math.sin(phase),twice=Math.cos(2*phase),bend=Math.sin(Math.PI*seated);
  const height=clamp(seatHeight,.26,.65);
  const hip=[.011*walk*wave+.004*seated,mix(hips[1],height+.079,seated)-walk*(.025+.009*twice),hips[2]+.022*bend];
  const pitch=.32*bend-.055*seated+.023*walk;
  const torso=rotation(.045*walk*wave,pitch,-.021*walk*wave+.02*seated);
  const chest=rotation(-.045*walk*wave-.033*seated,pitch-.10*bend+.012*seated,.016*walk*wave-.013*seated);
  const rib=follow(torso,hips,hip,ribs),head=follow(chest,ribs,rib,neck);
  write(out,0,torso,hips,hip);write(out,14,chest,ribs,rib);
  write(out,1,rotation(-.010*walk*wave,.32*pitch,.004*walk*wave),neck,head);
  for(const side of [-1,1]){
    const [a,b,c]=leg.map(p=>mirror(p,side)),[shoulder,elbow,hand]=arm.map(p=>mirror(p,side));
    const foot=stride(phase/tau+(side<0?0:.5));
    const hipJoint=follow(torso,hips,hip,a),shoulderJoint=follow(chest,ribs,rib,shoulder);
    const target=[c[0]-side*.038*walk+side*.009*seated,c[1]+walk*foot.lift,c[2]+walk*foot.z+seated*(.34+.020*side)];
    const restPole=unit(sub(sub(b,a),scale(unit(sub(c,a)),dot(sub(b,a),unit(sub(c,a))))));
    const active=clamp(walk+seated,0,1);
    const [knee,ankle]=reach(hipJoint,target,blend(restPole,[side*.14,0,1],active),length(sub(b,a)),length(sub(c,b)));
    const legBone=side<0?8:11;
    write(out,legBone,align(sub(b,a),sub(knee,hipJoint)),a,hipJoint);
    write(out,legBone+1,align(sub(c,b),sub(ankle,knee)),b,knee);
    write(out,legBone+2,rotation(side*.065*seated,walk*foot.roll,0),c,ankle);
    const walkingHand=[side*.25,.885+.011*Math.abs(wave),.042-.57*foot.z];
    const reachingArmrest=side===armrest;
    const onSeat=reachingArmrest?[side*.29,height+.18,-.005]:
      [knee[0]-.019*side,knee[1]+.060,knee[2]-(side<0?.135:.103)];
    const palm=blend(blend(hand,walkingHand,walk),onSeat,seated);
    palm[1]+=.035*bend;palm[2]+=.05*bend;
    const armAxis=unit(sub(hand,shoulder)),armPole=unit(sub(sub(elbow,shoulder),scale(armAxis,dot(sub(elbow,shoulder),armAxis))));
    const [joint,wrist]=reach(shoulderJoint,palm,blend(armPole,[.65*side,-.12,-1],active),length(sub(elbow,shoulder)),length(sub(hand,elbow)));
    const upper=align(sub(elbow,shoulder),sub(joint,shoulderJoint)),lower=align(sub(hand,elbow),sub(wrist,joint));
    const armBone=side<0?2:5;
    write(out,armBone,upper,shoulder,shoulderJoint);write(out,armBone+1,lower,elbow,joint);
    // Let the fingers point along the thigh as the elbow folds.
    const fingers=unit([side*.31,-.95,.01]);
    const handAxis=unit(blend(vector(lower,fingers),[side*-.10,-.20,.975],seated));
    write(out,armBone+2,align(fingers,handAxis),hand,wrist);
  }
  return out;
}

// Canvas skinning counterpart to the vertex shader. Reuse out for each vertex.
export function poseVertex(out,mats,weights,index,x,y,z,nx,ny,nz) {
  if(mats===rest){out[0]=x;out[1]=y;out[2]=z;out[3]=nx;out[4]=ny;out[5]=nz;return out;}
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
