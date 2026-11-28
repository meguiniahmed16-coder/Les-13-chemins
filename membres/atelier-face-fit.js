import * as T from 'three';
export const FACE_KEYS=['Ouvrir','SourireG','SourireD','Decouvrir','Plisser','PlisDuRire','Cligner','Rond','Pincer','RegardG','RegardD','RegardBas','RegardHaut'];
export const BODY_FIT={f:{headSize:.94,headZ:-.024,neckWidth:.96,neckHeight:.90,neckDepth:.98},m:{headSize:1,headZ:0,neckWidth:1,neckHeight:1,neckDepth:1}};
const sat=x=>Math.max(0,Math.min(1,Number(x)||0));
const smooth=x=>{x=sat(x);return x*x*(3-2*x);};
const canonical=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const aliases={Ouvrir:['jawOpen','mouthOpen','viseme_aa','viseme_A','jaw_open'],SourireG:['mouthSmileLeft','smileLeft','smile_L'],SourireD:['mouthSmileRight','smileRight','smile_R'],Decouvrir:['mouthUpperUpLeft','mouthUpperUpRight','mouthLowerDownLeft','mouthLowerDownRight','mouthStretchLeft','mouthStretchRight'],Plisser:['eyeSquintLeft','eyeSquintRight'],PlisDuRire:['cheekSquintLeft','cheekSquintRight'],Cligner:['eyeBlinkLeft','eyeBlinkRight','blinkLeft','blinkRight','eyesClosed'],Rond:['mouthFunnel','mouthPucker','viseme_O','viseme_U'],Pincer:['mouthClose','mouthPressLeft','mouthPressRight','viseme_PP'],RegardG:['eyeLookOutLeft','eyeLookInRight'],RegardD:['eyeLookInLeft','eyeLookOutRight'],RegardBas:['eyeLookDownLeft','eyeLookDownRight'],RegardHaut:['eyeLookUpLeft','eyeLookUpRight']};
export function faceMapping(dictionary={}){
 const byName=new Map(Object.entries(dictionary).map(([name,index])=>[canonical(name),index])),map={};
 for(const key of FACE_KEYS){const exact=byName.get(canonical(key));const candidates=exact!==undefined?[exact]:(aliases[key]||[]).map(n=>byName.get(canonical(n))).filter(v=>v!==undefined);if(candidates.length)map[key]=[...new Set(candidates)];}return map;
}
export function applyMapped(mesh,map,values){const w=mesh.morphTargetInfluences;if(!w)return;const active=new Set(Object.values(map).flat());for(const i of active)w[i]=0;for(const [key,ids] of Object.entries(map))for(const i of ids)w[i]=Math.max(w[i]||0,sat(values[key]));}
const localBounds=(object,space)=>{space.updateWorldMatrix(true,false);object.updateWorldMatrix(true,true);const inverse=space.matrixWorld.clone().invert(),b=new T.Box3();object.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();b.union(o.geometry.boundingBox.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld)));});return b;};
export {localBounds};
// The body cut is fixed; the head and bridge share one corrected affine
// transform around the actual top of the neck, not around the mesh origin.
export function headCorrection(a,settings){
 const b=settings,box=a.neckRestBox,anchor=a.neckAnchor;
 const scale=new T.Vector3(b.headSize/b.width,b.headSize/b.height,b.headSize/b.depth);
 const d=new T.Vector3(b.headX,b.headY+(box.max.y-box.min.y)*(b.neckHeight-1),b.headZ);
 const rot=new T.Quaternion().setFromEuler(new T.Euler((b.headPitch||0)*Math.PI/180,0,0));
 const target=anchor.clone().add(d);
 return new T.Matrix4().makeTranslation(target.x,target.y,target.z).multiply(new T.Matrix4().compose(new T.Vector3(),rot,scale)).multiply(new T.Matrix4().makeTranslation(-anchor.x,-anchor.y,-anchor.z));
}
export function initNeckFit(a){
 a.root.updateMatrixWorld(true);a.head.updateMatrix();a.restHeadMatrix=a.head.matrix.clone();a.headRestBox=localBounds(a.head,a.head);
 a.neck.geometry.computeBoundingBox();a.neckRestBox=a.neck.geometry.boundingBox.clone();
 const b=a.neckRestBox,base=a.neckBase,top=[],p=new T.Vector3(),pos=a.body.geometry.attributes.position;
 const bodyInverse=a.body.matrixWorld.clone().invert();a.neckRestToBody=bodyInverse.multiply(a.neck.matrixWorld);
 const maxY=a.body.geometry.boundingBox?.max.y??Math.max(...Array.from({length:pos.count},(_,i)=>pos.getY(i)));
 const boundary=[];for(let i=0;i<pos.count;i++)if(pos.getY(i)>maxY-.019)boundary.push(i);
 if(!boundary.length)throw Error('Bord du corps introuvable.');
 const records=[];for(let i=0;i<base.length;i+=3){const v=new T.Vector3().fromArray(base,i);if(v.y>b.max.y-.004)top.push(v);p.copy(v).applyMatrix4(a.neckRestToBody);let nearest=-1,dist=Infinity;for(const k of boundary){const d=(p.x-pos.getX(k))**2+(p.y-pos.getY(k))**2+(p.z-pos.getZ(k))**2;if(d<dist){dist=d;nearest=k;}}records.push({source:v,body:p.clone(),nearest,t:smooth((v.y-b.min.y)/Math.max(.0001,b.max.y-b.min.y))});}
 a.neckRecords=records;a.neckAnchor=top.length?top.reduce((v,w)=>v.add(w),new T.Vector3()).multiplyScalar(1/top.length):b.getCenter(new T.Vector3());a.neckAnchor.y=b.max.y;a.neckDelta=new T.Matrix4();
}
export function fitHead(a,b){
 a.neckDelta.copy(headCorrection(a,b));const m=a.neckDelta.clone().multiply(a.restHeadMatrix);m.decompose(a.head.position,a.head.quaternion,a.head.scale);a.head.updateMatrix();
}
export function deformNeck(a,b){
 const geo=a.neck.geometry,position=geo.attributes.position;const fromBody=a.neck.matrixWorld.clone().invert().multiply(a.body.matrixWorld);
 const rest=a.body.geometry.attributes.position,cache=new Map(),lo=new T.Vector3(),hi=new T.Vector3(),v=new T.Vector3(),diff=new T.Vector3(),pv=new T.Vector3(),base=new T.Vector3(),center=a.neckRestBox.getCenter(new T.Vector3());
 for(let i=0;i<a.neckRecords.length;i++){const r=a.neckRecords[i];if(!cache.has(r.nearest)){a.body.getVertexPosition(r.nearest,pv);base.fromBufferAttribute(rest,r.nearest);cache.set(r.nearest,pv.clone().sub(base));}diff.copy(cache.get(r.nearest));lo.copy(r.body).add(diff).applyMatrix4(fromBody);hi.copy(r.source).applyMatrix4(a.neckDelta);v.lerpVectors(lo,hi,r.t);
  const envelope=Math.sin(Math.PI*r.t);v.x+=(r.source.x-center.x)*(b.neckWidth-1)*envelope;v.z+=(r.source.z-center.z)*((b.neckDepth??1)-1)*envelope;position.setXYZ(i,v.x,v.y,v.z);
 }
 position.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();
}
// Align an incoming face in the source head's coordinate system. User
// adjustments remain independent of this initial scale/position.
export function alignImportedHead(a,source,inside){
 const b=localBounds(source,inside),ref=a.headRestBox,src=b.getCenter(new T.Vector3()),dst=ref.getCenter(new T.Vector3()),h=b.getSize(new T.Vector3()).y;
 if(!Number.isFinite(h)||h<1e-6)throw Error('Le GLB ne contient pas de tête mesurable.');
 const scale=ref.getSize(new T.Vector3()).y/h;inside.scale.setScalar(scale);inside.position.copy(dst).addScaledVector(src,-scale);inside.updateMatrix();
}
const visemes={repos:{},A:{Ouvrir:1},IE:{Ouvrir:.28,SourireG:.62,SourireD:.62,Decouvrir:.42},O:{Ouvrir:.65,Rond:.78},OU:{Ouvrir:.26,Rond:1},MBP:{Pincer:.85},FV:{Ouvrir:.16,Decouvrir:.65,Pincer:.15},L:{Ouvrir:.24,Decouvrir:.18},K:{Ouvrir:.42},CH:{Ouvrir:.24,Rond:.55}};
export function speechFrame(data,time,settings,level=0){
 const t=time+(settings.offset||0),out=Object.fromEntries(FACE_KEYS.map(k=>[k,0]));let total=0;
 for(const c of data?.visemes||[]){if(t<c.debut-.035||t>c.fin+.035)continue;const weight=smooth((t-c.debut+.035)/.07)*smooth((c.fin+.035-t)/.07);total+=weight;for(const [k,v] of Object.entries(visemes[c.forme]||{}))out[k]+=weight*v;}
 for(const k of FACE_KEYS)out[k]/=Math.max(1,total);
 for(const laugh of data?.rires||[]){if(t<laugh.debut||t>laugh.fin)continue;const n=sat(laugh.enveloppe[Math.min(laugh.enveloppe.length-1,Math.max(0,Math.round((t-laugh.debut)/laugh.pas)))]);out.Ouvrir=n*(laugh.style==='eclat'?1.25:.65);out.SourireG=out.SourireD=.40+n*.32;out.Decouvrir=.25+n*.3;out.Plisser=n*.32;out.PlisDuRire=n*.35;}
 if(!data){out.Ouvrir=level;out.Decouvrir=level*.23;}
 out.Ouvrir=sat(out.Ouvrir*settings.jaw);out.SourireG=sat(out.SourireG*settings.wide);out.SourireD=sat(out.SourireD*settings.wide);out.Decouvrir=sat(out.Decouvrir*settings.wide);out.Rond=sat(out.Rond*(settings.round??.55));out.Pincer=sat(out.Pincer*(settings.close??.65));return out;
}
// Transfer missing face shape keys from the calibrated reference to a head
// in the same local coordinate system. A rigid, unsegmented mouth can only
// receive an approximation: no invented inner mouth, teeth or eyelid topology.
// The input mesh is untouched until the user requests this operation.
export async function transferFaceMorphs(a,headImport){
 if(!headImport)throw Error('Importe et aligne d’abord une tête GLB.');
 const head=a.head;head.updateWorldMatrix(true,true);headImport.updateWorldMatrix(true,true);const inv=head.matrixWorld.clone().invert();
 const grid=new Map(),step=.025;const key=(x,y,z)=>x+','+y+','+z;const q=new T.Vector3(),d=new T.Vector3(),zero=new T.Vector3();
 let sources=0;
 head.traverse(mesh=>{if(!mesh.isMesh||!/Visage.source|L.vres.et.commissures|Paupi.res/i.test(mesh.name))return;const geo=mesh.geometry,p=geo.attributes.position,dict=mesh.morphTargetDictionary||{},morph=geo.morphAttributes.position||[],transform=inv.clone().multiply(mesh.matrixWorld),linear=new T.Matrix3().setFromMatrix4(transform),stride=Math.max(1,Math.ceil(p.count/60000));const mapped=faceMapping(dict);
 for(let i=0;i<p.count;i+=stride){q.fromBufferAttribute(p,i).applyMatrix4(transform);const k=key(Math.floor(q.x/step),Math.floor(q.y/step),Math.floor(q.z/step));let bucket=grid.get(k);if(!bucket)grid.set(k,bucket=[]);if(bucket.length>=9)continue;const values={};for(const [name,indices] of Object.entries(mapped)){const ma=morph[indices[0]];if(!ma)continue;d.fromBufferAttribute(ma,i);if(!geo.morphTargetsRelative)d.sub(new T.Vector3().fromBufferAttribute(p,i));d.applyMatrix3(linear);if(d.lengthSq()>1e-14)values[name]=d.toArray();}bucket.push({p:q.toArray(),values});sources++;}});
 if(!sources)throw Error('Les formes du visage de référence sont introuvables.');
 const incoming=[];headImport.traverse(o=>{if(o.isMesh)incoming.push(o);});const total=incoming.reduce((n,o)=>n+o.geometry.attributes.position.count,0);
 const missing=incoming.reduce((n,o)=>n+FACE_KEYS.filter(k=>!faceMapping(o.morphTargetDictionary)[k]&& !/^Regard/.test(k)).length*o.geometry.attributes.position.count*12,0);
 if(missing>105*1024*1024)throw Error('Ce GLB est trop dense pour générer toutes les formes sur téléphone. Utilise un visage allégé (environ 250 000 sommets ou moins). Les formes déjà présentes restent utilisables.');
 let count=0,animated=0,meshes=0;const report={existing:new Set(),generated:new Set(),vertices:total,matched:0};
 for(const mesh of incoming){const existing=faceMapping(mesh.morphTargetDictionary);for(const k of Object.keys(existing))report.existing.add(k);if(/hair|cheveux|brow|lash|dents|teeth|tongue|langue|iris|eye|globe|gencive/i.test(mesh.name))continue;
  const keys=FACE_KEYS.filter(k=>!existing[k]&&!/^Regard/.test(k));if(!keys.length)continue;
  const geo=mesh.geometry=mesh.geometry.clone(),pos=geo.attributes.position,n=pos.count,transform=inv.clone().multiply(mesh.matrixWorld),localDelta=new T.Matrix3().setFromMatrix4(transform).invert(),data=Object.fromEntries(keys.map(k=>[k,new Float32Array(n*3)]));const target=new T.Vector3(),temp=new T.Vector3();let meshMatched=0;
  for(let i=0;i<n;i++){target.fromBufferAttribute(pos,i).applyMatrix4(transform);const gx=Math.floor(target.x/step),gy=Math.floor(target.y/step),gz=Math.floor(target.z/step);const near=[];for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)for(const s of grid.get(key(gx+x,gy+y,gz+z))||[]){const ds=(s.p[0]-target.x)**2+(s.p[1]-target.y)**2+(s.p[2]-target.z)**2;if(ds<.065**2){near.push([ds,s]);}}if(!near.length)continue;near.sort((a,b)=>a[0]-b[0]);near.length=Math.min(4,near.length);let sum=0;const ws=near.map(([d])=>1/(d+.000035));sum=ws.reduce((a,b)=>a+b,0);const attenuation=1-smooth((Math.sqrt(near[0][0])-.025)/.04);let changed=false;for(const k of keys){temp.copy(zero);for(let j=0;j<near.length;j++){const delta=near[j][1].values[k];if(delta){d.fromArray(delta);temp.addScaledVector(d,ws[j]/sum);}}temp.applyMatrix3(localDelta).multiplyScalar(attenuation);if(temp.lengthSq()>1e-14){temp.toArray(data[k],i*3);changed=true;}}if(changed)meshMatched++;if(i%18000===0&&i)await new Promise(resolve=>setTimeout(resolve,0));}
  const positions=geo.morphAttributes.position||[],previousNames=Object.entries(mesh.morphTargetDictionary||{}).sort((a,b)=>a[1]-b[1]).map(e=>e[0]),existingWeights=mesh.morphTargetInfluences?.slice()||[];
  if(!geo.morphTargetsRelative&&positions.length)for(const attr of positions)for(let i=0;i<attr.count;i++){attr.setXYZ(i,attr.getX(i)-pos.getX(i),attr.getY(i)-pos.getY(i),attr.getZ(i)-pos.getZ(i));}geo.morphTargetsRelative=true;
  const names=[...previousNames];for(const k of keys){if(!data[k].some(v=>Math.abs(v)>1e-7))continue;const attr=new T.BufferAttribute(data[k],3);attr.name=k;positions.push(attr);names.push(k);report.generated.add(k);count++;}
  if(positions.length){geo.morphAttributes.position=positions;if(geo.morphAttributes.normal){while(geo.morphAttributes.normal.length<positions.length)geo.morphAttributes.normal.push(new T.BufferAttribute(new Float32Array(n*3),3));}mesh.updateMorphTargets();names.forEach((name,i)=>{mesh.morphTargetDictionary[name]=i;if(existingWeights[i]!==undefined)mesh.morphTargetInfluences[i]=existingWeights[i];});}report.matched+=meshMatched;meshes++;
 }
 return {existing:[...report.existing],generated:[...report.generated],vertices:report.vertices,matched:report.matched,targets:count,meshes};
}
