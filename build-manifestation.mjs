import {build} from 'esbuild';
import {readFileSync} from 'node:fs';
await build({
 entryPoints:['manifestation-app.js'],
 outfile:'manifestation-runtime.js',
 bundle:true,format:'iife',target:'es2020',minify:true,
 legalComments:'inline',
 banner:{js:'/* Three.js MIT license: '+readFileSync('node_modules/three/LICENSE','utf8').slice(0,540).replaceAll('*/','')+' */'}
});
console.log('Manifestation République–Bastille : bundle 3D prêt.');
