import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalizeSource,pageURL} from './site-origin-build.mjs';
import {navigation} from './site-nav-build.mjs';
test('navigation and canonical metadata always use the principal HTTPS domain',()=>{
 const out=canonicalizeSource('<html><head><link rel="canonical" href="https://old.invalid"><meta property="og:url" content="old"></head><body><a href="https://tectonique-des-ames.netlify.app/carte.html?x=1#map">Carte</a><script src="https://media.example.net/file.js"></script></body></html>','carte.html');
 assert.equal((out.match(/rel="canonical"/g)||[]).length,1);
 assert.match(out,/href="https:\/\/tectonique-des-ames.com\/carte.html\?x=1#map"/);
 assert.match(out,/src="https:\/\/media.example.net\/file.js"/);
 assert.equal(canonicalizeSource(out,'carte.html'),out);
 assert.equal(pageURL('index.html'),'https://tectonique-des-ames.com/');
 const menu=navigation('jeu.html');
 const hrefs=[...menu.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(hrefs.length,7);
 assert.ok(hrefs.every(h=>new URL(h).origin==='https://tectonique-des-ames.com'));
 assert.match(menu,/aria-current="page">🎲 Jeux/);
});
