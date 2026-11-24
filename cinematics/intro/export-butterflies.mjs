// Execute the real garden's butterfly construction and flutter(dt), without a browser.
// node cinematics/intro/export-butterflies.mjs OUTPUT_DIRECTORY [SECONDS=6] [FPS=20]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {unzipSync,strFromU8} from 'three/examples/jsm/libs/fflate.module.js';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const sourceFile='membres/v27/scene.js',archiveFile='assets/depart-duo/scene.bin';
const source=fs.readFileSync(path.join(repo,sourceFile),'utf8');
function fragment(from,to){
 const begin=source.indexOf(from),end=source.indexOf(to,begin+from.length);
 if(begin<0||end<=begin)throw Error(`Garden source boundary changed: ${from}`);
 return source.slice(begin,end);
}

/** Return the original local Three.js meshes and mutable source animation. */
export function createButterflyAnimation(){
 const archive=fs.readFileSync(path.join(repo,archiveFile));
 const files=unzipSync(new Uint8Array(archive)),info=JSON.parse(strFromU8(files['index.json']));
 const code=[
  fragment('function arr(k,type)','function material(c)'),
  fragment('function seeded(seed)','function noiseTexture(kind)'),
  fragment('const pathX=z=>','const trailWidth=z=>'),
  fragment('const flight=new T.Group();','// Muted hill profiles'),
 ].join('\n');
 const textures=new Map();
 const tex=name=>{if(!textures.has(name)){const texture=new T.Texture();texture.userData.path=name;texture.colorSpace=T.SRGBColorSpace;textures.set(name,texture)}return textures.get(name)};
 const build=new Function('T','files','info','outdoor','tex','mix','tau','where',code+'\nreturn {flight,insectParts,moths,flutter,watchLead,watchFriend};');
 // The authored watcher positions are also used by the live room's view of
 // the garden. No actor substitute, altered scale or new flight path is added.
 const animation=build(T,files,info,new T.Group(),tex,T.MathUtils.lerp,Math.PI*2,'salon');
 return {...animation,texture:files['papillon-blanc.webp'],sourceCode:code};
}

export function exportButterflies(output,{seconds=6,fps=20}={}){
 if(!(seconds>0&&Number.isInteger(seconds*fps)&&Number.isInteger(60/fps)))throw Error('Use a positive duration and a frame rate dividing the original 60 Hz simulation.');
 const out=path.resolve(output);fs.mkdirSync(path.join(out,'textures'),{recursive:true});
 const animation=createButterflyAnimation();
 fs.writeFileSync(path.join(out,'textures/papillon-blanc.webp'),animation.texture);
 const parts={};
 for(const [name,mesh]of Object.entries(animation.insectParts)){
  const g=mesh.geometry;g.computeBoundingBox();
  parts[name]={v:Array.from(g.getAttribute('position').array),n:Array.from(g.getAttribute('normal').array),uv:Array.from(g.getAttribute('uv').array),faces:Array.from(g.index.array),bounds:{min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()}};
 }
 const frames=[],steps=60/fps,count=animation.moths.length;
 animation.flutter(0);
 for(let frame=0;frame<seconds*fps;frame++){
  if(frame)for(let sub=0;sub<steps;sub++)animation.flutter(1/60);
  const posed={};
  for(const [name,mesh]of Object.entries(animation.insectParts)){
   const values=Array.from(mesh.instanceMatrix.array);
   if(values.length!==count*16||values.some(n=>!Number.isFinite(n)))throw Error(`Invalid ${name} matrices at frame ${frame}`);
   posed[name]=values;
  }
  frames.push({time:frame/fps,parts:posed});
 }
 const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
 const data={
  source:sourceFile,archive:archiveFile,sourceSha256:sha256(fs.readFileSync(path.join(repo,sourceFile))),archiveSha256:sha256(fs.readFileSync(path.join(repo,archiveFile))),
  method:'Original butterfly constructor and flutter(dt) executed unchanged at 60 Hz using the authored watcher anchors.',
  coordinates:'Three.js x/y/z. Matrices are column-major Float32, 16 elements per instance, in source instance order.',
  transform:'Garden outdoor/flight parent is identity. For Blender vertices (x,-z,y), apply B * matrix * inverse(B).',
  material:{type:'MeshBasicMaterial',map:'papillon-blanc.webp',color:[1,1,1],side:'DoubleSide',alphaTest:.22,castShadow:false,textureSha256:sha256(animation.texture)},
  count,seconds,fps,simulationHz:60,seed:71523,
  anchors:{lead:animation.watchLead.toArray(),friend:animation.watchFriend.toArray()},
  sizeRange:[Math.min(...animation.moths.map(m=>m.size)),Math.max(...animation.moths.map(m=>m.size))],
  beatRange:[Math.min(...animation.moths.map(m=>m.beat)),Math.max(...animation.moths.map(m=>m.beat))],
  parts,frames,
 };
 const file=path.join(out,'butterflies.json');fs.writeFileSync(file,JSON.stringify(data));
 console.log(JSON.stringify({file,bytes:fs.statSync(file).size,count,frames:frames.length,parts:Object.fromEntries(Object.entries(parts).map(([name,g])=>[name,{vertices:g.v.length/3,triangles:g.faces.length/3,bounds:g.bounds}])),sizeRange:data.sizeRange,beatRange:data.beatRange,anchors:data.anchors},null,2));
 return data;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(!process.argv[2])throw Error('Usage: node cinematics/intro/export-butterflies.mjs OUTPUT_DIRECTORY [SECONDS=6] [FPS=20]');
 exportButterflies(process.argv[2],{seconds:Number(process.argv[3]||6),fps:Number(process.argv[4]||20)});
}
