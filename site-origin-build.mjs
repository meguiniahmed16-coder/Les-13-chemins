export const SITE_ORIGIN='https://tectonique-des-ames.com';
export function pageURL(filename){return SITE_ORIGIN+(filename==='index.html'?'/':'/'+filename);}
export function canonicalizeSource(content,filename){
 // Only replace this site's former public origins, never external media/API hosts.
 content=content.replace(/https?:\/\/(?:tectonique-des-ames\.netlify\.app|(?:www\.)?tectonic-d-am\.com|www\.tectonique-des-ames\.com)(?=[/"'\s?#<]|$)/gi,SITE_ORIGIN);
 if(!filename.endsWith('.html'))return content;
 content=content.replace(/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>/gi,'');
 const url=pageURL(filename==='atelier.html'?'l-odeur-du-bois.html':filename);
 content=content.replace(/<meta\b(?=[^>]*\bproperty\s*=\s*["']og:url["'])[^>]*>/gi,'');
 return content.replace(/<\/head>/i,`<link rel="canonical" href="${url}"><meta property="og:url" content="${url}"></head>`);
}
