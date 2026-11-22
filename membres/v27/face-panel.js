import * as T from 'three';
const views={'Face':[0,.02],'Trois quarts':[.64,.02],'Profil':[Math.PI/2,.02],'Chignon':[Math.PI,.17],'Vue du dessin':[1.12,-.23],'Sommet':[.04,1.39]};
const clamp=T.MathUtils.clamp;
export function createFacePanel(target,camera,detail){
  const toggle=document.querySelector('#portraitToggle'),panel=document.querySelector('#portraitPanel'),stage=document.querySelector('#portraitOrbit'),angle=panel.querySelector('[data-angle]');
  for(const name of Object.keys(views))angle.add(new Option(name,name));
  let active=null,az=0,el=.02,range=.43;
  function close(){detail.reset();document.body.classList.remove('portrait-open');active=null;panel.hidden=stage.hidden=true;toggle.setAttribute('aria-expanded','false');}
  toggle.onclick=()=>{if(active){close();return;}active=target();if(!active)return;detail.reset();
    document.body.classList.add('portrait-open');panel.hidden=stage.hidden=false;toggle.setAttribute('aria-expanded','true');angle.value='Face';[az,el]=views.Face;range=.43;};
  panel.querySelector('[data-close]').onclick=()=>{close();toggle.focus();};
  angle.onchange=()=>{detail.reset();[az,el]=views[angle.value];};
  function midpoint(){const [a,b]=points.values();return [(a[0]+b[0])*.5,(a[1]+b[1])*.5,Math.hypot(a[0]-b[0],a[1]-b[1])];}
  function zoom(ratio){const r=stage.getBoundingClientRect(),x=r.left+r.width*.5,y=r.top+r.height*.5;detail.begin(x,y,[active.group]);detail.zoom(ratio,x,y);}
  panel.querySelector('[data-in]').onclick=()=>zoom(.76);panel.querySelector('[data-out]').onclick=()=>zoom(1/.76);
  const points=new Map();let distance=0;
  stage.onpointerdown=e=>{stage.setPointerCapture(e.pointerId);points.set(e.pointerId,[e.clientX,e.clientY]);if(points.size===2){const [x,y,d]=midpoint();distance=d;detail.begin(x,y,[active.group]);}};
  stage.onpointermove=e=>{const last=points.get(e.pointerId);if(!last)return;points.set(e.pointerId,[e.clientX,e.clientY]);
    const dx=e.clientX-last[0],dy=e.clientY-last[1];
    if(points.size===1){if(detail.active)detail.orbit(dx,dy);else{az-=dx*.009;el=clamp(el+dy*.008,-1.32,1.5);}}
    if(points.size===2){const [x,y,d]=midpoint();if(distance&&d)detail.zoom(distance/d,x,y);distance=d;}};
  stage.onlostpointercapture=e=>{points.delete(e.pointerId);distance=0;};
  stage.addEventListener('wheel',e=>{e.preventDefault();detail.begin(e.clientX,e.clientY,[active.group]);detail.zoom(Math.exp(clamp(e.deltaY,-900,900)*.0018),e.clientX,e.clientY);},{passive:false});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close();});
  const focus=new T.Vector3(),dir=new T.Vector3(),q=new T.Quaternion();
  return {tick(){const ref=target();toggle.hidden=!ref;if(active&&active!==ref)close();if(!active)return;
    active.group.updateWorldMatrix(true,false);focus.set(0,.136,.013).applyMatrix4(active.group.matrixWorld);active.group.getWorldQuaternion(q);
    dir.set(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el)).applyQuaternion(q);
    camera.position.copy(focus).addScaledVector(dir,range*Math.max(1,.76/camera.aspect));camera.up.set(0,1,0);camera.lookAt(focus);return true;
  },close};
}
