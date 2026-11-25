import manifest from '../assets-source/incarnations/assets.json' with {type:'json'};
import {fail} from './identity.mjs';

// Called only after the actual member/author session has been verified.
export async function incarnationsRuntime(env,name){
  if(!Object.hasOwn(manifest.files,name))fail(404,'Ressource de l’atelier introuvable.');
  const file=manifest.files[name];
  const object=await env.STUDIO?.get(file.key);
  if(!object||object.size!==file.bytes)fail(503,'Une ressource de l’atelier est momentanément indisponible.');
  return new Response(object.body,{headers:{
    'content-type':file.contentType,
    'content-length':String(file.bytes),
    'cache-control':'private, no-store, max-age=0',
    'x-content-type-options':'nosniff',
    'x-robots-tag':'noindex, nofollow',
    'cross-origin-resource-policy':'same-origin',
    'referrer-policy':'no-referrer',
    'vary':'Cookie'
  }});
}
