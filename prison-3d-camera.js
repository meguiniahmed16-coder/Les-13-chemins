import {Vector3,MathUtils} from 'three';

export const PRISON_TOUR_DURATION=9;
export const PRISON_EYE_HEIGHT=1.62;

// Footprints include the real bed frame and table, not just their centres.
// A small body radius is added at collision time so the eye cannot enter them.
export const PRISON_CAMERA_COLLIDERS=Object.freeze([
 Object.freeze({name:'lit',minX:-1.47,maxX:-.52,minZ:-1.05,maxZ:1.01}),
 Object.freeze({name:'armoire',minX:.85,maxX:1.42,minZ:.73,maxZ:1.24}),
 Object.freeze({name:'table',minX:.39,maxX:1.25,minZ:-.9,maxZ:-.23}),
 Object.freeze({name:'wc',minX:.93,maxX:1.55,minZ:-.14,maxZ:.32}),
 Object.freeze({name:'lavabo',minX:1.01,maxX:1.48,minZ:-1.28,maxZ:-.70}),
 Object.freeze({name:'tabouret',minX:.19,maxX:.71,minZ:.10,maxZ:.64})
]);

const START=new Vector3(0,PRISON_EYE_HEIGHT,.75);
const WINDOW=new Vector3(0,1.48,-1.55);
const RADIUS=.14;
const MIN_X=-1.28,MAX_X=1.28,MIN_Z=-1.21,MAX_Z=1.27;
const clamp=MathUtils.clamp;
const smooth=t=>t*t*(3-2*t);
const angleDelta=(to,from)=>Math.atan2(Math.sin(to-from),Math.cos(to-from));
const blend=(speed,dt)=>1-Math.exp(-speed*dt);

// All positions remain in the clear centre aisle, inside the closed cell.
// The gaze visits the beds, wash area, closed door, then the barred window.
const TOUR=Object.freeze([
 {at:0,position:[.02,1.58,.94],look:[-1.03,1.04,-.05]},
 {at:2.1,position:[-.04,1.60,.30],look:[-1.04,1.38,-.55]},
 {at:4.2,position:[-.06,1.61,-.12],look:[1.18,.91,-.48]},
 {at:6.3,position:[0,1.58,-.43],look:[.83,1.18,1.47]},
 {at:8.0,position:[0,1.62,.35],look:[0,1.48,-1.55]},
 {at:9.0,position:[0,1.62,.75],look:[0,1.48,-1.55]}
]);

/**
 * First-person eye and gaze controller. `player` is the eye position in world
 * metres, not the feet. `target` is the point currently looked at. Drag deltas
 * are pixels; joystick x/y are normalised and y < 0 moves forward.
 */
export function createPrisonCamera(camera,{onTourEnd=()=>{},colliders=PRISON_CAMERA_COLLIDERS,moveSpeed=.78}={}){
 const player=START.clone(),target=WINDOW.clone();
 const direction=new Vector3(),delta=new Vector3();
 let mode='ready',elapsed=0,yaw=0,pitch=0,lastPhase=0,travel=null;

 function syncAngles(){
  delta.copy(target).sub(player);
  yaw=Math.atan2(delta.x,-delta.z);
  pitch=Math.atan2(delta.y,Math.hypot(delta.x,delta.z));
 }
 function placeCamera(){
  camera.position.copy(player);
  camera.up.set(0,1,0);
  camera.lookAt(target);
  camera.updateMatrixWorld(true);
 }
 function gazePoint(distance=3){
  direction.set(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
  target.copy(player).addScaledVector(direction,distance);
 }
 function reset(){
  mode='ready';elapsed=0;lastPhase=0;travel=null;
  player.copy(START);target.copy(WINDOW);syncAngles();placeCamera();
 }
 function tourFrame(time){
  let index=0;
  while(index<TOUR.length-2&&time>TOUR[index+1].at)index++;
  const from=TOUR[index],to=TOUR[index+1];
  const t=smooth(clamp((time-from.at)/(to.at-from.at),0,1));
  player.fromArray(from.position).lerp(delta.fromArray(to.position),t);
  target.fromArray(from.look).lerp(delta.fromArray(to.look),t);
  syncAngles();placeCamera();
 }
 function startTour(){reset();mode='tour';tourFrame(0);}
 function finishTour(){
  if(mode==='playing')return;
  mode='playing';elapsed=PRISON_TOUR_DURATION;travel=null;
  player.copy(START);target.copy(WINDOW);syncAngles();placeCamera();
  onTourEnd();
 }
 function skipTour(){finishTour();}

 function moveAndSlide(dx,dz){
  let nextX=clamp(player.x+dx,MIN_X,MAX_X);
  for(const box of colliders){
   if(player.z<=box.minZ-RADIUS||player.z>=box.maxZ+RADIUS)continue;
   if(dx>0&&player.x<=box.minX-RADIUS&&nextX>box.minX-RADIUS)
    nextX=Math.min(nextX,box.minX-RADIUS);
   else if(dx<0&&player.x>=box.maxX+RADIUS&&nextX<box.maxX+RADIUS)
    nextX=Math.max(nextX,box.maxX+RADIUS);
  }
  player.x=nextX;
  let nextZ=clamp(player.z+dz,MIN_Z,MAX_Z);
  for(const box of colliders){
   if(player.x<=box.minX-RADIUS||player.x>=box.maxX+RADIUS)continue;
   if(dz>0&&player.z<=box.minZ-RADIUS&&nextZ>box.minZ-RADIUS)
    nextZ=Math.min(nextZ,box.minZ-RADIUS);
   else if(dz<0&&player.z>=box.maxZ+RADIUS&&nextZ<box.maxZ+RADIUS)
    nextZ=Math.max(nextZ,box.maxZ+RADIUS);
  }
  player.z=nextZ;
 }
 function aimAt(point,dt){
  delta.copy(point).sub(player);
  const horizontal=Math.hypot(delta.x,delta.z);
  if(delta.lengthSq()<.00001)return;
  const desiredYaw=horizontal<.00001?yaw:Math.atan2(delta.x,-delta.z);
  const desiredPitch=clamp(Math.atan2(delta.y,horizontal),-1.23,.98);
  const alpha=blend(13,dt);
  yaw+=angleDelta(desiredYaw,yaw)*alpha;
  pitch+=(desiredPitch-pitch)*alpha;
 }
 function advanceTravel(dt){
  const point=travel?.[0];if(!point)return;
  const dx=point.x-player.x,dz=point.z-player.z;
  const distance=Math.hypot(dx,dz),step=Math.min(distance,.9*dt);
  if(distance>.00001)moveAndSlide(dx/distance*step,dz/distance*step);
  if(Math.hypot(point.x-player.x,point.z-player.z)<.012)travel.shift();
  if(!travel.length)travel=null;
 }
 function update(frameTime,input={}){
  const dt=clamp(Number.isFinite(frameTime)?frameTime:0,0,.1);
  if(mode==='tour'){
   elapsed=Math.min(PRISON_TOUR_DURATION,elapsed+dt);
   tourFrame(elapsed);
   if(elapsed>=PRISON_TOUR_DURATION-1e-8)finishTour();
   return;
  }
  if(mode!=='playing'){placeCamera();return;}
  const phase=Number.isFinite(input.phase)?input.phase:lastPhase;
  if(lastPhase===0&&phase>0&&phase<3){
   // Reach the window through the clear aisle, never through the table.
   travel=[new Vector3(0,0,player.z),new Vector3(0,0,-.88)];
  }
  lastPhase=phase;
  const focus=input.focus?.isVector3?input.focus:null;
  if(!focus&&!travel){
   yaw+=(Number.isFinite(input.lookX)?input.lookX:0)*.003;
   pitch=clamp(pitch-(Number.isFinite(input.lookY)?input.lookY:0)*.003,-1.23,.98);
  }
  if(travel)advanceTravel(dt);
  else{
   let x=clamp(Number.isFinite(input.x)?input.x:0,-1,1);
   let y=clamp(Number.isFinite(input.y)?input.y:0,-1,1);
   const length=Math.hypot(x,y);if(length>1){x/=length;y/=length;}
   const distance=moveSpeed*(input.hide?.55:1)*dt;
   moveAndSlide((Math.cos(yaw)*x-Math.sin(yaw)*y)*distance,
    (Math.sin(yaw)*x+Math.cos(yaw)*y)*distance);
  }
  const eyeHeight=input.hide?1.06:PRISON_EYE_HEIGHT;
  player.y+=(eyeHeight-player.y)*blend(10,dt);
  if(focus)aimAt(focus,dt);else if(travel)aimAt(WINDOW,dt);
  gazePoint(focus?Math.max(.1,player.distanceTo(focus)):3);
  placeCamera();
 }
 reset();
 return {player,target,startTour,skipTour,update,reset,
  get mode(){return mode;},get tourProgress(){return elapsed/PRISON_TOUR_DURATION;},
  get isTravelling(){return !!travel;}};
}
