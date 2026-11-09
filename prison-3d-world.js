import * as T from 'three';
import {BAR_X} from './yoyo-core.js';
export const CHARACTER_FILE='danse-quaternius-hero.glb';
export const ROOM={width:3.3,depth:3.3,height:3.05};
export const ITEMS=['Trouver la brosse','Attraper le tabac','Récupérer le café'];
export const worldX=(unit,aspect=16/9)=>(unit-.5)*2*.88*Math.tan(63*Math.PI/360)*Math.max(.85,aspect);
const mat=(color,rough=.86,metalness=0)=>new T.MeshStandardMaterial({color,roughness:rough,metalness});
const M={wall:mat('#a4a69d'),floor:mat('#575e5a'),steel:mat('#59646a',.45,.65),
 wood:mat('#81715d'),bed:mat('#c7c3b8'),cover:mat('#76867c'),
 porcelain:mat('#cbd8d2',.32),shade:mat('#30383a'),rope:mat('#d5ccaf'),
 tobacco:mat('#a67b62'),coffee:mat('#5c9ba0'),skin:mat('#b8947c')};
const add=(parent,name,geometry,material,x,y,z)=>{
 const o=new T.Mesh(geometry,material);o.name=name;o.userData.component=name;
 o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
};
const box=(p,n,w,h,d,x,y,z,m=M.wall)=>add(p,n,new T.BoxGeometry(w,h,d),m,x,y,z);
const ball=(p,n,r,x,y,z,m=M.skin)=>add(p,n,new T.SphereGeometry(r,16,12),m,x,y,z);
const cyl=(p,n,r,h,x,y,z,m=M.steel)=>add(p,n,new T.CylinderGeometry(r,r,h,12),m,x,y,z);
function rod(p,n,a,b,r,m=M.steel){
 const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A);
 const o=cyl(p,n,r,d.length(),...(A.clone().add(B).multiplyScalar(.5).toArray()),m);
 o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;
}
export function createBrush(){
 const group=new T.Group();group.name='brosse-3d';
 cyl(group,'manche-brosse',.028,.59,0,.31,0,M.wood);
 cyl(group,'embout-brosse',.086,.17,0,.04,0,M.shade);
 return group;
}
