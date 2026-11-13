import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class Element {
 constructor(tag){this.tag=tag;this.children=[];this.disabled=false;}
 append(...nodes){this.children.push(...nodes);}
 setAttribute(){}
 querySelectorAll(tag){return this.children.flatMap(c=>[...(c.tag===tag?[c]:[]),...c.querySelectorAll(tag)]);}
}
function setup(){
 const stages=JSON.parse(fs.readFileSync(new URL('lieux-etapes.json',import.meta.url)));
 const workshops=JSON.parse(fs.readFileSync(new URL('ateliers-publics.json',import.meta.url)));
 const passages=JSON.parse(fs.readFileSync(new URL('passages.json',import.meta.url)));
 const extra=JSON.parse(fs.readFileSync(new URL('plateaux-data.json',import.meta.url)));
 let opened,fallthrough=0;
 const ctx=vm.createContext({document:{createElement:tag=>new Element(tag)},
  TreizeEscale:{getStage(n,p=1){return p===2?extra.find(s=>s.level===n):{...stages.find(s=>s.level===n),workshops:workshops.filter(p=>p.levels.includes(n)),passage:passages.find(s=>s.level===n)};},openReader(){fallthrough++;}},
  TreizeCheminsEnCours:{openScene(scene,options){opened={scene,options};return opened;}}});
 vm.runInContext(fs.readFileSync(new URL('chemins-en-cours-data.js',import.meta.url),'utf8'),ctx);
 vm.runInContext(fs.readFileSync(new URL('lecteur-chemins.js',import.meta.url),'utf8'),ctx);
 return {ctx,get opened(){return opened;},get fallthrough(){return fallthrough;},passages};
}
test('The playable reader keeps the exact passages and Strasbourg distinct from the dance',()=>{
 const s=setup();
 for(let n=1;n<=5;n++){
  s.ctx.TreizeEscale.openReader(n);
  assert.equal(s.opened.scene.paragraphs.join('\n\n'),s.passages[n-1].quote);
  assert.equal(s.opened.scene.path,n<=3?'I':'II');
  assert.equal(s.opened.scene.playable,true);
 }
 s.ctx.TreizeEscale.openReader(5,{plateau:2});
 assert.equal(s.opened.scene.path,'III');assert.equal(s.opened.scene.title,'La prison');
 assert.equal(s.opened.scene.routeData.points[0][0],'Strasbourg');
 assert.equal(s.opened.scene.art.crop[1],929);
 s.ctx.TreizeEscale.openReader(6);assert.equal(s.fallthrough,1);
});
test('Tabs do not start games; the existing quiz and launch callbacks run at most once',()=>{
 const s=setup();let answers=0,launched=0,closed=0;
 const panel=new Element('section');
 s.ctx.TreizeUnifiedReader.gamePanel({inlineQuiz:{question:'Question',options:['A','B'],correct:1,onAnswer:i=>{assert.equal(i,1);answers++;}},onChallenge:()=>launched++})(panel,{leave:fn=>{closed++;fn();}});
 const buttons=panel.querySelectorAll('button'),launch=buttons.find(b=>b.textContent==='Jouer →');
 assert.equal(launch.disabled,true);launch.onclick();assert.equal(launched,0);
 buttons[1].onclick();buttons[0].onclick();assert.equal(answers,1);assert.equal(launch.disabled,false);
 assert.equal(launched,0,'Answering does not skip the explicit game button');
 launch.onclick();launch.onclick();assert.equal(launched,1);assert.equal(closed,1);
});
test('Skipping delegates to the original skip action without starting or scoring the game',()=>{
 const s=setup();let skipped=0,launched=0;const panel=new Element('section');
 s.ctx.TreizeUnifiedReader.gamePanel({onSkip:()=>skipped++,onChallenge:()=>launched++})(panel,{leave:fn=>fn()});
 const buttons=panel.querySelectorAll('button');buttons[1].onclick();buttons[0].onclick();buttons[1].onclick();
 assert.equal(skipped,1);assert.equal(launched,0);
});
test('Cyrano and the encounter retain their own excerpt and native game callback',()=>{
 const s=setup();
 for(const id of ['manifestation','cyrano','rencontre']){
  let launches=0;const paragraphs=['Passage validé '+id];
  s.ctx.TreizeUnifiedReader.openRendezvous({id,paragraphs,onChallenge:()=>launches++});
  assert.equal(s.opened.scene.paragraphs,paragraphs);
  assert.equal(s.opened.scene.path,id==='manifestation'?'II':'III');
  if(id==='cyrano')assert.equal(s.opened.scene.routeData,undefined,'No invented prison location');
  const panel=new Element('section');s.opened.scene.renderGame(panel,{leave:fn=>fn()});
  assert.equal(launches,0);panel.querySelectorAll('button')[0].onclick();assert.equal(launches,1);
 }
});

test('Every known character opens the same complete continuity in each scene',()=>{
 const s=setup();
 s.ctx.TreizeEscale.openReader(1);
 for(const id of ['fatima','abdelouahab','mustapha','anne-marie','jean-jacques']){
  const canonical=s.ctx.TreizeUpcomingData.profiles[id];
  assert.equal(s.opened.scene.profiles.find(p=>p.name===canonical.name),canonical);
 }
 s.ctx.TreizeEscale.openReader(5,{plateau:2});
 assert.ok(s.opened.scene.profiles.some(p=>p.name==='Nicolas Vial'&&p.paragraphs.length===5));
 s.ctx.TreizeUnifiedReader.openRendezvous({id:'cyrano',paragraphs:[]});
 assert.ok(s.opened.scene.profiles.some(p=>p.name==='Cédric Aubert'&&p.paragraphs.length===5));
 s.ctx.TreizeUnifiedReader.openRendezvous({id:'rencontre',paragraphs:[]});
 for(const name of ['Marianne','Pauline','Élodie','Baptiste','Thibault','Lionel Le Goff'])assert.ok(s.opened.scene.profiles.some(p=>p.name===name&&p.paragraphs.length>1));
 assert.equal(new Set(s.opened.scene.profiles.map(p=>p.name)).size,s.opened.scene.profiles.length);
});
