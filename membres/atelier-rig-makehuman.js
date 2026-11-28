import * as T from 'three';

// Build on the original ordered MakeHuman base, not on a scan with an unrelated topology.
// The 163 bones and joint anchors are the upstream CC0 data, including helper vertices.
export function referenceArmature(reference,weights,{positions=reference.positions,topology='makehuman-default-19158',maxInfluences=4,originY=positions.reduce((lo,v,i)=>i%3===1?Math.min(lo,v):lo,Infinity)}={}){
 if(topology!=='makehuman-default-19158'||reference.vertexCount!==19158||positions.length!==19158*3||Object.keys(reference.rig.bones).length!==163)throw Error('Topologie MakeHuman native requise. Un scan doit être remappé avant de recevoir ces poids.');
 if(maxInfluences!==4)throw Error('Le skinning GLB de cet atelier utilise quatre influences normalisées.');
 const {bones,joints,planes}=reference.rig,scale=.1;
 if(!Number.isFinite(originY))throw Error('Origine verticale invalide');
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


// Use the upstream body faces only. Joint marker cubes and garment proxies
// remain in the source position array for anatomical anchor calculations,
// but are not part of the rendered surface or the correspondence search.
export function referenceSkin(reference,weights,surface,options={}){
 const rig=referenceArmature(reference,weights,options);
 if(surface.group!=='body'||surface.vertexCount!==reference.vertexCount||surface.sourceBlob!==reference.source.meshBlob||surface.indices.length%3||surface.indices.some(i=>!Number.isInteger(i)||i<0||i>=reference.vertexCount))throw Error('Surface anatomique incompatible');
 const src=options.positions??reference.positions,used=Array.from(new Set(surface.indices)).sort((a,b)=>a-b),map=new Map(used.map((id,i)=>[id,i]));
 const position=new Float32Array(used.length*3),joint=new Uint16Array(used.length*4),weight=new Float32Array(used.length*4);
 for(let i=0;i<used.length;i++){const id=used[i];position.set([src[id*3]*.1,(src[id*3+1]-rig.originY)*.1,src[id*3+2]*.1],i*3);for(let j=0;j<4;j++){joint[i*4+j]=rig.skinIndex.getComponent(id,j);weight[i*4+j]=rig.skinWeight.getComponent(id,j);}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(position,3));geo.setAttribute('skinIndex',new T.BufferAttribute(joint,4));geo.setAttribute('skinWeight',new T.BufferAttribute(weight,4));geo.setIndex(new T.BufferAttribute(Uint16Array.from(surface.indices,i=>map.get(i)),1));geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();
 const mesh=new T.SkinnedMesh(geo,new T.MeshStandardMaterial({color:0xd7b49e,roughness:.87}));mesh.name='Corps et cou natifs MakeHuman';mesh.frustumCulled=false;rig.root.add(mesh);rig.root.updateMatrixWorld(true);mesh.bind(rig.skeleton,mesh.matrixWorld.clone());
 return {...rig,mesh,sourceVertexIds:Uint32Array.from(used)};
}

// The cervical skin has the original mesh connectivity: no independent
// cylindrical insert. This measures a section without moving its vertices.
export function skinSection(geometry,height){
 const p=geometry.attributes.position,index=geometry.index.array,adj=new Map();
 const key=(a,b)=>a<b?a+':'+b:b+':'+a;
 const link=(a,b)=>{if(!adj.has(a))adj.set(a,[]);adj.get(a).push(b);};
 for(let i=0;i<index.length;i+=3){const hits=[];for(let k=0;k<3;k++){const a=index[i+k],b=index[i+(k+1)%3];if((p.getY(a)<height)!==(p.getY(b)<height))hits.push(key(a,b));}if(hits.length===2){link(hits[0],hits[1]);link(hits[1],hits[0]);}}
 const seen=new Set(),components=[];for(const start of adj.keys()){if(seen.has(start))continue;const queue=[start];seen.add(start);let closed=true;for(let i=0;i<queue.length;i++){const n=adj.get(queue[i]);closed&&=n.length===2;for(const x of n)if(!seen.has(x)){seen.add(x);queue.push(x);}}components.push({edges:queue.length,closed});}
 return components.sort((a,b)=>b.edges-a.edges);
}
