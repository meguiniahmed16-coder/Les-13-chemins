import {createDrawer} from '../studio-drawer.js?v=incarnations33';
import {loadStudio} from '../studio-model.js?v=incarnations33';
import {normaliseStudio,referenceStudio} from '../studio-look.js?v=incarnations33';
import {incarnationsURLFor} from '../incarnations-dialog.js?v=incarnations33';

const slotFor=gender=>gender==='femme'?'f':'m';
const genderFor=gender=>gender==='femme'?'femme':'homme';
const outfitKey=look=>JSON.stringify([Object.entries(look.outfit).sort(([a],[b])=>a.localeCompare(b)),look.denim,look.tortoise]);

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
   const look=normaliseStudio(original,true,undefined,gender,{owner:Boolean(member.author)});
   const saved=member.salonLooks?.[gender]||(gender===(member.gender||'homme')?member.studio:null);
   states.set(gender,{look,original:look,saved:saved?normaliseStudio(saved,true,undefined,gender,{owner:Boolean(member.author)}):null,inspection:false,inspectionOutfit:null});
  }
  return states.get(gender);
 }
 async function render(look,gender,inspection=false,revalidate=false){
  gender=genderFor(gender);const state=stateFor(gender),version=++serial[gender];
  const next=normaliseStudio(look,true,undefined,gender,{owner:Boolean(member.author)});
  if(inspection){
   if(!member.author)throw Error('L’atelier ADMIN est réservé à ton compte auteur.');
   if(next.face.age===5)throw Error('L’inspection du corps est réservée aux modèles adultes.');
   if(revalidate){
    const confirmed=await request('me');
    if(!confirmed.author||String(confirmed.id)!==String(member.id))throw Error('Rouvre l’atelier depuis ton compte auteur.');
    if(version!==serial[gender])return false;
   }
  }
  // Inspection is a temporary rendering mode. The editable/saved look keeps
  // its complete outfit, and the loader separately verifies the author session.
  const visibleLook=inspection?normaliseStudio({...next,outfit:{}},true,undefined,gender,{inspection:true,owner:Boolean(member.author)}):next;
  const figure=await load(visibleLook,gender,inspection?{inspection:true}:undefined);
  if(inspection&&figure.inspection!==true)throw Error('L’inspection du corps n’a pas pu être confirmée.');
  if(version!==serial[gender])return false;
  if(inspection&&!state.inspection&&scene.prepareInspection?.(slotFor(gender))!==true)throw Error('Le personnage n’a pas pu rejoindre l’espace d’inspection.');
  const applied=await scene.dress(slotFor(gender),figure,gender,()=>version===serial[gender]);
  if(applied===false||version!==serial[gender])return false;
  state.look=next;state.inspection=inspection;state.inspectionOutfit=inspection?outfitKey(next):null;
  return applied;
 }
 function apply(look,gender=selected){
  gender=genderFor(gender);const state=stateFor(gender),next=normaliseStudio(look,true,undefined,gender,{owner:Boolean(member.author)});
  // Body adjustments remain inspectable. Choosing clothing, or a child body,
  // leaves inspection and renders a complete clothed figure before switching.
  const inspection=state.inspection&&next.face.age!==5&&outfitKey(next)===state.inspectionOutfit;
  return render(next,gender,inspection);
 }
 function inspect(enabled,gender=selected){
  gender=genderFor(gender);const state=stateFor(gender);
  enabled=enabled??!state.inspection;
  return render(state.look,gender,enabled,enabled);
 }
 function settings(gender=selected){
  const state=stateFor(gender);
  return {gender,plus:true,owner:Boolean(member.author),savedStudio:state.saved||state.original,inspection:state.inspection,
   incarnationsURL:incarnationsURLFor({authenticated:true,temporary:member.temporary,memberKey:member.id}),
   privateURL:member.author?'/membre-atelier.html?auteur='+encodeURIComponent(member.author):'',
   removeClothes:member.author?()=>inspect(undefined,gender):undefined,
   change:look=>{state.look=look;},
   save:async look=>{
    const studio=normaliseStudio(state.inspection?state.look:look,true,undefined,gender,{owner:Boolean(member.author)});
    const result=await request('salon-appearance',{gender,studio});
    if(result.gender!==gender||!result.studio)throw Error('L’enregistrement du personnage reste à confirmer.');
    state.saved=normaliseStudio(result.studio,true,undefined,gender,{owner:Boolean(member.author)});
    (member.salonLooks??={})[gender]=state.saved;
    if(gender===(member.gender||'homme'))member.studio=state.saved;
    try{storage?.setItem('salon-v27-look:'+member.id+(gender===(member.gender||'homme')?'':':'+gender),'1');}catch{}
   }
  };
 }
 return {
  get gender(){return selected},get slot(){return slotFor(selected)},get state(){return stateFor(selected)},
  get author(){return Boolean(member.author)},
  select(gender){selected=genderFor(gender);scene.setGender(selected);return stateFor(selected)},
  apply,inspect,settings,
  restoreSaved(gender=selected){gender=genderFor(gender);const state=stateFor(gender);return state.saved?render(state.saved,gender,false):Promise.resolve(false);},
  reset(){++serial[selected];scene.reset(slotFor(selected));const state=stateFor(selected);state.look=state.original;state.inspection=false;state.inspectionOutfit=null;return state.look;}
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
 root.innerHTML='<link rel="stylesheet" href="/membres/salon.css?v=incarnations33"><style>:host{height:100%;min-height:0}.studio-drawer{height:100%;overflow:hidden}.studio-drawer header select{width:auto;max-width:42%;font-size:13px}.restore-original{margin:5px 10px}.portrait-note{margin:4px 10px 8px;font-size:12px;line-height:1.35;color:#52644e}.admin-inspection{margin:8px 10px;padding:10px;border:1px solid #c6c7a8;border-radius:8px;background:#f4efd9}.admin-inspection strong{display:block;font-size:13px}.admin-inspection p{margin:7px 0;font-size:12px;line-height:1.4}.admin-inspection button{margin:3px 4px 3px 0}.studio-drawer .switch,.studio-drawer header,.studio-drawer footer{flex:none}.studio-scroll{scrollbar-gutter:stable}</style><div class="studio-drawer" hidden></div>';
 doc.getElementById('app').append(host);
 let drawer,editor,task,characterTools,inspectionBusy=false;
 const drawerRoot={querySelector:selector=>selector==='.options-toggle'?button:root.querySelector(selector)};
 const focus=mode=>win.salonV27?.focus(mode,editor?.slot||'m');
 const attachTools=()=>{if(characterTools)root.querySelector('.studio-scroll').prepend(characterTools);};
 function syncTools(){
  const selector=root.querySelector('.character-choice');if(selector)selector.value=editor.gender;
  const saved=root.querySelector('.restore-saved');if(saved)saved.hidden=!editor.state.saved;
  const note=root.querySelector('.portrait-note');if(note)note.hidden=editor.gender!=='homme';
  const title=root.querySelector('.admin-inspection strong');if(title)title.textContent='ADMIN · Atelier '+(editor.gender==='femme'?'de Marianne':'d’Ahmed Marie');
  const remove=root.querySelector('.inspect-body');if(remove){remove.disabled=inspectionBusy||editor.state.inspection||editor.state.look.face.age===5;remove.title=editor.state.look.face.age===5?'Disponible pour les modèles adultes.':'';}
  const restore=root.querySelector('.restore-clothes');if(restore)restore.disabled=inspectionBusy||!editor.state.inspection;
  const state=root.querySelector('.inspection-state');if(state)state.textContent=editor.state.inspection?'Inspection du corps en cours. La tenue reste mémorisée.':'Retrait temporaire pour vérifier le corps et ses articulations. La tenue enregistrée est conservée.';
 }
 function configure(){
  const settings=editor.settings();
  if(settings.removeClothes)settings.removeClothes=()=>changeInspection(undefined,settings.gender);
  drawer.configure(editor.state.look,settings);attachTools();syncTools();
 }
 async function changeInspection(enabled,gender=editor.gender){
  if(inspectionBusy)return false;inspectionBusy=true;status.textContent='';configure();
  try{
   const applied=await editor.inspect(enabled,gender);
   if(applied!==false&&editor.gender===gender)focus('Corps');
   return applied;
  }catch(error){status.textContent=error.message;return false;}
  finally{inspectionBusy=false;configure();}
 }
 async function initialize(){
  if(task)return task;button.disabled=true;status.textContent='';
  task=(async()=>{
   try{
    win.salonArrival?.personalization('loading');
    const member=await request('me');if(!member.author)throw Error('Rouvre ce salon depuis ton administration.');
    const scene=win.salonV27;if(!scene)throw Error('Le salon se prépare encore.');
    editor=createArrivalCharacterEditor({scene,member,request});editor.select('homme');
    drawer=createDrawer(drawerRoot,async look=>{
     const gender=editor.gender,inspection=editor.state.inspection,applied=await editor.apply(look,gender);
     if(applied!==false&&editor.gender===gender){if(inspection!==editor.state.inspection)configure();else syncTools();}
     return applied;
    },focus,()=>scene.departure(),open=>{
     attachTools();
     host.hidden=!open;doc.body.classList.toggle('editing-duo',open);doc.body.classList.toggle('editing-arrival',open);
     if(open){scene.camera('manual');win.requestAnimationFrame(()=>{if(!host.hidden)focus('Visage');});}
     else button.focus({preventScroll:true});
    });
    const heading=root.querySelector('.studio-drawer header'),choice=doc.createElement('select');
    choice.className='character-choice';choice.setAttribute('aria-label','Personnage à personnaliser');
    for(const [gender,label] of [['homme','Ahmed Marie'],['femme','Marianne']]){const option=doc.createElement('option');option.value=gender;option.textContent=label;choice.append(option);}
    choice.onchange=()=>{editor.select(choice.value);configure();focus('Visage');};heading.querySelector('.close').before(choice);
    const original=doc.createElement('button');original.type='button';original.className='restore-original';original.textContent='Reprendre le personnage d’origine';
    original.onclick=()=>{editor.reset();configure();focus('Visage');};
    const saved=doc.createElement('button');saved.type='button';saved.className='restore-original restore-saved';saved.textContent='Porter l’apparence enregistrée';
    saved.onclick=async()=>{saved.disabled=true;try{if(await editor.restoreSaved()){configure();focus('Visage');}}catch(e){status.textContent=e.message;}finally{saved.disabled=false;}};
    const note=doc.createElement('p');note.className='portrait-note';note.textContent='Les tenues gardent le visage d’Ahmed Marie. Les réglages du personnage créent une nouvelle apparence. Tu peux toujours reprendre Ahmed Marie d’origine.';
    characterTools=doc.createElement('section');characterTools.className='character-tools';characterTools.setAttribute('aria-label','Apparence d’origine et enregistrée');characterTools.append(original,saved,note);
    if(editor.author){
     const admin=doc.createElement('section');admin.className='admin-inspection';admin.setAttribute('aria-label','Atelier ADMIN du corps');
     const title=doc.createElement('strong'),info=doc.createElement('p');info.className='inspection-state';
     const remove=doc.createElement('button');remove.type='button';remove.className='inspect-body';remove.textContent='Retirer les vêtements';remove.onclick=()=>changeInspection(true);
     const restore=doc.createElement('button');restore.type='button';restore.className='restore-clothes';restore.textContent='Remettre les vêtements';restore.onclick=()=>changeInspection(false);
     admin.append(title,info,remove,restore);characterTools.append(admin);
    }
    win.addEventListener('salon-role-change',event=>{editor.select(event.detail);configure();if(!host.hidden)focus('Visage');});
    configure();button.disabled=false;win.salonArrival?.personalization('ready');
   }catch(error){status.textContent=error.message;win.salonArrival?.personalization('error',error.message);button.disabled=false;button.onclick=()=>{task=null;void initialize();};}
  })();return task;
 }
 host.addEventListener('keydown',event=>{if(event.key==='Escape')drawer?.toggle(false);event.stopPropagation();});
 const ready=()=>void initialize();
 if(doc.body.classList.contains('ready'))ready();else win.addEventListener('salon-ready',ready,{once:true});
}

if(typeof window!=='undefined')mountArrivalPersonalization();
