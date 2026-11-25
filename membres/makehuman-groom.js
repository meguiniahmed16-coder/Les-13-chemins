import {pixels} from './studio-assets.js';
import {colourGroom} from './studio-materials.js?v=incarnations33';

const types={Int8Array,Uint8Array,Int16Array,Uint16Array,Float32Array,Uint32Array};
const cache=new Map(),tints=new Map();

export function decodeGroom(buffer){
 const size=new DataView(buffer).getUint32(0,true),start=4+size;
 if(size>buffer.byteLength-4)throw Error('La coiffure est incomplète.');
 return JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,4,size)),(_,value)=>{
  if(!value||!Object.hasOwn(types,value.type))return value;
  const Type=types[value.type];
  if(!Number.isInteger(value.offset)||!Number.isInteger(value.bytes)||value.offset<0||value.bytes<0||start+value.offset+value.bytes>buffer.byteLength)throw Error('La coiffure est incomplète.');
  return new Type(buffer,start+value.offset,value.bytes/Type.BYTES_PER_ELEMENT);
 });
}
async function asset(id){
 if(!/^mh-[a-z0-9_-]+$/.test(id))throw Error('Coiffure inconnue.');
 if(!cache.has(id)){
  const pending=(async()=>{
   const response=await fetch('/assets/makehuman/'+id+'.bin');
   if(!response.ok)throw Error('Cette coiffure est momentanément indisponible. Réessaie.');
   return decodeGroom(await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  })().catch(error=>{cache.delete(id);throw error;});
  cache.set(id,pending);if(cache.size>6)cache.delete(cache.keys().next().value);
 }
 return cache.get(id);
}

// No full-library download. A figure receives only its selected hair and beard,
// with an independent texture so one character's dye cannot affect another.
export async function loadMakehumanGroom(record,look,gender){
 const raw=await asset(record.id),female=gender==='femme',tone=look.face.hairTone||0;
 const key=record.id+'/'+tone;
 if(!tints.has(key)){
  tints.set(key,pixels(raw.image).then(image=>colourGroom(image,tone)).catch(error=>{tints.delete(key);throw error;}));
  if(tints.size>6)tints.delete(tints.keys().next().value);
 }
 const image=await tints.get(key);
 return {...raw,name:record.id,group:record.kind,groom:true,groomKind:record.kind,
  position:female&&raw.femalePosition?raw.femalePosition:raw.position,
  normal:female&&raw.femaleNormal?raw.femaleNormal:raw.normal,
  binding:female&&raw.femaleBinding?raw.femaleBinding:raw.binding,
  image:new ImageData(new Uint8ClampedArray(image.data),image.width,image.height)};
}
