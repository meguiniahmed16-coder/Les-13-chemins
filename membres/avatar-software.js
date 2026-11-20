// Canvas fallback for the same clothed meshes and salon as the WebGL renderer.
const lightDirection = [-.426, .596, .681];
function lighting(x,y,z) {
  return .79 + .27 * Math.max(0,(x*lightDirection[0]+y*lightDirection[1]+z*lightDirection[2])/(Math.hypot(x,y,z)||1));
}

function texturePixels(image) {
  const surface=document.createElement('canvas');
  const scale=Math.min(1,768/Math.max(image.width,image.height));
  surface.width=Math.max(1,Math.round(scale*image.width));
  surface.height=Math.max(1,Math.round(scale*image.height));
  const ctx=surface.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(image,0,0,surface.width,surface.height);
  return ctx.getImageData(0,0,surface.width,surface.height);
}

function typed(bytes,Type){return new Type(bytes.buffer,bytes.byteOffset,bytes.byteLength/Type.BYTES_PER_ELEMENT);}

export function createSoftwareView(canvas,data,roomBytes,projection,appearance) {
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)throw new Error('Le dessin de la scène est indisponible.');
  const textures=data.textures.map(texturePixels);
  const meshes=data.meshes.map(m=>({...m,position:typed(m.position,Int16Array),normal:typed(m.normal,Int8Array),
    uv:typed(m.uv,Uint16Array),faces:typed(m.faces,Uint16Array),shapes:m.shapes?.map(s=>typed(s,Int16Array))}));
  const room=new DataView(roomBytes);
  let cachedRoom=null;
  function draw(look,yaw,portrait=false) {
    const w=canvas.width,h=canvas.height;
    const camera=projection(w,h,portrait),{sy,cy,sp,cp,factor,center}=camera;
    const zoom=h*factor/2,sin=Math.sin(yaw),cos=Math.cos(yaw),key=w+'x'+h+'-'+portrait;
    const pixels=ctx.createImageData(w,h),color=pixels.data,depth=new Float32Array(w*h);
    function project(vertices,i,x,y,z,u,v,bright) {
      const lateral=cy*x-sy*z,forward=sy*x+cy*z;
      const dy=y-center;
      vertices[i]=w*.5+zoom*lateral;
      vertices[i+1]=h*.5-zoom*(cp*dy-sp*forward);
      vertices[i+2]=cp*forward+sp*dy;vertices[i+3]=u;vertices[i+4]=v;vertices[i+5]=bright;
    }
    // All materials are opaque after the alpha test, so either triangle winding can be rendered using one depth buffer.
    function triangle(p,a,b,c,image,dark,tone,mult,solid) {
      const ax=p[a],ay=p[a+1],bx=p[b],by=p[b+1],cx=p[c],cyy=p[c+1];
      const minX=Math.max(0,Math.ceil(Math.min(ax,bx,cx)-.5)),maxX=Math.min(w-1,Math.floor(Math.max(ax,bx,cx)-.5));
      const minY=Math.max(0,Math.ceil(Math.min(ay,by,cyy)-.5)),maxY=Math.min(h-1,Math.floor(Math.max(ay,by,cyy)-.5));
      if(minX>maxX||minY>maxY)return;
      const det=(by-cyy)*(ax-cx)+(cx-bx)*(ay-cyy);if(Math.abs(det)<1e-8)return;
      const dx1=(by-cyy)/det,dy1=(cx-bx)/det,dx2=(cyy-ay)/det,dy2=(ax-cx)/det;
      for(let y=minY;y<=maxY;y++){
        let t1=dx1*(minX+.5-cx)+dy1*(y+.5-cyy),t2=dx2*(minX+.5-cx)+dy2*(y+.5-cyy);
        for(let x=minX;x<=maxX;x++,t1+=dx1,t2+=dx2){
          const t3=1-t1-t2;if(t1<-.00001||t2<-.00001||t3<-.00001)continue;
          const j=y*w+x,z=t1*p[a+2]+t2*p[b+2]+t3*p[c+2];if(z<=depth[j])continue;
          const k=j*4;
          if(solid){color[k]=solid[0];color[k+1]=solid[1];color[k+2]=solid[2];}
          else{
            const u=Math.max(0,Math.min(.999999,t1*p[a+3]+t2*p[b+3]+t3*p[c+3]));
            const v=Math.max(0,Math.min(.999999,t1*p[a+4]+t2*p[b+4]+t3*p[c+4]));
            const i=4*((v*image.height|0)*image.width+(u*image.width|0)),src=image.data;
            if(src[i+3]<84)continue;
            const l=t1*p[a+5]+t2*p[b+5]+t3*p[c+5];
            if(tone){
              const d=4*((v*dark.height|0)*dark.width+(u*dark.width|0));
              for(let ch=0;ch<3;ch++)color[k+ch]=(src[i+ch]+tone*(dark.data[d+ch]-src[i+ch]))*mult[ch]*l;
            }else{for(let ch=0;ch<3;ch++)color[k+ch]=src[i+ch]*mult[ch]*l;}
          }
          color[k+3]=255;depth[j]=z;
        }
      }
    }

    if(cachedRoom?.key===key){
      color.set(cachedRoom.color);depth.set(cachedRoom.depth);
    }else{
      depth.fill(-Infinity);
      for(let i=0;i<color.length;i+=4){color[i]=240;color[i+1]=237;color[i+2]=227;color[i+3]=255;}
      const tri=new Float32Array(18),rgb=[0,0,0];
      for(let j=0;j<room.byteLength;j+=42){
        for(let v=0;v<3;v++){
          const i=j+v*14;
          project(tri,v*6,room.getInt16(i,true)/1800,room.getInt16(i+2,true)/1800,room.getInt16(i+4,true)/1800,0,0,1);
        }
        const bright=lighting(room.getInt8(j+6),room.getInt8(j+7),room.getInt8(j+8));
        for(let ch=0;ch<3;ch++)rgb[ch]=bright*room.getUint8(j+9+ch);
        triangle(tri,0,6,12,null,null,0,null,rgb);
      }
      cachedRoom={key,color:color.slice(),depth:depth.slice()};
    }
    for(const m of meshes){
      const material=appearance(m,look);if(!material)continue;
      const n=m.position.length/4,p=new Float32Array(n*6),shape=material.shape;
      for(let j=0;j<n;j++){
        const i=j*4,uv=j*2;
        const x=(m.position[i]+(shape?shape[i]:0))*.0001,y=(m.position[i+1]+(shape?shape[i+1]:0))*.0001+.06,z=(m.position[i+2]+(shape?shape[i+2]:0))*.0001;
        const nx=m.normal[i],nz=m.normal[i+2];
        project(p,j*6,cos*x+sin*z,y,-sin*x+cos*z,m.uv[uv]/65535,m.uv[uv+1]/65535,lighting(cos*nx+sin*nz,m.normal[i+1],-sin*nx+cos*nz));
      }
      const f=m.faces,tex=textures[m.texture];
      for(let j=0;j<m.count;j+=3)triangle(p,6*f[j],6*f[j+1],6*f[j+2],tex,textures[data.dark],material.tone,material.multiplier,null);
    }
    ctx.putImageData(pixels,0,0);
  }
  return {draw,dispose(){cachedRoom=null;}};
}
