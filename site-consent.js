/* Loaded before the optional audience tools on every page. */
(() => {
  const preference = 'tda-audience-v1';
  const visitor = 'am-visitor-v1';
  const lifetime = 180 * 86400000;
  let memory;
  function choice() {
    let saved = memory;
    try { saved = JSON.parse(localStorage.getItem(preference)) || memory; } catch {}
    return saved && Date.now() < saved.until && typeof saved.allow === 'boolean' ? saved.allow : null;
  }
  function forgetVisitor() { try { localStorage.removeItem(visitor); } catch {} }
  if (choice() !== true) forgetVisitor();
  window.tdaAudienceAllowed = () => choice() === true;
  const embedded = window.self !== window.top;
  if (embedded) document.documentElement.classList.add('legal-embedded');
  function setup() {
    const panel = document.getElementById('choix-traceurs');
    if (!panel || embedded) return;
    let focusBack;
    function update() {
      panel.querySelector('[data-choice-status]').textContent = choice() === true ? 'Choix actuel : accepté.' : choice() === false ? 'Choix actuel : refusé.' : '';
    }
    function open(button) { focusBack = button; update(); panel.hidden = false; panel.querySelector('h2').focus(); }
    function decide(allow) {
      const hadAnalytics = !!document.querySelector('script[data-cf-beacon]');
      memory = {allow, until: Date.now() + lifetime};
      try { localStorage.setItem(preference, JSON.stringify(memory)); } catch {}
      if (!allow) forgetVisitor();
      panel.hidden = true;
      if (focusBack) focusBack.focus();
      window.dispatchEvent(new Event('tda-consent'));
      if (!allow && hadAnalytics) location.reload();
    }
    for (const button of document.querySelectorAll('[data-choix-traceurs]')) {
      button.hidden = false;
      button.addEventListener('click', () => open(button));
    }
    panel.querySelector('[data-refuse]').onclick = () => decide(false);
    panel.querySelector('[data-accept]').onclick = () => decide(true);
    update();
    if (choice() === null) panel.hidden = false;
    window.addEventListener('storage', event => {
      if (event.key !== preference && event.key !== null) return;
      memory = undefined;
      if (choice() !== true) forgetVisitor();
      if (choice() !== true && document.querySelector('script[data-cf-beacon]')) { location.reload(); return; }
      update(); panel.hidden = choice() !== null;
      window.dispatchEvent(new Event('tda-consent'));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, {once:true}); else setup();
})();
