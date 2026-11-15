'use client';

import { useEffect, useRef, useState } from 'react';

type Tab = 'conversation' | 'review' | 'continuity';
type Kind = 'all' | 'public' | 'private';
type Decision = 'validated' | 'corrected' | 'refused';
type ReviewState = Decision | 'unreviewed';
type Session = { session_id: string; token: string };
type Answer = { id: string; text: string; status: string; original_text?: string };
type Question = { id: string; group: string; question: string; answers: Answer[] };
type Bank = { questions: Question[]; version: string | number };
type Turn = { id: string; session_id?: string; prompt: string; response: string; created_at: string; status?: string; state: 'complete' | 'pending' | 'error'; review: ReviewState; correction?: string | null; kind: 'public' | 'private' };
type Memory = { id: string; question: string; answer: string; state: string };
type ReviewPage = { turns: Turn[]; next: string | null; memory: Memory[]; counts?: unknown[] };
type ChatPayload = { turn: { id: string; prompt: string; response: string; created_at: string; status?: string; state?: string; review?: ReviewState; correction?: string | null }; sources?: unknown[] };
type Quote = { id: string; text: string };
type Outgoing = { quote?: Quote | null; request_id: string; message: string; emojis: boolean; created_at: string; state: 'sending' | 'failed'; error?: string; renew?: boolean };
type EditTarget = { type: 'turn'; id: string; question: string; original: string } | { type: 'answer'; id: string; question: string; original: string };
type SpeechResult = { [index: number]: { transcript: string }; isFinal?: boolean };
type SpeechResults = { length: number; [index: number]: SpeechResult };
type SpeechLike = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((event: { results: SpeechResults }) => void) | null; onerror: ((event: { error: string }) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void; abort: () => void };
type SpeechConstructor = new () => SpeechLike;
type DictationTarget = 'message' | 'correction';

const API = '/api/atelier/double/';
const SESSION_KEY = 'ahmed-marie-double-private-session-v1';
const PUBLIC_URL = new URL('/ahmed-marie.html', window.location.origin).href;
const TIMEOUT = 90_000;
const MESSAGE_LIMIT = 3000;
const CORRECTION_LIMIT = 6000;
const EMOJIS = ['🙂', '😄', '😉', '😂', '❤️', '✨', '🙏', '🤔', '🔥', '🙃', '😅', '🌿'];
const DEFAULT_SUGGESTIONS = ['Pourquoi écris-tu ?', 'Tu arrives à rire de tout ?', 'Qu’est-ce que la foi a changé ?', 'Qu’est-ce qui te donne envie de quelqu’un ?'];
const GROUP_NAMES: Record<string, string> = { A: 'Parcours & écriture', B: 'Vie quotidienne', C: 'Émotions & relations', D: 'Désir & intimité', E: 'Foi & convictions' };
const STATUS_NAMES: Record<string, string> = { validated: 'Retenu', corrected: 'Corrigé', refused: 'Refusé', unreviewed: 'À relire', proposed: 'À examiner', draft: 'À examiner', pending: 'En attente', complete: 'Réponse reçue', error: 'Erreur' };

class ServiceError extends Error {
  status: number;
  renew: boolean;
  constructor(message: string, status = 0, renew = false) { super(message); this.name = 'ServiceError'; this.status = status; this.renew = renew; }
}
function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
async function api<T>(path: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const response = await fetch(API + path, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store', headers: body === undefined ? { Accept: 'application/json' } : { 'Content-Type': 'application/json', Accept: 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: controller.signal });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const code = record(data) && typeof data.code === 'string' ? data.code : '';
      const renew = record(data) && (data.retry_with_new_request_id === true || data.new_request_id_required === true || data.resend_required === true || ['REQUEST_EXPIRED', 'RETRY_WITH_NEW_ID', 'IDEMPOTENCY_KEY_EXPIRED', 'RESEND_REQUIRED'].includes(code));
      const detail = record(data) && typeof data.message === 'string' ? data.message : record(data) && typeof data.error === 'string' ? data.error : '';
      if (response.status === 401 || response.status === 403) throw new ServiceError('Ta session a expiré. Recharge cette page pour te reconnecter.', response.status, renew);
      if (response.status === 429) throw new ServiceError(detail && detail.length < 350 ? detail : 'Le quota de conversation est atteint. Réessaie à la prochaine période disponible.', response.status, renew);
      throw new ServiceError(detail && detail.length < 350 ? detail : 'Le service n’a pas pu terminer cette demande. Tu peux réessayer.', response.status, renew);
    }
    if (!record(data)) throw new ServiceError('La réponse du service est incomplète. Tu peux réessayer.');
    return data as T;
  } catch (error: unknown) {
    if (error instanceof ServiceError) throw error;
    if (error instanceof Error && error.name === 'AbortError') throw new ServiceError('Le service n’a pas répondu dans les 90 secondes. Tu peux relancer la demande.');
    throw new ServiceError('La connexion s’est interrompue. Rien n’a été confirmé ; tu peux réessayer.');
  } finally { clearTimeout(timer); }
}
function errorText(error: unknown): string { return error instanceof Error ? error.message : 'Une erreur est survenue. Tu peux réessayer.'; }
function turnKey(turn: Pick<Turn, 'id' | 'created_at'>): string { return `${turn.id}\u0000${turn.created_at}`; }
function mergeTurns(previous: Turn[], incoming: Turn[], descending = true): Turn[] { const map = new Map(previous.map(turn => [turnKey(turn), turn])); for (const turn of incoming) map.set(turnKey(turn), turn); return [...map.values()].sort((a, b) => descending ? b.created_at.localeCompare(a.created_at) : a.created_at.localeCompare(b.created_at)); }
function normalize(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr'); }
function reviewValue(value: string | undefined): ReviewState { const status = normalize(value || ''); if (status.includes('corrig') || status.includes('correction')) return 'corrected'; if (status.includes('refus') || status === 'pas moi') return 'refused'; if (status.includes('valid') || status.includes('retenu') || status.includes('approuv')) return 'validated'; return 'unreviewed'; }
function groupName(group: string): string { return GROUP_NAMES[group] || group; }
function dateLabel(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', year: 'numeric' }); }
function escapeHTML(value: string): string { return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] || character)); }
function download(name: string, content: string, mime: string): void { const url = URL.createObjectURL(new Blob([content], { type: mime })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 30_000); }
function requestId(): string { if (typeof crypto.randomUUID === 'function') return crypto.randomUUID(); const bytes = crypto.getRandomValues(new Uint8Array(16)); bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128; const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join(''); return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`; }
function loadStoredSession(): Session | null { try { const value: unknown = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); return record(value) && typeof value.session_id === 'string' && typeof value.token === 'string' && value.session_id && value.token ? { session_id: value.session_id, token: value.token } : null; } catch { return null; } }
function storeSession(session: Session | null): boolean { try { if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session)); else localStorage.removeItem(SESSION_KEY); return true; } catch { return false; } }

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, string> = { chat: 'M21 11a8 8 0 0 1-8 8H6l-4 3V11a9 9 0 0 1 19 0Z', review: 'M8 4H5v17h14V4h-3M9 2h6v4H9zM8 11h8M8 15h5', book: 'M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15', arrow: 'M12 19V5M6 11l6-6 6 6', mic: 'M9 6a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0ZM6 11v1a6 6 0 0 0 12 0v-1M12 18v3M9 21h6', smile: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM8 14c2 3 6 3 8 0M8 9h.01M16 9h.01', check: 'm5 12 4 4L19 6', edit: 'm15 4 5 5M4 20l5-1L21 7l-5-5L4 14v6Z', close: 'm6 6 12 12M18 6 6 18', export: 'M12 3v12M7 10l5 5 5-5M4 16v5h16v-5', search: 'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-2 4 6 6', sparkle: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z', refresh: 'M20 7a9 9 0 1 0 1 8M20 2v6h-6', external: 'M14 3h7v7M21 3 11 13M10 4H3v17h17v-7' };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.chat} /></svg>;
}
function Status({ value }: { value: string }) { return <span className={`am-status am-status-${['validated', 'corrected', 'refused', 'pending', 'error'].includes(value) ? value : 'neutral'}`}>{STATUS_NAMES[value] || 'À examiner'}</span>; }

function QuotedMessage({text}:{text:string}){
  const match=/^Citation d’Ahmed numérique :\n((?:> [^\n]*(?:\n|$))+?)\n([\s\S]*)$/.exec(text);
  if(!match)return <p>{text}</p>;
  return <><blockquote className="am-cited-message"><cite>Ahmed numérique</cite><p>{match[1].trimEnd().split('\n').map(line=>line.slice(2)).join('\n')}</p></blockquote><p>{match[2]}</p></>;
}

export default function PrivateDoublePage() {
  const [tab, setTab] = useState<Tab>('conversation');
  const [bank, setBank] = useState<Bank | null>(null);
  const [bankBusy, setBankBusy] = useState(false);
  const [bankError, setBankError] = useState('');
  const [memory, setMemory] = useState<Memory[]>([]);
  const [notice, setNotice] = useState('');
  const [privateSession, setPrivateSession] = useState<Session | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const [chatTurns, setChatTurns] = useState<Turn[]>([]);
  const [outgoing, setOutgoing] = useState<Outgoing[]>([]);
  const [message, setMessage] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [chatBusy, setChatBusy] = useState(false);
  const chatLock = useRef(false);
  const lastFailed = useRef<Outgoing | null>(null);
  const [chatError, setChatError] = useState('');
  const [historyBusy, setHistoryBusy] = useState(false);
  const [emojisAllowed, setEmojisAllowed] = useState(true);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [topic, setTopic] = useState('all');
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [reviewTurns, setReviewTurns] = useState<Turn[]>([]);
  const [reviewKind, setReviewKind] = useState<Kind>('all');
  const [reviewStatus, setReviewStatus] = useState('all');
  const [reviewNext, setReviewNext] = useState<string | null>(null);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const reviewGeneration = useRef(0);
  const reviewLock = useRef(false);
  const [highlightTurn, setHighlightTurn] = useState('');
  const [search, setSearch] = useState('');
  const [bankGroup, setBankGroup] = useState('all');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [decisionBusy, setDecisionBusy] = useState<string[]>([]);
  const decisionLocks = useRef(new Set<string>());
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [correction, setCorrection] = useState('');
  const [editError, setEditError] = useState('');
  const correctionRef = useRef<HTMLTextAreaElement | null>(null);
  const [eraseOpen, setEraseOpen] = useState(false);
  const [eraseBusy, setEraseBusy] = useState(false);
  const [eraseError, setEraseError] = useState('');
  const [exportBusy, setExportBusy] = useState<'html' | 'json' | null>(null);
  const [exportProgress, setExportProgress] = useState('');
  const recognition = useRef<SpeechLike | null>(null);
  const [dictation, setDictation] = useState<DictationTarget | null>(null);
  const [dictationHint, setDictationHint] = useState('');
  const mounted = useRef(true);

  const memoryById = new Map(memory.map(entry => [entry.id, entry]));
  const questions: Question[] = (bank?.questions || []).map(question => ({ ...question, answers: question.answers.map(answer => { const saved = memoryById.get(answer.id); const savedStatus = saved ? reviewValue(saved.state) : 'unreviewed'; const status = saved && savedStatus !== 'unreviewed' ? savedStatus : reviewValue(answer.status); return { ...answer, original_text: answer.original_text || answer.text, status, text: saved && ['corrected', 'validated'].includes(savedStatus) && saved.answer.trim() ? saved.answer : answer.text }; }) }));
  const answers = questions.flatMap(question => question.answers);
  const reviewedAnswers = answers.filter(answer => ['validated', 'corrected', 'refused'].includes(answer.status)).length;
  const retainedAnswers = answers.filter(answer => ['validated', 'corrected'].includes(answer.status)).length;
  const groups = [...new Set(questions.map(question => question.group))];
  const topicQuestions = questions.filter(question => topic === 'all' || question.group === topic);
  const suggestions = topic === 'all' ? DEFAULT_SUGGESTIONS : topicQuestions.slice(0, 4).map(question => question.question);
  const filteredQuestions = questions.filter(question => (bankGroup === 'all' || question.group === bankGroup) && (!search.trim() || normalize(`${question.id} ${question.question} ${question.answers.map(answer => answer.text).join(' ')}`).includes(normalize(search.trim()))));
  const visibleReviews = reviewTurns.filter(turn => reviewStatus === 'all' || turn.review === reviewStatus || turn.state === reviewStatus);
  const editBusy = editTarget ? decisionBusy.includes(`${editTarget.type}:${editTarget.id}`) : false;

  async function loadBank(): Promise<void> {
    setBankBusy(true); setBankError('');
    try { const data = await api<Bank>('admin/bank'); if (!Array.isArray(data.questions)) throw new ServiceError('La continuité reçue est incomplète.'); if (mounted.current) setBank(data); }
    catch (error) { if (mounted.current) setBankError(errorText(error)); }
    finally { if (mounted.current) setBankBusy(false); }
  }
  async function refreshMemory(): Promise<void> {
    try { const data = await api<ReviewPage>('admin/review?kind=all'); if (mounted.current && Array.isArray(data.memory)) setMemory(data.memory); } catch { /* La décision est déjà enregistrée ; la prochaine lecture resynchronisera la mémoire. */ }
  }
  async function loadReviews(reset = false, kind: Kind = reviewKind): Promise<void> {
    if (!reset && (reviewLock.current || !reviewNext)) return;
    const generation = reset ? ++reviewGeneration.current : reviewGeneration.current;
    const cursor = reset ? null : reviewNext;
    reviewLock.current = true; setReviewBusy(true); setReviewError('');
    if (reset) { setReviewTurns([]); setReviewNext(null); }
    const params = new URLSearchParams({ kind }); if (cursor) params.set('before', cursor);
    try {
      const data = await api<ReviewPage>(`admin/review?${params}`);
      if (!Array.isArray(data.turns)) throw new ServiceError('La liste des échanges reçue est incomplète.');
      if (!mounted.current || generation !== reviewGeneration.current) return;
      setReviewTurns(previous => mergeTurns(reset ? [] : previous, data.turns));
      if (cursor && data.next === cursor) { setReviewNext(null); setReviewError('La pagination ne progresse plus. Actualise la liste avant de poursuivre.'); } else setReviewNext(data.next || null);
      if (Array.isArray(data.memory)) setMemory(data.memory);
    } catch (error) { if (mounted.current && generation === reviewGeneration.current) setReviewError(errorText(error)); }
    finally { if (mounted.current && generation === reviewGeneration.current) { reviewLock.current = false; setReviewBusy(false); } }
  }
  async function loadHistory(session = sessionRef.current): Promise<void> {
    if (!session || chatLock.current) return;
    setHistoryBusy(true); setChatError('');
    try {
      const data = await api<{ turns: Turn[] }>('history', session);
      if (!Array.isArray(data.turns)) throw new ServiceError('L’historique reçu est incomplet.');
      if (mounted.current && sessionRef.current?.session_id === session.session_id) setChatTurns(previous => mergeTurns(previous, data.turns.map((turn): Turn => ({ ...turn, state: turn.state || (turn.response ? 'complete' : 'error'), review: reviewValue(turn.review || turn.status), kind: 'private' })), false));
    } catch (error) { if (mounted.current) setChatError(errorText(error)); }
    finally { if (mounted.current) setHistoryBusy(false); }
  }
  async function ensureSession(): Promise<Session> {
    if (sessionRef.current) return sessionRef.current;
    const data = await api<Session>('start', { consent: true });
    if (typeof data.session_id !== 'string' || typeof data.token !== 'string') throw new ServiceError('La session privée n’a pas pu être ouverte.');
    sessionRef.current = data; setPrivateSession(data);
    if (!storeSession(data)) setNotice('Le navigateur empêche de conserver cette session pour la prochaine visite. Le fil reste utilisable ici.');
    return data;
  }
  async function sendMessage(input = message, retry?: Outgoing): Promise<void> {
    const trimmed = input.trim();
    if (!trimmed || trimmed.length > MESSAGE_LIMIT || chatLock.current || historyBusy || dictation) return;
    chatLock.current = true; setChatBusy(true); setChatError(''); setEmojiOpen(false);
    const candidate = retry || (lastFailed.current?.message === trimmed && lastFailed.current?.quote?.id === quote?.id ? lastFailed.current : null);
    let id: string;
    try { id = candidate && !candidate.renew ? candidate.request_id : requestId(); }
    catch { chatLock.current = false; setChatBusy(false); setChatError('Ce navigateur ne peut pas créer un identifiant de message sûr. Essaie avec un navigateur plus récent.'); return; }
    const item: Outgoing = { quote: candidate ? candidate.quote : quote, request_id: id, message: trimmed, emojis: candidate?.emojis ?? emojisAllowed, created_at: candidate?.created_at || new Date().toISOString(), state: 'sending' };
    setOutgoing(previous => [...previous.filter(existing => existing.request_id !== id && existing.request_id !== candidate?.request_id), item]);
    if (input === message || retry) setMessage('');
    setQuote(null);
    try {
      const session = await ensureSession();
      const data = await api<ChatPayload>('chat', { ...session, message: trimmed, request_id: id, emojis: item.emojis, ...(item.quote ? {quote_turn_id:item.quote.id} : {}) });
      if (!data.turn || typeof data.turn.response !== 'string' || !data.turn.response.trim()) throw new ServiceError('La réponse du double est incomplète. Relance ce message pour la récupérer.');
      const turn: Turn = { ...data.turn, state: 'complete', review: reviewValue(data.turn.review || data.turn.status), kind: 'private', session_id: session.session_id };
      setChatTurns(previous => mergeTurns(previous, [turn], false));
      setOutgoing(previous => previous.filter(existing => existing.request_id !== id));
      if (lastFailed.current?.request_id === candidate?.request_id || lastFailed.current?.request_id === id) lastFailed.current = null;
      setReviewTurns(previous => reviewKind === 'public' ? previous : mergeTurns(previous, [turn]));
    } catch (error) {
      const failed: Outgoing = { ...item, state: 'failed', error: errorText(error), renew: error instanceof ServiceError && error.renew };
      setOutgoing(previous => previous.map(existing => existing.request_id === id ? failed : existing));
      lastFailed.current = failed.renew ? null : failed;
      setMessage(current => current || trimmed);
      setQuote(current => current || item.quote || null);
    } finally { chatLock.current = false; if (mounted.current) setChatBusy(false); }
  }
  async function decide(target: 'turn' | 'answer', id: string, action: Decision, text?: string): Promise<boolean> {
    const key = `${target}:${id}`;
    if (decisionLocks.current.has(key)) return false;
    decisionLocks.current.add(key); setDecisionBusy(previous => [...previous, key]); setNotice('');
    try {
      const data = await api<{ ok: boolean }>(target === 'turn' ? 'admin/decision' : 'admin/answer', { id, action, ...(action === 'corrected' ? { text: text?.trim() } : {}) });
      if (data.ok !== true) throw new ServiceError('La décision n’a pas été confirmée. Réessaie avant de la considérer comme enregistrée.');
      if (target === 'turn') {
        const update = (turn: Turn): Turn => turn.id === id ? { ...turn, review: action, correction: action === 'corrected' ? text?.trim() : null } : turn;
        setChatTurns(previous => previous.map(update)); setReviewTurns(previous => previous.map(update));
      } else {
        setBank(previous => previous ? { ...previous, questions: previous.questions.map(question => ({ ...question, answers: question.answers.map(answer => answer.id === id ? { ...answer, original_text: answer.original_text || answer.text, status: action, text: action === 'corrected' && text ? text.trim() : answer.text } : answer) })) } : previous);
      }
      setNotice(action === 'validated' ? 'Retenu. La décision est enregistrée dans la continuité.' : action === 'corrected' ? 'Correction enregistrée dans la continuité.' : 'Refus enregistré. Cette formulation est écartée.');
      void refreshMemory(); return true;
    } catch (error) { const message = errorText(error); if (editTarget?.id === id) setEditError(message); else setNotice(message); return false; }
    finally { decisionLocks.current.delete(key); setDecisionBusy(previous => previous.filter(item => item !== key)); }
  }
  function openCorrection(target: EditTarget, current?: string | null): void { if (dictation) recognition.current?.stop(); setEditTarget(target); setCorrection(current || target.original); setEditError(''); setDictationHint(''); }
  function closeCorrection(): void { if (editBusy) return; if (dictation === 'correction') recognition.current?.abort(); setDictation(null); setEditTarget(null); }
  async function saveCorrection(): Promise<void> { if (!editTarget || !correction.trim() || dictation === 'correction') return; const success = await decide(editTarget.type, editTarget.id, 'corrected', correction); if (success) setEditTarget(null); }
  function insertEmoji(emoji: string): void { const input = messageRef.current; const start = input?.selectionStart ?? message.length; const end = input?.selectionEnd ?? start; const next = message.slice(0, start) + emoji + message.slice(end); if (next.length > MESSAGE_LIMIT) return; setMessage(next); setEmojiOpen(false); setTimeout(() => { input?.focus(); input?.setSelectionRange(start + emoji.length, start + emoji.length); }, 0); }
  function toggleDictation(target: DictationTarget): void {
    if (dictation) { recognition.current?.stop(); return; }
    const speechWindow = window as unknown as { SpeechRecognition?: SpeechConstructor; webkitSpeechRecognition?: SpeechConstructor };
    const Speech = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Speech) { setDictationHint('Dictée indisponible ici : utilise le micro du clavier mobile ou écris ton texte.'); (target === 'message' ? messageRef : correctionRef).current?.focus(); return; }
    const base = target === 'message' ? message : correction;
    const limit = target === 'message' ? MESSAGE_LIMIT : CORRECTION_LIMIT;
    const speech = new Speech(); recognition.current = speech; let hadError = false; let truncated = false;
    speech.lang = 'fr-FR'; speech.continuous = true; speech.interimResults = true;
    speech.onresult = event => { let spoken = ''; for (let i = 0; i < event.results.length; i++) spoken += event.results[i][0].transcript + ' '; const combined = base + (base && !/\s$/.test(base) ? ' ' : '') + spoken.trim(); (target === 'message' ? setMessage : setCorrection)(combined.slice(0, limit)); if (combined.length > limit) { truncated = true; setDictationHint('La limite de longueur est atteinte. Relis la transcription avant de l’envoyer.'); speech.stop(); } };
    speech.onerror = event => { hadError = true; setDictation(null); setDictationHint(event.error === 'not-allowed' ? 'Le microphone n’est pas autorisé. Tu peux écrire ou utiliser la dictée de ton clavier.' : 'La dictée s’est interrompue. Le texte reste modifiable ; tu peux réessayer.'); };
    speech.onend = () => { setDictation(null); if (!hadError && !truncated) setDictationHint('Transcription prête à relire et à modifier. Rien n’est envoyé automatiquement.'); };
    try { speech.start(); setDictation(target); setEmojiOpen(false); setDictationHint('Dictée en cours. Appuie à nouveau sur le micro pour arrêter et relire.'); }
    catch { setDictation(null); setDictationHint('La dictée ne peut pas démarrer. Utilise ton clavier ou son microphone.'); }
  }
  async function erasePrivate(): Promise<void> {
    const session = sessionRef.current; if (!session || eraseBusy || chatLock.current) return;
    setEraseBusy(true); setEraseError('');
    try { const data = await api<{ ok: boolean }>('erase', session); if (data.ok !== true) throw new ServiceError('L’effacement n’a pas été confirmé.'); storeSession(null); sessionRef.current = null; setPrivateSession(null); setChatTurns([]);setQuote(null); setOutgoing([]); lastFailed.current = null; setMessage(''); setEraseOpen(false); setChatError(''); setNotice('Le fil privé a été effacé de ce service. Les éventuels courriels déjà reçus restent dans la messagerie.'); void loadReviews(true); }
    catch (error) { setEraseError(errorText(error)); }
    finally { setEraseBusy(false); }
  }
  async function exportHTML(): Promise<void> {
    if (exportBusy) return; setExportBusy('html'); setExportProgress('Lecture de tous les échanges…'); setNotice('');
    try {
      let cursor: string | null = null; let all: Turn[] = []; const visited = new Set<string>();
      do { const params = new URLSearchParams({ kind: 'all' }); if (cursor) params.set('before', cursor); const data = await api<ReviewPage>(`admin/review?${params}`); if (!Array.isArray(data.turns)) throw new ServiceError('Une page d’échanges est incomplète. Aucun export partiel n’a été produit.'); all = mergeTurns(all, data.turns, false); setExportProgress(`${all.length} échange${all.length > 1 ? 's' : ''} récupéré${all.length > 1 ? 's' : ''}…`); cursor = data.next || null; if (cursor) { if (visited.has(cursor)) throw new ServiceError('La pagination ne progresse plus. Aucun export partiel n’a été produit.'); visited.add(cursor); } } while (cursor);
      const base = window.location.origin + window.location.pathname;
      const cards = all.map((turn, index) => `<article id="e-${index + 1}"><header><span>${escapeHTML(turn.kind === 'public' ? 'Conversation publique' : 'Conversation privée')} · ${escapeHTML(dateLabel(turn.created_at))}</span><b>${escapeHTML(STATUS_NAMES[turn.review] || 'À relire')}</b></header><h2>${escapeHTML(turn.prompt)}</h2><h3>Réponse initiale du double</h3><div class="text">${escapeHTML(turn.response || (turn.state === 'pending' ? 'Réponse en attente.' : 'Aucune réponse disponible.'))}</div>${turn.correction ? `<div class="correction"><h3>Correction de l’auteur</h3><div class="text">${escapeHTML(turn.correction)}</div></div>` : ''}<footer><a href="${escapeHTML(base + '?view=review&turn=' + encodeURIComponent(turn.id))}">Revoir cet échange dans l’atelier privé</a> · ${escapeHTML(turn.id)}</footer></article>`).join('\n');
      const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Conversations du double — Ahmed Marie</title><style>body{max-width:850px;margin:50px auto;padding:0 25px;font:16px/1.7 Georgia,serif;color:#24362d;background:#faf8f1}h1{font-size:42px;font-weight:400;line-height:1.1}h2{font-size:23px;font-weight:400;line-height:1.4}h3{font:600 11px Arial,sans-serif;text-transform:uppercase;letter-spacing:.08em;color:#63705e}a{color:#284f3c}article{border-top:1px solid #ccd4c4;padding:30px 0;margin-top:25px}header,footer,.meta{font:12px/1.6 Arial,sans-serif;color:#65705f}header{display:flex;justify-content:space-between;gap:20px}.text{white-space:pre-wrap;overflow-wrap:anywhere}.correction{margin-top:24px;padding:15px 22px;background:#eaf0e4;border-left:3px solid #567b48}footer{margin-top:20px;overflow-wrap:anywhere}@media print{body{margin:0;padding:0;background:white;font-size:11pt}h1{font-size:28pt}article{break-inside:avoid}a{color:inherit}.meta a{display:none}header{font-size:9pt}footer{font-size:8pt}.correction{background:#f3f5ef}}@page{size:A4;margin:20mm}</style></head><body><p class="meta">ATELIER PRIVÉ · AHMED MARIE</p><h1>Les conversations<br>du double.</h1><p class="meta">Export du ${escapeHTML(new Date().toLocaleString('fr-FR'))} · ${all.length} échanges · publics et privés · tous statuts<br><a href="${escapeHTML(base)}">Ouvrir l’atelier privé</a></p><p>Les réponses initiales sont générées. Les décisions et corrections de l’auteur figurent séparément, dans leur état au moment de cet export.</p>${cards || '<p>Aucun échange enregistré.</p>'}</body></html>`;
      download(`ahmed-marie-conversations-${new Date().toISOString().slice(0, 10)}.html`, html, 'text/html;charset=utf-8'); setNotice(`Document exporté : ${all.length} échanges, toutes les pages récupérées.`);
    } catch (error) { setNotice(errorText(error)); }
    finally { setExportBusy(null); setExportProgress(''); }
  }
  async function exportJSON(): Promise<void> {
    if (exportBusy) return; setExportBusy('json'); setExportProgress('Synchronisation de la continuité…'); setNotice('');
    try { const [latestBank, latestReview] = await Promise.all([api<Bank>('admin/bank'), api<ReviewPage>('admin/review?kind=all')]); if (!Array.isArray(latestBank.questions) || !Array.isArray(latestReview.memory)) throw new ServiceError('La continuité reçue est incomplète. L’export a été annulé.'); setBank(latestBank); setMemory(latestReview.memory); download(`ahmed-marie-continuite-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ exported_at: new Date().toISOString(), bank: latestBank, memory: latestReview.memory }, null, 2), 'application/json;charset=utf-8'); setNotice('Banque et mémoire exportées avec leurs décisions actuelles.'); }
    catch (error) { setNotice(errorText(error)); }
    finally { setExportBusy(null); setExportProgress(''); }
  }

  useEffect(() => {
    mounted.current = true; void loadBank();
    const stored = loadStoredSession(); if (stored) { sessionRef.current = stored; setPrivateSession(stored); void loadHistory(stored); }
    const params = new URLSearchParams(window.location.search); if (params.get('view') === 'review') { setTab('review'); setHighlightTurn(params.get('turn') || ''); }
    return () => { mounted.current = false; recognition.current?.abort(); };
    // Initialisation unique : aucune session n’est créée tant qu’un message n’est pas envoyé.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { void loadReviews(true, reviewKind); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [reviewKind]);
  useEffect(() => { if (tab === 'conversation') chatEndRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [chatTurns, outgoing, tab]);
  useEffect(() => { if (editTarget) { const timer = setTimeout(() => correctionRef.current?.focus(), 30); return () => clearTimeout(timer); } }, [editTarget]);
  useEffect(() => {
    if (tab !== 'review' || !highlightTurn || reviewBusy || reviewError) return;
    const found = reviewTurns.find(turn => turn.id === highlightTurn);
    if (found) { document.getElementById('review-' + encodeURIComponent(found.id))?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    else if (reviewNext) void loadReviews(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightTurn, reviewTurns, reviewNext, reviewBusy, reviewError, tab]);
  useEffect(() => { function escape(event: KeyboardEvent) { if (event.key !== 'Escape') return; setEmojiOpen(false); if (editTarget && !editBusy) closeCorrection(); if (eraseOpen && !eraseBusy) setEraseOpen(false); } document.addEventListener('keydown', escape); return () => document.removeEventListener('keydown', escape); });

  function decisionButtons(target: 'turn' | 'answer', id: string, question: string, original: string, status: string, current?: string | null) {
    const disabled = decisionBusy.includes(`${target}:${id}`);
    return <div className="am-decisions" aria-label="Décider de cette formulation"><button type="button" className={status === 'validated' ? 'is-retained' : ''} disabled={disabled} onClick={() => void decide(target, id, status === 'corrected' ? 'corrected' : 'validated', status === 'corrected' ? (current || original) : undefined)}><Icon name="check" size={15} />{target === 'turn' ? 'C’est moi' : 'Retenir'}</button><button type="button" className={status === 'corrected' ? 'is-corrected' : ''} disabled={disabled} onClick={() => openCorrection({ type: target, id, question, original }, current)}><Icon name="edit" size={14} />Corriger</button><button type="button" className={status === 'refused' ? 'is-refused' : ''} disabled={disabled} onClick={() => void decide(target, id, 'refused')}><Icon name="close" size={14} />{target === 'turn' ? 'Pas moi' : 'Refuser'}</button>{disabled && <span className="am-saving">Enregistrement…</span>}</div>;
  }

  return <div className="am-app">
    <aside className="am-sidebar"><a className="am-brand" href="/admin-blog.html?view=atelier"><span className="am-mark">a</span><span>Face à moi<small>L’ATELIER D’AHMED MARIE</small></span></a><div className="am-private-badge"><span />Espace privé</div>
      <nav aria-label="Espaces de l’atelier"><a className="am-public-link" href="/admin-blog.html?view=archives"><Icon name="book"/> Archives</a><button type="button" className={tab === 'conversation' ? 'is-active' : ''} aria-current={tab === 'conversation' ? 'page' : undefined} onClick={() => setTab('conversation')}><Icon name="chat" /><span>Conversation<small>Parler, puis reconnaître</small></span></button><button type="button" className={tab === 'review' ? 'is-active' : ''} aria-current={tab === 'review' ? 'page' : undefined} onClick={() => setTab('review')}><Icon name="review" /><span>Relecture<small>Les échanges à reprendre</small></span></button><button type="button" className={tab === 'continuity' ? 'is-active' : ''} aria-current={tab === 'continuity' ? 'page' : undefined} onClick={() => setTab('continuity')}><Icon name="book" /><span>Continuité<small>Les mots que je retiens</small></span></button></nav>
      <div className="am-sidebar-bottom"><a className="am-public-link" href="/admin-blog.html">Écrire et publier au blog →</a><div className="am-work-count"><p>LE TRAVAIL DE LA VOIX</p><strong>{bank ? reviewedAnswers : '—'}<span> / {bank ? answers.length : '900'}</span></strong><small>variantes relues</small><div className="am-progress" role="progressbar" aria-label="Variantes relues" aria-valuemin={0} aria-valuemax={answers.length || 900} aria-valuenow={reviewedAnswers}><span style={{ width: `${answers.length ? reviewedAnswers / answers.length * 100 : 0}%` }} /></div><small>{bank ? `${retainedAnswers} retenues ou corrigées` : 'Chargement de la continuité'}</small></div><a className="am-public-link" href="/admin-blog.html" target="_blank" rel="noreferrer">Les invitations sont dans le blog <Icon name="external" size={14} /></a></div>
    </aside>
    <main className="am-main">
      <header className="am-topbar"><span>LA TECTONIQUE DES ÂMES <i>/</i> AHMED NUMÉRIQUE</span><span className="am-alpha">ALPHA · ATELIER PRIVÉ</span></header>
      <div className="am-content">
        <div className="am-page-heading"><div><p className="am-eyebrow">{tab === 'conversation' ? 'La voix se trouve en parlant' : tab === 'review' ? 'Après la conversation' : 'Ce qu’Ahmed numérique garde de moi'}</p><h1>{tab === 'conversation' ? <>Alors, <em>c’est moi ?</em></> : tab === 'review' ? <>Relire. <em>Reconnaître.</em></> : <>Une voix, <em>pas une fiche.</em></>}</h1><p className="am-lead">{tab === 'conversation' ? 'Ahmed numérique répond. Ensuite, tu gardes, tu reprends ou tu refuses. Pas besoin de tout régler avant de lui parler.' : tab === 'review' ? 'Les mots qu’il a envoyés, et ceux que tu choisis de lui laisser. Les réponses initiales restent visibles à côté de tes corrections.' : '300 questions, 900 variantes proposées, cinq terrains de conversation. Les décisions déjà enregistrées sont conservées.'}</p></div>{tab !== 'conversation' && <button className="am-button am-button-secondary am-export" type="button" disabled={!!exportBusy} onClick={() => void (tab === 'review' ? exportHTML() : exportJSON())}><Icon name="export" size={17} />{exportBusy ? 'Préparation…' : tab === 'review' ? 'Exporter tous les échanges' : 'Exporter banque & mémoire'}</button>}</div>
        {(notice || exportProgress) && <div className="am-notice" role="status"><span>{exportProgress || notice}</span>{!exportProgress && <button type="button" aria-label="Fermer ce message" onClick={() => setNotice('')}><Icon name="close" size={15} /></button>}</div>}

        {tab === 'conversation' && <div className="am-conversation-layout"><section className="am-chat-card" aria-label="Conversation privée avec Ahmed numérique"><div className="am-card-top"><div className="am-persona"><span className="am-avatar">am</span><div><strong>Ahmed numérique</strong><small>Clone numérique · conversation privée</small></div></div><button className="am-icon-button" type="button" title="Recharger l’historique" aria-label="Recharger l’historique" disabled={!privateSession || historyBusy || chatBusy} onClick={() => void loadHistory()}><Icon name="refresh" size={17} /></button></div>
          <div className="am-chat-log" role="log" aria-label="Messages" aria-live="polite" aria-relevant="additions text"><article className="am-bubble am-bubble-assistant"><span className="am-message-label">AHMED NUMÉRIQUE</span><p>Bonjour. Je suis ton double numérique. Tu me parles, je te réponds. Après, tu me dis si c’est toi, si ça sonne faux, ou si je me suis complètement planté.</p><small className="am-welcome-note">Tu peux aussi me demander « parle moins formellement » ou « réponds plus court ». Je te proposerai le réglage avant de le retenir pour la suite.</small></article>
            {historyBusy && <p className="am-loading" role="status">Je retrouve le fil de cet atelier…</p>}
            {chatError && <div className="am-error" role="alert"><span>{chatError}</span>{privateSession && <button type="button" onClick={() => void loadHistory()} disabled={historyBusy || chatBusy}>Réessayer l’historique</button>}</div>}
            {[...chatTurns.map(turn => ({ type: 'turn' as const, turn, date: turn.created_at })), ...outgoing.map(item => ({ type: 'outgoing' as const, item, date: item.created_at }))].sort((a, b) => a.date.localeCompare(b.date)).map(entry => entry.type === 'turn' ? <div className="am-exchange" key={turnKey(entry.turn)}><article className="am-bubble am-bubble-user"><span className="am-message-label">MOI</span><QuotedMessage text={entry.turn.prompt} /></article><article className="am-bubble am-bubble-assistant"><div className="am-response-label"><span className="am-message-label">AHMED NUMÉRIQUE</span><Status value={entry.turn.review} /></div><p>{entry.turn.response || (entry.turn.state === 'pending' ? 'La réponse est encore en attente.' : 'Aucune réponse disponible pour cet échange.')}</p>{entry.turn.correction && <div className="am-correction"><span>MA CORRECTION</span><p>{entry.turn.correction}</p></div>}{entry.turn.response && entry.turn.state==='complete' && <button type="button" className="am-quote-button" disabled={chatBusy||historyBusy||!!dictation} onClick={()=>{setQuote({id:entry.turn.id,text:entry.turn.response});messageRef.current?.focus();messageRef.current?.scrollIntoView({block:'nearest',behavior:'smooth'});}}>❝ Citer</button>}{entry.turn.response && decisionButtons('turn', entry.turn.id, entry.turn.prompt, entry.turn.response, entry.turn.review, entry.turn.correction)}</article></div> : <div className="am-exchange" key={entry.item.request_id}><article className="am-bubble am-bubble-user"><span className="am-message-label">MOI</span>{entry.item.quote && <blockquote className="am-cited-message"><cite>Ahmed numérique</cite><p>{entry.item.quote.text}</p></blockquote>}<p>{entry.item.message}</p></article><div className={`am-pending ${entry.item.state === 'failed' ? 'am-pending-error' : ''}`} role="status">{entry.item.state === 'sending' ? <span>Ahmed numérique prépare sa réponse.</span> : <><span>{entry.item.error}<small>{entry.item.renew ? 'Le service demande un nouvel envoi. Un nouvel identifiant sera créé.' : 'La relance conserve le même identifiant pour éviter un doublon.'}</small></span><button type="button" disabled={chatBusy || historyBusy || !!dictation} onClick={() => void sendMessage(entry.item.message, entry.item)}>{entry.item.renew ? 'Renvoyer' : 'Réessayer'}</button></>}</div></div>)}<div ref={chatEndRef} />
          </div>
          {!chatTurns.length && !outgoing.length && <div className="am-suggestions">{suggestions.map(suggestion => <button type="button" key={suggestion} disabled={chatBusy || historyBusy || !!dictation} onClick={() => void sendMessage(suggestion)}>{suggestion}</button>)}</div>}
          <form className="am-composer" onSubmit={event => { event.preventDefault(); void sendMessage(); }}>{quote && <div className="am-quote-preview"><div><strong>Citation d’Ahmed numérique</strong><button type="button" aria-label="Retirer la citation" disabled={chatBusy} onClick={()=>{setQuote(null);messageRef.current?.focus();}}>×</button></div><blockquote>{quote.text}</blockquote></div>}<div className="am-editor"><label className="am-sr-only" htmlFor="am-message">Message au double</label><textarea id="am-message" ref={messageRef} value={message} onChange={event => setMessage(event.target.value)} readOnly={dictation === 'message'} maxLength={MESSAGE_LIMIT} rows={3} placeholder="Parle-moi. On verra bien si je me reconnais." onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && !dictation) { event.preventDefault(); void sendMessage(); } }} />
            {emojiOpen && <div className="am-emoji-menu" role="group" aria-label="Choisir un emoji">{EMOJIS.map(emoji => <button type="button" key={emoji} aria-label={`Insérer ${emoji}`} onClick={() => insertEmoji(emoji)}>{emoji}</button>)}</div>}
            <div className="am-editor-tools"><button type="button" className="am-icon-button" disabled={!!dictation} aria-expanded={emojiOpen} aria-label="Choisir un emoji" onClick={() => setEmojiOpen(!emojiOpen)}><Icon name="smile" /></button><button type="button" className={`am-icon-button ${dictation === 'message' ? 'is-recording' : ''}`} aria-label={dictation === 'message' ? 'Arrêter la dictée' : 'Dicter le message'} aria-pressed={dictation === 'message'} disabled={chatBusy || historyBusy || dictation === 'correction'} onClick={() => toggleDictation('message')}><Icon name="mic" /></button><span className="am-tools-spacer" /><span className="am-character-count">{message.length.toLocaleString('fr-FR')} / 3 000</span><button className="am-send" type="submit" disabled={!message.trim() || chatBusy || historyBusy || !!dictation} aria-label="Envoyer le message"><Icon name="arrow" /></button></div></div><div className="am-composer-bottom"><label className="am-switch-label"><input type="checkbox" role="switch" checked={emojisAllowed} onChange={event => setEmojisAllowed(event.target.checked)} /><span>Emojis bienvenus dans ses réponses</span></label><span>Entrée pour envoyer · Maj + Entrée pour une ligne</span></div><p className="am-dictation-hint" role="status">{dictationHint || 'Tu peux dicter, puis relire. Seul le texte envoyé rejoint la conversation.'}</p></form>
        </section><aside className="am-conversation-aside"><section className="am-note-card"><p className="am-eyebrow">Pour ouvrir une porte</p><h2>Changer<br />de terrain.</h2><label htmlFor="am-topic">Un thème, ou tout à la fois</label><select id="am-topic" value={topic} onChange={event => setTopic(event.target.value)}><option value="all">Tous mes terrains</option>{groups.map(group => <option key={group} value={group}>{groupName(group)}</option>)}</select><button type="button" className="am-button am-surprise" disabled={chatBusy || historyBusy || !!dictation} onClick={() => { const pool = topicQuestions.length ? topicQuestions.map(question => question.question) : DEFAULT_SUGGESTIONS; void sendMessage(pool[Math.floor(Math.random() * pool.length)]); }}><Icon name="sparkle" size={17} />Surprends-moi</button><p>Une question tirée de la banque, une réponse générée. Tu décides ensuite si elle te ressemble.</p></section><div className="am-aside-quote">Le premier mot n’a pas besoin d’être le dernier.</div><details className="am-small-details"><summary>Ce que devient une décision</summary><p>« C’est moi » retient la réponse. « Corriger » enregistre tes mots. « Pas moi » l’écarte. Les décisions passent par le service de continuité ; elles ne sont pas seulement gardées dans ce navigateur.</p></details><details className="am-small-details"><summary>À propos de la dictée</summary><p>La reconnaissance vocale dépend du navigateur et peut traiter le son à distance. Cet atelier transmet seulement ton texte au service de conversation. Il n’envoie jamais une transcription automatiquement.</p></details><button type="button" className="am-text-button am-erase-link" disabled={!privateSession || chatBusy || historyBusy || !!dictation} onClick={() => { setEraseError(''); setEraseOpen(true); }}>Effacer ce fil privé</button></aside></div>}

        {tab === 'review' && <section aria-label="Relecture des conversations"><div className="am-filter-bar"><div className="am-segmented" aria-label="Origine des échanges">{(['all', 'public', 'private'] as Kind[]).map(kind => <button type="button" key={kind} className={reviewKind === kind ? 'is-active' : ''} aria-pressed={reviewKind === kind} onClick={() => { setHighlightTurn(''); setReviewKind(kind); }}>{kind === 'all' ? 'Tous les échanges' : kind === 'public' ? 'Publics' : 'Privés'}</button>)}</div><label className="am-select-label"><span>État</span><select value={reviewStatus} onChange={event => setReviewStatus(event.target.value)}><option value="all">Tous les états</option><option value="unreviewed">À relire</option><option value="validated">Retenus</option><option value="corrected">Corrigés</option><option value="refused">Refusés</option><option value="pending">Réponse en attente</option><option value="error">Erreurs</option></select></label><button className="am-icon-button" type="button" aria-label="Actualiser les échanges" disabled={reviewBusy} onClick={() => void loadReviews(true)}><Icon name="refresh" size={18} /></button></div><p className="am-results-note">{visibleReviews.length} échange{visibleReviews.length > 1 ? 's' : ''} affiché{visibleReviews.length > 1 ? 's' : ''} sur {reviewTurns.length} chargé{reviewTurns.length > 1 ? 's' : ''}{reviewNext ? ' · la suite reste à charger' : ''}</p>
          {reviewError && <div className="am-error" role="alert"><span>{reviewError}</span><button type="button" disabled={reviewBusy} onClick={() => void loadReviews(!reviewTurns.length)}>Réessayer</button></div>}
          <div className="am-review-list">{visibleReviews.map(turn => <article className={`am-review-card ${turn.id === highlightTurn ? 'is-highlighted' : ''}`} id={'review-' + encodeURIComponent(turn.id)} key={turnKey(turn)}><div className="am-review-meta"><span className={`am-kind am-kind-${turn.kind}`}>{turn.kind === 'public' ? 'PUBLIC' : 'PRIVÉ'}</span><time dateTime={turn.created_at}>{dateLabel(turn.created_at)}</time><span className="am-meta-spacer" /><Status value={turn.review} /></div><h2>{turn.prompt}</h2><div className="am-review-response"><span className="am-field-label">RÉPONSE INITIALE DU DOUBLE</span><p>{turn.response || (turn.state === 'pending' ? 'La réponse n’est pas encore disponible.' : 'Cet échange n’a pas produit de réponse.')}</p></div>{turn.correction && <div className="am-correction"><span>MA CORRECTION</span><p>{turn.correction}</p></div>}{turn.state !== 'complete' && <Status value={turn.state} />}{turn.response && decisionButtons('turn', turn.id, turn.prompt, turn.response, turn.review, turn.correction)}</article>)}</div>
          {!visibleReviews.length && !reviewBusy && !reviewError && <div className="am-empty"><Icon name="review" size={28} /><h2>{reviewTurns.length ? 'Rien dans ce filtre, pour le moment.' : 'Le fil attend ses premières conversations.'}</h2><p>{reviewNext ? 'D’autres échanges peuvent correspondre dans les pages suivantes.' : 'Les échanges publics et privés apparaîtront ici pour être relus.'}</p></div>}
          {reviewBusy && <p className="am-loading" role="status">Chargement des échanges…</p>}{reviewNext && <div className="am-pagination"><button type="button" className="am-button am-button-secondary" disabled={reviewBusy} onClick={() => void loadReviews(false)}>{reviewBusy ? 'Chargement…' : 'Charger la suite'}</button></div>}
        </section>}

        {tab === 'continuity' && <section aria-label="Banque de continuité"><div className="am-stat-grid"><div><strong>{bank ? questions.length : '—'}</strong><span>questions disponibles</span></div><div><strong>{bank ? answers.length : '—'}</strong><span>variantes proposées</span></div><div><strong>{bank ? retainedAnswers : '—'}</strong><span>retenues ou corrigées</span></div><div><strong>{memory.length}</strong><span>entrées de mémoire reçues</span></div></div><div className="am-bank-tools"><label className="am-search"><Icon name="search" size={18} /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Une question, un mot, un identifiant…" aria-label="Chercher dans les questions et les variantes" /></label><button type="button" className="am-icon-button" disabled={bankBusy} aria-label="Actualiser la banque" onClick={() => void loadBank()}><Icon name="refresh" size={18} /></button></div><div className="am-group-tabs" aria-label="Rubriques de la continuité"><button type="button" className={bankGroup === 'all' ? 'is-active' : ''} aria-pressed={bankGroup === 'all'} onClick={() => setBankGroup('all')}>Tout</button>{groups.map(group => <button type="button" className={bankGroup === group ? 'is-active' : ''} aria-pressed={bankGroup === group} key={group} onClick={() => setBankGroup(group)}><span>{group.length === 1 ? group : ''}</span>{groupName(group)}<small>{questions.filter(question => question.group === group).length}</small></button>)}</div><div className="am-bank-caption"><span>{filteredQuestions.length} question{filteredQuestions.length > 1 ? 's' : ''}{search ? ' trouvées' : ''}</span><span>{bank ? `Version ${bank.version}` : 'Synchronisation avec le service'}</span></div>
          {bankError && <div className="am-error" role="alert"><span>{bankError}</span><button type="button" disabled={bankBusy} onClick={() => void loadBank()}>Réessayer</button></div>}{bankBusy && !bank && <p className="am-loading">Chargement des questions et des décisions existantes…</p>}
          <div className="am-question-list">{filteredQuestions.map(question => { const retained = question.answers.filter(answer => ['validated', 'corrected'].includes(answer.status)).length; const opened = openQuestion === question.id; return <article className={`am-question-card ${opened ? 'is-open' : ''}`} key={question.id}><button type="button" className="am-question-heading" aria-expanded={opened} aria-controls={'answers-' + question.id} onClick={() => setOpenQuestion(opened ? null : question.id)}><span className="am-question-id">{question.id}</span><span className="am-question-title">{question.question}<small>{groupName(question.group)}</small></span><span className="am-question-count">{retained ? `${retained} retenue${retained > 1 ? 's' : ''}` : `${question.answers.length} variantes`}</span><span className="am-accordion-mark">{opened ? '−' : '+'}</span></button>{opened && <div className="am-answers" id={'answers-' + question.id}>{question.answers.map((answer, index) => <section className="am-answer" key={answer.id}><div className="am-answer-meta"><span>VARIANTE {index + 1}<small>{answer.id}</small></span><Status value={answer.status} /></div><p>{answer.text}</p>{answer.original_text && answer.original_text !== answer.text && <details className="am-original"><summary>Formulation initiale</summary><p>{answer.original_text}</p></details>}{decisionButtons('answer', answer.id, question.question, answer.text, answer.status)}</section>)}</div>}</article>; })}</div>
          {!filteredQuestions.length && bank && <div className="am-empty"><Icon name="search" size={28} /><h2>Aucune correspondance.</h2><p>Essaie un autre mot ou une autre rubrique. La recherche ignore les accents.</p></div>}
        </section>}
        <footer className="am-footer"><span>Ahmed Marie · un double à corriger, une voix à garder</span><span>Les décisions sont enregistrées par le service de continuité.</span></footer>
      </div>
    </main>
    {editTarget && <div className="am-modal-backdrop" onClick={event => { if (event.target === event.currentTarget) closeCorrection(); }}><section className="am-modal" role="dialog" aria-modal="true" aria-labelledby="am-edit-title"><div className="am-modal-top"><p className="am-eyebrow">Reprendre mes mots</p><button type="button" className="am-icon-button" aria-label="Fermer la correction" disabled={editBusy} onClick={closeCorrection}><Icon name="close" /></button></div><h2 id="am-edit-title">Je le dirais <em>comme ça.</em></h2><p className="am-edit-question">{editTarget.question}</p><details className="am-original"><summary>Revoir la formulation initiale</summary><p>{editTarget.original}</p></details><label className="am-field-label" htmlFor="am-correction">TA FORMULATION À RETENIR</label><textarea id="am-correction" ref={correctionRef} value={correction} onChange={event => setCorrection(event.target.value)} readOnly={dictation === 'correction'} maxLength={CORRECTION_LIMIT} rows={7} /><div className="am-correction-tools"><button type="button" className={`am-button am-button-secondary ${dictation === 'correction' ? 'is-recording' : ''}`} disabled={editBusy || dictation === 'message'} onClick={() => toggleDictation('correction')} aria-pressed={dictation === 'correction'}><Icon name="mic" size={17} />{dictation === 'correction' ? 'Arrêter la dictée' : 'Dicter ma correction'}</button><span>{correction.length.toLocaleString('fr-FR')} / 6 000</span></div><p className="am-dictation-hint" role="status">{dictationHint || 'Tu peux dicter, relire et modifier. La correction ne part qu’après ton clic.'}</p>{editError && <p className="am-error" role="alert">{editError}</p>}<div className="am-modal-actions"><button type="button" className="am-button am-button-secondary" disabled={editBusy} onClick={closeCorrection}>Annuler</button><button type="button" className="am-button" disabled={editBusy || !correction.trim() || !!dictation} onClick={() => void saveCorrection()}><Icon name="check" size={16} />{editBusy ? 'Enregistrement…' : 'Garder cette correction'}</button></div></section></div>}
    {eraseOpen && <div className="am-modal-backdrop"><section className="am-modal am-modal-small" role="dialog" aria-modal="true" aria-labelledby="am-erase-title"><p className="am-eyebrow">Le fil privé</p><h2 id="am-erase-title">Effacer cette conversation ?</h2><p>Les échanges de ce fil seront supprimés du service, ainsi que leur reprise sur cet appareil. Les éventuels courriels déjà reçus ne peuvent pas être effacés depuis cet atelier.</p>{eraseError && <p className="am-error" role="alert">{eraseError}</p>}<div className="am-modal-actions"><button type="button" className="am-button am-button-secondary" disabled={eraseBusy} onClick={() => setEraseOpen(false)}>Garder le fil</button><button type="button" className="am-button am-button-danger" disabled={eraseBusy} onClick={() => void erasePrivate()}>{eraseBusy ? 'Effacement…' : 'Effacer le fil'}</button></div></section></div>}
  </div>;
}
