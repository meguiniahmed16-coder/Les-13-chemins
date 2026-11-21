import {resource,pixels} from './studio-assets.js';
import {traits} from './studio-catalog.js';
const smoothStep=(a,b,t)=>{const x=Math.min(1,Math.max(0,(t-a)/(b-a)));return x*x*(3-2*x);};
const clamp=(x,l,h)=>Math.max(l,Math.min(h,x));
const hairPalettes=[
 [[26,17,16],[67,43,33],[125,88,66]],[[13,14,17],[34,30,32],[79,73,74]],[[51,34,27],[119,81,58],[175,134,101]],
 [[126,95,60],[213,180,128],[250,228,186]],[[78,39,28],[155,80,49],[213,144,94]],
 [[130,105,77],[213,190,156],[249,231,200]],[[108,98,86],[192,177,153],[237,227,206]],
 [[151,139,123],[224,214,196],[254,249,231]],[[106,78,52],[187,146,91],[232,204,150]],
 [[71,46,35],[151,108,77],[196,157,119]],[[67,34,31],[128,65,51],[181,111,88]],[[70,69,67],[161,159,153],[226,224,215]]
];
const makeupColors=[
 null,
 [[139,80,72,.31],[179,99,80,.12],[131,97,75,.22]],
 [[177,77,97,.54],[191,86,111,.25],[151,92,112,.31]],
 [[163,84,61,.52],[185,104,64,.20],[155,93,55,.48]],
 [[127,44,67,.72],[153,72,91,.23],[75,63,83,.60]]
];

const decoded=async name=>pixels(await resource('map-'+name));
const buffers=new Map();
export function material(key,look,female=false){
 const a=look.face;
 let style=key;
 if(key==='skin')style+=[female,a.age,look.skinLevel,a.makeup,a.beard,a.pile,a.hairTone].join('/');
 else if(key==='eye')style+=a.iris+look.iris;
 else if(key.startsWith('hair')||['brow','lash'].includes(key))style+=[a.hairTone,a.brows,a.lashes,a.makeup].join('/');
 if(buffers.has(style))return buffers.get(style);
 const promise=(key==='skin'?skin(look,female):detail(key,look)).catch(e=>{buffers.delete(style);throw e});
 buffers.set(style,promise);if(buffers.size>18)buffers.delete(buffers.keys().next().value);return promise;
}
async function detail(key,look){
 const appearance=look.face,base=await decoded(key),raw=base.data,out=new Uint8ClampedArray(raw);
 if(key.startsWith('hair')){
  const t={};
 if(!t.range){
  const hist=new Uint32Array(256);let count=0;
  for(let j=0;j<raw.length;j+=4){if(raw[j+3]<96)continue;hist[(raw[j]*.30+raw[j+1]*.50+raw[j+2]*.20+.5)|0]++;count++}
  let sum=0;const bounds=[];for(let v=0;v<256;v++){sum+=hist[v];while(bounds.length<3&&sum>=count*[.025,.52,.975][bounds.length])bounds.push(v)}
  t.range=bounds;
 }
 const stops=hairPalettes[appearance.hairTone],lookup=new Uint8Array(768),[lo,mid,hi]=t.range;
 for(let v=0;v<256;v++){
  const a=v<mid?0:1,f=smoothStep(a===0?lo:mid,a===0?Math.max(lo+1,mid):Math.max(mid+1,hi),v);
  for(let c=0;c<3;c++)lookup[3*v+c]=Math.round(stops[a][c]+f*(stops[a+1][c]-stops[a][c]))
 }
 const rgba=out;
 for(let j=0;j<rgba.length;j+=4){const h=3*((raw[j]*.30+raw[j+1]*.50+raw[j+2]*.20+.5)|0);rgba[j]=lookup[h];rgba[j+1]=lookup[h+1];rgba[j+2]=lookup[h+2];rgba[j+3]=raw[j+3]}

 }else if(key==='brow'||key==='lash'){
  const style=key==='brow'?appearance.brows:appearance.lashes,t={raw};
 const shades=[[73,53,45],[51,43,42],[99,73,55],[133,103,72],[112,71,52],[143,118,89],[128,113,94],[151,137,117],[126,95,65],[106,83,66],[102,68,56],[115,110,104]],base=key==='brow'?shades[appearance.hairTone]:[62,48,46];
 const strengths=key==='brow'?[.70,.53,.87]:[.63,.46,.86],density=strengths[style]+(appearance.makeup===4?.05:0);
 for(let i=0;i<out.length;i+=4){
  const L=(.3*t.raw[i]+.5*t.raw[i+1]+.2*t.raw[i+2])/255,alpha=t.raw[i+3]/255;
  for(let c=0;c<3;c++)out[i+c]=clamp(Math.round(base[c]*(.83+.50*L)),0,255);
  out[i+3]=Math.round(255*density*alpha**(key==='brow'?1.32:1.57));
 }

 }else if(key==='eye'&&(appearance.iris||look.iris)){
  const hex=look.iris||traits.find(t=>t.key==='iris').swatches[appearance.iris];
  const tint=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  for(let i=0;i<out.length;i+=4){const r=raw[i]/255,g=raw[i+1]/255,b=raw[i+2]/255,L=.3*r+.5*g+.2*b;
   const mask=smoothStep(.02,.11,b-r)*smoothStep(.09,.23,L)*(1-smoothStep(.72,.86,L));
   for(let j=0;j<3;j++)out[i+j]=(1-mask)*raw[i+j]+mask*tint[j]*(.24+1.28*L);}
 }
 return new ImageData(out,base.width,base.height);
}
async function skin(look,female){
 const a=look.face,hair=hairPalettes[a.hairTone][0],ages=['young','middleage','old'],[ageIndex,age]=[[0,0],[0,.45],[0,.96],[1,.52],[1,1],[0,0]][a.age];
 const maps=female?await resource('female-skin'):null;
 const skinMap=key=>maps?pixels(maps[key]):decoded('skin-'+key);
 const [la,lb,da,db,oral,makeup,pile,beard]=await Promise.all([
  ...['caucasian','african'].flatMap(tone=>[ageIndex,ageIndex+1].map(i=>skinMap(ages[i]+'_'+tone))),
  resource('map-oral'),a.makeup?resource('map-cosmetics'):null,a.pile?resource('map-pile'):null,a.beard?resource('map-beard-'+a.beard):null]);
 const lev=look.skinLevel/100,frac=clamp((lev-.16)/.77,0,1),light=Math.max(0,(.16-lev)/.16)*.2,dark=1-.19*Math.max(0,(lev-.93)/.07);
 const n=la.width,out=new ImageData(n,n),rgb=out.data,palette=makeupColors[a.makeup];
 for(let i=0,k=0;i<n*n;i++,k+=4){
  for(let c=0;c<3;c++){const j=k+c,l=la.data[j]*(1-age)+lb.data[j]*age,d=da.data[j]*(1-age)+db.data[j]*age;
    const v=l*(1-frac)+d*frac;rgb[j]=(v+(255-v)*light)*dark*(1-[.68,.82,.69][c]*oral[i]/255);}
  rgb[k+3]=255;
  if(makeup)for(let z=0;z<3;z++){const col=palette[z],w=makeup[i*3+z]*col[3]/255;if(!w)continue;
   const lum=.54+.54*(.299*rgb[k]+.587*rgb[k+1]+.114*rgb[k+2])/175;for(let c=0;c<3;c++)rgb[k+c]=rgb[k+c]*(1-w)+col[c]*lum*w;}
  if(pile){const w=Math.min(.86,.22*a.pile*pile[i]/255);for(let c=0;c<3;c++)rgb[k+c]+=w*(hair[c]-rgb[k+c]);}
 }
 if(!beard)return out;
 const small=document.createElement('canvas'),large=document.createElement('canvas');
 small.width=small.height=n;large.width=large.height=2*n;
 small.getContext('2d').putImageData(out,0,0);const draw=large.getContext('2d',{willReadFrequently:true});
 draw.imageSmoothingQuality='high';draw.drawImage(small,0,0,2*n,2*n);
 const high=draw.getImageData(0,0,2*n,2*n),data=high.data;
 for(let i=0;i<beard.length;i++){if(!beard[i])continue;const w=.89*beard[i]/255;for(let c=0;c<3;c++)data[i*4+c]+=w*(hair[c]-data[i*4+c]);}
 return high;
}
