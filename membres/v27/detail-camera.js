// Keep the picked surface under the midpoint of the fingers throughout a zoom.
import * as T from 'three';
export function createDetailCamera(camera,canvas,scene){
  const ray=new T.Raycaster(),pivot=new T.Vector3(),ndc=new T.Vector2(),direction=new T.Vector3();
  const orientation=new T.Quaternion(),rotation=new T.Euler(0,0,0,'YXZ');
  let active=false,distance=0,fov=48,tracking=null;
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
  function begin(x,y,roots){
    screen(x,y);camera.updateMatrixWorld();scene.updateMatrixWorld();
    ray.setFromCamera(ndc,camera);
    const objects=[];
    for(const root of roots||[scene])root.traverseVisible(o=>{
      if(!o.isMesh||!o.material||o.userData.ignorePick)return;
      const materials=Array.isArray(o.material)?o.material:[o.material];
      if(materials.some(m=>m.visible&&(!m.transparent||m.opacity>.36)))objects.push(o);
    });
    ray.near=camera.near;ray.far=camera.far;
    const hit=ray.intersectObjects(objects,false).find(visibleHit);
    distance=hit?.distance??(active?distance:3.6);
    pivot.copy(ray.ray.at(distance,direction));
    tracking=hit?.object||null;if(tracking)local.copy(tracking.worldToLocal(pivot.clone()));
    orientation.copy(camera.quaternion);fov=camera.fov;active=true;
  }
  function apply(){
    if(!active)return;
    if(tracking){tracking.updateWorldMatrix(true,false);pivot.copy(local).applyMatrix4(tracking.matrixWorld);}
    if(camera.fov!==fov||camera.near!==.005){camera.fov=fov;camera.near=.005;camera.updateProjectionMatrix();}
    const tan=Math.tan(fov*Math.PI/360);
    direction.set(ndc.x*tan*camera.aspect,ndc.y*tan,-1).normalize().applyQuaternion(orientation);
    camera.quaternion.copy(orientation);camera.position.copy(pivot).addScaledVector(direction,-distance);camera.updateMatrixWorld();
  }
  return {get object(){return tracking;},get active(){return active;},get distance(){return distance;},begin,
    zoom(ratio,x,y){if(!active||!Number.isFinite(ratio)||ratio<=0)return;screen(x,y);distance=T.MathUtils.clamp(distance*ratio,.035,25);apply();},
    orbit(dx,dy){rotation.setFromQuaternion(orientation);rotation.y-=dx*.007;rotation.x=T.MathUtils.clamp(rotation.x-dy*.005,-1.48,1.48);orientation.setFromEuler(rotation);apply();},
    reset(){active=false;tracking=null;if(camera.near!==.07){camera.near=.07;camera.updateProjectionMatrix();}},apply};
}
