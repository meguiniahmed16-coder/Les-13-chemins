import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const room=source('membres/v27/salon.html');
const css=source('membres/salon-rail52.css');
const studio=source('membres/salon-v27.js');
const member=source('membres/member.js');
const page=source('membre.html');
const contract=source('docs/salon-ergonomie-contract.md');

test('Le bouton caméra conserve son appareil photo sans libellé visible débordant',()=>{
  const button=room.match(/<button type="button" id="cameraPad"[^>]*>(.*?)<\/button>/);
  assert.ok(button,'Joystick caméra absent');
  assert.match(button[0],/aria-label="Joystick caméra/);
  assert.match(button[1],/<svg\b/);
  assert.doesNotMatch(button[1],/<small>\s*Caméra\s*<\/small>/);
});

test('Le rail des catégories respecte la typographie, le toucher et la transparence validées',()=>{
  assert.match(css,/font:650 8\.7px\/1\.14 system-ui!important/);
  assert.match(css,/overflow-wrap:anywhere!important/);
  assert.match(css,/min-height:48px!important/);
  assert.match(css,/background:rgba\(31,69,53,\.88\)!important/);
  assert.match(css,/background:rgba\(248,246,237,\.80\)!important/);
  assert.match(css,/width:min\(220px,47%\)!important/);
  assert.match(css,/width:min\(195px,46%\)!important/);
  assert.match(css,/grid-template-columns:minmax\(0,1fr\) 36px!important/);
  assert.match(contract,/translucides/);
});

test('Le Salon charge les fichiers actualisés plutôt qu’une ancienne copie mobile',()=>{
  assert.match(studio,/salon-rail52\.css\?v=hud56/);
  assert.match(studio,/salon\.html\?v=call58/);
  assert.match(member,/salon-v27\.js\?v=call60/);
  assert.match(page,/member\.js\?v=call60/);
});
