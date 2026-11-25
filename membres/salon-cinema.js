// Reuses the existing public reel (original room, board, garden). The white
// room/chairs/dojo 3D sequence remains the separate authenticated author film.
const SOURCE='/assets/membres/intro-montage-reel23.mp4';
for(const button of document.querySelectorAll('[data-salon-film]')){
 button.addEventListener('click',()=>{
  let dialog=document.getElementById('salon-cinema-dialog');
  if(!dialog){
   dialog=document.createElement('dialog');
   dialog.id='salon-cinema-dialog';dialog.setAttribute('aria-label','Cinématique du Salon');
   dialog.innerHTML='<div class="salon-cinema-head"><strong>La Croisée des Âmes · extrait cinématographique</strong><button type="button" aria-label="Fermer le film">✕</button></div><video playsinline controls preload="none" poster="/assets/membres/intro-montage-reel23.webp" aria-label="Le décor original du Salon, le plateau et le jardin"><source src="'+SOURCE+'" type="video/mp4"></video><p>Découvre le décor original du Salon, le plateau et le jardin. La séquence complète des fauteuils et du dojo se trouve dans l’introduction originale de l’espace auteur.</p>';
   const style=document.createElement('style');style.textContent='#salon-cinema-dialog{width:min(870px,calc(100% - 16px));max-height:calc(100dvh - 28px);padding:11px;background:#f4f2e9;color:#244634;border:1px solid #c1c5ac;border-radius:17px;box-shadow:0 12px 55px #132d244f;overflow:auto}#salon-cinema-dialog::backdrop{background:#071f17ba}#salon-cinema-dialog video{display:block;width:100%;max-height:64dvh;aspect-ratio:16/9;object-fit:contain;background:#152f23;border-radius:10px}#salon-cinema-dialog p{font:12px/1.4 system-ui}#salon-cinema-dialog .salon-cinema-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:4px 0 9px}#salon-cinema-dialog .salon-cinema-head button{width:46px;height:46px;font-size:23px;border-radius:50%;background:#e5e6da;border:1px solid #b8c6b6;color:#264431}';
   document.head.append(style);document.body.append(dialog);
   dialog.querySelector('button').addEventListener('click',()=>dialog.close());
   dialog.addEventListener('close',()=>{const video=dialog.querySelector('video');video.pause();video.currentTime=0;});
  }
  dialog.showModal();
  const video=dialog.querySelector('video');video.play().catch(()=>{});
 });
}
