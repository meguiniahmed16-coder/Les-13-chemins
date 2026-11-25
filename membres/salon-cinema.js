// Shared Salon entry: the original loading portal, the existing film, then the 3D game.
// The original controls remain the only call/invite controls.
import {salonActionSvg} from './salon-maison-ui.js?v=unified61';
const SOURCE='/assets/membres/intro-montage-reel23.mp4';
const POSTER='/assets/membres/intro-montage-reel23.webp';
const art='<div class="salon-opening-art" aria-hidden="true"><div class="salon-opening-portal"><div class="salon-opening-horizon"></div><div class="salon-opening-path"></div><i></i><i></i><i></i></div></div>';
function style(){
 if(document.getElementById('salon-opening-styles'))return;
 const node=document.createElement('style');node.id='salon-opening-styles';
 node.textContent='.salon-action-icon{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:44px;min-height:44px;gap:0!important}.salon-action-icon svg{display:block;width:23px;height:23px;flex:none}.home-salon-direct a.salon-action-icon{flex:0 0 48px!important;width:48px!important;max-width:48px!important;padding:0!important;border-radius:50%!important}.guest-shortcuts button.salon-action-icon{flex:0 0 46px!important;width:46px!important;min-width:46px!important;min-height:46px!important;padding:0!important;border-radius:50%!important}.salon-entry-sequence{position:absolute;inset:0;z-index:80;display:grid;place-items:center;isolation:isolate;background:radial-gradient(ellipse at 50% 25%,#759a83 0,#234c40 43%,#142e29 78%);color:#fffdf4;overflow:hidden}.salon-entry-sequence[hidden],.salon-entry-sequence [hidden]{display:none!important}.salon-entry-sequence video{width:100%;height:100%;object-fit:contain;background:#061b15}.salon-opening-loading{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px;padding:12px;width:100%;height:100%;font:14px/1.4 system-ui;text-align:center}.salon-opening-loading h2{font:normal clamp(25px,5vw,38px) Georgia,serif;margin:0}.salon-opening-loading p{font-size:13px;margin:0;color:#e0e8df}.salon-opening-loading .salon-opening-kicker{font-size:10px;letter-spacing:.22em;color:#e0dfc5}.salon-opening-loading progress{width:min(350px,80%);height:7px;border:0;border-radius:999px;overflow:hidden;accent-color:#e7cfa0}.salon-opening-art{position:relative;width:min(160px,40vw,28vh);aspect-ratio:1;display:grid;place-items:center}.salon-opening-portal{position:relative;overflow:hidden;width:74%;height:95%;border-radius:49% 49% 6px 6px;background:linear-gradient(170deg,#f8e9bf,#e9b982 48%,#648578 49%,#426f60 75%,#315347);border:1px solid #f5dfb5b0;box-shadow:0 0 55px #f7de9b3d,0 18px 55px #10292288}.salon-opening-portal:before{content:"";position:absolute;width:38%;aspect-ratio:1;border-radius:50%;background:#fff3c7;top:25%;left:30%;box-shadow:0 0 28px #ffe7ab}.salon-opening-horizon{position:absolute;inset:49% -15% 0;background:#719486;clip-path:polygon(0 30%,24% 4%,43% 25%,63% 0,100% 33%,100% 100%,0 100%)}.salon-opening-path{position:absolute;inset:51% 0 0;background:linear-gradient(#e9d4b4,#a5a383);clip-path:polygon(47% 0,52% 0,64% 32%,42% 59%,71% 100%,12% 100%,32% 59%,54% 32%)}.salon-opening-portal i{position:absolute;top:20%;left:20%;width:14px;height:9px;border-top:1.5px solid #fdf3d1;border-radius:50%;transform:rotate(-17deg)}.salon-opening-portal i:nth-of-type(2){top:37%;left:65%;transform:rotate(15deg) scale(.7)}.salon-opening-portal i:nth-of-type(3){top:13%;left:57%;transform:scale(.5)}.salon-entry-sequence video:focus-visible{outline:2px solid #e7cfa0}@media(max-height:430px){.salon-opening-loading{flex-direction:row;flex-wrap:wrap;gap:8px}.salon-opening-art{width:min(90px,22vw)}.salon-opening-loading progress{width:40%}}#salon-cinema-dialog{width:min(870px,calc(100% - 16px));max-height:calc(100dvh - 28px);padding:11px;background:#f4f2e9;color:#244634;border:1px solid #c1c5ac;border-radius:17px;box-shadow:0 12px 55px #132d244f;overflow:auto}#salon-cinema-dialog::backdrop{background:#071f17ba}#salon-cinema-dialog video{display:block;width:100%;max-height:64dvh;aspect-ratio:16/9;object-fit:contain;background:#152f23;border-radius:10px}#salon-cinema-dialog p{font:12px/1.4 system-ui}#salon-cinema-dialog .salon-cinema-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:4px 0 9px}#salon-cinema-dialog .salon-cinema-head button{width:46px;height:46px;font-size:23px;border-radius:50%;background:#e5e6da;border:1px solid #b8c6b6;color:#264431}';
 document.head.append(node);
}
function loader(){
 const node=document.createElement('div');node.className='salon-opening-loading';
 node.innerHTML=art+'<span class="salon-opening-kicker">LA CROISÉE DES ÂMES</span><h2>Un instant…</h2><p>La rencontre se prépare.</p><progress aria-label="Chargement du Salon"></progress>';
 return node;
}
// A real indeterminate bar is shown while the 3D engine loads; never fabricate a percentage.
export function beginSalonOpening(container){
 if(!container)return {ready(){},fail(){}};
 style();if(container.__salonOpening)return container.__salonOpening;
 const layer=document.createElement('div');layer.className='salon-entry-sequence';layer.setAttribute('aria-label','Ouverture du Salon');
 const loading=loader(),film=document.createElement('video');
 film.playsInline=true;film.preload='auto';film.poster=POSTER;film.setAttribute('aria-label','Cinématique originale du Salon, du plateau et du jardin');
 film.controls=true;film.hidden=true;film.src=SOURCE;
 layer.append(loading,film);
 if(getComputedStyle(container).position==='static')container.style.position='relative';
 container.append(layer);
 let state='loading';
 const finish=()=>{if(state==='finished')return;state='finished';film.pause();film.removeAttribute('src');film.load();layer.remove();};
 const showFilm=()=>{
  if(state!=='buffering')return;
  state='playing';loading.hidden=true;film.hidden=false;
  film.muted=false;
  film.play().catch(()=>{if(state!=='playing')return;film.muted=true;film.play().catch(finish);});
 };
 film.addEventListener('canplay',showFilm);
 film.addEventListener('ended',finish,{once:true});
 film.addEventListener('error',finish,{once:true});
 const api={
  ready(){if(state!=='loading')return;state='buffering';film.load();if(film.readyState>=3)showFilm();},
  fail(){finish();},
  dispose:finish
 };
 container.__salonOpening=api;return api;
}
// The guest visit keeps its existing invitation film and its existing Skip button.
export function attachSalonVideoLoading(video){
 if(!video||video.dataset.salonLoadingAttached)return;
 style();video.dataset.salonLoadingAttached='1';
 const host=video.parentElement;
 if(getComputedStyle(host).position==='static')host.style.position='relative';
 const overlay=document.createElement('div');overlay.className='salon-entry-sequence';
 const waiting=loader();overlay.append(waiting);host.append(overlay);
 const done=()=>overlay.remove();
 video.addEventListener('canplay',done,{once:true});
 video.addEventListener('playing',done,{once:true});
 video.addEventListener('error',done,{once:true});
 if(video.readyState>=3)done();
}
// Existing icons, reused verbatim from the actual Salon HUD (no new phone or invite design).
function applyOriginalActionIcons(){
 style();
 for(const control of document.querySelectorAll('[data-salon-action]')){
  const action=control.dataset.salonAction;
  if(action!=='call'&&action!=='invite')continue;
  const name=action==='call'?'Appeler':'Inviter un personnage';
  control.innerHTML=salonActionSvg(action==='call'?'phone':'encounter');
  control.classList.add('salon-action-icon');control.title=name;control.setAttribute('aria-label',name);
 }
}
applyOriginalActionIcons();
// The existing film-replay controls remain unchanged.
for(const button of document.querySelectorAll('[data-salon-film]')){
 button.addEventListener('click',()=>{
  let dialog=document.getElementById('salon-cinema-dialog');
  if(!dialog){
   dialog=document.createElement('dialog');dialog.id='salon-cinema-dialog';
   dialog.setAttribute('aria-label','Cinématique du Salon');
   dialog.innerHTML='<div class="salon-cinema-head"><strong>La Croisée des Âmes · extrait cinématographique</strong><button type="button" aria-label="Fermer le film">✕</button></div><video playsinline controls preload="none" poster="'+POSTER+'" aria-label="Le décor original du Salon, le plateau et le jardin"><source src="'+SOURCE+'" type="video/mp4"></video><p>Le décor original du Salon, le plateau et le jardin.</p>';
   document.body.append(dialog);
   dialog.querySelector('button').addEventListener('click',()=>dialog.close());
   dialog.addEventListener('close',()=>{const video=dialog.querySelector('video');video.pause();video.currentTime=0;});
  }
  dialog.showModal();dialog.querySelector('video').play().catch(()=>{});
 });
}
