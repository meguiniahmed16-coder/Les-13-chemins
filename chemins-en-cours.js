(function(){
 'use strict';
 const data=window.TreizeUpcomingData,core=window.TreizeUpcomingCore;
 if(!data||!core)return;
 const h=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
 const button=(text,fn)=>{const el=h('button','upcoming-button',text);el.type='button';el.onclick=fn;return el;};
 const link=(text,url)=>{const el=h('a','upcoming-button',text);el.href=url;return el;};
 let dialog=null,current=null,opener=null,previousOverflow='',dismiss=null,pendingAction=null;
 const panes=new Map();
 function registerRoutes(){if(!window.TreizeMiniAtlas)return;for(const [id,r] of Object.entries(data.routes)){const points=r.points.map(p=>p.slice());if(r.destination)points.destination=r.destination;window.TreizeMiniAtlas.routes['upcoming-'+id]=points;}}
 registerRoutes();
 function mapPanel(scene){
  const route=scene.routeData||data.routes[scene.route],section=h('section','upcoming-map-panel');
  if(!route){section.append(h('p','upcoming-caption','Le lieu exact de ce passage n’est pas précisé.'),link('Ouvrir l’atlas','carte.html'));return section;}
  const routeKey='upcoming-'+scene.route;
  if(window.TreizeMiniAtlas){const points=route.points.map(p=>p.slice());if(route.destination)points.destination=route.destination;window.TreizeMiniAtlas.routes[routeKey]=points;}
  section.append(h('h3','',route.title));
  const map=h('div','mini-atlas-map');map.dataset.route='upcoming-'+scene.route;map.dataset.maxZoom=route.zoom;
  map.setAttribute('role','img');map.setAttribute('aria-label',route.title+' : '+route.points.map(p=>p[0]).join(' → '));
  const list=h('ol','upcoming-stops');route.points.forEach(p=>list.append(h('li','',p[0])));
  if(route.destination)list.append(h('li','',route.destination[0]));
  section.append(map,list,h('p','upcoming-caption',route.caption),h('p','upcoming-caption','Repères du récit reliés schématiquement, sans trace GPS.'),link('Ouvrir dans l’atlas',scene.atlasUrl||'carte.html?scene='+scene.id));
  return section;
 }
 function prepareDialog(){
  if(dialog)return;
  dialog=h('dialog','upcoming-reader');dialog.id='upcomingReader';dialog.setAttribute('aria-labelledby','upcomingReaderTitle');
  const bar=h('header','upcoming-bar'),heading=h('div');heading.append(h('p','upcoming-eyebrow','Les Treize Chemins'),h('h2','', ''));
  heading.querySelector('h2').id='upcomingReaderTitle';
  bar.append(heading,button('Fermer ✕',()=>dialog.close()));
  dialog.append(bar,h('div','upcoming-panes'));document.body.append(dialog);
  dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;opener?.focus?.({preventScroll:true});const action=pendingAction||dismiss;pendingAction=null;dismiss=null;action?.();});
 }
 function leaveScene(id,action){if(!dialog?.open||current!==id)return false;pendingAction=action;dialog.close();return true;}
 function makePane(scene){
  const pane=h('article','upcoming-pane');pane.dataset.upcomingScene=scene.id;
  const intro=h('div','upcoming-intro'),art=h('div','upcoming-art');Object.assign(art.style,core.artStyle(scene));art.setAttribute('role','img');art.setAttribute('aria-label','Vignette de '+scene.title);
  const summary=h('div','upcoming-summary');summary.append(h('span','upcoming-status',scene.playable?'Jeu disponible':'Travail en cours'),h('p','upcoming-place',scene.place),h('p','upcoming-lead',scene.lead),h('p','upcoming-caption',scene.playable?'Explorez le texte, les personnages et les lieux, puis ouvrez l’onglet Le jeu.':'Le texte et les personnages sont à découvrir dès maintenant. Le jeu se prépare.'));
  intro.append(art,summary);pane.append(intro);
  const tabs=h('div','upcoming-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Découvrir '+scene.title);
  const panels=h('div','upcoming-panels');
  const labels=[['text','Le texte'],['people','Les personnages'],['map','La carte'],['game','Le jeu']];
  function select(key,focus=false){
   for(const t of tabs.children){const selected=t.dataset.tab===key;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;if(selected&&focus)t.focus();}
   for(const p of panels.children)p.hidden=p.dataset.panel!==key;
   if(key==='map'){const panel=panels.querySelector('[data-panel="map"]');if(!panel.firstChild)panel.append(mapPanel(scene));window.TreizeMiniAtlas?.mount();}
  }
  labels.forEach(([key,label],i)=>{
   const tab=button(label,()=>select(key));tab.dataset.tab=key;tab.id='upcoming-'+scene.id+'-tab-'+key;tab.setAttribute('role','tab');tab.setAttribute('aria-controls','upcoming-'+scene.id+'-'+key);
   tab.onkeydown=e=>{let n=null;if(e.key==='ArrowRight')n=(i+1)%labels.length;if(e.key==='ArrowLeft')n=(i+labels.length-1)%labels.length;if(e.key==='Home')n=0;if(e.key==='End')n=labels.length-1;if(n!==null){e.preventDefault();select(labels[n][0],true);}};
   tabs.append(tab);
   const panel=h('section','upcoming-panel');panel.dataset.panel=key;panel.id='upcoming-'+scene.id+'-'+key;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);panel.tabIndex=0;
   if(key==='text'){
    panel.append(h('p','upcoming-source',scene.reference||'Extrait du manuscrit · Chapitre '+scene.chapter+' — '+scene.chapterTitle));
    const prose=h('div','upcoming-prose');scene.paragraphs.forEach(p=>prose.append(h('p','',p)));panel.append(prose);
    if(scene.id==='traitre')panel.append(h('p','upcoming-caption','Le salon et ses six invitées sont une adaptation satirique de ce passage. Ils ne constituent pas une scène supplémentaire du manuscrit.'));
   }
   if(key==='people'){
    panel.append(h('p','upcoming-caption','Ces voix d’atelier mêlent souvenirs et création littéraire. Elles prolongent les personnages au-delà du passage.'));
    const profiles=scene.profiles||scene.people.map(id=>data.profiles[id]);
    profiles.forEach(profile=>{
     const details=h(profile.paragraphs?.length?'details':'article','upcoming-person'),summary=h(profile.paragraphs?.length?'summary':'p');
     summary.append(h('strong','',profile.name),h('span','',profile.role));details.append(summary);
     if(profile.workshop)details.append(h('p','upcoming-source','Sélection de l’atelier '+profile.workshop));
     (profile.paragraphs||[]).forEach(p=>details.append(h('p','',p)));panel.append(details);
    });
   }
   if(key==='game'&&scene.renderGame)scene.renderGame(panel,{leave:action=>leaveScene(scene.id,action),showTab:key=>select(key)});
   else if(key==='game'){
    panel.append(h('span','upcoming-status','Travail en cours'),h('h3','',scene.game.goal));
    const rules=h('ol','upcoming-rules');scene.game.rules.forEach(r=>rules.append(h('li','',r)));
    panel.append(rules,h('p','upcoming-caption','Durée envisagée : '+scene.game.duration+'. Commandes prévues pour le tactile, la souris et le clavier.'),link('Découvrir le futur jeu',scene.game.url));
   }
   panels.append(panel);
  });
  pane.append(tabs,panels);
  const nav=h('nav','upcoming-scene-nav');nav.setAttribute('aria-label','Parcourir les scènes');
  const adjacent=scene.playable?{previous:null,next:null}:core.neighbours(data,scene.id);
  if(adjacent.previous)nav.append(button('← '+adjacent.previous.title,()=>open(adjacent.previous.id)));
  if(adjacent.next)nav.append(button(adjacent.next.title+' →',()=>open(adjacent.next.id)));else nav.append(button('Revenir aux chemins',()=>dialog.close()));
  pane.append(nav);pane.select=select;select('text');return pane;
 }
 function open(id,tab='text'){
  const scene=core.scene(data,id);if(!scene)return false;
  dismiss=null;pendingAction=null;
  prepareDialog();current=id;
  if(!panes.has(id)){const pane=makePane(scene);panes.set(id,pane);dialog.querySelector('.upcoming-panes').append(pane);}
  for(const [key,pane] of panes){pane.hidden=key!==id;}
  document.getElementById('upcomingReaderTitle').textContent='Chemin '+scene.path+' · '+scene.title;
  if(!dialog.open){opener=document.activeElement;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();}
  panes.get(id).select(['text','people','map','game'].includes(tab)?tab:'text');dialog.scrollTop=0;
  dialog.querySelector('.upcoming-bar button').focus({preventScroll:true});return true;
 }
 function openScene(scene,{onDismiss=null,tab='text'}={}){
  prepareDialog();
  if(dialog.open&&current===scene.id)return dialog;
  panes.get('playable')?.remove();
  const pane=makePane(scene);panes.set('playable',pane);dialog.querySelector('.upcoming-panes').append(pane);
  current=scene.id;dismiss=onDismiss;pendingAction=null;
  for(const p of panes.values())p.hidden=p!==pane;
  document.getElementById('upcomingReaderTitle').textContent='Chemin '+scene.path+' · '+scene.title;
  if(!dialog.open){opener=document.activeElement;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();}
  pane.select(['text','people','map','game'].includes(tab)?tab:'text');dialog.scrollTop=0;
  dialog.querySelector('.upcoming-bar button').focus({preventScroll:true});return dialog;
 }
 function mount(host=document.getElementById('boardTargets')){
  if(!host||host.querySelector('[data-upcoming-path]'))return;
  for(const path of data.paths){
   const group=h('div','board-target chapter-featured step-chapters upcoming-path');group.dataset.upcomingPath=path.id;group.dataset.chemin=String(path.number);group.id='chemin-'+path.id.toLowerCase();group.setAttribute('role','group');group.setAttribute('aria-label','Chemin '+path.id+' · Travail en cours');
   const main=button('',()=>open(path.scenes[0]));main.className='chapter-card-main';main.append(h('span','chapter-card-kicker','CHEMIN '+path.id));
   const row=h('div','chapter-card-route');
   for(const id of path.scenes){const scene=core.scene(data,id),tile=button('',()=>open(id));tile.className='chapter-part-label chapter-literary-part upcoming-tile';tile.dataset.sceneArt=id;tile.dataset.upcomingOpen=id;tile.setAttribute('aria-label',scene.title+' · Travail en cours · Lire et découvrir');Object.assign(tile.style,core.artStyle(scene));tile.append(h('span','chapter-part-title',scene.title));row.append(tile);}
   group.append(main,row,h('p','chapter-card-status','Travail en cours · Textes, personnages et cartes à découvrir'));
   host.append(group);
   const interlude=h('div','upcoming-board-map');interlude.append(h('h3','',path.id==='IV'?'Les lieux du chemin IV · Rue Vaneau':'Les lieux du chemin V · De Plaisance à Vaneau'));
   const scene=core.scene(data,path.id==='IV'?'demenagement':'traitre');interlude.append(mapPanel(scene));host.append(interlude);
  }
  window.TreizeMiniAtlas?.mount();
 }
 window.TreizeCheminsEnCours={mount,open,openScene,mapPanel};
 mount();
 const params=new URLSearchParams(location.search);if(params.has('scene'))open(params.get('scene'),params.get('vue')||'text');
})();
