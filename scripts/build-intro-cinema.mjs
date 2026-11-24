import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {copyFile} from 'node:fs/promises';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
await build({
  entryPoints:[resolve(root,'membres/intro-cinema.js')],
  outfile:resolve(root,'membres/intro-cinema-bundle.js'),
  bundle:true,minify:true,format:'esm',target:'es2022',
  platform:'browser',sourcemap:false,legalComments:'none',
  define:{'process.env.NODE_ENV':'"production"'}
});
await copyFile(resolve(root,'membres/intro-cinema-bundle.js'),resolve(root,'membres/intro-cinema-construct17.js'));
console.log('Cinématique 3D privée construite : construct17.');
