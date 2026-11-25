// Targeted wardrobe and inclusive-cast witnesses from the actual production meshes.
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
import {DOJO_CAST,dojoCastLook,dojoCastPose,styleDojoCastFigure} from '../../membres/intro-dojo-cast.js';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const option=name=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null;};
if(!process.argv[2])throw Error('Usage: node cinematics/promotion/prepare-refresh.mjs OUTPUT_DIRECTORY');
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

const wardrobe=new Function('T','loadStudio','referenceStudio','SalonMotion','attachFemaleHead','loadFemaleReference',moduleBody('membres/intro-wardrobe.js')+';return {createMarianne,createIntroCastActor};')(T,loadStudio,referenceStudio,SalonMotion,attachFemaleHead,async()=>femaleReference);
const scene=new T.Scene();
const dojoBytes=Buffer.concat(Array.from({length:17},(_,i)=>read('assets-source/intro-original/dojo/'+String(i).padStart(3,'0')+'.bin')));
const dojo=(await glb(dojoBytes)).scene;let tatami;dojo.traverse(o=>{if(!tatami&&/tatami/i.test(o.name))tatami=o;});
if(!tatami)throw Error('The original dojo tatami is missing.');
dojo.updateMatrixWorld(true);dojo.position.y+=-.003-new T.Box3().setFromObject(tatami).max.y;dojo.updateMatrixWorld(true);scene.add(dojo);
const floor=new T.Box3().setFromObject(tatami),center=floor.getCenter(new T.Vector3());
const actors=[];
const rootF=new T.Group(),bodyF=new T.Group();rootF.scale.setScalar(1.04);rootF.add(bodyF);scene.add(rootF);
const look=dojoLook('f',2),figure=await loadStudio(look,'femme');styleDojoFigure(figure,2,'f');
const marianne=await wardrobe.createMarianne(rootF,bodyF,{look,figure,white:false});
actors.push({id:'marianne-replacement',actor:marianne,label:'Marianne · tenue jardin',look,gender:'femme'});
for(let i=0;i<DOJO_CAST.length;i++){
 const item=DOJO_CAST[i],look=dojoCastLook(i),figure=await loadStudio(look,item.gender);styleDojoCastFigure(figure,i);
 const root=new T.Group();root.scale.setScalar(item.gender==='femme'?1.04:1.075);scene.add(root);
 const actor=await wardrobe.createIntroCastActor(root,figure,{look,gender:item.gender});
 actors.push({id:'cast-'+i,actor,label:item.label,look,gender:item.gender,index:i});
}
for(const {actor}of actors)actor.root.visible=false;
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

const manifest={width,height,fps,source:'Actual production Marianne, native character examples, wardrobe and original dojo',shots:[],meshes};
const evidence=[];
for(const item of actors){
 const {actor}=item;actor.root.visible=true;
 if(item.index===undefined){
  actor.root.position.set(center.x,floor.max.y+.003,center.z+.35);actor.root.rotation.y=Math.PI-.18;
  actor.pose(0,{time:2.3,energy:1,emphasis:0,headYaw:0,poseGesture:{left:.03,right:.03,reach:24,height:-20,forward:20,palm:.18,pitch:0,yaw:0,nod:0,tilt:0}});
 }else{
  const pose=dojoCastPose(item.index,1500);item.productionPose=pose;
  actor.root.position.set(center.x,floor.max.y,center.z+.35);actor.root.rotation.y=Math.PI;
  actor.pose(0,pose);
 }
 scene.updateMatrixWorld(true);
 const box=new T.Box3().setFromObject(actor.root),aim=new T.Vector3(center.x,(box.max.y+floor.max.y)*.5,center.z+.35);
 const eye=new T.Vector3(center.x+.24,floor.max.y+1.30,center.z-3.15),camera={eye:eye.toArray(),aim:aim.toArray(),fov:item.index===undefined?36:40};
 const name=item.id+'-0000',stream={fd:fs.openSync(path.join(out,'poses',name+'.bin'),'w'),bytes:0},entries=[];collect(actor.root,stream,entries);fs.closeSync(stream.fd);
 manifest.shots.push({id:item.id,seconds:1,environment:'dojo',frames:[{frame:0,time:1.5,file:'poses/'+name+'.bin',meshes:entries,camera}]});
 evidence.push({id:item.id,label:item.label,gender:item.gender,look:item.look,pose:item.productionPose||null,bounds:{min:box.min.toArray(),max:box.max.toArray()},soleClearance:box.min.y-floor.max.y});
 actor.root.visible=false;
}
const stream={fd:fs.openSync(path.join(out,'dojo.bin'),'w'),bytes:0},entries=[];collect(dojo,stream,entries);fs.closeSync(stream.fd);manifest.dojo={file:'dojo.bin',meshes:entries};
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest));
fs.writeFileSync(path.join(out,'targeted-evidence.json'),JSON.stringify(evidence,null,2));
fs.writeFileSync(path.join(out,'provenance.json'),JSON.stringify({referenceMarianne:{path:'assets/membres/marianne-reference.glb',sha256:hash(read('assets/membres/marianne-reference.glb'))},productionSources:['membres/intro-wardrobe.js','membres/intro-dojo-wardrobe.js','membres/intro-dojo-cast.js','membres/studio-model.js','membres/salon-v27-motion.js'].map(file=>({file,sha256:hash(read(file))})),method:'Execute current production body morphs, wardrobe fitting, masks and pose functions. Render five static staged witnesses; retain the unchanged original film and private Ahmed portrait in all existing shots.'},null,2));
console.log('TARGETED_BAKE_COMPLETE',manifest.shots.map(s=>s.id),'meshes',meshes.length);
