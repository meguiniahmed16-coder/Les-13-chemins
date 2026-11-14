/**
 * Monument de la République — original, lightweight geometry for Camarades !.
 * Inspired by the Morice monument, documented by Paris Musées. The playable
 * steps/platform deliberately keep the existing climb coordinates unchanged.
 * Coordinates: local origin at the centre of the plinth, front toward -Z.
 */
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
// Reserve the denser sphere for the four facial silhouettes. Most rounded
// relief/mane/finger forms occupy a few pixels and share an 80-triangle sphere.
const sphere=new T.SphereGeometry(1,8,6),faceSphere=new T.SphereGeometry(1,12,8),reliefSphere=new T.IcosahedronGeometry(1,0),box=new T.BoxGeometry(1,1,1);
const materials={
 stone:new T.MeshStandardMaterial({color:0xd5c9ac,roughness:.94}),
 light:new T.MeshStandardMaterial({color:0xe7dbc0,roughness:.91}),
 shadow:new T.MeshStandardMaterial({color:0xb6a78e,roughness:1}),
 bronze:new T.MeshStandardMaterial({color:0x476d60,roughness:.72,metalness:.34}),
 patina:new T.MeshStandardMaterial({color:0x789783,roughness:.86,metalness:.18}),
 dark:new T.MeshStandardMaterial({color:0x294b43,roughness:.78,metalness:.35}),
 gilt:new T.MeshStandardMaterial({color:0x9e9e70,roughness:.79,metalness:.27})
};
function piece(root,geometry,material,position,scale){
 const m=new T.Mesh(geometry,material);m.position.set(...position);
 if(scale)m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;
}
const ellipsoid=(root,mat,x,y,z,sx,sy,sz)=>piece(root,sphere,mat,[x,y,z],[sx,sy,sz]);
const slab=(root,mat,x,y,z,w,h,d)=>piece(root,box,mat,[x,y,z],[w,h,d]);
function lathe(root,profile,mat,y=0,segments=28){
 return piece(root,new T.LatheGeometry(profile.map(([r,h])=>new T.Vector2(r,h)),segments),mat,[0,y,0]);
}
function curve(root,points,radius,mat,segments=18){
 const path=new T.CatmullRomCurve3(points.map(p=>V(...p)));
 return piece(root,new T.TubeGeometry(path,Math.min(segments,12),radius,5,false),mat,[0,0,0]);
}
// A tapered anatomical volume along an articulated gesture, with rounded joins.
function limb(root,points,radii,mat){
 const path=new T.CatmullRomCurve3(points.map(p=>V(...p))),steps=12,sides=8;
 const frames=path.computeFrenetFrames(steps,false),positions=[],indices=[];
 for(let i=0;i<=steps;i++){
  const f=i/steps,u=f*(radii.length-1),j=Math.min(radii.length-2,Math.floor(u));
  const radius=T.MathUtils.lerp(radii[j],radii[j+1],u-j),p=path.getPointAt(f);
  for(let k=0;k<sides;k++){
   const theta=k/sides*Math.PI*2;
   const q=p.clone().addScaledVector(frames.normals[i],Math.cos(theta)*radius)
    .addScaledVector(frames.binormals[i],Math.sin(theta)*radius);
   positions.push(...q.toArray());
   if(i<steps){const a=i*sides+k,b=i*sides+(k+1)%sides;indices.push(a,b,a+sides,b,b+sides,a+sides);}
  }
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();
 return piece(root,g,mat,[0,0,0]);
}
// Drapery has alternating deep and fine pleats; the skirt, waist, torso and
// shoulders are one continuous sculpted volume, rather than stacked primitives.
function drapery(root,profile,mat,folds=17){
 const radial=40,positions=[],indices=[];
 for(let j=0;j<profile.length;j++){
  const [y,rx,rz,cx,cz]=profile[j];
  for(let i=0;i<radial;i++){
   const a=i/radial*Math.PI*2,pleat=1+(.045+.025*(1-j/profile.length))*Math.cos(a*folds+j*.20);
   positions.push(cx+Math.cos(a)*rx*pleat,y,cz+Math.sin(a)*rz*pleat);
   if(j<profile.length-1){const n=j*radial+i,k=j*radial+(i+1)%radial;indices.push(n,n+radial,k,k,n+radial,k+radial);}
  }
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();
 return piece(root,g,mat,[0,0,0]);
}
function leaf(root,centre,tip,mat,width=.08){
 const a=V(...centre),b=V(...tip),axis=b.clone().sub(a),side=V(-axis.y,axis.x,.1).normalize().multiplyScalar(width),middle=a.clone().lerp(b,.48);
 const points=[a,middle.clone().add(side),b,middle.clone().sub(side),middle.clone().add(V(0,0,.025))];
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flatMap(p=>p.toArray()),3));g.setIndex([0,1,4,1,2,4,2,3,4,3,0,4,4,1,0,4,2,1,4,3,2,4,0,3]);g.computeVertexNormals();
 return piece(root,g,mat,[0,0,0]);
}
function face(root,mat,x,y,z,s=1){
 piece(root,faceSphere,mat,[x,y,z],[.29*s,.38*s,.26*s]);
 piece(root,faceSphere,mat,[x,y-.20*s,z-.08*s],[.205*s,.17*s,.19*s]);
 ellipsoid(root,mat,x,y-.015*s,z-.253*s,.055*s,.115*s,.075*s);
 for(const side of [-1,1]){
  ellipsoid(root,mat,x+side*.28*s,y-.005*s,z,.055*s,.10*s,.055*s);
  ellipsoid(root,mat,x+side*.112*s,y+.07*s,z-.239*s,.084*s,.028*s,.037*s);
  ellipsoid(root,materials.dark,x+side*.112*s,y+.035*s,z-.259*s,.042*s,.012*s,.012*s);
 }
 curve(root,[[x-.085*s,y-.17*s,z-.235*s],[x,y-.179*s,z-.25*s],[x+.085*s,y-.17*s,z-.235*s]],.011*s,mat,8);
}
function inscription(root,text,width,height,position,background='#d4c7a9',ink='#5e6653',font=38){
 if(typeof document==='undefined')return;
 const c=document.createElement('canvas');c.width=512;c.height=256;
 const g=c.getContext('2d');if(!g)return;
 g.fillStyle=background;g.fillRect(0,0,c.width,c.height);g.strokeStyle=ink;g.globalAlpha=.36;g.lineWidth=3;g.strokeRect(13,13,486,230);g.globalAlpha=1;
 g.fillStyle=ink;g.font=`600 ${font}px Georgia`;g.textAlign='center';g.textBaseline='middle';
 const lines=text.split('\n');lines.forEach((line,i)=>g.fillText(line,256,128+(i-(lines.length-1)/2)*(font+12),460));
 const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
 const label=piece(root,new T.PlaneGeometry(width,height),new T.MeshStandardMaterial({map:texture,roughness:1,side:T.DoubleSide}),position);label.rotation.y=Math.PI;label.userData.monumentInscription=text;
}
function marianne(root){
 const g=new T.Group();g.position.y=10.25;root.add(g);const bronze=materials.bronze;
 ellipsoid(g,bronze,-.28,.12,-.20,.21,.12,.40);ellipsoid(g,bronze,.29,.12,-.31,.21,.12,.42);
 drapery(g,[[.16,.76,.53,0,0],[.48,.74,.52,-.03,0],[.95,.67,.49,-.05,.03],[1.50,.57,.44,-.06,.02],[2.05,.43,.35,-.03,0],[2.35,.43,.30,0,0],[2.63,.55,.33,.02,0],[2.94,.62,.35,.04,-.02],[3.24,.67,.32,.04,0],[3.48,.57,.27,.03,0]],bronze);
 // Folded mantle falls over the left shoulder and wraps diagonally across the chest.
 drapery(g,[[.35,.27,.22,-.52,.12],[1.1,.30,.23,-.43,.12],[1.8,.34,.20,-.36,.13],[2.45,.40,.20,-.26,.14],[3.15,.43,.24,-.17,.08],[3.55,.20,.23,-.42,.02]],materials.patina,11);
 curve(g,[[-.61,3.48,-.12],[-.25,3.15,-.38],[.18,2.87,-.40],[.49,2.59,-.19]],.043,materials.dark,20);
 ellipsoid(g,bronze,.03,3.65,0,.155,.26,.15);face(g,bronze,.03,4.05,-.025);
 // Curls remain part of the metal silhouette, beneath the Phrygian bonnet.
 for(let i=0;i<13;i++){const a=i/12*Math.PI;ellipsoid(g,materials.dark,.03+Math.cos(a)*.27,4.17+Math.sin(a)*.22,.02,.085,.095,.09);}
 drapery(g,[[4.25,.28,.25,.03,-.005],[4.45,.30,.25,.01,0],[4.65,.25,.22,-.07,0],[4.83,.17,.17,-.19,-.01],[4.90,.09,.11,-.31,-.03],[4.80,.025,.035,-.38,-.07]],bronze,9);
 for(let i=0;i<11;i++){
  const a=Math.PI+i/10*Math.PI;
  leaf(g,[.03+Math.cos(a)*.285,4.30,Math.sin(a)*.255],[.03+Math.cos(a)*.36,4.46,Math.sin(a)*.31],materials.gilt,.044);
 }
 limb(g,[[.56,3.38,0],[.93,3.92,-.08],[1.12,4.45,-.13],[.98,5.02,-.14]],[.22,.19,.14,.10],bronze);
 ellipsoid(g,bronze,.98,5.10,-.14,.13,.20,.12);
 limb(g,[[-.52,3.35,0],[-.80,2.93,-.15],[-.62,2.64,-.43],[-.42,2.71,-.56]],[.22,.18,.13,.10],bronze);
 const tablet=slab(g,materials.dark,-.69,2.57,-.51,.58,.95,.13);tablet.rotation.z=-.10;
 ellipsoid(g,bronze,-.40,2.75,-.61,.18,.09,.09);
 inscription(g,'DROITS\nDE L’HOMME',.47,.72,[-.69,2.57,-.585],'#3c6054','#a9b29a',38);
 // Olive branch, clasped in the raised hand, with individual paired leaves.
 const stem=[[.98,5.04,-.14],[1.02,5.45,-.15],[.83,5.87,-.14],[.72,6.28,-.13]];
 curve(g,stem,.025,materials.gilt,18);
 for(let i=0;i<8;i++){
  const y=5.27+i*.13,x=1.01-Math.max(0,y-5.5)*.42;
  for(const s of [-1,1])leaf(g,[x,y,-.14],[x+s*(.23-i*.012),y+.22,-.13+s*.025],i%2?materials.patina:materials.gilt,.055);
 }
}
function allegory(root,x,z,yaw,name){
 const g=new T.Group();g.position.set(x,1.47,z);g.rotation.y=yaw;g.scale.setScalar(.79);root.add(g);
 const stone=materials.light;
 slab(g,materials.shadow,0,.20,.15,1.0,.4,.9);
 drapery(g,[[0,.51,.66,0,-.23],[.32,.53,.68,0,-.24],[.65,.54,.62,0,-.22],[.95,.48,.47,0,-.10],[1.20,.34,.29,0,.03],[1.48,.38,.25,0,.07],[1.76,.44,.23,0,.03]],stone,11);
 ellipsoid(g,stone,0,1.89,.025,.11,.17,.11);face(g,stone,0,2.18,0,.69);
 ellipsoid(g,materials.stone,0,2.37,.05,.22,.16,.21);
 limb(g,[[-.40,1.70,.03],[-.51,1.30,-.14],[-.26,1.06,-.52]],[.13,.11,.075],stone);
 limb(g,[[.40,1.70,.03],[.53,1.27,-.12],[.27,1.05,-.49]],[.13,.11,.075],stone);
 ellipsoid(g,stone,-.26,1.06,-.52,.10,.065,.10);ellipsoid(g,stone,.27,1.05,-.49,.10,.065,.10);
 if(name==='LIBERTÉ'){curve(g,[[.48,.2,-.30],[.46,1.9,-.30],[.48,2.45,-.30]],.035,materials.shadow);}
 if(name==='ÉGALITÉ'){curve(g,[[-.35,1.02,-.60],[0,1.43,-.60],[.35,1.02,-.60]],.038,materials.shadow);curve(g,[[-.35,1.02,-.60],[.35,1.02,-.60]],.033,materials.shadow);}
 if(name==='FRATERNITÉ'){ellipsoid(g,stone,.43,.70,-.61,.15,.25,.13);ellipsoid(g,stone,.43,1.03,-.60,.13,.16,.13);}
}
function lion(root){
 const g=new T.Group();g.position.set(1.42,.78,-2.43);g.rotation.y=-.12;root.add(g);const b=materials.bronze;
 ellipsoid(g,b,0,.43,.28,.46,.45,.94);ellipsoid(g,b,0,.63,-.39,.51,.53,.51);
 // Layered sculpted mane rather than a single spherical head.
 for(let i=0;i<15;i++){const a=i/15*Math.PI*2;ellipsoid(g,i%3?b:materials.dark,Math.cos(a)*.37,.66+Math.sin(a)*.39,-.59,.15,.20,.18);}
 ellipsoid(g,b,0,.72,-.68,.31,.32,.33);
 for(const s of[-1,1]){
  ellipsoid(g,b,s*.25,.98,-.59,.12,.13,.08);
  ellipsoid(g,b,s*.29,.18,-.39,.16,.18,.65);ellipsoid(g,b,s*.29,.16,-.92,.20,.15,.27);
  ellipsoid(g,b,s*.35,.25,.77,.22,.25,.42);
  ellipsoid(g,materials.dark,s*.12,.80,-.959,.033,.030,.018);
  ellipsoid(g,b,s*.12,.60,-.94,.14,.11,.11);
  for(let j=0;j<3;j++)curve(g,[[s*.29+(j-1)*.055,.15,-1.15],[s*.29+(j-1)*.055,.21,-1.10]],.012,materials.patina,4);
 }
 ellipsoid(g,materials.dark,0,.67,-1.037,.085,.055,.045);
 curve(g,[[.33,.39,1.03],[.57,.20,1.27],[.80,.18,1.00],[.68,.25,.68]],.07,b,20);
 ellipsoid(g,materials.dark,.68,.25,.68,.11,.12,.14);
}
function mergeStatic(root){
 root.updateMatrixWorld(true);const groups=new Map();
 root.traverse(o=>{if(!o.isMesh)return;const key=o.material.uuid;let batch=groups.get(key);if(!batch){batch={material:o.material,geometries:[]};groups.set(key,batch);}
  let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.deleteAttribute('uv');g.applyMatrix4(o.matrixWorld);
  // Text panels retain UVs and their independent material.
  if(o.material.map){g.dispose();g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);}
  batch.geometries.push(g);
 });root.clear();
 for(const {material,geometries} of groups.values()){
  const merged=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());
  if(!merged)throw Error('Republic monument geometry could not be merged');
  merged.computeBoundingSphere();piece(root,merged,material,[0,0,0]);
 }
 return root;
}

export function createRepublicMonument(){
 const root=new T.Group();root.name='Monument de la République';
 slab(root,materials.shadow,0,.25,0,6,.50,6);
 slab(root,materials.stone,0,.66,0,5.75,.32,5.75);
 slab(root,materials.light,0,.94,0,5.35,.24,5.35);
 slab(root,materials.stone,0,1.42,0,4.70,.72,4.70);
 lathe(root,[[0,1.80],[2.37,1.80],[2.37,2.02],[2.16,2.13],[2.06,2.93],[2.20,3.08],[2.20,3.32],[0,3.32]],materials.stone);
 // Narrower upper column leaves the climbing landing outside its volume.
 lathe(root,[[0,3.32],[1.72,3.32],[1.72,3.52],[1.55,3.65],[1.47,3.86],[1.44,8.94],[1.55,9.12],[1.57,9.35],[1.76,9.45],[1.77,9.72],[1.65,9.88],[1.62,10.20],[0,10.20]],materials.light);
 lathe(root,[[1.45,4.05],[1.49,4.09],[1.49,4.19],[1.45,4.23]],materials.shadow);
 lathe(root,[[1.46,8.60],[1.52,8.65],[1.52,8.78],[1.46,8.82]],materials.stone);
 for(let i=0;i<10;i++){
  const h=(i+1)*.332,z=-4.65+i*(3.13/9);
  slab(root,i%2?materials.stone:materials.light,-1.15,h/2,z,1.35,h,.38);
  slab(root,materials.light,-1.15,h+.005,z,1.40,.01,.38);
 }
 // Twelve bronze historical relief panels around the pedestal base.
 for(let i=0;i<12;i++){
  const angle=i/12*Math.PI*2,x=Math.sin(angle)*2.075,z=Math.cos(angle)*2.075;
  const panel=new T.Group();panel.position.set(x,2.51,z);panel.rotation.y=angle;root.add(panel);
  slab(panel,materials.dark,0,0,0,.81,.62,.055);
  for(let j=0;j<4;j++){
   const k=(j-1.5)*.16;piece(panel,reliefSphere,materials.bronze,[k,.13,.052],[.052,.060,.025]);
   slab(panel,materials.bronze,k,-.035,.055,.075,.21,.025);
  }
 }
 allegory(root,2.04,-.06,-Math.PI/2,'ÉGALITÉ');
 allegory(root,-1.82,.73,Math.PI/2,'LIBERTÉ');
 allegory(root,.02,2.03,Math.PI,'FRATERNITÉ');
 lion(root);
 inscription(root,'À LA GLOIRE\nDE LA RÉPUBLIQUE\nFRANÇAISE',2.08,1.38,[0,7.00,-1.445],'#e0d3b7','#58614f',31);
 inscription(root,'LA VILLE DE PARIS\n1883',1.58,.74,[0,5.40,-1.450],'#e0d3b7','#58614f',33);
 marianne(root);
 mergeStatic(root);
 root.userData={landmark:'Monument à la République',artist:'Léopold et Charles Morice',interpretation:'Original game geometry; compressed scale',platformHeight:3.32,front:'-Z'};
 return root;
}
