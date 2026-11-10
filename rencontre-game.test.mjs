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
  assert.ok(html.includes('const MEDIA={}'),'no fictional videos');
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
