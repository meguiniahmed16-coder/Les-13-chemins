// La Maison — navigation de premier niveau du Salon.
export function createSalonNavigation(root){
  const $=selector=>root.querySelector(selector);
  const stage=$('.stage'),scene=$('.scene-viewport'),footer=$('.conversation-footer');
  if(!stage||!scene||!footer)return;
  // Keep existing controllers, media and state intact: move their actual DOM
  // nodes instead of creating parallel controls with conflicting state.
  stage.insertAdjacentHTML('beforeend',`
    <nav class="maison-dock" aria-label="Pièces du Salon">
      <button type="button" data-maison-open="rencontrer" aria-label="Rencontrer un personnage" title="Rencontrer"><span class="maison-glyph">✦</span><span>Rencontrer</span></button>
      <button type="button" data-maison-open="avatar" aria-label="Personnaliser le corps et le visage" title="Avatar"><span class="maison-glyph">♙</span><span>Avatar</span></button>
      <button type="button" data-maison-open="clothes" aria-label="Choisir les vêtements" title="Vêtements"><span class="maison-glyph">♧</span><span>Vêtements</span></button>
      <button type="button" data-maison-open="dialogue" aria-label="Dialoguer avec le personnage" title="Dialogue"><span class="maison-glyph">◉</span><span>Dialogue</span></button>
      <button type="button" data-maison-open="explorer" aria-label="Caméra et déplacements" title="Caméra"><span class="maison-glyph">⌖</span><span>Caméra</span></button>
    </nav>
    <button type="button" class="maison-phone" hidden aria-label="Appeler le personnage"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 3h3l2 5-2 2a16 16 0 0 0 5 5l2-2 5 2v3a3 3 0 0 1-3 3C9 21 3 15 3 6a3 3 0 0 1 3-3Z" /></svg><span>Appeler</span></button>
    <section class="maison-hub" role="region" aria-label="Les pièces de la maison" hidden>
      <header class="maison-hub-head"><div><small>LA CROISÉE DES ÂMES</small><h2>Les pièces de la maison</h2></div><div class="maison-hub-controls"><button class="maison-side" type="button" title="Déplacer le panneau de l’autre côté" aria-label="Changer le côté du panneau">⇄</button><button class="maison-close" type="button" aria-label="Masquer les options et voir tout le Salon">✕ <span>Voir le Salon</span></button></div></header>
      <nav class="maison-tabs" aria-label="Choisir une pièce">
        <button data-maison-tab="rencontrer" type="button">Rencontres</button>
        <button data-maison-tab="dialogue" type="button">Conversation</button>
        <button data-maison-tab="explorer" type="button">Explorer</button>
        <button data-maison-tab="atelier" type="button">Atelier</button>
      </nav>
      <div class="maison-scroll">
        <section class="maison-room" data-maison-room="rencontrer">
          <p class="maison-overline">01 / Les rencontres</p><h3>Qui aimerais-tu retrouver ?</h3>
          <p>Les personnages du récit peuvent entrer dans le Salon, s’asseoir et discuter avec toi.</p>
          <button type="button" class="maison-action" data-maison-action="invite">Choisir un personnage <span>→</span></button>
          <p class="maison-hint">Tu peux chercher un nom ou laisser le hasard décider.</p>
          <div class="maison-slot" data-maison-slot="picker"></div>
        </section>
        <section class="maison-room" data-maison-room="dialogue" hidden>
          <p class="maison-overline">02 / La conversation</p><h3>Une parole à partager</h3>
          <p class="maison-guest-state">Invite d’abord quelqu’un pour commencer.</p>
          <div class="maison-actions">
            <button type="button" class="maison-action" data-maison-action="call">Appeler à voix haute <span>☎</span></button>
            <button type="button" class="maison-action maison-secondary" data-maison-action="write">Écrire un message <span>✎</span></button>
          </div>
          <h4>Notre échange</h4><div class="maison-slot maison-messages" data-maison-slot="messages"></div>
          <div class="maison-slot maison-leave" data-maison-slot="leave"></div>
        </section>
        <section class="maison-room" data-maison-room="explorer" hidden>
          <p class="maison-overline">03 / Le regard</p><h3>Prends possession du lieu</h3>
          <p>Déplace-toi dans le Salon, choisis tes plans de caméra, puis reviens au décor.</p>
          <button type="button" class="maison-action" data-maison-action="fullscreen">Agrandir le Salon <span>⛶</span></button>
          <h4>La caméra et les vues</h4><div class="maison-slot" data-maison-slot="views"></div>
          <h4>Commandes de déplacement</h4><div class="maison-slot" data-maison-slot="camera"></div>
        </section>
        <section class="maison-room" data-maison-room="atelier" hidden>
          <p class="maison-overline">04 / Les apparences</p><h3>Donne un visage aux rencontres</h3>
          <p>Personnalise ton avatar, celui de tes invités et retrouve les fonctions avancées de l’atelier.</p>
          <button type="button" class="maison-action" data-maison-action="studio">Ouvrir la personnalisation <span>→</span></button>
          <div class="maison-slot" data-maison-slot="guest"></div>
          <p class="maison-hint">Les outils réservés au propriétaire restent dans l’atelier, à l’écart des visiteurs.</p>
        </section>
      </div>
    </section>
  `);
  const hub=$('.maison-hub'),dock=$('.maison-dock'),phone=$('.maison-phone');
  // Edge controls float over the full-resolution 3D viewport, never replace it.
  scene.append(dock);
  const picker=$('.guest-picker'),legacyInvite=$('.invite-toggle'),voicePanel=$('.voice-conversation'),legacyPhone=$('.conversation-voice-toggle');
  const studio=$('.options-toggle'),chat=$('.guest-message');
  const sections=[...root.querySelectorAll('[data-maison-room]')];
  const tabs=[...root.querySelectorAll('[data-maison-tab]')];
  const slot=name=>$('[data-maison-slot="'+name+'"]');
  slot('picker').append(picker);
  slot('messages').append($('.thread-history'));
  slot('views').append($('.conversation-tools'));
  slot('camera').append($('.camera-slot'));
  slot('guest').append($('.guest-style'));
  slot('leave').append($('.guest-leave'));
  scene.append(voicePanel);
  let companion='';
  let originFocus=null;
  function sync(){
    const present=Boolean(companion);
    stage.classList.toggle('maison-with-guest',present);
    phone.hidden=!present||legacyPhone.hidden;
    const state=$('.maison-guest-state');
    if(state)state.textContent=present?'Tu discutes avec '+companion+'.':'Invite d’abord quelqu’un pour commencer.';
    $('[data-maison-action="call"]').disabled=!present||legacyPhone.hidden;
    $('[data-maison-action="write"]').disabled=!present;
    const messageArea=slot('messages');messageArea.hidden=!present;
    slot('leave').hidden=!present;
  }
  function close(restore=true){
    if(hub.hidden)return;
    hub.hidden=true;
    dock.querySelectorAll('[aria-expanded]').forEach(b=>b.setAttribute('aria-expanded','false'));
    stage.classList.remove('maison-hub-open');
    if(restore&&originFocus?.isConnected)originFocus.focus({preventScroll:true});
  }
  function open(room,source){
    originFocus=source||root.activeElement;
    hub.hidden=false;stage.classList.add('maison-hub-open');
    for(const section of sections)section.hidden=section.dataset.maisonRoom!==room;
    for(const tab of tabs)tab.setAttribute('aria-current',String(tab.dataset.maisonTab===room));
    for(const button of dock.querySelectorAll('[data-maison-open]'))button.setAttribute('aria-expanded',String(button.dataset.maisonOpen===room));
    $('.maison-scroll').scrollTop=0;
    $('.maison-close').focus({preventScroll:true});
  }
  function openPhone(){
    if(!companion){open('rencontrer',phone);return;}
    close(false);
    if(voicePanel.hidden)legacyPhone.click();
    else voicePanel.querySelector('.voice-conversation-close')?.click();
    syncVoice();
  }
  function syncVoice(){
    stage.classList.toggle('maison-voice-open',!voicePanel.hidden);
    phone.setAttribute('aria-expanded',String(!voicePanel.hidden));
    phone.querySelector('span').textContent=voicePanel.hidden?'Appeler':'Raccrocher';
  }
  dock.addEventListener('click',event=>{
    const b=event.target.closest('[data-maison-open]');if(!b)return;
    const room=b.dataset.maisonOpen,drawer=$('.studio-drawer');
    if(room==='avatar'||room==='clothes'){
      close(false);
      const category=room==='avatar'?'body':'underwear';
      root.host.dispatchEvent(new CustomEvent('salon-open-studio',{detail:{category}}));
      return;
    }
    if(!drawer.hidden)$('.options-toggle').click();
    if(!hub.hidden&&sections.find(item=>item.dataset.maisonRoom===room&&!item.hidden)){close(false);return;}
    open(room,b);
  });
  tabs.forEach(button=>button.onclick=()=>open(button.dataset.maisonTab,originFocus));
  $('.maison-close').onclick=()=>close();
  $('.maison-side').onclick=()=>{
    const right=stage.classList.toggle('maison-panel-right');
    $('.maison-side').setAttribute('aria-label',right?'Déplacer les options à gauche':'Déplacer les options à droite');
  };
  // Swipe horizontally on the empty panel surface to browse its four spaces,
  // without hijacking scrolling or gestures inside lists and form controls.
  let startTouch=null;
  $('.maison-scroll').addEventListener('touchstart',event=>{
    if(event.touches.length!==1||event.target.closest('input,select,textarea,button,.guest-list,.thread-history'))return;
    startTouch={x:event.touches[0].clientX,y:event.touches[0].clientY};
  },{passive:true});
  $('.maison-scroll').addEventListener('touchend',event=>{
    if(!startTouch)return;
    const dx=event.changedTouches[0].clientX-startTouch.x;
    const dy=event.changedTouches[0].clientY-startTouch.y;startTouch=null;
    if(Math.abs(dx)<75||Math.abs(dx)<Math.abs(dy)*1.7)return;
    const current=sections.findIndex(item=>!item.hidden);
    const next=Math.max(0,Math.min(sections.length-1,current+(dx<0?1:-1)));
    if(next!==current)open(sections[next].dataset.maisonRoom,originFocus);
  },{passive:true});
  phone.onclick=openPhone;
  hub.addEventListener('click',event=>{
    const button=event.target.closest('[data-maison-action]');if(!button)return;
    switch(button.dataset.maisonAction){
      case 'invite':
        if(picker.hidden)legacyInvite.click();
        else {picker.querySelector('.guest-search')?.focus();}break;
      case 'write':close(false);chat.focus();break;
      case 'call':openPhone();break;
      case 'studio':close(false);studio.click();break;
      case 'fullscreen':{
        close(false);const stageEl=$('.stage');
        if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
        else if(stageEl.requestFullscreen)stageEl.requestFullscreen().catch(()=>stageEl.classList.toggle('immersive'));
        else stageEl.classList.toggle('immersive');
        break;
      }
    }
  });
  root.host.addEventListener('salon-companion-change',event=>{
    companion=event.detail?.name||'';
    if(companion)close(false);
    else if(!voicePanel.hidden)voicePanel.querySelector('.voice-conversation-close')?.click();
    sync();
  });
  const voiceObserver=new MutationObserver(syncVoice);
  voiceObserver.observe(voicePanel,{attributes:true,attributeFilter:['hidden']});
  // Owner-only telephony must not be advertised to an ordinary visitor.
  const availabilityObserver=new MutationObserver(sync);
  availabilityObserver.observe(legacyPhone,{attributes:true,attributeFilter:['hidden']});
  root.host.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    if(!hub.hidden){event.preventDefault();close();}
    else if(!voicePanel.hidden){event.preventDefault();voicePanel.querySelector('.voice-conversation-close')?.click();}
  });
  // Keep the whole document accessible when a panel is open. No fragile
  // browser-specific gestures or nested overflow menus.
  sync();syncVoice();
  return {open,close,sync};
}
