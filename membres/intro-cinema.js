import * as THREE from 'three';
const authorKind=new URLSearchParams(location.search).get('auteur')==='edition'?'edition':'atelier';
const $=id=>document.getElementById(id),host=$('viewport'),bubble=$('bubble'),status=$('status'),controls=$('controls');
const reportKey='maison-rencontres-rapports-v2';let log=[],stage='white',step=-1,auto=false,timer=0,authorized=false,alias='Invité',last=performance.now(),stick={x:0,y:0},drag=null;
try{const old=JSON.parse(localStorage.getItem(reportKey)||'[]');if(Array.isArray(old))log=old.slice(-150)}catch{}
function record(type,message,details){log.push({time:new Date().toISOString(),type,stage,step,message:String(message).slice(0,2500),details:details||{}});try{localStorage.setItem(reportKey,JSON.stringify(log.slice(-150)))}catch{}}
window.addEventListener('error',e=>record('erreur',e.message,{file:e.filename,line:e.lineno}));
window.addEventListener('unhandledrejection',e=>record('erreur',String(e.reason)));
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;host.append(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#fffefd');scene.fog=new THREE.FogExp2('#fffefd',.012);
const camera=new THREE.PerspectiveCamera(48,1,.07,200);camera.position.set(0,2.5,-5);
const hemi=new THREE.HemisphereLight(0xffffff,0xa8a69b,2.0);scene.add(hemi);
const key=new THREE.DirectionalLight(0xffffff,2.7);key.position.set(-3,8,-5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-10;key.shadow.camera.right=10;key.shadow.camera.top=10;key.shadow.camera.bottom=-10;scene.add(key);
const fill=new THREE.PointLight(0xffffff,75,20);fill.position.set(4,5,2);scene.add(fill);
function mat(color,roughness=.9,other={}){return new THREE.MeshStandardMaterial({color,roughness,...other})}
const white=mat('#ffffff'),warmWhite=mat('#f7f7f6'),seam=mat('#e1e2e0'),wood=mat('#a8825c'),leather=mat('#e6e1da'),screenM=mat('#0b1b17',.3,{emissive:'#162e25',emissiveIntensity:.4});
function object(geo,m,parent,x=0,y=0,z=0){const mesh=new THREE.Mesh(geo,m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
function cube(parent,w,h,d,m,x,y,z){return object(new THREE.BoxGeometry(w,h,d),m,parent,x,y,z)}
function ball(parent,rx,ry,rz,m,x,y,z){const o=object(new THREE.SphereGeometry(1,20,12),m,parent,x,y,z);o.scale.set(rx,ry,rz);return o}
function cylinder(parent,r1,r2,h,m,x,y,z){return object(new THREE.CylinderGeometry(r1,r2,h,14),m,parent,x,y,z)}
function group(root){const g=new THREE.Group();root.add(g);return g}
const whiteRoom=group(scene),dojo=group(scene),garden=group(scene);
const floor=object(new THREE.PlaneGeometry(200,200),mat('#fefefd'),whiteRoom,0,-.03,0);floor.rotation.x=-Math.PI/2;
const furniture=group(whiteRoom);furniture.visible=false;
function chair(x){
 const c=group(furniture);c.position.set(x,0,0);
 cube(c,.98,.28,.95,leather,0,.48,0);cube(c,.98,.95,.22,leather,0,.99,.39);
 for(const sx of [-1,1]){cube(c,.16,.49,.95,leather,sx*.53,.69,0);for(const sz of [-1,1])cylinder(c,.07,.07,.45,mat('#b5b4b1'),sx*.43,.22,sz*.35)}
 return c;
}
chair(-1.05);chair(1.05);
const television=group(furniture);television.position.set(0,.94,-2.73);
cube(television,2.05,1.18,.13,mat('#222723',.42),0,.5,0);
const tvScreen=cube(television,1.91,1.04,.014,screenM,0,.5,.075);
cube(television,.12,.70,.12,mat('#60665d'),0,-.36,0);cube(television,1.07,.06,.4,mat('#646961'),0,-.7,0);
const screenCanvas=document.createElement('canvas');screenCanvas.width=640;screenCanvas.height=360;const ctx=screenCanvas.getContext('2d');const screenTexture=new THREE.CanvasTexture(screenCanvas);screenTexture.colorSpace=THREE.SRGBColorSpace;tvScreen.material=new THREE.MeshBasicMaterial({map:screenTexture});
function setScreen(message){
 ctx.fillStyle='#0c1a16';ctx.fillRect(0,0,640,360);ctx.strokeStyle='#476254';ctx.lineWidth=3;ctx.strokeRect(18,18,604,324);ctx.fillStyle='#d9e6d6';ctx.font='36px Georgia';ctx.textAlign='center';
 String(message).split('\n').forEach((line,i,a)=>ctx.fillText(line,320,170+(i-(a.length-1)/2)*48));screenTexture.needsUpdate=true;
}setScreen('UNE RENCONTRE');
function human(name,x,skinTone='#c9ac97'){
 const root=group(whiteRoom);root.position.set(x,0,0);
 const skin=mat(skinTone),hair=mat('#453a32'),eye=mat('#2d3933'),robe=mat('#fdfdfd'),trim=mat('#ededeb');
 const torso=group(root);torso.position.y=.92;
 const body=ball(torso,.31,.48,.19,robe,0,.22,0);
 // Cross-over white lapels, white belt and loose gi sleeves: no logo, no colored belt.
 const lapelL=cube(torso,.09,.66,.033,trim,-.11,.22,-.18);lapelL.rotation.z=-.23;
 const lapelR=cube(torso,.09,.66,.033,white,.11,.22,-.18);lapelR.rotation.z=.23;
 cube(torso,.65,.10,.40,white,0,-.05,0);
 for(const side of [-1,1]){
  const sleeve=ball(torso,.17,.31,.18,robe,side*.38,.25,0);sleeve.rotation.z=-side*.22;
  ball(torso,.10,.12,.11,skin,side*.43,-.035,-.02);
  ball(root,.18,.40,.19,robe,side*.16,.50,.01);
  ball(root,.13,.07,.22,trim,side*.16,.07,-.10);
 }
 const head=group(root);head.position.set(0,1.76,0);
 ball(head,.235,.29,.225,skin,0,0,0);
 ball(head,.24,.13,.23,hair,0,.24,.02);
 for(const side of [-1,1]){ball(head,.035,.024,.019,eye,side*.088,.038,-.213);ball(head,.032,.07,.022,skin,side*.23,-.01,.02)}
 ball(head,.048,.07,.05,skin,0,-.045,-.225);
 const lips=ball(head,.075,.014,.012,mat('#ae8178'),0,-.135,-.209);
 root.userData={name,skin,head,torso,robe,hair,eye,limbs:[]};
 return root;
}
const narrator=human('Narrateur',-1.05,'#c5a48f'),player=human('Joueur',1.05,'#d5b8a0');
const performers=[narrator,player];performers.forEach(x=>{x.rotation.y=0;x.position.z=0});
function seatActors(seat){for(const a of performers){a.userData.torso.position.y=seat?.65:.92;a.userData.head.position.y=seat?1.50:1.76;a.children.filter(ch=>ch.type==='Mesh'&&ch.geometry.type==='SphereGeometry').forEach(ch=>{});a.position.y=seat?.06:0}}
seatActors(false);
function makeDojo(){
 const base=cube(dojo,19,.25,16,wood,0,-.15,0);
 const tatami=mat('#bcb39c');for(let x=-7.2;x<=7.2;x+=2.4)for(let z=-5.7;z<=5.7;z+=1.9)cube(dojo,2.33,.06,1.83,tatami,x,.03,z);
 for(const x of [-8.8,8.8])for(const z of [-7,7])cylinder(dojo,.26,.32,5.8,wood,x,2.65,z);
 for(const z of [-7,7]){cube(dojo,18.3,.25,.36,wood,0,5.55,z);cube(dojo,18.3,.19,.27,wood,0,4.05,z)}
 for(const x of [-8.8,8.8])cube(dojo,.27,5.2,14.2,mat('#e5d8c0'),x,2.55,0);
 const back=cube(dojo,18,5.5,.15,mat('#f0e6d5'),0,2.5,7.25);
 for(let x=-7.5;x<8;x+=2.6){cube(dojo,.13,4.8,.25,wood,x,2.6,7.13);cube(dojo,2.40,.1,.25,wood,x+1.2,3.7,7.11)}
 for(const z of [-4,0,4])cube(dojo,18,.20,.17,wood,0,5.4,z);
 for(let z=-5;z<6;z+=3.3)cylinder(dojo,.28,.32,.35,mat('#f8dcaa',1),0,5.12,z);
 dojo.add(new THREE.AmbientLight('#ffe9ce',.45));
}makeDojo();dojo.visible=false;
function makeGarden(){
 const land=cube(garden,100,.13,100,mat('#84a67b'),0,-.15,0);
 const path=mat('#c2bba6');for(let z=-1;z>-25;z-=2)cube(garden,2.4,.045,2,path,0,-.03,z);
 const house=group(garden);house.position.set(0,0,-20);
 cube(house,13,6,7,mat('#f1eee3'),0,3.0,0);
 const roof=object(new THREE.ConeGeometry(9.2,2.9,4),mat('#a77b66'),house,0,7.3,0);roof.rotation.y=Math.PI/4;roof.scale.z=.54;
 for(const x of [-4.1,-2.2,2.2,4.1]){const w=cube(house,1.25,2.2,.1,mat('#69898b',.3),x,3.4,3.56);cube(house,1.37,.07,.12,white,x,3.4,3.66);cube(house,.07,2.2,.12,white,x,3.4,3.66)}
 cube(house,1.8,3.0,.14,mat('#846c55'),0,1.55,3.58);
 const leaf=mat('#4c8252');const bark=mat('#7d5e44');
 for(let i=0;i<24;i++){const angle=(i/24)*Math.PI*2,dist=13+4*Math.sin(i*2.8),x=Math.cos(angle)*dist,z=Math.sin(angle)*dist-9;if(Math.abs(x)<4&&z> -20)continue;
  cylinder(garden,.17,.22,2.6,bark,x,1.3,z);for(let j=0;j<3;j++)ball(garden,1.1,.85,.90,leaf,x+.3*Math.sin(j*2),2.6+j*.45,z);
 }
 const flowers=[mat('#ffc9d3'),mat('#d6b9ef'),mat('#f4e49d')];for(let i=0;i<155;i++){const x=(Math.sin(i*78.23)*17),z=(Math.cos(i*19.12)*16)-9;if(Math.abs(x)<1.5)continue;ball(garden,.08,.08,.08,flowers[i%3],x,.18,z)}
}makeGarden();garden.visible=false;
const butterflies=[];for(let i=0;i<16;i++){const g=group(garden),b=mat(i%2?'#faf6e8':'#fce0ac',.55,{side:THREE.DoubleSide});const left=object(new THREE.PlaneGeometry(.24,.32),b,g,-.14,0,0);const right=object(new THREE.PlaneGeometry(.24,.32),b,g,.14,0,0);left.rotation.y=-.4;right.rotation.y=.4;g.position.set((i%7-3)*1.7,1.2+(i%3)*.5,-4-(i%5)*2);butterflies.push({g,left,right,phase:i*2.4})}
let targetCamera={angle:0,height:2.9,radius:5.2},theta=0,height=2.9,radius=5.2,orbit={angle:0,height:2.9,radius:5.2},worldPlayer=new THREE.Vector3(0,0,2.0);
const text=[
 ['Narrateur','Qu’est-ce qu’une rencontre ? Qu’est-ce que véritablement l’autre ?','white',0],
 ['Narrateur','Est-ce celui qui me ressemble ? Celui qui me résiste ?','white',0],
 ['Narrateur','Ou bien celui dont la présence change quelque chose en moi ?','white',0],
 ['Narrateur','Nous n’avons pas besoin de répondre tout de suite. Viens.','white',0],
 ['Narrateur','Asseyons-nous.','seat',0],
 ['Narrateur','Voici le monde tel que tu l’as connu, {pseudo}.','seat',Math.PI],
 ['Narrateur','Un monde de masques. Un monde d’illusions.','seat',Math.PI],
 ['Narrateur','Un monde où tu as joué un personnage.','seat',Math.PI],
 ['Narrateur','Un monde où tous les matins tu te déguises pour aller travailler.','seat',Math.PI],
 ['Narrateur','Où tu ne rencontres que les masques des autres.','seat',Math.PI],
 ['Narrateur','Il existe un autre monde.','seat',0],
 ['Narrateur','Ici tu peux prendre le risque d’être toi-même.','seat',0],
 ['Narrateur','Tu peux aussi te déguiser. Personne ne te jugera.','seat',0],
 ['Narrateur','Suis-moi.','seat',0],
 ['Narrateur','Je dois t’expliquer comment ce monde fonctionne.','dojo',0],
 ['Narrateur','Ce monde est en construction. Et toi, tu participeras à sa construction.','dojo',0],
 ['Narrateur','Tu peux te déplacer, regarder autour de toi, modifier ton personnage et choisir son apparence.','dojo',0],
 ['Narrateur','Nous n’avons encore rien terminé. À toi de l’explorer.','dojo',0],
 ['Narrateur','Voici le jardin. Là-bas, la maison.','garden',0]
];
function message(line){bubble.replaceChildren();const who=document.createElement('b'),p=document.createElement('p');who.textContent=line[0];p.textContent=line[1].replaceAll('{pseudo}',alias);bubble.append(who,p);bubble.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,fill:'forwards'});}
let gardenOpened=false;
function revealRealGarden(){
 const holder=$('garden-original'),frame=$('garden-frame');holder.hidden=false;
 if(gardenOpened)return;gardenOpened=true;
 const ready=()=>{
  try{
   const doc=frame.contentDocument;
   if(!doc?.body?.classList.contains('ready'))return;
   const outdoor=doc.getElementById('pin');if(outdoor)outdoor.click();
   setTimeout(()=>{try{doc.getElementById('lookHome')?.click()}catch{}},650);
   status.textContent='Le véritable jardin 3D · utilise le joystick du salon';
  }catch(e){record('jardin','Ouverture du jardin original : '+String(e))}
 };
 frame.addEventListener('load',()=>{try{frame.contentWindow.addEventListener('salon-ready',ready,{once:true});if(frame.contentDocument?.body?.classList.contains('ready'))ready()}catch(e){record('jardin',e.message)}});
 frame.src='/membres/v27/salon.html?v=gestes50&resident=marianne';
}
function navigate(index){
 step=Math.max(0,Math.min(index,text.length-1));const line=text[step],s=line[2];stage=s==='seat'?'white':s;
 whiteRoom.visible=s==='white'||s==='seat';dojo.visible=s==='dojo';garden.visible=s==='garden';
 $('garden-original').hidden=s!=='garden';if(s==='garden')revealRealGarden();
 furniture.visible=s==='seat';seatActors(s==='seat');performers.forEach(a=>a.visible=s==='white'||s==='seat'||s==='dojo');
 narrator.position.set(-1.05,0,0);player.position.set(1.05,0,0);
 if(s==='dojo'){dojo.add(narrator,player);narrator.position.set(-1,0,0);player.position.set(1,0,0);scene.background.set('#d5c2a4');scene.fog.color.set('#d5c2a4');scene.fog.density=.006}
 else if(s==='garden'){garden.add(player);player.position.set(0,0,2);scene.background.set('#b9e4df');scene.fog.color.set('#b9e4df');scene.fog.density=.007}
 else{whiteRoom.add(narrator,player);scene.background.set('#fffefd');scene.fog.color.set('#fffefd');scene.fog.density=.009}
 targetCamera.angle=line[3];targetCamera.radius=s==='garden'?9:s==='dojo'?7:5.2;targetCamera.height=s==='garden'?3.1:s==='dojo'?2.8:2.9;
 bubble.hidden=false;if(s==='garden')setTimeout(()=>{if(stage==='garden')bubble.hidden=true},7000);status.textContent=(step+1)+' / '+text.length+' · '+(s==='seat'?'Salle blanche · les fauteuils':s==='dojo'?'Dojo':s==='garden'?'Jardin':'Salle blanche');
 message(line);
 $('next').textContent=step===text.length-1?'Revoir depuis le début':'Continuer';
 $('prev').disabled=step===0;controls.hidden=s!=='dojo';
 $('exit').hidden=s!=='garden';$('save').hidden=s!=='dojo';
 if(auto && step<14){clearTimeout(timer);timer=setTimeout(()=>navigate(step+1),s==='seat'&&step===5?6900:5300)}else if(auto){auto=false;clearTimeout(timer);$('auto').textContent='Lecture cinéma'}
}
function setAutomatic(value){auto=value;clearTimeout(timer);$('auto').textContent=value?'Pause cinéma':'Lecture cinéma';if(value)timer=setTimeout(()=>navigate(step===text.length-1?0:step+1),5200)}
$('next').onclick=()=>navigate(step===text.length-1?0:step+1);$('prev').onclick=()=>navigate(step-1);$('auto').onclick=()=>setAutomatic(!auto);
$('skip').onclick=()=>{setAutomatic(false);navigate(14)};$('exit').onclick=()=>location.href='/membre.html?auteur='+authorKind+'#salon';
$('save').onclick=()=>location.href='/membre.html?auteur='+authorKind+'#avatar';
$('start').onclick=()=>{alias=$('pseudo').value.trim().slice(0,40)||alias;$('welcome').hidden=true;navigate(0);setAutomatic(true)};
$('bug').onclick=()=>{$('bug-dialog').showModal();$('report-scene').value=stage+' · scène '+(step+1);$('count').textContent=log.length+' signalements mémorisés'};
$('cancel-report').onclick=()=>$('bug-dialog').close();
$('add-report').onclick=()=>{const note=$('report-note').value.trim();if(!note)return;$('report-note').value='';record($('report-kind').value,note);$('count').textContent=log.length+' signalements mémorisés'};
$('export-report').onclick=()=>{const report={version:'cinema-prive-3d-v2',date:new Date().toISOString(),device:navigator.userAgent,viewport:{width:innerWidth,height:innerHeight},scene:stage,step,entries:log};const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='rapport-maison-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(host);resize();
const surface=renderer.domElement;
surface.addEventListener('pointerdown',e=>{if(stage!=='dojo'&&stage!=='garden')return;drag={x:e.clientX,y:e.clientY};surface.setPointerCapture(e.pointerId)});
surface.addEventListener('pointermove',e=>{if(!drag)return;targetCamera.angle+=(e.clientX-drag.x)*.007;targetCamera.height=THREE.MathUtils.clamp(targetCamera.height+(e.clientY-drag.y)*.010,1,5);drag={x:e.clientX,y:e.clientY}});
surface.addEventListener('pointerup',()=>drag=null);surface.addEventListener('pointercancel',()=>drag=null);
surface.addEventListener('wheel',e=>{if(stage==='dojo'||stage==='garden'){e.preventDefault();targetCamera.radius=THREE.MathUtils.clamp(targetCamera.radius+e.deltaY*.01,3,15)}},{passive:false});
const pad=$('pad'),nub=$('nub');function padEvent(e){const r=pad.getBoundingClientRect(),dx=(e.clientX-r.left-r.width/2)/(r.width*.4),dy=(e.clientY-r.top-r.height/2)/(r.height*.4);stick={x:THREE.MathUtils.clamp(dx,-1,1),y:THREE.MathUtils.clamp(dy,-1,1)};nub.style.transform='translate('+stick.x*29+'px,'+stick.y*29+'px)'}
pad.addEventListener('pointerdown',e=>{pad.setPointerCapture(e.pointerId);padEvent(e)});pad.addEventListener('pointermove',e=>{if(pad.hasPointerCapture(e.pointerId))padEvent(e)});for(const t of ['pointerup','pointercancel'])pad.addEventListener(t,()=>{stick={x:0,y:0};nub.style.transform=''});
const keys=new Set();window.addEventListener('keydown',e=>keys.add(e.key.toLowerCase()));window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
const animationClock=new THREE.Clock();
function draw(){
 requestAnimationFrame(draw);const dt=Math.min(.06,animationClock.getDelta()),t=animationClock.elapsedTime;
 const gain=1-Math.exp(-dt*1.65);theta+=((targetCamera.angle-theta+Math.PI*3)%(Math.PI*2)-Math.PI)*gain; height=THREE.MathUtils.lerp(height,targetCamera.height,gain);radius=THREE.MathUtils.lerp(radius,targetCamera.radius,gain);
 if(stage==='garden'||stage==='dojo'){
  const dx=stick.x+(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('q')?1:0),dz=stick.y+(keys.has('arrowdown')||keys.has('s')?1:0)-(keys.has('arrowup')||keys.has('z')?1:0),len=Math.hypot(dx,dz);
  if(len>.08){const speed=dt*2.5/Math.max(1,len),a=player.position; a.x+=dx*speed;a.z+=dz*speed;a.x=THREE.MathUtils.clamp(a.x,stage==='dojo'?-6:-25,stage==='dojo'?6:25);a.z=THREE.MathUtils.clamp(a.z,stage==='dojo'?-5:-28,stage==='dojo'?5:10);player.rotation.y=Math.atan2(-dx,-dz)}
  else player.rotation.y*=.94;
 }
 const aim=stage==='garden'||stage==='dojo'?player.position:new THREE.Vector3(0,0,0),at=new THREE.Vector3(aim.x,stage==='garden'?1.4:1.30,aim.z);
 camera.position.set(at.x+Math.sin(theta)*radius,height,at.z-Math.cos(theta)*radius);camera.lookAt(at);
 for(const b of butterflies){b.left.rotation.y=Math.sin(t*7+b.phase)*.8-.30;b.right.rotation.y=-b.left.rotation.y;b.g.position.y+=Math.sin(t*2+b.phase)*.0008}
 if(stage==='white'&&furniture.visible){television.rotation.y=.02*Math.sin(t*.35)}
 renderer.render(scene,camera);
}draw();
async function auth(){
 const oldRoom=document.querySelector('header a[href*=\"membre.html\"]');if(oldRoom)oldRoom.href='/membre.html?auteur='+authorKind+'#salon';
 try{const res=await fetch('/api/membres/me?auteur=1',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(13000)});if(!res.ok)throw Error('Session auteur absente');const who=await res.json();if(!who.author)throw Error('Accès réservé à l’auteur');authorized=true;alias=(who.pseudo||'Invité').slice(0,40);$('pseudo').value=alias;$('locked').hidden=true}
 catch(e){record('auth',e.message);$('locked').hidden=false;$('welcome').hidden=true;$('toolbox').hidden=true}
}auth();
