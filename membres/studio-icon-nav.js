
const glyphs={
 body:'<circle cx="12" cy="5" r="3"/><path d="M8 22v-7L6 11l3-3h6l3 3-2 4v7M8 15h8M12 15v7"/>',
 skin:'<path d="M12 3c-4 5-7 8-7 12a7 7 0 0 0 14 0c0-4-3-7-7-12Z"/><path d="M9 17c.6 1 1.6 2 3 2"/>',
 face:'<path d="M7 7c0-4 10-4 10 0v9c0 4-10 4-10 0Z"/><path d="M8 12h2m4 0h2m-5 4h2"/>',
 eyes:'<path d="M2 12c5-8 15-8 20 0-5 8-15 8-20 0Z"/><circle cx="12" cy="12" r="3"/>',
 hair:'<path d="M5 19V10c0-10 14-10 14 0v9m-14-8 3-4 4 3 4-3 3 4"/>',
 beard:'<path d="M6 9c0-8 12-8 12 0v4l2-1-2 7-6 3-6-3-2-7 2 1V9Zm2 7 4 2 4-2"/>',
 underwear:'<path d="M4 5h16l-2 14h-4l-2-5-2 5H6Z"/><path d="M4 9h16"/>',
 tops:'<path d="m8 3-5 4 3 5 3-2v11h6V10l3 2 3-5-5-4-4 2Z"/>',
 bottoms:'<path d="M6 3h12l2 18h-6l-2-11-2 11H4Z"/><path d="M6 8h12"/>',
 shoes:'<path d="m3 15 6-4 3 4 7 2 2 3H3Z"/><path d="M3 17h17"/>',
 outer:'<path d="m8 3-5 4v13h6V9l3 4 3-4v11h6V7l-5-4-4 3Z"/>',
 accessories:'<path d="M2 10h5l2 3h6l2-3h5M3 10v4a4 4 0 0 0 8 0v-2m2 0v2a4 4 0 0 0 8 0v-4"/>',
 outfits:'<path d="m8 3-5 4 3 5 3-2v11h6V10l3 2 3-5-5-4-4 2Z"/><path d="M9 14h6"/>',
 advanced:'<circle cx="12" cy="12" r="8"/><path d="M12 8v8m-4-4h8"/>',
 info:'<path d="M4 7h16M4 12h16M4 17h16"/>',
};
const categories=[
 ['body','Silhouette',0],['skin','Peau',0],['face','Visage',0],['eyes','Yeux',0],['hair','Cheveux',0],['beard','Barbe',0],
 ['underwear','Sous-vêtements',1],['tops','Chemises et hauts',1],['bottoms','Pantalons et bas',1],
 ['shoes','Chaussures',1],['outer','Vestes et robes',1],['accessories','Accessoires',1],
 ['outfits','Tenues complètes',1],['advanced','Outils avancés',0]
];
const icon=key=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+glyphs[key]+'</svg>';
export function createStudioIconNav(drawer,pane,{setMode}){
 const rail=drawer.querySelector('.studio-rail');
 let selected='body',collapsed=false,labelsShown=false;
 const lastUsed={avatar:'body',clothes:'underwear'};
 const groupOf=key=>categories.find(item=>item[0]===key)?.[2]===1?'clothes':'avatar';
 const title=drawer.querySelector('header strong');
 const buttons=new Map();
 const labels=()=>{rail.classList.toggle('studio-labels',labelsShown);drawer.classList.toggle('studio-labels-shown',labelsShown);};
 const help=document.createElement('button');help.type='button';help.className='studio-rail-labels';
 help.title='Afficher ou masquer les noms des icônes';help.setAttribute('aria-label','Afficher les libellés');
 help.innerHTML=icon('info')+'<span>Libellés</span>';
 help.onclick=()=>{labelsShown=!labelsShown;labels();};
 rail.append(help);
 for(const [key,name] of categories){
   const b=document.createElement('button');b.type='button';b.className='studio-nav-icon';b.dataset.category=key;
   b.setAttribute('aria-label',name);b.title=name;b.innerHTML=icon(key)+'<span>'+name+'</span>';
   b.onclick=()=>{
     if(selected===key&&!collapsed){collapsed=true;drawer.classList.add('studio-icon-only');update();return;}
     selected=key;lastUsed[groupOf(key)]=key;collapsed=false;drawer.classList.remove('studio-icon-only');
     setMode(categories.find(x=>x[0]===key)[2]);update();
   };rail.append(b);buttons.set(key,b);
 }
 function update(){
  const active=categories.find(x=>x[0]===selected),name=active?.[1]||'Personnaliser';
  title.textContent=name;
  drawer.dataset.activeCategory=selected;
  rail.querySelectorAll('.studio-nav-icon').forEach(b=>{
   b.setAttribute('aria-pressed',String(!collapsed&&b.dataset.category===selected));
   b.setAttribute('aria-expanded',String(!collapsed&&b.dataset.category===selected));
  });
  const items=[...pane.children];
  // Never remove the original V27 controls or detach their event handlers.
  // We only expose the requested group in its original DOM.
  for(const item of items)item.hidden=true;
  const details=items.filter(x=>x.tagName==='DETAILS');
  const clothing=active?.[2]===1;
  if(!clothing){
    const quick=items.find(x=>x.classList?.contains('studio-quick'));
    if(quick){
      const quickTargets={
       body:['Silhouette'],skin:['Teinte de peau'],face:[],eyes:['Couleur des yeux'],
       hair:['Coiffure','Couleur des cheveux'],beard:['Barbe et moustache']
      }[selected]||[];
      quick.hidden=!quickTargets.length;
      quick.open=true;
      for(const element of quick.children){
       if(element.tagName==='LABEL')element.hidden=!quickTargets.some(x=>element.textContent.includes(x));
       if(element.classList?.contains('figure-tools'))element.hidden=true;
      }
    }
    const face=details.find(d=>d.querySelector('[data-family]'));
    if(face){
      const ids={body:['corps'],skin:['peau'],face:['visage','regard'],
       eyes:['visage','regard'],hair:['cheveux'],beard:['cheveux']}[selected]||[];
      face.hidden=!ids.length;face.open=true;
      for(const family of face.querySelectorAll('[data-family]')){
       family.hidden=!ids.includes(family.dataset.family);family.open=!family.hidden;
       // Reset visibility first: switching Eyes → Face must restore every detail.
       // Filter by the label's caption, not by option text in its nested select.
       for(const label of family.querySelectorAll('label')){
         const caption=label.firstChild?.textContent?.trim()||'';
         const filters={
           body:/^(Corpulence|Pilosité)/i,
           skin:/^(Teinte de peau|Nuance de peau|Tranche d’âge)/i,
           eyes:/^(Couleur des yeux|Regard|Sourcils|Cils)/i,
           hair:/^(Coiffure|Couleur des cheveux)/i,
           beard:/^(Barbe et moustache)/i
         };
         label.hidden=Boolean(filters[selected]&&!filters[selected].test(caption));
       }
      }
      for(const child of face.children){
       if(child.classList?.contains('figure-tools'))child.hidden=true;
      }
    }
    if(selected==='advanced'){
      for(const item of items)item.hidden=!item.classList?.contains('studio-advanced')&&!item.classList?.contains('incarnations-entry')&&!item.classList?.contains('v27-inspection-tools');
      for(const item of items)if(!item.hidden&&item.tagName==='DETAILS')item.open=true;
      for(const item of items)if(item.classList?.contains('studio-quick'))item.hidden=true;
    }
  }else{
    const preset=details[0],wardrobeRoot=details[1];
    if(selected==='outfits'){if(preset){preset.hidden=false;preset.open=true;}}
    else if(wardrobeRoot){
      wardrobeRoot.hidden=false;wardrobeRoot.open=true;
      const show={
       underwear:['Slips, boxers et maillots','Chaussettes','Collants et leggings'],
       tops:['Hauts et chemises'],bottoms:['Pantalons et shorts','Kilts'],
       shoes:['Chaussures'],outer:['Vestes et manteaux','Tuniques et vêtements longs','Costumes et combinaisons'],
       accessories:['Chapeaux et casquettes','Gants','Lunettes','Masques','Bijoux','Cravates, ceintures et accessoires']
      }[selected]||[];
      for(const section of [...wardrobeRoot.children].filter(x=>x.tagName==='DETAILS')){
        const inner=[...section.children].filter(x=>x.tagName==='DETAILS');
        if(inner.length){
          let matched=false;
          for(const item of inner){
            item.hidden=!show.includes(item.querySelector('summary')?.textContent.trim());
            item.open=!item.hidden;if(!item.hidden)matched=true;
          }
          section.hidden=!matched;section.open=matched;
        }else{
          section.hidden=!show.includes(section.querySelector('summary')?.textContent.trim());
          section.open=!section.hidden;
        }
      }
    }
  }
  drawer.classList.toggle('studio-icon-only',collapsed);
  const status=drawer.querySelector('.studio-selected-name');
  if(status)status.textContent=name;
  labels();
 }
 function select(category){
   if(!buttons.has(category))return false;
   selected=category;lastUsed[groupOf(category)]=category;
   collapsed=false;drawer.classList.remove('studio-icon-only');
   setMode(categories.find(x=>x[0]===category)[2]);update();return true;
 }
 function selectGroup(group){
   if(!Object.hasOwn(lastUsed,group))return false;
   const category=lastUsed[group];
   if(category===selected&&!collapsed){toggleSelected();return true;}
   return select(category);
 }
 function toggleSelected(){
   collapsed=!collapsed;drawer.classList.toggle('studio-icon-only',collapsed);update();return collapsed;
 }
 return {update,select,selectGroup,toggleSelected,get selected(){return selected;},get collapsed(){return collapsed;}};
}
