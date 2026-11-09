import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newRun,advance,yellow,callFromStatue,progress,behindNarrator,STATUE,FLAG,OBJECTIFS} from './manifestation-core.js';
const read=p=>readFileSync(new URL('./'+p,import.meta.url),'utf8');
const forward={x:0,y:1,red:false},stopRed={x:0,y:0,red:true};
function startProcession(){
 const run=newRun();
 assert.equal(run.phase,1);assert.equal(callFromStatue(run),true);
 for(let i=0;i<90&&run.phase===1;i++)advance(run,.05);
 assert.equal(run.phase,2);
 run.x=FLAG.x;run.z=FLAG.z;assert.equal(yellow(run),true);assert.equal(run.phase,3);
 return run;
}
test('Départ statue puis drapeau puis cortège, trois succès sans doublons',()=>{
 const run=startProcession();
 assert.deepEqual(run.steps,[1,2]);
 assert.equal(progress(run,2),false);
 assert.deepEqual(OBJECTIFS,['La République — « Camarades ! »','Retrouver le drapeau français','La rencontre des cortèges']);
 assert.equal(run.x,0);assert.equal(run.z,0);
});
test('Marche : la foule reste proche derrière et s’étire si je marche sans arrêt',()=>{
 const run=startProcession();
 const gap0=run.z-run.leaderZ;
 for(let i=0;i<80;i++)advance(run,.05,forward);
 assert.ok(run.z>20);
 assert.ok(run.z-run.leaderZ>gap0+2.5,'La foule doit prendre du retard');
 assert.ok(run.z-run.leaderZ<=15.5,'Elle reste assez proche pour rester visible');
 assert.ok(run.cohesion<80,'Le cortège doit perdre de la cohésion');
});
test('Arrêt + bouton ROUGE : la foule revient et sa cohésion remonte',()=>{
 const run=startProcession();
 for(let i=0;i<110;i++)advance(run,.05,forward);
 const before={z:run.z,gap:run.z-run.leaderZ,cohesion:run.cohesion};
 for(let i=0;i<40;i++)advance(run,.05,stopRed);
 assert.equal(run.z,before.z,'Le joueur doit être arrêté');
 assert.ok(run.z-run.leaderZ<before.gap-3,'La foule se rapproche physiquement');
 assert.ok(run.cohesion>before.cohesion+30,'L’appel rouge doit regrouper');
});
test('Pas de marche automatique : une entrée à zéro ne fait pas avancer',()=>{
 const run=startProcession();const z=run.z;
 for(let i=0;i<80;i++)advance(run,.05,{x:0,y:0,red:false});
 assert.equal(run.z,z);
});
test('Arriver seul ne suffit pas, mais s’arrêter et regrouper permet la victoire',()=>{
 const run=startProcession();
 for(let i=0;i<180&&run.z<99;i++)advance(run,.12,forward);
 assert.equal(run.phase,3);assert.ok(run.z>=99);
 assert.ok(run.cohesion<68,'Sans arrêt la foule est dispersée');
 for(let i=0;i<70&&run.phase===3;i++)advance(run,.12,stopRed);
 assert.equal(run.finished,true);assert.deepEqual(run.steps,[1,2,3]);
 assert.equal(progress(run,3),false,'Aucun point en double');
});
test('La marche n’est jamais bloquée par le manque de cohésion',()=>{
 const run=startProcession();
 for(let i=0;i<90;i++)advance(run,.12,forward);
 const z=run.z;
 run.cohesion=0;
 advance(run,.12,forward);
 assert.ok(run.z>z,'Le joystick continue à fonctionner même à cohésion zéro');
});
test('La caméra est derrière toute la foule et regarde vers le joueur',()=>{
 const js=read('manifestation-app.js');
 assert.ok(js.includes('const radius=run.phase===1?26:25'));
 assert.ok(js.includes('run.z-Math.cos(theta)*radius'));
 assert.ok(js.includes('hero.rotation.y=run.facing+cameraOrbit'));
 assert.ok(js.includes('cameraOrbitLeft=Math.PI*2'));
});
test('La foule proche et les pancartes suivent le meneur à chaque image',()=>{
 const js=read('manifestation-app.js');
 assert.ok(js.includes('crowdActors=makeCrowd(root,16,-7.5'));
 assert.ok(js.includes('distantCrowd(root,-8,24,true)'));
 assert.ok(js.includes('function moveEscortInstances()'));
 assert.ok(js.includes('moveEscortInstances();'));
 assert.ok(js.includes('rallyProps.position.set(run.x*.27,0,lead-2.5)'));
 assert.ok(js.includes('behindNarrator(run.z,lead+'));
 assert.ok(js.includes("protestSign(rallyProps,'NON À LE PEN'"));
 assert.ok(js.includes("flag(rallyProps,tricolor?'france':'red'"));
 assert.ok(js.includes("banner(rallyProps,'TOUS ENSEMBLE'"));
 for(let z=0;z<100;z+=5)for(let x=-30;x<30;x+=3)
  assert.ok(behindNarrator(z,z+x,4.8)<=z-4.8);
});
test('Le trottoir parisien et les façades crème sont présents, sans bloc blanc sous le drapeau',()=>{
 const js=read('manifestation-app.js');
 assert.ok(js.includes('side*8.15,.11,mid'));
 assert.ok(js.includes('Passages piétons, terrasses, platanes'));
 assert.ok(js.includes('floor-.37,vz'));
 assert.ok(js.includes("flag(root,'france',4.1,0,12,4.4)"));
 assert.ok(!js.includes('addBox(root,4.1,.28,12,2.2,.56,2.3'));
});
test('Le bouton d’avancer marche seulement en maintenant, le ROUGE reste utilisable',()=>{
 const js=read('manifestation-app.js'),html=read('jeu-manifestation.html');
 assert.ok(js.includes("march.addEventListener('pointerdown'"));
 assert.ok(js.includes('forwardHeld=true'));
 assert.ok(js.includes('pointerup'));
 assert.ok(js.includes('forwardHeld=false'));
 assert.ok(!js.includes('autoMarch=true'));
 assert.ok(html.includes('Maintenir pour avancer'));
 assert.ok(html.includes('id="red"'));
});
test('Les modèles 3D Kenney restent libres et légers',()=>{
 for(const sex of ['male','female'])for(const v of ['a','c','e']){
  const bytes=readFileSync(new URL('./assets/manifestation/character-'+sex+'-'+v+'.glb',import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'glTF');
  assert.ok(bytes.length>100000&&bytes.length<400000);
  assert.match(bytes.toString('latin1',20,110000),/"walk"/);
 }
 assert.match(read('assets/manifestation/KENNEY-CC0-LICENSE.txt'),/Creative Commons Zero/);
});
test('Lecture, référence, trois jeux et points restent inchangés',()=>{
 const html=read('jeu-manifestation.html'),book=read('chapitre1-plateau.js'),
   reader=read('rendezvous-plateau.js'),page=read('jeu.html');
 assert.ok(html.includes('id="chapter-sky"'));
 assert.ok(html.includes('Chapitre 4 — « Drapeau rouge »'));
 assert.ok(html.includes('p. 59–60'));
 assert.ok(book.includes('Les deux cortèges se rencontrent à mi-chemin.'));
 assert.ok(reader.includes('step!==passed.length+1'));
 assert.ok(reader.includes('state.points+=10'));
 assert.ok(html.includes('manifestation-runtime.js?v=20261109-rally-paris-v9'));
 assert.ok(reader.includes('jeu-manifestation.html?embedded=1&v=20261109-rally-paris-v9'));
 assert.ok(page.includes('rendezvous-plateau.js?v=20261109-rally-paris-v9'));
});
