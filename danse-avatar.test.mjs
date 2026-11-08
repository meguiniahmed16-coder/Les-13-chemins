import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {QUATERNIUS_FILE,QUATERNIUS_BONES,poseQuaterniusDancer} from './danse-quaternius.js';

test('Prototype: the real Quaternius CC0 human is bundled and sufficiently light for mobile',()=>{
 const bytes=fs.readFileSync(new URL('./'+QUATERNIUS_FILE,import.meta.url));
 assert.equal(bytes.toString('ascii',0,4),'glTF');
 assert.equal(bytes.readUInt32LE(4),2);
 assert.ok(bytes.length<980000,'test avatar must not bring a massive download');
 const n=bytes.readUInt32LE(12);
 assert.equal(bytes.toString('ascii',16,20),'JSON');
 const gltf=JSON.parse(bytes.subarray(20,20+n).toString('utf8'));
 assert.equal(gltf.skins.length,1);
 assert.equal(gltf.skins[0].joints.length,65);
 assert.ok(gltf.meshes.length>=3);
 const named=new Set(gltf.nodes.map(x=>x.name));
 for(const key of QUATERNIUS_BONES)assert.ok(named.has(key),'missing anatomical bone '+key);
 assert.ok(gltf.meshes.some(x=>x.primitives.some(p=>gltf.accessors[p.attributes.POSITION].count>7000)));
 const licence=fs.readFileSync(new URL('./danse-quaternius-LICENSE.txt',import.meta.url),'utf8');
 assert.match(licence,/CC0 1\.0 Universal/);
 assert.match(licence,/quaternius\.com/);
 const build=fs.readFileSync(new URL('./build-public.mjs',import.meta.url),'utf8');
 assert.match(build,/'danse-quaternius-hero\.glb'/);
 assert.match(build,/'danse-quaternius-LICENSE\.txt'/);
 assert.match(build,/\['build-danse\.mjs'\]/,'no stale dance runtime in production');
});

test('Only the central protagonist is replaced; the four other dancers and game rules stay unchanged',()=>{
 const code=fs.readFileSync(new URL('./danse-scene.js',import.meta.url),'utf8');
 assert.match(code,/this\.hero=human\(\)/);
 assert.match(code,/loadQuaterniusDancer\(s,this\.hero\.group\.position\)/);
 assert.match(code,/this\.hero\.group\.visible=false/);
 assert.match(code,/this\.dancers=\[\]/);
 assert.match(code,/this\.dancers\.push\(h\)/);
 assert.match(code,/this\.featuredDancer/);
 assert.match(code,/poseQuaterniusDancer\(this\.featuredDancer/);
 assert.match(code,/this\.renderer\.isSoftware/,'fallback must remain available on low-end phones');
 const q=fs.readFileSync(new URL('./danse-quaternius.js',import.meta.url),'utf8');
 assert.match(q,/head\.add\(smile\)/,'smile must move with the head');
 assert.match(q,/new T\.ShapeGeometry\(curve,10/);
 assert.match(q,/SourireVisible/);
 assert.match(q,/new T\.Vector3\(0,1\.611,\.094\)/,'smile must touch the true head surface');
 assert.match(q,/cloneSkeleton\(gltf\.scene\)/);
 assert.match(q,/bones\[name\]\.quaternion\.copy\(q\)/,
 'animation must reset original skeletal pose each frame');
});

test('An articulated dancer can move and smile without accumulating deformations',()=>{
 const root=new T.Group(),bones={},rest={};
 for(const key of QUATERNIUS_BONES){
  const bone=new T.Bone();bone.name=key;
  root.add(bone);bones[key]=bone;rest[key]=bone.quaternion.clone();
 }
 const smile=new T.Group(),base=new T.Vector3(0,.04,.45);
 const actor={root,bones,rest,smile,basePosition:base};
 poseQuaterniusDancer(actor,1.2,'cross',1,false,base,0);
 const first=QUATERNIUS_BONES.map(k=>bones[k].quaternion.toArray());
 const smileFirst=smile.scale.x;
 poseQuaterniusDancer(actor,1.2,'cross',1,false,base,0);
 for(let i=0;i<QUATERNIUS_BONES.length;i++)
  first[i].forEach((n,j)=>assert.ok(Math.abs(n-bones[QUATERNIUS_BONES[i]].quaternion.toArray()[j])<1e-9));
 poseQuaterniusDancer(actor,1.7,'square',1,false,base,0);
 assert.notEqual(bones.upperarm_l.quaternion.toArray().join(','),first[QUATERNIUS_BONES.indexOf('upperarm_l')].join(','));
 poseQuaterniusDancer(actor,2.4,'circle',1,true,base,Math.PI);
 assert.ok(smile.scale.x>smileFirst,'winning should reveal a broader smile');
 assert.ok([root.position.x,root.position.y,root.position.z].every(Number.isFinite));
});
