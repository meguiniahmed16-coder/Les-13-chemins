import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {newRun,advance,yellow,progress,callFromStatue,OBJECTIFS} from './manifestation-core.js';
const read=f=>readFileSync(new URL('./'+f,import.meta.url),'utf8');
test('Trois épreuves, un seul jaune lance cri et descente avant le chemin de Bastille',()=>{
 const r=newRun();assert.equal(progress(r,2),false);
 r.x=4.1;r.z=12;assert.equal(yellow(r),true);assert.deepEqual(r.steps,[1]);assert.equal(progress(r,1),false);
 r.x=0;r.z=1.94;
 assert.equal(yellow(r),true);
 for(let i=0;i<48;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.statueShouted,true,'Cri automatique dès le sommet');
 assert.equal(r.climbed,true,'Le personnage est d’abord en haut');
 assert.equal(r.phase,2,'Pas de points avant la descente');
 for(let i=0;i<90&&r.phase===2;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.deepEqual(r.steps,[1,2]);assert.equal(r.phase,3);
 assert.equal(r.height,0,'La suite s’ouvre après le retour au sol');
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
 assert.match(html,/id="chapter-sky"/);
 assert.match(html,/<textPath href="#chapitreQuatreArc"/);
 assert.match(html,/class="chapter-arc"/);
 assert.match(html,/class="chapter-pages"/);
 assert.match(html,/\.chapter-sky\{[^}]*pointer-events:none/);
 assert.doesNotMatch(html,/chapter-stamp/,'Aucun encart rectangulaire ne doit masquer la vidéo');
 assert.ok(!js.includes('chapterWall(root)'), 'La référence ne doit plus être répétée sur un mur');
 for(const text of ['NON À LE PEN','LIBERTÉ ÉGALITÉ FRATERNITÉ','ENSEMBLE CONTRE LA HAINE','RÉPUBLIQUE — BASTILLE'])
  assert.ok(js.includes(text),'Pancarte ou banderole '+text);
 assert.ok(js.includes('GLTFLoader'));assert.ok(js.includes('cloneSkinned'));
 assert.ok(js.includes('x:-clamp(joy.x+right-left,-1,1)'),'Manette corrigée');
});

test('Régression statue : montée visible, cri immédiat et descente automatique',()=>{
 const r=newRun();progress(r,1);r.x=0;r.z=1.94;
 assert.equal(yellow(r),true,'Un seul appui jaune');
 assert.ok(r.climb);assert.equal(r.climb.direction,'up');
 advance(r,.05,{x:0,y:0,red:false});
 assert.ok(r.climb);assert.ok(r.height<3.32);
 for(let i=0;i<24;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.ok(r.height>0&&r.height<3.32,'Position intermédiaire visible');
 for(let i=0;i<24;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.climbed,true);assert.equal(r.statueShouted,true);
 assert.equal(r.mobilisation,100);
 assert.equal(r.events.filter(e=>e.type==='shout').length,1,'Un seul cri');
 assert.equal(r.phase,2);
 let sawDescent=false;
 for(let i=0;i<90&&r.phase===2;i++){
  advance(r,.05,{x:0,y:0,red:false});
  if(r.climb?.direction==='down')sawDescent=true;
 }
 assert.equal(sawDescent,true);
 assert.equal(r.phase,3,'Le cortège part automatiquement après la descente');
 assert.deepEqual(r.steps,[1,2]);
 assert.equal(r.height,0);
 assert.equal(r.events.filter(e=>e.type==='shout').length,1,'Aucun cri répété');
});

test('Collision au pied de la statue puis sortie vers Bastille sans bouton rouge',()=>{
 const r=newRun();progress(r,1);r.x=0;r.z=1.94;
 for(let i=0;i<15;i++)advance(r,.05,{x:0,y:1,red:false});
 assert.ok(r.z<=1.97,'On ne pénètre pas le socle');
 assert.equal(yellow(r),true);
 for(let i=0;i<125&&r.phase===2;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.phase,3);
 assert.equal(r.climbed,false);assert.equal(r.height,0);
 assert.deepEqual(r.steps,[1,2]);
});

test('Les commandes du socle restent lisibles sur téléphone',()=>{
 const page=read('jeu-manifestation.html'),app=read('manifestation-app.js');
 assert.ok(page.includes('id="yellowLabel"'));
 assert.ok(page.includes('.deck{position:sticky;bottom:0;'));
 assert.ok(app.includes('hero.position.set(run.x,run.height||0,run.z)'));
 assert.ok(app.includes("run.climb.direction==='up'"));
 assert.ok(app.includes("if(run.phase===2&&run.climbed&&!run.climb)"));
 assert.ok(app.includes("hero.rotation.y=0"));
 assert.ok(app.includes("Marches claires sur la face avant gauche"));
});

test('Le cri se déclenche seul au sommet ; le rouge est facultatif et ne double pas le cri',()=>{
 const r=newRun();progress(r,1);r.x=0;r.z=1.94;
 assert.equal(callFromStatue(r),false,'On ne crie pas depuis la rue');
 assert.equal(yellow(r),true);
 for(let i=0;i<48;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.climbed,true);
 assert.equal(r.statueShouted,true);
 assert.equal(r.events.filter(e=>e.type==='shout').length,1);
 assert.equal(callFromStatue(r),true,'L’ancien bouton reste compatible');
 assert.equal(r.events.filter(e=>e.type==='shout').length,1,'Aucun second cri');
 for(let i=0;i<90&&r.phase===2;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.phase,3,'Bastille débloqué automatiquement');
 assert.deepEqual(r.steps,[1,2]);
});

test('Le jaune peut toujours redescendre plus tôt après le cri',()=>{
 const r=newRun();progress(r,1);r.x=0;r.z=1.94;
 assert.equal(yellow(r),true);
 for(let i=0;i<48;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.statueShouted,true);
 assert.equal(yellow(r),true,'Descente manuelle disponible pendant le cri');
 assert.equal(r.climb.direction,'down');
 for(let i=0;i<50&&r.phase===2;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.phase,3);
 assert.equal(r.height,0);
 assert.equal(r.climbed,false);
 assert.deepEqual(r.steps,[1,2]);
});

test('Un seul bouton jaune suffit : libellés et cache navigateur mis à jour',()=>{
 const html=read('jeu-manifestation.html'),app=read('manifestation-app.js');
 const controller=read('rendezvous-plateau.js'),plateau=read('jeu.html');
 for(const id of ['statueControls','statueProgress','statueCall','statueDescend'])
  assert.ok(html.includes('id="'+id+'"'),'Contrôle de secours '+id);
 assert.ok(html.includes('statue-buttons button{min-height:54px'));
 assert.ok(app.includes("if(e.type==='shout')"));
 assert.ok(app.includes('voiceCamarades()'));
 assert.ok(app.includes('const onStatue=run.phase===2'));
 assert.ok(app.includes('statuePanel.hidden=!up'));
 assert.ok(html.includes('manifestation-runtime.js?v=20261109-sky-reader5'));
 assert.ok(controller.includes('jeu-manifestation.html?embedded=1&v=20261109-sky-reader5'));
 assert.ok(plateau.includes('rendezvous-plateau.js?v=20261109-sky-reader5'));
});

test('La manette de la statue existe une seule fois et ses commandes sont raccordées',()=>{
 const html=read('jeu-manifestation.html'),app=read('manifestation-app.js');
 for(const id of ['statueControls','statueProgress','statueCall','statueDescend']){
  assert.equal(html.split('id="'+id+'"').length-1,1,'Un seul élément '+id);
  assert.ok(app.includes("$('"+id+"')"),'Élément contrôlé par le jeu : '+id);
 }
 assert.ok(app.includes("$('statueCall').onclick=callCrowd"));
 assert.ok(app.includes("$('statueDescend').onclick=yellowPress"));
});

test('Bonne feuille du Chemin III : même lecture immersive que les autres jeux',()=>{
 const ui=read('chapitre1-plateau.js'),controller=read('rendezvous-plateau.js');
 assert.ok(ui.includes("#rendezvousDialog{position:fixed;inset:0;box-sizing:border-box;width:100vw"));
 assert.ok(ui.includes("max-width:790px;margin:0 auto"));
 assert.ok(ui.includes("font:clamp(20px,2.15vw,25px)/1.86 Georgia,serif"));
 assert.ok(ui.includes("background:none;border:0;padding:0"));
 assert.ok(ui.includes("readerKicker.textContent='Vous êtes arrivé à'"));
 assert.ok(ui.includes("readerArea.className='rendezvous-area'"));
 assert.ok(ui.includes("readerReference.className='rendezvous-reference'"));
 assert.ok(ui.includes("const thirdExtract="),'Le passage original est inchangé');
 assert.ok(controller.includes("info.after(partNav)"),'La navigation vient après la lecture');
 assert.ok(controller.includes("function reachedReadingEnd()"));
 assert.ok(controller.includes("excerpt.getBoundingClientRect().bottom<=reader.getBoundingClientRect().bottom-18"));
 assert.ok(controller.includes("},1150)"),'Transition temporisée comme les autres extraits');
});
