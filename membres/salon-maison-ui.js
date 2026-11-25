import {connectSalonEngine} from './salon-hud-native.js?v=hud54';
// Le Salon : un seul système de navigation, discret et ancré au décor.
// Les vrais contrôles sont déplacés dans les tiroirs ; aucun double système.
const icons={
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 encounter:'<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M19 8v6m-3-3h6"/>',
 avatar:'<circle cx="12" cy="5" r="3"/><path d="M7 22v-7l-2-4 4-3h6l4 3-2 4v7M9 15h6"/>',
 clothes:'<path d="m8 3-5 4 3 5 3-2v11h6V10l3 2 3-5-5-4-4 2Z"/>',
 dialogue:'<path d="M21 11a8 8 0 0 1-8 8H7l-4 3v-6a8 8 0 1 1 18-5Z"/><path d="M8 11h8m-8 4h5"/>',
 explore:'<path d="M12 3v4m0 10v4M3 12h4m10 0h4"/><circle cx="12" cy="12" r="4"/>',
 phone:'<path d="M6 3h3l2 5-2 2a16 16 0 0 0 5 5l2-2 5 2v3a3 3 0 0 1-3 3C9 21 3 15 3 6a3 3 0 0 1 3-3Z"/>',
 body:'<circle cx="12" cy="5" r="3"/><path d="M8 22v-7L6 11l3-3h6l3 3-2 4v7M12 15v7"/>',
 face:'<path d="M7 9c0-8 10-8 10 0v7c0 6-10 6-10 0Z"/><path d="M9 12h1m4 0h1m-5 4 2 1 2-1"/>',
 side:'<path d="M5 9h14M5 15h14m-9-9-4 6 4 6"/>',
 back:'<path d="M12 5v14M5 12h14"/><circle cx="12" cy="12" r="9"/>',
 wideshot:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m8 14 3-3 2 2 2-2 3 3"/>',
 movie:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="m8 6 2 4m4-4 2 4M3 10h18"/>',
 fullscreen:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
 type:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 history:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
 audio:'<path d="M3 10v4m4-7v10m4-14v18m4-15v12m4-10v8"/>',
 bubbles:'<path d="M3 4h14v12H8l-5 4Z"/><path d="M9 7h12v12h-5l-3 3v-3"/>',
 close:'<path d="M5 5l14 14M19 5 5 19"/>',
 label:'<path d="M4 19 11 5l7 14M7 14h9M21 7v12"/>',
 left:'<path d="M19 12H5m6-6-6 6 6 6"/>',
 write:'<path d="m4 17 11-11 3 3L7 20l-4 1Z"/><path d="m13 8 3 3"/>',
 end:'<path d="M4 10V5h16v5M6 18h12m-6-8v8"/>'
};
const svg=key=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">'+icons[key]+'</svg>';
const main=[
 ['encounter','Rencontrer','Rencontres'],
 ['avatar','Avatar','Apparence'],
 ['clothes','Vêtements','Vêtements'],
 ['dialogue','Dialoguer','Conversation'],
 ['explore','Caméra','Caméra']
];
const modes=[
 ['body','body','Corps entier'],
 ['face','face','Visage'],
 ['side','side','Profil'],
 ['back','back','Dos'],
 ['wideshot','wideshot','Vue large'],
 ['movie','movie','Plans alternés'],
 ['fullscreen','fullscreen','Plein écran']
];
const tool=(id,icon,name)=>'<button type="button" class="maison-tool" data-tool="'+id+'" title="'+name+'" aria-label="'+name+'">'+svg(icon)+'<span>'+name+'</span></button>';
export function createSalonNavigation(root){
 const $=selector=>root.querySelector(selector);
 const stage=$('.stage'),viewport=$('.scene-viewport'),footer=$('.conversation-footer');
 if(!stage||!viewport||!footer)return null;
 const menu='<button type="button" class="maison-menu-toggle" aria-label="Ouvrir le menu du Salon" aria-expanded="false" aria-controls="maison-dock" title="Menu du Salon">'+svg('menu')+'<span>Menu</span></button>';
 const dock='<nav class="maison-dock" id="maison-dock" aria-label="Fonctions du Salon" hidden>'+main.map(([id,name])=>'<button type="button" data-maison-open="'+id+'" title="'+name+'" aria-label="'+name+'" aria-expanded="false" aria-controls="maison-rail-panel">'+svg(id)+'<span>'+name+'</span></button>').join('')+'</nav>';
 const panel='<section class="maison-rail-panel" id="maison-rail-panel" aria-label="Options du Salon" hidden>'+
 '<header class="maison-rail-head"><strong class="maison-rail-title">Options</strong><div>'+
 '<button type="button" data-maison-action="labels" title="Afficher les noms des icônes" aria-label="Afficher les noms des icônes" aria-pressed="false">'+svg('label')+'</button>'+
 '<button type="button" data-maison-action="swap-side" title="Changer de côté" aria-label="Changer de côté">'+svg('side')+'</button>'+
 '<button type="button" data-maison-action="close" title="Replier le menu" aria-label="Replier le menu">'+svg('close')+'</button></div></header>'+
 '<div class="maison-rail-scroll">'+
 '<section class="maison-rail-room" data-rail-room="encounter" hidden>'+
 '<div class="maison-mini-actions">'+tool('choose','encounter','Choisir un personnage')+'</div><div class="maison-slot" data-maison-slot="picker"></div><section class="maison-native-category"><h3>Visiter le lieu</h3><div class="maison-native-grid" data-native-zone="encounter"></div></section></section>'+
 '<section class="maison-rail-room" data-rail-room="dialogue" hidden>'+
 '<p class="maison-companion-label">Invite un personnage.</p>'+
 '<div class="maison-mini-actions">'+tool('call','phone','Appeler')+tool('write','write','Écrire')+tool('history','history','Historique')+tool('speech-on','audio','Voix française')+tool('bubble-on','bubbles','Bulles')+'</div>'+
 '<div class="maison-slot" data-maison-slot="history" hidden></div>'+
 '<div class="maison-slot" data-maison-slot="gueststyle"></div>'+
 '<div class="maison-slot" data-maison-slot="leave"></div><section class="maison-native-category"><h3>Dialoguer dans le jeu</h3><div class="maison-native-grid" data-native-zone="dialogue"></div></section></section>'+
 '<section class="maison-rail-room" data-rail-room="explore" hidden>'+
 '<div class="maison-mini-actions">'+modes.map(([id,icon,name])=>tool(id,icon,name)).join('')+'</div>'+
 '<div class="maison-slot maison-legacy-tools" data-maison-slot="views"></div>'+
 '<div class="maison-slot maison-legacy-camera" data-maison-slot="camera"></div><section class="maison-native-category"><h3>Vues et commandes</h3><div class="maison-native-grid" data-native-zone="explore"></div></section></section>'+
 '</div></section>';
 const phone='<button class="maison-phone" type="button" hidden title="Conversation vocale" aria-label="Appeler le personnage" aria-expanded="false">'+svg('phone')+'</button>';
 viewport.insertAdjacentHTML('beforeend',menu+dock+'<output class="maison-nav-current" role="status" aria-live="polite" hidden></output>'+panel+phone);
 const panelNode=$('.maison-rail-panel'),mainDock=$('.maison-dock'),menuToggle=$('.maison-menu-toggle'),phoneNode=$('.maison-phone'),currentLabel=$('.maison-nav-current');
 const picker=$('.guest-picker'),legacyInvite=$('.invite-toggle');
 const voicePanel=$('.voice-conversation'),legacyPhone=$('.conversation-voice-toggle');
 const chat=$('.guest-message'),nativeStudio=$('.options-toggle');
 const panelLabel=$('.maison-rail-title');
 const slots=name=>$('[data-maison-slot="'+name+'"]');
 slots('picker').append(picker);
 slots('history').append($('.thread-history'));
 slots('views').append($('.conversation-tools'));
 slots('camera').append($('.camera-slot'));
 slots('gueststyle').append($('.guest-style'));
 slots('leave').append($('.guest-leave'));
 viewport.append(voicePanel);
 let companion='',current=null,labels=false,lastFocus=null,historyOpen=false,engineBridge=null;
 let menuExpanded=false;
 const labelMap=Object.fromEntries(main.map(([id,short,label])=>[id,label]));
 function setMenuExpanded(expanded){
   menuExpanded=Boolean(expanded);
   mainDock.hidden=!menuExpanded;
   menuToggle.setAttribute('aria-expanded',String(menuExpanded));
   menuToggle.setAttribute('aria-label',menuExpanded?'Replier le menu du Salon':'Ouvrir le menu du Salon');
   menuToggle.title=menuExpanded?'Replier le menu':'Ouvrir le menu';
   if(!menuExpanded){
     close();
     if(nativeDrawerOpen())nativeStudio.click();
   }
   engineBridge?.sync();
 }
 menuToggle.onclick=()=>setMenuExpanded(!menuExpanded);
 function updateButtons(){
   const selected=main.find(item=>item[0]===current);
   currentLabel.textContent=selected?.[1]||'';
   currentLabel.hidden=!selected;
   for(const b of mainDock.querySelectorAll('[data-maison-open]')){
     b.setAttribute('aria-expanded',String(b.dataset.maisonOpen===current&&!panelNode.hidden));
     b.setAttribute('aria-pressed',String(b.dataset.maisonOpen===current&&
       (current==='avatar'||current==='clothes'?nativeDrawerOpen():!panelNode.hidden)));
   }
 }
 function nativeDrawerOpen(){
   const d=$('.studio-drawer');return Boolean(d&&!d.hidden);
 }
 function sync(){
   const hasGuest=Boolean(companion);
   phoneNode.hidden=!hasGuest||legacyPhone.hidden;
   const status=$('.maison-companion-label');
   if(status)status.textContent=hasGuest?'Avec '+companion:'Invite un personnage pour dialoguer.';
   for(const id of ['call','write','history']){
     const button=$('[data-tool="'+id+'"]');if(button)button.disabled=!hasGuest||(id==='call'&&legacyPhone.hidden);
   }
   slots('history').hidden=!historyOpen||!hasGuest;
   slots('leave').hidden=!hasGuest;
   slots('gueststyle').hidden=!hasGuest;
   updateButtons();
 }
 function close(restore=false){
   if(panelNode.hidden)return;
   panelNode.hidden=true;
   current=null;
   updateButtons();engineBridge?.sync();
   if(restore&&lastFocus?.isConnected)lastFocus.focus({preventScroll:true});
 }
 function open(id,origin){
   if(nativeDrawerOpen())nativeStudio.click();
   if(!panelNode.hidden&&current===id){close();return;}
   current=id;lastFocus=origin||null;
   panelNode.hidden=false;
   panelLabel.textContent=labelMap[id]||'Options';
   for(const area of panelNode.querySelectorAll('[data-rail-room]'))area.hidden=area.dataset.railRoom!==id;
   if(id==='encounter'){
     if(picker.hidden)legacyInvite.click();
     else picker.querySelector('.guest-search')?.focus({preventScroll:true});
   }
   updateButtons();sync();engineBridge?.sync();
 }
 function studio(group){
   close();
   const name=group==='avatar'?'body':'underwear';
   root.host.dispatchEvent(new CustomEvent('salon-open-studio',{detail:{category:name}}));
   current=group;updateButtons();engineBridge?.sync();
 }
 function press(id,origin){
   if(id==='avatar'||id==='clothes')studio(id);
   else open(id,origin);
 }
 mainDock.onclick=event=>{
   const b=event.target.closest('[data-maison-open]');if(!b)return;
   press(b.dataset.maisonOpen,b);
 };
 function call(){
   if(!companion){open('encounter',null);return;}
   close();
   if(legacyPhone.hidden)return;
   legacyPhone.click();
 }
 phoneNode.onclick=call;
 function fullscreen(){
   close();
   try{
     if(document.fullscreenElement){void document.exitFullscreen();}
     else if(stage.requestFullscreen){void stage.requestFullscreen().catch(()=>stage.classList.toggle('immersive'));}
     else stage.classList.toggle('immersive');
   }catch{stage.classList.toggle('immersive');}
 }
 function camera(view){
   root.host.dispatchEvent(new CustomEvent('salon-camera-view',{detail:{view}}));
 }
 function action(event){
   const b=event.target.closest('button');if(!b)return;
   const command=b.dataset.maisonAction||b.dataset.tool;
   if(!command)return;
   if(command==='close'){close(true);return;}
   if(command==='swap-side'){stage.classList.toggle('maison-panel-right');engineBridge?.sync();return;}
   if(command==='labels'){
     labels=!labels;
     panelNode.classList.toggle('maison-show-labels',labels);
     b.setAttribute('aria-pressed',String(labels));return;
   }
   if(command==='choose'){
     if(picker.hidden)legacyInvite.click();
     else picker.querySelector('.guest-search')?.focus({preventScroll:true});
     return;
   }
   if(command==='call'){call();return;}
   if(command==='write'){close();chat.focus({preventScroll:true});return;}
   if(command==='speech-on'||command==='bubble-on'){
     const original=$(command==='speech-on'?'.voice-toggle':'.bubbles-toggle');
     if(original&&!original.hidden&&!original.disabled){
       original.click();b.setAttribute('aria-pressed',original.getAttribute('aria-pressed')||'false');
     }
     return;
   }
   if(command==='history'){
     historyOpen=!historyOpen;
     slots('history').hidden=!historyOpen;
     b.setAttribute('aria-pressed',String(historyOpen));
     return;
   }
   if(command==='fullscreen'){fullscreen();return;}
   if(['body','face','side','back'].includes(command)){
     const translated={body:'Corps',face:'Visage',side:'Profil',back:'Dos'};
     camera(translated[command]);return;
   }
   if(command==='wideshot'||command==='movie'){
     const original=$('[data-shot="'+(command==='wideshot'?'wide':'reverse')+'"]');
     original?.click();
   }
 }
 panelNode.addEventListener('click',action);
 root.host.addEventListener('salon-companion-change',event=>{
   companion=String(event.detail?.name||'');
   if(companion)close();
   else if(!voicePanel.hidden)voicePanel.querySelector('.voice-conversation-close')?.click();
   sync();
 });
 const voiceObserver=new MutationObserver(()=>{
   phoneNode.setAttribute('aria-expanded',String(!voicePanel.hidden));
 });
 voiceObserver.observe(voicePanel,{attributes:true,attributeFilter:['hidden']});
 const ownerObserver=new MutationObserver(sync);
 ownerObserver.observe(legacyPhone,{attributes:true,attributeFilter:['hidden']});
 const studioDrawer=$('.studio-drawer');
 if(studioDrawer){
   const drawerObserver=new MutationObserver(()=>{
     if(studioDrawer.hidden&&['avatar','clothes'].includes(current))current=null;
     updateButtons();
   });
   drawerObserver.observe(studioDrawer,{attributes:true,attributeFilter:['hidden','class']});
 }
 root.host.addEventListener('keydown',event=>{
   if(event.key!=='Escape')return;
   if(!panelNode.hidden){close(true);event.preventDefault();}
   else if(!voicePanel.hidden){voicePanel.querySelector('.voice-conversation-close')?.click();event.preventDefault();}
 });
 setMenuExpanded(false);
 sync();updateButtons();
 return {
   open,close,sync,
   linkScene(doc,scene){
     engineBridge?.dispose();
     engineBridge=connectSalonEngine({doc,scene,stage,root});
     engineBridge.sync();
   },
   dispose(){engineBridge?.dispose();engineBridge=null;}
 };
}
