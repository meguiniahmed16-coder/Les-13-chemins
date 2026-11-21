import {visiblePart} from './salon-plan.js?v=salon29';
import {SalonMotion,newCamera} from './salon-navigation.js?v=salon35';
const portraitBones=new SalonMotion(undefined,newCamera()).bones();

const lightDirection = [-.426, .596, .681];
function lighting(x,y,z) {
  return .79 + .27 * Math.max(0,(x*lightDirection[0]+y*lightDirection[1]+z*lightDirection[2])/(Math.hypot(x,y,z)||1));
}

export function createSoftwareView(canvas,roomBytes,lightMap,projection) {
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)throw new Error('Le dessin de la scène est indisponible.');
  const room=new DataView(roomBytes),shadow=new Uint8Array(lightMap);
  let cachedRoom=null;
  function draw(figure,motion,portrait=false,guest=null) {
    const w=canvas.width,h=canvas.height;
    const camera=projection(w,h,portrait,motion.camera),{sy,cy,sp,cp,factor,perspective,nearDepth,offset}=camera;
    const zoom=h*factor/2,key=[w,h,sy,cy,sp,cp,factor,camera.x,camera.y,camera.z,perspective,nearDepth,offset].join(',');
    const midY=h*(1+offset)/2;
    const pixels=ctx.createImageData(w,h),color=pixels.data,depth=new Float32Array(w*h);
    function project(vertices,i,x,y,z,u,v,bright) {
      x-=camera.x;z-=camera.z;
      const lateral=cy*x-sy*z,forward=sy*x+cy*z;
      const dy=y-camera.y;
      const d=cp*forward+sp*dy;
      const invW=1/(1-perspective*Math.min(d,nearDepth));
      vertices[i]=w*.5+zoom*lateral*invW;
      vertices[i+1]=midY-zoom*(cp*dy-sp*forward)*invW;
      vertices[i+2]=d*invW;vertices[i+3]=u*invW;vertices[i+4]=v*invW;vertices[i+5]=bright*invW;vertices[i+6]=invW;
    }
    // Clip furniture crossing the over-the-shoulder camera's near plane before rasterization.
    const clipped=new Float64Array(28),nearInvW=1/(1-perspective*nearDepth);
    const inside=(p,i)=>p[i+2]<=nearDepth*p[i+6];
    function triangle(p,a,b,c,image,dark,tone,mult,solid){
      if(!perspective||(inside(p,a)&&inside(p,b)&&inside(p,c))){raster(p,a,b,c,image,dark,tone,mult,solid);return;}
      if(!inside(p,a)&&!inside(p,b)&&!inside(p,c))return;
      let count=0,previous=c;
      for(const current of [a,b,c]){
        if(inside(p,previous)!==inside(p,current)){
          const aW=1/p[previous+6],bW=1/p[current+6];
          const da=p[previous+2]*aW,db=p[current+2]*bW;
          const t=(nearDepth-da)/(db-da),at=7*count++;
          for(let k=0;k<6;k++){
            const origin=k===0?w/2:k===1?midY:0;
            clipped[at+k]=origin+((1-t)*(p[previous+k]-origin)*aW+t*(p[current+k]-origin)*bW)*nearInvW;
          }
          clipped[at+6]=nearInvW;
        }
        if(inside(p,current)){
          for(let k=0;k<7;k++)clipped[7*count+k]=p[current+k];
          count++;
        }
        previous=current;
      }
      raster(clipped,0,7,14,image,dark,tone,mult,solid);
      if(count===4)raster(clipped,0,14,21,image,dark,tone,mult,solid);
    }
    function raster(p,a,b,c,image,dark,tone,mult,solid) {
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
          const weight=perspective?1/(t1*p[a+6]+t2*p[b+6]+t3*p[c+6]):1;
          const k=j*4;
          if(solid){let shade=1;
            if(solid[3]){
              const px=(t1*p[a+3]+t2*p[b+3]+t3*p[c+3])*weight,pz=(t1*p[a+4]+t2*p[b+4]+t3*p[c+4])*weight;
              const sx=Math.max(0,Math.min(767,(px+390)*.96|0)),sz=Math.max(0,Math.min(767,(pz+380)*.96|0));
              shade=shadow[sz*768+sx]/255;
            }
            color[k]=shade*solid[0];color[k+1]=shade*solid[1];color[k+2]=shade*solid[2];}
          else{
            const u=Math.max(0,Math.min(.999999,(t1*p[a+3]+t2*p[b+3]+t3*p[c+3])*weight));
            const v=Math.max(0,Math.min(.999999,(t1*p[a+4]+t2*p[b+4]+t3*p[c+4])*weight));
            const i=4*((v*image.height|0)*image.width+(u*image.width|0)),src=image.data;
            if(src[i+3]<84)continue;
            const l=(t1*p[a+5]+t2*p[b+5]+t3*p[c+5])*weight;
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
      const tri=new Float32Array(21),rgb=[0,0,0];
      for(let j=0;!portrait&&j<room.byteLength;j+=42){
        const part=room.getUint8(j+13);
        if(!visiblePart(part,sy*cp,cy*cp))continue;
        rgb[3]=part===5||part===197||part===198;
        for(let v=0;v<3;v++){
          const i=j+v*14;
          project(tri,v*7,room.getInt16(i,true)/1800,room.getInt16(i+2,true)/1800,room.getInt16(i+4,true)/1800,room.getInt16(i,true)/18,room.getInt16(i+4,true)/18,1);
        }
        const bright=lighting(room.getInt8(j+6),room.getInt8(j+7),room.getInt8(j+8));
        for(let ch=0;ch<3;ch++)rgb[ch]=bright*room.getUint8(j+9+ch);
        triangle(tri,0,7,14,null,null,0,null,rgb);
      }
      cachedRoom={key,color:color.slice(),depth:depth.slice()};
    }
    function drawActor(figure,motion){
      const yaw=portrait?.42:motion.yaw, offsetY=portrait?.06:0;
      const atX=portrait?0:motion.x,atZ=portrait?0:motion.z;
      figure.pose(portrait?portraitBones:motion.bones(),portrait?null:motion.expression);
      const sin=Math.sin(yaw),cos=Math.cos(yaw);
      for(const m of figure.meshes){
        const p=new Float32Array(m.n*7);
        for(let j=0;j<m.n;j++){
          const i=j*3,uv=j*2,px=m.v[i]*.0001,py=m.v[i+1]*.0001,pz=m.v[i+2]*.0001,nx=m.vn[i],ny=m.vn[i+1],nz=m.vn[i+2];
          project(p,j*7,atX+cos*px+sin*pz,offsetY+py,atZ-sin*px+cos*pz,m.uv[uv]/65535,m.uv[uv+1]/65535,lighting(cos*nx+sin*nz,ny,-sin*nx+cos*nz));
        }
        const f=m.faces,tex=m.image;
        for(let j=0;j<f.length;j+=3)triangle(p,7*f[j],7*f[j+1],7*f[j+2],tex,null,0,m.multiplier,null);
      }
    }
    drawActor(figure,motion);
    if(!portrait&&guest)drawActor(guest.figure,guest.motion);
    ctx.putImageData(pixels,0,0);
  }
  return {draw,dispose(){cachedRoom=null;}};
}
