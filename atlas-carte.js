(() => {
 'use strict';
 const A=window.TreizeAtlasPersonnages;
 if(!A)return;
 const {element:el,button:btn,normal}=A;
 const params=()=>new URL(location.href);

 // First page of each chapter in the body of V17, followed by the first page of the annexes.
 const chapterPages=[7,27,46,61,73,82,88,119,133,134,141,147,152,155,158,169,171,175,180,184,190,196,204,211,218,222,225,231,235,244,260,264,268,277,287,297,301,308,315,327];
 function chapterDirectory(all,scene){
   const chapter=Number(scene.chapter),first=chapterPages[chapter-1],next=chapterPages[chapter];
   const {present,remaining}=A.roster(all,scene.id,chapter);
   const people=[],byCity=new Map(),onscreen=new Set();
   const unknown='sans-commune',adaptation='lieu-adaptation';
   for(const original of [...present,...remaining]){
     const places=[];
     for(const place of original.places||[]){
       const ranges=place.pages.split(',').map(part=>part.trim().split(/[–-]/).map(Number));
       const pages=ranges.filter(([a,b=a])=>a<next&&b>=first).map(([a,b=a])=>{
         const lo=Math.max(first,a),hi=Math.min(next-1,b);
         return lo===hi?String(lo):lo+'–'+hi;
       });
       if(pages.length)places.push({...place,pages:pages.join(', ')});
     }
     const person={...original,places};people.push(person);
     if(present.includes(original))onscreen.add(person);
     const ids=places.length?places.map(p=>p.city):[person.id?unknown:adaptation];
     for(const city of new Set(ids)){
       if(!byCity.has(city))byCity.set(city,[]);
       byCity.get(city).push(person);
     }
   }
   const cities=all.cities.filter(c=>byCity.has(c.id)).map(c=>c.id===unknown?{...c,name:'Lieu non précisé dans le chapitre'}:c);
   if(byCity.has(adaptation))cities.push({id:adaptation,name:'Salon de l’adaptation',coords:null});
   return {...all,people,cities,byCity,present:onscreen};
 }
 let nextId=0;
 function createMap(panel,scene,standalone=false){
   const inputId='ap-lookup-'+(++nextId);
   panel.innerHTML=`<div class="ap-directory"><label for="${inputId}">Une ville ou un personnage</label><input id="${inputId}" type="search" placeholder="Paris, Nora, 081…" autocomplete="off"><span class="ap-live" role="status">Chargement de l’atlas…</span><div class="ap-results" aria-label="Répertoire de l’atlas"></div></div>
<div class="ap-canvas" tabindex="0" aria-label="Carte des rencontres. Les flèches déplacent la carte."><img class="ap-land" src="atlas-territoires.svg" alt="" draggable="false"><div class="ap-pins"></div><div class="ap-mapcaption">Atlas des personnages</div>
<div class="ap-cloud" hidden><div class="ap-cloudhead"><h3 tabindex="-1"></h3><button type="button" class="ap-cloudclose" aria-label="Fermer le nuage">×</button></div><div class="ap-clouditems"></div></div>
<div class="ap-unlocated"></div><div class="ap-controls"><button type="button" class="ap-plus" aria-label="Agrandir la carte">+</button><button type="button" class="ap-minus" aria-label="Réduire la carte">−</button><button type="button" class="ap-reset">Recentrer</button></div></div>`;
   if(scene){
     panel.classList.add('ap-scene-map');
     panel.querySelector('.ap-mapcaption').textContent='Personnages du chapitre '+Number(scene.chapter);
     panel.querySelector('.ap-directory input').placeholder='Nom, ville ou numéro…';
     panel.querySelector('.ap-reset').textContent='Tout le chapitre';
   }
   function address(view,city,person){
     if(!standalone)return;
     const url=params();
     if(view)url.searchParams.set('vue','personnages');
     else if(scene)url.searchParams.set('vue','chemins');
     else url.searchParams.delete('vue');
     for(const [k,v] of [['ville',city],['personnage',person]]){if(v)url.searchParams.set(k,v);else url.searchParams.delete(k);}
     history.replaceState(history.state,'',url);
   }
   let data,started=false,cityId=null;
   const form=panel.querySelector('.ap-directory'),search=form.querySelector('input'),results=form.querySelector('.ap-results');
   const canvas=panel.querySelector('.ap-canvas'),terrain=canvas.querySelector('img'),pins=canvas.querySelector('.ap-pins');
   const cloud=canvas.querySelector('.ap-cloud'),cloudTitle=cloud.querySelector('h3'),cloudItems=cloud.querySelector('.ap-clouditems');
   const live=panel.querySelector('.ap-live');
   const merc=lat=>-180/Math.PI*Math.log(Math.tan(Math.PI/4+Math.PI*lat/360));
   let cx=2,cy=merc(46.3),zoom=1;
   const dimensions=()=>({w:canvas.clientWidth,h:canvas.clientHeight});
   function scale(){const {w,h}=dimensions();return Math.min(w/19,h/17)*zoom;}
   function project(lon,y){const {w,h}=dimensions(),s=scale();return [w/2+(lon-cx)*s,h/2+(y-cy)*s];}
   function sortNames(a,b){return a.name.localeCompare(b.name,'fr',{sensitivity:'base'})||a.id-b.id;}
   function closeCloud(focus=false){
     cloud.hidden=true;cityId=null;address(true,null,null);draw();
     if(focus)canvas.focus({preventScroll:true});
   }
   function openCloud(title,buttons,focus=true){
     cloudTitle.textContent=title;cloudItems.replaceChildren(...buttons);cloud.hidden=false;cloud.scrollTop=0;
     if(focus)cloudTitle.focus({preventScroll:true});
   }
   function pickCity(city,save=true,focus=true){
     cityId=city.id;
     if(city.coords){cx=city.coords[1];cy=merc(city.coords[0]);zoom=Math.max(zoom,3);}
     const people=data.byCity.get(city.id).slice().sort(sortNames);
     const items=[];
     function add(group,label){
       if(!group.length)return;
       if(label)items.push(el('h4','ap-group-title',label));
       items.push(...group.map(p=>A.chip(p,()=>A.show(p,data,city.id))));
     }
     if(scene){
       add(people.filter(p=>data.present.has(p)),'Dans cette scène');
       add(people.filter(p=>!data.present.has(p)),'Les personnages que vous ne connaissez pas encore');
     }else add(people);
     draw();openCloud(city.name+' · '+people.length+' personnage'+(people.length>1?'s':''),items,focus);
     if(save)address(true,city.id,null);
   }
   function openCluster(group){
     if(group.length===1){pickCity(group[0].city);return;}
     cityId=null;address(true,null,null);
     openCloud('Choisir une ville',group.map(t=>t.city).sort(sortNames).map(c=>
       btn(c.name+' · '+data.byCity.get(c.id).length,()=>pickCity(c),'ap-townitem')));
   }
   function draw(){
     if(!data||panel.hidden)return;
     const {w,h}=dimensions(),s=scale(),[l,t]=project(-15,merc(58));
     Object.assign(terrain.style,{left:l+'px',top:t+'px',width:60*s+'px',height:(merc(29)-merc(58))*s+'px'});
     pins.replaceChildren();const groups=[];
     for(const city of data.cities){
       if(!city.coords)continue;
       const [x,y]=project(city.coords[1],merc(city.coords[0]));
       if(x<0||x>w||y<0||y>h)continue;
       const near=groups.find(g=>Math.hypot(g[0].x-x,g[0].y-y)<35);
       const item={city,x,y};if(near)near.push(item);else groups.push([item]);
     }
     const labels=[];
     groups.sort((a,b)=>Math.max(...b.map(t=>data.byCity.get(t.city.id).length))-Math.max(...a.map(t=>data.byCity.get(t.city.id).length))).forEach(g=>{
       const sorted=g.slice().sort((a,b)=>data.byCity.get(b.city.id).length-data.byCity.get(a.city.id).length);
       const pin=sorted.find(t=>t.city.id===cityId)||sorted[0];
       const {x,y,city}=pin, group=g.length>1;
       const label=city.name+(group?' et environs':'');
       const b=btn('',()=>openCluster(g),'ap-pin'+(city.id===cityId?' is-selected':''));
       b.setAttribute('aria-label',group?'Choisir parmi '+g.map(t=>t.city.name).join(', '):city.name+' · voir les personnages');
       b.title=group?g.map(t=>t.city.name).join(' · '):label;
       Object.assign(b.style,{left:x+'px',top:y+'px'});
       b.append(el('span','ap-pindot',group?String(g.length):''));
       const labelWidth=Math.min(122,city.name.length*7+10);
       if(x+labelWidth+22<w&&x>8&&y>30&&y<h-22&&!labels.some(p=>Math.abs(p.y-y)<26&&x+labelWidth>p.x-16&&x<p.x+p.width+16)){
         const name=btn(city.name,()=>pickCity(city),'ap-pinname');name.setAttribute('aria-label',city.name+' · personnages');
         Object.assign(name.style,{left:(x+13)+'px',top:(y-10)+'px'});pins.append(name);labels.push({x,y,width:labelWidth});
       }pins.append(b);
     });
     if(cityId&&data.cities.find(c=>c.id===cityId)?.coords){
       const city=data.cities.find(c=>c.id===cityId);
       const [x,y]=project(city.coords[1],merc(city.coords[0]));
       cloud.style.left=Math.max(8,Math.min(x+22,w-Math.min(w-16,386)-10))+'px';
       cloud.style.top=Math.max(44,Math.min(y-52,h-235))+'px';
     }else{cloud.style.left='12px';cloud.style.top='50px';}
   }
   function renderSearch(){
     const q=normal(search.value.trim()),nodes=[];
     if(!q){
       const cities=data.cities.slice().sort(sortNames);
       for(const c of cities)nodes.push(town(c));
     }else{
       for(const c of data.cities.filter(c=>normal(c.name).includes(q)).sort(sortNames))nodes.push(town(c));
       const matches=data.people.filter(p=>normal(p.name).includes(q)||/^\d{1,3}$/.test(q)&&p.id===Number(q));
       for(const p of matches.sort(sortNames))nodes.push(A.chip(p,()=>A.show(p,data),true));
     }
     live.textContent=q?nodes.length+' résultat'+(nodes.length>1?'s':''):data.people.length+' personnages';
     results.replaceChildren(...(nodes.length?nodes:[el('p','','Aucun personnage ni lieu trouvé.')]));
   }
   function town(c){
     const b=btn('',()=>{pickCity(c);if(matchMedia('(max-width:760px)').matches)canvas.scrollIntoView({block:'nearest'});},'ap-townitem');
     b.append(el('span','',c.name),el('small','',String(data.byCity.get(c.id).length)));return b;
   }
   function home(){
     cx=2;cy=merc(46.3);zoom=1;
     if(!scene||!data)return;
     const coords=data.cities.filter(c=>c.coords).map(c=>c.coords);
     if(!coords.length)return;
     const xs=coords.map(c=>c[1]),ys=coords.map(c=>merc(c[0]));
     const left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);
     cx=(left+right)/2;cy=(top+bottom)/2;
     const {w,h}=dimensions();
     if(w&&h)zoom=Math.min(18,(w-76)/Math.max(.15,right-left)/scale(),(h-100)/Math.max(.15,bottom-top)/scale());
   }
   function reset(){home();closeCloud();}
   async function init(){
     if(started){draw();return;}started=true;
     try{
       const all=await A.directory();
       data=scene?chapterDirectory(all,scene):all;
       home();renderSearch();draw();
       const url=standalone?params().searchParams:new URLSearchParams();
       const city=data.cities.find(c=>c.id===url.get('ville'));
       if(city)pickCity(city,false,false);
       const person=data.people.find(p=>p.id&&p.id===Number(url.get('personnage')));
       if(person&&!panel.hidden)A.show(person,data,city?.id);
       if(scene){
         for(const group of data.cities.filter(c=>!c.coords)){
           const b=btn(group.name,()=>pickCity(group),'ap-missing');
           canvas.querySelector('.ap-unlocated').append(b);
         }
       }
     }catch{started=false;results.replaceChildren(el('p','','L’atlas n’a pas pu être chargé.'),btn('Réessayer',init));}
   }
   search.addEventListener('input',()=>{if(data)renderSearch();});
   cloud.querySelector('.ap-cloudclose').onclick=()=>closeCloud(true);
   canvas.querySelector('.ap-plus').onclick=()=>{zoom=Math.min(100,zoom*1.8);draw();};
   canvas.querySelector('.ap-minus').onclick=()=>{zoom=Math.max(.30,zoom/1.8);draw();};
   canvas.querySelector('.ap-reset').onclick=reset;
   let drag;
   canvas.addEventListener('pointerdown',e=>{
     if(e.target.closest('button,.ap-cloud')||e.button!==0)return;
     drag=[e.clientX,e.clientY,cx,cy];canvas.setPointerCapture(e.pointerId);
   });
   canvas.addEventListener('pointermove',e=>{if(drag){const s=scale();cx=drag[2]-(e.clientX-drag[0])/s;cy=drag[3]-(e.clientY-drag[1])/s;draw();}});
   canvas.addEventListener('lostpointercapture',()=>{drag=null;});
   canvas.addEventListener('keydown',e=>{
     if(e.target!==canvas)return;const offsets={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
     if(offsets[e.key]){e.preventDefault();cx+=offsets[e.key][0]*55/scale();cy+=offsets[e.key][1]*55/scale();draw();}
   });
   const resize=new ResizeObserver(()=>draw());resize.observe(canvas);
   return {init,address,city:()=>cityId};
 }
 function mount(host,scene){
   const panel=el('section','ap-panel');
   panel.setAttribute('aria-label','Carte des personnages · '+scene.title);
   host.append(panel);createMap(panel,scene).init();
 }
 function bindTabs(tablist,route,people,onChange,additionalPanel){
   const panels=additionalPanel?[route,people,additionalPanel]:[route,people];
   const tabs=Array.from(tablist.querySelectorAll('[role="tab"]'));
   function select(index,save=false){
     tabs.forEach((tab,i)=>{
       tab.setAttribute('aria-selected',String(i===index));
       tab.tabIndex=i===index?0:-1;
     });
     panels.forEach((panel,i)=>{panel.hidden=i!==index;});
     onChange(index===1,save,index);
   }
   tabs.forEach((tab,i)=>{
     tab.onclick=()=>select(i,true);
     tab.onkeydown=e=>{
       if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
       e.preventDefault();
       const last=tabs.length-1;
       const next=e.key==='Home'?0:e.key==='End'?last:(i+(e.key==='ArrowRight'?1:last))%tabs.length;
       select(next,true);
       tabs[next].focus();
     };
   });
   return select;
 }
 window.TreizeCartesPersonnages={mount,chapterDirectory,bindTabs};
 const panel=document.getElementById('atlas-personnages');
 if(!panel)return;
 const route=document.getElementById('atlas-chemins');
 const tablist=document.querySelector('.ap-tabs');
 const query=params().searchParams;
 const id=query.get('scene'),level=Number(query.get('niveau')),plateau=Number(query.get('plateau'))||1;
 const stage=level?window.TreizeEscale?.getStage(level,plateau):null;
 const game=Object.values(A.games).find(([key])=>key===id);
 const scene=window.TreizeUpcomingData?.scenes.find(s=>s.id===id)||
   (stage?{id:'jouable-'+level+'-'+plateau,chapter:stage.passage.chapter,coordinates:stage.coordinates}:
    game?{id,chapter:game[1]}:null);
 const controller=createMap(panel,scene,true);
 const meetingPanel=document.getElementById('atlas-rencontre');
 const meeting=meetingPanel&&window.TreizeRencontre.create(meetingPanel);
 const select=bindTabs(tablist,route,panel,(active,save,index)=>{
   const inMeeting=index===2;
   document.body.classList.toggle('ap-on-map',index!==0);
   if(save){
     if(inMeeting){
       const url=params();
       url.searchParams.set('vue','rencontre');
       url.searchParams.delete('ville');url.searchParams.delete('personnage');
       history.replaceState(history.state,'',url);
     }else controller.address(active,active?controller.city():null,null);
   }
   meeting?.setActive(inMeeting);
   if(active)controller.init();else if(!inMeeting)window.dispatchEvent(new Event('resize'));
 },meetingPanel);
 const showPeople=query.get('vue')==='personnages'||query.has('personnage')||query.has('ville');
 select(meeting&&query.get('vue')==='rencontre'?2:showPeople?1:0);
})();
