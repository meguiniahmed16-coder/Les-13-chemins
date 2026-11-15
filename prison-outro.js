/** The approved Café film is shown once after the three successful trials. */
export function createPrisonOutro({document:doc,onEnd=()=>{}}){
 const panel=doc.getElementById('prison-outro'),video=doc.getElementById('prison-film');
 const play=doc.getElementById('prison-film-play'),skip=doc.getElementById('prison-film-skip');
 const status=doc.getElementById('prison-film-status');
 let started=false,active=false,version=0;
 function load(){if(!video.getAttribute('src'))video.src=video.dataset.src;video.preload='auto';}
 function finish(){
  if(!active)return;
  active=false;version++;video.pause();video.autoplay=false;panel.hidden=true;onEnd();
 }
 async function resume(){
  const current=version;play.hidden=true;status.textContent='';
  try{await video.play();}
  catch(error){
   if(!active||current!==version)return;
   play.hidden=false;
   status.textContent=error.name==='NotAllowedError'?'Appuie sur Lecture pour lancer le film avec le son.':'La vidéo n’a pas pu démarrer. Tu peux réessayer ou passer.';
  }
 }
 play.addEventListener('click',()=>{if(video.error)video.load();resume();});
 skip.addEventListener('click',finish);
 video.addEventListener('ended',finish);
 video.addEventListener('playing',()=>{if(active){play.hidden=true;status.textContent='';}});
 video.addEventListener('error',()=>{if(active){play.hidden=false;status.textContent='La vidéo ne se charge pas. Tu peux réessayer ou passer.';}});
 return {
  get active(){return active;},
  prime(){load();const attempt=video.play();video.pause();attempt?.catch(()=>{});},
  start({muted=false}={}){
   if(started)return false;
   started=true;active=true;version++;load();video.currentTime=0;
   video.muted=muted;video.volume=1;video.autoplay=true;panel.hidden=false;
   skip.focus({preventScroll:true});resume();return true;
  },
  reset(){version++;started=false;active=false;video.pause();video.autoplay=false;panel.hidden=true;play.hidden=true;status.textContent='';}
 };
}
