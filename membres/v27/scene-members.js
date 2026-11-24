import {perform} from './reference-performance.js';
import {defaultMotion,wardrobeMotion} from './live-body.js';
import {attachFemaleHead,loadFemaleReference} from './female-reference.js';
import {attachCinemaAhmed} from './cinema-ahmed.js';
// Clothes and invited characters use the local V27 skeleton sampled in the original salon.
// The two original dressed figures stay in memory so returning to the duo is instantaneous.
export function createMemberBridge(scene){
  const {T,player,partner,actors}=scene;
  const originalIds=new Map(Object.values(actors).map(a=>[a,a.id]));
  const originals=new Map(Object.values(actors).map(actor=>[actor,actor.parts]));
  let template,poses;const originalMotion=new Map();
  function clearFace(actor){actor.referenceFace?.detach();actor.referenceFace=null;}
  function face(actor,look){
    if(actor.id!=='f'||!template||!actor.parts.length)return;
    actor.referenceFace=attachFemaleHead(actor,template,look);actor.referenceFace.follow(true);
  }
  function getPoses(){
    return poses??=fetch('/membres/v27/poses.json?pose=canape2').then(async response=>{
      if(!response.ok)throw Error('Les mouvements du salon sont indisponibles.');
      return response.json();
    }).catch(error=>{poses=null;throw error;});
  }
  function restore(actor){
    clearFace(actor);actor.salonLook=null;actor.motion?.release();actor.live=false;actor.motion=originalMotion.get(actor);actor.conversationPose=null;actor.stamp='';
    if(actor.parts===originals.get(actor)){actor.cinemaAhmed?.restore();return;}
    for(const part of actor.parts){
      part.obj.removeFromParent();part.obj.geometry.dispose();
      part.obj.material.map.dispose();part.obj.material.dispose();
    }
    actor.parts=originals.get(actor);
    for(const part of actor.parts)part.obj.visible=true;
    actor.cinemaAhmed?.restore();
    actor.stamp='';
    scene.animateBody(actor,0,null);
  }
  function meshPart(m,bases,parent){
    const g=new T.BufferGeometry();
    const base=Float32Array.from(bases.p,v=>v/10000);
    g.setAttribute('position',new T.BufferAttribute(base.slice(),3).setUsage(T.DynamicDrawUsage));
    g.setAttribute('normal',new T.BufferAttribute(new Int8Array(bases.n),3,true));
    g.setAttribute('uv',new T.BufferAttribute(new Uint16Array(m.uv),2,true));g.setIndex(new T.BufferAttribute(new Uint16Array(m.faces),1));
    const texture=new T.DataTexture(new Uint8Array(m.image.data),m.image.width,m.image.height);
    texture.colorSpace=T.SRGBColorSpace;texture.flipY=false;texture.generateMipmaps=true;
    texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;texture.needsUpdate=true;
    const material=new T.MeshStandardMaterial({map:texture,color:new T.Color(...m.multiplier),roughness:.89,alphaTest:.23,side:T.DoubleSide});
    const obj=new T.Mesh(g,material);obj.castShadow=true;obj.frustumCulled=false;parent.add(obj);
    return {obj,base,name:m.name||'',fullIndex:m.name==='body'?new T.BufferAttribute(m.allFaces,1):null,poses:[],seated:{}};
  }
  async function dress(actor,figure,gender,valid){
    if(actor.cinemaAhmed?.supports(figure.appearance,gender)){
      if(!valid())return false;
      clearFace(actor);
      const changed=await actor.cinemaAhmed.dress(figure,valid);
      if(changed){actor.live=false;actor.stamp='';scene.animateBody(actor,0,actor.motionSeat);}
      return changed;
    }
    const [poses,source]=await Promise.all([getPoses(),gender==='femme'?loadFemaleReference():null]);
    if(source)template=source;
    const rig=poses[gender==='femme'?'f':'m'];
    if(!valid())return false;
    figure.pose(rig.rest);
    const bases=figure.meshes.map(m=>({p:m.v.slice(),n:m.vn.slice()}));
    const group=new T.Group(),parts=figure.meshes.map((m,i)=>meshPart(m,bases[i],group));
    // Seated poses are solved live. Only the eight walking frames use baked deltas.
    for(let key=0;key<8;key++){
      figure.pose(rig[key]);
      for(const [i,m] of figure.meshes.entries()){
        const delta=Int16Array.from(m.v,(v,k)=>v-bases[i].p[k]);
        const frame={delta,unit:.0001};
        parts[i].poses[key]=frame;
      }
    }
    restore(actor);
    actor.cinemaAhmed?.hide();
    for(const part of originals.get(actor))part.obj.visible=false;
    for(const part of parts)actor.body.add(part.obj);
    actor.parts=parts;actor.motion=wardrobeMotion(figure,parts);actor.stamp='';
    actor.id=gender==='femme'?'f':'m';actor.root.scale.setScalar(gender==='femme'?1.04:1.075);
    scene.animateBody(actor,0,actor.motionSeat);face(actor,figure.appearance);actor.salonLook=figure.appearance;
    return true;
  }
  let speech=null,readSpeech=null;
  function addVisemes(actor,part){
    if(!speech||part.voiceReady||!speech.channels[part.name+'jaw']&&!speech.channels[part.name+'blink'])return;
    const geo=part.obj.geometry,count=geo.attributes.position.count;
    const targets=Array.from({length:4},()=>new Float32Array(count*3));
    let remap;
    if(originals.get(actor)===actor.parts){
      const runs=speech.indices[originalIds.get(actor)][part.name];
      if(!runs)return;
      remap=new Map();let i=0;
      for(const [start,length] of runs)for(let n=0;n<length;n++)remap.set(start+n,i++);
    }
    for(const [j,suffix] of ['jaw','blink'].entries()){
      const channel=speech.channels[part.name+suffix]||[];
      for(let i=0;i<channel.length;i+=4){
        const id=channel[i]&65535,k=remap?remap.get(id):id;if(k===undefined||k>=count)continue;
        for(let c=0;c<3;c++)targets[j][3*k+c]=channel[i+1+c]/10000;
        // Both lip shapes use the displacement of the jaw to identify the mouth.
        if(j===0&&part.name==='body'){
          const x=part.base[3*k],mask=Math.min(1,Math.abs(channel[i+2])/120)*Math.max(0,1-Math.abs(x)/.040);
          targets[2][3*k]=-x*.15*mask;targets[2][3*k+2]=.005*mask;targets[3][3*k]=x*.12*mask;
        }
      }
    }
    geo.morphTargetsRelative=true;geo.morphAttributes.position=targets.map(a=>new T.BufferAttribute(a,3));
    part.obj.updateMorphTargets();part.obj.material.needsUpdate=true;part.voiceReady=true;
  }
  function speechFrame(){
    for(const a of Object.values(actors))a.referenceFace?.follow();
    for(const a of Object.values(actors))if(a.cinemaAhmed?.active)a.cinemaAhmed.talk();
    if(!readSpeech)return;
    const poses=readSpeech();if(!poses)return;
    for(const [slot,a] of [['member',player()],['guest',partner()]]){
      const p=poses[slot];a.conversationPose=p?.gesture?p:null;
      if(a.cinemaAhmed?.active){a.cinemaAhmed.talk(p);continue;}
      if(a.referenceFace){perform(a.referenceFace,p);continue;}
      for(const part of a.parts){
        addVisemes(a,part);
        if(part.voiceReady){const mix=part.obj.morphTargetInfluences;mix[0]=p.jaw;mix[1]=p.blink;mix[2]=p.round;mix[3]=p.spread;}
      }
    }
  }
  function reset(slot){
    const a=actors[slot]||(slot==='guest'?partner():player());restore(a);
    a.id=originalIds.get(a);a.root.scale.setScalar(a.id==='f'?1.04:1.075);face(a);
  }
  return {
    async initialize(){if(!Object.values(actors).some(a=>a.id==='f'&&a.parts.length))return;
      const [reference,rig,bytes]=await Promise.all([loadFemaleReference(),getPoses(),fetch('/membres/v27/attaches-v27.bin?v=appui2').then(r=>{if(!r.ok)throw Error('Attaches du duo indisponibles.');return r.arrayBuffer();})]);
      template=reference;const weights=scene.unzip(new Uint8Array(bytes));
      for(const a of Object.values(actors)){if(!a.parts.length)continue;const motion=defaultMotion(a,weights,rig[a.id].rest);originalMotion.set(a,motion);a.motion=motion;face(a);}
      if(scene.cinemaArrival){
        const original=await attachCinemaAhmed(actors.m);
        originals.set(actors.m,original.parts);originalMotion.set(actors.m,original.motion);
      }},
    async enableDialogue(channels,read,valid=()=>true){
      const res=await fetch('/membres/v27/visage-indices.json');if(!res.ok)throw Error('Le visage du salon est indisponible.');
      const indices=await res.json();if(valid()){speech={channels,indices};readSpeech=read;}
    },
    endDialogue(){readSpeech=null;for(const a of Object.values(actors))a.conversationPose=null;for(const a of Object.values(actors))if(a.referenceFace&&!a.referenceFace.demo)a.referenceFace.reset();for(const a of Object.values(actors))for(const part of a.parts)if(part.voiceReady)part.obj.morphTargetInfluences.fill(0);},
    speechFrame,
    originalLook(slot){const look=actors[slot]?.cinemaAhmed?.look;return look?{...look,face:{...look.face},outfit:{...look.outfit}}:null;},
    setGender:gender=>scene.setRole(gender==='femme'?'f':'m'),
    dress:(slot,figure,gender,valid)=>dress(actors[slot]||(slot==='guest'?partner():player()),figure,gender,valid),
    wearing:(key,look)=>actors[key]?.salonLook===look,reset,focus:scene.focus,meet:scene.meet,clearMeeting:scene.clearMeeting,camera:scene.camera,
    snapshot:scene.snapshot,
    departure(){if(scene.place==='salon'){scene.clearCamera();scene.resetView();document.getElementById('pin').focus({preventScroll:true});}},
    get settled(){return scene.settled;},get place(){return scene.place;}
  };
}
