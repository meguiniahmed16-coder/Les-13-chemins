/** One Bach soundtrack from the 3D visit to the Café: the film must not restart it. */
export function createPrisonOutro({document:doc,onEnd=()=>{}}){
 const panel=doc.getElementById('prison-outro'),video=doc.getElementById('prison-film');
 const play=doc.getElementById('prison-film-play'),skip=doc.getElementById('prison-film-skip');
 const status=doc.getElementById('prison-film-status'),music=doc.getElementById('prison-film-music');
 const musicPlay=doc.getElementById('prison-music-play');
 let started=false,active=false,filmVersion=0,soundVersion=0;
 let musicWanted=false,musicPaused=true,musicPending=false,musicBlocked=false,triedFallback=false;
 function loadVideo(){
  if(!video.getAttribute('src'))video.src=video.dataset.src;
  video.preload='auto';
  video.controls=false; // No native film player, even if the HTML changes.
 }
 function loadMusic(){
  if(!music.getAttribute('src')){
   music.crossOrigin='anonymous';
   music.src=music.dataset.src;
  }
  music.preload='auto';music.loop=true;music.volume=1;
 }
 function resumeMusic(fromGesture=false){
  if(!musicWanted||musicPaused||musicPending||(musicBlocked&&!fromGesture))return;
  if(!music.paused){musicBlocked=false;musicPlay.hidden=true;return;}
  musicBlocked=false;musicPending=true;
  const version=++soundVersion;
  let attempt;
  try{attempt=music.play();}
  catch(error){attempt=Promise.reject(error);}
  Promise.resolve(attempt).then(()=>{
   if(version!==soundVersion)return;
   musicPending=false;musicBlocked=false;musicPlay.hidden=true;
   if(!musicWanted||musicPaused)music.pause();
  }).catch(error=>{
   if(version!==soundVersion)return;
   musicPending=false;
   if(!musicWanted||error?.name==='AbortError')return;
   musicBlocked=true;if(active)musicPlay.hidden=false;
  });
 }
 function startSoundtrack({muted=false}={}){
  loadMusic();musicWanted=true;musicPaused=false;music.muted=muted;
  resumeMusic(true);
 }
 function pauseMusic(){musicPaused=true;music.pause();}
 function stopMusic(){
  soundVersion++;musicPending=false;musicBlocked=false;
  musicWanted=false;musicPaused=true;music.pause();
  try{music.currentTime=0;}catch{}
 }
 function finish(){
  if(!active)return;
  active=false;filmVersion++;video.pause();video.autoplay=false;
  stopMusic();panel.hidden=true;onEnd();
 }
 async function resumeFilm(){
  const current=filmVersion;play.hidden=true;status.textContent='';
  try{
   await video.play();
   if(active&&current===filmVersion)resumeMusic(true);
  }catch(error){
   if(!active||current!==filmVersion)return;
   pauseMusic();play.hidden=false;
   status.textContent=error?.name==='NotAllowedError'?'Appuie sur Lecture pour lancer le film.':'La vidéo ne démarre pas. Réessaie ou passe le film.';
  }
 }
 play.addEventListener('click',()=>{if(video.error)video.load();resumeFilm();});
 musicPlay.addEventListener('click',()=>{
  if(music.error)music.load();
  musicPaused=false;musicBlocked=false;resumeMusic(true);
 });
 skip.addEventListener('click',finish);
 video.addEventListener('ended',finish);
 video.addEventListener('playing',()=>{
  if(!active)return;
  play.hidden=true;status.textContent='';musicPaused=false;resumeMusic();
 });
 for(const event of ['pause','waiting','seeking'])video.addEventListener(event,()=>{
  if(active)pauseMusic();
 });
 video.addEventListener('seeked',()=>{if(active&&!video.paused){musicPaused=false;resumeMusic();}});
 video.addEventListener('error',()=>{
  if(!active)return;
  pauseMusic();play.hidden=false;
  status.textContent='La vidéo ne se charge pas. Tu peux réessayer ou passer.';
 });
 music.addEventListener('error',()=>{
  if(!musicWanted)return;
  const fallback=music.dataset.fallback;
  if(!triedFallback&&fallback){
   triedFallback=true;soundVersion++;musicPending=false;musicBlocked=false;
   music.src=fallback;music.load();
   try{music.currentTime=0;}catch{}
   if(!musicPaused)resumeMusic(true);
  }else{
   musicBlocked=true;if(active)musicPlay.hidden=false;
  }
 });
 return{
  get active(){return active;},
  prime(){loadVideo();loadMusic();},
  startSoundtrack,
  pauseMusic,
  resumeMusic(){musicPaused=false;resumeMusic(true);},
  setMuted(muted){
   music.muted=muted;video.muted=muted;
   if(!muted&&musicWanted&&!musicPaused)resumeMusic(true);
  },
  start({muted=false}={}){
   if(started)return false;
   started=true;active=true;filmVersion++;
   loadVideo();
   video.currentTime=0;video.autoplay=true;video.volume=.28;video.muted=muted;
   panel.hidden=false;play.hidden=true;musicPlay.hidden=true;status.textContent='';
   // Bach keeps its current position when the final film starts.
   if(!musicWanted)startSoundtrack({muted});
   else{music.muted=muted;musicPaused=false;resumeMusic();}
   skip.focus?.({preventScroll:true});
   resumeFilm();return true;
  },
  reset(){
   filmVersion++;started=false;active=false;
   video.pause();video.autoplay=false;
   stopMusic();panel.hidden=true;play.hidden=true;musicPlay.hidden=true;status.textContent='';
  }
 };
}
