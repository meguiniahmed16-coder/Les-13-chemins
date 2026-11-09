import { createHash, randomBytes, generateKeyPairSync, privateDecrypt, createDecipheriv, constants as cryptoConstants } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

// Only encrypted transfer instructions enter Git. Documents remain in the
// existing private store, and reader/owner authentication is unchanged.
const PART = 3 * 1024 * 1024;
const ALLOWED = new Set([
  'La_tectonique_des_ames_V16.docx', 'La_tectonique_des_ames_V16.pdf',
  'La_tectonique_des_ames_V17.docx', 'La_tectonique_des_ames_V17.pdf',
  'Toutes_les_fiches_de_continuite.docx', 'Toutes_les_fiches_de_continuite.pdf',
  'La_tectonique_des_ames_Journal_des_modifications.xlsx',
]);
const hash = (bytes, algo = 'sha256') => createHash(algo).update(bytes).digest('hex');
const production = () => process.env.CONTEXT === 'production' && process.env.BRANCH === 'main';
const receiptPath = resolve('.netlify/editorial-sync-receipt.json');
const keyPath = resolve('.netlify/editorial-sync-public-key.json');

export async function ensureKey(control) {
  let pair = await control.get('key-v1', { type: 'json' });
  if (!pair) {
    const keys = generateKeyPairSync('rsa', {
      modulusLength: 3072,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    await control.setJSON('key-v1', { ...keys, keyId: hash(keys.publicKey) }, { onlyIfNew: true });
    pair = await control.get('key-v1', { type: 'json' });
  }
  if (!pair?.privateKey || !pair?.publicKey || pair.keyId !== hash(pair.publicKey)) throw new Error('Clé de transfert invalide.');
  return pair;
}

export function openEnvelope(envelope, pair) {
  if (envelope?.version !== 1 || envelope.keyId !== pair.keyId) throw new Error('Enveloppe de transfert invalide.');
  const key = privateDecrypt({ key: pair.privateKey, oaepHash: 'sha256', padding: cryptoConstants.RSA_PKCS1_OAEP_PADDING }, Buffer.from(envelope.wrappedKey, 'base64'));
  const iv = Buffer.from(envelope.iv, 'base64'), tag = Buffer.from(envelope.tag, 'base64');
  if (key.length !== 32 || iv.length !== 12 || tag.length !== 16) throw new Error('Enveloppe de transfert invalide.');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAAD(Buffer.from('treize-chemins/editorial-sync/v1'));
  decipher.setAuthTag(tag);
  const clear = Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, 'base64')), decipher.final()]);
  if (clear.length > 64000) throw new Error('Instructions trop volumineuses.');
  return JSON.parse(clear.toString('utf8'));
}

function validateManifest(manifest, now) {
  if (!manifest || !/^[a-zA-Z0-9_-]{8,80}$/.test(manifest.batchId || '') || !Array.isArray(manifest.files) || manifest.files.length !== ALLOWED.size) throw new Error('Lot éditorial incomplet.');
  if (!Number.isFinite(Date.parse(manifest.expiresAt)) || Date.parse(manifest.expiresAt) < now || Date.parse(manifest.expiresAt) > now + 86400000) throw new Error('Lot éditorial expiré.');
  let total = 0;
  const names = new Set();
  for (const file of manifest.files) {
    if (!ALLOWED.has(file.name) || names.has(file.name) || !/^[a-f0-9]{32}$/.test(file.md5 || '') || !Number.isInteger(file.bytes) || file.bytes < 4 || file.bytes > 200000000) throw new Error('Document éditorial invalide.');
    if (!Number.isFinite(Date.parse(file.updatedAt))) throw new Error('Date source invalide.');
    names.add(file.name); total += file.bytes;
    const url = new URL(file.url);
    if (url.protocol !== 'https:' || url.username || url.password || !url.hostname.endsWith('.oaiusercontent.com')) throw new Error('Source de transfert refusée.');
  }
  if (total > 400000000) throw new Error('Lot éditorial trop volumineux.');
}

export async function synchronize({ manifest, store, control, fetcher = fetch, now = Date.now() }) {
  // A completed batch is never replayed, even after temporary URLs expire.
  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(manifest?.batchId || '')) throw new Error('Identifiant du lot invalide.');
  const previousReceipt = await control.get('receipts/' + manifest.batchId, { type: 'json' });
  if (previousReceipt?.state === 'complete') return previousReceipt;
  validateManifest(manifest, now);
  const snapshot = await store.getWithMetadata('catalog-v1', { type: 'json' });
  if (!snapshot?.etag || !Array.isArray(snapshot.data?.files)) throw new Error('Catalogue privé introuvable.');
  const previousByName = new Map();
  for (const file of manifest.files) {
    const matches = snapshot.data.files.filter(item => item.name === file.name);
    if (matches.length !== 1) throw new Error('Correspondance de document non unique.');
    previousByName.set(file.name, matches[0]);
  }
  // Begin signed downloads together, before their short validity ends.
  const downloaded = await Promise.all(manifest.files.map(async file => {
    const response = await fetcher(file.url, { redirect: 'error', signal: AbortSignal.timeout(180000) });
    if (!response.ok) throw new Error('Téléchargement source impossible.');
    const reader = response.body.getReader();
    const chunks = []; let size = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > file.bytes) throw new Error('Taille source inattendue.');
        chunks.push(Buffer.from(value));
      }
    } finally { await reader.cancel().catch(() => {}); }
    const bytes = Buffer.concat(chunks);
    if (bytes.length !== file.bytes || hash(bytes, 'md5') !== file.md5) throw new Error('Intégrité source invalide.');
    const pdf = file.name.endsWith('.pdf');
    if (pdf ? bytes.subarray(0, 5).toString() !== '%PDF-' : bytes.readUInt32LE(0) !== 0x04034b50) throw new Error('Format du document invalide.');
    return { source: file, bytes, sha256: hash(bytes) };
  }));
  const replacements = new Map();
  for (const { source, bytes, sha256 } of downloaded) {
    const previous = previousByName.get(source.name);
    if (previous.sha256 === sha256) { replacements.set(source.name, previous); continue; }
    if (Date.parse(previous.updatedAt) > Date.parse(source.updatedAt)) throw new Error('Une version plus récente existe dans le catalogue.');
    const id = randomBytes(16).toString('hex'), parts = [];
    for (let offset = 0, part = 0; offset < bytes.length; offset += PART, part++) {
      const chunk = bytes.subarray(offset, offset + PART), digest = hash(chunk);
      const key = `files/${id}/${part}`;
      await store.set(key, chunk, { metadata: { sha256: digest, bytes: chunk.length }, onlyIfNew: true });
      const saved = await store.get(key, { type: 'arrayBuffer' });
      if (!saved || hash(Buffer.from(saved)) !== digest) throw new Error('Vérification du document téléversé échouée.');
      parts.push(digest);
    }
    replacements.set(source.name, { ...previous, id, bytes: bytes.length, sha256, parts, updatedAt: source.updatedAt });
  }
  const catalog = { ...snapshot.data, updatedAt: new Date(now).toISOString(), files: snapshot.data.files.map(file => replacements.get(file.name) || file) };
  const changed = await store.setJSON('catalog-v1', catalog, { onlyIfMatch: snapshot.etag });
  if (!changed.modified) throw new Error('Le catalogue a changé ; aucun remplacement publié par ce lot.');
  const saved = await store.get('catalog-v1', { type: 'json' });
  if (downloaded.some(file => saved.files.find(item => item.name === file.source.name)?.sha256 !== file.sha256)) throw new Error('Vérification finale du catalogue échouée.');
  const receipt = { version: 1, batchId: manifest.batchId, state: 'complete', count: downloaded.length, completedAt: new Date().toISOString(), digests: downloaded.map(file => ({ sha256: file.sha256, md5: file.source.md5, bytes: file.bytes.length })) };
  await control.setJSON('receipts/' + manifest.batchId, receipt);
  return receipt;
}

export async function onPreBuild() {
  if (!production()) return;
  await mkdir(resolve('.netlify'), { recursive: true });
  try {
    const { getStore } = await import('@netlify/blobs');
    const control = getStore({ name: 'editorial-sync-control-v1', consistency: 'strong' });
    const pair = await ensureKey(control);
    // Public encryption material only: no private key, URL or credential.
    await writeFile(keyPath, JSON.stringify({ version: 1, keyId: pair.keyId, publicKey: pair.publicKey }));
    let raw;
    try { raw = await readFile(resolve('editorial-sync.envelope.json'), 'utf8'); }
    catch (error) { if (error.code === 'ENOENT') return; throw error; }
    if (raw.length > 100000) throw new Error('Enveloppe trop volumineuse.');
    const manifest = openEnvelope(JSON.parse(raw), pair);
    const receipt = await synchronize({ manifest, control, store: getStore({ name: 'editorial-private-v1', consistency: 'strong' }) });
    await writeFile(receiptPath, JSON.stringify(receipt));
    console.log('Documents privés synchronisés et relus : ' + receipt.count + '.');
  } catch (error) {
    // Do not print upstream errors that might echo temporary credentials.
    throw new Error('Synchronisation éditoriale non confirmée. Aucun code ni droit d’accès modifié ; contrôler le reçu avant d’annoncer la réussite.');
  }
}

export async function onPostBuild({ constants }) {
  if (!production()) return;
  await mkdir(constants.PUBLISH_DIR, { recursive: true });
  for (const [source, name] of [[keyPath, 'editorial-sync-key.json'], [receiptPath, 'editorial-sync-receipt.json']]) {
    try { await writeFile(resolve(constants.PUBLISH_DIR, name), await readFile(source)); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}
