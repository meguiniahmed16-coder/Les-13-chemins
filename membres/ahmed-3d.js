// Ahmed numérique uses the original Ahmed V27 rig and the consented,
// rate-limited text service. No private voice key is sent to visitors.
import {referenceStudio} from './studio-look.js?v=incarnations33';
const $=id=>document.getElementById(id);
const host=$('ahmed-3d-room'),call=$('ahmed-call'),hang=$('ahmed-hangup'),status=$('ahmed-call-status');
const Speech=globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition;
let actor=null,mounting=null,mic=null,active=false,epoch=0,awaiting=false,opening=false;
async function startOpening(){
 if(opening)return;opening=true;
 // The author's Ahmed numérique entry shares the genuine voiced film and dojo,
 // not the unrelated short montage. Non-author visitors retain direct access.
 try{
  if(new URLSearchParams(location.search).get('intro')!=='terminee'&&sessionStorage.getItem('croisee-ahmed-introduction-originale-v34')!=='done'){
   const response=await fetch('/api/membres/me?auteur=1',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(7000)});
   if(response.ok&&(await response.json()).author){
    location.replace('/membres/intro-prive.html?salon=1&retour=ahmed');return;
   }
  }
 }catch{/* Public visitors can still speak to Ahmed without an author session. */}
 void mount();
}
function note(value){status.textContent=value;}
async function mount(){
 if(actor)return actor;
 if(mounting)return mounting;
 mounting=(async()=>{
  await import('./salon-v27.js?v=eleven70&rev=rencontres1');
  if($('ahmed-3d').hidden)return null;
  const view=document.createElement('chemins-salon');
  view.setAttribute('scene','salon');view.setAttribute('ahmed-numerique','');view.className='ahmed-avatar-v27';
  view.addEventListener('salon-ahmed-call',()=>void begin());
  view.style.setProperty('--room-height','100%');
  host.append(view);
  const style=document.createElement('style');
  style.textContent='.stage{height:100%!important;min-height:0!important}.scene-viewport{height:100%!important;min-height:0!important}.conversation-footer,.maison-menu-toggle,.maison-dock,.maison-rail-panel,.studio-drawer,.maison-studio-peek,.v27-actions{display:none!important}';
  view.shadowRoot?.append(style);
  const original=referenceStudio('homme');
  await view.configure(original,{
   gender:'homme',memberKey:'ahmed-numerique-reference-v27',temporary:true,
   author:false,plus:false,savedStudio:original,salonLooks:{homme:original},
   change(){},async saveCharacter(){},async save(){}
  });
  actor=view;return view;
 })().catch(()=>{mounting=null;note('Le modèle 3D ne répond pas. Le dialogue écrit reste accessible.');return null;});
 return mounting;
}
function stopMic(){
 const previous=mic;mic=null;
 if(previous){previous.onend=previous.onerror=previous.onresult=null;try{previous.abort();}catch{}}
}
function stop(){
 active=false;epoch++;awaiting=false;stopMic();actor?.stopAhmedVoice();
 call.hidden=false;hang.hidden=true;
 note('Appel terminé. Le dialogue écrit reste disponible.');
}
function listen(){
 if(!active||awaiting||document.hidden)return;
 if(!Speech){stop();note('Micro indisponible dans ce navigateur. Utilise le dialogue écrit.');return;}
 stopMic();const turn=epoch;let heard=false;
 const rec=new Speech();mic=rec;rec.lang='fr-FR';rec.continuous=false;rec.interimResults=false;
 rec.onresult=event=>{
  if(!active||turn!==epoch)return;
  const spoken=Array.from(event.results).map(item=>item[0]?.transcript||'').join(' ').trim().slice(0,3000);
  if(!spoken)return;
  heard=true;awaiting=true;mic=null;
  const field=$('messageInput');field.value=spoken;field.dispatchEvent(new Event('input',{bubbles:true}));
  if($('sendButton').disabled){stop();note('La session écrite n’est plus disponible.');return;}
  note('Ahmed prépare sa réponse…');$('composer').requestSubmit();
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
async function begin(){
 if(active)return;
 if(!Speech){note('La reconnaissance vocale est indisponible dans ce navigateur. Le clavier reste disponible.');$('ahmed-written').open=true;return;}
 actor?.armAhmedVoice();
 active=true;epoch++;awaiting=false;call.hidden=true;hang.hidden=false;
 note('Connexion avec Ahmed…');
 const view=await mount();if(!active)return;
 if(!view){stop();return;}
 view.armAhmedVoice();
 if(!view.narrateAhmed('Salut. Je t’écoute.',()=>listen()))listen();
}
async function answer(event){
 if(!active||!awaiting)return;
 awaiting=false;
 const text=String(event.detail?.text||'').trim();
 if(!text){note('Réponse absente.');listen();return;}
 note('Ahmed te répond…');
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
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)stop();});
window.addEventListener('pagehide',stop);
if(!$('chatPanel').hidden)startOpening();
