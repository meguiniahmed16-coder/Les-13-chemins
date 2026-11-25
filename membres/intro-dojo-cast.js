import {normaliseStudio,referenceStudio} from './studio-look.js?v=incarnations33';

// These are independent adult examples from the same character editor as the
// game. They never recolour or replace the two hosts' private/reference heads.
// Labels describe the selected silhouette, never an origin inferred from skin.
export const DOJO_CAST=Object.freeze([
 {id:'athletique',label:'Silhouette athlétique',bodyLabel:'Athlétique',gender:'femme',skinLevel:88,color:'#6e4939',
  face:{body:3,age:1,face:3,nose:3,mouth:2,gaze:2,hair:9,hairTone:1,iris:3},
  outfit:{haut:'mh22',bas:'mh391',souliers:'mh1734'},palette:{mh22:'#778dba',mh391:'#283b4e'}},
 {id:'mince',label:'Silhouette mince',bodyLabel:'Mince',gender:'homme',skinLevel:34,color:'#cd9c7c',
  face:{body:1,age:1,face:1,jawline:1,gaze:1,nose:1,hair:7,hairTone:1,beard:0,pile:0,iris:3},
  outfit:{haut:'mh1800',bas:'mh1796',souliers:'mh620'},palette:{mh1800:'#eee4cf',mh1796:'#43586b'}},
 {id:'ample',label:'Silhouette généreuse',bodyLabel:'Corpulence forte',gender:'femme',skinLevel:60,color:'#a57356',
  face:{body:2,age:2,face:4,chin:3,jawline:1,gaze:3,nose:3,hair:5,hairTone:0,iris:2},
  outfit:{haut:'mh1800',bas:'mh391',souliers:'mh1734'},palette:{mh1800:'#b77368',mh391:'#36414d'}},
 {id:'muscle',label:'Silhouette musclée',bodyLabel:'Très musclé',gender:'homme',skinLevel:12,color:'#e6c4ad',
  face:{body:4,age:3,face:2,jawline:2,nose:2,hair:6,hairTone:11,beard:0,pile:0,iris:4},
  outfit:{haut:'mh1800',bas:'mh1655',souliers:'mh1732'},palette:{mh1800:'#8fada2',mh1655:'#334451'}}
]);
export function dojoCastLook(index=0){
 const item=DOJO_CAST[index];if(!item)throw Error('Exemple de personnage inconnu.');
 const base=referenceStudio(item.gender);
 return normaliseStudio({...base,face:{...base.face,...item.face},skinLevel:item.skinLevel,outfit:{...item.outfit}},true,undefined,item.gender);
}
export function dojoCastState(line,elapsed=0){
 const id=typeof line==='string'?line:line?.id;
 // Show the full-body gallery once. The following appearance shot returns
 // to Marianne and Ahmed Marie for the face and detail controls.
 const duration=id==='dojo-personnaliser'?12000:0;
 if(!duration)return {castIndex:-1,castLabel:'',bodyLabel:''};
 const castIndex=Math.min(DOJO_CAST.length-1,Math.floor(Math.max(0,elapsed)/(duration/DOJO_CAST.length))),item=DOJO_CAST[castIndex];
 return {castIndex,castLabel:item.label,bodyLabel:item.bodyLabel};
}
// A calm standing pose with enough room beside the widest torso. The subtle
// breathing and gaze use the production joint solver; the gallery never walks.
export function dojoCastPose(index=0,elapsed=0){
 const arm=index===2?{left:.8,right:.8,reach:40,height:-48,forward:5}:
  index===3?{left:.6,right:.6,reach:34,height:-46,forward:5}:
  {left:.12,right:.12,reach:30,height:-16,forward:11};
 return {time:Math.max(0,elapsed)/1000+index*.37,energy:.14,emphasis:0,
  headYaw:.045*Math.sin(elapsed/1500+index),
  poseGesture:{...arm,palm:.20,pitch:0,yaw:0,nod:0,tilt:0}};
}
export function styleDojoFabric(figure,palette){
 if(!palette)return figure;
 for(const part of figure.meshes||[]){
  const color=palette[part.id];if(!part.binding||!color)continue;
  const rgb=[1,3,5].map(at=>parseInt(color.slice(at,at+2),16)),source=part.image,data=new Uint8ClampedArray(source.data);
  for(let k=0;k<data.length;k+=4){
   const luminance=(.2126*source.data[k]+.7152*source.data[k+1]+.0722*source.data[k+2])/255;
   const shade=.62+.38*Math.pow(luminance,.65);
   for(let channel=0;channel<3;channel++)data[k+channel]=Math.round(rgb[channel]*shade);
  }
  // Canvas ImageData exposes width/height through inherited getters. Object
  // spread drops them, making Three upload a 1 × 1 texture whose first pixel
  // may be transparent while the clothing's skin mask is already applied.
  part.image={width:source.width,height:source.height,data};
 }
 return figure;
}
// A small, measured amount of ease around the shirt hem and trouser cuffs
// keeps these exact gallery combinations clear of the layer beneath them.
// Clearance is expressed in the fitter's 0.1 mm units, and follows the same
// body anchors through every pose. Skin masks and visible anatomy stay intact.
export function fitDojoCastFigure(figure,index){
 if(figure.dojoCastFit===index)return figure;
 const item=DOJO_CAST[index],body=figure.meshes?.find(m=>m.name==='body');
 if(!item||!body?.rest)return figure;
 const ease=[{shirt:0,cuff:0},{shirt:80,cuff:80},{shirt:0,cuff:80},{shirt:180,cuff:180}][index];
 const unit=x=>Math.max(0,Math.min(1,x));
 for(const part of figure.meshes.filter(m=>m.binding)){
  const shirt=part.id===item.outfit.haut,cuff=part.id===item.outfit.bas;
  if(!shirt&&!cuff)continue;
  const clearance=part.clearance||=new Int16Array(part.n),b=part.binding;
  for(let i=0;i<part.n;i++){
   const k=i*8,u=b[k+3]/65535,w=b[k+4]/65535;
   const y=(u*body.rest[3*b[k]+1]+w*body.rest[3*b[k+1]+1]+(1-u-w)*body.rest[3*b[k+2]+1])*.0001;
   const waist=index===2&&cuff?40*unit((y-.72)/.10)*unit((1.08-y)/.12):0;
   clearance[i]+=Math.round((shirt?ease.shirt*unit((1.2-y)/.18):ease.cuff*unit((.26-y)/.14))+waist);
  }
 }
 figure.dojoCastFit=index;return figure;
}
export function styleDojoCastFigure(figure,index){
 styleDojoFabric(figure,DOJO_CAST[index]?.palette);return fitDojoCastFigure(figure,index);
}
