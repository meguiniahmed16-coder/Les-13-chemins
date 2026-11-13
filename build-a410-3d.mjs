import {build} from 'esbuild';
await build({entryPoints:['a410-3d.js'],bundle:true,minify:true,format:'esm',target:'es2020',outfile:'a410-3d-runtime.js',legalComments:'inline'});
