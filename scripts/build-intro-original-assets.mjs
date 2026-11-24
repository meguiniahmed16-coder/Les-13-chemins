import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
// Original binary files are split into Git blobs for safe storage; verify exact bytes.
const resources=[
 {name:'white-room-original.glb',folder:'white',parts:31,size:48248884,sha256:'d2b3cf4018dfec5e793d3ee25d3b04cf1e7b07730adc86563e4b34240252f572'},
 {name:'dojo-original.glb',folder:'dojo',parts:17,size:12758208,sha256:'d2fc623a87f455ec9c4288cfaa6baac79025fd55bcb63de23cf6d08e867c96b0'}
];
export async function buildIntroOriginalAssets(root,output){
 const dest=join(output,'assets','intro-original');await mkdir(dest,{recursive:true});
 for(const item of resources){
  const buffers=[];
  for(let i=0;i<item.parts;i++)buffers.push(await readFile(join(root,'assets-source','intro-original',item.folder,String(i).padStart(3,'0')+'.bin')));
  const data=Buffer.concat(buffers),checksum=createHash('sha256').update(data).digest('hex');
  if(data.length!==item.size||checksum!==item.sha256)throw Error('GLB original '+item.name+' incomplet ou altéré.');
  await writeFile(join(dest,item.name),data);
  console.log('GLB original vérifié : '+item.name+' ('+data.length+' octets)');
 }
}
