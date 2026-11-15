import {pageURL} from './site-origin-build.mjs';
const pages = new Set(['soutien.html','dialogues.html','admin-blog.html','index.html','carte.html','jeu.html','ahmed-marie.html','contact.html','presentation.html','admin.html','editeurs.html','lecture.html','mode_emploi.html','mode_emploi_treize_chemins.html']);
export function navigation(filename) {
  const links = [['index.html','⌂ Accueil'],['carte.html','🧭 Cartes'],['jeu.html','🎲 Jeux'],['ahmed-marie.html','✎ Blog'],['dialogues.html','↔ Le dialogue'],['soutien.html','♡ Soutenir']];
  return '<nav class="site-nav" aria-label="Navigation principale"><div class="site-nav-inner"><a class="site-brand" href="'+pageURL('index.html')+'">✦ Les Treize Chemins</a><div class="site-links">'+links.map(([path,label])=>'<a href="'+pageURL(path)+'"'+(path==='ahmed-marie.html'?' class="site-blog-link"':path==='dialogues.html'?' class="site-dialogue-link"':path==='soutien.html'?' class="site-support-link"':'')+(path===filename?' aria-current="page"':'')+'>'+label+'</a>').join('')+'</div></div></nav>';
}
export function injectSharedNavigation(html, filename) {
  if (!filename.endsWith('.html') || /<meta\b[^>]*http-equiv\s*=\s*['"]refresh['"]/i.test(html)) return html;
  if (pages.has(filename) || /<nav\b[^>]*class=["'][^"']*\bsite-nav\b/i.test(html)) {
    const nav = navigation(filename);
    const oldNav = /<nav\b[^>]*class=["'][^"']*\bsite-nav\b[^"']*["'][^>]*>[\s\S]*?<\/nav>/i;
    html = oldNav.test(html) ? html.replace(oldNav,nav) : html.replace(/<body\b[^>]*>/i, m=>m+nav);
    html = html.replace(/<link\b[^>]*href=["'](?:\.\/)?site-nav\.css[^"']*["'][^>]*>/gi,'');
    html = html.replace(/<\/head>/i,'<link rel="stylesheet" href="site-nav.css?v=20261115-soutien-1"></head>');
  }
  if (!/^(admin(?:-blog)?|editeurs)\.html$/.test(filename) && !/src=["']site-visits\.js/.test(html)) {
    const tag = '<script defer src="site-visits.js?v=20261115-1"></script>';
    html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i,tag+'</body>') : html+tag;
  }
  return html;
}

