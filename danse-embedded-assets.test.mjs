import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as T from 'three';import {embeddedBytes,loadDanceModel} from './danse-embedded-assets.js';
import {loadQuaterniusDancer} from './danse-quaternius.js';import {loadStudioCast} from './danse-studio-cast.js';import {StudioMusic} from './danse-music.js';
// Pure Node image stub validates embedded PNG dimensions; pixel decoding was
// separately checked with the canvas renderer in the local QA run.
class Image {set src(uri){const bytes=Buffer.from(uri.split(',')[1],'base64');assert.equal(bytes.toString('ascii',1,4),'PNG');this.width=bytes.readUInt32BE(16);this.height=bytes.readUInt32BE(20);queueMicrotask(()=>this.onload());}}
test('All embedded models, audience textures and music load with fetch completely disabled',async()=>{
 const oldFetch=globalThis.fetch,oldImage=globalThis.Image,oldAssets=globalThis.DANSE_ASSETS;let calls=0;
 try{
  globalThis.fetch=()=>{calls++;throw Error('Local content:// test: fetch forbidden');};globalThis.Image=Image;
  globalThis.DANSE_ASSETS=Object.fromEntries(['danse-quaternius-hero.glb','assets/danse/quaternius-superhero-female.glb','assets/danse/funky-chunk-loop.mp3','assets/danse/ovation.mp3'].map(f=>[f,'data:application/octet-stream;base64,'+fs.readFileSync(new URL(f,import.meta.url)).toString('base64')]));
  const scene=new T.Scene();const [hero,female]=await Promise.all([loadQuaterniusDancer(scene,new T.Vector3()),loadDanceModel('assets/danse/quaternius-superhero-female.glb')]);
  assert.ok(hero.triangles>3000);assert.ok(hero.bones.Head.isBone);assert.ok(female.scene.getObjectByName('Superhero_Female'));
  const stage={scene,canvas:{dataset:{}},candidates:Array.from({length:5},()=>({group:new T.Group()})),public:Array.from({length:16},()=>({group:new T.Group()}))};
  const cast=await loadStudioCast(stage);assert.equal(cast.length,21);let textures=0;
  for(const a of cast)a.root.traverse(o=>{if(o.isMesh&&o.material.map){textures++;assert.ok(o.material.map.image.width>0);}});
  assert.ok(textures>=21);const music=new StudioMusic();assert.ok((await music.pending).byteLength>100000);assert.equal(calls,0);
 }finally{globalThis.fetch=oldFetch;globalThis.Image=oldImage;globalThis.DANSE_ASSETS=oldAssets;}
});
