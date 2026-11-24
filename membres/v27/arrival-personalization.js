import {createDrawer} from '../studio-drawer.js?v=studio-simple56';
import {loadStudio} from '../studio-model.js?v=salon43';
import {normaliseStudio,referenceStudio} from '../studio-look.js?v=presence49';

const slotFor=gender=>gender==='femme'?'f':'m';
const genderFor=gender=>gender==='femme'?'femme':'homme';

export async function authorRequest(path,data,fetcher=fetch){
 const response=await fetcher('/api/membres/'+path+'?auteur=1',{
  method:data?'POST':'GET',credentials:'same-origin',cache:'no-store',
  headers:data?{'content-type':'application/json'}:undefined,
  body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(20000)
 });
 const result=await response.json();
 if(!response.ok)throw Error(result.error||'La connexion au salon a été interrompue.');
 return result;
}

// Share the actual V27 wardrobe and account storage with the member salon.
// Initialising the editor never replaces the characters shown in the film.
export function createArrivalCharacterEditor({scene,member,load=loadStudio,request=authorRequest,storage=globalThis.localStorage}){
 const states=new Map(),serial={homme:0,femme:0};let selected='homme';
 function stateFor(gender){
  if(!states.has(gender)){
   const original=scene.originalLook?.(slotFor(gender))||referenceStudio(gender);
   const look=normaliseStudio(original,true,undefined,gender);
   const saved=member.salonLooks?.[gender]||(gender===(member.gender||'homme')?member.studio:null);
   states.set(gender,{look,original:look,saved:saved?normaliseStudio(saved,true,undefined,gender):null});
  }
  return states.get(gender);
 }
 async function apply(look,gender=selected){
  gender=genderFor(gender);const state=stateFor(gender),version=++serial[gender];
  const next=normaliseStudio(look,true,undefined,gender);state.look=next;
  const figure=await load(next,gender);
  if(version!==serial[gender])return false;
  return scene.dress(slotFor(gender),figure,gender,()=>version===serial[gender]);
 }
 function settings(gender=selected){
  const state=stateFor(gender);
  return {gender,plus:true,savedStudio:state.saved||state.original,
   privateURL:member.author?'/membre-atelier.html?auteur='+encodeURIComponent(member.author):'',
   change:look=>{state.look=look;},
   save:async look=>{
    const result=await request('salon-appearance',{gender,studio:look});
    if(result.gender!==gender||!result.studio)throw Error('L’enregistrement du personnage reste à confirmer.');
    state.saved=normaliseStudio(result.studio,true,undefined,gender);
    (member.salonLooks??={})[gender]=state.saved;
    if(gender===(member.gender||'homme'))member.studio=state.saved;
    try{storage?.setItem('salon-v27-look:'+member.id+(gender===(member.gender||'homme')?'':':'+gender),'1');}catch{}
   }
  };
 }
 return {
  get gender(){return selected},get slot(){return slotFor(selected)},get state(){return stateFor(selected)},
  select(gender){selected=genderFor(gender);scene.setGender(selected);return stateFor(selected)},
  apply,settings,
  reset(){++serial[selected];scene.reset(slotFor(selected));const state=stateFor(selected);state.look=state.original;return state.look;}
 };
}

export function mountArrivalPersonalization({doc=document,win=window,request=authorRequest}={}){
 if(new URLSearchParams(win.location.search).get('arrival')!=='cinema'||doc.getElementById('arrival-options'))return;
 const button=doc.createElement('button');button.id='arrival-options';button.type='button';
 button.className='options-toggle';button.textContent='Personnaliser';button.disabled=true;
 button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','arrival-personalization');
 const status=doc.createElement('span');status.id='arrival-options-status';status.setAttribute('role','status');
 const controls=doc.querySelector('.top .controls');controls.prepend(button);controls.append(status);
 const host=doc.createElement('aside');host.id='arrival-personalization';host.hidden=true;host.setAttribute('aria-label','Personnaliser les personnages');
 const root=host.attachShadow({mode:'open'});
 root.innerHTML='<link rel="stylesheet" href="/membres/salon.css?v=studio-simple53"><style>:host{height:100%;min-height:0}.studio-drawer{height:100%;overflow:hidden}.studio-drawer header select{width:auto;max-width:42%;font-size:13px}.restore-original{margin:5px 10px}.portrait-note{margin:4px 10px 8px;font-size:12px;line-height:1.35;color:#52644e}.studio-drawer .switch,.studio-drawer header,.studio-drawer footer{flex:none}.studio-scroll{scrollbar-gutter:stable}</style><div class="studio-drawer" hidden></div>';
 doc.getElementById('app').append(host);
 let drawer,editor,task,characterTools;
 const drawerRoot={querySelector:selector=>selector==='.options-toggle'?button:root.querySelector(selector)};
 const focus=mode=>win.salonV27?.focus(mode,editor?.slot||'m');
 const attachTools=()=>{if(characterTools)root.querySelector('.studio-scroll').prepend(characterTools);};
 function configure(){
  drawer.configure(editor.state.look,editor.settings());
  attachTools();
  const selector=root.querySelector('.character-choice');if(selector)selector.value=editor.gender;
  const saved=root.querySelector('.restore-saved');if(saved)saved.hidden=!editor.state.saved;
  const note=root.querySelector('.portrait-note');if(note)note.hidden=editor.gender!=='homme';
 }
 async function initialize(){
  if(task)return task;button.disabled=true;status.textContent='';
  task=(async()=>{
   try{
    const member=await request('me');if(!member.author)throw Error('Rouvre ce salon depuis ton administration.');
    const scene=win.salonV27;if(!scene)throw Error('Le salon se prépare encore.');
    editor=createArrivalCharacterEditor({scene,member,request});editor.select('homme');
    drawer=createDrawer(drawerRoot,look=>editor.apply(look),focus,()=>scene.departure(),open=>{
     attachTools();
     host.hidden=!open;doc.body.classList.toggle('editing-duo',open);doc.body.classList.toggle('editing-arrival',open);
     if(open){scene.camera('manual');win.requestAnimationFrame(()=>{if(!host.hidden)focus('Visage');});}
     else button.focus({preventScroll:true});
    });
    const heading=root.querySelector('.studio-drawer header'),choice=doc.createElement('select');
    choice.className='character-choice';choice.setAttribute('aria-label','Personnage à personnaliser');
    for(const [gender,label] of [['homme','Ahmed'],['femme','Marianne']]){const option=doc.createElement('option');option.value=gender;option.textContent=label;choice.append(option);}
    choice.onchange=()=>{editor.select(choice.value);configure();focus('Visage');};heading.querySelector('.close').before(choice);
    const original=doc.createElement('button');original.type='button';original.className='restore-original';original.textContent='Reprendre le personnage d’origine';
    original.onclick=()=>{editor.reset();configure();focus('Visage');};
    const saved=doc.createElement('button');saved.type='button';saved.className='restore-original restore-saved';saved.textContent='Porter l’apparence enregistrée';
    saved.onclick=async()=>{saved.disabled=true;try{if(await editor.apply(editor.state.saved)){configure();focus('Visage');}}catch(e){status.textContent=e.message;}finally{saved.disabled=false;}};
    const note=doc.createElement('p');note.className='portrait-note';note.textContent='Les tenues gardent le visage d’Ahmed. Les réglages du personnage créent une nouvelle apparence. Tu peux toujours reprendre Ahmed d’origine.';
    characterTools=doc.createElement('section');characterTools.className='character-tools';characterTools.setAttribute('aria-label','Apparence d’origine et enregistrée');characterTools.append(original,saved,note);
    win.addEventListener('salon-role-change',event=>{editor.select(event.detail);configure();if(!host.hidden)focus('Visage');});
    configure();button.disabled=false;
   }catch(error){status.textContent=error.message;button.disabled=false;button.onclick=()=>{task=null;void initialize();};}
  })();return task;
 }
 host.addEventListener('keydown',event=>{if(event.key==='Escape')drawer?.toggle(false);event.stopPropagation();});
 const ready=()=>void initialize();
 if(doc.body.classList.contains('ready'))ready();else win.addEventListener('salon-ready',ready,{once:true});
}

if(typeof window!=='undefined')mountArrivalPersonalization();
