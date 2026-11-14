import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
test('The delivered standalone HTML contains executable inline scripts, with no template-substitution corruption',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'danse-preview-'));
 try{
  const dest=path.join(dir,'Le-Danseur.html');const built=spawnSync(process.execPath,['build-danse-preview.mjs',dest],{cwd:import.meta.dirname,encoding:'utf8'});
  assert.equal(built.status,0,built.stderr);
  const html=fs.readFileSync(dest,'utf8'),scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
  assert.equal(scripts.length,3);assert.ok(!html.includes('<!-- RUNTIME -->'));assert.ok(!html.includes('<!-- ASSETS -->'));
  assert.ok(!/<script[^>]+(?:src=|type="module")/.test(html),'no dependency on external scripts or module loading');
  for(const script of scripts){const check=spawnSync(process.execPath,['--check','--input-type=commonjs'],{input:script,encoding:'utf8'});assert.equal(check.status,0,check.stderr.slice(-500));}
  const assets=JSON.parse(scripts[1].slice('window.DANSE_ASSETS='.length));
  for(const file of ['danse-quaternius-hero.glb','assets/danse/quaternius-superhero-female.glb','assets/danse/funky-chunk-loop.mp3','assets/danse/ovation.mp3'])assert.deepEqual(Buffer.from(assets[file].split(',')[1],'base64'),fs.readFileSync(new URL(file,import.meta.url)));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
