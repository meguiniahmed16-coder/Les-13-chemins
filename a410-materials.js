import * as T from 'three';

// Deterministic, locally drawn surface maps. No paid generation or remote asset dependency.
function rng(seed){return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);}
function canvas(size=512){const c=document.createElement('canvas');c.width=c.height=size;return[c,c.getContext('2d')];}
function noise(x,y,seed){const n=Math.sin(x*127.1+y*311.7+seed*19.7)*43758.5453;return n-Math.floor(n);}
function smoothNoise(x,y,seed){const i=Math.floor(x),j=Math.floor(y);let u=x-i,v=y-j;u=u*u*(3-2*u);v=v*v*(3-2*v);return(1-v)*((1-u)*noise(i,j,seed)+u*noise(i+1,j,seed))+v*((1-u)*noise(i,j+1,seed)+u*noise(i+1,j+1,seed));}
function map(c){const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t;}
export function surface(kind,hex,meters=2,seed=7){
 const[c,g]=canvas(),r=rng(seed),base=new T.Color(hex).convertLinearToSRGB(),rgb=[base.r*255,base.g*255,base.b*255],data=g.createImageData(512,512);
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){let n=(smoothNoise(x/68,y/68,seed)-.5)*18+(smoothNoise(x/15,y/15,seed+2)-.5)*9+(r()-.5)*17;
  if(kind==='asphalt')n=(r()-.5)*24+(smoothNoise(x/76,y/76,seed)-.5)*16;
  if(kind==='wood')n+=Math.sin(y*.9+Math.sin(x*.018)*2)*8+Math.sin(y*.14+x*.008)*12;
  if(kind==='grass')n+=(r()-.5)*22;
  const i=(y*512+x)*4;for(let k=0;k<3;k++)data.data[i+k]=Math.max(0,Math.min(255,rgb[k]+n));data.data[i+3]=255;
 }
 g.putImageData(data,0,0);
 if(kind==='stone'){
  const row=85;
  for(let y=0;y<512;y+=row){const offset=(Math.floor(y/row)%2)*100;for(let x=-offset;x<512;x+=200){g.fillStyle=`rgba(${r()>.5?'255,246,219':'58,51,39'},${.025+r()*.06})`;g.fillRect(x+2,y+2,196,row-4);g.strokeStyle='#625e524d';g.lineWidth=2;g.strokeRect(x+1,y+1,199,row);g.strokeStyle='#f5efdb45';g.lineWidth=1;g.strokeRect(x+3,y+3,195,row-4);}}
 }
 if(kind==='asphalt'){
  for(let i=0;i<6;i++){let x=r()*512,y=r()*512;g.strokeStyle='#343d3855';g.lineWidth=.6+r()*.6;g.beginPath();g.moveTo(x,y);for(let j=0;j<7;j++){x+=(r()-.45)*26;y+=8+r()*18;g.lineTo(x,y);}g.stroke();}
 }
 if(kind==='plaster'||kind==='concrete'){
  for(let i=0;i<1700;i++){const x=r()*512,y=r()*512,a=.015+r()*.06;g.fillStyle=`rgba(48,45,37,${a})`;g.fillRect(x,y,.5+r()*1.8,.5+r()*2.2);}
  for(let i=0;i<9;i++){let x=r()*512,y=r()*512;g.strokeStyle='#69645425';g.lineWidth=.6;g.beginPath();g.moveTo(x,y);for(let j=0;j<6;j++){x+=(r()-.5)*9;y+=r()*7;g.lineTo(x,y);}g.stroke();}
 }
 if(kind==='metal')for(let i=0;i<90;i++){g.strokeStyle=i%4?'#a1a29315':'#945e3235';g.lineWidth=.5;let x=r()*512,y=r()*512;g.beginPath();g.moveTo(x,y);g.lineTo(x+2+r()*25,y+1);g.stroke();}
 if(kind==='grass')for(let i=0;i<6000;i++){let x=r()*512,y=r()*512;g.strokeStyle=i%3?'#687b3c55':'#c0bb7966';g.lineWidth=.7;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*5,y-2-r()*6);g.stroke();}
 const tex=map(c),m=new T.MeshStandardMaterial({color:'white',map:tex,bumpMap:tex,bumpScale:kind==='stone'?.025:.012,roughness:kind==='metal'?.62:.91,metalness:kind==='metal'?.25:0});m.userData.tileMeters=meters;return m;
}

export function glassSurfaces(){return Array.from({length:8},(_,seed)=>{
 const[c,g]=canvas(256),r=rng(seed+129);const grad=g.createLinearGradient(0,0,90,256);grad.addColorStop(0,['#5e7777','#6c8586','#839b98','#4d6669'][seed%4]);grad.addColorStop(.55,'#536867');grad.addColorStop(1,'#2d413f');g.fillStyle=grad;g.fillRect(0,0,256,256);
 // A glimpse of a dim room, blinds, diffuse sky and irregular tree reflections.
 g.fillStyle='#d3c8a746';g.fillRect(35,17,12,233);g.fillStyle='#182b2b55';g.fillRect(0,180,256,76);
 for(let i=0;i<17;i++){g.fillStyle=`rgba(23,52,43,${.025+r()*.08})`;g.beginPath();g.ellipse(r()*256,110+r()*150,14+r()*45,30+r()*65,0,0,Math.PI*2);g.fill();}
 const sky=g.createLinearGradient(0,0,256,130);sky.addColorStop(0,'#dae8db55');sky.addColorStop(.7,'#b5d4d315');sky.addColorStop(1,'#dbe9dd07');g.fillStyle=sky;g.beginPath();g.moveTo(0,0);g.lineTo(220,0);g.lineTo(125,220);g.lineTo(0,160);g.fill();
 if(seed%3===0){g.fillStyle='#b9b6a188';g.fillRect(0,0,256,65+seed*11);for(let y=5;y<65+seed*11;y+=7){g.strokeStyle='#484e4544';g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke();}}
 for(let i=0;i<50;i++){g.strokeStyle='#e7eee00a';let x=r()*256;g.beginPath();g.moveTo(x,r()*100);g.lineTo(x-.4,120+r()*136);g.stroke();}
 const tex=map(c);tex.wrapS=tex.wrapT=T.ClampToEdgeWrapping;return new T.MeshStandardMaterial({map:tex,color:'white',roughness:.22,metalness:.17});
});}

export function stainMaterial(kind='sill'){
 const[c,g]=canvas(256),r=rng(kind==='sill'?84:18);g.clearRect(0,0,256,256);
 if(kind==='sill'){for(let i=0;i<28;i++){const x=r()*256,w=1+r()*8,h=30+r()*210,gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#4c493b35');gr.addColorStop(1,'#4c493b00');g.fillStyle=gr;g.fillRect(x,0,w,h);}}
 else{const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#1d302649');gr.addColorStop(.4,'#263b2422');gr.addColorStop(1,'#263b2400');g.fillStyle=gr;g.fillRect(0,0,256,256);}
 const texture=map(c);texture.wrapS=texture.wrapT=T.ClampToEdgeWrapping;return new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
}
export function shadowMaterial(){const[c,g]=canvas(128),gr=g.createRadialGradient(64,64,6,64,64,64);gr.addColorStop(0,'#1b281c80');gr.addColorStop(.55,'#1b281c48');gr.addColorStop(1,'#1b281c00');g.fillStyle=gr;g.fillRect(0,0,128,128);return new T.MeshBasicMaterial({map:map(c),transparent:true,depthWrite:false});}
