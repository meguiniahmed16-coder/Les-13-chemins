import * as T from 'three';
import {createPrisonYoYo} from './prison-3d-yoyo.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export const CELL=Object.freeze({width:3,depth:3,height:2.72,area:9});
export const FURNITURE_URL='assets/prison/metal-stool-02.glb';
export const BRUSH_GRIP_HEIGHT=1.16;
const UP=new T.Vector3(0,1,0);

// Canvas textures are generated once at full resolution. They use mipmaps and
// anisotropic filtering, never nearest-neighbour scaling or a low-res canvas.
function surfaceTexture(kind,anisotropy){
 if(typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
 const ctx=canvas.getContext('2d');if(!ctx)return null;
 let seed=kind==='wood'?221:kind==='cloth'?117:89;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const base=kind==='wood'?'#ada18b':kind==='cloth'?'#d5d5cc':'#dfdcd2';
 ctx.fillStyle=base;ctx.fillRect(0,0,512,512);
 if(kind==='wood'){
  for(let i=0;i<390;i++){
   const y=random()*512;ctx.strokeStyle=`rgba(55,38,20,${.015+random()*.08})`;
   ctx.lineWidth=.4+random()*2.8;ctx.beginPath();ctx.moveTo(0,y);
   ctx.bezierCurveTo(160,y-7+random()*14,340,y-5+random()*10,512,y);ctx.stroke();
  }
 }else if(kind==='cloth'){
  ctx.strokeStyle='rgba(65,70,64,.065)';ctx.lineWidth=1;
  for(let i=0;i<512;i+=4){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,512);ctx.moveTo(0,i);ctx.lineTo(512,i);ctx.stroke();}
 }else{
  for(let i=0;i<100;i++){
   const x=random()*512,y=random()*512,r=12+random()*90;
   const g=ctx.createRadialGradient(x,y,0,x,y,r);
   g.addColorStop(0,`rgba(83,77,64,${.018+random()*.045})`);g.addColorStop(1,'rgba(83,77,64,0)');
   ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
  }
  for(let i=0;i<8500;i++){
   ctx.fillStyle=`rgba(72,67,57,${random()*.055})`;
   ctx.fillRect(random()*512,random()*512,.5+random(),.5+random());
  }
 }
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
 map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=anisotropy;
 map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;
 map.repeat.set(kind==='cloth'?2:1,kind==='cloth'?2:1);return map;
}

/** Complete closed room. Rendering and gameplay share these world dimensions. */
export function createPrisonRoom({anisotropy=4,textures=true}={}){
 const scene=new T.Scene();scene.name='CelluleImmersive';scene.background=new T.Color(0xaebbc0);
 const materials={
  plaster:new T.MeshStandardMaterial({color:0xc9c5b7,roughness:.94,map:textures?surfaceTexture('plaster',anisotropy):null}),
  floor:new T.MeshStandardMaterial({color:0x8b8a7d,roughness:.91,map:textures?surfaceTexture('plaster',anisotropy):null}),
  steel:new T.MeshStandardMaterial({color:0x4c5d59,roughness:.5,metalness:.48}),
  dark:new T.MeshStandardMaterial({color:0x242c2b,roughness:.72,metalness:.28}),
  wood:new T.MeshStandardMaterial({color:0xa18a68,roughness:.72,map:textures?surfaceTexture('wood',anisotropy):null}),
  linen:new T.MeshStandardMaterial({color:0xd2cbb7,roughness:1,map:textures?surfaceTexture('cloth',anisotropy):null}),
  blanket:new T.MeshStandardMaterial({color:0x657e77,roughness:1,map:textures?surfaceTexture('cloth',anisotropy):null}),
  ceramic:new T.MeshStandardMaterial({color:0xe5e4d7,roughness:.22,metalness:.03}),
  paper:new T.MeshStandardMaterial({color:0xd7c4a3,roughness:.95}),
  chrome:new T.MeshStandardMaterial({color:0xb8c5c5,metalness:.72,roughness:.24}),
  cloth:new T.MeshStandardMaterial({color:0xd6cdb6,roughness:1}),
  plastic:new T.MeshStandardMaterial({color:0xe9eee7,roughness:.35,transparent:true,opacity:.43,side:T.DoubleSide,depthWrite:false}),
 };
 const {plaster,floor:floorMat,steel,dark,wood,linen,blanket,ceramic,paper,chrome,cloth,plastic}=materials;
 function mesh(geo,mat,parent=scene){
  const m=new T.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
 }
 function box(w,h,d,x,y,z,mat=plaster,parent=scene,radius=0){
  const geo=radius?new RoundedBoxGeometry(w,h,d,3,Math.min(radius,w/2,h/2,d/2)):new T.BoxGeometry(w,h,d);
  const m=mesh(geo,mat,parent);m.position.set(x,y,z);return m;
 }
 function ellipsoid(rx,ry,rz,x,y,z,mat=linen,parent=scene){
  const m=mesh(new T.SphereGeometry(1,32,20),mat,parent);m.scale.set(rx,ry,rz);m.position.set(x,y,z);return m;
 }
 function rod(a,b,r,mat=steel,parent=scene){
  const from=new T.Vector3(...a),to=new T.Vector3(...b),direction=to.clone().sub(from);
  const m=mesh(new T.CylinderGeometry(r,r,direction.length(),20),mat,parent);
  m.position.copy(from).add(to).multiplyScalar(.5);m.quaternion.setFromUnitVectors(UP,direction.normalize());return m;
 }
 function torus(radius,tube,x,y,z,mat=ceramic,parent=scene){
  const m=mesh(new T.TorusGeometry(radius,tube,12,64),mat,parent);m.rotation.x=Math.PI/2;m.position.set(x,y,z);return m;
 }
 function lathe(points,x,y,z,mat=ceramic,parent=scene){
  const m=mesh(new T.LatheGeometry(points.map(p=>new T.Vector2(...p)),64),mat,parent);m.position.set(x,y,z);return m;
 }

 // Daylight has a tight shadow frustum, so the 2048px map covers this room,
 // instead of spending most of its resolution on empty exterior space.
 const hemi=new T.HemisphereLight(0xe3edf0,0x7f7766,2.25);scene.add(hemi);
 const sun=new T.DirectionalLight(0xfff2d5,3.25);sun.position.set(-.75,4.2,-4.8);
 sun.target.position.set(.2,.3,.1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
 Object.assign(sun.shadow.camera,{left:-2.4,right:2.4,top:2.7,bottom:-2.4,near:.2,far:12});
 sun.shadow.radius=2.5;sun.shadow.bias=-.00025;sun.shadow.normalBias=.012;scene.add(sun,sun.target);
 const bulb=new T.PointLight(0xffe0ad,7,5,2);bulb.position.set(.05,2.42,.4);scene.add(bulb);
 const windowLight=new T.PointLight(0xe2e3d6,4.6,4,2);windowLight.position.set(0,1.9,-1.3);scene.add(windowLight);

 box(3,.16,3,0,-.08,0,floorMat).name='SolCellule9m2';
 box(.16,CELL.height,3,-1.58,CELL.height/2,0).name='MurGauche';
 box(.16,CELL.height,3,1.58,CELL.height/2,0).name='MurDroit';
 box(3,.93,.16,0,.465,-1.55);box(3,.33,.16,0,2.555,-1.55);
 for(const x of [-1.16,1.16])box(.68,1.46,.16,x,1.66,-1.55);
 box(1.72,.08,.32,0,.97,-1.53,ceramic,scene,.015).name='AppuiFenetre';
 box(3,.10,3,0,2.77,0,plaster).name='Plafond';
 for(const x of [-1.485,1.485])box(.025,.12,3,x,.06,0,floorMat);
 box(3,.12,.025,0,.06,-1.455,floorMat);
 const frontWall=new T.Group();frontWall.name='ParoiAvantFermee';scene.add(frontWall);
 box(1.915,2.72,.16,-.5425,1.36,1.58,plaster,frontWall);
 box(.255,2.72,.16,1.3725,1.36,1.58,plaster,frontWall);
 box(.83,.475,.16,.83,2.4825,1.58,plaster,frontWall);
 const door=box(.83,2.23,.07,.83,1.13,1.47,steel,frontWall,.008);door.name='PorteCellule';
 for(const x of [.407,1.253])box(.04,2.3,.115,x,1.15,1.48,dark,frontWall,.004);
 box(.88,.04,.115,.83,2.282,1.48,dark,frontWall,.004);
 box(.38,.18,.025,.82,1.47,1.421,dark,frontWall,.008);
 box(.35,.145,.025,.82,1.47,1.402,steel,frontWall,.005).name='GuichetFerme';
 rod([1.17,1.05,1.38],[1.32,1.05,1.38],.017,chrome,frontWall);
 box(.045,.15,.022,1.2,1.02,1.414,dark,frontWall,.008);
 for(const y of [.35,1.87])box(.045,.12,.05,.44,y,1.409,chrome,frontWall,.007);
 for(let i=-3;i<=3;i++)rod([i*.21,1.03,-1.665],[i*.21,2.32,-1.665],.018,steel).name='Barreau'+(i+4);
 for(const y of [1.08,2.27])rod([-.77,y,-1.67],[.77,y,-1.67],.016,steel);
 // A quiet courtyard beyond the actual opening gives the window depth.
 box(12,6,.2,0,1,-7,new T.MeshStandardMaterial({color:0xaaa99c,roughness:1})).name='MurCour';
 for(const x of [-3.6,-1.8,0,1.8,3.6]){
  box(.7,1.05,.06,x,2.4,-6.85,new T.MeshStandardMaterial({color:0x6c7d7a,roughness:.9}));
  box(.85,.08,.16,x,1.84,-6.8,ceramic);
 }

 for(const y of [.40,1.42]){
  box(.87,.07,1.87,-1.02,y,.02,steel,scene,.018).name='Sommier';
  box(.81,.15,1.79,-1.02,y+.12,.02,linen,scene,.065).name='Matelas';
  box(.815,.065,1.30,-1.02,y+.224,.24,blanket,scene,.028).name='Couverture';
  box(.61,.105,.35,-1.02,y+.245,-.65,linen,scene,.05).name='Oreiller';
  for(const z of [-.97,.94])rod([-1.44,y+.32,z],[-.60,y+.32,z],.021,steel);
  for(let j=0;j<4;j++)rod([-1.40,y+.261,-.15+j*.2],[-.64,y+.261,-.15+j*.2],.0015,linen);
 }
 for(const x of [-1.44,-.60])for(const z of [-1.02,.96])rod([x,0,z],[x,1.84,z],.027);
 for(const z of [.66,.98])rod([-.55,.05,z],[-.55,1.76,z],.023);
 for(let i=0;i<6;i++)rod([-.55,.19+i*.27,.66],[-.55,.19+i*.27,.98],.019);
 rod([-1.44,1.95,.96],[-.60,1.95,.96],.022);
 box(.82,.065,.60,.82,.77,-.56,wood,scene,.022).name='TableCellule';
 for(const x of [.45,1.19])for(const z of [-.82,-.30])rod([x,.025,z],[x,.738,z],.024);
 rod([.45,.17,-.82],[1.19,.17,-.82],.018);
 const stoolAnchor=new T.Group();stoolAnchor.position.set(.45,0,.37);stoolAnchor.rotation.y=.15;
 stoolAnchor.name='Tabouret';scene.add(stoolAnchor);
 box(.55,1.68,.47,1.13,.84,.98,steel,scene,.014).name='Armoire';
 box(.495,1.57,.022,1.13,.84,.733,steel,scene,.008);
 for(let i=0;i<4;i++)box(.29,.012,.008,1.13,1.36+i*.035,.716,dark,scene,.003);
 rod([.96,.86,.701],[.96,1.1,.701],.007,chrome);
 box(.24,.025,.31,.82,.822,-.58,paper,scene,.004).name='Carnet';
 rod([.92,.84,-.67],[.92,.84,-.49],.004,dark);
 const mug=lathe([[.045,0],[.05,.005],[.05,.10],[.045,.105],[.04,.10],[.04,.015],[0,.015]],.58,.805,-.69,ceramic);
 mug.name='Tasse';const mugHandle=torus(.029,.006,.645,.86,-.69,ceramic);mugHandle.rotation.x=0;

 // Sanitary ceramics are smooth revolved profiles with real inner bowls.
 // They face the centre aisle from the right-hand wall.
 const wc=new T.Group();wc.name='WC';wc.position.set(1.2,0,.09);wc.rotation.y=-Math.PI/2;scene.add(wc);
 lathe([[0,0],[.14,0],[.155,.025],[.13,.11],[.105,.24],[.12,.31],[.16,.34]],0,0,0,ceramic,wc);
 const bowl=lathe([[.12,.27],[.18,.30],[.215,.40],[.222,.45],[.207,.47],[.19,.445],[.16,.37],[.08,.34],[0,.34]],0,0,0,ceramic,wc);
 bowl.scale.z=1.16;const rim=torus(.202,.023,0,.47,0,ceramic,wc);rim.scale.y=1.16;
 box(.44,.4,.16,0,.64,-.24,ceramic,wc,.045).name='ReservoirWC';
 box(.45,.035,.17,0,.85,-.24,ceramic,wc,.016);
 rod([-.13,.73,-.33],[-.06,.73,-.33],.012,chrome,wc);
 const water=mesh(new T.CircleGeometry(.10,48),new T.MeshStandardMaterial({color:0x9eafb0,roughness:.18}),wc);
 water.rotation.x=-Math.PI/2;water.position.y=.351;
 const sink=new T.Group();sink.name='Lavabo';sink.position.set(1.23,.91,-.99);sink.rotation.y=-Math.PI/2;scene.add(sink);
 const sinkBowl=lathe([[0,-.16],[.10,-.15],[.21,-.10],[.28,.015],[.282,.045],[.26,.057],[.24,.025],[.19,-.07],[.07,-.105],[0,-.105]],0,0,0,ceramic,sink);
 sinkBowl.scale.z=.76;
 box(.47,.06,.12,0,.025,-.18,ceramic,sink,.025);
 rod([0,-.16,0],[0,-.55,0],.032,chrome,sink);
 rod([0,.055,-.18],[0,.23,-.18],.015,chrome,sink);
 rod([0,.23,-.18],[0,.23,-.045],.014,chrome,sink);
 rod([0,.23,-.045],[0,.20,-.045],.014,chrome,sink);
 rod([-.06,.075,-.18],[.06,.075,-.18],.012,chrome,sink);
 box(.025,.48,.38,1.481,1.47,-.99,dark,scene,.015).name='CadreMiroir';
 box(.01,.43,.33,1.464,1.47,-.99,new T.MeshStandardMaterial({color:0xb9c9cc,metalness:.66,roughness:.19}),scene,.005).name='Miroir';
 rod([1.48,.61,-.65],[1.27,.61,-.65],.011,chrome);
 box(.035,.28,.14,1.28,.47,-.65,linen,scene,.01).name='Serviette';
 rod([.05,2.71,.4],[.05,2.53,.4],.016,dark);
 ellipsoid(.135,.09,.135,.05,2.48,.4,new T.MeshStandardMaterial({color:0xf3e4c7,emissive:0xffd696,emissiveIntensity:.7})).name='Ampoule';

 // YoYoAuDrap and SacPlastique share one physical attachment.
 const yoyo=createPrisonYoYo({cloth,steel,plastic});
 const rope=yoyo.root,packet=yoyo.packet;scene.add(rope);

 function brush(){
  const group=new T.Group();group.name='Brosse';
  rod([0,.11,0],[0,1.28,0],.016,wood,group);
  box(.32,.07,.115,0,.082,0,wood,group,.014);
  const bristles=new T.InstancedMesh(new T.CylinderGeometry(.0022,.0031,.05,5),new T.MeshStandardMaterial({color:0x6e5c41,roughness:1}),68);
  const matrix=new T.Matrix4();let index=0;
  for(let x=0;x<17;x++)for(let z=0;z<4;z++)bristles.setMatrixAt(index++,matrix.makeTranslation(-.144+x*.018,.027,-.042+z*.028));
  bristles.castShadow=true;bristles.receiveShadow=true;group.add(bristles);return group;
 }
 const floorBrush=brush();floorBrush.position.set(.24,0,.73);scene.add(floorBrush);
 const heldBrush=brush();heldBrush.visible=false;heldBrush.traverse(o=>{o.castShadow=false;});scene.add(heldBrush);
 const brushGripTarget=new T.Vector3(.24,BRUSH_GRIP_HEIGHT,.73);
 const floorBrushHalo=torus(.20,.006,.24,.012,.73,new T.MeshBasicMaterial({color:0xbdddac}));
 floorBrushHalo.castShadow=false;floorBrushHalo.visible=false;
 const windowHalo=mesh(new T.TorusGeometry(.065,.004,8,48),new T.MeshBasicMaterial({color:0xbdddac}));
 windowHalo.position.set(-.105,1.76,-1.70);windowHalo.castShadow=false;windowHalo.visible=false;

 function installFurniture(gltf){
  const root=gltf.scene;root.name='TabouretPolyHaven';
  root.traverse(o=>{
   if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;
   for(const mat of Array.isArray(o.material)?o.material:[o.material]){
    for(const key of ['map','normalMap','roughnessMap','metalnessMap'])if(mat[key])mat[key].anisotropy=anisotropy;
   }
  });
  stoolAnchor.add(root);return root;
 }
 return {scene,materials,frontWall,door,sun,yoyo,rope,packet,floorBrush,heldBrush,
  floorBrushHalo,windowHalo,brushGripTarget,installFurniture};
}
