// Exact original white-kimono archive; compressed GLB slices, not executable files.
export const CHUNK=2097152, ZIP_BYTES=129182766;
export const models=Object.freeze({
 m:{name:'Ahmed',offset:65,bytes:60542074,rawBytes:123306708,sha:'ac56faaaec680647e643888eb5e8c061b680abbb0ca956f3d4e61dbddf1d7ab8',rawSha:'e4a6f83a37ee7502f3ea2de86878169d9f561671bd4b5daa50bb031f20d53891'},
 f:{name:'Marianne',offset:60542207,bytes:63336278,rawBytes:127093804,sha:'13a005fb1f2b9ab879642132ea10f1fe4d0852a6df8c1606c96e2b992bd78d7b',rawSha:'a22f71f985894ef79606dc01a4361ab1b404717660fb2429d7a3206436c456e3'}
});
export function spec(id,index){const m=models[id];if(!m||!Number.isInteger(index)||index<0||index>=Math.ceil(m.bytes/CHUNK))return null;return {key:'atelier-163-kimono-original-20261128/'+id+'/'+String(index).padStart(3,'0'),bytes:Math.min(CHUNK,m.bytes-index*CHUNK)};}
export const digest=async b=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)),x=>x.toString(16).padStart(2,'0')).join('');
