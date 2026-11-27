import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { inflateRawSync } from 'node:zlib';
const digest = data => createHash('sha256').update(data).digest('hex');
const zipName = 'Sarajevo-V31-raccord-publication.zip';
const zipHash = 'b021ff73ffd5f498a3482f3e2c23627340c2cd6fca0c61f5795e22b01405421e';
const pageHash = '92c850fd4d9739d57717d075e32c885cf8bdb08e63976d11aa2da2c9227a6df6';
export async function publishSarajevoV31(root, output) {
  const zip = await readFile(join(root, zipName));
  if (digest(zip) !== zipHash) throw Error('Archive Sarajevo V31 différente du pack validé.');
  const manifest = JSON.parse(await readFile(join(root, 'sarajevo-v31/manifest.json'), 'utf8'));
  const expected = new Map([['sarajevo-v31/index.html', { bytes: 761883, sha256: pageHash }]]);
  for (const [name, entry] of Object.entries(manifest.assets)) {
    if (!/^[A-Za-z0-9-]+\.(glb|mp3)$/.test(name)) throw Error('Nom de ressource invalide : '+name);
    expected.set('sarajevo-v31/assets/'+name, entry);
  }
  const found = new Map();
  for (let p=0; p+30 <= zip.length && zip.readUInt32LE(p)===0x04034b50;) {
    const flags=zip.readUInt16LE(p+6), method=zip.readUInt16LE(p+8), size=zip.readUInt32LE(p+18);
    const n=zip.readUInt16LE(p+26), extra=zip.readUInt16LE(p+28), start=p+30+n+extra, end=start+size;
    if (flags!==0 || method!==8 || end>zip.length) throw Error('Format ZIP inattendu');
    const name=zip.subarray(p+30,p+30+n).toString('utf8');
    if (expected.has(name)) {
      if (found.has(name)) throw Error('Ressource dupliquée : '+name);
      const spec=expected.get(name), data=inflateRawSync(zip.subarray(start,end), {maxOutputLength:spec.bytes});
      if (data.length!==spec.bytes || digest(data)!==spec.sha256) throw Error('Ressource altérée : '+name);
      found.set(name,data);
    }
    p=end;
  }
  if (found.size!==expected.size) throw Error('Ressources Sarajevo V31 incomplètes');
  await mkdir(join(output,'sarajevo-v31/assets'), {recursive:true});
  for (const [name,data] of found) await writeFile(join(output,name),data);
  await copyFile(join(root,'sarajevo-v31-wrapper.html'),join(output,'jeu-bosnie.html'));
  await copyFile(join(root,'sarajevo-v31-bridge.js'),join(output,'sarajevo-v31-bridge.js'));
  console.log('Sarajevo V31 : page et '+(found.size-1)+' ressources contrôlées, raccord aux cinématiques conservé.');
}
