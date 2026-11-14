import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {makeCitizen,animateCitizen,freezeCitizen} from './catalogne-characters.js';
import {poseActivity,poseSeated} from './catalogne-motion.js';
import {block,mesh,rod,contact,materials,batchStatic} from './catalogne-art.js';
import {PARK_LIFE,GATHERINGS} from './catalogne-life-layout.js';
const V=(x,y,z)=>new T.Vector3(x,y,z),mats=new Map();
const mat=c=>{if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.85,side:T.DoubleSide}));return mats.get(c);};
const at=id=>PARK_LIFE.find(x=>x.id===id);
function guitar(parent){
 const g=new T.Group();parent.add(g);g.position.set(.03,.89,-.36);g.rotation.z=.9;
 const s=new T.Shape();s.moveTo(0,-.28);s.bezierCurveTo(-.27,-.28,-.28,-.04,-.14,.04);s.bezierCurveTo(-.08,.10,-.20,.16,-.15,.25);s.bezierCurveTo(-.12,.34,.12,.34,.15,.25);s.bezierCurveTo(.20,.16,.08,.10,.14,.04);s.bezierCurveTo(.28,-.04,.27,-.28,0,-.28);
 const body=new T.ExtrudeGeometry(s,{depth:.085,bevelEnabled:true,bevelThickness:.009,bevelSize:.01,bevelSegments:1,steps:1,curveSegments:9});mesh(body,mat('#aa7746'),0,0,-.045,g);
 block(g,0,.51,0,.068,.52,.045,mat('#493e30'));block(g,0,.82,0,.09,.14,.05,mat('#93623e'));
 const hole=mesh(new T.CircleGeometry(.065,24),mat('#332d24'),0,.065,-.061,g);hole.rotation.y=Math.PI;
 mesh(new T.TorusGeometry(.074,.007,5,24),mat('#d2b475'),0,.065,-.066,g);
 block(g,0,-.12,-.063,.13,.025,.018,mat('#493a2c'));
 for(let i=0;i<6;i++)rod(g,V((i-2.5)*.008,-.13,-.076),V((i-2.5)*.008,.83,-.076),.0013,mat('#d8cfaf'));
 for(let i=0;i<11;i++)block(g,0,.30+i*.041,-.028,.068,.003,.004,mat('#b9b6a5'));
 for(const x of[-.058,.058])for(let i=0;i<3;i++)block(g,x,.77+i*.038,0,.035,.018,.025,mat('#c5c4b2'));
 return g;
}
export function flowerGardens(root){
 const points=[];
 for(const side of[-1,1])for(const edge of[3.05,10.15])for(let z=-5;z<137;z+=.55)for(let row=0;row<2;row++){
  // Clear cross paths and the entrance to each little social clearing.
  if([14,46,78,110].some(v=>Math.abs(z-v)<1.7))continue;
  points.push({x:side*(edge+(row-.5)*.28),z:z+Math.sin(z*2.3+row)*.10,k:Math.floor(z/5)+row});
 }
 for(const [cx,cz,rx,rz]of [[15,106,4,3],[11,19,2.5,1.6],[-11,54,2.6,1.5],[24,39,2.6,1.9],[-10,117,2.1,1.7]]){
  const bed=new T.Group();root.add(bed);const border=mesh(new T.CylinderGeometry(1,1,.11,48),materials.stone,cx,.055,cz,bed,[rx+ .18,1,rz+.18]);mesh(new T.CylinderGeometry(1,1,.02,40),mat('#766e4d'),cx,.118,cz,bed,[rx,1,rz]);
  for(let x=-rx+.13;x<rx;x+=.32)for(let z=-rz+.13;z<rz;z+=.32)if((x/rx)**2+(z/rz)**2<.95)points.push({x:cx+x,z:cz+z,k:Math.round(x*3+z*2)});
 }
 const parts=[];
 for(let i=0;i<5;i++){const a=i*Math.PI*.4,g=new T.IcosahedronGeometry(1,0);g.scale(.064,.026,.10);g.rotateY(a);g.translate(Math.sin(a)*.07,0,Math.cos(a)*.07);parts.push(g);}const petal=mergeGeometries(parts);petal.userData.softwareLOD=new T.SphereGeometry(.13,4,3);petal.userData.softwareLODDistance=12;
 const flowers=new T.InstancedMesh(petal,mat('#ffffff'),points.length),stems=new T.InstancedMesh(new T.CylinderGeometry(.009,.012,1,5),mat('#647c4d'),points.length),centers=new T.InstancedMesh(new T.SphereGeometry(.028,5,4),mat('#d8b65d'),points.length);
 const palette=['#cf745c','#e1c36c','#ac80ac','#e6dfc8','#c9a2af','#9c83b0','#df9e6b'],dummy=new T.Object3D();
 points.forEach((p,i)=>{const h=.24+(i%5)*.033;dummy.rotation.set(0,i*.75,0);dummy.position.set(p.x,h,p.z);dummy.scale.setScalar(1);dummy.updateMatrix();flowers.setMatrixAt(i,dummy.matrix);centers.setMatrixAt(i,dummy.matrix);flowers.setColorAt(i,new T.Color(palette[((p.k%palette.length)+palette.length)%palette.length]));dummy.position.y=h/2;dummy.scale.set(1,h,1);dummy.updateMatrix();stems.setMatrixAt(i,dummy.matrix);});
 stems.geometry.userData.softwareDistance=30;centers.geometry.userData.softwareDistance=25;
 for(const m of[flowers,stems,centers]){m.frustumCulled=false;root.add(m);}return points.length;
}
export function makeParkLife(asset,root){
 const animated=[],joggers=[],dots=[];
 const addStatic=(actor,parent=root)=>{parent.add(freezeCitizen(actor));};
 const citizen=(i,x,z,angle=0,role='walker')=>{const a=makeCitizen(asset,i,role);a.group.position.set(x,0,z);a.group.rotation.y=angle;return a;};
 const music=at('music'),musicRoot=new T.Group();root.add(musicRoot);
 const musician=citizen(122,music.x,music.z,0,'sport');poseActivity(musician.rig,'guitar');guitar(musician.group);root.add(musician.group);animated.push({actor:musician,kind:'guitar',x:music.x,z:music.z});
 block(musicRoot,music.x,.40,music.z,.48,.13,.44,materials.wood);for(const x of[-.17,.17])for(const z of[-.15,.15])block(musicRoot,music.x+x,.19,music.z+z,.04,.38,.04,materials.iron);
 block(musicRoot,music.x+.65,.11,music.z-.65,.35,.20,.55,mat('#625548'));contact(musicRoot,music.x,music.z,2,2);
 for(let i=0;i<7;i++){const angle=-Math.PI*.92+i*Math.PI*.84/6,x=music.x+Math.cos(angle)*(2.2+i%2*.6),z=music.z+Math.sin(angle)*(2.4+i%2*.4);const a=citizen(130+i,x,z,Math.atan2(music.x-x,music.z-z)+Math.PI);poseActivity(a.rig,'listen',0,i);addStatic(a,musicRoot);dots.push({x,z});}batchStatic(musicRoot);
 for(const kind of['yoga','taichi']){
  const point=at(kind),group=new T.Group();root.add(group);
  for(let i=0;i<7;i++){
   const x=point.x+(i===6?0:(i%3-1)*1.75),z=point.z+(i===6?-3:(Math.floor(i/3)-.5)*2.5);
   const a=citizen((kind==='yoga'?150:170)+i,x,z,i===6?Math.PI:0,'sport');poseActivity(a.rig,kind,0,i);
   if(kind==='yoga'){block(group,x,.034,z,1.1,.028,1.85,mat(['#96aaa0','#bca58d','#ab9eae'][i%3]));addStatic(a,group);}else{root.add(a.group);animated.push({actor:a,kind,x,z,variant:i});}
   dots.push({x,z});
  }
  batchStatic(group);
 }
 const lovers=at('lovers'),loveRoot=new T.Group();root.add(loveRoot);
 for(let pair=0;pair<2;pair++)for(let side=0;side<2;side++){
  const x=lovers.x+pair*3.0,z=lovers.z+pair*2+(side? .13:-.13),a=citizen(181+pair*8+side*4,x,z,side?0:Math.PI,'sport');
  poseActivity(a.rig,'embrace',0,side?1:-1);addStatic(a,loveRoot);dots.push({x,z});
 }
 batchStatic(loveRoot);
 // Intimacy is suggested by two clothed adults resting together, with a blanket over their legs.
 const quiet=at('quiet'),restRoot=new T.Group();root.add(restRoot);
 block(restRoot,quiet.x,.035,quiet.z,2.2,.035,2.3,mat('#ac8c78'));
 for(let i=0;i<2;i++){
  const a=citizen(211+i*4,quiet.x+(i? .17:-.17),quiet.z+.73,0,'sport');poseActivity(a.rig,'recline',0,i);a.rig.group.rotation.set(-Math.PI/2,0,i?-.08:.08);a.group.position.y=.22;a.group.updateMatrixWorld(true);addStatic(a,restRoot);
 }
 const cover=mesh(new T.SphereGeometry(1,16,8),mat('#c1bba1'),quiet.x,.30,quiet.z+.50,restRoot,[.70,.17,.74]);batchStatic(restRoot);
 for(let g=0;g<GATHERINGS.length;g++){
  const point=GATHERINGS[g],group=new T.Group();root.add(group);
  for(let i=0;i<3;i++){const angle=i*Math.PI*2/3,x=point.x+Math.cos(angle)*.75,z=point.z+Math.sin(angle)*.75,a=citizen(230+g*3+i,x,z,Math.atan2(point.x-x,point.z-z)+Math.PI);poseActivity(a.rig,'listen',0,i);addStatic(a,group);dots.push({x,z});}batchStatic(group);
 }
 for(let i=0;i<6;i++){const a=citizen(270+i,0,0,0,'sport');root.add(a.group);joggers.push({actor:a,index:i});}
 let time=0;
 return {dots,update(dt,run,active){
  if(active)time+=dt;
  for(const p of animated)if(Math.hypot(p.x-run.x,p.z-run.z)<36)poseActivity(p.actor.rig,p.kind,time,p.variant||0);
  for(const p of joggers){const heading=p.index%2?1:-1,z=Math.floor(run.z/160)*160+((time*(2.7+p.index*.12)+p.index*24)%160),x=(p.index%2?1:-1)*(5.5+(p.index%3)*.42);p.actor.group.position.set(x,0,heading>0?z:160-z+2*Math.floor(run.z/160)*160);p.actor.group.rotation.y=heading>0?Math.PI:0;if(Math.hypot(x-run.x,p.actor.group.position.z-run.z)<40)animateCitizen(p.actor,active?dt:0,active,true);}
 },mapDots(){return [...dots,...joggers.map(p=>({x:p.actor.group.position.x,z:p.actor.group.position.z}))];}};
}
