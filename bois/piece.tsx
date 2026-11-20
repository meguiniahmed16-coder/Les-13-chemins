import React,{useEffect,useState} from 'react';
import {destinations,offersForCountry} from './livraison.mjs';
import {termsVersion} from './conditions.mjs';
import {money} from './model.mjs';
export const imageSrc=(src,admin=false)=>src.startsWith('/media/')?(admin?'/api/atelier':'/api/creations')+src:src;
const countryName=new Intl.DisplayNames(['fr'],{type:'region'});
export const countryLabel=c=>countryName.of(c)||c;
export const sortCountries=list=>[...list].sort((a,b)=>countryLabel(a).localeCompare(countryLabel(b),'fr'));
export async function api(path,body?){
 const r=await fetch('/api/creations/'+path,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'content-type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(26000)});
 const data=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(data.error||'Le service est indisponible. Réessaie.'),{status:r.status});return data;
}
const reservationKey=piece=>'bois-reservation:'+piece;
export function getReservation(piece){
 try{
  const raw=sessionStorage.getItem(reservationKey(piece));
  if(!raw)return null;
  const reservation=JSON.parse(raw);
  if(reservation.until>Date.now())return reservation;
  clearReservation(piece,reservation);
 }catch{}
 return null;
}
export function clearReservation(piece,reservation){
 sessionStorage.removeItem(reservation.storageKey);
 sessionStorage.removeItem(reservationKey(piece));
}
export function Piece({p,preview=false,onRefresh=()=>{}}){
 const [photo,selectPhoto]=useState(0),[size,selectSize]=useState(''),[delivery,setDelivery]=useState(''),[destination,setDestination]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [reservation,setReservation]=useState(()=>preview?null:getReservation(p.id));
 useEffect(()=>{
  if(preview||getReservation(p.id)||!p.variants.some(v=>v.reserved))return;
  let active=true;
  async function restore(){
   const prefix='bois-achat:'+p.id+':';
   for(const storageKey of Object.keys(sessionStorage).filter(key=>key.startsWith(prefix))){
    const id=sessionStorage.getItem(storageKey);
    if(!id)continue;
    const r=await api('reservation',{id,piece:p.id});
    if(!active)return;
    if(!r.url){sessionStorage.removeItem(storageKey);continue;}
    const current={id,url:r.url,until:r.expiresAt*1000,storageKey};
    sessionStorage.setItem(reservationKey(p.id),JSON.stringify(current));
    setReservation(current);return;
   }
  }
  restore().catch(()=>{});
  return ()=>{active=false;};
 },[p,preview]);
 function forgetReservation(current){
  clearReservation(p.id,current);
  setReservation(null);
 }
 async function release(){
  if(busy||!reservation)return;
  setBusy(true);setError('');
  try{
   await api('cancel',{id:reservation.id});
   forgetReservation(reservation);
   await onRefresh();
  }catch(e){
   setError(e.message);
   if(e.status===409){forgetReservation(reservation);await onRefresh();}
  }finally{setBusy(false);}
 }
 const [agreed,setAgreed]=useState(false);
 const picked=p.photos[photo]||p.photos[0];const v=p.variants.find(v=>v.id===size)||p.variants.find(v=>v.stock>0)||p.variants[0];const places=sortCountries(destinations(p.zones));
 const pickup=p.zones.some(zone=>zone.pickup);
 const chosen=places.includes(destination)||pickup&&destination==='pickup'?destination:places.includes('FR')?'FR':places[0]||(pickup?'pickup':'');
 const options=offersForCountry(p.zones,chosen);
 const z=options.find(zone=>zone.id===delivery)||options[0];
 const total=money((p.price||0)+(z?.fee||0));
 const contact='mailto:meguiniahmed16@gmail.com?subject='+encodeURIComponent('L’odeur du bois – '+p.title);
 const internationalRequest=p.legacy&&z?.world;
 const requestMessage=internationalRequest?'Bonjour Ahmed,\n\nJe souhaite commander la bague '+p.title+' avec une livraison vers '+countryLabel(chosen)+'. Le total affiché est de '+total+', dont '+money(z.fee)+' de port. Peux-tu me confirmer sa disponibilité et les modalités de paiement ?':'';
 async function buy(checkoutMode){
  if(busy||preview||!v||!z||!agreed)return;setBusy(true);setError('');
  const storageKey='bois-achat:'+p.id+':'+v.id+':'+z.id+':'+chosen+':'+checkoutMode;
  try{
   let id=sessionStorage.getItem(storageKey);if(!id){id=crypto.randomUUID();sessionStorage.setItem(storageKey,id);}
   const r=await api('checkout',{id,piece:p.id,variant:v.id,zone:z.id,country:chosen,revision:p.revision,checkoutMode,termsVersion});
   const u=new URL(r.url);if(u.protocol!=='https:'||!['buy.stripe.com','checkout.stripe.com'].includes(u.hostname))throw Error('Le paiement est indisponible.');
   const current={id,url:u.href,until:(r.expiresAt||Math.floor(Date.now()/1000)+3600)*1000,storageKey};
   sessionStorage.setItem(reservationKey(p.id),JSON.stringify(current));setReservation(current);
   location.assign(u.href);
  }catch(e){setError(e.message);if(e.status===409){sessionStorage.removeItem(storageKey);onRefresh();}}finally{setBusy(false);}
 }
 return <article className="piece" id={'piece-'+p.id} aria-label={p.title}>
  <div className="gallery">{picked&&<><figure><a href={imageSrc(picked.src,preview)} aria-label={'Agrandir la photo de '+p.title}><img className="piece-photo" src={imageSrc(picked.src,preview)} alt={picked.caption||p.title} width="1150" height="1536"/></a>{picked.caption&&<figcaption aria-live="polite">{picked.caption}</figcaption>}</figure>{p.photos.length>1&&<div className="vues" role="group" aria-label="Photographies">{p.photos.map((im,i)=><button key={im.src} type="button" aria-label={im.caption||'Photographie '+(i+1)} aria-pressed={picked.src===im.src} onClick={()=>selectPhoto(i)}><img alt="" src={imageSrc(im.src,preview)}/></button>)}</div>}</>}</div>
  <div className="piece-copy"><p className="kind">{p.category||'Création en bois'}</p><h2>{p.title||'Nouvelle création'}</h2><p className="description">{p.description}</p>
  {(p.dimensions||p.material)&&<dl className="details">{p.material&&<div><dt>Matière</dt><dd>{p.material}</dd></div>}{p.dimensions&&<div><dt>Dimensions</dt><dd>{p.dimensions}</dd></div>}</dl>}
  <div className="commande"><h3 className="prix">{money(p.price||0)}</h3>
  {(p.variants.length>1||v?.label!=='Pièce unique')&&<label className="bois-choice">Taille ou format<select value={v?.id} disabled={!!reservation} onChange={e=>selectSize(e.target.value)}>{p.variants.map(v=><option key={v.id} value={v.id} disabled={!v.stock}>{v.label}{!v.stock?(v.reserved?' · réservé':' · épuisé'):''}</option>)}</select></label>}
  {reservation?<div className="bois-paiement"><a className="action" href={reservation.url}>Reprendre mon paiement</a><button className="bois-autres" type="button" disabled={busy} onClick={release}>Annuler la réservation</button></div>:v?.stock>0?<>{(places.length+(pickup?1:0)>1)&&<label className="bois-choice">Destination<select value={chosen} onChange={e=>{setDestination(e.target.value);setDelivery('');setError('');}}>{places.map(c=><option key={c} value={c}>{countryLabel(c)}</option>)}{pickup&&<option value="pickup">Retrait sur place</option>}</select></label>}
  {options.length>1&&<label className="bois-choice">Mode de livraison ou de retrait<select value={z?.id} onChange={e=>setDelivery(e.target.value)}>{options.map(z=><option key={z.id} value={z.id}>{z.label} · {z.fee?money(z.fee):'inclus'}</option>)}</select></label>}
  {z&&<p className="livraison" aria-live="polite">{z.label}{z.pickup?'':z.fee?' · '+money(z.fee):' · port inclus'}</p>}
  {!p.legacy&&<><p className="bc-delai">{z?.pickup?'Le retrait est organisé avec Ahmed.':'Livraison au plus tard 30 jours après la commande.'} <a href="/conditions-de-vente.html" target="_blank" rel="noopener">Livraison, retours et garanties</a>.</p><label className="bois-accord"><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}/> J’accepte les <a href="/conditions-de-vente.html" target="_blank" rel="noopener">conditions de vente</a>.</label></>}
  {internationalRequest?<>{!preview?<a className="action" href={contact+'&body='+encodeURIComponent(requestMessage)}>Demander la bague · {total}</a>:<button className="action" disabled>Demander la bague · {total}</button>}<p>Commande internationale par e-mail.</p></>:!preview&&p.legacy?<a className="action" href="/api/creations/buy/santal-rose">Acheter cette bague · {total}</a>:<div className="bois-paiement">
   <button type="button" className="action" disabled={preview||busy||!z||!agreed} onClick={()=>buy('express')}>
    <span>{busy?'Ouverture de Stripe…':'Paiement express · '+total}</span>
    <small>Google Pay ou Apple Pay selon votre appareil</small>
   </button>
   <button type="button" className="bois-autres" disabled={preview||busy||!z||!agreed} onClick={()=>buy('standard')}>Autres moyens de paiement</button>
  </div>}</>:<p className="bois-sold">{v?.reserved?'Pièce réservée pour un paiement en cours.':'Épuisé'}</p>}
  {error&&<p role="alert">{error}</p>}<br/><a className="contact-piece" href={contact}>Écrire à Ahmed</a></div></div>
 </article>;
}
