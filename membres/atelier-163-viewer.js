import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {models,hashes,spec,CHUNK,digest} from './atelier-163-archive.mjs';
import {prepareWardrobe,prepareNeck} from './atelier-163-corrections.js';
const $=id=>document.getElementById(id),status=$('viewStatus'),stage=$('stage');
const set=s=>status.textContent=s;
let renderer,scene,camera,controls,root,mixer,busy=false,seq=0,current=null,raf=0;
const loader=new GLTFLoader(),clock=new T.Clock(),keys=new Set();
const prefs={m:{dressed:true,neck:1,ease:3},f:{dressed:true,neck:1,ease:3}};
async function request(path){for(let n=0;n<3;n++){try{const r=await fetch('/api/intro-private/atelier-163/'+path,{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(65000)});if(r.status===401||r.status===403)throw Object.assign(Error('Session auteur nécessaire.'),{fatal:true});if(!r.ok)throw Error('Ressource privée indisponible : '+r.status);return r;}catch(e){if(e.fatal||n===2)throw e;}}}
async function original(id){
 const m=models[id],manifest=await (await request(id+'/manifest')).json();
 if(!manifest.ready||manifest.present?.length!==hashes[id].length||!manifest.present.every(x=>x===true))throw Error('Archive incomplète : '+m.name);
 const packed=new Uint8Array(m.bytes);let done=0;
 for(let i=0;i<hashes[id].length;i+=3)await Promise.all(hashes[id].slice(i,i+3).map(async(hash,j)=>{
  const index=i+j,p=spec(id,index),b=await (await request(id+'/'+String(index).padStart(3,'0'))).arrayBuffer();
  if(b.byteLength!==p.bytes||await digest(b)!==hash)throw Error('Fragment incorrect : '+index);
  packed.set(new Uint8Array(b),index*CHUNK);done+=b.byteLength;set('Chargement de '+m.name+' · '+Math.floor(done/m.bytes*100)+' %');
 }));
 if(await digest(packed)!==m.sha)throw Error('Archive non conforme.');
 set('Décompression du modèle original…');
 const raw=await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();
 if(raw.byteLength!==m.rawBytes||await digest(raw)!==m.rawSha||new DataView(raw).getUint32(0,true)!==0x46546c67)throw Error('GLB original non conforme.');
 return loader.parseAsync(raw,'');
}
function init(){
 renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;stage.prepend(renderer.domElement);
 scene=new T.Scene();scene.background=new T.Color(0xe6e9e6);
 camera=new T.PerspectiveCamera(38,1,.01,100);camera.position.set(2,1.4,4);
 controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(0,.9,0);
 scene.add(new T.HemisphereLight(0xffffff,0x9a9b99,1.45));const light=new T.DirectionalLight(0xffffff,1.45);light.position.set(3,5,4);scene.add(light);
 const fill=new T.DirectionalLight(0xffffff,.65);fill.position.set(-3,2,-2);scene.add(fill);
 const floor=new T.GridHelper(14,28,0xb5c4bb,0xc9d3cc);scene.add(floor);
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();}
 new ResizeObserver(resize).observe(stage);resize();
 function frame(){raf=requestAnimationFrame(frame);const dt=Math.min(.05,clock.getDelta());mixer?.update(dt);if(root&&keys.size){const dx=(keys.has('right')?1:0)-(keys.has('left')?1:0),dz=(keys.has('back')?1:0)-(keys.has('forward')?1:0);if(dx||dz){root.position.x+=dx*dt*.8;root.position.z+=dz*dt*.8;controls.target.x+=dx*dt*.8;controls.target.z+=dz*dt*.8;camera.position.x+=dx*dt*.8;camera.position.z+=dz*dt*.8;}}controls.update();renderer.render(scene,camera);}
 frame();
}
function release(){if(!root)return;mixer?.stopAllAction();mixer?.uncacheRoot(root.children[0]);mixer=null;const mats=new Set(),geos=new Set(),textures=new Set();root.traverse(o=>{if(o.geometry)geos.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){mats.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});scene.remove(root);for(const x of textures)x.dispose();for(const x of mats)x.dispose();for(const x of geos)x.dispose();root=null;renderer.renderLists.dispose();}
function center(view='full'){if(!root||!current)return;const box=new T.Box3().setFromObject(root),c=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());let distance=Math.max(size.y/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2))),size.x/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2))*camera.aspect))*1.18;let direction=new T.Vector3(0,.02,1);if(view==='side')direction.set(1,0,0);if(view==='back')direction.set(0,0,-1);if(view==='neck'){const neckBox=new T.Box3().setFromObject(current.wardrobe.neck);if(!neckBox.isEmpty()){neckBox.getCenter(c);c.y+=.035;distance=Math.max(.44,.35/Math.max(.45,camera.aspect));}}controls.target.copy(c);camera.position.copy(c).addScaledVector(direction.normalize(),Math.max(.28,distance));controls.update();}
function syncWardrobe(){if(!current)return;const p=prefs[current.id];current.wardrobe.setDressed(p.dressed);$('wardrobe').textContent=p.dressed?'Retirer les vêtements':'Remettre les vêtements';$('wardrobe').setAttribute('aria-pressed',String(!p.dressed));$('wardrobe').disabled=false;$('neckStrength').value=String(p.neck);$('clothEase').value=String(p.ease);$('neckValue').textContent=Math.round(p.neck*100)+' %';$('easeValue').textContent=p.ease+' mm';}
function restorePose(){if(!current)return;mixer?.stopAllAction();for(const r of current.restNodes){r.o.position.copy(r.p);r.o.quaternion.copy(r.q);r.o.scale.copy(r.s);if(r.m)r.o.morphTargetInfluences.splice(0,r.m.length,...r.m);}current.model.updateMatrixWorld(true);}
async function select(id){if(busy)return;busy=true;const token=++seq;for(const b of document.querySelectorAll('[data-actor]'))b.disabled=true;
 try{if(!renderer)init();$('wardrobe').disabled=true;release();current=null;$('modelInfo').textContent='';$('clips').replaceChildren();$('bones').replaceChildren();set('Vérification de '+models[id].name+'…');const gltf=await original(id);if(token!==seq)return;
 const model=gltf.scene;model.updateMatrixWorld(true);const box=new T.Box3().setFromObject(model),size=box.getSize(new T.Vector3()),c=box.getCenter(new T.Vector3());
 if(!Number.isFinite(size.y)||size.y<=0)throw Error('Dimensions GLB invalides.');
 root=new T.Group();const fit=new T.Group();fit.add(model);fit.scale.setScalar(1.75/size.y);fit.position.set(-c.x*fit.scale.x,-box.min.y*fit.scale.y,-c.z*fit.scale.z);root.add(fit);scene.add(root);
 const boneSet=new Set();model.traverse(o=>{if(o.isSkinnedMesh){o.frustumCulled=false;for(const b of o.skeleton.bones)boneSet.add(b);}});
 const bones=[...boneSet];set('Préparation des raccords et du vêtement original…');const wardrobe=await prepareWardrobe(gltf),neckCorrection=prepareNeck(wardrobe);wardrobe.ease(prefs[id].ease);neckCorrection(prefs[id].neck);const restNodes=[];model.traverse(o=>{restNodes.push({o,p:o.position.clone(),q:o.quaternion.clone(),s:o.scale.clone(),m:o.morphTargetInfluences?.slice()});});current={id,model,bones,rest:bones.map(b=>b.quaternion.clone()),restNodes,clips:gltf.animations,wardrobe,neckCorrection};syncWardrobe();$('bones').add(new Option('Choisir une articulation',''));bones.forEach((b,i)=>$('bones').add(new Option(b.name||'Os '+(i+1),String(i))));
 mixer=new T.AnimationMixer(model);$('clips').add(new Option('Pose originale',''));for(let i=0;i<gltf.animations.length;i++)$('clips').add(new Option(gltf.animations[i].name||'Animation '+(i+1),String(i)));
 $('modelInfo').textContent=models[id].name+' · '+bones.length+' os liés aux maillages · '+gltf.animations.length+' animation(s) intégrée(s).';center();set('Modèle original chargé · raccords et inspection disponibles.');for(const b of document.querySelectorAll('[data-actor]'))b.setAttribute('aria-pressed',String(b.dataset.actor===id));
 }catch(e){set(e.message||String(e));release();current=null;$('wardrobe').disabled=true;}finally{busy=false;for(const b of document.querySelectorAll('[data-actor]'))b.disabled=false;}}
$('clips').onchange=()=>{if(!current)return;restorePose();if($('clips').value!=='')mixer.clipAction(current.clips[Number($('clips').value)]).reset().play();};
$('bones').onchange=()=>{for(const x of ['rx','ry','rz'])$(x).value='0';};
for(const x of ['rx','ry','rz'])$(x).oninput=()=>{if(!current||$('bones').value==='')return;mixer.stopAllAction();$('clips').value='';const i=Number($('bones').value);current.bones[i].quaternion.copy(current.rest[i]).multiply(new T.Quaternion().setFromEuler(new T.Euler(...['rx','ry','rz'].map(k=>T.MathUtils.degToRad(Number($(k).value))))));};
$('center').onclick=()=>center('full');
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>center(b.dataset.view);
$('wardrobe').onclick=()=>{if(!current||busy)return;const p=prefs[current.id];p.dressed=!p.dressed;syncWardrobe();};
$('neckStrength').oninput=()=>{if(!current||busy)return;const p=prefs[current.id];p.neck=Number($('neckStrength').value);current.neckCorrection(p.neck);$('neckValue').textContent=Math.round(p.neck*100)+' %';};
$('clothEase').oninput=()=>{if(!current||busy)return;const p=prefs[current.id];p.ease=Number($('clothEase').value);current.wardrobe.ease(p.ease);$('easeValue').textContent=p.ease+' mm';};
$('reset').onclick=()=>{if(!current)return;restorePose();$('clips').value='';for(const x of ['rx','ry','rz'])$(x).value='0';root.position.set(0,0,0);center();};
for(const b of document.querySelectorAll('[data-actor]'))b.onclick=()=>select(b.dataset.actor);
for(const b of document.querySelectorAll('[data-dir]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.dir);});for(const evt of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(evt,()=>keys.delete(b.dataset.dir));}
document.addEventListener('visibilitychange',()=>keys.clear());
async function start(){try{const r=await fetch('/api/membres/me?auteur=1',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok||!(await r.json()).author){set('Connexion auteur requise.');$('login').hidden=false;return;}$('tools').hidden=false;await select('f');}catch(e){set(e.message||String(e));}}
start();
