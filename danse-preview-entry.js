import * as T from 'three';
import {DanceScene} from './danse-scene.js';
import {StudioMusic} from './danse-music.js';
import {BEAT} from './danse-core.js';
import {OVATION_SECONDS} from './danse-finale.js';
window.DANSE_BOOT_STARTED=true;
const $=id=>document.getElementById(id),music=new StudioMusic();
let stage,playing=false,clock=0,last=null,speed=1,view='plateau',manual=null,lastBeat=-1,ready=false;
const END=32*BEAT;
const run={clock:0,time:0,phase:'ready',action:'cross',actionAt:-100};
function frame(now){
 requestAnimationFrame(frame);const dt=last==null?0:Math.min(.08,(now-last)/1000);last=now;
 if(!ready)return;
 if(playing)clock=Math.min(END+OVATION_SECONDS,clock+dt*speed);
 const won=clock>=END,finished=clock>=END+OVATION_SECONDS;
 run.clock=clock;run.time=won?clock-END:clock;run.phase=won?'won':playing?'playing':'paused';
 const beat=Math.floor(clock/BEAT),local=beat%32;
 const automatic=local>=28&&local<30?'circle':local>=24&&local<28?'square':'cross';
 const action=manual&&clock-manual.at<1.1?manual.action:automatic;
 if(action!==run.action){run.action=action;run.actionAt=clock;}
 if(action==='cross')run.actionAt=-100;
 // Freeze on the exact pose when paused, including the active movement.
 if(playing||window.previewNeedsDraw){
  run.phase=won?'won':'playing';stage.update(run,dt);window.previewNeedsDraw=false;
 }
 music.tick(clock,playing&&speed===1,won?clock-END:null);
 if(beat!==lastBeat){lastBeat=beat;$('phrase').textContent=['Pas liés · transfert d’appui','Twist · bassin et épaules','Pas en diagonale · contre-mouvement','Bras liés · tour et retour'][Math.floor(local/8)];$('count').textContent=String(beat%8+1);document.querySelectorAll('.beat').forEach((el,i)=>el.classList.toggle('on',i===beat%8));}
 $('progress').value=Math.min(100,clock/END*100);
 if(won){$('phrase').textContent=finished?'Bravo, l’artiste !':'Le public se lève et applaudit !';$('count').textContent='✓';}
 if(finished){playing=false;$('play').textContent='Rejouer la séquence';$('play').setAttribute('aria-pressed','false');}
}
function setPlaying(on){playing=on;$('play').textContent=playing?'Mettre en pause':'Lancer la danse';$('play').setAttribute('aria-pressed',String(playing));if(on)music.unlock();else music.tick(clock,false);}
$('play').onclick=()=>{if(clock>=END+OVATION_SECONDS){clock=0;manual=null;window.previewNeedsDraw=true;}setPlaying(!playing);};
$('restart').onclick=()=>{clock=0;manual=null;run.action='cross';run.actionAt=-100;window.previewNeedsDraw=true;setPlaying(true)};
$('sound').onclick=()=>{const on=music.toggle();$('sound').textContent=on?'Son activé':'Son coupé';$('sound').setAttribute('aria-pressed',String(on))};
$('speed').onchange=()=>{speed=Number($('speed').value);$('slow').hidden=speed===1};
function camera(){
 stage.resize();const narrow=$('world').clientWidth/$('world').clientHeight<1.3;
 if(view==='plateau'&&narrow){const d=Math.max(7.2,4.65/(Math.tan(stage.camera.fov*Math.PI/360)*stage.camera.aspect));stage.camera.position.set(.1,3.8,d);stage.camera.lookAt(0,1.2,-.8);}
 if(view==='danseurs'){stage.camera.position.set(narrow?0:.55,2.55,5.8);stage.camera.fov=narrow?48:35;stage.camera.lookAt(0,1.25,-.1);}
 if(view==='public'){stage.camera.position.set(3.5,3.1,-.5);stage.camera.fov=40;stage.camera.lookAt(.1,1.2,4.7);}
 stage.camera.updateProjectionMatrix();window.previewNeedsDraw=true;
}
$('view').onchange=()=>{view=$('view').value;camera()};
for(const button of document.querySelectorAll('[data-phrase]'))button.onclick=()=>{clock=Number(button.dataset.phrase)*8*BEAT;manual=null;run.action='cross';run.actionAt=-100;window.previewNeedsDraw=true;setPlaying(true)};
addEventListener('resize',()=>{if(ready)camera()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlaying(false)});
async function initialise(){
try{
 stage=new DanceScene($('world'));
 if(stage.renderer.isSoftware)throw Error('Cet aperçu a besoin de WebGL pour conserver les vrais personnages 3D. Ouvre le fichier HTML dans un navigateur compatible, comme Chrome ou Firefox.');
 await new Promise((resolve,reject)=>{
  let timeout;const check=setInterval(()=>{
   const error=stage.heroLoadError||stage.dancers.find(d=>d.loadError)?.loadError;
   if(error){clearInterval(check);clearTimeout(timeout);reject(error);return;}
   const female=stage.dancers.filter(d=>d.pilot).length;
   $('loading').textContent='Chargement : '+(stage.featuredDancer?'danseur prêt':'danseur…')+' · '+female+'/4 danseuses'+(stage.studioCast?' · public prêt':' · public…');
   if(stage.featuredDancer&&female===4){clearInterval(check);clearTimeout(timeout);resolve();}
  },40);
  timeout=setTimeout(()=>{clearInterval(check);reject(Error('Le chargement des modèles n’a pas abouti.'));},25000);
 });
 ready=true;window.DANSE_READY=true;$('loading').hidden=true;$('world').style.visibility='visible';$('play').disabled=false;
 for(const b of document.querySelectorAll('[data-phrase],#restart,#view,#speed'))b.disabled=false;
 camera();requestAnimationFrame(frame);
}catch(e){$('loading').textContent=e.message;$('loading').classList.add('error');console.error(e);}

}
initialise();
