// Each file contains one public V27 resource. Fetch only the selected outfit.
// Bundles also live one level deeper in /membres/v27/. These public assets
// belong to the site root, independently of the importing bundle's directory.
const base=new URL('/assets/salon-v27/',import.meta.url);
const types={Uint8Array,Uint16Array,Int8Array,Int16Array};
const cache=new Map();
export function resource(name){
  if(cache.has(name)){
    const value=cache.get(name);cache.delete(name);cache.set(name,value);return value;
  }
  const promise=load(name).catch(e=>{if(cache.get(name)===promise)cache.delete(name);throw e;});
  cache.set(name,promise);
  if(cache.size>56)cache.delete(cache.keys().next().value);
  return promise;
}
async function load(name){
  const res=await fetch(new URL(name+'.bin',base));
  if(!res.ok)throw Error('Une pièce du salon est indisponible.');
  const bytes=await new Response(res.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const size=new DataView(bytes).getUint32(0,true),start=4+size;
  return JSON.parse(new TextDecoder().decode(new Uint8Array(bytes,4,size)),(_,v)=>{
    if(!v||!Object.hasOwn(types,v.type))return v;
    const Type=types[v.type];return new Type(bytes,start+v.offset,v.bytes/Type.BYTES_PER_ELEMENT);
  });
}
const images=new WeakMap();
export function pixels(encoded){
  if(images.has(encoded))return images.get(encoded);
  const promise=(async()=>{
    const blob=new Blob([encoded],{type:'image/webp'});
    const url=URL.createObjectURL(blob),img=new Image();
    try{
      img.src=url;await img.decode();
      const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);return ctx.getImageData(0,0,canvas.width,canvas.height);
    }finally{URL.revokeObjectURL(url);}
  })();images.set(encoded,promise);return promise;
}
