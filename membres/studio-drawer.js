import {traits,families,sections,pieces,looks,thumbRows} from './studio-catalog.js?v=incarnations33';
import {normaliseStudio,traitAvailable,traitOptionAvailable,slots,skinSteps} from './studio-look.js?v=incarnations33';
import {createIncarnationsDialog,INCARNATIONS_URL} from './incarnations-dialog.js?v=incarnations33';
import {createStudioIconNav} from './studio-icon-nav.js?v=studio-rail1';

const make=(tag,label)=>{const e=document.createElement(tag);if(label)e.textContent=label;return e;};
const folder=(parent,title,open=false)=>{const d=make('details');d.open=open;d.append(make('summary',title));parent.append(d);return d;};
export function createDrawer(root,apply,frameModel,openDeparture,onToggle=()=>{}){
 const drawer=root.querySelector('.studio-drawer'),toggleButton=root.querySelector('.options-toggle');
 drawer.innerHTML='<header><strong>Personnaliser</strong><button type="button" class="close" aria-label="Fermer les options">×</button></header><div class="switch"><button type="button">Mon personnage</button><button type="button">Tous les vêtements</button></div><div class="studio-body"><nav class="studio-rail" aria-label="Personnalisation par icônes"></nav><div class="studio-scroll"></div></div><footer><button type="button" class="save">Enregistrer</button><span role="status"></span></footer>';
 const pane=drawer.querySelector('.studio-scroll'),message=drawer.querySelector('[role=status]'),save=drawer.querySelector('.save');
 const tabs=[...drawer.querySelectorAll('.switch button')];let mode=0,look,options={},current,revision=0,writing=false;
 const iconNav=createStudioIconNav(drawer,pane,{setMode(next){if(mode!==next){mode=next;render();}else iconNav.update();}});
 const incarnations=createIncarnationsDialog({mount:drawer.parentNode,allowed:()=>options.incarnationsURL===INCARNATIONS_URL});
 function toggle(open){if(drawer.hidden===!open)return;drawer.hidden=!open;toggleButton.setAttribute('aria-expanded',String(open));onToggle(open,mode);}
 toggleButton.onclick=()=>toggle(drawer.hidden);drawer.querySelector('.close').onclick=()=>toggle(false);
 function choose(next){
  look=normaliseStudio(next,options.plus,undefined,options.gender,{owner:options.owner===true||Boolean(options.author)});const version=++revision;
  options.change(look);save.disabled=true;message.textContent='Ajustement…';
  current=Promise.resolve(apply(look)).then(applied=>{if(applied===false)throw Error('Ajustement interrompu.');if(version===revision){save.disabled=false;message.textContent='';}}).catch(()=>{if(version===revision){message.textContent='Chargement interrompu. Réessaie cette option.';save.disabled=true;}});
  sync();
 }
 const controls=[];
 function traitChoices(select,trait){
  let previous='';
  const update=()=>{
   const choices=trait.options.map((label,index)=>({label,index})).filter(({index})=>traitOptionAvailable(trait.key,index,options.gender,options.owner===true||Boolean(options.author),look));
   const signature=choices.map(({index})=>index).join(',');
   if(signature!==previous){select.replaceChildren(...choices.map(({label,index})=>new Option(label,String(index))));previous=signature;}
   select.value=String(look.face[trait.key]);
  };
  controls.push(update);update();
 }
 // One familiar editor: the frequently used adjustments remain visible; everything
 // else from the established V27 catalog stays available under Options avancées.
 function basicAppearance(parent){
  const quick=folder(parent,'Personnalisation rapide',true);
  quick.classList.add('studio-quick');
  for(const [key,labelText] of [['skin','Teinte de peau'],['iris','Couleur des yeux'],['hair','Coiffure'],['beard','Barbe et moustache'],['hairTone','Couleur des cheveux et de la barbe'],['body','Silhouette']]){
   if(!traitAvailable(key,options.gender,options.owner===true||Boolean(options.author)))continue;
   const trait=traits.find(t=>t.key===key);if(!trait)continue;
   const label=make('label',labelText),select=make('select');
   traitChoices(select,trait);
   label.append(select);quick.append(label);
   select.onchange=()=>{
    const n=Number(select.value);
    choose({...look,face:{...look.face,[key]:n},
      ...(key==='skin'?{skinLevel:skinSteps[n]}:{}),
      ...(key==='iris'?{iris:''}:{})});
   };
  }
  const views=make('div');views.className='figure-tools';views.setAttribute('role','group');views.setAttribute('aria-label','Vues du modèle');
  for(const title of ['Corps','Visage','Profil','Dos']){
   const b=make('button',title);b.type='button';b.onclick=()=>frameModel(title);views.append(b);
  }
  parent.append(views);
 }
 function sync(){for(const update of controls)update();}
 function appearance(parent){
  for(const [id,title,keys] of families){
   const visibleKeys=keys.filter(key=>traitAvailable(key,options.gender,options.owner===true||Boolean(options.author)));
   let caption=title;
   if(id==='regard'&&!visibleKeys.includes('lashes'))caption='Sourcils';
   if(id==='cheveux'&&!visibleKeys.includes('beard'))caption='Cheveux';
   const f=folder(parent,caption);f.dataset.family=id;
   for(const key of visibleKeys){
    const trait=traits.find(t=>t.key===key),label=make('label',trait.label),select=make('select');
    traitChoices(select,trait);
    select.name=key;label.append(select);f.append(label);
    select.onchange=()=>{const n=Number(select.value);choose({...look,face:{...look.face,[key]:n},...(key==='skin'?{skinLevel:skinSteps[n]}:{}),...(key==='iris'?{iris:''}:{})});};
    if(key==='skin'){
     const l=make('label','Nuance de peau'),slider=make('input');slider.type='range';slider.min=0;slider.max=100;
     slider.onchange=()=>choose({...look,skinLevel:Number(slider.value)});controls.push(()=>slider.value=look.skinLevel);l.append(slider);f.append(l);
    }
    if(key==='iris'){
     const l=make('label','Couleur personnalisée'),color=make('input');color.type='color';color.onchange=()=>choose({...look,iris:color.value});
     controls.push(()=>color.value=look.iris||trait.swatches[look.face.iris]);l.append(color);f.append(l);
    }
   }
  }
  const views=make('div');views.className='figure-tools';views.setAttribute('role','group');views.setAttribute('aria-label','Vues du modèle');
  for(const title of ['Corps','Visage','Profil','Dos']){const b=make('button',title);b.type='button';b.onclick=()=>frameModel(title);views.append(b);}
  parent.append(views);const reset=make('button','Rétablir l’apparence enregistrée');reset.type='button';
  reset.onclick=()=>{const {face,skinLevel,iris}=options.savedStudio;choose({...look,face,skinLevel,iris});};parent.append(reset);

 }
 function card(parent,label,index,selected,click,author='',sheet=''){
  const b=make('button'),preview=make('span');b.type='button';b.className='piece';b.dataset.search=(label+' '+author).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
  preview.className='swatch';preview.style.backgroundPosition=(-48*(index%12))+'px '+(-60*Math.floor(index/12))+'px';
  if(sheet==='duo'){preview.style.backgroundImage="url('/assets/salon-v27/pieces-duo.webp')";preview.style.backgroundSize='96px 60px';}
  if(sheet==='femme')preview.style.backgroundImage="url('/assets/salon-v27/pieces-femme.webp')";
  if(sheet!=='duo')preview.style.backgroundSize='576px '+(sheet==='femme'?60:60*thumbRows)+'px';b.append(preview,make('span',label));
  let lastTap=-Infinity;
  b.onclick=event=>{
   const now=performance.now();if(event.detail>0&&now-lastTap<430)return;
   lastTap=event.detail>0?now:-Infinity;click();
  };controls.push(()=>b.setAttribute('aria-pressed',String(selected())));parent.append(b);
 }
 function wardrobe(parent){
  const search=make('input'),status=make('small');search.type='search';search.placeholder='Rechercher un vêtement…';
  search.setAttribute('aria-label','Rechercher un vêtement ou un créateur');status.setAttribute('role','status');parent.append(search,status);
  let expanded=null;
  search.oninput=()=>{
   const term=search.value.trim().normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
   const drawers=[...parent.querySelectorAll('details')],cards=[...parent.querySelectorAll('.piece')];
   if(term&&!expanded)expanded=new Set(drawers.filter(d=>d.open));let count=0;
   for(const b of cards){b.hidden=Boolean(term&&!b.dataset.search.includes(term));if(!b.hidden)count++;}
   for(const d of drawers){d.hidden=!!term&&!d.querySelector('.piece:not([hidden])');d.open=term?!d.hidden:!!expanded?.has(d);}
   status.textContent=term?count+' résultat'+(count===1?'':'s'):'';if(!term)expanded=null;
  };
  for(const [title,parts] of sections){
   const section=folder(parent,title);
   for(const [group,label] of Array.isArray(parts)?parts:[[parts,title]]){
    const inner=Array.isArray(parts)?folder(section,label):section,grid=make('div');grid.className='pieces';inner.append(grid);
    for(const p of pieces.filter(p=>p.group===group)){
     const slot=slots[group];
     card(grid,p.label,p.thumb,()=>look.outfit[slot]===p.id,()=>{
      const outfit={...look.outfit};if(outfit[slot]===p.id)delete outfit[slot];
      else{if(slot==='robe'){delete outfit.haut;delete outfit.bas;}if(slot==='bas'||slot==='haut')delete outfit.robe;outfit[slot]=p.id;}
      choose({...look,outfit});
     },p.author,p.sheet);
    }
    if(group==='tenues'||group==='sport')for(const [id,name,outfit,thumb] of looks.filter(([id])=>['course','training'].includes(id)===(group==='sport'))){
     card(grid,name,thumb,()=>Object.keys(outfit).length===Object.keys(look.outfit).length&&Object.entries(outfit).every(([s,id])=>look.outfit[s]===id),()=>choose({...look,outfit,denim:false,tortoise:false}));
    }
   }
  }
  for(const [field,id,slot,label] of [['denim','mh807','bas','Jean de nuit'],['tortoise','mh153','lunettes','Monture écaille']]){
   const l=make('label',label),box=make('input');box.type='checkbox';l.append(box);parent.append(l);
   controls.push(()=>{l.hidden=look.outfit[slot]!==id;box.checked=look[field];});box.onchange=()=>choose({...look,[field]:box.checked});
  }
  const clear=make('button',options.removeClothes?(options.inspection?'Remettre les vêtements':'Retirer les vêtements'):'Retirer la tenue');clear.type='button';
  clear.onclick=()=>{if(options.removeClothes)void options.removeClothes();else choose({...look,outfit:{},denim:false,tortoise:false});};parent.append(clear);

 }
 function render(){
  if(!look)return;controls.length=0;pane.replaceChildren();
  tabs.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===mode)));
  // One intuitive place for appearance, outfit and saved character. Nothing
  // from the original V27 catalog is removed; full detail stays in accordions.
  if(mode===0){
   if(options.incarnationsURL===INCARNATIONS_URL){
    const entry=make('section');entry.className='incarnations-entry';
    const create=make('button','L’Atelier des Incarnations');create.type='button';
    create.onclick=()=>incarnations.open(create);
    entry.append(create,make('p',options.privateURL?'Crée un personnage à partir d’une photo, puis télécharge le GLB ou le HTML.':'Crée ton personnage avec un selfie, puis télécharge le GLB ou le HTML.'));
    pane.append(entry);
   }
   basicAppearance(pane);
   const outfitQuick=folder(pane,'Ma tenue · modèles complets',true);
   outfitQuick.classList.add('studio-quick-outfits');
   for(const [id,name,outfit] of looks){
    const button=make('button',name);button.type='button';
    button.onclick=()=>choose({...look,outfit:{...outfit},denim:false,tortoise:false});
    outfitQuick.append(button);
    controls.push(()=>button.setAttribute('aria-pressed',String(
      Object.keys(outfit).length===Object.keys(look.outfit).length &&
      Object.entries(outfit).every(([slot,piece])=>look.outfit[slot]===piece)
    )));
   }
   const advancedFace=folder(pane,'Détails du visage et du corps');
   advancedFace.classList.add('studio-advanced');
   appearance(advancedFace);
   const advancedWardrobe=folder(pane,'Tous les vêtements et accessoires');
   advancedWardrobe.classList.add('studio-advanced');
   wardrobe(advancedWardrobe);
  }else{
   const outfitQuick=folder(pane,'Choisir une tenue complète',true);
   for(const [id,name,outfit] of looks){
    const button=make('button',name);button.type='button';
    button.onclick=()=>choose({...look,outfit:{...outfit},denim:false,tortoise:false});
    outfitQuick.append(button);
    controls.push(()=>button.setAttribute('aria-pressed',String(
      Object.keys(outfit).length===Object.keys(look.outfit).length &&
      Object.entries(outfit).every(([slot,piece])=>look.outfit[slot]===piece)
    )));
   }
   const full=folder(pane,'Composer ma tenue · tous les articles',true);
   wardrobe(full);
  }
  const advancedSoftware=folder(pane,'Options avancées · studio et création');
  advancedSoftware.classList.add('studio-advanced');
  advancedSoftware.append(make('p','Les outils complémentaires du logiciel se trouvent ici. Tes réglages de personnage et ta garde-robe restent enregistrables dans le même espace.'));
  const tools=make('div');tools.className='figure-tools';
  const addTool=(title,action)=>{
   const b=make('button',title);b.type='button';b.onclick=action;tools.append(b);
  };
  addTool('Voir mon personnage de face',()=>frameModel('Visage'));
  addTool('Voir mon personnage de profil',()=>frameModel('Profil'));
  addTool('Voir mon personnage de dos',()=>frameModel('Dos'));
  addTool('Explorer le salon et le jardin',()=>toggle(false));
  addTool('Le départ à deux',()=>{toggle(false);openDeparture()});
  advancedSoftware.append(tools);
  if(options.privateURL){
   const expand=make('button','Afficher l’atelier avancé dans ce logiciel');expand.type='button';
   expand.setAttribute('aria-expanded','false');
   const holder=make('div');holder.className='studio-embedded';holder.hidden=true;
   expand.onclick=()=>{
    holder.hidden=!holder.hidden;
    expand.setAttribute('aria-expanded',String(!holder.hidden));
    expand.textContent=holder.hidden?'Afficher l’atelier avancé dans ce logiciel':'Masquer l’atelier avancé';
    if(!holder.hidden&&!holder.firstChild){
     const iframe=make('iframe');iframe.title='Atelier avancé de personnalisation et modèles de référence';
     iframe.setAttribute('loading','lazy');iframe.setAttribute('allow','fullscreen');
     iframe.src=options.privateURL;holder.append(iframe);
    }
   };
   advancedSoftware.append(expand,holder);
   advancedSoftware.addEventListener('toggle',()=>{
    if(!advancedSoftware.open&& !holder.hidden){
     holder.hidden=true;expand.setAttribute('aria-expanded','false');
     expand.textContent='Afficher l’atelier avancé dans ce logiciel';
    }
   });
   const link=make('a','Ouvrir cet atelier dans une nouvelle fenêtre');
   link.href=options.privateURL;link.target='_blank';link.rel='noopener';
   advancedSoftware.append(link);
  }
  sync();iconNav.update();
 }
 tabs.forEach((b,i)=>b.onclick=()=>{mode=i;render();onToggle(true,mode);});
 save.onclick=async()=>{
  if(writing||save.disabled)return;const version=revision,draft=look,settings=options,ready=current;writing=true;save.disabled=true;message.textContent='Enregistrement…';
  try{await ready;await settings.save(draft);settings.savedStudio=draft;if(version===revision)message.textContent='Enregistré.';}
  catch(e){if(version===revision)message.textContent=e.message||'Enregistrement interrompu.';}
  finally{writing=false;if(version===revision)save.disabled=false;}
 };
 return {toggle,togglePreview(){return iconNav.toggleSelected();},selectCategory(category){
     const group=category==='body'?'avatar':category==='underwear'?'clothes':null;
     if(drawer.hidden){toggle(true);if(group)iconNav.selectGroup(group,{forceOpen:true});else iconNav.select(category);return;}
     if(group){iconNav.selectGroup(group);return;}
     if(iconNav.selected===category){iconNav.toggleSelected();return;}
     iconNav.select(category);
   },configure(value,settings){
   ++revision;current=null;save.disabled=false;message.textContent='';look=value;options=settings;
   if(options.incarnationsURL!==INCARNATIONS_URL)incarnations.close();render();
 }};
}
