import * as T from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
let equipment;
function plate(text,width,height,{ground='#192d46',ink='#f3f5ee',stripe=false}={}){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;
 const ctx=canvas.getContext('2d');ctx.fillStyle=ground;ctx.fillRect(0,0,512,160);
 ctx.fillStyle=ink;ctx.font='bold 112px Arial, sans-serif';ctx.textBaseline='middle';ctx.textAlign='center';
 ctx.fillText(text,256,76,462);
 if(stripe)for(const [i,c] of ['#23529a','#e4e6df','#bb3243'].entries()){ctx.fillStyle=c;ctx.fillRect(202+i*36,138,36,9);}
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
 return new T.Mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({map}));
}
function shieldDepth(x){return .043*(1-(x/.294)**2);}
function equipmentTemplates(){
 const navy=new T.MeshStandardMaterial({color:0x26394a,roughness:.78});
 const rim=new T.MeshStandardMaterial({color:0x6f8191,roughness:.40,metalness:.37});
 const glass=new T.MeshStandardMaterial({color:0xc2dbe2,transparent:true,opacity:.33,roughness:.22,side:T.DoubleSide,depthWrite:false});
 const shape=new T.Shape();
 shape.moveTo(-.247,.54);shape.quadraticCurveTo(-.291,.53,-.291,.47);shape.lineTo(-.291,-.40);shape.quadraticCurveTo(-.287,-.48,-.245,-.49);
 shape.quadraticCurveTo(0,-.55,.245,-.49);shape.quadraticCurveTo(.287,-.48,.291,-.40);shape.lineTo(.291,.47);shape.quadraticCurveTo(.291,.53,.247,.54);shape.quadraticCurveTo(0,.565,-.247,.54);
 const edge=shape.getPoints(10),shield=new T.Group();shield.name='Bouclier de maintien de l’ordre';
 // Build the curved sheet in narrow strips so the centre catches the light.
 const widths=22,positions=[],indices=[];
 for(let i=0;i<=widths;i++){
  const x=-.29+.58*i/widths;
  const crossings=[];for(let j=0;j<edge.length-1;j++){
   const a=edge[j],b=edge[j+1];if((a.x<=x&&b.x>x)||(b.x<=x&&a.x>x))crossings.push(a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x));
  }
  const low=Math.min(...crossings),high=Math.max(...crossings);
  positions.push(x,low,shieldDepth(x),x,high,shieldDepth(x));if(i<widths){const k=2*i;indices.push(k,k+2,k+1,k+2,k+3,k+1);}
 }
 const surf=new T.BufferGeometry();surf.setAttribute('position',new T.Float32BufferAttribute(positions,3));surf.setIndex(indices);surf.computeVertexNormals();
 const pane=new T.Mesh(surf,glass);pane.renderOrder=2;shield.add(pane);
 const path=new T.CatmullRomCurve3(edge.slice(0,-1).map(p=>new T.Vector3(p.x,p.y,shieldDepth(p.x))),true,'centripetal');
 shield.add(new T.Mesh(new T.TubeGeometry(path,88,.011,6,true),rim));
 const police=plate('POLICE',.52,.137,{stripe:true});police.position.set(0,.155,.054);shield.add(police);
 const crs=plate('C R S',.286,.068);crs.position.set(0,.043,.054);shield.add(crs);
 const grip=new T.Mesh(new T.BoxGeometry(.19,.033,.034),navy);grip.position.z=-.074;shield.add(grip);
 const chest=plate('POLICE',.128,.037),back=plate('POLICE',.24,.063,{stripe:true});back.rotation.y=Math.PI;
 const flag=new T.Group();
 for(const [i,c] of [0x1c4390,0xe6e7e1,0xb92b3d].entries()){
  const strip=new T.Mesh(new T.PlaneGeometry(.021,.039),new T.MeshBasicMaterial({color:c,side:T.DoubleSide}));
  strip.position.x=(i-1)*.021;flag.add(strip);
 }
 flag.rotation.y=-1.12;
 for(const obj of [shield,chest,back,flag])obj.traverse(m=>{if(m.isMesh){m.geometry.userData.cortege=true;m.material.userData.cortege=true;}});
 return {shield,chest,back,flag};
}
export function createOfficer(asset,id){
 equipment??=equipmentTemplates();
 const actor=new T.Group(),stage=new T.Group(),body=clone(asset.scene);stage.rotation.y=Math.PI;actor.add(stage);
 const mixer=new T.AnimationMixer(body),idle=mixer.clipAction(asset.animations.find(a=>a.name==='Calm Idle')),walk=mixer.clipAction(asset.animations.find(a=>a.name==='Calm Walk'));
 idle.play();walk.play().setEffectiveWeight(0);mixer.setTime(.3);body.updateMatrixWorld(true);
 const box=new T.Box3().setFromObject(body,true),s=1.79/(box.max.y-box.min.y),c=box.getCenter(new T.Vector3());
 body.scale.multiplyScalar(s);body.position.set(-c.x*s,-box.min.y*s,-c.z*s);stage.add(body);
 body.traverse(o=>{if(o.isSkinnedMesh){o.frustumCulled=false;o.castShadow=true;}});
 const items=Object.fromEntries(Object.entries(equipment).map(([k,o])=>[k,o.clone(true)]));stage.add(...Object.values(items));
 const joints={palm:'Bone_016_016',spine:'Bone_010_010',shoulder:'Bone_025_025'};
 for(const key in joints){joints[key]=body.getObjectByName(joints[key]);if(!joints[key])throw Error('Articulation CRS absente : '+key);}
 const inv=new T.Matrix4();
 function update(time,advance=false){
  walk.setEffectiveWeight(advance?.82:0);idle.setEffectiveWeight(advance?.18:1);mixer.setTime(time*.83+id*.47);
  stage.updateWorldMatrix(true,true);inv.copy(stage.matrixWorld).invert();
  function anchor(obj,bone,x,y,z){obj.position.setFromMatrixPosition(joints[bone].matrixWorld).applyMatrix4(inv);obj.position.x+=x;obj.position.y+=y;obj.position.z+=z;}
  anchor(items.shield,'palm',.082,-.082,.115);items.shield.rotation.y=.14;items.shield.rotation.z=-.024;
  anchor(items.chest,'spine',.123,-.101,.224);anchor(items.back,'spine',0,-.113,-.154);
  anchor(items.flag,'shoulder',-.039,-.096,.05);
 }
 update(0);actor.name='CRS';return {actor,update};
}
