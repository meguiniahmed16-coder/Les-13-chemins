import * as T from 'three';
// The source archive contains full skin (mesh 0), a second index set for visible skin
// when clothed (mesh 15), the original garment (mesh 14) and its lining (mesh 16).
// Never change a bone, original morph target or the full-body index.
export async function prepareWardrobe(gltf){
 const p=gltf.parser,defs=p.json.meshes;
 const meshAt=async index=>{const nodeIndex=p.json.nodes.findIndex(n=>n.mesh===index);if(nodeIndex<0)throw Error('Maillage original introuvable : '+index);const node=await p.getDependency('node',nodeIndex);if(node.isMesh)return node;let found=null;node.traverse(o=>{if(!found&&o.isMesh)found=o;});return found;};
 const [body,cloth,neck,head,jaw]=await Promise.all([0,14,13,12,1].map(meshAt));
 if(!body?.isSkinnedMesh||!cloth?.isSkinnedMesh||!neck?.isSkinnedMesh||!head||!jaw)throw Error('Structure du modèle original inattendue.');
 if(!body.geometry.index||defs[15]?.name!=='Corps V27 · peau visible'||defs[15].primitives[0].attributes.POSITION!==defs[0].primitives[0].attributes.POSITION||defs[16]?.name!=='Sous-couche textile blanche · pantalon')throw Error('Maillages anatomiques de référence incompatibles.');
 const full=body.geometry.index,covered=await p.getDependency('accessor',defs[15].primitives[0].indices);
 if(!covered?.isBufferAttribute||covered.count%3||covered.count>=full.count||covered.array.some(i=>i>=body.geometry.attributes.position.count))throw Error('Index de peau habillée invalide.');
 // Reuse the archived lining, never a substitute garment. Its weight indices refer to
 // the original first 15 body joints, preserved by the 110-bone body skin.
 const liningSource=await p.getDependency('mesh',16);
 const source=liningSource.isMesh?liningSource:liningSource.children.find(x=>x.isMesh);
 if(!source?.geometry?.attributes?.skinIndex||!source.geometry.attributes.skinWeight||source.geometry.attributes.skinIndex.array.some(i=>i>=body.skeleton.bones.length))throw Error('Sous-couche textile incompatible.');
 const lining=new T.SkinnedMesh(source.geometry,source.material);lining.name='Sous-couche textile originale';lining.position.copy(body.position);lining.quaternion.copy(body.quaternion);lining.scale.copy(body.scale);
 body.parent.add(lining);lining.updateMatrixWorld(true);lining.bind(body.skeleton,body.bindMatrix);lining.bindMode=body.bindMode;lining.frustumCulled=false;lining.visible=false;
 const base=cloth.geometry.attributes.position.array.slice(),normal=cloth.geometry.attributes.normal.array.slice(),direction=new T.Vector3();
 // Positive allowance is in metres and is applied to the rest mesh, not the skeleton.
 function ease(mm=3){const a=cloth.geometry.attributes.position;for(let i=0;i<a.count;i++){const j=i*3;const n=direction.fromArray(normal,j).normalize();const v=mm*.001;a.setXYZ(i,base[j]+v*n.x,base[j+1]+v*n.y,base[j+2]+v*n.z);}a.needsUpdate=true;cloth.geometry.computeBoundingSphere();cloth.geometry.computeBoundingBox();}
 function setDressed(dressed){body.geometry.setIndex(dressed?covered:full);body.visible=true;cloth.visible=dressed;lining.visible=dressed;neck.visible=true;}
 return {body,cloth,lining,neck,head,jaw,full,covered,setDressed,ease};
}
function nearestRingSamples(meshes,neck,points,row,cols){
 const p=new T.Vector3(),n=new T.Vector3(),old=new T.Vector3(),matrix=new T.Matrix4(),nm=new T.Matrix3(),inv=neck.matrixWorld.clone().invert();
 const ring=Array.from({length:cols},(_,i)=>{const j=(row*cols+i)*3;return {p:new T.Vector3().fromArray(points,j),n:null,d:Infinity};});
 const y=ring.reduce((s,x)=>s+x.p.y,0)/cols;
 const neckNormal=neck.geometry.attributes.normal;
 for(const mesh of meshes){const a=mesh.geometry.attributes.position,b=mesh.geometry.attributes.normal;if(!a||!b)continue;matrix.multiplyMatrices(inv,mesh.matrixWorld);nm.getNormalMatrix(matrix);
  for(let j=0;j<a.count;j++){p.fromBufferAttribute(a,j).applyMatrix4(matrix);if(Math.abs(p.y-y)>.012)continue;
   let best=-1,d=.0001;for(let i=0;i<cols;i++){const s=ring[i],q=p.distanceToSquared(s.p);if(q<d&&q<s.d){d=q;best=i;}}
   if(best<0)continue;n.fromBufferAttribute(b,j).applyMatrix3(nm).normalize();old.fromBufferAttribute(neckNormal,row*cols+best).normalize();
   if(n.dot(old)<.15)continue;ring[best].n=n.clone();ring[best].d=d;
  }
 }
 // Interpolate nearby matches rather than imposing discontinuous individual normals.
 return ring.map((s,i)=>{const sum=new T.Vector3();let w=0;for(let j=-5;j<=5;j++){const a=ring[(i+j+cols)%cols];if(!a.n)continue;const k=(6-Math.abs(j))/(1+4000*a.d);sum.addScaledVector(a.n,k);w+=k;}return w>0?sum.normalize():null;});
}
export function prepareNeck(wardrobe){
 const {neck,body,head,jaw}=wardrobe;neck.updateWorldMatrix(true,false);body.updateWorldMatrix(true,false);head.updateWorldMatrix(true,false);jaw.updateWorldMatrix(true,false);
 const g=neck.geometry,pos=g.attributes.position,norm=g.attributes.normal,base=pos.array.slice(),baseN=norm.array.slice(),cols=193,rows=13;
 if(pos.count!==cols*rows)return ()=>{};
 const low=nearestRingSamples([body],neck,base,0,cols),high=nearestRingSamples([head,jaw],neck,base,rows-1,cols);
 // Smooth the already-authored 13-row transition axially, preserving both boundary rings,
 // UVs and skin weights. Blend to actual neighbouring skin normals at the two joins.
 let smooth=base.slice();for(let pass=0;pass<3;pass++){const next=smooth.slice();for(let r=1;r<rows-1;r++)for(let i=0;i<cols;i++){const j=(r*cols+i)*3;for(const k of [0,1,2]){const v=(smooth[j+k-cols*3]+smooth[j+k+cols*3])*.5;next[j+k]=T.MathUtils.lerp(smooth[j+k],v,.48);}}smooth=next;}
 return function apply(strength=1){strength=T.MathUtils.clamp(strength,0,1);for(let i=0;i<base.length;i++)pos.array[i]=T.MathUtils.lerp(base[i],smooth[i],strength);pos.needsUpdate=true;g.computeVertexNormals();const n=new T.Vector3(),old=new T.Vector3();for(let r=0;r<rows;r++)for(let i=0;i<cols;i++){const j=r*cols+i;old.fromArray(baseN,j*3).normalize();n.fromBufferAttribute(norm,j).normalize();if(n.dot(old)<0)n.negate();n.lerp(old,.35).normalize();if(low[i]&&r<5)n.lerp(low[i],.82*(1-r/5)).normalize();if(high[i]&&r>rows-6)n.lerp(high[i],.82*(1-(rows-1-r)/5)).normalize();n.lerp(old,1-strength).normalize();norm.setXYZ(j,n.x,n.y,n.z);}norm.needsUpdate=true;g.computeBoundingSphere();g.computeBoundingBox();};
}
