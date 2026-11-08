import * as T from 'three';
import {softwareRenderer} from './yoyo-software.js';
import {models} from './yoyo-models.js';
import {ropePosition} from './yoyo-core.js';
const mix=(a,b,t)=>a+(b-a)*t, smooth=t=>t*t*(3-2*t);
export function makeCinema(host){
 let renderer;try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});}catch{renderer=softwareRenderer();}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;host.append(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color('#63787e');scene.fog=new T.Fog('#718086',10,35);const camera=new T.PerspectiveCamera(63,16/9,.035,60);scene.add(camera);
 let seed=71;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 function texture(kind){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle=kind==='floor'?'#62635d':kind==='wood'?'#66584a':'#b6b6a6';x.fillRect(0,0,512,512);for(let i=0;i<20000;i++){x.fillStyle=`rgba(${rand()>.5?'235,226,198':'38,49,45'},${rand()*.14})`;const w=kind==='wood'?1+rand()*2:1+rand()*6,h=kind==='wood'?rand()*120:rand()*8;x.fillRect(rand()*512,rand()*512,w,h);}if(kind==='wall'){x.fillStyle='#6d8079';x.fillRect(0,274,512,238);x.fillStyle='#929b84';x.fillRect(0,274,512,7);for(let i=0;i<90;i++){x.fillStyle=`rgba(45,49,42,${rand()*.13})`;x.fillRect(rand()*512,rand()*512,rand()*5,rand()*120);}x.strokeStyle='#6c74644a';x.lineWidth=1;for(let n=0;n<18;n++){x.beginPath();let px=rand()*512,py=rand()*512;x.moveTo(px,py);for(let k=0;k<6;k++){px+=rand()*18-9;py+=rand()*25;x.lineTo(px,py);}x.stroke();}}if(kind==='floor'){x.strokeStyle='#333b37';x.lineWidth=3;for(let n=0;n<=4;n++){x.beginPath();x.moveTo(n*128,0);x.lineTo(n*128,512);x.moveTo(0,n*128);x.lineTo(512,n*128);x.stroke();}}const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=4;return tx;}
 const mat=(color,roughness=.75,extra={})=>new T.MeshStandardMaterial({color,roughness,...extra});
 const plaster=mat('#ffffff',.96,{map:texture('wall')}),floor=mat('#ffffff',.94,{map:texture('floor')}),metal=mat('#46514c',.48,{metalness:.65}),rust=mat('#6a5341',.8),white=mat('#d2d4c4',.36),wood=mat('#ffffff',.83,{map:texture('wood')}),fabric=mat('#7c8985',.98),dark=mat('#182326'),skin=mat('#b98c70',.64),nails=mat('#ceaa91',.58),sleeve=mat('#414c51',.97);
 function mesh(geo,material,parent=scene){const m=new T.Mesh(geo,material);parent.add(m);m.castShadow=true;m.receiveShadow=true;return m;}
 function box(w,h,d,x,y,z,m=plaster,p=scene){const a=mesh(new T.BoxGeometry(w,h,d),m,p);a.position.set(x,y,z);return a;}
 function ell(rx,ry,rz,x,y,z,m,p=scene){const a=mesh(new T.SphereGeometry(1,20,12),m,p);a.scale.set(rx,ry,rz);a.position.set(x,y,z);return a;}
 function rod(a,b,r,m=metal,p=scene,r2=r){const v=new T.Vector3(...a),q=new T.Vector3(...b),d=q.clone().sub(v);const o=mesh(new T.CylinderGeometry(r2,r,d.length(),12),m,p);o.position.copy(v.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
 function curve(points,r,m=metal,p=scene){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),32,r,8,false),m,p);}
 box(3,.16,3,0,-.08,0,floor);box(.16,2.7,3,-1.58,1.35,0);box(.16,2.7,3,1.58,1.35,0);box(3,.12,3,0,2.76,0,mat('#a8a99c'));
 // The window is a genuine opening rather than an image on a wall.
 box(3,.9,.18,0,.45,-1.58);box(3,.38,.18,0,2.51,-1.58);box(.72,1.42,.18,-1.14,1.61,-1.58);box(.72,1.42,.18,1.14,1.61,-1.58);box(1.65,.1,.38,0,.9,-1.48,white);
 box(3,2.7,.16,0,1.35,1.58);box(.86,2.12,.08,.75,1.06,1.47,metal);box(.11,.09,.035,.64,1.57,1.415,dark);box(.62,.22,.04,.75,.4,1.41,dark);for(let i=0;i<9;i++)box(.62,.012,.01,.75,.31+i*.022,1.38,metal);rod([1.04,1,1.39],[1.14,1,1.39],.018,white);
 // Bunk: slim welded steel, uneven bedding, pillow seams and ladder rungs.
 for(const y of [.43,1.5]){box(.82,.065,1.94,-1.02,y,-.06,metal);box(.78,.13,1.86,-1.02,y+.09,-.06,mat('#b9b8a3'));box(.79,.045,1.36,-1.02,y+.18,.13,fabric);ell(.32,.065,.19,-1.02,y+.2,-.78,white);for(let n=0;n<7;n++)rod([-1.41,y+.206,.02+n*.14],[-.63,y+.206,.01+n*.14],.003,mat('#a3aca0'));rod([-1.43,y-.02,-1.02],[-.61,y-.02,-1.02],.019);rod([-1.43,y+.3,-1.02],[-.61,y+.3,-1.02],.019);rod([-1.43,y+.3,.94],[-.61,y+.3,.94],.019);}
 for(const x of [-1.44,-.6])for(const z of [-1.04,.96])rod([x,.04,z],[x,1.94,z],.022);for(let i=0;i<5;i++)rod([-.61,.21+i*.29,.58],[-.61,.21+i*.29,.91],.015);rod([-.61,.06,.58],[-.61,1.75,.58],.022);
 // Table, stool, wardrobe, simple personal belongings.
 box(.76,.055,.6,1.04,.76,-1.01,wood);for(const x of [.73,1.35])for(const z of [-1.25,-.78])rod([x,.02,z],[x,.73,z],.021);box(.31,.04,.31,1.02,.44,-.42,wood);for(const x of [.9,1.14])for(const z of [-.54,-.3])rod([x,.02,z],[x,.42,z],.017);box(.19,.017,.25,.96,.8,-1,mat('#b6b49c'));box(.035,.007,.15,1.08,.813,-.98,mat('#2d4657'));
 box(.55,1.7,.42,1.19,.85,.97,wood);box(.008,1.64,.01,1.19,.85,.752,dark);rod([1.13,.83,.73],[1.13,.95,.73],.008,white);rod([1.25,.83,.73],[1.25,.95,.73],.008,white);box(.52,.04,.42,1.19,1.73,.97,mat('#95856c'));
 // Sanitary fixtures face into the room, with real hollow ceramic profiles.
 const props=models(),sanitary=props.sanitary();
 sanitary.toilet.position.set(1.17,0,.23);sanitary.toilet.rotation.y=-Math.PI/2;scene.add(sanitary.toilet);
 sanitary.basin.position.set(1.19,.99,-.47);sanitary.basin.rotation.y=-Math.PI/2;scene.add(sanitary.basin);
 box(.025,.51,.40,1.48,1.58,-.47,metal);box(.008,.46,.35,1.46,1.58,-.47,mat('#9babaa',.19,{metalness:.8}));
 const holder=props.lathe(scene,[[0,0],[.065,0],[.069,.16],[.061,.18],[.052,.17],[.048,.03],[0,.03]],mat('#d0d7c7',.4));holder.position.set(.66,.012,.66);
 const storedBrush=props.brush();storedBrush.position.set(.66,.49,.66);storedBrush.rotation.z=Math.PI;scene.add(storedBrush);
 // Contact shadows keep furniture and sanitary fittings grounded, including software rendering.
 const shade=mat('#23352e',1,{transparent:true,opacity:.12,depthWrite:false});
 for(const [x,z,rx,rz] of [[1.1,.3,.35,.38],[1.16,-.45,.3,.2],[.66,.66,.10,.10],[-1,.05,.46,1]]){const q=mesh(new T.CircleGeometry(1,32),shade);q.rotation.x=-Math.PI/2;q.scale.set(rx,rz,1);q.position.set(x,.008,z);}
 // Window frame, two hinged leaves and fixed steel bars.
 const hingeL=new T.Group(),hingeR=new T.Group();hingeL.position.set(-.78,.94,-1.42);hingeR.position.set(.78,.94,-1.42);scene.add(hingeL,hingeR);const glass=mat('#8db2bd',.18,{transparent:true,opacity:.16,side:T.DoubleSide,depthWrite:false});
 for(const [h,side] of [[hingeL,1],[hingeR,-1]]){box(.73,.035,.035,side*.365,0,0,metal,h);box(.73,.035,.035,side*.365,1.35,0,metal,h);for(const x of [0,side*.73])box(.035,1.35,.035,x,.675,0,metal,h);box(.68,1.3,.008,side*.365,.675,0,glass,h);rod([side*.65,.57,.04],[side*.65,.7,.04],.013,white,h);}
 for(let x=-.63;x<.7;x+=.21){rod([x,.95,-1.63],[x,2.3,-1.63],.018,metal);for(const y of [1.09,2.15])ell(.024,.025,.022,x,y,-1.63,rust);}for(const y of [1.09,2.15])rod([-.78,y,-1.63],[.78,y,-1.63],.015,metal);
 // A nearer opposite wing: deep reveals, separate bars and a few inhabited cells.
 const facade=mat('#b8baad',.96,{map:texture('facade')}),stone=mat('#929c94',.89),recess=mat('#303c3c',.95),barPaint=mat('#53615e',.62,{metalness:.35});
 const front=-5.85,winW=.88,winH=1.16,pitch=1.6,rows=[0,1.65,3.3,4.95],columns=[-3.2,-1.6,0,1.6,3.2];
 box(9,8,.15,0,2.5,front-.66,recess);
 for(let x=-4;x<=4;x+=pitch)box(pitch-winW,8,.24,x,2.4,front,facade);
 for(let y=-.825;y<6;y+=1.65)box(8.8,1.65-winH,.24,0,y,front,facade);
 for(const x of columns)for(const y of rows){
  const inset=mat('#7c8980',.91);
  box(.075,winH,.42,x-winW/2,y,front-.12,inset);box(.075,winH,.42,x+winW/2,y,front-.12,inset);
  box(winW+.16,.065,.48,x,y-winH/2,front-.08,stone);box(winW+.16,.09,.30,x,y+winH/2,front,stone);
  box(winW-.10,.026,.026,x,y+.40,front-.38,barPaint);box(.025,winH-.12,.025,x,y,front-.38,barPaint);
  for(let dx=-.33;dx<=.34;dx+=.165)rod([x+dx,y-.55,front+.10],[x+dx,y+.55,front+.10],.012,barPaint);
  for(const dy of [-.39,.38])rod([x-.44,y+dy,front+.1],[x+.44,y+dy,front+.1],.012,barPaint);
  // Interior ceiling and floor give the openings depth instead of black stickers.
  box(winW,.035,.52,x,y+.55,front-.38,recess);box(winW,.035,.52,x,y-.54,front-.38,recess);
 }
 for(const x of [-2.4,2.4]){rod([x,-1.4,front+.18],[x,6,front+.18],.035,mat('#6c7973',.8));for(let y=0;y<6;y+=1.5)rod([x-.045,y,front+.18],[x+.045,y,front+.18],.012,metal);}
 const prisoners=[];
 function prisoner(x,windowY,style){
  const root=new T.Group();root.position.set(x,windowY,front-.15);scene.add(root);
  const face=mat(style===1?'#9d7156':'#bb9677',.9),hair=mat(style===2?'#776b5d':'#33352f',.95),shirt=mat(['#646c71','#6c7770','#7b7165'][style],.96),eye=mat('#2a332e',.8);
  ell(.195,.235,.095,0,-.30,-.045,shirt,root);rod([-.16,-.25,-.03],[-.22,-.40,.06],.055,shirt,root,.045);rod([.16,-.23,-.03],[.23,-.39,.06],.055,shirt,root,.042);
  rod([0,-.13,0],[0,.015,0],.036,face,root,.043);
  const head=new T.Group();head.position.set(0,.055,.012);root.add(head);
  ell(.072,.103,.069,0,0,0,face,head);ell(.060,.054,.061,0,-.065,.004,face,head);ell(.076,.065,.073,0,.054,-.014,hair,head);
  ell(.016,.030,.013,-.073,-.006,0,face,head);ell(.016,.030,.013,.073,-.006,0,face,head);
  ell(.015,.025,.025,0,-.015,.065,face,head);for(const dx of [-.028,.028]){ell(.015,.008,.004,dx,.017,.061,eye,head);rod([dx-.015,.032,.062],[dx+.013,.033,.063],.003,hair,head);}
  curve([[-.022,-.056,.056],[0,-.060,.065],[.021,-.055,.056]],.0025,mat('#6c5446'),head);
  // One inmate rests a hand around a bar; the others lean or turn in their cells.
  if(style===0){rod([.16,-.24,0],[.24,-.13,.12],.036,shirt,root);rod([.24,-.13,.12],[.16,.01,.24],.026,face,root,.021);ell(.025,.039,.018,.16,.04,.24,face,root);for(let f=0;f<4;f++)curve([[.142,.02+f*.013,.24],[.146,.025+f*.013,.269],[.174,.025+f*.013,.27]],.005,face,root);}
  root.rotation.y=[-.12,.26,-.24][style];prisoners.push({root,head,angle:root.rotation.y,phase:style*2});
 }
 prisoner(-1.6,1.65,0);prisoner(1.6,1.65,1);prisoner(0,3.3,2);
 // The hanger is inverted: the sheet wraps its long bar; its hook carries the bag handle.
 const ropeGroup=new T.Group();scene.add(ropeGroup);const cloth=mat('#c6bfab',1);
 for(let n=0;n<24;n++){rod([Math.sin(n*.7)*.008,n*.11+.035,0],[Math.sin((n+1)*.7)*.008,(n+1)*.11+.035,0],.014,cloth,ropeGroup,.012);if(n%3===0){ell(.023,.031,.019,0,n*.11+.04,0,cloth,ropeGroup);const tail=box(.03,.11,.003,.025,n*.11,0,cloth,ropeGroup);tail.rotation.z=-.3;}}
 curve([[-.18,0,0],[-.16,.004,0],[.16,.004,0],[.18,0,0],[.15,-.03,0],[0,-.21,0],[-.15,-.03,0],[-.18,0,0]],.0055,metal,ropeGroup);
 curve([[0,-.20,0],[0,-.28,0],[.013,-.327,0],[.050,-.343,0],[.081,-.32,0],[.077,-.287,0]],.006,metal,ropeGroup);
 const wraps=[];for(let n=0;n<=80;n++){const u=n/80,a=u*Math.PI*10;wraps.push([-.034+u*.068,Math.cos(a)*.014,Math.sin(a)*.014]);}curve(wraps,.005,cloth,ropeGroup);ell(.019,.024,.019,0,.034,0,cloth,ropeGroup);
 const bagmat=mat('#d4d5bb',.6,{transparent:true,opacity:.85,side:T.DoubleSide});
 const bag=ell(.17,.19,.075,.043,-.60,0,bagmat,ropeGroup);
 for(let n=-3;n<=3;n++)curve([[.043+n*.027,-.43,.025],[.043+n*.038,-.59,.074],[.043+n*.029,-.77,.025]],.0017,white,ropeGroup);
 for(const z of [-.018,.018])curve([[-.055,-.465,z],[-.010,-.39,z],[.044,-.343,z],[.096,-.39,z],[.14,-.465,z]],.008,bagmat,ropeGroup);
 // Posed hands grip their own props; a single continuous forearm rises from below frame.
 const reaching=props.openHand();scene.add(reaching);reaching.rotation.set(-.3,0,-.5);
 const searching=props.openHand(),held=props.heldBrush(),drink=props.cupHand(),cigarette=props.smokingHand();
 for(const m of [searching,held,drink,cigarette])camera.add(m);
 const steam=[];for(let i=0;i<16;i++){const p=ell(.013,.026,.013,0,0,0,new T.MeshBasicMaterial({color:'#d0d7cb',transparent:true,opacity:.1,depthWrite:false}),camera);steam.push(p);}
 const hemi=new T.HemisphereLight('#c2dcdf','#4a483c',2.3);scene.add(hemi);const sun=new T.DirectionalLight('#e5e3cd',3.4);sun.position.set(-3,5,-7);sun.target.position.set(1,.2,.8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-3,right:3,top:3,bottom:-3,near:.1,far:15});sun.shadow.bias=-.0007;scene.add(sun,sun.target);const fill=new T.PointLight('#b4c6c4',3,6,1.5);fill.position.set(0,2.4,-1.1);scene.add(fill);
 const frames=[{t:0,p:[.15,1.58,1.16],look:[-.45,1.05,-.8]},{t:4,p:[.17,1.49,.75],look:[-1.05,1.08,-.1]},{t:8,p:[-.20,1.43,.8],look:[1.12,1.1,.55]},{t:12,p:[-.25,1.25,.7],look:[1.1,.57,-.15]},{t:16,p:[.06,1.5,-.38],look:[0,1.55,-1.6]},{t:22,p:[.05,1.48,-.86],look:[.02,1.53,-2.7]},{t:27,p:[.04,1.48,-.85],look:[0,1.55,-2.7]}];
 let width=0,height=0;
 function render(t,mode='intro',g={aim:.5,part:0,pull:0,partTime:0}){
  const w=host.clientWidth,h=host.clientHeight;if(w!==width||h!==height){width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  for(const m of [drink,cigarette,searching,held,reaching,ropeGroup])m.visible=false;
  steam.forEach(p=>p.visible=false);storedBrush.visible=true;
  const life=mode==='window'?g.partTime:t;for(const person of prisoners){person.head.rotation.y=Math.sin(life*.24+person.phase)*.11;person.root.rotation.y=person.angle+Math.sin(life*.17+person.phase)*.035;}
  const clamp01=v=>Math.min(1,Math.max(0,v)),project=v=>{camera.updateMatrixWorld();const p=v.clone().project(camera);return {x:(p.x+1)/2,y:(1-p.y)/2};};
  const half=depth=>depth*Math.tan(camera.fov*Math.PI/360),atScreen=(x,y,depth)=>[(x-.5)*2*half(depth)*camera.aspect,(.5-y)*2*half(depth),-depth];
  let anchors={},opened=1;
  if(mode==='victory'){
   camera.position.set(.02,1.45,-.54);camera.lookAt(.02,1.45,-4);
   const sip=Math.sin(clamp01((t-.6)/5.7)*Math.PI),lower=smooth(clamp01((t-6.3)/1.4));
   drink.visible=t<7.8;drink.position.set(.12-sip*.075,-.29+sip*.16-lower*.75,-.48+sip*.14);drink.rotation.set(sip*.28,-.26,-.08);
   const rise=smooth(clamp01((t-8)/1.3)),inhale=Math.sin(clamp01((t-9.8)/4)*Math.PI);
   cigarette.visible=t>8;cigarette.position.set(.12-inhale*.075,-.76+rise*.47+inhale*.17,-.43+inhale*.15);cigarette.rotation.set(-.10-inhale*.12,-.58,.08);
   steam.forEach((p,i)=>{const smoke=t>10,age=(t*.15+i/16)%1;p.visible=smoke||t<6.5;const base=smoke?cigarette.position:drink.position;p.position.set(base.x+Math.sin(t*.7+i)*(.012+age*.018),base.y+.14+age*.22,base.z+(smoke?-.04:.015));p.scale.set(.008+age*.02,.022+age*.03,.008);p.material.opacity=(1-age)*(smoke?.075:.045);});
  }else if(mode==='search'||mode==='pickup'){
   camera.position.set(-.43,1.22,1.31);camera.lookAt(1.05,.56,.05);
   const target=project(new T.Vector3(.66,.43,.66));anchors.brush=target;
   const pick=mode==='pickup'?smooth(clamp01(t/1.25)):0;
   const x=mode==='pickup'?mix(g.aim,target.x,pick):g.aim;
   searching.visible=!g.hidden&&pick<.42;searching.position.set(...atScreen(x,target.y+.12,.57));searching.rotation.set(-.14,.05,0);
   held.visible=mode==='pickup'&&pick>=.42;held.position.set(...atScreen(mix(target.x,.57,pick),mix(target.y+.15,.69,pick),.57));held.rotation.set(-.13,0,-.07);
   storedBrush.visible=pick<.42;
   if(g.hidden){searching.visible=false;camera.position.y=.55;camera.lookAt(1,.25,.05);}
  }else if(mode==='window'){
   camera.position.set(0,1.56,-.75);camera.lookAt(0,1.56,-4);storedBrush.visible=false;
   const pull=g.pull||0,depth=1.19-pull*.64,rx=ropePosition(g),horizontal=(rx-.5)*2*half(depth)*camera.aspect;
   ropeGroup.visible=true;ropeGroup.position.set(horizontal,1.74+pull*.16,-.75-depth);ropeGroup.scale.set(1-pull*.2,1,1);ropeGroup.rotation.z=g.hooked?-.04:Math.sin(g.partTime)*.045;
   held.visible=!g.hidden;held.position.set(...atScreen(g.hooked?rx:g.aim,.82,.58));held.rotation.set(-.04,0,0);
   anchors.head=project(held.localToWorld(new T.Vector3(0,.365,0)));anchors.rope=project(new T.Vector3(horizontal,1.73+pull*.16,-.75-depth));
   if(g.hidden){held.visible=false;camera.position.y=.62;camera.lookAt(0,.64,-4);}
  }else{
   let a=frames[0],b=frames[1];for(let i=0;i<frames.length-1;i++)if(t>=frames[i].t){a=frames[i];b=frames[i+1];}
   const f=smooth(clamp01((t-a.t)/(b.t-a.t)));camera.position.set(...a.p.map((n,i)=>mix(n,b.p[i],f)));camera.lookAt(...a.look.map((n,i)=>mix(n,b.look[i],f)));
   reaching.visible=t>15.5&&t<20.8;const reach=Math.sin(clamp01((t-15.5)/5.3)*Math.PI);reaching.position.set(.26-reach*.05,1.0+reach*.37,-.8-reach*.5);
   ropeGroup.visible=t>20;ropeGroup.scale.set(1,1,1);ropeGroup.rotation.z=0;ropeGroup.position.set(Math.sin(t*1.2)*.19,2.5-clamp01((t-20)/4)*.7,-1.92);opened=smooth(clamp01((t-17)/2.8));
  }
  hingeL.rotation.y=-opened*1.3;hingeR.rotation.y=opened*1.3;renderer.render(scene,camera);return anchors;
 }
 return {render,dispose(){renderer.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}}});host.replaceChildren();}};
}
