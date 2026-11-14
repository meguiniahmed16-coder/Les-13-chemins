import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createPrisonYoYo,yoyoMotion} from './prison-3d-yoyo.js';

test('The actual plastic and its contents clear both bars throughout a worst-case pull',()=>{
 const prop=createPrisonYoYo();
 // A hook may be caught at either end of the full 29 mm free oscillation.
 for(const part of [1,2])for(const offset of [-.029,0,.029]){
  const center=part===1?-.105:.105;
  for(let step=0;step<=120;step++){
   const pull=step/120;
   prop.root.position.set(center+offset,1.86,-1.91+pull*.72);
   prop.update({time:step/60,pull,hooked:true,part});
   prop.root.updateMatrixWorld(true);
   const actual=new T.Box3().setFromObject(prop.bag);
   if(actual.max.z>=-1.683&&actual.min.z<=-1.647){
    assert.ok(actual.min.x>center-.087,`Plastic crosses left bar: ${part}, ${offset}, ${pull}`);
    assert.ok(actual.max.x<center+.087,`Plastic crosses right bar: ${part}, ${offset}, ${pull}`);
    assert.ok(actual.min.y>.97,'The loaded bag also clears the window sill');
   }
  }
 }
});

test('The cloth keeps its upper attachment while the lower end is drawn indoors',()=>{
 const prop=createPrisonYoYo();
 for(const part of [1,2])for(const pull of [0,.3,.7,1]){
  prop.root.position.set(.013,1.86,-1.91+pull*.72);
  prop.update({time:4,pull,hooked:true,part});prop.root.updateMatrixWorld(true);
  const average=new T.Vector3();let count=0;
  for(const strand of prop.cord.children.filter(o=>o.isMesh)){
   const p=strand.geometry.attributes.position;
   for(let i=p.count-6;i<p.count;i++){average.add(strand.localToWorld(new T.Vector3().fromBufferAttribute(p,i)));count++;}
  }
  average.multiplyScalar(1/count);
  assert.ok(average.distanceTo(new T.Vector3(part===2?.105:-.105,3.55,-1.91))<1e-6,
   'Pulling must not carry the upper rope attachment along with the bag');
 }
});

test('The visible bag has two open handles, translucent creased skins and finite lightweight geometry',()=>{
 const prop=createPrisonYoYo();prop.update({time:12,pull:.15});
 const handles=[],skins=[];let triangles=0;
 prop.root.traverse(o=>{
  if(o.name==='AnsePlastiqueOuverte')handles.push(o);
  if(o.name==='FilmPlastiquePlisse')skins.push(o);
  if(!o.isMesh)return;
  triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;
  for(const attribute of ['position','normal'])for(const n of o.geometry.attributes[attribute]?.array||[])
   assert.ok(Number.isFinite(n),'Every animated vertex and normal stays finite');
 });
 assert.equal(handles.length,2);assert.equal(skins.length,2);
 assert.ok(skins.every(o=>o.material.transparent&&o.material.opacity<.5));
 assert.ok(triangles<7000,`The animated prop stays small: ${triangles} triangles`);
 const body=new T.Box3().setFromObject(prop.bag),packet=new T.Box3().setFromObject(prop.packet);
 assert.ok(body.containsBox(packet),'The contents remain inside the bag silhouette');
 assert.ok(Math.abs(yoyoMotion(1,0).swing)>.04,'The free sway is visibly larger');
 assert.equal(yoyoMotion(1,.3).swing,0,'Swing settles before the bar crossing');
});
