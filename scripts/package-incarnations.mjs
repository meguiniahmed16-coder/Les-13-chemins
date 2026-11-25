// Prepare a private R2 runtime manifest. No model payload enters the public repo.
import {readFile,writeFile,mkdir,readdir,lstat,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const source=resolve(process.argv[2]||'');
const commit=process.argv[3];
if(!process.argv[2]||!commit||!/^[0-9a-f]{40}$/.test(commit))throw Error('Usage : node scripts/package-incarnations.mjs <sortie salon> <commit source>');
const destination=join(root,'assets-source/incarnations');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const paths=[];
async function walk(directory){
  for(const name of (await readdir(directory)).sort()){
    const full=join(directory,name),stat=await lstat(full);
    if(stat.isSymbolicLink())throw Error('Lien symbolique non autorisé dans l’atelier.');
    if(stat.isDirectory())await walk(full);else if(stat.isFile())paths.push(relative(source,full));
  }
}
await walk(source);
const template=await readFile(join(source,'index.html'),'utf8');
const basePath='/api/membres/incarnations/';
if(!template.includes('__SALON_ACCESS__')||!template.includes('data-app-mode="salon"')||template.includes('rel="manifest"')||!template.includes(basePath))throw Error('Un build Salon privé avec contrôle d’accès est requis.');
const files={};
for(const name of paths){
  if(name==='index.html')continue;
  if(!/^(?:assets\/[a-zA-Z0-9_.-]+\.js|icons\/[a-zA-Z0-9_.-]+\.(?:png|svg)|salon-embed\.js)$/.test(name))throw Error('Fichier inattendu : '+name);
  const bytes=await readFile(join(source,name));
  if(bytes.length>3_000_000)throw Error('Ressource trop grande pour le proxy du Salon : '+name);
  const contentType=name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.png')?'image/png':'image/svg+xml';
  files[name]={key:'incarnations/v1/'+commit+'/'+name,bytes:bytes.length,sha256:hash(bytes),contentType};
}
await mkdir(destination,{recursive:true});
for(const name of await readdir(destination))if(/^runtime-\d+\.pack$/.test(name))await rm(join(destination,name));
await writeFile(join(destination,'incarnations-private.html'),template);
const manifest={format:'incarnations-private-r2/1',application:'L’Atelier des Incarnations',version:1,sourceProject:'appgprj_6b06bc0497fc8191948b42ced7b7236b',sourceCommit:commit,basePath,privateDocument:'incarnations-private.html',privateDocumentSha256:hash(Buffer.from(template)),files};
await writeFile(join(destination,'assets.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({files:Object.keys(files).length,bytes:Object.values(files).reduce((sum,file)=>sum+file.bytes,0),storage:'private R2',sourceCommit:commit}));
