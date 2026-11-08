// Bake continuous anatomical hand surfaces from posed volumes. No external model or texture.
// Output is committed; normal site builds do not run this offline generation step.
import {MarchingCubes} from 'three/examples/jsm/objects/MarchingCubes.js';
import * as T from 'three';
import {writeFileSync} from 'node:fs';
const specs={};
function spec(){return {shapes:[],nails:[],digits:[],wrist:[0,-.075,0],cuff:[.018,-.235,.035]};}
function ell(s,p,r){s.shapes.push({kind:'ell',p,r});}
function cap(s,a,b,r0,r1=r0){s.shapes.push({kind:'cap',a,b,r0,r1});}
function digit(s,pts,r,dorsal=[0,0,1],taper=.23){
 // Keep real phalanx control points for anatomical regression checks; do not validate tips alone.
 s.digits.push({points:pts.map(p=>[...p]),radius:r});
 const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p)),false,'centripetal');const points=curve.getPoints(12);
 for(let i=0;i<12;i++)cap(s,points[i].toArray(),points[i+1].toArray(),r*(1-i/12*taper),r*(1-(i+1)/12*taper));
 s.nails.push({tip:pts.at(-1),previous:pts.at(-2),normal:dorsal,r:r*.77});
}
function base(s){
 // Palm tapers into the wrist; metacarpal cushions form a broad knuckle arc.
 ell(s,[0,-.014,0],[.042,.058,.019]);ell(s,[-.024,-.025,-.007],[.024,.035,.022]);
 cap(s,[0,-.057,0],[.008,-.14,.012],.026,.035);cap(s,[.008,-.14,.012],[.018,-.25,.034],.035,.047);
}
const roots=[[-.030,.031,0],[-.009,.041,0],[.012,.036,0],[.031,.024,0]],radii=[.0098,.0104,.0095,.0082];
// Search stage, before the toilet brush is taken: searching uses openHand(), NOT heldBrush().
// Relaxed reaching pose modelled with MCP/PIP/DIP and separate naturally curved fingertips.
// Never spread the index and little finger into crooked hooks to simulate a grasp.
let s=spec();base(s);
const reachingDigits=[
 [[-.030,.031,0],[-.032,.060,.001],[-.032,.085,-.006],[-.029,.106,-.015],[-.028,.110,-.020]], // index
 [[-.009,.041,0],[-.010,.071,.001],[-.010,.103,-.008],[-.008,.124,-.020],[-.007,.129,-.024]], // middle
 [[.012,.036,0],[.014,.066,.001],[.017,.094,-.010],[.021,.112,-.020],[.020,.114,-.024]], // ring
 [[.031,.024,0],[.034,.052,0],[.038,.073,-.010],[.043,.088,-.017],[.042,.090,-.021]], // little
];
reachingDigits.forEach((points,i)=>digit(s,points,radii[i]*[.97,.98,1,1][i],[0,0,1],.34));
// Thumb is splayed beside the palm but NOT hyperextended or curled back into a hook.
digit(s,[[-.030,-.031,-.003],[-.046,-.015,.004],[-.062,.003,.013],[-.072,.020,.016],[-.076,.032,.011]],.0128,[0,0,1],.29);
specs.open=s;
s=spec();base(s);
// Two long, softly flexed fingers flank the cigarette at the middle phalanges.
// Their tips continue beyond the cigarette; folding them at the tip produces a distorted 'V'.
digit(s,[roots[0],[-.030,.068,-.006],[-.029,.097,-.016],[-.026,.119,-.022]],.0098);
digit(s,[roots[1],[-.005,.081,-.006],[.001,.105,-.016],[.005,.130,-.022]],.0102);
// Ring and little fingers curl gradually instead of bending sharply backwards.
digit(s,[roots[2],[.014,.061,-.014],[.018,.050,-.036],[.020,.031,-.041],[.020,.018,-.033]],.0095,[0,-.8,-.6]);
digit(s,[roots[3],[.035,.048,-.012],[.040,.041,-.031],[.041,.022,-.038],[.039,.012,-.030]],.0082,[0,-.7,-.7]);
digit(s,[[-.029,-.031,-.004],[-.044,-.010,-.008],[-.039,.011,-.023],[-.021,.020,-.031]],.0138,[0,0,1]);
specs.smoke=s;

// A proper side grip: the knuckles are spread over the width of the palm.
// Each bent finger follows the outside of the cup, without crossing the ceramic or
// extending implausibly across the entire diameter (the old digits were ~12 cm long).
// Held toilet-brush grip. Build the fingers AROUND the real vertical handle (radius 13 mm),
// instead of drawing four identical hooked claws and inserting the brush afterwards.
// X is radial: palm sits to the right of the shaft; Y separates the knuckles.
s=spec();{
 const handleRadius=.013;
 // Palm touches the handle at its right side. A restrained thenar pad supports the thumb.
 ell(s,[.039,-.006,.011],[.025,.062,.028]);
 ell(s,[.044,.014,.027],[.018,.030,.021]);
 s.wrist=[.049,-.078,.028];s.cuff=[.077,-.235,.069];
 cap(s,[.042,-.056,.020],[.052,-.143,.040],.026,.035);
 cap(s,[.052,-.143,.040],s.cuff,.035,.047);

 // Realistic knuckle stagger and nonuniform finger lengths (index to little).
 // MCP -> proximal -> intermediate -> distal -> pulp: each arc bends gradually
 // around the shaft; terminal pads touch the rubber without going through it.
 const grips=[
  [[.039,.048,.010],[.034,.048,-.011],[.018,.046,-.025],[-.004,.046,-.023],[-.016,.045,-.012]],
  [[.039,.022,.010],[.034,.024,-.013],[.016,.024,-.027],[-.006,.022,-.023],[-.018,.021,-.011]],
  [[.039,-.003,.009],[.034,-.005,-.012],[.018,-.007,-.022],[-.003,-.010,-.021],[-.016,-.011,-.009]],
  [[.039,-.027,.008],[.036,-.028,-.009],[.021,-.031,-.018],[.003,-.033,-.020],[-.016,-.034,-.012]],
 ];
 for(let i=0;i<grips.length;i++)digit(s,grips[i],radii[i],[-1,0,0]);

 // The thumb crosses the front of the rubber handle from the opposite side.
 // Three curved bones are distinct from the thenar mound, not fused into a blob.
 digit(s,[[.051,.000,.028],[.042,.024,.041],[.025,.034,.033],[.006,.034,.020]],.0138,[0,0,1]);
 // Expose the physical constraint for gameplay/visual regression tests.
 s.grip={handleRadius,axis:[0,1,0],center:[0,0,0],object:'toilet-brush'};
 specs.brush=s;
}
s=spec();{
 const x=.070,z=.018; // palm at the right side of the cup, not intersecting its cylindrical wall.
 ell(s,[x,-.006,z],[.024,.060,.032]);ell(s,[x-.004,.015,z+.024],[.025,.031,.023]);
 s.wrist=[x+.009,-.078,z+.013];s.cuff=[x+.042,-.235,z+.060];
 cap(s,[x+.004,-.055,z+.009],[x+.020,-.143,z+.030],.026,.035);
 cap(s,[x+.020,-.143,z+.030],s.cuff,.035,.047);
 const grips=[
  [[x,.046,.007],[.060,.046,-.017],[.047,.041,-.036],[.027,.038,-.047]],  // index
  [[x,.020,.007],[.060,.018,-.018],[.047,.016,-.038],[.027,.013,-.046]], // middle
  [[x,-.005,.007],[.061,-.008,-.018],[.051,-.011,-.035],[.033,-.016,-.044]], // ring
  [[x,-.028,.007],[.063,-.031,-.016],[.052,-.035,-.032],[.037,-.039,-.043]], // little
 ];
 for(let i=0;i<4;i++)digit(s,grips[i],radii[i],[-.45,0,-.9]);
 // The thumb opposes the fingers on the visible front side and has a raised joint.
 digit(s,[[x+.002,.003,.045],[.060,.038,.066],[.036,.053,.068],[.015,.059,.056]],.014,[0,.15,1]);
 specs.cup=s;
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
 const b64=a=>Buffer.from(a.buffer).toString('base64');return{p:b64(new Int16Array(positions)),n:b64(new Int8Array(normals)),i:b64(new Uint16Array(indices)),digits:spec.digits,nails:spec.nails,wrist:spec.wrist,cuff:spec.cuff,...(spec.grip?{grip:spec.grip}:{}),vertices:positions.length/3,triangles:indices.length/3};
}
const all={};for(const [name,s]of Object.entries(specs)){all[name]=bake(s);console.log(name,all[name].vertices,'vertices,',all[name].triangles,'triangles');}
writeFileSync('yoyo-hands-data.js','// Generated by build-yoyo-hands.mjs. Continuous right-hand meshes, metres.\nexport const handData='+JSON.stringify(all)+';\n');
