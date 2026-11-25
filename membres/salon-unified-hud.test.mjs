import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NATIVE_HUD_ACTIONS} from './salon-hud-native.js';

const get=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const room=get('membres/v27/salon.html');
const source=get('membres/v27/scene.js');
const nativeCSS=get('membres/v27/unified-hud.css');
const hud=get('membres/salon-maison-ui.js');
const bridge=get('membres/salon-hud-native.js');
const outer=get('membres/salon-v27.js');
const build=get('build-public.mjs');

test('Le HUD unique conserve les accès de chaque fonction native',()=>{
  assert.ok(NATIVE_HUD_ACTIONS.length>=25);
  const seen=new Set();
  for(const action of NATIVE_HUD_ACTIONS){
    assert.ok(['encounter','explore','dialogue'].includes(action.zone),action.label);
    assert.ok(action.label&&action.icon,action.selector);
    assert.ok(!seen.has(action.selector),'Fonction référencée deux fois : '+action.selector);
    seen.add(action.selector);
    if(action.selector.startsWith('#')){
      const id=action.selector.split(/[\s[]/)[0].slice(1);
      assert.ok(room.includes('id="'+id+'"'),'Bouton absent du moteur 3D : '+id);
    }
  }
  for(const id of ['#shelves','#angelMode','#talk','#fullscreen','#helpButton','#recenter',
                   '#lookHome','#return','#pin','#ocre','#rise','#flightFace','#beat','#descent',
                   '#tricks','#openBooks','#cameraPad']){
    assert.ok(id==='#cameraPad'||seen.has(id),'Fonction manquante : '+id);
  }
});

test('Les deux anciennes barres sont remplacées uniquement après le raccordement du moteur',()=>{
  assert.match(nativeCSS,/body\.unified-hud \.top,body\.unified-hud \.bottom\{display:none!important\}/);
  assert.match(bridge,/doc\.body\.classList\.add\('unified-hud'\)/);
  assert.match(bridge,/source\.click\(\)/);
  assert.match(outer,/this\.#nav\?\.linkScene\(doc,this\.#scene\)/);
  assert.match(outer,/this\.#nav\?\.dispose\(\)/);
  assert.match(hud,/data-native-zone="encounter"/);
  assert.match(hud,/data-native-zone="explore"/);
  assert.match(hud,/data-native-zone="dialogue"/);
});

test('Le corps reste cadré dans la partie libre du téléphone',()=>{
  assert.match(source,/setHudOcclusion\(/);
  assert.match(source,/cam\.setViewOffset\(/);
  assert.match(source,/cam\.clearViewOffset\(/);
  assert.match(bridge,/hud-panel-left/);
  assert.match(bridge,/hud-panel-right/);
  assert.match(nativeCSS,/--hud-panel-width/);
  assert.match(nativeCSS,/body\.unified-hud\.editing-duo #pad/);
});

test('Le mode portrait et paysage recharge bien les nouveaux modules et conserve les anciens contrôles',()=>{
  assert.match(outer,/\/membres\/v27\/salon\.html\?v=call58/);
  assert.match(room,/\/membres\/v27\/salon-runtime\.js\?v=call58/);
  const rt=get('membres/v27/salon-runtime.js');
  assert.match(rt,/scene-bundle\.js\?v=call58/);
  assert.match(outer,/salon-maison-ui\.js\?v=call60/);
  assert.match(outer,/salon-rail52\.css\?v=hud56/);
  for(const p of ['membres/salon-hud-native.js','membres/v27/unified-hud.css']){
    assert.ok(build.includes("'"+p+"'"),'Fichier absent du site publié : '+p);
  }
  assert.match(outer,/\.studio-rail'\)\.prepend\(preview\)/);
});
