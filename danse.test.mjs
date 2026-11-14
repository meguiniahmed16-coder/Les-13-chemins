import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {PRACTICE,SEQUENCES,createRun,start,beginRound,press,advance,togglePause,WINDOW} from './danse-core.js';
const context=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('./danse-score.js',import.meta.url),'utf8'),context);const score=context.DanseScore;
function playRound(r,hits=8){const times=r.notes.map(n=>n.at);for(let i=0;i<times.length;i++){advance(r,times[i]-r.time);if(i<hits)assert.equal(press(r,r.notes[i].action),true);}advance(r,1.1);}
test('Tutorial waits for the correct modern control and needs no rhythm',()=>{const r=createRun();start(r);advance(r,500);assert.equal(r.practice,0);assert.equal(press(r,'circle'),false);for(const a of PRACTICE)press(r,a);assert.equal(r.phase,'countdown');advance(r,2.5);assert.equal(r.phase,'playing');assert.equal(r.round,0);});
test('Five dance sequences yield five distinct two-point milestones and a victory',()=>{const r=createRun();beginRound(r);for(let i=0;i<5;i++){playRound(r);assert.equal(r.passed.length,i+1);if(i<4)advance(r,2.5);}assert.equal(r.phase,'won');assert.deepEqual(r.passed,[1,2,3,4,5]);assert.equal(r.events.filter(e=>e.type==='pass').length,5);assert.equal(r.events.filter(e=>e.type==='won').length,1);advance(r,10);assert.equal(r.events.filter(e=>e.type==='won').length,1);});
test('Timing, wrong actions and repeated pressing cannot manufacture a successful round',()=>{const r=createRun();beginRound(r);advance(r,r.notes[0].at-WINDOW-.05);assert.equal(press(r,'left'),false);advance(r,WINDOW+.05);assert.equal(press(r,'right'),false);assert.equal(press(r,'left'),true);assert.equal(press(r,'left'),false);advance(r,20);assert.equal(r.phase,'retry');assert.equal(r.passed.length,0);const spam=createRun();beginRound(spam);for(let i=0;i<5;i++)press(spam,'circle');playRound(spam);assert.equal(spam.phase,'retry');});
test('Six correct moves suffice; five repeat only the current sequence',()=>{const r=createRun([1,2]);beginRound(r);playRound(r,5);assert.equal(r.phase,'retry');assert.deepEqual(r.passed,[1,2]);beginRound(r);playRound(r,6);assert.equal(r.phase,'break');assert.deepEqual(r.passed,[1,2,3]);});
test('Pause freezes clock and input; resume keeps the timing window',()=>{const r=createRun();beginRound(r);advance(r,1);togglePause(r);advance(r,30);assert.equal(r.time,1);assert.equal(press(r,'left'),false);togglePause(r);assert.equal(r.phase,'playing');advance(r,1.3);assert.equal(press(r,'left'),true);});
test('Parent credits once, rejects stale sessions/out-of-order milestones, and replay adds nothing',()=>{const s={points:500};score.begin(s,true,'one');assert.equal(s.dansePending.level,5);assert.equal(score.record(s,'other',1),null);assert.equal(score.record(s,'one',3),null);assert.equal(score.finish(s,'one'),null);for(let i=1;i<=5;i++){assert.equal(score.record(s,'one',i).added,true);assert.equal(score.record(s,'one',i).added,false);}assert.equal(s.points,510);assert.equal(score.finish(s,'one').retryQuestion,false);score.begin(s,true,'two');assert.equal(s.dansePending.replay,true);assert.equal(score.record(s,'two',1),null);assert.equal(score.finish(s,'two').replay,true);assert.equal(s.points,510);});
test('Wrong question answer allows retry after dance; progress survives reload',()=>{let s={points:90};score.begin(s,false,'one');score.record(s,'one',1);s=JSON.parse(JSON.stringify(s));assert.equal(score.begin(s,true,'two').id,'one');for(let i=2;i<=5;i++)score.record(s,'one',i);assert.equal(score.finish(s,'one').retryQuestion,true);assert.equal(s.points,100);assert.equal(s.dansePending,null);});
test('Published excerpt includes the complete evening through the dance, with correct pages',()=>{const data=JSON.parse(fs.readFileSync(new URL('./passages.json',import.meta.url),'utf8'));const d=data[4];assert.equal(d.level,5);assert.deepEqual(d.pages,[54,56]);assert.match(d.quote,/chemise violette électrique/);assert.match(d.quote,/Alors je danse/);assert.match(d.quote,/Soixante-dix pour cent du public/);const reading=fs.readFileSync(new URL('./lecture.html',import.meta.url),'utf8');assert.match(reading,/TreizeEtapesData.flatMap/);const publicData=fs.readFileSync(new URL('./dist/etapes-data.js',import.meta.url),'utf8');const embedded=JSON.parse(publicData.slice(publicData.indexOf('=')+1).trim().slice(0,-1));assert.deepEqual(embedded[4].plateaux[0].passage,d);});

test('The Quaternius CC0 female model is real, rigged, small and in the public build',()=>{
 const bytes=fs.readFileSync(new URL('./assets/danse/quaternius-superhero-female.glb',import.meta.url));
 assert.equal(bytes.toString('ascii',0,4),'glTF');
 assert.ok(bytes.length>300000&&bytes.length<2000000,'the playable model should be 0.3–2 MB');
 const length=bytes.readUInt32LE(12);assert.equal(bytes.toString('ascii',16,20),'JSON');
 const data=JSON.parse(bytes.subarray(20,20+length).toString('utf8'));
 assert.ok(data.skins?.[0]?.joints?.length>=60,'must use a complete humanoid rig, not capsule limbs');
 assert.ok(data.meshes?.some(m=>m.name==='Superhero_Female'),'actual female body is missing');
 assert.ok(data.accessors[data.meshes.find(m=>m.name==='Superhero_Female').primitives[0].attributes.POSITION].count>5000,'detailed body surface is missing');
 assert.ok(data.skins[0].joints.some(i=>data.nodes[i].name==='Head'),'head bone for smile is missing');
 const license=fs.readFileSync(new URL('./assets/danse/QUATERNIUS-LICENSE.txt',import.meta.url),'utf8');
 assert.match(license,/CC0-1\.0/);
 assert.match(license,/Quaternius/);
 const build=fs.readFileSync(new URL('./build-public.mjs',import.meta.url),'utf8');
 assert.match(build,/'assets\/danse\/quaternius-superhero-female\.glb'/);
 assert.match(build,/\['build-danse\.mjs'\]/,'stage source must actually be rebuilt for publishing');
});
test('Original Quaternius dancers retain clothing and head-attached expressions',()=>{
 const src=fs.readFileSync(new URL('./danse-scene.js',import.meta.url),'utf8');
 assert.match(src,/import \{GLTFLoader\} from 'three\/examples\/jsm\/loaders\/GLTFLoader\.js'/);
 assert.match(src,/const PILOT_MODEL='assets\/danse\/quaternius-superhero-female\.glb'/);
 assert.ok(src.includes("if(i===0){h.otherDancers=this.dancers;loadPilotDancer(h);}"),'load first female once');
 assert.ok(src.includes("if(h.pilot)animatePilotDancer(h,t,dt,active)"),'animate all female rigs');
 assert.match(src,/target\.group\.children\.forEach\(child=>\{if\(child!==root\)child\.visible=false;\}\)/);
 assert.match(src,/colourPilotActor\(o\)/,'cloth colours must come from the true skinned mesh');
 assert.ok(src.includes("root.updateMatrixWorld(true);head.attach(smile)"),'smile details must follow actual head bone');
 assert.ok(src.includes("paintPilotEyes(o)"),'the original skinned eyes must receive irises');
 assert.ok(src.includes("eyes.userData.irisPainted=true"),'iris state must be available for live inspection');
 assert.ok(src.includes("new T.BufferAttribute(colors,3)"),'the irises must be colored on the real eye mesh');
 assert.ok(!src.includes("new T.TubeGeometry(curve,20,.0029"),'no second large mouth should be drawn');
 assert.ok(src.includes("SourireSculpte"),'tiny corners complement the sculpted lips');
 assert.ok(src.includes('p.danceRig??=prepareDanceRig(p.root)'),'original female rig is retained');
 assert.ok(src.includes('poseDanceRig(p.danceRig,t'),'the same choreography drives each female rig');
 assert.ok(!src.includes("contrast=new T.Color('#e9c996')"),'clothing must not have an exposed-looking beige waist seam');
 assert.match(src,/original dancer retained/,'fallback retains a playable character');
 const build=fs.readFileSync(new URL('./build-public.mjs',import.meta.url),'utf8');
 assert.match(build,/\['--test','danse\.test\.mjs'\]/,'the actual dance tests must run in the public build');
});

test('The playable protagonist is male; four distinct women surround him; afro unchanged',()=>{
 const src=fs.readFileSync(new URL('./danse-scene.js',import.meta.url),'utf8');
 const helper=fs.readFileSync(new URL('./danse-quaternius.js',import.meta.url),'utf8');
 const model=fs.readFileSync(new URL('./danse-quaternius-hero.glb',import.meta.url));
 assert.equal(model.toString('ascii',0,4),'glTF');
 assert.ok(model.length>300000&&model.length<1200000);
 assert.match(helper,/Superhero Male/);
 assert.ok(src.includes("loadQuaterniusDancer(s,this.hero.group.position)"),'the playable protagonist must be a man');
 assert.ok(src.includes("poseQuaterniusDancer(this.featuredDancer"),'player commands must animate the male 3D model');
 assert.ok(src.includes("if(i===0){h.otherDancers=this.dancers;loadPilotDancer(h);}"),'load original afro dancer first');
 assert.ok(src.includes("hairStyle:'afro'"));
 for(const style of ["hairStyle:'long'","hairStyle:'ponytail'","hairStyle:'bob'"])assert.ok(src.includes(style),'missing distinct hairstyle '+style);
 assert.ok(src.includes("if(hairStyle==='long')")&&src.includes("if(hairStyle==='ponytail')")&&src.includes("if(hairStyle==='bob')"));
 assert.ok(src.includes("this.dancers.push(h)"));
 assert.ok(src.includes("this.featuredDancer=null;this.destroyed=false"));
 const build=fs.readFileSync(new URL('./build-public.mjs',import.meta.url),'utf8');
 assert.ok(build.includes("'danse-quaternius-hero.glb'")&&build.includes("'danse-quaternius-LICENSE.txt'"));
});

test('Five background candidates reuse the real 65-bone male model, not cylinder people',()=>{
 const src=fs.readFileSync(new URL('./danse-scene.js',import.meta.url),'utf8');
 assert.match(src,/clone as cloneSkeleton/);
 assert.ok(src.includes('function upgradeCandidatePanel(scene,candidates,source)'));
 assert.ok(src.includes('cloneSkeleton(source.root)'), 'same 3D body as playable male, reused in memory');
 assert.ok(src.includes('upgradeCandidatePanel(s,this.candidates,avatar)'));
 assert.ok(src.includes('for(const name of Object.keys(source.bones))'), 'each candidate preserves 65-bone skeleton');
 assert.ok(src.includes('candidate.group.visible=false'), 'old capsule body hidden only after upgrade');
 assert.ok(src.includes("if(h.quaternius)poseQuaterniusDancer"), 'background bodies follow their original rig');
 assert.ok(src.includes('const CANDIDATE_SHIRTS='));
 assert.ok(src.includes('const CANDIDATE_SKINS='));
 assert.ok(src.includes('const CANDIDATE_HAIR='));
 assert.match(src,/candidates\.map\(\(candidate,i\)=>/);
 assert.ok(src.includes('if(!this.studioCast)upgradeCandidatePanel('), 'keep fallback if upgrade fails');
});

test('All FOUR dance women reuse the skinned female model, without changing the validated afro',()=>{
 const src=fs.readFileSync(new URL('./danse-scene.js',import.meta.url),'utf8');
 assert.ok(src.includes('function upgradeFemaleDancers(dancers,source)'));
 assert.ok(src.includes('const root=cloneSkeleton(source.root)'), 'reuse imported female body, no separate assets');
 assert.ok(src.includes("root.getObjectByName('Superhero_Female')"), 'use real skinned female mesh');
 assert.ok(src.includes('if(bones.size<60)'), 'retain complete original human skeleton');
 assert.ok(src.includes('if(h.pilot)animatePilotDancer(h,t,dt,active)'), 'all four original rigs animate');
 assert.ok(src.includes("hair.name='CoiffureOriginaleQuaternius'"), 'original hair is unchanged, just named');
 assert.ok(src.includes('oldHair.visible=false'), 'hide afro ONLY on the three clones');
 assert.ok(src.includes('dancer.pilot=pilot'), 'replace each simplified dancer');
 for(const style of ['long','ponytail','bob'])assert.ok(src.includes("look.hairStyle==='"+style+"'"));
});

test('Large 4K chapter banner uses literary wording, compact page reference, and neon',()=>{
 const src=fs.readFileSync(new URL('./danse-scene.js',import.meta.url),'utf8');
 assert.ok(src.includes('function chapterBanner(stage)'));
 assert.ok(src.includes('canvas.width=4096;canvas.height=512'));
 assert.ok(src.includes("Chapitre 3 — Le coup du bus"));
 assert.ok(src.includes("'P 54-56'"));
 assert.ok(src.includes("ctx.shadowColor='#5ceadf'"));
 assert.ok(src.includes("chapterBanner(s);"));
 assert.ok(!src.includes("sign(s,'QUI EST LE DANSEUR ?"));
});

test('The 16 TV spectators have independent hair, clothing and unobtrusive reactions',()=>{
 const src=fs.readFileSync(new URL('./danse-scene.js',import.meta.url),'utf8');
 assert.ok(src.includes('const audienceClothes='));
 assert.ok(src.includes('const audienceSkins='));
 assert.ok(src.includes('const audienceHair='));
 assert.ok(src.includes('for(let row=0;row<2;row++)for(let i=0;i<8;i++)'));
 assert.ok(src.includes('this.public.push({group:g,head,arms,reaction:index%4,phase:index*.79})'));
 assert.ok(src.includes("if(hairStyle!==4)"));
 assert.ok(src.includes("const clap=active&&p.reaction===0"));
 assert.ok(src.includes("cheer=active&&p.reaction===1"));
 assert.ok(src.includes('p.head.rotation.y='));
 assert.ok(src.includes('chapterBanner(s)'), 'do not alter the literary banner');
 assert.ok(src.includes('upgradeFemaleDancers(dancers,source)'), 'keep the four real female bodies');
});

test('The 3 foreground audience silhouettes use the existing rigged Quaternius body',()=>{
 const src=fs.readFileSync(new URL('./danse-scene.js',import.meta.url),'utf8');
 assert.ok(src.includes('const FOREGROUND_AUDIENCE_SLOTS=Object.freeze([3,4,5])'));
 assert.ok(src.includes('function upgradeForegroundAudience(publicRows,source)'));
 assert.ok(src.includes('cloneSkeleton(source.root)'), 'real rigged body is reused');
 assert.ok(src.includes('if(!this.studioCast)upgradeForegroundAudience(this.public,avatar);'));
 assert.ok(src.includes("root.name='PublicPremierPlan3D'+(i+1)"));
 assert.ok(src.includes('spectator.realBody=pilot'));
 assert.ok(src.includes('if(child!==root)child.visible=false'), 'old silhouettes must be hidden');
 assert.ok(src.includes('if(p.realBody){'), 'the new body must be animated');
 assert.ok(src.includes('poseQuaterniusSpectator(p.realBody,t,p.phase)'), 'quiet spectating animation, not dancing');
 assert.ok(src.includes('const FOREGROUND_AUDIENCE_SLOTS=Object.freeze([3,4,5])'), 'change exactly three foreground viewers');
 assert.ok(src.includes('this.public.push({group:g,head,arms,reaction:index%4,phase:index*.79})'), 'other spectators remain intact');
});

test('The three foreground spectators have calm arms, never the hero dance pose',()=>{
 const scene=fs.readFileSync(new URL('./danse-scene.js',import.meta.url),'utf8');
 const module=fs.readFileSync(new URL('./danse-quaternius.js',import.meta.url),'utf8');
 assert.ok(scene.includes('poseQuaterniusSpectator(p.realBody,t,p.phase)'));
 assert.ok(!scene.includes("poseQuaterniusDancer(p.realBody"), 'do not apply player choreography to spectators');
 assert.ok(module.includes('export function poseQuaterniusSpectator('));
 assert.ok(module.includes("worldBend(bones.upperarm_l,Z,1.40"));
 assert.ok(module.includes("worldBend(bones.upperarm_r,Z,-1.40"));
 assert.ok(module.includes('worldBend(bones.Head,Z,.025*nod)'));
 assert.ok(module.includes("root.position.copy(basePosition)"), 'stay in place');
});
