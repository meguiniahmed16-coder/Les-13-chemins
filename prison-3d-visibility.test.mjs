import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as Three from 'three';
import * as rules from './yoyo-core.js';

// Exercise the real scene and camera on the CPU. This checks geometric
// visibility; it does not pretend to validate a browser's WebGL support.
function constructScene(width, height) {
 const source=readFileSync(new URL('./prison-3d-prototype-app.js',import.meta.url),'utf8')
  .replace(/^import\s[\s\S]*?;\s*/gm,'')
  .replace(/\bexport\s+(?=(?:const|let|function|class)\b)/g,'');
 const elements=new Map();
 function element(id) {
  if(!elements.has(id))elements.set(id,{
   clientWidth:width,clientHeight:height,dataset:{},style:{},
   addEventListener(){},removeEventListener(){},setAttribute(){},removeAttribute(){},
   querySelector(selector){return element(id+' '+selector);},
  });
  return elements.get(id);
 }
 const document={baseURI:'https://example.test/prison-3d-prototype.html',getElementById:element,addEventListener(){}};
 const window={devicePixelRatio:1,addEventListener(){},matchMedia:()=>({matches:false})};
 class Renderer {
  shadowMap={};
  setPixelRatio(){}
  setSize(){}
  render(){}
 }
 const bindings={
  T:{...Three,WebGLRenderer:Renderer},
  GLTFLoader:class {},
  // Keep the independent actor download pending. No network, real timers or
  // rendering loop is needed to inspect the scene constructed by the app.
  loadActorBytes:()=>new Promise(()=>{}),
  ...rules,document,window,performance,
  requestAnimationFrame:()=>0,cancelAnimationFrame(){},
 };
 const run=new Function(...Object.keys(bindings),source+
  '\nreturn {scene,camera,setCamera,updateCutaway};');
 const app=run(...Object.values(bindings));
 app.camera.aspect=width/height;
 app.camera.updateProjectionMatrix();
 app.setCamera();
 app.camera.updateMatrixWorld(true);
 app.scene.updateMatrixWorld(true);
 return app;
}

function belongsTo(object,ancestor) {
 for(let item=object;item;item=item.parent)if(item===ancestor)return true;
 return false;
}

function isVisible(object) {
 for(let item=object;item;item=item.parent)if(!item.visible)return false;
 return true;
}

function visibleHits(ray,scene) {
 // Raycaster intentionally ignores Object3D.visible, whereas a renderer
 // hides descendants of an invisible group. Apply that same visibility rule.
 return ray.intersectObject(scene,true).filter(hit=>isVisible(hit.object));
}

for(const [label,width,height]of[['portrait',390,447],['landscape',1000,625]]) {
 test('The front door and its fittings do not mask the '+label+' cutaway',()=>{
  const {scene,camera}=constructScene(width,height);
  const frontWall=scene.getObjectByName('ParoiAvantVueEnCoupe');
  const door=scene.getObjectByName('PorteCellule');
  assert.ok(frontWall?.isGroup,'The camera-facing partition is one cutaway group');
  assert.ok(door?.isMesh&&belongsTo(door,frontWall),'The closed door remains modelled');
  assert.ok(frontWall.children.filter(item=>item.isMesh).length>=3,
   'The panel, hatch and handle must all follow the cutaway');
  assert.equal(frontWall.visible,false,'An exterior view hides the front partition');

  const center=new Three.Raycaster();
  center.setFromCamera(new Three.Vector2(0,0),camera);
  const centerHits=visibleHits(center,scene);
  assert.ok(centerHits.every(hit=>!belongsTo(hit.object,frontWall)),
   'The central sightline must not stop at the door or its fittings');

  const actorTarget=new Three.Vector3(0,1.3,.6);
  const towardActor=actorTarget.clone().sub(camera.position);
  const actorRay=new Three.Raycaster(camera.position,towardActor.clone().normalize(),0,towardActor.length());
  assert.ok(visibleHits(actorRay,scene).every(hit=>!belongsTo(hit.object,frontWall)),
   'The sightline to the standing character must remain free of the front partition');

  // Check the complete view, including the edge regions where the hatch and
  // handle could remain visible if they were left outside the cutaway group.
  let visibleSceneSamples=0;
  for(let y=-.9;y<=.91;y+=.15)for(let x=-.9;x<=.91;x+=.15){
   const ray=new Three.Raycaster();
   ray.setFromCamera(new Three.Vector2(x,y),camera);
   const hits=visibleHits(ray,scene);
   if(hits.length)visibleSceneSamples++;
   assert.ok(hits.every(hit=>!belongsTo(hit.object,frontWall)),
    'No front-door mesh may cover the cutaway at screen coordinate '+x+','+y);
  }
  assert.ok(visibleSceneSamples>0,'The cell remains visible around the window opening');
 });
}

test('The cutaway preserves a closed, visible door for an interior camera',()=>{
 const {scene,camera,setCamera,updateCutaway}=constructScene(390,447);
 const frontWall=scene.getObjectByName('ParoiAvantVueEnCoupe');
 const door=scene.getObjectByName('PorteCellule');
 const closedBounds=new Three.Box3().setFromObject(door);
 assert.ok(closedBounds.getSize(new Three.Vector3()).z<.1,
  'The door stays closed on the front plane instead of being swung into the corridor');

 camera.position.set(0,1.3,.3);
 updateCutaway();
 assert.equal(frontWall.visible,true);
 const target=closedBounds.getCenter(new Three.Vector3());
 const ray=new Three.Raycaster(camera.position,target.sub(camera.position).normalize());
 assert.ok(visibleHits(ray,scene).some(hit=>hit.object===door),
  'An interior camera can see the preserved closed door');

 setCamera();
 assert.equal(frontWall.visible,false,'Returning to the exterior restores the cutaway');
 assert.deepEqual(new Three.Box3().setFromObject(door),closedBounds,
  'Changing viewpoint must not move or rotate the physical door');
});
