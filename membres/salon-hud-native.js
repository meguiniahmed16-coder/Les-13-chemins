// Bridge between the public Salon HUD and the existing, fully functional
// controls inside the same-origin V27 3D iframe. Native events stay attached.
export const NATIVE_HUD_ACTIONS=Object.freeze([
 {zone:'encounter',selector:'#actors [data-role="m"]',label:'Avatar masculin',icon:'male'},
 {zone:'encounter',selector:'#actors [data-role="f"]',label:'Avatar féminin',icon:'female'},
 {zone:'encounter',selector:'#shelves',label:'Bibliothèque',icon:'book'},
 {zone:'encounter',selector:'#openBooks',label:'Choisir un ouvrage',icon:'book'},
 {zone:'encounter',selector:'#pin',label:'Sac vert pin',icon:'bag'},
 {zone:'encounter',selector:'#ocre',label:'Sac ocre',icon:'bag'},
 {zone:'encounter',selector:'#angelMode',label:'Mode ange',icon:'wing'},
 {zone:'encounter',selector:'#rise',label:'Se lever',icon:'rise'},
 {zone:'encounter',selector:'#flightFace',label:'Vue de face en vol',icon:'eye'},
 {zone:'encounter',selector:'#beat',label:'Décoller',icon:'wing'},
 {zone:'encounter',selector:'#descent',label:'Descendre',icon:'down'},
 {zone:'encounter',selector:'#tricks',label:'Figures de vol',icon:'loop'},
 {zone:'encounter',selector:'[data-trick="left"]',label:'Tonneau gauche',icon:'loop'},
 {zone:'encounter',selector:'[data-trick="right"]',label:'Tonneau droit',icon:'loop'},
 {zone:'encounter',selector:'[data-trick="loop"]',label:'Boucle',icon:'loop'},
 {zone:'explore',selector:'#recenter',label:'Recentrer',icon:'focus'},
 {zone:'explore',selector:'#lookHome',label:'Regarder vers la maison',icon:'house'},
 {zone:'explore',selector:'#return',label:'Rentrer au Salon',icon:'house'},
 {zone:'explore',selector:'#fullscreen',label:'Plein écran',icon:'full'},
 {zone:'explore',selector:'#helpButton',label:'Aide et commandes',icon:'help'},
 {zone:'explore',selector:'.camera-height [data-height="1"]',label:'Monter la caméra',icon:'up'},
 {zone:'explore',selector:'.camera-height [data-height="-1"]',label:'Descendre la caméra',icon:'down'},
 {zone:'dialogue',selector:'#talk',label:'Dialogue dans le Salon',icon:'chat'},
 {zone:'dialogue',selector:'#past',label:'Historique du dialogue',icon:'history'},
 {zone:'dialogue',selector:'#bubbleSwitch',label:'Bulles du dialogue',icon:'chat'},
 {zone:'dialogue',selector:'#reunionAction',label:'Interaction avec le compagnon',icon:'chat'}
]);
const iconPaths={
 male:'<circle cx="12" cy="6" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3"/>',
 female:'<circle cx="12" cy="6" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3m-6-10v11"/>',
 book:'<path d="M12 5a9 9 0 0 0-9-2v16a9 9 0 0 1 9 2 9 9 0 0 1 9-2V3a9 9 0 0 0-9 2Zm0 0v16"/>',
 bag:'<rect x="5" y="8" width="14" height="13" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
 wing:'<path d="M2 18C7 10 12 5 22 3c-1 9-7 13-13 12L4 21Z"/>',
 rise:'<circle cx="12" cy="4" r="2"/><path d="m12 6-3 6 4 3 1 6m-4-9-4 5m7-2 5 1"/>',
 eye:'<path d="M2 12c5-7 15-7 20 0-5 7-15 7-20 0Z"/><circle cx="12" cy="12" r="3"/>',
 down:'<path d="M12 3v17m-7-7 7 7 7-7"/>',
 up:'<path d="M12 21V4m-7 7 7-7 7 7"/>',
 loop:'<path d="M5 16a7 7 0 1 1 8 4m-8-4V9m0 7h7"/>',
 focus:'<circle cx="12" cy="12" r="4"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>',
 house:'<path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7"/>',
 full:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 4m0 3v.2"/>',
 chat:'<path d="M3 4h18v14H9l-6 3Z"/>',
 history:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>'
};
const picture=name=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+iconPaths[name]+'</svg>';

export function connectSalonEngine({doc,scene,stage,root,groupSelector='[data-native-zone]'}) {
 if(!doc?.body||!doc.getElementById('stage'))return {sync(){},dispose(){}};
 const originalStage=doc.getElementById('stage');
 const originalWhere=doc.querySelector('.bottom .where');
 const originalHint=doc.querySelector('.bottom #hint');
 const bottom=doc.querySelector('.bottom');
 if(originalWhere)originalStage.append(originalWhere);
 if(originalHint)originalStage.append(originalHint);
 const links=[],win=doc.defaultView;
 for(const action of NATIVE_HUD_ACTIONS){
   const source=doc.querySelector(action.selector);
   const zone=root.querySelector('[data-native-zone="'+action.zone+'"]');
   if(!source||!zone)continue;
   const button=root.ownerDocument.createElement('button');
   button.type='button';button.className='maison-tool maison-native-action';
   button.dataset.nativeSelector=action.selector;button.title=action.label;
   button.setAttribute('aria-label',action.label);
   button.innerHTML=picture(action.icon)+'<span>'+action.label+'</span>';
   button.onclick=()=>{if(!button.disabled)source.click();};
   zone.append(button);links.push({source,button,label:action.label});
 }
 function updateActions(){
   for(const {source,button,label} of links){
     const unusable=source.disabled||source.hidden||Boolean(source.closest('[hidden]'));
     button.disabled=Boolean(unusable);
     button.setAttribute('aria-disabled',String(Boolean(unusable)));
     button.setAttribute('aria-pressed',source.getAttribute('aria-pressed')||'false');
     const caption=source.querySelector('#shelfLabel')?.textContent?.trim();
     if(caption&&button.title!==caption)button.title=caption;
     else if(!caption)button.title=label;
   }
 }
 doc.body.classList.add('unified-hud');
 const nativeObserver=new win.MutationObserver(updateActions);
 nativeObserver.observe(doc.body,{subtree:true,attributes:true,attributeFilter:['hidden','disabled','aria-pressed','aria-expanded'],characterData:false});
 // Keep the 3D canvas at full size; shift the projection centre to the unoccluded
 // part of the frame, so the edited character is never under the tools.
 const candidates=[
 root.querySelector('.maison-rail-panel'),
 root.querySelector('.studio-drawer'),
 root.querySelector('.voice-conversation')
 ];
 function measure(){
   const box=stage.getBoundingClientRect();let candidate=null,area=0;
   if(box.width<100)return;
   for(const element of candidates){
     if(!element||element.hidden)continue;
     const rect=element.getBoundingClientRect();
     const overlap=Math.max(0,Math.min(rect.right,box.right)-Math.max(rect.left,box.left));
     if(overlap>area){area=overlap;candidate=rect;}
   }
   const fraction=candidate?Math.min(.46,Math.max(0,area/box.width)):0;
   const side=candidate&&candidate.left+candidate.width*.5>box.left+box.width*.5?'right':'left';
   scene?.setHudOcclusion?.({side,fraction});
   // Keep both 3D joysticks in the unobstructed side of the screen.
   doc.body.classList.toggle('hud-panel-right',fraction>.15&&side==='right');
   doc.body.classList.toggle('hud-panel-left',fraction>.15&&side==='left');
   doc.body.style.setProperty('--hud-panel-width',Math.round(area)+'px');
 }
 let raf=0;
 function requestMeasure(){
   if(raf)return;
   raf=(win?.requestAnimationFrame||requestAnimationFrame)(()=>{raf=0;measure();});
 }
 const hostObserver=new MutationObserver(requestMeasure);
 for(const element of candidates)if(element)hostObserver.observe(element,{attributes:true,attributeFilter:['hidden','class','style']});
 const resize=typeof ResizeObserver!=='undefined'?new ResizeObserver(requestMeasure):null;
 resize?.observe(stage);
 for(const element of candidates)if(element)resize?.observe(element);
 updateActions();requestMeasure();
 return {
  sync(){updateActions();requestMeasure();},
  dispose(){
    if(raf)win?.cancelAnimationFrame?.(raf);
    nativeObserver.disconnect();hostObserver.disconnect();resize?.disconnect();
    scene?.setHudOcclusion?.({side:'left',fraction:0});
    doc.body.classList.remove('unified-hud','hud-panel-right','hud-panel-left');
    doc.body.style.removeProperty('--hud-panel-width');
    if(originalWhere&&bottom)bottom.prepend(originalWhere);
    if(originalHint&&bottom)bottom.append(originalHint);
    for(const {button} of links)button.remove();
  }
 };
}
