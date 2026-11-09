import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('./',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,root),'utf8');
const art=read('marmousets-art-v2.js');
const seen=[];
class Path2D{constructor(d){assert.equal(typeof d,'string');seen.push(d);}}
const ctx={
 beginPath(){}, ellipse(){}, fill(){},stroke(){},save(){},restore(){},translate(){},scale(){},rotate(){},
 moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},fillRect(){},roundRect(){},
};
const context={Path2D};vm.runInNewContext(art,context);const api=context.MarmousetsArt;
const base={x:470,y:0,facing:1,rear:0,jump:null,steps:18,mount:1,phase:'running',phaseTime:0};
test('Original standalone vector graphics load without third-party assets',()=>{
 assert.equal(api.version,'2.1');assert.equal(typeof api.horse,'function');assert.equal(typeof api.person,'function');
 assert.ok(!/\.png|\.webp|https?:|fetch\(|Image\(/i.test(art));
});
test('Draw 2D adult characters, distinct ages and facing directions',()=>{
 for(const color of ['#b75c4e','#3377a4','#7e6760']){
  for(const child of [true,false])for(const dir of [-1,1])api.person(ctx,280,426,{s:child?.62:1.05,color,walk:3,child,dir,variant:2,flee:true});
 }
 assert.ok(seen.length>70);
});
test('Horse draws in all interactive poses without NaN or invalid SVG paths',()=>{
 const states=[base,{...base,facing:-1},{...base,phase:'ready',mount:0},{...base,phase:'mounting',mount:.42},{...base,rear:.55},{...base,y:110,jump:{t:.5}},{...base,phase:'reunion',phaseTime:2.6},{...base,phase:'won'}];
 for(const s of states)api.horse(ctx,s,6.1,426,api.person.bind(null,ctx));
 for(const path of seen)assert.doesNotMatch(path,/\b(?:NaN|undefined|Infinity)\b/);
});
test('Public page delegates both horse and human art to reusable vector rig',()=>{
 const page=read('arcade-marmousets.html'),build=read('build-public.mjs');
 assert.ok(page.includes('src="marmousets-art-v2.js"'));
 assert.match(page,/person\(x,y,opts=\{\}\)\{return window\.MarmousetsArt\.person/);
 assert.match(page,/horse\(r,t\)\{return window\.MarmousetsArt\.horse/);
 assert.ok(page.includes('variant:ADULTS.indexOf(a)'));
 assert.ok(build.includes("'marmousets-art-v2.js'"));
 assert.ok(build.includes("'marmousets-art.test.mjs'"));
 assert.ok(page.includes('marmousets:won'));
 assert.ok(page.includes("jeu.html?niveau=1"));
});

test('Schoolchild handwriting writes the exact chapter reference in the sky',()=>{
 const page=read('arcade-marmousets.html');
 assert.ok(page.includes('Chapitre 1 — « La salle d’attente », p 17–19.'));
 assert.ok(page.includes('fonts.googleapis.com/css2?family=Schoolbell'));
 assert.ok(page.includes('chapterSky(){'));
 assert.ok(page.includes('this.cloud(1030-cam*.06,130,1.1);this.chapterSky();'));
 assert.ok(page.includes('c.strokeText(caption,0,0)'));
 assert.ok(page.includes("c.fillText(caption,0,0)"));
 assert.ok(page.includes('c.measureText(caption).width<=765'));
});

test('Location strip is at the bottom of the scene, beneath the schoolbook sky caption',()=>{
 const page=read('arcade-marmousets.html');
 assert.ok(page.includes('<span class="scene-label">FERNEY → PRÉVESSIN</span>'));
 assert.match(page,/\.screen \.scene-label\{top:auto;bottom:12px;left:12px\}/);
 assert.match(page,/@media\(max-width:760px\)\{\.screen \.scene-label\{top:auto;bottom:8px;left:8px\}\}/);
 assert.ok(page.includes('this.chapterSky();'));
});

test('Rider silhouette keeps exactly one visible leg in side profile',()=>{
 const horse=art.slice(art.indexOf('function horse('));
 const mounted=horse.slice(horse.indexOf('if(mounted>0)'),horse.indexOf('c.restore();}',horse.indexOf('if(mounted>0)')));
 assert.ok(mounted.includes("M-12 -116Q-2 -115 9 -109"));
 assert.ok(mounted.includes("M15 -77Q21 -81 27 -77"));
 assert.ok(mounted.includes("'#2f536d',INK,2"));
 assert.ok(mounted.includes("'#453832',INK,1.7"));
 assert.ok(!mounted.includes('M-11 -115Q-25 -108 -23 -94L-16 -84'));
 assert.ok(!mounted.includes('M-15 -83L-6 -83M17 -73L28 -73'));
});

test('Two filled legs on foot, only one filled leg and boot when seated',()=>{
 const paths=[];
 class TracedPath2D{constructor(d){this.d=d;}}
 const traceContext={Path2D:TracedPath2D};
 vm.runInNewContext(art,traceContext);
 const riderArt=traceContext.MarmousetsArt;
 const brush={...ctx,fill(path){if(path)paths.push({d:path.d,color:this.fillStyle});}};
 const render=(phase,options={})=>{
  paths.length=0;
  riderArt.horse(brush,{...base,phase,mount:1,phaseTime:0,...options},1.5,426,(x,y,opt)=>riderArt.person(brush,x,y,opt));
  return paths.map(x=>({...x}));
 };
 const feet=x=>x.filter(p=>/^M(?:-13|1) -35Q/.test(p.d));
 const thigh=x=>x.filter(p=>p.d.startsWith('M-12 -116Q-2 -115 9 -109'));
 const boot=x=>x.filter(p=>p.d.startsWith('M15 -77Q21 -81 27 -77'));
 for(const [state,options,standing,horseback] of [
  ['ready',{mount:0},2,0],
  ['mounting',{mount:.21},2,0],
  ['mounting',{mount:.68},0,1],
  ['running',{},0,1],
  ['running',{jump:{t:.5},y:120},0,1],
  ['reunion',{phaseTime:2},4,0],
  ['won',{},4,0]
 ]){
  const fills=render(state,options);
  assert.equal(feet(fills).length,standing,state+' legs on ground');
  assert.equal(thigh(fills).length,horseback,state+' seated legs');
  assert.equal(boot(fills).length,horseback,state+' seated boots');
  if(horseback){
   assert.equal(thigh(fills)[0].color,'#2f536d','trouser is an opaque filled polygon');
   assert.equal(boot(fills)[0].color,'#453832','boot is an opaque filled polygon');
  }
 }
});
