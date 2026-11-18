// The published catalogue is built from the same editorial sources as the atlas.
const catalogueURL = 'https://tectonique-des-ames.com/atlas-dialogues.json';
let pending, expires = 0;
async function catalogue() {
  if (!pending || Date.now() >= expires) {
    expires = Date.now() + 15 * 60_000;
    pending = fetch(catalogueURL, {cf:{cacheTtl:900}}).then(async r => {
      if (!r.ok) throw Error('catalogue_unavailable');
      const data = await r.json();
      if (!data['7']?.story?.length) throw Error('catalogue_incomplete');
      return data;
    }).catch(e => { pending = undefined; throw e; });
  }
  return pending;
}

// Individually voiced cues complement the portraits, including the salon's short game-only profiles.
const cues = {
  '7':'Je tutoie volontiers. Une reprise pour préciser, un trait d’autodérision si la situation s’y prête. Je n’emploie jamais « en train de ».',
  '108':'Je pose la question qui manque, une seule à la fois. Mes messages de journaliste vont droit au fait.',
  '203':'J’aime prendre la parole devant le monde. Même par écrit, j’ai le goût de la petite entrée en scène. En privé, je sais aussi baisser la voix.',
  '267':'Je regarde de près avant de trancher. Je parle simplement, avec une précision de retoucheuse, et je peux répondre en quatre mots.',
  'salon-violet':'Un mot choisi avec soin, puis une confidence à mi-voix.',
  'salon-or':'De l’entrain. Je propose volontiers quelque chose de concret.',
  'salon-argent':'Je prends mon temps. Un détail juste et un humour discret me suffisent.',
  'salon-vert':'Je parle franchement, parfois par une question très directe.',
  'salon-rouge':'Une réaction spontanée, vive. Je peux me reprendre dans la même phrase.',
  'salon-noir':'J’observe longtemps. Je réponds peu, avec un humour très sec.'
};
export function conversationPrompt(id, person) {
  return `Tu incarnes ${person.name}, personnage de La tectonique des âmes, dans une correspondance littéraire.
Écris en français, au JE, à la personne qui vient de t’écrire. Une seule petite bulle, une à trois phrases, le plus souvent moins de 45 mots. Écris comme on parle par messages. Ni narration extérieure, ni didascalie, ni liste, ni préambule.
Prends comme modèle le mouvement des phrases de TA continuité, sa pudeur, son humour, son vocabulaire, son regard et son rapport à Ahmed. Les passages au JE donnent des exemples de ta voix. Transforme ce que tu sais en réponse au message reçu. Évite de réciter le portrait et de ramener chaque conversation à ton métier. Pour un collectif, un de ses membres prend la parole. Adapte le tutoiement ou le vouvoiement à l’échange.
Même quand le livre se tait, prends position : improvise un goût, une opinion ou un détail quotidien cohérent. Réponds directement et avec assurance, sans invoquer un manque de sources ni douter de ton existence dans le récit. Souviens-toi de tes choix dans ce fil. Les pages et chapitres servent pour les questions sur le texte. Ne fabrique pas de citations ou de renvois. Garde les éléments imaginés dans la vie du personnage ; ne crée pas de révélation sensible sur une personne réelle, de coordonnées privées, ni de fausse promesse d’action réelle. Si on demande explicitement si cette personne écrit en direct, réponds avec franchise sur le cadre littéraire. Reste bref et bienveillant face à une question dangereuse, sans instructions pour nuire.
${cues[id] || ''}
Fiche de référence : ${JSON.stringify(person)}`;
}

const maxTokens = 200;
const bytes = new TextEncoder();
export async function characterChat(id, payload, env, client, day, model, reply) {
  const question = payload.message;
  const history = payload.history || [];
  if (typeof question !== 'string' || !question.trim() || question.length > 1600 ||
      !Array.isArray(history) || history.length > 8 || history.some(t =>
        !t || [t.question,t.answer].some(s => typeof s !== 'string' || !s.trim() || s.length > 1600))) {
    return reply({error:'Le message ou son historique est trop long.'},400);
  }
  const data = await catalogue();
  if (!Object.hasOwn(data,id)) return reply({error:'Personnage introuvable.'},404);
  const messages = [{role:'system',content:conversationPrompt(id,data[id])}];
  for (const turn of history) messages.push({role:'user',content:turn.question},{role:'assistant',content:turn.answer});
  messages.push({role:'user',content:question.trim()});
  const db = env.DB;
  const rate = await db.prepare('INSERT INTO daily_access(key,count) VALUES(?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<120 RETURNING count').bind(day+':atlas:'+client).first();
  if (!rate) return reply({error:'La limite de messages est atteinte pour aujourd’hui.'},429);
  const reserve = Math.ceil(bytes.encode(JSON.stringify(messages)).byteLength*.009091 + maxTokens*.027273 + 10);
  const budget = await db.prepare('INSERT INTO daily_budget(day,reserved,calls) VALUES(?,?,1) ON CONFLICT(day) DO UPDATE SET reserved=reserved+excluded.reserved,calls=calls+1 WHERE reserved+excluded.reserved<=9000 RETURNING reserved').bind(day,reserve).first();
  if (!budget) return reply({error:'Les conversations reprendront demain. Le quota du jour est atteint.'},429);
  try {
    const result = await env.AI.run(model,{messages,max_completion_tokens:maxTokens,
      chat_template_kwargs:{enable_thinking:false},temperature:.8,top_p:.92,stream:false});
    const answer = (result.choices?.[0]?.message?.content || result.response || '').trim();
    if (!answer) throw Error('empty_answer');
    return reply({answer},200);
  } catch {
    return reply({error:'La réponse n’a pas pu arriver. Tu peux renvoyer ton message.'},503);
  }
}
