import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const hash=data=>createHash('sha256').update(data).digest('hex');
const pageSpec={bytes:761883,sha256:'92c850fd4d9739d57717d075e32c885cf8bdb08e63976d11aa2da2c9227a6df6'};
const names=['Ahmed-tete.glb','Ahmed.glb','Lionel-tete.glb','Lionel.glb','adversaire.glb','ambiance-entrepot.mp3','ambiance-ville.mp3','entrepot.glb','equipement-anime.glb','equipement.glb','ville.glb'];
function verify(data,spec,name){
 if(data.length!==spec.bytes||hash(data)!==spec.sha256)throw Error('Sarajevo V31 : fichier altéré '+name);
 return data;
}
export async function publishSarajevoV31(root,output){
 const manifest=JSON.parse(await readFile(join(root,'sarajevo-v31','manifest.json'),'utf8'));
 if(Object.keys(manifest.assets).length!==names.length||!names.every(n=>manifest.assets[n]))throw Error('Liste V31 incomplète');
 const page=verify(await readFile(join(root,'sarajevo-v31','index.html')),pageSpec,'index.html');
 const assets=[];
 for(const name of names){
  const spec=manifest.assets[name];
  let data;
  try{data=await readFile(join(root,'sarajevo-v31','assets',name));}
  catch(e){
   if(e.code!=='ENOENT')throw e;
   const parts=[];
   for(let i=0;i<Math.ceil(spec.bytes/900000);i++){
    const part=await readFile(join(root,'sarajevo-v31','parts',name+'.part'+String(i).padStart(2,'0')));
    if(part.length!==Math.min(900000,spec.bytes-i*900000))throw Error('Fragment V31 incomplet : '+name+' '+i);
    parts.push(part);
   }
   data=Buffer.concat(parts);
  }
  assets.push([name,verify(data,spec,name)]);
 }
 await mkdir(join(output,'sarajevo-v31','assets'),{recursive:true});
 await writeFile(join(output,'sarajevo-v31','index.html'),page);
 for(const [name,data] of assets)await writeFile(join(output,'sarajevo-v31','assets',name),data);
 await copyFile(join(root,'sarajevo-v31-wrapper.html'),join(output,'jeu-bosnie.html'));
 await copyFile(join(root,'sarajevo-v31-bridge.js'),join(output,'sarajevo-v31-bridge.js'));
 console.log('Sarajevo V31 : page et onze ressources originales vérifiées (SHA-256).');
}
