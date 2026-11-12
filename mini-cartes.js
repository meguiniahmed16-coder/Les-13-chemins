/* Mini-atlas narratif : deux cartes compactes, sans changement des 13 niveaux ni des scores. */
(function(){
 'use strict';
 const ROUTES={
  'one-two':[
   ['Barcelone',41.387,2.17],['Ferney-Voltaire',46.258,6.108],
   ['Vannes',47.6587,-2.7599],['Poitiers',46.5803,0.3402],['Sarajevo',43.856,18.413]
  ],
  'two-three':[
   ['Sarajevo',43.856,18.413],['Genève',46.204,6.143],
   ['Lyon',45.764,4.836],['Louvain-la-Neuve',50.669,4.612],
   ['Paris',48.8566,2.3522],['Strasbourg',48.583,7.745]
  ]
 };
 const CSS='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
 const JS='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
 const walkerSVG=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 56" aria-hidden="true">
 <defs><linearGradient id="coat" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#647e6b"/><stop offset="1" stop-color="#274d43"/></linearGradient></defs>
 <ellipse cx="21" cy="53" rx="11" ry="2.2" fill="#20352b" opacity=".25"/>
 <path d="M10 17Q3 19 5 32L8 38 15 37 16 20Z" fill="#946b3c" stroke="#3b3228" stroke-width="1.5"/>
 <path d="M8 19L5 25M8 32L6 36" fill="none" stroke="#d7bb83" stroke-width="1.5"/>
 <path d="M15 16Q21 12 28 17L30 35 14 35Z" fill="url(#coat)" stroke="#263c32" stroke-width="1.5"/>
 <path d="M16 20L26 27M27 19L16 29" stroke="#c2ab78" stroke-width="2" opacity=".9"/>
 <path d="M19 34L17 43 12 50 18 51 23 44 24 36" fill="#334d53" stroke="#26343a" stroke-width="1.4"/>
 <path d="M24 35L29 43 33 49 28 52 23 46 21 37" fill="#344c54" stroke="#26343a" stroke-width="1.4"/>
 <path d="M12 50L9 53 19 54 18 51M28 52L27 54 37 54 33 49" fill="#473c31" stroke="#282720" stroke-width="1"/>
 <path d="M15 21L11 33 9 36M29 20L33 31 34 35" fill="none" stroke="#d1a27b" stroke-width="4" stroke-linecap="round"/>
 <path d="M34 32L37 54" stroke="#765333" stroke-width="1.8" stroke-linecap="round"/>
 <path d="M17 15L17 12 26 12 26 16" fill="#c9946d"/>
 <ellipse cx="21" cy="9.5" rx="7" ry="8" fill="#d3a17b" stroke="#8b694f" stroke-width="1"/>
 <path d="M14 8Q14 -1 22 1Q28 1 28 8L25 6 16 7Z" fill="#4b4438"/>
 <path d="M13 6Q19 1 27 5L29 8 12 9Z" fill="#675b46" stroke="#453b32" stroke-width="1"/>
 <circle cx="24" cy="10" r=".75" fill="#40392e"/>
 <path d="M24 13Q22 14 20 13" stroke="#825c46" stroke-width=".7" fill="none"/>
 </svg>`;
 let loaded=null;
 function leaflet(){
  if(loaded)return loaded;
  // Leaflet CSS must be ready before any map is created. Otherwise the SVG
  // overlays and tiles inherit the generic styles of the large game board.
  loaded=new Promise((resolve,reject)=>{
   const cssReady=Array.from(document.styleSheets).some(sheet=>
    (sheet.href||'').includes('/leaflet@1.9.4/dist/leaflet.css'));
   let stylesheet=Promise.resolve();
   if(!cssReady){
    stylesheet=new Promise((yes,no)=>{
     const link=document.createElement('link');
     link.rel='stylesheet';link.href=CSS;link.dataset.miniAtlas='1';
     link.onload=yes;link.onerror=()=>no(new Error('Feuille de style cartographique indisponible'));
     document.head.append(link);
    });
   }
   const library=window.L?Promise.resolve(window.L):new Promise((yes,no)=>{
    const script=document.createElement('script');script.src=JS;script.async=true;
    script.onload=()=>window.L?yes(window.L):no(new Error('Leaflet indisponible'));
    script.onerror=()=>no(new Error('Impossible de charger la carte'));
    document.head.append(script);
   });
   Promise.all([stylesheet,library]).then(([,L])=>resolve(L)).catch(reject);
  });
  return loaded;
 }
 function interpolate(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}
 function init(el,L){
  if(el.dataset.ready)return;
  el.dataset.ready='1';
  const route=ROUTES[el.dataset.route];if(!route)return;
  const points=route.map(p=>[p[1],p[2]]);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const map=L.map(el,{zoomControl:false,dragging:false,scrollWheelZoom:false,
   doubleClickZoom:false,boxZoom:false,keyboard:false,touchZoom:false,attributionControl:true});
  // Leaflet affiche par défaut un drapeau ukrainien dans son préfixe d'attribution.
  // Désactiver uniquement ce préfixe ; conserver le crédit © OpenStreetMap.
  map.attributionControl.setPrefix(false);
  // Le fond d'origine reste identique à celui de l'atlas principal.
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
   maxZoom:18,attribution:'© OpenStreetMap contributors',crossOrigin:true
  }).addTo(map);
  const bounds=L.latLngBounds(points);
  map.fitBounds(bounds,{padding:[17,22],maxZoom:7,animate:false});
  const line=L.polyline(points,{color:'#765e3f',weight:2.6,opacity:.8,dashArray:'3 8',interactive:false}).addTo(map);
  const trail=L.polyline([points[0]],{color:'#315b4b',weight:3.5,opacity:.9,interactive:false}).addTo(map);
  route.forEach((p,i)=>{
   L.circleMarker(points[i],{radius:4.5,weight:1.5,color:'#fff8e9',fillColor:'#8c6840',fillOpacity:1,interactive:false}).addTo(map);
  });
  const marker=L.marker(points[0],{interactive:false,zIndexOffset:600,
   icon:L.divIcon({className:'mini-atlas-walker',html:walkerSVG,iconSize:[36,49],iconAnchor:[18,47]})
  }).addTo(map);
  const name=L.marker(points[0],{interactive:false,zIndexOffset:550,
   icon:L.divIcon({className:'mini-atlas-label',html:route[0][0],iconSize:null,iconAnchor:[-14,12]})
  }).addTo(map);
  // Chaque traversée ne joue qu'une fois par affichage de la page.
  // Une sortie du champ suspend le mouvement ; le retour le reprend sans le relancer.
  const segmentMs=2800,totalMs=(points.length-1)*segmentMs;
  let elapsed=0,lastFrame=0,previous=-1,frame=0,visible=false,hasStarted=false,finished=false;
  const replay=document.createElement('button');
  replay.type='button';replay.className='mini-atlas-replay';replay.textContent='↻ Rejouer le trajet';
  replay.setAttribute('aria-label','Rejouer le trajet '+route[0][0]+' – '+route[route.length-1][0]);
  replay.hidden=true;
  el.parentElement?.insertBefore(replay,el.nextSibling);
  function draw(at){
   const completed=Math.min(points.length-2,Math.floor(at/segmentMs));
   const local=Math.max(0,Math.min(1,(at-completed*segmentMs)/segmentMs));
   const eased=local*local*(3-2*local);
   const position=interpolate(points[completed],points[completed+1],eased);
   marker.setLatLng(position);name.setLatLng(position);
   if(previous!==completed){
    name.setIcon(L.divIcon({className:'mini-atlas-label',
     html:route[completed][0]+' → '+route[completed+1][0],
     iconSize:null,iconAnchor:[-14,12]}));
    previous=completed;
   }
   trail.setLatLngs([...points.slice(0,completed+1),position]);
   map.panTo(position,{animate:false});
  }
  function finish(){
   finished=true;cancelAnimationFrame(frame);frame=0;lastFrame=0;
   elapsed=totalMs;
   marker.setLatLng(points[points.length-1]);
   name.setLatLng(points[points.length-1]);
   name.setIcon(L.divIcon({className:'mini-atlas-label',
    html:route[route.length-1][0],iconSize:null,iconAnchor:[-14,12]}));
   trail.setLatLngs(points);
   replay.hidden=false;
  }
  function tick(now){
   if(!visible||finished||!el.isConnected)return;
   if(lastFrame)elapsed=Math.min(totalMs,elapsed+Math.max(0,Math.min(120,now-lastFrame)));
   lastFrame=now;
   draw(elapsed);
   if(elapsed>=totalMs){finish();return;}
   frame=requestAnimationFrame(tick);
  }
  function resume(){
   if(!visible||finished)return;
   if(reduced){finish();return;}
   cancelAnimationFrame(frame);lastFrame=0;
   frame=requestAnimationFrame(tick);
  }
  const viewObserver=new IntersectionObserver(entries=>{
   visible=entries.some(e=>e.isIntersecting);
   if(visible){
    if(!hasStarted){hasStarted=true;resume();}
    else if(!finished)resume();
   }else{
    cancelAnimationFrame(frame);frame=0;lastFrame=0;
   }
  },{threshold:.12});
  viewObserver.observe(el);
  replay.onclick=()=>{
   cancelAnimationFrame(frame);frame=0;
   elapsed=0;lastFrame=0;previous=-1;finished=false;hasStarted=true;
   replay.hidden=true;
   marker.setLatLng(points[0]);name.setLatLng(points[0]);trail.setLatLngs([points[0]]);
   map.panTo(points[0],{animate:false});
   resume();
  };
  const resize=new ResizeObserver(()=>map.invalidateSize({animate:false}));resize.observe(el);
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);viewObserver.disconnect();resize.disconnect();},{once:true});
 }
 function mount(){
  const nodes=[...document.querySelectorAll('.mini-atlas-map:not([data-ready])')];
  if(!nodes.length)return;
  leaflet().then(L=>nodes.forEach(node=>init(node,L))).catch(()=>{
   nodes.forEach(node=>{node.textContent='Carte temporairement indisponible · '+ROUTES[node.dataset.route].map(p=>p[0]).join(' → ');node.style.padding='22px';});
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
 window.TreizeMiniAtlas={routes:ROUTES,mount};
})();
