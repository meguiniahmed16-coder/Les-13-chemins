import { copyFile, lstat, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const root = fileURLToPath(new URL('./', import.meta.url));
const output = join(root, 'dist');
// Production must not reuse a stale 3D hand mesh or a stale pre-bundled animation.
// Regenerate, verify grip geometry, and bundle the playable scene before copying it to dist/.
const run = promisify(execFile);
for (const args of [
  ['build-yoyo-hands.mjs'],
  ['--test', 'yoyo.test.mjs'],
  ['build-yoyo.mjs'],
]) {
  const { stdout, stderr } = await run(process.execPath, args, { cwd: root, maxBuffer: 4 * 1024 * 1024 });
  if (stdout.trim()) console.log(stdout.trim());
  if (stderr.trim()) console.error(stderr.trim());
}
// Liste fermée : aucun autre document du dépôt n'est copié sur le site.
const publicFiles = [
  'index.html',
  'presentation.html',
  'carte.html',
  'jeu.html',
  'lecture.html',
  'mode_emploi.html',
  'mode_emploi_treize_chemins.html',
  'passages.json',
  'contact.html',
  'admin.html',
  'admin.js',
  'identity-callback.js',
  'admin.css',
  'editeurs.html',
  'editeurs.js',
  'editorial.css',
  'arcade-a410.html',
  'arcade-catalogne.html',
  'arcade-marmousets.html',
  'jeu-bosnie.html',
  'bosnie-runtime.js',
  'jeu-danse.html',
  'danse-runtime.js',
  'jeu-yoyo.html',
  'yoyo-runtime.js',
  'hand-right.glb',
  'hand-right-LICENSE.txt',
  'plateaux-core.js',
  'plateaux.js',
  'voyage.js',
  'escale.js',
  'plateau-mobile.webp',
  'plateau-large.webp',
];

if (process.env.CONTEXT === 'production' && process.env.BRANCH !== 'main') {
  throw new Error('La production doit être déployée depuis la branche main.');
}

// Recréer la sortie supprime aussi les fichiers résiduels d'un ancien build.
await rm(output, { recursive: true, force: true });
for (const name of publicFiles) {
  const source = join(root, name);
  const stat = await lstat(source);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error('Fichier public non régulier : ' + name);
  }
  if (/\.(?:mp3|webp|glb)$/.test(name)) continue;
  const content = await readFile(source, 'utf8');
  if (/https?:\/\/(?:docs|drive)\.google\.com\//i.test(content)) {
    throw new Error('Lien vers un document de travail interdit dans : ' + name);
  }
}

// Build one coherent arrival dataset from the approved public passages.
const stops = JSON.parse(await readFile(join(root, 'lieux-etapes.json'), 'utf8'));
const passages = JSON.parse(await readFile(join(root, 'passages.json'), 'utf8'));
// Only this reader-facing selection is public, never the source workshop documents.
const workshops = JSON.parse(await readFile(join(root, 'ateliers-publics.json'), 'utf8'));
for (const profile of workshops) {
  if (!profile.id || !profile.name || !profile.paragraphs?.length || !profile.paragraphs.every(p => typeof p === 'string' && p.trim()) || !profile.levels?.every(n => Number.isInteger(n) && n >= 1 && n <= 13)) throw new Error('Atelier public incomplet.');
}
if (stops.length !== 13 || passages.length !== 13) throw new Error('Treize étapes sont requises.');
const extraBoards = JSON.parse(await readFile(join(root, 'plateaux-data.json'), 'utf8'));
if (/https?:\/\/(?:docs|drive)\.google\.com\//i.test(JSON.stringify(extraBoards))) throw new Error('Document privé dans les plateaux.');
for (const b of extraBoards) {
 if (!stops.some(s => s.level === b.level) || !Number.isInteger(b.plateau) || b.plateau < 2 || !b.passage?.quote || b.coordinates?.length !== 2 || !b.coordinates.every(Number.isFinite)) throw new Error('Plateau incomplet.');
}
const arrivalData = stops.map((stop, i) => {
  const passage = passages.find(p => p.level === stop.level);
  if (stop.level !== i + 1 || !passage?.quote || stop.coordinates.length !== 2 || !stop.coordinates.every(Number.isFinite) || !Number.isFinite(stop.altitude) || !Array.isArray(stop.characters) || !stop.characters.every(name => typeof name === 'string' && name.trim())) throw new Error('Étape incomplète : ' + (i + 1));
  const characters = workshops.filter(profile => profile.levels.includes(stop.level));
  if (characters.some(profile => !stop.characters.includes(profile.name))) throw new Error('Atelier sans personnage correspondant : ' + stop.level);
  const base = {...stop, passage, workshops: characters};
  const extra = extraBoards.filter(b => b.level === stop.level).sort((a,b) => a.plateau-b.plateau);
  if (extra.some((b,i) => b.plateau !== i+2)) throw new Error('Plateaux non consécutifs.');
  return {...base, plateaux:[{...base,plateau:1},...extra]};
});
await mkdir(output);
await writeFile(join(output, 'etapes-data.js'), 'window.TreizeEtapesData=' + JSON.stringify(arrivalData).replace(/</g, '\\u003c') + ';\n');
for (const name of publicFiles) {
  await mkdir(dirname(join(output, name)), { recursive: true });
  await copyFile(join(root, name), join(output, name));
}
console.log('Build public : ' + (publicFiles.length + 1) + ' fichiers vérifiés dans dist/.');

// Server code is packaged separately; private documents are never build inputs.
await mkdir(join(root, '.netlify/functions'), { recursive: true });
await copyFile(join(root, 'editor-api.mjs'), join(root, '.netlify/functions/editor.mjs'));
