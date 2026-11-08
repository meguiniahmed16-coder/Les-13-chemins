import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/examples/jsm/utils/SkeletonUtils.js';

// Positive entries are anatomical flexion MAGNITUDES, not raw Euler angles.
// This GLB's native hand hangs toward -Y; flexion toward the PALM (-X) is
// a NEGATIVE rotation about native +Z. Positive +Z bends fingers dorsally.
export const ANATOMICAL_GRIPS=Object.freeze({
 relaxed:[[0,.04,.02],[.05,.11,.04],[.05,.11,.04],[.07,.13,.06],[.07,.14,.06]],
 brush:[[.25,.42,.18],[.38,.65,.34],[.42,.71,.36],[.45,.75,.36],[.43,.70,.31]],
 cup:[[.20,.32,.16],[.32,.60,.29],[.37,.62,.31],[.40,.66,.31],[.42,.66,.30]],
 smoke:[[.08,.12,.04],[.08,.11,.06],[.06,.11,.06],[.42,.69,.36],[.52,.74,.40]]
});
export const PALMAR_FLEXION_SIGN=-1;
// Calibrated against the original 25-joint WEBXR hand, not a second hand mesh.
// XYZ rotations close the thumb ON THE CUP, against the four fingers.
// Rotations are specified in the source model's native world axes (radians).
export const CUP_THUMB_ROTATIONS=Object.freeze([
 [-.233,.349,-.223],
 [-.039,.291,.036],
 [-.028,.087,.105]
]);

// Use a real anatomically sculpted right-hand surface for the pre-pickup hand,
// not the five capsule sweeps used for other preliminary game poses.
// WebXR generic right hand (MIT, ©2019 Amazon): hand-right.glb, bundled locally.
let anatomicalGeometryPromise,anatomicalSourcePromise;
function anatomySource(){
 if(typeof window==='undefined')return null;
 if(!anatomicalSourcePromise)anatomicalSourcePromise=new GLTFLoader().loadAsync('hand-right.glb');
 return anatomicalSourcePromise;
}
function anatomyGeometry(){
 if(typeof window==='undefined')return null; // gameplay tests can run in Node
 if(!anatomicalGeometryPromise)anatomicalGeometryPromise=anatomySource().then(glb=>{
  glb.scene.updateMatrixWorld(true);
  const geometries=[];
  glb.scene.traverse(part=>{
   if(!part.isMesh)return;
   const geo=part.geometry.clone();
   geo.applyMatrix4(part.matrixWorld); // rest pose, no artificial capsule fingers
   geo.deleteAttribute('skinIndex');
   geo.deleteAttribute('skinWeight');
   if(geo.getAttribute('position').count<1000)throw Error('Anatomical hand has too few vertices');
   geometries.push(geo);
  });
  if(!geometries.length)throw Error('Anatomical hand mesh was not found in the GLB');
  return geometries;
 });
 return anatomicalGeometryPromise;
}
// Preload during the introduction, before the player can reach the brush.
if(typeof window!=='undefined')anatomyGeometry().catch(e=>console.error('Chargement de la main anatomique :',e));
import {handData} from './yoyo-hands-data.js';
// All grips and their objects share one coordinate system. Forearms extend below the view.
export function models(){
 const material=(c,r=.7,more={})=>new T.MeshStandardMaterial({color:c,roughness:r,...more});
 const skin=material('#b68a6d',.64),nail=material('#c5a18a',.58),crease=material('#946d57'),cloth=material('#34454b',.96),ceramic=material('#d8ded1',.28),chrome=material('#939f9b',.25,{metalness:.8}),rubber=material('#3c4845',.9),plastic=material('#d4cdb6',.62);
 function mesh(geo,mat,p){const m=new T.Mesh(geo,mat);p.add(m);m.castShadow=true;m.receiveShadow=true;return m;}
 function oval(p,at,size,mat=skin){const m=mesh(new T.SphereGeometry(1,18,12),mat,p);m.position.set(...at);m.scale.set(...size);return m;}
 function bone(p,a,b,r1,r2=r1,mat=skin){const u=new T.Vector3(...a),v=new T.Vector3(...b),d=v.clone().sub(u),m=mesh(new T.CylinderGeometry(r2,r1,d.length(),12),mat,p);m.position.copy(u.add(v).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
 function tube(p,points,r,mat=chrome){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),28,r,8,false),mat,p);}
 function lathe(p,points,mat=ceramic,scale=[1,1,1]){const m=mesh(new T.LatheGeometry(points.map(a=>new T.Vector2(...a)),40),mat,p);m.scale.set(...scale);return m;}
 function roundedBox(p,w,h,d,at,mat=ceramic){const r=Math.min(w,h)*.1,s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const m=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2,steps:1,curveSegments:5}),mat,p);m.position.set(at[0],at[1],at[2]-d/2);return m;}
 function hand(name){
  const data=handData[name],p=new T.Group();
  const decode=(s,Type)=>{const bytes=Uint8Array.from(atob(s),c=>c.charCodeAt(0));return new Type(bytes.buffer);};
  const raw=decode(data.p,Int16Array),positions=Float32Array.from(raw,v=>v/100000),geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.BufferAttribute(positions,3));geo.setAttribute('normal',new T.BufferAttribute(decode(data.n,Int8Array),3,true));geo.setIndex(new T.BufferAttribute(decode(data.i,Uint16Array),1));geo.computeBoundingSphere();mesh(geo,skin,p);
  // The back of each fingertip determines its nail plane; nails never float on the palm.
  for(const a of data.nails){
   const tip=new T.Vector3(...a.tip),direction=tip.clone().sub(new T.Vector3(...a.previous)).normalize(),out=new T.Vector3(...a.normal);out.addScaledVector(direction,-out.dot(direction)).normalize();
   // Open search hand had conspicuous floating pale nail blobs in first-person view.
   // Place smaller nails on the true fingertip surface; preserve all other poses.
   const isSearching=name==='open';
   const at=tip.clone().addScaledVector(direction,-.005).addScaledVector(out,a.r*(isSearching?.91:1.18)),n=oval(p,at.toArray(),[a.r*(isSearching?.47:.58),a.r*(isSearching?.63:.83),isSearching?.00055:.0008],nail);
   const side=new T.Vector3().crossVectors(direction,out).normalize();n.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(side,direction,out));
  }
  if(name==='open'||name==='smoke'){
   const fold=material('#96725f',.95,{transparent:true,opacity:.24});
   const fingers=name==='smoke'?[[-.029,.072,.008],[-.028,.105,.002],[-.002,.079,.008],[-.002,.110,.002]]:[[-.032,.068,.013],[-.009,.082,.013],[.015,.076,.012],[.038,.058,.011]];
   for(const [x,y,z] of fingers)tube(p,[[x-.006,y,z-.003],[x,y-.001,z+.002],[x+.006,y,z-.003]],.0006,fold);
  }
  const cuff=data.cuff,end=[cuff[0]+.09,cuff[1]-.55,cuff[2]+.23];
  bone(p,cuff,end,.048,.078,cloth);bone(p,[cuff[0],cuff[1]+.012,cuff[2]],[cuff[0]+.003,cuff[1]-.022,cuff[2]+.008],.049,.050,cloth);
  return p;
 }
 function openHand(){
  const p=new T.Group();
  p.userData.handModel='webxr-anatomical-right';
  p.userData.ready=false;

  // Wrist continuity into the arm: the anatomical mesh finishes near y=-0.08.
  // A skin-coloured tapered forearm overlaps under the wrist surface.
  const forearm=bone(p,[.011,-.061,.005],[.022,-.247,.037],.025,.039,skin);
  forearm.scale.z=.76;
  const sleeveEnd=[.108,-.785,.265];
  bone(p,[.022,-.232,.037],sleeveEnd,.039,.078,cloth);

  const anatomical=new T.Group();
  anatomical.position.set(0,-.002,-.035);
  anatomical.scale.setScalar(1.05);
  // glTF joints point down -Y, thumb points -Z and hand thickness is X.
  // Rotating the entire anatomical mesh keeps handedness and finger anatomy.
  anatomical.quaternion.setFromRotationMatrix(new T.Matrix4().set(
    0,0,1,0,
    0,-1,0,0,
    1,0,0,0,
    0,0,0,1
  ));
  p.add(anatomical);
  const pending=anatomyGeometry();
  if(pending)pending.then(geometries=>{
    for(const geometry of geometries)mesh(geometry,skin,anatomical);
    p.userData.ready=true;
  }).catch(err=>{
    console.error('Main WebXR indisponible, affichage de secours :',err);
    // The game remains playable if an asset request is blocked.
    const backup=hand('open');
    p.add(backup);
    p.userData.fallback=true;
  });
  return p;
 }
 // One real continuous skin, one skeleton, different physically meaningful finger poses.
 // WebXR joints are independent roots in this asset. Reparenting preserves their bind transforms.
 function anatomicalHand(pose='relaxed'){
  const p=new T.Group();p.userData.handModel='webxr-anatomical-right';p.userData.pose=pose;p.userData.ready=false;
  const forearm=bone(p,[.011,-.060,.005],[.021,-.245,.037],.025,.039,skin);
  forearm.scale.z=.76;
  bone(p,[.021,-.232,.037],[.110,-.795,.265],.039,.077,cloth);
  const mount=new T.Group();mount.position.set(0,-.002,-.035);mount.scale.setScalar(1.05);
  mount.quaternion.setFromRotationMatrix(new T.Matrix4().set(0,0,1,0,0,-1,0,0,1,0,0,0,0,0,0,1));
  p.add(mount);
  const pending=anatomySource();
  if(pending)pending.then(gltf=>{
   const cloned=cloneSkeleton(gltf.scene);
   cloned.traverse(obj=>{
    if(obj.isMesh){obj.material=skin;obj.castShadow=true;obj.receiveShadow=true;}
   });
   const wrist=cloned.getObjectByName('wrist'),map=new Map();
   cloned.traverse(node=>{if(node.isBone)map.set(node.name,node);});
   const fingers=['thumb','index-finger','middle-finger','ring-finger','pinky-finger'];
   // Establish true kinematic chains while keeping exact inverse-bind matrices.
   for(const name of fingers){
    const names=name==='thumb'
      ? ['thumb-metacarpal','thumb-phalanx-proximal','thumb-phalanx-distal','thumb-tip']
      : [name+'-metacarpal',name+'-phalanx-proximal',name+'-phalanx-intermediate',name+'-phalanx-distal',name+'-tip'];
    let parent=wrist;
    for(const key of names){const joint=map.get(key);if(!joint)throw Error('Articulation absente: '+key);joint.updateMatrixWorld(true);parent.attach(joint);parent=joint;}
   }
   const bends=ANATOMICAL_GRIPS[pose]||ANATOMICAL_GRIPS.relaxed;
   // Native +Z is the flexion axis. Its positive direction was the bug:
   // it curled the ring and little fingers backwards toward the hand's DORSUM.
   // Apply PALMAR_FLEXION_SIGN to fingers, and keep the thumb separately tuned.
   function flex(joint,angle){
    if(!joint||!angle)return;
    joint.parent.updateMatrixWorld(true);
    const parentQ=joint.parent.getWorldQuaternion(new T.Quaternion());
    const localAxis=new T.Vector3(0,0,1).applyQuaternion(parentQ.invert()).normalize();
    joint.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(localAxis,angle));
    joint.updateMatrixWorld(true);
   }
   // The thumb has three rotation axes, unlike the four fingers. A single Z
   // rotation left the thumb floating outside the cup instead of opposing it.
   function flexThumbOnCup(joint,[x,y,z]){
    if(!joint)return;
    joint.parent.updateMatrixWorld(true);
    const pq=joint.parent.getWorldQuaternion(new T.Quaternion());
    // Extrinsic XYZ native-axis rotation = Qz * Qy * Qx.
    const q=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),z)
      .multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),y))
      .multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),x));
    joint.quaternion.premultiply(pq.clone().invert().multiply(q).multiply(pq));
    joint.updateMatrixWorld(true);
   }
   for(let i=0;i<fingers.length;i++){
    const name=fingers[i],parts=name==='thumb'
      ? ['metacarpal','phalanx-proximal','phalanx-distal']
      : ['phalanx-proximal','phalanx-intermediate','phalanx-distal'];
    parts.forEach((part,j)=>{
     const joint=map.get(name+'-'+part),magnitude=bends[i]?.[j]||0;
     if(i===0&&pose==='cup')flexThumbOnCup(joint,CUP_THUMB_ROTATIONS[j]);
     else flex(joint,i===0?magnitude:PALMAR_FLEXION_SIGN*magnitude);
    });
   }
   mount.add(cloned);
   p.userData.ready=true;
  }).catch(err=>{
   console.error('Pose anatomique non chargée :',pose,err);
   const fallback=hand(pose==='relaxed'?'open':pose==='smoke'?'smoke':pose);
   p.add(fallback);p.userData.fallback=true;
  });
  return p;
 }
 function brush(){const p=new T.Group();bone(p,[0,-.08,0],[0,.305,0],.009,.007,plastic);bone(p,[0,-.075,0],[0,.045,0],.013,.012,rubber);for(let n=0;n<8;n++){const ring=mesh(new T.TorusGeometry(.0126,.0015,5,14),rubber,p);ring.rotation.x=Math.PI/2;ring.position.y=-.06+n*.012;}
  oval(p,[0,.315,0],[.025,.024,.025],plastic);oval(p,[0,.365,0],[.033,.052,.033],material('#b5b29b',.97));
  const bristle=material('#c6c1a6',.95),tips=material('#e1d9bf',.9);for(let row=0;row<9;row++){const y=.325+row*.010;for(let n=0;n<24;n++){const a=n*Math.PI/12+row*.29,r=.034+Math.sin(row/8*Math.PI)*.018;const b=[Math.cos(a)*r,y+(.4-row/8)*.012,Math.sin(a)*r];bone(p,[Math.cos(a)*.029,y,Math.sin(a)*.029],b,.0018,.0011,n%4?bristle:tips);}}
  for(let n=0;n<15;n++){const a=n*2.4,r=Math.sqrt(n/15)*.024;bone(p,[Math.cos(a)*r,.409,Math.sin(a)*r],[Math.cos(a)*r*1.4,.435,Math.sin(a)*r*1.4],.0018,.001,bristle);}return p;
 }
 function heldBrush(){const p=new T.Group(),arm=anatomicalHand('brush');arm.position.set(.047,0,.006);arm.rotation.y=-Math.PI/2;p.add(arm);p.add(brush());return p;}
 function cupHand(){
  const p=new T.Group(),arm=anatomicalHand('cup');
  // Corrected from -90°: the palm must face the cup's curved wall.
  // Former rotation moved all fingertips AWAY from the cup.
  arm.position.set(.103,0,.012);
  arm.rotation.y=Math.PI/2;
  arm.scale.x=.72; // natural transverse spread: four fingertips line the cup wall
  p.add(arm);
  const cup=lathe(p,[[0,-.060],[.031,-.060],[.034,-.046],[.044,.091],[.046,.098],[.043,.101],[.041,.093],[.030,-.045],[0,-.045]],plastic);
  cup.userData.object='coffee-cup-gripped-by-same-hand';
  const coffee=mesh(new T.CircleGeometry(.040,48),material('#36281d',.25),p);coffee.rotation.x=-Math.PI/2;coffee.position.set(0,.086,0);
  for(let n=0;n<7;n++){const ring=mesh(new T.TorusGeometry(.034+n*.0014,.0008,6,40),plastic,p);ring.rotation.x=Math.PI/2;ring.position.set(0,-.034+n*.016,0);}return p;
 }
 function smokingHand(){
  // This pivot lies BETWEEN index and middle phalanges of the actual WebXR skin,
  // not on the thumb. Derived from the original 25-joint rest geometry.
  const p=new T.Group(),gripPoint=new T.Vector3(-.002,.087,-.003);
  // The actor sees the PALM while smoking, not the back of a hand turned inside out.
  // Rotate only the skin around the actual cigarette pinch: the cigarette must not rotate away from the lips.
  const palmRig=new T.Group();palmRig.position.copy(gripPoint);palmRig.rotation.y=Math.PI;
  const posedHand=anatomicalHand('smoke');posedHand.position.copy(gripPoint).multiplyScalar(-1);
  palmRig.add(posedHand);p.add(palmRig);
  const cigarette=new T.Group();p.add(cigarette);cigarette.position.copy(gripPoint);
  // The cigarette rests between the middle phalanges, with the filter toward the face (+Z).
  bone(cigarette,[0,0,.036],[0,0,.012],.004,.004,material('#bca381'));
  bone(cigarette,[0,0,.012],[0,0,-.049],.004,.004,material('#eee9d8'));
  bone(cigarette,[0,0,-.049],[0,0,-.053],.0041,.0038,material('#5d5b50'));
  bone(cigarette,[0,0,-.053],[0,0,-.054],.0037,.0034,material('#b15d35',.8,{emissive:'#57200b'}));
  return p;
 }
 function sanitary(){const toilet=new T.Group();lathe(toilet,[[0,0],[.11,0],[.13,.04],[.095,.21],[.13,.28],[.13,.30]],ceramic,[1,1,1.25]);const bowl=lathe(toilet,[[.09,.22],[.14,.25],[.20,.32],[.225,.40],[.225,.425],[.207,.44],[.186,.421],[.163,.36],[.10,.29],[.065,.28]],ceramic,[1,1,1.32]);bowl.position.z=.06;
  const water=mesh(new T.CircleGeometry(.065,28),material('#6d8e88',.14),toilet);water.rotation.x=-Math.PI/2;water.position.set(0,.282,.06);const seat=mesh(new T.TorusGeometry(.211,.013,9,40),material('#b8c8ba',.4),toilet);seat.rotation.x=Math.PI/2;seat.scale.y=1.30;seat.position.set(0,.45,.06);
  roundedBox(toilet,.37,.39,.15,[0,.63,-.25]);roundedBox(toilet,.39,.028,.17,[0,.845,-.25]);bone(toilet,[.13,.72,-.16],[.16,.72,-.16],.012,.012,chrome);tube(toilet,[[.17,.12,-.25],[.23,.12,-.25],[.23,.65,-.25]],.013);for(const x of [-.07,.07])oval(toilet,[x,.034,.04],[.009,.004,.009],chrome);
  const basin=new T.Group();lathe(basin,[[.035,-.145],[.11,-.14],[.22,-.06],[.28,.01],[.278,.035],[.259,.045],[.236,.022],[.19,-.035],[.10,-.095],[.025,-.098]],ceramic,[1,1,.78]);const drain=mesh(new T.CylinderGeometry(.025,.025,.004,24),chrome,basin);drain.position.y=-.097;for(let i=0;i<7;i++)oval(basin,[Math.cos(i)*.014,-.094,Math.sin(i)*.014],[.002,.001,.002],rubber);
  roundedBox(basin,.48,.05,.12,[0,0,-.20]);tube(basin,[[.07,.015,-.19],[.07,.20,-.19],[0,.20,-.15],[0,.15,-.09]],.014);bone(basin,[-.12,.02,-.19],[-.12,.07,-.19],.02,.017,chrome);bone(basin,[-.16,.07,-.19],[-.08,.07,-.19],.009,.009,chrome);tube(basin,[[0,-.14,0],[0,-.39,0],[0,-.43,-.10],[0,-.31,-.18],[0,-.31,-.32]],.023);return{toilet,basin};
 }
 return {openHand,anatomicalHand,heldBrush,cupHand,smokingHand,brush,sanitary,lathe,mesh,material,roundedBox};
}
