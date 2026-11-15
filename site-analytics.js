/* Mesure des pages publiques du domaine principal. Le jeton est public :
 * il identifie le site et ne donne pas accès au tableau de bord Cloudflare.
 */
(() => {
  'use strict';
  const hosts = new Set(['tectonique-des-ames.com', 'www.tectonique-des-ames.com']);
  if (!hosts.has(location.hostname) || location.protocol !== 'https:') return;
  // Les jeux intégrés au plateau ne créent pas une deuxième visite de page.
  try { if (window.top !== window.self) return; } catch { return; }
  const path = location.pathname.replace(/\/+$/, '').replace(/\.html$/i, '').toLowerCase();
  if (/^\/(?:admin|editeurs|contact)(?:\/|$)/.test(path)) return;
  if (document.querySelector('script[data-cf-beacon]')) return;
  const beacon = document.createElement('script');
  beacon.type = 'module';
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  // Les changements internes de plateau ne sont pas de nouvelles pages.
  beacon.setAttribute('data-cf-beacon', JSON.stringify({
    token: '322c848020ed45e3afd6c93e5bfa8558', spa: false
  }));
  beacon.addEventListener('load', () => { beacon.dataset.loaded = 'true'; }, { once: true });
  beacon.addEventListener('error', () => { beacon.dataset.loaded = 'false'; }, { once: true });
  document.head.appendChild(beacon);
})();
