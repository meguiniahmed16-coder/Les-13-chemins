import {characterReply,limit} from './atlas-chat-client.js';
const threads = new Map();


function threadFor(id) {
  if (threads.has(id)) return threads.get(id);
  let turns = [];
  try {
    const saved = JSON.parse(sessionStorage.getItem('atlas-fil-' + id) || '[]');
    if (Array.isArray(saved)) turns = saved.filter(t => t && typeof t.question === 'string' && typeof t.answer === 'string').slice(-40);
  } catch {}
  const thread = {turns, draft:'', pending:false, error:'', update:null};
  threads.set(id,thread);
  return thread;
}

export function mountDiscussion(host, person, id) {
  const {element} = window.TreizeAtlasPersonnages;
  const thread = threadFor(id);
  const note = element('p','ap-chat-note','Conversation imaginée à partir de sa continuité. Le fil reste dans cet onglet.');
  const log = element('div','ap-chat-log');
  log.setAttribute('role','log');
  log.setAttribute('aria-label','Échange avec '+person.name);
  const form = element('form','ap-chat-form');
  const input = element('textarea','');
  input.rows = 2; input.maxLength = limit;
  input.placeholder = 'Ton message…';
  input.setAttribute('aria-label','Ton message à '+person.name);
  input.value = thread.draft;
  const send = element('button','ap-primary','Envoyer'); send.type = 'submit';
  const status = element('p','ap-chat-status'); status.setAttribute('role','status');
  form.append(input,send);
  host.append(note,log,form,status);
  function bubble(label, value, own) {
    const row = element('div','ap-chat-bubble'+(own?' ap-chat-own':''));
    row.append(element('strong','',label),element('p','',value));
    return row;
  }
  function update() {
    if (!host.isConnected) return;
    const rows = thread.turns.flatMap(t => [bubble('Toi',t.question,true),bubble(person.name,t.answer,false)]);
    if (thread.pending) rows.push(bubble('Toi',thread.draft,true));
    log.replaceChildren(...rows); log.scrollTop = log.scrollHeight;
    input.value = thread.draft; input.readOnly = thread.pending;
    send.disabled = thread.pending || !input.value.trim();
    status.textContent = thread.pending ? 'Réponse en cours…' : thread.error;
  }
  thread.update = update;
  input.addEventListener('input',() => {
    thread.draft = input.value;
    send.disabled = thread.pending || !input.value.trim();
  });
  form.addEventListener('submit',async e => {
    e.preventDefault();
    const question = thread.draft.trim();
    if (thread.pending || !question) return;
    thread.pending = true; thread.error = ''; update();
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(),60000);
    try {
      const answer=await characterReply(id,question,thread.turns,abort.signal);
      thread.turns.push({question,answer});
      thread.turns = thread.turns.slice(-40);
      thread.draft = '';
      try { sessionStorage.setItem('atlas-fil-'+id,JSON.stringify(thread.turns)); } catch {}
    } catch (err) {
      thread.error = err instanceof TypeError || err.name === 'AbortError'
        ? 'La connexion a été interrompue. Ton message est prêt à être renvoyé.' : err.message;
    } finally {
      clearTimeout(timer); thread.pending = false; thread.update();
    }
  });
  update();
}
