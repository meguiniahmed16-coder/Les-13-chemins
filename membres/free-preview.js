import {normaliseAvatar} from './avatar-catalog.js';
import {normaliseStudio,exactStudio} from './studio-look.js';
import {normalizeJourney,mergeJourney} from './journey.js';

// Preview changes live only for the lifetime of this page.
export function createFreePreview(){
  const avatar=normaliseAvatar({});
  const profile={id:'apercu-gratuit',pseudo:'Camille',birth:'1995-05-12',age:'25–34 ans',name:'',email:'camille@example.invalid',
    avatar,studio:normaliseStudio(undefined,false,avatar),journey:normalizeJourney(),author:null,companion:false,paidUntil:0,portal:''};
  let signedOut=false;
  return (path,data)=>{
    if(signedOut)throw Object.assign(Error('Tu as quitté le compte de démonstration.'),{status:401});
    switch(path){
      case 'me':return structuredClone(profile);
      case 'avatar':{
        const studio=normaliseStudio(data.studio,false,avatar);
        if(!exactStudio(data.studio,studio))throw Error('Cette personnalisation est indisponible.');
        profile.studio=studio;
        return {avatar,studio};
      }
      case 'journey':
        profile.journey=mergeJourney(profile.journey,data);
        return {ok:true};
      case 'logout':signedOut=true;return {ok:true};
      case 'profile':throw Error('Dans cet aperçu, le profil de démonstration reste fictif.');
      case 'checkout':throw Error('Sur un compte réel, ce bouton ouvre le paiement de l’abonnement.');
      default:throw Error('Cette action est indisponible dans l’aperçu.');
    }
  };
}
