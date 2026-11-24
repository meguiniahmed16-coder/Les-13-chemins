const $=id=>document.getElementById(id);
const frame=$('scene-frame'),key='maison-des-rencontres-prologue-rapports-v3';
const lines=[
 ['Narrateur','Qu’est-ce qu’une rencontre ? Qu’est-ce que véritablement l’autre ?','white','face'],
 ['Narrateur','Quelqu’un qui me ressemble ? Quelqu’un qui me résiste ?','white','close'],
 ['Narrateur','Ou simplement une présence qui vient bouleverser ce que je croyais savoir de moi.','white','wide'],
 ['Narrateur','Viens, asseyons-nous.','white','face'],
 ['Narrateur','Prends place.','sofa','wide'],
 ['Narrateur','Voici le monde tel que tu l’as connu, {pseudo}.','sofa','tv'],
 ['Narrateur','Un monde de masques. Un monde d’illusions.','sofa','tv'],
 ['Narrateur','Un monde où tu as joué un personnage.','sofa','tv'],
 ['Narrateur','Un monde où tous les matins tu te déguises pour aller travailler.','sofa','tv'],
 ['Narrateur','Un monde où tu ne rencontres que les masques des autres.','sofa','tv'],
 ['Narrateur','Mais il existe un autre monde.','sofa','wide'],
 ['Narrateur','Ici, tu peux prendre le risque d’être toi-même.','sofa','face'],
 ['Narrateur','Tu peux aussi te déguiser. Personne ne te jugera.','sofa','close'],
 ['Narrateur','Suis-moi.','sofa','wide'],
 ['Narrateur','Avant d’aller plus loin, je dois t’expliquer comment ce monde fonctionne.','dojo','face'],
 ['Narrateur','Tu peux bouger ton personnage, regarder autour de toi, modifier son apparence et choisir sa tenue.','dojo','face'],
 ['Narrateur','Ce monde est en construction. Toi aussi, tu vas participer à sa construction.','dojo','face'],
 ['Narrateur','Tu pourras revenir ici quand tu voudras. Maintenant, découvrons la maison.','dojo','face'],
 ['Narrateur','Regarde : le jardin, les papillons et la maison. À toi de découvrir ce monde.','garden','face']
];
let authorized=false,ready=false,started=false,pseudo='Voyageur',index=0,auto=false,timer=0,stage='white',author='atelier';
let logs=[];try{const v=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(v))logs=v.slice(-100)}catch{}
function store(){try{localStorage.setItem(key,JSON.stringify(logs.slice(-100)))}catch{}}
function log(type,message,detail={}){logs.push({time:new Date().toISOString(),type,scene:stage,index,message:String(message).slice(0,3000),detail});store()}
addEventListener('error',e=>log('javascript',e.message||'Erreur',{filename:e.filename,line:e.lineno}));
addEventListener('unhandledrejection',e=>log('javascript',String(e.reason)));
function send(action,value){if(!ready||!frame.contentWindow)return;frame.contentWindow.postMessage({scope:'maison-intro-v27',action,value},location.origin)}
function sceneTitle(scene){
 return scene==='white'?'Salle blanche · la rencontre':scene==='sofa'?'Les fauteuils · le monde des masques':scene==='dojo'?'Le dojo · tutoriel':'Le jardin · la maison';
}
function display(n){
 index=Math.max(0,Math.min(lines.length-1,n));
 const [speaker,text,scene,shot]=lines[index];
 if(stage!==scene){
  stage=scene;
  if(scene==='white')send('pose','white');
  if(scene==='sofa')send('pose','sofa');
  if(scene==='dojo')send('pose','dojo');
  if(scene==='garden')send('garden');
 }
 if(scene==='white'||scene==='sofa')send('camera',shot);
 $('scene-label').textContent=sceneTitle(stage);
 const bubble=$('bubble');bubble.hidden=false;bubble.style.animation='none';void bubble.offsetWidth;bubble.style.animation='';
 $('speaker').textContent=speaker;
 $('line').textContent=text.replaceAll('{pseudo}',pseudo);
 $('previous').disabled=index===0;$('next').textContent=index===lines.length-1?'Recommencer':'Continuer';
 $('training').hidden=scene!=='dojo';
 $('progress').textContent=(index+1)+' / '+lines.length;
 if(scene==='garden'){
  setTimeout(()=>{if(index===lines.length-1)bubble.hidden=true},6500);
 }
 clearTimeout(timer);
 if(auto&&scene!=='dojo'&&scene!=='garden')timer=setTimeout(()=>display(index+1),Math.max(4300,1700+text.length*55));
 else if(auto){auto=false;$('autoplay').textContent='Lecture automatique';}
}
function autoplay(on){auto=on;clearTimeout(timer);$('autoplay').textContent=auto?'Pause cinéma':'Lecture automatique';if(auto&&started&&index<14)timer=setTimeout(()=>display(index+1),Math.max(4300,1700+lines[index][1].length*55))}
$('next').onclick=()=>{autoplay(false);display(index===lines.length-1?0:index+1)};
$('previous').onclick=()=>{autoplay(false);display(Math.max(0,index-1))};
$('autoplay').onclick=()=>autoplay(!auto);
$('goto-dojo').onclick=()=>{autoplay(false);display(14)};
$('goto-garden').onclick=()=>{autoplay(false);display(18)};
$('start').onclick=()=>{if(!authorized||!ready)return;started=true;pseudo=$('pseudo').value.trim().slice(0,40)||'Voyageur';$('opening').hidden=true;stage='';display(0);autoplay(true)};
frame.addEventListener('load',()=>{
 try{
  const win=frame.contentWindow;
  win.addEventListener('error',e=>log('erreur-3d',e.message,{file:e.filename,line:e.lineno}));
  win.addEventListener('unhandledrejection',e=>log('erreur-3d',String(e.reason)));
 }catch(e){log('erreur-3d','La capture des erreurs du rendu 3D est indisponible.')}
});
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.scope!=='maison-intro-v27')return;
 if(e.data.type==='ready'){
   ready=true;$('start').disabled=false;$('loading').textContent='Les vrais personnages 3D du salon sont chargés.';
 }else if(e.data.type==='error'){
   log('erreur-3d',e.data.message||'Échec du chargement');$('loading').textContent='Une erreur 3D a été détectée : '+(e.data.message||'inconnue');
 }
});
async function authorize(){
 try{
  const response=await fetch('/api/membres/me?auteur=1',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(16000)});
  if(!response.ok)throw Error('Session auteur expirée');
  const me=await response.json();if(!me.author)throw Error('Accès auteur nécessaire');
  authorized=true;author=me.author;
  $('pseudo').value=me.pseudo||'Voyageur';
  document.querySelectorAll('a[href*="auteur=atelier"]').forEach(a=>a.href=a.href.replace('auteur=atelier','auteur='+encodeURIComponent(author)));
  frame.src='/membres/v27/salon.html?v=gestes50&resident=marianne&intro3d=1';
 }catch(e){$('locked').hidden=false;$('opening').hidden=true;$('loading').textContent='L’accès auteur n’a pas été confirmé.';}
}
$('bug').onclick=()=>{$('report-scene').value=sceneTitle(stage);$('report-count').textContent=logs.length+' signalements sauvegardés';$('report-dialog').showModal()};
$('close-report').onclick=()=>$('report-dialog').close();
$('add-report').onclick=()=>{
 const t=$('report-note').value.trim();if(!t){$('report-note').focus();return}
 log($('report-type').value,t);
 $('report-note').value='';$('report-count').textContent=logs.length+' signalements sauvegardés';
};
$('export-report').onclick=()=>{
 const data={schema:'maison-rencontres-v3',date:new Date().toISOString(),scene:stage,step:index,viewport:{width:innerWidth,height:innerHeight},userAgent:navigator.userAgent,logs};
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='rapport-maison-rencontres-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
};
$('report-dialog').addEventListener('click',e=>{if(e.target===$('report-dialog'))$('report-dialog').close()});
void authorize();
