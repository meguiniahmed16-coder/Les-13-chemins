import {build} from 'esbuild';
await build({entryPoints:['double-admin-src/main.tsx'],outfile:'double-admin.js',bundle:true,minify:true,format:'esm',platform:'browser',target:['es2022'],jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof'});

await build({entryPoints:['blog-content.js'],outfile:'blog-content-public.js',bundle:true,minify:true,format:'iife',globalName:'BlogContent',platform:'browser',target:['es2022']});

await build({entryPoints:['bois/public.tsx'],outfile:'bois-public.js',bundle:true,minify:true,format:'esm',platform:'browser',target:['es2022'],jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}});
