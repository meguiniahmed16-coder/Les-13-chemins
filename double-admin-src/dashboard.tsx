import {useEffect,useState} from 'react';
import './dashboard.css';
const prefix='/admin-blog.html?view=';
const links=[
 {heading:'Publications',items:[['Blog et billets','blog','Écrire, publier et relire les articles'],['L’odeur du bois','creations','Bijoux, produits, catalogue et ventes']]},
 {heading:'Manuscrit et parcours',items:[['Documents et éditeurs','documents','Fichiers privés et codes des éditeurs'],['Conversations et corrections','review','Atelier de révision et continuités'],['Archives','archives','Historique conservé']]},
 {heading:'La Maison des rencontres',items:[['Le monde 3D','cinema','Salle blanche, dojo et jardin'],['Membres et invitations','members','Liste des comptes et futurs compagnons'],['Personnages et atelier','atelier','Dialogues, personnalisation et création']]},
] as const;
export default function Dashboard(){
 return <main className="am-unified-home"><p className="am-eyebrow">Administration générale · La Tectonique des âmes</p>
 <h1>Ton administration</h1><p className="am-unified-lead">Un seul endroit pour gérer les publications, la maison, les personnages, les membres et les documents. Ton accès administrateur actuel est conservé.</p>
 <div className="am-unified-groups">{links.map(group=><section className="am-unified-group" key={group.heading}><h2>{group.heading}</h2><div className="am-unified-cards">{group.items.map(([title,view,desc])=><a key={view} href={view==='cinema'?'/membres/intro-prive.html?auteur=atelier':prefix+view} className="am-unified-card"><strong>{title}</strong><span>{desc}</span><b aria-hidden="true">↗</b></a>)}</div></section>)}</div>
 <p className="am-unified-footer">L’ancien accès aux documents est conservé à l’intérieur de cette administration, sans demander un second mot de passe.</p>
 </main>
}
export function Documents(){
 const [state,setState]=useState<'loading'|'ready'|'error'>('loading');
 const [message,setMessage]=useState('');
 useEffect(()=>{let active=true;async function open(){
  try{
   const response=await fetch('/.netlify/functions/editor?action=unified-login',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'content-type':'application/json'},body:'{}',signal:AbortSignal.timeout(15000)});
   const result=await response.json();
   if(!response.ok||!result.ok)throw Error(result.error||'Connexion aux documents indisponible.');
   if(active)setState('ready');
  }catch(e){if(active){setMessage(e instanceof Error?e.message:'Accès aux documents interrompu.');setState('error')}}
 }void open();return()=>{active=false}},[]);
 return <main className="am-docs"><div className="am-docs-top"><div><p className="am-eyebrow">Manuscrit et maison d’édition</p><h1>Mes documents et mes éditeurs</h1><p>Les fichiers et les accès existants sont conservés. La connexion se fait depuis ton administration actuelle.</p></div><a className="am-button am-button-secondary" href="/admin-blog.html?view=dashboard">Tableau de bord</a></div>
 {state==='loading'&&<p role="status">Ouverture des documents privés…</p>}
 {state==='error'&&<div role="alert"><p>{message}</p><button type="button" className="am-button" onClick={()=>location.reload()}>Réessayer</button></div>}
 {state==='ready'&&<iframe className="am-docs-frame" title="Documents privés et codes éditeurs" src="/admin-edition.html" referrerPolicy="same-origin"/>}
 </main>
}
