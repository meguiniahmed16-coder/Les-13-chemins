/* Pilot-only 3D gameplay: reuses the 30-point yo-yo rules; does NOT modify scores
   or save the original playable prison game until the author approves this trial. */
import {createGame,startGame,continueGame,move,aimAt,actionDown,actionUp,
 advance,aligned,betweenBars,PARTS} from './yoyo-core.js';
import {buildPrisonScene} from './prison-3d-scene.js';
import {makeAudio} from './yoyo-audio.js';

const $=id=>document.getElementById(id),state=createGame(),audio=makeAudio();
let graphic=null,modelReady=false,playing=false,paused=false,elapsed=0,last=0,pressed=false;
let timer=0,joystick=0,currentStage=0,seenError=false,frameId=0;
const signal=text=>{
 $('announcement').textContent=text;
 $('notice').textContent=text;
};
function overlay(title,description,actionLabel,onAction){
 $('overlay').hidden=false;
 $('overlayTitle').textContent=title;
 $('overlayMessage').textContent=description;
 $('overlayAction').textContent=actionLabel;
 $('overlayAction').onclick=onAction;
}
function showStage(){
 const part=Math.min(3,state.part+1);
 $('stage').textContent=state.phase==='victory'?'3 / 3':part+' / 3';
 $('score').textContent=state.points+' / 30';
 $('mission').textContent=PARTS[Math.min(2,state.part)]||'Terminé';
 $('guard').textContent=state.guard==='watching'?'SURVEILLANT : il regarde !':
  state.guard==='approaching'?'Des pas approchent…':
  state.guard==='leaving'?'Le surveillant s’éloigne…':'Couloir calme';
 $('guard').dataset.danger=state.guard==='watching'?'yes':state.guard==='approaching'?'warning':'no';
 $('pointerValue').textContent=Math.round(state.aim*100)+' %';
 $('aim').value=Math.round(state.aim*100);
 $('alignment').textContent=state.part===0?
  aligned(state)?'✓ Brosse à portée, appuie sur ATTRAPER':'Vise le manche de la brosse':
  state.hooked?(betweenBars(state)?'✓ Le sac passe entre deux barreaux':'⛔ Le sac touche le fer'):
  aligned(state)?'✓ Corde accessible entre deux barreaux':'Attends le sac entre deux barreaux';
}
function begin(){
 if(!modelReady){signal('Le personnage humain 3D est encore en cours de chargement.');return;}
 try{audio.init();audio.door();}catch{}
 startGame(state);elapsed=0;last=performance.now();playing=true;paused=false;
 $('overlay').hidden=true;$('gameActions').hidden=false;$('howto').hidden=false;
 $('pause').textContent='Pause';signal('Trouve la brosse à toilette. Déplace le viseur et appuie sur ATTRAPER.');
 showStage();
}
function processEvents(){
 for(const event of state.events.splice(0)){
  if(event.type==='part'){
   try{audio.cue('part');}catch{}
   if(state.phase==='victory')continue;
   if(state.part===1)overlay('La brosse est à toi. +10',
    'Maintenant, accroche la corde grâce à la brosse puis guide le sac entre deux barreaux. Le métal bloque réellement le sac.',
    'Continuer vers le tabac →',()=>{
      continueGame(state);$('overlay').hidden=true;signal('Place la brosse sous la corde, puis maintiens ATTRAPER pour tirer le sac.');
    });
   else overlay('Le tabac est récupéré. +10',
    'Un peu de couleur revient à l’immeuble d’en face. Recommence pour obtenir le café.',
    'Continuer vers le café →',()=>{
      continueGame(state);$('overlay').hidden=true;signal('Vise la corde et attrape le café, sans toucher un barreau.');
    });
  }else if(event.type==='won'){
   try{audio.cue('won');}catch{}
   paused=true;playing=false;$('gameActions').hidden=true;
   overlay('De l’autre côté, quelqu’un. 30 / 30',
     'Brosse, tabac, café : trois gestes en véritable 3D. Cette démonstration ne crédite pas encore le score du jeu publié.',
     'Rejouer ce prototype ↻',begin);
   signal('Les trois épreuves ont été réussies en 3D.');
  }else if(event.type==='caught'){
   try{audio.cue('caught');}catch{}
   paused=true;playing=false;
   overlay('Le surveillant t’a repéré',
     'Les clés claquent derrière la porte. Cache-toi avec ▼ quand les pas approchent.',
     'Recommencer la scène ↻',begin);
  }else if(event.type==='guard'){
   try{audio.cue(event.state);}catch{}
   if(event.state==='approaching')signal('Des pas, des clés. Cache-toi avec ▼ !');
   if(event.state==='away')signal('Le couloir se calme. Tu peux reprendre.');
  }else if(event.type==='hook'){
   try{audio.cue('hook');}catch{}
   signal('Corde accrochée ! Déplace le viseur dans un espace entre deux barreaux et maintiens ATTRAPER.');
  }else if(event.type==='search-miss'||event.type==='miss'||event.type==='bar-miss'){
   try{audio.cue('miss');}catch{}
   signal('La cible n’est pas alignée. Corrige doucement le viseur.');
  }else if(event.type==='bar-blocked'){
   signal('Le fer bloque le sac. Ajuste vers un intervalle entre deux barreaux.');
  }
 }
}
function actDown(){
 if(!playing||paused||pressed)return;pressed=true;actionDown(state);processEvents();$('grab').classList.add('active');showStage();
}
function actUp(){if(!pressed)return;pressed=false;actionUp(state);$('grab').classList.remove('active');}
function holdHide(isHiding){
 if(!playing||paused)return;
 if(isHiding){move(state,0,1,.02);actUp();signal('Tu te dissimules derrière le lit.');}
 else move(state,0,-1,.02);
}
$('start').onclick=begin;
$('overlayAction').onclick=begin;
$('pause').onclick=()=>{
 if(!playing)return;
 paused=!paused;actUp();
 $('pause').textContent=paused?'Reprendre':'Pause';
 signal(paused?'Jeu en pause.':'Jeu repris.');
};
$('view').onclick=()=>{if(graphic){const side=graphic.orbit();$('view').textContent=side?'Vue de dos':'Vue latérale';}};
$('aim').addEventListener('input',()=>{
 if(!playing||paused)return;
 aimAt(state,Number($('aim').value)/100);
 showStage();
});
for(const name of ['pointerdown','pointerup','pointercancel','lostpointercapture']){
 $('grab').addEventListener(name,e=>{
  if(name==='pointerdown'){e.preventDefault();try{$('grab').setPointerCapture(e.pointerId);}catch{}actDown();}
  else actUp();
 });
}
for(const e of ['pointerdown','pointerup','pointercancel','lostpointercapture']){
 $('hide').addEventListener(e,ev=>{
  if(e==='pointerdown'){ev.preventDefault();try{$('hide').setPointerCapture(ev.pointerId);}catch{}holdHide(true);}
  else holdHide(false);
 });
}
$('left').onclick=()=>{if(playing&&!paused){move(state,-1,0,.22);showStage();}};
$('right').onclick=()=>{if(playing&&!paused){move(state,1,0,.22);showStage();}};
const keys=new Set();
window.addEventListener('keydown',e=>{
 if(['Space','ArrowLeft','ArrowRight','ArrowDown','ArrowUp'].includes(e.code)){
  e.preventDefault();keys.add(e.code);
  if(e.code==='Space'&&!e.repeat)actDown();
  if(e.code==='ArrowDown')holdHide(true);
 }
 if(e.code==='KeyV'&&!e.repeat)$('view').click();
 if(e.code==='KeyP'&&!e.repeat)$('pause').click();
});
window.addEventListener('keyup',e=>{
 keys.delete(e.code);
 if(e.code==='Space')actUp();
 if(e.code==='ArrowDown')holdHide(false);
});
$('viewport').addEventListener('pointerdown',e=>{
 if(!playing||paused)return;
 const r=$('viewport').getBoundingClientRect();
 aimAt(state,(e.clientX-r.left)/r.width);
 showStage();
});
$('reset').onclick=begin;
window.addEventListener('blur',()=>{actUp();if(playing)paused=true;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){actUp();paused=true;}});
function tick(now){
 const dt=Math.min(.07,Math.max(0,(now-(last||now))/1000));last=now;
 if(playing&&!paused){
  if(keys.has('ArrowLeft'))move(state,-1,0,dt);
  if(keys.has('ArrowRight'))move(state,1,0,dt);
  advance(state,dt);elapsed+=dt;processEvents();
 }
 if(graphic&& !seenError)try{graphic.render(state,elapsed,dt);}catch(err){
  seenError=true;signal('Rendu 3D interrompu : '+err.message);
 }
 showStage();
 frameId=requestAnimationFrame(tick);
}
async function initialize(){
 $('start').disabled=true;
 try{
  graphic=buildPrisonScene($('viewport'),{
   onModelReady:info=>{
    modelReady=true;$('start').disabled=false;
    $('modelName').textContent='Corps riggé : '+info.model+' · '+info.bones+' os de contrôle';
    signal('La cellule 3D et le corps libre sont prêts. Commencer pour jouer.');
   },
   onModelError:err=>{
    signal('Le personnage CC0 n’a pas pu être chargé : '+String(err.message||err));
    $('modelName').textContent='Corps 3D indisponible. Vérifie la connexion ou utilise la version classique.';
   }
  });
  const model=await graphic.modelPromise;
  if(!model)$('start').disabled=true;
 }catch(err){
  $('modelName').textContent='WebGL indisponible. Le jeu classique reste accessible.';
  signal(String(err.message||err));
 }
}
window.addEventListener('pagehide',()=>{
 cancelAnimationFrame(frameId);graphic?.dispose();audio.dispose();
},{once:true});
initialize();frameId=requestAnimationFrame(tick);
