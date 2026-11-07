'use strict';
(() => {
  const endpoint = '/.netlify/functions/editor';
  const byId = id => document.getElementById(id);
  const formatDate = value => new Date(value).toLocaleString('fr-FR', { dateStyle:'long', timeStyle:'short' });
  let latest = null, pendingRevoke = null;
  async function api(action, options = {}) {
    const response = await fetch(`${endpoint}?action=${action}`, { credentials:'same-origin', cache:'no-store', ...options });
    let data;
    try { data = await response.json(); } catch { throw new Error('Le service est momentanément indisponible. Réessaie.'); }
    if (!response.ok) {
      const error = new Error(data.error || 'La demande n’a pas abouti.'); error.status = response.status;
      if (response.status === 401 && action !== 'admin-login') clear();
      throw error;
    }
    return data;
  }
  const post = (action, body = {}) => api(action, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
  function status(id, message, error = false) { const node = byId(id); node.textContent = message; node.classList.toggle('error', error); }
  function hideCode() { latest = null; byId('generated-code').value = ''; byId('new-code').hidden = true; byId('new-code-info').textContent = ''; status('copy-status',''); byId('create-code').disabled = false; }
  function clear() {
    hideCode(); byId('owner-dashboard').hidden = true; byId('owner-login').hidden = false;
    byId('codes-list').replaceChildren(); byId('owner-code').value = ''; byId('recipient').value = '';
    pendingRevoke = null; if (byId('revoke-dialog').open) byId('revoke-dialog').close();
  }
  function askRevoke(id, label, trigger) {
    pendingRevoke = { id, trigger };
    byId('revoke-title').textContent = id === 'legacy' ? 'Désactiver l’ancien code commun ?' : 'Révoquer cet accès ?';
    byId('revoke-description').textContent = id === 'legacy' ? 'Toutes les personnes qui utilisent cet ancien code perdront l’accès au dossier. Ton accès administrateur et les codes individuels resteront valables.' : `Le code confié à « ${label} » cessera de fonctionner, y compris pour une session déjà ouverte.`;
    byId('revoke-dialog').showModal(); byId('cancel-revoke').focus();
  }
  function display(data) {
    byId('owner-login').hidden = true; byId('owner-dashboard').hidden = false;
    byId('document-count').textContent = data.documents ? `${data.documents} documents · Dossier actualisé le ${formatDate(data.updatedAt)}. Ton accès personnel est déjà ouvert.` : 'Le dossier est en cours de préparation.';
    const active = data.codes.filter(c => c.status === 'active').length;
    byId('codes-summary').textContent = data.codes.length ? `${active} accès actif${active > 1 ? 's' : ''} · ${data.codes.length} code${data.codes.length > 1 ? 's' : ''} créé${data.codes.length > 1 ? 's' : ''}` : 'Tu n’as pas encore créé de code individuel.';
    byId('codes-list').replaceChildren();
    for (const code of data.codes) {
      const article = document.createElement('article'); article.className = 'grant';
      const top = document.createElement('div'); top.className = 'grant-top';
      const title = document.createElement('h3'); title.textContent = code.label;
      const badge = document.createElement('span'); badge.className = 'badge ' + code.status; badge.textContent = {active:'Actif',expired:'Expiré',revoked:'Révoqué'}[code.status]; top.append(title,badge);
      const dates = document.createElement('p'); dates.className = 'muted'; dates.textContent = `Créé le ${formatDate(code.createdAt)}. Valable jusqu’au ${formatDate(code.expiresAt)}.`;
      article.append(top,dates);
      if (code.status === 'active') { const button = document.createElement('button'); button.type = 'button'; button.className = 'secondary'; button.textContent = 'Révoquer'; button.setAttribute('aria-label',`Révoquer l’accès de ${code.label}`); button.onclick = () => askRevoke(code.id,code.label,button); article.append(button); }
      byId('codes-list').append(article);
    }
    byId('legacy-info').textContent = data.legacyEnabled ? 'Le code commun créé avant cet espace fonctionne encore. Tu peux le désactiver lorsque tu auras transmis des codes individuels aux personnes concernées.' : 'L’ancien code commun est désactivé.';
    byId('disable-legacy').hidden = !data.legacyEnabled;
  }
  async function refresh() { display(await api('admin-state')); }
  byId('owner-show').onclick = () => { const input = byId('owner-code'), show = input.type === 'password'; input.type = show ? 'text' : 'password'; byId('owner-show').textContent = show ? 'Masquer le code' : 'Afficher le code'; byId('owner-show').setAttribute('aria-pressed',String(show)); };
  byId('owner-form').onsubmit = async event => {
    event.preventDefault(); byId('owner-submit').disabled = true; status('login-status','Connexion…');
    try { await post('admin-login',{code:byId('owner-code').value}); await refresh(); status('login-status',''); }
    catch (e) { status('login-status',e.message,true); }
    finally { byId('owner-code').value = ''; byId('owner-submit').disabled = false; }
  };
  byId('code-form').onsubmit = async event => {
    event.preventDefault(); if (latest) return; byId('create-code').disabled = true; status('create-status','Création…');
    try {
      const result = await post('create-code',{label:byId('recipient').value,days:Number(byId('duration').value)});
      latest = result; byId('generated-code').value = result.code; byId('new-code-info').textContent = `Pour ${result.label} · Jusqu’au ${formatDate(result.expiresAt)}`;
      byId('new-code').hidden = false; status('create-status','Code créé.'); byId('new-code-title').focus(); byId('new-code').scrollIntoView({block:'nearest'});
      await refresh();
    } catch (e) { status('create-status',e.message,true); if (!latest) byId('create-code').disabled = false; if (e.status === 401) status('login-status','Ta session a expiré. Connecte-toi à nouveau.',true); }
  };
  async function copy(invitation) {
    if (!latest) return;
    const message = invitation ? `Bonjour,\n\nVoici votre accès au dossier éditorial de La Tectonique des âmes :\nhttps://tectonique-des-ames.netlify.app/contact#espace-editeur\n\nCode : ${latest.code}\nValable jusqu’au ${formatDate(latest.expiresAt)}.\n\nCes documents sont confiés pour une lecture éditoriale. Merci de ne pas les diffuser.\n\nAhmed Meguini` : latest.code;
    try { await navigator.clipboard.writeText(message); status('copy-status',invitation ? 'Message copié. Tu peux le coller dans ton mail.' : 'Code copié.'); }
    catch { byId('generated-code').focus(); byId('generated-code').select(); status('copy-status','Sélectionne et copie le code dans le champ ci-dessus.'); }
  }
  byId('copy-invitation').onclick = () => copy(true); byId('copy-code').onclick = () => copy(false);
  byId('hide-code').onclick = () => { hideCode(); byId('recipient').value = ''; status('create-status','Tu peux créer un autre code.'); byId('recipient').focus(); };
  byId('refresh-codes').onclick = async () => { byId('refresh-codes').disabled = true; try { await refresh(); status('codes-status','Liste actualisée.'); } catch (e) { status(e.status === 401 ? 'login-status' : 'codes-status',e.message,true); } finally { byId('refresh-codes').disabled = false; } };
  byId('disable-legacy').onclick = event => askRevoke('legacy','',event.currentTarget);
  byId('cancel-revoke').onclick = () => byId('revoke-dialog').close();
  byId('revoke-dialog').addEventListener('close',() => { pendingRevoke?.trigger?.focus({preventScroll:true}); pendingRevoke = null; });
  byId('confirm-revoke').onclick = async () => {
    if (!pendingRevoke) return; const {id} = pendingRevoke; byId('confirm-revoke').disabled = true;
    try { await post(id === 'legacy' ? 'disable-legacy' : 'revoke-code',id === 'legacy' ? {} : {id}); if (latest?.id === id) hideCode(); byId('revoke-dialog').close(); await refresh(); status('codes-status','Accès révoqué.'); }
    catch (e) { byId('revoke-dialog').close(); status(e.status === 401 ? 'login-status' : 'codes-status',e.message,true); }
    finally { byId('confirm-revoke').disabled = false; }
  };
  byId('owner-logout').onclick = async () => { try { await post('logout'); clear(); status('login-status','Tu es déconnecté.'); byId('owner-code').focus(); } catch (e) { status('codes-status',e.message,true); } };
  window.addEventListener('pagehide',clear);
  window.addEventListener('pageshow',event => { if (event.persisted) refresh().catch(() => clear()); });
  refresh().catch(e => { if (e.status !== 401) status('login-status',e.message,true); });
})();
