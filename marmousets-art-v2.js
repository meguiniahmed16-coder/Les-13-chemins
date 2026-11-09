/* Les Marmousets — illustrations 2D originales, v2.1.
 * Dessins Canvas vectoriels articulés : cheval bai et personnages narratifs.
 * Source originale du projet : aucun sprite tiers n'est redistribué.
 */
(function(root){
'use strict';
const INK='#253633', OUT='#453b32';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function tint(hex,n){const s=hex.replace('#','');if(s.length!==6)return hex;const a=[0,2,4].map(i=>parseInt(s.slice(i,i+2),16));return '#'+a.map(v=>Math.round(clamp(n>0?v+(255-v)*n:v*(1+n),0,255)).toString(16).padStart(2,'0')).join('');}
function shape(c,d,fill,stroke=OUT,w=2){const p=new Path2D(d);if(fill){c.fillStyle=fill;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke(p);}}
function oval(c,x,y,rx,ry,fill,stroke=null,w=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function stroke(c,coords,color,w=2){c.beginPath();coords.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineCap='round';c.lineJoin='round';c.strokeStyle=color;c.lineWidth=w;c.stroke();}
function human(c,x,y,opt={}){
 const {s=1,color='#43849c',walk=0,dir=1,child=false,flee=false,hug=false,variant=0}=opt;
 const stride=Math.sin(walk)*(flee?12:7),arm=Math.sin(walk+.6)*(flee?9:5);
 const skin=['#bb7955','#d0966d','#a97050','#c88762','#e2a67d'][Math.abs(variant)%5];
 const pants=['#2d4258','#54526a','#4c564b','#385c74','#5a4745'][Math.abs(variant)%5];
 const shoes='#3b3b3d';
 c.save();c.translate(x,y);c.scale(s*dir,s);c.lineJoin='round';c.lineCap='round';
 oval(c,0,2,19,3,'#254f3c33');
 const leg=(side,far)=>{const h=side?-7:7,dx=side?stride:-stride;
  shape(c,`M${h-6} -35Q${h-9} -23 ${h-7+dx*.35} -16L${h-7+dx} -3Q${h-1+dx} 1 ${h+5+dx} -3L${h+5+dx*.6} -18Q${h+8} -29 ${h+6} -35Z`,far?tint(pants,-.15):pants,INK,1.4);
  shape(c,`M${h-8+dx} -5Q${h-5+dx} 0 ${h+7+dx} -1L${h+14+dx} 2Q${h+14+dx} 5 ${h+1+dx} 5L${h-9+dx} 3Z`,shoes,INK,1);};
 leg(true,true);leg(false,false);
 // Jacket sleeve behind torso, visible forearm, palm and five-finger silhouette.
 const sleeve=(left,back)=>{const sx=left?-13:13,el=sx+(left?-7:8)+(back?-arm:arm)*.5,
    wrist=el+(left?1:5),ey=-40+(flee?-8:0)+(hug?-13:0);
  stroke(c,[[sx,-56],[el,-47],[wrist,ey]],INK,10);
  stroke(c,[[sx,-56],[el,-47]],tint(color,back?-.22:-.08),7);
  stroke(c,[[el,-46],[wrist,ey]],skin,6);
  oval(c,wrist,ey+1,3.4,4,skin,'#885a42',.7);
 };
 sleeve(true,true);
 shape(c,'M-12 -61 Q0 -66 12 -61 L17 -38 Q14 -32 2 -31 L-14 -34 Q-18 -45 -12 -61Z',color,INK,2.2);
 shape(c,'M-10 -59 Q-3 -53 0 -46 L0 -33 Q-5 -35 -8 -39Z',tint(color,.16),null);
 shape(c,'M5 -58 Q12 -53 12 -42 L9 -35 L16 -39 16 -53Z',tint(color,-.15),null);
 shape(c,'M-5 -63L0 -52 5 -63',null,'#f8dca3',1.8);
 shape(c,'M-10 -38Q0 -34 14 -38',null,tint(color,-.3),1.2);
 sleeve(false,false);
 // Head and haircut, ears and highlights with consistent adult anatomy.
 shape(c,'M-4 -68L-4 -59Q0 -56 5 -59L5 -68Z',skin,'#81583f',1);
 oval(c,0,-80,14,17,skin,'#845e49',1.5);
 oval(c,-13,-79,3,4,skin,'#845e49',1);
 shape(c,'M-14 -80 Q-19 -98 -4 -102 Q9 -106 16 -94 Q19 -86 12 -80 L10 -91 Q2 -86 -6 -92 L-13 -86Z',variant%2?'#4d3529':'#293334',INK,1.4);
 shape(c,'M-10 -96Q-3 -104 6 -99',null,'#6b5141',2);
 oval(c,7,-81,1.7,2.2,INK);oval(c,7.5,-81.6,.55,.7,'#fff7db');
 shape(c,'M5 -74Q8 -72 11 -74',null,'#784e40',1.4);
 oval(c,-4,-76,4,2.2,'#e6a08033');
 if(child){oval(c,1,-75,2,1.4,'#d16b6044');}
 c.restore();
}
function horse(c,r,t,ground,person){
 const x=r.x,level=ground-r.y;const rear=r.rear>0?Math.sin((1-r.rear/.95)*Math.PI):0;
 const jump=r.jump?.t??0,air=!!r.jump,moving=r.phase==='running'&&r.steps>0&&!air&&!rear;
 const gait=r.steps*.8,breath=Math.sin(t*2.4)*1.25,bob=moving?Math.sin(gait*2)*1.6:breath;
 c.save();c.translate(x,ground+4);const shadowScale=clamp(1-r.y/430,.24,1);oval(c,0,0,84*shadowScale,10*shadowScale,'#2c51462f');c.restore();
 c.save();c.translate(x,level+bob);c.scale(r.facing,1);
 // Rearing rotates around the left hind hoof, not the centre of the animal.
 c.translate(-54,0);c.rotate(-rear*.57+(air?Math.cos(jump*Math.PI)*-.075:0));c.translate(54,0);
 const coat='#a65d3d',light='#c78654',deep='#784631',mane='#3f302b';
 const hoof=(px,py,far)=>{shape(c,`M${px-8} ${py-5}Q${px} ${py-7} ${px+7} ${py-5}L${px+10} ${py+1}Q${px+4} ${py+3} ${px-8} ${py+2}Z`,far?'#373b3c':'#2c3434','#283337',1.8);};
 const leg=(front,far,index)=>{
  const hip=front?39:-52,hy=front?-78:-77;
  let kneeX=hip+(front?2:-16),kneeY=-38,footX=hip+(front?4:-13),footY=-3;
  if(rear>0.04&&front){kneeX=hip+27*rear;kneeY=-78+rear*16;footX=hip+46*rear;footY=-55*rear-2;}
  else if(air){const fold=Math.sin(Math.PI*jump);kneeX=hip+(front?21:-20)*fold;kneeY=-45-fold*17;footX=hip+(front?20:-25)*fold;footY=-3-55*fold;}
  else if(moving){const offset=Math.sin(gait+(index%2?Math.PI:0))*18;const lift=Math.max(0,Math.cos(gait+(index%2?Math.PI:0)))*10;
    kneeX+=offset*.48;footX+=offset;footY-=lift;}
  const color=far?'#80503a':coat;
  shape(c,`M${hip-9} ${hy}Q${hip-15} -61 ${kneeX-6} ${kneeY}L${footX-6} ${footY-8}Q${footX} ${footY-13} ${footX+5} ${footY-8}L${kneeX+8} ${kneeY}Q${hip+13} -60 ${hip+10} ${hy}Z`,color,deep,1.6);
  shape(c,`M${kneeX-3} ${kneeY+5}Q${footX-3} ${footY-18} ${footX+4} ${footY-9}`,null,far?'#aa6d4b':'#d99b67',2.8);
  hoof(footX,footY,far);
 };
 leg(false,true,0);leg(true,true,1);
 // Tail is articulated separately; the far silhouette stays clear at speed.
 const sw=Math.sin(t*6)*11;
 shape(c,`M-70 -102Q${-104+sw*.3} -120 ${-110+sw} -88Q${-99+sw} -74 ${-111+sw} -51Q${-88+sw*.5} -65 -79 -85Z`,mane,'#342a28',2.2);
 shape(c,`M-79 -102Q${-91+sw*.2} -110 ${-93+sw} -92`,null,'#8d6950',2.8);
 // Muscular body: independent flank, shoulder and chest volume.
 shape(c,'M-74 -101Q-85 -126 -51 -130Q-33 -131 -17 -123Q8 -128 29 -122Q55 -121 66 -99Q80 -79 55 -70Q37 -64 6 -68Q-15 -66 -36 -66Q-69 -63 -76 -85Z',coat,deep,3);
 shape(c,'M-71 -103Q-72 -119 -48 -121Q-40 -106 -44 -91Q-49 -78 -70 -80Z','#b8754b',null);
 shape(c,'M-56 -120Q-28 -131 -3 -119Q18 -122 31 -116',null,'#e2a56c',4);
 shape(c,'M-39 -82Q-12 -91 19 -82Q33 -75 42 -84',null,'#814934',2.4);
 oval(c,43,-90,22,29,'#b8754c');
 // Neck arch is separate from the barrel for plausible proportions.
 shape(c,'M28 -111Q47 -133 55 -155Q64 -171 79 -165Q94 -160 87 -140Q82 -125 77 -111L64 -85Q49 -77 35 -83Z','#ad6542',deep,3);
 shape(c,'M39 -107Q55 -128 62 -152Q70 -162 78 -156Q69 -127 62 -105Z','#d28b57',null);
 shape(c,'M31 -115Q40 -141 54 -163L67 -170 74 -164 62 -150 56 -133 47 -120Z',mane,'#39302c',2);
 // Mane strands move subtly with the walking rhythm.
 const flap=Math.sin(t*7)*2;
 for(let i=0;i<4;i++){const sx=38+i*6;shape(c,`M${sx} ${-130-i*6}L${sx-9+flap} ${-123-i*6}L${sx-5} ${-137-i*6}Z`,mane,null);}
 // Ear geometry and expressive naturalistic head.
 shape(c,'M66 -156L63 -172Q69 -177 76 -166L79 -156Z',coat,deep,2.2);
 shape(c,'M79 -154L84 -170Q89 -173 93 -164L92 -151Z','#b46c48',deep,2);
 shape(c,'M69 -167L70 -172 75 -167Z','#bb7e68',null);
 shape(c,'M76 -160Q96 -159 99 -142Q106 -132 117 -127Q129 -120 124 -108Q122 -99 112 -99L99 -101Q92 -113 86 -116Q75 -135 76 -160Z',light,deep,2.6);
 shape(c,'M92 -135Q100 -128 110 -122Q115 -116 118 -116',null,'#eab17a',3);
 shape(c,'M105 -112Q114 -114 124 -107Q122 -99 111 -101L104 -103Z','#dfaf81',null);
 shape(c,'M117 -106Q119 -102 115 -101',null,'#6d4e3d',1.4);
 oval(c,98,-113,2.3,1.7,'#443c37');
 oval(c,91,-139,3.7,3.4,'#f9eccd','#4e3d31',1);oval(c,92,-139,2.1,2.6,INK);
 shape(c,'M84 -145Q91 -149 96 -143',null,mane,2.2);
 // Plain, period-neutral leather saddle; no medieval tack.
 shape(c,'M-30 -123Q-7 -132 19 -124L23 -110Q0 -103 -29 -110Z','#694634','#4b322e',2);
 shape(c,'M-19 -127Q-1 -133 16 -127',null,'#d7a56e',3);
 shape(c,'M11 -111L21 -72M20 -73L30 -73',null,'#5f4e3e',2.7);
 shape(c,'M-22 -111Q-5 -106 20 -110',null,'#e5bb7d',2);
 leg(false,false,2);leg(true,false,3);
 // Reins attach to the muzzle, without appearing glued to the face.
 shape(c,'M87 -152L100 -119L118 -115M102 -119L100 -109Q81 -98 43 -110',null,'#624331',2.4);
 // Narrator: a five-year-old (oversized head / correctly scaled limbs).
 const p=r.phase==='paused'&&r.pausePhase?r.pausePhase:r.phase;
 const mounted=p==='ready'||p==='approaching'||p==='won'?0:p==='mounting'?r.mount:p==='reunion'?Math.max(0,1-r.phaseTime):1;
 // Tant que l'enfant a les pieds au sol, afficher le personnage entier a deux jambes.
 // Ne passer a la silhouette de cavalier qu'une fois les pieds leves.
 if(mounted>0&&!(p==='mounting'&&r.mount<=.32)){const q=mounted,dx=-92*(1-q),dy=102*(1-q);
  c.save();c.translate(dx,dy);c.translate(-5,-112);c.scale(.87,.87);c.translate(5,112);
  // Cavalier assis a califourchon : seule la jambe du cote visible apparait.
  // Le pantalon et la chaussure sont des surfaces pleines, pas de simples traits.
  shape(c,'M-12 -116Q-2 -115 9 -109Q17 -104 18 -95L26 -82Q29 -78 25 -73L15 -73Q11 -76 11 -83L5 -95Q-5 -100 -15 -108Z','#2f536d',INK,2);
  shape(c,'M15 -77Q21 -81 27 -77L35 -74Q40 -71 37 -68L32 -66L18 -67Q15 -69 15 -73Z','#453832',INK,1.7);
  shape(c,'M15 -69L33 -68',null,'#bbab90',1.1);
  shape(c,'M-24 -155Q-8 -160 4 -151L9 -124Q-10 -115 -22 -127Z','#3e799e',INK,2);
  shape(c,'M-12 -149L0 -145',null,'#8db8be',2);
  shape(c,'M1 -147Q10 -132 24 -124L40 -115',null,'#ba865f',5);
  shape(c,'M-21 -145Q-28 -134 -16 -123',null,'#ba865f',5);
  shape(c,'M-9 -160L-10 -154',null,'#d59d73',5);
  oval(c,-10,-169,13.7,16.5,'#d5a076','#76513a',1.5);
  shape(c,'M-24 -174Q-25 -187 -10 -187Q7 -186 4 -170L0 -176 -4 -173 -10 -176 -17 -171Z',INK,INK,1);
  oval(c,-3,-170,1.6,1.9,'#2c3633');shape(c,'M-3 -161Q1 -159 4 -162',null,'#9a614c',1.4);
  c.restore();}
 c.restore();
 // Debout et en debut de montee : dessin complet avec DEUX jambes.
 if(p==='ready'||p==='approaching'||(p==='mounting'&&r.mount<=.32)){
  // Sur le sol : deux jambes. La marche precede la montee en selle.
  const m=p==='mounting'?r.mount:0;
  const atX=p==='approaching'?x-150+62*clamp(r.approach||0,0,1):p==='ready'?x-150:x-88+72*m;
  const walking=p==='approaching'?r.phaseTime*15:0;
  person(atX,ground-76*m,{s:.78+.25*m,color:'#3e799e',child:true,variant:0,walk:walking});
 }
 if(p==='reunion'||p==='won'){
  const v=p==='won'?5.2:r.phaseTime,walk=Math.max(0,v-1),heroX=x+80+Math.min(75,walk*50)+Math.max(0,v-3.1)*44,
   brotherX=3420+Math.max(0,v-3.1)*44;
  if(v>=1){person(heroX,ground,{s:.75,color:'#3e799e',walk:walk*10,child:true,variant:0,hug:v>2.5});
   person(brotherX,ground,{s:.6,color:'#c85e56',walk:walk*10,child:true,variant:1,hug:v>2.5});
   if(v>2.5)stroke(c,[[heroX+12,ground-26],[brotherX-7,ground-22]],'#c18c6b',3.5);}
 }
}
root.MarmousetsArt={version:'2.1',person:human,horse};
})(typeof window==='undefined'?globalThis:window);
