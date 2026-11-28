import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {copyFile} from 'node:fs/promises';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
await build({
  entryPoints:[resolve(root,'membres/intro-entry.js')],
  outfile:resolve(root,'membres/intro-cinema-bundle.js'),
  bundle:true,minify:true,format:'esm',target:'es2022',
  platform:'browser',sourcemap:false,legalComments:'none',
  define:{'process.env.NODE_ENV':'"production"'}
});
await copyFile(resolve(root,'membres/intro-cinema-bundle.js'),resolve(root,'membres/intro-cinema-croisee27.js'));
await copyFile(resolve(root,'membres/intro-cinema-bundle.js'),resolve(root,'membres/intro-cinema-croisee28.js'));
await copyFile(resolve(root,'membres/intro-cinema-bundle.js'),resolve(root,'membres/intro-cinema-croisee29.js'));
await copyFile(resolve(root,'membres/intro-cinema-bundle.js'),resolve(root,'membres/intro-cinema-croisee30.js'));
await copyFile(resolve(root,'membres/intro-cinema-bundle.js'),resolve(root,'membres/intro-cinema-croisee31.js'));
await copyFile(resolve(root,'membres/intro-cinema-bundle.js'),resolve(root,'membres/intro-cinema-croisee32.js'));
await copyFile(resolve(root,'membres/intro-cinema-bundle.js'),resolve(root,'membres/intro-cinema-croisee33.js'));
console.log('Cinématique 3D privée construite : incarnations33 (croisee33).');

await build({entryPoints:[resolve(root,'membres/atelier-cinematique.js')],outfile:resolve(root,'membres/atelier-cinematique-bundle.js'),bundle:true,minify:true,format:'esm',target:'es2022',platform:'browser',sourcemap:false,legalComments:'none',define:{'process.env.NODE_ENV':'"production"'}});

await build({entryPoints:[resolve(root,'membres/atelier-163-viewer.js')],outfile:resolve(root,'membres/atelier-163-viewer-bundle.js'),bundle:true,minify:true,format:'esm',target:'es2022',platform:'browser',sourcemap:false,legalComments:'none',define:{'process.env.NODE_ENV':'"production"'}});
