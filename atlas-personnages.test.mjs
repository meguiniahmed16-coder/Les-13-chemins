import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = file => fs.readFileSync(new URL(file,import.meta.url),'utf8');
const {people,cities,chapters} = JSON.parse(read('atlas-repertoire.json'));
const portraits = JSON.parse(read('atlas-continuites.json'));
const byId = new Map(people.map(p=>[p.id,p]));
const cityIds = new Set(cities.map(c=>c.id));
const context = {window:{},document:{readyState:'loading',addEventListener(){}}};
vm.runInNewContext(read('atlas-personnages.js'),context);
const {cast,games} = context.window.TreizeAtlasPersonnages;

test('Les 400 numéros ouvrent un portrait complet et au moins un lieu ou une scène sans commune',()=>{
 assert.equal(people.length,400);assert.equal(Object.keys(portraits).length,400);
 assert.equal(byId.size,400);assert.equal(cityIds.size,cities.length);
 for(let n=1;n<=400;n++){
  const p=byId.get(n);assert.ok(p.name&&p.role&&portraits[n]?.length>=2);
  assert.ok(p.places.length&&p.places.every(s=>cityIds.has(s.city)&&s.pages));
  assert.ok(p.links.every(link=>byId.has(link.id)));
 }
 const onlyUnlocated=people.filter(p=>p.places.every(s=>s.city==='sans-commune'));
 assert.equal(onlyUnlocated.length,11);assert.equal(cities.find(c=>c.id==='sans-commune').coords,null);
 assert.equal(Object.keys(chapters).length,39);
 assert.equal(new Set(Object.values(chapters).flat()).size,400);
});

test('Le Christophe du lac Bleu se retrouve à Mimizan et conserve son propre portrait',()=>{
 const p=byId.get(81);assert.equal(p.name,'Christophe');
 assert.ok(['ble','mimizan'].every(c=>p.places.some(s=>s.city===c)));
 assert.ok(people.some(other=>other.name===p.name&&other.id!==p.id));
 assert.match(portraits[p.id].join(' '),/saucisse/i);
});

test('Les distributions et les compléments de chapitre référencent les mêmes fiches',()=>{
 for(const [key,[scene,chapter]] of Object.entries(games)){
  assert.ok(read('build-public.mjs').includes("'"+key+".html'"),key);
  assert.ok(cast[scene].every(id=>byId.has(id)));
  const rest=chapters[chapter].filter(id=>!cast[scene].includes(id));
  const all=new Set([...cast[scene],...rest]);
  assert.ok(chapters[chapter].every(id=>all.has(id)));
 }
 assert.ok(cast.stoppub.includes(203)&&cast.stoppub.includes(267));
 assert.ok(chapters[7].includes(108)&&!cast.stoppub.includes(108));
});
