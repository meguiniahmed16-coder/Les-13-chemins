import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {unzipSync,strFromU8} from 'three/examples/jsm/libs/fflate.module.js';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
if(!process.argv[2])throw new Error('Usage: node cinematics/intro/prepare-salon.mjs OUTPUT_DIRECTORY');
const out=path.resolve(process.argv[2]);fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(repo+'/membres/v27/scene.js','utf8');
const files=unzipSync(new Uint8Array(fs.readFileSync(repo+'/assets/depart-duo/scene.bin'))),info=JSON.parse(strFromU8(files['index.json']));
for(const [name,data]of Object.entries(files))if(/\.webp$/.test(name)){fs.mkdirSync(out+'/textures/'+name.split('/').slice(0,-1).join('/'),{recursive:true});fs.writeFileSync(out+'/textures/'+name,data);}
const indoor=new T.Group(),renderer={capabilities:{getMaxAnisotropy:()=>4}},tau=Math.PI*2;
const document={createElement:()=>{const c={};c.getContext=()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:im=>{c.rgba=im.data;},createRadialGradient:()=>({addColorStop(){}}),fillRect(){},beginPath(){},ellipse(){},fill(){}});return c;}};
const start=source.indexOf('const textures='),end=source.indexOf('const seats=roomSeats');
if(start<0||end<=start)throw new Error('Salon static scene boundaries changed; inspect the source before capturing.');
let body=source.slice(start,end);
body=body.replace(/function tex\(k,srgb=true\)\{[\s\S]*?\n\}/,`function tex(k,srgb=true){if(textures.has(k))return textures.get(k);const t=new T.Texture();t.userData.path=k;if(srgb)t.colorSpace=T.SRGBColorSpace;textures.set(k,t);return t;}`);
const compile=new Function('T','files','info','indoor','renderer','document','tau',body+';return {wood,indoor};');
const built=compile(T,files,info,indoor,renderer,document,tau);
const rgba=built.wood.image.rgba,rgb=Buffer.alloc(256*256*3);
for(let i=0;i<256*256;i++)for(let c=0;c<3;c++)rgb[3*i+c]=rgba[4*i+c];
fs.writeFileSync(out+'/textures/wood.ppm',Buffer.concat([Buffer.from('P6\n256 256\n255\n'),rgb]));
indoor.updateMatrixWorld(true);
const objects=[];
function mat(m){return {color:m.color.toArray(),map:m.map?.userData.path||((m.map===built.wood)?'wood.ppm':null),ao:m.aoMap?.userData.path,opacity:m.opacity,transparent:m.transparent,roughness:m.roughness,metalness:m.metalness,vertexColors:m.vertexColors};}
indoor.traverse(o=>{if(!o.isMesh||o.userData.ignorePick)return;const g=o.geometry,p=g.getAttribute('position'),n=g.getAttribute('normal'),norm=new T.Matrix3().getNormalMatrix(o.matrixWorld),v=[],nv=[];for(let i=0;i<p.count;i++){v.push(...new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).toArray());if(n)nv.push(...new T.Vector3().fromBufferAttribute(n,i).applyMatrix3(norm).normalize().toArray());}objects.push({name:o.userData.kind||o.userData.bag||'source-fitted-wall',v,n:nv,faces:g.index?Array.from(g.index.array):Array.from({length:p.count},(_,i)=>i),color:g.getAttribute('color')?Array.from(g.getAttribute('color').array):null,uv:g.getAttribute('uv')?Array.from(g.getAttribute('uv').array):null,uv1:g.getAttribute('uv1')?Array.from(g.getAttribute('uv1').array):null,groups:g.groups,mats:(Array.isArray(o.material)?o.material:[o.material]).map(mat),shadow:o.castShadow});});
fs.writeFileSync(out+'/scene.json',JSON.stringify({source:'membres/v27/scene.js static indoor code executed directly against assets/depart-duo/scene.bin',objects}));
console.log({objects:objects.length,vertices:objects.reduce((n,o)=>n+o.v.length/3,0),triangles:objects.reduce((n,o)=>n+o.faces.length/3,0)});

const hash=file=>createHash('sha256').update(fs.readFileSync(repo+'/'+file)).digest('hex');
fs.writeFileSync(out+'/provenance.json',JSON.stringify({sourceScene:'membres/v27/scene.js',sourceArchive:'assets/depart-duo/scene.bin',sourceSceneSha256:hash('membres/v27/scene.js'),sourceArchiveSha256:hash('assets/depart-duo/scene.bin'),method:'Execute original static interior construction code and export unchanged room vertices, normals, colors, UVs, source textures, original bag transforms, fitted wall and ceiling. Render camera movement offline; no generated or recreated furnishings.'},null,2)+'\n');
