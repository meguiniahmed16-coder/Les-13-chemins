import {build} from 'esbuild';
import {readFileSync} from 'node:fs';
// Standalone experiment: do not overwrite jeu-yoyo.html or its approved runtime.
await build({
 entryPoints:['prison-3d-prototype-app.js'],
 outfile:'prison-3d-prototype-runtime.js',
 bundle:true,
 format:'iife',
 target:'es2020',
 minify:true,
 legalComments:'inline',
 banner:{js:'/* Three.js MIT license: '+readFileSync('node_modules/three/LICENSE','utf8').slice(0,600).replaceAll('*/','')+' */'}
});
console.log('Prototype prison 3D assemblé séparément du jeu de prison officiel.');
