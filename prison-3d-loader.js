// Abort a stalled transfer and reject an incomplete model before parsing the rig.
export async function loadActorBytes(url,{onProgress=()=>{},timeoutMs=30000,fetchImpl=fetch}={}){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const response=await fetchImpl(url,{signal:controller.signal,cache:'no-cache'});
  if(!response.ok)throw new Error('Le fichier du personnage est indisponible (HTTP '+response.status+').');
  let buffer;
  const total=Number(response.headers.get('content-length'))||0;
  if(response.body?.getReader){
   const reader=response.body.getReader(),chunks=[];let received=0;
   for(;;){
    const {done,value}=await reader.read();if(done)break;
    chunks.push(value);received+=value.byteLength;
    onProgress(total?Math.min(.99,received/total):null);
   }
   const bytes=new Uint8Array(received);let offset=0;
   for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
   buffer=bytes.buffer;
  }else buffer=await response.arrayBuffer();
  const view=new DataView(buffer);
  if(buffer.byteLength<20||view.getUint32(0,true)!==0x46546c67||
     view.getUint32(4,true)!==2||view.getUint32(8,true)!==buffer.byteLength)
   throw new Error('Le fichier du personnage est incomplet. Relance le chargement.');
  onProgress(1);return buffer;
 }catch(error){
  if(controller.signal.aborted)throw new Error('Le téléchargement du personnage a pris trop de temps. Relance le chargement.');
  throw error;
 }finally{clearTimeout(timer);}
}
