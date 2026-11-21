import {createDialogue} from './salon-dialogue.js';
import {characterReply,limit} from '../atlas-chat-client.js';
import {searchName} from './salon-encounter.js?v=salon35';

const opening='Asseyons-nous et discutons.';
let directory;
function loadDirectory(){
  return directory??=fetch(new URL('../salon-personnages.json',import.meta.url)).then(async response=>{
    if(!response.ok)throw Error();
    const people=await response.json();
    if(!Array.isArray(people)||!people.length)throw Error();
    return people;
  }).catch(error=>{directory=null;throw error;});
}
export function createSalonChat(root,{invite,leave,change,rate}){
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
      <div class="camera-slot"></div>
      <form class="guest-compose"><input class="guest-message" type="text" placeholder="Ton message…" aria-label="Ton message" maxlength="${limit}" autocomplete="off" enterkeyhint="send">
        <button class="guest-mic" aria-label="Dicter un message" title="Dicter un message" type="button" aria-pressed="false" hidden><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8"/></svg></button>
        <button class="guest-send" type="submit">Envoyer</button>
        <button class="guest-leave" type="button" aria-label="Terminer la conversation" title="Terminer la conversation">Terminer</button></form>
      <p class="chat-state" role="status"></p><span class="speech-announcement" role="status" aria-atomic="true"></span>
    </div>`);
  const picker=$('.guest-picker'),list=$('.guest-list'),search=$('.guest-search'),random=$('.guest-random'),toggle=$('.invite-toggle');
  const pickerState=$('.picker-state'),footer=$('.conversation-footer'),input=$('.guest-message'),send=$('.guest-send'),mic=$('.guest-mic'),status=$('.chat-state');
  const own=$('.own-speech'),other=$('.guest-speech'),reader=$('.speech-reader');
  const rail=$('.speech-rail'),bubbleSwitch=$('.bubbles-toggle'),shots=[...root.querySelectorAll('[data-shot]')];
  const toolbar=$('.bar'),barSlot=$('.camera-slot'),voiceSwitch=$('.voice-toggle');
  let mode='wide',speaker='player',reading,showSpeech=true;
  const nodeFor=who=>who==='player'?own:other,announcement=$('.speech-announcement');
  const playback=createDialogue({
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
  const canSpeak=Boolean(window.speechSynthesis&&window.SpeechSynthesisUtterance);
  voiceSwitch.hidden=!canSpeak;voiceSwitch.title='Lire les répliques à voix haute';
  voiceSwitch.onclick=()=>{
    const enabled=voiceSwitch.getAttribute('aria-pressed')!=='true';
    voiceSwitch.setAttribute('aria-pressed',String(enabled));playback.voice(enabled);
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
  let people=[],person=null,version=0,request=null,recognition=null,loading=false;
  const threads=new Map();
  function stopDictation(){
    if(recognition){const r=recognition;recognition=null;r.abort();}
    mic.setAttribute('aria-pressed','false');
  }
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
  function cancelRequest(){request?.abort();request=null;stopDictation();}
  function finish(clear=false){
    version++;cancelRequest();playback.clear();rail.hidden=true;if(toolbar.parentNode===barSlot)hud.prepend(toolbar);loading=false;random.disabled=false;list.inert=false;
    closePicker();reader.hidden=true;announcement.textContent='';person=null;input.value='';status.textContent='';
    own.hidden=other.hidden=footer.hidden=true;toggle.hidden=false;leave();
    if(clear)threads.clear();
  }
  function bubble(node,text){
    node.lineText=text;node.querySelector('.line').textContent=text;node.setAttribute('aria-label',node.querySelector('strong').textContent+' · '+text);node.hidden=!text;
    node.querySelector('span').scrollTop=0;change();
  }
  function buttons(){
    send.disabled=Boolean(request)||!input.value.trim();input.readOnly=Boolean(request);
    mic.disabled=Boolean(request);
  }
  async function say(question){
    if(!person||request||!question)return;
    stopDictation();
    const current=person,thread=threads.get(current.id),abort=new AbortController();
    request=abort;const timer=setTimeout(()=>abort.abort(),60000);
    playback.play('player',question,rate('player'));bubble(other,'…');input.value='';status.textContent='';buttons();
    try{
      const answer=await characterReply(current.id,question,thread,abort.signal);
      if(request!==abort)return;
      thread.push({question,answer});if(thread.length>40)thread.shift();
      playback.play('guest',answer,rate('guest'),true);
    }catch(err){
      if(request!==abort)return;
      bubble(other,'');input.value=question;
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
      closePicker();toggle.hidden=true;footer.hidden=false;barSlot.append(toolbar);rail.hidden=!showSpeech;
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
  $('.guest-compose').onsubmit=e=>{e.preventDefault();void say(input.value.trim());};
  const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
  mic.hidden=!Speech;
  mic.onclick=()=>{
    if(recognition){recognition.stop();return;}
    if(voiceSwitch.getAttribute('aria-pressed')==='true')voiceSwitch.click();
    try{
      const r=new Speech();recognition=r;r.lang='fr-FR';r.interimResults=false;
      const draft=input.value.trim();
      r.onresult=e=>{if(recognition!==r)return;input.value=[draft,e.results[0][0].transcript.trim()].filter(Boolean).join(' ').slice(0,limit);buttons();};
      r.onerror=e=>{if(recognition===r&&e.error!=='aborted')status.textContent='Dictée indisponible. Tu peux écrire ton message.';};
      r.onend=()=>{if(recognition===r){recognition=null;mic.setAttribute('aria-pressed','false');}};
      status.textContent='';r.start();mic.setAttribute('aria-pressed','true');
    }catch{recognition=null;mic.setAttribute('aria-pressed','false');status.textContent='Le micro est indisponible. Tu peux écrire ton message.';}
  };
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
