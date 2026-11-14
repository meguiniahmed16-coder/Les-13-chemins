import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
export function decodeDataUri(uri){
 const comma=uri.indexOf(',');if(comma<0)throw Error('Ressource incorporée invalide');
 const value=atob(uri.slice(comma+1)),bytes=new Uint8Array(value.length);
 for(let i=0;i<value.length;i++)bytes[i]=value.charCodeAt(i);
 return bytes.buffer;
}
export function embeddedBytes(path){const uri=globalThis.DANSE_ASSETS?.[path];return uri?decodeDataUri(uri):null;}
function base64(bytes){let out='';for(let i=0;i<bytes.length;i+=16384)out+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(out);}
export function parseEmbeddedGlb(buffer){
 const loader=new GLTFLoader(),view=new DataView(buffer);
 if(view.getUint32(0,true)!==0x46546c67)throw Error('Modèle incorporé invalide');
 const jsonLength=view.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,jsonLength))),binaryOffset=28+jsonLength;
 // TextureLoader through a data image avoids fetch(blob:) and fetch(data:) in
 // Android content:// downloads. All bytes already belong to this HTML file.
 if(json.images?.length)loader.register(parser=>({name:'DANSE_INLINE_IMAGES',loadTexture(index){
  const def=json.textures[index],source=json.images[def.source];if(source.bufferView==null)return null;
  const span=json.bufferViews[source.bufferView],data=new Uint8Array(buffer,binaryOffset+(span.byteOffset||0),span.byteLength);
  return new Promise((resolve,reject)=>{
   const image=new Image();image.onload=()=>{
    const texture=new T.Texture(image);texture.flipY=false;
    const sampler=json.samplers?.[def.sampler]||{},filters={9728:T.NearestFilter,9729:T.LinearFilter,9984:T.NearestMipmapNearestFilter,9985:T.LinearMipmapNearestFilter,9986:T.NearestMipmapLinearFilter,9987:T.LinearMipmapLinearFilter},wrap={33071:T.ClampToEdgeWrapping,33648:T.MirroredRepeatWrapping,10497:T.RepeatWrapping};
    texture.magFilter=filters[sampler.magFilter]||T.LinearFilter;texture.minFilter=filters[sampler.minFilter]||T.LinearMipmapLinearFilter;
    texture.wrapS=wrap[sampler.wrapS]||T.RepeatWrapping;texture.wrapT=wrap[sampler.wrapT]||T.RepeatWrapping;
    texture.name=source.name||'Tenues du public';texture.needsUpdate=true;
    parser.associations.set(texture,{textures:index});resolve(texture);
   };image.onerror=()=>reject(Error('Les textures du public ne peuvent pas être décodées.'));
   image.src='data:'+(source.mimeType||'image/png')+';base64,'+base64(data);
  });
 }}));
 return loader.parseAsync(buffer,'');
}
export function loadDanceModel(path){const bytes=embeddedBytes(path);return bytes?parseEmbeddedGlb(bytes):new GLTFLoader().loadAsync(path);}
