import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const output=process.argv[2];if(!output)throw new Error('Indiquer le fichier de sortie.');
await build({entryPoints:['membres/worker.mjs'],format:'esm',bundle:true,outfile:output,minify:false,plugins:[{name:'module-prive',setup(build){
  build.onResolve({filter:/(?:avatar-owner\.js|incarnations-private\.html)\?text$/},args=>({path:resolve(args.resolveDir,args.path.replace(/\?text$/,'')),namespace:'source'}));
  build.onLoad({filter:/.*/,namespace:'source'},async args=>({contents:await readFile(args.path,'utf8'),loader:'text'}));
}}]});
