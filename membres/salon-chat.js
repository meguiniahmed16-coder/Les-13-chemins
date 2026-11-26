import {createShotSequence} from './salon-shots.js';
import {createDialogue} from './salon-dialogue.js?v=eleven70&rev=rencontres1';
import {createDictee} from './salon-dictee.js?v=salon41';
import {createVoiceConversation,voiceRequest} from './salon-conversation.js?v=eleven69&rev=rencontres1';
import {characterReply,limit} from '../atlas-chat-client.js';
import {searchName,guestAppearance} from './salon-encounter.js?v=call58';

const opening='Asseyons-nous et discutons.';
let directory;
function loadDirectory(){
  return directory??=fetch(new URL('../salon-personnages.json?v=salon37',import.meta.url)).then(async response=>{
    if(!response.ok)throw Error();
    const people=await response.json();
    if(!Array.isArray(people)||!people.length)throw Error();
    return people;
  }).catch(error=>{directory=null;throw error;});
}
export function createSalonChat(root,{invite,leave,change,rate,gender,customize}){
  const $=s=>root.querySelector(s),scene=$('.scene-viewport'),hud=$('.hud');
  hud.insertAdjacentHTML('beforeend','<button class="invite-toggle" type="button" aria-expanded="false" aria-controls="guest-picker">Inviter un personnage</button>');
  scene.insertAdjacentHTML('beforeend',`
    <section class="guest-picker" id="guest-picker" aria-label="Inviter un personnage du livre" hidden>
      <header><strong>Inviter un personnage</strong><button class="picker-close" type="button" aria-label="Fermer les invitations">×</button></header>
      <div class="guest-picker-search">
        <label>Rechercher un personnage<input type="search" class="guest-search" placeholder="Rechercher un nom…" autocomplete="off"></label>
        <button type="button" class="guest-random">Inviter au hasard <span aria-hidden="true">✦</span></button>
      </div>
      <div class="guest-list" role="group" aria-label="Personnages proposés"></div><p class="picker-state" role="status"></p>
      <small>Dialogue imaginé d’après le livre. Les traits non décrits sont interprétés.</small>
    </section>
      <div class="speech-rail" id="salon-bulles" hidden>
        <div class="speech own-speech" role="group" hidden><strong>Toi</strong><span class="line" aria-hidden="true"></span><button type="button" hidden>Lire la suite</button></div>
        <div class="speech guest-speech" role="group" hidden><strong></strong><span class="line" aria-hidden="true"></span><button type="button" hidden>Lire la suite</button></div>
        <section class="speech-reader" aria-label="Message complet" hidden><header><strong></strong><button type="button" aria-label="Fermer le message">×</button></header><p></p></section>
      </div>
    `);
  $('.stage').insertAdjacentHTML('beforeend',`
    <section class="conversation-footer" aria-label="Conversation" hidden>
      <header class="thread-heading"><strong class="thread-name"></strong><button class="guest-style" type="button" hidden>Personnaliser l’invité</button><button class="thread-toggle" type="button" aria-expanded="true" aria-controls="salon-thread">Réduire</button></header>
      <div id="salon-thread" class="thread-history" role="log" aria-label="Historique de la conversation"></div>
      <div class="conversation-tools" role="group" aria-label="Vues de la conversation">
        <button type="button" data-shot="wide" aria-pressed="false">Vue large</button>
        <button type="button" data-shot="reverse" aria-pressed="true" title="Plans larges, moyens et gros plans en champ et contrechamp">Plans alternés</button>
        <button type="button" class="voice-toggle" aria-pressed="false" hidden>Voix</button>
        <button type="button" class="conversation-voice-toggle" aria-expanded="false" aria-controls="salon-voice-conversation" hidden>Conversation vocale</button>
        <button type="button" class="bubbles-toggle" aria-controls="salon-bulles" aria-pressed="true">Bulles</button>
      </div>
      <div class="camera-slot"><button class="guest-leave" type="button" aria-label="Terminer la conversation">Terminer</button></div>
      <section class="voice-conversation" id="salon-voice-conversation" aria-label="Conversation vocale" hidden>
        <header class="voice-call-header">
          <div class="voice-call-title"><strong>Appel avec <span class="voice-call-name">le personnage</span></strong><span class="voice-call-presence">Conversation privée</span></div>
          <button class="voice-conversation-close" type="button" aria-label="Raccrocher" title="Raccrocher"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13c5-4 13-4 18 0l-2.5 5-4-2v-3h-5v3l-4 2Z"/></svg></button>
        </header>
        <p class="voice-conversation-status" role="status" aria-live="polite">Connexion au personnage…</p>
        <div class="voice-conversation-actions" role="group" aria-label="Commandes de l’appel">
          <button class="voice-conversation-start" type="button" disabled>Appeler</button>
          <button class="voice-conversation-pause" type="button" hidden aria-label="Couper le micro"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 10v3a7 7 0 0 0 14 0v-3m-7 10v2m-4 0h8"/></svg><span>Micro</span></button>
        </div>
        <small class="voice-call-hint">Tu parles, le personnage te répond. Un appui sur le micro permet de l’interrompre ou de mettre l’appel en pause.</small>
        <details class="voice-conversation-settings"><summary>Relier mes comptes</summary>
          <p>Ces réglages sont réservés à ton compte administrateur. Les clés sont conservées chiffrées sur le serveur et ne sont jamais affichées après l’enregistrement.</p>
          <form data-voice-provider="openai"><label>Clé du compte OpenAI qui possède tes crédits<input type="password" name="key" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="1024" required></label><button type="submit">Relier OpenAI</button></form>
          <form data-voice-provider="cartesia"><label>Clé API Cartesia<input type="password" name="key" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="512" required></label><button type="submit">Relier Cartesia</button></form><p><a href="https://play.cartesia.ai/keys" target="_blank" rel="noopener noreferrer">Créer une clé Cartesia</a> · <a href="/membres/voix.html">Ouvrir les réglages vocaux séparément</a></p>
          <p class="voice-settings-status" role="status"></p>
        </details>
      </section>
      <form class="guest-compose"><input class="guest-message" type="text" inputmode="text" autocapitalize="sentences" spellcheck="true" placeholder="Écris ton message…" aria-label="Ton message" maxlength="${limit}" autocomplete="off" enterkeyhint="send">
        <button class="guest-mic" aria-label="Dicter un message" title="Dicter un message" type="button" aria-pressed="false"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8"/></svg></button>
        <button class="guest-send" type="submit">Envoyer</button></form>
      <p class="arrival-status" role="status"></p>
      <div class="chat-feedback"><p class="chat-state" role="status"></p><button class="retry-message" type="button" hidden>Réessayer l’envoi</button></div>
      <p class="dictation-state" role="status"></p><p class="voice-state" role="status"></p><span class="speech-announcement" role="status" aria-atomic="true"></span>
    </section>`);
  const picker=$('.guest-picker'),list=$('.guest-list'),search=$('.guest-search'),random=$('.guest-random'),toggle=$('.invite-toggle');
  const pickerState=$('.picker-state'),footer=$('.conversation-footer'),input=$('.guest-message'),send=$('.guest-send'),mic=$('.guest-mic'),status=$('.chat-state');
  const own=$('.own-speech'),other=$('.guest-speech'),reader=$('.speech-reader');
  const rail=$('.speech-rail'),bubbleSwitch=$('.bubbles-toggle'),shots=[...root.querySelectorAll('[data-shot]')];
  const toolbar=$('.bar'),barSlot=$('.camera-slot'),voiceSwitch=$('.voice-toggle');
  const phoneToggle=$('.conversation-voice-toggle'),phonePanel=$('.voice-conversation'),phoneStatus=$('.voice-conversation-status');
  const phoneStart=$('.voice-conversation-start'),phonePause=$('.voice-conversation-pause');
  let voiceSession=null,phoneBusy=false,phoneReady=false,phoneLoad=0,savingVoiceSettings=false;
  // The account owner keeps the private OpenAI call. Fifteen-minute visitors
  // use browser speech recognition plus the already rate-limited public
  // character dialogue: no private provider credential is given to visitors.
  const publicCall=!root.host.hasAttribute('salon-auteur');
  if(!publicCall)phoneToggle.hidden=false;
  let publicMic=null,publicCallActive=false,publicCallGeneration=0,publicMicAnswered=false;
  if(publicCall){
    phonePanel.querySelector('.voice-conversation-settings').hidden=true;
    phonePanel.querySelector('.voice-call-hint').textContent='Le micro utilise la reconnaissance vocale du navigateur. Selon l’appareil, ce service peut transmettre les paroles à son fournisseur. Les messages respectent les limites de la visite.';
  }
  const sequence=createShotSequence(),now=()=>performance.now()/1000;
  let mode='reverse',speaker='player',reading,showSpeech=true;
  const nodeFor=who=>who==='player'?own:other,announcement=$('.speech-announcement');
  const voiceStatus=$('.voice-state'),micStatus=$('.dictation-state'),retry=$('.retry-message');
  let micState='idle',failedQuestion='',dictatedDraft=false,retryDictated=false;
  const voiceEnabled=()=>voiceSwitch.getAttribute('aria-pressed')==='true';
  function showLine(who,text){
    const node=nodeFor(who);turn(who);bubble(node,text);
    announcement.textContent=node.getAttribute('aria-label');
  }
  const playback=createDialogue({
    gender,
    allowRemote:()=>root.host.hasAttribute('salon-auteur')||root.host.hasAttribute('ahmed-numerique'),
    voiceStatus:message=>{voiceStatus.textContent=message;if(root.host.hasAttribute('ahmed-numerique')&&message)root.host.dispatchEvent(new CustomEvent('salon-ahmed-voice-status',{detail:{message:message==='Le personnage te répond.'?'Ahmed te répond…':message}}));if(root.host.hasAttribute('ahmed-numerique')&&/^Voix :|^Le son n’est pas disponible/.test(message))root.host.dispatchEvent(new CustomEvent('salon-ahmed-voice-error',{detail:{message}}));},
    start:showLine,
    word(who,w){
      if(!w)return;
      const node=nodeFor(who),span=node.querySelector('.line'),text=node.lineText;
      if(!text||rail.hidden)return;
      span.replaceChildren(document.createTextNode(text.slice(0,w.index)));
      const mark=document.createElement('mark');mark.textContent=text.slice(w.index,w.index+w.length);
      span.append(mark,document.createTextNode(text.slice(w.index+w.length)));
      span.scrollTop=Math.max(0,mark.offsetTop-span.offsetTop-span.clientHeight+mark.offsetHeight);
    },
    rest(who){
      const node=nodeFor(who),span=node.querySelector('.line');
      span.textContent=node.lineText||'';span.scrollTop=0;
      if(who==='guest'&&publicCallActive&&!phonePanel.hidden){
        setTimeout(()=>{if(publicCallActive&&!request)listenPublic();},170);
      }
      if(who==='player'&&avatarVoiceDone){
        const done=avatarVoiceDone;avatarVoiceDone=null;queueMicrotask(done);
      }
    },
    wake:change
  });
  voiceSwitch.hidden=!playback.supportsVoice;voiceSwitch.title='Écouter les voix des personnages';
  voiceSwitch.onclick=()=>{
    const enabled=!voiceEnabled();
    if(enabled&&micState!=='idle')dictee.cancel();
    voiceSwitch.setAttribute('aria-pressed',String(enabled));playback.voice(enabled);
    if(enabled&&!playback.busy&&other.lineText&&other.lineText!=='…')playback.play('guest',other.lineText,rate('guest'));
  };
  function setMode(value){
    if(value==='reverse'){sequence.reset(now());sequence.turn(speaker);}
    mode=value;
    for(const button of shots)button.setAttribute('aria-pressed',String(button.dataset.shot===mode));
  }
  for(const button of shots)button.onclick=()=>{setMode(button.dataset.shot);change();};
  function turn(who){speaker=who;sequence.turn(who);change();}
  const bubblePreferenceKey='salon-bulles-visibles-v1';
  function showBubbles(show,initial=false){
    reader.hidden=true;showSpeech=show;rail.hidden=!person||!show;
    bubbleSwitch.setAttribute('aria-pressed',String(show));
    bubbleSwitch.title=show?'Masquer les bulles':'Afficher les bulles';
    try{localStorage.setItem(bubblePreferenceKey,String(show));}catch{}
    if(!initial)change();
  }
  let rememberedBubbles=true;
  try{rememberedBubbles=localStorage.getItem(bubblePreferenceKey)!=='false';}catch{}
  bubbleSwitch.onclick=()=>showBubbles(!showSpeech);
  for(const node of [own,other])node.querySelector('button').onclick=()=>{
    reading=node;reader.querySelector('strong').textContent=node.querySelector('strong').textContent;
    reader.querySelector('p').textContent=node.querySelector('span').textContent;reader.hidden=false;reader.querySelector('p').scrollTop=0;
    reader.querySelector('button').focus({preventScroll:true});
  };
  function closeReader(){
    reader.hidden=true;reading?.querySelector('button').focus({preventScroll:true});change();
  }
  reader.querySelector('button').onclick=closeReader;
  reader.onkeydown=e=>{if(e.key==='Escape'){e.stopPropagation();closeReader();}};
  let onChoice=null;
  let people=[],person=null,version=0,request=null,loading=false;
  showBubbles(rememberedBubbles,true);
  const threads=new Map(),log=$('.thread-history'),threadToggle=$('.thread-toggle'),styleButton=$('.guest-style');
  let avatarVoiceDone=null;
  voiceSession=createVoiceConversation({
    character:()=>person?{id:person.id,history:threads.get(person.id)||[],gender:gender('guest')}:null,
    onQuestion(question){showLine('player',question);appendLine('Toi',question);bubble(other,'…');status.textContent='';},
    onAnswer(question,answer){
      if(!person)return;
      appendLine(person.name,answer);bubble(other,answer);
      const thread=threads.get(person.id);thread.push({question,answer});if(thread.length>40)thread.shift();
    },
    onAudio:(answer,audio)=>playback.playExternal('guest',answer,audio),
    onIdle:()=>playback.clear(),
    onStatus:message=>{phoneStatus.textContent=message;},
    onState(state){
      const wasBusy=phoneBusy;phoneBusy=!['idle','paused'].includes(state);
      phonePanel.dataset.state=state;
      phoneStart.textContent=state==='paused'?'Réactiver le micro':'Appeler';
      phoneStart.hidden=phoneBusy;phonePause.hidden=!phoneBusy;
      const interruption=['transcribing','thinking','preparing','speaking'].includes(state);
      phonePause.setAttribute('aria-label',interruption?'Prendre la parole':'Couper le micro');
      phonePause.title=phonePause.getAttribute('aria-label');
      phonePause.querySelector('span').textContent=interruption?'Parler':'Micro';
      if(phoneBusy&&!wasBusy){dictee.cancel();playback.clear();playback.voice(false);}
      if(!phoneBusy&&wasBusy)playback.voice(voiceEnabled());
      buttons();
    }
  });
  async function loadPhone(show=false){
    const ticket=++phoneLoad,current=person;
    if(publicCall){
      phoneReady=Boolean(current);
      phoneToggle.hidden=!current;
      if(show){
        phonePanel.hidden=false;phoneToggle.setAttribute('aria-expanded','true');
        phoneStatus.textContent='Appuie sur Appeler pour discuter avec '+(current?.name||'le personnage')+' à voix haute.';
      }
      buttons();return;
    }
    if(show){phonePanel.hidden=false;phoneToggle.setAttribute('aria-expanded','true');phoneStatus.textContent='Connexion au personnage…';}
    phonePanel.querySelector('.voice-call-name').textContent=current?.name||'les réglages vocaux';
    if(!current&&show)$('.voice-conversation-settings').open=true;
    try{
      const {status:available}=await voiceSession.refresh({withVoices:false});
      if(ticket!==phoneLoad||person!==current)return;
      phoneToggle.hidden=false;phoneReady=Boolean(current&&available.ready&&available.providers?.voice==='Cartesia');
      if(show&&!phoneReady)$('.voice-conversation-settings').open=true;
      phoneStatus.textContent=phoneReady?'Appuie sur Appeler. La voix sera choisie automatiquement pour '+current.name+'.':'Relie OpenAI et Cartesia dans les réglages pour appeler.';
      buttons();
    }catch(error){
      if(ticket!==phoneLoad||person!==current||error.name==='AbortError')return;
      phoneReady=false;
      if(error.status===401||error.status===403){phoneToggle.hidden=false;phoneReady=false;if(show){phoneStatus.textContent='Session auteur requise. Reconnecte-toi à ton espace personnel.';$('.voice-conversation-settings').open=true;}}
      else if(show){phoneStatus.textContent='La connexion n’a pas pu être vérifiée. Tu peux quand même ouvrir les réglages.';$('.voice-conversation-settings').open=true;}
      buttons();
    }
  }
  function closePhone(){
    phoneLoad++;voiceSession.stop();stopPublicCall();
    phonePanel.hidden=true;phoneToggle.setAttribute('aria-expanded','false');
    for(const field of phonePanel.querySelectorAll('input[type=password]'))field.value='';
  }
  function stopPublicCall(){
    publicCallActive=false;publicCallGeneration++;publicMicAnswered=false;
    const mic=publicMic;publicMic=null;
    if(mic){mic.onend=mic.onerror=mic.onresult=null;try{mic.abort();}catch{}}
    phonePause.hidden=true;phoneStart.hidden=false;
    phonePanel.dataset.state='idle';
  }
  function listenPublic(){
    if(!publicCallActive||!person||phonePanel.hidden||publicMic||request||playback.busy)return;
    const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!Speech){
      stopPublicCall();
      phoneStatus.textContent='La reconnaissance vocale n’est pas disponible ici. Tu peux écrire au personnage avec le clavier.';
      return;
    }
    const generation=publicCallGeneration;
    const recognition=new Speech();publicMic=recognition;publicMicAnswered=false;
    recognition.lang='fr-FR';recognition.continuous=false;recognition.interimResults=false;
    recognition.onresult=event=>{
      if(!publicCallActive||generation!==publicCallGeneration)return;
      const phrase=Array.from(event.results).map(item=>item[0]?.transcript||'').join(' ').trim();
      if(!phrase)return;
      publicMicAnswered=true;phonePanel.dataset.state='thinking';
      phoneStatus.textContent='Le personnage prépare sa réponse…';
      const spoken=phrase.slice(0,limit);void say(spoken,false,undefined,true);
    };
    recognition.onerror=event=>{
      if(generation!==publicCallGeneration)return;
      if(event.error==='not-allowed'||event.error==='service-not-allowed'){
        stopPublicCall();phoneStatus.textContent='Le micro est bloqué. Autorise-le dans le navigateur pour appeler.';
      }else if(event.error!=='no-speech'&&event.error!=='aborted'){
        stopPublicCall();phoneStatus.textContent='Le micro n’a pas répondu. Appuie sur Appeler pour réessayer.';
      }
    };
    recognition.onend=()=>{
      if(publicMic===recognition)publicMic=null;
      if(!publicCallActive||generation!==publicCallGeneration||publicMicAnswered)return;
      setTimeout(()=>{if(publicCallActive&&generation===publicCallGeneration)listenPublic();},260);
    };
    try{
      recognition.start();
      phoneStart.hidden=true;phonePause.hidden=false;phonePause.querySelector('span').textContent='Micro';
      phonePanel.dataset.state='listening';phoneStatus.textContent='Je t’écoute…';
    }catch{
      stopPublicCall();phoneStatus.textContent='Le micro n’a pas pu démarrer. Réessaie depuis Chrome.';
    }
  }
  function startPublicCall(){
    if(!person)return;
    publicCallActive=true;publicCallGeneration++;
    // Unlock ElevenLabs audio on the user's tap; never invoke Android speech.
    if(playback.supportsVoice&&!voiceEnabled()){
      voiceSwitch.setAttribute('aria-pressed','true');playback.voice(true);
    }
    listenPublic();
  }
  phoneToggle.onclick=()=>{
    if(publicCall){
      if(!phonePanel.hidden){closePhone();return;}
      phonePanel.hidden=false;phoneToggle.setAttribute('aria-expanded','true');
      phonePanel.querySelector('.voice-call-name').textContent=person?.name||'le personnage';
      if(person)startPublicCall();else void loadPhone(true);
      return;
    }
    if(!phonePanel.hidden){closePhone();return;}
    if(person&&phoneReady&&!request){
      // The audio engine must unlock synchronously inside this actual tap.
      // The character and backend have been preloaded at invitation time, so
      // the user does not need to tap a second “Appeler” button.
      phonePanel.hidden=false;
      phoneToggle.setAttribute('aria-expanded','true');
      phonePanel.querySelector('.voice-call-name').textContent=person.name;
      void voiceSession.start('');
    }else void loadPhone(true);
  };
  $('.voice-conversation-close').onclick=closePhone;
  phoneStart.onclick=()=>{
    if(publicCall){startPublicCall();return;}
    if(phoneReady&&!request)void voiceSession.start('');
  };
  phonePause.onclick=()=>{
    if(publicCall){
      stopPublicCall();playback.clear();phoneStatus.textContent='Micro coupé. Appuie sur Appeler pour reprendre.';
      return;
    }
    if(['transcribing','thinking','preparing','speaking'].includes(voiceSession.state))voiceSession.interrupt();
    else voiceSession.pause();
  };
  for(const form of root.querySelectorAll('[data-voice-provider]'))form.onsubmit=async event=>{
    event.preventDefault();voiceSession.stop();
    const field=form.querySelector('[name=key]'),button=form.querySelector('button'),feedback=$('.voice-settings-status');
    if(!field.value.trim()||savingVoiceSettings)return;
    const ticket=phoneLoad,current=person;
    savingVoiceSettings=true;
    for(const control of phonePanel.querySelectorAll('[data-voice-provider] input,[data-voice-provider] button'))control.disabled=true;
    feedback.textContent='Vérification du compte…';
    try{
      await voiceRequest('settings',{body:{provider:form.dataset.voiceProvider,key:form.dataset.voiceProvider==='azure'?form.elements.region.value.trim().toLowerCase()+':'+field.value.trim():field.value.trim()}});
      if(ticket!==phoneLoad||person!==current||phonePanel.hidden)return;
      feedback.textContent='Compte relié. Aucune conversation n’a été générée pendant cette vérification.';
      await loadPhone(true);
    }catch(error){if(ticket===phoneLoad&&person===current&&!phonePanel.hidden)feedback.textContent=error.message||'La connexion n’a pas pu être enregistrée.';}
    finally{field.value='';savingVoiceSettings=false;for(const control of phonePanel.querySelectorAll('[data-voice-provider] input,[data-voice-provider] button'))control.disabled=false;}
  };
  styleButton.onclick=()=>customize?.();
  function expand(open){
    if(!open&&phoneBusy)voiceSession.pause();
    footer.classList.toggle('thread-folded',!open);threadToggle.setAttribute('aria-expanded',String(open));
    threadToggle.textContent=open?'Réduire':'Ouvrir le dialogue';
  }
  threadToggle.onclick=()=>expand(footer.classList.contains('thread-folded'));
  function appendLine(name,text){const row=document.createElement('p'),label=document.createElement('strong');
    label.textContent=name+' · ';row.append(label,document.createTextNode(text));log.append(row);log.scrollTop=log.scrollHeight;return row;
  }
  const dictee=createDictee({
    onText(text){
      if(!person||!text.trim())return;
      const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;
      const before=input.value.slice(0,start),after=input.value.slice(end);
      const prefix=before&&!/\s$/.test(before)?' ':'',suffix=after&&!/^[\s.,!?]/.test(after)?' ':'';
      const insert=(prefix+text.trim()+suffix).slice(0,Math.max(0,limit-before.length-after.length));
      input.setRangeText(insert,start,end,'end');
      if(insert.trim())dictatedDraft=true;
      buttons();
    },
    onStatus:message=>{micStatus.textContent=message;},
    onKeyboard:()=>{input.focus();},
    onState(state){
      const wasIdle=micState==='idle';micState=state;
      mic.setAttribute('aria-pressed',String(state!=='idle'));
      const label=state==='listening'?'Terminer la dictée':state==='idle'?'Dicter un message':'Annuler la dictée';
      mic.title=label;mic.setAttribute('aria-label',label);
      if(wasIdle!==(state==='idle'))playback.microphone(state!=='idle');
      buttons();
    }
  });
  function closePicker(){
    picker.hidden=true;toggle.setAttribute('aria-expanded','false');
    if(!person)toggle.focus({preventScroll:true});
  }
  function showChoices(){
    const needle=searchName(search.value);
    const matches=people.filter(p=>searchName(p.name).includes(needle));
    const rows=matches.map(p=>{
      const b=document.createElement('button');b.type='button';b.dataset.id=p.id;
      const name=document.createElement('strong'),role=document.createElement('small');
      name.textContent=p.name;role.textContent=p.role;b.append(name,role);return b;
    });
    list.replaceChildren(...rows);
    list.scrollTop=0;
    pickerState.textContent=matches.length?'':'Aucun personnage ne porte ce nom.';
  }
  toggle.onclick=async()=>{
    if(!picker.hidden){dismiss();return;}
    picker.hidden=false;toggle.setAttribute('aria-expanded','true');search.value='';
    pickerState.textContent='Ouverture du répertoire…';
    random.disabled=true;
    try{people=await loadDirectory();if(picker.hidden)return;showChoices();random.disabled=false;}
    catch{pickerState.textContent='Le répertoire est indisponible. Ferme et rouvre les invitations pour réessayer.';}
  };
  function cancelRequest(){request?.abort();request=null;dictee.cancel();}
  function finish(clear=false){
    closePhone();phoneToggle.hidden=publicCall;phoneReady=false;
    onChoice=null;
    version++;if(clear)playback.dispose();else playback.clear();cancelRequest();rail.hidden=true;if(toolbar.parentNode===barSlot)hud.prepend(toolbar);loading=false;random.disabled=false;list.inert=false;
    closePicker();reader.hidden=true;announcement.textContent='';person=null;input.value='';dictatedDraft=false;status.textContent=micStatus.textContent=voiceStatus.textContent='';failedQuestion='';retry.hidden=true;
    own.hidden=other.hidden=footer.hidden=true;toggle.hidden=false;root.host.dispatchEvent(new CustomEvent('salon-companion-change',{detail:{name:''}}));leave();
    if(clear)threads.clear();
  }
  function bubble(node,text){
    node.lineText=text;node.querySelector('.line').textContent=text;node.setAttribute('aria-label',node.querySelector('strong').textContent+' · '+text);node.hidden=!text;
    node.querySelector('span').scrollTop=0;change();
  }
  function buttons(){
    send.disabled=phoneBusy||Boolean(request)||micState!=='idle'||!input.value.trim();
    mic.disabled=phoneBusy;input.disabled=phoneBusy;voiceSwitch.disabled=phoneBusy;retry.disabled=phoneBusy;
    phoneStart.disabled=!person||!phoneReady||Boolean(request)||phoneBusy;
  }
  async function say(question,fromDraft=false,welcome,spoken=fromDraft&&dictatedDraft){
    if(!person||phoneBusy||request||!question||(fromDraft&&micState!=='idle'))return;
    if(dictee.state!=='idle')dictee.cancel();
    const current=person,thread=threads.get(current.id),abort=new AbortController();
    request=abort;const timer=setTimeout(()=>abort.abort(),60000);
    failedQuestion='';retry.hidden=true;
    if(fromDraft){input.value='';dictatedDraft=false;}
    if(spoken){playback.clear();showLine('player',question);}
    else playback.play('player',question,rate('player'));
    const pending=appendLine('Toi',question);bubble(other,'…');status.textContent='';buttons();
    try{
      const answer=welcome||await characterReply(current.id,question,thread,abort.signal);
      if(request!==abort)return;
      appendLine(current.name,answer);thread.push({question,answer});if(thread.length>40)thread.shift();
      playback.play('guest',answer,rate('guest'),true);
    }catch(err){
      if(request!==abort)return;
      pending.remove();bubble(other,'');failedQuestion=question;retryDictated=spoken;retry.hidden=false;
      status.textContent=err.name==='AbortError'||err instanceof TypeError?'Connexion interrompue. Tu peux renvoyer ton message.':err.message;
    }finally{clearTimeout(timer);if(request===abort){request=null;buttons();}}
  }
  async function choose(p){
    if(loading||!p)return;
    closePhone();cancelRequest();playback.clear();phoneToggle.hidden=publicCall;phoneReady=false;
    const ticket=++version;
    // Unlock the ElevenLabs player inside the user's tap; an async
    // 3D avatar download must never cost us the first spoken exchange.
    if(playback.supportsVoice&&!voiceEnabled()){
      voiceSwitch.setAttribute('aria-pressed','true');playback.voice(true);
    }
    loading=true;random.disabled=true;list.inert=true;
    closePicker();toggle.hidden=true;footer.hidden=false;expand(true);log.replaceChildren();styleButton.hidden=true;
    $('.thread-name').textContent='Avec '+p.name;const arrival=$('.arrival-status');arrival.textContent=p.name+' rejoint le salon…';
    setMode('reverse');person=p;other.querySelector('strong').textContent=p.name;root.host.dispatchEvent(new CustomEvent('salon-companion-change',{detail:{name:p.name}}));
    barSlot.prepend(toolbar);rail.hidden=!showSpeech;input.disabled=mic.disabled=false;
    input.setAttribute('aria-label','Ton message à '+p.name);
    const thread=threads.get(p.id)||[];threads.set(p.id,thread);
    if(publicCall){phoneReady=true;phoneToggle.hidden=false;}
    else void loadPhone();
    if(thread.length){for(const line of thread){appendLine('Toi',line.question);appendLine(p.name,line.answer);}turn('guest');const last=thread.at(-1);bubble(own,last.question);bubble(other,last.answer);buttons();}
    try{
      if(!await invite(p))throw Error();if(ticket!==version)return;
      // An invitation is a real user gesture. Enable ElevenLabs voices before
      // the first question, then wait for the 3D avatar to load before speaking.
      if(playback.supportsVoice&&!voiceEnabled()){
        voiceSwitch.setAttribute('aria-pressed','true');playback.voice(true);
      }
      if(!thread.length)void say(opening,false,p.welcome);
      arrival.textContent='';styleButton.hidden=!customize;change();
      const selected=onChoice;onChoice=null;selected?.();
    }catch{if(ticket===version){arrival.textContent='Son portrait 3D est indisponible. Tu peux continuer à lui écrire.';onChoice=null;}}
    finally{if(ticket===version){loading=false;random.disabled=false;list.inert=false;}}
  }
  function dismiss(){onChoice=null;if(loading)finish();else closePicker();}
  $('.picker-close').onclick=dismiss;
  picker.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();dismiss();}});
  search.oninput=showChoices;
  list.onclick=e=>{const id=e.target.closest('button')?.dataset.id;if(id)void choose(people.find(p=>p.id===id));};
  random.onclick=()=>{const others=people.filter(p=>p.id!==person?.id);const pool=others.length?others:people;void choose(pool[Math.floor(Math.random()*pool.length)]);};
  $('.guest-leave').onclick=()=>{finish();toggle.focus({preventScroll:true});};
  input.oninput=e=>{if(!input.value.trim())dictatedDraft=false;else if(e.inputType==='insertFromDictation')dictatedDraft=true;buttons();};
  $('.guest-compose').onsubmit=e=>{e.preventDefault();void say(input.value.trim(),true);};
  send.onpointerdown=e=>{if(root.activeElement===input)e.preventDefault();};
  mic.onclick=()=>{void dictee.toggle();};
  retry.onclick=()=>{if(failedQuestion)void say(failedQuestion,false,undefined,retryDictated);};
  function position(playerOnRight){
    rail.classList.toggle('player-on-right',playerOnRight);
    if(rail.hidden||footer.hidden||!reader.hidden)return;
    for(const node of [own,other]){
      if(node.hidden)continue;
      const body=node.querySelector('span');
      node.querySelector('button').hidden=body.scrollHeight<=body.clientHeight+1;
    }
  }
  return {playback,
    armAhmedVoice(){
      if(!playback.supportsVoice)return false;
      if(!voiceEnabled()){voiceSwitch.setAttribute('aria-pressed','true');playback.voice(true);}
      return true;
    },
    narrateAhmed(text,done=()=>{}){
      if(!text||!this.armAhmedVoice())return false;
      avatarVoiceDone=done;playback.play('player',String(text).slice(0,1500),1);
      return true;
    },
    stopAvatarVoice(){avatarVoiceDone=null;playback.clear();},
    pauseVoice(){if(phoneBusy)voiceSession.pause();},shot(atRest=true){return mode==='reverse'?sequence.frame(now(),atRest):{size:mode,speaker};},chooseCompanion(fn){onChoice=fn;if(picker.hidden)toggle.click()}, get inset(){return rail.hidden?0:rail.offsetHeight+10;}, get mode(){return mode;},get speaker(){return speaker;},manual:()=>setMode('manual'),position,reset:()=>finish(true)};
}
