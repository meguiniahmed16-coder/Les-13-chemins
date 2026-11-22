// Keep the picked surface under the midpoint of the fingers throughout a zoom.
import * as T from 'three';
export function createDetailCamera(camera,canvas,scene){
  const ray=new T.Raycaster(),pivot=new T.Vector3(),ndc=new T.Vector2(),direction=new T.Vector3();
  const orientation=new T.Quaternion(),rotation=new T.Euler(0,0,0,'YXZ');
  let flight=null,active=false,distance=0,fov=48,tracking=null;
  const local=new T.Vector3();
  function screen(x,y){
    const r=canvas.getBoundingClientRect();
    ndc.set(2*(x-r.left)/r.width-1,1-2*(y-r.top)/r.height);
  }
  function visibleHit(hit){
    if(hit.distance<=.012)return false;
    const g=hit.object.geometry,f=hit.face,b=hit.barycoord;
    if(!f||!b)return true;
    const heights=g.attributes.neckRestY;
    if(heights&&g.userData.neckCut!=null){
      const y=b.x*heights.getX(f.a)+b.y*heights.getX(f.b)+b.z*heights.getX(f.c);
      if(y>g.userData.neckCut)return false;
    }
    if(hit.object.material.name==='peau'){
      const p=g.attributes.position;
      return b.x*p.getY(f.a)+b.y*p.getY(f.b)+b.z*p.getY(f.c)>=.030;
    }
    return true;
  }
  function pick(x,y,roots){
    screen(x,y);camera.updateMatrixWorld();scene.updateMatrixWorld();
    ray.setFromCamera(ndc,camera);
    const objects=[];
    for(const root of roots||[scene])root.traverseVisible(o=>{
      if(!o.isMesh||!o.material||o.userData.ignorePick)return;
      const materials=Array.isArray(o.material)?o.material:[o.material];
      if(materials.some(m=>m.visible&&(!m.transparent||m.opacity>.36)))objects.push(o);
    });
    ray.near=camera.near;ray.far=camera.far;
    return ray.intersectObjects(objects,false).find(visibleHit);
  }
  function begin(x,y,roots){
    flight=null;const hit=pick(x,y,roots);
    distance=hit?.distance??(active?distance:3.6);
    pivot.copy(ray.ray.at(distance,direction));
    tracking=hit?.object||null;if(tracking)local.copy(tracking.worldToLocal(pivot.clone()));
    orientation.copy(camera.quaternion);fov=camera.fov;active=true;
  }
  function framePoint(point,object,range,front){
    const start=camera.position.clone(),startQ=camera.quaternion.clone();
    const heading=front||start.clone().sub(point).normalize();
    const look=new T.Matrix4().lookAt(heading,new T.Vector3(),camera.up);
    orientation.setFromRotationMatrix(look);
    pivot.copy(point);tracking=object;local.copy(object.worldToLocal(point.clone()));
    ndc.set(0,0);fov=42;distance=range;active=true;
    flight=matchMedia('(prefers-reduced-motion: reduce)').matches?null:{start,startQ,time:performance.now()};
    apply();
  }
  function apply(){
    if(!active)return;
    if(tracking){tracking.updateWorldMatrix(true,false);pivot.copy(local).applyMatrix4(tracking.matrixWorld);}
    if(camera.fov!==fov||camera.near!==.005){camera.fov=fov;camera.near=.005;camera.updateProjectionMatrix();}
    const tan=Math.tan(fov*Math.PI/360);
    direction.set(ndc.x*tan*camera.aspect,ndc.y*tan,-1).normalize().applyQuaternion(orientation);
    camera.quaternion.copy(orientation);camera.position.copy(pivot).addScaledVector(direction,-distance);if(flight){
      const t=Math.min(1,(performance.now()-flight.time)/350),smooth=t*t*(3-2*t);
      camera.position.lerp(flight.start,1-smooth);camera.quaternion.slerp(flight.startQ,1-smooth);
      if(t===1)flight=null;
    }
    camera.updateMatrixWorld();
  }
  return {get object(){return tracking;},get active(){return active;},get distance(){return distance;},begin,pick,framePoint,
    zoom(ratio,x,y){if(!active||!Number.isFinite(ratio)||ratio<=0)return;flight=null;screen(x,y);distance=T.MathUtils.clamp(distance*ratio,.035,25);apply();},
    orbit(dx,dy){flight=null;rotation.setFromQuaternion(orientation);rotation.y-=dx*.007;rotation.x=T.MathUtils.clamp(rotation.x-dy*.005,-1.48,1.48);orientation.setFromEuler(rotation);apply();},
    reset(){flight=null;active=false;tracking=null;if(camera.near!==.07){camera.near=.07;camera.updateProjectionMatrix();}},apply};
}
