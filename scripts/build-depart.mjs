import {build} from 'esbuild';
import {readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {unzipSync,zipSync} from 'three/examples/jsm/libs/fflate.module.js';

export async function buildDeparture(root,output){
  await build({entryPoints:[join(root,'membres/depart/world.js')],outfile:join(output,'membres/depart.js'),bundle:true,format:'esm',target:'es2022',minify:true,legalComments:'inline'});
  await build({entryPoints:[join(root,'membres/v27/scene.js')],outfile:join(output,'membres/v27/scene-bundle.js'),bundle:true,format:'esm',target:'es2022',minify:true,legalComments:'inline'});
  // The software/WebGL1 fallback supplies its figures from the studio. Its lighter pack contains only the décor.
  const src=await readFile(join(root,'assets/depart-duo/scene.bin'));
  const files=unzipSync(src,{filter:file=>!file.name.startsWith('m/')&&!file.name.startsWith('f/')});
  await writeFile(join(output,'membres/decor-du-salon.bin'),zipSync(files,{level:6}));
}
