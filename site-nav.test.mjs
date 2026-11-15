import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { injectSharedNavigation } from './site-nav-build.mjs';
test('one common menu, Blog and Le dialogue after all three main buttons', () => {
  const source = '<html><head></head><body><nav class="site-nav"><a>Old menu</a></nav><main>Keep this text</main></body></html>';
  const out = injectSharedNavigation(source,'ahmed-marie.html');
  assert.equal((out.match(/<nav /g)||[]).length,1);
  assert.match(out, /⌂ Accueil[\s\S]*🧭 Cartes[\s\S]*🎲 Jeux[\s\S]*class="site-blog-link" aria-current="page">✎ Blog[\s\S]*class="site-dialogue-link">↔ Le dialogue/);
  assert.match(out, /<main>Keep this text<\/main>/);
  assert.equal(injectSharedNavigation(out,'ahmed-marie.html'),out);
});
test('Blog, Le dialogue and Soutenir share the second row on desktop and mobile',()=>{
  const css=readFileSync(new URL('./site-nav.css',import.meta.url),'utf8');
  assert.match(css,/grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
  assert.match(css,/\.site-blog-link\{grid-column:1 \/ 3/);
  assert.match(css,/\.site-dialogue-link\{grid-column:3 \/ 5/);
});
test('redirects and embedded game layouts keep their behavior',()=>{
  const redirect='<html><head><meta http-equiv="refresh" content="0;url=jeu.html"></head></html>';
  assert.equal(injectSharedNavigation(redirect,'lecture.html'),redirect);
  const game='<html><head></head><body><canvas></canvas></body></html>';
  assert.doesNotMatch(injectSharedNavigation(game,'jeu-yoyo.html'),/<nav/);
  assert.match(injectSharedNavigation(game,'jeu-yoyo.html'),/site-visits.js/);
});
test('private editor pages do not create visitor events',()=>{
  assert.doesNotMatch(injectSharedNavigation('<html><head></head><body></body></html>','admin.html'),/site-visits.js/);
});

