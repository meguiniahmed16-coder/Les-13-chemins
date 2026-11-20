import {games, scenes, videos, mergeJourney, trackedMember} from './journey.js';

const byPage = new Map(games.map(game => [game.url.split('/').pop(), game.id]));
byPage.set('arcade-catalogne.html', 'barcelone');
byPage.set('jeu-cyrano.html', 'cyrano');
const playControls = {
  marmousets: '#startGame,#takeControl,#play,#again,#gallop,#yellow,#red',
  a410: '[data-action="start"],#tap,#special',
  barcelone: '#start,#dodge,#sell,#retry',
  sarajevo: '#joystick,#crouch,#observe',
  danse: '#start,#resume,#retry,#replay',
  camarades: '#start,#replay,#freeWalk,#yellow,#red',
  prison: '#start,#action,#skip-tour',
  cyrano: '#start,#begin,#next,#playPause,#toLetters,#evaluate,#validate',
  rencontre: '#choices button,#standaloneStart,#nextMovie,#replayScene',
  stoppub: '#start,#approach,#poster-action,#stick,#marker,#spray'
};
function pageVisible() {
  if (document.hidden) return false;
  try {
    const dialog = window.frameElement?.closest('dialog');
    return !dialog || dialog.open;
  } catch { return false; }
}

export function installJourneyRecorder(notify) {
  const controller = new AbortController();
  const {signal} = controller;
  const fresh = new Set();
  function record(key, id) {
    if (!id || !pageVisible() || fresh.has(key + '/' + id)) return;
    fresh.add(key + '/' + id);
    notify(mergeJourney({}, {[key]: [id]}));
  }
  const filename = location.pathname.split('/').pop();
  const name = filename.endsWith('.html') ? filename : filename + '.html';
  const current = byPage.get(name);
  if (current) {
    const controls = playControls[current];
    const checkPlay = e => {
      if (e.isTrusted && !e.target.closest?.(':disabled,[hidden]') && e.target.closest?.(controls)) record('games', current);
    };
    document.addEventListener('click', checkPlay, {capture: true, signal});
    if (current === 'sarajevo' || current === 'stoppub')
      document.addEventListener('pointerdown', checkPlay, {capture: true, signal});
    if (current === 'sarajevo') document.addEventListener('keydown', e => {
      if (e.isTrusted && !e.repeat && !e.altKey && !e.metaKey && !e.ctrlKey
          && !document.querySelector('#cinema:not([hidden])')
          && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','c','b'].includes(e.key)) record('games', current);
    }, {signal});
    const movieByURL = new Map();
    for (const item of videos.filter(item => item.game === current)) {
      for (const url of [item.url, item.alternate].filter(Boolean))
        movieByURL.set(new URL(url, location.origin).href, item.id);
    }
    if (movieByURL.size) document.addEventListener('timeupdate', e => {
      const media = e.target;
      if (media.tagName !== 'VIDEO' || media.id === 'stageFrame' || media.paused || media.currentTime < 0.5
          || media.closest('[hidden],dialog:not([open])') || !media.getClientRects().length) return;
      const url = media.currentSrc || media.src;
      if (url) record('videos', movieByURL.get(url));
    }, {capture: true, signal});
  }

  if (name === 'jeu.html' || name === 'carte.html') {
    const byReader = new Map(scenes.map(scene => [scene.reader, scene.id]));
    let readerObserver;
    const observeReader = () => {
      const reader = document.getElementById('upcomingReader');
      if (!reader || readerObserver) return;
      function opened() {
        if (!reader.open) return;
        const pane = reader.querySelector('[data-upcoming-scene]:not([hidden])');
        record('scenes', byReader.get(pane?.dataset.upcomingScene));
      }
      readerObserver = new MutationObserver(opened);
      readerObserver.observe(reader, {subtree: true, childList: true, attributes: true, attributeFilter: ['open', 'hidden']});
      opened();
    };
    const initial = new MutationObserver(() => {
      observeReader();
      if (readerObserver) initial.disconnect();
    });
    observeReader();
    if (!readerObserver) initial.observe(document.body, {childList: true});
    signal.addEventListener('abort', () => { initial.disconnect(); readerObserver?.disconnect(); });
  }
  return () => controller.abort();
}

// The authenticated server compares memberId with its HttpOnly session. The local
// value opts this browser into recording and does not grant access to an account.
export function trackCurrentMember(memberId) {
  let pending = {}, sending = false, timer;
  const more = () => Object.values(pending).some(values => values.length);
  const controller = new AbortController();
  const {signal} = controller;
  async function flush() {
    if (!more() || sending || signal.aborted || trackedMember() !== memberId) return;
    clearTimeout(timer);
    const batch = pending;
    sending = true;
    pending = {};
    try {
      const response = await fetch('/api/membres/journey', {
        method: 'POST', headers: {'content-type': 'application/json'}, credentials: 'same-origin',
        body: JSON.stringify({memberId, ...batch}), keepalive: true
      });
      if ([401, 403, 409].includes(response.status)) { stop(); return; }
      if (!response.ok) throw new Error('journey');
    } catch {
      if (!signal.aborted) pending = mergeJourney(pending, batch);
    } finally {
      sending = false;
      if (!signal.aborted && more() && trackedMember() === memberId) timer = setTimeout(flush, 12000);
    }
  }
  const remove = installJourneyRecorder(event => {
    if (trackedMember() !== memberId) { stop(); return; }
    pending = mergeJourney(pending, event);
    clearTimeout(timer);
    timer = setTimeout(flush, 200);
  });
  function stop() { clearTimeout(timer); pending = {}; controller.abort(); remove(); }
  document.addEventListener('visibilitychange', () => { if (document.hidden) void flush(); }, {signal});
  window.addEventListener('pagehide', flush, {signal});
  window.addEventListener('online', flush, {signal});
  window.addEventListener('storage', () => { if (trackedMember() !== memberId) stop(); }, {signal});
  return stop;
}
if (typeof document !== 'undefined') {
  const id = trackedMember();
  if (id) trackCurrentMember(id);
}
