const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const ease=n=>{n=clamp(n,0,1);return n*n*(3-2*n);};
export const INTRO_FINALE_DURATION=20000;
export const ANGEL_ACTIVATE_MS=3000;
export const WINGS_READY_MS=5000;
export const LAUNCH_MS=6500;
export const ORBIT_START_MS=9000;
export const ORBIT_END_MS=15500;
export const WING_BEAT_MS=850;
export function introFinaleFrame(elapsedMs,{width=1280,height=720}={}){
 const elapsed=clamp(Number(elapsedMs)||0,0,INTRO_FINALE_DURATION),time=elapsed/1000;
 width=Math.max(1,width);height=Math.max(1,height);const aspect=width/height;
 const wings=ease((elapsed-ANGEL_ACTIVATE_MS)/(WINGS_READY_MS-ANGEL_ACTIVATE_MS));
 const rise=ease((elapsed-LAUNCH_MS)/2500),fly=ease((elapsed-ORBIT_END_MS)/(INTRO_FINALE_DURATION-ORBIT_END_MS));
 const beatPhase=Math.max(0,(elapsed-LAUNCH_MS)/WING_BEAT_MS)*Math.PI*2;
 const heightY=4.2*rise+8.5*fly+.12*rise*Math.sin(beatPhase);
 const centerZ=3.62-9*fly;
 const orbit=clamp((elapsed-ORBIT_START_MS)/(ORBIT_END_MS-ORBIT_START_MS),0,1);
 const angle=Math.PI-.12+2*Math.PI*ease(orbit);
 const top=Math.min(122,height*.30),bottom=Math.min(24,height*.10),usable=(height-top-bottom)/height;
 const span=3.4+3.5*wings;
 const fov=clamp(Math.max(49,Math.atan(span/(2*5.8*aspect*.80))*360/Math.PI),49,98);
 const tangent=Math.tan(fov*Math.PI/360);
 const distance=Math.max(4.8,span/(2*tangent*aspect*.80),2.8/(2*tangent*usable*.90));
 const radius=distance+fly*24;
 const targetY=heightY+1.12+tangent*distance*(top-bottom)/height;
 const target=[0,targetY*(1-.42*fly),centerZ+fly*2.5];
 const camY=targetY+.45+rise*2.6+fly*15;
 return {
  elapsedMs:elapsed,time,phase:elapsed<ANGEL_ACTIVATE_MS?'garden':elapsed<WINGS_READY_MS?'opening':elapsed<LAUNCH_MS?'wings':elapsed<ORBIT_START_MS?'launch':elapsed<ORBIT_END_MS?'orbit':'wide',wings,
  altitude:heightY,orbitRadians:2*Math.PI*ease(orbit),wingPhase:beatPhase,wingPower:.12+.65*ease((elapsed-LAUNCH_MS)/500),
  actors:{m:{x:-.90,y:heightY,z:centerZ-.14,yaw:Math.PI-.04},f:{x:.94,y:heightY+.08*rise,z:centerZ+.14,yaw:Math.PI+.07}},
  camera:{fov,position:[Math.sin(angle)*radius,camY,centerZ+Math.cos(angle)*radius],target},
  reservedTop:top,viewport:{width,height}
 };
}

export function createIntroFinale(adapter){
 let active=false,finished=false,last=null;
 const api={
  get active(){return active;},
  get elapsedMs(){return last?.elapsedMs||0;},
  begin(){
   if(active)return api.sample(0);
   active=true;finished=false;
   try{adapter.begin();return api.sample(0);}
   catch(error){active=false;throw error;}
  },
  sample(elapsedMs,voice={}){
   if(!active)return {active:false,finished,...(last||{})};
   const frame=introFinaleFrame(elapsedMs,adapter.viewport());
   frame.voice={speaker:voice.speaker,energy:Math.max(0,Number(voice.energy)||0)};adapter.apply(frame);last={...frame,faces:adapter.faces?.()||[]};
   return {active:true,finished:false,...last};
  },
  finish(){
   if(!finished){active=false;adapter.finish();finished=true;}
   return {active:false,finished:true,place:'salon'};
  }
 };
 return api;
}
