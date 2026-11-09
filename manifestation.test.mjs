import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {newRun,advance,yellow,progress,callFromStatue,behindNarrator,OBJECTIFS} from './manifestation-core.js';
const read=f=>readFileSync(new URL('./'+f,import.meta.url),'utf8');
test('Trois épreuves : monter, crier, redescendre et suivre avec la foule derrière',()=>{
 const r=newRun();assert.equal(progress(r,2),false);
 r.x=4.1;r.z=12;assert.equal(yellow(r),true);
 r.x=0;r.z=1.94;assert.equal(yellow(r),true);
 for(let i=0;i<48;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.climbed,true);assert.equal(r.statueShouted,false);
 for(let i=0;i<34;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.phase,2,'Sans le bouton Camarades, on attend en haut');
 assert.equal(callFromStatue(r),true);
 for(let i=0;i<90&&r.phase===2;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.phase,3);assert.equal(r.height,0);assert.ok(r.leaderZ<=r.z-6);
 r.z=99;r.cohesion=95;advance(r,.05,{x:0,y:0,red:false});
 assert.deepEqual(r.steps,[1,2,3]);assert.equal(r.finished,true);
 assert.equal(progress(r,3),false);
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

test('Montée visible ; bouton Camarades nécessaire puis descente automatique',()=>{
 const r=newRun();progress(r,1);r.x=0;r.z=1.94;assert.equal(yellow(r),true);
 advance(r,.05,{x:0,y:0,red:false});assert.ok(r.height<3.32);
 for(let i=0;i<48;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.climbed,true);assert.equal(r.statueShouted,false);
 assert.equal(r.events.filter(e=>e.type==='shout').length,0);
 assert.equal(callFromStatue(r),true);assert.equal(callFromStatue(r),true);
 assert.equal(r.events.filter(e=>e.type==='shout').length,1);
 let down=false;
 for(let i=0;i<90&&r.phase===2;i++){advance(r,.05,{x:0,y:0,red:false});if(r.climb?.direction==='down')down=true;}
 assert.equal(down,true);assert.equal(r.phase,3);assert.deepEqual(r.steps,[1,2]);assert.equal(r.height,0);
});

test('Pas de collision ni départ sans le cri ; Bastille seulement après le bouton',()=>{
 const r=newRun();progress(r,1);r.x=0;r.z=1.94;
 for(let i=0;i<15;i++)advance(r,.05,{x:0,y:1,red:false});
 assert.ok(r.z<=1.97);assert.equal(yellow(r),true);
 for(let i=0;i<48;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.phase,2);assert.equal(callFromStatue(r),true);
 for(let i=0;i<90&&r.phase===2;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.phase,3);assert.equal(r.height,0);assert.deepEqual(r.steps,[1,2]);
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

test('Le cri au sommet nécessite un appui et ne se répète pas',()=>{
 const r=newRun();progress(r,1);r.x=0;r.z=1.94;assert.equal(callFromStatue(r),false);
 yellow(r);for(let i=0;i<48;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.statueShouted,false);
 assert.equal(r.events.filter(e=>e.type==='shout').length,0);
 assert.equal(callFromStatue(r),true);assert.equal(callFromStatue(r),true);
 assert.equal(r.events.filter(e=>e.type==='shout').length,1);
 for(let i=0;i<90&&r.phase===2;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.phase,3);
});

test('Le jaune reste un raccourci de descente après le cri',()=>{
 const r=newRun();progress(r,1);r.x=0;r.z=1.94;yellow(r);
 for(let i=0;i<48;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(callFromStatue(r),true);assert.equal(yellow(r),true);
 assert.equal(r.climb.direction,'down');
 for(let i=0;i<50&&r.phase===2;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.phase,3);assert.equal(r.height,0);assert.deepEqual(r.steps,[1,2]);
});

test('Commandes statue et cache navigateur réinitialisés pour la foule derrière',()=>{
 const html=read('jeu-manifestation.html'),app=read('manifestation-app.js');
 const controller=read('rendezvous-plateau.js'),plateau=read('jeu.html');
 for(const id of ['statueControls','statueProgress','statueCall','statueDescend'])assert.ok(html.includes('id="'+id+'"'));
 assert.ok(app.includes("if(e.type==='shout')"));assert.ok(app.includes('voiceCamarades()'));
 assert.ok(app.includes('statuePanel.hidden=!up'));
 assert.ok(html.includes('manifestation-runtime.js?v=20261109-last-fix7'));
 assert.ok(controller.includes('jeu-manifestation.html?embedded=1&v=20261109-last-fix7'));
 assert.ok(plateau.includes('rendezvous-plateau.js?v=20261109-last-fix7'));
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

test('Régression densification : foule de République toujours derrière',()=>{
 const src=read('manifestation-app.js');
 assert.ok(src.includes('makeCrowd(root,9,-13'));
 assert.ok(src.includes('distantCrowd(root,-27,40)'));
 assert.ok(src.includes('makeCrowd(root,9,-12'));
 assert.ok(!src.includes('distantCrowd(root,20,190)'));
 assert.ok(!src.includes('distantCrowd(root,113,230)'));
 assert.ok(src.includes('bastilleCrowd.visible=run.z>=83'));
 for(let z=0;z<107;z+=7)for(let candidate=z-30;candidate<z+30;candidate+=3)
  assert.ok(behindNarrator(z,candidate,5.5)<=z-5.5);
 const run=newRun();progress(run,1);progress(run,2);
 for(let i=0;i<240;i++){advance(run,.05,{x:0,y:1,red:i%20<7});assert.ok(run.leaderZ<=run.z-6);}
});

test('Après la statue le joystick avant avance et permet de finir sans perdre au niveau de la jauge',()=>{
 const r=newRun();progress(r,1);r.x=0;r.z=1.94;
 assert.equal(yellow(r),true);
 for(let i=0;i<50;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.climbed,true);
 assert.equal(callFromStatue(r),true);
 for(let i=0;i<90&&r.phase===2;i++)advance(r,.05,{x:0,y:0,red:false});
 assert.equal(r.phase,3);assert.equal(r.z,0);assert.equal(r.height,0);
 for(let i=0;i<10;i++)advance(r,.12,{x:0,y:1,red:false});
 assert.ok(r.z>5,'Le joystick doit faire avancer après la descente');
 for(let i=0;i<240&&r.phase===3;i++)advance(r,.12,{x:0,y:1,red:false});
 assert.equal(r.finished,true,'Avancer suffit pour rejoindre Bastille, même sans bouton rouge');
 assert.deepEqual(r.steps,[1,2,3]);
});
test('La troisième scène est plus légère et possède une commande de marche directe',()=>{
 const js=read('manifestation-app.js'),html=read('jeu-manifestation.html');
 assert.ok(js.includes('buildings(root,-7,135,true)'));
 assert.ok(js.includes('makeCrowd(root,9,-12'));
 assert.ok(js.includes('distantCrowd(root,-27,40)'));
 assert.ok(js.includes('if(run.phase===3){autoMarch=true;'));
 assert.ok(js.includes("$('advanceBastille').onclick="));
 assert.ok(html.includes('id="advanceBastille"'));
 assert.ok(html.includes('manifestation-runtime.js?v=20261109-last-fix7'));
});
