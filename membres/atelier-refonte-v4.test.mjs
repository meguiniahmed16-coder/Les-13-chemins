import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {installRefonte,applyRefonteNeck,applySkinNormals} from './atelier-refonte-v4.js';
const near=(a,b,e=1e-6)=>assert.ok(Math.abs(a-b)<e,a+' vs '+b);
function fixture(){
 const n=193,rows=33,position=[],normal=[],color=[];
 for(let j=0;j<rows;j++)for(let i=0;i<n;i++){const t=j/(rows-1),theta=i/(n-1)*Math.PI*2,rx=.044-.006*t,rz=.041-.004*t;position.push(Math.cos(theta)*rx,t*.033,Math.sin(theta)*rz+.014*t);normal.push(Math.cos(theta),0,Math.sin(theta));color.push(.7,.4,.3);}
 const recipe={n,rows,position:new Float32Array(position),normal:new Float32Array(normal),color:new Float32Array(color),cloth:new Float32Array(9),anchor:new T.Vector3(0,.05,0),shift:new T.Vector3(0,-.005,-.035),scale:.97};
 const garment=new T.Mesh(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute([0,0,0,1,0,0,0,1,0],3)));
 const a={head:new T.Group(),neck:new T.Mesh(new T.BoxGeometry()),garment,materials:new Map(),neckDelta:new T.Matrix4()};
 a.head.position.set(0,.17,0);a.head.scale.setScalar(.333);installRefonte(a,recipe);return {a,recipe};
}
test('reconstruction uses the measured short mesh and original head with an independent correction',()=>{
 const {a,recipe:r}=fixture();assert.equal(a.neck.geometry.attributes.position.count,193*33);assert.equal(a.neck.geometry.index.count,192*32*6);assert.equal(a.neck.material.vertexColors,true);near(a.head.scale.x,.333*.97);near(a.head.position.y,.05+(.17-.05)*.97-.005);assert.equal(a.kimonoFit,r.cloth);
 const low=[],high=[];for(let i=0;i<r.n;i++){low.push(new T.Vector3().fromArray(r.position,i*3));high.push(new T.Vector3().fromArray(r.position,((r.rows-1)*r.n+i)*3));}
 applyRefonteNeck(a,{neckWidth:1,neckDepth:1},low,high);assert.deepEqual(a.neck.geometry.attributes.position.array,r.position);assert.deepEqual(a.neck.geometry.attributes.normal.array,r.normal);
 a.neckDelta.makeTranslation(0,-.01,.003);for(const p of high)p.applyMatrix4(a.neckDelta);applyRefonteNeck(a,{neckWidth:1,neckDepth:1},low,high);const p=a.neck.geometry.attributes.position;
 for(let i=0;i<r.n;i++){near(p.getY(i),low[i].y);near(p.getY((r.rows-1)*r.n+i),high[i].y);near(p.getZ((r.rows-1)*r.n+i),high[i].z);}
 for(let row=0;row<r.rows;row++){near(p.getX(row*r.n),p.getX(row*r.n+r.n-1));near(p.getY(row*r.n),p.getY(row*r.n+r.n-1));near(p.getZ(row*r.n),p.getZ(row*r.n+r.n-1));}
});

test('shared seam normals patch the real head and body meshes without changing other vertices',()=>{
 const mesh=n=>new T.Mesh(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(new Float32Array(n*3),3)).setAttribute('normal',new T.Float32BufferAttribute(Array.from({length:n*3},(_,i)=>i%3===1?1:0),3)));
 const body=mesh(3),head=new T.Group(),skin=mesh(4);skin.name='Visage_source';head.add(skin);
 applySkinNormals({body,head},[{count:3,indices:new Uint32Array([1]),normals:new Float32Array([0,0,1])},{count:4,indices:new Uint32Array([2]),normals:new Float32Array([1,0,0])}]);
 near(body.geometry.attributes.normal.getZ(1),1);near(body.geometry.attributes.normal.getY(0),1);near(skin.geometry.attributes.normal.getX(2),1);
 assert.throws(()=>applySkinNormals({body,head},[{count:5,indices:new Uint32Array([0]),normals:new Float32Array([1,0,0])}]));
});
