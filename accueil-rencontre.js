/* Le premier toucher tire une personne dans le répertoire intégral de l’atlas. */
(() => {
  'use strict';
  const panel = document.getElementById('home-meeting');
  const atlas = window.TreizeAtlasPersonnages;
  const randomIndex = window.TreizeRencontre?.randomIndex;
  if (!panel || !atlas || !randomIndex) return;

  // Le lien reste une entrée dans l’atlas si JavaScript ne peut pas initialiser le nuage.
  const link = panel.querySelector('.meeting-draw');
  const draw = document.createElement('button');
  draw.type = 'button';
  draw.className = link.className;
  draw.setAttribute('aria-labelledby','meeting-title');
  draw.setAttribute('aria-describedby','meeting-invite');
  draw.setAttribute('aria-controls','meeting-result');
  draw.append(...Array.from(link.childNodes));
  link.replaceWith(draw);

  const result = panel.querySelector('.meeting-result');
  result.id = 'meeting-result';
  const status = panel.querySelector('.meeting-status');
  const names = [...draw.querySelectorAll('.meeting-names i')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let busy = false;
  let previous = null;

  function fillCloud(people) {
    const pool = [...new Set(people.map(p=>p.name.split(' ')[0]))];
    for (const label of names) {
      const i = randomIndex(pool.length);
      label.textContent = pool[i];
      pool.splice(i,1);
    }
  }
  function slowDown() {
    if (motion.matches || document.hidden) return Promise.resolve();
    const animations = names.flatMap(n=>n.getAnimations?.() || []);
    return new Promise(resolve=>{
      const start = performance.now();
      const timer = setInterval(()=>{
        const remaining = Math.max(0,1-(performance.now()-start)/520);
        for (const a of animations) a.playbackRate = remaining*remaining;
        if (!remaining || motion.matches || document.hidden) {
          clearInterval(timer);resolve();
        }
      },32);
    });
  }
  async function pick() {
    if (busy) return;
    busy = true;
    if (!result.hidden) {
      result.hidden = true;draw.hidden = false;draw.focus({preventScroll:true});
      for (const label of names) for (const a of label.getAnimations?.() || []) a.playbackRate=1;
    }
    draw.setAttribute('aria-busy','true');
    panel.classList.add('is-drawing');
    status.textContent = '';
    try {
      const [data] = await Promise.all([atlas.directory(),slowDown()]);
      const eligible = previous == null ? data.people : data.people.filter(p=>p.id!==previous);
      const person = eligible[randomIndex(eligible.length)];
      const title = atlas.element('h2','',person.name); title.id = 'meeting-person';title.tabIndex = -1;
      const actions = atlas.element('div','meeting-actions');
      actions.append(atlas.discussButton(person,data),
        atlas.button('Sa fiche',()=>atlas.show(person,data),'meeting-textbutton'),
        atlas.button('Une autre rencontre',pick,'meeting-textbutton'));
      result.replaceChildren(title,atlas.element('p','',person.role),actions);
      previous = person.id;
      draw.hidden = true;result.hidden = false;
      title.focus({preventScroll:true});
    } catch {
      status.replaceChildren(document.createTextNode('Le nuage n’a pas pu se charger. '));
      const fallback = atlas.element('a','','Ouvrir l’atlas');fallback.href=link.href;
      status.append(fallback);
      for (const label of names) for (const a of label.getAnimations?.() || []) a.playbackRate=1;
    } finally {
      busy = false;draw.removeAttribute('aria-busy');panel.classList.remove('is-drawing');
    }
  }
  draw.addEventListener('click',pick);
  atlas.directory().then(data=>{if(!busy && !previous)fillCloud(data.people);}).catch(()=>{});
})();
