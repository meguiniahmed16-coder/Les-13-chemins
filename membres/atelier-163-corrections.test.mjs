import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {prepareWardrobe,prepareNeck} from './atelier-163-corrections.js';

function fixture(){
 const scene=new T.Group(),root=new T.Group();scene.add(root);const bone=new T.Bone();root.add(bone);const skeleton=new T.Skeleton([bone]);
 const make=(n,idx)=>{const g=new T.BufferGeometry(),p=new Float32Array(n*3),normals=new Float32Array(n*3),weights=new Float32Array(n*4);for(let i=0;i<n;i++){p[i*3]=Math.cos(i);p[i*3+1]=Math.floor(i/193)*.005;normals[i*3]=1;weights[i*4]=1;}g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('normal',new T.BufferAttribute(normals,3));g.setAttribute('skinIndex',new T.Uint16BufferAttribute(new Uint16Array(n*4),4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));g.setIndex(idx);const mesh=new T.SkinnedMesh(g,new T.MeshStandardMaterial());root.add(mesh);scene.updateMatrixWorld(true);mesh.bind(skeleton);return mesh;};
 const body=make(6,[0,1,2,3,4,5]),cloth=make(3,[0,1,2]),neck=make(2509,[0,1,193,1,194,193]),head=make(3,[0,1,2]),jaw=make(3,[0,1,2]),lining=make(3,[0,1,2]);lining.removeFromParent();
 const objects=new Map([[0,body],[14,cloth],[13,neck],[12,head],[1,jaw]]);
 const covered=new T.Uint16BufferAttribute([0,1,2],1),defs=Array.from({length:17},()=>({primitives:[{attributes:{POSITION:0}}]}));defs[15].name='Corps V27 · peau visible';defs[15].primitives[0].indices=99;defs[16].name='Sous-couche textile blanche · pantalon';
 const parser={json:{meshes:defs,nodes:[...objects.keys()].map(mesh=>({mesh}))},getDependency:async(type,index)=>type==='node'?objects.get([...objects.keys()][index]):type==='mesh'?lining:covered};
 return {scene,parser,body,cloth,neck,covered};
}
test('le corps et ses poids originaux sont préservés et l’index intégral revient exactement',async()=>{const f=fixture(),full=f.body.geometry.index,skeleton=f.body.skeleton,weights=f.body.geometry.attributes.skinWeight;const w=await prepareWardrobe(f);w.setDressed(true);assert.equal(f.body.geometry.index,f.covered);assert.equal(f.body.visible,true);assert.equal(f.cloth.visible,true);assert.equal(w.lining.visible,true);w.setDressed(false);assert.equal(f.body.geometry.index,full);assert.equal(f.body.visible,true);assert.equal(f.cloth.visible,false);assert.equal(w.lining.visible,false);assert.equal(f.body.skeleton,skeleton);assert.equal(f.body.geometry.attributes.skinWeight,weights);w.setDressed(true);assert.equal(f.body.geometry.index,f.covered);});
test('les réglages sont réversibles et ne touchent pas aux poids du cou',async()=>{const f=fixture(),w=await prepareWardrobe(f),p=f.cloth.geometry.attributes.position,base=p.array.slice();w.ease(3);assert.notDeepEqual(p.array,base);w.ease(0);assert.deepEqual(p.array,base);const neck=f.neck.geometry.attributes.position,original=neck.array.slice(),weight=f.neck.geometry.attributes.skinWeight;const correct=prepareNeck(w);correct(1);assert.deepEqual(neck.array.slice(0,193*3),original.slice(0,193*3));assert.deepEqual(neck.array.slice(-193*3),original.slice(-193*3));assert.equal(f.neck.geometry.attributes.skinWeight,weight);correct(0);assert.deepEqual(neck.array,original);});
