import * as T from 'three';
import {BEAT} from './danse-core.js';
export function addStudioDetails(scene){
 const group=new T.Group();group.name='PlateauCuivreEtVelours';scene.add(group);
 const metal=new T.MeshStandardMaterial({color:0xbcb5bf,metalness:.65,roughness:.31});
 const black=new T.MeshStandardMaterial({color:0x191522,roughness:.75});
 const gold=new T.MeshStandardMaterial({color:0xe1ad64,metalness:.6,roughness:.27});
 const lights=[],screens=[];
 function box(w,h,d,x,y,z,mat){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);group.add(m);return m;}
 function rod(a,b,r=.028){const va=new T.Vector3(...a),vb=new T.Vector3(...b),delta=vb.clone().sub(va);
  const m=new T.Mesh(new T.CylinderGeometry(r,r,delta.length(),8),metal);m.position.copy(va.add(vb).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());group.add(m);}
 // Triangulated gantry, cable runs, individual barn doors and warm lenses.
 for(const z of [-3.7,-2.9])rod([-9,5.6,z],[9,5.6,z],.04);
 for(let x=-9;x<9;x+=1.2){rod([x,5.6,-3.7],[x+1.2,5.6,-2.9]);rod([x,5.6,-2.9],[x+1.2,5.6,-3.7]);}
 for(const x of [-6,-3,0,3,6]){
  box(.58,.38,.6,x,5.43,-3.3,black);
  const lens=new T.Mesh(new T.CircleGeometry(.18,18),new T.MeshBasicMaterial({color:0xffdba1}));
  lens.position.set(x,5.3,-2.98);lens.rotation.x=-.5;group.add(lens);lights.push(lens);
  for(const sign of [-1,1]){const door=box(.3,.39,.025,x+sign*.35,5.4,-2.98,black);door.rotation.y=sign*.5;}
 }
 // Broadcast monitors, tally lamps and pedestal camera wheels.
 for(const x of [-6.3,6.3]){
  box(.8,.49,.12,x,2.74,3.94,black);
  const cv=document.createElement('canvas');cv.width=256;cv.height=144;const c=cv.getContext('2d');
  c.fillStyle='#11232b';c.fillRect(0,0,256,144);c.strokeStyle='#bd7ca8';c.lineWidth=4;c.strokeRect(13,12,230,119);
  c.fillStyle='#a3f1da';c.font='17px monospace';c.fillText('CAM '+(x<0?'01':'02'),24,34);c.fillText('STUDIO 13',24,117);
  c.fillStyle='#dfbd87';c.beginPath();c.arc(128,60,11,0,Math.PI*2);c.fill();c.fillRect(117,74,22,24);
  const monitor=new T.Mesh(new T.PlaneGeometry(.7,.394),new T.MeshBasicMaterial({map:new T.CanvasTexture(cv)}));monitor.position.set(x,2.74,4.01);group.add(monitor);
  box(.10,.05,.05,x,2.98,3.7,new T.MeshBasicMaterial({color:0xff514b}));
  for(const sign of [-1,1]){const wheel=new T.Mesh(new T.CylinderGeometry(.09,.09,.055,12),black);wheel.rotation.z=Math.PI/2;wheel.position.set(x+sign*.32,.08,3.6);group.add(wheel);}
 }
 // Desk microphones and buzzers make the five candidates part of a TV show.
 for(let i=0;i<5;i++){
  const x=(i-2)*1.7;rod([x-.4,1.2,-4.3],[x-.34,1.55,-4.3],.012);
  const mic=new T.Mesh(new T.SphereGeometry(.035,10,8),black);mic.position.set(x-.34,1.55,-4.3);group.add(mic);
  const buzzer=new T.Mesh(new T.CylinderGeometry(.07,.09,.035,16),gold);buzzer.position.set(x+.28,1.21,-4.15);group.add(buzzer);
 }
 // A restrained beat display behind the dancers, away from their faces.
 for(const side of [-1,1])for(let i=0;i<9;i++){
  const material=new T.MeshBasicMaterial({color:side<0?0xe8a660:0x7ed0c3});
  const b=box(.095,.20,.04,side*(5.1+i*.16),1.6,-6.38,material);screens.push({mesh:b,index:i,side});
 }
 return {group,lights,screens};
}
export function animateStudioDetails(details,time,active){
 if(!details)return;for(const {mesh,index,side} of details.screens){const h=.3+(active?.7:.15)*(1+Math.sin(time/BEAT*Math.PI+index*.7+side));mesh.scale.y=h*3;}
}
