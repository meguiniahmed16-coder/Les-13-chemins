import { createHash, randomBytes, timingSafeEqual, scryptSync } from 'node:crypto';
import { getStore } from '@netlify/blobs';

// This module is deployed as a server function, never copied into dist/.
// Documents and their catalogue live exclusively in private Netlify Blobs.
const ORIGIN = 'https://tectonique-des-ames.netlify.app';
const OWNER_EMAIL = 'meguiniahmed16@gmail.com';
const IDENTITY = ORIGIN + '/.netlify/identity';
const COOKIE = '__Host-editor';
const ADMIN_COOKIE = '__Host-editor-admin';
const DAY = 86400000;
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
const cookie = (value, age, name = COOKIE) => `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
const cookieToken = (request, name = COOKIE) => (request.headers.get('cookie') || '').split(';').map(s => s.trim()).find(s => s.startsWith(name + '='))?.slice(name.length + 1) || '';
const normalizeOwnerCode = code => typeof code === 'string' ? code.replace(/\s/g, '') : '';
function ownerCodeMatches(code, credential, fallbackHash) {
  if (!credential) return matches(normalizeOwnerCode(code), fallbackHash);
  if (!ID.test(credential.salt || '') || !HEX.test(credential.hash || '')) return false;
  return timingSafeEqual(scryptSync(normalizeOwnerCode(code), credential.salt, 32), Buffer.from(credential.hash, 'hex'));
}
async function claimAttempt(store, key, limit) {
  for (let slot = 0; slot < limit; slot++) {
    if ((await store.setJSON(key + '/' + slot, { used: true }, { onlyIfNew: true })).modified) return true;
  }
  return false;
}
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

export function createHandler({ openStore, configuration, now = Date.now, identityFetch = fetch } = {}) {
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
      const identityRequest = (path, options = {}) => identityFetch(IDENTITY + path, { ...options, redirect: 'error', signal: AbortSignal.timeout(12000) });
      const identityReady = async () => {
        try { const response = await identityRequest('/settings'); if (!response.ok) return false; const settings = await response.json(); return settings.disable_signup === true && settings.autoconfirm === false; } catch { return false; }
      };
      if (action === 'recovery-status') {
        if (request.method !== 'GET') return json({ error: 'Méthode refusée.' }, 405);
        return json({ enabled: await identityReady() });
      }
      if (action === 'request-owner-reset' || action === 'recover-owner-code') {
        if (request.method !== 'POST' || origin !== ORIGIN) return json({ error: 'Requête refusée.' }, 403);
        let body;
        try { body = await smallJSON(request, 4000); } catch { return json({ error: 'Demande invalide.' }, 400); }
        const window = Math.floor(now() / 900000), ip = digest(context.ip || 'unknown');
        if (!(await claimAttempt(store, `recovery-attempts/${action}/${ip}/${window}`, action === 'request-owner-reset' ? 3 : 10))) return json({ error: 'Trop de demandes. Réessaie dans quinze minutes.' }, 429);
        if (!(await identityReady())) return json({ error: 'La récupération par mail n’est pas encore disponible.' }, 503);
        if (action === 'request-owner-reset') {
          const message = { ok: true, message: 'Si cette adresse correspond à ton espace auteur, tu recevras un lien. Vérifie aussi les courriers indésirables.' };
          if (typeof body?.email !== 'string' || body.email.trim().toLowerCase() !== OWNER_EMAIL) return json(message);
          if (!(await claimAttempt(store, `recovery-mail/${cfg.adminHash}/${window}`, 5))) return json({ error: 'Un lien a déjà été demandé. Vérifie tes mails ou réessaie dans quinze minutes.' }, 429);
          const response = await identityRequest('/recover', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: OWNER_EMAIL }) });
          if (!response.ok) return json({ error: response.status === 429 ? 'Un lien vient déjà d’être envoyé. Vérifie tes mails.' : 'Le mail n’a pas pu être envoyé. Réessaie dans quelques instants.' }, response.status === 429 ? 429 : 502);
          return json(message);
        }
        if (!body || !['recovery','signup'].includes(body.type) || typeof body.token !== 'string' || !/^[A-Za-z0-9._~-]{16,2048}$/.test(body.token) || typeof body.newCode !== 'string' || !/^\d{10}$/.test(body.newCode) || body.newCode !== body.confirmCode) return json({ error: 'Saisis deux fois le même nouveau code de 10 chiffres.' }, 400);
        const key = 'owner-credential/' + cfg.adminHash, previous = await store.getWithMetadata(key, { type: 'json' });
        const invalid = () => json({ error: 'Ce lien est expiré, déjà utilisé ou invalide. Demande un nouveau lien.' }, 400);
        const usedKey = 'owner-recovery-used/' + digest(body.token);
        if (await store.get(usedKey, { type: 'json' })) return invalid();
        const verified = await identityRequest('/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: body.type, token: body.token, password: randomBytes(32).toString('hex') }) });
        if (!verified.ok) return invalid();
        const session = await verified.json();
        if (typeof session.access_token !== 'string') return invalid();
        const userResponse = await identityRequest('/user', { headers: { Authorization: 'Bearer ' + session.access_token } });
        if (!userResponse.ok) return invalid();
        const user = await userResponse.json();
        if (user.email?.toLowerCase() !== OWNER_EMAIL || !user.confirmed_at) return invalid();
        if (!(await store.setJSON(usedKey, { at: now() }, { onlyIfNew: true })).modified) return invalid();
        const salt = randomBytes(16).toString('hex'), revision = randomBytes(32).toString('hex');
        const credential = { salt, hash: scryptSync(body.newCode, salt, 32).toString('hex'), revision, updatedAt: now() };
        const changed = await store.setJSON(key, credential, previous ? { onlyIfMatch: previous.etag } : { onlyIfNew: true });
        if (!changed.modified) return json({ error: 'Le code vient déjà d’être modifié. Demande un nouveau lien si nécessaire.' }, 409);
        // Email proves ownership; Identity tokens never reach the browser or logs.
        try { await identityRequest('/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + session.access_token } }); } catch {}
        const token = randomBytes(32).toString('hex');
        await store.setJSON('owner-sessions/' + digest(token), { expires: now() + SESSION_SECONDS * 1000, revision });
        return json({ ok: true }, 200, { 'Set-Cookie': cookie(token, SESSION_SECONDS, ADMIN_COOKIE) });
      }


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

      // The owner gets a separate server-side session. An editor code can never
      // create codes, revoke access, upload documents or become an administrator.
      const ownerToken = cookieToken(request, ADMIN_COOKIE);
      const credentialKey = 'owner-credential/' + cfg.adminHash;
      const credentialSnapshot = (HEX.test(ownerToken) || action === 'admin-login') ? await store.getWithMetadata(credentialKey, { type: 'json' }) : null;
      const credential = credentialSnapshot?.data || null;
      const ownerRevision = credential?.revision || cfg.adminHash;
      const ownerSession = HEX.test(ownerToken) ? await store.get('owner-sessions/' + digest(ownerToken), { type: 'json' }) : null;
      const owner = !!ownerSession && ownerSession.expires > now() && ownerSession.revision === ownerRevision;
      // Owner-authenticated updates append or replace one small private document.
      // The catalogue is updated atomically; unrelated documents are preserved.
      if (action === 'owner-save-document') {
        if (!owner) return json({ error: 'Connecte-toi à l’espace administrateur.' }, 401);
        if (request.method !== 'POST' || origin !== ORIGIN) return json({ error: 'Requête refusée.' }, 403);
        let body;
        try { body = await smallJSON(request, 1500000); } catch { return json({ error: 'Document invalide.' }, 400); }
        if (!body || typeof body.base64 !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(body.base64)) return json({ error: 'Document invalide.' }, 400);
        const bytes = Buffer.from(body.base64, 'base64');
        if (!bytes.length || bytes.length > 1048576 || bytes.toString('base64') !== body.base64) return json({ error: 'Document trop volumineux ou invalide.' }, 400);
        const snapshot = await store.getWithMetadata('catalog-v1', { type: 'json' });
        if (!snapshot?.data?.files) return json({ error: 'Catalogue indisponible.' }, 409);
        const previous = snapshot.data.files.find(f => f.name === body.name);
        if (previous && body.expectedSha256 !== previous.sha256 || !previous && body.expectedSha256) return json({ error: 'Le document a changé. Recharge sa version actuelle.' }, 409);
        const sha256 = digest(bytes), id = randomBytes(16).toString('hex');
        let catalog;
        try {
          const file = { id, name: body.name, title: body.title, category: body.category, mime: body.mime, bytes: bytes.length, parts: [sha256], sha256, updatedAt: new Date(now()).toISOString() };
          catalog = cleanCatalog({ files: previous ? snapshot.data.files.map(f => f.id === previous.id ? file : f) : [...snapshot.data.files, file] });
        } catch { return json({ error: 'Référence du document invalide.' }, 400); }
        await store.set(`files/${id}/0`, bytes, { metadata: { sha256, bytes: bytes.length } });
        const saved = await store.setJSON('catalog-v1', catalog, { onlyIfMatch: snapshot.etag });
        if (!saved.modified) {
          await store.delete(`files/${id}/0`);
          return json({ error: 'Le catalogue a changé. Recharge sa version actuelle.' }, 409);
        }
        return json({ ok: true, id, sha256, count: catalog.files.length });
      }
      const grantActive = async id => {
        if (!HEX.test(id || '')) return null;
        const [grant, revoked] = await Promise.all([store.get('grants/' + id, { type: 'json' }), store.get('revocations/' + id, { type: 'json' })]);
        return grant && grant.issuedBy === cfg.adminHash && grant.expiresAt > now() && !revoked ? grant : null;
      };
      const legacyDisabled = () => store.get('legacy-disabled/' + cfg.accessHash, { type: 'json' });

      if (action === 'login' || action === 'admin-login') {
        if (request.method !== 'POST' || origin !== ORIGIN) return json({ error: 'Requête refusée.' }, 403);
        // Claim twelve independent slots instead of updating a shared counter.
        // Both logins share the limit, across instances and simultaneous requests.
        const key = `attempt-slots/${digest(cfg.adminHash + (context.ip || 'unknown'))}/${Math.floor(now() / 900000)}`;
        let allowed = false;
        for (let slot = 0; slot < 12; slot++) {
          const result = await store.setJSON(key + '/' + slot, { at: now() }, { onlyIfNew: true });
          if (result.modified) { allowed = true; break; }
        }
        if (!allowed) return json({ error: 'Trop de tentatives. Réessaie dans quinze minutes.' }, 429, { 'Retry-After': '900' });
        let payload;
        try { payload = await smallJSON(request, 1000); } catch { return json({ error: 'Code incorrect.' }, 400); }
        const code = payload?.code;
        if (typeof code !== 'string' || code.length > 100) return json({ error: 'Code incorrect.' }, 401);
        const isOwner = action === 'admin-login';
        let grant = null, legacy = false;
        if (isOwner) {
          if (!(await claimAttempt(store, `owner-attempts/${cfg.adminHash}/${Math.floor(now() / 900000)}`, 30))) return json({ error: 'Trop de tentatives. Réessaie dans quinze minutes.' }, 429);
          if (!ownerCodeMatches(code, credential, cfg.adminHash)) return json({ error: 'Code administrateur incorrect.' }, 401);
        } else {
          const normalized = code.replace(/[\s-]/g, '').toUpperCase();
          legacy = matches(normalized, cfg.accessHash) && !(await legacyDisabled());
          if (!legacy) grant = await grantActive(digest(normalized));
          if (!legacy && !grant) return json({ error: 'Code incorrect, expiré ou révoqué.' }, 401);
        }
        const token = randomBytes(32).toString('hex');
        const expires = Math.min(now() + SESSION_SECONDS * 1000, grant?.expiresAt ?? Infinity);
        const session = isOwner ? { expires, revision: ownerRevision } : grant ? { expires, grantId: grant.id, revision: cfg.adminHash } : { expires, revision: cfg.accessHash };
        await store.setJSON((isOwner ? 'owner-sessions/' : 'sessions/') + digest(token), session);
        return json({ ok: true }, 200, { 'Set-Cookie': cookie(token, Math.floor((expires - now()) / 1000), isOwner ? ADMIN_COOKIE : COOKIE) });
      }

      if (['admin-state', 'create-code', 'revoke-code', 'disable-legacy', 'change-owner-code'].includes(action)) {
        if (!owner) return json({ error: 'Connecte-toi à l’espace administrateur.' }, 401);
        if (action === 'admin-state') {
          if (request.method !== 'GET') return json({ error: 'Méthode refusée.' }, 405);
          const [{ blobs }, catalog, disabled] = await Promise.all([store.list({ prefix: 'grants/' }), store.get('catalog-v1', { type: 'json' }), legacyDisabled()]);
          const codes = [];
          for (let i = 0; i < blobs.length; i += 12) {
            const batch = await Promise.all(blobs.slice(i, i + 12).map(async b => {
              const g = await store.get(b.key, { type: 'json' });
              if (!g || g.issuedBy !== cfg.adminHash) return null;
              const revoked = await store.get('revocations/' + g.id, { type: 'json' });
              return { id: g.id, label: g.label, createdAt: g.createdAt, expiresAt: g.expiresAt, status: revoked ? 'revoked' : g.expiresAt <= now() ? 'expired' : 'active' };
            }));
            codes.push(...batch.filter(Boolean));
          }
          codes.sort((a,b) => b.createdAt - a.createdAt);
          return json({ codes, legacyEnabled: !disabled, documents: catalog?.files?.length || 0, updatedAt: catalog?.updatedAt || null });
        }
        if (request.method !== 'POST' || origin !== ORIGIN) return json({ error: 'Requête refusée.' }, 403);
        if (action === 'disable-legacy') {
          await store.setJSON('legacy-disabled/' + cfg.accessHash, { at: now() });
          return json({ ok: true });
        }
        let body;
        try { body = await smallJSON(request, 1000); } catch { return json({ error: 'Demande invalide.' }, 400); }
        if (action === 'change-owner-code') {
          if (typeof body?.currentCode !== 'string' || body.currentCode.length > 100 || typeof body.newCode !== 'string' || !/^\d{10}$/.test(normalizeOwnerCode(body.newCode)) || body.newCode !== body.confirmCode) return json({ error: 'Choisis un code de 10 chiffres et saisis-le deux fois à l’identique.' }, 400);
          if (!(await claimAttempt(store, `owner-attempts/${cfg.adminHash}/${Math.floor(now() / 900000)}`, 30))) return json({ error: 'Trop de tentatives. Réessaie dans quinze minutes.' }, 429);
          if (!ownerCodeMatches(body.currentCode, credential, cfg.adminHash)) return json({ error: 'Le code actuel est incorrect.' }, 400);
          if (normalizeOwnerCode(body.currentCode) === normalizeOwnerCode(body.newCode)) return json({ error: 'Choisis un code différent du code actuel.' }, 400);
          const salt = randomBytes(16).toString('hex'), revision = randomBytes(32).toString('hex');
          const next = { salt, hash: scryptSync(normalizeOwnerCode(body.newCode), salt, 32).toString('hex'), revision, updatedAt: now() };
          const changed = await store.setJSON(credentialKey, next, credentialSnapshot ? { onlyIfMatch: credentialSnapshot.etag } : { onlyIfNew: true });
          if (!changed.modified) return json({ error: 'Ton code vient déjà d’être modifié. Reconnecte-toi avec le nouveau code.' }, 409);
          // Rotating the owner's login never changes the separately issued editor grants.
          const token = randomBytes(32).toString('hex');
          await store.setJSON('owner-sessions/' + digest(token), { expires: now() + SESSION_SECONDS * 1000, revision });
          await store.delete('owner-sessions/' + digest(ownerToken));
          return json({ ok: true }, 200, { 'Set-Cookie': cookie(token, SESSION_SECONDS, ADMIN_COOKIE) });
        }
        if (action === 'create-code') {
          if (typeof body?.label !== 'string' || !body.label.trim() || body.label.trim().length > 80 || /[\x00-\x1f]/.test(body.label) || ![7,30,90,180].includes(body.days)) return json({ error: 'Indique un destinataire et une durée proposée.' }, 400);
          const raw = randomBytes(16).toString('hex').toUpperCase(), id = digest(raw);
          const grant = { id, label: body.label.trim(), createdAt: now(), expiresAt: now() + body.days * DAY, issuedBy: cfg.adminHash };
          const result = await store.setJSON('grants/' + id, grant, { onlyIfNew: true });
          if (!result.modified) return json({ error: 'Réessaie de générer le code.' }, 409);
          // No plaintext code is stored. Independent grant and revocation records
          // prevent concurrent issuance/revocation from resurrecting an old code.
          return json({ id, code: raw.match(/.{1,4}/g).join('-'), label: grant.label, expiresAt: grant.expiresAt }, 201);
        }
        if (!HEX.test(body?.id || '') || !(await store.get('grants/' + body.id, { type: 'json' }))) return json({ error: 'Code introuvable.' }, 404);
        await store.setJSON('revocations/' + body.id, { at: now() });
        return json({ ok: true });
      }

      const token = cookieToken(request);
      const session = HEX.test(token) ? await store.get('sessions/' + digest(token), { type: 'json' }) : null;
      let authenticated = owner;
      if (!authenticated && session?.expires > now()) {
        authenticated = session.grantId ? session.revision === cfg.adminHash && !!(await grantActive(session.grantId)) : session.revision === cfg.accessHash && !(await legacyDisabled());
      }
      if (action === 'logout') {
        if (request.method !== 'POST' || origin !== ORIGIN) return json({ error: 'Requête refusée.' }, 403);
        if (HEX.test(token)) await store.delete('sessions/' + digest(token));
        if (HEX.test(ownerToken)) await store.delete('owner-sessions/' + digest(ownerToken));
        const response = json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });
        response.headers.append('Set-Cookie', cookie('', 0, ADMIN_COOKIE));
        return response;
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
