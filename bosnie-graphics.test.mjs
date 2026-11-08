import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('./bosnie-addon-source.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('./jeu-bosnie.html',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('./bosnie-runtime.js',import.meta.url),'utf8');
const build=fs.readFileSync(new URL('./build-public.mjs',import.meta.url),'utf8');

test('Real 3D soldier and unkillable companion are optional visual improvements',()=>{
 assert.match(source,/GLTFLoader/);
 assert.match(source,/cloneSkeleton/);
 assert.match(source,/danse-quaternius-hero\.glb/);
 assert.match(source,/createCompanionState,updateCompanion/);
 assert.match(source,/originalDraw\(run,dt\)/);
 assert.match(source,/originalAnimate\(run,dt\)/);
 assert.match(source,/game\.soldier\.group\.visible=false/);
 assert.match(source,/game\.canvas\.dataset\.bosnieCompanion='quaternius-deux-soldats'/);
 assert.match(source,/oldAlly=game\.buildSoldier\(\)/);
 assert.match(source,/root\.name=variation\?'CompagnonQuaternius':'SoldatJoueurQuaternius'/);
 assert.ok(!source.includes('game.soldier.group.position.copy(current)'), 'ally must never control the player');
});
test('The sky has cloud banks, and the old game remains callable as fallback',()=>{
 assert.match(source,/function createOvercastSky\(game\)/);
 assert.match(source,/name='CielBosnieCouvert'/);
 assert.match(source,/CanvasTexture/);
 assert.match(source,/window\.BosnieAddon=game=>/);
 assert.match(source,/try\{attach\(game\);\}/);
 assert.match(runtime,/Pt=new ha\(Me\("world"\)\),window\.BosnieAddon\?\.\(Pt\)/);
 assert.ok(html.indexOf('src="bosnie-addon.js"')<html.indexOf('src="bosnie-runtime.js"'));
 assert.ok(build.includes("['build-bosnie-addon.mjs']"));
 assert.ok(build.includes("'bosnie-addon.js'"));
 assert.ok(build.includes("['--test', 'bosnie-compagnon.test.mjs', 'bosnie-graphics.test.mjs']"));
});


test('Both soldiers wear recognizable 1990s French NATO field uniforms, not dancer clothing',()=>{
 assert.match(source,/function equipMilitary\(avatar,variation=0\)/);
 assert.match(source,/function fieldCamouflage\(x,y,z,variation\)/);
 assert.match(source,/GiletPareBalles/);
 assert.match(source,/PorteChargeur/);
 assert.match(source,/Rangers/);
 assert.match(source,/PocheCargo/);
 assert.match(source,/SacPatrouille/);
 assert.match(source,/FusilEnBandouliere/);
 assert.match(source,/EcussonOTAN/);
 assert.match(source,/CouvreCasqueCamouflage/);
 assert.match(source,/AncienCasqueBleuSousCouvreCasque/);
 assert.match(source,/equipMilitary\(avatar,variation\)/);
 assert.match(source,/heroUniform:hero\?\.userData\?\.uniform/);
 assert.ok(!source.includes("Simple historically restrained helmet follows"),'old civilian cap must be gone');
});

test('The exact same two military meshes can be inspected at close range',()=>{
 assert.match(source,/export function makeSoldier\(template,variation=0\)/);
 assert.match(source,/export function poseHuman\(avatar,info,clock,mode='player'\)/);
 const workflow=fs.readFileSync(new URL('./.github/workflows/preview-bosnie-compagnon.yml',import.meta.url),'utf8');
 assert.ok(workflow.includes('bosnie-uniform-inspection.html'));
 assert.ok(workflow.includes('bosnie-uniforme-gros-plan.png'));
});

test('Brighter Bosnian ruins and recognizable window shooter keep gameplay intact',()=>{
 const s=fs.readFileSync(new URL('./bosnie-addon-source.js',import.meta.url),'utf8');
 assert.ok(s.includes('function improveBosnianDaylight(game)'));
 assert.ok(s.includes('toneMappingExposure=1.37'));
 assert.ok(s.includes("game.canvas.dataset.bosnieDaylight='plus-clair'"));
 assert.ok(s.includes("name='FacadeGuerreRuines'"));
 assert.ok(s.includes("name='ImpactsBallesFacade'"));
 assert.ok(s.includes("name='GravatsDeRue'"));
 assert.ok(s.includes("function makeWindowShooter(game)"));
 assert.ok(s.includes("name='TireurFenetreJumelles'"));
 assert.ok(s.includes("name='TeteTireur'"));
 assert.ok(s.includes("name='ArmeVisibleTireur'"));
 assert.ok(s.includes("game.shooters.entries()"));
 assert.ok(s.includes('enemy.visible=!!run.binoculars'));
 assert.ok(s.includes('shooterInFrame='));
 assert.ok(s.includes("part(rifle,'CanonVisible'"));
 assert.ok(s.includes("armedHero:!!hero?.root.getObjectByName('CanonVisible')"));
 assert.ok(s.includes("armedAlly:!!ally?.root.getObjectByName('CanonVisible')"));
 assert.ok(s.includes('return originalDraw(run,dt)')===false,'projection must be checked after the actual render');
 const original=fs.readFileSync(new URL('./bosnie-runtime.js',import.meta.url),'utf8');
 assert.ok(original.includes('this.shooters[r]'), 'keep firing positions and camera target');
 const workflow=fs.readFileSync(new URL('./.github/workflows/preview-bosnie-compagnon.yml',import.meta.url),'utf8');
 assert.ok(workflow.includes("page.keyboard.down('b')"),'test the real binocular controls');
 assert.ok(workflow.includes("bosnie-jumelles-tireur.png"),'capture the actual observed window');
});

test('Binoculars zoom close enough to distinguish the window shooter',()=>{
 const runtime=fs.readFileSync(new URL('./bosnie-runtime.js',import.meta.url),'utf8');
 const addon=fs.readFileSync(new URL('./bosnie-addon-source.js',import.meta.url),'utf8');
 assert.ok(runtime.includes('this.camera.fov=is.damp(this.camera.fov,10,7,t)'));
 assert.ok(addon.includes('avatar.group.scale.setScalar(.86)'),'real shooter must be large enough to identify in the window');
 assert.ok(addon.includes("'TIREUR REPÉRÉ À LA FENÊTRE'"));
 assert.ok(addon.includes('new RoundedBoxGeometry(.44,.62,.27,3,.08)'));
 assert.ok(addon.includes('shooterInFrame='));
});

test('The enemy visible through binoculars has the SAME rigged Quaternius body',()=>{
 const s=fs.readFileSync(new URL('./bosnie-addon-source.js',import.meta.url),'utf8');
 assert.ok(s.includes('function upgradeWindowShooter(enemy,template,renderer)'));
 assert.ok(s.includes('const avatar=makeSoldier(template,1)'));
 assert.ok(s.includes("avatar.root.name='TireurFenetreQuaternius'"));
 assert.ok(s.includes("enemy.userData.windowRig=avatar"));
 assert.ok(s.includes("renderer.localClippingEnabled=true"));
 assert.ok(s.includes("material.clone()"),'clipping must affect only this model');
 assert.ok(s.includes("object.visible=object.name==='ArmeVisibleTireur'"),'original body hidden, weapon still visible');
 assert.ok(s.includes("getObjectByName('EcussonOTAN')")===false || s.includes("'EcussonOTAN','DrapeauFrance'"),
  'shooter on the other side must not show NATO/French badge');
 assert.ok(s.includes('shooterRigBones:'));
 assert.ok(s.includes('shooterReal:'));
 const wf=fs.readFileSync(new URL('./.github/workflows/preview-bosnie-compagnon.yml',import.meta.url),'utf8');
 assert.ok(wf.includes("shooterRigBones<60"));
});

test('Shooter uses a dense skinned body and calm guarded arms rather than a T pose',()=>{
 const s=fs.readFileSync(new URL('./bosnie-addon-source.js',import.meta.url),'utf8');
 assert.ok(s.includes("if(obj.isSkinnedMesh&&obj.geometry?.getAttribute('position')?.count>5000)skinnedBody++"));
 assert.ok(s.includes('enemy.userData.windowSkinned=skinnedBody'));
 assert.ok(s.includes("const guarding=mode==='shooter'"));
 assert.ok(s.includes("guarding?-1.24:-1.24"));
 assert.ok(s.includes("guarding?1.24:1.24"));
 assert.ok(s.includes('shooterElbowDrop:'));
 const wf=fs.readFileSync(new URL('./.github/workflows/preview-bosnie-compagnon.yml',import.meta.url),'utf8');
 assert.ok(wf.includes('binocular.shooterSkinned'));
 assert.ok(wf.includes('binocular.shooterElbowDrop'));
});
