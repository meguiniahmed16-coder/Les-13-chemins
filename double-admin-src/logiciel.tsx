import {useEffect,useRef,useState,type FormEvent} from 'react';
import './logiciel.css';

const tools=[
 {id:'personnage',label:'Personnages',title:'Personnaliser le personnage',url:'/membre.html?auteur=atelier#avatar',description:'Le véritable personnage et les réglages du salon V27, avec les options enregistrables.'},
 {id:'scene',label:'Scène 3D',title:'Explorer et mettre en scène',url:'/membre.html?auteur=atelier#salon',description:'Le salon et le jardin 3D existants, les joysticks, les caméras et les interactions.'},
 {id:'reference',label:'Atelier privé',title:'Logiciel privé de référence',url:'/membre-atelier.html?auteur=atelier',description:'Le logiciel de l’auteur, avec sa référence 3D originale.'}
] as const;
type Tool=typeof tools[number]['id'];
type Report={date:string;outil:Tool;type:'bug'|'amelioration';details:string;url:string};
const key='tectonique-logiciel-rapports-v1';
function stored():Report[]{try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x.filter(v=>v&&typeof v.details==='string').slice(-100):[]}catch{return []}}
function download(value:unknown,name:string){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}
export default function Logiciel(){
 const [active,setActive]=useState<Tool>('personnage');
 const [reports,setReports]=useState<Report[]>(stored);
 const [type,setType]=useState<'bug'|'amelioration'>('bug');
 const [details,setDetails]=useState('');
 const [notice,setNotice]=useState('');
 const [errors,setErrors]=useState<{date:string;outil:Tool;message:string}[]>([]);
 const frames=useRef<Record<string,HTMLIFrameElement|null>>({});
 const current=tools.find(x=>x.id===active)!;
 useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(reports.slice(-100)))}catch{}},[reports]);
 // Keep each tool mounted when switching tabs so unsaved changes in the existing editor are not discarded.
 function save(e:FormEvent){e.preventDefault();const text=details.trim();if(!text)return;setReports(old=>[...old,{date:new Date().toISOString(),outil:active,type,details:text.slice(0,3000),url:current.url}].slice(-100));setDetails('');setNotice('Signalement ajouté au rapport local.');}
 function open(){window.open(current.url,'_blank','noopener,noreferrer')}
 return <main className="am-software"><div className="am-software-heading"><div><p className="am-eyebrow">La Maison des rencontres · administration privée</p><h1>Le logiciel intuitif</h1><p>Les outils 3D existants sont réunis ici, sans remplacer les personnages ni le décor du salon par des objets simplifiés.</p></div><a className="am-button am-button-secondary" href="/admin-blog.html?view=dashboard">Administration</a></div>
  <div role="tablist" aria-label="Les outils du logiciel" className="am-software-tabs">{tools.map(t=><button type="button" key={t.id} role="tab" aria-selected={active===t.id} aria-controls={'am-software-'+t.id} onClick={()=>{setActive(t.id);setNotice('')}}>{t.label}</button>)}</div>
  <div className="am-software-toolbar"><div><h2>{current.title}</h2><p>{current.description}</p></div><div className="am-software-actions"><button type="button" className="am-button am-button-secondary" onClick={()=>{const f=frames.current[active];if(f){f.src=current.url;setNotice('La vue sélectionnée a été rechargée.')}}}>Recharger la vue</button><button type="button" className="am-button" onClick={open}>Plein écran / nouvel onglet</button></div></div>
  <div className="am-software-workspace">{tools.map(t=><section role="tabpanel" id={'am-software-'+t.id} key={t.id} hidden={active!==t.id} aria-label={t.title}><iframe ref={node=>{frames.current[t.id]=node}} src={t.url} title={t.title} allow="fullscreen" loading={t.id===active?'eager':'lazy'} onError={()=>setErrors(old=>[...old,{date:new Date().toISOString(),outil:t.id,message:'Le cadre du logiciel ne peut pas être chargé.'}].slice(-50))}/></section>)}</div>
  <details className="am-software-report"><summary>Signaler un bug ou demander une amélioration</summary><form onSubmit={save}><label>Nature du signalement<select value={type} onChange={e=>setType(e.target.value as 'bug'|'amelioration')}><option value="bug">Problème / bug</option><option value="amelioration">Amélioration souhaitée</option></select></label><label>Outil<input readOnly value={current.title}/></label><label>Décris précisément ce qu’il faut corriger ou améliorer<textarea required maxLength={3000} value={details} onChange={e=>setDetails(e.target.value)} rows={4}/></label><div className="am-software-actions"><button className="am-button" type="submit">Ajouter au rapport</button><button type="button" className="am-button am-button-secondary" onClick={()=>download({version:'rapport-logiciel-intuitif-v1',created:new Date().toISOString(),signals:reports,errors},'rapport-logiciel-intuitif-'+new Date().toISOString().slice(0,10)+'.json')}>Télécharger le rapport ({reports.length})</button></div>{notice&&<p role="status">{notice}</p>}</form><p>Le rapport est conservé dans ce navigateur jusqu’à son export. Aucun signalement n’est envoyé sans ton action.</p></details>
 </main>;
}
