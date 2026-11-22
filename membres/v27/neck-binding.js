// Join the two real mesh sections. The lower ring follows the posed MakeHuman vertices.
import * as T from 'three';
const point=new T.Vector3(), upper=new T.Vector3(), center=new T.Vector3();
const read=(a,i,out)=>out.fromBufferAttribute(a,i);
function section(geometry,y,source){
  const p=geometry.attributes.position,idx=source||geometry.index,ring=new Map();
  for(let j=0;j<idx.count;j+=3){
    for(let e=0;e<3;e++){
      const a=idx.getX(j+e),b=idx.getX(j+(e+1)%3),ya=p.getY(a),yb=p.getY(b);
      if((ya<y)===(yb<y))continue;
      const t=(y-ya)/(yb-ya),x=T.MathUtils.lerp(p.getX(a),p.getX(b),t),z=T.MathUtils.lerp(p.getZ(a),p.getZ(b),t);
      const key=Math.round(x*1e5)+','+Math.round(z*1e5);
      if(!ring.has(key))ring.set(key,{a,b,t,x,z});
    }
  }
  const list=[...ring.values()];if(list.length<3)return [];
  const cx=list.reduce((s,v)=>s+v.x,0)/list.length,cz=list.reduce((s,v)=>s+v.z,0)/list.length;
  for(const v of list)v.angle=(Math.atan2(v.z-cz,v.x-cx)+Math.PI*2)%(Math.PI*2);
  return list.sort((a,b)=>a.angle-b.angle);
}
const pixelCache=new WeakMap();
export function pixelColor(tex,u,v){
  const image=tex?.image;if(!image)return new T.Color(.65,.4,.27);
  let raw=pixelCache.get(image);
  if(!raw){if(image.data)raw=image.data;else{const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);raw=ctx.getImageData(0,0,c.width,c.height).data;}pixelCache.set(image,raw);}
  const x=T.MathUtils.clamp(Math.round(u*(image.width-1)),0,image.width-1),y=T.MathUtils.clamp(Math.round((tex.flipY?1-v:v)*(image.height-1)),0,image.height-1),i=(y*image.width+x)*4;
  return new T.Color().setRGB(raw[i]/255,raw[i+1]/255,raw[i+2]/255,T.SRGBColorSpace);
}
function ringColor(mesh,r){
  const g=mesh.geometry,uv=g.attributes.uv,mat=mesh.material,col=mat.map?pixelColor(mat.map,T.MathUtils.lerp(uv.getX(r.a),uv.getX(r.b),r.t),T.MathUtils.lerp(uv.getY(r.a),uv.getY(r.b),r.t)):new T.Color(1,1,1);
  col.multiply(mat.color);const c=g.attributes.color;
  if(c&&mat.vertexColors)col.multiply(new T.Color().setRGB(...['getX','getY','getZ'].map(fn=>T.MathUtils.lerp(c[fn](r.a),c[fn](r.b),r.t))));
  return col;
}
function lowerClip(g,mat,cut){
  const height=Float32Array.from({length:g.attributes.position.count},(_,i)=>g.attributes.position.getY(i));
  g.setAttribute('neckRestY',new T.BufferAttribute(height,1));
  mat.onBeforeCompile=s=>{s.vertexShader='attribute float neckRestY;varying float baseY;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nbaseY=neckRestY;');s.fragmentShader='varying float baseY;\n'+s.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(baseY>'+cut.toFixed(7)+')discard;');};
  mat.customProgramCacheKey=()=> 'salon-neck-'+cut.toFixed(7);mat.needsUpdate=true;
}
export function joinNeck(actor,body,skin,head,low,high){
  const g=body.obj.geometry;
  // The body may currently be seated. Measure the section in its authored standing pose.
  const rest=g.clone();rest.setAttribute('position',new T.BufferAttribute(body.base,3));
  const bottom=section(rest,low,body.fullIndex),top=section(skin.geometry,high);
  lowerClip(rest,body.obj.material,low);g.setAttribute('neckRestY',rest.attributes.neckRestY);
  const depth=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,side:T.DoubleSide});lowerClip(rest,depth,low);body.obj.customDepthMaterial=depth;
  rest.dispose();
  const colors=[],indexes=[],positions=new Float32Array(3*(bottom.length+top.length)),count=bottom.length;
  for(const [list,mesh] of [[bottom,body.obj],[top,skin]])for(const r of list){const c=ringColor(mesh,r);colors.push(c.r,c.g,c.b);}
  if(bottom.length&&top.length){let i=0,j=0;while(i<count||j<top.length){
    const na=i+1<count?bottom[i+1].angle:Math.PI*2,nb=j+1<top.length?top[j+1].angle:Math.PI*2;
    const a=i%count,b=count+j%top.length;
    if(i<count&&(j===top.length||na<=nb)){indexes.push(a,b,(i+1)%count);i++;}
    else{indexes.push(a,b,count+(j+1)%top.length);j++;}
  }}
  const normals=new Float32Array(positions.length),normalMatrix=new T.Matrix3();
  const band=new T.BufferGeometry();band.setAttribute('normal',new T.BufferAttribute(normals,3).setUsage(T.DynamicDrawUsage));band.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));band.setAttribute('color',new T.Float32BufferAttribute(colors,3));band.setIndex(indexes);
  const obj=new T.Mesh(band,new T.MeshStandardMaterial({vertexColors:true,roughness:.82,side:T.DoubleSide}));obj.name='Raccord du cou';obj.frustumCulled=false;actor.body.add(obj);
  return {update(){head.updateMatrix();normalMatrix.getNormalMatrix(head.matrix);let i=0;for(const [list,geometry,transform] of [[bottom,g,false],[top,skin.geometry,true]]){
    const {position:attr,normal}=geometry.attributes;for(const r of list){read(attr,r.a,point).lerp(read(attr,r.b,upper),r.t);if(transform)point.applyMatrix4(head.matrix);point.toArray(positions,3*i);
      read(normal,r.a,point).lerp(read(normal,r.b,upper),r.t).normalize();if(transform)point.applyNormalMatrix(normalMatrix);point.toArray(normals,3*i++);}
  }band.attributes.position.needsUpdate=true;band.attributes.normal.needsUpdate=true;},dispose(){obj.removeFromParent();band.dispose();obj.material.dispose();depth.dispose();body.obj.customDepthMaterial=undefined;body.obj.material.onBeforeCompile=()=>{};body.obj.material.customProgramCacheKey=()=>'';body.obj.material.needsUpdate=true;g.deleteAttribute('neckRestY');}};
}
export function headBinding(body,eyes){
  const p=body.base,ep=eyes.base;const min=new T.Vector3(Infinity,Infinity,Infinity),max=new T.Vector3(-Infinity,-Infinity,-Infinity);
  for(let i=0;i<ep.length;i+=3){point.fromArray(ep,i);min.min(point);max.max(point);}
  const eye=center.addVectors(min,max).multiplyScalar(.5).clone();
  const nearest=(x,y,z)=>{let found=0,dist=Infinity;for(let i=0;i<p.length;i+=3){const d=(p[i]-x)**2+(p[i+1]-y)**2+(p[i+2]-z)**2;if(d<dist){dist=d;found=i/3;}}return found;};
  const ids=[nearest(eye.x-.045,eye.y,eye.z-.01),nearest(eye.x+.045,eye.y,eye.z-.01),nearest(eye.x,eye.y,-.10)];
  const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),x=new T.Vector3(),y=new T.Vector3(),z=new T.Vector3();
  function basis(arr){a.fromArray(arr,3*ids[0]);b.fromArray(arr,3*ids[1]);c.fromArray(arr,3*ids[2]);x.subVectors(b,a).normalize();b.lerp(a,.5);z.subVectors(b,c);y.crossVectors(z,x).normalize();z.crossVectors(x,y).normalize();return new T.Matrix4().makeBasis(x,y,z).setPosition(b);}
  const scale=T.MathUtils.clamp((max.x-min.x)/.096,.89,1.1);
  const placement=new T.Matrix4().makeScale(scale,scale,scale).setPosition(eye.x,eye.y-.1495*scale,eye.z-.059*scale);
  const bind=basis(p).invert().multiply(placement);
  return {cut:eye.y-.138*scale,pose(head){head.matrix.multiplyMatrices(basis(body.obj.geometry.attributes.position.array),bind);head.matrix.decompose(head.position,head.quaternion,head.scale);}};
}
