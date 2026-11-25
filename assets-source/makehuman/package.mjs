// Repack an approved preparation without placing its large source ZIPs in git.
import {readFile,writeFile,mkdir,readdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const source=resolve(process.argv[2]||'');
if(!process.argv[2])throw Error('Usage : node assets-source/makehuman/package.mjs <dossier de préparation>');
const destination=fileURLToPath(new URL('./',import.meta.url)),prepared=join(source,'prepared');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const catalog=JSON.parse(await readFile(join(prepared,'catalog.json'),'utf8'));
const evidence=JSON.parse(await readFile(join(prepared,'licensing-evidence.json'),'utf8'));
const inventory=JSON.parse(await readFile(join(prepared,'source-inventory.json'),'utf8'));
if(catalog.assets.length!==30||catalog.assets.filter(a=>a.kind==='hair').length!==25||catalog.assets.filter(a=>a.kind==='beard').length!==5||catalog.assets.some(a=>a.license!=='CC0-1.0'||a.licenseEvidence!=='CC0'))throw Error('Une collection validée de 25 coiffures et 5 barbes CC0 est requise.');
const changes=['Adaptation MHCLO aux deux corps natifs du Salon','Triangulation et séparation des coutures UV','Liaisons à la surface du corps pour les expressions et les mouvements','Préservation des UV répétés par préparation d’atlas','Textures WebP, côté maximal de 1536 pixels','Quantification et sérialisation dans le format natif du Salon'];
const assets=catalog.assets.map(a=>({id:a.id,label:a.label,kind:a.kind,pack:a.pack,sourceId:a.sourceId,file:a.file,license:a.license}));
const credits={title:'Coiffures et barbes MakeHuman — Salon des Incarnations',license:'CC0-1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',preparedDate:'2026-11-25',sourcePacks:inventory.archives,changes,licenseEvidence:{basis:evidence.basis,retainedNotices:evidence.retainedNotices,legacyExplanation:evidence.legacyExplanation},assets:catalog.assets.map(a=>({id:a.id,label:a.label,kind:a.kind,author:a.author,sourceUrl:a.sourceUrl,catalogueLicense:a.licenseEvidence,embeddedMhcloNotice:a.embeddedLicense}))};
const text=['COIFFURES ET BARBES MAKEHUMAN — SALON DES INCARNATIONS','',
 '25 coiffures Hair01 et 5 ressources Bodyparts05, préparées le 25 novembre 2026.',
 'Licence publiée individuellement dans les catalogues officiels : CC0.',
 'https://creativecommons.org/publicdomain/zero/1.0/','',
 'Certaines notices MHCLO historiques indiquent AGPL3 ou CC-BY. Elles sont conservées ci-dessous et dans credits.json. Le catalogue officiel et son JSON embarqué indiquent CC0 pour chaque ressource ; les notices source ne sont pas présentées comme identiques.',
 'Documentation historique de MakeClothes : https://static.makehumancommunity.org/oldsite/documentation/big_dump_from_drupal.html','',
 ...inventory.archives.flatMap(a=>[a.pack+' : '+a.catalogueUrl,'Archive : '+a.url,'SHA256 : '+a.sha256,'']),
 'Transformations : '+changes.join(' ; ')+'.','',
 ...credits.assets.flatMap(a=>[a.label+' — '+a.author,'Identifiant : '+a.id,'Source : '+a.sourceUrl,'Catalogue : '+a.catalogueLicense,...(a.embeddedMhcloNotice?['Notice MHCLO conservée : '+a.embeddedMhcloNotice]:[]),''])].join('\n')+'\n';
const files={},payload=[];let offset=0;
function add(name,bytes){files[name]=[offset,bytes.length,hash(bytes)];payload.push(bytes);offset+=bytes.length;}
for(const asset of catalog.assets){
 if(!/^mh-[a-z0-9_]+\.bin$/.test(asset.file)||asset.file!==asset.id+'.bin')throw Error('Nom de ressource invalide.');
 const bytes=await readFile(join(prepared,asset.file));
 if(bytes.length!==asset.bytes||hash(bytes)!==asset.sha256)throw Error('La préparation a changé : '+asset.file);
 add(asset.file,bytes);
}
add('credits.txt',Buffer.from(text));add('credits.json',Buffer.from(JSON.stringify(credits,null,2)+'\n'));
const copies={'catalog.json':join(prepared,'catalog.json'),'source-inventory.json':join(prepared,'source-inventory.json'),'licensing-evidence.json':join(prepared,'licensing-evidence.json'),'geometry-validation.json':join(prepared,'validation.json'),'binary-validation.json':join(prepared,'binary-validation.json'),'preparation-receipt.json':join(prepared,'preparation-receipt.json'),'source-hair01.json':join(source,'source/hair01/packs/hair01.json'),'source-bodyparts05.json':join(source,'source/bodyparts05/packs/bodyparts05.json')};
const sourceNames=[...Object.keys(copies),'README.md','package.mjs','verify.test.mjs'];
await mkdir(destination,{recursive:true});
for(const name of await readdir(destination))if(name!=='assets.json'&&!/^grooms-\d{3}\.pack$/.test(name)&&!sourceNames.includes(name))throw Error('Fichier source non prévu : '+name);
const archive=Buffer.concat(payload),packs=[],packFiles={};
for(const name of await readdir(destination))if(/^grooms-\d{3}\.pack$/.test(name))await rm(join(destination,name));
for(let start=0;start<archive.length;start+=600000){
 const name='grooms-'+String(packs.length).padStart(3,'0')+'.pack',bytes=archive.subarray(start,start+600000);
 await writeFile(join(destination,name),bytes);packs.push(name);packFiles[name]={bytes:bytes.length,sha256:hash(bytes)};
}
for(const[name,path]of Object.entries(copies))await writeFile(join(destination,name),await readFile(path));
const sourceFiles={};
for(const name of sourceNames.sort()){const bytes=await readFile(join(destination,name));sourceFiles[name]={bytes:bytes.length,sha256:hash(bytes)};}
const manifest={format:'makehuman-salon-resources/1',license:'CC0-1.0',assetCount:30,maxPackBytes:600000,compression:'none',archive:{bytes:archive.length,sha256:hash(archive)},packs,packFiles,sourceFiles,assets,files};
await writeFile(join(destination,'assets.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({assets:assets.length,files:Object.keys(files).length,packs:packs.length,bytes:archive.length,sha256:manifest.archive.sha256}));
