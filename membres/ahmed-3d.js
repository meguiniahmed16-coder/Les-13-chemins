// Ahmed numérique uses the original Ahmed V27 rig and the consented,
// rate-limited text service. No private voice key is sent to visitors.
import {createVoiceCapture,createCallInputLease} from './salon-conversation-audio.js?v=rencontres1';
import {voiceRequest} from './salon-conversation.js?v=rencontres1';
import {referenceStudio} from './studio-look.js?v=incarnations33';
const $=id=>document.getElementById(id);
const host=$('ahmed-3d-room'),call=$('ahmed-call'),hang=$('ahmed-hangup'),status=$('ahmed-call-status');
const Speech=globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition;
let actor=null,mounting=null,mic=null,active=false,epoch=0,awaiting=false,opening=false,ownerSpeech=false,ownerCheck=null,inputLease=null,remoteCapture=null,transcribeAbort=null;
function checkOwner(){return ownerCheck??=voiceRequest('status').then(info=>{ownerSpeech=true;return info;}).catch(error=>{ownerCheck=null;ownerSpeech=false;throw error;});}
async function startOpening(){
 if(opening)return;opening=true;
 // The author's Ahmed numérique entry shares the genuine voiced film and dojo,
 // not the unrelated short montage. Non-author visitors retain direct access.
 try{
  if(new URLSearchParams(location.search).get('intro')!=='terminee'&&sessionStorage.getItem('croisee-ahmed-introduction-originale-v34')!=='done'){
   const info=await checkOwner();
   if(info){
    location.replace('/membres/intro-prive.html?salon=1&retour=ahmed');return;
   }
  }
 }catch{/* mount reports the authorization error rather than selecting a generic character. */}
 void mount();
}
function note(value,error=false){status.textContent=value;status.classList.toggle('ahmed-call-error',error);status.classList.toggle('ahmed-call-live',active&&Boolean(value));}
function syncAhmedPhone(){const phone=host.querySelector('chemins-salon')?.shadowRoot?.querySelector('.maison-phone');if(!phone)return;phone.hidden=false;phone.setAttribute('aria-pressed',String(active));phone.setAttribute('aria-expanded',String(active));phone.title=active?'Raccrocher':'Appeler Ahmed numérique';phone.setAttribute('aria-label',phone.title);}
async function mount(){
 if(actor)return actor;
 if(mounting)return mounting;
 mounting=(async()=>{
  await import('./salon-v27.js?v=eleven70&rev=ahmedlatence4');
  if($('ahmed-3d').hidden)return null;
  const info=await checkOwner();const originalAhmed=true;
  const view=document.createElement('chemins-salon');
  view.setAttribute('scene','salon');view.setAttribute('ahmed-numerique','');view.setAttribute('ahmed-original','');view.className='ahmed-avatar-v27';
  view.addEventListener('salon-ahmed-call',()=>{if(active)stop();else void begin();});
  view.addEventListener('salon-ahmed-voice-status',e=>{if(active&&e.detail.message)note(e.detail.message);});
  view.addEventListener('salon-ahmed-voice-error',e=>{if(active){stop();note(e.detail.message,true);}});
  view.style.setProperty('--room-height','100%');
  host.append(view);
  const phone=view.shadowRoot?.querySelector('.maison-phone');if(phone){phone.hidden=false;phone.title='Appeler Ahmed numérique';phone.setAttribute('aria-label',phone.title);phone.setAttribute('aria-pressed','false');}
  const style=document.createElement('style');
  style.textContent='.stage{height:100%!important;min-height:0!important} .scene-viewport{height:100%!important;min-height:0!important;display:block!important;padding:0!important}.v27-frame{display:block!important;height:100%!important;width:100%!important}.conversation-footer,.maison-menu-toggle,.maison-dock,.maison-rail-panel,.studio-drawer,.maison-studio-peek,.v27-actions{display:none!important}:host([ahmed-numerique]) .stage .maison-phone:not([hidden]){display:grid!important;position:absolute!important;top:10px!important;right:10px!important;left:auto!important;bottom:auto!important;z-index:45!important;pointer-events:auto!important}:host([ahmed-numerique]) .stage>.scene-viewport>:not(.v27-frame):not(.maison-phone),:host([ahmed-numerique]) .stage>:not(.scene-viewport){display:none!important}:host([ahmed-numerique]) .stage .maison-phone[aria-pressed=true]{background:#934b40!important;color:white!important}';
  view.shadowRoot?.append(style);
  const original=referenceStudio('homme');
  await view.configure(original,{
   gender:'homme',memberKey:'ahmed-numerique-reference-v27',temporary:true,
   author:false,plus:false,originalAhmed,savedStudio:original,salonLooks:{homme:original},
   change(){},async saveCharacter(){},async save(){}
  });
  actor=view;syncAhmedPhone();if(!info.ready)note('Connexion vocale à vérifier : '+info.missing.join(', '),true);else note('');return view;
 })().catch(error=>{mounting=null;host.querySelector('chemins-salon')?.remove();note(error.status===401||error.status===403?'Le véritable Ahmed nécessite ta session auteur. Ouvre le Salon depuis ton administration.':(error.message||'Le modèle original n’a pas pu être chargé.'),true);return null;});
 return mounting;
}
function stopMic(){
 const previous=mic;mic=null;
 if(previous){previous.onend=previous.onerror=previous.onresult=null;try{previous.abort();}catch{}}
}
function stop(){
 active=false;epoch++;awaiting=false;stopMic();transcribeAbort?.abort();transcribeAbort=null;remoteCapture?.stop();remoteCapture=null;inputLease?.close();inputLease=null;actor?.stopAhmedVoice();
 call.hidden=true;hang.hidden=true;syncAhmedPhone();
 note('Appel terminé. Le dialogue écrit reste disponible.');
}
function listen(){
 if(!active||awaiting||document.hidden)return;
 if(ownerSpeech){listenOwner();return;}
 if(!Speech){stop();note('Micro indisponible dans ce navigateur. Utilise le dialogue écrit.');return;}
 stopMic();const turn=epoch;let heard=false;
 const rec=new Speech();mic=rec;rec.lang='fr-FR';rec.continuous=false;rec.interimResults=false;
 rec.onresult=event=>{
  if(!active||turn!==epoch)return;
  const spoken=Array.from(event.results).map(item=>item[0]?.transcript||'').join(' ').trim().slice(0,3000);
  if(!spoken)return;
  heard=true;mic=null;submitSpoken(spoken);
 };
 rec.onerror=event=>{
  if(!active||turn!==epoch)return;
  if(['not-allowed','service-not-allowed'].includes(event.error)){
   stop();note('Autorise le micro dans ton navigateur pour appeler Ahmed.');
  }else if(!['no-speech','aborted'].includes(event.error)){
   stop();note('Le micro a été interrompu. Tu peux rappeler Ahmed.');
  }
 };
 rec.onend=()=>{
  if(mic===rec)mic=null;
  if(active&&turn===epoch&&!heard&&!awaiting)setTimeout(()=>{if(active&&turn===epoch)listen();},300);
 };
 try{rec.start();note('Je t’écoute…');}catch{stop();note('Le micro n’a pas démarré. La conversation écrite reste accessible.');}
}
function submitSpoken(spoken){
 awaiting=true;const field=$('messageInput');field.value=spoken;field.dispatchEvent(new Event('input',{bubbles:true}));
 if($('sendButton').disabled){stop();note('La session écrite n’est plus disponible.');return;}
 note('Question reçue · Ahmed réfléchit…');$('composer').dataset.ahmedSpoken='1';try{$('composer').requestSubmit();}finally{delete $('composer').dataset.ahmedSpoken;}
}
function listenOwner(){
 const turn=epoch;remoteCapture?.stop();inputLease??=createCallInputLease();let heard=false,voiceSamples=0;
 remoteCapture=createVoiceCapture({inputLease,onStatus:note,onEnergy:energy=>{if(!active||turn!==epoch||awaiting||heard)return;voiceSamples=energy>=.012?voiceSamples+1:0;if(voiceSamples>=3){heard=true;note('Je t’entends…');}},onError:error=>{if(active&&turn===epoch){stop();note(error.message,true);}},
 onClip:async clip=>{if(!active||turn!==epoch)return;awaiting=true;const abort=new AbortController();transcribeAbort=abort;note('Phrase enregistrée · transcription…');
 try{const result=await voiceRequest('transcribe',{body:clip,signal:abort.signal});if(!active||turn!==epoch)return;const spoken=String(result.text||'').trim();if(spoken)submitSpoken(spoken);else{awaiting=false;listen();}}
 catch(error){if(active&&turn===epoch){stop();note(error.message);}}finally{if(transcribeAbort===abort)transcribeAbort=null;}
 }});
 void remoteCapture.start();
}
async function begin(){
 if(active)return;
 actor?.armAhmedVoice();
 active=true;epoch++;awaiting=false;call.hidden=true;hang.hidden=true;syncAhmedPhone();
 note('Connexion avec Ahmed…');
 const view=await mount();if(!active)return;
 if(!view){active=false;syncAhmedPhone();return;}
 try{const info=await checkOwner();if(!info.ready)throw Error('Connexion vocale à vérifier : '+info.missing.join(', '));}catch(error){stop();note(error.message,true);return;}
 if(!ownerSpeech&&!Speech){stop();note('La reconnaissance vocale est indisponible dans ce navigateur. Le clavier reste disponible.');$('ahmed-written').open=true;return;}
 view.armAhmedVoice();
 listen();
}
async function answer(event){
 if(!active||!awaiting)return;
 awaiting=false;
 const text=String(event.detail?.text||'').trim();
 if(!text){note('Réponse absente.');listen();return;}
 note('Réponse reçue · voix en préparation…');
 const view=await mount();if(!active)return;
 if(!view?.narrateAhmed(text,()=>{if(active)listen();})){
  note('Voix non disponible. Tu peux lire sa réponse écrite.');
  $('ahmed-written').open=true;listen();
 }
}
call.addEventListener('click',()=>void begin());
hang.addEventListener('click',stop);
document.addEventListener('ahmed-3d-ready',startOpening);
document.addEventListener('ahmed-3d-inactive',stop);
document.addEventListener('ahmed-3d-answer',e=>void answer(e));
document.addEventListener('ahmed-3d-error',e=>{if(active){stop();note(e.detail.message,true);}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)stop();});
window.addEventListener('pagehide',stop);
if(!$('chatPanel').hidden)startOpening();
