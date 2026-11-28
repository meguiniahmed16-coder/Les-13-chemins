import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from 'three';
import {referenceArmature} from './atelier-rig-makehuman.js';
const read=async name=>JSON.parse(await readFile(new URL('./rig-reference/'+name,import.meta.url),'utf8'));
test('assemble the 163 actual MakeHuman bones and native vertex weights',async()=>{
 const [ref,weights]=await Promise.all([read('makehuman-default.json'),read('makehuman-default-weights.json')]);
 const a=referenceArmature(ref,weights);
 assert.equal(a.skeleton.bones.length,163);assert.equal(a.root.children.length,1);assert.equal(a.skinWeight.count,19158);
 for(const [child,parent] of [['neck01','spine01'],['neck02','neck01'],['neck03','neck02'],['head','neck03'],['jaw','head'],['finger1-2.L','finger1-1.L'],['toe2-3.R','toe2-2.R']])assert.equal(a.objects.get(child).parent.name,parent);
 for(let i=0;i<a.skinWeight.count;i++){let sum=0;for(let j=0;j<4;j++){sum+=a.skinWeight.getComponent(i,j);assert.ok(a.skinIndex.getComponent(i,j)<163);}assert.ok(Math.abs(sum-1)<1e-6);}
 for(let i=0;i<a.skeleton.bones.length;i++){const bone=a.skeleton.bones[i];assert.ok(bone.matrixWorld.elements.every(Number.isFinite));const identity=bone.matrixWorld.clone().multiply(a.skeleton.boneInverses[i]);assert.ok(identity.elements.every((v,j)=>Math.abs(v-(j%5===0?1:0))<1e-5));}
 const tip=a.objects.get('finger2-3.L'),before=tip.getWorldPosition(new T.Vector3());a.objects.get('finger2-1.L').rotateX(.35);a.root.updateMatrixWorld(true);assert.ok(tip.getWorldPosition(new T.Vector3()).distanceTo(before)>1e-5);
 assert.throws(()=>referenceArmature(ref,weights,{positions:new Float32Array(100998*3),topology:'scan-importe'}));
});
