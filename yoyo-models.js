import * as T from 'three';
// All grips and their objects share one coordinate system. Forearms extend below the view.
export function models(){
 const material=(c,r=.7,more={})=>new T.MeshStandardMaterial({color:c,roughness:r,...more});
 const skin=material('#b68a6d',.64),nail=material('#c5a18a',.58),crease=material('#946d57'),cloth=material('#34454b',.96),ceramic=material('#d8ded1',.28),chrome=material('#939f9b',.25,{metalness:.8}),rubber=material('#3c4845',.9),plastic=material('#d4cdb6',.62);
 function mesh(geo,mat,p){const m=new T.Mesh(geo,mat);p.add(m);m.castShadow=true;m.receiveShadow=true;return m;}
 function oval(p,at,size,mat=skin){const m=mesh(new T.SphereGeometry(1,18,12),mat,p);m.position.set(...at);m.scale.set(...size);return m;}
 function bone(p,a,b,r1,r2=r1,mat=skin){const u=new T.Vector3(...a),v=new T.Vector3(...b),d=v.clone().sub(u),m=mesh(new T.CylinderGeometry(r2,r1,d.length(),12),mat,p);m.position.copy(u.add(v).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
 function tube(p,points,r,mat=chrome){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),28,r,8,false),mat,p);}
 function lathe(p,points,mat=ceramic,scale=[1,1,1]){const m=mesh(new T.LatheGeometry(points.map(a=>new T.Vector2(...a)),40),mat,p);m.scale.set(...scale);return m;}
 function roundedBox(p,w,h,d,at,mat=ceramic){const r=Math.min(w,h)*.1,s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const m=mesh(new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2,steps:1,curveSegments:5}),mat,p);m.position.set(at[0],at[1],at[2]-d/2);return m;}
 function finger(p,pts,r=.011){for(let i=0;i<pts.length-1;i++){const a=r*(1-i*.14),b=r*(.9-i*.14);bone(p,pts[i],pts[i+1],a,b);oval(p,pts[i+1],[b,b,b]);}const tip=pts.at(-1),prev=pts.at(-2),v=new T.Vector3(...tip).sub(new T.Vector3(...prev)).normalize();const n=oval(p,[tip[0]-v.x*.006,tip[1]-v.y*.006,tip[2]+.007],[r*.55,r*.72,.0016],nail);n.rotation.z=-Math.atan2(v.x,v.y);}
 function arm(p,x=0,z=0){
  oval(p,[x,-.075,z],[.032,.043,.026]);
  // A continuous wrist, tapered forearm and cuff. No visible detached stump.
  bone(p,[x,-.08,z],[x+.018,-.34,z+.06],.034,.054);bone(p,[x+.018,-.34,z+.06],[x+.08,-.82,z+.25],.054,.075);
  bone(p,[x+.032,-.43,z+.10],[x+.10,-.95,z+.29],.062,.084,cloth);bone(p,[x+.026,-.40,z+.09],[x+.034,-.45,z+.11],.061,.064,cloth);
  for(let i=0;i<3;i++)tube(p,[[x-.025,-.085-i*.008,z+.028],[x,-.09-i*.008,z+.033],[x+.025,-.085-i*.008,z+.028]],.0007,crease);
 }
 function openHand(){const p=new T.Group();arm(p);oval(p,[0,-.005,0],[.048,.079,.024]);for(let i=0;i<4;i++){const x=-.034+i*.025,l=[.103,.124,.113,.088][i];finger(p,[[x,.045,0],[x,.045+l*.45,-.002],[x+.003,.045+l*.78,.01],[x+.004,.045+l,.02]],.0105-i*.0005);}finger(p,[[-.04,-.035,0],[-.075,-.004,.012],[-.086,.026,.02]],.016);return p;}
 function grip(radius=.015){const p=new T.Group();const x=radius+.026;arm(p,x,.014);oval(p,[x,-.01,.014],[.029,.071,.027]);for(let i=0;i<4;i++){const y=.049-i*.027;finger(p,[[x-.006,y,.014],[radius*.7,y+.006,radius+.018],[-radius*.35,y+.003,radius+.030],[-radius-.006,y-.006,radius+.012]],.011-i*.0006);}finger(p,[[x-.005,.045,-.004],[radius*.55,.078,-radius*.55],[-radius*.4,.071,-radius*.8]],.015);return p;}
 function brush(){const p=new T.Group();bone(p,[0,-.08,0],[0,.305,0],.009,.007,plastic);bone(p,[0,-.075,0],[0,.045,0],.013,.012,rubber);for(let n=0;n<8;n++){const ring=mesh(new T.TorusGeometry(.0126,.0015,5,14),rubber,p);ring.rotation.x=Math.PI/2;ring.position.y=-.06+n*.012;}
  oval(p,[0,.315,0],[.025,.024,.025],plastic);oval(p,[0,.365,0],[.033,.052,.033],material('#b5b29b',.97));
  const bristle=material('#c6c1a6',.95),tips=material('#e1d9bf',.9);for(let row=0;row<9;row++){const y=.325+row*.010;for(let n=0;n<24;n++){const a=n*Math.PI/12+row*.29,r=.034+Math.sin(row/8*Math.PI)*.018;const b=[Math.cos(a)*r,y+(.4-row/8)*.012,Math.sin(a)*r];bone(p,[Math.cos(a)*.029,y,Math.sin(a)*.029],b,.0018,.0011,n%4?bristle:tips);}}
  for(let n=0;n<15;n++){const a=n*2.4,r=Math.sqrt(n/15)*.024;bone(p,[Math.cos(a)*r,.409,Math.sin(a)*r],[Math.cos(a)*r*1.4,.435,Math.sin(a)*r*1.4],.0018,.001,bristle);}return p;
 }
 function heldBrush(){const p=grip(.014);p.add(brush());return p;}
 function cupHand(){const p=grip(.056);const cup=lathe(p,[[0,-.063],[.041,-.063],[.044,-.05],[.057,.105],[.059,.11],[.056,.113],[.053,.105],[.04,-.05],[0,-.05]],plastic);cup.position.z=.015;const coffee=mesh(new T.CircleGeometry(.052,36),material('#36281d',.25),p);coffee.rotation.x=-Math.PI/2;coffee.position.set(0,.098,.015);for(let n=0;n<7;n++){const ring=mesh(new T.TorusGeometry(.043+n*.0017,.0011,5,30),plastic,p);ring.rotation.x=Math.PI/2;ring.position.set(0,-.035+n*.017,.015);}return p;}
 function smokingHand(){const p=new T.Group();arm(p);oval(p,[0,-.015,0],[.045,.073,.025]);finger(p,[[-.019,.041,0],[-.020,.087,.013],[-.018,.119,.014],[-.018,.145,.010]],.011);finger(p,[[.012,.043,0],[.014,.089,.012],[.013,.121,.014],[.013,.153,.008]],.011);
  finger(p,[[.037,.031,0],[.044,.065,.025],[.040,.041,.054],[.031,.012,.054]],.010);finger(p,[[.055,.007,0],[.068,.035,.024],[.061,.013,.051],[.046,-.007,.043]],.0085);finger(p,[[-.039,-.035,.007],[-.052,.001,.042],[-.022,.027,.058]],.015);
  const cigarette=new T.Group();p.add(cigarette);cigarette.position.set(-.0025,.119,.014);
  bone(cigarette,[0,0,.047],[0,0,.019],.0042,.0042,material('#bca381'));bone(cigarette,[0,0,.019],[0,0,-.061],.0042,.0042,material('#eee9d8'));bone(cigarette,[0,0,-.061],[0,0,-.066],.0043,.004,material('#5d5b50'));bone(cigarette,[0,0,-.066],[0,0,-.067],.0039,.0036,material('#b15d35',.8,{emissive:'#57200b'}));
  return p;
 }
 function sanitary(){const toilet=new T.Group();lathe(toilet,[[0,0],[.11,0],[.13,.04],[.095,.21],[.13,.28],[.13,.30]],ceramic,[1,1,1.25]);const bowl=lathe(toilet,[[.09,.22],[.14,.25],[.20,.32],[.225,.40],[.225,.425],[.207,.44],[.186,.421],[.163,.36],[.10,.29],[.065,.28]],ceramic,[1,1,1.32]);bowl.position.z=.06;
  const water=mesh(new T.CircleGeometry(.065,28),material('#6d8e88',.14),toilet);water.rotation.x=-Math.PI/2;water.position.set(0,.282,.06);const seat=mesh(new T.TorusGeometry(.211,.013,9,40),material('#b8c8ba',.4),toilet);seat.rotation.x=Math.PI/2;seat.scale.y=1.30;seat.position.set(0,.45,.06);
  roundedBox(toilet,.37,.39,.15,[0,.63,-.25]);roundedBox(toilet,.39,.028,.17,[0,.845,-.25]);bone(toilet,[.13,.72,-.16],[.16,.72,-.16],.012,.012,chrome);tube(toilet,[[.17,.12,-.25],[.23,.12,-.25],[.23,.65,-.25]],.013);for(const x of [-.07,.07])oval(toilet,[x,.034,.04],[.009,.004,.009],chrome);
  const basin=new T.Group();lathe(basin,[[.035,-.145],[.11,-.14],[.22,-.06],[.28,.01],[.278,.035],[.259,.045],[.236,.022],[.19,-.035],[.10,-.095],[.025,-.098]],ceramic,[1,1,.78]);const drain=mesh(new T.CylinderGeometry(.025,.025,.004,24),chrome,basin);drain.position.y=-.097;for(let i=0;i<7;i++)oval(basin,[Math.cos(i)*.014,-.094,Math.sin(i)*.014],[.002,.001,.002],rubber);
  roundedBox(basin,.48,.05,.12,[0,0,-.20]);tube(basin,[[.07,.015,-.19],[.07,.20,-.19],[0,.20,-.15],[0,.15,-.09]],.014);bone(basin,[-.12,.02,-.19],[-.12,.07,-.19],.02,.017,chrome);bone(basin,[-.16,.07,-.19],[-.08,.07,-.19],.009,.009,chrome);tube(basin,[[0,-.14,0],[0,-.39,0],[0,-.43,-.10],[0,-.31,-.18],[0,-.31,-.32]],.023);return{toilet,basin};
 }
 return {openHand,heldBrush,cupHand,smokingHand,brush,sanitary,lathe,mesh,material,roundedBox};
}
