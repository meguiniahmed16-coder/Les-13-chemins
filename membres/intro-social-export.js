// Records the production WebGL scene, its real HUD and the original audio mix.
// No private model, microphone, or API key is sent anywhere.
export const SOCIAL_DURATION=80000;
const W=720,H=1280;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function socialCardAt(ms){
 if(ms>=77500)return {kind:'join',title:'Devenez',main:'Compagnon de route',site:'tectonique-des-ames.com'};
 if(ms>=72500)return {kind:'experience',title:'Vivez le récit',main:'de l’intérieur',copy:'Rencontrez tous les personnages et les lieux du récit. Vivez une expérience immersive.'};
 return null;
}
export function preferredVideoType(MediaRecorderClass=globalThis.MediaRecorder){
 return ['video/mp4;codecs=avc1.42001E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorderClass?.isTypeSupported?.(t))||'';
}
function wrap(ctx,value,x,y,maxWidth,lineHeight){
 let line='';for(const word of String(value).split(/\s+/)){
  const next=line?line+' '+word:word;
  if(line&&ctx.measureText(next).width>maxWidth){ctx.fillText(line,x,y);y+=lineHeight;line=word;}else line=next;
 }
 if(line)ctx.fillText(line,x,y);return y+lineHeight;
}
function rect(ctx,r,radius=0){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(r.x,r.y,r.w,r.h,Math.min(radius,r.w/2,r.h/2));else ctx.rect(r.x,r.y,r.w,r.h);}
function renderCard(ctx,card,ms){
 const final=card.kind==='join',start=final?77500:72500,alpha=clamp((ms-start)/300,0,1);
 ctx.save();ctx.globalAlpha=alpha;
 if(final){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#14251fe8');g.addColorStop(1,'#172b22fa');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
 else{const g=ctx.createLinearGradient(0,700,0,H);g.addColorStop(0,'#12261e00');g.addColorStop(.43,'#12261edb');g.addColorStop(1,'#12261ef5');ctx.fillStyle=g;ctx.fillRect(0,700,W,H-700);}
 const x=52,y=final?170:830;
 ctx.textAlign='left';ctx.textBaseline='alphabetic';
 ctx.fillStyle='#dfd5b7';ctx.font='500 20px system-ui';ctx.fillText('L E S   T R E I Z E   C H E M I N S',x,y);
 ctx.fillStyle='#b7925c';ctx.fillRect(x,y+20,final?610:100,2);
 ctx.fillStyle='#fff8e8';ctx.font='italic 48px Georgia,serif';ctx.fillText(card.title,x,y+92);
 ctx.font='700 62px system-ui';let yy=wrap(ctx,card.main,x,y+164,616,65);
 if(final){
  ctx.fillStyle='#b7925c';ctx.fillRect(x,yy+18,82,3);ctx.fillStyle='#f4ead4';ctx.font='24px system-ui';ctx.fillText('Découvrez le site',x,yy+74);
  ctx.font='700 36px system-ui';ctx.fillText(card.site,x,yy+125);
  ctx.font='27px system-ui';ctx.fillStyle='#e1dcc8';wrap(ctx,'Vivez les lieux et les rencontres du récit d’Ahmed Marie.',x,yy+190,616,39);
  ctx.font='19px system-ui';ctx.fillStyle='#c2c4ae';ctx.fillText('Musique : Effervescence — Scott Buckley · CC BY 4.0',x,H-76);
 }else{ctx.font='26px system-ui';ctx.fillStyle='#f4ead4';wrap(ctx,card.copy,x,yy+10,616,33);}
 ctx.restore();
}
function paintDom(ctx,element,stageBox,sx,sy,styleScale){
 if(!element||element.hidden||!element.isConnected)return;
 const win=element.ownerDocument.defaultView;
 const visible=e=>{const s=win.getComputedStyle(e);return !e.hidden&&s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0;};
 const box=e=>{const r=e.getBoundingClientRect();return {x:(r.left-stageBox.left)*sx,y:(r.top-stageBox.top)*sy,w:r.width*sx,h:r.height*sy};};
 function svgDraw(e,s,r){
  const vb=e.viewBox?.baseVal;if(!vb?.width||!vb.height)return;
  ctx.save();ctx.translate(r.x,r.y);ctx.scale(r.w/vb.width,r.h/vb.height);ctx.translate(-vb.x,-vb.y);
  for(const p of e.querySelectorAll('path,circle,rect,line,polyline,polygon')){
   const cs=win.getComputedStyle(p);let path=new Path2D();
   if(p.localName==='path')path=new Path2D(p.getAttribute('d')||'');
   else if(p.localName==='circle')path.arc(+p.getAttribute('cx'),+p.getAttribute('cy'),+p.getAttribute('r'),0,2*Math.PI);
   else if(p.localName==='rect')path.rect(+p.getAttribute('x'),+p.getAttribute('y'),+p.getAttribute('width'),+p.getAttribute('height'));
   else if(p.localName==='line'){path.moveTo(+p.getAttribute('x1'),+p.getAttribute('y1'));path.lineTo(+p.getAttribute('x2'),+p.getAttribute('y2'));}
   else{const pts=(p.getAttribute('points')||'').trim().split(/[\s,]+/).map(Number);if(pts.length>=2){path.moveTo(pts[0],pts[1]);for(let i=2;i+1<pts.length;i+=2)path.lineTo(pts[i],pts[i+1]);if(p.localName==='polygon')path.closePath();}}
   if(cs.fill!=='none'){ctx.fillStyle=cs.fill;ctx.fill(path);}if(cs.stroke!=='none'){ctx.strokeStyle=cs.stroke;ctx.lineWidth=parseFloat(cs.strokeWidth)||1.6;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(path);}
  }ctx.restore();
 }
 function draw(e){
  if(!visible(e))return;const s=win.getComputedStyle(e),r=box(e);if(r.w<.5||r.h<.5)return;
  ctx.save();ctx.globalAlpha*=Number(s.opacity)||1;
  if(e.localName==='svg'){svgDraw(e,s,r);ctx.restore();return;}
  const radius=(parseFloat(s.borderTopLeftRadius)||0)*styleScale;
  if(s.backgroundColor!=='rgba(0, 0, 0, 0)'&&s.backgroundColor!=='transparent'){ctx.fillStyle=s.backgroundColor;rect(ctx,r,radius);ctx.fill();}
  const border=parseFloat(s.borderTopWidth)||0;if(border&&s.borderTopStyle!=='none'){ctx.strokeStyle=s.borderTopColor;ctx.lineWidth=border*styleScale;rect(ctx,r,radius);ctx.stroke();}
  if(s.overflow==='hidden'||s.overflowY==='auto'||s.overflowY==='hidden'){rect(ctx,r,radius);ctx.clip();}
  for(const n of e.childNodes){
   if(n.nodeType===1){draw(n);continue;}if(n.nodeType!==3||!n.textContent.trim())continue;
   const text=n.textContent;ctx.fillStyle=s.color;ctx.font=(s.fontStyle==='italic'?'italic ':'')+s.fontWeight+' '+(parseFloat(s.fontSize)*styleScale)+'px '+s.fontFamily;ctx.textBaseline='middle';ctx.textAlign='left';
   const range=e.ownerDocument.createRange();for(const m of text.matchAll(/\S+/g)){
    range.setStart(n,m.index);range.setEnd(n,m.index+m[0].length);const b=range.getBoundingClientRect();if(!b.width||!b.height)continue;
    const val=s.textTransform==='uppercase'?m[0].toUpperCase():m[0];ctx.fillText(val,(b.left-stageBox.left)*sx,(b.top+b.height/2-stageBox.top)*sy);
   }
  }ctx.restore();
 }
 draw(element);
}
export function createSocialExport({stage,frame,mainCanvas,onStatus=()=>{},onFile=()=>{}}){
 let canvas=null,ctx=null,mix=null,destination=null,recorder=null,chunks=[],running=false,done=false,requestedType='',lastMs=0,activeMs=0,lastReal=0,aborted=false;
 const taps=new WeakMap(),linked=new WeakSet(),streams=[];
 function supported(){return !!(globalThis.MediaRecorder&&globalThis.AudioContext&&HTMLCanvasElement.prototype.captureStream&&preferredVideoType());}
 function unlock(){if(!supported())throw Error('L’export vidéo n’est pas disponible dans ce navigateur. Utilise Chrome récent.');if(!mix){mix=new AudioContext();destination=mix.createMediaStreamDestination();}return mix.resume();}
 function tap(context,node){
  if(!mix||!node||linked.has(node))return;
  let output=taps.get(context);if(!output){output=context.createMediaStreamDestination();taps.set(context,output);const src=mix.createMediaStreamSource(output.stream);src.connect(destination);streams.push(src);}
  node.connect(output);linked.add(node);
 }
 function paint(ms,garden){
  const base=stage.getBoundingClientRect(),sx=W/Math.max(1,base.width),sy=H/Math.max(1,base.height);
  ctx.fillStyle='#142b27';ctx.fillRect(0,0,W,H);
  const source=garden?frame.contentDocument?.querySelector('#scene'):mainCanvas();
  if(source?.width&&source?.height)ctx.drawImage(source,0,0,W,H);
  const film=stage.querySelector('#film-montage'),video=stage.querySelector('#film-video');
  if(!garden&&film&&!film.hidden&&video?.readyState>=2){ctx.fillStyle='#142b27';ctx.fillRect(0,0,W,H);const s=Math.min(W/video.videoWidth,H/video.videoHeight),w=video.videoWidth*s,h=video.videoHeight*s;ctx.drawImage(video,(W-w)/2,(H-h)/2,w,h);}
  for(const selector of ['#bubble','#dojo-demo','#dojo-help','.invitation-demo','.arrival-angel'])paintDom(ctx,stage.querySelector(selector),base,sx,sy,W/Math.max(1,stage.clientWidth));
  const fade=stage.querySelector('#cinema-fade');if(!garden&&fade){const a=Number(getComputedStyle(fade).opacity)||0;if(a>0){ctx.fillStyle='rgba(255,255,255,'+a+')';ctx.fillRect(0,0,W,H);}}
  const card=socialCardAt(ms);if(card)renderCard(ctx,card,ms);
 }
 function start(){
  if(recorder||done)return;canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;ctx=canvas.getContext('2d',{alpha:false});requestedType=preferredVideoType();
  if(!ctx||!destination||!requestedType)throw Error('Impossible de préparer le fichier vidéo.');
  const stream=canvas.captureStream(24);for(const track of destination.stream.getAudioTracks())stream.addTrack(track);
  recorder=new MediaRecorder(stream,{mimeType:requestedType,videoBitsPerSecond:4000000,audioBitsPerSecond:128000});
  recorder.ondataavailable=e=>{if(e.data?.size&&!aborted)chunks.push(e.data);};
  recorder.onerror=e=>{aborted=true;onStatus('Enregistrement interrompu : '+(e.error?.message||'erreur du navigateur'));};
  recorder.onstop=()=>{for(const t of stream.getTracks())t.stop();mix?.close().catch(()=>{});if(aborted)return;const mime=recorder.mimeType||requestedType;const blob=new Blob(chunks,{type:mime});if(blob.size<1000){onStatus('Aucune vidéo complète n’a été enregistrée.');return;}onFile(blob,mime.includes('mp4')?'mp4':'webm',activeMs);};
  paint(0,false);recorder.start(500);running=true;lastReal=performance.now();onStatus('Enregistrement de la cinématique · 0:00 / 1:20');
 }
 function tick(ms,{garden=false,playing=true}={}){
  if(!recorder||done)return;
  const now=performance.now();if(!playing){if(running){activeMs+=now-lastReal;recorder.pause();running=false;}return;}
  if(!running){recorder.resume();lastReal=now;running=true;}
  lastMs=clamp(ms,0,SOCIAL_DURATION);paint(lastMs,garden);const seconds=Math.floor(lastMs/1000);onStatus('Enregistrement · '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+' / 1:20');
 }
 function finish(){if(!recorder||done)return;done=true;if(running)activeMs+=performance.now()-lastReal;try{paint(SOCIAL_DURATION,true);}catch{}if(recorder.state!=='inactive')recorder.stop();}
 function cancel(message='Export interrompu. Les voix préparées sont conservées sur cet appareil.'){aborted=true;done=true;if(recorder&&recorder.state!=='inactive')recorder.stop();else mix?.close().catch(()=>{});onStatus(message);}
 return {supported,unlock,tap,start,tick,finish,cancel,get started(){return !!recorder;},get done(){return done;}};
}

// An exact voiceId/text pair is reused on later exports, not regenerated.
export function createSocialVoiceCache(indexed=globalThis.indexedDB){
 let dbPromise;
 function db(){if(!indexed)return Promise.resolve(null);return dbPromise??=new Promise(resolve=>{const req=indexed.open('croisee-social-voice-v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('clips');req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null);});}
 async function read(key){try{const d=await db();if(!d)return null;return await new Promise(resolve=>{const req=d.transaction('clips','readonly').objectStore('clips').get(key);req.onsuccess=()=>{const blob=req.result;if(blob instanceof Blob&&blob.size){blob.voiceProvider='cartesia';resolve(blob);}else resolve(null);};req.onerror=()=>resolve(null);});}catch{return null;}}
 async function write(key,blob){try{const d=await db();if(!d||blob.voiceProvider!=='cartesia')return;await new Promise(resolve=>{const tx=d.transaction('clips','readwrite');tx.objectStore('clips').put(blob,key);tx.oncomplete=tx.onerror=tx.onabort=()=>resolve();});}catch{}}
 return {read,write};
}
