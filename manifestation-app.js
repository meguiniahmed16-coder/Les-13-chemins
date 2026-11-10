/* CAMARADES ! — Chemin III, page 59–60, personnages 3D CC0 Kenney.
 * Le plateau seul attribue les points et les sauvegarde, sans doublons.
 */
import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as cloneSkinned} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {newRun,advance,yellow,callFromStatue,selectTarget,selectNext,availableTargets,activeWave,gameInstruction,red,clamp,distance,OBJECTIFS,behindNarrator,CRS_WAVES,WEAPONS,FLAG,STATUE} from './manifestation-core.js';
const $=id=>document.getElementById(id);
const canvas=$('world'),score=$('score'),hint=$('hint'),title=$('goal'),label=$('phase');
const steps=[1,2,3].map(n=>$('step'+n)),overlay=$('overlay'),speech=$('speech');
const meter=$('meter'),meterValue=$('meterValue');
const embedded=new URLSearchParams(location.search).get('embedded')==='1';
let sessionId='standalone',serverSteps=[],run=newRun(),playing=false,paused=false,gameReady=false;
let previous=0,stageInWorld=0,sceneGroup=null,hero=null,crowdActors=[],stageFlags=[],staticFar=[],bastilleCrowd=null,bastilleActors=[],policeGroups=[],heartBursts=[],heartAscents=[],escortInstances=null,rallyProps=null,redHeld=false,soundOn=false,voices=null,cheerUntil=0;
const templates=[];
const MODEL_PATHS=['character-male-a.glb','character-female-a.glb','character-male-c.glb','character-female-c.glb','character-male-e.glb','character-female-e.glb'].map(name=>'assets/manifestation/'+name);
let crowdLoading=false;
let joy={x:0,y:0},keys=new Set(),pointerId=null,actionTransition=0,showSpeechUntil=0,lastHud=0;
let cameraOrbit=0,cameraOrbitLeft=0,cornerTurn=0,avenueExtended=false,bastilleReady=false;
let lastControlDisplay=0,renderFailureReported=false,lastInstructionKey=null;
let pickableMeshes=[],pickupActors=[],selectionMarker=null,allyEffects=[],targetRaycaster=new T.Raycaster(),weaponProp=null,adverseSymbols=null,extraFollowersActive=false;
let redGuide=null,guideStop=0;
const GUIDE_STOPS=[{x:-2.8,z:-3},{x:0,z:4.2},{x:3.1,z:10}];
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
 gameReady=false;
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

function clothCap(group,id,hero=false){
 const m=mat(hero?0x293a3d:0x455b4c);
 const top=mesh(gSphere,m,0,1.73,-.02,.205,.10,.194);group.add(top);
 const brim=mesh(gBox,m,0,1.72,.18,.19,.025,.17);group.add(brim);
}
function modelPerson(id,opts={}){
 const actor=new T.Group(),template=templates[id%templates.length];
 const clone=cloneSkinned(template.scene);
 clone.scale.setScalar((2.45+rnd(id)*.23)*(opts.hero?1.0:1.0));
 actor.add(clone);
 // Most demonstrators have visible hair. Hats appear only on selected people;
 // the narrator alone has the distinctive Poulbot-style cap.
 if(opts.hero||id%12===0)clothCap(actor,id,!!opts.hero);
 const mixer=new T.AnimationMixer(clone);
 const clips=template.animations;
 const actions={
  idle:mixer.clipAction(clips.find(a=>a.name==='idle')||clips[0]),
  walk:mixer.clipAction(clips.find(a=>a.name==='walk')||clips[0]),
  signal:mixer.clipAction(clips.find(a=>a.name==='interact-right')||clips.find(a=>a.name==='walk')||clips[0])
 };
 actions.idle.play();
 actor.userData={id,mixer,actions,current:'idle',previousTime:null,
  height:1,hero:!!opts.hero,origin:opts.origin||{x:0,z:0},offset:rnd(id+7)*6.28};
 return actor;
}
function person(id,opts={}){
 if(templates.length)return modelPerson(id,opts);
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
function walking(actor,time,strength,signal=false){
 const a=actor.userData;
 if(a.mixer){
  const dt=Math.max(0,Math.min(.05,a.previousTime===null?0:time-a.previousTime));
  a.previousTime=time;
  const desired=signal?'signal':strength>.38?'walk':'idle';
  if(a.current!==desired){
   const previous=a.actions[a.current],next=a.actions[desired];
   next.reset().play();next.crossFadeFrom(previous,.2,true);
   a.current=desired;
  }
  a.mixer.update(dt);
  return;
 }
 const phase=time*5.4+a.offset;
 const energy=.4+strength*.6;
 a.legs[0].rotation.x=Math.sin(phase)*.34*energy;
 a.legs[1].rotation.x=-Math.sin(phase)*.34*energy;
 a.arms[0].rotation.x=-Math.sin(phase)*.23*energy;
 a.arms[1].rotation.x=Math.sin(phase)*.23*energy;
}
function buildings(root,start,end,light=false){
 const len=end-start,mid=(start+end)/2;
 const canopy=mat(0x587359),slate=mat(0x4f5d64);
 // Chaussée, trottoirs surélevés et bordures en pierre (style rue parisienne).
 addBox(root,0,-.18,mid,17,.28,len+8,0x595d60);
 addBox(root,0,-.029,mid,16,.025,len+8,0x777773);
 for(const side of [-1,1]){
  addBox(root,side*10.35,-.02,mid,4.65,.22,len+8,0xd8cbb5);
  addBox(root,side*8.15,.11,mid,.25,.24,len+8,0xb0a596);
  // Quelques façades haussmanniennes crème, avec fenêtres et balcons en fer.
  for(let z=start;z<end;z+=light?20:14){
   const idx=Math.abs(Math.floor(z/9+side*11));
   const shade=[0xe1c49d,0xe0c5b9,0xb8cbd0,0xd4c09e,0xc4d4be,0xe5cfad,0xc9bac9][idx%7];
   const h=12+rnd(idx+3)*5.2;
   addBox(root,side*13.8,h/2,z+5,5.1,h,12,shade);
   addBox(root,side*13.8,h+.15,z+5,5.25,.55,12.4,0x69747b);
   addBox(root,side*13.8,h-1.05,z+5,5.22,.17,12.2,0xf3e9d4);
   const xf=side*11.18;
   // Porte cochère et vitrine en rez-de-chaussée.
   addBox(root,xf,1.38,z+4,.12,2.65,1.55,0x434f50);
   addBox(root,xf-side*.12,2.88,z+4,.35,.14,2.0,0xb38b57);
   for(let floor=light?4:3;floor<h-1;floor+=light?4.4:3.15){
    for(const slot of (light?[-1,1]:[-1,0,1])){
     const vz=z+5+slot*3.15;
     addBox(root,xf,floor,vz,.14,1.6,.95,0x425257);
     addBox(root,xf-side*.14,floor,vz,.07,1.5,.07,0xf1e4cc);
     addBox(root,xf-side*.13,floor-.81,vz,.35,.17,1.25,0xd6c9b4);
     if(floor<7.6){
      addBox(root,xf-side*.42,floor-.82,vz,.66,.09,2.0,0xb8b0a3);
      addBox(root,xf-side*.7,floor-.37,vz,.07,.8,2.1,0x35403d);
     }
    }
   }
  }
 }
 for(let z=start+4;z<end;z+=light?19:11){
  addBox(root,-2.9,-.004,z,.09,.022,2.15,0xe7dfcc);
  addBox(root,2.9,-.004,z,.09,.022,2.15,0xe7dfcc);
 }
 // Passages piétons, terrasses, platanes et réverbères à intervalles espacés.
 for(let z=start+15;z<end;z+=55)
  for(let x=-6.6;x<=6.6;x+=1.5)addBox(root,x,.003,z,.78,.026,2.4,0xece6d8);
 for(let z=start+12;z<end;z+=light?35:25)for(const side of [-1,1]){
  addBox(root,side*8.85,2.75,z,.12,5.5,.12,0x3f4b47);
  addBox(root,side*8.5,5.45,z,.7,.16,.3,0xdfd4b3);
  addBox(root,side*10.25,1.8,z+8,.3,3.6,.3,0x735c47);
  root.add(mesh(gSphere,canopy,side*10.25,4.35,z+8,1.45,1.9,1.35));
 }
}

function parisBackdrop(root,start,end){
 // L'ancienne couronne bouchait la perspective : façades uniquement sur les flancs.
 // 36 maisons à x >= 32, en laissant l'avenue centrale totalement dégagée.
 const count=36,facades=new T.InstancedMesh(gBox,mat(0xffffff),count);
 const roofs=new T.InstancedMesh(gBox,mat(0xffffff),count);
 const chimneys=new T.InstancedMesh(gBox,mat(0xffffff),count);
 const obj=new T.Object3D();
 const shades=[0xd9b69f,0xebd2b5,0xb2ced1,0xd4c4aa,0xd7b4ae,0xc4d0b9,0xd2c0d3];
 for(let i=0;i<count;i++){
  const side=i%2===0?-1:1,rank=Math.floor(i/2);
  const x=side*(32+(rank%3)*2.4),z=start-10+rank*(end-start+26)/17;
  const h=15+rnd(i+12)*13,width=9+rnd(i+29)*5;
  obj.rotation.set(0,0,0);
  obj.position.set(x,h/2,z);obj.scale.set(width,h,9.6);obj.updateMatrix();
  facades.setMatrixAt(i,obj.matrix);facades.setColorAt(i,new T.Color(shades[i%shades.length]));
  obj.position.y=h+.65;obj.scale.set(width+1.3,1.3,10.4);obj.updateMatrix();
  roofs.setMatrixAt(i,obj.matrix);roofs.setColorAt(i,new T.Color(i%3===0?0x526174:0x75838b));
  obj.position.set(x+side*1.1,h+2,z);obj.scale.set(.7,1.75,.6);obj.updateMatrix();
  chimneys.setMatrixAt(i,obj.matrix);chimneys.setColorAt(i,new T.Color(0xb39278));
 }
 root.add(facades,roofs,chimneys);
}
function parisStreetDetails(root,start,end){
 // Bancs, bornes, commerces, stores, une entrée de métro et un kiosque.
 for(let i=0,z=start+13;z<end-6;z+=27,i++){
  const side=i%2===0?-1:1,x=side*9.7;
  addBox(root,x,.47,z,1.7,.16,.50,0x395648);
  addBox(root,x,.88,z-.19,1.7,.72,.14,0x3c5b4d);
  for(const dx of [-.68,.68])addBox(root,x+dx,.24,z,.12,.46,.38,0x243c39);
  for(const dz of [-2.3,2.3]){
   root.add(mesh(gCyl,mat(0x364644),side*8.1,.47,z+dz,.14,.90,.14));
   root.add(mesh(gSphere,mat(0x6f786e),side*8.1,.95,z+dz,.17,.14,.17));
  }
  const awning=addBox(root,side*11.25,3.1,z+5,1.8,.15,3.7,
   [0xb64338,0x4c7768,0xe5b35b][i%3]);awning.rotation.z=side*.14;
  for(const dz of [-1.4,0,1.4])addBox(root,side*11.25,2.98,z+5+dz,1.7,.035,.06,0xf4eedf);
 }
 const metroZ=Math.max(start+7,-8),mx=-9.65;
 for(const side of [-1,1]){
  addBox(root,mx+side*.98,.87,metroZ,.12,1.6,.12,0x3e6d57);
  root.add(mesh(gSphere,mat(0x416f55),mx+side*.98,1.74,metroZ,.15,.15,.15));
 }
 const metro=roundedText('MÉTRO',2.1,'#ce3e36','#fff8e8');
 metro.position.set(mx,2.03,metroZ);metro.rotation.y=Math.PI/2;root.add(metro);
 const z=start+26,x=10.25;
 addBox(root,x,1.35,z,2.3,2.65,1.5,0x375449);
 addBox(root,x,2.83,z,2.8,.28,2.1,0x60745e);
 addBox(root,x,1.49,z-.79,1.5,1.0,.09,0xe6d4aa);
 const news=roundedText('JOURNAUX',2.2,'#ebc56e','#3e504a');
 news.position.set(x,2.5,z-.87);root.add(news);
 // Végétation et éclairage sur les trottoirs, jamais devant le joueur.
 for(let row=0,at=start+7;at<end-5;at+=19,row++){
  for(const side of [-1,1]){
   const treeX=side*10.45,lightX=side*9.4;
   root.add(mesh(gCyl,mat(0x725b43),treeX,1.75,at,.22,3.5,.22));
   root.add(mesh(gSphere,mat(row%2?0x64855b:0x769661),treeX,4.35,at,1.18,1.75,1.18));
   root.add(mesh(gCyl,mat(0x334745),lightX,2.6,at+8,.065,5.2,.065));
   root.add(mesh(gSphere,new T.MeshBasicMaterial({color:0xffe6aa}),lightX,5.25,at+8,.22,.26,.22));
  }
 }
 parisSidewalkPedestrians(root,start,end);
}
// Passants légers instanciés : 16 silhouettes exclusivement sur les trottoirs.
function parisSidewalkPedestrians(root,start,end){
 const count=16,body=new T.InstancedMesh(gCyl,mat(0xffffff),count);
 const heads=new T.InstancedMesh(gSphere,mat(0xffffff),count);
 const legs=new T.InstancedMesh(gBox,mat(0x374553),count*2);
 const obj=new T.Object3D(),coats=[0x9c685c,0x59766b,0x5f6882,0xb08a5a,0x986c86,0x436b78];
 for(let i=0;i<count;i++){
  const side=i%2===0?-1:1,rank=Math.floor(i/2);
  const x=side*(10.1+(rank%3)*.55),z=start+6+rank*(end-start-9)/8;
  const height=.9+rnd(i+11)*.14;
  obj.rotation.set(0,0,0);
  obj.position.set(x,1.10,z);obj.scale.set(.30,height,.23);obj.updateMatrix();
  body.setMatrixAt(i,obj.matrix);body.setColorAt(i,new T.Color(coats[i%coats.length]));
  obj.position.set(x,1.73+height*.17,z);obj.scale.set(.20,.21,.20);obj.updateMatrix();
  heads.setMatrixAt(i,obj.matrix);heads.setColorAt(i,new T.Color(i%3===0?0xbc8f6f:0xdfb994));
  for(let leg=0;leg<2;leg++){
   obj.position.set(x+(leg?.11:-.11),.43,z+(leg?.11:-.11));
   obj.scale.set(.13,.72,.15);obj.updateMatrix();legs.setMatrixAt(i*2+leg,obj.matrix);
  }
 }
 root.add(body,heads,legs);
}
function statue(sceneRoot){
 const root=new T.Group();root.position.x=STATUE.x;sceneRoot.add(root);
 // Monument interprété : le joueur monte par un escalier visible sur le socle.
 addBox(root,0,.3,5,6,1.0,6,0xa5a39a);
 addBox(root,0,1.05,5,4.5,.55,4.5,0xbdb6a3);
 addBox(root,0,2.05,5,3.1,1.55,3.1,0xe1d4b7);
 addBox(root,0,3.15,5,3.8,.20,3.8,0xb5aa94);
 // Marches claires sur la face avant gauche, de la rue au sommet.
 for(let i=0;i<10;i++){
  const height=(i+1)*.332;
  const z=.35+i*(3.13/9);
  addBox(root,-1.15,height/2,z,1.35,height,.38,i%2?0xc6b49a:0xe4d4b5);
  addBox(root,-1.15,height+.015,z,1.4,.025,.38,0xf1e3c8);
 }
 const entrance=roundedText('ACCÈS AU SOCLE ↑',3.2,'#f6e9c8','#405744');
 entrance.position.set(-1.15,.27,-.30);root.add(entrance);
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
function distantCrowd(root,baseZ,count,follow=false){
 // Four draw calls rather than hundreds of detailed models.
 const body=new T.InstancedMesh(gBox,mat(0x5f645a),count);
 const head=new T.InstancedMesh(gSphere,mat(0xcaa17b),count);
 const legs=new T.InstancedMesh(gBox,mat(0x495453),count);
 const hatCount=Math.ceil(count*.11);
 const hat=new T.InstancedMesh(gBox,mat(0x484944),hatCount);
 const dummy=new T.Object3D(),col=new T.Color();
 for(let i=0;i<count;i++){
  const x=(rnd(i*31+5)-.5)*(follow?9:14),z=follow?run.z-8-rnd(i*61+1)*6:baseZ+(rnd(i*61+1)-.5)*21;
  dummy.position.set(x,.95,z);dummy.scale.set(.42,.77,.28);dummy.updateMatrix();body.setMatrixAt(i,dummy.matrix);
  col.setHex(colors.coat[i%colors.coat.length]);body.setColorAt(i,col);
  dummy.position.set(x,1.66,z);dummy.scale.set(.19,.22,.18);dummy.updateMatrix();head.setMatrixAt(i,dummy.matrix);
  head.setColorAt(i,new T.Color(colors.skin[(i*7)%colors.skin.length]));
  dummy.position.set(x,.4,z);dummy.scale.set(.33,.80,.24);dummy.updateMatrix();legs.setMatrixAt(i,dummy.matrix);
  if(i<hatCount){dummy.position.set(x,1.83,z);dummy.scale.set(.25,.09,.22);dummy.updateMatrix();hat.setMatrixAt(i,dummy.matrix);}
 }
 root.add(body,head,legs,hat);staticFar.push(body,head,legs,hat);
 if(follow)escortInstances={body,head,legs,hat,count,hatCount};
}
function moveEscortInstances(){
 if(!escortInstances)return;
 const {body,head,legs,hat,count,hatCount}=escortInstances;
 const dummy=new T.Object3D();
 const center=run.phase===3?run.leaderZ:run.z-7;
 for(let i=0;i<count;i++){
  const x=clamp(run.x*.28+(rnd(i*31+5)-.5)*8.5,-7,7);
  const z=behindNarrator(run.z,center-1.5+(rnd(i*61+1)-.5)*6.0,4.8);
  dummy.position.set(x,.95,z);dummy.scale.set(.42,.77,.28);dummy.updateMatrix();body.setMatrixAt(i,dummy.matrix);
  dummy.position.set(x,1.66,z);dummy.scale.set(.19,.22,.18);dummy.updateMatrix();head.setMatrixAt(i,dummy.matrix);
  dummy.position.set(x,.4,z);dummy.scale.set(.33,.80,.24);dummy.updateMatrix();legs.setMatrixAt(i,dummy.matrix);
  if(i<hatCount){dummy.position.set(x,1.83,z);dummy.scale.set(.25,.09,.22);dummy.updateMatrix();hat.setMatrixAt(i,dummy.matrix);}
 }
 for(const part of [body,head,legs,hat])part.instanceMatrix.needsUpdate=true;
}
function crowdSymbols(root,tricolor=false){
 rallyProps=new T.Group();root.add(rallyProps);
 protestSign(rallyProps,'NON À LE PEN',-4.1,-1,3.2,'#ffdf80');
 protestSign(rallyProps,'LIBERTÉ, ÉGALITÉ, FRATERNITÉ',3.1,-3,5.9,'#b7e2ff');
 protestSign(rallyProps,'SOLIDARITÉ',-1.8,-7.5,3.2,'#ffd2dc');
 protestSign(rallyProps,'DÉMOCRATIE',5,-9,3.0,'#cdecc1');
 banner(rallyProps,'TOUS ENSEMBLE',0,-5.3,5.5,'#d9514e','#fff8dc');
 flag(rallyProps,'red',-5.5,0,-3.0,3.4);
 flag(rallyProps,'france',4.4,0,-2.0,3.2);
 flag(rallyProps,'red',-1.2,0,-9.0,3.5);
 flag(rallyProps,'france',5.9,0,-10,3.1);
}


function protestSign(root,text,x,z,width=3.2,paint='#f3e1b9'){
 const pole=mesh(gBox,mat(0x80664b),x,1.35,z,.065,2.65,.065);root.add(pole);
 const board=roundedText(text,width,paint,'#3d493d');
 board.position.set(x,2.8,z);board.rotation.y=Math.PI;root.add(board);
}
function banner(root,text,x,z,width=6.0,paint='#fbf1d8',ink='#33453c'){
 const fabric=roundedText(text,width,paint,ink);
 fabric.rotation.y=Math.PI;fabric.position.set(x,3.3,z);root.add(fabric);
 for(const side of [-1,1])root.add(mesh(gCyl,mat(0x685a48),x+side*width*.5,1.65,z,.035,3.4,.035));
}

function riotOfficer(index){
 // Silhouette lisible, plus organique : tenue de protection bleu marine,
 // épaulières, casque à visière, bouclier arrondi marqué CRS et matraque.
 const actor=new T.Group();
 const navy=mat(0x23374e),dark=mat(0x161f2e),skin=mat(0xc99b7c);
 const chest=mesh(gSphere,navy,0,1.17,0,.33,.47,.23);actor.add(chest);
 const armor=mesh(gBox,mat(0x334f68),0,1.12,-.18,.55,.55,.095);actor.add(armor);
 addBox(actor,0,.77,0,.46,.13,.31,0x172b3d);
 // Plastron segmenté, distinct des membres et visible même sur un petit écran.
 addBox(actor,0,1.35,-.235,.46,.10,.055,0x859bab);
 addBox(actor,0,.96,-.242,.46,.06,.055,0x9db0b8);
 for(const side of [-1,1]){
  const leg=mesh(gCyl,navy,side*.155,.43,0,.11,.77,.11);actor.add(leg);
  const boot=mesh(gBox,dark,side*.155,.12,-.07,.24,.20,.38);actor.add(boot);
  addBox(actor,side*.155,.52,-.16,.235,.27,.10,0x7892a4); // genouillère
  const arm=mesh(gCyl,navy,side*.36,1.17,-.025,.11,.63,.11);
  arm.rotation.z=side*.16;actor.add(arm);
  actor.add(mesh(gSphere,mat(0x324c63),side*.31,1.41,0,.17,.16,.19));
  addBox(actor,side*.39,1.30,-.16,.18,.14,.075,0xb2c5d2); // épaulière
  addBox(actor,side*.36,.96,-.14,.20,.25,.10,0x405a73);
 }
 actor.add(mesh(gSphere,skin,0,1.75,0,.19,.21,.18));
 const helmet=mesh(gSphere,dark,0,1.91,0,.30,.225,.275);actor.add(helmet);
 const brow=mesh(gBox,mat(0x0e1722),0,1.84,-.24,.43,.07,.16);actor.add(brow);
 addBox(actor,0,2.055,-.07,.46,.075,.34,0x73899e);
 addBox(actor,0,1.61,-.238,.38,.075,.08,0x182839); // jugulaire
 const visor=mesh(gBox,new T.MeshStandardMaterial({
  color:0x86aabe,transparent:true,opacity:.78,roughness:.20,metalness:.10
 }),0,1.78,-.245,.405,.23,.047);actor.add(visor);
 const shield=mesh(gBox,mat(0x627d92,.18),-.47,1.14,-.40,.82,1.12,.13);
 actor.add(shield);
 const frame=mesh(gBox,mat(0x172839),-.47,1.14,-.36,.87,1.16,.075);
 frame.position.z=-.38;frame.scale.set(.88,1.15,.08);
 actor.add(frame);
 addBox(actor,-.47,1.57,-.50,.75,.08,.035,0xdce7f2);
 addBox(actor,-.47,.72,-.50,.75,.075,.035,0xdce7f2);
 const label=roundedText('CRS',.86,'#e4edf6','#10283f');
 label.rotation.y=Math.PI;label.position.set(-.47,1.17,-.49);actor.add(label);
 const baton=mesh(gCyl,dark,.49,1.11,-.28,.044,.79,.044);
 baton.rotation.z=-.22;actor.add(baton);
 return {actor};
}
function createPoliceWaves(root){
 policeGroups=[];
 for(const wave of CRS_WAVES){
  const group=new T.Group(),actors=[];
  group.visible=false;group.position.z=wave.anchor;root.add(group);
  for(let i=0;i<4;i++){
   const officer=riotOfficer((wave.id-1)*4+i);
   // Quatre CRS séparés de 2,35 m : boucliers et casques ne se chevauchent plus.
   officer.baseX=(i-1.5)*2.35;
   officer.actor.scale.setScalar(1.30);
   officer.actor.position.x=officer.baseX;
   officer.actor.position.z=i%2*.25;
   group.add(officer.actor);actors.push(officer);
   const hit=mesh(gBox,new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),
    officer.baseX,1.5,i%2*.25,1.55,3.35,1.3);
   hit.userData.pickTarget={type:'crs',wave:wave.id,id:i};
   group.add(hit);pickableMeshes.push(hit);
   officer.hit=hit;
  }
  policeGroups.push({id:wave.id,group,actors,anchor:wave.anchor});
 }
}
function activePoliceWave(id){return policeGroups.find(w=>w.id===id);}
function officerWorldPoint(waveId,officerId){
 const display=activePoliceWave(waveId),officer=display?.actors[officerId];
 if(!officer)return null;
 display.group.updateMatrixWorld(true);
 return officer.actor.localToWorld(new T.Vector3(0,1.45,-.30));
}
function updatePoliceWaves(time){
 if(run.phase!==3)return;
 for(const display of policeGroups){
  const wave=run.crsWaves.find(w=>w.id===display.id);
  if(!wave){display.group.visible=false;continue;}
  display.group.visible=wave.status==='active';
  if(!display.group.visible)continue;
  const approaches=Math.max(0,run.clock-wave.startedAt);
  display.group.position.set(Math.sin(time*.6+wave.id)*.15,0,
   Math.max(run.z+6.3,display.anchor-approaches*4));
  for(let i=0;i<4;i++){
   const officer=display.actors[i],state=wave.officers[i];
   officer.actor.visible=state.status==='standing';
   officer.hit.visible=state.status==='standing';
   if(!officer.actor.visible)continue;
   officer.actor.position.x=officer.baseX+Math.sin(time*.84+i*1.6)*.18;
   officer.actor.position.z=i%2*.25+Math.cos(time*1.2+i)*.12;
   officer.actor.position.y=Math.sin(time*4.7+i*1.8)*.045;
   officer.hit.position.x=officer.actor.position.x;
   officer.hit.position.z=officer.actor.position.z;
  }
 }
}
const heartShape=new T.Shape();
heartShape.moveTo(0,-.23);heartShape.bezierCurveTo(-.24,-.04,-.46,.21,-.27,.4);
heartShape.bezierCurveTo(-.1,.56,0,.37,0,.31);
heartShape.bezierCurveTo(.05,.47,.19,.53,.3,.36);
heartShape.bezierCurveTo(.47,.16,.24,-.04,0,-.23);
const kissShape=new T.Shape();
kissShape.moveTo(-.46,0);
kissShape.bezierCurveTo(-.33,.16,-.20,.20,-.07,.08);
kissShape.bezierCurveTo(.02,.18,.12,.20,.22,.08);
kissShape.bezierCurveTo(.34,.15,.44,.10,.49,0);
kissShape.bezierCurveTo(.28,-.31,-.2,-.32,-.46,0);
const projectileGeos={
 heart:new T.ExtrudeGeometry(heartShape,{depth:.1,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:1,steps:1}),
 kiss:new T.ExtrudeGeometry(kissShape,{depth:.1,bevelEnabled:true,bevelThickness:.04,bevelSize:.04,bevelSegments:1,steps:1}),
 flower:new T.SphereGeometry(1,12,9)
};
function makeSymbol(kind,size=1){
 if(kind==='flower'){
  const flower=new T.Group();
  for(let i=0;i<6;i++){
   const angle=i*Math.PI/3;
   const petal=mesh(gSphere,new T.MeshBasicMaterial({color:i%2?0xf59ed5:0xff67bd,transparent:true,opacity:1,depthWrite:false}),
    Math.cos(angle)*.31,Math.sin(angle)*.31,0,.29,.37,.11);
   petal.rotation.z=angle-Math.PI/2;flower.add(petal);
  }
  flower.add(mesh(gSphere,new T.MeshBasicMaterial({color:0xffde56}),0,0,.14,.24,.24,.13));
  flower.scale.setScalar(size);return flower;
 }
 const meshObj=new T.Mesh(projectileGeos[kind],new T.MeshBasicMaterial({
  color:kind==='kiss'?0xff3474:0xff3263,transparent:true,opacity:1,depthWrite:false,side:T.DoubleSide
 }));
 meshObj.scale.setScalar(size);
 return meshObj;
}
function disposeSymbol(obj){
 obj.traverse(child=>{if(child.isMesh&&child.material)child.material.dispose();});
 obj.parent?.remove(obj);
}
function symbolOpacity(obj,opacity){obj.traverse(node=>{if(node.isMesh&&node.material&&node.material.transparent)node.material.opacity=opacity;});}
function sendProjectile(waveId,officerId,kind,duration=.78){
 const target=officerWorldPoint(waveId,officerId);
 if(!target||!sceneGroup)return;
 const from=new T.Vector3(run.x,run.height+1.55,run.z+.48);
 const symbol=makeSymbol(kind,kind==='flower'?1.14:1.48);
 symbol.position.copy(from);sceneGroup.add(symbol);
 heartBursts.push({symbol,wave:waveId,officer:officerId,kind,from,elapsed:0,duration});
}
function transformOfficer(waveId,officerId,kind){
 const display=activePoliceWave(waveId),officer=display?.actors[officerId];
 if(!officer||!sceneGroup)return;
 const at=officerWorldPoint(waveId,officerId);if(!at)return;
 officer.actor.visible=false;officer.hit.visible=false;
 const symbol=makeSymbol(kind,.4);symbol.position.copy(at);sceneGroup.add(symbol);
 heartAscents.push({symbol,kind,at,elapsed:0,duration:3.2,
  twist:waveId*.52+officerId*.71});
 const shot=heartBursts.find(a=>a.wave===waveId&&a.officer===officerId);
 if(shot)shot.elapsed=shot.duration;
}
function animateProjectiles(dt){
 for(let i=heartBursts.length-1;i>=0;i--){
  const fx=heartBursts[i];fx.elapsed+=dt;
  const p=Math.min(1,fx.elapsed/fx.duration);
  const goal=officerWorldPoint(fx.wave,fx.officer);
  if(goal)fx.symbol.position.lerpVectors(fx.from,goal,p);
  fx.symbol.position.y+=Math.sin(p*Math.PI)*.28;
  fx.symbol.quaternion.copy(camera.quaternion);
  fx.symbol.scale.setScalar((fx.kind==='flower'?1.13:1.5)+Math.sin(p*Math.PI)*.35);
  symbolOpacity(fx.symbol,p>.90?Math.max(.05,(1-p)/.1):1);
  if(p>=1){disposeSymbol(fx.symbol);heartBursts.splice(i,1);}
 }
 for(let i=heartAscents.length-1;i>=0;i--){
  const fx=heartAscents[i];fx.elapsed+=dt;
  const p=Math.min(1,fx.elapsed/fx.duration);
  fx.symbol.position.set(fx.at.x+Math.sin(fx.elapsed*2.3+fx.twist)*.55,
   fx.at.y+fx.elapsed*3.1,fx.at.z+.1*fx.elapsed);
  fx.symbol.quaternion.copy(camera.quaternion);
  fx.symbol.scale.setScalar(.38+2.0*Math.min(1,fx.elapsed/.4));
  symbolOpacity(fx.symbol,p>.7?Math.max(0,(1-p)/.3):1);
  if(p>=1){disposeSymbol(fx.symbol);heartAscents.splice(i,1);}
 }
 // Illusion multijoueur : les alliés lancent des symboles autonomes,
 // qui s'estompent AVANT les CRS et ne comptent jamais d'impact.
 for(let i=allyEffects.length-1;i>=0;i--){
  const fx=allyEffects[i];fx.elapsed+=dt;
  const p=Math.min(1,fx.elapsed/fx.duration);
  fx.symbol.position.lerpVectors(fx.from,fx.to,p);
  fx.symbol.position.y+=Math.sin(p*Math.PI)*.9;
  fx.symbol.quaternion.copy(camera.quaternion);
  fx.symbol.scale.setScalar(fx.baseSize*(1+.25*Math.sin(p*Math.PI)));
  symbolOpacity(fx.symbol,p>.72?Math.max(0,(1-p)/.28):1);
  if(p>=1){disposeSymbol(fx.symbol);allyEffects.splice(i,1);}
 }
}
function animateAllyAttacks(time){
 if(run.phase!==3||!activeWave(run)||!sceneGroup||!crowdActors.length)return;
 if(Math.floor(time*1.6)===Math.floor((time-.05)*1.6))return;
 const w=activeWave(run),display=activePoliceWave(w.id);
 const follower=crowdActors[Math.floor(time*7)%crowdActors.length];
 if(!follower||!display)return;
 const from=new T.Vector3(follower.guy.position.x,2.2,follower.guy.position.z+.3);
 // L'attaque alliée ne rejoint volontairement pas le barrage.
 const to=new T.Vector3(run.x+(rnd(time*3)-.5)*4,2.3,run.z+4.0);
 // Les cœurs alliés sont sensiblement plus gros et restent lisibles en vol.
 // Leurs tirs ne comptent toujours aucun impact sur les CRS.
 const symbol=makeSymbol(w.kind,w.kind==='heart'?1.25:.85);
 symbol.position.copy(from);sceneGroup.add(symbol);
 allyEffects.push({symbol,from,to,elapsed:0,duration:.9,baseSize:w.kind==='heart'?1.25:.85});
}
function weaponPickup(root,pick){
 const group=new T.Group();group.position.set(pick.x,0,pick.z);root.add(group);
 addBox(group,0,.44,0,1.22,.11,1.22,0xd7c89d);
 // Gros symbole visible sur le parcours et cible tactile facile à sélectionner.
 const symbol=makeSymbol(pick.kind,pick.kind==='heart'?1.7:1.25);
 symbol.position.y=2.05;group.add(symbol);
 const marker=roundedText('RAMASSER '+pick.icon,3.4,'#fff0d4','#604533');
 marker.position.set(0,3.2,0);group.add(marker);
 const hit=mesh(gBox,new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),
  0,1.7,0,3.6,4,3.6);
 hit.userData.pickTarget={type:'pickup',id:pick.id};group.add(hit);pickableMeshes.push(hit);
 pickupActors.push({id:pick.id,group,symbol});
}
function addSelectable(root,obj,x,y,z,size,target){
 const hit=mesh(gBox,new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),
  x,y,z,size,size,size);
 hit.userData.pickTarget=target;root.add(hit);pickableMeshes.push(hit);
 return hit;
}
function markSelection(time){
 if(!selectionMarker)return;
 const sel=run.selected;selectionMarker.visible=!!sel;
 if(!sel)return;
 let point=null,arrowY=3.65;
 if(sel.type==='flag'){point=new T.Vector3(FLAG.x,0,FLAG.z);arrowY=4.8;}
 if(sel.type==='statue'){point=new T.Vector3(STATUE.x,0,STATUE.z);arrowY=8.7;}
 if(sel.type==='pickup'){
  const p=run.pickups.find(w=>w.id===sel.id);
  if(p)point=new T.Vector3(p.x,0,p.z);
  arrowY=4.1;
 }
 if(sel.type==='crs'){
  const actorPoint=officerWorldPoint(sel.wave,sel.id);
  if(actorPoint)point=new T.Vector3(actorPoint.x,0,actorPoint.z);
  arrowY=3.65;
 }
 if(point){
  selectionMarker.position.set(point.x,.12,point.z);
  selectionMarker.scale.setScalar(1+Math.sin(time*5)*.10);
  const highlight=sel.type==='crs'?0xff744f:sel.type==='pickup'?0x51f2dc:0xffe16a;
  selectionMarker.userData.rings.forEach(ring=>ring.material.color.setHex(highlight));
  selectionMarker.userData.arrow.material.color.setHex(highlight);
  selectionMarker.userData.arrow.position.y=arrowY+.25*Math.sin(time*5);
  selectionMarker.userData.arrow.rotation.y=time*1.5;
 }else selectionMarker.visible=false;
}

function populateMarch(root){
 // Ajouter la suite de la manifestation sans recréer le héros ni la caméra 3D.
 for(const pick of WEAPONS)weaponPickup(root,pick);
 createPoliceWaves(root);
}
function populateBastille(root){
 if(bastilleReady)return;
 bastilleReady=true;
 bastilleCrowd=new T.Group();bastilleCrowd.visible=false;root.add(bastilleCrowd);
 bastilleActors=makeCrowd(bastilleCrowd,16,102,{spread:4.8});
 adverseSymbols=new T.Group();bastilleCrowd.add(adverseSymbols);
 banner(adverseSymbols,'RÉPUBLIQUE — BASTILLE',0,97,7.4,'#f5d16e','#343e53');
 banner(adverseSymbols,'ENSEMBLE',1,107,5.0,'#9dd0ee','#243c57');
 protestSign(adverseSymbols,'NON À LA HAINE',-4,103,3.1,'#f6b1ab');
 protestSign(adverseSymbols,'LIBERTÉ',4.6,106,3.0,'#cfebbe');
 flag(adverseSymbols,'france',3,0,101,3.4);
 flag(adverseSymbols,'red',-5.4,0,103,3.5);
 flag(adverseSymbols,'france',5.8,0,109,3.1);
 flag(adverseSymbols,'red',-2.6,0,111,3.3);
}
function extendMarchScenery(){
 if(run.phase!==3||!sceneGroup)return;
 if(!avenueExtended&&run.z>=18){
  avenueExtended=true;buildings(sceneGroup,46,138,true);
  parisStreetDetails(sceneGroup,49,135);parisBackdrop(sceneGroup,49,139);
 }
 if(!bastilleReady&&run.z>=75)populateBastille(sceneGroup);
}
function sceneFor(phase){
 if(phase===3&&stageInWorld===2&&sceneGroup){
  // Correction mobile : garder intacte toute la scène de République.
  // L'ancien remplacement complet pouvait figer le rendu et les commandes tactiles.
  stageInWorld=3;
  populateMarch(sceneGroup);
  world.background.setHex(0xc3d4d9);world.fog.color.setHex(0xc3d4d9);
  return;
 }
 if(sceneGroup)world.remove(sceneGroup);
 sceneGroup=new T.Group();world.add(sceneGroup);
 stageFlags=[];crowdActors=[];staticFar=[];bastilleCrowd=null;bastilleActors=[];
 policeGroups=[];heartBursts=[];heartAscents=[];escortInstances=null;rallyProps=null;
 pickableMeshes=[];pickupActors=[];allyEffects=[];adverseSymbols=null;selectionMarker=null;
 redGuide=null;guideStop=0;
 avenueExtended=false;bastilleReady=false;
 const root=sceneGroup,sky=phase===1?0xbed5db:phase===2?0xb8cdd5:0xc3d4d9;
 world.background.setHex(sky);world.fog.color.setHex(sky);
 if(phase===1){
  // Rue adjacente : un seul manifestant-guide conduit le joueur vers le drapeau.
  buildings(root,-20,38,true);parisBackdrop(root,-20,38);parisStreetDetails(root,-20,38);
  addBox(root,0,-.07,22,27,.1,7,0x787a77); // carrefour vers l'avenue
  addBox(root,11.63,3.8,11,.1,7,6,0xd5c5a7);
  const school=roundedText('ÉCOLE',2.6);
  school.position.set(11.54,4.7,11);school.rotation.y=-Math.PI/2;root.add(school);
  flag(root,'france',FLAG.x,0,FLAG.z,4.1);
  addSelectable(root,null,FLAG.x,2.1,FLAG.z,3.0,{type:'flag'});
  redGuide=person(5);redGuide.position.set(-3.1,0,-4.3);root.add(redGuide);
  flag(redGuide,'red',.25,1.04,.10,3.15);
  // Le personnage guide par son déplacement, sans inscription permanente.
 }else if(phase===2){
  buildings(root,-23,48,true);parisBackdrop(root,-23,48);parisStreetDetails(root,-23,48);statue(root);
  crowdActors=makeCrowd(root,16,-7.5,{spread:4.8});
  distantCrowd(root,-8,24,true);crowdSymbols(root,true);
  addSelectable(root,null,STATUE.x,3.6,STATUE.z,5.8,{type:'statue'});
 }else{
  buildings(root,-23,48,true);parisBackdrop(root,-23,48);parisStreetDetails(root,-23,48);statue(root);
  crowdActors=makeCrowd(root,16,-7.5,{spread:4.8});
  distantCrowd(root,-8,24,true);crowdSymbols(root,true);
  populateMarch(root);
 }
 hero=person(2,{hero:true});root.add(hero);
 // Le drapeau est vraiment tenu par le personnage après sa récupération.
 if(phase>=2)flag(hero,'france',.40,1.05,0,2.6);
 // Sélection explicite : doubles anneaux au sol et grande flèche pulsante.
 selectionMarker=new T.Group();
 const rings=[];
 for(const radius of [1.05,1.45]){
  const ring=new T.Mesh(new T.TorusGeometry(radius,.13,8,36),
   new T.MeshBasicMaterial({color:0xffe16a,depthTest:false,transparent:true,opacity:radius>1.2?.8:1}));
  ring.rotation.x=Math.PI/2;ring.renderOrder=35;selectionMarker.add(ring);rings.push(ring);
 }
 const arrow=mesh(gCone,new T.MeshBasicMaterial({color:0xffe16a,depthTest:false}),
  0,4,0,.46,.75,.46);
 arrow.rotation.z=Math.PI;arrow.renderOrder=36;selectionMarker.add(arrow);
 selectionMarker.userData={rings,arrow};
 selectionMarker.visible=false;root.add(selectionMarker);
 stageInWorld=phase;
}

function messageFeedback(text,duration=1.05){
 speech.textContent=text;speech.hidden=false;speech.style.opacity='1';
 showSpeechUntil=performance.now()/1000+Math.min(1.12,Math.max(.65,duration));
}
function syncInstruction(){
 if(!playing||paused)return;
 const instruction=gameInstruction(run);
 if(!instruction||instruction.key===lastInstructionKey)return;
 lastInstructionKey=instruction.key;
 messageFeedback(instruction.text,1.05);
}
function refreshHUD(){
 const p=run.phase,n=run.steps.length;
 title.textContent=p===1?'① Drapeau':p===2?'② République':'③ Bastille';
 label.textContent='';score.textContent=String(serverSteps.length*10);
 steps.forEach((el,i)=>{el.classList.toggle('done',i<n);el.textContent=i<n?'✓':String(i+1);});
 const pct=p===3?run.cohesion:100;
 meter.style.width=Math.round(pct)+'%';meterValue.textContent=Math.round(pct)+'%';
 $('meterLabel').textContent=p===3?'CORTÈGE':'';
 hint.hidden=true;hint.textContent='';
 const active=p===3?activeWave(run):null;
 const waiting=run.crsWaves.find(w=>w.status==='waiting');
 const needed=run.pickups.find(w=>w.id===waiting?.id&&!w.collected);
 const pickupTip=$('weaponPrompt');
 pickupTip.hidden=true;pickupTip.textContent=''; // Consigne uniquement temporaire.
 const alert=$('crsAlert');
 alert.hidden=true;
 const chip=$('weaponChip'),sel=$('targetChip'),picker=$('chooseTarget');
 chip.hidden=p!==3;chip.textContent=p===3?(WEAPONS.find(w=>w.kind===run.weapon)?.icon||'—'):'';
 const names={flag:'🇫🇷 Drapeau',statue:'Statue',pickup:'Objet',crs:'CRS'};
 sel.textContent=run.selected?.type==='crs'?('✓ SÉLECTIONNÉ : CRS '+(run.selected.id+1)):
  run.selected?.type==='pickup'?('✓ SÉLECTIONNÉ : '+run.pickups.find(w=>w.id===run.selected.id)?.icon):
  run.selected?('✓ SÉLECTIONNÉ : '+names[run.selected.type]):'◎ —';
 sel.classList.toggle('is-selected',!!run.selected);
 $('chooseTarget').classList.toggle('has-target',!!run.selected);
 picker.hidden=!(playing&&!paused&&(availableTargets(run).length>0));
 const panel=$('statueControls');panel.hidden=!(playing&&p===2&&run.climbed&&!run.statueShouted&&!run.climb);
 $('red').textContent=p===3?(WEAPONS.find(w=>w.kind===run.weapon)?.icon||'●'):'●';
 $('yellowLabel').textContent=p===1?'PRENDRE':p===2?(run.climbed||run.climb?.direction==='down'?'DESCENDRE':'MONTER'):'RAMASSER';
 const caption=$('redLabel');caption.textContent=p===2?'CAMARADES !':p===3?'LANCER':'APPEL';
 $('red').setAttribute('aria-label',p===3?'Lancer vers le CRS sélectionné / regrouper':'Crier Camarades !');
 $('yellow').setAttribute('aria-label',p===2?(run.climbed?'Jaune : redescendre de la statue':'Jaune : monter sur la statue'):'Jaune : prendre ou agir');
 if(p===3){
  const status=$('crsMini');
  const repelled=run.crsWaves.filter(w=>w.status==='repelled').length;
  status.textContent='✦ '+repelled+'/3 · '+run.joined+'/16';
  status.hidden=false;
 }else $('crsMini').hidden=true;
}

const send=(type,extra={})=>{if(embedded)parent.postMessage({type,id:sessionId,...extra},location.origin);};
function drain(){
 for(const e of run.events.splice(0)){
  if(e.type==='progress'&&!serverSteps.includes(e.step)){
   if(!embedded)serverSteps.push(e.step);
   send('manifestation:progress',{step:e.step});
  }
  if(e.type==='corner')cornerTurn=1.55;
  if(e.type==='shout')voiceCamarades();
  if(e.type==='projectile:fire'){sendProjectile(e.wave,e.officer,e.kind,e.duration);sound(710,.1);}
  if(e.type==='projectile:hit'){transformOfficer(e.wave,e.officer,e.kind);sound(920,.1);}
  if(e.type==='won'){
   messageFeedback('✓ Cortèges réunis !',1.05);
   send('manifestation:won');
   playing=false;paused=false;
  }
 }
}

function card(titleText,bodyText){overlay.hidden=false;$('overlayTitle').textContent=titleText;$('overlayText').textContent=bodyText;}
function start(){
 if(!gameReady)return;
 $('renderError').hidden=true;renderFailureReported=false;lastControlDisplay=0;lastInstructionKey=null;
 $('controlsStatus').hidden=true;
 $('start').textContent='Commencer le jeu';run=newRun();sceneFor(run.phase);playing=true;paused=false;actionTransition=0;lastHud=0;cameraOrbit=0;cameraOrbitLeft=0;cornerTurn=0;
 overlay.hidden=true;refreshHUD();lastSound=0;
 syncInstruction();
}
function pause(){
 if(!playing)return;paused=!paused;
 $('pause').textContent=paused?'Reprendre':'Pause';
 if(paused){card('Pause','La foule attend. Reprends quand tu veux.');$('start').textContent='Reprendre';refreshHUD();}
 else {overlay.hidden=true;refreshHUD();}
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
function voiceCamarades(){
 if(soundOn&&'speechSynthesis'in window){
  try{
   const q=new SpeechSynthesisUtterance('Camarades !');q.lang='fr-FR';q.rate=1.03;q.volume=.9;
   speechSynthesis.speak(q);
  }catch{}
 }
 sound(520,.18);
 lastSound=performance.now()/1000;
}
function callCrowd(){
 if(!playing||paused)return;
 const fired=red(run);
 if(fired){drain();syncInstruction();refreshHUD();}
 // Without a selected CRS, holding red while stationary still gathers allies.
}
function yellowPress(){
 if(!playing||paused||actionTransition>0)return;
 const result=yellow(run);
 if(result){drain();syncInstruction();refreshHUD();}
}
function chooseTarget(){
 if(!playing||paused)return;
 if(selectNext(run)){refreshHUD();sound(510,.08);}
}
function changeDir(){
 const right=Number(keys.has('arrowright')||keys.has('d'));
 const left=Number(keys.has('arrowleft')||keys.has('q')||keys.has('a'));
 const fwd=Number(keys.has('arrowup')||keys.has('z')||keys.has('w'));
 const back=Number(keys.has('arrowdown')||keys.has('s'));
 const manualY=clamp(joy.y+fwd-back,-1,1);
 return {x:-clamp(joy.x+right-left,-1,1),
  y:manualY,
  red:redHeld||keys.has('r')};
}

function bindControls(){
 const zone=$('stick'),knob=$('knob');
 function point(e){
  const r=zone.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/(r.width*.33),
   y=-(e.clientY-r.top-r.height/2)/(r.height*.33),mag=Math.max(1,Math.hypot(x,y));
  joy={x:clamp(x/mag,-1,1),y:clamp(y/mag,-1,1)};
  knob.style.transform='translate('+(joy.x*zone.clientWidth*.25)+'px,'+(-joy.y*zone.clientHeight*.25)+'px)';
 }
 zone.addEventListener('pointerdown',e=>{e.preventDefault();pointerId=e.pointerId;zone.setPointerCapture(e.pointerId);point(e);});
 zone.addEventListener('pointermove',e=>{if(e.pointerId===pointerId)point(e);});
 function release(e){if(e&&pointerId!==e.pointerId)return;pointerId=null;joy={x:0,y:0};knob.style.transform='translate(0,0)';}
 for(const name of ['pointerup','pointercancel'])zone.addEventListener(name,release);
 zone.addEventListener('lostpointercapture',()=>release());
 const yellowBtn=$('yellow');
 yellowBtn.addEventListener('pointerdown',e=>{e.preventDefault();yellowBtn.classList.add('held');yellowPress();});
 for(const event of ['pointerup','pointercancel'])yellowBtn.addEventListener(event,()=>yellowBtn.classList.remove('held'));
 yellowBtn.addEventListener('click',e=>{if(e.detail===0)yellowPress();});
 const redBtn=$('red');
 const down=e=>{e.preventDefault();if(!redHeld){redHeld=true;redBtn.classList.add('held');callCrowd();}};
 const up=()=>{redHeld=false;redBtn.classList.remove('held');};
 redBtn.addEventListener('pointerdown',down);
 for(const event of ['pointerup','pointercancel','lostpointercapture'])redBtn.addEventListener(event,up);
 redBtn.addEventListener('click',e=>{if(e.detail===0){redHeld=true;callCrowd();setTimeout(up,180);}});
 $('chooseTarget').onclick=chooseTarget;
 // Touch the 3D flag, item or a specific CRS to select BEFORE acting.
 canvas.addEventListener('pointerdown',e=>{
  if(!playing||paused||!pickableMeshes.length)return;
  const rect=canvas.getBoundingClientRect();
  const mouse=new T.Vector2((e.clientX-rect.left)/rect.width*2-1,
   1-(e.clientY-rect.top)/rect.height*2);
  targetRaycaster.setFromCamera(mouse,camera);
  const hits=targetRaycaster.intersectObjects(pickableMeshes,false);
  for(const hit of hits){
   if(selectTarget(run,hit.object.userData.pickTarget)){refreshHUD();return;}
  }
 });
 window.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();
  if(['arrowup','arrowdown','arrowleft','arrowright',' ','enter','r','v','w','a','s','d','z','q','tab'].includes(key))e.preventDefault();
  const has=keys.has(key);keys.add(key);
  if(!has&&(key===' '||key==='enter'))yellowPress();
  if(!has&&key==='r')callCrowd();
  if(!has&&key==='tab')chooseTarget();
  if(!has&&key==='v'&&playing){cameraOrbit=0;cameraOrbitLeft=Math.PI*2;}
 });
 window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
 window.addEventListener('blur',()=>{keys.clear();redHeld=false;up();release();});
 $('start').onclick=()=>{if(paused){paused=false;overlay.hidden=true;return;}start();};
 $('replay').onclick=start;
 $('quit').onclick=()=>send('manifestation:close');
 $('back').onclick=()=>send('manifestation:close');
 $('next').onclick=()=>send('manifestation:next');
 $('pause').onclick=pause;
 $('turn360').onclick=()=>{if(!playing)return;cameraOrbit=0;cameraOrbitLeft=Math.PI*2;};
 $('statueCall').onclick=callCrowd;
 $('statueDescend').onclick=yellowPress;
 $('sound').onclick=()=>{soundOn=!soundOn;$('sound').textContent=soundOn?'Son ON':'Son OFF';$('sound').setAttribute('aria-pressed',String(soundOn));if(soundOn)sound(450,.13);};
 window.addEventListener('message',e=>{
  if(e.source!==parent||e.origin!==location.origin||!e.data)return;
  if(e.data.type==='manifestation:init'){sessionId=e.data.id||'standalone';serverSteps=Array.isArray(e.data.passed)?e.data.passed.filter(n=>n>=1&&n<=3):[];refreshHUD();}
  if(e.data.type==='manifestation:credited'&&e.data.id===sessionId){serverSteps=Array.isArray(e.data.passed)?e.data.passed:serverSteps;refreshHUD();}
 });
}

function updateRedGuide(dt,time){
 if(!redGuide||run.phase!==1)return;
 let moving=false;
 const stop=GUIDE_STOPS[guideStop];
 if(stop&&playing&&!paused&&distance(run,redGuide.position)<6.5){
  const dx=stop.x-redGuide.position.x,dz=stop.z-redGuide.position.z;
  const length=Math.hypot(dx,dz);
  if(length<.35){guideStop++;}
  else{
   const step=Math.min(length,Math.min(dt,.08)*2.85);
   redGuide.position.x+=dx/length*step;
   redGuide.position.z+=dz/length*step;
   redGuide.rotation.y=Math.atan2(dx,dz);
   moving=true;
  }
 }
 walking(redGuide,time,moving?1:.02);

}
function animateActors(dt,time){
 updateRedGuide(dt,time);
 if(hero){
  hero.position.set(run.x,run.height||0,run.z);
  const input=changeDir(),moving=Math.abs(input.x)+Math.abs(input.y)>.2&&!paused;
  walking(hero,time,moving?1:.03,run.phase===2&&run.statueShouted&&!run.climb);
  hero.rotation.y=run.facing+cameraOrbit;
 }
 if(run.phase>=2){
  const input=changeDir(),moving=Math.abs(input.x)+Math.abs(input.y)>.18&&!paused;
  const lead=run.phase===3?run.leaderZ:run.z-6.8;
  for(const follower of crowdActors){
   const seed=follower.seed;
   follower.guy.position.set(clamp(run.x*.27+follower.x*.66,-7.4,7.4),0,
    behindNarrator(run.z,lead+(rnd(seed*71+13)-.5)*4.3,4.8));
   walking(follower.guy,time,moving?.85:.07);
   follower.guy.rotation.y=Math.sin(time*.31+seed)*.07;
  }
  moveEscortInstances();
  if(rallyProps)rallyProps.position.set(run.x*.27,0,lead-2.5);
 }
 for(const a of pickupActors){
  const picked=run.pickups.find(p=>p.id===a.id)?.collected;
  a.group.visible=!picked;
  a.symbol.rotation.y=time*1.2;
  a.symbol.position.y=2.05+Math.sin(time*2.2+a.id)*.22;
 }
 if(bastilleCrowd){
  bastilleCrowd.visible=run.z>=92;
  const joining=run.joining;
  for(let i=0;i<bastilleActors.length;i++){
   const a=bastilleActors[i],joined=joining&&i<run.joined;
   if(joined){
    a.guy.position.x=run.x*.28+a.x*.6;
    a.guy.position.z=behindNarrator(run.z,run.leaderZ-3-i*.21,6.2);
    a.guy.rotation.y=0;
   }else{
    a.guy.position.z=Math.max(99,a.z-Math.max(0,run.z-92)*.35);
    a.guy.rotation.y=Math.PI;
   }
   walking(a.guy,time,.75);
  }
  if(adverseSymbols&&joining){
   adverseSymbols.position.z=run.z-107; // la nouvelle grande foule suit le héros
  }
 }
 updatePoliceWaves(time);
 animateProjectiles(dt);
 animateAllyAttacks(time);
 markSelection(time);
 for(const f of stageFlags)for(const piece of f.fabric){
  const pos=piece.gm.attributes.position;
  for(let i=0;i<pos.count;i++){
   const x=piece.base[i*3],y=piece.base[i*3+1];
   pos.setZ(i,Math.sin(time*2.7+x*5+piece.phase)*.12*(.65+x*.5));
   pos.setX(i,x);pos.setY(i,y);
  }
  pos.needsUpdate=true;piece.gm.computeVertexNormals();
 }
}
function render(ms){
 if(!renderer)return;
 // Programmer l'image suivante avant les calculs : une exception isolée ne tue
 // plus définitivement la boucle de rendu et toutes les commandes mobiles.
 requestAnimationFrame(render);
 try{
 const dt=Math.min(.12,(ms-previous)/1000||0);previous=ms;
 if(playing&&!paused){
  if(stageInWorld!==run.phase)sceneFor(run.phase);
  const phase=run.phase;
  advance(run,dt,changeDir());
  extendMarchScenery();
  drain();
  if(phase!==run.phase){
   if(run.phase===3){redHeld=false;} // Garder le joystick et les touches pendant la transition.
   sceneFor(run.phase);
   refreshHUD();
  }
 }
 syncInstruction();
 const time=ms/1000;
 if(!speech.hidden){
  const remaining=showSpeechUntil-time;
  if(remaining<=0)speech.hidden=true;
  else speech.style.opacity=String(Math.min(1,remaining/.22));
 }
 animateActors(dt,time);
 if(cameraOrbitLeft>0&&playing){
  const step=Math.min(cameraOrbitLeft,Math.max(.012,dt)*2.6);
  cameraOrbit+=step;cameraOrbitLeft-=step;
  if(cameraOrbitLeft<.004){cameraOrbitLeft=0;cameraOrbit=0;}
 }
 if(hero){
  if(cornerTurn>0)cornerTurn=Math.max(0,cornerTurn-dt);
  const theta=cameraOrbit+(run.phase===1?0:cornerTurn/1.55*(-Math.PI/2));
  const radius=run.phase===1?13:run.phase===2?20:25;
  const height=run.height||0;
  const target=new T.Vector3(run.x,Math.max(1.8,height+1.8),run.z+2);
  const desired=new T.Vector3(run.x+Math.sin(theta)*radius,
   7.8+height*.85,run.z-Math.cos(theta)*radius);
  camera.position.lerp(desired,Math.min(1,Math.max(.012,dt)*3.4));
  camera.lookAt(target);
 }
 const w=canvas.clientWidth,h=canvas.clientHeight;
 if(w>0&&h>0&&(!renderer.domElement.width||Math.abs(camera.aspect-w/h)>.02)){
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 }
 renderer.render(world,camera);
 if(playing&&ms-lastHud>180){lastHud=ms;refreshHUD();}
 if(playing&&run.phase===3&&ms-lastControlDisplay>300){
  lastControlDisplay=ms;
  const input=changeDir(),status=$('controlsStatus');
  status.hidden=false;
  const moving=Math.abs(input.x)+Math.abs(input.y)>.15;
  status.textContent='JEU ACTIF · '+(moving?'DÉPLACEMENT':'MANETTE AU REPOS')+
   ' · position '+run.x.toFixed(1)+' / '+run.z.toFixed(1);
 }
 }catch(error){
  console.error('Camarades — erreur dans la boucle de jeu :',error);
  if(!renderFailureReported){
   renderFailureReported=true;
   const warning=$('renderError');warning.hidden=false;
   warning.textContent='⚠️ Erreur 3D : '+String(error?.message||error).slice(0,130)+'. Les commandes restent actives.';
  }
 }
}

async function loadCharacters(){
 if(!renderer||crowdLoading)return;
 crowdLoading=true;
 $('overlayTitle').textContent='Préparation de la manifestation…';
 $('overlayText').textContent='Chargement de six personnages 3D Kenney CC0, avec de vraies animations de marche.';
 $('start').disabled=true;
 try{
  const loader=new GLTFLoader();
  const loaded=await Promise.all(MODEL_PATHS.map(path=>loader.loadAsync(path)));
  for(const model of loaded){
   if(!model.scene||!model.animations?.some(c=>c.name==='walk'))throw Error('Personnage non animé');
   templates.push(model);
  }
  sceneFor(1);refreshHUD();gameReady=true;
  $('overlayTitle').textContent='Camarades !';
  $('overlayText').textContent='Prends le drapeau, monte sur la statue et crie « Camarades ! ». Récupère ensuite les trois symboles et vise les CRS.';
  $('start').disabled=false;
  send('manifestation:ready');
 }catch(e){
  $('overlayTitle').textContent='Impossible de charger les personnages';
  $('overlayText').textContent='Le jeu n’a pas pu charger les modèles animés. Réessaie avec une connexion stable ; les personnages ne sont pas remplacés par des silhouettes rudimentaires.';
  $('start').hidden=true;$('replay').hidden=false;$('replay').textContent='↻ Recharger';
  $('replay').onclick=()=>location.reload();
  console.error('Chargement des personnages CC0 :',e);
 }
}
bindControls();
if(renderer){requestAnimationFrame(render);loadCharacters();}
