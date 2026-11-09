import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=(file)=>fs.readFileSync(new URL(file,import.meta.url),'utf8');
const mkStore=s=>{const m=new Map([['tectonique-jeu-plateau-v1',JSON.stringify(s)]]);return{getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};};
const getApi=()=>{const ctx=vm.createContext({});vm.runInContext(read('./ordre-lecture.js'),ctx);return ctx.TreizeOrdre;};

test('Mustapha is the FIRST cartouche in the game, book passage and atlas',()=>{
 const passages=JSON.parse(read('./passages.json')),places=JSON.parse(read('./lieux-etapes.json'));
 const profiles=JSON.parse(read('./ateliers-publics.json'));
 assert.deepEqual(passages.slice(0,3).map(p=>p.scene),[
  'Les Marmousets, le cheval et mon petit frère','Le départ du lycée et le baladeur','Michel, le matériel et les policiers'
 ]);
 assert.deepEqual(places.slice(0,3).map(p=>p.city),['Ferney-Voltaire','La Roche-sur-Foron','Barcelone']);
 for(let i=0;i<13;i++){assert.equal(passages[i].level,i+1);assert.equal(places[i].level,i+1);}
 assert.deepEqual(profiles.find(x=>x.id==='mustapha').levels,[1]);
 assert.deepEqual(profiles.find(x=>x.id==='michel').levels,[3]);
 const game=read('./jeu.html');
 const match=game.match(/const LEVELS=(\[.*?\]);\s*const AVATARS=/s);
 assert.ok(match);
 assert.deepEqual(JSON.parse(match[1]).slice(0,3).map(x=>x.title),['Rester ensemble','Le premier départ','La ville inconnue']);
 const atlas=read('./carte.html');
 assert.ok(atlas.includes('const MISSIONS=[["Rester ensemble"'));
 assert.ok(atlas.includes('"Ferney-Voltaire / Prévessin-Moëns","La Roche-sur-Foron","Barcelone"'));
 assert.ok(atlas.includes('TreizeOrdre.migrate(localStorage'));
 assert.ok(game.includes('window.TreizeOrdre?.migrate(localStorage,KEY)'));
});
test('All three mini-games follow the new stage numbers and correct answers',()=>{
 const game=read('./jeu.html'),marm=game.slice(game.indexOf('<!-- MARMOUSETS START -->'),game.indexOf('<!-- BOSNIE START -->'));
 const lyon=game.slice(game.indexOf('<!-- CATALOGNE START -->'),game.indexOf('<!-- MARMOUSETS START -->'));
 const a410=game.slice(game.indexOf('<!-- CATALOGNE START -->')-6500,game.indexOf('<!-- CATALOGNE START -->'));
 assert.ok(marm.includes('state.selected!==1'));
 assert.ok(marm.includes('LEVELS[0].correct'));
 assert.ok(marm.includes('p.level!==1'));
 assert.ok(marm.includes('state.completed.push(1)'));
 assert.ok(lyon.includes('state.selected!==3'));
 assert.ok(lyon.includes('LEVELS[2].correct'));
 assert.ok(a410.includes('state.selected!==2'));
 assert.ok(a410.includes('LEVELS[1].correct'));
 for(const [file,lev]of [['arcade-marmousets.html',1],['arcade-a410.html',2],['arcade-catalogne.html',3]]){
  assert.ok(read('./'+file).includes('Arcade · niveau '+lev));
 }
 assert.ok(read('./arcade-marmousets.html').includes('lecture.html?niveau=1'));
 assert.ok(read('./arcade-catalogne.html').includes('jeu.html?niveau=3'));
});
test('Migration preserves accumulated points and stage-specific bonuses',()=>{
 const api=getApi();const storage=mkStore({selected:2,unlocked:3,completed:[1,2],points:220,tries:{1:2,3:1},arcadeBonuses:{1:true,2:true},
  arcadePending:{id:'a',level:1},catalognePending:{id:'b',level:2},marmousetsPending:{id:'c',level:3}});
 const state=api.migrate(storage);
 assert.equal(state.orderVersion,2);assert.equal(state.selected,1);assert.equal(state.unlocked,3);
 assert.deepEqual(Array.from(state.completed),[2,3]);assert.equal(state.points,220);
 assert.equal(state.tries[2],2);assert.equal(state.tries[1],1);
 assert.equal(state.arcadeBonuses[2],true);assert.equal(state.arcadeBonuses[3],true);
 assert.equal(state.arcadePending.level,2);assert.equal(state.catalognePending.level,3);assert.equal(state.marmousetsPending.level,1);
 assert.equal(api.migrate(storage).points,220);
 assert.deepEqual(JSON.parse(storage.getItem('tectonique-jeu-plateau-v1')),state);
});
test('New players begin on Mustapha; readers already advanced remain advanced',()=>{
 const api=getApi(),first=api.migrate(mkStore({selected:1,unlocked:1,completed:[],points:0}));
 assert.equal(first.selected,1);assert.equal(first.unlocked,1);
 const veteran=api.migrate(mkStore({selected:6,unlocked:6,completed:[1,2,3,4,5],points:540}));
 assert.equal(veteran.selected,6);assert.equal(veteran.unlocked,6);
 assert.deepEqual(Array.from(veteran.completed),[2,3,1,4,5]);
 assert.equal(veteran.points,540);
});
test('Build ships migration script on every page where reading progress is used',()=>{
 const build=read('./build-public.mjs');
 assert.ok(build.includes("'ordre-lecture.js'"));
 assert.ok(build.includes("'ordre-lecture.test.mjs'"));
 assert.ok(read('./jeu.html').includes('src="ordre-lecture.js"'));
 assert.ok(read('./carte.html').includes('src="ordre-lecture.js"'));
});
