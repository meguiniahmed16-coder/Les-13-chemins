import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {newRun,advance,yellow,progress,OBJECTIFS} from './manifestation-core.js';
const read=f=>readFileSync(new URL('./'+f,import.meta.url),'utf8');
test('Trois épreuves, jamais de points en double',()=>{
 const r=newRun();assert.equal(progress(r,2),false);
 r.x=4.1;r.z=12;assert.equal(yellow(r),true);assert.deepEqual(r.steps,[1]);assert.equal(progress(r,1),false);
 r.x=0;r.z=1.94;
 assert.equal(yellow(r),true);assert.equal(r.climbed,false,'La montée n’est pas une téléportation');
 assert.equal(r.climb.direction,'up');
 for(let i=0;i<48;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.climbed,true,'Le personnage finit au sommet');
 assert.ok(r.height>3.25,'Ses pieds sont au-dessus du socle');
 for(let i=0;i<50;i++)advance(r,.05,{x:0,y:0,red:true});
 assert.deepEqual(r.steps,[1,2]);assert.equal(r.phase,3);
 r.z=99;r.cohesion=95;advance(r,.05,{x:0,y:0,red:false});
 assert.deepEqual(r.steps,[1,2,3]);assert.equal(r.finished,true);assert.equal(progress(r,3),false);
 assert.deepEqual(r.events.filter(e=>e.type==='progress').map(e=>e.step),[1,2,3]);
});
test('La cohésion dépend de la cadence et du rappel, sans effacer les points',()=>{
 const r=newRun();progress(r,1);progress(r,2);
 const initial=r.cohesion;
 for(let i=0;i<50;i++)advance(r,.05,{x:0,y:1,red:false});
 assert.ok(r.cohesion<initial);
 const after=r.cohesion;
 for(let i=0;i<40;i++)advance(r,.05,{x:0,y:0,red:true});
 assert.ok(r.cohesion>after);assert.deepEqual(r.steps,[1,2]);
});
test('La nouvelle scène reste indépendante des deux autres chemins',()=>{
 const p=read('chapitre1-plateau.js'),page=read('jeu-manifestation.html'),build=read('build-public.mjs');
 assert.match(p,/Les rendez-vous/);assert.match(p,/manifestation/);
 assert.match(p,/Camarades/);assert.match(p,/Drapeau rouge/);
 assert.match(page,/id="yellow"/);assert.match(page,/id="red"/);assert.match(page,/id="stick"/);
 assert.match(build,/'jeu-manifestation.html'/);assert.match(build,/build-manifestation.mjs/);
 assert.equal(OBJECTIFS.length,3);
});


test('Six silhouettes humaines CC0 riggées et leurs animations sont présentes',()=>{
 const fs=awaitFreeFilesystem();
 for(const kind of ['male','female']){
  for(const variant of ['a','c','e']){
   const path='assets/manifestation/character-'+kind+'-'+variant+'.glb';
   const bytes=fs.readFileSync(new URL('./'+path,import.meta.url));
   assert.equal(bytes.toString('ascii',0,4),'glTF',path);
   assert.ok(bytes.length>100000&&bytes.length<400000,'Modèle compact '+path);
   assert.match(bytes.toString('latin1',20,110000),/\"walk\"/);
  }
 }
 const license=read('assets/manifestation/KENNEY-CC0-LICENSE.txt');
 assert.match(license,/Creative Commons Zero/);
});
function awaitFreeFilesystem(){return {readFileSync};}
test('L’incrustation du chapitre et les pancartes restent visibles',()=>{
 const html=read('jeu-manifestation.html'),js=read('manifestation-app.js');
 assert.match(html,/Chapitre 4 — « Drapeau rouge »/);
 assert.match(html,/p\. 59–60/);
 assert.match(js,/CHAPITRE 4/);assert.match(js,/DRAPEAU ROUGE · P\. 59–60/);
 for(const text of ['NON À LE PEN','LIBERTÉ ÉGALITÉ FRATERNITÉ','ENSEMBLE CONTRE LA HAINE','RÉPUBLIQUE — BASTILLE'])
  assert.ok(js.includes(text),'Pancarte ou banderole '+text);
 assert.ok(js.includes('GLTFLoader'));assert.ok(js.includes('cloneSkinned'));
 assert.ok(js.includes('x:-clamp(joy.x+right-left,-1,1)'),'Manette corrigée');
});

test('Régression statue : la montée se voit, le joystick fonctionne au sommet, jaune redescend',()=>{
 const r=newRun();progress(r,1);
 r.x=0;r.z=1.94;
 const atStart={x:r.x,z:r.z,height:r.height};
 assert.equal(yellow(r),true);
 assert.ok(r.climb,'Une trajectoire animée remplace la téléportation');
 advance(r,.05,{x:0,y:0,red:false});
 assert.ok(r.climb,'Le personnage ne doit pas monter instantanément');
 assert.ok(r.height>=0&&r.height<3.32);
 for(let i=0;i<24;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.ok(r.height>0&&r.height<3.32,'Position intermédiaire durant la montée');
 assert.notEqual(r.z,atStart.z);
 for(let i=0;i<28;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.climbed,true);
 assert.equal(r.climb,null);
 assert.ok(r.height>3.25,'Pieds sur le socle et non dans la statue');
 const x=r.x,z=r.z;
 for(let i=0;i<10;i++)advance(r,.05,{x:1,y:0,red:false});
 assert.ok(r.x>x,'Le joystick ne doit plus être désactivé une fois en haut');
 assert.equal(r.height,3.32);
 assert.ok(Math.hypot(r.x,r.z-5)>.96,'Impossible de pénétrer le bronze');
 assert.deepEqual(r.steps,[1],'La montée seule ne gagne aucun point');
 assert.equal(yellow(r),true,'Jaune redescend');
 assert.equal(r.climb.direction,'down');
 for(let i=0;i<41;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.climb,null);
 assert.equal(r.climbed,false);
 assert.equal(r.height,0,'Retour au niveau de la rue');
 assert.ok(r.z<1,'Au pied des marches');
 assert.ok(!r.finished);
});
test('Régression statue : collision au sol, retour aux marches, cri puis sortie vers Bastille',()=>{
 const r=newRun();progress(r,1);
 r.x=0;r.z=1.94;
 for(let i=0;i<15;i++)advance(r,.05,{x:0,y:1,red:false});
 assert.ok(r.z<=1.97,'Le joystick ne peut pas enfoncer le personnage dans la pierre');
 assert.equal(yellow(r),true,'Les marches sont accessibles depuis le pied');
 for(let i=0;i<50;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.climbed,true);
 const mobiliseAvant=r.mobilisation;
 for(let i=0;i<8;i++)advance(r,.05,{x:-1,y:0,red:true});
 assert.ok(r.mobilisation>mobiliseAvant,'Le bouton rouge reste actif en marchant en haut');
 for(let i=0;i<45;i++)advance(r,.05,{x:0,y:0,red:true});
 assert.equal(r.phase,3,'Le cri permet de sortir automatiquement de la scène');
 assert.equal(r.climbed,false);
 assert.equal(r.height,0);
 assert.deepEqual(r.steps,[1,2]);
});
test('Les commandes du socle restent lisibles sur téléphone',()=>{
 const page=read('jeu-manifestation.html'),app=read('manifestation-app.js');
 assert.ok(page.includes('id="yellowLabel"'));
 assert.ok(page.includes('.deck{position:sticky;bottom:0;'));
 assert.ok(app.includes('hero.position.set(run.x,run.height||0,run.z)'));
 assert.ok(app.includes("run.climb.direction==='up'"));
 assert.ok(app.includes("if(run.phase===2&&run.climbed)"));
 assert.ok(app.includes("hero.rotation.y=0"));
 assert.ok(app.includes("Marches claires sur la face avant gauche"));
});
