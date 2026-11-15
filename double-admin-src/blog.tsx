'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './blog-backoffice.css';
import NotificationSettings from './notification-settings';
import RichEditor from './rich-editor';
import {BannerPicker,PostPreview} from './banner-preview';
import {plainDoc,parseStored,docText,normalizeDoc,normalizeCover,mediaIds} from '../blog-content.js';

type PostStatus = 'draft' | 'published';
type Post = { content:any;cover:any; id: string; title: string; body: string; status: PostStatus; created_at: string; updated_at: string; published_at: string | null };
type Invite = { id: string; label: string; token: string; active: boolean };
type Comment = { id: string; post_id: string; name: string; body: string; created_at: string; hidden: boolean };
type BlogData = { posts: Post[]; invites: Invite[]; comments: Comment[] };
type Editor = { content:any;cover:any; id?: string; title: string; body: string; status: PostStatus };
type View = 'write' | 'invites' | 'comments' | 'visits';
type VisitStats = { total24h: number; total1h: number; unusual: boolean; mailConfigured: boolean; pending: number; visits: {id:string;page:string;created_at:string;mail_state:string}[] };

const PUBLIC_URL = new URL('/ahmed-marie.html', window.location.origin).href;
const BLANK: Editor = { content:plainDoc(''),cover:null,title: '', body: '', status: 'draft' };
const EMPTY: BlogData = { posts: [], invites: [], comments: [] };
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const text = (v: unknown): string => typeof v === 'string' ? v : '';
const id = (v: unknown): string => typeof v === 'string' || typeof v === 'number' ? String(v) : '';
const flag = (v: unknown): boolean => v === true || v === 1;

function decodeBlog(value: unknown): BlogData {
  if (!isRecord(value) || !Array.isArray(value.posts) || !Array.isArray(value.invites) || !Array.isArray(value.comments)) throw new Error('La réponse du service est incomplète. Réessaie de charger le carnet.');
  const posts = value.posts.map((v: unknown): Post => {
    if (!isRecord(v) || !id(v.id) || typeof v.title !== 'string' || typeof v.body !== 'string' || (v.status !== 'draft' && v.status !== 'published')) throw new Error('Un billet reçu est incomplet. Le carnet n’a pas été mis à jour.');
    return { content:parseStored(v.content_json,plainDoc(v.body)),cover:parseStored(v.cover_json),id: id(v.id), title: v.title, body: v.body, status: v.status, created_at: text(v.created_at), updated_at: text(v.updated_at), published_at: typeof v.published_at === 'string' ? v.published_at : null };
  });
  const invites = value.invites.map((v: unknown): Invite => {
    if (!isRecord(v) || !id(v.id) || typeof v.token !== 'string') throw new Error('Une invitation reçue est incomplète. Réessaie de charger le carnet.');
    return { id: id(v.id), label: text(v.label) || 'Invitation', token: v.token, active: flag(v.active) };
  });
  const comments = value.comments.map((v: unknown): Comment => {
    if (!isRecord(v) || !id(v.id) || !id(v.post_id) || typeof v.body !== 'string') throw new Error('Un commentaire reçu est incomplet. Réessaie de charger le carnet.');
    return { id: id(v.id), post_id: id(v.post_id), name: text(v.name) || 'Sans nom', body: v.body, created_at: text(v.created_at), hidden: flag(v.hidden) };
  });
  return { posts, invites, comments };
}

async function api(path: string, body?: unknown, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(abort, 25_000);
  try {
    const response = await fetch(`/api/atelier/double/admin/${path}`, {
      method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store',
      headers: body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body), signal: controller.signal,
    });
    const result: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new Error('Ta session a expiré. Recharge cette page pour te reconnecter.');
      const detail = isRecord(result) ? text(result.message) || text(result.error) : '';
      throw new Error(detail && detail.length < 300 ? detail : 'Le service n’a pas pu terminer cette demande. Réessaie dans un instant.');
    }
    return result;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (controller.signal.aborted) throw new Error('Le service met trop de temps à répondre. Recharge pour vérifier avant de recommencer.');
    if (error instanceof TypeError) throw new Error('La connexion au carnet a été interrompue. Vérifie ta connexion puis réessaie.');
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}

const readBlog = async (signal?: AbortSignal): Promise<BlogData> => decodeBlog(await api('blog', undefined, signal));
const message = (error: unknown): string => error instanceof Error ? error.message : 'Une erreur est survenue. Réessaie.';
const asEditor = (post: Post): Editor => ({ id: post.id, title: post.title, body: post.body, status: post.status,content:post.content,cover:post.cover });
const inviteLink = (invite: Invite): string => `${PUBLIC_URL}#invitation=${encodeURIComponent(invite.token)}`;
function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date non disponible' : new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}
function newest<T>(items: T[], getDate: (item: T) => string): T[] {
  return [...items].sort((a, b) => (Date.parse(getDate(b)) || 0) - (Date.parse(getDate(a)) || 0));
}

export default function BlogBackoffice() {
  const [preview,setPreview]=useState(false);
  const [mediaBusy,setMediaBusy]=useState(false);
  const [visits, setVisits] = useState<VisitStats | null>(null);
  const [visitsError, setVisitsError] = useState('');
  const [data, setData] = useState<BlogData>(EMPTY);
  const [editor, setEditor] = useState<Editor>(BLANK);
  const [baseline, setBaseline] = useState<Editor>(BLANK);
  const [view, setView] = useState<View>('write');
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [rotating, setRotating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [postFilter, setPostFilter] = useState<'all' | PostStatus>('all');
  const [postSearch, setPostSearch] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const dirty = editor.title !== baseline.title || editor.body !== baseline.body || editor.status !== baseline.status || JSON.stringify(editor.content)!==JSON.stringify(baseline.content) || JSON.stringify(editor.cover)!==JSON.stringify(baseline.cover);
  const disabled = busy || loading || mediaBusy;
  const hasContent=Boolean(editor.body.trim()||mediaIds(editor.content,editor.cover).length);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError('');
    try { const result = await readBlog(signal); if (!signal?.aborted) { setData(result); setLoaded(true); } }
    catch (e) { if (!signal?.aborted) setError(message(e)); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => { let live=true; async function refresh(){try{const v=await api('visits');if(live){setVisits(v as VisitStats);setVisitsError('');}}catch(e){if(live)setVisitsError(message(e));}} void refresh();const timer=setInterval(refresh,30000);return()=>{live=false;clearInterval(timer);}; }, []);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  useEffect(() => {
    if (!dirty) return;
    const protect = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', protect);
    return () => window.removeEventListener('beforeunload', protect);
  }, [dirty]);

  function choosePost(post?: Post) {
    if (disabled) return;
    if (dirty && !window.confirm('Ce texte contient des modifications non enregistrées. Les abandonner pour ouvrir un autre billet ?')) return;
    const next = post ? asEditor(post) : { ...BLANK };
    setEditor(next); setBaseline(next); setView('write'); setNotice(''); setError('');
    requestAnimationFrame(() => titleRef.current?.focus());
  }

  async function save(status: PostStatus) {
    if (disabled) return;
    let candidate: Editor;
    try { candidate = { ...editor, title: editor.title.trim(), body: docText(editor.content), content:normalizeDoc(editor.content),cover:normalizeCover(editor.cover),status }; }
    catch (e) { setError(message(e)); return; }
    if (!candidate.title || !hasContent) { setError('Ajoute un titre et un texte avant d’enregistrer ton billet.'); return; }
    setBusy(true); setError(''); setNotice('');
    let accepted = false;
    try {
      const result = await api('blog', candidate);
      if (!isRecord(result) || !isRecord(result.post) || !id(result.post.id)) throw new Error('L’enregistrement n’a pas pu être confirmé. Recharge le carnet pour vérifier avant de recommencer.');
      accepted = true;
      const savedId = id(result.post.id);
      const refreshed = await readBlog();
      const verified = refreshed.posts.find(post => post.id === savedId);
      if (!verified || verified.title !== candidate.title || verified.body !== candidate.body || verified.status !== status || JSON.stringify(verified.content)!==JSON.stringify(candidate.content) || JSON.stringify(verified.cover)!==JSON.stringify(candidate.cover)) throw new Error('Le texte relu ne correspond pas entièrement à ta demande. Ton texte reste dans l’éditeur ; recharge le carnet pour vérifier.');
      setData(refreshed);
      const next = asEditor(verified); setEditor(next); setBaseline(next);
      setNotice(status === 'published' ? 'Billet publié. Le texte enregistré a été vérifié.' : baseline.status === 'published' ? 'Billet dépublié. Il est conservé dans les brouillons.' : 'Brouillon enregistré. Tu peux le reprendre quand tu veux.');
    } catch (e) {
      setError(`${accepted ? 'La demande a été reçue, mais sa vérification n’a pas abouti. ' : ''}${message(e)}`);
    } finally { setBusy(false); }
  }

  async function changeInvite(invite: Invite, action: 'toggle' | 'rotate') {
    if (disabled) return;
    setBusy(true); setError(''); setNotice('');
    let accepted = false;
    try {
      const result = await api('invite', action === 'rotate' ? { id: invite.id, rotate: true } : { id: invite.id, active: !invite.active });
      if (!isRecord(result) || result.ok !== true) throw new Error('La modification de l’invitation n’a pas été confirmée.');
      accepted = true;
      const refreshed = await readBlog();
      const verified = refreshed.invites.find(item => item.id === invite.id);
      if (!verified || (action === 'rotate' ? !verified.token || verified.token === invite.token : verified.active !== !invite.active)) throw new Error('La relecture ne confirme pas la modification. Recharge pour vérifier avant de recommencer.');
      setData(refreshed); setRotating(null); setCopied(null);
      setNotice(action === 'rotate' ? 'Nouveau lien créé. L’ancien lien ne fonctionne plus.' : verified.active ? 'Invitation réactivée.' : 'Invitation suspendue. Son lien ne donne plus accès à l’espace invité.');
    } catch (e) { setError(`${accepted ? 'La demande a été reçue, mais sa vérification n’a pas abouti. ' : ''}${message(e)}`); }
    finally { setBusy(false); }
  }

  async function moderate(comment: Comment) {
    if (disabled) return;
    setBusy(true); setError(''); setNotice('');
    let accepted = false;
    try {
      const result = await api('comment', { id: comment.id, hidden: !comment.hidden });
      if (!isRecord(result) || result.ok !== true) throw new Error('La modification du commentaire n’a pas été confirmée.');
      accepted = true;
      const refreshed = await readBlog();
      const verified = refreshed.comments.find(item => item.id === comment.id);
      if (!verified || verified.hidden !== !comment.hidden) throw new Error('La relecture ne confirme pas la modification. Recharge pour vérifier avant de recommencer.');
      setData(refreshed); setNotice(verified.hidden ? 'Commentaire masqué. Tu peux le rétablir à tout moment.' : 'Commentaire rétabli.');
    } catch (e) { setError(`${accepted ? 'La demande a été reçue, mais sa vérification n’a pas abouti. ' : ''}${message(e)}`); }
    finally { setBusy(false); }
  }

  async function copyInvite(invite: Invite) {
    setError(''); setNotice('');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('La copie automatique n’est pas disponible ici. Sélectionne le lien ci-dessous et copie-le.');
      await navigator.clipboard.writeText(inviteLink(invite));
      setCopied(invite.id); setNotice(`Lien de « ${invite.label} » copié.`);
    } catch (e) { setError(e instanceof Error && e.message.startsWith('La copie') ? e.message : 'Le navigateur n’a pas autorisé la copie. Sélectionne le lien affiché et copie-le manuellement.'); }
  }

  const posts = newest(data.posts, post => post.updated_at).filter(post => (postFilter === 'all' || post.status === postFilter) && post.title.toLocaleLowerCase('fr').includes(postSearch.toLocaleLowerCase('fr')));
  const comments = newest(data.comments, comment => comment.created_at).filter(comment => showHidden || !comment.hidden);
  const publishedCount = data.posts.filter(post => post.status === 'published').length;
  const visibleComments = data.comments.filter(comment => !comment.hidden).length;
  const selected = editor.id ? data.posts.find(post => post.id === editor.id) : undefined;
  const words = editor.body.trim() ? editor.body.trim().split(/\s+/u).length : 0;

  return (
    <main className="amb-app">
      <header className="amb-topbar">
        <a className="amb-brand" href="/admin-blog.html?view=atelier" aria-label="Retour à l’atelier Ahmed Marie"><span className="amb-mark" aria-hidden="true">a</span><span>Ahmed Marie<small>LA TECTONIQUE DES ÂMES</small></span></a>
        <form action="/api/atelier/auth/logout" method="post"><button type="submit">Se déconnecter</button></form><nav aria-label="Liens de l’atelier"><a href="/admin-blog.html?view=review">Conversations et corrections</a><a href="/admin-blog.html?view=atelier">← L’atelier</a><a href={PUBLIC_URL} target="_blank" rel="noopener noreferrer">L’espace public ↗</a></nav>
      </header>

      <div className="amb-content">
        <section className="amb-heading" aria-labelledby="amb-page-title">
          <div><p className="amb-eyebrow">Le carnet · Espace d’auteur</p><h1 id="amb-page-title">Écrire. <em>Faire circuler.</em></h1><p className="amb-lead">Des textes en cours, des billets à partager, quelques lecteurs invités. Le carnet se construit ici.</p></div>
          <div className="amb-private"><span aria-hidden="true">●</span> Atelier privé</div>
        </section>

        <div className="amb-overview" aria-label="État du carnet"><span><strong>{publishedCount}</strong> {publishedCount === 1 ? 'billet publié' : 'billets publiés'}</span><span><strong>{visits?.total24h ?? '—'}</strong> visites sur 24 h</span><span><strong>{visibleComments}</strong> {visibleComments === 1 ? 'commentaire visible' : 'commentaires visibles'}</span></div>

        <div className="amb-toolbar"><nav className="amb-tabs" aria-label="Rubriques du carnet">{([{ id: 'write', name: 'Les billets' }, { id: 'invites', name: 'Le lien public' }, { id: 'visits', name: 'Les visites et mails' }, { id: 'comments', name: 'Les commentaires' }] as const).map(tab => <button key={tab.id} type="button" aria-pressed={view === tab.id} onClick={() => setView(tab.id)}>{tab.name}</button>)}</nav><button className="amb-refresh" type="button" onClick={() => { setNotice(''); void load(); }} disabled={disabled}>{loading ? 'Chargement…' : 'Actualiser ↻'}</button></div>

        {error && <div className="amb-feedback amb-error" role="alert"><strong>Un point à vérifier</strong><p>{error}</p></div>}
        {notice && <div className="amb-feedback amb-success" role="status">{notice}</div>}
        {!loaded && <div className="amb-empty" aria-live="polite"><span className="amb-empty-symbol" aria-hidden="true">✎</span><h2>{loading ? 'Le carnet s’ouvre…' : 'Le carnet n’a pas pu s’ouvrir.'}</h2><p>{loading ? 'Les billets et les invitations arrivent.' : 'Ton travail reste privé. Utilise « Actualiser » pour réessayer.'}</p></div>}

        {loaded && view === 'write' && <div className="amb-writing-layout">
          <section className="amb-editor amb-card" aria-labelledby="amb-editor-title" aria-busy={busy}>
            <div className="amb-card-heading"><div><p className="amb-eyebrow">À la table de travail</p><h2 id="amb-editor-title">{editor.id ? 'Reprendre le fil' : 'Un nouveau billet'}</h2></div><span className={`amb-badge ${editor.status === 'published' ? 'amb-badge-published' : ''}`}>{editor.status === 'published' ? 'Publié' : 'Brouillon'}</span></div>
            <form onSubmit={event => { event.preventDefault(); void save(editor.status); }}>
              <label className="amb-field-label" htmlFor="amb-title">Le titre</label>
              <input ref={titleRef} className="amb-title-input" id="amb-title" value={editor.title} onChange={event => setEditor(current => ({ ...current, title: event.target.value }))} placeholder="Quelques mots pour commencer…" disabled={disabled} required />
              <BannerPicker value={editor.cover} onChange={cover=>setEditor(current=>({...current,cover}))} disabled={disabled} onBusy={setMediaBusy}/>
              <label className="amb-field-label">Le texte</label>
              <RichEditor value={editor.content} onChange={(content,body)=>setEditor(current=>({...current,content,body}))} disabled={disabled} onBusy={setMediaBusy}/>
              <div className="amb-editor-meta"><span id="amb-writing-hint">Sélectionne du texte pour le mettre en forme ou une photo pour l’organiser.</span><span>{words} {words === 1 ? 'mot' : 'mots'}</span></div>
              <div className="amb-save-row"><div className="amb-actions"><button className="amb-button amb-button-secondary" type="button" disabled={disabled} onClick={()=>setPreview(true)}>Prévisualiser</button><button className="amb-button amb-button-secondary" type="submit" disabled={disabled || !editor.title.trim() || !hasContent}>{busy ? 'Vérification…' : editor.status === 'published' ? 'Enregistrer les modifications' : 'Enregistrer le brouillon'}</button>{editor.status === 'draft' ? <button className="amb-button" type="button" onClick={() => void save('published')} disabled={disabled || !editor.title.trim() || !hasContent}>Publier le billet ↗</button> : <button className="amb-button amb-button-quiet" type="button" onClick={() => void save('draft')} disabled={disabled}>Dépublier</button>}</div><p className={`amb-save-state ${dirty ? 'amb-save-state-dirty' : ''}`} aria-live="polite">{dirty ? 'Modifications non enregistrées' : selected ? `Enregistré le ${formatDate(selected.updated_at)}` : 'Ce texte est encore dans l’éditeur.'}</p></div>
              {editor.status === 'published' && <p className="amb-publishing-note">Enregistrer les modifications mettra aussi à jour le billet public. Dépublier le retire du carnet public et le conserve ici.</p>}
            </form>
          </section>

          <aside className="amb-history amb-card" aria-labelledby="amb-history-title"><div className="amb-card-heading"><div><p className="amb-eyebrow">Les pages du carnet</p><h2 id="amb-history-title">Les billets <span>{data.posts.length}</span></h2></div></div><button type="button" className="amb-button amb-button-secondary amb-new" onClick={() => choosePost()} disabled={disabled}>＋ Nouveau billet</button><label className="amb-sr-only" htmlFor="amb-search">Chercher un billet par titre</label><input id="amb-search" className="amb-search" type="search" placeholder="Chercher un titre…" value={postSearch} onChange={event => setPostSearch(event.target.value)} /><label className="amb-sr-only" htmlFor="amb-post-filter">État des billets</label><select id="amb-post-filter" className="amb-select" value={postFilter} onChange={event => setPostFilter(event.target.value as 'all' | PostStatus)}><option value="all">Tous les billets</option><option value="draft">Brouillons</option><option value="published">Publiés</option></select><div className="amb-post-list">{posts.length ? posts.map(post => <button type="button" className={`amb-post ${editor.id === post.id ? 'is-selected' : ''}`} key={post.id} onClick={() => choosePost(post)} disabled={disabled} aria-current={editor.id === post.id ? 'true' : undefined}><span className={`amb-badge ${post.status === 'published' ? 'amb-badge-published' : ''}`}>{post.status === 'published' ? 'Publié' : 'Brouillon'}</span><strong>{post.title}</strong><span className="amb-post-excerpt">{post.body.slice(0, 105)}{post.body.length > 105 ? '…' : ''}</span><time dateTime={post.updated_at}>{formatDate(post.updated_at)}</time></button>) : <p className="amb-small-empty">{data.posts.length ? 'Aucun billet ne correspond à cette recherche.' : 'Le premier billet attend ses premiers mots.'}</p>}</div></aside>
        </div>}

        {loaded && view === 'invites' && <section className="amb-card"><h2>Un seul lien, ouvert à tous.</h2><p>Transmets ce lien aux quatre personnes que tu souhaites inviter. Aucun compte ni code n’est demandé pour lire le blog et converser.</p><input aria-label="Lien public du blog" value={PUBLIC_URL} readOnly onFocus={e=>e.target.select()} style={{width:'100%',padding:12}}/><p><a href={PUBLIC_URL} target="_blank" rel="noopener noreferrer">Ouvrir le blog ↗</a></p></section>}
        {view === 'visits' && <section className="amb-card"><h2>Les visites et les mails</h2><NotificationSettings api={api}/>{visitsError && <p role="alert">{visitsError}</p>}{visits && <><p><strong>{visits.total1h}</strong> visites sur une heure · <strong>{visits.total24h}</strong> sur 24 heures.</p>{visits.unusual && <p role="alert" className="amb-feedback amb-error">Fréquentation inhabituelle : plus de 10 visites en une heure ou de 20 en 24 heures.</p>}<p className="amb-feedback">{visits.mailConfigured ? 'Service mail configuré. La fréquence choisie ci-dessus s’applique aux prochaines visites. Consulte les résultats d’envoi ci-dessous.' : 'Mails non actifs : le service d’envoi doit encore être configuré. Les visites sont enregistrées, mais aucun mail de visite n’est envoyé.'}</p><p>Une visite regroupe les ouvertures d’un même navigateur séparées de moins de 30 minutes. Ce compteur n’identifie pas les personnes. Actualisation toutes les 30 secondes.</p><div style={{overflowX:'auto'}}><table style={{width:'100%',textAlign:'left'}}><thead><tr><th>Date</th><th>Page d’arrivée</th><th>Mail</th></tr></thead><tbody>{visits.visits.map(v=><tr key={v.id}><td>{formatDate(v.created_at)}</td><td>{v.page}</td><td>{({blocked:'Service non configuré',pending:'En attente',sending:'Envoi demandé',accepted:'Accepté par le service',failed:'Échec ou résultat inconnu',daily_pending:'Dans le prochain résumé',digest_sending:'Résumé demandé',digest_accepted:'Résumé accepté par le service',disabled:'Mails désactivés',skipped:'Fréquence modifiée'} as Record<string,string>)[v.mail_state] || v.mail_state}</td></tr>)}</tbody></table></div>{!visits.visits.length&&<p>Aucune visite enregistrée pour le moment.</p>}</>}</section>}

        {loaded && view === 'comments' && <section aria-labelledby="amb-comments-title"><div className="amb-section-intro"><p className="amb-eyebrow">Les voix en retour</p><h2 id="amb-comments-title">Ce que les lecteurs déposent.</h2><p>Les commentaires masqués restent accessibles ici. Tu peux les remettre en ligne quand tu le souhaites.</p></div><label className="amb-checkbox"><input type="checkbox" checked={showHidden} onChange={event => setShowHidden(event.target.checked)} /> Afficher aussi les commentaires masqués <span>({data.comments.filter(comment => comment.hidden).length})</span></label><div className="amb-comment-list">{comments.map(comment => <article key={comment.id} className={`amb-comment amb-card ${comment.hidden ? 'is-hidden' : ''}`}><div className="amb-comment-top"><div><strong>{comment.name}</strong><time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time></div><span className={`amb-badge ${comment.hidden ? '' : 'amb-badge-published'}`}>{comment.hidden ? 'Masqué' : 'Visible'}</span></div><p className="amb-comment-post">Sur « {data.posts.find(post => post.id === comment.post_id)?.title || 'Billet non disponible'} »</p><p className="amb-comment-body">{comment.body}</p><button className="amb-button amb-button-secondary" type="button" onClick={() => void moderate(comment)} disabled={disabled}>{comment.hidden ? 'Rétablir le commentaire' : 'Masquer le commentaire'}</button></article>)}</div>{!comments.length && <div className="amb-empty"><span className="amb-empty-symbol" aria-hidden="true">“</span><h3>Le silence, pour le moment.</h3><p>{data.comments.length ? 'Aucun commentaire visible. Active le filtre pour retrouver les commentaires masqués.' : 'Les premières réactions des lecteurs apparaîtront ici.'}</p></div>}</section>}
        {preview&&<PostPreview title={editor.title} content={editor.content} cover={editor.cover} onClose={()=>setPreview(false)}/>}
        <footer className="amb-footer"><span>Ahmed Marie · Le carnet de La tectonique des âmes</span><span>Les brouillons restent dans l’atelier.</span></footer>
      </div>
    </main>
  );
}
