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
export function buildCell(){
 const scene=new T.Scene();scene.background=new T.Color('#6e7e81');
 scene.fog=new T.Fog('#6e7e81',11,30);
 scene.add(new T.HemisphereLight('#e0e8dc','#4d5551',2.2));
 const lamp=new T.PointLight('#ffe5bb',55,9,2);
 lamp.position.set(.20,2.73,.45);lamp.castShadow=true;lamp.shadow.mapSize.set(512,512);scene.add(lamp);
 const sun=new T.DirectionalLight('#d8e9ef',2.3);sun.position.set(-1,4,-4);scene.add(sun);
 const size=ROOM;
 box(scene,'sol-cellule',size.width,.10,size.depth,0,-.05,0,M.floor);
 box(scene,'mur-gauche',.15,size.height,size.depth,-size.width/2,size.height/2,0);
 box(scene,'mur-droit',.15,size.height,size.depth,size.width/2,size.height/2,0);
 box(scene,'plafond',size.width,.09,size.depth,0,size.height,0);
 // A genuine opening left empty between the wall pieces.
 const rear=-size.depth/2;
 for(const side of [-1,1])box(scene,'mur-lateral-fenetre',.83,size.height,.17,side*1.24,size.height/2,rear);
 box(scene,'mur-sous-fenetre',1.65,1.33,.17,0,.665,rear);
 box(scene,'mur-dessus-fenetre',1.65,.55,.17,0,2.78,rear);
 for(const x of BAR_X)rod(scene,'barreau',[x,1.32,rear+.04],[x,2.52,rear+.04],.018);
 for(const y of [1.36,2.48])rod(scene,'barre-horizontale',[-.78,y,rear+.05],[.78,y,rear+.05],.016);
 // Two bunks: steel frame, mattress, blanket, pillow.
 for(const [i,y] of [[1,.50],[2,1.62]]){
  const bunk=new T.Group();bunk.name='lit-superpose-'+i;scene.add(bunk);
  box(bunk,'sommier-'+i,.85,.08,1.98,-1.08,y,.38,M.steel);
  box(bunk,'matelas-'+i,.80,.15,1.92,-1.08,y+.13,.38,M.bed);
  box(bunk,'couverture-'+i,.76,.025,1.19,-1.08,y+.22,.66,M.cover);
  box(bunk,'oreiller-'+i,.62,.075,.27,-1.08,y+.23,-.39,M.bed);
  for(const x of [-1.45,-.70])for(const z of [-.49,1.25])
   rod(bunk,'montant-lit-'+i,[x,.05,z],[x,y+.06,z],.026);
 }
 box(scene,'table',.70,.065,.52,.85,.81,-.84,M.wood);
 for(const x of [.56,1.14])for(const z of [-1.06,-.61])
  rod(scene,'pied-table',[x,.07,z],[x,.80,z],.023);
 box(scene,'tabouret',.36,.06,.35,.67,.47,.31,M.wood);
 for(const x of [.53,.81])for(const z of [.17,.45])
  rod(scene,'pied-tabouret',[x,.06,z],[x,.46,z],.018);
 box(scene,'armoire',.48,1.76,.49,1.19,.9,.94,M.wood);
 box(scene,'porte-armoire',.51,1.70,.02,1.19,.9,.68,M.wall);
 box(scene,'poignee-armoire',.027,.12,.035,1.34,.95,.65,M.steel);
 // Door, observation hatch and latch.
 box(scene,'porte-cellule',.036,2.35,1.01,1.54,1.18,.62,M.shade);
 box(scene,'judas-porte',.05,.12,.30,1.50,1.56,.62,M.steel);
 box(scene,'serrure-porte',.08,.12,.15,1.49,1.12,1.0,M.steel);
 // Sanitary corner.
 const toilet=cyl(scene,'toilettes',.26,.38,1.17,.26,-.12,M.porcelain);toilet.scale.z=.82;
 box(scene,'reservoir',.49,.38,.16,1.18,.66,-.40,M.porcelain);
 const sink=cyl(scene,'lavabo',.23,.13,1.19,1.05,-.83,M.porcelain);sink.scale.z=.78;
 rod(scene,'robinet',[1.18,1.15,-.92],[1.18,1.26,-.92],.021);
 box(scene,'miroir',.028,.42,.38,1.55,1.66,-.82,M.steel);
 // An opposite wall and a neighbour behind the bars.
 box(scene,'facade-en-face',5.8,5,.16,0,2.3,-4.15);
 box(scene,'fenetre-du-voisin',.9,1.4,.025,.45,2.19,-4.03,M.shade);
 for(const x of [.18,.41,.64,.85])rod(scene,'barreau-voisin',[x,1.52,-3.99],[x,2.81,-3.99],.012);
 const silhouette=ball(scene,'tete-du-voisin',.14,.45,2.14,-3.95);
 silhouette.scale.set(.87,1,.8);
 const torso=ball(scene,'buste-du-voisin',.23,.45,1.74,-3.97,M.shade);
 torso.scale.set(1,1.22,.55);
 const storedBrush=createBrush();
 storedBrush.name='brosse-posee';storedBrush.position.set(.49,.15,-.21);storedBrush.rotation.z=1.03;scene.add(storedBrush);
 const heldBrush=createBrush();heldBrush.name='brosse-tenue';heldBrush.visible=false;scene.add(heldBrush);
 const delivery=new T.Group();delivery.name='corde-et-sac';scene.add(delivery);
 cyl(delivery,'corde-de-drap',.008,1.14,0,.66,0,M.rope);
 rod(delivery,'cintre',[-.12,.11,0],[.12,.11,0],.012);
 rod(delivery,'crochet-gauche',[-.12,.11,0],[0,.23,0],.009);
 rod(delivery,'crochet-droit',[.12,.11,0],[0,.23,0],.009);
 const bag=ball(delivery,'sac-de-tabac',.105,0,.025,0,M.tobacco);
 bag.scale.set(.84,1.0,.72);
 delivery.position.set(0,1.31,-1.92);
 return {scene,delivery,bag,storedBrush,heldBrush,lamp};
}
