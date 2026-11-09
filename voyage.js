/* A bounded interlude: dice, the whole atlas, departure, travel, arrival. */
(function(root){
 'use strict';
 function chapterArrivalLabel(level,titles=[]){
  if(level<=3)return 'Chapitre 1 — « La salle d’attente »';
  if(level<=5)return 'Chapitre 2 — « Même pas mal »';
  return 'Chapitre '+(level-3)+' — '+String(titles[level-1]||'La suite du voyage');
 }
 const styles=`
 #diceDialog.journey-open{width:min(920px,96vw);max-width:96vw;padding:18px;overflow:hidden}
 #diceDialog.journey-open h2{font-size:clamp(25px,4vw,34px);margin:6px 0}
 #journeyFrame{display:block;width:100%;height:min(55dvh,510px);min-height:260px;border:1px solid #b49a6e;border-radius:5px;background:#e8dec6}
 #diceDialog.journey-open .dice-tray,#diceDialog.journey-open .dice-next,#diceDialog.journey-open #diceRule{display:none}
 #diceDialog.journey-open #diceStatus{margin:5px 0 12px;font-size:13px}
 #diceDialog.journey-open #skipDice{margin-top:5px}
 #next{display:block;width:100%;min-height:54px;text-align:center;font-weight:700;background:#a4773e;color:#fffaf0;border-radius:7px;margin:14px 0}
 #mobileGameDock #mobileNext{background:#a4773e;color:#fffaf0;max-width:480px}
 #mobileGameDock:has(#mobileNext:not([hidden])){gap:8px}
 #mobileGameDock:has(#mobileNext:not([hidden])) button{flex:1;min-width:0;font-size:13px}
 html.journey-map,html.journey-map body{height:100%;overflow:hidden}
 html.journey-map body>nav,html.journey-map body>header,html.journey-map aside{display:none!important}
 html.journey-map main{display:block;height:100dvh;min-height:0}
 html.journey-map #map{height:100%;min-height:0;width:100%}
 html.journey-map .map-ribbon{white-space:normal;text-align:center;max-width:85%;width:max-content;font-size:15px;bottom:22px}
 html.journey-map .compass{width:46px!important;height:46px!important;top:14px!important;right:14px!important}
 html.journey-map .compass .rose{font-size:26px!important;line-height:38px!important}
 html.journey-map .compass .north{left:19px!important;font-size:8px!important}
 .journey-stop{display:grid;place-items:center;border:1px solid #675637;border-radius:50%;background:#f9edcf;color:#3d5746;font:bold 12px Arial;box-shadow:0 1px 4px #293d3335}
 html.journey-map .journey-arrival-title{position:absolute;z-index:2005;top:19px;left:50%;transform:translateX(-50%);width:max-content;max-width:min(95vw,740px);padding:12px 22px;border:2px solid #ac8450;border-radius:9px;background:#fff7e9f5;color:#28493d;box-shadow:0 6px 28px #0d262344;text-align:center;font:700 clamp(18px,2.1vw,27px)/1.3 Georgia,serif;pointer-events:none}
 html.journey-map .journey-arrival-title[hidden]{display:none!important}
 @media(max-width:600px){html.journey-map .journey-arrival-title{max-width:94vw;font-size:18px;padding:10px 14px;top:9px}}
 .journey-pointer{display:block;width:27px;height:27px;border-radius:50% 50% 50% 2px;transform:rotate(-45deg);background:#ad7739;border:3px solid #fff8e3;box-shadow:0 0 0 7px #ad773933,0 3px 8px #233b3b66}
 .journey-pointer:after{content:'';position:absolute;width:7px;height:7px;left:7px;top:7px;background:#fff8e3;border-radius:50%}
 .journey-route-stop{background:transparent;border:0}
 .journey-route-stop .journey-place-name{display:inline-block;transform:translate(-35%,-130%);white-space:nowrap;padding:4px 7px;border:1px solid #7d6846;border-radius:7px;background:#fbf0d8;color:#3c5148;font:bold 11px Arial,sans-serif;box-shadow:0 3px 7px #182c2640}
 .journey-route-stop .journey-place-name:before{content:'';display:inline-block;width:8px;height:8px;border-radius:50%;background:#9b7241;border:2px solid #fff7df;margin-right:5px;vertical-align:middle}
 @media(max-width:600px){.journey-route-stop .journey-place-name{font-size:10px;padding:3px 5px}}
 @media(max-width:600px){#diceDialog.journey-open{width:100vw;max-width:100vw;border-width:3px;padding:12px;border-radius:0}#journeyFrame{height:53dvh;min-height:220px}}
 `;
 function install(){if(document.getElementById('journeyStyles'))return;const s=document.createElement('style');s.id='journeyStyles';s.textContent=styles;document.head.append(s);}
 // Shared by the controller and tests: every exit settles once, including timeouts.
 function onceFinish(complete,cleanup){let done=false;return ()=>{if(done)return;done=true;cleanup();complete();};}
 // Itinéraire explicitement choisi pour la transition entre les chapitres 1 et 2.
 // La trace est une ligne de récit entre des centres de villes, pas une route GPS.
 function chapter2Itinerary(from,to,origin,destination){
  if(from!==3||to!==4)return null;
  return [
   {name:'Barcelone',coordinates:origin||[41.387,2.17]},
   {name:'Ferney-Voltaire',coordinates:[46.258,6.108]},
   {name:'Vannes (Bretagne)',coordinates:[47.6587,-2.7599]},
   {name:'Poitiers',coordinates:[46.5803,0.3402]},
   {name:'Sarajevo',coordinates:destination||[43.856,18.413]}
  ];
 }
 function start({from,to,fromPlateau=1,toPlateau=1,title,onFinish}){
  install();const modal=document.getElementById('diceDialog'),status=document.getElementById('diceStatus'),heading=document.getElementById('diceTitle');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches,session=crypto.randomUUID(),hasChapterRoute=from===3&&to===4&&fromPlateau===1&&toPlateau===1;
  const frame=document.createElement('iframe');frame.id='journeyFrame';frame.title='Voyage sur la carte des treize chemins';frame.hidden=true;
  document.getElementById('diceRule').before(frame);
  let ready=false,diceDone=false,started=false,closed=false;const timers=new Set();
  const later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(!closed)fn();},ms);timers.add(id);};
  const finish=onceFinish(onFinish,()=>{closed=true;timers.forEach(clearTimeout);timers.clear();removeEventListener('message',message);modal.removeEventListener('close',finish);frame.remove();modal.classList.remove('journey-open');modal.dataset.phase='idle';if(modal.open)modal.close();});
  function beginMap(){
   if(!diceDone||!ready||started||closed)return;
   started=true;modal.dataset.phase='overview';heading.textContent=hasChapterRoute?'Du chapitre 1 au chapitre 2':'Tous les chemins';status.textContent=hasChapterRoute?'Barcelone → Ferney-Voltaire → Vannes → Poitiers → Sarajevo':'Les lieux du récit se rassemblent…';
   frame.contentWindow.postMessage({type:'journey:start',session},location.origin);
   later(finish,hasChapterRoute?14500:11000);
  }
  function message(e){
   if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.session!==session||closed)return;
   if(e.data.type==='journey:ready'){ready=true;beginMap();}
   else if(e.data.type==='journey:phase'&&started){
    const labels={overview:'Tous les chemins',departure:'Le point de départ',travel:'Le voyage continue',arrival:'Une nouvelle scène'};
    if(!labels[e.data.phase])return;
    modal.dataset.phase=e.data.phase;heading.textContent=labels[e.data.phase];status.textContent=String(e.data.label||'');
   }else if(e.data.type==='journey:done'&&started)finish();
  }
  addEventListener('message',message);modal.addEventListener('close',finish);
  heading.textContent='En route…';status.textContent='Les dés roulent…';document.getElementById('diceDestination').textContent=title;modal.dataset.phase='dice';
  document.getElementById('skipDice').textContent='Passer l’animation →';
  frame.src='carte.html?voyage=1&depart='+from+'&arrivee='+to+'&plateauDepart='+fromPlateau+'&plateauArrivee='+toPlateau+'&session='+encodeURIComponent(session);
  try{modal.showModal();}catch{finish();return finish;}
  // Start clocks immediately: a suspended animation frame cannot trap navigation.
  const dice=[...modal.querySelectorAll('.die-cube')],faces=[0,0].map(()=>Math.floor(Math.random()*6)+1),angles=[[0,0],[0,-90],[-90,0],[90,0],[0,90],[0,180]];
  dice.forEach(d=>{d.style.transition='none';d.style.transform='rotateX(-15deg) rotateY(19deg)';});
  later(()=>dice.forEach((d,i)=>{const [x,y]=angles[faces[i]-1];d.style.transition=reduced?'none':'transform 1.15s cubic-bezier(.16,.7,.27,1)';d.style.transform=`rotateX(${x+720}deg) rotateY(${y+720}deg)`;}),30);
  later(()=>{status.textContent=faces.join(' et ')+' · En route !';},reduced?150:1200);
  later(()=>{
   diceDone=true;modal.classList.add('journey-open');frame.hidden=false;heading.textContent='La carte du voyage';status.textContent='Les chemins se dessinent…';beginMap();
   later(()=>{if(!started)finish();},12000);
  },reduced?350:1550);
  later(finish,25000);
  return finish;
 }
 function initMap({map,points,centers,titles,places}){
  const params=new URLSearchParams(location.search);
  if(params.get('voyage')!=='1'){const stage=root.TreizeEscale?.getStage(Number(params.get('niveau')),Number(params.get('plateau'))||1);if(stage?.plateau>1){map.setView(stage.coordinates,12);root.TreizeEscale.addCharacters(map,stage.level,stage.plateau);const ribbon=document.querySelector('.map-ribbon');if(ribbon)ribbon.textContent=stage.city+' · '+stage.passage.scene;}return;}
  const from=Number(params.get('depart')),to=Number(params.get('arrivee')),session=params.get('session');
  const fromPlateau=Number(params.get('plateauDepart'))||1,toPlateau=Number(params.get('plateauArrivee'))||1;
  const fromStage=root.TreizeEscale?.getStage(from,fromPlateau),toStage=root.TreizeEscale?.getStage(to,toPlateau);
  const within=from===to&&toPlateau===fromPlateau+1&&toStage?.plateau===toPlateau;
  if(!Number.isInteger(from)||from<1||(!within&&to!==from+1)||to>13||!session||parent===root)return;
  install();document.documentElement.classList.add('journey-map');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const origin=fromStage?.coordinates||centers[from-1],destination=toStage?.coordinates||centers[to-1],ribbon=document.querySelector('.map-ribbon');
  const waypointRoute=fromPlateau===1&&toPlateau===1?chapter2Itinerary(from,to,origin,destination):null;
  let started=false,raf=0;const timers=[];
  const send=(type,extra={})=>parent.postMessage({type,session,...extra},location.origin);
  const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
  const phase=(name,label)=>{ribbon.textContent=label;document.getElementById('map').dataset.journeyPhase=name;send('journey:phase',{phase:name,label});};
  const marks=L.layerGroup().addTo(map);
  const chapterBanner=document.createElement('div');
  chapterBanner.className='journey-arrival-title';chapterBanner.hidden=true;
  document.getElementById('map')?.append(chapterBanner);
  function showArrivalTitle(){
   const city=toStage?.city||places[to-1]||'Destination';
   const names=Array.isArray(toStage?.characters)?toStage.characters:[];
   chapterBanner.textContent=chapterArrivalLabel(to,titles)+' · '+city+
    (names.length?' · Personnages : '+names.join(' · '):'');
   chapterBanner.hidden=false;
  }
  const stops=centers.map((p,i)=>L.marker(p,{interactive:false,icon:L.divIcon({className:'journey-stop',html:String(i+1),iconSize:[23,23],iconAnchor:[11,11]})}).addTo(marks));
  const pointer=L.marker(origin,{interactive:false,zIndexOffset:1000,icon:L.divIcon({className:'',html:'<span class="journey-pointer"></span>',iconSize:[27,27],iconAnchor:[13,27]})});
  const distance=map.distance(origin,destination),travelZoom=distance>500000?6:distance>100000?8:distance>10000?10:13;
  const trace=L.polyline([],{color:'#a9773d',weight:3,dashArray:'6 7',opacity:.85,interactive:false});
  const at=t=>[origin[0]+(destination[0]-origin[0])*t+Math.sin(Math.PI*t)*Math.min(1.2,Math.abs(destination[1]-origin[1])*.08),origin[1]+(destination[1]-origin[1])*t];
  function arrive(){
   cancelAnimationFrame(raf);pointer.setLatLng(destination);
   map.setView(destination,reduced?travelZoom:Math.min(12,travelZoom+1),{animate:false});
   showArrivalTitle();
   phase('arrival',chapterArrivalLabel(to,titles)+' · '+(toStage?.city||places[to-1]));
   root.TreizeEscale?.addCharacters(map,to,toPlateau);
   later(()=>send('journey:done'),3400);
  }
  function travel(){
   if(waypointRoute){
    // Le personnage avance sur quatre tronçons pointillés, dans l'ordre demandé.
    // Chaque arrêt possède un marqueur et son nom, sans modifier l'atlas source.
    stops.forEach(m=>marks.removeLayer(m));
    for(const point of waypointRoute){
     const icon=L.divIcon({className:'journey-route-stop',html:'<span class="journey-place-name">'+point.name+'</span>',iconSize:[14,14],iconAnchor:[7,7]});
     L.marker(point.coordinates,{interactive:false,icon}).addTo(marks);
    }
    trace.addTo(map);
    const coordinates=waypointRoute.map(p=>p.coordinates);
    if(reduced){
     trace.setLatLngs(coordinates);
     pointer.setLatLng(destination);
     phase('travel',waypointRoute.map(p=>p.name).join(' → '));
     later(arrive,650);return;
    }
    const duration=4400,segments=coordinates.length-1,began=performance.now();
    let lastLeg=-1,lastPan=0;
    function tick(now){
     const raw=Math.min(1,(now-began)/duration);
     const scaled=raw*segments,leg=Math.min(segments-1,Math.floor(scaled));
     const local=scaled-leg,eased=local*local*(3-2*local);
     const a=coordinates[leg],b=coordinates[leg+1];
     const p=[a[0]+(b[0]-a[0])*eased,a[1]+(b[1]-a[1])*eased];
     pointer.setLatLng(p);
     trace.setLatLngs([...coordinates.slice(0,leg+1),p]);
     if(leg!==lastLeg){
      lastLeg=leg;
      phase('travel',waypointRoute[leg].name+' → '+waypointRoute[leg+1].name);
     }
     if(now-lastPan>45){map.panTo(p,{animate:false});lastPan=now;}
     if(raw<1)raf=requestAnimationFrame(tick);
    }
    raf=requestAnimationFrame(tick);
    later(arrive,duration+80);
    return;
   }
   phase('travel',(fromStage?.city||places[from-1])+' → '+(toStage?.city||places[to-1]));stops.forEach((m,i)=>{if(i!==from-1&&i!==to-1)marks.removeLayer(m);});trace.addTo(map);
   if(reduced){trace.setLatLngs([origin,destination]);later(arrive,350);return;}
   const duration=3500,began=performance.now();let lastPan=0;
   function tick(now){const raw=Math.min(1,(now-began)/duration),t=raw*raw*(3-2*raw),p=at(t),count=Math.ceil(t*60)+1;pointer.setLatLng(p);trace.setLatLngs(Array.from({length:count},(_,i)=>at(t*i/Math.max(1,count-1))));if(now-lastPan>45){map.panTo(p,{animate:false});lastPan=now;}if(raw<1)raf=requestAnimationFrame(tick);}
   raf=requestAnimationFrame(tick);later(arrive,duration+80);
  }
  function depart(){
   phase('departure',(fromStage?.city||places[from-1])+' · '+(fromStage?.passage?.scene||titles[from-1]));pointer.addTo(map);
   if(reduced)map.setView(origin,travelZoom,{animate:false});else map.flyTo(origin,travelZoom,{duration:1.15});
   later(()=>{map.stop();map.setView(origin,travelZoom,{animate:false});travel();},reduced?350:1550);
  }
  function message(e){if(e.source!==parent||e.origin!==location.origin||e.data?.type!=='journey:start'||e.data.session!==session||started)return;started=true;
   map.invalidateSize({animate:false});map.stop();map.fitBounds(L.latLngBounds((waypointRoute?waypointRoute.map(p=>p.coordinates):points.map(p=>[+p.latitude,+p.longitude])).map(p=>[+p[0],+p[1]])).pad(.08),{animate:false,padding:[22,36]});
   phase('overview','Tous les lieux, treize étapes');later(depart,reduced?350:1300);
  }
  addEventListener('message',message);send('journey:ready');
  addEventListener('pagehide',()=>{cancelAnimationFrame(raf);timers.forEach(clearTimeout);removeEventListener('message',message);},{once:true});
 }
 root.TreizeVoyage={start,initMap,onceFinish,chapter2Itinerary,chapterArrivalLabel};
 if(typeof document!=='undefined')install();
})(typeof window==='undefined'?globalThis:window);
