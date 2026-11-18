(() => {
 'use strict';
 const A=window.TreizeAtlasPersonnages, panel=document.getElementById('atlas-personnages');
 if(!panel||!A)return;
 const {element:el,button:btn,normal}=A;
 const route=document.getElementById('atlas-chemins');
 const tabs=[...document.querySelectorAll('.ap-tabs [role=tab]')];
 const params=()=>new URL(location.href);
 function address(view,city,person){
   const url=params();
   if(view){url.searchParams.set('vue','personnages');}else url.searchParams.delete('vue');
   for(const [k,v] of [['ville',city],['personnage',person]]){if(v)url.searchParams.set(k,v);else url.searchParams.delete(k);}
   history.replaceState(history.state,'',url);
 }
 let data,started=false,cityId=null,deepPerson;
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
 function openCloud(title,buttons){
   cloudTitle.textContent=title;cloudItems.replaceChildren(...buttons);cloud.hidden=false;cloud.scrollTop=0;
   cloudTitle.focus({preventScroll:true});
 }
 function pickCity(city,save=true){
   cityId=city.id;
   if(city.coords){cx=city.coords[1];cy=merc(city.coords[0]);zoom=Math.max(zoom,3);}
   const people=data.byCity.get(city.id).slice().sort(sortNames);
   draw();openCloud(city.name+' · '+people.length+' personnage'+(people.length>1?'s':''),
     people.map(p=>A.chip(p,()=>A.show(p,data,city.id))));
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
   live.textContent=q?nodes.length+' résultat'+(nodes.length>1?'s':''):'400 personnages';
   results.replaceChildren(...(nodes.length?nodes:[el('p','','Aucun personnage ni lieu trouvé.')]));
 }
 function town(c){
   const b=btn('',()=>{pickCity(c);if(matchMedia('(max-width:760px)').matches)canvas.scrollIntoView({block:'nearest'});},'ap-townitem');
   b.append(el('span','',c.name),el('small','',String(data.byCity.get(c.id).length)));return b;
 }
 function reset(){cx=2;cy=merc(46.3);zoom=1;closeCloud();draw();}
 async function init(){
   if(started){draw();return;}started=true;
   try{
     data=await A.directory();renderSearch();draw();
     const u=params(),city=data.cities.find(c=>c.id===u.searchParams.get('ville'));
     if(city)pickCity(city,false);
     deepPerson=data.byId.get(Number(u.searchParams.get('personnage')));
     if(deepPerson&&!panel.hidden)A.show(deepPerson,data,city?.id);
   }catch{started=false;results.replaceChildren(el('p','','L’atlas n’a pas pu être chargé.'),btn('Réessayer',init));}
 }
 function select(i,save=false){
   const active=i===1;
   tabs.forEach((t,n)=>{t.setAttribute('aria-selected',String(n===i));t.tabIndex=n===i?0:-1;});
   route.hidden=active;panel.hidden=!active;
   document.body.classList.toggle('ap-on-map',active);
   if(save)address(active,active?cityId:null,null);
   if(active)init();else window.dispatchEvent(new Event('resize'));
 }
 tabs.forEach((tab,i)=>{
   tab.onclick=()=>select(i,true);tab.onkeydown=e=>{
     if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();
       const n=e.key==='Home'?0:e.key==='End'?1:1-i;select(n,true);tabs[n].focus();}
   };
 });
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
 new ResizeObserver(()=>draw()).observe(canvas);
 select(params().searchParams.get('vue')==='personnages'||params().searchParams.has('personnage')||params().searchParams.has('ville')?1:0);
})();
