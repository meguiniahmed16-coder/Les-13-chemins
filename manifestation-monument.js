import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {STATUE} from './manifestation-core.js';
export function createRepublicMonument(model){
 const root=new T.Group();root.name='Monument de la République';
 const scan=model.clone(true);scan.position.set(1.10,0,1.90);root.add(scan);
 const flight=[],width=1.40,count=12,x=STATUE.footX-STATUE.x,start=STATUE.footZ-STATUE.z,end=STATUE.topZ-STATUE.z;
 const depth=(end-start)/count;
 for(let i=0;i<count;i++){
  const h=STATUE.topHeight*(i+1)/count;
  flight.push(new T.BoxGeometry(width,h,depth+.012).translate(x,h/2,start+i*depth));
 }
 flight.push(new T.BoxGeometry(width,STATUE.topHeight,1.30).translate(x,STATUE.topHeight/2,end+.44));
 const steps=new T.Mesh(mergeGeometries(flight),new T.MeshStandardMaterial({color:0xc2b9a6,roughness:.94}));
 flight.forEach(g=>g.dispose());steps.name='Marches et palier du jeu';root.add(steps);
 root.userData={landmark:'Monument à la République',source:'Republique.stl',platformHeight:STATUE.topHeight};
 return root;
}
