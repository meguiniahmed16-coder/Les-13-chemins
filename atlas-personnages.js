/* Atlas de lecture commun à la carte, aux chemins et aux jeux. */
(() => {
 'use strict';
 const element = (tag, cls, text) => {
   const node = document.createElement(tag);
   if (cls) node.className = cls;
   if (text != null) node.textContent = text;
   return node;
 };
 const button = (label, action, cls='ap-button') => {
   const b=element('button',cls,label); b.type='button'; b.addEventListener('click',action); return b;
 };
 const normal = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/œ/g,'oe').toLocaleLowerCase('fr');
 const number = n => String(n).padStart(3,'0');
 function resource(file, transform) {
   let pending;
   return () => pending ||= fetch(file).then(r=>{
     if(!r.ok) throw Error('Atlas indisponible');
     return r.json();
   }).then(transform).catch(e=>{pending=null;throw e;});
 }
 const directory=resource('atlas-repertoire.json', data=>({
   ...data, byId:new Map(data.people.map(p=>[p.id,p])),
   byCity:new Map(data.cities.map(c=>[c.id,data.people.filter(p=>p.places.some(s=>s.city===c.id))]))
 }));
 const portraits=resource('atlas-continuites.json', x=>x);
 const cast={
   'jouable-1-1':[7,289,106],'jouable-2-1':[7,44,59],'jouable-3-1':[7,278],
   'jouable-4-1':[7,229],'jouable-5-1':[7,229],'jouable-5-2':[7,295],
   'jouable-manifestation':[7],'jouable-cyrano':[7,74],'jouable-rencontre':[7,258],
   stoppub:[7,203,267],demenagement:[7,258],frontiere:[7,346,129],rire:[7,110,258],
   traitre:[7],peguy:[7,302,283],
   'jouable-6-1':[7,258,110],'jouable-7-1':[7],'jouable-8-1':[7,24],
   'jouable-9-1':[7,350],'jouable-10-1':[7,123,94],'jouable-11-1':[7],
   'jouable-12-1':[7,275],'jouable-13-1':[7,327]
 };
 const games={
   'arcade-marmousets':['jouable-1-1',1],'arcade-a410':['jouable-2-1',1],
   'arcade-catalogne':['jouable-3-1',1],'arcade-catalogne-3d':['jouable-3-1',1],
   'jeu-bosnie':['jouable-4-1',2],'jeu-danse':['jouable-5-1',3],'jeu-yoyo':['jouable-5-2',4],
   'jeu-manifestation':['jouable-manifestation',4],'jeu-cyrano':['jouable-cyrano',5],
   'jeu-cyrano-bd':['jouable-cyrano',5],'jeu-rencontre':['jouable-rencontre',6],
   'jeu-stoppub':['stoppub',7],'jeu-demenagement':['demenagement',8],'jeu-frontiere':['frontiere',10],
   'jeu-faire-rire':['rire',11],'jeu-le-traitre':['traitre',12],'jeu-chemin-peguy':['peguy',13]
 };
 let dialog,content,opener,revision=0;
 function prepare() {
   if(dialog) return;
   dialog=element('dialog','ap-dialog');dialog.setAttribute('aria-labelledby','ap-person-name');
   const bar=element('div','ap-dialogbar');
   bar.append(element('span','', 'Atlas des personnages'),button('Fermer ×',()=>dialog.close(),'ap-dismiss'));
   content=element('div','ap-dialogbody');dialog.append(bar,content);document.body.append(dialog);
   dialog.addEventListener('close',()=>{revision++;if(opener?.isConnected)opener.focus({preventScroll:true});});
   dialog.addEventListener('click',e=>{if(e.target===dialog){
     const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();
   }});
 }
 function heading(p,full) {
   content.replaceChildren();
   content.append(element('p','ap-meta',p.id?'Nº '+number(p.id)+(full?' · Continuité':' · Dans le récit'):'Personnage du jeu'));
   const title=element('h2','',p.name);title.id='ap-person-name';title.tabIndex=-1;content.append(title);
   dialog.scrollTop=0;title.focus({preventScroll:true});
 }
 function discussButton(p,data,city=null){
   return button('Écrire à '+p.name,async ()=>{
     prepare();
     if(!dialog.open){opener=document.activeElement;dialog.showModal();}
     const ticket=++revision;
     heading(p,false);
     content.querySelector('.ap-meta').textContent='Discussion';
     content.append(button('← Sa continuité',()=>read(p,data,city),'ap-return'));
     const host=element('section','ap-chat','Ouverture de la discussion…');content.append(host);
     try{
       const {mountDiscussion}=await import('./atlas-discussion.js');
       if(ticket!==revision||!dialog.open)return;
       host.replaceChildren();mountDiscussion(host,p,String(p.id||p.chatId));
     }catch{
       if(ticket===revision&&dialog.open)host.replaceChildren(element('p','','La discussion n’a pas pu s’ouvrir.'),discussButton(p,data,city));
     }
   },'ap-primary ap-write');
 }
 function show(p,data,city=null) {
   prepare();
   if(!dialog.open){opener=document.activeElement;dialog.showModal();}
   revision++;heading(p,false);
   content.append(element('p','ap-role',p.role));
   const places=p.places||[];
   const selected=city?places.filter(s=>s.city===city):places;
   if(selected.length){
     const list=element('ul','ap-places');
     selected.forEach(s=>list.append(element('li','',s.place+(s.mode?' · '+s.mode:'')+(s.pages?' · p. '+s.pages:''))));
     content.append(list);
   }
   const expand=button('En savoir plus sur '+p.name,()=>read(p,data,city),'ap-primary');content.append(expand,discussButton(p,data,city));
 }
 async function read(p,data,city) {
   const ticket=++revision;heading(p,true);
   content.append(button('← Son interaction dans le récit',()=>show(p,data,city),'ap-return'),discussButton(p,data,city));
   const area=element('div','ap-prose','Chargement du portrait…');content.append(area);
   try{
     const paragraphs=p.id?(await portraits())[p.id]:p.paragraphs;
     if(ticket!==revision||!dialog.open)return;
     if(!paragraphs?.length)throw Error();
     area.replaceChildren(...paragraphs.map(t=>element('p','',t)));
     if(p.links?.length){
       const links=element('div','ap-relations');links.append(element('h3','','Au fil des rencontres'));
       p.links.forEach(r=>{
         const other=data.byId.get(r.id);if(!other)return;
         const line=element('div','');line.append(button(other.name,()=>show(other,data),'ap-link'),element('p','',r.text+' · p. '+r.pages));links.append(line);
       });content.append(links);
     }
   }catch{if(ticket===revision){area.replaceChildren(element('p','','Le portrait n’a pas pu être chargé.'),button('Réessayer',()=>read(p,data,city)));}}
 }
 function chip(p,fn,detail=false){
   const b=button('',fn,'ap-chip');b.append(element('span','ap-chipnum',p.id?number(p.id):'✦'),element('span','ap-chipname',p.name));
   if(detail)b.append(element('small','',p.role));
   b.title=p.name+' · '+p.role;
   b.setAttribute('aria-label',p.name+' · '+p.role);
   return b;
 }
 function roster(data,scene,chapter) {
   const ids=cast[scene]||[7];
   const present=ids.map(id=>data.byId.get(id)).filter(Boolean);
   if(scene==='traitre'){
     const extras=window.TreizeUpcomingData;
     for(const key of extras?.scenes.find(s=>s.id===scene)?.people||[]){
       if(key!=='ahmed'&&extras.profiles[key])present.push({...extras.profiles[key],chatId:'salon-'+key});
     }
   }
   const remaining=(data.chapters[Number(chapter)]||[]).filter(id=>!ids.includes(id)).map(id=>data.byId.get(id));
   return {present,remaining};
 }
 function mountRoster(host,scene,chapter,collapsed=false) {
   if(!host||host.querySelector(':scope > .ap-roster'))return;
   const wrap=element(collapsed?'details':'div','ap-roster');
   if(collapsed)wrap.append(element('summary','','Les personnages du chapitre '+Number(chapter)));
   const area=element('div','ap-rosterbody');wrap.append(area);host.append(wrap);
   let started=false;
   async function fill(){
     if(started)return;started=true;area.textContent='Chargement des personnages…';
     try{
       const data=await directory();const {present,remaining}=roster(data,scene,chapter);
       area.replaceChildren();
       for(const [label,group] of [['Dans cette scène',present],['Les personnages que vous ne connaissez pas encore',remaining]]){
         if(!group.length)continue;
         area.append(element('h3','',label));const grid=element('div','ap-rostergrid');
         group.forEach(p=>grid.append(chip(p,()=>show(p,data),true)));area.append(grid);
       }
     }catch{started=false;area.replaceChildren(element('p','','Les personnages n’ont pas pu être chargés.'),button('Réessayer',fill));}
   }
   if(collapsed)wrap.addEventListener('toggle',()=>{if(wrap.open)fill();});else fill();
 }
 function frameRosters(){
   function bind(frame){
     const src=frame.getAttribute('src');if(!src)return;
     let url;try{url=new URL(src,location.href);}catch{return;}
     if(url.origin!==location.origin)return;
     const game=games[url.pathname.split('/').pop().replace(/\.html$/,'')], host=frame.closest('dialog');
     if(!host||!game||host.querySelector('.ap-framebutton'))return;
     const trigger=button('Personnages du chapitre '+game[1],()=>{
       const reader=element('dialog','ap-dialog');reader.setAttribute('aria-label','Les personnages du chapitre '+game[1]);
       const bar=element('div','ap-dialogbar');bar.append(element('span','','Chapitre '+game[1]),button('Revenir au jeu ×',()=>reader.close(),'ap-dismiss'));
       const body=element('div','ap-dialogbody');reader.append(bar,body);document.body.append(reader);
       mountRoster(body,...game);reader.addEventListener('close',()=>{reader.remove();trigger.focus({preventScroll:true});},{once:true});reader.showModal();
     },'ap-framebutton');
     const actions=host.querySelector('.arcade-under-actions');if(actions)actions.append(trigger);else frame.after(trigger);
   }
   document.querySelectorAll('dialog iframe[src]').forEach(bind);
   new MutationObserver(events=>{for(const e of events){
     if(e.type==='attributes'&&e.target.tagName==='IFRAME')bind(e.target);
     else for(const n of e.addedNodes)if(n.nodeType===1){if(n.matches('iframe[src]'))bind(n);else n.querySelectorAll('iframe[src]').forEach(bind);}
   }}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
 }
 function standalone(){
   const key=location.pathname.split('/').pop().replace(/\.html$/,'');const game=games[key];
   if(key==='jeu')frameRosters();
   if(!game||window.self!==window.top)return;
   const footer=element('footer','ap-gamefooter');document.body.append(footer);
   document.documentElement.classList.add('ap-standalone');
   const fixed=Array.from(document.body.children).find(n=>n!==footer&&getComputedStyle(n).position==='fixed'&&n.getBoundingClientRect().height>=innerHeight*.8);
   if(fixed){fixed.classList.add('ap-game-screen');footer.classList.add('ap-after-screen');}
   mountRoster(footer,...game,true);
 }
 window.TreizeAtlasPersonnages={element,button,normal,number,directory,portraits,chip,show,discussButton,roster,mountRoster,games,cast};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',standalone);else standalone();
})();
