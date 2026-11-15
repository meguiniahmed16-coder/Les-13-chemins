export function injectAnalytics(html, filename) {
  if (!filename.endsWith('.html')) return html;
  if (/^(?:admin|editeurs|contact)\.html$/i.test(filename)) return html;
  // Une redirection n'est pas une vue supplémentaire du contenu d'arrivée.
  if (/<meta\b[^>]*http-equiv\s*=\s*['"]refresh['"]/i.test(html)) return html;
  if (/\bsrc\s*=\s*['"](?:\.\/)?site-analytics\.js(?:[?'"])/i.test(html)) return html;
  const tag = '<script defer src="site-analytics.js?v=20261115"></script>';
  if (/<\/body\s*>/i.test(html)) return html.replace(/<\/body\s*>/i, tag + '\n</body>');
  // Some existing HTML documents omit the optional body/html end tags.
  if (/<\/html\s*>/i.test(html)) return html.replace(/<\/html\s*>/i, tag + '\n</html>');
  return html + '\n' + tag + '\n';
}
