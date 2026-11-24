/** Export the current V27 garden by executing its original construction code. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {deflateSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import * as T from 'three';
import {unzipSync,strFromU8} from 'three/examples/jsm/libs/fflate.module.js';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
if(!process.argv[2])throw Error('Usage: node cinematics/intro/prepare-garden.mjs OUTPUT_DIRECTORY');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out+'/textures',{recursive:true});
const source=fs.readFileSync(repo+'/membres/v27/scene.js','utf8');
const files=unzipSync(new Uint8Array(fs.readFileSync(repo+'/assets/depart-duo/scene.bin'))),info=JSON.parse(strFromU8(files['index.json']));
for(const [name,data]of Object.entries(files))if(/\.webp$/.test(name)){fs.mkdirSync(path.dirname(out+'/textures/'+name),{recursive:true});fs.writeFileSync(out+'/textures/'+name,data);}
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1;}return (c^0xffffffff)>>>0;}
function png(w,h,rgba){
 const chunk=(name,bytes)=>{const tag=Buffer.from(name),head=Buffer.alloc(4),crc=Buffer.alloc(4);head.writeUInt32BE(bytes.length);crc.writeUInt32BE(crc32(Buffer.concat([tag,bytes])));return Buffer.concat([head,tag,bytes,crc]);};
 const header=Buffer.alloc(13);header.writeUInt32BE(w);header.writeUInt32BE(h,4);header[8]=8;header[9]=6;
 const rows=Buffer.alloc(h*(1+4*w));for(let y=0;y<h;y++)Buffer.from(rgba.buffer,rgba.byteOffset+4*w*y,4*w).copy(rows,y*(1+4*w)+1);
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}
const canvases=[];
function canvas(){
 const c={width:300,height:150,id:canvases.length,parts:[],gradients:[]};canvases.push(c);
 const ctx={fillStyle:'#000',current:[],createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),putImageData(im,x,y){c.parts.push(`<image x="${x}" y="${y}" width="${im.width}" height="${im.height}" href="data:image/png;base64,${png(im.width,im.height,im.data).toString('base64')}"/>`);},beginPath(){this.current=[];},moveTo(x,y){this.current.push(['M',x,y]);},lineTo(x,y){this.current.push(['L',x,y]);},ellipse(x,y,rx,ry,rot){this.current.push(['ellipse',x,y,rx,ry,rot]);},fillRect(x,y,w,h){c.parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${paint(this.fillStyle)}"/>`);},fill(){const fill=paint(this.fillStyle);if(this.current[0]?.[0]==='ellipse'){const [,x,y,rx,ry,rot]=this.current[0];c.parts.push(`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot*180/Math.PI} ${x} ${y})" fill="${fill}"/>`);}else c.parts.push(`<path d="${this.current.map(p=>p.join(' ')).join(' ')} Z" fill="${fill}"/>`);}};
 function paint(p){return typeof p==='string'?p:`url(#${p.id})`;}
 function gradient(type,args){const g={type,args,id:`g${c.id}_${c.gradients.length}`,stops:[],addColorStop(n,color){this.stops.push([n,color]);}};c.gradients.push(g);return g;}
 ctx.createLinearGradient=(...a)=>gradient('linear',a);ctx.createRadialGradient=(...a)=>gradient('radial',a);c.getContext=()=>ctx;return c;
}
const document={createElement:canvas},indoor=new T.Group(),outdoor=new T.Group(),renderer={capabilities:{getMaxAnisotropy:()=>4}},tau=Math.PI*2,clamp=T.MathUtils.clamp,mix=T.MathUtils.lerp;
const baySlope=.087173,bayCenter=new T.Vector3(0,0,2.48944),gardenThreshold=new T.Vector3(-.65,.047,10.72);
const roomToGarden=new T.Matrix4().makeRotationY(Math.PI+Math.atan(baySlope));roomToGarden.setPosition(gardenThreshold.clone().sub(bayCenter.clone().applyMatrix4(roomToGarden)));
const a=source.indexOf('const textures='),b=source.indexOf('const seats=roomSeats'),c=source.indexOf("const groundTex=noiseTexture('land')"),d=source.indexOf('const keys=new Set()');
if(a<0||b<a||c<b||d<c)throw Error('Original garden source boundaries changed; inspect before capturing.');
let code=source.slice(a,b)+'\n'+source.slice(c,d);
code=code.replace(/function tex\(k,srgb=true\)\{[\s\S]*?\n\}/,`function tex(k,srgb=true){if(textures.has(k))return textures.get(k);const t=new T.Texture();t.userData.path=k;if(srgb)t.colorSpace=T.SRGBColorSpace;textures.set(k,t);return t;}`);
const run=new Function('T','files','info','indoor','outdoor','renderer','document','tau','clamp','mix','baySlope','gardenThreshold',code+';return {flight,sprites};');
const built=run(T,files,info,indoor,outdoor,renderer,document,tau,clamp,mix,baySlope,gardenThreshold);
indoor.matrixAutoUpdate=false;indoor.matrix.copy(roomToGarden);indoor.updateMatrixWorld(true);outdoor.updateMatrixWorld(true);
const canvasPaths=new Map();
function canvasFile(c){
 if(canvasPaths.has(c))return canvasPaths.get(c);const name=`source-canvas-${c.id}`,svg=out+'/textures/'+name+'.svg',file=out+'/textures/'+name+'.png';
 const defs=c.gradients.map(g=>{const [x1,y1,r1,x2,y2,r2]=g.args,attrs=g.type==='linear'?`x1="${g.args[0]}" y1="${g.args[1]}" x2="${g.args[2]}" y2="${g.args[3]}"`:`cx="${x2}" cy="${y2}" r="${r2}" fx="${x1}" fy="${y1}" fr="${r1}"`;return `<${g.type}Gradient id="${g.id}" gradientUnits="userSpaceOnUse" ${attrs}>${g.stops.map(([offset,color])=>`<stop offset="${offset}" stop-color="${color}"/>`).join('')}</${g.type}Gradient>`;}).join('');
 fs.writeFileSync(svg,`<svg xmlns="http://www.w3.org/2000/svg" width="${c.width}" height="${c.height}" viewBox="0 0 ${c.width} ${c.height}"><defs>${defs}</defs>${c.parts.join('')}</svg>`);
 const result=spawnSync('inkscape',[svg,'--export-type=png','--export-filename='+file],{encoding:'utf8'});if(result.status!==0)throw Error('Source Canvas rasterization failed: '+result.stderr);
 canvasPaths.set(c,name+'.png');return name+'.png';
}
function texture(t){return t?.userData.path||(canvases.includes(t?.image)?canvasFile(t.image):null);}
function material(m,instanceColor=false){return {color:m.color.toArray(),map:texture(m.map),ao:texture(m.aoMap),opacity:m.opacity,transparent:m.transparent,alphaTest:m.alphaTest,roughness:m.roughness??1,metalness:m.metalness??0,vertexColors:m.vertexColors||instanceColor,basic:!!m.isMeshBasicMaterial,side:m.side};}
const objects=[],spriteSet=new Set(built.sprites),matrix=new T.Matrix4(),normalMatrix=new T.Matrix3(),point=new T.Vector3(),normal=new T.Vector3(),tint=new T.Color();
function exportMesh(o){
 if(!o.isMesh||o.parent===built.flight)return;
 const g=o.geometry,p=g.getAttribute('position'),n=g.getAttribute('normal'),uv=g.getAttribute('uv'),uv1=g.getAttribute('uv1'),color=g.getAttribute('color'),instanced=!!o.isInstancedMesh,count=instanced?o.count:1,billboard=spriteSet.has(o),v=[],nv=[],u=[],u1=[],colors=[],faces=[],groups=[];
 const hasTint=instanced&&!!o.instanceColor,indices=g.index?Array.from(g.index.array):Array.from({length:p.count},(_,i)=>i);
 for(let k=0;k<count;k++){
  if(instanced){o.getMatrixAt(k,matrix);matrix.premultiply(o.matrixWorld);if(hasTint)o.getColorAt(k,tint);}else matrix.copy(billboard?new T.Matrix4():o.matrixWorld);
  normalMatrix.getNormalMatrix(matrix);
  for(let i=0;i<p.count;i++){
   point.fromBufferAttribute(p,i).applyMatrix4(matrix);v.push(point.x,point.y,point.z);
   if(n){normal.fromBufferAttribute(n,i).applyMatrix3(normalMatrix).normalize();nv.push(normal.x,normal.y,normal.z);}
   if(uv)u.push(uv.getX(i),uv.getY(i));if(uv1)u1.push(uv1.getX(i),uv1.getY(i));
   if(color||hasTint){const r=color?color.getX(i):1,gg=color?color.getY(i):1,bb=color?color.getZ(i):1;colors.push(r*(hasTint?tint.r:1),gg*(hasTint?tint.g:1),bb*(hasTint?tint.b:1));}
  }
  for(const ix of indices)faces.push(ix+k*p.count);for(const gr of g.groups)groups.push({...gr,start:gr.start+k*indices.length});
 }
 const mats=(Array.isArray(o.material)?o.material:[o.material]).map(m=>material(m,hasTint));
 objects.push({name:o.userData.kind||o.userData.bag||`source-${objects.length}`,v,n:nv,faces,color:colors.length?colors:null,uv:u.length?u:null,uv1:u1.length?u1:null,groups,mats,shadow:o.castShadow,billboard:billboard?{position:o.position.toArray(),scale:o.scale.toArray()}:null});
}
indoor.traverse(exportMesh);outdoor.traverse(exportMesh);
fs.writeFileSync(out+'/scene.json',JSON.stringify({source:'Original members V27 garden source executed without geometry substitution',objects}));
const hash=file=>createHash('sha256').update(fs.readFileSync(repo+'/'+file)).digest('hex');
fs.writeFileSync(out+'/provenance.json',JSON.stringify({sourceScene:'membres/v27/scene.js',sourceArchive:'assets/depart-duo/scene.bin',sourceSceneSha256:hash('membres/v27/scene.js'),sourceArchiveSha256:hash('assets/depart-duo/scene.bin'),method:'Execute original static room and garden source, retain original instance placement and colors, rasterize original Canvas commands through SVG, export authored geometry and texture maps; butterflies exported separately from original flutter.'},null,2)+'\n');
console.log({objects:objects.length,vertices:objects.reduce((a,o)=>a+o.v.length/3,0),triangles:objects.reduce((a,o)=>a+o.faces.length/3,0),billboards:objects.filter(o=>o.billboard).length,proceduralTextures:canvasPaths.size});
