import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {inspectionFemaleBodyFaces} from './studio-inspection-geometry.js';
import {poseVertex} from './salon-pose.js';
import {SalonMotion} from './salon-v27-motion.js';
import {dojoBlocking} from './intro-dojo-director.js';
import {seats} from './salon-plan.js';

const read=name=>readFileSync(new URL('../'+name,import.meta.url));
const manifest=JSON.parse(read('assets-source/salon-v27/assets.json'));
const archive=Buffer.concat(manifest.packs.map(name=>read('assets-source/salon-v27/'+name)));
const types={Int8Array,Int16Array,Uint8Array,Uint16Array};
function resource(name){
 const [offset,length]=manifest.files[name+'.bin'],raw=gunzipSync(archive.subarray(offset,offset+length));
 const bytes=raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength),size=new DataView(bytes).getUint32(0,true),start=4+size;
 return JSON.parse(new TextDecoder().decode(new Uint8Array(bytes,4,size)),(_,v)=>v&&types[v.type]?new types[v.type](bytes,start+v.offset,v.bytes/types[v.type].BYTES_PER_ELEMENT):v);
}
const male=resource('mesh-body'),female=resource('female-base');
const body={...male,position:female.body,faces:female.faces};
const closed=inspectionFemaleBodyFaces(body),patch=closed.subarray(body.faces.length);
const poses=JSON.parse(read('membres/v27/poses.json'));
function edges(faces){
 const counts=new Map();
 for(let i=0;i<faces.length;i+=3)for(let j=0;j<3;j++){
  const a=body.weld[faces[i+j]],b=body.weld[faces[i+(j+1)%3]];
  if(a===b)continue;
  const key=[Math.min(a,b),Math.max(a,b)].join(':'),value=counts.get(key)||{count:0,direction:0};
  value.count++;value.direction+=a<b?1:-1;counts.set(key,value);
 }
 return counts;
}
const vec=(p,id)=>[p[3*id],p[3*id+1],p[3*id+2]];
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const normal=tri=>cross(sub(tri[1],tri[0]),sub(tri[2],tri[0]));
const bounds=tri=>[0,1,2].flatMap(axis=>[Math.min(...tri.map(v=>v[axis])),Math.max(...tri.map(v=>v[axis]))]);
const overlapping=(a,b)=>[0,2,4].every(axis=>a[axis]<=b[axis+1]+1e-10&&b[axis]<=a[axis+1]+1e-10);
function segmentHits(a,b,tri){
 const direction=sub(b,a),edge1=sub(tri[1],tri[0]),edge2=sub(tri[2],tri[0]);
 const h=cross(direction,edge2),det=dot(edge1,h);if(Math.abs(det)<1e-14)return false;
 const s=sub(a,tri[0]),u=dot(s,h)/det;if(u<-1e-8||u>1+1e-8)return false;
 const q=cross(s,edge1),v=dot(direction,q)/det;if(v<-1e-8||u+v>1+1e-8)return false;
 const t=dot(edge2,q)/det;return t>1e-7&&t<1-1e-7;
}
const cross2=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function strictlyInside(point,triangle){
 const signs=triangle.map((a,i)=>cross2(a,triangle[(i+1)%3],point));
 return signs.every(v=>v>1e-12)||signs.every(v=>v< -1e-12);
}
function coplanarOverlap(a,b,n){
 const axis=[0,1,2].sort((i,j)=>Math.abs(n[j])-Math.abs(n[i]))[0];
 const left=a.map(v=>v.filter((_,i)=>i!==axis)),right=b.map(v=>v.filter((_,i)=>i!==axis));
 if(left.some(p=>strictlyInside(p,right))||right.some(p=>strictlyInside(p,left)))return true;
 for(let i=0;i<3;i++)for(let j=0;j<3;j++){
  const p=left[i],q=left[(i+1)%3],r=right[j],s=right[(j+1)%3];
  if(cross2(p,q,r)*cross2(p,q,s)< -1e-22 && cross2(r,s,p)*cross2(r,s,q)< -1e-22)return true;
 }
 return false;
}
function intersect(a,b){
 const n=normal(a),m=normal(b),parallel=dot(cross(n,m),cross(n,m))<dot(n,n)*dot(m,m)*1e-14;
 if(parallel&&Math.abs(dot(n,sub(b[0],a[0])))<Math.sqrt(dot(n,n))*1e-9)return coplanarOverlap(a,b,n);
 for(let i=0;i<3;i++)if(segmentHits(a[i],a[(i+1)%3],b)||segmentHits(b[i],b[(i+1)%3],a))return true;
 return false;
}
function inspect(position,label){
 const additions=[];let minArea=Infinity;
 for(let i=0;i<patch.length;i+=3){
  const ids=Array.from(patch.subarray(i,i+3)),triangle=ids.map(id=>vec(position,id)),n=normal(triangle),area=Math.hypot(...n)/2;
  assert.ok(area>1e-11,`${label}: degenerate cap triangle ${i/3}`);minArea=Math.min(minArea,area);
  additions.push({triangle,bounds:bounds(triangle),ids});
 }
 const total=bounds(additions.flatMap(entry=>entry.triangle));
 const candidates=[];
 for(let i=0;i<body.faces.length;i+=3){
  const ids=[body.faces[i],body.faces[i+1],body.faces[i+2]];
  if([0,1,2].some(axis=>ids.every(id=>position[3*id+axis]<total[2*axis]-1e-10)||ids.every(id=>position[3*id+axis]>total[2*axis+1]+1e-10)))continue;
  const triangle=ids.map(id=>vec(position,id));candidates.push({triangle,bounds:bounds(triangle),index:i/3});
 }
 const clashes=[];
 for(let i=0;i<additions.length;i++){
  const a=additions[i];
  for(let j=i+1;j<additions.length;j++){
   const b=additions[j];if(overlapping(a.bounds,b.bounds)&&intersect(a.triangle,b.triangle))clashes.push(`patch ${i}/${j}`);
  }
  for(const b of candidates)if(overlapping(a.bounds,b.bounds)&&intersect(a.triangle,b.triangle))clashes.push(`patch ${i}/body ${b.index}`);
 }
 assert.deepEqual(clashes,[],`${label}: new surface must not cross itself or existing skin`);
 return minArea;
}
function morphed(shape=0,age=0){
 const p=body.position.slice();
 for(const [key,choice] of [['body',shape],['age',age]]){
  const delta=body.targets[key][choice];if(!delta)continue;
  for(let i=0;i<delta.length;i+=4){const id=3*(delta[i]&65535);for(let axis=0;axis<3;axis++)p[id+axis]+=delta[i+axis+1];}
 }
 return p;
}
function posed(position,bones){
 const p=new Float64Array(position.length),out=new Float32Array(6);
 for(let i=0;i<position.length;i+=3){
  poseVertex(out,bones,body.rig,i/3,position[i]/10000,position[i+1]/10000,position[i+2]/10000,0,1,0);
  for(let axis=0;axis<3;axis++)p[i+axis]=Math.round(out[axis]*10000)/10000;
 }
 return p;
}

test('the real female body closes its sole boundary with existing vertices and keeps every original surface',()=>{
 const copies={};for(const key of ['position','faces','weld','rig','uv'])copies[key]=body[key].slice();
 const result=inspectionFemaleBodyFaces(body);
 assert.ok(result instanceof Uint16Array);assert.notEqual(result,body.faces);
 assert.deepEqual(result.subarray(0,body.faces.length),body.faces,'Head, torso, limbs and all original triangles are unchanged');
 assert.equal(patch.length,56*3);
 const originalEdges=edges(body.faces),newEdges=edges(result);
 assert.equal([...originalEdges.values()].filter(value=>value.count===1).length,58);
 const rim=new Set([...originalEdges].filter(([,v])=>v.count===1).flatMap(([key])=>key.split(':').map(Number)));
 assert.ok([...patch].every(id=>rim.has(body.weld[id])),'No interior male-appendage vertex or new geometry is introduced');
 assert.ok([...newEdges.values()].every(value=>value.count===2&&value.direction===0),'Every welded edge has two consistently oriented faces');
 for(const key of Object.keys(copies))assert.deepEqual(body[key],copies[key],`${key} stays immutable`);
 const repeat=inspectionFemaleBodyFaces({...body,faces:result});assert.deepEqual(repeat,result);assert.notEqual(repeat,result);
});

test('the neutral patch has no degenerate triangles, self intersections or intersections with the actual skin',()=>{
 inspect(Float64Array.from(body.position,v=>v/10000),'neutral body');
});

test('the existing five adult shapes and five adult ages retain an intact neutral closing surface',()=>{
 for(let shape=0;shape<5;shape++)for(let age=0;age<5;age++)inspect(Float64Array.from(morphed(shape,age),v=>v/10000),`body ${shape}, adult age ${age}`);
});

test('the closing surface follows the existing rig during standing, walking, turning and sitting',()=>{
 const solver=new SalonMotion(()=>{},{angle:0},undefined,()=>.42);solver.femaleHands=true;
 const samples=[['rest',poses.f.rest]];
 for(const id of ['dojo-deplacement','dojo-demi-tour'])for(const ms of [0,1800,3600,5400,7800,10000]){
  const actor=dojoBlocking({id,ms:12000},ms,{floorY:0}).f,expression={gesture:actor.poseGesture,look:actor.headYaw};
  let bones;
  if(actor.gait.footwork)bones=solver.sampleFootworkPose(actor.gait.footwork,ms/1000,expression,1.04);
  else if(actor.gait.strength>.01){solver.expression=expression;solver.travelPose(actor.gait.phase,actor.gait.strength*.7,0);bones=solver.bones();}
  else bones=solver.sampleSalonPose(null,0,ms/1000+2.6,expression,1.04);
  samples.push([`${id} ${ms}`,bones.slice()]);
 }
 const seat=seats.find(seat=>seat.id==='chair');
 for(const chance of [0,.2,.6,.8,.99]){
  const seated=new SalonMotion(()=>{},{angle:0},undefined,()=>chance);seated.femaleHands=true;
  for(const amount of [.5,1])samples.push([`sitting ${chance}, ${amount}`,seated.sampleSalonPose(seat,amount,3.2,null,1.04).slice()]);
 }
 for(const [label,bones] of samples)inspect(posed(body.position,bones),label);
});

test('the original crossed-leg pose already crosses its own open rim; adult inspection must use the standing pose',t=>{
 const solver=new SalonMotion(()=>{},{angle:0},undefined,()=>.42);solver.femaleHands=true;
 const position=posed(body.position,solver.sampleSalonPose(seats.find(seat=>seat.id==='chair'),1,3.2,null,1.04));
 const original=edges(body.faces),rim=new Set([...original].filter(([,v])=>v.count===1).map(([key])=>key));
 const crossings=[];
 for(let i=0;i<body.faces.length;i+=3)for(let j=0;j<3;j++){
  const a=body.faces[i+j],b=body.faces[i+(j+1)%3],u=body.weld[a],v=body.weld[b];
  if(!rim.has([Math.min(u,v),Math.max(u,v)].join(':')))continue;
  const segment=[vec(position,a),vec(position,b)],box=bounds(segment);
  for(let k=0;k<body.faces.length;k+=3){
   const ids=[body.faces[k],body.faces[k+1],body.faces[k+2]];
   if([0,1,2].some(axis=>ids.every(id=>position[3*id+axis]<box[2*axis]-1e-10)||ids.every(id=>position[3*id+axis]>box[2*axis+1]+1e-10)))continue;
   if(segmentHits(...segment,ids.map(id=>vec(position,id))))crossings.push([a,b,k/3]);
  }
 }
 assert.ok(crossings.length>0,'The collision exists before any closing triangle is added');
 const triangles=[];
 for(let i=0;i<patch.length;i+=3)triangles.push(Array.from(patch.subarray(i,i+3),id=>vec(position,id)));
 for(let i=0;i<triangles.length;i++)for(let j=i+1;j<triangles.length;j++){
  if(overlapping(bounds(triangles[i]),bounds(triangles[j])))assert.equal(intersect(triangles[i],triangles[j]),false,'The patch itself still does not intersect');
 }
 t.diagnostic(`${crossings.length} original rim/skin contacts in the existing genou pose; no vertex or rig change is hidden in the repair.`);
});

test('an unrelated missing face is rejected rather than closing any other part of a model',()=>{
 assert.throws(()=>inspectionFemaleBodyFaces({...body,faces:body.faces.slice(3)}),/contour du corps féminin/);
 const intactMale=inspectionFemaleBodyFaces(male);assert.deepEqual(intactMale,male.faces);assert.notEqual(intactMale,male.faces);
});
