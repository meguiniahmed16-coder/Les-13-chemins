import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { injectSharedNavigation } from './site-nav-build.mjs';
import { activeSection } from './site-nav.js';
test('one common menu gives five clear destinations and preserves the page', () => {
  const source = '<html><head></head><body><nav class="site-nav"><a>Old menu</a></nav><main>Keep this text</main></body></html>';
  const out = injectSharedNavigation(source,'ahmed-marie.html');
  assert.equal((out.match(/<nav /g)||[]).length,1);
  assert.equal((out.match(/data-nav-section=/g)||[]).length,5);
  assert.match(out, /La tectonique des âmes/);
  assert.match(out, /data-nav-section="voyage">Le voyage/);
  assert.match(out, /data-nav-section="blog" aria-current="page">Blog/);
  assert.match(out, /ahmed-marie.html#ahmed-numerique/);
  assert.match(out, /<main>Keep this text<\/main>/);
  assert.equal(injectSharedNavigation(out,'ahmed-marie.html'),out);
});
test('the four main links precede the full-width wood collection link',()=>{
  const css=readFileSync(new URL('./site-nav.css',import.meta.url),'utf8');
  assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css,/site-atelier-link\{grid-column:1 \/ -1/);
  const menu=injectSharedNavigation('<html><head></head><body></body></html>', 'index.html');
  assert.match(menu,/Soutenir<\/a><a [^>]*data-nav-section="atelier">L’odeur du bois<\/a><\/div>/);
  assert.match(css,/min-height:46px/);
});
test('current section distinguishes the blog from its conversation anchor',()=>{
  assert.equal(activeSection('/ahmed-marie.html','#blog'),'blog');
  assert.equal(activeSection('/ahmed-marie','#ahmed-numerique'),'digital');
  assert.equal(activeSection('/ahmed-marie.html','#conversationSection'),'digital');
  assert.equal(activeSection('/dialogues.html'),'blog');
  assert.equal(activeSection('/carte.html'),'voyage');
  assert.equal(activeSection('/jeu'),'voyage');
  assert.equal(activeSection('/l-odeur-du-bois.html'),'atelier');
  assert.match(injectSharedNavigation('<html><head></head><body></body></html>', 'l-odeur-du-bois.html'), /data-nav-section="atelier" aria-current="page">L’odeur du bois/);
  assert.equal(activeSection('/soutien'),'support');
  assert.equal(activeSection('/'),'');
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

