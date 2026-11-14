import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {poseCitizen,poseActivity,poseSecret,gaitSample} from './catalogne-motion.js';
import {createSecretControls,bindSecretButton,DOUBLE_TAP_MS} from './catalogne-secret-controls.js';
import {drawParkMap} from './catalogne-3d-map.js';
import {VOICE_PROFILES,voiceProfile,voiceGender,assignGameVoices} from './catalogne-3d-voices.js';
import {PARK,CLIENTS,PATROLS,newRun,advance,sell,dodge,nearestClient,instruction,distance,SALE_DIALOGUES,POLICE_SHOUTS,saleDialogue} from './catalogne-3d-core.js';
const read=p=>readFileSync(new URL('./'+p,import.meta.url),'utf8');
test('Le modèle adulte conserve ses longueurs de membres dans la marche et les activités',async()=>{
 const bytes=readFileSync(new URL('./assets/marmousets/adult.glb',import.meta.url)),loader=new GLTFLoader();
 loader.register(()=>({name:'untextured-test',loadMaterial:()=>Promise.resolve(new T.MeshBasicMaterial())}));
 const asset=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const model=asset.scene;model.updateMatrixWorld(true);
 const box=new T.Box3().setFromObject(model),h=1.79,scale=h/box.getSize(new T.Vector3()).y;
 model.scale.multiplyScalar(scale);model.position.y-=box.min.y*scale;
 const group=new T.Group();group.add(model);group.updateMatrixWorld(true);
 const bones={};model.traverse(b=>{if(b.isBone)bones[b.name]={bone:b,rest:b.quaternion.clone()};});
 const rig={group,bones,h},lengths=Object.fromEntries(Object.entries(bones).map(([name,{bone}])=>[name,bone.position.length()]));
 const check=()=>{for(const [name,{bone}]of Object.entries(bones)){assert.ok(bone.matrixWorld.elements.every(Number.isFinite),name);assert.ok(Math.abs(bone.position.length()-lengths[name])<1e-9,'Membre étiré : '+name);}};
 let previous=null,low=Infinity,high=-Infinity;
 for(let i=0;i<=120;i++){
  poseCitizen(rig,i/120/1.12,true);check();
  const foot=bones.Foot_L.bone.getWorldPosition(new T.Vector3());low=Math.min(low,foot.y);high=Math.max(high,foot.y);
  if(previous)assert.ok(foot.distanceTo(previous)<.08,'Saut entre deux poses de course');previous=foot;
 }
 assert.ok(low>=.035&&high>.13,'Pied au sol puis retour de la jambe');
 assert.ok(Math.abs(gaitSample(0,h).left.forward-gaitSample(1/1.12,h).left.forward)<1e-10);
 for(const kind of ['guitar','listen','yoga','taichi','embrace','recline'])for(let variant=0;variant<2;variant++)for(const time of [0,1,3,6]){poseActivity(rig,kind,time,variant);check();}
 for(const kind of ['dance','joint'])for(let i=0;i<=160;i++){poseSecret(rig,kind,i/20);check();}
 poseCitizen(rig,0,false);check();assert.equal(group.position.y,.012,'Retour à la posture normale');
});
function tapHarness(){
 let clock=0,id=0;const timers=new Map(),events=[];
 const control=createSecretControls({single:b=>events.push('single:'+b),double:b=>events.push('double:'+b),now:()=>clock,schedule:(fn,ms)=>{timers.set(++id,{fn,at:clock+ms});return id;},unschedule:n=>timers.delete(n)});
 return {control,events,press:b=>control.press(b),advance(ms){clock+=ms;for(const [n,t]of [...timers])if(t.at<=clock){timers.delete(n);t.fn();}}};
}
test('Un appui simple garde sa fonction et ne se déclenche qu’une fois',()=>{
 for(const button of ['red','yellow']){const h=tapHarness();h.press(button);assert.deepEqual(h.events,[]);h.advance(DOUBLE_TAP_MS);assert.deepEqual(h.events,['single:'+button]);h.advance(1000);assert.equal(h.events.length,1);}
});
test('Deux appuis rapprochés déclenchent seulement le geste secret, jamais une vente ou une esquive',()=>{
 for(const button of ['red','yellow']){const h=tapHarness();h.press(button);h.advance(160);h.press(button);h.advance(1000);assert.deepEqual(h.events,['double:'+button]);}
});
test('Deux appuis espacés et des couleurs alternées restent des commandes ordinaires',()=>{
 const h=tapHarness();h.press('red');h.advance(500);h.press('red');h.advance(500);assert.deepEqual(h.events,['single:red','single:red']);
 const mixed=tapHarness();mixed.press('yellow');mixed.advance(90);mixed.press('red');mixed.advance(500);assert.deepEqual(mixed.events,['single:yellow','single:red']);
});
test('Un triple appui ne déclenche pas de vente parasite après la danse',()=>{
 const h=tapHarness();h.press('red');h.advance(90);h.press('red');h.advance(90);h.press('red');h.advance(900);assert.deepEqual(h.events,['double:red']);
});
test('Pause, carte ou changement de session annulent toute commande en attente',()=>{
 const h=tapHarness();h.press('yellow');h.advance(100);h.control.clear();h.advance(900);assert.deepEqual(h.events,[]);h.press('yellow');h.advance(500);assert.deepEqual(h.events,['single:yellow']);
});
test('Un appui tactile et son clic de compatibilité ne sont pas confondus avec un double appui',()=>{
 const handlers={},button={disabled:false,classList:{add(){},remove(){}},addEventListener:(n,fn)=>handlers[n]=fn};let now=20;const taps=[];
 bindSecretButton(button,t=>taps.push(t),()=>now);
 handlers.pointerdown({timeStamp:20,preventDefault(){}});handlers.pointerup();handlers.click({detail:1,timeStamp:25});handlers.click({detail:0,timeStamp:25});assert.deepEqual(taps,[20]);
 now=150;handlers.pointerdown({timeStamp:150,preventDefault(){}});handlers.click({detail:2,timeStamp:151});assert.deepEqual(taps,[20,150]);
 now=1000;handlers.click({detail:0,timeStamp:1000});assert.deepEqual(taps,[20,150,1000],'Activation clavier ou accessibilité sans événement pointeur');
});
test('Cinq clients uniques, trois chemins, et possibilité de vendre sans orientation imposée',()=>{
 assert.equal(CLIENTS.length,5);assert.equal(new Set(CLIENTS.map(c=>c.id)).size,5);
 assert.equal(PATROLS.length,2);assert.equal(PARK.walkWidth,10);
 const run=newRun();run.phase='running';run.facing=Math.PI; // tourne le dos : la vente doit quand même marcher
 for(const c of CLIENTS){
  run.x=c.x;run.z=c.z;
  assert.equal(nearestClient(run).client.id,c.id);
  const result=sell(run);
  assert.equal(result.client.id,c.id);assert.equal(result.points,2);
  assert.ok(run.sold.includes(c.id));
 }
 assert.equal(run.phase,'won');
 assert.equal(run.sold.length,5);
 assert.equal(run.events.filter(e=>e.type==='sale').length,5);
 assert.equal(run.events.filter(e=>e.type==='won').length,1);
});
test('Rouge toujours utilisable : client proche, vente instantanée, pas de condition de face',()=>{
 const run=newRun();run.phase='running';
 assert.equal(sell(run).reason,'far');
 const client=CLIENTS[0];run.x=client.x+3.25;run.z=client.z;
 assert.ok(nearestClient(run),'Le client s active dans un rayon de plusieurs mètres');
 assert.equal(sell(run).client.id,client.id);
 assert.equal(sell(run).reason,'far','On ne peut plus revendre au même client');
 const restored=newRun(['c1','c1','intrus','c2']);
 assert.deepEqual(restored.sold,['c1','c2']);
});
test('Joystick avant/arrière et latéral : progression libre dans le parc',()=>{
 const run=newRun();run.phase='running';
 const start=run.z;
 for(let i=0;i<20;i++)advance(run,.08,{x:0,z:1});
 assert.ok(run.z>start+7);
 const forward=run.z;
 for(let i=0;i<10;i++)advance(run,.08,{x:0,z:-1});
 assert.ok(run.z<forward);
 const oldX=run.x;
 for(let i=0;i<10;i++)advance(run,.08,{x:-1,z:0});
 assert.ok(run.x<oldX);
 assert.ok(Math.abs(run.x)<=PARK.walkWidth);
});
test('Deux policiers patrouillent, poursuivent et esquive possible',()=>{
 const run=newRun();run.phase='running';run.x=0;run.z=0;
 for(let i=0;i<35;i++)advance(run,.08,{x:0,z:0});
 assert.equal(run.phase,'running');
 assert.equal(run.police.length,2);
 assert.notEqual(run.police[0].z,PATROLS[0].homeZ);
 assert.equal(dodge(run),true);
 assert.equal(dodge(run),false,'L esquive a un temps de recharge');
 const started=run.z;advance(run,.08,{x:0,z:1});
 assert.ok(run.z-started>.08*7);
 const cop=run.police[0];run.x=cop.x;run.z=cop.z;
 advance(run,.08,{x:0,z:0});
 assert.equal(run.phase,'running','L esquive protège momentanément de l interpellation');
 run.dodgeTime=0;
 advance(run,.08,{x:0,z:0});
 assert.equal(run.phase,'caught');
});
test('Les messages brefs guident sans recouvrir le parc',()=>{
 const run=newRun();assert.equal(instruction(run).text,'Trouve cinq clients');
 run.phase='running';assert.equal(instruction(run).text,'Repère un client ◆');
 run.x=CLIENTS[0].x;run.z=CLIENTS[0].z;
 assert.equal(instruction(run).text,'Rouge : Vendre');
 run.phase='caught';assert.match(instruction(run).text,/Interpellé/);
});
test('Scène 3D : modèles Kenney, parc libre, clients et policiers propres',()=>{
 const app=read('catalogne-3d-app.js'),html=read('arcade-catalogne-3d.html');
 for(const marker of [
  "new T.WebGLRenderer","new GLTFLoader","cloneSkinned","function lakeAndMonuments",
  "function woodedPark","function makeBirds","function pathways","function makePark",
  "function makeActor","function createCharacters","function updateActors",
  "function makeSale","function bind","function frame"
 ])assert.ok(app.includes(marker),marker);
 assert.ok(app.includes("role==='police'"));
 assert.ok(app.includes("'POLICÍA'"));
 assert.ok(app.includes('const near=nearestClient(run)'));
 assert.ok(!app.includes("face au client"));
 assert.ok(!app.includes("Math.sign(c.x-run.x)"));
 assert.ok(html.includes('id="sell"')&&html.includes('id="dodge"')&&html.includes('id="stick"'));
 assert.ok(!html.includes('Maintenir pour avancer'));
});
test('Scène 3D : vente confiée au plateau, confirmation sans double comptage',()=>{
 const app=read('catalogne-3d-app.js'),html=read('arcade-catalogne-3d.html');
 for(const key of ["catalogne:ready","catalogne:init","catalogne:sale","catalogne:credited","catalogne:close"])
  assert.ok(app.includes(key),key);
 assert.ok(app.includes('if(pendingSale)'));
 assert.ok(app.includes('result.client.id'));
 assert.ok(app.includes('m.finished'));
 assert.ok(app.includes("m.sold.filter"));
 assert.ok(html.includes('catalogne-3d-runtime.js?v=plaza-secrets-20261114-1'));
 assert.ok(html.includes('id="saleDialogue"'));
 assert.ok(app.includes("MODEL_PATHS"));
});
test('Préserver le jeu 2D original et vérifier le raccord au plateau',()=>{
 const base=read('arcade-catalogne.html'),page=read('jeu.html'),build=read('build-public.mjs');
 assert.ok(base.includes('function nearbyClient(r)'));
 assert.ok(base.includes('const WORLD=1960'));
 assert.ok(page.includes("iframe.src='arcade-catalogne-3d.html?embedded=1&v=plaza-secrets-20261114-1'"));
 assert.ok(build.includes("'arcade-catalogne.html'"));
 assert.ok(build.includes("'arcade-catalogne-3d.html'"));
 assert.ok(build.includes("'catalogne-3d-runtime.js'"));
 assert.ok(build.includes("['--test', 'catalogne-3d.test.mjs']"));
});

test('Commandes gauche et droite corrigées par rapport à la caméra 3D',()=>{
 const app=read('catalogne-3d-app.js');
 assert.ok(app.includes('return {x:-clamp(joy.x+right-left,-1,1)'));
 assert.ok(app.includes('dx=(e.clientX-r.left-r.width/2)'));
 assert.ok(app.includes('joy.x=clamp(dx/length,-1,1)'));
 const run=newRun();run.phase='running';
 const initial=run.x;advance(run,.08,{x:-1,z:0});assert.ok(run.x<initial,'Vers la droite écran : x monde négatif');
 const x=run.x;advance(run,.08,{x:1,z:0});assert.ok(run.x>x,'Vers la gauche écran : x monde positif');
});
test('Plus de bâtiments ni banderole au parc : arbres, bancs, oiseaux et groupes mobiles',()=>{
 const js=read('catalogne-3d-app.js');
 assert.ok(!js.includes('backgroundBuildings('));
 assert.ok(!js.includes('sign(\'PARC DE LA CIUTADELLA\''));
 assert.ok(!js.includes('PLAÇA CATALUNYA'));
 assert.ok(!js.includes('Terrasse avec auvent'));
 assert.ok(js.includes('const capacity=1300'));
 assert.ok(js.includes('woodedPark(root)'));
 assert.ok(js.includes('function updateForestGrid(force=false)'));
 assert.ok(js.includes('birds=makeBirds(root)'));
 assert.ok(js.includes('for(let i=0;i<12;i++)'));
 assert.ok(js.includes('v.wingL.rotation.z=flap'));
 assert.ok(js.includes('const gatherings=['));
 assert.ok(js.includes('member:true'));
 assert.ok(js.includes('member:false'));
 assert.ok(js.includes('function decorateParkTile(tile,index)'));
 assert.ok(js.includes('pathways(tile);decorateParkTile(tile,i)'));
});
test('Dialogues des cinq ventes : alternance client puis vendeur',()=>{
 const expected={
  c1:['C’est combien ?','20.'],
  c2:['C’est du bon ?','C’est de la frappe.'],
  c3:['C’est trop cher.','C’est le prix.'],
  c4:['Dépêche-toi, il y a des flics !','T’inquiète.'],
  c5:['Il t’en reste ?','Oui, tiens.']
 };
 assert.equal(Object.keys(SALE_DIALOGUES).length,5);
 for(const client of CLIENTS){
  const lines=saleDialogue(client.id);
  assert.ok(lines,'La vente doit déclencher un dialogue propre au client');
  assert.deepEqual(lines.map(item=>item.text),expected[client.id]);
  assert.deepEqual(lines.map(item=>item.speaker),['client','vendeur']);
 }
 const app=read('catalogne-3d-app.js'),html=read('arcade-catalogne-3d.html');
 assert.ok(app.includes('startSaleConversation(result.client.id)'));
 assert.ok(app.includes("const index=Math.floor(elapsed/1.8)"));
 assert.ok(app.includes("line.speaker==='client'?'CLIENT':'VENDEUR'"));
 assert.ok(app.includes('updateSaleConversation(t)'));
 assert.ok(app.includes('if(saleConversation){winPending=true;renderHUD();return;}'));
 assert.ok(app.includes('if(winPending){winPending=false;presentWin();}'));
 assert.ok(html.includes('id="saleDialogue"'));
 assert.ok(html.includes('Son ON'));
});
test('Policiers : interpellations et injures en espagnol maintenues',()=>{
 assert.deepEqual(POLICE_SHOUTS,['¡Gilipollas!','¡Vuelve aquí!']);
 const app=read('catalogne-3d-app.js');
 assert.ok(app.includes('const line=POLICE_SHOUTS['));
 assert.ok(app.includes("sayLine(line,policeIndex===0?'police1':'police2')"));
 assert.ok(app.includes('if(!saleConversation)'));
});

test('Le parc est continu après la cinquième vente et dans le sens inverse',()=>{
 const r=newRun();r.phase='running';
 // Écarter les patrouilles pour tester uniquement la liberté de déplacement.
 for(const cop of r.police){cop.x=200;cop.homeX=200;}
 r.x=0;r.z=115;
 for(let i=0;i<500;i++)advance(r,.08,{x:0,z:1});
 assert.ok(r.z>340,'Le joueur doit pouvoir continuer bien après la fin initiale');
 for(let i=0;i<1000;i++)advance(r,.08,{x:0,z:-1});
 assert.ok(r.z<0,'Aucune barrière invisible non plus derrière lui');
 const app=read('catalogne-3d-app.js');
 assert.ok(app.includes('const PARK_TILE=64'));
 assert.ok(app.includes('parkPaths[i].position.z=(cell+i-4)*PARK_TILE'));
 assert.ok(app.includes('function updateParkEnvironment()'));
 assert.ok(app.includes('function updateForestGrid(force=false)'));
 assert.ok(app.includes('parkGround.position.set(run.x,-.25,run.z)'));
 assert.ok(app.includes('function decorateParkTile(tile,index)'));
 assert.ok(!app.includes("sign(z===23?'PASSEIG'"));
 assert.ok(!app.includes("'SORTIE'"));
});
test('Policiers 3D autonomes, casquettes, badges et rig animée',()=>{
 const js=read('catalogne-3d-app.js');
 for(const marker of [
  'function policeOfficer(index){',
  "if(role==='police')return policeOfficer(index)",
  'new T.CylinderGeometry(.34,.41,.75,10)',
  "sign('POLICÍA',1.15",
  "sign('POLICÍA',1.48",
  'const billboard=new T.Sprite',
  'policeRig:{legs,arms,elapsed:index*.8}',
  'rig.legs[0].rotation.x',
  'group.scale.setScalar(1.12)'
 ])assert.ok(js.includes(marker),marker);
});
test('Les passants viennent vers le joueur et repartent : moitié dans chaque sens',()=>{
 const app=read('catalogne-3d-app.js');
 assert.ok(app.includes('for(let i=0;i<16;i++)'));
 assert.ok(app.includes("heading:i%2===0?-1:1")||app.includes("heading=i%2===0?-1:1"));
 assert.ok(app.includes('if(walkingNow)v.baseZ+=v.heading*v.speed*dt'));
 assert.ok(app.includes('v.actor.group.rotation.y=v.heading<0?0:Math.PI'));
 assert.ok(app.includes('if(v.baseZ<run.z-33)v.baseZ+=144'));
 assert.ok(app.includes('else if(v.baseZ>run.z+111)v.baseZ-=144'));
 assert.ok(app.includes('animateActor(v.actor,walkingNow?dt:0,walkingNow)'));
 // Quatre groupes de 3 = 6 vers soi et 6 qui s'éloignent,
 // seize promeneurs isolés = 8 vers soi et 8 qui s'éloignent.
 const groups=[-1,1,1,-1].flatMap(heading=>Array(3).fill(heading));
 const singles=Array.from({length:16},(_,i)=>i%2===0?-1:1);
 assert.equal(groups.filter(h=>h<0).length+singles.filter(h=>h<0).length,14);
 assert.equal(groups.filter(h=>h>0).length+singles.filter(h=>h>0).length,14);
});

test('Les cinq clients ont des orientations alternées et font face à l acheteur à proximité',()=>{
 const js=read('catalogne-3d-app.js');
 assert.ok(js.includes('const near=distance(run,v.client)<7.5'));
 assert.ok(js.includes('Math.atan2(run.x-v.client.x,run.z-v.client.z)+Math.PI'));
 assert.ok(js.includes('i%2===0?0:Math.PI'));
});

test('Cinq clients répartis entre allée principale et clairières boisées',()=>{
 assert.equal(CLIENTS.length,5);
 assert.ok(CLIENTS.filter(c=>Math.abs(c.x)>11).length>=3);
 assert.ok(CLIENTS.some(c=>Math.abs(c.x)<8));
 assert.ok(CLIENTS.some(c=>c.x>14)&&CLIENTS.some(c=>c.x< -14));
 assert.ok(CLIENTS.every(c=>typeof c.zone==='string'));
 for(const c of CLIENTS){
  const r=newRun();r.phase='running';r.x=c.x;r.z=c.z;
  assert.equal(nearestClient(r).client.id,c.id);
  assert.equal(sell(r).client.id,c.id);
 }
 const js=read('catalogne-3d-app.js');
 assert.ok(js.includes('CLIENTS.some(c=>Math.hypot(x-c.x,z-c.z)<5.8)'));
 assert.ok(js.includes('new T.CircleGeometry(3.45,28)'));
});
test('Carte mobile : clients servis, police mobile, joueur et commande de fermeture',()=>{
 const js=read('catalogne-3d-app.js'),html=read('arcade-catalogne-3d.html');
 for(const id of ['mapToggle','mapClose','parkMap','mapCanvas'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(js.includes('function toggleParkMap(open=!mapOpen)'));
 assert.ok(js.includes("drawParkMap($('mapCanvas'),run,CLIENTS,rnd,"));
 assert.ok(js.includes('!paused&&!mapOpen'));
 assert.ok(js.includes("if(mapOpen){if(key==='escape')"));
 const labels=[],ctx={
  setTransform(){},clearRect(){},fillRect(){},beginPath(){},arc(){},
  fill(){},ellipse(){},stroke(){},strokeRect(){},moveTo(){},lineTo(){},
  closePath(){},save(){},restore(){},translate(){},rotate(){},fillText(value){labels.push(value)}
 };
 const c={width:330,height:260,clientWidth:330,clientHeight:260,getContext(){return ctx}};
 const old=globalThis.window;
 try{
  globalThis.window={devicePixelRatio:1};
  assert.equal(drawParkMap(c,newRun(['c1']),CLIENTS,n=>Math.abs(Math.sin(n*.71))),true);
 }finally{
  if(old===undefined)delete globalThis.window;
  else globalThis.window=old;
 }
 for(const symbol of ['P','✓','2','3','4','5','↑ AVANT'])
  assert.ok(labels.includes(symbol),'Marqueur manquant : '+symbol);
});

test('Voix : vendeur masculin, cinq acheteurs variés et deux policiers espagnols',()=>{
 assert.equal(Object.keys(VOICE_PROFILES).length,8);
 assert.equal(voiceProfile('vendeur').gender,'male');
 assert.equal(voiceProfile('vendeur').lang,'fr-FR');
 for(const id of ['c1','c3','c5'])assert.equal(voiceProfile(id).gender,'female');
 for(const id of ['c2','c4'])assert.equal(voiceProfile(id).gender,'male');
 assert.equal(voiceProfile('police1').gender,'male');
 assert.equal(voiceProfile('police2').gender,'female');
 assert.equal(voiceProfile('police1').lang,'es-ES');
 assert.equal(voiceProfile('police2').lang,'es-ES');
 assert.equal(new Set(Object.values(VOICE_PROFILES).map(v=>v.pitch)).size,8);
});
test('Voix distinctes choisies parmi les langues et genres disponibles',()=>{
 const voices=[
  {name:'Thomas',lang:'fr-FR',localService:true},
  {name:'Amélie',lang:'fr-FR',localService:true},
  {name:'Jacques',lang:'fr-FR',localService:true},
  {name:'Julie',lang:'fr-FR',localService:true},
  {name:'Sophie',lang:'fr-FR',localService:true},
  {name:'Jorge',lang:'es-ES',localService:true},
  {name:'Mónica',lang:'es-ES',localService:true}
 ];
 assert.equal(voiceGender(voices[0]),'male');
 assert.equal(voiceGender(voices[1]),'female');
 assert.equal(voiceGender(voices[6]),'female');
 const roles=assignGameVoices(voices);
 assert.equal(roles.vendeur.name,'Thomas');
 assert.equal(roles.c1.name,'Amélie');
 assert.equal(roles.c2.name,'Jacques');
 assert.equal(roles.c3.name,'Julie');
 assert.equal(roles.c5.name,'Sophie');
 assert.equal(roles.police1.name,'Jorge');
 assert.equal(roles.police2.name,'Mónica');
 assert.notEqual(roles.c1,roles.vendeur);
 assert.notEqual(roles.police1,roles.police2);
 const onlyFrench=assignGameVoices([{name:'Google français',lang:'fr-FR'}]);
 assert.equal(onlyFrench.vendeur.name,'Google français');
 assert.equal(onlyFrench.c1.name,'Google français');
 assert.equal(onlyFrench.police1,null);
 assert.notEqual(voiceProfile('vendeur').pitch,voiceProfile('c1').pitch);
 assert.notEqual(voiceProfile('c1').rate,voiceProfile('c3').rate);
});
test('La parole est attribuée au vendeur ou au client précis et aux deux agents',()=>{
 const app=read('catalogne-3d-app.js');
 assert.ok(app.includes("sayLine(line.text,line.speaker==='vendeur'?'vendeur':saleConversation.clientId)"));
 assert.ok(app.includes("sayLine(line,policeIndex===0?'police1':'police2')"));
 assert.ok(app.includes("window.speechSynthesis?.addEventListener?.('voiceschanged',refreshSpeechVoices)"));
 assert.ok(app.includes('utterance.voice=assignedSpeechVoices[role]'));
 assert.ok(app.includes('utterance.pitch=profile.pitch'));
 assert.ok(app.includes('utterance.rate=profile.rate'));
 assert.ok(app.includes("synth.cancel();synth.speak(utterance)"));
 assert.ok(app.includes("if(soundOn)refreshSpeechVoices()"));
});
