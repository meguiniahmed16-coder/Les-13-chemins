import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
const license=await readFile('node_modules/three/LICENSE','utf8');
await build({
 entryPoints:['prison-3d-app.js'],
 outfile:'prison-3d-runtime.js',
 bundle:true,format:'iife',target:'es2020',minify:true,
 legalComments:'inline',
 banner:{js:'/*\n'+license+'\n*/'}
});
console.log('Prototype 3D de la cellule assemblé. Jeu public original inchangé.');
