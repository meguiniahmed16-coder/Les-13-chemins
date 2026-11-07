import {SYMBOLS,NAMES,PRACTICE,WINDOW,createRun,start,beginRound,press,advance,togglePause} from './danse-core.js';
import {DanceScene} from './danse-scene.js';
import {StudioMusic} from './danse-music.js';
const $=id=>document.getElementById(id),embedded=parent!==window&&new URLSearchParams(location.search).get('embedded')==='1';
let run=createRun(),scene=null,session=null,initial=[],replay=false,credited=false,total=0,last=0,feedbackUntil=0,drawAt=0,victoryAt=0,wasPhase='',noteElements=[];
const music=new StudioMusic();
function send(type,data={}){if(embedded&&session)parent.postMessage({type:'danse:'+type,id:session,...data},location.origin);}
function flash(text,duration=1.2){$('feedback').textContent=text;feedbackUntil=performance.now()+duration*1000;}
function act(action){music.unlock();if(action==='cross'&&run.phase==='retry'){beginRound(run);consume();return;}press(run,action);consume();render();}
function pause(){togglePause(run);last=0;render();if(run.phase==='paused')$('resume').focus({preventScroll:true});}
function reset(passed=[]){run=createRun(passed);wasPhase='';noteElements=[];$('notes').replaceChildren();last=0;credited=false;render();}
function begin(){if(!scene||embedded&&!session)return;music.unlock();start(run);consume();render();$('hint').scrollIntoView({block:'nearest',behavior:'instant'});}
function consume(){for(const e of run.events.splice(0)){
 if(e.type==='hit'){flash(e.practice?'Bien !':e.perfect?'Dans le rythme !':'Bien joué !');music.tone(e.action==='circle'?84:79,.08,.05);}
 if(e.type==='offbeat')flash('Attends le cercle…',.7);
 if(e.type==='miss')flash('Garde le rythme',.7);
 if(e.type==='trained')flash('C’est parti !',2);
 if(e.type==='pass'){send('pass',{gap:e.gap});flash('+2 points',2.3);music.cheer();$('announcement').textContent='Palier '+e.gap+' réussi. '+e.gap*2+' points.';}
 if(e.type==='retry'){$('retryText').textContent=run.wrong>4?'Un seul appui par symbole : prends ton temps.':run.hits+' mouvements sur 8. Il en faut 6 pour convaincre le public.';$('retry').focus({preventScroll:true});}
 if(e.type==='won'){victoryAt=performance.now();send('won');music.cheer();}
 }
}
function render(){const n=run.passed.length,playing=run.phase==='playing',practice=run.phase==='practice';
 $('intro').hidden=run.phase!=='ready';$('pauseOverlay').hidden=run.phase!=='paused';$('retryOverlay').hidden=run.phase!=='retry';$('victory').hidden=run.phase!=='won'||performance.now()-victoryAt<2500;
 $('rhythm').hidden=!['practice','playing','countdown','break'].includes(run.phase);$('sceneCaption').hidden=run.phase!=='ready';
 $('percent').textContent=n*14+' %';$('meterFill').style.width=n*20+'%';$('meter').setAttribute('aria-valuenow',n*14);$('points').textContent=String(n*2).padStart(2,'0');
 $('checkpoints').innerHTML=Array.from({length:5},(_,i)=>'<span class="checkpoint '+(i<n?'done':i===n?'active':'')+'" aria-label="Palier '+(i+1)+(i<n?' réussi':'')+'">'+(i<n?'✓':i+1)+'</span>').join('');
 $('roundLabel').textContent=practice?'RÉPÉTITION · '+(run.practice+1)+'/5':'SÉQUENCE '+Math.min(5,run.round+1)+'/5';$('accuracy').textContent=playing?run.hits+' / 8 · objectif 6':practice?'Sans chronomètre':run.phase==='break'?'+2 POINTS':'À TOI DE JOUER';
 const next=practice?{action:PRACTICE[run.practice],at:run.time}:run.notes.find(n=>!n.done);const now=!!next&&(practice||Math.abs(next.at-run.time)<=WINDOW);
 $('cue').textContent=practice?SYMBOLS[next.action]+' '+NAMES[next.action]+' · appuie pour essayer':run.phase==='countdown'?'La musique démarre…':run.phase==='break'?'Public conquis ! La suite arrive…':next?(now?'MAINTENANT : ':'À SUIVRE : ')+SYMBOLS[next.action]+' '+NAMES[next.action]:'Très bien, garde la pose.';
 $('cue').classList.toggle('now',now);$('cue').dataset.action=next?.action||'';$('cue').dataset.timing=now?'now':'wait';
 if(run.phase!==wasPhase){$('notes').replaceChildren();noteElements=[];if(playing)for(const note of run.notes){const el=document.createElement('span');el.className='note';el.textContent=SYMBOLS[note.action];el.dataset.action=note.action;el.setAttribute('aria-hidden','true');$('notes').append(el);noteElements.push(el);}wasPhase=run.phase;}
 if(practice){if(!noteElements[0]){const el=document.createElement('span');el.className='note';el.style.left='20%';$('notes').append(el);noteElements=[el];}noteElements[0].textContent=SYMBOLS[next.action];noteElements[0].dataset.action=next.action;}
 if(playing)run.notes.forEach((note,i)=>{const el=noteElements[i],pos=20+(note.at-run.time)*34;el.style.left=pos+'%';el.hidden=pos < -5||pos>105||note.hit;el.classList.toggle('miss',note.done&&!note.hit);});
 $('hint').textContent=practice?'Essaie le geste indiqué. Ici, tu as tout ton temps.':playing?'Appuie une fois quand le symbole entre dans le cercle. 6 réussites sur 8.':run.phase==='won'?'Bravo ! 70 % du public te prend pour un danseur.':run.phase==='paused'?'La danse et la musique sont en pause.':run.phase==='retry'?'Tu peux reprendre cette séquence sans perdre les paliers précédents.':run.phase==='break'?'Un nouveau palier est acquis. Lionel respire un peu mieux !':'← → : les pas · ✕ : jerk · □ : bras · ○ : tour · △ : pause';
 $('start').disabled=!scene||embedded&&!session;$('start').textContent=!scene?'Préparation du plateau…':embedded&&!session?'Connexion au plateau…':'Commencer à danser ✕';
 $('winPoints').textContent=replay?'10 / 10':'Bravo ! +10 points';$('creditText').textContent=!embedded?'Mode essai · lance le jeu depuis l’étape 5 pour gagner les points.':replay?'Les dix points étaient déjà acquis.':credited?'Tes points sont enregistrés sur le plateau.':'Enregistrement des points…';
 for(const b of document.querySelectorAll('[data-action]'))b.disabled=!['practice','playing','retry'].includes(run.phase);$('pause').disabled=['ready','won'].includes(run.phase);
}
$('start').onclick=begin;$('resume').onclick=()=>{music.unlock();pause();};$('pause').onclick=pause;$('help').onclick=()=>{if(run.phase==='ready'){flash('← → · ✕ jerk · □ bras · ○ tour',3);}else if(run.phase!=='paused')pause();};
$('retry').onclick=()=>{music.unlock();beginRound(run);render();};$('reload').onclick=()=>location.reload();$('sound').onclick=()=>{const on=music.toggle();$('sound').textContent=on?'♫ SON ON':'♫ SON OFF';$('sound').setAttribute('aria-pressed',String(on));};
$('return').onclick=()=>{if(embedded)send('close');else location.href='jeu.html?niveau=5';};$('replay').onclick=()=>{if(embedded)send('replay');else{replay=true;reset();}};
for(const b of document.querySelectorAll('[data-action]')){b.addEventListener('pointerdown',e=>{if(b.disabled)return;e.preventDefault();b.setPointerCapture(e.pointerId);b.classList.add('held');act(b.dataset.action);});const up=()=>b.classList.remove('held');b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);b.addEventListener('click',e=>{if(e.detail===0)act(b.dataset.action);});}
const keymap={ArrowLeft:'left',ArrowRight:'right',KeyX:'cross',Space:'cross',KeyS:'square',KeyO:'circle'};
addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='KeyP'||e.code==='Escape'){e.preventDefault();pause();return;}const a=keymap[e.code];if(!a)return;if(e.target.tagName==='BUTTON'&&(e.code==='Space'||e.code==='Enter'))return;e.preventDefault();if(run.phase==='ready'&&a==='cross')begin();else act(a);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&['playing','practice','countdown','break'].includes(run.phase)){togglePause(run);music.tick(0,false);render();}});
addEventListener('message',e=>{if(!embedded||e.origin!==location.origin||e.source!==parent||!e.data)return;const m=e.data;if(m.type==='danse:init'&&typeof m.id==='string'&&m.level===5){if(m.id===session)return;session=m.id;initial=Array.isArray(m.passed)?m.passed:[];replay=!!m.replay;total=m.score||0;reset(replay?[]:initial);}else if(m.id===session&&m.type==='danse:credited'){total=m.score;}else if(m.id===session&&m.type==='danse:finished'){credited=true;render();}});
try{scene=new DanceScene($('world'));render();if(embedded)parent.postMessage({type:'danse:ready'},location.origin);function frame(now){requestAnimationFrame(frame);const dt=last?Math.min(.12,(now-last)/1000):0;last=now;advance(run,dt);consume();music.tick(run.clock,['playing','practice','countdown','break','won'].includes(run.phase));if(now-drawAt>32){scene.update(run,dt);render();drawAt=now;}$('feedback').classList.toggle('show',now<feedbackUntil);}requestAnimationFrame(frame);}catch(err){$('intro').hidden=true;$('error').hidden=false;console.error('Dance renderer:',err);}
$('world').addEventListener('webglcontextlost',e=>{e.preventDefault();if(!['ready','won','paused'].includes(run.phase))togglePause(run);$('errorText').textContent='Le navigateur a interrompu la 3D. Recharge pour reprendre depuis le dernier palier.';$('error').hidden=false;});
