import {useEffect, useState} from 'react';
type Mode = 'immediate'|'daily'|'off';
type Settings = {mode:Mode;version:number;dailyHour:number;timeZone:string};
export default function NotificationSettings({api}:{api:(path:string,body?:unknown)=>Promise<unknown>}) {
  const [settings,setSettings]=useState<Settings|null>(null);
  const [mode,setMode]=useState<Mode>('immediate');
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');
  useEffect(()=>{let live=true;void api('notification-settings').then(value=>{if(!live)return;const result=value as {settings:Settings};setSettings(result.settings);setMode(result.settings.mode);}).catch(e=>{if(live)setError(e instanceof Error?e.message:'Impossible de charger le réglage.');});return()=>{live=false;};},[api]);
  async function save(){
    if(!settings||busy||mode===settings.mode)return;
    setBusy(true);setNotice('');setError('');
    try{const value=await api('notification-settings',{mode,version:settings.version}) as {settings:Settings};setSettings(value.settings);setMode(value.settings.mode);setNotice('Fréquence enregistrée pour les prochaines visites.');}
    catch(e){setError(e instanceof Error?e.message:'Le réglage n’a pas pu être enregistré.');}
    finally{setBusy(false);}
  }
  return <div className="amb-mail-settings"><h3>Recevoir les visites par mail</h3><label htmlFor="visit-mail-mode">Fréquence des alertes</label><select id="visit-mail-mode" className="amb-select" value={mode} disabled={!settings||busy} onChange={e=>{setMode(e.target.value as Mode);setNotice('');}}><option value="immediate">Un mail à chaque nouvelle visite</option><option value="daily">Un résumé quotidien à 19 h (heure de Paris)</option><option value="off">Désactiver les mails</option></select><button type="button" className="amb-button amb-button-primary" disabled={!settings||busy||mode===settings.mode} onClick={()=>void save()}>{busy?'Enregistrement…':'Enregistrer la fréquence'}</button><p>Tu peux modifier ce choix à tout moment. Le résumé quotidien est envoyé seulement s’il y a de nouvelles visites.</p>{notice&&<p role="status">{notice}</p>}{error&&<p role="alert">{error}</p>}</div>;
}
