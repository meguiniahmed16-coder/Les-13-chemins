import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,readFile,writeFile,readdir,rm,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildMakehuman} from '../../scripts/build-makehuman.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const source=join(root,'assets-source','makehuman');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
async function fixture(t){
 const directory=await mkdtemp(join(tmpdir(),'salon-makehuman-test-'));
 t.after(()=>rm(directory,{recursive:true,force:true}));
 const fixtureRoot=join(directory,'project'),fixtureSource=join(fixtureRoot,'assets-source','makehuman'),output=join(directory,'site');
 await cp(source,fixtureSource,{recursive:true});
 return {root:fixtureRoot,source:fixtureSource,output};
}
test('publishes exactly the 30 approved meshes and complete public credits',async t=>{
 const directory=await mkdtemp(join(tmpdir(),'salon-makehuman-output-'));t.after(()=>rm(directory,{recursive:true,force:true}));
 const result=await buildMakehuman(root,directory),destination=join(directory,'assets','makehuman');
 const manifest=JSON.parse(await readFile(join(source,'assets.json'),'utf8'));
 assert.equal(result.assets,30);assert.equal(result.files,32);
 assert.deepEqual((await readdir(destination)).sort(),Object.keys(manifest.files).sort());
 for(const[name,[,size,digest]]of Object.entries(manifest.files)){
  const bytes=await readFile(join(destination,name));assert.equal(bytes.length,size,name);assert.equal(hash(bytes),digest,name);
 }
 const credits=JSON.parse(await readFile(join(destination,'credits.json'),'utf8'));
 assert.equal(credits.assets.filter(a=>a.kind==='hair').length,25);assert.equal(credits.assets.filter(a=>a.kind==='beard').length,5);
 assert(credits.assets.some(a=>/AGPL/.test(a.embeddedMhcloNotice)));assert(credits.assets.some(a=>/CC.?by|CC BY/i.test(a.embeddedMhcloNotice)));
});
test('rejects a corrupted fragment before creating public output',async t=>{
 const f=await fixture(t),manifest=JSON.parse(await readFile(join(f.source,'assets.json'),'utf8')),path=join(f.source,manifest.packs[0]),bytes=await readFile(path);
 bytes[73]^=1;await writeFile(path,bytes);
 await assert.rejects(buildMakehuman(f.root,f.output),/empreinte incorrecte/);
 await assert.rejects(access(f.output));
});
test('rejects an unlisted source file before creating public output',async t=>{
 const f=await fixture(t);await writeFile(join(f.source,'unlisted.bin'),'not an admitted resource');
 await assert.rejects(buildMakehuman(f.root,f.output),/inventaire source non fermé/);
 await assert.rejects(access(f.output));
});
test('rejects a changed licence declaration before creating public output',async t=>{
 const f=await fixture(t),path=join(f.source,'assets.json'),manifest=JSON.parse(await readFile(path,'utf8'));
 manifest.assets[0].license='CC-BY-4.0';await writeFile(path,JSON.stringify(manifest));
 await assert.rejects(buildMakehuman(f.root,f.output),/catalogue CC0/);
 await assert.rejects(access(f.output));
});
