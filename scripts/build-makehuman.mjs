import {readFile,writeFile,mkdir,readdir,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {gunzipSync} from 'node:zlib';

const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const hashPattern=/^[a-f0-9]{64}$/;
const assetPattern=/^mh-[a-z0-9_]+\.bin$/;
const publicDocuments=new Set(['credits.txt','credits.json']);
const fail=message=>{throw Error('Ressources MakeHuman : '+message);};
function recordIsValid(record){return record&&Number.isSafeInteger(record.bytes)&&record.bytes>0&&hashPattern.test(record.sha256);}
function sameRoster(actual,expected){return actual.length===expected.length&&actual.every(name=>expected.includes(name));}
async function verifiedFile(source,name,record){
 if(!/^[a-zA-Z0-9_.-]+$/.test(name)||!recordIsValid(record))fail('entrée source invalide : '+name);
 const path=join(source,name),stat=await lstat(path);
 if(!stat.isFile()||stat.isSymbolicLink()||stat.size!==record.bytes)fail('taille ou type incorrect : '+name);
 const bytes=await readFile(path);
 if(digest(bytes)!==record.sha256)fail('empreinte incorrecte : '+name);
 return bytes;
}
function inspectGroom(bytes,asset,sourceRecord){
 const raw=gunzipSync(bytes,{maxOutputLength:32*1024*1024});
 if(raw.length<4)fail('modèle tronqué : '+asset.id);
 const size=raw.readUInt32LE(0),start=4+size;
 if(size<2||size>1024*1024||start>=raw.length||start%4)fail('en-tête invalide : '+asset.id);
 const mesh=JSON.parse(raw.subarray(4,start).toString('utf8'));
 if(mesh.name!==asset.id||mesh.kind!==asset.kind||mesh.provenance?.pack!==asset.pack||mesh.provenance?.sourceId!==asset.sourceId||mesh.provenance?.catalogLicense!=='CC0'||mesh.provenance?.sourceUrl!==sourceRecord.source||mesh.provenance?.author!==sourceRecord.author)fail('provenance du modèle incohérente : '+asset.id);
 if(mesh.bindingSignedGap!==true||mesh.alphaMode!=='MASK'||mesh.doubleSided!==true)fail('contrat de rendu incomplet : '+asset.id);
 const sizes={Int16Array:2,Uint16Array:2,Int8Array:1,Uint8Array:1};
 for(const field of ['position','normal','femalePosition','femaleNormal','faces','uv','weld','rig','binding','femaleBinding','image']){
  const a=mesh[field],unit=sizes[a?.type];
  if(!unit||!Number.isSafeInteger(a.offset)||a.offset<0||a.offset%unit||!Number.isSafeInteger(a.bytes)||a.bytes<=0||a.bytes%unit||start+a.offset+a.bytes>raw.length)fail('tableau du modèle invalide : '+asset.id+'/'+field);
 }
 const vertices=mesh.position.bytes/6;
 if(!Number.isSafeInteger(vertices)||vertices<1||vertices>65535||mesh.position.type!=='Int16Array'||mesh.normal.type!=='Int8Array'||mesh.faces.type!=='Uint16Array'||mesh.uv.type!=='Uint16Array'||mesh.binding.type!=='Uint16Array'||mesh.femaleBinding.type!=='Uint16Array'||mesh.normal.bytes!==vertices*3||mesh.femalePosition.bytes!==vertices*6||mesh.femaleNormal.bytes!==vertices*3||mesh.uv.bytes!==vertices*4||mesh.rig.bytes!==vertices*8||mesh.weld.bytes!==vertices*2||mesh.binding.bytes!==vertices*16||mesh.femaleBinding.bytes!==vertices*16||mesh.faces.bytes%6)fail('dimensions du modèle incohérentes : '+asset.id);
}

/** Verify the complete approved source roster before emitting any public file. */
export async function buildMakehuman(root,output){
 const source=join(root,'assets-source','makehuman'),destination=join(output,'assets','makehuman');
 const manifest=JSON.parse(await readFile(join(source,'assets.json'),'utf8'));
 if(manifest.format!=='makehuman-salon-resources/1'||manifest.compression!=='none'||manifest.license!=='CC0-1.0'||manifest.assetCount!==30||manifest.maxPackBytes!==600000||!recordIsValid(manifest.archive)||!Array.isArray(manifest.packs)||!Array.isArray(manifest.assets)||manifest.assets.length!==30)fail('format ou licence du manifeste invalide');
 if(!manifest.sourceFiles||!manifest.packFiles||!manifest.files||!sameRoster(manifest.packs,Object.keys(manifest.packFiles))||new Set(manifest.packs).size!==manifest.packs.length)fail('inventaire des fragments invalide');
 const sourceNames=['assets.json',...Object.keys(manifest.sourceFiles),...manifest.packs];
 if(new Set(sourceNames).size!==sourceNames.length||!sameRoster(await readdir(source),sourceNames))fail('inventaire source non fermé');
 const metadata=new Map(await Promise.all(Object.entries(manifest.sourceFiles).map(async([name,record])=>[name,await verifiedFile(source,name,record)])));
 const catalogues={hair01:JSON.parse(metadata.get('source-hair01.json')),bodyparts05:JSON.parse(metadata.get('source-bodyparts05.json'))};
 if(Object.keys(catalogues.hair01).length!==25||Object.keys(catalogues.bodyparts05).length!==5)fail('catalogue officiel incomplet');
 const expectedIds=new Set(Object.values(catalogues).flatMap(c=>Object.keys(c).map(id=>'mh-'+id)));
 const seen=new Set();
 for(const asset of manifest.assets){
  const original=catalogues[asset.pack]?.[asset.sourceId];
  if(!original||original.license!=='CC0'||asset.license!=='CC0-1.0'||asset.id!=='mh-'+asset.sourceId||asset.file!==asset.id+'.bin'||!expectedIds.has(asset.id)||seen.has(asset.id)||(asset.kind!==(asset.pack==='hair01'?'hair':'beard')))fail('modèle absent du catalogue CC0 : '+asset.id);
  seen.add(asset.id);
 }
 if(seen.size!==expectedIds.size)fail('collection de modèles incomplète');
 const parts=await Promise.all(manifest.packs.map(name=>{
  if(!/^grooms-\d{3}\.pack$/.test(name)||!recordIsValid(manifest.packFiles[name])||manifest.packFiles[name].bytes>manifest.maxPackBytes)fail('fragment invalide : '+name);
  return verifiedFile(source,name,manifest.packFiles[name]);
 }));
 const archive=Buffer.concat(parts);
 if(archive.length!==manifest.archive.bytes||digest(archive)!==manifest.archive.sha256)fail('archive incomplète');
 const expectedPublic=[...manifest.assets.map(a=>a.file),...publicDocuments];
 if(!sameRoster(Object.keys(manifest.files),expectedPublic))fail('inventaire public non fermé');
 const assetsByFile=new Map(manifest.assets.map(a=>[a.file,a])),ready=[];let end=0;
 for(const[name,record]of Object.entries(manifest.files).sort((a,b)=>a[1][0]-b[1][0])){
  if(!assetPattern.test(name)&&!publicDocuments.has(name))fail('nom public invalide : '+name);
  if(!Array.isArray(record)||record.length!==3)fail('description de fichier invalide : '+name);
  const[offset,size,hash]=record;
  if(!Number.isSafeInteger(offset)||offset!==end||!Number.isSafeInteger(size)||size<=0||offset+size>archive.length||!hashPattern.test(hash))fail('plage de fichier invalide : '+name);
  const bytes=archive.subarray(offset,offset+size);
  if(digest(bytes)!==hash)fail('modèle incomplet : '+name);
  const asset=assetsByFile.get(name);
  if(asset)inspectGroom(bytes,asset,catalogues[asset.pack][asset.sourceId]);
  ready.push([name,bytes]);end+=size;
 }
 if(end!==archive.length)fail('octets sans fichier dans l’archive');
 const credits=JSON.parse(ready.find(([name])=>name==='credits.json')[1]);
 if(credits.license!=='CC0-1.0'||!Array.isArray(credits.assets)||!sameRoster(credits.assets.map(a=>a.id),[...expectedIds]))fail('crédits publics incomplets');
 for(const asset of credits.assets){
  const entry=manifest.assets.find(a=>a.id===asset.id),original=catalogues[entry.pack][entry.sourceId];
  if(asset.author!==original.author||asset.sourceUrl!==original.source||asset.catalogueLicense!=='CC0')fail('crédit public incohérent : '+asset.id);
 }
 // Repeated builds may replace the same files, but never silently retain an
 // unlisted public resource from an earlier or unrelated package.
 try{if((await readdir(destination)).some(name=>!expectedPublic.includes(name)))fail('fichier public inattendu dans le dossier de sortie');}catch(error){if(error.code!=='ENOENT')throw error;}
 await mkdir(destination,{recursive:true});
 await Promise.all(ready.map(([name,bytes])=>writeFile(join(destination,name),bytes)));
 return {assets:manifest.assets.length,files:ready.length,packs:parts.length,bytes:archive.length,archiveSha256:manifest.archive.sha256};
}
