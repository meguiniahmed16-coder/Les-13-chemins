// Refined adult citizens using the existing licensed Quaternius rig.
import * as T from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {poseCitizen,poseSeated} from './catalogne-motion.js';
import {shadowMaterial} from './a410-materials.js';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const materialCache=new Map();const material=(color,opts={})=>{const key=String(color)+JSON.stringify(opts);if(!materialCache.has(key))materialCache.set(key,new T.MeshStandardMaterial({color,roughness:.88,...opts}));return materialCache.get(key);};
const bodySurface=new T.MeshStandardMaterial({vertexColors:true,roughness:.91});
const palette={metal:material('#40564c'),dark:material('#293635')},stoneTrim=material('#d8d3bd');
const cube=new T.BoxGeometry(1,1,1),orb=new T.IcosahedronGeometry(1,1);
function mesh(geometry,mat,x,y,z,parent,scale){const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);if(scale)m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(w,h,d,mat,x,y,z,p){let geometry=cube;const tile=mat.userData?.tileMeters;if(tile){geometry=cube.clone();const uv=geometry.attributes.uv,n=geometry.attributes.normal;for(let i=0;i<uv.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i));uv.setXY(i,uv.getX(i)*(nx>.5?d:w)/tile,uv.getY(i)*(ny>.5?d:h)/tile);}}return mesh(geometry,mat,x,y,z,p,[w,h,d]);}

const ball=(rx,ry,rz,mat,x,y,z,p)=>mesh(orb,mat,x,y,z,p,[rx,ry,rz]);
function bar(a,b,r,mat,p){const delta=b.clone().sub(a);const m=mesh(new T.CylinderGeometry(r,r,delta.length(),6),mat,...a.clone().add(b).multiplyScalar(.5).toArray(),p);m.quaternion.setFromUnitVectors(V(0,1,0),delta.normalize());return m;}
function mergeStatic(group,partition=false){group.updateMatrixWorld(true);const batches=new Map();group.traverse(m=>{if(!m.isMesh||m.isSkinnedMesh)return;const key=m.material.uuid+':'+m.castShadow+':'+m.receiveShadow+(partition?'@'+Math.floor(m.matrixWorld.elements[12]/12):'');const batch=batches.get(key)||{material:m.material,castShadow:m.castShadow,receiveShadow:m.receiveShadow,geometries:[]};const list=batch.geometries;let g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();if(!g.attributes.uv)g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));g.applyMatrix4(m.matrixWorld);list.push(g);batches.set(key,batch);});group.clear();group.position.set(0,0,0);group.rotation.set(0,0,0);group.scale.setScalar(1);for(const {material:mat,castShadow,receiveShadow,geometries:geoms}of batches.values()){const g=mergeGeometries(geoms);geoms.forEach(x=>x.dispose());if(g){const m=mesh(g,mat,0,0,0,group);m.castShadow=castShadow;m.receiveShadow=receiveShadow;}}}
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
  g.setAttribute('color',new T.Float32BufferAttribute(vertexColors,3));m.geometry=g;m.material=bodySurface;
 });
 // Slightly slimmer adult narrator, with the same physical limb lengths.
 if(role==='hero'){model.scale.x*=.93;model.scale.z*=.94;}else if(role==='suit'){model.scale.x*=1.08;}
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
const outfits=[['#a86c4f','#40545e','#c69b79','#392b22'],['#728b79','#51463e','#d5b191','#574536'],['#798aa0','#384953','#b88967','#2b241f'],['#ba9270','#555846','#d8bda0','#8a7763'],['#a67780','#3e4749','#b4825f','#342824'],['#ccc3a8','#65584d','#ceaa87','#736c60']];
const shadow=shadowMaterial();
function label(text){const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');g.fillStyle='#203b50';g.fillRect(0,0,256,64);g.fillStyle='#f2eddb';g.font='bold 43px Arial';g.textAlign='center';g.fillText(text,128,49);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return new T.MeshBasicMaterial({map:t,side:T.DoubleSide});}
export function makeCitizen(asset,index,role='walker',accent){
 const group=new T.Group(),police=role==='police',hero=role==='hero',o=outfits[index%outfits.length];
 group.userData.parkCitizen=true;
 const colors={shirt:hero?'#b2654c':police?'#233c52':o[0],pants:hero?'#435663':police?'#283d4c':o[1],skin:hero?'#bc8b68':o[2],hair:hero?'#30231b':o[3]};
 const h=hero?1.79:police?1.87:1.70+(index%4)*.055;
 const rig=person(asset,h,hero?'hero':role==='sport'?'casual':index%4===0?'suit':'casual',group,colors);
 rig.group.rotation.y=hero?0:Math.PI;
 if(!hero&&!police&&index%3===1){
  const hair=new T.Group();rig.group.add(hair);ball(.07,.085,.07,material(colors.hair),0,h*.88,-h*.084,hair);ball(.066,.047,.035,material(colors.hair),0,h*.80,-h*.06,hair);rig.group.updateMatrixWorld(true);rig.bones.head.bone.attach(hair);
 }
 if(police){
  const details=new T.Group();rig.group.add(details);const navy=material('#253e52'),black=material('#202c31'),gold=material('#d6c38b');
  const cap=new T.Group();rig.group.add(cap);ball(.135,.046,.117,navy,0,h*.95,0,cap);box(.19,.025,.16,black,0,h*.933,.106,cap);box(.03,.045,.014,gold,0,h*.954,.11,cap);rig.group.updateMatrixWorld(true);rig.bones.head.bone.attach(cap);
  box(.40,.035,.012,gold,0,h*.685,.205,details);box(.40,.035,.012,gold,0,h*.685,-.196,details);
  for(const side of [-1,1]){const badge=mesh(new T.PlaneGeometry(.41,.10),label('POLICÍA'),0,h*.64,side*.205,details);if(side<0)badge.rotation.y=Math.PI;}
  box(.43,.07,.33,black,0,h*.50,0,details);box(.09,.15,.09,black,-.23,h*.54,.10,details);bar(V(-.23,h*.60,.10),V(-.23,h*.71,.10),.009,black,details);box(.095,.17,.11,black,.22,h*.48,0,details);
  rig.group.updateMatrixWorld(true);rig.bones.spine_03.bone.attach(details);
 }else{
  const detail=new T.Group();rig.group.add(detail);
  if(role==='client'){const scarf=material(accent);box(.23,.07,.04,scarf,0,h*.733,.19,detail);box(.06,.20,.04,scarf,.07,h*.67,.19,detail);}
  if(hero){const strap=bar(V(-.17,h*.72,.18),V(.18,h*.47,.18),.022,material('#393b31'),detail);box(.17,.24,.09,material('#706449'),.22,h*.45,.08,detail);}
  rig.group.updateMatrixWorld(true);rig.bones.spine_03.bone.attach(detail);
 }
 poseCitizen(rig,0,false);
 const shade=mesh(new T.PlaneGeometry(.9,.58),shadow,0,.055,0,group);shade.rotation.x=-Math.PI/2;shade.castShadow=false;
 return {group,rig,elapsed:index*.29,moving:false};
}
export function animateCitizen(actor,dt,moving,fast=false){
 actor.elapsed+=Math.max(0,Math.min(.1,dt));
 poseCitizen(actor.rig,actor.elapsed,moving,false,false,fast);
}
export function seatCitizen(actor,height=.46,variant=0){poseSeated(actor.rig,height,variant);}
export function freezeCitizen(actor){
 const group=actor.group;group.updateMatrixWorld(true);const frozen=new T.Group();
 group.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone(),pos=geo.attributes.position;
  if(o.isSkinnedMesh){o.skeleton.update();const v=V();for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);o.applyBoneTransform(i,v);pos.setXYZ(i,v.x,v.y,v.z);}geo.deleteAttribute('skinIndex');geo.deleteAttribute('skinWeight');geo.computeVertexNormals();}
  geo.applyMatrix4(o.matrixWorld);const m=new T.Mesh(geo,o.material);m.castShadow=o.castShadow;m.receiveShadow=true;frozen.add(m);
 });
 mergeStatic(frozen);return frozen;
}
