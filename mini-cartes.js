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
 const walkerSVG=`<svg class="pilgrim-figure" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 92" aria-hidden="true" focusable="false">
 <!-- Marcheur de profil : chaussures, membres articulés, veste, sangles et sac de randonnée -->
 <ellipse cx="31" cy="87" rx="19" ry="3.1" fill="#162e25" opacity=".22"/>
 <g class="pilgrim-leg pilgrim-leg--far">
  <path d="M29 50 Q26 59 24 68 L17 79 23 82 31 71 Q35 62 34 52Z" fill="#425463" stroke="#293a44" stroke-width="1.3"/>
  <path d="M24 66L30 69M18 78L23 80" stroke="#a0a6a0" stroke-width="1" opacity=".75"/>
  <path d="M17 78 Q14 81 8 84 L9 88 26 88 26 84 23 79Z" fill="#453e37" stroke="#282921" stroke-width="1.4"/>
  <path d="M10 84L24 84" stroke="#b69f77" stroke-width="1" stroke-dasharray="2 2"/>
 </g>
 <g class="pilgrim-arm pilgrim-arm--far">
  <path d="M29 31Q23 36 20 45L16 51Q16 54 19 54L23 51 32 39Z" fill="#486352" stroke="#293f34" stroke-width="1.4"/>
  <path d="M17 49L14 54Q16 58 20 56L22 52" fill="#bf8e70" stroke="#805d4d" stroke-width="1"/>
 </g>
 <g class="pilgrim-leg pilgrim-leg--near">
  <path d="M32 51 L39 68 47 80 53 78 45 65 40 50Z" fill="#354c57" stroke="#263842" stroke-width="1.5"/>
  <path d="M37 65L44 68M46 78L52 79" stroke="#a0a6a0" stroke-width="1" opacity=".72"/>
  <path d="M46 79L52 78 59 85Q62 87 60 89L45 89Q42 87 46 79Z" fill="#4a4036" stroke="#282921" stroke-width="1.4"/>
  <path d="M46 85L58 86" stroke="#c4a878" stroke-width="1" stroke-dasharray="2 2"/>
 </g>
 <g class="pilgrim-body">
  <!-- Sac de randonnée structuré, sangles et pochette latérale -->
  <path d="M13 27Q12 22 18 20L28 20Q33 23 32 30L33 46Q33 52 28 54L14 51Q9 47 11 40Z" fill="#9a7850" stroke="#483c2d" stroke-width="1.6"/>
  <path d="M14 25Q19 21 28 24L29 31 13 30Z" fill="#c4a379" stroke="#5e4b35" stroke-width="1.2"/>
  <path d="M11 34L12 46Q17 51 24 50L24 35" fill="#856844" stroke="#5e4b35" stroke-width="1.1"/>
  <path d="M12 40L21 41M17 32V46" stroke="#e2cba4" stroke-width="1" opacity=".8"/>
  <path d="M12 44L7 45 8 52 15 53 17 46Z" fill="#6d704e" stroke="#484d35" stroke-width="1"/>
  <path d="M13 45L15 48M9 48L14 48" stroke="#c3b48f" stroke-width=".8"/>
  <path d="M17 18Q15 15 17 13L28 13Q31 16 29 20Z" fill="#718176" stroke="#3f5149" stroke-width="1.2"/>
  <path d="M20 16H27" stroke="#bfc5aa" stroke-width="1.2"/>
  <!-- Veste de marche, capuche et épaules -->
  <path d="M29 28Q35 25 42 29L45 39 43 54Q33 59 27 53L27 35Z" fill="#3d6656" stroke="#263e36" stroke-width="1.6"/>
  <path d="M29 30Q34 27 36 31L32 37 27 36Z" fill="#658673"/>
  <path d="M36 30L39 54" stroke="#bec8a7" stroke-width="1.4"/>
  <path d="M35 43L40 43M35 46L40 46" stroke="#284737" stroke-width=".9"/>
  <path d="M28 37Q23 38 22 46M29 31Q32 36 34 38" fill="none" stroke="#d1bd8c" stroke-width="3" stroke-linecap="round"/>
  <path d="M23 45L31 47" stroke="#cbb789" stroke-width="2.2"/>
  <rect x="26" y="46" width="4" height="3" rx=".6" fill="#e2ce9f" stroke="#5a5140" stroke-width=".6"/>
  <path d="M30 51L43 51 43 55Q36 59 29 55Z" fill="#43534c" stroke="#293f36" stroke-width="1.2"/>
  <!-- Cou et visage de profil, casquette et cheveux -->
  <path d="M36 31L36 26 42 25 43 31Z" fill="#bb8b6e"/>
  <path d="M36 17Q39 13 44 16Q50 19 48 26L46 28 45 31Q39 32 36 27Z" fill="#d5a681" stroke="#8e6854" stroke-width="1.15"/>
  <path d="M36 17Q39 11 46 14L49 19 45 19Q40 17 37 21Z" fill="#574839"/>
  <path d="M34 15Q39 9 47 13L49 17 34 18Z" fill="#53645a" stroke="#35473c" stroke-width="1.2"/>
  <path d="M46 17L53 19 53 21 47 20" fill="#41564b" stroke="#35473c" stroke-width="1"/>
  <path d="M48 22L51 24 48 25" fill="#c99474" stroke="#8e6854" stroke-width=".7"/>
  <circle cx="45.2" cy="21.8" r=".8" fill="#3c332d"/>
  <path d="M44 27Q46 29 48 27" stroke="#7b5848" stroke-width=".9" fill="none"/>
 </g>
 <g class="pilgrim-arm pilgrim-arm--near">
  <path d="M41 32Q45 33 48 40L51 50 48 53 43 48 38 38Z" fill="#4e735f" stroke="#27483b" stroke-width="1.6"/>
  <path d="M48 51Q46 55 48 58L51 58 53 53Z" fill="#c79570" stroke="#89644b" stroke-width=".9"/>
  <path d="M48 55L52 87" stroke="#725034" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M46 57L51 56" stroke="#f4e0b3" stroke-width="1.2"/>
 </g>
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
   icon:L.divIcon({className:'mini-atlas-walker',html:walkerSVG,iconSize:[48,68],iconAnchor:[24,65]})
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
  function animateLimbs(active){el.dataset.walking=active?'true':'false';}
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
    // Le marcheur se tourne vers le sens du déplacement (est / ouest).
    marker.getElement()?.querySelector('.pilgrim-figure')?.classList.toggle('faces-left',
     points[completed+1][1]<points[completed][1]);
   }
   trail.setLatLngs([...points.slice(0,completed+1),position]);
   map.panTo(position,{animate:false});
  }
  function finish(){
   animateLimbs(false);
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
   animateLimbs(true);
   cancelAnimationFrame(frame);lastFrame=0;
   frame=requestAnimationFrame(tick);
  }
  const viewObserver=new IntersectionObserver(entries=>{
   visible=entries.some(e=>e.isIntersecting);
   if(visible){
    if(!hasStarted){hasStarted=true;resume();}
    else if(!finished)resume();
   }else{
    animateLimbs(false);
    cancelAnimationFrame(frame);frame=0;lastFrame=0;
   }
  },{threshold:.12});
  viewObserver.observe(el);
  replay.onclick=()=>{
   cancelAnimationFrame(frame);frame=0;
   elapsed=0;lastFrame=0;previous=-1;finished=false;hasStarted=true;
   replay.hidden=true;
   marker.getElement()?.querySelector('.pilgrim-figure')?.classList.remove('faces-left');
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
