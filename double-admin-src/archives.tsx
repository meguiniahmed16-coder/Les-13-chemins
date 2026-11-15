import {useEffect,useRef,useState} from 'react';
import './archives.css';

type Archive={session_id:string;title:string;kind:string;created_at:string;archived_at:string;turn_count:number;published_at?:string|null;published_archive_at?:string|null};
type Turn={id:string;prompt:string;response:string;created_at:string;correction?:string;state:string};
type Detail=Archive&{turns:Turn[]};
const date=(value:string)=>new Date(value).toLocaleString('fr-FR',{timeZone:'Europe/Paris',dateStyle:'medium',timeStyle:'short'});
async function get<T>(query:string,signal:AbortSignal):Promise<T>{
  const r=await fetch('/api/atelier/double/admin/archives'+query,{credentials:'same-origin',cache:'no-store',signal});
  const data=await r.json();
  if(!r.ok)throw new Error(r.status===401?'Ta session a expiré. Recharge la page pour te reconnecter.':data.error||'Les archives ne sont pas disponibles. Réessaie.');
  return data;
}
export default function Archives(){
  const [items,setItems]=useState<Archive[]>([]),[next,setNext]=useState<string|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [detail,setDetail]=useState<Detail|null>(null),[opening,setOpening]=useState(false),[detailError,setDetailError]=useState('');
  const [selected,setSelected]=useState('');
  const [publishing,setPublishing]=useState(false),[publicationMessage,setPublicationMessage]=useState(''),[speakerConfirmed,setSpeakerConfirmed]=useState(false);
  const listRequest=useRef<AbortController|null>(null),detailRequest=useRef<AbortController|null>(null);
  async function load(reset=true){
    listRequest.current?.abort();const controller=new AbortController();listRequest.current=controller;setBusy(true);setError('');
    try{const data=await get<{archives:Archive[];next:string|null}>(reset?'':'?before='+encodeURIComponent(next||''),controller.signal);if(controller.signal.aborted)return;
      setItems(previous=>reset?data.archives:[...new Map([...previous,...data.archives].map(a=>[a.session_id,a])).values()]);setNext(data.next);
    }catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Chargement impossible.');}
    finally{if(!controller.signal.aborted)setBusy(false);}
  }
  async function open(id:string){
    detailRequest.current?.abort();const controller=new AbortController();detailRequest.current=controller;setSelected(id);setOpening(true);setDetail(null);setDetailError('');setPublicationMessage('');
    try{const data=await get<{archive:Detail}>('?session_id='+encodeURIComponent(id),controller.signal);if(!controller.signal.aborted){setDetail(data.archive);setSpeakerConfirmed(data.archive.kind==='private');}}
    catch(e){if(!controller.signal.aborted)setDetailError(e instanceof Error?e.message:'Ouverture impossible.');}
    finally{if(!controller.signal.aborted)setOpening(false);}
  }
  async function publish(value:boolean){
    if(!detail||publishing)return;const id=detail.session_id;setPublishing(true);setPublicationMessage('');
    try{const r=await fetch('/api/atelier/double/admin/archive-publication',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({session_id:id,archived_at:detail.archived_at,publish:value,speaker_confirmed:speakerConfirmed}),signal:AbortSignal.timeout(25000)});const data=await r.json();if(!r.ok)throw new Error(data.error||'La publication n’a pas été confirmée.');await open(id);await load();setPublicationMessage(value?'Le dialogue est publié sur la page publique.':'Le dialogue a été retiré de la page publique. L’archive reste conservée.');}
    catch(e){setPublicationMessage(e instanceof Error?e.message:'La publication n’a pas été confirmée.');}finally{setPublishing(false);}
  }
  useEffect(()=>{void load();return()=>{listRequest.current?.abort();detailRequest.current?.abort();};},[]);
  return <main className="am-archives">
    <header className="am-archives-header"><div><p className="am-eyebrow">Ahmed numérique · Administration</p><h1>Conversations archivées</h1><p>Dis « archive cette conversation », « garde ça pour plus tard » ou « conserve notre échange ». Tu peux préciser « entre 19h et 19h30 » ou « à partir de 15/11/2026 19h ». Horaires de Paris. Relis ici le dialogue, puis choisis de le publier.</p><a href="/dialogues.html" target="_blank" rel="noreferrer">Voir le dialogue public Ahmed Marie ↔ Ahmed numérique →</a></div><nav aria-label="Administration"><a href="/admin-blog.html">Écrire</a><a href="/admin-blog.html?view=atelier">Conversation</a><a href="/admin-blog.html?view=review">Relecture</a><form action="/api/atelier/auth/logout" method="post"><button type="submit">Se déconnecter</button></form></nav></header>
    <div className="am-archives-layout"><section className="am-archive-list" aria-label="Liste des conversations archivées"><div className="am-archive-list-head"><h2>Les conversations</h2><button type="button" disabled={busy} onClick={()=>void load()}>Actualiser</button></div>
      {error&&<p role="alert">{error}</p>}{busy&&<p role="status">Chargement des archives…</p>}
      {!busy&&!error&&!items.length&&<p>Aucune conversation archivée pour le moment.</p>}
      {items.map(a=><button type="button" disabled={publishing} className={'am-archive-item'+(selected===a.session_id?' is-selected':'')} key={a.session_id} aria-pressed={selected===a.session_id} onClick={()=>void open(a.session_id)}><strong>{a.title}</strong><span>{date(a.archived_at)}</span><small>{a.turn_count} échanges · {a.published_at?'Publié':a.kind==='private'?'Conversation privée':'Conversation du blog'}</small></button>)}
      {next&&<button type="button" disabled={busy} onClick={()=>void load(false)}>Afficher les archives précédentes</button>}
    </section><section className="am-archive-detail" aria-label="Contenu de la conversation">
      {opening&&<p role="status">Ouverture de la conversation…</p>}
      {detailError&&<div role="alert"><p>{detailError}</p><button onClick={()=>void open(selected)}>Réessayer</button></div>}
      {!detail&&!opening&&!detailError&&<p>Choisis une conversation pour la relire.</p>}
      {publicationMessage&&<p role="status">{publicationMessage}</p>}
      {detail&&<div className="am-archive-publication"><p>{detail.published_at?'Ce dialogue est public. Tu peux publier la version relue ou le retirer.':'Ce dialogue est conservé dans tes archives. Tu peux le publier sur la page publique après relecture.'}</p>{detail.kind!=='private'&&<label><input type="checkbox" checked={speakerConfirmed} onChange={e=>setSpeakerConfirmed(e.target.checked)}/> Je suis l’interlocuteur de ce dialogue : Ahmed Marie.</label>}<div><button disabled={publishing||!speakerConfirmed} onClick={()=>void publish(true)}>{publishing?'Enregistrement…':detail.published_at?'Mettre à jour le dialogue public':'Publier le dialogue'}</button>{detail.published_at&&<button disabled={publishing} onClick={()=>void publish(false)}>Retirer de la page publique</button>}</div></div>}
      {detail&&<><h2>{detail.title}</h2><p className="am-archive-date">Commencée le {date(detail.created_at)} · Archivée le {date(detail.archived_at)}</p><p className="am-archive-note">Tu peux poursuivre le chat. Pour ajouter les nouveaux messages à cette archive, redemande l’archivage.</p>{detail.turns.map(t=><article key={t.id} className="am-archive-exchange"><time dateTime={t.created_at}>{date(t.created_at)}</time><h3>{detail.kind==='private'?'Moi':'Interlocuteur'}</h3><p>{t.prompt}</p><h3>Ahmed numérique</h3><p>{t.response||'Aucune réponse enregistrée pour ce message.'}</p>{t.correction&&<div className="am-archive-correction"><h3>Ma correction</h3><p>{t.correction}</p></div>}{t.response&&<a href={'/admin-blog.html?view=review&turn='+encodeURIComponent(t.id)}>Corriger dans Relecture →</a>}</article>)}</>}
    </section></div>
  </main>;
}

