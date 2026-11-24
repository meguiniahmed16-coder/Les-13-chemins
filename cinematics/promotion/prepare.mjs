// Bake the production meshes and production pose solver. No avatar is recreated.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {unzipSync} from 'three/addons/libs/fflate.module.js';
import {referenceStudio} from '../../membres/studio-look.js';
import {traits} from '../../membres/studio-catalog.js';
import {poseVertex} from '../../membres/salon-pose.js';
import {SalonMotion} from '../../membres/salon-v27-motion.js';
import {attachFemaleHead} from '../../membres/v27/female-reference.js';
import {dojoBlocking,dojoDirectedCamera,DOJO_DURATIONS} from '../../membres/intro-dojo-director.js';
import {DOJO_LOOKS,dojoLook,styleDojoFigure} from '../../membres/intro-dojo-wardrobe.js';
import {introFinaleFrame} from '../../membres/v27/intro-finale.js';
import {exportButterflies} from '../intro/export-butterflies.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const option=name=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null;};
if(!process.argv[2]||!option('--ahmed'))throw Error('Usage: node cinematics/promotion/prepare.mjs OUTPUT_DIRECTORY --ahmed ORIGINAL_PRIVATE_GLB [--preview]');
const out=path.resolve(process.argv[2]);
const preview=process.argv.includes('--preview'),fps=20,width=960,height=540;
for(const dir of ['', 'textures','poses'])fs.mkdirSync(path.join(out,dir),{recursive:true});
const read=p=>fs.readFileSync(path.join(repo,p));
const hash=b=>createHash('sha256').update(b).digest('hex');
const py=(code,input)=>{const p=spawnSync('python3',['-c',code],{input,maxBuffer:96*1024*1024});if(p.status)throw Error(p.stderr.toString());return p.stdout;};
const decoded=new Map();
async function pixels(encoded){
 const key=hash(encoded);if(decoded.has(key))return decoded.get(key);
 const raw=py('import sys,io,struct;from PIL import Image;i=Image.open(io.BytesIO(sys.stdin.buffer.read())).convert("RGBA");sys.stdout.buffer.write(struct.pack("<II",*i.size)+i.tobytes())',encoded);
 const image={width:raw.readUInt32LE(0),height:raw.readUInt32LE(4),data:new Uint8ClampedArray(raw.subarray(8))};decoded.set(key,image);return image;
}
globalThis.ImageData=class {constructor(a,b,c){if(typeof a==='number'){this.width=a;this.height=b;this.data=new Uint8ClampedArray(a*b*4);}else{this.data=a;this.width=b;this.height=c;}}};
globalThis.document={createElement(){const canvas={width:0,height:0,data:null};canvas.getContext=()=>({
 putImageData(image){canvas.data=image;},drawImage(source){
  const image=source.data,head=Buffer.alloc(16);head.writeUInt32LE(image.width,0);head.writeUInt32LE(image.height,4);head.writeUInt32LE(canvas.width,8);head.writeUInt32LE(canvas.height,12);
  const raw=py('import sys,struct;from PIL import Image;b=sys.stdin.buffer.read();w,h,x,y=struct.unpack("<IIII",b[:16]);i=Image.frombytes("RGBA",(w,h),b[16:]).resize((x,y),Image.Resampling.LANCZOS);sys.stdout.buffer.write(i.tobytes())',Buffer.concat([head,Buffer.from(image.data)]));
  canvas.data=new ImageData(new Uint8ClampedArray(raw),canvas.width,canvas.height);
 },getImageData(){return canvas.data;}});return canvas;}};
const assetIndex=JSON.parse(read('assets-source/salon-v27/assets.json'));
const archive=Buffer.concat(assetIndex.packs.map(p=>read('assets-source/salon-v27/'+p))),resourceCache=new Map();
const types={Uint8Array,Uint16Array,Int8Array,Int16Array};
async function resource(name){
 if(resourceCache.has(name))return resourceCache.get(name);
 const [offset,length]=assetIndex.files[name+'.bin'],zip=gunzipSync(archive.subarray(offset,offset+length));
 const buffer=zip.buffer.slice(zip.byteOffset,zip.byteOffset+zip.byteLength),size=new DataView(buffer).getUint32(0,true),start=4+size;
 const value=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,4,size)),(_,v)=>v&&types[v.type]?new types[v.type](buffer,start+v.offset,v.bytes/types[v.type].BYTES_PER_ELEMENT):v);
 resourceCache.set(name,value);return value;
}
function moduleBody(name){return read(name).toString().replace(/^import .*;\n/gm,'').replace(/\bexport /g,'');}
const material=new Function('resource','pixels','traits',moduleBody('membres/studio-materials.js')+';return material;')(resource,pixels,traits);
const loadStudio=new Function('resource','pixels','material','poseVertex',moduleBody('membres/studio-model.js')+';return loadStudio;')(resource,pixels,material,poseVertex);
const textureCache=new WeakMap();
function texturePath(texture){
 if(!texture?.image?.data)return null;
 if(textureCache.has(texture))return textureCache.get(texture);
 const image=texture.image,key=hash(Buffer.from(image.data)).slice(0,20),name='textures/'+key+'.png';
 if(!fs.existsSync(path.join(out,name))){
  const header=Buffer.alloc(8);header.writeUInt32LE(image.width);header.writeUInt32LE(image.height,4);
  const png=py('import sys,struct,io;from PIL import Image;b=sys.stdin.buffer.read();w,h=struct.unpack("<II",b[:8]);i=Image.frombytes("RGBA",(w,h),b[8:]);o=io.BytesIO();i.save(o,format="PNG");sys.stdout.buffer.write(o.getvalue())',Buffer.concat([header,Buffer.from(image.data)]));
  fs.writeFileSync(path.join(out,name),png);
 }
 textureCache.set(texture,name);return name;
}
function loader(){return new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).register(parser=>({name:'PROMOTION_TEXTURES',async loadTexture(index){
 const d=parser.json.textures[index],image=parser.json.images[d.source??d.extensions?.EXT_texture_webp?.source];
 if(image.bufferView===undefined)throw Error('Unexpected external GLB texture');
 const raw=await parser.getDependency('bufferView',image.bufferView),p=await pixels(new Uint8Array(raw));
 const texture=new T.DataTexture(p.data,p.width,p.height);texture.flipY=false;texture.needsUpdate=true;return texture;
}}));}
async function glb(bytes){
 // The original dojo stores its albedo in the legacy specular/gloss extension.
 // Translate only that material declaration; keep every source texel/triangle.
 const size=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+size));
 if(json.extensionsUsed?.includes('KHR_materials_pbrSpecularGlossiness')){
  for(const m of json.materials||[]){const sg=m.extensions?.KHR_materials_pbrSpecularGlossiness;if(sg){m.pbrMetallicRoughness={baseColorFactor:sg.diffuseFactor||[1,1,1,1],baseColorTexture:sg.diffuseTexture,metallicFactor:0,roughnessFactor:1-(sg.glossinessFactor??0)};delete m.extensions.KHR_materials_pbrSpecularGlossiness;}}
  for(const key of ['extensionsUsed','extensionsRequired'])if(json[key])json[key]=json[key].filter(x=>x!=='KHR_materials_pbrSpecularGlossiness');
  const text=Buffer.from(JSON.stringify(json)),length=(text.length+3)&~3,tail=bytes.subarray(20+size),copy=Buffer.alloc(20+length+tail.length,32);bytes.copy(copy,0,0,20);copy.writeUInt32LE(copy.length,8);copy.writeUInt32LE(length,12);text.copy(copy,20);tail.copy(copy,20+length);bytes=copy;
 }
 return loader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
}
const femaleReference=await glb(read('assets/membres/marianne-reference.glb'));
globalThis.fetch=async url=>{if(String(url)==='/membres/v27/poses.json')return new Response(read('membres/v27/poses.json'));throw Error('Unexpected fetch '+url);};
const wardrobe=new Function('T','loadStudio','referenceStudio','SalonMotion','attachFemaleHead','loadFemaleReference',moduleBody('membres/intro-wardrobe.js')+';return {createMarianne,dressAhmed,prepareIntroAppearance,captureIntroAppearance};')(T,loadStudio,referenceStudio,SalonMotion,attachFemaleHead,async()=>femaleReference);
const scene=new T.Scene();
const originalPath=path.resolve(option('--ahmed')),original=fs.readFileSync(originalPath);
if(hash(original)!=='66040c78a23c862dd39090802129eabab252638f1d1e863836a1e71f37f53192')throw Error('The private Ahmed source identity hash changed.');
const imported=await glb(original),rootM=new T.Group();rootM.name='Ahmed';rootM.add(imported.scene);scene.add(rootM);
let rig;const old=[];imported.scene.traverse(o=>{if(o.isSkinnedMesh&&o.skeleton.bones.length===15&&!rig)rig=o.skeleton;if(o.isSkinnedMesh&&/^(Haut|Pantalon|Chaussures)[\s_]*blanc/i.test(o.name))old.push(o);});
const m={id:'m',root:rootM,body:imported.scene,parts:[],sit:0,headBone:rig.bones[1]};
const mouths=[];imported.scene.traverse(o=>{if(o.morphTargetDictionary?.Ouvrir!==undefined)mouths.push(o);});
m.speak=(jaw=0)=>{for(const o of mouths){o.morphTargetInfluences[o.morphTargetDictionary.Ouvrir]=jaw;const i=o.morphTargetDictionary.Decouvrir;if(i!==undefined)o.morphTargetInfluences[i]=jaw*.18;}};
await wardrobe.dressAhmed(m,rig.bones,old[0].parent,old);
const rootF=new T.Group(),bodyF=new T.Group();rootF.scale.setScalar(1.04);rootF.name='Marianne';rootF.add(bodyF);scene.add(rootF);
const f=await wardrobe.createMarianne(rootF,bodyF),actors=[m,f];
const looks=new Map(actors.map(a=>[a.id+':0',wardrobe.captureIntroAppearance(a)]));
const active=new Map(actors.map(a=>[a.id,0]));
for(let i=1;i<DOJO_LOOKS.length;i++)for(const actor of actors){
 const look=dojoLook(actor.id,i),figure=await loadStudio(look,actor.id==='m'?'homme':'femme');
 styleDojoFigure(figure,i,actor.id);
 looks.set(actor.id+':'+i,await wardrobe.prepareIntroAppearance(actor,figure,{look,white:false}));
}
function setLook(index){for(const a of actors)if(active.get(a.id)!==index){looks.get(a.id+':'+index).activate();active.set(a.id,index);}}

const dojoBytes=Buffer.concat(Array.from({length:17},(_,i)=>read('assets-source/intro-original/dojo/'+String(i).padStart(3,'0')+'.bin')));
const dojo=(await glb(dojoBytes)).scene;let tatami;dojo.traverse(o=>{if(!tatami&&/tatami/i.test(o.name))tatami=o;});dojo.updateMatrixWorld(true);
dojo.position.y+=-.003-new T.Box3().setFromObject(tatami).max.y;dojo.updateMatrixWorld(true);scene.add(dojo);
const floor=new T.Box3().setFromObject(tatami),center=floor.getCenter(new T.Vector3());
const bounds=new T.Box3(new T.Vector3(floor.min.x+.8,.347,floor.min.z+.45),new T.Vector3(floor.max.x-.8,2.447,floor.max.z-.45));
const white=new T.Mesh(new T.PlaneGeometry(180,180),new T.MeshStandardMaterial({color:0xffffff,roughness:1}));white.rotation.x=-Math.PI/2;white.position.y=-.003;scene.add(white);

// Reuse the exact articulated feather construction and wing tracks in scene.js.
const salonSource=read('membres/v27/scene.js').toString(),files=unzipSync(read('assets/depart-duo/scene.bin'));
const wingStart=salonSource.indexOf('function angelGeometry('),wingEnd=salonSource.indexOf('function wingThrust(',wingStart);
const arr=(k,type)=>{const b=files[k];return new type(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));};
const wingAPI=new Function('T','arr','attr','clamp','mix','tau',salonSource.slice(wingStart,wingEnd)+';return {flightRig,poseWings};')(T,arr,(a,n)=>new T.BufferAttribute(a,n),T.MathUtils.clamp,T.MathUtils.lerp,Math.PI*2);
function wingsOn(){for(const a of actors){a.harness={h:new T.Group()};wingAPI.flightRig(a);}}

const meshes=[],registry=new Map(),point=new T.Vector3();
function matInfo(mat){return {name:mat.name,color:mat.color?.toArray()||[1,1,1],map:texturePath(mat.map),flipY:mat.map?.flipY??true,roughness:mat.roughness??.85,metalness:mat.metalness??0,opacity:mat.opacity??1,alphaTest:mat.alphaTest||0,transparent:!!mat.transparent,vertexColors:!!mat.vertexColors,basic:!!mat.isMeshBasicMaterial,emissive:mat.emissive?.toArray()||[0,0,0],emissiveIntensity:mat.emissiveIntensity||0};}
function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
function register(o){
 const g=o.geometry,key=o.uuid+':'+hash(Buffer.from((g.index?.array||new Uint32Array(0)).buffer)).slice(0,12);
 if(registry.has(key))return registry.get(key);
 const attrs=g.attributes,raw=n=>attrs[n]?Array.from({length:attrs[n].count*attrs[n].itemSize},(_,i)=>attrs[n][['getX','getY','getZ','getW'][i%attrs[n].itemSize]](Math.floor(i/attrs[n].itemSize))):null;
 const id=meshes.length,clip=attrs.neckRestY?{values:raw('neckRestY'),cut:g.userData.neckCut,keep:'below'}:attrs.featureRest&&o.material.name==='peau'?{values:Array.from({length:attrs.featureRest.count},(_,i)=>attrs.featureRest.getY(i)),cut:.03,keep:'above'}:null;
 meshes.push({id,name:o.name||'Source mesh '+id,count:attrs.position.count,faces:g.index?Array.from(g.index.array):Array.from({length:attrs.position.count},(_,i)=>i),uv:raw('uv'),color:raw('color'),clip,groups:g.groups,mats:(Array.isArray(o.material)?o.material:[o.material]).map(matInfo)});registry.set(key,id);return id;
}
function collect(root,stream,entries){
 root.updateMatrixWorld(true);const skeletons=new Set();root.traverse(o=>{if(o.isSkinnedMesh)skeletons.add(o.skeleton);});for(const s of skeletons)s.update();
 root.traverse(o=>{if(!o.isMesh||!visible(o))return;const id=register(o),p=o.geometry.attributes.position,values=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){o.getVertexPosition(i,point).applyMatrix4(o.matrixWorld).toArray(values,i*3);}
  const buffer=Buffer.from(values.buffer);entries.push({id,offset:stream.bytes,count:p.count});fs.writeSync(stream.fd,buffer);stream.bytes+=buffer.length;
 });
}
function head(a){if(a.headBone){const p=a.headBone.getWorldPosition(new T.Vector3());p.y+=.135;return p;}return a.head.group.localToWorld(new T.Vector3(0,.145,.035));}
function applyPose(line,elapsed){
 const blocking=dojoBlocking(line,elapsed,{center,floorY:floor.max.y});
 for(const a of actors){const p=blocking[a.id];a.root.position.copy(p.position);a.root.rotation.y=p.yaw;a.pose(0,{time:elapsed/1000+(a.id==='f'?2.6:0),energy:1,emphasis:.3,headYaw:p.headYaw,poseGesture:p.poseGesture,gait:p.gait});}
 scene.updateMatrixWorld(true);return blocking;
}
const shots=[{id:'duo',seconds:4},{id:'walk',seconds:5},{id:'turn',seconds:4},{id:'wardrobe',seconds:8},{id:'finale',seconds:12}];
const manifest={width,height,fps,source:'Current production wardrobe, private original Ahmed, reference Marianne, dojo and original garden/wings',shots:[],meshes};
for(const shot of shots){
 console.log('BAKE',shot.id);setLook(0);if(shot.id==='finale')wingsOn();
 const frames=shot.seconds*fps,chosen=preview?[shot.id==='wardrobe'?Math.floor(frames*.62):shot.id==='finale'?frames-1:Math.floor(frames*.35)]:Array.from({length:frames},(_,i)=>i);
 const exported={...shot,frames:[],environment:shot.id==='duo'?'white':shot.id==='finale'?'garden':'dojo'};
 for(const frame of chosen){
  const t=frame/fps;let camera,line={id:'dojo-arrivee',ms:7000,speaker:'m'},elapsed=800+t*1000;
  if(shot.id==='walk'){line={id:'dojo-deplacement',ms:11000};elapsed=1900+t*1000;}
  if(shot.id==='turn'){line={id:'dojo-demi-tour',ms:9000};elapsed=100+t*1000;}
  if(shot.id==='wardrobe'){
   line={id:'dojo-vetements',ms:12000};elapsed=t*1500;
   const order=[0,1,2,Math.min(3,DOJO_LOOKS.length-1),1,0],cuts=[1,2.5,4,5.5,7,8];setLook(order[cuts.findIndex(end=>t<end)]??0);
  }
  applyPose(line,elapsed);
  m.speak((shot.id==='duo'&&t<3||shot.id==='finale'&&t>=1.8&&t<8.1)?(.04+.10*(Math.sin(t*24)+1)*.5):0);
  if(shot.id==='duo'){
   const s=t/shot.seconds,aim=new T.Vector3(center.x,1.04,center.z+.35),angle=Math.PI-.26+.20*s;
   camera={eye:aim.clone().add(new T.Vector3(Math.sin(angle)*3.55,.50,Math.cos(angle)*3.55)),aim,fov:39};
  }else if(shot.id==='finale'){
   const state=introFinaleFrame(t*1000,{width,height}),offset=.4+.60*Math.sin((3.62+7.6)*.45);
   for(const a of actors){const p=state.actors[a.id];a.root.position.set(p.x+offset,a.id==='m'?.0206:0,p.z);a.root.rotation.y=p.yaw;wingAPI.poseWings(a,state.wings,state.wingPhase+(a.id==='f'?-.24:0),state.wingPower);}
   camera={eye:new T.Vector3(...state.camera.position).add(new T.Vector3(offset,0,0)),aim:new T.Vector3(...state.camera.target).add(new T.Vector3(offset,0,0)),fov:state.camera.fov};
  }else camera=dojoDirectedCamera({line,elapsed,aspect:width/height,actors,bounds,floor,headPosition:head});
  white.visible=shot.id==='duo';dojo.visible=!['duo','finale'].includes(shot.id);scene.updateMatrixWorld(true);
  const name=shot.id+'-'+String(frame).padStart(4,'0'),stream={fd:fs.openSync(path.join(out,'poses',name+'.bin'),'w'),bytes:0},entries=[];
  for(const a of actors)collect(a.root,stream,entries);
  fs.closeSync(stream.fd);exported.frames.push({frame,time:t,file:'poses/'+name+'.bin',meshes:entries,camera:{eye:camera.eye.toArray(),aim:camera.aim.toArray(),fov:camera.fov}});
 }
 manifest.shots.push(exported);
}
// Static dojo uses its exact original triangles and embedded textures.
dojo.visible=true;const stream={fd:fs.openSync(path.join(out,'dojo.bin'),'w'),bytes:0},entries=[];collect(dojo,stream,entries);fs.closeSync(stream.fd);manifest.dojo={file:'dojo.bin',meshes:entries};
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest));
exportButterflies(out,{seconds:13,fps});
fs.writeFileSync(path.join(out,'provenance.json'),JSON.stringify({privateAhmed:{path:originalPath,sha256:hash(original)},referenceMarianne:{path:'assets/membres/marianne-reference.glb',sha256:hash(read('assets/membres/marianne-reference.glb'))},productionSources:['membres/intro-wardrobe.js','membres/intro-dojo-director.js','membres/salon-v27-motion.js','membres/v27/female-reference.js','membres/v27/scene.js','membres/v27/intro-finale.js'].map(file=>({file,sha256:hash(read(file))})),method:'Execute production mesh fitting, face fitting, pose controllers, skinning, morphology and wing construction in Node. Bake their actual visible vertex positions and original textures for offline Blender rendering. No generated imagery or replacement character.'},null,2));
console.log('BAKE_COMPLETE',manifest.shots.map(s=>[s.id,s.frames.length]),'meshes',meshes.length);
