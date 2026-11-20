import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {games, videos, scenes, normalizeJourney, mergeJourney, importDeviceJourney, enableJourneyTracking, disableJourneyTracking, trackedMember} from './journey.js';
const storage = records => ({
  getItem: key => records.get(key),
  setItem: (key, value) => records.set(key, value),
  removeItem: key => records.delete(key)
});
const board = 'tectonique-jeu-plateau-v1';
test('Only playable games appear; every checked-in video matches the source catalog', () => {
  assert.equal(games.length, 10);
  assert.equal(scenes.length, 15);
  assert.equal(videos.length, 27);
  const manifest = JSON.parse(readFileSync(new URL('../migration/r2-videos-manifest.json', import.meta.url)));
  for (const clip of manifest.items) {
    const video = videos.find(item => item.id === 'rencontre-' + clip.id.toLowerCase());
    assert.equal(video.url, clip.sourceUrl);
    assert.equal(video.title, clip.label);
    assert.ok(video.alternate.endsWith('/' + clip.objectKey));
  }
});
test('unknown activity, client URLs and duplicate IDs never survive a merge', () => {
  const own = {games: ['cyrano'], scenes: ['rire']};
  assert.deepEqual(mergeJourney(own, {
    games: ['cyrano', 'frontiere', 'https://example.invalid'], videos: ['stoppub-intro'], scenes: null
  }), {games: ['cyrano'], videos: ['stoppub-intro'], scenes: ['cyrano', 'rire']});
  assert.deepEqual(normalizeJourney(null), {games: [], scenes: [], videos: []});
});
test('legacy import respects the old scene order; skipping a scene does not mark the game as played', () => {
  const raw = JSON.stringify({completed: [1], arcadeBonuses: {1:true}, storySkips: ['4'], rdvCyranoSkipped: true, dansePending: {id: 'reserved'}});
  const old = storage(new Map([[board, raw], ['tda-rencontre-storyboard-v1', JSON.stringify({watched: ['C01', 'bogus']})]]));
  assert.deepEqual(importDeviceJourney(old), {
    games: ['a410','rencontre'], videos: ['rencontre-c01'], scenes: ['a410','sarajevo','cyrano','rencontre']
  });
  assert.equal(old.getItem(board), raw);
});
test('malformed records and separate accounts are handled without leaking prior history', () => {
  const s = storage(new Map([[board, 'broken']]));
  assert.deepEqual(importDeviceJourney(s), {games: [], scenes: [], videos: []});
  assert.equal(trackedMember(s), null);
  const uuid = '0a92bcbd-3b81-49c0-90bc-40ca270c4aab';
  assert.equal(enableJourneyTracking('not-a-member', s), false);
  assert.equal(enableJourneyTracking(uuid, s), true);
  assert.equal(trackedMember(s), uuid);
  disableJourneyTracking(s);
  assert.equal(trackedMember(s), null);
});
test('recorder ignores opening a game and binds a real play control to one authenticated POST', async t => {
  const {trackCurrentMember} = await import('./journey-recorder.js');
  const memberId = '0a92bcbd-3b81-49c0-90bc-40ca270c4aab';
  const browserStore = storage(new Map());
  enableJourneyTracking(memberId, browserStore);
  const handlers = new Map(), posts = [];
  const window = new EventTarget();
  const document = {hidden: false, addEventListener: (type, fn) => handlers.set(type, fn)};
  const globals = {document, window, location: new URL('https://exemple.fr/jeu-cyrano-bd.html'),
    localStorage: browserStore, fetch: async (url, options) => {
      posts.push({url, body: JSON.parse(options.body), credentials: options.credentials});
      return new Response('{}');
    }};
  for (const [key, value] of Object.entries(globals)) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, {configurable: true, value});
    t.after(() => { if (original) Object.defineProperty(globalThis, key, original); else delete globalThis[key]; });
  }
  const end = trackCurrentMember(memberId);
  t.after(end);
  const play = {isTrusted: true, target: {closest: selector => selector.includes('#start') ? {} : null}};
  assert.equal(posts.length, 0);
  handlers.get('click')({...play, isTrusted: false});
  window.dispatchEvent(new Event('pagehide'));
  assert.equal(posts.length, 0);
  handlers.get('click')(play);
  window.dispatchEvent(new Event('pagehide'));
  assert.deepEqual(posts, [{url: '/api/membres/journey', credentials: 'same-origin', body: {
    memberId, games: ['cyrano'], videos: [], scenes: ['cyrano']
  }}]);
  handlers.get('click')(play);
  window.dispatchEvent(new Event('pagehide'));
  assert.equal(posts.length, 1);
});
