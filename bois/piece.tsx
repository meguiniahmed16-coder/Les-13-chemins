import React,{useState} from 'react';
import {money} from './model.mjs';
export const imageSrc=(src,admin=false)=>src.startsWith('/media/')?(admin?'/api/atelier':'/api/creations')+src:src;
const countryName=new Intl.DisplayNames(['fr'],{type:'region'});
export const countryLabel=c=>countryName.of(c)||c;
export async function api(path,body?){
 const r=await fetch('/api/creations/'+path,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'content-type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(26000)});
 const data=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(data.error||'Le service est indisponible. Réessaie.'),{status:r.status});return data;
}
export function Piece({p,preview=false,onRefresh=()=>{}}){
 const [photo,selectPhoto]=useState(0),[size,selectSize]=useState(''),[delivery,setDelivery]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const picked=p.photos[photo]||p.photos[0];const v=p.variants.find(v=>v.id===size)||p.variants.find(v=>v.stock>0)||p.variants[0];const z=p.zones.find(z=>z.id===delivery)||p.zones[0];
 async function buy(){
  if(busy||preview||!v||!z)return;setBusy(true);setError('');
  const storageKey='bois-achat:'+p.id+':'+v.id+':'+z.id;
  try{
   let id=sessionStorage.getItem(storageKey);if(!id){id=crypto.randomUUID();sessionStorage.setItem(storageKey,id);}
   const r=await api('checkout',{id,piece:p.id,variant:v.id,zone:z.id,revision:p.revision});
   const u=new URL(r.url);if(u.protocol!=='https:'||!['buy.stripe.com','checkout.stripe.com'].includes(u.hostname))throw Error('Le paiement est indisponible.');
   location.assign(u.href);
  }catch(e){setError(e.message);if(e.status===409){sessionStorage.removeItem(storageKey);onRefresh();}}finally{setBusy(false);}
 }
 return <article className="piece" id={'piece-'+p.id} aria-label={p.title}>
  <div className="gallery">{picked&&<><figure><a href={imageSrc(picked.src,preview)} aria-label={'Agrandir la photo de '+p.title}><img className="piece-photo" src={imageSrc(picked.src,preview)} alt={picked.caption||p.title} width="1150" height="1536"/></a>{picked.caption&&<figcaption aria-live="polite">{picked.caption}</figcaption>}</figure>{p.photos.length>1&&<div className="vues" role="group" aria-label="Photographies">{p.photos.map((im,i)=><button key={im.src} type="button" aria-label={im.caption||'Photographie '+(i+1)} aria-pressed={picked.src===im.src} onClick={()=>selectPhoto(i)}><img alt="" src={imageSrc(im.src,preview)}/></button>)}</div>}</>}</div>
  <div className="piece-copy"><p className="kind">{p.category||'Création en bois'}</p><h2>{p.title||'Nouvelle création'}</h2><p className="description">{p.description}</p>
  {(p.dimensions||p.material)&&<dl className="details">{p.material&&<div><dt>Matière</dt><dd>{p.material}</dd></div>}{p.dimensions&&<div><dt>Dimensions</dt><dd>{p.dimensions}</dd></div>}</dl>}
  <div className="commande"><h3 className="prix">{money(p.price||0)}</h3>
  {(p.variants.length>1||v?.label!=='Pièce unique')&&<label className="bois-choice">Taille ou format<select value={v?.id} onChange={e=>selectSize(e.target.value)}>{p.variants.map(v=><option key={v.id} value={v.id} disabled={!v.stock}>{v.label}{!v.stock?' · épuisé':''}</option>)}</select></label>}
  {v?.stock>0?<>{p.zones.length>1&&<label className="bois-choice">Livraison ou retrait<select value={z?.id} onChange={e=>setDelivery(e.target.value)}>{p.zones.map(z=><option key={z.id} value={z.id}>{z.label} · {z.fee?money(z.fee):'inclus'}</option>)}</select></label>}
  {z&&<p className="livraison">{z.label}{z.pickup?'':z.fee?' · '+money(z.fee):' · port inclus'}{!z.pickup&&<small>{z.countries.map(countryLabel).join(', ')}</small>}</p>}
  {!preview&&p.legacy?<a className="action" href="/api/creations/buy/santal-rose">Acheter cette bague · {money(p.price)}</a>:<button type="button" className="action" disabled={preview||busy||!z} onClick={buy}>{busy?'Ouverture de Stripe…':'Acheter · '+money((p.price||0)+(z?.fee||0))}</button>}</>:<p className="bois-sold">Épuisé</p>}
  {error&&<p role="alert">{error}</p>}<br/><a className="contact-piece" href={'mailto:meguiniahmed16@gmail.com?subject='+encodeURIComponent('L’odeur du bois – '+p.title)}>Écrire à Ahmed</a></div></div>
 </article>;
}
