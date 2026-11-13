// Visual layer only. The original 400 m chase owns timing, controls and rewards.
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {surface,glassSurfaces,stainMaterial,shadowMaterial} from './a410-materials.js';
import {SoftwareRenderer} from './a410-software.js';
import {poseRunner,poseSeated} from './a410-motion.js';
import {createCar,rollCar} from './a410-cars.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const V=(x,y,z)=>new T.Vector3(x,y,z);
const material=(color,opts={})=>new T.MeshStandardMaterial({color,roughness:.88,...opts});
const palette={grass:material('#7c8d5a'),path:material('#c8b995'),stone:material('#b4ad98'),cream:material('#e7dbc2'),roof:material('#8f5c4b'),wood:material('#786249'),metal:material('#425b54'),glass:material('#83a9ac',{roughness:.24,metalness:.18}),road:material('#777d78'),white:material('#ece7d7'),dark:material('#303d38'),leaf:material('#4c6c45')};
const cube=new T.BoxGeometry(1,1,1),orb=new T.IcosahedronGeometry(1,2);
function mesh(geometry,mat,x,y,z,parent,scale){const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);if(scale)m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(w,h,d,mat,x,y,z,p){let geometry=cube;const tile=mat.userData?.tileMeters;if(tile){geometry=cube.clone();const uv=geometry.attributes.uv,n=geometry.attributes.normal;for(let i=0;i<uv.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i));uv.setXY(i,uv.getX(i)*(nx>.5?d:w)/tile,uv.getY(i)*(ny>.5?d:h)/tile);}}return mesh(geometry,mat,x,y,z,p,[w,h,d]);}
const plaster=surface('plaster','#d6cdb7',2,31),cutStone=surface('stone','#b9ad97',1.8,17),stoneTrim=surface('concrete','#cec5af',1.1,28),concreteSurface=surface('concrete','#aaa99b',1.7,44),courtSurface=surface('asphalt','#8b9187',3,18),iron=surface('metal','#43584e',1.3,32),glazing=glassSurfaces(),drips=stainMaterial(),damp=stainMaterial('damp'),softShadow=shadowMaterial();
Object.assign(palette,{grass:surface('grass','#768553',2.2,22),path:surface('asphalt','#b7ab92',2.5,8),stone:stoneTrim,cream:plaster,wood:surface('wood','#79614b',1.1,92),metal:iron,road:surface('asphalt','#707971',3,41)});
function decal(w,h,mat,x,y,z,parent,ground=false){const m=mesh(new T.PlaneGeometry(w,h),mat,x,y,z,parent);m.castShadow=false;if(ground)m.rotation.x=-Math.PI/2;return m;}
function treeCrown(x,y,z,r,p){for(let i=0;i<21;i++){const angle=i*2.39996,v=(i+.5)/21,rr=Math.sqrt(1-(v*2-1)**2);ball(r*(.32+(i%3)*.035),r*.4,r*.34,i%3?palette.leaf:palette.grass,x+Math.cos(angle)*rr*r*.7,y+(v*2-1)*r*.8,z+Math.sin(angle)*rr*r*.6,p);}}

const ball=(rx,ry,rz,mat,x,y,z,p)=>mesh(orb,mat,x,y,z,p,[rx,ry,rz]);
function bar(a,b,r,mat,p){const delta=b.clone().sub(a);const m=mesh(new T.CylinderGeometry(r,r,delta.length(),7),mat,...a.clone().add(b).multiplyScalar(.5).toArray(),p);m.quaternion.setFromUnitVectors(V(0,1,0),delta.normalize());return m;}
function mergeStatic(group,partition=false){group.updateMatrixWorld(true);const batches=new Map();group.traverse(m=>{if(!m.isMesh||m.isSkinnedMesh)return;const key=m.material.uuid+':'+m.castShadow+':'+m.receiveShadow+(partition?'@'+Math.floor(m.matrixWorld.elements[12]/12):'');const batch=batches.get(key)||{material:m.material,castShadow:m.castShadow,receiveShadow:m.receiveShadow,geometries:[]};const list=batch.geometries;let g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();if(!g.attributes.uv)g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));g.applyMatrix4(m.matrixWorld);list.push(g);batches.set(key,batch);});group.clear();group.position.set(0,0,0);group.rotation.set(0,0,0);group.scale.setScalar(1);for(const {material:mat,castShadow,receiveShadow,geometries:geoms}of batches.values()){const g=mergeGeometries(geoms);geoms.forEach(x=>x.dispose());if(g){const m=mesh(g,mat,0,0,0,group);m.castShadow=castShadow;m.receiveShadow=receiveShadow;}}}
function sign(lines,w,h,background='#f2ead7',ink='#29483f'){
 const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const g=c.getContext('2d');g.fillStyle=background;g.fillRect(0,0,c.width,c.height);g.strokeStyle=ink;g.lineWidth=9;g.strokeRect(14,14,c.width-28,c.height-28);g.fillStyle=ink;g.textAlign='center';g.textBaseline='middle';g.font=`600 ${Math.min(84,c.height/(lines.length+1))}px Georgia`;
 lines.forEach((l,i)=>g.fillText(l,512,(i+1)*c.height/(lines.length+1),960));const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return new T.MeshBasicMaterial({map:tex});
}

function roof(w,d,y,p){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-w/2,y,-d/2,w/2,y,-d/2,w/2,y+1.6,0,-w/2,y+1.6,0,-w/2,y,d/2,w/2,y,d/2],3));g.setIndex([0,2,1,0,3,2,3,4,5,3,5,2,0,4,3,1,2,5]);g.computeVertexNormals();mesh(g,palette.roof,0,0,0,p);
 for(let x=-w/2;x<=w/2;x+=.35){bar(V(x,y+.04,-d/2),V(x,y+1.64,0),.025,palette.roof,p);bar(V(x,y+1.64,0),V(x,y+.04,d/2),.025,palette.roof,p);}bar(V(-w/2,y+1.67,0),V(w/2,y+1.67,0),.09,palette.roof,p);
}
function school(p){
 const g=new T.Group();p.add(g);g.position.set(-2,0,-17);
 const ashlar=cutStone,limestone=plaster,concrete=concreteSurface,zinc=iron,brick=cutStone;
 // Institutional 1930s-inspired campus: three storeys, flat cornices and a deep U-shaped court.
 function block(w,d,h,x,z,side=false){const a=new T.Group();g.add(a);a.position.set(x,0,z);if(side)a.rotation.y=Math.PI/2;
  box(w,h,d,limestone,0,h/2,0,a);box(w,.55,d+.12,ashlar,0,.27,0,a);decal(w,.85,damp,0,.45,d/2+.071,a);decal(w,.4,damp,0,h-.18,d/2+.021,a);
  for(const y of[2.8,5.55,h]){box(w+.25,.13,d+.18,ashlar,0,y,0,a);}
  box(w+.42,.22,d+.4,concrete,0,h+.1,0,a);box(w,.12,d,zinc,0,h+.27,0,a);
  for(let x=-w/2+.8;x<w/2;x+=1.65){box(.16,h-.5,.09,ashlar,x-.64,h/2,d/2+.03,a);
   for(let row=0;row<Math.floor(h/2.5);row++){const y=1.55+row*2.65;box(1.15,1.79,.08,ashlar,x,y,d/2+.07,a);box(1.04,1.7,.06,palette.dark,x,y,d/2+.12,a);box(.94,1.6,.07,glazing[(row+Math.round((x+w/2)*2))%8],x,y,d/2+.16,a);decal(1.26,.55,drips,x,y-1.08,d/2+.061,a);for(const side of[-1,1]){box(.035,1.65,.07,stoneTrim,x+side*.49,y,d/2+.205,a);box(.99,.035,.07,stoneTrim,x,y+side*.81,d/2+.205,a);}box(.06,.15,.06,iron,x+.09,y-.1,d/2+.24,a);box(.045,1.61,.08,stoneTrim,x,y,d/2+.22,a);box(.95,.04,.08,stoneTrim,x,y-.22,d/2+.22,a);box(1.22,.085,.25,ashlar,x,y-.91,d/2+.15,a);}
  }
  for(const corner of[-1,1]){const xx=corner*(w/2-.17);bar(V(xx,.1,d/2+.14),V(xx,h+.11,d/2+.14),.045,iron,a);for(let y=.6;y<h;y+=1.7)box(.13,.055,.15,iron,xx,y,d/2+.12,a);}
  box(w+.3,.085,.12,iron,0,h+.13,d/2+.18,a);
  for(let x=-w/2+.25;x<w/2;x+=.5){box(.31,.055,.15,stoneTrim,x,h-.18,d/2+.09,a);}
  return a;
 }
 block(25,4,8.25,0,0);
 const left=block(12,4,7.2,-10.7,7,true),right=block(12,4,7.2,10.7,7,true);right.rotation.y=-Math.PI/2;
 // Raised central entrance bay and monumental, sheltered double doors.
 box(5.3,9.3,1.1,ashlar,0,4.65,2.35,g);box(5.7,.25,1.55,limestone,0,9.4,2.4,g);
 box(2.9,3.1,.12,palette.metal,0,1.55,2.98,g);for(const x of[-.74,.74])box(1.15,2.7,.06,glazing[2],x,1.6,3.07,g);
 for(const x of[-1.95,1.95])box(.42,3.6,1.1,limestone,x,1.8,3.3,g);box(4.8,.34,2.4,concrete,0,3.55,3.65,g);
 box(4.6,.62,.1,sign(['LYCÉE SAINTE-FAMILLE'],4.6,.62,'#dcd2bd','#354b42'),0,4.25,2.97,g);
 for(const x of[-1.25,0,1.25]){box(.72,2.25,.1,glazing[5],x,6.05,2.98,g);box(.08,2.28,.08,limestone,x,6.05,3.07,g);}
 mesh(new T.CircleGeometry(.52,40),palette.white,0,8.15,2.94,g);const clockRim=mesh(new T.TorusGeometry(.53,.024,5,48),iron,0,8.15,2.96,g);for(let i=0;i<12;i++){const a=i*Math.PI/6;bar(V(Math.sin(a)*.43,8.15+Math.cos(a)*.43,2.97),V(Math.sin(a)*.48,8.15+Math.cos(a)*.48,2.97),.009,palette.dark,g);}bar(V(0,8.15,2.98),V(0,8.51,2.98),.018,palette.dark,g);bar(V(0,8.15,2.98),V(.27,8.02,2.98),.018,palette.dark,g);
 for(let i=0;i<4;i++)box(5,.12*(i+1),.44,limestone,0,.06*(i+1),5.3-i*.44,g);
 // Recessed courtyard, separated from the foreground chase lane.
 box(17.1,.075,12.6,courtSurface,0,-.02,9,g);
 for(const x of[-7.6,7.6]){box(.1,.012,8.5,palette.white,x,.023,9,g);}
 for(const z of[4.75,13.25])box(15.2,.012,.1,palette.white,0,.023,z,g);
 const ring=mesh(new T.RingGeometry(1.35,1.40,36),palette.white,0,.025,9,g);ring.rotation.x=-Math.PI/2;
 box(.1,.012,8.5,palette.white,0,.024,9,g);
 // Side shelter with benches and bike parking set well behind the gate.
 box(7.5,.18,2.6,zinc,-4.2,2.8,14,g);for(let x=-7.8;x<-.5;x+=.4)box(.025,.05,2.6,stoneTrim,x,2.91,14,g);decal(8,3.7,softShadow,-4.2,.06,14.7,g,true);for(const x of[-7.4,-4.2,-1])box(.09,2.8,.09,palette.metal,x,1.4,15,g);
 for(const x of[-6.2,4.8])bench(x,12.6,g);for(let i=0;i<4;i++)bicycle(-7+i*1.2,14.3,g);
 for(const x of[-6.6,6.6]){box(1.35,.5,1.35,ashlar,x,.25,6,g);bar(V(x,.5,6),V(x,3.3,6),.08,palette.wood,g);treeCrown(x,3.3,6,.95,g);decal(3,2,softShadow,x+.5,.07,6.3,g,true);}
 // Tall gateposts, fine iron bars, an open central exit.
 for(const x of[-10.8,-2.3,2.3,10.8]){box(.62,2.15,.65,ashlar,x,1.075,16,g);box(.78,.13,.8,limestone,x,2.21,16,g);}
 for(let x=-10.5;x<10.5;x+=.32){if(Math.abs(x)<2.4)continue;box(.025,1.5,.025,palette.metal,x,.9,16,g);}
 for(const x of[-6.5,6.5])for(const y of[.3,1.55])box(8,.045,.06,palette.metal,x,y,16,g);
 box(2.15,.55,.09,sign(['LA ROCHE-SUR-FORON'],2.15,.55),6.5,1.2,16.08,g);
 // Sills, handles, lamps, worn steps and the small fittings of a used school.
 for(const x of[-.18,.18])bar(V(x,1.05,3.15),V(x,1.65,3.15),.022,iron,g);
 for(const x of[-2.4,2.4]){box(.18,.42,.2,iron,x,2.8,3,g);box(.12,.28,.22,glazing[0],x,2.8,3.1,g);}
 for(const x of[-8.1,8.1]){box(.42,.7,.42,iron,x,.35,12,g);box(.45,.06,.45,stoneTrim,x,.73,12,g);box(.27,.15,.02,palette.dark,x,.56,12.22,g);}
 for(let i=0;i<4;i++){decal(4.7,.1,damp,0,.12*(i+1)+.008,5.3-i*.44,g,true);}
 box(1.3,1.1,.13,iron,3.4,1.55,2.14,g);box(1.18,.98,.06,sign(['VIE DU LYCÉE','SPORT • CULTURE','HORAIRES • RÉUNIONS'],1.18,.98,'#d3c8ac','#3b4d42'),3.4,1.55,2.23,g);
 // Storm drains, uneven concrete joints, and an asphalt patch just inside the exit.
 for(const x of[-5,4.5]){box(.55,.035,.35,iron,x,.031,15.2,g);for(let i=0;i<7;i++)box(.035,.012,.30,palette.dark,x-.24+i*.08,.052,15.2,g);}
 for(let x=-10;x<11;x+=.7)box(.011,.018,.55,palette.dark,x,.015,16.75,g);
 for(const x of[-10.8,-2.3,2.3,10.8]){decal(.6,.5,damp,x,.28,16.33,g);box(.8,.18,.78,stoneTrim,x,.09,16,g);}
 for(const x of[-2.3,2.3])for(const y of[.5,1.6]){box(.18,.06,.08,iron,x+(x<0?.34:-.34),y,16.07,g);ball(.025,.025,.02,stoneTrim,x+(x<0?.34:-.34),y,16.12,g);}
 for(let i=0;i<65;i++){const x=-9.6+(i*1.713)%19.2,z=4.8+(i*2.193)%11.1;if(Math.abs(x)<3)continue;const leaf=mesh(new T.PlaneGeometry(.04+(i%4)*.013,.10),i%3?palette.wood:palette.leaf,x,.027,z,g);leaf.rotation.set(-Math.PI/2,0,i*.7);leaf.castShadow=false;}
 car(13,-3.4,'#62817b',p);decal(4.4,1.8,softShadow,13,.012,-3.4,p,true);
}
function bench(x,z,p){for(let i=0;i<4;i++){box(2.1,.075,.12,palette.wood,x,.46,z+i*.14,p);box(2.1,.12,.06,palette.wood,x,.72+i*.12,z-.1,p);}for(const a of[-.75,.75]){box(.08,.48,.51,palette.metal,x+a,.24,z+.17,p);box(.065,.8,.065,palette.metal,x+a,.65,z-.12,p);}}
function bicycle(x,z,p){const dark=palette.dark;for(const dx of[-.44,.44]){const wheel=mesh(new T.TorusGeometry(.29,.027,5,18),dark,x+dx,.32,z,p);for(let k=0;k<4;k++){let a=k*Math.PI/4;bar(V(x+dx-Math.cos(a)*.27,.32-Math.sin(a)*.27,z),V(x+dx+Math.cos(a)*.27,.32+Math.sin(a)*.27,z),.007,palette.stone,p);}}
 for(const[a,b]of[[[-.44,.32],[0,.34]],[[0,.34],[-.16,.78]],[[-.16,.78],[-.44,.32]],[[-.16,.78],[.3,.8]],[[.3,.8],[0,.34]],[[.3,.8],[.44,.32]]])bar(V(x+a[0],a[1],z),V(x+b[0],b[1],z),.025,palette.metal,p);box(.28,.045,.11,dark,x-.16,.8,z,p);bar(V(x+.3,.8,z),V(x+.26,1,z),.025,dark,p);
}
const car=createCar;
const picnicSpots=[{x:30,z:-6.5,a:-.10},{x:43,z:-7.2,a:.18},{x:62,z:-6.4,a:-.13}];
function picnicTable(spot,parent){
 const g=new T.Group();parent.add(g);g.position.set(spot.x,0,spot.z);g.rotation.y=spot.a;
 for(let i=0;i<5;i++)box(2.2,.065,.155,palette.wood,0,.79,-.33+i*.165,g);
 for(const side of[-1,1]){
  for(let i=0;i<2;i++)box(2.25,.075,.14,palette.wood,0,.46,side*.79+(i-.5)*.15,g);
  for(const x of[-.76,.76]){bar(V(x,.76,side*.22),V(x,.035,side*.65),.055,palette.wood,g);box(.13,.095,1.93,palette.wood,x,.36,0,g);}
 }
 bar(V(-.78,.43,0),V(.78,.43,0),.055,palette.wood,g);
 for(const x of[-.75,.75])for(const z of[-.65,.65])ball(.022,.022,.016,palette.metal,x,.375,z,g);
 // Picnic objects make the tables look occupied, without adding moving obstacles.
 const cream=material('#e6dcc4'),red=material('#a36d4b'),green=material('#506c5b');
 const cloth=box(.68,.018,.61,cream,.05,.834,.01,g);cloth.rotation.y=.09;
 for(const x of[-.55,.54]){const plate=mesh(new T.CylinderGeometry(.12,.12,.015,20),cream,x,.84,x>0?-.1:.12,g);const cup=mesh(new T.CylinderGeometry(.043,.035,.1,12),red,x+.18,.89,-.14,g);const handle=mesh(new T.TorusGeometry(.033,.008,5,12),red,x+.22,.9,-.14,g);}
 mesh(new T.CylinderGeometry(.042,.05,.24,12),green,.08,.955,.1,g);box(.05,.04,.05,palette.metal,.08,1.09,.1,g);
 box(.27,.04,.18,red,-.17,.86,-.14,g);box(.24,.023,.16,cream,-.17,.865,-.145,g);
 box(.33,.19,.23,palette.wood,.75,.925,.06,g);const handle=mesh(new T.TorusGeometry(.12,.012,5,16,Math.PI),palette.wood,.75,1.01,.06,g);
 decal(3.9,2.6,softShadow,0,.035,0,g,true);
 return g;
}
function freezePeople(group,parent){
 group.updateMatrixWorld(true);const frozen=new T.Group();
 group.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone(),pos=geo.attributes.position;
  if(o.isSkinnedMesh){o.skeleton.update();const v=new T.Vector3();for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);o.applyBoneTransform(i,v);pos.setXYZ(i,v.x,v.y,v.z);}geo.deleteAttribute('skinIndex');geo.deleteAttribute('skinWeight');geo.computeVertexNormals();}
  geo.applyMatrix4(o.matrixWorld);const m=new T.Mesh(geo,o.material);m.castShadow=true;m.receiveShadow=true;frozen.add(m);
 });
 parent.remove(group);parent.add(frozen);mergeStatic(frozen,true);return frozen;
}
function addPicnickers(asset,parent){
 const clothes=[['#627c87','#403e38','#d1a783','#504437'],['#b48c59','#444f51','#b7805f','#32261f'],['#677458','#485b66','#d9b89a','#8b8171'],['#ad7368','#343b40','#be8e69','#46332a'],['#747e91','#505045','#dbb191','#3b3128'],['#a6a08a','#4e5c56','#b58060','#6b6258']];
 picnicSpots.forEach((spot,i)=>{for(const side of[-1,1]){
  const index=i*2+(side>0?1:0),colors=clothes[index],localX=side>0?.42:-.43,localZ=side*.84;
  const p=person(asset,1.70+(index%3)*.065,'casual',parent,{shirt:colors[0],pants:colors[1],skin:colors[2],hair:colors[3]});
  p.group.rotation.y=spot.a+(side>0?Math.PI:0);p.group.position.x=spot.x+Math.cos(spot.a)*localX+Math.sin(spot.a)*localZ;p.group.position.z=spot.z-Math.sin(spot.a)*localX+Math.cos(spot.a)*localZ;
  poseSeated(p,.46,index%3-1);freezePeople(p.group,parent);
 }});
}

function landscape(root){
 const built=new T.Group();root.add(built);
 for(let x=-30;x<120;x+=5)for(let z=-43;z<23;z+=5)box(5,.3,5,palette.grass,x,-.15,z,built);
 const asphalt=surface('asphalt','#9b9d8e',3,85);for(let x=-17;x<16;x+=3)box(3,.08,5.4,asphalt,x,-.025,0,built);
 for(let x=6;x<112;x+=2)box(2,.07,3.9,palette.path,x,-.02,0,built);
 for(const z of[-2.05,2.05])box(115,.13,.17,palette.stone,48,.02,z,built);
 school(built);
 for(const spot of picnicSpots)picnicTable(spot,built);
 const parked=car(35,-10.4,'#d5d3bb',built,'fiesta');parked.rotation.y=-.17;decal(4.4,1.85,softShadow,35,.012,-10.4,built,true);
 // Mountain silhouettes are scenery, not an exact geographic reconstruction.
 // Irregular, layered ridgelines replace the earlier cone silhouettes.
 for(let layer=0;layer<3;layer++){
  const pos=[],col=[],idx=[],segments=120,rows=5;
  for(let z=0;z<=rows;z++)for(let i=0;i<=segments;i++){const x=-65+i*1.8,t=i*.23+layer*.9,peak=5+Math.abs(Math.sin(t*.41))*5+Math.abs(Math.sin(t*.93))*3+Math.sin(t*2.7)*.7,y=peak*Math.sin(z/rows*Math.PI/2)*(1+layer*.18);pos.push(x,y-.2,-25-layer*10-z*3.8);const c=new T.Color(layer===0?'#70877d':layer===1?'#849890':'#9baaa1');c.multiplyScalar(.87+.13*Math.sin(t*.7)+z*.024);col.push(c.r,c.g,c.b);}
  for(let z=0;z<rows;z++)for(let i=0;i<segments;i++){const a=z*(segments+1)+i,b=a+segments+1;idx.push(a,b,a+1,a+1,b,b+1);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('color',new T.Float32BufferAttribute(col,3));geo.setIndex(idx);geo.computeVertexNormals();mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide}),0,0,0,root);
 }
 // Two lanes and a guard rail become visible near the motorway.
 box(46,.08,6.4,palette.road,95,-.01,-6.2,built);
 for(let x=74;x<118;x+=3.7)box(1.6,.015,.14,palette.white,x,.04,-6.2,built);
 for(const z of[-3.1,-9.3])box(46,.012,.12,palette.white,95,.045,z,built);
 for(let x=72;x<119;x+=2){box(.1,.78,.1,palette.metal,x,.39,-2.85,built);box(2.05,.21,.09,palette.stone,x+1,.64,-2.85,built);}
 for(const x of[92,97])box(.08,3.15,.08,palette.metal,x,1.58,-3,built);
 box(5.8,1.5,.16,sign(['A410  →','ANNECY • GENÈVE'],5.8,1.5,'#285e7a','#fff8e9'),94.5,3,-3,built);
 for(const x of[18,28,57,69]){box(.12,2,.12,palette.wood,x,1,-3,built);box(1.3,.4,.08,sign(['LA ROCHE-SUR-FORON →'],1.3,.4),x,1.9,-2.92,built);}
 // Keep the single chapter reference already present in the old game.
 for(const x of[48.4,51.6])box(.1,2.7,.1,palette.wood,x,1.35,-2.8,built);
 box(4,2.2,.14,sign(['Chapitre 1 —','« La salle d’attente »','pages 7–9'],4,2.2),50,2.2,-2.7,built);
 for(const x of[-11,13,23,63]){box(.07,3.8,.07,palette.metal,x,1.9,-2.5,built);box(.55,.12,.3,palette.metal,x+.17,3.85,-2.5,built);box(.42,.06,.25,palette.white,x+.17,3.77,-2.5,built);}
 for(let x=19;x<71;x+=3.3){box(.11,.95,.11,palette.wood,x,.47,-3.5,built);box(3.3,.09,.09,palette.wood,x+1.65,.36,-3.5,built);box(3.3,.09,.09,palette.wood,x+1.65,.77,-3.5,built);}
 let seed=310;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 // Layered firs, leafy trees, meadow flowers, stones and tufts.
 for(let i=0;i<46;i++){const x=-17+rand()*140,z=-5-rand()*17;if(x<14&&z>-12)continue;if(picnicSpots.some(p=>Math.abs(x-p.x)<3.6&&Math.abs(z-p.z)<3.6))continue;const h=2+rand()*4;
 bar(V(x,0,z),V(x,h*.8,z),.07+rand()*.09,palette.wood,built);
 if(i%3===0){for(let k=0;k<3;k++)mesh(new T.ConeGeometry(h*(.27-k*.055),h*.48,7),i%2?palette.leaf:palette.metal,x,h*(.4+k*.19),z,built);}
 else{ball(h*.34,h*.35,h*.29,i%2?palette.leaf:palette.grass,x,h*.75,z,built);ball(h*.28,h*.28,h*.28,palette.leaf,x-.4,h*.6,z+.3,built);}
 }
 const flowers=[material('#dfc275'),material('#ede6cf'),material('#b88e86')];
 for(let i=0;i<400;i++){const x=-15+rand()*130,z=(i%2?1:-1)*(2.3+rand()*1.6);if(x>73&&z<0)continue;const h=.08+rand()*.17;box(.025,h,.025,palette.leaf,x,h/2,z,built);if(i%3===0)ball(.055,.03,.05,flowers[i%3],x,h,z,built);else if(i%4===0)ball(.09,.05,.06,palette.stone,x,.04,z,built);}
 mergeStatic(built,true);
 return built;
}

const pose=poseRunner;
function makeHead(person,role){const h=person.h,head=new T.Group();person.group.add(head);const teen=role==='hero',skin=material(person.colors.skin||(teen?'#c18b68':role==='white'?'#d4af8e':'#c7a084')),hair=material(person.colors.hair||(teen?'#292018':role==='white'?'#766553':'#68645c')),eye=material('#292b25'),ivory=material('#efe7d9'),lip=material('#895c4e');
 const e=(x,y,z,rx,ry,rz,m)=>ball(rx*h,ry*h,rz*h,m,x*h,y*h,z*h,head);
 e(0,.865,0,.078,.104,.076,skin);e(0,.795,.021,.052,.038,.052,skin);e(0,.765,0,.033,.048,.032,skin);
 for(const s of[-1,1]){e(s*.077,.852,0,.016,.025,.014,skin);e(s*.031,.876,.069,.017,.009,.009,ivory);e(s*.031,.876,.078,.006,.007,.004,eye);e(s*.03-.002,.879,.081,.002,.002,.002,ivory);bar(V(s*.014*h,.896*h,.07*h),V(s*.05*h,.895*h,.068*h),.0026*h,hair,head);}
 e(0,.85,.079,.012,.022,.017,skin);bar(V(-.018*h,.816*h,.067*h),V(.019*h,.818*h,.068*h),.002*h,lip,head);
 e(0,.929,-.012,.08,.055,.078,hair);
 if(teen){const light=material('#38271b'),dark=material('#211710');for(let i=0;i<43;i++){const u=(i+.5)/43,t=Math.acos(1-u*1.06),phi=i*2.39996323;const x=Math.sin(t)*Math.cos(phi)*.08,y=.938+Math.cos(t)*.046,z=-.009+Math.sin(t)*Math.sin(phi)*.073,r=.017+(i%4)*.0013,m=i%4===0?light:i%4===1?dark:hair;e(x,y,z,r,r*.88,r*.86,m);e(x+r*.27,y+r*.11,z+r*.34,r*.58,r*.49,r*.49,i%3?hair:light);}for(let i=0;i<7;i++)e((i-3)*.021,.927-Math.abs(i-3)*.002,.06-Math.abs(i-3)*.003,.017,.019,.018,i%2?hair:light);for(const s of[-1,1])for(let i=0;i<3;i++)e(s*.078,.913-i*.016,-.01-i*.004,.015,.017,.017,hair);}

 else{for(const s of[-1,1])e(s*.071,.898,-.026,.013,.039,.038,hair);const sheen=material(role==='white'?'#87735c':'#807c72');for(let i=0;i<6;i++)e(-.052+i*.019,.94+(i<3?.009:0),.033-i*.004,.025,.025,.043,i%3===0?sheen:hair);if(role==='suit'){for(const s of[-1,1]){const ring=mesh(new T.TorusGeometry(.021*h,.0025*h,4,12),palette.metal,s*.033*h,.876*h,.082*h,head);ring.scale.y=.7;}bar(V(-.013*h,.878*h,.084*h),V(.013*h,.878*h,.084*h),.002*h,palette.metal,head);}}
 // Merge before attaching to the animated head bone; each face keeps its proportions.
 head.scale.set(.82,.86,.84);head.position.y=h*.86*(1-.86);mergeStatic(head);person.group.updateMatrixWorld(true);person.bones.head.bone.attach(head);
}
function person(asset,h,role,root,colors={}){const model=clone(asset.scene);model.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(model),scale=h/bounds.getSize(new T.Vector3()).y;model.scale.multiplyScalar(scale);model.position.y-=bounds.min.y*scale;
 const group=new T.Group();group.add(model);root.add(group);const bones={};model.traverse(b=>{if(b.isBone)bones[b.name]={bone:b,rest:b.quaternion.clone()};});
 const p={group,model,bones,h,colors};
 model.traverse(m=>{if(!m.isSkinnedMesh)return;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;const g=m.geometry.clone(),j=g.attributes.skinIndex,w=g.attributes.skinWeight,pos=g.attributes.position;const vertexColors=[];const names=m.skeleton.bones.map(x=>x.name);const headIndices=new Set(names.map((n,i)=>['head','eyes','eyebrows'].includes(n)?i:-1));const isHead=i=>{let weight=0;for(let k=0;k<4;k++)if(headIndices.has(j.getComponent(i,k)))weight+=w.getComponent(i,k);return weight>.35;};const keep=[];for(let i=0;i<g.index.count;i+=3){const a=g.index.array.slice(i,i+3);if(!a.some(isHead))keep.push(...a);}g.setIndex(keep);
  for(let i=0;i<pos.count;i++){let bone='',max=-1;for(let k=0;k<4;k++){if(w.getComponent(i,k)>max){max=w.getComponent(i,k);bone=names[j.getComponent(i,k)];}}const skin=/Hand|finger|Finger|thumb|neck/.test(bone),leg=/Thigh|calf|Pelvis/.test(bone),shoe=/Foot|ball|toes/.test(bone);const color=new T.Color(skin?(colors.skin||(role==='hero'?'#c18b68':'#d0aa87')):shoe?'#303732':leg?(colors.pants||(role==='hero'?'#3e5966':'#434c49')):(colors.shirt||(role==='hero'?'#b95f48':role==='white'?'#eee9dc':'#354641')));vertexColors.push(color.r,color.g,color.b);}
  g.setAttribute('color',new T.Float32BufferAttribute(vertexColors,3));m.geometry=g;m.material=new T.MeshStandardMaterial({vertexColors:true,roughness:.91});
 });
 // Slimmer teenage build, never a stretched child body.
 if(role==='hero'){model.scale.x*=.85;model.scale.z*=.86;}else if(role==='suit'){model.scale.x*=1.08;}
 makeHead(p,role);
 // Small tailoring details follow the chest bone.
 const detail=new T.Group();group.add(detail);
 const panel=(points,mat)=>{const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points.flatMap(([x,y,z])=>[x*h,y*h,z*h]),3));geo.setIndex([0,1,2]);geo.computeVertexNormals();mesh(geo,mat,0,0,0,detail);};
 if(role==='suit'){
  const shirt=material('#dfdacd',{side:T.DoubleSide}),tie=material('#9b775e',{side:T.DoubleSide}),lapel=material('#41524a',{side:T.DoubleSide});
  panel([[-.062,.74,.113],[.062,.74,.113],[0,.585,.119]],shirt);
  panel([[-.012,.716,.125],[.012,.716,.125],[0,.689,.13]],tie);panel([[-.008,.69,.128],[.01,.69,.128],[.007,.6,.128]],tie);
  panel([[-.07,.74,.12],[-.11,.655,.12],[-.012,.59,.125]],lapel);panel([[.07,.74,.12],[.11,.655,.12],[.012,.59,.125]],lapel);
 }else if(role==='white'){
  box(.021*h,.18*h,.012*h,stoneTrim,0,h*.64,h*.106,detail);
  for(let i=0;i<4;i++)ball(.004*h,.004*h,.004*h,palette.dark,0,h*.7-i*.055*h,h*.119,detail);
  const collar=material('#e5e0d4',{side:T.DoubleSide});panel([[-.06,.745,.118],[-.01,.72,.125],[-.045,.679,.125]],collar);panel([[.06,.745,.118],[.01,.72,.125],[.045,.679,.125]],collar);
 }else{
  const rim=material('#854738');bar(V(-.045*h,.739*h,.107*h),V(0,.725*h,.118*h),.009*h,rim,detail);bar(V(0,.725*h,.118*h),V(.045*h,.739*h,.107*h),.009*h,rim,detail);
 }

 group.updateMatrixWorld(true);bones.spine_03.bone.attach(detail);
 return p;
}

export class Chase3D{
 constructor(canvas){
  this.canvas=canvas;this.ready=false;this.lastTime=0;this.frame=0;
  try{this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch{this.renderer=new SoftwareRenderer({canvas});this.software=true;}this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.17;
  this.world=new T.Scene();this.world.background=new T.Color('#d3ded3');this.world.fog=new T.Fog('#d3ded3',40,90);this.camera=new T.PerspectiveCamera(38,16/9,.1,100);
  this.world.add(new T.HemisphereLight('#fff0d8','#66724e',2.6));this.sun=new T.DirectionalLight('#ffe6bd',3.1);this.sun.position.set(-7,12,8);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:65});this.sun.shadow.normalBias=.035;this.sun.shadow.bias=-.00015;this.world.add(this.sun,this.sun.target);
  landscape(this.world);this.people=[];this.cars=[car(82,-4.8,'#8f5348',this.world,'r5'),car(100,-7.8,'#698b97',this.world,'fiesta')];this.cars[1].rotation.y=Math.PI;for(const c of this.cars){c.position.y=.025;c.userData.shadow=decal(4.4,1.85,softShadow,c.position.x,.045,c.position.z,this.world,true);}
  const loader=new GLTFLoader();
  Promise.all(['tree','bush'].map(n=>loader.loadAsync('assets/marmousets/'+n+'.glb'))).then(([tree,bush])=>{
   // Give the imported vegetation its own leafy palette instead of the generic grey atlas swatches.
   for(const [source,isBush]of [[tree,false],[bush,true]]){source.scene.updateMatrixWorld(true);const b=new T.Box3().setFromObject(source.scene),height=b.max.y-b.min.y;source.scene.traverse(m=>{if(!m.isMesh)return;const geometry=m.geometry.clone(),pos=geometry.attributes.position,colors=[],v=new T.Vector3();for(let j=0;j<pos.count;j++){v.fromBufferAttribute(pos,j).applyMatrix4(m.matrixWorld);const leafy=isBush||(v.y-b.min.y)/height>.32;const c=new T.Color(leafy?(isBush?'#65804d':'#55754c'):'#796652');c.multiplyScalar(.91+.12*Math.sin(v.x*3+v.z*2+v.y));colors.push(c.r,c.g,c.b);}geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));m.geometry=geometry;m.material=new T.MeshStandardMaterial({vertexColors:true,roughness:.95});});}

   for(let i=0;i<45;i++){const isBush=i%3===0,source=isBush?bush:tree,obj=source.scene.clone(true),x=-12+i*2.8,z=isBush?-3.1-(i%2)*.6:-7-(i%5)*2.1;if(x<12&&!isBush)continue;if(picnicSpots.some(p=>Math.abs(x-p.x)<3.6&&Math.abs(z-p.z)<3.6))continue;obj.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(obj),height=isBush?.5+(i%3)*.14:3.6+(i%4)*.45,scale=height/bounds.getSize(new T.Vector3()).y;obj.scale.multiplyScalar(scale);obj.position.set(x,-bounds.min.y*scale,z);obj.rotation.y=i*1.7;obj.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});this.world.add(obj);}
  }).catch(error=>console.warn('Végétation complémentaire indisponible',error));
  this.loading=loader.loadAsync('assets/marmousets/adult.glb').then(a=>{this.hero=person(a,1.40,'hero',this.world);this.white=person(a,1.93,'white',this.world);this.suit=person(a,1.66,'suit',this.world);this.people=[this.hero,this.white,this.suit];addPicnickers(a,this.world);for(const p of this.people){p.shadow=decal(.95,.48,softShadow,0,.03,0,this.world,true);}this.walkman=new T.Group();this.hero.group.add(this.walkman);pose(this.hero,0,false);box(.16,.2,.065,material('#d4ad68'),-.18,.48,.13,this.walkman);box(.12,.085,.012,palette.dark,-.18,.51,.169,this.walkman);this.hero.group.updateMatrixWorld(true);this.hero.bones.Hand_R.bone.attach(this.walkman);this.walkman.visible=false;this.headphones=new T.Group();this.hero.group.add(this.headphones);const arc=mesh(new T.TorusGeometry(.118,.01,5,24,Math.PI),palette.dark,0,1.22,0,this.headphones);for(const s of[-1,1])box(.035,.1,.07,palette.dark,s*.113,1.20,0,this.headphones);this.headphones.visible=false;this.ready=true;canvas.dataset.renderer='3d';}).catch(error=>{this.error=error;console.error('A410 characters could not load',error);});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.error=new Error('WebGL context lost');});
 }
 bubbleAnchor(speaker){if(!this.ready)return null;const p=speaker?this.suit:this.white;const v=p.group.position.clone().add(V(0,p.h+.18,0)).project(this.camera);return {x:clamp((v.x+1)/2,.12,.83)*100,y:clamp((1-v.y)/2,.12,.75)*100};}
 draw(run,phase,time,reduced=false){
  if(this.error)throw this.error;
  if(this.software&&performance.now()-this.lastDraw<80)return;this.lastDraw=performance.now();
  const w=this.canvas.clientWidth,h=this.canvas.clientHeight;if(!w||!h)return;if(w&&h&&(this.width!==w||this.height!==h)){this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.width=w;this.height=h;}
  const x=(run?.distance||0)*.24,escaped=phase==='escaped',running=phase==='running',moving=['running','paused'].includes(phase)&&!run?.stopRemaining,t=run?.elapsed||0;
  const focus=x-1.1,zoom=escaped?1-clamp(time/1.2)*.13:1,opening=1-clamp((run?.distance||0)/70);this.camera.position.set(focus+1.15,(3.9+opening*1.3)*zoom,(10.5+opening*3.6)*zoom);this.camera.lookAt(focus,2.0+opening*1.8,0);this.sun.position.set(x-7,12,8);this.sun.target.position.set(x,0,0);this.sun.target.updateMatrixWorld();
  if(this.ready){const gap=clamp((run?.gap??27)*.078,1.05,3.6);this.hero.group.position.set(x,0,.55);this.hero.group.rotation.set(0,escaped?.45:(run?.direction||1)*Math.PI/2,0);pose(this.hero,t,moving,escaped||run?.stopRemaining>0,reduced);this.walkman.visible=escaped;this.headphones.visible=escaped&&time>.8;
   for(const[p,offset,z]of[[this.white,0,.1],[this.suit,1.1,-.55]]){p.group.visible=!escaped;p.group.position.set(x-gap-offset,.04,z);const trip=(run?.tripRemaining||0)>0;const a=trip?Math.min(clamp((2-run.tripRemaining)/.34),clamp(run.tripRemaining/.3))*1.4:0;p.group.rotation.set(a,Math.PI/2,0,'YXZ');pose(p,t+offset,['running','paused'].includes(phase)&&!trip,false,reduced);if(trip)p.group.position.y=.08;}
  }
  for(const p of this.people){p.shadow.visible=p.group.visible;p.shadow.position.set(p.group.position.x+.16,.035,p.group.position.z+.12);}
  this.cars[0].position.x=74+(t*3.3)%45;this.cars[1].position.x=116-(t*2.7)%43;rollCar(this.cars[0],t*3.3);rollCar(this.cars[1],t*2.7);for(const c of this.cars)c.userData.shadow.position.x=c.position.x;this.renderer.render(this.world,this.camera);
 }
}
