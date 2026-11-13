import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx=vm.createContext({});
for(const name of ['chemins-en-cours-data.js','chemins-en-cours-core.js'])vm.runInContext(fs.readFileSync(new URL(name,import.meta.url),'utf8'),ctx);
const data=ctx.TreizeUpcomingData,core=ctx.TreizeUpcomingCore;
test('The two paths contain the six selected chapters, with real placeholder routes',()=>{
 assert.deepEqual(Array.from(data.scenes,s=>s.chapter),[7,8,10,11,12,13]);
 assert.deepEqual(Array.from(data.paths,p=>p.scenes.length),[3,3]);
 const build=fs.readFileSync(new URL('build-public.mjs',import.meta.url),'utf8');
 for(const s of data.scenes){
  assert.equal(core.canLaunch(s),false);assert.equal(s.game.status,'preparation');
  assert.ok(s.paragraphs.join(' ').length>1000);
  assert.ok(fs.existsSync(new URL(s.art.src,import.meta.url)));assert.ok(build.includes("'"+s.art.src+"'"));
  const html=fs.readFileSync(new URL(s.game.url,import.meta.url),'utf8');
  assert.ok(html.includes('data-scene="'+s.id+'"'));assert.ok(html.includes('futurs-jeux.js'));
  assert.ok(build.includes("'"+s.game.url+"'"));
  for(const person of s.people)assert.ok(data.profiles[person]);
 }
 assert.equal(core.scene(data,'missing'),null);
 assert.equal(core.neighbours(data,'missing').next,null);
 assert.equal(core.neighbours(data,'stoppub').previous,null);
 assert.equal(core.neighbours(data,'peguy').next,null);
 assert.equal(core.neighbours(data,'frontiere').next.id,'rire');
});
test('Characters use their names and complete continuities without editorial labels',()=>{
 for(const [id,name,count] of [['abdelouahab','Abdelouahab',5],['fatima','Fatima',6],['lionel','Lionel Le Goff',8],['samer','Samer',8],['fadi','Fadi',8],['cedric','Cédric Aubert',5]]){
  assert.equal(data.profiles[id].name,name);assert.equal(data.profiles[id].paragraphs.length,count);
 }
 assert.match(data.profiles.fatima.paragraphs[0],/Tanger/);
 assert.match(data.profiles.abdelouahab.paragraphs[0],/Tighmaret/);
 assert.doesNotMatch(data.profiles.fadi.paragraphs.join(' '),/restaurant|Mahmoud/);
 for(const p of Object.values(data.profiles))assert.doesNotMatch([p.name,p.role,...p.paragraphs].join(' '),/pseudonyme|nom provisoire|voix d’atelier|sélection de l’atelier|personnage de l’adaptation|reste à écrire/i);
});
test('Maps distinguish one place, actual movement, and an unreached destination',()=>{
 assert.equal(data.routes.republique.points.length,1);assert.equal(data.routes.paris.points.length,1);
 assert.equal(data.routes.vaneau.points.length,2);assert.equal(data.routes.vaneau.zoom,18);
 assert.deepEqual(Array.from(data.routes.syrie.points,p=>p[0]),['Istanbul','Gaziantep','Kilis']);
 assert.equal(data.routes.chartres.points.at(-1)[0],'Vallée de Chevreuse');
 assert.match(data.routes.chartres.destination[0],/destination/);
 for(const route of Object.values(data.routes))for(const [,lat,lon] of route.points){assert.ok(lat>=-90&&lat<=90);assert.ok(lon>=-180&&lon<=180);}
});
test('A future room cannot launch accidentally or accept late/duplicate completion',()=>{
 let called=0;const planned=core.session(core.scene(data,'stoppub'),()=>called++);
 assert.equal(planned.start(()=>{throw Error('must not run');},{}),false);
 for(const module of ['https://other.test/game.js','./games/../index.js','./futurs-jeux.js'])assert.equal(core.canLaunch({game:{status:'ready',module}}),false);
 const ready={id:'test',game:{status:'ready',module:'./games/test/index.js'}};
 let finish,pause=0,resume=0,destroy=0;
 const room=core.session(ready,()=>called++);
 assert.equal(room.start(ctx=>{finish=ctx.complete;return {pause(){pause++;},resume(){resume++;},destroy(){destroy++;}}},{}),true);
 room.pause();assert.equal(finish(),false);assert.equal(called,0);
 room.resume();assert.equal(pause,1);assert.equal(resume,1);assert.equal(finish(),true);assert.equal(finish(),false);assert.equal(called,1);
 room.dispose();room.dispose();assert.equal(destroy,1);assert.equal(finish(),false);
 const stale=core.session(ready,()=>called++);let late;stale.start(ctx=>{late=ctx.complete;return{};},{});stale.dispose();assert.equal(late(),false);assert.equal(called,1);
});
test('A broken adapter fails cleanly and preparation does not write historical progress',()=>{
 const room=core.session({id:'test',game:{status:'ready',module:'./games/test/index.js'}});
 assert.throws(()=>room.start(()=>{throw Error('failed');},{}),/failed/);assert.equal(room.state,'failed');room.dispose();
 for(const file of ['chemins-en-cours.js','futurs-jeux.js','chemins-en-cours-core.js']){
  const src=fs.readFileSync(new URL(file,import.meta.url),'utf8');assert.ok(!src.includes('localStorage.setItem'));assert.ok(!src.includes('state.completed'));
 }
});
