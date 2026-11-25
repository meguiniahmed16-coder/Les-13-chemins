import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const nav=source('membres/salon-maison-ui.js');
const salon=source('membres/salon-v27.js');
const css=source('membres/salon-rail52.css');
const contract=source('docs/salon-ergonomie-contract.md');

test('Le Salon démarre avec un seul bouton Menu et cinq fonctions repliées',()=>{
 assert.match(nav,/class="maison-menu-toggle"/);
 assert.match(nav,/aria-expanded="false" aria-controls="maison-dock"/);
 assert.match(nav,/id="maison-dock" aria-label="Fonctions du Salon" hidden/);
 assert.match(nav,/mainDock\.hidden=!menuExpanded/);
 assert.match(nav,/menuToggle\.onclick=\(\)=>setMenuExpanded\(!menuExpanded\)/);
 assert.match(nav,/setMenuExpanded\(false\);/);
 assert.match(nav,/menuExpanded\?'Replier le menu du Salon':'Ouvrir le menu du Salon'/);
 assert.match(nav,/if\(!menuExpanded\)\{/);
 assert.match(nav,/if\(nativeDrawerOpen\(\)\)nativeStudio\.click\(\)/);
 for(const key of ["encounter","avatar","clothes","dialogue","explore"]){
  assert.ok(nav.includes("['"+key+"'"),'Commande absente : '+key);
 }
});

test('La feuille critique est disponible avant les styles distants',()=>{
 const firstStyle=salon.indexOf('<style id="salon-menu-critical">');
 const firstLink=salon.indexOf('<link rel="stylesheet" href="/membres/salon.css');
 assert.ok(firstStyle>=0&&firstLink>firstStyle,'Le style critique doit précéder les CSS du site');
 assert.match(salon,/#maison-dock\[hidden\]/);
 assert.match(salon,/\.maison-menu-toggle\{box-sizing/);
 assert.match(css,/:host \.stage #maison-dock\[hidden\]\{display:none!important/);
 assert.match(css,/:host \.stage #maison-dock:not\(\[hidden\]\)/);
 assert.match(css,/:host \.stage \.maison-menu-toggle/);
});

test('Les deux volets sont encore plus fins et translucides en portrait et paysage',()=>{
 assert.match(css,/width:min\(205px,42%\)!important/);
 assert.match(css,/width:min\(180px,40%\)!important/);
 assert.match(css,/width:min\(232px,29%\)!important/);
 assert.match(css,/width:min\(215px,28%\)!important/);
 assert.match(css,/background:rgba\(249,247,239,\.65\)!important/);
 assert.match(css,/background:rgba\(31,69,53,\.74\)!important/);
 assert.match(contract,/un seul bouton Menu/);
 assert.match(contract,/42 %/);
 assert.match(contract,/translucides/);
});

test('Les modules mis à jour échappent aux anciennes copies Android',()=>{
 assert.match(salon,/salon-maison-ui\.js\?v=call58/);
 assert.match(salon,/salon-rail52\.css\?v=hud56/);
 assert.match(source('membres/member.js'),/salon-v27\.js\?v=call59/);
 assert.match(source('membre.html'),/member\.js\?v=call59/);
});
