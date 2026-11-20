import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {saveConfirmation} from './confirmation.mjs';
import {Piece,api,getReservation,clearReservation} from './piece';
function Collection({initial}){
 const returned=new URLSearchParams(location.search).get('commande')==='retour';
 const [order,setOrder]=useState(null),[receiptError,setReceiptError]=useState('');
 async function confirmation(){
  setReceiptError('');
  try{
   const id=sessionStorage.getItem('bois-derniere-commande');
   if(!id)return;
   const r=await api('confirmation',{id});
   if(r.paid)setOrder(r);else setReceiptError('Le paiement n’est pas encore confirmé.');
  }catch{setReceiptError('La confirmation est momentanément indisponible.');}
 }
 useEffect(()=>{if(returned)void confirmation();},[]);
 const [pieces,setPieces]=useState(initial),[error,setError]=useState('');
 async function reload(){try{setPieces((await api('catalog')).pieces);setError('');}catch{setError('Le catalogue est temporairement indisponible.');}}
 useEffect(()=>{const fresh=e=>{if(e.persisted)void reload();};window.addEventListener('pageshow',fresh);return()=>window.removeEventListener('pageshow',fresh);},[]);
 return <>{returned&&<section><h2>{order?'Commande confirmée':'Retour du paiement'}</h2>{order?<button type="button" onClick={()=>saveConfirmation(order).catch(e=>setReceiptError(e.message))}>Télécharger ma confirmation et mes conditions de vente</button>:<button type="button" onClick={confirmation}>Vérifier la confirmation</button>}{receiptError&&<p role="status">{receiptError}</p>}<p><a href="/retractation.html">Renoncer au contrat ici</a></p></section>}{error&&<p role="alert">{error}</p>}{pieces.length?pieces.map(p=><Piece key={p.id} p={p} onRefresh={reload}/>):<p>De nouvelles créations seront présentées ici.</p>}</>;
}
const root=document.getElementById('bois-collection');
async function loadCatalog(){
 const params=new URLSearchParams(location.hash.slice(1));
 const piece=params.get('piece');
 if(piece){
  const current=getReservation(piece);
  if(params.get('commande')&&/^[a-f0-9-]{36}$/.test(params.get('commande')))sessionStorage.setItem('bois-derniere-commande',params.get('commande'));
  if(current&&params.get('annuler')===current.id){
   try{await api('cancel',{id:current.id});clearReservation(piece,current);}
   catch(e){if(e.status===409)clearReservation(piece,current);}
  }else if(current&&params.get('commande')===current.id){
   clearReservation(piece,current);
  }
  history.replaceState(null,'',location.pathname+location.search);
 }
 return api('catalog');
}
loadCatalog().then(({pieces})=>createRoot(root).render(<Collection initial={pieces}/>)).catch(()=>{const p=document.createElement('p');p.textContent='Le catalogue complet est momentanément indisponible.';root.prepend(p);});
