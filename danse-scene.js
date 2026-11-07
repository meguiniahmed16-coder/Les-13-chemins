import * as T from 'three';
import {SoftwareRenderer} from './danse-software.js';
import {BEAT} from './danse-core.js';
const palette={purple:0x8736e8,mint:0x8fffd1,pink:0xff5aaf,gold:0xffca6e};
const mats=new Map();function material(color,metal=.0){const key=color+':'+metal;if(!mats.has(key))mats.set(key,new T.MeshStandardMaterial({color,roughness:metal?.32:.65,metalness:metal}));return mats.get(key);}
function mesh(g,m,parent,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function box(p,w,h,d,c,x=0,y=0,z=0){const o=mesh(new T.BoxGeometry(w,h,d,w>9?10:1,h>3?8:1,d>8?8:1),material(c),p,x,y,z);if(w>9)o.userData.layer=h<1?-6:-7;else if(h>3)o.userData.layer=-5;else if(h<.05)o.userData.layer=-3;return o;}
function ellipsoid(p,x,y,z,sx,sy,sz,c){const o=mesh(new T.SphereGeometry(1,12,8),material(c),p,x,y,z);o.scale.set(sx,sy,sz);return o;}
function cylinder(p,r1,r2,h,c,x=0,y=0,z=0){return mesh(new T.CylinderGeometry(r1,r2,h,12),material(c),p,x,y,z);}
function neon(p,w,h,d,c,x,y,z){return mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({color:c}),p,x,y,z);}
function sign(p,text,w,h,x,y,z,bg='#34214d',fg='#f5e7ff',size=80){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.fillStyle=fg;ctx.font=`700 ${size}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,132);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex}),p,x,y,z);m.userData.sign=y>3;return m;}
function human({shirt=palette.purple,skin=0xc58c69,pants=0x251c35,hair=false,female=false,simple=false}={}){
 const group=new T.Group(),hip=new T.Group(),body=new T.Group();hip.position.y=1.1;group.add(hip);hip.add(body);
 const waist=cylinder(body,.23,.19,.62,shirt,0,.35,0);waist.scale.z=.64;
 ellipsoid(body,0,.64,0,.34,.14,.15,shirt);
 cylinder(body,.087,.11,.16,skin,0,.77,0);
 const head=new T.Group();head.position.y=.99;body.add(head);ellipsoid(head,0,0,0,.165,.225,.165,skin);
 if(!simple){ellipsoid(head,0,-.02,.16,.035,.045,.05,skin);for(const s of [-1,1]){ellipsoid(head,s*.071,.042,.145,.025,.017,.017,0xfaf3e6);ellipsoid(head,s*.071,.041,.16,.011,.012,.008,0x241927);ellipsoid(head,s*.168,0,0,.028,.047,.03,skin);}box(head,.075,.012,.012,0x8d474b,0,-.09,.153);}
 if(hair){ellipsoid(head,0,.13,-.025,.175,.13,.17,0x332238);if(female)ellipsoid(head,0,-.02,-.13,.17,.26,.1,0x332238);}
 if(!female&&!simple){for(let i=0;i<4;i++)ellipsoid(body,0,.13+i*.12,.157,.012,.012,.008,0xe2c6ff);for(const s of [-1,1]){const collar=box(body,.1,.16,.025,0xb67bf7,s*.075,.67,.14);collar.rotation.z=s*-.42;}box(body,.45,.045,.27,0x241e2b,0,.02,0);box(body,.06,.04,.02,0xbda4cb,0,.02,.145);}
 if(female){const skirt=cylinder(hip,.2,.35,.34,shirt,0,-.1,0);skirt.scale.z=.68;}
 const arms=[],legs=[];
 for(const side of [-1,1]){const shoulder=new T.Group();shoulder.position.set(side*.3,.61,0);body.add(shoulder);const elbow=new T.Group();elbow.position.y=-.37;shoulder.add(elbow);cylinder(shoulder,.09,.065,.37,female?skin:shirt,0,-.185,0);ellipsoid(shoulder,0,0,0,.1,.105,.1,female?skin:shirt);cylinder(elbow,.064,.045,.33,female?skin:shirt,0,-.165,0);ellipsoid(elbow,0,-.36,0,.055,.075,.04,skin);arms.push({shoulder,elbow});
 const upper=new T.Group();upper.position.set(side*.15,0,0);hip.add(upper);const knee=new T.Group();knee.position.y=-.52;upper.add(knee);cylinder(upper,.105,.075,.51,female?skin:pants,0,-.25,0);cylinder(knee,.075,.05,.49,female?skin:pants,0,-.245,0);ellipsoid(knee,0,-.5,.07,.08,.055,.16,female?0xf1d6ec:0xedeaf3);legs.push({upper,knee});}
 group.traverse(o=>{if(o.isMesh)o.userData.character=true;});return {group,hip,body,head,arms,legs};
}
function pose(h,t,action='cross',power=1){const beat=t/BEAT*Math.PI*2,s=Math.sin(beat),s2=Math.sin(beat/2),swing=.28*power;
 h.hip.position.y=1.08+Math.abs(s)*.045*power;h.hip.rotation.z=s2*.055*power;h.body.rotation.y=s2*.14*power;h.body.rotation.z=-s2*.065*power;h.head.rotation.z=s2*.045*power;
 h.group.rotation.y=action==='circle'?t%1.3/1.3*Math.PI*2:0;
 h.arms.forEach(({shoulder,elbow},i)=>{const side=i===0?-1:1;shoulder.rotation.set(swing*Math.sin(beat+side),0,side*(.2+Math.max(0,s)*.12));elbow.rotation.x=-.6-Math.max(0,-s)*.5*power;if(action==='square'){shoulder.rotation.z=side*(1.35+Math.sin(beat/2)*.25);shoulder.rotation.x=-.3;elbow.rotation.x=-.7;}if(action==='circle'){shoulder.rotation.z=side*1.15;elbow.rotation.x=-.35;}});
 h.legs.forEach(({upper,knee},i)=>{const side=i===0?-1:1;upper.rotation.x=side*s*.22*power;upper.rotation.z=side*(.05+Math.abs(s)*.07*power);knee.rotation.x=Math.max(0,-side*s)*.35*power;});
 if(action==='left'||action==='right'){h.body.rotation.z=(action==='left'?1:-1)*.12;h.legs[0].upper.rotation.z=-.21;h.legs[1].upper.rotation.z=.21;}
}
export class DanceScene{
 constructor(canvas){this.canvas=canvas;this.reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;this.low=matchMedia('(max-width:650px)').matches;try{this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch{this.renderer=new SoftwareRenderer(canvas);this.low=true;}this.renderer.setPixelRatio(Math.min(devicePixelRatio,this.low?1.25:1.6));this.renderer.shadowMap.enabled=!this.low;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;this.scene=new T.Scene();this.scene.background=new T.Color(0x21102e);this.scene.fog=new T.Fog(0x21102e,25,50);this.camera=new T.PerspectiveCamera(43,1,.1,70);
 this.scene.add(new T.HemisphereLight(0xf5dcff,0x47315e,2.1));const key=new T.DirectionalLight(0xfff0db,3.3);key.position.set(-3,8,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-10;key.shadow.camera.right=10;key.shadow.camera.top=10;key.shadow.camera.bottom=-10;this.scene.add(key);const fill=new T.DirectionalLight(0x9ddfff,1.4);fill.position.set(6,4,1);this.scene.add(fill);const rim=new T.DirectionalLight(0xe78dff,2);rim.position.set(-5,5,-4);this.scene.add(rim);
 this.build();this.resize();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas.parentElement);canvas.dataset.renderer=this.renderer.isSoftware?'3D compatible':'WebGL 2';
 }
 build(){const s=this.scene;
 box(s,24,.3,18,0x1d152e,0,-.3,0);box(s,15,.18,9,0x433154,0,-.17,-1.3);box(s,15,.08,9.1,0x9253bd,0,-.18,-1.3);
 for(let x=-6;x<=6;x+=2)for(let z=-4;z<=2;z+=2)box(s,1.97,.012,1.97,(x+z)%4===0?0x51345f:0x614474,x,0,z);
 for(const z of [-5.8,3.1])neon(s,15,.04,.04,palette.pink,0,.03,z);for(const x of [-7.5,7.5])neon(s,.04,.04,9,palette.mint,x,.03,-1.35);
 box(s,22,8,.5,0x2e173f,0,3.7,-7);for(let x=-10;x<=10;x+=1.3){box(s,.28,7,.15,x%2?0x543174:0x402351,x,3.3,-6.65);}
 for(const x of [-7.2,-5.2,5.2,7.2]){cylinder(s,.22,.22,6.7,0x775498,x,3.1,-5.8);neon(s,.09,6.2,.09,x<0?palette.pink:palette.mint,x,3,-5.55);}
 sign(s,'QUI EST LE DANSEUR ?',8.7,1.6,0,4.1,-6.4,'#4e2578','#d2ffe9',67);sign(s,'LE GRAND JEU  •  STUDIO 13',6,.45,0,3.18,-6.25,'#322043','#d6b8ef',43);
 const ring=mesh(new T.TorusGeometry(2.9,.055,6,60,Math.PI),new T.MeshBasicMaterial({color:palette.pink}),s,0,3.5,-6.15);ring.scale.set(1.7,.7,1);
 this.candidates=[];const colors=[0x6bb7ba,0xe7b564,0xac729e,0x92a38a,0xb9816d];for(let i=0;i<5;i++){const x=(i-2)*1.7;const h=human({shirt:colors[i],skin:i%2?0xdca788:0xb17a58,hair:true,simple:true});h.group.position.set(x,.14,-4.8);h.group.scale.setScalar(.85);s.add(h.group);this.candidates.push(h);box(s,1.35,1.1,.75,0x6e4593,x,.55,-4.25);box(s,1.48,.1,.88,0xb7a0d1,x,1.14,-4.25);neon(s,1.06,.06,.02,palette.mint,x,.32,-3.86);sign(s,String(i+1),.36,.3,x,.73,-3.86,'#573674','#d6fff1',130);}
 // Soft oval pools place each performer on the polished stage.
 for(const [x,z,r] of [[0,.45,1.3],[-2.1,-.7,.8],[2.1,-.7,.8],[-3.6,-1.9,.7],[3.6,-1.9,.7]]){const disk=mesh(new T.CircleGeometry(r,32),new T.MeshBasicMaterial({color:x<0?0xbd73a1:x>0?0x6aada5:0xa985c7}),s,x,.025,z);disk.rotation.x=-Math.PI/2;disk.userData.layer=-2;}
 this.hero=human();this.hero.group.position.set(0,.04,.45);this.hero.group.scale.setScalar(1.2);s.add(this.hero.group);
 this.dancers=[];for(const [i,[x,z]] of [[-2.1,-.7],[2.1,-.7],[-3.6,-1.9],[3.6,-1.9]].entries()){const h=human({shirt:i%2?palette.mint:palette.pink,skin:i%2?0x9e664b:0xe0aa88,female:true,hair:true});h.group.position.set(x,.04,z);h.group.scale.setScalar(1.02);h.baseX=x;h.baseZ=z;s.add(h.group);this.dancers.push(h);}
 this.lionel=human({shirt:0xadc1c2,pants:0x2b253a,skin:0xd1a084,hair:true});this.lionel.group.position.set(5.5,.04,-.15);this.lionel.group.scale.setScalar(.92);s.add(this.lionel.group);sign(s,'LIONEL',1.2,.3,5.5,2.35,-.1,'#30233f','#b6ffdc',78);
 // The audience faces the performers, seen from behind along the front of frame.
 this.public=[];for(let row=0;row<2;row++)for(let i=0;i<8;i++){const x=(i-3.5)*1.16;const z=5.3+row*1.4;box(s,1,.58,.85,0x46274f,x,.1+row*.22,z);const g=new T.Group();g.position.set(x,.25+row*.22,z);g.rotation.y=Math.PI;s.add(g);ellipsoid(g,0,.68,0,.25,.35,.17,[0x92719b,0x5f7c88,0xa9836c,0x7c8a6b][i%4]);ellipsoid(g,0,1.15,0,.16,.21,.16,[0xbf8b67,0xdbb191,0x93664e][i%3]);ellipsoid(g,0,1.27,-.04,.17,.12,.16,0x372c36);const arms=[];for(const a of [-1,1]){const arm=new T.Group();arm.position.set(a*.23,.85,0);g.add(arm);cylinder(arm,.06,.045,.45,0xa67f6a,0,-.2,0);arms.push(arm);}this.public.push({group:g,arms});}
 // Studio cameras, rails, speaker stacks and lighting rig.
 for(const x of [-6.3,6.3]){box(s,.8,1.5,.7,0x191622,x,.75,3.5);for(const y of [.45,1.05]){const sp=cylinder(s,.24,.24,.05,0x3f354e,x,y,3.88);sp.rotation.x=Math.PI/2;}cylinder(s,.05,.05,1.1,0x4a4057,x,1.95,3.5);box(s,.65,.4,.7,0x252233,x,2.65,3.5);const lens=cylinder(s,.16,.2,.24,0x1a1723,x,2.65,3.02);lens.rotation.x=Math.PI/2;for(const side of [-1,1]){const leg=cylinder(s,.025,.025,1.7,0x625669,x+side*.3,.8,3.5);leg.rotation.z=side*-.35;}}
 box(s,19,.16,.2,0x8c719e,0,6.1,-2.8);for(let i=-3;i<=3;i++){box(s,.5,.35,.65,0x2b2434,i*2.3,5.9,-2.8);const lens=cylinder(s,.18,.18,.04,i%2?palette.pink:palette.mint,i*2.3,5.65,-2.53);lens.rotation.x=Math.PI/4;}
 this.confetti=[];for(let i=0;i<40;i++){const o=mesh(new T.PlaneGeometry(.07,.17),new T.MeshBasicMaterial({color:[palette.pink,palette.mint,palette.gold,0xc69aff][i%4],side:T.DoubleSide}),s,(i%10-4.5)*1.1,4+(i%7)*.3,(i%5)*.6);o.visible=false;this.confetti.push(o);}
 }
 resize(){const b=this.canvas.parentElement.getBoundingClientRect();this.renderer.setSize(b.width,b.height,false);this.camera.aspect=b.width/b.height;const narrow=this.camera.aspect<1.3;this.camera.fov=narrow?49:43;this.camera.position.set(narrow?.5:1.9,narrow?4.6:4.2,narrow?12.5:8.6);this.camera.lookAt(0,1.35,-1.0);this.camera.updateProjectionMatrix();}
 update(r,dt){const t=r.clock,active=['playing','practice','break','countdown','won'].includes(r.phase),recent=t-r.actionAt<1.1;const action=recent?r.action:'cross';const power=active?1:.25;pose(this.hero,t,action,power);this.hero.group.position.x=recent&&(action==='left'||action==='right')?(action==='left'?-.35:.35)*Math.sin(Math.min(1,(t-r.actionAt)/1.1)*Math.PI):0;
 if(action==='circle')this.hero.group.rotation.y=T.MathUtils.smoothstep(t-r.actionAt,0,1.1)*Math.PI*2;this.dancers.forEach((h,i)=>{pose(h,t+(i%2)*.12,active?action:'cross',power*.85);if(action==='circle')h.group.rotation.y=this.hero.group.rotation.y;});this.candidates.forEach((h,i)=>{pose(h,t+i*.3,'cross',.12);h.group.rotation.y=0;});pose(this.lionel,t,'square',r.phase==='won'?1:.1);if(r.phase!=='won'){this.lionel.arms[0].shoulder.rotation.z=-.1;this.lionel.arms[1].shoulder.rotation.z=.15;this.lionel.arms[0].elbow.rotation.x=-1.2;}
 for(const [i,p]of this.public.entries()){p.arms.forEach((a,j)=>{a.rotation.z=(j?1:-1)*(.4+Math.sin(t*6+i)*.15);a.rotation.x=active?-.8:0;});}
 if(r.phase==='won'){this.hero.arms[0].shoulder.rotation.z=-1.4;this.hero.arms[1].shoulder.rotation.z=1.4;this.hero.head.rotation.x=-.15;this.confetti.forEach((o,i)=>{o.visible=!this.reduced;o.position.y=5.5-((r.time*.8+i*.19)%5.7);o.rotation.z=t+i;});}else this.confetti.forEach(o=>o.visible=false);
 this.renderer.render(this.scene,this.camera);}
 dispose(){this.observer.disconnect();this.renderer.dispose();}
}
