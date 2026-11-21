import {useEffect,useState, type FormEvent} from 'react';
import {createRoot} from 'react-dom/client';
import Blog from './blog';
import Creations from './creations';
import Atelier from './atelier';
import Archives from './archives';
import AuthorHeader from './author-header';
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
  useEffect(()=>{
    void check();
    const restore=(event:PageTransitionEvent)=>{if(event.persisted)void check();};
    const menu=document.getElementById('author-menu') as HTMLDetailsElement;
    const outside=(event:Event)=>{if(menu?.open&&!menu.contains(event.target as Node))menu.open=false;};
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary')?.focus();}};
    window.addEventListener('pageshow',restore);
    document.addEventListener('pointerdown',outside);document.addEventListener('focusin',outside);document.addEventListener('keydown',escape);
    return ()=>{window.removeEventListener('pageshow',restore);document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',outside);document.removeEventListener('keydown',escape);};
  },[]);
  async function login(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;const data=new FormData(event.currentTarget);setBusy(true);setError('');
    try{const r=await fetch('/api/atelier/auth/login',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({username:data.get('username'),password:data.get('password')}),signal:AbortSignal.timeout(20000)});const result=await r.json();if(!r.ok)throw new Error(result.error||'Connexion impossible.');await check();}
    catch(e){setError(e instanceof Error?e.message:'Connexion impossible.');}finally{setBusy(false);}
  }
  if(state==='ready'){
    const view=new URLSearchParams(location.search).get('view');
    const header=<AuthorHeader onLogout={()=>{history.replaceState(null,'','/admin-blog.html');setError('');setState('login');}}/>;
    if(view==='membres')return <>{header}<main className="am-login"><h1>Compagnon de route</h1><p><a className="am-button" href="/membre.html?auteur=atelier">Entrer dans mon salon</a></p><p><a className="am-button am-button-secondary" href="/membre-atelier.html">Mon atelier d’avatar privé</a></p><a href="/admin-blog.html">Revenir à l’administration</a></main></>;
    return <>{header}{view==='creations'?<Creations/>:view==='archives'?<Archives/>:view==='atelier'||view==='review'?<Atelier/>:<Blog/>}</>;
  }
  return <main className="am-login"><p className="am-eyebrow">Ahmed Marie · Espace d’auteur</p><h1>Connexion administrateur</h1>{state==='loading'?<p role="status">Ouverture de ton espace…</p>:state==='error'?<><p role="alert">{error}</p><button className="am-button" onClick={()=>void check()}>Réessayer</button></>:<form onSubmit={login}><label htmlFor="username">Identifiant</label><input id="username" name="username" autoComplete="username" defaultValue="admin" required/><label htmlFor="password">Mot de passe</label><input id="password" name="password" type="password" autoComplete="current-password" required maxLength={200}/>{error&&<p className="am-login-error" role="alert">{error}</p>}<button className="am-button" disabled={busy}>{busy?'Connexion…':'Se connecter'}</button></form>}<a className="am-login-back" href="/ahmed-marie.html">← Revenir au blog public</a></main>;
}
createRoot(document.getElementById('admin-root')!).render(<App/>);
