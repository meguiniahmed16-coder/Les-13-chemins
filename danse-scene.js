import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {loadQuaterniusDancer,poseQuaterniusDancer} from './danse-quaternius.js';
// Pilot only: real CC0 Quaternius Superhero Female from the free Standard pack.
// Preserve the old stage and dancers until this single replacement is approved.
const PILOT_MODEL='assets/danse/quaternius-superhero-female.glb';
function colourPilotActor(actor){
 const skin=new T.Color('#ca9279'),shirt=new T.Color('#70bdb6'),
  sleeve=new T.Color('#91d5cc'),pants=new T.Color('#333c58'),
  shoes=new T.Color('#252b3a'),contrast=new T.Color('#448f8b');
 const pos=actor.geometry.getAttribute('position');
 if(!pos||pos.count<1000)throw Error('Quaternius skin geometry missing');
 const colours=new Float32Array(pos.count*3);
 for(let i=0;i<pos.count;i++){
  const x=Math.abs(pos.getX(i)),y=pos.getY(i);
  let col=skin;
  // At rest: skin on head/hands; colourful short-sleeved shirt; fitted pants.
  if(y<.105)col=shoes;
  else if(y<1.015)col=pants;
  else if(y<1.49 && x<.46)col=shirt;
  else if(y<1.49 && x<.57)col=sleeve;
  if(y>1.17&&y<1.20&&x<.38)col=contrast; // small clothing seam
  const k=3*i;col.toArray(colours,k);
 }
 const geom=actor.geometry.clone();
 geom.setAttribute('color',new T.BufferAttribute(colours,3));
 geom.computeBoundingSphere();
 actor.geometry=geom;
 actor.material=new T.MeshStandardMaterial({vertexColors:true,roughness:.82,metalness:0});
 actor.frustumCulled=false; // dancing rig can exceed rest-pose bounds
}

function paintPilotEyes(eyes){
 // Paint the ORIGINAL skinned eye surface, without adding floating eyeballs.
 // These coordinates come from inspection of the actual Quaternius GLB:
 // white-eye surface +/-0.018..0.051 x, 1.640..1.673 y, ~0.075 z at front.
 const geometry=eyes.geometry.clone(),pos=geometry.getAttribute('position');
 if(!pos||pos.count<500)throw Error('Original Quaternius eye mesh missing');
 const colors=new Float32Array(pos.count*3);
 const sclera=new T.Color('#f1e5d8'),iris=new T.Color('#684a36'),
       rim=new T.Color('#4a352d'),pupil=new T.Color('#211c1b'),
       colour=new T.Color();
 const smooth=(v,a,b)=>T.MathUtils.smoothstep(v,a,b);
 let affected=0;
 for(let i=0;i<pos.count;i++){
  const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
  const dx=(Math.abs(x)-.0345)/.0086,dy=(y-1.656)/.0092;
  const d=Math.hypot(dx,dy);
  // Only FRONT surface vertices are painted. The sclera stays a single
  // curved eye; there are no separate giant spheres on the face.
  const front=smooth(z,.060,.069);
  const edge=(1-smooth(d,.92,1.18))*front;
  const pupilMask=(1-smooth(d,.34,.52))*front;
  colour.copy(sclera).lerp(rim,edge*.30).lerp(iris,edge*.88);
  colour.lerp(pupil,pupilMask);
  if(edge>.50)affected++;
  colour.toArray(colors,3*i);
 }
 if(affected<16)throw Error('Iris placement outside original eye surface');
 geometry.setAttribute('color',new T.BufferAttribute(colors,3));
 eyes.geometry=geometry;
 eyes.material=new T.MeshStandardMaterial({vertexColors:true,roughness:.39,metalness:0});
 eyes.userData.irisPainted=true;
 eyes.userData.irisVertexCount=affected;
 return affected;
}
function makePilotSmile(root,head){
 // The model already has sculpted lips. Never draw a second complete mouth:
 // the old dark V-shaped tube floated ~2 cm in front of the original lips.
 if(!head)return null;
 const smile=new T.Group();smile.name='SourireSculpte';
 root.add(smile);smile.position.set(0,1.585,.092);
 root.updateMatrixWorld(true);head.attach(smile);
 // Only two tiny mouth-corner creases, following the REAL skinned head.
 const mat=new T.MeshStandardMaterial({
   color:0x84594e,roughness:.95,transparent:true,opacity:.58,depthWrite:false
 });
 for(const side of [-1,1]){
  const c=new T.CatmullRomCurve3([
   new T.Vector3(side*.027,0,-.002),
   new T.Vector3(side*.033,.0035,-.003),
   new T.Vector3(side*.038,.007,-.006)
  ]);
  const corner=new T.Mesh(new T.TubeGeometry(c,10,.00085,5,false),mat);
  corner.name=side<0?'CoinGauche':'CoinDroit';smile.add(corner);
 }
 // A small existing hairstyle cap, correctly attached to the same head bone.
 const hair=new T.Group();hair.name='CoiffureOriginaleQuaternius';root.add(hair);
 hair.position.set(0,1.733,-.017);
 root.updateMatrixWorld(true);head.attach(hair);
 const cap=new T.Mesh(new T.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI*.54),
  new T.MeshStandardMaterial({color:0x322631,roughness:.95}));
 cap.scale.set(.121,.082,.112);hair.add(cap);
 return smile;
}
function loadPilotDancer(target){
 new GLTFLoader().load(PILOT_MODEL,gltf=>{
  const root=gltf.scene;
  const b=new T.Box3().setFromObject(root),size=b.getSize(new T.Vector3());
  if(size.y<1.3||!Number.isFinite(size.y))throw Error('Invalid Quaternius pilot model');
  const scale=1.77/size.y;root.scale.setScalar(scale);
  root.position.y=-b.min.y*scale;
  const bones=new Map();let body=null,eyes=null;
  root.traverse(o=>{
   if(o.isBone)bones.set(o.name.toLowerCase(),o);
   if(!o.isMesh&&!o.isSkinnedMesh)return;
   o.castShadow=true;o.receiveShadow=true;
   if(o.name==='Superhero_Female'){colourPilotActor(o);body=o;}
   else if(o.name==='Eyes'){paintPilotEyes(o);eyes=o;}
   else if(o.name==='Eyebrows')o.material=new T.MeshStandardMaterial({color:0x382b31,roughness:.91});
  });
  if(!body||!eyes?.userData.irisPainted||bones.size<60)throw Error('Quaternius skin, original iris or humanoid rig missing');
  const rest=new Map([...bones].map(([name,o])=>[name,o.quaternion.clone()]));
  const smile=makePilotSmile(root,bones.get('head'));
  target.group.add(root);
  target.group.children.forEach(child=>{if(child!==root)child.visible=false;});
  target.pilot={root,bones,rest,smile,eyes,baseY:root.position.y};
  // Une seule ressource féminine GLB : trois copies articulées dans la même scène.
  if(target.otherDancers)upgradeFemaleDancers(target.otherDancers,target.pilot);
 },undefined,err=>{
  // If the model cannot load, preserve the current character, not an empty gap.
  console.warn('Quaternius pilot unavailable; original dancer retained.',err);
 });
}

const CANDIDATE_SHIRTS=[0x6bb7ba,0xe7b564,0xac729e,0x92a38a,0xb9816d];
const CANDIDATE_SKINS=[0xb17a58,0xdca788,0xc99473,0x9e7159,0xe3b89a];
const CANDIDATE_HAIR=[0x342720,0x6a4a2b,0x292831,0x71452c,0x4b302a];
// Reuse the same 65-bone male Quaternius mesh already loaded for the playable
// character. The five background candidates do NOT download five extra models.

const FOREGROUND_AUDIENCE_SLOTS=Object.freeze([3,4,5]); // the three older heads nearest the camera
function upgradeForegroundAudience(publicRows,source){
 const tone=[0xd7a17b,0xd6b091,0x916048];
 const clothes=[0x669eaa,0x9f758e,0x8ca56a];
 const hairColors=[0x9c764b,0x44362e,0x28252a];
 const ready=FOREGROUND_AUDIENCE_SLOTS.map((seat,i)=>{
  const spectator=publicRows[seat];
  if(!spectator?.group)throw Error('Foreground seat missing: '+seat);
  // Use the already loaded real body and 65-bone armature: no new downloads.
  const root=cloneSkeleton(source.root);
  root.name='PublicPremierPlan3D'+(i+1);
  root.scale.setScalar(.80+(i===1?.045:0));
  root.position.set(0,-.18,0);
  root.traverse(obj=>{
   if(obj.isSkinnedMesh&&obj.geometry.getAttribute('position')?.count>5000){
    const geometry=obj.geometry.clone(),pos=geometry.getAttribute('position');
    const colors=new Float32Array(pos.count*3);
    const skin=new T.Color(tone[i]),shirt=new T.Color(clothes[i]),
      pants=new T.Color(0x3d394b),shoes=new T.Color(0x262532);
    for(let v=0;v<pos.count;v++){
     const y=pos.getY(v),x=Math.abs(pos.getX(v));
     const col=y<.155?shoes:y<1.00&&x<.35?pants:y>=1.03&&y<1.52&&x<.52?shirt:skin;
     col.toArray(colors,v*3);
    }
    geometry.setAttribute('color',new T.BufferAttribute(colors,3));
    obj.geometry=geometry;
    obj.material=new T.MeshStandardMaterial({vertexColors:true,roughness:.84,metalness:0});
    obj.frustumCulled=false;
   } else if(obj.name==='Cheveux'&&obj.isMesh){
    // One bareheaded spectator and two different hair tones.
    obj.visible=i!==1;
    if(i!==1){obj.material=obj.material.clone();obj.material.color.setHex(hairColors[i]);}
   }
  });
  const bones={},rest={};
  for(const name of Object.keys(source.bones)){
   const bone=root.getObjectByName(name);
   if(!bone?.isBone)throw Error('Foreground spectator bone missing: '+name);
   bones[name]=bone;rest[name]=bone.quaternion.clone();
  }
  const smile=root.getObjectByName('SourireQuaternius');
  if(!smile)throw Error('Foreground spectator head attachment missing');
  const pilot={root,bones,rest,smile,basePosition:root.position.clone()};
  return {spectator,root,pilot};
 });
 for(const {spectator,root,pilot} of ready){
  spectator.group.add(root);
  for(const child of spectator.group.children)if(child!==root)child.visible=false;
  spectator.realBody=pilot;
 }
}
function upgradeCandidatePanel(scene,candidates,source){
 const copies=candidates.map((candidate,i)=>{
  const root=cloneSkeleton(source.root);
  root.name='CandidatHumainQuaternius'+(i+1);
  root.position.copy(candidate.group.position);
  root.scale.setScalar(.80+(i%3)*.035);
  root.traverse(obj=>{
   if(obj.isSkinnedMesh&&obj.geometry.getAttribute('position')?.count>5000){
    const geo=obj.geometry.clone(),pos=geo.getAttribute('position');
    const colors=new Float32Array(pos.count*3);
    const skin=new T.Color(CANDIDATE_SKINS[i]),shirt=new T.Color(CANDIDATE_SHIRTS[i]);
    const pants=new T.Color([0x343c54,0x46404e,0x343b49,0x463b36,0x303e4b][i]);
    const shoes=new T.Color(0x27252a);
    for(let v=0;v<pos.count;v++){
     const x=Math.abs(pos.getX(v)),y=pos.getY(v);
     const color=y<.155?shoes:y<1.00&&x<.35?pants:y>=1.03&&y<1.52&&x<.52?shirt:skin;
     color.toArray(colors,v*3);
    }
    geo.setAttribute('color',new T.BufferAttribute(colors,3));
    obj.geometry=geo;
    obj.material=new T.MeshStandardMaterial({vertexColors:true,roughness:.83,metalness:0});
    obj.frustumCulled=false;
   }else if(obj.name==='Cheveux'&&obj.isMesh){
    obj.material=obj.material.clone();
    obj.material.color.setHex(CANDIDATE_HAIR[i]);
    obj.scale.x*=.92+(i%3)*.055;
   }
  });
  const bones={},rest={};
  for(const name of Object.keys(source.bones)){
   const bone=root.getObjectByName(name);
   if(!bone?.isBone)throw new Error('Os manquant pour le candidat '+(i+1)+': '+name);
   bones[name]=bone;rest[name]=bone.quaternion.clone();
  }
  const smile=root.getObjectByName('SourireQuaternius');
  if(!smile)throw new Error('Expression manquante pour le candidat '+(i+1));
  return {root,bones,rest,smile,basePosition:root.position.clone()};
 });
 // Replace the entire panel only AFTER all five genuine rigged bodies exist.
 for(const copy of copies)scene.add(copy.root);
 candidates.forEach((candidate,i)=>{candidate.quaternius=copies[i];candidate.group.visible=false;});
}

function dressFemaleClone(body,look){
 const geometry=body.geometry.clone(),pos=geometry.getAttribute('position');
 if(!body.isSkinnedMesh||!pos||pos.count<5000)throw Error('Vrai maillage féminin Quaternius absent');
 const skin=new T.Color(look.skin),top=new T.Color(look.shirt);
 const sleeves=new T.Color(look.shirt).offsetHSL(0,-.03,.08);
 const pants=new T.Color(0x34354c),shoes=new T.Color(0x292d37);
 const colors=new Float32Array(pos.count*3);
 for(let v=0;v<pos.count;v++){
  const y=pos.getY(v),x=Math.abs(pos.getX(v));
  const color=y<.105?shoes:y<1.015?pants:y<1.49&&x<.46?top:y<1.49&&x<.57?sleeves:skin;
  color.toArray(colors,v*3);
 }
 geometry.setAttribute('color',new T.BufferAttribute(colors,3));
 body.geometry=geometry;
 body.material=new T.MeshStandardMaterial({vertexColors:true,roughness:.83,metalness:0});
 body.frustumCulled=false;
}
function dressFemaleHair(root,head,look){
 // The afro of dancer 1 is NEVER changed. These three clones hide only
 // their own copy of the afro and use simple, distinct anchored hairstyles.
 const oldHair=root.getObjectByName('CoiffureOriginaleQuaternius');
 if(!oldHair)throw Error('Coiffure source Quaternius introuvable');
 oldHair.visible=false;
 const group=new T.Group();group.name='Coiffure_'+look.hairStyle;
 root.add(group);group.position.set(0,1.733,-.017);
 root.updateMatrixWorld(true);head.attach(group);
 const mat=new T.MeshStandardMaterial({color:look.hairColor,roughness:.95});
 const add=(x,y,z,sx,sy,sz)=>{
  const mesh=new T.Mesh(new T.SphereGeometry(1,12,9),mat);
  mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);group.add(mesh);
 };
 const cap=new T.Mesh(new T.SphereGeometry(1,22,10,0,Math.PI*2,0,Math.PI*.54),mat);
 cap.scale.set(.121,.082,.112);group.add(cap);
 if(look.hairStyle==='long'){ // blonde : cheveux longs, droits
  for(const side of [-1,1])add(side*.104,-.15,-.025,.026,.145,.034);
  add(0,-.125,-.115,.095,.14,.025);
 }else if(look.hairStyle==='ponytail'){ // rousse : queue de cheval
  add(0,-.035,-.121,.099,.07,.035);
  add(-.04,-.16,-.155,.031,.13,.030);
 }else if(look.hairStyle==='bob'){ // brune : carré court
  for(const side of [-1,1])add(side*.105,-.095,-.025,.030,.095,.038);
  add(0,-.06,-.117,.100,.077,.028);
 }else throw Error('Coiffure secondaire non reconnue : '+look.hairStyle);
}
function upgradeFemaleDancers(dancers,source){
 // Exactly three copies, from the same imported 65-bone *female* 3D body.
 // Prepare all clones before hiding any old simplified dancer.
 const prepared=dancers.slice(1).map((dancer,i)=>{
  const look=dancer.avatarLook;
  const root=cloneSkeleton(source.root);
  root.name='DanseuseQuaternius'+(i+2);
  root.position.set(0,source.baseY,0);
  root.rotation.set(0,0,0);
  const body=root.getObjectByName('Superhero_Female');
  const head=root.getObjectByName('Head');
  if(!body?.isSkinnedMesh||!head?.isBone)throw Error('Corps féminin articulé incomplet');
  const bones=new Map(),rest=new Map();
  root.traverse(node=>{
   if(node.isBone){
    const name=node.name.toLowerCase();
    const original=source.rest.get(name);
    if(original)node.quaternion.copy(original);
    bones.set(name,node);rest.set(name,node.quaternion.clone());
   }
  });
  if(bones.size<60)throw Error('Squelette féminin incomplet');
  dressFemaleClone(body,look);
  dressFemaleHair(root,head,look);
  const smile=root.getObjectByName('SourireSculpte');
  if(!smile)throw Error('Sourire original féminin absent');
  return {dancer,root,pilot:{root,bones,rest,smile,eyes:root.getObjectByName('Eyes'),baseY:root.position.y}};
 });
 for(const {dancer,root,pilot} of prepared){
  dancer.group.add(root);
  dancer.group.children.forEach(child=>{if(child!==root)child.visible=false;});
  dancer.pilot=pilot;
 }
}
function animatePilotDancer(h,t,dt,active){
 const p=h.pilot;if(!p)return;
 const energy=active?1:.22,beat=t/BEAT*Math.PI*2;
 const sn=Math.sin(beat),co=Math.cos(beat);
 // Reset all imported bones to their original rest quaternions each frame:
 // absolute dance poses, no accumulated twisting or broken joints.
 for(const [name,bone] of p.bones)bone.quaternion.copy(p.rest.get(name));
 p.root.position.y=p.baseY+Math.abs(sn)*.032*energy;
 p.root.rotation.z=.027*sn*energy;
 p.root.updateMatrixWorld(true);
 // Apply bends about STAGE/WORLD axes rather than the arbitrary local axes
 // of the imported armature. The female avatar begins in a T-pose.
 const X=new T.Vector3(1,0,0),Y=new T.Vector3(0,1,0),Z=new T.Vector3(0,0,1);
 function worldBend(name,axis,angle){
  const bone=p.bones.get(name);if(!bone?.parent||!Number.isFinite(angle))return;
  bone.parent.updateMatrixWorld(true);
  const parentQuat=bone.parent.getWorldQuaternion(new T.Quaternion());
  const localAxis=axis.clone().applyQuaternion(parentQuat.invert()).normalize();
  bone.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(localAxis,angle));
  bone.updateMatrixWorld(true);
 }
 worldBend('pelvis',Y,.028*sn*energy);
 worldBend('spine_02',Y,.08*co*energy);
 worldBend('spine_03',Z,.035*sn*energy);
 worldBend('head',Z,-.05*sn*energy);
 // Lower the outstretched arms before adding rhythmic swing. The sign is
 // deliberately mirrored: both wrists should end below the shoulders.
 worldBend('upperarm_l',Z,-1.18+.18*sn*energy);
 worldBend('upperarm_r',Z, 1.18-.18*Math.sin(beat+.65)*energy);
 worldBend('upperarm_l',X,-.12+.15*co*energy);
 worldBend('upperarm_r',X,-.12-.15*co*energy);
 worldBend('lowerarm_l',X,-.23-.10*Math.max(0,sn)*energy);
 worldBend('lowerarm_r',X,-.23-.10*Math.max(0,-sn)*energy);
 worldBend('thigh_l',X,.17*sn*energy);
 worldBend('thigh_r',X,-.17*sn*energy);
 worldBend('calf_l',X,.19*Math.max(0,-sn)*energy);
 worldBend('calf_r',X,.19*Math.max(0,sn)*energy);
 if(p.smile)p.smile.scale.y=.82+.18*energy+.10*Math.max(0,sn);
 p.root.updateMatrixWorld(true);
}

import {SoftwareRenderer} from './danse-software.js';
import {BEAT} from './danse-core.js';
const palette={purple:0x8736e8,mint:0x8fffd1,pink:0xff5aaf,gold:0xffca6e};
const mats=new Map();function material(color,metal=.0){const key=color+':'+metal;if(!mats.has(key))mats.set(key,new T.MeshStandardMaterial({color,roughness:metal?.32:.65,metalness:metal}));return mats.get(key);}
function mesh(g,m,parent,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function box(p,w,h,d,c,x=0,y=0,z=0){const o=mesh(new T.BoxGeometry(w,h,d,w>9?10:1,h>3?8:1,d>8?8:1),material(c),p,x,y,z);if(w>9)o.userData.layer=h<1?-6:-7;else if(h>3)o.userData.layer=-5;else if(h<.05)o.userData.layer=-3;return o;}
function ellipsoid(p,x,y,z,sx,sy,sz,c){const o=mesh(new T.SphereGeometry(1,16,12),material(c),p,x,y,z);o.scale.set(sx,sy,sz);return o;}
function cylinder(p,r1,r2,h,c,x=0,y=0,z=0){return mesh(new T.CylinderGeometry(r1,r2,h,16),material(c),p,x,y,z);}
function neon(p,w,h,d,c,x,y,z){return mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({color:c}),p,x,y,z);}
function sign(p,text,w,h,x,y,z,bg='#34214d',fg='#f5e7ff',size=80){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.fillStyle=fg;ctx.font=`700 ${size}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,132);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex}),p,x,y,z);m.userData.sign=y>3;return m;}
// High-resolution chapter banner: the literary title, not a game-show question.
function chapterBanner(stage){
 const canvas=document.createElement('canvas');
 canvas.width=4096;canvas.height=512;
 const ctx=canvas.getContext('2d');
 const bg=ctx.createLinearGradient(0,0,4096,512);
 bg.addColorStop(0,'#28123b');bg.addColorStop(.6,'#40205b');bg.addColorStop(1,'#191a3b');
 ctx.fillStyle=bg;ctx.fillRect(0,0,4096,512);
 ctx.save();
 ctx.shadowColor='#5ceadf';ctx.shadowBlur=28;
 ctx.strokeStyle='#7df9e7';ctx.lineWidth=11;ctx.strokeRect(28,25,4040,462);
 ctx.shadowBlur=0;ctx.strokeStyle='#ee80c9';ctx.lineWidth=5;
 ctx.strokeRect(47,43,4002,426);ctx.restore();
 const heading='Chapitre 3 — Le coup du bus';
 ctx.textAlign='center';ctx.textBaseline='middle';
 let size=224;
 ctx.font='bold '+size+'px Arial, sans-serif';
 const measured=ctx.measureText(heading).width;
 if(measured>3590){size=Math.floor(size*3590/measured);ctx.font='bold '+size+'px Arial, sans-serif';}
 ctx.shadowColor='#59e5dc';ctx.shadowBlur=17;ctx.fillStyle='#f2fffc';
 ctx.fillText(heading,2048,198);
 ctx.shadowBlur=12;ctx.shadowColor='#ff78c5';
 ctx.font='bold 138px Arial, sans-serif';ctx.fillStyle='#ffd0ef';
 ctx.fillText('P 54-56',2048,373);
 ctx.shadowBlur=0;
 const texture=new T.CanvasTexture(canvas);
 texture.colorSpace=T.SRGBColorSpace;
 texture.anisotropy=4;
 const panel=mesh(new T.PlaneGeometry(7.8,.975),
    new T.MeshBasicMaterial({map:texture,toneMapped:false}),stage,0,3.45,-6.4);
 panel.name='BanderoleChapitre3';
 panel.userData.sign=true;
 panel.userData.chapterTitle=heading;
 panel.userData.pages='P 54-56';
 panel.userData.textureSize=[4096,512];
 return panel;
}
const faceMaps=new Map();
// The face is one continuous surface: no floating eyeballs or polygonal mouth.
function faceMap(skin,female=false){const key=skin+':'+female;if(faceMaps.has(key))return faceMaps.get(key);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const c=canvas.getContext('2d');
 const base='#'+new T.Color(skin).getHexString();c.fillStyle=base;c.fillRect(0,0,512,256);
 const light=c.createRadialGradient(128,88,8,128,115,102);light.addColorStop(0,'rgba(255,232,210,.18)');light.addColorStop(.6,'rgba(255,220,190,.03)');light.addColorStop(1,'rgba(84,39,25,.13)');c.fillStyle=light;c.fillRect(30,0,196,256);
 // Small almond eyes, warm irises, soft brows and a closed, relaxed smile.
 for(const side of [-1,1]){const x=128+side*27,y=119;
  c.fillStyle='rgba(109,56,40,.15)';c.beginPath();c.ellipse(x,y+1,11,5,0,0,Math.PI*2);c.fill();
  c.fillStyle='#f4e7d8';c.beginPath();c.moveTo(x-9,y);c.quadraticCurveTo(x,y-6,x+9,y);c.quadraticCurveTo(x,y+4.8,x-9,y);c.fill();
  c.fillStyle='#5b3525';c.beginPath();c.ellipse(x,y-.2,3.1,3,0,0,Math.PI*2);c.fill();
  c.fillStyle='#251c1c';c.beginPath();c.arc(x,y,1.5,0,Math.PI*2);c.fill();c.fillStyle='#fff9ef';c.beginPath();c.arc(x-.8,y-1.1,.65,0,Math.PI*2);c.fill();
  c.strokeStyle='#78503c';c.lineWidth=1;c.lineCap='round';c.beginPath();c.moveTo(x-9,y);c.quadraticCurveTo(x,y-6,x+9,y);c.stroke();
  c.strokeStyle=female?'#503326':'#61402c';c.lineWidth=2;c.beginPath();c.moveTo(x-9,109+side*.5);c.quadraticCurveTo(x,105,x+9,109-side*.5);c.stroke();
 }
 const nose=c.createLinearGradient(121,0,137,0);nose.addColorStop(0,'rgba(107,55,38,0)');nose.addColorStop(.35,'rgba(107,55,38,.11)');nose.addColorStop(.55,'rgba(255,230,200,.15)');nose.addColorStop(1,'rgba(107,55,38,0)');c.fillStyle=nose;c.fillRect(121,122,16,22);
 c.strokeStyle='rgba(117,60,43,.45)';c.lineWidth=1;c.beginPath();c.moveTo(124,145);c.quadraticCurveTo(128,148,132,145);c.stroke();
 c.strokeStyle=female?'#995c57':'#884d40';c.lineWidth=1.8;c.lineCap='round';c.beginPath();c.moveTo(117,160);c.quadraticCurveTo(128,167,139,160);c.stroke();
 c.strokeStyle='rgba(255,211,190,.45)';c.lineWidth=1.5;c.beginPath();c.moveTo(121,165);c.quadraticCurveTo(128,168,135,165);c.stroke();
 const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;faceMaps.set(key,tex);return tex;
}
function makeHead(parent,skin,hair,female,simple,hairStyle='classic',hairColor=0x332326){const head=new T.Group();head.position.y=1.02;parent.add(head);
 const g=new T.SphereGeometry(1,simple?24:32,simple?16:22),pos=g.attributes.position;
 for(let i=0;i<pos.count;i++){const y=pos.getY(i);const jaw=y<-.15?1-Math.min(.23,(-y-.15)*.27):1;const x=pos.getX(i)*.134*jaw,hy=y*.172;let z=pos.getZ(i)*.133*(y<-.5?.92:1);if(z>0){z+=.015*Math.exp(-((x/.022)**2+((hy+.015)/.05)**2));z+=.008*Math.exp(-((x/.028)**2+((hy+.043)/.018)**2));}pos.setXYZ(i,x,hy,z);}g.computeVertexNormals();
 const skinMat=new T.MeshStandardMaterial({map:faceMap(skin,female),color:0xffffff,roughness:.84});const surface=mesh(g,skinMat,head);surface.userData.baseColor=skin;
 // The nose and ears are restrained volumes integrated into the head.
 
 for(const side of [-1,1]){ellipsoid(head,side*.132,-.015,-.004,.018,.033,.019,skin);}
 if(hair){
  const cap=mesh(new T.SphereGeometry(1,24,14,0,Math.PI*2,0,1.48),material(hairColor),head,0,.007,-.005);cap.scale.set(.139,.173,.139);
  if(female){
   if(hairStyle==='long'){ // blonde: loose straight hair down to her shoulders
    for(const side of [-1,1])ellipsoid(head,side*.115,-.16,-.047,.029,.17,.042,hairColor);
    ellipsoid(head,0,-.095,-.126,.106,.155,.033,hairColor);
   }else if(hairStyle==='ponytail'){ // redhead: tied hair
    ellipsoid(head,0,-.042,-.133,.095,.104,.042,hairColor);
    ellipsoid(head,-.045,-.17,-.172,.040,.12,.038,hairColor);
   }else if(hairStyle==='bob'){ // brunette: short straight bob, not afro
    for(const side of [-1,1])ellipsoid(head,side*.116,-.095,-.035,.038,.102,.045,hairColor);
    ellipsoid(head,0,-.052,-.130,.107,.086,.032,hairColor);
   }else{ellipsoid(head,0,-.065,-.115,.12,.17,.045,hairColor);ellipsoid(head,.04,.015,-.16,.065,.07,.06,hairColor);}
  }
 }
 head.userData.hairStyle=hairStyle;
 return head;
}
function human({shirt=palette.purple,skin=0xc58c69,pants=0x373349,hair=false,female=false,simple=false,hairStyle='classic',hairColor=0x332326}={}){
 const group=new T.Group(),hip=new T.Group(),body=new T.Group();hip.position.y=1.17;group.add(hip);hip.add(body);
 const profile=(female?[[.16,0],[.17,.13],[.15,.29],[.20,.48],[.23,.61],[.22,.69],[.10,.76]]:[[.18,0],[.19,.16],[.22,.36],[.26,.55],[.275,.65],[.245,.70],[.105,.77]]).map(([r,y])=>new T.Vector2(r,y));
 const torso=mesh(new T.LatheGeometry(profile,32),material(shirt),body);torso.scale.z=.61;
 cylinder(body,.065,.078,.17,skin,0,.83,0);
 const head=makeHead(body,skin,hair,female,simple,hairStyle,hairColor);
 if(!female){for(let i=0;i<4;i++)ellipsoid(body,0,.17+i*.12,.143,.007,.007,.005,0xd1a8f4);
  for(const side of [-1,1]){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([side*.015,.76,.076,side*.11,.70,.18,side*.067,.60,.19,side*.015,.76,.076,side*.067,.60,.19,side*.01,.69,.18],3));g.computeVertexNormals();const m=new T.MeshStandardMaterial({color:new T.Color(shirt).offsetHSL(0,-.02,.07),side:T.DoubleSide,roughness:.8});mesh(g,m,body);}
  box(body,.36,.035,.245,0x302438,0,.02,0);box(body,.038,.029,.012,0xa89aa9,0,.02,.13);
 }
 if(female){const skirt=cylinder(hip,.17,.29,.34,shirt,0,-.12,0);skirt.scale.z=.72;}
 if(!female)ellipsoid(hip,0,-.06,0,.185,.15,.12,pants);
 const arms=[],legs=[];
 for(const side of [-1,1]){const shoulder=new T.Group();shoulder.position.set(side*(female?.225:.265),.66,0);body.add(shoulder);const elbow=new T.Group();elbow.position.y=-.37;shoulder.add(elbow);
  cylinder(shoulder,.063,.048,.37,female?skin:shirt,0,-.185,0);ellipsoid(shoulder,0,-.025,0,.068,.085,.062,female?skin:shirt);cylinder(elbow,.052,.036,.33,female?skin:shirt,0,-.165,0);
  if(!female)cylinder(elbow,.039,.039,.045,shirt,0,-.315,0);
  ellipsoid(elbow,0,-.38,.005,.041,.065,.027,skin);ellipsoid(elbow,-side*.032,-.36,.016,.017,.034,.018,skin);arms.push({shoulder,elbow});
  const upper=new T.Group();upper.position.set(side*.135,0,0);hip.add(upper);const knee=new T.Group();knee.position.y=-.55;upper.add(knee);
  cylinder(upper,.098,.066,.55,female?skin:pants,0,-.275,0);ellipsoid(upper,0,-.05,0,.1,.115,.09,female?skin:pants);cylinder(knee,.065,.044,.51,female?skin:pants,0,-.255,0);ellipsoid(knee,0,-.54,.065,.065,.045,.135,female?0xe7cbdc:0xc7c1cf);legs.push({upper,knee});
 }
 group.traverse(o=>{if(o.isMesh)o.userData.character=true;});return {group,hip,body,head,arms,legs};
}
function pose(h,t,action='cross',power=1){const beat=t/BEAT*Math.PI*2,s=Math.sin(beat),s2=Math.sin(beat/2),swing=.28*power;
 h.hip.position.y=1.15+Math.abs(s)*.045*power;h.hip.rotation.z=s2*.055*power;h.body.rotation.y=s2*.14*power;h.body.rotation.z=-s2*.065*power;h.head.rotation.z=s2*.045*power;
 h.group.rotation.y=action==='circle'?t%1.3/1.3*Math.PI*2:0;
 h.arms.forEach(({shoulder,elbow},i)=>{const side=i===0?-1:1;shoulder.rotation.set(swing*Math.sin(beat+side),0,side*(.2+Math.max(0,s)*.12));elbow.rotation.x=-.6-Math.max(0,-s)*.5*power;if(action==='square'){shoulder.rotation.z=side*(1.35+Math.sin(beat/2)*.25);shoulder.rotation.x=-.3;elbow.rotation.x=-.7;}if(action==='circle'){shoulder.rotation.z=side*1.15;elbow.rotation.x=-.35;}});
 h.legs.forEach(({upper,knee},i)=>{const side=i===0?-1:1;upper.rotation.x=side*s*.22*power;upper.rotation.z=side*(.05+Math.abs(s)*.07*power);knee.rotation.x=Math.max(0,-side*s)*.35*power;});
 if(action==='left'||action==='right'){h.body.rotation.z=(action==='left'?1:-1)*.12;h.legs[0].upper.rotation.z=-.21;h.legs[1].upper.rotation.z=.21;}
}
export class DanceScene{
 constructor(canvas){this.canvas=canvas;this.reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;this.low=matchMedia('(max-width:650px)').matches;try{this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch{this.renderer=new SoftwareRenderer(canvas);this.low=true;}this.renderer.setPixelRatio(Math.min(devicePixelRatio,this.low?1.25:1.6));this.renderer.shadowMap.enabled=!this.low;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;this.scene=new T.Scene();this.scene.background=new T.Color(0x21102e);this.scene.fog=new T.Fog(0x21102e,25,50);this.camera=new T.PerspectiveCamera(43,1,.1,70);
 this.scene.add(new T.HemisphereLight(0xf5dcff,0x47315e,2.1));const key=new T.DirectionalLight(0xfff0db,3.3);key.position.set(-3,8,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-10;key.shadow.camera.right=10;key.shadow.camera.top=10;key.shadow.camera.bottom=-10;this.scene.add(key);const fill=new T.DirectionalLight(0x9ddfff,1.4);fill.position.set(6,4,1);this.scene.add(fill);const rim=new T.DirectionalLight(0xe78dff,2);rim.position.set(-5,5,-4);this.scene.add(rim);
 this.build();this.resize();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas.parentElement);canvas.dataset.renderer=this.renderer.isSoftware?'3D compatible':'WebGL 2';
 }
 build(){const s=this.scene;
 box(s,24,.3,18,0x1d152e,0,-.3,0);box(s,15,.18,9,0x433154,0,-.17,-1.3);box(s,15,.08,9.1,0x9253bd,0,-.18,-1.3);
 for(let x=-6;x<=6;x+=2)for(let z=-4;z<=2;z+=2)box(s,1.97,.012,1.97,(x+z)%4===0?0x51345f:0x614474,x,0,z);
 for(const z of [-5.8,3.1])neon(s,15,.04,.04,palette.pink,0,.03,z);for(const x of [-7.5,7.5])neon(s,.04,.04,9,palette.mint,x,.03,-1.35);
 box(s,22,8,.5,0x2e173f,0,3.7,-7);for(let x=-10;x<=10;x+=1.3){box(s,.28,7,.15,x%2?0x543174:0x402351,x,3.3,-6.65);}
 for(const x of [-7.2,-5.2,5.2,7.2]){cylinder(s,.22,.22,6.7,0x775498,x,3.1,-5.8);neon(s,.09,6.2,.09,x<0?palette.pink:palette.mint,x,3,-5.55);}
 chapterBanner(s);sign(s,'LE GRAND JEU  •  STUDIO 13',6,.3,0,2.85,-6.25,'#322043','#d6b8ef',43);
 const ring=mesh(new T.TorusGeometry(2.9,.055,6,60,Math.PI),new T.MeshBasicMaterial({color:palette.pink}),s,0,3.05,-6.15);ring.scale.set(1.7,.7,1);
 this.candidates=[];const colors=[0x6bb7ba,0xe7b564,0xac729e,0x92a38a,0xb9816d];for(let i=0;i<5;i++){const x=(i-2)*1.7;const h=human({shirt:colors[i],skin:i%2?0xdca788:0xb17a58,hair:true,simple:true});h.group.position.set(x,.14,-4.8);h.group.scale.setScalar(.85);s.add(h.group);this.candidates.push(h);box(s,1.35,1.1,.75,0x6e4593,x,.55,-4.25);box(s,1.48,.1,.88,0xb7a0d1,x,1.14,-4.25);neon(s,1.06,.06,.02,palette.mint,x,.32,-3.86);sign(s,String(i+1),.36,.3,x,.73,-3.86,'#573674','#d6fff1',130);}
 // Soft oval pools place each performer on the polished stage.
 for(const [x,z,r] of [[0,.45,1.3],[-2.1,-.7,.8],[2.1,-.7,.8],[-3.6,-1.9,.7],[3.6,-1.9,.7]]){const disk=mesh(new T.CircleGeometry(r,32),new T.MeshBasicMaterial({color:x<0?0xbd73a1:x>0?0x6aada5:0xa985c7}),s,x,.025,z);disk.rotation.x=-Math.PI/2;disk.userData.layer=-2;}
 this.hero=human();this.hero.group.position.set(0,.04,.45);this.hero.group.scale.setScalar(1.2);s.add(this.hero.group);
 // Le lecteur incarne un HOMME issu du récit. Garder l'ancien modèle comme repli.
 this.featuredDancer=null;this.destroyed=false;
 if(!this.renderer.isSoftware){
  loadQuaterniusDancer(s,this.hero.group.position).then(avatar=>{
   if(this.destroyed){s.remove(avatar.root);return;}
   this.featuredDancer=avatar;
   this.hero.group.visible=false;
   this.canvas.dataset.featuredDancer='quaternius-cc0';
   try{upgradeCandidatePanel(s,this.candidates,avatar);}
   catch(err){console.warn('Les cinq candidats gardent leurs silhouettes de repli.',err);}
   try{upgradeForegroundAudience(this.public,avatar);}
   catch(err){console.warn('Les trois spectateurs du premier plan gardent leurs silhouettes de repli.',err);}
  }).catch(err=>{
   console.warn('Danseur masculin indisponible, personnage précédent conservé.',err);
   this.canvas.dataset.featuredDancer='fallback';
  });
 }
 const danceLooks=[
  {shirt:0x70bdb6,skin:0x9e664b,hairColor:0x322631,hairStyle:'afro'}, // Quaternius : coiffure afro préservée
  {shirt:0x595ba6,skin:0xe7bea4,hairColor:0xe9c668,hairStyle:'long'}, // blonde
  {shirt:0x67bd9d,skin:0xe5ae92,hairColor:0xb95f38,hairStyle:'ponytail'}, // rousse
  {shirt:0xd98aa9,skin:0xc18b70,hairColor:0x35242a,hairStyle:'bob'} // brune
 ];
 this.dancers=[];for(const [i,[x,z]] of [[-2.1,-.7],[2.1,-.7],[-3.6,-1.9],[3.6,-1.9]].entries()){
  const h=human({...danceLooks[i],female:true,hair:true});
  h.group.position.set(x,.04,z);h.group.scale.setScalar(1.02);h.baseX=x;h.baseZ=z;
  h.avatarLook=danceLooks[i];
  s.add(h.group);this.dancers.push(h);
  if(i===0){h.otherDancers=this.dancers;loadPilotDancer(h);} // Une afro, trois autres coiffures
 }
 this.lionel=human({shirt:0xadc1c2,pants:0x2b253a,skin:0xd1a084,hair:true});this.lionel.group.position.set(4.7,.04,-.5);this.lionel.group.scale.setScalar(.92);s.add(this.lionel.group);sign(s,'LIONEL',1.2,.3,4.7,2.35,-.45,'#30233f','#b6ffdc',78);
 // Sixteen varied TV-studio spectators: background detail, not another game.
 // Retain the two rows and all seats; vary only clothes, skin, hair and reactions.
 const audienceClothes=[0x8f629c,0x4f98a9,0xbf8557,0x659077,0xa45182,0x6679b8,0xba9b66,0x58858b];
 const audienceSkins=[0xb47b58,0xe0b28e,0x94644c,0xf0c6a5,0xc78d65,0xb37b5b,0xe8bd99,0x805443];
 const audienceHair=[0x2f262c,0x714c35,0x3f3135,0x997141,0x27252c,0x59362c,0x312c2b,0xb17a4c];
 this.public=[];
 for(let row=0;row<2;row++)for(let i=0;i<8;i++){
  const index=row*8+i,x=(i-3.5)*1.16,z=4.2+row*1.4;
  box(s,1,.58,.85,0x46274f,x,.1+row*.22,z);
  const g=new T.Group();
  g.position.set(x,.25+row*.22,z);
  g.rotation.y=Math.PI;
  s.add(g);
  const shirt=audienceClothes[(i+row*3)%audienceClothes.length];
  const skin=audienceSkins[(i+row*5)%audienceSkins.length];
  const hair=audienceHair[(i+row*2)%audienceHair.length];
  const height=.94+(index%5)*.026,build=.9+(index%4)*.07;
  const torso=ellipsoid(g,0,.70,0,.255*build,.33*height,.18,shirt);
  const neck=ellipsoid(g,0,1.015,0,.063,.060,.065,skin);
  const head=new T.Group();head.position.set(0,1.17,0);g.add(head);
  ellipsoid(head,0,0,0,.146,.189,.143,skin);
  const hairStyle=index%5;
  if(hairStyle!==4){ // A few spectators are bald; no artificial hair cap.
   const cap=ellipsoid(head,0,.12,-.017,.153,.095,.15,hair);
   if(hairStyle===0){ // short crop
    cap.scale.y*=.72;
   }else if(hairStyle===1){ // straight bob
    ellipsoid(head,-.124,-.054,-.038,.036,.112,.053,hair);
    ellipsoid(head,.124,-.054,-.038,.036,.112,.053,hair);
   }else if(hairStyle===2){ // bun
    ellipsoid(head,0,.177,-.115,.068,.063,.071,hair);
   }else{ // loose curls, small irregular silhouette
    for(const side of [-1,1])ellipsoid(head,side*.107,.070,-.05,.068,.083,.07,hair);
   }
  }
  const arms=[];
  for(const side of [-1,1]){
   const arm=new T.Group();arm.position.set(side*.235,.85,0);g.add(arm);
   cylinder(arm,.06,.051,.24,shirt,0,-.115,0);
   const elbow=new T.Group();elbow.position.y=-.235;arm.add(elbow);
   cylinder(elbow,.045,.034,.23,skin,0,-.115,0);
   ellipsoid(elbow,0,-.245,0,.039,.051,.040,skin);
   arms.push({arm,elbow});
  }
  this.public.push({group:g,head,arms,reaction:index%4,phase:index*.79});
 }
 // Studio cameras, rails, speaker stacks and lighting rig.
 for(const x of [-6.3,6.3]){box(s,.8,1.5,.7,0x191622,x,.75,3.5);for(const y of [.45,1.05]){const sp=cylinder(s,.24,.24,.05,0x3f354e,x,y,3.88);sp.rotation.x=Math.PI/2;}cylinder(s,.05,.05,1.1,0x4a4057,x,1.95,3.5);box(s,.65,.4,.7,0x252233,x,2.65,3.5);const lens=cylinder(s,.16,.2,.24,0x1a1723,x,2.65,3.02);lens.rotation.x=Math.PI/2;for(const side of [-1,1]){const leg=cylinder(s,.025,.025,1.7,0x625669,x+side*.3,.8,3.5);leg.rotation.z=side*-.35;}}
 box(s,19,.16,.2,0x8c719e,0,6.1,-2.8);for(let i=-3;i<=3;i++){box(s,.5,.35,.65,0x2b2434,i*2.3,5.9,-2.8);const lens=cylinder(s,.18,.18,.04,i%2?palette.pink:palette.mint,i*2.3,5.65,-2.53);lens.rotation.x=Math.PI/4;}
 this.confetti=[];for(let i=0;i<40;i++){const o=mesh(new T.PlaneGeometry(.07,.17),new T.MeshBasicMaterial({color:[palette.pink,palette.mint,palette.gold,0xc69aff][i%4],side:T.DoubleSide}),s,(i%10-4.5)*1.1,4+(i%7)*.3,(i%5)*.6);o.visible=false;this.confetti.push(o);}
 }
 resize(){const b=this.canvas.parentElement.getBoundingClientRect();this.renderer.setSize(b.width,b.height,false);this.camera.aspect=b.width/b.height;const narrow=this.camera.aspect<1.3;this.camera.fov=narrow?44:38;this.camera.position.set(narrow?.1:1.3,narrow?3.1:3.5,narrow?6.8:7.2);this.camera.lookAt(0,1.15,-.4);this.camera.updateProjectionMatrix();}
 update(r,dt){const t=r.clock,active=['playing','practice','break','countdown','won'].includes(r.phase),recent=t-r.actionAt<1.1;const action=recent?r.action:'cross';const power=active?1:.25;pose(this.hero,t,action,power);this.hero.group.position.x=recent&&(action==='left'||action==='right')?(action==='left'?-.35:.35)*Math.sin(Math.min(1,(t-r.actionAt)/1.1)*Math.PI):0;
 if(action==='circle')this.hero.group.rotation.y=T.MathUtils.smoothstep(t-r.actionAt,0,1.1)*Math.PI*2;this.dancers.forEach((h,i)=>{pose(h,t+(i%2)*.12,active?action:'cross',power*.85);if(h.pilot)animatePilotDancer(h,t,dt,active);if(action==='circle')h.group.rotation.y=this.hero.group.rotation.y;});this.candidates.forEach((h,i)=>{
  if(h.quaternius)poseQuaterniusDancer(h.quaternius,t+i*.3,'cross',.12,false,h.group.position,(i-2)*.04);
  else{pose(h,t+i*.3,'cross',.12);h.group.rotation.y=0;}
 });pose(this.lionel,t,'square',r.phase==='won'?1:.1);if(r.phase!=='won'){this.lionel.arms[0].shoulder.rotation.z=-.1;this.lionel.arms[1].shoulder.rotation.z=.15;this.lionel.arms[0].elbow.rotation.x=-1.2;}
 // Independent but restrained audience reactions: clapping, cheering and nodding.
 for(const p of this.public){
  if(p.realBody){
   poseQuaterniusDancer(p.realBody,t+p.phase*.1,'cross',.09,false);
   continue;
  }
  const pulse=Math.sin(t*5.4+p.phase),cheer=active&&p.reaction===1;
  const clap=active&&p.reaction===0;
  p.group.rotation.z=(active?.018:.006)*Math.sin(t*2.6+p.phase);
  p.head.rotation.y=.12*Math.sin(t*1.4+p.phase);
  p.head.rotation.z=(active?.07:.02)*Math.sin(t*2.9+p.phase);
  p.arms.forEach(({arm,elbow},j)=>{
   const side=j===0?-1:1;
   arm.rotation.z=cheer?side*(2.12+.18*pulse):clap?side*(.75+.18*pulse):side*(.17+.13*Math.max(0,pulse));
   arm.rotation.x=cheer?-.48:clap?-.35:active?-.22:-.04;
   elbow.rotation.x=clap?-.72-.16*pulse:cheer?-.32:-.13;
  });
 }
 if(r.phase==='won'){this.hero.arms[0].shoulder.rotation.z=-1.4;this.hero.arms[1].shoulder.rotation.z=1.4;this.hero.head.rotation.x=-.15;this.confetti.forEach((o,i)=>{o.visible=!this.reduced;o.position.y=5.5-((r.time*.8+i*.19)%5.7);o.rotation.z=t+i;});}else this.confetti.forEach(o=>o.visible=false);
 if(this.featuredDancer){
  poseQuaterniusDancer(this.featuredDancer,t,action,power,r.phase==='won',this.hero.group.position,this.hero.group.rotation.y);
 }
 this.renderer.render(this.scene,this.camera);}
 dispose(){this.destroyed=true;this.observer.disconnect();this.renderer.dispose();}
}
