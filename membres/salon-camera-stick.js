// Scale the whole gesture so equal pinches in opposite directions cancel out.
export const touchGestureGain=pointerType=>pointerType==='touch' ? .5 : 1;
export function touchStickScale(length){
  if(length<=.10)return 0;
  return .78*Math.min(1,(length-.10)/.90)**1.35/length;
}

// Pointer capture lets one thumb travel while the other hand looks around the scene.
export function bindCameraStick(pad,begin,input,signal){
  const thumb=pad.querySelector('span'),keys=new Set(),options={signal};
  let pointer=null;
  function drive(x,y,touch=false){
    const length=Math.hypot(x,y);
    const scale=touch?touchStickScale(length):length>.10?Math.min(1,(length-.10)/.90)/length:0;
    x*=scale;y*=scale;
    thumb.style.transform='translate('+x*16+'px,'+y*16+'px)';
    input(x,-y);
  }
  function point(e){
    const r=pad.getBoundingClientRect(),radius=Math.min(r.width,r.height)*.36;
    if(radius>0)drive((e.clientX-r.x-r.width/2)/radius,(e.clientY-r.y-r.height/2)/radius,e.pointerType==='touch');
  }
  function release(){pointer=null;keys.clear();drive(0,0);}
  pad.addEventListener('pointerdown',e=>{
    if(e.button!==0||pointer!==null)return;
    e.preventDefault();pad.setPointerCapture(e.pointerId);pointer=e.pointerId;begin();point(e);
  },options);
  pad.addEventListener('pointermove',e=>{if(e.pointerId===pointer)point(e);},options);
  for(const name of ['pointerup','pointercancel','lostpointercapture'])
    pad.addEventListener(name,e=>{if(e.pointerId===pointer)release();},options);
  const arrows=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
  for(const name of ['keydown','keyup'])pad.addEventListener(name,e=>{
    if(!arrows.includes(e.key))return;
    e.preventDefault();e.stopPropagation();
    if(name==='keydown'){if(!keys.size)begin();keys.add(e.key);}else keys.delete(e.key);
    drive(Number(keys.has('ArrowRight'))-Number(keys.has('ArrowLeft')),Number(keys.has('ArrowDown'))-Number(keys.has('ArrowUp')));
  },options);
  pad.addEventListener('blur',()=>{if(keys.size)release();},options);
  window.addEventListener('blur',release,options);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)release();},options);
  return release;
}

// Tap for a precise step, or hold either arrow for a continuous pedestal move.
export function bindCameraHeight(group,begin,motion,signal){
  const options={signal};
  let pointer=null,timer=0,held=false;
  function release(){
    clearTimeout(timer);pointer=null;motion.rise(0);
  }
  for(const button of group.querySelectorAll('[data-height]')){
    const direction=Number(button.dataset.height);
    button.addEventListener('pointerdown',e=>{
      if(e.button!==0||pointer!==null)return;
      pointer=e.pointerId;button.setPointerCapture(pointer);held=false;
      timer=setTimeout(()=>{
        if(!button.getClientRects().length){release();return;}
        begin();motion.rise(direction);held=true;
      },160);
    },options);
    for(const event of ['pointerup','pointercancel','lostpointercapture'])
      button.addEventListener(event,e=>{if(e.pointerId===pointer)release();},options);
    button.addEventListener('click',e=>{
      if(!held||e.detail===0){begin();motion.nudge(direction);}
      held=false;
    },options);
    button.addEventListener('contextmenu',e=>e.preventDefault(),options);
  }
  window.addEventListener('blur',release,options);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)release();},options);
  signal?.addEventListener('abort',release,{once:true});
}

export function createTravelMotion(reduce=()=>false){
  let x=0,z=0,y=0,side=0,forward=0,vertical=0,stepLeft=0;
  return {input(strafe,advance){x=strafe;z=advance;},
    rise(direction){y=direction;},
    nudge(direction){stepLeft+=direction*.12;},
    stop(){x=z=y=side=forward=vertical=stepLeft=0;},
    get moving(){return Boolean(x||z||y||side||forward||vertical||stepLeft);},
    step(dt,move){
      const gain=target=>reduce()?1:-Math.expm1(-(target?8:14)*dt);
      const planar=gain(x||z);
      side+=(x-side)*planar;forward+=(z-forward)*planar;
      vertical+=(y-vertical)*gain(y);
      if(!x&&Math.abs(side)<.003)side=0;
      if(!z&&Math.abs(forward)<.003)forward=0;
      if(!y&&Math.abs(vertical)<.003)vertical=0;
      const step=Math.abs(stepLeft)<.0003?stepLeft:stepLeft*gain(0);
      stepLeft-=step;
      if(side||forward||vertical||step)move(side*1.45*dt,forward*1.45*dt,vertical*.85*dt+step);
    }
  };
}
