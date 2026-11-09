/* Prototype autonome — La cellule en 3D.
 * Corps articulé : Quaternius Universal Base Characters CC0 (copie locale existante).
 * Les mêmes règles de yo-yo, barreaux, gardien et score proviennent de yoyo-core.js.
 * AUCUN message de crédit n'est envoyé au plateau : ne pas remplacer le jeu validé.
 */
import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {loadActorBytes} from './prison-3d-loader.js';
import {createGame,startGame,continueGame,move,actionDown,actionUp,advance,aligned,
 ropePosition,slitCenters,setWindowAspect,PARTS,clamp} from './yoyo-core.js';

export const PROTOTYPE_ASSETS=Object.freeze({
 actor:'danse-quaternius-hero.glb',
 actorLicense:'Quaternius — Universal Base Characters — CC0',
 environment:'3D géométrique original, éléments recréés à partir des dimensions de la cellule',
 furnitureReference:'Kenney Furniture Kit — CC0 (pour une prochaine passe détaillée)'
});
export const CELL=Object.freeze({width:3,depth:3,height:2.72,area:9});
export const OBJECTIVES=Object.freeze(['Saisir la brosse','Récupérer le tabac','Récupérer le café']);

const $=id=>document.getElementById(id);
const screen=$('world'),status=$('status'),stageText=$('stage'),scoreText=$('score');
const feedback=$('feedback'),guardText=$('guard'),overlay=$('overlay');
const playButton=$('start'),retryButton=$('retry'),pauseButton=$('pause');
const loading=window.Prison3DLoading;
const mobile=window.matchMedia?.('(pointer: coarse)').matches||screen.clientWidth<720;
loading?.phase('Préparation du décor 3D…',8);
let renderer;
try{
 renderer=new T.WebGLRenderer({canvas:screen,antialias:!mobile,powerPreference:mobile?'default':'high-performance'});
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.4;
 renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=T.PCFSoftShadowMap;
}catch(e){
 loading?.fail('Le navigateur n’a pas pu activer l’affichage 3D. Ferme les autres jeux ouverts, puis réessaie. Sur téléphone, tu peux aussi ouvrir ce lien directement dans Chrome.');
 playButton.disabled=true;throw e;
}
let contextLost=false,firstActorFrame=false;
screen.addEventListener('webglcontextlost',e=>{
 e.preventDefault();contextLost=true;
 loading?.fail('L’affichage 3D a été interrompu. Relance la cellule pour reprendre.');
});

const scene=new T.Scene();scene.background=new T.Color(0x626e68);
scene.fog=new T.Fog(0x626e68,10,31);
const camera=new T.PerspectiveCamera(55,16/9,.05,40);
const hemi=new T.HemisphereLight(0xd9edee,0x46544e,2.5);scene.add(hemi);
const sun=new T.DirectionalLight(0xf4f3e3,3.1);sun.position.set(-.4,4,-4);
sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-5;sun.shadow.camera.right=5;
sun.shadow.camera.top=6;sun.shadow.camera.bottom=-5;
sun.shadow.bias=-.0008;scene.add(sun);
const bulb=new T.PointLight(0xe4c891,1.3,5);bulb.position.set(.15,2.5,.6);scene.add(bulb);
const glow=new T.PointLight(0x93b2c3,.8,6);glow.position.set(0,2.5,-2);scene.add(glow);

const skin=new T.MeshStandardMaterial({color:0xb58b6f,roughness:.82});
const concrete=new T.MeshStandardMaterial({color:0xb9b6a5,roughness:.96});
const steel=new T.MeshStandardMaterial({color:0x4a5552,roughness:.56,metalness:.66});
const black=new T.MeshStandardMaterial({color:0x1e2a2a,roughness:.9});
const wood=new T.MeshStandardMaterial({color:0x766350,roughness:.88});
const linen=new T.MeshStandardMaterial({color:0x97a096,roughness:1});
const bedding=new T.MeshStandardMaterial({color:0x626f6b,roughness:1});
const ceramic=new T.MeshStandardMaterial({color:0xd7d7c8,roughness:.37});
const rust=new T.MeshStandardMaterial({color:0x685440,roughness:.91});
const parchment=new T.MeshStandardMaterial({color:0xd6c1a4,roughness:.98});
const plastic=new T.MeshStandardMaterial({color:0xf1f1e5,roughness:.4,transparent:true,opacity:.62,side:T.DoubleSide});

function mesh(geo,mat,parent=scene){
 const m=new T.Mesh(geo,mat);parent.add(m);
 m.castShadow=true;m.receiveShadow=true;return m;
}
function cub(w,h,d,x,y,z,mat=concrete,parent=scene){
 const m=mesh(new T.BoxGeometry(w,h,d),mat,parent);m.position.set(x,y,z);return m;
}
function ball(rx,ry,rz,x,y,z,mat=linen,parent=scene){
 const m=mesh(new T.SphereGeometry(1,14,10),mat,parent);
 m.scale.set(rx,ry,rz);m.position.set(x,y,z);return m;
}
function cylinder(a,b,r,mat=steel,parent=scene,rTop=r){
 const p=new T.Vector3(...a),q=new T.Vector3(...b),dir=q.clone().sub(p);
 const m=mesh(new T.CylinderGeometry(rTop,r,dir.length(),10),mat,parent);
 m.position.copy(p.add(q).multiplyScalar(.5));
 m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());
 return m;
}
function line(a,b,r,mat=steel,parent=scene){
 return cylinder(a,b,r,mat,parent);
}
const floor=cub(3,.16,3,0,-.08,0,new T.MeshStandardMaterial({color:0x66675e,roughness:1}));
floor.name='SolCellule9m2';
cub(.16,CELL.height,3,-1.58,CELL.height/2,0,concrete).name='MurGauche';
cub(.16,CELL.height,3,1.58,CELL.height/2,0,concrete).name='MurDroit';
// The rear wall has a real opening: no painted window or false occlusion.
cub(3,.93,.16,0,.465,-1.55,concrete);
cub(3,.33,.16,0,2.55,-1.55,concrete);
for(const x of [-1.16,1.16])cub(.68,1.35,.16,x,1.60,-1.55,concrete);
cub(1.72,.09,.31,0,.97,-1.53,ceramic).name='AppuiFenetre';
cub(3,.10,3,0,2.74,0,new T.MeshStandardMaterial({color:0x8a8e83,roughness:1})).name='Plafond';
// Camera-facing wall intentionally omitted for the cutaway third-person view.
// The closed door and its hardware belong to that same cutaway wall.
const frontWall=new T.Group();frontWall.name='ParoiAvantVueEnCoupe';scene.add(frontWall);
const door=cub(.83,2.23,.07,.83,1.13,1.47,steel,frontWall);door.name='PorteCellule';
cub(.39,.19,.045,.82,1.47,1.42,black,frontWall);
cylinder([1.20,1.05,1.37],[1.35,1.05,1.37],.018,ceramic,frontWall);

// Visible iron bars, measured openings of 21 cm and narrow bag width.
for(let i=-3;i<=3;i++)cylinder([i*.21,1.03,-1.665],[i*.21,2.28,-1.665],.018,steel).name='Barreau'+(i+4);
for(const y of [1.08,2.24])cylinder([-.77,y,-1.67],[.77,y,-1.67],.014,steel);

// Two bunk beds, mattress, pillows, blanket, welded frame and ladder.
for(const y of [.40,1.42]){
 cub(.87,.07,1.87,-1.02,y,.02,steel);
 cub(.81,.15,1.79,-1.02,y+.12,.02,parchment);
 cub(.83,.05,1.34,-1.02,y+.225,.19,bedding);
 ball(.32,.068,.22,-1.02,y+.23,-.71,linen);
 for(const x of [-1.47,-.57]){
  line([x,y-.03,-.97],[x,y+.35,-.97],.018);
  line([x,y-.03,.94],[x,y+.35,.94],.018);
 }
 for(let j=0;j<5;j++)line([-1.38,y+.244,-.20+j*.18],[-.65,y+.244,-.20+j*.18],.003,linen);
}
for(const x of [-1.44,-.60])for(const z of [-1.02,.96])
 line([x,0,z],[x,1.82,z],.028,steel);
for(let i=0;i<5;i++)line([-.56,.29+i*.27,.69],[-.56,.29+i*.27,.96],.017,steel);

// Fixed table and stool, steel cupboard and personal belongings.
cub(.82,.065,.60,.82,.77,-.56,wood).name='TableCellule';
for(const x of [.45,1.19])for(const z of [-.82,-.30])line([x,.03,z],[x,.73,z],.026);
cub(.34,.06,.34,.45,.40,.37,wood).name='Tabouret';
for(const x of [.31,.59])for(const z of [.24,.50])line([x,.03,z],[x,.38,z],.021);
cub(.55,1.68,.47,1.13,.84,.98,steel).name='Armoire';
cub(.45,.06,.035,1.13,1.68,.72,black);
line([.96,.86,.71],[.96,1.10,.71],.007,ceramic);
cub(.26,.025,.34,.82,.84,-.58,parchment).name='Carnet';
cub(.04,.011,.20,.94,.864,-.58,black).name='Stylo';
// Real three-dimensional porcelain, not an illustrated toilet.
cylinder([1.20,.08,.09],[1.20,.35,.09],.185,ceramic).name='PiedWC';
const bowl=mesh(new T.CylinderGeometry(.23,.17,.21,28,1,true),ceramic);
bowl.position.set(1.2,.43,.09);bowl.name='WC';bowl.material.side=T.DoubleSide;
const rim=mesh(new T.TorusGeometry(.185,.025,9,28),ceramic);
rim.rotation.x=Math.PI/2;rim.position.set(1.20,.56,.09);
cub(.48,.52,.18,1.22,.91,-.14,ceramic).name='ReservoirWC';
const basin=mesh(new T.SphereGeometry(1,24,12,0,Math.PI*2,Math.PI*.50,Math.PI*.46),ceramic);
basin.scale.set(.32,.18,.25);basin.position.set(1.20,1.01,-.88);
basin.name='Lavabo';
cylinder([1.20,.90,-.88],[1.20,1.10,-.88],.017,steel);
cylinder([1.20,1.10,-.88],[1.12,1.10,-.88],.013,steel);
cub(.35,.48,.02,1.48,1.53,-.84,new T.MeshStandardMaterial({color:0xa4b6bc,metalness:.4,roughness:.2})).name='Miroir';
cylinder([.05,2.61,.44],[.05,2.49,.44],.018,steel);
ball(.17,.13,.17,.05,2.43,.44,ceramic).name='Ampoule';

// Rope, wire coat hanger and transparent bag have real depth.
const rope=new T.Group();scene.add(rope);rope.name='YoYoAuDrap';
const cloth=new T.MeshStandardMaterial({color:0xb2ab98,roughness:1});
for(let k=0;k<18;k++)cylinder([Math.sin(k*.65)*.008,k*.105,0],
 [Math.sin((k+1)*.65)*.008,(k+1)*.105,0],.012,cloth,rope);
cylinder([-.16,-.10,0],[.16,-.10,0],.005,steel,rope);
line([-.16,-.10,0],[0,-.26,0],.006,steel,rope);
line([.16,-.10,0],[0,-.26,0],.006,steel,rope);
const bag=mesh(new T.CylinderGeometry(.05,.07,.24,12,1,true),plastic,rope);
bag.position.set(0,-.41,0);bag.name='SacPlastique';
for(const x of [-.044,.044])cylinder([x,-.31,0],[x,-.20,0],.003,plastic,rope);
const packet=cub(.085,.045,.07,0,-.45,0,parchment,rope);
packet.name='ContenuTabacOuCafe';
rope.position.set(-.14,.48,-1.91);

// Real floor brush: separate bristles, handle and back.
function brush(parent=scene){
 const group=new T.Group();group.name='Brosse';parent.add(group);
 const handle=wood,bristles=new T.MeshStandardMaterial({color:0x5a4938,roughness:1});
 cylinder([0,.12,0],[0,.92,0],.018,handle,group);
 cub(.35,.09,.12,0,.09,0,wood,group);
 for(let i=0;i<19;i++)for(const z of [-.042,.0,.042])
  line([-.16+i*.017,.07,z],[-.16+i*.017,.017,z],.004,bristles,group);
 return group;
}
const floorBrush=brush();floorBrush.position.set(.57,0,.28);
const floorBrushHalo=mesh(new T.TorusGeometry(.27,.013,6,42),new T.MeshBasicMaterial({color:0xa4e1a3}));
floorBrushHalo.position.set(.57,.035,.28);floorBrushHalo.rotation.x=Math.PI/2;
const windowHalo=mesh(new T.TorusGeometry(.105,.012,6,32),new T.MeshBasicMaterial({color:0xf2e3a3}));
windowHalo.position.set(0,1.49,-1.51);

// Actual CC0 rigged male, no animated billboards or fake screen hands.
let actor=null,heldBrush=null,modelError='';
const X=new T.Vector3(1,0,0),Y=new T.Vector3(0,1,0),Z=new T.Vector3(0,0,1);
function bend(bone,axis,angle){
 if(!bone||!angle||!bone.parent)return;
 bone.parent.updateMatrixWorld(true);
 const q=bone.parent.getWorldQuaternion(new T.Quaternion());
 const local=axis.clone().applyQuaternion(q.invert()).normalize();
 bone.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(local,angle));
 bone.updateMatrixWorld(true);
}
function skinColors(body){
 const source=body.geometry.getAttribute('position');
 if(!source||source.count<3500)return;
 body.geometry=body.geometry.clone();
 const a=body.geometry.getAttribute('position'),rgb=new Float32Array(a.count*3);
 const face=new T.Color(0xbc9276),top=new T.Color(0x6f7378),
       trousers=new T.Color(0x3b4a4d),shoe=new T.Color(0x353733);
 for(let i=0;i<a.count;i++){
  const y=a.getY(i),x=Math.abs(a.getX(i));
  const col=y<.16?shoe:y<1.0?trousers:y<1.53&&x<.53?top:face;
  rgb[i*3]=col.r;rgb[i*3+1]=col.g;rgb[i*3+2]=col.b;
 }
 body.geometry.setAttribute('color',new T.BufferAttribute(rgb,3));
 body.material=new T.MeshStandardMaterial({vertexColors:true,roughness:.95});
}
async function loadActor(){
 try{
  loading?.phase('Chargement du personnage…',18);
  const modelUrl=new URL(PROTOTYPE_ASSETS.actor,document.baseURI);
  const bytes=await loadActorBytes(modelUrl,{onProgress:value=>{
   const percent=value===null?null:Math.round(value*100);
   loading?.phase('Chargement du personnage'+(percent===null?'…':' · '+percent+' %'),percent===null?null:18+value*70);
  }});
  loading?.phase('Préparation du corps articulé…',90);
  const gltf=await new GLTFLoader().parseAsync(bytes,new URL('.',modelUrl).href);
  const root=gltf.scene;
  const needed=['pelvis','spine_02','upperarm_l','lowerarm_l','upperarm_r','lowerarm_r','thigh_l','thigh_r','calf_l','calf_r','Head'];
  const bones={},rest={};
  for(const name of needed){
   const node=root.getObjectByName(name);
   if(!node?.isBone)throw new Error('Os du corps non trouvé : '+name);
   bones[name]=node;rest[name]=node.quaternion.clone();
  }
  let skins=0;
  root.traverse(o=>{
   if(o.isSkinnedMesh){skins++;skinColors(o);}
   if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}
  });
  if(!skins)throw new Error('Le modèle ne contient pas de squelette animé.');
  root.scale.setScalar(1.0);root.rotation.y=Math.PI;
  root.position.set(0,0,.60);
  root.name='PrisonnierQuaternius65Os';
  scene.add(root);
  heldBrush=brush(bones.lowerarm_r);
  heldBrush.position.set(.02,-.24,-.05);
  heldBrush.scale.setScalar(.47);
  heldBrush.rotation.set(-.42,0,.18);
  heldBrush.visible=false;
  actor={root,bones,rest,skins};
  screen.dataset.rig='quaternius-cc0-humanoid';
  loading?.phase('Affichage de la cellule…',96);
 }catch(e){
  modelError=String(e.message||e);
  loading?.fail('Le personnage n’a pas pu être chargé. '+modelError);
  screen.dataset.rig='missing';playButton.disabled=true;
 }
}

const game=createGame(),keys=new Set();
let mode='ready',paused=false,holding=false,startedAt=performance.now(),last=startedAt;
let interaction=0,run=0,wins=0;
const labels=['Brosse','Tabac','Café'];
function text(v){feedback.textContent=v;}
function notify(){
 const info=game.guard==='watching'?'LE SURVEILLANT REGARDE':
  game.guard==='approaching'?'Des pas dans le couloir':
  game.guard==='leaving'?'Les pas s’éloignent':'Couloir calme';
 guardText.textContent=info;
 guardText.dataset.alert=game.guard;
 scoreText.textContent=game.points+' / 30';
 stageText.textContent=mode==='won'?'3 / 3 · Terminé':
  (Math.min(game.part+1,3))+' / 3 · '+(OBJECTIVES[game.part]||'Terminé');
}
function card(title,paragraph,button,action){
 overlay.hidden=false;overlay.querySelector('h2').textContent=title;
 overlay.querySelector('p').textContent=paragraph;
 const b=overlay.querySelector('button');b.textContent=button;b.onclick=action;
}
function begin(){
 if(!actor||!firstActorFrame||contextLost)return;
 startGame(game);mode='playing';paused=false;holding=false;interaction=0;
 overlay.hidden=true;pauseButton.textContent='Pause';
 text('Déplace le personnage jusqu’à la brosse. Quand le cercle est vert, attrape-la.');
 notify();
}
function between(){
 mode='between';actionUp(game);holding=false;
 const part=game.part;
 card(part===1?'La brosse est à toi.':'Le tabac est récupéré.',
  part===1?'La fenêtre et les barreaux sont maintenant ton terrain de jeu. Une corde descend du dehors.':
   'Le même geste permet maintenant de recevoir le café. Attention aux pas du surveillant.',
  'Continuer →',()=>{
   continueGame(game);mode='playing';overlay.hidden=true;
   text('Attrape le fil avec la brosse, déplace-toi vers un interstice, puis maintiens Saisir.');
  });
}
function won(){
 mode='won';holding=false;wins++;
 card('Une humanité de l’autre côté',
  'La brosse, le tabac, puis le café. Trois gestes réussis dans la cellule, sans quitter ce lieu.',
  'Rejouer les trois épreuves',begin);
 text('Prototype gagné : 30/30. Aucun point n’est transmis au plateau public.');
}
function caught(){
 mode='caught';holding=false;actionUp(game);
 card('Le surveillant t’a surpris',
  'Tu peux recommencer sans modifier la sauvegarde du livre.',
  'Recommencer',begin);
}
function drainEvents(){
 for(const e of game.events.splice(0)){
  if(e.type==='part')text('Épreuve réussie : '+e.part+' / 3 · '+e.points+' points (prototype).');
  if(e.type==='between')between();
  if(e.type==='won')won();
  if(e.type==='caught')caught();
  if(e.type==='guard'){
   if(e.state==='approaching')text('Écoute : le surveillant revient. Accroupis-toi pour te cacher.');
   if(e.state==='away')text('Le couloir est calme, tu peux reprendre.');
  }
  if(e.type==='hook')text('Le fil est accroché. Guide le sac ENTRE deux barreaux et maintiens Saisir.');
  if(e.type==='bar-miss'||e.type==='miss')text('Le fil est derrière un barreau : essaie à l’ouverture suivante.');
  if(e.type==='bar-blocked')text('Le sac touche le métal. Déplace-le vers un espace entre deux barreaux.');
  if(e.type==='search-miss')text('Rapproche-toi de la brosse avant de saisir.');
  if(e.type==='warning')text('Le surveillant regarde : cache-toi !');
 }
 notify();
}
function startAction(){
 if(mode!=='playing'||paused)return;
 interaction=Math.min(1,interaction+.28);
 holding=true;actionDown(game);drainEvents();
}
function stopAction(){holding=false;actionUp(game);}
function setKey(key,down){if(down)keys.add(key);else keys.delete(key);if(key==='action'&&down)startAction();if(key==='action'&&!down)stopAction();}
const bindings=[['left','left'],['right','right'],['hide','hide'],['action','action']];
for(const [id,name]of bindings){
 const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);setKey(name,true);});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(ev,()=>setKey(name,false));
}
window.addEventListener('keydown',e=>{
 if(['ArrowLeft','KeyA','ArrowRight','KeyD','ArrowDown','KeyS','Space'].includes(e.code))e.preventDefault();
 const k={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',
  ArrowDown:'hide',KeyS:'hide',Space:'action'}[e.code];
 if(k&&!keys.has(k))setKey(k,true);
 if(e.code==='KeyP'&&!e.repeat)togglePause();
});
window.addEventListener('keyup',e=>{
 const k={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',
  ArrowDown:'hide',KeyS:'hide',Space:'action'}[e.code];
 if(k)setKey(k,false);
});
function togglePause(){
 if(mode!=='playing')return;paused=!paused;
 pauseButton.textContent=paused?'Reprendre':'Pause';
 if(paused)stopAction();
 text(paused?'Le temps est suspendu.':'Le jeu reprend.');
}
playButton.addEventListener('click',begin);
retryButton.addEventListener('click',begin);
pauseButton.addEventListener('click',togglePause);
window.addEventListener('blur',()=>{keys.clear();stopAction();if(mode==='playing')paused=true;});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='playing'){keys.clear();stopAction();paused=true;}});

function pose(t,dt){
 if(!actor)return;
 const {root,bones,rest}=actor;
 for(const [name,q]of Object.entries(rest))bones[name].quaternion.copy(q);
 const moving=keys.has('left')||keys.has('right');
 const step=moving?Math.sin(t*9)*.23:0;
 const crouch=game.hidden||keys.has('hide');
 const reach=mode==='playing'?(holding||interaction>0?.83:.13):.15;
 const windowReach=game.part>0&&mode==='playing';
 root.position.set((game.aim-.5)*2.0,crouch?-.38:0,.60);
 root.rotation.y=Math.PI+.06*Math.sin(t*.8);
 root.position.y+=moving&&!crouch?Math.abs(Math.sin(t*9))*.024:0;
 root.updateMatrixWorld(true);
 bend(bones.upperarm_l,Z,1.40-.18*reach);
 bend(bones.upperarm_r,Z,-1.4+.84*reach);
 bend(bones.upperarm_r,X,-.12-(windowReach?.64:.32)*reach);
 bend(bones.lowerarm_r,X,-.20-.65*reach);
 bend(bones.upperarm_l,X,-.14);
 bend(bones.lowerarm_l,X,-.14);
 bend(bones.spine_02,X,crouch?.20:windowReach?.06:0);
 bend(bones.thigh_l,X,step+(crouch?.62:0));
 bend(bones.thigh_r,X,-step+(crouch?.62:0));
 bend(bones.calf_l,X,Math.max(0,-step)*.7-(crouch?.55:0));
 bend(bones.calf_r,X,Math.max(0,step)*.7-(crouch?.55:0));
 bend(bones.Head,Z,.02*Math.sin(t*1.1));
 root.updateMatrixWorld(true);
 heldBrush.visible=game.part>0;
 interaction=Math.max(0,interaction-dt*.9);
}
function updateCutaway(){
 // From the corridor, omit the entire near wall, including its closed door.
 // From inside, retain the door in its original position and closed orientation.
 frontWall.visible=camera.position.z<1.43;
}
function setCamera(){
 const target=actor?actor.root.position.x:0;
 const wide=screen.clientWidth<720,offset=wide?.77:.93;
 camera.position.set(target+offset,1.78,wide?3.17:3.32);
 camera.lookAt(target-.10,1.37,-1.36);
 updateCutaway();
}
function positionScene(dt,time){
 if(mode==='playing'&&!paused){
  const dir=(keys.has('left')?-1:0)+(keys.has('right')?1:0);
  move(game,dir,keys.has('hide')?1:0,dt);
  advance(game,dt);
  drainEvents();
 }
 const t=time/1000;
 pose(t,dt);setCamera();
 const aspect=camera.aspect,screenRange=2*.88*Math.tan(63*Math.PI/360)*Math.max(.85,aspect);
 const normalized=ropePosition(game);
 const x=(normalized-.5)*screenRange;
 rope.position.x=x;
 rope.position.z=-1.91+Math.min(1,game.pull||0)*.72;
 rope.position.y=.48-Math.min(1,game.pull||0)*.25;
 packet.material=game.part===2?wood:parchment;
 rope.visible=game.part>0;
 floorBrush.visible=game.part===0;
 floorBrushHalo.visible=mode==='playing'&&game.part===0;
 floorBrushHalo.material.color.set(aligned(game)?0x75eaa0:0xe9d18c);
 windowHalo.visible=mode==='playing'&&game.part>0;
 windowHalo.position.x=x;
 windowHalo.material.color.set(aligned(game)?0x75eaa0:0xe9d18c);
 glow.intensity=.75+(game.part>=2?.5:0);
 scene.background.set(game.part>=2?0x869e91:game.part===1?0x71827b:0x626e68);
}
let previous=performance.now(),width=0,height=0;
function render(now){
 if(contextLost)return;
 const dt=Math.min(.08,(now-previous)/1000);previous=now;
 const w=Math.max(320,screen.clientWidth),h=Math.max(190,screen.clientHeight);
 if(w!==width||h!==height){
  width=w;height=h;
  renderer.setSize(w,h,false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,mobile?1:1.5));
  camera.aspect=w/h;camera.updateProjectionMatrix();
  setWindowAspect(game,camera.aspect);
 }
 try{
  positionScene(dt,now);
  renderer.render(scene,camera);
  if(actor&&!firstActorFrame){
   firstActorFrame=true;
   loading?.ready();
  }
 }catch(error){
  loading?.fail('L’affichage de la cellule a été interrompu. Relance le chargement.');
  console.error('Cellule 3D :',error);return;
 }
 requestAnimationFrame(render);
}
notify();loadActor();requestAnimationFrame(render);
