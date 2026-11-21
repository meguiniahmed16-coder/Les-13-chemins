import {moveCamera,orbitCamera,zoomCamera,seatAt} from './salon-navigation.js?v=salon34';

const icon=(path)=>'<svg aria-hidden="true" viewBox="0 0 24 24"><path d="'+path+'"/></svg>';
const icons={
  full:icon('M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5'),
  center:icon('M12 3v3m0 12v3M3 12h3m12 0h3 M18 12a6 6 0 1 1-12 0 6 6 0 1 1 12 0'),
  pan:icon('M12 2v20M2 12h20M9 5l3-3 3 3M9 19l3 3 3-3M5 9l-3 3 3 3m14-6 3 3-3 3')
};
const button=(id,label,content,extra='')=>'<button class="tool '+id+'" type="button" data-action="'+id+'" aria-label="'+label+'" title="'+label+'" '+extra+'>'+content+'</button>';
export function salonMarkup(poster,style) {
  return `<link rel="stylesheet" href="${style}"><div class="stage"><div class="scene-viewport">
    <canvas tabindex="0" aria-label="Salon 3D. Les flèches déplacent le personnage."></canvas>
    <canvas hidden tabindex="0" aria-label="Salon 3D. Les flèches déplacent le personnage."></canvas>
    <img class="poster" src="${poster}" alt="Le personnage habillé dans son salon">
    <div class="hud" hidden><div class="bar">
      ${button('pan','Déplacer le cadrage par glissement',icons.pan,'aria-pressed="false"')}
      ${button('center','Recentrer sur le personnage',icons.center)}
      ${button('out','Éloigner la caméra','−')}${button('in','Rapprocher la caméra','+')}
      ${button('full','Plein écran',icons.full+'<span class="full-text">Plein écran</span>','aria-pressed="false"')}
    </div><button type="button" class="stick" aria-label="Joystick de marche. Au clavier, utiliser les flèches." title="Déplacer le personnage"><span class="thumb"></span></button>
    <button class="options-toggle" type="button" aria-expanded="false" aria-controls="studio-drawer">Personnaliser ▾</button></div></div><aside id="studio-drawer" class="studio-drawer" hidden></aside></div>
    <div class="info" hidden><p>Glisse pour tourner la caméra. À deux doigts, déplace la vue ou pince pour zoomer. Touche deux fois un siège pour t’asseoir. Le joystick te relève.</p></div><p class="state" role="status" aria-live="polite"></p><button type="button" class="room-retry" hidden>Relancer le salon</button>`;
}
export function bindSalon(root,motion,roomBytes,wake,available=()=>true,manual=()=>{}) {
  const stage=root.querySelector('.stage'),stick=root.querySelector('.stick'),thumb=root.querySelector('.thumb');
  const status=root.querySelector('.state');
  const full=root.querySelector('.full'),pan=root.querySelector('.pan'), pointers=new Map();
  const lifetime=new AbortController();
  const listen=(el,event,fn,options={})=>el.addEventListener(event,fn,{...options,signal:lifetime.signal});
  const help=root.querySelector('.info'),hud=root.querySelector('.hud');
  const canvas=()=>root.querySelector('canvas:not([hidden])');
  const viewport=()=>canvas().getBoundingClientRect();
  let panning=false,stickID=null,lastTap=null,pair=null,immersive=false,previousOverflow='',active=true;
  const movementKeys=new Set(['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','KeyW','KeyA','KeyZ','KeyQ','KeyS','KeyD']);
  function showStatus(mode,seat) {
    status.textContent=({walk:'En chemin vers '+seat?.label,unreachable:'Cette place est inaccessible depuis cette position.',seated:'Assis · '+seat?.label,idle:''})[mode]??'';
  }
  function resetStick(){stickID=null;thumb.style.transform='';motion.stick(0,0);}
  function clearInputs(){pointers.clear();lastTap=pair=null;resetStick();motion.releaseInputs();wake();}
  const getPair=()=>{
    const [a,b]=pointers.values();
    return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,d:Math.max(2,Math.hypot(a.x-b.x,a.y-b.y))};
  };
  for(const target of root.querySelectorAll('canvas')) {
    listen(target,'contextmenu',e=>e.preventDefault());
    listen(target,'pointerdown',e=>{
      if(e.button!==0&&e.button!==1&&e.button!==2)return;
      target.focus({preventScroll:true});target.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,moved:e.button!==0,pan:e.button!==0||e.shiftKey});
      if(pointers.size>=2){pair=getPair();lastTap=null;for(const p of pointers.values())p.moved=true;}
    });
    listen(target,'pointermove',e=>{
      const p=pointers.get(e.pointerId);if(!p)return;
      const dx=e.clientX-p.x,dy=e.clientY-p.y;
      p.x=e.clientX;p.y=e.clientY;
      if(Math.hypot(p.x-p.x0,p.y-p.y0)>5)p.moved=true;
      if(!p.moved)return;
      manual();const v=viewport();
      if(pointers.size>=2){
        const next=getPair();
        if(pair){moveCamera(motion.camera,next.x-pair.x,next.y-pair.y,v.width,v.height);zoomCamera(motion.camera,next.d/pair.d);}
        pair=next;
      }else if(panning||p.pan)moveCamera(motion.camera,dx,dy,v.width,v.height);
      else orbitCamera(motion.camera,dx,dy);
      wake();
    });
    function end(e){
      const p=pointers.get(e.pointerId);if(!p)return;
      pointers.delete(e.pointerId);pair=pointers.size>=2?getPair():null;
      if(e.type!=='pointerup'||p.moved||pointers.size){lastTap=null;return;}
      const now=performance.now(),x=e.clientX,y=e.clientY;
      if(lastTap&&now-lastTap.time<430&&Math.hypot(x-lastTap.x,y-lastTap.y)<26){
        const v=viewport(),seat=seatAt(roomBytes,motion.camera,v.width,v.height,x-v.left,y-v.top);
        if(seat&&!available(seat)){status.textContent='Cette place est occupée.';}
        else if(seat){if(motion.seat===seat&&motion.sit>0)motion.stand();else motion.goToSeat(seat);wake();}lastTap=null;
      }else lastTap={time:now,x,y};
    }
    for(const ev of ['pointerup','pointercancel','lostpointercapture'])listen(target,ev,end);
    listen(target,'wheel',e=>{e.preventDefault();manual();const delta=e.deltaY*(e.deltaMode===1?16:1);zoomCamera(motion.camera,Math.exp(-Math.max(-300,Math.min(300,delta))*.0016));wake();},{passive:false});
  }
  function stickMove(e){
    if(e.pointerId!==stickID)return;
    const r=stick.getBoundingClientRect(),radius=r.width*.33;
    const dx=(e.clientX-r.left-r.width/2)/radius,dy=(e.clientY-r.top-r.height/2)/radius;
    const scale=1/Math.max(1,Math.hypot(dx,dy));
    thumb.style.transform='translate('+dx*scale*radius+'px,'+dy*scale*radius+'px)';
    motion.stick(dx*scale,dy*scale);wake();
  }
  listen(stick,'pointerdown',e=>{if(stickID!==null)return;stickID=e.pointerId;stick.setPointerCapture(stickID);stickMove(e);});
  listen(stick,'pointermove',stickMove);
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])listen(stick,ev,e=>{if(e.pointerId===stickID){resetStick();wake();}});
  for(const event of ['keydown','keyup'])listen(stage,event,e=>{
    if(e.target.closest('input,select,textarea,.studio-drawer')||!movementKeys.has(e.code))return;
    e.preventDefault();motion.key(e.code,event==='keydown');wake();
  });
  listen(stage,'focusout',e=>{if(!stage.contains(e.relatedTarget))motion.releaseInputs();});
  listen(window,'blur',clearInputs);
  listen(document,'visibilitychange',()=>{if(document.hidden)clearInputs();});
  function setFullscreen(value){
    if(immersive===value)return;
    immersive=value;stage.classList.toggle('immersive',value);
    if(value){previousOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';}
    else{document.documentElement.style.overflow=previousOverflow;try{screen.orientation?.unlock?.();}catch{}}
    const label=value?'Quitter le plein écran':'Plein écran';
    full.title=label;full.setAttribute('aria-label',label);full.setAttribute('aria-pressed',String(value));
    full.querySelector('span').textContent=value?'Quitter':'Plein écran';wake();
  }
  const nativeFull=()=>document.fullscreenElement||document.webkitFullscreenElement;
  async function exitFull(){
    if(nativeFull())try{await (document.exitFullscreen||document.webkitExitFullscreen)?.call(document);}catch{}
    setFullscreen(false);
  }
  async function toggleFull(){
    if(immersive){await exitFull();return;}
    setFullscreen(true);
    try{await (stage.requestFullscreen||stage.webkitRequestFullscreen)?.call(stage);}catch{/* The viewport-sized stage stays available. */}
    if(!active||!immersive)return;
    try{await screen.orientation?.lock?.('landscape');}catch{/* Device rotation remains available. */}
  }
  for(const ev of ['fullscreenchange','webkitfullscreenchange'])listen(document,ev,()=>setFullscreen(Boolean(nativeFull())));
  listen(document,'keydown',e=>{if(e.key==='Escape'&&immersive){e.preventDefault();void exitFull();}});
  for(const b of root.querySelectorAll('[data-action]'))listen(b,'click',()=>{
    if(['center','in','out'].includes(b.dataset.action))manual();
    switch(b.dataset.action){
      case 'pan':panning=!panning;pan.setAttribute('aria-pressed',String(panning));break;
      case 'center':motion.centerCamera();break;
      case 'in':zoomCamera(motion.camera,1.24);break;
      case 'out':zoomCamera(motion.camera,1/1.24);break;
      case 'full':void toggleFull();break;
    }wake();
  });
  hud.hidden=false;help.hidden=false;status.textContent='';showStatus(motion.mode,motion.seat);
  return {showStatus,dispose(){active=false;lifetime.abort();clearInputs();if(immersive)void exitFull();hud.hidden=true;help.hidden=true;}};
}
