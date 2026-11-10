/* CAMARADES ! — Chemin III, page 59–60, personnages 3D CC0 Kenney.
 * Le plateau seul attribue les points et les sauvegarde, sans doublons.
 */
import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as cloneSkinned} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {newRun,advance,yellow,callFromStatue,clamp,distance,OBJECTIFS,behindNarrator,CRS_WAVES} from './manifestation-core.js';
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
let joy={x:0,y:0},keys=new Set(),pointerId=null,actionTransition=0,showSpeechUntil=0,forwardHeld=false,lastHud=0;
let cameraOrbit=0,cameraOrbitLeft=0;
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
   const shade=[0xd7c7ab,0xe0d4be,0xcabda8,0xeadfc8,0xd4c1a2][idx%5];
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
function statue(root){
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
 protestSign(rallyProps,'NON À LE PEN',-3,-1,2.9);
 protestSign(rallyProps,'LIBERTÉ ÉGALITÉ',3,-3,3.4);
 banner(rallyProps,'TOUS ENSEMBLE',0,-5.3,5.5);
 flag(rallyProps,tricolor?'france':'red',-4,0,-3.0,3.1);
 if(tricolor)flag(rallyProps,'france',4,0,-2.0,2.9);
}


function protestSign(root,text,x,z,width=3.2,paint='#f3e1b9'){
 const pole=mesh(gBox,mat(0x80664b),x,1.35,z,.065,2.65,.065);root.add(pole);
 const board=roundedText(text,width,paint,'#3d493d');
 board.position.set(x,2.8,z);board.rotation.y=Math.PI;root.add(board);
}
function banner(root,text,x,z,width=6.0){
 const fabric=roundedText(text,width,'#fbf1d8','#33453c');
 fabric.rotation.y=Math.PI;fabric.position.set(x,3.3,z);root.add(fabric);
 for(const side of [-1,1])root.add(mesh(gCyl,mat(0x685a48),x+side*width*.5,1.65,z,.035,3.4,.035));
}

function riotOfficer(index){
 // Silhouette 3D dédiée. L'ancien corps Kenney était mis à l'échelle,
 // mais casque et bouclier ne l'étaient pas : ils finissaient sur le torse.
 const actor=new T.Group();
 const navy=mat(0x233449),dark=mat(0x151e29),skin=mat(0xc99b7c);
 addBox(actor,0,1.13,0,.55,.78,.35,0x314861);
 addBox(actor,0,.73,0,.54,.15,.34,0x19283b);
 for(const side of [-1,1]){
  addBox(actor,side*.16,.40,0,.19,.73,.23,0x1d2e43);
  addBox(actor,side*.16,.10,-.08,.23,.19,.38,0x18222b);
  const arm=mesh(gCyl,navy,side*.37,1.15,-.03,.105,.65,.105);
  arm.rotation.z=side*.12;actor.add(arm);
 }
 actor.add(mesh(gSphere,skin,0,1.76,0,.19,.21,.18));
 const helmet=mesh(gSphere,dark,0,1.91,0,.28,.21,.27);
 actor.add(helmet);
 const visor=mesh(gBox,new T.MeshStandardMaterial({color:0x9fb5c4,transparent:true,opacity:.86,roughness:.21}),
  0,1.79,-.245,.39,.20,.045);
 actor.add(visor);
 const shield=mesh(gBox,mat(0x71899a,.16),-.48,1.12,-.41,.78,1.12,.12);
 actor.add(shield);
 const label=roundedText('CRS',.67,'#e1e9ec','#16283e');
 label.rotation.y=Math.PI;label.position.set(-.48,1.18,-.50);actor.add(label);
 const baton=mesh(gCyl,dark,.49,1.10,-.28,.041,.74,.041);
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
   officer.baseX=(i-1.5)*1.45;
   officer.actor.scale.setScalar(1.25);
   officer.actor.position.x=officer.baseX;
   officer.actor.position.z=i%2*.25;
   group.add(officer.actor);actors.push(officer);
  }
  const sign=roundedText('CRS · ♥ ♥ ♥',4.6,'#24405b','#fff3d9');
  sign.rotation.y=Math.PI;sign.position.set(0,3.4,-.10);group.add(sign);
  policeGroups.push({id:wave.id,group,actors,anchor:wave.anchor,sign});
 }
}
function activePoliceWave(id){return policeGroups.find(w=>w.id===id);}
function officerWorldPoint(waveId,officerId){
 const display=activePoliceWave(waveId),officer=display?.actors[officerId];
 if(!officer)return null;
 display.group.updateMatrixWorld(true);
 return officer.actor.localToWorld(new T.Vector3(0,1.42,-.32));
}
function updatePoliceWaves(t){
 if(run.phase!==3)return;
 for(const display of policeGroups){
  const wave=run.crsWaves.find(w=>w.id===display.id);
  if(!wave||wave.status==='waiting'){display.group.visible=false;continue;}
  // La ligne est formée de QUATRE policiers indépendants et ne disparaît pas
  // d'un seul bloc. Un CRS touché laisse ses camarades encore debout.
  display.group.visible=wave.status==='active';
  if(!display.group.visible)continue;
  const approaching=Math.max(0,run.clock-wave.startedAt);
  display.group.position.set(Math.sin(t*.6+wave.id)*.18,0,
   Math.max(run.z+6.3,display.anchor-approaching*4.1));
  const standing=wave.officers.filter(o=>o.status==='standing').length;
  display.sign.visible=standing>0;
  for(let i=0;i<display.actors.length;i++){
   const officer=display.actors[i],state=wave.officers[i];
   officer.actor.visible=state.status==='standing';
   if(!officer.actor.visible)continue;
   // Décalage de pas individuel pour rompre le mouvement en bloc.
   officer.actor.position.x=officer.baseX+Math.sin(t*.83+i*1.7+wave.id)*.22;
   officer.actor.position.z=(i%2)*.25+Math.cos(t*1.2+i*.91)*.16;
   officer.actor.position.y=Math.sin(t*4.5+i*1.8)*.055;
   officer.actor.rotation.y=Math.sin(t*.7+i*1.3)*.13;
  }
 }
}
const heartShape=new T.Shape();
heartShape.moveTo(0,-.23);
heartShape.bezierCurveTo(-.24,-.04,-.46,.21,-.27,.40);
heartShape.bezierCurveTo(-.10,.56,0,.37,0,.31);
heartShape.bezierCurveTo(.05,.47,.19,.53,.30,.36);
heartShape.bezierCurveTo(.47,.16,.24,-.04,0,-.23);
const heartGeometry=new T.ExtrudeGeometry(heartShape,{
 depth:.12,steps:1,bevelEnabled:true,bevelSize:.045,bevelThickness:.04,bevelSegments:1
});
function makeHeart(color=0xff3264,scale=1){
 const shape=new T.Mesh(heartGeometry,new T.MeshBasicMaterial({
  color,side:T.DoubleSide,transparent:true,opacity:1,depthWrite:false
 }));
 shape.scale.setScalar(scale);
 return shape;
}
// Un appui = UN projectile clairement visible, depuis la poitrine du héros
// jusqu'à l'emplacement du CRS visé. Pas de dégâts de groupe.
function sendHearts(waveId,officerId,duration=.82){
 const target=officerWorldPoint(waveId,officerId);
 if(!target||!sceneGroup)return;
 const from=new T.Vector3(run.x,run.height+1.55,run.z+.46);
 const heart=makeHeart(0xff225c,1.45);
 heart.position.copy(from);
 sceneGroup.add(heart);
 heartBursts.push({heart,wave:waveId,officer:officerId,from,elapsed:0,duration});
}
function transformOfficerToHeart(waveId,officerId){
 const display=activePoliceWave(waveId),officer=display?.actors[officerId];
 if(!officer||!sceneGroup)return;
 // L'ancien policier devient un cœur à l'impact : transformation individuelle.
 const at=officerWorldPoint(waveId,officerId);
 if(!at)return;
 officer.actor.visible=false;
 const heart=makeHeart(0xff3b78,.36);
 heart.position.copy(at);
 sceneGroup.add(heart);
 heartAscents.push({heart,x:at.x,y:at.y,z:at.z,elapsed:0,duration:3.1,
  twist:officerId*.79+waveId*.42});
 // Les cœurs tirés sont achevés à l'impact, pas coupés en plein vol.
 const projectile=heartBursts.find(h=>h.wave===waveId&&h.officer===officerId);
 if(projectile)projectile.elapsed=projectile.duration;
}
function animateHearts(dt){
 for(let i=heartBursts.length-1;i>=0;i--){
  const fx=heartBursts[i];fx.elapsed+=dt;
  const p=Math.min(1,fx.elapsed/fx.duration);
  const goal=officerWorldPoint(fx.wave,fx.officer);
  if(goal){
   fx.heart.position.lerpVectors(fx.from,goal,p);
   fx.heart.position.y+=Math.sin(p*Math.PI)*.33;
  }
  fx.heart.quaternion.copy(camera.quaternion); // Cœur toujours visible sur mobile.
  fx.heart.scale.setScalar(1.3+Math.sin(p*Math.PI)*.38);
  fx.heart.material.opacity=p>.88?Math.max(.05,(1-p)/.12):1;
  if(p>=1){
   fx.heart.parent?.remove(fx.heart);fx.heart.material.dispose();
   heartBursts.splice(i,1);
  }
 }
 for(let i=heartAscents.length-1;i>=0;i--){
  const fx=heartAscents[i];fx.elapsed+=dt;
  const p=Math.min(1,fx.elapsed/fx.duration);
  // L'impact gonfle le cœur ; il s'envole ensuite vers le ciel bleu.
  const grow=Math.min(1,fx.elapsed/.34);
  fx.heart.scale.setScalar(.36+2.15*grow);
  fx.heart.position.set(fx.x+Math.sin(fx.elapsed*2.2+fx.twist)*.52,
   fx.y+fx.elapsed*3.2,fx.z+.12*fx.elapsed);
  fx.heart.quaternion.copy(camera.quaternion);
  fx.heart.rotation.z+=Math.sin(fx.elapsed*1.6+fx.twist)*.16;
  fx.heart.material.opacity=p>.72?Math.max(0,(1-p)/.28):1;
  if(p>=1){
   fx.heart.parent?.remove(fx.heart);fx.heart.material.dispose();
   heartAscents.splice(i,1);
  }
 }
}
function sceneFor(phase){
 if(sceneGroup)world.remove(sceneGroup);
 sceneGroup=new T.Group();world.add(sceneGroup);
 stageFlags=[];crowdActors=[];staticFar=[];bastilleCrowd=null;bastilleActors=[];policeGroups=[];heartBursts=[];heartAscents=[];escortInstances=null;rallyProps=null;
 const root=sceneGroup,sky=phase===1?0xb8cdd5:phase===2?0xb8c7d3:0xc3d4d9;
 world.background.setHex(sky);world.fog.color.setHex(sky);
 if(phase===1){
  buildings(root,-23,46,true);statue(root);
  crowdActors=makeCrowd(root,16,-7.5,{spread:4.8});
  distantCrowd(root,-8,24,true);
  crowdSymbols(root,false);
 }else if(phase===2){
  buildings(root,-20,43,true);
  addBox(root,11.63,3.8,11,.1,7,6,0xd5c5a7);
  const school=roundedText('ÉCOLE',2.6);school.position.set(11.54,4.7,11);school.rotation.y=-Math.PI/2;root.add(school);
  // Drapeau planté au niveau de la chaussée, sans l'ancien bloc blanc sous lui.
  flag(root,'france',4.1,0,12,4.4);
  crowdActors=makeCrowd(root,16,-7.5,{spread:4.8});
  distantCrowd(root,-8,24,true);
  crowdSymbols(root,false);
 }else{
  buildings(root,-7,135,true);
  crowdActors=makeCrowd(root,16,-7.5,{spread:4.8});
  distantCrowd(root,-8,24,true);
  crowdSymbols(root,true);
  // The other procession appears TOGETHER, not as early, orphaned banners.
  bastilleCrowd=new T.Group();bastilleCrowd.visible=false;root.add(bastilleCrowd);
  // Même variété de personnages Kenney, mêmes proportions et même densité
  // que les manifestants qui suivent le joueur.
  bastilleActors=makeCrowd(bastilleCrowd,16,102,{spread:4.8});
  banner(bastilleCrowd,'RÉPUBLIQUE — BASTILLE',0,97,7.4);
  protestSign(bastilleCrowd,'NON À LA HAINE',-4,103,3.1);
  flag(bastilleCrowd,'france',3,0,101,3.2);
  const destination=roundedText('BASTILLE',5);destination.position.set(0,5.2,108);bastilleCrowd.add(destination);
  createPoliceWaves(root);
 }
 hero=person(2,{hero:true});root.add(hero);
 if(phase===3)flag(hero,'france',.40,1.05,0,2.6);
 stageInWorld=phase;
}
function messageFeedback(text,duration=2){speech.textContent=text;speech.hidden=false;showSpeechUntil=performance.now()/1000+duration;}
function refreshHUD(){
 const p=run.phase,n=run.steps.length;
 title.textContent=run.finished?'3 / 3 · Réunion des cortèges':p+' / 3 · '+OBJECTIFS[Math.min(2,p-1)];
 label.textContent=p===1?'Place de la République · Paris 2002':p===2?'Devant l’école · Le drapeau':'Boulevard vers Bastille';
 steps.forEach((el,i)=>{el.classList.toggle('done',i<n);el.textContent=i<n?'✓':String(i+1);});
 score.textContent=String(serverSteps.length*10);
 const pct=p===1?(run.statueShouted?100:0):p===2?0:run.cohesion;
 meter.style.width=Math.round(pct)+'%';meterValue.textContent=Math.round(pct)+'%';
 $('meterLabel').textContent=p===1?'APPEL DE LA RÉPUBLIQUE':p===2?'DRAPEAU À RÉCUPÉRER':'COHÉSION DU CORTÈGE';
 if(p===1)hint.textContent=run.climb?'Tu descends chercher le drapeau français devant l’école.':run.statueShouted?'La foule a entendu ton appel. Descente dans un instant.':'Tu es sur la statue : appuie sur « Camarades ! ».';
 else if(p===2)hint.textContent='Va jusqu’au drapeau français devant l’école. JAUNE pour le récupérer.';
 else if(run.z>=99&&run.cohesion<68)hint.textContent='Bastille ! Arrête-toi et maintiens ROUGE pour regrouper le cortège et terminer.';
 else if(run.cohesion<56)hint.textContent='La foule prend du retard ! Arrête-toi, puis maintiens ROUGE pour la rassembler.';
 else{
  const active=run.crsWaves.find(w=>w.status==='active');
  const repelled=run.crsWaves.filter(w=>w.status==='repelled').length;
  if(active)hint.textContent='🚔 CRS '+active.id+'/3 ! ROUGE : un cœur part de toi et frappe un CRS à la fois. Chacun devient un cœur qui s’envole.';
  else if(run.z>=99&&repelled<3)hint.textContent='Il reste des CRS à repousser avec les cœurs : '+repelled+'/3 vagues.';
  else hint.textContent='Vers Bastille : '+Math.min(100,Math.floor(run.z))+'/100 · CRS repoussés : '+repelled+'/3. Arrête-toi et maintiens ROUGE pour rassembler la foule.';
 }
 if(run.finished)hint.textContent='Les cortèges se rencontrent. « — On va où maintenant ? — Par là. »';
 const march=$('advanceBastille');
 if(march){march.hidden=p!==3||!playing;march.textContent='Maintenir pour avancer ▶';}
 const up=playing&&!paused&&p===1&&!run.statueShouted&&!run.climb;
 const panel=$('statueControls');if(panel)panel.hidden=!up;
 if(up){$('statueProgress').textContent='La foule attend ton appel.';$('statueCall').textContent='📣 Crier « Camarades ! »';}
 const policeAlert=$('crsAlert');
 if(policeAlert){
  const currentWave=run.phase===3?run.crsWaves.find(w=>w.status==='active'):null;
  policeAlert.hidden=!currentWave;
  if(currentWave)policeAlert.textContent='🚨 CRS SUR LA CHAUSSÉE · Vague '+currentWave.id+'/3 · '+currentWave.hearts+'/4 CRS transformés en cœurs';
 }
 $('red').classList.toggle('awaiting',up);
 $('red').textContent=p===3?'♥':'●';
 $('red').setAttribute('aria-label',p===3?'Rouge : envoyer des cœurs aux CRS et rassembler la foule':'Rouge : appeler et rassembler');
 const redCaption=$('redLabel');if(redCaption)redCaption.textContent=p===3?'♥ CŒURS / RASSEMBLER':'RASSEMBLER';
 $('yellow').setAttribute('aria-label',p===1?'Jaune : crier Camarades !':p===2?'Jaune : prendre le drapeau français':'Jaune : action');
 const caption=$('yellowLabel');if(caption)caption.textContent=p===1?'CAMARADES !':p===2?'PRENDRE DRAPEAU':'ACTION';
}
const send=(type,extra={})=>{if(embedded)parent.postMessage({type,id:sessionId,...extra},location.origin);};
function drain(){
 for(const e of run.events.splice(0)){
  if(e.type==='progress'){
   if(!serverSteps.includes(e.step)){
    if(!embedded){serverSteps.push(e.step);refreshHUD();}
    send('manifestation:progress',{step:e.step});
   }
   const words=['« Camarades ! » · appel réussi !','Drapeau français récupéré !','Deux cortèges réunis !'];
   messageFeedback(words[e.step-1],1.8);sound(600+80*e.step,.18);
  }
  if(e.type==='summit'){
   messageFeedback('Sur la statue ! Appuie sur « Camarades ! »',2.2);sound(660,.22);
  }
  if(e.type==='shout'){
   voiceCamarades();
  }
  if(e.type==='crs:incoming'){
   messageFeedback('CRS en approche ! ROUGE : vise-les un par un avec des cœurs !',2.2);
   sound(260,.16);
  }
  if(e.type==='heart:fire'){sendHearts(e.wave,e.officer,e.duration);sound(750,.12);}
  if(e.type==='heart:hit'){
   transformOfficerToHeart(e.wave,e.officer);
   messageFeedback('❤️ CRS touché ! '+e.hit+'/4 · Il devient un cœur !',.8);
   sound(960,.13);
  }
  if(e.type==='crs:repelled'){
   const cleared=run.crsWaves.filter(w=>w.status==='repelled').length;
   messageFeedback('❤️ Quatre CRS transformés en cœurs ! Vague '+cleared+' / '+CRS_WAVES.length,2.5);
   sound(830,.18);
  }
  if(e.type==='ground'){
   messageFeedback('De retour au pied des marches.',1.8);
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
 $('start').textContent='Commencer le jeu';run=newRun();sceneFor(run.phase);playing=true;paused=false;actionTransition=0;forwardHeld=false;lastHud=0;cameraOrbit=0;cameraOrbitLeft=0;
 overlay.hidden=true;refreshHUD();lastSound=0;
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
 messageFeedback('— CAMARADES !',1.4);
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
 if(run.phase===1&&run.climbed&&!run.climb){
  // Le joueur déclenche le cri ici ; son événement joue la voix une seule fois.
  if(!run.statueShouted&&callFromStatue(run)){drain();refreshHUD();}
  return;
 }
 if(run.phase===3){
  const active=run.crsWaves.find(w=>w.status==='active');
  messageFeedback(active?'❤️ Un cœur, un CRS : regarde-le s’envoler !':'— Ensemble ! Restez avec moi !',1.0);
 }
 sound(310,.08);
}
function yellowPress(){
 if(!playing||paused||actionTransition>0)return;
 const before=run.phase,result=yellow(run);
 if(result){
  drain();refreshHUD();
  if(before===2){forwardHeld=false;joy={x:0,y:0};keys.clear();redHeld=false;sceneFor(3);messageFeedback('Drapeau récupéré ! Avance avec le joystick ; arrête-toi pour regrouper la foule.',2.8);sound(640,.16);}
 }else if(before===2)messageFeedback('Approche-toi du drapeau français.',1.2);
}
function changeDir(){
 // Independent horizontal and vertical axes.
 const right=Number(keys.has('arrowright')||keys.has('d'));
 const left=Number(keys.has('arrowleft')||keys.has('q')||keys.has('a'));
 const fwd=Number(keys.has('arrowup')||keys.has('z')||keys.has('w'));
 const back=Number(keys.has('arrowdown')||keys.has('s'));
 const manualY=clamp(joy.y+fwd-back,-1,1);
 return {x:-clamp(joy.x+right-left,-1,1),y:clamp(manualY+Number(run.phase===3&&forwardHeld),-1,1),red:redHeld||keys.has('r')};
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
  if(['arrowup','arrowdown','arrowleft','arrowright',' ','enter','r','v','w','a','s','d','z','q'].includes(key))e.preventDefault();
  const has=keys.has(key);keys.add(key);
  if(!has&&(key===' '||key==='enter'))yellowPress();
  if(!has&&key==='r')callCrowd();
  if(!has&&key==='v'&&playing){cameraOrbit=0;cameraOrbitLeft=Math.PI*2;}
 });
 window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
 window.addEventListener('blur',()=>{keys.clear();redHeld=false;forwardHeld=false;red.classList.remove('held');release();});
 $('start').onclick=()=>{if(paused){paused=false;overlay.hidden=true;return;}start();};
 $('replay').onclick=start;
 $('quit').onclick=()=>send('manifestation:close');
 $('back').onclick=()=>send('manifestation:close');
 $('next').onclick=()=>send('manifestation:next');
 $('pause').onclick=pause;
 const march=$('advanceBastille');
 march.addEventListener('pointerdown',e=>{if(run.phase!==3||!playing)return;e.preventDefault();forwardHeld=true;try{march.setPointerCapture(e.pointerId);}catch{}});
 const stopMarch=()=>{forwardHeld=false;};
 for(const event of ['pointerup','pointercancel','lostpointercapture','pointerleave'])march.addEventListener(event,stopMarch);
 march.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&run.phase===3){forwardHeld=true;e.preventDefault();}});
 march.addEventListener('keyup',stopMarch);
 $('turn360').onclick=()=>{if(!playing)return;cameraOrbit=0;cameraOrbitLeft=Math.PI*2;};
 $('statueCall').onclick=callCrowd;
 $('statueDescend').onclick=yellowPress;
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
 if(hero){
  hero.position.set(run.x,run.height||0,run.z);
  const input=changeDir(),moving=Math.abs(input.x)+Math.abs(input.y)>.2&&!paused;
  walking(hero,t,moving?1:.03,run.phase===1&&run.statueShouted&&!run.climb);
  hero.rotation.y=run.facing+cameraOrbit;
 }
 const input=changeDir(),moving=Math.abs(input.x)+Math.abs(input.y)>.18&&!paused;
 const red=redHeld||keys.has('r');
 const lead=run.phase===3?run.leaderZ:run.z-6.8;
 // Les mêmes camarades restent VISIBLES et PHYSIQUEMENT derrière le joueur.
 for(const follower of crowdActors){
  const seed=follower.seed;
  const z=behindNarrator(run.z,lead+(rnd(seed*71+13)-.5)*4.3,4.8);
  const x=clamp(run.x*.27+follower.x*.66,-7.4,7.4);
  follower.guy.position.set(x,0,z);
  follower.guy.rotation.y=Math.sin(t*.31+seed)*.09;
  walking(follower.guy,t,moving?0.9:red?0.8:0.08);
 }
 moveEscortInstances();
 if(rallyProps)rallyProps.position.set(run.x*.27,0,lead-2.5);
 if(bastilleCrowd){
  bastilleCrowd.visible=run.z>=93;
  if(bastilleCrowd.visible)for(const a of bastilleActors){
   a.guy.rotation.y=Math.PI;
   // The other demonstration advances towards the narrator rather than
   // standing motionless in front of an orphaned banner.
   a.guy.position.z=Math.max(96,a.z-Math.max(0,run.z-93)*.38);
   walking(a.guy,t,.66);
  }
 }
 updatePoliceWaves(t);
 animateHearts(dt);

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
 const dt=Math.min(.12,(ms-previous)/1000||0);previous=ms;
 if(playing&&!paused){
  if(stageInWorld!==run.phase)sceneFor(run.phase);
  if(actionTransition>0)actionTransition-=dt;
  const phase=run.phase;advance(run,dt,changeDir());
  drain();
  if(phase!==run.phase){
   if(run.phase===3){forwardHeld=false;joy={x:0,y:0};keys.clear();redHeld=false;}
   sceneFor(run.phase);
   messageFeedback(run.phase===2?'Va chercher le drapeau français !':'Drapeau en main : vers Bastille !',2.3);
   refreshHUD();
  }
 }
 const t=ms/1000;
 if(showSpeechUntil<t)speech.hidden=true;
 animateActors(dt,t);
 // Le bouton 360° montre le cortège en faisant un tour complet du joueur.
 if(cameraOrbitLeft>0&&playing){
  const step=Math.min(cameraOrbitLeft,Math.max(.012,dt)*2.6);
  cameraOrbit+=step;cameraOrbitLeft-=step;
  if(cameraOrbitLeft<.004){cameraOrbitLeft=0;cameraOrbit=0;}
 }
 if(hero){
  const height=run.height||0,theta=cameraOrbit;
  // RECOIL CAMERA : la foule, à 5–15 m derrière le héros, est dans le cadre
  // et pas derrière l'objectif comme dans les versions précédentes.
  const radius=run.phase===1?26:25;
  const target=new T.Vector3(run.x,Math.max(1.8,height+1.7),run.z+1.0);
  const desired=new T.Vector3(run.x+Math.sin(theta)*radius,9.5+height*.85,run.z-Math.cos(theta)*radius);
  camera.position.lerp(desired,Math.min(1,Math.max(.012,dt)*3.4));
  camera.lookAt(target);
 }
 const w=canvas.clientWidth,h=canvas.clientHeight;
 if(w>0&&h>0&&(!renderer.domElement.width||Math.abs(camera.aspect-w/h)>.02)){
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 }
 renderer.render(world,camera);
 if(playing&&ms-lastHud>180){lastHud=ms;refreshHUD();}
 requestAnimationFrame(render);
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
  $('overlayText').textContent='Tu commences sur la statue de la République : crie « Camarades ! », redescends, puis retrouve le drapeau français avec le joystick et JAUNE. Ensuite, mène les manifestants derrière toi vers Bastille. Le bouton ↻ fait tourner la vue à 360°.';
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
