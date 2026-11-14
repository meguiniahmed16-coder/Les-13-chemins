import fs from 'node:fs';import path from 'node:path';import {build} from 'esbuild';
const root=import.meta.dirname;
const files=['danse-quaternius-hero.glb','assets/danse/quaternius-superhero-female.glb','assets/danse/funky-chunk-loop.mp3','assets/danse/ovation.mp3'];
const assets=Object.fromEntries(files.map(f=>[f,'data:'+(f.endsWith('.mp3')?'audio/mpeg':'model/gltf-binary')+';base64,'+fs.readFileSync(path.join(root,f)).toString('base64')]));
const out=await build({entryPoints:[path.join(root,'danse-preview-entry.js')],bundle:true,minify:true,format:'iife',target:'es2020',write:false,legalComments:'inline'});
const html=fs.readFileSync(path.join(root,'danse-preview-template.html'),'utf8').replace('<!-- ASSETS -->',()=>'<script>window.DANSE_ASSETS='+JSON.stringify(assets)+'</script>').replace('<!-- RUNTIME -->',()=>out.outputFiles[0].text.replaceAll('</script','<\\/script'));
const dest=process.argv[2]||path.join(root,'Le-Danseur-Apercu.html');fs.writeFileSync(dest,html);console.log(JSON.stringify({file:dest,bytes:Buffer.byteLength(html),embeddedAssets:files.length}));
