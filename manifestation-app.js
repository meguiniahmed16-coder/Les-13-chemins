/* CAMARADES ! — scène 3D, personnages originaux et foule animée.
 * Le plateau du Chemin III est seul autorisé à attribuer les points.
 * Aucun mesh externe, aucun logo, aucun échantillon audio propriétaire.
 */
import * as T from 'three';
import {newRun,advance,yellow,clamp,distance,OBJECTIFS} from './manifestation-core.js';
const $=id=>document.getElementById(id);
const canvas=$('world'),score=$('score'),hint=$('hint'),title=$('goal'),label=$('phase');
const steps=[1,2,3].map(n=>$('step'+n)),overlay=$('overlay'),speech=$('speech');
const meter=$('meter'),meterValue=$('meterValue');
const embedded=new URLSearchParams(location.search).get('embedded')==='1';
let sessionId='standalone',serverSteps=[],run=newRun(),playing=false,paused=false,gameReady=false;
let previous=0,stageInWorld=0,sceneGroup=null,hero=null,crowdActors=[],stageFlags=[],staticFar=[],redHeld=false,soundOn=false,voices=null,cheerUntil=0;
let joy={x:0,y:0},keys=new Set(),pointerId=null,actionTransition=0,showSpeechUntil=0;
const rnd=(n)=>{let x=Math.sin(n*289.117+21.7)*43931.883;return x-Math.floor(x);};
const mat=(c,metal=0)=>new T.MeshStandardMaterial({color:c,roughness:.86,metalness:metal});
const colors={
 stone:[0xd8d1bb,0xc5c1b0,0xbfb7a1,0xe0d6bd,0xddd8c8],
 coat:[0x476e65,0xb45f4a,0x364c68,0x90774f,0x5b4d64,0x3b5952,0x9f8c6d,0x635b4d,0x9e665c],
 skin:[0xd9a176,0x966044,0xe4bf95,0x6b4738,0xc78a65,0xa97a58,0xf1c8a4],
 hair:[0x382b27,0x67402c,0x9b6a3d,0x26272b,0x513b34]
};
const world=new T.Scene();world.background=new T.Color(0xc3d3d5);world.fog=new T.FogExp2(0xc3d3d5,.010);
const camera=new T.PerspectiveCamera(62,16/9,.08,190);
let renderer;
try{
 renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.setPixelRatio(Math.min(1.4,devicePixelRatio||1));
 renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.19;
 gameReady=true;
}catch(error){
 $('overlayTitle').textContent='La 3D ne démarre pas';
 $('overlayText').textContent='Le navigateur ne parvient pas à activer WebGL. Ouvre le jeu directement dans Chrome ou réessaie après avoir fermé les autres jeux.';
 $('start').hidden=true;
}
const ambient=new T.HemisphereLight(0xe8f3ff,0x82735e,2.7);world.add(ambient);
const sun=new T.DirectionalLight(0xfff0cf,2.3);sun.position.set(-13,34,21);world.add(sun);
const gBox=new T.BoxGeometry(1,1,1),gSphere=new T.SphereGeometry(1,10,8);
const gCyl=new T.CylinderGeometry(1,1,1,9),gCone=new T.ConeGeometry(1,1,8);
function mesh(geo,m,x=0,y=0,z=0,sx=1,sy=1,sz=1){const ob=new T.Mesh(geo,m);ob.position.set(x,y,z);ob.scale.set(sx,sy,sz);return ob;}
function addBox(group,x,y,z,sx,sy,sz,color){
 const b=mesh(gBox,mat(color),x,y,z,sx,sy,sz);group.add(b);return b;
}
function roundedText(text,width=3,background='#f0e2c2',color='#344c40'){
 // DOM overlay only; no web fonts or text textures need to download.
 const c=document.createElement('canvas');c.width=512;c.height=128;
 const cx=c.getContext('2d');cx.fillStyle=background;cx.fillRect(0,0,512,128);
 cx.fillStyle=color;cx.font='bold 45px Georgia';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(text,256,68,488);
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
 const obj=new T.Mesh(new T.PlaneGeometry(width,width/4),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));
 return obj;
}
function flag(parent,style,x,y,z,height=3.1){
 const root=new T.Group();root.position.set(x,y,z);parent.add(root);
 const pole=mesh(gCyl,mat(0x5a4e3b,.1),0,height/2,0,.027,height,.027);root.add(pole);
 const cs=style==='france'?[0x1c376a,0xe8ece2,0xbb342e]:[0xc2363e,0xc2363e,0xc2363e];
 const fabric=[];
 for(let n=0;n<3;n++){
  const gm=new T.PlaneGeometry(.46,.78,7,3);
  const cloth=mesh(gm,new T.MeshStandardMaterial({color:cs[n],side:T.DoubleSide,roughness:.94}),
   .23+n*.46,height-.55,0);
  root.add(cloth);fabric.push({gm,base:gm.attributes.position.array.slice(),phase:n*.4});
 }
 stageFlags.push({fabric,root});return root;
}
function person(id,opts={}){
 const actor=new T.Group();
 const group=new T.Group();actor.add(group);
 const skin=mat(colors.skin[(id*7)%colors.skin.length]),
       coat=mat(colors.coat[(id*5)%colors.coat.length]),
       jeans=mat(id%2?0x42484c:0x525b65),hair=mat(colors.hair[(id*3)%colors.hair.length]);
 const height=.93+rnd(id)*.25;
 const chest=mesh(gBox,coat,0,1.09,0,.37,.49,.24);group.add(chest);
 const pelvis=mesh(gBox,jeans,0,.73,0,.30,.16,.22);group.add(pelvis);
 const collar=mesh(gCyl,skin,0,1.41,0,.085,.12,.085);group.add(collar);
 const head=mesh(gSphere,skin,0,1.65,0,.18,.215,.17);group.add(head);
 const hairTop=mesh(gSphere,hair,0,1.79,-.02,.19,.10,.172);group.add(hairTop);
 const eyes=mat(0x3b3029),smile=mat(0x684a38);
 for(const sign of [-1,1])group.add(mesh(gSphere,eyes,sign*.07,1.664,.160,.016,.014,.013));
 // A small smile remains visible on close-ups; deliberately neutral at distance.
 const mouth=mesh(gBox,smile,0,1.59,.169,.065,.012,.008);group.add(mouth);
 const legs=[],arms=[];
 for(const sign of [-1,1]){
  const leg=new T.Group();leg.position.set(sign*.155,.69,0);
  leg.add(mesh(gBox,jeans,0,-.33,0,.137,.35,.14));
  leg.add(mesh(gBox,mat(0x48423a),0,-.655,.065,.145,.078,.20));
  group.add(leg);legs.push(leg);
  const arm=new T.Group();arm.position.set(sign*.41,1.32,0);
  arm.add(mesh(gBox,coat,0,-.24,0,.118,.28,.122));
  arm.add(mesh(gSphere,skin,0,-.50,0,.07,.09,.07));
  group.add(arm);arms.push(arm);
 }
 if(id%7===0){const cap=mesh(gCyl,mat(0x4d584d),0,1.81,0,.202,.06,.202);group.add(cap);
  group.add(mesh(gBox,mat(0x4d584d),0,1.80,.14,.16,.022,.21));}
 if(id%9===0){group.add(mesh(gBox,mat(0xc1a074),0,1.39,.18,.34,.083,.14));}
 if(opts.hero){
  group.traverse(o=>{if(o.isMesh&&o.material===coat)o.material=mat(0x415d55)});
  // Casquette de Poulbot, expressive, recognisable without an external portrait.
  group.add(mesh(gSphere,mat(0x343b3e),0,1.83,-.012,.23,.105,.205));
  group.add(mesh(gBox,mat(0x343b3e),0,1.81,.20,.23,.025,.19));
 }
 group.scale.setScalar(height);actor.userData={id,legs,arms,height,hero:!!opts.hero,origin:opts.origin||{x:0,z:0},offset:rnd(id+7)*6.28};
 return actor;
}
function walking(actor,time,strength){
 const a=actor.userData,phase=time*5.4+a.offset;
 const energy=.4+strength*.6;
 a.legs[0].rotation.x=Math.sin(phase)*.34*energy;
 a.legs[1].rotation.x=-Math.sin(phase)*.34*energy;
 a.arms[0].rotation.x=-Math.sin(phase)*.23*energy;
 a.arms[1].rotation.x=Math.sin(phase)*.23*energy;
}
function buildings(root,start,end){
 const length=end-start;const green=mat(0x56735e),asphalt=mat(0x545d5e);
 addBox(root,0,-.24,(start+end)/2,17,.35,length+8,0x6b6862);
 addBox(root,0,-.056,(start+end)/2,10,.01,length+8,0x70716b);
 for(const side of [-1,1]){
  addBox(root,side*11,-.06,(start+end)/2,4,.30,length+8,0xa8a398);
  for(let z=start;z<end;z+=12){
   const idx=Math.floor(z*2+side*9)+10,shade=colors.stone[Math.abs(idx)%colors.stone.length];
   const h=11+rnd(idx)*6;
   addBox(root,side*14.2,h/2-.05,z+4,5,h,10,shade);
   // Limestone mansard roof, cornice and architectural windows
   addBox(root,side*14.2,h+.30,z+4,5.2,.5,10.2,0x6b747a);
   addBox(root,side*14.2,h-1,z+4,5.1,.18,10.2,0xd6c9ad);
   for(let floor=2;floor<=h-2;floor+=3.1){
    for(let slot=-1;slot<=1;slot++){
     const xf=side*11.62;
     const w=addBox(root,xf,floor,z+4+slot*2.7,.09,1.60,.94,0x343d41);
     addBox(root,xf-side*.09,floor,z+4+slot*2.7,.06,1.5,.067,0xe1d6bf);
     addBox(root,xf-side*.1,floor-.02,z+4+slot*2.7,.06,.055,.95,0xe5daca);
    }
   }
  }
 }
 for(let z=start+4;z<end;z+=8){
  addBox(root,-3.1,.0,z,.11,.025,2.0,0xe3dfc6);
  addBox(root, 3.1,.0,z,.11,.025,2.0,0xe3dfc6);
 }
 // Lamps and plane trees repeat at a reasonable cadence.
 for(let z=start+7;z<end;z+=24){
  for(const side of [-1,1]){
   addBox(root,side*8.2,2.9,z,.11,5.8,.11,0x434c49);
   addBox(root,side*7.86,5.7,z,.73,.15,.35,0xd9d3ae);
   if(z%2<1){addBox(root,side*9.5,1.85,z+5,.28,3.7,.28,0x735944);
    root.add(mesh(gSphere,green,side*9.5,4.7,z+5,1.5,2.1,1.5));}
  }
 }
}
function statue(root){
 // Interpretive 3D monument, clearly marked as a recreation, not a scan.
 addBox(root,0,.3,5,6,1.0,6,0xa5a39a);
 addBox(root,0,1.05,5,4.5,.55,4.5,0xbdb6a3);
 addBox(root,0,2.05,5,3.1,1.55,3.1,0xe1d4b7);
 addBox(root,0,3.15,5,3.8,.20,3.8,0xb5aa94);
 const bronze=mat(0x527e71,.45);
 root.add(mesh(gCyl,bronze,0,4.56,5,.60,1.35,.60));
 root.add(mesh(gCone,bronze,0,6.3,5,.65,1.6,.65));
 root.add(mesh(gSphere,bronze,0,7.16,5,.38,.42,.33));
 root.add(mesh(gCone,bronze,0,7.58,5,.56,.28,.56));
 // Raised forearm and laurel on the Republic figure.
 const arm=mesh(gCyl,bronze,.56,6.66,5,.12,.95,.12);arm.rotation.z=-.45;root.add(arm);
 root.add(mesh(gSphere,mat(0xc9af67,.5),.79,7.65,5,.20,.26,.18));
 const plaque=roundedText('RÉPUBLIQUE',4.2);plaque.position.set(0,1.83,6.64);root.add(plaque);
 for(const x of [-2.4,2.4])for(const z of [2.6,7.4])root.add(mesh(gCyl,mat(0x8b8b82),x,.75,z,.18,.8,.18));
}
function makeCrowd(root,count,baseZ,{reveal=false,spread=7}={}){
 const arr=[];
 for(let i=0;i<count;i++){
  const guy=person(i+17+(reveal?221:0));
  const x=(rnd(i*17+5)-.5)*spread*2;
  const z=baseZ+(rnd(i*13+9)-.5)*13;
  guy.position.set(x,0,z);guy.rotation.y=rnd(i+100)*.3-.15;
  root.add(guy);arr.push({guy,x,z,seed:i});
 }
 return arr;
}
function distantCrowd(root,baseZ,count){
 // Four draw calls rather than hundreds of detailed models.
 const body=new T.InstancedMesh(gBox,mat(0x5f645a),count);
 const head=new T.InstancedMesh(gSphere,mat(0xcaa17b),count);
 const legs=new T.InstancedMesh(gBox,mat(0x495453),count);
 const hat=new T.InstancedMesh(gBox,mat(0x484944),count);
 const dummy=new T.Object3D(),col=new T.Color();
 for(let i=0;i<count;i++){
  const x=(rnd(i*31+5)-.5)*14,z=baseZ+(rnd(i*61+1)-.5)*21;
  dummy.position.set(x,.95,z);dummy.scale.set(.42,.77,.28);dummy.updateMatrix();body.setMatrixAt(i,dummy.matrix);
  col.setHex(colors.coat[i%colors.coat.length]);body.setColorAt(i,col);
  dummy.position.set(x,1.66,z);dummy.scale.set(.19,.22,.18);dummy.updateMatrix();head.setMatrixAt(i,dummy.matrix);
  head.setColorAt(i,new T.Color(colors.skin[(i*7)%colors.skin.length]));
  dummy.position.set(x,.4,z);dummy.scale.set(.33,.80,.24);dummy.updateMatrix();legs.setMatrixAt(i,dummy.matrix);
  dummy.position.set(x,1.83,z);dummy.scale.set(.25,.09,.22);dummy.updateMatrix();hat.setMatrixAt(i,dummy.matrix);
 }
 root.add(body,head,legs,hat);staticFar.push(body,head,legs,hat);
}
function sceneFor(phase){
 if(sceneGroup)world.remove(sceneGroup);
 sceneGroup=new T.Group();world.add(sceneGroup);
 stageFlags=[];crowdActors=[];staticFar=[];
 const root=sceneGroup;
 const sky=phase===1?0xb8c7d3:phase===2?0xb8cdd5:0xc3d4d9;
 world.background.setHex(sky);world.fog.color.setHex(sky);
 if(phase===1){
  buildings(root,-20,43);
  addBox(root,11.63,3.8,11, .1,7,6,0xd5c5a7);
  const panel=roundedText('ÉCOLE',2.6);panel.position.set(11.54,4.7,11);panel.rotation.y=-Math.PI/2;root.add(panel);
  flag(root,'france',4.1,2.05,12,3.7);
  const red=person(73);red.position.set(-2,0,6);red.rotation.y=.2;root.add(red);
  flag(red,'red',.25,1.26,0,2.0);
  crowdActors=[{guy:red,x:-2,z:6,seed:27}];
  addBox(root,4.1,.28,12,2.2,.56,2.3,0xc9bea6);
 }else if(phase===2){
  buildings(root,-23,46);statue(root);
  crowdActors=makeCrowd(root,53,5,{spread:8});
  distantCrowd(root,20,190);
  for(let i=0;i<12;i++)flag(root,i%5===0?'france':'red',(rnd(i+11)-.5)*14,0,3+(rnd(i+73)-.5)*17,3.3);
 }else{
  buildings(root,-7,135);
  crowdActors=makeCrowd(root,62,-8,{spread:6});
  distantCrowd(root,113,230);
  for(let i=0;i<14;i++)flag(root,i%5===0?'france':'red',(rnd(i+25)-.5)*12,0,98+(rnd(i+66)-.5)*18,3.2);
  // Distinct two corteges with a clear meeting zone on the boulevard.
  const banner=roundedText('BASTILLE',5.0);banner.position.set(0,5.2,108);root.add(banner);
 }
 hero=person(2,{hero:true});root.add(hero);
 if(phase>1)flag(hero,'france',.40,1.05,0,2.6);
 stageInWorld=phase;
}
function messageFeedback(text,duration=2){speech.textContent=text;speech.hidden=false;showSpeechUntil=performance.now()/1000+duration;}
function refreshHUD(){
 const p=run.phase,n=run.steps.length;
 title.textContent=run.finished?'3 / 3 · Réunion des cortèges':String(p)+' / 3 · '+OBJECTIFS[Math.min(2,p-1)];
 label.textContent=p===1?'Paris · 2002 · Cherche le drapeau':p===2?'Place de la République':'Boulevard vers Bastille';
 steps.forEach((s,i)=>{s.classList.toggle('done',i<n);s.textContent=i<n?'✓':String(i+1);});
 score.textContent=String(serverSteps.length*10);
 const pct=p===2?run.mobilisation:run.cohesion;
 meter.style.width=Math.round(pct)+'%';meterValue.textContent=Math.round(pct)+'%';
 $('meterLabel').textContent=p===2?'MOBILISATION':p===1?'PRÉPARATION':'COHÉSION DU CORTÈGE';
 if(p===1)hint.textContent='Joystick : avance vers le drapeau français devant l’école. Jaune pour grimper et le prendre.';
 else if(p===2)hint.textContent=run.climbed?'Maintiens le rouge : « Camarades ! » Rassemble la foule jusqu’à 100 %.':'Approche de la statue et appuie sur le jaune pour grimper.';
 else hint.textContent=run.cohesion<60?'La foule s’étire : arrête-toi et maintiens le rouge pour rassembler.':'Avance vers Bastille en gardant la foule avec toi. Rouge : appeler les retardataires.';
 if(run.finished)hint.textContent='Les deux cortèges se retrouvent à mi-chemin. « — Par là. »';
}
const send=(type,extra={})=>{if(embedded)parent.postMessage({type,id:sessionId,...extra},location.origin);};
function drain(){
 for(const e of run.events.splice(0)){
  if(e.type==='progress'){
   if(!serverSteps.includes(e.step)){
    if(!embedded){serverSteps.push(e.step);refreshHUD();}
    send('manifestation:progress',{step:e.step});
   }
   const words=['Drapeau français récupéré !','La foule se met en marche !','Deux cortèges réunis !'];
   messageFeedback(words[e.step-1],1.8);sound(600+80*e.step,.18);
  }
  if(e.type==='won'){
   playing=false;paused=false;refreshHUD();
   overlay.hidden=false;$('overlayTitle').textContent='Deux cortèges, une seule foule !';
   $('overlayText').textContent='Les manifestants se rencontrent à mi-chemin. « — On va où maintenant ? — Par là. »';
   $('start').hidden=true;$('replay').hidden=false;
   send('manifestation:won');
  }
 }
}
function card(titleText,bodyText){overlay.hidden=false;$('overlayTitle').textContent=titleText;$('overlayText').textContent=bodyText;}
function start(){
 if(!gameReady)return;
 $('start').textContent='Commencer le jeu';run=newRun();sceneFor(run.phase);playing=true;paused=false;actionTransition=0;
 overlay.hidden=true;refreshHUD();lastSound=0;
}
function pause(){
 if(!playing)return;paused=!paused;
 $('pause').textContent=paused?'Reprendre':'Pause';
 if(paused){card('Pause','La foule attend. Reprends quand tu veux.');$('start').textContent='Reprendre';}
 else overlay.hidden=true;
}
let audioCtx=null,lastSound=0;
function sound(freq,length){
 if(!soundOn)return;
 try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();
 audioCtx.resume?.();
 const t=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();
 o.type='triangle';o.frequency.value=freq;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.055,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+length);
 o.connect(g).connect(audioCtx.destination);o.start(t);o.stop(t+length+.02);}catch{}
}
function callCrowd(){
 if(!playing||paused)return;
 if(run.phase===2&&run.climbed){
  messageFeedback('— Camarades !',1.3);
  if(soundOn&&'speechSynthesis'in window&&performance.now()/1000-lastSound>5){
   try{const q=new SpeechSynthesisUtterance('Camarades !');q.lang='fr-FR';q.rate=1.05;q.volume=.8;speechSynthesis.speak(q);}catch{}
  }
  lastSound=performance.now()/1000;
 }else if(run.phase===3)messageFeedback('On reste ensemble !',1.0);
 sound(310,.08);
}
function yellowPress(){
 if(!playing||paused||actionTransition>0)return;
 const before=run.phase,climbed=run.climbed;
 const result=yellow(run);
 if(result){
  if(before===2&&!climbed&&run.climbed){
   messageFeedback('— Camarades !',2);sound(520,.2);
  }else actionTransition=.85;
  drain();refreshHUD();
 }else{
  if(run.phase===1)messageFeedback('Avance jusqu’au drapeau.',.9);
  if(run.phase===2&&!run.climbed)messageFeedback('Approche-toi de la statue.',.9);
 }
}
function changeDir(){
 // Independent horizontal and vertical axes.
 const right=Number(keys.has('arrowright')||keys.has('d'));
 const left=Number(keys.has('arrowleft')||keys.has('q')||keys.has('a'));
 const fwd=Number(keys.has('arrowup')||keys.has('z')||keys.has('w'));
 const back=Number(keys.has('arrowdown')||keys.has('s'));
 return {x:clamp(joy.x+right-left,-1,1),y:clamp(joy.y+fwd-back,-1,1),red:redHeld||keys.has('r')};
}
function bindControls(){
 const zone=$('stick'),knob=$('knob');
 function point(e){
  const r=zone.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/(r.width*.33),
   y=-(e.clientY-r.top-r.height/2)/(r.height*.33);
  const mag=Math.max(1,Math.hypot(x,y));
  joy={x:clamp(x/mag,-1,1),y:clamp(y/mag,-1,1)};
  knob.style.transform='translate('+(joy.x*zone.clientWidth*.25)+'px,'+(-joy.y*zone.clientHeight*.25)+'px)';
 }
 zone.addEventListener('pointerdown',e=>{e.preventDefault();pointerId=e.pointerId;zone.setPointerCapture(e.pointerId);point(e);});
 zone.addEventListener('pointermove',e=>{if(e.pointerId===pointerId)point(e);});
 function release(e){if(e&&pointerId!==e.pointerId)return;pointerId=null;joy={x:0,y:0};knob.style.transform='translate(0,0)';}
 zone.addEventListener('pointerup',release);zone.addEventListener('pointercancel',release);zone.addEventListener('lostpointercapture',()=>release());
 const y=$('yellow');y.addEventListener('pointerdown',e=>{e.preventDefault();y.classList.add('held');yellowPress()});
 y.addEventListener('pointerup',()=>y.classList.remove('held'));y.addEventListener('pointercancel',()=>y.classList.remove('held'));
 y.addEventListener('click',e=>{if(e.detail===0)yellowPress();});
 const red=$('red');
 const redDown=e=>{e.preventDefault();if(!redHeld){redHeld=true;red.classList.add('held');callCrowd();}};
 const redUp=()=>{redHeld=false;red.classList.remove('held');};
 red.addEventListener('pointerdown',redDown);
 red.addEventListener('pointerup',redUp);red.addEventListener('pointercancel',redUp);
 red.addEventListener('lostpointercapture',redUp);
 red.addEventListener('click',e=>{if(e.detail===0){redHeld=true;callCrowd();setTimeout(redUp,350);}});
 window.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();
  if(['arrowup','arrowdown','arrowleft','arrowright',' ','enter','r','w','a','s','d','z','q'].includes(key))e.preventDefault();
  const has=keys.has(key);keys.add(key);
  if(!has&&(key===' '||key==='enter'))yellowPress();
  if(!has&&key==='r')callCrowd();
 });
 window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
 window.addEventListener('blur',()=>{keys.clear();redHeld=false;red.classList.remove('held');release();});
 $('start').onclick=()=>{if(paused){paused=false;overlay.hidden=true;return;}start();};
 $('replay').onclick=start;
 $('quit').onclick=()=>send('manifestation:close');
 $('back').onclick=()=>send('manifestation:close');
 $('next').onclick=()=>send('manifestation:next');
 $('pause').onclick=pause;
 $('sound').onclick=()=>{soundOn=!soundOn;$('sound').textContent=soundOn?'Son ON':'Son OFF';$('sound').setAttribute('aria-pressed',String(soundOn));if(soundOn)sound(450,.13);};
 window.addEventListener('message',e=>{
  if(e.source!==parent||e.origin!==location.origin||!e.data)return;
  if(e.data.type==='manifestation:init'){sessionId=e.data.id||'standalone';serverSteps=Array.isArray(e.data.passed)?e.data.passed.filter(n=>n>=1&&n<=3):[];refreshHUD();}
  if(e.data.type==='manifestation:credited'&&e.data.id===sessionId){
   serverSteps=Array.isArray(e.data.passed)?e.data.passed:serverSteps;refreshHUD();
  }
 });
}
function animateActors(dt,t){
 if(hero){hero.position.set(run.x,0,run.z);
  const input=changeDir();const running=Math.abs(input.x)+Math.abs(input.y)>.2&&!paused;
  walking(hero,t,running?1:.03);
  if(running)hero.rotation.y=Math.atan2(input.x,input.y);
  if(run.phase===2&&run.climbed)hero.position.y=2.55;
 }
 if(run.phase===1){
  const red=crowdActors[0];if(red){red.guy.position.z=6+Math.sin(t*.4)*1.1;walking(red.guy,t,.25);}
 }else if(run.phase===2){
  for(const a of crowdActors){walking(a.guy,t,run.climbed?run.mobilisation/130:.13);
   const swell=run.climbed?run.mobilisation/100:0;
   a.guy.position.x=a.x*(1+swell*.08);a.guy.position.z=a.z+swell*(rnd(a.seed+37)-.5)*1.0;
   a.guy.rotation.y=.12*Math.sin(t*.6+a.seed);}
 }else{
  for(const a of crowdActors){
   const offset=(a.z+8)/2.6;
   const z=run.leaderZ-2+offset+Math.sin(t*.7+a.seed)*.18;
   const x=a.x*.60+(rnd(a.seed+92)-.5)*(100-run.cohesion)*.030;
   a.guy.position.set(x,0,z);walking(a.guy,t,.9);
   a.guy.rotation.y=Math.sin(t*.42+a.seed)*.12;
  }
 }
 for(const f of stageFlags)for(const piece of f.fabric){
  const pos=piece.gm.attributes.position;
  for(let i=0;i<pos.count;i++){
   const x=piece.base[i*3],y=piece.base[i*3+1];
   pos.setZ(i,Math.sin(t*2.7+x*5+piece.phase)*.12*(.65+x*.5));
   pos.setX(i,x);pos.setY(i,y);
  }
  pos.needsUpdate=true;piece.gm.computeVertexNormals();
 }
}
function render(ms){
 if(!renderer)return;
 const dt=Math.min(.05,(ms-previous)/1000||0);previous=ms;
 if(playing&&!paused){
  if(stageInWorld!==run.phase)sceneFor(run.phase);
  if(actionTransition>0)actionTransition-=dt;
  const phase=run.phase;advance(run,dt,changeDir());
  drain();
  if(phase!==run.phase){sceneFor(run.phase);messageFeedback(run.phase===2?'Place de la République':'Vers Bastille !',1.7);}
 }
 const t=ms/1000;
 if(showSpeechUntil<t)speech.hidden=true;
 animateActors(dt,t);
 if(hero){
  const desired=new T.Vector3(run.x,6.15,run.z-12.9);
  const look=new T.Vector3(run.x,run.phase===2?3.45:1.9,run.z+9.5);
  camera.position.lerp(desired,Math.min(1,dt*3.4));
  camera.lookAt(look);
 }
 const w=canvas.clientWidth,h=canvas.clientHeight;
 if(w>0&&h>0&&(!renderer.domElement.width||Math.abs(camera.aspect-w/h)>.02)){
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 }
 renderer.render(world,camera);
 if(playing)refreshHUD();
 requestAnimationFrame(render);
}
bindControls();
sceneFor(1);refreshHUD();
if(gameReady){requestAnimationFrame(render);send('manifestation:ready');}
