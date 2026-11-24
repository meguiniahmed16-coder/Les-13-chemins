// The reel uses the existing salon mesh and the current chapter-board artwork.
// No substitute illustration of the room is used in the introduction.
export const INTRO_FILM={
 url:'/assets/membres/intro-montage-reel22.mp4',
 poster:'/assets/membres/intro-montage-reel22.webp',
 duration:15,
 chapters:[
  {at:0,title:'Rencontrer',subtitle:'Dans le salon'},
  {at:8,title:'Jouer',subtitle:'Les Treize Chemins'}
 ]
};

export function filmPosition(shot,elapsed){
 const seconds=Math.max(0,elapsed+(shot==='montage'?7000:0))/1000;
 const chapter=[...INTRO_FILM.chapters].reverse().find(part=>seconds>=part.at)||INTRO_FILM.chapters[0];
 return {seconds,chapter};
}

// The TV and the full-frame montage share one playing video. Entering the
// montage continues the same film instead of restarting it at its first frame.
export function createFilmPlayback(video,report=()=>{}){
 let active=false,playTask=null,blocked=false,reported=false,wantsPause=true;
 video.muted=true;video.playsInline=true;video.controls=false;video.loop=false;
 video.preload='auto';video.poster=INTRO_FILM.poster;video.src=INTRO_FILM.url;
 function failed(error){
  if(error?.name==='AbortError')return;
  blocked=true;
  if(!reported){reported=true;report(error?.message||'Le film n’a pas pu être lu.');}
 }
 video.addEventListener('error',()=>failed(video.error));
 return {
  sync(seconds,paused=false){
   active=true;
   const duration=Number.isFinite(video.duration)&&video.duration>0?video.duration:INTRO_FILM.duration;
   const target=Math.max(0,Math.min(seconds,duration-.025));
   const atEnd=seconds>=duration-.025;wantsPause=paused||atEnd;
   // Finish on the actual final frame even when normal drift is below the
   // playback tolerance. A terminal decoder error must not trigger seek loops.
   if(!blocked&&video.readyState>=1&&!video.seeking&&Math.abs(video.currentTime-target)>(atEnd?.001:.30)){
    try{video.currentTime=target;}catch(error){failed(error);}
   }
   if(wantsPause){if(!video.paused||playTask)video.pause();return;}
   if(video.paused&&!playTask&&!blocked){
    try{
     playTask=Promise.resolve(video.play()).then(()=>{
      // Metadata or decoding can settle a play request after a report dialog
      // opened or the introduction was skipped. Respect the latest state.
      if(!active||wantsPause)video.pause();
     }).catch(failed).finally(()=>{playTask=null;});
    }
    catch(error){failed(error);}
   }
  },
  stop(){wantsPause=true;if(active){active=false;video.pause();}}
 };
}
