import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=name=>fs.readFileSync(new URL(name,import.meta.url),'utf8');
test('The published game loads V16 with all same-origin media included in the public build',()=>{
 const html=read('jeu-stoppub.html'),build=read('build-public.mjs');
 assert.match(html, /name="game-version" content="16"/);
 assert.match(html,/href="jeu.html#chemin-iv"/);
 assert.doesNotMatch(html,/futurs-jeux\.js/);
 const ctx={window:{}};vm.runInNewContext(read('assets/stoppub/assets-v16.js'),ctx);
 for(const key of ['introVideoURL','introPosterURL','funkLoopURL','metroLoopURL']){
  const path=ctx.window.GAME_ASSETS[key];
  assert.match(path,/^assets\/stoppub\/[a-z-]+v16\.(mp4|mp3|jpg)$/);
  assert.ok(fs.statSync(new URL(path,import.meta.url)).size>10000);
  assert.ok(build.includes("'"+path+"'"));
 }
 for(const path of [...html.matchAll(/<script src="(assets\/stoppub\/[^"?]+)"/g)].map(m=>m[1])){
  assert.ok(fs.existsSync(new URL(path,import.meta.url)));assert.ok(build.includes("'"+path+"'"));
 }
 assert.match(html,/Funkorama/);assert.match(html,/CC BY 4\.0/);
});
test('Only internal ready pages and registered modules are presented as available',()=>{
 const ctx={};vm.runInNewContext(read('chemins-en-cours-core.js'),ctx);
 const core=ctx.TreizeUpcomingCore;
 assert.equal(core.isAvailable({game:{status:'ready',url:'jeu-stoppub.html'}}),true);
 for(const url of ['https://other.test/game.html','../jeu-stoppub.html','javascript:alert(1)'])
  assert.equal(core.isAvailable({game:{status:'ready',url}}),false);
 assert.equal(core.isAvailable({game:{status:'preparation',url:'jeu-frontiere.html'}}),false);
});
