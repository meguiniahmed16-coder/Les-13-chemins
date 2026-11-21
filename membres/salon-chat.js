import {characterReply,limit} from '../atlas-chat-client.js';
import {searchName} from './salon-encounter.js';

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
export function createSalonChat(root,{invite,leave}){
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
    <div class="speech own-speech" role="status" hidden><strong>Toi</strong><span></span><button type="button" hidden>Lire la suite</button></div>
    <div class="speech guest-speech" role="status" hidden><strong></strong><span></span><button type="button" hidden>Lire la suite</button></div>
    <section class="speech-reader" aria-label="Message complet" hidden><header><strong></strong><button type="button" aria-label="Fermer le message">×</button></header><p></p></section>`);
  $('.stage').insertAdjacentHTML('beforeend',`
    <div class="conversation-footer" hidden>
      <form class="guest-compose"><input class="guest-message" type="text" placeholder="Ton message…" aria-label="Ton message" maxlength="${limit}" autocomplete="off" enterkeyhint="send">
        <button class="guest-mic" aria-label="Dicter un message" title="Dicter un message" type="button" aria-pressed="false" hidden><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8"/></svg></button>
        <button class="guest-send" type="submit">Envoyer</button>
        <button class="guest-leave" type="button" aria-label="Terminer la conversation" title="Terminer la conversation">Terminer</button></form>
      <p class="chat-state" role="status"></p>
    </div>`);
  const picker=$('.guest-picker'),list=$('.guest-list'),search=$('.guest-search'),random=$('.guest-random'),toggle=$('.invite-toggle');
  const pickerState=$('.picker-state'),footer=$('.conversation-footer'),input=$('.guest-message'),send=$('.guest-send'),mic=$('.guest-mic'),status=$('.chat-state');
  const own=$('.own-speech'),other=$('.guest-speech'),reader=$('.speech-reader');
  let reading;
  for(const node of [own,other])node.querySelector('button').onclick=()=>{
    reading=node;reader.querySelector('strong').textContent=node.querySelector('strong').textContent;
    reader.querySelector('p').textContent=node.querySelector('span').textContent;reader.hidden=false;
    reader.querySelector('button').focus({preventScroll:true});
  };
  function closeReader(){reader.hidden=true;reading?.querySelector('button').focus({preventScroll:true});}
  reader.querySelector('button').onclick=closeReader;
  reader.onkeydown=e=>{if(e.key==='Escape'){e.stopPropagation();closeReader();}};
  let people=[],person=null,version=0,request=null,recognition=null,loading=false,lastPoints;
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
    version++;cancelRequest();loading=false;random.disabled=false;list.inert=false;
    closePicker();reader.hidden=true;person=null;lastPoints=null;input.value='';status.textContent='';
    own.hidden=other.hidden=footer.hidden=true;toggle.hidden=false;leave();
    if(clear)threads.clear();
  }
  function bubble(node,text){
    node.querySelector('span').textContent=text;node.hidden=!text;
    node.scrollTop=0;if(lastPoints)position(...lastPoints);
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
    bubble(own,question);bubble(other,'…');input.value='';status.textContent='';buttons();
    try{
      const answer=await characterReply(current.id,question,thread,abort.signal);
      if(request!==abort)return;
      thread.push({question,answer});if(thread.length>40)thread.shift();
      bubble(other,answer);
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
      person=p;other.querySelector('strong').textContent=p.name;
      closePicker();toggle.hidden=true;footer.hidden=false;
      input.setAttribute('aria-label','Ton message à '+p.name);
      const thread=threads.get(p.id)||[];threads.set(p.id,thread);
      if(thread.length){const last=thread.at(-1);bubble(own,last.question);bubble(other,last.answer);buttons();}
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
    try{
      const r=new Speech();recognition=r;r.lang='fr-FR';r.interimResults=false;
      const draft=input.value.trim();
      r.onresult=e=>{if(recognition!==r)return;input.value=[draft,e.results[0][0].transcript.trim()].filter(Boolean).join(' ').slice(0,limit);buttons();};
      r.onerror=e=>{if(recognition===r&&e.error!=='aborted')status.textContent='Dictée indisponible. Tu peux écrire ton message.';};
      r.onend=()=>{if(recognition===r){recognition=null;mic.setAttribute('aria-pressed','false');}};
      status.textContent='';r.start();mic.setAttribute('aria-pressed','true');
    }catch{recognition=null;mic.setAttribute('aria-pressed','false');status.textContent='Le micro est indisponible. Tu peux écrire ton message.';}
  };
  function position(a,b,w,h){
    lastPoints=[a,b,w,h];if(!w||!h||!person)return;
    const margin=6;
    const centers=[a,b].map((pt,i)=>{
      const node=i?other:own,half=node.offsetWidth/2;
      return Math.max(half+margin,Math.min(w-half-margin,pt.x));
    });
    if(!own.hidden&&!other.hidden){
      const left=a.x<=b.x?0:1,right=1-left;
      const widths=[own.offsetWidth,other.offsetWidth],mid=(centers[0]+centers[1])/2;
      if(centers[right]-centers[left]<(widths[0]+widths[1])/2+margin){
        centers[left]=Math.max(margin+widths[left]/2,mid-(widths[left]+margin)/2);
        centers[right]=Math.min(w-margin-widths[right]/2,centers[left]+(widths[left]+widths[right])/2+margin);
        centers[left]=Math.min(centers[left],centers[right]-(widths[left]+widths[right])/2-margin);
      }
    }
    for(const [i,node] of [own,other].entries()){
      if(node.hidden)continue;
      const pt=i?b:a,body=node.querySelector('span'),read=node.querySelector('button');
      read.hidden=body.scrollHeight<=body.clientHeight+1;
      const y=Math.min(h-12,Math.max(node.offsetHeight+51,pt.y-4));
      node.style.left=centers[i]+'px';node.style.top=y+'px';
      node.style.setProperty('--tail',Math.max(10,Math.min(node.offsetWidth-10,node.offsetWidth/2+pt.x-centers[i]))+'px');
    }
  }
  return {position,reset:()=>finish(true)};
}
