/* Serve exclusively after the server has verified the author's session. */
const privateKeys = ['bust', 'seat', 'length', 'girth', 'scrotum'];
const limitation = 'Ce fichier ne correspond pas à la version de référence de Summer Man.';
const defaultLabel = 'Atelier des formes';
const groupLabel = input => String(input || '').trim().slice(0, 56) || defaultLabel;
const scriptLiteral = value => JSON.stringify(value).replace(/</g, '\\u003c');
const sceneFiles='/assets/membres/';
const previewFile=sceneFiles+'salon-apercu.webp';
let scenePromise;
async function sceneImage(file) {
  const response=await fetch(file);
  if(!response.ok)throw new Error('Le décor du salon ne peut pas être ouvert.');
  const blob=await response.blob();
  const reader=new FileReader();
  return new Promise((resolve,reject)=>{
    reader.onerror=()=>reject(new Error('La lecture du décor a échoué.'));
    reader.onload=()=>resolve(reader.result);
    reader.readAsDataURL(new Blob([blob],{type:'image/webp'}));
  });
}
function privateScene(){
  return scenePromise??=Promise.all([sceneImage(sceneFiles+'salon-decor.webp'),sceneImage(previewFile)])
    .then(([decor,poster])=>({decor,poster})).catch(error=>{scenePromise=null;throw error;});
}
const webp=data=>typeof data==='string'&&/^data:image\/webp;base64,[A-Za-z0-9+/]+=*$/.test(data);
export function prepareOwnerAvatar(html, label = defaultLabel, scene) {
  const marker = 'const familyHeaders=new Map();';
  if (!html.includes('Summer <i>Man</i>') || !html.includes(marker) || !html.includes('id="wardrobeData"')) throw new Error(limitation);
  const adapter = `
    const privateTraits = ${scriptLiteral(privateKeys)};
    const privateFamily = families.find(family => family[0] === 'intime');
    families.splice(families.indexOf(privateFamily), 1);
    // This standalone author reference always renders Summer Man.
    const omitted = ['lashes', 'makeup'];
    for (const key of omitted) {
      appearance[key] = 0;
      const index = traits.findIndex(trait => trait.key === key);
      if (index >= 0) traits.splice(index, 1);
    }
    for (const family of families) {
      family[2] = family[2].filter(key => !privateTraits.includes(key) && !omitted.includes(key));
      if (family[0] === 'regard') family[1] = 'Sourcils';
    }
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
  const stageStyle=scene&&webp(scene.decor)&&webp(scene.poster)
    ? '<style>#stage{background:#d4c9bc url("'+scene.decor+'") center/cover no-repeat}#stage #poster{object-fit:cover}#stage #view{background:transparent}</style>' : '';
  if(stageStyle)html=html.replace(/(<img\b[^>]*?\bid="poster"[^>]*?\bsrc=")[^"]*/i,(_,prefix)=>prefix+scene.poster);
  return html.replace(/<head\b[^>]*>/i, opening => opening + security)
    .replace(marker, () => adapter)
    .replace('box.appendChild(title);familyHeaders.set(id,title);', "if(id==='intime')title.classList.add('owner-trait');box.appendChild(title);familyHeaders.set(id,title);")
    .replace('pane.hidden=false;box.appendChild(pane)', "pane.hidden=false;if(id==='intime')pane.classList.add('owner-trait');box.appendChild(pane)")
    .replace('</head>', stageStyle + style + '</head>');
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
  const preview=document.createElement('img');
  preview.src=previewFile;preview.alt='Aperçu du salon avec Summer Man habillé.';
  preview.style.cssText='width:100%;height:auto;max-height:420px;object-fit:cover;border-radius:12px';
  container.replaceChildren(nameField, open, fileField, status, preview, frame);
  let generation = 0;
  async function showReference(readSource) {
    const count = ++generation;
    open.disabled = true;
    status.textContent = 'Ouverture du modèle privé…';
    try {
      const [html,scene] = await Promise.all([readSource((received,total) => {
        if (generation !== count || !frame.isConnected || !Number.isFinite(total) || total <= 0) return;
        const percent = Math.max(0, Math.min(100, Math.round(100 * received / total)));
        status.textContent = 'Chargement du modèle privé · '+percent+' %';
      }),privateScene()]);
      if (count !== generation || !frame.isConnected) return;
      const markup = prepareOwnerAvatar(html,text.value,scene);
      if (count !== generation || !frame.isConnected) return;
      // Keep the same lounge poster visible until the sandbox has painted its first frame.
      frame.onload=()=>{if(count===generation){frame.hidden=false;preview.hidden=true;}};
      frame.srcdoc = markup;
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
