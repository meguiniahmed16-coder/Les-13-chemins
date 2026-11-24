import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

/* Only the authored GLB assets are displayed. No generated armchairs, television,
   avatars or dojo geometry are substituted for the supplied models. */
export async function loadOriginalCinemaAssets(scene){
 const loader=new GLTFLoader();
 const [white,dojo]=await Promise.all([
   loader.loadAsync('/assets/intro-original/white-room-original.glb'),
   loader.loadAsync('/assets/intro-original/dojo-original.glb')
 ]);
 const whiteRoom=white.scene,dojoRoom=dojo.scene;
 whiteRoom.name='Salle blanche fournie · fauteuils et télévision';
 dojoRoom.name='Dojo fourni · architecture et tatami';
 let firstScreen=false;
 whiteRoom.traverse(o=>{
   if(/^TV Screen\\.\\d+/.test(o.name)){
     // The model contains a long sequence of superimposed television frames.
     // Display only the first still, rather than stacking 200 screens.
     o.visible=!firstScreen;
     firstScreen=true;
   }
   if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}
 });
 dojoRoom.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 whiteRoom.visible=dojoRoom.visible=false;scene.add(whiteRoom,dojoRoom);
 const locate=label=>{
  const needle=label.toLowerCase().replace(/[^a-z0-9]/g,'');let found=null;
  whiteRoom.traverse(o=>{if(!found&&o.name.toLowerCase().replace(/[^a-z0-9]/g,'').includes(needle))found=o});
  return found;
 };
 return {whiteRoom,dojoRoom,blueChair:locate('BLUE CHAIR'),
  redChair:locate('RED CHAIR'),television:locate('TV_284'),tvCase:locate('TV Case')};
}
