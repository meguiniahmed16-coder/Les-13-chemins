import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('./jeu-rencontre.html', import.meta.url), 'utf8');
const controller = readFileSync(new URL('./rendezvous-plateau.js', import.meta.url), 'utf8');
const build = readFileSync(new URL('./build-public.mjs', import.meta.url), 'utf8');

test('The thirteen real scripted video scenes retain their order without fabricated frames', () => {
  const shotLines = [...html.matchAll(/^\s*\['(C\d{2}|B\d{2}(?:bis)?)','[^']+','[^']+\.mp4'\],?$/gm)];
  const keys = shotLines.map(x => x[1]);
  assert.deepEqual(keys, [...['C01',...Array.from({length:6},(_,i)=>'C'+String(i+3).padStart(2,'0'))],
                         ...['B01','B02','B03','B04','B05','B05bis','B06']]);
  for (const path of ['01-cuisine/04-il-lui-caresse-la-joue.mp4',
                      '01-cuisine/05-elle-lui-caresse-la-joue.mp4',
                      '01-cuisine/06-il-lui-caresse-les-cheveux.mp4',
                      '01-cuisine/07-elle-lui-caresse-les-cheveux.mp4',
                      '02-chambre/06-oui.mp4']) {
    assert.ok(html.includes(path),path);
  }
});

test('Cheek precedes hair, hair precedes kiss, drink precedes complicity and intimacy', () => {
  const bundles=[...html.matchAll(/clips:\[([^\]]+)\]/g)].map(x=>[...x[1].matchAll(/'(C\d{2}|B\d{2}(?:bis)?)'/g)].map(y=>y[1]));
  assert.deepEqual(bundles,[
    ['C01','C03'],['C04','C05'],['C06','C07'],['C08'],
    ['B01','B02'],['B03','B04'],['B06','B05','B05bis']
  ]);
  assert.ok(html.includes('Pas maintenant'));
  assert.ok(html.includes('state.watched'));
  assert.ok(html.includes('state.step=Math.min'));
  assert.ok(html.includes("const KEY=standaloneReading?'tda-rencontre-lecture-directe-v1':'tda-rencontre-storyboard-v1'"),'Direct preview and main game have separate saves');
  assert.equal((html.match(/^ (?:[CBA]\d{2}|B05bis):HIGGS_CDN\+'hf_[^']+\.mp4'/gm)||[]).length,22,'22 vidéo-références Higgsfield sont attachées');
  assert.ok(html.includes('C01:HIGGS_CDN')&&!html.includes('C02:HIGGS_CDN')&&!html.includes('B07:HIGGS_CDN'),'No solo clip in C02');
});

test('Prototype is wired to the third chapter without altering other games', () => {
  assert.match(controller,/activePart===3\?openRencontreDialog\(\)/);
  assert.match(controller,/rencontreFrame\.src='jeu-rencontre.html\?embedded=1'/);
  assert.match(controller,/openCyranoDialog/);
  assert.match(controller,/manifestationDialog/);
  assert.ok(build.includes("'jeu-rencontre.html'"),'public build includes file');
  assert.ok(html.includes('https://d2ol7oe51mr4n9.cloudfront.net/'),'references are anchored');
  assert.ok(html.includes('.embedded .site-nav{display:none!important}'),'no nested navigation');
});

test('Inline scripts are valid JavaScript', () => {
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.ok(scripts.length>=2);
  scripts.forEach((m,i)=>assert.doesNotThrow(()=>new Script(m[1],{filename:'jeu-rencontre-'+i+'.js'})));
});


test('Every Pas maintenant plays a unique optional sequence without advancing the story', () => {
  const alternatives=[...html.matchAll(/^\s*\["A(0[1-8])","[^"]+","[^"]+\.mp4","[^"]+"\],?$/gm)];
  assert.equal(alternatives.length,8,'There are eight alternative scenes');
  const stepRefs=[...html.matchAll(/alt:'(A0[1-8])'/g)].map(x=>x[1]);
  assert.deepEqual(stepRefs,Array.from({length:7},(_,i)=>'A'+String(i+1).padStart(2,'0')));
  assert.ok(html.includes("beginScene([step.alt],'pause')"));
  assert.ok(html.includes("if(finished==='sequence')state.step=Math.min"), 'Pauses do not advance the chapter');
  assert.ok(html.includes("finished==='sequence'||finished==='pause'"), 'All seen clips are saved');
  assert.ok(!html.includes('id="pauseClips"'),'No catalog of detailed scenes is shown under the image');
});

test('Felicity starts only when the boy lifts his head, jazz starts in the mansard room', () => {
  assert.ok(html.includes("id==='A01')return null"), 'Optional silent alternative remains without fake C01');
  assert.ok(html.includes("if(id.startsWith('B')"),'B scenes map to room soundtrack');
  assert.ok(html.includes("'Felicity — Scott Buckley'"));
  assert.ok(html.includes("'Night on the Docks - Sax — Kevin MacLeod'"));
  assert.ok(html.includes("soundtrackForCurrentShot(shot[0])"),'Audio follows the active shot');
  assert.ok(html.includes("id=\"toggleMusic\""),'Player can mute the music');
  assert.match(html,/Felicity[^<]*<\/a>, sous licence/, 'Attribution presented');
  assert.match(html,/Night on the Docks - Sax[^<]*<\/a>, sous licence/, 'Jazz attribution presented');
  assert.ok(html.includes("const MEDIA={"),'Video registry is present');
  assert.ok(html.includes('Felicity commence')&&html.includes("'C01'"),'The music belongs to the correct C01');
});

test('Cinématiques Higgsfield réelles, relecture enchaînée et vraies scènes alternatives', () => {
 const refs=[...html.matchAll(/^ (C01|C0[3-8]|B0[1-6]|B05bis|A0[1-8]):HIGGS_CDN\+'(hf_[^']+\.mp4)'/gm)];
 assert.equal(refs.length,22);
 assert.equal(new Set(refs.map(m=>m[1])).size,22);
 assert.equal(new Set(refs.map(m=>m[2])).size,22,'Les 22 vidéos sont distinctes');
 assert.ok(html.includes('player.onended=()=>'), 'The player must complete each clip');
 assert.ok(html.includes('player.muted=SILENT_DIALOGUE_SHOTS.has(shot[0])'), 'Les plans concernés sont silencieux, sans synthèse vocale ni sous-titres');
 assert.ok(html.includes('player.controls=false'), 'No browser player controls may appear');
 const playerTag=html.match(/<video id="player"[^>]*>/)?.[0];
 assert.ok(playerTag&&!/\s(?:muted|controls)(?:\s|=|>)/.test(playerTag), 'The cinematic player must not force mute or native controls');
 assert.ok(html.includes('id="resumeWithSound"')&&html.includes("$('resumeWithSound').onclick"), 'Mobile autoplay block must show a simple audio-resume action');
 assert.ok(html.includes("player.classList.add('video-fading')")&&html.includes("requestAnimationFrame(()=>player.classList.remove('video-fading'))"), 'The clip transition is a soft fade');
 assert.ok(html.includes('nextMovie();},FADE_MS)'), 'Intermediate clips must chain with a soft fade');
 assert.ok(html.includes("if(finished==='sequence')state.step=Math.min"), 'Pauses do not move the story forward');
 assert.ok(!html.includes('La fenêtre sur Paris')&&!html.includes("clips:['B07']"), 'No literary ending');
 assert.ok(html.includes("beginScene(['A08'],'replay')"),'The extra night video is preserved');
 assert.ok(!html.includes("['C01','La tête baissée'"),'Aucune scène fictive ne précède le vrai film C01');
 assert.ok(html.includes("clips:['C01','C03']"),'The film starts at C01');
 assert.ok(html.includes("type:'rencontre:state'"), 'The shared board receives progress');
 assert.ok(controller.includes("e.data.type!=='rencontre:state'"), 'Parent verifies iframe origin and event type');
 assert.ok(controller.includes('state.rdvRencontreFinished=true'), 'The third Chemin III chapter is completed');
 assert.ok(!html.includes('Photo du pèlerin'), 'No unrelated artwork is included');
});

test('Chapitre 6 : bonne feuille complète fidèle à la V17 et lecture avant le jeu', () => {
 const match=controller.match(/const rencontreExtract=(\[[^\n]*\]);/);
 assert.ok(match,'The original excerpt is present in the reader');
 const paragraphs=JSON.parse(match[1]);
 assert.ok(paragraphs.length>=18,'The excerpt includes the grief and the whole birthday scene');
 assert.ok(paragraphs[0].startsWith('Nous avons une amie en commun. Elle me raconte la cérémonie.'));
 assert.equal(paragraphs.at(-1),'Elle appelle un taxi et décide de me ramener chez elle, dans sa chambre de bonne, au 30 avenue Rapp.');
 const content=paragraphs.join('\n');
 for(const line of ['Lionel était par terre.','Il avait crié.','Dans les soirées, il y a toujours une deuxième soirée dans la cuisine.','— Tu veux bien t’occuper de moi ?','— Oui.'])assert.ok(content.includes(line),line);
 assert.ok(controller.includes('putExcerpt(rencontreExtract);excerpt.hidden=false;'));
 assert.ok(controller.includes('activePart===3?openRencontreDialog:activePart===2?openCyranoDialog:openDialog'));
 assert.ok(controller.includes('clearTimeout(autoTimer);autoTimer=0;autoLaunched=true;'));
});
test('Le bouton Rejouer la scène est sur la vidéo à la fin de chaque séquence', () => {
 assert.match(html,/id="replayScene" class="replay-overlay" hidden/);
 assert.match(html,/\$\('replayScene'\)\.onclick=\(\)=>/);
 assert.ok(html.includes('if(movieIndex+1===pending.length)'));
 assert.ok(html.includes('replay.hidden=false'));
 assert.ok(html.includes('stopAdvanceTimer();movieIndex=0;playCurrent();'));
 assert.ok(html.includes("'Continuer l’histoire →'"));
 assert.ok(!html.includes('clips:[\'B07\']'),'No missing literary finale');
});

test('Lecture directe du chapitre 6 sans progression obligatoire des jeux précédents', () => {
 const match=html.match(/const standaloneExtract=(\[[^\n]+\]);/);
 const fromBoard=controller.match(/const rencontreExtract=(\[[^\n]+\]);/);
 assert.ok(match&&fromBoard,'Both reading entry points must contain chapter text');
 const text=JSON.parse(match[1]), boardText=JSON.parse(fromBoard[1]);
 assert.equal(text.length,26);
 assert.deepEqual(text,boardText,'Direct reading must use exactly the same V17 excerpt as the Chemin III reader');
 assert.ok(text.at(0).startsWith('Nous avons une amie en commun.'));
 assert.ok(text.at(-1).startsWith('Elle appelle un taxi'));
 assert.ok(html.includes("new URLSearchParams(location.search).get('lecture')==='1'"),'Link activates standalone reading');
 assert.ok(html.includes("const KEY=standaloneReading?'tda-rencontre-lecture-directe-v1'"),'Standalone visit must not override main game saves');
 assert.ok(html.includes("if(standaloneReading)state={step:0,watched:[],ended:false};"),'Link starts at scene one');
 assert.ok(html.includes("if(!standaloneReading)return;"),'Embedded route must not show the story twice');
 assert.ok(html.includes("reader.showModal()"),'Reading begins before game');
 assert.ok(html.includes("if(startFilm)beginScene(STEPS[0].clips,'sequence')"),'Continue directly into first cinematics');
 assert.ok(html.includes('id="standaloneStart"'),'Start video after reading');
 assert.ok(html.includes('#standaloneReader .rendezvous-excerpt'),'Keep typography and fullscreen reading style');
});

test('Les voix artificielles et sous-titres ont été retirés sans modifier les films',()=>{
 assert.ok(html.includes("C01:HIGGS_CDN+'hf_20261110_190953_98996418-1af1-4e38-a4cd-ce370190446f.mp4'"),'C01 displays an existing couple shot');
 assert.ok(html.includes('cfc2ea53-67f2-43f7-b749-8ccf73365b90.jpg'),'Le décor de référence de C01 est celui de sa génération Higgsfield');
 assert.ok(html.includes('still.src=state.step===0?ART.depart:ART.caresse'),'L’image de départ est visible avant de lancer la séquence');
 assert.ok(html.includes("A01:HIGGS_CDN+'hf_20261110_194224_1b39b3b1-d639-4c75-8c72-92070de8e2a9.mp4'"),'A01 garde sa place en alternative');
 assert.ok(html.includes("const SILENT_DIALOGUE_SHOTS=new Set(['C01','C03','C07','C08'])"));
 assert.ok(html.includes('player.muted=SILENT_DIALOGUE_SHOTS.has(shot[0])'));
 for(const fragment of ['speechSynthesis','SpeechSynthesisUtterance','FRENCH_LINES','frenchDialogue','function speakFrench','function stopFrenchSpeech'])
  assert.ok(!html.includes(fragment),fragment+' must not remain');
 assert.ok(html.includes('id="replayScene"'),'Existing replay stays');
 assert.ok(html.includes('id="toggleMusic"'),'Existing music stays');
});

test('Choix superposés à l’image de départ, sans bloc détaillé sous la scène',()=> {
 const main=html.slice(html.indexOf('<main>'),html.indexOf('</main>')+7);
 assert.ok(main.includes('id="visual" class="visual"'));
 assert.ok(main.includes('id="still"'));
 assert.ok(main.includes('id="stageFrame"'));
 assert.ok(main.includes('id="choices"'));
 assert.ok(main.includes('id="toggleMusic"'));
 assert.ok(main.indexOf('id="visual"')<main.indexOf('class="panel"'));
 assert.ok(html.includes('.visual>.panel{position:absolute'));
 for(const id of ['stepDescription','pauseClips','films','clips','cinematics','soundtrackTitle','feedback'])assert.ok(!main.includes('id="'+id+'"'),id+' must not be visible');
 assert.ok(!main.includes('class="caption"'));
 assert.ok(!main.includes('class="section"'));
 assert.ok(html.includes('stage.src=preferredVideoUrl(shot);stage.load()'));
 assert.ok(html.includes("still.src=state.step===0?ART.depart:ART.caresse"),"The true paid C02 first frame is shown at the opening");
 assert.ok(html.includes("beginScene([step.alt],'pause')"));
 assert.ok(html.includes('id="replayScene"'));
});

test('Le film s’ouvre sur le véritable duo de Higgsfield, pas sur une alternative',()=>{
 assert.ok(html.includes("C01:HIGGS_CDN+'hf_20261110_190953_98996418-1af1-4e38-a4cd-ce370190446f.mp4'"));
 assert.ok(html.includes("A01:HIGGS_CDN+'hf_20261110_194224_1b39b3b1-d639-4c75-8c72-92070de8e2a9.mp4'"));
 assert.ok(html.includes("cuisine:'https://d2ol7oe51mr4n9.cloudfront.net/user_3Lv38AaVCD2ic4AgVfvvFo8mRsK/cfc2ea53-67f2-43f7-b749-8ccf73365b90.jpg'"));
 assert.ok(html.includes("still.src=state.step===0?ART.depart:ART.caresse"));
 assert.ok(html.includes("clips:['C01','C03']"));
 assert.ok(!html.includes('SpeechSynthesisUtterance'));
 assert.ok(!html.includes('frenchDialogue'));
});

test('La vidéo payante erronée du garçon seul ne figure plus dans le jeu',()=>{
 assert.ok(!html.includes('e155bc22-bd01-46f7-86a7-029a60d64a6e'));
 assert.ok(!html.includes('hf_20261110_184312'));
 assert.ok(!html.includes('C02:HIGGS_CDN'));
 assert.ok(html.includes("C01:HIGGS_CDN+'hf_20261110_190953_98996418-1af1-4e38-a4cd-ce370190446f.mp4'"));
 assert.ok(html.includes("clips:['C01','C03']"));
});

test('C01 pointe vers le plan authentique donné par le lien partagé',()=>{
 assert.ok(html.includes("C01:HIGGS_CDN+'hf_20261110_190953_98996418-1af1-4e38-a4cd-ce370190446f.mp4'"));
 assert.ok(html.includes("A01:HIGGS_CDN+'hf_20261110_194224_1b39b3b1-d639-4c75-8c72-92070de8e2a9.mp4'"));
 assert.ok(!html.includes('e155bc22-bd01-46f7-86a7-029a60d64a6e'),'La vidéo erronée du garçon seul est exclue');
 assert.ok(!html.includes('72b06959-a1e1-4fb4-bde5-7939dc8f1b42'),'L’ancienne image de départ a été retirée');
 assert.ok(html.includes("clips:['C01','C03']"),'Le premier plan du récit est C01');
});

test('Image d’attente du premier plan issue exactement du même C01 validé',()=>{
 assert.ok(html.includes("depart:'https://cdn.higgsfield.ai/user_3Lv38AaVCD2ic4AgVfvvFo8mRsK/hf_20261110_190953_98996418-1af1-4e38-a4cd-ce370190446f_thumbnail.webp'"));
 assert.ok(html.includes("still.src=state.step===0?ART.depart:ART.caresse"));
});

test('Le clip partagé LU2FpA6qdjw est explicitement accessible lors de l’intimité',()=>{
 assert.ok(html.includes("B05:HIGGS_CDN+'hf_20261110_194019_7622d64a-e3b0-469f-aae2-69f607f43092.mp4'"));
 assert.ok(html.includes("clips:['B06','B05','B05bis']"),'B05 reste au centre de la scène principale');
 assert.ok(html.includes("state.step===6")&&html.includes("beginScene(['B05','B05bis'],'replay')"),'Lecture directe du clip B05 sur l’écran des choix');
 assert.ok(!html.includes("shot[0]==='B04'&&pending[movieIndex+1]==='B05'"),'B05 ne doit jamais être bloqué par un clic sous la vidéo');
 assert.ok(html.includes("nextMovie();},FADE_MS)"),'B04 s’enchaîne automatiquement sur B05 puis B06');
});

test('Le lien partagé Higgsfield LU2FpA6qdjw apparaît sans interruption dans la séquence intime',()=>{
 const media=html.match(/^ B05:HIGGS_CDN\+'([^']+\.mp4)'/m);
 assert.ok(media,'Le fichier B05 est branché');
 assert.equal(media[1],'hf_20261110_194019_7622d64a-e3b0-469f-aae2-69f607f43092.mp4');
 const sequence=html.match(/clips:\['B06','B05','B05bis'\]/);
 assert.ok(sequence,'Le oui ouvre les deux prises sous les draps');
 assert.ok(!html.includes("shot[0]==='B04'&&pending[movieIndex+1]==='B05'"),'Pas d’arrêt manuel entre B04 et B05');
 assert.ok(html.includes('advanceTimer=setTimeout(()=>{advanceTimer=null;if(pending&&$(\'cinema\').open)nextMovie();},FADE_MS)'),'La lecture continue automatiquement');
 assert.ok(html.includes("beginScene(['B05','B05bis'],'replay')"),'B05 peut être rejouée directement');
});

test('L’intimité commence au oui et inclut les deux vidéos originales Higgsfield',()=>{
 assert.ok(html.includes("clips:['B03','B04']"),'Le canapé est préparé avant l’intimité');
 assert.ok(html.includes("clips:['B06','B05','B05bis']"),'Le oui ouvre les deux scènes sous les draps');
 assert.ok(html.includes("B05:HIGGS_CDN+'hf_20261110_194019_7622d64a-e3b0-469f-aae2-69f607f43092.mp4'"));
 assert.ok(html.includes("B05bis:HIGGS_CDN+'hf_20261110_192813_d55de648-8b2e-4f45-bed2-3a5c5fcb1779.mp4'"));
 assert.ok(html.includes("beginScene(['B05','B05bis'],'replay')"));
 assert.ok(html.includes("const shot=atEnd?'B05bis':step.clips[0]"));
 assert.ok(!html.includes('B07:HIGGS_CDN'),'La fin abandonnée n’est pas réintroduite');
});

test('R2 est prioritaire, Higgsfield demeure le recours automatique',()=>{
 assert.ok(html.includes("const R2_VIDEO_BASE='https://treize-chemins-videos.meguiniahmed16.workers.dev/rencontre/'"));
 assert.ok(html.includes('const R2_MEDIA=Object.fromEntries('));
 assert.ok(html.includes('const R2_FAILED=new Set()'));
 assert.ok(html.includes('preferredVideoUrl(shot[0])'));
 assert.ok(html.includes('stage.src=MEDIA[shot];stage.load()'),'Repli Higgsfield du décor vidéo');
 assert.ok(html.includes('R2_FAILED.add(shot[0]);player.src=MEDIA[shot[0]];player.load()'));
 assert.ok(html.includes("clips:['B06','B05','B05bis']"),'Le oui ouvre encore les deux scènes');
});
