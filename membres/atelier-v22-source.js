export const V22_ASSETS=Object.freeze({
 m:{model:'ahmed',gzipBytes:33045109,gzipSHA:'6e3b8896f4531127b5a49bca6e64af56df97c3c9cf18b9898b10c76257076a43',glbBytes:71501212,glbSHA:'048c22f90b920fdede8a66f5ee2ed5ff162f2157b41d3c4e58e7779e622f6d4e'},
 f:{model:'marianne',gzipBytes:35943147,gzipSHA:'9e388e29f4f6fbb05fa4e262ad40936fbf4d60a0a27980775a85fbaa09facc11',glbBytes:75909292,glbSHA:'a7b46ad8ae0e84278bb4b83b3ad13f7410dd69c44980f9b2406c9fe32402a1db'}
});
export const JOINT_ORDER=['bassin','tete','brasd','avantbrasd','maind','brasg','avantbrasg','maing','cuissed','jambed','piedd','cuisseg','jambeg','piedg','thorax'];
const digest=async buffer=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),b=>b.toString(16).padStart(2,'0')).join('');
export async function decodeV22(loader,packed,config){
 if(packed.byteLength!==config.gzipBytes||await digest(packed)!==config.gzipSHA)throw Error('Archive de référence incomplète ou altérée.');
 const raw=await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 if(raw.byteLength!==config.glbBytes||await digest(raw)!==config.glbSHA)throw Error('GLB de référence incomplet ou altéré.');
 return loader.parseAsync(raw,'');
}