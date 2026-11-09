import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url));
const code=read('./prison-3d-prototype-app.js').toString('utf8');
const html=read('./prison-3d-prototype.html').toString('utf8');
const runtime=()=>read('./prison-3d-prototype-runtime.js').toString('utf8');
test('The existing CC0 humanoid is a rigged GLB with the necessary arms and bones',()=>{
 const glb=read('./danse-quaternius-hero.glb');
 assert.equal(glb.toString('ascii',0,4),'glTF','Actual binary model, not a dummy or flat image');
 assert.equal(glb.readUInt32LE(4),2);
 assert.equal(glb.readUInt32LE(8),glb.length);
 const jsonLen=glb.readUInt32LE(12);
 assert.equal(glb.toString('ascii',16,20),'JSON');
 const scene=JSON.parse(glb.toString('utf8',20,20+jsonLen));
 assert.ok(scene.skins?.length>=1,'Skinned body is present');
 const bones=(scene.nodes||[]).map(n=>n.name);
 for(const required of ['upperarm_l','upperarm_r','lowerarm_l','lowerarm_r',
  'thigh_l','thigh_r','calf_l','calf_r','spine_02','Head'])
  assert.ok(bones.includes(required),'Missing 3D anatomical bone '+required);
});
test('The cell is fully 3D with a body, bunk, sink, toilet and functional window props',()=>{
 assert.match(code,/CELL=Object\.freeze\(\{width:3,depth:3,height:2\.72,area:9\}\)/);
 for(const required of ['SolCellule9m2','PorteCellule','Barreau','TableCellule','Tabouret',
  'Armoire','WC','Lavabo','Brosse','SacPlastique','YoYoAuDrap','PrisonnierQuaternius65Os'])
  assert.ok(code.includes(required),'Missing 3D element '+required);
 assert.ok(code.includes('new T.WebGLRenderer'));
 assert.ok(code.includes('new GLTFLoader().loadAsync(PROTOTYPE_ASSETS.actor)'));
 assert.ok(code.includes('o.isSkinnedMesh'));
 assert.ok(code.includes('bend(bones.upperarm_r'), 'The real shoulder rig moves');
 assert.ok(code.includes('bend(bones.lowerarm_r'), 'The real elbow rig moves');
 assert.ok(code.includes('heldBrush=brush(bones.lowerarm_r)'), 'The brush attaches to the skeletal arm');
});
test('The rules and 30-point total are inherited from the original prison game',()=>{
 assert.ok(code.includes("from './yoyo-core.js'"));
 for(const symbol of ['createGame','startGame','continueGame','move','actionDown','actionUp',
   'advance','aligned','ropePosition','setWindowAspect'])
  assert.ok(code.includes(symbol),'Core rules not reused: '+symbol);
 assert.ok(code.includes("OBJECTIVES=Object.freeze(['Saisir la brosse','Récupérer le tabac','Récupérer le café'])"));
 assert.ok(code.includes("scoreText.textContent=game.points+' / 30'"));
 assert.ok(code.includes("mode='caught'"),'Guard can still stop the game');
 assert.ok(!code.includes("parent.postMessage"),'The prototype must never credit real points');
 assert.ok(!code.includes("localStorage."),'The prototype must not replace the current save');
});
test('The preview has six main interactive controls, plus responsive navigation',()=>{
 for(const id of ['world','start','retry','pause','left','right','hide','action',
   'status','stage','score','guard','overlay'])
  assert.ok(html.includes('id="'+id+'"'),'Missing DOM control '+id);
 assert.ok(html.includes('prison-3d-prototype-runtime.js'));
 assert.ok(html.includes('max-width:520px')&&html.includes('min-height:55px'));
 assert.ok(html.includes('href="jeu-yoyo.html"'),'The approved game stays available');
 assert.ok(html.includes('href="jeu.html"'),'The existing plateau stays accessible');
});
test('Independent runtime was built without modifying the official one',()=>{
 assert.ok(existsSync(new URL('./prison-3d-prototype-runtime.js',import.meta.url)));
 const bundle=runtime();
 assert.ok(bundle.length>50000,'Bundled Three.js and gameplay');
 const builder=read('./build-public.mjs').toString('utf8');
 for(const file of ["'prison-3d-prototype.html'","'prison-3d-prototype-runtime.js'",
  "'build-prison-3d-prototype.mjs'","'prison-3d-prototype.test.mjs'"])
  assert.ok(builder.includes(file),'Prototype not included in controlled build: '+file);
 assert.ok(builder.includes("'jeu-yoyo.html'"),'The published game is retained');
});
