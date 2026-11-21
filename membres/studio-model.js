import {resource,pixels} from './studio-assets.js';
import {material} from './studio-materials.js';
import {poseVertex} from './salon-pose.js';
const hairList=['hair','QueueHaute','Carre','LongOndule','TresseCote','bob02','short01','short02','short03','afro01'];
const smoothStep=(a,b,t)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
function normals(p,faces,weld,out,sum=new Float32Array(p.length)){
 sum.fill(0);
 for(let i=0;i<faces.length;i+=3){
  const a=faces[i]*3,b=faces[i+1]*3,c=faces[i+2]*3;
  const ax=p[b]-p[a],ay=p[b+1]-p[a+1],az=p[b+2]-p[a+2],bx=p[c]-p[a],by=p[c+1]-p[a+1],bz=p[c+2]-p[a+2];
  const x=ay*bz-az*by,y=az*bx-ax*bz,z=ax*by-ay*bx;
  for(let j=i;j<i+3;j++){const k=3*(weld?weld[faces[j]]:faces[j]);sum[k]+=x;sum[k+1]+=y;sum[k+2]+=z;}
 }
 for(let i=0;i<p.length;i+=3){const k=weld?3*weld[i/3]:i,inv=127/(Math.hypot(sum[k],sum[k+1],sum[k+2])||1);
  out[i]=sum[k]*inv;out[i+1]=sum[k+1]*inv;out[i+2]=sum[k+2]*inv;}
 return out;
}
function layerCut(m,indices,bySlot,count){
 if(!m.binding||!indices.length)return indices;
 const above={pantalons:['haut','veste','robe'],soutiens:['haut','robe','veste'],culottes:['bas','robe','collant'],jarretelles:['bas','robe'],baslongs:['bas','robe','souliers'],collants:['bas','robe','souliers'],chaussettes:['bas','souliers'],hauts:['veste'],maillots:['veste'],robes:['veste']};
 const covers=(above[m.group]||[]).map(slot=>bySlot[slot]).filter(p=>p?.coverage?.length);
 if(!covers.length)return indices;
 const covered=new Uint8Array(count);
 for(const g of covers)for(const id of g.coverage)covered[id]=1;
 const inner=new Uint8Array(m.n),b=m.binding;
 for(let i=0;i<m.n;i++){const j=8*i,a=b[j+3]/65535,c=b[j+4]/65535;inner[i]=a*covered[b[j]]+c*covered[b[j+1]]+(1-a-c)*covered[b[j+2]]>.8?1:0}
 const keep=[];
 for(let i=0;i<indices.length;i+=3)if(!(inner[indices[i]]&&inner[indices[i+1]]&&inner[indices[i+2]]))keep.push(indices[i],indices[i+1],indices[i+2]);
 return Uint16Array.from(keep);
}
function adjustLayers(pieces,body){

 const pos=body.position,norm=body.normal;
 const outer=new Set(['hauts','vestes','robes','combinaisons','maillots','pantalons','jupes','chaussures']);
 const under=new Set(['soutiens','culottes','jarretelles','baslongs','collants','chaussettes']);
 const groups=[pieces.filter(m=>under.has(m.group)),pieces.filter(m=>['pantalons','jupes','chaussures'].includes(m.group)),pieces.filter(m=>outer.has(m.group)&&!['pantalons','jupes','chaussures','vestes'].includes(m.group)),pieces.filter(m=>m.group==='vestes')];
 const field=new Map(),cell=2.6,neighbors=[0,1];let filled=false;
 const key=(x,y,z,side)=>((x+85)*110+y+20)*160*6+(z+70)*6+side;
 function station(m,i){
  const b=m.binding,j=i*(m.tailored?8:6),a=3*b[j],d=3*b[j+1],c=3*b[j+2],u=b[j+3]/65535,w=b[j+4]/65535,h=1-u-w;
  let axis=0;for(let k=1;k<3;k++)if(Math.abs(norm[a+k])>Math.abs(norm[a+axis]))axis=k;
  return [(u*pos[a]+w*pos[d]+h*pos[c])*.01/cell,(u*pos[a+1]+w*pos[d+1]+h*pos[c+1])*.01/cell,(u*pos[a+2]+w*pos[d+2]+h*pos[c+2])*.01/cell,axis*2+(norm[a+axis]>0?1:0),b[j+5]];
 }
 for(const group of groups){
  for(const m of group){
   if(!m.binding)continue;
   const extra=m.clearance||(m.clearance=new Int16Array(m.n));extra.fill(0);
   if(!filled)continue;
   for(let i=0;i<m.n;i++){const [x,y,z,side,gap]=station(m,i),ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z);let mx=0;
    for(const a of neighbors)for(const b of neighbors)for(const c of neighbors){
     const val=field.get(key(ix+a,iy+b,iz+c,side));if(val!==undefined)mx=Math.max(mx,val)
    }
    const clearance=m.group==='vestes'?83:46;extra[i]=Math.min(650,Math.max(0,mx+clearance-gap));
   }
  }
  for(const m of group){if(!m.binding)continue;for(let i=0;i<m.n;i++){const [x,y,z,side,gap]=station(m,i),k=key(Math.round(x),Math.round(y),Math.round(z),side);field.set(k,Math.max(field.get(k)||0,Math.min(800,gap+(m.clearance?.[i]||0))))}filled=true}
 }

}

function tuckHairUnderHat(dest,hat){
 if(!hat?.brim)return;
 for(let i=0;i<dest.length;i+=3){
  const x=.01*dest[i],y=.01*dest[i+1],z=.01*dest[i+2];
  const angle=(Math.atan2(x,z+2)+Math.PI)*16/Math.PI,j=Math.floor(angle),t=angle-j;
  const edge=hat.brim[j%32]*(1-t)+hat.brim[(j+1)%32]*t;
  const cover=smoothStep(edge-6.6,edge+.65,y),lower=smoothStep(142,149,y)*(1-smoothStep(edge-3,edge+1,y)),front=smoothStep(1.2,6.2,z);
  const side=Math.tanh((x-.75)/1.6),sweep=side*.43*front*lower,cs=Math.cos(sweep),sn=Math.sin(sweep);
  const qx=(x*cs+(z-.3)*sn)*(1-.43*cover),qz=((z-.3)*cs-x*sn)*(1-.43*cover)+.3;
  dest[i]=Math.round(qx*100);dest[i+2]=Math.round(qz*100);dest[i+1]-=Math.round(cover*255);
 }
}

function refineBrows(m,pos,appearance){
 const axes=new Map(),sc=[.76,.60,.90][appearance.brows];
 for(let k=0;k<pos.length;k+=3){const x=m.position[k],b=Math.round(x/38),y=pos[k+1],a=axes.get(b);if(a){a[0]=Math.min(a[0],y);a[1]=Math.max(a[1],y)}else axes.set(b,[y,y])}
 for(let k=0;k<pos.length;k+=3){
  const a=axes.get(Math.round(m.position[k]/38)),mid=.5*(a[0]+a[1]);pos[k+1]=Math.round(mid+(pos[k+1]-mid)*sc);
 }
}
function bindToBody(m,parent){
 const binding=m.binding,wide=m.tailored,stride=wide?8:6;
 const pos=parent.v,ns=parent.vn,v=m.v;
 for(let i=0,j=0,k=0;i<m.n;i++,j+=stride,k+=3){
  const a=3*binding[j],b=3*binding[j+1],c=3*binding[j+2],u=binding[j+3]/65535,w=binding[j+4]/65535,h=1-u-w;
  let nx=u*ns[a]+w*ns[b]+h*ns[c],ny=u*ns[a+1]+w*ns[b+1]+h*ns[c+1],nz=u*ns[a+2]+w*ns[b+2]+h*ns[c+2];
  const length=Math.hypot(nx,ny,nz);
  if(length<2){nx=0;ny=1;nz=0}else{nx/=length;ny/=length;nz/=length}
  const gap=binding[j+5]+(m.clearance?.[i]||0);let dx=gap*nx,dy=gap*ny,dz=gap*nz;
  if(wide){
   let tx=pos[b]-pos[a],ty=pos[b+1]-pos[a+1],tz=pos[b+2]-pos[a+2];
   const z=tx*nx+ty*ny+tz*nz;tx-=z*nx;ty-=z*ny;tz-=z*nz;
   const inv=1/(Math.hypot(tx,ty,tz)||1);tx*=inv;ty*=inv;tz*=inv;
   const across=(binding[j+6]<<16)>>16,along=(binding[j+7]<<16)>>16;
   dx+=tx*across+(ny*tz-nz*ty)*along;dy+=ty*across+(nz*tx-nx*tz)*along;dz+=tz*across+(nx*ty-ny*tx)*along;
  }
  v[k]=Math.round(u*pos[a]+w*pos[b]+h*pos[c]+dx);v[k+1]=Math.round(u*pos[a+1]+w*pos[b+1]+h*pos[c+1]+dy);v[k+2]=Math.round(u*pos[a+2]+w*pos[b+2]+h*pos[c+2]+dz);

 }
 normals(m.v,m.allFaces,null,m.vn,m.accum);
}

function morph(m,appearance,hat){
 const dest=m.position.slice();
 for(const [key,options] of Object.entries(m.targets)){
  const delta=options[appearance[key]];if(!delta)continue;
  for(let j=0;j<delta.length;j+=4){const i=3*(delta[j]&65535);dest[i]+=delta[j+1];dest[i+1]+=delta[j+2];dest[i+2]+=delta[j+3];}
 }
 if(m.name==='browNative')refineBrows(m,dest,appearance);
 if(['Carre','TresseCote','bob02','short01','short02','short03','afro01'].includes(m.name)){
  for(let k=0;k<dest.length;k+=3){
   const x=dest[k]*.01,y=dest[k+1]*.01,z=dest[k+2]*.01,a=Math.abs(x);
   const across=1-smoothStep(4.65,7.65,a),front=smoothStep(2,5.8,z),near=smoothStep(140,147.5,y);
   const side=Math.tanh((x-2.4)*.65),behind=smoothStep(154,147,y),angle=-side*.68*front*near*behind;
   const ca=Math.cos(angle),sa=Math.sin(angle),zz=z+1;
   const xx=x*ca-zz*sa,depth=x*sa+zz*ca-1;
   const cut=155.05+.44*(xx+3.2)-.036*(xx+1.2)*(xx+1.2);
   const clearance=(1-smoothStep(4.7,7.65,Math.abs(xx)))*front*near;
   const lift=.5*((cut-y)+Math.hypot(cut-y,1.55))*clearance;
   dest[k]=Math.round(100*xx);dest[k+1]+=Math.round(100*lift);dest[k+2]=Math.round(100*(depth-.025*lift));
  }
 }

 if(appearance.age===5){
  // Keep the feet and seat anchors in place while softening the jaw and shortening the upper torso.
  for(let i=0;i<dest.length;i+=3){
   const y=dest[i+1]/100;
   const jaw=smoothStep(137,145,y)*(1-smoothStep(147,153,y));
   dest[i]=Math.round(dest[i]*(1-.035*jaw));
   dest[i+1]-=Math.round(235*smoothStep(90,150,y));
  }
 }
 if(hairList.includes(m.name))tuckHairUnderHat(dest,hat);
 return dest;
}
function displayMesh(mesh,n){
 const uv=mesh.uv.slice();for(let i=1;i<uv.length;i+=2)uv[i]=65535-uv[i];
 return {...mesh,uv,n,v:new Int16Array(n*3),vn:new Int8Array(n*3),allFaces:mesh.faces,multiplier:[1,1,1]};
}
function facialChannels(mesh,channels){
 const jaw=channels[mesh.name+'jaw'],blink=channels[mesh.name+'blink'];
 if(!jaw&&!blink)return;
 const entries=new Map();
 function entry(id){if(!entries.has(id))entries.set(id,new Float32Array(9));return entries.get(id);}
 function copy(source,start){
  for(let k=0;source&&k<source.length;k+=4){
   const target=entry(source[k]&65535);
   for(let c=0;c<3;c++)target[start+c]=source[k+c+1];
  }
 }
 copy(jaw,0);copy(blink,3);
 if(mesh.name==='body'){
  // Use the base topology to find the lips before age and face customization.
  for(let k=0;k<mesh.position.length;k+=3){
   const x=mesh.position[k]*.01,y=mesh.position[k+1]*.01,z=mesh.position[k+2]*.01;
   const mask=(1-smoothStep(1.7,3.05,Math.abs(x)))*(1-smoothStep(.45,1.45,Math.abs(y-147.95)))*smoothStep(7.0,8.45,z);
   if(mask){const v=entry(k/3);v[6]=-x*15*mask;v[7]=48*mask;v[8]=x*12*mask;}
  }
 }
 const ids=Uint16Array.from(entries.keys()),deltas=new Float32Array(ids.length*9);
 ids.forEach((id,i)=>deltas.set(entries.get(id),i*9));
 return {ids,deltas,positions:mesh.rest.slice()};
}
function speakingVertices(mesh,face){
 if(!mesh.speech)return mesh.rest;
 const {ids,deltas,positions}=mesh.speech;
 const jaw=face?.jaw||0,blink=face?.gesture?.blink||0,round=face?.round||0,spread=face?.spread||0;
 if(!(jaw||blink||round||spread))return mesh.rest;
 for(let i=0;i<ids.length;i++){
  const k=ids[i]*3,d=i*9;
  positions[k]=mesh.rest[k]+jaw*deltas[d]+blink*deltas[d+3]+round*deltas[d+6]+spread*deltas[d+8];
  positions[k+1]=mesh.rest[k+1]+jaw*deltas[d+1]+blink*deltas[d+4];
  positions[k+2]=mesh.rest[k+2]+jaw*deltas[d+2]+blink*deltas[d+5]+round*deltas[d+7];
 }
 return positions;
}
// Keep the weave and shading of the V27 garments when dyeing the priest's outfit.
function clericalFabric(image,teal,collar){
 const dyed=new ImageData(new Uint8ClampedArray(image.data),image.width,image.height);
 const ink=teal?[26,82,78]:[40,43,47];
 for(let i=0;i<dyed.data.length;i+=4){
  if(collar&&image.data[i]>200)continue; // Leave the white Roman tab undyed.
  const shade=.65+.50*(.2126*image.data[i]+.7152*image.data[i+1]+.0722*image.data[i+2])/255;
  for(let c=0;c<3;c++)dyed.data[i+c]=ink[c]*shade;
 }
 return dyed;
}
export async function loadStudio(look,gender){
 const female=gender==='femme';
 const baseShape=female?await resource('female-base'):null;
 const outfit={...look.outfit};
 if((female||look.face.age===5)&&!outfit.haut&&!outfit.robe)outfit.haut=female?'mh22':'mh1431';
 const names=['body','eyesNative','browNative','lashes','teethNative','tongueNative',hairList[look.face.hair]];
 const [native,entries]=await Promise.all([
  Promise.all(names.map(async name=>{const m=await resource('mesh-'+name);return {...m,position:baseShape?.[name]??m.position,faces:name==='body'&&baseShape?baseShape.faces:m.faces,image:await material(m.texture,look,female)};})),
  Promise.all(Object.entries(outfit).map(async ([slot,id])=>{
   const raw=await resource('wear-'+id),m=displayMesh(raw,raw.binding.length/8);m.image=await pixels(raw.image);
   if(look.clerical&&['robe','bas','col'].includes(slot)){
    const teal=look.clerical==='soutane-vert-canard';
    m.image=clericalFabric(m.image,teal,slot==='col');
   }
   m.accum=new Float32Array(m.v.length);m.tailored=true;
   if(id==='mh807'&&look.denim)m.multiplier=[.47,.54,.69];if(id==='mh153'&&look.tortoise)m.multiplier=[1.1,.76,.52];
   return [slot,m];
  }))
 ]);
 const slots=Object.fromEntries(entries),clothes=Object.values(slots);
 const skin=native.map(base=>{
  const m=displayMesh(base,base.position.length/3);
  m.rest=morph(base,look.face,slots.chapeau);
  m.restN=normals(m.rest,m.faces,m.weld,new Int8Array(m.rest.length));
  return m;
 });
 const body=skin[0],covered=new Uint8Array(body.n);
 for(const m of clothes)for(const i of m.coverage)covered[i]=1;
 const visible=[];
 for(let j=0;j<body.faces.length;j+=3){const [a,b,c]=body.faces.subarray(j,j+3);if(!(covered[a]&&covered[b]&&covered[c]))visible.push(a,b,c);}
 body.faces=Uint16Array.from(visible);
 adjustLayers(clothes,body);
 for(const m of clothes)m.faces=layerCut(m,m.faces,slots,body.n);
 const output=new Float32Array(6);let prior=null,priorFace=null;
 return {meshes:[...skin,...clothes],revision:0,
   enableSpeech(channels){for(const m of skin)m.speech??=facialChannels(m,channels);},
   pose(bones,face=null){
  if(prior&&priorFace===face&&bones.every((v,i)=>v===prior[i]))return;
  prior=bones.slice();priorFace=face;
  for(const m of skin){
   const p=speakingVertices(m,face),n=m.restN;
   for(let i=0;i<p.length;i+=3){
    poseVertex(output,bones,m.rig,i/3,p[i]/10000,p[i+1]/10000,p[i+2]/10000,n[i],n[i+1],n[i+2]);
    for(let j=0;j<3;j++){m.v[i+j]=Math.round(output[j]*10000);m.vn[i+j]=Math.round(output[j+3]);}
   }
  }
  for(const m of clothes)bindToBody(m,body);
  this.revision++;
 }};
}
