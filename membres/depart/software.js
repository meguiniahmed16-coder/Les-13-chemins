// Rasterize the same garden, posed member meshes and articulated wings on devices without WebGL.
import {Matrix4,Vector3,Frustum,Sphere,Color,RepeatWrapping} from 'three';
import {createRasterizer} from '../salon-raster.js';

export function softwareWorld(canvas,roomFrame){
  const ctx=canvas.getContext('2d'),textures=new WeakMap(),buffers=new WeakMap();
  const white={data:new Uint8ClampedArray([255,255,255,255]),width:1,height:1};
  const viewProjection=new Matrix4(),clipMatrix=new Matrix4(),model=new Matrix4(),instance=new Matrix4();
  const position=new Vector3(),sphere=new Sphere(),frustum=new Frustum(),tone=new Color();
  function texture(map){
    if(!map)return white;
    if(textures.has(map))return textures.get(map);
    const source=map.image;
    if(!source?.width)return white;
    let img=source;
    if(!source.data){
      const c=document.createElement('canvas');c.width=source.width;c.height=source.height;
      const paint=c.getContext('2d');paint.drawImage(source,0,0);img=paint.getImageData(0,0,c.width,c.height);
    }
    const tex={data:img.data,width:img.width,height:img.height,repeat:map.wrapS===RepeatWrapping};
    textures.set(map,tex);return tex;
  }
  function render(scene,camera){
    const w=canvas.width,h=canvas.height,base=this.autoClear?null:roomFrame();
    const image=base?.pixels||ctx.createImageData(w,h),depth=new Float32Array(w*h);
    if(base){
      const {perspective,nearDepth}=base.camera,lens=1-nearDepth*perspective;
      for(let i=0;i<depth.length;i++)depth[i]=perspective?2*lens*(1+base.depth[i]*perspective)-1:base.depth[i]/20;
    }else{
      depth.fill(-Infinity);
      for(let i=0;i<image.data.length;i+=4){image.data[i]=217;image.data[i+1]=231;image.data[i+2]=228;image.data[i+3]=255}
    }
    const raster=createRasterizer(w,h,image.data,depth,true,null);
    scene.updateMatrixWorld(true);camera.updateMatrixWorld();
    viewProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(viewProjection);
    const uniform=[1,1,1],flat=[0,0,0,0],clipped=new Float32Array(28);
    function mesh(o,world){
      const g=o.geometry,pos=g.attributes.position,normal=g.attributes.normal,uv=g.attributes.uv,col=g.attributes.color;
      if(!pos)return;
      if(o.frustumCulled){
        if(!g.boundingSphere)g.computeBoundingSphere();
        sphere.copy(g.boundingSphere).applyMatrix4(world);if(!frustum.intersectsSphere(sphere))return;
      }
      let v=buffers.get(g);
      if(!v){v=new Float32Array(pos.count*7);buffers.set(g,v)}
      clipMatrix.multiplyMatrices(viewProjection,world);
      const m=clipMatrix.elements,wm=world.elements;
      const inverseScale=1/(Math.hypot(wm[0],wm[1],wm[2])||1);
      const lx=(-.42*wm[0]+.68*wm[1]+.59*wm[2])*inverseScale;
      const ly=(-.42*wm[4]+.68*wm[5]+.59*wm[6])*inverseScale;
      const lz=(-.42*wm[8]+.68*wm[9]+.59*wm[10])*inverseScale;
      const flipY=(Array.isArray(o.material)?o.material[0]:o.material).map?.flipY;
      for(let i=0,j=0;i<pos.count;i++,j+=7){
        let x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
        if(o.isSkinnedMesh){position.set(x,y,z);o.applyBoneTransform(i,position);({x,y,z}=position)}
        // Store homogeneous coordinates behind the near plane as well, for clipping the threshold and terrain.
        const cw=m[3]*x+m[7]*y+m[11]*z+m[15],inv=1/(Math.abs(cw)<1e-8?1e-8:cw);
        v[j]=(.5+.5*(m[0]*x+m[4]*y+m[8]*z+m[12])*inv)*w;
        v[j+1]=(.5-.5*(m[1]*x+m[5]*y+m[9]*z+m[13])*inv)*h;
        v[j+2]=-(m[2]*x+m[6]*y+m[10]*z+m[14])*inv;
        v[j+3]=(uv?.getX(i)||0)*inv;v[j+4]=(flipY?1-(uv?.getY(i)||0):uv?.getY(i)||0)*inv;
        v[j+5]=(normal?Math.min(1.13,.80+.27*Math.max(0,lx*normal.getX(i)+ly*normal.getY(i)+lz*normal.getZ(i))):1)*inv;
        v[j+6]=inv;
      }
      const index=g.index?.array,total=index?.length||pos.count;
      const groups=Array.isArray(o.material)?g.groups:[{start:0,count:total}];
      for(const group of groups){
        const mat=Array.isArray(o.material)?o.material[group.materialIndex]:o.material;
        if(mat.transparent&&mat.opacity<.35)continue;
        const tex=texture(mat.map),solid=!mat.map;
        tone.copy(mat.color).convertLinearToSRGB();uniform[0]=tone.r;uniform[1]=tone.g;uniform[2]=tone.b;
        for(let j=group.start,end=Math.min(total,j+group.count);j<end;j+=3){
          const ai=index?index[j]:j,bi=index?index[j+1]:j+1,ci=index?index[j+2]:j+2;
          const a=ai*7,b=bi*7,c=ci*7;
          const visible=k=>v[k+6]>0&&v[k+2]<=1;
          const count=Number(visible(a))+Number(visible(b))+Number(visible(c));if(!count)continue;
          if(solid){
            const light=v[a+5]/v[a+6];
            if(col){tone.fromBufferAttribute(col,ai).convertLinearToSRGB();flat[0]=255*light*tone.r*uniform[0];flat[1]=255*light*tone.g*uniform[1];flat[2]=255*light*tone.b*uniform[2]}
            else for(let k=0;k<3;k++)flat[k]=255*light*uniform[k];
          }
          const fill=solid?flat:null;
          if(count===3){raster(v,a,b,c,tex,null,0,uniform,fill);continue}
          let n=0,prev=c;
          for(const cur of [a,b,c]){
            if(visible(prev)!==visible(cur)){
              const wa=1/v[prev+6],wb=1/v[cur+6],da=(1-v[prev+2])*wa,db=(1-v[cur+2])*wb;
              const t=da/(da-db),cw=wa+(wb-wa)*t;
              if(cw<=0)continue;
              for(let k=0;k<6;k++)clipped[n+k]=(v[prev+k]*wa*(1-t)+v[cur+k]*wb*t)/cw;
              clipped[n+6]=1/cw;n+=7;
            }
            if(visible(cur)){clipped.set(v.subarray(cur,cur+7),n);n+=7}prev=cur;
          }
          if(n>=21)raster(clipped,0,7,14,tex,null,0,uniform,fill);
          if(n===28)raster(clipped,0,14,21,tex,null,0,uniform,fill);
        }
      }
    }
    scene.traverseVisible(o=>{
      if(!o.isMesh)return;
      if(o.isInstancedMesh){
        // Omit individual gravel grains at software resolution; retain the path and its plantings.
        if(o.count>=900)return;
        for(let i=0;i<o.count;i++){o.getMatrixAt(i,instance);model.multiplyMatrices(o.matrixWorld,instance);mesh(o,model)}
      }else mesh(o,o.matrixWorld);
    });
    ctx.putImageData(image,0,0);
  }
  return {autoClear:false,capabilities:{getMaxAnisotropy:()=>1},resetState(){},setViewport(){},render,dispose(){}};
}
