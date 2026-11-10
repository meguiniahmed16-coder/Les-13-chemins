import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('./jeu-rencontre.html', import.meta.url), 'utf8');
const controller = readFileSync(new URL('./rendezvous-plateau.js', import.meta.url), 'utf8');
const build = readFileSync(new URL('./build-public.mjs', import.meta.url), 'utf8');

test('The 15 chapter 6 film shots are in their agreed order', () => {
  const shotLines = [...html.matchAll(/^\s*\['([CB]\d{2})','[^']+','[^']+\.mp4'\],?$/gm)];
  const keys = shotLines.map(x => x[1]);
  assert.deepEqual(keys, [...Array.from({length:8},(_,i)=>'C'+String(i+1).padStart(2,'0')),
                         ...Array.from({length:7},(_,i)=>'B'+String(i+1).padStart(2,'0'))]);
  for (const path of ['01-cuisine/04-il-lui-caresse-la-joue.mp4',
                      '01-cuisine/05-elle-lui-caresse-la-joue.mp4',
                      '01-cuisine/06-il-lui-caresse-les-cheveux.mp4',
                      '01-cuisine/07-elle-lui-caresse-les-cheveux.mp4',
                      '02-chambre/07-tour-eiffel.mp4']) {
    assert.ok(html.includes(path),path);
  }
});

test('Cheek precedes hair, hair precedes kiss, drink precedes complicity and intimacy', () => {
  const bundles=[...html.matchAll(/clips:\[([^\]]+)\]/g)].map(x=>[...x[1].matchAll(/'([CB]\d{2})'/g)].map(y=>y[1]));
  assert.deepEqual(bundles,[
    ['C01','C02','C03'],['C04','C05'],['C06','C07'],['C08'],
    ['B01','B02'],['B03'],['B04','B05','B06'],['B07']
  ]);
  assert.ok(html.includes('Pas maintenant'));
  assert.ok(html.includes('state.watched'));
  assert.ok(html.includes('state.step=Math.min'));
  assert.ok(html.includes("const KEY='tda-rencontre-storyboard-v1'"),'separate storage');
  assert.equal((html.match(/^ [CBA]\d{2}:HIGGS_CDN\+'hf_[^']+\.mp4'/gm)||[]).length,21,'21 generated videos must be attached');
  assert.ok(!html.includes('C01:HIGGS_CDN')&&!html.includes('B07:HIGGS_CDN'),'Do not invent unavailable videos');
});

test('Prototype is wired to the third chapter without altering other games', () => {
  assert.match(controller,/activePart===3\?openRencontreDialog\(\)/);
  assert.match(controller,/rencontreFrame\.src='jeu-rencontre.html\?embedded=1'/);
  assert.match(controller,/openCyranoDialog/);
  assert.match(controller,/manifestationDialog/);
  assert.ok(build.includes("'jeu-rencontre.html'"),'public build includes file');
  assert.ok(html.includes('https://d2ol7oe51mr4n9.cloudfront.net/'),'references are anchored');
  assert.ok(html.includes('.embedded .site-nav{display:none!important}'),'no nested navigation');
});

test('Inline scripts are valid JavaScript', () => {
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.ok(scripts.length>=2);
  scripts.forEach((m,i)=>assert.doesNotThrow(()=>new Script(m[1],{filename:'jeu-rencontre-'+i+'.js'})));
});


test('Every Pas maintenant plays a unique optional sequence without advancing the story', () => {
  const alternatives=[...html.matchAll(/^\s*\["A(0[1-8])","[^"]+","[^"]+\.mp4","[^"]+"\],?$/gm)];
  assert.equal(alternatives.length,8,'There are eight alternative scenes');
  const stepRefs=[...html.matchAll(/alt:'(A0[1-8])'/g)].map(x=>x[1]);
  assert.deepEqual(stepRefs,Array.from({length:8},(_,i)=>'A'+String(i+1).padStart(2,'0')));
  assert.ok(html.includes("beginScene([step.alt],'pause')"));
  assert.ok(html.includes("if(mode==='sequence')state.step=Math.min"), 'Pauses do not advance the chapter');
  assert.ok(html.includes("mode==='sequence'||mode==='pause'"), 'All seen clips are saved');
  assert.ok(html.includes("id=\"pauseClips\""), 'Alternate clips remain replayable');
});

test('Felicity starts only when the boy lifts his head, jazz starts in the mansard room', () => {
  assert.ok(html.includes("id==='C01'||id==='A01')return null"), 'First shot silent');
  assert.ok(html.includes("if(id.startsWith('B')"),'B scenes map to room soundtrack');
  assert.ok(html.includes("'Felicity — Scott Buckley'"));
  assert.ok(html.includes("'Night on the Docks - Sax — Kevin MacLeod'"));
  assert.ok(html.includes("soundtrackForCurrentShot(shot[0])"),'Audio follows the active shot');
  assert.ok(html.includes("id=\"toggleMusic\""),'Player can mute the music');
  assert.match(html,/Felicity[^<]*<\/a>, sous licence/, 'Attribution presented');
  assert.match(html,/Night on the Docks - Sax[^<]*<\/a>, sous licence/, 'Jazz attribution presented');
  assert.ok(html.includes("const MEDIA={"),'Video registry is present');
  assert.ok(html.includes('Felicity commence')&&html.includes("'C02'"),'The start of the music is C02');
});

test('Cinématiques Higgsfield réelles, relecture enchaînée et vraies scènes alternatives', () => {
 const refs=[...html.matchAll(/^ (C0[2-8]|B0[1-6]|A0[1-8]):HIGGS_CDN\+'(hf_[^']+\.mp4)'/gm)];
 assert.equal(refs.length,21);
 assert.equal(new Set(refs.map(m=>m[1])).size,21);
 assert.equal(new Set(refs.map(m=>m[2])).size,21);
 assert.ok(html.includes('player.onended=()=>'), 'The player must complete each clip');
 assert.ok(html.includes('nextMovie();},850)'), 'The validated clips must chain into one film');
 assert.ok(html.includes("if(finished==='sequence')state.step=Math.min"), 'Pauses do not move the story forward');
 assert.ok(html.includes('La fenêtre sur Paris'), 'Literary final tableau when B07 has no video');
 assert.ok(html.includes('Le silence de la cuisine'), 'Still intro when C01 has no video');
 assert.ok(html.includes("type:'rencontre:state'"), 'The shared board receives progress');
 assert.ok(controller.includes("e.data.type!=='rencontre:state'"), 'Parent verifies iframe origin and event type');
 assert.ok(controller.includes('state.rdvRencontreFinished=true'), 'The third Chemin III chapter is completed');
 assert.ok(!html.includes('Photo du pèlerin'), 'No unrelated artwork is included');
});
