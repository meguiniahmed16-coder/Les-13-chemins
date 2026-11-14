// A separate demonstration clock: no patrol, points or real-game input.
const STEPS=[
 {duration:4.5,title:'1 · Prendre le balai',text:'Un appui sur Saisir. Tu t’approches, la main se referme, puis soulève le balai.'},
 {duration:6,title:'2 · Attraper la corde',text:'Attends le cercle vert, puis maintiens Saisir pour accrocher et tirer le sac.'},
 {duration:5,title:'3 · Se cacher',text:'Des pas ? Maintiens Se cacher. Relâche quand le couloir est calme, puis reprends.'}
];
export function createPrisonDemo({document,onFinish=()=>{}}){
 const $=id=>document.getElementById(id),panel=$('demo');
 let active=false,step=0,elapsed=0,finished=false;
 function display(){
  panel.dataset.step=String(step);
  $('demo-title').textContent=STEPS[step].title;
  $('demo-text').textContent=STEPS[step].text;
  $('demo-progress').textContent=(step+1)+' / 3';
  $('demo-play').textContent=finished?'À toi de jouer':'Passer la démo';
 }
 function open(){active=true;step=0;elapsed=0;finished=false;panel.hidden=false;display();for(const animation of panel.getAnimations?.({subtree:true})||[])animation.currentTime=0;$('demo-play').focus();}
 function close(){active=false;panel.hidden=true;}
 function update(dt){
  if(!active||finished)return;
  elapsed+=Math.max(0,Math.min(.1,dt));
  if(elapsed>=STEPS[step].duration){
   elapsed=0;if(step<2)step++;else finished=true;display();
  }
 }
 $('demo-play').addEventListener('click',()=>{if(!active)return;close();onFinish();});
 $('demo-again').addEventListener('click',open);
 return {open,close,update,get active(){return active;},get step(){return step;},get finished(){return finished;}};
}
