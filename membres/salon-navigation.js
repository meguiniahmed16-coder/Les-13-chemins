// Salon coordinates are in metres. Yaw zero faces the positive Z axis.
import {bounds, seats, roomFocus, findPath, moveWithCollision} from './salon-plan.js';

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const ease=t=>t*t*(3-2*t);
const turn=(from,to)=>Math.atan2(Math.sin(to-from),Math.cos(to-from));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

export function newCamera() {
  return {...roomFocus, angle:.28,pitch:.42,zoom:.91,follow:true};
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
export function wallHidden(group,sy,cy) {
  return (group===1 && cy<0)||(group===2 && sy<0)||(group===3 && sy>0)||(group===4 && cy>0);
}

// Resolve the frontmost visible triangle in the same orthographic projection
// as both renderers. Furniture IDs live on the actual seat, arms and back.
export function seatAt(bytes,c,w,h,sx,sy) {
  const p=cameraProjection(w,h,false,c),scale=h*p.factor/2;
  const targetX=(sx-w/2)/scale,targetY=(h/2-sy)/scale;
  const data=new DataView(bytes),x=[],y=[],depth=[],worldX=[];
  let closest=-Infinity,seat=null;
  for(let j=0;j<data.byteLength;j+=42) {
    if(wallHidden(data.getUint8(j+12),p.sy,p.cy))continue;
    for(let v=0;v<3;v++) {
      const k=j+14*v;
      const wx=data.getInt16(k,true)/1800,dx=wx-p.x;
      const dy=data.getInt16(k+2,true)/1800-p.y,dz=data.getInt16(k+4,true)/1800-p.z;
      const forward=p.sy*dx+p.cy*dz;
      worldX[v]=wx;x[v]=p.cy*dx-p.sy*dz;y[v]=p.cp*dy-p.sp*forward;
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
    const id=data.getUint8(j+13);
    seat=id?seats[id-1]:null;
    if(id>=1&&id<=3) {
      const hit=a*worldX[0]+b*worldX[1]+d*worldX[2];
      for(const cushion of seats.slice(0,3))if(Math.abs(hit-cushion.x)<Math.abs(hit-seat.x))seat=cushion;
    }
  }
  return seat;
}

export class SalonMotion {
  x=0; z=0; yaw=.11; phase=0; gait=0; sit=0; camera=newCamera();
  mode='idle'; seat=null; #next=null; #path=[]; #t=0;
  #stick={x:0,y:0}; #keys=new Set(); #gaitTarget=0;
  constructor(onStatus=()=>{}) { this.onStatus=onStatus; }
  get floorOffset() {
    const edge=Math.min(1.8-Math.abs(this.x),1.225-Math.abs(this.z+.02));
    return .019+.055*clamp((edge+.09)/.18,0,1);
  }
  get pose(){
    const id=this.seat?.id;
    const armrest=id==='sofa-1'?-1:id==='sofa-3'||id==='armchair'?1:0;
    return {phase:this.phase,gait:this.gait,sit:this.sit,seatHeight:(this.seat?.height??.45)-this.floorOffset,armrest};
  }
  #besideSeat(){
    return {x:this.seat.x+.34*Math.sin(this.seat.yaw),z:this.seat.z+.34*Math.cos(this.seat.yaw)};
  }
  key(code,down){if(down)this.#keys.add(code);else this.#keys.delete(code);}
  stick(x,y){this.#stick={x,y};}
  releaseInputs(){this.#keys.clear();this.stick(0,0);}
  centerCamera(){Object.assign(this.camera,newCamera(),{x:this.x,y:this.sit>.65?.65:.87,z:this.z});}
  #change(mode) {this.mode=mode;this.onStatus(mode,this.seat);}
  goToSeat(seat) {
    if(this.seat===seat&&this.mode!=='rising')return;
    if(!['idle','approach'].includes(this.mode)) {
      this.#next=seat;this.#leaveSeat();return;
    }
    const path=findPath(this,seat.approach);
    if(!path){this.onStatus('unreachable',seat);return;}
    this.seat=seat;this.#next=null;
    this.#path=path.filter((p,i)=>i>0||distance(this,p)>.025);
    this.#change('approach');
  }
  #leaveSeat(){
    if(this.mode==='rising'||this.mode==='undocking')return;
    this.#change(this.sit>0?'rising':'undocking');
  }
  stand() {
    this.#next=null;
    if(!['approach','idle'].includes(this.mode))this.#leaveSeat();
    else {this.#path=[];this.seat=null;this.#change('idle');}
  }
  #seating(dt,rising) {
    const seat=this.seat;
    this.#t=clamp(this.#t+(rising?-1:1)*dt/1.05,0,1);
    this.sit=ease(this.#t);
    const from=this.#besideSeat();
    this.x=from.x+(seat.x-from.x)*this.sit;
    this.z=from.z+(seat.z-from.z)*this.sit;
    if(!rising&&this.#t===1)this.#change('seated');
    if(rising&&this.#t===0)this.#change('undocking');
  }
  #step(dx,dz,amount,dt,automatic) {
    const angle=Math.atan2(dx,dz),diff=turn(this.yaw,angle);
    this.yaw+=clamp(diff,-4.7*dt,4.7*dt);
    const stride=amount*clamp(1-Math.abs(diff)/2.15,.04,1);
    const at=automatic?{x:this.x+dx*stride,z:this.z+dz*stride}:moveWithCollision(this,dx*stride,dz*stride);
    const traveled=distance(this,at);
    this.x=at.x;this.z=at.z;
    this.phase+=traveled*5.5;
    this.#gaitTarget=clamp(traveled/(dt*1.25),0,1);
  }
  trackWhenWalking(width,height) {
    if(!this.camera.follow||!width||!height)return;
    const c=this.camera,p=cameraProjection(width,height,false,c);
    const dx=this.x-c.x,dz=this.z-c.z,lateral=p.cy*dx-p.sy*dz,forward=p.sy*dx+p.cy*dz;
    const sideLimit=.62*width/height/p.factor,frontLimit=.52/(p.factor*p.sp);
    const sx=lateral-clamp(lateral,-sideLimit,sideLimit),sz=forward-clamp(forward,-frontLimit,frontLimit);
    c.x=clamp(c.x+p.cy*sx+p.sy*sz,bounds.minX,bounds.maxX);
    c.z=clamp(c.z-p.sy*sx+p.cy*sz,bounds.minZ,bounds.maxZ);
  }
  update(seconds) {
    const dt=Math.min(.12,Math.max(.001,seconds)),oldGait=this.gait;
    const keys=this.#keys,any=(...codes)=>codes.some(k=>keys.has(k))?1:0;
    const dx=this.#stick.x+any('ArrowRight','KeyD')-any('ArrowLeft','KeyA','KeyQ');
    const dy=this.#stick.y+any('ArrowDown','KeyS')-any('ArrowUp','KeyW','KeyZ');
    const length=Math.hypot(dx,dy),manual=length>.09;
    this.#gaitTarget=0;
    if(manual&&this.mode!=='idle')this.stand();
    if(this.mode==='rising'||this.mode==='lowering')this.#seating(dt,this.mode==='rising');
    else if(this.mode==='docking'||this.mode==='undocking'){
      const entering=this.mode==='docking',p=entering?this.#besideSeat():this.seat.approach;
      const d=distance(this,p);
      if(d>.014)this.#step((p.x-this.x)/d,(p.z-this.z)/d,Math.min(d,.80*dt),dt,true);
      else{
        this.x=p.x;this.z=p.z;
        if(entering)this.#change('align');
        else{
          const next=this.#next;this.seat=null;this.#next=null;this.#change('idle');
          if(next)this.goToSeat(next);
        }
      }
    }else if(this.mode==='align') {
      const delta=turn(this.yaw,this.seat.yaw);
      this.yaw+=clamp(delta,-3.0*dt,3.0*dt);
      if(Math.abs(delta)<.045){this.yaw=this.seat.yaw;this.#t=0;this.#change('lowering');}
    } else if(this.mode==='approach') {
      while(this.#path.length&&distance(this,this.#path[0])<.012){Object.assign(this,{x:this.#path[0].x,z:this.#path[0].z});this.#path.shift();}
      if(!this.#path.length)this.#change('docking');
      else{
        const point=this.#path[0],d=distance(this,point);
        this.#step((point.x-this.x)/d,(point.z-this.z)/d,Math.min(d,1.32*dt),dt,true);
      }
    } else if(manual&&this.mode==='idle') {
      const a=this.camera.angle;
      this.#step((Math.cos(a)*dx+Math.sin(a)*dy)/length,(-Math.sin(a)*dx+Math.cos(a)*dy)/length,Math.min(length,1)*1.47*dt,dt,false);
    }
    this.gait+=(this.#gaitTarget-this.gait)*(1-Math.exp(-12*dt));
    if(this.gait<.008)this.gait=0;
    return manual||!['idle','seated'].includes(this.mode)||this.gait>0||oldGait>0;
  }
}
