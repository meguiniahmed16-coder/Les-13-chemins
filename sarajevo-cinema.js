(function(root){
 'use strict';
 // Session ownership and video completion are separate from scoring.
 root.createSarajevoFlow=function({embedded=false,send=()=>{},game,film}){
  let session=null,ready=false,begun=false,stage='loading',won=false,ended=false,credited=new Set(),generation=0;
  function begin(){
   if(!ready||!session||begun)return;
   begun=true;won=false;ended=false;stage='intro';
   credited=new Set(session.replay?[]:session.passed||[]);
   game.reset(session.replay?[]:[...credited]);game.setPaused(true);
   const token=++generation;
   film('intro',()=>{if(token!==generation||stage!=='intro')return;stage='game';game.setPaused(false);});
  }
  return {
   get blocking(){return stage!=='game'&&stage!=='done';},get stage(){return stage;},
   init(value){if(!value||typeof value.id!=='string'||value.id===session?.id)return;generation++;session=value;begun=false;begin();},
   ready(){ready=true;if(embedded)send({type:'bosnie:ready'});else if(!session)session={id:'local-1',passed:[]};begin();},
   progress(passed){if(stage!=='game'||!session)return;for(const gap of passed){if(!Number.isInteger(gap)||gap<1||gap>5||credited.has(gap))continue;credited.add(gap);send({type:'bosnie:pass',id:session.id,gap});}},
   won(){
    if(won||stage!=='game'||!session)return;
    won=true;stage='outro';game.setPaused(true);
    send({type:'bosnie:won',id:session.id,outro:true});
    const token=++generation;
    film('outro',()=>{if(token!==generation||ended||stage!=='outro')return;ended=true;stage='done';game.setPaused(false);send({type:'bosnie:outro-ended',id:session.id});});
   },
   replay(){if(stage!=='done')return;if(embedded){send({type:'bosnie:replay',id:session.id});}else{session={id:'local-'+(++generation),replay:true};begun=false;begin();}},
   stop(){generation++;stage='stopped';game.setPaused(true);}
  };
 };
 if(!root.document)return;
 const doc=root.document,embedded=root.parent!==root&&new URLSearchParams(location.search).get('embedded')==='1';
 const urls={intro:'https://d2ol7oe51mr4n9.cloudfront.net/user_3Lv38AaVCD2ic4AgVfvvFo8mRsK/21568a4c-9fc7-47ee-8e76-eae1e01f5d15.mp4',outro:'https://d2ol7oe51mr4n9.cloudfront.net/user_3Lv38AaVCD2ic4AgVfvvFo8mRsK/f4fd7a27-122d-45fa-9df3-8ca825803eaa.mp4'};
 const style=doc.createElement('style');style.textContent=`
 #cinema{position:absolute;inset:0;z-index:50;background:#000;color:#eee9dd;display:flex;flex-direction:column}
 #cinema[hidden]{display:none}#cinema video{display:block;width:100%;height:calc(100% - 64px);min-height:0;flex:1;object-fit:contain;background:#000}
 #cinema-bar{flex:none;min-height:64px;padding:8px max(14px,env(safe-area-inset-right)) 8px max(14px,env(safe-area-inset-left));display:flex;align-items:center;gap:10px;background:#080c0b}
 #cinema button{border:1px solid #bdb6a855;border-radius:24px;padding:10px 16px;background:#1d2725c9;color:#eee9dd;min-height:44px;font-size:12px}
 #cinema-status{flex:1;font-size:11px;line-height:1.4}#cinema button[hidden]{display:none}
 @media(max-width:550px){#cinema-bar{gap:6px;flex-wrap:wrap}#cinema-status{min-width:100%;text-align:center;font-size:10px}#cinema button{flex:1;padding:8px}}
 `;doc.head.append(style);
 const overlay=doc.createElement('section');overlay.id='cinema';overlay.hidden=true;overlay.setAttribute('aria-label','Cinématique de Sarajevo');
 overlay.innerHTML='<div id="cinema-bar"><span id="cinema-status" role="status"></span><button id="cinema-play" type="button">Lecture</button><button id="cinema-sound" type="button" aria-pressed="false">Couper le son</button><button id="cinema-skip" type="button">Passer</button></div>';
 doc.getElementById('game').append(overlay);
 const status=doc.getElementById('cinema-status'),play=doc.getElementById('cinema-play'),mute=doc.getElementById('cinema-sound'),skip=doc.getElementById('cinema-skip');
 let video=null,filmToken=0,muted=false,finishFilm=null;
 function stopFilm(){filmToken++;video?.pause();video?.removeAttribute('src');video?.load();video?.remove();video=null;overlay.hidden=true;finishFilm=null;}
 function showFilm(which,onEnd){
  stopFilm();const token=filmToken;
  const v=doc.createElement('video');video=v;v.playsInline=true;v.preload='auto';v.muted=muted;v.volume=1;v.src=urls[which];v.setAttribute('aria-label',which==='intro'?'Entrée dans Sarajevo':'À Yoyo — hommage et retour au VAB');
  overlay.prepend(v);overlay.hidden=false;status.textContent='';skip.textContent=which==='intro'?'Passer l’entrée':'Terminer';
  const active=()=>token===filmToken&&video===v;
  finishFilm=()=>{if(!active())return;stopFilm();onEnd();};
  const resume=async()=>{if(!active())return;status.textContent='';try{await v.play();if(active())play.textContent='Pause';}catch(e){if(active()){play.textContent='Lecture';status.textContent=e.name==='NotAllowedError'?'Touchez Lecture pour lancer la vidéo avec le son.':'La vidéo ne se charge pas. Réessayez ou passez.';}}};
  play.onclick=()=>{if(!active())return;if(v.paused){if(v.error)v.load();resume();}else{v.pause();play.textContent='Lecture';}};
  mute.onclick=()=>{muted=!muted;v.muted=muted;mute.textContent=muted?'Activer le son':'Couper le son';mute.setAttribute('aria-pressed',String(muted));};
  skip.onclick=()=>finishFilm?.();
  v.addEventListener('ended',()=>{if(active()&&v.ended)finishFilm?.();});
  v.addEventListener('error',()=>{if(active()){status.textContent='La vidéo ne se charge pas. Réessayez ou passez.';play.textContent='Réessayer';}});
  v.addEventListener('waiting',()=>{if(active())status.textContent='Chargement…';});
  v.addEventListener('playing',()=>{if(active()){status.textContent='';play.textContent='Pause';}});
  resume();
 }
 const game={reset:passed=>root.SarajevoGame.reset(passed),setPaused:value=>root.SarajevoGame?.setPaused(value)};
 const flow=root.createSarajevoFlow({embedded,game,film:showFilm,send:message=>{if(embedded)root.parent.postMessage(message,location.origin);}});
 root.SarajevoCinema=flow;
 root.addEventListener('message',e=>{if(!embedded||e.origin!==location.origin||e.source!==root.parent)return;const m=e.data;if(m?.type==='bosnie:init'&&m.level===4)flow.init(m);});
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden&&video){video.pause();play.textContent='Lecture';}});
 root.addEventListener('pagehide',()=>{flow.stop();stopFilm();});
})(typeof window==='undefined'?globalThis:window);
