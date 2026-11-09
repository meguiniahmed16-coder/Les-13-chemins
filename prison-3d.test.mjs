import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createGame,startGame,aimAt,actionDown,actionUp,move,advance,
 BAR_X,SLIT_X,slitCenters,betweenBars,aligned,continueGame} from './yoyo-core.js';

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
test('The experimental 3D cell has a rigged CC0 human, bunk, seven bars and a separate renderer',()=>{
 const code=read('./prison-3d-scene.js');
 const html=read('./prison-3d.html');
 const builder=read('./build-prison-3d.mjs');
 assert.match(code,/GLTFLoader/);
 assert.match(code,/loadAsync\('danse-quaternius-hero\.glb'\)/);
 assert.match(code,/isSkinnedMesh/,'Real skinning rather than cylinders in place of the body');
 assert.match(code,/upperarm_r/);
 assert.match(code,/new T\.WebGLRenderer/);
 assert.match(code,/position\.lerp\(destination/);
 assert.match(code,/function pose\(g,t\)/);
 assert.match(code,/for\(let i=0;i<7;i\+\+\)/,'Seven solid 3D metal bars');
 for(const target of ['LitSuperpose','Armoire','Table','Toilettes','Lavabo',
  'BrosseToilette3D','YoyoDuVoisin','CelluleTroisMetres'])
  assert.ok(code.includes(target),target+' is a physical 3D group');
 assert.match(code,/const cargo=new T\.Group/);
 assert.match(code,/const rope=new T\.Line/);
 assert.match(html,/id="viewport"/);
 assert.match(html,/id="aim"/);
 assert.match(html,/id="grab"/);
 assert.match(html,/id="hide"/);
 assert.match(html,/id="view"/);
 assert.match(builder,/prison-3d-runtime\.js/);
 assert.ok(fs.existsSync(new URL('./danse-quaternius-hero.glb',import.meta.url)));
 assert.ok(read('./danse-quaternius-LICENSE.txt').includes('CC0 1.0 Universal'));
});
test('The 3D version uses the actual original three-stage game rules without changing the published game',()=>{
 const src=read('./prison-3d-app.js');
 for(const fn of ['createGame','startGame','continueGame','move','aimAt',
  'actionDown','actionUp','advance','aligned','betweenBars'])
  assert.ok(src.includes(fn),'The legacy rule function '+fn+' is reused');
 assert.ok(src.includes('state=createGame()'));
 assert.ok(src.includes("send('yoyo:won'")===false,
  'The prototype never submits new prizes to the public platform');
 assert.ok(src.includes('Le tabac est récupéré'));
 assert.ok(src.includes('De l’autre côté, quelqu’un.'));
 assert.ok(src.includes("if(event.type==='caught')"));
 assert.ok(src.includes("if(event.type==='guard')"));
 assert.ok(src.includes("state.points"));
 assert.ok(src.includes('pointerdown'));
 assert.ok(!src.includes('handOpen2D'));
 assert.ok(!src.includes('handGrip2D'));
});
test('The physical iron bars only permit hooks and bags through the existing 3D-sized openings',()=>{
 assert.equal(BAR_X.length,7);
 assert.equal(SLIT_X.length,4);
 const gaps=slitCenters(16/9);
 const g=createGame();startGame(g);
 aimAt(g,.733);
 assert.equal(aligned(g),true,'The toilet brush sits at the reachable 3D position');
 actionDown(g);assert.equal(g.part,1);assert.equal(g.points,10);
 continueGame(g);
 assert.equal(g.phase,'playing');
 g.hooked=true;g.hookX=gaps[1];
 assert.equal(betweenBars(g),true,'A physical slot is traversable');
 g.hookX=.5;
 assert.equal(betweenBars(g),false,'A solid central iron bar blocks the sack');
});
test('The pilot remains isolated from classic production score and has an honest accessibility escape',()=>{
 const html=read('./prison-3d.html'),app=read('./prison-3d-app.js');
 assert.match(html,/Version actuelle/);
 assert.match(html,/Version d’essai non reliée au score du plateau/);
 assert.match(html,/viewport-fit=cover/);
 assert.match(html,/@media\(max-width:600px\)/);
 assert.match(html,/Voir.*plateau|Plateau des Treize Chemins/);
 assert.ok(app.includes('onModelError:err=>'));
 assert.ok(app.includes('const model=await graphic.modelPromise'));
 assert.ok(html.includes('jeu-yoyo.html'));
 assert.ok(!app.includes("localStorage.setItem("));
});
