import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const base='assets/manifestation/republique/';
export const imported={};
export async function loadParisAssets(software,onProgress){
 const loader=new GLTFLoader();
 const entries=[['quartier','quartier.bin'],['monument',software?'monument-loin.glb':'monument.glb'],['agent','agent.glb']];
 let count=0;
 await Promise.all(entries.map(async ([key,name])=>{
  const response=await fetch(base+name);
  if(!response.ok)throw Error('Ressource indisponible : '+name);
  const buffer=name.endsWith('.bin')?await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():await response.arrayBuffer();
  const asset=await loader.parseAsync(buffer,base);
  const adjusted=new Set();
  asset.scene.traverse(o=>{
   if(!o.isMesh)return;
   o.geometry.userData.cortege=true;o.geometry.computeBoundingSphere();
   const materials=Array.isArray(o.material)?o.material:[o.material];
   for(const m of materials){m.userData.cortege=true;if(m.map)m.map.anisotropy=4;}
   // The Canvas rasterizer samples bottom-origin UVs. glTF stores a top-origin map.
   const uv=o.geometry.attributes.uv;
   if(software&&uv&&!adjusted.has(uv)&&materials.some(m=>m.map?.flipY===false)){
    for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));uv.needsUpdate=true;adjusted.add(uv);
   }
  });
  imported[key]=asset;onProgress?.(++count,entries.length);
 }));
}
