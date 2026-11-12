/* Parcours libre — Retour et Suivant sous chacun des six mini-jeux.
 * "Passer" marque une scène visitée, jamais un trésor gagné.
 */
(function(){
 'use strict';
 const flow=window.TreizeChapitre1;
 if(!flow)return;
 const $=id=>document.getElementById(id);
 const VIEWS=[
  {key:'1',dialog:'marmousetsDialog',close:'marmousetsClose',title:'Les Marmousets'},
  {key:'2',dialog:'arcadeDialog',close:'arcadeClose',title:'Le lycée'},
  {key:'3',dialog:'catalogneDialog',close:'catalogneClose',title:'Barcelone'},
  {key:'4',dialog:'bosnieDialog',close:'bosnieClose',title:'Sarajevo'},
  {key:'5:dance',dialog:'danseDialog',close:'danseClose',title:'Le danseur'},
  {key:'5:prison',dialog:'yoyoDialog',close:'yoyoClose',title:'La prison'}
 ];
 const currentKey=()=>{
  if(state.selected>=1&&state.selected<=4)return String(state.selected);
  if(state.selected===5)return window.TreizePlateauxNavigation?.currentPart?.()==='prison'?'5:prison':'5:dance';
  return null;
 };
 const passed=key=>key==='5:dance'?flow.chapter2PartDone(state,2):
  key==='5:prison'?Boolean(state.yoyoFinished||state.storySkips?.includes('5:prison')):
  Number(key)===4?flow.chapter2PartDone(state,1):flow.partDone(state,Number(key));
 function back(key){
  const view=VIEWS.find(v=>v.key===key);
  if(!view)return false;
  window.TreizeSceneNavigation?.cancelAutomatic?.();
  if(key==='5:dance'||key==='5:prison')
   window.TreizePlateauxNavigation?.back?.(key==='5:dance'?'dance':'prison');
  else{
   const dialog=$(view.dialog);
   if(dialog?.open)$(view.close)?.click();
  }
  return true;
 }
 function next(key=currentKey()){
  const view=VIEWS.find(v=>v.key===key);
  if(!view||boardRolling||state.selected!==Number(key.split(':')[0]))return false;
  const wasComplete=passed(key);
  if(!wasComplete&&!flow.skipPart(state,key))return false;
  window.TreizeSceneNavigation?.cancelAutomatic?.();
  save();
  if(key==='5:dance'||key==='5:prison'){
   render();
   window.TreizePlateauxNavigation?.next?.(key==='5:dance'?'dance':'prison');
   return true;
  }
  back(key); // Dismiss this game before launching the route to the next scene.
  render();
  rollTravel(Number(key));
  return true;
 }
 function installButtons(){
  for(const view of VIEWS){
   const dialog=$(view.dialog);
   if(!dialog||dialog.querySelector('.arcade-under-actions'))continue;
   const footer=document.createElement('div');
   footer.className='arcade-under-actions';
   footer.setAttribute('role','group');
   footer.setAttribute('aria-label','Navigation du mini-jeu '+view.title);
   const backButton=document.createElement('button');
   backButton.type='button';backButton.className='arcade-return';
   backButton.textContent='← Retour au plateau';
   backButton.onclick=()=>back(view.key);
   const nextButton=document.createElement('button');
   nextButton.type='button';nextButton.className='arcade-following';
   nextButton.textContent='Suivant →';
   nextButton.setAttribute('aria-label','Suivant, passer le défi sans gagner ses points');
   nextButton.onclick=()=>next(view.key);
   footer.append(backButton,nextButton);
   dialog.append(footer);
  }
 }
 function installStorySkip(){
  if($('storySkip'))return;
  const anchor=$('options');
  if(!anchor)return;
  const button=document.createElement('button');
  button.id='storySkip';button.type='button';button.className='story-skip-action';
  button.textContent='Passer le défi et continuer →';
  button.onclick=()=>next(currentKey());
  anchor.after(button);
 }
 function updateButtons(){
  const skip=$('storySkip');
  if(!skip)return;
  const key=currentKey(),view=VIEWS.find(x=>x.key===key);
  skip.hidden=!view||boardRolling;
  if(!view)return;
  skip.textContent=passed(key)?'Continuer sans rejouer →':'Passer le défi et continuer →';
  skip.setAttribute('aria-label',passed(key)?'Continuer vers le lieu suivant':'Passer le défi '+view.title+' sans points et aller au lieu suivant');
  for(const item of VIEWS){
   const d=$(item.dialog);
   const following=d?.querySelector('.arcade-following');
   if(following)following.textContent=passed(item.key)?'Suivant →':'Suivant · Passer ce jeu →';
  }
 }
 const css=document.createElement('style');css.id='libre-parcours-styles';
 css.textContent=":is(#marmousetsDialog,#arcadeDialog,#catalogneDialog,#bosnieDialog,#danseDialog,#yoyoDialog)[open]{display:flex;flex-direction:column}\n:is(#marmousetsDialog,#arcadeDialog,#catalogneDialog,#bosnieDialog,#danseDialog,#yoyoDialog) iframe{flex:1;min-height:0;width:100%}\n.arcade-under-actions{flex:0 0 auto;display:flex;justify-content:space-between;gap:9px;align-items:stretch;padding:9px 13px 12px;border-top:1px solid #8e8f7866;background:#152821}\n.arcade-under-actions button{flex:1;min-width:0;min-height:46px;padding:9px 12px;border-radius:7px;font:700 clamp(12px,1.35vw,15px)/1.35 system-ui,sans-serif;cursor:pointer}\n.arcade-return{background:#33443d;color:#f7edd6;border:1px solid #c0ac88}\n.arcade-following{background:#f6e2b7;color:#273e35;border:1px solid #fbf3db}\n.arcade-under-actions button:focus-visible{outline:3px solid #fff3a2;outline-offset:2px}\n.story-skip-action{display:block;width:100%;min-height:47px;margin:10px 0 16px;border:1px solid #a28e6b;border-radius:7px;background:#fff0d8;color:#385645;font:700 14px/1.4 system-ui,sans-serif;cursor:pointer}\n.story-skip-action:hover{background:#eee0bc}\n.story-skip-action[hidden]{display:none!important}\n@media(max-width:650px){.arcade-under-actions{padding:7px 8px 10px;gap:7px}.arcade-under-actions button{font-size:12px;min-height:45px;padding:8px 7px}}";
 document.head.append(css);
 installButtons();installStorySkip();
 const oldRender=render;
 render=function(){oldRender();installButtons();updateButtons();};
 window.TreizeLibreParcours={next,back,currentKey,passed,installButtons,updateButtons};
 updateButtons();
})();
