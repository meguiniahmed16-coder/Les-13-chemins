/* Le départ du lycée — art 2D original, rétro 384 × 216, v2.0.
 * Aucune texture ni spritesheet de tiers : assets propres au jeu.
 * Cette couche graphique ne touche jamais au score ou aux règles.
 */
const C={
 sky:'#80c9df',skyTop:'#60b6d2',cloud:'#faf1d7',snow:'#ecf1e2',
 far:'#91b7ae',mountain:'#658c88',hill:'#4c886e',hill2:'#6da17b',
 grass:'#85bd70',forest:'#316c53',leaf:'#66ac69',road:'#78838a',
 ink:'#253a3f',ivory:'#f9efd3'
};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const mix=(a,b,t)=>{t=clamp(t);return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');};
export function biomeAt(distance){const d=clamp(distance,0,400);return {school:1-ease(0,180,d),forest:ease(35,125,d)*(1-ease(265,395,d)),highway:ease(205,370,d)};}
const box=(g,x,y,w,h,col)=>g.rect(x,y,w,h,col);
const poly=(g,p,col)=>g.poly(p,col);
const text=(g,s,x,y,n,col)=>g.text(s,x,y,n,col);
const span=(v,p)=>((v%p)+p)%p;
function cloud(g,x,y,k){const c=g.ctx;c.save();c.translate(Math.round(x),y);c.scale(k,k);
 box(g,0,5,48,8,'#e8f3e0');box(g,8,0,33,11,'#f6f6e6');box(g,16,-5,18,10,C.cloud);c.restore();}
function pine(g,x,y,k=1){const c=g.ctx;c.save();c.translate(Math.round(x),Math.round(y));c.scale(k,k);
 box(g,-3,-11,6,12,'#69553f');poly(g,[[-20,-4],[0,-48],[20,-4]],'#295b4f');
 poly(g,[[-17,-20],[0,-60],[17,-20]],'#35745b');poly(g,[[-12,-36],[0,-69],[12,-36]],'#58986b');
 box(g,-3,-49,6,3,'#8abc78');box(g,-10,-24,7,4,'#6ca574');c.restore();}
function oak(g,x,y,k=1,color=0){const c=g.ctx;c.save();c.translate(Math.round(x),Math.round(y));c.scale(k,k);
 box(g,-4,-45,8,46,'#71593f');box(g,-13,-47,4,28,'#7a6547');box(g,4,-56,4,28,'#7a6547');
 const dark=color?'#397451':'#307051',mid=color?'#58a365':'#49935b',light=color?'#92c774':'#7bbb6d';
 box(g,-28,-67,54,31,dark);box(g,-23,-81,49,30,mid);box(g,-14,-91,34,25,dark);
 box(g,-34,-61,22,20,mid);box(g,12,-71,22,23,mid);box(g,-22,-74,25,14,light);
 box(g,4,-79,20,13,light);box(g,-11,-61,14,8,light);box(g,14,-55,7,4,light);c.restore();}
function bush(g,x,y,k=1){const c=g.ctx;c.save();c.translate(x,y);c.scale(k,k);
 box(g,-18,-11,36,12,'#377b52');box(g,-14,-17,28,15,'#58a264');box(g,-4,-19,16,9,'#94c578');
 box(g,-15,-8,5,4,'#add085');c.restore();}
function flower(g,x,y,petal){box(g,x,y-6,1,6,'#48864b');box(g,x-2,y-9,5,4,petal);box(g,x,y-8,1,2,'#f9ecd0');}
function background(g,d,reduced){
 const par=reduced?0:d*3;
 box(g,0,0,384,216,C.sky);box(g,0,0,384,26,C.skyTop);box(g,0,63,384,23,'#a9dbd7');
 box(g,319,25,30,32,'#fbe0a4');box(g,325,20,17,40,'#fbe0a4');
 for(let i=-1;i<7;i++)cloud(g,span(i*101+12-par*.025,610)-65,24+(i%3)*17,.7+(i%2)*.13);
 for(let i=-1;i<6;i++){const x=i*105-span(par*.031,105);
  poly(g,[[x-53,140],[x+27,46],[x+113,140]],C.far);
  poly(g,[[x-11,92],[x+27,46],[x+56,82],[x+42,76],[x+31,89],[x+21,75],[x+5,94]],C.snow);
 }
 poly(g,[[0,130],[40,94],[85,121],[134,95],[197,130],[246,101],[310,122],[384,97],[384,174],[0,174]],C.mountain);
 poly(g,[[0,146],[61,116],[100,139],[158,116],[212,147],[269,126],[328,142],[384,118],[384,175],[0,175]],C.hill);
 poly(g,[[0,156],[44,136],[104,150],[173,127],[252,147],[321,134],[384,144],[384,178],[0,178]],C.hill2);
 for(let i=-1;i<12;i++)pine(g,span(i*49-par*.13,620)-36,154,.34+(i%3)*.035);
}
function school(g,d){
 const x=Math.round(18-d*1.1);if(x< -220)return;
 const c=g.ctx;c.save();c.translate(x,0);
 // Pleasant school with a pitched terracotta roof and light stone walls.
 box(g,-8,153,210,8,'#668f67');box(g,0,82,193,76,'#ab7e59');
 box(g,4,79,185,75,'#f0d6a5');box(g,3,137,188,16,'#e9c08a');
 poly(g,[[-12,80],[31,58],[156,58],[202,80]],'#a35649');
 poly(g,[[-12,76],[31,54],[157,54],[202,76]],'#c87555');
 for(let i=0;i<9;i++){const xx=17+i*19;box(g,xx,61,11,3,i%2?'#e59a71':'#da825c');}
 box(g,0,79,192,4,'#fff0c8');
 for(let row=0;row<2;row++)for(let col=0;col<7;col++){
  if(row===1&&col===3)continue;
  const wx=12+col*25,wy=92+row*25;
  box(g,wx-2,wy-2,19,22,'#e6b986');box(g,wx,wy,15,18,'#486e78');
  box(g,wx+2,wy+2,11,5,'#a4d2d0');box(g,wx+7,wy,2,18,'#fff0ce');
  box(g,wx,wy+8,15,2,'#fff0ce');box(g,wx-2,wy+18,20,3,'#fff3cc');
 }
 box(g,62,84,65,11,'#fff5d3');box(g,65,86,59,7,'#436c79');text(g,'LYCÉE',80,93,8,'#fff8df');
 box(g,77,126,30,30,'#a87951');box(g,80,128,25,28,'#436e81');box(g,92,128,2,28,'#f7e4ba');
 box(g,75,123,34,5,'#fff2cf');box(g,96,145,2,2,'#e9c373');
 box(g,9,149,49,7,'#749c5e');box(g,123,149,56,7,'#70995e');
 for(let i=0;i<9;i++){const xx=10+i*18;box(g,xx,146,7,4,i%2?'#4c935c':'#69aa65');}
 // Entrance steps and bicycle rack for a lived-in school.
 box(g,67,157,55,3,'#ead5b2');box(g,72,160,45,2,'#cebaa0');
 for(let i=0;i<4;i++){box(g,165+i*8,155,1,8,'#6c796d');box(g,164+i*8,157,6,1,'#bdc2a5');}
 c.restore();
}
function campus(g,d){if(d>150)return;
 const p=d*.9;
 oak(g,243-p,157,.59,1);oak(g,346-p,157,.53,0);
 for(let i=0;i<6;i++){bush(g,211-p+i*16,166,.4);flower(g,217-p+i*16,170,i%2?'#efc666':'#ffedcf');}
 for(let i=-1;i<13;i++){const xx=i*33-p*.25;box(g,xx,160,28,3,'#b8ba8b');box(g,xx,167,28,2,'#788b6f');box(g,xx+3,159,3,10,'#88967c');}
}
function forest(g,d,h){
 if(d<35)return;const opacity=ease(35,110,d)*(1-ease(305,400,d)*.6);
 const c=g.ctx;c.save();c.globalAlpha=opacity;
 for(let i=-2;i<12;i++){const x=span(i*52-d*.42,670)-53;if(i%4===0)pine(g,x,158,.55);else oak(g,x,158,.34,i%2);}
 for(let i=-2;i<11;i++){const x=span(i*98-d*1.5,980)-58;
  if(i%4===0)pine(g,x,173,.81);else oak(g,x,173,.7+(i%3)*.06,i%2);
  if(i%3===0)bush(g,x+28,176,.44);
 }
 c.restore();
}
function roadway(g,d,h){
 box(g,0,153,384,24,mix('#84b970','#91a69b',h));
 box(g,0,175,384,5,mix('#c0bf91','#bac5bd',h));
 box(g,0,180,384,36,mix('#b0a17b','#657781',h));
 box(g,0,184,384,25,mix('#9f987c','#596c78',h));
 box(g,0,211,384,5,mix('#b3b185','#596971',h));
 for(let i=-2;i<18;i++){const x=span(i*39-d*3,800)-35;
  box(g,x,206,17,2,h>.6?'#e8e8d8':'#e0cfa8');
  if(h<.7){box(g,x+8,173,2,3,'#507e5a');box(g,x+11,174,1,2,'#6eaa66');}
 }
 if(h<.8)for(let i=-1;i<23;i++){const x=span(i*23-d*.8,560)-29;box(g,x,157,2,15,'#697f61');box(g,x,160,22,2,'#a8b78c');}
 if(h>.07){for(let x=0;x<384;x+=41){box(g,x,157,4,19,'#6f8387');box(g,x+1,159,2,15,'#c9d3cf');}
  box(g,0,155,384,4,'#c9d4d0');box(g,0,159,384,3,'#7d969d');
  for(let x=0;x<384;x+=48)box(g,span(x-d*2,400),196,23,2,'#f1eddc');
 }
}
function sign(g,d){
 if(d>150){const x=Math.round(380-d*.2);box(g,x,121,3,36,'#708280');box(g,x-20,111,47,15,'#ffefd3');
 box(g,x-17,114,42,9,'#427d88');text(g,'LA ROCHE',x-15,122,6,'#fff6df');}
 const x=214+(400-d)*2.5;if(x>485)return;
 box(g,x+10,104,4,69,'#7d8d8c');box(g,x+77,104,4,69,'#7d8d8c');
 box(g,x-3,87,94,42,'#f5efd8');box(g,x,91,88,33,'#286b90');
 text(g,'A410',x+16,113,18,'#f5f3dc');text(g,'→',x+61,116,15,'#f5f3dc');
 box(g,x+40,175,3,29,'#e1e0d2');
}
const costumes={
 hero:{coat:'#cf7456',shade:'#a45445',pants:'#335874',dark:'#244053',face:'#c88e69',shine:'#e4b18d',hair:'#263c43',shoe:'#f0dbb3'},
 white:{coat:'#f3ede2',shade:'#c8cebb',pants:'#596873',dark:'#3b505d',face:'#ddb089',shine:'#f0caa6',hair:'#78654c',shoe:'#60564a'},
 suit:{coat:'#43545e',shade:'#2c3d48',pants:'#3c515d',dark:'#253945',face:'#b98768',shine:'#d9aa86',hair:'#3c3637',shoe:'#34373e'}
};
export function drawPixelRunner(g,x,ground,who,time,speed=0,options={}){
 const c=g.ctx,v=costumes[who]||costumes.hero,run=speed>.1,frame=run?Math.floor(time*(speed>14?13:10))%6:0;
 const stride=run?[0,4,6,0,-4,-6][frame]:0;
 const scale=(who==='white'?1.08:1.03)*(options.victory?1.22:1);
 c.save();c.translate(Math.round(x),Math.round(ground));c.scale(scale*(options.direction||1),scale);
 if(options.trip){c.rotate(1.12+Math.sin(time*10)*.08);c.translate(-3,-4);}
 if(run)c.translate(0,-[0,1,2,1,0,1][frame]);
 // Independent arms and legs, shoes, full trousers (not single-pixel sticks).
 for(const [side,dx,far] of [[-5,stride,true],[5,-stride,false]]){
  const knee=side+dx*.45,foot=side+dx;
  box(g,side-5,-20,10,8,far?v.dark:v.pants);box(g,knee-4,-13,8,8,far?v.dark:v.pants);
  box(g,foot-4,-6,8,5,far?v.dark:v.pants);box(g,foot-5,-2,12,4,'#293a42');box(g,foot-3,-3,8,3,v.shoe);
 }
 const arm=stride*.6;
 box(g,-14,-37-arm,6,14,v.shade);box(g,-14,-23-arm,6,5,v.face);
 box(g,8,-36+arm,6,14,v.shade);box(g,8,-22+arm,5,5,v.face);
 box(g,-11,-42,22,21,'#273c46');box(g,-10,-41,20,21,v.coat);
 box(g,-9,-40,3,17,v.shade);box(g,7,-39,3,16,v.shade);
 box(g,-3,-41,7,5,who==='suit'?'#f3e9d6':'#faeacb');
 box(g,-1,-36,2,12,who==='suit'?'#b69b6d':'#e0a983');
 box(g,-10,-24,20,3,v.shade);
 // Proper side profile: ear, visible eye, hair volume, eyebrows and mouth.
 box(g,-3,-47,7,7,v.face);box(g,-8,-60,18,16,'#284049');box(g,-7,-59,16,14,v.face);
 box(g,-9,-59,6,8,v.hair);box(g,-9,-62,18,6,v.hair);box(g,-3,-64,10,3,v.hair);
 box(g,9,-54,3,5,v.shine);box(g,3,-54,4,3,'#fff4d5');box(g,5,-54,2,2,v.hair);
 box(g,9,-48,3,2,'#79584a');box(g,0,-47,6,2,v.shine);
 if(who==='hero'){
  box(g,-7,-61,15,2,'#283b42');box(g,-10,-56,4,7,'#e3bb72');box(g,-9,-53,2,4,'#354f57');
  box(g,-8,-37,3,8,'#e98e65');box(g,5,-36,2,7,'#f3ae7b');
  if(options.victory){box(g,10,-38,7,13,v.face);box(g,13,-31,9,9,'#e5c375');box(g,15,-28,5,3,'#456373');
   box(g,1,-49,8,2,'#fff2d2');}
 }else if(who==='white'){box(g,-7,-58,13,4,'#887458');box(g,7,-48,4,2,'#fff7dc');}
 else {box(g,-8,-59,16,5,'#332e34');box(g,-3,-40,7,13,'#e9ddc9');box(g,-1,-38,2,8,'#b5a277');}
 c.restore();
}
export function drawPixelChase(g,run,phase,time,reduced=false){
 const d=run?.distance||0,t=biomeAt(d),speed=phase==='running'&&!run?.stopRemaining?(run?.speed||0):0;
 const c=g.ctx;c.clearRect(0,0,384,216);
 background(g,d,reduced);school(g,d);campus(g,d);forest(g,d,t.highway);roadway(g,d,t.highway);
 for(let i=0;i<14;i++){const x=span(i*34-d*2.4,580)-28;
  if(t.highway<.66&&i%2===0)flower(g,x,176,i%3?'#ffd46f':'#fff8dc');
  if(t.highway<.6&&i%3===0)bush(g,x,174,.33);
 }
 sign(g,d);
 const gap=run?.gap??27,hx=phase==='escaped'?245:214,white=hx-Math.max(16,gap*2.75),suit=white-29;
 const trip=['running','paused'].includes(phase)&&(run?.tripRemaining||0)>0;
 if(phase!=='escaped'){
  drawPixelRunner(g,suit,190,'suit',time+.1,trip?0:(phase==='running'?13.5:0),{trip});
  drawPixelRunner(g,white,190,'white',time+.2,trip?0:(phase==='running'?13.5:0),{trip});
  if(trip)for(const xx of [suit,white]){text(g,'*',xx-5,154,12,C.ivory);box(g,xx+10,192,8,2,'#e0d4b2');}
 }
 drawPixelRunner(g,hx,phase==='escaped'?204:190,'hero',phase==='escaped'?time:run?.elapsed||0,speed,{direction:phase==='escaped'?1:(run?.direction||1),victory:phase==='escaped'});
 if(speed>12)for(let j=0;j<3;j++)box(g,hx-(run?.direction||1)*(12+j*11),191+j%2*2,6,2,'#eae3c5');
 if(phase==='escaped'){if(time>1.2){text(g,'HA HA !',267,140+(reduced?0:Math.sin(time*4)),10,C.ink);
  text(g,'♪',283,160,13,'#f8edbf');}
  for(let i=0;i<19;i++)box(g,35+i*18,15+span(i*23+(reduced?0:time*13),138),2,2,i%2?'#f5d67e':'#f9f1cb');}
}
