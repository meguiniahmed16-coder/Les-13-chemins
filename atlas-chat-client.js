const endpoint = 'https://ahmed-marie-double.meguiniahmed16.workers.dev/personnages/';
export const limit=1600;
export async function characterReply(id,question,turns,signal){
  const history = turns.slice(-8).map(t => ({question:t.question.slice(0,limit),answer:t.answer.slice(0,limit)}));
  const r = await fetch(endpoint+encodeURIComponent(id)+'/chat',{
    method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',signal,
    body:JSON.stringify({message:question,history})
  });
  const data = await r.json();
  if (!r.ok || typeof data.answer !== 'string' || !data.answer.trim()) {
    throw Error(data.error || 'La réponse n’a pas pu arriver.');
  }
  return data.answer.trim();
}
