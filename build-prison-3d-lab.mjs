import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
await build({
 entryPoints:['prison-3d-lab.js'],
 outfile:'prison-3d-lab-runtime.js',
 bundle:true,minify:true,format:'iife',target:'es2020',
 legalComments:'inline',
 banner:{js:'/* Three.js MIT — Quaternius character CC0 */\n'+await readFile('node_modules/three/LICENSE','utf8')}
});
console.log('Prototype de la cellule entièrement en 3D assemblé, sans modifier le gameplay de production.');
