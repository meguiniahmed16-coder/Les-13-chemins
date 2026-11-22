import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {headBinding,joinNeck} from './neck-binding.js';

export const referenceURL='/assets/membres/marianne-reference.glb';
let pending;
export function loadFemaleReference(){
  if(!pending)pending=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(referenceURL).catch(e=>{pending=null;throw e;});
  return pending;
}
const originalDetails=new Set(['eyesNative','browNative','lashes','teethNative','tongueNative']);
const hairNames=new Set(['hair','QueueHaute','Carre','LongOndule','TresseCote','bob02','short01','short02','short03','afro01']);
const hairColors=['#805739','#362a29','#966c4f','#d3b480','#a75c36','#ceb99a','#a79787','#ded5c6','#c29655','#b28c6c','#915043','#928c89'];

const styleValue=(face,key,values)=>values[face?.[key]||0]||0;
// All values are deviations from the same neutral female head, in metres.
export function shapeOptions(face){
  return {
    cheeks:styleValue(face,'face',[0,-.002,-.004,.0028,.005]),
    chin:styleValue(face,'chin',[0,.003,-.004,.002,-.0008]),
    jaw:styleValue(face,'jawline',[0,-.003,.004,-.002,.002]),
    forehead:styleValue(face,'forehead',[0,.004,-.003,.002,-.0025]),
    noseWidth:styleValue(face,'nose',[0,-.15,0,.13,-.04]),
    bridge:styleValue(face,'nose',[0,0,.0035,.0017,-.0025]),
    ear:styleValue(face,'ears',[0,-.003,.001,.004,.0018]),
    lip:styleValue(face,'mouth',[0,-.17,.20,.09,0]),
    width:styleValue(face,'mouth',[0,0,0,0,.11]),
    gaze:styleValue(face,'gaze',[0,-.10,.13,.08,-.17]),
    age:styleValue(face,'age',[0,.12,.25,.48,.70,-.16]),
    brow:styleValue(face,'brows',[0,-.13,.15]), lash:styleValue(face,'lashes',[0,-.18,.18])
  };
}
function vertexChanges(v,style){
  const [x,y,z]=v,ax=Math.abs(x),sign=Math.sign(x),g=(u,a,w)=>Math.exp(-(((u-a)/w)**2));
  const front=T.MathUtils.smoothstep(z,.001,.041),cheek=g(ax,.045,.033)*g(y,.113,.030)*front;
  const nose=g(x,0,.014)*g(y,.126,.024)*front,lips=g(x,0,.027)*g(y,.084,.012)*front;
  const eye=g(ax,.031,.025)*g(y,.149,.016)*front,ear=g(ax,.075,.015)*g(y,.129,.030)*(1-front);
  return [x+sign*(style.cheeks*cheek+style.jaw*g(y,.069,.024)*g(ax,.050,.033)+style.ear*ear)+x*(style.noseWidth*nose+style.width*lips),
    y+style.chin*g(y,.049,.023)*front+style.forehead*g(y,.202,.035)*front+(y-.149)*style.gaze*eye+(y-.084)*style.lip*lips-style.age*.002*cheek,
    z+style.bridge*nose+style.lip*.008*lips+style.cheeks*.34*cheek];
}
function fitGeometry(obj,face){
  if(!face||!Object.values(shapeOptions(face)).some(Boolean))return false;
  const style=shapeOptions(face),g=obj.geometry.clone(),p=g.attributes.position,positions=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const v=vertexChanges([x,y,z],style);
    if(obj.material.name==='cilsMindfront'){v[1]+=(y-.151)*style.lash;v[2]+=(z-.062)*style.lash;}
    positions.set(v,3*i);
  }
  g.setAttribute('position',new T.BufferAttribute(positions,3));g.computeBoundingSphere();obj.geometry=g;return true;
}

function skinShader(mat,pose,style){
  mat.onBeforeCompile=s=>{
    Object.assign(s.uniforms,{lips:{value:pose.lips},fold:pose.fold,cosmetics:{value:style.makeup},browStyle:{value:style.brow},ageStyle:{value:style.age}});
    s.vertexShader='uniform vec4 lips;varying vec3 headRest;\n'+s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      headRest=position;
      float dx=abs(position.x); float line=.0826+.00068*cos(3.14159*min(dx/.0212,1.))-.00045*exp(-pow(dx/.0043,2.));
      float rel=position.y-line; float w=exp(-pow(dx/.030,4.))*smoothstep(.040,.067,position.z)*exp(-rel*rel/.00019);
      float lo=1.-smoothstep(-.0006,.0006,rel);
      transformed.x+=w*position.x*(-.31*lips.x+.12*lips.y);
      transformed.z+=w*(.0048*lips.x-.00065*lips.y-.0023*lips.z*lo);
      transformed.y+=w*(.0027*lips.z*lo-.00025*lips.w*(1.-2.*lo));`);
    s.fragmentShader='varying vec3 headRest;uniform float fold,cosmetics,browStyle,ageStyle;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      if(headRest.y<.030)discard;
      float d=abs(headRest.x)-.0478;float u=clamp(d/.0126,0.,1.);float w=.00035+.00018*u;
      float f=exp(-pow((headRest.y-(.1505+.24*d-.0006*u*u))/w,2.))+exp(-pow((headRest.y-(.1499-.16*d-.0006*u*u))/w,2.));
      float front=smoothstep(.021,.043,headRest.z);
      diffuseColor.rgb*=1.-(.135*fold+.067*max(ageStyle,0.))*sin(3.14159*u)*f*front;
      float brows=exp(-pow((abs(headRest.x)-.031)/.019,4.)-pow((headRest.y-.165)/.004,2.))*front;
      diffuseColor.rgb*=1.-browStyle*brows;
      float lips=exp(-pow(headRest.x/.022,4.)-pow((headRest.y-.084)/.0047,2.))*front;
      float eyes=exp(-pow((abs(headRest.x)-.031)/.022,4.)-pow((headRest.y-.157)/.0038,2.))*front;
      diffuseColor.rgb*=vec3(1.,1.-.19*cosmetics*lips,1.-.16*cosmetics*lips)*(1.-.16*cosmetics*eyes);`);
  };mat.customProgramCacheKey=()=>'marianne-face-1';
}
// The two iris discs share an atlas. Preserve pupil, limbal ring and sclera coverage as its mip level drops.
function shadeIris(mat,color){
  mat.onBeforeCompile=s=>{
    s.uniforms.eyeTint={value:new T.Color(color||'#6389a4')};
    s.uniforms.customEye={value:color?1:0};
    s.fragmentShader='uniform vec3 eyeTint;uniform float customEye;\n'+s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      vec2 q1=vMapUv-vec2(.705,.295),q2=vMapUv-vec2(.295,.705);
      vec2 q=dot(q1,q1)<dot(q2,q2)?q1:q2;
      float r=length(q),pixel=max(length(dFdx(vMapUv)),length(dFdy(vMapUv)));
      float edge=clamp(.63*pixel,.002,.065),farEye=smoothstep(.012,.081,pixel);
      float iris=1.-smoothstep(.124-edge,.124+edge,r);
      float pupil=1.-smoothstep(.052-edge,.052+edge,r);
      float ring=smoothstep(.105-edge,.105+edge,r)*iris;
      float tint=smoothstep(.002,.033,diffuseColor.b-diffuseColor.r)*smoothstep(.018,.10,diffuseColor.b);
      diffuseColor.rgb=mix(diffuseColor.rgb,eyeTint*(.30+2.6*dot(diffuseColor.rgb,vec3(.21,.72,.07))),customEye*tint);
      vec3 whites=mix(diffuseColor.rgb,vec3(.58,.60,.60),.72);
      vec3 painted=mix(whites,eyeTint*.79,iris);
      painted=mix(painted,eyeTint*.29,ring);
      painted=mix(painted,vec3(.014,.019,.023),pupil);
      diffuseColor.rgb=mix(diffuseColor.rgb,painted,farEye*.93);`);
    // Warm room lights can turn a two-pixel blue iris grey. Retain a little local
    // colour contrast and the filtered corneal catchlight at that distance.
    s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>',`
      float eyeLight=clamp(dot(outgoingLight,vec3(.21,.72,.07)),.024,.90);
      vec3 daylight=eyeTint/max(dot(eyeTint,vec3(.21,.72,.07)),.02);
      vec3 coloured=mix(outgoingLight,daylight*(eyeLight*.90+.018),.66);
      coloured*=1.-.38*pupil;
      vec3 readableWhite=outgoingLight*.94+vec3(.075,.085,.095);
      vec3 distanceLight=mix(readableWhite,coloured,iris);
      float glint=(1.-smoothstep(max(0.,.024-edge),.024+edge,length(q-vec2(-.036,.039))))*min(1.,.0012/max(.0012,pixel*pixel));
      distanceLight+=vec3(.22,.24,.27)*glint;
      outgoingLight=mix(outgoingLight,distanceLight,farEye);
      #include <opaque_fragment>`);
  };
  mat.customProgramCacheKey=()=>'marianne-eye-distance';
}
export function createFemaleHead(template,look){
  const group=template.scene.clone(true),rigs=[],owned=[],materials=[],face=look?.face;
  const pose={lips:new T.Vector4(),fold:{value:0}};
  let skin;
  group.traverse(o=>{
    if(!o.isMesh)return;
    o.material=o.material.clone();materials.push(o.material);o.castShadow=true;
    if(fitGeometry(o,face))owned.push(o.geometry);
    const m=o.material;
    if(m.name==='peau'){
      skin=o;skinShader(m,pose,{makeup:(face?.makeup||0)/4,brow:shapeOptions(face).brow,age:shapeOptions(face).age});
      if(look){const t=T.MathUtils.clamp((look.skinLevel-12)/90,0,1);m.color.setRGB(1-.80*t,1-.875*t,1-.90*t);}
    }else if(m.name==='iris'){const tint=look?.iris||(face?.iris?['#6689a5','#6b8464','#938053','#594030','#8a98a0'][face.iris]:null);shadeIris(m,tint);}
    const hair=/^(06|08|10|13)|Mèches_superposées|Duvet_et_mèches/.test(o.name)||['coiffure','chataignier','meches','fil1','fil2','fil3','Mèches châtain en relief','Reflets des racines'].includes(m.name);
    if(hair){o.visible=(!look||face?.hair===10)&&!look?.outfit?.chapeau;
      if(face?.hairTone){const dye=new T.Color(hairColors[face.hairTone]||hairColors[0]);m.color.r*=dye.r/.216;m.color.g*=dye.g/.095;m.color.b*=dye.b/.041;}
    }
    if(m.name==='Reflets des racines')m.forceSinglePass=true;
    if(o.morphTargetDictionary)rigs.push(o);
  });
  const mixer=new T.AnimationMixer(group);
  const actions=new Map(template.animations.map(c=>[c.name,mixer.clipAction(c).setLoop(T.LoopOnce,1)]));
  return {group,skin,pose,rigs,mixer,actions,
    reset(){mixer.stopAllAction();pose.lips.set(0,0,0,0);pose.fold.value=0;for(const o of rigs)o.morphTargetInfluences.fill(0);},
    weights(values){for(const o of rigs)for(const [name,i]of Object.entries(o.morphTargetDictionary))o.morphTargetInfluences[i]=values[name]||0;},
    talk(p){const blink=p?.blink||0;this.weights({Ouvrir:p?.jaw||0,Decouvrir:(p?.jaw||0)*.5,Plisser:blink});pose.lips.set(p?.round||0,p?.spread||0,0,0);pose.fold.value=0;},
    dispose(){mixer.stopAllAction();mixer.uncacheRoot(group);group.removeFromParent();for(const m of materials)m.dispose();for(const g of owned)g.dispose();}
  };
}
export function attachFemaleHead(actor,template,look){
  const body=actor.parts.find(p=>p.name==='body'),eyes=actor.parts.find(p=>p.name==='eyesNative');
  if(!body||!eyes)throw Error('Le corps féminin V27 est incomplet.');
  const head=createFemaleHead(template,look),hidden=[];
  for(const p of actor.parts){if(originalDetails.has(p.name)||hairNames.has(p.name)&&(!look||look.face.hair===10)&&!look?.outfit?.chapeau){hidden.push([p.obj,p.obj.visible]);p.obj.visible=false;}}
  actor.body.add(head.group);const bind=headBinding(body,eyes);bind.pose(head.group);
  const seam=joinNeck(actor,body,head.skin,head.group,bind.cut,.030);
  head.group.name='Marianne · référence féminine';head.group.userData.reference='marianne-v1';
  let stamp='';
  return Object.assign(head,{cut:bind.cut,follow(force=false){const next=actor.stamp;if(!force&&stamp===next)return;stamp=next;bind.pose(head.group);seam.update();},
    detach(){for(const [o,v]of hidden)o.visible=v;seam.dispose();head.dispose();}
  });
}
