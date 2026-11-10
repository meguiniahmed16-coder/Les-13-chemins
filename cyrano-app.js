/* Cyrano — maquette 3D de cinématique et atelier d'écriture.
 * Les dialogues viennent de la V17 ; les lettres sont vérifiées localement.
 * La 3D est un repérage de réalisation, pas un rendu photoréaliste final.
 */
import * as T from 'three';
import {SCENES,MISSIONS,validateLetter,wordList,normalise} from './cyrano-core.js';
const $=id=>document.getElementById(id),canvas=$('world');
let renderer=null,scene=null,camera=null,people=[],smoke=[],dust=[],paper=null,letterIndex=0,completed=[null,null,null];
let cineRunning=false,cineTime=0,shotStart=0,shotIndex=0,last=0,manualCamera=null,manualExpires=0,hasSound=false,recognition=null,dictating=false;
const dark=0x20242c,wallColor=0x666b70;
const boxGeo=new T.BoxGeometry(1,1,1),sphereGeo=new T.SphereGeometry(1,16,12);
function material(color,roughness=.86,metalness=.02,extra={}){
 return new T.MeshStandardMaterial({color,roughness,metalness,...extra});
}
function cub(root,x,y,z,w,h,d,color,metalness=0){
 const mesh=new T.Mesh(boxGeo,material(color,.83,metalness));
 mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=h>.3;mesh.receiveShadow=true;root.add(mesh);return mesh;
}
function ball(root,x,y,z,w,h,d,color){
 const m=new T.Mesh(sphereGeo,material(color));m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=true;root.add(m);return m;
}
function cylinder(root,x,y,z,r,h,color,met=.02){
 const mesh=new T.Mesh(new T.CylinderGeometry(r,r,h,10),material(color,.72,met));
 mesh.position.set(x,y,z);mesh.castShadow=true;root.add(mesh);return mesh;
}
function viewSize(){
 if(!renderer)return;
 const w=Math.max(300,canvas.clientWidth),h=Math.max(260,canvas.clientHeight),ratio=renderer.getPixelRatio();
 if(canvas.width!==Math.floor(w*ratio)||canvas.height!==Math.floor(h*ratio)){
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 }
}
function concrete(seed){
 const c=document.createElement('canvas');c.width=256;c.height=256;
 const g=c.getContext('2d');g.fillStyle='#858888';g.fillRect(0,0,256,256);
 let r=seed;const random=()=>{r=(r*1664525+1013904223)>>>0;return r/4294967296};
 for(let i=0;i<11000;i++){
  const k=Math.floor(65+random()*95),opacity=.03+random()*.14;
  g.fillStyle='rgba('+k+','+k+','+(k+2)+','+opacity+')';
  g.fillRect(random()*256,random()*256,.3+random()*2,.3+random()*2);
 }
 const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(2,2);tex.colorSpace=T.SRGBColorSpace;
 return tex;
}
function buildWalls(root){
 const paint=concrete(3278),floorTex=concrete(1148);
 const wallMat=new T.MeshStandardMaterial({map:paint,color:0xb9b9b5,roughness:1,side:T.DoubleSide});
 const floorMat=new T.MeshStandardMaterial({map:floorTex,color:0x85807b,roughness:1});
 for(const x of [-1.5,1.5]){
  const f=new T.Mesh(boxGeo,floorMat);f.position.set(x,-.10,1.5);f.scale.set(2.98,.20,3);f.receiveShadow=true;root.add(f);
  // Pan arrière découpé autour de la fenêtre à barreaux.
  const backSections=[[-1.18,.85],[1.18,.85]];
  for(const [dx,w] of backSections){
   const v=new T.Mesh(boxGeo,wallMat);v.position.set(x+dx,1.55,-.11);v.scale.set(w,3.14,.17);v.receiveShadow=true;root.add(v);
  }
  const lower=new T.Mesh(boxGeo,wallMat);lower.position.set(x,.57,-.11);lower.scale.set(1.52,1.16,.17);root.add(lower);
  const top=new T.Mesh(boxGeo,wallMat);top.position.set(x,2.83,-.11);top.scale.set(1.52,.57,.17);root.add(top);
  // Petite ouverture haute ; les véritables barreaux sont modélisés séparément.
  const glow=new T.Mesh(new T.PlaneGeometry(1.52,1.13),new T.MeshBasicMaterial({
    color:x<0?0xffe9c8:0xa5c4c3,transparent:true,opacity:x<0?.95:.22,side:T.DoubleSide
  }));
  glow.position.set(x,1.95,-.245);root.add(glow);
  for(let i=0;i<6;i++){
   const bar=cylinder(root,x-.61+i*.244,1.97,-.16,.027,1.55,0x252e34,.82);
   bar.castShadow=true;
  }
  cub(root,x,1.38,-.13,1.60,.09,.07,0x343d40,.7);
  cub(root,x,2.52,-.13,1.60,.09,.07,0x343d40,.7);
  // Ciel de cellule fermé : pas de plafonds visibles depuis la caméra.
  const ceiling=new T.Mesh(boxGeo,wallMat);ceiling.position.set(x,3.12,1.5);ceiling.scale.set(3,.09,3);
  ceiling.receiveShadow=true;root.add(ceiling);
 }
 for(const x of [-3.02,3.02]){
  const wall=new T.Mesh(boxGeo,wallMat);wall.position.set(x,1.55,1.5);wall.scale.set(.12,3.13,3.1);wall.receiveShadow=true;root.add(wall);
 }
 // Mur mitoyen de deux cellules, avec un trou d'environ une feuille roulée.
 const segment=(y,h,z,d)=>{
  const m=new T.Mesh(boxGeo,wallMat);m.position.set(0,y,z);m.scale.set(.18,h,d);m.receiveShadow=true;root.add(m);
 };
 segment(.52,1.04,1.5,3);segment(2.15,1.80,1.5,3);
 segment(1.135,.17,.72,1.44);segment(1.135,.17,2.30,1.40);
 // Encadrement rugueux du petit passage pour les lettres.
 cylinder(root,0,1.14,1.49,.115,.04,0x483e35);
 // Tiges de la porte des cellules à l'avant, visibles de trois-quarts.
 for(const x0 of [-3,0]){
  for(let i=0;i<=6;i++)cylinder(root,x0+.25+i*.41,1.51,3.02,.019,2.91,0x353b3d,.72);
  cub(root,x0+1.5,1.48,3.02,2.95,.058,.08,0x41494b,.65);
 }
}
function bunk(root,x,z){
 for(const offset of [0,1.35]){
  cub(root,x,.36+offset,z,.95,.10,1.96,0x343e40,.65);
  cub(root,x,.46+offset,z,.86,.13,1.81,0x8f938f);
  cub(root,x,.56+offset,z+.70,.78,.14,.33,0xb7b4a7);
 }
 for(const side of [-1,1])for(const end of [-1,1]){
  cylinder(root,x+side*.48,.96,z+end*.99,.027,1.95,0x3e4447,.7);
 }
 // Barre de l'échelle et matelas du lit du haut.
 for(let i=0;i<4;i++)cub(root,x+.57,.38+i*.29,z-.68,.16,.035,.06,0x575e60,.6);
}
function table(root,x,z){
 for(const a of [-.40,.40])for(const b of [-.28,.28])cub(root,x+a,.41,z+b,.042,.78,.045,0x4a5355,.6);
 cub(root,x,.83,z,.96,.070,.70,0x745a45,.12);
 // Papier blanc crème au format lettre, crayon, petite enveloppe.
 const sheet=cub(root,x,.87,z,.47,.006,.62,0xeee5d0);
 paper=sheet;
 const pen=cylinder(root,x+.24,.88,z-.09,.012,.32,0x303f4a,.25);pen.rotation.x=Math.PI/2;pen.rotation.z=.25;
 cub(root,x-.19,.88,z-.27,.22,.010,.08,0xd5c0a4);
}
function prisonProps(root,x){
 // Lavabo et sanitaires rudimentaires intégrés à la cellule.
 const side=x<0?-1:1;
 cub(root,x+side*1.13,.64,.62,.40,.16,.32,0xb5b7b5,.16);
 cub(root,x+side*1.13,.93,.65,.37,.24,.19,0xbebeb8);
 cylinder(root,x+side*1.13,1.09,.55,.025,.15,0x767f82,.66);
 cub(root,x+side*.99,.30,.45,.29,.45,.40,0xc1bfb8);
 // Couverture pliée, paquet de cigarettes et petit cendrier.
 cub(root,x+.45,.67,1.09,.43,.12,.40,0x6e746a);
 cylinder(root,x-.42,.86,2.10,.085,.04,0x555b56,.26);
}
function human(root,x,z,{cyrano=false,tired=false}={}){
 const group=new T.Group();root.add(group);group.position.set(x,0,z);
 const skin=tired?0xbda58e:0xc7a288,cloth=tired?0x5a6767:0x626b74;
 // Anatomie assise : deux jambes pliées, torse, bras, cou et tête.
 cub(group,0,.98,.02,.62,.63,.36,cloth);
 cub(group,0,1.21,-.06,.65,.16,.40,tired?0x64605b:0x727c82);
 cylinder(group,0,1.39,-.02,.11,.18,skin);
 ball(group,0,1.63,-.06,.24,.31,.23,skin);
 const jaw=ball(group,0,1.47,.055,.22,.115,.15,tired?0x927d70:0xae8572);
 const nose=new T.Mesh(new T.ConeGeometry(cyrano?.105:.075,cyrano?.47:.24,11),
  material(skin,.91));nose.rotation.x=-Math.PI/2;nose.position.set(0,1.63,cyrano?.30:.23);group.add(nose);
 ball(group,-.10,1.68,.16,.036,.025,.017,0x2d2927);
 ball(group,.10,1.68,.16,.036,.025,.017,0x2d2927);
 cub(group,0,1.83,-.075,.42,.11,.35,tired?0x464140:0x333333);
 for(const side of [-1,1]){
  cub(group,side*.19,.60,.24,.25,.25,.50,tired?0x50585a:0x555963);
  cub(group,side*.20,.40,.49,.18,.25,.47,0x555a60);
  const arm=cub(group,side*.37,1.04,.22,.18,.46,.16,cloth);
  arm.rotation.x=cyrano?-.52:-.25;
  ball(group,side*.35,.77,.45,.11,.12,.13,skin);
 }
 // Cigarette : les deux détenus fument, chacun à sa manière.
 const cig=new T.Group();group.add(cig);
 cig.position.set(cyrano?.37:-.31,1.23,.43);
 const rod=cylinder(cig,0,0,.0,.016,.28,0xeee9dd);rod.rotation.x=Math.PI/2;
 cylinder(cig,0,0,.13,.019,.028,0xd6996a).rotation.x=Math.PI/2;
 // Réceptacle animé de fumée semi-transparent, de volume faible.
 for(let i=0;i<7;i++){
  const puff=new T.Mesh(new T.SphereGeometry(1,8,6),
   new T.MeshBasicMaterial({color:0xdce6de,transparent:true,opacity:0,depthWrite:false}));
  root.add(puff);smoke.push({puff,source:new T.Vector3(x+(cyrano?.37:-.31),1.23,z+.53),seed:i*1.3+(cyrano?0:3.7)});
 }
 return group;
}
function makeScene(){
 scene=new T.Scene();scene.background=new T.Color(0x111b25);scene.fog=new T.FogExp2(0x18222a,.025);
 camera=new T.PerspectiveCamera(52,16/9,.10,70);
 scene.add(new T.HemisphereLight(0x9caec4,0x222125,1.35));
 const warm=new T.DirectionalLight(0xffedd1,5.3);
 warm.position.set(-1.6,2.75,-3.8);warm.target.position.set(-1.4,.95,1.75);
 warm.castShadow=true;warm.shadow.mapSize.set(1024,1024);
 warm.shadow.camera.left=-5;warm.shadow.camera.right=5;warm.shadow.camera.top=5;warm.shadow.camera.bottom=-5;warm.shadow.camera.near=.3;warm.shadow.camera.far=15;
 scene.add(warm,warm.target);
 const cold=new T.PointLight(0x9dbbc3,2.25,9);cold.position.set(2.75,2.40,2);scene.add(cold);
 const fill=new T.PointLight(0xffd4a2,.48,7);fill.position.set(-.9,1.45,2.5);scene.add(fill);
 buildWalls(scene);
 bunk(scene,-2.43,1.55);
 bunk(scene,1.65,1.53);
 table(scene,-1.26,1.97);
 prisonProps(scene,-1.5);prisonProps(scene,1.5);
 people.push(human(scene,-1.25,1.32,{cyrano:true}),human(scene,1.44,1.62,{tired:true}));
 // Le contre-jour est simulé avec deux faisceaux translucides et de fines poussières.
 const rayMat=new T.MeshBasicMaterial({color:0xffe9be,transparent:true,opacity:.065,
  blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
 for(let i=0;i<3;i++){
  const cone=new T.Mesh(new T.ConeGeometry(.50+i*.22,3.3,22,1,true),rayMat.clone());
  cone.position.set(-1.5+i*.23,1.52,.95+i*.28);
  cone.rotation.x=Math.PI*.55;scene.add(cone);
 }
 for(let i=0;i<95;i++){
  const d=new T.Mesh(new T.SphereGeometry(.009,5,4),new T.MeshBasicMaterial({
   color:0xffe7b9,transparent:true,opacity:.12+Math.random()*.30}));
  d.position.set(-2.75+Math.random()*2.65,.30+Math.random()*2.45,.05+Math.random()*2.9);
  scene.add(d);dust.push({mesh:d,offset:Math.random()*9});
 }
 renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.02;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 camera.position.set(0,2.8,7.4);camera.lookAt(0,1.40,1.20);
 viewSize();
}
function speakLine(line){
 if(!hasSound||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;
 if(line.who==='ambiance')return;
 try{
  const synth=window.speechSynthesis;synth.cancel();
  const u=new SpeechSynthesisUtterance(line.text.replace(/^—\s*/,''));
  u.lang='fr-FR';u.rate=line.who==='cedric'?.87:.93;u.pitch=line.who==='cedric'?.72:.91;
  synth.speak(u);
 }catch(e){console.warn('Voix non disponible :',e);}
}
function setShot(index){
 shotIndex=index;shotStart=cineTime;
 const sceneItem=SCENES[index];
 $('caption').textContent=sceneItem.text;
 $('caption').dataset.speaker=sceneItem.who;
 $('speaker').textContent=sceneItem.who==='cedric'?'CELLULE B · CÉDRIC':sceneItem.who==='narrateur'?'CELLULE A · LE NARRATEUR':'QUARTIER D’ISOLEMENT';
 $('sceneLabel').textContent=sceneItem.who==='cedric'?'Cellule B · Cédric':sceneItem.who==='narrateur'?'Cellule A · 9 m²':'Deux cellules mitoyennes';
 speakLine(sceneItem);
}
function startFilm(){
 if(!renderer){startWriting();return;}
 $('intro').hidden=true;
 $('writing').hidden=true;$('finished').hidden=true;$('cinema').hidden=false;
 cineRunning=true;cineTime=0;manualCamera=null;manualExpires=0;last=0;setShot(0);
}
function startWriting(){
 cineRunning=false;window.speechSynthesis?.cancel?.();
 $('cinema').hidden=true;$('intro').hidden=true;$('writing').hidden=false;$('finished').hidden=true;
 letterIndex=0;completed=[null,null,null];renderMission();
 $('writing').scrollIntoView({block:'start',behavior:'smooth'});
}
function renderMission(){
 const mission=MISSIONS[letterIndex];
 $('missionTitle').textContent=mission.title;$('missionGoal').textContent=mission.intent+' Insère les cinq mots imposés dans une vraie lettre d’amour.';
 $('letter').value='';
 $('feedback').hidden=true;$('feedback').classList.remove('ok');
 $('nextLetter').hidden=true;$('evaluate').disabled=false;
 [...$('progress').children].forEach((el,i)=>{
  el.classList.toggle('active',i===letterIndex);
  el.classList.toggle('done',i<letterIndex);
 });
 renderRequired();
}
function renderRequired(){
 const mission=MISSIONS[letterIndex],terms=new Set(wordList($('letter').value));
 const el=$('required');el.replaceChildren();
 for(const term of mission.required){
  const span=document.createElement('span');span.textContent=term;span.className=terms.has(normalise(term))?'found':'';
  el.append(span);
 }
 $('wordCount').textContent=wordList($('letter').value).length+' mots · minimum 65';
}
function showResult(result){
 const panel=$('feedback');panel.replaceChildren();panel.hidden=false;
 panel.classList.toggle('ok',result.ok);
 const title=document.createElement('strong');title.textContent=result.ok?'✓ Lettre acceptée par Cédric':'Cédric attend une vraie lettre d’amour';
 panel.append(title);
 const p=document.createElement('p');p.textContent=result.ok?
  'Les cinq mots sont intégrés et la lettre parle vraiment d’amour. Elle peut passer par le petit trou du mur.':
  'Il reste des choses à travailler :';
 panel.append(p);
 if(!result.ok){
  const ul=document.createElement('ul');
  for(const issue of result.issues){const li=document.createElement('li');li.textContent=issue;ul.append(li);}
  panel.append(ul);
 }
}
function evaluate(){
 const result=validateLetter($('letter').value,letterIndex);
 showResult(result);
 if(!result.ok)return;
 completed[letterIndex]=$('letter').value;
 $('nextLetter').hidden=false;$('evaluate').disabled=true;
 $('nextLetter').textContent=letterIndex===2?'✓ Terminer les trois lettres':'Lettre suivante →';
}
function advanceLetter(){
 if(!completed[letterIndex])return;
 if(letterIndex===2){
  $('writing').hidden=true;$('finished').hidden=false;$('finished').scrollIntoView({block:'start',behavior:'smooth'});
  return;
 }
 letterIndex++;renderMission();$('writing').scrollIntoView({block:'start'});
}
function setupSpeechInput(){
 const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SpeechRecognition){
  $('dictate').textContent='🎙 Utiliser le micro du clavier';
  $('dictate').onclick=()=>{$('letter').focus();$('dictationHelp').textContent='Sur ton clavier, touche le microphone si disponible.';};
  return;
 }
 recognition=new SpeechRecognition();
 recognition.lang='fr-FR';recognition.interimResults=false;recognition.continuous=true;
 recognition.onresult=event=>{
  let added='';
  for(let i=event.resultIndex;i<event.results.length;i++){
   if(event.results[i].isFinal)added+=event.results[i][0].transcript.trim()+' ';
  }
  if(added){
   const el=$('letter');el.value+=(el.value&&!el.value.endsWith(' ')?' ':'')+added;
   renderRequired();$('feedback').hidden=true;$('evaluate').disabled=false;$('nextLetter').hidden=true;
  }
 };
 recognition.onerror=event=>{$('dictationHelp').textContent='Dictée indisponible : '+event.error;};
 recognition.onend=()=>{dictating=false;$('dictate').textContent='🎙 Dictée';};
 $('dictate').onclick=()=>{
  if(dictating){recognition.stop();return;}
  try{recognition.start();dictating=true;$('dictate').textContent='■ Arrêter la dictée';}
  catch{dictating=false;$('dictationHelp').textContent='Active le microphone depuis le clavier.';}
 };
}
function setControls(){
 $('begin').onclick=startFilm;
 $('skip').onclick=startWriting;
 $('replay').onclick=startFilm;
 $('sound').onclick=()=>{
  hasSound=!hasSound;$('sound').textContent=hasSound?'Son ON':'Son OFF';
  $('sound').setAttribute('aria-pressed',String(hasSound));
  if(!hasSound)window.speechSynthesis?.cancel?.();
 };
 $('cellA').onclick=()=>{manualCamera='narrateur';manualExpires=cineTime+7;};
 $('cellB').onclick=()=>{manualCamera='cedric';manualExpires=cineTime+7;};
 $('letter').addEventListener('input',()=>{
  renderRequired();$('feedback').hidden=true;$('evaluate').disabled=false;$('nextLetter').hidden=true;
 });
 $('evaluate').onclick=evaluate;
 $('nextLetter').onclick=advanceLetter;
 $('copy').onclick=async()=>{
  try{await navigator.clipboard.writeText($('letter').value);$('dictationHelp').textContent='Lettre copiée';}
  catch{$('letter').focus();$('letter').select();$('dictationHelp').textContent='Sélectionne le texte puis copie-le';}
 };
 $('restart').onclick=()=>{startFilm();$('cinema').scrollIntoView({block:'start'});};
 $('back').onclick=()=>{location.href='jeu.html';};
 setupSpeechInput();
}
function cameraTarget(shot){
 if(shot===0)return {eye:new T.Vector3(0,2.66,7.1),look:new T.Vector3(0,1.32,1.3)};
 if(shot===12||shot===13)return {eye:new T.Vector3(.62,1.55,3.45),look:new T.Vector3(0,1.13,1.50)};
 if(shot===3||shot===5||shot===7||shot===9||shot===11)return {eye:new T.Vector3(-.12,1.85,3.58),look:new T.Vector3(-1.22,1.44,1.30)};
 if(shot===2)return {eye:new T.Vector3(-2.13,1.95,4.43),look:new T.Vector3(-1.22,1.31,1.32)};
 if(SCENES[shot]?.who==='cedric')return {eye:new T.Vector3(2.60,1.91,4.05),look:new T.Vector3(1.40,1.30,1.63)};
 return {eye:new T.Vector3(-1.15,2.06,4.6),look:new T.Vector3(-1.17,1.29,1.65)};
}
const lookSmoothed=new T.Vector3(0,1.32,1.3);
function loop(ms){
 requestAnimationFrame(loop);
 const dt=Math.min(.065,Math.max(0,last?(ms-last)/1000:0));last=ms;
 if(!renderer||$('cinema').hidden)return;
 if(cineRunning){
  cineTime+=dt;
  if(cineTime-shotStart>SCENES[shotIndex].seconds){
   if(shotIndex===SCENES.length-1){startWriting();return;}
   setShot(shotIndex+1);
  }
 }
 for(const entry of smoke){
  const t=(ms*.00037+entry.seed*.19)%1;
  entry.puff.position.set(entry.source.x+Math.sin(ms*.001+entry.seed)*.07*t,
   entry.source.y+t*.88,entry.source.z+Math.cos(ms*.00085+entry.seed)*.065*t);
  entry.puff.scale.setScalar(.027+t*.13);
  entry.puff.material.opacity=Math.sin(Math.PI*t)*.19;
 }
 for(const d of dust)d.mesh.position.y+=dt*Math.sin(ms*.0009+d.offset)*.016;
 if(paper)paper.rotation.y=Math.sin(ms*.0015)*.003;
 const current=manualCamera&&cineTime<manualExpires?manualCamera:SCENES[shotIndex].who;
 if(manualCamera&&cineTime>=manualExpires)manualCamera=null;
 const target=manualCamera?manualCamera==='cedric'?cameraTarget(1):cameraTarget(2):cameraTarget(shotIndex);
 const blend=Math.min(1,dt*2.0+.008);
 camera.position.lerp(target.eye,blend);lookSmoothed.lerp(target.look,blend);camera.lookAt(lookSmoothed);
 $('sceneClock').textContent=String(Math.floor(cineTime/60)).padStart(2,'0')+':'+String(Math.floor(cineTime%60)).padStart(2,'0');
 viewSize();renderer.render(scene,camera);
}
setControls();
try{makeScene();requestAnimationFrame(loop);}
catch(e){console.warn('Cyrano, rendu 3D indisponible :',e);$('caption').textContent='Le rendu 3D n’est pas disponible sur ce navigateur. Le jeu d’écriture reste accessible.';}
