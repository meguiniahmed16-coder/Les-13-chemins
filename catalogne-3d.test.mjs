import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PARK,CLIENTS,PATROLS,newRun,advance,sell,dodge,nearestClient,instruction,distance,SALE_DIALOGUES,POLICE_SHOUTS,saleDialogue} from './catalogne-3d-core.js';
const read=p=>readFileSync(new URL('./'+p,import.meta.url),'utf8');
test('Cinq clients uniques, trois chemins, et possibilité de vendre sans orientation imposée',()=>{
 assert.equal(CLIENTS.length,5);assert.equal(new Set(CLIENTS.map(c=>c.id)).size,5);
 assert.equal(PATROLS.length,2);assert.equal(PARK.walkWidth,10);
 const run=newRun();run.phase='running';run.facing=Math.PI; // tourne le dos : la vente doit quand même marcher
 for(const c of CLIENTS){
  run.x=c.x;run.z=c.z;
  assert.equal(nearestClient(run).client.id,c.id);
  const result=sell(run);
  assert.equal(result.client.id,c.id);assert.equal(result.points,2);
  assert.ok(run.sold.includes(c.id));
 }
 assert.equal(run.phase,'won');
 assert.equal(run.sold.length,5);
 assert.equal(run.events.filter(e=>e.type==='sale').length,5);
 assert.equal(run.events.filter(e=>e.type==='won').length,1);
});
test('Rouge toujours utilisable : client proche, vente instantanée, pas de condition de face',()=>{
 const run=newRun();run.phase='running';
 assert.equal(sell(run).reason,'far');
 const client=CLIENTS[0];run.x=client.x+3.25;run.z=client.z;
 assert.ok(nearestClient(run),'Le client s active dans un rayon de plusieurs mètres');
 assert.equal(sell(run).client.id,client.id);
 assert.equal(sell(run).reason,'far','On ne peut plus revendre au même client');
 const restored=newRun(['c1','c1','intrus','c2']);
 assert.deepEqual(restored.sold,['c1','c2']);
});
test('Joystick avant/arrière et latéral : progression libre dans le parc',()=>{
 const run=newRun();run.phase='running';
 const start=run.z;
 for(let i=0;i<20;i++)advance(run,.08,{x:0,z:1});
 assert.ok(run.z>start+7);
 const forward=run.z;
 for(let i=0;i<10;i++)advance(run,.08,{x:0,z:-1});
 assert.ok(run.z<forward);
 const oldX=run.x;
 for(let i=0;i<10;i++)advance(run,.08,{x:-1,z:0});
 assert.ok(run.x<oldX);
 assert.ok(Math.abs(run.x)<=PARK.walkWidth);
});
test('Deux policiers patrouillent, poursuivent et esquive possible',()=>{
 const run=newRun();run.phase='running';run.x=0;run.z=0;
 for(let i=0;i<35;i++)advance(run,.08,{x:0,z:0});
 assert.equal(run.phase,'running');
 assert.equal(run.police.length,2);
 assert.notEqual(run.police[0].z,PATROLS[0].homeZ);
 assert.equal(dodge(run),true);
 assert.equal(dodge(run),false,'L esquive a un temps de recharge');
 const started=run.z;advance(run,.08,{x:0,z:1});
 assert.ok(run.z-started>.08*7);
 const cop=run.police[0];run.x=cop.x;run.z=cop.z;
 advance(run,.08,{x:0,z:0});
 assert.equal(run.phase,'running','L esquive protège momentanément de l interpellation');
 run.dodgeTime=0;
 advance(run,.08,{x:0,z:0});
 assert.equal(run.phase,'caught');
});
test('Les messages brefs guident sans recouvrir le parc',()=>{
 const run=newRun();assert.equal(instruction(run).text,'Trouve cinq clients');
 run.phase='running';assert.equal(instruction(run).text,'Repère un client ◆');
 run.x=CLIENTS[0].x;run.z=CLIENTS[0].z;
 assert.equal(instruction(run).text,'Rouge : Vendre');
 run.phase='caught';assert.match(instruction(run).text,/Interpellé/);
});
test('Scène 3D : modèles Kenney, parc libre, clients et policiers propres',()=>{
 const app=read('catalogne-3d-app.js'),html=read('arcade-catalogne-3d.html');
 for(const marker of [
  "new T.WebGLRenderer","new GLTFLoader","cloneSkinned","function lakeAndMonuments",
  "function woodedPark","function makeBirds","function pathways","function makePark",
  "function makeActor","function createCharacters","function updateActors",
  "function makeSale","function bind","function frame"
 ])assert.ok(app.includes(marker),marker);
 assert.ok(app.includes("role==='police'"));
 assert.ok(app.includes("'POLICIA'"));
 assert.ok(app.includes('const near=nearestClient(run)'));
 assert.ok(!app.includes("face au client"));
 assert.ok(!app.includes("Math.sign(c.x-run.x)"));
 assert.ok(html.includes('id="sell"')&&html.includes('id="dodge"')&&html.includes('id="stick"'));
 assert.ok(!html.includes('Maintenir pour avancer'));
});
test('Scène 3D : vente confiée au plateau, confirmation sans double comptage',()=>{
 const app=read('catalogne-3d-app.js'),html=read('arcade-catalogne-3d.html');
 for(const key of ["catalogne:ready","catalogne:init","catalogne:sale","catalogne:credited","catalogne:close"])
  assert.ok(app.includes(key),key);
 assert.ok(app.includes('if(pendingSale)'));
 assert.ok(app.includes('result.client.id'));
 assert.ok(app.includes('m.finished'));
 assert.ok(app.includes("m.sold.filter"));
 assert.ok(html.includes('catalogne-3d-runtime.js?v=barcelone3d-v2'));
 assert.ok(html.includes('id="saleDialogue"'));
 assert.ok(app.includes("MODEL_PATHS"));
});
test('Préserver le jeu 2D original et vérifier le raccord au plateau',()=>{
 const base=read('arcade-catalogne.html'),page=read('jeu.html'),build=read('build-public.mjs');
 assert.ok(base.includes('function nearbyClient(r)'));
 assert.ok(base.includes('const WORLD=1960'));
 assert.ok(page.includes("iframe.src='arcade-catalogne-3d.html?embedded=1&v=barcelone3d-v2'"));
 assert.ok(build.includes("'arcade-catalogne.html'"));
 assert.ok(build.includes("'arcade-catalogne-3d.html'"));
 assert.ok(build.includes("'catalogne-3d-runtime.js'"));
 assert.ok(build.includes("['--test', 'catalogne-3d.test.mjs']"));
});

test('Commandes gauche et droite corrigées par rapport à la caméra 3D',()=>{
 const app=read('catalogne-3d-app.js');
 assert.ok(app.includes('return {x:-clamp(joy.x+right-left,-1,1)'));
 assert.ok(app.includes('dx=(e.clientX-r.left-r.width/2)'));
 assert.ok(app.includes('joy.x=clamp(dx/length,-1,1)'));
 const run=newRun();run.phase='running';
 const initial=run.x;advance(run,.08,{x:-1,z:0});assert.ok(run.x<initial,'Vers la droite écran : x monde négatif');
 const x=run.x;advance(run,.08,{x:1,z:0});assert.ok(run.x>x,'Vers la gauche écran : x monde positif');
});
test('Plus de bâtiments ni banderole au parc : arbres, bancs, oiseaux et groupes mobiles',()=>{
 const js=read('catalogne-3d-app.js');
 assert.ok(!js.includes('backgroundBuildings('));
 assert.ok(!js.includes('sign(\'PARC DE LA CIUTADELLA\''));
 assert.ok(!js.includes('PLAÇA CATALUNYA'));
 assert.ok(!js.includes('Terrasse avec auvent'));
 assert.ok(js.includes('const total=156'));
 assert.ok(js.includes('woodedPark(root)'));
 assert.ok(js.includes('const shrubCount=95'));
 assert.ok(js.includes('birds=makeBirds(root)'));
 assert.ok(js.includes('for(let i=0;i<12;i++)'));
 assert.ok(js.includes('v.wingL.rotation.z=flap'));
 assert.ok(js.includes('const gatherings=['));
 assert.ok(js.includes('member:true'));
 assert.ok(js.includes('member:false'));
 assert.ok(js.includes('if(i%3!==0)bench(root,x,z,side)'));
});
test('Dialogues des cinq ventes : alternance client puis vendeur',()=>{
 const expected={
  c1:['C’est combien ?','20.'],
  c2:['C’est du bon ?','C’est de la frappe.'],
  c3:['C’est trop cher.','C’est le prix.'],
  c4:['Dépêche-toi, il y a des flics !','T’inquiète.'],
  c5:['Il t’en reste ?','Oui, tiens.']
 };
 assert.equal(Object.keys(SALE_DIALOGUES).length,5);
 for(const client of CLIENTS){
  const lines=saleDialogue(client.id);
  assert.ok(lines,'La vente doit déclencher un dialogue propre au client');
  assert.deepEqual(lines.map(item=>item.text),expected[client.id]);
  assert.deepEqual(lines.map(item=>item.speaker),['client','vendeur']);
 }
 const app=read('catalogne-3d-app.js'),html=read('arcade-catalogne-3d.html');
 assert.ok(app.includes('startSaleConversation(result.client.id)'));
 assert.ok(app.includes("const index=Math.floor(elapsed/1.8)"));
 assert.ok(app.includes("line.speaker==='client'?'CLIENT':'VENDEUR'"));
 assert.ok(app.includes('updateSaleConversation(t)'));
 assert.ok(app.includes('if(saleConversation){winPending=true;renderHUD();return;}'));
 assert.ok(app.includes('if(winPending){winPending=false;presentWin();}'));
 assert.ok(html.includes('id="saleDialogue"'));
 assert.ok(html.includes('Son ON'));
});
test('Policiers : interpellations et injures en espagnol maintenues',()=>{
 assert.deepEqual(POLICE_SHOUTS,['¡Gilipollas!','¡Vuelve aquí!']);
 const app=read('catalogne-3d-app.js');
 assert.ok(app.includes('const line=POLICE_SHOUTS['));
 assert.ok(app.includes("sayLine(line,'es-ES')"));
 assert.ok(app.includes('if(!saleConversation)'));
});
