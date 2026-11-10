import {build} from 'esbuild';
import {readFileSync} from 'node:fs';
await build({
 entryPoints:['cyrano-app.js'],outfile:'cyrano-runtime.js',bundle:true,format:'iife',
 target:'es2020',minify:true,legalComments:'inline',
 banner:{js:'/* Three.js MIT license: '+readFileSync('node_modules/three/LICENSE','utf8').slice(0,540).replaceAll('*/','')+' */'}
});
console.log('Cyrano : cinématique à deux cellules et éditeur de lettres prêt.');
