/* Prototype autonome : visite intérieure, puis vue depuis les yeux du détenu.
 * Les bras sont découpés dans le vrai maillage articulé CC0 de Quaternius.
 * Les trois épreuves et leurs règles viennent du jeu existant, sans créditer
 * les points du plateau ni accéder à sa sauvegarde.
 */
import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {loadActorBytes} from './prison-3d-loader.js';
import {createPrisonRoom,CELL,FURNITURE_URL} from './prison-3d-room.js';
import {createPrisonCamera} from './prison-3d-camera.js';
import {createPrisonArms} from './prison-3d-arms.js';
import {createPrisonControls} from './prison-3d-controls.js';
import {renderPixelRatio,windowScale,ropeWorldX,ropeWorldZ,constrainBagX} from './prison-3d-spatial.js';
import {createGame,startGame,continueGame,aimAt,hide,actionDown,actionUp,advance,aligned,
 ropePosition,setWindowAspect,clamp} from './yoyo-core.js';

export {CELL};
export const PROTOTYPE_ASSETS=Object.freeze({
 actor:'danse-quaternius-hero.glb',
 actorLicense:'Quaternius — Universal Base Characters — CC0',
 furniture:FURNITURE_URL,
 furnitureLicense:'Poly Haven — Metal Stool 02 — Ulan Cabanilla — CC0'
});
export const OBJECTIVES=Object.freeze(['Saisir la brosse','Récupérer le tabac','Récupérer le café']);
const $=id=>document.getElementById(id);
const screen=$('world'),status=$('status'),stageText=$('stage'),scoreText=$('score');
const feedback=$('feedback'),guardText=$('guard'),overlay=$('overlay');
const playButton=$('start'),pauseButton=$('pause'),skipButton=$('skip-tour');
const actionButton=$('action'),hideButton=$('hide'),joystick=$('joystick');
const loading=window.Prison3DLoading;
loading?.phase('Préparation de la cellule…',8);
let renderer;
try{
 renderer=new T.WebGLRenderer({canvas:screen,antialias:true,powerPreference:'high-performance'});
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 // The room is static. Its detailed shadow map is refreshed after loading,
 // not recomputed for every frame of the hands on a phone.
 renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
}catch(error){
 loading?.fail('Le navigateur n’a pas pu activer l’affichage 3D. Ferme les autres jeux ouverts, puis réessaie. Tu peux aussi ouvrir ce lien directement dans Chrome.');
 throw error;
}
const room=createPrisonRoom({anisotropy:Math.min(8,renderer.capabilities.getMaxAnisotropy())});
const {scene,rope,packet,floorBrush,heldBrush,floorBrushHalo,windowHalo,brushGripTarget}=room;
const camera=new T.PerspectiveCamera(72,16/9,.025,30);
const eyes=createPrisonCamera(camera,{onTourEnd:enterPlay});
const game=createGame();
const controls=createPrisonControls({surface:screen,joystick,knob:$('joystick-knob'),
 actionButton,hideButton,onActionDown:startAction,onActionUp:stopAction,onPause:togglePause});
let arms=null,assetsReady=false,firstFrame=false,contextLost=false;
let mode='ready',paused=false,reach=0,actionElapsed=0,actionAttempted=false,hookOffset=0;
let pickupTime=-1,transitionDelay=0,transitionCard=null,heldBlend=1;
let width=0,height=0,previous=performance.now();
const reachTarget=new T.Vector3(),pickupTarget=new T.Vector3(),gazeTarget=new T.Vector3(),forward=new T.Vector3(),right=new T.Vector3();
const gripOffset=new T.Vector3(),brushDirection=new T.Vector3(),desiredRotation=new T.Quaternion();
const UP=new T.Vector3(0,1,0);

function text(value){feedback.textContent=value;}
function syncAspect(){setWindowAspect(game,clamp(camera.aspect,.85,2.5));}
function enableControls(){
 const active=firstFrame&&mode==='playing'&&!paused&&!eyes.isTravelling;
 joystick.setAttribute('aria-disabled',String(!active));actionButton.disabled=!active;hideButton.disabled=!active;
 pauseButton.disabled=!firstFrame||mode!=='playing';
 playButton.disabled=!firstFrame;
 skipButton.hidden=mode!=='tour';
}
function setMode(value){mode=value;document.body.dataset.mode=value;enableControls();}
function notify(){
 guardText.textContent=game.guard==='watching'?'LE SURVEILLANT REGARDE':
  game.guard==='approaching'?'Des pas dans le couloir':game.guard==='leaving'?'Les pas s’éloignent':'Couloir calme';
 guardText.dataset.alert=game.guard;
 scoreText.textContent=game.points+' / 30';
 stageText.textContent=mode==='tour'?'Visite de la cellule · 9 m²':mode==='won'?'3 / 3 · Terminé':
  (Math.min(game.part+1,3))+' / 3 · '+(OBJECTIVES[game.part]||'Terminé');
}
function card(title,paragraph,button,action){
 overlay.hidden=false;overlay.querySelector('h2').textContent=title;overlay.querySelector('p').textContent=paragraph;
 const next=overlay.querySelector('button');next.textContent=button;next.onclick=action;
}
function begin(){
 if(!firstFrame||contextLost)return;
 controls.reset();Object.assign(game,createGame());syncAspect();
 paused=false;reach=0;pickupTime=-1;heldBlend=1;transitionDelay=0;transitionCard=null;
 heldBrush.quaternion.identity();renderer.shadowMap.needsUpdate=true;
 overlay.hidden=true;pauseButton.textContent='Pause';
 eyes.startTour();setMode('tour');notify();text('Une visite de la cellule, avant de prendre place.');
}
function enterPlay(){
 startGame(game);syncAspect();controls.reset();setMode('playing');notify();
 text('La brosse est à ta droite. Maintiens Saisir : ton regard et ta main se tournent vers elle.');
 screen.focus({preventScroll:true});
}
function between(){
 controls.reset();setMode('between');
 const part=game.part;
 if(part===1){pickupTime=0;heldBlend=0;renderer.shadowMap.needsUpdate=true;}
 transitionDelay=part===1?.8:.35;
 transitionCard=()=>card(part===1?'La brosse est à toi.':'Le tabac est récupéré.',
  part===1?'Approche-toi de la fenêtre. Avec le manche, tu peux atteindre le fil qui descend du dehors.':
   'Il reste le café. Guide le sac dans une ouverture, et cache-toi quand le surveillant passe.',
  'Continuer',()=>{
   controls.reset();continueGame(game);syncAspect();overlay.hidden=true;setMode('playing');
   text('Maintiens Saisir pour accrocher le fil. Le joystick guide ensuite le sac entre les barreaux.');
  });
}
function won(){
 controls.reset();setMode('won');
 card('Une humanité de l’autre côté',
  'La brosse, le tabac, puis le café. Trois gestes réussis dans la cellule.',
  'Rejouer',begin);
 text('Les trois épreuves sont réussies : 30 / 30.');
}
function caught(){
 controls.reset();actionUp(game);setMode('caught');
 card('Le surveillant t’a surpris','Maintiens Se cacher quand les pas approchent, puis reprends quand le couloir est calme.','Recommencer',begin);
}
function drainEvents(){
 for(const event of game.events.splice(0)){
  if(event.type==='between')between();
  if(event.type==='won')won();
  if(event.type==='caught')caught();
  if(event.type==='hook'){
   hookOffset=ropeWorldX(game,game.hookX)-eyes.player.x;
   text('Le fil est accroché. Maintiens Saisir et guide le sac dans une ouverture avec le joystick.');
  }
  if(event.type==='guard'&&event.state==='approaching')text('Des pas se rapprochent. Maintiens Se cacher.');
  if(event.type==='guard'&&event.state==='away')text('Le couloir est calme. Tu peux reprendre.');
  if(['bar-miss','miss'].includes(event.type))text('Attends que le fil passe devant une ouverture, puis saisis à nouveau.');
  if(event.type==='bar-blocked')text('Le sac bute contre un barreau. Guide-le vers un espace libre.');
  if(event.type==='search-miss')text('Un peu plus près : ta main doit atteindre le manche.');
  if(event.type==='warning')text('Le surveillant regarde : maintiens Se cacher !');
 }
 notify();
}
function startAction(){
 if(mode!=='playing'||paused||eyes.isTravelling)return;
 actionElapsed=0;actionAttempted=false;
}
function stopAction(){actionUp(game);actionElapsed=0;actionAttempted=false;}
function togglePause(){
 if(mode!=='playing')return;
 paused=!paused;controls.reset();pauseButton.textContent=paused?'Reprendre':'Pause';enableControls();
 text(paused?'Le temps est suspendu.':'Le jeu reprend.');
}
playButton.addEventListener('click',begin);$('retry').addEventListener('click',begin);
pauseButton.addEventListener('click',togglePause);
window.addEventListener('keydown',event=>{
 if(!event.defaultPrevented&&paused&&mode==='playing'&&event.code==='KeyP'&&!event.repeat){event.preventDefault();togglePause();}
});
skipButton.addEventListener('click',()=>{if(mode==='tour')eyes.skipTour();});
$('fullscreen').addEventListener('click',async()=>{
 try{
  if(document.fullscreenElement)await document.exitFullscreen();
  else if($('game-shell').requestFullscreen)await $('game-shell').requestFullscreen();
  else text('Pour une vue plus large, tourne le téléphone à l’horizontale.');
 }catch{text('Pour une vue plus large, tourne le téléphone à l’horizontale.');}
});
document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'Réduire':'Plein écran';});
function pauseWhenHidden(){if(mode==='playing'&&!paused)togglePause();}
window.addEventListener('blur',pauseWhenHidden);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseWhenHidden();});
screen.addEventListener('webglcontextlost',event=>{
 event.preventDefault();contextLost=true;controls.reset();
 loading?.fail('L’affichage 3D a été interrompu. Relance la cellule pour reprendre.');
});

async function loadScene(){
 try{
  loading?.phase('Chargement des bras articulés…',18);
  const actorUrl=new URL(PROTOTYPE_ASSETS.actor,document.baseURI);
  const bytes=await loadActorBytes(actorUrl,{onProgress:value=>loading?.phase('Chargement des bras articulés…',value===null?null:18+value*43)});
  const gltf=await new GLTFLoader().parseAsync(bytes,new URL('.',actorUrl).href);
  arms=createPrisonArms(gltf);scene.add(arms.root);
  screen.dataset.rig='quaternius-cc0-first-person-arms';
  loading?.phase('Chargement du mobilier texturé…',63);
  const furnitureUrl=new URL(FURNITURE_URL,document.baseURI);
  const furnitureBytes=await loadActorBytes(furnitureUrl,{onProgress:value=>loading?.phase('Chargement du mobilier texturé…',value===null?null:63+value*29)});
  room.installFurniture(await new GLTFLoader().parseAsync(furnitureBytes,new URL('.',furnitureUrl).href));
  renderer.shadowMap.needsUpdate=true;assetsReady=true;
  loading?.phase('Affichage de la cellule…',96);
 }catch(error){
  loading?.fail('Un élément de la cellule n’a pas pu être chargé. '+String(error.message||error));
  playButton.disabled=true;screen.dataset.rig='missing';
 }
}

function positionProps(){
 rope.position.set(ropeWorldX(game,ropePosition(game)),1.86,ropeWorldZ(game));
 rope.visible=game.part>0&&game.part<3;
 packet.material=game.part===2?room.materials.wood:room.materials.paper;
 floorBrush.visible=game.part===0;
 floorBrushHalo.visible=mode==='playing'&&game.part===0;
 floorBrushHalo.material.color.set(eyes.player.distanceTo(brushGripTarget)<.63?0x9fdbb1:0xe0c290);
 windowHalo.visible=mode==='playing'&&game.part>0&&game.part<3;
 windowHalo.position.set(rope.position.x,1.76,-1.70);
 windowHalo.material.color.set(aligned(game)?0x9fdbb1:0xe0c290);
}
function updateArms(dt,time,holding){
 if(!arms)return;
 const active=mode==='playing'||mode==='between'||mode==='won'||mode==='caught';
 camera.getWorldDirection(forward);right.crossVectors(forward,UP).normalize();
 const hasBrush=game.part>0;
 let target=null;
 if(hasBrush){
  // Palm remains in front of the chest. At the window its X coordinate is
  // shared with the rope, so the rod passes through the same physical gap.
  reachTarget.copy(eyes.player).addScaledVector(forward,.33).addScaledVector(right,.14);
  reachTarget.y=eyes.player.y-.22;
  if(holding&&!game.hidden&&!eyes.isTravelling){reachTarget.x=rope.position.x;reachTarget.z=eyes.player.z-.36;reachTarget.y=1.43;}
  target=reachTarget;
 }else if(holding)target=brushGripTarget;
 const desiredReach=hasBrush?1:holding?1:0;
 reach+=(desiredReach-reach)*(1-Math.exp(-11*dt));
 if(pickupTime>=0&&pickupTime<.7){
  pickupTime+=dt;heldBlend=clamp(pickupTime/.7,0,1);heldBlend=heldBlend*heldBlend*(3-2*heldBlend);
  pickupTarget.copy(reachTarget);reachTarget.lerpVectors(brushGripTarget,pickupTarget,heldBlend);target=reachTarget;
 }
 const aiming=hasBrush&&holding&&!game.hidden&&eyes.player.z<-.60&&(game.hooked||aligned(game));
 if(aiming)brushDirection.copy(reachTarget).sub(rope.position).normalize();
 else brushDirection.copy(UP);
 desiredRotation.setFromUnitVectors(UP,brushDirection);
 if(!aiming)desiredRotation.setFromAxisAngle(UP,Math.PI/2);
 if(aiming){
  // Present the broad brush head edge-on to an opening: its 11.5 cm depth
  // crosses the gap, while its wider 32 cm edge stays vertical.
  const across=UP.clone().addScaledVector(brushDirection,-UP.dot(brushDirection)).normalize();
  const depth=new T.Vector3().crossVectors(across,brushDirection).normalize();
  desiredRotation.setFromRotationMatrix(new T.Matrix4().makeBasis(across,brushDirection,depth));
 }
 heldBrush.quaternion.slerp(desiredRotation,1-Math.exp(-8*dt));
 const handleAxis=UP.clone().applyQuaternion(heldBrush.quaternion);
 arms.update(camera,{dt,time,target,reach,handleAxis,
  gripping:hasBrush||(holding&&arms.grip.distanceTo(brushGripTarget)<.055),visible:active&&!eyes.isTravelling});
 heldBrush.visible=hasBrush&&active&&!eyes.isTravelling;
 if(heldBrush.visible){
  // Attach to the measured palm centre, never to an elbow. The handle stays
  // at its real metre scale during the grip and turns together with the hand.
  gripOffset.set(0,1.16,0).applyQuaternion(heldBrush.quaternion);
  heldBrush.position.copy(arms.grip).sub(gripOffset);
 }
}

function frame(dt,time){
 if(paused){controls.consumeLook();return;}
 const playing=mode==='playing'&&!paused;
 const holding=playing&&controls.state.holding&&!controls.state.hide&&!eyes.isTravelling;
 positionProps();
 let focus=null;
 if(holding){gazeTarget.copy(game.part===0?brushGripTarget:rope.position);if(game.part>0)gazeTarget.y-=.13;focus=gazeTarget;}
 if(mode==='between'&&pickupTime>=0&&pickupTime<.7)focus=brushGripTarget;
 const look=controls.consumeLook();
 if(!paused)eyes.update(dt,{x:playing?controls.state.x:0,y:playing?controls.state.y:0,
  lookX:playing?look.x:0,lookY:playing?look.y:0,hide:playing&&controls.state.hide,focus,
  phase:mode==='between'?Math.max(0,game.part-1):game.part});
 enableControls();
 if(mode==='tour'){
  const progress=eyes.tourProgress;
  $('tour-caption').textContent=progress<.37?'Deux lits. Neuf mètres carrés.':progress<.61?'Un lavabo, une table, quelques affaires.':progress<.83?'Une porte fermée.':'Une fenêtre. Un fil vers les autres.';
 }
 if(playing&&!eyes.isTravelling){
  if(game.part===0)aimAt(game,eyes.player.distanceTo(brushGripTarget)<.63?game.brushX:.12);
  else{
   let x=eyes.player.x+(game.hooked?hookOffset:0);
   if(game.hooked)x=constrainBagX(rope.position.x,x,rope.position.z);
   aimAt(game,.5+x/windowScale(game.aspect));
  }
  if(controls.state.hide)hide(game);
  else game.hidden=false;
  if(holding){
   actionElapsed+=dt;
   if(!actionAttempted&&actionElapsed>=.5){
    const inReach=game.part===0?arms&&arms.grip.distanceTo(brushGripTarget)<.025:eyes.player.z<-.60;
    actionAttempted=true;
    if(inReach){actionDown(game);drainEvents();}
    else text(game.part===0?'Approche-toi un peu du manche avec le joystick, puis saisis à nouveau.':'Approche-toi de la fenêtre avec le joystick.');
   }
  }
  if(!holding){actionUp(game);actionElapsed=0;actionAttempted=false;}
  advance(game,dt);drainEvents();
 }
 positionProps();updateArms(paused?0:dt,time,holding);
 if(transitionCard){transitionDelay-=dt;if(transitionDelay<=0){const show=transitionCard;transitionCard=null;show();}}
}
function render(now){
 if(contextLost)return;
 const dt=Math.min(.05,Math.max(0,(now-previous)/1000));previous=now;
 const w=Math.max(240,screen.clientWidth),h=Math.max(190,screen.clientHeight);
 if(w!==width||h!==height){
  width=w;height=h;renderer.setPixelRatio(renderPixelRatio(w,h,window.devicePixelRatio));renderer.setSize(w,h,false);
  camera.aspect=w/h;camera.fov=w<h?76:68;camera.updateProjectionMatrix();syncAspect();
 }
 try{
  frame(dt,now/1000);renderer.render(scene,camera);
  if(assetsReady&&!firstFrame){
   firstFrame=true;loading?.ready();enableControls();status.textContent='Prêt · visite puis vue immersive';
  }
 }catch(error){
  loading?.fail('L’affichage de la cellule a été interrompu. Relance le chargement.');
  console.error('Cellule immersive :',error);return;
 }
 requestAnimationFrame(render);
}
setMode('ready');notify();loadScene();requestAnimationFrame(render);
