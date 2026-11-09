import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newRun,advance,yellow,callFromStatue,progress,behindNarrator,STATUE,FLAG,OBJECTIFS} from './manifestation-core.js';
const read=p=>readFileSync(new URL('./'+p,import.meta.url),'utf8');
const move=(x=0,y=0,red=false)=>({x,y,red});
function afterStatue(){
 const r=newRun();assert.equal(callFromStatue(r),true);
 for(let i=0;i<100&&r.phase===1;i++)advance(r,.05,move());
 assert.equal(r.phase,2,'La descente donne accès au drapeau');
 return r;
}
test('Départ directement sur la statue de la République, sans drapeau',()=>{
 const r=newRun();assert.equal(r.phase,1);assert.equal(r.climbed,true);
 assert.equal(r.x,STATUE.topX);assert.equal(r.z,STATUE.topZ);
 assert.equal(r.height,STATUE.topHeight);assert.deepEqual(r.steps,[]);
 assert.deepEqual(OBJECTIFS,['La République — « Camarades ! »','Retrouver le drapeau français','La rencontre des cortèges']);
 assert.equal(callFromStatue(r),true);assert.equal(callFromStatue(r),false);
 assert.equal(r.events.filter(e=>e.type==='shout').length,1,'Le cri ne joue qu’une fois');
});
test('La descente libère le joystick et amène au drapeau',()=>{
 const r=afterStatue();assert.equal(r.height,0);
 assert.equal(r.climbed,false);assert.deepEqual(r.steps,[1]);
 const z=r.z;for(let i=0;i<10;i++)advance(r,.05,move(0,1));
 assert.ok(r.z>z+2,'Le joystick doit pouvoir avancer après la statue');
 assert.equal(yellow(r),false,'On ne peut prendre le drapeau à distance');
});
test('Le second défi consiste bien à récupérer le drapeau français',()=>{
 const r=afterStatue();assert.equal(r.phase,2);
 r.x=FLAG.x;r.z=FLAG.z;assert.equal(yellow(r),true);
 assert.deepEqual(r.steps,[1,2]);assert.equal(r.phase,3);
 assert.equal(progress(r,2),false,'Pas de double gain de points');
});
test('Après le drapeau on marche jusqu’à Bastille sans être bloqué',()=>{
 const r=afterStatue();r.x=FLAG.x;r.z=FLAG.z;yellow(r);
 for(let i=0;i<210&&r.phase===3;i++){
  advance(r,.12,move(0,1));
  assert.ok(r.leaderZ<=r.z-6,'La foule reste derrière le narrateur');
 }
 assert.equal(r.finished,true);assert.deepEqual(r.steps,[1,2,3]);
 assert.equal(progress(r,3),false);
});
test('Sur la statue le joystick peut faire tourner le joueur sur lui-même',()=>{
 const r=newRun(),x=r.x,z=r.z,face=r.facing;
 for(let i=0;i<30;i++)advance(r,.05,move(1,0));
 assert.equal(r.x,x);assert.equal(r.z,z);
 assert.notEqual(r.facing,face);
});
test('La foule est légère, reste derrière, et Bastille arrive plus tard',()=>{
 const js=read('manifestation-app.js');
 assert.ok(js.includes('crowdActors=makeCrowd(root,9,-13'));
 assert.ok(js.includes('crowdActors=makeCrowd(root,9,-12'));
 assert.ok(js.includes('bastilleCrowd.visible=run.z>=83'));
 for(let z=0;z<105;z+=5)for(let n=-25;n<=25;n+=5)
  assert.ok(behindNarrator(z,z+n,5.5)<=z-5.5);
});
test('Caméra et personnage tournent effectivement sur 360°',()=>{
 const js=read('manifestation-app.js'),html=read('jeu-manifestation.html');
 assert.match(html,/id="turn360"/);
 assert.ok(js.includes("$('turn360').onclick="));
 assert.ok(js.includes('cameraOrbitLeft=Math.PI*2'));
 assert.ok(js.includes('hero.rotation.y=run.facing+cameraOrbit'));
 assert.ok(js.includes('Math.sin(theta)*radius'));
 assert.ok(js.includes('Math.cos(theta)*radius'));
 assert.ok(js.includes("if(!has&&key==='v'"));
});
test('Première scène : statue, deuxième scène : école et drapeau',()=>{
 const src=read('manifestation-app.js');
 const i=src.indexOf('function sceneFor(phase){'),a=src.indexOf('if(phase===1){',i);
 const b=src.indexOf('}else if(phase===2){',a),c=src.indexOf('}else{',b);
 assert.ok(i>=0&&a>i&&b>a&&c>b);
 assert.ok(src.slice(a,b).includes('statue(root)'));
 assert.ok(!src.slice(a,b).includes("flag(root,'france',4.1"));
 assert.ok(src.slice(b,c).includes("flag(root,'france',4.1"));
 assert.ok(src.includes('if(phase===3)flag(hero'));
});
test('Le bouton drapeau active directement le cortège',()=>{
 const src=read('manifestation-app.js');
 assert.ok(src.includes("if(before===2){autoMarch=true;joy={x:0,y:0};keys.clear();redHeld=false;sceneFor(3);"));
 assert.ok(src.includes('run.phase===3&&autoMarch'));
});
test('Les personnages Kenney riggés restent inclus sous licence CC0',()=>{
 for(const sex of ['male','female'])for(const variant of ['a','c','e']){
  const data=readFileSync(new URL('./assets/manifestation/character-'+sex+'-'+variant+'.glb',import.meta.url));
  assert.equal(data.toString('ascii',0,4),'glTF');
  assert.ok(data.length>100000&&data.length<400000);
  assert.match(data.toString('latin1',20,110000),/"walk"/);
 }
 assert.match(read('assets/manifestation/KENNEY-CC0-LICENSE.txt'),/Creative Commons Zero/);
});
test('La bonne feuille, la référence et les points ne changent pas',()=>{
 const html=read('jeu-manifestation.html'),plateau=read('chapitre1-plateau.js'),controller=read('rendezvous-plateau.js'),entry=read('jeu.html'),build=read('build-public.mjs');
 assert.ok(html.includes('id="chapter-sky"'));
 assert.ok(html.includes('Chapitre 4 — « Drapeau rouge »'));
 assert.ok(html.includes('p. 59–60'));
 assert.ok(plateau.includes('Les deux cortèges se rencontrent à mi-chemin.'));
 assert.ok(plateau.includes('Julie est devant la télévision.'));
 assert.ok(controller.includes('step!==passed.length+1'));
 assert.ok(controller.includes('state.points+=10'));
 assert.ok(html.includes('manifestation-runtime.js?v=20261109-statue360-v8'));
 assert.ok(controller.includes('jeu-manifestation.html?embedded=1&v=20261109-statue360-v8'));
 assert.ok(entry.includes('rendezvous-plateau.js?v=20261109-statue360-v8'));
 assert.ok(build.includes("'build-manifestation.mjs'"));
});
