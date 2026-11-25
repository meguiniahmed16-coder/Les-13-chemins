import {perform} from './reference-performance.js';
// Project the same reference meshes onto the vertex buffers used by WebGL 1 and the software salon.
import * as T from 'three';
import {attachFemaleHead,loadFemaleReference} from './female-reference.js';

const white=new ImageData(new Uint8ClampedArray([255,255,255,255]),1,1);
const pixels=new WeakMap();
function imageData(map){
  if(!map)return white;
  const source=map.image;
  if(source.data)return source;
  if(!pixels.has(source)){
    const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0);
    pixels.set(source,ctx.getImageData(0,0,canvas.width,canvas.height));
  }
  return pixels.get(source);
}
// Clip triangles at the measured rest-pose neck. Shared edge crossings follow both vertices as the pose changes.
function cut(indices,height,level,above){
  const edges=[],keys=new Map(),faces=[];
  function intersect(a,b){
    const key=Math.min(a,b)+','+Math.max(a,b);
    if(keys.has(key))return keys.get(key);
    const i=height.length+edges.length;edges.push([a,b,(level-height[a])/(height[b]-height[a])]);keys.set(key,i);return i;
  }
  for(let k=0;k<indices.length;k+=3){
    const p=[];for(let i=0;i<3;i++){
      const a=indices[k+i],b=indices[k+(i+1)%3],inside=(height[a]>=level)===above;
      if(inside)p.push(a);if(inside!==((height[b]>=level)===above))p.push(intersect(a,b));
    }
    for(let j=1;j+1<p.length;j++)faces.push(p[0],p[j],p[j+1]);
  }
  return {edges,faces:new Uint16Array(faces)};
}
function withCut(mesh,height,level,above){
  const {edges,faces}=cut(mesh.faces,height,level,above),n=mesh.n+edges.length;
  const out={...mesh,n,faces,v:new Int16Array(3*n),vn:new Int8Array(3*n),uv:new Uint16Array(2*n)};
  function fill(key,size){
    const source=mesh[key],result=out[key];result.set(source);
    edges.forEach(([a,b,t],j)=>{for(let i=0;i<size;i++)result[(mesh.n+j)*size+i]=Math.round(T.MathUtils.lerp(source[a*size+i],source[b*size+i],t));});
  }
  fill('uv',2);return {out,update(){fill('v',3);fill('vn',3);}};
}
function bodyPart(m){
  const geo=new T.BufferGeometry(),base=Float32Array.from(m.v,v=>v*.0001);
  geo.setAttribute('position',new T.BufferAttribute(base.slice(),3));geo.setIndex(new T.BufferAttribute(m.faces,1));
  geo.setAttribute('normal',new T.BufferAttribute(m.vn,3,true));geo.setAttribute('uv',new T.BufferAttribute(m.uv,2,true));
  const material=new T.MeshStandardMaterial({map:new T.DataTexture(m.image.data,m.image.width,m.image.height),color:new T.Color(...m.multiplier)});
  return {name:'body',obj:new T.Mesh(geo,material),base,fullIndex:new T.BufferAttribute(m.allFaces,1)};
}
function copyPrimitive(o){
  const g=o.geometry,p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,m=o.material,count=p.count;
  const mesh={name:o.name,n:count,faces:Uint16Array.from(g.index.array),v:new Int16Array(3*count),vn:new Int8Array(3*count),
    uv:new Uint16Array(2*count),image:imageData(m.map),multiplier:m.color.clone().convertLinearToSRGB().toArray()};
  for(let i=0;uv&&i<count;i++){mesh.uv[i*2]=Math.round(65535*uv.getX(i));mesh.uv[i*2+1]=Math.round(65535*uv.getY(i));}
  const rest=Float32Array.from({length:count},(_,i)=>p.getY(i)),clip=m.name==='peau'?withCut(mesh,rest,.03,true):null;
  const v=new T.Vector3(),vn=new T.Vector3(),normalMatrix=new T.Matrix3(),morphs=g.morphAttributes.position;
  function update(matrix,pose){
    normalMatrix.getNormalMatrix(matrix);
    const weights=o.morphTargetInfluences||[],active=[];
    for(let j=0;j<weights.length;j++)if(weights[j])active.push([morphs[j],weights[j]]);
    for(let i=0;i<count;i++){
      v.fromBufferAttribute(p,i);
      const x=v.x,y=v.y,z=v.z;
      for(const [a,w] of active){v.x+=w*a.getX(i);v.y+=w*a.getY(i);v.z+=w*a.getZ(i);}
      if(m.name==='peau'&&Math.abs(x)<.04&&y>.065&&y<.103&&z>.04&&pose){
        const lips=pose.lips,line=.0826+.00068*Math.cos(Math.PI*Math.min(Math.abs(x)/.0212,1))-.00045*Math.exp(-((x/.0043)**2));
        const rel=y-line,w=Math.exp(-((x/.03)**4))*T.MathUtils.smoothstep(z,.04,.067)*Math.exp(-rel*rel/.00019),lo=1-T.MathUtils.smoothstep(rel,-.0006,.0006);
        v.x+=w*x*(-.31*lips.x+.12*lips.y);v.z+=w*(.0048*lips.x-.00065*lips.y-.0023*lips.z*lo);v.y+=w*.0027*lips.z*lo;
      }
      v.applyMatrix4(matrix);vn.fromBufferAttribute(n,i).applyNormalMatrix(normalMatrix);
      mesh.v[i*3]=Math.round(v.x*10000);mesh.v[i*3+1]=Math.round(v.y*10000);mesh.v[i*3+2]=Math.round(v.z*10000);
      mesh.vn[i*3]=Math.round(vn.x*127);mesh.vn[i*3+1]=Math.round(vn.y*127);mesh.vn[i*3+2]=Math.round(vn.z*127);
    }
    clip?.update();
  }
  return {mesh:clip?.out||mesh,update};
}
export async function wearCompatibleReference(figure,rest){
  const template=await loadFemaleReference();figure.pose(rest);
  const native=figure.meshes.find(m=>m.name==='body'),body=bodyPart(native),group=new T.Group();
  const parts=figure.meshes.map(m=>m===native?body:m.groom?{...bodyPart(m),name:m.name,source:m}:{name:m.name,obj:new T.Object3D(),base:m.name==='eyesNative'?Float32Array.from(m.v,v=>v*.0001):null});
  const actor={parts,body:group,stamp:0},head=attachFemaleHead(actor,template,figure.appearance);head.follow(true);
  const cutHeight=head.cut,clipped=withCut(native,body.obj.geometry.attributes.neckRestY.array,cutHeight,false);
  const meshes=figure.meshes.filter((m,i)=>parts[i].obj.visible).map(m=>m===native?clipped.out:m);
  const pieces=[];head.group.traverseVisible(o=>{
    if(!o.isMesh||['cornee','Mèches châtain en relief','Reflets des racines'].includes(o.material.name))return;
    const primitive=copyPrimitive(o);pieces.push(primitive);meshes.push(primitive.mesh);
  });
  const seam=group.getObjectByName('Raccord du cou'),seamPrimitive=copyPrimitive(seam),texture=new Uint8ClampedArray(seam.geometry.attributes.position.count*4);
  const colors=seam.geometry.attributes.color,color=new T.Color();
  for(let i=0;i<colors.count;i++){
    color.fromBufferAttribute(colors,i).convertLinearToSRGB();texture.set([color.r*255,color.g*255,color.b*255,255],i*4);
    seamPrimitive.mesh.uv[i*2]=Math.round(65535*(i+.5)/colors.count);
  }
  seamPrimitive.mesh.image=new ImageData(texture,colors.count,1);meshes.push(seamPrimitive.mesh);
  let lastRevision=-1;const identity=new T.Matrix4();
  const wrapped={meshes,appearance:figure.appearance,get revision(){return figure.revision;},enableSpeech:c=>figure.enableSpeech(c),
    pose(bones,expression){
      figure.pose(bones,expression);if(lastRevision===figure.revision)return;lastRevision=figure.revision;
      const raw=body.obj.geometry.attributes.position.array;for(let i=0;i<raw.length;i++)raw[i]=native.v[i]*.0001;
      perform(head,{...expression,blink:expression?.gesture?.blink||0});head.follow(true);clipped.update();
      for(const piece of pieces)piece.update(head.group.matrix,head.pose);seamPrimitive.update(identity);
    }};
  wrapped.pose(rest);return wrapped;
}
