import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';

export async function buildSalonAssets(root,output) {
  const source=join(root,'assets-source','salon-v27'),destination=join(output,'assets','salon-v27');
  const {packs,files}=JSON.parse(await readFile(join(source,'assets.json'),'utf8'));
  const archive=Buffer.concat(await Promise.all(packs.map(name=>readFile(join(source,name)))));
  await mkdir(destination,{recursive:true});
  for(const [name,[offset,size,digest]] of Object.entries(files)){
    if(!/^[A-Za-z0-9_-]+\.(bin|webp)$/.test(name))throw Error('Nom du modèle invalide');
    const bytes=archive.subarray(offset,offset+size);
    if(bytes.length!==size||createHash('sha256').update(bytes).digest('hex')!==digest)throw Error('Modèle incomplet : '+name);
    await writeFile(join(destination,name),bytes);
  }
}
