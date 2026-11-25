import {normaliseAvatar} from './avatar-catalog.js';
import {normaliseStudio,exactStudio} from './studio-look.js?v=incarnations33';
import {startingAppearance} from './starting-appearance.js?v=incarnations33';
import {normalizeJourney,mergeJourney} from './journey.js';

// Each preview has its own settings and local-only writes. No billing session is created.
export function createMemberPreview(gender='homme',companion=false){
  const birth=(new Date().getUTCFullYear()-32)+'-01-01';
  const initial=startingAppearance(gender,birth,companion),avatar=normaliseAvatar(initial,companion);
  const pseudo=gender==='femme'?'Nora':'Samir';
  const profile={id:'apercu-'+gender+'-'+(companion?'abonne':'gratuit'),gender,pseudo,birth,age:'25–34 ans',name:'',email:pseudo.toLowerCase()+'@example.invalid',
    avatar,salonLooks:{},studio:initial.studio,journey:normalizeJourney(),author:null,companion,paidUntil:companion?Math.floor(Date.now()/1000)+30*86400:0,portal:companion?'#abonnement':''};
  let signedOut=false;
  return (path,data)=>{
    if(signedOut)throw Object.assign(Error('Tu as quitté le compte de démonstration.'),{status:401});
    switch(path){
      case 'me':return structuredClone(profile);
      case 'salon-appearance':{
        const selected=data.gender,studio=data.studio;
        if(!['femme','homme'].includes(selected)||!exactStudio(studio,normaliseStudio(studio,companion,undefined,selected)))throw Error('Cette personnalisation est indisponible.');
        profile.salonLooks[selected]=studio;if(selected===gender)profile.studio=studio;
        return {gender:selected,studio};
      }
      case 'avatar':{
        const studio=normaliseStudio(data.studio,companion,avatar,gender);
        if(!exactStudio(data.studio,studio))throw Error('Cette personnalisation est indisponible.');
        profile.studio=studio;
        return {avatar,studio};
      }
      case 'journey':profile.journey=mergeJourney(profile.journey,data);return {ok:true};
      case 'logout':signedOut=true;return {ok:true};
      case 'profile':throw Error('Dans cet aperçu, le profil de démonstration reste fictif.');
      case 'checkout':throw Error('Sur un compte réel, ce bouton ouvre le paiement de l’abonnement.');
      default:throw Error('Cette action est indisponible dans l’aperçu.');
    }
  };
}
