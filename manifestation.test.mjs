import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newRun,advance,yellow,callFromStatue,progress,behindNarrator,STATUE,FLAG,CRS_WAVES,OBJECTIFS} from './manifestation-core.js';

const read=p=>readFileSync(new URL('./'+p,import.meta.url),'utf8');
const walk={x:0,y:1,red:false},rest={x:0,y:0,red:false},rally={x:0,y:0,red:true};

function procession(){
 const r=newRun();
 assert.equal(r.phase,1);assert.equal(r.height,STATUE.topHeight);
 assert.equal(callFromStatue(r),true);
 for(let i=0;i<100&&r.phase===1;i++)advance(r,.05,rest);
 assert.equal(r.phase,2);
 r.x=FLAG.x;r.z=FLAG.z;assert.equal(yellow(r),true);
 assert.equal(r.phase,3);assert.equal(r.z,0);
 return r;
}
function toWave(r,wave){
 for(let i=0;i<150&&r.z<wave.trigger;i++)advance(r,.12,walk);
 return r.crsWaves.find(w=>w.id===wave.id);
}
function repelWave(r,wave){
 const w=toWave(r,wave);
 assert.equal(w.status,'active','CRS '+wave.id+' arrivent au bon endroit');
 const prev=w.hearts;
 for(let i=0;i<35&&w.status!=='repelled';i++)advance(r,.12,rally);
 assert.equal(w.status,'repelled','ROUGE envoie des cœurs et repousse la vague '+wave.id);
 assert.equal(w.hearts-prev,4,'Quatre cœurs repulsent une vague');
 return w;
}
test('Trois épreuves : statue, drapeau français, marche, points jamais doublés',()=>{
 const r=procession();
 assert.deepEqual(r.steps,[1,2]);
 assert.deepEqual(OBJECTIFS,['La République — « Camarades ! »','Retrouver le drapeau français','La rencontre des cortèges']);
 assert.equal(progress(r,2),false);
});
test('Départ depuis la statue, descente visible et joystick libre après',()=>{
 const r=newRun();
 assert.equal(r.climbed,true);assert.equal(r.z,STATUE.topZ);
 assert.equal(callFromStatue(r),true);assert.equal(callFromStatue(r),false);
 advance(r,.05,rest);assert.equal(r.phase,1);
 for(let i=0;i<100&&r.phase===1;i++)advance(r,.05,rest);
 assert.equal(r.phase,2);assert.equal(r.height,0);
 const z=r.z;
 for(let i=0;i<10;i++)advance(r,.05,walk);
 assert.ok(r.z>z+2,'Le joystick marche après la statue');
});
test('Avancer étire la foule ; s’arrêter et ROUGE la rapproche réellement',()=>{
 const r=procession(),gap0=r.z-r.leaderZ;
 // Tester la prise de retard AVANT le premier barrage (17 mètres).
 for(let i=0;i<40;i++)advance(r,.05,walk);
 const gap=r.z-r.leaderZ,cohesion=r.cohesion,z=r.z;
 assert.ok(gap>gap0+2.5&&gap<=15.5);
 assert.ok(cohesion<80);
 for(let i=0;i<40;i++)advance(r,.05,rally);
 assert.equal(r.z,z);
 assert.ok(r.z-r.leaderZ<gap-3);
 assert.ok(r.cohesion>cohesion+20);
});
test('Trois attaques de CRS distinctes, déclenchées en chemin',()=>{
 const r=procession();
 assert.equal(CRS_WAVES.length,3);
 assert.deepEqual(CRS_WAVES.map(w=>w.trigger),[17,44,71]);
 assert.ok(r.crsWaves.every(w=>w.status==='waiting'));
 for(const wave of CRS_WAVES)repelWave(r,wave);
 assert.deepEqual(r.crsWaves.map(w=>w.status),['repelled','repelled','repelled']);
 assert.equal(r.events.filter(e=>e.type==='crs:incoming').length,3);
 assert.equal(r.events.filter(e=>e.type==='crs:repelled').length,3);
 assert.equal(r.events.filter(e=>e.type==='heart:fire').length,12);
 assert.equal(r.events.filter(e=>e.type==='heart:hit').length,12);
 assert.equal(new Set(r.events.filter(e=>e.type==='heart:hit').map(e=>e.wave+':'+e.officer)).size,12,'12 CRS distincts sont touchés');
});
test('Maintenir ROUGE envoie des cœurs à la vague présente, jamais aux autres',()=>{
 const r=procession();
 const wave=toWave(r,CRS_WAVES[0]);
 assert.equal(wave.hearts,0);
 advance(r,.12,rally);
 assert.equal(wave.hearts,0,'Le CRS ne doit pas être touché avant l’arrivée du cœur');
 assert.equal(wave.shots.length,1);
 assert.equal(wave.shots[0].officer,0);
 assert.equal(wave.officers[0].targeted,true);
 assert.equal(r.crsWaves[1].hearts,0);
 assert.equal(r.crsWaves[2].hearts,0);
});
test('Sans repousser les CRS, leur barrage empêche de rejoindre Bastille',()=>{
 const r=procession();
 for(let i=0;i<190;i++)advance(r,.12,walk);
 assert.ok(r.z<=CRS_WAVES[0].trigger+1.3);
 assert.equal(r.crsWaves[0].status,'active');
 assert.equal(r.finished,false);
 assert.equal(r.phase,3);
});

test('Après les trois attaques et le regroupement final, victoire et 30 points',()=>{
 const r=procession();
 for(const wave of CRS_WAVES)repelWave(r,wave);
 for(let i=0;i<190&&r.phase===3&&r.z<99;i++)advance(r,.12,walk);
 for(let i=0;i<90&&r.phase===3;i++)advance(r,.12,rally);
 assert.equal(r.finished,true);
 assert.deepEqual(r.steps,[1,2,3]);
 assert.equal(progress(r,3),false);
 assert.equal(r.events.filter(e=>e.type==='progress').length,3);
});
test('La cohésion ne bloque pas le joystick, les CRS empêchent seulement de franchir leur ligne',()=>{
 const r=procession();toWave(r,CRS_WAVES[0]);
 r.cohesion=0;const before=r.z;
 advance(r,.12,{x:1,y:0,red:false});
 assert.ok(r.x>0,'On peut se déplacer latéralement');
 advance(r,.12,walk);
 assert.ok(r.z<=CRS_WAVES[0].trigger+1.3);
 const wave=r.crsWaves[0];
 for(let i=0;i<30&&wave.status==='active';i++)advance(r,.12,rally);
 assert.equal(wave.status,'repelled');
 advance(r,.12,walk);
 assert.ok(r.z>before,'La marche reprend après les cœurs');
});

test('Le décor ajoute les CRS avec casques, boucliers et matraques',()=>{
 const src=read('manifestation-app.js');
 assert.ok(src.includes('function riotOfficer('));
 assert.ok(src.includes('function createPoliceWaves('));
 assert.ok(src.includes('function updatePoliceWaves('));
 assert.ok(src.includes('const helmet=mesh('));
 assert.ok(src.includes('const shield=mesh('));
 assert.ok(src.includes('const baton=mesh('));
 assert.ok(src.includes("const sign=roundedText('CRS · ♥ ♥ ♥'"));
 assert.ok(src.includes('createPoliceWaves(root)'));
 assert.ok(src.includes("e.type==='crs:incoming'"));
 assert.ok(src.includes("e.type==='crs:repelled'"));
});
test('Chaque cœur est un vrai projectile visible et chaque CRS vaincu monte au ciel',()=>{
 const src=read('manifestation-app.js');
 assert.ok(src.includes('const heartGeometry=new T.ExtrudeGeometry(heartShape'),'Cœur avec relief 3D');
 assert.ok(src.includes('function sendHearts(waveId,officerId,duration=.82)'));
 assert.ok(src.includes('const from=new T.Vector3(run.x,run.height+1.55,run.z+.46)'));
 assert.ok(src.includes('fx.heart.position.lerpVectors(fx.from,goal,p)'));
 assert.ok(src.includes('fx.heart.quaternion.copy(camera.quaternion)'));
 assert.ok(src.includes('function transformOfficerToHeart(waveId,officerId)'));
 assert.ok(src.includes('officer.actor.visible=false'));
 assert.ok(src.includes('heartAscents.push('));
 assert.ok(src.includes('fx.y+fx.elapsed*3.2'));
 assert.ok(src.includes("if(e.type==='heart:fire'){sendHearts(e.wave,e.officer,e.duration)"));
 assert.ok(src.includes("if(e.type==='heart:hit')"));
 assert.ok(src.includes('updatePoliceWaves(t)'));
 assert.ok(src.includes('animateHearts(dt)'));
});
test('La manifestation de Bastille apparaît ensemble et seulement à la fin',()=>{
 const src=read('manifestation-app.js');
 assert.ok(src.includes('bastilleCrowd.visible=run.z>=93'));
 assert.ok(!src.includes('distantCrowd(bastilleCrowd,'),'The other group must use the same models, not boxes');
 assert.ok(src.includes('bastilleActors=makeCrowd(bastilleCrowd,16,102,{spread:4.8})'));
 assert.ok(src.includes("banner(bastilleCrowd,'RÉPUBLIQUE — BASTILLE'"));
 assert.ok(src.includes("protestSign(bastilleCrowd,'NON À LA HAINE'"));
 assert.ok(!src.includes("banner(root,'RÉPUBLIQUE — BASTILLE'"));
});
test('La foule du joueur reste derrière, proche, sans marche automatique',()=>{
 const src=read('manifestation-app.js');
 assert.ok(src.includes('crowdActors=makeCrowd(root,16,-7.5'));
 assert.ok(src.includes('moveEscortInstances();'));
 assert.ok(src.includes('rallyProps.position.set(run.x*.27,0,lead-2.5)'));
 assert.ok(!src.includes('autoMarch=true'));
 for(let z=0;z<100;z+=5)for(let k=-20;k<=20;k+=4)
  assert.ok(behindNarrator(z,z+k,4.8)<=z-4.8);
});
test('Le cartouche du haut est discret et l’arc Chapitre 4 reste dégagé',()=>{
 const page=read('jeu-manifestation.html');
 assert.ok(page.includes('max-width:60%;min-height:23px'));
 assert.ok(page.includes(".chapter-sky{position:absolute;z-index:2;left:50%;top:28px"));
 assert.ok(page.includes('id="chapter-sky"'));
 assert.ok(page.includes('id="redLabel"'));
 assert.ok(page.includes('manifestation-runtime.js?v=20261110-coeurs-individuels-v12'));
});
test('Le décor parisien et le drapeau sans bloc blanc sont conservés',()=>{
 const src=read('manifestation-app.js');
 assert.ok(src.includes('side*8.15,.11,mid'));
 assert.ok(src.includes('Passages piétons, terrasses, platanes'));
 assert.ok(src.includes("flag(root,'france',4.1,0,12,4.4)"));
 assert.ok(!src.includes('addBox(root,4.1,.28,12,2.2,.56,2.3'));
});
test('Lecture, score 10 points par étape, versions à jour',()=>{
 const book=read('chapitre1-plateau.js'),reader=read('rendezvous-plateau.js'),page=read('jeu.html');
 assert.ok(book.includes('Les deux cortèges se rencontrent à mi-chemin.'));
 assert.ok(reader.includes('step!==passed.length+1'));
 assert.ok(reader.includes('state.points+=10'));
 assert.ok(reader.includes('jeu-manifestation.html?embedded=1&v=20261110-coeurs-individuels-v12'));
 assert.ok(page.includes('rendezvous-plateau.js?v=20261110-coeurs-individuels-v12'));
});
test('Six silhouettes 3D Kenney sous licence CC0 sont toujours présentes',()=>{
 for(const sex of ['male','female'])for(const variant of ['a','c','e']){
  const bytes=readFileSync(new URL('./assets/manifestation/character-'+sex+'-'+variant+'.glb',import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'glTF');
  assert.ok(bytes.length>100000&&bytes.length<400000);
  assert.match(bytes.toString('latin1',20,110000),/"walk"/);
 }
 assert.match(read('assets/manifestation/KENNEY-CC0-LICENSE.txt'),/Creative Commons Zero/);
});

test('Les CRS sont VISIBLES sur la chaussée et arrivent en formation pendant les trois vagues',()=>{
 const js=read('manifestation-app.js'),html=read('jeu-manifestation.html');
 assert.ok(js.includes('for(let i=0;i<4;i++)'),'Quatre CRS par attaque');
 assert.ok(js.includes('officer.baseX=(i-1.5)*1.45'),'Formation initiale centrée sur la rue');
 assert.ok(js.includes('officer.actor.position.x=officer.baseX+Math.sin('),'Les CRS peuvent bouger individuellement');
 assert.ok(js.includes('officer.actor.scale.setScalar(1.25)'),'Visibles sur téléphone');
 assert.ok(read('manifestation-core.js').includes('run.z=Math.min(run.z,active.trigger+1.3)'),'CRS bloquent réellement la chaussée');
 assert.ok(js.includes('Math.max(run.z+6.3,display.anchor-approaching*4.1)'));
 assert.ok(js.includes('policeAlert.hidden=!currentWave'));
 assert.ok(html.includes('id="crsAlert"'));
 assert.ok(html.includes('CRS SUR LA CHAUSSÉE'));
});
test('Le cortège de Bastille est de même qualité graphique que celui de République',()=>{
 const js=read('manifestation-app.js');
 assert.ok(js.includes('crowdActors=makeCrowd(root,16,-7.5'),'Même fonction de personnages');
 assert.ok(js.includes('bastilleActors=makeCrowd(bastilleCrowd,16,102,{spread:4.8})'));
 assert.ok(!js.includes('distantCrowd(bastilleCrowd,'),'Pas de foule en cubes pour Bastille');
 assert.ok(js.includes('walking(a.guy,t,.66)'),'Le cortège adverse avance');
 assert.ok(js.includes('bastilleCrowd.visible=run.z>=93'),'La foule et les banderoles arrivent ensemble');
});

test('Après avoir repoussé le groupe, le barrage s’ouvre',()=>{
 const r=procession(),wave=toWave(r,CRS_WAVES[0]);
 for(let i=0;i<20;i++)advance(r,.12,walk);
 const blocked=r.z;
 assert.ok(blocked<=CRS_WAVES[0].trigger+1.3);
 for(let i=0;i<30&&wave.status==='active';i++)advance(r,.12,rally);
 assert.equal(wave.status,'repelled');
 advance(r,.12,walk);
 assert.ok(r.z>blocked);
});

test('Chaque CRS possède son propre état, sans disparition collective',()=>{
 const r=procession(),wave=toWave(r,CRS_WAVES[0]);
 assert.equal(wave.officers.length,4);
 assert.deepEqual(wave.officers.map(o=>o.status),['standing','standing','standing','standing']);
 advance(r,.12,rally);
 assert.equal(wave.officers[0].targeted,true);
 assert.equal(wave.officers[1].targeted,false);
 assert.equal(wave.status,'active','Un projectile lancé ne termine pas la vague');
 // Le projectile traverse la rue : il n'a pas encore atteint sa cible.
 for(let i=0;i<4;i++)advance(r,.12,rest);
 assert.equal(wave.hearts,0);
 assert.equal(wave.officers[0].status,'standing');
 for(let i=0;i<4;i++)advance(r,.12,rest);
 assert.equal(wave.hearts,1);
 assert.equal(wave.officers[0].status,'heart');
 assert.deepEqual(wave.officers.slice(1).map(o=>o.status),['standing','standing','standing']);
 assert.equal(wave.status,'active','Les trois autres CRS restent à affronter');
 const fire=r.events.findIndex(e=>e.type==='heart:fire'&&e.wave===1&&e.officer===0);
 const hit=r.events.findIndex(e=>e.type==='heart:hit'&&e.wave===1&&e.officer===0);
 assert.ok(fire>=0&&hit>fire,'Le tir précède toujours l’impact');
});
test('Quatre CRS sont transformés individuellement avant la retraite du groupe',()=>{
 const r=procession(),wave=toWave(r,CRS_WAVES[0]);
 for(let i=0;i<45&&wave.status==='active';i++)advance(r,.12,rally);
 assert.equal(wave.status,'repelled');
 assert.deepEqual(wave.officers.map(o=>o.id),[0,1,2,3]);
 assert.ok(wave.officers.every(o=>o.status==='heart'));
 const hits=r.events.filter(e=>e.type==='heart:hit'&&e.wave===1);
 assert.deepEqual(hits.map(e=>e.officer),[0,1,2,3]);
 assert.equal(r.events.filter(e=>e.type==='crs:repelled'&&e.wave===1).length,1);
});
test('Les CRS sont animés indépendamment dans la scène, avec leur transformation au contact',()=>{
 const js=read('manifestation-app.js');
 assert.ok(js.includes("officer.actor.visible=state.status==='standing'"));
 assert.ok(js.includes('officer.actor.position.x=officer.baseX+Math.sin('));
 assert.ok(js.includes('officer.actor.position.z=(i%2)*.25+Math.cos('));
 assert.ok(js.includes('officer.actor.rotation.y=Math.sin('));
 assert.ok(js.includes('sceneGroup.add(heart)'));
 assert.ok(js.includes('fx.heart.scale.setScalar(.36+2.15*grow)'));
 assert.ok(js.includes("const duration=.82;")||read('manifestation-core.js').includes('const duration=.82;'));
});
