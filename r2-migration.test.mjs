import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const catalog=JSON.parse(read('./migration/r2-videos-manifest.json'));
const html=read('./jeu-rencontre.html');

test('22 vidéos réellement attachées au jeu, sans C02 solitaire ni B07',()=>{
  assert.equal(catalog.version,1);
  assert.equal(catalog.items.length,22);
  assert.equal(new Set(catalog.items.map(x=>x.id)).size,22);
  assert.equal(new Set(catalog.items.map(x=>x.objectKey)).size,22);
  assert.ok(!catalog.items.some(x=>['C02','B07'].includes(x.id)));
});
test('destination R2 stable et source CDN identique au lecteur',()=>{
  const cdn=html.match(/const HIGGS_CDN='([^']+)'/)[1];
  const references=[...html.matchAll(/^\s*(C\d{2}|B\d{2}(?:bis)?|A\d{2}):HIGGS_CDN\+'([^']+\.mp4)'/gm)];
  assert.equal(references.length,22);
  const expected=new Map(references.map(x=>[x[1],cdn+x[2]]));
  for(const item of catalog.items){
    assert.equal(item.sourceUrl,expected.get(item.id),item.id);
    assert.ok(item.objectKey.startsWith('rencontre/'));
    assert.ok(item.objectKey.endsWith('.mp4'));
    assert.ok(!item.objectKey.includes('..'));
  }
});
