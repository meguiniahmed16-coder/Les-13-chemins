import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCell,ROOM,CHARACTER_FILE,windowX,ITEMS,createBrush} from './prison-3d-world.js';
import {BAR_X,slitCenters,createGame,startGame,aimAt,actionDown,continueGame,
 advance,PARTS} from './yoyo-core.js';
const text=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const collect=(scene,name)=>{const output=[];scene.traverse(object=>{
 if(object.name===name)output.push(object);});return output;};
test('3D cell contains the tangible room, two bunk beds, furniture, bath and seven bars',()=>{
 const w=buildCell();
 assert.ok(ROOM.width*ROOM.depth>=8.5&&ROOM.width*ROOM.depth<=9.5);
 const scene=w.scene;
 for(const name of ['sol-cellule','mur-gauche','mur-droit','plafond',
  'porte-cellule','judas-porte','serrure-porte','table','tabouret',
  'armoire','toilettes','lavabo','miroir','fenetre-du-voisin',
  'brosse-posee','brosse-tenue','corde-et-sac','corde-de-drap','cintre',
  'sac-de-tabac'])
  assert.equal(collect(scene,name).length,1,'One physical 3D '+name);
 assert.equal(collect(scene,'barreau').length,BAR_X.length);
 assert.equal(collect(scene,'lit-superpose-1').length,1);
 assert.equal(collect(scene,'lit-superpose-2').length,1);
 for(const i of [1,2]){
  assert.equal(collect(scene,'matelas-'+i).length,1);
  assert.equal(collect(scene,'couverture-'+i).length,1);
  assert.equal(collect(scene,'oreiller-'+i).length,1);
 }
 assert.equal(w.storedBrush.type,'Group');
 assert.ok(w.delivery.children.every(x=>x.isMesh),'No painted-flat rope or sack');
 assert.equal(w.heldBrush.visible,false);
 assert.ok(w.scene.children.length>=28);
});
test('Window 3D bars and screen-space openings share exact gameplay geometry',()=>{
 const aspect=16/9;
 const centers=slitCenters(aspect),projected=centers.map(x=>windowX(x,aspect));
 assert.equal(centers.length,4);
 for(let i=0;i<4;i++){
  assert.ok(Math.abs(projected[i]-(BAR_X[i+1]+BAR_X[i])/2)<.0001,
    '3D slot '+i+' is between the actual steel bars');
 }
 assert.equal(ITEMS.length,3);
 assert.deepEqual(ITEMS,PARTS.map((s,i)=>i===1?'Attraper le tabac':s));
});
test('The existing three-stage logic and the score remain intact',()=>{
 const g=createGame();startGame(g);
 assert.equal(g.part,0);assert.equal(g.points,0);
 aimAt(g,.733);actionDown(g);
 assert.equal(g.part,1);assert.equal(g.points,10);
 assert.equal(g.phase,'between');
 continueGame(g);assert.equal(g.phase,'playing');
 advance(g,.016);assert.equal(g.points,10);
});
test('Playable prototype uses the existing CC0 humanoid skinning, not a 2D limb overlay',()=>{
 const page=text('./prison-3d-lab.html'),app=text('./prison-3d-lab.js');
 const license=text('./danse-quaternius-LICENSE.txt');
 assert.equal(CHARACTER_FILE,'danse-quaternius-hero.glb');
 assert.match(license,/CC0 1\.0 Universal/);
 assert.ok(app.includes('new GLTFLoader().loadAsync(CHARACTER_FILE)'));
 assert.ok(app.includes('upperarm_r')&&app.includes('lowerarm_r'));
 assert.ok(app.includes('isSkinnedMesh')&&app.includes('b[name].quaternion.copy'));
 assert.ok(app.includes('setWindowAspect(g,camera.aspect)'));
 assert.ok(app.includes('renderer.render(w.scene,camera)'));
 assert.ok(!page.includes('handOpen2D')&&!app.includes('handGrip2D'));
 assert.ok(page.includes('prison-3d-lab-runtime.js'));
 assert.ok(page.includes('Retour au jeu actuel')||page.includes('Jeu actuel'));
 assert.ok(page.includes('aucun point n\'est ajouté'));
});
test('New 3D prototype must not replace or rewrite the scored original',()=>{
 const original=text('./jeu-yoyo.html');
 assert.ok(original.includes('yoyo-runtime.js'));
 assert.ok(original.includes('yoyo:won')||text('./yoyo-app.js').includes("send('yoyo:won'"));
 assert.ok(text('./build-public.mjs').includes("'jeu-yoyo.html'"));
});
