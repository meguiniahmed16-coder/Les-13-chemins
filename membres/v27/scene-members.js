// Clothes and invited characters use the local V27 skeleton sampled in the original salon.
// The two original dressed figures stay in memory so returning to the duo is instantaneous.
export function createMemberBridge(scene){
  const {T,player,partner,actors}=scene;
  const originalIds=new Map(Object.values(actors).map(a=>[a,a.id]));
  const originals=new Map(Object.values(actors).map(actor=>[actor,actor.parts]));
  let poses;
  function getPoses(){
    return poses??=fetch('/membres/v27/poses.json?pose=canape2').then(async response=>{
      if(!response.ok)throw Error('Les mouvements du salon sont indisponibles.');
      return response.json();
    }).catch(error=>{poses=null;throw error;});
  }
  function restore(actor){
    if(actor.parts===originals.get(actor))return;
    for(const part of actor.parts){
      part.obj.removeFromParent();part.obj.geometry.dispose();
      part.obj.material.map.dispose();part.obj.material.dispose();
    }
    actor.parts=originals.get(actor);
    for(const part of actor.parts)part.obj.visible=true;
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
    return {obj,base,name:m.name||'',poses:[],seated:{}};
  }
  async function dress(actor,figure,gender,valid){
    const rig=(await getPoses())[gender==='femme'?'f':'m'];
    if(!valid())return false;
    figure.pose(rig.rest);
    const bases=figure.meshes.map(m=>({p:m.v.slice(),n:m.vn.slice()}));
    const group=new T.Group(),parts=figure.meshes.map((m,i)=>meshPart(m,bases[i],group));
    for(const key of [...Array.from({length:8},(_,i)=>String(i)),...scene.roomSeats.flatMap(s=>[s.id+'-35',s.id+'-70',s.id])]){
      figure.pose(rig[key]);
      for(const [i,m] of figure.meshes.entries()){
        const delta=Int16Array.from(m.v,(v,k)=>v-bases[i].p[k]);
        const frame={delta,unit:.0001};
        if(key.length===1)parts[i].poses[Number(key)]=frame;
        else{const [seat,sample]=key.split('-');(parts[i].seated[seat]??=[])[sample==='35'?0:sample==='70'?1:2]=frame;}
      }
    }
    restore(actor);
    for(const part of originals.get(actor))part.obj.visible=false;
    for(const part of parts)actor.body.add(part.obj);
    actor.parts=parts;actor.stamp='';
    actor.id=gender==='femme'?'f':'m';actor.root.scale.setScalar(gender==='femme'?1.04:1.075);
    scene.animateBody(actor,0,null);
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
    if(!readSpeech)return;
    const poses=readSpeech();if(!poses)return;
    for(const [slot,a] of [['member',player()],['guest',partner()]]){
      const p=poses[slot];
      for(const part of a.parts){
        addVisemes(a,part);
        if(part.voiceReady){const mix=part.obj.morphTargetInfluences;mix[0]=p.jaw;mix[1]=p.blink;mix[2]=p.round;mix[3]=p.spread;}
      }
    }
  }
  function reset(slot){
    const a=slot==='guest'?partner():player();restore(a);
    a.id=originalIds.get(a);a.root.scale.setScalar(a.id==='f'?1.04:1.075);
  }
  return {
    async enableDialogue(channels,read){
      const res=await fetch('/membres/v27/visage-indices.json');if(!res.ok)throw Error('Le visage du salon est indisponible.');
      speech={channels,indices:await res.json()};readSpeech=read;
    },
    endDialogue(){readSpeech=null;for(const a of Object.values(actors))for(const part of a.parts)if(part.voiceReady)part.obj.morphTargetInfluences.fill(0);},
    speechFrame,
    setGender:gender=>scene.setRole(gender==='femme'?'f':'m'),
    dress:(slot,figure,gender,valid)=>dress(slot==='guest'?partner():player(),figure,gender,valid),
    reset,focus:scene.focus,meet:scene.meet,clearMeeting:scene.clearMeeting,camera:scene.camera,
    snapshot:scene.snapshot,
    departure(){if(scene.place==='salon'){scene.clearCamera();scene.resetView();document.getElementById('pin').focus({preventScroll:true});}},
    get place(){return scene.place;}
  };
}
