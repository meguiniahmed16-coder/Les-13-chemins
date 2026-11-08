// Bake continuous anatomical hand surfaces from posed volumes. No external model or texture.
// Output is committed; normal site builds do not run this offline generation step.
import {MarchingCubes} from 'three/examples/jsm/objects/MarchingCubes.js';
import * as T from 'three';
import {writeFileSync} from 'node:fs';
const specs={};
function spec(){return {shapes:[],nails:[],wrist:[0,-.075,0],cuff:[.018,-.235,.035]};}
function ell(s,p,r){s.shapes.push({kind:'ell',p,r});}
function cap(s,a,b,r0,r1=r0){s.shapes.push({kind:'cap',a,b,r0,r1});}
function digit(s,pts,r,dorsal=[0,0,1]){
 const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p)),false,'centripetal');const points=curve.getPoints(12);
 for(let i=0;i<12;i++)cap(s,points[i].toArray(),points[i+1].toArray(),r*(1-i/12*.23),r*(1-(i+1)/12*.23));
 s.nails.push({tip:pts.at(-1),previous:pts.at(-2),normal:dorsal,r:r*.77});
}
function base(s){
 // Palm tapers into the wrist; metacarpal cushions form a broad knuckle arc.
 ell(s,[0,-.014,0],[.042,.058,.019]);ell(s,[-.024,-.025,-.007],[.024,.035,.022]);
 cap(s,[0,-.057,0],[.008,-.14,.012],.026,.035);cap(s,[.008,-.14,.012],[.018,-.25,.034],.035,.047);
}
const roots=[[-.030,.031,0],[-.009,.041,0],[.012,.036,0],[.031,.024,0]],radii=[.0098,.0104,.0095,.0082];
let s=spec();base(s);
const ends=[[-.039,.111,-.009],[-.009,.132,-.014],[.018,.121,-.018],[.046,.092,-.015]];
roots.forEach((a,i)=>{const e=ends[i];digit(s,[a,[a[0],a[1]+(e[1]-a[1])*.43,.001],[e[0]-.002,e[1]-.022,-.004],e],radii[i]);});
digit(s,[[-.030,-.031,-.003],[-.052,-.016,-.004],[-.066,.007,-.005],[-.068,.032,-.008]],.0142,[0,0,1]);
specs.open=s;
s=spec();base(s);
digit(s,[roots[0],[-.029,.072,-.004],[-.028,.105,-.010],[-.028,.127,-.014]],.0098);
digit(s,[[-.002,.039,0],[-.002,.079,-.004],[-.002,.110,-.010],[-.002,.136,-.015]],.0102);
digit(s,[roots[2],[.012,.056,-.033],[.012,.034,-.052],[.012,.010,-.042]],.0095,[0,-.8,-.6]);
digit(s,[roots[3],[.031,.044,-.025],[.031,.023,-.044],[.031,.003,-.034]],.0082,[0,-.7,-.7]);
digit(s,[[-.029,-.031,-.004],[-.052,-.009,-.009],[-.043,.019,-.033],[-.019,.030,-.045]],.014,[0,0,1]);
specs.smoke=s;
for(const [name,R]of [['brush',.014],['cup',.043]]){
 s=spec();const x=R+.020,z=R>.03?.018:.009;
 ell(s,[x,-.006,z],[.024,.061,R>.03?.033:.027]);ell(s,[x-.004,.015,z+.024],[.025,.031,.024]);
 s.wrist=[x+.009,-.078,z+.013];s.cuff=[x+.042,-.235,z+.060];
 cap(s,[x+.004,-.055,z+.009],[x+.020,-.143,z+.030],.026,.035);cap(s,[x+.020,-.143,z+.030],s.cuff,.035,.047);
 for(let i=0;i<4;i++){
  const y=.046-i*.025,r=radii[i],spread=[0,.005,.002,-.003][i];
  const pts=R>.03?[[x,y,.008],[R*.87,y+spread,-.037],[.008,y+spread-.003,-.051],[-.014,y-.005,-.041]]:[[x,y,.007],[.024,y+.004,-.025],[-.012,y,-.028],[-.021,y-.007,.004]];
  digit(s,pts,r,R>.03?[-.45,0,-.9]:[-1,0,0]);
 }
 const thumb=R>.03?[[x+.002,.012,z+.024],[.054,.052,.052],[.024,.064,.055],[-.003,.059,.046]]:[[x+.004,.012,z+.024],[.031,.050,.037],[.007,.060,.036],[-.015,.052,.029]];
 digit(s,thumb,.014,[0,.15,1]);specs[name]=s;
}
function bake(spec){
 const N=128,low=[-.115,-.305,-.115],span=[.29,.49,.27];const mc=new MarchingCubes(N,new T.MeshBasicMaterial(),false,false,60000);mc.isolation=0;mc.field.fill(-1);
 const smooth=.0028;
 for(const q of spec.shapes){
  const pad=smooth+.007;let lo,hi;
  if(q.kind==='ell'){lo=q.p.map((v,i)=>v-q.r[i]-pad);hi=q.p.map((v,i)=>v+q.r[i]+pad);}else{lo=q.a.map((v,i)=>Math.min(v,q.b[i])-Math.max(q.r0,q.r1)-pad);hi=q.a.map((v,i)=>Math.max(v,q.b[i])+Math.max(q.r0,q.r1)+pad);}
  const bounds=lo.map((v,i)=>[Math.max(1,Math.floor((v-low[i])/span[i]*N)),Math.min(N-2,Math.ceil((hi[i]-low[i])/span[i]*N))]);
  const ab=q.kind==='cap'?q.a.map((v,i)=>q.b[i]-v):null,den=ab?ab.reduce((v,x)=>v+x*x,0):0;
  for(let iz=bounds[2][0];iz<=bounds[2][1];iz++)for(let iy=bounds[1][0];iy<=bounds[1][1];iy++)for(let ix=bounds[0][0];ix<=bounds[0][1];ix++){
   const p=[low[0]+ix/N*span[0],low[1]+iy/N*span[1],low[2]+iz/N*span[2]];let d;
   if(q.kind==='ell'){let a=0,b=0;for(let k=0;k<3;k++){const v=(p[k]-q.p[k])/q.r[k];a+=v*v;b+=v*v/(q.r[k]*q.r[k]);}d=a<1e-9?-Math.min(...q.r):Math.sqrt(a)*(Math.sqrt(a)-1)/Math.sqrt(b);}
   else{const u=p.map((v,i)=>v-q.a[i]),f=Math.max(0,Math.min(1,u.reduce((sum,v,i)=>sum+v*ab[i],0)/den));d=Math.hypot(...u.map((v,i)=>v-ab[i]*f))-(q.r0+(q.r1-q.r0)*f);}
   const index=iz*N*N+iy*N+ix,prev=-mc.field[index],h=Math.max(0,smooth-Math.abs(d-prev))/smooth;mc.field[index]=-(Math.min(d,prev)-h*h*smooth*.25);
  }
 }
 mc.update();const positions=[],normals=[],indices=[],unique=new Map();
 for(let i=0;i<mc.count;i++){
  const p=[0,1,2].map(k=>Math.round((low[k]+(mc.positionArray[i*3+k]+1)*span[k]/2)*100000));
  const key=p.join(',');let id=unique.get(key);
  if(id===undefined){id=positions.length/3;unique.set(key,id);positions.push(...p);const n=[0,1,2].map(k=>mc.normalArray[i*3+k]/span[k]);const len=Math.hypot(...n)||1;normals.push(...n.map(x=>Math.round(x/len*127)));}
  indices.push(id);
 }
 const b64=a=>Buffer.from(a.buffer).toString('base64');return{p:b64(new Int16Array(positions)),n:b64(new Int8Array(normals)),i:b64(new Uint16Array(indices)),nails:spec.nails,wrist:spec.wrist,cuff:spec.cuff,vertices:positions.length/3,triangles:indices.length/3};
}
const all={};for(const [name,s]of Object.entries(specs)){all[name]=bake(s);console.log(name,all[name].vertices,'vertices,',all[name].triangles,'triangles');}
writeFileSync('yoyo-hands-data.js','// Generated by build-yoyo-hands.mjs. Continuous right-hand meshes, metres.\nexport const handData='+JSON.stringify(all)+';\n');
