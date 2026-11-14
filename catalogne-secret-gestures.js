import * as T from 'three';
import {poseSecret} from './catalogne-motion.js';
export const SECRET_DURATION=Object.freeze({dance:6.4,joint:7.6});
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
// One reusable prop set, attached to the adult protagonist. No score or gameplay effects.
export function createSecretGestures(actor){
 if(!actor.rig)return {update(){},hide(){}};
 const p=actor.rig,h=p.h,root=new T.Group();p.group.add(root);root.visible=false;
 const material=color=>new T.MeshStandardMaterial({color,roughness:.85});
 const mesh=(geometry,mat,parent=root)=>{const m=new T.Mesh(geometry,mat);parent.add(m);return m;};
 const paper=mesh(new T.PlaneGeometry(.12,.055),new T.MeshStandardMaterial({color:'#ede6d2',side:T.DoubleSide,roughness:.9}));paper.rotation.x=-Math.PI/2;
 const joint=new T.Group();root.add(joint);
 mesh(new T.CylinderGeometry(.005,.007,.105,8),material('#e9dfc3'),joint).rotation.x=Math.PI/2;
 const tip=mesh(new T.SphereGeometry(.006,6,4),new T.MeshBasicMaterial({color:'#dc8d49'}),joint);tip.position.z=.053;
 const lighter=new T.Group();root.add(lighter);mesh(new T.BoxGeometry(.025,.055,.018),material('#b96d4f'),lighter);
 const cap=mesh(new T.BoxGeometry(.025,.012,.020),material('#c2bba5'),lighter);cap.position.y=.028;
 const flame=mesh(new T.SphereGeometry(1,7,5),new T.MeshBasicMaterial({color:'#f3c465',transparent:true,opacity:.9}),lighter);flame.position.y=.055;flame.scale.set(.007,.022,.007);
 const smoke=[];for(let i=0;i<6;i++){const puff=mesh(new T.IcosahedronGeometry(1,1),new T.MeshBasicMaterial({color:'#dce1d7',transparent:true,opacity:0,depthWrite:false}));smoke.push(puff);}
 return {hide(){root.visible=false;},update(kind,time){
  poseSecret(p,kind,time);root.visible=kind==='joint';if(!root.visible)return;
  const raise=smooth((time-2.5)/1.2),lower=smooth((time-5.5)/.7);
  paper.visible=time<2.65;paper.position.set(0,.59*h,.20*h);
  joint.visible=time>1.9;joint.position.set(0,T.MathUtils.lerp(.59,.825,raise)*h,T.MathUtils.lerp(.20,.137,raise)*h);joint.rotation.y=(1-raise)*Math.PI/2;
  lighter.visible=time>=3.7&&time<6.2;lighter.position.set(.025*h,T.MathUtils.lerp(.78,.38,lower)*h,T.MathUtils.lerp(.20,.045,lower)*h);
  flame.visible=time>=4.05&&time<5.35;flame.scale.y=.020+Math.sin(time*31)*.003;tip.visible=time>4.6;
  for(let i=0;i<smoke.length;i++){const age=time-5.25-i*.20,alive=age>0&&age<1.7;const puff=smoke[i];puff.visible=alive;if(!alive)continue;puff.position.set(Math.sin(age*2+i)*age*.035,.84*h+age*.19,.19*h+age*.09);puff.scale.setScalar(.012+age*.032);puff.material.opacity=.20*(1-age/1.7);}
 }};
}
