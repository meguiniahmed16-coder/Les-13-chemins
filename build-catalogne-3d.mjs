import {build} from 'esbuild';
import {readFileSync} from 'node:fs';
await build({
 entryPoints:['catalogne-3d-app.js'],
 outfile:'catalogne-3d-runtime.js',
 bundle:true,format:'iife',target:'es2020',minify:true,
 legalComments:'inline',
 banner:{js:'/* Three.js MIT license: '+readFileSync('node_modules/three/LICENSE','utf8').slice(0,540).replaceAll('*/','')+' */'}
});
console.log('Barcelone 3D : moteur du parc et cinq clients prêt.');
