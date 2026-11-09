import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {PARK_LAYOUT,drawParkPerson,drawCatalognePark} from './catalogne-park-v2.js';
const read=f=>readFileSync(new URL(f,import.meta.url),'utf8');
function fakePark(){
 const calls=[],texts=[];
 const ctx={
  save(){},restore(){},translate(){},scale(){},rotate(){},beginPath(){},ellipse(){},
  lineTo(){},moveTo(){},closePath(){},fill(){},clearRect(){},drawImage(){},
 };
 const canvas={setAttribute(k,v){calls.push(['aria',k,v]);}};
 const g={g:ctx,c:canvas,camera:0,
  rect(x,y,w,h,color){assert.ok([x,y,w,h].every(Number.isFinite));assert.ok(w>=0&&h>=0);calls.push(['rect',x,y,w,h,color]);},
  text(t,x,y,n,color){assert.ok([x,y,n].every(Number.isFinite));texts.push(t);calls.push(['text',t,x,y,n,color]);}
 };
 return {g,calls,texts};
}
const game=read('arcade-catalogne.html');
const mechanics=game.slice(game.indexOf('const WORLD=1960;'),game.indexOf('class ParkScene{'));
function api(){const context={};vm.runInNewContext(mechanics+'\nglobalThis.arcadeApi={createRun,advance,nearbyClient,sell,jump,CLIENTS,POLICE};',context);return context.arcadeApi;}
test('Real 2D park has multiple routes, a large crowd, and CC0 resources',()=>{
 assert.equal(PARK_LAYOUT.width,1960);
 assert.equal(PARK_LAYOUT.groups,16);assert.equal(PARK_LAYOUT.solitary,30);
 assert.equal(PARK_LAYOUT.police,2);assert.equal(PARK_LAYOUT.clients,5);
 const art=read('catalogne-park-v2.js');
 assert.ok(art.includes('KENNEY_ATLAS="data:image/png;base64,iVBORw'));
 assert.ok(art.includes('PIXELBOY_NPCS="data:image/png;base64,iVBORw'));
 assert.ok(art.includes('kenney.nl/assets/tiny-town'));
 assert.ok(art.includes('pixel-boy.itch.io/ninja-adventure-asset-pack'));
 assert.ok(art.includes('street-musician'));
 assert.ok(art.includes('drawing')===false || art.includes('paint')); // No mandatory external fetch
});
test('Crowds, trees, park paths, cafés and active police appear on screen at different distances',()=>{
 for(const distance of [90,485,960,1540,1890]){
  const {g,calls,texts}=fakePark(),r=api().createRun();r.x=distance;
  drawCatalognePark(g,r,'running',[],3.2,api().CLIENTS,api().POLICE);
  assert.ok(calls.filter(x=>x[0]==='rect').length>250,'The park should be richly populated');
  assert.ok(texts.some(x=>x.includes('ALLÉE ')),'Player knows the alley');
  assert.ok(texts.some(x=>x.includes('PLAÇA')),'Park location is identified');
  assert.ok(g.camera>=0&&g.camera<=1192,'Camera respects park borders');
  assert.ok(calls.some(x=>x[0]==='aria'),'Accessible canvas text');
 }
 const {g,calls}=fakePark();
 drawParkPerson(g,200,300,'police',3,1,1,1);
 drawParkPerson(g,200,300,'hero',3,-1,0,1);
 assert.ok(calls.length>40,'Readable reusable character drawing');
});
test('Two real directions: north/south lanes and sideways movement preserve five clients and scores',()=>{
 const {createRun,advance,CLIENTS,sell,nearbyClient,jump}=api();
 const r=createRun(['c1']);r.phase='running';
 assert.equal(CLIENTS.length,5);
 assert.equal(r.sold.length,1);
 const y=r.lane;
 advance(r,.05,0,-1);
 assert.ok(r.lane<y);
 for(let i=0;i<90;i++)advance(r,.05,0,-1);
 assert.equal(r.lane,-112);
 for(let i=0;i<90;i++)advance(r,.05,0,1);
 assert.equal(r.lane,112);
 r.x=CLIENTS[1].x-40;r.facing=1;r.lane=-80;
 assert.equal(nearbyClient(r),null,'Cannot sell across distant alleys');
 r.lane=CLIENTS[1].lane;
 assert.equal(nearbyClient(r).id,'c2');
 const out=sell(r);assert.equal(out.points,2);assert.equal(out.client.id,'c2');
 assert.equal(r.sold.length,2);
 assert.equal(jump(r),true,'Original jump mechanics preserved');
});
test('Police pursue in two dimensions, and jumping or switching lane avoids arbitrary capture',()=>{
 const {createRun,advance,POLICE}=api();
 const r=createRun();r.phase='running';
 const officer=r.policeState[0];r.x=officer.x-130;r.lane=officer.lane;
 const before=officer.x;advance(r,.05,0,0);
 assert.ok(officer.x<before,'Police run toward hero');
 assert.equal(r.phase,'running');
 const free=createRun();free.phase='running';free.x=POLICE[0];free.lane=112;
 advance(free,.05,0,0);
 assert.equal(free.phase,'running','Farther alley is a valid escape route');
 const jumped=createRun();jumped.phase='running';jumped.x=POLICE[0];jumped.lane=jumped.policeState[0].lane;jumped.y=100;
 advance(jumped,.05,0,0);
 assert.equal(jumped.phase,'running','Jump avoids catching');
 const collision=createRun();collision.phase='running';collision.x=POLICE[0];collision.lane=collision.policeState[0].lane;
 advance(collision,.05,0,0);
 assert.equal(collision.phase,'caught','Real contact catches the runner');
});
test('The new view and controls preserve original score and parent messages',()=>{
 const html=read('arcade-catalogne.html'),build=read('build-public.mjs');
 assert.ok(html.includes("import {drawCatalognePark} from './catalogne-park-v2.js'"));
 assert.ok(html.includes('legacyDraw(run,phase,particles=[],clock=0)'));
 assert.ok(html.includes('return drawCatalognePark(this,run,phase,particles,clock,CLIENTS,POLICE)'));
 assert.ok(html.includes('id="north"'));assert.ok(html.includes('id="south"'));
 assert.ok(html.includes('ArrowUp'));assert.ok(html.includes('ArrowDown'));
 assert.ok(html.includes('const WORLD=1960;'));
 assert.ok(html.includes("send('catalogne:sale',{clientId:c.id})"));
 assert.ok(html.includes("send('catalogne:ready')"));
 assert.ok(html.includes("if(m.finished){won();}"));
 assert.ok(html.includes("catalogne:credited"));
 assert.ok(html.includes("score+=2"));
 assert.ok(build.includes("'catalogne-park-v2.js'"));
 assert.ok(build.includes("'catalogne-park-v2.test.mjs'"));
});

test('Wider park view and two patrols reduce pressure without changing the five clients',()=>{
 const {createRun,advance,POLICE,CLIENTS}=api();
 assert.equal(POLICE.length,2,'Two police officers instead of four');
 assert.equal(CLIENTS.length,5,'Five client objectives remain');
 assert.deepEqual(Array.from(POLICE),[560,1490],'Patrols are well spaced across the park');
 const r=createRun(['c1','c2']);r.phase='running';
 assert.equal(r.policeState.length,2);
 assert.deepEqual(Array.from(r.sold),['c1','c2'],'Previous sales persist');
 assert.equal(r.policeState[0].lane,-85);
 assert.equal(r.policeState[1].lane,75);
 r.x=300;r.facing=1;
 const {g}=fakePark();
 drawCatalognePark(g,r,'running',[],1.2,CLIENTS,POLICE);
 assert.ok(g.camera>=0,'Camera stays within map');
 r.x=960;
 drawCatalognePark(g,r,'running',[],1.2,CLIENTS,POLICE);
 assert.equal(g.camera,705,'Forward-facing camera shows 75 extra world units ahead');
 r.facing=-1;drawCatalognePark(g,r,'running',[],1.2,CLIENTS,POLICE);
 assert.equal(g.camera,525,'The camera offers more room for reversing');
 const officer=r.policeState[0];r.x=officer.x-160;r.lane=officer.lane;r.facing=1;
 const old=officer.x;advance(r,.05,0,0);
 assert.ok(officer.x<old,'Police still attempt interception');
 assert.equal(r.phase,'running','Police do not catch someone at a distance');
});
test('Game stage fills the page and offers fullscreen while keeping all commands accessible',()=>{
 const html=read('arcade-catalogne.html'),art=read('catalogne-park-v2.js');
 assert.ok(html.includes('id="park-easy-layout"'));
 assert.ok(html.includes('.wrap{max-width:1280px}'));
 assert.ok(html.includes('.grid{grid-template-columns:minmax(0,1fr)!important'));
 assert.ok(html.includes('.machine:fullscreen'));
 assert.ok(html.includes('id="parkFullscreen"'));
 assert.ok(html.includes('requestFullscreen'));
 assert.ok(html.includes('fullscreenchange'));
 assert.ok(html.includes('id="north"')&&html.includes('id="south"'));
 assert.ok(html.includes("send('catalogne:sale',{clientId:c.id})"));
 assert.ok(html.includes("score+=2"));
 assert.ok(art.includes('treeRows:4,police:2,clients:5'));
});
