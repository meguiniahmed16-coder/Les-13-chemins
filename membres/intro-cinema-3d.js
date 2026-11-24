import * as T from 'three';
const host=document.getElementById('stage'),root=document.getElementById('world');
if(root)root.style.display='none';
const canvas=document.createElement('canvas');
canvas.id='cinema3d';
Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',display:'block',touchAction:'none'});
host.prepend(canvas);
const scene=new T.Scene();scene.background=new T.Color(0xfafaf9);
const camera=new T.PerspectiveCamera(43,1,.08,90);
const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.55;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
const hemi=new T.HemisphereLight(0xffffff,0xd3d0cc,3);scene.add(hemi);
const key=new T.DirectionalLight(0xffffff,2.8);key.position.set(-5,9,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);
key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;scene.add(key);
const fill=new T.DirectionalLight(0xffffff,1.3);fill.position.set(5,5,-5);scene.add(fill);
const mat=(c,roughness=.88,metalness=.0)=>new T.MeshStandardMaterial({color:c,roughness,metalness});
const WHITE=mat(0xf5f4f0),IVORY=mat(0xefede7),EDGE=mat(0xb7b5b0),DARK=mat(0x313b35),SKIN=mat(0xcaa88f),BROWN=mat(0x916b4f);
const geo={box:new T.BoxGeometry(1,1,1),sphere:new T.SphereGeometry(1,18,14),cyl:new T.CylinderGeometry(1,1,1,18)};
const model=(parent,geometry,material,p,s)=>{const mesh=new T.Mesh(geometry,material);mesh.position.set(...p);if(s)mesh.scale.set(...s);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh};
const shape=(parent,material,p,s)=>model(parent,geo.box,material,p,s);
const sphere=(parent,material,p,s)=>model(parent,geo.sphere,material,p,s);
const cyl=(parent,material,p,s)=>model(parent,geo.cyl,material,p,s);
const ground=shape(scene,mat(0xfafaf8),[0,-.12,0],[55,.18,55]);ground.castShadow=false;
const stage=new T.Group();scene.add(stage);
function chair(x){
 const g=new T.Group();g.position.x=x;g.position.z=0;stage.add(g);
 shape(g,IVORY,[0,.45,-.02],[1.48,.32,1.15]);
 shape(g,WHITE,[0,1.1,-.46],[1.46,1.33,.27]);
 for(const side of [-1,1]){shape(g,IVORY,[side*.69,.71,-.05],[.27,.52,1.16]);shape(g,EDGE,[side*.69,.58,.48],[.22,.07,.13]);}
 for(const side of [-1,1])for(const z of [-.38,.4])shape(g,BROWN,[side*.55,.15,z],[.12,.27,.12]);
 const cushion=shape(g,WHITE,[0,.63,.02],[1.08,.18,.94]);cushion.rotation.x=-.065;
 return g
}
chair(-1.23);chair(1.23);
const tv=new T.Group();tv.position.set(0,1.15,3.5);tv.rotation.y=Math.PI;stage.add(tv);
shape(tv,DARK,[0,0,0],[2.25,1.3,.15]);shape(tv,mat(0x152520,.3),[0,0,.085],[2.08,1.12,.015]);
shape(tv,mat(0x474c45,.5),[0,-.9,0],[.11,.51,.13]);shape(tv,DARK,[0,-1.17,0],[.85,.08,.42]);
const screen=document.createElement('canvas');screen.width=640;screen.height=350;
const ctx=screen.getContext('2d');const tex=new T.CanvasTexture(screen);tex.colorSpace=T.SRGBColorSpace;
const screenmesh=shape(tv,new T.MeshBasicMaterial({map:tex}),[0,0,.099],[1.98,1.03,.01]);screenmesh.castShadow=false;
function tvText(text){
 ctx.fillStyle='#182724';ctx.fillRect(0,0,640,350);
 ctx.textAlign='center';ctx.fillStyle='#dee9df';ctx.font='33px Georgia';ctx.fillText(text||' ',320,180);tex.needsUpdate=true
}
function human(x,sex){
 const g=new T.Group();g.position.set(x,0,-.01);stage.add(g);
 const body=new T.Group();g.add(body);
 // Uninterrupted white fabric: no logos, no colored belt.
 shape(body,WHITE,[0,1.06,.12],[.49,.67,.35]);
 const vleft=shape(body,IVORY,[-.11,1.23,.31],[.22,.42,.025]);vleft.rotation.z=-.48;
 const vright=shape(body,WHITE,[.11,1.23,.32],[.22,.42,.025]);vright.rotation.z=.48;
 shape(body,WHITE,[0,.84,.31],[.5,.075,.37]);
 for(const sign of [-1,1]){
  const arm=new T.Group();arm.position.set(sign*.30,1.34,.05);body.add(arm);
  const sleeve=shape(arm,WHITE,[sign*.11,-.2,.04],[.26,.4,.30]);sleeve.rotation.z=sign*.15;
  sphere(arm,SKIN,[sign*.14,-.48,.11],[.095,.115,.085]);
  // seated thigh, shins, feet
  shape(g,WHITE,[sign*.19,.51,.45],[.3,.25,.67]);
  shape(g,WHITE,[sign*.19,.25,.78],[.28,.48,.22]);
  shape(g,mat(0xe7e5df),[sign*.19,.07,.93],[.29,.11,.42]);
 }
 cyl(body,SKIN,[0,1.67,.04],[.077,.20,.075]);
 sphere(body,SKIN,[0,1.9,.04],[.22,.265,.205]);
 sphere(body,mat(sex==='narrator'?0x544c40:0x45392f),[0,2.11,-.025],[.23,.11,.22]);
 for(const sign of [-1,1])sphere(body,DARK,[sign*.080,1.925,.227],[.014,.017,.01]);
 return g
}
const n=human(-1.23,'narrator'),p=human(1.23,'player');
const rear={pos:new T.Vector3(0,1.92,-6.8),target:new T.Vector3(0,1.07,0)};
const front={pos:new T.Vector3(0,1.97,5.85),target:new T.Vector3(0,1.12,-.04)};
const slight={pos:new T.Vector3(-3.2,2,4.95),target:new T.Vector3(0,1.12,0)};
const current={pos:front.pos.clone(),target:front.target.clone()};
let from={pos:front.pos.clone(),target:front.target.clone()},to=front,started=performance.now(),duration=3200;
const clock=new T.Clock();let step=0,dragging=false,oldX=0;
function goto(dest,ms=3400){from={pos:current.pos.clone(),target:current.target.clone()};to=dest;started=performance.now();duration=ms}
const smooth=t=>t*t*(3-2*t);
function draw(){
 const t=smooth(T.MathUtils.clamp((performance.now()-started)/duration,0,1));
 current.pos.copy(from.pos).lerp(to.pos,t);current.target.copy(from.target).lerp(to.target,t);
 camera.position.copy(current.pos);camera.lookAt(current.target);
 const tm=clock.getElapsedTime();n.rotation.y=Math.sin(tm*.23)*.014;p.rotation.y=Math.sin(tm*.19)*.013;
 renderer.render(scene,camera);requestAnimationFrame(draw)
}
function size(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
new ResizeObserver(size).observe(host);size();
window.__intro3d={show(i){
 step=i;const visible=i>=4&&i<15;stage.visible=visible;
 if(i===5)goto(rear,4200);
 else if(i>=6&&i<=9)goto(rear,2100);
 else if(i===10)goto(slight,2800);
 else if(i===11)goto(front,2900);
 else if(i>=12&&i<=14)goto(front,1700);
 else goto(front,1500);
 tvText(i>=5&&i<10?'LE MONDE DES MASQUES':i<15?'UN AUTRE MONDE':'');
},reset(){goto(front,1)}};
stage.visible=false;draw();
