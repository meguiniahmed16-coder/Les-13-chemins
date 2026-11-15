/** The approved Café film is shown once after the three successful trials. */
export function createPrisonOutro({document:doc,onEnd=()=>{}}){
 const panel=doc.getElementById('prison-outro'),video=doc.getElementById('prison-film');
 const play=doc.getElementById('prison-film-play'),skip=doc.getElementById('prison-film-skip');
 const status=doc.getElementById('prison-film-status');
 const music=doc.getElementById('prison-film-music');
 const musicPlay=doc.getElementById('prison-music-play');
 let started=false,active=false,version=0;
 let musicPending=false,musicBlocked=false;
 function load(){
  for(const media of [video,music]){
   if(!media.getAttribute('src'))media.src=media.dataset.src;
   media.preload='auto';
  }
 }
 function syncMusic(force=false){
  music.muted=video.muted;music.volume=video.volume*.8;
  music.playbackRate=video.playbackRate;
  if(force||Math.abs(music.currentTime-video.currentTime)>.3){
   try{music.currentTime=video.currentTime;}catch{}
  }
 }
 function startMusic(fromGesture=false){
  if(!active||musicPending||musicBlocked&&!fromGesture)return;
  syncMusic(true);
  const current=version;musicPending=true;
  music.play().then(()=>{
   if(current!==version)return;
   musicPending=false;musicBlocked=false;musicPlay.hidden=true;
   if(!active||video.paused||video.seeking)music.pause();
  }).catch(error=>{
   if(current!==version)return;
   musicPending=false;
   if(!active||error.name==='AbortError')return;
   musicBlocked=true;musicPlay.hidden=false;
  });
 }
 function finish(){
  if(!active)return;
  active=false;version++;video.pause();music.pause();video.autoplay=false;panel.hidden=true;onEnd();
 }
 async function resume(){
  const current=version;play.hidden=true;status.textContent='';
  try{const attempt=video.play();startMusic(true);await attempt;}
  catch(error){
   if(!active||current!==version)return;
   music.pause();play.hidden=false;
   status.textContent=error.name==='NotAllowedError'?'Appuie sur Lecture pour lancer le film avec le son.':'La vidéo n’a pas pu démarrer. Tu peux réessayer ou passer.';
  }
 }
 play.addEventListener('click',()=>{if(video.error)video.load();resume();});
 musicPlay.addEventListener('click',()=>{if(music.error)music.load();resume();});
 skip.addEventListener('click',finish);
 video.addEventListener('ended',finish);
 video.addEventListener('playing',()=>{if(active){play.hidden=true;status.textContent='';startMusic();}});
 for(const event of ['pause','waiting','seeking'])video.addEventListener(event,()=>music.pause());
 video.addEventListener('seeked',()=>{if(active){syncMusic(true);if(!video.paused)startMusic();}});
 for(const event of ['timeupdate','volumechange','ratechange'])video.addEventListener(event,()=>{if(active)syncMusic();});
 video.addEventListener('error',()=>{if(active){music.pause();play.hidden=false;status.textContent='La vidéo ne se charge pas. Tu peux réessayer ou passer.';}});
 music.addEventListener('error',()=>{if(active){musicBlocked=true;musicPlay.hidden=false;}});
 return {
  get active(){return active;},
  prime(){load();for(const media of [video,music]){const attempt=media.play();media.pause();attempt?.catch(()=>{});}},
  setMuted(muted){video.muted=muted;music.muted=muted;},
  start({muted=false}={}){
   if(started)return false;
   started=true;active=true;version++;musicPending=false;musicBlocked=false;musicPlay.hidden=true;load();video.currentTime=0;music.currentTime=0;
   video.muted=muted;video.volume=1;video.autoplay=true;panel.hidden=false;
   skip.focus({preventScroll:true});resume();return true;
  },
  reset(){version++;started=false;active=false;musicPending=false;musicBlocked=false;video.pause();music.pause();video.autoplay=false;panel.hidden=true;play.hidden=true;musicPlay.hidden=true;status.textContent='';}
 };
}
