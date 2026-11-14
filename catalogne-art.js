// Mediterranean materials and street furniture. All geometry stays decorative.
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {surface,shadowMaterial} from './a410-materials.js';
import {createCar} from './a410-cars.js';
export const PICNICS=[{x:-13.2,z:9,a:.14},{x:13.4,z:59,a:-.25},{x:-13.2,z:94,a:.22}];
const V=(x,y,z)=>new T.Vector3(x,y,z),boxGeo=new T.BoxGeometry(1,1,1),orb=new T.IcosahedronGeometry(1,1),cache=new Map();
const flat=c=>{if(!cache.has(c))cache.set(c,new T.MeshStandardMaterial({color:c,roughness:.85}));return cache.get(c);};
export const materials={stone:surface('stone','#cbbca0',2.1,43),paving:surface('stone','#d5c9ad',2.7,78),sand:surface('asphalt','#cfbea0',2.2,31),wood:surface('wood','#87664d',1.1,41),iron:surface('metal','#3e544f',1,14),grass:surface('grass','#89936b',2.8,43),bark:surface('wood','#77684f',1.4,15),water:surface('asphalt','#6eaaa8',2.5,25),shadow:shadowMaterial()};
materials.water.roughness=.23;materials.water.metalness=.12;
export function mesh(g,mat,x,y,z,parent,scale){const m=new T.Mesh(g,mat);m.position.set(x,y,z);if(scale)m.scale.set(...scale);m.castShadow=!mat.transparent;m.receiveShadow=true;parent.add(m);return m;}
export function block(p,x,y,z,w,h,d,mat){if(typeof mat!=='object')mat=flat(mat);let g=boxGeo;const size=mat.userData.tileMeters;if(size){g=boxGeo.clone();const uv=g.attributes.uv,n=g.attributes.normal;for(let i=0;i<uv.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i));uv.setXY(i,uv.getX(i)*(nx>.5?d:w)/size,uv.getY(i)*(ny>.5?d:h)/size);}}return mesh(g,mat,x,y,z,p,[w,h,d]);}
const ball=(p,x,y,z,w,h,d,mat)=>mesh(orb,typeof mat==='object'?mat:flat(mat),x,y,z,p,[w,h,d]);
const cylinder=(p,x,y,z,r,h,mat)=>mesh(new T.CylinderGeometry(r,r,h,12),typeof mat==='object'?mat:flat(mat),x,y,z,p);
export function rod(p,a,b,r,mat){const delta=b.clone().sub(a),m=mesh(new T.CylinderGeometry(r,r,delta.length(),7),typeof mat==='object'?mat:flat(mat),...a.clone().add(b).multiplyScalar(.5).toArray(),p);m.quaternion.setFromUnitVectors(V(0,1,0),delta.normalize());return m;}
export function contact(p,x,z,w,d,y=.048){const m=mesh(new T.PlaneGeometry(w,d),materials.shadow,x,y,z,p);m.rotation.x=-Math.PI/2;m.castShadow=false;return m;}
export function batchStatic(group){
 group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),sets=new Map();
 group.traverse(m=>{if(!m.isMesh||m.isSkinnedMesh||m.isInstancedMesh)return;const key=m.material.uuid+':'+m.castShadow;const batch=sets.get(key)||{material:m.material,shadow:m.castShadow,geos:[]};let geo=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();if(!geo.attributes.uv)geo.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));geo.applyMatrix4(inverse.clone().multiply(m.matrixWorld));batch.geos.push(geo);sets.set(key,batch);});
 group.clear();for(const b of sets.values()){const geo=mergeGeometries(b.geos);b.geos.forEach(g=>g.dispose());if(!geo)throw Error('Incompatible decorative geometry');const m=mesh(geo,b.material,0,0,0,group);m.castShadow=b.shadow;}
}
export function detailedBench(root,x,z,side=1){
 const g=new T.Group();g.position.set(x,0,z);g.rotation.y=side<0?Math.PI:0;root.add(g);
 for(let i=0;i<5;i++)block(g,0,.46,-.20+i*.10,2,.065,.082,materials.wood);
 for(let i=0;i<4;i++)block(g,0,.66+i*.11,-.26-i*.02,2,.082,.045,materials.wood);
 for(const s of[-1,1]){
  rod(g,V(s*.75,.05,.21),V(s*.75,.92,-.30),.035,materials.iron);rod(g,V(s*.75,.05,-.31),V(s*.75,.47,.16),.035,materials.iron);
  rod(g,V(s*.94,.48,.22),V(s*.94,.70,.20),.025,materials.iron);rod(g,V(s*.94,.70,.20),V(s*.94,.74,-.30),.025,materials.iron);
  for(let i=0;i<4;i++)ball(g,s*.75,.66+i*.11,-.23-i*.02,.012,.012,.012,'#c8c2a4');
 }
 contact(g,0,0,2.6,1.4);return g;
}
export function detailedLamp(root,x,z){
 const g=new T.Group();root.add(g);g.position.set(x,0,z);
 cylinder(g,0,.11,0,.20,.22,materials.stone);cylinder(g,0,.40,0,.11,.60,materials.iron);cylinder(g,0,2.25,0,.055,3.7,materials.iron);
 for(const y of[.72,3.55,3.91])cylinder(g,0,y,0,.092,.08,materials.iron);
 rod(g,V(0,3.85,0),V(.48,4.20,0),.04,materials.iron);rod(g,V(0,3.85,0),V(-.48,4.20,0),.04,materials.iron);
 for(const s of[-1,1]){
  block(g,s*.48,4.32,0,.25,.38,.25,'#d8dbc0');block(g,s*.48,4.09,0,.32,.06,.32,materials.iron);mesh(new T.ConeGeometry(.25,.17,4),materials.iron,s*.48,4.60,0,g);
  for(const a of[-1,1])for(const b of[-1,1])rod(g,V(s*.48+a*.13,4.12,b*.13),V(s*.48+a*.13,4.53,b*.13),.014,materials.iron);
  ball(g,s*.48,4.72,0,.04,.07,.04,materials.iron);
 }
}
function bin(p,x,z){cylinder(p,x,.38,z,.24,.72,materials.iron);cylinder(p,x,.77,z,.27,.065,materials.iron);for(let i=0;i<14;i++){const a=i*Math.PI/7;rod(p,V(x+Math.cos(a)*.245,.09,z+Math.sin(a)*.245),V(x+Math.cos(a)*.245,.71,z+Math.sin(a)*.245),.009,'#849085');}contact(p,x,z,.8,.8);}
function palm(p,x,z,h=6.4){
 const g=new T.Group();p.add(g);g.position.set(x,0,z);
 mesh(new T.CylinderGeometry(.14,.30,h,10),materials.bark,0,h/2,0,g);
 for(let i=0;i<18;i++){const r=.30-(i/18)*.15;mesh(new T.TorusGeometry(r,.017,4,10),materials.bark,0,h*i/18,0,g).rotation.x=Math.PI/2;}
 for(let i=0;i<10;i++){const angle=i*Math.PI/5,points=[];for(let j=0;j<=8;j++){const u=j/8;points.push(V(Math.cos(angle)*u*3,h+.7*Math.sin(u*Math.PI)-u*.75,Math.sin(angle)*u*3));}const stem=new T.CatmullRomCurve3(points);mesh(new T.TubeGeometry(stem,8,.023,4,false),flat('#6d784d'),0,0,0,g);
  for(let j=2;j<8;j++){const u=j/8,a=points[j],w=(1-u*.6)*.7;for(const s of[-1,1]){const end=a.clone().add(V(Math.cos(angle+Math.PI/2)*s*w,-.13,Math.sin(angle+Math.PI/2)*s*w));const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([...a.toArray(),...end.toArray(),...a.clone().add(V(Math.cos(angle)*.35,-.06,Math.sin(angle)*.35)).toArray()],3));geo.computeVertexNormals();const mat=flat(i%2?'#617b4f':'#748b58');mat.side=T.DoubleSide;mesh(geo,mat,0,0,0,g);}}
 }
 contact(g,0,0,4.9,4.9);return g;
}
function picnic(p,spot){const g=new T.Group();p.add(g);g.position.set(spot.x,0,spot.z);g.rotation.y=spot.a;
 for(let i=0;i<5;i++)block(g,0,.79,(i-2)*.165,2.25,.065,.15,materials.wood);
 for(const s of[-1,1]){for(let i=0;i<2;i++)block(g,0,.46,s*.80+(i-.5)*.15,2.3,.075,.14,materials.wood);for(const x of[-.77,.77]){rod(g,V(x,.76,s*.22),V(x,.04,s*.64),.052,materials.wood);block(g,x,.36,0,.12,.08,1.94,materials.wood);}}
 for(const x of[-.5,.5]){cylinder(g,x,.835,.05,.12,.015,'#ddd8c5');cylinder(g,x+.17,.89,-.10,.043,.10,'#8f7756');}
 block(g,.55,.94,.13,.30,.21,.23,materials.wood);mesh(new T.TorusGeometry(.13,.012,5,12,Math.PI),materials.wood,.55,1.02,.13,g);block(g,-.13,.844,0,.43,.016,.30,'#c9c5b2');for(let i=0;i<7;i++)block(g,-.20,.854,-.11+i*.032,.19,.004,.004,'#8a8b7c');cylinder(g,-.05,.98,-.25,.042,.28,'#65766a');contact(g,0,0,3.4,2.6);
}
function flowerbed(p,x,z){
 const g=new T.Group();p.add(g);g.position.set(x,0,z);block(g,0,.12,0,3.2,.22,1.3,materials.stone);block(g,0,.25,0,2.95,.08,1.05,'#706d4e');
 for(let i=0;i<27;i++){const xx=-1.35+(i%9)*.33,zz=-.36+Math.floor(i/9)*.35;rod(g,V(xx,.28,zz),V(xx,.49+(i%3)*.04,zz),.014,'#667748');ball(g,xx,.54+(i%3)*.035,zz,.10,.065,.10,i%4===0?'#c9906b':i%3?'#b8ad76':'#b77c73');}
}
function kiosk(p,x,z){
 const g=new T.Group();g.position.set(x,0,z);p.add(g);block(g,0,.12,0,2.8,.24,2.0,materials.stone);block(g,0,1.35,0,2.4,2.4,1.7,materials.iron);block(g,0,1.60,-.88,2.0,1.22,.05,'#b7b5a3');
 for(let i=0;i<12;i++){const xx=-.8+(i%4)*.52,yy=1.12+Math.floor(i/4)*.35;block(g,xx,yy,-.94,.42,.28,.03,i%3===0?'#c5a078':'#e1d9bf');for(let j=0;j<3;j++)block(g,xx,yy-.055+j*.05,-.96,.31,.014,.005,'#7a8075');}
 block(g,0,2.69,0,2.9,.16,2.1,materials.iron);mesh(new T.ConeGeometry(2.02,.65,4),materials.iron,0,3.09,0,g).rotation.y=Math.PI/4;ball(g,0,3.48,0,.10,.16,.10,materials.iron);block(g,0,.99,-1.10,2.5,.12,.48,materials.wood);contact(g,0,0,4.4,3.6);
}
export function addPlaceDetails(root){
 const details=new T.Group();root.add(details);
 for(const spot of PICNICS)picnic(details,spot);
 for(const [x,z]of[[-14,18],[14,8],[-14,55],[14,98],[-14,124]])palm(details,x,z,5.3+(z%3)*.4);
 for(const [x,z]of[[-9.3,7],[9.3,31],[-9.3,58],[9.3,87],[-9.3,115]]){flowerbed(details,x,z);bin(details,x+2,z+1.8);}
 kiosk(details,12.8,-2.5);
 // Textured basin coping, bronze jets and ripples around the existing side fountain.
 for(let i=0;i<32;i++){const a=i*Math.PI/16;const s=block(details,19+Math.cos(a)*4.55,1.22,36+Math.sin(a)*4.55,.9,.16,.52,materials.stone);s.rotation.y=-a;}
 for(let i=0;i<8;i++){const a=i*Math.PI/4,x=19+Math.cos(a)*3.2,z=36+Math.sin(a)*3.2;const pts=[V(x,1.27,z),V(x*.45+19*.55,2.1,z*.45+36*.55),V(19,1.25,36)];mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),10,.018,4,false),flat('#b6d4c7'),0,0,0,details);}
 // A quiet perimeter road, outside the clients' routes, with credible period hatchbacks.
 block(details,35,.018,64,6,.035,160,materials.sand);for(const x of[31.9,38.1])block(details,x,.10,64,.18,.20,160,materials.stone);
 for(const [i,z]of[19,47,90,120].entries()){const car=createCar(34.9,z,['#b5ac8b','#7a594c','#52757d','#a6a8a1'][i],details,i%2?'fiesta':'r5');car.rotation.y=Math.PI/2;contact(details,34.9,z,2.3,4.8);}
 batchStatic(details);return details;
}
export function decorateTile(root){
 for(const x of[-2.58,2.58,-8.0,-4.4,4.4,8.0])block(root,x,.065,0,.12,.08,64.7,materials.stone);
 for(const z of[-18,14])for(const x of[-3.4,3.4]){cylinder(root,x,.06,z,.19,.10,materials.iron);}
 batchStatic(root);
}

export function canopyGeometry(){
 const pieces=[];for(const [x,y,z,sx,sy,sz] of [[0,.25,0,.85,.94,.82],[-.55,-.05,.10,.65,.75,.69],[.53,-.05,-.05,.73,.81,.67],[0,-.26,.52,.72,.72,.68],[.04,-.10,-.50,.70,.83,.64]]){const g=new T.IcosahedronGeometry(1,1);g.scale(sx,sy,sz);g.translate(x,y,z);pieces.push(g);}const merged=mergeGeometries(pieces);merged.userData.softwareLOD=new T.IcosahedronGeometry(1,0);return merged;
}

export function trunkGeometry(){
 const parts=[new T.CylinderGeometry(.64,1,1,9)];
 for(const [x,y,z]of [[-4.6,.59,1.9],[3.9,.68,-1.7],[1.6,.53,4.0]]){const a=V(0,.08,0),b=V(x,y,z),d=b.clone().sub(a),g=new T.CylinderGeometry(.22,.52,d.length(),6),q=new T.Quaternion().setFromUnitVectors(V(0,1,0),d.clone().normalize());g.applyQuaternion(q);g.translate(...a.add(b).multiplyScalar(.5).toArray());parts.push(g);}const merged=mergeGeometries(parts);merged.userData.softwareLOD=new T.CylinderGeometry(.64,1,1,5);return merged;
}
