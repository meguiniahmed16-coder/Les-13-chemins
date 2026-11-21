import {pageURL} from './site-origin-build.mjs';
import {activeSection} from './site-nav.js';
const pages = new Set(['mentions-legales.html','confidentialite.html','conditions-de-vente.html','retractation.html','l-odeur-du-bois.html','soutien.html','dialogues.html','admin-blog.html','index.html','carte.html','jeu.html','ahmed-marie.html','contact.html','presentation.html','admin.html','editeurs.html','lecture.html','mode_emploi.html','mode_emploi_treize_chemins.html']);
export function navigation(filename, memberMenu = '') {
  const links = [['jeu.html','Le voyage','voyage'],['ahmed-marie.html#blog','Blog','blog'],['ahmed-marie.html#ahmed-numerique','Ahmed numérique','digital'],['soutien.html','Soutenir','support'],['l-odeur-du-bois.html','L’odeur du bois','atelier']];
  const current = activeSection('/'+filename);
  const brand='<a class="site-brand" href="'+pageURL('index.html')+'"'+(filename==='index.html'?' aria-current="page"':'')+'><span aria-hidden="true">✦</span> La tectonique des âmes</a>';
  const destinations=links.map(([path,label,section])=>'<a href="'+pageURL(path)+'" class="site-'+section+'-link" data-nav-section="'+section+'"'+(section===current?' aria-current="page"':'')+'>'+label+'</a>').join('');
  let controls;
  if(memberMenu){
    controls=memberMenu.replace(/<!--site-links-->[\s\S]*?<!--\/site-links-->/,'<!--site-links-->'+destinations+'<!--/site-links-->');
  }else{
    const account=filename==='admin.html'?'?auteur=edition':filename==='admin-blog.html'?'?auteur=atelier':'';
    controls='<div class="site-links">'+destinations+'</div><a class="site-account" href="'+pageURL('membre.html')+account+'" aria-label="Connexion à Compagnon de route" title="Compagnon de route"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.3"/><path d="M4.6 20v-1.4a7.4 7.4 0 0 1 14.8 0V20"/></svg></a>';
  }
  return '<nav class="site-nav'+(memberMenu?' site-member-nav':'')+'" aria-label="Navigation principale"><div class="site-nav-inner">'+brand+controls+'</div></nav>';
}
export function injectSharedNavigation(html, filename) {
  if (!filename.endsWith('.html') || /<meta\b[^>]*http-equiv\s*=\s*['"]refresh['"]/i.test(html)) return html;
  if (pages.has(filename) || /<nav\b[^>]*class=["'][^"']*\bsite-nav\b/i.test(html)) {
    const memberMenu=['membre.html','admin-blog.html'].includes(filename)?html.match(/<details id="(?:member|author)-menu"[^>]*>[\s\S]*?<\/details>/)?.[0]:'';
    const nav = navigation(filename,memberMenu);
    const oldNav = /<nav\b[^>]*class=["'][^"']*\bsite-nav\b[^"']*["'][^>]*>[\s\S]*?<\/nav>/i;
    html = oldNav.test(html) ? html.replace(oldNav,nav) : html.replace(/<body\b[^>]*>/i, m=>m+nav);
    html = html.replace(/<link\b[^>]*href=["'](?:\.\/)?site-nav\.css[^"']*["'][^>]*>/gi,'');
    html = html.replace(/<script\b[^>]*src=["'](?:\.\/)?site-nav\.js[^"']*["'][^>]*>[\s\S]*?<\/script>/gi,'');
    html = html.replace(/<\/head>/i,'<link rel="stylesheet" href="site-nav.css?v=20261120-compagnon"><script type="module" src="site-nav.js?v=20261120-compagnon"></script></head>');
  }
  if (!/^(admin(?:-blog)?|editeurs)\.html$/.test(filename) && !/src=["']site-visits\.js/.test(html)) {
    const tag = '<script defer src="site-visits.js?v=20261120-consent"></script>';
    html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i,tag+'</body>') : html+tag;
  }
  return html;
}

