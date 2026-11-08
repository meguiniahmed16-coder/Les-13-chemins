import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import * as T from 'three';
import {models,ANATOMICAL_GRIPS,PALMAR_FLEXION_SIGN} from './yoyo-models.js';
import {createGame,startGame,move,hide,aimAt,actionDown,actionUp,advance,continueGame,pauseGame,ropePosition,BRUSH,aligned,slitCenters,openingTolerance,betweenBars,setWindowAspect,ropeReachable} from './yoyo-core.js';
const tick=(g,seconds)=>{for(let i=0;i<seconds*60;i++)advance(g,1/60);};
const intoOpening=g=>aimAt(g,slitCenters(g.aspect).reduce((a,b)=>Math.abs(a-g.aim)<Math.abs(b-g.aim)?a:b));
test('Three separate objects are required for 30 points, misses do not award points',()=>{const g=createGame();startGame(g);actionDown(g);assert.equal(g.points,0);tick(g,1);aimAt(g,BRUSH.x);actionDown(g);assert.equal(g.points,10);assert.equal(g.phase,'between');continueGame(g);aimAt(g,ropePosition(g));actionDown(g);assert.ok(g.hooked);intoOpening(g);tick(g,2);actionUp(g);const pulled=g.pull;tick(g,1);assert.equal(g.pull,pulled);actionDown(g);tick(g,4);assert.equal(g.points,20);continueGame(g);aimAt(g,ropePosition(g));actionDown(g);intoOpening(g);tick(g,6);assert.equal(g.phase,'victory');assert.equal(g.points,30);assert.deepEqual(g.events.filter(e=>e.type==='part').map(e=>e.part),[1,2,3]);});
test('The warning is fair, hiding prevents capture and inspection pauses retrieval',()=>{const g=createGame();startGame(g);tick(g,10);assert.equal(g.guard,'approaching');hide(g);tick(g,3.2);assert.equal(g.guard,'watching');assert.equal(g.phase,'playing');move(g,1);tick(g,.8);assert.equal(g.phase,'caught');startGame(g);assert.equal(g.points,0);assert.equal(g.part,0);});
test('Pause freezes guard, rope, score and controls',()=>{const g=createGame();startGame(g);tick(g,2);pauseGame(g);const old=JSON.stringify(g);tick(g,100);move(g,1);actionDown(g);assert.equal(JSON.stringify(g),old);pauseGame(g);tick(g,1);assert.ok(g.time>2);});
test('A retry cannot accumulate points and hiding always drops the action',()=>{const g=createGame();startGame(g);aimAt(g,BRUSH.x);actionDown(g);continueGame(g);aimAt(g,ropePosition(g));actionDown(g);intoOpening(g);tick(g,2);hide(g);assert.equal(g.holding,false);const p=g.pull;tick(g,3);assert.equal(g.pull,p);startGame(g);assert.equal(g.points,0);});
function score(){const c=vm.createContext({TreizeEtapesData:[{level:5,plateaux:[{},{}]}]});vm.runInContext(fs.readFileSync(new URL('./plateaux-core.js',import.meta.url),'utf8'),c);return c.TreizePlateaux;}
test('Old dance progress is preserved without unlocking the next level before Strasbourg',()=>{const api=score(),s={points:510,unlocked:6,completed:[1,2,3,4,5],danseFinished:true};api.migrate(s);assert.equal(s.points,510);assert.equal(s.unlocked,5);assert.deepEqual(s.completed,[1,2,3,4]);assert.equal(api.progress(s,5).index,2);assert.equal(s.quizPassed[5],true);api.migrate(s);assert.equal(s.points,510);});
test('Existing later levels remain accessible; a fresh win is awarded once with session validation',()=>{const api=score(),s={points:600,unlocked:8,completed:[1,2,3,4,5,6,7],danseFinished:true};api.migrate(s);assert.equal(s.unlocked,8);api.beginYoyo(s,'current');assert.equal(api.finishYoyo(s,'stale'),null);assert.equal(api.finishYoyo(s,'current').bonus,30);assert.ok(s.completed.includes(5));assert.equal(s.points,630);assert.equal(api.finishYoyo(s,'current'),null);api.beginYoyo(s,'replay');assert.equal(api.finishYoyo(s,'replay').bonus,0);assert.equal(s.points,630);});
test('The prison game cannot bypass the first board',()=>{const api=score(),s={points:0,unlocked:5,completed:[]};api.migrate(s);assert.equal(api.beginYoyo(s,'bad'),null);assert.equal(api.complete(s,5),false);});

test('The hand targets the brush where it is actually projected, and the caught rope remains in the grip',()=>{const g=createGame();startGame(g);g.brushX=.58;aimAt(g,.58);assert.ok(aligned(g));actionDown(g);assert.equal(g.points,10);continueGame(g);aimAt(g,ropePosition(g));actionDown(g);const caught=ropePosition(g);actionUp(g);tick(g,2);assert.equal(ropePosition(g),caught);assert.equal(g.pull,0);actionDown(g);intoOpening(g);tick(g,6);assert.equal(g.points,20);});

test('Each posed hand is one connected skin surface and the right cup grip is not reversed',async()=>{
 const {handData}=await import('./yoyo-hands-data.js');
 for(const [name,data]of Object.entries(handData)){
  const bytes=Buffer.from(data.i,'base64'),index=new Uint16Array(bytes.buffer,bytes.byteOffset,bytes.length/2);
  const parent=Array.from({length:data.vertices},(_,i)=>i);
  const root=v=>{while(parent[v]!==v){parent[v]=parent[parent[v]];v=parent[v];}return v;};
  for(let i=0;i<index.length;i+=3){for(let n=0;n<3;n++)assert.ok(index[i+n]<data.vertices);parent[root(index[i+1])]=root(index[i]);parent[root(index[i+2])]=root(index[i]);}
  assert.equal(new Set(parent.map((_,i)=>root(i))).size,1,name+' has no detached finger or wrist');assert.equal(data.nails.length,5);
 }
 assert.ok(handData.cup.nails[4].tip[2]>0,'thumb lies on the near side of the cup');
 assert.ok(handData.cup.nails.slice(0,4).every(n=>n.tip[2]<0),'four fingers curl around the far side');
});


function segmentLength(points){return points.slice(1).reduce((d,p,i)=>d+Math.hypot(...p.map((v,k)=>v-points[i][k])),0);}
function closestSegmentDistance(point,points){
 let closest=Infinity;
 for(let i=0;i<points.length-1;i++){
  const a=new T.Vector3(...points[i]),b=new T.Vector3(...points[i+1]),p=new T.Vector3(...point);
  const ab=b.clone().sub(a),t=T.MathUtils.clamp(p.sub(a).dot(ab)/ab.lengthSq(),0,1);
  closest=Math.min(closest,a.addScaledVector(ab,t).distanceTo(new T.Vector3(...point)));
 }
 return closest;
}
test('Cup fingers keep anatomical lengths, separate joints, and never cross the ceramic wall',async()=>{
 const {handData}=await import('./yoyo-hands-data.js');
 const digits=handData.cup.digits;
 assert.equal(digits.length,5);
 // The old grip made the fingers about 12 cm long to reach across the whole cup.
 for(let i=0;i<4;i++){
  const length=segmentLength(digits[i].points);
  assert.ok(length>.055 && length<.09,'cup finger '+i+' must be a plausible, non-duplicated length: '+length);
  for(let j=0;j<digits[i].points.length-1;j++){
   for(let n=0;n<=10;n++){
    const a=digits[i].points[j],b=digits[i].points[j+1],q=a.map((v,k)=>v+(b[k]-v)*n/10);
    const radius=Math.hypot(q[0],q[2]);
    const ceramic=q[1]<=-.046?.034:q[1]<=.091?.034+(.044-.034)*(q[1]+.046)/.137:.046;
    assert.ok(radius-ceramic>digits[i].radius*.82,'finger '+i+' intersects cup at segment '+j);
   }
  }
 }
 // A raised thumb opposes all four fingers rather than merging with the cup.
 const thumb=digits[4].points;
 assert.ok(thumb[2][2]>.06,'thumb knuckle must visibly stand proud of the cup');
 assert.ok(thumb.at(-1)[2]>.054 && digits.slice(0,4).every(d=>d.points.at(-1)[2]<-.04));
});

test('Smoking gesture presents the palm and pinches cigarette between extended fingers',async()=>{
 const {handData}=await import('./yoyo-hands-data.js');
 const fingers=handData.smoke.digits;
 const grip=[-.015,.096,-.016];
 for(let i=0;i<2;i++){
  const d=closestSegmentDistance(grip,fingers[i].points);
  assert.ok(d>.011 && d<.018,'cigarette must touch the lateral middle phalanx of finger '+i+', not be glued to its tip: '+d);
  assert.ok(segmentLength(fingers[i].points)>.08,'index and middle fingers must remain full length');
  assert.ok(fingers[i].points.at(-1)[1]>.115,'fingertips must extend beyond the cigarette pinch');
 }
 for(let i=2;i<4;i++){
  const pts=fingers[i].points, segments=pts.slice(1).map((p,j)=>new T.Vector3(...p).sub(new T.Vector3(...pts[j])).normalize());
  for(let j=0;j<segments.length-1;j++)assert.ok(segments[j].angleTo(segments[j+1])<Math.PI*.58,'unnatural abrupt curl at finger '+i);
 }
 const pose=models().smokingHand();
 pose.rotation.set(-.10,-.58,.08); // Actual victory camera orientation.
 pose.updateMatrixWorld(true);
 const skinPivot=pose.children[0],prop=pose.children[1];
 assert.ok(skinPivot.rotation.y>Math.PI*.95,'grip is turned so the actor sees the palm');
 const dorsal=new T.Vector3(0,0,1).transformDirection(skinPivot.matrixWorld);
 assert.ok(dorsal.z<-.7,'back of hand must point away from the first-person viewer');
 const filter=prop.localToWorld(new T.Vector3(0,0,.036));
 const ember=prop.localToWorld(new T.Vector3(0,0,-.054));
 assert.ok(filter.z>ember.z,'filter must face the actor, ember must face away');
 // Rotating the skin must not pull it away from the cigarette.
 const hand=skinPivot.children[0];
 const pinchCenter=hand.localToWorld(new T.Vector3(-.002,.087,-.003));
 const cigarCenter=prop.getWorldPosition(new T.Vector3());
 assert.ok(pinchCenter.distanceTo(cigarCenter)<1e-8,'skin and cigarette share one gripping pivot');
});


test('The held toilet brush uses five anatomical digits wrapped around its real shaft',async()=>{
 const {handData}=await import('./yoyo-hands-data.js');
 const brush=handData.brush, fingers=brush.digits,handle=brush.grip;
 assert.equal(handle.object,'toilet-brush');
 assert.deepEqual(handle.axis,[0,1,0]);
 assert.ok(handle.handleRadius>.012 && handle.handleRadius<.014);
 assert.equal(fingers.length,5,'four fingers and an opposing thumb');
 const lengths=fingers.map(d=>segmentLength(d.points));
 for(const [i,d] of fingers.entries()){
  assert.ok(lengths[i]>.070 && lengths[i]<.095,'finger '+i+' has realistic length '+lengths[i]);
  const joints=d.points.slice(1).map((point,j)=>new T.Vector3(...point).sub(new T.Vector3(...d.points[j])).normalize());
  for(let j=0;j<joints.length-1;j++)
   assert.ok(joints[j].angleTo(joints[j+1])<1.24,'finger '+i+' twists abruptly at joint '+j);
  for(const [j,p] of d.points.entries()){
   const radial=Math.hypot(p[0],p[2]);
   assert.ok(radial>=handle.handleRadius+d.radius*.77-.004,
    'finger '+i+' penetrates the toilet brush shaft at joint '+j);
  }
  const tip=d.points.at(-1),distance=Math.hypot(tip[0],tip[2]);
  const padDistance=distance-handle.handleRadius-d.radius*.77;
  assert.ok(padDistance>-.005 && padDistance<.005,'finger '+i+' must contact handle, not hover or fuse');
  assert.ok(tip[1]>=-.075 && tip[1]<=.045,'finger '+i+' must grip the rubber handle, not the bristles');
 }
 for(let i=0;i<3;i++) {
  assert.ok(fingers[i].points[0][1]-fingers[i+1].points[0][1]>.019,
   'knuckles must be physically separated');
  assert.ok(fingers[i].points.at(-1)[1]>fingers[i+1].points.at(-1)[1],
   'fingers must not cross each other');
 }
 for(let i=0;i<4;i++){
  assert.ok(fingers[i].points[0][0]>.03,'the fingers start at the back of the handle');
  assert.ok(fingers[i].points.at(-1)[0]<0 && fingers[i].points.at(-1)[2]<0,
    'each finger must actually wrap around the other side of the handle');
 }
 assert.ok(fingers[4].points.at(-1)[2]>0,
  'thumb pulp must oppose the four fingers on the FRONT of the handle');
 // The game pose must include the actual brush at its unshifted geometric origin.
 const held=models().heldBrush(),item=held.children.at(-1);
 assert.equal(item.type,'Group');
 assert.ok(item.position.length()<1e-9,'the brush must remain centred in the hand pose');
 assert.equal(brush.nails.length,5);
});

test('The OPEN hand shown during stage 1 search has five naturally curved, complete fingers',async()=>{
 // Regression from user screenshot: "1 / 3 · Trouver la brosse", BEFORE pickup.
 // The previous patches accidentally changed heldBrush instead of this openHand.
 const scene=fs.readFileSync(new URL('./yoyo-scene.js',import.meta.url),'utf8');
 assert.match(scene,/const searching=props\.openHand\(\)/,
  'stage 1 searching model must be explicitly identified before any repair');
 assert.match(scene,/searching\.visible=!g\.hidden&&pick<\.42/,
  'openHand is the visible hand prior to taking the brush');
 const {handData}=await import('./yoyo-hands-data.js');
 const skin=handData.open, digits=skin.digits;
 assert.equal(digits.length,5,'index, middle, ring, little, thumb');
 assert.equal(skin.nails.length,5,'all five complete fingertips exist');
 const bounds=[[.078,.092],[.088,.105],[.078,.098],[.066,.088],[.070,.095]];
 for(let i=0;i<5;i++){
  const points=digits[i].points;
  assert.equal(points.length,5,'four connected, visible phalanx control segments per digit');
  const length=segmentLength(points);
  assert.ok(length>bounds[i][0]&&length<bounds[i][1],
   'finger '+i+' has improbable full length: '+length);
  const bones=points.slice(1).map((p,j)=>new T.Vector3(...p).sub(new T.Vector3(...points[j])).normalize());
  for(let j=0;j<bones.length-1;j++)
   assert.ok(bones[j].angleTo(bones[j+1])<.90,
    'finger '+i+' reverses/twists sharply at segment '+j);
  for(let j=1;j<points.length;j++)
   assert.ok(points[j][1]>points[j-1][1],
    'finger '+i+' is folded backwards in the camera view');
 }
 const tipX=digits.slice(0,4).map(d=>d.points.at(-1)[0]);
 for(let i=1;i<tipX.length;i++)
  assert.ok(tipX[i]-tipX[i-1]>.014,
   'open-hand fingertips must stay separate without crossing');
 assert.ok(digits[1].points.at(-1)[1]>digits[0].points.at(-1)[1],
  'middle finger is longer than index');
 assert.ok(digits[3].points.at(-1)[1]<digits[2].points.at(-1)[1],
  'little finger is shorter than ring');
 const thumb=digits[4].points;
 for(let i=1;i<thumb.length;i++)
  assert.ok(thumb[i][0]<thumb[i-1][0],'thumb points outward, never curls back into a hook');
 assert.ok(thumb.at(-1)[2]>.009,'thumb sits in visible relief from the palm');
 const hand=models().openHand();
 assert.ok(hand.children.some(c=>c.type==='Mesh'),'real first-person open hand mesh exists');
});

test('Stage 1 uses an anatomical skinned hand asset, not four tubes joined to a primitive palm',()=>{
 const binary=fs.readFileSync(new URL('./hand-right.glb',import.meta.url));
 assert.equal(binary.toString('ascii',0,4),'glTF','locally served asset must be a real glTF binary');
 const jsonSize=binary.readUInt32LE(12);
 assert.equal(binary.toString('ascii',16,20),'JSON');
 const gltf=JSON.parse(binary.subarray(20,20+jsonSize).toString('utf8'));
 assert.ok(gltf.meshes.length>=1,'hand asset must have a real polygon mesh');
 const pos=gltf.meshes[0].primitives[0].attributes.POSITION;
 assert.ok(gltf.accessors[pos].count>1000,'hand must have detailed geometry across fingers, thumb and palm');
 assert.equal(gltf.skins[0].joints.length,25,'WebXR real hand should have 25 articulated joints');
 const ids=gltf.skins[0].joints.map(i=>gltf.nodes[i].name);
 for(const id of ['wrist','thumb-metacarpal','index-finger-metacarpal','middle-finger-phalanx-proximal','ring-finger-tip','pinky-finger-tip'])
  assert.ok(ids.includes(id),'anatomical skeleton is missing '+id);
 const code=fs.readFileSync(new URL('./yoyo-models.js',import.meta.url),'utf8');
 assert.match(code,/new GLTFLoader\(\)\.loadAsync\('hand-right\.glb'\)/);
 assert.match(code,/p\.userData\.handModel='webxr-anatomical-right'/);
 assert.ok(code.slice(code.indexOf(' function openHand(){'),code.indexOf(' function brush(){')).includes('anatomyGeometry()'),
  'the rendered pre-pickup hand must use the anatomical reference rather than the old capsule pose');
 const hand=models().openHand();
 assert.equal(hand.userData.handModel,'webxr-anatomical-right');
 assert.ok(hand.children.some(c=>c.isGroup),'the anatomical hand has a mounted transform pivot');
 assert.ok(hand.children.some(c=>c.isMesh),'the wrist continues into a visible forearm');
 const builder=fs.readFileSync(new URL('./build-public.mjs',import.meta.url),'utf8');
 assert.match(builder,/['"]hand-right\.glb['"]/,'Netlify must publish the binary asset');
 assert.match(builder,/['"]hand-right-LICENSE\.txt['"]/,'the legal permission must accompany the model');
});

test('A real bag and arm cannot pass through a steel bar, only through a clear gap',()=>{
 const g=createGame();startGame(g);aimAt(g,BRUSH.x);actionDown(g);
 assert.equal(g.points,10);continueGame(g);
 setWindowAspect(g,1.16);const phone=slitCenters(g.aspect),wide=slitCenters(16/9);
 assert.equal(phone.length,4);assert.ok(phone[1]<phone[2]);assert.notDeepEqual(phone,wide);
 assert.ok(openingTolerance(1.16)>openingTolerance(16/9),'mobile opening scales with perspective');
 aimAt(g,ropePosition(g));actionDown(g);
 assert.equal(g.hooked,true);
 const steel=.5; // the middle bar is actually at x=0, normalized x=0.5
 aimAt(g,steel);assert.equal(betweenBars(g),false);
 tick(g,3);assert.equal(g.pull,0,'pull must be blocked by solid steel');
 intoOpening(g);assert.equal(betweenBars(g),true);
 tick(g,2);const started=g.pull;assert.ok(started>.2);
 aimAt(g,.5);tick(g,1);assert.equal(g.pull,started,'the bag freezes at the bar, not through it');
 intoOpening(g);tick(g,5.3);assert.equal(g.points,20);assert.equal(g.bags,1);
 continueGame(g);aimAt(g,ropePosition(g));actionDown(g);intoOpening(g);
 tick(g,5.5);assert.equal(g.points,30);assert.equal(g.bags,2);
});
test('Every gameplay hand now comes from the same anatomical mesh with distinct poses',()=>{
 const src=fs.readFileSync(new URL('./yoyo-models.js',import.meta.url),'utf8');
 for(const pose of ["brush","cup","smoke"])
   assert.match(src,new RegExp("anatomicalHand\\('"+pose+"'\\)"));
 for(const [kind,group] of [
  ['brush',models().heldBrush().children[0]],
  ['cup',models().cupHand().children[0]],
  ['smoke',models().smokingHand().children[0].children[0]]
 ]) {
  assert.equal(group.userData.handModel,'webxr-anatomical-right',kind);
  assert.equal(group.userData.pose,kind);
 }
 const scene=fs.readFileSync(new URL('./yoyo-scene.js',import.meta.url),'utf8');
 assert.match(scene,/props\.anatomicalHand\('relaxed'\)/,'prisoner hands must also share the anatomical model');
});
test('The hand reaches through a gap and the two weighted bags colour the building in stages',()=>{
 const scene=fs.readFileSync(new URL('./yoyo-scene.js',import.meta.url),'utf8');
 assert.match(scene,/const reach=g\.hooked&&betweenBars\(g\)\?\(\.35\*\(1-pull\)/,
 'the arm must advance past the bars during retrieval rather than stay glued to the camera');
 assert.match(fs.readFileSync(new URL('./yoyo-core.js',import.meta.url),'utf8'),/if\(clear\)\{g\.pull=/);
 assert.match(scene,/bagHalf\(1\);bagHalf\(-1\)/,
 'the carrier must be a folded translucent bag, not a solid ellipsoid');
 assert.match(scene,/parcels\[0\]\.visible/);
 assert.match(scene,/recolorWorld\(g\.bags/);
 assert.match(scene,/prisoner\(3\.2,1\.65,4\)/);
 assert.match(scene,/outfits=\[/,'prisoners should wear varied civilian clothes');
});

test('Both deliveries preserve their vivid colours through the win scene, and the hanger turns edge-on',()=>{
 const app=fs.readFileSync(new URL('./yoyo-app.js',import.meta.url),'utf8');
 const scene=fs.readFileSync(new URL('./yoyo-scene.js',import.meta.url),'utf8');
 assert.ok(app.includes('cinema.render(filmTime,mode,g)'),'finale must pass actual delivered bags to renderer');
 assert.match(scene,/ropeGroup\.rotation\.y=g\.hooked\?Math\.sin\(Math\.PI\*pull\)\*Math\.PI\/2/,
  'wide hanger must rotate edge-on to cross the bars');
 assert.match(scene,/recolorWorld\(g\.bags\?\?/);
 assert.match(scene,/bagRoot\.rotation\.z=/,'plastic bag must sway with the weight');
 const src=fs.readFileSync(new URL('./yoyo-core.js',import.meta.url),'utf8');
 assert.match(src,/g\.bags=Math\.max\(0,g\.part-1\)/,
  'finding the brush must not colour the prison');
 const two=createGame();startGame(two);aimAt(two,BRUSH.x);actionDown(two);
 assert.equal(two.bags,0);
 continueGame(two);aimAt(two,ropePosition(two));actionDown(two);intoOpening(two);tick(two,6);
 assert.equal(two.bags,1,'first bag changes building');
 continueGame(two);aimAt(two,ropePosition(two));actionDown(two);intoOpening(two);tick(two,6);
 assert.equal(two.bags,2,'second bag makes the finale saturated');
});

test('The player must wait for the rope to pass a bar opening before hooking',()=>{
 const g=createGame();startGame(g);aimAt(g,BRUSH.x);actionDown(g);continueGame(g);
 tick(g,.26);aimAt(g,ropePosition(g));
 assert.ok(Math.abs(ropePosition(g)-.5)<.015,'rope is presently in front of the central steel bar');
 assert.equal(ropeReachable(g),false);
 actionDown(g);assert.equal(g.hooked,false,'hook cannot pass through steel');
 assert.ok(g.events.some(e=>e.type==='bar-miss'),'player gets an understandable collision cue');
 tick(g,2.08);aimAt(g,ropePosition(g));
 assert.equal(ropeReachable(g),true,'oscillating rope is now crossing an opening');
 actionDown(g);assert.equal(g.hooked,true,'brush may catch rope through a real gap');
});

test('All four fingers fold towards the real PALM of the 25-joint WebXR hand',()=>{
 // This checks the SIGN of each flexion in the asset's native coordinates.
 // Its four fingers extend along -Y; the palmar side is -X, not +X.
 const file=fs.readFileSync(new URL('./hand-right.glb',import.meta.url));
 const jsonSize=file.readUInt32LE(12);
 const gltf=JSON.parse(file.subarray(20,20+jsonSize).toString('utf8'));
 const node=name=>{const j=gltf.nodes.find(n=>n.name===name);assert.ok(j,'missing '+name);return new T.Vector3(...j.translation);};
 assert.equal(PALMAR_FLEXION_SIGN,-1,'positive native Z bends towards the back of the hand');
 const names=['index-finger','middle-finger','ring-finger','pinky-finger'];
 for(const pose of ['relaxed','brush','cup','smoke']){
  const entries=ANATOMICAL_GRIPS[pose];assert.equal(entries.length,5);
  for(let n=0;n<4;n++){
   const finger=names[n],base=node(finger+'-phalanx-proximal'),tip=node(finger+'-tip');
   const angle=PALMAR_FLEXION_SIGN*entries[n+1][0];
   assert.ok(angle<0,'dorsal rather than palmar bend for '+finger+' in '+pose);
   const palmBentTip=tip.clone().sub(base).applyAxisAngle(new T.Vector3(0,0,1),angle).add(base);
   assert.ok(palmBentTip.x<tip.x-.003,
    pose+' '+finger+' bends the fingertip toward the back of the hand');
  }
 }
 // Cigarette must be BETWEEN index and middle in the actual rig's bind pose.
 const pinch=new T.Vector3(-.002,.087,-.003);
 const index=node('index-finger-phalanx-intermediate');
 const middle=node('middle-finger-phalanx-intermediate');
 const xPositions=[index.z*1.05,middle.z*1.05].sort((a,b)=>a-b);
 assert.ok(pinch.x>xPositions[0]&&pinch.x<xPositions[1],
  'cigarette is not between index and middle fingers');
 for(const joint of [index,middle]){
  assert.ok(Math.abs(pinch.y-(-joint.y*1.05-.002))<.025,
   'cigarette must touch the middle phalanges, not the fingertips or thumb');
  assert.ok(Math.abs(pinch.z-(joint.x*1.05-.035))<.018,
   'cigarette is floating away from the fingers');
 }
});

test('Two illustrated static hand states remain visible and light, with no finger animation',()=>{
 const page=fs.readFileSync(new URL('./jeu-yoyo.html',import.meta.url),'utf8');
 const app=fs.readFileSync(new URL('./yoyo-app.js',import.meta.url),'utf8');
 const scene=fs.readFileSync(new URL('./yoyo-scene.js',import.meta.url),'utf8');
 const build=fs.readFileSync(new URL('./build-public.mjs',import.meta.url),'utf8');
 assert.match(page,/Main fixe v9/);
 assert.match(page,/id="handOpen2D"[^>]*main_ouverte_fixee\.webp/);
 assert.match(page,/id="handGrip2D"[^>]*main_brosse_dos_fixee\.webp/);
 assert.match(app,/view==='pickup'&&t>=\.56/);
 assert.match(app,/view==='window'/);
 assert.match(app,/const holding=view==='window'/);
 assert.match(app,/img\.hidden=false/);
 assert.match(app,/state\.hidden/);
 assert.match(app,/hideHandSprites\(\);mode='victory'/);
 assert.match(scene,/const searching=new T\.Group\(\),held=new T\.Group\(\)/);
 assert.doesNotMatch(scene,/searching=props\.openHand\(\),held=props\.heldBrush\(\)/);
 assert.match(scene,/anchors\.head=\{x:g\.hooked\?rx:g\.aim,y:\.46\}/);
 for(const name of ['main_ouverte_fixee.webp','main_brosse_dos_fixee.webp']){
  const bytes=fs.readFileSync(new URL('./'+name,import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF',name+' missing WebP header');
  assert.equal(bytes.toString('ascii',8,12),'WEBP',name+' invalid format');
  assert.ok(bytes.byteLength>9000&&bytes.byteLength<35000,name+' must be lightweight but detailed');
  assert.ok(build.includes("'"+name+"'"),'Netlify deployment missing '+name);
 }
 // Only x positioning and whole-sprite switching: no bones/finger rotations during gameplay.
 const section=app.slice(app.indexOf('function showHandSprite('),app.indexOf('function world('));
 assert.doesNotMatch(section,/(?:finger|phalange|quaternion|\.rotation)/);
 assert.match(section,/img\.style\.left=/);
 assert.match(app,/if\(mode==='intro'\|\|mode==='victory'\)\{hideHandSprites\(\)/);
});
