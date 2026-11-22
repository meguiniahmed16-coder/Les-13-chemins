import * as T from 'three';
import sequence from './marianne-voix.json';
const vowels={repos:[0,0,0,0,0,0],A:[.48,.23,.05,.14,0,0],IE:[.18,.29,0,.58,0,0],O:[.27,.08,.75,0,0,0],OU:[.13,.035,1,0,0,0],MBP:[0,0,0,.02,0,1],FV:[.077,.48,0,.18,.95,0],S:[.09,.27,0,.37,0,0],CH:[.12,.21,.44,.09,0,0],L:[.16,.25,0,.21,0,0],K:[.22,.14,.05,.1,0,0]};
const clamp=T.MathUtils.clamp,smooth=t=>T.MathUtils.smoothstep(t,0,1);
function recorded(head,t){
  const out=[0,0,0,0,0,0];let total=0;
  for(const q of sequence.visemes){const d=Math.max(q.debut-t,t-q.fin,0);if(d>.08)continue;const w=Math.exp(-.5*(d/.02)**2)*Math.min(1,(q.fin-q.debut)/.021);
    (vowels[q.forme]||vowels.repos).forEach((v,i)=>out[i]+=v*w);total+=w;}
  const [jaw,teeth,round,wide,fv,seal]=out.map(v=>v/Math.max(1,total));head.pose.lips.set(round,wide,fv,seal);
  const clip=sequence.rires.find(r=>t>=r.debut-.12&&t<=r.fin+.28);const big=clip?.style==='eclat';
  const smile=clip?smooth((t-clip.debut+.12)/.26)*(1-smooth((t-clip.fin+.10)/.38)):0;
  const amp=delay=>{if(!clip)return 0;const k=(t-delay-clip.debut)/clip.pas,i=Math.floor(k);return i>=0&&i<clip.enveloppe.length-1?T.MathUtils.lerp(clip.enveloppe[i],clip.enveloppe[i+1],k-i):0;};
  const beat=amp(0),cheeks=smile*(big?.46+.50*amp(.05):.33+.28*amp(.05));
  head.pose.fold.value=cheeks;head.weights({Ouvrir:jaw+smile*(big?.09:.052)+beat*(big?.66:.33),Decouvrir:teeth+smile*(big?.59:.35)+beat*.18,SourireG:(big?.83:.60)*smile,SourireD:(big?.79:.54)*smile,Plisser:cheeks,PlisDuRire:cheeks,RegardBas:big?0:.15*smile,RegardHaut:big?.20*smile:0});
}

export function perform(head,p={}){
  if(p.recordingTime!=null){head.mixer.stopAllAction();head.acting=null;recorded(head,p.recordingTime);return;}
  const reaction=p.reaction;
  if(!reaction||!head.actions.has(reaction.name)){
    if(head.acting){head.mixer.stopAllAction();head.acting=null;}head.talk(p);return;
  }
  const action=head.actions.get(reaction.name);
  if(action!==head.acting){head.mixer.stopAllAction();head.acting=action;action.reset().play();}
  action.time=Math.min(action.getClip().duration-.005,reaction.age);head.mixer.update(0);
  head.pose.lips.set(p.round||0,p.spread||0,0,0);
  for(const o of head.rigs){const w=o.morphTargetInfluences,d=o.morphTargetDictionary;
    if(d.Ouvrir!=null)w[d.Ouvrir]=Math.max(w[d.Ouvrir],p.jaw||0);
    if(d.Plisser!=null)w[d.Plisser]=Math.max(w[d.Plisser],p.blink||0);
  }
  head.pose.fold.value=head.skin.morphTargetInfluences?.[head.skin.morphTargetDictionary?.PlisDuRire]||0;
}
