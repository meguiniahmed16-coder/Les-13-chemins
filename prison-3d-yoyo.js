import * as T from 'three';
const UP=new T.Vector3(0,1,0),clamp=T.MathUtils.clamp;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.9,...extra});
function line(parent,points,r,material){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const mesh=new T.Mesh(new T.TubeGeometry(curve,Math.max(12,points.length*5),r,6,false),material);parent.add(mesh);return mesh;}
function tubeGeometry(segments=36,sides=6){
 const positions=new Float32Array((segments+1)*sides*3),indices=[];
 for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const a=i*sides+j,b=i*sides+(j+1)%sides;indices.push(a,b,a+sides,b,b+sides,a+sides);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(positions,3));g.setIndex(indices);return g;
}
// All motion is in metres. The bag is folded to fit a 17.4 cm opening.
// Its small free swing fades BEFORE the plastic reaches the plane of the bars.
export function yoyoMotion(time=0,pull=0,hooked=false){
 const safe=1-smooth(.04,.23,pull),free=hooked?.34:1;
 return {swing:Math.sin(time*1.35-.65)*.075*safe*free,
  tilt:Math.sin(time*.91+.4)*.038*safe*free,
  twist:Math.sin(time*.63)*.12*safe*free,
  crinkle:(.0012+Math.sin(time*1.9)*.00035)*(1-.65*smooth(.08,.4,pull)),
  tension:smooth(0,.65,pull),fold:1-.10*smooth(.12,.45,pull)};
}
export function createPrisonYoYo({cloth,steel,plastic}={}){
 const root=new T.Group();root.name='YoYoAuDrap';
 cloth??=mat(0xd7d0bd);steel??=mat(0x89928b,{metalness:.62,roughness:.42});
 plastic??=mat(0xe8ebe2,{transparent:true,opacity:.43,side:T.DoubleSide,depthWrite:false,roughness:.30});
 const clothShadow=cloth.clone();clothShadow.color.multiplyScalar(.81);
 const cord=new T.Group();cord.name='CordeDeDrapTorsade';root.add(cord);
 const strands=[cloth,clothShadow].map(material=>{const mesh=new T.Mesh(tubeGeometry(),material);mesh.frustumCulled=false;cord.add(mesh);return mesh;});
 const knots=[.25,.67].map((t,i)=>{
  const g=new T.Group();g.name='NoeudDeDrap';cord.add(g);
  const knot=new T.Mesh(new T.TorusGeometry(.013,.0065,6,12),cloth);knot.rotation.x=Math.PI/2;g.add(knot);
  const tail=new T.BufferGeometry();tail.setAttribute('position',new T.Float32BufferAttribute([-.008,0,0,.008,0,0,-.004,-.065,.013,.007,-.066,.009],3));tail.setIndex([0,2,1,1,2,3]);tail.computeVertexNormals();
  const material=cloth.clone();material.side=T.DoubleSide;const end=new T.Mesh(tail,material);end.position.set(.012,0,0);end.rotation.z=i?.25:-.4;g.add(end);
  return {g,t};
 });
 // A recognizable upside-down wire hanger, edge-on to the narrow opening.
 const hanger=new T.Group();hanger.name='CintreDeProfil';hanger.rotation.y=Math.PI/2;root.add(hanger);
 line(hanger,[[-.15,-.015,0],[-.145,-.035,0],[0,-.22,0],[.145,-.035,0],[.15,-.015,0],[-.15,-.015,0]],.0038,steel);
 line(hanger,[[0,-.22,0],[0,-.255,0],[.012,-.30,0],[.043,-.309,0],[.062,-.285,0],[.052,-.261,0]],.0042,steel);
 const wrap=[];for(let k=0;k<=36;k++){const t=k/36,a=t*Math.PI*6;wrap.push([-.024+t*.048,-.015+Math.cos(a)*.009,Math.sin(a)*.009]);}line(hanger,wrap,.0042,cloth);
 const bagPivot=new T.Group();bagPivot.name='SacSuspenduParLesAnses';bagPivot.position.set(0,-.282,-.035);root.add(bagPivot);
 const bag=new T.Group();bag.name='SacPlastique';bagPivot.add(bag);
 const skinGeometries=[],rows=18,cols=16;
 const skinPoint=(u,v,sign,crinkle=0,time=0)=>{
  const x=u*2-1,width=.051+.005*Math.sin(v*Math.PI),edge=1-x*x;
  const pleat=Math.sin(x*24+v*13)*.0023*(.3+v*.7)*edge;
  return [x*width,-.078-.27*v+(1-v)*.004*x,
   sign*(.004+(.027*Math.pow(Math.sin(Math.PI*v),.65)+.023*smooth(.6,.75,v)*(1-smooth(.96,1,v)))*Math.sqrt(Math.max(0,edge))+pleat+crinkle*Math.sin(x*19+v*9+time)*edge)];
 };
 for(const sign of [-1,1]){
  const positions=[],uvs=[],indices=[];
  for(let iy=0;iy<=rows;iy++)for(let ix=0;ix<=cols;ix++){positions.push(...skinPoint(ix/cols,iy/rows,sign));uvs.push(ix/cols,iy/rows);}
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=y*(cols+1)+x,b=a+1,c=a+cols+1,d=c+1;indices.push(a,c,b,b,c,d);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
  const skin=new T.Mesh(geo,plastic);skin.name='FilmPlastiquePlisse';skin.renderOrder=3;bag.add(skin);skinGeometries.push({geo,sign});
 }
 // Thin ribbons, not solid rods, define the two open handles.
 for(const z of [-.012,.012]){
  const path=new T.CatmullRomCurve3([[-.044,-.083,z],[-.027,-.033,z],[0,-.005,z],[.021,-.023,z],[.041,-.079,z]].map(p=>new T.Vector3(...p)));
  const positions=[],indices=[];
  for(let i=0;i<=24;i++){const t=i/24,p=path.getPoint(t),dir=path.getTangent(t),across=new T.Vector3(dir.y,-dir.x,0).normalize().multiplyScalar(.006);positions.push(...p.clone().sub(across).toArray(),...p.clone().add(across).toArray());if(i<24){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();const handle=new T.Mesh(g,plastic);handle.name='AnsePlastiqueOuverte';handle.renderOrder=3;bag.add(handle);
 }
 const seam=mat(0xf0eee0,{transparent:true,opacity:.61,depthWrite:false});
 for(const side of [-1,1])line(bag,[[side*.05,-.078,0],[side*.055,-.18,0],[side*.053,-.30,0],[side*.049,-.348,0]],.0015,seam);
 line(bag,[[-.049,-.347,0],[0,-.350,0],[.049,-.347,0]],.002,seam);
 const tobaccoMat=mat(0x967446),coffeeMat=mat(0x745239);
 const packet=new T.Mesh(new T.BoxGeometry(.069,.084,.037),tobaccoMat);packet.name='ContenuTabacOuCafe';packet.position.set(-.002,-.295,.001);packet.rotation.z=.08;bag.add(packet);
 const strip=new T.Mesh(new T.BoxGeometry(.071,.016,.039),mat(0xd7bb7a));strip.position.set(0,.023,0);packet.add(strip);
 const creaseMaterial=mat(0xf6f3e9,{transparent:true,opacity:.25,depthWrite:false});
 for(const x of [-.032,-.011,.018,.034])line(bag,[[x,-.09,.008],[x*.9,-.17,.026],[x*.75,-.26,.024],[x*.9,-.34,.006]],.0008,creaseMaterial);
 const top=new T.Vector3(-.105,3.55,-1.91),curve=new T.CatmullRomCurve3([new T.Vector3(),new T.Vector3(),new T.Vector3(),new T.Vector3()]);
 let lastTime=0,settling=0,wasHooked=false,damping=1;
 function update({time=0,pull=0,hooked=false,part=1,preview=false}={}){
  const dt=clamp(time-lastTime,0,.1);lastTime=time;if(hooked&&!wasHooked)settling=1;wasHooked=hooked;
  settling=Math.max(0,settling-dt*2.8);const m=yoyoMotion(time,pull,false);
  damping+=((hooked?.28:1)-damping)*(1-Math.exp(-8*dt));
  m.swing*=damping;m.tilt*=damping;m.twist*=damping;
  // Anchor above the window stays fixed while the lower end comes indoors.
  top.x=part===2?.105:-.105;root.updateWorldMatrix(true,false);
  const end=root.worldToLocal(top.clone()),height=end.y;
  const bow=(1-m.tension)*.018*Math.sin(time*.76),pullSag=.06*Math.sin(pull*Math.PI);
  curve.points[0].set(0,.015,0);curve.points[1].set(end.x*.26+bow,height*.28,end.z*.26+pullSag);
  curve.points[2].set(end.x*.67-bow*.4,height*.68,end.z*.66+pullSag*.6);curve.points[3].copy(end);
  for(let strand=0;strand<2;strand++){
   const g=strands[strand].geometry,p=g.attributes.position;
   for(let i=0;i<=36;i++){
    const t=i/36,c=curve.getPoint(t),tangent=curve.getTangent(t),n=new T.Vector3(1,0,0).addScaledVector(tangent,-tangent.x).normalize(),b=new T.Vector3().crossVectors(tangent,n).normalize(),twist=t*22*Math.PI+strand*Math.PI;
    c.addScaledVector(n,Math.cos(twist)*.0039).addScaledVector(b,Math.sin(twist)*.0039);
    for(let j=0;j<6;j++){const angle=j/6*Math.PI*2,v=c.clone().addScaledVector(n,Math.cos(angle)*.0064).addScaledVector(b,Math.sin(angle)*.0064);p.setXYZ(i*6+j,v.x,v.y,v.z);}
   }
   p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();
  }
  for(const {g,t}of knots){g.position.copy(curve.getPoint(t));g.quaternion.setFromUnitVectors(UP,curve.getTangent(t).normalize());}
  bagPivot.rotation.set(m.tilt,m.twist,m.swing+settling*.018*Math.sin(time*8));bag.scale.x=m.fold;
  for(const {geo,sign}of skinGeometries){const p=geo.attributes.position;for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){const v=skinPoint(x/cols,y/rows,sign,m.crinkle,time*.65);p.setXYZ(y*(cols+1)+x,...v);}p.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingSphere();}
  packet.material=part===2?coffeeMat:tobaccoMat;packet.scale.set(part===2?.88:1,part===2?1.08:1,1);
  root.userData.motion=m;
 }
 root.position.set(-.105,1.86,-1.91);update();root.visible=false;
 return {root,bag,bagPivot,packet,cord,hanger,update};
}
