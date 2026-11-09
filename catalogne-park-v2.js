/* Parc de Catalogne v2 — 2D 3/4, campagne urbaine à plusieurs allées.
 * Personnages modernes originaux + deux petites ressources sous CC0 :
 * Kenney Tiny Town, https://kenney.nl/assets/tiny-town
 * Pixel-Boy & AAA Ninja Adventure, https://pixel-boy.itch.io/ninja-adventure-asset-pack
 * Aucune image sous licence restrictive et aucun appel réseau au démarrage.
 */
const W=768,H=432;
const KENNEY_ATLAS="data:image/png;base64,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";
const PIXELBOY_NPCS="data:image/png;base64,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";
const CC0_SPRITES={};
if(typeof Image!=='undefined')for(const [name,src] of Object.entries({kenney:KENNEY_ATLAS,pixelboy:PIXELBOY_NPCS})){
 const img=new Image();img.src=src;CC0_SPRITES[name]=img;
}
export const PARK_LAYOUT={width:1960,laneMin:-112,laneMax:112,groups:16,solitary:30,
 treeRows:4,police:2,clients:5,projection:'2d-three-quarter'};
const palette={
 grass:'#8dbb84',grassDark:'#75a874',turf:'#a5ca8c',stone:'#d9c9a8',
 sand:'#e7d7b7',border:'#c4b493',ink:'#273b3d',water:'#65bac9',
 park:'#44845e',green:'#377552',shade:'#254e40',warm:'#f3deb0'
};
const mod=(v,n)=>(v%n+n)%n;
const rnd=(i,s=0)=>{const v=Math.sin(i*127.1+s*64.79)*43758.5453;return v-Math.floor(v);};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const C=(g,x,y,w,h,col)=>g.rect(x,y,w,h,col);
const tx=(g,t,x,y,n=11,color=palette.ink)=>g.text(t,x,y,n,color);
function ellipse(g,x,y,rx,ry,col){
 const c=g.g;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=col;c.fill();
}
function path(g,arr,col){const c=g.g;c.fillStyle=col;c.beginPath();for(let i=0;i<arr.length;i++){const p=arr[i];i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]);}c.closePath();c.fill();}
function tile(g,col,row,x,y,w,h){
 const img=CC0_SPRITES.kenney;if(!img?.complete||!img.naturalWidth)return false;
 g.g.imageSmoothingEnabled=false;
 g.g.drawImage(img,col*17,row*17,16,16,Math.round(x),Math.round(y),w,h);return true;
}
function townBackdrop(g,cam){
 // Facades on the rim of the square: Barcelona-inspired rather than a
 // fabricated map of the real Plaça de Catalunya.
 C(g,0,0,W,H,'#a3c5a5');C(g,0,0,W,102,'#a8c7c6');
 for(let i=-1;i<8;i++){
  const x=Math.round(i*134-mod(cam*.18,134)),h=48+(i+7)%3*9;
  C(g,x,102-h,119,h,'#d9bd91');C(g,x+5,106-h,108,7,'#b27d61');
  C(g,x,96,119,6,'#9a9071');C(g,x+6,99-h,109,3,'#f4ddb0');
  for(let a=0;a<4;a++)for(let b=0;b<2;b++){
   const wx=x+11+a*27,wy=110-h+b*24;C(g,wx,wy,15,18,'#8b9e9f');
   C(g,wx+2,wy+2,11,13,'#b0cfc5');C(g,wx+6,wy,2,18,'#f0d2a4');
   C(g,wx-2,wy+17,19,3,'#a87c62');
  }
 }
 C(g,0,101,W,7,'#e6ddbd');C(g,0,108,W,324,palette.grass);
 for(let i=0;i<195;i++){
  const x=mod(i*113.73+43,768),y=120+mod(i*53.21,316);
  C(g,x,y,3+(i%3),2,i%2?'#a1cd90':'#81b67d');
 }
}
function paths(g,cam){
 // Three real connected pedestrian routes across a deep, open park.
 const roads=[[204,38],[304,47],[401,31]];
 for(let i=0;i<roads.length;i++){
  const [y,h]=roads[i];
  C(g,0,y-4,W,h+8,'#a99e83');C(g,0,y,W,h,palette.sand);
  C(g,0,y+4,W,2,'#f1e5c8');C(g,0,y+h-7,W,2,'#c1ae8e');
  for(let j=0;j<35;j++){
   const x=mod(j*33-cam*.56+i*31,970)-33;
   C(g,x,y+10+j%3*8,16,2,'#d7c5a8');
   if(j%4===0)C(g,x+7,y+h-13,4,3,'#f3e8d4');
  }
 }
 for(const xWorld of [120,340,580,850,1120,1410,1680,1870]){
  const x=xWorld-cam;if(x<-110||x>W+110)continue;
  path(g,[[x-15,183],[x+47,183],[x+72,432],[x-67,432]],'#ad9e82');
  path(g,[[x-9,185],[x+40,185],[x+60,432],[x-57,432]],'#ddcbb0');
  for(let k=0;k<9;k++)C(g,x-14+k*5+((k*23)%17),202+k*24,4,3,'#c2ad8b');
 }
}
function garden(g,cam){
 for(const [id,xw,y] of [[0,320,192],[1,770,184],[2,1340,186],[3,1745,186],
 [4,270,292],[5,880,285],[6,1280,292],[7,1820,289]]){
  const x=xw-cam;if(x<-120||x>W+120)continue;
  ellipse(g,x,y+9,65,22,'#5b9b66');
  ellipse(g,x,y+2,62,20,'#77b975');
  for(let j=0;j<14;j++){
   const px=x-47+(j*41+id*19)%95,py=y-8+(j*17)%25;
   C(g,px,py,4,7,'#53915e');C(g,px-3,py-4,8,5,j%3?'#edb4a6':'#e8d175');
   C(g,px,py-2,2,2,'#fff7d7');
  }
 }
}
function arbor(g,x,y,type=0,scale=1){
 const ctx=g.g;ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scale,scale);
 ellipse(g,0,0,32,10,'#38694755');
 if(type===2){ // Palm tree, in keeping with the Mediterranean atmosphere.
  C(g,-5,-63,10,63,'#99744d');C(g,0,-85,2,20,'#e0b177');
  for(let j=-3;j<=3;j++){
   const xx=j*12;
   path(g,[[0,-95],[xx-26,-107+Math.abs(j)*5],[xx-18,-91+Math.abs(j)*8],[0,-85]],j%2?'#3e8a63':'#4b9b6d');
  }
 }else{
  C(g,-5,-57,10,58,'#85654a');C(g,-8,-47,3,20,'#a7805a');
  for(const [dx,dy,rx,ry,c] of [
   [-27,-82,27,23,'#417d54'],[27,-89,27,25,'#39754e'],
   [0,-111,36,30,'#458d59'],[-13,-124,28,21,'#5a9c67'],
   [14,-123,29,22,'#72b777']])ellipse(g,dx,dy,rx,ry,c);
  if(type===1) {
   C(g,-24,-139,22,4,'#acd187');C(g,8,-118,18,4,'#9dc783');
  }
  // CC0 Kenney Tiny Town foliage texture used sparingly as a crown accent.
  if(type===1)tile(g,4,0,-27,-131,24,25);
 }
 ctx.restore();
}
function bench(g,x,y){
 ellipse(g,x,y+3,27,6,'#4a7c6044');
 C(g,x-25,y-19,50,5,'#8b5a3e');C(g,x-23,y-13,46,4,'#b47b4f');
 C(g,x-23,y-10,46,5,'#c78c59');C(g,x-20,y-5,40,4,'#9c6947');
 C(g,x-19,y-1,3,7,'#4d5351');C(g,x+17,y-1,3,7,'#4d5351');
}
function lamppost(g,x,y){
 C(g,x-3,y-82,6,85,'#486064');C(g,x-12,y-88,24,7,'#e9e2b2');
 C(g,x-10,y-89,20,4,'#627f7a');C(g,x-9,y-82,18,10,'#ffe4a177');
 C(g,x-7,y-86,14,10,'#ffefbc');
}
function fountain(g,x,y,t){
 ellipse(g,x,y,76,32,'#9d9981');ellipse(g,x,y-7,71,27,'#d6cbb3');
 ellipse(g,x,y-8,64,23,'#65b9c7');ellipse(g,x,y-10,57,18,'#8ed9d8');
 ellipse(g,x,y-21,18,8,'#f2ddba');
 C(g,x-7,y-49,14,30,'#c5b79c');C(g,x-12,y-51,24,8,'#eee4c9');
 for(let j=-3;j<=3;j++)C(g,x+j*9,y-65+j*j*3+Math.sin(t*3+j)*3,3,16,'#b4edf0');
}
function bird(g,x,y,i){
 C(g,x,y,4,3,i%2?'#ddd6c6':'#a9b3a8');C(g,x+2,y-2,3,2,'#fff5dd');
 C(g,x-2,y+3,2,1,'#9b755d');C(g,x+5,y+3,2,1,'#9b755d');
}
const suits={
 hero:['#cb7455','#f2d8a8','#345570','#c39472','#293b42'],
 police:['#35627a','#bfd9df','#294653','#c59473','#26434f'],
 client:['#d2ab55','#f6e2b1','#697277','#cc9b78','#574736'],
 tourist:['#a45b7f','#f0d3ab','#495c75','#d7a883','#594b3f'],
 passer:['#71959a','#f4dbbc','#4d5b69','#c69a77','#443f42'],
 market:['#b76557','#efbfa0','#496c5e','#c18a68','#34373b']
};
export function drawParkPerson(g,x,y,role='passer',time=0,face=1,variant=0,scale=1){
 const ctx=g.g;ctx.save();ctx.translate(Math.round(x),Math.round(y));
 ctx.scale((face<0?-1:1)*scale,scale);
 const colors=suits[role]||suits.passer;
 const shirt=variant%3===1?'#d28a7a':variant%4===3?'#6d84a6':colors[0],pants=colors[2],skin=colors[3],hair=colors[4];
 const phase=Math.sin(time*9+variant),swing=phase*6;
 ellipse(g,0,1,13,4,'#2c5a4c66');
 // Five-layer pixel legs and boots; walking animation is not a drifting blob.
 C(g,-8,-19,7,13,pants);C(g,1,-19,7,13,'#354b5c');
 C(g,-8+swing,-9,7,9,pants);C(g,1-swing,-9,7,9,'#354b5c');
 C(g,-9+swing,-2,10,4,'#373c40');C(g,1-swing,-2,11,4,'#373c40');
 C(g,-13,-37,6,17,shirt);C(g,8,-38,6,17,'#40536a');
 C(g,-13,-22+phase*2,6,5,skin);C(g,8,-22-phase*2,6,5,skin);
 C(g,-10,-41,21,24,'#263f46');C(g,-9,-40,19,22,shirt);
 C(g,-4,-40,8,5,colors[1]);C(g,-2,-35,4,17,'#dfb38a');
 C(g,-10,-21,20,3,'#4f5150');C(g,-3,-47,7,7,skin);
 C(g,-9,-61,19,17,'#5b4f46');C(g,-8,-60,17,15,skin);
 C(g,-8,-62,17,6,hair);C(g,-9,-58,4,9,hair);C(g,9,-54,4,6,skin);
 C(g,4,-55,4,3,'#fbefd8');C(g,6,-54,2,2,'#28383a');
 C(g,10,-49,3,2,'#9c5e50');C(g,-5,-48,6,2,'#e6b498');
 if(role==='police'){
  C(g,-10,-65,21,5,'#214458');C(g,-6,-69,15,5,'#376d86');
  C(g,1,-40,4,20,'#a8c5c9');C(g,6,-36,3,9,'#f4e4c4');
  C(g,-8,-20,18,3,'#243f4e');C(g,-8,-20,3,10,'#2a3e51');
 } else if(role==='hero'){
  C(g,-11,-63,18,3,'#283d43');C(g,-13,-56,4,11,'#eccd81');C(g,-12,-53,2,7,'#3d5164');
  C(g,-7,-36,3,9,'#eaa17b');C(g,4,-34,3,10,'#eed59e');
 } else if(role==='tourist'){
  C(g,-11,-65,24,5,'#c9a371');C(g,-8,-70,18,7,'#ddbc88');
  C(g,10,-31,6,14,'#d0a675');
 }
 ctx.restore();
}
const parkObjects=[];
for(let i=0;i<74;i++){
 const x=80+i*26+(rnd(i,4)-.5)*70;
 const depth=[-145,-105,-40,35,99,148][i%6];
 if(i%5===1)parkObjects.push({kind:'palm',x,depth});
 else parkObjects.push({kind:'tree',x,depth,variant:i%3});
}
for(let i=0;i<20;i++){
 const x=115+i*92,depth=[-110,-54,55,132][i%4];
 parkObjects.push({kind:i%3===1?'lamppost':'bench',x,depth});
}
const publicNPC=[];
for(let k=0;k<PARK_LAYOUT.groups;k++){
 const x=140+k*111,depth=[-94,84,-17,130][k%4];
 const count=2+k%4;
 for(let a=0;a<count;a++)publicNPC.push({
  x:x+(a-(count-1)/2)*25,depth:depth+(a%2)*13,
  kind:(k%7===0&&a===0)?'street-musician':'group',group:k,
  variant:(k*5+a)%9
 });
}
for(let i=0;i<PARK_LAYOUT.solitary;i++)publicNPC.push({
 x:90+i*62+(rnd(i,3)-.5)*42,depth:-140+Math.floor(rnd(i,7)*8)*40,
 kind:'solo',variant:i%8
});
function crowd(g,person,x,depth,cam,t){
 const y=302+depth*.73;
 if(x<-30||x>W+30||y<150||y>H+60)return;
 if(person.kind==='street-musician'){
  const img=CC0_SPRITES.pixelboy;
  if(img?.complete&&img.naturalWidth){
   g.g.imageSmoothingEnabled=false;
   g.g.drawImage(img,((Math.floor(t*4)%4)*16),0,16,16,Math.round(x-15),Math.round(y-32),30,31);
   C(g,x+16,y-13,4,12,'#a97342');C(g,x+18,y-17,3,13,'#d6b18a');return;
  }
 }
 drawParkPerson(g,x,y,person.kind==='group'?'tourist':'passer',t*(person.kind==='solo'?.28:.05),
  person.variant%2?-1:1,person.variant,person.kind==='group'?.63:.72);
}
const CHAPITRE_PELOUSE='chapitre 1 — « La salle d’attente », p 9-10';
function lawnChapterTitle(g,cam){
 const x=1180-cam;
 if(x<-230||x>W+230)return;
 // Texte blanc peint sur la pelouse, avec une petite ombre pour le contraste.
 const lines=[['chapitre 1 —',151,15],['« La salle d’attente »',171,16],['p 9-10',191,15]];
 for(const [line,y,size] of lines){
  tx(g,line,x+2,y+2,size,'#406b5377');
  tx(g,line,x,y,size,'#ffffff');
 }
}
function drawForeground(g,run,phase,particles,cam,t,clients,policeBases){
 const playerX=run.x-cam;
 const dynamic=[];
 for(const p of publicNPC){
  let x=p.x-cam;
  if(p.kind==='solo')x+=Math.sin(t*.36+p.variant*2)*11;
  dynamic.push({depth:p.depth,x,draw:()=>crowd(g,p,x,p.depth,cam,t)});
 }
 for(const [idx,c] of clients.entries()){
  const x=c.x-cam,depth=c.lane??0;
  dynamic.push({depth,x,draw:()=>{
   if(x<-50||x>W+50)return;
   const y=302+depth*.73,done=run.sold.includes(c.id);
   drawParkPerson(g,x,y,'client',t*.18,c.x<run.x?-1:1,idx,1.06);
   C(g,x-24,y-98,48,28,done?'#507c5f':'#f7df9e');
   tx(g,done?'✓':'◆',x,y-77,20,done?'#d6f3c2':'#987347');
   if(!done)tx(g,'CLIENT',x,y-103,12,'#25483f');
  }});
 }
 for(const [idx,base] of policeBases.entries()){
  const p=run.policeState?.[idx]||{x:base,lane:[-85,75][idx],dir:idx===0?1:-1},x=p.x-cam,depth=p.lane;
  dynamic.push({depth,x,draw:()=>{
   if(x<-50||x>W+50)return;
   const y=302+depth*.73;
   drawParkPerson(g,x,y,'police',phase==='running'?t*1.7:0,p.dir||1,idx,1.03);
   ellipse(g,x,y+6,24,7,'#cb6c5b33');
   C(g,x-44,y-114,88,37,'#f5f3e2');
   C(g,x-41,y-111,82,31,'#315e70');
   tx(g,'GUARDIA',x,y-97,12,'#fff9e9');
   tx(g,'CIVIL',x,y-83,12,'#fff9e9');
  }});
 }
 dynamic.push({depth:run.lane||0,x:playerX,draw:()=>{
  const y=302+(run.lane||0)*.73-(run.y||0)*.9;
  drawParkPerson(g,playerX,y,'hero',phase==='running'?run.steps*.7:0,run.facing,0,1.22);
  if((run.y||0)>0){ellipse(g,playerX,305+(run.lane||0)*.73,16,4,'#274d4477');}
 }});
 for(const obj of parkObjects){
  const x=obj.x-cam,depth=obj.depth,y=302+depth*.73;
  if(x<-90||x>W+90)continue;
  dynamic.push({depth,x,draw:()=>{
   if(obj.kind==='bench')bench(g,x,y);
   else if(obj.kind==='lamppost')lamppost(g,x,y);
   else arbor(g,x,y,obj.kind==='palm'?2:obj.variant,obj.kind==='palm'?.8:.56);
  }});
 }
 dynamic.sort((a,b)=>a.depth-b.depth||a.x-b.x);
 for(const thing of dynamic)thing.draw();
 for(const p of particles){
  const x=p.x-cam,depth=p.lane??0,y=302+depth*.73-Math.max(0,1.6-p.life)*30;
  if(x>=-45&&x<=W+45){C(g,x-22,y-19,45,24,'#215f50');tx(g,p.label||'+2',x,y,19,'#ffe6a3');}
 }
}
export function drawCatalognePark(scene,run,phase,particles=[],clock=0,clients=[],policeBases=[]){
 const g=scene;
 const c=g.g; c.imageSmoothingEnabled=false;
 const curr=run||{x:90,lane:0,y:0,sold:[],facing:1,steps:0};
 // See farther ahead to choose another alley before reaching a police patrol.
 scene.camera=clamp(curr.x-(curr.facing===-1?435:255),0,PARK_LAYOUT.width-W);
 const cam=scene.camera;
 c.clearRect(0,0,W,H);
 townBackdrop(g,cam);paths(g,cam);garden(g,cam);lawnChapterTitle(g,cam);
 for(const fx of [505,1510]){
  const x=fx-cam;if(x>-140&&x<W+140)fountain(g,x,289,clock);
 }
 for(let i=0;i<26;i++){
  const x=140+i*65-cam;
  if(x>=-20&&x<W+20)bird(g,x,205+(i%3)*57,i);
 }
 drawForeground(g,curr,phase,particles,cam,clock,clients,policeBases);
 C(g,9,10,215,25,'#224c49de');
 tx(g,'PARC · PLAÇA DE CATALUNYA',116,27,12,'#fff5d9');
 C(g,W-182,10,173,25,'#244e54de');
 tx(g,'ALLÉE '+(curr.lane<-42?'NORD':curr.lane>42?'SUD':'CENTRALE'),W-94,27,12,'#fff5d9');
 if(scene.c?.setAttribute){
  scene.c.setAttribute('aria-label',
   'Grand parc en 2D, plusieurs allées, groupes de promeneurs et deux policiers en patrouille aller-retour. '
   +curr.sold.length+' clients servis sur 5. '
   +'Position dans le parc : allée '+(curr.lane<-42?'nord':curr.lane>42?'sud':'centrale')+'.');
 }
}
