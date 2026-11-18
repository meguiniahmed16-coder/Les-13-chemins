/* Le nuage utilise les mêmes 400 fiches et les mêmes textes que l’atlas. */
(() => {
  'use strict';
  const atlas = window.TreizeAtlasPersonnages;
  const {element} = atlas;
  const turn = 2 * Math.PI;

  function randomIndex(length) {
    const range = 2 ** 32;
    const limit = range - range % length;
    const value = new Uint32Array(1);
    do { crypto.getRandomValues(value); } while (value[0] >= limit);
    return value[0] % length;
  }

  function constellation(people) {
    const shuffled = people.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    return shuffled.map((person, i) => {
      const y = 1 - (2 * i + 1) / shuffled.length;
      return {name: person.name, y, radius: Math.sqrt(1 - y*y),
        angle: i * goldenAngle, phase: Math.random() * turn};
    });
  }

  function create(panel) {
    const bubble = panel.querySelector('.rencontre-bulle');
    const canvas = bubble.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const invite = panel.querySelector('.rencontre-invite');
    const pickedName = panel.querySelector('.rencontre-nom');
    const action = panel.querySelector('.rencontre-action');
    const article = panel.querySelector('.rencontre-portrait');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let active = false, data, stars = [], loading = false, selected = null;
    let width = 0, height = 0, time = 0, lastFrame = 0, frame = 0;
    const widths = new Map();

    function paint() {
      if (!ctx || !width || !height || !stars.length) return;
      ctx.clearRect(0, 0, width, height);
      const rx = width * .45, ry = height * .445;
      const base = Math.min(1.14, Math.max(.84, width / 680));
      const tilt = .18 + .11 * Math.sin(time * .041);
      const cx = width / 2, cy = height / 2;
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      const projected = stars.map(star => {
        const angle = star.angle + time * .068 + .035 * Math.sin(time*.22 + star.phase);
        const rawZ = star.radius * Math.cos(angle);
        const z = rawZ*ct + star.y*st;
        const depth = (z + 1) / 2;
        const x = cx + rx * star.radius * Math.sin(angle);
        const y = cy + ry * (star.y*ct - rawZ*st + .009*Math.sin(time*.3 + star.phase));
        const size = Math.round(base * (10 + 15*depth*depth));
        return {name: star.name, x, y, depth, size};
      }).sort((a,b) => b.depth - a.depth);
      // Give foreground names space; other names come into view as the sphere turns.
      const placed = [];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const word of projected) {
        const {name, x, y, depth, size} = word;
        const weight = depth > .77 ? '600' : '400';
        ctx.font = weight+' '+size+'px "Cormorant Garamond", Georgia, serif';
        const key = ctx.font + '|' + name;
        if (!widths.has(key)) widths.set(key, ctx.measureText(name).width);
        const half = widths.get(key)/2 + 4;
        if (x-half < 3 || x+half > width-3) continue;
        if (placed.some(p => Math.abs(p.x-x) < p.half+half && Math.abs(p.y-y) < (p.size+size)*.53+2)) continue;
        placed.push({x,y,half,size});
        ctx.globalAlpha = .30 + .70*depth;
        ctx.fillStyle = depth > .88 ? '#253f35' : depth > .58 ? '#685039' : '#6c705a';
        ctx.fillText(name,x,y);
      }
      ctx.globalAlpha = 1;
    }

    function measure() {
      if (!active) return;
      width = canvas.clientWidth; height = canvas.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width*ratio); canvas.height = Math.round(height*ratio);
      ctx?.setTransform(ratio,0,0,ratio,0,0); paint();
    }
    function tick(now) {
      if (!lastFrame || now - lastFrame >= 42) {
        if (lastFrame) time += Math.min(now-lastFrame,150)/1000;
        lastFrame = now; paint();
      }
      frame = requestAnimationFrame(tick);
    }
    function animate() {
      cancelAnimationFrame(frame); lastFrame = 0;
      if (ctx && active && data && !selected && !document.hidden && !motion.matches) {
        frame = requestAnimationFrame(tick);
      }
    }
    const resize = new ResizeObserver(measure);
    resize.observe(canvas);
    motion.addEventListener('change',animate);
    document.addEventListener('visibilitychange',animate);
    document.fonts?.ready.then(()=>{widths.clear();if(active)paint();});

    function restart(moveFocus=true) {
      selected = null; pickedName.hidden = true; action.hidden = true; article.hidden = true;
      panel.classList.remove('a-choisi'); bubble.disabled = false;
      invite.textContent = 'Touchez le nuage pour rencontrer un personnage.';
      measure();animate();
      if (moveFocus) bubble.focus({preventScroll:true});
    }
    async function load() {
      if (loading || data) return;
      loading = true; action.hidden = true; invite.textContent = 'Chargement du nuage…';
      try {
        data = await atlas.directory();
        stars = constellation(data.people);
        restart(false);
      } catch {
        invite.textContent = 'Le nuage n’a pas pu se charger.';
        action.textContent = 'Réessayer'; action.hidden = false;
      } finally { loading = false; }
    }
    async function story(person, holder) {
      try {
        const paragraphs = (await atlas.portraits())[person.id];
        if (!paragraphs?.length) throw Error();
        holder.replaceChildren(...paragraphs.map(text=>element('p','',text)));
      } catch {
        holder.replaceChildren(element('p','','Le texte n’a pas pu se charger.'),
          atlas.button('Réessayer',()=>story(person,holder),'rencontre-action'));
      }
    }
    function pick() {
      if (!data || selected) return;
      const person = data.people[randomIndex(data.people.length)];
      selected = person; animate();
      pickedName.textContent = person.name; pickedName.hidden = false;
      panel.classList.add('a-choisi'); bubble.disabled = true;
      invite.textContent = 'Votre rencontre'; action.textContent = 'Relancer le nuage'; action.hidden = false;
      const title = element('h2','',person.name); title.tabIndex = -1;
      const chapters = Object.entries(data.chapters).filter(([,ids])=>ids.includes(person.id)).map(([n])=>n);
      const chapterLabel = chapters.length===1?'Chapitre ':'Chapitres ';
      const references = element('div','rencontre-reperes');
      references.append(element('h3','','Dans le livre'),element('p','',chapterLabel+chapters.join(', ')));
      const list = element('ul','');
      for (const place of person.places) {
        const where = element('li','');
        where.append(element('span','',place.place+(place.mode?' · '+place.mode:'')),
          element('span','rencontre-pages','p. '+place.pages));
        list.append(where);
      }
      references.append(list);
      const prose = element('div','rencontre-prose','Chargement du texte…');
      article.replaceChildren(element('p','rencontre-numero','Atlas · Nº '+atlas.number(person.id)),
        title, element('p','rencontre-role',person.role),references,element('h3','','Sa continuité'),prose);
      article.hidden = false; title.focus({preventScroll:true});
      if (matchMedia('(max-width:700px)').matches) title.scrollIntoView({block:'nearest'});
      story(person,prose);
    }
    bubble.addEventListener('click',pick);
    action.addEventListener('click',()=>{if(data)restart();else load();});
    return {setActive(value){
      active = value;
      if(active){if(!data)load();measure();}
      animate();
    }};
  }
  window.TreizeRencontre = {create};
})();
