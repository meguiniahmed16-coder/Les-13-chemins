import * as T from 'three';

// All time is supplied by the introduction's paused/resumed shot clock. Nothing
// here starts a timer, moves a real actor, or writes a saved appearance.
export const DOJO_DURATIONS=Object.freeze({
 'dojo-arrivee':7000,'dojo-camera':10000,'dojo-deplacement':11000,'dojo-demi-tour':9000,
 'dojo-personnaliser':8000,'dojo-apparence':10000,'dojo-vetements':12000,
 'dojo-enregistrer':7000,'dojo-construction':9000,jardin:6000
});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const segment=(t,a,b)=>smooth((t-a)/(b-a));
const lerp=(a,b,t)=>a+(b-a)*t;
const delta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
const yawBetween=(a,b)=>Math.atan2(b.x-a.x,b.z-a.z);
const turn=(a,b,t)=>a+delta(a,b)*smooth(t);
const pulse=(t,at,width)=>Math.sin(Math.PI*clamp((t-at)/width,0,1))**2;
const seconds=(line,elapsed)=>({
 duration:(line.ms||DOJO_DURATIONS[line.id]||8000)/1000,
 time:clamp(elapsed/1000,0,(line.ms||DOJO_DURATIONS[line.id]||8000)/1000),
 t:clamp(elapsed/(line.ms||DOJO_DURATIONS[line.id]||8000),0,1)
});
const openYaw={m:2.12,f:Math.PI*2-2.12};

// Marianne makes one small, closed circuit. Arc-length sampling links the leg
// cycle to distance instead of wall-clock time; the final point is the first.
const walkPath=new T.CatmullRomCurve3([
 new T.Vector3(.8,0,.35),new T.Vector3(1.28,0,-.30),
 new T.Vector3(.62,0,-.88),new T.Vector3(.20,0,-.27)
],true,'centripetal');
walkPath.arcLengthDivisions=200;
const walkLength=walkPath.getLength();
// SalonMotion uses 65cm/s, a1.10s cycle, the intro's.7 drive multiplier and
// Marianne's1.04 model scale. Keep its finite internal walk path in one cycle.
const walkCycleDistance=.65*1.10*.7*1.04;
const pathHeading=u=>{const v=walkPath.getTangentAt(clamp(u,0,1));return Math.atan2(v.x,v.z);};
const upAxis=new T.Vector3(0,1,0);

// Four small advancing steps make the half-turn; the fifth gathers the last
// foot. The support footprint stays in world space while the pelvis turns.
// Coordinates remain in the leg solver's centimetres until the actor root
// applies its original scale, so both bodies keep their measured sole height.
function plantedTurn(yaw,angle,progress){
 const direction=Math.sign(angle)||1,firstSide=direction,p=clamp(progress,0,1),step=Math.min(4,Math.floor(p*5)),u=p===1?1:p*5-step;
 const footprint=(side,heading,widen=0)=>new T.Vector3(side*(8.65+widen),7.85,-1).applyAxisAngle(upAxis,heading);
 const feet=[-1,1].map(side=>({side,world:footprint(side,yaw),heading:yaw,roll:0,planted:true}));
 for(let n=0;n<step;n++){
  const side=firstSide*(n%2?-1:1),foot=feet[side<0?0:1];
  foot.heading=yaw+angle*Math.min((n+1)/4,1);foot.world.copy(footprint(side,foot.heading));
 }
 const swingSide=firstSide*(step%2?-1:1),swing=feet[swingSide<0?0:1],support=feet[swingSide<0?1:0];
 const liftPhase=clamp((u-.14)/.72,0,1),travel=smooth(liftPhase),lift=Math.sin(Math.PI*liftPhase)**2;
 const target=yaw+angle*Math.min((step+1)/4,1),bodyYaw=lerp(yaw+angle*Math.min(step/4,1),target,travel);
 swing.heading=lerp(swing.heading,target,travel);
 swing.world.copy(footprint(swingSide,swing.heading,2.0*lift));swing.world.y+=3.8*lift;
 swing.roll=.06*Math.sin(2*Math.PI*liftPhase)*Math.sin(Math.PI*liftPhase);
 swing.planted=liftPhase===0||liftPhase===1;
 const localSupport=support.world.clone().applyAxisAngle(upAxis,-bodyYaw);
 const activity=Math.sin(Math.PI*u)**2;
 return {yaw:bodyYaw,footwork:{phase:(step+u)*.5,direction,activity,
  hipShift:[localSupport.x*.22*activity,-.70*activity,(localSupport.z+1)*.12*activity],
  feet:feet.map(foot=>({point:foot.world.clone().applyAxisAngle(upAxis,-bodyYaw).toArray(),
   yaw:foot.heading-bodyYaw+foot.side*.043,roll:foot.roll,weight:.30*activity,planted:foot.planted,side:foot.side}))
 }};
}

function halfTurnSequence(id,time){
 const direction=id==='m'?1:-1,start=id==='m'?.55:.90,returnAt=id==='m'?4.55:4.90,duration=2.70;
 return time<returnAt?plantedTurn(openYaw[id],direction*Math.PI,(time-start)/duration):
  plantedTurn(openYaw[id]+direction*Math.PI,-direction*Math.PI,(time-returnAt)/duration);
}

function poseGesture({left=.04,right=.04,nod=0,tilt=0,reach=24,height=-20,forward=20}={}){
 return {left,right,reach,height,forward,palm:.18,pitch:0,yaw:0,nod,tilt};
}

/** Absolute, reproducible actor blocking, also used by future-face prediction. */
export function dojoBlocking(line,elapsed,{center=new T.Vector3(),floorY=0}={}){
 const {t,time,duration}=seconds(line,elapsed);
 const origin=id=>new T.Vector3(center.x+(id==='m'?-.8:.8),floorY+(id==='m'?.0236:.003),center.z+.35);
 const m={position:origin('m'),yaw:openYaw.m,gait:{phase:0,strength:0},headYaw:0,gesture:'listen',poseGesture:poseGesture()};
 const f={position:origin('f'),yaw:openYaw.f,gait:{phase:0,strength:0},headYaw:0,gesture:'listen',poseGesture:poseGesture()};
 let phase='conversation';
 if(line.id==='dojo-arrivee'){
  m.yaw=turn(Math.PI,openYaw.m,t/.38);f.yaw=turn(Math.PI,openYaw.f,(t-.12)/.42);
  m.gesture='invite';m.poseGesture=poseGesture({right:.54*pulse(t,.08,.69),height:-10,forward:29});
  f.poseGesture=poseGesture({nod:.09*pulse(t,.46,.28),tilt:.025*pulse(t,.45,.35)});
 }else if(line.id==='dojo-camera'){
  phase='camera';m.gesture='explain';
  m.poseGesture=poseGesture({right:.40*pulse(t,.06,.68),left:.12*pulse(t,.19,.57),height:-10,forward:26});
  f.poseGesture=poseGesture({nod:.07*pulse(t,.64,.24)});
 }else if(line.id==='dojo-deplacement'){
  phase='walking';
  const start=.14,end=.86,u=clamp((t-start)/(end-start),0,1),travel=smooth(u);
  const p=walkPath.getPointAt(travel);f.position.x=center.x+p.x;f.position.z=center.z+p.z;
  const speed=t>start&&t<end?walkLength*6*u*(1-u)/((end-start)*duration):0;
  const cycles=travel*walkLength/walkCycleDistance;
  f.gait={phase:cycles%1,cycles,strength:clamp(speed/.45,0,1)};
  // The actual white shoes dip by up to4.7mm during the articulated step.
  // Give that travelling pose a tiny support clearance; the idle marks stay exact.
  f.position.y+=.006*f.gait.strength*(2-f.gait.strength);
  if(t<start)f.yaw=turn(openYaw.f,pathHeading(0),t/start);
  else if(t>end)f.yaw=turn(pathHeading(1),openYaw.f,(t-end)/(1-end));
  else f.yaw=pathHeading(travel);
  m.yaw=turn(openYaw.m,yawBetween(m.position,f.position)-.14,.8*segment(t,.05,.25)*(1-segment(t,.82,1)));
  m.gesture='invite';m.poseGesture=poseGesture({right:.42*pulse(t,.02,.34),height:-11,forward:29});
  f.poseGesture=poseGesture({nod:.06*pulse(t,.91,.08)});
 }else if(line.id==='dojo-demi-tour'){
  phase='turning';
  for(const [id,actor]of [['m',m],['f',f]]){
   const turning=halfTurnSequence(id,time);
   actor.yaw=turning.yaw;actor.gait={phase:0,strength:0,footwork:turning.footwork};
   actor.poseGesture=poseGesture({left:.03,right:.03});
  }
 }else if(line.id==='dojo-personnaliser'){
  phase='selection';m.gesture='invite';
  m.poseGesture=poseGesture({right:.40*pulse(t,.03,.49),left:.20*pulse(t,.42,.48),height:-11,forward:27});
  f.poseGesture=poseGesture({nod:.08*pulse(t,.50,.25),right:.13*pulse(t,.49,.41)});
 }else if(line.id==='dojo-apparence'){
  phase='appearance';f.gesture='explain';
  f.poseGesture=poseGesture({left:.17*pulse(t,.05,.63),right:.12*pulse(t,.13,.65),nod:.045*pulse(t,.64,.23),tilt:.018*Math.sin(t*Math.PI)});
  m.poseGesture=poseGesture({nod:.07*pulse(t,.34,.22)});
 }else if(line.id==='dojo-vetements'){
  phase='wardrobe';
  // In particular, there is no travelling, body turn or scale animation while
  // the clothes change. The two looks can be compared against a fixed pose.
  m.gesture='explain';m.poseGesture=poseGesture({right:.10*pulse(t,.03,.18)});
  f.poseGesture=poseGesture({nod:.055*(pulse(t,.27,.13)+pulse(t,.55,.13)+pulse(t,.82,.13))});
 }else if(line.id==='dojo-enregistrer'){
  phase='save';f.gesture='explain';
  f.poseGesture=poseGesture({right:.24*pulse(t,.05,.55),height:-14,forward:24,nod:.065*pulse(t,.63,.25)});
  m.poseGesture=poseGesture({nod:.055*pulse(t,.69,.22)});
 }else if(line.id==='dojo-construction'){
  phase='exchange';m.gesture='open';
  const response=pulse(t,.32,.48);
  m.yaw=openYaw.m-.12*response;f.yaw=openYaw.f+.12*response;
  m.poseGesture=poseGesture({left:.26*pulse(t,.04,.78),right:.35*pulse(t,.04,.78),height:-12,forward:25});
  f.poseGesture=poseGesture({left:.19*response,right:.14*response,nod:.075*pulse(t,.55,.28)});
 }else if(line.id==='jardin'){
  phase='departure';m.gesture='invite';
  m.poseGesture=poseGesture({right:.55*pulse(t,.10,.76),height:-9,forward:31});
  f.poseGesture=poseGesture({nod:.08*pulse(t,.44,.30),left:.13*pulse(t,.52,.30)});
 }
 for(const [actor,other]of [[m,f],[f,m]]){
  const limit=actor.gait.strength>.05?.34:.58;
  // A partner crossing behind the turning body must not snap the head from
  // one neck limit to the other; retain the relaxed exchange during the steps.
  const lookYaw=actor.gait.footwork?(actor===m?openYaw.m:openYaw.f):actor.yaw;
  actor.headYaw=clamp(delta(lookYaw,yawBetween(actor.position,other.position)),-limit,limit);
 }
 return {m,f,phase,cue:line.id,time};
}

function localHead(actor,headPosition){
 if(headPosition)return headPosition(actor,new T.Vector3()).clone();
 if(actor.previewHead)return actor.previewHead.clone();
 return actor.root.position.clone().add(new T.Vector3(0,actor.id==='m'?1.65:1.56,0));
}
function boundedEye(aim,azimuth,distance,height,bounds){
 const direction=new T.Vector3(Math.sin(azimuth),0,Math.cos(azimuth));
 let available=distance;
 for(const axis of ['x','z'])if(Math.abs(direction[axis])>.000001){
  const edge=direction[axis]>0?bounds.max[axis]:bounds.min[axis];
  available=Math.min(available,Math.max(.1,(edge-aim[axis])/direction[axis]-.06));
 }
 const eye=aim.clone().addScaledVector(direction,available);eye.y=height;
 return bounds.clampPoint(eye,eye);
}
function fitFramingFov(eye,aim,aspect,envelope,minimum){
 const forward=aim.clone().sub(eye).normalize(),right=new T.Vector3().crossVectors(forward,new T.Vector3(0,1,0)).normalize();
 const up=new T.Vector3().crossVectors(right,forward);let tangent=Math.tan(T.MathUtils.degToRad(minimum/2));
 for(const point of envelope){
  const v=point.clone().sub(eye),depth=Math.max(.08,v.dot(forward));
  tangent=Math.max(tangent,Math.abs(v.dot(up))/(depth*.79),Math.abs(v.dot(right))/(depth*Math.max(.30,aspect)*.81));
 }
 return clamp(T.MathUtils.radToDeg(2*Math.atan(tangent)),minimum,108);
}

/** Camera authored inside the original building; only the intended shot's
 * subject envelope is fitted, so close-ups never become full-body shots. */
export function dojoDirectedCamera({line,elapsed,aspect=16/9,actors,bounds,floor,headPosition}){
 const {t}=seconds(line,elapsed),s=smooth(t),base=floor?.max?.y??0;
 const pair=actors.filter(a=>a.id==='m'||a.id==='f'),byId=new Map(pair.map(a=>[a.id,a]));
 if(pair.length!==2)throw Error('Le cadrage du dojo nécessite les deux personnages.');
 let targets=pair,framing='wide',subject=['m','f'],azimuth=Math.PI,distance=3.55,height=base+1.60,minimum=44,lower=base,halfWidth=.35,halfDepth=.22;
 let closeBlend=0,appearancePush=0;
 if(line.id==='dojo-arrivee'){
  azimuth=lerp(Math.PI+.44,Math.PI-.12,s);distance=lerp(3.7,3.35,s);height=base+lerp(1.70,1.52,s);
 }else if(line.id==='dojo-camera'){
  azimuth=lerp(Math.PI-1.42,Math.PI+1.42,s);distance=3.25;height=base+1.52+.15*Math.sin(t*Math.PI);
 }else if(line.id==='dojo-deplacement'){
  azimuth=lerp(Math.PI-.43,Math.PI+.29,s);distance=3.7;height=base+1.57;
 }else if(line.id==='dojo-demi-tour'){
  azimuth=lerp(Math.PI-.16,Math.PI+.18,s);distance=3.6;height=base+1.46;minimum=40;
 }else if(line.id==='dojo-personnaliser'){
  framing='american';lower=base+.64;distance=3.08;minimum=29;azimuth=lerp(Math.PI+.28,Math.PI-.22,s);height=base+1.45;
  if(aspect<.95){subject=line.speaker==='f'?'f':'m';targets=[byId.get(subject)];distance=2.0;azimuth=subject==='m'?2.40:3.88;}
 }else if(line.id==='dojo-apparence'){
  // Show the actual silhouette switch first (at1.8s), holding the hips and
  // shoulders through4.5s. Only then approach the face for the final detail.
  subject='f';targets=[byId.get(subject)];appearancePush=segment(t,.45,.71);closeBlend=segment(t,.71,.92);
  framing=appearancePush<.28?'american':appearancePush<.94?'medium':closeBlend>.65?'detail':'close';
  halfWidth=lerp(lerp(.37,.20,appearancePush),.12,closeBlend);halfDepth=0;
  if(aspect<.95)halfWidth=Math.max(.16,halfWidth);
  distance=lerp(lerp(1.24,1.12,appearancePush),.74,closeBlend);minimum=lerp(lerp(29,35,appearancePush),31,closeBlend);
  // The opening lens includes the body from this side of Ahmed, so the
  // approach never passes his face through the camera's near plane.
  azimuth=lerp(4.25,4.40,s);
 }else if(line.id==='dojo-vetements'){
  azimuth=Math.PI+.10*Math.sin(t*Math.PI);distance=3.58;height=base+1.53;minimum=43;
 }else if(line.id==='dojo-enregistrer'){
  framing='medium';subject='f';targets=[byId.get(subject)];lower=base+.84;
  distance=1.90;azimuth=lerp(3.98,4.24,s);height=base+1.53;minimum=38;halfWidth=.36;halfDepth=.17;
 }else if(line.id==='dojo-construction'){
  framing=t<.52?'american':'wide';lower=base+.64*(1-s);distance=lerp(2.95,3.62,s);
  azimuth=lerp(Math.PI-.59,Math.PI+.60,s);height=base+lerp(1.43,1.69,s);minimum=lerp(29,42,s);
  if(aspect<.95){lower=base;framing='wide';}
 }else if(line.id==='jardin'){
  azimuth=lerp(Math.PI+.33,Math.PI-.27,s);distance=lerp(3.1,3.8,s);height=base+lerp(1.48,1.84,s);
 }
 const heads=targets.map(a=>localHead(a,headPosition));
 const top=Math.max(...heads.map(h=>h.y))+.20;
 const aim=targets.reduce((sum,a)=>sum.add(a.root.position),new T.Vector3()).multiplyScalar(1/targets.length);
 if(line.id==='dojo-apparence'){
  const faceOffset=aspect<.95?lerp(-.025,-.045,closeBlend):lerp(-.015,.005,closeBlend);
  aim.copy(heads[0]);aim.y=lerp((base+.64+top)*.5,heads[0].y+faceOffset,appearancePush);
  lower=lerp(base+.64,heads[0].y-lerp(.25,.145,closeBlend),appearancePush);
  height=lerp(base+1.50,heads[0].y+.035,appearancePush);
 }else aim.y=(lower+top)*.5;
 const eye=boundedEye(aim,azimuth,distance,height,bounds),envelope=[];
 const screenRight=new T.Vector3().crossVectors(aim.clone().sub(eye),new T.Vector3(0,1,0)).normalize();
 for(let i=0;i<targets.length;i++){
  const p=targets[i].root.position,head=heads[i],upper=line.id==='dojo-apparence'?head.y+lerp(.22,.15,closeBlend):head.y+.20;
  if(line.id==='dojo-apparence'){
   for(const dx of [-halfWidth,halfWidth])for(const y of [lower,upper])envelope.push(new T.Vector3(head.x,y,head.z).addScaledVector(screenRight,dx));
  }else for(const dx of [-halfWidth,halfWidth])for(const dz of [-halfDepth,halfDepth])for(const y of [lower,upper])envelope.push(new T.Vector3(p.x+dx,y,p.z+dz));
 }
 return {eye,aim,fov:fitFramingFov(eye,aim,aspect,envelope,minimum),roll:0,framing,subject,cutKey:line.id};
}
