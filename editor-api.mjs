import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { getStore } from '@netlify/blobs';

// This module is deployed as a server function, never copied into dist/.
// Documents and their catalogue live exclusively in private Netlify Blobs.
const ORIGIN = 'https://tectonique-des-ames.netlify.app';
const COOKIE = '__Host-editor';
const SESSION_SECONDS = 4 * 60 * 60;
const PART_BYTES = 3 * 1024 * 1024;
const HEX = /^[a-f0-9]{64}$/;
const ID = /^[a-f0-9]{32}$/;
const headers = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Netlify-CDN-Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  Vary: 'Cookie',
};
export const digest = value => createHash('sha256').update(value).digest('hex');
const matches = (value, expected) => typeof expected === 'string' && HEX.test(expected) && timingSafeEqual(Buffer.from(digest(value), 'hex'), Buffer.from(expected, 'hex'));
const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8', ...extra } });
const cookie = (value, age) => `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
const cookieToken = request => (request.headers.get('cookie') || '').split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1) || '';
async function smallJSON(request, limit = 150000) {
  if (Number(request.headers.get('content-length') || 0) > limit) throw new Error('body');
  const body = await request.text();
  if (Buffer.byteLength(body) > limit) throw new Error('body');
  return JSON.parse(body);
}
function cleanCatalog(value) {
  if (!value || !Array.isArray(value.files) || !value.files.length || value.files.length > 120) throw new Error('catalog');
  const seen = new Set();
  const files = value.files.map(f => {
    if (!ID.test(f.id) || seen.has(f.id) || !Number.isInteger(f.bytes) || f.bytes < 1 || f.bytes > 200000000 || !HEX.test(f.sha256)) throw new Error('file');
    seen.add(f.id);
    if (!Array.isArray(f.parts) || f.parts.length !== Math.ceil(f.bytes / PART_BYTES) || f.parts.some(s => !HEX.test(s))) throw new Error('parts');
    if (!['Manuscrits', 'Cartes et atlas', 'Présentation', 'Méthodes et révisions', 'Personnages et repères'].includes(f.category)) throw new Error('category');
    if (typeof f.name !== 'string' || f.name.length > 180 || /[\\/\x00-\x1f]/.test(f.name) || !/\.(pdf|docx|xlsx|txt)$/.test(f.name)) throw new Error('name');
    if (typeof f.title !== 'string' || !f.title || f.title.length > 180 || typeof f.mime !== 'string' || !/^[a-z0-9.+/-]+$/.test(f.mime)) throw new Error('title');
    return { id: f.id, name: f.name, title: f.title, mime: f.mime, category: f.category, bytes: f.bytes, parts: f.parts, sha256: f.sha256, updatedAt: String(f.updatedAt || '').slice(0, 35) };
  });
  return { updatedAt: new Date().toISOString(), files };
}

export function createHandler({ openStore, configuration, now = Date.now } = {}) {
  return async (request, context = {}) => {
    try {
      const url = new URL(request.url);
      if (url.origin !== ORIGIN) return json({ error: 'Accès indisponible sur cette adresse.' }, 403);
      const cfg = configuration ? configuration() : JSON.parse(process.env.EDITOR_CONFIG || '{}');
      if (!HEX.test(cfg.accessHash || '') || !HEX.test(cfg.adminHash || '')) return json({ error: 'L’espace éditeur est en cours de préparation.' }, 503);
      const action = url.searchParams.get('action') || 'list';
      const origin = request.headers.get('origin');
      if (origin && origin !== ORIGIN) return json({ error: 'Requête refusée.' }, 403);
      const store = openStore ? openStore() : getStore({ name: 'editorial-private-v1', consistency: 'strong' });
      const admin = matches(request.headers.get('x-editor-admin') || '', cfg.adminHash);

      if (action === 'upload' || action === 'publish') {
        if (!admin || request.method !== 'POST') return json({ error: 'Accès refusé.' }, 403);
        if (action === 'upload') {
          const id = url.searchParams.get('id'), part = url.searchParams.get('part');
          if (!ID.test(id || '') || !/^(0|[1-9]\d{0,2})$/.test(part || '') || Number(part) > 64) return json({ error: 'Référence invalide.' }, 400);
          if (Number(request.headers.get('content-length') || 0) > PART_BYTES) return json({ error: 'Fichier trop volumineux.' }, 413);
          const bytes = await request.arrayBuffer();
          if (!bytes.byteLength || bytes.byteLength > PART_BYTES) return json({ error: 'Taille invalide.' }, 413);
          const sha256 = digest(Buffer.from(bytes));
          if (!matches(Buffer.from(bytes), request.headers.get('x-content-sha256'))) return json({ error: 'Contrôle d’intégrité échoué.' }, 400);
          await store.set(`files/${id}/${part}`, bytes, { metadata: { sha256, bytes: bytes.byteLength } });
          return json({ ok: true, sha256 });
        }
        const catalog = cleanCatalog(await smallJSON(request));
        const parts = catalog.files.flatMap(f => f.parts.map((sha256, part) => ({ key: `files/${f.id}/${part}`, sha256, bytes: Math.min(PART_BYTES, f.bytes - part * PART_BYTES) })));
        for (let i = 0; i < parts.length; i += 12) {
          const checks = await Promise.all(parts.slice(i, i + 12).map(async p => {
            const meta = await store.getMetadata(p.key);
            return meta?.metadata?.sha256 === p.sha256 && meta?.metadata?.bytes === p.bytes;
          }));
          if (checks.some(x => !x)) return json({ error: 'Un document est incomplet.' }, 409);
        }
        await store.setJSON('catalog-v1', catalog);
        return json({ ok: true, count: catalog.files.length });
      }

      if (action === 'login') {
        if (request.method !== 'POST' || origin !== ORIGIN) return json({ error: 'Requête refusée.' }, 403);
        const { code } = await smallJSON(request, 1000);
        if (typeof code !== 'string' || code.length > 100) return json({ error: 'Code incorrect.' }, 401);
        // Atomic conditional writes make the rate limit shared across instances.
        const key = `attempts/${digest(cfg.adminHash + (context.ip || 'unknown'))}/${Math.floor(now() / 900000)}`;
        let allowed = false;
        for (let attempt = 0; attempt < 6; attempt++) {
          const entry = await store.getWithMetadata(key, { type: 'json' });
          const count = entry?.data?.count || 0;
          if (count >= 12) return json({ error: 'Trop de tentatives. Réessaie dans quinze minutes.' }, 429, { 'Retry-After': '900' });
          const result = await store.setJSON(key, { count: count + 1 }, entry ? { onlyIfMatch: entry.etag } : { onlyIfNew: true });
          if (result.modified) { allowed = true; break; }
        }
        if (!allowed) return json({ error: 'Réessaie dans quelques instants.' }, 429);
        const normalized = code.replace(/[\s-]/g, '').toUpperCase();
        if (!matches(normalized, cfg.accessHash)) return json({ error: 'Code incorrect.' }, 401);
        const token = randomBytes(32).toString('hex');
        await store.setJSON('sessions/' + digest(token), { expires: now() + SESSION_SECONDS * 1000, revision: cfg.accessHash });
        return json({ ok: true }, 200, { 'Set-Cookie': cookie(token, SESSION_SECONDS) });
      }

      const token = cookieToken(request);
      const session = HEX.test(token) ? await store.get('sessions/' + digest(token), { type: 'json' }) : null;
      const authenticated = !!session && session.expires > now() && session.revision === cfg.accessHash;
      if (action === 'logout') {
        if (request.method !== 'POST' || origin !== ORIGIN) return json({ error: 'Requête refusée.' }, 403);
        if (authenticated) await store.delete('sessions/' + digest(token));
        return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });
      }
      if (!authenticated) return json({ error: 'Connecte-toi avec le code transmis par l’auteur.' }, 401);
      if (request.method !== 'GET') return json({ error: 'Méthode refusée.' }, 405);
      const catalog = await store.get('catalog-v1', { type: 'json' });
      if (!catalog) return json({ error: 'Les documents sont en cours de préparation.' }, 503);
      if (action === 'list') return json(catalog);
      if (action === 'part') {
        const id = url.searchParams.get('id'), partText = url.searchParams.get('part');
        const file = catalog.files.find(f => f.id === id);
        if (!file || !/^(0|[1-9]\d{0,2})$/.test(partText || '') || Number(partText) >= file.parts.length) return json({ error: 'Document introuvable.' }, 404);
        const part = Number(partText), data = await store.get(`files/${id}/${part}`, { type: 'arrayBuffer' });
        if (!data) return json({ error: 'Document indisponible.' }, 404);
        return new Response(data, { headers: { ...headers, 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment', 'X-Content-SHA256': file.parts[part] } });
      }
      return json({ error: 'Page introuvable.' }, 404);
    } catch (error) {
      // Never log request bodies, codes, tokens, document content or provider URLs.
      console.error('Editor request failed', error?.name || 'Error');
      return json({ error: 'Impossible de terminer la demande. Réessaie dans quelques instants.' }, 500);
    }
  };
}
export default createHandler();
