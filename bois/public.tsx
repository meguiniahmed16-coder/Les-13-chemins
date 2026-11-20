import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Piece,api,getReservation,clearReservation} from './piece';
function Collection({initial}){
 const [pieces,setPieces]=useState(initial),[error,setError]=useState('');
 async function reload(){try{setPieces((await api('catalog')).pieces);setError('');}catch{setError('Le catalogue est temporairement indisponible.');}}
 useEffect(()=>{const fresh=e=>{if(e.persisted)void reload();};window.addEventListener('pageshow',fresh);return()=>window.removeEventListener('pageshow',fresh);},[]);
 return <>{new URLSearchParams(location.search).get('commande')==='retour'&&<p>Retrouvez la confirmation de votre paiement dans Stripe ou dans votre messagerie.</p>}{error&&<p role="alert">{error}</p>}{pieces.length?pieces.map(p=><Piece key={p.id} p={p} onRefresh={reload}/>):<p>De nouvelles créations seront présentées ici.</p>}</>;
}
const root=document.getElementById('bois-collection');
async function loadCatalog(){
 const params=new URLSearchParams(location.hash.slice(1));
 const piece=params.get('piece');
 if(piece){
  const current=getReservation(piece);
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
