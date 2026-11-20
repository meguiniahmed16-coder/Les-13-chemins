import {useEffect,useState, type FormEvent} from 'react';
import {createRoot} from 'react-dom/client';
import Blog from './blog';
import Creations from './creations';
import Atelier from './atelier';
import Archives from './archives';
import PasswordSettings from './password-settings';
import './base.css';
import './login.css';

function App(){
  const [state,setState]=useState<'loading'|'login'|'ready'|'error'>('loading');
  const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  async function check(){
    setState('loading');setError('');
    try{const r=await fetch('/api/atelier/auth/session',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000)});if(r.status===401){setState('login');return;}if(!r.ok)throw new Error('La connexion est momentanément indisponible. Réessaie.');setState('ready');}
    catch(e){setError(e instanceof Error?e.message:'La connexion est indisponible.');setState('error');}
  }
  useEffect(()=>{void check();},[]);
  async function login(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;const data=new FormData(event.currentTarget);setBusy(true);setError('');
    try{const r=await fetch('/api/atelier/auth/login',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({username:data.get('username'),password:data.get('password')}),signal:AbortSignal.timeout(20000)});const result=await r.json();if(!r.ok)throw new Error(result.error||'Connexion impossible.');await check();}
    catch(e){setError(e instanceof Error?e.message:'Connexion impossible.');}finally{setBusy(false);}
  }
  if(state==='ready'){
    const view=new URLSearchParams(location.search).get('view');
    return <><PasswordSettings/>{view==='creations'?<Creations/>:view==='archives'?<Archives/>:view==='atelier'||view==='review'?<><form className="am-site-logout" action="/api/atelier/auth/logout" method="post"><button className="am-button am-button-secondary">Se déconnecter</button></form><Atelier/></>:<Blog/>}</>;
  }
  return <main className="am-login"><p className="am-eyebrow">Ahmed Marie · Espace d’auteur</p><h1>Connexion administrateur</h1>{state==='loading'?<p role="status">Ouverture de ton espace…</p>:state==='error'?<><p role="alert">{error}</p><button className="am-button" onClick={()=>void check()}>Réessayer</button></>:<form onSubmit={login}><label htmlFor="username">Identifiant</label><input id="username" name="username" autoComplete="username" defaultValue="admin" required/><label htmlFor="password">Mot de passe</label><input id="password" name="password" type="password" autoComplete="current-password" required maxLength={200}/>{error&&<p className="am-login-error" role="alert">{error}</p>}<button className="am-button" disabled={busy}>{busy?'Connexion…':'Se connecter'}</button></form>}<a className="am-login-back" href="/ahmed-marie.html">← Revenir au blog public</a></main>;
}
createRoot(document.getElementById('admin-root')!).render(<App/>);
