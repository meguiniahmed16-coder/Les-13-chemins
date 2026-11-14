import * as T from 'three';
// Original, light meshes inspired by three French cars common around 2002.
// Dimensions and silhouettes are deliberately simplified, with period plates.
export const CAR_PROFILES=Object.freeze([
 {name:'Renault Clio II',length:3.78,roof:1.43,hood:.83,rear:.92},
 {name:'Peugeot 206',length:3.84,roof:1.42,hood:.73,rear:.96},
 {name:'Citroën Xsara',length:4.17,roof:1.39,hood:.79,rear:.81}
]);
const materials=new Map(),cube=new T.BoxGeometry(1,1,1),wheel=new T.CylinderGeometry(.29,.29,.20,10),hub=new T.CylinderGeometry(.15,.15,.215,8);
const mat=c=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.64}));return materials.get(c);};
function box(g,x,y,z,w,h,d,c){const m=new T.Mesh(cube,mat(c));m.position.set(x,y,z);m.scale.set(w,h,d);g.add(m);return m;}
function quad(g,points,c){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();const m=new T.Mesh(geo,mat(c));m.material.side=T.DoubleSide;g.add(m);return m;}
function shell(g,sections,c){
 const p=[],indices=[];for(const [z,w,b,t]of sections)for(const [x,y]of [[-w*.85,b],[-w,b+.11],[-w,t-.1],[-w*.84,t],[w*.84,t],[w,t-.1],[w,b+.11],[w*.85,b]])p.push(x,y,z);
 for(let s=0;s<sections.length-1;s++)for(let k=0;k<8;k++){const a=s*8+k,b=s*8+(k+1)%8;indices.push(a,b,b+8,a,b+8,a+8);}
 for(const s of [0,sections.length-1])for(let k=1;k<7;k++)indices.push(s*8,s*8+k,s*8+k+1);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setIndex(indices);geo.computeVertexNormals();g.add(new T.Mesh(geo,mat(c)));
}
export function createParkedCar(variant=0,paint=0x667e89){
 const p=CAR_PROFILES[variant%3],g=new T.Group(),l=p.length/2;g.name=p.name+' · voiture garée';
 g.userData={profile:p.name,parked:true,width:1.82,length:p.length};
 shell(g,[[-l,.65,.28,.70],[-l+.15,.79,.25,p.rear],[-.90,.81,.25,.93],[.65,.81,.25,.87],[l-.18,.77,.28,p.hood],[l,.62,.34,.64]],paint);
 shell(g,[[-1.22,.66,.79,.90],[-.72,.64,.81,p.roof],[.36,.63,.81,p.roof-.015],[1.02,.68,.79,.92]],paint);
 const glass=0x354e60,trim=0x263439;
 quad(g,[[-.59,1.38,-.70],[.59,1.38,-.70],[.62,.94,-1.19],[-.62,.94,-1.19]],glass);
 quad(g,[[-.58,p.roof-.06,.36],[-.63,.95,.99],[.63,.95,.99],[.58,p.roof-.06,.36]],glass);
 for(const side of [-1,1]){
  quad(g,[[side*.65,.98,-1.05],[side*.61,p.roof-.07,-.68],[side*.61,p.roof-.07,-.16],[side*.68,.96,-.16]],glass);
  quad(g,[[side*.68,.96,-.10],[side*.61,p.roof-.07,-.10],[side*.61,p.roof-.08,.33],[side*.68,.96,.88]],glass);
  box(g,side*.794,.66,0,.025,.055,p.length-.6,trim);
  box(g,side*.76,.90,-.32,.035,.04,.20,trim);
  box(g,side*.87,1.04,.63,.21,.14,.17,paint);
  for(const z of [-l+.68,l-.67]){const tire=new T.Mesh(wheel,mat(0x22272a));tire.rotation.z=Math.PI/2;tire.position.set(side*.76,.29,z);g.add(tire);const cap=new T.Mesh(hub,mat(0xb7b9b3));cap.rotation.z=Math.PI/2;cap.position.copy(tire.position);g.add(cap);}
  const front=box(g,side*.47,.67,l-.015,.38,.16,.06,0xf4ebc8);front.rotation.z=side*(variant===1?.18:.06);
  box(g,side*.55,.65,-l+.005,.25,variant===1?.29:.19,.055,0xb63b34);
 }
 box(g,0,.48,l+.015,1.29,.13,.08,trim);box(g,0,.47,-l-.015,1.31,.12,.08,trim);
 box(g,0,.51,l+.061,.44,.11,.015,0xe8e6d8);box(g,0,.50,-l-.061,.44,.11,.015,0xe1ba51);
 // Grille and badge-sized metallic detail; no external textures or network.
 box(g,0,.70,l+.023,.38,.08,.025,0x293738);box(g,0,.79,l-.03,.06,.055,.04,0xb5b8b6);
 return g;
}
