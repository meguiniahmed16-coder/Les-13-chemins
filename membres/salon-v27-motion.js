// The Summer Man salon solve from Salon-V27-Duo. Joint coordinates are in centimetres.
import {choosePosture,tabletop} from './seated-postures.js';
import {roomClear,roomPath} from './salon-plan.js?v=salon29';
const clamp=(v,l,h)=>Math.max(l,Math.min(h,v)),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);

// All geometry, joints and contact distances are expressed in the same centimetre space.
const plus=(a,b)=>a.map((v,i)=>v+b[i]),minus=(a,b)=>a.map((v,i)=>v-b[i]);
const times=(a,s)=>a.map(v=>v*s),length3=a=>Math.hypot(...a),normal=a=>times(a,1/(length3(a)||1));
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const mix3=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const reject=(a,axis)=>minus(a,times(axis,dot(a,axis)));
function rotation(from,to){
 const a=normal(from),b=normal(to),v=cross(a,b),c=clamp(dot(a,b),-1,1);
 let x,y,z,w;
 if(c<-.9999){[x,y,z]=normal(cross(a,Math.abs(a[0])<.8?[1,0,0]:[0,1,0]));w=0}
 else{const den=Math.sqrt(2*(1+c));[x,y,z]=times(v,1/den);w=den/2}
 return [1-2*(y*y+z*z),2*(x*y-w*z),2*(x*z+w*y),2*(x*y+w*z),1-2*(x*x+z*z),2*(y*z-w*x),2*(x*z-w*y),2*(y*z+w*x),1-2*(x*x+y*y)];
}
function oriented(yaw,pitch=0,roll=0){
 const a=Math.cos(yaw),b=Math.sin(yaw),c=Math.cos(pitch),d=Math.sin(pitch),e=Math.cos(roll),f=Math.sin(roll);
 return [a*e+b*d*f,-a*f+b*d*e,b*c,c*f,c*e,-d,-b*e+a*d*f,b*f+a*d*e,a*c];
}
function mapHand(forward,normalRef,aim,palm){
 const basis=(f,n)=>{const x=normal(f),y=normal(reject(n,x));return [x,y,cross(x,y)]};
 const a=basis(forward,normalRef),b=basis(aim,palm);
 return Array.from({length:9},(_,k)=>{const r=Math.floor(k/3),c=k%3;return a[0][c]*b[0][r]+a[1][c]*b[1][r]+a[2][c]*b[2][r]});
}
function transformAt(r,from,to){return [...r,...minus(to,rotateV(r,from))]}
function place(m,p){return [0,1,2].map(c=>m[9+c]+m[c*3]*p[0]+m[c*3+1]*p[1]+m[c*3+2]*p[2])}
function matrixProduct(a,b){return Array.from({length:9},(_,k)=>{const j=k%3,i=k-j;return a[i]*b[j]+a[i+1]*b[j+3]+a[i+2]*b[j+6]})}
const ease=t=>t*t*(3-2*t);
const turnAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
function reachChain(l,start,end,guide){
 const v=minus(end,start),axis=normal(v),d=clamp(length3(v),Math.abs(l.l1-l.l2)+.001,l.l1+l.l2-.002);
 const along=(l.l1*l.l1-l.l2*l.l2+d*d)/(2*d);
 const pole=normal(reject(guide,axis)),rise=Math.sqrt(Math.max(0,l.l1*l.l1-along*along));
 return [plus(plus(start,times(axis,along)),times(pole,rise)),plus(start,times(axis,d))];
}

const smoothStep=(a,b,x)=>ease(clamp((x-a)/(b-a),0,1));
const phase=smoothStep;
const rotateV=(m,p)=>[dot(m.slice(0,3),p),dot(m.slice(3,6),p),dot(m.slice(6,9),p)];
// Vertical wrist adjustments (cm) measured on the fitted V27 jeans and fingertip pads.
// Each pair is left/right; a second pair accounts for crossing the opposite leg.
const palmContacts={
 sofa:{cuisses:[[-1.1,3.0]], chevilles:[[-1.9,2.9],[-1.3,1.1]], genou:[[1.1,4.7],[4.2,5.2]], penchee:[[1.2,5.3]], 'mains-jointes':[[1.2,2.0],[1.8,1.0]]},
 armchair:{cuisses:[[0.9,1.7]], chevilles:[[0.7,1.3],[0.8,3.0]], genou:[[1.2,6.5],[3.5,3.9]], penchee:[[0.3,2.0]], 'mains-jointes':[[0.2,3.4],[0.2,3.2]], appui:[[1.9,0]]},
 dining:{cuisses:[[1.0,1.9]], chevilles:[[0.8,1.7],[0.9,1.6]], genou:[[-1.5,3.6],[3.8,3.9]], penchee:[[0.5,5.2]], 'mains-jointes':[[0.1,1.1],[0.9,0.1]]},
 opposite:{cuisses:[[-1.2,5.0]], chevilles:[[-1.2,4.6],[-1.5,4.6]], genou:[[-0.3,4.1],[2.8,2.4]], penchee:[[1.2,4.3]], 'mains-jointes':[[0.4,0.8],[0.9,-1.1]]}
};
const hipPivot=[0,85.8,-2.1];
const limbs=[0,1,2,3].map(i=>{
 const side=i%2?1:-1,arm=i<2;
 const base=arm?[[17.3,133.6,-5.3],[28.61,112.31,-3.21],[40.67,94.11,-.90]]:
  [[9.1,85.8,-2.1],[12.4664,47.2046,-2.4319],[15.7455,7.8552,-1.8594]];
 const [a,b,c]=base.map(v=>[side*v[0],v[1],v[2]]);
 return {side,arm,a,b,c,l1:length3(minus(b,a)),l2:length3(minus(c,b))};
});
const roomDist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function curvedRoute(points){
 const samples=[points[0]];
 function lineTo(b){const a=samples[samples.length-1],n=Math.ceil(roomDist(a,b)/3);for(let i=1;i<=n;i++)samples.push(a.map((v,c)=>v+(b[c]-v)*i/n))}
 for(let i=1;i<points.length-1;i++){
  const a=points[i-1],p=points[i],b=points[i+1],r=Math.min(24,.32*roomDist(a,p),.32*roomDist(b,p));
  const cut=q=>p.map((v,j)=>v+(q[j]-v)*r/(roomDist(p,q)||1)),u=cut(a),v=cut(b);
  const arc=Array.from({length:13},(_,j)=>{const f=j/12;return p.map((x,c)=>(1-f)**2*u[c]+2*f*(1-f)*x+f*f*v[c])});
  if(arc.every((q,j)=>!j||roomClear(arc[j-1],q))){lineTo(u);for(const q of arc.slice(1))lineTo(q)}else lineTo(p);
 }
 lineTo(points[points.length-1]);return samples;
}
function planJourney(points,heading,endHeading){
 const samples=curvedRoute(points),frames=[[0,...points[0],heading]];
 function append(sec,x,z,h){const a=frames[frames.length-1];frames.push([a[0]+sec,x,z,a[3]+turnAngle(h-a[3])])}
 function turn(h){const a=frames[frames.length-1],d=turnAngle(h-a[3]),duration=Math.abs(d)*.62+.13;if(Math.abs(d)<.03)return;
  for(let j=1;j<=Math.ceil(duration*26);j++){const n=Math.ceil(duration*26),u=j/n;append(duration/n,a[1],a[2],a[3]+d*ease(u))}
 }
 const bearing=(a,b)=>Math.atan2(b[0]-a[0],b[1]-a[1]);if(samples.length>1)turn(bearing(samples[0],samples[Math.min(4,samples.length-1)]));
 const dist=[0];for(let i=1;i<samples.length;i++)dist.push(dist[i-1]+roomDist(samples[i-1],samples[i]));
 for(let i=1;i<samples.length;i++){
  const a=samples[i-1],b=samples[i],lo=samples[Math.max(0,i-3)],hi=samples[Math.min(samples.length-1,i+4)],yaw=bearing(lo,hi),gap=roomDist(a,b);
  const dv=Math.min(dist[i],dist[dist.length-1]-dist[i]+gap);
  const speed=Math.min(76,Math.sqrt(180*Math.max(2.2,dv)));
  const last=frames[frames.length-1],ang=turnAngle(yaw-last[3]),sec=Math.max(gap/speed,Math.abs(ang)/1.95);
  append(sec,b[0],b[1],yaw);
 }
 if(endHeading!=null)turn(endHeading);
 const last=frames[frames.length-1];append(1.14,last[1],last[2],last[3]);return frames;
}
function journeySample(frames,t){
 if(t<=0)return frames[0].slice(1);
 let l=0,r=frames.length-1;while(r-l>1){const m=(r+l)>>1;if(frames[m][0]<=t)l=m;else r=m}
 const a=frames[l],b=frames[r],u=clamp((t-a[0])/(b[0]-a[0]||1),0,1);return [1,2,3].map(i=>a[i]+(b[i]-a[i])*u);
}
function seatEntry(s){return [s.x+s.gap*Math.sin(s.yaw),s.z+s.gap*Math.cos(s.yaw)]}

// The member renderer uses the authenticated wardrobe mesh with the reference bone transforms.
export class SalonMotion {
 constructor(onStatus=()=>{}, camera, start={x:583,z:-980,yaw:2.65},random=Math.random){
  this.camera=camera;this.femaleHands=false;
  this.expression=null;
  const room={...start,mode:'idle',t:0,seat:null,sit:0,path:null,after:null};
  let neckLift=0,posture=null,postureSeat=null,avatarScale=1;
  this.sampleSalonPose=(seat,amount,seconds,expression,scale=1)=>{
    room.mode=seat?'seated':'idle';room.seat=seat;room.sit=amount;clock=seconds;avatarScale=scale;
    this.expression=expression;roomPose(seconds*1000);return matrices;
  };
  const life={bones:[],knees:[]}, keys=new Set();
  const matrices=new Float32Array(16*15);
  let clock=0,padX=0,padY=0,publishedMode='',publishedSeat=null;
  const self=this;
  Object.defineProperties(this,{
    x:{get:()=>(room.x-700)/100},z:{get:()=>(room.z+800)/100},yaw:{get:()=>room.yaw},
    mode:{get:()=>room.mode},seat:{get:()=>room.seat},sit:{get:()=>room.sit}
  });
  function notify(){
    if(room.mode!==publishedMode||room.seat!==publishedSeat){
      publishedMode=room.mode;publishedSeat=room.seat;onStatus(room.mode,room.seat);
    }
  }
  function roomIdle(){room.mode='idle';room.path=null;room.seat=null;room.sit=0;room.t=0;}
  function roomBegin(seat){
    const path=roomPath([room.x,room.z],seat.walkOnly?[seat.x,seat.z]:seatEntry(seat));
    if(!path){roomIdle();onStatus('unreachable',seat);return;}
    room.path=planJourney(path,room.yaw,seat.yaw);room.seat=seat.walkOnly?null:seat;room.t=0;room.mode='walk';
  }
  this.goToBay=offset=>{
    const target={walkOnly:true,x:700+offset,z:-577,yaw:0};
    this.releaseInputs();
    if(room.sit>0){room.after=target;room.mode='rise';}else roomBegin(target);
    notify();
  };
  this.goToSeat=seat=>{
    if(room.seat===seat&&room.mode!=='rise')return;
    if(room.sit>0){room.after=seat;room.mode='rise';}else roomBegin(seat);
    notify();
  };
  this.stand=()=>{room.after=null;if(room.sit>0)room.mode='rise';else roomIdle();notify();};
  this.key=(code,down)=>{if(down)keys.add(code);else keys.delete(code);};
  this.stick=(x,y)=>{padX=x;padY=y;};
  this.releaseInputs=()=>{keys.clear();padX=padY=0;};
  this.update=dt=>{
    clock+=dt;
    const any=(...codes)=>Number(codes.some(c=>keys.has(c)));
    stick.x=padX+any('ArrowRight','KeyD')-any('ArrowLeft','KeyA','KeyQ');
    stick.y=padY+any('ArrowDown','KeyS')-any('ArrowUp','KeyZ','KeyW');
    stick.held=Math.hypot(stick.x,stick.y)>.09;
    if(stick.held){
      room.after=null;
      if(room.sit>0)room.mode='rise';else manualStart();
    }
    if(room.mode==='steer')steerTick(dt);
    else if(room.mode==='walk'){
      room.t+=dt;[room.x,room.z,room.yaw]=journeySample(room.path,room.t);
      if(room.t>=room.path.at(-1)[0]){if(room.seat){room.mode='sitDown';room.sit=0;}else roomIdle();}
    }else if(room.mode==='sitDown'){
      room.sit=Math.min(1,room.sit+dt/2.1);if(room.sit===1)room.mode='seated';
    }else if(room.mode==='rise'){
      room.sit=Math.max(0,room.sit-dt/1.85);
      if(!room.sit){const after=room.after;room.after=null;roomIdle();if(after)roomBegin(after);}
    }
    notify();return stick.held||!['idle','seated'].includes(room.mode);
  };
  let poseTime=-1,poseExpression,poseMode,poseSeat;
  // Outdoor figures use the same limb solver and clothing bindings as the room.
  this.travelPose=(cycle,speed,tilt)=>{
    const stride=65*speed;
    room.mode=speed>.03?'walk':'idle';room.seat=null;room.sit=0;room.yaw=0;
    room.t=2.2+cycle*1.1;room.x=0;room.z=room.t*stride;
    room.path=[[0,0,0,0],[5,0,5*stride,0]];
    clock=room.t;neckLift=tilt;poseTime=-1;
  };
  this.bones=()=>{
    if(clock!==poseTime||this.expression!==poseExpression||room.mode!==poseMode||room.seat!==poseSeat){
      roomPose(clock*1000);
      poseTime=clock;poseExpression=this.expression;poseMode=room.mode;poseSeat=room.seat;
    }
    return matrices;
  };
function floorStride(side){
 const f=room.path,t=room.t,period=1.10,offset=side<0?0:.5,beat=t/period+offset;
 const stamp=(Math.floor(beat)-offset)*period,cycle=beat-Math.floor(beat);
 function print(at){
  const [x,z,h]=journeySample(f,at),width=side*(8.65+.22*Math.cos(at*.9));
  return [x+Math.cos(h)*width,z-Math.sin(h)*width,h];
 }
 const a=print(stamp+.29*period),b=print(stamp+1.29*period),u=clamp((cycle-.595)/.405,0,1);
 const k=ease(u),dist=roomDist(a,b),w=clamp(dist/27,0,1);
 const x=a[0]+(b[0]-a[0])*k-room.x,z=a[1]+(b[1]-a[1])*k-room.z,c=Math.cos(room.yaw),s=Math.sin(room.yaw);
 const y=7.85+w*(4.5*Math.sin(Math.PI*u)**2+.72*Math.sin(2*Math.PI*u)*Math.sin(Math.PI*u));
 return {point:[c*x-s*z,y,s*x+c*z-1],yaw:turnAngle(a[2]+turnAngle(b[2]-a[2])*k-room.yaw)+side*.043,
 roll:w*(.16*Math.sin(2*Math.PI*u)-.065*Math.sin(Math.PI*clamp(cycle/.595,0,1))**4),weight:w};
}
const stick={held:false,pointer:null,x:0,y:0,speed:0,turn:0,next:0,legs:[],phase:0};
function soleWorld(local){
 const c=Math.cos(room.yaw),s=Math.sin(room.yaw);
 return [room.x+c*local[0]+s*local[2],room.z-s*local[0]+c*local[2]];
}
function heelGoal(side,lead){
 return soleWorld([side*8.65,0,-1+lead]);
}
function manualStart(){
 if(room.mode==='steer')return;
 const previous=(room.mode==='walk'||room.mode==='brake')&&room.path;
 stick.legs=[-1,1].map(side=>{
  const p=previous?soleWorld(floorStride(side).point):heelGoal(side,0);
  return {side,p,from:p.slice(),to:p.slice(),yaw:room.yaw,startYaw:room.yaw,endYaw:room.yaw,elapsed:0,duration:0,lift:0,roll:0};
 });
 stick.speed=0;stick.turn=0;stick.next=0;stick.phase=0;
 room.after=null;room.seat=null;room.path=null;room.mode='steer';room.t=0;

}
function footfalls(dt){
 let leg=stick.legs.find(l=>l.duration>0);
 if(!leg){
  const errors=stick.legs.map(l=>roomDist(l.p,heelGoal(l.side,0)));
  let index=stick.next;
  if(stick.speed<5&&Math.abs(stick.turn)<.10&&errors[index]<1.5)index=1-index;
  leg=stick.legs[index];const target=heelGoal(leg.side,stick.speed*.42);
  const travel=roomDist(leg.p,target),turn=Math.abs(turnAngle(room.yaw-leg.yaw));
  if(travel<1.4&&turn<.07)return false;
  leg.from=leg.p.slice();leg.to=target;leg.startYaw=leg.yaw;leg.endYaw=room.yaw;
  leg.duration=clamp(.32+travel*.0023,.34,.48);leg.elapsed=0;
  leg.arc=clamp(travel*.13+turn*2,.6,5.3);stick.next=1-index;
 }
 leg.elapsed+=dt;const u=clamp(leg.elapsed/leg.duration,0,1),k=ease(u);
 leg.p=[leg.from[0]+(leg.to[0]-leg.from[0])*k,leg.from[1]+(leg.to[1]-leg.from[1])*k];
 leg.yaw=leg.startYaw+turnAngle(leg.endYaw-leg.startYaw)*k;
 leg.lift=leg.arc*Math.sin(Math.PI*u)**2;leg.roll=.026*leg.arc*Math.sin(2*Math.PI*u);
 stick.phase=(leg.side<0?0:.5)+u*.5;
 if(u===1){leg.duration=0;leg.lift=leg.roll=0}
 return true;
}
function steerTick(dt){
 const power=stick.held?Math.min(1,Math.hypot(stick.x,stick.y)):0,view=self.camera.angle;
 let diff=0;
 if(power>.07){
  const heading=view+Math.atan2(stick.x,stick.y);
  diff=turnAngle(heading-room.yaw);
 }
 const desiredTurn=clamp(diff*4,-2.1,2.1);
 stick.turn+=(desiredTurn-stick.turn)*(1-Math.exp(-dt*10));
 const delta=stick.turn*dt;room.yaw+=delta;
 const goal=power*75*smoothStep(-.05,.88,Math.cos(diff));
 stick.speed+=(goal-stick.speed)*(1-Math.exp(-dt*(goal>stick.speed?4:8)));
 const dx=Math.sin(room.yaw)*stick.speed*dt,dz=Math.cos(room.yaw)*stick.speed*dt;
 if(roomClear([room.x,room.z],[room.x+dx,room.z+dz])){room.x+=dx;room.z+=dz}
 else stick.speed*=Math.exp(-18*dt);
 room.t+=dt;const stepping=footfalls(dt);
 if(!stick.held&&!stepping&&stick.speed<.65&&Math.abs(stick.turn)<.03){roomIdle()}
}
function manualFoot(side){
 const leg=stick.legs[side<0?0:1],dx=leg.p[0]-room.x,dz=leg.p[1]-room.z,c=Math.cos(room.yaw),s=Math.sin(room.yaw);
 return {point:[c*dx-s*dz,7.85+leg.lift,s*dx+c*dz],yaw:turnAngle(leg.yaw-room.yaw)+side*.043,roll:leg.roll,
  weight:clamp(stick.speed/62+Math.abs(stick.turn)*.14,0,1)};
}
function roomPose(t){
 const steering=room.mode==='steer',walking=room.mode==='walk'||room.mode==='brake'||steering,u=room.sit,s=ease(u),seat=room.seat;
 const expr=self.expression, gesture=expr?.gesture, engaged=walking?0:(u>0?phase(.82,1,u):room.mode==='idle'?1:0);
 const emphasis=gesture?engaged:0;
 if(seat!==postureSeat){if(seat)posture=choosePosture(seat,posture,random);postureSeat=seat;}
 const kind=seat?posture?.kind:'',crossSide=posture?.side||1,table=seat?tabletop(seat,avatarScale):null;
 const sofa=seat?.id.startsWith('sofa');
 const armrest=kind==='appui'?seat?.support:null;
 const settle=phase(.62,1,u),adjust=phase(.16,.62,u),legSide=sofa?0:seat?.id==='east2'?-1:1;
 const lean=armrest?armrest.side*.075*settle:0;
 const feet=walking?[-1,1].map(steering?manualFoot:floorStride):[-1,1].map(side=>{
  const front=side===legSide,onArm=side===armrest?.side;
  let width=.65,depth=front?4.8:-3;
  if(sofa){width=2.2;depth=-3;}
  if(armrest){width=2.15;depth=front?(onArm?-4:-13):(onArm?-7:-14);}
  const point=[side*(8.65+width*adjust),7.85+(front?.95:.55)*Math.sin(Math.PI*adjust)**2,-1+depth*adjust];
  const crossIn=phase(.50,.98,u);
  if(kind==='chevilles'){point[0]+=(-side*(side===crossSide?14:6))*crossIn;point[2]+=(side===crossSide?4:-5)*crossIn;point[1]+=(side===crossSide?2.6:0)*crossIn;}
  if(kind==='genou'&&side===crossSide){point[0]-=side*37*crossIn;point[1]+=23*crossIn+8*Math.sin(Math.PI*crossIn);point[2]+=5*crossIn;}
  if(kind==='penchee'){point[0]+=side*3*settle;point[2]-=3*settle;}
  return {point,
   yaw:side*(.043+(front?.12:.055)*s),roll:0,weight:0}
 });
 const drive=Math.max(feet[0].weight,feet[1].weight),step=2*Math.PI*((steering?stick.phase:room.t/1.10)-.30),beat=Math.cos(step),sub=Math.cos(2*step);
 const clock=t/1000,breath=Math.sin(clock*1.64),bend=Math.sin(Math.PI*s),back=seat?.gap||42;
 const hip=[drive*(1.04*beat+.12*Math.sin(2*step))+.32*breath*(1-drive),83.8+drive*(.64*sub-.12)+.24*breath*(1-drive),-2.1];
 // First flex at the hips, keep both feet loaded, then transfer weight onto the cushion.
 hip[1]+=( (seat?.height||40)+8.65-hip[1])*s;
 hip[2]+=-(back-2.1)*phase(.12,.99,u)+2.4*Math.sin(2*Math.PI*s)*bend;
 hip[0]+=.60*bend+.38*legSide*settle;
 // Keep the seated spine over the pelvis on all three sofa cushions.
 const seatedPitch=kind==='penchee'?.23:kind==='appui'&&table ? .40 : kind==='genou'?-.055:sofa?.018:armrest?-.040:-.08;
 const pitch=.018+drive*(.024+.009*sub)+.52*bend+seatedPitch*settle+(gesture?.pitch||0)*emphasis;
 const lowerR=oriented(.038*beat*drive+.025*legSide*settle+(gesture?.yaw||0)*emphasis,pitch,-.021*beat*drive+.014*bend+.025*legSide*settle-lean*.78);
 const torso=transformAt(lowerR,hipPivot,hip);
 const rib=[0,109,-3.3],neck=[0,140,-3.3],chest=matrixProduct(lowerR,oriented(-.080*beat*drive-.045*legSide*settle+(armrest?armrest.side*.37*settle:0),-.125*bend+(sofa?.012:.055)*settle,.024*beat*drive-.010*legSide*settle-lean*.72));
 const upper=transformAt(chest,rib,place(torso,rib)),bones=life.bones;
 bones[0]=torso;bones[14]=upper;
 let anticipation=0;
 if(steering)anticipation=clamp(stick.turn*.21,-.38,.38);else if(walking){const ahead=journeySample(room.path,room.t+.32)[2];anticipation=clamp(turnAngle(ahead-room.yaw),-.42,.42)}
 bones[1]=transformAt(matrixProduct(chest,oriented(anticipation*.66+.024*Math.sin(clock*.76)+(expr?.look||0)*emphasis, neckLift-.62*pitch+.035*bend+(gesture?.nod||0)*emphasis,(gesture?.tilt||0)*emphasis)),neck,place(upper,neck));
 life.knees=[];
 for(const i of [2,3,0,1]){
  const l=limbs[i],side=l.side,arm=l.arm,start=place(arm?upper:torso,l.a);
  const foot=feet[side<0?0:1],other=feet[side<0?1:0];
  let dest,pole,handLift=0;
  if(arm){
   const armSwing=9.4*Math.tanh((other.point[2]-foot.point[2])*.026);
   const rest=[side*(21.8+.32*Math.sin(clock*1.13)+.42*drive),88.5+.8*drive*Math.abs(beat)+.24*breath+Math.max(0,armSwing)*.09,3.8+armSwing];
   const knee=life.knees[side<0?0:1],onArm=armrest?.side===side;
   let lap=[knee[0]-side*1.5,knee[1]+10.5,knee[2]-(side===legSide?8:14)];
   if(sofa){
    lap=[knee[0]-side*2,Math.max(hip[1],knee[1])+13.5,knee[2]-13];
   }else if(armrest){
    lap=onArm?[armrest.x,armrest.height+4.3,armrest.z-6.4]:[knee[0]-side*1.5,knee[1]+9.2,knee[2]-9];
    if(!onArm){start[1]-=2.4*settle;start[2]+=2.6*settle;}
   }
   if(kind==='mains-jointes'){
    const k=life.knees;lap=[side*(side===crossSide?2.3:1.2),(k[0][1]+k[1][1])*.5+12+(side===crossSide?3:0),(k[0][2]+k[1][2])*.5-12+(side===crossSide?2:0)];
   }else if(kind==='genou'){const k=life.knees[crossSide<0?0:1];lap=[k[0]+side*5,k[1]+9+(side===crossSide?1:0),k[2]-11];}
   else if(kind==='penchee'){lap=[knee[0]-side*2.5,knee[1]+9,knee[2]-3];}
   else if(kind==='appui'&&table){lap=[side*15,table.height+2.9,table.forward-7.0];}
   dest=mix3(rest,lap,s);dest[1]+=3.3*bend;dest[2]+=9.8*bend;
   pole=[side*(onArm?.88:.51),-.20-.78*s,-1];
   if(gesture&&emphasis){
    handLift=(side<0?gesture.left:gesture.right)*emphasis;
    const target=place(upper,[side*gesture.reach,l.a[1]+gesture.height,l.a[2]+gesture.forward]);
    dest=mix3(dest,target,handLift);
    pole=mix3(pole,[side*.9,-.85,-.55],handLift);
   }

  }else {dest=foot.point;pole=[side*(.09+.06*s),.012,1];if(kind==='genou'&&side===crossSide)pole=[-side*.70*settle,.22*settle,1];}
  let [joint,tip]=reachChain(l,start,dest,pole);
  if(arm&&self.femaleHands&&seat&&settle){
    const support=sofa?'sofa':seat.support?'armchair':seat.id==='east2'?'opposite':'dining';
    const contact=palmContacts[support][kind];
    const amount=(crossSide>0&&contact?.[1]||contact?.[0])?.[i]||0;
    if(amount)[joint,tip]=reachChain(l,start,plus(tip,[0,amount*settle*(1-handLift),0]),pole);
  }
  const first=2+3*i;
  const a=rotation(minus(l.b,l.a),minus(joint,start)),b=rotation(minus(l.c,l.b),minus(tip,joint));
  bones[first]=transformAt(a,l.a,start);bones[first+1]=transformAt(b,l.b,joint);
  let end=arm?b:oriented(foot.yaw,foot.roll);
  if(arm){
   const finger=normal([side*.27,-.96,-.01]),palm=normal([-side*.86,-.27,-.42]);
   const axis=normal(minus(tip,joint)),restAxis=normal(minus(l.c,l.b));
   let palmDown=mix3(rotateV(b,palm),[0,-1,-.13],s);
   if(handLift)palmDown=mix3(palmDown,[-side*.68,gesture.palm,.26],handLift);
   // Roll follows the forearm; flexion and side deviation pivot at the wrist.
   const projected=normal(reject(rotateV(b,palm),axis)),wanted=normal(reject(palmDown,axis));
   const twist=clamp(Math.atan2(dot(cross(projected,wanted),axis),dot(projected,wanted)),-1.15,1.15);
   const rotated=plus(times(projected,Math.cos(twist)),times(cross(axis,projected),Math.sin(twist)));
   const forearm=mapHand(restAxis,palm,axis,rotated);
   bones[first+1]=transformAt(forearm,l.b,joint);
   const relaxed=normal(mix3(axis,rotateV(forearm,finger),.30));
   const palmSlope=table?clamp((table.height+1.1-tip[1])/17,-.21,.12):0;
   const restingAim=kind==='appui'&&table?[-side*.07,palmSlope,.99]:kind==='mains-jointes'?[-side*.60,-.14,.83]:[-side*.14,-.22,.97];
   let desired=normal(mix3(relaxed,restingAim,s));
   if(handLift)desired=normal(mix3(desired,plus(axis,[side*.11,.16,.12]),handLift));
   const angle=Math.acos(clamp(dot(axis,desired),-1,1));
   const aim=normal(mix3(axis,desired,Math.min(1,.35/Math.max(.001,angle))));
   end=mapHand(finger,palm,aim,s||handLift?normal(mix3(rotated,palmDown,.34)):rotated);

  }
  bones[first+2]=transformAt(end,l.c,tip);
  if(!arm)life.knees.push(joint);
 }
 for(let j=0;j<15;j++){
   const m=bones[j];
   matrices.set([m[0],m[3],m[6],0,m[1],m[4],m[7],0,m[2],m[5],m[8],0,m[9]/100,m[10]/100,m[11]/100,1],16*j);
 }
 return matrices;
}
 }
 centerCamera(){Object.assign(this.camera,{x:this.x,z:this.z,y:this.sit>.65?.67:.89,zoom:1.17,follow:true,presetMax:0});}
 trackWhenWalking(width,height){
   const c=this.camera;if(!c.follow||!width||!height)return;
   const sy=Math.sin(c.angle),cy=Math.cos(c.angle);
   const factor=Math.min(2/3.8,2*width/(height*4.7))*c.zoom;
   const dx=this.x-c.x,dz=this.z-c.z;
   const side=cy*dx-sy*dz,front=sy*dx+cy*dz;
   const sideLimit=.60*width/height/factor,frontLimit=.46/(factor*Math.sin(c.pitch));
   const sx=side-clamp(side,-sideLimit,sideLimit),sz=front-clamp(front,-frontLimit,frontLimit);
   c.x+=cy*sx+sy*sz;c.z+=cy*sz-sy*sx;
 }
}
