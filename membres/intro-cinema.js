import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {dressAhmed,createMarianne} from './intro-wardrobe.js';
import {INTRO_FILM,filmPosition,createFilmPlayback} from './intro-film.js';
import {planSpeechBubble} from './intro-bubbles.js';
import {dojoBlocking,dojoDirectedCamera,DOJO_DURATIONS} from './intro-dojo-director.js';
import {createDojoWardrobe} from './intro-dojo-wardrobe.js';
import {mountDojoDemo,dojoDemoReservedRect} from './intro-dojo-ui.js';
import {mountIntroArrival,arrivalFrame} from './intro-arrival.js';
import {createIntroSound} from './intro-sound.js';
import {frenchVoice,createLocalVoices} from './salon-voice.js?v=salon41';
import {unzipSync,strFromU8} from 'three/examples/jsm/libs/fflate.module.js';

const $=id=>document.getElementById(id);
const salonEntryMode=new URLSearchParams(location.search).get('salon')==='1';
const originalIntroKey='croisee-salon-introduction-originale-v34';
if(salonEntryMode)document.documentElement.classList.add('salon-entry-mode');
function finishSalonEntry(){
 if(!salonEntryMode)return;
 const returnTo=new URLSearchParams(location.search).get('retour');
 const destinations={
  ahmed:['croisee-ahmed-introduction-originale-v34','/ahmed-marie.html?intro=terminee#ahmed-numerique'],
  invite:['croisee-invite-introduction-originale-v34','/salon-invite.html?intro=terminee']
 };
 const chosen=destinations[returnTo]||[originalIntroKey,'/membre.html?intro=terminee#salon'];
 try{sessionStorage.setItem(chosen[0],'done');}catch{}
 const action=new URLSearchParams(location.search).get('ouvrir');
 const suffix=returnTo==='invite'&&['inviter','appeler'].includes(action)?'?ouvrir='+action:'';
 location.replace(chosen[1]+suffix);
}

const canvasHost=$('stage'),bubble=$('bubble'),status=$('status');
const introSound=createIntroSound({onProblem:message=>remember('Son de la cinématique',message)});
const dojoDemo=mountDojoDemo(canvasHost);
const promotionMode=new URLSearchParams(location.search).get('mode')==='promotion';
if(promotionMode)document.body.classList.add('promotion');
const arrivalPlayer=mountIntroArrival({host:canvasHost,frame:$('garden-frame'),bubble,onProblem:message=>remember('Arrivée',message),onComplete:()=>{introSound.stop();finishSalonEntry();}});
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.35));
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
$('scene')?.remove();
const canvas=renderer.domElement;canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;';
canvasHost.prepend(canvas);
const scene=new T.Scene();scene.background=new T.Color(0xffffff);
scene.add(new T.HemisphereLight(0xffffff,0xc0baac,2.25));
const sun=new T.DirectionalLight(0xffffff,2.7);sun.position.set(-3,8,-3);sun.castShadow=true;scene.add(sun);
const fill=new T.DirectionalLight(0xffffff,.85);fill.position.set(3,4,2);scene.add(fill);
const camera=new T.PerspectiveCamera(46,1,.07,120),clock=new T.Clock();
const loader=new GLTFLoader();
let room,dojo,people=[],chairs=[],television,stage='white',step=-1,autoplay=false,autoTimer=0,alias='Voyageur',authorized=false,ready=false,angle=Math.PI,targetAngle=Math.PI,radius=3.7,joystick={x:0,y:0},drag=null,started=false,gardenLoaded=false;
const problems=[],storageKey='maison-des-rencontres-prologue-original-v3';
try{const prior=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(prior))problems.push(...prior.slice(-100))}catch{}
function remember(type,message){
 problems.push({date:new Date().toISOString(),type,step,stage,message:String(message).slice(0,3000)});
 try{localStorage.setItem(storageKey,JSON.stringify(problems.slice(-100)))}catch{}
}
window.addEventListener('error',e=>remember('Erreur JavaScript',e.message||'Erreur'));
window.addEventListener('unhandledrejection',e=>remember('Erreur asynchrone',e.reason?.message||String(e.reason)));
// Durations are measured from the first shot, not from the variable loading screen.
const lines=[
 {
  "id": "ouverture",
  "speaker": null,
  "text": "",
  "scene": "white",
  "shot": "discovery",
  "ms": 6200,
  "move": "orbit",
  "gesture": "listen",
  "seated": false,
  "furniture": "none"
 },
 {
  "id": "question-initiale",
  "speaker": "m",
  "text": "Qu’est-ce qu’une rencontre ? Qu’est-ce que véritablement l’autre ?",
  "scene": "white",
  "shot": "approach",
  "ms": 7800,
  "move": "push",
  "gesture": "question",
  "seated": false,
  "furniture": "none"
 },
 {
  "id": "question",
  "speaker": "m",
  "text": "Est-ce simplement quelqu’un qui me ressemble ?",
  "scene": "white",
  "shot": "reverse",
  "ms": 8000,
  "move": "drift",
  "gesture": "question",
  "seated": false,
  "furniture": "none"
 },
 {
  "id": "miroir",
  "speaker": "f",
  "text": "Une rencontre n’est pas un miroir… C’est un espace où l’on se dépose, sans masque, ou presque.",
  "scene": "white",
  "shot": "reverse",
  "ms": 8000,
  "move": "drift",
  "gesture": "explain",
  "seated": false,
  "furniture": "none"
 },
 {
  "id": "invitation",
  "speaker": "m",
  "text": "Prends place.",
  "scene": "white",
  "shot": "arrival",
  "ms": 11200,
  "move": "orbit",
  "gesture": "invite",
  "seated": false,
  "invitation": true,
  "furniture": "reveal"
 },
 {
  "id": "bruit",
  "speaker": "f",
  "text": "Ici, on laisse dehors le bruit, les rôles, les étiquettes…",
  "scene": "white",
  "shot": "two",
  "ms": 8000,
  "move": "dolly",
  "gesture": "explain",
  "seated": true,
  "furniture": "chairs"
 },
 {
  "id": "masques",
  "speaker": "m",
  "text": "Un monde de masques. Un monde d’illusions.",
  "scene": "white",
  "shot": "close",
  "ms": 10000,
  "move": "push",
  "gesture": "reflect",
  "seated": true,
  "furniture": "chairs"
 },
 {
  "id": "verite",
  "speaker": "f",
  "text": "Et pourtant… c’est aussi un lieu de vérité, de jeux, de désir, de création…",
  "scene": "white",
  "shot": "close",
  "ms": 10000,
  "move": "drift",
  "gesture": "explain",
  "seated": true,
  "furniture": "chairs"
 },
 {
  "id": "soi",
  "speaker": "m",
  "text": "Ici, on peut être tour à tour lecteur, acteur, voyageur… ou simplement soi.",
  "scene": "white",
  "shot": "medium",
  "ms": 10000,
  "move": "push",
  "gesture": "open",
  "seated": true,
  "furniture": "chairs"
 },
 {
  "id": "libre",
  "speaker": "f",
  "text": "Tu es libre d’explorer, de construire, de rencontrer, d’imaginer…",
  "scene": "white",
  "shot": "close",
  "ms": 8000,
  "move": "drift",
  "gesture": "invite",
  "seated": true,
  "furniture": "chairs"
 },
 {
  "id": "ensemble",
  "speaker": "m",
  "text": "Alors…",
  "secondary": {
   "speaker": "f",
   "text": "…on commence ?",
   "at": 4200
  },
  "scene": "white",
  "shot": "two",
  "ms": 12000,
  "move": "dolly",
  "gesture": "complice",
  "seated": true,
  "furniture": "chairs"
 },
 {
  "id": "vers-ecran",
  "speaker": null,
  "text": "",
  "scene": "white",
  "shot": "rear",
  "ms": 6000,
  "move": "orbit",
  "gesture": "watch",
  "seated": true,
  "furniture": "all"
 },
 {
  "id": "television",
  "speaker": null,
  "text": "",
  "scene": "white",
  "shot": "tv",
  "ms": 7000,
  "move": "push",
  "gesture": "watch",
  "seated": true,
  "furniture": "all"
 },
 {
  "id": "montage",
  "speaker": null,
  "text": "La Croisée des Âmes, c’est un espace en construction…",
  "scene": "white",
  "shot": "montage",
  "ms": 15000,
  "move": "cut",
  "gesture": "watch",
  "seated": true,
  "furniture": "all"
 },
 {
  "id": "lieu",
  "speaker": "f",
  "text": "La Croisée des Âmes, c’est un espace en construction… Un lieu pour lire, jouer, créer, dialoguer, apprendre, et peut-être se transformer.",
  "scene": "white",
  "shot": "two",
  "ms": 12000,
  "move": "dolly",
  "gesture": "open",
  "seated": true,
  "furniture": "chairs"
 },
 {
  "id": "bienvenue",
  "speaker": "m",
  "text": "Bienvenue.",
  "scene": "white",
  "shot": "two",
  "ms": 10000,
  "move": "dolly",
  "gesture": "invite",
  "seated": true,
  "furniture": "chairs"
 },
 {
  "id": "dojo-arrivee",
  "speaker": "m",
  "text": "Voici l’interface du Salon. Appuie sur Menu : les icônes apparaissent. Appuie encore : elles se replient.",
  "scene": "dojo",
  "shot": "dojo",
  "ms": 11000,
  "move": "fade",
  "gesture": "invite",
  "seated": false,
  "demo": true
 },
 {
  "id": "dojo-camera",
  "speaker": "f",
  "text": "L’icône Caméra te permet de tourner autour de nous, de zoomer et de changer de point de vue.",
  "scene": "dojo",
  "shot": "dojo",
  "ms": 10000,
  "move": "drift",
  "gesture": "explain",
  "seated": false,
  "demo": true
 },
 {
  "id": "dojo-deplacement",
  "speaker": "m",
  "text": "Avec le joystick, tu peux avancer, reculer et marcher dans la pièce. Regarde, Marianne te montre.",
  "scene": "dojo",
  "shot": "dojo",
  "ms": 11000,
  "move": "drift",
  "gesture": "invite",
  "seated": false,
  "demo": true
 },
 {
  "id": "dojo-demi-tour",
  "speaker": "m",
  "text": "Si tu perds ton personnage de vue, touche Recentrer. Tu le retrouves sans devoir tout recommencer.",
  "scene": "dojo",
  "shot": "dojo",
  "ms": 9000,
  "move": "drift",
  "gesture": "explain",
  "seated": false,
  "demo": true
 },
 {
  "id": "dojo-personnaliser",
  "speaker": "m",
  "text": "Pour modifier ton personnage, ouvre Menu, puis Avatar. Tu retrouves ici les vrais outils de personnalisation.",
  "scene": "dojo",
  "shot": "dojo",
  "ms": 12000,
  "move": "drift",
  "gesture": "explain",
  "seated": false,
  "demo": true
 },
 {
  "id": "dojo-apparence",
  "speaker": "f",
  "text": "Le volet est translucide : tu continues de voir mon visage et les personnages pendant les changements. Une seconde pression le replie.",
  "scene": "dojo",
  "shot": "dojo",
  "ms": 10000,
  "move": "drift",
  "gesture": "open",
  "seated": false,
  "demo": true
 },
 {
  "id": "dojo-vetements",
  "speaker": "m",
  "text": "Les vêtements se choisissent dans leur catégorie, sans quitter le Salon. Tu peux changer la tenue et continuer à regarder le personnage.",
  "scene": "dojo",
  "shot": "dojo",
  "ms": 12000,
  "move": "drift",
  "gesture": "open",
  "seated": false,
  "demo": true
 },
 {
  "id": "dojo-enregistrer",
  "speaker": "f",
  "text": "Le bouton Enregistrer conserve tes choix. Nous allons maintenant te montrer comment rencontrer quelqu’un.",
  "scene": "dojo",
  "shot": "dojo",
  "ms": 7000,
  "move": "drift",
  "gesture": "explain",
  "seated": false,
  "demo": true
 },
 {
  "id": "dojo-construction",
  "speaker": "m",
  "text": "Avec ce pictogramme, tu ajoutes un personnage du livre. Choisis-le dans le répertoire : il viendra nous rejoindre ici.",
  "scene": "dojo",
  "shot": "dojo",
  "ms": 11000,
  "move": "drift",
  "gesture": "open",
  "seated": false,
  "demo": true
 },
 {
  "id": "dojo-appeler",
  "speaker": "f",
  "text": "Une fois ton invité arrivé, touche le petit téléphone du Salon. Tu lui parles directement, et il te répond à voix haute.",
  "scene": "dojo",
  "shot": "dojo",
  "ms": 13000,
  "move": "drift",
  "gesture": "explain",
  "seated": false,
  "demo": true
 },
 {
  "id": "dojo-bulles",
  "speaker": "m",
  "text": "Les bulles de dialogue sont facultatives. Cette icône les affiche ou les masque. Les voix continuent, même si tu retires les bulles.",
  "scene": "dojo",
  "shot": "dojo",
  "ms": 12500,
  "move": "drift",
  "gesture": "explain",
  "seated": false,
  "demo": true
 },
 {
  "id": "jardin",
  "speaker": "m",
  "text": "Avant le parc et ses papillons, faisons une rencontre dans le salon.",
  "scene": "dojo",
  "shot": "dojo",
  "ms": 6000,
  "move": "drift",
  "gesture": "invite",
  "seated": false,
  "demo": true
 }
];
const dojoStart=lines.findIndex(s=>s.scene==='dojo');
const soundOffsets=[];let introductionDuration=0;
for(const line of lines){soundOffsets.push(introductionDuration);introductionDuration+=line.ms;}
const pauseReasons=new Set();
let resumeAfterPause=false;
let shotStart=0,shotPaused=false,pausedAt=0,pausedElapsed=0,currentSpeaker=null,lastLayout='',secondCue=false;

const progress={white:0,people:0,ahmed:0},weights={white:.25,people:.40,ahmed:.35};
const downloadCache=new Map();let bootStage='Connexion';let assetAhmed=null,assetMarianne=null;
let pending=false,dojoTask=null,seatTask=null,initialTask=null,sceneRequest=0;
let dojoWardrobe=null;
function setProgress(key,value){if(!(key in progress))return;progress[key]=Math.max(progress[key],Math.min(1,value));const total=Math.floor(100*Object.keys(progress).reduce((a,k)=>a+progress[k]*weights[k],0));$('load-progress').value=total;$('load-percent').textContent=total+' %';}

function showBootStage(s){bootStage=s;const e=$('load-description');if(e)e.textContent=s;}
async function binary(url,key,{expected=0,cache=false}={}){
 if(cache&&downloadCache.has(url))return downloadCache.get(url);
 let last;
 for(let attempt=0;attempt<3;attempt++){
  try{
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),95000);
   let response,result;
   try{
    response=await fetch(url,{credentials:'same-origin',signal:controller.signal,cache:attempt?'reload':'default'});
    if(!response.ok)throw Error('HTTP '+response.status+' · '+url.split('/').slice(-2).join('/'));
    const total=Number(response.headers.get('content-length'))||expected;
    if(!response.body||!total){result=await response.arrayBuffer();setProgress(key,.9);}
    else{
     const reader=response.body.getReader();let received=0;const chunks=[];
     for(;;){const {done,value}=await reader.read();if(done)break;chunks.push(value);received+=value.byteLength;if(key!=='ahmed')setProgress(key,.9*received/total);}
     if(!received)throw Error('Fichier vide');
     const data=new Uint8Array(received);let at=0;for(const c of chunks){data.set(c,at);at+=c.byteLength;}result=data.buffer;
    }
   }finally{clearTimeout(timer);}
   if(expected&&result.byteLength!==expected)throw Error('Fragment incomplet : '+result.byteLength+'/'+expected);
   if(cache)downloadCache.set(url,result);return result;
  }catch(e){last=e;if(attempt<2)await new Promise(r=>setTimeout(r,450*(attempt+1)));}
 }
 throw last;
}
function withoutOptionalMorphs(buffer){
 const bytes=new Uint8Array(buffer),v=new DataView(buffer),n=v.getUint32(12,true),j=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+n)));
 for(const m of j.meshes||[]){delete m.weights;if(m.extras?.targetNames)delete m.extras.targetNames;for(const p of m.primitives||[])delete p.targets;}
 for(const node of j.nodes||[])delete node.weights;delete j.animations;
 const json=new TextEncoder().encode(JSON.stringify(j)),pad=(json.length+3)&~3,tail=bytes.subarray(20+n),out=new Uint8Array(20+pad+tail.length),h=new DataView(out.buffer);
 h.setUint32(0,0x46546c67,true);h.setUint32(4,2,true);h.setUint32(8,out.length,true);h.setUint32(12,pad,true);h.setUint32(16,0x4e4f534a,true);out.fill(32,20,20+pad);out.set(json,20);out.set(tail,20+pad);return out.buffer;
}
async function decodeAhmed(buffer){
 try{return await loader.parseAsync(buffer,'');}
 catch(error){
  remember('Expressions du visage',error.message||error);
  // Keep the exact same original character, arms, textures and clothes; only omit optional mouth targets if the graphics driver cannot read them.
  return await loader.parseAsync(withoutOptionalMorphs(buffer),'');
 }
}
function setPending(on){pending=on;if(on)introSound.pause();$('skip').disabled=!authorized||stage==='garden';$('scene-wait').hidden=!on;}
const whiteFloor=new T.Group();
const seamlessFloor=new T.Mesh(new T.PlaneGeometry(180,180),new T.MeshBasicMaterial({color:0xffffff,toneMapped:false}));
seamlessFloor.rotation.x=-Math.PI/2;seamlessFloor.position.y=-.003;whiteFloor.add(seamlessFloor);
const shadowFloor=new T.Mesh(new T.PlaneGeometry(180,180),new T.ShadowMaterial({opacity:.12}));
shadowFloor.rotation.x=-Math.PI/2;shadowFloor.position.y=-.001;shadowFloor.receiveShadow=true;whiteFloor.add(shadowFloor);
sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.5,far:25});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.00025;
const seatAnchors=new Map();
function findChild(parent,pattern){let result;parent.traverse(o=>{if(!result&&pattern.test(o.name))result=o;});return result;}
function bounds(o){return new T.Box3().setFromObject(o);}
const introChairScale=.80;
function fitOriginalChair(chair){
 // Keep the supplied chair and its floor position; fit its dimensions to the
 // original actors so the front cushion stays below their supported thighs.
 chair.updateWorldMatrix(true,true);
 const pivot=bounds(chair).getCenter(new T.Vector3());pivot.y=0;
 const world=new T.Matrix4().makeTranslation(pivot.x,pivot.y,pivot.z)
  .multiply(new T.Matrix4().makeScale(introChairScale,introChairScale,introChairScale))
  .multiply(new T.Matrix4().makeTranslation(-pivot.x,-pivot.y,-pivot.z))
  .multiply(chair.matrixWorld);
 if(chair.parent)world.premultiply(chair.parent.matrixWorld.clone().invert());
 world.decompose(chair.position,chair.quaternion,chair.scale);
 chair.userData.introScale=introChairScale;chair.updateWorldMatrix(false,true);
}

function measureArmrests(chair,point,forward){
 const side=new T.Vector3(forward.z,0,-forward.x).normalize();
 const scale=chair.userData.introScale||1,normalMatrix=new T.Matrix3(),normal=new T.Vector3();
 const result=[];
 for(const sign of [-1,1]){
  let best=null,score=Infinity;
  for(const lateral of [.35,.37,.39,.41,.43,.45])for(const depth of [.04,.08,.12,.16,.20]){
   const dx=lateral*scale,dz=depth*scale;
   const p=point.clone().addScaledVector(side,sign*dx).addScaledVector(forward,dz);
   const ray=new T.Raycaster(new T.Vector3(p.x,1.46,p.z),new T.Vector3(0,-1,0));
   const hits=ray.intersectObject(chair,true);
   // A wrist must target the padded upper surface, not the low inner flank.
   const hit=hits.find(h=>{
    if(h.point.y<point.y+.18*scale||h.point.y>point.y+.39*scale||!h.face)return false;
    normalMatrix.getNormalMatrix(h.object.matrixWorld);normal.copy(h.face.normal).applyNormalMatrix(normalMatrix);
    return normal.y>.58;
   });
   if(!hit)continue;
   const cost=Math.abs(dx-.40*scale)*2+Math.abs(dz-.10*scale)+Math.abs(hit.point.y-(point.y+.24*scale));
   if(cost<score){score=cost;best=hit.point.clone();}
  }
  result.push(best||point.clone().addScaledVector(side,sign*.40*scale).addScaledVector(forward,.10*scale).add(new T.Vector3(0,.24*scale,0)));
 }
 return result;
}
function measureSeats(){
 room.updateMatrixWorld(true);seatAnchors.clear();
 const measured={m:{p:[-1.2469093,.5705407,-.05081394],f:[.6425154,0,-.7662728]},f:{p:[1.2875239,.5705407,-.06313361],f:[-.6425154,0,-.7662728]}};
 for(const [id,pattern] of [['m',/RED[\s_]*CHAIR/i],['f',/BLUE[\s_]*CHAIR/i]]){
  const fixed=measured[id];let contact=new T.Vector3(...fixed.p),forward=new T.Vector3(...fixed.f),chair=null;
  try{
   chair=chairs.find(o=>pattern.test(o.name));
   if(chair){
    const cushion=findChild(chair,/^Cushion_low/i),front=findChild(chair,/^FeetFront/i),back=findChild(chair,/^FeetBack/i);
    if(cushion&&front&&back){
     const cb=bounds(cushion),center=cb.getCenter(new T.Vector3()),dir=bounds(front).getCenter(new T.Vector3()).sub(bounds(back).getCenter(new T.Vector3()));dir.y=0;
     if(dir.lengthSq()>.001){dir.normalize();const c=center.clone().addScaledVector(dir,-.055*(chair.userData.introScale||1));const ray=new T.Raycaster(new T.Vector3(c.x,cb.max.y+.6,c.z),new T.Vector3(0,-1,0));const hit=ray.intersectObject(cushion,true)[0];c.y=(hit?.point.y??cb.max.y)+.012;if(Number.isFinite(c.y)){contact=c;forward=dir;}}
    }
   }
  }catch(e){remember('Mesure fauteuil',e.message||e);}
  const arms=chair?measureArmrests(chair,contact,forward):[-1,1].map(sign=>contact.clone().addScaledVector(new T.Vector3(forward.z,0,-forward.x),sign*.36).addScaledVector(forward,.17).add(new T.Vector3(0,.19,0)));
  seatAnchors.set(id,{point:contact,forward,yaw:Math.atan2(forward.x,forward.z),arms});
 }
}
async function loadWhite(){
 showBootStage('La salle blanche se prépare…');
 const original=await binary('/assets/intro-original/white-room-start-ecran22.glb','white');
 room=(await loader.parseAsync(original,'')).scene;room.name='Salle blanche originale';
 // The supplied model includes 200 alternative video-screen frames. The actual TV
 // geometry is a separate node called TV_284, and must remain visible.
 room.traverse(o=>{
  // GLTFLoader sanitizes spaces and dots in supplied node names.
  const name=o.name.replace(/[\s_.]+/g,' ').trim().toUpperCase();
  if(/^TV SCREEN(?: |\d|$)/.test(name))o.visible=false;
  if(/^(?:BLUE CHAIR|RED CHAIR|TV 284|TV CASE)(?: |$)/.test(name)){chairs.push(o);o.visible=false}
  if(o.isMesh){o.castShadow=true;o.receiveShadow=true}
 });
 television=chairs.find(o=>/^TV[\s_]284(?:[\s_]|$)/i.test(o.name));
 scene.add(whiteFloor);chairs.forEach(c=>c.visible=true);
 for(const chair of chairs)if(/^(BLUE|RED)[\s_]*CHAIR/i.test(chair.name))fitOriginalChair(chair);
 measureSeats();chairs.forEach(c=>c.visible=false);room.visible=false;room.removeFromParent();setProgress('white',1);canvasHost.classList.add('room-ready');
}
function alignDojoFloor(model){
 let tatami=null;model.traverse(o=>{if(!tatami&&/tatami/i.test(o.name))tatami=o;});
 if(!tatami)throw Error('Le sol du dojo est introuvable.');
 model.updateWorldMatrix(true,true);
 const floor=new T.Box3().setFromObject(tatami);
 // The original building has foundations below its raised floor. Align the
 // walking surface, not the bottom of the entire building, with the actors.
 model.position.y+=-.003-floor.max.y;model.updateWorldMatrix(true,true);
 floor.setFromObject(tatami);model.userData.introFloorBounds=floor;
 // Stay within the central tatami, clear of the original perimeter pillars.
 model.userData.introCameraBounds=new T.Box3(
  new T.Vector3(floor.min.x+.80,floor.max.y+.35,floor.min.z+.45),
  new T.Vector3(floor.max.x-.80,floor.max.y+2.45,floor.max.z-.45)
 );
 model.userData.introWalkBounds=new T.Box3(
  new T.Vector3(floor.min.x+1.05,floor.max.y,floor.min.z+.65),
  new T.Vector3(floor.max.x-1.05,floor.max.y+2,floor.max.z-.65)
 );
 return floor;
}
function prepareDojo(){
 if(dojo)return Promise.resolve(dojo);
 if(!dojoTask)dojoTask=(async()=>{
 const full=await binary('/assets/intro-original/dojo-original.glb','dojo');
 dojo=(await loader.parseAsync(full,'')).scene;
 alignDojoFloor(dojo);dojo.visible=false;scene.add(dojo);
 dojo.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return dojo;
 })().catch(e=>{dojoTask=null;throw e});
 return dojoTask;
}
function bytesTo(type,input){return new type(input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength))}

// A fitted, neutral inner layer covers the waist on the original body surface.
 // Rest-pose coordinates follow the same vertices in standing and seated poses.
function coverMarianneWaist(actor){
 const part=actor.parts.find(p=>p.name==='body')||actor.parts.find(p=>/^(corps|skin)$/i.test(p.name));
 if(!part){remember('Tenue de Marianne','Corps de référence introuvable');return;}
 const g=part.obj.geometry,mat=part.obj.material;
 let min=Infinity,max=-Infinity;
 for(let k=1;k<part.base.length;k+=3){min=Math.min(min,part.base[k]);max=Math.max(max,part.base[k]);}
 const height=max-min;
 if(!Number.isFinite(height)||height<.5)return;
 const lo=min+height*.505,hi=min+height*.647,half=height*.081;
 const rest=part.base.slice();g.setAttribute('introRest',new T.BufferAttribute(rest,3));
 const previous=mat.onBeforeCompile.bind(mat),key=mat.customProgramCacheKey.bind(mat);
 mat.onBeforeCompile=(shader,renderer)=>{
  previous(shader,renderer);
  shader.vertexShader='attribute vec3 introRest; varying vec3 introClothingRest;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nintroClothingRest=introRest;');
  shader.fragmentShader='varying vec3 introClothingRest;\n'+shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\nfloat waistBand=step('+lo.toFixed(6)+',introClothingRest.y)*step(introClothingRest.y,'+hi.toFixed(6)+')*step(abs(introClothingRest.x),'+half.toFixed(6)+');\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(1.0,1.0,1.0),waistBand); diffuseColor.a=mix(diffuseColor.a,1.0,waistBand);');
 };
 const oldKey=key();mat.customProgramCacheKey=()=>oldKey+'-intro-waist-'+lo.toFixed(5)+'-'+hi.toFixed(5);mat.needsUpdate=true;
}


async function loadAhmed(){
 const total=10671740,unit=1048576,chunks=new Array(11);
 async function group(g){
  const first=g*3,last=Math.min(chunks.length,first+3),size=Math.min(total-first*unit,3*unit);
  try{
   const data=new Uint8Array(await binary('/api/intro-private/ahmedfast/'+String(g).padStart(3,'0'),'ahmed',{expected:size,cache:true}));
   for(let i=first;i<last;i++)chunks[i]=data.subarray((i-first)*unit,Math.min(data.length,(i-first+1)*unit));
  }catch(e){
   remember('Téléchargement groupé',e.message||e);
   // An older hosting release can still provide the same verified model through the original fragment URL.
   for(let i=first;i<last;i++)if(!chunks[i])chunks[i]=new Uint8Array(await binary('/api/intro-private/ahmedv3/'+String(i).padStart(3,'0'),'ahmed',{expected:Math.min(unit,total-i*unit),cache:true}));
  }
  setProgress('ahmed',.92*chunks.reduce((n,c)=>n+(c?.byteLength||0),0)/total);
 }
 showBootStage('Préparation des personnages…');
 // Limit concurrency on mobile networks; each request carries at most 3 MiB.
 for(let g=0;g<4;g+=2)await Promise.all([group(g),group(g+1)]);
 const all=new Uint8Array(total);let at=0;for(const c of chunks){all.set(c,at);at+=c.byteLength;}
 if(at!==total)throw Error('Le modèle d’Ahmed est incomplet.');
 if(globalThis.crypto?.subtle){
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',all)),b=>b.toString(16).padStart(2,'0')).join('');
  if(hash!=='66040c78a23c862dd39090802129eabab252638f1d1e863836a1e71f37f53192'){downloadCache.clear();throw Error('Le modèle original d’Ahmed doit être retéléchargé.');}
 }
 showBootStage('Assemblage du personnage d’Ahmed…');
 const asset=await decodeAhmed(all.buffer);
 const root=new T.Group(),body=asset.scene;root.add(body);root.name='Ahmed Marie';root.position.set(-.78,.0206,.42);root.rotation.y=Math.PI;scene.add(root);
 const bones=new Map(),mouth=[];
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 let pants;
 body.traverse(o=>{
  if(o.isMesh){o.castShadow=true;o.receiveShadow=false;o.frustumCulled=false;if(/^Pantalon[\s_]*blanc/i.test(o.name))pants=o;}
  if(o.isBone){const name=normalize(o.name).replace(/^v27/,'');bones.set(name,{o,p:o.position.clone(),q:o.quaternion.clone()});}
  if(o.morphTargetDictionary?.Ouvrir!==undefined)mouth.push(o);
 });

 const jointOrder=['bassin','tete','brasd','avantbrasd','maind','brasg','avantbrasg','maing','cuissed','jambed','piedd','cuisseg','jambeg','piedg','thorax'];
 // GLTFLoader can uniquify names on some builds. The skin's verified joint order is the reliable source.
 let rig;pants?.skeleton?.bones?.length===15&&(rig=pants.skeleton);
 if(!rig)body.traverse(o=>{if(!rig&&o.isSkinnedMesh&&o.skeleton?.bones.length===15)rig=o.skeleton;});
 if(rig)jointOrder.forEach((name,i)=>{const o=rig.bones[i];bones.set(name,{o,p:o.position.clone(),q:o.quaternion.clone()});});
 const canSit=jointOrder.every(n=>bones.has(n));if(!canSit)remember('Articulations','Animation assise indisponible, modèle original conservé.');

 const rotX=(a)=>new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),a);
 const set=(n,p,q)=>{const x=bones.get(n);if(!x)return;x.o.position.copy(p);x.o.quaternion.copy(x.q);if(q)x.o.quaternion.premultiply(q);};
 const spin=(v,center,q)=>v.clone().sub(center).applyQuaternion(q).add(center);
 const instance={id:'m',root,body,parts:[],sit:0,pants,mouth,headBone:bones.get('tete')?.o||null,
  pose(value,gesture=null){
   this.sit=value;if(!canSit)return;const t=T.MathUtils.clamp(value,0,1),drop=new T.Vector3(0,-.295*t,0);
   for(const [n,x] of bones)set(n,x.p.clone().add(drop));
   if(t){
    for(const [side,sgn] of [['d',-1],['g',1]]){
     const thigh=bones.get('cuisse'+side),shin=bones.get('jambe'+side),foot=bones.get('pied'+side);
     const hip=new T.Vector3(sgn*.105,.865,-.015),knee=new T.Vector3(sgn*.095,.438,.008),ankle=new T.Vector3(sgn*.106,.055,.015);
     const thighRot=rotX(-1.30*t),shinRot=rotX(.10*t);
     const newKnee=spin(knee,hip,thighRot).add(drop),newAnkle=spin(ankle,knee,shinRot).sub(knee).add(newKnee);
     set('cuisse'+side,spin(thigh.p,hip,thighRot).add(drop),thighRot);
     set('jambe'+side,spin(shin.p,knee,shinRot).sub(knee).add(newKnee),shinRot);
     set('pied'+side,foot.p.clone().sub(ankle).add(newAnkle));
     // Forearms rotate at the elbow, with the palms coming to rest near the thighs.
     const upper=bones.get('bras'+side),fore=bones.get('avantbras'+side),hand=bones.get('main'+side);
     const elbow=upper.p.clone().lerp(fore.p,.53),bend=rotX(-.76*t);
     set('avantbras'+side,spin(fore.p,elbow,bend).add(drop),bend);
     set('main'+side,spin(hand.p,elbow,bend).add(drop),bend);
    }
   }
   if(gesture){
    const {time,energy,emphasis,kind,gaze,blink}=gesture;
    const qEuler=(x,y,z)=>new T.Quaternion().setFromEuler(new T.Euler(x,y,z,'XYZ'));
    const apply=(names,pivot,q)=>{for(const n of names){const o=bones.get(n)?.o;if(!o)continue;o.position.copy(spin(o.position,pivot,q));o.quaternion.premultiply(q);}};
    for(const [side,sign] of [['d',-1],['g',1]]){
     const upper=bones.get('bras'+side)?.o,fore=bones.get('avantbras'+side)?.o,hand=bones.get('main'+side)?.o;
     if(!upper||!fore||!hand)continue;
     const phase=side==='d'?0:1.5,active=side==='d'?1:.58;
     const wave=Math.sin(time*.86+phase),soft=Math.sin(time*1.47+phase*.7);
     const accent=energy*emphasis*active,invitation=kind==='invite'?accent:0;
     const shoulder=upper.position.clone().add(new T.Vector3(0,.085,-.015));
     const swing=qEuler(-.028*wave-.095*accent,-sign*(.018*soft+.05*invitation),sign*(.020*wave+.038*accent));
     apply(['bras'+side,'avantbras'+side,'main'+side],shoulder,swing);
     const elbow=upper.position.clone().lerp(fore.position,.56);
     const flex=qEuler(-.050*soft-(kind==='invite'?.27:.13)*accent,sign*.035*accent,sign*.024*wave);
     apply(['avantbras'+side,'main'+side],elbow,flex);
     hand.quaternion.multiply(qEuler(.025*wave,sign*.025*soft,sign*.025*accent));
    }
    if(gesture.gait&&t<.015){
     for(const [side,sign] of [['d',-1],['g',1]]){
      const thigh=bones.get('cuisse'+side)?.o,shin=bones.get('jambe'+side)?.o,foot=bones.get('pied'+side)?.o;
      if(!thigh||!shin||!foot)continue;
      const hip=thigh.position.clone().lerp(bones.get('bassin').o.position,.50);
      const wave=Math.sin(gesture.gait.phase*Math.PI*2+(sign>0?Math.PI:0));
      const q=qEuler(.22*wave*gesture.gait.strength,0,0);
      apply(['cuisse'+side,'jambe'+side,'pied'+side],hip,q);
      const lift=Math.max(0,wave)*.035*gesture.gait.strength;
      foot.position.y+=lift;
     }
    }
    const chest=bones.get('thorax')?.o,head=bones.get('tete')?.o;
    if(chest){chest.position.y+=.0035*Math.sin(time*1.35);chest.quaternion.multiply(qEuler(.009*Math.sin(time*1.35),.015*gaze,0));}
    if(head){head.quaternion.multiply(qEuler(.025*Math.sin(time*.72)+.035*emphasis*energy,gesture.headYaw??(.085*gaze),.018*Math.sin(time*.48)));head.position.y+=.0025*Math.sin(time*1.35);}
    for(const o of mouth){const i=o.morphTargetDictionary?.Cligner;if(i!==undefined)o.morphTargetInfluences[i]=blink;}
   }
   root.updateMatrixWorld(true);
  },
  speak(open,wide=0){
   for(const o of mouth){
    const d=o.morphTargetDictionary,w=o.morphTargetInfluences;
    w[d.Ouvrir]=open;if(d.Decouvrir!==undefined)w[d.Decouvrir]=wide*.18;
    if(d.SourireG!==undefined)w[d.SourireG]=wide*.07;
    if(d.SourireD!==undefined)w[d.SourireD]=wide*.07;
   }
  }
 };
 const garments=[];body.traverse(o=>{if(o.isSkinnedMesh&&/^(Haut|Pantalon|Chaussures)[\s_]*blanc/i.test(o.name))garments.push(o);});
 const garmentParent=garments[0]?.parent;
 try{await dressAhmed(instance,rig?.bones,garmentParent,garments);}catch(e){root.removeFromParent();throw e;}
 setProgress('ahmed',1);return instance;
}

async function loadMarianne(){
 const root=new T.Group(),body=new T.Group();root.add(body);root.name='Marianne';root.scale.setScalar(1.04);root.position.set(.9,0,.42);root.rotation.y=Math.PI;
 const actor=await createMarianne(root,body);scene.add(root);setProgress('people',1);return actor;
}
async function loadPeople(){
 // Do not inflate two large 3D models at the same time on a phone. Retain each successful stage for retry.
 if(!assetAhmed)assetAhmed=await loadAhmed();
 if(!assetMarianne){showBootStage('Assemblage du personnage de Marianne…');assetMarianne=await loadMarianne();}
 people=[assetAhmed,assetMarianne];downloadCache.clear();
}

let seatsReady=false;
function prepareSeats(){seatsReady=people.length===2&&people.every(p=>p.wardrobe&&seatAnchors.has(p.id));return seatsReady?Promise.resolve():Promise.reject(Error('Articulations des fauteuils indisponibles'));}
async function prepareDojoPerformance(){
 await prepareDojo();
 if(stage==='garden')return;
 dojoWardrobe??=createDojoWardrobe(people,{scene,center:dojo.userData.introFloorBounds.getCenter(new T.Vector3()),floorY:dojo.userData.introFloorBounds.max.y});
 await dojoWardrobe.prepare();
}
async function preloadNext(){try{await prepareSeats();prepareFilm();}catch(e){remember('Préchargement assises',e.message);}try{await prepareDojoPerformance();}catch(e){remember('Préchargement dojo',e.message);}}
// Every character is authored with local +Z pointing forward.
function facingYaw(from,to){return Math.atan2(to.x-from.x,to.z-from.z);}
function openingPosition(id){return new T.Vector3(id==='m'?-1.28:1.28,id==='m'?.0206:0,-1.08);}
function openingLayout(id){const pos=openingPosition(id),other=openingPosition(id==='m'?'f':'m');return {pos,yaw:facingYaw(pos,other),sit:0};}
function turnDelta(from,to){return Math.atan2(Math.sin(to-from),Math.cos(to-from));}
function chairLayout(person){
 if(person.chairLayout)return {...person.chairLayout,pos:person.chairLayout.pos.clone()};
 const a=seatAnchors.get(person.id);if(!a)throw Error('Fauteuil original manquant');
 // The reference solver expects the origin to stay in front of the seat:
 // knees bend and pelvis travels backwards, feet remain supported on the floor.
 const scale=person.id==='m'?1.075:1.04,footDistance=.49,pelvisRetreat=.43,yaw=a.yaw;
 // These clearances were measured on both complete trouser meshes against the
 // original cushion, including its raised front edge, throughout the descent.
 const supportLift=person.id==='m'?.038:.030;
 const garment=person.parts.find(p=>p.source?.binding)?.obj;
 const modelOffsetY=garment?garment.getWorldPosition(new T.Vector3()).y-person.root.position.y:0;
 const pos=a.point.clone().addScaledVector(a.forward,footDistance);pos.y=person.id==='m'?.0206:0;
 const arms=a.arms.map(p=>{
  const v=p.clone().sub(pos);v.y-=modelOffsetY;
  v.applyAxisAngle(new T.Vector3(0,1,0),-yaw).multiplyScalar(100/scale);
  return [v.x,v.y+3.5,v.z-3.5];
 }).sort((a,b)=>a[0]-b[0]);
 const seat={id:'intro-'+person.id,height:100*(a.point.y+supportLift-pos.y)/scale,gap:100*pelvisRetreat/scale,x:700,z:-800,yaw,introArms:arms};
 person.introSeat=seat;person.chairLayout={pos:pos.clone(),yaw,sit:1};
 return {pos,yaw,sit:1};
}
function targetLayout(person,seated,dojoMode=false,nearSeats=false){
 const i=person.id==='f'?1:-1;
 if(dojoMode){
  const center=dojo.userData.introFloorBounds.getCenter(new T.Vector3());
  return {pos:new T.Vector3(center.x+i*.8,person.id==='m'?.0206:0,center.z+.35),yaw:Math.PI,sit:0};
 }
 if(seated||nearSeats){const target=chairLayout(person);return {...target,sit:seated?1:0};}
 return openingLayout(person.id);
}
let movement=null,invitationMotion=null;
function layoutPeople(seated,dojoMode=false,nearSeats=false){
 const now=performance.now(),items=people.map(person=>{
  const from=person.root.position.clone(),yaw=person.root.rotation.y,sit=person.sit;
  return {person,from,yaw,sit,to:targetLayout(person,seated,dojoMode,nearSeats)};
 });
 if(dojoMode||step===0||!seated&&!nearSeats){movement=null;for(const {person,to} of items){person.root.position.copy(to.pos);person.root.rotation.y=to.yaw;person.pose(to.sit);}return;}
 movement={start:now,duration:seated&&items.some(x=>x.sit<.99)?1150:650,items};
}
// The first three dialogue shots take place in the empty white void.
// Only after the invitation do the chairs appear and the actors approach.
// Empty white opening invariant: the downloaded room is not a scene child.
// Removing the complete original GLB also removes any furniture descendants
// that have unexpected names. Only mount it after the actual invitation.
function mountRoom(visible){
 if(!room)return;
 if(visible){if(room.parent!==scene)scene.add(room);room.visible=true;}
 else{room.visible=false;room.removeFromParent();}
}
function furnitureAt(line,elapsed){
 const mode=line?.furniture||'none';
 const reveal=mode==='reveal'&&elapsed>=650;
 const showChairs=line?.scene==='white'&&(mode==='chairs'||mode==='all'||reveal);
 const showTV=showChairs&&mode==='all';
 mountRoom(showChairs);
 for(const c of chairs){const tv=/^TV[\s_]/i.test(c.name);c.visible=tv?showTV:showChairs;}
}
function beginInvitation(){
 movement=null;
 const items=people.map(person=>{
  // Start from the preceding real standing position, never jump to a chair.
  const initial=targetLayout(person,false),standing=targetLayout(person,false,false,true);
  if(person.sit>.02){person.root.position.copy(initial.pos);person.root.rotation.y=initial.yaw;person.pose(0);}
  const from=person.root.position.clone(),yaw=person.root.rotation.y,to=targetLayout(person,true);
  const walkYaw=facingYaw(from,standing.pos);
  person.gait=null;
  return {person,from,yaw,standing,to,walkYaw};
 });
 invitationMotion={items,complete:false};lastLayout='standing';
}
function angleMix(a,b,t){return a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;}
function updateInvitation(now){
 if(!invitationMotion||invitationMotion.complete)return;
 const elapsed=shotElapsed(now);let complete=true;
 for(const {person,from,yaw,standing,to,walkYaw} of invitationMotion.items){
  const delay=person.id==='m'?0:1250;
  const t=elapsed-delay;
  // The words appear first. Then the turn, the steps, the second turn, and the sit.
  const turn=T.MathUtils.smoothstep(t,1350,2050),walk=T.MathUtils.smoothstep(t,2050,4600);
  const face=T.MathUtils.smoothstep(t,4600,5350),sit=T.MathUtils.smoothstep(t,5350,7650);
  person.root.position.lerpVectors(from,standing.pos,walk);
  person.root.rotation.y=angleMix(angleMix(yaw,walkYaw,turn),standing.yaw,face);
  person.root.rotation.y=angleMix(person.root.rotation.y,to.yaw,sit);
  const strength=T.MathUtils.smoothstep(t,1900,2300)*(1-T.MathUtils.smoothstep(t,4200,4650));
  person.gait=strength>.002?{phase:Math.max(0,(t-2050)/1000)*1.25,strength}:null;
  person.sit=sit;
  if(!person.wardrobe)person.pose(sit);
  if(t<7650)complete=false;
 }
 if(complete){for(const {person,to} of invitationMotion.items){person.gait=null;person.root.position.copy(to.pos);person.root.rotation.y=to.yaw;person.pose(1);}invitationMotion.complete=true;lastLayout='seated';}
}
function advanceMovement(now){
 if(!movement)return;const u=T.MathUtils.clamp((now-movement.start)/movement.duration,0,1),t=u*u*(3-2*u);
 for(const {person,from,yaw,sit,to} of movement.items){
  person.root.position.lerpVectors(from,to.pos,t);
  const d=Math.atan2(Math.sin(to.yaw-yaw),Math.cos(to.yaw-yaw));person.root.rotation.y=yaw+t*d;
  const s=T.MathUtils.lerp(sit,to.sit,t);if(Math.abs(s-person.sit)>.001||u===1)person.pose(s);
 }
 if(u===1)movement=null;
}

// A quiet actor keeps breathing, looking and moving even when the other actor speaks.
// The female meshes do not share Ahmed's skeleton: deform their existing posed vertices
// coherently, using the same elbow pivots for the visible skin and the outfit.
function prepareArmMotion(person){
 const bodyPart=person.parts.find(p=>/^(body|corps|skin)$/i.test(p.name));if(!bodyPart)return null;
 const rest=bodyPart.reference,posed=bodyPart.mesh.geometry.attributes.position.array;
 let top=0,extent=0;for(let k=0;k<rest.length;k+=3){top=Math.max(top,rest[k+1]);extent=Math.max(extent,Math.abs(rest[k]));}
 if(top<.5||extent<.12)return null;
 const pivots={},parts=[];
 for(const sign of [-1,1]){
  const nearest=[];const goalY=top*.61,goalX=extent*.83;
  for(let k=0;k<rest.length;k+=3){if(sign*rest[k]<=0)continue;const d=(Math.abs(rest[k])-goalX)**2+(rest[k+1]-goalY)**2+(rest[k+2]-.015)**2;nearest.push([d,k]);}
  nearest.sort((a,b)=>a[0]-b[0]);const a=nearest.slice(0,20),v=new T.Vector3();
  for(const [,k] of a)v.add(new T.Vector3(posed[k],posed[k+1],posed[k+2]));pivots[sign]=v.multiplyScalar(1/Math.max(1,a.length));
 }
 for(const part of person.parts){
  if(/hair|brow|lash|eye|teeth|tongue|visage|cheveu/i.test(part.name))continue;
  const g=part.mesh.geometry,attr=g.attributes.position,norm=g.attributes.normal,a=attr.array,r=part.reference,indices=[],weights=[],sides=[];
  const base=a.slice(),normalBase=norm?.array.slice();
  for(let k=0;k<r.length;k+=3){
   const x=Math.abs(r[k]),y=r[k+1];
   const sideWeight=T.MathUtils.smoothstep(x,extent*.57,extent*.78);
   const low=T.MathUtils.smoothstep(y,top*.39,top*.44),high=1-T.MathUtils.smoothstep(y,top*.61,top*.725);
   const w=sideWeight*low*high;if(w<.012)continue;
   indices.push(k);weights.push(w);sides.push(r[k]<0?-1:1);
  }
  if(indices.length)parts.push({attr,norm,indices,weights,sides,base,normalBase});
 }
 return {parts,pivots,stamp:person.stamp};
}
const armVector=new T.Vector3(),armNormal=new T.Vector3();
function moveMarianneArms(person,g){
 if(!person.armCache||person.armCache.stamp!==person.stamp)person.armCache=prepareArmMotion(person);
 const cache=person.armCache;if(!cache)return;
 const transforms={};
 for(const sign of [-1,1]){
  const phase=sign===-1?.9:2.1,accent=g.energy*g.emphasis*(sign===-1?1:.7);
  const x=.045*Math.sin(g.time*1.15+phase)-(g.kind==='invite'?.23:.12)*accent;
  transforms[sign]=new T.Quaternion().setFromEuler(new T.Euler(x,sign*.045*accent,sign*(.018*Math.sin(g.time*.7+phase)+.035*accent)));
 }
 for(const p of cache.parts){
  for(let i=0;i<p.indices.length;i++){
   const k=p.indices[i],sign=p.sides[i],w=p.weights[i],pivot=cache.pivots[sign],q=transforms[sign];
   armVector.fromArray(p.base,k).sub(pivot).applyQuaternion(q).add(pivot);
   const a=p.attr.array;a[k]=T.MathUtils.lerp(p.base[k],armVector.x,w);a[k+1]=T.MathUtils.lerp(p.base[k+1],armVector.y,w);a[k+2]=T.MathUtils.lerp(p.base[k+2],armVector.z,w);
   if(p.norm&&p.normalBase){armNormal.fromArray(p.normalBase,k).applyQuaternion(q);const n=p.norm.array;n[k]=T.MathUtils.lerp(p.normalBase[k],armNormal.x,w);n[k+1]=T.MathUtils.lerp(p.normalBase[k+1],armNormal.y,w);n[k+2]=T.MathUtils.lerp(p.normalBase[k+2],armNormal.z,w);}
  }
  p.attr.needsUpdate=true;if(p.norm)p.norm.needsUpdate=true;
 }
 const sway=.012*Math.sin(g.time*.8)+.012*g.gaze;
 person.body.rotation.z=sway;person.body.rotation.x=.009*Math.sin(g.time*1.2);person.body.rotation.y=(g.headYaw||0)*.32;
 const pivot=person.sit?.64:.86;person.body.position.x=pivot*Math.sin(sway);person.body.position.y=.0028*Math.sin(g.time*1.3);
}
function shotElapsed(now=performance.now()){return Math.max(0,(shotPaused?pausedAt:now)-shotStart);}
function speakerActor(id){return people.find(p=>p.id===id);}
function actionEnvelope(t,duration){const start=T.MathUtils.smoothstep(t,0,1.1),end=1-T.MathUtils.smoothstep(t,Math.max(1.2,duration-1.4),duration);return start*end;}
let speech=null,lastMotion=0,bubbleLayout=null;
const bubblePreferenceKey='salon-bulles-visibles-v1';
let bubblesEnabled=true;
try{bubblesEnabled=localStorage.getItem(bubblePreferenceKey)!=='false';}catch{}
const bubbleToggle=$('intro-bubbles-toggle');
function syncIntroBubbles(){
 canvasHost.classList.toggle('bubbles-off',!bubblesEnabled);
 if(bubbleToggle){
  bubbleToggle.setAttribute('aria-pressed',String(bubblesEnabled));
  bubbleToggle.setAttribute('aria-label',bubblesEnabled?'Masquer les bulles':'Afficher les bulles');
  bubbleToggle.title=bubblesEnabled?'Masquer les bulles':'Afficher les bulles';
 }
 if(bubblesEnabled&&bubble.textContent&&stage!=='garden'){bubble.hidden=false;bubbleLayout=null;}
 if(!bubblesEnabled)bubble.style.visibility='hidden';
}
bubbleToggle?.addEventListener('click',()=>{
 bubblesEnabled=!bubblesEnabled;
 try{localStorage.setItem(bubblePreferenceKey,String(bubblesEnabled));}catch{}
 syncIntroBubbles();
});
if(typeof canvasHost!=='undefined'&&canvasHost?.classList)syncIntroBubbles();
let cinematicVoiceEnabled=false,cinematicUtterance=null,cinematicLocalVoices=null,cinematicSpeechEpoch=0,usingLocalVoice=false;
const cinematicSynth=globalThis.speechSynthesis;
function prepareCinematicVoices(){
 // One user gesture unlocks the existing, local two-speaker voice model.
 // The introduction gives it time to preload before the dojo.
 if(!cinematicLocalVoices&&typeof createLocalVoices==='function')cinematicLocalVoices=createLocalVoices(()=>{},()=>{});
 if(cinematicLocalVoices){cinematicLocalVoices.unlock();cinematicLocalVoices.prepare();}
 cinematicSynth?.getVoices?.();
}
function stopCinematicVoice(){
 ++cinematicSpeechEpoch;usingLocalVoice=false;
 cinematicLocalVoices?.stop();
 if(!cinematicUtterance)return;
 cinematicUtterance=null;try{cinematicSynth?.cancel();}catch{}
}
function browserCinematicVoice(id,text,token){
 if(token!==cinematicSpeechEpoch||!cinematicSynth||!globalThis.SpeechSynthesisUtterance)return;
 const gender=id==='f'?'femme':'homme';
 const utterance=new SpeechSynthesisUtterance(text);
 utterance.lang='fr-FR';utterance.rate=1.05;utterance.volume=.98;
 const selected=typeof frenchVoice==='function'?frenchVoice(cinematicSynth,gender,true,false):null;
 // When the browser has only one unnamed French voice, voice pitch remains
 // distinctive; the local Pierre/Jessica synthesis is preferred in the dojo.
 const fallback=(cinematicSynth.getVoices?.()||[]).find(v=>/^fr(?:-|_|$)/i.test(v.lang));
 if(selected||fallback)utterance.voice=selected||fallback;
 utterance.pitch=selected?1:(id==='f'?1.23:.78);
 cinematicUtterance=utterance;
 utterance.onend=utterance.onerror=()=>{if(cinematicUtterance===utterance)cinematicUtterance=null;};
 try{cinematicSynth.speak(utterance);}catch{cinematicUtterance=null;}
}
function speakCinematicCue(id,text){
 if(!cinematicVoiceEnabled||document.hidden||!id||!text)return;
 const gender=id==='f'?'femme':'homme',token=cinematicSpeechEpoch;
 const matched=typeof frenchVoice==='function'?frenchVoice(cinematicSynth,gender,true,false):null;
 // In the dojo use the two original local Salon voices: Pierre for Ahmed,
 // Jessica for Marianne. No network speech service or private key is required.
 if((stage==='dojo'||!matched)&&cinematicLocalVoices?.available){
  usingLocalVoice=true;
  cinematicLocalVoices.speak({
   line:{text,words:[{index:0,length:text.length,start:0}],duration:Math.max(1800,text.length*85)},
   firstWord:0,gender,rate:1.06,end:()=>{if(token===cinematicSpeechEpoch)usingLocalVoice=false;},
   error:()=>{if(token!==cinematicSpeechEpoch)return;usingLocalVoice=false;browserCinematicVoice(id,text,token);}
  });
  return;
 }
 browserCinematicVoice(id,text,token);
}
function stopSpeech(){stopCinematicVoice();speech=null;currentSpeaker=null;bubbleLayout=null;bubble.hidden=true;bubble.style.visibility='hidden';bubble.classList.remove('narration');bubble.replaceChildren();for(const p of people)p.speak?.(0,0,0);}
function setCue(id,text,offset=0){
 stopSpeech();if(!id||!text){bubble.hidden=true;return;}
 const actor=speakerActor(id);currentSpeaker=id;
 const b=document.createElement('b'),p=document.createElement('p');
 b.textContent=id==='m'?'Ahmed Marie':id==='f'?'Marianne':actor?.root.name||'La Croisée des Âmes';p.textContent=text.replaceAll('{pseudo}',alias);
 bubble.replaceChildren(b,p);bubble.hidden=!bubblesEnabled;
 // Place the complete reply only after the new camera is set, then latch it.
 // No alternate footer, typewriter animation or per-frame position switching.
 speech={id,text:p.textContent,start:offset,duration:Math.max(1400,text.length*58)};
 speakCinematicCue(id,p.textContent);
}
function updateActing(now){
 const line=lines[step];if(!line||!started||!ready||stage==='garden')return;
 const elapsed=shotElapsed(now),t=elapsed/1000,duration=line.ms/1000;
 if(line.secondary&&!secondCue&&elapsed>=line.secondary.at){secondCue=true;setCue(line.secondary.speaker,line.secondary.text,line.secondary.at);}
 if(now-lastMotion<50&&!people.some(p=>p.gait?.footwork))return;lastMotion=now;
 for(const p of people){
  const speaking=currentSpeaker===p.id,energy=speaking?1:.20;
  const localTime=(stage==='dojo'?elapsed/1000:now/1000)+(p.id==='f'?2.6:0);
  const pulse=.45+.55*Math.sin(localTime*1.75)**2,emphasis=actionEnvelope(t,duration)*pulse;
  const blinkPhase=(localTime+1.65)%5.1,blink=blinkPhase<.16?Math.sin(blinkPhase/.16*Math.PI):0;
  const partner=people.find(other=>other!==p);
  const watching=line.gesture==='watch';
  const lookTarget=watching?new T.Vector3(0,.65,-2.2):partner?.root.position;
  // While walking/sitting, let the body lead the motion. Otherwise direct
  // the eyes/head toward the actual other actor or the screen.
  const moving=line.invitation&&invitationMotion&&!invitationMotion.complete&&elapsed>=1350;
  const headYaw=p.dojoPerformance?.headYaw??(lookTarget&&!moving&&stage==='white'?T.MathUtils.clamp(turnDelta(p.root.rotation.y,facingYaw(p.root.position,lookTarget)),-.64,.64):0);
  const gaze=headYaw/.64;
  const g={time:localTime,energy,emphasis,kind:p.dojoPerformance?.gesture||(speaking?line.gesture:'listen'),gaze,headYaw,blink,gait:p.gait,poseGesture:p.dojoPerformance?.poseGesture};
  try{p.pose(p.sit,g);}catch(e){if(!p.motionWarning){remember('Animation des gestes',e.message||e);p.motionWarning=true;}}
  let jaw=0,wide=0;
  if(speaking&&speech&&speech.id===p.id){
   const st=elapsed-speech.start;
   if(st>=0&&!shotPaused){
    if(usingLocalVoice){
      // The jaw follows the actual spoken sound, including words whose
      // synthesis lasts longer than the initial estimate.
      const sound=cinematicLocalVoices?.position();
      jaw=sound?.energy?Math.min(.25,.025+.21*sound.energy):0;
      wide=sound?.energy?Math.min(.48,.1+.3*sound.energy):0;
    }else if(st<speech.duration){
      const char=speech.text[Math.min(speech.text.length-1,Math.floor(st/58))]?.toLowerCase()||' ';
      const vowel=/[aeiouyàâéèêëîïôùûüœ]/.test(char),closed=/[bmpfvw\s.,;:!?]/.test(char),phase=(Math.sin(st*.022)+1)*.5;
      jaw=closed?.014:(vowel?.07+.16*phase:.04+.07*phase);wide=vowel?.35:.08;
    }
   }
  }
  p.speak?.(jaw,wide,blink);
 }
}
const headPoint=new T.Vector3();
function actorHead(person,out=new T.Vector3()){
 if(person?.previewHead?.isObject3D)return person.previewHead.getWorldPosition(out);
 if(person?.previewHead)return out.copy(person.previewHead);
 if(person?.headBone){person.headBone.getWorldPosition(out);out.y+=.135;return out;}
 if(person?.head?.group){person.head.group.updateWorldMatrix(true,false);return person.head.group.localToWorld(out.set(0,.145,.035));}
 if(person){out.set(0,person.sit?1.12:1.53,0);return person.root.localToWorld(out);}
 return out.set(0,1.2,0);
}
function faceRect(person,view,w,h){
 const head=actorHead(person),depth=head.clone().applyMatrix4(view.matrixWorldInverse).z;
 if(depth>=-.04)return null;
 const scale=person.id==='m'?1.075:1.04;
 const right=new T.Vector3().setFromMatrixColumn(view.matrixWorld,0),up=new T.Vector3().setFromMatrixColumn(view.matrixWorld,1),points=[];
 for(const x of [-.14,.14])for(const y of [-.23,.17]){
  const p=head.clone().addScaledVector(right,x*scale).addScaledVector(up,y*scale).project(view);
  if(Number.isFinite(p.x)&&Number.isFinite(p.y))points.push({x:(p.x+1)*w/2,y:(1-p.y)*h/2});
 }
 if(!points.length)return null;
 const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
 return {l:Math.min(...xs)-14,r:Math.max(...xs)+14,t:Math.min(...ys)-14,b:Math.max(...ys)+14};
}
function isStagedDojo(line){return line?.scene==='dojo'&&line.demo===true;}
function dojoPoseAt(line,elapsed){return dojoBlocking(line,elapsed,{center:dojo.userData.introFloorBounds.getCenter(new T.Vector3()),floorY:dojo.userData.introFloorBounds.max.y});}
function stageDojoPeople(line,elapsed){
 const state=dojoPoseAt(line,elapsed);
 for(const person of people){const pose=state[person.id];person.root.position.copy(pose.position);person.root.rotation.y=pose.yaw;person.sit=0;person.gait=pose.gait;person.dojoPerformance=pose;}
 return dojoWardrobe?.apply(line,elapsed);
}
function previewPeople(elapsed,line=lines[step]){
 const preview=dojoWardrobe?.previewActor;
 if(preview){
  // Reserve one stable dialogue position for the whole gallery, including
  // the heads of its shorter and taller silhouettes at subsequent cuts.
  const base=dojo.userData.introFloorBounds.max.y;
  return [1.42,1.62,1.82,2.02].map(height=>({id:'preview',root:{position:preview.root.position.clone()},previewHead:preview.root.position.clone().setY(base+height),sit:0}));
 }
 return people.map(person=>{
  const root={position:person.root.position.clone()},head=actorHead(person);
  if(isStagedDojo(line)){const pose=dojoPoseAt(line,elapsed)[person.id];head.add(pose.position.clone().sub(root.position));root.position.copy(pose.position);return {id:person.id,root,previewHead:head,sit:0};}
  const item=invitationMotion?.items.find(item=>item.person===person);
  if(item){
   const t=elapsed-(person.id==='m'?0:1250),walk=T.MathUtils.smoothstep(t,2050,4600),sit=T.MathUtils.smoothstep(t,5350,7650);
   root.position.lerpVectors(item.from,item.standing.pos,walk);
   head.add(root.position.clone().sub(person.root.position));
   head.y-=(sit-person.sit)*.55;
  }
  return {id:person.id,root,previewHead:head,sit:person.sit};
 });
}
function dialogueFaceSamples(line,elapsed,w,h){
 const view=new T.PerspectiveCamera(46,w/h,.07,120),faces=[];
 const end=!secondCue&&line.secondary?line.secondary.at:line.ms;
 // Cover the whole camera path, not just the instant at which words appear.
 // Padding also accounts for breathing and the gentle head/eye animation.
 for(let i=0;i<=32;i++){
  const at=T.MathUtils.lerp(elapsed,Math.max(elapsed,end),i/32),actors=previewPeople(at,line);
  const shot=cameraFrame(line,at,w/h,actors,angle);
  view.fov=shot.fov;view.updateProjectionMatrix();view.position.copy(shot.eye);view.lookAt(shot.aim);if(shot.roll)view.rotateZ(shot.roll);view.updateMatrixWorld(true);
  for(const person of actors){const rect=faceRect(person,view,w,h);if(rect&&(isStagedDojo(line)||rect.r>0&&rect.l<w&&rect.b>0&&rect.t<h))faces.push(rect);}
 }
 return faces;
}
function applyDialogueProjection(projection){
 if(!projection||projection.scale===1&&projection.shift===0)return;
 const k=projection.scale,offset=1-k-2*projection.shift/canvasHost.clientHeight;
 camera.projectionMatrix.premultiply(new T.Matrix4().set(k,0,0,0,0,k,0,offset,0,0,1,0,0,0,0,1));
 camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}
function anchorBubble(line,elapsed){
 const preview=dojoWardrobe?.previewActor,speaker=preview||speakerActor(currentSpeaker);if(canvasHost.classList?.contains?.('bubbles-off')||!speaker||bubble.hidden)return;
 bubble.classList.toggle('narration',!!preview);
 const w=canvasHost.clientWidth,h=canvasHost.clientHeight;
 if(!bubbleLayout||bubbleLayout.w!==w||bubbleLayout.h!==h){
  bubble.style.width=Math.min(w-28,w<560?330:h<350&&isStagedDojo(line)?Math.min(300,w*.33):h<350?320:390)+'px';
  const face=faceRect(speaker,camera,w,h);if(!face)return;
  const faces=dialogueFaceSamples(line,elapsed,w,h);
  const panel=isStagedDojo(line)?dojoDemoReservedRect(w,h,line):null;
  bubbleLayout={...planSpeechBubble({width:w,height:h,bubbleWidth:bubble.offsetWidth,bubbleHeight:bubble.offsetHeight,face,faces,obstacles:panel?[panel]:[],reserve:line.shot==='dojo'&&!isStagedDojo(line)}),w,h};
  bubble.classList.remove('above','below','left','right');bubble.classList.add(bubbleLayout.side);
  bubble.style.left=bubbleLayout.l+'px';bubble.style.top=bubbleLayout.t+'px';bubble.style.visibility='visible';
 }
 applyDialogueProjection(bubbleLayout.projection);
 const face=faceRect(speaker,camera,w,h);if(!face)return;
 // Moving the little pointer leaves the body and the full text untouched.
 const x=T.MathUtils.clamp((face.l+face.r)/2-bubbleLayout.l,20,bubble.offsetWidth-20);
 const y=T.MathUtils.clamp((face.t+face.b)/2-bubbleLayout.t,18,bubble.offsetHeight-18);
 bubble.style.setProperty('--tail-x',Math.round(x)+'px');bubble.style.setProperty('--tail-y',Math.round(y)+'px');
}
function scheduleNext(ms){clearTimeout(autoTimer);if(autoplay)autoTimer=setTimeout(()=>{if(autoplay&&!pending)next();},Math.max(100,ms));}

// The original television remains in the scene. A texture, not a replacement
// television model, carries the silent film of the actual salon and game board.
let televisionFilm=null,filmShot='',lastFilmDraw=-Infinity;
function attachOriginalTVScreen(room,television){
 // Screen_LowB is the hollow bezel. The supplied TV Screen plane is the
 // actual display surface; retain its original geometry and authored UVs.
 const display=findChild(room,/^TV[\s_]*Screen/i);let mesh=null;
 display?.traverse(o=>{if(!mesh&&o.isMesh)mesh=o;});
 if(!display||!mesh)throw Error('La surface originale de l’écran est indisponible.');
 room.updateMatrixWorld(true);television.attach(display);
 display.traverse(o=>{o.visible=true;if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});
 return mesh;
}
function prepareFilm(){
 if(televisionFilm||!television)return;
 try{
  const mesh=attachOriginalTVScreen(room,television),size=bounds(mesh).getSize(new T.Vector3());
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=Math.round(640*size.y/size.x);
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.minFilter=T.LinearFilter;
  const ctx=canvas.getContext('2d');mesh.material=new T.MeshBasicMaterial({map:tex,toneMapped:false,side:T.DoubleSide});
  const video=$('film-video'),poster=new Image();poster.src=INTRO_FILM.poster;
  const playback=createFilmPlayback(video,message=>remember('Film de présentation',message));
  televisionFilm={mesh,ctx,canvas,tex,video,poster,playback};drawFilm(false);
 }catch(e){remember('Écran de télévision',e.message||e);}
}
function drawFilm(active=true){
 if(!televisionFilm)return;const {ctx,canvas,tex,video,poster}=televisionFilm,w=canvas.width,h=canvas.height;
 ctx.fillStyle='#142b26';ctx.fillRect(0,0,w,h);
 if(active){
  const image=video.readyState>=2?video:poster.complete&&poster.naturalWidth?poster:null;
  if(image){const iw=image.videoWidth||image.naturalWidth,ih=image.videoHeight||image.naturalHeight,s=Math.max(w/iw,h/ih);ctx.drawImage(image,(w-iw*s)/2,(h-ih*s)/2,iw*s,ih*s);}
 }
 tex.needsUpdate=true;
}
function stopFilm(){televisionFilm?.playback.stop();filmShot='';$('film-montage').hidden=true;}
function updateFilm(line,elapsed){
 const overlay=$('film-montage');
 if(line.shot!=='tv'&&line.shot!=='montage'){if(filmShot){stopFilm();drawFilm(false);}return;}
 const {seconds}=filmPosition(line.shot,elapsed),now=performance.now();
 televisionFilm?.playback.sync(seconds,shotPaused);
 if(filmShot!==line.id||now-lastFilmDraw>=45){drawFilm();lastFilmDraw=now;}
 filmShot=line.id;
 overlay.hidden=line.shot!=='montage'||elapsed<900;
 overlay.style.opacity=line.shot==='montage'?String(T.MathUtils.smoothstep(elapsed,900,1450)):'1';
}
let cutCamera=true;
const shotAim=new T.Vector3(),shotEye=new T.Vector3(),smoothAim=new T.Vector3(),smoothEye=new T.Vector3();
// Dialogue camera convention: stay on the negative-Z side of the line
// joining the two actors. A reverse shot shows the speaker from near the
// listener's shoulder, never from behind the speaking actor.
function exchangeFrame(person,other,isClose,push,htan,move){
 const head=actorHead(person),listener=actorHead(other);
 const axis=new T.Vector3().subVectors(listener,head);axis.y=0;
 const separation=axis.length();if(separation<.01)axis.set(person.id==='m'?1:-1,0,0);else axis.normalize();
 const side=new T.Vector3(axis.z,0,-axis.x);if(side.z>0)side.negate();
 const half=isClose?.245:.40,dist=Math.max(isClose?.86:1.25,half/htan);
 const along=Math.min(Math.max(.38,separation-.20),dist*.86)*(1-.075*push);
 const lateral=Math.max(isClose?.48:.68,Math.sqrt(Math.max(.18,dist*dist-along*along)))*(1-(move==='push'?.055:.02)*push);
 const aim=head.clone();aim.y-=isClose?.055:.22;
 const eye=aim.clone().addScaledVector(axis,along).addScaledVector(side,lateral);
 eye.y=head.y+.025;
 return {aim,eye};
}

// Blocking adapted from the Construct scene: an extreme close shot pulls out,
// rotates to an over-the-shoulder discovery, then travels toward the guide.
// No furniture exists in the scene graph during these two shots.
function discoveryFrame(visitor,guide,t,htan){
 const v=actorHead(visitor),g=actorHead(guide);
 const axis=g.clone().sub(v);axis.y=0;axis.normalize();
 const side=new T.Vector3(axis.z,0,-axis.x);if(side.z>0)side.negate();
 const u=T.MathUtils.smoothstep(t,.04,.42),orbit=T.MathUtils.smoothstep(t,.28,.93);
 const near=Math.max(.40,.105/htan),far=Math.max(1.10,.50/htan);
 const radius=T.MathUtils.lerp(near,far,u),az=orbit*2.66;
 const eye=v.clone().addScaledVector(axis,Math.cos(az)*radius).addScaledVector(side,Math.sin(az)*radius+.045);
 eye.y=v.y+.045-.05*orbit;
 const front=v.clone().sub(eye).normalize(),back=g.clone().sub(eye).normalize();
 const reveal=T.MathUtils.smoothstep(orbit,.40,1);
 // Bisect actual sight lines rather than using a fixed target in world space.
 // On a narrow portrait screen this keeps the second actor visible.
 const view=front.clone().lerp(back,.55*reveal).normalize();
 const aim=eye.clone().addScaledVector(view,Math.max(.4,radius));
 aim.y-=T.MathUtils.lerp(.015,.10,reveal);
 return {aim,eye,roll:(1-T.MathUtils.smoothstep(t,0,.24))*Math.PI*.5};
}
function guideApproachFrame(visitor,guide,t,htan){
 const v=actorHead(visitor),g=actorHead(guide),axis=v.clone().sub(g);axis.y=0;axis.normalize();
 const side=new T.Vector3(axis.z,0,-axis.x);if(side.z>0)side.negate();
 const previous=discoveryFrame(visitor,guide,1,htan);
 const near=g.clone().addScaledVector(axis,Math.max(.85,.25/htan)).addScaledVector(side,.34);near.y=g.y+.04;
 // First leave the visitor's shoulder to one side, then advance past it.
 const shoulder=previous.eye.clone().lerp(near,.46).addScaledVector(side,.42);
 const s=1-t;
 const eye=previous.eye.clone().multiplyScalar(s*s).addScaledVector(shoulder,2*s*t).addScaledVector(near,t*t);
 const aim=previous.aim.clone().lerp(g.clone().add(new T.Vector3(0,-.06,0)),T.MathUtils.smoothstep(t,0,.85));
 return {aim,eye};
}
function dojoCameraFrame(azimuth,distance,actors=people){
 const floor=dojo.userData.introFloorBounds,limit=dojo.userData.introCameraBounds;
 const aim=actors.reduce((v,p)=>v.add(p.root.position),new T.Vector3()).multiplyScalar(1/actors.length);
 const top=Math.max(...actors.map(p=>actorHead(p).y+.20));aim.y=floor.max.y+(top-floor.max.y)*.53;
 const dir=new T.Vector3(Math.sin(azimuth),0,Math.cos(azimuth));
 let available=Infinity;
 for(const key of ['x','z'])if(Math.abs(dir[key])>.00001){
  const edge=dir[key]>0?limit.max[key]:limit.min[key];available=Math.min(available,(edge-aim[key])/dir[key]);
 }
 const eye=aim.clone().addScaledVector(dir,Math.min(distance,available));eye.y=floor.max.y+1.55;
 limit.clampPoint(eye,eye);return {aim,eye};
}
function dojoCameraFov(eye,aim,aspect,actors=people){
 const forward=aim.clone().sub(eye).normalize(),right=new T.Vector3().crossVectors(forward,new T.Vector3(0,1,0)).normalize(),up=new T.Vector3().crossVectors(right,forward);
 let tangent=Math.tan(T.MathUtils.degToRad(23));
 // Fit the two real actor positions inside the remaining canvas on phones.
 // Widen the lens within the room instead of moving it through the walls.
 for(const person of actors){
  const top=actorHead(person).y+.20,base=dojo.userData.introFloorBounds.max.y;
  for(const x of [-.4,.4])for(const z of [-.28,.28])for(const y of [base,top]){
   const v=new T.Vector3(person.root.position.x+x,y,person.root.position.z+z).sub(eye),depth=Math.max(.1,v.dot(forward));
   tangent=Math.max(tangent,Math.abs(v.dot(up))/(depth*.88),Math.abs(v.dot(right))/(depth*Math.max(.25,aspect)*.88));
  }
 }
 return T.MathUtils.clamp(T.MathUtils.radToDeg(2*Math.atan(tangent)),46,112);
}
function cameraFrame(line,elapsed,aspect,actors=people,azimuth=angle){
 const shotAim=new T.Vector3(),shotEye=new T.Vector3();
 const t=T.MathUtils.clamp(elapsed/line.ms,0,1),push=t*t*(3-2*t);
 aspect=Math.max(.25,aspect);const vfov=46,htan=Math.tan(T.MathUtils.degToRad(vfov*.5))*aspect;
 let roll=0;
 if(line.shot==='discovery'){
  const v=discoveryFrame(actors[1],actors[0],t,htan);shotAim.copy(v.aim);shotEye.copy(v.eye);roll=v.roll;
 }else if(line.shot==='approach'){
  const v=guideApproachFrame(actors[1],actors[0],push,htan);shotAim.copy(v.aim);shotEye.copy(v.eye);
 }else if(isStagedDojo(line)){
  return dojoDirectedCamera({line,elapsed,aspect,actors,bounds:dojo.userData.introCameraBounds,floor:dojo.userData.introFloorBounds,headPosition:actorHead,previewActor:dojoWardrobe?.previewActor});
 }else if(line.shot==='dojo'){
  const frame=dojoCameraFrame(azimuth,radius,actors);shotAim.copy(frame.aim);shotEye.copy(frame.eye);
 }else if(line.shot==='arrival'){
  const a=actors[0].root.position,b=actors[1].root.position,center=a.clone().add(b).multiplyScalar(.5);
  const halfWidth=Math.max(1.85,Math.abs(a.x-b.x)*.5+.70);
  const d=Math.max(3.45,halfWidth/htan,1.16/Math.tan(T.MathUtils.degToRad(vfov*.5)))*(1-.035*push);
  shotAim.set(center.x,.90,center.z-.10);
  const reveal=T.MathUtils.smoothstep(elapsed,450,3000);
  const theta=Math.PI-.95+.95*reveal;
  shotEye.set(shotAim.x+Math.sin(theta)*d,1.53+.12*(1-reveal),shotAim.z+Math.cos(theta)*d);
 }else if(line.shot==='rear'){
  const a=actorHead(actors[0]),b=actorHead(actors[1]),mid=a.clone().add(b).multiplyScalar(.5);
  const tv=television?bounds(television).getCenter(new T.Vector3()):new T.Vector3(0,.65,-2.2);
  shotAim.copy(mid).lerp(tv,.32+.22*push);shotAim.y=.91;
  const d=Math.max(3.8,1.95/htan),theta=Math.PI*(1-push);
  shotEye.set(shotAim.x+Math.sin(theta)*d,1.70+.30*Math.sin(push*Math.PI),shotAim.z+Math.cos(theta)*d);
 }else if((line.shot==='tv'||line.shot==='montage')&&television){
  const b=bounds(television),center=b.getCenter(new T.Vector3()),size=b.getSize(new T.Vector3());
  const target=televisionFilm?bounds(televisionFilm.mesh).getCenter(new T.Vector3()):center;
  const towards=new T.Vector3().subVectors(new T.Vector3(0,center.y,0),center);towards.y=0;towards.normalize();
  const d=line.shot==='montage'?Math.max(.12,Math.max(.95,(size.x*.58)/htan)*(.87-.80*T.MathUtils.smoothstep(elapsed,0,950))):Math.max(.95,(size.x*.58)/htan)*(1-.13*push);
  shotAim.copy(target);shotEye.copy(target).addScaledVector(towards,d);shotEye.y+=.03;shotEye.x+=.045*(1-push);
 }else if(line.shot==='close'||line.shot==='medium'||line.shot==='reverse'){
  const person=actors.find(p=>p.id===line.speaker)||actors[0],other=actors.find(p=>p!==person);
  const v=exchangeFrame(person,other,line.shot!=='medium',push,htan,line.move);
  shotAim.copy(v.aim);shotEye.copy(v.eye);
 }else{
  const a=actorHead(actors[0]),b=actorHead(actors[1]),center=a.clone().add(b).multiplyScalar(.5);
  const wide=line.shot==='wide',exchange=line.shot==='exchange';
  const width=Math.max(exchange?1.02:1.40,Math.abs(a.x-b.x)*.5+(exchange?.31:.42));
  const dist=Math.max(wide?3.55:exchange?2.25:3.15,width/htan)*(1-.06*push);
  const theta=wide?2.97+.12*push:Math.PI-.055+.04*push;
  shotAim.copy(center);shotAim.y=wide?.92:center.y-(exchange?.24:.22);
  shotEye.set(shotAim.x+Math.sin(theta)*dist,shotAim.y+.33,shotAim.z+Math.cos(theta)*dist);
 }
 return {eye:shotEye,aim:shotAim,roll,fov:line.shot==='dojo'?dojoCameraFov(shotEye,shotAim,aspect,actors):vfov};
}
function cameraShot(line,elapsed,dt){
 const aspect=Math.max(.25,camera.aspect);
 if(line.shot==='dojo'&&!isStagedDojo(line)){
  targetAngle=T.MathUtils.clamp(targetAngle,Math.PI-.68,Math.PI+.68);
  angle=T.MathUtils.clamp(angle+(targetAngle-angle)*(1-Math.exp(-dt*2)),Math.PI-.68,Math.PI+.68);
 }
 const shot=cameraFrame(line,elapsed,aspect),shotEye=shot.eye,shotAim=shot.aim;
 camera.fov=shot.fov;camera.updateProjectionMatrix();camera.up.set(0,1,0);
 if(cutCamera||isStagedDojo(line)){smoothEye.copy(shotEye);smoothAim.copy(shotAim);cutCamera=false;}
 else{const alpha=1-Math.exp(-Math.max(.001,dt)*5);smoothEye.lerp(shotEye,alpha);smoothAim.lerp(shotAim,alpha);}
 if(line.shot==='dojo'){
  dojo.userData.introCameraBounds.clampPoint(smoothEye,smoothEye);
  camera.fov=isStagedDojo(line)?shot.fov:dojoCameraFov(smoothEye,smoothAim,aspect);camera.updateProjectionMatrix();
 }
 camera.position.copy(smoothEye);camera.lookAt(smoothAim);if(shot.roll)camera.rotateZ(shot.roll);camera.updateMatrixWorld(true);
}


async function showScene(index){
 if(!ready||pending||stage==='garden')return;
 const request=++sceneRequest;
 const requested=Math.max(0,Math.min(index,lines.length-1)),line=lines[requested],isDojo=line.scene==='dojo';
 clearTimeout(autoTimer);
 if(((line.seated||line.invitation)&&!seatsReady)||(isDojo&&(!dojo||!dojoWardrobe?.ready))){
  setPending(true);$('scene-wait').textContent='La suite se prépare…';
  try{if(isDojo)await prepareDojoPerformance();else await prepareSeats();}
  catch(e){if(request!==sceneRequest||stage==='garden')return;remember('Chargement de la suite',e.message||e);automatic(false);$('scene-wait').textContent='La suite n’a pas pu se charger. Tu peux passer l’introduction ou signaler une erreur.';setPending(false);$('scene-wait').hidden=false;return;}
  if(request!==sceneRequest||stage==='garden')return;
  setPending(false);
 }
 const previous=step>=0?lines[step]:null;
 $('scene-wait').hidden=true;step=requested;shotStart=performance.now();shotPaused=$('report-dialog').open||document.hidden||pauseReasons.size>0;pausedAt=shotStart;pausedElapsed=0;secondCue=false;cutCamera=true;
 stage=isDojo?'dojo':'white';
 mountRoom(false);whiteFloor.visible=!isDojo;if(dojo)dojo.visible=isDojo;
 scene.background.set(isDojo?0xd7c4a7:0xffffff);
 invitationMotion=null;for(const p of people){p.gait=null;p.dojoPerformance=null;}
 const layout=isDojo?'dojo':line.seated?'seated':'standing';
 if(line.invitation){beginInvitation();}
 else if(layout!==lastLayout){lastLayout=layout;layoutPeople(line.seated,isDojo,false);}
 if(isDojo){mountRoom(false);chairs.forEach(c=>c.visible=false);if(previous?.scene!=='dojo'){angle=targetAngle=Math.PI;radius=3.7;}}
 else{furnitureAt(line,0);if(line.shot==='tv'||line.shot==='rear')prepareFilm();}
 if(line.speaker)setCue(line.speaker,line.text);else{stopSpeech();bubble.hidden=true;}
 updateFilm(line,0);
 if(!previous||previous.scene!==line.scene||line.move==='fade'){
  $('cinema-fade').animate([{opacity:1},{opacity:0}],{duration:780,easing:'ease-in-out'});
 }
 status.textContent=isDojo?'Dojo · apprentissage':'Salle blanche · '+line.id;
 const dojoHelp=$('dojo-help');
 if(dojoHelp){
  dojoHelp.hidden=!isDojo;
  if(isDojo)dojoHelp.textContent={
    'dojo-arrivee':'☰ Menu · Ouvrir et replier les fonctions',
    'dojo-camera':'⌖ Caméra · Tourner, zoomer et recentrer',
    'dojo-deplacement':'◯ Joystick · Marcher dans le Salon',
    'dojo-demi-tour':'◎ Recentrer · Retrouver le personnage',
    'dojo-personnaliser':'♙ Avatar · Silhouette, visage, yeux et cheveux',
    'dojo-apparence':'✦ Volet translucide · Une seconde pression le replie',
    'dojo-vetements':'♧ Vêtements · Chemises, pantalons et chaussures',
    'dojo-enregistrer':'✓ Enregistrer · ☎ Appeler un invité',
    'dojo-construction':'♙ Inviter · Le pictogramme existant ouvre les personnages',
    'dojo-appeler':'☎ Appeler · Le téléphone existant ouvre la conversation vocale',
    'dojo-bulles':'▢ Bulles · Afficher ou masquer sans couper les voix'
  }[line.id]||'Le Salon s’ouvre depuis le bouton Menu.';
 }
 $('joystick').hidden=!isDojo||isStagedDojo(line);
 dojoDemo.update(line,0,{wardrobe:isStagedDojo(line)?stageDojoPeople(line,0):null});
 if(autoplay&&!shotPaused)scheduleNext(line.ms);
}

function startGarden(skipFinale=false){
 if(skipFinale)introSound.stop();else introSound.pause();
 ++sceneRequest;autoplay=false;clearTimeout(autoTimer);stopSpeech();stopFilm();dojoDemo.hide();dojoWardrobe?.restore();stage='garden';$('garden').hidden=false;setPending(false);
 $('joystick').hidden=true;$('skip').hidden=true;
 $('welcome').hidden=true;$('loading').hidden=true;$('scene-wait').hidden=true;
 status.textContent='La Croisée des Âmes';
 if(gardenLoaded)return;gardenLoaded=true;
 arrivalPlayer.start({promo:promotionMode,skip:skipFinale,paused:$('report-dialog').open||document.hidden||pauseReasons.size>0});
}
function next(){
 if(!started||pending||stage==='garden')return;
 // A throttled animation frame must not consume the only continuation timer.
 if(invitationMotion&&!invitationMotion.complete){scheduleNext(200);return;}
 if(step>=lines.length-1)startGarden();else void showScene(step+1);
}

function automatic(on,hold=false){
 const now=performance.now();autoplay=on;clearTimeout(autoTimer);
 if(on){
  if(shotPaused){shotStart=now-pausedElapsed;shotPaused=false;}
  const line=lines[step];if(line)scheduleNext(Math.max(250,line.ms-shotElapsed(now)));
 }else if(!hold&&!shotPaused&&step>=0){pausedElapsed=shotElapsed(now);pausedAt=now;shotPaused=true;}
 if(!on){introSound.pause();cinematicLocalVoices?.pause();try{cinematicSynth?.pause();}catch{}}else if(cinematicVoiceEnabled){cinematicLocalVoices?.resume();try{cinematicSynth?.resume();}catch{}}
}
$('enter').onclick=()=>{if(!authorized||!ready||stage==='garden')return;cinematicVoiceEnabled=true;prepareCinematicVoices();introSound.start();alias=$('pseudo').value.trim().slice(0,40)||alias;$('welcome').hidden=true;started=true;lastLayout='';setPending(false);autoplay=true;void showScene(0)};
$('skip').onclick=()=>{if(!authorized||stage==='garden')return;alias=$('pseudo').value.trim().slice(0,40)||alias;started=true;if(salonEntryMode){stopCinematicVoice();introSound.stop();finishSalonEntry();}else startGarden(true);};

function holdIntroduction(reason){
 if(pauseReasons.has(reason))return;
 if(!pauseReasons.size)resumeAfterPause=autoplay;
 pauseReasons.add(reason);automatic(false);introSound.pause();
 if(stage==='garden')arrivalPlayer.pause();
}
function releaseIntroduction(reason){
 if(!pauseReasons.delete(reason)||pauseReasons.size||document.hidden||$('report-dialog').open)return;
 if(stage==='garden')arrivalPlayer.resume();else if(resumeAfterPause)automatic(true);
 resumeAfterPause=false;
}
$('report-open').onclick=()=>{holdIntroduction('report');$('report-scene').value=stage+' · '+(step+1);$('report-count').textContent=problems.length+' entrées';$('report-dialog').showModal()};
$('report-close').onclick=()=>$('report-dialog').close();
$('report-dialog').addEventListener('close',()=>releaseIntroduction('report'));
document.addEventListener('visibilitychange',()=>{if(document.hidden)holdIntroduction('hidden');else releaseIntroduction('hidden');});
window.addEventListener('pagehide',event=>{if(event.persisted)holdIntroduction('page');else{stopCinematicVoice();cinematicLocalVoices?.disable();introSound.dispose();}});
window.addEventListener('pageshow',event=>{if(event.persisted)releaseIntroduction('page');});
$('report-add').onclick=()=>{const text=$('report-note').value.trim();if(text){remember($('report-type').value,text);$('report-note').value='';$('report-count').textContent=problems.length+' entrées'}};
$('report-export').onclick=()=>{
 const data={created:new Date().toISOString(),experience:'La Croisée des Âmes',step,stage,viewport:{width:innerWidth,height:innerHeight},entries:problems};
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='rapport-croisee-des-ames-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
};
function resize(){const w=canvasHost.clientWidth,h=canvasHost.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(canvasHost);resize();
const stick=$('joystick'),nub=$('nub');
function stickMove(e){const r=stick.getBoundingClientRect();
 joystick.x=T.MathUtils.clamp((e.clientX-r.left-r.width/2)/(r.width*.4),-1,1);
 joystick.y=T.MathUtils.clamp((e.clientY-r.top-r.height/2)/(r.height*.4),-1,1);
 nub.style.transform='translate('+joystick.x*29+'px,'+joystick.y*29+'px)';
}
stick.addEventListener('pointerdown',e=>{stick.setPointerCapture(e.pointerId);stickMove(e)});
stick.addEventListener('pointermove',e=>{if(stick.hasPointerCapture(e.pointerId))stickMove(e)});
for(const type of ['pointercancel','pointerup'])stick.addEventListener(type,()=>{joystick={x:0,y:0};nub.style.transform=''});
canvas.addEventListener('pointerdown',e=>{if(stage==='dojo'&&!isStagedDojo(lines[step])){drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)}});
canvas.addEventListener('pointermove',e=>{if(!drag)return;targetAngle=T.MathUtils.clamp(targetAngle+(e.clientX-drag[0])*.007,Math.PI-.68,Math.PI+.68);radius=T.MathUtils.clamp(radius+(e.clientY-drag[1])*.011,3,6);drag=[e.clientX,e.clientY]});
canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
const keys=new Set();
window.addEventListener('keydown',e=>keys.add(e.key.toLowerCase()));
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));

function frame(){
 requestAnimationFrame(frame);const dt=Math.min(.06,clock.getDelta());
 if(stage==='garden'){
  arrivalPlayer.tick();
  const arrival=arrivalFrame(arrivalPlayer.elapsed,{promo:promotionMode}),inSalon=arrival.phase==='salon';
  introSound.update({sceneId:inSalon?'salon-invitation':'arrival',elapsedMs:inSalon?arrival.invitationElapsedMs:arrival.gardenElapsedMs,timeMs:introductionDuration+(inSalon?0:arrival.gardenElapsedMs),promotion:promotionMode,playing:arrivalPlayer.state==='playing'&&!arrivalPlayer.paused&&!document.hidden&&!$('report-dialog').open});
  return;
 }
 if(!room)return;
 if(stage==='dojo'&&people[1]&&!isStagedDojo(lines[step])){
  const moveX=joystick.x+(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('q')?1:0);
  const moveZ=joystick.y+(keys.has('arrowdown')||keys.has('s')?1:0)-(keys.has('arrowup')||keys.has('z')?1:0);
  if(Math.hypot(moveX,moveZ)>.1){
   const p=people[1].root.position,walk=dojo.userData.introWalkBounds;
   p.x=T.MathUtils.clamp(p.x+moveX*dt*2.2,walk.min.x,walk.max.x);
   p.z=T.MathUtils.clamp(p.z+moveZ*dt*2.2,walk.min.z,walk.max.z);
   people[1].root.rotation.y=Math.atan2(-moveX,-moveZ);
  }
 }

 const now=performance.now();if(!shotPaused){advanceMovement(now);updateInvitation(now);}
 if(!started||step<0){mountRoom(false);camera.position.set(0,1.45,-4.5);camera.lookAt(0,1,0);renderer.render(scene,camera);return;}
 const line=lines[step],elapsed=shotElapsed(now);
 if(stage==='white')furnitureAt(line,elapsed);
 const wardrobe=isStagedDojo(line)?stageDojoPeople(line,elapsed):null;
 if(!shotPaused)updateActing(now);else for(const p of people)p.speak?.(0,0,0);
 updateFilm(line,elapsed);cameraShot(line,elapsed,dt);dojoDemo.update(line,elapsed,{wardrobe});anchorBubble(line,elapsed);
 introSound.update({sceneId:line.id,elapsedMs:elapsed,timeMs:soundOffsets[step]+Math.min(elapsed,line.ms),playing:started&&!shotPaused&&!pending&&!document.hidden&&!$('report-dialog').open,actors:people.map(person=>({id:person.id,gait:person.gait})),wardrobe});
 renderer.render(scene,camera);
}

async function authorize(){
 const response=await fetch('/api/membres/me?auteur=1',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(17000)});
 if(!response.ok)throw Error('La connexion administrateur est nécessaire.');
 const me=await response.json();if(!me.author)throw Error('Réservé au compte auteur.');
 alias=String(me.pseudo||'Voyageur').slice(0,40);$('pseudo').value=alias;authorized=true;$('access-denied').hidden=true;$('skip').disabled=false;
}

async function initialize(){
 if(initialTask)return initialTask;
 $('retry-load').hidden=true;$('load-error-details').hidden=true;$('load-title').textContent='Un instant…';showBootStage('La rencontre se prépare.');$('loading').hidden=false;$('welcome').hidden=true;
 initialTask=(async()=>{
 try{
  if(!authorized)await authorize();
  if(!room)await loadWhite();
  if(stage==='garden')return;
  if(people.length!==2)await loadPeople();
  if(stage==='garden')return;
  showBootStage('La rencontre est prête.');
  ready=true;$('enter').disabled=false;$('welcome').hidden=false;$('loading').hidden=true;
  // The opening scene can now be played, independently of the rest.
  setPending(false);
  void preloadNext();
 }catch(e){
  if(stage==='garden')return;
  remember('Chargement initial',e.message||e);
  if(!authorized&&/connexion|Réservé/i.test(String(e.message))){$('loading').hidden=true;$('access-denied').hidden=false;return;}
  $('load-title').textContent='Un contretemps';$('load-description').textContent='Le chargement a été interrompu. Les fichiers déjà reçus sont conservés.';const detail=$('load-error-details');detail.textContent=bootStage+' · '+String(e.message||e).slice(0,180);detail.hidden=false;$('retry-load').hidden=false;
 }finally{initialTask=null;}
 })();return initialTask;
}
$('retry-load').onclick=()=>void initialize();
frame();void initialize();
