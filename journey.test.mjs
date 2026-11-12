import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync(new URL('./voyage.js',import.meta.url),'utf8');
function harness(search='?voyage=1&depart=4&arrivee=5&session=test-id'){
 let now=0,seq=0;const timers=new Map(),events=new Map(),els=new Map(),sent=[];
 const schedule=(fn,ms)=>{const id=++seq;timers.set(id,{at:now+ms,fn});return id;};
 function element(){const handlers=new Map();return {style:{},dataset:{},classList:{add(){},remove(){}},hidden:false,open:false,contentWindow:{postMessage:m=>sent.push(m)},append(){},before(){},remove(){this.removed=true;},querySelectorAll:()=>[{style:{}},{style:{}}],showModal(){this.open=true;},close(){this.open=false;handlers.get('close')?.();},addEventListener:(k,f)=>handlers.set(k,f),removeEventListener:k=>handlers.delete(k)};}
 ['diceDialog','diceStatus','diceTitle','diceRule','diceDestination','skipDice','map'].forEach(k=>els.set(k,element()));
 const frames=[],banners=[],doc={head:{append(){}},documentElement:{classList:{add(){}}},getElementById:id=>id==='journeyStyles'?{}:els.get(id),querySelector:()=>element(),createElement:tag=>{const e=element();if(tag==='iframe')frames.push(e);if(tag==='div')banners.push(e);return e;}};
 const ctx=vm.createContext({document:doc,location:{origin:'https://example.test',search},URLSearchParams,crypto:{randomUUID:()=> 'test-id'},matchMedia:()=>({matches:false}),performance:{now:()=>now},setTimeout:schedule,clearTimeout:id=>timers.delete(id),requestAnimationFrame:fn=>schedule(()=>fn(now),16),cancelAnimationFrame:id=>timers.delete(id),addEventListener:(k,f)=>events.set(k,f),removeEventListener:k=>events.delete(k),parent:{postMessage:m=>sent.push(m)}});
 vm.runInContext(code,ctx);
 function advance(ms){const end=now+ms;let count=0;while(true){const next=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;assert.ok(++count<5000,'timer loop terminates');timers.delete(next[0]);now=next[1].at;next[1].fn();}now=end;}
 const message=(type,extra={})=>events.get('message')?.({origin:ctx.location.origin,source:frames[0]?.contentWindow,data:{type,session:'test-id',...extra}});
 return {ctx,els,frames,banners,sent,timers,events,advance,message};
}
test('Dice finish before map starts; only the active frame can finish and it settles once',()=>{
 const h=harness();let completed=0;const finish=h.ctx.TreizeVoyage.start({from:4,to:5,title:'Paris',onFinish:()=>completed++});
 h.message('journey:ready');h.advance(1500);assert.equal(h.sent.length,0);assert.equal(h.els.get('diceDialog').dataset.phase,'dice');
 h.advance(50);assert.equal(h.sent[0].type,'journey:start');assert.equal(h.frames[0].hidden,false);
 h.events.get('message')({origin:'https://example.test',source:{},data:{type:'journey:done',session:'test-id'}});assert.equal(completed,0);
 h.message('journey:done',{session:'stale'});assert.equal(completed,0);
 h.message('journey:done');finish();h.advance(30000);assert.equal(completed,1);assert.equal(h.timers.size,0);assert.equal(h.els.get('diceDialog').open,false);assert.ok(h.frames[0].removed);
});
test('A missing map or suspended drawing cannot trap the next-stage button',()=>{
 const h=harness();let completed=0;h.ctx.TreizeVoyage.start({from:1,to:2,title:'Barcelone',onFinish:()=>completed++});h.advance(13550);assert.equal(completed,1);assert.equal(h.timers.size,0);
 const j=harness();let other=0;j.ctx.TreizeVoyage.start({from:1,to:2,title:'Barcelone',onFinish:()=>other++});j.message('journey:ready');j.advance(20000);assert.equal(other,1);
});
test('Skip during the dice cleans up every pending action',()=>{
 const h=harness();let completed=0;const finish=h.ctx.TreizeVoyage.start({from:4,to:5,title:'Paris',onFinish:()=>completed++});finish();h.message('journey:ready');h.advance(30000);assert.equal(completed,1);assert.equal(h.sent.length,0);assert.equal(h.timers.size,0);
});
test('The map visits overview, departure, moving pointer and exact arrival in order',()=>{
 const h=harness(),positions=[],views=[],characters=[];
 h.ctx.TreizeEscale={getStage:n=>({city:'Paris'}),addCharacters:(_,n)=>characters.push(n)};
 const layer=()=>({addTo(){return this;},removeLayer(){return this;},setLatLng(p){positions.push([...p]);return this;},setLatLngs(ps){assert.ok(ps.every(p=>p.every(Number.isFinite)));return this;}});
 h.ctx.L={layerGroup:layer,marker:layer,divIcon:x=>x,polyline:layer,latLngBounds:ps=>({pad:()=>ps})};
 const map={distance:()=>600000,invalidateSize(){},stop(){},fitBounds(){},setView(p){views.push([...p]);},flyTo(p){views.push([...p]);},panTo(p){views.push([...p]);}};
 const centers=Array.from({length:13},(_,i)=>[40+i*.5,2+i]);
 h.ctx.TreizeVoyage.initMap({map,points:[{latitude:40,longitude:2}],centers,titles:centers.map((_,i)=>'Titre '+i),places:centers.map((_,i)=>'Ville '+i)});
 h.events.get('message')({source:h.ctx.parent,origin:'https://example.test',data:{type:'journey:start',session:'test-id'}});h.advance(6500);
 assert.deepEqual(characters,[5]);assert.notEqual(h.sent.at(-1).type,'journey:done','names remain visible before the reading handoff');h.advance(3500);
 assert.deepEqual(h.sent.filter(x=>x.type==='journey:phase').map(x=>x.phase),['overview','departure','travel','arrival']);
 assert.equal(h.sent.at(-1).type,'journey:done');assert.ok(positions.length>30);assert.deepEqual(positions.at(-1),centers[4]);assert.deepEqual(views.at(-1),centers[4]);
});

test('Barcelone → Ferney-Voltaire → Vannes → Poitiers → Sarajevo: ordered dotted animation',()=>{
 const h=harness('?voyage=1&depart=3&arrivee=4&session=test-id');
 const origin=[41.387,2.17],destination=[43.856,18.413];
 const itinerary=h.ctx.TreizeVoyage.chapter2Itinerary(3,4,origin,destination);
 assert.deepEqual(Array.from(itinerary,p=>p.name),[
  'Barcelone','Ferney-Voltaire','Vannes (Bretagne)','Poitiers','Sarajevo'
 ]);
 assert.deepEqual(Array.from(itinerary,p=>Array.from(p.coordinates)),[
  origin,[46.258,6.108],[47.6587,-2.7599],[46.5803,0.3402],destination
 ]);
 assert.equal(h.ctx.TreizeVoyage.chapter2Itinerary(4,5,origin,destination),null,
  'Other chapter journeys still take the regular route');
 const labels=[],pointer=[],traces=[],markers=[],characters=[];
 const layer=()=>({addTo(){return this;},removeLayer(){return this;},setLatLng(p){pointer.push(Array.from(p));return this;},
  setLatLngs(ps){assert.ok(ps.every(p=>p.every(Number.isFinite)));traces.push(ps.map(p=>Array.from(p)));return this;}});
 h.ctx.TreizeEscale={
  getStage:n=>({coordinates:n===3?origin:destination,city:n===3?'Barcelone':'Sarajevo',
   passage:{scene:n===3?'Dernier jeu du chapitre 1':'Chapitre 2 Même pas mal'}}),
  addCharacters:(_,n)=>characters.push(n)
 };
 h.ctx.L={layerGroup:layer,marker:(p,o)=>{if(o?.icon?.html?.includes('journey-place-name'))
   markers.push(o.icon.html);return layer();},
  divIcon:x=>x,polyline:layer,latLngBounds:ps=>({pad:()=>ps})};
 const map={
  distance:()=>950000,invalidateSize(){},stop(){},fitBounds(){},
  setView(){},flyTo(){},panTo(){}
 };
 const centers=Array.from({length:13},(_,i)=>[39+i*.3,2+i]);
 h.ctx.TreizeVoyage.initMap({map,points:[{latitude:41.387,longitude:2.17}],
  centers,titles:centers.map((_,i)=>'Titre '+i),places:centers.map((_,i)=>'Ville '+i)});
 h.events.get('message')({source:h.ctx.parent,origin:'https://example.test',
  data:{type:'journey:start',session:'test-id'}});
 h.advance(8800);
 for(const e of h.sent.filter(e=>e.type==='journey:phase'&&e.phase==='travel'))labels.push(e.label);
 assert.deepEqual(labels,[
  'Barcelone → Ferney-Voltaire','Ferney-Voltaire → Vannes (Bretagne)',
  'Vannes (Bretagne) → Poitiers','Poitiers → Sarajevo'
 ]);
 assert.equal(markers.length,5,'All five places have labeled markers');
 for(const name of ['Barcelone','Ferney-Voltaire','Vannes (Bretagne)','Poitiers','Sarajevo'])
  assert.ok(markers.some(x=>x.includes(name)),name+' has a map label');
 assert.ok(traces.some(ps=>ps.length===2));
 assert.ok(traces.some(ps=>ps.length===5),'The completed dotted line retains all five waypoints');
 assert.ok(pointer.length>150,'Marker progresses smoothly between every pair of towns');
 assert.deepEqual(pointer.at(-1),destination,'Animation reaches Sarajevo');
 assert.deepEqual(characters,[4],'Only the Sarajevo scene opens after the trip');
 h.advance(4500);
 assert.equal(h.sent.at(-1).type,'journey:done','The map finishes and hands control back');
 assert.ok(!h.ctx.TreizeVoyage.chapter2Itinerary(1,2,origin,destination));
});
test('Both narrative interludes are compact moving maps with a detailed backpack walker',()=>{
 const ui=fs.readFileSync(new URL('./chapitre1-plateau.js',import.meta.url),'utf8');
 const maps=fs.readFileSync(new URL('./mini-cartes.js',import.meta.url),'utf8');
 const build=fs.readFileSync(new URL('./build-public.mjs',import.meta.url),'utf8');
 const page=fs.readFileSync(new URL('./jeu.html',import.meta.url),'utf8');
 assert.ok(ui.includes("makeInterlude('one-two'"));
 assert.ok(ui.includes("makeInterlude('two-three'"));
 assert.ok(ui.includes('mini-atlas-map{height:185px'));
 assert.ok(maps.includes("['Vannes',47.6587,-2.7599]"));
 for(const name of ['Sarajevo','Genève','Lyon','Louvain-la-Neuve','Paris','Strasbourg'])assert.ok(maps.includes("'"+name+"'"));
 assert.ok(maps.includes("dashArray:'3 8'"));
 assert.ok(maps.includes('mini-atlas-walker'));
 assert.ok(maps.includes('map.attributionControl.setPrefix(false)'),'No Leaflet Ukrainian flag in either mini-map');
 assert.ok(maps.includes("attribution:'© OpenStreetMap contributors'"),'Keep required OpenStreetMap attribution');
 assert.ok(maps.includes('requestAnimationFrame(tick)'));
 assert.ok(maps.includes('prefers-reduced-motion: reduce'));
 assert.ok(build.includes("'mini-cartes.js'"));
 assert.ok(page.includes('mini-cartes.js?v=20261112-une-fois-v1'));
 assert.ok(maps.includes("replay.onclick=()=>"),'Manual replay exists on each map');
 assert.ok(maps.includes("replay.hidden=true"),'Replay button is hidden while travelling');
 assert.ok(maps.includes("finished=true;cancelAnimationFrame(frame)"),'Travel stops at the destination');
 assert.ok(maps.includes("if(!hasStarted){hasStarted=true;resume()}"),'Viewport starts the animation once');
 assert.ok(!maps.includes("(now-started)%duration"),'Previous infinite looping animation is removed');
});

test('Every arrival shows its chapter title and the documented characters on the map',()=>{
 const h=harness('?voyage=1&depart=2&arrivee=3&session=test-id'),charVisits=[];
 assert.equal(h.ctx.TreizeVoyage.chapterArrivalLabel(3,[]),'Chapitre 1 — « La salle d’attente »');
 assert.equal(h.ctx.TreizeVoyage.chapterArrivalLabel(4,[]),'Chapitre 2 — « Même pas mal »');
 assert.equal(h.ctx.TreizeVoyage.chapterArrivalLabel(5,[],1),'Chapitre 3 — « Le coup du bus »');
 assert.equal(h.ctx.TreizeVoyage.chapterArrivalLabel(5,[],2),'Chapitre 4 — « Le drapeau rouge »');
 assert.equal(h.ctx.TreizeVoyage.chapterArrivalLabel(6,['','','','','','L’alchimiste']),'Chemin III — L’alchimiste');
 const stub=()=>({addTo(){return this;},removeLayer(){return this;},
  setLatLng(){return this;},setLatLngs(){return this;}});
 const map={distance:()=>550000,invalidateSize(){},stop(){},fitBounds(){},
  setView(){},flyTo(){},panTo(){}};
 h.ctx.TreizeEscale={
  getStage:n=>({coordinates:n===2?[46.07,6.3]:[41.387,2.17],city:n===2?'La Roche-sur-Foron':'Barcelone',
   characters:n===3?['Michel le Belge']:[],passage:{scene:'Le parc'}}),
  addCharacters:(_,n)=>charVisits.push(n)
 };
 h.ctx.L={layerGroup:stub,marker:stub,divIcon:x=>x,polyline:stub,
  latLngBounds:ps=>({pad:()=>ps})};
 const centers=Array.from({length:13},(_,i)=>[40+i*.6,2+i]);
 h.ctx.TreizeVoyage.initMap({map,points:[{latitude:46,longitude:6}],centers,
  titles:centers.map((_,i)=>'Scène '+i),places:centers.map((_,i)=>'Ville '+i)});
 h.events.get('message')({source:h.ctx.parent,origin:'https://example.test',
  data:{type:'journey:start',session:'test-id'}});
 h.advance(7800);
 assert.deepEqual(charVisits,[3]);
 assert.equal(h.banners.length,1,'A map arrival banner is created');
 assert.equal(h.banners[0].hidden,false);
 assert.match(h.banners[0].textContent,/Chapitre 1 — « La salle d’attente »/);
 assert.match(h.banners[0].textContent,/Barcelone/);
 assert.match(h.banners[0].textContent,/Michel le Belge/);
 const arrived=h.sent.find(m=>m.type==='journey:phase'&&m.phase==='arrival');
 assert.match(arrived.label,/Chapitre 1/);
 assert.equal(h.sent.at(-1).type,'journey:phase','The arrival stays visible while names are read');
 h.advance(3000);
 assert.equal(h.sent.at(-1).type,'journey:done');
});
test('The story transitions keep their map and Camarades now precedes Strasbourg',()=>{
 const src=fs.readFileSync(new URL('./chapitre1-plateau.js',import.meta.url),'utf8');
 const game=fs.readFileSync(new URL('./jeu.html',import.meta.url),'utf8');
 const plates=fs.readFileSync(new URL('./plateaux.js',import.meta.url),'utf8');
 assert.ok(src.includes('if(n>=1&&n<=5)'));
 assert.ok(src.includes('from:n,to:next'));
 assert.ok(src.includes('scheduleAutoTransition(finished)'));
 assert.ok(src.includes('rollTravel(n);'));
 assert.ok(game.includes("const buttonId={2:'arcadeLaunch',3:'catalogneLaunch',4:'bosnieLaunch',5:'danseLaunch'}")||
           game.includes("const launch=document.getElementById(buttonId)"));
 assert.ok(plates.includes('window.TreizeRendezVous?.openManifestation?.()'),'After the dance, Camarades opens before Strasbourg');
 assert.ok(plates.includes('autoAdvanceOnEnd:true'));
 assert.ok(plates.includes('prisonExitTimer=setTimeout'));
 assert.ok(code.includes("dashArray:'6 7'"));
 assert.ok(code.includes('root.TreizeEscale?.addCharacters(map,to,toPlateau)'));
 assert.ok(code.includes('showArrivalTitle()'));
});
