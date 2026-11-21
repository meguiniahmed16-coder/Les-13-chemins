import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {readableTextGeometry} from './manifestation-props.js';
import {createParkedCar} from './manifestation-cars.js';
import {PARIS_NODES as nodes,PARIS_STREETS as streets} from './manifestation-walk.js';
const mats=new Map(),texts=new Map(),cube=new T.BoxGeometry(1,1,1),orb=new T.IcosahedronGeometry(1,1);
const material=c=>{if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.88}));return mats.get(c);};
function box(g,x,y,z,w,h,d,c){const m=new T.Mesh(cube,material(c));m.position.set(x,y,z);m.scale.set(w,h,d);g.add(m);return m;}
function ellipse(g,x,y,z,rx,ry,rz,c){const m=new T.Mesh(orb,material(c));m.position.set(x,y,z);m.scale.set(rx,ry,rz);g.add(m);return m;}
function rod(g,a,b,r,c){const d=new T.Vector3(...b).sub(new T.Vector3(...a)),m=new T.Mesh(new T.CylinderGeometry(r,r,d.length(),7),material(c));m.position.copy(new T.Vector3(...a).addScaledVector(d,.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());g.add(m);return m;}
export function streetSign(text,width=5,bg='#193d48',fg='#fff3cf'){
 const key=[text,bg,fg].join(':');let m=texts.get(key);
 if(!m){
  if(typeof document==='undefined')return new T.Mesh(new T.PlaneGeometry(width,width*.23),material(0x214451));
  const c=document.createElement('canvas');c.width=768;c.height=192;const q=c.getContext('2d');
  q.fillStyle=bg;q.fillRect(0,0,768,192);q.strokeStyle=fg;q.lineWidth=5;q.strokeRect(12,12,744,168);
  q.fillStyle=fg;q.textAlign='center';q.font='20px Georgia';q.fillText('PARIS',384,43);q.font='600 41px Georgia';q.fillText(text,384,114,710);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;m=new T.MeshBasicMaterial({map:tex,side:T.FrontSide});texts.set(key,m);
 }
 return new T.Mesh(readableTextGeometry(width,width*.25),m);
}
function sign(g,text,x,y,z,angle=0,width=5,bg,fg){const s=streetSign(text,width,bg,fg);s.position.set(x,y,z);s.rotation.y=angle;g.add(s);return s;}
function mergeStatic(g){
 g.updateMatrixWorld(true);const batches=new Map();
 g.traverse(m=>{if(!m.isMesh)return;const p=m.matrixWorld.elements,key=m.material.uuid+'@'+Math.floor(p[12]/24)+','+Math.floor(p[14]/24);let b=batches.get(key);if(!b){b={mat:m.material,geo:[]};batches.set(key,b);}const geo=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();if(!m.material.map)geo.deleteAttribute('uv');geo.applyMatrix4(m.matrixWorld);b.geo.push(geo);});
 g.clear();g.position.set(0,0,0);g.rotation.set(0,0,0);
 for(const b of batches.values()){const geo=mergeGeometries(b.geo);b.geo.forEach(x=>x.dispose());if(!geo)throw Error('Incompatible Paris geometry');if(geo){geo.computeBoundingSphere();const m=new T.Mesh(geo,b.mat);m.receiveShadow=true;g.add(m);}}
 return g;
}
function segmentDistance(x,z,a,b){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-dx*t,z-a.z-dz*t);}
export function schoolFrontages(start,end,district){
 const view=new T.Group();view.position.z=-66;
 const paris=district.getObjectByName('Quartier');
 for(const cell of paris.children){
  const m=/^Ilot_(-?\d+)_(-?\d+)$/.exec(cell.name);if(!m)continue;
  const x=Number(m[1])*32,z=Number(m[2])*32;
  if(x>=-64&&x<=32&&z<=end+80&&z+32>=start+52)view.add(cell.clone(true));
 }
 return view;
}
function lamp(g,x,z){rod(g,[x,0,z],[x,4.4,z],.065,0x344c48);box(g,x,4.5,z,.40,.65,.40,0xd9bf88);box(g,x,4.87,z,.55,.09,.55,0x344c48);}
const crowns=new Map();
function canopy(seed){
 const key=(seed%5+5)%5;if(crowns.has(key))return crowns.get(key);
 const g=new T.IcosahedronGeometry(1,2),p=g.attributes.position,colors=[];
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),noise=Math.sin(x*9+key*2)*Math.sin(y*11+z*7)+.55*Math.sin(z*14-y*5);
  const r=.94+.15*noise;p.setXYZ(i,x*r,y*r,z*r);
  const tone=.82+.13*y+.075*noise;colors.push(.225*tone,.326*tone,.163*tone);
 }
 g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();crowns.set(key,g);return g;
}
const foliage=new T.MeshStandardMaterial({vertexColors:true,roughness:1});
function tree(g,x,z,seed){
 const roll=Math.sin(x*.63+z*.79);
 rod(g,[x,0,z],[x+.08*roll,3.35,z],.125,0x796e5f);
 for(let i=0;i<3;i++){
  const t=i*Math.PI*2/3+roll,dx=Math.cos(t),dz=Math.sin(t);
  rod(g,[x,2.35,z],[x+dx*.80,3.78+roll*.22,z+dz*.80],.075,0x766a59);
  const lobe=new T.Mesh(canopy(seed+i),foliage);
  lobe.position.set(x+dx*.56,4.03+i*.24,z+dz*.55);lobe.scale.set(1.14,1.35,1.16);g.add(lobe);
 }
}
function metro(g,text,x,z){rod(g,[x,0,z],[x,4.2,z],.09,0x25473c);const m=sign(g,'MÉTRO',x,4.4,z,Math.PI,2.2,'#a34036','#f3dfab');sign(g,text,x,3.7,z,Math.PI,3.3);for(const dx of [-1,1]){rod(g,[x+dx,0,z+1],[x+dx,1.05,z+1],.04,0x294b3f);rod(g,[x+dx,1.05,z+1],[x+dx,1.05,z+3],.04,0x294b3f);}box(g,x,.04,z+2,1.8,.08,2.7,0x263537);return m;}
function bastille(g){
 const root=new T.Group();root.position.set(11,0,230);g.add(root);
 box(root,0,.5,0,7,1,7,0xb9b7a5);box(root,0,1.6,0,4,1.5,4,0x718477);
 const shaft=new T.Mesh(new T.CylinderGeometry(.65,.85,11.5,20),material(0x477c73));shaft.position.y=8.1;root.add(shaft);
 for(const y of [2.6,3,12.9,13.5]){const ring=new T.Mesh(new T.CylinderGeometry(1.04,1.04,.2,20),material(0x6d9882));ring.position.y=y;root.add(ring);}
 ellipse(root,0,14.4,0,.25,.52,.23,0xd6b763);ellipse(root,0,15.04,0,.18,.22,.17,0xe0bf64);
 rod(root,[0,14.4,0],[-.8,15.3,.1],.065,0xd6b763);rod(root,[.1,14.4,0],[.66,14.9,.05],.065,0xd6b763);
 rod(root,[-.1,14.05,0],[-.25,13.53,.1],.075,0xd6b763);rod(root,[.13,14,0],[.58,13.85,.15],.07,0xd6b763);
 sign(g,'PLACE DE LA BASTILLE',-4,3.3,221,Math.PI,8);
 // Recognizable glass/stone volumes of the opera, on the eastern edge of the square.
 box(g,38,7.5,232,22,15,15,0xaeb7b5);box(g,30,6.5,223,12,13,4,0x7b9b9d);
 for(let i=0;i<7;i++)box(g,25+i*1.7,6.5,220.9,.08,13,.09,0xd7d8ce);
 // Glazed foyer and horizontal stone courses remain visible from the western approach.
 for(let i=0;i<13;i++){
  const a=-.90+i*.084,b=a+.085,x=31.9-7.8*Math.cos(a),z=227.5+8.4*Math.sin(a);
  const xx=31.9-7.8*Math.cos(b),zz=227.5+8.4*Math.sin(b);
  const panel=box(g,(x+xx)/2,6.5,(z+zz)/2,Math.hypot(xx-x,zz-z)+.03,10.4,.12,i%3===0?0x79939b:0x92a7ad);
  panel.rotation.y=-Math.atan2(zz-z,xx-x);
  rod(g,[x,1.2,z],[x,12,z],.05,0xd7d9d4);
  for(const y of [2.4,5.3,8.2,11.1])rod(g,[x-.08,y,z],[xx-.08,y,zz],.047,0xd5d7d3);
 }
 for(const y of [2.6,5.4,8.2,11.0,13.8])box(g,26.94,y,232,.15,.10,21.8,0x868f8f);
 box(g,33.9,15.5,233,12,.9,13,0x979f9f);
 sign(g,'OPÉRA BASTILLE',29.1,10.3,220.06,Math.PI,6,'#40565a','#f1ebd8');
}
export function createParisCity(district){
 const root=new T.Group();root.name='Paris — réseau de rues';
 box(root,-83,-.28,123,330,.3,370,0xb0aa98);
 // Public space around the monument: buildings stay outside the square.
 box(root,6,-.07,0,65,.12,60,0xbbb3a0);box(root,6,-.005,5,38,.05,30,0xd6cbb6);
 for(let i=-2;i<=2;i++)box(root,6+i*7,.026,5,.06,.015,28,0xb6aa96);
 for(const side of [-1,1])for(let z=-21;z<22;z+=14){tree(root,side*25,z,z+30);lamp(root,side*20,z+5);}
 sign(root,'PLACE DE LA RÉPUBLIQUE',-13,4.2,-17,Math.PI,9);metro(root,'République',-20,-10);
 for(const [index,e] of streets.entries()){
  const a=nodes[e.a],b=nodes[e.b],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),u={x:dx/len,z:dz/len},n={x:u.z,z:-u.x},angle=Math.atan2(dx,dz);
  const road=new T.Group();road.position.set((a.x+b.x)/2,0,(a.z+b.z)/2);road.rotation.y=angle;root.add(road);
  box(road,0,-.035,0,e.width+4.4,.12,len+2,0x68716e);
  // Pavements finish short of junctions, leaving an open turning area.
  for(const side of [-1,1]){box(road,side*(e.width/2+3.5),.015,0,2.6,.20,Math.max(1,len-9),0xc9bea9);box(road,side*(e.width/2+2.27),.12,0,.14,.20,Math.max(1,len-9),0xa49e8e);}
  if(e.width>14)for(let p=12;p<len-8;p+=10)box(road,0,.034,p-len/2,.09,.018,2.5,0xd4cab1);
  for(let x=-e.width/2+1;x<e.width/2;x+=1.5)box(road,x,.035,-len/2+5,.8,.02,2.4,0xdcd8c6);
  for(let t=14;t<len-8;t+=23){for(const side of [-1,1]){
   const x=a.x+u.x*t+n.x*side*(e.width/2+2.7),z=a.z+u.z*t+n.z*side*(e.width/2+2.7);
   lamp(root,x,z);
  }}
  if(e.width>14)for(let t=9;t<len-6;t+=13.5)for(const side of [-1,1]){
   const at=t+(side<0?2:0),off=side*(e.width/2+3.45);
   const x=a.x+u.x*at+n.x*off,z=a.z+u.z*at+n.z*off;
   tree(root,x,z,index+Math.floor(t));
   box(root,x,.126,z,.90,.035,.90,0x61685f);
  }
  for(let t=16;t<len-12;t+=14)for(const side of [-1,1]){
   if((Math.floor(t/14)+index+(side+1)/2)%4===0)continue;
   const at=t+(side<0?3:0),x=a.x+u.x*at+n.x*side*(e.width/2+1.15),z=a.z+u.z*at+n.z*side*(e.width/2+1.15);
   if(streets.some(other=>other.id!==e.id&&segmentDistance(x,z,nodes[other.a],nodes[other.b])<other.width/2+4))continue;
   const car=createParkedCar(index+Math.floor(t/14),[0x6e7b83,0x923f43,0xd0cbc0,0x395d76,0x46584f,0xb6b8b4][(index+Math.floor(t/14)+(side+1))%6]);
   car.position.set(x,.05,z);car.rotation.y=angle+(side<0?0:Math.PI);root.add(car);
  }
  sign(root,e.name,a.x+u.x*9+n.x*(e.width/2+3),3.3,a.z+u.z*9+n.z*(e.width/2+3),angle+Math.PI,Math.min(2.65,1+e.name.length*.056));
 }
 metro(root,'Filles-du-Calvaire',10,65);metro(root,'Saint-Sébastien–Froissart',10,105);metro(root,'Chemin Vert',13,166);
 // Broad Bastille junction and the distant July Column.
 box(root,8,-.025,224,48,.10,34,0x6b7470);bastille(root);
 // Benches, a newspaper kiosk and café tables give the squares a human scale.
 for(const [x,z] of [[-17,5],[-17,15],[20,-13],[-29,121]]){box(root,x,.5,z,2.2,.17,.7,0x486157);box(root,x,.86,z+.25,2.2,.65,.13,0x486157);for(const s of [-1,1])box(root,x+s*.75,.25,z,.12,.5,.6,0x263d38);}
 const kiosk=new T.Mesh(new T.CylinderGeometry(1.25,1.25,2.5,8),material(0x315649));kiosk.position.set(-18,1.25,-19);root.add(kiosk);
 const roof=new T.Mesh(new T.ConeGeometry(1.8,1.0,8),material(0x375249));roof.position.set(-18,3,-19);root.add(roof);sign(root,'JOURNAUX',-18,2,-20.3,Math.PI,2.2,'#e2c58d','#354a41');
 parisLandmarks(root);
 mergeStatic(root);root.add(district.clone(true));return root;
}

function parisLandmarks(g){
 // Pompidou: exterior services, steel frame and the red escalator tube.
 box(g,-192,9.4,178,24,18.8,25,0xd4d2bf);
 for(let z=167;z<=189;z+=5.5)for(const x of [-205,-179]){rod(g,[x,.1,z],[x,21,z],.11,0xe0e0d3);rod(g,[x,4,z],[x,18,z+4],.07,0xb1c0bc);}
 for(const y of [4,8,12,16,20]){rod(g,[-205,y,165],[-179,y,165],.1,0xd5dfd6);box(g,-192,y+1.3,165,22,2.2,.12,0x6c8e94);}
 for(let i=0;i<5;i++)rod(g,[-178.6+i*.28,.2,170+i*3.8],[-178.6+i*.28,20,170+i*3.8],.16,[0x477fab,0xb68e42,0x49987f][i%3]);
 rod(g,[-205,2,164],[-180,17,164],.55,0xab4437);sign(g,'CENTRE POMPIDOU',-192,21.8,164,Math.PI,13);
 // Hôtel de Ville: pale stone, pitched roofs, clock and paired pavilions.
 box(g,-184,6.8,252,27,13.6,22,0xd4c7b1);box(g,-184,14,252,28,1.1,23,0x61717c);
 for(const x of [-195,-173]){box(g,x,10.4,252,5.2,20.8,23,0xcdbea5);const roof=new T.Mesh(new T.ConeGeometry(4,4.8,4),material(0x596a76));roof.position.set(x,23,252);roof.rotation.y=Math.PI/4;g.add(roof);rod(g,[x,24.5,252],[x,27,252],.07,0xa28e63);}
 for(let z=243;z<262;z+=3.5)for(const y of [4,8,12])box(g,-170.4,y,z,.12,1.8,1.2,0x4a5d65);
 const clock=new T.Mesh(new T.CircleGeometry(.82,16),material(0xf2e5c9));clock.rotation.y=Math.PI/2;clock.position.set(-170.3,16,252);g.add(clock);
 rod(g,[-170.2,16,252],[-170.2,16.6,252],.035,0x42515b);rod(g,[-170.2,16,252],[-170.2,15.85,252.5],.035,0x42515b);
 sign(g,'HÔTEL DE VILLE',-170.2,13.9,252,Math.PI/2,8);
 // The Seine is beyond the walkable quay; no route crosses open water.
 box(g,-133,-.18,310,151,.12,28,0x658f96);
 for(let z=300;z<324;z+=4)for(let x=-200;x< -65;x+=18)box(g,x,-.10,z,8,.02,.11,0x95b7b4);
 box(g,-133,.09,294,151,.24,5.8,0xc8bea6);box(g,-133,.6,296.8,151,1.0,.65,0xb8b099);
 for(let x=-200;x< -65;x+=12){box(g,x,.72,296.8,.9,1.4,.9,0xcac0a9);lamp(g,x,292.8);}
 sign(g,'LA SEINE',-127,2.3,295.7,Math.PI,7,'#315c61','#efe5c7');
}
