#!/usr/bin/env node
// Transfert non destructif : les liens utilisés par le site restent inchangés.
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const manifest=JSON.parse(readFileSync(new URL('../migration/r2-videos-manifest.json',import.meta.url),'utf8'));
const argv=process.argv.slice(2);
const modes=argv.filter(x=>['--plan','--upload','--verify'].includes(x));
if(modes.length>1||argv.some(x=>!['--plan','--upload','--verify'].includes(x)&&!/^--only=[A-Za-z0-9]+$/.test(x))){
  throw new Error('Usage : node scripts/migrate-videos-r2.mjs [--plan|--upload|--verify] [--only=C01]');
}
const mode=modes[0]||'--plan';
const only=argv.find(x=>x.startsWith('--only='))?.slice(7);
const prefix=manifest.prefix;
const all=manifest.items;
if(manifest.version!==1||all.length!==22||new Set(all.map(x=>x.id)).size!==22){
  throw new Error('Manifeste inattendu : vérifier le catalogue avant tout transfert.');
}
for(const item of all){
  if(!item.objectKey.startsWith(prefix+'/')||item.objectKey.includes('..')||!/\.mp4$/.test(item.objectKey)||!/^https:\/\/[^/]+\/.+\.mp4$/.test(item.sourceUrl)){
    throw new Error('Clé ou URL dangereuse pour : '+item.id);
  }
}
const selected=only?all.filter(x=>x.id===only):all;
if(!selected.length)throw new Error('Identifiant introuvable : '+only);

const remote=process.env.R2_REMOTE||'r2';
const bucket=process.env.R2_BUCKET;
if(mode!=='--plan'&&(!/^[a-z0-9][a-z0-9-]*$/.test(bucket||'')||!/^[A-Za-z0-9_-]+$/.test(remote))){
  throw new Error('Définir R2_BUCKET (nom du bucket) et éventuellement R2_REMOTE (défaut : r2).');
}
function execRclone(parameters){
  const result=spawnSync('rclone',parameters,{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:10*60*1000});
  if(result.error)throw result.error;
  if(result.status!==0)throw new Error((result.stderr||result.stdout||'rclone en échec').trim().slice(-1200));
  return result.stdout||'';
}
function verify(items){
  const address=remote+':'+bucket+'/'+prefix;
  const output=execRclone(['lsjson',address,'--recursive','--files-only']);
  const listing=JSON.parse(output);
  const byPath=new Map(listing.map(o=>[o.Path,o]));
  const failures=[];
  for(const entry of items){
    const relative=entry.objectKey.slice(prefix.length+1);
    const object=byPath.get(relative);
    if(!object||!Number.isFinite(object.Size)||object.Size<=0){
      failures.push(entry.id+' : manquant ou vide ('+relative+')');
    }else console.log('VÉRIFIÉ '+entry.id+' : '+object.Size+' octets');
  }
  if(failures.length)throw new Error('Vérification R2 incomplète :\n'+failures.join('\n'));
  console.log('Vérification des '+items.length+' objets R2 réussie.');
}
if(mode==='--plan'){
  console.log('PLAN SEUL : aucun transfert, aucune modification du site.');
  console.log(selected.length+' vidéo(s), destination = <R2_REMOTE>:<R2_BUCKET>/'+prefix);
  for(const entry of selected)console.log(entry.id+' | '+entry.label+' | '+entry.objectKey);
}else if(mode==='--verify'){
  verify(selected);
}else if(mode==='--upload'){
  const failures=[];
  for(const entry of selected){
    const destination=remote+':'+bucket+'/'+entry.objectKey;
    console.log('COPIE '+entry.id+' : '+entry.objectKey);
    try{
      execRclone(['copyurl','--no-clobber','--retries','3','--low-level-retries','10',entry.sourceUrl,destination]);
    }catch(error){failures.push(entry.id+' : '+error.message);console.error('ÉCHEC '+entry.id);}
  }
  if(failures.length)throw new Error('Copie partielle :\n'+failures.join('\n'));
  verify(selected);
  console.log('Les références publiques sur Higgsfield/CloudFront restent inchangées.');
}
