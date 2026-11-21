// Game-ready salon figures share one texture and a fifteen-joint rig per outfit.
// The distant crowd uses a second mesh of the same figures, posed before instancing.
import * as T from 'three';
const names=['ahmed','firmin','louise','samir','clara','paul'];
const ensemble=['louise','samir','clara','paul'];
const outfits=new Map(),poses=new Map();
const identity=new T.Matrix4();
const palm=new T.Vector3(.432,.900,.002);
const modelScale=1.075;
let motion,contact,softwareCamera;
function contactShadow(){
 if(!contact){
  const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');
  const grad=ctx.createRadialGradient(32,32,0,32,32,31);grad.addColorStop(0,'rgba(36,30,24,.46)');grad.addColorStop(.5,'rgba(36,30,24,.21)');grad.addColorStop(1,'rgba(36,30,24,0)');
  ctx.fillStyle=grad;ctx.fillRect(0,0,64,64);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
  const mat=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
  mat.userData.cortege=true;const geo=new T.PlaneGeometry(.75,.53);geo.rotateX(-Math.PI/2);geo.userData.cortege=true;contact=new T.Mesh(geo,mat);contact.position.y=.026;
 }
 return contact.clone();
}
function readGeometry(view,cursor){
 const vertices=view.getUint32(cursor.at,true),indices=view.getUint32(cursor.at+4,true);
 cursor.at+=8;
 const pos=new Float32Array(vertices*3),norm=new Int8Array(vertices*3),uv=new Uint16Array(vertices*2);
 const joints=new Uint8Array(vertices*4),weights=new Uint8Array(vertices*4);
 for(let i=0;i<vertices;i++){
  const off=cursor.at;
  for(let k=0;k<3;k++){pos[3*i+k]=view.getInt16(off+2*k,true)*.0001;norm[3*i+k]=view.getInt8(off+6+k);}
  for(let k=0;k<2;k++)uv[2*i+k]=view.getUint16(off+9+k*2,true);
  for(let k=0;k<4;k++){joints[4*i+k]=view.getUint8(off+13+k);weights[4*i+k]=view.getUint8(off+17+k);}
  cursor.at+=21;
 }
 const faces=new Uint16Array(indices);
 for(let i=0;i<indices;i++,cursor.at+=2)faces[i]=view.getUint16(cursor.at,true);
 const g=new T.BufferGeometry();
 for(const [key,array,size,normalized] of [['position',pos,3,false],['normal',norm,3,true],['uv',uv,2,true],['skinIndex',joints,4,false],['skinWeight',weights,4,true]])g.setAttribute(key,new T.BufferAttribute(array,size,normalized));
 g.setIndex(new T.BufferAttribute(faces,1));g.userData.cortege=true;return g;
}
async function readOutfit(name){
 const response=await fetch('assets/manifestation/cortege-v1/'+name+'.bin');
 if(!response.ok)throw Error('Personnage indisponible : '+name);
 const buffer=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 const view=new DataView(buffer);
 if(view.getUint32(0)!==0x4d484331)throw Error('Modèle illisible : '+name);
 const size=view.getUint32(4,true),levels=view.getUint32(8,true),cursor={at:12+size};
 const blob=new Blob([new Uint8Array(buffer,12,size)],{type:'image/webp'}),url=URL.createObjectURL(blob);
 try{
  const map=await new T.TextureLoader().loadAsync(url);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
  const material=new T.MeshStandardMaterial({map,roughness:.88,alphaTest:.28,side:T.DoubleSide});material.userData.cortege=true;
  const near=readGeometry(view,cursor),far=levels>1?readGeometry(view,cursor):null;
  if(cursor.at!==buffer.byteLength)throw Error('Modèle incomplet : '+name);
  return {name,near,far,material};
 }finally{URL.revokeObjectURL(url);}
}
function turnLimb(begin,end,target,origin){
 const direction=end.clone().sub(begin).normalize(),aim=target.clone().sub(origin).normalize();
 const q=new T.Quaternion().setFromUnitVectors(direction,aim);
 return new T.Matrix4().makeRotationFromQuaternion(q).setPosition(origin.clone().sub(begin.clone().applyQuaternion(q)));
}
function carrierPose(matrices,raised){
 const a=new T.Vector3(.173,1.336,-.053),b=new T.Vector3(.2861,1.1231,-.0321),c=new T.Vector3(.4067,.9411,-.009);
 const shoulder=a.clone().applyMatrix4(matrices[14]);
 const elbow=(raised?new T.Vector3(.195,.12,.07):new T.Vector3(.126,-.200,.056)).setLength(a.distanceTo(b)).add(shoulder);
 const hand=elbow.clone().add((raised?new T.Vector3(-.025,.215,.042):new T.Vector3(-.043,.060,.203)).setLength(b.distanceTo(c)));
 matrices[5]=turnLimb(a,b,elbow,shoulder);
 matrices[6]=turnLimb(b,c,hand,elbow);
 matrices[7]=matrices[6].clone();
}
function pose(step,walking,arm){
 const key=(step*2+Number(walking))*3+arm;
 if(poses.has(key))return poses.get(key);
 const cycle=step/4,frame=Math.floor(cycle),blend=cycle-frame,a=walking?motion[frame]:motion.rest,b=walking?motion[(frame+1)%8]:a;
 const matrices=Array.from({length:15},(_,i)=>{
  const m=new T.Matrix4();for(let k=0;k<16;k++)m.elements[k]=a[16*i+k]*(1-blend)+b[16*i+k]*blend;return m;
 });
 if(arm)carrierPose(matrices,arm===2);
 const bones=matrices.map(m=>{const bone=new T.Bone();bone.matrixAutoUpdate=false;bone.matrixWorld.copy(m);return bone;});
 const skeleton=new T.Skeleton(bones,bones.map(()=>identity));skeleton.update();
 const result={skeleton,grip:palm.clone().applyMatrix4(matrices[7]),matrices};poses.set(key,result);return result;
}
function bakeFar(source){
 source.low=source.far;source.far=source.low.clone();source.far.userData.cortege=true;
 const g=source.far,m=source.material,skin=new T.SkinnedMesh(g,m),s=pose(3,true,0).skeleton;
 skin.bind(s,identity);
 const p=g.attributes.position,n=g.attributes.normal,dir=new T.Vector3(),vertex=new T.Vector3(),part=new T.Vector3();
 const normals=new Float32Array(n.count*3);
 for(let i=0;i<p.count;i++){
  skin.getVertexPosition(i,vertex);p.setXYZ(i,vertex.x,vertex.y,vertex.z);
  dir.set(0,0,0);
  for(let k=0;k<4;k++){const w=g.attributes.skinWeight.getComponent(i,k);if(!w)continue;
   const bone=s.bones[g.attributes.skinIndex.getComponent(i,k)];part.fromBufferAttribute(n,i).transformDirection(bone.matrixWorld);dir.addScaledVector(part,w);}
  dir.normalize().toArray(normals,i*3);
 }
 g.setAttribute('normal',new T.BufferAttribute(normals,3));g.deleteAttribute('skinIndex');g.deleteAttribute('skinWeight');g.computeBoundingSphere();
}
async function loadDistantPortrait(model){
 const map=await new T.TextureLoader().loadAsync('assets/manifestation/cortege-v1/'+model.name+'-distance.webp');
 map.colorSpace=T.SRGBColorSpace;
 const material=new T.MeshBasicMaterial({map,side:T.DoubleSide,alphaTest:.3});
 material.userData.cortege=true;
 model.portraits=[0,1].map(i=>{
  const geometry=new T.PlaneGeometry(1.13/modelScale,2.072/modelScale);
  geometry.translate(0,.91/modelScale,0);
  for(let j=0;j<4;j++)geometry.attributes.uv.setX(j,(i+geometry.attributes.uv.getX(j))*.5);
  geometry.userData.cortege=true;return {geometry,material};
 });
}
export async function loadCortege(fallbackCamera=null){
 softwareCamera=fallbackCamera;
 const [data,...models]=await Promise.all([fetch('membres/v27/poses.json').then(r=>{if(!r.ok)throw Error('Marche indisponible');return r.json();}),...names.map(readOutfit)]);
 motion=data.m;
 await Promise.all(models.map(async model=>{
  outfits.set(model.name,model);
  if(model.far){bakeFar(model);if(softwareCamera)await loadDistantPortrait(model);}
 }));
}
export function makeMarcher(id,options={}){
 const name=options.hero?'ahmed':options.role||ensemble[(id+Math.floor(id/5))%ensemble.length];
 const outfit=outfits.get(name),root=new T.Group(),body=new T.SkinnedMesh(outfit.near,outfit.material);
 body.scale.setScalar(modelScale*(options.hero||options.role?1:.93+(id*17%13)*.011));body.bindMode='detached';
 body.bind(pose(0,false,0).skeleton,identity);body.castShadow=true;body.receiveShadow=false;
 body.boundingSphere=new T.Sphere(new T.Vector3(0,.91,0),1.10);
 if(outfit.portraits){
  const {geometry,material}=outfit.portraits[0];const card=new T.Mesh(geometry,material);
  card.scale.copy(body.scale);root.add(card);root.userData.card=card;
 }
 root.name=name==='ahmed'?'Ahmed':name==='firmin'?'Firmin':name;root.add(body);if(options.hero||options.role==='firmin')root.add(contactShadow());
 root.userData={...root.userData,id,body,hero:!!options.hero,parkCitizen:true,outfit,offset:id*.61,grip:new T.Vector3()};
 poseMarcher(root,0,0);return root;
}
export function poseMarcher(actor,time,strength,signal=false,cameraPosition=null){
 const d=actor.userData,moving=strength>.38,step=moving?(Math.floor((time*.85+d.offset)*32)%32+32)%32:0;
 const state=pose(step,moving,signal?2:d.holding?1:0);
 if(d.card&&cameraPosition){
  const dx=cameraPosition.x-actor.position.x,dz=cameraPosition.z-actor.position.z;
  d.card.visible=dx*dx+dz*dz>72;d.body.visible=!d.card.visible;
  d.card.rotation.y=Math.atan2(dx,dz)-actor.rotation.y;
  d.card.geometry=d.outfit.portraits[Math.cos(d.card.rotation.y)<0?1:0].geometry;
 }else if(d.card)d.card.visible=false;
 if(d.outfit.low&&cameraPosition)d.body.geometry=actor.position.distanceToSquared(cameraPosition)>144?d.outfit.low:d.outfit.near;
 d.body.skeleton=state.skeleton;d.grip.copy(state.grip).multiplyScalar(d.body.scale.x);
}
export function backgroundMarchers(parent,count){
 const dummy=new T.Object3D(),batches=ensemble.map((name,i)=>{
  const model=outfits.get(name),n=Math.ceil((count-i)/ensemble.length);
  const parts=model.portraits||[{geometry:model.far,material:model.material}];
  return parts.map(({geometry,material})=>{
   const batch=new T.InstancedMesh(geometry,material,n);batch.frustumCulled=false;parent.add(batch);return batch;
  });
 });
 return {count,set(i,x,y,z,heading){
  dummy.position.set(x,y,z);dummy.rotation.y=heading;dummy.scale.setScalar(modelScale*(.93+i*17%13*.011));dummy.updateMatrix();
  const batchesForActor=batches[i%ensemble.length],slot=Math.floor(i/ensemble.length);
  if(batchesForActor.length===1){batchesForActor[0].setMatrixAt(slot,dummy.matrix);return;}
  const angle=Math.atan2(softwareCamera.position.x-x,softwareCamera.position.z-z);
  const facing=Math.cos(angle-heading)<0?1:0;dummy.rotation.y=angle;dummy.updateMatrix();
  batchesForActor[facing].setMatrixAt(slot,dummy.matrix);dummy.scale.setScalar(0);dummy.updateMatrix();batchesForActor[1-facing].setMatrixAt(slot,dummy.matrix);
 },finish(){for(const parts of batches)for(const batch of parts)batch.instanceMatrix.needsUpdate=true;}};
}
