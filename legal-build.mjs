const footer = `<div class="tda-legal-footer" role="group" aria-label="Informations légales">
<a href="/mentions-legales.html">Mentions légales</a><a href="/confidentialite.html">Confidentialité</a><button type="button" hidden data-choix-traceurs>Gérer les cookies</button><a href="/conditions-de-vente.html">Conditions de vente</a><a href="/retractation.html">Renoncer au contrat ici</a></div>
<section id="choix-traceurs" class="tda-cookie-panel" role="region" aria-labelledby="titre-traceurs" hidden>
<h2 id="titre-traceurs" tabindex="-1">Mesure des visites</h2><p>Avec votre accord, ce site compte les visites à l’aide d’un identifiant de navigateur et mesure les performances des pages avec Cloudflare. Vous pouvez lire, jouer et acheter quel que soit votre choix.</p><p><a href="/confidentialite.html#traceurs">Détails sur les traceurs</a> <span data-choice-status></span></p>
<div><button type="button" data-refuse>Tout refuser</button><button type="button" data-accept>Tout accepter</button></div></section>`;
export function injectLegal(html) {
  if (/<meta\b[^>]*http-equiv\s*=\s*['"]refresh['"]/i.test(html) || html.includes('id="choix-traceurs"')) return html;
  const assets='<link rel="stylesheet" href="/legal.css?v=1"><script src="/site-consent.js?v=1"></script>';
  html=/<head(?:\s[^>]*)?>/i.test(html)?html.replace(/<head(?:\s[^>]*)?>/i,tag=>tag+assets):html.replace(/(<(?:meta|title)\b)/i,assets+'$1');
  return /<\/body>/i.test(html)?html.replace(/<\/body>/i,footer+'\n</body>'):html+footer;
}
