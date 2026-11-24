const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const ease=n=>{n=clamp(n,0,1);return n*n*(3-2*n);};
export const INTRO_FINALE_DURATION=13000;

// One parent-controlled clock also drives the real garden's butterflies and
// articulated wings. Repeating a sample while paused never advances the scene.
export function introFinaleFrame(elapsedMs,{width=1280,height=720}={}){
 const elapsed=clamp(Number(elapsedMs)||0,0,INTRO_FINALE_DURATION),time=elapsed/1000;
 width=Math.max(1,width);height=Math.max(1,height);const aspect=width/height;
 const wings=ease((elapsed-5000)/2000),turn=ease(elapsed/INTRO_FINALE_DURATION);
 const top=Math.min(122,height*.49),bottom=Math.min(24,height*.1),usable=(height-top-bottom)/height;
 const span=3.3+2.8*wings,maxDistance=10.45;
 let fov=(aspect<1?58:48)+(aspect<1?10:1)*wings;
 fov=Math.max(fov,Math.atan(span/(2*maxDistance*aspect*.87))*360/Math.PI);
 const tangent=Math.tan(fov*Math.PI/360);
 const distance=Math.max(4.35,span/(2*tangent*aspect*.87),2.15/(2*tangent*usable*.90));
 const angle=Math.PI-.12+.24*turn,targetY=1.075+tangent*distance*(top-bottom)/height;
 return {
  elapsedMs:elapsed,time,phase:elapsed<5000?'garden':elapsed<7000?'opening':'wings',wings,
  wingPhase:time*.92,wingPower:.07+.05*ease((elapsed-7000)/1200),
  actors:{m:{x:-.90,z:3.48,yaw:Math.PI-.04},f:{x:.94,z:3.76,yaw:Math.PI+.07}},
  camera:{fov,position:[Math.sin(angle)*distance,targetY+.40,3.62+Math.cos(angle)*distance],target:[0,targetY,3.62]},
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
  sample(elapsedMs){
   if(!active)return {active:false,finished,...(last||{})};
   const frame=introFinaleFrame(elapsedMs,adapter.viewport());
   adapter.apply(frame);last={...frame,faces:adapter.faces?.()||[]};
   return {active:true,finished:false,...last};
  },
  finish(){
   if(!finished){active=false;adapter.finish();finished=true;}
   return {active:false,finished:true,place:'salon'};
  }
 };
 return api;
}
