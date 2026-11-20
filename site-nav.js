export function activeSection(pathname, hash = '') {
  const page = pathname.split('/').pop().replace(/\.html$/, '');
  if (['jeu', 'carte', 'presentation'].includes(page)) return 'voyage';
  if (page === 'dialogues') return 'blog';
  if (page === 'ahmed-marie') return ['#ahmed-numerique', '#conversationSection'].includes(hash) ? 'digital' : 'blog';
  if (page === 'atelier') return 'atelier';
  if (page === 'soutien') return 'support';
  return '';
}

if (typeof document !== 'undefined') {
  const update = () => {
    const current = activeSection(location.pathname, location.hash);
    for (const link of document.querySelectorAll('.site-links [data-nav-section]')) {
      if (link.dataset.navSection === current) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  };
  update();
  window.addEventListener('hashchange', update);
}
