import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';

// Validate only: the public build never copies workshop model payloads or HTML.
export async function buildIncarnations(root){
  const source=join(root,'assets-source/incarnations');
  const manifest=JSON.parse(await readFile(join(source,'assets.json'),'utf8'));
  if(manifest.format!=='incarnations-private-r2/1'||manifest.basePath!=='/api/membres/incarnations/'||!/^[a-f0-9]{40}$/.test(manifest.sourceCommit))throw Error('Manifeste privé de l’atelier invalide.');
  if(manifest.privateDocument!=='incarnations-private.html')throw Error('Document privé invalide.');
  const template=await readFile(join(source,manifest.privateDocument));
  if(createHash('sha256').update(template).digest('hex')!==manifest.privateDocumentSha256)throw Error('L’atelier privé est incomplet.');
  for(const name of await readdir(source))if(!['assets.json','incarnations-private.html'].includes(name))throw Error('Le dépôt public ne doit contenir aucun modèle de l’atelier : '+name);
  for(const [name,file] of Object.entries(manifest.files)){
    if(!/^(?:assets\/[a-zA-Z0-9_.-]+\.js|icons\/[a-zA-Z0-9_.-]+\.(?:png|svg)|salon-embed\.js)$/.test(name))throw Error('Ressource de l’atelier invalide : '+name);
    if(file.key!=='incarnations/v1/'+manifest.sourceCommit+'/'+name||!Number.isSafeInteger(file.bytes)||file.bytes<=0||file.bytes>3_000_000||!/^[a-f0-9]{64}$/.test(file.sha256))throw Error('Ressource de l’atelier incomplète : '+name);
    const expected=name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.png')?'image/png':'image/svg+xml';
    if(file.contentType!==expected)throw Error('Type de ressource inattendu : '+name);
  }
  return {files:Object.keys(manifest.files).length,private:true,sourceCommit:manifest.sourceCommit};
}
