// Keep double taps exclusive: no sale or dodge is committed until the tap is disambiguated.
export const DOUBLE_TAP_MS=320;
export function createSecretControls({single,double,now=()=>performance.now(),schedule=setTimeout,unschedule=clearTimeout}){
 let pending=null,blocked=null;
 function clear(){if(pending)unschedule(pending.timer);pending=null;blocked=null;}
 function press(button,stamp=now()){
  if(blocked&&blocked.button===button&&stamp-blocked.time>=0&&stamp-blocked.time<=DOUBLE_TAP_MS)return;
  blocked=null;
  if(pending){
   const previous=pending;unschedule(previous.timer);pending=null;
   if(previous.button===button&&stamp-previous.time>=0&&stamp-previous.time<=DOUBLE_TAP_MS){blocked={button,time:stamp};double(button);return;}
   single(previous.button);
  }
  const tap={button,time:stamp,timer:null};pending=tap;
  tap.timer=schedule(()=>{if(pending!==tap)return;pending=null;single(button);},DOUBLE_TAP_MS);
 }
 return {press,clear};
}
// A touch/pointer sequence produces a compatibility click too. It must count only once.
export function bindSecretButton(button,press,now=()=>performance.now()){
 let lastPointer=-Infinity;
 // Use the same processing clock as the timer, including on a busy rendering frame.
 const down=e=>{if(button.disabled)return;e.preventDefault();lastPointer=now();button.classList.add('held');press(lastPointer);};
 const up=()=>button.classList.remove('held');
 const click=e=>{if(button.disabled)return;if(e.detail===0&&now()-lastPointer>650)press(now());};
 button.addEventListener('pointerdown',down);
 for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,up);
 button.addEventListener('click',click);
}
