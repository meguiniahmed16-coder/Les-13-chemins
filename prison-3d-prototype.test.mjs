import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CELL} from './prison-3d-room.js';
const read=p=>readFileSync(new URL(p,import.meta.url));
const code=read('./prison-3d-prototype-app.js').toString('utf8');
const room=read('./prison-3d-room.js').toString('utf8');
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
test('The closed 9m² cell and first-person arms are assembled from the real scene modules',()=>{
 assert.deepEqual(CELL,{width:3,depth:3,height:2.72,area:9});
 for(const required of ['SolCellule9m2','PorteCellule','Barreau','TableCellule','Tabouret',
  'Armoire','WC','Lavabo','Brosse','SacPlastique','YoYoAuDrap','ParoiAvantFermee'])
  assert.ok(room.includes(required),'Missing 3D element '+required);
 assert.ok(code.includes('new T.WebGLRenderer'));
 assert.ok(code.includes('new GLTFLoader().parseAsync(bytes,'));
 for(const module of ['prison-3d-room.js','prison-3d-camera.js','prison-3d-arms.js','prison-3d-controls.js'])
  assert.ok(code.includes(module),'Actual scene module not integrated: '+module);
 assert.ok(code.includes('heldBrush.position.copy(arms.grip)'), 'The brush follows the measured palm');
 assert.ok(code.includes('antialias:true'),'Mobile rendering must retain antialiasing');
});
test('The rules and 30-point total are inherited from the original prison game',()=>{
 assert.ok(code.includes("from './yoyo-core.js'"));
 for(const symbol of ['createGame','startGame','continueGame','aimAt','hide','actionDown','actionUp',
   'advance','aligned','ropePosition','setWindowAspect'])
  assert.ok(code.includes(symbol),'Core rules not reused: '+symbol);
 assert.ok(code.includes("OBJECTIVES=Object.freeze(['Saisir la brosse','Récupérer le tabac','Récupérer le café'])"));
 assert.ok(code.includes("scoreText.textContent=game.points+' / 30'"));
 assert.ok(code.includes("setMode('caught')"),'Guard can still stop the game');
 assert.ok(!code.includes("parent.postMessage"),'The prototype must never credit real points');
 assert.ok(!code.includes("localStorage."),'The prototype must not replace the current save');
});
test('The preview offers a joystick, two hold buttons, an optional tour and fullscreen',()=>{
 for(const id of ['world','start','retry','pause','joystick','joystick-knob','hide','action','skip-tour','fullscreen',
   'status','stage','score','guard','overlay'])
  assert.ok(html.includes('id="'+id+'"'),'Missing DOM control '+id);
 assert.ok(html.includes('prison-3d-prototype-runtime.js'));
 assert.ok(!html.includes('id="left"')&&!html.includes('id="right"'));
 assert.ok(html.includes('100dvh')&&html.includes('safe-area-inset-bottom'));
 assert.ok(html.includes('href="jeu-yoyo.html"'),'The approved game stays available');
 assert.ok(html.includes('href="jeu.html"'),'The existing plateau stays accessible');
});

test('The shipped detailed stool is the licensed self-contained GLB in its provenance receipt',()=>{
 const glb=read('./assets/prison/metal-stool-02.glb');
 const receipt=JSON.parse(read('./assets/prison/metal-stool-02.provenance.json'));
 assert.equal(receipt.license,'CC0-1.0');
 assert.equal(glb.length,receipt.derived_file.bytes);
 assert.equal(createHash('sha256').update(glb).digest('hex'),receipt.derived_file.sha256);
 assert.equal(glb.toString('ascii',0,4),'glTF');
 assert.equal(glb.readUInt32LE(8),glb.length);
 const model=JSON.parse(glb.toString('utf8',20,20+glb.readUInt32LE(12)));
 assert.ok(model.images.length>=3,'Actual colour, normal and material textures');
 assert.ok(model.images.every(image=>Number.isInteger(image.bufferView)&&!image.uri));
 assert.ok(model.buffers.every(buffer=>!buffer.uri),'No fragile third-party asset requests');
 assert.ok(read('./assets/prison/metal-stool-02-LICENSE.txt').toString().includes('CC0'));
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

test('The existing yo-yo offers a direct optional link to the 3D study',()=>{
 const official=read('./jeu-yoyo.html').toString('utf8');
 assert.ok(official.includes('href="prison-3d-prototype.html"'));
 assert.ok(official.includes('Cette préversion ne modifie pas les points'));
 assert.ok(official.includes('yoyo-runtime.js'),'The validated game still loads the original engine');
});
