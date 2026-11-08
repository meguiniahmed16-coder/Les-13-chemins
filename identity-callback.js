'use strict';
(() => { const forward=()=>{const p=new URLSearchParams(location.hash.slice(1));if(p.has('recovery_token')||p.has('invite_token'))location.replace('/admin'+location.hash);};window.addEventListener('hashchange',forward);forward();})();
