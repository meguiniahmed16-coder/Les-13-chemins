import * as T from 'three';
const views={'Face':[0,.02],'Trois quarts':[.64,.02],'Profil':[Math.PI/2,.02],'Chignon':[Math.PI,.17],'Vue du dessin':[1.12,-.23],'Sommet':[.04,1.39]};
const clamp=T.MathUtils.clamp;
export function createFacePanel(target,camera){
  const toggle=document.querySelector('#portraitToggle'),panel=document.querySelector('#portraitPanel'),stage=document.querySelector('#portraitOrbit'),angle=panel.querySelector('[data-angle]');
  for(const name of Object.keys(views))angle.add(new Option(name,name));
  let active=null,az=0,el=.02,range=.43;
  function close(){document.body.classList.remove('portrait-open');active=null;panel.hidden=stage.hidden=true;toggle.setAttribute('aria-expanded','false');}
  toggle.onclick=()=>{if(active){close();return;}active=target();if(!active)return;
    document.body.classList.add('portrait-open');panel.hidden=stage.hidden=false;toggle.setAttribute('aria-expanded','true');angle.value='Face';[az,el]=views.Face;range=.43;};
  panel.querySelector('[data-close]').onclick=()=>{close();toggle.focus();};
  angle.onchange=()=>{[az,el]=views[angle.value];};
  const zoom=ratio=>range=clamp(range*ratio,.22,.85);
  panel.querySelector('[data-in]').onclick=()=>zoom(.85);panel.querySelector('[data-out]').onclick=()=>zoom(1.18);
  const points=new Map();let distance=0;
  stage.onpointerdown=e=>{stage.setPointerCapture(e.pointerId);points.set(e.pointerId,[e.clientX,e.clientY]);distance=0;};
  stage.onpointermove=e=>{const last=points.get(e.pointerId);if(!last)return;points.set(e.pointerId,[e.clientX,e.clientY]);
    if(points.size===1){az-=(e.clientX-last[0])*.009;el=clamp(el+(e.clientY-last[1])*.008,-1.32,1.5);}
    if(points.size===2){const [a,b]=points.values(),d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(distance&&d)zoom(distance/d);distance=d;}};
  stage.onlostpointercapture=e=>{points.delete(e.pointerId);distance=0;};
  stage.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(e.deltaY*.001));},{passive:false});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close();});
  const focus=new T.Vector3(),dir=new T.Vector3(),q=new T.Quaternion();
  return {tick(){const ref=target();toggle.hidden=!ref;if(active&&active!==ref)close();if(!active)return;
    active.group.updateWorldMatrix(true,false);focus.set(0,.136,.013).applyMatrix4(active.group.matrixWorld);active.group.getWorldQuaternion(q);
    dir.set(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el)).applyQuaternion(q);
    camera.position.copy(focus).addScaledVector(dir,range*Math.max(1,.76/camera.aspect));camera.up.set(0,1,0);camera.lookAt(focus);
  },close};
}
