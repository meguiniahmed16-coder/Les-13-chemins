/* Cellule d'essai tout 3D, sans sprite 2D et sans modification du jeu classique.
   Le corps GLB est Quaternius "Universal Base Characters" — CC0.
   Les volumes et textures de la cellule sont originaux, adaptés au témoignage.
*/
import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ropePosition,aligned,betweenBars} from './yoyo-core.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const COLOR={wall:'#c1c4b1',floor:'#6e7772',dark:'#2b3634',metal:'#535c5b',
 rust:'#947052',mattress:'#9ba29a',sheet:'#bfc2b0',wood:'#72644e',skin:'#bd8e72'};
const worldX=aim=>(aim-.5)*1.89;

export function buildPrisonScene(host,{onModelReady=()=>{},onModelError=()=>{}}={}){
 let renderer;
 try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'low-power',alpha:false});}
 catch(err){throw new Error('WebGL est nécessaire pour le prototype 3D : '+String(err));}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.22;
 renderer.shadowMap.enabled=false;
 host.append(renderer.domElement);
 const scene=new T.Scene();
 scene.background=new T.Color('#43545b');
 scene.fog=new T.Fog('#42525b',11,30);
 const camera=new T.PerspectiveCamera(57,16/9,.04,90);
 camera.position.set(.05,2.04,3.18);
 scene.add(new T.HemisphereLight('#ebf1eb','#45534b',2.0));
 const overhead=new T.PointLight('#f6e8b2',44,6.0,1.7);
 overhead.position.set(.2,2.45,.72);scene.add(overhead);
 const sunlight=new T.DirectionalLight('#d5eafa',2.15);
 sunlight.position.set(-1.8,4.4,-4.5);scene.add(sunlight);
 const prison=new T.Group();prison.name='CelluleTroisMetres';scene.add(prison);
 const props=new T.Group();props.name='ObjetsPrison';prison.add(props);
 const matter=(color,metalness=0,roughness=.88)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const mat={
  plaster:matter(COLOR.wall),stone:matter(COLOR.floor),steel:matter(COLOR.metal,.65,.43),
  rust:matter(COLOR.rust,.43,.84),white:matter('#d6dacf',.03,.45),fabric:matter(COLOR.mattress),
  sheet:matter(COLOR.sheet),wood:matter(COLOR.wood),brown:matter('#a2814d'),
  dark:matter(COLOR.dark),ink:matter('#323c40'),rubber:matter('#444a46'),
  coffee:matter('#775341'),tobacco:matter('#8f714b'),glass:matter('#b4d3cf',.16,.18)
 };
 function mesh(geo,material,at,parent=prison){
  const object=new T.Mesh(geo,material);object.position.set(...at);parent.add(object);
  object.castShadow=true;object.receiveShadow=true;return object;
 }
 function box(w,h,d,x,y,z,material=mat.plaster,parent=prison){
  return mesh(new T.BoxGeometry(w,h,d),material,[x,y,z],parent);
 }
 function tube(a,b,r,material=mat.steel,parent=prison){
  const A=new T.Vector3(...a),B=new T.Vector3(...b),length=A.distanceTo(B);
  const item=mesh(new T.CylinderGeometry(r,r,length,9),material,A.clone().add(B).multiplyScalar(.5).toArray(),parent);
  item.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),B.sub(A).normalize());
  return item;
 }
 function orb(x,y,z,rx,ry,rz,material=mat.rubber,parent=prison){
  const o=mesh(new T.SphereGeometry(1,16,10),material,[x,y,z],parent);
  o.scale.set(rx,ry,rz);return o;
 }
 // Stucco walls, concrete slabs and worn floor: real depth and occlusion.
 box(3.36,.12,3.6,0,-.07,-.04,mat.stone);
 box(.12,2.78,3.6,-1.71,1.39,-.04);
 box(.12,2.78,3.6,1.71,1.39,-.04);
 box(3.36,.10,3.58,0,2.83,-.04,mat.stone);
 // Cutout for a window in the FRONT wall; the sill and lintel are actual meshes.
 box(3.36,.95,.12,0,.46,-1.85);
 box(3.36,.48,.12,0,2.58,-1.85);
 box(.86,1.32,.13,-1.25,1.66,-1.85);
 box(.86,1.32,.13,1.25,1.66,-1.85);
 box(1.69,.09,.30,0,1.01,-1.74,mat.stone);
 // Rear wall is a partial cutaway for the third-person game camera.
 for(const x of [-1.37,1.37])box(.60,2.55,.12,x,1.27,1.70);
 box(3.36,.38,.12,0,2.58,1.70);
 const door=box(.65,1.96,.10,-.28,.99,1.75,mat.steel);
 box(.42,.20,.02,-.28,.54,1.69,mat.dark);
 tube([-.47,1.03,1.64],[-.2,1.03,1.64],.016,mat.white);
 for(let n=0;n<6;n++)box(.36,.018,.025,-.28,.42+n*.043,1.65,mat.rust);
 // Atmospheric concrete stains using scattered low-profile cracks.
 for(let i=0;i<26;i++){
  const x=-1.54+(i*1.31%2.98),y=.15+(i*.61%2.3);
  box(.014,.08+(i%5)*.07,.006,x,y,-1.778,mat.rust);
 }
 // 3D barred window with seven solid iron rods and visible free slots.
 const bars=[];
 for(let i=0;i<7;i++){
  const x= -.63+i*.21;
  const b=tube([x,1.06,-1.75],[x,2.33,-1.75],.020,mat.steel);
  b.name='BarreauFer'+(i+1);bars.push(b);
 }
 tube([-.75,1.1,-1.75],[.75,1.1,-1.75],.027,mat.rust);
 tube([-.75,2.34,-1.75],[.75,2.34,-1.75],.027,mat.rust);
 // Another gray building outside, changing color through the three deliveries.
 const outside=new T.Group();outside.position.set(0,0,-4.38);scene.add(outside);
 const facade=box(5.2,4.7,.54,0,2.0,0,matter('#858f93'),outside);
 for(let i=0;i<4;i++)for(let j=0;j<3;j++){
  box(.37,.52,.035,-1.65+i*1.12,1.18+j*1.12,.29,mat.dark,outside);
  box(.45,.064,.05,-1.65+i*1.12,.88+j*1.12,.32,mat.white,outside);
 }
 // Two-tier narrow welded bunk with genuine bedding, mattress and pillow.
 const bunk=new T.Group();bunk.name='LitSuperpose';prison.add(bunk);
 for(const x of [-1.53,-.66])for(const z of [-1.4,.55])
  tube([x,.06,z],[x,2.15,z],.032,mat.steel,bunk);
 for(const y of [.44,1.52]){
  box(.91,.07,2.06,-1.1,y,-.43,mat.steel,bunk);
  box(.83,.15,1.89,-1.1,y+.10,-.43,mat.fabric,bunk);
  box(.82,.038,1.26,-1.1,y+.19,-.18,mat.sheet,bunk);
  orb(-1.1,y+.24,-1.06,.34,.063,.20,mat.sheet,bunk);
  for(let j=0;j<7;j++)tube([-1.56,y+.29,-.94+j*.22],[-.66,y+.29,-.94+j*.22],.005,mat.rust,bunk);
 }
 for(let j=0;j<5;j++)tube([-.62,.27+j*.34,.51],[-.62,.27+j*.34,.20],.018,mat.steel,bunk);
 // Table, desk stool and simple metal wardrobe.
 const table=new T.Group();table.name='Table';prison.add(table);
 box(.93,.070,.67,1.06,.77,-.96,mat.wood,table);
 for(const x of [.69,1.43])for(const z of [-1.2,-.71])
  tube([x,.03,z],[x,.74,z],.022,mat.steel,table);
 box(.33,.057,.37,1.04,.44,-.36,mat.wood);
 for(const x of [.89,1.19])for(const z of [-.53,-.18])
  tube([x,.05,z],[x,.41,z],.017,mat.steel);
 const wardrobe=new T.Group();wardrobe.name='Armoire';prison.add(wardrobe);
 box(.62,1.67,.49,1.26,.85,.99,mat.rust,wardrobe);
 box(.012,1.61,.021,1.26,.84,.735,mat.steel,wardrobe);
 tube([1.06,.87,.715],[1.06,.99,.715],.014,mat.white,wardrobe);
 // Real volume sanitary fixtures, no flat textures for sink and WC.
 const toilet=new T.Group();toilet.name='Toilettes';prison.add(toilet);
 box(.39,.36,.52,1.15,.20,.26,mat.white,toilet);
 orb(1.15,.43,.24,.23,.058,.30,mat.white,toilet);
 orb(1.15,.46,.24,.15,.033,.23,mat.dark,toilet);
 box(.40,.49,.10,1.19,.64,.62,mat.white,toilet);
 const sink=new T.Group();sink.name='Lavabo';prison.add(sink);
 box(.49,.14,.35,1.18,1.02,-.29,mat.white,sink);
 orb(1.18,1.10,-.27,.175,.021,.105,mat.dark,sink);
 tube([1.18,1.15,-.40],[1.18,1.30,-.40],.022,mat.steel,sink);
 tube([1.18,1.30,-.40],[1.18,1.30,-.26],.023,mat.steel,sink);
 box(.02,.51,.39,1.67,1.59,-.29,mat.steel);
 box(.014,.48,.34,1.652,1.59,-.29,mat.glass);
 // Objects are physically present at the true positions used by the gameplay.
 const broom=new T.Group();broom.name='BrosseToilette3D';prison.add(broom);
 broom.position.set(.46,.02,-.44);
 tube([0,.08,0],[0,.74,.06],.027,mat.wood,broom);
 orb(0,.10,0,.075,.11,.07,mat.white,broom);
 for(let j=0;j<7;j++)tube([Math.cos(j*2.3)*.048,.07,Math.sin(j*2.3)*.048],
  [Math.cos(j*2.3)*.071,.14,Math.sin(j*2.3)*.071],.013,mat.white,broom);
 // Stretching rope, metal hanger and a visible bag outside the barred window.
 const cargo=new T.Group();cargo.name='YoyoDuVoisin';scene.add(cargo);
 const bag=orb(0,0,0,.073,.095,.061,mat.tobacco,cargo);
 const hangerA=tube([-.075,.08,0],[0,.20,0],.006,mat.steel,cargo);
 const hangerB=tube([0,.20,0],[.075,.08,0],.006,mat.steel,cargo);
 tube([-.075,.08,0],[.075,.08,0],.006,mat.steel,cargo);
 const ropeMaterial=new T.LineBasicMaterial({color:'#e3cb9a'});
 const ropePoints=[new T.Vector3(),new T.Vector3()];
 const ropeGeometry=new T.BufferGeometry().setFromPoints(ropePoints);
 const rope=new T.Line(ropeGeometry,ropeMaterial);scene.add(rope);
 const tool=new T.Group();tool.name='BrosseTenueParLeDetenu';prison.add(tool);
 tube([0,-.46,0],[0,.47,0],.020,mat.wood,tool);
 orb(0,.49,0,.060,.082,.060,mat.white,tool);
 tool.visible=false;
 // A body (not a hand sprite) dressed in neutral prison clothes.
 let actor=null,bones=null,rest=null;
 const avatarRoot=new T.Group();avatarRoot.name='DetenuQuaterniusCC0';scene.add(avatarRoot);
 const orbit={side:false};
 const modelPromise=new GLTFLoader().loadAsync('danse-quaternius-hero.glb').then(gltf=>{
  actor=gltf.scene;actor.name='CorpsHumainQuaterniusCC0';actor.scale.setScalar(1.17);
  actor.traverse(obj=>{
   if(!obj.isMesh)return;
   obj.castShadow=true;obj.receiveShadow=true;
   if(obj.isSkinnedMesh){
    const geom=obj.geometry.clone(),position=geom.getAttribute('position');
    if(position&&position.count>3000){
     const cols=new Float32Array(position.count*3);
     const palette={
      top:new T.Color('#747f7d'),pants:new T.Color('#606968'),
      feet:new T.Color('#343c3c'),face:new T.Color(COLOR.skin)};
     for(let i=0;i<position.count;i++){
      const x=Math.abs(position.getX(i)),y=position.getY(i);
      const chosen=y<.14?palette.feet:y<.98?palette.pants:
       y<1.48&&x<.57?palette.top:palette.face;
      cols[i*3]=chosen.r;cols[i*3+1]=chosen.g;cols[i*3+2]=chosen.b;
     }
     geom.setAttribute('color',new T.BufferAttribute(cols,3));
     obj.geometry=geom;
     obj.material=new T.MeshStandardMaterial({vertexColors:true,roughness:.92});
    }
   }
  });
  const names=['pelvis','spine_02','upperarm_l','upperarm_r',
   'lowerarm_l','lowerarm_r','thigh_l','thigh_r','Head'];
  bones=Object.fromEntries(names.map(n=>[n,actor.getObjectByName(n)]));
  if(!bones.upperarm_l?.isBone||!bones.upperarm_r?.isBone)
   throw new Error('Rig humanoïde CC0 sans épaules animables');
  rest=Object.fromEntries(Object.entries(bones).filter(([,v])=>v).map(([n,v])=>[n,v.quaternion.clone()]));
  avatarRoot.add(actor);onModelReady({model:'Quaternius Universal Base Characters CC0',bones:Object.keys(rest).length});
  return actor;
 }).catch(err=>{onModelError(err);return null;});
 const X=new T.Vector3(1,0,0),Z=new T.Vector3(0,0,1);
 function bend(bone,axis,angle){
  if(!bone?.parent)return;
  bone.parent.updateMatrixWorld(true);
  const localAxis=axis.clone().applyQuaternion(bone.parent.getWorldQuaternion(new T.Quaternion()).invert());
  bone.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(localAxis,angle));
 }
 function pose(g,t){
  avatarRoot.position.set(0,0,.65);
  avatarRoot.rotation.y=Math.sin(t*.45)*.035+(g.hidden?.35:0);
  if(!bones||!rest)return;
  for(const [n,q] of Object.entries(rest))bones[n].quaternion.copy(q);
  const idle=Math.sin(t*1.55)*.025;
  const reaching=g.part>0?Math.min(.55,g.pull*.5+.22):.0;
  bend(bones.upperarm_l,Z,1.23+idle);
  bend(bones.upperarm_r,Z,-1.20+idle-reaching);
  bend(bones.upperarm_r,X,-.32-.78*(g.part>0||g.holding?1:.35));
  bend(bones.lowerarm_r,X,-.23-.42*(g.part>0?1:.4));
  bend(bones.upperarm_l,X,-.09);
  bend(bones.lowerarm_l,X,-.16);
  bend(bones.Head,Z,Math.sin(t*.65)*.015);
  bend(bones.thigh_l,X,Math.sin(t*.80)*.018);
  bend(bones.thigh_r,X,-Math.sin(t*.8)*.018);
  if(g.hidden){bend(bones.spine_02,X,.32);bend(bones.thigh_l,X,.25);bend(bones.thigh_r,X,.23);}
 }
 const target=new T.Vector3(.05,1.36,-.50),position=new T.Vector3(.05,2.05,3.03);
 function render(g,t,dt=1/60){
  // Camera can orbit from a third-person shoulder to a side inspection view.
  const destination=orbit.side?new T.Vector3(2.35,1.86,2.36):new T.Vector3(.05,2.05,3.04);
  position.lerp(destination,clamp(dt*2.7,0,.12));
  camera.position.copy(position);
  target.set(0,1.34,orbit.side?-.25:-.55);
  camera.lookAt(target);
  pose(g,t);
  const part=Math.max(0,Math.min(2,g.part));
  broom.visible=part===0;
  tool.visible=part>=1;
  // The brush follows an actual moving arm, instead of a 2D replacement hand.
  tool.position.set(worldX(g.aim),1.16+Math.sin(t*2)*.018,-.72+Math.min(.25,g.pull*.25));
  tool.rotation.set(.42,0,-.34);
  // In-game aiming corresponds to the physical space between metal bars.
  const targetX=worldX(g.hooked?g.hookX??g.aim:ropePosition(g));
  cargo.visible=part>=1&&g.phase!=='victory';
  cargo.position.set(targetX,1.43+Math.sin(t*1.3)*.045,-2.06+g.pull*.75);
  bag.material=part===2?mat.coffee:mat.tobacco;
  const vertices=new Float32Array([targetX,2.82,-2.10,targetX,1.67+Math.sin(t*1.3)*.045,-2.05+g.pull*.75]);
  ropeGeometry.setAttribute('position',new T.BufferAttribute(vertices,3));
  ropeGeometry.attributes.position.needsUpdate=true;
  rope.visible=cargo.visible;
  broom.scale.setScalar(aligned(g)&&part===0?1.045:1);
  if(part>=1)tool.scale.setScalar(g.hooked?1.04:1);
  // Material colors transition as a reward, not by replacing scene backgrounds.
  facade.material.color.set(part>=2?'#a1b0a7':part===1?'#929e9a':'#858f93');
  if(g.phase==='victory')facade.material.color.set('#b5c5b3');
  renderer.render(scene,camera);
 }
 function resize(){
  const rect=host.getBoundingClientRect();
  const width=Math.max(320,Math.round(rect.width)),height=Math.max(210,Math.round(rect.height));
  renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
 }
 resize();
 const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;
 observer?.observe(host);
 function dispose(){
  observer?.disconnect();renderer.dispose();
  prison.traverse(obj=>{if(obj.isMesh){obj.geometry.dispose();}});
  ropeGeometry.dispose();
 }
 return {scene,camera,prison,actor:avatarRoot,modelPromise,bars,bunk,broom,table,wardrobe,toilet,sink,
  cargo,tool,render,resize,dispose,
  orbit(){orbit.side=!orbit.side;return orbit.side;},
  geometry:{length:3.36,width:3.6,height:2.83,bars:bars.length,bedLevels:2},
  targetX:worldX,canPassBars:betweenBars};
}
