/* Separate from the thirteen historical levels: discovery never awards points. */
(function(root){
 'use strict';
 function scene(data,id){return data.scenes.find(s=>s.id===id)||null;}
 function neighbours(data,id){const i=data.scenes.findIndex(s=>s.id===id);return {previous:i>0?data.scenes[i-1]:null,next:i>=0?data.scenes[i+1]||null:null};}
 function canLaunch(s){return s?.game.status==='ready'&&/^\.\/games\/[a-z0-9-]+\/index\.js$/.test(s.game.module||'');}
 function artStyle(s){
  const a=s.art;if(!a.crop)return {backgroundImage:`url('${a.src}')`,backgroundSize:'100% 100%',backgroundPosition:'center'};
  const [x,y,w,h]=a.crop;
  return {backgroundImage:`url('${a.src}')`,backgroundSize:`${a.width/w*100}% ${a.height/h*100}%`,backgroundPosition:`${x/(a.width-w)*100}% ${y/(a.height-h)*100}%`};
 }
 // Completion is scoped to one mounted adapter. No scores or old saves are touched.
 function session(s,onComplete=()=>{}){
  let state='idle',adapter=null;
  return {
   get state(){return state;},
   start(factory,context){
    if(state!=='idle'||!canLaunch(s))return false;
    state='running';
    try{adapter=factory({...context,complete:()=>{if(state!=='running')return false;state='completed';onComplete(s.id);return true;}});adapter?.start?.();return true;}
    catch(error){state='failed';adapter?.destroy?.();throw error;}
   },
   pause(){if(state==='running'){state='paused';adapter?.pause?.();}},
   resume(){if(state==='paused'){state='running';adapter?.resume?.();}},
   dispose(){if(state==='disposed')return;state='disposed';adapter?.destroy?.();adapter=null;}
  };
 }
 root.TreizeUpcomingCore=Object.freeze({scene,neighbours,canLaunch,artStyle,session});
})(globalThis);
