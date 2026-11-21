export function createRasterizer(w,h,color,depth,perspective,shadow){
return function raster(p,a,b,c,image,dark,tone,mult,solid) {
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
            let u=(t1*p[a+3]+t2*p[b+3]+t3*p[c+3])*weight;
            u=image.repeat?u-Math.floor(u):Math.max(0,Math.min(.999999,u));
            let v=(t1*p[a+4]+t2*p[b+4]+t3*p[c+4])*weight;
            v=image.repeat?v-Math.floor(v):Math.max(0,Math.min(.999999,v));
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
}
