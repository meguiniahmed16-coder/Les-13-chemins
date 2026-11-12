import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get=name=>readFileSync(new URL('./'+name,import.meta.url),'utf8');
const bd=get('jeu-cyrano-bd.html'),journey=get('rendezvous-plateau.js');
test('Cyrano est le deuxième des trois jeux du Chemin III, après Drapeau rouge',()=>{
 const map=get('chapitre1-plateau.js');
 assert.match(map,/chapter:4,title:'Le drapeau rouge',scene:'Strasbourg · La prison'/);
 assert.match(map,/chapter:5,title:'Passe-muraille',scene:'Cyrano/);
 assert.match(journey,/if\(n===2&&!prisonTraversed\(\)\)return/);
 assert.match(journey,/function openCyranoDialog\(\)/);
 assert.match(journey,/jeu-cyrano-bd\.html\?embedded=1/);
 assert.match(journey,/activePart===2\?openCyranoDialog/);
});
test('Les 20 paragraphes de Cyrano, issus de la V17, sont lisibles avant le jeu',()=>{
 assert.match(journey,/const cyranoExtract=\[/);
 assert.match(journey,/Cédric Aubert, mon voisin d’isolement/);
 assert.match(journey,/Je les écris\. Cédric les recopie/);
 assert.match(journey,/Un trou\. Dans le mur/);
 assert.match(journey,/putExcerpt\(cyranoExtract\);excerpt\.hidden=false/);
 assert.match(journey,/reachedReadingEnd\(\)/);
 assert.match(journey,/activePart===2\?openCyranoDialog:openDialog/);
});
test('Le jeu présente une vraie BD photoréaliste en 8 vignettes et 14 répliques',()=>{
 assert.match(bd,/background-image:url\(data:image\/webp;base64,/);
 assert.match(bd,/camera\('wall',650\)/);
 assert.match(bd,/Math\.min\(1\.95/);
 assert.match(bd,/function typewriter\(scene\)/);
 assert.match(bd,/const P=\[/);
 assert.match(bd,/const SCENES=\[/);
 assert.match(bd,/— Est-ce que toi, tu te sens de faire le boulot \?/);
 assert.match(bd,/— Un trou\. Dans le mur\./);
});
test('Trois lettres et 30 points, une seule attribution par étape et session',()=>{
 assert.match(bd,/const MISSIONS=\[/);
 assert.match(bd,/Cinq mots imposés/);
 assert.match(bd,/Mots imposés manquants/);
 assert.match(bd,/if\(list\.length<65\)/);
 assert.match(bd,/parentEvent\('cyrano:progress',\{step:letterIndex\+1\}\)/);
 assert.match(bd,/parentEvent\('cyrano:won'\)/);
 assert.match(journey,/e\.origin!==location\.origin\|\|e\.source!==cyranoFrame\.contentWindow/);
 assert.match(journey,/m\.id!==state\.rdvCyranoPending\?\.id/);
 assert.match(journey,/if\(step!==passed\.length\+1\)return/);
 assert.match(journey,/state\.points\+=10/);
 assert.match(journey,/cyranoAwarded\(\)\.length!==3/);
});
test('Le défi est accessible sur mobile, rejouable et sans perte des autres jeux',()=>{
 const builder=get('build-public.mjs'),page=get('jeu.html');
 assert.match(builder,/'jeu-cyrano-bd\.html'/);
 assert.match(builder,/'jeu-manifestation\.html'/);
 assert.match(builder,/'arcade-catalogne-3d\.html'/);
 assert.match(bd,/viewport-fit=cover/);
 assert.match(bd,/@media\(max-width:580px\)/);
 assert.match(bd,/id="exitCyrano"/);
 assert.match(journey,/function nextCyrano\(\)/);
 assert.match(journey,/rdvCyranoSkipped=true/);
 assert.match(page,/rendezvous-plateau\.js\?v=[^"\\s]+/,'Le navigateur recharge le bon contrôleur Cyrano');
});
