import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {biomeAt,drawPixelRunner,drawPixelChase} from './a410-pixel-v2.js';
const read=f=>readFileSync(new URL(f,import.meta.url),'utf8');
function sceneRecorder(){
 const shapes=[],labels=[];
 const ctx={save(){},restore(){},translate(){},scale(){},rotate(){},clearRect(){}};
 const scene={ctx,
  rect(x,y,w,h,color){assert.ok([x,y,w,h].every(Number.isFinite));assert.ok(w>=0&&h>=0);shapes.push({type:'rect',x,y,w,h,color});},
  poly(points,color){assert.ok(points.length>=3);for(const p of points)assert.ok(p.every(Number.isFinite));shapes.push({type:'poly',color});},
  text(label,x,y,size,color){assert.ok([x,y,size].every(Number.isFinite));labels.push(label);}
 };
 return {scene,shapes,labels};
}
test('The route changes gradually from lycée to forest and motorway',()=>{
 const start=biomeAt(0),woods=biomeAt(140),road=biomeAt(290),end=biomeAt(400);
 assert.equal(start.school,1);assert.equal(start.highway,0);
 assert.ok(woods.forest>.5);
 assert.ok(road.highway>.05&&road.highway<1);
 assert.equal(end.highway,1);
 for(let d=0,prev=0;d<=400;d+=10){
  const b=biomeAt(d);assert.ok(b.highway>=prev);prev=b.highway;
 }
});
test('All four stages draw without invalid pixels and with readable landmarks',()=>{
 for(const distance of [0,115,270,400]){
  const {scene,shapes,labels}=sceneRecorder();
  drawPixelChase(scene,{distance,gap:26,speed:17,elapsed:4.1,direction:1,tripRemaining:0,stopRemaining:0},'running',4.1,false);
  assert.ok(shapes.length>100,'rich outdoor scene expected at '+distance);
  if(distance===0)assert.ok(labels.includes('LYCÉE'));
  if(distance===400)assert.ok(labels.includes('A410'));
 }
});
test('Hero and both pursuers have full distinct pixel bodies and expressions',()=>{
 for(const character of ['hero','white','suit']){
  const {scene,shapes}=sceneRecorder();
  drawPixelRunner(scene,190,190,character,1.3,16,{direction:1});
  assert.ok(shapes.length>40,character+' must have detailed silhouette');
  drawPixelRunner(scene,190,190,character,2.5,0,{direction:-1,trip:true});
  if(character==='hero')drawPixelRunner(scene,245,204,character,1.8,0,{victory:true});
 }
});
test('The public arcade uses new pixel rendering but preserves the original chase mechanics',()=>{
 const html=read('./arcade-a410.html'),build=read('./build-public.mjs'),assets=read('./a410-pixel-v2.js');
 assert.ok(html.includes("import {drawPixelRunner, drawPixelChase} from './a410-pixel-v2.js'"));
 assert.ok(html.includes('return drawPixelRunner(this,x,ground,who,time,speed,options)'));
 assert.ok(html.includes('return drawPixelChase(this,run,phase,time,reduced)'));
 assert.ok(html.includes('legacyDraw(')&&html.includes('legacyRunner('));
 assert.ok(html.includes('const FINISH = 400;'));
 assert.ok(html.includes("sendToPlateau('a410:escaped')"));
 assert.ok(html.includes('score+=100'));
 assert.ok(html.includes('VOICE_CLIPS='));
 assert.ok(build.includes("'a410-pixel-v2.js'"));
 assert.ok(build.includes("'a410-pixel-v2.test.mjs'"));
 assert.doesNotMatch(assets,/https?:\/\/|fetch\(|new Image\(/);
});

test('Three different roadside chapter signs stay grouped around the middle of the 400 m chase',()=>{
 const at=d=>{
  const {scene,shapes,labels}=sceneRecorder();
  drawPixelChase(scene,{distance:d,gap:27,speed:17,elapsed:4.1,direction:1,tripRemaining:0,stopRemaining:0},'running',4.1);
  return {panels:shapes.filter(s=>s.type==='rect'&&s.color==='#f2ead7'),labels};
 };
 const opening=at(0),middle=at(205),ending=at(400);
 assert.equal(opening.panels.length,0,'Panneaux absents devant le lycée');
 assert.equal(ending.panels.length,0,'Panneaux passés avant le panneau A410');
 assert.equal(middle.panels.length,3,'Les trois panneaux sont visibles ensemble au milieu');
 assert.deepEqual(middle.panels.map(s=>s.w),[60,72,84],'Trois largeurs différentes');
 assert.deepEqual(middle.panels.map(s=>s.h),[38,46,54],'Trois hauteurs différentes');
 assert.ok(middle.panels.every(s=>s.x>=0&&s.x+s.w<=384),'Aucun panneau coupé au milieu');
 for(let i=1;i<middle.panels.length;i++)
  assert.ok(middle.panels[i].x>middle.panels[i-1].x+middle.panels[i-1].w,'Les panneaux ne se chevauchent pas');
 for(const line of ['Chapitre 1 —','« La salle','d’attente »,','pages 7–9'])
  assert.equal(middle.labels.filter(t=>t===line).length,3,'Chaque panneau reproduit '+line);
 assert.equal(['Chapitre 1 —','« La salle','d’attente »,','pages 7–9'].join(' '),'Chapitre 1 — « La salle d’attente », pages 7–9');
});
