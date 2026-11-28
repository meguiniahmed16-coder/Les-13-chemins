// V22: adapt the two authored kimono models to the existing cinematic driver.
import * as T from 'three';

export const V22_ASSETS=Object.freeze({
 m:{model:'ahmed',gzipBytes:33045109,gzipSHA:'6e3b8896f4531127b5a49bca6e64af56df97c3c9cf18b9898b10c76257076a43',glbBytes:71501212,glbSHA:'048c22f90b920fdede8a66f5ee2ed5ff162f2157b41d3c4e58e7779e622f6d4e'},
 f:{model:'marianne',gzipBytes:35943147,gzipSHA:'9e388e29f4f6fbb05fa4e262ad40936fbf4d60a0a27980775a85fbaa09facc11',glbBytes:75909292,glbSHA:'a7b46ad8ae0e84278bb4b83b3ad13f7410dd69c44980f9b2406c9fe32402a1db'}
});
export const JOINT_ORDER=['bassin','tete','brasd','avantbrasd','maind','brasg','avantbrasg','maing','cuissed','jambed','piedd','cuisseg','jambeg','piedg','thorax'];
const normalized=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'').replace(/^v27/,'');
const clamp=x=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
export function speechWeights(jaw,wide,blink){
 jaw=clamp(jaw);wide=clamp(wide);blink=clamp(blink);
 return {Ouvrir:jaw,Decouvrir:wide*.18,SourireG:wide*.07,SourireD:wide*.07,Rond:jaw*.18,Cligner:blink};
}
export function garmentWeights(sit,g={}){
 sit=clamp(sit);const walk=clamp(g.gait?.strength||0)*(1-sit);
 const gesture=clamp(Math.max(g.poseGesture?.left||0,g.poseGesture?.right||0)/.54)*(1-sit)*(1-walk);
 const invite=g.kind==='invite'?gesture:0,explain=gesture-invite;
 return {Correction_rest:1-sit-walk-invite-explain,Correction_invite:invite,Correction_explain:explain,Correction_sofa:sit,Correction_walk:walk};
}
function morph(mesh,values){const d=mesh.morphTargetDictionary,w=mesh.morphTargetInfluences;if(!d||!w)return;for(const [n,v] of Object.entries(values))if(d[n]!==undefined)w[d[n]]=v;}
const digest=async buffer=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),b=>b.toString(16).padStart(2,'0')).join('');
export async function decodeV22(loader,packed,config){
 if(packed.byteLength!==config.gzipBytes||await digest(packed)!==config.gzipSHA)throw Error('Archive V22 incomplète ou altérée.');
 const stream=new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'));
 const raw=await new Response(stream).arrayBuffer();
 if(raw.byteLength!==config.glbBytes||await digest(raw)!==config.glbSHA)throw Error('GLB V22 incomplet ou altéré.');
 return loader.parseAsync(raw,'');
}
// No new timeline, no camera controller and no manual expression UI. The original
// actor is the source of motion (including the authored sitting/footwork poses).
export function makeV22Overlay(actor,asset,referenceRest){
 const body=asset.scene,baseBody=actor.body,baseWardrobe=actor.wardrobe;
 if(referenceRest?.length!==240||baseWardrobe?.matrices?.length!==240)throw Error('Matrices V27 indisponibles.');
 let rig=null,garment=null;const speechMeshes=[],hands=[];
 body.traverse(o=>{
  if(!o.isMesh)return;
  o.castShadow=true;o.receiveShadow=false;o.frustumCulled=false;
  if(o.isSkinnedMesh&&o.skeleton?.bones.length===15){
   if(!rig)rig=o.skeleton;
   if(o.skeleton.bones.some((b,i)=>b!==rig.bones[i]))throw Error('Squelettes V22 incohérents.');
  }
  if(o.morphTargetDictionary?.Ouvrir!==undefined||o.morphTargetDictionary?.Cligner!==undefined)speechMeshes.push(o);
  if(o.morphTargetDictionary?.Correction_rest!==undefined)garment=o;
  if(o.morphTargetDictionary?.Flexion_Index_D!==undefined)hands.push(o);
 });
 if(!rig||!garment||!speechMeshes.length)throw Error('Armature, kimono ou articulation faciale V22 manquants.');
 const bones=rig.bones;if(!bones.every((b,i)=>normalized(b.name)===JOINT_ORDER[i]&&b.parent===bones[0].parent))throw Error('Ordre des quinze os V22 incompatible.');
 const inv=Array.from({length:15},(_,i)=>new T.Matrix4().fromArray(referenceRest,i*16).invert());
 const bind=bones.map(b=>new T.Matrix4().compose(b.position,b.quaternion,b.scale));
 const matrix=new T.Matrix4();let previous=null,lastGesture={};
 body.name='Cinématique · '+(actor.id==='m'?'Ahmed':'Marianne')+' V22';
 body.visible=false;
 // Attach alongside (not inside) the existing wardrobe so visibility switches
 // do not affect the camera, the original seat solver or the cast examples.
 actor.root.add(body);
 function sync(current,g){
  if(g)lastGesture=g;
  const active=current.body===baseBody&&current.wardrobe===baseWardrobe;
  body.visible=active;
  // Existing costume demonstrations continue to use their own fitted avatars.
  // Never force visibility of an inactive wardrobe group.
  if(active)baseBody.visible=false;else if(current.body===baseBody)baseBody.visible=true;
  if(!active)return;
  const mats=baseWardrobe.matrices;
  if(mats!==previous){
   previous=mats;
   for(let i=0;i<15;i++){
    matrix.fromArray(mats,i*16).multiply(inv[i]).multiply(bind[i]);
    matrix.decompose(bones[i].position,bones[i].quaternion,bones[i].scale);
   }
  }
  morph(garment,garmentWeights(current.sit,lastGesture));
  // Keep the neutral hand shape: the authored wrist, elbow and arm motions
  // already come from the same original driver. No user-operated finger controls.
  for(const h of hands)for(const [n,k] of Object.entries(h.morphTargetDictionary))if(n.startsWith('Flexion_'))h.morphTargetInfluences[k]=0;
  body.updateMatrixWorld(true);
 }
 function speak(jaw,wide,blink){
  for(const o of speechMeshes)morph(o,speechWeights(jaw,wide,blink));
 }
 function dispose(){body.removeFromParent();baseBody.visible=true;body.traverse(o=>{if(o.isMesh){o.geometry?.dispose();for(const mat of Array.isArray(o.material)?o.material:[o.material]){for(const value of Object.values(mat||{}))if(value?.isTexture)value.dispose();mat?.dispose();}}});}
 return {sync,speak,dispose,body};
}
// A pair is activated atomically. A partial/corrupt upload must not produce a
// mixed cast or break the current introduction. The asset gate stays disabled
// until both models have been uploaded and verified in the hosting service.
export async function prepareV22Pair({people,loader,assetURL,fetcher=fetch,onProgress=()=>{}}){
 const manifestResponse=await fetcher(assetURL('manifest'),{cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!manifestResponse.ok)return null;
 const manifest=await manifestResponse.json();
 if(manifest.release!=='V22'||manifest.ready!==true)return null;
 const posesResponse=await fetcher('/membres/v27/poses.json',{credentials:'same-origin'});
 if(!posesResponse.ok)throw Error('Poses de référence V27 indisponibles.');
 const poses=await posesResponse.json(),overlays=[];
 try{
  for(const actor of people){
   const config=V22_ASSETS[actor.id];
   if(!config)throw Error('Personnage V22 inconnu.');
   const packed=new Uint8Array(config.gzipBytes);
   const count=Math.ceil(config.gzipBytes/4194304);let offset=0;
   for(let part=0;part<count;part++){
    const size=Math.min(4194304,config.gzipBytes-part*4194304);
    const pieces=Math.ceil(size/2097150);
    for(let piece=0;piece<pieces;piece++){
     const expected=Math.min(2097150,size-piece*2097150);
     const key=config.model+'/'+String(part).padStart(3,'0')+'/'+piece;
     const response=await fetcher(assetURL(key),{credentials:'same-origin',signal:AbortSignal.timeout(95000)});
     if(!response.ok)throw Error('Fragment V22 non disponible : '+key);
     const bytes=new Uint8Array(await response.arrayBuffer());
     if(bytes.byteLength!==expected)throw Error('Fragment V22 incomplet : '+key);
     packed.set(bytes,offset);offset+=bytes.length;onProgress(config.model,.85*offset/config.gzipBytes);
    }
   }
   if(offset!==packed.length)throw Error('Modèle V22 incomplet.');
   const asset=await decodeV22(loader,packed.buffer,config);
   overlays.push([actor,makeV22Overlay(actor,asset,poses[actor.id].rest)]);
   onProgress(config.model,1);
  }
  if(overlays.length!==2)throw Error('Duo V22 incomplet.');
  for(const [actor,overlay] of overlays){actor.v22=overlay;overlay.sync(actor);}
  return overlays;
 }catch(error){for(const [actor,overlay] of overlays){overlay.dispose();delete actor.v22;}throw error;}
}
