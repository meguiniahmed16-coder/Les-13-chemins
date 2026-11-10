import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newRun,advance,yellow,red,selectTarget,selectNext,callFromStatue,FLAG,STATUE,WEAPONS,CRS_WAVES} from './manifestation-core.js';
const read=p=>readFileSync(new URL('./'+p,import.meta.url),'utf8');
const idle={x:0,y:0,red:false},walk={x:0,y:1,red:false};
function phase2(){
 const r=newRun();r.x=FLAG.x;r.z=FLAG.z;
 assert.equal(selectTarget(r,{type:'flag'}),true);
 assert.equal(yellow(r),true);
 assert.equal(r.phase,2);return r;
}
function phase3(){
 const r=phase2();r.x=0;r.z=1.94;
 assert.equal(selectTarget(r,{type:'statue'}),true);
 assert.equal(yellow(r),true);
 for(let i=0;i<25&&r.climb;i++)advance(r,.12,idle);
 assert.equal(r.climbed,true);
 assert.equal(callFromStatue(r),true);
 for(let i=0;i<35&&r.phase===2;i++)advance(r,.12,idle);
 assert.equal(r.phase,3);return r;
}
function defeat(r,id){
 const p=WEAPONS[id-1];r.x=p.x>0?8:-8;r.z=p.z;
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
 assert.deepEqual(WEAPONS.map(w=>w.z),[9,36,63]);
 assert.ok(WEAPONS[0].x>8&&WEAPONS[1].x< -8&&WEAPONS[2].x>8);
 assert.deepEqual(CRS_WAVES.map(w=>w.trigger),[19,46,73]);
});
test('Sélection obligatoire avant de prendre une arme sur le trottoir',()=>{
 const r=phase3();const p=WEAPONS[0];
 r.x=8;r.z=p.z;assert.equal(yellow(r),false);
 assert.ok(selectTarget(r,{type:'pickup',id:1}));
 assert.ok(yellow(r));assert.equal(r.weapon,'heart');
 assert.equal(r.pickups[0].collected,true);
});
test('Sélection individuelle des CRS avant le tir, puis impact différé',()=>{
 const r=phase3();const p=WEAPONS[0];r.x=8;r.z=p.z;
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
 const r=phase3();const p=WEAPONS[0];r.x=8;r.z=p.z;
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
 assert.ok(scene.includes('for(const pick of WEAPONS)weaponPickup(root,pick)'));
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
 assert.ok(js.includes("messageFeedback('— Camarades !',.9)"));
 assert.ok(js.includes("messageFeedback('✓ Réunis !',2.5)"));
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
 assert.ok(html.includes('manifestation-runtime.js?v=20261110-armes-selection-v13'));
 assert.ok(reader.includes('jeu-manifestation.html?embedded=1&v=20261110-armes-selection-v13'));
 assert.ok(page.includes('rendezvous-plateau.js?v=20261110-armes-selection-v13'));
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
