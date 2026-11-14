import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {parseEmbeddedGlb} from './danse-embedded-assets.js';
import CAST_DATA from './danse-cast-data.js';
import {solve} from './danse-choreography.js';

function bend(actor,name,axis,angle){
 const b=actor.bones.get(name);if(!b)return;
 const q=actor.root.getWorldQuaternion(new T.Quaternion());
 axis=axis.clone().applyQuaternion(q).applyQuaternion(b.parent.getWorldQuaternion(new T.Quaternion()).invert());
 b.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(axis,angle));b.updateMatrixWorld(true);
}
function actor(source,position,height,yaw=0,seated=false){
 const root=new T.Group(),body=clone(source);root.add(body);body.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(body),scale=height/(bounds.max.y-bounds.min.y);
 body.scale.multiplyScalar(scale);body.position.y=-bounds.min.y*scale;
 const bones=new Map(),rest=new Map();
 body.traverse(o=>{
  if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;o.userData.character=true;}
  if(o.isBone){const n=o.name.toLowerCase().match(/^(pelvis|spine_0[123]|neck_01|head|upperarm_[lr]|lowerarm_[lr]|thigh_[lr]|calf_[lr]|foot_[lr]|hand_[lr]|clavicle_[lr])(?:[._]\d+)?$/)?.[1];
   if(n){bones.set(n,o);rest.set(n,o.quaternion.clone());}}
 });
 root.position.copy(position);root.rotation.y=yaw;
 return {root,body,bones,rest,seated,height,phase:position.x*.53+position.z*.17,baseY:position.y};
}
export async function loadStudioCast(stage){
 const bytes=Uint8Array.from(atob(CAST_DATA),c=>c.charCodeAt(0));
 const gltf=await parseEmbeddedGlb(bytes.buffer);
 const names=['HipsterGuy','HipsterGirl','GamerGirl','Grandma','Grandpa','SummerGirl','Jock'];
 const sources=names.map(n=>gltf.scene.getObjectByName('Cast_'+n));
 if(sources.some(s=>!s))throw Error('Le groupe de personnages est incomplet');
 const cast=[];
 stage.candidates.forEach((old,i)=>{
  const a=actor(sources[i],old.group.position,1.83,0,false);a.kind='candidate';
  stage.scene.add(a.root);old.group.visible=false;if(old.quaternius)old.quaternius.root.visible=false;cast.push(a);
 });
 stage.public.forEach((old,i)=>{
  const at=old.group.position.clone();at.y-=.20;
  const a=actor(sources[(i*3+2)%sources.length],at,1.72+(i%3)*.06,Math.PI,true);a.kind='audience';
  stage.scene.add(a.root);old.group.visible=false;if(old.realBody)old.realBody.root.visible=false;cast.push(a);
 });
 if(stage.destroyed){for(const a of cast)stage.scene.remove(a.root);return [];}
 stage.studioCast=cast;stage.canvas.dataset.studioCast='polygon-city-7-modeles-21-personnages';return cast;
}
const X=new T.Vector3(1,0,0),Y=new T.Vector3(0,1,0),Z=new T.Vector3(0,0,1);
export function animateStudioCast(cast,time,active,finaleTime=null){
 if(!cast)return;
 for(const a of cast){
  for(const [n,q] of a.rest)a.bones.get(n).quaternion.copy(q);
  const lift=finaleTime===null?0:T.MathUtils.smoothstep(finaleTime-(Math.abs(a.phase)%1)*.35,0,.8);
  a.root.position.y=a.baseY+(a.seated?-.48*(1-lift):0);a.root.updateMatrixWorld(true);
  const pulse=Math.sin(time*3.8+a.phase),clap=active&&a.seated&&Math.floor(Math.abs(a.phase*2))%3===0;
  bend(a,'spine_02',Y,.035*Math.sin(time*1.1+a.phase));bend(a,'head',X,.04*pulse);
  for(const [side,sign] of [['l',1],['r',-1]]){
   bend(a,'upperarm_'+side,Z,-sign*(clap?1.0:1.34));
   bend(a,'upperarm_'+side,X,clap?-.5:a.seated?-.25:-.08);
   bend(a,'lowerarm_'+side,X,clap?-.9-.18*pulse:a.seated?-.65:-.16);
   if(a.seated){bend(a,'thigh_'+side,X,-1.30*(1-lift));bend(a,'calf_'+side,X,1.35*(1-lift));}
  }
  if(lift>0){
   // Raised hands actually meet above the head; IK preserves arm lengths.
   // Alternate claps and open-arm cheers with independent rhythms per person.
   const wave=Math.floor(Math.abs(a.phase)*7)%4===0;
   const opening=.025+.25*(.5+.5*Math.cos(time*(8.4+Math.abs(a.phase)%2)+a.phase))**2;
   for(const [side,sign] of [['l',1],['r',-1]]){
    const hand=a.bones.get('hand_'+side);if(!hand)continue;
    const from=a.root.worldToLocal(hand.getWorldPosition(new T.Vector3()));
    const target=new T.Vector3(sign*(wave?.40+.07*pulse:opening),a.height+(wave?.10+.08*Math.sin(time*5+sign+a.phase):.13),.13);
    solve(a.root,a.bones,'upperarm_'+side,'lowerarm_'+side,'hand_'+side,from.lerp(target,lift),new T.Vector3(sign*.65,a.height-.22,.10));
   }
  }
 }
}
