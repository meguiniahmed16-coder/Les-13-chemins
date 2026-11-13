/* Les chemins jouables partagent le lecteur à quatre onglets des chemins IV et V.
 * Les moteurs, quiz, sessions et sauvegardes restent gérés par leurs contrôleurs. */
(function(root){
 'use strict';
 const titles=['Les Marmousets','Le départ du lycée','Barcelone','Sarajevo','Le danseur','Camarades !','La prison','Cyrano','Tu veux bien t’occuper de moi ?'];
 const crops=[[68,148,343,340],[435,148,334,340],[789,148,343,340],[68,540,343,337],[431,540,337,337],[789,540,343,337],[68,929,341,355],[430,929,337,355],[789,929,343,355]];
 const art=index=>({src:'assets/board/scene-cards-v1.png',width:1199,height:1312,crop:crops[index]});
 const narrator=()=>root.TreizeUpcomingData?.profiles?.ahmed;
 function profiles(stage,extra=[]){
  const result=narrator()?[narrator()]:[];
  for(const p of stage?.workshops||[])result.push({name:p.name,role:'Voix d’atelier',workshop:p.atelier,paragraphs:p.paragraphs});
  for(const name of stage?.characters||[])if(!result.some(p=>p.name===name))result.push({name,role:'Personnage du passage',paragraphs:[]});
  for(const p of extra)if(!result.some(existing=>existing.name===p.name))result.push(p);
  return result;
 }
 function route(stage){
  if(!stage?.coordinates)return undefined;
  return {title:stage.city,points:[[stage.city,...stage.coordinates]],zoom:12,caption:stage.history||'Repère du récit ; coordonnées indicatives.'};
 }
 function gamePanel(options={}){
  return (panel,{leave})=>{
   const h=(tag,cls,text)=>{const el=document.createElement(tag);el.className=cls;if(text!==undefined)el.textContent=text;return el;};
   const quiz=options.inlineQuiz;
   let answered=!quiz,committed=false;
   panel.append(h('h3','',options.gameTitle||'À vous de jouer'));
   panel.append(h('p','upcoming-caption',options.gameText||'Lancez le jeu de cette scène. Votre progression et vos points sont conservés.'));
   const launch=h('button','upcoming-button','Jouer →');launch.type='button';launch.disabled=!answered;
   if(quiz&&Array.isArray(quiz.options)){
    const group=h('section','upcoming-quiz');group.setAttribute('aria-label','Quiz du chapitre');
    group.append(h('h3','',quiz.question));
    quiz.options.forEach((text,index)=>{
     const choice=h('button','upcoming-button',String.fromCharCode(65+index)+' · '+text);choice.type='button';
     choice.onclick=()=>{
      if(answered||committed)return;
      answered=true;quiz.onAnswer?.(index);
      for(const b of group.querySelectorAll('button'))b.disabled=true;
      group.append(h('p','upcoming-caption',index===quiz.correct?'Bonne réponse. Le jeu est prêt.':'Réponse enregistrée. Vous pourrez réessayer après le jeu.'));
      launch.disabled=false;
     };
     group.append(choice);
    });panel.append(group);
   }
   launch.onclick=()=>{if(!answered||committed)return;committed=true;leave(()=>options.onChallenge?.());};
   const actions=h('div','upcoming-game-actions');actions.append(launch);
   if(options.onSkip){
    const skip=h('button','upcoming-button','Passer le défi sans points →');skip.type='button';
    skip.onclick=()=>{if(committed)return;committed=true;leave(options.onSkip);};actions.append(skip);
   }
   panel.append(actions);
  };
 }
 function stageScene(n,plateau=1){
  const stage=root.TreizeEscale?.getStage(n,plateau);
  if(!stage||n<1||n>5)return null;
  const index=n===5&&plateau===2?6:n-1;
  return {id:'jouable-'+n+'-'+plateau,path:n<=3?'I':index===6?'III':'II',title:titles[index],
   chapter:stage.passage.chapter,chapterTitle:stage.passage.title,
   reference:'Extrait du chapitre '+Number(stage.passage.chapter)+' — « '+stage.passage.title+' »'+(stage.passage.pageLabel?' · '+stage.passage.pageLabel:''),
   place:stage.city+' · '+stage.area,lead:stage.passage.scene,
   paragraphs:stage.passage.quote.split(/\n\s*\n/),profiles:profiles(stage),
   route:'jouable-'+n+'-'+plateau,routeData:route(stage),atlasUrl:'carte.html?niveau='+n+'&plateau='+plateau,
   art:art(index),playable:true};
 }
 function openStage(n,options={}){
  const scene=stageScene(n,Number(options.plateau)||1);if(!scene)return null;
  scene.renderGame=gamePanel(options);
  return root.TreizeCheminsEnCours.openScene(scene,{onDismiss:options.onDismiss});
 }
 function openRendezvous(info){
  const index=info.id==='manifestation'?5:info.id==='cyrano'?7:8;
  const paris=root.TreizeUpcomingData?.routes?.paris;
  const stage=info.id==='rencontre'?root.TreizeEscale?.getStage(5):null;
  const extra=info.id==='cyrano'?[{name:'Cédric Aubert',role:'Le voisin de cellule qui confie ses lettres',paragraphs:[]}]:
   info.id==='rencontre'?[{name:'La jeune femme de l’anniversaire',role:'La rencontre dans la cuisine',paragraphs:[]}]:
   [{name:'Julie',role:'Au début du passage, devant la télévision',paragraphs:[]}];
  const scene={id:'jouable-'+info.id,path:index===5?'II':'III',title:titles[index],
   chapter:info.chapter,chapterTitle:info.chapterTitle,place:info.place,lead:info.lead||info.title,
   paragraphs:info.paragraphs,profiles:profiles(stage,extra),route:'jouable-'+info.id,
   routeData:info.id==='cyrano'?undefined:paris,atlasUrl:'carte.html',art:art(index),playable:true,
   renderGame:gamePanel(info)};
  return root.TreizeCheminsEnCours.openScene(scene);
 }
 root.TreizeUnifiedReader={stageScene,gamePanel,openStage,openRendezvous};
 if(root.TreizeEscale&&root.TreizeCheminsEnCours?.openScene){
  const original=root.TreizeEscale.openReader;
  root.TreizeEscale.openReader=function(n,options={}){return n>=1&&n<=5?openStage(n,options):original(n,options);};
 }
})(globalThis);
