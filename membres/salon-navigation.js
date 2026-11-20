// Salon coordinates are in metres. Yaw zero faces the positive Z axis.
import {bounds, roomFocus, visiblePart, seatForPart} from './salon-plan.js?v=salon-v27';

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

export function newCamera() {
  return {...roomFocus, angle:2.55,pitch:.29,zoom:1.17,follow:true};
}
export function cameraProjection(w,h,portrait,camera) {
  const c=portrait?{x:0,y:1.55,z:0,angle:.45,pitch:.11,zoom:1}:camera;
  const factor=portrait?Math.min(2/.49,2*w/(h*.44)):Math.min(2/3.8,2*w/(h*4.7))*c.zoom;
  return {x:c.x,y:c.y,z:c.z,sy:Math.sin(c.angle),cy:Math.cos(c.angle),sp:Math.sin(c.pitch),cp:Math.cos(c.pitch),factor};
}
export function moveCamera(camera,dx,dy,w,h) {
  const p=cameraProjection(w,h,false,camera);
  const unit=2/(p.factor*h);
  const lateral=-dx*unit,forward=-dy*unit/Math.max(.30,p.sp);
  camera.x=clamp(camera.x+p.cy*lateral+p.sy*forward,bounds.minX,bounds.maxX);
  camera.z=clamp(camera.z-p.sy*lateral+p.cy*forward,bounds.minZ,bounds.maxZ);
  camera.follow=false;
}
export function orbitCamera(c,dx,dy) {
  c.angle-=dx*.008;
  c.pitch=clamp(c.pitch+dy*.006,.14,1.29);
}
export function zoomCamera(c,multiplier) { c.zoom=clamp(c.zoom*multiplier,.48,3.7); }

// Resolve the frontmost visible triangle in the same orthographic projection
// as both renderers. Furniture IDs live on the actual seat, arms and back.
export function seatAt(bytes,c,w,h,sx,sy) {
  const p=cameraProjection(w,h,false,c),scale=h*p.factor/2;
  const targetX=(sx-w/2)/scale,targetY=(h/2-sy)/scale;
  const data=new DataView(bytes),x=[],y=[],depth=[],worldZ=[];
  let closest=-Infinity,seat=null;
  for(let j=0;j<data.byteLength;j+=42) {
    if(!visiblePart(data.getUint8(j+13),p.sy*p.cp,p.cy*p.cp))continue;
    for(let v=0;v<3;v++) {
      const k=j+14*v;
      const wx=data.getInt16(k,true)/1800,dx=wx-p.x;
      const dy=data.getInt16(k+2,true)/1800-p.y,dz=data.getInt16(k+4,true)/1800-p.z;
      const forward=p.sy*dx+p.cy*dz;
      worldZ[v]=dz+p.z;x[v]=p.cy*dx-p.sy*dz;y[v]=p.cp*dy-p.sp*forward;
      depth[v]=p.cp*forward+p.sp*dy;
    }
    if(targetX<Math.min(...x)||targetX>Math.max(...x)||targetY<Math.min(...y)||targetY>Math.max(...y))continue;
    const area=(y[1]-y[2])*(x[0]-x[2])+(x[2]-x[1])*(y[0]-y[2]);
    if(Math.abs(area)<1e-10)continue;
    const a=((y[1]-y[2])*(targetX-x[2])+(x[2]-x[1])*(targetY-y[2]))/area;
    const b=((y[2]-y[0])*(targetX-x[2])+(x[0]-x[2])*(targetY-y[2]))/area,d=1-a-b;
    if(a<0||b<0||d<0)continue;
    const z=a*depth[0]+b*depth[1]+d*depth[2];
    if(z<=closest)continue;
    closest=z;
    const hitZ=a*worldZ[0]+b*worldZ[1]+d*worldZ[2];
    seat=seatForPart(data.getUint8(j+13),hitZ*100-800);
  }
  return seat;
}

export {SalonMotion} from './salon-v27-motion.js?v=studio28';
