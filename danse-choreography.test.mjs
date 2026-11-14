import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as T from 'three';import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {dancePhrase,prepareDanceRig,poseDanceRig} from './danse-choreography.js';import {BEAT} from './danse-core.js';
async function rig(file){const b=fs.readFileSync(new URL(file,import.meta.url));const gltf=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');return prepareDanceRig(gltf.scene);}
test('Thirty-two count choreography always keeps a supporting foot on the floor',()=>{
 for(let t=0;t<32*BEAT;t+=1/120){const p=dancePhrase(t);assert.ok(p.feet.some(f=>f.contact&&f.lift===0));assert.ok(p.feet.every(f=>f.lift<=.0551&&f.lift>=0));}
});
for(const [name,file]of [['male','danse-quaternius-hero.glb'],['female','assets/danse/quaternius-superhero-female.glb']]){
 test(name+' original rig keeps grounded ankles and valid joint lengths throughout the phrase',async()=>{
  const r=await rig(file);const initial=new Map([...r.feet].map(([s,p])=>[s,p.clone()]));
  const lengths=[];for(const side of ['l','r'])for(const[a,b]of [['thigh_','calf_'],['calf_','foot_'],['upperarm_','lowerarm_'],['lowerarm_','hand_']]){const x=r.bones.get(a+side),y=r.bones.get(b+side);lengths.push([x,y,x.getWorldPosition(new T.Vector3()).distanceTo(y.getWorldPosition(new T.Vector3()))]);}
  for(let t=0;t<32*BEAT;t+=1/30){const p=poseDanceRig(r,t);for(const [side,i]of [['r',0],['l',1]]){
   const foot=r.bones.get('foot_'+side).getWorldPosition(new T.Vector3());
   assert.ok(Math.abs(foot.y-initial.get(side).y-p.feet[i].lift)<.003, 'foot floor target '+side+' at '+t);
   for(const v of foot)assert.ok(Number.isFinite(v));
  }for(const[a,b,l]of lengths)assert.ok(Math.abs(a.getWorldPosition(new T.Vector3()).distanceTo(b.getWorldPosition(new T.Vector3()))-l)<.0001);}
 });
}
test('Phrase loops without a visible position jump',()=>{const a=dancePhrase(32*BEAT-1e-5),b=dancePhrase(32*BEAT+1e-5);for(let i=0;i<2;i++)for(let j=0;j<3;j++)assert.ok(Math.abs(a.hands[i][j]-b.hands[i][j])<.001);assert.ok(Math.abs(a.sway-b.sway)<.001);});
