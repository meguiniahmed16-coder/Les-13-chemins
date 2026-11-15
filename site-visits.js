(() => {
  'use strict';
  try { if (window.top !== window.self) return; } catch { return; }
  const hosts = new Set(['tectonique-des-ames.netlify.app','tectonique-des-ames.com','www.tectonique-des-ames.com','tectonic-d-am.com','www.tectonic-d-am.com']);
  if (!hosts.has(location.hostname)) return;
  let visitor;
  try { visitor = localStorage.getItem('am-visitor-v1'); if (!visitor) { visitor = crypto.randomUUID(); localStorage.setItem('am-visitor-v1',visitor); } } catch { visitor = crypto.randomUUID(); }
  let last = 0;
  function visit() {
    if (document.visibilityState !== 'visible' || Date.now()-last<60000) return;
    last = Date.now();
    fetch('https://ahmed-marie-double.meguiniahmed16.workers.dev/visit',{method:'POST',headers:{'content-type':'application/json'},credentials:'omit',body:JSON.stringify({visitor_id:visitor,page:location.pathname}),keepalive:true}).catch(()=>{});
  }
  visit(); setInterval(visit,5*60*1000); document.addEventListener('visibilitychange',visit);
})();
