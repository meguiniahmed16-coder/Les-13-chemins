import {DOJO_LOOKS,dojoWardrobeState} from './intro-dojo-wardrobe.js';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=(a,b,n)=>{const t=clamp((n-a)/(b-a),0,1);return t*t*(3-2*t);};
const modes=Object.freeze({
 'dojo-camera':'camera','dojo-deplacement':'walk',
 'dojo-personnaliser':'characters','dojo-apparence':'body',
 'dojo-vetements':'wardrobe','dojo-enregistrer':'save'
});
const titles=Object.freeze({camera:'Caméra',walk:'Marcher',characters:'Personnaliser',body:'Mon personnage',wardrobe:'Garde-robe',save:'Personnaliser'});

// One clock drives the filmed action and its small interface demonstration.
// There are no timers or CSS animations that could continue during a report.
export function dojoDemoFrame(line,elapsed,{wardrobe}={}){
 const mode=line?.scene==='dojo'?modes[line.id]:null;
 if(!mode)return {visible:false,mode:null,opacity:0};
 const duration=Math.max(1500,Number(line.ms)||8000),at=clamp(Number(elapsed)||0,0,duration);
 const selected=wardrobe||dojoWardrobeState(line,at);
 const opacity=smooth(350,750,at)*(1-smooth(duration-800,duration-250,at));
 const unavailable=(mode==='wardrobe'||mode==='body')&&selected?.ready===false;
 const actor=selected?.actor==='m'?'m':'f';
 const bodyIndex=Number(selected?.bodyIndex)||0,lookIndex=clamp(Number(selected?.lookIndex)||0,0,DOJO_LOOKS.length-1);
 const look=DOJO_LOOKS[lookIndex];
 const drag=smooth(1000,1900,at)*(1-smooth(duration-2300,duration-1200,at));
 const stride=Math.sin(clamp((at-1100)/(duration-2500),0,1)*Math.PI*2);
 return {
  visible:!unavailable&&opacity>.001,mode,opacity:unavailable?0:opacity,
  title:mode==='wardrobe'&&look.kind==='underwear'?'Sous-vêtements':titles[mode],actor,bodyIndex,lookIndex,
  context:mode==='wardrobe'?'Ahmed · Marianne':mode==='body'?'Marianne':mode==='camera'?'Glisser':mode==='walk'?'Joystick':'',
  dragX:mode==='camera'?13*drag:mode==='walk'?6*drag:0,
  dragY:mode==='camera'?-3*drag:mode==='walk'?(-12+2*stride)*drag:0,
  pointer:mode==='characters'?actor==='m'?0:1:mode==='body'?bodyIndex===3?1:0:mode==='wardrobe'?lookIndex:0,
  pressed:mode==='save'&&at>=2200&&at<duration-1200,
  label:mode==='body'?bodyIndex===3?'Athlétique':'Équilibré':mode==='wardrobe'?look.label:'',
  description:mode==='wardrobe'?look.description||'Ahmed et Marianne en blanc.':'',
 };
}

// Reserve the complete panel throughout a reply, including its fade-in. This
// makes it a stable obstacle for the bubble and camera composition planners.
export function dojoDemoReservedRect(width,height,line){
 if(line?.scene!=='dojo'||!modes[line.id])return null;
 const w=Math.max(1,Number(width)||1),h=Math.max(1,Number(height)||1),small=h<350;
 const pad=Math.min(14,w*.04,h*.06),maximum=small?236:270;
 const panelWidth=Math.min(maximum,Math.max(0,w-(w<560?110:pad*2)));
 const panelHeight=Math.min(small?70:86,Math.max(0,h-pad*2));
 return {l:Math.max(pad,w-pad-panelWidth),t:Math.max(pad,h-pad-panelHeight),r:w-pad,b:h-pad};
}

const cameraIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.2"/></svg>';
const personIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="2.5"/><path d="M6 21v-6l1-5 5-2 5 2 1 5v6M9 11v6l-1 4m7-10v6l1 4M9 14h6"/></svg>';
const shirtIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4c-1 3-7 3-8 0Z"/></svg>';
const underwearIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16l1 14h-7l-2-6-2 6H3zM4 8h16"/></svg>';
const tickIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';

export function mountDojoDemo(stage,{document:doc=stage.ownerDocument}={}){
 const panel=doc.createElement('div');panel.id='dojo-demo';panel.className='dojo-demo';panel.hidden=true;
 panel.setAttribute('role','img');panel.setAttribute('aria-label','Démonstration des commandes du salon');
 panel.innerHTML=`<div class="dojo-demo-heading"><span class="dojo-demo-heading-icon">${cameraIcon}</span><strong class="dojo-demo-title"></strong><span class="dojo-demo-context"></span></div>
 <div class="dojo-demo-control dojo-demo-motion"><span class="dojo-demo-pad"><i class="dojo-demo-axis axis-x"></i><i class="dojo-demo-axis axis-y"></i><span class="dojo-demo-thumb">${cameraIcon}</span><span class="dojo-demo-touch"></span></span><span class="dojo-demo-motion-copy"><b></b><span class="dojo-demo-drag"><i></i></span></span></div>
 <div class="dojo-demo-control dojo-demo-characters"><span class="dojo-demo-choice" data-character="m">${personIcon}<span>Ahmed</span></span><span class="dojo-demo-choice" data-character="f">${personIcon}<span>Marianne</span></span></div>
 <div class="dojo-demo-control dojo-demo-body"><span class="dojo-demo-field">Silhouette</span><span class="dojo-demo-body-options"><span class="dojo-demo-choice" data-body="0">Équilibré</span><span class="dojo-demo-choice" data-body="3">Athlétique</span></span></div>
 <div class="dojo-demo-control dojo-demo-wardrobe">${DOJO_LOOKS.map((look,i)=>`<span class="dojo-demo-look dojo-demo-choice" data-look="${i}" style="--look-color:${look.color}">${look.kind==='underwear'?underwearIcon:shirtIcon}<span>${look.label}</span></span>`).join('')}</div>
 <div class="dojo-demo-control dojo-demo-save"><span class="dojo-demo-save-label">Enregistrer</span><span class="dojo-demo-confirm">${tickIcon}</span><span class="dojo-demo-save-touch"></span></div>`;
 stage.append(panel);
 const title=panel.querySelector('.dojo-demo-title'),context=panel.querySelector('.dojo-demo-context');
 const icon=panel.querySelector('.dojo-demo-heading-icon'),thumb=panel.querySelector('.dojo-demo-thumb');
 const pad=panel.querySelector('.dojo-demo-pad'),copy=panel.querySelector('.dojo-demo-motion-copy b');
 const dragDot=panel.querySelector('.dojo-demo-drag i');
 const characters=Array.from(panel.querySelectorAll('[data-character]'));
 const bodies=Array.from(panel.querySelectorAll('[data-body]'));
 const looks=Array.from(panel.querySelectorAll('[data-look]'));
 let lastMode='',lastLabel='',current=null,lastSize='';
 const write=(style,key,value)=>{
  if(key.startsWith('--')){if(style.getPropertyValue(key)!==value)style.setProperty(key,value);}
  else if(style[key]!==value)style[key]=value;
 };
 const text=(node,value)=>{if(node.textContent!==value)node.textContent=value;};
 const select=(nodes,attribute,value)=>{for(const node of nodes)node.classList.toggle('selected',node.getAttribute(attribute)===String(value));};
 function hide(){panel.hidden=true;current=null;}
 function update(line,elapsed,options={}){
  const frame=dojoDemoFrame(line,elapsed,options);current=frame;
  if(!frame.visible){panel.hidden=true;return frame;}
  panel.hidden=false;
  const width=stage.clientWidth,height=stage.clientHeight,size=width+'x'+height;
  if(lastSize!==size){
   const rect=dojoDemoReservedRect(width,height,line);lastSize=size;
   write(panel.style,'left',rect.l+'px');write(panel.style,'top',rect.t+'px');
   write(panel.style,'width',(rect.r-rect.l)+'px');write(panel.style,'height',(rect.b-rect.t)+'px');
   panel.classList.toggle('compact',height<350);
  }
  if(lastMode!==frame.mode){
   lastMode=frame.mode;panel.dataset.mode=frame.mode;
   icon.innerHTML=frame.mode==='camera'?cameraIcon:frame.mode==='wardrobe'?shirtIcon:personIcon;
   thumb.innerHTML=frame.mode==='camera'?cameraIcon:'<span class="dojo-demo-walk-dot"></span>';
   text(copy,frame.mode==='camera'?'Tourner autour':'Quelques pas');
  }
  text(title,frame.title);text(context,frame.context);
  write(panel.style,'opacity',frame.opacity.toFixed(3));
  write(thumb.style,'transform',`translate(${frame.dragX.toFixed(2)}px,${frame.dragY.toFixed(2)}px)`);
  write(pad.style,'--demo-drag',frame.mode==='camera'?frame.dragX.toFixed(2)+'px':frame.dragY.toFixed(2)+'px');
  write(dragDot.style,'transform',`translateX(${((frame.dragX||-frame.dragY)*2).toFixed(2)}px)`);
  select(characters,'data-character',frame.actor);select(bodies,'data-body',frame.bodyIndex===3?3:0);select(looks,'data-look',frame.lookIndex);
  panel.classList.toggle('pressed',frame.pressed);
  const label='Démonstration : '+frame.title+(frame.context?', '+frame.context:'')+(frame.label?', '+frame.label:'')+(frame.description?'. '+frame.description:'');
  if(label!==lastLabel){lastLabel=label;panel.setAttribute('aria-label',label);}
  return frame;
 }
 function reservedRects(){
  if(panel.hidden||!current?.visible)return[];
  const r=panel.getBoundingClientRect(),s=stage.getBoundingClientRect();
  return[{l:r.left-s.left,t:r.top-s.top,r:r.right-s.left,b:r.bottom-s.top}];
 }
 return {update,hide,reservedRects,element:panel};
}
