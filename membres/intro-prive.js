const $=id=>document.getElementById(id);
const reportKey='maison-rencontres-essai-v1';
let reports=[],errors=[],current=-1,playing=false,autoplay=null,authorized=false,pseudo='Invité';
const safe=(v,n=1000)=>String(v??'').slice(0,n);
try{const found=JSON.parse(localStorage.getItem(reportKey)||'[]');if(Array.isArray(found))reports=found.slice(-100)}catch{}
function remember(){try{localStorage.setItem(reportKey,JSON.stringify(reports.slice(-100)))}catch{}}
const when=()=>new Date().toISOString();
function fault(message,stack=''){const item={type:'technical-error',scene:sceneName(),time:when(),message:safe(message,400),stack:safe(stack,700)};errors.push(item);reports.push(item);remember();$('report-count').textContent=reports.length+' entrées dans ce rapport'}
window.addEventListener('error',e=>fault(e.message||'Erreur JavaScript',e.error?.stack));
window.addEventListener('unhandledrejection',e=>fault(e.reason?.message||'Promesse rejetée',e.reason?.stack));
function sceneName(){return current<0?'accueil':current<4?'salle-blanche':current<15?'fauteuils-tv':current<18?'dojo':'jardin'}
const lines=[
 {who:'Narrateur',text:'Qu’est-ce qu’une rencontre ? Qu’est-ce que véritablement l’autre ?',camera:'front',stage:'white'},
 {who:'Narrateur',text:'Quelqu’un qui me ressemble ? Quelqu’un qui me résiste ? Ou simplement une présence que je ne connais pas encore ?',camera:'front'},
 {who:'Narrateur',text:'Et si nous commencions par nous regarder, sans chercher tout de suite une réponse ?',camera:'front'},
 {who:'Narrateur',text:'Viens. Asseyons-nous.',camera:'front'},
 {who:'Narrateur',text:'Prends place. Regarde.',camera:'front',seat:true},
 {who:'Narrateur',text:'Voici le monde tel que tu l’as connu, {pseudo}.',camera:'turn',tv:true},
 {who:'Narrateur',text:'Un monde de masques. Un monde d’illusions.',camera:'rear'},
 {who:'Narrateur',text:'Un monde où tu as joué un personnage.',camera:'rear'},
 {who:'Narrateur',text:'Un monde où, chaque matin, tu te déguises pour aller travailler.',camera:'rear'},
 {who:'Narrateur',text:'Où tu ne rencontres bien souvent que les masques des autres.',camera:'rear'},
 {who:'Narrateur',text:'Mais il existe un autre monde.',camera:'back'},
 {who:'Narrateur',text:'Ici, tu peux prendre le risque d’être toi-même.',camera:'front'},
 {who:'Narrateur',text:'Tu peux aussi te déguiser. Personne ne te jugera.',camera:'front'},
 {who:'Narrateur',text:'Ce monde n’est pas achevé. Tu vas contribuer à le construire.',camera:'front'},
 {who:'Narrateur',text:'Suis-moi.',camera:'front'},
 {who:'Narrateur',text:'Avant d’aller plus loin, je dois t’expliquer comment ce monde fonctionne.',stage:'dojo'},
 {who:'Narrateur',text:'Tu vas apprendre à avancer, à déplacer la caméra, à modifier ton personnage et à l’habiller.',stage:'dojo'},
 {who:'Narrateur',text:'Tu peux revenir ici à tout moment. Ce monde est aussi le tien.',stage:'dojo'},
 {who:'Narrateur',text:'Regarde. Le jardin, les papillons… et la maison. À toi de découvrir ce qui s’y trouve.',stage:'garden'}
];
function bubble(line){$('bubbles').replaceChildren();const box=document.createElement('div');box.className='bubble';const label=document.createElement('div');label.className='speaker';label.textContent=line.who;const p=document.createElement('p');p.textContent=line.text.replaceAll('{pseudo}',pseudo);box.append(label,p);$('bubbles').append(box)}
let liveFrame=null;
function ensureLiveRoom(host){
 if(!authorized)return;
 if(!liveFrame){
  liveFrame=document.createElement('iframe');
  liveFrame.title='Salon 3D existant — version auteur';
  liveFrame.loading='eager';
  liveFrame.allow='fullscreen';
  liveFrame.src='/membres/v27/salon.html?v=gestes50&resident=marianne';
  liveFrame.addEventListener('error',()=>fault('Chargement du salon 3D interrompu'));
 }
 if(liveFrame.parentNode!==host)host.append(liveFrame);
}
function scene(i){
 current=Math.min(lines.length-1,Math.max(0,i));const line=lines[current];
 const dojo=current>=15&&current<18,garden=current>=18;
 $('stage').style.display=dojo||garden?'none':'block';
 $('dojo').classList.toggle('active',dojo);$('garden').classList.toggle('active',garden);
 if(dojo)ensureLiveRoom($('live3d-host'));else if(garden)ensureLiveRoom($('garden-live-host'));
 $('scene-caption').textContent=sceneName()==='salle-blanche'?'Salle blanche · la rencontre':sceneName()==='fauteuils-tv'?'Salle blanche · les masques':dojo?'Le dojo':'Le jardin';
 const world=$('world');world.classList.toggle('visible',current>=4);
 world.classList.remove('forward','reverse','detail','front');
 if(line.camera==='turn'||line.camera==='rear')world.classList.add('reverse');
 else if(line.camera==='back')world.classList.add('detail');
 else world.classList.add('forward');
 $('tv').querySelector('.screen').textContent=current<6?'':current<11?'LE MONDE DES MASQUES':'UN AUTRE MONDE';
 window.__intro3d?.show(current);
 if(dojo||garden){$('bubbles').replaceChildren();$('dojo-copy').textContent=line.text.replaceAll('{pseudo}',pseudo)}
 else bubble(line);
 $('prev').disabled=current<=0;$('next').textContent=current===lines.length-1?'Recommencer':'Continuer';
 $('step-status').textContent=(current+1)+' / '+lines.length+' · '+(dojo?'Dojo':garden?'Jardin':line.camera==='turn'?'Rotation de caméra':line.camera==='rear'?'Vue télévision':'Vue personnages');
 if(playing){clearTimeout(autoplay);autoplay=setTimeout(()=>scene(current===lines.length-1?0:current+1),current===5?5800:4900)}
}
function next(){if(current===lines.length-1){scene(0);return}scene(current+1)}
function stopAuto(){playing=false;clearTimeout(autoplay);$('play').textContent='Lecture automatique'}
$('begin').onclick=()=>{if(!authorized)return;pseudo=safe($('pseudo').value.trim()||'Invité',40);$('intro-screen').hidden=true;$('intro-screen').style.display='none';scene(0)};
$('next').onclick=next;$('prev').onclick=()=>scene(Math.max(0,current-1));
$('skip').onclick=()=>{stopAuto();scene(15)};
$('play').onclick=()=>{playing=!playing;$('play').textContent=playing?'Arrêter la lecture':'Lecture automatique';if(playing){autoplay=setTimeout(next,4300)}else clearTimeout(autoplay)};
$('restart').onclick=()=>{stopAuto();scene(0)};
$('learn-move').onclick=()=>{$('dojo-feedback').textContent='Le joystick gauche sert aux déplacements. Ouvre le salon actuel pour le tester sur ton avatar 3D.'};
$('learn-camera').onclick=()=>{$('dojo-feedback').textContent='Glisse sur l’écran pour orienter la caméra, puis utilise le zoom pour examiner les détails.'};
$('learn-custom').onclick=()=>{$('dojo-feedback').textContent='Ouvre le véritable atelier d’avatar du site pour modifier ton personnage. Cette première migration ne remplace pas le générateur complet.'};
$('bug-open').onclick=()=>{stopAuto();$('report-scene').value=sceneName();$('report-count').textContent=reports.length+' entrées enregistrées';$('report').classList.add('open')};
$('report-close').onclick=()=>{$('report').classList.remove('open')};
$('report').addEventListener('click',e=>{if(e.target===$('report'))$('report').classList.remove('open')});
$('report-add').onclick=()=>{const note=$('report-note').value.trim();if(!note){$('report-note').focus();return}
 reports.push({type:$('report-type').value,scene:sceneName(),time:when(),note:safe(note,3000),step:current+1});remember();$('report-note').value='';$('report-count').textContent=reports.length+' entrées dans ce rapport'};
$('report-download').onclick=()=>{
 const snapshot={schema:'maison-rencontres-report-v1',created_at:when(),app:'Prologue privé v1',url_path:location.pathname,viewport:{width:innerWidth,height:innerHeight,pixel_ratio:devicePixelRatio||1},user_agent:safe(navigator.userAgent,250),scene:sceneName(),step:current+1,reports:reports.slice(-100)};
 const blob=new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='rapport-maison-rencontres-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)
};
async function authorize(){
 try{
  const res=await fetch('/api/membres/me?auteur=1',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!res.ok)throw Error('Session auteur indisponible');
  const me=await res.json();if(!me.author)throw Error('Auteur requis');
  authorized=true;$('locked').hidden=true;
  $('pseudo').value=safe(me.pseudo||'',40);pseudo=safe(me.pseudo||'Invité',40);
 }catch(e){$('locked').hidden=false;$('intro-screen').hidden=true;$('intro-screen').style.display='none';$('toolbar').hidden=true;const msg=$('locked').querySelector('p');msg.textContent='Cet atelier nécessite une session administrateur active. Ouvre-le depuis ton espace auteur.'}
}
authorize();
