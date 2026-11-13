(async function(){
 'use strict';
 const data=window.TreizeUpcomingData,core=window.TreizeUpcomingCore;
 const scene=core.scene(data,document.body.dataset.scene),root=document.getElementById('futureGame');
 const h=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
 const link=(text,url)=>{const el=h('a','upcoming-button',text);el.href=url;return el;};
 if(!scene){root.textContent='Cette scène n’est pas disponible.';return;}
 document.title=scene.title+' · Les Treize Chemins';
 const intro=h('div','upcoming-intro'),art=h('div','upcoming-art');Object.assign(art.style,core.artStyle(scene));art.setAttribute('role','img');art.setAttribute('aria-label','Vignette de '+scene.title);
 const summary=h('div');summary.append(h('p','upcoming-eyebrow','Chemin '+scene.path),h('h1','',scene.title),h('span','upcoming-status',core.canLaunch(scene)?'Le jeu':'Travail en cours'),h('p','upcoming-lead',scene.game.goal));
 intro.append(art,summary);root.append(intro);
 const preview=h('section','upcoming-game-preview');preview.append(h('h2','','La scène à venir'));
 const rules=h('ol','upcoming-rules');scene.game.rules.forEach(r=>rules.append(h('li','',r)));preview.append(rules,h('p','upcoming-caption','Durée envisagée : '+scene.game.duration+'. Tactile, souris et clavier.'));
 const actions=h('nav','upcoming-game-actions');actions.setAttribute('aria-label','Découvrir la scène');
 actions.append(link('Lire le passage','jeu.html?scene='+scene.id),link('Les personnages','jeu.html?scene='+scene.id+'&vue=people'),link('La carte','carte.html?scene='+scene.id));
 root.append(preview,actions);
 const stage=h('div','upcoming-game-stage');stage.id='gameStage';stage.hidden=true;stage.tabIndex=-1;stage.setAttribute('aria-label',scene.title);root.append(stage);
 const status=h('p','upcoming-caption',core.canLaunch(scene)?'':'Le jeu n’est pas encore jouable. Le passage, les personnages et les repères du récit sont déjà disponibles.');status.setAttribute('role','status');root.append(status);
 const nav=h('nav','upcoming-scene-nav');nav.setAttribute('aria-label','Continuer le chemin');nav.append(link('← Revenir aux chemins','jeu.html#chemin-'+scene.path.toLowerCase()));
 const next=core.neighbours(data,scene.id).next;if(next)nav.append(link(next.title+' →',next.game.url));root.append(nav);
 // Ready adapters are lazy-loaded only after a deliberate click. No module is
 // supplied for a work in progress; none of the six shells can award a win.
 if(!core.canLaunch(scene))return;
 const play=h('button','upcoming-button','Jouer');play.type='button';actions.prepend(play);
 let room=null,disposed=false;
 play.onclick=async()=>{
  play.disabled=true;status.textContent='Chargement du jeu…';
  try{
   const module=await import(scene.game.module);if(disposed)return;
   room?.dispose();room=core.session(scene,()=>{status.textContent='La scène est terminée.';play.textContent='Rejouer';play.disabled=false;});
   stage.replaceChildren();stage.hidden=false;preview.hidden=true;
   room.start(module.createGame,{container:stage,scene,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches});
   stage.focus();if(room.state!=='completed')status.textContent='';
   if(document.hidden)room.pause();
  }catch(error){room?.dispose();stage.hidden=true;preview.hidden=false;status.textContent='Le jeu n’a pas pu se charger. Vous pouvez réessayer ou continuer la lecture.';play.disabled=false;}
 };
 document.addEventListener('visibilitychange',()=>{if(document.hidden)room?.pause();else room?.resume();});
 window.addEventListener('pagehide',()=>{disposed=true;room?.dispose();},{once:true});
})();
