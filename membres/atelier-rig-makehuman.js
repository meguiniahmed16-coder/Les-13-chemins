import * as T from 'three';

// Build on the original ordered MakeHuman base, not on a scan with an unrelated topology.
// The 163 bones and joint anchors are the upstream CC0 data, including helper vertices.
export function referenceArmature(reference,weights,{positions=reference.positions,topology='makehuman-default-19158',maxInfluences=4}={}){
 if(topology!=='makehuman-default-19158'||reference.vertexCount!==19158||positions.length!==19158*3||Object.keys(reference.rig.bones).length!==163)throw Error('Topologie MakeHuman native requise. Un scan doit être remappé avant de recevoir ces poids.');
 if(maxInfluences!==4)throw Error('Le skinning GLB de cet atelier utilise quatre influences normalisées.');
 const {bones,joints,planes}=reference.rig,scale=.1;
 const originY=positions.reduce((lo,v,i)=>i%3===1?Math.min(lo,v):lo,Infinity);
 const p=idx=>new T.Vector3(positions[idx*3]*scale,(positions[idx*3+1]-originY)*scale,positions[idx*3+2]*scale);
 const anchors=new Map();
 for(const [name,ids] of Object.entries(joints)){if(!ids.length||ids.some(i=>!Number.isInteger(i)||i<0||i>=reference.vertexCount))throw Error('Repère anatomique invalide : '+name);const x=new T.Vector3();for(const id of ids)x.add(p(id));x.multiplyScalar(1/ids.length);if(![x.x,x.y,x.z].every(Number.isFinite))throw Error('Repère non fini');anchors.set(name,x);}
 const order=[],visiting=new Set(),done=new Set();
 function visit(name){if(done.has(name))return;if(visiting.has(name)||!bones[name])throw Error('Hiérarchie invalide : '+name);visiting.add(name);if(bones[name].parent)visit(bones[name].parent);visiting.delete(name);done.add(name);order.push(name);}
 for(const name of Object.keys(bones))visit(name);
 if(order.filter(n=>!bones[n].parent).length!==1||order[0]!=='root')throw Error('Racine unique requise');
 const world=new Map(),objects=new Map(),tails=new Map(),root=new T.Group();root.name='MakeHuman · armature standard CC0';
 for(const name of order){const record=bones[name],head=anchors.get(record.head),tail=anchors.get(record.tail);if(!head||!tail)throw Error('Extrémité absente : '+name);
  const y=tail.clone().sub(head);if(y.lengthSq()<1e-12)throw Error('Os sans longueur : '+name);y.normalize();
  const plane=planes[record.rotation_plane]?.map(k=>anchors.get(k));let z=plane?.length===3&&plane.every(Boolean)?plane[1].clone().sub(plane[0]).cross(plane[2].clone().sub(plane[0])):new T.Vector3(0,0,1);
  z.addScaledVector(y,-z.dot(y));if(z.lengthSq()<1e-10){z.set(Math.abs(y.z)<.9?0:1,0,Math.abs(y.z)<.9?1:0);z.addScaledVector(y,-z.dot(y));}z.normalize();
  const x=y.clone().cross(z).normalize();z=x.clone().cross(y).normalize();const matrix=new T.Matrix4().makeBasis(x,y,z).setPosition(head);world.set(name,matrix);tails.set(name,tail.clone());
  const local=record.parent?world.get(record.parent).clone().invert().multiply(matrix):matrix;
  const bone=new T.Bone();bone.name=name;local.decompose(bone.position,bone.quaternion,bone.scale);(record.parent?objects.get(record.parent):root).add(bone);objects.set(name,bone);
 }
 root.updateMatrixWorld(true);const skeleton=new T.Skeleton(order.map(n=>objects.get(n))),lookup=new Map(order.map((n,i)=>[n,i])),groups=Array.from({length:reference.vertexCount},()=>new Map());
 for(const [name,list] of Object.entries(weights.weights)){const b=lookup.get(name);if(b===undefined)throw Error('Poids sans os : '+name);for(const [i,w] of list){if(!Number.isInteger(i)||!groups[i]||!Number.isFinite(w)||w<0)throw Error('Poids source invalide');if(w>0)groups[i].set(b,(groups[i].get(b)||0)+w);}}
 const indices=new Uint16Array(reference.vertexCount*4),values=new Float32Array(indices.length);let worstDiscarded=0;
 for(let i=0;i<groups.length;i++){const all=[...groups[i]].sort((a,b)=>b[1]-a[1]),full=all.reduce((n,x)=>n+x[1],0),top=all.slice(0,4),sum=top.reduce((n,x)=>n+x[1],0);if(!(sum>0))throw Error('Sommet sans influence : '+i);worstDiscarded=Math.max(worstDiscarded,1-sum/full);for(let k=0;k<top.length;k++){indices[i*4+k]=top[k][0];values[i*4+k]=top[k][1]/sum;}}
 return {root,skeleton,order,objects,tails,skinIndex:new T.Uint16BufferAttribute(indices,4),skinWeight:new T.Float32BufferAttribute(values,4),worstDiscarded,originY};
}
