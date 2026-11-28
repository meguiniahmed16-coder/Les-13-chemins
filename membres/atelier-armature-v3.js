import * as T from 'three';

// Source V22: the 15 legacy bones remain the input of the existing motion solver.
// Added body bones are deforming joints, not drawing-only markers.
export const EXTRA_NAMES=['Lombaires','Cou inférieur · cervicales','Cou supérieur · cervicales','Clavicule droite','Clavicule gauche','Cheville droite','Cheville gauche','Orteils droits','Orteils gauches','Mandibule','Œil droit','Œil gauche','Paupière supérieure droite','Paupière inférieure droite','Paupière supérieure gauche','Paupière inférieure gauche'];
export const EXTRA_EDGES=[[0,15],[15,14],[14,16],[16,17],[17,1],[14,18],[18,2],[14,19],[19,5],[9,20],[20,10],[10,22],[12,21],[21,13],[13,23],[1,24],[1,25],[1,26],[25,27],[25,28],[26,29],[26,30]];
export const TOTAL_JOINTS=31;
export const FIT_DEFAULT={f:.65,m:.15};
export const JAW={m:{pivot:[0,-.04,.17],angle:.25},f:{pivot:[0,-.074,.079],angle:14.03745*Math.PI/180}};
const smooth=(a,b,x)=>T.MathUtils.smoothstep(x,a,b);
const clamp=(v,a=0,b=1)=>T.MathUtils.clamp(Number(v)||0,a,b);
const rad=Math.PI/180;
const compose=o=>new T.Matrix4().compose(o.position,o.quaternion,o.scale);
const point=(x,y,z)=>new T.Vector3(x,y,z);
const zero=()=>new T.Vector3(), unit=()=>new T.Vector3(1,1,1);
function setMat(o,m){m.decompose(o.position,o.quaternion,o.scale);o.updateMatrix();}
function manual(v){const u=v||[0,0,0,0,0,0];return {q:new T.Quaternion().setFromEuler(new T.Euler(u[0]*rad,u[1]*rad,u[2]*rad,'XYZ')),d:point(u[3]||0,u[4]||0,u[5]||0)};}
function pivotTransform(p,v){const {q,d}=manual(v);return new T.Matrix4().makeTranslation(p.x+d.x,p.y+d.y,p.z+d.z).multiply(new T.Matrix4().makeRotationFromQuaternion(q)).multiply(new T.Matrix4().makeTranslation(-p.x,-p.y,-p.z));}
const blend=(a,b,t)=>{const pa=zero(),pb=zero(),qa=new T.Quaternion(),qb=new T.Quaternion(),sa=unit(),sb=unit();a.decompose(pa,qa,sa);b.decompose(pb,qb,sb);return new T.Matrix4().compose(pa.lerp(pb,t),qa.slerp(qb,t),sa.lerp(sb,t));};
function bone(parent,name,pos){const b=new T.Bone();b.name=name;b.position.copy(pos);parent.add(b);b.updateMatrix();return b;}
function find(root,pattern){let out;root.traverse(o=>{if(!out&&o.isMesh&&pattern.test(o.name))out=o;});return out;}
function bounds(o){o.geometry.computeBoundingBox();return o.geometry.boundingBox.clone();}
function relative(parent,child){parent.updateWorldMatrix(true,false);child.updateWorldMatrix(true,false);return parent.matrixWorld.clone().invert().multiply(child.matrixWorld);}
function skinExtensions(mesh,extras,positions,restInverses){
 const sk=mesh.skeleton,geo=mesh.geometry,p=geo.attributes.position,i=geo.attributes.skinIndex,w=geo.attributes.skinWeight;
 if(!i||!w||sk.bones.length!==15)throw Error('Armature V22 inattendue');
 const outI=new Uint16Array(p.count*4),outW=new Float32Array(p.count*4);
 // Preserve original normalized weights except in the local anatomical regions.
 for(let n=0;n<p.count;n++){
  const x=p.getX(n),y=p.getY(n),z=p.getZ(n),map=new Map();
  for(let k=0;k<4;k++){const v=w.getComponent(n,k);if(v>0)map.set(i.getComponent(n,k),(map.get(i.getComponent(n,k))||0)+v);}
  const shift=(from,to,f)=>{const v=(map.get(from)||0)*clamp(f);if(v>1e-6){map.set(from,(map.get(from)||0)-v);map.set(to,(map.get(to)||0)+v);}};
  const lumbar=positions[0].y,low=positions[1].y,high=positions[2].y;
  const core=(1-smooth(.13,.24,Math.abs(x-positions[0].x)))*(1-smooth(.17,.33,Math.abs(y-lumbar)));
  shift(0,15,.70*core);shift(14,15,.60*core);
  const neckMask=1-smooth(.055,.12,Math.abs(x-positions[1].x));
  const lower=smooth(low-.09,low+.035,y)*neckMask,upper=smooth(low,high+.015,y)*neckMask;
  shift(14,16,.7*lower);shift(1,17,.65*upper);shift(16,17,.65*upper);
  for(const side of [0,1]){
   const j=side?5:2,leg=side?12:9,foot=side?13:10,cl=positions[3+side],ank=positions[5+side],toe=positions[7+side];
   const shoulder=(1-smooth(.025,.14,Math.abs(x-cl.x)))*(1-smooth(.02,.15,Math.abs(y-cl.y)));
   shift(14,18+side,.50*shoulder);shift(j,18+side,.55*shoulder);
   const legMask=1-smooth(.055,.15,Math.abs(x-ank.x)),ankMask=(1-smooth(.025,.115,Math.abs(y-ank.y)))*legMask;
   shift(leg,20+side,.7*ankMask);shift(foot,20+side,.6*ankMask);
   const toeMask=smooth(toe.z-.035,toe.z+.023,z)*(1-smooth(.055,.11,y))*legMask;
   shift(foot,22+side,.88*toeMask);shift(20+side,22+side,.55*toeMask);
  }
  const list=[...map.entries()].filter(([,v])=>v>1e-7).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=list.reduce((s,x)=>s+x[1],0)||1;
  for(let k=0;k<list.length;k++){outI[n*4+k]=list[k][0];outW[n*4+k]=list[k][1]/sum;}
 }
 geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(outI,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(outW,4));
 mesh.skeleton=new T.Skeleton([...sk.bones,...extras],[...sk.boneInverses.map(m=>m.clone()),...restInverses.map(m=>m.clone())]);
}
// Keep native V22 morphs, but give the mandibular arch a real hinge. The
// pivot/angle are the least-squares rigid fit of its authored Ouvrir target.
function rigLid(a,mesh,upper,lower,c){
 if(!mesh)return null;
 const geo=mesh.geometry,p=geo.attributes.position,idx=new Uint16Array(p.count*4),w=new Float32Array(p.count*4);
 for(let i=0;i<p.count;i++){const t=smooth(c.y-.012,c.y+.012,p.getY(i));idx[i*4]=0;idx[i*4+1]=1;w[i*4]=t;w[i*4+1]=1-t;}
 geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(idx,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(w,4));
 const old=mesh,owner=old.parent,replacement=new T.SkinnedMesh(geo,old.material);replacement.name=old.name;replacement.position.copy(old.position);replacement.quaternion.copy(old.quaternion);replacement.scale.copy(old.scale);replacement.frustumCulled=false;owner.add(replacement);replacement.updateMorphTargets();if(old.morphTargetDictionary)replacement.morphTargetDictionary={...old.morphTargetDictionary};if(old.morphTargetInfluences)replacement.morphTargetInfluences=old.morphTargetInfluences.slice();
 a.root.updateMatrixWorld(true);replacement.bind(new T.Skeleton([upper,lower]),replacement.matrixWorld.clone());owner.remove(old);
 for(const arr of [a.meshes,a.morphs]){const i=arr.indexOf(old);if(i>=0)arr[i]=replacement;}return replacement;
}
// The source scan was cut at y=-.340 in its own head coordinates. Match
// the actual cut contour rather than expanding a generic cylindrical collar.
// Hair vertices outside the nearest seam tolerance are not used.
export function matchNeckRim(a){
 a.root.updateMatrixWorld(true);
 const neck=a.neck,geo=neck.geometry,p=geo.attributes.position,base=a.neckBase,b=new T.Box3().setFromBufferAttribute(p),hi=b.max.y,lo=b.min.y,cut=[];
 a.head.traverse(o=>{if(!o.isMesh||!/^Visage.source/i.test(o.name))return;const v=o.geometry.attributes.position,m=neck.matrixWorld.clone().invert().multiply(o.matrixWorld),q=zero();for(let i=0;i<v.count;i++){if(Math.abs(v.getY(i)+.34)>.00025)continue;q.fromBufferAttribute(v,i).applyMatrix4(m);if(Math.abs(q.y-hi)<.009)cut.push(q.clone());}});
 if(cut.length<20)return {matched:0};
 const rings=[];for(let i=0;i<p.count;i++){if(Math.abs(base[i*3+1]-hi)<.0002)rings.push(i);}
 if(rings.length<8)return {matched:0};
 const offsets=[],tmp=zero();let matched=0;
 for(const i of rings){tmp.fromArray(base,i*3);let best=null,dist=.020**2;for(const q of cut){const d=(tmp.x-q.x)**2+(tmp.z-q.z)**2;if(d<dist){dist=d;best=q;}}const delta=best?best.clone().sub(tmp):zero();if(best){delta.y+=.0006;matched++;}offsets.push(delta);}
 if(matched<rings.length*.6)return {matched:0};
 // The 13 rings of the source bridge have identical angular sampling.
 if(p.count%rings.length===0){const n=rings.length;for(let i=0;i<p.count;i++){const j=i*3,t=smooth(lo+(hi-lo)*.40,hi,base[j+1]),d=offsets[i%n];p.setXYZ(i,base[j]+t*d.x,base[j+1]+t*d.y,base[j+2]+t*d.z);}}else return {matched:0};
 p.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();a.neckBase=p.array.slice();return {matched,total:rings.length};
}
export function initExpandedRig(a){
 const bones=a.bones,root=bones[0].parent,rest=bones.map(b=>b.position.clone()),head=bones[1],torso=bones[14];
 a.root.updateMatrixWorld(true);
 // The lower neck lies at the actual body cut. The upper is derived from
 // the original bridge's end ring in the shared skeleton coordinate system.
 const portraitToRoot=relative(root,a.portrait),nb=a.neckRestBox;
 const bottom=nb.getCenter(zero());bottom.y=nb.min.y;bottom.applyMatrix4(portraitToRoot);
 const top=a.neckAnchor.clone().applyMatrix4(portraitToRoot);
 const lower=bottom.clone();lower.y-=.035;
 const upper=top.clone();upper.y+=.008;
 const lumbar=rest[0].clone().lerp(rest[14],.48);
 const positions=[lumbar,lower,upper,rest[14].clone().lerp(rest[2],.58),rest[14].clone().lerp(rest[5],.58)];
 for(const j of [10,13]){const p=rest[j].clone();p.y=.085;p.z-=.055;positions.push(p);}
 for(const j of [10,13]){const p=rest[j].clone();p.y=.035;p.z+=.063;positions.push(p);}
 const extra=positions.map((p,i)=>bone(root,EXTRA_NAMES[i],p));a.root.updateMatrixWorld(true);
 // V22 inverse-bind matrices use the flat rig's LOCAL rest coordinates, not the scaled scene world.
 const restInverses=positions.map(p=>new T.Matrix4().makeTranslation(-p.x,-p.y,-p.z));
 // Actual hierarchy, retaining bind pose and original skin inverse matrices.
 torso.attach(extra[1]);extra[1].attach(extra[2]);extra[2].attach(head);a.root.updateMatrixWorld(true);
 const bodyMesh=a.body,garment=a.garment;
 skinExtensions(bodyMesh,extra,positions,restInverses);skinExtensions(garment,extra,positions,restInverses);
 const jaw=bone(a.head,'Mandibule',new T.Vector3(...JAW[a.id].pivot));a.root.updateMatrixWorld(true);
 const lowerTeeth=find(a.head,/Dents.inf.rieures/i),tongue=find(a.head,/Langue/i),upperTeeth=find(a.head,/Dents.sup.rieures/i);
 if(!lowerTeeth||!upperTeeth)throw Error('Arcades dentaires séparées introuvables');
 const jawParts=[lowerTeeth,tongue].filter(Boolean);for(const o of jawParts)jaw.attach(o);
 const eyeList=[],lidList=[],faceBones=[jaw];
 for(const side of ['D','G']){
  const eye=find(a.head,new RegExp('Globe.et.iris.'+side+'$','i')),lid=find(a.head,new RegExp('Paupi.res.'+side+'$','i'));if(!eye||!lid)throw Error('Composant oculaire introuvable '+side);
  const b=bounds(eye),s=b.getSize(zero()),c=b.getCenter(zero());c.z=b.max.z-s.x*.44;
  const eb=bone(a.head,'Œil '+side,c);a.root.updateMatrixWorld(true);eb.attach(eye);
  // Keep the original textured ocular surface. The synthetic full sphere
  // occluded the iris, especially from the front. Never overlay another globe.
  const up=bone(a.head,'Paupière supérieure '+side,c),down=bone(a.head,'Paupière inférieure '+side,c);a.root.updateMatrixWorld(true);
  const lidMesh=rigLid(a,lid,up,down,c);eyeList.push({bone:eb,rest:c.clone(),mesh:eye});lidList.push({upper:up,lower:down,rest:c.clone(),mesh:lidMesh});
 }
 faceBones.push(...eyeList.map(x=>x.bone),...lidList.flatMap(x=>[x.upper,x.lower]));
 a.expanded={root,positions,extra,rest,all:[...bones,...extra,...faceBones],jaw,jawParts,eyeList,lidList};
 a.root.updateMatrixWorld(true);return a.expanded;
}
function deltaMatrices(a){return a.bones.map((b,i)=>compose(b).multiply(a.bind[i].clone().invert()));}
function rotateLegacy(a,ids,p,v){if(!v||v.every(x=>x===0))return;const m=pivotTransform(p,v);for(const i of ids)setMat(a.bones[i],m.clone().multiply(compose(a.bones[i])));}
// Called after the legacy solver (which supplies flat transforms), before the
// world matrices are consumed. Restore the true cervical hierarchy each frame.
export function poseExpandedRig(a,joints){
 const r=a.expanded;if(!r)return;let d=deltaMatrices(a);const p=r.positions,extra=r.extra;
 const driver=(pos,i,j,t)=>blend(d[i],d[j],t).multiply(new T.Matrix4().makeTranslation(pos.x,pos.y,pos.z));
 let lumbar=driver(p[0],0,14,.48);rotateLegacy(a,[14,1,2,3,4,5,6,7],zero().setFromMatrixPosition(lumbar),joints[15]);setMat(extra[0],pivotTransform(zero().setFromMatrixPosition(lumbar),joints[15]).multiply(lumbar));
 d=deltaMatrices(a);
 for(const [k,base,arm] of [[3,2,[2,3,4]],[4,5,[5,6,7]]]){const m=driver(p[k],14,base,.5),pivot=zero().setFromMatrixPosition(m);rotateLegacy(a,arm,pivot,joints[15+k]);setMat(extra[k],pivotTransform(pivot,joints[15+k]).multiply(m));}
 d=deltaMatrices(a);
 for(const [k,leg,foot] of [[5,9,10],[6,12,13]]){const m=driver(p[k],leg,foot,.5),pivot=zero().setFromMatrixPosition(m);rotateLegacy(a,[foot],pivot,joints[15+k]);setMat(extra[k],pivotTransform(pivot,joints[15+k]).multiply(m));}
 d=deltaMatrices(a);
 for(const [k,foot] of [[7,10],[8,13]]){const m=d[foot].clone().multiply(new T.Matrix4().makeTranslation(p[k].x,p[k].y,p[k].z));setMat(extra[k],pivotTransform(zero().setFromMatrixPosition(m),joints[15+k]).multiply(m));}
 const low=driver(p[1],14,1,.20),high=driver(p[2],14,1,.70);
 const l=pivotTransform(zero().setFromMatrixPosition(low),joints[16]),h=pivotTransform(zero().setFromMatrixPosition(high.clone().premultiply(l)),joints[17]);
 const lowWorld=l.clone().multiply(low),highWorld=h.clone().multiply(l).multiply(high),headWorld=h.clone().multiply(l).multiply(compose(a.bones[1]));
 setMat(extra[1],compose(a.bones[14]).invert().multiply(lowWorld));
 setMat(extra[2],lowWorld.clone().invert().multiply(highWorld));
 setMat(a.bones[1],highWorld.clone().invert().multiply(headWorld));
}
export function facialPose(a,values,settings,joints){
 const r=a.expanded;if(!r)return;const src=JAW[a.id],manualJaw=joints[24]||[];
 // At full UI scale stop at 78% of the source deformation, avoiding the
 // excessive extreme in the screenshots. Speech uses the same calibrated hinge.
 const open=clamp((values.Ouvrir||0)*.78+(manualJaw[0]||0)*rad/src.angle);
 values.Ouvrir=open;
 const jaw=r.jaw;jaw.position.set(...src.pivot);jaw.position.add(point(manualJaw[3]||0,manualJaw[4]||0,manualJaw[5]||0));jaw.rotation.set(open*src.angle,clamp(manualJaw[1],-8,8)*rad,clamp(manualJaw[2],-8,8)*rad);jaw.updateMatrix();
 for(let i=0;i<2;i++){
  const e=r.eyeList[i],l=r.lidList[i],v=joints[25+i]||[],advance=clamp(settings.eyeAdvance??.012,-.015,.025);
  e.bone.position.copy(e.rest).add(point(v[3]||0,v[4]||0,advance+(v[5]||0)));e.bone.rotation.set(((values.RegardBas||0)-(values.RegardHaut||0))*.24+(v[0]||0)*rad,((values.RegardG||0)-(values.RegardD||0))*.28+(v[1]||0)*rad,(v[2]||0)*rad);e.bone.updateMatrix();
  const u=joints[27+2*i]||[],b=joints[28+2*i]||[],blink=clamp(values.Cligner||0),squint=clamp(values.Plisser||0);
  l.upper.position.copy(l.rest).add(point(u[3]||0,u[4]||0,u[5]||0));l.lower.position.copy(l.rest).add(point(b[3]||0,b[4]||0,b[5]||0));
  l.upper.rotation.set((blink*.11+squint*.04)+(u[0]||0)*rad,(u[1]||0)*rad,(u[2]||0)*rad);
  l.lower.rotation.set((-blink*.045-squint*.025)+(b[0]||0)*rad,(b[1]||0)*rad,(b[2]||0)*rad);l.upper.updateMatrix();l.lower.updateMatrix();
 }
}
export function clearDoubleFaceMorphs(a){
 const r=a.expanded;if(!r)return;for(const o of r.jawParts){const i=o.morphTargetDictionary?.Ouvrir;if(i!==undefined)o.morphTargetInfluences[i]=0;}
 for(const {mesh} of r.eyeList)for(const key of ['RegardG','RegardD','RegardBas','RegardHaut']){const i=mesh.morphTargetDictionary?.[key];if(i!==undefined)mesh.morphTargetInfluences[i]=0;}
 for(const {mesh} of r.lidList){const i=mesh.morphTargetDictionary?.Cligner;if(i!==undefined)mesh.morphTargetInfluences[i]*=.85;}
}
// Estimate a safe local ease from the actual body. Fit the fabric, not the
// person's body. Keep clearance in the rest pose and smooth the displacement.
export function prepareKimonoFit(body,garment){
 const p=body.geometry.attributes.position,g=garment.geometry.attributes.position,cell=.045,grid=new Map(),key=(x,y,z)=>x+','+y+','+z;
 for(let i=0;i<p.count;i+=3){const y=p.getY(i);if(y<.61||y>1.44)continue;const k=key(Math.floor(p.getX(i)/cell),Math.floor(y/cell),Math.floor(p.getZ(i)/cell));if(!grid.has(k))grid.set(k,[]);if(grid.get(k).length<64)grid.get(k).push(i);}
 const delta=new Float32Array(g.count*3);
 for(let i=0;i<g.count;i++){const x=g.getX(i),y=g.getY(i),z=g.getZ(i);if(y<.69||y>1.42)continue;let best=-1,d=.115**2;const gx=Math.floor(x/cell),gy=Math.floor(y/cell),gz=Math.floor(z/cell);
  for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++)for(let dz=-2;dz<=2;dz++)for(const j of grid.get(key(gx+dx,gy+dy,gz+dz))||[]){const t=(x-p.getX(j))**2+(y-p.getY(j))**2+(z-p.getZ(j))**2;if(t<d){d=t;best=j;}}
  if(best<0)continue;const distance=Math.sqrt(d),amount=Math.min(.033,Math.max(0,distance-.016)*.65)*(smooth(.69,.85,y))*(1-smooth(1.38,1.43,y));if(amount<=0)continue;
  const f=amount/Math.max(.001,distance);delta.set([(p.getX(best)-x)*f,0,(p.getZ(best)-z)*f],i*3);
 }
 const index=garment.geometry.index?.array;if(index){const adj=Array.from({length:g.count},()=>[]);for(let i=0;i<index.length;i+=3){const a=index[i],b=index[i+1],c=index[i+2];adj[a].push(b,c);adj[b].push(a,c);adj[c].push(a,b);}for(let pass=0;pass<2;pass++){const prev=delta.slice();for(let i=0;i<g.count;i++)if(adj[i].length){for(let k of [0,2])delta[i*3+k]=.55*prev[i*3+k]+.45*adj[i].reduce((s,j)=>s+prev[j*3+k],0)/adj[i].length;}}}
 return delta;
}
