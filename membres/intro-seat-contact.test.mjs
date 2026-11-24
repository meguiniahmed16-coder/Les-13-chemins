import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const root=new URL('../',import.meta.url);
const T=await import(new URL('node_modules/three/build/three.module.js',root));
const {GLTFLoader}=await import(new URL('node_modules/three/examples/jsm/loaders/GLTFLoader.js',root));
const {compactWhiteRoom}=await import(new URL('scripts/build-intro-original-assets.mjs',root));
const {poseVertex}=await import(new URL('membres/salon-pose.js',root));
const {SalonMotion}=await import(new URL('membres/salon-v27-motion.js',root));
const {referenceStudio}=await import(new URL('membres/studio-look.js',root));
const read=p=>readFileSync(new URL(p,root));

// Exercise the actual production geometry and skinning. Only browser-only image
// decoding is replaced: texture colour cannot affect cushion or foot contacts.
const index=JSON.parse(read('assets-source/salon-v27/assets.json'));
const archive=Buffer.concat(index.packs.map(p=>read('assets-source/salon-v27/'+p)));
const cache=new Map(),types={Uint8Array,Uint16Array,Int8Array,Int16Array};
async function resource(name){
 if(cache.has(name))return cache.get(name);
 const [offset,length]=index.files[name+'.bin'];
 const zipped=gunzipSync(archive.subarray(offset,offset+length));
 const data=zipped.buffer.slice(zipped.byteOffset,zipped.byteOffset+zipped.byteLength),size=new DataView(data).getUint32(0,true),start=4+size;
 const value=JSON.parse(new TextDecoder().decode(new Uint8Array(data,4,size)),(_,v)=>v&&types[v.type]?new types[v.type](data,start+v.offset,v.bytes/types[v.type].BYTES_PER_ELEMENT):v);
 cache.set(name,value);return value;
}
const pixels=async()=>({width:1,height:1,data:new Uint8ClampedArray([255,255,255,255])});
const modelCode=read('membres/studio-model.js').toString().replace(/^import .*;\n/gm,'').replace('export async function loadStudio','async function loadStudio');
const loadStudio=new Function('resource','pixels','material','poseVertex',modelCode+'\nreturn loadStudio;')(resource,pixels,pixels,poseVertex);
const poses=JSON.parse(read('membres/v27/poses.json'));
const source=read('membres/intro-cinema.js').toString();
const wardrobe=read('membres/intro-wardrobe.js').toString();
const introOutfits=new Function(wardrobe.slice(wardrobe.indexOf('export const introOutfits='),wardrobe.indexOf('let poseData;')).replace('export const','const')+'return introOutfits;')();

function geometryOnly(input){
 const size=input.readUInt32LE(12),json=JSON.parse(input.subarray(20,20+size));
 for(const mesh of json.meshes)for(const primitive of mesh.primitives)delete primitive.material;
 for(const field of ['materials','textures','images','samplers'])delete json[field];
 const text=Buffer.from(JSON.stringify(json)),length=(text.length+3)&~3,tail=input.subarray(20+size),out=Buffer.alloc(20+length+tail.length,32);
 input.copy(out,0,0,20);out.writeUInt32LE(out.length,8);out.writeUInt32LE(length,12);text.copy(out,20);tail.copy(out,20+length);
 return out.buffer.slice(out.byteOffset,out.byteOffset+out.byteLength);
}
const roomFile=compactWhiteRoom(Buffer.concat(Array.from({length:31},(_,i)=>read('assets-source/intro-original/white/'+String(i).padStart(3,'0')+'.bin'))));
const room=(await new GLTFLoader().parseAsync(geometryOnly(roomFile),'')).scene,chairs=[];
room.traverse(o=>{if(/^(?:BLUE|RED)[\s_]*CHAIR/i.test(o.name))chairs.push(o);});
assert.equal(chairs.length,2,'Both original chair models must be present');
const measurementCode=source.slice(source.indexOf('const seatAnchors='),source.indexOf('async function loadWhite()'));
const layoutCode=source.slice(source.indexOf('function chairLayout('),source.indexOf('function targetLayout('));
const setup=new Function('T','room','chairs','remember',measurementCode+layoutCode+'\nreturn {fit:typeof fitOriginalChair==="function"?fitOriginalChair:()=>{},measureSeats,seatAnchors,chairLayout,findChild};')(T,room,chairs,()=>{});
chairs.forEach(setup.fit);room.updateMatrixWorld(true);setup.measureSeats();

// Index real cushion triangles by X/Z so every visible trouser vertex can be
// tested against the curved surface without a slow whole-mesh ray per vertex.
function cushionSurface(object){
 const cell=.03,bins=new Map(),point=new T.Vector3();object.updateWorldMatrix(true,true);
 object.traverse(mesh=>{
  if(!mesh.isMesh)return;const p=mesh.geometry.attributes.position,ids=mesh.geometry.index;
  const v=Array.from({length:p.count},(_,i)=>point.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld).toArray());
  const count=ids?ids.count:p.count;
  for(let i=0;i<count;i+=3){
   const a=v[ids?ids.getX(i):i],b=v[ids?ids.getX(i+1):i+1],c=v[ids?ids.getX(i+2):i+2];
   const ux=b[0]-a[0],uz=b[2]-a[2],vx=c[0]-a[0],vz=c[2]-a[2],den=ux*vz-uz*vx;
   if(Math.abs(den)<1e-12)continue;
   const tr={a,ux,uz,vx,vz,uy:b[1]-a[1],vy:c[1]-a[1],den};
   for(let x=Math.floor(Math.min(a[0],b[0],c[0])/cell);x<=Math.floor(Math.max(a[0],b[0],c[0])/cell);x++)
    for(let z=Math.floor(Math.min(a[2],b[2],c[2])/cell);z<=Math.floor(Math.max(a[2],b[2],c[2])/cell);z++){
     const key=x+','+z;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(tr);
    }
  }
 });
 return (x,z)=>{
  let top=-Infinity,bottom=Infinity;
  for(const q of bins.get(Math.floor(x/cell)+','+Math.floor(z/cell))||[]){
   const dx=x-q.a[0],dz=z-q.a[2],u=(dx*q.vz-dz*q.vx)/q.den,v=(q.ux*dz-q.uz*dx)/q.den;
   if(u<-.000001||v<-.000001||u+v>1.000001)continue;
   const y=q.a[1]+u*q.uy+v*q.vy;top=Math.max(top,y);bottom=Math.min(bottom,y);
  }
  return top===-Infinity?null:{top,bottom};
 };
}
for(const [id,label] of [['m','Ahmed'],['f','Marianne']])test(label+' keeps trousers outside the original cushion and both feet supported',async t=>{
 // Ahmed's existing imported parent carries this measured source offset; the
 // private portrait file is deliberately not part of the test or public build.
 const gender=id==='m'?'homme':'femme',scale=id==='m'?1.075:1.04,yOffset=id==='m'?-.007955:0;
 const look=referenceStudio(gender);look.outfit={...introOutfits[id]};
 const figure=await loadStudio(look,gender);figure.pose(poses[id].rest);
 const trousers=figure.meshes.find(m=>m.group==='pantalons'),shoes=figure.meshes.find(m=>m.group==='chaussures');
 assert.ok(trousers&&shoes,'Selected library trousers and shoes must load');
 const rest=trousers.v.slice(),shoeRest=shoes.v.slice(),visible=[...new Set(trousers.faces)],soles=[...new Set(shoes.faces)];
 const actorRoot=new T.Group(),garmentParent=new T.Group();garmentParent.position.y=yOffset;actorRoot.add(garmentParent);
 const person={id,root:actorRoot,parts:[{source:{binding:true},obj:garmentParent}]},layout=setup.chairLayout(person),yaw=layout.yaw,c=Math.cos(yaw),s=Math.sin(yaw);
 const chair=chairs.find(o=>(id==='m'?/RED/:/BLUE/).test(o.name));
 const surface=cushionSurface(setup.findChild(chair,/^Cushion_low/i));
 for(const contact of setup.seatAnchors.get(id).arms){
  const ray=new T.Raycaster(contact.clone().add(new T.Vector3(0,.02,0)),new T.Vector3(0,-1,0));
  const hit=ray.intersectObject(chair,true)[0];
  assert.ok(hit&&Math.abs(hit.point.y-contact.y)<.001, label+' armrest target lies on the real padding');
  const normal=hit.face.normal.clone().applyNormalMatrix(new T.Matrix3().getNormalMatrix(hit.object.matrixWorld));
  assert.ok(normal.y>.58,label+' armrest target faces upward rather than into the inner flank');
 }
 const solver=new SalonMotion(()=>{},{angle:0},undefined,()=>.42);solver.femaleHands=id==='f';
 let finalClosest=Infinity,finalSamples=0,minimumSole=Infinity,maximumSole=-Infinity;
 for(const amount of [0,.25,.5,.65,.75,.85,.95,1]){
  figure.pose(solver.sampleSalonPose(person.introSeat,amount,0,null,scale));
  let worst=0,sampled=0;
  for(const i of visible){
   // Knees, thighs and pelvis; never mistake the lower shin below the whole
   // cushion for an intersection with its top surface.
   if(rest[3*i+1]<4500||rest[3*i+1]>10500)continue;
   const x=trousers.v[3*i]*.0001*scale,y=trousers.v[3*i+1]*.0001*scale+yOffset+layout.pos.y,z=trousers.v[3*i+2]*.0001*scale;
   const h=surface(layout.pos.x+c*x+s*z,layout.pos.z-s*x+c*z);if(!h)continue;sampled++;
   if(y>=h.bottom-.003)worst=Math.max(worst,h.top-y);
   if(amount===1&&y>=h.top-.003){finalClosest=Math.min(finalClosest,y-h.top);finalSamples++;}
  }
  assert.ok(worst<=.001,`${label}, sit ${amount}: trousers enter cushion by ${(worst*100).toFixed(2)} cm`);
  for(const side of [-1,1]){
   const ys=soles.filter(i=>Math.sign(shoeRest[3*i])===side).map(i=>shoes.v[3*i+1]*.0001*scale+yOffset+layout.pos.y);
   const floor=Math.min(...ys);minimumSole=Math.min(minimumSole,floor);maximumSole=Math.max(maximumSole,floor);
   assert.ok(floor>=-.003&&floor<=.004,`${label}, sit ${amount}, foot ${side}: sole height ${floor.toFixed(4)} m`);
  }
 }
 assert.ok(finalSamples>=10,'The seated trousers must overlap the actual cushion footprint');
 assert.ok(finalClosest<=.025,`${label}: trousers float ${(finalClosest*100).toFixed(2)} cm above cushion`);
 t.diagnostic(`${label}: seated clearance ${(finalClosest*1000).toFixed(1)} mm; sole range ${(minimumSole*1000).toFixed(1)} to ${(maximumSole*1000).toFixed(1)} mm; ${finalSamples} cushion samples`);
});
