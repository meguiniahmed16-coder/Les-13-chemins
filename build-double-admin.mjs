import {build} from 'esbuild';
await build({entryPoints:['double-admin-src/main.tsx'],outfile:'double-admin.js',bundle:true,minify:true,format:'esm',platform:'browser',target:['es2022'],jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof'});
