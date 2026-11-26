import {createDetailCamera} from './detail-camera.js';
import {bindCameraStick,bindCameraHeight,touchStickScale,touchGestureGain} from '../salon-camera-stick.js';
import {createTravelCamera} from './travel-camera.js';
import {composeDialogue,createFocusPass} from './conversation-camera.js';
import {livePose} from './live-body.js';
import * as T from 'three';
import {seats as roomSeats,roomFree,roomPath} from '../salon-plan.js';
import {reunionDialogue} from './rencontre-lionel.js';
import {createMemberBridge} from './scene-members.js';
import {loadOriginalCinemaAssets} from './intro-original.js';
import {createIntroFinale} from './intro-finale.js';
import {createIntroInvitationScene,prepareIntroInvitationGuests,applyIntroInvitationGuest,INTRO_INVITATION_POSITIONS} from './intro-invitation-scene.js';
import {SalonMotion} from '../salon-v27-motion.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { unzipSync, strFromU8 } from 'three/examples/jsm/libs/fflate.module.js';

const $=id=>document.getElementById(id);
const view=$('stage'), canvas=$('scene'), clamp=T.MathUtils.clamp, mix=T.MathUtils.lerp, tau=Math.PI*2;
let arrivalFinale=null,invitationScene=null,introDirector=null;
window.salonArrival?.progress('decor','Ouverture de la maison et de son parc…');
const response=await fetch('/assets/depart-duo/scene.bin');
if(!response.ok)throw Error('Le salon ne répond pas.');
const packed=new Uint8Array(await response.arrayBuffer());
const files=unzipSync(packed), info=JSON.parse(strFromU8(files['index.json']));
const diningRes=await fetch('/membres/v27/assises.bin?pose=canape2');
if(!diningRes.ok)throw Error('Les poses du salon sont indisponibles.');
const dining=unzipSync(new Uint8Array(await diningRes.arrayBuffer()));
const poseIndex=JSON.parse(strFromU8(dining['index.json']));
const poseArrays=new Map();
function poseArray(index){
 if(!poseArrays.has(index)){
   const bytes=dining[index],base=poseIndex.bases[index];
   if(base!==null){const previous=poseArray(base);
     for(let i=0;i<bytes.length;i++)bytes[i]+=previous[i];
   }
   poseArrays.set(index,new Int8Array(bytes.buffer,bytes.byteOffset,bytes.byteLength));
 }
 return poseArrays.get(index);
}
function seatedPose(key){return {delta:poseArray(poseIndex.keys[key]),unit:poseIndex.units[key]/10000};}
const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
const scene=new T.Scene(), cam=new T.PerspectiveCamera(48,1,.07,180), indoor=new T.Group(), outdoor=new T.Group();
scene.add(indoor,outdoor);
const detail=createDetailCamera(cam,canvas,scene),drawScene=createFocusPass(renderer);
let focusShot=null;
const baySlope=.087173,bayCenter=new T.Vector3(0,0,2.48944),gardenThreshold=new T.Vector3(-.65,.047,10.72);
const travel=createTravelCamera(cam,baySlope,matchMedia('(prefers-reduced-motion: reduce)'));
const roomToGarden=new T.Matrix4().makeRotationY(Math.PI+Math.atan(baySlope));
roomToGarden.setPosition(gardenThreshold.clone().sub(bayCenter.clone().applyMatrix4(roomToGarden)));
const gardenToRoom=roomToGarden.clone().invert(), identity=new T.Matrix4();
indoor.matrixAutoUpdate=outdoor.matrixAutoUpdate=false;
scene.add(new T.HemisphereLight(0xfff6df,0xd8bca2,1.48));
const sun=new T.DirectionalLight(0xffe5ba,1.65);sun.position.set(-4,7,3);scene.add(sun);
sun.castShadow=true;sun.shadow.mapSize.set(768,768);sun.shadow.camera.left=-6;sun.shadow.camera.right=6;sun.shadow.camera.top=6;sun.shadow.camera.bottom=-6;sun.shadow.camera.near=.2;sun.shadow.camera.far=23;sun.shadow.bias=-.0007;sun.shadow.normalBias=.012;scene.add(sun.target);
const fill=new T.DirectionalLight(0xc3d9ed,.36);fill.position.set(3,2,-4);scene.add(fill);
const textures=new Map(), urls=[], ready=[];
function tex(k,srgb=true){
 if(textures.has(k))return textures.get(k);
 const url=URL.createObjectURL(new Blob([files[k]],{type:'image/webp'}));urls.push(url);
 const img=new Image(),t=new T.Texture(img);if(srgb)t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 const waiter=new Promise((resolve,reject)=>{img.onload=()=>{t.needsUpdate=true;resolve()};img.onerror=()=>reject(new Error('Texture illisible'))});ready.push(waiter);img.src=url;textures.set(k,t);return t;
}
function arr(k,type){const b=files[k];return new type(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength))}
function attr(a,n){return new T.BufferAttribute(a,n)}
function geom(h,scale=10000){
 const g=new T.BufferGeometry();
 g.setAttribute('position',attr(Float32Array.from(arr(h.p,Int16Array),v=>v/scale),3));
 g.setAttribute('normal',attr(Float32Array.from(arr(h.n,Int8Array),v=>v/127),3));
 if(h.uv)g.setAttribute('uv',attr(Float32Array.from(arr(h.uv,Uint16Array),v=>v/65535),2));
 g.setIndex(attr(arr(h.i,Uint16Array),1));g.computeBoundingSphere();return g;
}
function material(c){return new T.MeshStandardMaterial({color:c,roughness:.93})}
function mesh(geo,mat,parent,x=0,y=0,z=0){const o=new T.Mesh(geo,mat);o.position.set(x,y,z);parent.add(o);return o}
const cube=new T.BoxGeometry();
function box(parent,x,y,z,w,h,l,mat){const o=mesh(cube,mat,parent,x,y,z);o.scale.set(w,h,l);return o}
function seeded(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
function noiseTexture(kind){
 const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),im=ctx.createImageData(256,256),pr=seeded(147+kind.length);
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){
  const i=4*(x+256*y),r=pr(),p=pr();let rgb;
  if(kind==='wood'){const seam=y%36<1.2||((x+Math.floor(y/36)*82)%224)<1,grain=Math.sin(x*.13+Math.sin(y*.042)*3+Math.sin(x*.029))*2+Math.sin(y*1.5+Math.sin(x*.028)*1.5)*2;const light=r*6+grain-(seam?22:0);rgb=[202+light,166+light,123+light]}
  else{const speck=r<.085?-(20+p*15):p*20-7;rgb=kind==='path'?[213+speck,193+speck,160+speck]:[132+speck,140+speck,99+speck]}
  for(let j=0;j<3;j++)im.data[i+j]=rgb[j];im.data[i+3]=255
 }
 ctx.putImageData(im,0,0);
 if(kind!=='wood'){for(let i=0;i<1300;i++){const x=pr()*256,y=pr()*256,r=.4+pr()*1.2;ctx.fillStyle=pr()<.5?'rgba(80,64,46,.18)':'rgba(254,244,211,.38)';ctx.beginPath();ctx.ellipse(x,y,r,r*.5,pr()*3,0,tau);ctx.fill()}}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t;
}
const wood=noiseTexture('wood'),floorAO=tex('floor.webp',false), roomParts=[],bayPanes=[];
for(const h of info.room){
 const g=geom(h,1800),pos=g.attributes.position;let mat;
 if(h.cat==='floor'){
  const uv=[],uv2=[];for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);uv.push(x*.70,z*.70);uv2.push((x+3.9)/8,1-(z+3.8)/8)}
  g.setAttribute('uv',attr(new Float32Array(uv),2));g.setAttribute('uv1',attr(new Float32Array(uv2),2));floorAO.channel=1;mat=new T.MeshStandardMaterial({map:wood,aoMap:floorAO,aoMapIntensity:.8,side:T.DoubleSide,roughness:.9});
 }else if(h.cat==='glass'){
  mat=new T.MeshStandardMaterial({color:0xc9e1df,transparent:true,opacity:.075,roughness:.20,depthWrite:false,side:T.FrontSide});
 }else{
  const raw=arr(h.c,Uint8Array),colors=new Float32Array(raw.length);for(let i=0;i<raw.length;i++)colors[i]=T.ColorManagement.colorSpaceToWorking(new T.Color(raw[i]/255,0,0),T.SRGBColorSpace).r;
  g.setAttribute('color',attr(colors,3));mat=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:h.cat==='glass'?.30:.90});
  if(h.cat==='rug')mat.polygonOffset=true,mat.polygonOffsetFactor=-2;
 }
 const o=mesh(g,mat,indoor);o.castShadow=!h.wall&&h.cat!=='floor'&&h.cat!=='rug';o.receiveShadow=true;o.userData.wall=h.wall;o.userData.kind=h.cat;roomParts.push(o);if(h.cat==='glass'){bayPanes.push(o);o.receiveShadow=false}
}
// Close the small hall behind the backpacks within the ground-floor shell.
const returnWall=box(indoor,-2.25,1.5,-3.12,2.15,3,.10,material(0xdfd5be));returnWall.userData.wall=1;roomParts.push(returnWall);
const ceilingShape=new T.Shape();ceilingShape.moveTo(-3.27,-3.16);ceilingShape.lineTo(3.27,-3.16);ceilingShape.lineTo(3.27,2.80);ceilingShape.lineTo(-3.27,2.23);ceilingShape.closePath();
const ceiling=mesh(new T.ShapeGeometry(ceilingShape),new T.MeshStandardMaterial({color:0xe9dfcd,roughness:1,side:T.DoubleSide}),indoor,0,3.009,0);
ceiling.rotation.x=Math.PI/2;
function shadowImage(){
 const c=document.createElement('canvas');c.width=c.height=96;const ctx=c.getContext('2d'),grad=ctx.createRadialGradient(48,48,1,48,48,46);
 grad.addColorStop(0,'rgba(42,36,25,.72)');grad.addColorStop(.50,'rgba(42,36,25,.22)');grad.addColorStop(1,'rgba(42,36,25,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,96,96);return new T.CanvasTexture(c)
}
const shadeMat=new T.MeshBasicMaterial({map:shadowImage(),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3});
function shade(parent,x,z,w,l,y=.024){const o=mesh(new T.PlaneGeometry(w,l),shadeMat,parent,x,y,z);o.rotation.x=-Math.PI/2;o.userData.ignorePick=true;return o}
const bagGeo=geom(info.bag);let start=0;info.bag.groups.forEach((count,i)=>{bagGeo.addGroup(start,count,i);start+=count});
const bags={},bagSpots={pin:{z:-2.57,yaw:-1.50,tilt:-.12},ocre:{z:-1.94,yaw:-1.65,tilt:.09}};
const bagBounds=new T.Box3(),bagVertex=new T.Vector3();
function measureRestingBag(o){
 o.updateMatrix();bagBounds.makeEmpty();
 const p=o.geometry.attributes.position;
 for(let i=0;i<p.count;i++)bagBounds.expandByPoint(bagVertex.fromBufferAttribute(p,i).applyMatrix4(o.matrix));
 return bagBounds;
}
function restBag(o,q){
 o.scale.setScalar(.88);o.position.set(0,0,q.z);o.rotation.set(.13,q.yaw,q.tilt,'YXZ');
 const b=measureRestingBag(o);
 o.position.x+=-3.218-b.min.x;o.position.y+=.004-b.min.y;
 measureRestingBag(o);const center=b.getCenter(new T.Vector3());
 o.userData.pinAt=new T.Vector3(center.x,b.max.y+.09,center.z);
 o.userData.restBounds=b.clone();const shadow=o.userData.shadow;
 if(shadow){shadow.position.set(center.x,.010,center.z);shadow.visible=true}
 o.updateMatrixWorld(true);
}
const strapMat=material(0x353e39),clipMat=new T.MeshStandardMaterial({color:0x726553,roughness:.55,metalness:.47});
const bagTexNorm=tex('bag/normal.webp',false);
for(const [name,q] of Object.entries(bagSpots)){
 const body=new T.MeshStandardMaterial({map:tex('bag/'+name+'.webp'),normalMap:bagTexNorm,normalScale:new T.Vector2(.50,.50),roughness:.85,side:T.DoubleSide});
 const o=mesh(bagGeo,[body,strapMat,clipMat],indoor);o.userData.bag=name;bags[name]=o;o.receiveShadow=o.castShadow=true;o.userData.shadow=shade(indoor,0,0,.67,.50);restBag(o,q);
}
const seats=roomSeats.map(s=>({
 id:s.id,source:s,yaw:s.yaw,pose:s.id.startsWith('sofa')?8:s.id==='chair'?9:10,
 center:[(s.x-700)/100,(s.z+800)/100],gap:s.gap/100,height:s.height/100
}));
const cinemaArrival=new URLSearchParams(location.search).get('arrival')==='cinema';
const soloAhmed=new URLSearchParams(location.search).get('ahmed')==='solo';
const originalAhmed=soloAhmed&&new URLSearchParams(location.search).get('portrait')==='original';
const actors={};let role=cinemaArrival||soloAhmed?'m':'f',where='salon',chosen=null,sitting=null,goal=null,renderedAt=0;
const authorRoom=new URLSearchParams(location.search).has('resident');
let visiting=false,visitsMarianne=false;
const encounter={active:false,loaded:false,loading:null,friends:null,route:null,clock:0,chatView:false};
const exchange=reunionDialogue();
function makeActor(id,withDefaultParts=true){
 const root=new T.Group(),body=new T.Group(),parts=[];root.add(body);scene.add(root);root.scale.setScalar(id==='m'?1.075:1.04);
 for(const h of withDefaultParts?info[id].parts:[]){
  const g=geom(h),t=tex(info[id].tex[h.tex]),alpha=/hair|short02|lash|brow/.test(h.name),base=g.attributes.position.array.slice();
  const mat=new T.MeshStandardMaterial({map:t,roughness:.89,alphaTest:alpha?.36:.12,side:T.DoubleSide});
  const obj=mesh(g,mat,body);obj.castShadow=true;obj.receiveShadow=false;g.attributes.position.setUsage(T.DynamicDrawUsage);g.boundingSphere.radius+=1;
  const poses=h.units.map((u,i)=>({delta:arr(h.anim+i,Int8Array),unit:u/10000}));
  const seated={};
   for(const seat of roomSeats){
     seated[seat.id]=['35','70','100'].map(weight=>{
       const key=id+'/'+h.name+'/'+seat.id+'/'+weight;
       return seatedPose(key);
     });
   }
   parts.push({name:h.name,obj,base,poses,seated});
 }
 const shadow=shade(root,0,0,.82,.54,.030);return {id,root,body,parts,shadow,phase:0,speed:0,stamp:'',sit:0}
}
for(const id of ['f','m'])actors[id]=makeActor(id);
const visitor=makeActor('m',false);visitor.root.visible=false;visitor.isGuest=true;
function presence(){
 for(const [id,actor] of Object.entries(actors))actor.root.visible=soloAhmed?id==='m':id===role||(authorRoom&&(!visiting||id==='f'&&!visitsMarianne));
 visitor.root.visible=!soloAhmed&&visiting;
}
function actorHome(){presence();actors.f.root.position.set(-1.41,0,-2.30);actors.f.root.rotation.y=-.70;actors.m.root.position.set(-.60,0,-1.82);actors.m.root.rotation.y=-1.12;for(const a of Object.values(actors)){a.sit=0;a.speed=0;a.phase=0;a.stamp='';animateBody(a,0,0)}}
actorHome();
const fitData=JSON.parse(strFromU8(files['fit.json']));
const wornGeo=bagGeo.clone();
const padPoints=wornGeo.attributes.position;wornGeo.setIndex(attr(arr(info.wornBag.i,Uint16Array),1));wornGeo.clearGroups();let wornFirst=0;info.wornBag.groups.forEach((n,i)=>{wornGeo.addGroup(wornFirst,n,i);wornFirst+=n});
for(let i=0;i<padPoints.count;i++){
 // Fold the source model's loose display straps into the back pad when the harness is under tension.
 const z=padPoints.getZ(i);if(z>-.019)padPoints.setZ(i,-.019+.020*Math.tanh((z+.019)/.020));
}
wornGeo.computeVertexNormals();wornGeo.computeBoundingSphere();
const bindingCloth=material(0x39473e),bindingEdge=material(0x222f29),chestMat=material(0x35433c),buckleMat=material(0x9a916b);
function harnessPatch(parent,data){
 const cols=data.c,raw=data.p,rows=raw[0].length/cols,frames=raw.map(frame=>Float32Array.from(frame.flat(),q=>q/10000));
 const g=new T.BufferGeometry(),coords=attr(frames[0].slice(),3);coords.setUsage(T.DynamicDrawUsage);g.setAttribute('position',coords);
 const color=[];for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
  const edge=cols===4&&(j===0||j===3),c=new T.Color(edge?0x31392d:cols===4?0x697361:0x444c40);
  color.push(c.r,c.g,c.b)}
 g.setAttribute('color',attr(new Float32Array(color),3));const ix=[];for(let i=1;i<rows;i++)for(let j=1;j<cols;j++){const b=i*cols+j;ix.push(b-cols-1,b-1,b,b-cols-1,b,b-cols)}g.setIndex(ix);g.computeVertexNormals();g.computeBoundingSphere();g.boundingSphere.radius+=.2;
 const m=new T.MeshStandardMaterial({vertexColors:true,roughness:.85,side:T.DoubleSide});const obj=mesh(g,m,parent);return {frames,coords,g,cols,rows}
}
function joinedWeb(parent){
 const g=new T.BufferGeometry();g.setIndex([0,1,2,1,3,2]);const a=attr(new Float32Array(12),3);g.setAttribute('position',a);const m=bindingCloth.clone();m.side=T.DoubleSide;const o=mesh(g,m,parent);o.frustumCulled=false;return {a,g}
}
function fitHarness(a){
 const shape=fitData[a.id],h=new T.Group(),mount=new T.Group();a.root.add(h);h.add(mount);h.visible=false;
 const cushionMat=material(0x34433c),panel=new T.SphereGeometry(1,14,14);
 for(const side of [-1,1]){const pad=mesh(panel,cushionMat,mount,side*.066,1.105,shape.back-.022);pad.scale.set(.077,.242,.047)}
 const risers=[joinedWeb(h),joinedWeb(h)];
 const patches=shape.straps.map(s=>harnessPatch(h,s)),links=[joinedWeb(h),joinedWeb(h)];
 const clasp=box(h,0,1.21,.10,.045,.027,.010,buckleMat);const slot=box(h,0,0,0,.022,.013,.009,bindingEdge);
 return {shape,h,mount,risers,patches,links,clasp,slot,poses:shape.frames.map(f=>({p:new T.Vector3(...f.slice(0,3)),q:new T.Quaternion(...f.slice(3))})),stamp:''};
}
const restQ=new T.Quaternion(),workQ=new T.Quaternion();
function trackHarness(a,force=false){
 const h=a.harness;if(!h?.h.visible)return;
 const phase=a.phase*8,lo=Math.floor(phase)%8,hi=(lo+1)%8,t=phase%1,b=a.speed,stamp=Math.round(phase*50)+'-'+Math.round(b*48);if(!force&&(h.stamp===stamp||(!b&&h.stamp==='idle')))return;h.stamp=b>.01?stamp:'idle';
 const f=h.poses[lo+1],next=h.poses[hi+1];h.mount.position.copy(f.p).lerp(next.p,t).multiplyScalar(b);workQ.copy(f.q).slerp(next.q,t);h.mount.quaternion.copy(restQ).slerp(workQ,b);
 for(const patch of h.patches){
  const raw=patch.coords.array,r=patch.frames[0],v=patch.frames[lo+1],w=patch.frames[hi+1];
  for(let i=0;i<raw.length;i++)raw[i]=r[i]+(mix(v[i],w[i],t)-r[i])*b;
  patch.coords.needsUpdate=true;patch.g.computeVertexNormals();
 }
 for(let s=0;s<2;s++){const p=h.patches[s*2],web=h.patches[1+s*2],link=h.links[s],v=p.coords.array,w=web.coords.array;
  link.a.array.set(v.subarray(v.length-9,v.length-6),0);link.a.array.set(v.subarray(v.length-6,v.length-3),3);link.a.array.set(w.subarray(0,6),6);link.a.needsUpdate=true;link.g.computeVertexNormals();}
 for(let j=0;j<2;j++){
  const data=h.patches[j*2].coords.array,row=18*12,side=j===0?-1:1,link=h.risers[j],end=new T.Vector3(side*.096,a.id==='f'?1.345:1.370,h.shape.back-.089).applyQuaternion(h.mount.quaternion).add(h.mount.position);
  link.a.array.set(data.subarray(row+3,row+6),0);link.a.array.set(data.subarray(row+6,row+9),3);
  link.a.array.set([end.x-side*.012,end.y,end.z,end.x+side*.012,end.y,end.z],6);
  link.a.needsUpdate=true;link.g.computeVertexNormals()
 }
 const chest=h.patches[4].coords.array,mid=(Math.floor(chest.length/6/2))*6;
 h.clasp.position.set(chest[mid],(chest[mid+1]+chest[mid+4])/2,chest[mid+2]+.004);h.slot.position.copy(h.clasp.position);h.slot.position.z+=.006;
}
function wear(a,bag){
 bag.userData.shadow.visible=false;
 if(!a.harness)a.harness=fitHarness(a);const h=a.harness;h.h.visible=true;h.mount.add(bag);bag.geometry=wornGeo;
 const s=a.id==='f'?.65:.67;bag.scale.set(s,s,s*.93);bag.rotation.set(0,0,0);bag.position.set(0,a.id==='f'?.80:.81,h.shape.back+.007);
 a.bag=bag;h.stamp='';trackHarness(a,true);
}
function unwear(a){
 if(!a.bag)return;const o=a.bag;indoor.add(o);o.geometry=bagGeo;restBag(o,bagSpots[o.userData.bag]);a.bag=null;a.harness.h.visible=false;
}

function animateBody(a,blend,seat,dt=0){
 if(a.cinemaAhmed?.active){a.motionSeat=seat;a.cinemaAhmed.animate(blend,seat,dt);return;}
 a.motionSeat=seat;if(livePose(a,seat,blend))return;
 a.phase=(a.phase+dt*(1.02+blend*.1))%1;const p=a.phase*8,lo=Math.floor(p),hi=(lo+1)%8,f=p-lo;
 const sittingPose=seat?seat.pose:0;const tag=seat?'seat'+sittingPose+Math.round(a.sit*42):blend>.01?'walk'+Math.floor(p*12)+'/'+Math.round(blend*25):'idle';if(a.stamp===tag)return;a.stamp=tag;
 for(const part of a.parts){
  const buf=part.obj.geometry.attributes.position,base=part.base,aa=part.poses[lo],bb=part.poses[hi];
  if(seat){const frames=part.seated?.[seat.id];
   if(frames){const n=a.sit<.35?0:a.sit<.70?1:2,ends=[0,.35,.7,1],u=(a.sit-ends[n])/(ends[n+1]-ends[n]);
     const lower=n?frames[n-1]:null,upper=frames[n],lo=lower?(1-u)*lower.unit:0,hi=u*upper.unit;
     for(let i=0;i<base.length;i++)buf.array[i]=base[i]+(lower?lo*lower.delta[i]:0)+hi*upper.delta[i];
   }else{const m=part.poses[sittingPose],weight=a.sit*m.unit;for(let i=0;i<base.length;i++)buf.array[i]=base[i]+m.delta[i]*weight;}}
  else if(blend>.01){const v=(1-f)*aa.unit*blend,w=f*bb.unit*blend;for(let i=0;i<base.length;i++)buf.array[i]=base[i]+aa.delta[i]*v+bb.delta[i]*w}
  else buf.array.set(base);buf.needsUpdate=true;
 }
}
const groundTex=noiseTexture('land'),pathTex=noiseTexture('path'),landMat=new T.MeshStandardMaterial({map:groundTex,roughness:1,side:T.DoubleSide}),pathMat=new T.MeshStandardMaterial({map:pathTex,roughness:1,side:T.DoubleSide});
const wallMat=material(0xdac0a0),roofMat=material(0xa76247),trimMat=material(0xe7d7ba),doorMat=material(0x426154),glassMat=material(0x688885),iron=material(0x4f5749);
const garden=new T.Group(),distanceGroup=new T.Group();outdoor.add(garden,distanceGroup);
function block(x,y,z,w,h,l,m=wallMat){return box(garden,x,y,z,w,h,l,m)}
function wallArch(){
 const cx=.40,z=-7.6,rad=1.05,h=1.60,top=3.15;
 block(-5.83,top/2,z,10.36,top,.38);block(6.35,top/2,z,9.8,top,.38);
 const shape=new T.Shape();shape.moveTo(-rad,top);shape.lineTo(rad,top);shape.lineTo(rad,h);shape.absarc(0,h,rad,0,Math.PI,false);shape.lineTo(-rad,top);
 mesh(new T.ExtrudeGeometry(shape,{depth:.39,bevelEnabled:false,curveSegments:28}),wallMat,garden,cx,0,z-.19);
 for(let i=0;i<17;i++){const start=i*Math.PI/17+.009,end=(i+1)*Math.PI/17-.009;const g=new T.Shape();g.absarc(0,0,rad+.14,start,end,false);g.absarc(0,0,rad,end,start,true);g.closePath();mesh(new T.ExtrudeGeometry(g,{depth:.42,bevelEnabled:false,curveSegments:8}),trimMat,garden,cx,h,z-.205)}
 for(const s of [-1,1])for(let i=0;i<5;i++)block(cx+s*(rad+.072),h*(i+.5)/5,z,.145,h/5-.008,.44,trimMat);
 block(0,top+.04,z,22,.09,.47,trimMat);
}
wallArch();
// The house is a fixed point at the start of the walk.
const domeGeo=new T.SphereGeometry(125,32,16),dc=[],dp=domeGeo.attributes.position,high=new T.Color(0x95bac5),low=new T.Color(0xf2ebd9);
for(let i=0;i<dp.count;i++){const c=low.clone().lerp(high,clamp(dp.getY(i)/72,0,1));dc.push(c.r,c.g,c.b)}
domeGeo.setAttribute('color',attr(new Float32Array(dc),3));mesh(domeGeo,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide,fog:false,depthWrite:false}),distanceGroup);
const maison=new T.Group();garden.add(maison);
const homeMaterials={plaster:material(0xe6d4b6),limestone:material(0xcbb99e),oak:material(0xa58058),frame:material(0x50625d)};
function glazing(){
 const c=document.createElement('canvas');c.width=128;c.height=256;const ctx=c.getContext('2d'),grad=ctx.createLinearGradient(0,0,18,256);
 grad.addColorStop(0,'#c4d7d7');grad.addColorStop(.48,'#8da5a5');grad.addColorStop(.57,'#839691');grad.addColorStop(1,'#59746a');
 ctx.fillStyle=grad;ctx.fillRect(0,0,128,256);for(let i=0;i<3;i++){ctx.fillStyle='rgba(225,238,225,.08)';ctx.beginPath();ctx.moveTo(i*61,-5);ctx.lineTo(i*61+12,-5);ctx.lineTo(i*61-47,260);ctx.lineTo(i*61-62,260);ctx.fill()}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map:t,side:T.DoubleSide,roughness:.34,metalness:.16});
}
homeMaterials.glass=glazing();homeMaterials.door=homeMaterials.glass;
homeMaterials.terrace=homeMaterials.limestone;
const envelope=[];
for(const [k,data] of Object.entries(info.house)){
 const g=geom(data,1000);if(k==='glass'||k==='door'){const uv=[],p=g.attributes.position;for(let i=0;i<p.count;i++)uv.push((p.getX(i)+5.5)/11,p.getY(i)/4.6);g.setAttribute('uv',attr(new Float32Array(uv),2))}
 const mat=homeMaterials[k];mat.side=T.DoubleSide;const o=mesh(g,mat,maison);o.receiveShadow=true;o.castShadow=k!=='glass';if(k!=='oak'&&k!=='terrace')envelope.push(o);
}
// The imported house contains the parapets and pergola posts, but no continuous roof deck.
const roofDeck=material(0xbda58b),roofEdge=material(0xd2bda0);
box(maison,.39,6.16,15.30,10.85,.16,9.74,roofDeck).receiveShadow=true;
const porchRoof=box(maison,-.80,3.62,8.90,7.84,.16,3.80,roofEdge);
porchRoof.receiveShadow=true;porchRoof.castShadow=true;
// The furnished room supplies the window, its uprights and sill from either side.
const openingHalf=3.22*Math.hypot(1,baySlope),leftJamb=gardenThreshold.x-openingHalf,rightJamb=gardenThreshold.x+openingHalf;
for(const [x1,x2] of [[-4.66,leftJamb],[rightJamb,2.96]]){
 const o=block((x1+x2)/2,1.55,10.77,x2-x1,3.10,.23,homeMaterials.plaster);envelope.push(o)
}
envelope.push(block(gardenThreshold.x,3.085,10.78,openingHalf*2,.079,.23,homeMaterials.plaster));
// Terrace threshold and the path meet at the front edge of the supplied STL.
block(.1,.025,7.48,2.02,.06,1.04,trimMat);
block(-3.5,.37,-5.25,2.05,.13,.56,trimMat);for(const x of [-4.18,-2.83])block(x,.175,-5.25,.22,.35,.39,wallMat);
const pathX=z=>z>=-9?.4+.60*Math.sin((z+7.6)*.45):.4+.60*Math.sin((-9+7.6)*.45)+1.75*Math.sin((z+9)*.12)+1.16*Math.sin((z+9)*.055);
const trailWidth=z=>z>6?1.72:1.30+.13*Math.sin(z*.42);
function ribbon(z0,z1,ground=false){
 const p=[],uv=[],ix=[],c=[];const n=Math.ceil((z1-z0)/.7);
 for(let k=0;k<=n;k++){const z=mix(z0,z1,k/n),mid=pathX(z),w=ground?28:trailWidth(z);for(const s of [-1,1]){
  const x=mid+s*w+(ground?0:.035*Math.sin(18*z+s));p.push(x,ground?-.023:0,z);uv.push(x*.8,z*.8);c.push(.95,.95,.95)}
  if(k){const i=k*2;ix.push(i-2,i,i-1,i-1,i,i+1)}}
 const g=new T.BufferGeometry();g.setAttribute('position',attr(new Float32Array(p),3));g.setAttribute('uv',attr(new Float32Array(uv),2));g.setIndex(ix);g.computeVertexNormals();return mesh(g,ground?landMat:pathMat,new T.Group())
}
const plantSpec={maple:[7.8,info.maple],abelia:[1.25,info.abelia],cistus:[1.04,info.cistus],grass:[.34,info.grass],flowers:[.30,info.flowers],tuft:[.17,info.tuft],vine:[2.85,info.vine]};
Object.assign(plantSpec,{maple2:[8.5,info.maple2],abelia2:[1.42,info.abelia2],spike:[3.88,info.spike],sedge:[.52,info.sedge],weed:[.38,info.weed]});
const greenery={};for(const k in plantSpec){greenery[k]=new T.MeshBasicMaterial({map:tex(k+'.webp'),alphaTest:.36,side:T.DoubleSide,color:0xffffff})}
const card=new T.PlaneGeometry(1,1);card.translate(0,.5,0);const sprites=[];
const plantCells=new Map(),tileSize=2,characterRadius=.22;
function plantRadius(k,s){
 if(k==='maple'||k==='maple2')return .20*s;
 if(k==='spike')return .49*s;
 if(k==='abelia'||k==='abelia2'||k==='cistus')return plantSpec[k][0]*plantSpec[k][1]*s*.46;
 return 0;
}
function placeSolid(parent,x,z,r,height){
 if(!r)return x;
 // Keep a continuous, two-person walking corridor through each generated section.
 const mid=pathX(z),d=x-mid,clear=r+1.13;
 if(Math.abs(d)<clear)x=mid+(d<0?-clear:clear);
 const c={x,z,r:r+characterRadius,height:height||r*1.45},size=c.r;
 const keys=[];
 for(let i=Math.floor((x-size)/tileSize);i<=Math.floor((x+size)/tileSize);i++){
  for(let j=Math.floor((z-size)/tileSize);j<=Math.floor((z+size)/tileSize);j++){
   const key=i+','+j;if(!plantCells.has(key))plantCells.set(key,new Set());plantCells.get(key).add(c);keys.push(key)
  }
 }
 (parent.userData.solids??=[]).push({c,keys});return x;
}
function releaseSolids(parent){
 for(const {c,keys} of parent.userData.solids||[])for(const k of keys){const cell=plantCells.get(k);cell.delete(c);if(!cell.size)plantCells.delete(k)}
}
function clearOfPlants(x,z){
 const bucket=plantCells.get(Math.floor(x/tileSize)+','+Math.floor(z/tileSize));
 if(bucket)for(const c of bucket)if((x-c.x)**2+(z-c.z)**2<c.r**2)return false;
 return true;
}
function clearPlantSegment(p,x,z){
 const dx=x-p.x,dz=z-p.z,length2=dx*dx+dz*dz;
 if(!length2)return clearOfPlants(x,z);
 for(let i=Math.floor(Math.min(p.x,x)/tileSize);i<=Math.floor(Math.max(p.x,x)/tileSize);i++){
  for(let j=Math.floor(Math.min(p.z,z)/tileSize);j<=Math.floor(Math.max(p.z,z)/tileSize);j++){
   const bucket=plantCells.get(i+','+j);if(!bucket)continue;
   for(const c of bucket){
    const t=clamp(((c.x-p.x)*dx+(c.z-p.z)*dz)/length2,0,1);
    if((p.x+t*dx-c.x)**2+(p.z+t*dz-c.z)**2<c.r**2)return false;
   }
  }
 }
 return true;
}
function plants(parent,k,x,z,s=1,fixed=false,y=0){
 x=placeSolid(parent,x,z,plantRadius(k,s),plantSpec[k][0]*s);
 const [h,aspect]=plantSpec[k],o=mesh(card,greenery[k],parent,x,y,z);o.scale.set(h*aspect*s,h*s,1);if(!fixed)sprites.push(o);return o;
}
const agaveGeom=geom(info.agave),ap=agaveGeom.attributes.position,an=agaveGeom.attributes.normal,ac=[];
for(let i=0;i<ap.count;i++){const q=clamp(.28+ap.getY(i)*.29+an.getY(i)*.18,0,1),c=new T.Color(0x507b71).lerp(new T.Color(0xa3bcb0),q);ac.push(c.r,c.g,c.b)}
agaveGeom.setAttribute('color',attr(new Float32Array(ac),3));const agaveMat=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.82});
let agaveRadius=0;for(let i=0;i<ap.count;i++)agaveRadius=Math.max(agaveRadius,Math.hypot(ap.getX(i),ap.getZ(i)));
function agave(parent,x,z,s){x=placeSolid(parent,x,z,agaveRadius*s*.91);const o=mesh(agaveGeom,agaveMat,parent,x,0,z);o.scale.setScalar(s);o.rotation.y=z*2.75;return o}
for(const [x,z,h] of [[-2.65,1.3,.78],[2.50,1.08,.76],[-2.28,-1.52,.50],[3.2,-3.70,.77],[-2.80,-5.82,.56]])agave(garden,x,z,h);
for(const [x,z,h] of [[-3.7,-2.0,1.03],[5.6,-5,.87],[-5,4,.84],[6,3,.68],[-3.6,-12,.77]])plants(garden,'maple',x,z,h);
plants(garden,'vine',3.45,-7.25,1.04,true);plants(garden,'vine',-7.40,-7.25,.9,true);
function floorShade(par,x,z,s){const o=shade(par,x,z,2*s,.99*s,.008);o.rotation.z=.4}
for(const [x,z,s] of [[-3.7,-2,2.7],[5.6,-5,2.5],[-3,1.3,.9],[2.5,1.08,.7],[-3.5,-5.25,1.2]])floorShade(garden,x,z,s);
function canopyShade(){
 const c=document.createElement('canvas');c.width=c.height=256;const ct=c.getContext('2d'),rnd=seeded(82);
 for(let i=0;i<3600;i++){const a=rnd()*tau,r=Math.sqrt(rnd())*118,xx=128+Math.cos(a)*r,yy=128+Math.sin(a)*r,s=rnd()*6+1;ct.fillStyle='rgba(48,54,34,'+(.018+(1-r/120)*.05)+')';ct.beginPath();ct.ellipse(xx,yy,s,s*(.3+rnd()*.6),rnd()*tau,0,tau);ct.fill()}
 return new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
}
const canopy=canopyShade();
for(const [x,z,w,l] of [[-1.25,-1.20,8.1,6.6],[3.65,-4.15,6.9,5.9],[-2.10,3.1,4.5,4.5],[-1.8,-11,5.1,4.7]]){const o=mesh(new T.PlaneGeometry(w,l),canopy,garden,x,.017,z);o.rotation.x=-Math.PI/2}
const pebbleShape=new T.IcosahedronGeometry(1,0),gritMat=material(0xffffff);
const pebblePalette=[0xc1ad8c,0xded1b4,0xbaa588,0xb2a38d,0xcebf9e,0xaa9c7d].map(v=>new T.Color(v));
const valleyColor=new T.Color(0x8c976c),ridgeColor=new T.Color(0xa4aa7d);
const distantEarth=new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide});
const farSoil=mesh(new T.PlaneGeometry(354,354),material(0x919b77),distanceGroup,0,-.57,0);farSoil.rotation.x=-Math.PI/2;
function hillHeight(x,z){const away=clamp((Math.abs(x-pathX(z))-11)/33,0,1);return -.18+away*(2.1+1.4*Math.sin(x*.092+z*.039)+1.05*Math.cos(z*.131-x*.066))}
function countryside(par,index){
 const lo=index*18,hi=lo+18,p=[],col=[],ix=[],n=36,m=4;
 for(let j=0;j<=m;j++)for(let i=0;i<=n;i++){
  const x=(i/n-.5)*164,z=mix(lo,hi,j/m),y=hillHeight(x,z);p.push(x,y,z);
  const v=.43+.25*Math.sin(.13*x+.12*z)+.12*Math.cos(x*.24-.30*z);const c=valleyColor.clone().lerp(ridgeColor,v);col.push(c.r,c.g,c.b);
  if(i&&j){const a=j*(n+1)+i;ix.push(a-n-2,a-1,a-n-1,a-n-1,a-1,a)}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',attr(new Float32Array(p),3));g.setAttribute('color',attr(new Float32Array(col),3));g.setIndex(ix);g.computeVertexNormals();mesh(g,distantEarth,par);
 const rnd=seeded(83*index+151),forests=[];
 for(let j=0;j<49;j++){
  const side=j%2?1:-1,cx=(13+Math.pow(rnd(),1.23)*56)*side,cz=lo+rnd()*18;
  if(Math.sin(cx*.12+cz*.081)+Math.cos(cz*.115-cx*.078)<-.6)continue;
  for(let k=0;k<5;k++){const x=cx+(rnd()-.5)*6,z=cz+(rnd()-.5)*5;if(Math.abs(x-pathX(z))<=11.6)continue;const sz=1.2+rnd()*1.8,slim=rnd()<.18;
   forests.push([x,hillHeight(x,z),z,sz,slim,rnd(),rnd()])
  }
 }
 // Leaf cutouts use the same local garden specimens as the near trees.
 for(const [kind,variant] of [['maple',false],['maple2',true]]){
  const pick=forests.filter((q,i)=>Boolean(i%2)===variant);if(!pick.length)continue;
  const geo=new T.PlaneGeometry(1,1);geo.translate(0,.5,0);const trees=new T.InstancedMesh(geo,greenery[kind],pick.length*2),dummy=new T.Object3D();
  pick.forEach(([x,y,z,scale,slim,r,f],i)=>{
   const height=scale*(slim?2.30:1.88),width=height*plantSpec[kind][1]*(slim?.83:1.17);
   const tint=new T.Color().setRGB(.81+r*.13,.84+f*.13,.75+f*.15);
   for(let k=0;k<2;k++){dummy.position.set(x,y-.05,z);dummy.rotation.y=r*Math.PI/2+k*Math.PI/2;dummy.scale.set(width,height,1);dummy.updateMatrix();trees.setMatrixAt(2*i+k,dummy.matrix);trees.setColorAt(2*i+k,tint)}
  });trees.computeBoundingSphere();par.add(trees)
 }
}

const chunks=new Map(),chunkLen=18, temp=new T.Object3D();
function foliageBatch(par,k,entries){
 if(!entries.length)return;
 const [h,aspect]=plantSpec[k],g=card.clone(),m=greenery[k],obj=new T.InstancedMesh(g,m,entries.length);
 // In the distance, a second oblique card retains foliage volume when turning around.
 for(let i=0;i<entries.length;i++){const [x,z,s,ang]=entries[i];temp.position.set(x,0,z);temp.rotation.set(0,ang||0,0);temp.scale.set(h*aspect*s,h*s,1);temp.updateMatrix();obj.setMatrixAt(i,temp.matrix);obj.setColorAt(i,new T.Color().setRGB(.89+.11*Math.abs(Math.sin(x*7)),.91+.085*Math.abs(Math.cos(z*3)),.86+.12*Math.abs(Math.sin(x+z))))}
 obj.computeBoundingSphere();par.add(obj);
}
function makeChunk(index){
 const par=new T.Group(),lo=index*chunkLen,hi=lo+chunkLen,r=seeded(index*71371+1977),start=Math.min(hi,8.85);if(lo>=start)return par;
 countryside(par,index);par.add(ribbon(lo,start,true),ribbon(lo,start));const entries={};for(const k of ['maple','maple2','abelia','abelia2','cistus','grass','sedge','weed','flowers','tuft'])entries[k]=[];
 for(let i=0;i<470;i++){
  const z=mix(lo,start,r()),side=r()<.5?-1:1,dist=trailWidth(z)+.22+(r()**1.8)*8.75,x=pathX(z)+side*dist;
  if(z>5.7&&Math.abs(x)<4.5||Math.abs(z+7.6)<.62)continue;
  const k=i<24&&dist>3.6?(r()<.5?'maple':'maple2'):i<125&&dist>1.9?(r()<.35?'cistus':r()<.55?'abelia2':'abelia'):r()<.31?'grass':r()<.36?'sedge':r()<.36?'weed':r()<.62?'flowers':'tuft';
  const s=(k==='maple'?.66:.65)+r()*(k==='maple'?.3:.82),ang=r()*.65-.325;const plantedX=placeSolid(par,x,z,plantRadius(k,s),plantSpec[k][0]*s);entries[k].push([plantedX,z,s,ang]);if(k!=='maple'&&k!=='maple2')entries[k].push([plantedX+.012,z,s,ang+1.33]);
 }
 for(const k in entries)foliageBatch(par,k,entries[k]);
 if(index<-1){const ag=[],n=5;for(let j=0;j<n;j++){const z=mix(lo,hi,r());ag.push([pathX(z)+(j%2?1:-1)*(2+r()*2.9),z,.43+r()*.43])}const o=new T.InstancedMesh(agaveGeom,agaveMat,n);for(let j=0;j<n;j++){const [x,z,s]=ag[j];temp.position.set(placeSolid(par,x,z,agaveRadius*s*.91),0,z);temp.rotation.set(0,r()*tau,0);temp.scale.setScalar(s);temp.updateMatrix();o.setMatrixAt(j,temp.matrix)}par.add(o)}
 const stones=new T.InstancedMesh(pebbleShape,gritMat,900);
 for(let i=0;i<stones.count;i++){const z=mix(lo,start,r()),edge=r(),x=pathX(z)+(r()<.5?1:-1)*(edge<.64?trailWidth(z)+(.5-r())*.76:r()*trailWidth(z)),v=.008+r()*(edge<.64?.052:.020);temp.position.set(x,.003,z);temp.scale.set(v*(.9+r()*.62),v*.24,v*(.60+r()*.42));temp.rotation.set(0,r()*tau,0);temp.updateMatrix();stones.setMatrixAt(i,temp.matrix);stones.setColorAt(i,pebblePalette[Math.floor(r()*pebblePalette.length)])}
 par.add(stones);par.children.forEach(o=>{if(o.material===landMat||o.material===pathMat)o.receiveShadow=true});outdoor.add(par);return par;
}
function syncChunks(z){
 const n=Math.floor(z/chunkLen);for(let i=n-4;i<=Math.min(0,n+3);i++)if(!chunks.has(i))chunks.set(i,makeChunk(i));
 for(const [i,g] of chunks)if(i<n-4||i>n+3){releaseSolids(g);outdoor.remove(g);g.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.userData.disposeMat)o.material.dispose();if(o.geometry&&o.geometry!==agaveGeom&&o.geometry!==pebbleShape)o.geometry.dispose()});chunks.delete(i)}
}
for(let i=1;i<=4;i++)countryside(garden,i);
syncChunks(3);
// Bands of taller shrubs sit behind the perennials, leaving both the gravel and the view of the veranda open.
const groundUnder=new T.PlaneGeometry(116,66),uvGround=groundUnder.attributes.uv;for(let i=0;i<uvGround.count;i++)uvGround.setXY(i,uvGround.getX(i)*85,uvGround.getY(i)*50);
const gardenFloor=mesh(groundUnder,landMat,garden,0,-.040,14);gardenFloor.rotation.x=-Math.PI/2;gardenFloor.receiveShadow=true;
for(const [x,z,s] of [[-4.8,-4,.94],[5.4,-1.7,.92],[-5.7,4.6,.75],[5.9,6.9,.91],[-6.2,9.3,.84],[7.1,10.7,.83],[-6.5,-10,1.05],[8.5,-15,1.05],[-9.3,17,.93],[10,19,1.11]]){
 plants(garden,'maple2',x,z,s);floorShade(garden,x,z,2.2*s)
}
for(const [x,z,s] of [[-3.55,-3.40,.88],[3.94,-5.15,.78],[-3.53,2.52,.69],[4.6,3.7,.64],[-5.9,6.5,.70]])plants(garden,'spike',x,z,s);
const bedRand=seeded(9407),bedEntries={sedge:[],weed:[],flowers:[],abelia2:[],cistus:[]};
for(let i=0;i<34;i++){
 const z=-7+bedRand()*15,sg=i%2?1:-1,offset=1.70+bedRand()*2.9,x=pathX(z)+sg*offset;
 if(z>6.9&&Math.abs(x)<2.6)continue;
 const k=offset>3?(i%3?'abelia2':'cistus'):i%2?'sedge':'weed';
 for(let j=0;j<(k==='cistus'||k==='abelia2'?3:17);j++){
  const xx=x+(bedRand()-.5)*1.6,zz=z+(bedRand()-.5)*1.9;if(Math.abs(xx-pathX(zz))<trailWidth(zz)+.05||Math.abs(zz+7.6)<.38)continue;
  const scale=.65+bedRand()*.68;bedEntries[k].push([placeSolid(garden,xx,zz,plantRadius(k,scale),plantSpec[k][0]*scale),zz,scale,(bedRand()-.5)*1.5]);
  if(k==='sedge'||k==='weed')bedEntries.flowers.push([xx+.06,zz-.09,.75+bedRand()*1.45,(bedRand()-.5)*1.5])
 }
}
for(const k in bedEntries)foliageBatch(garden,k,bedEntries[k]);
function flowerSpire(){
 const geom=new T.BufferGeometry(),p=[],col=[];
 function prism(from,to,ra,rb,c1,c2){for(let a=0;a<5;a++){
  const t=a*tau/5,q=(a+1)*tau/5,pt=(v,s,r)=>[v[0]+Math.cos(r)*s,v[1],v[2]+Math.sin(r)*s];
  p.push(...pt(from,ra,t),...pt(to,rb,t),...pt(from,ra,q),...pt(from,ra,q),...pt(to,rb,t),...pt(to,rb,q));
  for(const c of [c1,c2,c1,c1,c2,c2])col.push(c.r,c.g,c.b)
 }}
 const green=new T.Color(0x526b43),leaf=new T.Color(0x959e67),violet=new T.Color(0x826da0),flower=new T.Color(0xb59cbb);
 for(let i=0;i<5;i++){const a=i*2.39,h=.25+bedRand()*.22,x=.1*Math.cos(a),z=.12*Math.sin(a);prism([0,0,0],[x,h,z],.006,.003,green,leaf);
  for(let j=0;j<5;j++){const v=h+.018*j;prism([x,v,z],[x+.003,v+.026,z],.015-j*.001,.008,violet,flower)}}
 geom.setAttribute('position',attr(new Float32Array(p),3));geom.setAttribute('color',attr(new Float32Array(col),3));geom.computeVertexNormals();return geom;
}
const spireGeo=flowerSpire(),spires=new T.InstancedMesh(spireGeo,new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:1}),190);
for(let j=0;j<spires.count;j++){const patch=j%16,z=-6.7+patch*.86+(bedRand()-.5)*.91,x=pathX(z)+(patch%2?1:-1)*(1.52+.75*Math.abs(Math.sin(patch))+.5*bedRand());temp.position.set(x,0,z);temp.rotation.set(0,bedRand()*tau,0);temp.scale.setScalar(.70+bedRand()*.70);temp.updateMatrix();spires.setMatrixAt(j,temp.matrix)}
garden.add(spires);
const flight=new T.Group();outdoor.add(flight);
const whiteWings=new T.MeshBasicMaterial({map:tex('papillon-blanc.webp'),side:T.DoubleSide,alphaTest:.22,color:0xffffff});
const insectParts={},mothCount=76,flocks=[],moths=[];
for(const [part,descr] of Object.entries(info.butterfly)){
 const inst=new T.InstancedMesh(geom(descr),whiteWings,mothCount);inst.instanceMatrix.setUsage(T.DynamicDrawUsage);inst.frustumCulled=false;flight.add(inst);insectParts[part]=inst;
}
const flightRand=seeded(71523);
for(let i=0;i<7;i++)flocks.push({angle:flightRand()*tau,time:flightRand()*13,period:11+flightRand()*9,offset:flightRand()*3,side:i%2?-1:1,pos:new T.Vector3()});
for(let i=0;i<mothCount;i++)moths.push({group:i%7,r:flightRand(),a:flightRand()*tau,phase:flightRand()*tau,size:.080+flightRand()*.073,beat:5+flightRand()*3,prev:new T.Vector3(),heading:flightRand()*tau});
const flyer=new T.Object3D(),hinge=new T.Object3D(),matrixWing=new T.Matrix4();
const watchLead=new T.Vector3(pathX(3),0,3),watchFriend=new T.Vector3(pathX(3)+.78,0,3.42);
let flightClock=0,flightFresh=true;
function flutter(dt,absoluteTime){
 const clocked=Number.isFinite(absoluteTime);
 if(clocked){flightClock=absoluteTime;flightFresh=true;}else flightClock+=dt;const t=flightClock;
 const out=where==='jardin',lead=out?player().root.position:watchLead,other=out?partner().root.position:watchFriend;
 for(let i=0;i<flocks.length;i++){
  const f=flocks[i],a=f.angle,phase=(t+f.time)*tau/f.period,near=(1+Math.cos(phase))*.5,s=near*near*(3-2*near),person=i%2?lead:other;
  const dz=Math.sin(a)*3.6-1.8,fx=pathX(lead.z+dz)+f.side*(2.9+f.offset),fz=lead.z+dz;
  const nearX=person.x+f.side*(.56+Math.sin(t*.63+a)*.24),nearZ=person.z-.28+.43*Math.sin(t*.69+a);
  const targetX=mix(fx,nearX,s),targetZ=Math.min(7.65,mix(fz,nearZ,s));
  if(flightFresh)f.pos.set(targetX,0,targetZ);else{f.pos.x=mix(f.pos.x,targetX,1-Math.exp(-dt*2));f.pos.z=mix(f.pos.z,targetZ,1-Math.exp(-dt*2))}
  f.pos.y=mix(.45+.21*Math.sin(t+f.time),1.24+.38*Math.sin(t*.74+i),s);
 }
 for(let i=0;i<moths.length;i++){
  const m=moths[i],f=flocks[m.group],u=t*(.93+m.r*.65)+m.a,spread=.34+m.r*.57;
  const x=f.pos.x+spread*Math.cos(u)+.16*Math.sin(u*2.5),y=f.pos.y+.28*Math.sin(u*1.7+m.phase)+.08*Math.sin(u*4.7),z=f.pos.z+spread*Math.sin(u*1.14+m.phase);
  if(clocked)m.heading=-u+Math.PI/2;
  else if(!flightFresh){const dx=x-m.prev.x,dz=z-m.prev.z;if(Math.abs(dx)+Math.abs(dz)>.00001){const yaw=Math.atan2(dx,dz);m.heading+=Math.atan2(Math.sin(yaw-m.heading),Math.cos(yaw-m.heading))*Math.min(1,dt*10)}}
  m.prev.set(x,y,z);flyer.position.set(x,y,z);flyer.rotation.set(.17*Math.sin(2*u),m.heading,.25*Math.sin(u*1.7),'YXZ');flyer.scale.setScalar(m.size);flyer.updateMatrix();
  insectParts.Body.setMatrixAt(i,flyer.matrix);const beat=.28+.81*Math.sin(t*tau*m.beat+m.phase);for(const [which,side] of [['Wing_Left',-1],['Wing_Right',1]]){
   hinge.position.set(0,0,0);hinge.rotation.set(0,0,side*beat);hinge.updateMatrix();matrixWing.multiplyMatrices(flyer.matrix,hinge.matrix);insectParts[which].setMatrixAt(i,matrixWing);
  }
 }
 flightFresh=false;for(const b of Object.values(insectParts))b.instanceMatrix.needsUpdate=true;
}

// Muted hill profiles close the horizon beyond the playable planting.
for(let ring=0;ring<2;ring++){
 const p=[],ix=[],num=144,r=70+ring*24;
 for(let i=0;i<=num;i++){const a=i/num*tau,x=Math.sin(a)*r,z=Math.cos(a)*r,h=2+ring*1.6+1.9*Math.sin(3*a+ring)+1.35*Math.sin(7*a+1)+.70*Math.sin(12*a+.7);p.push(x,-4,z,x,h,z);if(i){const k=2*i;ix.push(k-2,k-1,k,k,k-1,k+1)}}
 const g=new T.BufferGeometry();g.setAttribute('position',attr(new Float32Array(p),3));g.setIndex(ix);mesh(g,new T.MeshBasicMaterial({color:ring?0xacb9a6:0x90a48c,side:T.DoubleSide}),distanceGroup);
}
const keys=new Set(),stick={x:0,y:0,id:null},orbit={angle:1.07,pitch:.23,radius:3.60,focus:new T.Vector3(-2.19,.78,-1.78),follow:false}, player=()=>encounter.active?encounter.friends.ahmed:actors[role], marker=new T.Vector3(),ray=new T.Raycaster(),pointer=new T.Vector2();
let last=performance.now(),frameHandle=0,reachable=false,panTime=0,jumpLock=0,poseSeat=null,contextLost=false;
// Projection offset keeps the full body visible in the free area beside a dock.
let hudOcclusion={side:'left',fraction:0},hudShiftPixels=0;
const pins={pin:$('pin'),ocre:$('ocre')},keyButtons=[...document.querySelectorAll('[data-role]')];
const partner=()=>encounter.active?encounter.friends.lionel:visiting?visitor:actors[role==='f'?'m':'f'];
const currentPair=()=>[player(),partner()];
const trail=[];let trailTotal=0,homeView=false,windowView=false,approachedWindow=false;
function windowCaption(){
 const b=$('lookHome');const label=where==='jardin'?'Se retourner vers la maison':windowView?'Reprendre la vue du salon':'Regarder par la baie vitrée';
 b.title=label;b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',String(where==='jardin'?homeView:windowView));
}
let beforeWindow=null,centeredOnPlayer=false;
function faceWindow(){centeredOnPlayer=false;travel.reset();detail.reset();
 if(!windowView)beforeWindow={angle:orbit.angle,pitch:orbit.pitch,follow:orbit.follow,focus:orbit.focus.clone(),from:player().root.position.clone()};
 windowView=true;orbit.pitch=.025;orbit.angle=Math.PI-Math.atan(baySlope);orbit.follow=true;windowCaption();hint();
}
function freeCamera(){centeredOnPlayer=false;travel.reset();detail.reset();homeView=windowView=false;windowCaption();hint()}
function leaveWindow(){
 const previous=beforeWindow;freeCamera();
 if(previous){orbit.angle=previous.angle;orbit.pitch=previous.pitch;orbit.follow=previous.follow||previous.from.distanceTo(player().root.position)>.30;if(!orbit.follow)orbit.focus.copy(previous.focus)}
 updateCam(1)
}
function resetTrail(){
 const a=player(),b=partner(),p=a.root.position;trail.length=0;trailTotal=0;trail.push({x:p.x,z:p.z,s:0});
 b.root.visible=visiting||authorRoom;const offset=[[.78,.42],[-.78,.42],[0,.80],[0,-.80],[0,.38]].find(([x,z])=>canWalk(p.x+x,p.z+z)&&freeLine(p,p.x+x,p.z+z))||[0,0];
 b.root.position.set(p.x+offset[0],0,p.z+offset[1]);b.root.rotation.y=Math.PI+.10;b.phase=.47;b.speed=b.sit=0;b.stamp='';animateBody(b,0,0);
}
function freeLine(p,x,z){if(where==='jardin'&&!clearPlantSegment(p,x,z))return false;const n=Math.max(1,Math.ceil(Math.hypot(x-p.x,z-p.z)/.13));for(let i=1;i<=n;i++)if(!canWalk(mix(p.x,x,i/n),mix(p.z,z,i/n)))return false;return true}
function follow(dt){
 if(where!=='jardin')return;const leader=player(),a=partner(),lp=leader.root.position,p=a.root.position,last=trail[trail.length-1],steps=Math.hypot(lp.x-last.x,lp.z-last.z);
 if(steps>.09){trailTotal+=steps;trail.push({x:lp.x,z:lp.z,s:trailTotal});while(trail.length>2&&trail[1].s<trailTotal-10)trail.shift()}
 const back=Math.max(0,trailTotal-.84);let hi=trail.findIndex(q=>q.s>=back);if(hi<0)hi=trail.length-1;const first=trail[Math.max(0,hi-1)],next=trail[hi],k=clamp((back-first.s)/(next.s-first.s||1),0,1);
 let x=mix(first.x,next.x,k),z=mix(first.z,next.z,k);
 // Walk next to the leader on broad ground, then fall into single file in the arch.
 let hx=next.x-first.x,hz=next.z-first.z,dist=Math.hypot(hx,hz);if(dist<.001){hx=Math.sin(leader.root.rotation.y);hz=Math.cos(leader.root.rotation.y);dist=1}
 const lateral=.68*clamp((Math.abs(z+7.6)-.55)/1.5,0,1),xx=x-hz/dist*lateral,zz=z+hx/dist*lateral;
 if(canWalk(xx,zz)&&freeLine(p,xx,zz)){x=xx;z=zz}
 if(!freeLine(p,x,z)){
  for(let j=hi;j>=0;j--){const q=trail[j];if(Math.hypot(p.x-q.x,p.z-q.z)>.12&&freeLine(p,q.x,q.z)){x=q.x;z=q.z;break}}
 }
 const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz),speed=Math.min(2.25,Math.max(0,(d-.10)*4)),step=Math.min(d,speed*dt);
 let yaw=a.root.rotation.y,walk=false;
 if(d>.13&&step>0){const qx=p.x+dx/d*step,qz=p.z+dz/d*step;if(freeLine(p,qx,qz)){p.x=qx;p.z=qz;walk=true;yaw=Math.atan2(dx,dz)}}
 else if(talkOpen||leader.speed<.08)yaw=Math.atan2(lp.x-p.x,lp.z-p.z);
 a.root.rotation.y+=Math.atan2(Math.sin(yaw-a.root.rotation.y),Math.cos(yaw-a.root.rotation.y))*Math.min(1,dt*7);
 a.speed=mix(a.speed,walk?Math.min(1,speed/1.50):0,Math.min(1,dt*10));if(a.speed<.018)a.speed=0;
 animateBody(a,a.speed,null,dt*a.speed);trackHarness(a);trackHarness(leader);
}
function lookAtHome(){centeredOnPlayer=false;
 cancelReveal();if(shelfView)setShelfView(false);
 if(where==='salon'){
  if(windowView){leaveWindow()}else{faceWindow();updateCam(1)}return;
 }
 homeView=!homeView;const p=player().root.position;
 orbit.angle=homeView?Math.atan2(p.x-.28,p.z-14.1):.23;orbit.pitch=homeView?.155:.20;orbit.radius=homeView?4.15:3.68;orbit.follow=true;
 $('lookHome').setAttribute('aria-pressed',String(homeView));updateCam(1)
}

const walkBlocks=[[-.49,1.62,-2.58,-2.16],[-3.08,-2.18,-1.17,1.64],[-2.79,-2.35,-1.56,-1.10],[-1.84,-1.14,.83,1.93],[-1.00,.02,-.34,.66],[.96,1.74,-.71,1.04],[2.54,3.15,-.43,.79]];
for(let x of [.42,2.30])for(let z of [-.12,.51])walkBlocks.push([x-.20,x+.20,z-.2,z+.2]);walkBlocks.push([1.13,1.61,-1.47,-1.08],[1.20,1.64,1.41,1.88]);
function canWalk(x,z){
 if(where==='salon'){
  if(!roomFree(x*100+700,z*100-800))return false;
  for(const bag of Object.values(bags)){const b=bag.userData.restBounds;if(x>b.min.x-.12&&x<b.max.x+.12&&z>b.min.z-.12&&z<b.max.z+.12)return false}
  return !walkBlocks.some(([a,b,c,d])=>x>a-.1&&x<b+.1&&z>c-.1&&z<d+.1)
 }
 if(z>10.38||Math.abs(x-pathX(z))>11.4)return false;
 if(Math.abs(z+7.6)<.39&&Math.abs(x-.40)>.83)return false;
 return clearOfPlants(x,z)&&!(Math.abs(x+3.5)<1.18&&Math.abs(z+5.25)<.46)
}
function setRole(id){
 if(soloAhmed&&id!=='m')return;
 if(where!=='salon'||id===role||talkOpen||encounter.active)return;
 if(shelfView)setShelfView(false);if(sitting)getUp();actors[role].body.visible=true;freeCamera();approachedWindow=false;role=id;presence();goal=null;keys.clear();for(const a of Object.values(actors)){a.sit=0;a.speed=0;a.stamp='';animateBody(a,0,0)}
 keyButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.role===id)));orbit.follow=false;hint();
}
keyButtons.forEach(b=>b.onclick=()=>{
 const old=role;setRole(b.dataset.role);
 if(old!==role)window.dispatchEvent(new CustomEvent('salon-role-change',{detail:role==='f'?'femme':'homme'}));
});
function setLocation(out){centeredOnPlayer=false;travel.reset();detail.reset();$('cameraPad').hidden=out;
 where=out?'jardin':'salon';shelfView=false;$('shelves').hidden=out;$('shelfLabel').textContent='Bibliothèque';$('shelves').setAttribute('aria-pressed','false');$('shelfActions').hidden=true;refreshFlight();
 indoor.matrix.copy(out?roomToGarden:identity);outdoor.matrix.copy(out?identity:gardenToRoom);
 indoor.updateMatrixWorld(true);outdoor.updateMatrixWorld(true);
 for(const o of envelope)o.visible=out;for(const o of roomParts)o.visible=true;
 if(!out){syncChunks(3);if(player().root.position.z< -24)flightFresh=true}
 view.dataset.place=where;document.body.dataset.place=where;
 scene.background=new T.Color(out?0xdce7df:0xe2d7c2);scene.fog=new T.FogExp2(0xe2e8db,.014);
 $('place').textContent=cinemaArrival?(out?'Le parc · La Croisée des Âmes':'La Croisée des Âmes'):(out?'Le jardin':'Le salon');$('return').hidden=!out;$('actors').hidden=out;for(const b of Object.values(pins))b.hidden=out;
 $('rise').hidden=true;goal=null;sitting=null;poseSeat=null;
 $('lookHome').hidden=false;homeView=windowView=approachedWindow=false;windowCaption();keys.clear();releaseStick();hint();$('notice').textContent=out?'Le sac est sur ton dos. Tu es dans le jardin.':'De retour au salon.';
}
function equip(which){
 if(invitationScene?.active||arrivalFinale?.active)return;
 if(encounter.active){if(where==='salon')walkToBay();return;}
 releaseSeatRoute();companionSeat=null;conversation=null;rising=false;
 if(where!=='salon'||!bags[which])return;const actor=player();chosen=which;setLocation(true);const o=bags[which];
 actor.root.position.set(pathX(3.0),0,3.0);actor.root.rotation.y=Math.PI;actor.body.position.y=0;actor.sit=actor.speed=actor.phase=0;actor.stamp='';animateBody(actor,0,0);
 resetTrail();wear(actor,o);wear(partner(),bags[which==='pin'?'ocre':'pin']);
 revealStart=performance.now();orbit.angle=Math.PI+.06;orbit.pitch=.15;orbit.radius=3.66;orbit.follow=true;orbit.focus.copy(actor.root.position).add(new T.Vector3(.22,1.04,-.32));jumpLock=performance.now()+240;updateCam(1);canvas.focus({preventScroll:true});
}
function returnHome(){
 if(encounter.active){leaveReunion();return;}
 if(where!=='jardin')return;cancelReveal();resetAir();for(const a of [...Object.values(actors),visitor])unwear(a);
 chosen=null;setLocation(false);actorHome();resetView();canvas.focus({preventScroll:true})
}
function resetView(){centeredOnPlayer=false;travel.reset();detail.reset();
 orbit.follow=false;orbit.angle=1.07;orbit.pitch=.23;orbit.radius=3.60;orbit.focus.set(-2.19,.78,-1.78);updateCam(1)
}
const zoneLabel=$('hint');
function hint(){
 zoneLabel.textContent=shelfView?'Touche un livre pour le découvrir.':air.mode==='landing'?'Le duo rejoint l’allée.':skyMode()?'Dirige le vol avec le joystick.':air.mode==='ready'?'Un grand battement pour décoller.':windowView?'Glisse pour regarder autour de toi.':where==='salon'?(sitting?'Touche « Se lever » pour repartir.':'Touche un sac pour le mettre et sortir.'):'Suis l’allée et passe sous l’arche.';
}
function feetAt(seat,a){
 const gap=seat.gap;
 return [seat.center[0]+gap*Math.sin(seat.yaw),0,seat.center[1]+gap*Math.cos(seat.yaw)];
}
let seatRoute=null,companionSeat=null,conversation=null,rising=false;
function releaseSeatRoute(){seatRoute=null;}
function getUp(){
 rising=false;
 if(!sitting)return;const a=player(),p=feetAt(sitting,a);a.root.position.set(...p);sitting=null;poseSeat=null;a.sit=0;a.stamp='';$('rise').hidden=true;hint();animateBody(a,0,0);
}
function walkToSeat(s){
 if(where!=='salon'||s===companionSeat)return;
 if(sitting)getUp();
 const a=player(),end=feetAt(s,a);
 const route=roomPath([a.root.position.x*100+700,a.root.position.z*100-800],[end[0]*100+700,end[2]*100-800]);
 if(!route)return;
 seatRoute={seat:s,points:route.slice(1).map(([x,z])=>[(x-700)/100,(z+800)/100])};
 keys.clear();releaseStick();goal=null;freeCamera();orbit.follow=true;
}
function sitAt(s){if(!travel.active)detail.reset();
 rising=false; if(where!=='salon')return;freeCamera();const a=player();a.root.position.set(...feetAt(s,a));a.root.rotation.y=s.yaw;sitting=s;poseSeat=s;a.sit=0;a.speed=0;goal=null;$('rise').hidden=false;orbit.follow=true;hint()
}
Object.entries(pins).forEach(([k,b])=>b.onclick=()=>equip(k));$('return').onclick=returnHome;$('rise').onclick=()=>{if(sitting)rising=true;};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{$('notice').textContent='Le plein écran n’est pas disponible dans ce lecteur.'}};
document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Quitter le plein écran':'Plein écran')});
const help=$('help');$('helpButton').onclick=()=>help.showModal();$('closeHelp').onclick=()=>help.close();help.addEventListener('click',e=>{if(e.target===help)help.close()});
function updateCam(dt){
 focusShot=null;
 if(soloAhmed){const a=actors.m,p=a.root.position,yaw=a.root.rotation.y,dist=view.clientWidth<view.clientHeight?2.35:2.05;cam.clearViewOffset();cam.fov=44;cam.position.set(p.x+Math.sin(yaw)*dist,p.y+1.53,p.z+Math.cos(yaw)*dist);cam.lookAt(p.x,p.y+1.18,p.z);cam.updateProjectionMatrix();cam.updateMatrixWorld(true);return;}

 if(arrivalFinale?.active||invitationScene?.active)return;
 if(introDirector?.active){
   const smooth=1-Math.exp(-Math.max(0,dt)*introDirector.speed);
   cam.position.lerp(introDirector.position,smooth);
   cam.lookAt(introDirector.focus);
   if(cam.fov!==introDirector.fov){cam.fov=introDirector.fov;cam.updateProjectionMatrix();}
   cam.updateMatrixWorld();
   return;
 }

 const a=player(),out=where==='jardin',w=view.clientWidth,h=view.clientHeight;
 if(out&&revealStart!==null){const elapsed=(performance.now()-revealStart)/1000;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t=reduced?(elapsed>1.35?1:0):eased((elapsed-1.05)/2.65);
  orbit.angle=mix(Math.PI+.06,.08,t);orbit.pitch=.145+.17*Math.sin(Math.PI*t);orbit.radius=3.85-1.58*Math.sin(Math.PI*t);
  if(t>=1)revealStart=null;
 }
 if(orbit.follow){const ft=a.root.position.clone();ft.y=sitting?1.02:out?.98:.9;if(skyMode())ft.y+=a.root.position.y+(air.figure?.type==='loop'?.62:0);
  if(out&&!centeredOnPlayer&&(!encounter.active||encounter.chatView)){const friend=partner().root.position;ft.x+=(friend.x-ft.x)*(skyMode()?.46:.36);ft.z+=(friend.z-ft.z)*(skyMode()?.46:.32);ft.x+=.12*Math.cos(orbit.angle)-.40*Math.sin(orbit.angle);ft.z-=.19*Math.sin(orbit.angle)+.40*Math.cos(orbit.angle)}orbit.focus.lerp(ft,Math.min(1,dt*8));}
 const nearBay=!centeredOnPlayer&&!out&&orbit.follow&&!sitting?clamp((a.root.position.z-1.02)/1.05,0,1):0;
 const portrait=w<h,rad=(skyMode()?Math.max(orbit.radius,portrait?6.60:4.85):orbit.radius)*(portrait?(out?1.13:1.23):1);
 const hp=rad*Math.cos(orbit.pitch);cam.position.set(orbit.focus.x+Math.sin(orbit.angle)*hp,orbit.focus.y+Math.sin(orbit.pitch)*rad,orbit.focus.z+Math.cos(orbit.angle)*hp);
 if(out&&cam.position.z>10.22&&Math.abs(cam.position.x)<5.3)cam.position.z=10.22;
 let fieldOfView=48;
 if(centeredOnPlayer){cam.lookAt(orbit.focus);
 }else if(out&&air.mode!=='off'&&!encounter.active){
  fieldOfView=frameWingedPair(cam,portrait?55:49,w/h);
 }else if(out&&encounter.active&&air.mode!=='off'){
  if(encounter.chatView&&exchange.active){reunionCamera(portrait);}
  else if(encounter.chatView){cam.lookAt(orbit.focus);}
  else if(air.front){const radius=portrait?6.2:4.8;cam.position.set(orbit.focus.x+Math.sin(orbit.angle)*radius,orbit.focus.y+.45,orbit.focus.z+Math.cos(orbit.angle)*radius);}
  if(!encounter.chatView||!exchange.active)cam.lookAt(orbit.focus);fieldOfView=portrait?54:47;
 }else if(shelfView){
  const target=new T.Vector3(-3.12,1.58,.22);const portrait=w<h;fieldOfView=portrait?51:44;
  const dist=Math.max(3.02,2.44/Math.max(.38,w/h));cam.position.set(target.x+dist,1.50,.62);cam.lookAt(target);
 }else if(out&&homeView){
  const nearHouse=a.root.position.z>-9,portrait=w<h,look=new T.Vector3(.58,nearHouse?2.18:1.54,nearHouse?10.35:a.root.position.z+4.1);
  const eye=nearHouse?new T.Vector3(pathX(portrait?-6.35:-3.15),2.52,portrait?-6.35:-3.15):new T.Vector3(a.root.position.x-.48,2.05,a.root.position.z-3.90);
  fieldOfView=nearHouse?(portrait?67:54):48;cam.position.copy(eye);cam.lookAt(look);
 }else if(windowView){
  const p=a.root.position,dx=-Math.sin(orbit.angle),dz=-Math.cos(orbit.angle);
  cam.position.set(clamp(p.x+dz*.25-dx*.12,-3.08,3.08),sitting?1.17:1.57,p.z-dx*.25-dz*.12);
  cam.lookAt(cam.position.x+dx*8,cam.position.y-Math.tan(orbit.pitch)*8,cam.position.z+dz*8);
 }else if(!out&&encounter.active&&!windowView){
  cam.position.y=Math.min(cam.position.y,2.83);cam.lookAt(orbit.focus);
 }else if(nearBay>0&&Math.cos(orbit.angle)<-.1){
  const eyeHeight=orbit.focus.y+(1.52-orbit.focus.y)*nearBay;
  cam.position.y=Math.max(cam.position.y,eyeHeight);
  cam.lookAt(orbit.focus.x,eyeHeight,orbit.focus.z+nearBay*.8)
 }else cam.lookAt(orbit.focus);
 player().body.visible=!windowView;
 if(!focusShot&&cam.fov!==fieldOfView){cam.fov=fieldOfView;cam.updateProjectionMatrix()}
 if(conversation&&where==='salon'&&!shelfView)memberCamera();
 if(travel.active&&!detail.active){focusShot=null;travel.apply(dt);}
 if(detail.active){focusShot=null;detail.apply();}
 // Move only the framing, never resize the 3D canvas or change the avatar.
 const enabled=document.body.classList.contains('unified-hud');
 const desired=enabled?(hudOcclusion.side==='left'?-1:1)*Math.min(.46,hudOcclusion.fraction)*w*.5:0;
 const gain=1-Math.exp(-Math.max(0,dt)*9);
 hudShiftPixels+=gain*(desired-hudShiftPixels);
 if(Math.abs(hudShiftPixels)>.4)cam.setViewOffset(w,h,hudShiftPixels,0,w,h);
 else if(cam.view?.enabled)cam.clearViewOffset();
 focusBookPrint();cam.updateMatrixWorld();
 const gardenEye=out?cam.position:marker.copy(cam.position).applyMatrix4(roomToGarden);
 for(const o of sprites)o.rotation.y=Math.atan2(gardenEye.x-o.position.x,gardenEye.z-o.position.z);
 const anchor=out?a.root.position:watchLead;distanceGroup.position.set(anchor.x,0,anchor.z);
 if(out)syncChunks(anchor.z);
 if(encounter.active&&exchange.active)placeSkyBubbles(w,h);
 if(!out){
  for(const o of roomParts){const k=o.userData.wall;o.visible=!(k===1&&cam.position.z< -2.57||k===2&&cam.position.x>3.21||k===3&&cam.position.x< -3.20||k===4&&cam.position.z>2.489+baySlope*cam.position.x)}
  const outPins={};for(const [name,b] of Object.entries(pins)){
   const bag=bags[name];marker.copy(bag.userData.pinAt).project(cam);const x=(marker.x*.5+.5)*w,y=(-marker.y*.5+.5)*h;
   outPins[name]=[x,y];b.hidden=!!conversation||detail.active&&detail.distance<.65||shelfView||windowView||marker.z>1||marker.z< -1||x<10||x>w-10||y<0||y>h-10;
  }
  const p=outPins.pin,q=outPins.ocre;if(!pins.pin.hidden&&!pins.ocre.hidden&&Math.abs(p[0]-q[0])<(pins.pin.offsetWidth+pins.ocre.offsetWidth)/2+5&&Math.abs(p[1]-q[1])<35){if(p[1]<q[1])p[1]-=36;else q[1]-=36}
  for(const [k,[x,y]] of Object.entries(outPins)){pins[k].style.left=clamp(x,34,w-34)+'px';pins[k].style.top=clamp(y,37,h-15)+'px'}
 }
}
function updateSize(){const r=view.getBoundingClientRect();if(!r.width||!r.height)return;const size=renderer.getSize(new T.Vector2());if(Math.abs(size.x-r.width)<.01&&Math.abs(size.y-r.height)<.01)return;renderer.setSize(r.width,r.height,false);cam.aspect=r.width/r.height;cam.updateProjectionMatrix();if(invitationScene?.active)invitationScene.sample(invitationScene.elapsedMs);else if(arrivalFinale?.active)arrivalFinale.sample(arrivalFinale.elapsedMs);else updateCam(0);if(document.body.classList.contains('ready'))renderer.render(scene,cam)}
new ResizeObserver(updateSize).observe(view);
function move(dt){
 if(soloAhmed){animateBody(actors.m,0,null,dt);return;}
 if(introAuthorized&&introCurrent==='sofa'){
  introSeatClock=Math.min(1,introSeatClock+dt*.60);
  const settle=introSeatClock*introSeatClock*(3-2*introSeatClock);
  for(const [a,id] of [[actors.m,'chair'],[actors.f,'sofa2']]){
   a.sit=settle;const seat=seats.find(q=>q.id===id);
   a.stamp='';animateBody(a,0,seat);
  }
  return;
 }
 if(introAuthorized&&introCurrent==='white')return;
 if(introAuthorized&&introCurrent==='dojo'){
  const a=player();let dx=stick.x, dz=-stick.y;
  if(keys.has('arrowup')||keys.has('z')||keys.has('w'))dz+=1;
  if(keys.has('arrowdown')||keys.has('s'))dz-=1;
  if(keys.has('arrowright')||keys.has('d'))dx+=1;
  if(keys.has('arrowleft')||keys.has('q')||keys.has('a'))dx-=1;
  const length=Math.hypot(dx,dz),moving=length>.06;
  if(moving){dx/=Math.max(1,length);dz/=Math.max(1,length);
   const c=Math.cos(orbit.angle),s=Math.sin(orbit.angle);
   const vx=dx*c-dz*s,vz=-dx*s-dz*c;
   a.root.position.x=clamp(a.root.position.x+vx*dt*2,-4.1,4.1);
   a.root.position.z=clamp(a.root.position.z+vz*dt*2,-2.9,3.7);
   a.root.rotation.y=Math.atan2(vx,vz);
   a.phase=(a.phase+dt*1.4)%1;
  }
  a.speed=mix(a.speed,moving?.85:0,Math.min(1,dt*7));
  animateBody(a,a.speed,0,dt*a.speed);
  orbit.follow=true;
  return;
 }
 const a=player();if(skyMode()){advanceAir(dt);return}
 if(shelfView&&(stick.x||stick.y||keys.size))setShelfView(false);
 if(revealStart!==null&&(stick.x||stick.y||keys.size))cancelReveal();
 let x=stick.x,z=-stick.y;
 if(keys.has('arrowup')||keys.has('w')||keys.has('z'))z+=1;
 if(keys.has('arrowdown')||keys.has('s'))z-=1;
 if(keys.has('arrowright')||keys.has('d'))x+=1;
 if(keys.has('arrowleft')||keys.has('a')||keys.has('q'))x-=1;
 let len=Math.hypot(x,z),dx=0,dz=0;
 if(len>.04){travel.reset();detail.reset();releaseSeatRoute();goal=null;encounter.route=null;}
 if(encounter.active&&encounter.route&&!goal){const next=encounter.route.shift();if(next)goal=next;else{encounter.route=null;if(where==='salon')crossBay();}}
 if(seatRoute&&!goal){
   const p=seatRoute.points.shift();
   if(p)goal={x:p[0],z:p[1]};else{const seat=seatRoute.seat;seatRoute=null;sitAt(seat);}
 }
 if(len>.04){
  if(homeView)freeCamera();
  if(sitting)getUp();goal=null;conversation=null;const den=Math.max(1,len);x/=den;z/=den;const c=Math.cos(orbit.angle),s=Math.sin(orbit.angle);dx=x*c-z*s;dz=-x*s-z*c;len=Math.min(1,len);
 }else if(goal){dx=goal.x-a.root.position.x;dz=goal.z-a.root.position.z;const distance=Math.hypot(dx,dz);if(distance<(seatRoute?.055:.12)){goal=null}else{dx/=distance;dz/=distance;len=1}}
 let moved=false;
 if(len>.04){const speed=where==='jardin'?1.58:1.02,step=speed*dt,p=a.root.position;
  const xx=p.x+dx*step,zz=p.z+dz*step;if(seatRoute||encounter.route||freeLine(p,xx,zz)){p.x=xx;p.z=zz;moved=true}
  else if(Math.abs(dx)>.03&&freeLine(p,xx,p.z)){p.x=xx;moved=true}
  else if(Math.abs(dz)>.03&&freeLine(p,p.x,zz)){p.z=zz;moved=true}
  else goal=null;
  const desired=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(desired-a.root.rotation.y),Math.cos(desired-a.root.rotation.y));a.root.rotation.y+=delta*Math.min(1,dt*13);orbit.follow=true;
 }
 if(where==='salon'){
  const p=a.root.position,dist=2.48944+baySlope*p.x-p.z;
  if(dist>1.05){if(approachedWindow&&windowView&&moved&&dz<0)leaveWindow();approachedWindow=false;}
  if(encounter.active&&!sitting&&dist<.40&&Math.abs(p.x)<.63&&!encounter.route){crossBay();return;}
  if(!encounter.active&&!sitting&&!approachedWindow&&dist<.84&&((moved&&dz>.38&&Math.cos(orbit.angle)<-.30)||(!moved&&a.speed>.04))){
   approachedWindow=true;faceWindow();
  }
 }
 a.speed=mix(a.speed,moved?len:0,Math.min(1,dt*11));if(a.speed<.015)a.speed=0;
 if(sitting){a.sit=clamp(a.sit+(rising?-1:1)*dt/.96,0,1);if(rising&&a.sit===0)getUp();}
 animateBody(a,a.speed,poseSeat,dt*a.speed);
 if(companionSeat&&!encounter.active)animateBody(partner(),0,companionSeat);
 if(!encounter.active&&chosen&&revealStart===null&&(air.mode!=='ready'||a.speed>.05))follow(dt);if(air.mode!=='off')advanceAir(dt);
}
function releaseStick(){stick.x=stick.y=0;stick.id=null;$('thumb').style.transform='translate(0,0)'}
const pad=$('pad');
function padMove(e){
 const b=pad.getBoundingClientRect(),x=(e.clientX-b.left-b.width/2)/(b.width*.34),y=(e.clientY-b.top-b.height/2)/(b.height*.34);
 const length=Math.hypot(x,y),gain=e.pointerType==='touch'?touchStickScale(length):1/Math.max(1,length);
 stick.x=x*gain;stick.y=y*gain;
 $('thumb').style.transform='translate('+stick.x*22+'px,'+stick.y*22+'px)';
}
pad.onpointerdown=e=>{e.preventDefault();stick.id=e.pointerId;pad.setPointerCapture(e.pointerId);padMove(e)};
pad.onpointermove=e=>{if(e.pointerId===stick.id)padMove(e)};pad.onpointerup=pad.onpointercancel=pad.onlostpointercapture=e=>{if(e.pointerId===stick.id)releaseStick()};
function takeCamera(){centeredOnPlayer=false;
 if(!travel.active||detail.active)travel.capture();
 if(shelfView)setShelfView(false,true);
 if(windowView){windowView=false;windowCaption();hint();}
 detail.reset();manualShot();travel.apply(0);
}
const cameraPad=$('cameraPad');
bindCameraStick(cameraPad,takeCamera,(x,z)=>travel.motion.input(x,z));
bindCameraHeight(document.querySelector('.camera-height'),takeCamera,travel.motion);
window.addEventListener('blur',()=>travel.motion.stop());
document.addEventListener('visibilitychange',()=>{if(document.hidden)travel.motion.stop();});
const held=new Map();let touch=null,lastTap=null,pinch=0,pinchStart=null;
function midPoint(){const [a,b]=held.values();return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,span:Math.hypot(a.x-b.x,a.y-b.y)};}
$('recenter').onclick=()=>{
 cancelTap();cancelReveal();if(shelfView)setShelfView(false);
 freeCamera();manualShot();air.front=false;refreshFlight();
 const a=player();
 centeredOnPlayer=true;orbit.follow=true;orbit.angle=a.root.rotation.y;orbit.pitch=.09;orbit.radius=sitting?2.15:2.75;
 updateCam(1);canvas.focus({preventScroll:true});
};
function manualShot(){if(conversation){conversation=null;window.dispatchEvent(new Event('salon-manual-camera'));}if(encounter.active)encounter.chatView=false;}
canvas.addEventListener('pointerdown',e=>{
 if(e.button>0)return;if(revealStart!==null)cancelReveal();canvas.focus();canvas.setPointerCapture(e.pointerId);
 held.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(held.size===2){cancelTap();travel.motion.stop();const mid=midPoint();pinchStart=mid;pinch=mid.span;detail.begin(mid.x,mid.y);manualShot();if(touch)touch.moved=true;}
 else touch={x:e.clientX,y:e.clientY,moved:false};
});
canvas.addEventListener('pointermove',e=>{
 const prev=held.get(e.pointerId);if(!prev)return;const gain=touchGestureGain(e.pointerType);
 const dx=(e.clientX-prev.x)*gain,dy=(e.clientY-prev.y)*gain;
 held.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(held.size===2){
  const mid=midPoint();
  if(mid.span>0&&pinch>0&&pinchStart){
   const x=mix(pinchStart.x,mid.x,gain),y=mix(pinchStart.y,mid.y,gain);
   detail.zoom((pinch/mid.span)**gain,x,y);
  }
  pinch=mid.span;return;
 }
 if(touch&&!touch.moved&&Math.hypot(e.clientX-touch.x,e.clientY-touch.y)>5)touch.moved=true;
 if(!touch?.moved)return;cancelTap();
 if(travel.active){if(detail.active)takeCamera();travel.look(dx,dy);return;}
 if(conversation&&!detail.active)detail.begin(canvas.getBoundingClientRect().x+canvas.clientWidth*.5,canvas.getBoundingClientRect().y+canvas.clientHeight*.5);
 manualShot();if(detail.active){detail.orbit(dx,dy);return;}
 if(air.front){orbit.angle=air.heading-.065;air.front=false;refreshFlight();}if(windowView)approachedWindow=true;else if(homeView)freeCamera();
 orbit.angle-=dx*.007;orbit.pitch=clamp(orbit.pitch+dy*.004,windowView?-.62:-.06,windowView?.68:.93);
});
const plane=new T.Plane(new T.Vector3(0,1,0),0),point=new T.Vector3();
let singleTapTimer;
function cancelTap(){clearTimeout(singleTapTimer);lastTap=null;}
function tap(e){
 if(performance.now()<jumpLock)return;
 const x=e.clientX,y=e.clientY,now=performance.now();
 const twice=lastTap&&now-lastTap.t<410&&Math.hypot(x-lastTap.x,y-lastTap.y)<22;
 cancelTap();
 if(!twice)lastTap={t:now,x,y};
 const rect=canvas.getBoundingClientRect();pointer.set((x-rect.left)/rect.width*2-1,1-(y-rect.top)/rect.height*2);ray.setFromCamera(pointer,cam);
 if(where!=='salon'&&air.mode!=='off')return;
 if(!twice){
   if(where==='salon'){
     const volume=ray.intersectObjects(bookHits,false)[0];
     if(volume&&(shelfView||detail.active||travel.active||player().root.position.distanceTo(volume.point)<1.85)){
       singleTapTimer=setTimeout(()=>openBooks(volume.object.userData.book),410);return;
     }
     if(!shelfView){const bag=ray.intersectObjects(Object.values(bags),false)[0];if(bag)singleTapTimer=setTimeout(()=>equip(bag.object.userData.bag),410);}
   }else if(ray.intersectObjects(bayPanes,false).length&&player().root.position.z>4.9)singleTapTimer=setTimeout(returnHome,410);
   return;
 }
 const roots=where==='salon'?[indoor,...currentPair().map(a=>a.root),actors.f.root]:[...currentPair().map(a=>a.root),outdoor];
 const hit=detail.pick(x,y,[...new Set(roots)].filter(o=>o.visible));
 if(hit){
   let object=hit.object,book;
   const figures=[...new Set([...currentPair(),actors.f,actors.m])];
   while(object){
     const actor=figures.find(a=>a.root===object);
     if(actor){
       const heading=new T.Vector3(Math.sin(actor.root.rotation.y),.025,Math.cos(actor.root.rotation.y)).normalize();
       manualShot();travel.reset();detail.framePoint(headCenter(actor),actor.root,.46*Math.max(1,.65/cam.aspect),heading);return;
     }
     if(object.userData.book!==undefined)book=object;
     object=object.parent;
   }
   if(book){
     const page=bookHits.find(p=>p.userData.book===book.userData.book&&!p.userData.spine);
     manualShot();travel.reset();detail.framePoint(page.getWorldPosition(new T.Vector3()),page,.44*Math.max(1,.70/cam.aspect));return;
   }
   if(where==='salon'&&roomParts.includes(hit.object)){
     const chair=seats.filter(s=>Math.abs(hit.point.x-s.center[0])<.48&&Math.abs(hit.point.z-s.center[1])<.49&&hit.point.y>.18&&hit.point.y<1.35)
       .sort((a,b)=>Math.hypot(hit.point.x-a.center[0],hit.point.z-a.center[1])-Math.hypot(hit.point.x-b.center[0],hit.point.z-b.center[1]))[0];
     if(chair){walkToSeat(chair);return;}
   }
   if(hit.point.y>.11&&hit.object!==ceiling){
     manualShot();travel.reset();detail.framePoint(hit.point,hit.object,Math.min(.65,Math.max(.12,hit.distance*.62)));return;
   }
 }
 if(!shelfView&&ray.ray.intersectPlane(plane,point)&&canWalk(point.x,point.z)){if(sitting)getUp();releaseSeatRoute();goal={x:point.x,z:point.z};}
}
canvas.onpointerup=e=>{if(!held.has(e.pointerId))return;const ok=held.size===1&&touch&&!touch.moved;held.delete(e.pointerId);if(ok)tap(e);touch=null};
canvas.onpointercancel=e=>{cancelTap();held.delete(e.pointerId);touch=null};
let lastWheel=-Infinity,lastWheelX=0,lastWheelY=0;
canvas.addEventListener('wheel',e=>{
 e.preventDefault();const now=performance.now();
 if(!detail.active||now-lastWheel>240||Math.hypot(e.clientX-lastWheelX,e.clientY-lastWheelY)>12)detail.begin(e.clientX,e.clientY);
 lastWheel=now;lastWheelX=e.clientX;lastWheelY=e.clientY;manualShot();
 const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?canvas.clientHeight:1);
 detail.zoom(Math.exp(clamp(delta,-900,900)*.001),e.clientX,e.clientY);
},{passive:false});
const moveKeys=new Set(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','z','q']);
window.addEventListener('keydown',e=>{if(invitationScene?.active||arrivalFinale?.active||e.target.closest?.('input,textarea,select,[contenteditable=true]')||document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key.toLowerCase();if(moveKeys.has(k)){e.preventDefault();keys.add(k)}else if(where==='salon'&&!e.repeat&&['1','2'].includes(k))equip(k==='1'?'pin':'ocre')});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();releaseStick();held.clear();touch=null});help.addEventListener('close',()=>canvas.focus());
document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden){keys.clear();releaseStick()}});
let frameCost=35,qualityFrames=0;
function adjustResolution(ms){
 if(!Number.isFinite(ms)||ms<=0||document.hidden)return;frameCost=frameCost*.90+Math.min(220,ms)*.10;
 if(++qualityFrames<20)return;qualityFrames=0;
 const old=renderer.getPixelRatio(),high=Math.min(where==='salon'?2:1.5,devicePixelRatio||1);
 const floor=where==='salon'?Math.min(high,1.15):.74;
 const next=frameCost>59?Math.max(floor,old-.18):frameCost<24?Math.min(high,old+.09):old;
 if(Math.abs(old-next)>.035)renderer.setPixelRatio(next);
}
let shadowTime=-1;function frame(t){
 if(contextLost)return;
 try{
  const anchor=where==='jardin'?player().root.position:{x:-1,z:-1};sun.position.set(anchor.x-3.6,7,anchor.z+4.8);sun.target.position.set(anchor.x,0,anchor.z);
  if(t-shadowTime>145||shadowTime<0){renderer.shadowMap.needsUpdate=true;shadowTime=t;}
  adjustResolution(t-last);const dt=Math.min(.065,Math.max(0,(t-last)/1000));last=t;
  if(!arrivalFinale?.active&&!invitationScene?.active){if(!help.open&&!catalog.open){move(dt);flutter(dt);if(encounter.active)tickReunion(dt)}member.speechFrame();updateCam(dt);}
  drawScene(scene,cam,focusShot);frameHandle=requestAnimationFrame(frame);
 }catch(error){contextLost=true;window.failure(error?.message||String(error),'RENDER_ERROR');}
}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;cancelAnimationFrame(frameHandle);window.failure('Le navigateur a interrompu la 3D.');});
let talkOpen=false;
const ornaments=new T.Group();indoor.add(ornaments);
const books=[
 ['La Sainte Bible','Ancien et Nouveau Testament','#354638','La Bible réunit les livres de l’Ancien et du Nouveau Testament.'],
 ['Les quatre Évangiles','Matthieu • Marc • Luc • Jean','#7a3d35','Quatre récits de la vie, de la Passion et de la Résurrection du Christ.'],
 ['Magnifica Humanitas','Léon XIV','#41566a','Lettre encyclique du 15 mai 2026 sur la protection de la personne humaine à l’ère de l’intelligence artificielle.'],
 ['Les Contemplations','Victor Hugo','#57445c','Un recueil de poèmes sur le souvenir, le deuil et la vie intérieure.'],
 ['Les Fleurs du mal','Charles Baudelaire','#5b443c','Baudelaire y fait dialoguer la beauté, la ville et le spleen.'],
 ['Apologie de Socrate','Platon','#455765','Platon prête la parole à Socrate au moment où celui-ci se défend devant ses juges.'],
 ['Le Monde comme volonté et comme représentation','Arthur Schopenhauer','#3d4945','Schopenhauer y interroge le désir, la souffrance et la contemplation.'],
 ['Manuel','Épictète','#7b6249','Un texte stoïcien sur ce qui dépend de nous et sur ce qui nous échappe.'],
 ['Pensées pour moi-même','Marc Aurèle','#4e5f4a','Des notes que Marc Aurèle s’adresse à lui-même pour exercer son jugement.'],
 ['Lettres à Lucilius','Sénèque','#78504a','Des lettres sur l’amitié, la liberté intérieure et l’usage du temps.']
];
const officialEncyclical='https://www.vatican.va/content/leo-xiv/fr/encyclicals/documents/20260515-magnifica-humanitas.html';
const gilt=new T.MeshStandardMaterial({color:0xbea16a,metalness:.44,roughness:.49}),paper=material(0xe0cfad);
const linen=material(0xe8deca),terra=material(0xc89d75),hairWood=material(0x624639),blue=material(0x597d93),veil=material(0xe3ddcf);
const ballGeo=new T.SphereGeometry(1,16,12);
function oval(group,x,y,z,w,h,d,mat){const o=mesh(ballGeo,mat,group,x,y,z);o.scale.set(w,h,d);return o}
function groupAt(parent,x,y,z){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g}
function rod(g,a,b,r1,r2,m){
 const u=new T.Vector3(...a),v=new T.Vector3(...b),mid=u.clone().lerp(v,.5),delta=v.sub(u);
 const o=mesh(new T.CylinderGeometry(r2,r1,delta.length(),12),m,g,...mid.toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o
}
function drape(g,levels,mat,flutes=10){
 const p=[],ix=[],n=48;for(const [y,rx,rz,fold,cx=0,cz=0] of levels)for(let i=0;i<n;i++){
  const a=i/n*tau,s=1+fold*(Math.sin(flutes*a+.4*y)+.26*Math.sin(3*a+y));p.push(cx+rx*s*Math.cos(a),y,cz+rz*s*Math.sin(a));
 }
 for(let j=1;j<levels.length;j++)for(let i=0;i<n;i++){const a=(j-1)*n+i,b=(j-1)*n+(i+1)%n;ix.push(a,a+n,b,b,a+n,b+n)}
 const geo=new T.BufferGeometry();geo.setAttribute('position',attr(new Float32Array(p),3));geo.setIndex(ix);geo.computeVertexNormals();mat.side=T.DoubleSide;return mesh(geo,mat,g)
}
function face(g,x,y,z,s,skin,hair,beard=false){
 const head=groupAt(g,x,y,z);head.scale.setScalar(s);head.rotation.x=.13;
 oval(head,0,0,0,.073,.09,.066,skin);oval(head,0,-.006,.062,.012,.023,.013,skin);
 for(const side of [-1,1]){oval(head,side*.027,.013,.061,.013,.0029,.003,hair).rotation.z=side*.11}
 oval(head,.003,-.034,.062,.014,.0026,.003,hair);
 if(beard){oval(head,0,.048,-.005,.078,.059,.065,hair);oval(head,0,-.052,.019,.058,.048,.047,hair);for(const side of [-1,1])oval(head,side*.063,-.005,-.01,.022,.093,.049,hair)}
 return head
}
function sculptMadonna(){
 // Upper surface of the existing wall cubby (room part 40).
 const g=groupAt(ornaments,-3.138,2.001,.63);g.rotation.y=Math.PI/2;g.scale.setScalar(.43);
 const stone=material(0xdfd2b8);const base=mesh(new T.CylinderGeometry(.145,.16,.045,32),stone,g,0,.023,0);
 mesh(new T.CylinderGeometry(.125,.142,.035,32),gilt,g,0,.055,0);
 drape(g,[[.072,.139,.086,.065],[.12,.151,.087,.08],[.32,.105,.064,.10],[.45,.074,.059,.08],[.49,.111,.054,.04],[.55,.062,.04,.03]],linen,11);
 // The split mantle hangs from the shoulders and opens over the pale dress.
 const p=[],ix=[],N=42;for(const [y,rx,rz,op] of [[.08,.166,.10,.62],[.21,.136,.09,.59],[.42,.111,.076,.42],[.49,.131,.069,.32],[.56,.075,.060,.21]]){
  for(let j=0;j<=N;j++){const a=Math.PI/2+op+(tau-op*2)*j/N,f=1+.062*Math.cos(a*11-y*3);p.push(rx*f*Math.cos(a),y+.009*Math.sin(a*4),rz*f*Math.sin(a))}
 }
 for(let i=0;i<4;i++)for(let j=0;j<N;j++){const k=i*(N+1)+j;ix.push(k,k+N+1,k+1,k+1,k+N+1,k+N+2)}
 const mg=new T.BufferGeometry();mg.setAttribute('position',attr(new Float32Array(p),3));mg.setIndex(ix);mg.computeVertexNormals();blue.side=T.DoubleSide;mesh(mg,blue,g);
 const head=face(g,0,.596,.015,.86,terra,hairWood);head.rotation.z=-.095;
 // The hood is a shell with an open face, a crown and two hanging folds.
 const hood=material(0x788fa4);hood.side=T.DoubleSide;
 const hp=[],hi=[];for(let i=0;i<22;i++){const t=i/21,phi=.025+t*1.73,opening=.20+.56*t;for(let j=0;j<=32;j++){const a=Math.PI/2+opening+(tau-2*opening)*j/32;hp.push(.083*Math.sin(phi)*Math.cos(a),.597+.095*Math.cos(phi),.013+.084*Math.sin(phi)*Math.sin(a))}}
 for(let i=0;i<21;i++)for(let j=0;j<32;j++){const k=i*33+j;hi.push(k,k+33,k+1,k+1,k+33,k+34)}
 const hg=new T.BufferGeometry();hg.setAttribute('position',attr(new Float32Array(hp),3));hg.setIndex(hi);hg.computeVertexNormals();mesh(hg,hood,g);
 for(const side of [-1,1]){
  oval(g,side*.073,.555,.018,.027,.087,.042,veil).rotation.z=-side*.16;
  rod(g,[side*.106,.49,0],[side*.094,.385,.06],.04,.038,blue);
  rod(g,[side*.094,.385,.06],[side*.023,.462,.111],.036,.023,linen);
  oval(g,side*.013,.481,.117,.012,.036,.015,terra).rotation.z=side*.20;
 }
 const halo=mesh(new T.TorusGeometry(.112,.0033,6,56),gilt,g,0,.605,-.055);halo.rotation.x=.1;
}
function sculptCrucifix(){
 // The back of the 24 cm cross touches the inner wall face at z = -2.566.
 const g=groupAt(ornaments,.55,1.76,-2.5638);g.scale.setScalar(.255);
 const cross=material(0x513b2d),bronze=material(0xb18b63),bronzeHair=material(0x6c503c);
 box(g,0,0,.014,.069,.94,.045,cross);box(g,0,.193,.016,.60,.065,.047,cross);
 const corpus=groupAt(g,0,.003,.068);oval(corpus,0,.075,0,.077,.103,.036,bronze);
 oval(corpus,0,-.034,.003,.051,.095,.029,bronze);
 for(const side of [-1,1]){
  rod(corpus,[side*.054,.13,.002],[side*.155,.148,.011],.027,.017,bronze);rod(corpus,[side*.155,.148,.011],[side*.247,.191,.006],.020,.011,bronze);
  oval(corpus,side*.258,.193,.008,.021,.012,.014,bronze);
  rod(corpus,[side*.032,-.118,0],[side*.035,-.210,.017],.034,.021,bronze);rod(corpus,[side*.035,-.210,.017],[side*.009,-.348,.006],.023,.012,bronze);
  oval(corpus,side*.008,-.347,.018,.015,.015,.029,bronze);
 }
 drape(corpus,[[-.151,.058,.034,.12],[-.112,.066,.042,.09],[-.073,.056,.035,.07]],linen,7);
 const head=face(corpus,.014,.177,.019,.61,bronze,bronzeHair,true);head.rotation.z=-.37;head.rotation.x=.39;
 const label=bookTexture('INRI','', '#d4c09a',true);mesh(new T.PlaneGeometry(.10,.042),label,g,0,.363,.040);
}
function bookTexture(title,author,color,plaque=false,density=1){
 const c=document.createElement('canvas');const w=384,h=plaque?146:512;c.width=w*density;c.height=h*density;const x=c.getContext('2d');x.scale(density,density);x.fillStyle=color;x.fillRect(0,0,w,h);
 if(plaque){x.textAlign='center';x.textBaseline='middle';x.fillStyle='#40352a';x.font='bold 88px Georgia';x.fillText(title,w/2,h/2)}
 else{
  x.strokeStyle='#c8ae79';x.lineWidth=3;x.strokeRect(17,18,w-34,h-36);x.lineWidth=1;x.strokeRect(24,26,w-48,h-52);
  x.textAlign='center';x.fillStyle='#f2e6c1';const words=title.split(' ');x.font='bold 39px Georgia';const lines=[];let l='';for(const t of words){if(l&&x.measureText(l+' '+t).width>w-72){lines.push(l);l=t}else l=l?l+' '+t:t}lines.push(l);
  lines.forEach((t,i)=>x.fillText(t,w/2,h*.44+(i-(lines.length-1)/2)*47,w-58));
  x.fillRect(w/2-28,h*.67,56,2);x.font='24px Georgia';x.fillText(author,w/2,h*.78,w-54);
 }
 const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;return new T.MeshStandardMaterial({map,roughness:.83})
}
function spineMaterial(title,color,density=1){
 const label=document.createElement('canvas');label.width=128*density;label.height=768*density;
 const ink=label.getContext('2d');ink.scale(density,density);ink.fillStyle=color;ink.fillRect(0,0,128,768);
 ink.fillStyle='#c9ae79';for(const y of [18,25,741,748])ink.fillRect(9,y,110,3);
 ink.translate(64,384);ink.rotate(Math.PI/2);ink.font='bold 43px Georgia';ink.textBaseline='middle';ink.textAlign='center';ink.fillStyle='#f3e6ca';ink.fillText(title,0,0,666);
 const map=new T.CanvasTexture(label);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
 return new T.MeshStandardMaterial({map,roughness:.83});
}
const bookHits=[];
let inspectedPage=null,standardPrint=null;
function focusBookPrint(){
 const hit=detail.active&&detail.distance<.85?detail.object:null;
 const page=hit?.userData.book===undefined?null:hit;
 if(page===inspectedPage)return;
 if(inspectedPage){inspectedPage.material.map.dispose();inspectedPage.material.dispose();inspectedPage.material=standardPrint;}
 inspectedPage=page;standardPrint=null;
 if(page){
  const [title,author,tone]=books[page.userData.book];
  standardPrint=page.material;
  const density=Math.min(4,Math.floor(renderer.capabilities.maxTextureSize/(page.userData.spine?768:512)));
  page.material=page.userData.spine?spineMaterial(title,tone,density):bookTexture(title,author,tone,false,density);
 }
}
function placeBooks(){
 for(const [i,[title,author,tone]] of books.entries()){
  const onTable=i<2;
  const h=i===0?.26:onTable?.22:.205+(i%3)*.012,w=i===0?.18:onTable?.15:.14,thick=i===0?.049:.034;
  let holder;
  if(onTable){
   // Lie flat, cover up, clear of the lamp and vase on the existing tabletop (part 82).
   holder=groupAt(ornaments,i===0?1.10:1.49,.64+thick/2+.003,i===0?.79:.43);
   holder.rotation.order='YXZ';holder.rotation.y=i===0?.08:-.16;holder.rotation.x=-Math.PI/2;
  }else{
   // The west-wall shelves are 15 cm deep. Set each row on the board's top face.
   const row=i<6,slot=row?i-2:i-6;
   if(i===2){
     holder=groupAt(ornaments,-3.137,1.406,.535);holder.rotation.y=Math.PI/2;
   }else{
     holder=groupAt(ornaments,-3.14,row?1.406:1.997,row?.68+(slot-1)*.042:-.27+slot*.046);
     holder.rotation.y=Math.PI;
   }
  }
  holder.userData.book=i;const cover=material(new T.Color(tone));box(holder,0,h*.5,0,w-.012,h-.013,thick,paper);
  for(const side of [-1,1])box(holder,0,h*.5,side*(thick*.5+.003),w,h,.006,cover);
  box(holder,-w*.49,h*.5,0,.012,h,thick+.012,cover);
  const o=mesh(new T.PlaneGeometry(w-.006,h-.005),bookTexture(title,author,tone),holder,0,h/2,thick/2+.0066);o.userData.book=i;bookHits.push(o);
  const spine=mesh(new T.PlaneGeometry(thick+.01,h-.004),spineMaterial(title,tone),holder,-w*.49-.0063,h/2,0);
  spine.rotation.y=-Math.PI/2;spine.userData.book=i;spine.userData.spine=true;bookHits.push(spine);
 }
 sculptMadonna();sculptCrucifix();
 for(const item of ornaments.children){
   const buckets=new Map(),remove=[];
   item.updateWorldMatrix(true,true);const inverse=item.matrixWorld.clone().invert();
   item.traverse(o=>{
     if(!o.isMesh||o.userData.book!==undefined)return;
     const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
     g.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));
     if(!g.attributes.uv)g.setAttribute('uv',attr(new Float32Array(g.attributes.position.count*2),2));
     if(!buckets.has(o.material))buckets.set(o.material,[]);
     buckets.get(o.material).push(g);remove.push(o);
   });
   for(const o of remove)o.removeFromParent();
   for(const [mat,gs] of buckets){mesh(mergeGeometries(gs),mat,item);for(const g of gs)g.dispose()}
 }
}
placeBooks();

// The V27 wardrobe mesh forms the covert layer. Three articulated spans carry the long flight feathers.
function angelGeometry(side){
 const positions=[],colors=[],indices=[],joint=[],weight=[];
 function vertex(x,y,z,tone){
  const u=Math.max(0,x),between=u<.54?0:u<.97?1:2;
  const start=[.20,.54,.97],end=[.54,.97,1.55];
  const t=T.MathUtils.smoothstep(u,start[between],end[between]);
  const c=new T.Color(tone);positions.push(x*side,y,z);colors.push(c.r,c.g,c.b);
  joint.push(between,between+1,0,0);weight.push(1-t,t,0,0);return positions.length/3-1;
 }
 function tri(a,b,c){if(side>0)indices.push(a,b,c);else indices.push(a,c,b)}
 const source=side<0?'l':'r',p=arr('wings/'+source+'p',Int16Array),f=arr('wings/'+source+'i',Uint16Array);
 for(let i=0;i<p.length;i+=3){
  const span=clamp((Math.abs(p[i])*.0001-.055)/.92,0,1);
  const y=p[i+1]*.0001-1.28;
  vertex(span*.99,.025+Math.sin(span*2.1)*.37+y*.74,(p[i+2]*.0001+.10)*.62-span*.18,0xe9e5d9);
 }
 for(let i=0;i<f.length;i+=3){indices.push(f[i],f[i+1],f[i+2])}
 const tones=[0xfffae9,0xf5efdc,0xf6f4eb,0xe6e0d1,0xe9e8e3],ribColor=0xfdf6df;
 function feather(base,tip,width,index,row){
  const dx=tip[0]-base[0],dy=tip[1]-base[1],len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
  const steps=17,across=[-1,-.52,-.055,0,.055,.54,1],start=positions.length/3;
  for(let i=0;i<=steps;i++){
   const u=i/steps,bend=Math.sin(u*Math.PI),w=width*(.016+Math.pow(bend,.69))*(1-.16*u);
   const cx=mix(base[0],tip[0],u)+nx*bend*.045,cy=mix(base[1],tip[1],u)+ny*bend*.045;
   for(let j=0;j<across.length;j++){
    const v=across[j],asym=v<0?.83:1.08,notch=(i>6&&i<15&&((i+index*7)%7===0)&&Math.abs(v)>.94)?.74:1;
    const spread=v*w*asym*notch;const dark=j===0||j===6;
    const col=j===3?ribColor:dark?(row===0?0xc4c0b5:0xd8d3c7):tones[(index+row+(j===1?2:0))%tones.length];
    vertex(cx+nx*spread,cy+ny*spread,mix(base[2],tip[2],u)-bend*.072+v*v*w*.32-(j===3?.010:0),col);
    if(i&&j){const k=start+i*across.length+j;tri(k-across.length-1,k-across.length,k);tri(k-across.length-1,k,k-1)}
   }
  }
 }
 // Asymmetric primaries fan out from the wrist. Shorter secondaries and coverts overlap their bases.
 for(let i=0;i<11;i++){
  const t=i/10;
  feather([.69-.39*t,.38-.17*t,-.24+.13*t],[1.68-.86*t,.67-.99*t,-.44-.095*Math.sin(Math.PI*t)],.071+i*.0025,i,0);
 }
 for(let i=0;i<9;i++){
  const t=i/8;
  feather([.55*(1-t)+.04,.30*(1-t)+.07,-.21+.12*t],[.82*(1-t)+.22*t,-.32-.12*Math.sin(Math.PI*t),-.39+.15*t],.087,i,1);
 }
 for(let row=0;row<2;row++){
  for(let i=0;i<13;i++){
   const t=i/12,x=t*.86,y=.045+Math.sin(t*1.6)*.40;
   const length=row?.22:.36;
   feather([x,y,-.14-x*.23-row*.028],[x+length*(.28+t*1.1),y-length*(.95-.7*t),-.23-x*.24-row*.034],row?.061:.075,i,row+2);
  }
 }
 const g=new T.BufferGeometry();g.setAttribute('position',attr(new Float32Array(positions),3));g.setAttribute('color',attr(new Float32Array(colors),3));g.setAttribute('skinIndex',new T.Uint16BufferAttribute(joint,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(weight,4));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();return g;
}
const featherMat=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.86,metalness:.009,emissive:0xe8ece6,emissiveIntensity:.16});
const featherGeo=[angelGeometry(-1),angelGeometry(1)];
function flightRig(a){
 if(a.angel)return a.angel;
 if(!a.harness)a.harness=fitHarness(a);
 const pivot=new T.Group(),load=new T.Group();pivot.rotation.order='YXZ';pivot.position.y=.97;load.position.y=-.97;a.root.add(pivot);pivot.add(load);load.add(a.body,a.harness.h);
 const wings=[];
 for(const [index,side] of [-1,1].entries()){
  const wing=new T.SkinnedMesh(featherGeo[index],featherMat),shoulder=new T.Bone(),elbow=new T.Bone(),wrist=new T.Bone(),tip=new T.Bone();
  wing.position.set(side*.117,a.id==='f'?1.29:1.31,-.088);shoulder.rotation.order=elbow.rotation.order=wrist.rotation.order='YXZ';
  elbow.position.set(side*.40,.20,-.08);wrist.position.set(side*.43,.15,-.095);shoulder.add(elbow);elbow.add(wrist);tip.position.set(side*.40,.11,-.085);wrist.add(tip);wing.add(shoulder);
  wing.updateMatrixWorld(true);wing.bind(new T.Skeleton([shoulder,elbow,wrist,tip]));load.add(wing);wing.frustumCulled=false;wing.castShadow=true;
  wings.push({wing,side,shoulder,elbow,wrist,tip});
 }
 return a.angel={pivot,load,wings,phase:0};
}
// Eight equally spaced samples of a complete beat, starting midway through recovery.
// A positive sweep carries the outer wing behind the back. Pitch lets air pass on recovery.
const wingTracks = {
  shoulder: [8,35,48,39,8,-42,-62,-32],
  elbow:    [-10,-19,-8,5,12,6,-5,-12],
  wrist:    [-13,-22,-15,-6,6,13,6,-5],
  tip:      [-8,-12,-16,-12,0,12,14,6],
  fold:     [28,34,21,5,1,4,13,23],
  sweep:    [19,32,27,12,3,6,13,21],
  twist:    [16,26,27,10,-5,-12,-3,9]
};
function wingSample(track,phase){
  const position=((phase/tau)%1+1)%1*8;
  const index=Math.floor(position)%8, mix=position-Math.floor(position);
  const prev=track[(index+7)%8], from=track[index], to=track[(index+1)%8], next=track[(index+2)%8];
  const tangent=(a,b)=>a*b>0?2*a*b/(a+b):0;
  const m0=tangent(from-prev,to-from), m1=tangent(to-from,next-to);
  const f2=mix*mix, f3=f2*mix;
  return ((2*f3-3*f2+1)*from+(f3-2*f2+mix)*m0+(-2*f3+3*f2)*to+(f3-f2)*m1)*Math.PI/180;
}
function poseWings(actor,spread,phase,power){
  if(!actor.angel)return;
  const amount=power*spread;
  const roll=wingSample(wingTracks.shoulder,phase), elbow=wingSample(wingTracks.elbow,phase);
  const wrist=wingSample(wingTracks.wrist,phase), tip=wingSample(wingTracks.tip,phase);
  const fold=wingSample(wingTracks.fold,phase), sweep=wingSample(wingTracks.sweep,phase);
  const twist=wingSample(wingTracks.twist,phase);
  for(const joint of actor.angel.wings){
    const {wing,side}=joint;
    wing.visible=spread>.002;
    if(!wing.visible)continue;
    joint.shoulder.rotation.set(-.08-(actor.angel.lean||0)*.72*spread-.22*twist*amount,side*mix(1.1,.09,spread),side*(mix(-1.36,.13,spread)+roll*amount),'YXZ');
    joint.elbow.rotation.set(.03,side*(mix(.45,.03,spread)+fold*amount),side*(mix(-.2,.02,spread)+elbow*amount),'YXZ');
    joint.wrist.rotation.set(twist*.65*amount,side*(mix(.58,.03,spread)+sweep*amount),side*(mix(-.25,-.04,spread)+wrist*amount),'YXZ');
    joint.tip.rotation.set(twist*.35*amount,side*sweep*.15*amount,side*tip*amount,'YXZ');
    wing.scale.setScalar(.46+.54*spread);
  }
}
function wingThrust(phase){
  const cycle=((phase/tau)%1+1)%1;
  return cycle>.28&&cycle<.78?Math.sin(Math.PI*(cycle-.28)/.5)**2:0;
}


const air={mode:'off',spread:0,phase:0,power:0,v:0,alt:0,heading:Math.PI,bank:0,time:0,boost:false,down:false,downPulse:0,pulse:0,queued:null,figure:null,landing:null,hover:0,launch:0,front:false,course:0,moving:false};
const maxHeight=23,flightControls=$('flightControls'),flightButton=$('angelMode');
let revealStart=null,shelfView=false,shelfSaved=null;
const eased=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
function cancelReveal(){if(revealStart!==null){revealStart=null;orbit.angle=.08;orbit.pitch=.16;orbit.radius=3.90}}
function skyMode(){return air.mode==='flying'||air.mode==='landing'}
function refreshFlight(){
 const active=air.mode!=='off',on=where==='jardin',flying=air.mode==='flying',landing=air.mode==='landing';
 flightButton.hidden=!on;flightButton.setAttribute('aria-pressed',String(active));$('angelLabel').textContent=landing?'Atterrissage':flying?'Atterrir':active?'Replier':'Mode ange';
 if(encounter.active&&active)$('angelLabel').textContent=landing?'Atterrissage':'Mode ange ✓';
 flightButton.disabled=landing||air.mode==='folding';flightControls.hidden=!on||!active||landing;
 $('beat').textContent=flying?'Battre des ailes':'Décoller';$('descent').hidden=$('tricks').hidden=!flying;
 $('tricks').disabled=!flying||!!air.figure;$('altitude').hidden=!skyMode();if(!flying||air.figure)$('trickList').hidden=true;
 $('lookHome').hidden=on&&active;const face=$('flightFace');face.hidden=!on||!active||landing;
 face.setAttribute('aria-pressed',String(air.front));face.textContent=air.front?'Vue de dos':'Vue de face';if(!on)$('altitude').hidden=true;
}
function resetAir(){
 for(const a of currentPair()){const r=a.angel;if(r){r.pivot.position.set(0,.97,0);r.pivot.rotation.set(0,0,0);poseWings(a,0,0,0)}a.root.position.y=0;a.shadow.position.y=.03;a.shadow.scale.set(1,1,1)}
 Object.assign(air,{mode:'off',spread:0,phase:0,power:0,v:0,alt:0,boost:false,down:false,downPulse:0,pulse:0,queued:null,bank:0,time:0,figure:null,landing:null,hover:0,launch:0,front:false,course:0,moving:false});refreshFlight()
}
function toggleAngel(){
 centeredOnPlayer=false;
 if(where!=='jardin')return;cancelReveal();
 if(air.mode==='off'){
  if(homeView)freeCamera();for(const a of currentPair())flightRig(a);
  air.mode='ready';air.front=false;air.heading=player().root.rotation.y;air.course=air.heading-Math.PI;air.phase=0;air.spread=0;air.time=0;goal=null;orbit.follow=true;orbit.angle=air.heading-Math.PI-.14;orbit.pitch=.16;orbit.radius=4.6;
 }else if(air.mode==='ready'){air.mode='folding'}
 else if(air.mode==='flying')startLanding();
 refreshFlight();hint()
}
function beat(){
 if(air.mode==='ready'){
  air.mode='flying';air.alt=0;air.v=0;air.launch=1;air.phase=0;air.power=.10;air.heading=player().root.rotation.y;goal=null;
  orbit.follow=true;orbit.radius=5.25;refreshFlight();hint();
 }else if(air.mode!=='flying')return;
 air.pulse=Math.max(air.pulse,.86);air.down=false;
}
function trick(type){
 if(air.mode!=='flying'||air.figure)return;
 const p=player().root.position;if((underRoof(p.x,p.z)||Math.abs(p.z+7.6)<.50)&&air.alt<3.8){$('hint').textContent='Éloigne-toi du toit ou de l’arche pour faire une figure.';return}
 if(air.alt<1.28){air.queued=type;air.pulse=1.05;air.down=false;return}
 air.queued=null;air.figure={type,clock:0,duration:type==='loop'?2.75:1.85};
 air.pulse=0;air.boost=air.down=false;$('trickList').hidden=true;$('tricks').setAttribute('aria-expanded','false');refreshFlight();
}
function frameWingedPair(camera,fov,aspect){
 const a=player(),b=partner(),p=a.root.position,q=b.root.position,el=clamp(orbit.pitch,-.04,.78);
 let ang=air.front?air.heading-.065:orbit.angle;const centerZ=(p.z+q.z)*.5,feet=(p.y+q.y)*.5;
 if(!air.front&&centerZ>5.32&&feet<6.30&&Math.cos(ang)>.35){ang=orbit.angle=Math.PI-.19}
 const dir=new T.Vector3(Math.sin(ang)*Math.cos(el),Math.sin(el),Math.cos(ang)*Math.cos(el));
 const right=new T.Vector3(Math.cos(ang),0,-Math.sin(ang)),up=new T.Vector3().crossVectors(dir,right);
 const mid=p.clone().lerp(q,.5);mid.y+=1.14+(air.figure?.type==='loop'?1.10:0);const tangent=Math.tan(fov*Math.PI/360);
 const bounds=[];let dist=orbit.radius*.92;
 for(const pt of [p,q])for(const x of [-1,1])for(const z of [-1,1])for(const y of [-1,1]){
  // A stable envelope follows both bodies through their full wingspan and throughout each figure.
  const span=.47+1.45*air.spread,reach=air.figure?2.02:.78;
  const v=new T.Vector3(pt.x+x*span,pt.y+(y<0?-.12:2.52)+(air.figure?.type==='loop'&&y>0?2.65:0),pt.z+z*reach).sub(mid);
  const depth=v.dot(dir),horizontal=Math.abs(v.dot(right))/(aspect*.87),vertical=Math.abs(v.dot(up))/.82;bounds.push([depth,Math.max(horizontal,vertical)]);dist=Math.max(dist,depth+Math.max(horizontal,vertical)/tangent);
 }
 if(dir.z>.04&&Math.abs(mid.x)<6&&feet<6.30){
  // At the doorstep a wider lens keeps the camera outside the glazed facade and under the veranda.
  const limitZ=6.90;
  dist=Math.min(dist,Math.max(2.5,(limitZ-mid.z)/dir.z));
 }
 camera.position.copy(mid).addScaledVector(dir,dist);camera.lookAt(mid);
 let fit=tangent;for(const [depth,extent] of bounds)fit=Math.max(fit,extent/Math.max(.6,dist-depth));
 return Math.min(98,Math.atan(fit)*360/Math.PI);
}
function groundLimit(x,z){
 let h=0;
 const cell=plantCells.get(Math.floor(x/tileSize)+','+Math.floor(z/tileSize));
 if(cell)for(const c of cell)if((x-c.x)**2+(z-c.z)**2<c.r*c.r)h=Math.max(h,c.height);
 if(Math.abs(z+7.6)<.44&&Math.abs(x-.4)>.8)h=Math.max(h,3.29);
 if(Math.abs(x+3.5)<1.23&&Math.abs(z+5.25)<.50)h=Math.max(h,.52);
 // There is an overhead canopy in front of the house.

 return h;
}
function underRoof(x,z){return z>7.05&&x>-4.75&&x<3.13}
function airStep(p,x,z,height){
 if(z>10.38&&z>=p.z||Math.abs(x-pathX(z))>11.4&&Math.abs(x-pathX(z))>=Math.abs(p.x-pathX(p.z)))return false;
 const n=Math.max(1,Math.ceil(Math.hypot(x-p.x,z-p.z)/.17));
 for(let i=1;i<=n;i++){const xx=mix(p.x,x,i/n),zz=mix(p.z,z,i/n),h=groundLimit(xx,zz);if(h>0&&height<h+.20||underRoof(xx,zz)&&height>1.14&&height<3.78||Math.abs(zz+7.6)<.44&&Math.abs(xx-.4)<=.8&&height>.38&&height<3.40)return false}
 p.x=x;p.z=z;return true;
}
function startLanding(){
 if(air.mode!=='flying')return;
 const p=player().root.position;const z=Math.min(p.z,5.30),safeZ=Math.abs(z+7.6)<2.6?-4.7:z;
 const begin=canWalk(p.x,p.z)&&!groundLimit(p.x,p.z)&&Math.abs(p.x-pathX(p.z))<1.2&&Math.abs(p.z+7.6)>2.7;
 const target=new T.Vector3(begin?p.x:pathX(safeZ),0,begin?p.z:safeZ);
 const otherZ=target.z+(target.z>4?-1.32:1.32),other=new T.Vector3(pathX(otherZ)+.33,0,otherZ);
 air.landing={target,other};air.mode='landing';air.queued=null;air.figure=null;air.pulse=0;air.boost=air.down=false;air.v=0;refreshFlight();hint();
}
function glidingLimbs(a,altitude,neckTilt){
 if(a.cinemaAhmed?.active){a.cinemaAhmed.glide(altitude,neckTilt);return;}
 // The standing mesh already has relaxed shoulders, elbows and hands.
 const amount=Math.round(eased(altitude/1.5)*24)/24,tilt=Math.round(neckTilt*180)/180;
 const stamp='flight/'+amount+'/'+tilt;if(a.stamp===stamp)return;
 for(const part of a.parts){
  const p=part.obj.geometry.attributes.position,base=part.base;
  if(!part.airLeg){
   part.airLeg=new Float32Array(base.length);part.neck=[];
   const separateHead=/^(hair|short02|browNative|lashes|eyesNative|teethNative|tongueNative)$/.test(part.name);
   for(let i=0;i<base.length;i+=3){
    const x=base[i],y=base[i+1],z=base[i+2];
    if(y<.67){const leg=eased((.67-y)/.67),knee=eased((.43-y)/.43);
     part.airLeg[i]=Math.sign(x)*leg*.009;part.airLeg[i+1]=.065*leg+.028*knee;part.airLeg[i+2]=-.09*leg-knee*(x>0?.11:.14);
    }
    const neckHeight=a.id==='f'?1.365:1.42;
    const w=separateHead?1:eased((y-neckHeight+.035)/.115)*(1-eased((Math.abs(x)-.10)/.068));
    if(w>0)part.neck.push([i,w,neckHeight]);
   }
  }
  for(let i=0;i<base.length;i++)p.array[i]=base[i]+amount*part.airLeg[i];
  for(const [i,w,height] of part.neck){
   const theta=tilt*w,c=Math.cos(theta),sn=Math.sin(theta),y=base[i+1]-height,z=base[i+2]-.012;
   p.array[i+1]=height+y*c-z*sn;p.array[i+2]=.012+y*sn+z*c;
  }p.needsUpdate=true;
 }a.stamp=stamp;
}

function airPose(a,dt,altitude,lag,phase,force,speed){
 const r=a.angel,trick=air.figure;
 r.lean=mix(r.lean??0,.028+.16*speed,1-Math.exp(-dt*3.7));let roll=0,pitch=r.lean,forward=0,lift=0;
 if(trick){const t=clamp((trick.clock-lag)/(trick.duration),0,1),theta=eased(t)*tau;
  if(trick.type==='loop'){pitch-=theta;forward=1.18*Math.sin(theta);lift=1.18*(1-Math.cos(theta))}
  else {roll=(trick.type==='left'?-1:1)*theta;lift=.23*Math.sin(t*Math.PI)}
 }
 const hover=altitude>.25?.065*Math.sin(phase-.65):0;
 r.pivot.position.set(0,.97+hover+lift,forward);
 r.pivot.rotation.set(pitch*eased(altitude/.85),0,roll+air.bank*.24,'YXZ');
 a.root.position.y=altitude;a.shadow.position.y=.030-altitude/a.root.scale.y;
 a.shadow.scale.setScalar(1/(1+altitude*.38));a.speed=0;
 glidingLimbs(a,altitude,-(r.lean+.095)*eased(altitude/.85));trackHarness(a);poseWings(a,air.spread,phase,force);
}
function advanceAir(dt){
 const a=player(),b=partner(),p=a.root.position,q=b.root.position;air.time+=dt;
 const folding=air.mode==='folding';
 air.spread=clamp(air.spread+dt*(folding?-1.25:1.12),0,1);
 if(!skyMode()){
  if(!encounter.active&&air.mode==='ready'&&a.speed<.05){const tz=Math.min(6.3,p.z+1.24),tx=pathX(tz)+.78,f=1-Math.exp(-dt*1.55);const x=mix(q.x,tx,f),z=mix(q.z,tz,f);if(freeLine(q,x,z)){q.x=x;q.z=z}
   const yaw=a.root.rotation.y,beta=Math.atan2(Math.sin(yaw-b.root.rotation.y),Math.cos(yaw-b.root.rotation.y));b.root.rotation.y+=beta*Math.min(1,dt*4)
  }
  poseWings(a,eased(air.spread),air.time*.9,.09);poseWings(b,eased(air.spread),air.time*.9-.24,.09);if(folding&&air.spread===0)resetAir();return}
 if(air.launch>0&&air.mode==='flying'){
  if(air.spread<.999){poseWings(a,air.spread,0,.10);poseWings(b,air.spread,-.23,.10);return}
  air.launch=Math.max(0,air.launch-dt/.30);
  if(air.launch>0){const raised=.10+.90*eased(1-air.launch);poseWings(a,1,(1-air.launch)*.14*tau,raised);poseWings(b,1,(1-air.launch)*.14*tau-.18,raised);return}
  air.phase=.14*tau;air.power=1;air.pulse=Math.max(air.pulse,1.06);
 }
 const landing=air.mode==='landing';
 const climb=!landing&&!air.figure&&(air.pulse>0||air.boost);
 const descend=!landing&&!air.figure&&(air.down||air.downPulse>0);air.downPulse=Math.max(0,air.downPulse-dt);
 air.pulse=Math.max(0,air.pulse-dt);air.power=mix(air.power,climb?1:descend?.23:.54,1-Math.exp(-dt*5));
 air.phase+=dt*tau*(climb?.91:landing?.62:.74);
 let moveAmount=0;let companionAltitude=air.alt;
 if(landing){
  const {target,other}=air.landing;
  const d1=Math.hypot(p.x-target.x,p.z-target.z),d2=encounter.active?0:Math.hypot(q.x-other.x,q.z-other.z);
  if(Math.max(d1,d2)>.055){
   function glideTo(pos,end,dist){
    if(dist<=.045)return true;const f=Math.min(1,dt*3.9/dist);return airStep(pos,mix(pos.x,end.x,f),mix(pos.z,end.z,f),air.alt);
   }
   const ok1=glideTo(p,target,d1),ok2=glideTo(q,other,d2);
   if(!ok1||!ok2)air.alt=Math.min(maxHeight,air.alt+dt*3.2);
  }else air.alt=Math.max(0,air.alt-dt*(air.alt>2?2.95:.92));
  const obstacle=groundLimit(q.x,q.z);companionAltitude=Math.max(air.alt,obstacle?obstacle+.20:0);
  if(air.alt<=.001&&Math.max(d1,d2)<.06){air.mode='folding';air.figure=null;air.alt=0;a.root.position.y=b.root.position.y=0;for(const u of [a,b]){u.angel.pivot.position.set(0,.97,0);u.angel.pivot.rotation.set(0,0,0);u.shadow.position.y=.03;u.shadow.scale.setScalar(1)}
   trail.length=0;trailTotal=0;trail.push({x:p.x,z:p.z,s:0});orbit.radius=3.9;refreshFlight();hint();return}
 }else{
  let lateral=stick.x,longitudinal=-stick.y;
  if(keys.has('arrowup')||keys.has('z')||keys.has('w'))longitudinal+=1;if(keys.has('arrowdown')||keys.has('s'))longitudinal-=1;
  if(keys.has('arrowleft')||keys.has('q')||keys.has('a'))lateral-=1;if(keys.has('arrowright')||keys.has('d'))lateral+=1;
  const mag=Math.hypot(lateral,longitudinal);if(mag>1){lateral/=mag;longitudinal/=mag}
  const boostLift=wingThrust(air.phase);
  const wanted=climb?1.1+3.2*boostLift:descend?-2.65:0;
  air.v=mix(air.v,wanted,1-Math.exp(-dt*(climb?5:3.8)));
  const floor=groundLimit(p.x,p.z),under=underRoof(p.x,p.z),arch=Math.abs(p.z+7.6)<.44;
  const lowRoof=under?1.14:.38,highRoof=under?3.78:3.40;const below=(under||arch)&&air.alt<highRoof;
  air.alt=clamp(air.alt+air.v*dt,Math.max(0,floor?floor+.20:0,(under||arch)&&!below?highRoof:0),below?lowRoof:maxHeight);
  if(descend&&air.alt<.42){startLanding();return}
  if(mag>.04&&!air.moving){
   const behind=air.heading-Math.PI,offset=Math.atan2(Math.sin(orbit.angle-behind),Math.cos(orbit.angle-behind));
   air.course=air.front||Math.abs(offset)>Math.PI*.54?behind:orbit.angle;
  }
  air.moving=mag>.04;
  const c=Math.cos(air.course),s=Math.sin(air.course),dx=lateral*c-longitudinal*s,dz=-lateral*s-longitudinal*c;
  moveAmount=Math.min(1,mag);const step=dt*(3.95+air.alt*.035)*Math.min(1,air.alt*1.5);
  if(moveAmount>.04){const nx=p.x+dx*step,nz=p.z+dz*step;if(!airStep(p,nx,nz,air.alt)){if(!airStep(p,nx,p.z,air.alt))airStep(p,p.x,nz,air.alt)}
   const desired=Math.atan2(dx,dz),turn=Math.atan2(Math.sin(desired-air.heading),Math.cos(desired-air.heading));air.heading+=turn*Math.min(1,dt*3);air.bank=mix(air.bank,clamp(turn,-1,1),dt*3)
  }else air.bank*=Math.exp(-dt*3);
  a.root.rotation.y=air.heading;
  // Fly in a staggered pair so that the long primaries have room to beat.
  if(!encounter.active){
  const wide=1.8*eased(air.alt/2)+.62,back=1.22+.92*eased(air.alt/2);
  let tx=p.x-Math.cos(air.heading)*wide-Math.sin(air.heading)*back,tz=p.z+Math.sin(air.heading)*wide-Math.cos(air.heading)*back;
  let needed=groundLimit(tx,tz);
  if(needed>air.alt-.18||Math.hypot(q.x-p.x,q.z-p.z)>4.4){tx=p.x-Math.sin(air.heading)*1.12;tz=p.z-Math.cos(air.heading)*1.12;needed=groundLimit(tx,tz)}

  const f=1-Math.exp(-dt*2.6),nx=mix(q.x,tx,f),nz=mix(q.z,tz,f);
  companionAltitude=Math.max(air.alt*.97,groundLimit(q.x,q.z)?groundLimit(q.x,q.z)+.20:0);
  const cross=groundLimit(nx,nz);const safeAlt=Math.max(companionAltitude,cross?cross+.22:0,needed?needed+.22:0);
  companionAltitude=mix(q.y,safeAlt,1-Math.exp(-dt*4.25));
  if(!airStep(q,nx,nz,companionAltitude)){if(!airStep(q,nx,q.z,companionAltitude))airStep(q,q.x,nz,companionAltitude)}
  const turn=Math.atan2(Math.sin(air.heading-b.root.rotation.y),Math.cos(air.heading-b.root.rotation.y));b.root.rotation.y+=turn*Math.min(1,dt*3);
  }
 }
 if(air.queued&&air.alt>=1.28&&!landing)trick(air.queued);if(air.figure)air.figure.clock+=dt;
 airPose(a,dt,air.alt,0,air.phase,air.power,moveAmount);if(!encounter.active)airPose(b,dt,companionAltitude,.14,air.phase-.62,air.power*.96,moveAmount);
 if(air.figure&&air.figure.clock>=air.figure.duration+.14){air.figure=null;refreshFlight()}
 const label=Math.round(air.alt)+' m';if($('altitude').textContent!==label)$('altitude').textContent=label;
}
$('flightFace').onclick=()=>{centeredOnPlayer=false;encounter.chatView=false;air.front=!air.front;orbit.angle=air.front?air.heading-.065:air.heading-Math.PI;orbit.pitch=air.front?.055:.16;refreshFlight();updateCam(1);canvas.focus({preventScroll:true})};
flightButton.onclick=()=>{toggleAngel();canvas.focus({preventScroll:true})};
function heldControl(button,begin,held,release){
 button.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});
 button.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();button.setPointerCapture(e.pointerId);begin();held()});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,release);
 button.addEventListener('click',e=>{if(e.detail===0)begin()})
}
heldControl($('beat'),beat,()=>{air.boost=true},()=>{air.boost=false});
heldControl($('descent'),()=>{if(skyMode())air.downPulse=.51},()=>{air.down=true},()=>{air.down=false});
$('tricks').onclick=()=>{const el=$('trickList');el.hidden=!el.hidden;$('tricks').setAttribute('aria-expanded',String(!el.hidden))};
for(const btn of document.querySelectorAll('[data-trick]'))btn.onclick=()=>trick(btn.dataset.trick);
window.addEventListener('keydown',e=>{
 if(invitationScene?.active||arrivalFinale?.active)return;
 if(e.target.closest?.('input,textarea,select,[contenteditable=true]')||document.querySelector('dialog[open]')||e.ctrlKey||e.altKey||e.metaKey||where!=='jardin')return;
 if(e.code==='KeyG'&&!e.repeat){e.preventDefault();toggleAngel();return}
 if(!['ready','flying'].includes(air.mode))return;
 if(e.code==='Space'&&!e.target.closest?.('button')){e.preventDefault();if(!e.repeat)beat();air.boost=true}
 if(e.code==='KeyC'){e.preventDefault();air.down=true}
 if(!e.repeat&&['Digit1','Digit2','Digit3'].includes(e.code)){e.preventDefault();trick(({Digit1:'left',Digit2:'right',Digit3:'loop'})[e.code])}
});
window.addEventListener('keyup',e=>{if(e.code==='Space')air.boost=false;if(e.code==='KeyC')air.down=false});
function releaseAirInput(){air.boost=air.down=false;air.pulse=air.downPulse=0}
window.addEventListener('blur',releaseAirInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAirInput()});

const shelvesButton=$('shelves'),catalog=$('bookcase'),catalogList=$('bookList');
function setShelfView(on,keepTravel=false){centeredOnPlayer=false;if(!keepTravel)travel.reset();detail.reset();
 if(where!=='salon')return;
 if(on){shelfSaved={angle:orbit.angle,pitch:orbit.pitch,radius:orbit.radius,follow:orbit.follow,focus:orbit.focus.clone()};if(windowView)freeCamera();keys.clear();releaseStick();goal=null}
 else if(shelfSaved){Object.assign(orbit,{angle:shelfSaved.angle,pitch:shelfSaved.pitch,radius:shelfSaved.radius,follow:shelfSaved.follow});orbit.focus.copy(shelfSaved.focus)}
 shelfView=on;shelvesButton.setAttribute('aria-pressed',String(on));$('shelfActions').hidden=!on;$('shelfLabel').textContent=on?'Vue du salon':'Bibliothèque';hint();updateCam(1);
}
function showBook(i){
 for(const btn of catalogList.children)btn.setAttribute('aria-pressed',String(Number(btn.dataset.volume)===i));
 const [name,author,tone,note]=books[i];$('bookName').textContent=name;$('bookAuthor').textContent=author;$('bookNote').textContent=note;
 $('bookCard').style.setProperty('--binding',tone);$('official').hidden=i!==2;
}
function openBooks(i=0){keys.clear();releaseStick();showBook(i);if(!catalog.open)catalog.showModal()}
for(const [i,[title,author]] of books.entries()){const btn=document.createElement('button');btn.type='button';btn.dataset.volume=String(i);btn.textContent=title;btn.title=author;btn.onclick=()=>showBook(i);catalogList.append(btn)}
$('official').href=officialEncyclical;$('openBooks').onclick=()=>openBooks();$('bookClose').onclick=()=>catalog.close();
catalog.addEventListener('click',e=>{if(e.target===catalog)catalog.close()});catalog.addEventListener('close',()=>canvas.focus());
shelvesButton.onclick=()=>setShelfView(!shelfView);

$('lookHome').onclick=lookAtHome;setLocation(false);resetView();updateSize();
function prepareBodyInspection(actor){
 if(!Object.values(actors).includes(actor)||invitationScene?.active||arrivalFinale?.active)return false;
 if(where!=='salon')returnHome();
 member.clearMeeting();setRole(actor===actors.f?'f':'m');
 keys.clear();releaseStick();releaseAirInput();releaseSeatRoute();
 goal=null;sitting=null;poseSeat=null;companionSeat=null;rising=false;
 const pair=[actor,...Object.values(actors).filter(a=>a!==actor)],spots=[INTRO_INVITATION_POSITIONS.m,INTRO_INVITATION_POSITIONS.f];
 if(spots.some(p=>!canWalk(p.x,p.z)))return false;
 // Reuse the clear floor positions already fitted for the invitation. The
 // inspected actor stands nearest the body camera, never inside its old chair.
 for(const [index,a]of pair.entries()){
  const p=spots[index];a.root.position.set(p.x,0,p.z);a.root.rotation.set(0,p.yaw,0);a.body.position.y=0;a.body.visible=true;
  a.sit=a.speed=a.phase=0;a.motionSeat=null;a.conversationPose=null;a.live=false;a.stamp='';animateBody(a,0,null);
 }
 $('rise').hidden=true;return true;
}
const member=createMemberBridge({
 T,actors:{...actors,guest:visitor},player:()=>actors[role],partner,seats,roomSeats,canvas,cam,orbit,resetView,walkToSeat,feetAt,animateBody,updateCam,cinemaArrival,originalAhmed,
 prepareInspection:prepareBodyInspection,
 unzip:unzipSync,get settled(){return !seatRoute&&player().speed<=.08;},get place(){return where},get role(){return role},setRole,freeCamera,
 focus(view,target=''){freeCamera();orbit.follow=false;const a=target==='m'||target==='f'?actors[target]:target==='guest'&&visiting?visitor:target==='resident'&&authorRoom?actors.f:player(),p=a.root.position;
 orbit.angle=a.root.rotation.y+(view==='Profil'?1.35:view==='Dos'?Math.PI:0);
 orbit.pitch=.065;orbit.radius=view==='Visage'?1.02:2.8;
 if(view==='Visage')orbit.focus.copy(headCenter(a));else orbit.focus.set(p.x,p.y+(a.sit>.5?.70:.95)*a.root.scale.y,p.z);updateCam(1);},
 meet(marianne=false){if(encounter.active)leaveReunion();if(where!=='salon')returnHome();visiting=true;visitsMarianne=marianne;presence();releaseSeatRoute();if(sitting)getUp();
 const pairs=[['chair','sofa2'],['east1','west1'],['west2','east2'],['end1','end2'],['sofa1','chair'],['sofa3','chair']];
 const pair=pairs[Math.floor(Math.random()*pairs.length)],seat=seats.find(s=>s.id===pair[0]),friend=partner();
 friend.root.position.set(...feetAt(seat,friend));friend.root.rotation.y=seat.yaw;
 friend.sit=1;friend.speed=0;friend.stamp='';animateBody(friend,0,seat);
 companionSeat=seat;$('actors').hidden=true;walkToSeat(seats.find(s=>s.id===pair[1]));talkOpen=true;},
 clearMeeting(){if(visiting&&where==='jardin')returnHome();unwear(visitor);visiting=false;visitsMarianne=false;visitor.root.visible=false;if(encounter.active)leaveReunion();$('actors').hidden=where!=='salon';companionSeat=null;conversation=null;talkOpen=false;if(where==='salon'){if(sitting)getUp();releaseSeatRoute();goal=null;actorHome();resetView();}},
 camera(mode,speaker,inset=0){conversation=mode==='manual'?null:{mode,speaker,inset};if(conversation){travel.reset();detail.reset();}},
 snapshot(){
   const a=player(),head=headCenter(a);
   const portrait=new T.PerspectiveCamera(32,canvas.width/canvas.height,.05,100);
   portrait.position.copy(head).add(new T.Vector3(.08*Math.cos(a.root.rotation.y)+.65*Math.sin(a.root.rotation.y),.035,.65*Math.cos(a.root.rotation.y)-.08*Math.sin(a.root.rotation.y)));
   portrait.lookAt(head);renderer.render(scene,portrait);
   const image=document.createElement('canvas');image.width=image.height=128;
   const size=Math.min(canvas.width,canvas.height);image.getContext('2d').drawImage(canvas,(canvas.width-size)/2,(canvas.height-size)/2,size,size,0,0,128,128);
   renderer.render(scene,cam);return image.toDataURL('image/webp',.86);
 },
 setHudOcclusion({side='left',fraction=0}={}){
   hudOcclusion={side:side==='right'?'right':'left',fraction:Math.min(.46,Math.max(0,Number(fraction)||0))};
 },
 clearCamera(){conversation=null;}
});
function headCenter(actor){
 const center=new T.Vector3(0,.144,.032);
 if(actor.cinemaAhmed?.active)return actor.cinemaAhmed.headPosition(center);
 if(actor.referenceFace)return actor.referenceFace.group.localToWorld(center);
 const eyes=actor.parts.find(p=>p.name==='eyesNative');
 if(!eyes)return actor.root.localToWorld(center.set(0,actor.sit>.5?1.15:1.54,0));
 const attr=eyes.obj.geometry.attributes.position,point=new T.Vector3();center.set(0,0,0);let count=0;
 for(let i=0;i<attr.count;i+=Math.max(1,Math.floor(attr.count/64))){center.add(point.fromBufferAttribute(attr,i));count++;}
 return eyes.obj.localToWorld(center.divideScalar(count));
}
function memberCamera(){
 const size=seatRoute||player().speed>.08?'wide':conversation.mode;
 focusShot=composeDialogue(cam,headCenter(player()),headCenter(partner()),size,conversation.speaker,conversation.inset);
}
const messageEye=new T.Vector3(),messageTarget=new T.Vector3(),messageAnchor=new T.Vector3();
const reduceReunionMotion=matchMedia('(prefers-reduced-motion: reduce)');
function reunionCamera(portrait){
 const p=player().root.position,q=partner().root.position,axis=Math.atan2(q.x-p.x,q.z-p.z);
 const dx=Math.sin(axis),dz=Math.cos(axis),sx=dz,sz=-dx;
 const wide=exchange.phase==='laugh';
 if(wide){
  const t=reduceReunionMotion.matches?0:eased(exchange.revolution);
  const angle=axis+Math.PI*.50+t*tau,r=portrait?5.85:5.15;
  messageTarget.copy(p).lerp(q,.5);messageTarget.y+=1.14;
  messageEye.set(messageTarget.x+Math.sin(angle)*r,messageTarget.y+.35+.42*Math.sin(t*Math.PI),messageTarget.z+Math.cos(angle)*r);
  orbit.angle=angle;orbit.pitch=.10;orbit.radius=r;orbit.focus.copy(messageTarget);
 }else{
  const reverse=exchange.phase==='reply';
  focusShot=composeDialogue(cam,headCenter(player()),headCenter(partner()),reverse?'close':'medium',reverse?'guest':'player');
  return;
 }
 cam.position.copy(messageEye);cam.lookAt(messageTarget);
}
function placeSkyBubbles(w,h){
 for(const [i,bubble] of exchange.bubbles.entries()){
  if(bubble.hidden)continue;
  const actor=i?partner():player();messageAnchor.copy(actor.root.position);messageAnchor.y+=1.25;messageAnchor.project(cam);
  const width=bubble.offsetWidth,height=bubble.offsetHeight;
  let x=(messageAnchor.x*.5+.5)*w, y=(.5-messageAnchor.y*.5)*h+18;
  if(exchange.phase==='laugh'){x=clamp(x,width/2+12,w-width/2-12);y+=i?12:-22;}
  bubble.style.left=clamp(x,width/2+9,w-width/2-9)+'px';
  bubble.style.top=clamp(y,49,Math.max(49,h-height-25))+'px';
 }
}
const reunionAction=$('reunionAction');
const rendezVous=new T.Vector3(.50,10.5,3.65);
function leaveReunion(){
 if(!encounter.active)return;
 exchange.stop();releaseSeatRoute();goal=null;encounter.route=null;resetAir();
 for(const a of currentPair()){unwear(a);a.root.visible=false;}
 encounter.active=false;chosen=null;document.body.classList.remove('reunion');setLocation(false);resetView();
 Object.values(actors).forEach((a,i)=>a.root.visible=encounter.saved[i]);
 reunionAction.hidden=$('reunionNext').hidden=true;
 canvas.focus({preventScroll:true});
}
function walkToBay(){
 if(sitting)getUp();releaseSeatRoute();goal=null;
 const p=player().root.position,route=roomPath([p.x*100+700,p.z*100-800],[694,-588]);
 if(route)encounter.route=route.slice(1).map(([x,z])=>({x:(x-700)/100,z:(z+800)/100}));
 else $('notice').textContent='Approche-toi de la baie avec le joystick.';
}
function crossBay(){
 const a=player(),p=a.root.position.clone().applyMatrix4(roomToGarden);
 const angle=orbit.angle+Math.PI+Math.atan(baySlope);
 chosen='pin';setLocation(true);a.root.position.set(p.x,0,10.24);a.root.rotation.y=Math.PI;
 orbit.angle=angle;orbit.follow=true;orbit.focus.copy(a.root.position);orbit.focus.y=.96;
 wear(a,bags.pin);partner().root.visible=true;placeLionel();updateCam(1);
 encounter.route=[{x:pathX(8.5),z:8.5},{x:pathX(5.45),z:5.45}];
}
function placeLionel(){
 const b=partner(),p=player().root.position,phase=encounter.clock*3.6+.8;
 b.root.position.copy(rendezVous);b.root.position.y+=.075*Math.sin(phase);
 b.root.rotation.y=Math.atan2(p.x-b.root.position.x,p.z-b.root.position.z)+(encounter.chatView?.38:0);
 b.angel.pivot.position.y=.97+.025*Math.sin(phase);b.angel.pivot.rotation.set(-.035,0,.025*Math.cos(phase));
 glidingLimbs(b,10,.035);poseWings(b,1,phase,.54);b.shadow.visible=false;
}
function tickReunion(dt){
 encounter.clock+=dt;const p=player().root.position,out=where==='jardin';
 if(out)placeLionel();
 if(encounter.chatView&&(stick.x||stick.y||keys.size||p.distanceTo(rendezVous)>5.2))encounter.chatView=false;
 exchange.tick(dt);if(exchange.active||exchange.finished)encounter.bridge.speechFrame();
 if(exchange.laughter){const t=exchange.laughter;for(const [i,a] of currentPair().entries())a.angel.pivot.rotation.x+=.047*Math.sin(17*t+2*i);}
 const distance=p.distanceTo(rendezVous),canTalk=out&&air.mode==='flying'&&distance<4.4;
 let label;
 if(!out)label=encounter.route?'Vers la baie vitrée…':'Sortir par la baie vitrée';
 else if(underRoof(p.x,p.z))label='Avancer dans le jardin';
 else if(air.mode==='off')label='Déployer mes ailes';
 else if(air.mode==='ready')label='Décoller';
 else if(exchange.active)label='Ahmed Marie et Lionel';
 else if(canTalk)label=exchange.finished?'Relire l’échange':'Parler à Lionel';
 else if(air.mode==='flying')label='Rejoindre Lionel · '+Math.round(distance)+' m';
 else label='Retour au jardin';
 if(reunionAction.textContent!==label)reunionAction.textContent=label;
 const direction=!out?'Sors par la baie pour retrouver Lionel.':air.mode==='flying'?'Maintiens le battement pour monter.':air.mode==='ready'?'Bats des ailes pour décoller.':'Rejoins l’allée pour déployer tes ailes.';
 if(zoneLabel.textContent!==direction)zoneLabel.textContent=direction;
 reunionAction.disabled=exchange.active||(!out&&!!encounter.route)||(air.mode==='flying'&&!canTalk)||air.mode==='landing'||air.mode==='folding';
 $('reunionNext').hidden=!exchange.finished;
}
reunionAction.onclick=()=>{
 if(where==='salon')walkToBay();
 else if(underRoof(player().root.position.x,player().root.position.z))encounter.route=[{x:pathX(5.45),z:5.45}];
 else if(air.mode==='off')toggleAngel();
 else if(air.mode==='ready')beat();
 else if(air.mode==='flying'&&player().root.position.distanceTo(rendezVous)<4.4){
  const p=player().root.position,q=partner().root.position;
  encounter.chatView=true;air.front=false;orbit.angle=Math.atan2(q.x-p.x,q.z-p.z)+Math.PI*.48;orbit.pitch=.09;orbit.follow=true;
  air.heading=Math.atan2(q.x-p.x,q.z-p.z)-.38;refreshFlight();exchange.start();
 }
 canvas.focus({preventScroll:true});
};


/* Author-only prologue uses the supplied GLB room, supplied GLB dojo,
   and the already detailed / animated actors of Salon V27. */
const introRequested=new URLSearchParams(location.search).get('intro3d')==='1'&&authorRoom;
let introAuthorized=false,introOriginal=null,introCurrent='none';
let introSeatClock=0;
const introFloor=new T.Mesh(new T.PlaneGeometry(90,90),
 new T.MeshStandardMaterial({color:0xffffff,roughness:1,side:T.DoubleSide}));
introFloor.rotation.x=-Math.PI/2;introFloor.position.y=-.026;introFloor.receiveShadow=true;
introFloor.visible=false;scene.add(introFloor);
const introMaterials=new Map();
function introWhiteClothes(){
 for(const a of [actors.m,actors.f])for(const p of a.parts){
  // Keep the real skin, hair, eyes, expressions and geometry. Only lighten garments.
  if(/body|skin|face|hair|eye|brow|lash|teeth|tongue|nail|beard|moustache/i.test(p.name))continue;
  if(!introMaterials.has(p.obj))introMaterials.set(p.obj,p.obj.material);
  const material=p.obj.material.clone();material.color.set(0xffffff);
  material.map=null;material.metalness=0;material.roughness=.94;material.needsUpdate=true;
  p.obj.material=material;
 }
}
function restoreIntroClothes(){
 for(const [mesh,material] of introMaterials){mesh.material.dispose();mesh.material=material;}
 introMaterials.clear();
}
function introPose(mode){
 if(!introAuthorized||!introOriginal)return;
 keys.clear();releaseStick();goal=null;seatRoute=null;conversation=null;
 travel.reset();detail.reset();releaseSeatRoute();
 if(sitting)getUp();
 if(encounter.active)leaveReunion();
 if(where==='jardin')returnHome();
 introCurrent=mode;
 const {whiteRoom,dojoRoom}=introOriginal;
 whiteRoom.visible=mode==='sofa';
 dojoRoom.visible=mode==='dojo';
 introFloor.visible=mode==='white';
 indoor.visible=false;outdoor.visible=false;
 scene.background=new T.Color(mode==='dojo'?0xe7d8c3:0xffffff);
 scene.fog=new T.FogExp2(mode==='dojo'?0xe7d8c3:0xffffff,mode==='dojo'?.006:.008);
 introWhiteClothes();
 const m=actors.m,f=actors.f;
 m.root.visible=f.root.visible=true;
 if(mode==='sofa'){
  introSeatClock=0;
  const seatM=seats.find(q=>q.id==='chair'),seatF=seats.find(q=>q.id==='sofa2');
  for(const [actor,x,seat] of [[m,-1.28,seatM],[f,1.32,seatF]]){
   actor.root.position.set(x,0,.04);actor.root.rotation.y=Math.PI;
   actor.sit=0;actor.speed=0;actor.stamp='';animateBody(actor,0,seat);
  }
 }else{
  for(const [actor,x] of [[m,-.88],[f,.88]]){
   actor.root.position.set(x,0,mode==='dojo'?.7:0);
   actor.root.rotation.y=mode==='dojo'?0:Math.PI;
   actor.sit=0;actor.speed=0;actor.stamp='';animateBody(actor,0,0);
  }
 }
 if(mode==='dojo'){
  if(introDirector)introDirector.active=false;
  orbit.follow=true;orbit.angle=2.95;orbit.pitch=.19;orbit.radius=4.4;
  orbit.focus.set(f.root.position.x,.92,f.root.position.z);
  $('pad').hidden=false;$('cameraPad').hidden=false;
  document.body.classList.remove('intro-cinematic');
 }else{
  document.body.classList.add('intro-cinematic');
  $('pad').hidden=true;$('cameraPad').hidden=true;
  orbit.follow=false;
  introDirector??={active:true,position:new T.Vector3(0,1.85,-3.85),focus:new T.Vector3(0,1.1,0),speed:1.0,fov:46};
  introDirector.active=true;
  introShot('face');
 }
}
function introShot(kind){
 if(!introAuthorized||!introDirector||introCurrent==='dojo')return;
 const white=introCurrent==='white';
 const target=new T.Vector3(0,white?1.12:1.14,white?0:.03);
 const aim=new T.Vector3();
 if(kind==='tv'){
  // Behind the characters, pointing toward the ORIGINAL television.
  aim.set(0,1.68,3.50);target.set(0,1.05,-1.05);
 }else if(kind==='wide'){
  aim.set(1.55,2.14,-4.30);
 }else if(kind==='close'){
  aim.set(-.95,1.49,-2.80);target.set(-.62,1.32,0);
 }else{
  // Facing the two characters, from behind the supplied television.
  aim.set(0,1.80,-3.95);
 }
 introDirector.position.copy(aim);introDirector.focus.copy(target);
 introDirector.speed=kind==='tv'?.68:kind==='wide'?.88:1.16;
 introDirector.fov=kind==='close'?37:kind==='wide'?52:46;
}
function introExit(){
 if(!introAuthorized)return;
 introCurrent='none';if(introDirector)introDirector.active=false;
 introOriginal.whiteRoom.visible=false;introOriginal.dojoRoom.visible=false;
 introFloor.visible=false;restoreIntroClothes();
 indoor.visible=true;outdoor.visible=true;
 document.body.classList.remove('intro-cinematic');
 $('pad').hidden=false;$('cameraPad').hidden=false;
 if(where==='salon'){actorHome();setLocation(false);resetView();}
}
window.addEventListener('message',event=>{
 if(!introAuthorized||event.origin!==location.origin||event.source!==window.parent)return;
 const message=event.data;
 if(message?.scope!=='maison-intro-v27')return;
 try{
  if(message.action==='pose'&&['white','sofa','dojo'].includes(message.value))introPose(message.value);
  else if(message.action==='camera'&&['face','tv','wide','close'].includes(message.value))introShot(message.value);
  else if(message.action==='garden'){introExit();equip('pin');}
  else if(message.action==='exit')introExit();
 }catch(e){window.parent.postMessage({scope:'maison-intro-v27',type:'error',message:String(e?.message||e)},location.origin);}
});
if(introRequested){
 window.addEventListener('salon-ready',async()=>{
  try{
   const response=await fetch('/api/membres/me?auteur=1',{credentials:'same-origin',cache:'no-store'});
   if(!response.ok||!(await response.json()).author)throw Error('Accès auteur non confirmé');
   introAuthorized=true;
   introOriginal=await loadOriginalCinemaAssets(scene);
   if(!introOriginal.blueChair||!introOriginal.redChair||!introOriginal.television)console.warn('Les noms de certains objets ont été modifiés dans le GLB, mais le décor original est chargé.');
   introPose('white');
   window.parent.postMessage({scope:'maison-intro-v27',type:'ready'},location.origin);
  }catch(error){window.parent.postMessage({scope:'maison-intro-v27',type:'error',message:String(error?.message||error)},location.origin);}
 });
}

if(cinemaArrival){
 let invited=[];
 invitationScene=createIntroInvitationScene({
  viewport:()=>({width:view.clientWidth,height:view.clientHeight}),
  async prepare(){
   window.salonArrival?.progress('invitation','Préparation des deux personnages invités…');
   invited=await prepareIntroInvitationGuests(scene);
   for(const actor of invited){
    actor.shadow=shade(actor.root,0,0,.78,.52,.012);
    actor.shadow.material=shadeMat.clone();actor.shadow.material.opacity=.85;actor.root.visible=false;
    const halo=new T.Mesh(new T.RingGeometry(.43,.48,48),new T.MeshBasicMaterial({color:0xe6d3a6,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));
    halo.name='Invitation · halo au sol';halo.rotation.x=-Math.PI/2;halo.visible=false;halo.userData.ignorePick=true;
    scene.add(halo);actor.invitationReveal=halo;
   }
  },
  begin(){
   document.body.classList.add('intro-finale');
   if(help.open)help.close();if(catalog.open)catalog.close();
   if(encounter.active)leaveReunion();
   if(introDirector)introDirector.active=false;
   keys.clear();releaseStick();releaseAirInput();travel.reset();detail.reset();releaseSeatRoute();
   conversation=null;companionSeat=null;goal=null;sitting=null;poseSeat=null;rising=false;chosen=null;
   visiting=visitsMarianne=false;visitor.root.visible=false;
   resetAir();setLocation(false);revealStart=null;homeView=windowView=false;
   for(const actor of [actors.m,actors.f]){
    unwear(actor);actor.root.visible=actor.body.visible=true;actor.body.position.y=0;
    actor.sit=actor.speed=actor.phase=0;actor.stamp='';actor.motionSeat=null;
   }
   updateSize();
  },
  apply(frame){
   for(const id of ['m','f']){
    const actor=actors[id],pose=frame.actors[id];
    const level=frame.voice?.speaker===id?Math.min(1,frame.voice.energy*45):0,jaw=level>.025?Math.min(.28,.02+.23*level):0,spread=level>.025?Math.min(.48,.06+.36*level):.16;
    actor.root.position.set(pose.x,0,pose.z);actor.root.rotation.set(0,pose.yaw,0);
    actor.conversationPose=pose.expression;
    if(actor.cinemaAhmed?.active){
     actor.cinemaAhmed.animate(0,null,0,frame.time);
     actor.cinemaAhmed.talk({jaw,spread},frame.time);
    }else if(actor.motion){
     const solver=actor.solver??=new SalonMotion(undefined,{angle:0});solver.femaleHands=actor.id==='f';
     actor.motion.apply(solver.sampleSalonPose(null,0,frame.time,pose.expression,actor.root.scale.y));
     actor.live=true;actor.stamp='invitation/'+frame.elapsedMs;
     actor.referenceFace?.follow(true);
     const blink=(frame.time+(id==='f'?1.2:0))%5.3;
     actor.referenceFace?.talk({jaw,spread,blink:blink<.16?Math.sin(blink/.16*Math.PI):0});
    }
   }
   for(const [index,actor]of invited.entries())applyIntroInvitationGuest(actor,{...frame.actors.guest,opacity:index===frame.cue.guestIndex?frame.actors.guest.opacity:0},frame.time);
   const width=frame.viewport.width,height=frame.viewport.height;
   cam.fov=frame.camera.fov;cam.aspect=width/height;
   cam.setViewOffset(width,height,frame.camera.offsetX,frame.camera.offsetY,width,height);
   cam.position.fromArray(frame.camera.position);cam.lookAt(new T.Vector3().fromArray(frame.camera.target));
   cam.updateProjectionMatrix();cam.updateMatrixWorld(true);scene.updateMatrixWorld(true);flutter(0,frame.time);focusShot=null;
  },
  faces(){
   const width=view.clientWidth,height=view.clientHeight;
   return [['m',actors.m],['f',actors.f],...invited.map((actor,index)=>['guest'+index,actor])].filter(([,actor])=>actor.root.visible).map(([id,actor])=>{
    const world=headCenter(actor),point=world.clone().project(cam),edge=world.clone().add(new T.Vector3(.17,0,0)).project(cam);
    return {id,x:(point.x*.5+.5)*width,y:(-.5*point.y+.5)*height,r:Math.max(9,Math.abs(edge.x-point.x)*width*.5),visible:point.z>-1&&point.z<1};
   });
  },
  finish(){
   for(const actor of invited){actor.root.visible=false;actor.invitationReveal.visible=false;}
   for(const actor of [actors.m,actors.f]){actor.conversationPose=null;actor.live=false;actor.stamp='';}
   document.body.classList.remove('intro-finale');cam.clearViewOffset();
   keys.clear();releaseStick();releaseAirInput();travel.reset();detail.reset();
   chosen=null;revealStart=null;conversation=null;companionSeat=null;goal=null;sitting=null;poseSeat=null;
   setLocation(false);actorHome();resetView();updateSize();last=performance.now();
  }
 });
 member.introInvitation=invitationScene;
 const centerX=pathX(3.62);
 arrivalFinale=createIntroFinale({
  viewport:()=>({width:view.clientWidth,height:view.clientHeight}),
  begin(){
   if(invitationScene?.active)invitationScene.finish();cam.clearViewOffset();
   document.body.classList.add('intro-finale');
   if(help.open)help.close();if(catalog.open)catalog.close();
   if(encounter.active)leaveReunion();
   keys.clear();releaseStick();releaseAirInput();travel.reset();detail.reset();releaseSeatRoute();
   conversation=null;companionSeat=null;goal=null;sitting=null;poseSeat=null;rising=false;chosen=null;
   resetAir();setLocation(true);revealStart=null;homeView=windowView=false;
   for(const a of [actors.m,actors.f]){
    unwear(a);flightRig(a);a.root.visible=a.body.visible=true;a.body.position.y=0;
    a.sit=a.speed=a.phase=0;a.stamp='';animateBody(a,0,null);
   }
   updateSize();
  },
  apply(frame){
   for(const id of ['m','f']){
    const a=actors[id],p=frame.actors[id];
    a.root.position.set(centerX+p.x,0,p.z);a.root.rotation.set(0,p.yaw,0);
    a.angel.pivot.position.set(0,.97,0);a.angel.pivot.rotation.set(0,0,0);a.angel.lean=0;
    a.shadow.position.y=.03;a.shadow.scale.set(1,1,1);
    poseWings(a,frame.wings,frame.wingPhase+(id==='f'?-.24:0),frame.wingPower);
    if(a.cinemaAhmed?.active){
     const speaking=frame.time>=2&&frame.time<8;
     a.conversationPose=speaking?{gesture:{left:.06,right:.10,reach:20,height:-18,forward:18,palm:.12,nod:.018*Math.sin(frame.time*2)},look:0}:null;
     a.cinemaAhmed.animate(0,null,0,frame.time);a.cinemaAhmed.talk({jaw:speaking?.035*(1+Math.sin(frame.time*12)):0,spread:.20},frame.time);
    }
   }
   air.spread=frame.wings;air.time=frame.time;
   cam.fov=frame.camera.fov;cam.aspect=frame.viewport.width/frame.viewport.height;
   cam.position.fromArray(frame.camera.position);cam.position.x+=centerX;
   cam.lookAt(centerX+frame.camera.target[0],frame.camera.target[1],frame.camera.target[2]);cam.updateProjectionMatrix();cam.updateMatrixWorld(true);
   scene.updateMatrixWorld(true);flutter(0,frame.time);focusShot=null;
   // The same shrubs/billboards and real house stay in the scene.
   for(const sprite of sprites)sprite.rotation.y=Math.atan2(cam.position.x-sprite.position.x,cam.position.z-sprite.position.z);
   distanceGroup.position.set(centerX,0,3.62);
  },
  faces(){
   const width=view.clientWidth,height=view.clientHeight;
   return ['m','f'].map(id=>{
    const world=headCenter(actors[id]),point=world.clone().project(cam),edge=world.clone().add(new T.Vector3(.17,0,0)).project(cam);
    return {id,x:(point.x*.5+.5)*width,y:(-.5*point.y+.5)*height,r:Math.max(9,Math.abs(edge.x-point.x)*width*.5),visible:point.z>-1&&point.z<1};
   });
  },
  finish(){
   document.body.classList.remove('intro-finale');
   keys.clear();releaseStick();releaseAirInput();travel.reset();detail.reset();
   for(const a of [actors.m,actors.f])a.conversationPose=null;
   resetAir();for(const a of [actors.m,actors.f])unwear(a);
   chosen=null;revealStart=null;conversation=null;companionSeat=null;goal=null;sitting=null;poseSeat=null;
   setLocation(false);actorHome();resetView();updateSize();last=performance.now();
   $('notice').textContent='Bienvenue à La Croisée des Âmes.';canvas.focus({preventScroll:true});
  }
 });
 member.introFinale=arrivalFinale;
}
window.salonV27=member;
Promise.all(ready).then(async()=>{
 window.salonArrival?.progress('characters','Préparation d’Ahmed Marie et de Marianne…');
 await member.initialize();
 if(invitationScene)await invitationScene.prepare();
 updateSize();updateCam(0);renderer.render(scene,cam);
 document.body.classList.add('ready');$('loading').hidden=true;
 window.dispatchEvent(new Event('salon-ready'));frameHandle=requestAnimationFrame(frame);
}).catch(e=>window.failure(e.message,'SCENE_ASSETS'));
