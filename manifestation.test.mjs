import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newRun,advance,yellow,red,selectTarget,selectNext,callFromStatue,gameInstruction,FLAG,STATUE,WEAPONS,CRS_WAVES} from './manifestation-core.js';
const read=p=>readFileSync(new URL('./'+p,import.meta.url),'utf8');
const idle={x:0,y:0,red:false},walk={x:0,y:1,red:false};
function phase2(){
 const r=newRun();r.x=FLAG.x;r.z=FLAG.z;
 assert.equal(selectTarget(r,{type:'flag'}),true);
 assert.equal(yellow(r),true);
 assert.equal(r.phase,2);return r;
}
function phase3(){
 const r=phase2();r.x=STATUE.footX;r.z=STATUE.footZ;
 assert.equal(selectTarget(r,{type:'statue'}),true);
 assert.equal(yellow(r),true);
 for(let i=0;i<25&&r.climb;i++)advance(r,.12,idle);
 assert.equal(r.climbed,true);
 assert.equal(callFromStatue(r),true);
 for(let i=0;i<35&&r.phase===2;i++)advance(r,.12,idle);
 assert.equal(r.phase,3);return r;
}
function defeat(r,id){
 const p=WEAPONS[id-1];r.x=p.x;r.z=p.z;
 assert.ok(selectTarget(r,{type:'pickup',id}));
 assert.ok(yellow(r));
 assert.equal(r.weapon,p.kind);r.x=0;
 const wave=r.crsWaves[id-1];
 for(let i=0;i<180&&wave.status==='waiting';i++)advance(r,.12,walk);
 assert.equal(wave.status,'active');
 for(let officer=0;officer<4;officer++){
  assert.equal(selectTarget(r,{type:'crs',wave:id,id:officer}),true);
  assert.equal(red(r),true);
  assert.equal(wave.officers[officer].status,'standing');
  for(let t=0;t<8;t++)advance(r,.12,idle);
  assert.equal(wave.officers[officer].status,'transformed');
 }
 assert.equal(wave.status,'repelled');
 return wave;
}
test('Guide silencieux sans inscription permanente',()=>{
 const js=read('manifestation-app.js'),html=read('jeu-manifestation.html');
 assert.ok(js.includes('const GUIDE_STOPS=['));
 assert.ok(js.includes('redGuide=person(5)'));
 assert.ok(js.includes("flag(redGuide,'red'"));
 assert.ok(js.includes('function updateRedGuide(dt,time){'));
 assert.ok(!js.includes('guideCaption'));
 assert.ok(!js.includes('SUIS LE DRAPEAU ROUGE'));
 assert.ok(!html.includes('Suis le personnage au drapeau rouge'));
});
test('Les instructions se suivent selon l état réel du jeu, jusqu à Bastille',()=>{
 const r=newRun();
 assert.equal(gameInstruction(r).text,'Prends le drapeau');
 r.phase=2;
 assert.equal(gameInstruction(r).text,'Monte sur la statue');
 r.climb={direction:'up'};
 assert.equal(gameInstruction(r),null,'Aucun message ne gêne la montée');
 r.climb=null;r.climbed=true;
 assert.equal(gameInstruction(r).text,'Crie « Camarades ! »');
 r.statueShouted=true;
 assert.equal(gameInstruction(r).text,'Descends de la statue');
 r.phase=3;r.climbed=false;
 assert.equal(gameInstruction(r).text,'Prends le cœur');
 for(const w of r.crsWaves){
  const p=r.pickups.find(item=>item.id===w.id);
  p.collected=true;r.weapon=w.kind;
  const expected=w.kind==='heart'?'Envoie des cœurs aux CRS':
   w.kind==='flower'?'Envoie des fleurs aux CRS':'Envoie des bisous aux CRS';
  assert.equal(gameInstruction(r).text,expected);
  w.status='active';
  assert.equal(gameInstruction(r).text,expected);
  w.status='repelled';
 }
 assert.equal(gameInstruction(r).text,'Rejoins l’autre manif à Bastille');
 r.finished=true;
 assert.equal(gameInstruction(r).text,'✓ Cortèges réunis !');
});
test('Chaque consigne est éphémère et ne se trouve pas écrasée par les points',()=>{
 const js=read('manifestation-app.js'),html=read('jeu-manifestation.html');
 assert.ok(js.includes('function syncInstruction(){'));
 assert.ok(js.includes('instruction.key===lastInstructionKey'));
 assert.ok(js.includes('Math.min(1.12,Math.max(.65,duration))'));
 assert.ok(js.includes('speech.style.opacity=String(Math.min(1,remaining/.22))'));
 assert.ok(js.includes('syncInstruction();'));
 assert.ok(html.includes('.speech{top:13%;'));
 assert.ok(!js.includes("messageFeedback('✓ Réunis !',1.2)"));
});
test('Accueil compact : cœur, fleur et bisou dessinés comme dans le jeu',()=>{
 const html=read('jeu-manifestation.html');
 assert.ok(html.includes('clamp(23px,4.6vw,36px)'));
 assert.ok(html.includes('class="intro-symbols"'));
 for(const label of ['Cœur','Fleur','Bisou'])assert.ok(html.includes('<span>'+label+'</span>'));
 assert.ok(html.includes('d="M0 -.23 C-.24 -.04'));
 assert.ok(html.includes('d="M-.46 0 C-.33 .16'));
 assert.ok(html.includes('fill="#ffde56"'));
 assert.equal((html.match(/class="intro-symbol"/g)||[]).length,3);
});
test('Paris complété en vue 360 avec des modèles instanciés légers',()=>{
 const js=read('manifestation-app.js');
 assert.ok(js.includes('function parisBackdrop(root,start,end){'));
 assert.ok(js.includes('const count=36,facades=new T.InstancedMesh'));
 assert.ok(js.includes('function parisStreetDetails(root,start,end){'));
 assert.ok(js.includes("'MÉTRO'")&&js.includes("'JOURNAUX'"));
 assert.ok(js.includes('parisBackdrop(root,-20,38)'));
 assert.ok(js.includes('parisBackdrop(root,-23,48)'));
 assert.ok(js.includes('parisBackdrop(sceneGroup,49,139)'));
});
test('Sélection visible : deux anneaux, flèche et état confirmé',()=>{
 const js=read('manifestation-app.js'),html=read('jeu-manifestation.html');
 assert.ok(js.includes('for(const radius of [1.05,1.45])'));
 assert.ok(js.includes('selectionMarker.userData={rings,arrow}'));
 assert.ok(js.includes("sel.classList.toggle('is-selected',!!run.selected)"));
 assert.ok(js.includes("('✓ SÉLECTIONNÉ : CRS '"));
 assert.ok(html.includes('.selection-ui span.is-selected'));
});
test('CRS distincts et cortège de couleur',()=>{
 const js=read('manifestation-app.js');
 assert.ok(js.includes('officer.baseX=(i-1.5)*2.35'));
 assert.ok(js.includes('officer.actor.scale.setScalar(1.30)'));
 assert.ok(js.includes('genouillère'));
 assert.ok(js.includes("banner(rallyProps,'TOUS ENSEMBLE',0,-5.3,5.5,'#d9514e'"));
 assert.ok(js.includes("flag(rallyProps,'red'"));
 assert.ok(js.includes("flag(adverseSymbols,'red'"));
});
test('La fonction activeWave est importée pour la troisième étape après la statue',()=>{
 const code=read('manifestation-app.js');
 assert.match(code,/import\s*\{[^}]*\bactiveWave\b[^}]*\}\s*from\s*['"]\.\/manifestation-core\.js['"]/);
 assert.match(code,/const active=p===3\?activeWave\(run\)/);
 assert.match(code,/function updatePoliceWaves\(time\)/);
 assert.match(code,/if\(run\.phase!==3\)return;/);
});
test('Le jeu commence seul dans une rue adjacente, avant la statue',()=>{
 const r=newRun();
 assert.equal(r.phase,1);assert.equal(r.hasFlag,false);
 assert.equal(r.steps.length,0);
 assert.equal(yellow(r),false);
 assert.ok(selectTarget(r,{type:'flag'}));
 assert.equal(yellow(r),false,'Il faut se rapprocher du drapeau');
 r.x=FLAG.x;r.z=FLAG.z;assert.equal(yellow(r),true);
 assert.deepEqual(r.steps,[1]);assert.equal(r.phase,2);
 assert.equal(r.hasFlag,true);assert.ok(r.events.some(e=>e.type==='corner'));
});
test('Étape 2 : montée et cri sur la statue après le drapeau',()=>{
 const r=phase3();assert.deepEqual(r.steps,[1,2]);
 assert.equal(r.height,0);assert.equal(r.climbed,false);
 assert.ok(r.events.some(e=>e.type==='shout'));
});
test('Armes sur trois trottoirs : cœur, fleur, bisou',()=>{
 assert.deepEqual(WEAPONS.map(w=>w.kind),['heart','flower','kiss']);
 assert.deepEqual(WEAPONS.map(w=>w.icon),['♥','✿','💋']);
 assert.deepEqual(WEAPONS.map(w=>w.z),[11,36,63]);
 assert.ok(WEAPONS[0].x>=-8&&WEAPONS[0].x<=8);
 assert.ok(WEAPONS[1].x<0&&WEAPONS[2].x>0);
 assert.ok(WEAPONS.every(p=>Math.abs(p.x)<=8),'Toutes les armes sont accessibles sur le parcours');
 assert.deepEqual(CRS_WAVES.map(w=>w.trigger),[19,46,73]);
});
test('Les CRS attendent que le cœur soit ramassé avant de venir',()=>{
 const r=phase3();r.x=0;
 for(let i=0;i<140;i++)advance(r,.12,walk);
 assert.equal(r.crsWaves[0].status,'waiting');
 assert.ok(r.z<=CRS_WAVES[0].trigger-2+.01,'Le barrage n enferme pas le joueur');
 assert.ok(!r.events.some(e=>e.type==='crs:incoming'),'Pas de CRS avant le cœur');
 const p=WEAPONS[0];r.x=p.x;r.z=p.z;
 advance(r,.12,idle);
 assert.equal(r.weapon,'heart','Le cœur se récupère en marchant dessus');
 assert.ok(r.pickups[0].collected);
 r.x=0;
 for(let i=0;i<80&&r.crsWaves[0].status==='waiting';i++)advance(r,.12,walk);
 assert.equal(r.crsWaves[0].status,'active','Les CRS arrivent après récupération');
});
test('La fleur et le bisou sont aussi accessibles avant leur vague',()=>{
 const r=phase3();
 for(const w of CRS_WAVES){
  const p=WEAPONS[w.id-1];
  r.x=0;r.z=w.trigger-5;
  for(let i=0;i<25;i++)advance(r,.12,walk);
  assert.equal(r.crsWaves[w.id-1].status,'waiting');
  assert.ok(r.z<=w.trigger-2+.01);
  r.x=p.x;r.z=p.z;advance(r,.12,idle);
  assert.equal(r.weapon,p.kind);
  r.x=0;
  for(let i=0;i<70&&r.crsWaves[w.id-1].status==='waiting';i++)advance(r,.12,walk);
  assert.equal(r.crsWaves[w.id-1].status,'active');
  for(let id=0;id<4;id++){
   assert.ok(selectTarget(r,{type:'crs',wave:w.id,id}));
   assert.ok(red(r));
   for(let k=0;k<8;k++)advance(r,.12,idle);
  }
  assert.equal(r.crsWaves[w.id-1].status,'repelled');
 }
});
test('Les cœurs des compagnons sont vraiment plus gros',()=>{
 const js=read('manifestation-app.js'),html=read('jeu-manifestation.html');
 assert.ok(js.includes("makeSymbol(w.kind,w.kind==='heart'?1.25:.85)"));
 assert.ok(js.includes("duration:.9,baseSize:w.kind==='heart'?1.25:.85"));
 assert.ok(js.includes("fx.symbol.scale.setScalar(fx.baseSize*(1+.25*Math.sin(p*Math.PI)))"));
 assert.ok(html.includes('id="weaponPrompt"'));
});
test('Sélection obligatoire avant de prendre une arme sur le trottoir',()=>{
 const r=phase3();const p=WEAPONS[0];
 r.x=p.x;r.z=p.z;assert.equal(yellow(r),false);
 assert.ok(selectTarget(r,{type:'pickup',id:1}));
 assert.ok(yellow(r));assert.equal(r.weapon,'heart');
 assert.equal(r.pickups[0].collected,true);
});
test('Sélection individuelle des CRS avant le tir, puis impact différé',()=>{
 const r=phase3();const p=WEAPONS[0];r.x=p.x;r.z=p.z;
 selectTarget(r,{type:'pickup',id:1});yellow(r);r.x=0;
 const w=r.crsWaves[0];
 for(let i=0;i<180&&w.status==='waiting';i++)advance(r,.12,walk);
 assert.equal(red(r),false,'Pas de cible = pas de tir');
 assert.ok(selectTarget(r,{type:'crs',wave:1,id:2}));
 assert.equal(red(r),true);
 assert.equal(w.officers[2].status,'standing');
 for(let i=0;i<8;i++)advance(r,.12,idle);
 assert.equal(w.officers[2].status,'transformed');
 assert.deepEqual(w.officers.filter(o=>o.status==='standing').map(o=>o.id),[0,1,3]);
 assert.ok(r.events.some(e=>e.type==='projectile:fire'&&e.officer===2));
 assert.ok(r.events.some(e=>e.type==='projectile:hit'&&e.officer===2));
});
test('Le bouton Cible fait défiler quatre CRS différents',()=>{
 const r=phase3();const p=WEAPONS[0];r.x=p.x;r.z=p.z;
 selectTarget(r,{type:'pickup',id:1});yellow(r);r.x=0;
 const w=r.crsWaves[0];for(let i=0;i<180&&w.status==='waiting';i++)advance(r,.12,walk);
 const result=[];for(let i=0;i<4;i++){assert.ok(selectNext(r));result.push(r.selected.id);}
 assert.deepEqual(result,[0,1,2,3]);
});
test('Trois vagues, chacune vaincue avec son arme et non une autre',()=>{
 const r=phase3();
 for(const w of CRS_WAVES){
  const defeated=defeat(r,w.id);
  assert.equal(defeated.kind,w.kind);
  assert.deepEqual(defeated.officers.map(o=>o.status),Array(4).fill('transformed'));
  assert.ok(r.events.some(e=>e.type==='crs:repelled'&&e.wave===w.id));
 }
 const hits=r.events.filter(e=>e.type==='projectile:hit');
 assert.equal(hits.length,12);
 assert.equal(new Set(hits.map(e=>e.wave+':'+e.officer)).size,12);
});
test('Traverser la foule adverse puis recevoir les seize nouveaux suiveurs',()=>{
 const r=phase3();for(let id=1;id<=3;id++)defeat(r,id);
 for(let i=0;i<240&&r.z<99;i++)advance(r,.12,walk);
 assert.equal(r.joining,true);assert.equal(r.finished,false);
 r.cohesion=95;
 for(let i=0;i<35&&r.phase===3;i++)advance(r,.12,walk);
 assert.equal(r.joined,16);
 assert.equal(r.finished,true);
 assert.deepEqual(r.steps,[1,2,3]);
});
test('Le regroupement par le rouge à l’arrêt fonctionne encore',()=>{
 const r=phase3();
 r.x=0; // Tester la cohésion sur la chaussée dégagée, indépendamment du socle.
 for(let i=0;i<18;i++)advance(r,.12,walk);
 const beforeGap=r.z-r.leaderZ,beforeCohesion=r.cohesion,z=r.z;
 for(let i=0;i<30;i++)advance(r,.12,{x:0,y:0,red:true});
 assert.equal(r.z,z);
 assert.ok(r.z-r.leaderZ<beforeGap);
 assert.ok(r.cohesion>beforeCohesion);
});
test('La rue adjacente est vide, puis drapeau porté, puis foule',()=>{
 const js=read('manifestation-app.js');
 const scene=js.slice(js.indexOf('function sceneFor(phase){'),js.indexOf('function messageFeedback('));
 const alley=scene.slice(scene.indexOf('if(phase===1){'),scene.indexOf('}else if(phase===2){'));
 assert.ok(alley.includes('Rue adjacente'));
 assert.ok(!alley.includes('makeCrowd(root,'));
 assert.ok(scene.includes('statue(root)'));
 assert.ok(scene.includes("if(phase>=2)flag(hero,'france'"));
 assert.ok(js.includes('function populateMarch(root){')&&js.includes('for(const pick of WEAPONS)weaponPickup(root,pick)'));
});
test('Sélection tactile des objets/CRS et commande Cible accessible',()=>{
 const js=read('manifestation-app.js'),html=read('jeu-manifestation.html');
 assert.ok(js.includes('targetRaycaster.intersectObjects(pickableMeshes,false)'));
 assert.ok(js.includes('canvas.addEventListener'));
 assert.ok(js.includes('selectTarget(run,hit.object.userData.pickTarget)'));
 assert.ok(js.includes("$('chooseTarget').onclick=chooseTarget"));
 assert.ok(html.includes('id="chooseTarget"'));
 assert.ok(html.includes('id="targetChip"'));
});
test('Cœur, fleur et lèvres sont des projectiles 3D distincts',()=>{
 const js=read('manifestation-app.js');
 assert.ok(js.includes('const heartShape=new T.Shape()'));
 assert.ok(js.includes('const kissShape=new T.Shape()'));
 assert.ok(js.includes("if(kind==='flower')"));
 assert.ok(js.includes('fx.symbol.position.lerpVectors(fx.from,goal,p)'));
 assert.ok(js.includes('function transformOfficer(waveId,officerId,kind)'));
 assert.ok(js.includes('fx.at.y+fx.elapsed*3.1'));
});
test('Les alliés lancent des effets autonomes, sans infliger de dégâts',()=>{
 const js=read('manifestation-app.js'),core=read('manifestation-core.js');
 assert.ok(js.includes('function animateAllyAttacks(time)'));
 assert.ok(js.includes('ne comptent jamais'));
 assert.ok(js.includes('const to=new T.Vector3(run.x+'));
 assert.ok(!core.includes('ally:hit'));
 assert.ok(core.includes('export function fire(run)'));
});
test('Interface légère, mini-bulle, arme équipée et calligraphie libre',()=>{
 const js=read('manifestation-app.js'),html=read('jeu-manifestation.html');
 assert.ok(html.includes('.hint,.crs-alert{display:none!important}'));
 assert.ok(html.includes('.hudbox{max-width:26%'));
 assert.ok(html.includes('.chapter-sky{top:22px;'));
 assert.ok(html.includes('id="weaponChip"'));
 assert.ok(html.includes('id="crsMini"'));
 assert.ok(js.includes('function syncInstruction(){'));
 assert.ok(js.includes('gameInstruction(run)'));
});
test('La seconde foule suit après avoir été traversée',()=>{
 const js=read('manifestation-app.js');
 assert.ok(js.includes('bastilleCrowd.visible=run.z>=92'));
 assert.ok(js.includes('i<run.joined'));
 assert.ok(js.includes('behindNarrator(run.z,run.leaderZ-3-i*.21,6.2)'));
 assert.ok(js.includes('adverseSymbols.position.z=run.z-107'));
});
test('Les 3 chemins et les points du plateau restent compatibles',()=>{
 const html=read('jeu-manifestation.html'),reader=read('rendezvous-plateau.js'),page=read('jeu.html'),book=read('chapitre1-plateau.js');
 assert.ok(book.includes('Les deux cortèges se rencontrent à mi-chemin.'));
 assert.ok(reader.includes('step!==passed.length+1'));
 assert.ok(reader.includes('state.points+=10'));
 assert.ok(html.includes('Chapitre 4 — « Drapeau rouge »'));
 assert.ok(html.includes('manifestation-runtime.js?v=20261110-consignes-symboles-v24'));
 assert.ok(reader.includes('jeu-manifestation.html?embedded=1&v=20261110-consignes-symboles-v24'));
 assert.match(page,/rendezvous-plateau\.js\?v=[^"]+/);
});
test('Personnages Kenney animés CC0 inchangés',()=>{
 for(const sex of ['male','female'])for(const v of ['a','c','e']){
  const b=readFileSync(new URL('./assets/manifestation/character-'+sex+'-'+v+'.glb',import.meta.url));
  assert.equal(b.toString('ascii',0,4),'glTF');
  assert.ok(b.length>100000&&b.length<400000);
  assert.match(b.toString('latin1',20,110000),/"walk"/);
 }
 assert.match(read('assets/manifestation/KENNEY-CC0-LICENSE.txt'),/Creative Commons Zero/);
});

test('Statue sur le côté, avenue centrale libre',()=>{
 const r=phase2();assert.equal(STATUE.x,6);
 r.x=0;r.z=0;for(let i=0;i<30;i++)advance(r,.12,walk);
 assert.ok(r.z>8,'On passe sans heurter la statue au milieu de l’avenue');
});
test('Marches accessibles, cri, descente et reprise de marche',()=>{
 const r=phase2();r.x=STATUE.footX;r.z=STATUE.footZ;
 assert.ok(selectTarget(r,{type:'statue'}));
 assert.ok(yellow(r),'Monter depuis le pied des marches');
 for(let i=0;i<30&&r.climb;i++)advance(r,.12,idle);
 assert.equal(r.climbed,true);assert.equal(r.x,STATUE.topX);
 assert.ok(callFromStatue(r));
 for(let i=0;i<36&&r.phase===2;i++)advance(r,.12,idle);
 assert.equal(r.phase,3);
 const z=r.z;advance(r,.12,walk);assert.ok(r.z>z);
});
test('Après la descente le joystick permet de reculer puis contourner la statue',()=>{
 const r=phase2();r.x=STATUE.footX;r.z=STATUE.footZ;
 assert.ok(yellow(r));
 for(let i=0;i<25&&r.climb;i++)advance(r,.12,idle);
 assert.equal(r.climbed,true);
 assert.ok(yellow(r),'Descendre avec JAUNE');
 for(let i=0;i<30&&r.phase===2;i++)advance(r,.12,idle);
 assert.equal(r.phase,3);
 assert.equal(r.x,STATUE.exitX,'Le pied du socle doit être dégagé après descente');
 assert.equal(r.z,STATUE.footZ,'Aucune téléportation vers Bastille');
 const startZ=r.z;
 for(let i=0;i<6;i++)advance(r,.12,{x:0,y:-1});
 assert.ok(r.z<startZ-2,'Le joueur peut reculer de la statue');
 for(let i=0;i<7;i++)advance(r,.12,{x:-1,y:0});
 assert.ok(r.x<STATUE.x-3.05,'Le joueur peut sortir du côté du socle');
 for(let i=0;i<25;i++)advance(r,.12,{x:0,y:1});
 assert.ok(r.z>8,'Le joueur peut contourner complètement la statue');
 const before=r.z;advance(r,.12,{x:0,y:-1});
 assert.ok(r.z<before,'Le joystick reste bidirectionnel après contournement');
 const js=read('manifestation-app.js');
 assert.ok(js.includes('if(phase===3&&stageInWorld===2&&sceneGroup){')&&js.includes('parisStreetDetails(root,-23,48);statue(root);'),'La statue reste visible et la scène est conservée');
 const transition=js.slice(js.indexOf('if(phase!==run.phase){'),js.indexOf('const time=ms/1000;',js.indexOf('if(phase!==run.phase){')));
 assert.ok(!transition.includes('joy={x:0,y:0}'),'Le joystick actif ne doit pas être réinitialisé à la descente');
 assert.ok(!transition.includes('keys.clear()'),'Les touches maintenues restent actives');
});
test('Le socle arrête la marche frontale mais laisse glisser latéralement',()=>{
 const r=phase2();r.x=5;r.z=.35;
 for(let i=0;i<35;i++)advance(r,.12,{x:0,y:1});
 assert.ok(r.z<2,'Le socle ne doit pas être traversé');
 const blockedZ=r.z;
 for(let i=0;i<12;i++)advance(r,.12,{x:-1,y:0});
 assert.ok(r.x<STATUE.x-3.05,'Déplacement latéral autorisé');
 assert.equal(r.z,blockedZ);
 for(let i=0;i<30;i++)advance(r,.12,{x:0,y:1});
 assert.ok(r.z>8,'On peut contourner le socle sans téléportation');
});
test('La transition conserve le héros, la caméra et la boucle de rendu',()=>{
 const js=read('manifestation-app.js');
 assert.ok(js.includes('if(phase===3&&stageInWorld===2&&sceneGroup){'));
 const transition=js.slice(js.indexOf('if(phase===3&&stageInWorld===2&&sceneGroup){'),js.indexOf('if(sceneGroup)world.remove(sceneGroup);',js.indexOf('if(phase===3&&stageInWorld===2&&sceneGroup){')));
 assert.ok(transition.includes('populateMarch(sceneGroup)'));
 assert.ok(!transition.includes('sceneGroup=new T.Group'));
 assert.ok(js.includes('requestAnimationFrame(render);\n try{'));
 assert.ok(js.includes("status.textContent='JEU ACTIF"));
 assert.ok(js.includes("function extendMarchScenery(){"));
});
test('Après la statue, le joystick avance et recule sans commandes superposées',()=>{
 const r=phase3(),start=r.z;
 for(let i=0;i<24;i++)advance(r,.12,{x:0,y:1});
 assert.ok(r.z>start+10,'Le joystick permet toujours de progresser vers Bastille');
 const forward=r.z;
 for(let i=0;i<4;i++)advance(r,.12,{x:0,y:-1});
 assert.ok(r.z<forward,'Le joystick permet de revenir en arrière');
 const js=read('manifestation-app.js'),html=read('jeu-manifestation.html');
 assert.ok(!js.includes('advanceBastille'));
 assert.ok(!js.includes('walkingPad'));
 assert.ok(!js.includes('forwardHeld'));
 assert.ok(!html.includes('Maintenir pour avancer'));
 assert.ok(!html.includes('id="advanceBastille"'));
 assert.ok(!html.includes('id="walkingPad"'));
 assert.ok(js.includes('const manualY=clamp(joy.y+fwd-back,-1,1)'));
});
test('La perspective de l avenue reste ouverte et les détails sont hors chaussée',()=>{
 const js=read('manifestation-app.js');
 const back=js.slice(js.indexOf('function parisBackdrop(root,start,end){'),js.indexOf('function parisStreetDetails(root,start,end){'));
 assert.ok(back.includes('const x=side*(32+(rank%3)*2.4)'));
 assert.ok(!back.includes('Math.cos(angle)*rad'),'Ne jamais créer de façade au bout de l avenue');
 for(let i=0;i<36;i++){
  const x=(i%2===0?-1:1)*(32+(Math.floor(i/2)%3)*2.4);
  assert.ok(Math.abs(x)-14/2>8,'Les bâtiments ne doivent pas recouvrir la rue');
 }
 assert.ok(js.includes('function parisSidewalkPedestrians(root,start,end){'));
 assert.ok(js.includes('treeX=side*10.45,lightX=side*9.4'));
 assert.ok(js.includes('const shade=[0xe1c49d'));
});
test('Statue, sa cible et la sélection décalées ensemble',()=>{
 const js=read('manifestation-app.js');
 assert.ok(js.includes('function statue(sceneRoot){'));
 assert.ok(js.includes('root.position.x=STATUE.x;sceneRoot.add(root)'));
 assert.ok(js.includes('addSelectable(root,null,STATUE.x,3.6,STATUE.z,5.8'));
 assert.ok(js.includes("if(sel.type==='statue'){point=new T.Vector3(STATUE.x,0,STATUE.z);arrowY=8.7;}"));
 assert.ok(read('manifestation-core.js').includes('insideStatueBase=(x,z)=>x>STATUE.x-3.05'));
});
test('Devise complète Liberté Égalité Fraternité',()=>{
 const js=read('manifestation-app.js');
 assert.ok(js.includes("'LIBERTÉ, ÉGALITÉ, FRATERNITÉ'"));
 assert.ok(!js.includes("'LIBERTÉ ÉGALITÉ'"));
});

test('JAUNE redescend du sommet immédiatement après Camarades',()=>{
 const r=phase2();r.x=STATUE.footX;r.z=STATUE.footZ;
 assert.ok(selectTarget(r,{type:'statue'}));
 assert.ok(yellow(r));
 for(let i=0;i<28&&r.climb;i++)advance(r,.12,idle);
 assert.equal(r.climbed,true);
 assert.ok(callFromStatue(r));
 assert.ok(yellow(r),'Le jaune doit déclencher la descente');
 assert.equal(r.climb.direction,'down');
 for(let i=0;i<25&&r.phase===2;i++)advance(r,.12,idle);
 assert.equal(r.phase,3);assert.equal(r.height,0);
 assert.deepEqual(r.steps,[1,2]);
 const z=r.z;advance(r,.12,walk);assert.ok(r.z>z);
});
test('Le JAUNE au sommet reste fonctionnel même sans appel rouge préalable',()=>{
 const r=phase2();r.x=STATUE.footX;r.z=STATUE.footZ;
 assert.ok(yellow(r));
 for(let i=0;i<28&&r.climb;i++)advance(r,.12,idle);
 assert.equal(r.climbed,true);assert.equal(r.statueShouted,false);
 assert.ok(yellow(r));
 assert.equal(r.statueShouted,true,'Le cri est conservé, une seule fois');
 assert.equal(r.events.filter(e=>e.type==='shout').length,1);
 assert.equal(r.climb.direction,'down');
 assert.equal(yellow(r),false,'Pas de double déclenchement');
 for(let i=0;i<26&&r.phase===2;i++)advance(r,.12,idle);
 assert.equal(r.phase,3);
 assert.equal(r.events.filter(e=>e.type==='progress'&&e.step===2).length,1);
});
test('La manette rappelle la fonction DESCENDRE du bouton JAUNE',()=>{
 const js=read('manifestation-app.js'),html=read('jeu-manifestation.html');
 assert.ok(js.includes("run.climbed||run.climb?.direction==='down'?'DESCENDRE':'MONTER'"));
 assert.ok(js.includes("$('statueDescend').onclick=yellowPress"));
 assert.ok(html.includes('JAUNE : agir'));
 assert.ok(html.includes('manifestation-runtime.js?v=20261110-consignes-symboles-v24'));
});
