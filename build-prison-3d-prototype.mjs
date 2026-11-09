import {build} from 'esbuild';
import {readFileSync} from 'node:fs';
// The canonical prison page uses this immersive runtime. Keep the filename
// stable so old preview links can redirect without requesting another bundle.
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
console.log('Jeu de la prison en vue subjective assemblé.');
