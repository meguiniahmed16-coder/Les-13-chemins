import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const nav=readFileSync(new URL('./salon-maison-ui.js',import.meta.url),'utf8');
const salon=readFileSync(new URL('./salon-v27.js',import.meta.url),'utf8');
const build=readFileSync(new URL('../build-public.mjs',import.meta.url),'utf8');

test('Le vieux panneau Maison encombrant n’existe plus dans la navigation',()=>{
 assert.doesNotMatch(nav,/<section class="maison-hub"/);
 assert.doesNotMatch(nav,/Les pièces de la maison/);
 assert.match(nav,/class="maison-rail-panel"/);
 assert.match(nav,/aria-expanded="false"/);
 assert.match(nav,/if\(!panelNode.hidden&&current===id\)\{close\(\);return;\}/);
});

test('Caméra : les sept commandes possèdent une icône, et Profil ne déplace pas le panneau',()=>{
 for(const id of ['body','face','side','back','wideshot','movie','fullscreen']){
   assert.ok(nav.includes("['"+id+"','"+id+"',"), 'Icône absente : '+id);
   assert.match(nav,new RegExp(id+":'"));
 }
 assert.match(nav,/data-maison-action="swap-side"/);
 assert.match(nav,/if\(command==='swap-side'\)/);
 assert.match(nav,/translated=\{body:'Corps',face:'Visage',side:'Profil',back:'Dos'\}/);
});

test('Le module et la feuille de style des icônes sont publiés et mis en cache séparément',()=>{
 assert.match(salon,/salon-maison-ui\.js\?v=call58/);
 assert.match(salon,/salon-rail52\.css\?v=hud56/);
 for(const path of ['membres/salon-maison-ui.js','membres/salon-rail52.css']){
   assert.ok(build.includes("'"+path+"'"));
 }
});
