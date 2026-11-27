// Run from a clean clone, after copying all V31 package files into the repository.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(await readFile('sarajevo-v31/manifest.json','utf8'));
await readFile('sarajevo-v31/index.html');
for(const [name,expected] of Object.entries(manifest.assets)){
  const data=await readFile('sarajevo-v31/assets/'+name);
  if(data.length!==expected.bytes||createHash('sha256').update(data).digest('hex')!==expected.sha256)throw Error('Ressource Sarajevo altérée : '+name);
}
const path='build-public.mjs';let s=await readFile(path,'utf8');
const marker="console.log('Build public : ' + (publicFiles.length + 1) + ' fichiers vérifiés dans dist/.');";
const update=`// Sarajevo V31: preserve the existing board URL and original cinema controller.
await run(process.execPath,['--test','sarajevo-v31-bridge.test.cjs'],{cwd:root,maxBuffer:4*1024*1024});
await copyFile(join(root,'sarajevo-v31-wrapper.html'),join(output,'jeu-bosnie.html'));
await copyFile(join(root,'sarajevo-v31-bridge.js'),join(output,'sarajevo-v31-bridge.js'));
await mkdir(join(output,'sarajevo-v31','assets'),{recursive:true});
await copyFile(join(root,'sarajevo-v31','index.html'),join(output,'sarajevo-v31','index.html'));
const v31Manifest=JSON.parse(await readFile(join(root,'sarajevo-v31','manifest.json'),'utf8'));
const {createHash}=await import('node:crypto');
for(const [name,expected] of Object.entries(v31Manifest.assets)){
  if(!/^[A-Za-z0-9-]+\\.(glb|mp3)$/.test(name))throw Error('Ressource Sarajevo invalide');
  const asset=await readFile(join(root,'sarajevo-v31','assets',name));
  if(asset.length!==expected.bytes||createHash('sha256').update(asset).digest('hex')!==expected.sha256)throw Error('Ressource Sarajevo altérée : '+name);
  await writeFile(join(output,'sarajevo-v31','assets',name),asset);
}
`;
if(s.includes('// Sarajevo V31: preserve')){console.log('Raccord déjà appliqué');process.exit(0);}
if(s.split(marker).length!==2)throw Error('Build modifié : insertion automatique annulée');
s=s.replace(marker,update+marker);await writeFile(path,s);console.log('Raccord Sarajevo V31 ajouté au build.');
