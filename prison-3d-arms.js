import {BufferAttribute,Color,Group,Matrix4,MeshStandardMaterial,Quaternion,Vector3,MathUtils} from 'three';

const UP=new Vector3(0,1,0);
const DOWN=new Vector3(0,-1,0);
const clamp=MathUtils.clamp;
const blend=(speed,dt)=>1-Math.exp(-speed*dt);
const finiteVector=v=>v&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&Number.isFinite(v.z);

function quaternionFromFrame(direction,normal){
 const x=direction.clone().normalize();
 const y=normal.clone().addScaledVector(x,-normal.dot(x)).normalize();
 const z=new Vector3().crossVectors(x,y).normalize();
 return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(x,y,z));
}

function worldQuaternion(bone,quaternion){
 const parent=bone.parent.getWorldQuaternion(new Quaternion()).invert();
 bone.quaternion.copy(parent.multiply(quaternion)).normalize();
 bone.updateWorldMatrix(false,true);
}

/** Two rigid bone segments: the wrist can approach, but never stretch an arm. */
function solveArm(arm,wrist,pole){
 const shoulder=arm.upper.getWorldPosition(new Vector3());
 const direction=wrist.clone().sub(shoulder);
 const distance=clamp(direction.length(),Math.abs(arm.upperLength-arm.lowerLength)+.002,arm.upperLength+arm.lowerLength-.003);
 if(direction.lengthSq()<1e-10)direction.set(0,-1,0);
 direction.normalize();
 const bend=pole.clone().addScaledVector(direction,-pole.dot(direction));
 if(bend.lengthSq()<1e-8)bend.set(0,1,0).addScaledVector(direction,-direction.y);
 bend.normalize();
 const along=(arm.upperLength**2-arm.lowerLength**2+distance**2)/(2*distance);
 const height=Math.sqrt(Math.max(0,arm.upperLength**2-along**2));
 const elbow=shoulder.clone().addScaledVector(direction,along).addScaledVector(bend,height);
 const endpoint=shoulder.clone().addScaledVector(direction,distance);
 for(const [bone,child,destination] of [[arm.upper,arm.lower,elbow],[arm.lower,arm.hand,endpoint]]){
  const origin=bone.getWorldPosition(new Vector3());
  const before=child.getWorldPosition(new Vector3()).sub(origin).normalize();
  const after=destination.clone().sub(origin).normalize();
  const turn=new Quaternion().setFromUnitVectors(before,after);
  worldQuaternion(bone,turn.multiply(bone.getWorldQuaternion(new Quaternion())));
 }
}

/**
 * The real Quaternius skin and skeleton, restricted to arms and hands. The
 * supplied GLTF is owned by this view model; its full-body mesh is not reused.
 * `target` is a world-space palm/handle centre, not a wrist joint. `reach` is
 * 0..1. Optional `handleAxis` is the unoriented world axis of the cylinder
 * gripped by the right hand. Root position uses the actual eyes, rather than
 * the neck/head pivot.
 */
export function createPrisonArms(gltf){
 if(!gltf?.scene)throw new TypeError('Le personnage GLTF est nécessaire.');
 const root=new Group();root.name='PrisonFirstPersonArms';root.add(gltf.scene);
 root.updateMatrixWorld(true);
 const bones={};root.traverse(object=>{if(object.isBone)bones[object.name]=object;});
 const required=['upperarm_r','lowerarm_r','hand_r','upperarm_l','lowerarm_l','hand_l'];
 if(required.some(name=>!bones[name]))throw new Error('Le squelette Quaternius ne contient pas les deux bras.');
 const rest=new Map(Object.values(bones).map(bone=>[bone,bone.quaternion.clone()]));
 const ownedGeometries=[],ownedMaterials=[];
 const eyes=gltf.scene.getObjectByName('Eyes');
 let eyeAnchor=new Vector3(0,1.69857,.06594);
 if(eyes?.isSkinnedMesh){
  // GLTF geometry is in the mesh bind frame. Average bounds of the actual
  // eye vertices is a more faithful eye height than the Head joint.
  eyes.geometry.computeBoundingBox();
  eyeAnchor=eyes.geometry.boundingBox.getCenter(new Vector3()).applyMatrix4(eyes.matrixWorld);
 }
 const allowed=new Set();
 for(const side of ['r','l'])bones['upperarm_'+side].traverse(bone=>{if(bone.isBone)allowed.add(bone);});
 const skin=new Color('#bb947c'),sleeve=new Color('#505b62');
 root.traverse(mesh=>{
  if(!mesh.isMesh)return;
  if(!mesh.isSkinnedMesh||mesh.name!=='SuperHero_Male'){mesh.visible=false;return;}
  const geometry=mesh.geometry.clone(),indices=geometry.index,weights=geometry.attributes.skinWeight,skinIndices=geometry.attributes.skinIndex;
  const armWeight=new Float32Array(weights.count);
  for(let vertex=0;vertex<weights.count;vertex++){
   for(let influence=0;influence<4;influence++){
    if(allowed.has(mesh.skeleton.bones[skinIndices.getComponent(vertex,influence)]))
     armWeight[vertex]+=weights.getComponent(vertex,influence);
   }
  }
  const filtered=[];
  for(let i=0;i<indices.count;i+=3){
   const a=indices.getX(i),b=indices.getX(i+1),c=indices.getX(i+2);
   // Requiring all three vertices to belong to an arm also removes the neck,
   // chest and leg triangles crossing a joint boundary.
   if(armWeight[a]>=.5&&armWeight[b]>=.5&&armWeight[c]>=.5)filtered.push(a,b,c);
  }
  if(!filtered.length)throw new Error('Aucun triangle de bras trouvé dans le personnage.');
  geometry.setIndex(filtered);geometry.clearGroups();
  const colors=new Float32Array(geometry.attributes.position.count*3);
  for(let i=0;i<geometry.attributes.position.count;i++){
   const nativeX=Math.abs(geometry.attributes.position.getX(i));
   const color=nativeX<.43?sleeve:skin;
   color.toArray(colors,i*3);
  }
  geometry.setAttribute('color',new BufferAttribute(colors,3));
  const material=new MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.82,metalness:0,flatShading:false});
  mesh.geometry=geometry;mesh.material=material;mesh.frustumCulled=false;
  mesh.castShadow=false;mesh.receiveShadow=true;
  mesh.name='PrisonArmsSkin';
  ownedGeometries.push(geometry);ownedMaterials.push(material);
 });

 function describeArm(side){
  const upper=bones['upperarm_'+side],lower=bones['lowerarm_'+side],hand=bones['hand_'+side];
  const wrist=hand.getWorldPosition(new Vector3());
  const middle=bones['middle_01_'+side].getWorldPosition(new Vector3());
  const index=bones['index_01_'+side].getWorldPosition(new Vector3());
  const pinky=bones['pinky_01_'+side].getWorldPosition(new Vector3());
  const finger=middle.clone().sub(wrist).normalize();
  const palm=new Vector3().crossVectors(finger,pinky.sub(index)).normalize().multiplyScalar(side==='r'?1:-1);
  const bindHand=hand.getWorldQuaternion(new Quaternion());
  const nativeFrame=quaternionFromFrame(finger,palm);
  // The 32 mm handle sits below the metacarpal heads, where the four fingers
  // can wrap around it, rather than near the centre of the long palm.
  const palmPoint=wrist.clone().addScaledVector(finger,.110).addScaledVector(palm,.034);
  const gripLocal=hand.worldToLocal(palmPoint.clone());
  const joints=[];
  for(const name of ['index','middle','ring','pinky']){
   // MCP joints are staggered along the hand. Different flexion lets all four
   // fingers follow the same cylinder without the shorter pinky cutting in.
   const flexion={index:[1.05,1.0,.65],middle:[1.0,1.20,.95],ring:[.75,1.10,1.0],pinky:[.20,.80,1.10]}[name];
   for(let joint=1;joint<=3;joint++){
    const bone=bones[`${name}_0${joint}_${side}`];
    const axis=new Vector3(0,0,side==='r'?1:-1).applyQuaternion(bone.getWorldQuaternion(new Quaternion()).invert()).normalize();
    joints.push({bone,axis,angle:flexion[joint-1]});
   }
  }
  const thumb=bones['thumb_01_'+side];
  const thumbBase=thumb.getWorldPosition(new Vector3());
  const thumbTip=bones['thumb_04_leaf_'+side].getWorldPosition(new Vector3());
  const before=thumbTip.sub(thumbBase).normalize();
  // The thumb crosses toward the index, on the palm side of the handle.
  // Its distal joints flex back toward the palm rather than opening outward.
  const thumbSide=index.clone().sub(middle);
  thumbSide.addScaledVector(finger,-thumbSide.dot(finger)).addScaledVector(palm,-thumbSide.dot(palm)).normalize();
  const thumbTarget=hand.worldToLocal(palmPoint.clone().addScaledVector(finger,.018).addScaledVector(palm,.022).addScaledVector(thumbSide,.035));
  const thumbFlex=new Vector3().crossVectors(before,palm).normalize().negate();
  for(let joint=2;joint<=3;joint++){
   const bone=bones[`thumb_0${joint}_${side}`];
   joints.push({bone,axis:thumbFlex.clone().applyQuaternion(bone.getWorldQuaternion(new Quaternion()).invert()),angle:joint===2?.60:.65});
  }
  return {side,upper,lower,hand,joints,gripLocal,thumb,thumbTarget,thumbTip:bones['thumb_04_leaf_'+side],
   upperLength:upper.getWorldPosition(new Vector3()).distanceTo(lower.getWorldPosition(new Vector3())),
   lowerLength:lower.getWorldPosition(new Vector3()).distanceTo(wrist),
   handFrame:nativeFrame.invert().multiply(bindHand)};
 }
 const right=describeArm('r'),left=describeArm('l');
 const grip=new Vector3(),lastTarget=new Vector3();
 let closure=0,extension=0,lastYaw=Math.PI,hasLastTarget=false;

 function update(camera,{dt=1/60,time=0,target=null,reach=0,gripping=false,visible=true,handleAxis=null}={}){
  const elapsed=Number.isFinite(dt)?clamp(dt,0,.1):0;
  closure+=(Number(Boolean(gripping))-closure)*blend(18,elapsed);
  const hasTarget=finiteVector(target);
  if(hasTarget){lastTarget.copy(target);hasLastTarget=true;}
  extension+=((hasTarget?clamp(Number.isFinite(reach)?reach:0,0,1):0)-extension)*blend(hasTarget?14:7,elapsed);
  root.visible=Boolean(visible);
  camera.updateWorldMatrix(true,false);
  const eye=camera.getWorldPosition(new Vector3());
  const cameraRotation=camera.getWorldQuaternion(new Quaternion());
  const forward=camera.getWorldDirection(new Vector3());
  if(Math.hypot(forward.x,forward.z)>.001)lastYaw=Math.atan2(forward.x,forward.z);
  root.quaternion.setFromAxisAngle(UP,lastYaw);
  root.position.copy(eye).sub(eyeAnchor.clone().applyQuaternion(root.quaternion));
  for(const [bone,rotation] of rest)bone.quaternion.copy(rotation);
  root.updateMatrixWorld(true);
  const breath=Number.isFinite(time)?Math.sin(time*1.7)*.0025:0;
  // A fixed 26 cm wrist spread is outside a portrait phone's frustum. Keep
  // the idle hands near its lower corners while retaining their real scale.
  const halfView=Math.tan((Number.isFinite(camera.fov)?camera.fov:65)*Math.PI/360);
  const wristSpread=Math.min(.26,Math.max(.10,halfView*(camera.aspect||1.6)*.44*.8+.015));
  const wristDrop=Math.min(.23,halfView*.37*.65);
  for(const arm of [right,left]){
   const sign=arm.side==='r'?1:-1;
   const amount=arm===right?closure:.13+closure*.07;
   const fingerDirection=new Vector3(-sign*.1,-.08,-1).lerp(new Vector3(-sign,-.08,-.12),arm===right?closure:0).normalize().applyQuaternion(cameraRotation);
   const palmNormal=DOWN.clone().applyQuaternion(cameraRotation);
   const handRotation=quaternionFromFrame(fingerDirection,palmNormal).multiply(arm.handFrame);
   const neutralPalmOffset=arm.gripLocal.clone().applyQuaternion(handRotation);
   if(arm===right&&finiteVector(handleAxis)&&handleAxis.lengthSq()>1e-8&&closure>0){
    const cylinder=handleAxis.clone().normalize();
    const naturalAxis=new Vector3().crossVectors(fingerDirection,palmNormal).normalize();
    if(cylinder.dot(naturalAxis)<0)cylinder.negate();
    const across=fingerDirection.clone().addScaledVector(cylinder,-fingerDirection.dot(cylinder));
    if(across.lengthSq()<1e-8)across.crossVectors(palmNormal,cylinder);
    across.normalize();
    const facing=new Vector3().crossVectors(cylinder,across).normalize();
    const aroundHandle=quaternionFromFrame(across,facing).multiply(arm.handFrame);
    handRotation.slerp(aroundHandle,closure);
   }
   const palmOffset=arm.gripLocal.clone().applyQuaternion(handRotation);
   const wrist=new Vector3(sign*wristSpread,-wristDrop-(arm===right?0:.045)+breath,arm===right?-.34:-.32).applyQuaternion(cameraRotation).add(eye);
   // Rotating around the handle changes the wrist, not the palm attachment.
   wrist.add(neutralPalmOffset).sub(palmOffset);
   if(arm===right&&hasLastTarget){
    const targetWrist=lastTarget.clone().sub(palmOffset);
    wrist.lerp(targetWrist,extension);
   }
   // Pole is defined in camera space but remains vertical when looking down.
   const pole=new Vector3(sign*.65,-.85,.12).applyAxisAngle(UP,lastYaw-Math.PI);
   solveArm(arm,wrist,pole);
   worldQuaternion(arm.hand,handRotation);
   for(const joint of arm.joints){
    joint.bone.quaternion.copy(rest.get(joint.bone)).multiply(new Quaternion().setFromAxisAngle(joint.axis,joint.angle*amount));
   }
   arm.hand.updateWorldMatrix(false,true);
   // The opposable thumb swings toward the handle after its two distal joints
   // bend. Its axis comes from the actual curled tip and palm, so it follows
   // the hand's rotation instead of rotating around an arbitrary Euler axis.
   const thumbBase=arm.thumb.getWorldPosition(new Vector3());
   const thumbDirection=arm.thumbTip.getWorldPosition(new Vector3()).sub(thumbBase).normalize();
   const opposed=arm.hand.localToWorld(arm.thumbTarget.clone()).sub(thumbBase).normalize();
   const opposition=new Quaternion().slerp(new Quaternion().setFromUnitVectors(thumbDirection,opposed),amount);
   worldQuaternion(arm.thumb,opposition.multiply(arm.thumb.getWorldQuaternion(new Quaternion())));
  }
  root.updateMatrixWorld(true);
  right.hand.localToWorld(grip.copy(right.gripLocal));
 }
 function dispose(){
  for(const geometry of ownedGeometries)geometry.dispose();
  for(const material of ownedMaterials)material.dispose();
 }
 return {root,bones,grip,update,dispose};
}
