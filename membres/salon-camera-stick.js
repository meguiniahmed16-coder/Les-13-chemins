// Pointer capture lets one thumb travel while the other hand looks around the scene.
export function bindCameraStick(pad,begin,input,signal){
  const thumb=pad.querySelector('span'),keys=new Set(),options={signal};
  let pointer=null;
  function drive(x,y){
    const length=Math.hypot(x,y),scale=length>.10?Math.min(1,(length-.10)/.90)/length:0;
    x*=scale;y*=scale;
    thumb.style.transform='translate('+x*16+'px,'+y*16+'px)';
    input(x,-y);
  }
  function point(e){
    const r=pad.getBoundingClientRect(),radius=Math.min(r.width,r.height)*.36;
    if(radius>0)drive((e.clientX-r.x-r.width/2)/radius,(e.clientY-r.y-r.height/2)/radius);
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

export function createTravelMotion(reduce=()=>false){
  let x=0,z=0,side=0,forward=0;
  return {input(strafe,advance){x=strafe;z=advance;},
    stop(){x=z=side=forward=0;},
    get moving(){return Boolean(x||z||side||forward);},
    step(dt,move){
      const gain=reduce()?1:-Math.expm1(-(x||z?8:14)*dt);
      side+=(x-side)*gain;forward+=(z-forward)*gain;
      if(!x&&Math.abs(side)<.003)side=0;
      if(!z&&Math.abs(forward)<.003)forward=0;
      if(side||forward)move(side*1.45*dt,forward*1.45*dt);
    }
  };
}
