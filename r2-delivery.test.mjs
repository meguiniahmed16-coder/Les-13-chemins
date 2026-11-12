import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Vérification réelle depuis un runner GitHub Actions, avant tout basculement du site.
const manifest=JSON.parse(readFileSync(new URL('./migration/r2-videos-manifest.json',import.meta.url),'utf8'));
const base='https://treize-chemins-videos.meguiniahmed16.workers.dev/';
const options={signal:AbortSignal.timeout(30000),headers:{Origin:'https://tectonique-des-ames.com'}};

test('22 cinématiques Cloudflare R2 : HEAD + plage vidéo 206 + entête MP4', {timeout:210000}, async()=>{
  assert.equal(manifest.items.length,22);
  assert.equal(new Set(manifest.items.map(x=>x.objectKey)).size,22);
  const failures=[];
  for(let i=0;i<manifest.items.length;i+=4) {
    const group=manifest.items.slice(i,i+4);
    await Promise.all(group.map(async item=>{
      const uri=base+item.objectKey;
      try {
        const head=await fetch(uri,{method:'HEAD',...options});
        assert.equal(head.status,200,'HEAD '+item.id);
        assert.equal(head.headers.get('content-type'),'video/mp4',item.id+' MIME');
        assert.equal(head.headers.get('accept-ranges'),'bytes',item.id+' Accept-Ranges');
        assert.equal(head.headers.get('access-control-allow-origin'),'*',item.id+' CORS');
        const size=Number(head.headers.get('content-length'));
        assert.ok(Number.isSafeInteger(size)&&size>10000,item.id+' non empty video');
        const range=await fetch(uri,{headers:{...options.headers,Range:'bytes=0-31'},signal:AbortSignal.timeout(30000)});
        assert.equal(range.status,206,'GET Range '+item.id);
        assert.equal(range.headers.get('content-range'),`bytes 0-31/${size}`,item.id+' Content-Range');
        assert.equal(Number(range.headers.get('content-length')),32,item.id+' partial length');
        const bytes=new Uint8Array(await range.arrayBuffer());
        assert.equal(bytes.length,32,item.id+' received bytes');
        assert.equal(String.fromCharCode(...bytes.slice(4,8)),'ftyp',item.id+' MP4 box');
        console.log('OK',item.id,size,uri);
      } catch(error) {failures.push(item.id+': '+(error?.stack||error));}
    }));
  }
  assert.deepEqual(failures,[],failures.join('\n'));
});
