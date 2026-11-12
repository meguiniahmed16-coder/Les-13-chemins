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
 // Flèche de navigation compacte : aucun personnage ni silhouette.
 const arrowSVG=`<svg class="mini-route-arrow" xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M3 2 L22 12 L3 22 L6 13.5 L15 12 L6 10.5 Z"
    fill="#315b49" stroke="#fff8e7" stroke-width="1.25" stroke-linejoin="round"/>
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
  const trail=L.polyline([points[0]],{color:'#24594a',weight:3.6,opacity:.95,dashArray:'2 7',interactive:false}).addTo(map);
  route.forEach((p,i)=>{
   L.circleMarker(points[i],{radius:4.5,weight:1.5,color:'#fff8e9',fillColor:'#8c6840',fillOpacity:1,interactive:false}).addTo(map);
  });
  const marker=L.marker(points[0],{interactive:false,zIndexOffset:600,
   icon:L.divIcon({className:'mini-atlas-arrow',html:arrowSVG,iconSize:[24,24],iconAnchor:[12,12]})
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
    // La pointe indique le sens du segment de carte.
    const dx=(points[completed+1][1]-points[completed][1])*
     Math.cos((points[completed][0]+points[completed+1][0])*Math.PI/360);
    const dy=points[completed+1][0]-points[completed][0];
    const arrow=marker.getElement()?.querySelector('.mini-route-arrow');
    if(arrow)arrow.style.transform='rotate('+Math.atan2(-dy,dx)*180/Math.PI+'deg)';
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
