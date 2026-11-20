import {traits,families,sections,pieces,looks,thumbRows} from './studio-catalog.js';
import {normaliseStudio,freeTrait,freePiece,slots,skinSteps} from './studio-look.js';

const make=(tag,label)=>{const e=document.createElement(tag);if(label)e.textContent=label;return e;};
const folder=(parent,title,open=false)=>{const d=make('details');d.open=open;d.append(make('summary',title));parent.append(d);return d;};
export function createDrawer(root,apply){
 const drawer=root.querySelector('.studio-drawer'),toggleButton=root.querySelector('.options-toggle');
 drawer.innerHTML='<header><strong>Personnaliser</strong><button type="button" class="close" aria-label="Fermer les options">×</button></header><div class="switch"><button type="button">Apparence</button><button type="button">Garde-robe</button></div><div class="studio-scroll"></div><footer><button type="button" class="save">Enregistrer</button><span role="status"></span></footer>';
 const pane=drawer.querySelector('.studio-scroll'),message=drawer.querySelector('[role=status]'),save=drawer.querySelector('.save');
 const tabs=[...drawer.querySelectorAll('.switch button')];let mode=0,look,options={},current,revision=0,writing=false;
 function toggle(open){drawer.hidden=!open;toggleButton.setAttribute('aria-expanded',String(open));}
 toggleButton.onclick=()=>toggle(drawer.hidden);drawer.querySelector('.close').onclick=()=>toggle(false);
 function choose(next){
  look=normaliseStudio(next,options.plus);const version=++revision;
  options.change(look);save.disabled=true;message.textContent='Ajustement…';
  current=Promise.resolve(apply(look)).then(()=>{if(version===revision){save.disabled=false;message.textContent='';}},()=>{if(version===revision){message.textContent='Chargement interrompu. Réessaie cette option.';save.disabled=true;}});
  sync();
 }
 const controls=[];
 function sync(){for(const update of controls)update();}
 function appearance(parent){
  for(const [id,title,keys] of families){
   const f=folder(parent,title);f.dataset.family=id;
   for(const key of keys){
    const trait=traits.find(t=>t.key===key),label=make('label',trait.label),select=make('select');
    for(const [i,name] of trait.options.entries()){
     const locked=!options.plus&&!freeTrait(key,i),option=new Option(name+(locked?' · Compagnon':''),String(i));
     option.disabled=locked;select.add(option);
    }
    select.name=key;label.append(select);f.append(label);
    select.onchange=()=>{const n=Number(select.value);choose({...look,face:{...look.face,[key]:n},...(key==='skin'?{skinLevel:skinSteps[n]}:{}),...(key==='iris'?{iris:''}:{})});};
    controls.push(()=>select.value=String(look.face[key]));
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
 }
 function card(parent,label,index,locked,selected,click,author=''){
  const b=make('button'),preview=make('span');b.type='button';b.className='piece';b.dataset.search=(label+' '+author).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();b.disabled=locked;
  preview.className='swatch';preview.style.backgroundPosition=(-48*(index%12))+'px '+(-60*Math.floor(index/12))+'px';
  preview.style.backgroundSize='576px '+(60*thumbRows)+'px';b.append(preview,make('span',label+(locked?' · Compagnon':'')));
  b.onclick=click;controls.push(()=>b.setAttribute('aria-pressed',String(selected())));parent.append(b);
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
     card(grid,p.label,p.thumb,!options.plus&&!freePiece(p.id),()=>look.outfit[slot]===p.id,()=>{
      const outfit={...look.outfit};if(outfit[slot]===p.id)delete outfit[slot];
      else{if(slot==='robe'){delete outfit.haut;delete outfit.bas;}if(slot==='bas'||slot==='haut')delete outfit.robe;outfit[slot]=p.id;}
      choose({...look,outfit});
     },p.author);
    }
    if(group==='tenues'||group==='sport')for(const [id,name,outfit,thumb] of looks.filter(([id])=>['course','training'].includes(id)===(group==='sport'))){
     card(grid,name,thumb,!options.plus&&Object.values(outfit).some(id=>!freePiece(id)),()=>Object.keys(outfit).length===Object.keys(look.outfit).length&&Object.entries(outfit).every(([s,id])=>look.outfit[s]===id),()=>choose({...look,outfit,denim:false,tortoise:false}));
    }
   }
  }
  for(const [field,id,slot,label] of [['denim','mh807','bas','Jean de nuit'],['tortoise','mh153','lunettes','Monture écaille']]){
   const l=make('label',label),box=make('input');box.type='checkbox';l.append(box);parent.append(l);
   controls.push(()=>{l.hidden=look.outfit[slot]!==id;box.checked=look[field];box.disabled=field==='tortoise'&&!options.plus;});box.onchange=()=>choose({...look,[field]:box.checked});
  }
 }
 function render(){
  if(!look)return;controls.length=0;pane.replaceChildren();
  tabs.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===mode)));
  (mode?wardrobe:appearance)(pane);
  if(options.privateURL){const a=make('a','Mon atelier privé');a.href=options.privateURL;pane.append(a);}
  sync();
 }
 tabs.forEach((b,i)=>b.onclick=()=>{mode=i;render();});
 save.onclick=async()=>{
  if(writing||save.disabled)return;const version=revision;writing=true;save.disabled=true;message.textContent='Enregistrement…';
  try{await current;await options.save(look);if(version===revision)message.textContent='Enregistré.';}
  catch(e){if(version===revision)message.textContent=e.message||'Enregistrement interrompu.';}
  finally{writing=false;if(version===revision)save.disabled=false;}
 };
 return {toggle,configure(value,settings){look=value;options=settings;render();}};
}
