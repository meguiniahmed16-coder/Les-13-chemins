import * as T from 'three';

// The ordinary V27 head speaks with GPU morphs. Transfer those same four
// displacements through the beard's surface binding, so its roots follow the
// lower lip and jaw while the existing skeleton still handles locomotion.
export function addBoundVisemes(part,body){
 const binding=part.source?.binding,targets=body?.obj.geometry.morphAttributes.position;
 if(!binding||!targets?.length||!body.voiceReady)return false;
 const geo=part.obj.geometry,count=geo.attributes.position.count;
 geo.morphTargetsRelative=true;
 geo.morphAttributes.position=targets.map(target=>{
  const positions=new Float32Array(count*3);
  for(let i=0;i<count;i++){
   const k=i*8,a=binding[k],b=binding[k+1],c=binding[k+2],u=binding[k+3]/65535,v=binding[k+4]/65535,w=1-u-v;
   positions[i*3]=u*target.getX(a)+v*target.getX(b)+w*target.getX(c);
   positions[i*3+1]=u*target.getY(a)+v*target.getY(b)+w*target.getY(c);
   positions[i*3+2]=u*target.getZ(a)+v*target.getZ(b)+w*target.getZ(c);
  }
  return new T.BufferAttribute(positions,3);
 });
 part.obj.updateMorphTargets();part.obj.material.needsUpdate=true;part.voiceReady=true;return true;
}

// Fit the asset's original body attachment to the actual reference head, then
// retain a triangle attachment on that head. A beard follows its mouth morphs;
// neither the reference face nor its neck is replaced to change a hairstyle.
function nearestSurface(geometry,matrix){
 const p=geometry.attributes.position,index=geometry.index,positions=Array.from({length:p.count},(_,i)=>new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(matrix));
 const triangles=[];
 for(let i=0;i<index.count;i+=3){
  const ids=[index.getX(i),index.getX(i+1),index.getX(i+2)],box=new T.Box3().setFromPoints(ids.map(id=>positions[id]));
  triangles.push({ids,box,center:box.getCenter(new T.Vector3())});
 }
 function tree(items){
  const box=new T.Box3();for(const item of items)box.union(item.box);
  if(items.length<=12)return {box,items};
  const size=box.getSize(new T.Vector3()),axis=size.x>=size.y&&size.x>=size.z?'x':size.y>=size.z?'y':'z';
  items.sort((a,b)=>a.center[axis]-b.center[axis]);const middle=items.length>>1;
  return {box,left:tree(items.slice(0,middle)),right:tree(items.slice(middle))};
 }
 const root=tree(triangles),triangle=new T.Triangle(),nearest=new T.Vector3(),bary=new T.Vector3();
 const project=point=>{
  let distance=Infinity,result;
  function visit(node){
   if(node.box.distanceToPoint(point)**2>distance)return;
   if(!node.items){
    const first=node.left.box.distanceToPoint(point)<node.right.box.distanceToPoint(point)?node.left:node.right;
    visit(first);visit(first===node.left?node.right:node.left);return;
   }
   for(const item of node.items){
    triangle.set(...item.ids.map(id=>positions[id]));triangle.closestPointToPoint(point,nearest);
    const d=nearest.distanceToSquared(point);
    if(d<distance&&triangle.getBarycoord(nearest,bary)){distance=d;result={ids:item.ids,weights:bary.toArray()};}
   }
  }
  visit(root);if(!result)throw Error('Le raccord des cheveux au visage est indisponible.');return result;
 };
 project.lowerY=root.box.min.y;return project;
}

export function attachReferenceGrooms({parts,body,skin,parent=skin?.parent,visible=true}){
 const selected=parts.filter(part=>part.source?.groom);
 if(!selected.length)return null;
 if(!body?.obj?.geometry||!skin?.geometry?.index||!parent)throw Error('Le visage de référence est indisponible pour cette coiffure.');
 parent.updateWorldMatrix(true,false);skin.updateWorldMatrix(true,false);body.obj.updateWorldMatrix(true,false);
 const inverse=parent.matrixWorld.clone().invert(),bodyMatrix=inverse.clone().multiply(body.obj.matrixWorld),skinMatrix=inverse.clone().multiply(skin.matrixWorld);
 const project=nearestSurface(skin.geometry,skinMatrix),anchors=new Map(),p=body.obj.geometry.attributes.position;
 const group=new T.Group();group.name='MakeHuman · coiffure et barbe';group.visible=visible;parent.add(group);
 const fitted=[];
 function anchor(id){
  if(!anchors.has(id)){
   const source=new T.Vector3().fromBufferAttribute(p,id).applyMatrix4(bodyMatrix);
   // Long braids also bind to the shoulders. Do not project those anchors up
   // onto the neck's lower boundary, which would fold their ends into a knot.
   const hairWeight=T.MathUtils.smoothstep(source.y,project.lowerY+.015,project.lowerY+.075);
   anchors.set(id,{...project(source),source,hairWeight,position:new T.Vector3()});
  }
  return anchors.get(id);
 }
 try{
  for(const part of selected){
   const raw=part.source,source=part.obj.geometry.attributes.position,binding=raw.binding;
   part.obj.updateWorldMatrix(true,false);const sourceMatrix=inverse.clone().multiply(part.obj.matrixWorld);
   const vertices=[];
   for(let i=0;i<source.count;i++){
    const k=i*8,a=anchor(binding[k]),b=anchor(binding[k+1]),c=anchor(binding[k+2]),weights=[binding[k+3]/65535,binding[k+4]/65535,1-(binding[k+3]+binding[k+4])/65535];
    const point=a.source.clone().multiplyScalar(weights[0]).addScaledVector(b.source,weights[1]).addScaledVector(c.source,weights[2]);
    const offset=new T.Vector3().fromBufferAttribute(source,i).applyMatrix4(sourceMatrix).sub(point);
    vertices.push({anchors:[a,b,c],weights,offset});
   }
   const geometry=part.obj.geometry.clone();geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(source.count*3),3).setUsage(T.DynamicDrawUsage));
   geometry.setAttribute('normal',new T.BufferAttribute(new Float32Array(source.count*3),3).setUsage(T.DynamicDrawUsage));
   const material=part.obj.material.clone(),mesh=new T.Mesh(geometry,material);mesh.name=raw.name;mesh.frustumCulled=false;mesh.castShadow=true;group.add(mesh);
   fitted.push({part,vertices,mesh,previous:part.obj.visible,kind:raw.groomKind});
   part.obj.visible=false;
  }
  let last='';
  function update(force=false){
   const stamp=(skin.morphTargetInfluences||[]).join(',');if(!force&&stamp===last)return;last=stamp;
   const cache=new Map();
   const read=id=>{
    if(!cache.has(id))cache.set(id,skin.getVertexPosition(id,new T.Vector3()).applyMatrix4(skinMatrix));return cache.get(id);
   };
   for(const item of anchors.values()){
    item.position.set(0,0,0);
    for(let i=0;i<3;i++){
     item.position.addScaledVector(read(item.ids[i]),item.weights[i]);
    }
   }
   for(const item of fitted){
    if(!force&&item.kind==='hair')continue;
    const out=item.mesh.geometry.attributes.position,point=new T.Vector3(),anchorPoint=new T.Vector3();
    for(let i=0;i<item.vertices.length;i++){
     const {anchors,weights,offset}=item.vertices[i];point.copy(offset);
     for(let j=0;j<3;j++){
      const a=anchors[j];anchorPoint.copy(a.source).lerp(a.position,item.kind==='hair'?a.hairWeight:1);point.addScaledVector(anchorPoint,weights[j]);
     }
     out.setXYZ(i,point.x,point.y,point.z);
    }
    out.needsUpdate=true;item.mesh.geometry.computeVertexNormals();
   }
  }
  update(true);
  return {group,update,activate(){group.visible=true;for(const item of fitted)item.part.obj.visible=false;},
   dispose(){for(const item of fitted){item.part.obj.visible=item.previous;item.mesh.geometry.dispose();item.mesh.material.dispose();}group.removeFromParent();}};
 }catch(error){
  for(const item of fitted){item.part.obj.visible=item.previous;item.mesh.geometry.dispose();item.mesh.material.dispose();}group.removeFromParent();throw error;
 }
}
