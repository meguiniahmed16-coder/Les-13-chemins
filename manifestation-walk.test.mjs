import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from 'three';
import {PARIS_NODES as nodes,PARIS_STREETS as streets,newWalk,streetChoices,chooseStreet,advanceWalk,restoreWalk,mapMarkup} from './manifestation-walk.js';
import {createRepublicMonument} from './manifestation-monument.js';
import {createParisCity} from './manifestation-paris.js';
import {newRun,advance,STATUE} from './manifestation-core.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createCrowdMotion} from './manifestation-crowd-motion.js';
import {poseCitizen} from './catalogne-motion.js';
const forward={x:0,y:1};
function reach(w,id){assert.ok(chooseStreet(w,id));for(let i=0;i<2000&&!w.waiting;i++)advanceWalk(w,.06,forward);assert.ok(w.waiting);}

test('Every Paris junction is connected, and the route has genuine return loops',()=>{
 const seen=new Set(['repub']),queue=['repub'];while(queue.length){for(const e of streetChoices(queue.shift())){assert.ok(nodes[e.to]);if(!seen.has(e.to)){seen.add(e.to);queue.push(e.to);}}}
 assert.equal(seen.size,Object.keys(nodes).length);assert.ok(streets.length>=seen.size);
 assert.deepEqual(streetChoices('meeting').map(e=>e.name),['Boulevard des Filles-du-Calvaire','Boulevard Beaumarchais','Rue du Pont-aux-Choux']);
 assert.ok(streetChoices('bastille').some(e=>e.name==='Rue Saint-Antoine'));
});
test('A direction can only be selected at a junction and on an adjacent street',()=>{
 const w=newWalk();assert.equal(chooseStreet(w,'antoine'),false);assert.ok(chooseStreet(w,'pont'));assert.equal(chooseStreet(w,'calvaire'),false);
 assert.equal(w.x,0);assert.equal(w.z,110);advanceWalk(w,.1,forward);assert.ok(w.x<0);assert.ok(w.z>110);
});
test('Repeated circuits keep a finite state and never end the promenade',()=>{
 const w=newWalk();for(let loop=0;loop<50;loop++){for(const id of ['pont','turenne-c','claude','beaumarchais-n'])reach(w,id);assert.equal(w.node,'meeting');}
 const circuit=['pont','turenne-c','claude','beaumarchais-n'].map(id=>streets.find(e=>e.id===id)).reduce((sum,e)=>sum+Math.hypot(nodes[e.a].x-nodes[e.b].x,nodes[e.a].z-nodes[e.b].z),0);
 assert.equal(w.visited.length,4);assert.ok(Math.abs(w.distance-50*circuit)<4);assert.ok(Number.isFinite(w.distance));assert.equal(w.finished,undefined);
});
test('Lateral movement stays inside the road; the next junction is reached exactly',()=>{
 const w=newWalk();chooseStreet(w,'pont');for(let i=0;i<120;i++)advanceWalk(w,.06,{x:1,y:1});
 const a=nodes.meeting,b=nodes.tpont,dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),perp=((w.x-a.x)*dz-(w.z-a.z)*dx)/len;
 assert.ok(Math.abs(perp)<=9/2-1.2+.001);
 for(let i=0;i<2000&&!w.waiting;i++)advanceWalk(w,.06,forward);
 assert.equal(w.x,b.x);assert.equal(w.z,b.z);assert.equal(w.offset,0);
});
test('Retreat returns to the previous junction without being trapped',()=>{
 const w=newWalk();chooseStreet(w,'pont');for(let i=0;i<30;i++)advanceWalk(w,.1,forward);
 for(let i=0;i<100&&!w.waiting;i++)advanceWalk(w,.1,{y:-1});assert.equal(w.waiting,true);assert.equal(w.node,'meeting');assert.equal(w.x,0);assert.equal(w.z,110);
 assert.ok(chooseStreet(w,'beaumarchais-n'));
});
test('Save/resume recomputes position on the street and rejects broken data',()=>{
 const w=newWalk();chooseStreet(w,'pont');for(let i=0;i<24;i++)advanceWalk(w,.1,forward);
 const saved=restoreWalk(JSON.parse(JSON.stringify(w)));assert.ok(saved);assert.ok(Math.abs(saved.x-w.x)<.0001);assert.equal(saved.edge,w.edge);
 const normalized=restoreWalk({...w,x:89,z:240});assert.equal(normalized.x,w.x);assert.equal(normalized.z,w.z);
 for(const bad of [null,{}, {...w,version:99},{...w,x:NaN},{...w,edge:'missing'},{...w,to:'repub'},{...w,progress:-1},{...w,waiting:'false'}])assert.equal(restoreWalk(bad),null);
 const waiting=restoreWalk({...newWalk(),x:50,z:80,visited:['meeting','meeting','unknown']});assert.equal(waiting.x,0);assert.equal(waiting.z,110);assert.deepEqual(waiting.visited,['meeting']);
});
test('The optional crowd trail is bounded and invalid breadcrumbs are discarded',()=>{
 const w=newWalk();w.breadcrumbs=Array.from({length:500},(_,i)=>({x:0,z:110-(499-i)*.1,d:i,heading:0}));
 const valid=restoreWalk(w);assert.equal(valid.breadcrumbs.length,180);
 assert.equal(restoreWalk({...w,breadcrumbs:[{x:0,z:0,d:0,heading:0},{x:Infinity,z:1,d:1,heading:0}]}).breadcrumbs,undefined);
});
test('Promenade cannot mint additional story points or a second victory',()=>{
 const story=newRun();story.phase=3;story.finished=true;story.steps=[1,2,3];story.events=[];
 const w=newWalk();for(let k=0;k<4;k++){reach(w,'pont');reach(w,'pont');advance(story,.1,forward);}
 assert.deepEqual(story.steps,[1,2,3]);assert.deepEqual(story.events,[]);
});
test('The statue collider cannot block the first street where no statue exists',()=>{
 const r=newRun();r.x=4.1;for(let i=0;i<40;i++)advance(r,.1,forward);assert.ok(r.z>11,'The flag can be approached directly');
});
test('The same adult skeleton as Plaza Catalunya supplies the required animated bones',()=>{
 const b=readFileSync(new URL('./assets/marmousets/adult.glb',import.meta.url));const gltf=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());const names=gltf.nodes.map(n=>n.name);
 for(const name of ['head','spine_03','Thigh_L','Thigh_R','calf_l','calf_r'])assert.ok(names.includes(name),name);
});
test('Shared crowd poses reproduce the established walk and raised arm on the real skeleton',async()=>{
 const b=readFileSync(new URL('./assets/marmousets/adult.glb',import.meta.url)),length=b.readUInt32LE(12),gltf=JSON.parse(b.subarray(20,20+length).toString());
 // This is a skeletal test; texture decoding needs a browser and is irrelevant.
 for(const m of gltf.materials)delete m.pbrMetallicRoughness.baseColorTexture;delete gltf.images;delete gltf.textures;
 gltf.buffers[0].uri='data:application/octet-stream;base64,'+b.subarray(28+length).toString('base64');
 globalThis.ProgressEvent??=class ProgressEvent{constructor(type,init){this.type=type;Object.assign(this,init);}};
 const asset=await new GLTFLoader().parseAsync(JSON.stringify(gltf),'');const model=asset.scene,group=new T.Group();group.add(model);
 const h=1.79,box=new T.Box3().setFromObject(model),scale=h/box.getSize(new T.Vector3()).y;model.scale.multiplyScalar(scale);model.position.y-=box.min.y*scale;group.updateMatrixWorld(true);
 const bones={};model.traverse(b=>{if(b.isBone)bones[b.name]={bone:b,rest:b.quaternion.clone()};});const rig={group,model,h,bones},motion=createCrowdMotion(rig);
 for(const [moving,signal]of [[true,false],[true,true],[false,true]])for(const i of [0,6,12,18]){
  const time=i/24*motion.period;poseCitizen(rig,time,moving,signal);const expected=Object.fromEntries(Object.entries(bones).map(([name,b])=>[name,b.bone.quaternion.clone().normalize()]));
  motion.apply(rig,time,moving,signal);for(const [name,b]of Object.entries(bones)){assert.ok(b.bone.quaternion.angleTo(expected[name])<1e-6,name);assert.ok(Math.abs(b.bone.quaternion.length()-1)<1e-6);}
 }
});
test('The monument keeps its accessible landing and a bounded mobile mesh budget',()=>{
 const monument=createRepublicMonument(),bounds=new T.Box3().setFromObject(monument);let triangles=0;
 monument.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position;for(const n of p.array)assert.ok(Number.isFinite(n));triangles+=(m.geometry.index?.count||p.count)/3;});
 assert.ok(triangles<20000);assert.ok(bounds.max.y>16);assert.ok(bounds.max.x<=3.01);assert.ok(bounds.min.z<STATUE.footZ-STATUE.z);
 assert.equal(STATUE.topHeight,3.32);assert.ok(STATUE.exitX<STATUE.x-3.05,'Exit stays clear of the pedestal');
});
test('Connected city geometry and map build without external services',()=>{
 const city=createParisCity(),bounds=new T.Box3().setFromObject(city);assert.ok(bounds.max.z>nodes.bastille.z);assert.ok(bounds.min.x<nodes.tcal.x);
 let count=0;city.traverse(m=>{if(m.isMesh){count++;assert.ok(m.geometry.boundingSphere);assert.ok(Number.isFinite(m.geometry.boundingSphere.radius));}});assert.ok(count>0&&count<1800);
 const svg=mapMarkup(newWalk());for(const name of ['République','Bastille','LE MARAIS'])assert.ok(svg.includes(name));assert.equal((svg.match(/<path /g)||[]).length,streets.length);
});
