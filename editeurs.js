'use strict';
(() => {
  const endpoint = '/.netlify/functions/editor';
  const byId = id => document.getElementById(id);
  let catalog = null, controller = null;
  const size = bytes => bytes < 1000000 ? `${Math.ceil(bytes / 1000)} Ko` : `${(bytes / 1000000).toFixed(1)} Mo`;
  const sha = async data => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', data)), b => b.toString(16).padStart(2, '0')).join('');
  async function api(action, options = {}) {
    const response = await fetch(`${endpoint}?action=${action}`, { credentials: 'same-origin', cache: 'no-store', ...options });
    let data;
    try { data = await response.json(); } catch { throw new Error('L’espace éditeur est momentanément indisponible. Réessaie dans quelques instants.'); }
    if (!response.ok) { const error = new Error(data.error || 'La demande n’a pas abouti.'); error.status = response.status; throw error; }
    return data;
  }
  function clearCatalog() {
    controller?.abort(); controller = null; catalog = null;
    byId('catalog').hidden = true; byId('login-panel').hidden = false;
    byId('documents').replaceChildren(); byId('download-status').textContent = '';
  }
  function display(data) {
    catalog = data;
    byId('login-panel').hidden = true; byId('catalog').hidden = false;
    byId('catalog-info').textContent = `${data.files.length} documents · Dossier actualisé le ${new Date(data.updatedAt).toLocaleDateString('fr-FR')}`;
    byId('documents').replaceChildren();
    for (const category of ['Manuscrits','Présentation','Cartes et atlas','Méthodes et révisions','Personnages et repères']) {
      const files = data.files.filter(f => f.category === category); if (!files.length) continue;
      const section = document.createElement('section'); section.className = 'category';
      const heading = document.createElement('h2'); heading.textContent = category; section.append(heading);
      for (const file of files) {
        const row = document.createElement('article'); row.className = 'document';
        const text = document.createElement('div'), title = document.createElement('h3'), info = document.createElement('p');
        title.textContent = file.title; info.className = 'muted';
        info.textContent = `${file.name.split('.').pop().toUpperCase()} · ${size(file.bytes)} · ${new Date(file.updatedAt).toLocaleDateString('fr-FR')}`;
        text.append(title, info); const button = document.createElement('button');
        button.type = 'button'; button.className = 'secondary'; button.textContent = 'Télécharger';
        button.setAttribute('aria-label', `Télécharger ${file.title} (${file.name.split('.').pop().toUpperCase()})`);
        button.addEventListener('click', () => download(file, button)); row.append(text, button); section.append(row);
      }
      byId('documents').append(section);
    }
  }
  async function download(file, button) {
    if (controller) return;
    const active = new AbortController(); controller = active;
    const buttons = [...byId('documents').querySelectorAll('button')]; buttons.forEach(b => b.disabled = true);
    const status = byId('download-status'); status.classList.remove('error');
    const chunks = [];
    try {
      for (let part = 0; part < file.parts.length; part++) {
        status.textContent = `${file.title} — téléchargement ${Math.round(part / file.parts.length * 100)} %`;
        button.textContent = `${Math.round(part / file.parts.length * 100)} %`;
        const response = await fetch(`${endpoint}?action=part&id=${encodeURIComponent(file.id)}&part=${part}`, { credentials:'same-origin', cache:'no-store', signal:active.signal });
        if (!response.ok) { if (response.status === 401) { clearCatalog(); byId('login-status').textContent = 'Ta session a expiré. Connecte-toi à nouveau.'; } throw new Error('Téléchargement interrompu. Tu peux réessayer.'); }
        const data = await response.arrayBuffer();
        if (await sha(data) !== file.parts[part]) throw new Error('Le fichier reçu est incomplet. Réessaie le téléchargement.');
        chunks.push(data);
      }
      if (active.signal.aborted) return;
      const blob = new Blob(chunks, { type:file.mime });
      if (blob.size !== file.bytes || await sha(await blob.arrayBuffer()) !== file.sha256) throw new Error('Le contrôle du document a échoué. Réessaie.');
      const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = file.name;
      document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
      status.textContent = `${file.title} — téléchargement terminé.`;
    } catch (error) { if (!active.signal.aborted) { status.textContent = error.message; status.classList.add('error'); } }
    finally { chunks.length = 0; if (controller === active) controller = null; buttons.forEach(b => b.disabled = false); button.textContent = 'Télécharger'; }
  }
  byId('show-code').onclick = () => {
    const input = byId('access-code'), show = input.type === 'password'; input.type = show ? 'text' : 'password';
    byId('show-code').textContent = show ? 'Masquer le code' : 'Afficher le code'; byId('show-code').setAttribute('aria-pressed', String(show));
  };
  byId('login-form').onsubmit = async event => {
    event.preventDefault(); const button = byId('login-button'), status = byId('login-status');
    button.disabled = true; status.classList.remove('error'); status.textContent = 'Connexion…';
    try {
      await api('login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({code:byId('access-code').value}) });
      byId('access-code').value = ''; display(await api('list')); status.textContent = '';
    } catch (error) { status.textContent = error.message; status.classList.add('error'); }
    finally { button.disabled = false; }
  };
  byId('logout').onclick = async () => {
    try { await api('logout', {method:'POST'}); clearCatalog(); byId('login-status').textContent = 'Tu es déconnecté.'; byId('access-code').focus(); }
    catch { byId('download-status').textContent = 'La déconnexion n’a pas abouti. Réessaie.'; }
  };
  window.addEventListener('pagehide', () => { controller?.abort(); });
  window.addEventListener('pageshow', event => { if (event.persisted) { clearCatalog(); api('list').then(display).catch(() => {}); } });
  api('list').then(display).catch(error => { if (error.status !== 401) byId('login-status').textContent = error.message; });
})();
