(function(){
 'use strict';
 const data=window.TreizeUpcomingData;if(!data||typeof map==='undefined'||!window.L)return;
 const sidebar=document.querySelector('main>aside'),container=document.createElement('section');container.className='upcoming-atlas-controls';
 const heading=document.createElement('h2');heading.textContent='Chemins IV et V';
 const label=document.createElement('label');label.htmlFor='upcomingAtlasScene';label.textContent='Les lieux des scènes en préparation';
 const select=document.createElement('select');select.id='upcomingAtlasScene';
 const option=document.createElement('option');option.value='';option.textContent='Choisir une scène';select.append(option);
 for(const path of data.paths){const group=document.createElement('optgroup');group.label='Chemin '+path.id;for(const id of path.scenes){const s=data.scenes.find(s=>s.id===id),o=document.createElement('option');o.value=id;o.textContent=s.title;group.append(o);}select.append(group);}
 container.append(heading,label,select);sidebar.prepend(container);
 let overlay=null,active=null,savedRibbon='';
 const legacy=[document.getElementById('quest-panel'),document.getElementById('list'),document.getElementById('count')];
 const ribbon=document.querySelector('.map-ribbon');
 function clear(){
  if(overlay){map.removeLayer(overlay);overlay=null;}
  if(!map.hasLayer(layer))map.addLayer(layer);
  if(active){legacy.forEach(el=>{if(el)el.hidden=false;});if(ribbon)ribbon.textContent=savedRibbon;document.getElementById('detail').textContent='Sélectionnez un repère sur la carte ou dans le répertoire.';}
  active=null;select.value='';
 }
 const oldRender=render;render=function(){clear();return oldRender();};
 // The original search handler captured render before this wrapper existed.
 // Rebind it so a search restores the historical map and its visible results.
 document.getElementById('search').oninput=()=>render();
 function show(id){
  const scene=data.scenes.find(s=>s.id===id);if(!scene){clear();render();return;}
  clear();map.stop();active=id;select.value=id;
  legacy.forEach(el=>{if(el)el.hidden=true;});
  if(ribbon){savedRibbon=ribbon.textContent;ribbon.textContent='Chemin '+scene.path+' · '+scene.title;}
  const route=data.routes[scene.route];map.removeLayer(layer);overlay=L.featureGroup().addTo(map);
  const points=route.points.map(p=>[p[1],p[2]]);
  if(points.length>1)L.polyline(points,{color:'#315b49',weight:3,dashArray:'3 8'}).addTo(overlay);
  route.points.forEach((p,i)=>L.circleMarker([p[1],p[2]],{radius:7,color:'#fff5dc',weight:2,fillColor:'#315b49',fillOpacity:1}).bindTooltip((i+1)+' · '+p[0]).addTo(overlay));
  if(route.destination){const p=route.destination;L.circleMarker([p[1],p[2]],{radius:8,color:'#9b733b',weight:2,fill:false,dashArray:'3 3'}).bindTooltip(p[0]).addTo(overlay);}
  map.fitBounds(overlay.getBounds(),{padding:[35,40],maxZoom:route.zoom,animate:false});
  const panel=document.getElementById('detail');panel.replaceChildren();
  const title=document.createElement('h2');title.textContent=scene.title;
  const status=document.createElement('p');status.className='upcoming-status';status.textContent='Chemin '+scene.path+' · Travail en cours';
  const caption=document.createElement('p');caption.textContent=route.caption;
  const notice=document.createElement('p');notice.className='notice';notice.textContent='Repères reliés schématiquement, sans trace GPS.'+(route.destination?' Le cercle ouvert indique une destination.':'');
  const list=document.createElement('ol');route.points.forEach(p=>{const li=document.createElement('li');li.textContent=p[0];list.append(li);});
  if(route.destination){const li=document.createElement('li');li.textContent=route.destination[0];list.append(li);}
  const read=document.createElement('a');read.className='upcoming-button';read.href='jeu.html?scene='+scene.id+'&vue=map';read.textContent='Découvrir cette scène';
  panel.append(title,status,list,caption,notice,read);
 }
 select.addEventListener('change',()=>show(select.value));
 const previousDetail=detail;detail=function(...args){clear();return previousDetail(...args);};
 const requested=new URLSearchParams(location.search).get('scene');if(requested)show(requested);
})();
