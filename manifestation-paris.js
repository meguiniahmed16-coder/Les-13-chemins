import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
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
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;m=new T.MeshBasicMaterial({map:tex,side:T.DoubleSide});texts.set(key,m);
 }
 return new T.Mesh(new T.PlaneGeometry(width,width*.25),m);
}
function sign(g,text,x,y,z,angle=0,width=5,bg,fg){const s=streetSign(text,width,bg,fg);s.position.set(x,y,z);s.rotation.y=angle;g.add(s);return s;}
function mergeStatic(g){
 g.updateMatrixWorld(true);const batches=new Map();
 g.traverse(m=>{if(!m.isMesh)return;const p=m.matrixWorld.elements,key=m.material.uuid+'@'+Math.floor(p[12]/24)+','+Math.floor(p[14]/24);let b=batches.get(key);if(!b){b={mat:m.material,geo:[]};batches.set(key,b);}const geo=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();geo.applyMatrix4(m.matrixWorld);b.geo.push(geo);});
 g.clear();g.position.set(0,0,0);g.rotation.set(0,0,0);
 for(const b of batches.values()){const geo=mergeGeometries(b.geo);b.geo.forEach(x=>x.dispose());if(geo){geo.computeBoundingSphere();const m=new T.Mesh(geo,b.mat);m.receiveShadow=true;g.add(m);}}
 return g;
}
function segmentDistance(x,z,a,b){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-dx*t,z-a.z-dz*t);}
function safeBuilding(x,z,own){
 if(Math.hypot(x-6,z-5)<32||Math.hypot(x-7,z-224)<24)return false;
 return streets.every(e=>e.id===own||segmentDistance(x,z,nodes[e.a],nodes[e.b])>e.width/2+6.2);
}
const stones=[0xd9c5aa,0xcfc1aa,0xd4cbb7,0xd7bfa4,0xc8bca9,0xddcfb9],awnings=[0x3b6157,0x8e4039,0x354a64,0xb39b65];
function house(root,x,z,angle,seed){
 const g=new T.Group();g.position.set(x,0,z);g.rotation.y=angle;root.add(g);
 const h=11+(seed%4)*1.25,w=12.5,d=7.3,c=stones[seed%stones.length],slate=0x4c5666;
 box(g,0,h/2,0,w,h,d,c);box(g,0,.7,0,w+.1,1.4,d+.1,0xb3a58f);
 box(g,0,h+.45,0,w+.45,.7,d+.4,slate);box(g,0,h+1.2,0,w-.8,1.1,d-1.2,slate);
 box(g,0,h-.5,-d/2-.1,w+.3,.23,.4,0xeaddc4);
 for(const y of [3.15,6.4,9.65])if(y<h)box(g,0,y,-d/2-.08,w+.1,.13,.27,0xe8dbc4);
 for(let y=4.3;y<h-1;y+=2.8)for(let col=-1;col<=1;col++){
  const xx=col*2.85,glow=(col+seed+Math.floor(y))%3===0;
  box(g,xx,y,-d/2-.06,1.25,1.85,.11,0xebe0c9);box(g,xx,y,-d/2-.13,.98,1.55,.07,glow?0xd9b97d:0x485866);
  box(g,xx,y,-d/2-.18,.065,1.6,.04,0xc9c0a9);box(g,xx,y,-d/2-.18,1.05,.06,.04,0xc9c0a9);
  box(g,xx,y-.92,-d/2-.4,1.6,.16,.65,0xc9bea7);
  if(y<7.4){box(g,xx,y-.56,-d/2-.69,1.6,.055,.06,0x354447);for(let j=-3;j<=3;j++)box(g,xx+j*.22,y-.73,-d/2-.7,.034,.38,.04,0x354447);}
 }
 box(g,0,1.4,-d/2-.12,1.65,2.7,.12,0x3e4b45);
 for(const xx of [-2.8,2.8]){box(g,xx,1.3,-d/2-.13,2.2,2.1,.12,0x798988);box(g,xx,2.8,-d/2-.42,2.8,.18,.85,awnings[seed%4]);}
 for(const xx of [-2.4,2.2])box(g,xx,h+2,-.3,.55,1.4,.65,0xa57658);
 if(seed%3===0){const label=['CAFÉ DES AMIS','LIBRAIRIE','BOULANGERIE','BRASSERIE'][seed%4];sign(g,label,0,3.05,-d/2-.22,Math.PI,5.8,'#29483e','#eee0bb');}
}
function lamp(g,x,z){rod(g,[x,0,z],[x,4.4,z],.065,0x344c48);box(g,x,4.5,z,.40,.65,.40,0xd9bf88);box(g,x,4.87,z,.55,.09,.55,0x344c48);}
function tree(g,x,z,seed){rod(g,[x,0,z],[x,3.8,z],.16,0x7a6651);for(const s of [-1,1])rod(g,[x,2.8,z],[x+s*.75,4.2,z],.09,0x7a6651);ellipse(g,x,4.9,z,1.65,1.9,1.6,seed%2?0x718764:0x8a966c);ellipse(g,x+.8,4.4,z+.4,1.05,1.25,1.1,0x8c9b72);}
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
 sign(g,'OPÉRA BASTILLE',30,11,220.7,Math.PI,9,'#425858','#f2ead5');
}
export function createParisCity(){
 const root=new T.Group();root.name='Paris — réseau de rues';
 box(root,-20,-.28,110,210,.3,330,0xb0aa98);
 // Public space around the monument: buildings stay outside the square.
 box(root,6,-.07,0,65,.12,60,0xbbb3a0);box(root,6,-.005,5,38,.05,30,0xd6cbb6);
 for(let i=-2;i<=2;i++)box(root,6+i*7,.026,5,.06,.015,28,0xb6aa96);
 for(const side of [-1,1])for(let z=-21;z<22;z+=14){tree(root,side*25,z,z+30);lamp(root,side*20,z+5);}
 sign(root,'PLACE DE LA RÉPUBLIQUE',-13,4.2,-17,Math.PI,9);metro(root,'République',-20,-10);
 for(const [index,e] of streets.entries()){
  const a=nodes[e.a],b=nodes[e.b],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),u={x:dx/len,z:dz/len},n={x:u.z,z:-u.x},angle=Math.atan2(dx,dz);
  const road=new T.Group();road.position.set((a.x+b.x)/2,0,(a.z+b.z)/2);road.rotation.y=angle;root.add(road);
  box(road,0,-.035,0,e.width,.12,len+2,0x68716e);
  // Pavements finish short of junctions, leaving an open turning area.
  for(const side of [-1,1]){box(road,side*(e.width/2+1.25),.015,0,2.5,.20,Math.max(1,len-9),0xc9bea9);box(road,side*(e.width/2+.07),.12,0,.14,.20,Math.max(1,len-9),0xa49e8e);}
  if(e.width>14)for(let p=12;p<len-8;p+=10)box(road,0,.034,p-len/2,.09,.018,2.5,0xd4cab1);
  for(let x=-e.width/2+1;x<e.width/2;x+=1.5)box(road,x,.035,-len/2+5,.8,.02,2.4,0xdcd8c6);
  for(let t=13;t<len-9;t+=13)for(const side of [-1,1]){
   const ox=n.x*side*(e.width/2+6),oz=n.z*side*(e.width/2+6),x=a.x+u.x*t+ox,z=a.z+u.z*t+oz;
   if(safeBuilding(x,z,e.id))house(root,x,z,angle+(side<0?-Math.PI/2:Math.PI/2),index*11+Math.floor(t/13));
  }
  for(let t=14;t<len-8;t+=23){for(const side of [-1,1]){
   const x=a.x+u.x*t+n.x*side*(e.width/2+1.2),z=a.z+u.z*t+n.z*side*(e.width/2+1.2);
   lamp(root,x,z);if(e.width>14&&t>28)tree(root,x+u.x*5,z+u.z*5,index);
  }}
  sign(root,e.name,a.x+u.x*9+n.x*(e.width/2+1),3.3,a.z+u.z*9+n.z*(e.width/2+1),angle+Math.PI,Math.min(7,e.name.length*.21));
 }
 metro(root,'Filles-du-Calvaire',10,65);metro(root,'Saint-Sébastien–Froissart',10,105);metro(root,'Chemin Vert',13,166);
 // Continuous outer blocks close the views beyond each real junction.
 for(let z=-20,i=0;z<248;z+=13,i++)for(const side of [-1,1]){const x=side<0?-79:45;if(safeBuilding(x,z))house(root,x,z,side<0?-Math.PI/2:Math.PI/2,300+i+(side+1)*8);}
 for(let x=-64,i=0;x<50;x+=13,i++)for(const z of [-39,260])if(safeBuilding(x,z))house(root,x,z,z<0?Math.PI:0,350+i);
 // Broad Bastille junction and the distant July Column.
 box(root,8,-.025,224,48,.10,34,0x6b7470);bastille(root);
 // Benches, a newspaper kiosk and café tables give the squares a human scale.
 for(const [x,z] of [[-17,5],[-17,15],[20,-13],[-29,121]]){box(root,x,.5,z,2.2,.17,.7,0x486157);box(root,x,.86,z+.25,2.2,.65,.13,0x486157);for(const s of [-1,1])box(root,x+s*.75,.25,z,.12,.5,.6,0x263d38);}
 const kiosk=new T.Mesh(new T.CylinderGeometry(1.25,1.25,2.5,8),material(0x315649));kiosk.position.set(-18,1.25,-19);root.add(kiosk);
 const roof=new T.Mesh(new T.ConeGeometry(1.8,1.0,8),material(0x375249));roof.position.set(-18,3,-19);root.add(roof);sign(root,'JOURNAUX',-18,2,-20.3,Math.PI,2.2,'#e2c58d','#354a41');
 return mergeStatic(root);
}
