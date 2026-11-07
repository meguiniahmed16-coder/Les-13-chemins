import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync(new URL('./voyage.js',import.meta.url),'utf8');
function harness(){
 let now=0,seq=0;const timers=new Map(),events=new Map(),els=new Map(),sent=[];
 const schedule=(fn,ms)=>{const id=++seq;timers.set(id,{at:now+ms,fn});return id;};
 function element(){const handlers=new Map();return {style:{},dataset:{},classList:{add(){},remove(){}},hidden:false,open:false,contentWindow:{postMessage:m=>sent.push(m)},append(){},before(){},remove(){this.removed=true;},querySelectorAll:()=>[{style:{}},{style:{}}],showModal(){this.open=true;},close(){this.open=false;handlers.get('close')?.();},addEventListener:(k,f)=>handlers.set(k,f),removeEventListener:k=>handlers.delete(k)};}
 ['diceDialog','diceStatus','diceTitle','diceRule','diceDestination','skipDice','map'].forEach(k=>els.set(k,element()));
 const frames=[],doc={head:{append(){}},documentElement:{classList:{add(){}}},getElementById:id=>id==='journeyStyles'?{}:els.get(id),querySelector:()=>element(),createElement:tag=>{const e=element();if(tag==='iframe')frames.push(e);return e;}};
 const ctx=vm.createContext({document:doc,location:{origin:'https://example.test',search:'?voyage=1&depart=4&arrivee=5&session=test-id'},URLSearchParams,crypto:{randomUUID:()=> 'test-id'},matchMedia:()=>({matches:false}),performance:{now:()=>now},setTimeout:schedule,clearTimeout:id=>timers.delete(id),requestAnimationFrame:fn=>schedule(()=>fn(now),16),cancelAnimationFrame:id=>timers.delete(id),addEventListener:(k,f)=>events.set(k,f),removeEventListener:k=>events.delete(k),parent:{postMessage:m=>sent.push(m)}});
 vm.runInContext(code,ctx);
 function advance(ms){const end=now+ms;let count=0;while(true){const next=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;assert.ok(++count<5000,'timer loop terminates');timers.delete(next[0]);now=next[1].at;next[1].fn();}now=end;}
 const message=(type,extra={})=>events.get('message')?.({origin:ctx.location.origin,source:frames[0]?.contentWindow,data:{type,session:'test-id',...extra}});
 return {ctx,els,frames,sent,timers,events,advance,message};
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
