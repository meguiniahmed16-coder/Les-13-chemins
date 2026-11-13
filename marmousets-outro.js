(function(root){
 'use strict';
 root.MarmousetsOutro=function({document:doc,onEnd=()=>{}}){
  const dialog=doc.getElementById('marmousetsOutro');
  const video=doc.getElementById('marmousetsFilm');
  const play=doc.getElementById('marmousetsFilmPlay');
  const skip=doc.getElementById('marmousetsFilmSkip');
  const status=doc.getElementById('marmousetsFilmStatus');
  let started=false,active=false,completed=false,version=0;
  function load(){
   if(!video.getAttribute('src'))video.src=video.dataset.src;
   video.preload='auto';
  }
  function finish(){
   if(!active)return;
   active=false;completed=true;version++;video.pause();video.autoplay=false;
   if(dialog.open)dialog.close();
   onEnd();
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
  play.onclick=()=>{if(video.error)video.load();resume();};
  skip.onclick=finish;
  dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
  video.addEventListener('ended',finish);
  video.addEventListener('playing',()=>{if(active){play.hidden=true;status.textContent='';}});
  video.addEventListener('error',()=>{if(active){play.hidden=false;status.textContent='La vidéo ne se charge pas. Tu peux réessayer ou passer.';}});
  return {
   get active(){return active;},get completed(){return completed;},
   prime(){
    load();
    // Prepare this same media element during the player's own start gesture.
    const attempt=video.play();video.pause();attempt?.catch(()=>{});
   },
   start(){
    if(started)return false;
    started=true;active=true;completed=false;version++;load();
    video.currentTime=0;video.muted=false;video.volume=1;video.autoplay=true;
    dialog.showModal();skip.focus({preventScroll:true});resume();return true;
   },
   reset(){
    version++;started=false;active=false;completed=false;video.pause();video.autoplay=false;
    if(dialog.open)dialog.close();play.hidden=true;status.textContent='';
   }
  };
 };
})(typeof window==='undefined'?globalThis:window);
