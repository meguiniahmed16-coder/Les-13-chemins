// Small period hatchbacks: sculpted bodies, open wheel arches, sloping glazing and proper trim.
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const mat=(color,options={})=>new T.MeshStandardMaterial({color,roughness:.72,...options});
const rubber=mat('#262c2b'),trim=mat('#424a47'),silver=mat('#b9bcb3',{metalness:.6,roughness:.38}),glass=mat('#435e66',{metalness:.22,roughness:.22,side:T.DoubleSide}),reflection=mat('#9faeab',{metalness:.15,roughness:.28,side:T.DoubleSide}),red=mat('#9e352c',{roughness:.3}),amber=mat('#d28d3d',{roughness:.32}),lamp=mat('#e6e2cc',{metalness:.2,roughness:.22});
function mesh(g,m,p,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
function box(w,h,d,m,p,x,y,z,r=.02){return mesh(r?new RoundedBoxGeometry(w,h,d,1,Math.min(r,w*.22,h*.22,d*.22)):new T.BoxGeometry(w,h,d),m,p,x,y,z);}
function panel(points,m,p){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();return mesh(g,m,p);}
function line(a,b,r,m,p){const v=new T.Vector3(...b).sub(new T.Vector3(...a));const o=mesh(new T.CylinderGeometry(r,r,v.length(),6),m,p,...a.map((x,i)=>(x+b[i])/2));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
function batch(group){group.updateMatrixWorld(true);const bins=new Map();group.traverse(o=>{if(!o.isMesh)return;let b=bins.get(o.material.uuid);if(!b){b={material:o.material,items:[]};bins.set(o.material.uuid,b);}const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();if(!g.attributes.uv)g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));g.applyMatrix4(o.matrixWorld);b.items.push(g);});group.clear();for(const b of bins.values()){const g=mergeGeometries(b.items);b.items.forEach(x=>x.dispose());mesh(g,b.material,group);}}
export function createCar(x,z,color,parent,kind='r5'){
 const root=new T.Group(),body=new T.Group();root.add(body);
 const fiesta=kind==='fiesta',L=fiesta?3.74:3.59,W=fiesta?1.61:1.55;
 const rear=-L/2,front=L/2,rearAxle=fiesta?-1.18:-1.16,frontAxle=fiesta?1.20:1.16;
 const paint=mat(color,{roughness:.38,metalness:.27,side:T.DoubleSide}),roofRear=fiesta?-1.06:-1.13,roofFront=fiesta?.33:.31,roofY=fiesta?1.36:1.40;
 const bodyShape=new T.Shape();bodyShape.moveTo(rear+.07,.31);
 for(const axle of [rearAxle,frontAxle]){bodyShape.lineTo(axle-.34,.31);bodyShape.absarc(axle,.31,.34,Math.PI,0,true);}
 bodyShape.lineTo(front-.07,.31);bodyShape.lineTo(front,.44);bodyShape.lineTo(front-.04,.70);bodyShape.lineTo(front-.19,.79);bodyShape.lineTo(.87,.88);bodyShape.lineTo(rear+.24,.88);bodyShape.lineTo(rear+.02,.73);bodyShape.lineTo(rear,.45);bodyShape.closePath();
 const shell=new T.ExtrudeGeometry(bodyShape,{depth:W-.08,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:12});shell.translate(0,0,-(W-.08)/2);mesh(shell,paint,body);
 // Roof and pillars taper inward instead of a rectangular box placed on the bonnet.
 const roofHalf=W*.39,baseHalf=W*.48;
 box(roofFront-roofRear+.12,.065,roofHalf*2,paint,body,(roofFront+roofRear)/2,roofY,0,.025);
 for(const side of [-1,1]){
  const at=(x,y,extra=0)=>[x,y,side*(baseHalf-(y-.88)/(roofY-.88)*(baseHalf-roofHalf)+extra)];
  panel([at(rear+.19,.88),at(.91,.88),at(roofFront,roofY-.018),at(roofRear,roofY-.018)],paint,body);
  const pillar=fiesta?-.26:-.36;
  const windows=[[[rear+.30,.94],[pillar-.07,.94],[pillar-.07,roofY-.10],[roofRear+.075,roofY-.10]],[[pillar+.005,.94],[.80,.94],[roofFront-.045,roofY-.10],[pillar+.005,roofY-.10]]];
  for(const win of windows){const points=win.map(([a,b])=>at(a,b,.009));panel(points,rubber,body);const cx=win.reduce((s,p)=>s+p[0],0)/4,cy=win.reduce((s,p)=>s+p[1],0)/4;panel(win.map(([a,b])=>at(cx+(a-cx)*.94,cy+(b-cy)*.87,.015)),glass,body);const topL=win[3],topR=win[2];panel([at(topL[0]+.03,topL[1]-.04,.018),at(topR[0]-.03,topR[1]-.04,.018),at(topR[0]-.05,topR[1]-.075,.019),at(topL[0]+.05,topL[1]-.075,.019)],reflection,body);}
  // Door seams, handles, rub strips, filler cap and wing mirror.
  const doorRear=fiesta?-.28:-.54,sideZ=side*(W/2+.006);
  for(const xx of [doorRear,.86])line([xx,.39,sideZ],[xx,.88,sideZ],.007,trim,body);
  line([doorRear,.39,sideZ],[.86,.39,sideZ],.006,trim,body);
  if(fiesta){line([rear+.35,.43,sideZ],[-.30,.43,sideZ],.006,trim,body);line([rear+.35,.43,sideZ],[rear+.35,.87,sideZ],.007,trim,body);box(.17,.038,.025,rubber,body,-.45,.84,sideZ);}
  box(.18,.04,.032,rubber,body,doorRear+.14,.84,sideZ);
  box(2.09,.055,.035,trim,body,-.02,.63,sideZ,.012);
  box(.06,.055,.12,trim,body,.75,.98,side*(baseHalf+.035));box(.20,.13,.13,paint,body,.69,1.015,side*(baseHalf+.10),.025);box(.012,.082,.088,silver,body,.585,1.016,side*(baseHalf+.10),.002);
  const fuel=mesh(new T.CircleGeometry(.065,16),paint,body,rear+.54,.79,side*(W/2+.012));if(side<0)fuel.rotation.y=Math.PI;
  for(const axle of [rearAxle,frontAxle])mesh(new T.TorusGeometry(.335,.018,5,24,Math.PI),trim,body,axle,.31,side*(W/2+.006));
 }
 // Windscreen and rear hatch window, with black seals and fine wipers.
 for(const wind of [{base:.89,top:roofFront,back:false},{base:rear+.18,top:roofRear,back:true}]){
  const points=[[wind.base,.91,-baseHalf+.045],[wind.base,.91,baseHalf-.045],[wind.top,roofY-.06,roofHalf-.045],[wind.top,roofY-.06,-roofHalf+.045]];
  panel(points,rubber,body);const center=new T.Vector3();for(const a of points)center.add(new T.Vector3(...a));center.multiplyScalar(.25);
  panel(points.map(a=>{const v=new T.Vector3(...a).sub(center).multiplyScalar(.92).add(center);v.x+=wind.back?-.008:.008;return v.toArray();}),glass,body);
  if(!wind.back){for(const s of [-1,1])line([.90,.936,s*.18],[.77,1.04,s*.48],.008,rubber,body);}
  else line([wind.base-.012,.95,-.10],[wind.base+.12,1.08,.24],.008,rubber,body);
 }
 // The two models differ in their lights, hatch angle and grille.
 for(const end of [-1,1]){
  const ex=end>0?front:rear;
  box(.16,.18,W+.055,trim,body,ex,.44,0,.028);box(.165,.025,W+.035,silver,body,ex,.50,0,.005);
  box(.018,.10,.39,end>0?lamp:rubber,body,ex+end*.09,.43,0,.002);
  for(let k=0;k<7;k++)box(.006,.038,.024,end>0?trim:lamp,body,ex+end*.101,.43,-.135+k*.045,.001);
 }
 box(.035,.18,.65,rubber,body,front-.001,.69,0,.006);
 for(let j=0;j<4;j++)box(.042,.012,.62,trim,body,front+.014,.63+j*.037,0,.002);
 for(const side of [-1,1]){
  const width=fiesta?.43:.47;
  box(.065,.218,width,rubber,body,front-.014,.702,side*.51,.02);
  box(.072,.18,width-.04,lamp,body,front+.012,.713,side*.51,.015);
  for(let j=0;j<7;j++)box(.004,.14,.007,silver,body,front+.052,.714,side*.51-width*.37+j*width*.12,.001);
  box(.075,.065,width-.04,amber,body,front+.008,.594,side*.51,.01);
  box(.05,fiesta?.30:.39,.14,rubber,body,rear-.021,fiesta?.76:.86,side*(W/2-.11),.012);
  box(.06,fiesta?.25:.33,.105,red,body,rear-.033,fiesta?.76:.86,side*(W/2-.11),.009);
  box(.063,.075,.108,amber,body,rear-.036,.83,side*(W/2-.11),.005);
  box(.063,.055,.108,lamp,body,rear-.036,.73,side*(W/2-.11),.004);
 }
 if(fiesta){const badge=mesh(new T.SphereGeometry(1,12,6),mat('#325b76',{metalness:.2}),body,front+.039,.71,0);badge.scale.set(.014,.023,.055);}
 else{const diamond=mesh(new T.TorusGeometry(.035,.006,4,4),silver,body,front+.043,.71,0);diamond.rotation.y=Math.PI/2;diamond.scale.y=1.35;}
 box(.18,.035,.025,silver,body,rear-.045,.82,.33,.004);
 line([roofFront-.11,roofY+.04,-.30],[roofFront-.18,roofY+.33,-.31],.006,rubber,body);
 box(.11,.07,.12,rubber,body,rear-.045,.24,-.46,.008);
 batch(body);
 const wheels=[];
 for(const axle of [rearAxle,frontAxle])for(const side of [-1,1]){
  const wheel=new T.Group();root.add(wheel);
  const tire=mesh(new T.CylinderGeometry(.288,.288,.18,24),rubber,wheel);tire.rotation.x=Math.PI/2;
  mesh(new T.TorusGeometry(.224,.064,8,24),rubber,wheel,0,0,side*.035);
  const rim=mesh(new T.CylinderGeometry(.175,.175,.025,20),silver,wheel,0,0,side*.103);rim.rotation.x=Math.PI/2;
  const hub=mesh(new T.SphereGeometry(1,16,8),silver,wheel,0,0,side*.125);hub.scale.set(.13,.13,.025);
  for(let k=0;k<8;k++){const a=k*Math.PI/4;mesh(new T.CircleGeometry(.024,7),rubber,wheel,Math.sin(a)*.145,Math.cos(a)*.145,side*.119).rotation.y=side<0?Math.PI:0;}
  for(let k=0;k<4;k++){const a=k*Math.PI/2;const bolt=mesh(new T.SphereGeometry(.012,6,4),trim,wheel,Math.sin(a)*.059,Math.cos(a)*.059,side*.149);}
  // Bake each wheel at its local origin, then place it on its axle so it can rotate.
  root.remove(wheel);batch(wheel);root.add(wheel);wheel.position.set(axle,.293,side*(W/2-.025));wheels.push(wheel);
 }
 root.position.set(x,0,z);root.userData.wheels=wheels;root.userData.kind=kind;parent.add(root);return root;
}
export function rollCar(car,travel){for(const wheel of car.userData.wheels||[])wheel.rotation.z=-travel/.288;}
