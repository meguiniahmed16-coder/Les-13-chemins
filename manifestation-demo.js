// A self-contained rehearsal: it never creates a game run, sends parent events
// or writes points. Wrong-order actions cannot advance the lesson.
export function newDemo(){return {step:0,selected:null,collected:false,sent:false};}
export function demoAction(d,action){
 if(d.step===0&&action==='flower'){d.selected='flower';d.step=1;return true;}
 if(d.step===1&&action==='yellow'){d.collected=true;d.selected=null;d.step=2;return true;}
 if(d.step===2&&action==='crs'){d.selected='crs';d.step=3;return true;}
 if(d.step===3&&action==='red'){d.sent=true;d.selected=null;d.step=4;return true;}
 return false;
}
export const DEMO_STEPS=[
 '1 · Touche la fleur pour la sélectionner.',
 '2 · JAUNE : récupère la fleur sélectionnée.',
 '3 · Touche maintenant le CRS pour le sélectionner.',
 '4 · ROUGE : envoie la fleur au CRS sélectionné.',
 'Bien joué ! Sélectionne, puis appuie sur la bonne couleur.'
];
