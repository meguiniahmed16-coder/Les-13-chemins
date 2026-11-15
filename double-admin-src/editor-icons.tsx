import type {ReactNode} from 'react';
// Labels remain on the controls for tooltips and assistive technology.
export default function EditorIcon({name}:{name:string}){
 let shape:ReactNode;
 switch(name){
  case 'Gras':shape=<><path d="M6 4h7a4 4 0 0 1 0 8H6zM6 12h8a4 4 0 0 1 0 8H6z" strokeWidth="2.7"/></>;break;
  case 'Italique':shape=<><path d="M10 4h9M5 20h9M15 4 9 20"/></>;break;
  case 'Souligné':shape=<><path d="M6 3v8a6 6 0 0 0 12 0V3M4 21h16"/></>;break;
  case 'Barré':shape=<><path d="M18 6c-1-2-3-3-6-3-7 0-8 7-1 9m-4 6c1 2 3 3 6 3 7 0 8-7 1-9M3 12h18"/></>;break;
  case 'Couleur':shape=<><path d="m6 17 6-14 6 14M8 12h8M3 21h18"/></>;break;
  case 'Surligner':shape=<><path d="m9 14 7-10 5 4-8 9-4-3ZM9 14l-4 4 4 2 4-3M3 22h18"/></>;break;
  case 'À gauche':shape=<path d="M4 5h16M4 10h10M4 15h16M4 20h10"/>;break;
  case 'Centrer':shape=<path d="M4 5h16M7 10h10M4 15h16M7 20h10"/>;break;
  case 'À droite':shape=<path d="M4 5h16M10 10h10M4 15h16M10 20h10"/>;break;
  case 'Justifier':shape=<path d="M4 5h16M4 10h16M4 15h16M4 20h16"/>;break;
  case 'Puces':shape=<><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/><path d="M9 6h12M9 12h12M9 18h12"/></>;break;
  case 'Numéros':shape=<><path d="m3 4 2-1v6M3 9h4M3 15c0-3 4-3 4 0 0 2-4 3-4 6h4M11 6h10M11 12h10M11 18h10"/></>;break;
  case 'Citation':shape=<><path d="M9 5H3v7h5c0 4-2 6-5 7M21 5h-6v7h5c0 4-2 6-5 7"/></>;break;
  case 'Lien':shape=<><path d="m10 13 4-4M8 15l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 3 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(1 0)"/></>;break;
  case 'Photo dans le texte':shape=<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="2"/><path d="m3 18 6-6 4 4 3-4 5 6"/></>;break;
  case 'Tableau':shape=<><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></>;break;
  case 'Séparateur':shape=<><path d="M3 12h18" strokeWidth="3"/></>;break;
  case 'Effacer le format':shape=<><path d="m4 15 9-12 8 6-9 12H7zM9 10l8 6M13 21h8"/></>;break;
  case 'Annuler':shape=<path d="m8 4-5 5 5 5M3 9h11a7 7 0 0 1 0 14" transform="translate(0 -1)"/>;break;
  case 'Rétablir':shape=<path d="m16 4 5 5-5 5M21 9H10a7 7 0 0 0 0 14" transform="translate(0 -1)"/>;break;
  case 'Monter la photo':shape=<path d="M12 20V4m-7 7 7-7 7 7"/>;break;
  case 'Descendre la photo':shape=<path d="M12 4v16m-7-7 7 7 7-7"/>;break;
  case 'Retirer la photo':case 'Supprimer le tableau':shape=<><path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/></>;break;
  case 'Ajouter une ligne':case 'Supprimer la ligne':shape=<><rect x="3" y="3" width="18" height="11" rx="1"/><path d="M3 8h18M8 19h8"/>{name.startsWith('Ajouter')&&<path d="M12 15v8"/>}</>;break;
  case 'Ajouter une colonne':case 'Supprimer la colonne':shape=<><rect x="3" y="3" width="11" height="18" rx="1"/><path d="M8 3v18M16 12h7"/>{name.startsWith('Ajouter')&&<path d="M19.5 8.5v7"/>}</>;break;
  default:shape=<circle cx="12" cy="12" r="8"/>;
 }
 return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{shape}</svg>;
}
