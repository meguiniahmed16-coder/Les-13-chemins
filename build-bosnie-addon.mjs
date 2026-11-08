import {build} from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),root=import.meta.dirname;
const license=fs.readFileSync(path.resolve(path.dirname(require.resolve('three')),'../LICENSE'),'utf8');
await build({
 entryPoints:[path.join(root,'bosnie-addon-source.js')],
 bundle:true,minify:true,format:'iife',target:'es2020',
 outfile:path.join(root,'bosnie-addon.js'),
 legalComments:'inline',
 banner:{js:'/*\n'+license+'\n*/'}
});
console.log('Compagnon de Bosnie et ciel 3D assemblés (sans changer le gameplay).');
