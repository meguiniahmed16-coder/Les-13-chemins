import * as T from 'three';
import {createTravelMotion} from '../salon-camera-stick.js';

export function createTravelCamera(camera,baySlope,reducedMotion){
  const point=new T.Vector3(),angles=new T.Euler(0,0,0,'YXZ');
  const motion=createTravelMotion(()=>reducedMotion.matches);
  let active=false,yaw=0,pitch=0,fov=48;
  // A wide shot can start outside a cutaway wall. Let it enter continuously.
  const bound=(current,step,lo,hi)=>T.MathUtils.clamp(current+step,Math.min(lo,current),Math.max(hi,current));
  function move(side,forward,height){
    const sin=Math.sin(angles.y),cos=Math.cos(angles.y),flat=forward*Math.cos(angles.x);
    point.x=bound(point.x,cos*side-sin*flat,-3.16,3.16);
    point.z=bound(point.z,-sin*side-cos*flat,-2.52,2.46+baySlope*point.x);
    point.y=bound(point.y,height+forward*Math.sin(angles.x),.055,2.75);
  }
  return {get active(){return active;},motion,
    capture(){point.copy(camera.position);angles.setFromQuaternion(camera.quaternion,'YXZ');angles.z=0;
      yaw=angles.y;pitch=angles.x;fov=camera.fov;active=true;motion.stop();},
    look(dx,dy){yaw+=dx*.005;pitch=T.MathUtils.clamp(pitch+dy*.0043,-1.46,1.46);},
    apply(delta){
      if(!active)return;
      const dt=T.MathUtils.clamp(delta,0,.085),gain=reducedMotion.matches?1:-Math.expm1(-19*dt);
      angles.y+=(yaw-angles.y)*gain;angles.x+=(pitch-angles.x)*gain;
      motion.step(dt,move);camera.position.copy(point);camera.quaternion.setFromEuler(angles);
      if(camera.fov!==fov||camera.near!==.008){camera.near=.008;camera.fov=fov;camera.updateProjectionMatrix();}
    },
    reset(){if(!active)return;active=false;motion.stop();if(camera.near===.008){camera.near=.07;camera.updateProjectionMatrix();}}
  };
}
