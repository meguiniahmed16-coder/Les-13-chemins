import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
await build({entryPoints:['yoyo-app.js'],bundle:true,minify:true,format:'iife',target:'es2020',outfile:'yoyo-runtime.js',legalComments:'inline',banner:{js:'/*\n'+await readFile('node_modules/three/LICENSE','utf8')+'\n*/'}});
console.log('Cellule 3D, jeu 2D et ambiance sonore assemblés.');
