import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { injectAnalytics } from './site-analytics-build.mjs';
const source = readFileSync(new URL('./site-analytics.js', import.meta.url), 'utf8');

function load({host='tectonique-des-ames.com',path='/presentation',protocol='https:',embedded=false,existing=false,consent=true}={}) {
  const scripts=[];const self={};const window={tdaAudienceAllowed:()=>consent,addEventListener(){},self,top:embedded?{}:self};
  const context=vm.createContext({window,location:{hostname:host,pathname:path,protocol},document:{
    querySelector:()=>existing||scripts.length?scripts[0]||{}:null,
    createElement:()=>({dataset:{},setAttribute(key,value){this[key]=value;},addEventListener(){}}),
    head:{appendChild(script){scripts.push(script);}}
  }});
  vm.runInContext(source,context);
  return {scripts,again(){vm.runInContext(source,context);}};
}
test('Public pages load the registered beacon once without changing stored game progress',()=>{
  for(const path of ['/','/presentation','/carte','/jeu','/jeu-yoyo.html']){
    const page=load({path});page.again();assert.equal(page.scripts.length,1);
    assert.equal(page.scripts[0].src,'https://static.cloudflareinsights.com/beacon.min.js');
    assert.equal(page.scripts[0].type,'module');
    assert.deepEqual(JSON.parse(page.scripts[0]['data-cf-beacon']),{token:'322c848020ed45e3afd6c93e5bfa8558',spa:false});
  }
  assert.doesNotMatch(source,/localStorage|sessionStorage|document\.cookie/);
});
test('Previews, embedded games and restricted pages send no analytics',()=>{
  for(const host of ['localhost','127.0.0.1','example.com','tectonique-des-ames.netlify.app','deploy-preview-42--tectonique-des-ames.netlify.app'])
    assert.equal(load({host}).scripts.length,0);
  for(const path of ['/admin','/admin.html','/admin/','/editeurs','/editeurs.html','/editeurs/passages','/contact','/contact.html'])
    assert.equal(load({path}).scripts.length,0);
  assert.equal(load({consent:false}).scripts.length,0);
  assert.equal(load({embedded:true}).scripts.length,0);
  assert.equal(load({protocol:'http:'}).scripts.length,0);
  assert.equal(load({existing:true}).scripts.length,0);
});
test('Build injection covers public pages and avoids duplicate tags, forms and redirects',()=>{
  const html='<!doctype html><html><head></head><body><h1>Un voyage</h1></body></html>';
  for(const page of ['index.html','presentation.html','carte.html','jeu.html','jeu-yoyo.html']){
    const result=injectAnalytics(html,page);
    assert.equal((result.match(/src="site-analytics/g)||[]).length,1);
    assert.equal(injectAnalytics(result,page),result);
    assert.ok(result.includes('<h1>Un voyage</h1>'));
  }
  for(const page of ['admin.html','editeurs.html','contact.html'])assert.equal(injectAnalytics(html,page),html);
  const compact='<!doctype html><title>Les Marmousets</title><main>Cour</main>';
  assert.ok(injectAnalytics(compact,'arcade-marmousets.html').endsWith('</script>\n'));
  const redirect=html.replace('</head>','<meta http-equiv="refresh" content="0;url=jeu.html"></head>');
  assert.equal(injectAnalytics(redirect,'prison-3d-prototype.html'),redirect);
});
