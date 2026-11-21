import {createDialogue} from './salon-dialogue.js?v=salon36';
import {createDictee} from './salon-dictee.js';
import {characterReply,limit} from '../atlas-chat-client.js';
import {searchName} from './salon-encounter.js?v=salon36';

const opening='Asseyons-nous et discutons.';
let directory;
function loadDirectory(){
  return directory??=fetch(new URL('../salon-personnages.json?v=salon36',import.meta.url)).then(async response=>{
    if(!response.ok)throw Error();
    const people=await response.json();
    if(!Array.isArray(people)||!people.length)throw Error();
    return people;
  }).catch(error=>{directory=null;throw error;});
}
export function createSalonChat(root,{invite,leave,change,rate,gender}){
  const $=s=>root.querySelector(s),scene=$('.scene-viewport'),hud=$('.hud');
  hud.insertAdjacentHTML('beforeend','<button class="invite-toggle" type="button" aria-expanded="false" aria-controls="guest-picker">Inviter un personnage</button>');
  scene.insertAdjacentHTML('beforeend',`
    <section class="guest-picker" id="guest-picker" aria-label="Inviter un personnage du livre" hidden>
      <header><strong>Inviter un personnage</strong><button class="picker-close" type="button" aria-label="Fermer les invitations">×</button></header>
      <label>Nom du personnage<input type="search" class="guest-search" placeholder="Rechercher un nom…" autocomplete="off"></label>
      <button type="button" class="guest-random">Inviter au hasard</button>
      <small>Dialogue imaginé d’après le livre. Les traits non décrits sont interprétés.</small>
      <div class="guest-list"></div><p class="picker-state" role="status"></p>
    </section>
      <div class="speech-rail" id="salon-bulles" hidden>
        <div class="speech own-speech" role="group" hidden><strong>Toi</strong><span class="line" aria-hidden="true"></span><button type="button" hidden>Lire la suite</button></div>
        <div class="speech guest-speech" role="group" hidden><strong></strong><span class="line" aria-hidden="true"></span><button type="button" hidden>Lire la suite</button></div>
        <section class="speech-reader" aria-label="Message complet" hidden><header><strong></strong><button type="button" aria-label="Fermer le message">×</button></header><p></p></section>
      </div>
    `);
  $('.stage').insertAdjacentHTML('beforeend',`
    <div class="conversation-footer" hidden>
      <div class="conversation-tools" role="group" aria-label="Vues de la conversation">
        <button type="button" data-shot="wide" aria-pressed="true">Vue large</button>
        <button type="button" data-shot="reverse" aria-pressed="false">Champ / contrechamp</button>
        <button type="button" class="voice-toggle" aria-pressed="false" hidden>Voix</button>
        <button type="button" class="bubbles-toggle" aria-controls="salon-bulles" aria-pressed="true">Bulles</button>
      </div>
      <div class="camera-slot"><button class="guest-leave" type="button" aria-label="Terminer la conversation">Terminer</button></div>
      <form class="guest-compose"><input class="guest-message" type="text" inputmode="text" autocapitalize="sentences" spellcheck="true" placeholder="Écris ton message…" aria-label="Ton message" maxlength="${limit}" autocomplete="off" enterkeyhint="send">
        <button class="guest-mic" aria-label="Dicter un message" title="Dicter un message" type="button" aria-pressed="false"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8"/></svg></button>
        <button class="guest-send" type="submit">Envoyer</button></form>
      <div class="chat-feedback"><p class="chat-state" role="status"></p><button class="retry-message" type="button" hidden>Réessayer l’envoi</button></div>
      <p class="dictation-state" role="status"></p><p class="voice-state" role="status"></p><span class="speech-announcement" role="status" aria-atomic="true"></span>
    </div>`);
  const picker=$('.guest-picker'),list=$('.guest-list'),search=$('.guest-search'),random=$('.guest-random'),toggle=$('.invite-toggle');
  const pickerState=$('.picker-state'),footer=$('.conversation-footer'),input=$('.guest-message'),send=$('.guest-send'),mic=$('.guest-mic'),status=$('.chat-state');
  const own=$('.own-speech'),other=$('.guest-speech'),reader=$('.speech-reader');
  const rail=$('.speech-rail'),bubbleSwitch=$('.bubbles-toggle'),shots=[...root.querySelectorAll('[data-shot]')];
  const toolbar=$('.bar'),barSlot=$('.camera-slot'),voiceSwitch=$('.voice-toggle');
  let mode='wide',speaker='player',reading,showSpeech=true;
  const nodeFor=who=>who==='player'?own:other,announcement=$('.speech-announcement');
  const voiceStatus=$('.voice-state'),micStatus=$('.dictation-state'),retry=$('.retry-message');
  let micState='idle',failedQuestion='';
  const voiceEnabled=()=>voiceSwitch.getAttribute('aria-pressed')==='true';
  const playback=createDialogue({
    gender,
    voiceStatus:message=>{voiceStatus.textContent=message;},
    start(who,text){
      const node=nodeFor(who);turn(who);bubble(node,text);
      announcement.textContent=node.getAttribute('aria-label');
    },
    word(who,w){
      if(!w)return;
      const node=nodeFor(who),span=node.querySelector('.line'),text=node.lineText;
      if(!text||rail.hidden)return;
      span.replaceChildren(document.createTextNode(text.slice(0,w.index)));
      const mark=document.createElement('mark');mark.textContent=text.slice(w.index,w.index+w.length);
      span.append(mark,document.createTextNode(text.slice(w.index+w.length)));
      span.scrollTop=Math.max(0,mark.offsetTop-span.offsetTop-span.clientHeight+mark.offsetHeight);
    },
    rest(who){const node=nodeFor(who),span=node.querySelector('.line');span.textContent=node.lineText||'';span.scrollTop=0;},
    wake:change
  });
  voiceSwitch.hidden=!playback.supportsVoice;voiceSwitch.title='Écouter les répliques en français';
  voiceSwitch.onclick=()=>{
    const enabled=!voiceEnabled();
    if(enabled&&micState!=='idle')dictee.cancel();
    voiceSwitch.setAttribute('aria-pressed',String(enabled));playback.voice(enabled);
    if(enabled&&!playback.busy&&other.lineText&&other.lineText!=='…')playback.play('guest',other.lineText,rate('guest'));
  };
  function setMode(value){
    mode=value;for(const button of shots)button.setAttribute('aria-pressed',String(button.dataset.shot===mode));
  }
  for(const button of shots)button.onclick=()=>{setMode(button.dataset.shot);change();};
  function turn(who){speaker=who;change();}
  function showBubbles(show){
    reader.hidden=true;showSpeech=show;rail.hidden=!person||!show;
    bubbleSwitch.setAttribute('aria-pressed',String(show));
    bubbleSwitch.title=show?'Masquer les bulles':'Afficher les bulles';
    change();
  }
  bubbleSwitch.title='Masquer les bulles';
  bubbleSwitch.onclick=()=>showBubbles(rail.hidden);
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
  let people=[],person=null,version=0,request=null,loading=false;
  const threads=new Map();
  const dictee=createDictee({
    onText(text){
      if(!person||!text.trim())return;
      const start=input.selectionStart??input.value.length,end=input.selectionEnd??start;
      const before=input.value.slice(0,start),after=input.value.slice(end);
      const prefix=before&&!/\s$/.test(before)?' ':'',suffix=after&&!/^[\s.,!?]/.test(after)?' ':'';
      const insert=(prefix+text.trim()+suffix).slice(0,Math.max(0,limit-before.length-after.length));
      input.setRangeText(insert,start,end,'end');buttons();
    },
    onStatus:message=>{micStatus.textContent=message;},
    onKeyboard:()=>{input.focus();},
    onState(state){
      const wasIdle=micState==='idle';micState=state;
      mic.setAttribute('aria-pressed',String(state!=='idle'));
      const label=state==='listening'?'Terminer la dictée':state==='idle'?'Dicter un message':'Annuler la dictée';
      mic.title=label;mic.setAttribute('aria-label',label);
      if(wasIdle!==(state==='idle')&&voiceEnabled())playback.voice(state==='idle',{temporary:true});
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
    pickerState.textContent=matches.length?'':'Aucun personnage ne porte ce nom.';
  }
  toggle.onclick=async()=>{
    if(!picker.hidden){dismiss();return;}
    picker.hidden=false;toggle.setAttribute('aria-expanded','true');search.value='';
    search.focus({preventScroll:true});pickerState.textContent='Ouverture du répertoire…';
    random.disabled=true;
    try{people=await loadDirectory();if(picker.hidden)return;showChoices();random.disabled=false;}
    catch{pickerState.textContent='Le répertoire est indisponible. Ferme et rouvre les invitations pour réessayer.';}
  };
  function cancelRequest(){request?.abort();request=null;dictee.cancel();}
  function finish(clear=false){
    version++;if(clear)playback.dispose();else playback.clear();cancelRequest();rail.hidden=true;if(toolbar.parentNode===barSlot)hud.prepend(toolbar);loading=false;random.disabled=false;list.inert=false;
    closePicker();reader.hidden=true;announcement.textContent='';person=null;input.value='';status.textContent=micStatus.textContent=voiceStatus.textContent='';failedQuestion='';retry.hidden=true;
    own.hidden=other.hidden=footer.hidden=true;toggle.hidden=false;leave();
    if(clear)threads.clear();
  }
  function bubble(node,text){
    node.lineText=text;node.querySelector('.line').textContent=text;node.setAttribute('aria-label',node.querySelector('strong').textContent+' · '+text);node.hidden=!text;
    node.querySelector('span').scrollTop=0;change();
  }
  function buttons(){
    send.disabled=Boolean(request)||!input.value.trim();
  }
  async function say(question,fromDraft=false){
    if(!person||request||!question)return;
    if(dictee.state!=='idle')dictee.cancel();
    const current=person,thread=threads.get(current.id),abort=new AbortController();
    request=abort;const timer=setTimeout(()=>abort.abort(),60000);
    failedQuestion='';retry.hidden=true;
    if(fromDraft)input.value='';
    playback.play('player',question,rate('player'));bubble(other,'…');status.textContent='';buttons();
    try{
      const answer=await characterReply(current.id,question,thread,abort.signal);
      if(request!==abort)return;
      thread.push({question,answer});if(thread.length>40)thread.shift();
      playback.play('guest',answer,rate('guest'),true);
    }catch(err){
      if(request!==abort)return;
      bubble(other,'');failedQuestion=question;retry.hidden=false;
      status.textContent=err.name==='AbortError'||err instanceof TypeError?'Connexion interrompue. Tu peux renvoyer ton message.':err.message;
    }finally{clearTimeout(timer);if(request===abort){request=null;buttons();}}
  }
  async function choose(p){
    if(loading||!p)return;
    const ticket=++version;
    loading=true;random.disabled=true;list.inert=true;pickerState.textContent='Arrivée de '+p.name+'…';
    try{
      if(!await invite(p)||ticket!==version)return;
      setMode('wide');person=p;other.querySelector('strong').textContent=p.name;
      closePicker();toggle.hidden=true;footer.hidden=false;barSlot.prepend(toolbar);rail.hidden=!showSpeech;
      input.setAttribute('aria-label','Ton message à '+p.name);
      const thread=threads.get(p.id)||[];threads.set(p.id,thread);
      if(thread.length){turn('guest');const last=thread.at(-1);bubble(own,last.question);bubble(other,last.answer);buttons();}
      else void say(opening);
    }catch{if(ticket===version)pickerState.textContent='Le personnage n’a pas pu entrer. Tu peux réessayer.';}
    finally{if(ticket===version){loading=false;random.disabled=false;list.inert=false;}}
  }
  function dismiss(){if(loading)finish();else closePicker();}
  $('.picker-close').onclick=dismiss;
  picker.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();dismiss();}});
  search.oninput=showChoices;
  list.onclick=e=>{const id=e.target.closest('button')?.dataset.id;if(id)void choose(people.find(p=>p.id===id));};
  random.onclick=()=>void choose(people[Math.floor(Math.random()*people.length)]);
  $('.guest-leave').onclick=()=>{finish();toggle.focus({preventScroll:true});};
  input.oninput=buttons;
  $('.guest-compose').onsubmit=e=>{e.preventDefault();void say(input.value.trim(),true);};
  send.onpointerdown=e=>{if(root.activeElement===input)e.preventDefault();};
  mic.onclick=()=>{void dictee.toggle();};
  retry.onclick=()=>{if(failedQuestion)void say(failedQuestion);};
  function position(playerOnRight){
    rail.classList.toggle('player-on-right',playerOnRight);
    if(rail.hidden||footer.hidden||!reader.hidden)return;
    for(const node of [own,other]){
      if(node.hidden)continue;
      const body=node.querySelector('span');
      node.querySelector('button').hidden=body.scrollHeight<=body.clientHeight+1;
    }
  }
  return {playback, get inset(){return rail.hidden?0:rail.offsetHeight+10;}, get mode(){return mode;},get speaker(){return speaker;},manual:()=>setMode('manual'),position,reset:()=>finish(true)};
}
