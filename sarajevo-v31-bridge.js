(function(root){
 'use strict';
 // The original cinema flow remains the sole owner of the intro, outro and board session.
 function createBridge({mount,unmount,readProgress,flow}){
  let active=false,finished=false;
  return {
   reset(){active=false;finished=false;unmount();},
   setPaused(paused){if(paused){active=false;unmount();return;}if(finished||active)return;active=true;mount();},
   poll(){if(!active||finished||!readProgress()?.complete)return false;
    finished=true;active=false;
    // V31 has seven checkpoints; credit the five legacy awards only on completion.
    flow.progress([1,2,3,4,5]);flow.won();return true;},
   get active(){return active;}
  };
 }
 if(typeof module==='object'&&module.exports){module.exports={createBridge};return;}
 const doc=root.document,host=doc.getElementById('game'),loading=doc.getElementById('loading');
 let frame=null;
 const bridge=createBridge({
  mount(){frame=doc.createElement('iframe');frame.id='v31';frame.title='Sarajevo V31 Mobile';frame.allow='autoplay; fullscreen';frame.src='sarajevo-v31/index.html';host.append(frame);loading.hidden=true;},
  unmount(){frame?.remove();frame=null;loading.hidden=false;},
  readProgress(){try{return frame?.contentWindow?.__sarajevo?.progress?.();}catch{return null;}},
  flow:root.SarajevoCinema
 });
 root.SarajevoGame=bridge;
 const poll=root.setInterval(()=>bridge.poll(),200);
 root.addEventListener('pagehide',()=>{root.clearInterval(poll);bridge.setPaused(true);});
 root.SarajevoCinema.ready();
})(typeof window==='undefined'?globalThis:window);
