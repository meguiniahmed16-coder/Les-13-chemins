import {introInvitationLayout} from './intro-invitation.js';
import {INTRO_INVITATION_PEOPLE,INTRO_INVITATION_EXAMPLES} from './intro-invitation-data.js';

// A directed demonstration, driven by the same clock as the fitted 3D guests.
// It never opens another screen or asks the viewer to press Continue.
export function mountIntroInvitation(host,layer){
 const doc=host.ownerDocument,panel=doc.createElement('section'),fade=doc.createElement('div');
 panel.className='invitation-demo';panel.hidden=true;
 panel.setAttribute('aria-label','Démonstration de l’index des personnages de La Tectonique des âmes');
 panel.innerHTML=`<header><span>Index des personnages</span><small class="invitation-count"></small></header>
  <div class="invitation-modes" aria-hidden="true"><span data-mode="choose">Choisir un personnage</span><span data-mode="random">Au hasard</span></div>
  <div class="invitation-list" aria-hidden="true"></div>
  <article class="invitation-card" hidden><h3></h3><p class="invitation-chapter"></p><p class="invitation-context"><span class="invitation-story"></span><span class="invitation-location"></span></p><p class="invitation-interaction"></p><p class="invitation-links"></p><small class="invitation-reference"></small></article>
  <p class="invitation-status" aria-live="off"></p>`;
 fade.className='invitation-dissolve';fade.hidden=true;fade.setAttribute('aria-hidden','true');
 layer.append(panel,fade);
 panel.querySelector('.invitation-count').textContent=INTRO_INVITATION_PEOPLE.length+' personnages';
 const list=panel.querySelector('.invitation-list'),card=panel.querySelector('.invitation-card'),status=panel.querySelector('.invitation-status');
 let previousKey='',previousExample=-1;
 function hide(){panel.hidden=true;fade.hidden=true;}
 function update(arrival){
  const cue=arrival.invitation,inSalon=arrival.phase==='salon';
  const opacity=inSalon?cue.exitOpacity:Math.max(0,1-arrival.gardenElapsedMs/700);
  fade.hidden=opacity<=0;fade.style.opacity=String(opacity);
  if(!inSalon){panel.hidden=true;return null;}
  panel.hidden=!cue.selectorVisible;
  const layout=introInvitationLayout({width:host.clientWidth,height:host.clientHeight}),r=layout.panel;
  Object.assign(panel.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',maxHeight:r.height+'px'});
  panel.classList.toggle('compact',layout.portrait||r.height<340);
  panel.classList.toggle('short',r.height<205);
  panel.classList.toggle('has-card',cue.cardVisible);
  for(const mode of panel.querySelectorAll('[data-mode]'))mode.classList.toggle('active',mode.dataset.mode===cue.mode);
  const example=INTRO_INVITATION_EXAMPLES[cue.selectedIndex];
  card.hidden=!cue.cardVisible;list.hidden=cue.cardVisible;
  if(cue.cardVisible&&previousExample!==cue.selectedIndex){
   previousExample=cue.selectedIndex;
   card.querySelector('h3').textContent=example.name;
   card.querySelector('.invitation-chapter').textContent=example.chapterLabel;
   card.querySelector('.invitation-story').textContent=example.storyPart;
   card.querySelector('.invitation-location').textContent=' · '+example.location;
   card.querySelector('.invitation-interaction').textContent=example.interaction;
   card.querySelector('.invitation-links').textContent='Avec '+example.withNames.join(' et ');
   card.querySelector('.invitation-reference').textContent=example.referenceLabel;
  }
  if(!cue.cardVisible){
   const center=cue.roulette>=0?(61+cue.roulette*31)%INTRO_INVITATION_PEOPLE.length:INTRO_INVITATION_PEOPLE.findIndex(person=>person.id===example.id);
   const key=cue.mode+':'+center;
   if(key!==previousKey){
    previousKey=key;
    const rows=[-1,0,1].map(offset=>{
     const person=INTRO_INVITATION_PEOPLE[(center+offset+INTRO_INVITATION_PEOPLE.length)%INTRO_INVITATION_PEOPLE.length];
     const row=doc.createElement('p');row.className=offset===0?'selected':'';
     const name=doc.createElement('span'),chapter=doc.createElement('small');
     name.textContent=person.name;chapter.textContent='Ch. '+person.chapters.slice(0,3).join(', ')+(person.chapters.length>3?'…':'');
     row.append(name,chapter);return row;
    });list.replaceChildren(...rows);
   }
  }
  const next=cue.phase==='random'?'Le hasard choisit…':cue.guestOpacity>0&&cue.guestOpacity<1?example.name+' vous rejoint':cue.guestOpacity>=1?'Une rencontre, dans le salon.':'Tous les personnages du livre, à retrouver dans l’index.';
  if(status.textContent!==next)status.textContent=next;
  return layout;
 }
 return {update,hide};
}
