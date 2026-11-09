// Independent pointer identities allow walking, looking and reaching together.
export function createPrisonControls({surface,joystick,knob,actionButton,hideButton,
 onActionDown=()=>{},onActionUp=()=>{},onPause=()=>{}}){
 const state={x:0,y:0,hide:false,holding:false};
 const keys=new Set(),removers=[];
 let stickPointer=null,lookPointer=null,actionPointer=null,hidePointer=null;
 let stickX=0,stickY=0,lookX=0,lookY=0,lastLookX=0,lastLookY=0;
 let actionEnter=false,hideEnter=false,disposed=false;
 const enabled=element=>!disposed&&!element.disabled&&element.getAttribute('aria-disabled')!=='true';
 const movementEnabled=()=>enabled(joystick);
 const on=(target,event,callback,options)=>{
  target.addEventListener(event,callback,options);
  removers.push(()=>target.removeEventListener(event,callback,options));
 };
 const capture=(element,id)=>{try{element.setPointerCapture(id);}catch{}};
 const release=(element,id)=>{
  if(id===null)return;
  try{if(element.hasPointerCapture(id))element.releasePointerCapture(id);}catch{}
 };
 function update(){
  const left=keys.has('KeyA')||keys.has('KeyQ')||keys.has('ArrowLeft');
  const right=keys.has('KeyD')||keys.has('ArrowRight');
  const forward=keys.has('KeyW')||keys.has('KeyZ')||keys.has('ArrowUp');
  const backward=keys.has('KeyS')||keys.has('ArrowDown');
  let x=stickX+(right?1:0)-(left?1:0),y=stickY+(backward?1:0)-(forward?1:0);
  const length=Math.hypot(x,y);if(length>1){x/=length;y/=length;}
  state.x=movementEnabled()?x:0;state.y=movementEnabled()?y:0;
  state.hide=enabled(hideButton)&&(hidePointer!==null||hideEnter||keys.has('KeyC')||keys.has('ControlLeft')||keys.has('ControlRight'));
  const holding=enabled(actionButton)&&(actionPointer!==null||actionEnter||keys.has('Space'));
  const previous=state.holding;state.holding=holding;
  actionButton.dataset.held=String(holding);hideButton.dataset.held=String(state.hide);
  const radius=Math.max(8,(joystick.clientWidth-knob.clientWidth)/2-5);
  knob.style.transform='translate(calc(-50% + '+(state.x*radius).toFixed(2)+'px),calc(-50% + '+(state.y*radius).toFixed(2)+'px))';
  if(holding&&!previous)onActionDown();
  if(!holding&&previous)onActionUp();
 }
 function stickMove(event){
  if(event.pointerId!==stickPointer)return;
  event.preventDefault();
  const rect=joystick.getBoundingClientRect();
  const radius=Math.max(12,(Math.min(rect.width,rect.height)-knob.clientWidth)/2-5);
  let x=(event.clientX-rect.left-rect.width/2)/radius;
  let y=(event.clientY-rect.top-rect.height/2)/radius;
  const length=Math.hypot(x,y),dead=.12;
  if(length<dead){x=0;y=0;}
  else{
   const amount=Math.min(1,(length-dead)/(1-dead));
   x=x/length*amount;y=y/length*amount;
  }
  stickX=x;stickY=y;update();
 }
 on(joystick,'pointerdown',event=>{
  if(!movementEnabled()||stickPointer!==null||(event.pointerType==='mouse'&&event.button!==0))return;
  event.preventDefault();stickPointer=event.pointerId;
  capture(joystick,stickPointer);stickMove(event);
 },{passive:false});
 on(joystick,'pointermove',stickMove,{passive:false});
 function stopStick(event){
  if(event.pointerId!==stickPointer)return;
  const id=stickPointer;stickPointer=null;stickX=0;stickY=0;
  release(joystick,id);update();
 }
 for(const event of ['pointerup','pointercancel','lostpointercapture'])on(joystick,event,stopStick);

 on(surface,'pointerdown',event=>{
  if(!movementEnabled()||lookPointer!==null||(event.pointerType==='mouse'&&event.button!==0))return;
  event.preventDefault();lookPointer=event.pointerId;
  lastLookX=event.clientX;lastLookY=event.clientY;
  capture(surface,lookPointer);
 },{passive:false});
 on(surface,'pointermove',event=>{
  if(event.pointerId!==lookPointer)return;
  event.preventDefault();
  lookX+=event.clientX-lastLookX;lookY+=event.clientY-lastLookY;
  lastLookX=event.clientX;lastLookY=event.clientY;
 },{passive:false});
 function stopLook(event){
  if(event.pointerId!==lookPointer)return;
  const id=lookPointer;lookPointer=null;release(surface,id);
 }
 for(const event of ['pointerup','pointercancel','lostpointercapture'])on(surface,event,stopLook);

 function bindHold(button,type){
  on(button,'pointerdown',event=>{
   if(!enabled(button)||(event.pointerType==='mouse'&&event.button!==0))return;
   if((type==='action'?actionPointer:hidePointer)!==null)return;
   event.preventDefault();
   if(type==='action')actionPointer=event.pointerId;else hidePointer=event.pointerId;
   capture(button,event.pointerId);update();
  },{passive:false});
  const stop=event=>{
   const id=type==='action'?actionPointer:hidePointer;
   if(event.pointerId!==id)return;
   if(type==='action')actionPointer=null;else hidePointer=null;
   release(button,id);update();
  };
  for(const event of ['pointerup','pointercancel','lostpointercapture'])on(button,event,stop);
  on(button,'keydown',event=>{
   if(event.code!=='Enter'||!enabled(button))return;
   event.preventDefault();if(type==='action')actionEnter=true;else hideEnter=true;update();
  });
  on(button,'keyup',event=>{
   if(event.code!=='Enter')return;
   event.preventDefault();if(type==='action')actionEnter=false;else hideEnter=false;update();
  });
 }
 bindHold(actionButton,'action');bindHold(hideButton,'hide');
 const movementKeys=new Set(['KeyW','KeyZ','KeyA','KeyQ','KeyS','KeyD','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyC','ControlLeft','ControlRight','Space']);
 on(window,'keydown',event=>{
  if(!movementEnabled()||event.target?.closest?.('input,textarea,select,[contenteditable=true]'))return;
  // Keep native keyboard activation on navigation/start buttons.
  if(event.code==='Space'&&event.target?.closest?.('button,a')&&event.target!==actionButton&&event.target!==hideButton)return;
  if(event.code==='Space'&&event.target===hideButton){event.preventDefault();hideEnter=true;update();return;}
  if(event.code==='KeyP'&&!event.repeat){event.preventDefault();onPause();return;}
  if(!movementKeys.has(event.code))return;
  event.preventDefault();keys.add(event.code);update();
 });
 on(window,'keyup',event=>{
  if(event.code==='Enter'){actionEnter=false;hideEnter=false;update();return;}
  if(!movementKeys.has(event.code))return;
  if(event.code==='Space')hideEnter=false;
  keys.delete(event.code);update();
 });
 function reset(){
  const held=[[joystick,stickPointer],[surface,lookPointer],[actionButton,actionPointer],[hideButton,hidePointer]];
  stickPointer=lookPointer=actionPointer=hidePointer=null;
  stickX=stickY=lookX=lookY=0;actionEnter=hideEnter=false;keys.clear();
  for(const [element,id]of held)release(element,id);
  update();
 }
 on(window,'blur',reset);
 on(document,'visibilitychange',()=>{if(document.hidden)reset();});
 for(const element of [surface,joystick,actionButton,hideButton])on(element,'contextmenu',event=>event.preventDefault());
 update();
 return {
  state,
  consumeLook(){const result={x:lookX,y:lookY};lookX=lookY=0;return result;},
  reset,
  dispose(){reset();disposed=true;for(const remove of removers)remove();}
 };
}
