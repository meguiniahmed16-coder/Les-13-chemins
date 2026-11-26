// The optional short tour highlights existing real controls, not screenshots.
export function mountSalonGuide(root,{standaloneAhmed=false}={}){
 const doc=root.ownerDocument,win=doc.defaultView,stage=root.querySelector('.scene-viewport');
 if(!stage||!win)return null;
 const url=new URL(win.location.href);
 if(url.searchParams.get('guide')!=='1')return null;
 const steps=standaloneAhmed?[{target:'.maison-phone',title:'Appeler Ahmed',copy:'Touche le téléphone pour parler directement avec Ahmed.',optional:true}]:[
 {target:'.maison-menu-toggle',title:'Ouvre le menu',copy:'Toutes les fonctions du Salon sont ici.'},
 {target:'[data-maison-open="encounter"]',title:'Inviter un personnage',copy:'Ouvre directement la liste des personnes du livre.'},
 {target:'.guest-random',title:'Choisir un invité',copy:'Invite au hasard, ou utilise la recherche et la liste.'},
 {target:'.maison-phone',title:'Parler de vive voix',copy:'Touche le téléphone pour appeler ton invité. Tu peux passer cette étape sans ouvrir le micro.'}
 ];
 const layer=doc.createElement('div');layer.className='salon-guide-layer';
 layer.innerHTML='<div class="salon-guide-hole"></div><section class="salon-guide-tip" role="dialog" aria-label="Parcours initiatique"><small></small><h2></h2><p></p><div><button type="button" data-guide="skip">Passer</button><button type="button" data-guide="next">Suivant</button></div></section>';
 const style=doc.createElement('style');style.textContent='.salon-guide-layer{position:absolute;inset:0;z-index:10000;pointer-events:none;overflow:hidden}.salon-guide-hole{position:absolute;border:2px solid #f4db9e;border-radius:12px;box-shadow:0 0 0 200vmax #101b17a6;transition:top .2s,left .2s,width .2s,height .2s}.salon-guide-hole:after{content:"";position:absolute;inset:-5px;border:2px solid #f4db9e;border-radius:inherit;animation:guidePulse 1.4s ease-out infinite}@keyframes guidePulse{to{transform:scale(1.18);opacity:0}}.salon-guide-tip{position:absolute;left:12px;right:12px;max-width:330px;margin:auto;background:#f7f1e4;color:#203e30;border:1px solid #a89469;border-radius:12px;padding:12px;box-shadow:0 6px 24px #0005;pointer-events:auto;font:14px/1.35 system-ui}.salon-guide-tip h2{font-size:17px;margin:4px 0}.salon-guide-tip p{margin:4px 0 10px}.salon-guide-tip small{color:#526657}.salon-guide-tip div{display:flex;justify-content:space-between;gap:8px}.salon-guide-tip button{padding:8px 14px;border-radius:8px;border:1px solid #8c9e8c;background:#fff;color:#274e3b;font:inherit}.salon-guide-tip button[data-guide=next]{background:#274e3b;color:#fff}@media(prefers-reduced-motion:reduce){.salon-guide-hole,.salon-guide-hole:after{animation:none;transition:none}}';
 root.append(style);stage.append(layer);
 const hole=layer.querySelector('.salon-guide-hole'),tip=layer.querySelector('.salon-guide-tip'),next=layer.querySelector('[data-guide=next]');
 let index=0,ended=false,target=null;
 function finish(){if(ended)return;ended=true;root.removeEventListener('click',clicked,true);root.host.removeEventListener('salon-companion-change',companionChanged);win.removeEventListener('resize',place);root.removeEventListener('keydown',keydown);observer.disconnect();layer.remove();style.remove();url.searchParams.delete('guide');try{win.history.replaceState(win.history.state,'',url.href);}catch{}}
 function place(){if(ended)return;target=root.querySelector(steps[index].target);const bounds=stage.getBoundingClientRect(),r=target?.getBoundingClientRect();const visible=r&&r.width>0&&r.height>0;hole.hidden=!visible;if(visible){Object.assign(hole.style,{left:(r.left-bounds.left-5)+'px',top:(r.top-bounds.top-5)+'px',width:(r.width+10)+'px',height:(r.height+10)+'px'});}
 const y=visible&&r.top-bounds.top>bounds.height*.48?Math.max(8,r.top-bounds.top-tip.offsetHeight-16):Math.max(8,Math.min(bounds.height-tip.offsetHeight-8,visible?r.bottom-bounds.top+18:bounds.height*.55));tip.style.top=y+'px';}
 function render(){if(index>=steps.length){finish();return;}const step=steps[index];tip.querySelector('small').textContent='Parcours initiatique · '+(index+1)+'/'+steps.length;tip.querySelector('h2').textContent=step.title;tip.querySelector('p').textContent=step.copy;next.textContent=index===steps.length-1?'Terminer':'Suivant';place();}
 function advance(){index++;render();}
 function clicked(e){if(ended||!target||!e.composedPath().includes(target))return;if(steps[index].target==='.guest-random')return;win.setTimeout(advance,0);}
 function companionChanged(e){if(!ended&&e.detail?.name&&steps[index]?.target==='.guest-random')advance();}
 function keydown(e){if(e.key==='Escape'){e.stopPropagation();finish();}}
 next.onclick=()=>{if(index<2&&!standaloneAhmed&&target&&!target.closest('[hidden]'))target.click();else advance();};
 layer.querySelector('[data-guide=skip]').onclick=finish;
 const observer=new MutationObserver(place);observer.observe(stage,{subtree:true,attributes:true,attributeFilter:['hidden','aria-expanded']});
 root.addEventListener('click',clicked,true);root.addEventListener('keydown',keydown);root.host.addEventListener('salon-companion-change',companionChanged);win.addEventListener('resize',place);render();return {finish};
}
