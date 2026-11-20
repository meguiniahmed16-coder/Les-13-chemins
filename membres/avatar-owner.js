/* Serve exclusively after the server has verified the author's session. */
const privateKeys = ['bust', 'seat', 'length', 'girth', 'scrotum'];
const limitation = 'Ce fichier ne correspond pas à la version de référence de Summer Man.';
const defaultLabel = 'Atelier des formes';
const groupLabel = input => String(input || '').trim().slice(0, 56) || defaultLabel;
const scriptLiteral = value => JSON.stringify(value).replace(/</g, '\\u003c');
export function prepareOwnerAvatar(html, label = defaultLabel) {
  const marker = 'const familyHeaders=new Map();';
  if (!html.includes('Summer <i>Man</i>') || !html.includes(marker) || !html.includes('id="wardrobeData"')) throw new Error(limitation);
  const adapter = `
    const privateTraits = ${scriptLiteral(privateKeys)};
    const privateFamily = families.find(family => family[0] === 'intime');
    families.splice(families.indexOf(privateFamily), 1);
    for (const family of families) family[2] = family[2].filter(key => !privateTraits.includes(key));
    privateFamily[1] = ${scriptLiteral(groupLabel(label))};
    privateFamily[2] = privateTraits;
    families.push(privateFamily);
    ${marker}
    addEventListener('message', event => {
      if (event.source !== parent || event.data?.type !== 'member-owner-label' || typeof event.data.label !== 'string') return;
      const name = event.data.label.trim().slice(0,56) || 'Atelier des formes';
      privateFamily[1] = name;
      const heading = familyHeaders.get('intime');
      if (heading) heading.textContent = name;
      const option = document.querySelector('#choiceFamilies option[value="intime"]');
      if (option) option.textContent = name;
    });
  `;
  const security = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; media-src data: blob:; font-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">`;
  const style = '<style>.owner-trait{background:#f3e6f0;color:#692b5e;border-left:3px solid #925877;padding-inline:6px}.owner-trait .traitSummary{color:#692b5e}</style>';
  return html.replace(/<head\b[^>]*>/i, opening => opening + security)
    .replace(marker, () => adapter)
    .replace('box.appendChild(title);familyHeaders.set(id,title);', "if(id==='intime')title.classList.add('owner-trait');box.appendChild(title);familyHeaders.set(id,title);")
    .replace('pane.hidden=false;box.appendChild(pane)', "pane.hidden=false;if(id==='intime')pane.classList.add('owner-trait');box.appendChild(pane)")
    .replace('</head>', style + '</head>');
}
export function mountOwnerAvatar(container, {label = defaultLabel, onRename, loadReference} = {}) {
  const text = document.createElement('input');
  text.maxLength = 56;
  text.value = groupLabel(label);
  const file = document.createElement('input');
  file.type = 'file';
  file.accept = '.html,text/html';
  const nameField = document.createElement('label');
  nameField.append('Nom de la rubrique privée ',text);
  const fileField = document.createElement('label');
  fileField.append('Ouvrir le modèle de référence depuis cet appareil ',file);
  const status = document.createElement('p');
  status.setAttribute('role','status');
  const frame = document.createElement('iframe');
  frame.title = 'Modèle de référence privé';
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.referrerPolicy = 'no-referrer';
  frame.hidden = true;
  frame.width = '100%';
  frame.height = '660';
  const open = document.createElement('button');
  open.type = 'button';
  open.textContent = 'Ouvrir mon modèle privé';
  open.hidden = typeof loadReference !== 'function';
  container.replaceChildren(nameField, open, fileField, status, frame);
  let generation = 0;
  async function showReference(readSource) {
    const count = ++generation;
    open.disabled = true;
    status.textContent = 'Ouverture du modèle privé…';
    try {
      const html = await readSource((received,total) => {
        if (generation !== count || !frame.isConnected || !Number.isFinite(total) || total <= 0) return;
        const percent = Math.max(0, Math.min(100, Math.round(100 * received / total)));
        status.textContent = 'Chargement du modèle privé · '+percent+' %';
      });
      if (count !== generation || !frame.isConnected) return;
      const markup = prepareOwnerAvatar(html,text.value);
      if (count !== generation || !frame.isConnected) return;
      frame.srcdoc = markup;
      frame.hidden = false;
      status.textContent = 'Modèle ouvert sur cet appareil.';
    } catch (error) {
      if (count === generation) status.textContent = error?.message || 'Le modèle privé ne peut pas s’ouvrir. Réessaie ou choisis le fichier de référence.';
    } finally {
      if (count === generation) open.disabled = false;
    }
  }
  open.onclick = () => showReference(loadReference);
  file.onchange = () => {
    const source = file.files[0];
    if (source) void showReference(async () => {
      if (source.size > 90 * 1024 * 1024) throw new Error(limitation);
      return source.text();
    });
  };
  text.onchange = async () => {
    text.value = groupLabel(text.value);
    frame.contentWindow?.postMessage({type:'member-owner-label',label:text.value},'*');
    if (onRename) try { await onRename(text.value); } catch { status.textContent = 'Le nom a changé ici. Son enregistrement a échoué.'; }
  };
}
