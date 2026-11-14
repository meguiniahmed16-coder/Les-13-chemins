// Same scene and camera when WebGL is unavailable; expands instancing only for this fallback.
import * as T from 'three';
import {SoftwareRenderer} from './a410-software.js';
export class ParkSoftwareRenderer extends SoftwareRenderer{
 constructor({canvas}){
  super({canvas});const renderScene=this.render,resize=this.setSize,inst=new T.Matrix4(),colors=new Map(),frustum=new T.Frustum(),projection=new T.Matrix4(),sphere=new T.Sphere(new T.Vector3(),2.5);
  this.isSoftwareRenderer=true;this.getPixelRatio=()=>canvas.width/Math.max(1,canvas.clientWidth);
  this.setSize=(w,h)=>{const width=Math.min(780,w);resize(width,width*h/w);};
  this.render=(scene,camera)=>{camera.updateMatrixWorld(true);projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(projection);const visibility=new Map();renderScene({background:scene.background,updateMatrixWorld:()=>scene.updateMatrixWorld(true),traverseVisible:visit=>scene.traverseVisible(o=>{
   if(!o.isInstancedMesh){let citizen=o;while(citizen&&!citizen.userData.parkCitizen)citizen=citizen.parent;if(citizen){if(!visibility.has(citizen)){sphere.center.setFromMatrixPosition(citizen.matrixWorld);sphere.center.y+=.9;visibility.set(citizen,frustum.intersectsSphere(sphere));}if(!visibility.get(citizen))return;}visit(o);return;}
   for(let i=0;i<o.count;i++){
    o.getMatrixAt(i,inst);const matrixWorld=o.matrixWorld.clone().multiply(inst);const e=matrixWorld.elements,distance=Math.hypot(e[12]-camera.position.x,e[14]-camera.position.z);if(distance>(o.geometry.userData.softwareDistance||85))continue;const geometry=distance>(o.geometry.userData.softwareLODDistance||27)?(o.geometry.userData.softwareLOD||o.geometry):o.geometry;let material=o.material;
    if(o.instanceColor){const color=new T.Color().fromBufferAttribute(o.instanceColor,i);const key=material.uuid+color.getHexString();if(!colors.has(key)){const m=material.clone();m.color.multiply(color);colors.set(key,m);}material=colors.get(key);}
    visit({isMesh:true,geometry,material,matrixWorld});
   }
  })},camera);};
 }
}
