import {useCallback,useEffect,useState,type FormEvent} from 'react';
import './members-admin.css';
type Person={id:string;email:string;pseudo:string;name:string;provider:string;created:string};
type Invite={id:string;email:string;name:string;state:string;created:string;sent_at:string|null;registered:boolean};
type Directory={members:Person[];invitations:Invite[];mailConfigured:boolean};
const API='/api/admin-unified/';
const subject='Bienvenue dans La Tectonique des âmes — invitation';
function message(name:string){
 return `Bonjour ${name||''},

Je t'invite à rejoindre « La Tectonique des âmes » dans l'espace Compagnon de route.

Pour créer ton compte :
1. Ouvre https://tectonique-des-ames.com/membre.html
2. Choisis « S’inscrire ».
3. Indique ton adresse e-mail, choisis un mot de passe et un pseudonyme.
4. Complète ton profil et personnalise ton personnage.
5. Découvre la Maison des rencontres et les Treize Chemins.

Bienvenue dans ce monde en construction. Ta présence aidera à le faire vivre.

Ahmed Marie
https://tectonique-des-ames.com/`;
}
async function api<T>(action:string,body?:object):Promise<T>{
 const r=await fetch(API+action,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'content-type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(17000)});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(data.error||'Impossible de contacter le serveur des membres.');
 return data as T;
}
function draftEmail(email:string,name:string){
 const url='mailto:'+encodeURIComponent(email)+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(message(name));
 window.location.href=url;
}
export default function MembersAdmin(){
 const [data,setData]=useState<Directory|null>(null),[name,setName]=useState(''),[email,setEmail]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const load=useCallback(async()=>{setLoading(true);setError('');try{setData(await api<Directory>('people'))}catch(e){setError(e instanceof Error?e.message:'Lecture impossible.')}finally{setLoading(false)}},[]);
 useEffect(()=>{void load()},[load]);
 async function add(event:FormEvent){event.preventDefault();if(busy)return;setBusy(true);setError('');setNotice('');
  try{const saved=await api<{invitation:Invite}>('invitations',{email,name});setNotice('Invitation enregistrée pour '+saved.invitation.email+'.');setName('');setEmail('');await load()}
  catch(e){setError(e instanceof Error?e.message:'Enregistrement impossible.')}finally{setBusy(false)}
 }
 async function send(invite:Invite){
  if(busy)return;setBusy(true);setError('');setNotice('');
  try{const sent=await api<{sent:boolean}>('send',{email:invite.email});if(sent.sent){setNotice('Courriel accepté pour '+invite.email+'.');await load()}}
  catch(e){setError(e instanceof Error?e.message:'Envoi indisponible.')}finally{setBusy(false)}
 }
 const registerLink='https://tectonique-des-ames.com/membre.html';
 return <main className="am-members">
  <div className="am-members-heading"><div><p className="am-eyebrow">Compagnon de route</p><h1>Membres et invitations</h1><p>Retrouve les inscrits, prépare des invitations personnelles et accueille les prochains compagnons.</p></div><button className="am-button am-button-secondary" type="button" onClick={()=>void load()} disabled={loading}>Actualiser</button></div>
  <section className="am-members-card"><h2>Inviter un membre</h2><p>L'invité choisit lui-même son mot de passe et crée son propre compte. Aucun mot de passe ne t'est communiqué.</p>
    <form className="am-invite-form" onSubmit={add}><label>Prénom ou nom<input required maxLength={100} autoComplete="off" value={name} onChange={e=>setName(e.target.value)} placeholder="Prénom de l’invité"/></label><label>Adresse e-mail<input required type="email" autoComplete="off" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="adresse@exemple.fr"/></label><button className="am-button" disabled={busy}>Enregistrer l'invitation</button></form>
    <p className="am-members-help">Le lien d’inscription à transmettre est <a href={registerLink} target="_blank" rel="noopener noreferrer">{registerLink}</a>. L'inscription ne demande aucun code.</p>
  </section>
  {notice&&<p role="status" className="am-members-notice">{notice}</p>}{error&&<p role="alert" className="am-members-error">{error}</p>}
  <section className="am-members-card"><h2>Invitations <small>{data?.invitations.length??'—'}</small></h2>
   <p>{data?.mailConfigured?'L’envoi automatique est configuré.':'L’envoi automatique n’est pas configuré. Le bouton « Préparer le mail » ouvre un message prêt à envoyer depuis ta messagerie.'}</p>
   {data?.invitations.length?<div className="am-members-list">{data.invitations.map(i=><article key={i.id} className="am-member-row">
    <div><strong>{i.name}</strong><small>{i.email}</small><span className="am-member-state">{i.registered?'Compte créé':i.sent_at?'Invitation envoyée':'Invitation préparée'}</span></div>
    <div className="am-member-actions"><button type="button" onClick={()=>draftEmail(i.email,i.name)} className="am-button am-button-secondary">Préparer le mail</button>{data.mailConfigured&&!i.sent_at&&!i.registered&&<button className="am-button" disabled={busy} type="button" onClick={()=>void send(i)}>Notifier par mail</button>}</div>
   </article>)}</div>:<p>{loading?'Chargement…':'Aucune invitation enregistrée.'}</p>}
  </section>
  <section className="am-members-card"><h2>Comptes créés <small>{data?.members.length??'—'}</small></h2><p>Liste lue directement dans la base des membres du site. Les invitations ne créent pas de compte à la place des personnes.</p>
   {data?.members.length?<div className="am-members-list">{data.members.map(m=><article className="am-member-row" key={m.id}><div><strong>{m.pseudo||m.name||'Profil à compléter'}</strong><small>{m.email}</small><span className="am-member-state">{m.provider==='email'?'Compte e-mail':m.provider==='google'?'Google':m.provider==='facebook'?'Facebook':m.provider}</span></div><small>Inscrit le {new Date(m.created).toLocaleDateString('fr-FR')}</small></article>)}</div>:<p>{loading?'Chargement…':'Aucun compte membre pour le moment.'}</p>}
  </section>
 </main>;
}