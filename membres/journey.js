// Identifiants communs au profil, aux lecteurs et à la sauvegarde du compte.
import { rencontreClips } from './journey-clips.js';

const gameRows = [
  ['marmousets', 'Les Marmousets', 'I', 'arcade-marmousets.html', 'jouable-1-1'],
  ['a410', 'Le départ du lycée', 'I', 'arcade-a410.html', 'jouable-2-1'],
  ['barcelone', 'Barcelone', 'I', 'arcade-catalogne-3d.html', 'jouable-3-1'],
  ['sarajevo', 'Sarajevo', 'II', 'jeu-bosnie.html', 'jouable-4-1'],
  ['danse', 'Le danseur', 'II', 'jeu-danse.html', 'jouable-5-1'],
  ['camarades', 'Camarades !', 'II', 'jeu-manifestation.html', 'jouable-manifestation'],
  ['prison', 'La prison', 'III', 'jeu-yoyo.html', 'jouable-5-2'],
  ['cyrano', 'Cyrano', 'III', 'jeu-cyrano-bd.html', 'jouable-cyrano'],
  ['rencontre', 'Tu veux bien t’occuper de moi ?', 'III', 'jeu-rencontre.html', 'jouable-rencontre'],
  ['stoppub', 'À vos marqueurs !', 'IV', 'jeu-stoppub.html', 'stoppub']
];

export const games = gameRows.map(([id, title, path, file, reader]) => ({id, title, path, url: '/' + file, reader}));
export const scenes = games.map(({id, title, path, reader}, index) => {
  const urls = ['/jeu.html?niveau=1', '/jeu.html?niveau=2', '/jeu.html?niveau=3', '/jeu.html?niveau=4',
    '/jeu.html?niveau=5', '/jeu.html?niveau=5', '/jeu.html#chemin-iii', '/jeu.html#chemin-iii',
    '/jeu.html#chemin-iii', '/jeu.html?scene=stoppub'];
  return {id, title, path, reader, url: urls[index]};
});
for (const [id, title, path] of [['demenagement', 'D’un trottoir à l’autre', 'IV'],
  ['frontiere', 'La frontière', 'IV'], ['rire', 'La faire rire', 'V'], ['traitre', 'Le traître', 'V'],
  ['peguy', 'Le chemin de Péguy', 'V']]) {
  scenes.push({id, title, path, reader: id, url: '/jeu.html?scene=' + id});
}
const filmHost = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3Lv38AaVCD2ic4AgVfvvFo8mRsK/';
const rencontreHost = 'https://d8j0ntlcm91z4.cloudfront.net/user_3Lv38AaVCD2ic4AgVfvvFo8mRsK/';
const r2Host = 'https://treize-chemins-videos.meguiniahmed16.workers.dev/rencontre/';
function film(id, title, game, url, alternate) {
  return {id, title, game, path: games.find(item => item.id === game).path, url, alternate};
}
export const videos = [
  film('marmousets-final', 'Les Marmousets · Les deux frères', 'marmousets', filmHost + '1f185d12-704f-40d6-b1cd-246e28b89625.mp4'),
  film('sarajevo-entree', 'Entrée dans Sarajevo', 'sarajevo', filmHost + '8d950927-36cd-436d-8290-ee90d463a7eb.mp4'),
  film('sarajevo-hommage', 'À Yoyo · Hommage et retour au VAB', 'sarajevo', filmHost + 'f4fd7a27-122d-45fa-9df3-8ca825803eaa.mp4'),
  film('prison-cafe', 'Le café', 'prison', '/assets/prison/le-cafe-16s.mp4'),
  ...rencontreClips.map(([id, title, file]) => film('rencontre-' + id.toLowerCase(), title, 'rencontre', rencontreHost + file, r2Host + file)),
  film('stoppub-intro', 'À vos marqueurs ! · La mission', 'stoppub', '/assets/stoppub/intro-v16.mp4')
];
const collections = {games, videos, scenes};

export function normalizeJourney(input = {}) {
  const result = {};
  for (const [key, catalog] of Object.entries(collections)) {
    const ids = new Set(Array.isArray(input?.[key]) ? input[key] : []);
    result[key] = catalog.filter(item => ids.has(item.id)).map(item => item.id);
  }
  return result;
}
export function mergeJourney(existing, incoming) {
  const first = normalizeJourney(existing), second = normalizeJourney(incoming);
  return normalizeJourney({
    games: [...first.games, ...second.games], videos: [...first.videos, ...second.videos],
    scenes: [...first.scenes, ...second.scenes, ...first.games, ...second.games]
  });
}
const boardKey = 'tectonique-jeu-plateau-v1';
function safeRead(storage, key) {
  try { return JSON.parse((storage || globalThis.localStorage).getItem(key) || 'null'); } catch { return null; }
}
// Run only after an explicit import action. Old saves are left untouched.
export function importDeviceJourney(storage) {
  const board = safeRead(storage, boardKey);
  const played = [], visited = [], watched = [];
  if (board && Array.isArray(board.completed)) {
    // Use the same mapping as ordre-lecture.js for saves predating order version 2.
    const currentOrder = board.orderVersion === 2;
    const oldLevel = n => currentOrder ? n : ({1: 3, 2: 1, 3: 2}[n] || n);
    const bonus = n => board.arcadeBonuses?.[oldLevel(n)] === true;
    const hasAny = arr => Array.isArray(arr) && arr.length > 0;
    const g = board.marmousetsProgress;
    const evidence = {
      marmousets: bonus(1) || hasAny(g?.scared) || hasAny(g?.cleared),
      a410: bonus(2),
      barcelone: board.catalogneFinished || hasAny(board.catalogneSold),
      sarajevo: board.bosnieFinished || hasAny(board.bosniePassed),
      danse: board.danseFinished || hasAny(board.dansePassed),
      camarades: board.rdvManifestationFinished || hasAny(board.rdvManifestationPassed),
      prison: board.yoyoFinished,
      cyrano: board.rdvCyranoFinished || hasAny(board.rdvCyranoPassed),
      rencontre: board.rdvRencontreFinished
    };
    for (const [id, value] of Object.entries(evidence)) if (value) played.push(id);
    const sceneIds = ['marmousets', 'a410', 'barcelone', 'sarajevo'];
    for (let n = 1; n <= sceneIds.length; n++) {
      if (board.completed.includes(oldLevel(n)) || board.tries?.[oldLevel(n)] > 0) visited.push(sceneIds[n - 1]);
    }
    const skips = {'1':'marmousets','2':'a410','3':'barcelone','4':'sarajevo','5:dance':'danse','5:prison':'prison'};
    for (const key of Array.isArray(board.storySkips) ? board.storySkips : []) visited.push(skips[key]);
    for (const n of Array.isArray(board.levelPlates?.[5]?.read) ? board.levelPlates[5].read : []) {
      if (n === 1) visited.push('danse');
      if (n === 2) visited.push('prison');
    }
    if (board.rdvManifestationSkipped) visited.push('camarades');
    if (board.rdvCyranoSkipped) visited.push('cyrano');
    if (board.rdvRencontreSkipped) visited.push('rencontre');
  }
  for (const key of ['tda-rencontre-storyboard-v1', 'tda-rencontre-lecture-directe-v1']) {
    const history = safeRead(storage, key);
    if (Array.isArray(history?.watched)) {
      for (const [shot] of rencontreClips) if (history.watched.includes(shot)) watched.push('rencontre-' + shot.toLowerCase());
    }
  }
  if (watched.length) played.push('rencontre');
  return mergeJourney({}, {games: played, videos: watched, scenes: visited});
}

export const trackingKey = 'tda-membre-suivi-v1';
const memberPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
export function enableJourneyTracking(memberId, storage) {
  if (!memberPattern.test(memberId)) return false;
  try { (storage || globalThis.localStorage).setItem(trackingKey, memberId); return true; } catch { return false; }
}
export function disableJourneyTracking(storage) {
  try { (storage || globalThis.localStorage).removeItem(trackingKey); } catch {}
}
export function trackedMember(storage) {
  try {
    const id = (storage || globalThis.localStorage).getItem(trackingKey);
    return memberPattern.test(id) ? id : null;
  } catch { return null; }
}
