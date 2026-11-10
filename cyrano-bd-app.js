/* Cyrano BD — photographie + caméra virtuelle + texte machine à écrire.
 * Aucune animation de faux corps ; la caméra et les bulles portent le récit.
 * Texte du dialogue importé exclusivement de cyrano-core.js (V17).
 */
import {SCENES,MISSIONS,wordList,normalise,validateLetter} from './cyrano-core.js';
import {BOARD,PANELS,BEATS,cameraFor,beat,panelById,beatSpeaker,requiresWallCut,typedCharacters} from './cyrano-bd-core.js';
const $=id=>document.getElementById(id);
const ATLAS_URL='assets/cyrano/cyrano-atlas.avif?v=cyrano-bd-v1';
let started=false,currentIndex=-1,activePanel=null,transitionId=0,typing=null,autoplay=false,autoTimer=null,sound=false,overview=false;
let letterIndex=0,letters=['','',''],validated=[false,false,false],recognition=null,listening=false;
const pan=$('board'),stage=$('stage'),speech=$('speech'),speechText=$('speechText');
function buildBoard(){
 pan.style.width=BOARD.width+'px';pan.style.height=BOARD.height+'px';
 for(const panel of PANELS){
  const button=document.createElement('button');button.type='button';button.className='panel';
  button.dataset.id=panel.id;button.dataset.room=panel.room;
  button.style.left=panel.x+'px';button.style.top=panel.y+'px';
  button.style.width=panel.w+'px';button.style.height=panel.h+'px';
  const image=document.createElement('div');image.className='photo';
  image.style.backgroundImage='url("'+ATLAS_URL+'")';
  image.style.backgroundPosition=(panel.column/3*100)+'% '+(panel.row*100)+'%';
  image.setAttribute('aria-hidden','true');
  const tag=document.createElement('span');tag.className='tag';tag.textContent=panel.caption;
  const num=document.createElement('span');num.className='index';num.textContent=String(PANELS.indexOf(panel)+1).padStart(2,'0');
  button.append(image,tag,num);
  button.title=panel.caption;button.setAttribute('aria-label','Ouvrir la vignette : '+panel.caption);
  button.onclick=()=>{
   if(!started){$('storyIntro').hidden=true;started=true;}
   const index=BEATS.findIndex(b=>b.panel===panel.id);
   if(index>=0)showBeat(index);
  };
  pan.append(button);
 }
}
function moveCamera(panelId=null,duration=1150){
 const c=cameraFor(stage.clientWidth,stage.clientHeight,panelId);
 pan.style.transitionDuration=duration+'ms';
 pan.style.transform='translate3d('+c.x.toFixed(2)+'px,'+c.y.toFixed(2)+'px,0) scale('+c.scale.toFixed(5)+')';
 activePanel=panelId;
 for(const el of pan.children)el.classList.toggle('active',panelId&&el.dataset.id===panelId);
 const p=panelById(panelId);
 $('panelTitle').textContent=p?p.caption:'UNE PLANCHE, DEUX CELLULES';
}
function showBoardOverview(){
 if(!started){$('storyIntro').hidden=true;started=true;}
 ++transitionId;clearAutoplay();typing=null;overview=true;
 speech.hidden=true;moveCamera(null,1050);
 $('counter').textContent='Planche complète · touche une vignette pour reprendre';
}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function cancelVoice(){try{window.speechSynthesis?.cancel?.();}catch{}}
function say(shot){
 if(!sound||shot.who==='ambiance'||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;
 try{
  cancelVoice();
  const utter=new SpeechSynthesisUtterance(shot.text.replace(/^—\s*/,''));
  utter.lang='fr-FR';utter.rate=shot.who==='cedric'?.88:.94;
  utter.pitch=shot.who==='cedric'?.76:1.00;
  window.speechSynthesis.speak(utter);
 }catch{}
}
function clearAutoplay(){if(autoTimer!==null){clearTimeout(autoTimer);autoTimer=null;}}
function scheduleNext(){
 clearAutoplay();if(!autoplay||!started||overview)return;
 autoTimer=setTimeout(()=>{
  autoTimer=null;
  if(currentIndex<BEATS.length-1)showBeat(currentIndex+1);
  else showWriting();
 },1500);
}
function beginTyping(shot){
 typing={text:shot.text,start:performance.now(),lastLength:-1,complete:false};
 speech.hidden=false;speech.dataset.who=shot.who;
 $('speechWho').textContent=beatSpeaker(currentIndex);
 speechText.textContent='';$('caret').hidden=false;
 $('counter').textContent='Réplique '+(currentIndex+1)+' / '+BEATS.length+' · '+(autoplay?'lecture auto':'lecture manuelle');
 say(shot);
}
async function showBeat(index,{fast=false}={}){
 if(index<0||index>=BEATS.length)return;
 ++transitionId;const token=transitionId;
 const prev=beat(currentIndex),next=beat(index);
 clearAutoplay();cancelVoice();
 const crossing=prev&&requiresWallCut(prev,next);
 started=true;overview=false;typing=null;speech.hidden=true;
 currentIndex=index;$('storyIntro').hidden=true;
 $('frameNumber').textContent=String(index+1).padStart(2,'0')+' / '+BEATS.length;
 $('prev').disabled=index===0;
 $('next').textContent=index===BEATS.length-1?'✎ Passer aux lettres':'Réplique suivante →';
 if(crossing&&!fast){
  moveCamera('wall',740);
  $('counter').textContent='La caméra traverse le mur…';
  await delay(820);
  if(token!==transitionId)return;
 }
 moveCamera(next.panel,fast?1:950);
 await delay(fast?45:980);
 if(token!==transitionId)return;
 beginTyping(next);
}
function paintType(now){
 requestAnimationFrame(paintType);
 if(!typing||speech.hidden)return;
 const length=typedCharacters(typing.text.length,now-typing.start,23);
 if(length!==typing.lastLength){
  typing.lastLength=length;
  speechText.textContent=typing.text.slice(0,length);
  if(length>=typing.text.length){
   $('caret').hidden=true;typing.complete=true;
   scheduleNext();
  }
 }
}
function goNext(){
 if($('story').hidden)return;
 if(!started){showBeat(0);return;}
 if(overview){showBeat(Math.max(0,currentIndex),{fast:true});return;}
 if(typing&&!typing.complete){
  typing.start=performance.now()-typing.text.length*23-50;return;
 }
 if(currentIndex>=BEATS.length-1){showWriting();return;}
 showBeat(currentIndex+1);
}
function goPrev(){
 if(!started||currentIndex<=0)return;
 showBeat(currentIndex-1);
}
function toggleAuto(){
 autoplay=!autoplay;$('autoplay').textContent=autoplay?'❚❚ Auto':'▶ Auto';
 $('autoplay').setAttribute('aria-pressed',String(autoplay));
 clearAutoplay();
 if(autoplay){
  if(!started)showBeat(0);
  else if(typing?.complete)scheduleNext();
  else if(overview)showBeat(Math.max(0,currentIndex),{fast:true});
 }
}
function showWriting(){
 ++transitionId;clearAutoplay();cancelVoice();
 $('story').hidden=true;$('letters').hidden=false;$('complete').hidden=true;
 letterIndex=0;validated=[false,false,false];letters=['','',''];
 renderLetter();$('letters').scrollIntoView({block:'start',behavior:'smooth'});
}
function renderLetter(){
 const m=MISSIONS[letterIndex];
 $('letterTitle').textContent=m.title;
 $('letterPrompt').textContent=m.intent+' Utilise ces cinq mots dans une vraie lettre d’amour.';
 $('letter').value=letters[letterIndex];
 [...$('lettersProgress').children].forEach((el,i)=>{
  el.classList.toggle('active',i===letterIndex);
  el.classList.toggle('done',validated[i]);
 });
 $('letterFeedback').hidden=true;$('letterFeedback').classList.remove('ok');
 $('checkLetter').disabled=validated[letterIndex];
 $('nextLetter').hidden=!validated[letterIndex];
 $('nextLetter').textContent=letterIndex===2?'Terminer →':'Lettre suivante →';
 refreshWords();
}
function refreshWords(){
 const words=new Set(wordList($('letter').value)),m=MISSIONS[letterIndex];
 $('required').replaceChildren();
 for(const term of m.required){
  const el=document.createElement('span');el.className='word'+(words.has(normalise(term))?' found':'');
  el.textContent=term;$('required').append(el);
 }
 $('letterCount').textContent=wordList($('letter').value).length+' mots · minimum 65';
}
function setFeedback(result){
 const target=$('letterFeedback');target.replaceChildren();
 target.hidden=false;target.classList.toggle('ok',result.ok);
 const title=document.createElement('strong');
 title.textContent=result.ok?'✓ La lettre peut être recopiée':'Cette lettre a besoin d’être reprise';
 target.append(title);
 const paragraph=document.createElement('p');
 paragraph.textContent=result.ok?
  'Les cinq mots sont intégrés dans un texte amoureux. Le petit passage dans le mur est prêt.':
  'Voici ce qui manque pour remplir les conditions du jeu :';
 target.append(paragraph);
 if(!result.ok){
  const list=document.createElement('ul');
  for(const issue of result.issues){const li=document.createElement('li');li.textContent=issue;list.append(li);}
  target.append(list);
 }
}
function checkLetter(){
 const text=$('letter').value, result=validateLetter(text,letterIndex);
 setFeedback(result);
 if(!result.ok)return;
 validated[letterIndex]=true;letters[letterIndex]=text;
 $('checkLetter').disabled=true;$('nextLetter').hidden=false;
 $('nextLetter').textContent=letterIndex===2?'Terminer →':'Lettre suivante →';
 [...$('lettersProgress').children][letterIndex].classList.add('done');
}
function nextLetter(){
 if(!validated[letterIndex])return;
 if(letterIndex===2){
  $('letters').hidden=true;$('complete').hidden=false;
  $('complete').scrollIntoView({block:'start',behavior:'smooth'});return;
 }
 letterIndex++;renderLetter();$('letters').scrollIntoView({block:'start'});
}
function returnFilm(){
 $('letters').hidden=true;$('complete').hidden=true;$('story').hidden=false;
 showBeat(Math.max(0,currentIndex),{fast:true});
 $('story').scrollIntoView({block:'start',behavior:'smooth'});
}
function setupDictation(){
 const API=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!API){
  $('dictate').textContent='🎙 Micro du clavier';
  $('dictate').onclick=()=>{$('letter').focus();$('dictationInfo').textContent='Utilise le microphone de ton clavier si disponible.';};
  return;
 }
 const rec=new API();recognition=rec;
 rec.lang='fr-FR';rec.continuous=true;rec.interimResults=false;
 rec.onresult=event=>{
  let addition='';
  for(let i=event.resultIndex;i<event.results.length;i++)if(event.results[i].isFinal)addition+=event.results[i][0].transcript.trim()+' ';
  if(addition){
   const el=$('letter');el.value+=(el.value&&!el.value.endsWith(' ')?' ':'')+addition;
   letters[letterIndex]=el.value;validated[letterIndex]=false;
   $('checkLetter').disabled=false;$('nextLetter').hidden=true;
   $('letterFeedback').hidden=true;refreshWords();
  }
 };
 rec.onerror=err=>{$('dictationInfo').textContent='Dictée indisponible : '+err.error;};
 rec.onend=()=>{listening=false;$('dictate').textContent='🎙 Dicter';};
 $('dictate').onclick=()=>{
  if(listening){rec.stop();return;}
  try{rec.start();listening=true;$('dictate').textContent='■ Arrêter';}
  catch{$('dictationInfo').textContent='Utilise le microphone de ton clavier.';}
 };
}
function bind(){
 $('startStory').onclick=()=>showBeat(0);
 $('prev').onclick=goPrev;$('next').onclick=goNext;
 $('overview').onclick=showBoardOverview;
 $('autoplay').onclick=toggleAuto;
 $('toLetters').onclick=showWriting;
 $('sound').onclick=()=>{
  sound=!sound;$('sound').textContent=sound?'Son ON':'Son OFF';
  $('sound').setAttribute('aria-pressed',String(sound));
  if(!sound)cancelVoice();
 };
 $('letter').addEventListener('input',()=>{
  letters[letterIndex]=$('letter').value;validated[letterIndex]=false;
  $('checkLetter').disabled=false;$('nextLetter').hidden=true;
  $('letterFeedback').hidden=true;refreshWords();
 });
 $('checkLetter').onclick=checkLetter;$('nextLetter').onclick=nextLetter;
 $('copyLetter').onclick=async()=>{
  try{await navigator.clipboard.writeText($('letter').value);$('dictationInfo').textContent='Lettre copiée';}
  catch{$('letter').focus();$('letter').select();$('dictationInfo').textContent='Texte sélectionné : utilise Copier';}
 };
 $('returnFilm').onclick=returnFilm;
 $('replay').onclick=()=>{
  $('complete').hidden=true;$('story').hidden=false;
  currentIndex=-1;started=false;overview=false;autoplay=false;typing=null;
  $('autoplay').textContent='▶ Auto';$('autoplay').setAttribute('aria-pressed','false');
  $('storyIntro').hidden=false;moveCamera(null,0);speech.hidden=true;
  $('story').scrollIntoView({block:'start',behavior:'smooth'});
 };
 $('finish').onclick=()=>{location.href='jeu.html';};
 window.addEventListener('keydown',event=>{
  if($('story').hidden||['TEXTAREA','INPUT'].includes(document.activeElement?.tagName))return;
  if(event.key==='ArrowRight'||event.key===' '){event.preventDefault();goNext();}
  if(event.key==='ArrowLeft'){event.preventDefault();goPrev();}
 });
 const resize=()=>moveCamera(overview||!started?null:beat(currentIndex)?.panel||null,0);
 window.addEventListener('resize',resize);
 setupDictation();
}
async function verifyAtlas(){
 try{
  const img=new Image();img.decoding='async';img.src=ATLAS_URL;
  await img.decode();
 }catch(error){
  console.warn('Atlas photo non chargé :',error);
  $('counter').textContent='Images indisponibles — vérifier la connexion';
 }
}
buildBoard();bind();
requestAnimationFrame(paintType);
requestAnimationFrame(()=>moveCamera(null,0));
verifyAtlas();
