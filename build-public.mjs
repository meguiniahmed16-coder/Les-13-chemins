import { copyFile, lstat, mkdir, readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const root = fileURLToPath(new URL('./', import.meta.url));
const output = join(root, 'dist');
// Liste fermée : aucun autre document du dépôt n'est copié sur le site.
const publicFiles = [
  'index.html',
  'carte.html',
  'jeu.html',
  'lecture.html',
  'mode_emploi.html',
  'mode_emploi_treize_chemins.html',
  'passages.json',
  'arcade-a410.html',
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
  if (name.endsWith('.mp3')) continue;
  const content = await readFile(source, 'utf8');
  if (/https?:\/\/(?:docs|drive)\.google\.com\//i.test(content)) {
    throw new Error('Lien vers un document de travail interdit dans : ' + name);
  }
}

await mkdir(output);
for (const name of publicFiles) {
  await mkdir(dirname(join(output, name)), { recursive: true });
  await copyFile(join(root, name), join(output, name));
}
console.log('Build public : ' + publicFiles.length + ' fichiers vérifiés dans dist/.');
