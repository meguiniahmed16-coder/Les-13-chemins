import {useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import PasswordSettings from './password-settings';
import {logoutAuthor} from '../membres/author-access.js';
import './author-header.css';

const home='/admin-blog.html';
const salon='/membre.html?auteur=atelier';
const destinations=[
  ['Tableau de bord',home+'?view=dashboard'],
  ['Blog et billets',home+'?view=blog'],
  ['L’odeur du bois',home+'?view=creations'],
  ['Documents et éditeurs',home+'?view=documents'],
  ['Membres',home+'?view=members'],
  ['Conversations',home+'?view=review'],
  ['Archives',home+'?view=archives'],
  ['Atelier',home+'?view=atelier'],
  ['Logiciel intuitif',home+'?view=logiciel'],
  ['Le monde 3D','/membre.html?auteur=atelier#salon'],
  ['Site public','/ahmed-marie.html']

];

export default function AuthorHeader({onLogout}:{onLogout:()=>void}){
  const [passwordOpen,setPasswordOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const passwordButton=useRef<HTMLButtonElement>(null);
  const menu=document.getElementById('author-menu') as HTMLDetailsElement;
  const menuHost=document.getElementById('author-menu-actions');
  function closeMenu(){if(menu?.open){menu.open=false;menu.querySelector('summary')?.focus();}}
  function togglePassword(){closeMenu();setPasswordOpen(value=>!value);}
  async function signOut(){
    if(busy)return;
    setBusy(true);setError('');closeMenu();
    try{await logoutAuthor('atelier');onLogout();}
    catch{setError('La déconnexion n’a pas pu être confirmée. Réessaie.');setBusy(false);}
  }
  const links=destinations.map(([label,href])=><a key={href} href={href}
    aria-current={home+location.search===href?'page':undefined}
    target={href==='/ahmed-marie.html'?'_blank':undefined} rel={href==='/ahmed-marie.html'?'noopener noreferrer':undefined}>{label}</a>);
  const accountActions=(inMenu:boolean)=><>
    <a href={home+'?view=members'}>Gérer les membres</a>
    <button type="button" ref={inMenu?undefined:passwordButton} aria-expanded={passwordOpen} aria-controls="password-panel" onClick={togglePassword}>Changer le mot de passe</button>
    <button type="button" onClick={signOut} disabled={busy}>{busy?'Déconnexion…':'Se déconnecter'}</button>
  </>;
  return <><header className="author-header"><div className="author-content">
    <div className="author-row"><a className="author-signature" href={home}><span className="am-mark" aria-hidden="true">a</span>Ahmed Marie</a>
      <div className="author-actions" role="group" aria-label="Mon compte">{accountActions(false)}</div></div>
    <nav className="author-destinations" aria-label="Rubriques de l’espace auteur">{links}</nav>
    {error&&<p className="am-login-error" role="alert">{error}</p>}
    {passwordOpen&&<PasswordSettings onClose={()=>{setPasswordOpen(false);passwordButton.current?.focus();}}/>}
  </div></header>
  {menuHost&&createPortal(<><div role="group" aria-label="Espace auteur">{links}</div>
    <div className="menu-destinations" role="group" aria-label="Mon compte">
      <a href={salon+'&apercu=abonne'}>Voir comme un membre abonné</a>
      <a href={salon+'&apercu=non-abonne'}>Voir comme un membre non abonné</a>{accountActions(true)}
    </div></>,menuHost)}</>;
}
