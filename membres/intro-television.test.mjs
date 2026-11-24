import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {compactWhiteRoom} from '../scripts/build-intro-original-assets.mjs';

const original=Buffer.concat(Array.from({length:31},(_,i)=>readFileSync(new URL('../assets-source/intro-original/white/'+String(i).padStart(3,'0')+'.bin',import.meta.url))));
const compact=compactWhiteRoom(original);
const n=compact.readUInt32LE(12),description=JSON.parse(compact.subarray(20,20+n));
// Texture decoding needs a browser. Geometry and its original transforms remain
// exact for this center-of-screen occlusion regression.
const geometryDescription=structuredClone(description);
geometryDescription.materials=geometryDescription.materials.map(m=>({name:m.name,doubleSided:true,pbrMetallicRoughness:{baseColorFactor:[1,1,1,1]}}));
const raw=Buffer.from(JSON.stringify(geometryDescription)),size=(raw.length+3)&~3;
const bytes=Buffer.alloc(20+size+compact.length-20-n,32);
compact.copy(bytes,0,0,20);bytes.writeUInt32LE(bytes.length,8);bytes.writeUInt32LE(size,12);raw.copy(bytes,20);compact.copy(bytes,20+size,20+n);
const room=(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;
function findChild(parent,pattern){let found;parent.traverse(o=>{if(!found&&pattern.test(o.name))found=o;});return found;}
const source=readFileSync(new URL('./intro-cinema.js',import.meta.url),'utf8');
const code=source.slice(source.indexOf('function attachOriginalTVScreen('),source.indexOf('function prepareFilm('));
const attachScreen=new Function('findChild',code+'\nreturn attachOriginalTVScreen;')(findChild);
const television=findChild(room,/^TV_284$/);
const display=findChild(room,/^TV[\s_]*Screen/i);
const bezel=findChild(television,/^Screen_LowB/i);
const initialBounds=new T.Box3().setFromObject(display);
display.visible=false;
const screen=attachScreen(room,television);
room.updateMatrixWorld(true);

test('retain exactly one original television display and its complete four-corner UV map',()=>{
 assert.equal(description.nodes.filter(n=>/^TV Screen(?:[.\s_]|$)/i.test(n.name||'')).length,1);
 assert.equal(display.parent,television);assert.equal(display.visible,true);
 const actual=new T.Box3().setFromObject(screen);
 assert.ok(actual.min.distanceTo(initialBounds.min)<1e-7);
 assert.ok(actual.max.distanceTo(initialBounds.max)<1e-7);
 assert.equal(screen.geometry.index.count,6);
 assert.deepEqual(Array.from(screen.geometry.attributes.uv.array),[0,0,1,0,0,1,1,1]);
});

test('original display is first visible surface through the television center at production camera distances',()=>{
 const center=new T.Box3().setFromObject(screen).getCenter(new T.Vector3());
 const tvBounds=new T.Box3().setFromObject(television),size=tvBounds.getSize(new T.Vector3());
 const towards=new T.Vector3(0,tvBounds.getCenter(new T.Vector3()).y,0).sub(tvBounds.getCenter(new T.Vector3()));towards.y=0;towards.normalize();
 const visibleHits=ray=>ray.intersectObject(room,true).filter(hit=>{for(let o=hit.object;o;o=o.parent)if(!o.visible)return false;return true;});
 for(const aspect of [.45,1,1.78])for(const push of [0,.5,1]){
  const htan=Math.tan(23*Math.PI/180)*aspect;
  for(const distance of [Math.max(.95,size.x*.58/htan)*(1-.13*push),.12]){
   const eye=center.clone().addScaledVector(towards,distance);eye.y+=.03;eye.x+=.045*(1-push);
   const ray=new T.Raycaster(eye,center.clone().sub(eye).normalize());
   assert.equal(visibleHits(ray)[0]?.object,screen,'A case panel or bezel must not cover the display center');
   assert.equal(ray.intersectObject(bezel,true).length,0,'The named Screen_LowB is a hollow bezel, not the image surface');
  }
 }
});

test('the retained display follows the original television visibility',()=>{
 television.visible=false;
 let visible=true;for(let o=screen;o;o=o.parent)visible&&=o.visible;
 assert.equal(visible,false);
 television.visible=true;
});
