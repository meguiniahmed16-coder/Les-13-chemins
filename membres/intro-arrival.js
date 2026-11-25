import {INTRO_INVITATION_DURATION,INTRO_INVITATION_DIALOGUE,introInvitationCue} from './intro-invitation.js';
import {mountIntroInvitation} from './intro-invitation-ui.js';
export const GARDEN_DURATION=13000;
export const ARRIVAL_DURATION=INTRO_INVITATION_DURATION+GARDEN_DURATION;
export const PROMOTION=Object.freeze({
 title:'La Croisée des Âmes',
 universe:'Les Treize Chemins · La Tectonique des âmes',
 invitation:'Devenez compagnon de route et alpha-testeur.',
 contribution:'Contribuez au développement',
 site:'https://tectonique-des-ames.com',
 email:'ahmedmarie@tectonique-des-ames.com',
 dialogue:'Ah, j’oubliais aussi… il y a des options sympas.',
 musicCredit:'Musique : Effervescence — Scott Buckley · CC BY 4.0 · scottbuckley.com.au'
});
export function arrivalFrame(elapsed,{promo=false}={}){
 const at=Math.max(0,Number(elapsed)||0);
 const inSalon=at<INTRO_INVITATION_DURATION,gardenAt=Math.max(0,at-INTRO_INVITATION_DURATION);
 return {elapsed:Math.min(ARRIVAL_DURATION,at),
  phase:inSalon?'salon':promo&&at>=ARRIVAL_DURATION?'card':'garden',
  invitationElapsedMs:Math.min(at,INTRO_INVITATION_DURATION),gardenElapsedMs:gardenAt,
  invitation:inSalon?introInvitationCue(at):null,
  dialogue:!inSalon&&gardenAt>=1800&&gardenAt<8100,
  angel:!inSalon&&gardenAt>=4500&&gardenAt<10800,pressed:!inSalon&&gardenAt>=5500,
  card:promo&&at>=ARRIVAL_DURATION,
  done:at>=ARRIVAL_DURATION+(promo?7500:0)
 };
}

// The parent owns the clock; opening a report pauses the actors, butterflies,
// controls and end card together. Loading has an explicit ready/error protocol.
export function createArrivalPlayer({frame,win,now=()=>performance.now(),setTimer=setTimeout,clearTimer=clearTimeout,
 onState=()=>{},onFrame=()=>{},onProblem=()=>{},src='/membres/v27/salon.html?resident=marianne&arrival=cinema&finale=1&v=incarnations33'}){
 let state='idle',api=null,invitation=null,gardenBegun=false,startedAt=0,elapsed=0,paused=false,promo=false,skip=false,timeout=null,generation=0,finished=false;
 const emit=(phase,detail='')=>{state=phase;onState({phase,detail});};
 const cancelTimeout=()=>{if(timeout!==null)clearTimer(timeout);timeout=null;};
 function fail(message){if(state==='complete'||state==='idle')return;cancelTimeout();api=null;emit('error',String(message||'Le chargement du lieu a été interrompu.'));onProblem(String(message||'Chargement interrompu'));}
 function ready(){
  const child=frame.contentWindow?.salonV27,candidate=child?.introFinale,candidateInvitation=child?.introInvitation;
  // The child's own retry reloads its cinematic URL. Once the introduction
  // has ended, release the controls on that new scene without replaying it.
  const reopened=state==='complete'&&!promo&&candidate!==api;
  if(state!=='loading'&&!reopened)return;
  if(!candidate?.begin||!candidate?.sample||!candidate?.finish)return;
  if(!skip&&!reopened&&(!candidateInvitation?.begin||!candidateInvitation?.sample||!candidateInvitation?.finish))return;
  cancelTimeout();api=candidate;invitation=candidateInvitation;gardenBegun=false;
  if(reopened)state='loading';
  try{
   if(skip||reopened){api.finish();finished=true;emit('complete');return;}
   invitation.begin();elapsed=0;startedAt=now();finished=false;emit('playing');tick();
  }catch(error){fail(error.message||error);}
 }
 function receive(value){
  const data=value?.state||value;
  if(data?.phase==='error')fail(data.detail||data.message);
  else if(data?.phase==='ready')ready();
 }
 function inspect(){
  try{
   const child=frame.contentWindow;
   child?.addEventListener('salon-arrival-state',event=>receive(event.detail));
   child?.addEventListener('salon-ready',ready,{once:true});
   const snapshot=child?.salonArrival?.snapshot?.();
   if(snapshot)receive(snapshot);
   else if(frame.contentDocument?.body?.classList.contains('ready'))ready();
  }catch(error){fail(error.message||error);}
 }
 const message=event=>{
  if(event.origin!==win.location.origin||event.source!==frame.contentWindow)return;
  if(event.data?.scope==='salon-arrival-v1'&&event.data.type==='state')receive(event.data.state||event.data);
 };
 frame.addEventListener('load',inspect);frame.addEventListener('error',()=>fail('Le lieu n’a pas pu se charger.'));
 win.addEventListener('message',message);
 function load(){
  const token=++generation;cancelTimeout();api=null;invitation=null;gardenBegun=false;finished=false;elapsed=0;emit('loading');
  timeout=setTimer(()=>{if(token===generation&&state==='loading')fail('Le chargement prend trop de temps. Tu peux réessayer sans relancer l’introduction.');},60000);
  frame.src=src+(generation>1?'&retry='+generation:'');
 }
 function start(options={}){if(state!=='idle')return;promo=!!options.promo;skip=!!options.skip;paused=!!options.paused;load();}
 function tick(){
  if(state!=='playing'||!api)return;
  if(!paused)elapsed=Math.max(0,now()-startedAt);
  const cue=arrivalFrame(elapsed,{promo});
  try{
   let sampled;
   if(cue.phase==='salon')sampled=invitation.sample(cue.invitationElapsedMs);
   else{
    if(!gardenBegun){invitation.sample(INTRO_INVITATION_DURATION);invitation.finish();api.begin();gardenBegun=true;}
    sampled=api.sample(Math.min(GARDEN_DURATION,cue.gardenElapsedMs));
   }
   onFrame(cue,sampled);
   if(cue.done&&!finished){finished=true;if(!promo)api.finish();emit('complete');}
  }catch(error){fail(error.message||error);}
 }
 function pause(){if(paused)return;if(state==='playing')elapsed=Math.max(0,now()-startedAt);paused=true;tick();}
 function resume(){if(!paused)return;paused=false;startedAt=now()-elapsed;}
 return {start,tick,pause,resume,retry(){if(state==='error')load();},get state(){return state},get elapsed(){return elapsed},get paused(){return paused},
  dispose(){++generation;cancelTimeout();win.removeEventListener('message',message);api=null;state='idle';}
 };
}

export function mountIntroArrival({host,frame,bubble,win=window,onProblem=()=>{},onComplete=()=>{}}){
 const doc=host.ownerDocument,panel=doc.createElement('div');panel.id='intro-arrival';panel.hidden=true;
 panel.innerHTML=`<div class="arrival-loading" role="status"><p class="arrival-kicker">LA CROISÉE DES ÂMES</p><h2>Le salon s’ouvre…</h2><p class="arrival-detail">La prochaine rencontre se prépare.</p><button type="button" hidden>Réessayer</button></div>
 <div class="arrival-angel" role="img" aria-label="Démonstration du mode ange" hidden><span class="arrival-angel-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 20c3-6 5-10 9-12 3-1 6-2 9-5-.2 5-3 9-8 11l4-1c-2 3-5 4-9 4l2 1-7 2Z"/></svg></span><span>Mode ange</span><span class="arrival-angel-check" aria-hidden="true">✓</span></div>
 <p class="arrival-music-credit" hidden></p>
 <section class="promotion-card" aria-label="Rejoindre le projet" hidden><p class="promotion-universe"></p><h1></h1><div class="promotion-rule"></div><h2></h2><p class="promotion-contribution"></p><a class="promotion-site"></a><p class="promotion-contact"></p><p class="promotion-music-credit"></p></section>`;
 host.append(panel);
 const invitationDemo=mountIntroInvitation(host,panel);
 const loading=panel.querySelector('.arrival-loading'),heading=loading.querySelector('h2'),detail=panel.querySelector('.arrival-detail'),retry=loading.querySelector('button');
 const angel=panel.querySelector('.arrival-angel'),card=panel.querySelector('.promotion-card');
 card.querySelector('.promotion-universe').textContent=PROMOTION.universe;
 card.querySelector('h1').textContent=PROMOTION.title;card.querySelector('h2').textContent=PROMOTION.invitation;
 card.querySelector('.promotion-contribution').textContent=PROMOTION.contribution;
 const site=card.querySelector('.promotion-site');site.textContent=PROMOTION.site.replace('https://','');site.href=PROMOTION.site;
 card.querySelector('.promotion-contact').textContent='Ou contactez Ahmed Marie · '+PROMOTION.email;
 const musicCredit=panel.querySelector('.arrival-music-credit');musicCredit.textContent=PROMOTION.musicCredit;
 card.querySelector('.promotion-music-credit').textContent=PROMOTION.musicCredit;
 let shown='',bubbleSize='',promo=false;
 function dialogue(on,text=PROMOTION.dialogue,salon=false){
  if(on&&shown!==text){const b=doc.createElement('b'),p=doc.createElement('p');b.textContent='Ahmed Marie';p.textContent=text;bubble.replaceChildren(b,p);bubble.classList.remove('above','below','left','right');bubble.classList.add('above');bubble.hidden=false;bubble.style.visibility='visible';shown=text;bubbleSize='';}
  if(!on&&shown){bubble.hidden=true;shown='';}
  if(on){const w=host.clientWidth,h=host.clientHeight,key=w+'x'+h+':'+salon;if(key!==bubbleSize){bubbleSize=key;const width=salon?Math.min(w-28,740):Math.min(w-28,w<560?330:h<350?Math.min(300,w*.42):420);bubble.style.width=width+'px';bubble.style.left=(w-width)/2+'px';bubble.style.top=salon?'8px':'14px';bubble.style.setProperty('--tail-x','35%');}}
 }
 const player=createArrivalPlayer({frame,win,onProblem,
  onState({phase,detail:problem}){
   panel.hidden=phase==='idle'||phase==='complete'&&!promo;
   loading.hidden=phase!=='loading'&&phase!=='error';retry.hidden=phase!=='error';
   if(phase==='loading'){heading.textContent='Le salon s’ouvre…';detail.textContent='La prochaine rencontre se prépare.';dialogue(false);angel.hidden=true;card.hidden=true;musicCredit.hidden=true;invitationDemo.hide();}
   if(phase==='error'){heading.textContent='Un contretemps';detail.textContent=problem;dialogue(false);angel.hidden=true;musicCredit.hidden=true;invitationDemo.hide();}
   if(phase==='complete'){dialogue(false);onComplete({promo});}
  },
  onFrame(cue){
   invitationDemo.update(cue);
   if(cue.phase==='salon')dialogue(cue.invitation.dialogueVisible,INTRO_INVITATION_DIALOGUE[cue.invitation.dialogueIndex],true);else dialogue(cue.dialogue);
   angel.hidden=!cue.angel;angel.classList.toggle('active',cue.pressed);card.hidden=!cue.card;
   musicCredit.hidden=cue.phase==='salon'||cue.gardenElapsedMs<10800||cue.card;panel.classList.toggle('show-card',cue.card);
  }
 });
 retry.onclick=()=>player.retry();
 return {...player,start(options={}){promo=!!options.promo;player.start(options);},get state(){return player.state},get elapsed(){return player.elapsed},get paused(){return player.paused}};
}
