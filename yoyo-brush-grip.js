// The first ACTUAL grasp of the toilet brush: anatomically modelled 25-joint
// WebXR skin, posed once using verified rest-space pivots, then baked as a static
// contiguous mesh. No hierarchy surgery or cumulative frame-by-frame Euler twists.
// Rest model and license: hand-right.glb, hand-right-LICENSE.txt.
import * as T from 'three';

export const BRUSH_GRIP_ROOT=Object.freeze([.080,-.018,.010]);
export const BRUSH_SHAFT_RADIUS=.013;
export const BRUSH_GRIP_ROTATION=Object.freeze([
  0,1,0,
  0,0,1,
  1,0,0
]);
// Rotations are in the glTF's native world axes. Quaternions avoid mixing
// Three.js Euler XYZ and extrinsic XYZ conventions.
export const BRUSH_GRIP_ROTATIONS=Object.freeze({
  'index-finger-phalanx-proximal':[0,0,-.1806],
  'index-finger-phalanx-intermediate':[0,0,-.4717],
  'index-finger-phalanx-distal':[0,0,-.3734],
  'middle-finger-phalanx-proximal':[0,0,-.2084],
  'middle-finger-phalanx-intermediate':[0,0,-.6058],
  'middle-finger-phalanx-distal':[0,0,-.4683],
  'ring-finger-phalanx-proximal':[0,0,-.1635],
  'ring-finger-phalanx-intermediate':[0,0,-.2979],
  'ring-finger-phalanx-distal':[0,0,-.2061],
  'pinky-finger-phalanx-proximal':[0,0,-.5239],
  'pinky-finger-phalanx-intermediate':[0,0,-.3039],
  'pinky-finger-phalanx-distal':[0,0,-.1179],
  'thumb-metacarpal':[-.3703906,-.0742798,.1234533,.9176342],
  'thumb-phalanx-proximal':[-.0518406,.0705342,-.0678477,.9938482],
  'thumb-phalanx-distal':[-.0679752,-.0011343,.0487739,.9964934]
});
const sequences=[
  ['thumb-metacarpal','thumb-phalanx-proximal','thumb-phalanx-distal','thumb-tip'],
  ...['index-finger','middle-finger','ring-finger','pinky-finger'].map(name=>[
    name+'-metacarpal',name+'-phalanx-proximal',
    name+'-phalanx-intermediate',name+'-phalanx-distal',name+'-tip'
  ])
];
export function restSpacePose(bones){
 const map=new Map(bones.map((b,i)=>[b.name,{joint:b,index:i}]));
 const transforms=Array.from({length:bones.length},()=>new T.Matrix4().identity());
 for(const chain of sequences){
   const inherited=new T.Matrix4().identity();
   for(const name of chain){
     const entry=map.get(name);
     if(!entry)throw Error('Articulation anatomique manquante: '+name);
     const center=entry.joint.position;
     const entryRotation=BRUSH_GRIP_ROTATIONS[name];
     if(entryRotation){
       const q=entryRotation.length===4
         ?new T.Quaternion(...entryRotation)
         :new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),entryRotation[2]);
       const around=new T.Matrix4().makeTranslation(center.x,center.y,center.z)
         .multiply(new T.Matrix4().makeRotationFromQuaternion(q))
         .multiply(new T.Matrix4().makeTranslation(-center.x,-center.y,-center.z));
       inherited.multiply(around);
     }
     transforms[entry.index].copy(inherited);
   }
 }
 return transforms;
}
export function posePoint(point,transform){
 return new T.Vector3(...point).applyMatrix4(transform);
}
export function brushMount(){
 const mount=new T.Group();
 const A=BRUSH_GRIP_ROTATION;
 mount.quaternion.setFromRotationMatrix(new T.Matrix4().set(
   A[0],A[1],A[2],0,A[3],A[4],A[5],0,A[6],A[7],A[8],0,0,0,0,1
 ));
 mount.position.set(...BRUSH_GRIP_ROOT);
 return mount;
}
export function bakeBrushSkin(sourceScene){
 let selected=null;
 sourceScene.traverse(obj=>{if(obj.isSkinnedMesh)selected=obj;});
 if(!selected?.skeleton?.bones?.length)throw Error('La main 3D articulée n’a pas été chargée.');
 const bones=selected.skeleton.bones;
 const D=restSpacePose(bones),source=selected.geometry;
 const src=source.getAttribute('position');
 const index=source.getAttribute('skinIndex'),weight=source.getAttribute('skinWeight');
 if(!src||!index||!weight)throw Error('Poids du squelette absents de la main.');
 const array=new Float32Array(src.count*3);
 const rest=new T.Vector3(),out=new T.Vector3(),tmp=new T.Vector3();
 for(let i=0;i<src.count;i++){
   rest.fromBufferAttribute(src,i);out.set(0,0,0);
   for(let j=0;j<4;j++){
     const wi=weight.getComponent(i,j);if(wi<1e-6)continue;
     const idx=index.getComponent(i,j);
     tmp.copy(rest).applyMatrix4(D[idx]);
     out.addScaledVector(tmp,wi);
   }
   array[3*i]=out.x;array[3*i+1]=out.y;array[3*i+2]=out.z;
 }
 const geo=source.clone();
 geo.setAttribute('position',new T.BufferAttribute(array,3));
 geo.deleteAttribute('skinIndex');geo.deleteAttribute('skinWeight');
 geo.computeVertexNormals();geo.computeBoundingSphere();
 return geo;
}
