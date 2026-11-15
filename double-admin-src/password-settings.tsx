import {useState,type FormEvent} from 'react';

export default function PasswordSettings(){
  const [open,setOpen]=useState(false);const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');const [success,setSuccess]=useState(false);
  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;
    const form=event.currentTarget;const data=new FormData(form);
    const currentPassword=String(data.get('currentPassword')||'');
    const newPassword=String(data.get('newPassword')||'');
    if(newPassword!==data.get('confirmation')){setError('Les deux nouveaux mots de passe ne correspondent pas.');return;}
    setBusy(true);setError('');setSuccess(false);
    try{
      const r=await fetch('/api/atelier/auth/password',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({currentPassword,newPassword}),signal:AbortSignal.timeout(20000)});
      const result=await r.json();if(!r.ok)throw new Error(result.error||'Le changement n’a pas pu être confirmé.');
      form.reset();setSuccess(true);
    }catch(e){setError(e instanceof Error?e.message:'Le changement n’a pas pu être confirmé.');}
    finally{setBusy(false);}
  }
  return <section className="am-password-settings" aria-label="Mot de passe du compte">
    <button type="button" className="am-button am-button-secondary" aria-expanded={open} aria-controls="password-panel" onClick={()=>{setOpen(!open);setError('');setSuccess(false);}}>Changer le mot de passe</button>
    {open&&<div id="password-panel" className="am-password-panel"><h2>Changer le mot de passe</h2><form onSubmit={save}>
      <label htmlFor="current-password">Mot de passe actuel</label><input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required maxLength={200}/>
      <label htmlFor="new-password">Nouveau mot de passe</label><input id="new-password" name="newPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={200} aria-describedby="password-help"/>
      <p id="password-help">8 caractères minimum. Les caractères spéciaux ne sont pas obligatoires.</p>
      <label htmlFor="confirm-password">Répète le nouveau mot de passe</label><input id="confirm-password" name="confirmation" type="password" autoComplete="new-password" required minLength={8} maxLength={200}/>
      {error&&<p className="am-login-error" role="alert">{error}</p>}
      {success&&<p className="am-password-success" role="status">Ton mot de passe est changé. Tu restes connecté ici ; les autres sessions sont fermées. Pense à mettre ta note Drive à jour.</p>}
      <div className="am-password-actions"><button className="am-button" disabled={busy}>{busy?'Enregistrement…':'Enregistrer le nouveau mot de passe'}</button><button type="button" className="am-button am-button-secondary" disabled={busy} onClick={()=>setOpen(false)}>Fermer</button></div>
    </form></div>}
  </section>;
}
